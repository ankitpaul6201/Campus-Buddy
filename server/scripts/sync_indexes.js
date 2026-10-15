const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

const Product = require('../models/Product');
const Conversation = require('../models/Conversation');
const User = require('../models/User');

async function syncIndexes() {
  const mongoUri = process.env.MONGODB_URI;
  console.log('Connecting to MongoDB Atlas to build & sync indexes...');
  await mongoose.connect(mongoUri);

  console.log('Building Product indexes...');
  await Product.syncIndexes();
  const productIndexes = await Product.collection.indexes();
  console.log('Product indexes synced successfully:');
  console.log(JSON.stringify(productIndexes.map(i => ({ name: i.name, key: i.key })), null, 2));

  console.log('Building Conversation indexes...');
  await Conversation.syncIndexes();
  const convIndexes = await Conversation.collection.indexes();
  console.log('Conversation indexes synced successfully:');
  console.log(JSON.stringify(convIndexes.map(i => ({ name: i.name, key: i.key })), null, 2));

  // Run explain plan on find active products
  console.log('\nVerifying index with explain("executionStats")...');
  const explain = await Product.collection
    .find({ status: 'active' })
    .sort({ createdAt: -1 })
    .explain('executionStats');

  console.log('Query execution stage:', explain.executionStats.executionStages.stage);
  console.log('Index used:', explain.executionStats.executionStages.inputStage?.indexName || 'N/A');
  console.log('Total docs examined:', explain.executionStats.totalDocsExamined);
  console.log('Execution time (ms):', explain.executionStats.executionTimeMillis);

  await mongoose.disconnect();
  console.log('Index synchronization complete.');
}

syncIndexes().catch(err => {
  console.error('Error syncing indexes:', err);
  process.exit(1);
});
