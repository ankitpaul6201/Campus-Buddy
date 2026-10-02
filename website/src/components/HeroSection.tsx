import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { HeroDoodle, OrangeUnderline } from './Doodles';
import { InfiniteGrid } from './InfiniteGrid';

interface HeroSectionProps {
  onGetStarted: () => void;
  onExploreMarketplace: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onGetStarted,
  onExploreMarketplace,
}) => {
  return (
    <section
      id="home"
      className="relative pt-28 pb-16 sm:pt-36 sm:pb-24 overflow-hidden bg-gradient-to-b from-[#F9FCFF] via-[#FFFFFF] to-[#FFFFFF]"
    >
      {/* Soft Background Radial Gradient */}
      <div className="absolute top-12 left-1/4 w-[500px] h-[500px] bg-[#EBF5FE]/60 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Light background infinite grid line animation with mouse proximity blue glow */}
      <InfiniteGrid />

      <div className="max-w-4xl mx-auto px-5 sm:px-8 relative z-10 text-center flex flex-col items-center">
        
        {/* Top Pill Badge */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EBF5FE] border border-[#D0E6FD] text-[#0860E8] text-[12px] font-semibold mb-6 shadow-xs"
        >
          <span className="w-2 h-2 rounded-full bg-[#0860E8] animate-pulse" />
          <span>India's #1 Student Marketplace & Campus Community</span>
        </motion.div>

        {/* Headline with sequential line reveal and decorative doodle */}
        <div className="relative mb-6">
          {/* Doodle strokes on top-right of headline */}
          <div className="absolute -top-7 right-2 sm:-top-8 sm:right-6 w-12 sm:w-16 pointer-events-none">
            <HeroDoodle />
          </div>

          <h1 className="text-[36px] sm:text-[48px] md:text-[54px] font-extrabold text-brand-dark leading-[1.12] tracking-tight">
            <motion.span
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
              className="block"
            >
              Everything You Need
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.22, ease: 'easeOut' }}
              className="block"
            >
              For Your Campus,
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.34, ease: 'easeOut' }}
              className="relative inline-block"
            >
              All In One Place!
              {/* Orange hand-drawn underline under "All In One Place!" */}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-full max-w-[280px]">
                <OrangeUnderline />
              </div>
            </motion.span>
          </h1>
        </div>

        {/* Supporting Paragraph */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5, ease: 'easeOut' }}
          className="text-brand-secondary text-[15px] sm:text-[16.5px] leading-relaxed max-w-2xl mx-auto mb-8"
        >
          Buy, sell, exchange and discover student essentials within your campus community.
          Find affordable deals on textbooks, drafters, calculators, cycles, and hostel gear — right where you study.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.65, ease: 'easeOut' }}
          className="flex flex-wrap items-center justify-center gap-4 sm:gap-6"
        >
          <button
            onClick={onGetStarted}
            className="px-8 py-3.5 bg-brand-btnDark hover:bg-black text-white text-[14px] font-semibold rounded-full shadow-[0_6px_20px_rgba(25,29,37,0.18)] hover:-translate-y-0.5 active:scale-98 transition-all duration-200 cursor-pointer flex items-center gap-2 group"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={onExploreMarketplace}
            className="px-6 py-3.5 text-brand-dark hover:text-brand-blue bg-white/90 hover:bg-white border border-gray-200/90 rounded-full text-[14px] font-semibold flex items-center gap-2 transition-all shadow-xs cursor-pointer group"
          >
            <span>Explore Marketplace</span>
            <ArrowRight className="w-3.5 h-3.5 text-brand-blue group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>

        {/* Micro Trust Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-[12px] sm:text-[13px] text-gray-500 font-medium"
        >
          <span className="flex items-center gap-1.5 bg-white/80 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-gray-100 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Zero Commission
          </span>
          <span className="flex items-center gap-1.5 bg-white/80 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-gray-100 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-brand-blue" />
            College Verified Accounts
          </span>
          <span className="flex items-center gap-1.5 bg-white/80 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-gray-100 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-brand-orange" />
            Hostel Handover
          </span>
        </motion.div>

      </div>

      {/* Soft feather gradient to seamlessly blend Hero grid & glow into TrustIndicators below */}
      <div className="absolute -bottom-1 left-0 right-0 h-40 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none z-10" />
    </section>
  );
};
