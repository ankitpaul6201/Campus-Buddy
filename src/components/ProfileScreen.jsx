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
  Sparkles
} from 'lucide-react';

export default function ProfileScreen({ user, activeNav, setActiveNav, onNavigateBack, onLogout }) {
  const [favorites, setFavorites] = useState(['card-2']);
  const [showWishlistModal, setShowWishlistModal] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'purchases', 'verification', 'security', 'support', 'terms', 'privacy', 'reviews'
  const [faqOpen, setFaqOpen] = useState(0);

  // Security Form State
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [passSavedMessage, setPassSavedMessage] = useState(false);

  const products = [
    { id: 'card-1', title: 'Engineering Mathematics Vol 2', price: '$45', sellerName: 'Rahul', image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80' },
    { id: 'card-2', title: 'TI-84 Plus CE Graphing Calculator', price: '$80', sellerName: 'Sarah', image: 'https://images.unsplash.com/photo-1611125832047-1d7ad1e8e48b?auto=format&fit=crop&w=600&q=80' }
  ];

  const wishlistedProducts = products.filter(p => favorites.includes(p.id));
  const uploadedHeartPath = "M2 9.1371C2 14 6.01943 16.5914 8.96173 18.9109C10 19.7294 11 20.5 12 20.5C13 20.5 14 19.7294 15.0383 18.9109C17.9806 16.5914 22 14 22 9.1371C22 4.27416 16.4998 0.825464 12 5.50063C7.50016 0.825464 2 4.27416 2 9.1371Z";

  const primaryColor = '#1944F1';
  const inactiveColor = '#94A3B8';

  const handlePasswordSave = (e) => {
    e.preventDefault();
    setPassSavedMessage(true);
    setCurrentPass('');
    setNewPass('');
    setTimeout(() => setPassSavedMessage(false), 3000);
  };

  const menuItems = [
    {
      id: 'wishlist',
      label: 'Saved Wishlist Items',
      sublabel: 'View products you saved',
      icon: Heart,
      bgColor: 'bg-[#3B72FF]/10 text-[#3B72FF]',
      badge: `${favorites.length} saved`,
      badgeColor: 'bg-blue-50 text-[#1944F1] border-blue-100',
      action: () => setActiveNav && setActiveNav('wishlist')
    },
    {
      id: 'purchases',
      label: 'Sales & Order History',
      sublabel: '12 items completed on campus',
      icon: PackageCheck,
      bgColor: 'bg-[#20BF9B]/15 text-[#20BF9B]',
      badge: '12 items',
      badgeColor: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      action: () => setActiveModal('purchases')
    },
    {
      id: 'verification',
      label: 'Student ID Verification',
      sublabel: 'Stanford University student',
      icon: ShieldCheck,
      bgColor: 'bg-[#F45CB0]/15 text-[#F45CB0]',
      status: 'Verified',
      statusColor: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      action: () => setActiveModal('verification')
    },
    {
      id: 'myads',
      label: 'My Active Listings',
      sublabel: 'Manage items currently for sale',
      icon: Tag,
      bgColor: 'bg-[#8C43D4]/15 text-[#8C43D4]',
      badge: '3 active',
      badgeColor: 'bg-purple-50 text-purple-600 border-purple-100',
      action: () => setActiveNav && setActiveNav('myads')
    },
    {
      id: 'security',
      label: 'Password & Security',
      sublabel: 'Account login & privacy settings',
      icon: Lock,
      bgColor: 'bg-[#F59E0B]/15 text-[#D97706]',
      action: () => setActiveModal('security')
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
      label: 'Terms of Service & Conditions',
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
              <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-rose-400 ring-2 ring-[#1944F1]" />
            </button>
          </div>

          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {user?.fullName || "Alex Rivera"}
            </h1>
            <p className="text-xs text-blue-100/90 font-medium">
              Computer Science • Class of 2026
            </p>
            <p className="text-[11px] text-blue-200/70 font-normal">
              Stanford University • alex.rivera@stanford.edu
            </p>
          </div>
        </div>

        {/* Profile Avatar Card */}
        <div className="flex justify-center -mt-12 mb-4 relative z-10">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-white bg-slate-200 overflow-hidden shadow-xl">
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80" 
                alt="Profile Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="absolute bottom-0 right-0 bg-[#1944F1] text-white p-1 rounded-full border-2 border-white shadow-md" title="Verified Student">
              <CheckCircle2 className="w-4 h-4 fill-[#1944F1] text-white" />
            </div>
          </div>
        </div>

        {/* 3 Metric Cards Row (Clickable) */}
        <div className="px-5 mb-5">
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex items-center justify-around text-center">
            
            <button 
              onClick={() => setActiveModal('purchases')}
              className="flex-1 space-y-0.5 hover:bg-slate-50 p-2 rounded-2xl transition-colors text-center"
            >
              <div className="text-lg font-bold text-slate-900 font-sans">12</div>
              <div className="text-[11px] font-medium text-slate-400">Items Sold</div>
            </button>

            <div className="w-px h-8 bg-slate-100" />

            <button 
              onClick={() => setActiveNav && setActiveNav('myads')}
              className="flex-1 space-y-0.5 hover:bg-slate-50 p-2 rounded-2xl transition-colors text-center"
            >
              <div className="text-lg font-bold text-slate-900 font-sans">3</div>
              <div className="text-[11px] font-medium text-slate-400">Active Ads</div>
            </button>

            <div className="w-px h-8 bg-slate-100" />

            <button 
              onClick={() => setActiveModal('reviews')}
              className="flex-1 space-y-0.5 hover:bg-slate-50 p-2 rounded-2xl transition-colors text-center"
            >
              <div className="text-lg font-bold text-slate-900 font-sans flex items-center justify-center gap-1">
                4.9 <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 inline" />
              </div>
              <div className="text-[11px] font-medium text-slate-400">58 Reviews</div>
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
            onClick={() => setActiveModal(null)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex flex-col justify-end"
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-white rounded-t-[36px] max-h-[88%] flex flex-col justify-between overflow-hidden shadow-2xl"
            >
              {/* Modal Drag Header */}
              <div className="pt-3 pb-2 px-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-20">
                <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto absolute left-1/2 -translate-x-1/2 top-2.5" />
                
                <h2 className="text-base font-bold text-slate-900 font-sans pt-3">
                  {activeModal === 'purchases' && 'Sales & Order History'}
                  {activeModal === 'verification' && 'Student ID Verification'}
                  {activeModal === 'security' && 'Password & Security'}
                  {activeModal === 'support' && 'Help & Campus Support'}
                  {activeModal === 'terms' && 'Terms of Service & Conditions'}
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
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                
                {/* 1. SALES & ORDER HISTORY */}
                {activeModal === 'purchases' && (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-500">
                      Your completed sales and purchased textbook/dorm items on campus.
                    </p>
                    {[
                      { title: 'Hercules Campus Cycle', price: '$120', date: 'Yesterday', status: 'SOLD', buyer: 'Karan M.', bg: 'bg-emerald-50 text-emerald-600' },
                      { title: 'Organic Chemistry Model Kit', price: '$30', date: 'Jul 24', status: 'SOLD', buyer: 'Jessica P.', bg: 'bg-emerald-50 text-emerald-600' },
                      { title: 'Dorm Mini Fridge 3.2 Cu Ft', price: '$65', date: 'Jul 18', status: 'BOUGHT', buyer: 'Dorm Drop-off', bg: 'bg-blue-50 text-[#1944F1]' },
                      { title: 'MacBook Air M1 Sleeve', price: '$18', date: 'Jul 10', status: 'SOLD', buyer: 'Alex T.', bg: 'bg-emerald-50 text-emerald-600' }
                    ].map((order, idx) => (
                      <div key={idx} className="p-3.5 rounded-2xl bg-[#F5F3F3] border border-slate-100 flex items-center justify-between">
                        <div className="space-y-0.5">
                          <h4 className="text-xs font-bold text-slate-900">{order.title}</h4>
                          <p className="text-[10px] text-slate-400">Date: {order.date} · {order.buyer}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-extrabold text-slate-900 block">{order.price}</span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${order.bg}`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 2. STUDENT ID VERIFICATION */}
                {activeModal === 'verification' && (
                  <div className="space-y-4 text-center">
                    <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-600 to-[#1944F1] text-white shadow-lg space-y-3 text-left relative overflow-hidden">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold tracking-widest uppercase text-blue-200">Campus Verified ID</span>
                        <ShieldCheck className="w-6 h-6 text-emerald-300" />
                      </div>
                      <div>
                        <h3 className="text-lg font-extrabold text-white">Alex Rivera</h3>
                        <p className="text-xs text-blue-100">Stanford University</p>
                        <p className="text-[10px] text-blue-200 opacity-80 mt-1">ID: STF-88492026 · CS Dept</p>
                      </div>
                      <div className="pt-2 border-t border-white/20 flex items-center justify-between text-[10px] text-blue-100">
                        <span>Issued: Sep 2024</span>
                        <span className="bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded-full font-bold">STATUS: VERIFIED</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-left flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="text-xs space-y-1">
                        <h4 className="font-bold text-emerald-900">Your account is fully verified</h4>
                        <p className="text-emerald-700 leading-snug">
                          Your .edu email and student card have been authenticated. Buyers see your verified badge on all listings.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. PASSWORD & SECURITY */}
                {activeModal === 'security' && (
                  <form onSubmit={handlePasswordSave} className="space-y-4 text-left">
                    {passSavedMessage && (
                      <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600" />
                        Password and security settings updated!
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Current Password</label>
                      <input 
                        type="password" 
                        value={currentPass}
                        onChange={(e) => setCurrentPass(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-2.5 rounded-2xl bg-[#F5F3F3] text-slate-900 text-xs border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1944F1]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">New Password</label>
                      <input 
                        type="password" 
                        value={newPass}
                        onChange={(e) => setNewPass(e.target.value)}
                        placeholder="Min 8 chars, 1 number"
                        className="w-full px-4 py-2.5 rounded-2xl bg-[#F5F3F3] text-slate-900 text-xs border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1944F1]"
                      />
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">2-Factor Authentication</h4>
                        <p className="text-[10px] text-slate-400">Require OTP for login from new devices</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                        className={`w-11 h-6 rounded-full transition-colors p-1 flex items-center ${
                          twoFactorEnabled ? 'bg-[#1944F1] justify-end' : 'bg-slate-300 justify-start'
                        }`}
                      >
                        <span className="w-4 h-4 rounded-full bg-white shadow-sm block" />
                      </button>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 rounded-full bg-[#1944F1] text-white font-bold text-xs shadow-md hover:bg-blue-700 transition-colors"
                    >
                      Save Security Preferences
                    </button>
                  </form>
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
                        href="mailto:support@campusbuddy.edu"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
                      >
                        <Mail className="w-4 h-4" />
                        Email Campus Support Team
                      </a>
                    </div>
                  </div>
                )}

                {/* 5. TERMS OF SERVICE & CONDITIONS */}
                {activeModal === 'terms' && (
                  <div className="space-y-4 text-left text-xs text-slate-600 leading-relaxed">
                    <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-100 flex items-start gap-2.5 text-[#1944F1]">
                      <FileText className="w-5 h-5 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs">Terms of Service & Conditions</h4>
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
    </motion.div>
  );
}
