import React from 'react';
import { motion } from 'framer-motion';
export const PhoneMockup: React.FC = () => {
  return (
    <div className="relative w-full max-w-[330px] sm:max-w-[500px] lg:max-w-[560px] mx-auto select-none px-1 sm:px-0">

      {/* ========================================================
          1. Multi-Layered Luminous Blue Gradients (Ambient Aura)
          ======================================================== */}
      {/* Outer wide ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] h-[260px] sm:w-[500px] sm:h-[520px] bg-gradient-to-tr from-[#0860E8]/20 via-[#38BDF8]/25 to-[#93C5FD]/30 rounded-full blur-[65px] sm:blur-[95px] -z-10 pointer-events-none" />

      {/* Core bright cyan/blue radial backlight glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[220px] sm:w-[380px] sm:h-[420px] bg-gradient-to-br from-[#38BDF8]/35 via-[#60A5FA]/30 to-[#0860E8]/25 rounded-full blur-[50px] sm:blur-[70px] -z-10 pointer-events-none animate-pulse-glow" />

      {/* Subtle soft lavender-blue tint offset for rich dimensional color */}
      <div className="absolute top-2 right-4 w-[160px] sm:w-[240px] h-[160px] sm:h-[240px] bg-[#818CF8]/20 rounded-full blur-[60px] sm:blur-[80px] -z-10 pointer-events-none" />

      {/* ========================================================
          2. Dual iPhone Mockups Container (Matched to Uploaded Image)
          ======================================================== */}
      <div className="relative w-full h-[340px] sm:h-[470px] lg:h-[500px] z-10 flex items-center justify-center">

        {/* Left iPhone Mockup (Behind, positioned towards bottom-left) */}
        <motion.div
          initial={{ opacity: 0, x: -30, y: 30 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="absolute left-1.5 sm:left-2 bottom-3 sm:bottom-6 w-[55%] sm:w-[57%] z-10"
        >
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
            className="relative"
          >
            <img
              src="/iphone-15-pro-right.svg"
              alt="iPhone 15 Pro Left Perspective Mockup"
              className="w-full h-auto object-contain drop-shadow-[0_16px_28px_rgba(8,96,232,0.18)] drop-shadow-[0_10px_20px_rgba(0,0,0,0.14)] pointer-events-none"
              loading="eager"
            />
          </motion.div>
        </motion.div>

        {/* Right iPhone Mockup (In Front, positioned towards top-right) */}
        <motion.div
          initial={{ opacity: 0, x: 30, y: -30 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="absolute right-1.5 sm:right-2 top-0 sm:top-1 w-[55%] sm:w-[57%] z-20"
        >
          <motion.div
            animate={{ y: [-5, 5, -5] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
            className="relative"
          >
            <img
              src="/iphone-15-pro-left.svg"
              alt="iPhone 15 Pro Right Perspective Mockup"
              className="w-full h-auto object-contain drop-shadow-[0_20px_35px_rgba(8,96,232,0.22)] drop-shadow-[0_12px_24px_rgba(0,0,0,0.18)] pointer-events-none"
              loading="eager"
            />
          </motion.div>
        </motion.div>

      </div>

    </div>
  );
};
