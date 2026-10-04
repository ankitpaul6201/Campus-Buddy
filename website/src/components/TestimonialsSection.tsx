import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { TESTIMONIALS } from '../data/mockData';

// Individual Testimonial Card with Cursor-Tracking Brand-Blue Edge Glow
const TestimonialCard: React.FC<{ item: (typeof TESTIMONIALS)[0] }> = ({ item }) => {
  const [mousePos, setMousePos] = React.useState({ x: 180, y: 120 });
  const [isHovered, setIsHovered] = React.useState(false);
  const cardRef = React.useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-[300px] sm:w-[370px] shrink-0 rounded-2xl transition-all duration-300 select-none group"
      style={{
        boxShadow: isHovered
          ? '0 0 32px -2px rgba(8, 96, 232, 0.42), 0 0 14px 2px rgba(56, 189, 248, 0.48), 0 14px 35px rgba(8, 96, 232, 0.12)'
          : '0 4px 20px rgba(0, 0, 0, 0.03)',
      }}
    >
      {/* 1. Neon Glowing Edge Line (Tracks Cursor along borders) */}
      <div
        className="absolute -inset-[1.5px] rounded-[17.5px] pointer-events-none transition-opacity duration-300"
        style={{
          background: isHovered
            ? `radial-gradient(280px circle at ${mousePos.x}px ${mousePos.y}px, #38BDF8 0%, #0860E8 45%, #0860E8 70%, transparent 100%)`
            : 'transparent',
          opacity: isHovered ? 1 : 0,
        }}
      />

      {/* 2. Soft Outer Glow Light-Spill Aura (matching uploaded screenshot) */}
      <div
        className="absolute -inset-2 rounded-2xl pointer-events-none transition-opacity duration-300 blur-lg -z-10"
        style={{
          background: isHovered
            ? `radial-gradient(340px circle at ${mousePos.x}px ${mousePos.y}px, rgba(8, 96, 232, 0.55) 0%, rgba(56, 189, 248, 0.35) 45%, transparent 75%)`
            : 'transparent',
          opacity: isHovered ? 1 : 0,
        }}
      />

      {/* 3. Inner Review Card Body */}
      <div
        className={`w-full h-full p-6 sm:p-7 rounded-2xl bg-white border transition-all duration-300 flex flex-col justify-between relative z-10 ${
          isHovered ? 'border-transparent' : 'border-slate-200/90'
        }`}
        style={{
          backgroundImage: isHovered
            ? `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(8, 96, 232, 0.035), transparent 70%)`
            : undefined,
        }}
      >
        <div>
          <div className="flex items-center justify-between mb-3">
            {/* Large Blue Quotation Mark */}
            <span className="text-[32px] sm:text-[36px] font-serif font-black text-brand-blue leading-none select-none block">
              ““
            </span>

            {/* 5 Orange Stars */}
            <div className="flex items-center gap-0.5">
              {[...Array(item.rating)].map((_, i) => (
                <Star
                  key={i}
                  className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]"
                />
              ))}
            </div>
          </div>

          {/* Testimonial Quote */}
          <p className="text-[13px] sm:text-[14px] font-normal text-brand-dark leading-relaxed">
            "{item.quote}"
          </p>
        </div>

        {/* Bottom Separator & Author Info */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-3">
          <img
            src={item.avatar}
            alt={item.name}
            className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-200 shadow-xs"
          />
          <div className="min-w-0">
            <h4 className="text-[13.5px] font-bold text-brand-dark leading-tight truncate">
              {item.name}
            </h4>
            <p className="text-[11px] text-gray-400 leading-tight mt-0.5 truncate">
              {item.role} • {item.college}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const TestimonialsSection: React.FC = () => {
  // Quadruple items to ensure seamless infinite looping even on ultra-wide / 4K displays
  const marqueeTestimonials = [
    ...TESTIMONIALS,
    ...TESTIMONIALS,
    ...TESTIMONIALS,
    ...TESTIMONIALS,
  ];

  return (
    <section className="py-20 sm:py-28 bg-white relative overflow-hidden">
      <style>{`
        @keyframes marqueeLeftToRight {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0%);
          }
        }
        .animate-marquee-ltr {
          display: flex;
          width: max-content;
          animation: marqueeLeftToRight 45s linear infinite;
          will-change: transform;
        }
      `}</style>

      <div className="max-w-6xl mx-auto px-5 sm:px-8 mb-12 sm:mb-14">
        {/* Section Header: Heading without arrow buttons */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl"
        >
          <h2 className="text-[28px] sm:text-[38px] font-extrabold text-brand-dark leading-[1.18] tracking-tight">
            Satisfied Students Are<br />
            Our Best Advocates.
          </h2>
          <p className="mt-3 text-brand-secondary text-[14px] sm:text-[15px] leading-relaxed">
            Real feedback from students buying, selling, and connecting across campus communities.
          </p>
        </motion.div>
      </div>

      {/* Infinite Reviews Marquee Container (Moving from Left to Right) */}
      <div className="relative w-full overflow-hidden py-3">
        {/* Soft Left and Right Edge Gradient Fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-36 bg-gradient-to-r from-white via-white/80 to-transparent z-20" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-36 bg-gradient-to-l from-white via-white/80 to-transparent z-20" />

        {/* Continuous Marquee Track */}
        <div className="animate-marquee-ltr hover:[animation-play-state:paused] gap-6 py-6 px-4">
          {marqueeTestimonials.map((item, idx) => (
            <TestimonialCard key={`${item.id}-${idx}`} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
};
