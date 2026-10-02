import React from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Search, Users, ArrowRight } from 'lucide-react';
import { HOW_IT_WORKS_STEPS } from '../data/mockData';
import { BlueAccentDoodle } from './Doodles';

interface HowItWorksProps {
  onDownloadClick: () => void;
}

export const HowItWorksSection: React.FC<HowItWorksProps> = ({ onDownloadClick }) => {
  const getStepIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Smartphone className="w-6 h-6 text-brand-blue" />;
      case 1:
        return <Search className="w-6 h-6 text-brand-orange" />;
      case 2:
        return <Users className="w-6 h-6 text-emerald-600" />;
      default:
        return null;
    }
  };

  return (
    <section className="py-20 sm:py-28 bg-[#FBFDFF] relative overflow-hidden border-t border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-16 relative">
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 w-8 pointer-events-none">
            <BlueAccentDoodle />
          </div>

          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-blue bg-blue-50 px-3 py-1 rounded-full border border-blue-100 inline-block mb-3">
            Simple 3-Step Process
          </span>

          <h2 className="text-[28px] sm:text-[38px] font-extrabold text-brand-dark leading-[1.18] tracking-tight">
            How Campus Buddy Works
          </h2>

          <p className="mt-3 text-brand-secondary text-[13.5px] sm:text-[14.5px] leading-relaxed">
            From downloading the app to meeting your senior at the canteen, here is how easy it is to exchange items.
          </p>
        </div>

        {/* 3 Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {HOW_IT_WORKS_STEPS.map((step, idx) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15, duration: 0.6 }}
              className="relative p-7 rounded-3xl bg-white border border-[#E8EBF0] shadow-card hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Step Number Watermark */}
              <span className="absolute top-5 right-6 text-[44px] font-extrabold text-gray-100/80 select-none">
                {step.step}
              </span>

              <div>
                <div className="w-13 h-13 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-6 shadow-xs">
                  {getStepIcon(idx)}
                </div>

                <span className="text-[11px] font-bold text-brand-blue tracking-wide uppercase">
                  {step.badge}
                </span>

                <h3 className="text-[18px] font-extrabold text-brand-dark mt-1 tracking-tight">
                  {step.title}
                </h3>

                <p className="mt-3 text-[13px] text-brand-secondary leading-relaxed">
                  {step.description}
                </p>
              </div>

              {idx === 0 && (
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <button
                    onClick={onDownloadClick}
                    className="text-[12px] font-bold text-brand-blue hover:text-blue-700 flex items-center gap-1.5 cursor-pointer group"
                  >
                    <span>Get App Now</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};
