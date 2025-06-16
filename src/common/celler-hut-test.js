// Basic test utilities for Celler Hut API integration
// Run with: node celler-hut-test.js

const axios = require('axios');

// Environment configuration
const CELLER_HUT_API_URL =
  process.env.CELLER_HUT_API_URL || 'https://cellerhut-api.vercel.app';

// Test configuration
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

const testResults = { passed: 0, failed: 0, total: 0 };

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logTest(testName, passed, message) {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  const color = passed ? colors.green : colors.red;
  log(`${status} ${testName}`, color);
  if (message) {
    log(`    ${message}`, colors.yellow);
  }

  testResults.total++;
  if (passed) {
    testResults.passed++;
  } else {
    testResults.failed++;
  }
}

// Test 1: Health Check
async function testHealthCheck() {
  try {
    const response = await axios.get(`${CELLER_HUT_API_URL}/health`, {
      timeout: 5000,
    });
    const isHealthy = response.status === 200;
    logTest(
      'Health Check',
      isHealthy,
      isHealthy ? 'API is responding' : 'API is not responding',
    );
  } catch (error) {
    logTest('Health Check', false, `Error: ${error.message}`);
  }
}

// Test 2: Basic API Connection
async function testBasicConnection() {
  try {
    const response = await axios.get(`${CELLER_HUT_API_URL}/products`, {
      params: { limit: 1 },
      timeout: 10000,
    });

    const hasData =
      response.data &&
      (response.data.status === 'success' || response.data.data);
    logTest(
      'Basic Connection',
      hasData,
      hasData ? 'Successfully connected to API' : 'No data received',
    );
  } catch (error) {
    logTest('Basic Connection', false, `Error: ${error.message}`);
  }
}

// Test 3: Response Format Validation
async function testResponseFormat() {
  try {
    const response = await axios.get(`${CELLER_HUT_API_URL}/categories`, {
      params: { limit: 1 },
      timeout: 10000,
    });

    // Check if response has Celler Hut wrapper format
    const hasValidFormat =
      response.data &&
      response.data.status === 'success' &&
      response.data.data !== undefined;
    logTest(
      'Response Format',
      hasValidFormat,
      hasValidFormat
        ? 'Celler Hut wrapper format detected'
        : 'Unexpected response format',
    );
  } catch (error) {
    logTest('Response Format', false, `Error: ${error.message}`);
  }
}

// Test 4: Error Handling
async function testErrorHandling() {
  try {
    await axios.get(`${CELLER_HUT_API_URL}/invalid-endpoint-12345`);
    logTest(
      'Error Handling',
      false,
      'Should have thrown an error for invalid endpoint',
    );
  } catch (error) {
    const hasProperError = error.response && error.response.status >= 400;
    logTest(
      'Error Handling',
      hasProperError,
      hasProperError
        ? 'Error handling working correctly'
        : 'Poor error handling',
    );
  }
}

// Test 5: Authentication Test (without credentials)
async function testAuthenticationFlow() {
  try {
    await axios.get(`${CELLER_HUT_API_URL}/auth/me`);
    logTest(
      'Authentication Flow',
      false,
      'Should have required authentication',
    );
  } catch (error) {
    const isAuthError =
      error.response &&
      (error.response.status === 401 || error.response.status === 403);
    logTest(
      'Authentication Flow',
      isAuthError,
      isAuthError
        ? 'Authentication required (correct)'
        : 'Unexpected error type',
    );
  }
}

// Test 6: Rate Limiting
async function testRateLimiting() {
  try {
    // Make multiple requests quickly to test rate limiting
    const requests = Array.from({ length: 3 }, () =>
      axios.get(`${CELLER_HUT_API_URL}/products`, { params: { limit: 1 } }),
    );

    await Promise.all(requests);
    logTest(
      'Rate Limiting',
      true,
      'Multiple requests successful (within limits)',
    );
  } catch (error) {
    const isRateLimited = error.response && error.response.status === 429;
    logTest(
      'Rate Limiting',
      isRateLimited,
      isRateLimited ? 'Rate limiting detected' : 'Unexpected error',
    );
  }
}

// Run all tests
async function runTests() {
  log('\n🧪 Celler Hut API Integration Tests', colors.blue);
  log('='.repeat(50), colors.blue);
  log(`Testing API: ${CELLER_HUT_API_URL}`, colors.yellow);
  log('='.repeat(50), colors.blue);

  await testHealthCheck();
  await testBasicConnection();
  await testResponseFormat();
  await testErrorHandling();
  await testAuthenticationFlow();
  await testRateLimiting();

  log('\n📊 Test Summary', colors.blue);
  log('='.repeat(50), colors.blue);
  log(`Total: ${testResults.total}`, colors.blue);
  log(`Passed: ${testResults.passed}`, colors.green);
  log(`Failed: ${testResults.failed}`, colors.red);

  const successRate = ((testResults.passed / testResults.total) * 100).toFixed(
    1,
  );
  log(`Success Rate: ${successRate}%`, colors.yellow);

  if (testResults.failed === 0) {
    log(
      '\n🎉 All tests passed! Celler Hut integration is ready.',
      colors.green,
    );
  } else {
    log(
      `\n⚠️  ${testResults.failed} test(s) failed. Please check the issues above.`,
      colors.red,
    );
  }

  log('\n📋 Next Steps:', colors.blue);
  log('1. Run: npm install axios (if not already installed)', colors.yellow);
  log(
    '2. Test with credentials: node celler-hut-test.js --auth',
    colors.yellow,
  );
  log('3. Check API documentation for any endpoint changes', colors.yellow);
}

// Manual test function for authenticated endpoints
async function testWithCredentials() {
  const email = process.env.TEST_EMAIL;
  const password = process.env.TEST_PASSWORD;

  if (!email || !password) {
    log(
      '\n⚠️  Set TEST_EMAIL and TEST_PASSWORD environment variables for auth tests',
      colors.yellow,
    );
    return;
  }

  log('\n🔐 Testing with credentials...', colors.blue);

  try {
    // Test login
    const loginResponse = await axios.post(`${CELLER_HUT_API_URL}/auth/login`, {
      email,
      password,
    });

    if (
      loginResponse.data &&
      loginResponse.data.data &&
      loginResponse.data.data.token
    ) {
      log('✅ Login successful', colors.green);
      const token = loginResponse.data.data.token;

      // Test authenticated endpoint
      const profileResponse = await axios.get(`${CELLER_HUT_API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const hasProfile =
        profileResponse.data &&
        profileResponse.data.data &&
        profileResponse.data.data.id;
      log(
        `${hasProfile ? '✅' : '❌'} Profile fetch ${
          hasProfile ? 'successful' : 'failed'
        }`,
        hasProfile ? colors.green : colors.red,
      );

      // Test logout
      await axios.post(
        `${CELLER_HUT_API_URL}/auth/logout`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      log('✅ Logout successful', colors.green);
    } else {
      log('❌ Login failed - no token received', colors.red);
    }
  } catch (error) {
    log(`❌ Authentication test failed: ${error.message}`, colors.red);
  }
}

// Check if script is run with --auth flag
const args = process.argv.slice(2);
const testAuth = args.includes('--auth');

// Run tests
runTests()
  .then(() => {
    if (testAuth) {
      return testWithCredentials();
    }
  })
  .catch(console.error);
