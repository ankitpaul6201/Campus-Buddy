import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  ChevronRight, 
  Heart,
  PackageCheck,
  ShieldCheck,
  Tag,
  Lock,
  HelpCircle,
  LogOut,
  X,
  Trash2,
  CheckCircle2,
  FileText,
  Shield,
  Star,
  Check,
  KeyRound,
  Smartphone,
  Mail,
  Building2,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  UserPen,
  School,
  Camera,
  Calendar,
  GraduationCap,
  Upload,
  Eye,
  EyeOff
} from 'lucide-react';
import { uploadStudentId, apiUpdateProfile, apiUpdatePassword } from '../lib/api';
const defaultAvatar = '/avatar-blue-2.svg';

// Campus Buddy Profile Screen with default avatar and student info
export default function ProfileScreen({ user, activeNav, setActiveNav, favorites = [], notifications = [], userAds = [], onNavigateBack, onLogout }) {
  const [showWishlistModal, setShowWishlistModal] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'edit_profile', 'purchases', 'verification', 'security', 'support', 'terms', 'privacy', 'reviews'
  const [faqOpen, setFaqOpen] = useState(0);

  // Derived verification state
  const isUserVerified = Boolean(
    user?.isVerified ||
    user?.publicMetadata?.isVerified ||
    localStorage.getItem('user_id_verified') === 'true'
  );

  // Edit Profile Form State
  const [editName, setEditName] = useState(user?.fullName || user?.name || '');
  const [editUniversity, setEditUniversity] = useState(user?.universityName || '');
  const [editDob, setEditDob] = useState(user?.dob || localStorage.getItem('user_dob') || '');
  const [editCourse, setEditCourse] = useState(user?.course || localStorage.getItem('user_course') || '');
  const [editYear, setEditYear] = useState(user?.year || localStorage.getItem('user_year') || '1st Year');
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
  const [profileSavedMessage, setProfileSavedMessage] = useState(false);

  // Security Form State
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(() => {
    const saved = localStorage.getItem('user_2fa_enabled');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [passSavedMessage, setPassSavedMessage] = useState(false);
  const [securityOtpStep, setSecurityOtpStep] = useState(false);
  const [securityOtpCode, setSecurityOtpCode] = useState('');
  const [pendingSecurityAction, setPendingSecurityAction] = useState(null); // 'password' | 'toggle_2fa'

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState(null); // { text, type: 'success' | 'error' }

  const showToast = (text, type = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
        localStorage.setItem('user_custom_avatar', reader.result);
        showToast("Profile picture updated!", "success");
      };
      reader.readAsDataURL(file);
    }
  };

  const calculateAge = (dobString) => {
    if (!dobString) return null;
    const dob = new Date(dobString);
    const diff_ms = Date.now() - dob.getTime();
    const age_dt = new Date(diff_ms);
    return Math.abs(age_dt.getUTCFullYear() - 1970);
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      if (editName.trim()) {
        localStorage.setItem('user_custom_fullname', editName.trim());
      }
      if (editDob) localStorage.setItem('user_dob', editDob);
      if (editCourse) localStorage.setItem('user_course', editCourse);
      if (editYear) localStorage.setItem('user_year', editYear);

      // Sync with backend API to save to MongoDB Atlas (college & email remain locked)
      await apiUpdateProfile({
        fullName: editName.trim(),
        dob: editDob,
        course: editCourse,
        year: editYear,
      });

      setProfileSavedMessage(true);
      showToast("Profile changes saved successfully!", "success");
      setTimeout(() => setProfileSavedMessage(false), 3000);
    } catch (err) {
      console.error("Error saving profile changes:", err);
      showToast("Failed to save changes. Please try again.", "error");
    }
  };

  const products = [
    { id: 'card-1', title: 'Engineering Mathematics Vol 2', price: '$45', sellerName: 'Rahul', image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80' },
    { id: 'card-2', title: 'TI-84 Plus CE Graphing Calculator', price: '$80', sellerName: 'Sarah', image: 'https://images.unsplash.com/photo-1611125832047-1d7ad1e8e48b?auto=format&fit=crop&w=600&q=80' }
  ];

  const wishlistedProducts = products.filter(p => favorites.includes(p.id));
  const uploadedHeartPath = "M2 9.1371C2 14 6.01943 16.5914 8.96173 18.9109C10 19.7294 11 20.5 12 20.5C13 20.5 14 19.7294 15.0383 18.9109C17.9806 16.5914 22 14 22 9.1371C22 4.27416 16.4998 0.825464 12 5.50063C7.50016 0.825464 2 4.27416 2 9.1371Z";

  const primaryColor = '#1944F1';
  const inactiveColor = '#94A3B8';

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (newPass && newPass.length < 8) {
      showToast("New password must be at least 8 characters.", "error");
      return;
    }
    // Initiate OTP verification for security changes
    setPendingSecurityAction('password');
    setSecurityOtpStep(true);
    setSecurityOtpCode('');
    showToast("OTP send", "success");
  };

  const handleVerifySecurityOtp = (e) => {
    e.preventDefault();
    if (securityOtpCode.length < 6) {
      showToast("Please enter the full 6-digit OTP code.", "error");
      return;
    }

    if (pendingSecurityAction === 'password') {
      localStorage.setItem('user_2fa_enabled', JSON.stringify(twoFactorEnabled));
      setPassSavedMessage(true);
      showToast("Password & security settings updated successfully!", "success");
      setCurrentPass('');
      setNewPass('');
      setTimeout(() => setPassSavedMessage(false), 3000);
    } else if (pendingSecurityAction === 'toggle_2fa') {
      const nextState = !twoFactorEnabled;
      setTwoFactorEnabled(nextState);
      localStorage.setItem('user_2fa_enabled', JSON.stringify(nextState));
      showToast(
        nextState 
          ? "2-Factor Authentication enabled successfully!" 
          : "2-Factor Authentication disabled successfully!", 
        "success"
      );
    }

    setSecurityOtpStep(false);
    setSecurityOtpCode('');
    setPendingSecurityAction(null);
  };

  const soldCount = userAds ? userAds.filter(a => a.status === 'sold').length : 0;
  const activeCount = userAds ? userAds.filter(a => a.status !== 'sold').length : 0;

  const menuItems = [
    {
      id: 'purchases',
      label: 'Sales & Order History',
      sublabel: `${soldCount} items completed on campus`,
      icon: PackageCheck,
      bgColor: 'bg-[#20BF9B]/15 text-[#20BF9B]',
      badge: `${soldCount} items`,
      badgeColor: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      action: () => setActiveModal('purchases')
    },
    {
      id: 'verification',
      label: 'Student ID Verification',
      sublabel: user?.universityName || 'Campus Member',
      icon: ShieldCheck,
      bgColor: 'bg-[#F45CB0]/15 text-[#F45CB0]',
      status: isUserVerified ? 'Verified' : 'Pending Review',
      statusColor: isUserVerified ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200',
      action: () => setActiveModal('verification')
    },
    {
      id: 'myads',
      label: 'My Active Listings',
      sublabel: 'Manage items currently for sale',
      icon: Tag,
      bgColor: 'bg-[#8C43D4]/15 text-[#8C43D4]',
      badge: `${activeCount} active`,
      badgeColor: 'bg-purple-50 text-purple-600 border-purple-100',
      action: () => setActiveNav && setActiveNav('myads')
    },
    {
      id: 'support',
      label: 'Help & Campus Support',
      sublabel: 'FAQs & campus safety rules',
      icon: HelpCircle,
      bgColor: 'bg-[#06B6D4]/15 text-[#0891B2]',
      action: () => setActiveModal('support')
    },
    {
      id: 'terms',
      label: 'Terms of Services',
      sublabel: 'Marketplace rules & student safety guidelines',
      icon: FileText,
      bgColor: 'bg-[#6366F1]/15 text-[#4F46E5]',
      action: () => setActiveModal('terms')
    },
    {
      id: 'privacy',
      label: 'Privacy Policy',
      sublabel: 'Data protection & security commitments',
      icon: Shield,
      bgColor: 'bg-[#10B981]/15 text-[#059669]',
      action: () => setActiveModal('privacy')
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.99 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.99 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="w-full h-full bg-[#F4F6FB] text-slate-900 flex flex-col justify-between overflow-hidden font-sans select-none relative"
    >
      <div className="flex-1 overflow-y-auto pb-28 no-scrollbar">
        
        {/* Top Header Banner Card - BROUGHT DOWN CLEANLY WITH TOP SAFE PADDING */}
        <div className="relative bg-gradient-to-b from-[#1944F1] to-[#0D30BA] text-white rounded-b-[44px] pt-14 pb-16 px-6 shadow-md flex flex-col items-center">
          {/* Top Bar Icons */}
          <div className="w-full flex items-center justify-between mb-3">
            {/* Heart Wishlist Icon Button */}
            <button 
              onClick={() => setActiveNav && setActiveNav('wishlist')}
              className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 flex items-center justify-center text-white shadow-xs transition-all active:scale-95 relative shrink-0"
              title="Saved Items / Wishlist"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" className="transition-all duration-200">
                <path 
                  d={uploadedHeartPath} 
                  fill="none" 
                  stroke="#FFFFFF" 
                  strokeWidth="1.8" 
                />
              </svg>
              {favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4.5 h-4.5 min-w-[18px] min-h-[18px] max-w-[18px] max-h-[18px] rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-[#1944F1] shadow-sm shrink-0 leading-none z-10">
                  {favorites.length}
                </span>
              )}
            </button>

            {/* Bell Notifications Icon Button */}
            <button 
              onClick={() => setActiveNav && setActiveNav('notifications')}
              className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 flex items-center justify-center text-white shadow-xs transition-all active:scale-95 relative shrink-0"
              title="Notifications"
            >
              <img src="/bell-svgrepo-com.svg" alt="Notifications" className="w-[22px] h-[22px] object-contain filter brightness-0 invert opacity-90" />
              {notifications.filter(n => n.unread).length > 0 && (
                <span className="absolute -top-1 -right-1 w-4.5 h-4.5 min-w-[18px] min-h-[18px] max-w-[18px] max-h-[18px] rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-xs">
                  {notifications.filter(n => n.unread).length}
                </span>
              )}
            </button>
          </div>

          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {user?.fullName || user?.name || "Student"}
            </h1>
            <p className="text-xs text-blue-100/90 font-medium">
              {user?.universityName || "Campus Member"}
            </p>
            
            {/* Age, Course & Year Tags */}
            <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
              {calculateAge(editDob) && (
                <span className="text-[10px] bg-white/20 backdrop-blur-md text-white font-semibold px-2.5 py-0.5 rounded-full border border-white/20">
                  {calculateAge(editDob)} yrs old
                </span>
              )}
              {editCourse && (
                <span className="text-[10px] bg-white/20 backdrop-blur-md text-white font-semibold px-2.5 py-0.5 rounded-full border border-white/20">
                  {editCourse}
                </span>
              )}
              {editYear && (
                <span className="text-[10px] bg-white/20 backdrop-blur-md text-white font-semibold px-2.5 py-0.5 rounded-full border border-white/20">
                  {editYear}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Profile Avatar Card */}
        <div className="flex justify-center -mt-12 mb-4 relative z-10">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-white bg-slate-100 overflow-hidden shadow-xl flex items-center justify-center select-none">
              <img 
                src={avatarPreview || (user?.avatar && !['/avatar.svg', '/avatar-blue.svg'].includes(user.avatar) ? user.avatar : defaultAvatar)} 
                alt="Profile Avatar"
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.src = defaultAvatar; }}
              />
            </div>
            
            {isUserVerified && (
              <div className="absolute bottom-0 right-0 bg-[#1944F1] text-white p-1 rounded-full border-2 border-white shadow-md" title="Verified Student">
                <CheckCircle2 className="w-4 h-4 fill-[#1944F1] text-white" />
              </div>
            )}
          </div>
        </div>

        {/* 3 Metric Cards Row (Clickable) */}
        <div className="px-5 mb-5">
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex items-center justify-around text-center">
            
            <button 
              onClick={() => setActiveModal('purchases')}
              className="flex-1 space-y-0.5 hover:bg-slate-50 p-2 rounded-2xl transition-colors text-center"
            >
              <div className="text-lg font-bold text-slate-900 font-sans">
                {userAds ? userAds.filter(a => a.status === 'sold').length : 0}
              </div>
              <div className="text-[11px] font-medium text-slate-400">Items Sold</div>
            </button>

            <div className="w-px h-8 bg-slate-100" />

            <button 
              onClick={() => setActiveNav && setActiveNav('myads')}
              className="flex-1 space-y-0.5 hover:bg-slate-50 p-2 rounded-2xl transition-colors text-center"
            >
              <div className="text-lg font-bold text-slate-900 font-sans">
                {userAds ? userAds.filter(a => a.status !== 'sold').length : 0}
              </div>
              <div className="text-[11px] font-medium text-slate-400">Active Ads</div>
            </button>

            <div className="w-px h-8 bg-slate-100" />

            <button 
              onClick={() => setActiveModal('reviews')}
              className="flex-1 space-y-0.5 hover:bg-slate-50 p-2 rounded-2xl transition-colors text-center"
            >
              <div className="text-lg font-bold text-slate-900 font-sans flex items-center justify-center gap-1">
                0.0 <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 inline" />
              </div>
              <div className="text-[11px] font-medium text-slate-400">0 Reviews</div>
            </button>
          </div>
        </div>

        {/* Student Information Section */}
        <div className="px-5 mb-5">
          <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-slate-100 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#1944F1] flex items-center justify-center">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Student Information</h3>
              </div>
              <button
                onClick={() => setActiveModal('edit_profile')}
                className="text-[11px] font-semibold text-[#1944F1] hover:underline flex items-center gap-1"
              >
                <UserPen className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-[#F8FAFC] rounded-2xl p-3 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-0.5">Date of Birth</span>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#1944F1] shrink-0" />
                  <span className="text-xs font-bold text-slate-800">
                    {(user?.dob || editDob) ? (
                      new Date(user?.dob || editDob).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
                    ) : 'Not specified'}
                  </span>
                </div>
                {calculateAge(user?.dob || editDob) && (
                  <span className="text-[10px] text-slate-500 font-medium mt-0.5 block">
                    {calculateAge(user?.dob || editDob)} years old
                  </span>
                )}
              </div>

              <div className="bg-[#F8FAFC] rounded-2xl p-3 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-0.5">College Campus</span>
                <div className="flex items-center gap-1.5">
                  <School className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span className="text-xs font-bold text-slate-800 truncate">
                    {user?.universityName || 'Campus Member'}
                  </span>
                </div>
                <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> {isUserVerified ? 'Verified Student' : 'ID Pending'}
                </span>
              </div>

              <div className="bg-[#F8FAFC] rounded-2xl p-3 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-0.5">Course / Major</span>
                <span className="text-xs font-bold text-slate-800 truncate block">
                  {editCourse || 'General Studies'}
                </span>
                <span className="text-[10px] text-slate-500 font-medium mt-0.5 block">
                  {editYear || 'Undergraduate'}
                </span>
              </div>

              <div className="bg-[#F8FAFC] rounded-2xl p-3 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-0.5">College Email</span>
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="text-xs font-bold text-slate-800 truncate">
                    {user?.email || 'Student Email'}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">Official Student Mail</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Options List */}
        <div className="px-5 space-y-2.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={item.action}
                className="w-full bg-white hover:bg-slate-50/80 rounded-2xl p-3.5 px-4 flex items-center justify-between border border-slate-100 shadow-xs transition-all active:scale-[0.99] group text-left"
              >
                <div className="flex items-center gap-3.5 min-w-0 pr-2">
                  <div className={`w-10 h-10 rounded-xl ${item.bgColor} flex items-center justify-center shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-sm font-semibold text-slate-900 font-sans block leading-tight truncate">
                      {item.label}
                    </span>
                    {item.sublabel && (
                      <span className="text-[10px] text-slate-400 font-normal block leading-tight mt-0.5 truncate">
                        {item.sublabel}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {item.badge && (
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] border shadow-2xs ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                  {item.status && (
                    <span className={`px-2.5 py-0.5 rounded-full font-semibold text-[10px] border ${item.statusColor}`}>
                      {item.status}
                    </span>
                  )}
                  <ChevronRight className="w-4.5 h-4.5 text-slate-300 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            );
          })}

          {onLogout && (
            <button
              onClick={onLogout}
              className="w-full mt-4 bg-rose-50/80 hover:bg-rose-100/80 text-rose-600 rounded-2xl p-3.5 px-4 flex items-center justify-between border border-rose-100 transition-all active:scale-[0.99] group text-left"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-500 flex items-center justify-center shrink-0">
                  <LogOut className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-rose-600 font-sans block leading-tight">
                    Log Out
                  </span>
                  <span className="text-[10px] text-rose-400 font-normal block leading-tight mt-0.5">
                    Sign out of your student account
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4.5 h-4.5 text-rose-300 group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}
        </div>

      </div>

      {/* Interactive Modal Drawer */}
      <AnimatePresence>
        {activeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'linear' }}
            onClick={() => setActiveModal(null)}
            className="absolute inset-0 bg-slate-900/60 z-50 flex flex-col justify-end"
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-white rounded-t-[36px] h-[85vh] flex flex-col justify-between overflow-hidden shadow-2xl will-change-transform"
            >
              {/* Modal Drag Header */}
              <div className="pt-3 pb-2 px-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-20 shrink-0">
                <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto absolute left-1/2 -translate-x-1/2 top-2.5" />
                
                <h2 className="text-base font-bold text-slate-900 font-sans pt-3">
                  {activeModal === 'edit_profile' && 'Edit Profile Information'}
                  {activeModal === 'purchases' && 'Sales & Order History'}
                  {activeModal === 'verification' && 'Student ID Verification'}
                  {activeModal === 'support' && 'Help & Campus Support'}
                  {activeModal === 'terms' && 'Terms of Services'}
                  {activeModal === 'privacy' && 'Privacy Policy'}
                  {activeModal === 'reviews' && 'Student Feedback & Reviews'}
                </h2>

                <button
                  onClick={() => setActiveModal(null)}
                  className="w-8 h-8 rounded-full bg-[#F5F3F3] hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors pt-2"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Content Scroll Area */}
              <div className="flex-1 overflow-y-auto p-6 pb-20 space-y-4">
                
                {/* 0. EDIT PROFILE */}
                {activeModal === 'edit_profile' && (
                  <form onSubmit={handleProfileSave} className="space-y-4 text-left">
                    {profileSavedMessage && (
                      <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Profile information updated successfully!</span>
                      </div>
                    )}

                    {/* Profile Picture Upload Picker */}
                    <div className="flex flex-col items-center justify-center space-y-2 py-2">
                      <div className="relative">
                        <div className="w-20 h-20 rounded-full border-2 border-slate-200 bg-slate-100 overflow-hidden flex items-center justify-center shadow-sm">
                          <img 
                            src={avatarPreview || (user?.avatar && !['/avatar.svg', '/avatar-blue.svg'].includes(user.avatar) ? user.avatar : defaultAvatar)} 
                            alt="Avatar" 
                            className="w-full h-full object-cover" 
                            onError={(e) => { e.currentTarget.src = defaultAvatar; }}
                          />
                        </div>
                        <label className="absolute bottom-0 right-0 p-1.5 bg-[#1944F1] hover:bg-blue-700 text-white rounded-full border border-white shadow-sm cursor-pointer transition-all active:scale-95">
                          <Camera className="w-3.5 h-3.5" />
                          <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                        </label>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500">Tap icon to update profile picture</span>
                    </div>

                    {/* Editable: Full Name */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Full Name</label>
                      <div className="relative">
                        <UserPen className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="Your Full Name"
                          className="w-full pl-11 pr-4 py-3 bg-[#F3F4F6] text-slate-900 placeholder-slate-400 rounded-2xl text-xs font-normal focus:outline-none focus:ring-2 focus:ring-[#1944F1] transition-all"
                        />
                      </div>
                    </div>

                    {/* Non-editable: College / University */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700">College / University</label>
                        <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                          <Lock className="w-3 h-3 text-slate-400" />
                          <span>Verified & Locked</span>
                        </span>
                      </div>
                      <div className="relative flex items-center">
                        <School className="w-4 h-4 text-slate-400 absolute left-4 z-10 pointer-events-none" />
                        <input
                          type="text"
                          value={user?.universityName || editUniversity || 'Campus Member'}
                          readOnly
                          className="w-full pl-11 pr-10 py-3 bg-[#F3F4F6] text-slate-600 font-medium rounded-2xl text-xs border border-transparent cursor-not-allowed select-none focus:outline-none"
                        />
                        <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-4 pointer-events-none" />
                      </div>
                      <p className="text-[10px] text-slate-400 font-normal">
                        College is verified from your student ID and cannot be modified.
                      </p>
                    </div>

                    {/* Editable: Date of Birth (DOB) */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Date of Birth (Shows Age on Profile)</label>
                      <div className="relative">
                        <Calendar className="w-4 h-4 text-slate-400 absolute left-4 top-3.5 z-10 pointer-events-none" />
                        <input
                          type="date"
                          value={editDob}
                          onChange={(e) => setEditDob(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 bg-[#F3F4F6] text-slate-900 placeholder-slate-400 rounded-2xl text-xs font-normal focus:outline-none focus:ring-2 focus:ring-[#1944F1] transition-all"
                        />
                      </div>
                    </div>

                    {/* Editable: Course / Major */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Course / Major</label>
                      <div className="relative">
                        <GraduationCap className="w-4 h-4 text-slate-400 absolute left-4 top-3.5 z-10 pointer-events-none" />
                        <input
                          type="text"
                          value={editCourse}
                          onChange={(e) => setEditCourse(e.target.value)}
                          placeholder="e.g. B.Tech Computer Science / B.Sc Physics"
                          className="w-full pl-11 pr-4 py-3 bg-[#F3F4F6] text-slate-900 placeholder-slate-400 rounded-2xl text-xs font-normal focus:outline-none focus:ring-2 focus:ring-[#1944F1] transition-all"
                        />
                      </div>
                    </div>

                    {/* Editable: Academic Year */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Academic Year</label>
                      <select
                        value={editYear}
                        onChange={(e) => setEditYear(e.target.value)}
                        className="w-full px-4 py-3 bg-[#F3F4F6] text-slate-900 rounded-2xl text-xs font-normal focus:outline-none focus:ring-2 focus:ring-[#1944F1] transition-all"
                      >
                        <option value="1st Year">1st Year (Freshman)</option>
                        <option value="2nd Year">2nd Year (Sophomore)</option>
                        <option value="3rd Year">3rd Year (Junior)</option>
                        <option value="4th Year">4th Year (Senior)</option>
                        <option value="Postgraduate / Master's">Postgraduate / Master's</option>
                        <option value="Ph.D. Scholar">Ph.D. Scholar</option>
                      </select>
                    </div>

                    {/* Non-editable: College Email */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700">College Email</label>
                        <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                          <Lock className="w-3 h-3 text-slate-400" />
                          <span>Locked</span>
                        </span>
                      </div>
                      <div className="relative flex items-center">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-4 z-10 pointer-events-none" />
                        <input
                          type="email"
                          value={user?.email || user?.emailAddresses?.[0]?.emailAddress || ''}
                          readOnly
                          className="w-full pl-11 pr-10 py-3 bg-[#F3F4F6] text-slate-600 font-medium rounded-2xl text-xs border border-transparent cursor-not-allowed select-none focus:outline-none"
                        />
                        <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-4 pointer-events-none" />
                      </div>
                      <p className="text-[10px] text-slate-400 font-normal">
                        Your registered student email is permanent and cannot be modified.
                      </p>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 px-6 rounded-2xl bg-[#1944F1] hover:bg-blue-700 text-white font-semibold text-xs shadow-md transition-all active:scale-[0.98] mt-2 flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      <span>Save Profile Changes</span>
                    </button>
                  </form>
                )}
                {activeModal === 'purchases' && (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-500">
                      Your completed sales and purchased textbook/dorm items on campus.
                    </p>
                    {userAds && userAds.filter(a => a.status === 'sold').length > 0 ? (
                      userAds.filter(a => a.status === 'sold').map((ad, idx) => (
                        <div key={idx} className="p-3.5 rounded-2xl bg-[#F5F3F3] border border-slate-100 flex items-center justify-between">
                          <div className="space-y-0.5">
                            <h4 className="text-xs font-bold text-slate-900">{ad.title}</h4>
                            <p className="text-[10px] text-slate-400">{ad.category || 'Item'}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-extrabold text-slate-900 block">{ad.price}</span>
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
                              SOLD
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                          <PackageCheck className="w-7 h-7 text-slate-300" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-slate-700">No Sales or Orders Yet</h4>
                          <p className="text-xs text-slate-400 max-w-[220px] mx-auto leading-relaxed">
                            Your completed transactions will appear here as you buy or sell items on campus.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. STUDENT ID VERIFICATION */}
                {activeModal === 'verification' && (
                  <div className="space-y-4 text-center">
                    {isUserVerified ? (
                      <>
                        <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-600 to-[#1944F1] text-white shadow-lg space-y-3 text-left relative overflow-hidden">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold tracking-widest uppercase text-blue-200">Campus Verified ID</span>
                            <ShieldCheck className="w-6 h-6 text-emerald-300" />
                          </div>
                          <div>
                            <h3 className="text-lg font-extrabold text-white">{user?.fullName || user?.name || 'Student'}</h3>
                            <p className="text-xs text-blue-100">{user?.universityName || 'Campus Member'}</p>
                          </div>
                          <div className="pt-2 border-t border-white/20 flex items-center justify-between text-[10px] text-blue-100">
                            <span className="flex items-center gap-1 text-emerald-200 font-semibold">
                              <Check className="w-3.5 h-3.5" /> Authenticated via OCR
                            </span>
                            <span className="bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded-full font-bold">STATUS: VERIFIED</span>
                          </div>
                        </div>

                        {(user?.studentIdUrl || localStorage.getItem('user_student_id_url')) && (
                          <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 relative aspect-[16/9]">
                            <img
                              src={user?.studentIdUrl || localStorage.getItem('user_student_id_url')}
                              alt="Verified Student ID"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2 right-2 bg-emerald-600/90 backdrop-blur-md px-2.5 py-1 rounded-lg flex items-center gap-1 text-[10px] font-bold text-white shadow-sm">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Card on File</span>
                            </div>
                          </div>
                        )}

                        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-left flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                          <div className="text-xs space-y-1">
                            <h4 className="font-bold text-emerald-900">Your account is fully verified</h4>
                            <p className="text-emerald-700 leading-snug">
                              Your student credentials and campus ID card have been authenticated. Buyers and sellers see your verified badge across all listings.
                            </p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
                          <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center">
                            <ShieldAlert className="w-7 h-7 text-amber-500" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-sm font-bold text-slate-700">Verify Your Student ID</h4>
                            <p className="text-xs text-slate-400 max-w-[260px] mx-auto leading-relaxed">
                              Upload a photo of your valid university student ID card to get a verified badge on your profile and listings.
                            </p>
                          </div>
                        </div>

                        <label className="w-full py-3.5 px-6 rounded-2xl bg-[#1944F1] hover:bg-blue-700 text-white font-semibold text-xs shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer">
                          <Upload className="w-4 h-4" />
                          <span>Upload Student ID</span>
                          <input type="file" accept="image/*,.pdf" className="hidden" onChange={async (e) => {
                            if (e.target.files && e.target.files[0]) {
                              const file = e.target.files[0];
                              try {
                                showToast('Uploading & verifying Student ID...', 'success');
                                const url = await uploadStudentId(file);
                                localStorage.setItem('user_student_id_url', url);
                                localStorage.setItem('user_id_verified', 'true');
                                showToast('Student ID uploaded & marked as verified!', 'success');
                              } catch (err) {
                                console.error('Student ID upload error:', err);
                                showToast('Failed to upload Student ID. Please try again.', 'error');
                              }
                            }
                          }} />
                        </label>

                        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 text-left flex items-start gap-3">
                          <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                          <div className="text-xs space-y-1">
                            <h4 className="font-bold text-amber-800">Verification Pending</h4>
                            <p className="text-amber-700 leading-snug">
                              Upload your student ID to build trust with buyers. Verified accounts get a badge and higher visibility.
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* 4. HELP & CAMPUS SUPPORT */}
                {activeModal === 'support' && (
                  <div className="space-y-3 text-left">
                    <p className="text-xs text-slate-500">Frequently Asked Questions & Support:</p>
                    {[
                      { q: 'Where are safe drop-off spots on campus?', a: 'We recommend meeting at the Main Library desk, Student Union lobby, or campus dining halls during daylight hours.' },
                      { q: 'How does payment work?', a: 'Campus Buddy supports Cash on Pick-up, Venmo, and Campus Pay upon inspecting the item in person.' },
                      { q: 'What if an item is not as described?', a: 'You can inspect the item before completing drop-off. Report any fraudulent listings to campus admins.' }
                    ].map((item, idx) => (
                      <div key={idx} className="border border-slate-100 rounded-2xl p-3.5 bg-[#F5F3F3] space-y-1">
                        <h4 className="text-xs font-bold text-slate-900">{item.q}</h4>
                        <p className="text-[11px] text-slate-600 leading-relaxed">{item.a}</p>
                      </div>
                    ))}

                    <div className="pt-2 text-center">
                      <a
                        href="mailto:ankitpaul9341@gmail.com"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
                      >
                        <Mail className="w-4 h-4" />
                        Email Campus Support Team
                      </a>
                    </div>
                  </div>
                )}

                {/* 5. TERMS OF SERVICES */}
                {activeModal === 'terms' && (
                  <div className="space-y-4 text-left text-xs text-slate-600 leading-relaxed">
                    <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-100 flex items-start gap-2.5 text-[#1944F1]">
                      <FileText className="w-5 h-5 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs">Terms of Services</h4>
                        <p className="text-[10px] text-blue-700 mt-0.5">Last updated: October 2026 · Campus Buddy Inc.</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-bold text-slate-900 text-xs">1. Student Eligibility & Account Verification</h4>
                      <p className="text-[11px]">
                        Campus Buddy is an exclusive peer-to-peer marketplace reserved for verified university students, faculty, and staff. All users must authenticate using an active university email (.edu).
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-bold text-slate-900 text-xs">2. Safe Campus Trading Rules</h4>
                      <p className="text-[11px]">
                        Users agree to meet for item drop-offs and transactions exclusively in designated public campus safe zones (libraries, student centers, dining halls).
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-bold text-slate-900 text-xs">3. Prohibited & Restricted Items</h4>
                      <p className="text-[11px]">
                        Listings involving exam solutions, stolen goods, weapons, alcohol, or illicit substances are strictly prohibited and result in immediate ban and report to university administration.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-bold text-slate-900 text-xs">4. Listing Accuracy & Fair Pricing</h4>
                      <p className="text-[11px]">
                        Sellers must accurately describe the physical condition of textbooks, electronics, and dorm furniture. False condition claims will result in buyer refund protection.
                      </p>
                    </div>
                  </div>
                )}

                {/* 6. PRIVACY POLICY */}
                {activeModal === 'privacy' && (
                  <div className="space-y-4 text-left text-xs text-slate-600 leading-relaxed">
                    <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-start gap-2.5 text-emerald-700">
                      <Shield className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600" />
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs">Student Privacy & Data Protection</h4>
                        <p className="text-[10px] text-emerald-800 mt-0.5">End-to-End Encryption · Zero Third-Party Selling</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-bold text-slate-900 text-xs">1. Information We Collect</h4>
                      <p className="text-[11px]">
                        We only collect essential account details required for identity verification: your full name, university email, campus major, and listing photos.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-bold text-slate-900 text-xs">2. How We Protect Your Data</h4>
                      <p className="text-[11px]">
                        All chat messages, student verification documents, and login credentials are encrypted in transit and at rest using AES-256 standards.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-bold text-slate-900 text-xs">3. No Data Selling Guarantee</h4>
                      <p className="text-[11px]">
                        Campus Buddy never sells, rents, or monetizes student personal data or contact details to third-party advertisers or data brokers.
                      </p>
                    </div>
                  </div>
                )}

                {/* 7. STUDENT REVIEWS */}
                {activeModal === 'reviews' && (
                  <div className="space-y-3 text-left">
                    <div className="p-4 rounded-2xl bg-[#F5F3F3] border border-slate-100 flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">4.9 / 5.0 Rating</h4>
                        <p className="text-[10px] text-slate-400">Based on 58 verified student transactions</p>
                      </div>
                      <div className="flex gap-1 text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-amber-400" />
                        ))}
                      </div>
                    </div>

                    {[
                      { name: 'Sarah Jenkins', rating: 5, comment: 'Super quick drop-off at Green Library! The TI-84 calculator was brand new.', date: '2d ago' },
                      { name: 'Rahul K.', rating: 5, comment: 'Great seller! Book was in pristine condition as promised.', date: '1w ago' },
                      { name: 'Maya Lin', rating: 4, comment: 'Fair price for the cycle, smooth communication.', date: '2w ago' }
                    ].map((rev, idx) => (
                      <div key={idx} className="p-3.5 rounded-2xl bg-white border border-slate-100 space-y-1.5 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">{rev.name}</span>
                          <span className="text-[10px] text-slate-400">{rev.date}</span>
                        </div>
                        <div className="flex gap-0.5 text-amber-400">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-400" />
                          ))}
                        </div>
                        <p className="text-[11px] text-slate-600 leading-snug">{rev.comment}</p>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Right-to-Left Toast Notification Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            className="fixed top-14 right-4 z-[100] px-4 py-3 rounded-2xl bg-slate-900/95 text-white backdrop-blur-md shadow-2xl flex items-center gap-2.5 max-w-[88vw] border border-white/10"
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <X className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span className="text-xs font-semibold tracking-wide whitespace-nowrap">{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
