import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { apiGetMe, apiLogout, getStoredUser, getAuthToken, fetchMyAds, fetchNotifications, fetchConversations, resolveAllUserAds, getStoredFavorites, saveStoredFavorites, API_BASE_URL } from './lib/api';
import { initSocketClient, disconnectSocket, subscribeToNewNotifications, subscribeToUnreadCount, subscribeToChatMessages, subscribeToMessagesRead } from './lib/socket';
import SplashScreen from './components/SplashScreen';
import WelcomeScreen from './components/WelcomeScreen';
import LoginScreen from './components/LoginScreen';
import SignupScreen from './components/SignupScreen';
import HomeScreen from './components/HomeScreen';
import ChatScreen from './components/ChatScreen';
import SellScreen from './components/SellScreen';
import MyAdsScreen from './components/MyAdsScreen';
import ProfileScreen from './components/ProfileScreen';
import WishlistScreen from './components/WishlistScreen';
import NotificationsScreen from './components/NotificationsScreen';
import ProductDetailsScreen from './components/ProductDetailsScreen';
import SellerInfoScreen from './components/SellerInfoScreen';
import FilterSortScreen from './components/FilterSortScreen';
import UniversityOnboarding from './components/UniversityOnboarding';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState(() => {
    const user = getStoredUser();
    const token = getAuthToken();
    return (user && token) ? 'main' : 'welcome';
  });
  const [activeNav, setActiveNav] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [navStack, setNavStack] = useState(() => [
    { nav: 'home', product: null, seller: null }
  ]);
  const chatBackHandlerRef = useRef(null);

  // Global Filter & Sort State for Marketplace listings
  const [filterState, setFilterState] = useState({
    sort: 'recommended',
    minPrice: '',
    maxPrice: '',
    condition: 'all',
    category: 'all'
  });

  // Traditional JWT Auth state (MongoDB Atlas)
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());
  const [authLoading, setAuthLoading] = useState(true);

  const [favorites, setFavorites] = useState(() => {
    return getStoredFavorites(getStoredUser());
  });

  // When currentUser changes (login, logout, account switch), re-scope favorites strictly to that user
  useEffect(() => {
    const user = currentUser || getStoredUser();
    if (user && (user._id || user.id)) {
      setFavorites(getStoredFavorites(user));
    } else {
      setFavorites([]);
    }
  }, [currentUser?._id, currentUser?.id]);

  // Persist favorites strictly under the active user's key
  useEffect(() => {
    const user = currentUser || getStoredUser();
    if (user && (user._id || user.id)) {
      saveStoredFavorites(favorites, user);
    }
  }, [favorites, currentUser?._id, currentUser?.id]);
  const [showExitToast, setShowExitToast] = useState(false);
  const lastBackPressRef = useRef(0);
  const exitToastTimerRef = useRef(null);

  const currentScreenRef = useRef(currentScreen);
  const activeNavRef = useRef(activeNav);
  const selectedProductRef = useRef(selectedProduct);
  const selectedSellerRef = useRef(selectedSeller);

  currentScreenRef.current = currentScreen;
  activeNavRef.current = activeNav;
  selectedProductRef.current = selectedProduct;
  selectedSellerRef.current = selectedSeller;
  const [notifications, setNotifications] = useState([]);
  const [activeNotificationToast, setActiveNotificationToast] = useState(null);
  const [userAds, setUserAds] = useState(() => {
    try {
      return resolveAllUserAds(getStoredUser());
    } catch {
      return [];
    }
  });
  const [activeChatTarget, setActiveChatTarget] = useState(null);
  const [isChatThreadOpen, setIsChatThreadOpen] = useState(false);
  const [unreadChatsCount, setUnreadChatsCount] = useState(0);

  const refreshUnreadChats = async () => {
    const token = getAuthToken();
    const user = currentUser || getStoredUser();
    if (!token || !user) {
      setUnreadChatsCount(0);
      return;
    }
    try {
      const convs = await fetchConversations();
      if (Array.isArray(convs)) {
        const myId = String(user._id || user.id || '');
        const unreadPeople = new Set();
        convs.forEach(c => {
          const hasUnread = (c.unreadCount && c.unreadCount > 0) || 
            (Array.isArray(c.messages) && c.messages.some(m => String(m.sender?._id || m.sender) !== myId && !m.read));
          if (hasUnread) {
            const otherP = (c.participants || []).find(p => String(p._id || p.id || p) !== myId);
            const otherId = otherP ? String(otherP._id || otherP.id || otherP) : (c._id || c.id);
            if (otherId) unreadPeople.add(otherId);
          }
        });
        setUnreadChatsCount(unreadPeople.size);
      }
    } catch {
      // Keep existing count on transient error
    }
  };

  const [showSplash, setShowSplash] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(15);
  const [loadingStatusText, setLoadingStatusText] = useState('Starting Campus Buddy...');
  const [homeDataReady, setHomeDataReady] = useState(false);

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      StatusBar.setStyle({ style: Style.Light }).catch(() => {});
      StatusBar.setBackgroundColor({ color: '#FFFFFF' }).catch(() => {});
    }
  }, []);

  // Drive progress bar smoothly during app boot
  useEffect(() => {
    let isMounted = true;

    // Smoothly tick progress upwards while waiting for network requests
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev < 35) return prev + 4;
        if (prev < 65) return prev + 2.5;
        if (prev < 88) return prev + 1;
        return prev;
      });
    }, 100);

    const initAuth = async () => {
      setLoadingStatusText('Connecting to Campus Buddy...');
      const token = getAuthToken();
      if (token) {
        try {
          setLoadingStatusText('Verifying session...');
          const user = await apiGetMe();
          if (isMounted) {
            if (user) {
              setCurrentUser(user);
              setCurrentScreen('main');
              setLoadingStatusText('Loading campus marketplace...');
              setLoadingProgress(prev => Math.max(prev, 60));
              fetchMyAds().then(ads => {
                if (isMounted) setUserAds(Array.isArray(ads) ? ads : []);
              }).catch(() => {});
            } else {
              setCurrentUser(null);
              setUserAds([]);
              setCurrentScreen('welcome');
              setHomeDataReady(true);
            }
          }
        } catch {
          if (isMounted) {
            setCurrentUser(null);
            setUserAds([]);
            setCurrentScreen('welcome');
            setHomeDataReady(true);
          }
        }
      } else {
        if (isMounted) {
          setCurrentUser(null);
          setUserAds([]);
          setCurrentScreen('welcome');
          setHomeDataReady(true);
        }
      }
    };

    initAuth();

    // Safety timeout: ensure loading screen gracefully resolves even with poor connection
    const safetyTimer = setTimeout(() => {
      if (isMounted) {
        setHomeDataReady(true);
      }
    }, 3800);

    return () => { 
      isMounted = false;
      clearInterval(progressInterval);
      clearTimeout(safetyTimer);
    };
  }, []);

  // When home data and authentication are completely ready, transition loading bar to 100% and hide splash
  useEffect(() => {
    if (!homeDataReady) return;

    setLoadingProgress(100);
    setLoadingStatusText('Ready!');

    const hideTimer = setTimeout(() => {
      setShowSplash(false);
      setAuthLoading(false);
    }, 450);

    return () => clearTimeout(hideTimer);
  }, [homeDataReady]);

  // Keep-alive heartbeat: Pings backend /api/health every 9 minutes while app is open to prevent cloud host sleep
  useEffect(() => {
    const pingBackend = () => {
      fetch(`${API_BASE_URL}/health`, {
        headers: { 'x-client-heartbeat': 'true' }
      }).catch(() => {});
    };

    // Ping every 9 minutes (540,000 ms)
    const heartbeatTimer = setInterval(pingBackend, 9 * 60 * 1000);
    return () => clearInterval(heartbeatTimer);
  }, []);

  // Real-Time WebSockets & Notifications Listener
  useEffect(() => {
    const token = getAuthToken();
    if (!currentUser || !token) {
      disconnectSocket();
      return;
    }

    // 1. Initialize real-time Socket.io with user's JWT
    initSocketClient(token);

    // 2. Load existing notifications and chats from MongoDB
    fetchNotifications().then(res => {
      if (res && Array.isArray(res.notifications)) {
        setNotifications(res.notifications);
      }
    }).catch(() => {});
    refreshUnreadChats();

    // 3. Listen for live incoming notifications
    const unsubNotif = subscribeToNewNotifications((newNotif) => {
      if (!newNotif) return;
      setNotifications(prev => [
        newNotif, 
        ...prev.filter(n => (n._id || n.id) !== (newNotif._id || newNotif.id))
      ]);

      // Pop floating in-app notification banner toast
      setActiveNotificationToast(newNotif);
      setTimeout(() => {
        setActiveNotificationToast(prev => ((prev?._id || prev?.id) === (newNotif._id || newNotif.id) ? null : prev));
      }, 5000);
    });

    // 4. Listen for live unread badge updates
    const unsubCount = subscribeToUnreadCount(({ unreadCount }) => {
      // Unread count synced via socket
    });

    // 5. Listen for live incoming chat messages to refresh unread chats count
    const unsubChat = subscribeToChatMessages((payload) => {
      const myId = String(currentUser?._id || currentUser?.id || '');
      const senderId = String(payload?.message?.sender?._id || payload?.message?.sender || '');
      if (senderId && senderId !== myId) {
        refreshUnreadChats();
      }
    });

    // 6. Listen for read events to clear/update badge count
    const unsubRead = subscribeToMessagesRead(() => {
      refreshUnreadChats();
    });

    return () => {
      unsubNotif();
      unsubCount();
      unsubChat();
      unsubRead();
    };
  }, [currentUser]);

  const navigateTo = (nav, options = {}) => {
    const { product = null, seller = null, replace = false } = options;

    if (nav !== 'chats') {
      setIsChatThreadOpen(false);
    }

    setNavStack(prev => {
      const current = prev[prev.length - 1];
      if (
        current &&
        current.nav === nav &&
        (current.product?._id || current.product?.id) === (product?._id || product?.id) &&
        (current.seller?._id || current.seller?.id) === (seller?._id || seller?.id)
      ) {
        return prev;
      }

      const newEntry = { nav, product, seller };
      if (replace) {
        const next = [...prev];
        next[next.length - 1] = newEntry;
        return next;
      }
      return [...prev, newEntry];
    });

    setActiveNav(nav);
    setSelectedProduct(product);
    setSelectedSeller(seller);
  };

  const handleGoBack = () => {
    // 1. If inside ChatScreen and a conversation thread is open, close thread first
    if (activeNav === 'chats' && chatBackHandlerRef.current && chatBackHandlerRef.current()) {
      return;
    }

    setNavStack(prev => {
      if (prev.length <= 1) {
        if (activeNav !== 'home') {
          setActiveNav('home');
          setSelectedProduct(null);
          setSelectedSeller(null);
          return [{ nav: 'home', product: null, seller: null }];
        }
        return prev;
      }

      const nextStack = prev.slice(0, -1);
      const prevEntry = nextStack[nextStack.length - 1];

      setActiveNav(prevEntry.nav);
      setSelectedProduct(prevEntry.product || null);
      setSelectedSeller(prevEntry.seller || null);

      return nextStack;
    });
  };

  const handleUniversalBack = () => {
    const screen = currentScreenRef.current;
    const nav = activeNavRef.current;
    const hasOpenProduct = Boolean(selectedProductRef.current);
    const hasOpenSeller = Boolean(selectedSellerRef.current);

    if (screen === 'main') {
      const isAtHome = (nav === 'home' && !hasOpenProduct && !hasOpenSeller);

      if (!isAtHome) {
        // "AND IF A USER IS IN ANY OTHER SCREEN IT 1ST BRINGS HIM BACK TO HOME SCREEN THEN EXITS THE APP"
        setActiveNav('home');
        setSelectedProduct(null);
        setSelectedSeller(null);
        setNavStack([{ nav: 'home', product: null, seller: null }]);
        lastBackPressRef.current = 0;
        setShowExitToast(false);
        if (exitToastTimerRef.current) clearTimeout(exitToastTimerRef.current);
        return;
      }

      // "WHENVER A USER IS IN THE HOME SCREEN HE HAS TO SWIPE TWICE OR CLICK THE APP CLOSING BUTTON TWICE THE PHONE NAVIGATION BUTTON IN ORDER TO EXIT THE APP"
      const now = Date.now();
      if (now - lastBackPressRef.current < 2000) {
        if (Capacitor.isNativePlatform()) {
          CapApp.exitApp();
        } else {
          setShowExitToast(false);
          try { window.close(); } catch {}
        }
      } else {
        lastBackPressRef.current = now;
        setShowExitToast(true);
        if (exitToastTimerRef.current) clearTimeout(exitToastTimerRef.current);
        exitToastTimerRef.current = setTimeout(() => {
          setShowExitToast(false);
          lastBackPressRef.current = 0;
        }, 2000);
      }
    } else if (screen === 'login' || screen === 'signup') {
      setCurrentScreen('welcome');
      lastBackPressRef.current = 0;
      setShowExitToast(false);
      if (exitToastTimerRef.current) clearTimeout(exitToastTimerRef.current);
    } else if (screen === 'welcome') {
      const now = Date.now();
      if (now - lastBackPressRef.current < 2000) {
        if (Capacitor.isNativePlatform()) {
          CapApp.exitApp();
        } else {
          try { window.close(); } catch {}
        }
      } else {
        lastBackPressRef.current = now;
        setShowExitToast(true);
        if (exitToastTimerRef.current) clearTimeout(exitToastTimerRef.current);
        exitToastTimerRef.current = setTimeout(() => {
          setShowExitToast(false);
          lastBackPressRef.current = 0;
        }, 2000);
      }
    }
  };

  const handleUniversalBackRef = useRef(handleUniversalBack);
  handleUniversalBackRef.current = handleUniversalBack;

  // Persistent Phone Navigation Button & Swipe Gesture Listener
  useEffect(() => {
    // 1. Native Capacitor backButton (Android navigation button & system gesture navigation)
    let nativeHandle = null;
    if (Capacitor.isNativePlatform()) {
      CapApp.addListener('backButton', () => {
        if (handleUniversalBackRef.current) {
          handleUniversalBackRef.current();
        }
      }).then(handle => {
        nativeHandle = handle;
      }).catch(() => {});
    }

    // 2. Popstate Trap for mobile browsers / WebViews
    const handlePopState = () => {
      if (handleUniversalBackRef.current) {
        handleUniversalBackRef.current();
      }
      try {
        window.history.pushState({ page: 'campus_buddy' }, '');
      } catch {}
    };
    try {
      window.history.pushState({ page: 'campus_buddy' }, '');
      window.addEventListener('popstate', handlePopState);
    } catch {}

    // 3. Touch Edge-Swipe Gesture Listener (Swiping from left or right edge inwards)
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;

    const handleTouchStart = (e) => {
      if (!e.touches || e.touches.length !== 1) return;
      const touch = e.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      touchStartTime = Date.now();
    };

    const handleTouchEnd = (e) => {
      if (!e.changedTouches || e.changedTouches.length !== 1) return;
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;
      const deltaTime = Date.now() - touchStartTime;

      if (deltaTime > 400 || Math.abs(deltaY) > 60) return;

      const windowWidth = window.innerWidth;
      const isLeftEdgeSwipe = touchStartX <= 40 && deltaX > 65;
      const isRightEdgeSwipe = touchStartX >= windowWidth - 40 && deltaX < -65;

      if (isLeftEdgeSwipe || isRightEdgeSwipe) {
        if (handleUniversalBackRef.current) {
          handleUniversalBackRef.current();
        }
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      if (nativeHandle && typeof nativeHandle.remove === 'function') {
        nativeHandle.remove();
      }
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  const primaryColor = '#1944F1';
  const inactiveColor = '#94A3B8';

  const handleLogout = () => {
    disconnectSocket();
    apiLogout();
    setCurrentUser(null);
    setUserAds([]);
    setNotifications([]);
    setFavorites([]);
    setUnreadChatsCount(0);
    setNavStack([{ nav: 'home', product: null, seller: null }]);
    setActiveNav('home');
    setSelectedProduct(null);
    setSelectedSeller(null);
    try {
      localStorage.removeItem('campus_favorites');
    } catch {}
    setCurrentScreen('welcome');
  };

  const handleLoginSuccess = (user) => {
    // Clear legacy product/ad caches on account switch so products from previous college never bleed through
    try {
      localStorage.removeItem('campus_favorites');
      localStorage.removeItem('campus_products_cache');
      localStorage.removeItem('campus_user_ads');
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('campus_products_cache')) localStorage.removeItem(key);
      });
    } catch {}
    setCurrentUser(user);
    setUserAds([]); // Clear previous user's ads immediately
    setFavorites(getStoredFavorites(user)); // Load strictly this user's wishlist
    setNavStack([{ nav: 'home', product: null, seller: null }]);
    setActiveNav('home'); // Always redirect directly to Home marketplace upon login
    setSelectedProduct(null);
    setSelectedSeller(null);
    setCurrentScreen('main');
    initSocketClient(getAuthToken());
    fetchNotifications().then(res => {
      if (res && Array.isArray(res.notifications)) setNotifications(res.notifications);
    }).catch(() => {});
    refreshUnreadChats();
    fetchMyAds().then(ads => {
      setUserAds(Array.isArray(ads) ? ads : []);
    }).catch(() => {});
  };

  // Build a user object for screens that display profile info
  const customAvatar = localStorage.getItem('user_custom_avatar');
  const customFullName = localStorage.getItem('user_custom_fullname');
  const isVerifiedLocal = localStorage.getItem('user_id_verified') === 'true';

  const userForScreens = currentUser ? {
    ...currentUser,
    name: customFullName || currentUser.fullName || currentUser.name || 'Student',
    fullName: customFullName || currentUser.fullName || currentUser.name,
    dob: currentUser.dob || localStorage.getItem('user_dob') || '',
    course: currentUser.course || localStorage.getItem('user_course') || '',
    year: currentUser.year || localStorage.getItem('user_year') || '1st Year',
    email: currentUser.email,
    avatar: customAvatar || currentUser.avatar || '/avatar-blue-2.svg',
    hasImage: true,
    universityName: currentUser.universityName || localStorage.getItem('pending_uni') || 'Campus Member',
    isVerified: Boolean(currentUser.isVerified ?? isVerifiedLocal),
    studentIdUrl: currentUser.studentIdUrl || localStorage.getItem('user_student_id_url') || '',
  } : null;

  // Handle navigating to the separate Product Details Screen
  const handleSelectProduct = (product) => {
    navigateTo('product-details', { product });
  };

  const handleSetActiveNav = (tab) => {
    if (tab === activeNav) return;
    navigateTo(tab);
  };

  // Detect when mobile keyboard is open or any input/textarea is focused to prevent navigation panel from popping up
  const [isInputActive, setIsInputActive] = useState(false);

  useEffect(() => {
    const handleFocusIn = (e) => {
      const tag = e.target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || e.target?.isContentEditable) {
        setIsInputActive(true);
      }
    };

    const handleFocusOut = (e) => {
      const tag = e.target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || e.target?.isContentEditable) {
        setTimeout(() => {
          const activeTag = document.activeElement?.tagName?.toLowerCase();
          if (activeTag !== 'input' && activeTag !== 'textarea' && !document.activeElement?.isContentEditable) {
            setIsInputActive(false);
          }
        }, 80);
      }
    };

    window.addEventListener('focusin', handleFocusIn);
    window.addEventListener('focusout', handleFocusOut);

    const handleViewportResize = () => {
      if (window.visualViewport) {
        const isKeyboardUp = (window.innerHeight - window.visualViewport.height) > 120;
        if (isKeyboardUp) {
          setIsInputActive(true);
        } else {
          const activeTag = document.activeElement?.tagName?.toLowerCase();
          if (activeTag !== 'input' && activeTag !== 'textarea' && !document.activeElement?.isContentEditable) {
            setIsInputActive(false);
          }
        }
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportResize);
    }

    return () => {
      window.removeEventListener('focusin', handleFocusIn);
      window.removeEventListener('focusout', handleFocusOut);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportResize);
      }
    };
  }, []);

  // Hide navigation panel when in active chatting window or when typing in chats screen
  const isInsideChatThread = activeNav === 'chats' && (isChatThreadOpen || Boolean(activeChatTarget));
  const isTypingInChats = activeNav === 'chats' && isInputActive;
  const showBottomNav = !authLoading && !showSplash && currentScreen === 'main' && ['home', 'chats', 'sell', 'myads', 'profile'].includes(activeNav) && !isInsideChatThread && !isTypingInChats;

  return (
    <div className="w-full h-full min-h-screen bg-white text-slate-900 font-sans overflow-hidden select-none relative flex flex-col justify-between">
      
      {/* 1. AUTH / MAIN SCREEN CONTENT WRAPPER */}
      <div className="flex-1 overflow-hidden relative w-full h-full">
        <AnimatePresence>
          {(authLoading || showSplash) && (
            <motion.div 
              key="splash-screen"
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
              className="w-full h-full min-h-screen bg-[#1944F1] flex flex-col items-center justify-center text-white z-[999] fixed inset-0 pointer-events-none"
            >
              {/* Logo: Zooms down into position with smooth fade-in */}
              <motion.div 
                initial={{ opacity: 0, scale: 2.2 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="w-28 h-28 mb-4 drop-shadow-2xl flex items-center justify-center"
              >
                <img 
                  src="/ic_launcher_foreground.svg" 
                  alt="Campus Buddy Logo" 
                  className="w-full h-full object-contain filter drop-shadow-lg"
                />
              </motion.div>

              {/* Title Text: Character-level Staggered Fade-in */}
              <motion.div className="flex items-center gap-1 overflow-hidden">
                {"Campus Buddy".split("").map((char, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{
                      delay: 0.2 + index * 0.03,
                      duration: 0.4,
                      ease: "easeOut"
                    }}
                    className="text-2xl font-bold tracking-tight font-sans text-white inline-block"
                  >
                    {char === " " ? "\u00A0" : char}
                  </motion.span>
                ))}
              </motion.div>

              {/* Subtitle: Smooth Fade & Rise */}
              <motion.p 
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5, ease: 'easeOut' }}
                className="text-xs text-blue-100/90 mt-1 font-medium tracking-wide"
              >
                Connecting Students Safely
              </motion.p>

              {/* Bottom Loading Progress Bar */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.5 }}
                className="absolute bottom-12 left-0 right-0 px-8 flex flex-col items-center max-w-xs mx-auto z-20"
              >
                {/* Progress bar track */}
                <div className="w-full h-1.5 bg-blue-950/40 rounded-full overflow-hidden p-[1px] shadow-inner backdrop-blur-xs border border-white/15">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-blue-300 via-white to-blue-100 rounded-full shadow-[0_0_12px_rgba(255,255,255,0.85)]"
                    style={{ width: `${Math.min(100, Math.max(5, loadingProgress))}%` }}
                    transition={{ ease: "easeOut", duration: 0.25 }}
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {!authLoading && currentScreen === 'welcome' && (
            <WelcomeScreen key="welcome" onNavigate={(screen) => setCurrentScreen(screen)} />
          )}
          {!authLoading && currentScreen === 'login' && (
            <LoginScreen 
              key="login"
              onNavigate={(screen) => setCurrentScreen(screen)} 
              onLoginSuccess={handleLoginSuccess}
            />
          )}
          {!authLoading && currentScreen === 'signup' && (
            <SignupScreen 
              key="signup"
              onNavigate={(screen) => setCurrentScreen(screen)} 
              onLoginSuccess={handleLoginSuccess}
            />
          )}
        </AnimatePresence>

        {currentScreen === 'main' && (
          <AnimatePresence mode="wait">
            {activeNav === 'home' && (
              <HomeScreen 
                key="home" 
                user={userForScreens} 
                activeNav={activeNav}
                setActiveNav={handleSetActiveNav}
                favorites={favorites}
                setFavorites={setFavorites}
                notifications={notifications}
                userAds={userAds}
                onSelectProduct={handleSelectProduct}
                onOpenChat={(target) => {
                  setActiveChatTarget(target);
                  navigateTo('chats', { product: selectedProduct });
                }}
                onNavigate={(screen) => setCurrentScreen(screen)} 
                onInitialLoadComplete={() => setHomeDataReady(true)}
                onOpenFilterSort={() => navigateTo('filter-sort')}
                filterState={filterState}
                setFilterState={setFilterState}
              />
            )}
            {activeNav === 'filter-sort' && (
              <FilterSortScreen
                key="filter-sort"
                filterState={filterState}
                onApplyFilters={(newFilters) => {
                  setFilterState(newFilters);
                  handleGoBack();
                }}
                onResetFilters={() => {
                  setFilterState({
                    sort: 'recommended',
                    minPrice: '',
                    maxPrice: '',
                    condition: 'all',
                    category: 'all'
                  });
                }}
                onNavigateBack={handleGoBack}
              />
            )}
            {activeNav === 'product-details' && selectedProduct && (
              <ProductDetailsScreen
                key="product-details"
                product={selectedProduct}
                user={userForScreens}
                favorites={favorites}
                setFavorites={setFavorites}
                userAds={userAds}
                setUserAds={setUserAds}
                onNavigateBack={handleGoBack}
                onViewSellerInfo={(sellerData) => {
                  navigateTo('seller-info', { product: selectedProduct, seller: sellerData });
                  window.scrollTo(0, 0);
                }}
                onOpenChat={(target) => {
                  setActiveChatTarget(target);
                  navigateTo('chats', { product: selectedProduct });
                }}
                onManageMyAds={() => {
                  navigateTo('myads');
                }}
              />
            )}
            {activeNav === 'seller-info' && (
              <SellerInfoScreen
                key="seller-info"
                seller={selectedSeller}
                product={selectedProduct}
                user={userForScreens}
                userAds={userAds}
                onNavigateBack={handleGoBack}
                onOpenChat={(target) => {
                  setActiveChatTarget(target);
                  navigateTo('chats', { product: selectedProduct });
                }}
              />
            )}
            {activeNav === 'chats' && (
              <ChatScreen 
                key="chats"
                user={userForScreens}
                activeNav={activeNav} 
                setActiveNav={handleSetActiveNav} 
                favorites={favorites}
                setFavorites={setFavorites}
                notifications={notifications}
                setNotifications={setNotifications}
                activeChatTarget={activeChatTarget}
                setActiveChatTarget={setActiveChatTarget}
                onRefreshUnreadChats={refreshUnreadChats}
                onNavigateBack={handleGoBack}
                onRegisterBackHandler={(fn) => { chatBackHandlerRef.current = fn; }}
                onChatThreadStateChange={setIsChatThreadOpen}
                isInputActive={isInputActive}
              />
            )}
            {activeNav === 'sell' && (
              <SellScreen 
                key="sell"
                user={userForScreens}
                activeNav={activeNav} 
                setActiveNav={handleSetActiveNav} 
                favorites={favorites}
                setFavorites={setFavorites}
                notifications={notifications}
                userAds={userAds}
                setUserAds={setUserAds}
                onAdCreated={(newAd) => {
                  setUserAds(prev => [newAd, ...prev.filter(a => (a._id || a.id) !== (newAd._id || newAd.id))]);
                  navigateTo('myads');
                }}
                onNavigateBack={handleGoBack} 
              />
            )}
            {activeNav === 'myads' && (
              <MyAdsScreen 
                key="myads"
                user={userForScreens}
                activeNav={activeNav} 
                setActiveNav={handleSetActiveNav} 
                favorites={favorites}
                setFavorites={setFavorites}
                notifications={notifications}
                userAds={userAds}
                setUserAds={setUserAds}
                onSelectProduct={handleSelectProduct}
                onNavigateBack={handleGoBack} 
              />
            )}
            {activeNav === 'profile' && (
              <ProfileScreen 
                key="profile"
                user={userForScreens}
                activeNav={activeNav} 
                setActiveNav={handleSetActiveNav} 
                favorites={favorites}
                setFavorites={setFavorites}
                notifications={notifications}
                userAds={userAds}
                onUpdateUser={(updated) => {
                  setCurrentUser(prev => ({ ...prev, ...updated }));
                  if (updated.phone) {
                    setUserAds(prev => (prev || []).map(ad => ({
                      ...ad,
                      phone: updated.phone,
                      contactNumber: updated.phone,
                      seller: typeof ad.seller === 'object' ? { ...ad.seller, phone: updated.phone } : ad.seller
                    })));
                  }
                }}
                onNavigateBack={handleGoBack} 
                onLogout={handleLogout}
              />
            )}
            {activeNav === 'wishlist' && (
              <WishlistScreen 
                key="wishlist"
                user={userForScreens}
                activeNav={activeNav}
                setActiveNav={handleSetActiveNav}
                favorites={favorites}
                setFavorites={setFavorites}
                notifications={notifications}
                userAds={userAds}
                onSelectProduct={handleSelectProduct}
                onOpenChat={(target) => {
                  setActiveChatTarget(target);
                  navigateTo('chats', { product: selectedProduct });
                }}
                onNavigateBack={handleGoBack}
              />
            )}
            {activeNav === 'notifications' && (
              <NotificationsScreen
                key="notifications"
                user={userForScreens}
                activeNav={activeNav}
                setActiveNav={handleSetActiveNav}
                favorites={favorites}
                setFavorites={setFavorites}
                notifications={notifications}
                setNotifications={setNotifications}
                onSelectProduct={handleSelectProduct}
                onOpenChat={(target) => {
                  setActiveChatTarget(target);
                  navigateTo('chats', { product: selectedProduct });
                }}
                onNavigateBack={handleGoBack}
              />
            )}
          </AnimatePresence>
        )}
      </div>

      {/* 2. PERMANENT STIFF ROOT BOTTOM DOCK - PURE WHITE SOLID, NEVER MOVES OR FADES ON SCREEN SWITCH */}
      {showBottomNav && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-2.5 flex items-center justify-between z-50 shadow-lg opacity-100 shrink-0">
          
          {/* 1. Home Tab */}
          <button
            onClick={() => navigateTo('home')}
            className="flex flex-col items-center justify-center gap-1 py-0.5 px-2 transition-all active:scale-90 min-w-[56px]"
          >
            <svg width="25" height="25" viewBox="0 0 24 24" className="transition-all duration-200">
              <path 
                d="M2 12.2039C2 9.91549 2 8.77128 2.5192 7.82274C3.0384 6.87421 3.98695 6.28551 5.88403 5.10813L7.88403 3.86687C9.88939 2.62229 10.8921 2 12 2C13.1079 2 14.1106 2.62229 16.116 3.86687L18.116 5.10812C20.0131 6.28551 20.9616 6.87421 21.4808 7.82274C22 8.77128 22 9.91549 22 12.2039V13.725C22 17.6258 22 19.5763 20.8284 20.7881C19.6569 22 17.7712 22 14 22H10C6.22876 22 4.34315 22 3.17157 20.7881C2 19.5763 2 17.6258 2 13.725V12.2039Z" 
                fill={activeNav === 'home' ? primaryColor : 'none'} 
                stroke={activeNav === 'home' ? primaryColor : inactiveColor} 
                strokeWidth="1.6" 
                className="transition-colors duration-200"
              />
              <path 
                d="M15 18H9" 
                stroke={activeNav === 'home' ? '#FFFFFF' : inactiveColor} 
                strokeWidth="1.6" 
                strokeLinecap="round" 
              />
            </svg>
            <span className={`text-xs transition-colors duration-200 ${
              activeNav === 'home' ? 'text-[#1944F1] font-bold' : 'text-slate-400 font-medium'
            }`}>
              Home
            </span>
          </button>

          {/* 2. Chats Tab */}
          <button
            onClick={() => {
              navigateTo('chats');
              refreshUnreadChats();
            }}
            className="flex flex-col items-center justify-center gap-1 py-0.5 px-2 transition-all active:scale-90 min-w-[56px]"
          >
            <div className="relative flex items-center justify-center">
              <svg width="25" height="25" viewBox="0 0 24 24" className="transition-all duration-200">
                <path 
                  fillRule="evenodd" 
                  clipRule="evenodd" 
                  d="M12 2.75C6.89137 2.75 2.75 6.89137 2.75 12C2.75 13.4811 3.09753 14.8788 3.7148 16.1181C3.96254 16.6155 4.05794 17.2103 3.90163 17.7945L3.30602 20.0205C3.19663 20.4293 3.57066 20.8034 3.97949 20.694L6.20553 20.0984C6.78973 19.9421 7.38451 20.0375 7.88191 20.2852C9.12121 20.9025 10.5189 21.25 12 21.25C17.1086 21.25 21.25 17.1086 21.25 12C21.25 6.89137 17.1086 2.75 12 2.75Z" 
                  fill={activeNav === 'chats' ? primaryColor : 'none'} 
                  stroke={activeNav === 'chats' ? primaryColor : inactiveColor} 
                  strokeWidth="1.5" 
                  className="transition-colors duration-200"
                />
                <path d="M8 10.5H16" stroke={activeNav === 'chats' ? '#FFFFFF' : inactiveColor} strokeWidth="1.6" strokeLinecap="round" />
                <path d="M8 14H13.5" stroke={activeNav === 'chats' ? '#FFFFFF' : inactiveColor} strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              {unreadChatsCount > 0 && (
                <span className="absolute -top-1.5 -right-2.5 w-4.5 h-4.5 min-w-[18px] min-h-[18px] max-w-[18px] max-h-[18px] rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-xs pointer-events-none">
                  {unreadChatsCount > 9 ? '9+' : unreadChatsCount}
                </span>
              )}
            </div>
            <span className={`text-xs transition-colors duration-200 ${
              activeNav === 'chats' ? 'text-[#1944F1] font-bold' : 'text-slate-400 font-medium'
            }`}>
              Chats
            </span>
          </button>

          {/* 3. Sell Tab (Center Action Button) - Ring only appears when clicked / on Sell page */}
          <div className="-mt-10 flex flex-col items-center justify-center px-1">
            <button
              onClick={() => navigateTo('sell')}
              className="relative flex items-center justify-center transition-transform active:scale-95 group cursor-pointer focus:outline-none"
              title="Sell an item"
            >
              {/* Outer Translucent Ring / Gradient Halo - Only visible when clicked or on the Sell page */}
              <div 
                className={`w-[74px] h-[74px] rounded-full flex items-center justify-center transition-all duration-300 ${
                  activeNav === 'sell' ? 'scale-105' : 'hover:scale-105'
                }`}
                style={{
                  background: activeNav === 'sell' 
                    ? 'radial-gradient(circle, rgba(25, 68, 241, 0.36) 48%, rgba(25, 68, 241, 0.16) 72%, rgba(25, 68, 241, 0) 100%)' 
                    : 'transparent',
                  boxShadow: activeNav === 'sell' ? '0 0 16px 2px rgba(25, 68, 241, 0.35)' : 'none',
                }}
              >
                {/* Inner Solid Circular Button (App Brand Blue) - shadow only when on sell screen */}
                <div 
                  className={`w-[56px] h-[56px] rounded-full flex items-center justify-center transition-all duration-200 ${
                    activeNav === 'sell' ? 'shadow-lg shadow-[#1944F1]/40' : 'shadow-none'
                  }`}
                  style={{
                    backgroundColor: '#1944F1',
                  }}
                >
                  {/* Clean sleek rounded plus logo matching user reference with app color */}
                  <svg 
                    width="34" 
                    height="34" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    className="text-white"
                  >
                    <line x1="12" y1="5.5" x2="12" y2="18.5" stroke="#FFFFFF" strokeWidth="2.35" strokeLinecap="round" />
                    <line x1="5.5" y1="12" x2="18.5" y2="12" stroke="#FFFFFF" strokeWidth="2.35" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
            </button>
            <span className={`text-xs block text-center mt-0.5 transition-colors duration-200 ${
              activeNav === 'sell' ? 'text-[#1944F1] font-bold' : 'text-slate-500 font-semibold'
            }`}>
              Sell
            </span>
          </div>

          {/* 4. My Ads Tab */}
          <button
            onClick={() => navigateTo('myads')}
            className="flex flex-col items-center justify-center gap-1 py-0.5 px-2 transition-all active:scale-90 min-w-[56px]"
          >
            <svg width="25" height="25" viewBox="0 0 24 24" fill="none" className="transition-all duration-200">
              {activeNav === 'myads' ? (
                // Clickons/Open_solid.svg when active
                <g fill={primaryColor} className="transition-colors duration-200">
                  <path d="M21.3604 13H19.6726H6.76565C5.97137 13 5.1771 13.2857 4.58139 13.7619C4.18426 14.0476 3.8864 14.5238 3.68783 15L2.79427 17.0952L2.09928 18.8095C2 19 2 19.1905 2 19.381C2 19.6667 2.09928 19.9524 2.19857 20.1429C2.49642 20.619 2.99284 21 3.68783 21H18.1833C19.5733 21 20.7647 20.2381 21.2612 19L22.8497 15.1905C23.3461 14.1429 22.5519 13 21.3604 13Z" />
                  <path d="M1.98522 14.4074C2.18227 13.9926 2.37931 13.5778 2.67488 13.163C2.87192 12.8519 3.06897 12.6444 3.36453 12.3333C4.25123 11.5037 5.4335 10.9852 6.71429 10.9852H19.4236H20.2118H21V9.11852C21 7.14815 19.5222 5.59259 17.6502 5.59259H12.133L10.8522 4.24444C10.1626 3.41481 9.07882 3 7.99507 3H4.34975C2.47783 3 1 4.55556 1 6.52593V17L1.78818 14.8222L1.98522 14.4074Z" />
                </g>
              ) : (
                // Clickons/Open.svg when inactive
                <g fill={inactiveColor} className="transition-colors duration-200">
                  <path 
                    d="M3 6.25175C3 5.69126 3.60677 5 4.44068 5H8C8.61014 5 9.25791 5.22846 9.64544 5.60153C9.6537 5.60948 9.66209 5.61729 9.67062 5.62496L11.196 6.99559C11.3796 7.16051 11.6176 7.25175 11.8644 7.25175H17.5593C18.2331 7.25175 18.9079 7.71314 19.0125 8.36759C19.0997 8.91296 19.6124 9.28441 20.1578 9.19726C20.7032 9.11011 21.0746 8.59735 20.9875 8.05199C20.6853 6.16099 18.9195 5.25175 17.5593 5.25175H12.2477L11.0191 4.14784C10.187 3.35511 9.01152 3 8 3H4.44068C2.63052 3 1 4.46259 1 6.25175V18C1 18.0429 1.0027 18.0851 1.00793 18.1265C0.894982 19.5728 2.04026 21 3.60391 21H17.3975C19.1083 21 20.6694 19.9396 21.321 18.3551L22.8239 14.5994L22.8256 14.5951C23.477 12.9453 22.2217 11 20.3962 11H6.60253C5.53741 11 4.62249 11.4072 3.87757 12.0299C3.52381 12.3027 3.23188 12.6306 3 13.005V6.25175ZM5.1486 13.5742C5.59967 13.1934 6.07755 13 6.60253 13H20.3962C20.5603 13 20.744 13.0912 20.8764 13.2895C21.0096 13.489 21.0271 13.7027 20.9659 13.8592L20.9653 13.8606L19.4696 17.5985C19.1207 18.442 18.2842 19 17.3975 19H3.60391C3.43981 19 3.25609 18.9088 3.12367 18.7105C2.99052 18.5111 2.97298 18.2975 3.03413 18.1409L4.53235 14.3968L4.53404 14.3925C4.67267 14.0414 4.86641 13.7903 5.1085 13.6063C5.12214 13.596 5.13551 13.5853 5.1486 13.5742Z" 
                    fillRule="evenodd" 
                    clipRule="evenodd" 
                  />
                </g>
              )}
            </svg>
            <span className={`text-xs transition-colors duration-200 ${
              activeNav === 'myads' ? 'text-[#1944F1] font-bold' : 'text-slate-400 font-medium'
            }`}>
              My Ads
            </span>
          </button>

          {/* 5. Profile Tab */}
          <button
            onClick={() => navigateTo('profile')}
            className="flex flex-col items-center justify-center gap-1 py-0.5 px-2 transition-all active:scale-90 min-w-[56px]"
          >
            <svg width="25" height="25" viewBox="0 0 32 32" className="transition-all duration-200">
              <g id="about">
                <path 
                  d="M16,16A7,7,0,1,0,9,9,7,7,0,0,0,16,16Z" 
                  fill={activeNav === 'profile' ? primaryColor : 'none'} 
                  stroke={activeNav === 'profile' ? primaryColor : inactiveColor} 
                  strokeWidth="2" 
                  className="transition-colors duration-200"
                />
                <path 
                  d="M17,18H15A11,11,0,0,0,4,29a1,1,0,0,0,1,1H27a1,1,0,0,0,1-1A11,11,0,0,0,17,18Z" 
                  fill={activeNav === 'profile' ? primaryColor : 'none'} 
                  stroke={activeNav === 'profile' ? primaryColor : inactiveColor} 
                  strokeWidth="2" 
                  className="transition-colors duration-200"
                />
              </g>
            </svg>
            <span className={`text-xs transition-colors duration-200 ${
              activeNav === 'profile' ? 'text-[#1944F1] font-bold' : 'text-slate-400 font-medium'
            }`}>
              Profile
            </span>
          </button>
        </div>
      )}

      {/* Floating Exit Toast for Phone Navigation Button / Gesture Swipe */}
      <AnimatePresence>
        {showExitToast && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 left-0 right-0 flex justify-center items-center z-[100] pointer-events-none px-4"
          >
            <div className="bg-white text-slate-800 text-xs font-semibold px-4 py-2 rounded-full shadow-lg border border-slate-200/90">
              <span>Press or swipe back again to exit</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Real-Time In-App Push Notification Banner Toast */}
      <AnimatePresence>
        {activeNotificationToast && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={() => {
              if (activeNotificationToast.type === 'message') {
                setActiveNav('chats');
              } else {
                setActiveNav('notifications');
              }
              setActiveNotificationToast(null);
            }}
            className="fixed top-4 left-4 right-4 max-w-md mx-auto z-50 bg-slate-900/95 text-white p-3.5 rounded-2xl shadow-2xl border border-slate-800 backdrop-blur-md cursor-pointer flex items-center gap-3 active:scale-98 transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-xs">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-white truncate">
                  {activeNotificationToast.title}
                </p>
                <span className="text-[10px] text-blue-300 font-medium">Just now</span>
              </div>
              <p className="text-[11px] text-slate-300 truncate mt-0.5">
                {activeNotificationToast.message}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
