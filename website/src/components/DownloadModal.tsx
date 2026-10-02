import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, QrCode, ExternalLink } from 'lucide-react';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({ isOpen, onClose }) => {
  // ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleDownloadAPK = () => {
    // Triggers actual apk download or fallback
    const link = document.createElement('a');
    link.href = '/campusbuddy.apk';
    link.download = 'CampusBuddy-v1.0.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-brand-dark/70 backdrop-blur-sm transition-opacity"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 sm:p-8 z-10 my-8 overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-brand-dark flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close download modal"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-brand-blue flex items-center justify-center p-2 shadow-xs">
                <svg viewBox="0 0 1254 1254" className="w-full h-full text-white fill-white">
                  <path d="M 698,801 L 699,948 L 824,948 L 856,916 L 856,833 L 824,801 Z M 724,828 L 812,827 L 830,845 L 830,904 L 813,921 L 725,921 Z M 698,572 L 698,708 L 808,708 L 841,675 L 841,603 L 809,572 Z M 724,600 L 799,599 L 816,615 L 816,662 L 797,682 L 725,682 Z M 374,160 L 263,273 L 263,737 L 372,848 L 550,849 L 550,919 L 510,920 L 510,1082 L 894,1082 L 997,978 L 997,792 L 947,742 L 991,697 L 991,544 L 886,441 L 511,441 L 510,598 L 550,600 L 550,681 L 464,682 L 443,662 L 443,336 L 461,317 L 573,317 L 593,337 L 593,401 L 773,401 L 773,264 L 669,160 Z M 537,468 L 876,468 L 965,556 L 965,685 L 910,742 L 971,803 L 971,967 L 883,1056 L 536,1055 L 536,947 L 576,945 L 576,572 L 536,571 Z M 386,186 L 658,186 L 747,275 L 746,374 L 619,374 L 618,325 L 584,290 L 451,290 L 417,325 L 417,674 L 453,708 L 550,709 L 550,820 L 548,822 L 384,822 L 289,726 L 289,284 Z" fillRule="evenodd"/>
                </svg>
              </div>
              <div>
                <h3 className="text-[19px] font-extrabold text-brand-dark tracking-tight">
                  Get Campus Buddy Mobile App
                </h3>
                <p className="text-[12px] text-brand-secondary">
                  v1.0 • College Verified Marketplace • Free Download
                </p>
              </div>
            </div>

            {/* Quick Two-Column Options: Direct Download vs Scan QR */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 my-6">
              
              {/* Left Column: Direct APK & Play Store */}
              <div className="sm:col-span-7 flex flex-col justify-between space-y-3">
                
                {/* Main Download Button */}
                <button
                  onClick={handleDownloadAPK}
                  className="w-full py-3.5 px-5 bg-brand-blue hover:bg-blue-600 text-white rounded-2xl font-bold text-[13.5px] shadow-[0_4px_18px_rgba(8,96,232,0.3)] hover:-translate-y-0.5 active:scale-98 transition-all flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Download className="w-5 h-5 text-white" />
                    <div className="text-left">
                      <span className="block font-bold">Download Android APK</span>
                      <span className="block text-[10.5px] text-white/80 font-normal">Direct install • 24 MB</span>
                    </div>
                  </div>
                  <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded font-semibold">
                    Free
                  </span>
                </button>

                {/* Google Play Store Badge Button */}
                <a
                  href="#download"
                  onClick={(e) => {
                    e.preventDefault();
                    handleDownloadAPK();
                  }}
                  className="w-full py-3 px-4 bg-gray-50 hover:bg-gray-100 text-brand-dark rounded-2xl font-semibold text-[13px] border border-gray-200 transition-colors flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current text-[#0086F8]">
                      <path d="M3.609 1.814L13.793 12 3.61 22.186c-.347-.373-.55-.898-.55-1.503V3.317c0-.605.203-1.13.55-1.503zm11.234 11.236l2.12 2.12-11.45 6.47 9.33-8.59zm0-2.1L5.513 2.36l11.45 6.47-2.12 2.12zm1.464 1.05l4.57 2.58c.72.41.72 1.08 0 1.49l-4.57 2.58-1.78-1.78 1.78-1.78-.001-.001-.001-.001.002-.089z" />
                    </svg>
                    <span className="text-left text-[12.5px] font-bold">Google Play Store</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                </a>

                {/* iOS App Store / Web App */}
                <div className="w-full py-2.5 px-4 bg-gray-50 rounded-2xl text-[12px] border border-gray-150 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current text-gray-700">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.38c.62-.75 1.04-1.8 0.92-2.85-.9.04-2 .6-2.65 1.35-.58.67-1.09 1.74-.95 2.77 1 .08 2.05-.52 2.68-1.27z"/>
                    </svg>
                    <span className="font-semibold text-gray-700">iOS (Web App Available)</span>
                  </div>
                  <span className="text-[10px] text-brand-blue font-bold bg-blue-50 px-2 py-0.5 rounded">
                    Instant PWA
                  </span>
                </div>

              </div>

              {/* Right Column: Scannable QR Code */}
              <div className="sm:col-span-5 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 rounded-2xl p-4 border border-blue-100/70 flex flex-col items-center justify-center text-center">
                <div className="p-2 bg-white rounded-xl shadow-xs border border-gray-150">
                  <svg viewBox="0 0 160 160" className="w-28 h-28" fill="none">
                    <rect width="160" height="160" fill="white"/>
                    <rect x="10" y="10" width="40" height="40" rx="4" fill="#191D25"/>
                    <rect x="16" y="16" width="28" height="28" rx="2" fill="white"/>
                    <rect x="22" y="22" width="16" height="16" fill="#0860E8"/>

                    <rect x="110" y="10" width="40" height="40" rx="4" fill="#191D25"/>
                    <rect x="116" y="16" width="28" height="28" rx="2" fill="white"/>
                    <rect x="122" y="22" width="16" height="16" fill="#0860E8"/>

                    <rect x="10" y="110" width="40" height="40" rx="4" fill="#191D25"/>
                    <rect x="16" y="116" width="28" height="28" rx="2" fill="white"/>
                    <rect x="22" y="122" width="16" height="16" fill="#0860E8"/>

                    <rect x="60" y="20" width="10" height="10" fill="#191D25"/>
                    <rect x="80" y="20" width="10" height="10" fill="#0860E8"/>
                    <rect x="60" y="45" width="10" height="10" fill="#0860E8"/>
                    <rect x="80" y="45" width="10" height="10" fill="#191D25"/>
                    <rect x="20" y="70" width="120" height="8" fill="#191D25"/>
                    <rect x="60" y="90" width="10" height="10" fill="#191D25"/>
                    <rect x="85" y="90" width="10" height="10" fill="#0860E8"/>
                    <rect x="60" y="120" width="10" height="10" fill="#0860E8"/>
                    <rect x="85" y="120" width="10" height="10" fill="#191D25"/>
                    <rect x="115" y="120" width="10" height="10" fill="#191D25"/>

                    <circle cx="80" cy="80" r="10" fill="#0860E8"/>
                  </svg>
                </div>
                <span className="text-[11px] font-bold text-brand-dark mt-2.5 flex items-center gap-1">
                  <QrCode className="w-3 h-3 text-brand-blue" />
                  Scan to Install
                </span>
                <span className="text-[9.5px] text-gray-500">Works on all camera apps</span>
              </div>

            </div>

            {/* 3 Step Install Guide */}
            <div className="pt-4 border-t border-gray-100">
              <h5 className="text-[11.5px] font-bold text-brand-dark uppercase tracking-wider mb-2.5">
                Quick Setup Guide:
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11.5px] text-gray-600">
                <div className="flex items-start gap-1.5 p-2 bg-gray-50 rounded-xl">
                  <span className="w-4 h-4 rounded-full bg-brand-blue text-white text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                  <span>Tap Download APK above</span>
                </div>
                <div className="flex items-start gap-1.5 p-2 bg-gray-50 rounded-xl">
                  <span className="w-4 h-4 rounded-full bg-brand-blue text-white text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                  <span>Open file & allow install</span>
                </div>
                <div className="flex items-start gap-1.5 p-2 bg-gray-50 rounded-xl">
                  <span className="w-4 h-4 rounded-full bg-brand-blue text-white text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                  <span>Verify with campus ID</span>
                </div>
              </div>
            </div>

            {/* Support guarantee */}
            <div className="mt-4 text-center">
              <p className="text-[11px] text-gray-400">
                Need help installing? Contact our student team at{' '}
                <a href="mailto:support@campusbuddy.in" className="text-brand-blue font-semibold hover:underline">
                  support@campusbuddy.in
                </a>
              </p>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
