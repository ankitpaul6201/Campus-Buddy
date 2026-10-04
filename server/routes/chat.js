const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');
const Product = require('../models/Product');
const authMiddleware = require('../middleware/auth');

// @route   GET /api/chat/conversations
// @desc    Get all conversations for the authenticated user
router.get('/conversations', authMiddleware, async (req, res) => {
  try {
    const userId = (req.user && req.user.id) || (req.auth && req.auth.userId);

    const conversations = await Conversation.find({
      participants: userId
    })
      .populate('participants', 'fullName avatar universityName isVerified email')
      .populate('product', 'title price images condition campusName status')
      .sort({ lastMessageAt: -1, updatedAt: -1 });

    res.json(conversations);
  } catch (err) {
    console.error('Error fetching conversations:', err);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// @route   POST /api/chat/conversations
// @desc    Start or retrieve an existing conversation for a product
router.post('/conversations', authMiddleware, async (req, res) => {
  try {
    const userId = (req.user && req.user.id) || (req.auth && req.auth.userId);
    const { sellerId, productId, initialMessage } = req.body;

    if (!sellerId) {
      return res.status(400).json({ error: 'sellerId is required to start a conversation' });
    }

    if (String(userId) === String(sellerId)) {
      return res.status(400).json({ error: 'You cannot start a conversation with yourself' });
    }

    // Check if a conversation already exists between these 2 users (optionally for this product)
    const query = {
      participants: { $all: [userId, sellerId] }
    };
    if (productId) {
      query.product = productId;
    }

    let conversation = await Conversation.findOne(query)
      .populate('participants', 'fullName avatar universityName isVerified email')
      .populate('product', 'title price images condition campusName status');

    if (!conversation) {
      const messages = [];
      if (initialMessage && initialMessage.trim()) {
        messages.push({
          sender: userId,
          text: initialMessage.trim(),
          read: false,
          createdAt: new Date()
        });
      }

      conversation = new Conversation({
        participants: [userId, sellerId],
        product: productId || null,
        lastMessage: initialMessage ? initialMessage.trim() : 'Conversation started',
        lastMessageAt: new Date(),
        messages
      });

      await conversation.save();

      conversation = await Conversation.findById(conversation._id)
        .populate('participants', 'fullName avatar universityName isVerified email')
        .populate('product', 'title price images condition campusName status');
    }

    res.json(conversation);
  } catch (err) {
    console.error('Error starting conversation:', err);
    res.status(500).json({ error: 'Failed to start conversation' });
  }
});

// @route   GET /api/chat/conversations/:id/messages
// @desc    Get all messages for a specific conversation
router.get('/conversations/:id/messages', authMiddleware, async (req, res) => {
  try {
    const userId = (req.user && req.user.id) || (req.auth && req.auth.userId);
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      participants: userId
    }).populate('participants', 'fullName avatar universityName isVerified email');

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found or unauthorized' });
    }

    // Mark other participant's unread messages as read
    let modified = false;
    conversation.messages.forEach(msg => {
      if (String(msg.sender) !== String(userId) && !msg.read) {
        msg.read = true;
        modified = true;
      }
    });

    if (modified) {
      await conversation.save();
    }

    res.json(conversation.messages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// @route   POST /api/chat/conversations/:id/messages
// @desc    Send a message in an existing conversation
router.post('/conversations/:id/messages', authMiddleware, async (req, res) => {
  try {
    const userId = (req.user && req.user.id) || (req.auth && req.auth.userId);
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Message text cannot be empty' });
    }

    const conversation = await Conversation.findOne({
      _id: req.params.id,
      participants: userId
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found or unauthorized' });
    }

    const newMsg = {
      sender: userId,
      text: text.trim(),
      read: false,
      createdAt: new Date()
    };

    conversation.messages.push(newMsg);
    conversation.lastMessage = text.trim();
    conversation.lastMessageAt = new Date();

    await conversation.save();

    // Return the newly created message (last item in array)
    const savedMsg = conversation.messages[conversation.messages.length - 1];
    res.status(201).json(savedMsg);
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

module.exports = router;
