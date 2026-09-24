const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '../.env') });
const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');

async function run() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY.trim() });
  const textPath = path.resolve(__dirname, '../backend/uploads/users/c1T6FwTjyBeoK1CbkVOkpCEdewh2/documents/16d0b5a8-06eb-44df-975e-36e05b4b0391/extracted.txt');
  const documentText = fs.readFileSync(textPath, 'utf8');

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

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        temperature: 0.1,
        topP: 0.8,
        topK: 40,
        responseMimeType: 'application/json',
      }
    });
    console.log('RAW RESPONSE TEXT:');
    console.log(response.text);
  } catch(e) {
    console.error(e);
  }
}
run();
