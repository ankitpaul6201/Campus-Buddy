import React from 'react';
import { motion } from 'framer-motion';
import { Download, Sparkles, CheckCircle2, QrCode } from 'lucide-react';
import { HeroDoodle } from './Doodles';

interface DownloadCTASectionProps {
  onOpenDownloadModal?: () => void;
}

export const DownloadCTASection: React.FC<DownloadCTASectionProps> = ({ onOpenDownloadModal }) => {
  const handleDirectDownload = () => {
    if (onOpenDownloadModal) {
      onOpenDownloadModal();
    } else {
      // Trigger download or fallback
      window.open('/campusbuddy.apk', '_blank');
    }
  };

  return (
    <section id="download" className="py-20 sm:py-28 bg-white relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="relative rounded-[36px] bg-gradient-to-br from-brand-btnDark via-[#1E232E] to-[#12151B] text-white p-8 sm:p-16 overflow-hidden shadow-2xl">
          
          {/* Subtle decorative glow circles */}
          <div className="absolute top-0 right-1/4 w-[380px] h-[380px] bg-brand-blue/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 left-10 w-[300px] h-[300px] bg-brand-orange/15 rounded-full blur-3xl pointer-events-none" />

          {/* Doodles */}
          <div className="absolute top-6 right-8 w-12 pointer-events-none opacity-80">
            <HeroDoodle />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
            
            {/* Left Column: Headlines & CTA Buttons */}
            <div className="lg:col-span-7 flex flex-col items-start">
              
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11.5px] font-semibold text-brand-lightLine mb-5">
                <Sparkles className="w-3.5 h-3.5 text-brand-orange" />
                <span>Download Campus Buddy v1.0</span>
              </div>

              <h2 className="text-[32px] sm:text-[46px] font-extrabold text-white leading-[1.12] tracking-tight">
                Your Campus.<br />
                Your Community.<br />
                <span className="text-brand-lightLine">Your Buddy.</span>
              </h2>

              <p className="mt-4 text-white/80 text-[14px] sm:text-[15.5px] leading-relaxed max-w-lg">
                Discover affordable essentials, pass on what you no longer need, and make campus life a little easier with Campus Buddy. Get started in minutes with your student ID.
              </p>

              {/* Download Buttons Group */}
              <div className="mt-8 flex flex-wrap items-center gap-3.5 sm:gap-4">
                {/* Primary Android APK Download Button */}
                <button
                  onClick={handleDirectDownload}
                  className="px-7 py-3.5 bg-brand-blue hover:bg-blue-600 text-white text-[13.5px] font-bold rounded-full shadow-[0_8px_25px_rgba(8,96,232,0.4)] hover:-translate-y-0.5 active:scale-98 transition-all flex items-center gap-2.5 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-white" />
                  <span>Download for Android (.APK)</span>
                </button>

                {/* Google Play Store Badge Button */}
                <button
                  onClick={handleDirectDownload}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-[13px] font-semibold rounded-full backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                    <path d="M3.609 1.814L13.793 12 3.61 22.186c-.347-.373-.55-.898-.55-1.503V3.317c0-.605.203-1.13.55-1.503zm11.234 11.236l2.12 2.12-11.45 6.47 9.33-8.59zm0-2.1L5.513 2.36l11.45 6.47-2.12 2.12zm1.464 1.05l4.57 2.58c.72.41.72 1.08 0 1.49l-4.57 2.58-1.78-1.78 1.78-1.78-.001-.001-.001-.001.002-.089z" />
                  </svg>
                  <span>Google Play</span>
                </button>

                {/* Apple App Store */}
                <button
                  onClick={handleDirectDownload}
                  className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white/90 border border-white/15 text-[12.5px] font-medium rounded-full backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.38c.62-.75 1.04-1.8 0.92-2.85-.9.04-2 .6-2.65 1.35-.58.67-1.09 1.74-.95 2.77 1 .08 2.05-.52 2.68-1.27z"/>
                  </svg>
                  <span>iOS App (Web)</span>
                </button>
              </div>

              {/* Reassurance points */}
              <div className="mt-8 flex flex-wrap items-center gap-4 text-[12px] text-white/70">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Free Download
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-brand-lightLine" />
                  Verified College Community
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-brand-orange" />
                  0% Commission
                </span>
              </div>

            </div>

            {/* Right Column: Interactive Phone QR Scan Card */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-[290px] p-6 rounded-3xl bg-white text-brand-dark shadow-2xl flex flex-col items-center text-center border-4 border-white/20"
              >
                {/* QR Code Container */}
                <div className="p-3 bg-white rounded-2xl border-2 border-dashed border-gray-200 shadow-inner">
                  {/* High Quality Scalable SVG QR Code */}
                  <svg
                    viewBox="0 0 160 160"
                    className="w-40 h-40"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect width="160" height="160" fill="white"/>
                    {/* Corner 1: Top-Left */}
                    <rect x="10" y="10" width="40" height="40" rx="6" fill="#191D25"/>
                    <rect x="16" y="16" width="28" height="28" rx="3" fill="white"/>
                    <rect x="22" y="22" width="16" height="16" rx="2" fill="#0860E8"/>

                    {/* Corner 2: Top-Right */}
                    <rect x="110" y="10" width="40" height="40" rx="6" fill="#191D25"/>
                    <rect x="116" y="16" width="28" height="28" rx="3" fill="white"/>
                    <rect x="122" y="22" width="16" height="16" rx="2" fill="#0860E8"/>

                    {/* Corner 3: Bottom-Left */}
                    <rect x="10" y="110" width="40" height="40" rx="6" fill="#191D25"/>
                    <rect x="16" y="116" width="28" height="28" rx="3" fill="white"/>
                    <rect x="22" y="122" width="16" height="16" rx="2" fill="#0860E8"/>

                    {/* QR Code Pattern blocks */}
                    <rect x="60" y="15" width="8" height="8" fill="#191D25"/>
                    <rect x="75" y="15" width="8" height="8" fill="#191D25"/>
                    <rect x="90" y="15" width="8" height="8" fill="#0860E8"/>

                    <rect x="60" y="30" width="8" height="8" fill="#0860E8"/>
                    <rect x="75" y="35" width="8" height="8" fill="#191D25"/>
                    <rect x="90" y="30" width="8" height="8" fill="#191D25"/>

                    <rect x="15" y="60" width="8" height="8" fill="#191D25"/>
                    <rect x="30" y="60" width="8" height="8" fill="#191D25"/>
                    <rect x="45" y="60" width="8" height="8" fill="#0860E8"/>
                    <rect x="60" y="60" width="8" height="8" fill="#191D25"/>
                    <rect x="75" y="60" width="8" height="8" fill="#0860E8"/>
                    <rect x="90" y="60" width="8" height="8" fill="#191D25"/>
                    <rect x="105" y="60" width="8" height="8" fill="#191D25"/>
                    <rect x="120" y="60" width="8" height="8" fill="#0860E8"/>
                    <rect x="135" y="60" width="8" height="8" fill="#191D25"/>

                    <rect x="20" y="75" width="8" height="8" fill="#0860E8"/>
                    <rect x="40" y="75" width="8" height="8" fill="#191D25"/>
                    <rect x="65" y="75" width="8" height="8" fill="#191D25"/>
                    <rect x="85" y="75" width="8" height="8" fill="#0860E8"/>
                    <rect x="110" y="75" width="8" height="8" fill="#191D25"/>
                    <rect x="130" y="75" width="8" height="8" fill="#191D25"/>

                    <rect x="15" y="90" width="8" height="8" fill="#191D25"/>
                    <rect x="35" y="90" width="8" height="8" fill="#191D25"/>
                    <rect x="55" y="90" width="8" height="8" fill="#0860E8"/>
                    <rect x="75" y="90" width="8" height="8" fill="#191D25"/>
                    <rect x="95" y="90" width="8" height="8" fill="#0860E8"/>
                    <rect x="115" y="90" width="8" height="8" fill="#191D25"/>
                    <rect x="135" y="90" width="8" height="8" fill="#191D25"/>

                    <rect x="60" y="110" width="8" height="8" fill="#191D25"/>
                    <rect x="75" y="110" width="8" height="8" fill="#0860E8"/>
                    <rect x="90" y="110" width="8" height="8" fill="#191D25"/>
                    <rect x="110" y="110" width="8" height="8" fill="#191D25"/>
                    <rect x="130" y="110" width="8" height="8" fill="#0860E8"/>

                    <rect x="60" y="125" width="8" height="8" fill="#0860E8"/>
                    <rect x="80" y="125" width="8" height="8" fill="#191D25"/>
                    <rect x="100" y="125" width="8" height="8" fill="#191D25"/>
                    <rect x="125" y="125" width="8" height="8" fill="#191D25"/>

                    <rect x="60" y="140" width="8" height="8" fill="#191D25"/>
                    <rect x="75" y="140" width="8" height="8" fill="#191D25"/>
                    <rect x="95" y="140" width="8" height="8" fill="#0860E8"/>
                    <rect x="115" y="140" width="8" height="8" fill="#191D25"/>
                    <rect x="135" y="140" width="8" height="8" fill="#191D25"/>

                    {/* Tiny Center Brand Badge */}
                    <circle cx="80" cy="80" r="12" fill="white"/>
                    <circle cx="80" cy="80" r="9" fill="#0860E8"/>
                  </svg>
                </div>

                <div className="mt-3">
                  <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-brand-dark">
                    <QrCode className="w-3.5 h-3.5 text-brand-blue" />
                    <span>Scan to Install on Mobile</span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    Point your phone camera to download directly
                  </p>
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
