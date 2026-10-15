const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const notificationController = require('../controllers/notificationController');

// All notification routes require authentication
router.use(auth);

// GET /api/notifications - List user's notifications
router.get('/', notificationController.getNotifications);

// GET /api/notifications/unread-count - Get unread count
router.get('/unread-count', notificationController.getUnreadCount);

// PUT /api/notifications/mark-all-read - Mark all as read
router.put('/mark-all-read', notificationController.markAllAsRead);

// PUT /api/notifications/:id/read - Mark one as read
router.put('/:id/read', notificationController.markAsRead);

// DELETE /api/notifications - Clear all notifications
router.delete('/', notificationController.clearAllNotifications);

// DELETE /api/notifications/:id - Delete single notification
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
