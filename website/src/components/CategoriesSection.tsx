import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, BookOpen, PenTool, Calculator, Bike, Laptop, Home, Sparkles } from 'lucide-react';
import { MARKETPLACE_CATEGORIES } from '../data/mockData';
import { OrangeBurstDoodle } from './Doodles';

interface CategoriesSectionProps {
  onCategoryClick: () => void;
}

export const CategoriesSection: React.FC<CategoriesSectionProps> = ({ onCategoryClick }) => {
  const getCategoryIcon = (type: string) => {
    switch (type) {
      case 'book':
        return <BookOpen className="w-5 h-5 text-brand-blue" />;
      case 'pen':
        return <PenTool className="w-5 h-5 text-brand-orange" />;
      case 'calculator':
        return <Calculator className="w-5 h-5 text-emerald-600" />;
      case 'bike':
        return <Bike className="w-5 h-5 text-indigo-600" />;
      case 'gadgets':
        return <Laptop className="w-5 h-5 text-pink-600" />;
      case 'home':
        return <Home className="w-5 h-5 text-amber-600" />;
      default:
        return <Sparkles className="w-5 h-5 text-purple-600" />;
    }
  };

  return (
    <section className="py-20 sm:py-28 bg-white relative">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 sm:mb-14 relative">
          <div className="relative">
            <div className="absolute -top-7 right-2 w-9 pointer-events-none">
              <OrangeBurstDoodle />
            </div>

            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-orange bg-orange-50 px-3 py-1 rounded-full border border-orange-100 inline-block mb-3">
              Explore Campus Categories
            </span>

            <h2 className="text-[28px] sm:text-[36px] font-extrabold text-brand-dark leading-[1.18] tracking-tight">
              Everything You Need,<br />
              Categorized for Campus Life.
            </h2>
          </div>

          <p className="mt-4 sm:mt-0 text-brand-secondary text-[13px] sm:text-[14px] leading-relaxed max-w-sm">
            From first-year drafters to final-year cycles, explore pre-loved college items ready for immediate on-campus exchange.
          </p>
        </div>

        {/* 7 Category Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {MARKETPLACE_CATEGORIES.map((cat, index) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.5 }}
              onClick={onCategoryClick}
              className="group p-5 rounded-2xl bg-[#FBFDFF] border border-[#EDF2F7] hover:border-brand-blue/30 hover:shadow-card hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${cat.gradient} flex items-center justify-center p-2.5 shadow-xs group-hover:scale-110 transition-transform duration-200`}>
                    {getCategoryIcon(cat.iconType)}
                  </div>
                  <span className="text-[11px] font-semibold text-gray-400 bg-white px-2 py-0.5 rounded-full border border-gray-100">
                    {cat.itemCount}
                  </span>
                </div>

                <h3 className="text-[15px] font-bold text-brand-dark group-hover:text-brand-blue transition-colors tracking-tight">
                  {cat.name}
                </h3>

                <p className="mt-2 text-[12px] text-brand-secondary leading-relaxed">
                  {cat.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-gray-100/80 flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {cat.popularItems.slice(0, 2).map((item, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-medium text-gray-500 bg-gray-100/70 px-2 py-0.5 rounded-md"
                    >
                      {item}
                    </span>
                  ))}
                </div>

                <div className="w-7 h-7 rounded-full bg-white text-gray-400 group-hover:bg-brand-blue group-hover:text-white border border-gray-100 flex items-center justify-center transition-all shrink-0">
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};
