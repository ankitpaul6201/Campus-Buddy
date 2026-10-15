import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Star,
  GraduationCap,
  Send,
  MessageSquare,
  Award
} from 'lucide-react';
import { formatRupeePrice, getSellerRatings, submitSellerRating } from '../lib/api';

// Student ID Card SVG provided by the user
function StudentIdCardSvg({ className = "w-4 h-4 fill-current" }) {
  return (
    <svg 
      viewBox="0 0 15 15" 
      fill="currentColor" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ width: '1.25rem', height: '1.25rem', minWidth: '1.25rem', minHeight: '1.25rem' }}
    >
      <path 
        fillRule="evenodd" 
        clipRule="evenodd" 
        d="M0 3.5C0 2.67157 0.671573 2 1.5 2H13.5C14.3284 2 15 2.67157 15 3.5V11.5C15 12.3284 14.3284 13 13.5 13H1.5C0.671574 13 0 12.3284 0 11.5V3.5ZM3 6C3 4.89543 3.89543 4 5 4C6.10457 4 7 4.89543 7 6C7 7.10457 6.10457 8 5 8C3.89543 8 3 7.10457 3 6ZM12 6H9V5H12V6ZM12 9H9V8H12V9ZM5 9C3.89132 9 2.87779 9.6264 2.38197 10.618L2.05279 11.2764C1.97529 11.4314 1.98357 11.6155 2.07468 11.7629C2.16578 11.9103 2.32671 12 2.5 12H7.5C7.67329 12 7.83422 11.9103 7.92533 11.7629C8.01643 11.6155 8.02471 11.4314 7.94721 11.2764L7.61803 10.618C7.12222 9.6264 6.10869 9 5 9Z" 
      />
    </svg>
  );
}

// Tick SVG icon provided by the user
function TickSvg({ className = "w-2.5 h-2.5 fill-current" }) {
  return (
    <svg 
      viewBox="0 0 191.667 191.667" 
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ width: '0.65rem', height: '0.65rem', minWidth: '0.65rem', minHeight: '0.65rem' }}
    >
      <path d="M95.833,0C42.991,0,0,42.99,0,95.833s42.991,95.834,95.833,95.834s95.833-42.991,95.833-95.834S148.676,0,95.833,0z M150.862,79.646l-60.207,60.207c-2.56,2.56-5.963,3.969-9.583,3.969c-3.62,0-7.023-1.409-9.583-3.969l-30.685-30.685 c-2.56-2.56-3.97-5.963-3.97-9.583c0-3.621,1.41-7.024,3.97-9.584c2.559-2.56,5.962-3.97,9.583-3.97c3.62,0,7.024,1.41,9.583,3.971 l21.101,21.1l50.623-50.623c2.56-2.56,5.963-3.969,9.583-3.969c3.62,0,7.023,1.409,9.583,3.969 C156.146,65.765,156.146,74.362,150.862,79.646z"/>
    </svg>
  );
}

export default function SellerInfoScreen({
  seller,
  product,
  user,
  userAds = [],
  onNavigateBack,
  onOpenChat
}) {
  const sellerObj = seller || product?.seller || {};
  const sellerName = sellerObj.sellerName || sellerObj.fullName || product?.sellerName || 'Campus Student';
  const sellerInitial = sellerName.charAt(0).toUpperCase();
  const sellerUniversity = sellerObj.sellerUniversity || sellerObj.universityName || product?.universityName || product?.campusName || 'Campus Member';

  const currentUserId = String(user?.id || user?._id || '');
  const currentUserEmail = (user?.email || '').toLowerCase().trim();
  const sellerId = String(sellerObj.sellerId || sellerObj._id || sellerObj.id || product?.sellerId || '');
  const sellerEmail = (sellerObj.email || product?.sellerEmail || '').toLowerCase().trim();
  const sellerNameNormalized = sellerName.trim().toLowerCase();

  const isMyListing = Boolean(
    sellerObj.isMyListing ?? (
      (sellerId && currentUserId && sellerId === currentUserId) ||
      (currentUserEmail && sellerEmail && currentUserEmail === sellerEmail) ||
      (Array.isArray(userAds) && product && userAds.some(a => String(a._id || a.id) === String(product._id || product.id))) ||
      product?.sellerName === 'You'
    )
  );

  const targetSellerKey = sellerObj.sellerId || sellerObj._id || sellerObj.id || product?.sellerId || sellerNameNormalized || 'seller';

  const isSellerVerified = Boolean(
    sellerObj.isSellerVerified ?? sellerObj.isVerified ?? product?.verified ?? (isMyListing ? user?.isVerified : false)
  );

  const scrollContainerRef = useRef(null);

  // Always scroll to the very top when opening SellerInfoScreen
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }

    const rafId = requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
    });

    return () => cancelAnimationFrame(rafId);
  }, []);

  const [sellerRatingData, setSellerRatingData] = useState(() => getSellerRatings(targetSellerKey));
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState('');
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  useEffect(() => {
    setSellerRatingData(getSellerRatings(targetSellerKey));
  }, [targetSellerKey]);

  // Calculate actual ads posted by this seller
  const sellerAdsCount = (() => {
    try {
      const allAdsFromStorage = JSON.parse(localStorage.getItem('campus_user_ads') || '[]');
      const allProductsCache = JSON.parse(localStorage.getItem('campus_products_cache') || '[]');
      const combined = [...(userAds || []), ...allAdsFromStorage, ...allProductsCache];

      if (isMyListing) {
        const myAds = combined.filter(a => {
          return a.isMyListing || 
            (a.sellerId && currentUserId && String(a.sellerId) === String(currentUserId)) ||
            (a.seller?._id && currentUserId && String(a.seller._id) === String(currentUserId));
        });
        const unique = new Set(myAds.map(a => String(a._id || a.id)));
        return unique.size || (userAds?.length || 0);
      } else {
        const matched = combined.filter(a => {
          return (
            (a.sellerId && String(a.sellerId) === String(targetSellerKey)) ||
            (a.seller?._id && String(a.seller._id) === String(targetSellerKey)) ||
            (a.sellerName && a.sellerName.toLowerCase() === sellerNameNormalized) ||
            (a.seller?.fullName && a.seller.fullName.toLowerCase() === sellerNameNormalized)
          );
        });
        const unique = new Set(matched.map(a => String(a._id || a.id)));
        return unique.size || (product ? 1 : 0);
      }
    } catch {
      return isMyListing ? (userAds?.length || 0) : (product ? 1 : 0);
    }
  })();

  const customUserAvatar = typeof window !== 'undefined'
    ? (localStorage.getItem('user_custom_avatar') || (() => {
        try { return JSON.parse(localStorage.getItem('campus_user') || '{}')?.avatar; } catch { return null; }
      })())
    : null;
  const validUserAvatar = customUserAvatar || (user?.avatar && !['/avatar.svg', '/avatar-blue.svg'].includes(user.avatar) ? user.avatar : null);

  const resolvedSellerAvatar = isMyListing
    ? (validUserAvatar || user?.avatar || sellerObj.sellerAvatar || sellerObj.avatar)
    : (sellerObj.sellerAvatar || sellerObj.avatar);

  const resolvedSellerCourse = (
    isMyListing
      ? (user?.course || (typeof window !== 'undefined' ? (localStorage.getItem('user_course') || localStorage.getItem('pending_course')) : '') || sellerObj.sellerCourse || sellerObj.course || '')
      : (sellerObj.sellerCourse || sellerObj.course || '')
  ).trim();

  const resolvedSellerYear = (
    isMyListing
      ? (user?.year || (typeof window !== 'undefined' ? (localStorage.getItem('user_year') || localStorage.getItem('pending_year')) : '') || sellerObj.sellerYear || sellerObj.year || '')
      : (sellerObj.sellerYear || sellerObj.year || '')
  ).trim();

  const resolvedSellerDob = (
    isMyListing
      ? (user?.dob || (typeof window !== 'undefined' ? (localStorage.getItem('user_dob') || localStorage.getItem('pending_dob')) : '') || sellerObj.sellerDob || sellerObj.dob || '')
      : (sellerObj.sellerDob || sellerObj.dob || '')
  );

  // Calculate age from DOB
  const calculateAge = (dobString) => {
    if (!dobString) return null;
    const dob = new Date(dobString);
    if (isNaN(dob.getTime())) return null;
    const diff_ms = Date.now() - dob.getTime();
    const age_dt = new Date(diff_ms);
    const age = Math.abs(age_dt.getUTCFullYear() - 1970);
    return isNaN(age) ? null : age;
  };

  const sellerAgeNumber = calculateAge(resolvedSellerDob);
  const sellerAgeFormatted = sellerAgeNumber ? `${sellerAgeNumber} Years` : 'Not specified';

  const handleRatingSubmit = (e) => {
    if (e) e.preventDefault();
    const reviewerName = currentUserName ? (user?.fullName || user?.name || 'Verified Student') : 'Verified Student';
    const updated = submitSellerRating(targetSellerKey, {
      rating: userRating,
      comment: userComment,
      reviewerName
    });
    if (updated) {
      setSellerRatingData(updated);
      setRatingSubmitted(true);
      setUserComment('');
      setTimeout(() => setRatingSubmitted(false), 4500);
    }
  };

  const handleChatTrigger = () => {
    if (onOpenChat) {
      onOpenChat({
        sellerId: sellerObj.sellerId || sellerObj._id || ('seller_' + product?.id),
        productId: product?._id || product?.id,
        sellerName: sellerName,
        productTitle: product?.title || 'Campus Item',
        price: product?.price ? formatRupeePrice(product.price) : '',
        image: product?.images?.[0] || product?.image,
        avatar: resolvedSellerAvatar || sellerInitial
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="w-full h-full bg-white text-slate-900 flex flex-col justify-between overflow-hidden font-sans select-none relative"
    >
      {/* 1. TOP HEADER WITH WHITE PADDING */}
      <div className="pt-12 pb-3.5 px-5 bg-white border-b border-slate-100 flex items-center justify-between shrink-0 sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onNavigateBack}
            className="w-10 h-10 min-w-[40px] max-w-[40px] min-h-[40px] max-h-[40px] rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center transition-all duration-200 hover:-translate-x-1 active:-translate-x-1.5 active:scale-95 shadow-2xs group"
            aria-label="Back to Product Details"
          >
            <ArrowLeft className="w-5 h-5 text-slate-800 stroke-[2.2] transition-transform duration-200 group-hover:-translate-x-0.5 group-active:-translate-x-1" />
          </button>

          <div>
            <h1 className="text-base font-bold text-slate-900 font-sans tracking-tight leading-tight">
              Seller Info
            </h1>
          </div>
        </div>
      </div>

      {/* SINGLE UNIFIED PAGE BODY */}
      <div ref={scrollContainerRef} className={`flex-1 overflow-y-auto ${!isMyListing ? 'pb-28' : 'pb-8'} no-scrollbar bg-white`}>

        {/* 2. AVATAR & VERIFIED STUDENT BADGE ROW */}
        <div className="px-5 pt-5 pb-1 flex items-center justify-between">
          {/* Avatar Profile Picture */}
          <div className="w-20 h-20 min-w-[80px] min-h-[80px] max-w-[80px] max-h-[80px] rounded-full border-2 border-slate-100 shadow-sm overflow-hidden bg-slate-100 shrink-0 flex items-center justify-center text-[#1944F1] font-black text-2xl">
            {resolvedSellerAvatar ? (
              <img 
                src={resolvedSellerAvatar} 
                alt={sellerName} 
                className="w-full h-full object-cover" 
              />
            ) : (
              <span>{sellerInitial}</span>
            )}
          </div>

          {/* Student Status Badge */}
          {isSellerVerified ? (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-200/80 text-slate-800 shadow-2xs">
              <div className="relative inline-flex items-center justify-center shrink-0">
                <StudentIdCardSvg className="w-4 h-4 text-slate-800 fill-current" />
                <div className="absolute -bottom-1 -right-1 rounded-full bg-white p-[1px] flex items-center justify-center shadow-xs">
                  <TickSvg className="w-2.5 h-2.5 text-emerald-500 fill-current" />
                </div>
              </div>
              <span className="text-xs font-semibold text-slate-700">Verified Student</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200/80 text-slate-600 shadow-2xs">
              <StudentIdCardSvg className="w-4 h-4 text-slate-500 fill-current" />
              <span className="text-xs font-semibold text-slate-600">Student</span>
            </div>
          )}
        </div>

        {/* 4. NAME & DETAILS */}
        <div className="px-5 pt-3 pb-2">
          <h2 className="text-xl font-bold text-slate-900 leading-tight tracking-tight">
            {sellerName}
          </h2>

          <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed break-words">
            {sellerUniversity}
          </p>
        </div>

        {/* 5. 3 STATS INLINE METRICS */}
        <div className="mx-5 border-y border-slate-100 my-3 py-3.5">
          <div className="grid grid-cols-3 divide-x divide-slate-100 text-center">
            <div>
              <span className="text-base font-extrabold text-slate-900 block leading-tight">
                {sellerRatingData.count > 0 ? `${sellerRatingData.average} ★` : '—'}
              </span>
              <span className="text-[11px] text-slate-400 font-medium mt-0.5 block">
                {sellerRatingData.count > 0 ? 'Rating' : 'No Rating'}
              </span>
            </div>

            <div>
              <span className="text-base font-extrabold text-slate-900 block leading-tight">
                {sellerAdsCount}
              </span>
              <span className="text-[11px] text-slate-400 font-medium mt-0.5 block">
                {sellerAdsCount === 1 ? 'Post' : 'Posts'}
              </span>
            </div>

            <div>
              <span className="text-base font-extrabold text-slate-900 block leading-tight">
                {sellerRatingData.count || 0}
              </span>
              <span className="text-[11px] text-slate-400 font-medium mt-0.5 block">
                {sellerRatingData.count === 1 ? 'Review' : 'Reviews'}
              </span>
            </div>
          </div>
        </div>

        {/* 6. ACADEMIC INFORMATION */}
        <div className="px-5 py-2 space-y-3">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-[#1944F1]" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Academic Information
            </h3>
          </div>

          <div className="divide-y divide-slate-100 border-y border-slate-100 py-1">
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Course / Degree</span>
              <span className="text-xs font-bold text-slate-900 text-right max-w-[65%] line-clamp-1">
                {resolvedSellerCourse || 'Not specified'}
              </span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Current Year</span>
              <span className="text-xs font-bold text-slate-900 text-right">
                {resolvedSellerYear || 'Not specified'}
              </span>
            </div>

            {/* Below current year: Shows user age instead of university name */}
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Age</span>
              <span className="text-xs font-bold text-slate-900 text-right">
                {sellerAgeFormatted}
              </span>
            </div>
          </div>
        </div>

        {/* 7. RATE THIS SELLER */}
        <div className="px-5 py-4 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>Rate this Seller</span>
              </h3>
              <p className="text-[11px] text-slate-400 font-normal mt-0.5">
                Share your experience with fellow campus students
              </p>
            </div>

            {sellerRatingData.count > 0 ? (
              <div className="flex items-center gap-1 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100 shrink-0 whitespace-nowrap shadow-2xs">
                <span className="text-sm font-black text-slate-900 leading-none">{sellerRatingData.average}</span>
                <span className="text-xs text-amber-600 font-bold leading-none">/ 5.0</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200/80 shrink-0 whitespace-nowrap shadow-2xs">
                <span className="text-[11px] font-semibold text-slate-500 leading-none">No ratings yet</span>
              </div>
            )}
          </div>

          {isMyListing ? (
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-center text-xs text-slate-500 font-medium leading-relaxed">
              This is your own seller profile. Fellow students can rate you after campus transactions.
            </div>
          ) : (
            <form onSubmit={handleRatingSubmit} className="space-y-3 pt-1">
              <div className="flex flex-col items-center justify-center py-3 bg-slate-50/80 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setUserRating(star)}
                      className="p-1 transition-transform hover:scale-120 active:scale-95"
                      title={`${star} Star${star > 1 ? 's' : ''}`}
                    >
                      <Star 
                        className={`w-7 h-7 transition-colors ${
                          star <= userRating 
                            ? 'text-amber-400 fill-amber-400 drop-shadow-xs' 
                            : 'text-slate-200 fill-slate-100'
                        }`} 
                      />
                    </button>
                  ))}
                </div>
                <span className="text-[11px] font-bold text-slate-600 mt-1.5 bg-white px-3 py-0.5 rounded-full border border-slate-100">
                  {userRating === 5 && '🌟 Outstanding Experience (5/5)'}
                  {userRating === 4 && '⭐ Very Good & Reliable (4/5)'}
                  {userRating === 3 && '⭐ Good & As Described (3/5)'}
                  {userRating === 2 && '⭐ Fair / Minor Issues (2/5)'}
                  {userRating === 1 && '⭐ Needs Improvement (1/5)'}
                </span>
              </div>

              <textarea
                value={userComment}
                onChange={(e) => setUserComment(e.target.value)}
                placeholder={`Write a quick review about ${sellerName}...`}
                rows={2}
                className="w-full text-xs p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#1944F1] focus:ring-2 focus:ring-blue-100/70 resize-none font-sans transition-all"
              />

              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-2xl bg-[#1944F1] hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Rating</span>
              </button>

              {ratingSubmitted && (
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200 text-center animate-fade-in">
                  ✓ Your verified rating has been submitted successfully!
                </div>
              )}
            </form>
          )}
        </div>

        {/* 8. STUDENT FEEDBACK */}
        <div className="px-5 py-4 border-t border-slate-100 space-y-3 pb-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-[#1944F1]" />
              <span>Student Feedback ({sellerRatingData.reviews?.length || 0})</span>
            </h3>
            <span className="text-[10px] font-semibold text-slate-400">Verified Peer Reviews</span>
          </div>

          <div className="space-y-2.5">
            {(!sellerRatingData.reviews || sellerRatingData.reviews.length === 0) ? (
              <div className="py-7 px-4 text-center rounded-2xl bg-slate-50/70 border border-slate-100 space-y-1.5">
                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-slate-400" />
                </div>
                <p className="text-xs font-bold text-slate-700">No reviews yet</p>
                <p className="text-[11px] text-slate-400 max-w-[240px] mx-auto leading-relaxed">
                  {isMyListing
                    ? "Buyer reviews will appear here once ratings are submitted for your campus listings."
                    : "There are no peer reviews for this seller yet. Submit the first review above!"}
                </p>
              </div>
            ) : (
              sellerRatingData.reviews.map((rev, idx) => (
                <div key={rev.id || idx} className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center">
                        {(rev.name || 'S').charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs font-bold text-slate-900">{rev.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">{rev.date}</span>
                  </div>
                  <div className="flex gap-0.5 text-amber-400">
                    {[...Array(rev.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">{rev.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* 9. FIXED BOTTOM ACTION BAR - Only for peer sellers (Chat button) */}
      {!isMyListing && (
        <div className="p-4 px-5 border-t border-slate-100 bg-white/95 backdrop-blur-md flex items-center gap-3 shrink-0 fixed bottom-0 left-0 right-0 z-40 shadow-lg">
          <button
            type="button"
            onClick={handleChatTrigger}
            className="w-full py-4 px-5 rounded-2xl bg-[#1944F1] hover:bg-[#0D30BA] text-white font-bold text-xs shadow-md shadow-blue-500/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-4.5 h-4.5" />
            <span>Chat with {sellerName}</span>
          </button>
        </div>
      )}
    </motion.div>
  );
}
