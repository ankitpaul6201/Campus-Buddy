import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  MapPin,
  CheckCircle2,
  MessageSquare,
  Phone,
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
  Flag,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from 'lucide-react';
import { 
  formatRupeePrice, 
  updateProductStatus, 
  incrementAdViews, 
  updateAdLikes,
  getSellerRatings,
  submitSellerRating,
  apiReportProduct,
  fetchProductById,
  fetchStudentProfile
} from '../lib/api';

// Exact SVG Call icon from Clickons/Call.svg
function ClickonsCallIcon({ className = "w-4.5 h-4.5" }) {
  return (
    <svg 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path 
        d="M3.57495 1.78507C4.86403 0.500096 7.02542 0.85943 7.93802 2.37559L7.94437 2.38614L10.0481 5.98116C10.6676 7.06185 10.5113 8.45112 9.58705 9.37241L9.23813 9.72022C10.4736 11.658 12.3503 13.575 14.2473 14.7248L14.5942 14.4175C15.5184 13.5164 16.898 13.3683 17.9731 13.9807L17.9809 13.9852L21.5408 16.0552C22.4222 16.4771 22.8861 17.2924 22.981 18.1064C23.0759 18.9196 22.8156 19.8022 22.1826 20.4332L20.983 21.629C19.7376 22.8705 17.7101 23.4199 15.9799 22.636C13.7025 21.7053 10.2868 19.9491 7.17369 16.8459C4.05248 13.7347 2.29312 10.2235 1.36877 8.07565C0.580206 6.3562 1.1236 4.34015 2.36039 3.0955L3.54727 1.8138C3.5563 1.80404 3.56553 1.79446 3.57495 1.78507ZM4.99956 3.18371L3.81678 4.46098C3.80774 4.47074 3.79851 4.48032 3.78909 4.48971C3.04036 5.23606 2.79124 6.39219 3.19016 7.25375C3.194 7.26205 3.19773 7.2704 3.20134 7.2788C4.07772 9.31719 5.71644 12.5749 8.5874 15.4367C11.4635 18.3037 14.635 19.9343 16.7561 20.7993C16.7697 20.8048 16.7831 20.8107 16.7965 20.8168C17.6608 21.2145 18.8206 20.9661 19.5693 20.2198L20.7689 19.024C20.9356 18.8578 21.0252 18.5946 20.9951 18.3366C20.9669 18.095 20.8472 17.9294 20.6622 17.8457C20.6315 17.8317 20.6014 17.8162 20.5722 17.7992L16.9781 15.7093C16.6631 15.5317 16.2592 15.5759 15.9848 15.8495C15.971 15.8633 15.9567 15.8767 15.9421 15.8896L15.0424 16.6868C14.7325 16.9613 14.2849 17.0168 13.9171 16.8261C11.2199 15.4281 8.58822 12.6858 7.10831 10.0515C6.88962 9.66223 6.95716 9.17549 7.27365 8.86001L8.17334 7.96319C8.44778 7.68962 8.49207 7.28699 8.31392 6.97306L6.22104 3.39666C5.93617 2.92942 5.31277 2.88679 4.99956 3.18371Z" 
        fillRule="evenodd" 
        clipRule="evenodd" 
        fill="currentColor"
      />
      <path 
        d="M16.2554 7.74458C15.754 7.24317 14.9795 7.06344 14.4318 7.24599C13.862 7.43594 13.2461 7.12797 13.0561 6.55812C12.8662 5.98826 13.1741 5.37232 13.744 5.18237C15.154 4.71235 16.7723 5.18519 17.7935 6.20645C18.8148 7.22771 19.2876 8.84596 18.8176 10.256C18.6277 10.8259 18.0117 11.1338 17.4419 10.9439C16.872 10.7539 16.5641 10.138 16.754 9.56815C16.9366 9.0205 16.7568 8.24598 16.2554 7.74458Z" 
        fillRule="evenodd" 
        clipRule="evenodd" 
        fill="currentColor"
      />
      <path 
        d="M18.9493 5.05068C17.1752 3.27653 14.5962 2.65215 12.2855 3.27428C11.7415 3.42074 11.1818 3.09848 11.0353 2.5545C10.8889 2.01052 11.2111 1.45081 11.7551 1.30435C14.7486 0.498423 18.0859 1.3021 20.3919 3.60812C22.6979 5.91414 23.5016 9.25145 22.6957 12.2449C22.5492 12.7889 21.9895 13.1111 21.4455 12.9647C20.9015 12.8182 20.5793 12.2585 20.7257 11.7145C21.3478 9.40375 20.7235 6.82482 18.9493 5.05068Z" 
        fillRule="evenodd" 
        clipRule="evenodd" 
        fill="currentColor"
      />
    </svg>
  );
}

// Exact SVG Chat icon from Clickons/Chat.svg
function ClickonsChatIcon({ className = "w-4.5 h-4.5" }) {
  return (
    <svg 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path 
        d="M1 5.78146C1 3.646 2.62571 2 4.76316 2H14.2368C16.3973 2 18 3.76883 18 5.78146V11.7417C18 13.9004 16.2523 15.5232 14.2368 15.5232H8.01974C7.37166 15.5232 6.78381 15.7363 6.23901 16.127L2.59201 18.8059C2.28819 19.0291 1.88468 19.0625 1.54834 18.8922C1.212 18.7219 1 18.377 1 18V5.78146ZM3 16.0246L5.06751 14.5059C5.90319 13.9005 6.89305 13.5232 8.01974 13.5232H14.2368C15.182 13.5232 16 12.7619 16 11.7417V5.78146C16 4.81395 15.2342 4 14.2368 4H4.76316C3.74271 4 3 4.7381 3 5.78146V16.0246Z" 
        fillRule="evenodd" 
        clipRule="evenodd" 
        fill="currentColor"
      />
      <path 
        d="M19.5305 8.62091C19.7399 8.10986 20.3239 7.86529 20.835 8.07467C22.095 8.59089 23 9.78417 23 11.1825V22C23 22.3668 22.7992 22.7042 22.4768 22.879C22.1543 23.0539 21.762 23.0382 21.4546 22.8382L17.9546 20.5608C17.9328 20.5466 17.9115 20.5316 17.8908 20.5157C17.5068 20.2207 16.9266 20.0584 16.2353 20.0584H10.3676C8.98095 20.0584 7.68903 19.2926 7.09922 18.0694C6.85936 17.5719 7.0682 16.9742 7.56568 16.7343C8.06316 16.4944 8.66089 16.7033 8.90075 17.2008C9.13447 17.6855 9.69549 18.0584 10.3676 18.0584H16.2353C17.1784 18.0584 18.2298 18.27 19.0755 18.9041L21 20.1563V11.1825C21 10.683 20.6697 10.1683 20.0768 9.92537C19.5657 9.716 19.3211 9.13197 19.5305 8.62091Z" 
        fillRule="evenodd" 
        clipRule="evenodd" 
        fill="currentColor"
      />
    </svg>
  );
}

export default function ProductDetailsScreen({
  product = {},
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
  const [liveProduct, setLiveProduct] = useState(product);
  const [sellerStudentInfo, setSellerStudentInfo] = useState(null);

  useEffect(() => {
    setLiveProduct(product);
  }, [product]);

  useEffect(() => {
    let isMounted = true;
    const targetId = product?._id || product?.id;
    if (targetId) {
      fetchProductById(targetId).then(fresh => {
        if (isMounted && fresh) {
          setLiveProduct(prev => ({
            ...(prev || {}),
            ...fresh,
            seller: typeof fresh.seller === 'object' && fresh.seller !== null
              ? { ...((prev && prev.seller) || {}), ...fresh.seller }
              : fresh.seller
          }));
        }
      }).catch(() => {});
    }
    return () => { isMounted = false; };
  }, [product?._id, product?.id]);

  const safeProduct = liveProduct || product || {};
  const productId = safeProduct._id || safeProduct.id;
  const isFav = (favorites || []).some(id => String(id) === String(productId));

  // Extract all photos
  const rawImages = (Array.isArray(safeProduct.images) && safeProduct.images.length > 0)
    ? safeProduct.images
    : (safeProduct.image ? [safeProduct.image] : ['https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=800&q=80']);

  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  const [productStatus, setProductStatus] = useState(safeProduct?.status || 'active');
  const [showCallModal, setShowCallModal] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('Prohibited or dangerous item');
  const [reportDetails, setReportDetails] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  // --- Swipe support for hero image carousel ---
  const heroTouchStart = useRef(null);
  const heroTouchDelta = useRef(0);

  const handleHeroTouchStart = useCallback((e) => {
    heroTouchStart.current = e.touches[0].clientX;
    heroTouchDelta.current = 0;
  }, []);

  const handleHeroTouchMove = useCallback((e) => {
    if (heroTouchStart.current === null) return;
    heroTouchDelta.current = e.touches[0].clientX - heroTouchStart.current;
  }, []);

  const handleHeroTouchEnd = useCallback(() => {
    const threshold = 50;
    if (heroTouchDelta.current < -threshold && rawImages.length > 1) {
      setSelectedPhotoIndex(prev => (prev < rawImages.length - 1 ? prev + 1 : 0));
    } else if (heroTouchDelta.current > threshold && rawImages.length > 1) {
      setSelectedPhotoIndex(prev => (prev > 0 ? prev - 1 : rawImages.length - 1));
    }
    heroTouchStart.current = null;
    heroTouchDelta.current = 0;
  }, [rawImages.length]);

  // --- Zoom & pan state for fullscreen lightbox ---
  const [zoomScale, setZoomScale] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const zoomScaleRef = useRef(1);
  const panOffsetRef = useRef({ x: 0, y: 0 });
  zoomScaleRef.current = zoomScale;
  panOffsetRef.current = panOffset;

  const viewerContainerRef = useRef(null);
  const viewerImgRef = useRef(null);
  const pinchStartDist = useRef(null);
  const pinchStartScale = useRef(1);
  const panStartRef = useRef(null);
  const panStartOffset = useRef({ x: 0, y: 0 });
  const lastTapRef = useRef(0);
  const mouseDragStart = useRef(null);

  // --- Swipe support for lightbox viewer (when not zoomed) ---
  const viewerTouchStart = useRef(null);
  const viewerTouchDelta = useRef(0);

  // Reset zoom when changing images or closing viewer
  const resetZoom = useCallback(() => {
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });
    zoomScaleRef.current = 1;
    panOffsetRef.current = { x: 0, y: 0 };
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoomScale(prev => {
      const next = Math.min(Number((prev + 0.5).toFixed(2)), 4);
      zoomScaleRef.current = next;
      return next;
    });
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomScale(prev => {
      const next = Math.max(Number((prev - 0.5).toFixed(2)), 1);
      zoomScaleRef.current = next;
      if (next <= 1) {
        setPanOffset({ x: 0, y: 0 });
        panOffsetRef.current = { x: 0, y: 0 };
      }
      return next;
    });
  }, []);

  const handleDoubleClick = useCallback((e) => {
    e.stopPropagation();
    if (zoomScaleRef.current > 1) {
      resetZoom();
    } else {
      setZoomScale(2.5);
      zoomScaleRef.current = 2.5;
    }
  }, [resetZoom]);

  useEffect(() => {
    resetZoom();
  }, [selectedPhotoIndex, isImageViewerOpen, resetZoom]);

  // Native non-passive touch and wheel listeners for 100% reliable pinch-to-zoom & pan
  useEffect(() => {
    const el = viewerContainerRef.current;
    if (!el || !isImageViewerOpen) return;

    const calcDistance = (t1, t2) => {
      const dx = t1.clientX - t2.clientX;
      const dy = t1.clientY - t2.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const onTouchStart = (e) => {
      if (e.touches.length === 2) {
        // Two-finger pinch start
        pinchStartDist.current = calcDistance(e.touches[0], e.touches[1]);
        pinchStartScale.current = zoomScaleRef.current;
        setIsDragging(true);
      } else if (e.touches.length === 1) {
        const touch = e.touches[0];
        if (zoomScaleRef.current > 1) {
          // One-finger pan when zoomed
          panStartRef.current = { x: touch.clientX, y: touch.clientY };
          panStartOffset.current = { ...panOffsetRef.current };
          setIsDragging(true);
        } else {
          // Track swipe for switching photos
          viewerTouchStart.current = touch.clientX;
          viewerTouchDelta.current = 0;
        }

        // Double-tap detection
        const now = Date.now();
        if (now - lastTapRef.current < 320) {
          if (zoomScaleRef.current > 1) {
            resetZoom();
          } else {
            setZoomScale(2.5);
            zoomScaleRef.current = 2.5;
          }
          lastTapRef.current = 0;
        } else {
          lastTapRef.current = now;
        }
      }
    };

    const onTouchMove = (e) => {
      if (e.touches.length === 2 && pinchStartDist.current !== null) {
        if (e.cancelable) e.preventDefault();
        const currentDist = calcDistance(e.touches[0], e.touches[1]);
        const scaleFactor = currentDist / pinchStartDist.current;
        const newScale = Math.min(Math.max(pinchStartScale.current * scaleFactor, 1), 4.5);
        setZoomScale(newScale);
        zoomScaleRef.current = newScale;
        if (newScale <= 1) {
          setPanOffset({ x: 0, y: 0 });
          panOffsetRef.current = { x: 0, y: 0 };
        }
      } else if (e.touches.length === 1) {
        const touch = e.touches[0];
        if (zoomScaleRef.current > 1 && panStartRef.current) {
          if (e.cancelable) e.preventDefault();
          const dx = touch.clientX - panStartRef.current.x;
          const dy = touch.clientY - panStartRef.current.y;
          const nextOffset = {
            x: panStartOffset.current.x + dx,
            y: panStartOffset.current.y + dy
          };
          setPanOffset(nextOffset);
          panOffsetRef.current = nextOffset;
        } else if (viewerTouchStart.current !== null) {
          viewerTouchDelta.current = touch.clientX - viewerTouchStart.current;
        }
      }
    };

    const onTouchEnd = (e) => {
      setIsDragging(false);
      pinchStartDist.current = null;
      panStartRef.current = null;

      // Swipe navigation when not zoomed
      if (zoomScaleRef.current <= 1 && viewerTouchStart.current !== null) {
        const threshold = 45;
        if (viewerTouchDelta.current < -threshold && rawImages.length > 1) {
          setSelectedPhotoIndex(prev => (prev < rawImages.length - 1 ? prev + 1 : 0));
        } else if (viewerTouchDelta.current > threshold && rawImages.length > 1) {
          setSelectedPhotoIndex(prev => (prev > 0 ? prev - 1 : rawImages.length - 1));
        }
      }

      viewerTouchStart.current = null;
      viewerTouchDelta.current = 0;

      if (zoomScaleRef.current < 1.05) {
        resetZoom();
      }
    };

    const onWheel = (e) => {
      if (e.cancelable) e.preventDefault();
      const delta = e.deltaY > 0 ? -0.25 : 0.25;
      setZoomScale(prev => {
        const next = Math.min(Math.max(Number((prev + delta).toFixed(2)), 1), 4.5);
        zoomScaleRef.current = next;
        if (next <= 1) {
          setPanOffset({ x: 0, y: 0 });
          panOffsetRef.current = { x: 0, y: 0 };
        }
        return next;
      });
    };

    el.addEventListener('touchstart', onTouchStart, { passive: false });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: false });
    el.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('wheel', onWheel);
    };
  }, [isImageViewerOpen, rawImages.length, resetZoom]);

  // Desktop mouse drag to pan when zoomed
  const handleMouseDown = (e) => {
    if (zoomScale <= 1) return;
    e.preventDefault();
    setIsDragging(true);
    mouseDragStart.current = {
      x: e.clientX,
      y: e.clientY,
      initPan: { ...panOffset }
    };
  };

  const handleMouseMove = (e) => {
    if (!mouseDragStart.current || zoomScale <= 1) return;
    const dx = e.clientX - mouseDragStart.current.x;
    const dy = e.clientY - mouseDragStart.current.y;
    setPanOffset({
      x: mouseDragStart.current.initPan.x + dx,
      y: mouseDragStart.current.initPan.y + dy
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    mouseDragStart.current = null;
  };

  // Extract seller information
  const sellerObj = (typeof safeProduct.seller === 'object' && safeProduct.seller !== null) ? safeProduct.seller : {};
  const sellerName = sellerObj.fullName || safeProduct.sellerName || (typeof safeProduct.seller === 'string' ? safeProduct.seller : 'Campus Student');
  const sellerNameNormalized = (sellerName || '').trim().toLowerCase();
  const sellerInitial = (sellerName || 'S').charAt(0).toUpperCase();
  const isSellerVerified = Boolean(sellerObj.isVerified || safeProduct.verified);
  const sellerUniversity = sellerObj.universityName || safeProduct.universityName || safeProduct.campusName || 'Campus Member';

  // Check if current user is the seller
  const currentUserId = String(user?.id || user?._id || '');
  const currentUserEmail = (user?.email || '').toLowerCase().trim();
  const sellerId = String(sellerObj._id || sellerObj.id || safeProduct.sellerId || (typeof safeProduct.seller === 'string' ? safeProduct.seller : '') || '');
  const sellerEmail = (sellerObj.email || safeProduct.sellerEmail || '').toLowerCase().trim();

  // Strict check: current user is the owner ONLY if IDs/emails match or it is in their own userAds
  const isMyListing = Boolean(
    (currentUserId && sellerId && currentUserId === sellerId) ||
    (currentUserEmail && sellerEmail && currentUserEmail === sellerEmail) ||
    (Array.isArray(userAds) && userAds.some(a => String(a._id || a.id) === String(productId)))
  );

  // Strictly resolve exactly 10-digit seller phone number from student section / API
  const resolveSellerPhoneNumber = () => {
    // 1. If viewing own listing, return user's latest phone directly from student profile
    if (isMyListing) {
      const myPhone = user?.phone || (typeof window !== 'undefined' ? localStorage.getItem('user_phone') : '');
      const uDigits = String(myPhone || '').replace(/\D/g, '');
      if (uDigits.length >= 10) return uDigits.slice(-10);
    }

    // 2. Priority: seller phone fetched from student information section API
    if (sellerStudentInfo?.phone) {
      const sDigits = String(sellerStudentInfo.phone).replace(/\D/g, '');
      if (sDigits.length >= 10) return sDigits.slice(-10);
    }

    // 3. Fallback: populated seller object phone, or product contactNumber / phone
    let raw = sellerObj?.phone || sellerObj?.phoneNumber || safeProduct.contactNumber || safeProduct.phone || '';

    // 4. Check userAds if user owns this listing locally
    if (!raw && Array.isArray(userAds)) {
      const match = userAds.find(a => String(a._id || a.id) === String(productId));
      if (match) {
        raw = match.phone || match.contactNumber || match.seller?.phone || '';
      }
    }

    // 5. Fallback to product cache
    if (!raw) {
      try {
        const cached = JSON.parse(localStorage.getItem('campus_products_cache') || '[]');
        const match = cached.find(p => String(p._id || p.id) === String(productId));
        if (match) {
          raw = match.phone || match.contactNumber || match.seller?.phone || '';
        }
      } catch (e) {}
    }

    const digits = String(raw).replace(/\D/g, '');
    return digits.length >= 10 ? digits.slice(-10) : '';
  };

  const sellerPhoneNumber = resolveSellerPhoneNumber();

  const handleCallSeller = () => {
    if (sellerPhoneNumber && sellerPhoneNumber.length === 10) {
      const telUrl = `tel:${sellerPhoneNumber}`;
      try {
        window.open(telUrl, '_system');
      } catch (err) {}
      window.location.href = telUrl;
    } else {
      setShowCallModal(true);
    }
  };

  const targetSellerKey = sellerId || sellerNameNormalized || 'seller';
  const [sellerRatingData, setSellerRatingData] = useState(() => getSellerRatings(targetSellerKey));

  // Fetch seller student information from student section API
  useEffect(() => {
    let isMounted = true;
    const targetUserId = sellerId && /^[0-9a-fA-F]{24}$/.test(sellerId) ? sellerId : null;
    if (targetUserId && targetUserId !== currentUserId) {
      fetchStudentProfile(targetUserId).then(profile => {
        if (isMounted && profile) {
          setSellerStudentInfo(profile);
        }
      }).catch(() => {});
    }
    return () => { isMounted = false; };
  }, [sellerId, currentUserId]);

  useEffect(() => {
    setSellerRatingData(getSellerRatings(targetSellerKey));
  }, [targetSellerKey, safeProduct?._id]);

  // Keep rating updated in real-time when submitted from SellerInfoScreen
  useEffect(() => {
    const handleRatingSync = () => {
      setSellerRatingData(getSellerRatings(targetSellerKey));
    };
    window.addEventListener('seller-rating-updated', handleRatingSync);
    window.addEventListener('storage', handleRatingSync);
    return () => {
      window.removeEventListener('seller-rating-updated', handleRatingSync);
      window.removeEventListener('storage', handleRatingSync);
    };
  }, [targetSellerKey]);

  useEffect(() => {
    if (safeProduct?.status) setProductStatus(safeProduct.status);
  }, [safeProduct?.status]);

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

  if (!product || !productId) {
    return (
      <div className="w-full h-full min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <p className="text-slate-500 text-sm mb-4">Listing not found or has been removed.</p>
        <button
          type="button"
          onClick={onNavigateBack}
          className="px-5 py-2.5 bg-[#1944F1] text-white rounded-full text-xs font-bold shadow-md"
        >
          Go Back
        </button>
      </div>
    );
  }

  const currentImage = rawImages[selectedPhotoIndex] || rawImages[0];

  const resolvedSellerCourse = isMyListing
    ? (user?.course || (typeof window !== 'undefined' ? (localStorage.getItem('user_course') || localStorage.getItem('pending_course')) : '') || sellerObj.sellerCourse || sellerObj.course || '')
    : (sellerStudentInfo?.course || sellerObj.sellerCourse || sellerObj.course || '');

  const resolvedSellerYear = isMyListing
    ? (user?.year || (typeof window !== 'undefined' ? (localStorage.getItem('user_year') || localStorage.getItem('pending_year')) : '') || sellerObj.sellerYear || sellerObj.year || '')
    : (sellerStudentInfo?.year || sellerObj.sellerYear || sellerObj.year || '');

  const resolvedSellerDob = isMyListing
    ? (user?.dob || (typeof window !== 'undefined' ? (localStorage.getItem('user_dob') || localStorage.getItem('pending_dob')) : '') || sellerObj.sellerDob || sellerObj.dob || '')
    : (sellerStudentInfo?.dob || sellerObj.sellerDob || sellerObj.dob || '');

  const resolvedSellerEmail = isMyListing
    ? (user?.email || (typeof window !== 'undefined' ? localStorage.getItem('pending_email') : '') || `${sellerNameNormalized}@campus.edu`)
    : (sellerStudentInfo?.email || sellerObj.email || `${sellerNameNormalized.replace(/\s+/g, '.')}@campus.edu`);

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
        sellerPhone: sellerPhoneNumber,
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
            onTouchStart={handleHeroTouchStart}
            onTouchMove={handleHeroTouchMove}
            onTouchEnd={handleHeroTouchEnd}
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
        ) : productStatus === 'sold' ? (
          <div className="w-full py-3.5 px-4 rounded-2xl bg-slate-100 text-slate-500 font-medium text-xs flex items-center justify-center gap-2 select-none">
            <CheckCircle2 className="w-4 h-4 text-slate-400 shrink-0" />
            <span>This item has been sold</span>
          </div>
        ) : (
          <div className="w-full flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleCallSeller}
              className="flex-1 py-3.5 px-4 rounded-2xl bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs shadow-md shadow-green-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
              title={sellerPhoneNumber ? `Call ${sellerPhoneNumber}` : "Call Seller"}
            >
              <ClickonsCallIcon className="w-4.5 h-4.5 fill-current text-white shrink-0" />
              <span>Call</span>
            </button>
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
              className="flex-1 py-3.5 px-4 rounded-2xl bg-[#1944F1] hover:bg-[#0D30BA] text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <ClickonsChatIcon className="w-4.5 h-4.5 fill-current text-white shrink-0" />
              <span>Chat with Seller</span>
            </button>
          </div>
        )}
      </div>

      {/* Call Seller Modal if no direct number */}
      <AnimatePresence>
        {showCallModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCallModal(false)}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl border border-slate-100"
            >
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
                <Phone className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">Contact {sellerName}</h3>
                <p className="text-xs text-slate-500">
                  {sellerPhoneNumber
                    ? `Phone: +91 ${sellerPhoneNumber}`
                    : `Direct phone number is private or not provided. You can chat directly with ${sellerName} inside Campus Buddy.`}
                </p>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCallModal(false)}
                  className="flex-1 py-3 rounded-2xl bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200 transition-colors"
                >
                  Close
                </button>
                {sellerPhoneNumber ? (
                  <button
                    type="button"
                    onClick={() => {
                      setShowCallModal(false);
                      handleCallSeller();
                    }}
                    className="flex-1 py-3 rounded-2xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <ClickonsCallIcon className="w-4 h-4 fill-current text-white shrink-0" />
                    <span>Call Now</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setShowCallModal(false);
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
                    className="flex-1 py-3 rounded-2xl bg-[#1944F1] text-white font-semibold text-xs hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Chat Now</span>
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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

      {/* FULL-SCREEN IMAGE VIEWER LIGHTBOX WITH ZOOM */}
      <AnimatePresence>
        {isImageViewerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col justify-between items-center p-3 sm:p-6 select-none overscroll-none"
            onClick={() => { if (zoomScale <= 1) setIsImageViewerOpen(false); }}
          >
            {/* Top Bar: Counter, Zoom Controls & Close Button */}
            <div
              className="w-full flex items-center justify-between text-white z-20 max-w-5xl px-2 pt-2"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Photo counter */}
              <div className="flex items-center gap-2">
                {rawImages.length > 1 ? (
                  <div className="bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide border border-white/15 text-white/90 shadow-sm">
                    {selectedPhotoIndex + 1} / {rawImages.length}
                  </div>
                ) : (
                  <div />
                )}
              </div>

              {/* Center/Right Toolbar: Zoom In, Zoom Out, Percentage, Reset, Close */}
              <div className="flex items-center gap-2">
                {/* Zoom Controls Pill */}
                <div className="flex items-center bg-white/10 backdrop-blur-md rounded-full p-1 border border-white/15 shadow-sm">
                  <button
                    type="button"
                    onClick={handleZoomOut}
                    disabled={zoomScale <= 1}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:bg-white/20 active:scale-90 disabled:opacity-30 disabled:pointer-events-none transition-all"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleDoubleClick}
                    className="px-2 py-0.5 text-xs font-bold text-white/90 select-none min-w-[46px] text-center hover:text-white"
                    title="Double-tap or click to toggle 1x / 2.5x"
                  >
                    {Math.round(zoomScale * 100)}%
                  </button>

                  <button
                    type="button"
                    onClick={handleZoomIn}
                    disabled={zoomScale >= 4}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:bg-white/20 active:scale-90 disabled:opacity-30 disabled:pointer-events-none transition-all"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>

                {/* Reset button when zoomed */}
                {zoomScale > 1 && (
                  <button
                    type="button"
                    onClick={resetZoom}
                    className="h-9 px-3 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 border border-white/20 flex items-center justify-center text-white text-xs font-semibold transition-all shadow-lg gap-1"
                    title="Reset to 100%"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">1x</span>
                  </button>
                )}

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setIsImageViewerOpen(false)}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 border border-white/20 flex items-center justify-center text-white transition-all shadow-lg"
                  title="Close viewer (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Center Image Container with Native Zoom, Drag Pan & Swipe */}
            <div
              ref={viewerContainerRef}
              className="relative flex-1 w-full flex items-center justify-center p-2 my-auto max-w-5xl overflow-hidden select-none"
              style={{ touchAction: 'none' }}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {/* Previous Button (if multiple images and not zoomed) */}
              {rawImages.length > 1 && zoomScale <= 1 && (
                <button
                  type="button"
                  onClick={() => setSelectedPhotoIndex(prev => (prev > 0 ? prev - 1 : rawImages.length - 1))}
                  className="absolute left-2 sm:left-4 z-20 w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 active:scale-95 hover:-translate-x-1 active:-translate-x-1.5 border border-white/20 text-white flex items-center justify-center backdrop-blur-md transition-all shadow-lg group"
                  title="Previous image (Left Arrow)"
                >
                  <ChevronLeft className="w-6 h-6 transition-transform group-hover:-translate-x-0.5 group-active:-translate-x-1" />
                </button>
              )}

              {/* Full Image with Zoom & Pan */}
              <motion.div
                key={selectedPhotoIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center w-full h-full pointer-events-none"
              >
                <img
                  ref={viewerImgRef}
                  src={currentImage}
                  alt={safeProduct?.title || product?.title || 'Listing Image'}
                  onDoubleClick={handleDoubleClick}
                  className="max-h-[75vh] sm:max-h-[82vh] max-w-full object-contain rounded-2xl shadow-2xl pointer-events-auto"
                  style={{
                    transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomScale})`,
                    transformOrigin: 'center center',
                    cursor: zoomScale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
                    transition: isDragging ? 'none' : 'transform 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                    willChange: 'transform',
                    touchAction: 'none',
                    userSelect: 'none',
                    WebkitUserDrag: 'none',
                  }}
                  draggable={false}
                />
              </motion.div>

              {/* Next Button (if multiple images and not zoomed) */}
              {rawImages.length > 1 && zoomScale <= 1 && (
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

            {/* Zoom Hint */}
            {zoomScale <= 1 && (
              <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[10px] font-medium text-white/70 border border-white/10 pointer-events-none whitespace-nowrap">
                Pinch or scroll to zoom · Double-tap to zoom · Buttons (+/-)
              </div>
            )}

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
