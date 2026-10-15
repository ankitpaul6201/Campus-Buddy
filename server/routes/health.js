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

// Diagnostic check to verify if email environment variables are loaded on Render
router.get('/email-status', (req, res) => {
  const user = process.env.EMAIL_USER || process.env.SMTP_USER || '';
  const pass = process.env.EMAIL_PASS || process.env.SMTP_PASS || '';
  const resend = process.env.RESEND_API_KEY || '';

  res.json({
    emailConfigured: Boolean(user && pass),
    emailUser: user ? user.slice(0, 3) + '***@' + user.split('@')[1] : null,
    hasPassword: Boolean(pass),
    hasResend: Boolean(resend)
  });
});

// Test email delivery directly from Render and return raw error/success
router.get('/test-email', async (req, res) => {
  const emailService = require('../services/emailService');
  const targetEmail = req.query.to || 'ankitpaul6201@gmail.com';
  try {
    const result = await emailService.sendVerificationCode({
      to: targetEmail,
      code: '777888',
      name: 'Ankit Test'
    });
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, stack: err.stack });
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
