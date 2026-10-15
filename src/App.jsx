import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { apiGetMe, apiLogout, getStoredUser, getAuthToken, fetchMyAds, fetchNotifications, resolveAllUserAds, API_BASE_URL } from './lib/api';
import { initSocketClient, disconnectSocket, subscribeToNewNotifications, subscribeToUnreadCount } from './lib/socket';
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
import UniversityOnboarding from './components/UniversityOnboarding';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState(() => {
    const user = getStoredUser();
    const token = getAuthToken();
    return (user && token) ? 'main' : 'welcome';
  });
  const [activeNav, setActiveNav] = useState('home');
  const [previousNav, setPreviousNav] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('campus_favorites');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];

      // Collect known product IDs from local caches if present
      let knownIds = null;
      try {
        const cached = JSON.parse(localStorage.getItem('campus_products_cache') || '[]');
        const userCached = JSON.parse(localStorage.getItem('campus_user_ads') || '[]');
        if (cached.length > 0 || userCached.length > 0) {
          knownIds = new Set([
            ...cached.map(p => String(p._id || p.id)),
            ...userCached.map(p => String(p._id || p.id))
          ]);
        }
      } catch {}

      return parsed.filter(id => {
        if (!id) return false;
        const str = String(id).trim();
        if (str === '' || str === 'null' || str === 'undefined' || str === 'card-1' || str === 'card-2' || str === '1') {
          return false;
        }
        if (knownIds && knownIds.size > 0) {
          return knownIds.has(str);
        }
        return true;
      });
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('campus_favorites', JSON.stringify(favorites));
    } catch {}
  }, [favorites]);
  const [showExitToast, setShowExitToast] = useState(false);
  const lastBackPressRef = useRef(0);

  // Traditional JWT Auth state (MongoDB Atlas)
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());
  const [authLoading, setAuthLoading] = useState(true);
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
                if (isMounted) setUserAds(resolveAllUserAds(user, Array.isArray(ads) ? ads : []));
              }).catch(() => {});
            } else {
              setCurrentUser(null);
              setCurrentScreen('welcome');
              setHomeDataReady(true);
            }
          }
        } catch {
          if (isMounted) {
            setCurrentUser(null);
            setCurrentScreen('welcome');
            setHomeDataReady(true);
          }
        }
      } else {
        if (isMounted) {
          setCurrentUser(null);
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

    // 2. Load existing notifications from MongoDB
    fetchNotifications().then(res => {
      if (res && Array.isArray(res.notifications)) {
        setNotifications(res.notifications);
      }
    }).catch(() => {});

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

    return () => {
      unsubNotif();
      unsubCount();
    };
  }, [currentUser]);

  // Back button / Left-swipe event listener for Android
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const backListener = CapApp.addListener('backButton', () => {
      if (currentScreen === 'main') {
        if (activeNav === 'seller-info') {
          setActiveNav('product-details');
        } else if (activeNav === 'product-details') {
          setActiveNav(previousNav || 'home');
          setSelectedProduct(null);
        } else if (activeNav !== 'home') {
          // Redirect to home screen first if on another screen!
          setActiveNav('home');
        } else {
          // Double press to exit when on home screen
          const now = Date.now();
          if (now - lastBackPressRef.current < 2000) {
            CapApp.exitApp();
          } else {
            lastBackPressRef.current = now;
            setShowExitToast(true);
            setTimeout(() => setShowExitToast(false), 2000);
          }
        }
      } else if (currentScreen === 'login' || currentScreen === 'signup') {
        setCurrentScreen('welcome');
      } else if (currentScreen === 'welcome') {
        const now = Date.now();
        if (now - lastBackPressRef.current < 2000) {
          CapApp.exitApp();
        } else {
          lastBackPressRef.current = now;
          setShowExitToast(true);
          setTimeout(() => setShowExitToast(false), 2000);
        }
      }
    });

    return () => {
      backListener.then(h => h.remove());
    };
  }, [currentScreen, activeNav, previousNav]);

  const primaryColor = '#1944F1';
  const inactiveColor = '#94A3B8';

  const handleLogout = () => {
    disconnectSocket();
    apiLogout();
    setCurrentUser(null);
    setNotifications([]);
    setCurrentScreen('welcome');
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setCurrentScreen('main');
    initSocketClient(getAuthToken());
    fetchNotifications().then(res => {
      if (res && Array.isArray(res.notifications)) setNotifications(res.notifications);
    }).catch(() => {});
    fetchMyAds().then(ads => {
      setUserAds(resolveAllUserAds(currentUser || getStoredUser(), Array.isArray(ads) ? ads : []));
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
    setSelectedProduct(product);
    setPreviousNav(activeNav);
    setActiveNav('product-details');
  };

  const handleProductDetailBack = () => {
    setActiveNav(previousNav || 'home');
    setSelectedProduct(null);
  };

  // Show bottom nav bar only for main tab screens and NEVER during splash / loading screen
  const showBottomNav = !authLoading && !showSplash && currentScreen === 'main' && ['home', 'chats', 'sell', 'myads', 'profile'].includes(activeNav);

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
                setActiveNav={setActiveNav}
                favorites={favorites}
                setFavorites={setFavorites}
                notifications={notifications}
                userAds={userAds}
                onSelectProduct={handleSelectProduct}
                onOpenChat={(target) => {
                  setActiveChatTarget(target);
                  setActiveNav('chats');
                }}
                onNavigate={(screen) => setCurrentScreen(screen)} 
                onInitialLoadComplete={() => setHomeDataReady(true)}
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
                onNavigateBack={handleProductDetailBack}
                onViewSellerInfo={(sellerData) => {
                  setSelectedSeller(sellerData);
                  setActiveNav('seller-info');
                  window.scrollTo(0, 0);
                }}
                onOpenChat={(target) => {
                  setActiveChatTarget(target);
                  setActiveNav('chats');
                }}
                onManageMyAds={() => {
                  setActiveNav('myads');
                  setSelectedProduct(null);
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
                onNavigateBack={() => setActiveNav('product-details')}
                onOpenChat={(target) => {
                  setActiveChatTarget(target);
                  setActiveNav('chats');
                }}
              />
            )}
            {activeNav === 'chats' && (
              <ChatScreen 
                key="chats"
                user={userForScreens}
                activeNav={activeNav} 
                setActiveNav={setActiveNav} 
                favorites={favorites}
                notifications={notifications}
                activeChatTarget={activeChatTarget}
                setActiveChatTarget={setActiveChatTarget}
                onNavigateBack={() => setActiveNav('home')} 
              />
            )}
            {activeNav === 'sell' && (
              <SellScreen 
                key="sell"
                user={userForScreens}
                activeNav={activeNav} 
                setActiveNav={setActiveNav} 
                favorites={favorites}
                notifications={notifications}
                userAds={userAds}
                setUserAds={setUserAds}
                onAdCreated={(newAd) => {
                  setUserAds(prev => [newAd, ...prev.filter(a => (a._id || a.id) !== (newAd._id || newAd.id))]);
                  setActiveNav('myads');
                }}
                onNavigateBack={() => setActiveNav('home')} 
              />
            )}
            {activeNav === 'myads' && (
              <MyAdsScreen 
                key="myads"
                user={userForScreens}
                activeNav={activeNav} 
                setActiveNav={setActiveNav} 
                favorites={favorites}
                notifications={notifications}
                userAds={userAds}
                setUserAds={setUserAds}
                onSelectProduct={handleSelectProduct}
                onNavigateBack={() => setActiveNav('home')} 
              />
            )}
            {activeNav === 'profile' && (
              <ProfileScreen 
                key="profile"
                user={userForScreens}
                activeNav={activeNav} 
                setActiveNav={setActiveNav} 
                favorites={favorites}
                notifications={notifications}
                userAds={userAds}
                onNavigateBack={() => setActiveNav('home')} 
                onLogout={handleLogout}
              />
            )}
            {activeNav === 'wishlist' && (
              <WishlistScreen 
                key="wishlist"
                user={userForScreens}
                activeNav={activeNav}
                setActiveNav={setActiveNav}
                favorites={favorites}
                setFavorites={setFavorites}
                notifications={notifications}
                userAds={userAds}
                onSelectProduct={handleSelectProduct}
                onOpenChat={(target) => {
                  setActiveChatTarget(target);
                  setActiveNav('chats');
                }}
                onNavigateBack={() => setActiveNav('home')}
              />
            )}
            {activeNav === 'notifications' && (
              <NotificationsScreen
                key="notifications"
                user={userForScreens}
                activeNav={activeNav}
                setActiveNav={setActiveNav}
                favorites={favorites}
                notifications={notifications}
                setNotifications={setNotifications}
                onSelectProduct={handleSelectProduct}
                onOpenChat={(target) => {
                  setActiveChatTarget(target);
                  setActiveNav('chats');
                }}
                onNavigateBack={() => setActiveNav('home')}
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
            onClick={() => setActiveNav('home')}
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
            onClick={() => setActiveNav('chats')}
            className="flex flex-col items-center justify-center gap-1 py-0.5 px-2 transition-all active:scale-90 min-w-[56px]"
          >
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
            <span className={`text-xs transition-colors duration-200 ${
              activeNav === 'chats' ? 'text-[#1944F1] font-bold' : 'text-slate-400 font-medium'
            }`}>
              Chats
            </span>
          </button>

          {/* 3. Sell Tab (Center Action Button) */}
          <div className="-mt-8 flex flex-col items-center justify-center px-1">
            <button
              onClick={() => setActiveNav('sell')}
              className={`w-13.5 h-13.5 min-w-[54px] max-w-[54px] min-h-[54px] max-h-[54px] rounded-full flex items-center justify-center shadow-xl transition-all active:scale-90 p-2.5 border-4 border-white ${
                activeNav === 'sell'
                  ? 'bg-[#1944F1] text-white ring-4 ring-blue-100 scale-105 shadow-blue-500/40'
                  : 'bg-[#1944F1] text-white shadow-blue-500/30 hover:scale-105'
              }`}
            >
              <img src="/add-ellipse-svgrepo-com.svg" alt="Sell" className="w-7 h-7 filter brightness-0 invert" />
            </button>
            <span className={`text-xs block text-center mt-0.5 transition-colors duration-200 ${
              activeNav === 'sell' ? 'text-[#1944F1] font-bold' : 'text-slate-500 font-semibold'
            }`}>
              Sell
            </span>
          </div>

          {/* 4. My Ads Tab */}
          <button
            onClick={() => setActiveNav('myads')}
            className="flex flex-col items-center justify-center gap-1 py-0.5 px-2 transition-all active:scale-90 min-w-[56px]"
          >
            <svg width="25" height="25" viewBox="0 0 24 24" className="transition-all duration-200">
              <g fill={activeNav === 'myads' ? primaryColor : inactiveColor} className="transition-colors duration-200">
                <path fillRule="evenodd" clipRule="evenodd" d="M5.25 14.5001C5.25 14.0858 5.58579 13.7501 6 13.7501H14C14.4142 13.7501 14.75 14.0858 14.75 14.5001C14.75 14.9143 14.4142 15.2501 14 15.2501H6C5.58579 15.2501 5.25 14.9143 5.25 14.5001Z" />
                <path fillRule="evenodd" clipRule="evenodd" d="M5.25 18C5.25 17.5858 5.58579 17.25 6 17.25H11.5C11.9142 17.25 12.25 17.5858 12.25 18C12.25 18.4143 11.9142 18.75 11.5 18.75H6C5.58579 18.75 5.25 18.4143 5.25 18Z" />
                <path fillRule="evenodd" clipRule="evenodd" d="M12.25 2.83422C11.7896 2.75598 11.162 2.75005 10.0298 2.75005C8.11311 2.75005 6.75075 2.75163 5.71785 2.88987C4.70596 3.0253 4.12453 3.27933 3.7019 3.70195C3.27869 4.12516 3.02502 4.70481 2.88976 5.7109C2.75159 6.73856 2.75 8.09323 2.75 10.0001V14.0001C2.75 15.9069 2.75159 17.2615 2.88976 18.2892C3.02502 19.2953 3.27869 19.8749 3.7019 20.2981C4.12511 20.7214 4.70476 20.975 5.71085 21.1103C6.73851 21.2485 8.09318 21.2501 10 21.2501H14C15.9068 21.2501 17.2615 21.2485 18.2892 21.1103C19.2952 20.975 19.8749 20.7214 20.2981 20.2981C20.7213 19.8749 20.975 19.2953 21.1102 18.2892C21.2484 17.2615 21.25 15.9069 21.25 14.0001V13.5629C21.25 12.0269 21.2392 11.2988 21.0762 10.7501H17.9463C16.8135 10.7501 15.8877 10.7501 15.1569 10.6518C14.3929 10.5491 13.7306 10.3268 13.2019 9.79815C12.6732 9.26945 12.4509 8.60712 12.3482 7.84317C12.25 7.1123 12.25 6.18657 12.25 5.05374V2.83422ZM13.75 3.6095V5.00005C13.75 6.19976 13.7516 7.0241 13.8348 7.64329C13.9152 8.24091 14.059 8.53395 14.2626 8.73749C14.4661 8.94103 14.7591 9.08486 15.3568 9.16521C15.976 9.24846 16.8003 9.25005 18 9.25005H20.0195C19.723 8.9625 19.3432 8.61797 18.85 8.17407L14.8912 4.61117C14.4058 4.17433 14.0446 3.85187 13.75 3.6095ZM10.1755 1.25002C11.5601 1.24965 12.4546 1.24942 13.2779 1.56535C14.1012 1.88129 14.7632 2.47735 15.7873 3.39955C15.8226 3.43139 15.8584 3.46361 15.8947 3.49623L19.8534 7.05912C19.8956 7.09705 19.9372 7.1345 19.9783 7.17149C21.162 8.23614 21.9274 8.92458 22.3391 9.84902C22.7508 10.7734 22.7505 11.8029 22.75 13.3949C22.75 13.4502 22.75 13.5062 22.75 13.5629V14.0565C22.75 15.8942 22.75 17.3499 22.5969 18.4891C22.4392 19.6615 22.1071 20.6104 21.3588 21.3588C20.6104 22.1072 19.6614 22.4393 18.489 22.5969C17.3498 22.7501 15.8942 22.7501 14.0564 22.7501H9.94359C8.10583 22.7501 6.65019 22.7501 5.51098 22.5969C4.33856 22.4393 3.38961 22.1072 2.64124 21.3588C1.89288 20.6104 1.56076 19.6615 1.40314 18.4891C1.24997 17.3499 1.24998 15.8942 1.25 14.0565V9.94363C1.24998 8.10587 1.24997 6.65024 1.40314 5.51103C1.56076 4.33861 1.89288 3.38966 2.64124 2.64129C3.39019 1.89235 4.34232 1.56059 5.51887 1.40313C6.66283 1.25002 8.1257 1.25003 9.97352 1.25005L10.0298 1.25005C10.0789 1.25005 10.1275 1.25004 10.1755 1.25002Z" />
              </g>
            </svg>
            <span className={`text-xs transition-colors duration-200 ${
              activeNav === 'myads' ? 'text-[#1944F1] font-bold' : 'text-slate-400 font-medium'
            }`}>
              My Ads
            </span>
          </button>

          {/* 5. Profile Tab */}
          <button
            onClick={() => setActiveNav('profile')}
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

      {/* Floating Exit Toast for Android Back Button / Gesture */}
      {showExitToast && (
        <div
          style={{
            position: 'fixed',
            bottom: '96px',
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 100,
            pointerEvents: 'none',
          }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <img src="/group_3.svg" alt="CB" style={{ width: '16px', height: '16px', objectFit: 'contain', borderRadius: '3px' }} />
            <span style={{ color: '#000', fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap' }}>Press back again to exit Campus Buddy</span>
          </motion.div>
        </div>
      )}

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
