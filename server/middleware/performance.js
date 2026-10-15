const crypto = require('crypto');
const { monitorEventLoopDelay } = require('perf_hooks');
const mongoose = require('mongoose');

// Event Loop Delay Monitor
let eventLoopHistogram;
try {
  eventLoopHistogram = monitorEventLoopDelay({ resolution: 20 });
  eventLoopHistogram.enable();
} catch (e) {
  // If not supported on specific node version
}

// Global metrics accumulator
const metrics = {
  totalRequests: 0,
  activeRequests: 0,
  errorCount: 0,
  statusCodes: {},
  latencies: [], // Rolling buffer of recent latencies
  maxLatencyBuffer: 1000,
  startTime: Date.now()
};

/**
 * Performance & Correlation Middleware
 * Attaches unique request IDs and tracks request duration & throughput
 */
function performanceMiddleware(req, res, next) {
  metrics.totalRequests++;
  metrics.activeRequests++;

  const correlationId = req.headers['x-correlation-id'] || crypto.randomUUID();
  req.correlationId = correlationId;
  res.setHeader('X-Correlation-Id', correlationId);

  const start = process.hrtime();

  res.on('finish', () => {
    metrics.activeRequests = Math.max(0, metrics.activeRequests - 1);

    const [seconds, nanoseconds] = process.hrtime(start);
    const durationMs = (seconds * 1000 + nanoseconds / 1e6);

    // Track status codes
    const code = res.statusCode;
    metrics.statusCodes[code] = (metrics.statusCodes[code] || 0) + 1;
    if (code >= 400 && code !== 401 && code !== 404) {
      metrics.errorCount++;
    }

    // Keep rolling sample of latencies for percentile calculations
    if (metrics.latencies.length >= metrics.maxLatencyBuffer) {
      metrics.latencies.shift();
    }
    metrics.latencies.push(durationMs);
  });

  next();
}

/**
 * Calculate p50, p90, p95, p99 latencies
 */
function getCalculatedPercentiles() {
  if (metrics.latencies.length === 0) {
    return { p50: '0ms', p90: '0ms', p95: '0ms', p99: '0ms', avg: '0ms' };
  }

  const sorted = [...metrics.latencies].sort((a, b) => a - b);
  const getP = (p) => {
    const idx = Math.floor((p / 100) * (sorted.length - 1));
    return Number(sorted[idx].toFixed(2));
  };

  const avg = Number((sorted.reduce((a, b) => a + b, 0) / sorted.length).toFixed(2));

  return {
    sampleCount: sorted.length,
    avg: `${avg}ms`,
    p50: `${getP(50)}ms`,
    p90: `${getP(90)}ms`,
    p95: `${getP(95)}ms`,
    p99: `${getP(99)}ms`
  };
}

/**
 * System and resource telemetry
 */
function getSystemMetrics() {
  const mem = process.memoryUsage();
  const uptimeSec = Math.floor((Date.now() - metrics.startTime) / 1000);

  // Event loop lag metrics
  let eventLoopLag = 'N/A';
  if (eventLoopHistogram) {
    eventLoopLag = {
      p50: `${(eventLoopHistogram.percentile(50) / 1e6).toFixed(2)}ms`,
      p95: `${(eventLoopHistogram.percentile(95) / 1e6).toFixed(2)}ms`,
      p99: `${(eventLoopHistogram.percentile(99) / 1e6).toFixed(2)}ms`,
      mean: `${(eventLoopHistogram.mean / 1e6).toFixed(2)}ms`
    };
  }

  // Database Connection Pool Status
  const dbState = mongoose.connection.readyState;
  const dbStatus = ['disconnected', 'connected', 'connecting', 'disconnecting'][dbState] || 'unknown';

  return {
    uptime: `${uptimeSec}s`,
    totalRequests: metrics.totalRequests,
    activeRequests: metrics.activeRequests,
    errorCount: metrics.errorCount,
    statusCodes: metrics.statusCodes,
    database: {
      status: dbStatus,
      readyState: dbState,
      maxPoolSize: 25,
      minPoolSize: 5
    },
    eventLoopLag,
    memory: {
      rss: `${(mem.rss / 1024 / 1024).toFixed(1)} MB`,
      heapTotal: `${(mem.heapTotal / 1024 / 1024).toFixed(1)} MB`,
      heapUsed: `${(mem.heapUsed / 1024 / 1024).toFixed(1)} MB`,
      external: `${(mem.external / 1024 / 1024).toFixed(1)} MB`
    },
    latency: getCalculatedPercentiles()
  };
}

module.exports = {
  performanceMiddleware,
  getSystemMetrics
};
