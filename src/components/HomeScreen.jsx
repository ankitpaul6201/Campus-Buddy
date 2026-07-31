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
  Plus
} from 'lucide-react';
import ChatScreen from './ChatScreen';
import SellScreen from './SellScreen';
import MyAdsScreen from './MyAdsScreen';
import ProfileScreen from './ProfileScreen';
import WishlistScreen from './WishlistScreen';
import NotificationsScreen from './NotificationsScreen';
import { fetchProducts } from '../lib/api';

export default function HomeScreen({ user, onNavigate }) {
  const [activeTab, setActiveTab] = useState('all');
  const [activeNav, setActiveNav] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState(['card-2']);
  const [dbProducts, setDbProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoadingProducts(true);
        const data = await fetchProducts();
        setDbProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.warn('Could not fetch products:', err);
        setDbProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    };
    loadProducts();
  }, []);

  const categories = [
    { id: 'all', label: 'All Items' },
    { id: 'books', label: 'Books & Notes' },
    { id: 'electronics', label: 'Electronics' },
    { id: 'cycles', label: 'Cycles & Vehicles' },
    { id: 'dorm', label: 'Dorm Essentials' },
  ];

  const products = [
    {
      id: 'card-1',
      title: 'Engineering Mathematics Vol 2',
      price: '$45',
      condition: 'LIKE NEW',
      conditionColor: 'bg-[#E0F2FE] text-[#0284C7]',
      image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=600&q=80',
      sellerName: 'Rahul',
      sellerAvatar: 'R',
      sellerBg: 'bg-blue-100 text-blue-700',
      verified: true,
      timeAgo: '2h ago'
    },
    {
      id: 'card-2',
      title: 'TI-84 Plus CE Graphing Calculator',
      price: '$80',
      condition: 'GOOD',
      conditionColor: 'bg-[#EEF2FF] text-[#4F46E5]',
      image: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=600&q=80',
      sellerName: 'Sarah',
      sellerAvatar: 'S',
      sellerBg: 'bg-indigo-100 text-indigo-700',
      verified: false,
      timeAgo: '5h ago'
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
      timeAgo: '1d ago'
    },
    {
      id: 'card-4',
      title: 'Study Desk Lamp (LED)',
      price: '$15',
      condition: 'LIKE NEW',
      conditionColor: 'bg-[#E0F2FE] text-[#0284C7]',
      image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80',
      sellerName: 'Maya',
      sellerAvatar: 'M',
      sellerBg: 'bg-sky-100 text-sky-700',
      verified: false,
      timeAgo: '2d ago'
    }
  ];

  const toggleFavorite = (id) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

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
      <div className="pt-12 pb-3.5 px-4 bg-white border-b border-slate-100 flex items-center justify-between shadow-2xs shrink-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 min-w-[44px] max-w-[44px] min-h-[44px] max-h-[44px] aspect-square rounded-full overflow-hidden shrink-0 border border-slate-200 shadow-2xs">
            <img 
              src={user?.avatar || user?.picture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"} 
              alt="Profile" 
              className="w-full h-full object-cover shrink-0"
            />
          </div>
          <div className="text-left">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 font-sans leading-tight">
              {user?.fullName || user?.name || user?.username || 'Student'}
            </h2>
            <p className="text-xs text-slate-500 font-medium leading-tight mt-0.5 flex items-center gap-1">
              <School className="w-3.5 h-3.5 text-[#1944F1] inline shrink-0" />
              <span>{user?.universityName || user?.university?.name || user?.campusName || 'Stanford University'}</span>
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
            {favorites.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4.5 h-4.5 min-w-[18px] min-h-[18px] max-w-[18px] max-h-[18px] rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-xs">
                {favorites.length}
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
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
          </button>
        </div>
      </div>

      {/* 2. SCROLLABLE MAIN CONTENT CONTAINER - PERFECT EDGE-TO-EDGE FIT */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-24 space-y-5 no-scrollbar">
        
        {/* Search & Filter Bar */}
        <div className="flex items-center gap-2.5 mb-1">
          <div className="flex-1 relative">
            <img src="/search-alt-svgrepo-com.svg" alt="Search" className="w-5 h-5 absolute left-3.5 top-3.5 filter brightness-0 opacity-40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search books, gadgets, cycle"
              className="w-full pl-11 pr-3.5 py-3 bg-[#F5F3F3] text-slate-900 placeholder-slate-400 rounded-2xl text-sm font-normal focus:outline-none focus:ring-1 focus:ring-[#1944F1] border border-slate-100"
            />
          </div>

          <button className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-2xl bg-[#F5F3F3] border border-slate-100 flex items-center justify-center text-slate-900 hover:bg-slate-200/60 transition-colors shrink-0 shadow-2xs">
            <img src="/sliders-04-svgrepo-com.svg" alt="Filter" className="w-5 h-5 filter brightness-0 opacity-80" />
          </button>
        </div>

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
                className={`px-5 py-2.5 rounded-full text-xs shrink-0 whitespace-nowrap inline-flex items-center justify-center transition-all ${
                  isActive
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
            Fresh on Campus
          </h3>
          <span className="text-xs font-semibold text-slate-400">
            {user?.universityName || user?.campusName || 'Campus'}
          </span>
        </div>

        {/* Dynamic Product Grid / Clean Empty State */}
        {loadingProducts ? (
          <div className="py-12 text-center text-xs text-slate-400 font-medium">
            Loading campus listings...
          </div>
        ) : dbProducts.length === 0 ? (
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
          <div className="grid grid-cols-2 gap-3 w-full">
            {dbProducts.map((item) => {
              const isFav = favorites.includes(item._id || item.id);
              const priceText = typeof item.price === 'number' ? `$${item.price}` : item.price;
              const imageUrl = item.images && item.images.length > 0 ? item.images[0] : (item.image || 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=600&q=80');
              const sellerName = item.seller?.fullName || item.seller?.username || item.sellerName || 'Student';
              const sellerAvatar = sellerName.charAt(0).toUpperCase();

              return (
                <div
                  key={item._id || item.id}
                  className="bg-[#F5F3F3] rounded-3xl p-2.5 border border-slate-100 shadow-xs flex flex-col justify-between space-y-2 hover:shadow-md transition-shadow group overflow-hidden w-full text-left"
                >
                  <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-white max-w-full">
                    <img
                      src={imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Heart Button */}
                    <button
                      onClick={() => toggleFavorite(item._id || item.id)}
                      className="absolute top-2 right-2 w-7.5 h-7.5 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-xs hover:scale-110 active:scale-90 transition-all z-10"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24">
                        <path 
                          d={uploadedHeartPath} 
                          fill={isFav ? '#EF4444' : 'none'} 
                          stroke={isFav ? '#EF4444' : '#64748B'} 
                          strokeWidth={isFav ? '1' : '1.8'} 
                        />
                      </svg>
                    </button>

                    <div className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-md px-2.5 py-0.5 rounded-lg text-xs font-bold text-slate-900 shadow-2xs">
                      {priceText}
                    </div>
                  </div>

                  <div className="space-y-1.5 px-0.5">
                    <div>
                      <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#E0F2FE] text-[#0284C7]">
                        {item.condition || 'LIKE NEW'}
                      </span>
                    </div>

                    <h4 className="text-xs font-semibold text-slate-900 line-clamp-2 leading-snug font-sans">
                      {item.title}
                    </h4>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                          {sellerAvatar}
                        </div>
                        <span className="font-semibold text-slate-700 truncate max-w-[65px]">{sellerName}</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#1944F1] shrink-0" />
                      </div>
                      <span className="text-[10px] text-slate-400 font-normal shrink-0">Campus</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

    </motion.div>
  );
}
