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

// Encircling blue line loop with arrow around phone (matching reference image)
export const PhoneCurvedLoopDoodle: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    viewBox="0 0 500 650"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`pointer-events-none select-none ${className}`}
  >
    {/* Main dynamic swooping line around phone */}
    <path
      d="M70 480 C 40 380, 50 250, 160 170 C 260 100, 420 120, 450 240 C 480 370, 390 510, 480 580"
      stroke="#60A5FA"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeDasharray="6 6"
      className="opacity-70"
    />
    <path
      d="M380 320 C 440 280, 470 190, 420 140 C 390 110, 370 130, 395 100"
      stroke="#3B82F6"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    {/* Upward curved arrow */}
    <path
      d="M385 108 L 398 96 L 402 110"
      stroke="#3B82F6"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Soft connector dots */}
    <circle cx="70" cy="480" r="4" fill="#93C5FD" />
    <circle cx="160" cy="170" r="3.5" fill="#3B82F6" />
    <circle cx="450" cy="240" r="4.5" fill="#60A5FA" />
  </svg>
);

// Blue curly playful scribble above phone (matching reference image)
export const HandDrawnScribble: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    viewBox="0 0 110 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`stroke-[#2563EB] stroke-[2.8] stroke-linecap-round stroke-linejoin-round pointer-events-none select-none ${className}`}
  >
    <path d="M15 65 C 20 40, 30 15, 42 22 C 55 30, 35 60, 58 45 C 72 32, 75 10, 88 28 C 96 42, 85 62, 98 52 C 104 46, 106 32, 108 20" />
    <path d="M22 28 L 18 18 L 10 22" />
    <line x1="88" y1="12" x2="94" y2="4" />
  </svg>
);

// Fluffy minimalist cloud floating beside phone (matching reference image)
export const MinimalCloud: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    viewBox="0 0 120 70"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`pointer-events-none select-none drop-shadow-[0_8px_16px_rgba(8,96,232,0.12)] ${className}`}
  >
    <path
      d="M30 55 H95 C106 55 115 46 115 35 C115 25 108 17 98 16 C95 8 87 2 77 2 C68 2 61 7 57 14 C54 12 50 11 46 11 C35 11 26 19 25 30 C15 31 8 39 8 49 C8 58 16 66 26 66 Z"
      fill="white"
      stroke="#D0E6FD"
      strokeWidth="1.5"
    />
  </svg>
);

// Minimal flying birds in the sky (matching reference image)
export const FlyingBirds: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    viewBox="0 0 80 50"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`stroke-[#60A5FA] stroke-[2] stroke-linecap-round stroke-linejoin-round pointer-events-none select-none ${className}`}
  >
    {/* Bird 1 */}
    <path d="M8 20 Q 18 8 26 16 Q 34 8 44 20" />
    {/* Bird 2 (smaller, higher) */}
    <path d="M46 10 Q 53 2 60 8 Q 67 2 74 10" />
    {/* Bird 3 (tiny background) */}
    <path d="M28 35 Q 33 29 38 33 Q 43 29 48 35" strokeWidth="1.5" className="opacity-60" />
  </svg>
);

// Playful sparkle star
export const SparkleStar: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`fill-[#3B82F6] pointer-events-none select-none ${className}`}
  >
    <path d="M12 0 L 14 9 L 23 12 L 14 15 L 12 24 L 10 15 L 1 12 L 10 9 Z" />
  </svg>
);

