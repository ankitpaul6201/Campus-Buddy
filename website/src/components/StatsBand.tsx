import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { STATS } from '../data/mockData';

interface CountUpProps {
  end: number;
  duration?: number;
  isDecimal?: boolean;
}

const CountUpNumber: React.FC<CountUpProps> = ({ end, duration = 1.8, isDecimal = false }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const stepTime = 20;
    const totalSteps = (duration * 1000) / stepTime;
    const increment = end / totalSteps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      start += increment;
      if (currentStep >= totalSteps) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(isDecimal ? parseFloat(start.toFixed(1)) : Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [isInView, end, duration, isDecimal]);

  return (
    <span ref={ref}>
      {isDecimal ? count.toFixed(1) : count}
    </span>
  );
};

export const StatsBand: React.FC = () => {
  return (
    <section className="w-full max-w-full overflow-hidden bg-[#0860E8] py-7 sm:py-10 text-white relative z-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-2 md:grid-cols-4 gap-5 sm:gap-8 items-center md:divide-x divide-white/20"
        >
          {STATS.map((stat, idx) => (
            <div
              key={idx}
              className={`flex flex-col items-center md:items-start text-center md:text-left ${
                idx >= 2 ? 'pt-4 border-t border-white/20 md:border-t-0 md:pt-0' : ''
              } ${idx !== 0 ? 'md:pl-8' : ''}`}
            >
              <div className="text-[28px] sm:text-[40px] font-extrabold tracking-tight leading-tight flex items-baseline">
                <CountUpNumber end={stat.value} isDecimal={stat.isDecimal} />
                <span className="ml-0.5">{stat.suffix}</span>
              </div>
              <p className="text-[11.5px] sm:text-[13px] text-white/80 font-normal tracking-wide mt-0.5">
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
