const dns = require('dns');
// Set public DNS servers to resolve Windows SRV query issues
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoose = require('mongoose');

let isConnected = false;

/**
 * Configure and establish MongoDB connection with managed connection pool
 */
async function connectDB() {
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  let mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/campusbuddy';

  // Handle special characters like '@' in MongoDB passwords
  if (mongoUri && mongoUri.startsWith('mongodb')) {
    const match = mongoUri.match(/^(mongodb(?:\+srv)?:\/\/[^:]+:)(.+)(@[^@]+)$/);
    if (match) {
      const prefix = match[1];
      const rawPassword = decodeURIComponent(match[2]);
      const suffix = match[3];
      mongoUri = `${prefix}${encodeURIComponent(rawPassword)}${suffix}`;
    }
  }

  // Controlled pool settings suited for MongoDB Atlas M0 (max 500 connections)
  // Default maxPoolSize raised to 50 for improved concurrent database throughput
  const maxPoolSize = parseInt(process.env.MONGO_MAX_POOL_SIZE || '50', 10);
  const minPoolSize = parseInt(process.env.MONGO_MIN_POOL_SIZE || '10', 10);

  const options = {
    maxPoolSize,              // Managed pool size suited for Atlas M0 (max 500 connections)
    minPoolSize,              // Keeps warm connections ready to eliminate handshakes
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    heartbeatFrequencyMS: 10000,
    maxIdleTimeMS: 30000,
    autoIndex: true           // Synchronize schema indexes
  };

  try {
    await mongoose.connect(mongoUri, options);
    isConnected = true;
    console.log(`✅ Connected to MongoDB Atlas Database successfully with managed connection pool (maxPoolSize: ${maxPoolSize})!`);

    // Attach lifecycle event listeners
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB Connection Error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      isConnected = false;
      console.warn('⚠️ MongoDB disconnected. Attempting automatic reconnection...');
    });

    mongoose.connection.on('reconnected', () => {
      isConnected = true;
      console.log('🔄 MongoDB reconnected successfully.');
    });

    return mongoose.connection;
  } catch (err) {
    console.error('❌ Initial MongoDB Connection Failed:', err.message);
    throw err;
  }
}

/**
 * Graceful shutdown handler
 */
async function closeDB() {
  if (mongoose.connection.readyState !== 0) {
    console.log('Closing MongoDB connection pool...');
    await mongoose.connection.close(false);
    isConnected = false;
    console.log('MongoDB connection pool cleanly terminated.');
  }
}

module.exports = {
  connectDB,
  closeDB,
  getConnection: () => mongoose.connection,
  isReady: () => mongoose.connection.readyState === 1
};
