const http = require('http');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('\n======================================================');
console.log('🧪 LEGALLEAN / LEGALEASE AI — PRODUCTION BACKEND TESTS');
console.log('======================================================\n');

const distEntry = path.join(__dirname, '..', 'backend', 'dist', 'backend', 'src', 'index.js');
const TEST_PORT = 8089;
let passed = 0;
let failed = 0;

function assert(description, condition, details = '') {
  if (condition) {
    console.log(`  ✅ PASS: ${description}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${description} ${details}`);
    failed++;
  }
}

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = JSON.parse(data);
        } catch (e) {
          parsed = data;
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: parsed,
          rawBody: data,
        });
      });
    });

    req.on('error', (err) => reject(err));

    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  // Test 1: TypeScript build artifacts
  console.log('[1/6] Validating TypeScript compilation and build artifacts:');
  assert('Compiled entry point exists at dist/backend/src/index.js', fs.existsSync(distEntry));
  const sharedDist = path.join(__dirname, '..', 'backend', 'dist', 'shared', 'constants.js');
  assert('Compiled shared constants exist at dist/shared/constants.js', fs.existsSync(sharedDist));

  // Test 2: Environment schema validation
  console.log('\n[2/6] Validating Environment configuration:');
  try {
    const envModule = require('../backend/dist/backend/src/config/env');
    assert('Environment module loaded and parsed successfully', typeof envModule.env === 'object');
    assert('Default port is valid number', typeof envModule.env.PORT === 'number');
    assert('AI provider is configured', typeof envModule.env.AI_PROVIDER === 'string');
  } catch (err) {
    assert('Environment module loaded without error', false, err.message);
  }

  // Test 3: Spawning production backend server
  console.log(`\n[3/6] Spawning production backend on 0.0.0.0:${TEST_PORT}...`);
  const serverProcess = spawn('node', [distEntry], {
    env: {
      ...process.env,
      PORT: String(TEST_PORT),
      NODE_ENV: 'production',
      FRONTEND_URL: 'http://localhost:3000,https://legallens-ai.workers.dev',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  // Wait for server ready
  let ready = false;
  for (let i = 0; i < 20; i++) {
    await new Promise((r) => setTimeout(r, 250));
    try {
      const res = await makeRequest({
        hostname: '127.0.0.1',
        port: TEST_PORT,
        path: '/health',
        method: 'GET',
      });
      if (res.statusCode === 200) {
        ready = true;
        break;
      }
    } catch (e) {}
  }

  if (!ready) {
    console.error('❌ Failed to start backend test server within 5 seconds.');
    serverProcess.kill();
    process.exit(1);
  }
  assert('Server started and bound to port ' + TEST_PORT, ready);

  try {
    // Test 4: Health Check Endpoints
    console.log('\n[4/6] Testing Health Check Endpoints:');
    const healthRes = await makeRequest({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: '/health',
      method: 'GET',
    });
    assert('GET /health returns 200 OK', healthRes.statusCode === 200);
    assert('GET /health returns status "healthy"', healthRes.body?.status === 'healthy');
    assert('GET /health reports service name', healthRes.body?.service === 'legalease-ai-backend');

    const apiHealthRes = await makeRequest({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: '/api/health',
      method: 'GET',
    });
    assert('GET /api/health returns 200 OK', apiHealthRes.statusCode === 200);
    assert('GET /api/health returns status "healthy"', apiHealthRes.body?.status === 'healthy');

    // Test 5: CORS and Security Headers
    console.log('\n[5/6] Testing CORS and Security:');
    const corsPreflightRes = await makeRequest({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: '/api/documents',
      method: 'OPTIONS',
      headers: {
        Origin: 'https://legallens-ai.workers.dev',
        'Access-Control-Request-Method': 'GET',
      },
    });
    assert('OPTIONS preflight returns 204 or 200', corsPreflightRes.statusCode === 204 || corsPreflightRes.statusCode === 200);
    assert(
      'CORS allows configured Cloudflare frontend domain',
      corsPreflightRes.headers['access-control-allow-origin'] === 'https://legallens-ai.workers.dev'
    );
    assert(
      'CORS allows credentials',
      corsPreflightRes.headers['access-control-allow-credentials'] === 'true'
    );

    // Test 6: Authentication Guard and Error Responses
    console.log('\n[6/6] Testing Authentication Middleware & Error Responses:');
    const noAuthRes = await makeRequest({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: '/api/documents',
      method: 'GET',
    });
    assert('GET /api/documents without token returns 401', noAuthRes.statusCode === 401);
    assert('401 response has code "UNAUTHORIZED"', noAuthRes.body?.error?.code === 'UNAUTHORIZED');

    const invalidAuthRes = await makeRequest({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: '/api/documents',
      method: 'GET',
      headers: {
        Authorization: 'Basic invalid-credentials',
      },
    });
    assert('GET /api/documents with non-Bearer auth returns 401', invalidAuthRes.statusCode === 401);

    const emptyTokenRes = await makeRequest({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: '/api/documents',
      method: 'GET',
      headers: {
        Authorization: 'Bearer ',
      },
    });
    assert('GET /api/documents with empty token returns 401', emptyTokenRes.statusCode === 401);

    const unauthUploadRes = await makeRequest({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: '/api/documents/upload',
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    assert('POST /api/documents/upload without auth returns 401', unauthUploadRes.statusCode === 401);

    const notFoundRes = await makeRequest({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: '/api/nonexistent-endpoint',
      method: 'GET',
    });
    assert('GET /api/nonexistent-endpoint returns 404', notFoundRes.statusCode === 404);
    assert('404 response has code "NOT_FOUND"', notFoundRes.body?.error?.code === 'NOT_FOUND');
    assert('404 response contains ISO timestamp in meta', typeof notFoundRes.body?.meta?.timestamp === 'string');

  } finally {
    console.log('\nShutting down test server process...');
    serverProcess.kill();
  }

  console.log('\n======================================================');
  console.log(`TEST SUMMARY: ${passed} passed, ${failed} failed`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Unexpected test error:', err);
  process.exit(1);
});
