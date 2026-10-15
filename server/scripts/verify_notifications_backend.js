const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const { connectDB, closeDB } = require('../config/db');
const User = require('../models/User');
const Product = require('../models/Product');
const Notification = require('../models/Notification');
const Conversation = require('../models/Conversation');
const { createAndSendNotification, getUnreadCount } = require('../services/notificationService');

async function runTests() {
  console.log('🧪 Starting Notifications Backend Verification Suite...\n');
  await connectDB();

  let testSeller, testBuyer, testProduct;

  try {
    // 1. Setup test users
    console.log('1. Setting up test users & product...');
    testSeller = await User.findOne({ email: 'seller_notif_test@campus.edu' });
    if (!testSeller) {
      testSeller = await User.create({
        fullName: 'Test Seller',
        email: 'seller_notif_test@campus.edu',
        password: 'hashed_password_123',
        universityName: 'Campus University',
        isVerified: true
      });
    }

    testBuyer = await User.findOne({ email: 'buyer_notif_test@campus.edu' });
    if (!testBuyer) {
      testBuyer = await User.create({
        fullName: 'Test Buyer',
        email: 'buyer_notif_test@campus.edu',
        password: 'hashed_password_123',
        universityName: 'Campus University',
        isVerified: false
      });
    }

    testProduct = await Product.findOne({ title: 'Notification Test Textbook' });
    if (!testProduct) {
      testProduct = await Product.create({
        title: 'Notification Test Textbook',
        description: 'Test Textbook for verification',
        price: 299,
        category: 'Textbooks',
        condition: 'Like New',
        seller: testSeller._id,
        campusName: 'Campus University',
        universityName: 'Campus University',
        status: 'active'
      });
    }
    console.log('   ✅ Seller, Buyer, and Product ready.');

    // 2. Clean prior test notifications
    await Notification.deleteMany({ recipient: { $in: [testSeller._id, testBuyer._id] } });

    // 3. Test Product Liked Notification
    console.log('2. Testing Product Liked notification generation...');
    const likeNotif = await createAndSendNotification({
      recipientId: testSeller._id,
      senderId: testBuyer._id,
      type: 'like',
      title: `${testBuyer.fullName} liked your listing`,
      message: `${testBuyer.fullName} added "${testProduct.title}" to their wishlist.`,
      productId: testProduct._id
    });

    if (!likeNotif || likeNotif.type !== 'like') {
      throw new Error('Failed to create like notification');
    }
    console.log('   ✅ Product Like notification successfully created & populated:');
    console.log(`      Title: "${likeNotif.title}", Recipient: ${likeNotif.recipient}`);

    // 4. Test Buy Intent Notification
    console.log('3. Testing Buy Intent notification generation...');
    const buyNotif = await createAndSendNotification({
      recipientId: testSeller._id,
      senderId: testBuyer._id,
      type: 'buy_intent',
      title: `Buyer Interest: ${testProduct.title}`,
      message: `${testBuyer.fullName} wants to purchase your "${testProduct.title}"!`,
      productId: testProduct._id
    });

    if (!buyNotif || buyNotif.type !== 'buy_intent') {
      throw new Error('Failed to create buy_intent notification');
    }
    console.log('   ✅ Buy Intent notification created successfully.');

    // 5. Test Chat Message Notification
    console.log('4. Testing Chat Message notification generation...');
    const msgNotif = await createAndSendNotification({
      recipientId: testSeller._id,
      senderId: testBuyer._id,
      type: 'message',
      title: `Message from ${testBuyer.fullName}`,
      message: 'Is this textbook still available?',
      productId: testProduct._id
    });

    if (!msgNotif || msgNotif.type !== 'message') {
      throw new Error('Failed to create message notification');
    }
    console.log('   ✅ Chat Message notification created successfully.');

    // 6. Test Unread Count
    console.log('5. Verifying unread count calculations...');
    const unread = await getUnreadCount(testSeller._id);
    if (unread !== 3) {
      throw new Error(`Expected 3 unread notifications, got ${unread}`);
    }
    console.log(`   ✅ Seller has ${unread} unread notifications (exact match).`);

    // 7. Test Mark As Read
    console.log('6. Testing mark single notification as read...');
    likeNotif.read = true;
    await Notification.findByIdAndUpdate(likeNotif._id, { read: true });
    const afterOneRead = await getUnreadCount(testSeller._id);
    if (afterOneRead !== 2) {
      throw new Error(`Expected 2 unread notifications, got ${afterOneRead}`);
    }
    console.log(`   ✅ Updated unread count: ${afterOneRead}`);

    // 8. Test Mark All As Read
    console.log('7. Testing mark all as read...');
    await Notification.updateMany({ recipient: testSeller._id }, { read: true });
    const finalUnread = await getUnreadCount(testSeller._id);
    if (finalUnread !== 0) {
      throw new Error(`Expected 0 unread notifications, got ${finalUnread}`);
    }
    console.log('   ✅ All notifications marked as read.');

    // 9. Self-notification prevention test
    console.log('8. Testing self-notification prevention rule...');
    const selfNotif = await createAndSendNotification({
      recipientId: testSeller._id,
      senderId: testSeller._id,
      type: 'like',
      title: 'Self like',
      message: 'You liked your own item'
    });
    if (selfNotif !== null) {
      throw new Error('Self notification was not prevented');
    }
    console.log('   ✅ Self-notification correctly blocked.');

    // 10. Clean up test records
    await Notification.deleteMany({ recipient: { $in: [testSeller._id, testBuyer._id] } });
    await Product.deleteOne({ _id: testProduct._id });
    await User.deleteMany({ _id: { $in: [testSeller._id, testBuyer._id] } });
    console.log('   ✅ Cleaned up temporary test data.');

    console.log('\n🎉 ALL 10 NOTIFICATION SERVICE VERIFICATION TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('\n❌ Verification failed:', err);
    process.exitCode = 1;
  } finally {
    await closeDB();
  }
}

runTests();
