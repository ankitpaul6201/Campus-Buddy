import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Trash2, 
  ShoppingBag, 
  MessageSquare, 
  CheckCircle2, 
  Search, 
  Sparkles,
  Bell
} from 'lucide-react';

export default function WishlistScreen({ 
  user, 
  activeNav, 
  setActiveNav, 
  onNavigateBack, 
  favorites = [], 
  setFavorites,
  notifications = [],
  productsList
}) {
  const [searchQuery, setSearchQuery] = useState('');

  // Sample products fallback if not provided
  const allProducts = productsList || [
    {
      id: 'card-1',
      title: 'Engineering Mathematics Vol 2',
      price: '$45',
      condition: 'LIKE NEW',
      conditionColor: 'bg-[#E0F2FE] text-[#0284C7]',
      image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
      sellerName: 'Rahul',
      sellerAvatar: 'R',
      sellerBg: 'bg-blue-100 text-blue-700',
      verified: true,
      timeAgo: '2h ago',
      category: 'Books & Notes'
    },
    {
      id: 'card-2',
      title: 'TI-84 Plus CE Graphing Calculator',
      price: '$80',
      condition: 'GOOD',
      conditionColor: 'bg-[#EEF2FF] text-[#4F46E5]',
      image: 'https://images.unsplash.com/photo-1611125832047-1d7ad1e8e48b?auto=format&fit=crop&w=600&q=80',
      sellerName: 'Sarah',
      sellerAvatar: 'S',
      sellerBg: 'bg-indigo-100 text-indigo-700',
      verified: false,
      timeAgo: '5h ago',
      category: 'Electronics'
    },
    {
      id: 'card-3',
      title: 'Hercules Roadeo Campus Cycle',
      price: '$120',
      condition: 'FAIR',
      conditionColor: 'bg-[#FFEDD5] text-[#EA580C]',
      image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=600&q=80',
      sellerName: 'Karan',
      sellerAvatar: 'K',
      sellerBg: 'bg-emerald-100 text-emerald-700',
      verified: true,
      timeAgo: '1d ago',
      category: 'Cycles & Vehicles'
    }
  ];

  const wishlistedItems = allProducts
    .filter(p => favorites.includes(p.id))
    .filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const removeFromFavorites = (id) => {
    if (setFavorites) {
      setFavorites(prev => prev.filter(favId => favId !== id));
    }
  };

  const clearAllFavorites = () => {
    if (setFavorites) {
      setFavorites([]);
    }
  };

  const primaryColor = '#1944F1';
  const inactiveColor = '#94A3B8';
  const uploadedHeartPath = "M2 9.1371C2 14 6.01943 16.5914 8.96173 18.9109C10 19.7294 11 20.5 12 20.5C13 20.5 14 19.7294 15.0383 18.9109C17.9806 16.5914 22 14 22 9.1371C22 4.27416 16.4998 0.825464 12 5.50063C7.50016 0.825464 2 4.27416 2 9.1371Z";

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
        
        {/* 1. Header Bar: Plain White with Back Button, Logo + Title - BROUGHT DOWN CLEANLY WITH TOP SAFE PADDING */}
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

          {/* Right Action Button: Bell Icon ONLY (Heart Icon NOT visible) */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setActiveNav && setActiveNav('notifications')}
              className="w-10 h-10 min-w-[40px] max-w-[40px] min-h-[40px] max-h-[40px] rounded-full bg-[#F5F3F3] border border-slate-100 flex items-center justify-center text-slate-900 shadow-xs hover:bg-slate-200/60 transition-colors relative shrink-0"
              title="Notifications"
            >
              <img src="/bell-svgrepo-com.svg" alt="Notifications" className="w-[22px] h-[22px] object-contain filter brightness-0 opacity-90" />
              {notifications.filter(n => n.unread).length > 0 && (
                <span className="absolute -top-1 -right-1 w-4.5 h-4.5 min-w-[18px] min-h-[18px] max-w-[18px] max-h-[18px] rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-xs">
                  {notifications.filter(n => n.unread).length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* 2. Content Padding Wrapper */}
        <div className="px-5 space-y-4">
          
          {/* Page Title & Clear All Action */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 font-sans tracking-tight">
                My Wishlist 
              </h1>
              <p className="text-xs text-slate-500 font-normal mt-0.5 leading-snug">
                Manage your bookmarked items and saved products.
              </p>
            </div>

            {wishlistedItems.length > 0 && (
              <button
                onClick={clearAllFavorites}
                className="text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-100 px-3 py-1.5 rounded-full transition-colors shrink-0"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Search Bar inside Wishlist */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search saved items..."
              className="w-full bg-[#F5F3F3] text-slate-900 placeholder-slate-400 text-xs font-normal rounded-2xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1944F1] border border-slate-100"
            />
          </div>

          {/* Saved Product Items Grid */}
          <AnimatePresence mode="popLayout">
            {wishlistedItems.length > 0 ? (
              <div className="space-y-3 pt-1">
                {wishlistedItems.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    className="bg-[#F5F3F3] rounded-3xl p-3.5 border border-slate-100/90 shadow-xs hover:shadow-md transition-all flex gap-3.5 group relative overflow-hidden"
                  >
                    {/* Product Thumbnail */}
                    <div className="w-24 h-24 rounded-2xl overflow-hidden bg-white shrink-0 relative">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className={`absolute top-2 left-2 px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${item.conditionColor}`}>
                        {item.condition}
                      </span>
                    </div>

                    {/* Details Column */}
                    <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2 font-sans">
                            {item.title}
                          </h3>

                          {/* Delete Item Button */}
                          <button
                            onClick={() => removeFromFavorites(item.id)}
                            className="w-7 h-7 rounded-full bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-500 flex items-center justify-center shrink-0 border border-slate-200/60 transition-colors"
                            title="Remove from Wishlist"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm font-extrabold text-[#1944F1] font-sans">
                            {item.price}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            · {item.category || 'Marketplace'}
                          </span>
                        </div>
                      </div>

                      {/* Seller Info & Chat Action */}
                      <div className="flex items-center justify-between border-t border-slate-200/60 pt-2 mt-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <div className={`w-5 h-5 rounded-full ${item.sellerBg || 'bg-blue-100 text-blue-700'} text-[10px] font-bold flex items-center justify-center shrink-0`}>
                            {item.sellerAvatar || item.sellerName?.[0] || 'S'}
                          </div>
                          <span className="text-[11px] font-medium text-slate-700 truncate">
                            {item.sellerName}
                          </span>
                          {item.verified && (
                            <CheckCircle2 className="w-3 h-3 text-[#1944F1] shrink-0" />
                          )}
                        </div>

                        <button
                          onClick={() => setActiveNav && setActiveNav('chats')}
                          className="px-3.5 py-1 rounded-full bg-[#1944F1] text-white hover:bg-blue-700 font-semibold text-[11px] transition-colors flex items-center gap-1 shrink-0 shadow-2xs"
                        >
                          <MessageSquare className="w-3 h-3" />
                          Chat
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              /* Empty State View */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#F5F3F3] rounded-3xl p-8 border border-slate-100/90 text-center flex flex-col items-center justify-center space-y-4 my-6"
              >
                <div className="w-20 h-20 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-300 shadow-xs relative">
                  <svg width="36" height="36" viewBox="0 0 24 24">
                    <path d={uploadedHeartPath} fill="none" stroke="#94A3B8" strokeWidth="1.8" />
                  </svg>
                  <Sparkles className="w-5 h-5 text-amber-400 absolute -top-1 -right-1 animate-pulse" />
                </div>

                <div className="space-y-1 max-w-xs">
                  <h3 className="text-base font-bold text-slate-900 font-sans">
                    Your Wishlist is Empty
                  </h3>
                  <p className="text-xs text-slate-400 font-normal leading-relaxed">
                    Tap the heart icon on any textbook, gadget, or campus ad to save it here.
                  </p>
                </div>

                <button
                  onClick={() => setActiveNav && setActiveNav('home')}
                  className="px-6 py-2.5 rounded-full bg-[#1944F1] text-white hover:bg-blue-700 text-xs font-bold shadow-md shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Explore Campus Items
                </button>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </motion.div>
  );
}
