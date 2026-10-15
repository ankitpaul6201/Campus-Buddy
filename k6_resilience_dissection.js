import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';

// Dedicated Latency Breakdown Metrics
const cacheHitLatency = new Trend('benchmark_cache_hit_latency');
const coldCacheLatency = new Trend('benchmark_cold_cache_miss_latency');
const authReadLatency = new Trend('benchmark_auth_read_latency');
const dbWriteLatency = new Trend('benchmark_db_write_latency');
const customErrorRate = new Rate('custom_error_rate');
const successfulOperations = new Counter('successful_operations');

export const options = {
  stages: [
    { duration: '10s', target: 50 },   // Warm-up to 50 users
    { duration: '20s', target: 200 },  // Ramp-up to 200 concurrent users
    { duration: '30s', target: 500 },  // Peak load: 500 concurrent virtual users
    { duration: '10s', target: 0 },    // Ramp-down
  ],
  thresholds: {
    'custom_error_rate': ['rate<0.02'],                  // Max 2% error rate under peak load
    'benchmark_cache_hit_latency': ['p(95)<400'],        // Cache hits under mixed write/read load
    'benchmark_cold_cache_miss_latency': ['p(95)<1500'], // Cold DB reads across Atlas M0 internet roundtrips
    'benchmark_db_write_latency': ['p(95)<2500'],        // Full DB writes under concurrency
  },
};

const BASE_URL = __ENV.TARGET_URL || 'http://localhost:5000';

// Global setup: Create dedicated test user to obtain valid JWT token for writes
export function setup() {
  const testUser = {
    name: 'Load Test Bot',
    email: `load_test_${Date.now()}@campus.edu`,
    password: 'Password123!',
    universityName: 'Thapar Institute'
  };

  const res = http.post(`${BASE_URL}/api/auth/signup`, JSON.stringify(testUser), {
    headers: { 'Content-Type': 'application/json', 'X-Load-Test': 'k6' }
  });

  const body = JSON.parse(res.body || '{}');
  return { token: body.token || null, userId: body.user?._id || null };
}

export default function (data) {
  const token = data.token;

  // 1. CACHE-HIT PERFORMANCE (Warm cache, sub-millisecond expected)
  group('1. Cache-Hit Query', function () {
    const res = http.get(`${BASE_URL}/api/products`, {
      headers: {
        'Accept': 'application/json',
        'X-Load-Test': 'k6'
      }
    });
    cacheHitLatency.add(res.timings.duration);

    const pass = check(res, {
      'cache hit is 200': (r) => r.status === 200,
      'response has products': (r) => {
        try {
          return Array.isArray(JSON.parse(r.body));
        } catch {
          return false;
        }
      }
    });
    if (!pass) customErrorRate.add(1);
    else successfulOperations.add(1);
  });

  sleep(0.2);

  // 2. COLD-CACHE / CACHE-MISS PERFORMANCE (Bypass header forces fresh MongoDB Atlas execution)
  group('2. Cold-Cache / Uncached DB Read', function () {
    const res = http.get(`${BASE_URL}/api/products?university=Thapar`, {
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Cache-Bypass': 'true',
        'X-Load-Test': 'k6'
      }
    });
    coldCacheLatency.add(res.timings.duration);

    const pass = check(res, {
      'cold DB query is 200': (r) => r.status === 200,
      'cold DB returns valid array': (r) => {
        try {
          return Array.isArray(JSON.parse(r.body));
        } catch {
          return false;
        }
      }
    });
    if (!pass) customErrorRate.add(1);
    else successfulOperations.add(1);
  });

  sleep(0.3);

  // 3. AUTHENTICATED USER PERFORMANCE (User profile + My Ads query)
  if (token) {
    group('3. Authenticated DB Read', function () {
      const res = http.get(`${BASE_URL}/api/products/my-ads`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'X-Load-Test': 'k6'
        }
      });
      authReadLatency.add(res.timings.duration);

      const pass = check(res, {
        'auth my-ads is 200': (r) => r.status === 200,
      });
      if (!pass) customErrorRate.add(1);
      else successfulOperations.add(1);
    });
  }

  sleep(0.3);

  // 4. DATABASE-BACKED WRITE PERFORMANCE (Real document insertion with validation)
  // Run on a proportion of users to simulate realistic write-to-read ratios (~1 write per 10 reads)
  if (token && (__VU % 5 === 0) && (__ITER % 2 === 0)) {
    group('4. Database Write Transaction', function () {
      const payload = JSON.stringify({
        title: `VU_${__VU}_Listing_${Date.now()}`,
        description: 'Automated performance resilience test item',
        price: 350,
        category: 'Electronics & Gadgets',
        condition: 'Like New',
        location: 'Hostel Block C',
        images: ['https://res.cloudinary.com/demo/image/upload/sample.jpg']
      });

      const writeRes = http.post(`${BASE_URL}/api/products`, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Load-Test': 'k6'
        }
      });
      dbWriteLatency.add(writeRes.timings.duration);

      let createdId = null;
      try {
        const doc = JSON.parse(writeRes.body);
        createdId = doc._id;
      } catch {}

      const passWrite = check(writeRes, {
        'product write status is 201': (r) => r.status === 201,
        'product has valid MongoDB _id': () => Boolean(createdId),
      });

      if (!passWrite) {
        customErrorRate.add(1);
      } else {
        successfulOperations.add(1);

        // Immediate cleanup: Delete the newly created product so test doesn't bloat DB
        if (createdId) {
          http.del(`${BASE_URL}/api/products/${createdId}`, null, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'X-Load-Test': 'k6'
            }
          });
        }
      }
    });
  }

  sleep(0.4);
}
