import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  ChevronDown, 
  MapPin, 
  X, 
  CheckCircle2,
  Trash2,
  Bell,
  Check
} from 'lucide-react';

import { createProductListing, formatRupeePrice, updateAdLikes } from '../lib/api';
import CustomPopup from './CustomPopup';

export default function SellScreen({ user, activeNav, setActiveNav, favorites = [], notifications = [], userAds = [], setUserAds, onAdCreated, onNavigateBack }) {
  const [photos, setPhotos] = useState([]);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [condition, setCondition] = useState('Like New');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [isNegotiable, setIsNegotiable] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showWishlistModal, setShowWishlistModal] = useState(false);
  const [popupConfig, setPopupConfig] = useState(null);

  const cleanPriceValue = parseFloat(String(price).replace(/[^0-9.]/g, ''));
  const isFormComplete = Boolean(
    photos.length > 0 &&
    title.trim() &&
    category.trim() &&
    condition.trim() &&
    String(price).trim() &&
    !isNaN(cleanPriceValue) &&
    cleanPriceValue > 0 &&
    cleanPriceValue <= 200000 &&
    description.trim() &&
    location.trim()
  );

  const wishlistedProducts = (userAds || []).filter(item => favorites.includes(item.id || item._id));

  const categories = [
    'Books & Notes',
    'Electronics & Gadgets',
    'Cycles & Vehicles',
    'Dorm & Furniture',
    'Clothing & Accessories',
    'Sports & Fitness',
    'Other'
  ];

  const conditions = ['New', 'Like New', 'Good', 'Fair'];
  const uploadedHeartPath = "M2 9.1371C2 14 6.01943 16.5914 8.96173 18.9109C10 19.7294 11 20.5 12 20.5C13 20.5 14 19.7294 15.0383 18.9109C17.9806 16.5914 22 14 22 9.1371C22 4.27416 16.4998 0.825464 12 5.50063C7.50016 0.825464 2 4.27416 2 9.1371Z";

  // Compress and read image as Base64 DataURL for reliable cross-device storage
  const fileToDataUrl = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 1000;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Prefer WebP for optimal compression, falling back to JPEG
          let compressed;
          try {
            compressed = canvas.toDataURL('image/webp', 0.75);
            if (!compressed.startsWith('data:image/webp')) {
              compressed = canvas.toDataURL('image/jpeg', 0.75);
            }
          } catch {
            compressed = canvas.toDataURL('image/jpeg', 0.75);
          }
          resolve(compressed);
        };
        img.onerror = () => resolve(e.target.result);
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoUpload = async (e) => {
    const incomingFiles = Array.from(e.target.files || []);
    if (incomingFiles.length === 0) return;

    if (photos.length >= 5) {
      setPopupConfig({
        title: 'Photo Limit Reached',
        message: 'You can upload a maximum of 5 photos per listing.',
        type: 'warning',
        confirmText: 'Got it'
      });
      if (e.target) e.target.value = '';
      return;
    }

    const availableSlots = 5 - photos.length;
    let filesToProcess = incomingFiles;
    if (incomingFiles.length > availableSlots) {
      filesToProcess = incomingFiles.slice(0, availableSlots);
      setPopupConfig({
        title: 'Photo Limit',
        message: `Only up to 5 photos are allowed. Adding the first ${availableSlots} photo(s).`,
        type: 'warning',
        confirmText: 'Got it'
      });
    }

    try {
      const dataUrls = await Promise.all(filesToProcess.map(fileToDataUrl));
      setPhotos(prev => [...prev, ...dataUrls].slice(0, 5));
    } catch {
      const fallbackUrls = filesToProcess.map(file => URL.createObjectURL(file));
      setPhotos(prev => [...prev, ...fallbackUrls].slice(0, 5));
    }

    if (e.target) e.target.value = '';
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (photos.length === 0) {
      setPopupConfig({
        title: 'Photos Required',
        message: 'Please upload at least one photo of your item before posting.',
        type: 'warning',
        confirmText: 'Got it'
      });
      return;
    }

    if (!title.trim()) {
      setPopupConfig({
        title: 'Title Required',
        message: 'Please enter a title for your listing.',
        type: 'warning',
        confirmText: 'Got it'
      });
      return;
    }

    if (!category.trim()) {
      setPopupConfig({
        title: 'Category Required',
        message: 'Please select a category for your item.',
        type: 'warning',
        confirmText: 'Got it'
      });
      return;
    }

    if (!condition.trim()) {
      setPopupConfig({
        title: 'Condition Required',
        message: 'Please select the condition of your item.',
        type: 'warning',
        confirmText: 'Got it'
      });
      return;
    }

    const cleanPrice = parseFloat(String(price).replace(/[^0-9.]/g, ''));
    if (!String(price).trim() || isNaN(cleanPrice) || cleanPrice <= 0) {
      setPopupConfig({
        title: 'Valid Price Required',
        message: 'Please enter a valid price for your listing.',
        type: 'warning',
        confirmText: 'Got it'
      });
      return;
    }

    if (cleanPrice > 200000) {
      setPopupConfig({
        title: 'Price Limit Exceeded',
        message: 'Only items up to ₹2,00,000 can be listed.',
        type: 'warning',
        confirmText: 'Got it'
      });
      return;
    }

    if (!description.trim()) {
      setPopupConfig({
        title: 'Description Required',
        message: 'Please enter a description for your listing.',
        type: 'warning',
        confirmText: 'Got it'
      });
      return;
    }

    if (!location.trim()) {
      setPopupConfig({
        title: 'Location Required',
        message: 'Please enter a pickup location for your item.',
        type: 'warning',
        confirmText: 'Got it'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const finalImages = photos.slice(0, 5);
      const resolvedUni = user?.universityName || user?.university?.name || 'Campus Member';

      const payload = {
        title: title.trim(),
        description: description.trim(),
        price: cleanPrice,
        category: category.trim(),
        condition: condition.trim(),
        location: location.trim(),
        isNegotiable: Boolean(isNegotiable),
        images: finalImages,
        campusName: resolvedUni,
        universityName: resolvedUni
      };

      const created = await createProductListing(payload);
      setIsSubmitted(true);

      setTimeout(() => {
        setIsSubmitted(false);
        setIsSubmitting(false);

        // Reset form
        setTitle('');
        setPrice('');
        setDescription('');
        setCategory('');
        setPhotos([]);
        setLocation('');

        if (onAdCreated) {
          onAdCreated(created);
        } else if (setActiveNav) {
          setActiveNav('myads');
        } else if (onNavigateBack) {
          onNavigateBack();
        }
      }, 900);
    } catch (err) {
      console.error('Failed to post ad:', err);
      setPopupConfig({
        title: 'Failed to Post Ad',
        message: err.message || 'Please check your connection and try again.',
        type: 'danger',
        confirmText: 'OK'
      });
      setIsSubmitting(false);
    }
  };

  const primaryColor = '#1944F1';
  const inactiveColor = '#94A3B8';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.98 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="w-full h-full bg-white text-slate-900 flex flex-col justify-between overflow-hidden font-sans select-none relative"
    >
      {/* Scrollable Main Content Container */}
      <div className="flex-1 overflow-y-auto pb-28 space-y-5 bg-white">
        
        {/* 1. Header Bar: Left Logo + Black Title - BROUGHT DOWN CLEANLY WITH TOP SAFE PADDING */}
        <div className="pt-14 pb-3.5 px-4 bg-white border-b border-slate-100 flex items-center justify-between shrink-0 z-30">
          <div className="flex items-center gap-3">
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

          {/* Header Right Action Icons (40px x 40px) */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setActiveNav && setActiveNav('wishlist')}
              title="My Wishlist"
              className="w-10 h-10 min-w-[40px] max-w-[40px] min-h-[40px] max-h-[40px] rounded-full bg-[#F5F3F3] border border-slate-100 flex items-center justify-center text-slate-900 shadow-xs hover:bg-slate-200/60 transition-colors relative shrink-0"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" className="transition-all duration-200">
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

        {/* Form & Page Content Container */}
        <div className="px-5 space-y-5">
          {/* Page Title */}
          <h1 className="text-2xl font-bold text-[#1944F1] font-sans tracking-tight">
            Sell an Item
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Upload Product Photos Box */}
            <div className={`w-full rounded-3xl border-2 border-dashed ${
              photos.length >= 5 
                ? 'border-slate-300 bg-slate-50 cursor-default' 
                : 'border-blue-200 bg-[#F5F7FF] hover:border-[#1944F1] cursor-pointer'
            } p-6 flex flex-col items-center justify-center text-center relative transition-colors group`}>
              <input 
                type="file" 
                multiple 
                accept="image/*"
                disabled={photos.length >= 5}
                onChange={handlePhotoUpload} 
                className={`absolute inset-0 opacity-0 z-10 ${photos.length >= 5 ? 'cursor-not-allowed pointer-events-none' : 'cursor-pointer'}`}
              />
              
              <div className={`w-13 h-13 rounded-full ${
                photos.length >= 5 ? 'bg-slate-200 text-slate-400' : 'bg-[#E0EAFF] text-[#1944F1] group-hover:scale-110'
              } flex items-center justify-center mb-3 transition-transform shadow-2xs`}>
                <Plus className="w-6 h-6 stroke-[2.5]" />
              </div>

              <span className={`text-sm font-semibold font-sans ${photos.length >= 5 ? 'text-slate-500' : 'text-[#1944F1]'}`}>
                {photos.length >= 5 ? 'Maximum Photos Added' : 'Upload Product Photos'}
              </span>
              <span className="text-xs text-slate-400 font-normal mt-1">
                {photos.length > 0 ? `${photos.length}/5 photos uploaded` : 'Maximum 5 Photos Are Allowed'}
              </span>

              {/* Photos Preview Thumbnails */}
              {photos.length > 0 && (
                <div className="flex items-center gap-2 mt-4 overflow-x-auto w-full z-20 py-1">
                  {photos.map((url, idx) => (
                    <div key={idx} className="relative w-14 h-14 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                      <img src={url} alt={`Upload ${idx}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removePhoto(idx)}
                        className="absolute top-1 right-1 w-4 h-4 rounded-full bg-slate-900/80 hover:bg-rose-600 text-white flex items-center justify-center text-[10px] transition-colors"
                        title="Remove photo"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Title Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-800 font-sans block">
                Title
              </label>
              <input 
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. MacBook Pro M1 2020"
                className="w-full px-4 py-3.5 bg-[#F5F3F3] text-slate-900 placeholder-slate-400 rounded-2xl text-xs font-normal focus:outline-none focus:ring-2 focus:ring-[#1944F1] border border-slate-100/80"
                required
              />
            </div>

            {/* Category Field */}
            <div className="space-y-1.5 relative">
              <label className="text-xs font-semibold text-slate-800 font-sans block">
                Category
              </label>

              {/* Custom Themed Trigger */}
              <button
                type="button"
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className={`w-full px-4 py-3.5 bg-[#F5F3F3] rounded-2xl text-xs font-normal border transition-all flex items-center justify-between text-left ${
                  isCategoryOpen 
                    ? 'border-[#1944F1] ring-2 ring-blue-100 bg-white' 
                    : 'border-slate-100/80 hover:bg-slate-200/50'
                }`}
              >
                <span className={category ? 'text-slate-900 font-medium' : 'text-slate-400'}>
                  {category || 'Select a category'}
                </span>
                <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isCategoryOpen ? 'rotate-180 text-[#1944F1]' : ''}`} />
              </button>

              {/* Custom Themed Popover Options Menu */}
              <AnimatePresence>
                {isCategoryOpen && (
                  <>
                    {/* Invisible backdrop to dismiss on click outside */}
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsCategoryOpen(false)} 
                    />

                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.98 }}
                      transition={{ duration: 0.16, ease: 'easeOut' }}
                      className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl p-1.5 border border-slate-100 shadow-xl z-50 overflow-hidden max-h-60 overflow-y-auto no-scrollbar"
                    >
                      {categories.map((cat, idx) => {
                        const isSelected = category === cat;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setCategory(cat);
                              setIsCategoryOpen(false);
                            }}
                            className={`w-full px-3.5 py-2.5 rounded-xl text-xs flex items-center justify-between text-left transition-colors ${
                              isSelected
                                ? 'bg-[#EEF2FF] text-[#1944F1] font-semibold'
                                : 'text-slate-700 hover:bg-[#F5F3F3]'
                            }`}
                          >
                            <span>{cat}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-[#1944F1] stroke-[2.5]" />}
                          </button>
                        );
                      })}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Condition Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-800 font-sans block">
                Condition
              </label>
              <div className="grid grid-cols-4 gap-2">
                {conditions.map((cond) => {
                  const isSelected = condition === cond;
                  return (
                    <button
                      key={cond}
                      type="button"
                      onClick={() => setCondition(cond)}
                      className={`py-2 px-3 rounded-full text-xs font-medium transition-all text-center whitespace-nowrap ${
                        isSelected 
                          ? 'border-2 border-[#1944F1] bg-[#EEF2FF] text-[#1944F1] font-semibold shadow-2xs' 
                          : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {cond}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-800 font-sans block">
                  Price
                </label>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-xs text-slate-400 font-medium">₹</span>
                <input 
                  type="text"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. 450"
                  className={`w-full pl-8 pr-4 py-3.5 bg-[#F5F3F3] text-slate-900 placeholder-slate-400 rounded-2xl text-xs font-normal focus:outline-none focus:ring-2 border transition-all ${
                    parseFloat(String(price).replace(/[^0-9.]/g, '')) > 200000 
                      ? 'border-rose-300 focus:ring-rose-400' 
                      : 'border-slate-100/80 focus:ring-[#1944F1]'
                  }`}
                  required
                />
              </div>
              <p className={`text-[11px] font-normal transition-colors ${
                parseFloat(String(price).replace(/[^0-9.]/g, '')) > 200000 
                  ? 'text-rose-500 font-medium' 
                  : 'text-slate-400'
              }`}>
                {parseFloat(String(price).replace(/[^0-9.]/g, '')) > 200000 
                  ? 'Price exceeds limit: only items up to ₹2,00,000 can be listed' 
                  : 'Only items up to ₹2,00,000 can be listed'}
              </p>
            </div>

            {/* Description Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-800 font-sans block">
                Description
              </label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your item's history, specs, and any flaws..."
                rows={4}
                className="w-full p-4 bg-[#F5F3F3] text-slate-900 placeholder-slate-400 rounded-2xl text-xs font-normal focus:outline-none focus:ring-2 focus:ring-[#1944F1] border border-slate-100/80 resize-none"
                required
              />
            </div>

            {/* Pickup Location Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-800 font-sans block">
                Pickup Location
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                <input 
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. North Campus Library"
                  className="w-full pl-11 pr-4 py-3.5 bg-[#F5F3F3] text-slate-900 placeholder-slate-400 rounded-2xl text-xs font-normal focus:outline-none focus:ring-2 focus:ring-[#1944F1] border border-slate-100/80"
                  required
                />
              </div>
            </div>

            {/* Negotiable Card Toggle */}
            <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-xs flex items-center justify-between mt-2">
              <div>
                <h4 className="text-xs font-bold text-slate-900 font-sans">
                  Negotiable
                </h4>
                <p className="text-[11px] text-slate-400 font-normal mt-0.5">
                  Open to offers and trades
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsNegotiable(!isNegotiable)}
                className={`w-12 h-6 rounded-full transition-colors p-0.5 flex items-center ${
                  isNegotiable ? 'bg-[#1944F1] justify-end' : 'bg-slate-300 justify-start'
                }`}
              >
                <motion.div 
                  layout 
                  className="w-5 h-5 rounded-full bg-white shadow-sm" 
                />
              </button>
            </div>

            {/* Post Listing Button */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={isSubmitted || isSubmitting}
                className={`w-full py-4 rounded-full font-bold text-sm shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${
                  isFormComplete
                    ? 'bg-[#1944F1] hover:bg-blue-700 text-white shadow-blue-500/20 cursor-pointer'
                    : 'bg-slate-200 hover:bg-slate-300 text-slate-500 cursor-pointer'
                }`}
              >
                {isSubmitted ? (
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-white animate-bounce" />
                    Listing Posted!
                  </span>
                ) : isSubmitting ? (
                  <span className="flex items-center gap-2">
                    Posting Listing...
                  </span>
                ) : (
                  <span>Post Listing</span>
                )}
              </button>
            </div>

          </form>
        </div>

      </div>

      {/* Bottom Navigation Dock */}
      <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-100 px-7 py-2.5 flex items-center justify-between z-30 shadow-lg">
        
        {/* 1. Home Tab */}
        <button
          onClick={() => setActiveNav('home')}
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
          onClick={() => setActiveNav('chats')}
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
            onClick={() => setActiveNav('sell')}
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
          onClick={() => setActiveNav('myads')}
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
          activeNav === 'myads' ? 'text-[#1944F1]' : '#94A3B8'
        }`}>
          My Ads
        </span>
      </button>

      {/* 5. Profile Tab */}
      <button
        onClick={() => setActiveNav('profile')}
        className="flex flex-col items-center justify-center gap-1 py-0.5 px-2 transition-all group min-w-[50px]"
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
        <span className={`text-[11px] transition-colors ${
          activeNav === 'profile' ? 'text-[#1944F1] font-semibold' : 'text-slate-400 font-medium'
        }`}>
          Profile
        </span>
      </button>

    </div>

      {/* Wishlist Drawer Modal */}
      <AnimatePresence>
        {showWishlistModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex flex-col justify-end"
          >
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="bg-white rounded-t-3xl p-5 max-h-[80%] flex flex-col space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path d={uploadedHeartPath} fill="none" stroke="#0F172A" strokeWidth="1.8" />
                  </svg>
                  <h3 className="text-base font-bold text-slate-900 font-sans">
                    My Wishlist ({wishlistedProducts.length})
                  </h3>
                </div>
                <button 
                  onClick={() => setShowWishlistModal(false)}
                  className="w-8 h-8 rounded-full bg-[#F5F3F3] flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="overflow-y-auto max-h-[350px] space-y-3 pr-1">
                {wishlistedProducts.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-2xl bg-[#F5F3F3] border border-slate-100/80">
                    <div className="flex items-center gap-3">
                      <img src={item.image} alt={item.title} className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0" />
                      <div>
                        <h4 className="text-xs font-semibold text-slate-900 line-clamp-1 font-sans">{item.title}</h4>
                        <p className="text-xs font-bold text-black mt-0.5">{formatRupeePrice(item.price)}</p>
                        <p className="text-[10px] text-slate-400 font-normal">Seller: {item.sellerName}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const targetId = item.id || item._id;
                        updateAdLikes(targetId, false);
                        setFavorites(prev => prev.filter(id => id !== item.id && id !== item._id));
                      }}
                      className="w-8 h-8 rounded-full bg-white border border-slate-200 text-rose-500 hover:bg-rose-50 flex items-center justify-center shrink-0 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reusable Custom Alert / Popup Modal */}
      <CustomPopup
        isOpen={Boolean(popupConfig)}
        title={popupConfig?.title}
        message={popupConfig?.message}
        type={popupConfig?.type || 'warning'}
        confirmText={popupConfig?.confirmText || 'OK'}
        isAlert={true}
        onConfirm={() => setPopupConfig(null)}
        onCancel={() => setPopupConfig(null)}
      />
    </motion.div>
  );
}
