import React from 'react';
import { motion } from 'framer-motion';
import { Search, ShieldCheck, Heart, Home, MessageSquare, PlusCircle, Compass, User, Sparkles } from 'lucide-react';
import { CurvedThreadDoodle } from './Doodles';

export const PhoneMockup: React.FC = () => {
  return (
    <div className="relative w-full max-w-[420px] mx-auto flex items-center justify-center py-6">
      {/* Decorative background thread doodle */}
      <div className="absolute -top-10 -right-12 w-[340px] pointer-events-none opacity-80 z-0">
        <CurvedThreadDoodle />
      </div>

      {/* Pale blue radial glow behind phone */}
      <div className="absolute w-[360px] h-[480px] bg-gradient-to-tr from-brand-blue/15 to-[#9DD6FA]/20 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Phone Outer Container with float animation */}
      <motion.div
        initial={{ opacity: 0, x: 50, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-[300px] sm:w-[325px] float-slow"
      >
        {/* Smartphone Shell with Realistic Shadow */}
        <div className="relative bg-[#1E222A] p-[10px] rounded-[48px] shadow-[0_25px_60px_-15px_rgba(8,96,232,0.25),0_15px_30px_-10px_rgba(25,29,37,0.3)] border-[3px] border-[#2E3440]">
          {/* Side Buttons representation */}
          <div className="absolute -left-[5px] top-[100px] w-[3px] h-[32px] bg-[#3B4252] rounded-l-sm" />
          <div className="absolute -left-[5px] top-[145px] w-[3px] h-[48px] bg-[#3B4252] rounded-l-sm" />
          <div className="absolute -right-[5px] top-[115px] w-[3px] h-[55px] bg-[#3B4252] rounded-r-sm" />

          {/* Screen Container */}
          <div className="relative bg-white rounded-[38px] overflow-hidden border border-gray-100 flex flex-col h-[610px] select-none text-[#191D25]">
            
            {/* Dynamic Island / Speaker notch */}
            <div className="pt-2 px-6 pb-1 bg-white flex justify-between items-center z-20">
              <span className="text-[11px] font-semibold tracking-tight text-gray-800">9:41</span>
              <div className="w-[88px] h-[20px] bg-black rounded-full flex items-center justify-end px-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#111] border border-gray-800 mr-1" />
                <div className="w-1.5 h-1.5 rounded-full bg-brand-blue/80 animate-pulse" />
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-[10px] font-bold text-gray-700">5G</span>
                <div className="w-4 h-2.5 border border-gray-700 rounded-sm p-[1px] flex items-center">
                  <div className="w-full h-full bg-gray-700 rounded-xs" />
                </div>
              </div>
            </div>

            {/* App Top Bar */}
            <div className="px-4 py-2 border-b border-gray-100/80 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-medium text-gray-400">Campus:</span>
                    <span className="text-[11px] font-bold text-brand-dark flex items-center gap-0.5">
                      SVIET Chandigarh
                      <ShieldCheck className="w-3 h-3 text-brand-blue fill-brand-blue/20" />
                    </span>
                  </div>
                  <h4 className="text-[13px] font-bold text-brand-dark">Hi, Shreya 👋</h4>
                </div>
                <div className="inline-flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] font-semibold text-emerald-700">Verified Student</span>
                </div>
              </div>

              {/* Search Bar inside app */}
              <div className="mt-2.5 flex items-center bg-[#F5FAFE] border border-[#E8EBF0] rounded-full px-3 py-1.5">
                <Search className="w-3.5 h-3.5 text-gray-400 mr-2 shrink-0" />
                <span className="text-[11px] text-gray-400 font-normal">Search notes, drafters, cycles...</span>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 mt-2.5 overflow-x-hidden text-[10px]">
                <span className="px-2.5 py-1 bg-brand-blue text-white rounded-full font-medium whitespace-nowrap shadow-xs">
                  All
                </span>
                <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full font-medium whitespace-nowrap">
                  Drawing Kits
                </span>
                <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full font-medium whitespace-nowrap">
                  Calculators
                </span>
                <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full font-medium whitespace-nowrap">
                  Books
                </span>
              </div>
            </div>

            {/* App Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3 bg-[#FCFDFE]">
              
              {/* Recommended Header */}
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-bold text-brand-dark flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-brand-orange" /> Recommended
                </span>
                <span className="text-[10px] text-brand-blue font-semibold">See all</span>
              </div>

              {/* Product 1: Drawing Kit (Large Card) */}
              <div className="bg-white rounded-2xl p-2.5 border border-gray-100 shadow-[0_4px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow">
                <div className="relative h-28 w-full rounded-xl overflow-hidden bg-gray-100">
                  <img
                    src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=80"
                    alt="Engineering Drawing Kit"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2 left-2 bg-brand-dark/85 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                    Like New
                  </span>
                  <button className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/90 flex items-center justify-center text-gray-500 shadow-xs">
                    <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                  </button>
                </div>
                <div className="mt-2 flex items-start justify-between">
                  <div>
                    <h5 className="text-[11px] font-bold text-brand-dark line-clamp-1">
                      Engineering Drawing Kit (Mini Drafter)
                    </h5>
                    <p className="text-[9px] text-gray-400">Mech Dept • SVIET Campus</p>
                  </div>
                  <span className="text-[13px] font-extrabold text-brand-blue">₹350</span>
                </div>
              </div>

              {/* 2-Column Mini Product Cards */}
              <div className="grid grid-cols-2 gap-2">
                {/* Product 2: Scientific Calculator */}
                <div className="bg-white rounded-2xl p-2 border border-gray-100 shadow-xs">
                  <div className="h-16 w-full rounded-lg overflow-hidden bg-gray-50">
                    <img
                      src="https://images.unsplash.com/photo-1611125832047-1d7ad1e8e485?w=300&auto=format&fit=crop&q=80"
                      alt="Scientific Calculator"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h6 className="text-[10px] font-bold mt-1.5 text-brand-dark line-clamp-1">Casio fx-991EX</h6>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-[11px] font-bold text-brand-blue">₹500</span>
                    <span className="text-[8px] bg-blue-50 text-brand-blue px-1.5 py-0.5 rounded">IIT-B</span>
                  </div>
                </div>

                {/* Product 3: CSE Textbooks */}
                <div className="bg-white rounded-2xl p-2 border border-gray-100 shadow-xs">
                  <div className="h-16 w-full rounded-lg overflow-hidden bg-gray-50">
                    <img
                      src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&auto=format&fit=crop&q=80"
                      alt="CSE Textbooks"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h6 className="text-[10px] font-bold mt-1.5 text-brand-dark line-clamp-1">CSE Textbooks</h6>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-[11px] font-bold text-brand-blue">₹250</span>
                    <span className="text-[8px] bg-blue-50 text-brand-blue px-1.5 py-0.5 rounded">RVCE</span>
                  </div>
                </div>
              </div>

              {/* Product 4: College Backpack banner */}
              <div className="flex items-center justify-between bg-white rounded-xl p-2 border border-gray-100 shadow-2xs">
                <div className="flex items-center gap-2">
                  <img
                    src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=100&auto=format&fit=crop&q=80"
                    alt="Backpack"
                    className="w-9 h-9 rounded-lg object-cover"
                  />
                  <div>
                    <p className="text-[10px] font-bold text-brand-dark">Waterproof College Backpack</p>
                    <p className="text-[8px] text-gray-400">BITS Pilani • Like New</p>
                  </div>
                </div>
                <span className="text-[11px] font-extrabold text-brand-blue">₹600</span>
              </div>
            </div>

            {/* Bottom Nav Bar */}
            <div className="bg-white border-t border-gray-100 px-5 py-2 flex items-center justify-between z-20">
              <div className="flex flex-col items-center text-brand-blue">
                <Home className="w-4 h-4" />
                <span className="text-[8px] font-semibold mt-0.5">Home</span>
              </div>
              <div className="flex flex-col items-center text-gray-400 hover:text-brand-dark">
                <Compass className="w-4 h-4" />
                <span className="text-[8px] font-medium mt-0.5">Explore</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center -mt-3 shadow-md hover:bg-blue-600 transition-colors">
                  <PlusCircle className="w-4 h-4" />
                </div>
              </div>
              <div className="flex flex-col items-center text-gray-400 relative">
                <MessageSquare className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-brand-orange" />
                <span className="text-[8px] font-medium mt-0.5">Chats</span>
              </div>
              <div className="flex flex-col items-center text-gray-400">
                <User className="w-4 h-4" />
                <span className="text-[8px] font-medium mt-0.5">Profile</span>
              </div>
            </div>

            {/* Bottom Home Indicator */}
            <div className="py-1 bg-white flex justify-center">
              <div className="w-24 h-1 bg-gray-300 rounded-full" />
            </div>

          </div>
        </div>
      </motion.div>
    </div>
  );
};
