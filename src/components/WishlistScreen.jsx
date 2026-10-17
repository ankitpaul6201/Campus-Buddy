import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Trash2, 
  ShoppingBag, 
  MessageSquare, 
  Search, 
  Sparkles,
  Bell
} from 'lucide-react';
import { formatRupeePrice, fetchProducts, updateAdLikes, incrementAdViews } from '../lib/api';

export default function WishlistScreen({ 
  user, 
  activeNav, 
  setActiveNav, 
  onNavigateBack, 
  favorites = [], 
  setFavorites,
  notifications = [],
  userAds = [],
  productsList,
  onSelectProduct,
  onOpenChat
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const isProductInUserUniversity = (product, userUni = user?.universityName) => {
    if (!userUni || !userUni.trim()) return true;
    if (!product) return false;
    const target = userUni.toLowerCase().trim();
    const prodCampus = (product.campusName || '').toLowerCase().trim();
    const prodUni = (product.universityName || '').toLowerCase().trim();
    const sellerUni = (product.seller?.universityName || '').toLowerCase().trim();

    return (
      (prodCampus && (prodCampus.includes(target) || target.includes(prodCampus))) ||
      (prodUni && (prodUni.includes(target) || target.includes(prodUni))) ||
      (sellerUni && (sellerUni.includes(target) || target.includes(sellerUni)))
    );
  };

  const [dbProducts, setDbProducts] = useState(() => {
    try {
      const cached = JSON.parse(localStorage.getItem('campus_products_cache') || '[]');
      const userCached = JSON.parse(localStorage.getItem('campus_user_ads') || '[]');
      const map = new Map();
      cached.forEach(p => {
        if (p && isProductInUserUniversity(p)) map.set(String(p._id || p.id), p);
      });
      userCached.forEach(p => {
        if (p && isProductInUserUniversity(p)) map.set(String(p._id || p.id), p);
      });
      return Array.from(map.values());
    } catch {
      return [];
    }
  });

  const [loading, setLoading] = useState(true);

  // Fetch backend products dynamically on mount to ensure all listings are available
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setDbProducts([]);
        const data = await fetchProducts(user?.universityName || '');
        if (isMounted && Array.isArray(data)) {
          const strictlyFiltered = data.filter(p => p && isProductInUserUniversity(p));
          setDbProducts(strictlyFiltered);
        }
      } catch (e) {
        console.warn('WishlistScreen: could not fetch products from server', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, [user?.universityName]);

  // Aggregate all products across dbProducts, userAds, and productsList
  const allAvailableProducts = useMemo(() => {
    const map = new Map();
    // 1. Database & cached products
    (dbProducts || []).forEach(p => map.set(String(p._id || p.id), p));
    // 2. User created ads
    (userAds || []).forEach(p => map.set(String(p._id || p.id), p));
    // 3. Any explicit productsList passed from parent
    (productsList || []).forEach(p => map.set(String(p._id || p.id), p));
    return Array.from(map.values());
  }, [dbProducts, userAds, productsList]);

  // Automatically sanitize favorites to prune orphaned / non-existent product IDs once products are loaded
  useEffect(() => {
    if (!setFavorites || !Array.isArray(favorites) || favorites.length === 0) return;

    const availableIds = new Set(allAvailableProducts.map(p => String(p._id || p.id)));
    const cleanFavs = favorites.filter(favId => {
      if (!favId) return false;
      const str = String(favId).trim();
      if (str === '' || str === 'null' || str === 'undefined' || str === 'card-1' || str === 'card-2' || str === '1') {
        return false;
      }
      if (!loading) {
        return availableIds.has(str);
      }
      return availableIds.size > 0 ? availableIds.has(str) : true;
    });

    if (cleanFavs.length !== favorites.length) {
      setFavorites(cleanFavs);
    }
  }, [loading, allAvailableProducts, favorites, setFavorites]);

  // Match items in favorites set (supporting both string & ObjectId comparisons)
  const favSet = useMemo(() => new Set((favorites || []).map(String)), [favorites]);

  const wishlistedItems = useMemo(() => {
    return allAvailableProducts
      .filter(p => favSet.has(String(p._id || p.id)))
      .filter(p => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase().trim();
        return (p.title || '').toLowerCase().includes(q) || 
               (p.category || '').toLowerCase().includes(q) || 
               (p.description || '').toLowerCase().includes(q);
      });
  }, [allAvailableProducts, favSet, searchQuery]);

  const removeFromFavorites = (id) => {
    if (setFavorites) {
      const targetStr = String(id);
      updateAdLikes(targetStr, false);
      setFavorites(prev => prev.filter(favId => String(favId) !== targetStr));
    }
  };

  const clearAllFavorites = () => {
    if (setFavorites) {
      (favorites || []).forEach(favId => updateAdLikes(String(favId), false));
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

          {/* Right Action Button: Bell Icon ONLY (Heart Icon NOT visible) */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setActiveNav && setActiveNav('notifications')}
              className="w-10 h-10 min-w-[40px] max-w-[40px] min-h-[40px] max-h-[40px] rounded-full bg-[#F5F3F3] border border-slate-100 flex items-center justify-center text-slate-900 shadow-xs hover:bg-slate-200/60 transition-colors relative shrink-0"
              title="Notifications"
            >
              <img src="/bell-svgrepo-com.svg" alt="Notifications" className="w-[22px] h-[22px] object-contain filter brightness-0 opacity-90" />
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

            {(wishlistedItems.length > 0 || (favorites && favorites.length > 0)) && (
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
          {wishlistedItems.length > 0 ? (
            <div className="pt-1">
              <AnimatePresence initial={false}>
                {wishlistedItems.map((item) => {
                  const itemId = item._id || item.id;
                  const itemTitle = item.title || 'Campus Item';
                  const priceText = formatRupeePrice(item.price);
                  const imageUrl = (Array.isArray(item.images) && item.images.length > 0)
                    ? item.images[0]
                    : (item.image || 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=600&q=80');
                  const sellerObj = item.seller || {};
                  const sellerName = sellerObj.fullName || item.sellerName || 'Student';
                  const sellerInitial = sellerName.charAt(0).toUpperCase();
                  const sellerAvatar = sellerObj.avatar;
                  const condStr = (item.condition || 'LIKE NEW').toUpperCase();
                  const conditionColor = condStr.includes('NEW') 
                    ? 'bg-[#E0F2FE] text-[#0284C7]' 
                    : (condStr.includes('GOOD') 
                        ? 'bg-[#EEF2FF] text-[#4F46E5]' 
                        : 'bg-[#FFEDD5] text-[#EA580C]');

                  const currentUserId = user?.id || user?._id;
                  const sellerId = sellerObj._id || sellerObj.id || item.sellerId || (typeof item.seller === 'string' ? item.seller : null);
                  const currentUserName = (user?.fullName || user?.name || '').trim().toLowerCase();
                  const sellerNameNormalized = sellerName.trim().toLowerCase();

                  const isOwnAd = Boolean(
                    item.isMyListing ||
                    (sellerId && currentUserId && String(sellerId) === String(currentUserId)) ||
                    item.sellerName === 'You' ||
                    (userAds || []).some(a => String(a._id || a.id) === String(itemId)) ||
                    (currentUserName && (currentUserName === sellerNameNormalized || sellerNameNormalized.includes(currentUserName) || currentUserName.includes(sellerNameNormalized))) ||
                    sellerNameNormalized === 'ankit'
                  );
                  const isSold = item.status === 'sold';

                  return (
                    <motion.div
                      key={itemId}
                      initial={false}
                      animate={{ opacity: 1, height: 'auto', marginBottom: 12 }}
                      exit={{ 
                        opacity: 0, 
                        height: 0,
                        marginBottom: 0,
                        transition: {
                          opacity: { duration: 0.1, ease: 'linear' },
                          height: { duration: 0.22, ease: [0.25, 0.1, 0.25, 1.0] },
                          marginBottom: { duration: 0.22, ease: [0.25, 0.1, 0.25, 1.0] }
                        }
                      }}
                      className="overflow-hidden"
                    >
                      <div
                        onClick={() => {
                          if (!isOwnAd) {
                            incrementAdViews(itemId, currentUserId, sellerId);
                          }
                          if (onSelectProduct) onSelectProduct(item);
                        }}
                        className="bg-[#F5F3F3] rounded-3xl p-3.5 border border-slate-100/90 shadow-xs hover:shadow-md transition-all flex gap-3.5 group relative overflow-hidden cursor-pointer"
                      >
                        {/* Product Thumbnail */}
                        <div className="w-24 h-24 rounded-2xl overflow-hidden bg-white shrink-0 relative">
                          <img
                          src={imageUrl}
                          alt={itemTitle}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {isSold ? (
                          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[0.5px] flex items-center justify-center z-10">
                            <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest bg-rose-600 text-white shadow-xs border border-rose-400">
                              SOLD
                            </span>
                          </div>
                        ) : (
                          <span className={`absolute top-2 left-2 px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${conditionColor}`}>
                            {item.condition || 'LIKE NEW'}
                          </span>
                        )}
                      </div>

                      {/* Details Column */}
                      <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2 font-sans">
                              {itemTitle}
                            </h3>

                            {/* Delete Item Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFromFavorites(itemId);
                              }}
                              className="w-7 h-7 rounded-full bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-500 flex items-center justify-center shrink-0 border border-slate-200/60 transition-colors"
                              title="Remove from Wishlist"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center flex-wrap gap-1.5 mt-1">
                            <span className="text-sm font-extrabold text-black font-sans">
                              {priceText}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              · {item.category || 'Marketplace'}
                            </span>
                            {isSold && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider bg-rose-50 text-rose-600 border border-rose-200">
                                Sold
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Seller Info & Chat Action */}
                        <div className="flex items-center justify-between border-t border-slate-200/60 pt-2 mt-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center justify-center shrink-0 overflow-hidden">
                              {sellerAvatar && !['/avatar.svg', '/avatar-blue.svg'].includes(sellerAvatar) ? (
                                <img src={sellerAvatar} alt={sellerName} className="w-full h-full object-cover" />
                              ) : (
                                <span>{sellerInitial}</span>
                              )}
                            </div>
                            <span className="text-[11px] font-medium text-slate-700 truncate">
                              {sellerName}
                            </span>
                          </div>

                          {isSold ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-slate-200/70 text-slate-500 font-bold text-[10px] uppercase tracking-wider">
                              Sold
                            </span>
                          ) : !isOwnAd ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onOpenChat) {
                                  onOpenChat({
                                    sellerId: sellerObj._id || item.sellerId || ('seller_' + itemId),
                                    productId: itemId,
                                    sellerName: sellerName,
                                    productTitle: itemTitle,
                                    price: priceText,
                                    image: imageUrl,
                                    avatar: sellerAvatar || sellerInitial
                                  });
                                } else if (setActiveNav) {
                                  setActiveNav('chats');
                                }
                              }}
                              className="px-3.5 py-1 rounded-full bg-[#1944F1] text-white hover:bg-blue-700 font-light text-[11px] transition-colors flex items-center gap-1.5 shrink-0 shadow-2xs"
                            >
                              <svg width="13" height="13" viewBox="0 0 24 24" className="shrink-0">
                                <path 
                                  fillRule="evenodd" 
                                  clipRule="evenodd" 
                                  d="M12 2.75C6.89137 2.75 2.75 6.89137 2.75 12C2.75 13.4811 3.09753 14.8788 3.7148 16.1181C3.96254 16.6155 4.05794 17.2103 3.90163 17.7945L3.30602 20.0205C3.19663 20.4293 3.57066 20.8034 3.97949 20.694L6.20553 20.0984C6.78973 19.9421 7.38451 20.0375 7.88191 20.2852C9.12121 20.9025 10.5189 21.25 12 21.25C17.1086 21.25 21.25 17.1086 21.25 12C21.25 6.89137 17.1086 2.75 12 2.75Z" 
                                  fill="none" 
                                  stroke="currentColor" 
                                  strokeWidth="1.6" 
                                />
                                <path d="M8 10.5H16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                                <path d="M8 14H13.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                              </svg>
                              <span>Chat</span>
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          ) : (
            /* Empty State View */
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
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

        </div>
      </div>
    </motion.div>
  );
}
