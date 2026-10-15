import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function SplashScreen({ onComplete }) {
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFade(true);
      setTimeout(onComplete, 400);
    }, 2600);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 0, x: "100%" }}
      animate={{ opacity: fade ? 0 : 1, x: fade ? "-100%" : 0 }}
      exit={{ opacity: 0, x: "-100%" }}
      transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
      onClick={() => { setFade(true); setTimeout(onComplete, 300); }}
      className="absolute inset-0 w-full h-full bg-[#000000] flex flex-col items-center justify-center cursor-pointer z-50 select-none overflow-hidden"
    >
      {/* Background Radial Glow */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        className="absolute w-[450px] h-[450px] bg-[#1944F1]/30 rounded-full blur-[120px] pointer-events-none" 
      />

      {/* Center Logo Block */}
      <div className="relative z-10 flex flex-col items-center">
        <motion.div 
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring', damping: 15 }}
          className="relative group"
        >
          {/* Outer Neon Glow */}
          <div className="absolute -inset-4 bg-[#1944F1] rounded-[48px] blur-2xl opacity-80 animate-pulse-glow" />
          
          {/* Logo SVG Container */}
          <div className="relative w-48 h-48 sm:w-52 sm:h-52 rounded-[42px] overflow-hidden shadow-2xl flex items-center justify-center">
            <img 
              src="/group_3.svg" 
              alt="Campus Buddy Logo" 
              className="w-full h-full object-cover"
            />
          </div>
        </motion.div>

        {/* Tagline */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="mt-12 text-center flex flex-col items-center space-y-2"
        >
          <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
            Campus Buddy
          </h1>
          <p className="text-xs uppercase tracking-[0.22em] text-[#38BDF8] font-normal flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Exclusive Campus Marketplace
          </p>
        </motion.div>
      </div>

      {/* Loading Bar at Bottom */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="absolute bottom-12 left-0 right-0 px-8 flex flex-col items-center max-w-xs mx-auto z-20"
      >
        <div className="w-full h-1.5 bg-blue-950/40 rounded-full overflow-hidden p-[1px] shadow-inner backdrop-blur-xs border border-white/15">
          <motion.div 
            initial={{ width: "15%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2.2, ease: "easeInOut" }}
            className="h-full bg-gradient-to-r from-blue-300 via-white to-blue-100 rounded-full shadow-[0_0_12px_rgba(255,255,255,0.85)]"
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
