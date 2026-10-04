import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Tag, CheckCircle2 } from 'lucide-react';
import { ArrowButton } from './ui/Button';

interface BuyerSellerBenefitsProps {
  onBuyerCTA: () => void;
  onSellerCTA: () => void;
}

export const BuyerSellerBenefits: React.FC<BuyerSellerBenefitsProps> = ({
  onBuyerCTA,
  onSellerCTA,
}) => {
  const buyerPoints = [
    'Discover affordable second-hand essentials at student-friendly prices',
    'Browse products curated and relevant exclusively to student life',
    'Connect directly with verified students in your university network',
    'Grab textbooks and dorm gear right in time for new semester move-in',
  ];

  const sellerPoints = [
    'List items you no longer need in less than 60 seconds with photos',
    'Instantly reach hundreds of students who are actively searching for them',
    'Pass on course books, cycles, drafters, and appliances without hassle',
    'Help juniors save money through sustainable peer-to-peer reuse',
  ];

  return (
    <section className="py-20 sm:py-28 bg-white relative">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-xl mx-auto mb-16 relative">
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-blue bg-blue-50 px-3 py-1 rounded-full border border-blue-100 inline-block mb-3">
            Two Sides of the Marketplace
          </span>

          <h2 className="text-[28px] sm:text-[38px] font-extrabold text-brand-dark leading-[1.18] tracking-tight relative inline-block">
            Built for Buyers & Sellers Alike
          </h2>

          <p className="mt-4 text-brand-secondary text-[13.5px] sm:text-[14.5px] leading-relaxed">
            Whether you are furnishing your hostel room on a budget or clearing out your desk before graduation, Campus Buddy makes it effortless.
          </p>
        </div>

        {/* Two Balanced Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Buyer Panel */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="p-8 sm:p-9 rounded-3xl bg-[#F8FAFC] border border-[#E8EEF5] hover:border-brand-blue/40 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-brand-blue mb-6 shadow-2xs">
                <ShoppingBag className="w-6 h-6" />
              </div>

              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-blue">
                For Student Buyers
              </span>

              <h3 className="text-[22px] sm:text-[24px] font-extrabold text-brand-dark mt-1 tracking-tight">
                Find what you need without overspending.
              </h3>

              <p className="mt-2 text-[13px] text-brand-secondary leading-relaxed">
                Save 50% to 80% on brand-new retail prices by grabbing essentials from seniors who have already taken the course.
              </p>

              <div className="mt-6 space-y-3">
                {buyerPoints.map((point, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-[12.5px] text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200/60">
              <ArrowButton onClick={onBuyerCTA}>
                Find Essentials
              </ArrowButton>
            </div>
          </motion.div>

          {/* Seller Panel */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="p-8 sm:p-9 rounded-3xl bg-[#F8FAFC] border border-[#E8EEF5] hover:border-brand-orange/40 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-brand-orange mb-6 shadow-2xs">
                <Tag className="w-6 h-6" />
              </div>

              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-orange">
                For Student Sellers
              </span>

              <h3 className="text-[22px] sm:text-[24px] font-extrabold text-brand-dark mt-1 tracking-tight">
                Give your unused items a second life.
              </h3>

              <p className="mt-2 text-[13px] text-brand-secondary leading-relaxed">
                Turn clutter into cash without paying brokerages or answering dozens of irrelevant messages from anonymous groups.
              </p>

              <div className="mt-6 space-y-3">
                {sellerPoints.map((point, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-[12.5px] text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-brand-orange shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200/60">
              <ArrowButton onClick={onSellerCTA}>
                Start Selling
              </ArrowButton>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
};
