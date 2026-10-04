import React, { useState, useEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { MARKETPLACE_CATEGORIES, CategoryItem } from '../data/mockData';

gsap.registerPlugin(ScrollTrigger);

export const CategoriesSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragDistance = useRef(0);
  const categoriesCount = MARKETPLACE_CATEGORIES.length;

  // ScrollTrigger to scrub the 3D coverflow as user scrolls down the page
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // Use gsap.matchMedia so desktop retains 3D coverflow scroll scrubbing with anticipatePin,
    // while mobile allows natural, smooth touch scrolling without any screen-pinning bounce.
    const mm = gsap.matchMedia();

    mm.add('(min-width: 768px)', () => {
      const trigger = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: '+=160%',
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        scrub: true,
        onUpdate: (self) => {
          const totalSteps = categoriesCount * 2;
          const targetIndex = Math.floor(self.progress * totalSteps) % categoriesCount;
          setCurrentIndex(targetIndex);
        }
      });

      return () => {
        trigger.kill();
      };
    });

    return () => {
      mm.revert();
    };
  }, [categoriesCount]);

  // Touch and mouse drag handlers for direct sideways swiping
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragStartX.current = e.clientX;
    dragDistance.current = 0;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    dragDistance.current = e.clientX - dragStartX.current;
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragDistance.current < -50) {
      handleNext();
    } else if (dragDistance.current > 50) {
      handlePrev();
    }
  };

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % categoriesCount);
  }, [categoriesCount]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + categoriesCount) % categoriesCount);
  }, [categoriesCount]);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev]);

  const activeCategory: CategoryItem = MARKETPLACE_CATEGORIES[currentIndex];

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen py-14 sm:py-20 bg-gradient-to-b from-[#F9FCFF] via-white to-[#F8FAFC] flex flex-col justify-between overflow-hidden select-none max-w-full"
    >
      {/* Background Soft Glow Aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[700px] h-[340px] sm:h-[500px] bg-gradient-to-r from-blue-100/40 via-sky-50/30 to-indigo-50/30 rounded-full blur-[80px] sm:blur-[120px] pointer-events-none -z-10" />

      {/* Top Header */}
      <div className="max-w-6xl mx-auto px-5 sm:px-8 text-center relative z-10 w-full mb-4 sm:mb-6">
        <h2 className="text-[26px] sm:text-[42px] font-extrabold text-brand-dark leading-[1.15] tracking-tight">
          Explore Campus Categories
        </h2>
        <p className="mt-2 text-brand-secondary text-[13px] sm:text-[15px] max-w-xl mx-auto leading-relaxed">
          Scroll or swipe sideways to discover textbook exchanges, drafters, hostel gear, and upcoming student skill gigs.
        </p>
      </div>

      {/* 3D PERSPECTIVE COVERFLOW CAROUSEL (Image 3 Architecture + Image 2 Cards) */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="relative w-full h-[400px] sm:h-[500px] flex items-center justify-center cursor-grab active:cursor-grabbing overflow-hidden my-auto max-w-full"
        style={{
          perspective: isMobile ? '700px' : '1200px',
          transformStyle: 'preserve-3d',
          clipPath: 'inset(0)'
        }}
      >
        {MARKETPLACE_CATEGORIES.map((cat, index) => {
          // Circular shortest distance from currentIndex
          let offset = index - currentIndex;
          if (offset > categoriesCount / 2) offset -= categoriesCount;
          if (offset < -categoriesCount / 2) offset += categoriesCount;

          const isCenter = offset === 0;
          const absOffset = Math.abs(offset);

          // On mobile, only render immediate neighbours to ensure zero horizontal blowout
          const maxRenderOffset = isMobile ? 1 : 3;
          if (absOffset > maxRenderOffset) return null;

          // 3D coverflow transform values matching Image 3 reference
          const xSpacing = isMobile ? 85 : 210;
          const xTranslate = offset * xSpacing; // horizontal spacing
          const zTranslate = -absOffset * (isMobile ? 60 : 85); // depth recession
          const yRotate = offset * (isMobile ? -25 : -32); // inwards 3D angle
          const scale = isCenter ? (isMobile ? 1.0 : 1.05) : Math.max(0.72, 1 - absOffset * 0.12);
          const zIndex = 50 - absOffset * 10;
          const opacity = Math.max(0.35, 1 - absOffset * 0.22);

          const cardWidth = isMobile ? '260px' : '300px';
          const cardHeight = isMobile ? '380px' : '440px';

          return (
            <div
              key={cat.id}
              onClick={() => {
                if (!isCenter) {
                  setCurrentIndex(index);
                }
              }}
              className="absolute transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] transform-gpu will-change-transform cursor-pointer"
              style={{
                width: cardWidth,
                height: cardHeight,
                transform: `translateX(${xTranslate}px) translateZ(${zTranslate}px) rotateY(${yRotate}deg) scale(${scale})`,
                zIndex,
                opacity,
              }}
            >
              {/* CARD CONTAINER (Styled like Image 2: Tall, full-bleed photograph, crisp image visibility, smooth bottom text overlay) */}
              <div className="relative w-full h-full rounded-[28px] sm:rounded-[32px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.18)] border border-white/40 group bg-slate-900">
                
                {/* Full-bleed Photo Background - Sharp & Vibrant */}
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                  loading="eager"
                />

                {/* Bottom Scrim Only: Keeps upper 65% of the photo completely clear & bright, with a smooth dark gradient behind the bottom text */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 via-35% to-transparent pointer-events-none" />

                {/* Bottom Content Area */}
                <div className="absolute bottom-6 inset-x-5 z-10 flex flex-col justify-end text-left">
                  {/* Category Title */}
                  <h3 className="text-[22px] sm:text-[24px] font-black text-white leading-tight tracking-tight drop-shadow-md">
                    {cat.name}
                  </h3>

                  {/* Popular Tags Chips (Curved pill-shaped padding) */}
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {cat.popularItems.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-[10px] font-semibold text-white/90 bg-white/20 backdrop-blur-md border border-white/25 px-2.5 py-0.5 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Info Bar & Navigation Indicators (Matches Image 3) */}
      <div className="max-w-xl mx-auto px-5 text-center relative z-10 w-full mt-4">
        {/* Active Title & Description */}
        <div className="transition-all duration-300">
          <h4 className="text-[18px] sm:text-[20px] font-extrabold text-brand-dark tracking-tight">
            {activeCategory.name}
          </h4>
          <p className="mt-1 text-[12.5px] sm:text-[13.5px] text-brand-secondary line-clamp-1">
            {activeCategory.description}
          </p>
        </div>

        {/* Carousel Controls: Left / Right Arrows + Dots with Directional Reaction & Smooth Padding Transition */}
        <div className="mt-5 flex items-center justify-center gap-5">
          {/* Reactive Left Arrow Button */}
          <button
            onClick={handlePrev}
            className="group relative flex items-center justify-center p-3 sm:p-3.5 rounded-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer hover:-translate-x-2 active:-translate-x-3.5 active:scale-95 focus:outline-none"
            aria-label="Previous category"
          >
            {/* Smooth reactive background and padding color change to black */}
            <span className="absolute inset-0 rounded-full bg-white ring-1 ring-slate-200/90 shadow-sm transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:bg-black group-hover:ring-4 group-hover:ring-black/15 group-hover:shadow-[0_10px_25px_rgba(0,0,0,0.25)] group-active:bg-black group-active:ring-black/25" />
            
            {/* Arrow icon gliding towards left and turning white */}
            <ArrowLeft className="relative z-10 w-4 h-4 text-brand-dark transition-all duration-300 ease-out group-hover:text-white group-active:text-white group-hover:-translate-x-1 group-active:-translate-x-1.5" />
          </button>

          {/* Dots Indicator */}
          <div className="flex items-center gap-1.5 px-1">
            {MARKETPLACE_CATEGORIES.map((_, dotIdx) => (
              <button
                key={dotIdx}
                onClick={() => setCurrentIndex(dotIdx)}
                className={`transition-all duration-400 ease-out rounded-full cursor-pointer ${
                  currentIndex === dotIdx
                    ? 'w-7 h-2 bg-brand-blue shadow-xs'
                    : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to slide ${dotIdx + 1}`}
              />
            ))}
          </div>

          {/* Reactive Right Arrow Button */}
          <button
            onClick={handleNext}
            className="group relative flex items-center justify-center p-3 sm:p-3.5 rounded-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer hover:translate-x-2 active:translate-x-3.5 active:scale-95 focus:outline-none"
            aria-label="Next category"
          >
            {/* Smooth reactive background and padding color change to black */}
            <span className="absolute inset-0 rounded-full bg-white ring-1 ring-slate-200/90 shadow-sm transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:bg-black group-hover:ring-4 group-hover:ring-black/15 group-hover:shadow-[0_10px_25px_rgba(0,0,0,0.25)] group-active:bg-black group-active:ring-black/25" />
            
            {/* Arrow icon gliding towards right and turning white */}
            <ArrowRight className="relative z-10 w-4 h-4 text-brand-dark transition-all duration-300 ease-out group-hover:text-white group-active:text-white group-hover:translate-x-1 group-active:translate-x-1.5" />
          </button>
        </div>
      </div>
    </section>
  );
};
