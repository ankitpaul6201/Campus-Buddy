import React from 'react';
import { motion } from 'framer-motion';
import { Percent, ShieldCheck, Tag } from 'lucide-react';
import { InfiniteGrid } from './InfiniteGrid';
import { PhoneMockup } from './PhoneMockup';
import { ArrowButton } from './ui/Button';

interface HeroSectionProps {
  onGetStarted: () => void;
  onExploreMarketplace?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onGetStarted,
}) => {
  return (
    <section
      id="home"
      className="relative min-h-screen pt-24 pb-12 sm:pt-32 sm:pb-20 lg:pt-32 lg:pb-20 flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#F9FCFF] via-[#FFFFFF] to-[#FFFFFF] max-w-full"
    >
      {/* Soft Background Radial Gradient (pure gradient, zero blur filter) */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[700px] h-[340px] sm:h-[700px] rounded-full -z-10 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(235, 245, 254, 0.85) 0%, rgba(235, 245, 254, 0.3) 50%, transparent 75%)',
        }}
      />

      {/* Light background infinite grid line animation with mouse proximity blue glow */}
      <InfiniteGrid />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10 w-full overflow-hidden sm:overflow-visible">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
          
          {/* ========================================================
              LEFT COLUMN: Headline, Subtitle, CTAs & Trust Badges
              ======================================================== */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left">
            
            {/* Top Pill Badge */}
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-[#EBF5FE] border border-[#D0E6FD] text-[#0860E8] text-[10.5px] sm:text-[12px] font-semibold mb-3 sm:mb-5 shadow-xs max-w-full text-center"
            >
              <span className="w-2 h-2 rounded-full bg-[#0860E8] animate-pulse" />
              <span>India's #1 Student Marketplace & Campus Community</span>
            </motion.div>

            {/* Headline with sequential line reveal */}
            <div className="relative mb-3 sm:mb-5">
              <h1 className="text-[30px] sm:text-[48px] md:text-[54px] lg:text-[58px] font-extrabold text-brand-dark leading-[1.12] tracking-tight">
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
                </motion.span>
              </h1>
            </div>

            {/* Supporting Paragraph */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5, ease: 'easeOut' }}
              className="text-brand-secondary text-[15px] sm:text-[16.5px] leading-relaxed max-w-xl mb-6 sm:mb-7 mt-1"
            >
              Buy, sell, exchange and discover student essentials within your verified campus community.
              Find great deals on textbooks, drafters, calculators, cycles, and hostel gear — right where you study.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.65, ease: 'easeOut' }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 sm:gap-4"
            >
              <ArrowButton onClick={onGetStarted}>
                Get Started
              </ArrowButton>

            </motion.div>

            {/* Micro Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="mt-5 sm:mt-7 flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-3 text-[11px] sm:text-[13px] text-[#1E293B] font-semibold"
            >
              <span className="flex items-center gap-1 sm:gap-1.5 bg-white/95 backdrop-blur-xs px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full border border-gray-200/90 shadow-xs text-[#1E293B]">
                <Percent className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                Zero Commission
              </span>
              <span className="flex items-center gap-1 sm:gap-1.5 bg-white/95 backdrop-blur-xs px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full border border-gray-200/90 shadow-xs text-[#1E293B]">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-blue stroke-[2.2]" />
                College Verified Accounts
              </span>
              <span className="flex items-center gap-1 sm:gap-1.5 bg-white/95 backdrop-blur-xs px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full border border-gray-200/90 shadow-xs text-[#1E293B]">
                <Tag className="w-3.5 h-3.5 text-brand-orange stroke-[2.2]" />
                Save Big (40–70% Off)
              </span>
            </motion.div>

          </div>

          {/* ========================================================
              RIGHT COLUMN: Phone Mockup with Blue Gradient Auras
              ======================================================== */}
          <div className="lg:col-span-5 flex items-center justify-center">
            <PhoneMockup />
          </div>

        </div>
      </div>

      {/* Soft feather gradient to seamlessly blend Hero grid & glow into TrustIndicators below */}
      <div className="absolute -bottom-1 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none z-10" />
    </section>
  );
};
