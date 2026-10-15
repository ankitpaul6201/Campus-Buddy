const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const chatController = require('../controllers/chatController');

// @route   GET /api/chat/conversations
router.get('/conversations', authMiddleware, chatController.getConversations);

// @route   POST /api/chat/conversations
router.post('/conversations', authMiddleware, chatController.startConversation);

// @route   GET /api/chat/conversations/:id/messages
router.get('/conversations/:id/messages', authMiddleware, chatController.getMessages);

// @route   POST /api/chat/conversations/:id/messages
router.post('/conversations/:id/messages', authMiddleware, chatController.sendMessage);

module.exports = router;
