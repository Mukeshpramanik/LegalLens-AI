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

export class GeminiService {
  /**
   * Analyzes the extracted text of a legal document using Gemini 2.5 Flash.
   */
  static async analyzeDocument(
    documentId: string,
    userId: string,
    documentText: string
  ): Promise<AnalysisResult> {
    Logger.info(`Starting Gemini analysis for document`, { documentId, userId });

    const prompt = `
You are an expert legal AI assistant. Your task is to analyze the following legal document and extract key structured information.
You MUST follow these strict rules:
1. Grounding: ONLY use facts, clauses, and dates present in the provided document. Do NOT invent or assume any information.
2. Missing Info: If information is missing, use empty arrays or explicit missing indicators. Do not guess.
3. No Legal Advice: Provide informational analysis only. Do not state definitive legal advice.
4. Output Format: You MUST return valid JSON matching the exact schema below.

---
JSON SCHEMA REQUIRED:
{
  "documentType": "String (e.g., NDA, MSA, Lease Agreement, or null if unknown)",
  "summary": "String (concise overview of the document's purpose)",
  "keyParties": [
    { "id": "uuid", "name": "Party Name", "role": "Role (e.g., Disclosing Party)", "location": { "section": "string", "excerpt": "string" } }
  ],
  "importantDates": [
    { "id": "uuid", "date": "Date String", "event": "Event Description", "isActionRequired": boolean, "location": { "section": "string" } }
  ],
  "keyClauses": [
    { "id": "uuid", "title": "Clause Title", "text": "Exact text snippet", "summary": "Plain English summary", "riskLevel": "low|medium|high", "location": { "section": "string" } }
  ],
  "obligations": [
    { "id": "uuid", "party": "Party Name", "description": "What they must do", "location": { "section": "string" } }
  ],
  "rights": [
    { "id": "uuid", "party": "Party Name", "description": "What they are entitled to", "location": { "section": "string" } }
  ],
  "paymentTerms": [
    { "id": "uuid", "amount": "String", "condition": "When/How", "location": { "section": "string" } }
  ],
  "terminationTerms": [
    { "id": "uuid", "condition": "How agreement ends", "noticePeriod": "e.g., 30 days", "location": { "section": "string" } }
  ],
  "risks": [
    { "id": "uuid", "title": "Risk Title", "category": "String", "description": "Why it is a risk", "recommendation": "Suggested review", "riskLevel": "low|medium|high", "location": { "section": "string" } }
  ],
  "missingInformation": [
    { "id": "uuid", "description": "What standard clause is missing (e.g., Governing Law)", "impact": "low|medium|high" }
  ],
  "nextSteps": ["String array of recommended immediate actions based on the document"],
  "disclaimer": "String stating this is AI-generated informational analysis and not legal advice."
}
---

DOCUMENT TEXT TO ANALYZE:
"""
${documentText}
"""
`;

    let attempt = 0;
    const maxRetries = 3;
    let response;

    try {
      while (attempt <= maxRetries) {
        try {
          response = await (await getAI()).models.generateContent({
            model: env.GEMINI_MODEL,
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: {
              temperature: 0.1,
              topP: 0.8,
              topK: 40,
              responseMimeType: 'application/json',
            }
          });
          break; // Success, exit retry loop
        } catch (error: any) {
          const errMsg = error?.message || 'Unknown error';
          const status = error?.status || error?.response?.status;
          const is503 = status === 503 || errMsg.includes('503') || errMsg.includes('high demand') || errMsg.includes('UNAVAILABLE');

          if (is503 && attempt < maxRetries) {
            attempt++;
            const delayMs = Math.pow(2, attempt) * 1000; // 2000, 4000, 8000
            Logger.warn(`Gemini 503 error, retrying... (retry ${attempt}/${maxRetries}, wait ${delayMs}ms)`, { documentId });
            await new Promise(resolve => setTimeout(resolve, delayMs));
            continue;
          }
          // If not a 503, or max retries exceeded, propagate the error
          throw error;
        }
      }

      if (!response) {
        throw new Error('No response returned by Gemini');
      }

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
        Logger.error('Failed to parse Gemini JSON output', { documentId, extra: { responseText: responseText.substring(0, 200) } });
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
        disclaimer: parsedData.disclaimer || 'This is AI-generated informational analysis and not legal advice.',
        analyzedAt: new Date().toISOString(),
      };

      Logger.info(`Gemini analysis completed successfully`, { documentId, userId });
      return analysisResult;

    } catch (error: any) {
      const errMsg = error?.message || 'Unknown error';
      const status = error?.status || error?.response?.status;

      try {
        const fs = require('fs');
        fs.writeFileSync('/tmp/gemini_error_dump.json', JSON.stringify({
          message: errMsg,
          status,
          rawError: String(error),
          stack: error?.stack,
          response: error?.response
        }, null, 2));
      } catch (e) {}

      Logger.error(`Gemini analysis execution failed`, { documentId, error: errMsg, extra: { status } });

      if (env.AI_PROVIDER === 'google-gemini-api' && !env.GEMINI_API_KEY) {
        throw new Error('Missing configuration: GEMINI_API_KEY must be provided locally to use the google-gemini-api provider.');
      }
      if (errMsg.includes('API_KEY_INVALID') || status === 401 || errMsg.includes('API key not valid')) {
        throw new Error('Invalid Gemini API Key configured. Please verify your GEMINI_API_KEY in the local environment.');
      }
      if (errMsg.includes('not found') || status === 404 || errMsg.includes('models/')) {
        throw new Error(`The configured model (${env.GEMINI_MODEL}) is unavailable or retired. Please configure a supported model in the local environment.`);
      }
      if (errMsg.includes('429') || errMsg.includes('quota') || status === 429) {
        throw new Error('AI analysis rate limit or quota exceeded. Please try again later or verify your API limits.');
      }
      if (errMsg.includes('BILLING_DISABLED') || status === 403) {
        throw new Error('AI provider requires billing to be enabled on your Google Cloud project, or you must switch to the google-gemini-api provider.');
      }
      if (errMsg.includes('fetch failed') || errMsg.includes('ENOTFOUND') || errMsg.includes('timeout')) {
        throw new Error('Network error connecting to the AI provider. Please check your connection and try again.');
      }

      if (status === 503 || errMsg.includes('503') || errMsg.includes('high demand') || errMsg.includes('UNAVAILABLE')) {
        throw new Error('The AI service is currently experiencing high demand and is unavailable. Please try again later.');
      }

      throw new Error('AI Analysis encountered an unexpected error. Please check the backend logs for details.');
    }
  }

  static async askQuestion(
    documentId: string,
    userId: string,
    documentText: string,
    question: string
  ): Promise<QAPair> {
    Logger.info('Starting Gemini Q&A', { documentId, userId });

    const prompt = `
You are an expert legal AI assistant. Your task is to answer a user's question based ONLY on the provided legal document.
You MUST follow these strict rules:
1. Grounding: ONLY use facts, clauses, and dates present in the document. Do not invent information.
2. Missing Info: If the document does not contain enough information to answer the question, return "The document does not provide enough information to answer this question." in the answer field.
3. No Legal Advice: Provide informational analysis only. Do not provide personalized legal advice.
4. Output Format: You MUST return valid JSON matching the exact schema below.

---
JSON SCHEMA REQUIRED:
{
  "answer": "String",
  "sources": [
    {
      "section": "String",
      "excerpt": "String (exact quote from document)"
    }
  ],
  "confidence": "high | medium | low",
  "grounded": boolean (true if based on document, false if you had to guess or couldn't find it)
}
---

QUESTION:
"""
${question}
"""

DOCUMENT TEXT:
"""
${documentText}
"""
`;

    let attempt = 0;
    const maxRetries = 3;
    let response;

    try {
      while (attempt <= maxRetries) {
        try {
          response = await (await getAI()).models.generateContent({
            model: env.GEMINI_MODEL,
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: {
              temperature: 0.1,
              topP: 0.8,
              topK: 40,
              responseMimeType: 'application/json',
            }
          });
          break;
        } catch (error: any) {
          const errMsg = error?.message || 'Unknown error';
          const status = error?.status || error?.response?.status;
          const is503 = status === 503 || errMsg.includes('503') || errMsg.includes('high demand') || errMsg.includes('UNAVAILABLE');

          if (is503 && attempt < maxRetries) {
            attempt++;
            const delayMs = Math.pow(2, attempt) * 1000;
            Logger.warn(`Gemini 503 error, retrying Q&A... (retry ${attempt}/${maxRetries}, wait ${delayMs}ms)`, { documentId });
            await new Promise(resolve => setTimeout(resolve, delayMs));
            continue;
          }
          throw error;
        }
      }

      if (!response) {
        throw new Error('No response returned by Gemini');
      }

      let responseText = response.text;
      if (!responseText) {
        throw new Error('No text generated by Gemini');
      }

      responseText = responseText.replace(/^```(?:json)?s*/i, '').replace(/```s*$/, '').trim();

      let parsedData;
      try {
        parsedData = JSON.parse(responseText);
      } catch (parseError) {
        Logger.error('Failed to parse Gemini JSON output', { documentId, extra: { responseText: responseText.substring(0, 200) } });
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

      if (env.AI_PROVIDER === 'google-gemini-api' && !env.GEMINI_API_KEY) {
        throw new Error('Missing configuration: GEMINI_API_KEY must be provided locally to use the google-gemini-api provider.');
      }
      if (errMsg.includes('API_KEY_INVALID') || status === 401 || errMsg.includes('API key not valid')) {
        throw new Error('Invalid Gemini API Key configured. Please verify your GEMINI_API_KEY in the local environment.');
      }
      if (errMsg.includes('not found') || status === 404 || errMsg.includes('models/')) {
        throw new Error(`The configured model (${env.GEMINI_MODEL}) is unavailable or retired. Please configure a supported model in the local environment.`);
      }
      if (errMsg.includes('429') || errMsg.includes('quota') || status === 429) {
        throw new Error('AI analysis rate limit or quota exceeded. Please try again later or verify your API limits.');
      }
      if (errMsg.includes('BILLING_DISABLED') || status === 403) {
        throw new Error('AI provider requires billing to be enabled on your Google Cloud project, or you must switch to the google-gemini-api provider.');
      }
      if (errMsg.includes('fetch failed') || errMsg.includes('ENOTFOUND') || errMsg.includes('timeout')) {
        throw new Error('Network error connecting to the AI provider. Please check your connection and try again.');
      }

      if (status === 503 || errMsg.includes('503') || errMsg.includes('high demand') || errMsg.includes('UNAVAILABLE')) {
        throw new Error('The AI service is currently experiencing high demand and is unavailable. Please try again later.');
      }

      throw new Error('AI Analysis encountered an unexpected error. Please check the backend logs for details.');
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

    const prompt = `
You are an expert legal AI assistant. Your task is to compare two legal documents and extract key structured information about their differences.
You MUST follow these strict rules:
1. Grounding: ONLY use facts and clauses present in the provided documents. Do not invent differences.
2. If a clause exists only in one document, explicitly mark it as added or removed.
3. If information cannot be established, state so.
4. Output Format: You MUST return valid JSON matching the exact schema below.

---
JSON SCHEMA REQUIRED:
{
  "summary": "String (concise overview of the differences between the documents)",
  "changes": [
    {
      "category": "payment | termination | rights | obligations | liability | confidentiality | other",
      "documentA": "String (relevant text from Document A, or null if added in B)",
      "documentB": "String (relevant text from Document B, or null if removed in B)",
      "changeType": "added | removed | modified | unchanged",
      "significance": "low | medium | high"
    }
  ],
  "keyDifferences": ["String"],
  "risks": [
    { "id": "uuid", "title": "String", "category": "String", "description": "String", "recommendation": "String", "location": { "section": "string" }, "riskLevel": "low|medium|high" }
  ],
  "missingInformation": [
    { "id": "uuid", "description": "String", "impact": "low|medium|high" }
  ]
}
---

DOCUMENT A (${doc1Title}):
"""
${doc1Text}
"""

DOCUMENT B (${doc2Title}):
"""
${doc2Text}
"""
`;

    let attempt = 0;
    const maxRetries = 3;
    let response;

    try {
      while (attempt <= maxRetries) {
        try {
          response = await (await getAI()).models.generateContent({
            model: env.GEMINI_MODEL,
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: {
              temperature: 0.1,
              topP: 0.8,
              topK: 40,
              responseMimeType: 'application/json',
            }
          });
          break;
        } catch (error: any) {
          const errMsg = error?.message || 'Unknown error';
          const status = error?.status || error?.response?.status;
          const is503 = status === 503 || errMsg.includes('503') || errMsg.includes('high demand') || errMsg.includes('UNAVAILABLE');

          if (is503 && attempt < maxRetries) {
            attempt++;
            const delayMs = Math.pow(2, attempt) * 1000;
            Logger.warn(`Gemini 503 error, retrying comparison... (retry ${attempt}/${maxRetries}, wait ${delayMs}ms)`);
            await new Promise(resolve => setTimeout(resolve, delayMs));
            continue;
          }
          throw error;
        }
      }

      if (!response) {
        throw new Error('No response returned by Gemini');
      }

      let responseText = response.text;
      if (!responseText) {
        throw new Error('No text generated by Gemini');
      }

      responseText = responseText.replace(/^```(?:json)?s*/i, '').replace(/```s*$/, '').trim();

      let parsedData;
      try {
        parsedData = JSON.parse(responseText);
      } catch (parseError) {
        Logger.error('Failed to parse Gemini JSON output for comparison', { extra: { responseText: responseText.substring(0, 200) } });
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
        missingInformation: parsedData.missingInformation?.map((m: any) => ({ ...m, id: m.id || uuidv4() })) || [],
        disclaimer: 'This is AI-generated informational analysis and not legal advice.',
        comparedAt: new Date().toISOString(),
      };

      Logger.info('Gemini Document Comparison completed successfully', { userId });
      return comparisonResult;

    } catch (error: any) {
      const errMsg = error?.message || 'Unknown error';
      const status = error?.status || error?.response?.status;

      Logger.error('Gemini comparison execution failed', { error: errMsg, extra: { status } });

      if (env.AI_PROVIDER === 'google-gemini-api' && !env.GEMINI_API_KEY) {
        throw new Error('Missing configuration: GEMINI_API_KEY must be provided locally to use the google-gemini-api provider.');
      }
      if (errMsg.includes('API_KEY_INVALID') || status === 401 || errMsg.includes('API key not valid')) {
        throw new Error('Invalid Gemini API Key configured. Please verify your GEMINI_API_KEY in the local environment.');
      }
      if (errMsg.includes('not found') || status === 404 || errMsg.includes('models/')) {
        throw new Error(`The configured model (${env.GEMINI_MODEL}) is unavailable or retired. Please configure a supported model in the local environment.`);
      }
      if (errMsg.includes('429') || errMsg.includes('quota') || status === 429) {
        throw new Error('AI analysis rate limit or quota exceeded. Please try again later or verify your API limits.');
      }
      if (errMsg.includes('BILLING_DISABLED') || status === 403) {
        throw new Error('AI provider requires billing to be enabled on your Google Cloud project, or you must switch to the google-gemini-api provider.');
      }
      if (errMsg.includes('fetch failed') || errMsg.includes('ENOTFOUND') || errMsg.includes('timeout')) {
        throw new Error('Network error connecting to the AI provider. Please check your connection and try again.');
      }

      if (status === 503 || errMsg.includes('503') || errMsg.includes('high demand') || errMsg.includes('UNAVAILABLE')) {
        throw new Error('The AI service is currently experiencing high demand and is unavailable. Please try again later.');
      }

      throw new Error('AI Analysis encountered an unexpected error. Please check the backend logs for details.');
    }
  }

}
