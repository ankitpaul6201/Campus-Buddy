const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Conversation = require('../models/Conversation');

async function testChatDeduplication() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB.');

    const convCol = mongoose.connection.db.collection('conversations');
    const allConvs = await convCol.find({}).toArray();
    console.log('\n--- VERIFYING CLEAN CONVERSATIONS IN DB ---');
    console.log(`Current conversation count: ${allConvs.length}`);
    allConvs.forEach(c => {
      console.log(`- Conv ID: ${c._id} | Product: ${c.product} | LastMsg: "${c.lastMessage}" | Messages: ${c.messages.length}`);
    });

    if (allConvs.length > 1) {
      // Check if duplicate participants + product exists
      const seen = new Set();
      for (const c of allConvs) {
        const parts = (c.participants || []).map(String).sort().join('_');
        const key = `${parts}_${c.product}`;
        if (seen.has(key)) {
          throw new Error(`Duplicate conversation found in DB for key: ${key}`);
        }
        seen.add(key);
      }
    }

    console.log('\nSUCCESS: Database conversations are clean and duplicate-free!');
  } catch (err) {
    console.error('Test error:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

testChatDeduplication();
