const http = require('http');
const express = require('express');
const cors = require('cors');
const compression = require('compression');
require('dotenv').config();

const { connectDB, closeDB } = require('./config/db');
const { performanceMiddleware } = require('./middleware/performance');
const { apiLimiter } = require('./middleware/rateLimiter');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { recordActivity, initKeepAlive, getKeepAliveStatus } = require('./services/keepAliveService');
const { initSocket } = require('./services/socketService');

const app = express();
const httpServer = http.createServer(app);

// Initialize real-time Socket.io engine
const io = initSocket(httpServer);

// 1. Anti-Sleep Activity Tracker & Performance Tracking
app.use(recordActivity);
app.use(performanceMiddleware);

// 2. Gzip/Deflate Payload Compression
app.use(compression({
  threshold: 1024, // Compress responses > 1KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  }
}));

// 3. CORS — Secure origin validation supporting Web, Mobile (Capacitor), and Local Dev
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim()) 
  : null;

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (mobile apps, CLI, server-to-server) where origin is undefined
    if (!origin) return callback(null, true);
    
    // Always allow local dev and Capacitor native origins
    if (origin.startsWith('http://localhost') || 
        origin.startsWith('capacitor://localhost') || 
        origin.startsWith('https://localhost') ||
        origin.includes('127.0.0.1') ||
        origin.includes('10.207.19.187')) {
      return callback(null, true);
    }
    
    // Check against configured production domain whitelist if defined
    if (allowedOrigins && allowedOrigins.length > 0) {
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Blocked by CORS policy: Origin not allowed'));
    }

    // Default development fallback
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token', 'x-correlation-id', 'x-cache-bypass', 'cache-control']
}));

// 4. Body Parser with generous limits to support mobile photo uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 5. General API Rate Limiting
app.use('/api', apiLimiter);

// 6. Modular REST API Routes
app.use('/api/health', require('./routes/health'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/marketplace', require('./routes/marketplace'));
app.use('/api/universities', require('./routes/universities'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/notifications', require('./routes/notifications'));

// 7. Root status endpoints (handles both / and /api)
app.get(['/', '/api'], (req, res) => {
  res.json({
    status: 'online',
    app: 'Campus Buddy Backend API',
    version: '2.0.0',
    architecture: 'Modular REST API with Managed Pooling & In-Memory Caching',
    endpoints: {
      health: '/api/health',
      ready: '/api/health/ready',
      metrics: '/api/health/metrics',
      marketplace: '/api/marketplace/home',
      products: '/api/products',
      auth: '/api/auth'
    }
  });
});

// 8. 404 & Centralized Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Start server after connecting to MongoDB
connectDB()
  .then(() => {
    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Campus Buddy High-Performance Server running on http://0.0.0.0:${PORT} (REST + WebSockets)`);
      // Start background keep-alive anti-sleep supervisor (checks every 60s, pings if idle >= 9m)
      initKeepAlive(PORT, 9);
    });
  })
  .catch((err) => {
    console.error('Fatal initialization error:', err.message);
    process.exit(1);
  });

// Graceful shutdown handling
const gracefulShutdown = async (signal) => {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  if (httpServer) {
    httpServer.close(() => {
      console.log('HTTP/WebSocket server closed.');
    });
  }
  await closeDB();
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

module.exports = app;
