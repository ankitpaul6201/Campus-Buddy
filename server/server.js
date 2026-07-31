const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { clerkMiddleware } = require('@clerk/express');
require('dotenv').config();

const app = express();

// CORS — allow requests from any origin (mobile apps, web, any network)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));

// Clerk middleware — must be before routes so req.auth is populated on all requests
app.use(clerkMiddleware());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'Campus Buddy API Server', timestamp: new Date() });
});

const PORT = process.env.PORT || 5000;
let mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/campusbuddy';

// Automatically handle special characters like '@' in MongoDB passwords
if (mongoUri && mongoUri.startsWith('mongodb')) {
  const match = mongoUri.match(/^(mongodb(?:\+srv)?:\/\/[^:]+:)(.+)(@[^@]+)$/);
  if (match) {
    const prefix = match[1];
    const rawPassword = decodeURIComponent(match[2]);
    const suffix = match[3];
    mongoUri = `${prefix}${encodeURIComponent(rawPassword)}${suffix}`;
  }
}

mongoose.connect(mongoUri)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas Database successfully!');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Campus Buddy Backend Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1); // Exit so Railway/cloud can detect the failure and restart
  });
