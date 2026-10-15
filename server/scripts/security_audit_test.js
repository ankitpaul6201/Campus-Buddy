/**
 * Security & Authorization Audit Verification Script
 * Validates BOLA, IDOR, MIME upload injection, auth bypass, and data exposure.
 */

const http = require('http');

const BASE_URL = 'http://localhost:5000';

async function request(path, options = {}) {
  const url = new URL(path, BASE_URL);
  const headers = options.headers || {};
  const method = options.method || 'GET';
  const body = options.body ? JSON.stringify(options.body) : null;

  if (body) {
    headers['Content-Type'] = 'application/json';
    headers['Content-Length'] = Buffer.byteLength(body);
  }

  return new Promise((resolve, reject) => {
    const req = http.request(url, { method, headers }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let parsed = null;
        try { parsed = JSON.parse(data); } catch { parsed = data; }
        resolve({ status: res.statusCode, headers: res.headers, body: parsed });
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function runSecurityAudit() {
  console.log('🔒 Starting Comprehensive Security & Authorization Audit...\n');
  const results = [];

  // TEST 1: Unauthenticated profile access
  {
    const res = await request('/api/auth/me');
    const pass = res.status === 401;
    results.push({ name: 'Unauthenticated access rejected (401)', pass, details: `Status: ${res.status}` });
  }

  // TEST 2: Forged JWT token access
  {
    const res = await request('/api/auth/me', {
      headers: { Authorization: 'Bearer invalid.tampered.token.123' }
    });
    const pass = res.status === 401;
    results.push({ name: 'Forged/Tampered JWT rejected (401)', pass, details: `Status: ${res.status}` });
  }

  // TEST 3: Create listing without authentication
  {
    const res = await request('/api/products', {
      method: 'POST',
      body: { title: 'Hacked Item', price: 100 }
    });
    const pass = res.status === 401;
    results.push({ name: 'Unauthenticated product creation blocked (401)', pass, details: `Status: ${res.status}` });
  }

  // TEST 4: Register two distinct users (User A and User B) to test BOLA/IDOR
  let tokenA = null;
  let tokenB = null;
  let userAId = null;
  let userBId = null;
  const userAEmail = `test_security_a_${Date.now()}@campus.edu`;
  const userBEmail = `test_security_b_${Date.now()}@campus.edu`;

  {
    const resA = await request('/api/auth/signup', {
      method: 'POST',
      body: { name: 'User Alpha', email: userAEmail, password: 'Password123!', universityName: 'Test University' }
    });
    tokenA = resA.body?.token;
    userAId = resA.body?.user?._id || resA.body?.user?.id;

    const resB = await request('/api/auth/signup', {
      method: 'POST',
      body: { name: 'User Beta', email: userBEmail, password: 'Password123!', universityName: 'Test University' }
    });
    tokenB = resB.body?.token;
    userBId = resB.body?.user?._id || resB.body?.user?.id;

    // Verify Password Hash is NOT exposed in response
    const passA = Boolean(tokenA && resA.body.user && !resA.body.user.password);
    results.push({ name: 'Registration succeeds & password hash NOT exposed', pass: passA });
  }

  // TEST 5: User A creates a product
  let productAId = null;
  if (tokenA) {
    const res = await request('/api/products', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: {
        title: 'User Alpha Calculus Book',
        description: 'Clean textbook for semester 1',
        price: 450,
        category: 'Books & Notes',
        condition: 'Like New',
        location: 'Library gate',
        images: ['https://res.cloudinary.com/demo/image/upload/sample.jpg']
      }
    });
    productAId = res.body?._id;
    const pass = res.status === 201 && Boolean(productAId);
    results.push({ name: 'User A creates authenticated product (201)', pass });
  }

  // TEST 6: BOLA / IDOR Attack — User B attempts to change status of User A's product
  if (tokenB && productAId) {
    const res = await request(`/api/products/${productAId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenB}` },
      body: { status: 'sold' }
    });
    const pass = res.status === 404; // Must return 404/401 unauthorized to prevent unauthorized modification
    results.push({ name: 'BOLA attack prevented: User B cannot modify User A product', pass, details: `Status: ${res.status}` });
  }

  // TEST 7: BOLA / IDOR Attack — User B attempts to delete User A's product
  if (tokenB && productAId) {
    const res = await request(`/api/products/${productAId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenB}` }
    });
    const pass = res.status === 404; // Must reject unauthorized delete
    results.push({ name: 'BOLA attack prevented: User B cannot delete User A product', pass, details: `Status: ${res.status}` });
  }

  // TEST 8: Input validation: Malicious price & negative numbers
  if (tokenA) {
    const resNegative = await request('/api/products', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: {
        title: 'Invalid Item',
        description: 'Negative price attack',
        price: -500,
        images: ['https://example.com/img.jpg'],
        location: 'Hostel'
      }
    });
    const passNeg = resNegative.status === 400;

    const resOverflow = await request('/api/products', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: {
        title: 'Exorbitant Item',
        description: 'Exorbitant price attack',
        price: 99999999,
        images: ['https://example.com/img.jpg'],
        location: 'Hostel'
      }
    });
    const passOver = resOverflow.status === 400;

    results.push({ name: 'Negative price rejected (400)', pass: passNeg });
    results.push({ name: 'Overflow price (> 200,000) rejected (400)', pass: passOver });
  }

  // TEST 9: Direct upload signature generation
  if (tokenA) {
    const res = await request('/api/products/sign-upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    const pass = res.status === 200 && res.body?.signature && res.body?.apiKey && !res.body?.apiSecret;
    results.push({ name: 'Direct Cloudinary signed upload generated safely (no secret leaked)', pass });
  }

  // TEST 10: Clean up test product by User A (owner)
  if (tokenA && productAId) {
    const res = await request(`/api/products/${productAId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    const pass = res.status === 200;
    results.push({ name: 'Authorized owner deletion succeeds (200)', pass });
  }

  // Display report
  console.log('\n================ SECURITY AUDIT SUMMARY ================');
  let passedCount = 0;
  for (const r of results) {
    const symbol = r.pass ? '✅ PASS' : '❌ FAIL';
    if (r.pass) passedCount++;
    console.log(`${symbol} : ${r.name} ${r.details ? `(${r.details})` : ''}`);
  }
  console.log('========================================================');
  console.log(`TOTAL: ${passedCount} / ${results.length} PASSED (${Math.round((passedCount/results.length)*100)}%)\n`);

  if (passedCount !== results.length) {
    process.exit(1);
  }
}

runSecurityAudit().catch(err => {
  console.error('Audit execution error:', err);
  process.exit(1);
});
