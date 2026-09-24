const http = require('http');

const PORT = 8081; // Using 8081 so we don't clash with user's 8080
const BASE_URL = `http://localhost:${PORT}/api`;
const VALID_TOKEN = 'mock-token-c1T6FwTjyBeoK1CbkVOkpCEdewh2';
const UNAUTH_TOKEN = 'mock-token-unauthorized456';
const VALID_DOC_ID = '16d0b5a8-06eb-44df-975e-36e05b4b0391';

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

  console.log('--- RUNNING PHASE 4 TESTS ---');

  // 1. Unauthenticated Q&A
  const test1 = await fetchAPI(`/documents/${VALID_DOC_ID}/ask`, 'POST', { question: 'What is this?' }, null);
  assert('Unauthenticated Q&A -> 401', test1.status === 401);

  // 2. User does not own document -> 404 (our API returns 404 for security)
  const test2 = await fetchAPI(`/documents/${VALID_DOC_ID}/ask`, 'POST', { question: 'What is this?' }, UNAUTH_TOKEN);
  assert('User does not own document -> 404', test2.status === 404);

  // 3. Empty/invalid question
  const test3 = await fetchAPI(`/documents/${VALID_DOC_ID}/ask`, 'POST', { question: '' }, VALID_TOKEN);
  assert('Empty question -> 400', test3.status === 400);

  // 4. Valid Q&A
  console.log('Testing valid Q&A (this will call Gemini, taking a few seconds)...');
  const test4 = await fetchAPI(`/documents/${VALID_DOC_ID}/ask`, 'POST', { question: 'Who is the candidate?' }, VALID_TOKEN);
  assert('Valid Q&A -> 200 & Structured JSON', test4.status === 200 && test4.data?.data?.answer);

  // 5. Unauthenticated comparison
  const test5 = await fetchAPI('/documents/compare', 'POST', { documentIdA: VALID_DOC_ID, documentIdB: VALID_DOC_ID }, null);
  assert('Unauthenticated comparison -> 401', test5.status === 401);

  // 6. User does not own either document
  const test6 = await fetchAPI('/documents/compare', 'POST', { documentIdA: VALID_DOC_ID, documentIdB: VALID_DOC_ID }, UNAUTH_TOKEN);
  assert('User does not own doc in comparison -> 404', test6.status === 404);

  // 7. Invalid document IDs
  const test7 = await fetchAPI('/documents/compare', 'POST', { documentIdA: '', documentIdB: '' }, VALID_TOKEN);
  assert('Invalid document IDs -> 400', test7.status === 400);

  // 8. Valid comparison
  console.log('Testing valid comparison (this will call Gemini, taking a few seconds)...');
  const test8 = await fetchAPI('/documents/compare', 'POST', { documentIdA: VALID_DOC_ID, documentIdB: VALID_DOC_ID }, VALID_TOKEN);
  assert('Valid comparison -> 200 & Structured JSON', test8.status === 200 && test8.data?.data?.summary);

  console.log(`\n--- TEST RESULTS: ${passed} PASSED, ${failed} FAILED ---`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(console.error);
