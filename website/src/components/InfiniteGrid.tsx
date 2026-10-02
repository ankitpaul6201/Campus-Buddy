import React, { useRef, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useMotionTemplate } from 'framer-motion';

interface InfiniteGridProps {
  className?: string;
}

export const InfiniteGrid: React.FC<InfiniteGridProps> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse position and visibility motion values
  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);
  const targetOpacity = useMotionValue(0);

  // Smooth springs for fluid, organic cursor tracking and fade
  const smoothMouseX = useSpring(mouseX, { stiffness: 180, damping: 25, mass: 0.1 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 180, damping: 25, mass: 0.1 });
  const smoothOpacity = useSpring(targetOpacity, { stiffness: 140, damping: 20 });

  // Dynamic radial gradients tied to the mouse coordinates
  const glowRadialGradient = useMotionTemplate`radial-gradient(320px circle at ${smoothMouseX}px ${smoothMouseY}px, rgba(8, 96, 232, 0.11) 0%, rgba(56, 189, 248, 0.05) 45%, transparent 75%)`;
  const gridMaskImage = useMotionTemplate`radial-gradient(280px circle at ${smoothMouseX}px ${smoothMouseY}px, black 0%, transparent 80%)`;

  useEffect(() => {
    const parentSection = containerRef.current?.closest('section') || containerRef.current?.parentElement;
    if (!parentSection) return;

    let rect = parentSection.getBoundingClientRect();
    let ticking = false;

    const updateRect = () => {
      rect = parentSection.getBoundingClientRect();
    };

    window.addEventListener('resize', updateRect, { passive: true });
    window.addEventListener('scroll', updateRect, { passive: true });

    const handlePointerMove = (e: MouseEvent | PointerEvent) => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        ticking = false;
        const isInside =
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom;

        if (isInside) {
          mouseX.set(e.clientX - rect.left);
          mouseY.set(e.clientY - rect.top);
          targetOpacity.set(1);
        } else {
          targetOpacity.set(0);
        }
      });
    };

    const handlePointerLeave = () => {
      targetOpacity.set(0);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('blur', handlePointerLeave);
    document.addEventListener('mouseleave', handlePointerLeave);

    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('blur', handlePointerLeave);
      document.removeEventListener('mouseleave', handlePointerLeave);
    };
  }, [mouseX, mouseY, targetOpacity]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0 ${className}`}
      style={{
        maskImage: 'linear-gradient(to bottom, black 0%, black calc(100% - 160px), transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black calc(100% - 160px), transparent 100%)',
      }}
      aria-hidden="true"
    >
      {/* SVG Definitions for Grid Patterns */}
      <svg className="absolute w-0 h-0" xmlns="http://www.w3.org/2000/svg">
        <defs>
          {/* Base 48px Fine Sub-Grid */}
          <pattern
            id="staticSubGrid"
            width="48"
            height="48"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 48 0 L 0 0 0 48"
              fill="none"
              stroke="rgba(8, 96, 232, 0.04)"
              strokeWidth="1"
            />
          </pattern>

          {/* Base 192px Major Grid with Crosshairs */}
          <pattern
            id="staticMajorGrid"
            width="192"
            height="192"
            patternUnits="userSpaceOnUse"
          >
            <rect width="192" height="192" fill="url(#staticSubGrid)" />
            <path
              d="M 192 0 L 0 0 0 192"
              fill="none"
              stroke="rgba(8, 96, 232, 0.08)"
              strokeWidth="1.2"
            />
            {/* Subtle Crosshairs */}
            <path
              d="M 96 91 L 96 101 M 91 96 L 101 96"
              fill="none"
              stroke="rgba(8, 96, 232, 0.14)"
              strokeWidth="1.2"
            />
            <circle cx="0" cy="0" r="1.5" fill="rgba(8, 96, 232, 0.18)" />
          </pattern>

          {/* Active / Glowing 48px Sub-Grid under Mouse Pointer */}
          <pattern
            id="glowSubGrid"
            width="48"
            height="48"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 48 0 L 0 0 0 48"
              fill="none"
              stroke="rgba(8, 96, 232, 0.16)"
              strokeWidth="1.2"
            />
          </pattern>

          {/* Active / Glowing 192px Major Grid with Glowing Intersections */}
          <pattern
            id="glowMajorGrid"
            width="192"
            height="192"
            patternUnits="userSpaceOnUse"
          >
            <rect width="192" height="192" fill="url(#glowSubGrid)" />
            <path
              d="M 192 0 L 0 0 0 192"
              fill="none"
              stroke="rgba(8, 96, 232, 0.28)"
              strokeWidth="1.4"
            />
            <path
              d="M 96 89 L 96 103 M 89 96 L 103 96"
              fill="none"
              stroke="rgba(8, 96, 232, 0.45)"
              strokeWidth="1.4"
            />
            <circle cx="0" cy="0" r="2.5" fill="rgba(8, 96, 232, 0.55)" />
          </pattern>
        </defs>
      </svg>

      {/* 1. Base Static Grid Layer with soft edge vignette fade */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          maskImage: 'radial-gradient(ellipse 85% 72% at 50% 40%, black 30%, transparent 95%)',
          WebkitMaskImage: 'radial-gradient(ellipse 85% 72% at 50% 40%, black 30%, transparent 95%)',
        }}
      >
        <svg
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
        >
          <rect width="100%" height="100%" fill="url(#staticMajorGrid)" />
        </svg>
      </div>

      {/* 2. Interactive Light Blue Glow & Spotlight Reaction */}
      <motion.div
        className="absolute inset-0 w-full h-full pointer-events-none transform-gpu will-change-transform"
        style={{
          opacity: smoothOpacity,
          maskImage: 'linear-gradient(to bottom, black 0%, black calc(100% - 150px), transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black calc(100% - 150px), transparent 100%)',
        }}
      >
        {/* Pure CSS Radial Glow (ultra-fast, zero GPU blur shader overhead) */}
        <motion.div
          className="absolute inset-0 w-full h-full"
          style={{ background: glowRadialGradient }}
        />

        {/* Illuminated Grid lines focused immediately around the cursor */}
        <motion.div
          className="absolute inset-0 w-full h-full transform-gpu"
          style={{
            maskImage: gridMaskImage,
            WebkitMaskImage: gridMaskImage,
          }}
        >
          <svg
            className="w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
            width="100%"
            height="100%"
          >
            <rect width="100%" height="100%" fill="url(#glowMajorGrid)" />
          </svg>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default InfiniteGrid;
