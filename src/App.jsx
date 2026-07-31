import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
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
import { getStoredUser, fetchUserProfile, logoutAuthSession, saveAuthSession } from './lib/api';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('welcome'); // 'welcome' -> 'login'/'signup' -> 'main'
  const [activeNav, setActiveNav] = useState('home'); // 'home', 'chats', 'sell', 'myads', 'profile', 'wishlist', 'notifications'
  const [favorites, setFavorites] = useState(['card-2']);
  const [showExitToast, setShowExitToast] = useState(false);
  const lastBackPressRef = useRef(0);

  const [user, setUser] = useState(null);

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      StatusBar.setStyle({ style: Style.Light }).catch(() => {});
      StatusBar.setBackgroundColor({ color: '#FFFFFF' }).catch(() => {});
    }

    // Instant smooth auto restore persistent login session
    const stored = getStoredUser();
    if (stored) {
      setUser(stored);
      setCurrentScreen('main');
    }
  }, []);

  // Back button / Left-swipe event listener for Android
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const backListener = CapApp.addListener('backButton', () => {
      if (currentScreen === 'main') {
        if (activeNav !== 'home') {
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
  }, [currentScreen, activeNav]);

  const primaryColor = '#1944F1';
  const inactiveColor = '#94A3B8';

  const handleLoginSuccess = (userData) => {
    const name = userData.fullName || userData.username || userData.name;
    setUser(prev => ({ ...prev, ...userData, name }));
    saveAuthSession(userData.token, userData);
    setCurrentScreen('main');
  };

  const handleSignupSuccess = (formData) => {
    const name = formData.fullName || formData.username || formData.name;
    setUser(prev => ({ ...prev, ...formData, name }));
    saveAuthSession(formData.token, formData);
    setCurrentScreen('main');
  };

  const handleLogout = () => {
    logoutAuthSession();
    setCurrentScreen('welcome');
  };

  // Show bottom nav bar only for main tab screens
  const showBottomNav = currentScreen === 'main' && ['home', 'chats', 'sell', 'myads', 'profile'].includes(activeNav);

  return (
    <div className="w-full h-full min-h-screen bg-white text-slate-900 font-sans overflow-hidden select-none relative flex flex-col justify-between">
      
      {/* 1. AUTH / MAIN SCREEN CONTENT WRAPPER */}
      <div className="flex-1 overflow-hidden relative w-full h-full">
        {currentScreen === 'welcome' && (
          <WelcomeScreen onNavigate={(screen) => setCurrentScreen(screen)} />
        )}
        {currentScreen === 'login' && (
          <LoginScreen 
            onNavigate={(screen) => setCurrentScreen(screen)} 
            onLoginSuccess={handleLoginSuccess}
          />
        )}
        {currentScreen === 'signup' && (
          <SignupScreen 
            onNavigate={(screen) => setCurrentScreen(screen)} 
            onSignupSuccess={handleSignupSuccess}
          />
        )}

        {currentScreen === 'main' && (
          <AnimatePresence mode="wait">
            {activeNav === 'home' && (
              <HomeScreen 
                key="home" 
                user={user} 
                activeNav={activeNav}
                setActiveNav={setActiveNav}
                favorites={favorites}
                setFavorites={setFavorites}
                onNavigate={(screen) => setCurrentScreen(screen)} 
              />
            )}
            {activeNav === 'chats' && (
              <ChatScreen 
                key="chats"
                activeNav={activeNav} 
                setActiveNav={setActiveNav} 
                favorites={favorites}
                onNavigateBack={() => setActiveNav('home')} 
              />
            )}
            {activeNav === 'sell' && (
              <SellScreen 
                key="sell"
                activeNav={activeNav} 
                setActiveNav={setActiveNav} 
                favorites={favorites}
                onNavigateBack={() => setActiveNav('home')} 
              />
            )}
            {activeNav === 'myads' && (
              <MyAdsScreen 
                key="myads"
                activeNav={activeNav} 
                setActiveNav={setActiveNav} 
                favorites={favorites}
                onNavigateBack={() => setActiveNav('home')} 
              />
            )}
            {activeNav === 'profile' && (
              <ProfileScreen 
                key="profile"
                user={user}
                activeNav={activeNav} 
                setActiveNav={setActiveNav} 
                favorites={favorites}
                onNavigateBack={() => setActiveNav('home')} 
                onLogout={handleLogout}
              />
            )}
            {activeNav === 'wishlist' && (
              <WishlistScreen 
                key="wishlist"
                user={user}
                activeNav={activeNav}
                setActiveNav={setActiveNav}
                favorites={favorites}
                setFavorites={setFavorites}
                onNavigateBack={() => setActiveNav('home')}
              />
            )}
            {activeNav === 'notifications' && (
              <NotificationsScreen
                key="notifications"
                user={user}
                activeNav={activeNav}
                setActiveNav={setActiveNav}
                favorites={favorites}
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
      <AnimatePresence>
        {showExitToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white text-xs font-semibold px-4.5 py-2.5 rounded-full shadow-2xl z-[100] backdrop-blur-md pointer-events-none whitespace-nowrap border border-white/10"
          >
            Press back again to exit Campus Buddy
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
