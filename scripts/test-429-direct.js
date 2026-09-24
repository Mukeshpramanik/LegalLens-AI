require('ts-node').register({ project: './backend/tsconfig.json' });

const { GeminiService } = require('../backend/src/services/geminiService');

async function run() {
  const docText = `
    This is a sample contract.
    The contractor will be paid $500 per day.
    The contract is governed by the laws of California.
  `;
  console.log('Calling GeminiService.analyzeDocument directly...');
  try {
    const result = await GeminiService.analyzeDocument('mock-doc-123', 'mock-user-456', docText);
    console.log('Success! Result:', JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('Caught Error:', err.message);
    const fs = require('fs');
    if (fs.existsSync('/tmp/gemini_error_dump.json')) {
      const errorDump = fs.readFileSync('/tmp/gemini_error_dump.json', 'utf8');
      console.log('\n--- GEMINI ERROR DUMP ---');
      console.log(errorDump);
    }
  }
}

run();
