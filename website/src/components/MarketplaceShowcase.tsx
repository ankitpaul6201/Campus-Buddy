import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, ShieldCheck, Heart, ArrowUpRight } from 'lucide-react';
import { FlipButton } from './ui/Button';

interface ShowcaseItem {
  id: string;
  title: string;
  category: string;
  price: number;
  originalPrice: number;
  condition: 'Like New' | 'Good' | 'Gently Used';
  college: string;
  seller: string;
  sellerAvatar: string;
  verified: boolean;
  image: string;
  badge?: string;
}

const SHOWCASE_PRODUCTS: ShowcaseItem[] = [
  {
    id: 'p1',
    title: 'Cormen Algorithms (CLRS) 4th Edition + Notes',
    category: 'Books & Notes',
    price: 320,
    originalPrice: 1200,
    condition: 'Like New',
    college: 'DTU Delhi',
    seller: 'Rohan Mehta',
    sellerAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80',
    verified: true,
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80',
    badge: 'Popular'
  },
  {
    id: 'p2',
    title: 'Casio fx-991EX Classwiz Scientific Calculator',
    category: 'Calculators & Drafters',
    price: 490,
    originalPrice: 1450,
    condition: 'Like New',
    college: 'BITS Pilani',
    seller: 'Ananya Sharma',
    sellerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    verified: true,
    image: 'https://images.unsplash.com/photo-1611125832047-1d7ad1e8e485?w=500&auto=format&fit=crop&q=80',
    badge: 'Campus Deal'
  },
  {
    id: 'p3',
    title: 'Omega Engineering Mini Drafter Kit + Sheet Holder',
    category: 'Calculators & Drafters',
    price: 350,
    originalPrice: 850,
    condition: 'Good',
    college: 'SVIET Chandigarh',
    seller: 'Aryan Sharma',
    sellerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    verified: true,
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=80',
    badge: 'Verified'
  },
  {
    id: 'p4',
    title: 'Hero Sprint 21-Speed Geared Campus Cycle',
    category: 'Cycles',
    price: 2400,
    originalPrice: 7500,
    condition: 'Gently Used',
    college: 'IIT Bombay',
    seller: 'Karthik Iyer',
    sellerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    verified: true,
    image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=500&auto=format&fit=crop&q=80',
    badge: 'Hostel Handover'
  },
  {
    id: 'p5',
    title: 'Rechargeable LED Desk Study Lamp (Touch Dimmer)',
    category: 'Electronics',
    price: 380,
    originalPrice: 999,
    condition: 'Like New',
    college: 'IIT Delhi',
    seller: 'Devansh Joshi',
    sellerAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
    verified: true,
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'p6',
    title: 'Stainless Steel 1.8L Electric Hostel Kettle',
    category: 'Hostel Gear',
    price: 420,
    originalPrice: 1100,
    condition: 'Good',
    college: 'RV College',
    seller: 'Sneha Roy',
    sellerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    verified: true,
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500&auto=format&fit=crop&q=80',
    badge: 'Hostel Essential'
  }
];

interface MarketplaceShowcaseProps {
  onItemClick: () => void;
}

export const MarketplaceShowcase: React.FC<MarketplaceShowcaseProps> = ({ onItemClick }) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const categories = ['All', 'Books & Notes', 'Calculators & Drafters', 'Cycles', 'Electronics', 'Hostel Gear'];

  const filtered = activeCategory === 'All'
    ? SHOWCASE_PRODUCTS
    : SHOWCASE_PRODUCTS.filter(p => p.category === activeCategory);

  return (
    <section className="py-20 sm:py-28 bg-[#FBFDFF] relative overflow-hidden border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 relative">
          <div className="relative">
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-blue bg-blue-50 px-3 py-1 rounded-full border border-blue-100 inline-block mb-3">
              In-App Marketplace Preview
            </span>

            <h2 className="text-[28px] sm:text-[36px] font-extrabold text-brand-dark leading-[1.18] tracking-tight">
              Real Student Listings.<br />
              Campus-Friendly Prices.
            </h2>
          </div>

          <p className="mt-4 md:mt-0 text-brand-secondary text-[13px] sm:text-[14px] leading-relaxed max-w-sm">
            Here is a sneak peek of what students are buying, selling, and handing over right now in the Campus Buddy mobile app.
          </p>
        </div>

        {/* Search Bar Preview & Category Pills */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          {/* Simulated App Search Bar */}
          <div
            onClick={onItemClick}
            className="w-full sm:w-auto flex-1 max-w-md bg-white border border-[#E8EBF0] rounded-full px-4 py-2.5 flex items-center gap-2.5 shadow-xs cursor-pointer hover:border-brand-blue/50 transition-colors"
          >
            <Search className="w-4 h-4 text-gray-400" />
            <span className="text-[12.5px] text-gray-400 truncate">
              Search by title, department, hostel or college...
            </span>
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-[12px] font-medium transition-all whitespace-nowrap cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-brand-btnDark text-white shadow-xs'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filtered.map((item) => (
              <motion.div
                layout
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="group bg-white rounded-2xl border border-[#EDF1F7] p-3.5 shadow-card hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Image container */}
                  <div className="relative h-44 w-full rounded-xl overflow-hidden bg-gray-100">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {item.badge && (
                      <span className="absolute top-2.5 left-2.5 bg-brand-dark/85 backdrop-blur-xs text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full shadow-xs">
                        {item.badge}
                      </span>
                    )}
                    <span className="absolute bottom-2.5 left-2.5 bg-white/90 backdrop-blur-xs text-brand-dark text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                      {item.condition}
                    </span>
                    <button
                      onClick={onItemClick}
                      className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-gray-500 hover:text-rose-500 transition-colors shadow-xs"
                      aria-label="Save listing"
                    >
                      <Heart className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Title and Pricing */}
                  <div className="mt-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-[17px] font-extrabold text-brand-blue">
                        ₹{item.price}
                      </span>
                      <span className="text-[12px] text-gray-400 line-through">
                        ₹{item.originalPrice}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded">
                        {Math.round((1 - item.price / item.originalPrice) * 100)}% OFF
                      </span>
                    </div>

                    <h4 className="mt-1 text-[13.5px] font-bold text-brand-dark line-clamp-1 group-hover:text-brand-blue transition-colors">
                      {item.title}
                    </h4>
                  </div>
                </div>

                {/* Seller & Action Footer */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <img
                      src={item.sellerAvatar}
                      alt={item.seller}
                      className="w-6 h-6 rounded-full object-cover shrink-0"
                    />
                    <div className="truncate">
                      <p className="text-[11px] font-bold text-brand-dark truncate flex items-center gap-1">
                        {item.seller}
                        {item.verified && (
                          <ShieldCheck className="w-3 h-3 text-brand-blue shrink-0" />
                        )}
                      </p>
                      <p className="text-[9.5px] text-gray-400 truncate">
                        {item.college}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={onItemClick}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-brand-paleBlue hover:bg-brand-blue text-brand-blue hover:text-white text-[11px] font-semibold transition-colors shrink-0 cursor-pointer"
                  >
                    <span>View Deal</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Bottom Callout banner */}
        <div className="mt-12 p-6 rounded-2xl bg-white border border-[#E8EBF0] shadow-soft flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-brand-blue shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-[14px] font-bold text-brand-dark">
                Want to browse all available campus listings?
              </h5>
              <p className="text-[12px] text-brand-secondary">
                Download the Campus Buddy app to unlock real-time student chat, location filtering, and direct handovers.
              </p>
            </div>
          </div>

          <FlipButton
            variant="dark"
            onClick={onItemClick}
            className="px-6 py-2.5 text-[12.5px] shrink-0"
          >
            Open in App
          </FlipButton>
        </div>

      </div>
    </section>
  );
};
