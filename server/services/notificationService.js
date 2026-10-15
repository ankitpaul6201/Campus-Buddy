const Notification = require('../models/Notification');
const { emitToUser } = require('./socketService');

/**
 * Creates a notification in MongoDB and immediately pushes it in real-time via Socket.io
 * @param {Object} params
 * @param {string|mongoose.Types.ObjectId} params.recipientId - Target recipient user ID
 * @param {string|mongoose.Types.ObjectId} [params.senderId] - Triggering user ID
 * @param {'message'|'like'|'buy_intent'|'offer'|'system'} params.type - Notification type
 * @param {string} params.title - Short alert title
 * @param {string} params.message - Full notification text description
 * @param {string|mongoose.Types.ObjectId} [params.productId] - Optional related product ID
 * @param {string|mongoose.Types.ObjectId} [params.conversationId] - Optional related conversation ID
 * @param {Object} [params.metadata] - Extra context/payload
 * @returns {Promise<Object|null>} The populated notification object
 */
async function createAndSendNotification({
  recipientId,
  senderId = null,
  type = 'system',
  title,
  message,
  productId = null,
  conversationId = null,
  metadata = {}
}) {
  try {
    if (!recipientId || !title || !message) {
      console.warn('⚠️ [NotificationService] Missing required notification fields');
      return null;
    }

    // Do not notify a user about their own actions
    if (senderId && String(senderId) === String(recipientId)) {
      return null;
    }

    const notification = new Notification({
      recipient: recipientId,
      sender: senderId || null,
      type,
      title,
      message,
      product: productId || null,
      conversation: conversationId || null,
      metadata: metadata || {},
      read: false
    });

    await notification.save();

    // Populate sender and product details for instant UI rendering
    const populated = await Notification.findById(notification._id)
      .populate('sender', 'fullName avatar universityName isVerified')
      .populate('product', 'title price images condition status campusName')
      .lean();

    // 1. Emit live new notification to recipient's private room
    emitToUser(recipientId, 'notification:new', populated);

    // 2. Fetch and broadcast updated unread count to recipient
    const unreadCount = await Notification.countDocuments({
      recipient: recipientId,
      read: false
    });
    emitToUser(recipientId, 'notification:unread_count', { unreadCount });

    console.log(`🔔 [NotificationService] Sent '${type}' notification to user ${recipientId}: "${title}"`);
    return populated;
  } catch (err) {
    console.error('❌ [NotificationService] Error creating/sending notification:', err);
    return null;
  }
}

/**
 * Get total unread count for a user
 * @param {string|mongoose.Types.ObjectId} userId
 * @returns {Promise<number>}
 */
async function getUnreadCount(userId) {
  return Notification.countDocuments({
    recipient: userId,
    read: false
  });
}

module.exports = {
  createAndSendNotification,
  getUnreadCount
};
