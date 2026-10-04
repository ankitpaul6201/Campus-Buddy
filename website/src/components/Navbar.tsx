import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Download, Home, Compass, Store, Users, HelpCircle, CreditCard } from 'lucide-react';
import { NavBar, NavItem } from './ui/tubelight-navbar';
import { FlipButton } from './ui/Button';

const tubelightNavItems: NavItem[] = [
  { name: 'Home', url: '#home', icon: Home },
  { name: 'About', url: '#about', icon: Compass },
  { name: 'Marketplace', url: '#marketplace', icon: Store },
  { name: 'Pricing', url: '#pricing', icon: CreditCard },
  { name: 'Community', url: '#community', icon: Users },
  { name: 'FAQs', url: '#faqs', icon: HelpCircle },
];

interface NavbarProps {
  onDownloadClick?: () => void;
  activeSection?: string;
  onNavigateSection?: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onDownloadClick, 
  activeSection = 'home',
  onNavigateSection 
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(activeSection);
  const isNavClickRef = useRef(false);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        ticking = false;
        setScrolled(window.scrollY > 20);

        // Don't override active tab while smooth scrolling from a user click
        if (isNavClickRef.current) return;

        const sections = ['home', 'about', 'marketplace', 'pricing', 'community', 'faqs'];
        const scrollPos = window.scrollY + 160;

        for (const section of sections) {
          const el = document.getElementById(section);
          if (el) {
            const top = el.offsetTop;
            const height = el.offsetHeight;
            if (scrollPos >= top && scrollPos < top + height) {
              setActiveTab(section);
              break;
            }
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    };
  }, []);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'marketplace', label: 'Marketplace' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'community', label: 'Community' },
    { id: 'faqs', label: 'FAQs' },
  ];

  const scrollToSection = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);

    if (onNavigateSection) {
      onNavigateSection(id);
      return;
    }

    // Lock scroll spy while smooth scrolling to clicked target
    isNavClickRef.current = true;
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    clickTimerRef.current = setTimeout(() => {
      isNavClickRef.current = false;
    }, 800);

    const element = document.getElementById(id);
    if (element) {
      const lenis = (window as any).__lenis;
      if (lenis) {
        lenis.scrollTo(element, { offset: -70, duration: 1.2 });
      } else {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleDownload = () => {
    if (onDownloadClick) {
      onDownloadClick();
    } else {
      const el = document.getElementById('download');
      if (el) {
        const lenis = (window as any).__lenis;
        if (lenis) {
          lenis.scrollTo(el, { offset: -70, duration: 1.2 });
        } else {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          scrolled
            ? 'bg-white/70 backdrop-blur-xl saturate-150 border-b border-white/60 shadow-[0_8px_30px_rgba(8,96,232,0.06),0_1px_3px_rgba(0,0,0,0.03)] py-3 rounded-b-2xl sm:rounded-b-3xl'
            : 'bg-transparent border-transparent shadow-none py-5'
        }`}
      >
        <div className="max-w-6xl mx-auto px-5 sm:px-8 flex items-center justify-between">
          
          {/* Left Brand Lockup */}
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('home');
            }}
            className="flex items-center gap-2 group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-brand-blue flex items-center justify-center p-1.5 shadow-sm group-hover:scale-105 transition-transform">
              <svg viewBox="0 0 1254 1254" className="w-full h-full text-white fill-white">
                <path d="M 698,801 L 699,948 L 824,948 L 856,916 L 856,833 L 824,801 Z M 724,828 L 812,827 L 830,845 L 830,904 L 813,921 L 725,921 Z M 698,572 L 698,708 L 808,708 L 841,675 L 841,603 L 809,572 Z M 724,600 L 799,599 L 816,615 L 816,662 L 797,682 L 725,682 Z M 374,160 L 263,273 L 263,737 L 372,848 L 550,849 L 550,919 L 510,920 L 510,1082 L 894,1082 L 997,978 L 997,792 L 947,742 L 991,697 L 991,544 L 886,441 L 511,441 L 510,598 L 550,600 L 550,681 L 464,682 L 443,662 L 443,336 L 461,317 L 573,317 L 593,337 L 593,401 L 773,401 L 773,264 L 669,160 Z M 537,468 L 876,468 L 965,556 L 965,685 L 910,742 L 971,803 L 971,967 L 883,1056 L 536,1055 L 536,947 L 576,945 L 576,572 L 536,571 Z M 386,186 L 658,186 L 747,275 L 746,374 L 619,374 L 618,325 L 584,290 L 451,290 L 417,325 L 417,674 L 453,708 L 550,709 L 550,820 L 548,822 L 384,822 L 289,726 L 289,284 Z" fillRule="evenodd"/>
              </svg>
            </div>
            <span className="font-extrabold text-[17px] tracking-tight text-brand-dark">
              Campus Buddy<span className="text-brand-blue"></span>
            </span>
          </a>

          {/* Centre Navigation Links (Desktop Tubelight Navbar) */}
          <div className="hidden md:flex items-center">
            <NavBar
              items={tubelightNavItems}
              activeTab={activeTab}
              onTabClick={(item) => scrollToSection(item.url.replace('#', ''))}
            />
          </div>

          {/* Right Action: Download App Button */}
          <div className="hidden md:flex items-center gap-2.5">
            <FlipButton
              variant="dark"
              onClick={handleDownload}
              className="py-2.5 px-5 text-[13px] rounded-full shadow-[0_4px_14px_rgba(25,29,37,0.15)]"
            >
              Download App
            </FlipButton>
          </div>

          {/* Mobile Hamburger Toggle & Compact Download Button */}
          <div className="md:hidden flex items-center gap-2">
            <FlipButton
              variant="dark"
              onClick={handleDownload}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-full shadow-xs"
            >
              Get App
            </FlipButton>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-brand-dark rounded-lg hover:bg-gray-100"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </header>

      {/* Mobile Dropdown Menu (Glassmorphic) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed inset-x-4 top-[70px] z-50 bg-white/80 backdrop-blur-2xl border border-white/80 rounded-3xl p-6 shadow-[0_20px_50px_rgba(8,96,232,0.12)] md:hidden"
          >
            <div className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className={`text-left py-2 text-sm font-medium border-b border-gray-100/60 ${
                    activeTab === link.id ? 'text-brand-blue font-bold' : 'text-gray-700'
                  }`}
                >
                  {link.label}
                </button>
              ))}

              <div className="pt-4 flex flex-col gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleDownload();
                  }}
                  className="w-full py-3 bg-brand-btnDark text-white text-xs font-semibold rounded-full flex items-center justify-center gap-2 shadow-sm"
                >
                  <Download className="w-4 h-4 text-brand-lightLine" />
                  <span>Download Mobile App</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};