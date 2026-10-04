import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'dark' | 'light' | 'outline' | 'ghost';
  className?: string;
  iconClassName?: string;
}

/**
 * ArrowButton: Matches the reference design with fluid left-to-right flow.
 * Default state: dark pill (#15181E) with a crisp white circular arrow badge.
 * Hover / Click: white color flows in smoothly from the arrow side (left to right),
 * seamlessly inverting the badge and turning the text dark as the wave sweeps across.
 */
export const ArrowButton: React.FC<ButtonProps> = ({
  children,
  className = '',
  iconClassName = '',
  onClick,
  ...props
}) => {
  const [clicked, setClicked] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setClicked(true);
    setTimeout(() => setClicked(false), 500);
    onClick?.(e);
  };

  const renderContent = (isLight: boolean) => (
    <>
      {/* Circle badge with arrow */}
      <span
        className={cn(
          "w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 shadow-xs transition-transform duration-300",
          isLight ? "bg-[#15181E] text-white" : "bg-white text-[#15181E]",
          iconClassName
        )}
      >
        <ArrowRight
          className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 group-active:translate-x-1"
          strokeWidth={2.2}
        />
      </span>

      {/* Button Text */}
      <span
        className={cn(
          "font-semibold tracking-tight whitespace-nowrap",
          isLight ? "text-[#15181E]" : "text-white"
        )}
      >
        {children}
      </span>
    </>
  );

  return (
    <button
      onClick={handleClick}
      className={cn(
        "group relative inline-flex items-center rounded-full font-semibold text-[14.5px] cursor-pointer select-none overflow-hidden",
        "border-2 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] transform-gpu active:scale-97",
        clicked
          ? "bg-white text-[#15181E] border-slate-300 shadow-[0_6px_20px_rgba(0,0,0,0.06)]"
          : "bg-[#15181E] text-white border-zinc-800 hover:bg-white hover:text-[#15181E] hover:border-slate-300 active:border-slate-300 shadow-[0_6px_20px_rgba(25,29,37,0.18)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)]",
        className
      )}
      {...props}
    >
      {/* Base Layer: Dark background, white circle arrow badge, white text */}
      <div className="flex items-center gap-3.5 p-1.5 pr-6 sm:pr-7 w-full h-full">
        {renderContent(false)}
      </div>

      {/* Fluid Flowing Layer: Pure white background sweeping from the arrow side (left to right) */}
      <div
        className={cn(
          "arrow-btn-flow absolute inset-0 bg-white flex items-center gap-3.5 p-1.5 pr-6 sm:pr-7 pointer-events-none rounded-full w-full h-full",
          clicked && "is-flow-active"
        )}
        aria-hidden="true"
      >
        {renderContent(true)}
      </div>
    </button>
  );
};

/**
 * FlipButton: For buttons without an arrow behind the text.
 * When hovered or clicked, the text rolls / flips upwards smoothly
 * using a 3D-style vertical text roll animation.
 */
export const FlipButton: React.FC<ButtonProps> = ({
  children,
  variant = 'dark',
  className = '',
  onClick,
  ...props
}) => {
  const [clicked, setClicked] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setClicked(true);
    setTimeout(() => setClicked(false), 500);
    onClick?.(e);
  };

  const variantStyles = {
    dark: 'bg-brand-btnDark hover:bg-black text-white shadow-[0_4px_16px_rgba(25,29,37,0.16)]',
    light: 'bg-white hover:bg-gray-50 text-brand-dark border border-gray-200/90 shadow-xs',
    outline: 'bg-transparent hover:bg-gray-100 text-brand-dark border border-gray-300',
    ghost: 'bg-transparent hover:bg-blue-50/60 text-brand-dark',
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "group relative inline-flex items-center justify-center px-6 py-3 rounded-full font-semibold text-[14px] cursor-pointer select-none overflow-hidden",
        "transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 active:translate-y-0 active:scale-97 transform-gpu",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {/* Dual line rolling upward container */}
      <span className="relative inline-flex flex-col h-[1.35em] overflow-hidden pointer-events-none">
        <span
          className={cn(
            "inline-block transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
            "group-hover:-translate-y-full group-active:-translate-y-full",
            clicked && "-translate-y-full"
          )}
        >
          {children}
        </span>
        <span
          className={cn(
            "absolute top-full left-0 inline-block transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
            "group-hover:-translate-y-full group-active:-translate-y-full",
            clicked && "-translate-y-full"
          )}
          aria-hidden="true"
        >
          {children}
        </span>
      </span>
    </button>
  );
};
