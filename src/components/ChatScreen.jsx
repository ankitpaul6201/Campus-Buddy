import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  ChevronRight, 
  Search, 
  Send, 
  ShieldCheck, 
  CheckCheck, 
  MessageSquare,
  ShoppingBag
} from 'lucide-react';
import { 
  fetchConversations, 
  startConversation, 
  fetchMessages, 
  sendMessage, 
  getStoredUser 
} from '../lib/api';
import { 
  subscribeToChatMessages, 
  subscribeToMessagesRead,
  subscribeToPresence,
  joinConversationRoom, 
  leaveConversationRoom,
  markConversationRead 
} from '../lib/socket';

export default function ChatScreen({ 
  user, 
  activeNav, 
  setActiveNav, 
  favorites = [], 
  notifications = [], 
  activeChatTarget, 
  setActiveChatTarget, 
  onNavigateBack 
}) {
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [chatsList, setChatsList] = useState([]);
  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [onlineUserIds, setOnlineUserIds] = useState(new Set());

  // Real-time online presence listener
  useEffect(() => {
    const unsub = subscribeToPresence((event) => {
      if (event.type === 'init') {
        setOnlineUserIds(new Set((event.onlineIds || []).map(String)));
      } else if (event.type === 'update') {
        setOnlineUserIds(prev => {
          const next = new Set(prev);
          if (event.status === 'online') {
            next.add(String(event.userId));
          } else {
            next.delete(String(event.userId));
          }
          return next;
        });
      }
    });
    return () => unsub();
  }, []);

  const uploadedHeartPath = "M2 9.1371C2 14 6.01943 16.5914 8.96173 18.9109C10 19.7294 11 20.5 12 20.5C13 20.5 14 19.7294 15.0383 18.9109C17.9806 16.5914 22 14 22 9.1371C22 4.27416 16.4998 0.825464 12 5.50063C7.50016 0.825464 2 4.27416 2 9.1371Z";

  const currentUserId = user?.id || user?._id || getStoredUser()?.id;

  const formatConversation = (conv) => {
    if (!conv) return {};
    const otherParticipant = (conv.participants || []).find(
      p => String(p?._id || p?.id || p) !== String(currentUserId)
    ) || (conv.participants && conv.participants[0]) || {};

    const otherUserId = String(otherParticipant?._id || otherParticipant?.id || (typeof otherParticipant === 'string' ? otherParticipant : ''));

    const name = otherParticipant.fullName || otherParticipant.name || conv.name || 'Campus Student';
    const avatar = otherParticipant.avatar || (name ? name.charAt(0).toUpperCase() : 'S');
    const productTitle = conv.product?.title || conv.productTitle || 'Campus Item';
    
    let timeStr = 'Just now';
    if (conv.lastMessageAt || conv.updatedAt) {
      try {
        const d = new Date(conv.lastMessageAt || conv.updatedAt);
        timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } catch {}
    }

    return {
      id: conv._id || conv.id,
      name,
      avatar,
      verified: otherParticipant.isVerified || false,
      productTitle,
      otherUserId,
      lastMessage: conv.lastMessage || 'Conversation started',
      time: timeStr,
      unreadCount: conv.unreadCount || 0,
      productId: conv.product?._id || conv.product || conv.productId,
      rawConv: conv
    };
  };

  const targetInFlightRef = React.useRef(null);

  // Load conversations on mount
  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        setLoadingChats(true);
        const res = await fetchConversations();
        if (isMounted && Array.isArray(res)) {
          // Deduplicate by participants + product
          const seen = new Set();
          const unique = [];
          for (const raw of res) {
            if (!raw) continue;
            const formatted = formatConversation(raw);
            const otherP = (raw.participants || []).find(p => String(p?._id || p?.id || p) !== String(currentUserId));
            const otherId = otherP ? String(otherP._id || otherP.id || (typeof otherP === 'string' ? otherP : '')) : '';
            const prodId = String(raw.product?._id || raw.product || raw.productId || '');
            const dedupeKey = `${otherId}_${prodId}`;
            if (otherId && seen.has(dedupeKey)) continue;
            if (otherId) seen.add(dedupeKey);
            unique.push(formatted);
          }
          setChatsList(unique);
        }
      } catch (err) {
        console.warn('Error loading conversations:', err);
      } finally {
        if (isMounted) setLoadingChats(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, [user]);

  // Handle activeChatTarget passed from HomeScreen / ProductDetailsScreen
  useEffect(() => {
    if (!activeChatTarget) return;

    const targetKey = `${activeChatTarget.sellerId}_${activeChatTarget.productId || 'none'}`;
    if (targetInFlightRef.current === targetKey) {
      return;
    }
    targetInFlightRef.current = targetKey;

    const currentTarget = activeChatTarget;
    if (setActiveChatTarget) setActiveChatTarget(null);

    let isMounted = true;
    async function initTargetChat() {
      try {
        const conv = await startConversation({
          sellerId: currentTarget.sellerId,
          productId: currentTarget.productId,
          initialMessage: ''
        });

        if (!isMounted) return;

        const targetId = conv._id || conv.id;
        const formatted = formatConversation(conv);

        if (currentTarget.sellerName) formatted.name = currentTarget.sellerName;
        if (currentTarget.productTitle) formatted.productTitle = currentTarget.productTitle;
        if (currentTarget.avatar) formatted.avatar = currentTarget.avatar;

        setChatsList(prev => {
          const exists = prev.some(c => String(c.id) === String(targetId));
          if (exists) {
            return prev.map(c => String(c.id) === String(targetId) ? { ...c, ...formatted } : c);
          }
          return [formatted, ...prev];
        });

        setSelectedChatId(targetId);
        markConversationRead(targetId);

        // Load messages
        const msgs = await fetchMessages(targetId);
        if (isMounted && Array.isArray(msgs)) {
          const currentUserIdStr = String(currentUserId || 'me');
          setMessages(msgs.map(m => ({
            id: m._id || m.id || Math.random(),
            text: m.text,
            sender: String(m.sender?._id || m.sender) === currentUserIdStr ? 'me' : 'other',
            time: m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now',
            read: Boolean(m.read)
          })));
        }
      } catch (err) {
        console.error('Failed to init target chat:', err);
      } finally {
        setTimeout(() => {
          if (targetInFlightRef.current === targetKey) {
            targetInFlightRef.current = null;
          }
        }, 1500);
      }
    }

    initTargetChat();
    return () => { isMounted = false; };
  }, [activeChatTarget]);

  const activeChat = chatsList.find(c => c.id === selectedChatId) || {};

  const handleSelectChat = async (chatId) => {
    setSelectedChatId(chatId);
    markConversationRead(chatId);
    try {
      setLoadingMessages(true);
      const msgs = await fetchMessages(chatId);
      const currentUserIdStr = String(currentUserId || 'me');
      if (Array.isArray(msgs)) {
        setMessages(msgs.map(m => ({
          id: m._id || m.id || Math.random(),
          text: m.text,
          sender: String(m.sender?._id || m.sender) === currentUserIdStr ? 'me' : 'other',
          time: m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now',
          read: Boolean(m.read)
        })));
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.warn('Error fetching messages for chat:', err);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Real-time Socket.io listener for active conversation
  useEffect(() => {
    if (!selectedChatId) return;

    joinConversationRoom(selectedChatId);
    markConversationRead(selectedChatId);

    const unsubMsg = subscribeToChatMessages(({ conversationId, message }) => {
      if (String(conversationId) === String(selectedChatId) && message) {
        const currentUserIdStr = String(currentUserId || 'me');
        const isMine = String(message.sender?._id || message.sender) === currentUserIdStr;

        if (!isMine) {
          markConversationRead(selectedChatId);
          setMessages(prev => {
            const exists = prev.some(m => String(m.id) === String(message._id || message.id));
            if (exists) return prev;
            return [
              ...prev,
              {
                id: message._id || message.id || Math.random(),
                text: message.text,
                sender: 'other',
                time: message.createdAt 
                  ? new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                  : 'Now',
                read: true
              }
            ];
          });
        }
      }

      // Update snippet in chats list
      if (message && message.text) {
        setChatsList(prev => prev.map(c => 
          String(c.id) === String(conversationId)
            ? { ...c, lastMessage: message.text, time: 'Just now' }
            : c
        ));
      }
    });

    // Real-time listener: when the other user views/opens the conversation, mark our sent messages as read (green ticks)
    const unsubRead = subscribeToMessagesRead(({ conversationId }) => {
      if (String(conversationId) === String(selectedChatId)) {
        setMessages(prev => prev.map(m => m.sender === 'me' ? { ...m, read: true } : m));
      }
    });

    return () => {
      leaveConversationRoom(selectedChatId);
      unsubMsg();
      unsubRead();
    };
  }, [selectedChatId, currentUserId]);

  const handleSendMessage = async (textToSend = inputText) => {
    const trimmed = textToSend.trim();
    if (!trimmed || !selectedChatId) return;

    if (textToSend === inputText) setInputText("");

    const newMsg = {
      id: 'local_' + Date.now(),
      text: trimmed,
      sender: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false // Unread until the other user views the chat
    };

    setMessages(prev => [...prev, newMsg]);

    setChatsList(prev => prev.map(c => 
      c.id === selectedChatId 
        ? { ...c, lastMessage: trimmed, time: 'Just now' } 
        : c
    ));

    try {
      await sendMessage(selectedChatId, trimmed);
    } catch (err) {
      console.warn('Failed to send message:', err);
    }
  };

  const quickReplies = [
    "Is it available?",
    "Can you reduce price?",
    "Where can we meet on campus?"
  ];

  const filteredChats = chatsList.filter(c => 
    (c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (c.productTitle || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="w-full h-full min-h-screen bg-[#F4F6FB] text-slate-900 flex flex-col justify-between overflow-hidden font-sans select-none relative"
    >
      {/* Main Container */}
      <div className="flex-1 flex flex-col overflow-hidden pb-[68px]">
        
        {/* TOP HEADER BAR */}
        <div className="pt-14 pb-3.5 px-4 bg-white border-b border-slate-100 flex items-center justify-between shadow-2xs shrink-0 z-30">
          {selectedChatId ? (
            /* Active Thread Header */
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2.5">
                <button 
                  onClick={() => setSelectedChatId(null)}
                  className="w-8 h-8 rounded-full bg-[#F5F3F3] border border-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-200 active:scale-95 transition-all duration-200 hover:-translate-x-1 active:-translate-x-1.5 shrink-0 group"
                  title="Back to conversations"
                >
                  <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5 group-active:-translate-x-1" />
                </button>

                <div className="flex items-center gap-2.5">
                  {activeChat.avatar && activeChat.avatar.length > 2 ? (
                    <img 
                      src={activeChat.avatar} 
                      alt={activeChat.name}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200" 
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center border border-blue-200">
                      {activeChat.avatar || 'S'}
                    </div>
                  )}
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 leading-tight flex items-center gap-1">
                      {activeChat.name || 'Campus Student'}
                      {activeChat.verified && (
                        <ShieldCheck className="w-3 h-3 text-[#1944F1]" />
                      )}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5 leading-tight">
                      {activeChat.otherUserId && onlineUserIds.has(String(activeChat.otherUserId)) ? (
                        <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Online
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-normal">Offline</span>
                      )}
                      <span className="text-[8px] text-slate-300">•</span>
                      <p className="text-[10px] text-[#1944F1] font-semibold leading-tight truncate max-w-[150px]">
                        {activeChat.productTitle || 'Campus Marketplace'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setActiveNav && setActiveNav('wishlist')}
                className="w-10 h-10 min-w-[40px] max-w-[40px] min-h-[40px] max-h-[40px] rounded-full bg-[#F5F3F3] border border-slate-100 flex items-center justify-center text-slate-900 shrink-0"
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path d={uploadedHeartPath} fill="none" stroke="#0F172A" strokeWidth="1.8" />
                </svg>
              </button>
            </div>
          ) : (
            /* Main Inbox Header */
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <img 
                  src="/campus-buddy-CB-exact-vector (1).svg" 
                  alt="Logo" 
                  className="w-9 h-9 min-w-[36px] max-w-[36px] min-h-[36px] max-h-[36px] object-contain shrink-0" 
                />
                <span className="text-lg font-bold text-slate-900 tracking-tight font-sans">
                  Campus Buddy
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setActiveNav && setActiveNav('wishlist')}
                  className="w-10 h-10 min-w-[40px] max-w-[40px] min-h-[40px] max-h-[40px] rounded-full bg-[#F5F3F3] border border-slate-100 flex items-center justify-center text-slate-900 relative shrink-0"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path d={uploadedHeartPath} fill="none" stroke="#0F172A" strokeWidth="1.8" />
                  </svg>
                  {favorites.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4.5 h-4.5 min-w-[18px] min-h-[18px] max-w-[18px] max-h-[18px] rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-xs">
                      {favorites.length}
                    </span>
                  )}
                </button>

                <button 
                  onClick={() => setActiveNav && setActiveNav('notifications')}
                  className="w-10 h-10 min-w-[40px] max-w-[40px] min-h-[40px] max-h-[40px] rounded-full bg-[#F5F3F3] border border-slate-100 flex items-center justify-center text-slate-900 relative shrink-0"
                >
                  <img src="/bell-svgrepo-com.svg" alt="Bell" className="w-5 h-5 filter brightness-0 opacity-80" />
                  {notifications.filter(n => n.unread).length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4.5 h-4.5 min-w-[18px] min-h-[18px] max-w-[18px] max-h-[18px] rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-xs">
                      {notifications.filter(n => n.unread).length}
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* CONTENT AREA */}
        <AnimatePresence mode="wait">
          {selectedChatId ? (
            /* Active Conversation Thread View */
            <motion.div 
              key="chat-thread"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.16 }}
              className="flex-1 flex flex-col overflow-hidden bg-[#F4F6FB]"
            >
              <div className="flex-1 overflow-y-auto p-4 space-y-2.5 no-scrollbar">
                <div className="text-center my-1">
                  <span className="text-[10px] bg-slate-200/70 text-slate-600 font-semibold px-2.5 py-0.5 rounded-full">
                    Meet in a public campus area for safety
                  </span>
                </div>

                {loadingMessages && (
                  <div className="text-center py-4 text-xs text-slate-400">
                    Loading messages...
                  </div>
                )}

                {!loadingMessages && messages.length === 0 && (
                  <div className="text-center py-8 space-y-1">
                    <p className="text-xs text-slate-500 font-medium">No messages yet</p>
                    <p className="text-[11px] text-slate-400">Say hello or ask questions about the item.</p>
                  </div>
                )}

                {messages.map((msg) => {
                  const isMe = msg.sender === 'me';
                  return (
                    <div 
                      key={msg.id}
                      className={`flex flex-col space-y-0.5 ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div className={`max-w-[80%] px-3.5 py-2 rounded-2xl text-xs leading-relaxed font-normal shadow-2xs ${
                        isMe 
                          ? 'bg-[#1944F1] text-white rounded-tr-xs' 
                          : 'bg-white text-slate-900 rounded-tl-xs border border-slate-100'
                      }`}>
                        {msg.text}
                      </div>

                      <div className="flex items-center gap-1 px-1">
                        <span className="text-[9px] text-slate-400">
                          {msg.time}
                        </span>
                        {isMe && (
                          <CheckCheck 
                            className={`w-3.5 h-3.5 transition-colors duration-200 ${
                              msg.read ? 'text-emerald-500' : 'text-slate-400'
                            }`} 
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Reply Chips */}
              <div className="px-3 py-1.5 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                {quickReplies.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(chip)}
                    className="px-2.5 py-1 rounded-full bg-[#F5F3F3] hover:bg-slate-200/60 text-slate-700 text-[11px] font-medium border border-slate-100 whitespace-nowrap active:scale-95 transition-all"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Message Input Box - raised 3px to avoid interference with bottom navigation panel */}
              <div className="p-2.5 mb-[3px] bg-white border-t border-slate-100 flex items-center gap-2 shrink-0">
                <input 
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 bg-[#F5F3F3] text-slate-900 placeholder-slate-400 px-3.5 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#1944F1] border border-slate-100"
                />

                <button 
                  onClick={() => handleSendMessage()}
                  className="w-9 h-9 rounded-xl bg-[#1944F1] hover:bg-blue-700 flex items-center justify-center text-white shadow-xs active:scale-95 transition-all shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ) : (
            /* Inbox List View */
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F4F6FB] no-scrollbar">
              <div>
                <h1 className="text-xl font-bold text-slate-900 font-sans tracking-tight">
                  Chats
                </h1>
                <p className="text-xs text-slate-500 font-normal mt-0.5">
                  Connect with buyers and sellers on campus.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search chats or listings..."
                  className="w-full bg-white text-slate-900 placeholder-slate-400 pl-9 pr-3 py-2.5 rounded-xl text-xs font-normal border border-slate-100 shadow-2xs focus:outline-none focus:ring-1 focus:ring-[#1944F1]"
                />
              </div>

              {/* Inbox Cards */}
              <div className="space-y-2.5 pt-1">
                {loadingChats ? (
                  <div className="py-12 text-center text-xs text-slate-400">
                    Loading conversations...
                  </div>
                ) : filteredChats.length === 0 ? (
                  <div className="py-16 text-center space-y-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-2xs">
                    <MessageSquare className="w-10 h-10 text-slate-300 mx-auto" />
                    <h3 className="text-sm font-bold text-slate-800">No Messages Yet</h3>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto">
                      When you inquire about an item or buyers message you about your listings, your chats will appear here.
                    </p>
                  </div>
                ) : (
                  filteredChats.map((chat) => (
                    <div
                      key={chat.id}
                      onClick={() => handleSelectChat(chat.id)}
                      className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative shrink-0">
                          {chat.avatar && chat.avatar.length > 2 ? (
                            <img 
                              src={chat.avatar} 
                              alt={chat.name} 
                              className="w-11 h-11 rounded-full object-cover border border-slate-100" 
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center border border-blue-200">
                              {chat.avatar || 'S'}
                            </div>
                          )}
                          {Boolean(chat.otherUserId && onlineUserIds.has(String(chat.otherUserId))) && (
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1">
                            <h3 className="text-xs font-bold text-slate-900 font-sans truncate">
                              {chat.name}
                            </h3>
                            {chat.verified && (
                              <ShieldCheck className="w-3 h-3 text-[#1944F1] shrink-0" />
                            )}
                          </div>

                          <span className="inline-block bg-blue-50 text-[#1944F1] px-2 py-0.5 rounded-md text-[10px] font-semibold border border-blue-100/60 mt-0.5">
                            {chat.productTitle}
                          </span>

                          <p className="text-[11px] text-slate-500 font-normal truncate mt-1">
                            {chat.lastMessage}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="text-[10px] text-slate-400">
                          {chat.time}
                        </span>
                        {chat.unreadCount > 0 ? (
                          <span className="w-4.5 h-4.5 rounded-full bg-[#1944F1] text-white text-[9px] font-bold flex items-center justify-center">
                            {chat.unreadCount}
                          </span>
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:translate-x-0.5 transition-transform" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </AnimatePresence>

      </div>

    </motion.div>
  );
}
