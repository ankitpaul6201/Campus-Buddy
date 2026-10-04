import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, CheckCircle2, QrCode } from 'lucide-react';

interface DownloadCTASectionProps {
  onOpenDownloadModal?: () => void;
}

export const DownloadCTASection: React.FC<DownloadCTASectionProps> = ({ onOpenDownloadModal }) => {
  const [clickedBtn, setClickedBtn] = useState<string | null>(null);

  const handleDirectDownload = (btnKey?: string) => {
    if (btnKey) {
      setClickedBtn(btnKey);
      setTimeout(() => setClickedBtn(null), 500);
    }
    if (onOpenDownloadModal) {
      onOpenDownloadModal();
    } else {
      window.open('/campusbuddy.apk', '_blank');
    }
  };

  return (
    <section id="download" className="py-20 sm:py-28 bg-[#FFFFFF] relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        
        {/* Glassmorphic White Container - All shades strictly contained inside */}
        <div
          className="relative rounded-[24px] sm:rounded-[36px] text-brand-dark p-5 sm:p-16 overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.78) 0%, rgba(255, 255, 255, 0.65) 50%, rgba(248, 250, 255, 0.55) 100%)',
            backdropFilter: 'blur(32px) saturate(180%)',
            WebkitBackdropFilter: 'blur(32px) saturate(180%)',
            border: '1.5px solid rgba(255, 255, 255, 0.95)',
            boxShadow: `
              0 25px 60px -15px rgba(15, 23, 42, 0.12),
              0 12px 28px -6px rgba(15, 23, 42, 0.08),
              0 0 0 1px rgba(226, 232, 240, 0.85),
              inset 0 1.5px 2px rgba(255, 255, 255, 0.95),
              inset 0 0 0 1px rgba(255, 255, 255, 0.5)
            `
          }}
        >
          {/* Top Edge Specular Reflection */}
          <div className="absolute top-0 inset-x-8 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent opacity-95 pointer-events-none" />

          {/* 1. Warm Orange Shade - Moved inside the padding (does not spill outside) */}
          <div
            className="absolute top-2 sm:top-6 left-[50%] sm:left-[54%] -translate-x-1/2 w-[300px] sm:w-[420px] h-[160px] sm:h-[220px] rounded-full blur-[60px] sm:blur-[75px] pointer-events-none -z-10"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(255, 135, 75, 0.60) 0%, rgba(255, 107, 44, 0.45) 45%, rgba(245, 158, 11, 0.20) 75%, transparent 100%)'
            }}
          />

          {/* 2. Rich Website Brand Blue (#0860E8) Shade in the bottom-right corner of the padding */}
          <div
            className="absolute -bottom-6 -right-6 w-[280px] sm:w-[380px] h-[220px] sm:h-[300px] rounded-full blur-[65px] sm:blur-[80px] pointer-events-none -z-10"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(8, 96, 232, 0.60) 0%, rgba(2, 132, 199, 0.42) 45%, rgba(56, 189, 248, 0.22) 75%, transparent 100%)'
            }}
          />

          {/* 3. Top-Left Website Brand Blue Wash */}
          <div className="absolute -top-10 -left-10 w-[320px] sm:w-[400px] h-[280px] sm:h-[340px] bg-gradient-to-br from-[#0860E8]/28 via-[#0860E8]/12 to-transparent rounded-full blur-[70px] pointer-events-none -z-10" />

          {/* 4. Soft Bottom-Left Rose/Pink Accent */}
          <div className="absolute -bottom-6 left-10 sm:left-16 w-[200px] sm:w-[240px] h-[180px] sm:h-[220px] bg-gradient-to-tr from-[#EC4899]/20 to-transparent rounded-full blur-[60px] pointer-events-none -z-10" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
            
            {/* Left Column: Headlines & CTA Buttons */}
            <div className="lg:col-span-7 flex flex-col items-start">
              
              <h2 className="text-[26px] sm:text-[46px] font-extrabold text-brand-dark leading-[1.12] tracking-tight">
                Your Campus.<br />
                Your Community.<br />
                <span className="text-brand-blue">Your Buddy.</span>
              </h2>

              <p className="mt-4 text-brand-secondary text-[14px] sm:text-[15.5px] leading-relaxed max-w-lg">
                Discover affordable essentials, pass on what you no longer need, and make campus life a little easier with Campus Buddy. Get started in minutes with your student ID.
              </p>

              {/* Download Buttons Group with Upward Flip Animation */}
              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4">
                {/* Primary Android APK Download Button */}
                <button
                  onClick={() => handleDirectDownload('android')}
                  className="group relative px-7 py-3.5 bg-brand-blue hover:bg-blue-600 text-white text-[13.5px] font-bold rounded-full shadow-[0_8px_25px_rgba(8,96,232,0.35)] hover:shadow-[0_12px_32px_rgba(8,96,232,0.45)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden cursor-pointer select-none"
                >
                  <span className="relative inline-flex flex-col h-[1.35em] overflow-hidden pointer-events-none">
                    <span
                      className={`inline-flex items-center gap-2.5 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-full group-active:-translate-y-full ${
                        clickedBtn === 'android' ? '-translate-y-full' : ''
                      }`}
                    >
                      <Download className="w-4 h-4 text-white shrink-0" />
                      <span>Download for Android (.apk)</span>
                    </span>
                    <span
                      className={`absolute top-full left-0 inline-flex items-center gap-2.5 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-full group-active:-translate-y-full ${
                        clickedBtn === 'android' ? '-translate-y-full' : ''
                      }`}
                      aria-hidden="true"
                    >
                      <Download className="w-4 h-4 text-white shrink-0" />
                      <span>Download for Android (.apk)</span>
                    </span>
                  </span>
                </button>

                {/* Google Play Store Badge Button */}
                <button
                  onClick={() => handleDirectDownload('play')}
                  className="group relative px-6 py-3.5 bg-white/95 hover:bg-white text-brand-dark border border-gray-200/90 hover:border-gray-300 text-[13px] font-bold rounded-full shadow-2xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-95 backdrop-blur-md transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden cursor-pointer select-none"
                >
                  <span className="relative inline-flex flex-col h-[1.35em] overflow-hidden pointer-events-none">
                    <span
                      className={`inline-flex items-center gap-2 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-full group-active:-translate-y-full ${
                        clickedBtn === 'play' ? '-translate-y-full' : ''
                      }`}
                    >
                      <svg viewBox="0 0 32 32" className="w-4 h-4 fill-current shrink-0">
                        <path d="M17.929 17.32l-13.746 13.662c0.067 0.009 0.144 0.014 0.223 0.014 0.335 0 0.648-0.090 0.918-0.247l-0.009 0.005 16.65-9.422zM17.929 14.737l4.071-4.046-16.685-9.442c-0.262-0.153-0.577-0.244-0.913-0.244-0.095 0-0.188 0.007-0.28 0.021l0.010-0.001zM2.675 2.159c-0.089 0.209-0.14 0.452-0.14 0.707 0 0.001 0 0.002 0 0.003v-0 26.264c0 0.002 0 0.003 0 0.005 0 0.269 0.057 0.525 0.16 0.756l-0.005-0.012 13.94-13.855zM28.519 17.622l-4.897 2.772-4.393-4.365 4.427-4.4 4.862 2.752c0.569 0.326 0.945 0.929 0.945 1.621s-0.377 1.295-0.936 1.616l-0.009 0.005z" />
                      </svg>
                      <span>Google Play</span>
                    </span>
                    <span
                      className={`absolute top-full left-0 inline-flex items-center gap-2 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-full group-active:-translate-y-full ${
                        clickedBtn === 'play' ? '-translate-y-full' : ''
                      }`}
                      aria-hidden="true"
                    >
                      <svg viewBox="0 0 32 32" className="w-4 h-4 fill-current shrink-0">
                        <path d="M17.929 17.32l-13.746 13.662c0.067 0.009 0.144 0.014 0.223 0.014 0.335 0 0.648-0.090 0.918-0.247l-0.009 0.005 16.65-9.422zM17.929 14.737l4.071-4.046-16.685-9.442c-0.262-0.153-0.577-0.244-0.913-0.244-0.095 0-0.188 0.007-0.28 0.021l0.010-0.001zM2.675 2.159c-0.089 0.209-0.14 0.452-0.14 0.707 0 0.001 0 0.002 0 0.003v-0 26.264c0 0.002 0 0.003 0 0.005 0 0.269 0.057 0.525 0.16 0.756l-0.005-0.012 13.94-13.855zM28.519 17.622l-4.897 2.772-4.393-4.365 4.427-4.4 4.862 2.752c0.569 0.326 0.945 0.929 0.945 1.621s-0.377 1.295-0.936 1.616l-0.009 0.005z" />
                      </svg>
                      <span>Google Play</span>
                    </span>
                  </span>
                </button>

                {/* Apple App Store */}
                <button
                  onClick={() => handleDirectDownload('ios')}
                  className="group relative px-5 py-3.5 bg-white/95 hover:bg-white text-brand-dark border border-gray-200/90 hover:border-gray-300 text-[12.5px] font-semibold rounded-full shadow-2xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-95 backdrop-blur-md transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden cursor-pointer select-none"
                >
                  <span className="relative inline-flex flex-col h-[1.35em] overflow-hidden pointer-events-none">
                    <span
                      className={`inline-flex items-center gap-2 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-full group-active:-translate-y-full ${
                        clickedBtn === 'ios' ? '-translate-y-full' : ''
                      }`}
                    >
                      <svg viewBox="0 0 384 512" className="w-3.5 h-3.5 fill-current shrink-0">
                        <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
                      </svg>
                      <span>App Store</span>
                    </span>
                    <span
                      className={`absolute top-full left-0 inline-flex items-center gap-2 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-full group-active:-translate-y-full ${
                        clickedBtn === 'ios' ? '-translate-y-full' : ''
                      }`}
                      aria-hidden="true"
                    >
                      <svg viewBox="0 0 384 512" className="w-3.5 h-3.5 fill-current shrink-0">
                        <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
                      </svg>
                      <span>App Store</span>
                    </span>
                  </span>
                </button>
              </div>

              {/* Reassurance points */}
              <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-3 sm:gap-4 text-[11.5px] sm:text-[12.5px] font-semibold text-brand-secondary">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Free Download</span>
                </span>
                <span className="text-gray-300">•</span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-brand-blue" />
                  <span>Verified College Community</span>
                </span>
                <span className="text-gray-300">•</span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-brand-orange" />
                  <span>0% Commission</span>
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
                className="w-full max-w-[290px] p-6 rounded-3xl bg-white/90 backdrop-blur-md text-brand-dark shadow-[0_20px_50px_rgba(8,96,232,0.12)] flex flex-col items-center text-center border-2 border-white"
              >
                {/* QR Code Container */}
                <div className="p-3 bg-white rounded-2xl border-2 border-dashed border-gray-200/90 shadow-2xs">
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
                  <p className="text-[10px] text-gray-500 mt-0.5">
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
