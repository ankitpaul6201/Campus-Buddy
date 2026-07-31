const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB.');

    const users = await User.find({});
    console.log('Current Users in Database:');
    users.forEach(u => {
      console.log(`- ID: ${u._id}, Email: ${u.email}, Username: ${u.username}, University: ${u.universityName}, ClerkID: ${u.clerkId}`);
    });

    // If there is a user with 'Campus Member', let's see if we can update them to a university they want
    // (e.g. Stanford University or similar) or update all of them
    const result = await User.updateMany(
      { universityName: 'Campus Member' },
      { $set: { universityName: 'Stanford University' } }
    );
    console.log(`Updated ${result.modifiedCount} users to 'Stanford University'.`);

  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
};

run();
