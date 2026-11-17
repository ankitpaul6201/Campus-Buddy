import React from 'react';
import { motion } from 'framer-motion';

/**
 * Reusable, completely distinct Empty State illustrations for each screen:
 * - 'wishlist': Cute cat cuddling a big fluffy red-pink heart pillow with floating hearts.
 * - 'chat': Cat sitting next to a phone with glowing blue speech bubbles & typing dots.
 * - 'notifications': Cat curiously looking up at a grand ringing golden bell with envelope.
 * - 'ads': Open delivery parcel box with price tag (₹) and cat peeking out.
 * - 'home': Stack of colorful campus textbooks with graduation mortarboard cap & cat.
 * - 'search': Cat detective looking through a big magnifying glass with sparkle stars.
 *
 * Sits directly on the background without card padding or borders.
 */
export default function EmptyState({
  type = 'ads',
  title = 'No items found',
  description = 'Your items will be shown here.',
  actionLabel,
  onAction,
  actionIcon: ActionIcon,
  className = '',
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`w-full py-8 px-4 flex flex-col items-center justify-center text-center bg-transparent select-none ${className}`}
    >
      {/* SVG Illustration Container */}
      <div className="w-56 h-44 sm:w-64 sm:h-48 flex items-center justify-center pointer-events-none">
        {type === 'wishlist' && <WishlistIllustration />}
        {type === 'chat' && <ChatIllustration />}
        {type === 'notifications' && <NotificationsIllustration />}
        {type === 'ads' && <AdsIllustration />}
        {type === 'home' && <HomeCampusIllustration />}
        {type === 'search' && <SearchIllustration />}
        {type === 'purchases' && <AdsIllustration />}
      </div>

      {/* Typography */}
      <div className="space-y-1.5 mt-3 max-w-[280px] sm:max-w-xs">
        <h3 className="text-base font-bold text-slate-800 tracking-tight font-sans">
          {title}
        </h3>
        {description && (
          <p className="text-xs text-slate-500 font-normal leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* Optional CTA Button */}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-4 px-6 py-2.5 rounded-full bg-[#1944F1] hover:bg-[#0D30BA] text-white text-xs font-semibold shadow-xs active:scale-95 transition-all inline-flex items-center gap-1.5 pointer-events-auto"
        >
          {ActionIcon && <ActionIcon className="w-3.5 h-3.5" />}
          <span>{actionLabel}</span>
        </button>
      )}
    </motion.div>
  );
}

/* =========================================================================
 * 1. WISHLIST: Cat hugging a big plush heart pillow with floating hearts
 * ========================================================================= */
function WishlistIllustration() {
  return (
    <svg viewBox="0 0 280 200" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="wishGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FECDD3" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#FECDD3" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="heartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FB7185" />
          <stop offset="50%" stopColor="#F43F5E" />
          <stop offset="100%" stopColor="#E11D48" />
        </linearGradient>
      </defs>

      {/* Background Soft Glow */}
      <circle cx="140" cy="110" r="70" fill="url(#wishGlow)" />

      {/* Ground Shadow */}
      <ellipse cx="140" cy="180" rx="90" ry="7" fill="#E2E8F0" />
      <ellipse cx="140" cy="180" rx="60" ry="4.5" fill="#CBD5E1" opacity="0.5" />

      {/* Floating Sparkles & Small Hearts */}
      {/* Top Left Floating Heart */}
      <g transform="translate(68, 54) scale(0.65) rotate(-15)">
        <path
          d="M20 28 C20 28 8 20 8 11 C8 6.5 11.5 3 16 3 C18.5 3 20 4.5 20 4.5 C20 4.5 21.5 3 24 3 C28.5 3 32 6.5 32 11 C32 20 20 28 20 28 Z"
          fill="#FB7185"
          opacity="0.85"
        />
      </g>
      {/* Top Right Floating Heart */}
      <g transform="translate(195, 42) scale(0.8) rotate(12)">
        <path
          d="M20 28 C20 28 8 20 8 11 C8 6.5 11.5 3 16 3 C18.5 3 20 4.5 20 4.5 C20 4.5 21.5 3 24 3 C28.5 3 32 6.5 32 11 C32 20 20 28 20 28 Z"
          fill="#F43F5E"
        />
        <circle cx="28" cy="8" r="2" fill="#FFFFFF" opacity="0.6" />
      </g>
      {/* Little Sparkles */}
      <circle cx="64" cy="98" r="2.5" fill="#FBBF24" />
      <circle cx="218" cy="92" r="2" fill="#FBBF24" />
      <circle cx="204" cy="130" r="2.5" fill="#F43F5E" opacity="0.7" />

      {/* Cat Tail Behind */}
      <path
        d="M190 155 C215 155 224 135 220 120 C216 112 208 115 210 122 C212 130 206 145 186 148"
        stroke="#F59E0B"
        strokeWidth="9"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="215" cy="116" r="4.5" fill="#FFFFFF" />

      {/* Cat Head & Ears (Peeking above the heart) */}
      <g id="cat-wish-head">
        {/* Left Ear */}
        <polygon points="106,86 116,52 132,78" fill="#F59E0B" />
        <polygon points="112,82 118,58 128,76" fill="#EA580C" opacity="0.5" />
        {/* Right Ear */}
        <polygon points="148,78 164,52 174,86" fill="#F59E0B" />
        <polygon points="152,76 162,58 168,82" fill="#EA580C" opacity="0.5" />

        {/* Head */}
        <ellipse cx="140" cy="88" rx="32" ry="24" fill="#F59E0B" />

        {/* White Muzzle */}
        <ellipse cx="140" cy="96" rx="14" ry="9" fill="#FFFFFF" />

        {/* Happy Sleeping Eyes (^ ^) */}
        <path d="M124 88 Q129 82 134 88" stroke="#1E293B" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        <path d="M146 88 Q151 82 156 88" stroke="#1E293B" strokeWidth="2.2" strokeLinecap="round" fill="none" />

        {/* Nose & Smile */}
        <polygon points="138,93 142,93 140,96" fill="#1E293B" />
        <path d="M136 97 Q140 100 144 97" stroke="#1E293B" strokeWidth="1.6" strokeLinecap="round" fill="none" />

        {/* Rosy Cheeks */}
        <circle cx="120" cy="95" r="4" fill="#FDA4AF" opacity="0.6" />
        <circle cx="160" cy="95" r="4" fill="#FDA4AF" opacity="0.6" />
      </g>

      {/* Big Plush Heart (Hugged by Cat) */}
      <g id="big-heart" transform="translate(140, 142) scale(2.8)">
        <path
          d="M0 12 C0 12 -14 3 -14 -6 C-14 -11 -10 -15 -5 -15 C-2 -15 0 -13 0 -13 C0 -13 2 -15 5 -15 C10 -15 14 -11 14 -6 C14 3 0 12 0 12 Z"
          fill="url(#heartGrad)"
        />
        {/* Soft Glare on Heart */}
        <path
          d="M-10 -7 C-10 -11 -7 -13 -4 -13"
          stroke="#FFFFFF"
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity="0.6"
          fill="none"
        />
      </g>

      {/* Cat Front Paws (Clasping the heart on both sides) */}
      <ellipse cx="108" cy="132" rx="7" ry="5.5" fill="#FFFFFF" stroke="#F59E0B" strokeWidth="1.5" transform="rotate(-15 108 132)" />
      <ellipse cx="172" cy="132" rx="7" ry="5.5" fill="#FFFFFF" stroke="#F59E0B" strokeWidth="1.5" transform="rotate(15 172 132)" />
    </svg>
  );
}

/* =========================================================================
 * 2. CHAT: Cat sitting next to a phone with floating message bubbles
 * ========================================================================= */
function ChatIllustration() {
  return (
    <svg viewBox="0 0 280 200" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="chatGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#DBEAFE" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#DBEAFE" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Background Soft Glow */}
      <circle cx="140" cy="100" r="70" fill="url(#chatGlow)" />

      {/* Ground Shadow */}
      <ellipse cx="140" cy="180" rx="90" ry="7" fill="#E2E8F0" />
      <ellipse cx="140" cy="180" rx="60" ry="4.5" fill="#CBD5E1" opacity="0.5" />

      {/* Floating Chat Bubbles */}
      {/* Main Big Blue Bubble (with typing dots) */}
      <g transform="translate(130, 36)">
        <rect x="0" y="0" width="76" height="46" rx="20" fill="#1944F1" />
        <polygon points="18,44 28,44 14,56" fill="#1944F1" />
        {/* 3 Animated Typing Dots */}
        <circle cx="24" cy="23" r="4" fill="#FFFFFF" />
        <circle cx="38" cy="23" r="4" fill="#FFFFFF" />
        <circle cx="52" cy="23" r="4" fill="#FFFFFF" />
      </g>

      {/* Secondary Sky Blue Reply Bubble */}
      <g transform="translate(74, 60)">
        <rect x="0" y="0" width="54" height="34" rx="16" fill="#60A5FA" />
        <polygon points="42,32 50,32 46,40" fill="#60A5FA" />
        {/* Heart icon inside bubble */}
        <path
          d="M27 23 C27 23 20 18 20 13.5 C20 11.5 21.5 10 23.5 10 C25 10 26.5 11 27 12 C27.5 11 29 10 30.5 10 C32.5 10 34 11.5 34 13.5 C34 18 27 23 27 23 Z"
          fill="#FFFFFF"
        />
      </g>

      {/* Tiny Sparkles / Message Waves */}
      <circle cx="62" cy="46" r="2.5" fill="#3B82F6" opacity="0.5" />
      <circle cx="218" cy="42" r="3" fill="#FBBF24" />
      <circle cx="228" cy="78" r="2" fill="#60A5FA" />

      {/* Cute Paper Airplane Floating */}
      <g transform="translate(204, 88) rotate(-15) scale(0.8)">
        <polygon points="0,12 28,0 12,24" fill="#1944F1" opacity="0.8" />
        <polygon points="12,24 28,0 10,16" fill="#93C5FD" />
      </g>

      {/* Cat Sitting on Ground Beside Bubbles */}
      <g id="cat-chat-body">
        {/* Tail */}
        <path
          d="M80 168 C62 165 52 145 58 132 C62 124 70 128 68 136 C66 142 72 155 86 160"
          stroke="#F59E0B"
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="60" cy="128" r="4" fill="#FFFFFF" />

        {/* Body */}
        <ellipse cx="112" cy="150" rx="22" ry="26" fill="#F59E0B" />
        <ellipse cx="112" cy="154" rx="14" ry="18" fill="#FEF3C7" />

        {/* Cat Head */}
        <polygon points="90,120 98,90 112,112" fill="#F59E0B" />
        <polygon points="94,117 100,96 108,110" fill="#EA580C" opacity="0.5" />

        <polygon points="122,112 136,90 144,120" fill="#F59E0B" />
        <polygon points="126,110 134,96 140,117" fill="#EA580C" opacity="0.5" />

        <ellipse cx="117" cy="122" rx="24" ry="19" fill="#F59E0B" />

        {/* Muzzle */}
        <ellipse cx="119" cy="129" rx="11" ry="8" fill="#FFFFFF" />

        {/* Eyes (Looking Up at Chat Bubbles) */}
        <circle cx="109" cy="120" r="3.2" fill="#1E293B" />
        <circle cx="110.5" cy="118.5" r="1.2" fill="#FFFFFF" />

        <circle cx="128" cy="120" r="3.2" fill="#1E293B" />
        <circle cx="129.5" cy="118.5" r="1.2" fill="#FFFFFF" />

        {/* Nose & Mouth */}
        <polygon points="117,126 121,126 119,129" fill="#1E293B" />
        <path d="M116 131 Q119 133 122 131" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" fill="none" />

        {/* Paws Resting on Ground */}
        <ellipse cx="104" cy="174" rx="6" ry="4" fill="#FFFFFF" stroke="#F59E0B" strokeWidth="1.3" />
        <ellipse cx="120" cy="174" rx="6" ry="4" fill="#FFFFFF" stroke="#F59E0B" strokeWidth="1.3" />
      </g>

      {/* Smartphone Lying next to Cat */}
      <g transform="translate(142, 134) rotate(14)">
        {/* Phone Case */}
        <rect x="0" y="0" width="30" height="46" rx="6" fill="#1E293B" />
        {/* Screen */}
        <rect x="2" y="3" width="26" height="40" rx="4" fill="#F8FAFC" />
        {/* Mini Chat Message Bars on Screen */}
        <rect x="5" y="8" width="14" height="4" rx="2" fill="#1944F1" />
        <rect x="11" y="15" width="15" height="4" rx="2" fill="#CBD5E1" />
        <rect x="5" y="22" width="16" height="4" rx="2" fill="#1944F1" />
        {/* Home Indicator */}
        <rect x="10" y="39" width="10" height="1.5" rx="0.75" fill="#94A3B8" />
      </g>
    </svg>
  );
}

/* =========================================================================
 * 3. NOTIFICATIONS: Cat looking up at a grand ringing golden bell & letter
 * ========================================================================= */
function NotificationsIllustration() {
  return (
    <svg viewBox="0 0 280 200" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bellGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FEF3C7" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#FEF3C7" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="bellGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FCD34D" />
          <stop offset="40%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
      </defs>

      {/* Background Soft Glow */}
      <circle cx="140" cy="95" r="75" fill="url(#bellGlow)" />

      {/* Ground Shadow */}
      <ellipse cx="140" cy="180" rx="90" ry="7" fill="#E2E8F0" />
      <ellipse cx="140" cy="180" rx="60" ry="4.5" fill="#CBD5E1" opacity="0.5" />

      {/* Sound / Ring Vibrations around the Bell */}
      <path d="M96 66 C88 74 88 88 96 98" stroke="#F59E0B" strokeWidth="2.8" strokeLinecap="round" fill="none" />
      <path d="M86 58 C74 70 74 94 86 106" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7" />

      <path d="M184 66 C192 74 192 88 184 98" stroke="#F59E0B" strokeWidth="2.8" strokeLinecap="round" fill="none" />
      <path d="M194 58 C206 70 206 94 194 106" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7" />

      {/* Sparkles */}
      <circle cx="82" cy="44" r="3" fill="#F59E0B" />
      <circle cx="198" cy="46" r="2.5" fill="#FBBF24" />
      <circle cx="140" cy="22" r="3.5" fill="#F59E0B" />

      {/* Grand Golden Bell */}
      <g id="golden-bell" transform="translate(140, 78)">
        {/* Top Ring / Loop */}
        <ellipse cx="0" cy="-38" rx="8" ry="7" stroke="#D97706" strokeWidth="4.5" fill="none" />

        {/* Bell Body */}
        <path
          d="M0 -34 C-16 -34 -28 -14 -30 12 C-31 22 -38 28 -44 32 C-46 34 -44 38 -40 38 L40 38 C44 38 46 34 44 32 C38 28 31 22 30 12 C28 -14 16 -34 0 -34 Z"
          fill="url(#bellGrad)"
        />

        {/* Bell Base Lip */}
        <ellipse cx="0" cy="38" rx="42" ry="7" fill="#D97706" />
        <ellipse cx="0" cy="36" rx="40" ry="6" fill="#F59E0B" />

        {/* Clapper / Ball */}
        <ellipse cx="0" cy="44" rx="9" ry="7" fill="#B45309" />
        <circle cx="-2" cy="43" r="2" fill="#FDE68A" />

        {/* Highlights / Glare on Bell Curve */}
        <path
          d="M-18 -12 C-20 4 -22 18 -28 26"
          stroke="#FEF3C7"
          strokeWidth="3.2"
          strokeLinecap="round"
          fill="none"
          opacity="0.8"
        />

        {/* Notification "0" or Check Badge */}
        <g transform="translate(24, -28)">
          <circle cx="8" cy="8" r="11" fill="#1944F1" stroke="#FFFFFF" strokeWidth="2.5" />
          <path d="M4.5 8 L7 10.5 L12 5.5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </g>
      </g>

      {/* Cat Sitting Looking Up at Bell */}
      <g id="cat-bell-body" transform="translate(68, 116)">
        {/* Tail */}
        <path
          d="M-4 50 C-18 48 -24 34 -20 22 C-16 16 -8 20 -10 26 C-12 32 -6 42 6 46"
          stroke="#F59E0B"
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
        />

        {/* Body */}
        <ellipse cx="20" cy="38" rx="19" ry="22" fill="#F59E0B" />
        <ellipse cx="22" cy="42" rx="12" ry="15" fill="#FEF3C7" />

        {/* Ears */}
        <polygon points="2,14 10,-12 22,8" fill="#F59E0B" />
        <polygon points="6,12 11,-4 18,7" fill="#EA580C" opacity="0.5" />

        <polygon points="30,8 42,-12 50,14" fill="#F59E0B" />
        <polygon points="34,7 41,-4 46,12" fill="#EA580C" opacity="0.5" />

        {/* Head tilted up right */}
        <ellipse cx="26" cy="15" rx="20" ry="16" fill="#F59E0B" />
        <ellipse cx="30" cy="20" rx="9" ry="7" fill="#FFFFFF" />

        {/* Eyes looking up */}
        <circle cx="21" cy="13" r="2.8" fill="#1E293B" />
        <circle cx="22.5" cy="11.5" r="1" fill="#FFFFFF" />

        <circle cx="36" cy="13" r="2.8" fill="#1E293B" />
        <circle cx="37.5" cy="11.5" r="1" fill="#FFFFFF" />

        {/* Nose & Smile */}
        <polygon points="29,18 33,18 31,21" fill="#1E293B" />
        <path d="M28 22 Q31 24 34 22" stroke="#1E293B" strokeWidth="1.4" strokeLinecap="round" fill="none" />

        {/* Paws */}
        <ellipse cx="14" cy="58" rx="5" ry="3.5" fill="#FFFFFF" stroke="#F59E0B" strokeWidth="1.2" />
        <ellipse cx="28" cy="58" rx="5" ry="3.5" fill="#FFFFFF" stroke="#F59E0B" strokeWidth="1.2" />
      </g>

      {/* Campus Letter Envelope at base */}
      <g transform="translate(178, 148) rotate(-8)">
        <rect x="0" y="0" width="38" height="26" rx="4" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
        <polygon points="0,0 19,15 38,0" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="1.5" />
        {/* Little Blue Seal Stamp */}
        <circle cx="19" cy="15" r="4.5" fill="#1944F1" />
      </g>
    </svg>
  );
}

/* =========================================================================
 * 4. ADS: The open delivery parcel box with bold price tag (₹) & cat peeking
 * ========================================================================= */
function AdsIllustration() {
  return (
    <svg viewBox="0 0 280 200" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Ground Shadow */}
      <ellipse cx="140" cy="180" rx="95" ry="7" fill="#E2E8F0" />
      <ellipse cx="140" cy="180" rx="65" ry="4.5" fill="#CBD5E1" opacity="0.5" />

      {/* Back Box Flaps */}
      <polygon points="90,118 126,118 108,82 72,82" fill="#94A3B8" opacity="0.9" />
      <polygon points="148,118 206,118 222,86 166,86" fill="#94A3B8" opacity="0.8" />

      {/* Big Bright Blue Price Tag Sticking Out of Box */}
      <g transform="translate(90, 48) rotate(-14)">
        {/* Hanging String */}
        <path d="M22 70 C20 48 30 38 32 20" stroke="#94A3B8" strokeWidth="2.2" strokeDasharray="3 2" fill="none" />
        {/* Tag Body */}
        <rect x="4" y="18" width="42" height="58" rx="8" fill="#1944F1" />
        <circle cx="25" cy="27" r="4" fill="#FFFFFF" />
        {/* Big White Rupee Sign */}
        <text x="25" y="60" fill="#FFFFFF" fontSize="26" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">₹</text>
        {/* Sparkle on Tag */}
        <circle cx="48" cy="16" r="3" fill="#FBBF24" />
      </g>

      {/* Cat Peeking over the box rim */}
      <g id="cat-ads">
        {/* Ears */}
        <polygon points="152,106 164,74 176,98" fill="#F59E0B" />
        <polygon points="156,102 165,80 173,97" fill="#EA580C" opacity="0.6" />
        <polygon points="186,98 198,74 210,106" fill="#F59E0B" />
        <polygon points="189,97 197,80 206,102" fill="#EA580C" opacity="0.6" />

        {/* Head */}
        <path
          d="M152 108 C152 88 210 88 210 108 C210 128 206 134 181 134 C156 134 152 128 152 108 Z"
          fill="#F59E0B"
        />

        {/* White Cheek/Muzzle Patch */}
        <ellipse cx="181" cy="122" rx="14" ry="10" fill="#FFFFFF" />

        {/* Bead Eyes */}
        <circle cx="168" cy="112" r="3.2" fill="#1E293B" />
        <circle cx="169.5" cy="110.5" r="1.1" fill="#FFFFFF" />

        <circle cx="194" cy="112" r="3.2" fill="#1E293B" />
        <circle cx="195.5" cy="110.5" r="1.1" fill="#FFFFFF" />

        {/* Nose & Mouth */}
        <polygon points="178,118 184,118 181,122" fill="#1E293B" />
        <line x1="181" y1="122" x2="181" y2="125" stroke="#1E293B" strokeWidth="1.4" strokeLinecap="round" />
        <path
          d="M176 125 C178 128 181 127 181 125 C181 127 184 128 186 125"
          stroke="#1E293B"
          strokeWidth="1.4"
          strokeLinecap="round"
          fill="none"
        />
      </g>

      {/* Cardboard Box Body */}
      {/* Left Face */}
      <polygon points="98,124 142,135 142,180 98,180" fill="#CBD5E1" />
      {/* Serrated Tape */}
      <rect x="116" y="122" width="8" height="58" fill="#94A3B8" opacity="0.9" />

      {/* Front Face */}
      <polygon points="142,135 222,135 222,180 142,180" fill="#E2E8F0" />
      {/* Folded Flap */}
      <polygon points="142,135 222,135 238,155 158,155" fill="#CBD5E1" opacity="0.9" />

      {/* Shipping Label with Barcode */}
      <rect x="150" y="145" width="28" height="18" rx="2" fill="#CBD5E1" />
      <rect x="184" y="156" width="22" height="2.5" rx="1.2" fill="#94A3B8" />
      <rect x="184" y="162" width="16" height="2.5" rx="1.2" fill="#94A3B8" />

      {/* Cat Paws Resting over Front Box Rim */}
      <ellipse cx="166" cy="135" rx="5" ry="4" fill="#FFFFFF" stroke="#F59E0B" strokeWidth="1.2" />
      <ellipse cx="196" cy="135" rx="5" ry="4" fill="#FFFFFF" stroke="#F59E0B" strokeWidth="1.2" />
    </svg>
  );
}

/* =========================================================================
 * 5. HOME: Stack of campus textbooks with graduation mortarboard & cat
 * ========================================================================= */
function HomeCampusIllustration() {
  return (
    <svg viewBox="0 0 280 200" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Ground Shadow */}
      <ellipse cx="140" cy="180" rx="92" ry="7" fill="#E2E8F0" />
      <ellipse cx="140" cy="180" rx="60" ry="4.5" fill="#CBD5E1" opacity="0.5" />

      {/* Floating Sparkles & Pennant Flag */}
      <circle cx="68" cy="74" r="3" fill="#FBBF24" />
      <circle cx="218" cy="62" r="2.5" fill="#3B82F6" />

      {/* Stack of 3 Campus Books on the Left */}
      <g id="book-stack" transform="translate(76, 126)">
        {/* Book 1 (Bottom - Navy) */}
        <g transform="translate(0, 32)">
          <rect x="0" y="0" width="88" height="18" rx="3" fill="#1E293B" />
          <rect x="80" y="2" width="6" height="14" fill="#F8FAFC" />
          <line x1="8" y1="9" x2="68" y2="9" stroke="#E2E8F0" strokeWidth="1.5" strokeLinecap="round" />
        </g>

        {/* Book 2 (Middle - Royal Blue) */}
        <g transform="translate(4, 16)">
          <rect x="0" y="0" width="82" height="17" rx="3" fill="#1944F1" />
          <rect x="74" y="2" width="6" height="13" fill="#F8FAFC" />
          <line x1="8" y1="8.5" x2="62" y2="8.5" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round" />
        </g>

        {/* Book 3 (Top - Coral / Amber) */}
        <g transform="translate(8, 0)">
          <rect x="0" y="0" width="76" height="17" rx="3" fill="#F59E0B" />
          <rect x="68" y="2" width="6" height="13" fill="#F8FAFC" />
          <line x1="8" y1="8.5" x2="56" y2="8.5" stroke="#FEF3C7" strokeWidth="1.5" strokeLinecap="round" />
        </g>
      </g>

      {/* University Mortarboard Cap resting on top book */}
      <g transform="translate(84, 82)">
        {/* Cap Base Ring */}
        <polygon points="26,34 52,34 48,42 30,42" fill="#0D30BA" />
        {/* Cap Rhombus Top */}
        <polygon points="38,16 68,28 38,40 8,28" fill="#1944F1" />
        {/* Center Button & Golden Tassel */}
        <circle cx="38" cy="28" r="3.2" fill="#F59E0B" />
        <path d="M38 28 C46 32 54 40 54 50" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <circle cx="54" cy="52" r="2.5" fill="#F59E0B" />
      </g>

      {/* Cat Sitting next to the books on the right */}
      <g id="cat-home" transform="translate(162, 108)">
        {/* Tail curled up */}
        <path
          d="M26 62 C42 60 48 46 44 34 C40 28 32 32 34 38 C36 44 30 54 18 58"
          stroke="#F59E0B"
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
        />

        {/* Body */}
        <ellipse cx="6" cy="46" rx="20" ry="24" fill="#F59E0B" />
        <ellipse cx="6" cy="50" rx="12" ry="16" fill="#FEF3C7" />

        {/* Ears */}
        <polygon points="-14,20 -6,-6 6,14" fill="#F59E0B" />
        <polygon points="-10,18 -5,0 2,13" fill="#EA580C" opacity="0.5" />

        <polygon points="12,14 24,-6 32,20" fill="#F59E0B" />
        <polygon points="16,13 23,0 28,18" fill="#EA580C" opacity="0.5" />

        {/* Head */}
        <ellipse cx="9" cy="22" rx="22" ry="18" fill="#F59E0B" />
        <ellipse cx="9" cy="28" rx="10" ry="7" fill="#FFFFFF" />

        {/* Eyes */}
        <circle cx="0" cy="20" r="3" fill="#1E293B" />
        <circle cx="1.2" cy="18.8" r="1.1" fill="#FFFFFF" />

        <circle cx="18" cy="20" r="3" fill="#1E293B" />
        <circle cx="19.2" cy="18.8" r="1.1" fill="#FFFFFF" />

        {/* Nose & Smile */}
        <polygon points="7,25 11,25 9,28" fill="#1E293B" />
        <path d="M6 29 Q9 32 12 29" stroke="#1E293B" strokeWidth="1.4" strokeLinecap="round" fill="none" />

        {/* Paws */}
        <ellipse cx="-2" cy="68" rx="5.5" ry="3.5" fill="#FFFFFF" stroke="#F59E0B" strokeWidth="1.2" />
        <ellipse cx="14" cy="68" rx="5.5" ry="3.5" fill="#FFFFFF" stroke="#F59E0B" strokeWidth="1.2" />
      </g>
    </svg>
  );
}

/* =========================================================================
 * 6. SEARCH: Cat detective looking through a magnifying glass
 * ========================================================================= */
function SearchIllustration() {
  return (
    <svg viewBox="0 0 280 200" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="glassGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#DBEAFE" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#DBEAFE" stopOpacity="0.2" />
        </radialGradient>
      </defs>

      {/* Ground Shadow */}
      <ellipse cx="140" cy="180" rx="90" ry="7" fill="#E2E8F0" />
      <ellipse cx="140" cy="180" rx="60" ry="4.5" fill="#CBD5E1" opacity="0.5" />

      {/* Curious Question Dots & Sparkles */}
      <g transform="translate(68, 50)">
        <text x="0" y="24" fill="#94A3B8" fontSize="24" fontWeight="bold" fontFamily="sans-serif">?</text>
      </g>
      <g transform="translate(202, 60)">
        <text x="0" y="20" fill="#94A3B8" fontSize="20" fontWeight="bold" fontFamily="sans-serif" opacity="0.7">?</text>
      </g>
      <circle cx="62" cy="100" r="2.5" fill="#FBBF24" />
      <circle cx="218" cy="95" r="2.5" fill="#FBBF24" />

      {/* Cat Detective Body */}
      <g id="cat-detective" transform="translate(100, 102)">
        {/* Tail */}
        <path
          d="M0 64 C-16 62 -24 48 -20 34 C-16 28 -8 32 -10 38 C-12 44 -6 54 8 58"
          stroke="#F59E0B"
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
        />

        {/* Body */}
        <ellipse cx="36" cy="48" rx="22" ry="24" fill="#F59E0B" />
        <ellipse cx="36" cy="52" rx="14" ry="16" fill="#FEF3C7" />

        {/* Left Ear */}
        <polygon points="16,22 24,-4 36,16" fill="#F59E0B" />
        <polygon points="20,20 25,2 32,15" fill="#EA580C" opacity="0.5" />

        {/* Right Ear */}
        <polygon points="42,16 54,-4 62,22" fill="#F59E0B" />
        <polygon points="46,15 53,2 58,20" fill="#EA580C" opacity="0.5" />

        {/* Head */}
        <ellipse cx="39" cy="24" rx="23" ry="18" fill="#F59E0B" />
        <ellipse cx="39" cy="30" rx="10" ry="7" fill="#FFFFFF" />

        {/* Normal Eye (Right Eye) */}
        <circle cx="48" cy="22" r="3" fill="#1E293B" />
        <circle cx="49.2" cy="20.8" r="1.1" fill="#FFFFFF" />

        {/* Nose & Smile */}
        <polygon points="37,27 41,27 39,30" fill="#1E293B" />
        <path d="M36 31 Q39 34 42 31" stroke="#1E293B" strokeWidth="1.4" strokeLinecap="round" fill="none" />

        {/* Left Paw Holding Magnifier Handle */}
        <ellipse cx="26" cy="46" rx="5.5" ry="4" fill="#FFFFFF" stroke="#F59E0B" strokeWidth="1.2" transform="rotate(-25 26 46)" />
        {/* Foot Paws on Ground */}
        <ellipse cx="28" cy="70" rx="5.5" ry="3.5" fill="#FFFFFF" stroke="#F59E0B" strokeWidth="1.2" />
        <ellipse cx="44" cy="70" rx="5.5" ry="3.5" fill="#FFFFFF" stroke="#F59E0B" strokeWidth="1.2" />
      </g>

      {/* Large Magnifying Glass (Positioned over the cat's left eye) */}
      <g id="magnifier" transform="translate(118, 108)">
        {/* Handle */}
        <line x1="8" y1="20" x2="-14" y2="42" stroke="#0D30BA" strokeWidth="8" strokeLinecap="round" />
        {/* Glass Ring */}
        <circle cx="16" cy="12" r="24" stroke="#1944F1" strokeWidth="6" fill="url(#glassGlow)" />
        {/* Glass Reflection Arc */}
        <path d="M3 3 A18 18 0 0 1 25 1" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" fill="none" />

        {/* Magnified Left Eye inside lens */}
        <circle cx="16" cy="14" r="5" fill="#1E293B" />
        <circle cx="18" cy="12" r="1.8" fill="#FFFFFF" />
      </g>
    </svg>
  );
}
