import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { TermsContent, PrivacyContent, GuidelinesContent, LegalDocType } from './LegalPortal';

interface LegalModalProps {
  isOpen: boolean;
  initialDoc?: LegalDocType;
  onClose: () => void;
  onNavigateDoc?: (doc: LegalDocType) => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  initialDoc = 'terms',
  onClose,
  onNavigateDoc
}) => {
  const [activeDoc, setActiveDoc] = useState<LegalDocType>(initialDoc);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Sync state if initialDoc changes
  useEffect(() => {
    if (initialDoc) {
      setActiveDoc(initialDoc);
      scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [initialDoc]);

  // Pause Lenis global scroll, lock body scroll, and handle Escape key when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const lenis = (window as any).__lenis;
    if (lenis && typeof lenis.stop === 'function') {
      lenis.stop();
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      if (lenis && typeof lenis.start === 'function') {
        lenis.start();
      }
    };
  }, [isOpen, onClose]);

  const handleTabClick = (doc: LegalDocType) => {
    setActiveDoc(doc);
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    if (onNavigateDoc) {
      onNavigateDoc(doc);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-8 font-sans">
          
          {/* Backdrop with soft blur and gentle backdrop tone */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#0A1629]/45 backdrop-blur-xl -z-10 cursor-pointer"
          />

          {/* Modal Container matching uploaded design layout with light app theme */}
          <motion.div
            data-lenis-prevent="true"
            initial={{ opacity: 0, y: '35vh', scale: 1.1 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: '25vh', scale: 1.05 }}
            transition={{ 
              type: 'spring', 
              damping: 28, 
              stiffness: 300, 
              mass: 0.85 
            }}
            onClick={(e) => e.stopPropagation()}
            onWheel={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl h-[92vh] sm:h-[88vh] rounded-[28px] sm:rounded-[36px] border border-slate-200/90 shadow-[0_25px_80px_rgba(8,96,232,0.12),0_10px_35px_rgba(0,0,0,0.08)] flex flex-col overflow-hidden bg-white text-slate-800"
          >
            
            {/* Top Light Header using the Footer's App Gradient Theme */}
            <div 
              className="px-4 sm:px-10 pt-4 sm:pt-6 pb-6 sm:pb-9 relative overflow-hidden text-slate-800 shrink-0 border-b border-blue-100/90"
              style={{
                background: "linear-gradient(180deg, #FFFFFF 0%, #EEF6FE 25%, #DCEDFD 55%, #C5E3FE 85%, #FFFFFF 100%)",
              }}
            >
              {/* Mobile Close Button (absolute top-right so it never crowds the centered navbar) */}
              <button
                onClick={onClose}
                className="sm:hidden absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200/90 shadow-2xs flex items-center justify-center transition-colors cursor-pointer z-20"
                title="Close (Esc)"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
              
              {/* Top Navigation Bar */}
              <div className="flex items-center justify-center sm:justify-between gap-2 relative z-10 w-full">
                
                {/* Left Spacer to balance desktop layout */}
                <div className="w-8 shrink-0 hidden sm:block" />

                {/* Center Nav Switcher Tabs matching uploaded image */}
                <div className="flex justify-center max-w-[calc(100%-60px)] sm:max-w-none">
                  <nav className="inline-flex items-center relative bg-white rounded-full p-1 border border-slate-100/90 shadow-[0_10px_30px_rgba(0,0,0,0.07),0_2px_6px_rgba(0,0,0,0.04)]">
                    {[
                      { id: 'privacy' as LegalDocType, full: 'Privacy Policy', short: 'Privacy' },
                      { id: 'terms' as LegalDocType, full: 'Terms of Service', short: 'Terms' },
                      { id: 'guidelines' as LegalDocType, full: 'Student Guidelines', short: 'Guidelines' },
                    ].map((tab) => {
                      const isSelected = activeDoc === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => handleTabClick(tab.id)}
                          className={`relative px-2.5 sm:px-5 py-1.5 sm:py-2 text-[11.5px] sm:text-[13.5px] transition-colors cursor-pointer select-none whitespace-nowrap ${
                            isSelected
                              ? 'text-[#0860E8] font-bold'
                              : 'text-slate-500 hover:text-slate-800 font-medium'
                          }`}
                        >
                          <span className="sm:hidden">{tab.short}</span>
                          <span className="hidden sm:inline">{tab.full}</span>
                          {isSelected && (
                            <motion.div
                              layoutId="legalModalNavbarIndicator"
                              className="absolute bottom-0 left-2 right-2 sm:left-4 sm:right-4 h-[3.5px] bg-[#0860E8] rounded-t-full shadow-[0_2px_6px_rgba(8,96,232,0.35)]"
                              transition={{ type: "spring", stiffness: 450, damping: 35 }}
                            />
                          )}
                        </button>
                      );
                    })}
                  </nav>
                </div>

                {/* Desktop Close Button */}
                <button
                  onClick={onClose}
                  className="hidden sm:flex w-8 h-8 rounded-full bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200/90 shadow-2xs items-center justify-center transition-colors cursor-pointer shrink-0"
                  title="Close (Esc)"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4" />
                </button>

              </div>

              {/* Centered Document Hero Heading */}
              <div className="text-center mt-5 sm:mt-7 mb-1 relative z-10">
                <h2 className="text-2xl sm:text-4xl lg:text-[40px] font-extrabold text-[#0A1629] tracking-tight">
                  {activeDoc === 'privacy' && 'Privacy Policy'}
                  {activeDoc === 'terms' && 'Terms of Service'}
                  {activeDoc === 'guidelines' && 'Student Guidelines'}
                </h2>
                <p className="mt-2 text-slate-500 text-xs sm:text-sm font-medium">
                  Last updated on Oct 2026
                </p>
              </div>

              {/* Soft ambient light accent */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-12 bg-gradient-to-r from-transparent via-[#0860E8]/10 via-[#38BDF8]/15 to-transparent blur-xl pointer-events-none" />

            </div>

            {/* Scrollable White Document Body */}
            <div 
              ref={scrollContainerRef}
              data-lenis-prevent="true"
              onWheel={(e) => e.stopPropagation()}
              className="flex-1 min-h-0 overflow-y-auto px-6 sm:px-14 md:px-18 py-8 sm:py-12 custom-scrollbar overscroll-contain touch-pan-y"
            >
              {activeDoc === 'terms' && <TermsContent />}
              {activeDoc === 'privacy' && <PrivacyContent />}
              {activeDoc === 'guidelines' && <GuidelinesContent />}

              {/* Statutory Redressal & Contact Section at document bottom */}
              <div className="mt-14 pt-8 border-t border-slate-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-500">
                <div>
                  <p className="font-bold text-slate-900 text-[12.5px]">
                    Campus Buddy Technologies India Pvt. Ltd.
                  </p>
                  <p className="text-[11.5px] text-slate-500 mt-0.5">
                    DPDP Act 2023 & IT Act 2000 · Grievance Officer: Ankit Paul
                  </p>
                </div>

                <a
                  href="mailto:legal@campusbuddy.in"
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors"
                >
                  <span>legal@campusbuddy.in</span>
                </a>
              </div>
            </div>

            {/* Bottom Modal Bar */}
            <div className="px-6 sm:px-10 py-3 border-t border-slate-100 bg-white flex items-center justify-between text-xs text-slate-500 shrink-0">
              <span className="hidden sm:inline">Press <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] font-mono text-slate-600">Esc</kbd> to exit anytime</span>
              <button
                onClick={onClose}
                className="ml-auto px-5 py-1.5 bg-[#0860E8] hover:bg-blue-700 text-white font-semibold rounded-full text-xs transition-colors cursor-pointer shadow-xs"
              >
                Close
              </button>
            </div>

          </motion.div>

        </div>
      )}
    </AnimatePresence>
  );
};
