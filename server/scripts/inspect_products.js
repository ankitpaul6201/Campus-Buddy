const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('../models/Product');
const User = require('../models/User');

async function inspect() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB Atlas.');

  const users = await User.find({}).lean();
  console.log(`Total Users (${users.length}):`);
  users.forEach(u => console.log(`  User _id: ${u._id}, email: ${u.email}, name: ${u.fullName || u.name}`));

  const products = await Product.find({}).lean();
  console.log(`\nTotal Products (${products.length}):`);
  products.forEach(p => {
    console.log(`  Product _id: ${p._id}, title: "${p.title}", seller: ${p.seller} (type: ${typeof p.seller}), status: ${p.status}`);
  });

  await mongoose.disconnect();
}

inspect().catch(console.error);
