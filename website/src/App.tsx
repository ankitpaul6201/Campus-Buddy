import React, { useState, useEffect } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { StatsBand } from './components/StatsBand';
import { AboutSection } from './components/AboutSection';
import { CategoriesSection } from './components/CategoriesSection';
import { HowItWorksSection } from './components/HowItWorksSection';
import { PricingSection } from './components/PricingSection';
import { IndiaMapSection } from './components/IndiaMapSection';
import { CommunitySection } from './components/CommunitySection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { FAQSection } from './components/FAQSection';
import { DownloadCTASection } from './components/DownloadCTASection';
import { Footer } from './components/Footer';
import { LegalModal } from './components/legal/LegalModal';
import { LegalDocType } from './components/legal/LegalPortal';
import { NotFoundPage } from './components/NotFoundPage';
import { AnimatePresence } from 'framer-motion';
import { SplashScreen } from './components/SplashScreen';

gsap.registerPlugin(ScrollTrigger);

export const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [activeLegalModal, setActiveLegalModal] = useState<LegalDocType | null>(null);
  const [is404, setIs404] = useState<boolean>(() => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase().replace('#', '');
    return path === '/404' || path.startsWith('/404') || hash === '404' || hash === '/404';
  });
  const [isOffline, setIsOffline] = useState<boolean>(() => !navigator.onLine);

  // Real-time internet connection monitor
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Initialize Lenis Smooth Scrolling with GSAP Ticker synchronization
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.6,
      infinite: false,
    });

    // Make lenis globally accessible for seamless scrollTo calls
    (window as any).__lenis = lenis;

    // Pause scrolling while splash loading screen is active
    if (loading) {
      lenis.stop();
    }

    // Synchronize Lenis scroll events with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    // Drive Lenis RAF inside GSAP's ticker to guarantee 100% sync on every single frame
    const tickerUpdate = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerUpdate);
    gsap.ticker.lagSmoothing(0);

    // Handle responsive viewport resizing and orientation shifts
    const handleResize = () => {
      ScrollTrigger.refresh();
    };
    window.addEventListener('resize', handleResize);

    // Refresh ScrollTrigger once DOM layout has settled
    const refreshTimer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 200);

    return () => {
      clearTimeout(refreshTimer);
      window.removeEventListener('resize', handleResize);
      gsap.ticker.remove(tickerUpdate);
      (window as any).__lenis = null;
      lenis.destroy();
    };
  }, []);

  // Listen to hash changes for deep linking to legal modal
  useEffect(() => {
    const parseHash = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase().replace('#', '');
      if (['terms', 'terms-of-service'].includes(hash)) {
        setActiveLegalModal('terms');
      } else if (['privacy', 'privacy-policy'].includes(hash)) {
        setActiveLegalModal('privacy');
      } else if (['guidelines', 'student-guidelines'].includes(hash)) {
        setActiveLegalModal('guidelines');
      } else if (hash === '404' || hash === '/404' || path === '/404') {
        setIs404(true);
      }
    };

    parseHash();
    window.addEventListener('hashchange', parseHash);
    return () => window.removeEventListener('hashchange', parseHash);
  }, []);

  const scrollToSection = (id: string) => {
    const lenis = (window as any).__lenis as Lenis | undefined;
    if (id === 'home') {
      if (lenis) {
        lenis.scrollTo(0, { duration: 1.2 });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      if (lenis) {
        lenis.scrollTo(el, { offset: -70, duration: 1.2 });
      } else {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleNavigate = (target: string) => {
    if (target === '404') {
      setIs404(true);
      return;
    }
    if (target === 'terms' || target === 'terms-of-service') {
      setActiveLegalModal('terms');
      return;
    }
    if (target === 'privacy' || target === 'privacy-policy') {
      setActiveLegalModal('privacy');
      return;
    }
    if (target === 'guidelines' || target === 'student-guidelines') {
      setActiveLegalModal('guidelines');
      return;
    }

    if (activeLegalModal) {
      setActiveLegalModal(null);
    }
    scrollToSection(target);
  };

  const handleOpenDownload = () => {
    handleNavigate('download');
  };

  if (isOffline) {
    return (
      <NotFoundPage
        type="offline"
        onBackToHome={() => {
          if (navigator.onLine) {
            setIsOffline(false);
          } else {
            window.location.reload();
          }
        }}
      />
    );
  }

  if (is404) {
    return (
      <NotFoundPage
        type="404"
        onBackToHome={() => {
          window.history.pushState(null, '', '/');
          window.location.hash = '';
          setIs404(false);
          scrollToSection('home');
        }}
      />
    );
  }

  return (
    <>
      <AnimatePresence mode="wait">
        {loading && (
          <SplashScreen
            onComplete={() => {
              setLoading(false);
              const lenis = (window as any).__lenis;
              if (lenis) {
                lenis.start();
              }
              setTimeout(() => {
                ScrollTrigger.refresh();
              }, 120);
            }}
          />
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-white text-brand-dark flex flex-col selection:bg-brand-blue selection:text-white">
      {/* 1. Header & Navigation */}
      <Navbar 
        onDownloadClick={handleOpenDownload} 
        onNavigateSection={handleNavigate}
      />

      <main className="flex-1">
        {/* 2. Hero Section with Phone Mockup */}
        <HeroSection
          onGetStarted={handleOpenDownload}
          onExploreMarketplace={() => handleNavigate('marketplace')}
        />

        {/* 3. Blue Statistics Strip */}
        <StatsBand />

        {/* 4. About Campus Buddy: What is it, Why it was formed, How it works */}
        <AboutSection
          onDownloadClick={handleOpenDownload}
          onExploreMarketplace={() => handleNavigate('marketplace')}
        />

        {/* 5. Marketplace Section (Categories) */}
        <div id="marketplace" className="scroll-mt-20">
          <CategoriesSection />
        </div>

        {/* 6. How It Works (PRD Section 7: 3-Step Student Journey) */}
        <div id="how-it-works" className="scroll-mt-20">
          <HowItWorksSection onDownloadClick={handleOpenDownload} />
        </div>

        {/* 9. Pricing Section (Plans matching uploaded image) */}
        <PricingSection onSelectPlan={() => handleOpenDownload()} />

        {/* 10. India Map and Campus Marketplace Discovery */}
        <IndiaMapSection onSearch={() => {}} />

        {/* 12. Campus Community Section */}
        <CommunitySection onJoin={handleOpenDownload} />

        {/* 13. Student Testimonials Section (DTU, BITS Pilani, RVCE) */}
        <TestimonialsSection />

        {/* 14. FAQ and Email/Contact Section (PRD Section 12) */}
        <FAQSection />

        {/* 16. Final App Download CTA (PRD Section 14: QR Code & Badges) */}
        <DownloadCTASection onOpenDownloadModal={handleOpenDownload} />
      </main>

      {/* 17. Blue Footer with updated legal links & clean copyright */}
      <Footer onNavigate={handleNavigate} onDownloadClick={handleOpenDownload} />

      {/* 18. Animated Legal Center Modal Popup */}
      <LegalModal
        isOpen={Boolean(activeLegalModal)}
        initialDoc={activeLegalModal || 'terms'}
        onClose={() => setActiveLegalModal(null)}
        onNavigateDoc={(doc) => setActiveLegalModal(doc)}
      />
    </div>
    </>
  );
};

export default App;

