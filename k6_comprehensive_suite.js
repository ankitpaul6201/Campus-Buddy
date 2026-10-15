import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';

// Custom Telemetry Metrics
const marketplaceLatency = new Trend('marketplace_home_latency');
const productCatalogLatency = new Trend('product_catalog_latency');
const uniSearchLatency = new Trend('university_search_latency');
const healthLatency = new Trend('health_ready_latency');
const customErrorRate = new Rate('custom_error_rate');
const successfulTransactions = new Counter('successful_transactions');

export const options = {
  stages: [
    { duration: '10s', target: 50 },   // Scenario 1: 50 concurrent users
    { duration: '15s', target: 100 },  // Scenario 2: 100 concurrent users
    { duration: '20s', target: 250 },  // Scenario 3: 250 concurrent users
    { duration: '25s', target: 500 },  // Scenario 4: 500 concurrent users (target benchmark)
    { duration: '15s', target: 750 },  // Scenario 5: 750 concurrent users stress peak
    { duration: '10s', target: 0 },    // Graceful ramp-down
  ],
  thresholds: {
    'custom_error_rate': ['rate<0.01'],         // Error rate must remain below 1%
    'http_req_duration': ['p(95)<1000'],        // 95% of requests under 1s
    'marketplace_home_latency': ['p(95)<300'],  // Aggregated home screen < 300ms
    'product_catalog_latency': ['p(95)<200'],   // Product catalog retrieval < 200ms
  },
};

const BASE_URL = __ENV.TARGET_URL || 'http://localhost:5000';

const standardHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'X-Load-Test': 'k6'
};

export default function () {
  // 1. Health & Readiness
  group('Health & Readiness', function () {
    const res = http.get(`${BASE_URL}/api/health/ready`, { headers: standardHeaders });
    healthLatency.add(res.timings.duration);
    const pass = check(res, {
      'readiness is 200': (r) => r.status === 200,
    });
    if (!pass) customErrorRate.add(1);
    else successfulTransactions.add(1);
  });

  sleep(0.3);

  // 2. Aggregated Marketplace Home Screen (Single-request screen payload)
  group('Marketplace Home', function () {
    const res = http.get(`${BASE_URL}/api/marketplace/home`, { headers: standardHeaders });
    marketplaceLatency.add(res.timings.duration);
    const pass = check(res, {
      'marketplace status is 200': (r) => r.status === 200,
      'has products array': (r) => {
        try {
          const body = JSON.parse(r.body);
          return Array.isArray(body.products);
        } catch {
          return false;
        }
      }
    });
    if (!pass) customErrorRate.add(1);
    else successfulTransactions.add(1);
  });

  sleep(0.4);

  // 3. Product Catalog with Filters & Pagination
  group('Product Catalog', function () {
    const universities = ['Campus', 'Engineering', 'Tech', 'University'];
    const randomUni = universities[Math.floor(Math.random() * universities.length)];
    const res = http.get(`${BASE_URL}/api/products?university=${randomUni}`, { headers: standardHeaders });
    productCatalogLatency.add(res.timings.duration);
    const pass = check(res, {
      'products query is 200': (r) => r.status === 200,
      'products is array': (r) => {
        try {
          return Array.isArray(JSON.parse(r.body));
        } catch {
          return false;
        }
      }
    });
    if (!pass) customErrorRate.add(1);
    else successfulTransactions.add(1);
  });

  sleep(0.3);

  // 4. University / College Directory Search (with In-Memory Caching)
  group('University Search', function () {
    const queries = ['sviet', 'cu', 'delhi', 'punjab', 'tech'];
    const randomQ = queries[Math.floor(Math.random() * queries.length)];
    const res = http.get(`${BASE_URL}/api/universities?q=${randomQ}`, { headers: standardHeaders });
    uniSearchLatency.add(res.timings.duration);
    const pass = check(res, {
      'uni search status is 200': (r) => r.status === 200,
    });
    if (!pass) customErrorRate.add(1);
    else successfulTransactions.add(1);
  });

  sleep(0.5);
}
