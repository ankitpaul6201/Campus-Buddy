const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const fs = require('fs');
const readline = require('readline');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const College = require('../models/College');

async function importColleges() {
  const jsonlPath = path.join(__dirname, 'colleges.jsonl');
  if (!fs.existsSync(jsonlPath)) {
    console.error('colleges.jsonl not found! Please run parse_colleges.py first.');
    process.exit(1);
  }

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('MONGODB_URI not found in server/.env');
    process.exit(1);
  }

  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(mongoUri);
  console.log('Connected to database:', mongoose.connection.name);

  // Check current count
  const existingCount = await College.countDocuments();
  console.log(`Current colleges in collection: ${existingCount}`);

  // Drop collection or clear it if needed to have a clean, fresh import
  if (existingCount > 0) {
    console.log('Clearing existing colleges in collection for clean import...');
    await College.collection.drop().catch(() => {});
  }

  console.log('Starting streaming import of ~54,244 colleges into "colleges" collection...');
  const fileStream = fs.createReadStream(jsonlPath, { encoding: 'utf-8' });
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let batch = [];
  const BATCH_SIZE = 2000;
  let totalImported = 0;
  const startTime = Date.now();

  for await (const line of rl) {
    if (!line.trim()) continue;
    try {
      const item = JSON.parse(line);
      const slug = (item.name || '')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 100);

      batch.push({
        aisheCode: item.aisheCode || '',
        name: item.name || '',
        rawName: item.rawName || '',
        slug: slug,
        state: item.state || '',
        district: item.district || '',
        city: item.city || item.district || '',
        website: item.website || '',
        yearOfEstablishment: item.yearOfEstablishment || '',
        location: item.location || '',
        collegeType: item.collegeType || '',
        management: item.management || '',
        universityAisheCode: item.universityAisheCode || '',
        universityName: item.universityName || '',
        universityType: item.universityType || '',
        country: 'India'
      });

      if (batch.length >= BATCH_SIZE) {
        await College.insertMany(batch, { ordered: false });
        totalImported += batch.length;
        console.log(`Imported ${totalImported} colleges... (${((Date.now() - startTime) / 1000).toFixed(1)}s)`);
        batch = [];
      }
    } catch (parseErr) {
      console.warn('Skipping malformed line:', parseErr.message);
    }
  }

  if (batch.length > 0) {
    await College.insertMany(batch, { ordered: false });
    totalImported += batch.length;
    console.log(`Imported final batch. Total: ${totalImported} colleges.`);
  }

  console.log('Building indexes on "colleges" collection...');
  await College.createIndexes();
  console.log('Indexes built successfully!');

  const finalCount = await College.countDocuments();
  console.log(`\n🎉 Success! Total colleges in MongoDB collection "colleges": ${finalCount}`);
  console.log(`Time taken: ${((Date.now() - startTime) / 1000).toFixed(1)} seconds.`);

  await mongoose.disconnect();
  process.exit(0);
}

importColleges().catch(err => {
  console.error('Import failed:', err);
  process.exit(1);
});
