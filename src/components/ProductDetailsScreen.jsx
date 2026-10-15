import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  MapPin,
  CheckCircle2,
  MessageSquare,
  Share2,
  ShieldCheck,
  Tag,
  Clock,
  Sparkles,
  Info,
  Calendar,
  ChevronRight,
  ChevronLeft,
  Maximize2,
  Check,
  AlertCircle,
  Star,
  X,
  GraduationCap,
  Award,
  Send,
  UserCheck,
  Mail,
  BookOpen,
  Flag
} from 'lucide-react';
import { 
  formatRupeePrice, 
  updateProductStatus, 
  incrementAdViews, 
  updateAdLikes,
  getSellerRatings,
  submitSellerRating,
  apiReportProduct
} from '../lib/api';

export default function ProductDetailsScreen({
  product,
  user,
  favorites = [],
  setFavorites,
  userAds = [],
  setUserAds,
  onNavigateBack,
  onOpenChat,
  onManageMyAds,
  onViewSellerInfo
}) {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  const [productStatus, setProductStatus] = useState(product?.status || 'active');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('Prohibited or dangerous item');
  const [reportDetails, setReportDetails] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingReport(true);
    try {
      await apiReportProduct(productId, { reason: reportReason, details: reportDetails });
      setReportSuccess(true);
      setTimeout(() => {
        setIsReportModalOpen(false);
        setReportSuccess(false);
        setReportDetails('');
      }, 2000);
    } catch (err) {
      alert(err.message || 'Failed to submit report');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  React.useEffect(() => {
    if (product?.status) setProductStatus(product.status);
  }, [product?.status]);

  const handleMarkAsSold = async () => {
    if (productStatus === 'sold') return; // Cannot be active again once sold!
    const newStatus = 'sold';
    setProductStatus(newStatus);

    if (setUserAds) {
      setUserAds(prev => prev.map(a => 
        (String(a._id || a.id) === String(productId)) ? { ...a, status: newStatus } : a
      ));
    }

    try {
      await updateProductStatus(productId, newStatus);
    } catch (err) {
      console.error('Failed to update product status:', err);
    }
  };

  if (!product) {
    return (
      <div className="w-full h-full min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <p className="text-slate-500 text-sm mb-4">Listing not found or has been removed.</p>
        <button
          onClick={onNavigateBack}
          className="px-5 py-2.5 bg-[#1944F1] text-white rounded-full text-xs font-bold shadow-md"
        >
          Go Back
        </button>
      </div>
    );
  }

  const productId = product._id || product.id;
  const isFav = (favorites || []).some(id => String(id) === String(productId));

  // Extract all photos
  const rawImages = (Array.isArray(product.images) && product.images.length > 0)
    ? product.images
    : (product.image ? [product.image] : ['https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=800&q=80']);

  const currentImage = rawImages[selectedPhotoIndex] || rawImages[0];

  // Lock background scroll and listen for keydown events while image viewer is open
  useEffect(() => {
    if (!isImageViewerOpen) return;

    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsImageViewerOpen(false);
      } else if (e.key === 'ArrowLeft' && rawImages.length > 1) {
        setSelectedPhotoIndex(prev => (prev > 0 ? prev - 1 : rawImages.length - 1));
      } else if (e.key === 'ArrowRight' && rawImages.length > 1) {
        setSelectedPhotoIndex(prev => (prev < rawImages.length - 1 ? prev + 1 : 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isImageViewerOpen, rawImages.length]);

  // Extract seller information
  const sellerObj = product.seller || {};
  const sellerName = sellerObj.fullName || product.sellerName || 'Campus Student';
  const sellerInitial = sellerName.charAt(0).toUpperCase();
  const isSellerVerified = Boolean(sellerObj.isVerified || product.verified);
  const sellerUniversity = sellerObj.universityName || product.universityName || product.campusName || 'Campus Member';

  // Check if current user is the seller
  const currentUserId = user?.id || user?._id;
  const sellerId = sellerObj._id || sellerObj.id || product.sellerId;
  const currentUserName = (user?.fullName || user?.name || '').trim().toLowerCase();
  const sellerNameNormalized = sellerName.trim().toLowerCase();

  const isMyListing = Boolean(
    (sellerId && currentUserId && String(sellerId) === String(currentUserId)) ||
    product.sellerName === 'You' ||
    (currentUserName && (currentUserName === sellerNameNormalized || sellerNameNormalized.includes(currentUserName) || currentUserName.includes(sellerNameNormalized))) ||
    sellerNameNormalized === 'ankit'
  );

  const targetSellerKey = sellerId || sellerNameNormalized || 'seller';
  const [sellerRatingData, setSellerRatingData] = useState(() => getSellerRatings(targetSellerKey));

  useEffect(() => {
    setSellerRatingData(getSellerRatings(targetSellerKey));
  }, [targetSellerKey]);

  const resolvedSellerCourse = isMyListing
    ? (user?.course || (typeof window !== 'undefined' ? (localStorage.getItem('user_course') || localStorage.getItem('pending_course')) : '') || sellerObj.sellerCourse || sellerObj.course || '')
    : (sellerObj.sellerCourse || sellerObj.course || '');

  const resolvedSellerYear = isMyListing
    ? (user?.year || (typeof window !== 'undefined' ? (localStorage.getItem('user_year') || localStorage.getItem('pending_year')) : '') || sellerObj.sellerYear || sellerObj.year || '')
    : (sellerObj.sellerYear || sellerObj.year || '');

  const resolvedSellerDob = isMyListing
    ? (user?.dob || (typeof window !== 'undefined' ? (localStorage.getItem('user_dob') || localStorage.getItem('pending_dob')) : '') || sellerObj.sellerDob || sellerObj.dob || '')
    : (sellerObj.sellerDob || sellerObj.dob || '');

  const resolvedSellerEmail = isMyListing
    ? (user?.email || (typeof window !== 'undefined' ? localStorage.getItem('pending_email') : '') || `${sellerNameNormalized}@campus.edu`)
    : (sellerObj.email || `${sellerNameNormalized.replace(/\s+/g, '.')}@campus.edu`);

  const handleOpenSellerInfo = () => {
    if (onViewSellerInfo) {
      onViewSellerInfo({
        sellerId: targetSellerKey,
        sellerName,
        sellerUniversity,
        sellerAvatar: resolvedSellerAvatar,
        sellerInitial,
        isSellerVerified,
        sellerCourse: resolvedSellerCourse,
        sellerYear: resolvedSellerYear,
        sellerDob: resolvedSellerDob,
        sellerEmail: resolvedSellerEmail,
        isMyListing
      });
    }
  };

  // Retrieve user's set profile picture from localStorage or user state
  const customUserAvatar = typeof window !== 'undefined'
    ? (localStorage.getItem('user_custom_avatar') || (() => {
        try { return JSON.parse(localStorage.getItem('campus_user') || '{}')?.avatar; } catch { return null; }
      })())
    : null;

  const validUserAvatar = customUserAvatar || (user?.avatar && !['/avatar.svg', '/avatar-blue.svg'].includes(user.avatar) ? user.avatar : null);

  // If this listing is by the user (or matches the user), prioritize the photo the user set
  let resolvedSellerAvatar = null;
  if (isMyListing && validUserAvatar) {
    resolvedSellerAvatar = validUserAvatar;
  } else if (sellerObj.avatar && !['/avatar.svg', '/avatar-blue.svg'].includes(sellerObj.avatar)) {
    resolvedSellerAvatar = sellerObj.avatar;
  } else if (isMyListing) {
    resolvedSellerAvatar = user?.avatar || customUserAvatar || '/avatar-blue-2.svg';
  } else {
    resolvedSellerAvatar = sellerObj.avatar;
  }

  // Formatted date or time
  const formattedDate = product.createdAt
    ? new Date(product.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : (product.timeAgo || 'Recently posted');

  // Condition color helper
  const conditionStr = (product.condition || 'LIKE NEW').toUpperCase();
  const getConditionStyle = (cond) => {
    if (cond.includes('NEW')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (cond.includes('GOOD')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (cond.includes('FAIR')) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const uploadedHeartPath = "M2 9.1371C2 14 6.01943 16.5914 8.96173 18.9109C10 19.7294 11 20.5 12 20.5C13 20.5 14 19.7294 15.0383 18.9109C17.9806 16.5914 22 14 22 9.1371C22 4.27416 16.4998 0.825464 12 5.50063C7.50016 0.825464 2 4.27416 2 9.1371Z";

  // Views are tracked strictly when users click the product card

  const toggleFavorite = () => {
    if (!setFavorites) return;
    const targetIdStr = String(productId);
    if (isFav) {
      updateAdLikes(targetIdStr, false);
      setFavorites(prev => (prev || []).filter(id => String(id) !== targetIdStr));
    } else {
      updateAdLikes(targetIdStr, true);
      setFavorites(prev => [...(prev || []), targetIdStr]);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: product.title,
      text: `Check out ${product.title} for ${formatRupeePrice(product.price)} on Campus Buddy!`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // user cancelled or failed
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${product.title} - ${formatRupeePrice(product.price)}: ${window.location.href}`);
        setShowShareToast(true);
        setTimeout(() => setShowShareToast(false), 2200);
      } catch {
        setShowShareToast(true);
        setTimeout(() => setShowShareToast(false), 2200);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="w-full h-full min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between overflow-hidden font-sans select-none relative"
    >
      {/* 1. TOP APP BAR - FIXED HEADER */}
      <div className="pt-12 pb-3.5 px-4 bg-white/95 backdrop-blur-md border-b border-slate-100 flex items-center justify-between shrink-0 sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onNavigateBack}
            className="w-10 h-10 min-w-[40px] max-w-[40px] min-h-[40px] max-h-[40px] rounded-full bg-[#F5F3F3] hover:bg-slate-200 text-slate-800 flex items-center justify-center transition-all duration-200 hover:-translate-x-1 active:-translate-x-1.5 active:scale-95 shadow-2xs group"
            aria-label="Go Back"
          >
            <ArrowLeft className="w-5 h-5 text-slate-800 stroke-[2.2] transition-transform duration-200 group-hover:-translate-x-0.5 group-active:-translate-x-1" />
          </button>

          <h1 className="text-base font-bold text-slate-900 font-sans tracking-tight">
            Ad Details
          </h1>
        </div>

        {/* Right Actions: Favorite & Share */}
        <div className="flex items-center gap-2">
          {/* Heart Button */}
          <button
            type="button"
            onClick={toggleFavorite}
            className="w-10 h-10 min-w-[40px] max-w-[40px] min-h-[40px] max-h-[40px] rounded-full bg-[#F5F3F3] hover:bg-slate-200 text-slate-800 flex items-center justify-center transition-colors active:scale-95 shadow-2xs"
            title={isFav ? 'Remove from Wishlist' : 'Add to Wishlist'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" className="w-5 h-5 transition-all duration-200">
              <path
                d={uploadedHeartPath}
                fill={isFav ? '#EF4444' : 'none'}
                stroke={isFav ? '#EF4444' : '#0F172A'}
                strokeWidth={isFav ? '1.5' : '1.8'}
              />
            </svg>
          </button>

          {/* Share Button */}
          <button
            type="button"
            onClick={handleShare}
            className="w-10 h-10 min-w-[40px] max-w-[40px] min-h-[40px] max-h-[40px] rounded-full bg-[#F5F3F3] hover:bg-slate-200 text-slate-800 flex items-center justify-center transition-colors active:scale-95 shadow-2xs"
            title="Share Listing"
          >
            <Share2 className="w-5 h-5 text-slate-800 stroke-[1.8]" />
          </button>

          {/* Report Listing Button */}
          {!isMyListing && (
            <button
              type="button"
              onClick={() => setIsReportModalOpen(true)}
              className="w-10 h-10 min-w-[40px] max-w-[40px] min-h-[40px] max-h-[40px] rounded-full bg-[#F5F3F3] hover:bg-rose-50 text-slate-600 hover:text-rose-600 flex items-center justify-center transition-colors active:scale-95 shadow-2xs"
              title="Report Listing"
            >
              <Flag className="w-4 h-4 stroke-[2]" />
            </button>
          )}
        </div>
      </div>

      {/* 2. SCROLLABLE PRODUCT DETAILS BODY */}
      <div className={`flex-1 ${isImageViewerOpen ? 'overflow-hidden' : 'overflow-y-auto'} pb-28 bg-white`}>

        {/* HERO IMAGE CONTAINER */}
        <div className="p-4 pt-3 pb-1">
          <div
            onClick={() => setIsImageViewerOpen(true)}
            className="w-full aspect-[4/3] rounded-[28px] overflow-hidden bg-slate-100 border border-slate-200/70 relative shadow-sm cursor-pointer group select-none"
            title="Click to view full image"
          >
            <img
              src={currentImage}
              alt={product.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />

            {/* Condition Badge Top Right */}
            <div className={`absolute top-3.5 right-3.5 px-3 py-1 rounded-xl text-[11px] font-extrabold uppercase tracking-wider backdrop-blur-md shadow-xs border ${getConditionStyle(conditionStr)}`}>
              {product.condition || 'LIKE NEW'}
            </div>

            {/* Photo Counter Pill (if multiple images) */}
            {rawImages.length > 1 && (
              <div className="absolute top-3.5 left-3.5 bg-slate-900/70 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold text-white shadow-xs">
                {selectedPhotoIndex + 1} / {rawImages.length}
              </div>
            )}

            {/* Fullscreen Expand Icon Hint */}
            <div className="absolute bottom-3.5 right-3.5 bg-slate-950/60 group-hover:bg-slate-950/80 backdrop-blur-md p-2 rounded-xl text-white shadow-xs transition-all pointer-events-none">
              <Maximize2 className="w-4 h-4" />
            </div>

            {/* Item Sold Overlay */}
            {productStatus === 'sold' && (
              <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px] flex items-center justify-center z-10">
                <span className="text-sm font-black text-white bg-rose-600 px-4 py-1.5 rounded-xl uppercase tracking-widest shadow-md border border-rose-400">
                  Item Sold
                </span>
              </div>
            )}
          </div>

          {/* Multiple Photo Thumbnails Strip */}
          {rawImages.length > 1 && (
            <div className="flex items-center gap-3 mt-2 overflow-x-auto no-scrollbar py-2.5 px-1.5">
              {rawImages.map((imgUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedPhotoIndex(idx)}
                  className={`w-14 h-14 rounded-2xl overflow-hidden border-2 transition-all shrink-0 ${selectedPhotoIndex === idx
                      ? 'border-[#1944F1] ring-2 ring-[#1944F1]/30 shadow-sm'
                      : 'border-slate-200/80 opacity-70 hover:opacity-100'
                    }`}
                >
                  <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* UNIFIED SINGLE-PAGE DETAILS (NOT DIVIDED INTO CARDS) */}
        <div className="px-5 pt-4 pb-6 divide-y divide-slate-100 space-y-4">

          {/* 1. TITLE & PRICE INFO */}
          <div className="space-y-2 pb-1">
            <h1 className="text-xl font-bold text-slate-900 font-sans leading-tight">
              {product.title}
            </h1>

            {/* Price & Negotiation Row */}
            <div className="flex items-center flex-wrap gap-2 pt-1">
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                {formatRupeePrice(product.price)}
              </span>

              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1 ${product.isNegotiable !== false
                  ? 'bg-blue-50 text-[#1944F1] border border-blue-100'
                  : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}>
                <Tag className="w-3 h-3" />
                {product.isNegotiable !== false ? 'Negotiable · Open to offers' : 'Fixed Price'}
              </span>

              <span className="text-xs text-slate-400 font-medium ml-auto flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {formattedDate}
              </span>
            </div>
          </div>

          {/* 2. DESCRIPTION */}
          <div className="pt-4 pb-1 space-y-1.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Description
              </h4>
              <span className="text-[10px] text-slate-400 font-medium">Item Details</span>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line font-normal">
              {product.description || 'No additional description provided by the seller.'}
            </p>
          </div>

          {/* 3. CATEGORY (CONDITION BESIDE IT REMOVED) */}
          <div className="pt-4 pb-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Category
            </span>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/70 text-slate-800 font-bold text-xs">
              <Tag className="w-3.5 h-3.5 text-[#1944F1]" />
              <span>{product.category || 'General'}</span>
            </div>
          </div>

          {/* 4. PICKUP POINT */}
          <div className="pt-4 pb-1">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#F5F3F3] flex items-center justify-center shrink-0">
                <svg 
                  fill="#000000" 
                  viewBox="0 0 24 24" 
                  version="1.2" 
                  baseProfile="tiny" 
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-black"
                >
                  <path d="M17.657 5.304c-3.124-3.073-8.189-3.073-11.313 0-3.124 3.074-3.124 8.057 0 11.13l5.656 5.565 5.657-5.565c3.124-3.073 3.124-8.056 0-11.13zm-5.657 8.195c-.668 0-1.295-.26-1.768-.732-.975-.975-.975-2.561 0-3.536.472-.472 1.1-.732 1.768-.732s1.296.26 1.768.732c.975.975.975 2.562 0 3.536-.472.472-1.1.732-1.768.732z"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Campus Pickup Point
                </span>
                <h3 className="text-sm font-bold text-slate-900 leading-snug mt-0.5 truncate">
                  {product.location || 'Campus designated meeting spot'}
                </h3>
              </div>
            </div>
          </div>

          {/* 5. SELLER INFORMATION */}
          <div className="pt-4 pb-1 space-y-2.5">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Seller Information
            </h4>

            <div 
              onClick={handleOpenSellerInfo}
              className="flex items-center gap-3.5 pt-1 cursor-pointer group hover:bg-slate-50/80 -mx-2 px-2 py-2 rounded-2xl transition-all"
              title="Click to view full student details and rate seller on dedicated Seller Info page"
            >
              {/* Seller Avatar */}
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 font-extrabold text-base flex items-center justify-center shrink-0 border-2 border-white shadow-xs overflow-hidden group-hover:scale-105 transition-transform ring-2 ring-transparent group-hover:ring-blue-200">
                {resolvedSellerAvatar ? (
                  <img 
                    src={resolvedSellerAvatar} 
                    alt={sellerName} 
                    className="w-full h-full object-cover" 
                    onError={(e) => {
                      if (validUserAvatar && e.currentTarget.src !== validUserAvatar) {
                        e.currentTarget.src = validUserAvatar;
                      } else {
                        e.currentTarget.style.display = 'none';
                      }
                    }}
                  />
                ) : (
                  <span>{sellerInitial}</span>
                )}
              </div>

              {/* Seller Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-slate-900 truncate group-hover:text-[#1944F1] transition-colors">
                    {sellerName}
                  </span>
                  {isSellerVerified && (
                    <svg 
                      viewBox="0 0 191.667 191.667" 
                      className="w-4 h-4 text-emerald-500 fill-current shrink-0"
                    >
                      <path d="M95.833,0C42.991,0,0,42.99,0,95.833s42.991,95.834,95.833,95.834s95.833-42.991,95.833-95.834S148.676,0,95.833,0z M150.862,79.646l-60.207,60.207c-2.56,2.56-5.963,3.969-9.583,3.969c-3.62,0-7.023-1.409-9.583-3.969l-30.685-30.685 c-2.56-2.56-3.97-5.963-3.97-9.583c0-3.621,1.41-7.024,3.97-9.584c2.559-2.56,5.962-3.97,9.583-3.97c3.62,0,7.024,1.41,9.583,3.971 l21.101,21.1l50.623-50.623c2.56-2.56,5.963-3.969,9.583-3.969c3.62,0,7.023,1.409,9.583,3.969 C156.146,65.765,156.146,74.362,150.862,79.646z"/>
                    </svg>
                  )}
                  {sellerRatingData.count > 0 && (
                    <span className="text-[10px] text-amber-500 font-bold flex items-center gap-0.5 ml-1">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {sellerRatingData.average}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                  {sellerUniversity}
                </p>

                {(resolvedSellerCourse || resolvedSellerYear) && (
                  <p className="text-[11px] text-slate-400 font-normal truncate">
                    {[resolvedSellerCourse, resolvedSellerYear].filter(Boolean).join(' · ')}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-1 text-[11px] font-bold text-[#1944F1] group-hover:translate-x-1 group-active:translate-x-1.5 transition-transform shrink-0">
                <span className="hidden sm:inline">Seller Info</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-active:translate-x-1" />
              </div>
            </div>
          </div>

          {/* 6. SAFETY TIP BANNER */}
          <div className="pt-4 pb-2">
            <div className="bg-[#EFF6FF] rounded-2xl p-3.5 border border-blue-100 flex items-start gap-2.5">
              <ShieldCheck className="w-4.5 h-4.5 text-[#1944F1] shrink-0 mt-0.5" />
              <div className="text-[11px] text-slate-600 leading-snug">
                <span className="font-bold text-slate-800">Campus Buddy Buyer Protection:</span> Inspect the item in person and test all features before finalizing the payment with the seller.
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 3. BOTTOM FIXED ACTION BAR */}
      <div className="p-4 px-5 border-t border-slate-100 bg-white/95 backdrop-blur-md flex items-center gap-3 shrink-0 fixed bottom-0 left-0 right-0 z-40 shadow-lg">
        {isMyListing ? (
          <div className="w-full flex items-center gap-2">
            {productStatus === 'sold' ? (
              /* Item Sold indicator once sold */
              <div className="w-full py-3.5 px-4 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 font-light text-xs flex items-center justify-center gap-2 select-none shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Item Sold</span>
              </div>
            ) : (
              /* Seller Action Button: Mark as Sold */
              <button
                type="button"
                onClick={handleMarkAsSold}
                className="w-full py-3.5 px-4 rounded-2xl font-light text-xs transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-xs bg-[#1944F1] hover:bg-blue-700 text-white"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Mark as Sold</span>
              </button>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              const targetSellerId = sellerId || ('seller_' + productId);
              const productTitle = product.title || 'Campus Item';
              const priceText = formatRupeePrice(product.price);
              const imageUrl = currentImage;
              const avatar = resolvedSellerAvatar || sellerInitial;

              if (onOpenChat) {
                onOpenChat({
                  sellerId: targetSellerId,
                  productId: productId,
                  sellerName: sellerName,
                  productTitle: productTitle,
                  price: priceText,
                  image: imageUrl,
                  avatar: avatar
                });
              }
            }}
            className="w-full py-4 px-5 rounded-2xl bg-[#1944F1] hover:bg-[#0D30BA] text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-4.5 h-4.5" />
            <span>Chat with Seller</span>
          </button>
        )}
      </div>

      {/* Toast notification for sharing */}
      <AnimatePresence>
        {showShareToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-2 rounded-full text-xs font-semibold shadow-lg z-50 flex items-center gap-2 pointer-events-none"
          >
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>Link copied to clipboard!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FULL-SCREEN IMAGE VIEWER LIGHTBOX */}
      <AnimatePresence>
        {isImageViewerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col justify-between items-center p-3 sm:p-6 select-none touch-none overscroll-none"
            onClick={() => setIsImageViewerOpen(false)}
            onTouchMove={(e) => e.preventDefault()}
          >
            {/* Top Bar: Counter & Close Button */}
            <div
              className="w-full flex items-center justify-between text-white z-20 max-w-5xl px-2 pt-2"
              onClick={(e) => e.stopPropagation()}
            >
              {rawImages.length > 1 ? (
                <div className="bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide border border-white/15 text-white/90 shadow-sm">
                  {selectedPhotoIndex + 1} / {rawImages.length}
                </div>
              ) : (
                <div />
              )}

              <button
                type="button"
                onClick={() => setIsImageViewerOpen(false)}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 border border-white/20 flex items-center justify-center text-white transition-all shadow-lg"
                title="Close viewer (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Center Image Container */}
            <div
              className="relative flex-1 w-full flex items-center justify-center p-2 my-auto max-w-5xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Previous Button (if multiple images) */}
              {rawImages.length > 1 && (
                <button
                  type="button"
                  onClick={() => setSelectedPhotoIndex(prev => (prev > 0 ? prev - 1 : rawImages.length - 1))}
                  className="absolute left-2 sm:left-4 z-20 w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 active:scale-95 hover:-translate-x-1 active:-translate-x-1.5 border border-white/20 text-white flex items-center justify-center backdrop-blur-md transition-all shadow-lg group"
                  title="Previous image (Left Arrow)"
                >
                  <ChevronLeft className="w-6 h-6 transition-transform group-hover:-translate-x-0.5 group-active:-translate-x-1" />
                </button>
              )}

              {/* Full Image */}
              <motion.img
                key={selectedPhotoIndex}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.2 }}
                src={currentImage}
                alt={product.title}
                className="max-h-[75vh] sm:max-h-[82vh] max-w-full object-contain rounded-2xl shadow-2xl"
              />

              {/* Next Button (if multiple images) */}
              {rawImages.length > 1 && (
                <button
                  type="button"
                  onClick={() => setSelectedPhotoIndex(prev => (prev < rawImages.length - 1 ? prev + 1 : 0))}
                  className="absolute right-2 sm:right-4 z-20 w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 active:scale-95 hover:translate-x-1 active:translate-x-1.5 border border-white/20 text-white flex items-center justify-center backdrop-blur-md transition-all shadow-lg group"
                  title="Next image (Right Arrow)"
                >
                  <ChevronRight className="w-6 h-6 transition-transform group-hover:translate-x-0.5 group-active:translate-x-1" />
                </button>
              )}
            </div>

            {/* Bottom Thumbnails Strip (if multiple images) */}
            {rawImages.length > 1 && (
              <div
                className="w-full max-w-md flex items-center justify-center gap-3 py-2.5 px-2 overflow-x-auto no-scrollbar z-20 touch-pan-x"
                onClick={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
              >
                {rawImages.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedPhotoIndex(idx)}
                    className={`w-14 h-14 rounded-2xl overflow-hidden border-2 transition-all shrink-0 ${
                      selectedPhotoIndex === idx
                        ? 'border-white ring-2 ring-white/50 shadow-md'
                        : 'border-white/20 opacity-50 hover:opacity-100'
                    }`}
                  >
                    <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product Report & Moderation Modal */}
      <AnimatePresence>
        {isReportModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[110] flex items-center justify-center p-4"
            onClick={() => setIsReportModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2 text-rose-600">
                  <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center">
                    <Flag className="w-4 h-4 text-rose-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Report Listing</h3>
                    <p className="text-[10px] text-slate-400">Campus Safety & Community Moderation</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsReportModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {reportSuccess ? (
                <div className="py-6 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">Report Received</h4>
                  <p className="text-xs text-slate-500 max-w-[280px] mx-auto leading-relaxed">
                    Thank you for keeping our campus marketplace safe. Our moderators will review this listing shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleReportSubmit} className="space-y-4 text-left">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 block">Why are you reporting this ad?</label>
                    <div className="space-y-1.5">
                      {[
                        'Prohibited or dangerous item',
                        'Suspected scam or counterfeit',
                        'Harassment or offensive content',
                        'Inaccurate price or condition',
                        'Other campus policy violation'
                      ].map((reasonOption) => (
                        <label
                          key={reasonOption}
                          onClick={() => setReportReason(reasonOption)}
                          className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                            reportReason === reasonOption
                              ? 'bg-rose-50/60 border-rose-200 text-rose-900 font-semibold'
                              : 'bg-slate-50/60 border-slate-200/70 text-slate-700 hover:bg-slate-100/60'
                          }`}
                        >
                          <input
                            type="radio"
                            name="report_reason"
                            value={reasonOption}
                            checked={reportReason === reasonOption}
                            onChange={() => setReportReason(reasonOption)}
                            className="accent-rose-600 w-3.5 h-3.5"
                          />
                          <span>{reasonOption}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 block">Additional Details (Optional)</label>
                    <textarea
                      rows={3}
                      value={reportDetails}
                      onChange={(e) => setReportDetails(e.target.value)}
                      placeholder="Help us understand the issue..."
                      className="w-full text-xs p-3 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-rose-400 focus:outline-hidden transition-all resize-none"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsReportModalOpen(false)}
                      className="flex-1 py-2.5 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingReport}
                      className="flex-1 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50"
                    >
                      {isSubmittingReport ? 'Submitting...' : 'Submit Report'}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
