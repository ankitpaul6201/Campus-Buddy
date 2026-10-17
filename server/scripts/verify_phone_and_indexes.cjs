const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const User = require('../models/User');

async function test() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB.');

    const col = mongoose.connection.db.collection('users');

    // 1. Check indexes
    const indexes = await col.indexes();
    console.log('\n--- VERIFYING INDEXES ---');
    console.log('Indexes on users collection:', indexes.map(i => i.name));
    const hasPhoneIndex = indexes.some(i => i.name === 'phone_1' || i.key?.phone === 1);
    const hasObsoleteIndex = indexes.some(i => ['clerkId_1', 'dob_1', 'course_1', 'year_1', 'studentYear_1'].includes(i.name) ||
      ['clerkId', 'dob', 'course', 'year', 'studentYear'].some(k => i.key && i.key[k]));

    console.log('Has phone_1 index:', hasPhoneIndex);
    console.log('Has obsolete indexes (clerkId, dob, course, year):', hasObsoleteIndex);

    if (!hasPhoneIndex || hasObsoleteIndex) {
      throw new Error('Index verification failed');
    }

    // 2. Check existing documents
    console.log('\n--- VERIFYING EXISTING USER DOCUMENTS ---');
    const existingUsers = await col.find({}).toArray();
    for (const u of existingUsers) {
      const forbiddenKeys = ['clerkId', 'dob', 'course', 'year'].filter(k => k in u);
      if (forbiddenKeys.length > 0) {
        console.error(`User ${u.email} still has keys:`, forbiddenKeys);
        throw new Error('Found forbidden keys in existing user document');
      }
    }
    console.log(`All ${existingUsers.length} existing users are free of clerkId, dob, course, year.`);

    // 3. Test Account Creation with Phone (simulating post ID verification)
    console.log('\n--- TESTING ACCOUNT CREATION WITH PHONE ---');
    const testEmail = `test_verification_${Date.now()}@example.com`;
    const initialPhone = '9876543210';
    const testUser = new User({
      fullName: 'Test Student',
      email: testEmail,
      password: 'hashed_password_test',
      phone: initialPhone,
      universityName: 'Test University',
      isVerified: true
    });
    await testUser.save();
    console.log(`Saved test user with ID: ${testUser._id} and phone: ${testUser.phone}`);

    // Verify in raw MongoDB
    const rawDoc = await col.findOne({ _id: testUser._id });
    console.log('Raw doc phone:', rawDoc.phone);
    if (rawDoc.phone !== initialPhone) {
      throw new Error(`Phone mismatch: expected ${initialPhone}, got ${rawDoc.phone}`);
    }

    // 4. Test Student Section Phone Change ("Save Changes")
    console.log('\n--- TESTING PHONE CHANGE IN STUDENT SECTION ---');
    const updatedPhone = '9123456789';
    rawDoc.phone = updatedPhone;
    await col.updateOne({ _id: testUser._id }, { $set: { phone: updatedPhone } });

    const updatedRawDoc = await col.findOne({ _id: testUser._id });
    console.log('Updated raw doc phone:', updatedRawDoc.phone);
    if (updatedRawDoc.phone !== updatedPhone) {
      throw new Error(`Updated phone mismatch: expected ${updatedPhone}, got ${updatedRawDoc.phone}`);
    }
    console.log('Old phone successfully deleted and replaced by new phone in MongoDB.');

    // 5. Cleanup test user
    await col.deleteOne({ _id: testUser._id });
    console.log('\nCleaned up test user.');
    console.log('\nALL TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('Test error:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

test();
