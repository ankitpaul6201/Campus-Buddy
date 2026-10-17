const Conversation = require('../models/Conversation');
const User = require('../models/User');
const { emitToConversation, emitToUser } = require('../services/socketService');
const { createAndSendNotification } = require('../services/notificationService');

/**
 * GET /api/chat/conversations
 * Get all conversations for the authenticated user (lean + indexed)
 */
async function getConversations(req, res, next) {
  try {
    const userId = (req.user && req.user.id) || (req.auth && req.auth.userId);

    const conversations = await Conversation.find({
      participants: userId
    })
      .select('participants product lastMessage lastMessageAt updatedAt messages')
      .populate('participants', 'fullName avatar universityName isVerified email')
      .populate('product', 'title price images condition campusName status')
      .sort({ lastMessageAt: -1 })
      .lean();

    // Deduplicate conversations for the same peer and product
    const seen = new Set();
    const unique = [];
    for (const c of conversations) {
      const otherParticipant = (c.participants || []).find(
        p => String(p._id || p.id || p) !== String(userId)
      ) || {};
      const otherId = String(otherParticipant._id || otherParticipant.id || otherParticipant || '');
      const prodId = String(c.product?._id || c.product || '');
      const dedupeKey = `${otherId}_${prodId}`;

      if (otherId && seen.has(dedupeKey)) {
        continue;
      }
      seen.add(dedupeKey);

      // Compute unread message count sent by the other participant
      const unreadCount = (c.messages || []).filter(
        m => String(m.sender?._id || m.sender) !== String(userId) && !m.read
      ).length;
      c.unreadCount = unreadCount;

      unique.push(c);
    }

    res.json(unique);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/chat/conversations
 * Start or retrieve an existing conversation for a product
 */
async function startConversation(req, res, next) {
  try {
    const userId = (req.user && req.user.id) || (req.auth && req.auth.userId);
    const { sellerId, productId, initialMessage } = req.body;

    if (!sellerId) {
      return res.status(400).json({ error: 'sellerId is required to start a conversation' });
    }

    if (String(userId) === String(sellerId)) {
      return res.status(400).json({ error: 'You cannot start a conversation with yourself' });
    }

    // Check if conversation already exists (sort by latest active)
    const query = {
      participants: { $all: [userId, sellerId] }
    };
    if (productId) {
      query.product = productId;
    }

    let conversation = await Conversation.findOne(query)
      .sort({ lastMessageAt: -1 })
      .populate('participants', 'fullName avatar universityName isVerified email')
      .populate('product', 'title price images condition campusName status');

    let isNew = false;
    if (!conversation) {
      isNew = true;
      const messages = [];
      if (initialMessage && initialMessage.trim()) {
        messages.push({
          sender: userId,
          text: initialMessage.trim(),
          read: false,
          createdAt: new Date()
        });
      }

      try {
        const newConv = new Conversation({
          participants: [userId, sellerId],
          product: productId || null,
          lastMessage: initialMessage ? initialMessage.trim() : 'Conversation started',
          lastMessageAt: new Date(),
          messages
        });

        await newConv.save();

        conversation = await Conversation.findById(newConv._id)
          .populate('participants', 'fullName avatar universityName isVerified email')
          .populate('product', 'title price images condition campusName status')
          .lean();
      } catch (saveErr) {
        // Handle concurrent insert collision gracefully
        conversation = await Conversation.findOne(query)
          .sort({ lastMessageAt: -1 })
          .populate('participants', 'fullName avatar universityName isVerified email')
          .populate('product', 'title price images condition campusName status')
          .lean();
        if (!conversation) throw saveErr;
      }
    }

    // If there is an initial message or newly started chat, notify seller
    if (initialMessage && initialMessage.trim()) {
      const senderUser = await User.findById(userId).select('fullName avatar').lean();
      const senderName = senderUser?.fullName || 'A student';
      const preview = initialMessage.trim().length > 60 ? initialMessage.trim().substring(0, 57) + '...' : initialMessage.trim();

      emitToUser(sellerId, 'chat:conversation_new', conversation);

      createAndSendNotification({
        recipientId: sellerId,
        senderId: userId,
        type: 'message',
        title: `New inquiry from ${senderName}`,
        message: preview,
        conversationId: conversation._id,
        productId: productId || null
      }).catch(err => console.error('Notification error in startConversation:', err));
    }

    res.json(conversation);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/chat/conversations/:id/messages
 * Get all messages for a specific conversation
 */
async function getMessages(req, res, next) {
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
      emitToConversation(conversation._id, 'chat:messages_read', {
        conversationId: conversation._id,
        readBy: userId
      });
    }

    res.json(conversation.messages);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/chat/conversations/:id/messages
 * Send a message in an existing conversation
 */
async function sendMessage(req, res, next) {
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

    const savedMsg = conversation.messages[conversation.messages.length - 1];

    // Find the other participant
    const recipientId = conversation.participants.find(p => String(p) !== String(userId));

    // Real-time Socket.io dispatch
    emitToConversation(conversation._id, 'chat:message', {
      conversationId: conversation._id,
      message: savedMsg
    });

    if (recipientId) {
      emitToUser(recipientId, 'chat:message', {
        conversationId: conversation._id,
        message: savedMsg
      });

      // Create persistent in-app notification for the recipient
      User.findById(userId).select('fullName avatar').lean().then(senderUser => {
        const senderName = senderUser?.fullName || 'A student';
        const preview = text.trim().length > 60 ? text.trim().substring(0, 57) + '...' : text.trim();

        return createAndSendNotification({
          recipientId,
          senderId: userId,
          type: 'message',
          title: `Message from ${senderName}`,
          message: preview,
          conversationId: conversation._id,
          productId: conversation.product
        });
      }).catch(err => console.error('Notification error in sendMessage:', err));
    }

    res.status(201).json(savedMsg);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getConversations,
  startConversation,
  getMessages,
  sendMessage
};
