import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Bell, 
  MessageSquare, 
  Tag, 
  ShieldCheck, 
  CheckCheck, 
  Trash2, 
  Sparkles,
  ShoppingBag,
  TrendingDown,
  Info
} from 'lucide-react';

export default function NotificationsScreen({ 
  user, 
  activeNav, 
  setActiveNav, 
  notifications = [],
  setNotifications,
  onNavigateBack 
}) {
  const [activeFilter, setActiveFilter] = useState('all');

  const primaryColor = '#1944F1';
  const inactiveColor = '#94A3B8';
  const uploadedHeartPath = "M2 9.1371C2 14 6.01943 16.5914 8.96173 18.9109C10 19.7294 11 20.5 12 20.5C13 20.5 14 19.7294 15.0383 18.9109C17.9806 16.5914 22 14 22 9.1371C22 4.27416 16.4998 0.825464 12 5.50063C7.50016 0.825464 2 4.27416 2 9.1371Z";

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const deleteNotification = (id, e) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === 'unread') return n.unread;
    if (activeFilter === 'marketplace') return n.category === 'Marketplace';
    if (activeFilter === 'system') return n.category === 'System';
    return true;
  });

  const unreadCount = notifications.filter(n => n.unread).length;

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
        
        {/* 1. Header Bar: Left Back Button + Logo + Title - BROUGHT DOWN CLEANLY WITH TOP SAFE PADDING */}
        <div className="pt-12 pb-3.5 px-4 bg-white border-b border-slate-100 flex items-center justify-between shrink-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigateBack ? onNavigateBack() : (setActiveNav && setActiveNav('home'))}
              className="w-11 h-11 min-w-[44px] max-w-[44px] min-h-[44px] max-h-[44px] rounded-full bg-[#F5F3F3] hover:bg-slate-200/60 border border-slate-100 flex items-center justify-center text-slate-900 transition-colors shrink-0"
              title="Back"
            >
              <ArrowLeft className="w-5.5 h-5.5" />
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

          {/* Right Header Action Button: Heart Wishlist Button (Bell Icon is HIDDEN on Notifications page) */}
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
          
          {/* Page Title & Clear All Action */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 font-sans tracking-tight">
                Notifications
              </h1>
              <p className="text-xs text-slate-500 font-normal mt-0.5 leading-snug">
                Stay updated on campus deals, chats, and alerts.
              </p>
            </div>

            {notifications.length > 0 && (
              <button
                onClick={clearAllNotifications}
                className="text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-100 px-3 py-1.5 rounded-full transition-colors shrink-0"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {[
              { id: 'all', label: `All (${notifications.length})` },
              { id: 'unread', label: `Unread (${unreadCount})` },
              { id: 'marketplace', label: 'Marketplace' },
              { id: 'system', label: 'System' }
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
                  const Icon = n.icon;
                  return (
                    <motion.div
                      key={n.id}
                      layout
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                      onClick={() => setActiveNav && setActiveNav(n.actionTab)}
                      className={`p-4 rounded-3xl border transition-all cursor-pointer flex gap-3.5 relative group ${
                        n.unread 
                          ? 'bg-[#EEF2FF]/60 border-blue-200 shadow-xs' 
                          : 'bg-[#F5F3F3] border-slate-100/90 hover:shadow-md'
                      }`}
                    >
                      {/* Left Icon */}
                      <div className={`w-10 h-10 rounded-2xl ${n.iconBg} flex items-center justify-center shrink-0 shadow-2xs`}>
                        <Icon className="w-5 h-5" />
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
                            {n.time}
                          </span>
                          <span className="text-[10px] text-slate-300">·</span>
                          <span className="text-[10px] font-semibold text-[#1944F1]">
                            {n.category}
                          </span>
                        </div>
                      </div>

                      {/* Right Delete Button */}
                      <button
                        onClick={(e) => deleteNotification(n.id, e)}
                        className="w-7 h-7 rounded-full bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-500 flex items-center justify-center shrink-0 border border-slate-200/60 transition-colors absolute top-3.5 right-3.5 opacity-0 group-hover:opacity-100"
                        title="Delete notification"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Unread Indicator Dot */}
                      {n.unread && (
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
                    You are all caught up! New price drops, chats, and account updates will show up here.
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
