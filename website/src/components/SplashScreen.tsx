import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [fade, setFade] = useState(false);

  useEffect(() => {
    // Smooth splash timer allowing character stagger, subtitle & loading bar to fully resolve
    const timer = setTimeout(() => {
      setFade(true);
      setTimeout(onComplete, 500);
    }, 1900);

    return () => clearTimeout(timer);
  }, [onComplete]);

  const handleSkip = () => {
    setFade(true);
    setTimeout(onComplete, 400);
  };

  return (
    <motion.div
      key="splash-screen"
      initial={{ opacity: 1 }}
      animate={{ opacity: fade ? 0 : 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      onClick={handleSkip}
      className="fixed inset-0 w-full h-full min-h-screen bg-[#1944F1] flex flex-col items-center justify-center text-white z-[99999] select-none cursor-pointer overflow-hidden"
    >
      {/* Center Content: Logo, Staggered Title & Subtitle */}
      <div className="flex flex-col items-center justify-center -mt-6">
        {/* Logo: Zooms down into position with smooth fade-in */}
        <motion.div
          initial={{ opacity: 0, scale: 2.2 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-28 h-28 mb-4 drop-shadow-2xl flex items-center justify-center"
        >
          <img
            src="/ic_launcher_foreground.svg"
            alt="Campus Buddy Logo"
            className="w-full h-full object-contain filter drop-shadow-lg"
          />
        </motion.div>

        {/* Title Text: Character-level Staggered Fade-in */}
        <motion.div className="flex items-center gap-1 overflow-hidden">
          {"Campus Buddy".split("").map((char, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{
                delay: 0.2 + index * 0.03,
                duration: 0.4,
                ease: "easeOut"
              }}
              className="text-2xl sm:text-3xl font-bold tracking-tight font-sans text-white inline-block"
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
        </motion.div>

        {/* Subtitle: Smooth Fade & Rise */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5, ease: 'easeOut' }}
          className="text-xs sm:text-sm text-blue-100/90 mt-1.5 font-medium tracking-wide"
        >
          Connecting Students Safely
        </motion.p>
      </div>

      {/* Bottom Loading Progress Bar */}
      <div className="absolute bottom-12 sm:bottom-16 flex flex-col items-center gap-2 pointer-events-none">
        <div className="w-48 sm:w-56 h-1 sm:h-1.5 bg-white/20 rounded-full overflow-hidden backdrop-blur-xs shadow-inner">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{
              duration: 1.8,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="h-full bg-gradient-to-r from-blue-200 via-white to-sky-200 rounded-full shadow-[0_0_12px_rgba(255,255,255,0.9)]"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default SplashScreen;
