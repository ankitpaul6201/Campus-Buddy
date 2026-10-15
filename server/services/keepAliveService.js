/**
 * Campus Buddy Production Keep-Alive & Anti-Sleep Service
 * 
 * Free-tier cloud providers (Render, Koyeb, Glitch) automatically put backend instances
 * to sleep after 15 minutes of inbound HTTP inactivity.
 * 
 * This service monitors incoming traffic:
 * If no requests are received for 9 minutes, it automatically dispatches an HTTP/HTTPS GET
 * ping to the public health check endpoint (/api/health), resetting the host's 15-minute countdown.
 */

const http = require('http');
const https = require('https');

let lastActivityTime = Date.now();
let keepAliveTimer = null;
let currentPort = 5000;

/**
 * Express middleware to record client activity
 */
function recordActivity(req, res, next) {
  // Ignore keep-alive self-pings so genuine idle time is accurately measured
  if (req.headers['user-agent'] !== 'CampusBuddy-KeepAlive/1.0') {
    lastActivityTime = Date.now();
  }
  next();
}

/**
 * Dispatch an HTTP/HTTPS ping to keep the host awake
 */
function pingServer(targetUrl) {
  return new Promise((resolve, reject) => {
    try {
      const parsedUrl = new URL(targetUrl.endsWith('/api/health') ? targetUrl : `${targetUrl}/api/health`);
      const client = parsedUrl.protocol === 'https:' ? https : http;

      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
        path: parsedUrl.pathname,
        method: 'GET',
        timeout: 10000,
        headers: {
          'User-Agent': 'CampusBuddy-KeepAlive/1.0',
          'x-keep-alive': 'true'
        }
      };

      const req = client.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 400) {
            resolve({ statusCode: res.statusCode, url: targetUrl });
          } else {
            reject(new Error(`Keep-alive ping returned status ${res.statusCode}`));
          }
        });
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Keep-alive ping timed out after 10s'));
      });

      req.on('error', (err) => {
        reject(err);
      });

      req.end();
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Resolve target URL:
 * 1. BACKEND_URL from environment
 * 2. RENDER_EXTERNAL_URL (automatically populated by Render.com in production)
 * 3. Local fallback loopback
 */
function getTargetUrl() {
  if (process.env.BACKEND_URL && process.env.BACKEND_URL.trim()) {
    return process.env.BACKEND_URL.trim().replace(/\/$/, '');
  }
  if (process.env.RENDER_EXTERNAL_URL && process.env.RENDER_EXTERNAL_URL.trim()) {
    return process.env.RENDER_EXTERNAL_URL.trim().replace(/\/$/, '');
  }
  if (process.env.APP_URL && process.env.APP_URL.trim()) {
    return process.env.APP_URL.trim().replace(/\/$/, '');
  }
  return `http://127.0.0.1:${currentPort}`;
}

/**
 * Initialize background anti-sleep supervisor
 * @param {number} port Active server port
 * @param {number} idleThresholdMinutes Threshold of inactivity before self-ping (default: 9 min)
 */
function initKeepAlive(port = 5000, idleThresholdMinutes = 9) {
  currentPort = port;
  const idleThresholdMs = idleThresholdMinutes * 60 * 1000;

  if (keepAliveTimer) {
    clearInterval(keepAliveTimer);
  }

  const targetUrl = getTargetUrl();
  console.log(`📡 Anti-Sleep Keep-Alive initialized (Threshold: ${idleThresholdMinutes}m, Target: ${targetUrl})`);

  // Check every 60 seconds
  keepAliveTimer = setInterval(async () => {
    const idleTime = Date.now() - lastActivityTime;

    if (idleTime >= idleThresholdMs) {
      const minutesIdle = (idleTime / (60 * 1000)).toFixed(1);
      const url = getTargetUrl();

      try {
        await pingServer(url);
        lastActivityTime = Date.now();
        console.log(`[KeepAlive] ⏰ Idle for ${minutesIdle}m: Self-ping sent to ${url}/api/health (200 OK). Sleep prevented.`);
      } catch (err) {
        console.warn(`[KeepAlive] ⚠️ Ping to ${url}/api/health failed: ${err.message}`);
      }
    }
  }, 60000);

  if (keepAliveTimer.unref) {
    keepAliveTimer.unref();
  }
}

function getKeepAliveStatus() {
  const idleSeconds = Math.floor((Date.now() - lastActivityTime) / 1000);
  return {
    lastActivity: new Date(lastActivityTime).toISOString(),
    idleSeconds,
    idleMinutes: (idleSeconds / 60).toFixed(1),
    targetUrl: getTargetUrl()
  };
}

module.exports = {
  recordActivity,
  initKeepAlive,
  getKeepAliveStatus
};
