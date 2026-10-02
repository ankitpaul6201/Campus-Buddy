import React from 'react';

// Light-blue doodle strokes beside headline
export const HeroDoodle: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    viewBox="0 0 70 50"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`stroke-[#9DD6FA] stroke-[2.5] stroke-linecap-round stroke-linejoin-round pointer-events-none select-none ${className}`}
  >
    <path d="M12 40 C 25 15, 45 10, 60 8" />
    <path d="M30 45 C 42 28, 55 22, 66 22" />
    <path d="M48 48 C 54 38, 62 32, 68 32" />
  </svg>
);

// Orange doodle burst / accent
export const OrangeBurstDoodle: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    viewBox="0 0 45 45"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`stroke-[#FF874B] stroke-[2.5] stroke-linecap-round pointer-events-none select-none ${className}`}
  >
    <line x1="8" y1="36" x2="16" y2="28" />
    <line x1="18" y1="42" x2="22" y2="30" />
    <line x1="30" y1="44" x2="28" y2="34" />
  </svg>
);

// Blue hand-drawn doodle strokes for benefit & testimonials
export const BlueAccentDoodle: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    viewBox="0 0 35 35"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`stroke-[#9DD6FA] stroke-[2.5] stroke-linecap-round pointer-events-none select-none ${className}`}
  >
    <line x1="8" y1="28" x2="16" y2="16" />
    <line x1="22" y1="32" x2="24" y2="18" />
    <line x1="32" y1="28" x2="29" y2="18" />
  </svg>
);

// Hand-drawn orange underline under hero headline
export const OrangeUnderline: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    viewBox="0 0 280 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`overflow-visible pointer-events-none select-none ${className}`}
  >
    <path
      d="M3 14 C 60 5, 140 18, 275 8 C 210 17, 100 13, 30 17"
      stroke="#FF874B"
      strokeWidth="4"
      strokeLinecap="round"
      className="animate-draw-underline"
    />
  </svg>
);

// Flowing light-blue curved thread behind sections (recreated from screenshot)
export const CurvedThreadDoodle: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    viewBox="0 0 400 300"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`stroke-[#9DD6FA]/60 stroke-[1.8] stroke-linecap-round pointer-events-none select-none ${className}`}
  >
    <path d="M20 280 C 120 220, 280 320, 360 180 C 420 80, 290 20, 210 80 C 130 140, 160 250, 270 240 C 350 230, 390 150, 380 90" />
  </svg>
);

// Bottom left curved thread for FAQ section
export const FaqThreadDoodle: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    viewBox="0 0 250 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`stroke-[#9DD6FA]/60 stroke-[1.8] stroke-linecap-round pointer-events-none select-none ${className}`}
  >
    <path d="M10 30 C 80 10, 130 90, 80 140 C 30 190, 120 200, 190 130 C 230 90, 200 30, 150 40" />
  </svg>
);
