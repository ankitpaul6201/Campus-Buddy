import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  ChevronRight, 
  Search, 
  ShieldCheck, 
  CheckCheck, 
  MessageSquare,
  ShoppingBag,
  X
} from 'lucide-react';
import { 
  fetchConversations, 
  startConversation, 
  fetchMessages, 
  sendMessage, 
  getStoredUser,
  deleteNotificationApi
} from '../lib/api';
import { 
  subscribeToChatMessages, 
  subscribeToMessagesRead,
  subscribeToPresence,
  joinConversationRoom, 
  leaveConversationRoom,
  markConversationRead 
} from '../lib/socket';
import { Skeleton } from './ui/skeleton';
import EmptyState from './EmptyState';

// Exact SVG Send icon from Clickons/Send.svg
function ClickonsSendIcon({ className = "w-4 h-4" }) {
  return (
    <svg 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path 
        d="M22.8223 5.00704C23.6953 2.51317 21.3183 0.454896 19.0155 1.13438C19.0018 1.13843 18.9881 1.14278 18.9745 1.14742L3.03526 6.60545C0.261274 7.49554 0.342648 11.4024 3.15653 12.2493C3.16605 12.2522 3.17561 12.2549 3.18521 12.2575L8.53347 13.6947C8.54475 13.6977 8.55607 13.7005 8.56744 13.7032C9.38416 13.8923 10.0117 14.5238 10.315 15.4968L11.7414 20.8395C11.7416 20.8403 11.7418 20.8411 11.742 20.8419C12.489 23.6812 16.393 23.6924 17.3721 21.0263L17.3801 21.0037L22.8223 5.00704ZM19.5995 3.04742C20.5329 2.7848 21.2 3.59206 20.9338 4.34864L15.4911 20.3465C15.1286 21.3098 13.8849 21.1287 13.676 20.332L12.2423 14.9622C12.2391 14.9504 12.2357 14.9386 12.2322 14.9269C11.7711 13.4237 10.6883 12.1488 9.03673 11.759L3.72067 10.3304C2.73132 10.0222 2.81169 8.77423 3.65125 8.50824L3.67319 8.50101L19.5995 3.04742Z" 
        fillRule="evenodd" 
        clipRule="evenodd" 
        fill="currentColor"
      />
    </svg>
  );
}

export default function ChatScreen({ 
  user, 
  activeNav, 
  setActiveNav, 
  favorites = [], 
  notifications = [], 
  setNotifications,
  activeChatTarget, 
  setActiveChatTarget, 
  onRefreshUnreadChats,
  onNavigateBack,
  onRegisterBackHandler,
  onChatThreadStateChange,
  canGoBack = false,
  isInputActive = false
}) {
  const [isInputFocused, setIsInputFocused] = useState(false);
  const isKeyboardOpen = isInputActive || isInputFocused;
  const openedFromTargetRef = React.useRef(false);
  const messagesContainerRef = useRef(null);
  const currentUserId = user?.id || user?._id || getStoredUser()?.id;

  // Viewport height tracking for mobile virtual keyboard positioning
  const [viewportHeight, setViewportHeight] = useState(() => {
    if (typeof window !== 'undefined' && window.visualViewport) {
      return window.visualViewport.height;
    }
    return null;
  });

  const uploadedHeartPath = "M2 9.1371C2 14 6.01943 16.5914 8.96173 18.9109C10 19.7294 11 20.5 12 20.5C13 20.5 14 19.7294 15.0383 18.9109C17.9806 16.5914 22 14 22 9.1371C22 4.27416 16.4998 0.825464 12 5.50063C7.50016 0.825464 2 4.27416 2 9.1371Z";

  const getStorageKey = () => `cb_opened_chats_${currentUserId || 'default'}`;

  const [openedChatIds, setOpenedChatIds] = useState(() => {
    try {
      const saved = localStorage.getItem(`cb_opened_chats_${user?.id || user?._id || getStoredUser()?.id || 'default'}`);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const markChatAsOpened = (chatId) => {
    if (!chatId) return;
    setOpenedChatIds(prev => {
      const next = new Set(prev);
      next.add(String(chatId));
      try {
        localStorage.setItem(getStorageKey(), JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
  };

  const formatChatTimestamp = (dateInput) => {
    if (!dateInput) return 'Just now';
    try {
      const d = new Date(dateInput);
      if (isNaN(d.getTime())) return 'Just now';

      const now = new Date();
      const diffMs = now.getTime() - d.getTime();

      // Within 24 hours: show 12-hour time (e.g. 02:15 PM)
      if (diffMs >= 0 && diffMs < 24 * 60 * 60 * 1000) {
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }

      // Passed 24 hours: show date as dd/mm/yyyy
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return 'Just now';
    }
  };

  const getChatDateLabel = (dateInput) => {
    if (!dateInput) return 'Today';
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return 'Today';

    const now = new Date();

    // Today
    if (
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    ) {
      return 'Today';
    }

    // Yesterday
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (
      d.getDate() === yesterday.getDate() &&
      d.getMonth() === yesterday.getMonth() &&
      d.getFullYear() === yesterday.getFullYear()
    ) {
      return 'Yesterday';
    }

    // Passed days: DD/MM/YYYY
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const isSameCalendarDay = (d1, d2) => {
    if (!d1 || !d2) return false;
    const date1 = new Date(d1);
    const date2 = new Date(d2);
    if (isNaN(date1.getTime()) || isNaN(date2.getTime())) return false;
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const formatConversation = (conv) => {
    if (!conv) return {};
    const otherParticipant = (conv.participants || []).find(
      p => String(p?._id || p?.id || p) !== String(currentUserId)
    ) || (conv.participants && conv.participants[0]) || {};

    const otherUserId = String(otherParticipant?._id || otherParticipant?.id || (typeof otherParticipant === 'string' ? otherParticipant : ''));

    const name = otherParticipant.fullName || otherParticipant.name || conv.name || 'Campus Student';
    const avatar = otherParticipant.avatar || (name ? name.charAt(0).toUpperCase() : 'S');
    const productTitle = conv.product?.title || conv.productTitle || 'Campus Item';
    
    const rawDate = conv.lastMessageAt || conv.updatedAt || (
      Array.isArray(conv.messages) && conv.messages.length > 0 
        ? conv.messages[conv.messages.length - 1].createdAt 
        : null
    );
    const timeStr = formatChatTimestamp(rawDate);

    const unreadCount = Number(conv.unreadCount) || (
      Array.isArray(conv.messages) 
        ? conv.messages.filter(m => String(m.sender?._id || m.sender) !== String(currentUserId) && !m.read).length 
        : 0
    );

    return {
      id: conv._id || conv.id,
      name,
      avatar,
      verified: otherParticipant.isVerified || false,
      productTitle,
      otherUserId,
      lastMessage: conv.lastMessage || 'Conversation started',
      time: timeStr,
      lastMessageAt: rawDate,
      unreadCount,
      productId: conv.product?._id || conv.product || conv.productId,
      rawConv: conv
    };
  };

  const dismissChatNotifications = (chatId, otherUserId) => {
    if (!notifications || notifications.length === 0) return;

    const matchedNotifs = notifications.filter(n => {
      if (n.type !== 'message') return false;
      const notifConvId = String(n.conversation?._id || n.conversation || n.metadata?.conversationId || '');
      const notifSenderId = String(n.sender?._id || n.sender || '');
      if (chatId && notifConvId && notifConvId === String(chatId)) return true;
      if (otherUserId && notifSenderId && notifSenderId === String(otherUserId)) return true;
      return false;
    });

    if (matchedNotifs.length > 0) {
      const matchedIds = new Set(matchedNotifs.map(n => String(n._id || n.id)));
      if (setNotifications) {
        setNotifications(prev => prev.filter(n => !matchedIds.has(String(n._id || n.id))));
      }
      matchedNotifs.forEach(n => {
        const id = n._id || n.id;
        if (id) {
          deleteNotificationApi(id).catch(() => {});
        }
      });
    }
  };

  const getCachedChats = () => {
    try {
      const cached = JSON.parse(localStorage.getItem('campus_conversations_cache') || '[]');
      if (Array.isArray(cached) && cached.length > 0) {
        const seen = new Set();
        const unique = [];
        for (const raw of cached) {
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
        return unique;
      }
    } catch {}
    return [];
  };

  const getCachedMessages = (convId) => {
    if (!convId) return null;
    try {
      const raw = localStorage.getItem(`campus_messages_cache_${convId}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const myId = String(user?._id || user?.id || getStoredUser()?._id || getStoredUser()?.id || currentUserId || '');
          return parsed.map(m => {
            const senderId = String(m.sender?._id || m.sender?.id || m.sender || '');
            const isMe = Boolean(myId && senderId && senderId === myId) || m.sender === 'me';
            return {
              id: m._id || m.id || Math.random(),
              text: m.text,
              sender: isMe ? 'me' : 'other',
              time: m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now',
              createdAt: m.createdAt ? new Date(m.createdAt) : new Date(),
              read: Boolean(m.read)
            };
          });
        }
      }
    } catch {}
    return null;
  };

  const saveCachedMessages = (convId, rawMessages) => {
    if (!convId || !Array.isArray(rawMessages)) return;
    try {
      localStorage.setItem(`campus_messages_cache_${convId}`, JSON.stringify(rawMessages));
    } catch {}
  };

  // Helper to find an existing conversation matching a target (seller & product)
  const findMatchingConversation = (convs, target) => {
    if (!target || !Array.isArray(convs) || convs.length === 0) return null;
    const targetSellerId = String(target.sellerId || '');
    const targetProdId = String(target.productId || '');
    const targetSellerName = (target.sellerName || '').trim().toLowerCase();

    // 1. Direct match by conversation ID if present
    if (target.conversationId) {
      const direct = convs.find(c => String(c.id || c._id) === String(target.conversationId));
      if (direct) return direct;
    }

    // 2. Both product and seller match
    if (targetProdId && targetSellerId) {
      const match = convs.find(c => {
        const pId = String(c.productId || c.product?._id || c.product?.id || c.product || '');
        const otherId = String(c.otherUserId || '');
        const hasPart = (c.rawConv?.participants || c.participants || []).some(p => {
          const pid = String(p._id || p.id || p);
          return pid && (pid === targetSellerId || targetSellerId.includes(pid) || pid.includes(targetSellerId));
        });
        return pId === targetProdId && (otherId === targetSellerId || hasPart);
      });
      if (match) return match;
    }

    // 3. Match by product ID
    if (targetProdId) {
      const match = convs.find(c => {
        const pId = String(c.productId || c.product?._id || c.product?.id || c.product || '');
        return pId === targetProdId;
      });
      if (match) return match;
    }

    // 4. Match by seller ID
    if (targetSellerId && !targetSellerId.startsWith('seller_')) {
      const match = convs.find(c => {
        const otherId = String(c.otherUserId || '');
        const hasPart = (c.rawConv?.participants || c.participants || []).some(p => {
          const pid = String(p._id || p.id || p);
          return pid && pid === targetSellerId;
        });
        return otherId === targetSellerId || hasPart;
      });
      if (match) return match;
    }

    // 5. Match by seller name
    if (targetSellerName && !['campus student', 'student', 'seller'].includes(targetSellerName)) {
      const match = convs.find(c => {
        const name = (c.name || '').trim().toLowerCase();
        return name && name === targetSellerName;
      });
      if (match) return match;
    }

    return null;
  };

  // Synchronously initialize selectedChatId and messages so clicking "Chat with Seller" opens the chat window DIRECTLY
  const [selectedChatId, setSelectedChatId] = useState(() => {
    if (activeChatTarget) {
      const cached = getCachedChats();
      const existing = findMatchingConversation(cached, activeChatTarget);
      if (existing) return existing.id || existing._id;
      return `temp_${activeChatTarget.productId || 'p'}_${activeChatTarget.sellerId || 's'}`;
    }
    return null;
  });

  const [messages, setMessages] = useState(() => {
    if (activeChatTarget) {
      const cached = getCachedChats();
      const existing = findMatchingConversation(cached, activeChatTarget);
      if (existing) {
        return getCachedMessages(existing.id || existing._id) || [];
      }
    }
    return [];
  });

  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [chatsList, setChatsList] = useState(() => {
    const cached = getCachedChats();
    if (activeChatTarget) {
      const existing = findMatchingConversation(cached, activeChatTarget);
      if (!existing) {
        const tempId = `temp_${activeChatTarget.productId || 'p'}_${activeChatTarget.sellerId || 's'}`;
        const placeholder = {
          id: tempId,
          _id: tempId,
          name: activeChatTarget.sellerName || 'Campus Student',
          avatar: activeChatTarget.avatar || (activeChatTarget.sellerName ? activeChatTarget.sellerName.charAt(0).toUpperCase() : 'S'),
          verified: false,
          productTitle: activeChatTarget.productTitle || 'Campus Item',
          otherUserId: activeChatTarget.sellerId,
          lastMessage: 'Conversation started',
          time: 'Just now',
          lastMessageAt: new Date().toISOString(),
          unreadCount: 0,
          productId: activeChatTarget.productId,
          rawConv: null
        };
        return [placeholder, ...cached];
      }
    }
    return cached;
  });
  const [loadingChats, setLoadingChats] = useState(() => {
    try {
      const cached = JSON.parse(localStorage.getItem('campus_conversations_cache') || '[]');
      return !Array.isArray(cached) || cached.length === 0;
    } catch {
      return true;
    }
  });
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [onlineUserIds, setOnlineUserIds] = useState(new Set());

  // Notify parent App component whether a chatting window is active (to remove bottom navigation panel)
  useEffect(() => {
    onChatThreadStateChange?.(Boolean(selectedChatId));
  }, [selectedChatId, onChatThreadStateChange]);

  // Keep chatting container synced with mobile visual viewport height when keyboard is up
  useEffect(() => {
    if (!selectedChatId) return;

    const handleResize = () => {
      if (window.visualViewport) {
        setViewportHeight(window.visualViewport.height);
      }
    };

    handleResize();

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      window.visualViewport.addEventListener('scroll', handleResize);
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
        window.visualViewport.removeEventListener('scroll', handleResize);
      }
    };
  }, [selectedChatId]);

  // Auto-scroll messages to bottom
  const scrollToBottom = useCallback((behavior = 'auto') => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior
      });
    }
  }, []);

  useEffect(() => {
    if (selectedChatId) {
      scrollToBottom('auto');
      const timer = setTimeout(() => scrollToBottom('smooth'), 120);
      return () => clearTimeout(timer);
    }
  }, [selectedChatId, messages.length, scrollToBottom]);

  useEffect(() => {
    if (selectedChatId && isInputFocused) {
      const timer = setTimeout(() => scrollToBottom('smooth'), 100);
      return () => clearTimeout(timer);
    }
  }, [viewportHeight, isInputFocused, selectedChatId, scrollToBottom]);

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

  const targetInFlightRef = React.useRef(null);

  // Load conversations on mount
  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        if (!chatsList || chatsList.length === 0) {
          setLoadingChats(true);
        }
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

            // If the last message was sent by the current user and has 0 unread, record as opened
            const lastMsg = Array.isArray(raw.messages) && raw.messages.length > 0 
              ? raw.messages[raw.messages.length - 1] 
              : null;
            const isLastMsgMine = lastMsg && String(lastMsg.sender?._id || lastMsg.sender) === String(currentUserId);
            if (isLastMsgMine && formatted.unreadCount === 0) {
              setOpenedChatIds(prev => {
                const next = new Set(prev);
                next.add(String(formatted.id));
                return next;
              });
            }

            unique.push(formatted);
          }
          setChatsList(unique);
          if (onRefreshUnreadChats) onRefreshUnreadChats();
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
    openedFromTargetRef.current = true;

    const targetKey = `${activeChatTarget.sellerId}_${activeChatTarget.productId || 'none'}`;
    if (targetInFlightRef.current === targetKey) {
      return;
    }
    targetInFlightRef.current = targetKey;

    const currentTarget = activeChatTarget;
    if (setActiveChatTarget) setActiveChatTarget(null);

    let isMounted = true;
    async function initTargetChat() {
      // 1. Immediately select matching conversation if available in chatsList or cache
      const cached = getCachedChats();
      const existing = findMatchingConversation(chatsList, currentTarget) || findMatchingConversation(cached, currentTarget);
      if (existing) {
        const existId = existing.id || existing._id;
        setSelectedChatId(existId);
        markConversationRead(existId);
        markChatAsOpened(existId);
        dismissChatNotifications(existId, currentTarget.sellerId || existing.otherUserId);
        const cachedMsgs = getCachedMessages(existId);
        if (cachedMsgs && cachedMsgs.length > 0) {
          setMessages(cachedMsgs);
        }
      }

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
          const withoutTemp = prev.filter(c => !String(c.id).startsWith('temp_') && String(c.id) !== String(targetId));
          return [formatted, ...withoutTemp];
        });

        setSelectedChatId(targetId);
        markConversationRead(targetId);
        markChatAsOpened(targetId);
        dismissChatNotifications(targetId, currentTarget.sellerId || formatted.otherUserId);
        setChatsList(prev => prev.map(c => String(c.id) === String(targetId) ? { ...c, unreadCount: 0 } : c));
        if (onRefreshUnreadChats) onRefreshUnreadChats();

        // Load fresh messages from server
        const msgs = await fetchMessages(targetId);
        if (isMounted && Array.isArray(msgs)) {
          saveCachedMessages(targetId, msgs);
          const myId = String(user?._id || user?.id || getStoredUser()?._id || getStoredUser()?.id || currentUserId || '');
          setMessages(msgs.map(m => {
            const senderId = String(m.sender?._id || m.sender?.id || m.sender || '');
            const isMe = Boolean(myId && senderId && senderId === myId) || m.sender === 'me';
            return {
              id: m._id || m.id || Math.random(),
              text: m.text,
              sender: isMe ? 'me' : 'other',
              time: m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now',
              createdAt: m.createdAt ? new Date(m.createdAt) : new Date(),
              read: Boolean(m.read)
            };
          }));
        }
      } catch (err) {
        console.error('Failed to init target chat:', err);
      } finally {
        if (isMounted) setLoadingMessages(false);
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

  const activeChat = chatsList.find(c => String(c.id || c._id) === String(selectedChatId)) || {};

  const handleChatBack = () => {
    if (openedFromTargetRef.current) {
      openedFromTargetRef.current = false;
      setSelectedChatId(null);
      if (onNavigateBack) onNavigateBack();
      return true;
    }
    if (selectedChatId) {
      setSelectedChatId(null);
      return true;
    }
    if (onNavigateBack) {
      onNavigateBack();
      return true;
    }
    return false;
  };

  useEffect(() => {
    if (onRegisterBackHandler) {
      onRegisterBackHandler(() => {
        if (selectedChatId) {
          return handleChatBack();
        }
        return false;
      });
    }
    return () => {
      if (onRegisterBackHandler) onRegisterBackHandler(null);
    };
  }, [selectedChatId, onRegisterBackHandler, onNavigateBack]);

  const handleSelectChat = async (chatId) => {
    setSelectedChatId(chatId);
    markConversationRead(chatId);
    markChatAsOpened(chatId);
    const targetConv = chatsList.find(c => String(c.id) === String(chatId));
    dismissChatNotifications(chatId, targetConv?.otherUserId);
    setChatsList(prev => prev.map(c => String(c.id) === String(chatId) ? { ...c, unreadCount: 0 } : c));
    if (onRefreshUnreadChats) onRefreshUnreadChats();

    // Clear existing messages and show skeleton during loading
    setMessages([]);
    setLoadingMessages(true);

    try {
      const msgs = await fetchMessages(chatId);
      const myId = String(user?._id || user?.id || getStoredUser()?._id || getStoredUser()?.id || currentUserId || '');
      if (Array.isArray(msgs)) {
        saveCachedMessages(chatId, msgs);
        setMessages(msgs.map(m => {
          const senderId = String(m.sender?._id || m.sender?.id || m.sender || '');
          const isMe = Boolean(myId && senderId && senderId === myId) || m.sender === 'me';
          return {
            id: m._id || m.id || Math.random(),
            text: m.text,
            sender: isMe ? 'me' : 'other',
            time: m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now',
            createdAt: m.createdAt ? new Date(m.createdAt) : new Date(),
            read: Boolean(m.read)
          };
        }));
      }
    } catch (err) {
      console.warn('Error fetching messages for chat:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Real-time Socket.io listener for active conversation
  useEffect(() => {
    if (!selectedChatId) return;

    joinConversationRoom(selectedChatId);
    markConversationRead(selectedChatId);
    const targetConv = chatsList.find(c => String(c.id) === String(selectedChatId));
    dismissChatNotifications(selectedChatId, targetConv?.otherUserId);
    setChatsList(prev => prev.map(c => String(c.id) === String(selectedChatId) ? { ...c, unreadCount: 0 } : c));
    if (onRefreshUnreadChats) onRefreshUnreadChats();

    const unsubMsg = subscribeToChatMessages(({ conversationId, message }) => {
      if (String(conversationId) === String(selectedChatId) && message) {
        const currentUserIdStr = String(currentUserId || 'me');
        const isMine = String(message.sender?._id || message.sender) === currentUserIdStr;

        if (!isMine) {
          markConversationRead(selectedChatId);
          dismissChatNotifications(selectedChatId, String(message.sender?._id || message.sender));
          setChatsList(prev => prev.map(c => String(c.id) === String(selectedChatId) ? { ...c, unreadCount: 0 } : c));
          if (onRefreshUnreadChats) onRefreshUnreadChats();
          setMessages(prev => {
            const exists = prev.some(m => String(m.id) === String(message._id || message.id));
            if (exists) return prev;
            const next = [
              ...prev,
              {
                id: message._id || message.id || Math.random(),
                text: message.text,
                sender: 'other',
                time: message.createdAt 
                  ? new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                  : 'Now',
                createdAt: message.createdAt ? new Date(message.createdAt) : new Date(),
                read: true
              }
            ];
            saveCachedMessages(selectedChatId, next);
            return next;
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
        setMessages(prev => {
          const next = prev.map(m => m.sender === 'me' ? { ...m, read: true } : m);
          saveCachedMessages(selectedChatId, next);
          return next;
        });
      }
    });

    return () => {
      leaveConversationRoom(selectedChatId);
      unsubMsg();
      unsubRead();
    };
  }, [selectedChatId, currentUserId]);

  // Real-time listener for incoming messages to refresh inbox list and mark unread
  useEffect(() => {
    const unsubList = subscribeToChatMessages(({ conversationId, message }) => {
      if (!message || !conversationId) return;
      const currentUserIdStr = String(currentUserId || 'me');
      const isMine = String(message.sender?._id || message.sender) === currentUserIdStr;

      setChatsList(prev => prev.map(c => {
        if (String(c.id) === String(conversationId)) {
          const isCurrentlyActive = String(selectedChatId) === String(conversationId);
          return {
            ...c,
            lastMessage: message.text || c.lastMessage,
            time: 'Just now',
            unreadCount: (isCurrentlyActive || isMine) ? 0 : ((c.unreadCount || 0) + 1)
          };
        }
        return c;
      }));

      // If other user sent a message and chat is not active, reset opened status so it becomes bright
      if (!isMine && String(conversationId) !== String(selectedChatId)) {
        setOpenedChatIds(prev => {
          const next = new Set(prev);
          next.delete(String(conversationId));
          try {
            localStorage.setItem(getStorageKey(), JSON.stringify(Array.from(next)));
          } catch {}
          return next;
        });
      }
    });

    return () => unsubList();
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
      createdAt: new Date(),
      read: false // Unread until the other user views the chat
    };

    setMessages(prev => {
      const next = [...prev, newMsg];
      saveCachedMessages(selectedChatId, next);
      return next;
    });

    setChatsList(prev => prev.map(c => 
      c.id === selectedChatId 
        ? { ...c, lastMessage: trimmed, time: 'Just now' } 
        : c
    ));

    try {
      let targetSendId = selectedChatId;
      if (String(selectedChatId).startsWith('temp_')) {
        const conv = await startConversation({
          sellerId: activeChat.otherUserId,
          productId: activeChat.productId,
          initialMessage: trimmed
        });
        targetSendId = conv._id || conv.id;
        setSelectedChatId(targetSendId);
      } else {
        await sendMessage(targetSendId, trimmed);
      }
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
      className={
        selectedChatId
          ? "fixed inset-0 z-40 bg-white text-slate-900 flex flex-col justify-between overflow-hidden font-sans select-none"
          : "w-full h-full min-h-screen bg-white text-slate-900 flex flex-col justify-between overflow-hidden font-sans select-none relative"
      }
      style={
        selectedChatId && viewportHeight
          ? { height: `${viewportHeight}px`, maxHeight: `${viewportHeight}px` }
          : undefined
      }
    >
      {/* Main Container */}
      <div className={`flex-1 flex flex-col overflow-hidden min-h-0 ${selectedChatId ? 'pb-0' : (isKeyboardOpen ? 'pb-0' : 'pb-[68px]')}`}>
        
        {/* TOP HEADER BAR */}
        <div className="pt-14 pb-3.5 px-4 bg-white border-b border-slate-100 flex items-center justify-between shadow-2xs shrink-0 z-30">
          {selectedChatId ? (
            /* Active Thread Header */
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleChatBack}
                  className="w-11 h-11 min-w-[44px] max-w-[44px] min-h-[44px] max-h-[44px] rounded-full bg-[#F5F3F3] hover:bg-slate-200/60 border border-slate-100 flex items-center justify-center text-slate-900 transition-all duration-200 hover:-translate-x-1 active:-translate-x-1.5 active:scale-95 shrink-0 group"
                  title="Back to conversations"
                >
                  <ArrowLeft className="w-5.5 h-5.5 transition-transform duration-200 group-hover:-translate-x-0.5 group-active:-translate-x-1" />
                </button>

                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <div className="w-11 h-11 min-w-[44px] max-w-[44px] min-h-[44px] max-h-[44px] aspect-square rounded-full overflow-hidden shrink-0 border border-slate-200 shadow-2xs flex items-center justify-center bg-slate-100 select-none">
                      {activeChat.avatar && activeChat.avatar.length > 2 ? (
                        <img 
                          src={activeChat.avatar} 
                          alt={activeChat.name}
                          className="w-full h-full object-cover shrink-0" 
                        />
                      ) : (
                        <div className="w-full h-full bg-[#1944F1]/10 text-[#1944F1] font-bold text-sm flex items-center justify-center">
                          {activeChat.avatar || (activeChat.name ? activeChat.name.charAt(0).toUpperCase() : 'S')}
                        </div>
                      )}
                    </div>
                    {Boolean(activeChat.otherUserId && onlineUserIds.has(String(activeChat.otherUserId))) && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white z-10" />
                    )}
                  </div>
                  <div className="text-left min-w-0">
                    <h2 className="text-sm sm:text-base font-bold text-slate-900 font-sans leading-tight truncate max-w-[170px] sm:max-w-xs">
                      {activeChat.name || 'Campus Student'}
                    </h2>
                    <p className="text-xs text-[#1944F1] font-medium leading-tight truncate max-w-[170px] sm:max-w-xs mt-0.5">
                      {activeChat.productTitle || 'Campus Marketplace'}
                    </p>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setActiveNav && setActiveNav('wishlist')}
                className="w-10 h-10 min-w-[40px] max-w-[40px] min-h-[40px] max-h-[40px] rounded-full bg-[#F5F3F3] border border-slate-100 flex items-center justify-center text-slate-900 hover:bg-slate-200/60 transition-colors relative shrink-0"
                title="My Wishlist"
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path d={uploadedHeartPath} fill="none" stroke="#0F172A" strokeWidth="1.8" />
                </svg>
              </button>
            </div>
          ) : (
            /* Main Inbox Header */
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2.5">
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
                  {notifications.filter(n => n.read === false || (n.unread === true && n.read !== true)).length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4.5 h-4.5 min-w-[18px] min-h-[18px] max-w-[18px] max-h-[18px] rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-xs">
                      {notifications.filter(n => n.read === false || (n.unread === true && n.read !== true)).length > 9 
                        ? '9+' 
                        : notifications.filter(n => n.read === false || (n.unread === true && n.read !== true)).length}
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
              className="flex-1 flex flex-col overflow-hidden bg-white min-h-0"
            >
              <div 
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-2.5 no-scrollbar overscroll-contain min-h-0"
              >
                {/* Safety banner */}
                <div className="text-center my-1">
                  <span className="text-[10px] bg-slate-200/70 text-slate-600 font-semibold px-2.5 py-0.5 rounded-full">
                    Meet in a public campus area for safety
                  </span>
                </div>

                {loadingMessages && (
                  <div className="space-y-3 py-2">
                    {/* Incoming Skeleton bubble */}
                    <div className="flex items-start gap-2 max-w-[75%]">
                      <Skeleton height={28} width={28} rounded className="shrink-0 mt-1" />
                      <div className="bg-white rounded-2xl rounded-tl-xs p-3 border border-slate-100 space-y-1.5 w-48 shadow-2xs">
                        <Skeleton height={12} width="90%" />
                        <Skeleton height={12} width="60%" />
                      </div>
                    </div>
                    {/* Outgoing Skeleton bubble */}
                    <div className="flex justify-end">
                      <div className="bg-blue-50/70 rounded-2xl rounded-tr-xs p-3 border border-blue-100/60 space-y-1.5 w-44 shadow-2xs">
                        <Skeleton height={12} width="80%" />
                        <Skeleton height={12} width="50%" />
                      </div>
                    </div>
                    {/* Incoming Skeleton bubble */}
                    <div className="flex items-start gap-2 max-w-[75%]">
                      <Skeleton height={28} width={28} rounded className="shrink-0 mt-1" />
                      <div className="bg-white rounded-2xl rounded-tl-xs p-3 border border-slate-100 space-y-1.5 w-56 shadow-2xs">
                        <Skeleton height={12} width="75%" />
                      </div>
                    </div>
                    {/* Outgoing Skeleton bubble */}
                    <div className="flex justify-end">
                      <div className="bg-blue-50/70 rounded-2xl rounded-tr-xs p-3 border border-blue-100/60 space-y-1.5 w-36 shadow-2xs">
                        <Skeleton height={12} width="90%" />
                      </div>
                    </div>
                  </div>
                )}

                {!loadingMessages && messages.length === 0 && (
                  <>
                    <div className="flex justify-center my-2">
                      <span className="text-[10px] bg-slate-200/80 text-slate-600 font-semibold px-3 py-1 rounded-full shadow-2xs">
                        Today
                      </span>
                    </div>
                    <div className="text-center py-8 space-y-1">
                      <p className="text-xs text-slate-500 font-medium">No messages yet</p>
                      <p className="text-[11px] text-slate-400">Say hello or ask questions about the item.</p>
                    </div>
                  </>
                )}

                {!loadingMessages && messages.map((msg, idx) => {
                  const isMe = msg.sender === 'me';
                  const convoFallback = activeChat.lastMessageAt || activeChat.rawConv?.createdAt || new Date();
                  const currentMsgDate = msg.createdAt ? new Date(msg.createdAt) : convoFallback;

                  const prevMsg = idx > 0 ? messages[idx - 1] : null;
                  const prevMsgDate = prevMsg?.createdAt ? new Date(prevMsg.createdAt) : (prevMsg ? convoFallback : null);
                  const showDateDivider = (idx === 0) || !isSameCalendarDay(currentMsgDate, prevMsgDate);

                  return (
                    <React.Fragment key={msg.id}>
                      {showDateDivider && (
                        <div className="flex justify-center my-2">
                          <span className="text-[10px] bg-slate-200/80 text-slate-600 font-semibold px-3 py-1 rounded-full shadow-2xs">
                            {getChatDateLabel(currentMsgDate)}
                          </span>
                        </div>
                      )}

                      <div 
                        className={`flex flex-col space-y-0.5 ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div className={`max-w-[80%] px-3.5 py-2 rounded-2xl text-xs leading-relaxed font-normal shadow-2xs ${
                          isMe 
                            ? 'bg-[#1944F1] text-white rounded-tr-xs' 
                            : 'bg-[#F3F4F6] text-slate-900 rounded-tl-xs border border-slate-200/60'
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
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Quick Reply Chips */}
              <div className="px-3 py-1.5 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                {quickReplies.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      handleSendMessage(chip);
                      setTimeout(() => scrollToBottom('smooth'), 120);
                    }}
                    className="px-2.5 py-1 rounded-full bg-[#F5F3F3] hover:bg-slate-200/60 text-slate-700 text-[11px] font-medium border border-slate-100 whitespace-nowrap active:scale-95 transition-all"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Message Input Box - Fixed directly above keyboard with increased bottom spacing */}
              <div 
                className="px-3 pt-2.5 bg-white border-t border-slate-100 flex items-center gap-2 shrink-0 z-20"
                style={{ 
                  paddingBottom: isKeyboardOpen ? '14px' : 'max(24px, env(safe-area-inset-bottom, 24px))' 
                }}
              >
                <input 
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onFocus={() => {
                    setIsInputFocused(true);
                    setTimeout(() => scrollToBottom('smooth'), 120);
                  }}
                  onBlur={() => setTimeout(() => setIsInputFocused(false), 80)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSendMessage();
                      setTimeout(() => scrollToBottom('smooth'), 60);
                    }
                  }}
                  placeholder="Type a message..."
                  className="flex-1 bg-[#F5F3F3] text-slate-900 placeholder-slate-400 px-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#1944F1] border border-slate-100"
                />

                <button 
                  onClick={() => {
                    handleSendMessage();
                    setTimeout(() => scrollToBottom('smooth'), 60);
                  }}
                  className="w-9 h-9 rounded-xl bg-[#1944F1] hover:bg-blue-700 flex items-center justify-center text-white shadow-xs active:scale-95 transition-all shrink-0"
                  title="Send message"
                >
                  <ClickonsSendIcon className="w-4 h-4 fill-current text-white" />
                </button>
              </div>
            </motion.div>
          ) : (
            /* Inbox List View - Full width edge-to-edge chat rows on white background */
            <div className="flex-1 overflow-y-auto bg-white no-scrollbar">
              <div className="px-4 pt-3 pb-2 space-y-3">
                <div>
                  <h1 className="text-xl font-bold text-slate-900 font-sans tracking-tight">
                    Chats
                  </h1>
                  <p className="text-xs text-slate-500 font-normal mt-0.5">
                    Connect with buyers and sellers on campus.
                  </p>
                </div>

                {/* Search Bar (Matches Home Screen Size & Appearance) */}
                <div className="relative">
                  <img src="/search-alt-svgrepo-com.svg" alt="Search" className="w-5 h-5 absolute left-3.5 top-3.5 filter brightness-0 opacity-40 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsInputFocused(true)}
                    onBlur={() => setTimeout(() => setIsInputFocused(false), 80)}
                    placeholder="Search chats or listings..."
                    className="w-full pl-11 pr-8 py-3 bg-[#F5F3F3] text-slate-900 placeholder-slate-400 rounded-2xl text-sm font-normal focus:outline-none focus:ring-1 focus:ring-[#1944F1] border border-slate-100 shadow-2xs"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-3.5 w-4.5 h-4.5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-300 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Inbox Rows (No padding around chats, edge-to-edge with clean dividers) */}
              <div className="divide-y divide-slate-100 border-t border-slate-100">
                {loadingChats ? (
                  <div className="divide-y divide-slate-100">
                    {[1, 2, 3, 4].map(idx => (
                      <div
                        key={idx}
                        className="w-full px-4 py-3.5 flex items-center gap-3"
                      >
                        <Skeleton height={44} width={44} rounded className="shrink-0" />
                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <Skeleton height={13} width="45%" />
                            <Skeleton height={10} width={40} />
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <Skeleton height={11} width="70%" />
                            <Skeleton height={16} width={16} rounded />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredChats.length === 0 ? (
                  <div className="px-4 py-8">
                    <EmptyState
                      type="chat"
                      title="No Messages Yet"
                      description="When you inquire about an item or buyers message you about your listings, your chats will appear here."
                      actionLabel="Explore Campus"
                      actionIcon={ShoppingBag}
                      onAction={() => setActiveNav && setActiveNav('home')}
                    />
                  </div>
                ) : (
                  filteredChats.map((chat) => {
                    const isUnopened = chat.unreadCount > 0 || !openedChatIds.has(String(chat.id));
                    return (
                      <div
                        key={chat.id}
                        onClick={() => handleSelectChat(chat.id)}
                        className="w-full px-4 py-3.5 hover:bg-slate-50 active:bg-slate-100 transition-colors cursor-pointer flex items-center gap-3 group"
                      >
                        {/* Avatar */}
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

                        {/* Content column */}
                        <div className="flex-1 min-w-0">
                          {/* Row 1: Name & Timestamp/Date */}
                          <div className="flex items-center justify-between gap-2">
                            <h3 className={`text-xs font-sans truncate ${
                              isUnopened ? 'font-bold text-slate-900' : 'font-medium text-slate-600'
                            }`}>
                              {chat.name}
                            </h3>

                            <span className={`text-[10px] shrink-0 ${
                              isUnopened ? 'text-[#1944F1] font-semibold' : 'text-slate-400 font-normal'
                            }`}>
                              {chat.time}
                            </span>
                          </div>

                          {/* Row 2: Last message snippet & Unread badge / Chevron */}
                          <div className="flex items-center justify-between gap-2 mt-1">
                            <p className={`text-[11px] truncate flex-1 min-w-0 ${
                              isUnopened ? 'text-slate-900 font-semibold' : 'text-slate-400 font-normal'
                            }`}>
                              {chat.lastMessage}
                            </p>

                            <div className="shrink-0 flex items-center ml-2">
                              {chat.unreadCount > 0 ? (
                                <span className="text-[11px] font-bold text-black">
                                  {chat.unreadCount}
                                </span>
                              ) : isUnopened ? (
                                <span className="w-2 h-2 rounded-full bg-[#1944F1] ring-2 ring-white shadow-2xs" />
                              ) : (
                                <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:translate-x-0.5 transition-transform" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </AnimatePresence>

      </div>

    </motion.div>
  );
}
