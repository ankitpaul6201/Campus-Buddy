const http = require('http');

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runLaunchHardeningVerification() {
  console.log('==================================================');
  console.log('🧪 CAMPUS BUDDY — LAUNCH HARDENING VERIFICATION');
  console.log('==================================================');

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${message}`);
    }
  }

  const testEmail = `hardening_test_${Date.now()}@testcampus.edu`;
  const testPassword = 'Password123!';

  // 1. Sign up a new test student
  console.log('\n--- Test 1: User Registration ---');
  const signupRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/auth/signup',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    name: 'Hardening Student',
    email: testEmail,
    password: testPassword,
    university: 'MIT Test Campus'
  });

  assert(signupRes.status === 201 && signupRes.data.token, 'Student registration returns 201 and JWT token');
  const token = signupRes.data.token;
  const userId = signupRes.data.user._id || signupRes.data.user.id;

  // 2. Create a test product listing
  console.log('\n--- Test 2: Product Creation ---');
  const productRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/products',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }, {
    title: 'Test Hardening Textbook',
    description: 'Clean textbook to test reporting & deletion',
    price: 450,
    category: 'Books',
    condition: 'Like New',
    location: 'Campus Library Safe Zone',
    images: ['https://res.cloudinary.com/demo/image/upload/sample.jpg'],
    university: 'MIT Test Campus'
  });

  assert(productRes.status === 201 && productRes.data._id, 'Product listing created successfully (201)');
  const productId = productRes.data._id;

  // 3. Test Product Reporting
  console.log('\n--- Test 3: Product Reporting & Moderation ---');
  const reportRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: `/api/products/${productId}/report`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }, {
    reason: 'Prohibited or dangerous item',
    details: 'Testing campus safety moderation reporting pipeline'
  });

  assert(reportRes.status === 200 && reportRes.data.success, 'Listing report submitted successfully (200)');
  assert(reportRes.data.reportCount === 1, 'Listing reportCount incremented accurately to 1');

  // Test unauthenticated report
  const unauthReportRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: `/api/products/${productId}/report`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { reason: 'Spam' });
  assert(unauthReportRes.status === 401, 'Unauthenticated report rejected with 401 Unauthorized');

  // Test authenticated invalid report (missing reason)
  const badReportRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: `/api/products/${productId}/report`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }, { reason: '   ' });
  assert(badReportRes.status === 400, 'Invalid report without reason rejected with 400 Bad Request');

  // 4. Test CORS Restriction
  console.log('\n--- Test 4: CORS Origin Policy ---');
  const corsRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/health',
    method: 'GET',
    headers: { 'Origin': 'capacitor://localhost' }
  });
  assert(corsRes.headers['access-control-allow-origin'] === 'capacitor://localhost', 'Capacitor mobile origin allowed in CORS');

  // 5. Test Account Deletion & Data Cleanup
  console.log('\n--- Test 5: Account Deletion & Data Cleanup ---');
  const deleteRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/auth/me',
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  assert(deleteRes.status === 200 && deleteRes.data.success, 'DELETE /api/auth/me returns 200 with success: true');

  // Verify user cannot log in anymore
  const loginRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    email: testEmail,
    password: testPassword
  });
  assert(loginRes.status === 400 && loginRes.data.error.includes('No account found'), 'Deleted user rejected upon login (No account found)');

  // Verify deleted product is removed from marketplace
  const checkProductRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: `/api/products/${productId}`,
    method: 'GET'
  });
  assert(checkProductRes.status === 404, 'Deleted user product returns 404 Not Found');

  console.log('\n==================================================');
  console.log(`🎯 LAUNCH HARDENING RESULTS: ${passed}/${total} TESTS PASSED`);
  console.log('==================================================\n');

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runLaunchHardeningVerification().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
