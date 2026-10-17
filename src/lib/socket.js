// Campus Buddy Real-Time WebSocket Client (Socket.io)
import { io } from 'socket.io-client';
import { API_BASE_URL, getAuthToken } from './api';

let socket = null;

/**
 * Derives the base server URL for WebSockets from the REST API base URL
 * (e.g. "http://localhost:5000/api" -> "http://localhost:5000")
 */
function getSocketServerUrl() {
  try {
    const url = new URL(API_BASE_URL);
    return `${url.protocol}//${url.host}`;
  } catch {
    return 'http://localhost:5000';
  }
}

/**
 * Initializes and returns the Socket.io client connection
 * Authenticated with the user's JWT token
 */
export function initSocketClient(authToken = null) {
  const token = authToken || getAuthToken();

  if (!token) {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
    return null;
  }

  // Reuse active socket if token hasn't changed and connection is healthy
  if (socket && socket.connected) {
    return socket;
  }

  if (socket) {
    socket.disconnect();
  }

  const serverUrl = getSocketServerUrl();

  socket = io(serverUrl, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000
  });

  socket.on('connect', () => {
    console.log('⚡ [Socket.io Client] Connected to Campus Buddy real-time service:', socket.id);
  });

  socket.on('connect_error', (err) => {
    console.warn('⚠️ [Socket.io Client] Connection error:', err.message);
  });

  socket.on('disconnect', (reason) => {
    console.log('🔌 [Socket.io Client] Disconnected:', reason);
  });

  return socket;
}

/**
 * Returns active socket instance
 */
export function getSocket() {
  return socket;
}

/**
 * Disconnects the socket when user logs out
 */
export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

/**
 * Listen for new incoming push notifications in real time
 */
export function subscribeToNewNotifications(handler) {
  if (!socket) return () => {};
  socket.on('notification:new', handler);
  return () => {
    if (socket) socket.off('notification:new', handler);
  };
}

/**
 * Listen for live unread notification badge updates
 */
export function subscribeToUnreadCount(handler) {
  if (!socket) return () => {};
  socket.on('notification:unread_count', handler);
  return () => {
    if (socket) socket.off('notification:unread_count', handler);
  };
}

/**
 * Listen for incoming live chat messages
 */
export function subscribeToChatMessages(handler) {
  if (!socket) return () => {};
  socket.on('chat:message', handler);
  return () => {
    if (socket) socket.off('chat:message', handler);
  };
}

/**
 * Join specific conversation room for active real-time chatting
 */
export function joinConversationRoom(conversationId) {
  if (socket && conversationId) {
    socket.emit('conversation:join', conversationId);
  }
}

/**
 * Leave specific conversation room
 */
export function leaveConversationRoom(conversationId) {
  if (socket && conversationId) {
    socket.emit('conversation:leave', conversationId);
  }
}

/**
 * Broadcast typing status to the conversation
 */
export function sendTypingStatus(conversationId, isTyping) {
  if (socket && conversationId) {
    socket.emit('conversation:typing', { conversationId, isTyping });
  }
}

/**
 * Emit conversation read event so other participants see real-time green read ticks
 */
export function markConversationRead(conversationId) {
  if (socket && conversationId) {
    socket.emit('conversation:read', { conversationId });
  }
}

/**
 * Listen for when messages in an active conversation are marked as read
 */
export function subscribeToMessagesRead(handler) {
  if (!socket) return () => {};
  socket.on('chat:messages_read', handler);
  return () => {
    if (socket) socket.off('chat:messages_read', handler);
  };
}
