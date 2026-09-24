const http = require('http');

const PORT = 8081;
const VALID_TOKEN = 'mock-token-c1T6FwTjyBeoK1CbkVOkpCEdewh2';
const VALID_DOC_ID = '16d0b5a8-06eb-44df-975e-36e05b4b0391';
const INVALID_DOC_ID = 'not-a-uuid';

async function fetchAPI(path, method = 'GET', body = null, token = VALID_TOKEN) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: PORT,
      path: `/api${path}`,
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  let passed = 0;
  let failed = 0;

  const assert = (name, condition) => {
    if (condition) {
      console.log(`✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${name}`);
      failed++;
    }
  };

  console.log('--- RUNNING PHASE 5 SECURITY TESTS ---');

  // 1. Zod Validation: Ask Question with invalid UUID
  const test1 = await fetchAPI(`/documents/${INVALID_DOC_ID}/ask`, 'POST', { question: 'What?' }, VALID_TOKEN);
  assert('Zod intercepts invalid Document ID -> 400', test1.status === 400);

  // 2. Zod Validation: Compare with invalid UUIDs
  const test2 = await fetchAPI('/documents/compare', 'POST', { documentIdA: INVALID_DOC_ID, documentIdB: VALID_DOC_ID }, VALID_TOKEN);
  assert('Zod intercepts invalid Compare IDs -> 400', test2.status === 400);

  // 3. Zod Validation: Empty Question
  const test3 = await fetchAPI(`/documents/${VALID_DOC_ID}/ask`, 'POST', { question: '   ' }, VALID_TOKEN);
  assert('Zod intercepts empty question -> 400', test3.status === 400);

  // 4. Rate Limiting: Abuse Q&A endpoint
  console.log('Simulating rate limit on Q&A endpoint (sending 51 requests)...');
  let rateLimited = false;
  for(let i=0; i<51; i++) {
    // Only send invalid requests to save Gemini costs while tripping the limiter
    const res = await fetchAPI(`/documents/${VALID_DOC_ID}/ask`, 'POST', { question: '' }, VALID_TOKEN);
    if (res.status === 429) {
      rateLimited = true;
      break;
    }
  }
  assert('Rate limiter trips -> 429 TOO_MANY_REQUESTS', rateLimited);

  console.log(`\n--- TEST RESULTS: ${passed} PASSED, ${failed} FAILED ---`);
  if (failed > 0) process.exit(1);
}

runTests().catch(console.error);
