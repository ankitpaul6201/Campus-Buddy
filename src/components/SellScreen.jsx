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
  Check,
  ArrowLeft
} from 'lucide-react';

import { createProductListing, formatRupeePrice, updateAdLikes } from '../lib/api';
import CustomPopup from './CustomPopup';

const MAX_TITLE_CHARS = 50;
const MAX_LOCATION_CHARS = 50;
const MAX_DESC_CHARS = 400;

export default function SellScreen({ user, activeNav, setActiveNav, favorites = [], setFavorites = () => {}, notifications = [], userAds = [], setUserAds, onAdCreated, onNavigateBack, canGoBack = false }) {
  const [photos, setPhotos] = useState([]);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [condition, setCondition] = useState('Like New');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const savedStudentPhone = (user?.phone || (typeof window !== 'undefined' ? localStorage.getItem('user_phone') : '') || '').toString().replace(/\D/g, '').slice(-10);
  const [isNegotiable, setIsNegotiable] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showWishlistModal, setShowWishlistModal] = useState(false);
  const [popupConfig, setPopupConfig] = useState(null);

  const [isTitleLimitSurpassed, setIsTitleLimitSurpassed] = useState(false);
  const [isLocationLimitSurpassed, setIsLocationLimitSurpassed] = useState(false);
  const [isDescLimitSurpassed, setIsDescLimitSurpassed] = useState(false);

  const showTitleLimit = isTitleLimitSurpassed || title.length >= MAX_TITLE_CHARS;
  const showLocationLimit = isLocationLimitSurpassed || location.length >= MAX_LOCATION_CHARS;
  const showDescLimit = isDescLimitSurpassed || description.length >= MAX_DESC_CHARS;

  const handleTitleChange = (e) => {
    const val = e.target.value;
    if (val.length > MAX_TITLE_CHARS) {
      setTitle(val.slice(0, MAX_TITLE_CHARS));
      setIsTitleLimitSurpassed(true);
    } else {
      setTitle(val);
      setIsTitleLimitSurpassed(val.length === MAX_TITLE_CHARS);
    }
  };

  const handleLocationChange = (e) => {
    const val = e.target.value;
    if (val.length > MAX_LOCATION_CHARS) {
      setLocation(val.slice(0, MAX_LOCATION_CHARS));
      setIsLocationLimitSurpassed(true);
    } else {
      setLocation(val);
      setIsLocationLimitSurpassed(val.length === MAX_LOCATION_CHARS);
    }
  };

  const handleDescriptionChange = (e) => {
    const val = e.target.value;
    if (val.length > MAX_DESC_CHARS) {
      setDescription(val.slice(0, MAX_DESC_CHARS));
      setIsDescLimitSurpassed(true);
    } else {
      setDescription(val);
      setIsDescLimitSurpassed(val.length === MAX_DESC_CHARS);
    }
  };

  const handlePriceChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (!raw) {
      setPrice('');
      return;
    }
    const num = parseInt(raw, 10);
    if (num > 200000) {
      setPrice('200000');
    } else {
      setPrice(String(num));
    }
  };

  const cleanPriceValue = parseFloat(String(price).replace(/[^0-9.]/g, ''));
  const isFormComplete = Boolean(
    photos.length > 0 &&
    title.trim() &&
    title.length <= MAX_TITLE_CHARS &&
    category.trim() &&
    condition.trim() &&
    String(price).trim() &&
    !isNaN(cleanPriceValue) &&
    cleanPriceValue > 0 &&
    cleanPriceValue <= 200000 &&
    description.trim() &&
    description.length <= MAX_DESC_CHARS &&
    location.trim() &&
    location.length <= MAX_LOCATION_CHARS
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

    if (!savedStudentPhone || savedStudentPhone.length !== 10) {
      setPopupConfig({
        title: 'Phone Number Required',
        message: 'Please add your 10-digit phone number in your Student Profile (Profile > Student Information) before posting an ad so buyers can call you.',
        type: 'warning',
        confirmText: 'Go to Profile',
        onConfirm: () => {
          if (setActiveNav) setActiveNav('profile');
        }
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
        phone: savedStudentPhone,
        contactNumber: savedStudentPhone,
        isNegotiable: Boolean(isNegotiable),
        images: finalImages,
        campusName: resolvedUni,
        universityName: resolvedUni
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('user_phone', savedStudentPhone);
      }

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
        setIsTitleLimitSurpassed(false);
        setIsLocationLimitSurpassed(false);
        setIsDescLimitSurpassed(false);

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
          <div className="flex items-center gap-2.5">
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
                onChange={handleTitleChange}
                maxLength={MAX_TITLE_CHARS}
                placeholder="e.g. MacBook Pro M1 2020"
                className={`w-full px-4 py-3.5 bg-[#F5F3F3] text-slate-900 placeholder-slate-400 rounded-2xl text-xs font-normal focus:outline-none focus:ring-2 border transition-all ${
                  showTitleLimit
                    ? 'border-rose-300 focus:ring-rose-400' 
                    : 'border-slate-100/80 focus:ring-[#1944F1]'
                }`}
                required
              />
              {showTitleLimit && (
                <p className="text-[11px] text-rose-500 font-medium animate-fade-in">
                  Limit reached: Title cannot exceed {MAX_TITLE_CHARS} characters
                </p>
              )}
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
                  inputMode="numeric"
                  value={price}
                  onChange={handlePriceChange}
                  maxLength={6}
                  placeholder="e.g. 450"
                  className={`w-full pl-8 pr-4 py-3.5 bg-[#F5F3F3] text-slate-900 placeholder-slate-400 rounded-2xl text-xs font-normal focus:outline-none focus:ring-2 border transition-all ${
                    parseInt(price || '0', 10) >= 200000 
                      ? 'border-rose-300 focus:ring-rose-400' 
                      : 'border-slate-100/80 focus:ring-[#1944F1]'
                  }`}
                  required
                />
              </div>
              {parseInt(price || '0', 10) >= 200000 && (
                <p className="text-[11px] text-rose-500 font-medium animate-fade-in">
                  Limit reached: Maximum price is ₹2,00,000
                </p>
              )}
            </div>

            {/* Description Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-800 font-sans block">
                Description
              </label>
              <textarea 
                value={description}
                onChange={handleDescriptionChange}
                maxLength={MAX_DESC_CHARS}
                placeholder="Describe your item's history, specs, and any flaws..."
                rows={4}
                className={`w-full p-4 bg-[#F5F3F3] text-slate-900 placeholder-slate-400 rounded-2xl text-xs font-normal focus:outline-none focus:ring-2 border resize-none transition-all no-scrollbar ${
                  showDescLimit
                    ? 'border-rose-300 focus:ring-rose-400' 
                    : 'border-slate-100/80 focus:ring-[#1944F1]'
                }`}
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                required
              />
              {showDescLimit && (
                <p className="text-[11px] text-rose-500 font-medium animate-fade-in">
                  Limit reached: Description cannot exceed {MAX_DESC_CHARS} characters
                </p>
              )}
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
                  onChange={handleLocationChange}
                  maxLength={MAX_LOCATION_CHARS}
                  placeholder="e.g. North Campus Library"
                  className={`w-full pl-11 pr-4 py-3.5 bg-[#F5F3F3] text-slate-900 placeholder-slate-400 rounded-2xl text-xs font-normal focus:outline-none focus:ring-2 border transition-all ${
                    showLocationLimit
                      ? 'border-rose-300 focus:ring-rose-400' 
                      : 'border-slate-100/80 focus:ring-[#1944F1]'
                  }`}
                  required
                />
              </div>
              {showLocationLimit && (
                <p className="text-[11px] text-rose-500 font-medium animate-fade-in">
                  Limit reached: Pickup location cannot exceed {MAX_LOCATION_CHARS} characters
                </p>
              )}
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
        onConfirm={() => {
          if (popupConfig?.onConfirm) popupConfig.onConfirm();
          setPopupConfig(null);
        }}
        onCancel={() => {
          if (popupConfig?.onCancel) popupConfig.onCancel();
          setPopupConfig(null);
        }}
      />
    </motion.div>
  );
}
