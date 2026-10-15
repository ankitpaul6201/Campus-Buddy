import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Bell, 
  MessageSquare, 
  Tag, 
  Trash2, 
  Sparkles,
  ShoppingBag,
  Heart,
  CheckCheck
} from 'lucide-react';
import { 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  deleteNotificationApi, 
  clearAllNotificationsApi 
} from '../lib/api';

export default function NotificationsScreen({ 
  user, 
  activeNav, 
  setActiveNav, 
  notifications = [],
  setNotifications,
  onNavigateBack,
  onOpenChat,
  onSelectProduct
}) {
  const [activeFilter, setActiveFilter] = useState('all');

  const uploadedHeartPath = "M2 9.1371C2 14 6.01943 16.5914 8.96173 18.9109C10 19.7294 11 20.5 12 20.5C13 20.5 14 19.7294 15.0383 18.9109C17.9806 16.5914 22 14 22 9.1371C22 4.27416 16.4998 0.825464 12 5.50063C7.50016 0.825464 2 4.27416 2 9.1371Z";

  const clearAllNotifications = async () => {
    setNotifications([]);
    await clearAllNotificationsApi();
  };

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true, unread: false })));
    await markAllNotificationsAsRead();
  };

  const deleteNotification = async (id, e) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => (n._id || n.id) !== id));
    await deleteNotificationApi(id);
  };

  const handleNotificationClick = async (n) => {
    const notifId = n._id || n.id;
    // Mark as read in state & backend
    if (!n.read && n.unread !== false) {
      setNotifications(prev => prev.map(item => 
        (item._id || item.id) === notifId ? { ...item, read: true, unread: false } : item
      ));
      markNotificationAsRead(notifId);
    }

    // Smart 1-tap navigation based on notification type
    if (n.type === 'message') {
      if (onOpenChat && n.sender?._id) {
        onOpenChat({
          sellerId: n.sender._id,
          productId: n.product?._id || n.productId,
          sellerName: n.sender.fullName,
          productTitle: n.product?.title,
          avatar: n.sender.avatar
        });
      } else if (setActiveNav) {
        setActiveNav('chats');
      }
    } else if (n.type === 'like' || n.type === 'buy_intent') {
      if (n.product && onSelectProduct) {
        onSelectProduct(n.product);
      } else if (setActiveNav) {
        setActiveNav('myads');
      }
    } else if (n.actionTab && setActiveNav) {
      setActiveNav(n.actionTab);
    }
  };

  const formatNotifMeta = (n) => {
    const isUnread = !n.read && n.unread !== false;
    let category = 'System';
    let icon = Bell;
    let iconBg = 'bg-slate-100 text-slate-700';

    if (n.type === 'message') {
      category = 'Chat';
      icon = MessageSquare;
      iconBg = 'bg-blue-100 text-[#1944F1]';
    } else if (n.type === 'like') {
      category = 'Marketplace';
      icon = Heart;
      iconBg = 'bg-rose-100 text-rose-600';
    } else if (n.type === 'buy_intent') {
      category = 'Marketplace';
      icon = ShoppingBag;
      iconBg = 'bg-emerald-100 text-emerald-700';
    } else if (n.type === 'offer') {
      category = 'Marketplace';
      icon = Tag;
      iconBg = 'bg-amber-100 text-amber-700';
    }

    let timeStr = 'Just now';
    if (n.createdAt) {
      try {
        const d = new Date(n.createdAt);
        timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } catch {}
    } else if (n.time) {
      timeStr = n.time;
    }

    return {
      ...n,
      isUnread,
      category: n.category || category,
      icon,
      iconBg,
      timeStr
    };
  };

  const processedNotifications = notifications.map(formatNotifMeta);

  const filteredNotifications = processedNotifications.filter(n => {
    if (activeFilter === 'unread') return n.isUnread;
    if (activeFilter === 'marketplace') return n.category === 'Marketplace';
    if (activeFilter === 'system') return n.category === 'System';
    if (activeFilter === 'chat') return n.category === 'Chat';
    return true;
  });

  const unreadCount = processedNotifications.filter(n => n.isUnread).length;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.98 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="w-full h-full bg-white text-slate-900 flex flex-col justify-between overflow-hidden font-sans select-none relative"
    >
      {/* Scrollable Main Content */}
      <div className="flex-1 overflow-y-auto pb-28 space-y-5 bg-white">
        
        {/* 1. Header Bar: Left Back Button + Logo + Title */}
        <div className="pt-12 pb-3.5 px-4 bg-white border-b border-slate-100 flex items-center justify-between shrink-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigateBack ? onNavigateBack() : (setActiveNav && setActiveNav('home'))}
              className="w-11 h-11 min-w-[44px] max-w-[44px] min-h-[44px] max-h-[44px] rounded-full bg-[#F5F3F3] hover:bg-slate-200/60 border border-slate-100 flex items-center justify-center text-slate-900 transition-all duration-200 hover:-translate-x-1 active:-translate-x-1.5 active:scale-95 shrink-0 group"
              title="Back"
            >
              <ArrowLeft className="w-5.5 h-5.5 transition-transform duration-200 group-hover:-translate-x-0.5 group-active:-translate-x-1" />
            </button>
            <div className="w-9 h-9 rounded-lg shrink-0 overflow-hidden">
              <img 
                src="/campus-buddy-CB-exact-vector (1).svg" 
                alt="Campus Buddy" 
                className="w-full h-full object-contain" 
              />
            </div>
            <span className="text-lg font-bold text-slate-900 font-sans tracking-tight">
              Campus Buddy
            </span>
          </div>

          {/* Right Header Action Button: Heart Wishlist Button */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setActiveNav && setActiveNav('wishlist')}
              className="w-10 h-10 min-w-[40px] max-w-[40px] min-h-[40px] max-h-[40px] rounded-full bg-[#F5F3F3] border border-slate-100 flex items-center justify-center text-slate-900 shadow-xs hover:bg-slate-200/60 transition-colors relative shrink-0"
              title="My Wishlist"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" className="transition-all duration-200">
                <path d={uploadedHeartPath} fill="none" stroke="#0F172A" strokeWidth="1.8" />
              </svg>
            </button>
          </div>
        </div>

        {/* 2. Content Padding Wrapper */}
        <div className="px-5 space-y-4">
          
          {/* Page Title & Clear All / Mark Read Actions */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 font-sans tracking-tight">
                Notifications
              </h1>
              <p className="text-xs text-slate-500 font-normal mt-0.5 leading-snug">
                Stay updated on campus deals, chats, and alerts in real time.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs font-semibold text-[#1944F1] hover:bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full transition-colors shrink-0 flex items-center gap-1"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Mark Read</span>
                </button>
              )}

              {notifications.length > 0 && (
                <button
                  onClick={clearAllNotifications}
                  className="text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-100 px-3 py-1.5 rounded-full transition-colors shrink-0"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {[
              { id: 'all', label: `All (${notifications.length})` },
              { id: 'unread', label: `Unread (${unreadCount})` },
              { id: 'marketplace', label: 'Marketplace' },
              { id: 'chat', label: 'Chats' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  activeFilter === tab.id
                    ? 'bg-[#1944F1] text-white shadow-sm'
                    : 'bg-[#F5F3F3] text-slate-700 font-medium hover:bg-slate-200/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Notifications List */}
          <AnimatePresence mode="popLayout">
            {filteredNotifications.length > 0 ? (
              <div className="space-y-3 pt-1">
                {filteredNotifications.map((n) => {
                  const notifId = n._id || n.id;
                  const Icon = n.icon;
                  const senderName = n.sender?.fullName || '';
                  const senderAvatar = n.sender?.avatar;
                  const productImage = (Array.isArray(n.product?.images) && n.product.images[0]) || n.product?.images;

                  return (
                    <motion.div
                      key={notifId}
                      layout
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                      onClick={() => handleNotificationClick(n)}
                      className={`p-4 rounded-3xl border transition-all cursor-pointer flex gap-3.5 relative group ${
                        n.isUnread 
                          ? 'bg-[#EEF2FF]/60 border-blue-200 shadow-xs' 
                          : 'bg-[#F5F3F3] border-slate-100/90 hover:shadow-md'
                      }`}
                    >
                      {/* Left Icon / Avatar */}
                      <div className="relative shrink-0">
                        {senderAvatar && !['/avatar.svg', '/avatar-blue.svg'].includes(senderAvatar) ? (
                          <div className="w-10 h-10 rounded-2xl overflow-hidden border border-slate-200">
                            <img src={senderAvatar} alt={senderName} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className={`w-10 h-10 rounded-2xl ${n.iconBg} flex items-center justify-center shrink-0 shadow-2xs`}>
                            <Icon className="w-5 h-5" />
                          </div>
                        )}
                        {/* Sub badge icon */}
                        <div className={`w-4 h-4 rounded-full ${n.iconBg} absolute -bottom-1 -right-1 flex items-center justify-center ring-2 ring-white`}>
                          <Icon className="w-2.5 h-2.5" />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pr-6">
                        <div className="flex items-start justify-between gap-1">
                          <h3 className="text-xs font-bold text-slate-900 font-sans leading-snug">
                            {n.title}
                          </h3>
                        </div>

                        <p className="text-xs text-slate-600 font-normal leading-relaxed mt-1 line-clamp-2">
                          {n.message}
                        </p>

                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[10px] text-slate-400 font-medium">
                            {n.timeStr}
                          </span>
                          <span className="text-[10px] text-slate-300">·</span>
                          <span className="text-[10px] font-semibold text-[#1944F1]">
                            {n.category}
                          </span>
                        </div>
                      </div>

                      {/* Optional Right Product Thumbnail */}
                      {productImage && (
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-white border border-slate-200/80 shrink-0 self-center">
                          <img src={productImage} alt="Product" className="w-full h-full object-cover" />
                        </div>
                      )}

                      {/* Right Delete Button */}
                      <button
                        onClick={(e) => deleteNotification(notifId, e)}
                        className="w-7 h-7 rounded-full bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-500 flex items-center justify-center shrink-0 border border-slate-200/60 transition-colors absolute top-3.5 right-3.5 opacity-0 group-hover:opacity-100"
                        title="Delete notification"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Unread Indicator Dot */}
                      {n.isUnread && (
                        <span className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-[#1944F1] ring-2 ring-white" />
                      )}
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              /* Empty Notifications State */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#F5F3F3] rounded-3xl p-8 border border-slate-100/90 text-center flex flex-col items-center justify-center space-y-4 my-6"
              >
                <div className="w-20 h-20 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-300 shadow-xs relative">
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
                    <path d="M18.7491 9.70957V9.00497C18.7491 5.13623 15.7274 2 12 2C8.27256 2 5.25087 5.13623 5.25087 9.00497V9.70957C5.25087 10.5552 5.00972 11.3818 4.5578 12.0854L3.45036 13.8095C2.43882 15.3843 3.21105 17.5249 4.97036 18.0229C9.57274 19.3257 14.4273 19.3257 19.0296 18.0229C20.789 17.5249 21.5612 15.3843 20.5496 13.8095L19.4422 12.0854C18.9903 11.3818 18.7491 10.5552 18.7491 9.70957Z" stroke="#64748B" strokeWidth="1.8" />
                    <path d="M7.5 19C8.15503 20.7478 9.92246 22 12 22C14.0775 22 15.845 20.7478 16.5 19" stroke="#64748B" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                  <Sparkles className="w-5 h-5 text-amber-400 absolute -top-1 -right-1 animate-pulse" />
                </div>

                <div className="space-y-1 max-w-xs">
                  <h3 className="text-base font-bold text-slate-900 font-sans">
                    No Notifications
                  </h3>
                  <p className="text-xs text-slate-400 font-normal leading-relaxed">
                    You are all caught up! New chats, product likes, and campus updates will show up here in real time.
                  </p>
                </div>

                <button
                  onClick={() => setActiveNav && setActiveNav('home')}
                  className="px-6 py-2.5 rounded-full bg-[#1944F1] text-white hover:bg-blue-700 text-xs font-bold shadow-md shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Go to Home
                </button>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </motion.div>
  );
}
