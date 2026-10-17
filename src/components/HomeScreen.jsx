import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Truck,
  ArrowRight,
  CheckCircle2,
  Bell,
  X,
  Trash2,
  School,
  ShoppingBag,
  Plus,
  RotateCcw,
  Check,
  Filter,
  MessageSquare,
  MapPin
} from 'lucide-react';
import ChatScreen from './ChatScreen';
import SellScreen from './SellScreen';
import MyAdsScreen from './MyAdsScreen';
import ProfileScreen from './ProfileScreen';
import WishlistScreen from './WishlistScreen';
import { fetchProducts, formatRupeePrice, updateAdLikes, incrementAdViews, getOptimizedImageUrl } from '../lib/api';

export default function HomeScreen({ user, activeNav, setActiveNav, favorites, setFavorites, notifications = [], userAds = [], onOpenChat, onNavigate, onSelectProduct, onInitialLoadComplete }) {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const userUniversity = user?.universityName || user?.university?.name || '';

  // Helper: Strictly verify an item belongs to the active student's campus
  const isProductInUserUniversity = (product, userUni = userUniversity) => {
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
      const uni = user?.universityName || user?.university?.name || '';
      cached.forEach(p => {
        if (p && isProductInUserUniversity(p, uni)) {
          map.set(String(p._id || p.id), p);
        }
      });
      userCached.forEach(p => {
        if (p && isProductInUserUniversity(p, uni)) {
          map.set(String(p._id || p.id), p);
        }
      });
      return Array.from(map.values());
    } catch {
      return [];
    }
  });
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Applied Filter & Sort State (active on listings)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [appliedSort, setAppliedSort] = useState('recommended'); // 'recommended' | 'price_low' | 'price_high' | 'newest'
  const [appliedMinPrice, setAppliedMinPrice] = useState('');
  const [appliedMaxPrice, setAppliedMaxPrice] = useState('');
  const [appliedCondition, setAppliedCondition] = useState('all'); // 'all' | 'like_new' | 'good' | 'fair' | 'new'

  // Staged / Draft Filter State (inside modal before 'Show Results' is clicked)
  const [draftSort, setDraftSort] = useState('recommended');
  const [draftMinPrice, setDraftMinPrice] = useState('');
  const [draftMaxPrice, setDraftMaxPrice] = useState('');
  const [draftCondition, setDraftCondition] = useState('all');
  const [draftCategory, setDraftCategory] = useState('all');

  useEffect(() => {
    let isMounted = true;
    const loadProducts = async () => {
      try {
        setLoadingProducts(true);
        // Clear previous university products immediately on campus change
        setDbProducts([]);
        const data = await fetchProducts(userUniversity);
        if (isMounted) {
          const strictlyFiltered = Array.isArray(data)
            ? data.filter(p => p && isProductInUserUniversity(p, userUniversity))
            : [];
          setDbProducts(strictlyFiltered);
        }
      } catch (err) {
        console.warn('Could not fetch products:', err);
      } finally {
        if (isMounted) {
          setLoadingProducts(false);
          if (onInitialLoadComplete) onInitialLoadComplete();
        }
      }
    };
    loadProducts();
    return () => { isMounted = false; };
  }, [userUniversity]);

  const categories = [
    { id: 'all', label: 'All Items' },
    { id: 'books', label: 'Books & Notes' },
    { id: 'electronics', label: 'Electronics' },
    { id: 'cycles', label: 'Cycles & Vehicles' },
    { id: 'dorm', label: 'Dorm Essentials' },
  ];

  // No dummy mock listings: only real backend products and user ads are shown
  const products = [];

  const getNumericPrice = (p) => {
    if (typeof p === 'number') return p;
    if (!p) return 0;
    const num = parseFloat(String(p).replace(/[^0-9.]/g, ''));
    return isNaN(num) ? 0 : num;
  };

  const activeFilterCount = (
    (appliedSort !== 'recommended' ? 1 : 0) +
    (appliedMinPrice !== '' || appliedMaxPrice !== '' ? 1 : 0) +
    (appliedCondition !== 'all' ? 1 : 0)
  );
  const hasActiveFilters = activeFilterCount > 0;

  const handleOpenFilterModal = () => {
    setDraftSort(appliedSort);
    setDraftMinPrice(appliedMinPrice);
    setDraftMaxPrice(appliedMaxPrice);
    setDraftCondition(appliedCondition);
    setDraftCategory(activeTab);
    setIsFilterModalOpen(true);
  };

  const handleApplyFilters = () => {
    setAppliedSort(draftSort);
    setAppliedMinPrice(draftMinPrice);
    setAppliedMaxPrice(draftMaxPrice);
    setAppliedCondition(draftCondition);
    setActiveTab(draftCategory);
    setIsFilterModalOpen(false);
  };

  const handleResetDraftFilters = () => {
    setDraftSort('recommended');
    setDraftMinPrice('');
    setDraftMaxPrice('');
    setDraftCondition('all');
    setDraftCategory('all');
  };

  const handleCloseFilterModal = () => {
    setIsFilterModalOpen(false);
  };

  const handleResetFilters = () => {
    setAppliedSort('recommended');
    setAppliedMinPrice('');
    setAppliedMaxPrice('');
    setAppliedCondition('all');
    setActiveTab('all');
    setSearchQuery('');
  };

  // Merge dbProducts and userAds dynamically, strictly scoped to the active user's university
  const baseProducts = React.useMemo(() => {
    const map = new Map();

    // 1. Overlay database products that belong strictly to current university
    (dbProducts || []).forEach(p => {
      if (p && (p._id || p.id) && isProductInUserUniversity(p, userUniversity)) {
        const id = String(p._id || p.id);
        map.set(id, p);
      }
    });

    // 2. Overlay user ads ONLY if they belong to current university
    (userAds || []).forEach(ad => {
      if (ad && (ad._id || ad.id) && isProductInUserUniversity(ad, userUniversity)) {
        const id = String(ad._id || ad.id);
        const existing = map.get(id) || {};
        map.set(id, {
          ...existing,
          ...ad,
          sellerName: ad.sellerName || existing.sellerName || user?.fullName || 'You',
          seller: ad.seller || existing.seller || { fullName: user?.fullName || 'You', isVerified: true }
        });
      }
    });

    // Check localStorage cache for any items marked as sold
    let locallySoldIds = new Set();
    try {
      const cached = JSON.parse(localStorage.getItem('campus_products_cache') || '[]');
      cached.forEach(c => {
        if (c.status === 'sold') locallySoldIds.add(String(c._id || c.id));
      });
      const userCached = JSON.parse(localStorage.getItem('campus_user_ads') || '[]');
      userCached.forEach(u => {
        if (u.status === 'sold') locallySoldIds.add(String(u._id || u.id));
      });
    } catch {}

    // Only active listings from the current user's university should appear
    return Array.from(map.values()).filter(p => {
      const id = String(p._id || p.id);
      if (locallySoldIds.has(id)) return false;
      if (!isProductInUserUniversity(p, userUniversity)) return false;
      return (p.status || 'active') === 'active';
    });
  }, [userAds, dbProducts, user?.fullName, userUniversity]);

  const filteredProducts = baseProducts.filter(item => {
    // 0. Strict Campus boundary filter
    if (!isProductInUserUniversity(item, userUniversity)) {
      return false;
    }

    // 1. Search Query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const titleMatch = (item.title || '').toLowerCase().includes(q);
      const descMatch = (item.description || '').toLowerCase().includes(q);
      const catMatch = (item.category || '').toLowerCase().includes(q);
      const sellerMatch = (item.seller?.fullName || item.sellerName || '').toLowerCase().includes(q);
      if (!titleMatch && !descMatch && !catMatch && !sellerMatch) return false;
    }

    // 2. Category Tab filter
    if (activeTab !== 'all') {
      const itemCat = (item.category || '').toLowerCase();
      const itemTitle = (item.title || '').toLowerCase();
      const tabMatch = itemCat === activeTab.toLowerCase() ||
        (activeTab === 'books' && (itemCat.includes('book') || itemTitle.includes('book') || itemTitle.includes('math') || itemTitle.includes('note'))) ||
        (activeTab === 'electronics' && (itemCat.includes('elect') || itemCat.includes('gadget') || itemTitle.includes('calc') || itemTitle.includes('phone') || itemTitle.includes('laptop') || itemTitle.includes('lamp'))) ||
        (activeTab === 'cycles' && (itemCat.includes('cycle') || itemCat.includes('vehic') || itemTitle.includes('cycle') || itemTitle.includes('bike'))) ||
        (activeTab === 'dorm' && (itemCat.includes('dorm') || itemCat.includes('furn') || itemTitle.includes('lamp') || itemTitle.includes('desk') || itemTitle.includes('chair')));
      if (!tabMatch) return false;
    }

    // 3. Price filter
    const priceNum = getNumericPrice(item.price);
    if (appliedMinPrice !== '' && !isNaN(Number(appliedMinPrice)) && priceNum < Number(appliedMinPrice)) {
      return false;
    }
    if (appliedMaxPrice !== '' && !isNaN(Number(appliedMaxPrice)) && priceNum > Number(appliedMaxPrice)) {
      return false;
    }

    // 4. Condition filter
    if (appliedCondition !== 'all') {
      const cond = (item.condition || '').toUpperCase().replace(/\s+/g, '_');
      if (appliedCondition === 'new' && (cond.includes('LIKE') || !cond.includes('NEW'))) return false;
      if (appliedCondition === 'like_new' && !cond.includes('LIKE')) return false;
      if (appliedCondition === 'good' && !cond.includes('GOOD')) return false;
      if (appliedCondition === 'fair' && !cond.includes('FAIR')) return false;
    }

    return true;
  }).sort((a, b) => {
    if (appliedSort === 'price_low') {
      return getNumericPrice(a.price) - getNumericPrice(b.price);
    }
    if (appliedSort === 'price_high') {
      return getNumericPrice(b.price) - getNumericPrice(a.price);
    }
    if (appliedSort === 'newest') {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    }
    return 0;
  });

  const toggleFavorite = (id) => {
    if (!setFavorites) return;
    const idStr = String(id);
    const currentlyFav = (favorites || []).some(item => String(item) === idStr);
    updateAdLikes(idStr, !currentlyFav);
    setFavorites(prev =>
      currentlyFav
        ? (prev || []).filter(item => String(item) !== idStr)
        : [...(prev || []), idStr]
    );
  };

  // Calculate verified wishlisted count matching actual active items
  const validFavoritesCount = React.useMemo(() => {
    if (!favorites || !Array.isArray(favorites) || favorites.length === 0) return 0;
    const cleanFavs = favorites.filter(id => {
      if (!id) return false;
      const str = String(id).trim();
      return str !== '' && str !== 'null' && str !== 'undefined' && str !== 'card-1' && str !== 'card-2' && str !== '1';
    });
    if (cleanFavs.length === 0) return 0;

    const activeIds = new Set([
      ...baseProducts.map(p => String(p._id || p.id)),
      ...(userAds || []).map(a => String(a._id || a.id)),
      ...(dbProducts || []).map(p => String(p._id || p.id))
    ]);

    // Only count favorites that actually exist in the active products catalog
    return cleanFavs.filter(favId => activeIds.has(String(favId))).length;
  }, [favorites, baseProducts, userAds, dbProducts]);

  // Synchronize favorites: prune any orphaned / non-existent product IDs once active listings are loaded
  useEffect(() => {
    if (!setFavorites || !Array.isArray(favorites) || favorites.length === 0) return;
    const activeIds = new Set([
      ...baseProducts.map(p => String(p._id || p.id)),
      ...(userAds || []).map(a => String(a._id || a.id)),
      ...(dbProducts || []).map(p => String(p._id || p.id))
    ]);

    const sanitized = favorites.filter(id => {
      if (!id) return false;
      const str = String(id).trim();
      if (str === '' || str === 'null' || str === 'undefined' || str === 'card-1' || str === 'card-2' || str === '1') {
        return false;
      }
      if (!loadingProducts && activeIds.size > 0) {
        return activeIds.has(str);
      }
      return activeIds.size > 0 ? activeIds.has(str) : true;
    });

    if (sanitized.length !== favorites.length) {
      setFavorites(sanitized);
    }
  }, [loadingProducts, baseProducts, userAds, dbProducts, favorites, setFavorites]);

  const primaryColor = '#1944F1';
  const inactiveColor = '#94A3B8';
  const uploadedHeartPath = "M2 9.1371C2 14 6.01943 16.5914 8.96173 18.9109C10 19.7294 11 20.5 12 20.5C13 20.5 14 19.7294 15.0383 18.9109C17.9806 16.5914 22 14 22 9.1371C22 4.27416 16.4998 0.825464 12 5.50063C7.50016 0.825464 2 4.27416 2 9.1371Z";

  return (
    <motion.div
      key="home-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="w-full h-full min-h-screen bg-white text-slate-900 flex flex-col justify-between overflow-hidden select-none font-sans relative"
    >
      {/* 1. TOP HEADER BAR - BROUGHT DOWN CLEANLY WITH TOP SAFE PADDING */}
      <div className="pt-14 pb-3.5 px-4 bg-white border-b border-slate-100 flex items-center justify-between shadow-2xs shrink-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 min-w-[44px] max-w-[44px] min-h-[44px] max-h-[44px] aspect-square rounded-full overflow-hidden shrink-0 border border-slate-200 shadow-2xs flex items-center justify-center bg-slate-100 select-none">
            <img
              src={user?.avatar || '/avatar-blue-2.svg'}
              alt="Profile"
              className="w-full h-full object-cover shrink-0"
              onError={(e) => { e.currentTarget.src = '/avatar-blue-2.svg'; }}
            />
          </div>
          <div className="text-left">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 font-sans leading-tight">
              Hi, {user?.fullName || user?.name || 'Student'}
            </h2>
            <p className="text-xs text-slate-500 font-medium leading-tight mt-0.5">
              <span>{user?.universityName || user?.university?.name || user?.campusName || 'Campus Member'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Header Wishlist Action Button */}
          <button
            onClick={() => setActiveNav('wishlist')}
            className="w-10 h-10 min-w-[40px] max-w-[40px] min-h-[40px] max-h-[40px] rounded-full bg-[#F5F3F3] border border-slate-100 flex items-center justify-center text-slate-900 hover:bg-slate-200/60 transition-colors relative shrink-0"
            title="My Wishlist"
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d={uploadedHeartPath} fill="none" stroke="#0F172A" strokeWidth="1.8" />
            </svg>
            {validFavoritesCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4.5 h-4.5 min-w-[18px] min-h-[18px] max-w-[18px] max-h-[18px] rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-xs">
                {validFavoritesCount}
              </span>
            )}
          </button>

          {/* Notifications Action Button */}
          <button
            onClick={() => setActiveNav('notifications')}
            className="w-10 h-10 min-w-[40px] max-w-[40px] min-h-[40px] max-h-[40px] rounded-full bg-[#F5F3F3] border border-slate-100 flex items-center justify-center text-slate-900 hover:bg-slate-200/60 transition-colors relative shrink-0"
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

      {/* 2. SCROLLABLE MAIN CONTENT CONTAINER - PERFECT EDGE-TO-EDGE FIT */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-24 space-y-5 no-scrollbar">

        {/* Search & Filter Bar */}
        <div className="flex items-center gap-2.5 mb-1">
          <div className="flex-1 relative">
            <img src="/search-alt-svgrepo-com.svg" alt="Search" className="w-5 h-5 absolute left-3.5 top-3.5 filter brightness-0 opacity-40 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search books, gadgets, cycle"
              className="w-full pl-11 pr-8 py-3 bg-[#F5F3F3] text-slate-900 placeholder-slate-400 rounded-2xl text-sm font-normal focus:outline-none focus:ring-1 focus:ring-[#1944F1] border border-slate-100"
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

          <button
            onClick={handleOpenFilterModal}
            className={`w-11 h-11 min-w-[44px] min-h-[44px] rounded-2xl flex items-center justify-center transition-all shrink-0 shadow-2xs relative ${hasActiveFilters
                ? 'bg-[#1944F1] text-white shadow-md shadow-blue-500/25 ring-2 ring-[#1944F1]/20 active:scale-95'
                : 'bg-[#F5F3F3] text-slate-800 border border-slate-100 hover:bg-slate-200/60 active:scale-95'
              }`}
            title="Filter & sort listings"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={hasActiveFilters ? "text-white" : "text-slate-800"}
            >
              <path d="M3 8L15 8M15 8C15 9.65686 16.3431 11 18 11C19.6569 11 21 9.65685 21 8C21 6.34315 19.6569 5 18 5C16.3431 5 15 6.34315 15 8ZM9 16L21 16M9 16C9 17.6569 7.65685 19 6 19C4.34315 19 3 17.6569 3 16C3 14.3431 4.34315 13 6 13C7.65685 13 9 14.3431 9 16Z" />
            </svg>
          </button>
        </div>

        {/* Active Filter Chips Bar (Dismissible) */}
        {(hasActiveFilters || searchQuery.trim()) && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 text-xs">
            {appliedSort !== 'recommended' && (
              <span className="px-2.5 py-1 rounded-full bg-blue-50 text-[#1944F1] font-semibold border border-blue-100 flex items-center gap-1 shrink-0">
                <span>Sort: {appliedSort === 'price_low' ? 'Low to High' : appliedSort === 'price_high' ? 'High to Low' : 'Newest'}</span>
                <button onClick={() => setAppliedSort('recommended')} className="hover:text-blue-900"><X className="w-3 h-3" /></button>
              </span>
            )}
            {(appliedMinPrice || appliedMaxPrice) && (
              <span className="px-2.5 py-1 rounded-full bg-blue-50 text-[#1944F1] font-semibold border border-blue-100 flex items-center gap-1 shrink-0">
                <span>Price: {appliedMinPrice ? formatRupeePrice(appliedMinPrice) : '₹0'} - {appliedMaxPrice ? formatRupeePrice(appliedMaxPrice) : 'Any'}</span>
                <button onClick={() => { setAppliedMinPrice(''); setAppliedMaxPrice(''); }} className="hover:text-blue-900"><X className="w-3 h-3" /></button>
              </span>
            )}
            {appliedCondition !== 'all' && (
              <span className="px-2.5 py-1 rounded-full bg-blue-50 text-[#1944F1] font-semibold border border-blue-100 flex items-center gap-1 shrink-0">
                <span className="capitalize">{appliedCondition.replace('_', ' ')}</span>
                <button onClick={() => setAppliedCondition('all')} className="hover:text-blue-900"><X className="w-3 h-3" /></button>
              </span>
            )}
            {searchQuery.trim() && (
              <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200 flex items-center gap-1 shrink-0">
                <span>"{searchQuery}"</span>
                <button onClick={() => setSearchQuery('')} className="hover:text-slate-900"><X className="w-3 h-3" /></button>
              </span>
            )}
            <button
              onClick={handleResetFilters}
              className="text-[11px] font-bold text-slate-400 hover:text-slate-600 hover:underline shrink-0 px-1"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Banner Card */}
        <div className="w-full rounded-3xl bg-gradient-to-br from-[#1944F1] to-[#0D30BA] text-white p-5 shadow-md relative overflow-hidden flex items-center justify-between my-2">
          <div className="space-y-1.5 z-10 max-w-[230px]">
            <h3 className="text-base font-bold leading-snug font-sans">
              Sell your unused items today
            </h3>
            <p className="text-xs text-blue-100 font-normal">
              Clear your room, make some cash.
            </p>
            <div className="pt-2">
              <button
                onClick={() => setActiveNav('sell')}
                className="px-5 py-2.5 rounded-full bg-white text-[#1944F1] hover:bg-blue-50 text-xs font-bold shadow-sm transition-all active:scale-95 inline-flex items-center justify-center"
              >
                Start Selling
              </button>
            </div>
          </div>

          <div className="absolute right-4 bottom-2 opacity-20 pointer-events-none transform -rotate-3 z-0">
            <Truck className="w-20 h-20 text-white stroke-[1.3]" />
          </div>
        </div>

        {/* Category Filter Tabs (Swipeable left/right) */}
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2 w-full shrink-0 select-none touch-pan-x">
          {categories.map((cat) => {
            const isActive = activeTab === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`px-5 py-2.5 rounded-full text-xs shrink-0 whitespace-nowrap inline-flex items-center justify-center transition-all ${isActive
                    ? 'bg-[#1944F1] text-white shadow-md shadow-blue-500/20 font-bold scale-100'
                    : 'bg-[#F5F3F3] text-slate-700 font-semibold border border-slate-200/60 hover:bg-slate-200/70 active:scale-95'
                  }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Section Title */}
        <div className="flex items-center justify-between pt-1 mt-1">
          <h3 className="text-base font-bold text-slate-900 font-sans">
            {activeTab === 'all' ? 'Fresh on Campus' : categories.find(c => c.id === activeTab)?.label || 'Listings'}
          </h3>
          <span className="text-xs font-semibold text-slate-400">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        {/* Dynamic Product Grid / Clean Empty State */}
        {loadingProducts ? (
          <div className="py-12 text-center text-xs text-slate-400 font-medium">
            Loading campus listings...
          </div>
        ) : filteredProducts.length === 0 ? (
          baseProducts.length === 0 ? (
            /* CLEAN EMPTY STATE WHEN NO LISTINGS YET FOR CAMPUS */
            <div className="py-12 px-6 rounded-3xl bg-[#F5F3F3] border border-slate-100 flex flex-col items-center justify-center text-center space-y-3.5 shadow-2xs my-2">
              <div className="w-16 h-16 rounded-full bg-blue-100/80 text-[#1944F1] flex items-center justify-center shadow-xs">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-900 font-sans">
                  No Listings on {user?.universityName || user?.university?.name || 'Campus'} Yet
                </h4>
                <p className="text-xs text-slate-500 font-normal max-w-[260px] mx-auto leading-relaxed">
                  Be the first student to post an item for sale on your campus marketplace!
                </p>
              </div>
              <button
                onClick={() => setActiveNav('sell')}
                className="mt-1 px-6 py-3 rounded-2xl bg-[#1944F1] hover:bg-[#0D30BA] text-white text-xs font-bold shadow-md transition-all active:scale-95 inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Sell an Item</span>
              </button>
            </div>
          ) : (
            /* NO RESULTS MATCHING FILTERS */
            <div className="py-12 px-6 rounded-3xl bg-[#F5F3F3] border border-slate-100 flex flex-col items-center justify-center text-center space-y-3.5 shadow-2xs my-2">
              <div className="w-14 h-14 rounded-full bg-blue-50 text-[#1944F1] flex items-center justify-center shadow-xs">
                <Filter className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-900 font-sans">
                  No Matching Listings
                </h4>
                <p className="text-xs text-slate-500 font-normal max-w-[240px] mx-auto leading-relaxed">
                  No items matched your current filter criteria or search query.
                </p>
              </div>
              <button
                onClick={handleResetFilters}
                className="mt-1 px-5 py-2.5 rounded-2xl bg-[#1944F1] hover:bg-[#0D30BA] text-white text-xs font-bold shadow-md transition-all active:scale-95 inline-flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear All Filters</span>
              </button>
            </div>
          )
        ) : (
          <div className="grid grid-cols-2 gap-3 w-full">
            {filteredProducts.map((item) => {
              const isFav = (favorites || []).some(favId => String(favId) === String(item._id || item.id));
              const priceText = formatRupeePrice(item.price);
              const imageUrl = item.images && item.images.length > 0 ? item.images[0] : (item.image || 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=600&q=80');
              const sellerName = item.seller?.fullName || item.sellerName || 'Student';
              const sellerAvatar = sellerName.charAt(0).toUpperCase();

              return (
                <div
                  key={item._id || item.id}
                  onClick={() => {
                    const currentUserId = user?.id || user?._id;
                    const sellerId = item.seller?._id || item.seller?.id || item.seller || item.sellerId;
                    const isOwnProduct = currentUserId && sellerId && String(currentUserId) === String(sellerId);
                    if (!isOwnProduct) {
                      incrementAdViews(item._id || item.id, currentUserId, sellerId);
                    }
                    if (onSelectProduct) {
                      onSelectProduct(item);
                    } else {
                      setSelectedProduct(item);
                    }
                  }}
                  className="bg-[#F5F3F3] rounded-3xl p-2.5 border border-slate-100 shadow-xs flex flex-col justify-between space-y-2 hover:shadow-md transition-shadow group overflow-hidden w-full text-left cursor-pointer"
                >
                  <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-slate-100 max-w-full">
                    <img
                      src={getOptimizedImageUrl(imageUrl, 350)}
                      alt={item.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Circular Heart Button at Bottom-Right of the Image */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(item._id || item.id);
                      }}
                      className="absolute bottom-2.5 right-2.5 w-8.5 h-8.5 min-w-[34px] min-h-[34px] rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center shadow-md hover:scale-110 active:scale-90 transition-all z-10 border border-slate-100/60"
                      title={isFav ? "Remove from favorites" : "Add to favorites"}
                    >
                      <svg width="17" height="17" viewBox="0 0 24 24">
                        <path
                          d={uploadedHeartPath}
                          fill={isFav ? '#EF4444' : 'none'}
                          stroke={isFav ? '#EF4444' : '#0F172A'}
                          strokeWidth={isFav ? '1' : '1.8'}
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Below Image: Title with Condition Badge to the right, and Price below */}
                  <div className="px-1 space-y-1 pt-0.5">
                    <div className="flex items-center justify-between gap-1.5">
                      <h4 className="text-xs font-bold text-slate-900 truncate leading-snug font-sans flex-1">
                        {item.title}
                      </h4>
                      <span className={`inline-block px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider shrink-0 ${
                        (item.condition || '').toUpperCase().includes('NEW') 
                          ? 'bg-[#E0F2FE] text-[#0284C7]' 
                          : (item.condition || '').toUpperCase().includes('GOOD')
                          ? 'bg-[#EEF2FF] text-[#4F46E5]'
                          : 'bg-[#FFEDD5] text-[#EA580C]'
                      }`}>
                        {item.condition || 'LIKE NEW'}
                      </span>
                    </div>

                    <p className="text-sm font-extrabold text-black font-sans">
                      {priceText}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* 3. INTERACTIVE FILTER BOTTOM DRAWER */}
      <AnimatePresence>
        {isFilterModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleCloseFilterModal}
            className="fixed inset-0 bg-slate-900/60 z-[100] flex flex-col justify-end backdrop-blur-xs"
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-white rounded-t-[32px] sm:rounded-t-[36px] max-h-[85vh] flex flex-col overflow-hidden shadow-2xl"
            >
              {/* Drawer Header */}
              <div className="pt-3 pb-3 px-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10 shrink-0">
                <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto absolute left-1/2 -translate-x-1/2 top-2.5" />
                <div className="flex items-center gap-2 pt-2">
                  <h3 className="text-base font-bold text-slate-900 font-sans">Filter & Sort</h3>
                </div>
                <button
                  onClick={handleCloseFilterModal}
                  className="w-8 h-8 rounded-full bg-[#F5F3F3] hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Filter Form */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5 no-scrollbar text-left">
                {/* 1. Sort Section */}
                <div>
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
                    Sort By
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'recommended', label: 'Recommended' },
                      { id: 'price_low', label: 'Price: Low to High' },
                      { id: 'price_high', label: 'Price: High to Low' },
                      { id: 'newest', label: 'Newest First' },
                    ].map(opt => {
                      const isSel = draftSort === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setDraftSort(opt.id)}
                          className={`p-2.5 px-3 rounded-2xl text-xs border transition-all text-left flex items-center justify-between font-light ${isSel
                              ? 'border-[#1944F1] bg-blue-50/70 text-[#1944F1] shadow-2xs'
                              : 'border-slate-100 bg-[#F8FAFC] text-slate-600 hover:bg-slate-100'
                            }`}
                        >
                          <span className="truncate font-light">{opt.label}</span>
                          {isSel && <Check className="w-3.5 h-3.5 text-[#1944F1] shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Price Range */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Price Range
                    </label>
                    {(draftMinPrice || draftMaxPrice) && (
                      <button
                        type="button"
                        onClick={() => { setDraftMinPrice(''); setDraftMaxPrice(''); }}
                        className="text-[11px] font-light text-[#1944F1] hover:underline"
                      >
                        Clear Price
                      </button>
                    )}
                  </div>

                  {/* Quick price chips */}
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    {[
                      { label: 'Under ₹1,000', min: '', max: '1000' },
                      { label: '₹1,000 - ₹5,000', min: '1000', max: '5000' },
                      { label: '₹5,000 - ₹25,000', min: '5000', max: '25000' },
                      { label: '₹25,000 - ₹2,00,000', min: '25000', max: '200000' },
                    ].map((preset, idx) => {
                      const isPreset = draftMinPrice === preset.min && draftMaxPrice === preset.max;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            if (isPreset) {
                              setDraftMinPrice('');
                              setDraftMaxPrice('');
                            } else {
                              setDraftMinPrice(preset.min);
                              setDraftMaxPrice(preset.max);
                            }
                          }}
                          className={`py-2 px-3 rounded-2xl text-xs border transition-all text-center font-light ${isPreset
                              ? 'bg-[#1944F1] text-white border-[#1944F1] shadow-2xs'
                              : 'bg-[#F8FAFC] border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                        >
                          {preset.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Min / Max inputs */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="relative">
                      <span className="absolute left-3.5 top-3 text-xs font-light text-slate-400">₹</span>
                      <input
                        type="number"
                        min="0"
                        max="200000"
                        placeholder="Min price (₹)"
                        value={draftMinPrice}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '') {
                            setDraftMinPrice('');
                          } else {
                            const num = Math.max(0, Math.min(200000, Number(val)));
                            setDraftMinPrice(String(num));
                          }
                        }}
                        className="w-full pl-7 pr-3 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-2xl text-xs font-light text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#1944F1]"
                      />
                    </div>
                    <div className="relative">
                      <span className="absolute left-3.5 top-3 text-xs font-light text-slate-400">₹</span>
                      <input
                        type="number"
                        min="0"
                        max="200000"
                        placeholder="Max (up to ₹2,00,000)"
                        value={draftMaxPrice}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '') {
                            setDraftMaxPrice('');
                          } else {
                            const num = Math.max(0, Math.min(200000, Number(val)));
                            setDraftMaxPrice(String(num));
                          }
                        }}
                        className="w-full pl-7 pr-3 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-2xl text-xs font-light text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#1944F1]"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-light mt-1.5 px-0.5">
                    <span>Min: ₹0</span>
                    <span>Max limit: ₹2,00,000</span>
                  </div>
                </div>

                {/* 3. Category Filter Inside Drawer */}
                <div>
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
                    Category
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(cat => {
                      const isSel = draftCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setDraftCategory(cat.id)}
                          className={`px-3.5 py-2 rounded-2xl text-xs border transition-all font-light ${isSel
                              ? 'bg-[#1944F1] text-white border-[#1944F1] shadow-2xs'
                              : 'bg-[#F8FAFC] border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                        >
                          {cat.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Condition */}
                <div>
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
                    Item Condition
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'all', label: 'All Conditions' },
                      { id: 'new', label: 'New' },
                      { id: 'like_new', label: 'Like New' },
                      { id: 'good', label: 'Good' },
                      { id: 'fair', label: 'Fair' },
                    ].map(cond => {
                      const isSel = draftCondition === cond.id;
                      return (
                        <button
                          key={cond.id}
                          type="button"
                          onClick={() => setDraftCondition(cond.id)}
                          className={`px-3.5 py-2 rounded-2xl text-xs border transition-all font-light ${isSel
                              ? 'bg-[#1944F1] text-white border-[#1944F1] shadow-2xs'
                              : 'bg-[#F8FAFC] border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                        >
                          {cond.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Bottom Sticky Action Bar */}
              <div className="p-4 px-6 border-t border-slate-100 bg-white flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={handleResetDraftFilters}
                  className="flex-1 py-3 px-4 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-light text-xs transition-all active:scale-[0.98] flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
                <button
                  type="button"
                  onClick={handleApplyFilters}
                  className="flex-[2] py-3 px-4 rounded-2xl bg-[#1944F1] hover:bg-[#0D30BA] text-white font-light text-xs shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Show Results</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. PRODUCT DETAILS BOTTOM DRAWER */}
      <AnimatePresence>
        {!onSelectProduct && selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setSelectedProduct(null)}
            className="fixed inset-0 bg-slate-900/60 z-[110] flex flex-col justify-end backdrop-blur-xs"
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-white rounded-t-[32px] sm:rounded-t-[36px] max-h-[90vh] flex flex-col overflow-hidden shadow-2xl"
            >
              {/* Drawer Handle & Header */}
              <div className="pt-3 pb-3 px-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10 shrink-0">
                <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto absolute left-1/2 -translate-x-1/2 top-2.5" />
                <div className="flex items-center gap-2 pt-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {selectedProduct.category || 'Item Details'}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="w-8 h-8 rounded-full bg-[#F5F3F3] hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Product Details Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar text-left">
                {/* Product Image */}
                <div className="w-full aspect-[4/3] rounded-3xl overflow-hidden bg-slate-100 border border-slate-100 relative shadow-2xs">
                  <img
                    src={selectedProduct.images?.[0] || selectedProduct.image || 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=600&q=80'}
                    alt={selectedProduct.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider text-slate-700 shadow-2xs">
                    {selectedProduct.condition || 'LIKE NEW'}
                  </div>
                </div>

                {/* Title & Metadata */}
                <div>
                  <h2 className="text-base font-bold text-slate-900 font-sans leading-snug">
                    {selectedProduct.title}
                  </h2>
                  <div className="text-lg font-bold text-slate-900 mt-1">
                    {formatRupeePrice(selectedProduct.price)}
                  </div>
                  {(selectedProduct.location || selectedProduct.campusName || selectedProduct.universityName) && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{selectedProduct.location || selectedProduct.campusName || selectedProduct.universityName}</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                {selectedProduct.description && (
                  <div className="bg-[#F8FAFC] rounded-2xl p-3.5 border border-slate-100">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Description
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {selectedProduct.description}
                    </p>
                  </div>
                )}

                {/* Seller Info Card */}
                <div className="bg-[#F5F3F3] rounded-2xl p-3.5 flex items-center justify-between border border-slate-100/80">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center shrink-0">
                      {(selectedProduct.seller?.fullName || selectedProduct.sellerName || 'S').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-slate-900">
                          {selectedProduct.seller?.fullName || selectedProduct.sellerName || 'Campus Student'}
                        </span>
                        {(selectedProduct.seller?.isVerified || selectedProduct.verified) && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {selectedProduct.campusName || selectedProduct.universityName || 'Verified Campus Buddy'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Sticky Action Button */}
              <div className="p-4 px-6 border-t border-slate-100 bg-white flex items-center gap-3 shrink-0">
                {(() => {
                  const isMyListing = (
                    (selectedProduct.seller?._id && user?.id && String(selectedProduct.seller._id) === String(user.id)) ||
                    (selectedProduct.sellerId && user?.id && String(selectedProduct.sellerId) === String(user.id)) ||
                    (selectedProduct.sellerName === 'You' || (user?.fullName && selectedProduct.sellerName === user?.fullName))
                  );

                  if (isMyListing) {
                    return (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedProduct(null);
                          setActiveNav('myads');
                        }}
                        className="w-full py-3.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                      >
                        <span>This is your ad · Manage in My Ads</span>
                      </button>
                    );
                  }

                  return (
                    <button
                      type="button"
                      onClick={() => {
                        const product = selectedProduct;
                        const sellerId = product.seller?._id || product.seller?.id || product.sellerId || ('seller_' + (product._id || product.id));
                        const sellerName = product.seller?.fullName || product.sellerName || 'Student';
                        const productTitle = product.title || 'Campus Item';
                        const priceText = formatRupeePrice(product.price);
                        const imageUrl = product.images?.[0] || product.image || '';
                        const avatar = product.seller?.avatar || sellerName.charAt(0).toUpperCase();

                        if (onOpenChat) {
                          onOpenChat({
                            sellerId,
                            productId: product._id || product.id,
                            sellerName,
                            productTitle,
                            price: priceText,
                            image: imageUrl,
                            avatar
                          });
                        }
                        setSelectedProduct(null);
                      }}
                      className="w-full py-3.5 px-4 rounded-2xl bg-[#1944F1] hover:bg-[#0D30BA] text-white font-bold text-xs shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Chat with Seller</span>
                    </button>
                  );
                })()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
