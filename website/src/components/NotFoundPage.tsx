import React from 'react';

interface NotFoundPageProps {
  onBackToHome?: () => void;
  type?: '404' | 'offline';
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onBackToHome }) => {
  const handleHomeClick = () => {
    if (onBackToHome) {
      onBackToHome();
    } else {
      window.history.pushState(null, '', '/');
      window.location.hash = '';
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#FFFFFF] flex flex-col items-center justify-center p-3 sm:p-6 md:p-8 relative select-none font-sans overflow-x-hidden">
      
      {/* Centered Graphic Container matching 404.svg */}
      <div className="relative w-full max-w-5xl mx-auto flex flex-col items-center justify-center">
        
        {/* The 404 SVG Illustration - completely borderless and seamless with white background */}
        <div className="relative w-full flex items-center justify-center">
          <img
            src="/404.svg"
            alt="404 Page Not Found"
            className="w-full max-w-4xl h-auto object-contain block select-none"
            draggable={false}
          />

          {/* Interactive Invisible Overlay Button on top of the SVG's "GO HOME" button */}
          <button
            onClick={handleHomeClick}
            className="absolute left-[43%] right-[43%] bottom-[12%] top-[82%] z-20 cursor-pointer rounded-lg hover:bg-black/5 active:scale-95 transition-all"
            title="Go back home"
            aria-label="Go home"
          />
        </div>

      </div>

      {/* Clean Bottom Copyright / Branding */}
      <div className="mt-8 text-center text-xs text-slate-400">
        Campus Buddy · Connecting College Campuses
      </div>

    </div>
  );
};
