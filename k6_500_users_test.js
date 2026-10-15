import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';

// Custom metrics
const productQueryLatency = new Trend('product_query_latency');
const healthCheckLatency = new Trend('health_check_latency');
const authCheckLatency = new Trend('auth_check_latency');
const chatQueryLatency = new Trend('chat_query_latency');
const errorRate = new Rate('custom_error_rate');
const successfulRequests = new Counter('successful_requests');

export const options = {
  stages: [
    { duration: '10s', target: 100 },  // Quick ramp-up to 100 users
    { duration: '20s', target: 500 },  // Ramp-up to 500 concurrent virtual users
    { duration: '30s', target: 500 },  // Peak load: 500 concurrent users active simultaneously
    { duration: '10s', target: 0 },    // Ramp-down
  ],
  thresholds: {
    'custom_error_rate': ['rate<0.01'], // Strict target: less than 1% application error rate
    'http_req_duration': ['p(95)<1000'], // Strict target: 95% of requests complete in < 1s
    'product_query_latency': ['p(95)<500'], // Benchmark target: product catalog latency < 500ms
  },
};

const BASE_URL = __ENV.TARGET_URL || 'http://localhost:5000';

export default function () {
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Load-Test': 'k6'
    },
    timeout: '10s',
  };

  // 1. Health check (Server responsiveness & event loop lag)
  {
    const res = http.get(`${BASE_URL}/api/health`, params);
    healthCheckLatency.add(res.timings.duration);
    const pass = check(res, {
      'health status is 200': (r) => r.status === 200,
    });
    if (!pass) errorRate.add(1);
    else successfulRequests.add(1);
  }

  sleep(0.5);

  // 2. Heavy Read: Fetch all product listings (MongoDB Atlas Query + Mongoose Model Hydration)
  {
    const res = http.get(`${BASE_URL}/api/products`, params);
    productQueryLatency.add(res.timings.duration);
    const pass = check(res, {
      'products status is 200': (r) => r.status === 200,
      'products response is array': (r) => {
        try {
          const body = JSON.parse(r.body);
          return Array.isArray(body);
        } catch {
          return false;
        }
      },
    });
    if (!pass) errorRate.add(1);
    else successfulRequests.add(1);
  }

  sleep(0.8);

  // 3. Filtered Search: Fetch products filtered by campus / university (Regex / Index Lookup)
  {
    const universities = ['Campus', 'State', 'College', 'Engineering', 'Tech'];
    const randomUni = universities[Math.floor(Math.random() * universities.length)];
    const res = http.get(`${BASE_URL}/api/products?university=${randomUni}`, params);
    productQueryLatency.add(res.timings.duration);
    const pass = check(res, {
      'university filter status is 200': (r) => r.status === 200,
    });
    if (!pass) errorRate.add(1);
    else successfulRequests.add(1);
  }

  sleep(0.5);

  // 4. Authenticated / Session verification endpoint (JWT verification + DB lookup)
  {
    const authParams = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer dummy_load_test_token_verification',
        'X-Load-Test': 'k6'
      },
      timeout: '10s',
    };
    const res = http.get(`${BASE_URL}/api/auth/me`, authParams);
    authCheckLatency.add(res.timings.duration);
    // 401 (Unauthorized) or 200 is expected for dummy token, but 500/504 is failure
    const pass = check(res, {
      'auth endpoint handles request': (r) => r.status === 401 || r.status === 200,
    });
    if (!pass) errorRate.add(1);
    else successfulRequests.add(1);
  }

  sleep(1);
}
