import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, 
  MessageSquare, 
  Heart, 
  X,
  Trash2,
  Edit3,
  CheckCircle2,
  Plus,
  Bell
} from 'lucide-react';

export default function MyAdsScreen({ user, activeNav, setActiveNav, userAds = [], setUserAds, onNavigateBack }) {
  const [activeFilter, setActiveFilter] = useState('active');
  const [adsList, setAdsList] = useState(userAds);

  const handleMarkAsSold = (id) => {
    setAdsList(prev => {
      const updated = prev.map(ad => ad.id === id || ad._id === id ? { ...ad, status: ad.status === 'sold' ? 'active' : 'sold' } : ad);
      if (setUserAds) setUserAds(updated);
      return updated;
    });
  };

  const activeAds = adsList.filter(ad => ad.status === 'active');
  const soldAds = adsList.filter(ad => ad.status === 'sold');
  const displayedAds = activeFilter === 'sold' ? soldAds : activeAds;

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
        <div className="pt-12 pb-3.5 px-4 bg-white border-b border-slate-100 flex items-center justify-between shadow-2xs shrink-0 z-30">
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
              <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
            </button>
          </div>
        </div>

        {/* Page Content Padding Wrapper */}
        <div className="px-4 space-y-3 pt-1">
          
          {/* Page Title & Post New Item Button */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-900 font-sans tracking-tight">
                My Ads
              </h1>
              <p className="text-xs text-slate-500 font-normal mt-0.5 leading-snug">
                Manage your campus listings and active offers.
              </p>
            </div>

            <button
              onClick={() => setActiveNav && setActiveNav('sell')}
              className="px-3 py-1.5 rounded-full bg-[#1944F1] hover:bg-blue-700 text-white text-xs font-bold shadow-sm active:scale-95 transition-all flex items-center gap-1 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              New Ad
            </button>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
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
              displayedAds.map((ad) => (
                <div 
                  key={ad.id}
                  className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-xs flex flex-col space-y-3 hover:shadow-md transition-all"
                >
                  {/* Top Row: Details Text on the Left, Product Image Thumbnail on the Right */}
                  <div className="flex items-start justify-between gap-3">
                    
                    {/* Left Side: Details Text */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                          ad.status === 'sold' 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                            : 'bg-blue-50 text-[#1944F1] border-blue-100'
                        }`}>
                          {ad.status === 'sold' ? 'SOLD' : 'ACTIVE'}
                        </span>
                      </div>

                      <h3 className="text-xs font-bold text-slate-900 font-sans truncate leading-tight">
                        {ad.title}
                      </h3>
                      <p className="text-sm font-extrabold text-[#1944F1] mt-0.5">
                        {ad.price}
                      </p>

                      {/* Compact Stats Row */}
                      <div className="flex items-center gap-3 text-[10px] text-slate-500 font-medium mt-2">
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3 text-[#1944F1]" />
                          <span>{ad.views}</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3 text-slate-400" />
                          <span>{ad.activeChats} Chats</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Heart className="w-3 h-3 text-slate-400" />
                          <span>{ad.saves} Saved</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Side: Product Image Thumbnail */}
                    <div className="w-20 h-20 min-w-[80px] max-w-[80px] min-h-[80px] max-h-[80px] aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 shrink-0 shadow-2xs">
                      <img 
                        src={ad.image} 
                        alt={ad.title} 
                        className="w-full h-full max-w-full max-h-full object-cover shrink-0" 
                      />
                    </div>

                  </div>

                  {/* Bottom Row: Action Buttons */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <button 
                      onClick={() => setActiveNav && setActiveNav('sell')}
                      className="flex-1 py-2 px-3 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 font-bold text-xs transition-colors text-center flex items-center justify-center gap-1"
                    >
                      <Edit3 className="w-3 h-3 text-slate-500" />
                      Edit Ad
                    </button>

                    <button 
                      onClick={() => handleMarkAsSold(ad.id)}
                      className={`flex-1 py-2 px-3 rounded-full font-bold text-xs shadow-2xs transition-all text-center flex items-center justify-center gap-1 ${
                        ad.status === 'sold'
                          ? 'bg-slate-100 text-slate-600 border border-slate-200'
                          : 'bg-[#1944F1] hover:bg-blue-700 text-white'
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      {ad.status === 'sold' ? 'Mark Active' : 'Mark Sold'}
                    </button>
                  </div>

                </div>
              ))
            ) : (
              <div className="bg-white rounded-2xl p-6 border border-slate-100 text-center flex flex-col items-center justify-center space-y-2 my-2">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-[#1944F1]">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">No {activeFilter} listings</h3>
                <p className="text-xs text-slate-400">Your {activeFilter} ads will show up here.</p>
              </div>
            )}
          </div>

        </div>

      </div>

    </motion.div>
  );
}
