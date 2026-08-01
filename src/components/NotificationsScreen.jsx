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

      {/* 3. Bottom Navigation Dock */}
      <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-100 px-7 py-2.5 flex items-center justify-between z-30 shadow-lg">
        
        {/* 1. Home Tab */}
        <button
          onClick={() => setActiveNav && setActiveNav('home')}
          className="flex flex-col items-center justify-center gap-1 py-0.5 px-2 transition-all group min-w-[50px]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" className="transition-transform duration-200">
            <path 
              d="M2 12.2039C2 9.91549 2 8.77128 2.5192 7.82274C3.0384 6.87421 3.98695 6.28551 5.88403 5.10813L7.88403 3.86687C9.88939 2.62229 10.8921 2 12 2C13.1079 2 14.1106 2.62229 16.116 3.86687L18.116 5.10812C20.0131 6.28551 20.9616 6.87421 21.4808 7.82274C22 8.77128 22 9.91549 22 12.2039V13.725C22 17.6258 22 19.5763 20.8284 20.7881C19.6569 22 17.7712 22 14 22H10C6.22876 22 4.34315 22 3.17157 20.7881C2 19.5763 2 17.6258 2 13.725V12.2039Z" 
              fill={activeNav === 'home' ? primaryColor : 'none'} 
              stroke={activeNav === 'home' ? primaryColor : inactiveColor} 
              strokeWidth="1.5" 
            />
            <path 
              d="M15 18H9" 
              stroke={activeNav === 'home' ? '#FFFFFF' : inactiveColor} 
              strokeWidth="1.5" 
              strokeLinecap="round" 
            />
          </svg>
          <span className={`text-[11px] transition-colors ${
            activeNav === 'home' ? 'text-[#1944F1] font-semibold' : 'text-slate-400 font-medium'
          }`}>
            Home
          </span>
        </button>

        {/* 2. Chats Tab */}
        <button
          onClick={() => setActiveNav && setActiveNav('chats')}
          className="flex flex-col items-center justify-center gap-1 py-0.5 px-2 transition-all group min-w-[50px]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" className="transition-transform duration-200">
            <path 
              fillRule="evenodd" 
              clipRule="evenodd" 
              d="M12 2.75C6.89137 2.75 2.75 6.89137 2.75 12C2.75 13.4811 3.09753 14.8788 3.7148 16.1181C3.96254 16.6155 4.05794 17.2103 3.90163 17.7945L3.30602 20.0205C3.19663 20.4293 3.57066 20.8034 3.97949 20.694L6.20553 20.0984C6.78973 19.9421 7.38451 20.0375 7.88191 20.2852C9.12121 20.9025 10.5189 21.25 12 21.25C17.1086 21.25 21.25 17.1086 21.25 12C21.25 6.89137 17.1086 2.75 12 2.75Z" 
              fill={activeNav === 'chats' ? primaryColor : 'none'} 
              stroke={activeNav === 'chats' ? primaryColor : inactiveColor} 
              strokeWidth="1.4" 
            />
            <path d="M8 10.5H16" stroke={activeNav === 'chats' ? '#FFFFFF' : inactiveColor} strokeWidth="1.5" strokeLinecap="round" />
            <path d="M8 14H13.5" stroke={activeNav === 'chats' ? '#FFFFFF' : inactiveColor} strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span className={`text-[11px] transition-colors ${
            activeNav === 'chats' ? 'text-[#1944F1] font-semibold' : 'text-slate-400 font-medium'
          }`}>
            Chats
          </span>
        </button>

        {/* 3. Floating Center Sell Button */}
        <div className="-mt-6 flex flex-col items-center justify-center px-1">
          <button
            onClick={() => setActiveNav && setActiveNav('sell')}
            className={`w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 p-2 ${
              activeNav === 'sell'
                ? 'bg-[#1944F1] text-white shadow-blue-500/30 ring-2 ring-blue-400/30 scale-105'
                : 'bg-[#1944F1]/90 text-white shadow-blue-500/20 opacity-80'
            }`}
          >
            <img src="/add-ellipse-svgrepo-com.svg" alt="Sell" className="w-6.5 h-6.5 filter brightness-0 invert" />
          </button>
          <span className={`text-[11px] block text-center mt-0.5 transition-colors ${
            activeNav === 'sell' ? 'text-[#1944F1] font-semibold' : 'text-slate-400 font-medium'
          }`}>
            Sell
          </span>
        </div>

        {/* 4. My Ads Tab */}
        <button
          onClick={() => setActiveNav && setActiveNav('myads')}
          className="flex flex-col items-center justify-center gap-1 py-0.5 px-2 transition-all group min-w-[50px]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" className="transition-transform duration-200">
            <g fill={activeNav === 'myads' ? primaryColor : inactiveColor}>
              <path fillRule="evenodd" clipRule="evenodd" d="M5.25 14.5001C5.25 14.0858 5.58579 13.7501 6 13.7501H14C14.4142 13.7501 14.75 14.0858 14.75 14.5001C14.75 14.9143 14.4142 15.2501 14 15.2501H6C5.58579 15.2501 5.25 14.9143 5.25 14.5001Z" />
              <path fillRule="evenodd" clipRule="evenodd" d="M5.25 18C5.25 17.5858 5.58579 17.25 6 17.25H11.5C11.9142 17.25 12.25 17.5858 12.25 18C12.25 18.4143 11.9142 18.75 11.5 18.75H6C5.58579 18.75 5.25 18.4143 5.25 18Z" />
              <path fillRule="evenodd" clipRule="evenodd" d="M12.25 2.83422C11.7896 2.75598 11.162 2.75005 10.0298 2.75005C8.11311 2.75005 6.75075 2.75163 5.71785 2.88987C4.70596 3.0253 4.12453 3.27933 3.7019 3.70195C3.27869 4.12516 3.02502 4.70481 2.88976 5.7109C2.75159 6.73856 2.75 8.09323 2.75 10.0001V14.0001C2.75 15.9069 2.75159 17.2615 2.88976 18.2892C3.02502 19.2953 3.27869 19.8749 3.7019 20.2981C4.12511 20.7214 4.70476 20.975 5.71085 21.1103C6.73851 21.2485 8.09318 21.2501 10 21.2501H14C15.9068 21.2501 17.2615 21.2485 18.2892 21.1103C19.2952 20.975 19.8749 20.7214 20.2981 20.2981C20.7213 19.8749 20.975 19.2953 21.1102 18.2892C21.2484 17.2615 21.25 15.9069 21.25 14.0001V13.5629C21.25 12.0269 21.2392 11.2988 21.0762 10.7501H17.9463C16.8135 10.7501 15.8877 10.7501 15.1569 10.6518C14.3929 10.5491 13.7306 10.3268 13.2019 9.79815C12.6732 9.26945 12.4509 8.60712 12.3482 7.84317C12.25 7.1123 12.25 6.18657 12.25 5.05374V2.83422ZM13.75 3.6095V5.00005C13.75 6.19976 13.7516 7.0241 13.8348 7.64329C13.9152 8.24091 14.059 8.53395 14.2626 8.73749C14.4661 8.94103 14.7591 9.08486 15.3568 9.16521C15.976 9.24846 16.8003 9.25005 18 9.25005H20.0195C19.723 8.9625 19.3432 8.61797 18.85 8.17407L14.8912 4.61117C14.4058 4.17433 14.0446 3.85187 13.75 3.6095ZM10.1755 1.25002C11.5601 1.24965 12.4546 1.24942 13.2779 1.56535C14.1012 1.88129 14.7632 2.47735 15.7873 3.39955C15.8226 3.43139 15.8584 3.46361 15.8947 3.49623L19.8534 7.05912C19.8956 7.09705 19.9372 7.1345 19.9783 7.17149C21.162 8.23614 21.9274 8.92458 22.3391 9.84902C22.7508 10.7734 22.7505 11.8029 22.75 13.3949C22.75 13.4502 22.75 13.5062 22.75 13.5629V14.0565C22.75 15.8942 22.75 17.3499 22.5969 18.4891C22.4392 19.6615 22.1071 20.6104 21.3588 21.3588C20.6104 22.1072 19.6614 22.4393 18.489 22.5969C17.3498 22.7501 15.8942 22.7501 14.0564 22.7501H9.94359C8.10583 22.7501 6.65019 22.7501 5.51098 22.5969C4.33856 22.4393 3.38961 22.1072 2.64124 21.3588C1.89288 20.6104 1.56076 19.6615 1.40314 18.4891C1.24997 17.3499 1.24998 15.8942 1.25 14.0565V9.94363C1.24998 8.10587 1.24997 6.65024 1.40314 5.51103C1.56076 4.33861 1.89288 3.38966 2.64124 2.64129C3.39019 1.89235 4.34232 1.56059 5.51887 1.40313C6.66283 1.25002 8.1257 1.25003 9.97352 1.25005L10.0298 1.25005C10.0789 1.25005 10.1275 1.25004 10.1755 1.25002Z" />
            </g>
          </svg>
          <span className={`text-[11px] transition-colors ${
            activeNav === 'myads' ? 'text-[#1944F1] font-semibold' : 'text-slate-400 font-medium'
          }`}>
            My Ads
          </span>
        </button>

        {/* 5. Profile Tab */}
        <button
          onClick={() => setActiveNav && setActiveNav('profile')}
          className="flex flex-col items-center justify-center gap-0.5 py-0.5 px-2 transition-all group min-w-[50px]"
        >
          <svg width="20" height="20" viewBox="0 0 32 32" className="transition-transform duration-200">
            <g id="about">
              <path 
                d="M16,16A7,7,0,1,0,9,9,7,7,0,0,0,16,16Z" 
                fill={activeNav === 'profile' ? primaryColor : 'none'} 
                stroke={activeNav === 'profile' ? primaryColor : inactiveColor} 
                strokeWidth="1.8" 
              />
              <path 
                d="M17,18H15A11,11,0,0,0,4,29a1,1,0,0,0,1,1H27a1,1,0,0,0,1-1A11,11,0,0,0,17,18Z" 
                fill={activeNav === 'profile' ? primaryColor : 'none'} 
                stroke={activeNav === 'profile' ? primaryColor : inactiveColor} 
                strokeWidth="1.8" 
              />
            </g>
          </svg>
          <span className={`text-[11px] transition-colors flex flex-col items-center ${
            activeNav === 'profile' ? 'text-[#1944F1] font-bold' : 'text-slate-400 font-medium'
          }`}>
            Profile
          </span>
        </button>

      </div>
    </motion.div>
  );
}
