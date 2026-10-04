import React, { useRef, useEffect } from 'react';

interface InfiniteGridProps {
  className?: string;
}

export const InfiniteGrid: React.FC<InfiniteGridProps> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const parent = containerRef.current?.parentElement;
    if (!parent) return;

    let rafId: number | null = null;
    let targetX = -1000;
    let targetY = -1000;

    const handlePointerMove = (e: PointerEvent) => {
      const rect = parent.getBoundingClientRect();
      targetX = e.clientX - rect.left;
      targetY = e.clientY - rect.top;

      if (!rafId) {
        rafId = requestAnimationFrame(() => {
          if (containerRef.current) {
            containerRef.current.style.setProperty('--mouse-x', `${targetX}px`);
            containerRef.current.style.setProperty('--mouse-y', `${targetY}px`);
            containerRef.current.style.setProperty('--spotlight-opacity', '1');
          }
          rafId = null;
        });
      }
    };

    const handlePointerLeave = () => {
      if (containerRef.current) {
        containerRef.current.style.setProperty('--spotlight-opacity', '0');
      }
    };

    parent.addEventListener('pointermove', handlePointerMove, { passive: true });
    parent.addEventListener('pointerleave', handlePointerLeave, { passive: true });

    return () => {
      parent.removeEventListener('pointermove', handlePointerMove);
      parent.removeEventListener('pointerleave', handlePointerLeave);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0 ${className}`}
      aria-hidden="true"
      style={{
        background: `
          linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.75) 75%, #ffffff 100%),
          radial-gradient(ellipse 90% 60% at 50% 20%, rgba(8, 96, 232, 0.05) 0%, transparent 70%)
        `,
      }}
    >
      {/* 1. Base Subtle Ambient Grid Layer */}
      <svg
        className="w-full h-full opacity-45"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
      >
        <defs>
          <pattern
            id="baseSubGrid"
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

          <pattern
            id="baseMajorGrid"
            width="192"
            height="192"
            patternUnits="userSpaceOnUse"
          >
            <rect width="192" height="192" fill="url(#baseSubGrid)" />
            <path
              d="M 192 0 L 0 0 0 192"
              fill="none"
              stroke="rgba(8, 96, 232, 0.08)"
              strokeWidth="1.2"
            />
            {/* Subtle Crosshairs */}
            <path
              d="M 96 90 L 96 102 M 90 96 L 102 96"
              fill="none"
              stroke="rgba(8, 96, 232, 0.15)"
              strokeWidth="1.2"
            />
            <circle cx="0" cy="0" r="1.5" fill="rgba(8, 96, 232, 0.2)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#baseMajorGrid)" />
      </svg>

      {/* 2. Interactive Spotlight Glow (Reacts to cursor hover) */}
      <div
        className="absolute inset-0 transition-opacity duration-300 ease-out pointer-events-none"
        style={{
          opacity: 'var(--spotlight-opacity, 0)',
          background: `radial-gradient(420px circle at var(--mouse-x, -1000px) var(--mouse-y, -1000px), rgba(56, 189, 248, 0.15) 0%, rgba(8, 96, 232, 0.05) 50%, transparent 80%)`,
        }}
      />

      {/* 3. Interactive Illuminated Grid (Highlighted under cursor) */}
      <div
        className="absolute inset-0 transition-opacity duration-300 ease-out pointer-events-none"
        style={{
          opacity: 'var(--spotlight-opacity, 0)',
          maskImage: `radial-gradient(320px circle at var(--mouse-x, -1000px) var(--mouse-y, -1000px), black 20%, transparent 100%)`,
          WebkitMaskImage: `radial-gradient(320px circle at var(--mouse-x, -1000px) var(--mouse-y, -1000px), black 20%, transparent 100%)`,
        }}
      >
        <svg
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
        >
          <defs>
            <pattern
              id="activeSubGrid"
              width="48"
              height="48"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 48 0 L 0 0 0 48"
                fill="none"
                stroke="rgba(8, 96, 232, 0.18)"
                strokeWidth="1.2"
              />
            </pattern>

            <pattern
              id="activeMajorGrid"
              width="192"
              height="192"
              patternUnits="userSpaceOnUse"
            >
              <rect width="192" height="192" fill="url(#activeSubGrid)" />
              <path
                d="M 192 0 L 0 0 0 192"
                fill="none"
                stroke="rgba(8, 96, 232, 0.35)"
                strokeWidth="1.5"
              />
              {/* Illuminated Crosshairs & Glowing Intersection Dots */}
              <path
                d="M 96 88 L 96 104 M 88 96 L 104 96"
                fill="none"
                stroke="rgba(8, 96, 232, 0.55)"
                strokeWidth="1.8"
              />
              <circle cx="0" cy="0" r="2.5" fill="rgba(8, 96, 232, 0.65)" />
              <circle cx="96" cy="96" r="2" fill="rgba(56, 189, 248, 0.7)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#activeMajorGrid)" />
        </svg>
      </div>
    </div>
  );
};

export default InfiniteGrid;
