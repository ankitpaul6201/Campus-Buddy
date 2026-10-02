import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Star } from 'lucide-react';
import { TESTIMONIALS } from '../data/mockData';
import { BlueAccentDoodle } from './Doodles';

export const TestimonialsSection: React.FC = () => {
  const [startIndex, setStartIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const total = TESTIMONIALS.length;

  const nextTestimonials = () => {
    setStartIndex((prev) => (prev + 1) % total);
  };

  const prevTestimonials = () => {
    setStartIndex((prev) => (prev - 1 + total) % total);
  };

  // Auto-advance slowly every 5.5s, paused when user hovers
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextTestimonials, 5500);
    return () => clearInterval(interval);
  }, [isPaused]);

  // For 3 items on desktop
  const visibleIndices = [
    startIndex,
    (startIndex + 1) % total,
    (startIndex + 2) % total,
  ];

  return (
    <section className="py-20 sm:py-28 bg-white relative">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        
        {/* Section Header with Left Heading and Right Arrow Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 sm:mb-14 relative">
          
          <div className="relative">
            {/* Blue doodle strokes top-left */}
            <div className="absolute -top-6 -left-3 w-8 pointer-events-none">
              <BlueAccentDoodle />
            </div>

            <motion.h2
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-[28px] sm:text-[36px] font-extrabold text-brand-dark leading-[1.18] tracking-tight"
            >
              Satisfied Students Are<br />
              Our Best Advocates.
            </motion.h2>
          </div>

          {/* Right Arrow Controls matching screenshot style */}
          <div className="flex items-center gap-3 mt-6 sm:mt-0">
            <button
              onClick={prevTestimonials}
              className="w-10 h-10 rounded-full border border-gray-300 hover:border-brand-dark text-brand-dark flex items-center justify-center transition-colors cursor-pointer active:scale-95"
              aria-label="Previous testimonials"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextTestimonials}
              className="w-10 h-10 rounded-full border border-gray-300 hover:border-brand-dark text-brand-dark flex items-center justify-center transition-colors cursor-pointer active:scale-95"
              aria-label="Next testimonials"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Testimonials Cards Grid */}
        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-6"
        >
          {visibleIndices.map((idx, colIdx) => {
            const item = TESTIMONIALS[idx];
            return (
              <motion.div
                key={`${item.id}-${colIdx}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="flex flex-col justify-between p-2 sm:p-0"
              >
                <div>
                  {/* Large Blue Quotation Mark matching screenshot */}
                  <span className="text-[34px] font-serif font-black text-brand-blue leading-none select-none block mb-2">
                    ““
                  </span>

                  {/* Testimonial Quote */}
                  <p className="text-[13px] sm:text-[14px] font-normal text-brand-dark leading-relaxed">
                    "{item.quote}"
                  </p>
                </div>

                {/* Bottom Separator & Author Info */}
                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-3">
                  <img
                    src={item.avatar}
                    alt={item.name}
                    className="w-10 h-10 rounded-full object-cover shrink-0"
                  />
                  <div>
                    <h4 className="text-[13px] font-bold text-brand-dark leading-tight">
                      {item.name}
                    </h4>
                    <p className="text-[11px] text-gray-400 leading-tight mt-0.5">
                      {item.role} • {item.college}
                    </p>
                    {/* 5 Orange Stars */}
                    <div className="flex items-center gap-0.5 mt-1">
                      {[...Array(item.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-3 h-3 fill-brand-orange text-brand-orange"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
