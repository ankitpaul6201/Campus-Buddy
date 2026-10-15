const express = require('express');
const router = express.Router();
const db = require('../config/db');
const cacheService = require('../cache/cacheService');
const { getSystemMetrics } = require('../middleware/performance');
const { getKeepAliveStatus } = require('../services/keepAliveService');

// Liveness check (instant response for load balancers and anti-sleep supervisor)
router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Campus Buddy API Server',
    keepAlive: getKeepAliveStatus(),
    timestamp: new Date().toISOString()
  });
});

// Readiness check (verifies database connectivity)
router.get('/ready', (req, res) => {
  const ready = db.isReady();
  if (ready) {
    return res.json({
      status: 'ready',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  }
  return res.status(503).json({
    status: 'not_ready',
    database: 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Performance & Telemetry metrics
router.get('/metrics', (req, res) => {
  res.json({
    system: getSystemMetrics(),
    cache: cacheService.getMetrics(),
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
