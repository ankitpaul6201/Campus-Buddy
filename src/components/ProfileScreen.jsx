import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  ChevronRight, 
  ChevronDown,
  Heart,
  PackageCheck,
  ShieldCheck,
  Lock,
  X,
  Trash2,
  CheckCircle2,
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
  Calendar as CalendarIcon,
  Upload,
  Eye,
  EyeOff,
  ArrowLeft
} from 'lucide-react';
import { uploadStudentId, apiUpdateProfile, apiUpdatePassword, formatRupeePrice, getSellerRatings, apiDeleteAccount } from '../lib/api';
import { Calendar } from './ui/calendar';
const defaultAvatar = '/avatar-blue-2.svg';

const ACADEMIC_YEAR_OPTIONS = [
  { value: '1st Year', label: '1st Year (Freshman)' },
  { value: '2nd Year', label: '2nd Year (Sophomore)' },
  { value: '3rd Year', label: '3rd Year (Junior)' },
  { value: '4th Year', label: '4th Year (Senior)' },
  { value: "Postgraduate / Master's", label: "Postgraduate / Master's" },
  { value: 'Ph.D. Scholar', label: 'Ph.D. Scholar' }
];

// Exact Clickons SVGs for Profile List Items (Matching Clickons Design System)
function ClickonsHatIcon({ className = "w-5 h-5" }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M22 7.73684L13.8 3.44875C12.7 2.85042 11.3 2.85042 10.2 3.44875L2 7.73684C1.4 8.03601 1 8.73407 1 9.43213C1 10.1302 1.4 10.7285 2 11.1274L4.4 12.4238V15.9141C4.4 17.0111 5 18.0083 6 18.5069L10.3 20.7008C10.8 20.9003 11.4 21 12 21C12.6 21 13.2 20.9003 13.7 20.6011L18 18.4072C19 17.9086 19.6 16.9114 19.6 15.8144V14.7175C19.6 14.1191 19.2 13.7202 18.6 13.7202C18 13.7202 17.6 14.1191 17.6 14.7175V15.8144C17.6 16.1136 17.4 16.5125 17.1 16.6122L12.8 18.8061C12.3 19.1053 11.7 19.1053 11.2 18.8061L6.9 16.6122C6.6 16.4127 6.4 16.1136 6.4 15.8144V13.4211L10.2 15.4155C10.8 15.7147 11.4 15.8144 12 15.8144C12.6 15.8144 13.2 15.7147 13.8 15.4155L22 11.1274C22.6 10.8283 23 10.1302 23 9.43213C23 8.73407 22.6 8.13573 22 7.73684ZM12.9 13.6205C12.4 13.9197 11.7 13.9197 11.1 13.6205L3.1 9.43213L11.1 5.24377C11.7 4.9446 12.3 4.9446 12.9 5.24377L20.9 9.43213L12.9 13.6205Z" fill="currentColor"/>
    </svg>
  );
}

function ClickonsTagIcon({ className = "w-5 h-5" }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path fillRule="evenodd" clipRule="evenodd" d="M11.8284 2.82843C11.0783 2.07828 10.0609 1.65685 9 1.65685H4C2.70557 1.65685 1.65685 2.70557 1.65685 4V9C1.65685 10.0609 2.07828 11.0783 2.82843 11.8284L12.8284 21.8284C14.3905 23.3905 16.9231 23.3905 18.4853 21.8284L21.8284 18.4853C23.3905 16.9231 23.3905 14.3905 21.8284 12.8284L11.8284 2.82843ZM4 3.65685C3.81057 3.65685 3.65685 3.81057 3.65685 4V9C3.65685 9.53043 3.86755 10.0391 4.24264 10.4142L14.2426 20.4142C15.0237 21.1953 16.29 21.1953 17.0711 20.4142L20.4142 17.0711C21.1953 16.29 21.1953 15.0237 20.4142 14.2426L10.4142 4.24264C10.0391 3.86755 9.53043 3.65685 9 3.65685H4ZM7 8C7.55228 8 8 7.55228 8 7C8 6.44772 7.55228 6 7 6C6.44772 6 6 6.44772 6 7C6 7.55228 6.44772 8 7 8ZM7 9.8C8.54639 9.8 9.8 8.54639 9.8 7C9.8 5.45361 8.54639 4.2 7 4.2C5.45361 4.2 4.2 5.45361 4.2 7C4.2 8.54639 5.45361 9.8 7 9.8Z" fill="currentColor"/>
    </svg>
  );
}

function ClickonsAskIcon({ className = "w-5 h-5" }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4ZM2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12ZM12 7.8C10.8523 7.8 10 8.65229 10 9.8C10 10.3523 9.55228 10.8 9 10.8C8.44772 10.8 8 10.3523 8 9.8C8 7.54772 9.74771 5.8 12 5.8C14.2523 5.8 16 7.54772 16 9.8C16 11.7055 14.7491 13.2498 13 13.6802V13.7C13 14.2523 12.5523 14.7 12 14.7C11.4477 14.7 11 14.2523 11 13.7V12.8C11 12.2477 11.4477 11.8 12 11.8C13.1477 11.8 14 10.9477 14 9.8C14 8.65229 13.1477 7.8 12 7.8ZM12 15.3C12.5523 15.3 13 15.7477 13 16.3V17.2C13 17.7523 12.5523 18.2 12 18.2C11.4477 18.2 11 17.7523 11 17.2V16.3C11 15.7477 11.4477 15.3 12 15.3Z" fillRule="evenodd" clipRule="evenodd" fill="currentColor"/>
    </svg>
  );
}

function ClickonsFileIcon({ className = "w-5 h-5" }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M4 5.4C4 3.59835 5.40423 2 7.31339 2H12.3425C13.3927 2 14.4567 2.39181 15.2604 3.19084L15.2701 3.2005L18.8866 6.89605C19.6883 7.6965 20.0956 8.86897 19.9809 9.95712V18.6C19.9809 20.4017 18.5767 22 16.6675 22H7.31339C5.40423 22 4 20.4017 4 18.6V5.4ZM7.31339 4C6.60742 4 6 4.60165 6 5.4V18.6C6 19.3983 6.60742 20 7.31339 20H16.6675C17.3735 20 17.9809 19.3983 17.9809 18.6V9.9C17.9809 9.8583 17.9835 9.81663 17.9888 9.77525C18.0504 9.28456 17.8563 8.69202 17.4712 8.30916L17.4615 8.2995L13.8459 4.60483C13.443 4.20669 12.8996 4 12.3425 4H7.31339Z" fillRule="evenodd" clipRule="evenodd" fill="currentColor"/>
    </svg>
  );
}

function ClickonsSecureIcon({ className = "w-5 h-5" }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M10.1844 1.38605C11.3407 0.871316 12.6335 0.871316 13.7899 1.38605L13.8074 1.39407L19.99 4.29045C19.9979 4.29415 20.0057 4.29795 20.0135 4.30186C21.3986 4.99548 22.2194 6.51976 21.9487 8.15385C21.4347 11.3441 19.8781 17.6329 14.1082 22.256L14.0975 22.2646L14.0975 22.2645C12.8386 23.2452 11.1356 23.2452 9.87682 22.2645L9.86601 22.2561L9.86607 22.256C4.09472 17.6317 2.53882 11.341 2.02519 8.1515C2.02153 8.12874 2.01865 8.10586 2.01657 8.0829C1.88847 6.67157 2.5178 5.00836 4.08546 4.28974L10.1612 1.39675C10.1689 1.39309 10.1766 1.38952 10.1844 1.38605ZM11.0085 3.20845L4.93816 6.09888L4.92259 6.10613C4.31095 6.38458 3.94713 7.0992 4.00575 7.8706C4.49497 10.8818 5.93918 16.5433 11.1107 20.6905C11.6446 21.1032 12.3297 21.1032 12.8636 20.6905C18.0564 16.5262 19.4911 10.8351 19.9745 7.83352L19.9754 7.82836C20.1014 7.0708 19.7307 6.40246 19.1282 6.09534L12.9684 3.20961C12.3356 2.93052 11.6415 2.93013 11.0085 3.20845Z" fillRule="evenodd" clipRule="evenodd" fill="currentColor"/>
      <path d="M16.5989 7.19918C17.0412 7.52994 17.1316 8.15662 16.8008 8.5989L12.3136 14.5989C12.1257 14.8501 11.8309 14.9986 11.5171 15C11.2034 15.0013 10.9073 14.8554 10.7172 14.6058L8.20439 11.3058C7.86981 10.8664 7.95477 10.239 8.39417 9.9044C8.83357 9.56981 9.46101 9.65478 9.79559 10.0942L11.5056 12.3399L15.1992 7.40109C15.5299 6.95881 16.1566 6.86841 16.5989 7.19918Z" fillRule="evenodd" clipRule="evenodd" fill="currentColor"/>
    </svg>
  );
}

function ClickonsLogoutIcon({ className = "w-5 h-5" }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path fillRule="evenodd" clipRule="evenodd" d="M3 5.4C3 3.59835 4.40423 2 6.31339 2H11C11.5523 2 12 2.44772 12 3C12 3.55228 11.5523 4 11 4H6.31339C5.60742 4 5 4.60165 5 5.4V18.6C5 19.3983 5.60742 20 6.31339 20H11C11.5523 20 12 20.4477 12 21C12 21.5523 11.5523 22 11 22H6.31339C4.40423 22 3 20.4017 3 18.6V5.4ZM15.2929 7.29289C15.6834 6.90237 16.3166 6.90237 16.7071 7.29289L20.7071 11.2929C21.0976 11.6834 21.0976 12.3166 21.7071 12.7071L16.7071 16.7071C16.3166 17.0976 15.6834 17.0976 15.2929 16.7071C14.9024 16.3166 14.9024 15.6834 15.2929 15.2929L17.5858 13H9C8.44772 13 8 12.5523 8 12C8 11.4477 8.44772 11 9 11H17.5858L15.2929 8.70711C14.9024 8.31658 14.9024 7.68342 15.2929 7.29289Z" fill="currentColor"/>
    </svg>
  );
}

// Campus Buddy Profile Screen with default avatar and student info
export default function ProfileScreen({ user, activeNav, setActiveNav, favorites = [], notifications = [], userAds = [], onUpdateUser, onNavigateBack, onLogout, canGoBack = false }) {
  const [showWishlistModal, setShowWishlistModal] = useState(false);
  const [showDobCalendar, setShowDobCalendar] = useState(false);
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'edit_profile', 'purchases', 'verification', 'security', 'support', 'terms', 'privacy', 'reviews'
  const [faqOpen, setFaqOpen] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const yearDropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (yearDropdownRef.current && !yearDropdownRef.current.contains(event.target)) {
        setIsYearDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Derived verification state
  const isUserVerified = Boolean(
    user?.isVerified ||
    user?.publicMetadata?.isVerified ||
    localStorage.getItem('user_id_verified') === 'true'
  );

  // Saved Profile State (Committed source of truth)
  const [savedProfile, setSavedProfile] = useState(() => ({
    fullName: user?.fullName || user?.name || localStorage.getItem('user_custom_fullname') || '',
    dob: user?.dob || localStorage.getItem('user_dob') || '',
    course: user?.course || localStorage.getItem('user_course') || '',
    year: user?.year || localStorage.getItem('user_year') || '1st Year',
    phone: user?.phone || localStorage.getItem('user_phone') || '',
    avatar: (user?.avatar && user.avatar !== '/avatar.svg' ? user.avatar : null) || localStorage.getItem('user_custom_avatar') || user?.avatar || null
  }));

  // Sync savedProfile when user prop updates from DB
  useEffect(() => {
    if (user) {
      setSavedProfile({
        fullName: user?.fullName || user?.name || localStorage.getItem('user_custom_fullname') || '',
        dob: user?.dob || localStorage.getItem('user_dob') || '',
        course: user?.course || localStorage.getItem('user_course') || '',
        year: user?.year || localStorage.getItem('user_year') || '1st Year',
        phone: user?.phone || localStorage.getItem('user_phone') || '',
        avatar: (user?.avatar && user.avatar !== '/avatar.svg' ? user.avatar : null) || localStorage.getItem('user_custom_avatar') || user?.avatar || null
      });
      if (user?.avatar && user.avatar !== '/avatar.svg') {
        localStorage.setItem('user_custom_avatar', user.avatar);
      }
    }
  }, [user]);

  // Draft Edit Form State (local to modal, never saved unless clicking Save Changes)
  const [draftName, setDraftName] = useState(savedProfile.fullName);
  const [draftDob, setDraftDob] = useState(savedProfile.dob);
  const [draftCourse, setDraftCourse] = useState(savedProfile.course);
  const [draftYear, setDraftYear] = useState(savedProfile.year);
  const [draftPhone, setDraftPhone] = useState(savedProfile.phone);
  const [draftAvatar, setDraftAvatar] = useState(savedProfile.avatar);
  const [profileSavedMessage, setProfileSavedMessage] = useState(false);

  // When modal opens, initialize drafts to savedProfile; if user closes without saving, drafts are discarded!
  useEffect(() => {
    if (activeModal === 'student_info' || activeModal === 'edit_profile') {
      setDraftName(savedProfile.fullName);
      setDraftDob(savedProfile.dob);
      setDraftCourse(savedProfile.course);
      setDraftYear(savedProfile.year);
      setDraftPhone(savedProfile.phone);
      setDraftAvatar(savedProfile.avatar);
      setShowDobCalendar(false);
      setIsYearDropdownOpen(false);
      setProfileSavedMessage(false);
    }
  }, [activeModal, savedProfile]);

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

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    try {
      await apiDeleteAccount();
      setShowDeleteModal(false);
      showToast('Account permanently deleted', 'success');
      setTimeout(() => {
        if (onLogout) onLogout();
        else window.location.reload();
      }, 1200);
    } catch (err) {
      showToast(err.message || 'Failed to delete account', 'error');
      setIsDeletingAccount(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Only set preview in draft - DO NOT save until user clicks Save Changes!
        setDraftAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const calculateAge = (dobString) => {
    if (!dobString) return null;
    const dob = new Date(dobString);
    if (isNaN(dob.getTime())) return null;
    const diff_ms = Date.now() - dob.getTime();
    const age_dt = new Date(diff_ms);
    return Math.abs(age_dt.getUTCFullYear() - 1970);
  };

  const formatDisplayDob = (dobString) => {
    if (!dobString) return 'Select your date of birth';
    try {
      const parts = String(dobString).split('-');
      if (parts.length === 3) {
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        if (!isNaN(d.getTime())) {
          return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }
      }
      const d = new Date(dobString);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
      return dobString;
    } catch {
      return dobString;
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    const phoneDigits = (draftPhone || '').replace(/\D/g, '');
    if (!phoneDigits || phoneDigits.length !== 10) {
      showToast("Phone number must have exactly 10 digits", "error");
      return;
    }

    try {
      const finalName = draftName.trim() || savedProfile.fullName;
      const finalDob = draftDob;
      const finalCourse = draftCourse;
      const finalYear = draftYear;
      const finalPhone = phoneDigits;
      const finalAvatar = draftAvatar || savedProfile.avatar;

      // 1. Commit to localStorage
      if (finalName) localStorage.setItem('user_custom_fullname', finalName);
      if (finalDob) localStorage.setItem('user_dob', finalDob);
      if (finalCourse) localStorage.setItem('user_course', finalCourse);
      if (finalYear) localStorage.setItem('user_year', finalYear);
      if (finalPhone) localStorage.setItem('user_phone', finalPhone);
      if (finalAvatar) localStorage.setItem('user_custom_avatar', finalAvatar);

      // 2. Commit to savedProfile state (now the main screen updates!)
      setSavedProfile({
        fullName: finalName,
        dob: finalDob,
        course: finalCourse,
        year: finalYear,
        phone: finalPhone,
        avatar: finalAvatar
      });

      // 3. Persist to API
      const result = await apiUpdateProfile({
        fullName: finalName,
        phone: finalPhone,
        ...(finalAvatar ? { avatar: finalAvatar } : {})
      });

      if (result?.user?.avatar) {
        setSavedProfile(prev => ({ ...prev, avatar: result.user.avatar }));
        localStorage.setItem('user_custom_avatar', result.user.avatar);
      }

      if (result?.user && onUpdateUser) {
        onUpdateUser(result.user);
      }

      setProfileSavedMessage(true);
      showToast("Profile changes saved successfully!", "success");
      setTimeout(() => {
        setProfileSavedMessage(false);
        setActiveModal(null);
      }, 900);
    } catch (err) {
      console.error("Error saving profile changes:", err);
      showToast("Failed to save changes. Please try again.", "error");
    }
  };

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
      id: 'student_info',
      label: 'Student Information',
      sublabel: user?.universityName || 'Campus & Academic Details',
      icon: ClickonsHatIcon,
      bgColor: 'bg-blue-500/15 text-[#1944F1]',
      action: () => setActiveModal('student_info')
    },
    {
      id: 'myads',
      label: 'My Active Listings',
      sublabel: 'Manage items currently for sale',
      icon: ClickonsTagIcon,
      bgColor: 'bg-[#8C43D4]/15 text-[#8C43D4]',
      action: () => setActiveNav && setActiveNav('myads')
    },
    {
      id: 'support',
      label: 'Help & Campus Support',
      sublabel: 'FAQs & campus safety rules',
      icon: ClickonsAskIcon,
      bgColor: 'bg-[#06B6D4]/15 text-[#0891B2]',
      action: () => setActiveModal('support')
    },
    {
      id: 'terms',
      label: 'Terms of Services',
      sublabel: 'Marketplace rules & student safety guidelines',
      icon: ClickonsFileIcon,
      bgColor: 'bg-[#6366F1]/15 text-[#4F46E5]',
      action: () => setActiveModal('terms')
    },
    {
      id: 'privacy',
      label: 'Privacy Policy',
      sublabel: 'Data protection & security commitments',
      icon: ClickonsSecureIcon,
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
      className="profile-screen w-full h-full bg-[#F4F6FB] text-slate-900 flex flex-col justify-between overflow-hidden font-sans select-none relative"
    >
      <div className="flex-1 overflow-y-auto pb-28 no-scrollbar">
        
        {/* Top Header Banner Card - BROUGHT DOWN CLEANLY WITH TOP SAFE PADDING */}
        <div className="relative bg-gradient-to-b from-[#1944F1] to-[#0D30BA] text-white rounded-b-[44px] pt-14 pb-16 px-6 shadow-md flex flex-col items-center">
          {/* Top Bar Icons */}
          <div className="w-full flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
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
            </div>

            {/* Bell Notifications Icon Button */}
            <button 
              onClick={() => setActiveNav && setActiveNav('notifications')}
              className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 flex items-center justify-center text-white shadow-xs transition-all active:scale-95 relative shrink-0"
              title="Notifications"
            >
              <img src="/bell-svgrepo-com.svg" alt="Notifications" className="w-[22px] h-[22px] object-contain filter brightness-0 invert opacity-90" />
              {notifications.filter(n => n.read === false || (n.unread === true && n.read !== true)).length > 0 && (
                <span className="absolute -top-1 -right-1 w-4.5 h-4.5 min-w-[18px] min-h-[18px] max-w-[18px] max-h-[18px] rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-xs">
                  {notifications.filter(n => n.read === false || (n.unread === true && n.read !== true)).length > 9 
                    ? '9+' 
                    : notifications.filter(n => n.read === false || (n.unread === true && n.read !== true)).length}
                </span>
              )}
            </button>
          </div>

          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {savedProfile.fullName || user?.fullName || user?.name || "Student"}
            </h1>
            <p className="text-xs text-blue-100/90 font-medium">
              {user?.universityName || "Campus Member"}
            </p>
          </div>
        </div>

        {/* Profile Avatar Card */}
        <div className="flex justify-center -mt-12 mb-4 relative z-10">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-white bg-slate-100 overflow-hidden shadow-xl flex items-center justify-center select-none">
              <img 
                src={savedProfile.avatar || (user?.avatar && !['/avatar.svg', '/avatar-blue.svg'].includes(user.avatar) ? user.avatar : defaultAvatar)} 
                alt="Profile Avatar"
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.src = defaultAvatar; }}
              />
            </div>
            
            {isUserVerified && (
              <div className="absolute bottom-0 right-0 rounded-full border-2 border-white shadow-md flex items-center justify-center bg-white overflow-hidden ring-2 ring-emerald-500/20" title="ID Verified">
                <svg 
                  viewBox="0 0 191.667 191.667" 
                  className="w-5 h-5 text-emerald-500 fill-current"
                >
                  <path d="M95.833,0C42.991,0,0,42.99,0,95.833s42.991,95.834,95.833,95.834s95.833-42.991,95.833-95.834S148.676,0,95.833,0z M150.862,79.646l-60.207,60.207c-2.56,2.56-5.963,3.969-9.583,3.969c-3.62,0-7.023-1.409-9.583-3.969l-30.685-30.685 c-2.56-2.56-3.97-5.963-3.97-9.583c0-3.621,1.41-7.024,3.97-9.584c2.559-2.56,5.962-3.97,9.583-3.97c3.62,0,7.024,1.41,9.583,3.971 l21.101,21.1l50.623-50.623c2.56-2.56,5.963-3.969,9.583-3.969c3.62,0,7.023,1.409,9.583,3.969 C156.146,65.765,156.146,74.362,150.862,79.646z"/>
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* 3 Metric Cards Row (Clickable) */}
        <div className="px-5 mb-5">
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex items-center justify-around text-center">
            
            <div className="flex-1 space-y-0.5 p-2 rounded-2xl text-center select-none">
              <div className="text-lg font-bold text-slate-900 font-sans">
                {userAds ? userAds.filter(a => a.status === 'sold').length : 0}
              </div>
              <div className="text-[11px] font-medium text-slate-400">Items Sold</div>
            </div>

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
              onClick={() => setShowLogoutModal(true)}
              className="w-full mt-4 bg-rose-50/80 hover:bg-rose-100/80 text-rose-600 rounded-2xl p-3.5 px-4 flex items-center justify-between border border-rose-100 transition-all active:scale-[0.99] group text-left"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-500 flex items-center justify-center shrink-0">
                  <ClickonsLogoutIcon className="w-5 h-5" />
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

          {/* Permanent Account Deletion Option */}
          {user && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="w-full mt-2.5 bg-slate-50 hover:bg-rose-50/60 text-slate-500 hover:text-rose-600 rounded-2xl p-3 px-4 flex items-center justify-between border border-slate-100 hover:border-rose-100 transition-all active:scale-[0.99] group text-left"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-rose-100 group-hover:text-rose-600 text-slate-400 flex items-center justify-center shrink-0 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold block leading-tight">
                    Delete Student Account
                  </span>
                  <span className="text-[10px] text-slate-400 group-hover:text-rose-400 block leading-tight mt-0.5">
                    Permanently erase account & all listings
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-0.5 transition-transform" />
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
            className="fixed inset-0 bg-slate-900/60 z-[100] flex flex-col justify-end"
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-white rounded-t-[32px] sm:rounded-t-[36px] max-h-[85vh] flex flex-col overflow-hidden shadow-2xl will-change-transform"
            >
              {/* Modal Drag Header */}
              <div className="pt-3 pb-2 px-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-20 shrink-0">
                <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto absolute left-1/2 -translate-x-1/2 top-2.5" />
                
                <h2 className="text-base font-bold text-slate-900 font-sans pt-3">
                  {(activeModal === 'student_info' || activeModal === 'edit_profile') && 'Student Information'}
                  {activeModal === 'purchases' && 'Sales & Order History'}
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
              <div className="flex-1 overflow-y-auto p-6 pb-14 space-y-4">
                
                {/* STUDENT INFORMATION FORM */}
                {(activeModal === 'student_info' || activeModal === 'edit_profile') && (
                  <form onSubmit={handleProfileSave} className="space-y-4 text-left">
                    {profileSavedMessage && (
                      <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Student information saved successfully!</span>
                      </div>
                    )}

                    {/* Profile Picture Upload Picker */}
                    <div className="flex flex-col items-center justify-center space-y-2 py-1">
                      <div className="relative">
                        <div className="w-20 h-20 rounded-full border-2 border-slate-200 bg-slate-100 overflow-hidden flex items-center justify-center shadow-sm">
                          <img 
                            src={draftAvatar || savedProfile.avatar || (user?.avatar && !['/avatar.svg', '/avatar-blue.svg'].includes(user.avatar) ? user.avatar : defaultAvatar)} 
                            alt="Avatar" 
                            className="w-full h-full object-cover" 
                            onError={(e) => { e.currentTarget.src = defaultAvatar; }}
                          />
                        </div>
                        <label className="absolute bottom-0 right-0 p-1.5 bg-[#1944F1] hover:bg-blue-700 text-white rounded-full border border-white shadow-sm cursor-pointer transition-all active:scale-95" title="Update Profile Picture">
                          <Camera className="w-3.5 h-3.5" />
                          <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                        </label>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500">Tap camera to change photo</span>
                    </div>

                    {/* Non-editable: Full Name */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">Full Name</label>
                      <div className="relative flex items-center">
                        <UserPen className="w-4 h-4 text-slate-400 absolute left-4 z-10 pointer-events-none" />
                        <input
                          type="text"
                          value={savedProfile.fullName || user?.fullName || user?.name || 'Student'}
                          readOnly
                          className="w-full pl-11 pr-10 py-3 bg-[#F3F4F6] text-slate-600 font-medium rounded-2xl text-xs border border-transparent cursor-not-allowed select-none focus:outline-none"
                        />
                        <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-4 pointer-events-none" />
                      </div>
                    </div>

                    {/* Non-editable: College / Campus */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">College / Campus</label>
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
                    </div>

                    {/* Non-editable: College Email */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">College Email</label>
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
                    </div>

                    {/* Editable: Date of Birth (DOB) with Calendar */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700">Date of Birth</label>
                        {calculateAge(draftDob) && (
                          <span className="text-[10px] text-[#1944F1] font-semibold bg-blue-50 px-2 py-0.5 rounded-md">
                            {calculateAge(draftDob)} years old
                          </span>
                        )}
                      </div>
                      
                      {/* Trigger selector button */}
                      <button
                        type="button"
                        onClick={() => setShowDobCalendar(!showDobCalendar)}
                        className={`w-full px-4 py-3 bg-[#F3F4F6] hover:bg-[#EAECEF] text-slate-900 rounded-2xl text-xs font-normal text-left relative flex items-center justify-between transition-all ${
                          showDobCalendar ? 'ring-2 ring-[#1944F1] bg-white shadow-2xs' : ''
                        }`}
                      >
                        <span className={draftDob ? 'text-slate-900 font-medium' : 'text-slate-400'}>
                          {formatDisplayDob(draftDob)}
                        </span>
                        <CalendarIcon className={`w-4 h-4 transition-colors shrink-0 ${showDobCalendar ? 'text-[#1944F1]' : 'text-slate-400'}`} />
                      </button>

                      {/* Calendar UI Component */}
                      {showDobCalendar && (
                        <div className="pt-1.5 animate-in fade-in duration-150">
                          <Calendar
                            mode="single"
                            selected={draftDob ? new Date(draftDob) : undefined}
                            onSelect={(selectedDate) => {
                              if (selectedDate) {
                                const year = selectedDate.getFullYear();
                                const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                                const day = String(selectedDate.getDate()).padStart(2, '0');
                                setDraftDob(`${year}-${month}-${day}`);
                              }
                            }}
                            className="rounded-2xl border border-slate-200/90 shadow-sm"
                            captionLayout="dropdown"
                          />
                        </div>
                      )}
                    </div>

                    {/* Editable: Phone Number */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Phone Number</label>
                      <div className="relative">
                        <Smartphone className="w-4 h-4 text-slate-400 absolute left-4 top-3.5 z-10 pointer-events-none" />
                        <input
                          type="tel"
                          value={draftPhone}
                          maxLength={10}
                          onChange={(e) => setDraftPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          placeholder="Enter 10-digit Phone Number"
                          className="w-full pl-11 pr-4 py-3 bg-[#F3F4F6] text-slate-900 placeholder-slate-400 rounded-2xl text-xs font-normal focus:outline-none focus:ring-2 focus:ring-[#1944F1] transition-all"
                        />
                      </div>
                    </div>

                    {/* Editable: Course / Major */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Course / Major</label>
                      <div className="relative">
                        <ClickonsHatIcon className="w-4 h-4 text-slate-400 absolute left-4 top-3.5 z-10 pointer-events-none" />
                        <input
                          type="text"
                          value={draftCourse}
                          onChange={(e) => setDraftCourse(e.target.value)}
                          placeholder="e.g. B.Tech Computer Science / B.Sc Physics"
                          className="w-full pl-11 pr-4 py-3 bg-[#F3F4F6] text-slate-900 placeholder-slate-400 rounded-2xl text-xs font-normal focus:outline-none focus:ring-2 focus:ring-[#1944F1] transition-all"
                        />
                      </div>
                    </div>

                    {/* Editable: Academic Year with Custom App-Styled Dropdown */}
                    <div className="space-y-1.5 relative" ref={yearDropdownRef}>
                      <label className="text-xs font-bold text-slate-700">Academic Year</label>
                      
                      {/* Trigger button */}
                      <button
                        type="button"
                        onClick={() => setIsYearDropdownOpen(!isYearDropdownOpen)}
                        className={`w-full px-4 py-3 bg-[#F3F4F6] hover:bg-[#EAECEF] text-slate-900 rounded-2xl text-xs font-normal text-left flex items-center justify-between transition-all ${
                          isYearDropdownOpen ? 'ring-2 ring-[#1944F1] bg-white shadow-2xs' : ''
                        }`}
                      >
                        <span className="font-medium text-slate-900">
                          {ACADEMIC_YEAR_OPTIONS.find(opt => opt.value === draftYear || opt.label === draftYear)?.label || draftYear || '1st Year (Freshman)'}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${isYearDropdownOpen ? 'rotate-180 text-[#1944F1]' : ''}`} />
                      </button>

                      {/* Dropdown Menu */}
                      {isYearDropdownOpen && (
                        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl shadow-xl border border-slate-100/90 p-1.5 py-2 z-30 animate-in fade-in zoom-in-95 duration-150">
                          {ACADEMIC_YEAR_OPTIONS.map((opt) => {
                            const isSelected = opt.value === draftYear || opt.label === draftYear;
                            return (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => {
                                  setDraftYear(opt.value);
                                  setIsYearDropdownOpen(false);
                                }}
                                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs flex items-center justify-between transition-colors my-0.5 select-none ${
                                  isSelected
                                    ? 'bg-[#1944F1] text-white font-bold shadow-xs'
                                    : 'text-slate-700 hover:bg-blue-50 hover:text-[#1944F1] font-medium'
                                }`}
                              >
                                <span>{opt.label}</span>
                                {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0 ml-1.5" />}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 px-6 rounded-2xl bg-[#1944F1] hover:bg-blue-700 text-white font-semibold text-xs shadow-md transition-all active:scale-[0.98] mt-3 flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      <span>Save Changes</span>
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
                            <span className="text-xs font-extrabold text-slate-900 block">{formatRupeePrice(ad.price)}</span>
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
                      <ClickonsFileIcon className="w-5 h-5 shrink-0 mt-0.5" />
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
                      <ClickonsSecureIcon className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600" />
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
                {activeModal === 'reviews' && (() => {
                  const myRatings = getSellerRatings(user?.id || user?._id || 'me');
                  return (
                    <div className="space-y-3 text-left">
                      {myRatings.count > 0 ? (
                        <>
                          <div className="p-4 rounded-2xl bg-[#F5F3F3] border border-slate-100 flex items-center justify-between">
                            <div>
                              <h4 className="text-sm font-bold text-slate-900">{myRatings.average} / 5.0 Rating</h4>
                              <p className="text-[10px] text-slate-400">Based on {myRatings.count} verified student {myRatings.count === 1 ? 'review' : 'reviews'}</p>
                            </div>
                            <div className="flex gap-1 text-amber-400">
                              {[...Array(Math.round(myRatings.average))].map((_, i) => (
                                <Star key={i} className="w-4 h-4 fill-amber-400" />
                              ))}
                            </div>
                          </div>

                          {myRatings.reviews.map((rev, idx) => (
                            <div key={rev.id || idx} className="p-3.5 rounded-2xl bg-white border border-slate-100 space-y-1.5 shadow-2xs">
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
                        </>
                      ) : (
                        <div className="py-8 px-4 text-center rounded-2xl bg-[#F5F3F3] border border-slate-100 space-y-1.5">
                          <div className="w-10 h-10 rounded-full bg-white text-slate-400 mx-auto flex items-center justify-center shadow-2xs">
                            <Star className="w-5 h-5 text-slate-300" />
                          </div>
                          <h4 className="text-xs font-bold text-slate-800">No Student Reviews Yet</h4>
                          <p className="text-[11px] text-slate-500 max-w-[240px] mx-auto leading-relaxed">
                            Once fellow campus students purchase your items and rate their experience, verified reviews will appear here.
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })()}

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Log Out Confirmation Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[120] flex items-center justify-center p-4"
            onClick={() => setShowLogoutModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-rose-100 space-y-4 text-left"
            >
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <ClickonsLogoutIcon className="w-6 h-6" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-base font-bold text-slate-900">Log Out of Campus Buddy?</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Are you sure you want to log out? You will need to sign in again to chat, browse your saved items, and manage listings.
                </p>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 py-2.5 rounded-full border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowLogoutModal(false);
                    if (onLogout) onLogout();
                  }}
                  className="flex-1 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
                >
                  Log Out
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Permanent Account Deletion Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[120] flex items-center justify-center p-4"
            onClick={() => !isDeletingAccount && setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-rose-100 space-y-4 text-left"
            >
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-base font-bold text-slate-900">Delete Account Permanently?</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  This action is irreversible. All your listings, active chats, student profile, and stored images will be permanently erased immediately.
                </p>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  disabled={isDeletingAccount}
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-2.5 rounded-full border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeletingAccount}
                  onClick={handleDeleteAccount}
                  className="flex-1 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {isDeletingAccount ? 'Deleting...' : 'Delete My Account'}
                </button>
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
