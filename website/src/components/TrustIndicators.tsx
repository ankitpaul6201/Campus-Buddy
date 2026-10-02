import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Percent, Building2 } from 'lucide-react';
import { TRUST_INDICATORS } from '../data/mockData';

export const TrustIndicators: React.FC = () => {
  const getIcon = (id: string) => {
    switch (id) {
      case 'commission':
        return (
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-100 to-emerald-50 flex items-center justify-center text-emerald-600 shadow-xs">
            <Percent className="w-5 h-5 stroke-[2.5]" />
          </div>
        );
      case 'verification':
        return (
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-100 to-[#EBF5FE] flex items-center justify-center text-brand-blue shadow-xs">
            <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
          </div>
        );
      case 'handover':
        return (
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-100 to-[#FFF4ED] flex items-center justify-center text-brand-orange shadow-xs">
            <Building2 className="w-5 h-5 stroke-[2.5]" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <section className="py-6 sm:py-8 bg-white border-b border-gray-100 relative z-20">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {TRUST_INDICATORS.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="flex items-start gap-4 p-4 rounded-2xl bg-[#FBFDFF] border border-[#EDF2F7] hover:border-brand-blue/30 hover:shadow-xs transition-all duration-200"
            >
              <div className="shrink-0">{getIcon(item.id)}</div>
              <div>
                <h4 className="text-[14px] font-bold text-brand-dark tracking-tight">
                  {item.title}
                </h4>
                <p className="text-[12px] text-brand-secondary leading-relaxed mt-1">
                  {item.shortDesc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
