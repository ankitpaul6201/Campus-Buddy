import React from 'react';
import { motion } from 'framer-motion';
import { BlueAccentDoodle } from './Doodles';

// Restrained, colorful illustrative icons matching screenshot style
const MarketplaceIcon = () => (
  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#9DD6FA]/40 to-[#E1F2FE] flex items-center justify-center p-2.5 shadow-xs">
    <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
      {/* Globe / Marketplace sphere */}
      <circle cx="24" cy="24" r="18" fill="#8ED1FC" />
      <path d="M12 24 C 15 17, 24 16, 27 20 C 30 24, 38 23, 40 24" fill="#38A169" opacity="0.85" />
      <path d="M18 36 C 22 34, 25 38, 32 35 C 36 32, 38 35, 40 33" fill="#38A169" opacity="0.85" />
      <path d="M16 14 C 20 12, 23 15, 27 13" fill="#38A169" opacity="0.85" />
      <circle cx="24" cy="24" r="18" stroke="#0860E8" strokeWidth="1.5" strokeOpacity="0.4" />
    </svg>
  </div>
);

const VerifiedBackpackIcon = () => (
  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FFE4D3]/60 to-[#FFF2EB] flex items-center justify-center p-2.5 shadow-xs">
    <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
      {/* College Bag / Suitcase */}
      <rect x="10" y="16" width="28" height="24" rx="5" fill="#FF874B" />
      <path d="M17 16 V12 C 17 9.8 19 8 21.5 8 H 26.5 C 29 8 31 9.8 31 12 V16" stroke="#D96328" strokeWidth="2.5" />
      <line x1="10" y1="26" x2="38" y2="26" stroke="#D96328" strokeWidth="2" strokeDasharray="3 3" />
      <circle cx="24" cy="26" r="3" fill="#FFF" />
      <rect x="18" y="32" width="12" height="5" rx="1.5" fill="#FFA97A" />
    </svg>
  </div>
);

const SecureTicketIcon = () => (
  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#DCEAFC]/60 to-[#EDF5FF] flex items-center justify-center p-2.5 shadow-xs">
    <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
      {/* Pass / Shield ticket */}
      <rect x="8" y="14" width="32" height="20" rx="4" fill="#0860E8" />
      <circle cx="8" cy="24" r="3" fill="#FFF" />
      <circle cx="40" cy="24" r="3" fill="#FFF" />
      <line x1="20" y1="16" x2="20" y2="32" stroke="#FFF" strokeWidth="1.5" strokeDasharray="2 2" strokeOpacity="0.5" />
      <path d="M26 21 L 29 25 L 34 19" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="12" y="21" width="5" height="6" rx="1" fill="#FFF" opacity="0.7" />
    </svg>
  </div>
);

export const BenefitsSection: React.FC = () => {
  const benefits = [
    {
      id: 'affordability',
      title: 'Campus Affordability',
      description: 'Find pre-owned textbooks, notes, drafters and everyday essentials from fellow students at 50-80% off retail.',
      icon: <MarketplaceIcon />,
    },
    {
      id: 'convenience',
      title: 'One-Stop Convenience',
      description: 'Discover relevant items through one dedicated campus platform rather than searching multiple informal groups.',
      icon: <VerifiedBackpackIcon />,
    },
    {
      id: 'reuse',
      title: 'Sustainable Reuse',
      description: 'Useful belongings move from one student to another instead of remaining unused after a semester or graduation.',
      icon: <SecureTicketIcon />,
    },
  ];

  return (
    <section id="about" className="py-20 sm:py-28 bg-white relative">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Block */}
          <div className="lg:col-span-4 relative">
            {/* Doodle stroke */}
            <div className="absolute -top-6 -left-3 w-8 pointer-events-none">
              <BlueAccentDoodle />
            </div>

            <motion.h2
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-[28px] sm:text-[34px] font-extrabold text-brand-dark leading-[1.18] tracking-tight"
            >
              That’s The Way<br />
              Campus Life Works!
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="mt-3.5 text-brand-secondary text-[13px] sm:text-[14px] leading-relaxed max-w-sm"
            >
              Making campus life more affordable, connected and convenient for students across India through trusted peer-to-peer reuse.
            </motion.p>
          </div>


          {/* Three Benefit Columns */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6">
            {benefits.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  delay: 0.15 + index * 0.15,
                  duration: 0.5,
                  type: 'spring',
                  stiffness: 220,
                  damping: 18,
                }}
                className="flex flex-col items-start"
              >
                <div className="mb-4 transform hover:scale-105 transition-transform duration-200">
                  {item.icon}
                </div>
                
                <h3 className="text-[15px] font-bold text-brand-dark tracking-tight">
                  {item.title}
                </h3>
                
                <p className="mt-2 text-[12.5px] text-brand-secondary leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};
