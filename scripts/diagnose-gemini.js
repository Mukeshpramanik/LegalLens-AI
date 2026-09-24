const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');

console.log('\n=======================================');
console.log('🔍 SAFE GEMINI API DIAGNOSTIC');
console.log('=======================================\n');

// Load env using the exact logic from env.ts
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

const provider = process.env.AI_PROVIDER || 'google-gemini-api';
const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : '';
const model = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

console.log(`[Config] Provider detected: ${provider}`);
console.log(`[Config] API Key exists: ${!!apiKey}`);
console.log(`[Config] API Key length: ${apiKey.length} characters`);
if (apiKey.length > 0 && apiKey.length !== 39) {
  console.log(`         ⚠️ Warning: Standard Google Gemini API keys are usually 39 characters long.`);
}
console.log(`[Config] Model name: ${model}`);

try {
  const pkgPath = path.join(__dirname, '..', 'node_modules', '@google', 'genai', 'package.json');
  const pkg = require(pkgPath);
  console.log(`[System] SDK Version (@google/genai): ${pkg.version}`);
} catch (e) {
  console.log(`[System] SDK Version: Could not resolve package.json (${e.message})`);
}

try {
  const { GoogleGenAI } = require('@google/genai');
  const ai = new GoogleGenAI(
    provider === 'google-gemini-api'
      ? { apiKey: apiKey }
      : { vertexai: true }
  );
  console.log('[Status] Gemini client initialization: SUCCESS');
} catch (e) {
  console.log(`[Status] Gemini client initialization: FAILED (${e.message})`);
}
console.log('\n=======================================\n');
