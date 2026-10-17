const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io = null;
const onlineUsers = new Map(); // userId -> Set of socketIds

/**
 * Initialize Socket.io on the HTTP server
 * @param {import('http').Server} httpServer
 */
function initSocket(httpServer) {
  const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim()) 
    : null;

  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (origin.startsWith('http://localhost') || 
            origin.startsWith('capacitor://localhost') || 
            origin.startsWith('https://localhost') ||
            origin.includes('127.0.0.1') ||
            origin.includes('10.207.19.187')) {
          return callback(null, true);
        }
        if (allowedOrigins && allowedOrigins.length > 0) {
          if (allowedOrigins.includes(origin)) {
            return callback(null, true);
          }
          return callback(new Error('Blocked by CORS policy: Origin not allowed'));
        }
        return callback(null, true);
      },
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      credentials: true
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 30000,
    pingInterval: 25000
  });

  // Socket Authentication Middleware
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token || 
                    socket.handshake.headers?.authorization?.replace(/^Bearer\s+/i, '') ||
                    socket.handshake.query?.token;

      if (!token) {
        return next(new Error('Authentication required'));
      }

      const secret = process.env.JWT_SECRET || 'campus_buddy_super_secret_jwt_key_2026_token_auth';
      const decoded = jwt.verify(token, secret);
      socket.user = decoded;
      next();
    } catch (err) {
      return next(new Error('Invalid or expired socket authentication token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = String(socket.user.id);
    const userRoom = `user_${userId}`;

    // Join personal user notification room
    socket.join(userRoom);
    console.log(`🔌 [Socket.io] User connected: ${userId} (${socket.user.fullName || socket.user.email}) -> Room: ${userRoom}`);

    // Track active presence
    let userSockets = onlineUsers.get(userId);
    const isFirstConnection = !userSockets || userSockets.size === 0;
    if (!userSockets) {
      userSockets = new Set();
      onlineUsers.set(userId, userSockets);
    }
    userSockets.add(socket.id);

    if (isFirstConnection) {
      io.emit('presence:update', { userId, status: 'online' });
    }

    // Immediately push currently online user list to the connected client
    socket.emit('presence:init', Array.from(onlineUsers.keys()));

    socket.on('presence:request', () => {
      socket.emit('presence:init', Array.from(onlineUsers.keys()));
    });

    // Join conversation room for active real-time chatting
    socket.on('conversation:join', (conversationId) => {
      if (conversationId) {
        const room = `conversation_${conversationId}`;
        socket.join(room);
        console.log(`💬 [Socket.io] User ${userId} joined room: ${room}`);
      }
    });

    // Leave conversation room
    socket.on('conversation:leave', (conversationId) => {
      if (conversationId) {
        const room = `conversation_${conversationId}`;
        socket.leave(room);
        console.log(`💬 [Socket.io] User ${userId} left room: ${room}`);
      }
    });

    // Handle read receipt broadcast when user views/opens messages
    socket.on('conversation:read', async ({ conversationId }) => {
      if (conversationId) {
        try {
          const Conversation = require('../models/Conversation');
          const conversation = await Conversation.findOne({
            _id: conversationId,
            participants: userId
          });
          if (conversation) {
            let modified = false;
            conversation.messages.forEach(msg => {
              if (String(msg.sender) !== String(userId) && !msg.read) {
                msg.read = true;
                modified = true;
              }
            });
            if (modified) {
              await conversation.save();
              emitToConversation(conversationId, 'chat:messages_read', {
                conversationId,
                readBy: userId
              });
              emitToUser(userId, 'chat:messages_read', {
                conversationId,
                readBy: userId
              });
            }
          }
        } catch (err) {
          console.warn('Socket conversation:read error:', err.message);
        }
      }
    });

    // Handle typing status broadcast in conversation
    socket.on('conversation:typing', ({ conversationId, isTyping }) => {
      if (conversationId) {
        socket.to(`conversation_${conversationId}`).emit('conversation:typing', {
          conversationId,
          userId,
          fullName: socket.user.fullName,
          isTyping
        });
      }
    });

    socket.on('disconnect', (reason) => {
      console.log(`🔌 [Socket.io] User disconnected: ${userId} (Reason: ${reason})`);
      const userSockets = onlineUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(userId);
          io.emit('presence:update', { userId, status: 'offline' });
        }
      }
    });
  });

  return io;
}

/**
 * Get the initialized socket.io instance
 */
function getIO() {
  return io;
}

/**
 * Emit event to a specific user's private notification channel
 * @param {string|mongoose.Types.ObjectId} userId
 * @param {string} event
 * @param {any} data
 */
function emitToUser(userId, event, data) {
  if (!io) return;
  const userRoom = `user_${String(userId)}`;
  io.to(userRoom).emit(event, data);
}

/**
 * Emit event to everyone in an active conversation room
 * @param {string|mongoose.Types.ObjectId} conversationId
 * @param {string} event
 * @param {any} data
 */
function emitToConversation(conversationId, event, data) {
  if (!io) return;
  const room = `conversation_${String(conversationId)}`;
  io.to(room).emit(event, data);
}

module.exports = {
  initSocket,
  getIO,
  emitToUser,
  emitToConversation
};
