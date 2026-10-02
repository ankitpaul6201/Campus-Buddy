import React, { useState, useEffect } from 'react';
import Lenis from 'lenis';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { TrustIndicators } from './components/TrustIndicators';
import { StatsBand } from './components/StatsBand';
import { MarketplaceShowcase } from './components/MarketplaceShowcase';
import { BenefitsSection } from './components/BenefitsSection';
import { CategoriesSection } from './components/CategoriesSection';
import { HowItWorksSection } from './components/HowItWorksSection';
import { BuyerSellerBenefits } from './components/BuyerSellerBenefits';
import { HostelHandoverSection } from './components/HostelHandoverSection';
import { IndiaMapSection } from './components/IndiaMapSection';
import { CommunitySection } from './components/CommunitySection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { TrustSafetySection } from './components/TrustSafetySection';
import { FAQSection } from './components/FAQSection';
import { DownloadCTASection } from './components/DownloadCTASection';
import { Footer } from './components/Footer';
import { DownloadModal } from './components/DownloadModal';

export const App: React.FC = () => {
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);

  // Initialize Lenis Smooth Scrolling
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 2,
    });

    let animationFrameId: number;

    function raf(time: number) {
      lenis.raf(time);
      animationFrameId = requestAnimationFrame(raf);
    }

    animationFrameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(animationFrameId);
      lenis.destroy();
    };
  }, []);

  const handleOpenDownload = () => {
    setDownloadModalOpen(true);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white text-brand-dark flex flex-col selection:bg-brand-blue selection:text-white">
      {/* 1. Header & Navigation (With Download App Button) */}
      <Navbar onDownloadClick={handleOpenDownload} />

      <main className="flex-1">
        {/* 2. Hero Section with Phone Mockup */}
        <HeroSection
          onGetStarted={handleOpenDownload}
          onExploreMarketplace={() => scrollToSection('marketplace')}
        />

        {/* 3. Trust Indicators Cards (PRD Section 3) */}
        <TrustIndicators />

        {/* 4. Blue Statistics Strip */}
        <StatsBand />

        {/* 5. App Preview and Marketplace Showcase (PRD Section 4) */}
        <MarketplaceShowcase onItemClick={handleOpenDownload} />

        {/* 6. About Campus Buddy (PRD Section 5: Affordability, Convenience, Reuse) */}
        <BenefitsSection />

        {/* 7. Marketplace Categories (PRD Section 6: 7 Core Categories) */}
        <CategoriesSection onCategoryClick={handleOpenDownload} />

        {/* 8. How It Works (PRD Section 7: 3-Step Student Journey) */}
        <div id="how-it-works">
          <HowItWorksSection onDownloadClick={handleOpenDownload} />
        </div>

        {/* 9. Buyer and Seller Benefits (PRD Section 8: Dual Panels) */}
        <BuyerSellerBenefits
          onBuyerCTA={handleOpenDownload}
          onSellerCTA={handleOpenDownload}
        />

        {/* 10. Hostel Handover Section (PRD Section 9: Move-Out & Rollovers) */}
        <HostelHandoverSection onExploreCTA={handleOpenDownload} />

        {/* 11. India Map and Campus Marketplace Discovery */}
        <IndiaMapSection onSearch={() => {}} />

        {/* 12. Campus Community Section */}
        <CommunitySection onJoin={handleOpenDownload} />

        {/* 13. Student Testimonials Section (DTU, BITS Pilani, RVCE) */}
        <TestimonialsSection />

        {/* 14. Trust and Safety Section (PRD Section 11) */}
        <div id="safety">
          <TrustSafetySection onLearnMore={() => scrollToSection('faqs')} />
        </div>

        {/* 15. FAQ and Email/Contact Section (PRD Section 12) */}
        <FAQSection />

        {/* 16. Final App Download CTA (PRD Section 14: QR Code & Badges) */}
        <DownloadCTASection onOpenDownloadModal={handleOpenDownload} />
      </main>

      {/* 17. Blue Footer with all official links */}
      <Footer onNavigate={scrollToSection} onDownloadClick={handleOpenDownload} />

      {/* App Download Modal with QR Code, APK, and Store Options */}
      <DownloadModal
        isOpen={downloadModalOpen}
        onClose={() => setDownloadModalOpen(false)}
      />
    </div>
  );
};

export default App;

