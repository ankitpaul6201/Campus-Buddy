import React from 'react';
import { Download, Mail, Instagram, Twitter, Linkedin, MessageCircle } from 'lucide-react';
import { TextHoverEffect } from './ui/hover-footer';

interface FooterProps {
  onNavigate: (sectionId: string) => void;
  onDownloadClick?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onDownloadClick }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="w-full relative overflow-hidden select-none pt-14 sm:pt-16 pb-6 sm:pb-8"
      style={{
        background:
          "linear-gradient(180deg, #FFFFFF 0%, #DCEDFD 6%, #A8D5FD 18%, #4A9CF7 45%, #0B64EA 72%, #021F54 100%)",
      }}
    >
      {/* Top Section: Three Clean Columns sitting directly in the soft blue gradient */}
      <div className="max-w-6xl mx-auto px-5 sm:px-8 pb-8 sm:pb-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Column 1: Brand & Bio (Left) */}
          <div className="md:col-span-6 flex flex-col items-start pr-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-xl bg-[#0860E8] flex items-center justify-center p-1.5 shadow-md">
                <svg viewBox="0 0 1254 1254" className="w-full h-full fill-white">
                  <path
                    d="M 698,801 L 699,948 L 824,948 L 856,916 L 856,833 L 824,801 Z M 724,828 L 812,827 L 830,845 L 830,904 L 813,921 L 725,921 Z M 698,572 L 698,708 L 808,708 L 841,675 L 841,603 L 809,572 Z M 724,600 L 799,599 L 816,615 L 816,662 L 797,682 L 725,682 Z M 374,160 L 263,273 L 263,737 L 372,848 L 550,849 L 550,919 L 510,920 L 510,1082 L 894,1082 L 997,978 L 997,792 L 947,742 L 991,697 L 991,544 L 886,441 L 511,441 L 510,598 L 550,600 L 550,681 L 464,682 L 443,662 L 443,336 L 461,317 L 573,317 L 593,337 L 593,401 L 773,401 L 773,264 L 669,160 Z M 537,468 L 876,468 L 965,556 L 965,685 L 910,742 L 971,803 L 971,967 L 883,1056 L 536,1055 L 536,947 L 576,945 L 576,572 L 536,571 Z M 386,186 L 658,186 L 747,275 L 746,374 L 619,374 L 618,325 L 584,290 L 451,290 L 417,325 L 417,674 L 453,708 L 550,709 L 550,820 L 548,822 L 384,822 L 289,726 L 289,284 Z"
                    fillRule="evenodd"
                  />
                </svg>
              </div>
              <span className="font-extrabold text-[22px] tracking-tight text-[#0A1629]">
                Campus Buddy<span className="text-[#0860E8]">.</span>
              </span>
            </div>

            <p className="text-[14px] text-[#1E293B] font-medium leading-relaxed max-w-sm mb-5">
              Audience-first marketplace for students across Indian campuses. Buy, sell and exchange essentials easily.
            </p>

            <button
              onClick={onDownloadClick}
              className="px-4 py-2 bg-[#0860E8] hover:bg-[#0751C6] text-white text-[12px] font-bold rounded-full shadow-sm flex items-center gap-1.5 transition-transform hover:scale-105 cursor-pointer mb-5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Get Mobile App</span>
            </button>

            {/* Social Icons */}
            <div className="flex items-center gap-2 text-gray-700">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-7 h-7 rounded-full bg-white/90 hover:bg-white text-[#0860E8] flex items-center justify-center transition-all shadow-xs"
                aria-label="Instagram"
              >
                <Instagram className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="w-7 h-7 rounded-full bg-white/90 hover:bg-white text-[#0860E8] flex items-center justify-center transition-all shadow-xs"
                aria-label="Twitter"
              >
                <Twitter className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="w-7 h-7 rounded-full bg-white/90 hover:bg-white text-[#0860E8] flex items-center justify-center transition-all shadow-xs"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://discord.com"
                target="_blank"
                rel="noreferrer"
                className="w-7 h-7 rounded-full bg-white/90 hover:bg-white text-[#0860E8] flex items-center justify-center transition-all shadow-xs"
                aria-label="Community"
              >
                <MessageCircle className="w-3.5 h-3.5" />
              </a>
              <span className="text-[12px] text-[#1E293B] ml-2 font-semibold flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" />
                support@campusbuddy.in
              </span>
            </div>
          </div>

          {/* Column 2: Navigation (Center) */}
          <div className="md:col-span-3">
            <h4 className="text-[13px] font-bold text-[#0A1629] mb-4 tracking-wider uppercase">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-[13.5px] text-[#1E293B] font-medium">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-[#0860E8] transition-colors cursor-pointer"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('marketplace')}
                  className="hover:text-[#0860E8] transition-colors cursor-pointer"
                >
                  Marketplace
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('how-it-works')}
                  className="hover:text-[#0860E8] transition-colors cursor-pointer"
                >
                  How It Works
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('community')}
                  className="hover:text-[#0860E8] transition-colors cursor-pointer"
                >
                  Community
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-[#0860E8] transition-colors cursor-pointer"
                >
                  About Us
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Legals (Right) */}
          <div className="md:col-span-3">
            <h4 className="text-[13px] font-bold text-[#0A1629] mb-4 tracking-wider uppercase">
              Legals
            </h4>
            <ul className="space-y-2.5 text-[13.5px] text-[#1E293B] font-medium">
              <li>
                <button
                  onClick={() => onNavigate('safety')}
                  className="hover:text-[#0860E8] transition-colors cursor-pointer"
                >
                  Terms of service
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('safety')}
                  className="hover:text-[#0860E8] transition-colors cursor-pointer"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('safety')}
                  className="hover:text-[#0860E8] transition-colors cursor-pointer"
                >
                  Student Guidelines
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('faqs')}
                  className="hover:text-[#0860E8] transition-colors cursor-pointer"
                >
                  FAQ
                </button>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Giant Brand Wordmark: "Campus Buddy" in Title Case with light-to-dark gradient */}
      <div className="w-full flex items-center justify-center overflow-visible px-3 sm:px-8 py-3 sm:py-4 relative z-10">
        <div className="w-full max-w-7xl flex items-center justify-center">
          <TextHoverEffect text="Campus Buddy" className="w-full h-auto" />
        </div>
      </div>

      {/* Bottom Sub-Footer: Minimal Copyright & Operational Status */}
      <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] text-white/80 relative z-10">
        <div className="flex items-center gap-1.5">
          <span>© {currentYear} Campus Buddy. All rights reserved.</span>
        </div>

        <div className="flex items-center gap-1.5 text-white/90 font-medium bg-white/10 px-3 py-1 rounded-full border border-white/20 shadow-xs backdrop-blur-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span className="text-emerald-300 font-semibold">Beta v1.0</span>
          <span className="text-white/40">•</span>
          <span>System operational</span>
        </div>
      </div>

    </footer>
  );
};

export default Footer;
