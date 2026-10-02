import React from 'react';
import { motion } from 'framer-motion';
import { Users, ShieldCheck, MessageSquare, Flag, ArrowRight, CheckCircle2 } from 'lucide-react';
import { BlueAccentDoodle } from './Doodles';

interface TrustSafetySectionProps {
  onLearnMore?: (topic: string) => void;
}

export const TrustSafetySection: React.FC<TrustSafetySectionProps> = ({ onLearnMore }) => {
  const safetyCards = [
    {
      title: 'Student-Focused Community',
      description: 'Campus Buddy is intentionally built around trusted peer exchanges within verified college and campus networks.',
      icon: <Users className="w-5 h-5 text-brand-blue" />,
      tag: 'Campus Network'
    },
    {
      title: 'Institutional Account Verification',
      description: 'We authenticate student accounts through university email addresses (.ac.in / .edu) or college identity cards.',
      icon: <ShieldCheck className="w-5 h-5 text-emerald-600" />,
      tag: 'ID Safeguard'
    },
    {
      title: 'Protected In-App Messaging',
      description: 'Negotiate deals and coordinate campus meeting points securely in-app without revealing your phone number upfront.',
      icon: <MessageSquare className="w-5 h-5 text-brand-orange" />,
      tag: 'Privacy First'
    },
    {
      title: 'Safer Exchanges & Instant Reporting',
      description: 'We encourage handovers during daylight in public campus spots like cafeterias, with 1-tap reporting for any concern.',
      icon: <Flag className="w-5 h-5 text-indigo-600" />,
      tag: 'Zero Tolerance'
    }
  ];

  return (
    <section className="py-20 sm:py-28 bg-[#FBFDFF] relative overflow-hidden border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-14 relative">
          <div className="relative">
            <div className="absolute -top-6 -left-3 w-8 pointer-events-none">
              <BlueAccentDoodle />
            </div>

            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 inline-block mb-3">
              Trust & Community Safety
            </span>

            <h2 className="text-[28px] sm:text-[36px] font-extrabold text-brand-dark leading-[1.18] tracking-tight">
              A Safer Marketplace Built<br />
              Specifically for Students.
            </h2>
          </div>

          <p className="mt-4 md:mt-0 text-brand-secondary text-[13px] sm:text-[14px] leading-relaxed max-w-sm">
            We prioritize authentic college peer connections with safeguards designed around how campus communities actually interact.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {safetyCards.map((card, idx) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="p-6 sm:p-7 rounded-2xl bg-white border border-[#E8EBF0] shadow-card hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shadow-2xs">
                    {card.icon}
                  </div>
                  <span className="text-[10px] font-bold tracking-wider text-gray-500 uppercase bg-gray-100/70 px-2.5 py-0.5 rounded-full">
                    {card.tag}
                  </span>
                </div>

                <h3 className="text-[16px] font-bold text-brand-dark tracking-tight">
                  {card.title}
                </h3>

                <p className="mt-2 text-[13px] text-brand-secondary leading-relaxed">
                  {card.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-gray-100 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified campus security guideline</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer Quick Safety Links */}
        <div className="mt-10 p-5 rounded-2xl bg-white border border-gray-200/70 flex flex-wrap items-center justify-between gap-4 text-[12.5px]">
          <span className="font-semibold text-brand-dark">Campus Safety Guidelines:</span>
          <div className="flex flex-wrap items-center gap-4 text-brand-blue font-medium">
            <button
              onClick={() => onLearnMore?.('Student Guidelines')}
              className="hover:underline flex items-center gap-1 cursor-pointer"
            >
              Student Guidelines <ArrowRight className="w-3 h-3" />
            </button>
            <button
              onClick={() => onLearnMore?.('Safety Tips')}
              className="hover:underline flex items-center gap-1 cursor-pointer"
            >
              Safety Tips <ArrowRight className="w-3 h-3" />
            </button>
            <button
              onClick={() => onLearnMore?.('Listing Rules')}
              className="hover:underline flex items-center gap-1 cursor-pointer"
            >
              Listing Rules <ArrowRight className="w-3 h-3" />
            </button>
            <button
              onClick={() => onLearnMore?.('Report an Issue')}
              className="hover:underline flex items-center gap-1 cursor-pointer"
            >
              Report an Issue <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
