const path = require('path');
const dotenv = require('dotenv');

// Load env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { GeminiService } = require('../backend/dist/backend/src/services/geminiService');
const { Logger } = require('../backend/dist/backend/src/utils/logging');

// Mock Logger so we see everything
Logger.error = (msg, meta) => console.error('[LOGGER ERROR]', msg, meta);
Logger.info = (msg, meta) => console.log('[LOGGER INFO]', msg, meta);

const mockDocumentText = `
CONFIDENTIALITY AGREEMENT
This Confidentiality Agreement ("Agreement") is entered into by and between Alice Corp ("Disclosing Party") and Bob LLC ("Receiving Party") on October 1, 2026.
The Receiving Party shall not disclose the Confidential Information to any third party for a period of 5 years.
Governing Law: State of California.
`;

async function run() {
  console.log('--- Starting Analysis Flow Test ---');
  try {
    const result = await GeminiService.analyzeDocument('test-doc-id', 'test-user-id', mockDocumentText);
    console.log('--- SUCCESS ---');
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('--- EXCEPTION CAUGHT ---');
    console.error(error.message);
  }
}

run();
