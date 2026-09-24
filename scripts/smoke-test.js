const path = require('path');
const dotenv = require('dotenv');

// Load env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const provider = process.env.AI_PROVIDER || 'google-gemini-api';
const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : '';
const model = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

console.log(`[Config] Provider: ${provider}`);
console.log(`[Config] API Key Exists: ${!!apiKey} (Length: ${apiKey.length})`);
console.log(`[Config] Model: ${model}`);

async function run() {
  try {
    const { GoogleGenAI } = require('@google/genai');
    const ai = new GoogleGenAI(
      provider === 'google-gemini-api'
        ? { apiKey: apiKey }
        : { vertexai: true }
    );

    console.log('[Test] Sending real API request...');
    const response = await ai.models.generateContent({
      model: model,
      contents: [{ role: 'user', parts: [{ text: 'Respond with exactly the word "SUCCESS"' }] }]
    });

    console.log(`[Success] API Response: ${response.text}`);
  } catch (error) {
    console.error(`[Error] Name: ${error.name}`);
    console.error(`[Error] Message: ${error.message}`);
    if (error.status) console.error(`[Error] Status: ${error.status}`);
    if (error.response) {
      console.error(`[Error] Response Status: ${error.response.status}`);
      console.error(`[Error] Response Body: ${JSON.stringify(error.response, null, 2)}`);
    }
  }
}

run();
