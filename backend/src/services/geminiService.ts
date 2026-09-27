import { v4 as uuidv4 } from 'uuid';
import { env } from '../config/env';
import { Logger } from '../utils/logging';
import { AnalysisResult, QAPair, ComparisonResult } from '../../../shared/types';

// Structural type definitions for @google/genai to avoid TS1479
// (Node16 CommonJS modules cannot directly import types from ESM-only packages)
interface GenAIModelClient {
  generateContent(params: {
    model: string;
    contents: Array<{ role: string; parts: Array<{ text: string }> }>;
    config?: {
      temperature?: number;
      topP?: number;
      topK?: number;
      maxOutputTokens?: number;
      responseMimeType?: string;
    };
  }): Promise<{ text?: string }>;
}

interface GenAIClient {
  models: GenAIModelClient;
}

// Lazy initialize Gemini client to support ESM dynamic import
let _aiClient: GenAIClient | null = null;
async function getAI(): Promise<GenAIClient> {
  if (!_aiClient) {
    const { GoogleGenAI } = await import('@google/genai');
    _aiClient = new GoogleGenAI(
      env.AI_PROVIDER === 'google-gemini-api'
        ? {
            apiKey: env.GEMINI_API_KEY?.trim(),
          }
        : {
            vertexai: true,
            project: env.GCP_PROJECT_ID,
            location: env.VERTEX_AI_LOCATION,
            googleAuthOptions: {
              credentials: {
                client_email: env.FIREBASE_CLIENT_EMAIL,
                private_key: (env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
              },
            },
          }
    );
  }
  return _aiClient;
}

/**
 * Classifies an error as a retriable 429/quota error.
 */
function isQuotaError(error: any): boolean {
  const errMsg: string = error?.message || '';
  const status = error?.status || error?.response?.status;
  return status === 429 || errMsg.includes('429') || errMsg.includes('quota') || errMsg.includes('RESOURCE_EXHAUSTED');
}

/**
 * Classifies an error as a retriable 503/overload error.
 */
function isOverloadError(error: any): boolean {
  const errMsg: string = error?.message || '';
  const status = error?.status || error?.response?.status;
  return status === 503 || errMsg.includes('503') || errMsg.includes('high demand') || errMsg.includes('UNAVAILABLE');
}

/**
 * Shared retry wrapper with exponential backoff for both 429 and 503 errors.
 * Attempts up to maxRetries retries (total calls = maxRetries + 1).
 * Backoff: 2s, 4s, 8s for 503; 5s, 15s, 30s for 429 (quota resets are slower).
 */
async function withGeminiRetry<T>(
  fn: () => Promise<T>,
  context: { label: string; documentId?: string },
  maxRetries = 3
): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (error: any) {
      const isQuota = isQuotaError(error);
      const isOverload = isOverloadError(error);

      if ((isQuota || isOverload) && attempt < maxRetries) {
        attempt++;
        // Quota resets are slower — use a longer backoff for 429
        const baseDelay = isQuota ? 5000 : 2000;
        const delayMs = Math.min(baseDelay * Math.pow(2, attempt - 1), 60000); // cap at 60s
        const errorType = isQuota ? '429 quota' : '503 overload';
        Logger.warn(
          `Gemini ${errorType} error on "${context.label}", retrying (${attempt}/${maxRetries}) in ${delayMs}ms`,
          { documentId: context.documentId }
        );
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        continue;
      }

      throw error;
    }
  }
}

/**
 * Classifies a caught error into a user-friendly message.
 * Returns a string that is safe to propagate to the frontend.
 */
function classifyGeminiError(error: any, model: string): string {
  const errMsg: string = error?.message || 'Unknown error';
  const status = error?.status || error?.response?.status;

  if (env.AI_PROVIDER === 'google-gemini-api' && !env.GEMINI_API_KEY) {
    return 'Missing configuration: GEMINI_API_KEY must be provided locally to use the google-gemini-api provider.';
  }
  if (errMsg.includes('API_KEY_INVALID') || status === 401 || errMsg.includes('API key not valid')) {
    return 'Invalid Gemini API Key configured. Please verify your GEMINI_API_KEY in the local environment.';
  }
  if (errMsg.includes('not found') || status === 404 || errMsg.includes('models/')) {
    return `The configured model (${model}) is unavailable or retired. Please configure a supported model in the local environment.`;
  }
  if (isQuotaError(error)) {
    return 'API quota or rate limit exceeded. The system retried automatically but the quota is still exhausted. Please wait a few minutes and try again, or check your Gemini API quota at https://aistudio.google.com.';
  }
  if (errMsg.includes('BILLING_DISABLED') || status === 403) {
    return 'AI provider requires billing to be enabled on your Google Cloud project, or you must switch to the google-gemini-api provider.';
  }
  if (errMsg.includes('fetch failed') || errMsg.includes('ENOTFOUND') || errMsg.includes('timeout')) {
    return 'Network error connecting to the AI provider. Please check your connection and try again.';
  }
  if (isOverloadError(error)) {
    return 'The AI service is currently experiencing high demand and is unavailable. Please try again later.';
  }
  return 'AI Analysis encountered an unexpected error. Please check the backend logs for details.';
}

export class GeminiService {
  /**
   * Analyzes the extracted text of a legal document using Gemini 2.5 Flash-Lite.
   */
  static async analyzeDocument(
    documentId: string,
    userId: string,
    documentText: string
  ): Promise<AnalysisResult> {
    Logger.info(`Starting Gemini analysis for document`, { documentId, userId });

    // Truncate very long documents to reduce token usage (keep first ~12k chars ~= ~3k tokens)
    const MAX_DOC_CHARS = 48000;
    const truncatedText =
      documentText.length > MAX_DOC_CHARS
        ? documentText.substring(0, MAX_DOC_CHARS) + '\n\n[Document truncated for analysis. Full text exceeded processing limit.]'
        : documentText;

    const prompt = `You are a legal AI assistant. Analyze the legal document below and return ONLY a valid JSON object matching the schema. No markdown, no explanation — raw JSON only.

RULES:
- Use ONLY facts from the document. Do not invent information.
- Use empty arrays [] for missing sections.
- "riskLevel": "low"|"medium"|"high" only.
- All "id" fields: use short UUID strings.

SCHEMA:
{"documentType":string|null,"summary":string,"keyParties":[{"id":string,"name":string,"role":string,"location":{"section":string,"excerpt":string}}],"importantDates":[{"id":string,"date":string,"event":string,"isActionRequired":boolean,"location":{"section":string}}],"keyClauses":[{"id":string,"title":string,"text":string,"summary":string,"riskLevel":string,"location":{"section":string}}],"obligations":[{"id":string,"party":string,"description":string,"location":{"section":string}}],"rights":[{"id":string,"party":string,"description":string,"location":{"section":string}}],"paymentTerms":[{"id":string,"amount":string,"condition":string,"location":{"section":string}}],"terminationTerms":[{"id":string,"condition":string,"noticePeriod":string,"location":{"section":string}}],"risks":[{"id":string,"title":string,"category":string,"description":string,"recommendation":string,"riskLevel":string,"location":{"section":string}}],"missingInformation":[{"id":string,"description":string,"impact":string}],"nextSteps":[string],"disclaimer":string}

DOCUMENT:
"""
${truncatedText}
"""`;

    try {
      const response = await withGeminiRetry(
        () =>
          getAI().then((ai) =>
            ai.models.generateContent({
              model: env.GEMINI_MODEL,
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              config: {
                temperature: 0.1,
                topP: 0.8,
                topK: 40,
                maxOutputTokens: 4096,
                responseMimeType: 'application/json',
              },
            })
          ),
        { label: 'analyzeDocument', documentId }
      );

      let responseText = response.text;
      if (!responseText) {
        throw new Error('No text generated by Gemini');
      }

      // Sanitize potential markdown JSON blocks from Gemini response
      responseText = responseText.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();

      // Parse JSON safely
      let parsedData;
      try {
        parsedData = JSON.parse(responseText);
      } catch (parseError) {
        Logger.error('Failed to parse Gemini JSON output', {
          documentId,
          extra: { responseText: responseText.substring(0, 200) },
        });
        throw new Error('AI produced invalid JSON output');
      }

      // Construct the final AnalysisResult conforming to our shared types
      const analysisResult: AnalysisResult = {
        id: uuidv4(),
        documentId,
        userId,
        documentType: parsedData.documentType || null,
        summary: parsedData.summary || 'No summary provided',
        keyParties: parsedData.keyParties?.map((p: any) => ({ ...p, id: p.id || uuidv4() })) || [],
        importantDates: parsedData.importantDates?.map((d: any) => ({ ...d, id: d.id || uuidv4() })) || [],
        keyClauses: parsedData.keyClauses?.map((c: any) => ({ ...c, id: c.id || uuidv4() })) || [],
        obligations: parsedData.obligations?.map((o: any) => ({ ...o, id: o.id || uuidv4() })) || [],
        rights: parsedData.rights?.map((r: any) => ({ ...r, id: r.id || uuidv4() })) || [],
        paymentTerms: parsedData.paymentTerms?.map((p: any) => ({ ...p, id: p.id || uuidv4() })) || [],
        terminationTerms: parsedData.terminationTerms?.map((t: any) => ({ ...t, id: t.id || uuidv4() })) || [],
        risks: parsedData.risks?.map((r: any) => ({ ...r, id: r.id || uuidv4() })) || [],
        missingInformation: parsedData.missingInformation?.map((m: any) => ({ ...m, id: m.id || uuidv4() })) || [],
        nextSteps: parsedData.nextSteps || [],
        disclaimer:
          parsedData.disclaimer ||
          'This is AI-generated informational analysis and not legal advice.',
        analyzedAt: new Date().toISOString(),
      };

      Logger.info(`Gemini analysis completed successfully`, { documentId, userId });
      return analysisResult;
    } catch (error: any) {
      const errMsg = error?.message || 'Unknown error';
      const status = error?.status || error?.response?.status;

      Logger.error(`Gemini analysis execution failed`, {
        documentId,
        error: errMsg,
        extra: { status },
      });

      throw new Error(classifyGeminiError(error, env.GEMINI_MODEL));
    }
  }

  static async askQuestion(
    documentId: string,
    userId: string,
    documentText: string,
    question: string
  ): Promise<QAPair> {
    Logger.info('Starting Gemini Q&A', { documentId, userId });

    // Truncate document for Q&A to reduce token usage
    const MAX_DOC_CHARS = 32000;
    const truncatedText =
      documentText.length > MAX_DOC_CHARS
        ? documentText.substring(0, MAX_DOC_CHARS) + '\n[Document truncated]'
        : documentText;

    const prompt = `You are a legal AI assistant. Answer the question below using ONLY the document provided. Return ONLY a valid JSON object — no markdown, no explanation.

RULES:
- Ground answers strictly in the document.
- If the document doesn't answer the question, set answer to "The document does not provide enough information to answer this question." and grounded to false.

SCHEMA:
{"answer":string,"sources":[{"section":string,"excerpt":string}],"confidence":"high"|"medium"|"low","grounded":boolean}

QUESTION: "${question}"

DOCUMENT:
"""
${truncatedText}
"""`;

    try {
      const response = await withGeminiRetry(
        () =>
          getAI().then((ai) =>
            ai.models.generateContent({
              model: env.GEMINI_MODEL,
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              config: {
                temperature: 0.1,
                topP: 0.8,
                topK: 40,
                maxOutputTokens: 1024,
                responseMimeType: 'application/json',
              },
            })
          ),
        { label: 'askQuestion', documentId }
      );

      let responseText = response.text;
      if (!responseText) {
        throw new Error('No text generated by Gemini');
      }

      responseText = responseText.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();

      let parsedData;
      try {
        parsedData = JSON.parse(responseText);
      } catch (parseError) {
        Logger.error('Failed to parse Gemini JSON output', {
          documentId,
          extra: { responseText: responseText.substring(0, 200) },
        });
        throw new Error('AI produced invalid JSON output');
      }

      const qaPair: QAPair = {
        id: uuidv4(),
        documentId,
        userId,
        question,
        answer: parsedData.answer || 'No answer provided',
        sources: parsedData.sources || [],
        confidence: parsedData.confidence || 'low',
        grounded: parsedData.grounded || false,
        disclaimer: 'This is AI-generated informational analysis and not legal advice.',
        askedAt: new Date().toISOString(),
      };

      Logger.info('Gemini Q&A completed successfully', { documentId, userId });
      return qaPair;
    } catch (error: any) {
      const errMsg = error?.message || 'Unknown error';
      const status = error?.status || error?.response?.status;

      Logger.error('Gemini Q&A execution failed', { documentId, error: errMsg, extra: { status } });

      throw new Error(classifyGeminiError(error, env.GEMINI_MODEL));
    }
  }


  static async compareDocuments(
    userId: string,
    doc1Id: string,
    doc2Id: string,
    doc1Title: string,
    doc2Title: string,
    doc1Text: string,
    doc2Text: string
  ): Promise<ComparisonResult> {
    Logger.info('Starting Gemini Document Comparison', { userId, extra: { doc1Id, doc2Id } });

    // Truncate both documents to reduce token usage
    const MAX_DOC_CHARS = 20000;
    const truncDoc1 =
      doc1Text.length > MAX_DOC_CHARS
        ? doc1Text.substring(0, MAX_DOC_CHARS) + '\n[Truncated]'
        : doc1Text;
    const truncDoc2 =
      doc2Text.length > MAX_DOC_CHARS
        ? doc2Text.substring(0, MAX_DOC_CHARS) + '\n[Truncated]'
        : doc2Text;

    const prompt = `You are a legal AI assistant. Compare the two legal documents below and return ONLY a valid JSON object matching the schema. No markdown, no explanation — raw JSON only.

RULES:
- Only report differences grounded in the documents.
- Mark clauses only in one document as "added" or "removed".

SCHEMA:
{"summary":string,"changes":[{"category":"payment"|"termination"|"rights"|"obligations"|"liability"|"confidentiality"|"other","documentA":string|null,"documentB":string|null,"changeType":"added"|"removed"|"modified"|"unchanged","significance":"low"|"medium"|"high"}],"keyDifferences":[string],"risks":[{"id":string,"title":string,"category":string,"description":string,"recommendation":string,"location":{"section":string},"riskLevel":"low"|"medium"|"high"}],"missingInformation":[{"id":string,"description":string,"impact":"low"|"medium"|"high"}]}

DOCUMENT A (${doc1Title}):
"""
${truncDoc1}
"""

DOCUMENT B (${doc2Title}):
"""
${truncDoc2}
"""`;

    try {
      const response = await withGeminiRetry(
        () =>
          getAI().then((ai) =>
            ai.models.generateContent({
              model: env.GEMINI_MODEL,
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              config: {
                temperature: 0.1,
                topP: 0.8,
                topK: 40,
                maxOutputTokens: 3072,
                responseMimeType: 'application/json',
              },
            })
          ),
        { label: 'compareDocuments' }
      );

      let responseText = response.text;
      if (!responseText) {
        throw new Error('No text generated by Gemini');
      }

      responseText = responseText.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();

      let parsedData;
      try {
        parsedData = JSON.parse(responseText);
      } catch (parseError) {
        Logger.error('Failed to parse Gemini JSON output for comparison', {
          extra: { responseText: responseText.substring(0, 200) },
        });
        throw new Error('AI produced invalid JSON output');
      }

      const comparisonResult: ComparisonResult = {
        id: uuidv4(),
        doc1Id,
        doc2Id,
        userId,
        doc1Title,
        doc2Title,
        summary: parsedData.summary || 'No summary provided',
        changes: parsedData.changes || [],
        keyDifferences: parsedData.keyDifferences || [],
        risks: parsedData.risks?.map((r: any) => ({ ...r, id: r.id || uuidv4() })) || [],
        missingInformation:
          parsedData.missingInformation?.map((m: any) => ({ ...m, id: m.id || uuidv4() })) || [],
        disclaimer: 'This is AI-generated informational analysis and not legal advice.',
        comparedAt: new Date().toISOString(),
      };

      Logger.info('Gemini Document Comparison completed successfully', { userId });
      return comparisonResult;
    } catch (error: any) {
      const errMsg = error?.message || 'Unknown error';
      const status = error?.status || error?.response?.status;

      Logger.error('Gemini comparison execution failed', { error: errMsg, extra: { status } });

      throw new Error(classifyGeminiError(error, env.GEMINI_MODEL));
    }
  }

}
