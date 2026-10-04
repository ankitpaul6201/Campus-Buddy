import React from 'react';
import { Instagram } from 'lucide-react';
import { TextHoverEffect } from './ui/hover-footer';

interface FooterProps {
  onNavigate: (sectionId: string) => void;
  onDownloadClick?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="w-full relative overflow-hidden select-none pt-14 sm:pt-16 pb-0"
      style={{
        background:
          "linear-gradient(180deg, #FFFFFF 0%, #DCEDFD 6%, #A8D5FD 18%, #4A9CF7 45%, #0B64EA 72%, #021F54 100%)",
      }}
    >
      {/* Top Section: Four Clean Columns sitting directly in the soft blue gradient */}
      <div className="max-w-6xl mx-auto px-5 sm:px-8 pb-8 sm:pb-12 relative z-10">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-start">
          
          {/* Column 1: Brand & Bio (Left) */}
          <div className="col-span-2 sm:col-span-2 md:col-span-4 flex flex-col items-start pr-2">
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
                Campus Buddy<span className="text-[#0860E8]"></span>
              </span>
            </div>

            <p className="text-[14px] text-[#1E293B] font-medium leading-relaxed max-w-sm mb-5">
              Audience-first marketplace for students across Indian campuses. Buy, sell and exchange essentials easily.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-4 text-black">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="text-black hover:text-gray-700 transition-all hover:scale-110 p-0 flex items-center justify-center"
                aria-label="Instagram"
              >
                <Instagram className="w-[19px] h-[19px]" />
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                className="text-black hover:text-gray-700 transition-all hover:scale-110 p-0 flex items-center justify-center"
                aria-label="X (formerly Twitter)"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-[19px] h-[19px]"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="text-black hover:text-gray-700 transition-all hover:scale-110 p-0 flex items-center justify-center"
                aria-label="LinkedIn"
              >
                <svg
                  fill="currentColor"
                  viewBox="-2 -2 24 24"
                  className="w-[19px] h-[19px] jam jam-linkedin"
                  xmlns="http://www.w3.org/2000/svg"
                  preserveAspectRatio="xMinYMin"
                >
                  <path d="M19.959 11.719v7.379h-4.278v-6.885c0-1.73-.619-2.91-2.167-2.91-1.182 0-1.886.796-2.195 1.565-.113.275-.142.658-.142 1.043v7.187h-4.28s.058-11.66 0-12.869h4.28v1.824l-.028.042h.028v-.042c.568-.875 1.583-2.126 3.856-2.126 2.815 0 4.926 1.84 4.926 5.792zM2.421.026C.958.026 0 .986 0 2.249c0 1.235.93 2.224 2.365 2.224h.028c1.493 0 2.42-.989 2.42-2.224C4.787.986 3.887.026 2.422.026zM.254 19.098h4.278V6.229H.254v12.869z" />
                </svg>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="text-black hover:text-gray-700 transition-all hover:scale-110 p-0 flex items-center justify-center"
                aria-label="YouTube"
              >
                <svg
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  className="w-[19px] h-[19px]"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M23,9.71a8.5,8.5,0,0,0-.91-4.13,2.92,2.92,0,0,0-1.72-1A78.36,78.36,0,0,0,12,4.27a78.45,78.45,0,0,0-8.34.3,2.87,2.87,0,0,0-1.46.74c-.9.83-1,2.25-1.1,3.45a48.29,48.29,0,0,0,0,6.48,9.55,9.55,0,0,0,.3,2,3.14,3.14,0,0,0,.71,1.36,2.86,2.86,0,0,0,1.49.78,45.18,45.18,0,0,0,6.5.33c3.5.05,6.57,0,10.2-.28a2.88,2.88,0,0,0,1.53-.78,2.49,2.49,0,0,0,.61-1,10.58,10.58,0,0,0,.52-3.4C23,13.69,23,10.31,23,9.71ZM9.74,14.85V8.66l5.92,3.11C14,12.69,11.81,13.73,9.74,14.85Z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Navigation */}
          <div className="col-span-1 md:col-span-2">
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

          {/* Column 3: Legals */}
          <div className="col-span-1 md:col-span-3">
            <h4 className="text-[13px] font-bold text-[#0A1629] mb-4 tracking-wider uppercase">
              Legals
            </h4>
            <ul className="space-y-2.5 text-[13.5px] text-[#1E293B] font-medium">
              <li>
                <button
                  onClick={() => onNavigate('terms')}
                  className="hover:text-[#0860E8] transition-colors cursor-pointer"
                >
                  Terms of service
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('privacy')}
                  className="hover:text-[#0860E8] transition-colors cursor-pointer"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('guidelines')}
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

          {/* Column 4: Contact */}
          <div className="col-span-2 sm:col-span-1 md:col-span-3">
            <h4 className="text-[13px] font-bold text-[#0A1629] mb-4 tracking-wider uppercase">
              Contact
            </h4>
            <ul className="space-y-2.5 text-[13.5px] text-[#1E293B] font-medium">
              <li>
                <a
                  href="mailto:support@campusbuddy.in"
                  className="hover:text-[#0860E8] transition-colors flex items-center gap-2 group cursor-pointer"
                >
                  <svg
                    fill="currentColor"
                    viewBox="0 0 52 52"
                    className="w-4 h-4 text-black group-hover:text-[#0860E8] shrink-0"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g>
                      <path d="M24.9,30.1c0.6,0.6,1.5,0.6,2.1,0l22.6-21C50,8.3,49.9,7,48.3,7L3.6,7.1c-1.2,0-2.2,1.1-1.3,2.1L24.9,30.1z" />
                      <path d="M50,17.3c0-1-1.2-1.6-2-0.9L30.3,32.7c-1.2,1.1-2.7,1.7-4.3,1.7s-3.1-0.6-4.3-1.6L4.1,16.4c-0.8-0.7-2-0.2-2,0.9C2,17,2,40,2,40c0,2.2,1.8,4,4,4h40c2.2,0,4-1.8,4-4C50,34,50,21.8,50,17.3z" />
                    </g>
                  </svg>
                  <span>support@campusbuddy.in</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:grievance@campusbuddy.in"
                  className="hover:text-[#0860E8] transition-colors flex items-center gap-2 group cursor-pointer text-gray-700"
                >
                  <svg
                    fill="currentColor"
                    viewBox="0 0 52 52"
                    className="w-4 h-4 text-black group-hover:text-[#0860E8] shrink-0"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g>
                      <path d="M24.9,30.1c0.6,0.6,1.5,0.6,2.1,0l22.6-21C50,8.3,49.9,7,48.3,7L3.6,7.1c-1.2,0-2.2,1.1-1.3,2.1L24.9,30.1z" />
                      <path d="M50,17.3c0-1-1.2-1.6-2-0.9L30.3,32.7c-1.2,1.1-2.7,1.7-4.3,1.7s-3.1-0.6-4.3-1.6L4.1,16.4c-0.8-0.7-2-0.2-2,0.9C2,17,2,40,2,40c0,2.2,1.8,4,4,4h40c2.2,0,4-1.8,4-4C50,34,50,21.8,50,17.3z" />
                    </g>
                  </svg>
                  <span>grievance@campusbuddy.in</span>
                </a>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Sub-Footer: Minimal Copyright & Mission Statement */}
      <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-8 pb-4 relative z-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[12.5px] text-white/90 font-medium">
          <div className="flex items-center gap-1.5">
            <span>© {currentYear} Campus Buddy Inc. All rights reserved.</span>
          </div>
        </div>
      </div>

      {/* White Divider Line: Exactly just above the Giant CAMPUS BUDDY Wordmark */}
      <div className="w-full border-t border-white/20 relative z-10" />

      {/* Giant Brand Wordmark: "CAMPUS BUDDY" full edge-to-edge with zero side gaps */}
      <div className="w-full flex items-center justify-center overflow-hidden p-0 relative z-10 leading-none">
        <div className="w-full flex items-center justify-center leading-none">
          <TextHoverEffect text="CAMPUS BUDDY" className="w-full h-auto block" />
        </div>
      </div>

    </footer>
  );
};

export default Footer;
