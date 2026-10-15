import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, 
  MessageSquare, 
  Heart, 
  X,
  Edit3,
  CheckCircle2,
  Plus,
  Bell
} from 'lucide-react';
import { updateProductStatus, fetchMyAds, formatRupeePrice, getAdStats, incrementAdViews, getOptimizedImageUrl, resolveAllUserAds } from '../lib/api';

export default function MyAdsScreen({ user, activeNav, setActiveNav, favorites = [], notifications = [], userAds = [], setUserAds, onNavigateBack, onSelectProduct }) {
  const [activeFilter, setActiveFilter] = useState('all');

  // Helper to reliably find all listings created by the current student across backend & local caches
  const resolveMyAds = (incomingList = []) => {
    return resolveAllUserAds(user, incomingList);
  };

  const [adsList, setAdsList] = useState(() => resolveMyAds(userAds));
  const [loading, setLoading] = useState(false);

  // Keep internal list in sync with parent userAds
  useEffect(() => {
    if (Array.isArray(userAds)) {
      setAdsList(resolveMyAds(userAds));
    }
  }, [userAds, user?._id, user?.id]);

  // Load from backend on mount and sync with local listings
  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        setLoading(true);
        const res = await fetchMyAds();
        if (isMounted) {
          const resolved = Array.isArray(res) ? res : [];
          setAdsList(resolved);
          if (setUserAds) setUserAds(resolved);
        }
      } catch (err) {
        console.error('Error fetching my ads:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, []);

  const handleMarkAsSold = async (id) => {
    const targetAd = adsList.find(a => (a.id === id || a._id === id));
    if (!targetAd || targetAd.status === 'sold') return; // Cannot be active again once sold!
    const targetId = targetAd._id || targetAd.id;
    const newStatus = 'sold';

    // If currently on 'active' tab and marking sold, switch to 'all' so it remains visible right there
    if (activeFilter === 'active') {
      setActiveFilter('all');
    }

    // Optimistic UI update
    const updated = adsList.map(ad => 
      (ad.id === targetId || ad._id === targetId) ? { ...ad, status: newStatus } : ad
    );
    setAdsList(updated);
    if (setUserAds) setUserAds(updated);

    try {
      await updateProductStatus(targetId, newStatus);
    } catch (err) {
      console.error('Failed to update status on server:', err);
    }
  };

  const activeAds = adsList.filter(ad => (ad.status || 'active') === 'active');
  const soldAds = adsList.filter(ad => ad.status === 'sold');
  const displayedAds = activeFilter === 'sold' 
    ? soldAds 
    : (activeFilter === 'active' 
        ? activeAds 
        : (activeFilter === 'drafts' ? [] : adsList));

  const primaryColor = '#1944F1';
  const inactiveColor = '#94A3B8';
  const uploadedHeartPath = "M2 9.1371C2 14 6.01943 16.5914 8.96173 18.9109C10 19.7294 11 20.5 12 20.5C13 20.5 14 19.7294 15.0383 18.9109C17.9806 16.5914 22 14 22 9.1371C22 4.27416 16.4998 0.825464 12 5.50063C7.50016 0.825464 2 4.27416 2 9.1371Z";

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="w-full h-full min-h-screen bg-[#F4F6FB] text-slate-900 flex flex-col justify-between overflow-hidden font-sans select-none relative"
    >
      {/* Scrollable Main Content Container */}
      <div className="flex-1 overflow-y-auto pb-20 space-y-3 bg-[#F4F6FB] no-scrollbar">
        
        {/* COMPACT TOP HEADER BAR - BROUGHT DOWN CLEANLY WITH TOP SAFE PADDING */}
        <div className="pt-14 pb-3.5 px-4 bg-white border-b border-slate-100 flex items-center justify-between shadow-2xs shrink-0 z-30">
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

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setActiveNav && setActiveNav('wishlist')}
              className="w-10 h-10 min-w-[40px] max-w-[40px] min-h-[40px] max-h-[40px] rounded-full bg-[#F5F3F3] border border-slate-100 flex items-center justify-center text-slate-900 relative shrink-0"
              title="My Wishlist"
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

        {/* Page Content Padding Wrapper */}
        <div className="px-4 space-y-3 pt-1">
          
          {/* Page Title */}
          <div>
            <h1 className="text-xl font-bold text-slate-900 font-sans tracking-tight">
              My Ads
            </h1>
            <p className="text-xs text-slate-500 font-normal mt-0.5 leading-snug">
              Manage your campus listings and active offers.
            </p>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                activeFilter === 'all'
                  ? 'bg-[#1944F1] text-white shadow-xs'
                  : 'bg-white text-slate-700 font-semibold border border-slate-100 hover:bg-slate-50'
              }`}
            >
              All ({adsList.length})
            </button>

            <button
              onClick={() => setActiveFilter('active')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                activeFilter === 'active'
                  ? 'bg-[#1944F1] text-white shadow-xs'
                  : 'bg-white text-slate-700 font-semibold border border-slate-100 hover:bg-slate-50'
              }`}
            >
              Active ({activeAds.length})
            </button>
            
            <button
              onClick={() => setActiveFilter('sold')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                activeFilter === 'sold'
                  ? 'bg-[#1944F1] text-white shadow-xs'
                  : 'bg-white text-slate-700 font-semibold border border-slate-100 hover:bg-slate-50'
              }`}
            >
              Sold ({soldAds.length})
            </button>
            
            <button
              onClick={() => setActiveFilter('drafts')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                activeFilter === 'drafts'
                  ? 'bg-[#1944F1] text-white shadow-xs'
                  : 'bg-white text-slate-700 font-semibold border border-slate-100 hover:bg-slate-50'
              }`}
            >
              Drafts (0)
            </button>
          </div>

          {/* Listings Cards Container */}
          <div className="space-y-3 pt-0.5">
            {displayedAds.length > 0 ? (
              displayedAds.map((ad) => {
                const stats = getAdStats(ad, favorites, user?.id || user?._id);
                return (
                <div 
                  key={ad._id || ad.id}
                  className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-xs flex flex-col space-y-3 hover:shadow-md transition-all"
                >
                    {/* Top Row: Details Text on the Left, Product Image Thumbnail on the Right */}
                    <div 
                      onClick={() => {
                        // Viewing your own ad in My Ads does NOT increment view count
                        if (onSelectProduct) onSelectProduct(ad);
                      }}
                      className="flex items-start justify-between gap-3 cursor-pointer group"
                    >
                      
                      {/* Left Side: Details Text */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border tracking-wider ${
                            ad.status === 'sold' 
                              ? 'bg-rose-50 text-rose-600 border-rose-200' 
                              : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                          }`}>
                            {ad.status === 'sold' ? 'SOLD' : 'ACTIVE'}
                          </span>
                        </div>

                        <h3 className="text-xs font-bold text-slate-900 font-sans truncate leading-tight">
                          {ad.title}
                        </h3>
                        <p className="text-sm font-extrabold text-black mt-0.5">
                          {formatRupeePrice(ad.price)}
                        </p>

                        {/* Compact Stats Row */}
                        <div className="flex items-center gap-3 text-[10px] text-slate-500 font-medium mt-2">
                          <div className="flex items-center gap-1" title="Views">
                            <Eye className="w-3 h-3 text-[#1944F1]" />
                            <span>{stats.views} {stats.views === 1 ? 'View' : 'Views'}</span>
                          </div>
                          
                          <div className="flex items-center gap-1" title="Chats">
                            <MessageSquare className="w-3 h-3 text-slate-400" />
                            <span>{stats.chats} {stats.chats === 1 ? 'Chat' : 'Chats'}</span>
                          </div>
                          
                          <div className="flex items-center gap-1" title="Likes / Wishlisted">
                            <Heart className={`w-3 h-3 ${stats.likes > 0 ? 'text-rose-500 fill-rose-500' : 'text-slate-400'}`} />
                            <span>{stats.likes} {stats.likes === 1 ? 'Like' : 'Likes'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Side: Product Image Thumbnail */}
                      <div className="w-20 h-20 min-w-[80px] max-w-[80px] min-h-[80px] max-h-[80px] aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 shrink-0 shadow-2xs relative">
                        <img 
                          src={getOptimizedImageUrl(ad.image || (ad.images && ad.images[0]) || '/api/placeholder/100/100', 160)} 
                          alt={ad.title} 
                          loading="lazy"
                          className={`w-full h-full max-w-full max-h-full object-cover shrink-0 ${ad.status === 'sold' ? 'opacity-60' : ''}`} 
                        />
                        {ad.status === 'sold' && (
                          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[0.5px] flex items-center justify-center">
                            <span className="text-[10px] font-extrabold text-white bg-rose-600 px-1.5 py-0.5 rounded shadow-sm tracking-wider">
                              SOLD
                            </span>
                          </div>
                        )}
                      </div>

                    </div>

                    {/* Bottom Row: Action Buttons */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                      {ad.status === 'sold' ? (
                        <div className="w-full py-2.5 px-4 rounded-full font-light text-xs text-center flex items-center justify-center gap-1.5 bg-rose-50 text-rose-600 border border-rose-100 select-none">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Item Sold</span>
                        </div>
                      ) : (
                        <button 
                          onClick={() => handleMarkAsSold(ad._id || ad.id)}
                          className="w-full py-2.5 px-4 rounded-full font-light text-xs shadow-2xs transition-all text-center flex items-center justify-center gap-1.5 bg-[#1944F1] hover:bg-blue-700 text-white active:scale-[0.98]"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark as Sold</span>
                        </button>
                      )}
                    </div>

                  </div>
                );
              })
              ) : (
                <div className="bg-white rounded-2xl p-7 border border-slate-100 text-center flex flex-col items-center justify-center space-y-2.5 my-2 shadow-2xs">
                  <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-[#1944F1]">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">No {activeFilter} listings</h3>
                  <p className="text-xs text-slate-400 max-w-[220px]">
                    {activeFilter === 'active' 
                      ? 'You have not listed any items for sale yet.' 
                      : `Your ${activeFilter} items will appear here.`}
                  </p>
                  {activeFilter === 'active' && (
                    <button
                      onClick={() => setActiveNav && setActiveNav('sell')}
                      className="mt-1 px-4 py-2 rounded-full bg-[#1944F1] text-white text-xs font-bold shadow-xs hover:bg-blue-700 transition-all flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Post an Ad
                    </button>
                  )}
                </div>
              )}
          </div>

        </div>

      </div>

    </motion.div>
  );
}
