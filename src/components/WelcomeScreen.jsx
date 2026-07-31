import React from 'react';
import { motion } from 'framer-motion';

export default function WelcomeScreen({ onNavigate }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: "100%" }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: "-100%" }}
      transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
      className="absolute inset-0 w-full h-full bg-[#F3F4F6] text-slate-900 flex flex-col justify-between overflow-hidden select-none"
    >
      {/* Top Light Section - Logo & Branding */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        {/* Logo */}
        <motion.div 
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.35 }}
          className="w-28 h-28 mb-5 rounded-[28px] overflow-hidden shadow-lg border border-gray-200/60 flex items-center justify-center"
        >
          <img 
            src="/campus-buddy-CB-exact-vector.svg" 
            alt="Campus Buddy Logo" 
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* Heading: Bold */}
        <motion.h1 
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.3 }}
          className="text-3xl font-bold tracking-tight text-slate-900 font-sans"
        >
          Campus Buddy
        </motion.h1>

        {/* Subtitle: Normal font (no bold) */}
        <motion.p 
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="text-xs uppercase tracking-[0.22em] text-slate-500 font-normal mt-1.5"
        >
          Student Marketplace
        </motion.p>
      </div>

      {/* Bottom Electric Blue Card */}
      <div className="w-full bg-[#1944F1] text-white rounded-t-[40px] px-8 pt-9 pb-12 shadow-2xl relative z-10 shrink-0">
        <div className="space-y-2.5">
          {/* Heading: Bold */}
          <h2 className="text-3xl font-bold tracking-tight text-white font-sans">
            Welcome
          </h2>
          {/* Description: Normal font (no bold) */}
          <p className="text-sm text-blue-100/90 leading-relaxed font-normal">
            Discover, buy, and sell essentials within your campus community. Your trusted companion for campus life.
          </p>
        </div>

        {/* Buttons: Medium font weight */}
        <div className="mt-8">
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => onNavigate('login')}
              className="py-4 px-6 rounded-full bg-[#0F0F0F] hover:bg-black text-white font-medium text-sm shadow-md transition-all active:scale-[0.97] text-center"
            >
              Sign In
            </button>
            <button
              onClick={() => onNavigate('signup')}
              className="py-4 px-6 rounded-full bg-white hover:bg-gray-100 text-slate-900 font-medium text-sm shadow-md transition-all active:scale-[0.97] text-center"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>

    </motion.div>
  );
}
