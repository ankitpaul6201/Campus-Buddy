const express = require('express');
const router = express.Router();
const db = require('../config/db');
const cacheService = require('../cache/cacheService');
const { getSystemMetrics } = require('../middleware/performance');

// Liveness check (instant response for load balancers and health monitoring)
router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Campus Buddy API Server',
    timestamp: new Date().toISOString()
  });
});

// Diagnostic check to verify if email service is configured safely
router.get('/email-status', (req, res) => {
  const user = process.env.EMAIL_USER || process.env.SMTP_USER || '';
  const pass = process.env.EMAIL_PASS || process.env.SMTP_PASS || '';

  res.json({
    emailConfigured: Boolean(user && pass),
    provider: 'smtp'
  });
});

// Diagnostic email delivery - restricted to non-production only to eliminate open relay abuse
router.get('/test-email', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Diagnostic endpoint disabled in production.' });
  }

  const emailService = require('../services/emailService');
  const configuredUser = process.env.EMAIL_USER;
  if (!configuredUser) {
    return res.status(500).json({ error: 'EMAIL_USER is not configured.' });
  }

  // Restrict destination strictly to configured sender to eliminate open relay abuse
  try {
    const result = await emailService.sendVerificationCode({
      to: configuredUser,
      code: '777888',
      name: 'Diagnostic Test'
    });
    res.json({ success: true, message: 'Diagnostic test email dispatched successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
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
