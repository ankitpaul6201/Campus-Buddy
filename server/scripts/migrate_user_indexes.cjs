const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function run() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    const col = db.collection('users');

    // List existing indexes
    const existingIndexes = await col.indexes();
    console.log('Current indexes before cleanup:', JSON.stringify(existingIndexes, null, 2));

    // Drop indexes if exist for clerkId, dob, course, year, studentYear, universityId
    for (const idx of existingIndexes) {
      if (idx.name === '_id_' || idx.name === 'email_1') continue;
      const keys = Object.keys(idx.key || {});
      const shouldDrop = ['clerkId_1', 'dob_1', 'course_1', 'year_1', 'studentYear_1', 'universityId_1'].includes(idx.name) ||
        keys.some(k => ['clerkId', 'dob', 'course', 'year', 'studentYear', 'universityId'].includes(k));
      if (shouldDrop) {
        console.log(`Dropping index: ${idx.name}`);
        await col.dropIndex(idx.name);
      }
    }

    // Create index for phone
    console.log('Ensuring index for phone (phone_1)...');
    await col.createIndex({ phone: 1 }, { background: true });

    // Unset clerkId, dob, course, year from all user documents in MongoDB
    console.log('Unsetting clerkId, dob, course, year from all users in MongoDB...');
    const unsetRes = await col.updateMany({}, {
      $unset: {
        clerkId: '',
        dob: '',
        course: '',
        year: '',
        studentYear: '',
        studentCurrentYear: ''
      }
    });
    console.log('Unset result:', unsetRes);

    const updatedIndexes = await col.indexes();
    console.log('Updated indexes in users collection:', JSON.stringify(updatedIndexes, null, 2));

    const sample = await col.find({}).toArray();
    console.log('Updated users sample:');
    sample.forEach(u => {
      console.log(`- ${u.fullName} (${u.email}) | phone: ${u.phone || '<not set>'} | keys: ${Object.keys(u).join(', ')}`);
    });

    console.log('Migration completed successfully!');
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
