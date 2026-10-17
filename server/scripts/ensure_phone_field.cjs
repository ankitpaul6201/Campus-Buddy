const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function ensurePhoneField() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const col = mongoose.connection.db.collection('users');

    // Unset course, dob, year, clerkId from all documents in users collection
    const unsetRes = await col.updateMany({}, {
      $unset: {
        course: '',
        dob: '',
        year: '',
        clerkId: '',
        studentYear: '',
        studentCurrentYear: ''
      }
    });
    console.log('Unset obsolete fields result:', unsetRes);

    // Update all user documents that don't have a phone field or have null/undefined phone
    const res = await col.updateMany(
      { phone: { $exists: false } },
      { $set: { phone: '' } }
    );
    console.log('Updated documents missing phone field:', res);

    const users = await col.find({}).toArray();
    console.log('\nAll users in MongoDB now:');
    users.forEach(u => {
      console.log(`- ${u.fullName} (${u.email}) -> phone: "${u.phone}"`);
    });

  } catch (err) {
    console.error('Error ensuring phone field:', err);
  } finally {
    await mongoose.disconnect();
  }
}

ensurePhoneField();
