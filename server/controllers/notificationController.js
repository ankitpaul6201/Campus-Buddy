const Notification = require('../models/Notification');
const { emitToUser } = require('../services/socketService');

/**
 * GET /api/notifications
 * Fetch user notifications with pagination and unread summary
 */
async function getNotifications(req, res, next) {
  try {
    const userId = (req.user && req.user.id) || (req.auth && req.auth.userId);
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 40));
    const skip = (page - 1) * limit;

    const query = { recipient: userId };
    if (req.query.unread === 'true') {
      query.read = false;
    }
    if (req.query.type) {
      query.type = req.query.type;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query)
        .populate('sender', 'fullName avatar universityName isVerified')
        .populate('product', 'title price images condition status campusName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments(query),
      Notification.countDocuments({ recipient: userId, read: false })
    ]);

    res.json({
      notifications,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      unreadCount
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/notifications/unread-count
 * Fast endpoint for retrieving just the unread badge count
 */
async function getUnreadCount(req, res, next) {
  try {
    const userId = (req.user && req.user.id) || (req.auth && req.auth.userId);
    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      read: false
    });
    res.json({ unreadCount });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/notifications/:id/read
 * Mark a single notification as read
 */
async function markAsRead(req, res, next) {
  try {
    const userId = (req.user && req.user.id) || (req.auth && req.auth.userId);
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: userId },
      { $set: { read: true } },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      read: false
    });
    emitToUser(userId, 'notification:unread_count', { unreadCount });

    res.json({ success: true, notification, unreadCount });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/notifications/mark-all-read
 * Mark all user notifications as read
 */
async function markAllAsRead(req, res, next) {
  try {
    const userId = (req.user && req.user.id) || (req.auth && req.auth.userId);
    await Notification.updateMany(
      { recipient: userId, read: false },
      { $set: { read: true } }
    );

    emitToUser(userId, 'notification:unread_count', { unreadCount: 0 });

    res.json({ success: true, unreadCount: 0 });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/notifications/:id
 * Remove a specific notification
 */
async function deleteNotification(req, res, next) {
  try {
    const userId = (req.user && req.user.id) || (req.auth && req.auth.userId);
    const result = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: userId
    });

    if (!result) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      read: false
    });
    emitToUser(userId, 'notification:unread_count', { unreadCount });

    res.json({ success: true, unreadCount });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/notifications
 * Clear all notifications for the user
 */
async function clearAllNotifications(req, res, next) {
  try {
    const userId = (req.user && req.user.id) || (req.auth && req.auth.userId);
    await Notification.deleteMany({ recipient: userId });

    emitToUser(userId, 'notification:unread_count', { unreadCount: 0 });

    res.json({ success: true, unreadCount: 0 });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications
};
