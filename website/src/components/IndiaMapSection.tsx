import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  MapPin,
  CheckCircle2,
  X,
  Loader2,
  GraduationCap,
  School,
  Award,
  Coins,
  Rocket,
  Gift,
  Send,
  Users
} from 'lucide-react';
import { InteractiveGlobe } from './InteractiveGlobe';
import { COLLEGES, isCampusAvailable } from '../data/mockData';

interface IndiaMapSectionProps {
  onSearch?: (college: string) => void;
}

interface CollegeSuggestion {
  name: string;
  location?: string;
}

export const IndiaMapSection: React.FC<IndiaMapSectionProps> = ({ onSearch }) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<CollegeSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Search result state
  const [searchResult, setSearchResult] = useState<{
    collegeName: string;
    isAvailable: boolean;
  } | null>(null);

  // Campus Ambassador Modal State (shown when searched college is not available)
  const [showAmbassadorModal, setShowAmbassadorModal] = useState(false);
  const [ambassadorCollege, setAmbassadorCollege] = useState('');
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Automatically clear search result banner whenever search bar is emptied
  useEffect(() => {
    if (!inputValue.trim()) {
      setSearchResult(null);
    }
  }, [inputValue]);

  // Fetch colleges from MongoDB database (/api/universities) as user types
  useEffect(() => {
    const trimmed = inputValue.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setIsLoadingSuggestions(false);
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    setIsLoadingSuggestions(true);

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        let res = await fetch(`/api/universities?q=${encodeURIComponent(trimmed)}&limit=60`, {
          signal: controller.signal
        }).catch(() => null);

        if (!res || !res.ok) {
          res = await fetch(`http://localhost:5000/api/universities?q=${encodeURIComponent(trimmed)}&limit=60`, {
            signal: controller.signal
          }).catch(() => null);
        }

        clearTimeout(timeoutId);

        if (res && res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.universities) && data.universities.length > 0) {
            const mapped: CollegeSuggestion[] = data.universities.map((u: any) => ({
              name: u.name,
              location: [u.city, u.state].filter(Boolean).join(', ')
            }));
            setSuggestions(mapped);
            setIsLoadingSuggestions(false);
            return;
          }
        }
      } catch {
        // Backend error or network timeout — fallback to local database
      }

      // Local fallback from Indian college dataset
      const lower = trimmed.toLowerCase();
      const localMatches: CollegeSuggestion[] = COLLEGES
        .filter((c) => c.toLowerCase().includes(lower))
        .map((c) => ({ name: c }));

      setSuggestions(localMatches);
      setIsLoadingSuggestions(false);
    }, 250);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [inputValue]);

  // Execute availability check
  const handlePerformSearch = (collegeToSearch: string) => {
    const target = collegeToSearch.trim();
    if (!target) return;

    const available = isCampusAvailable(target);
    setSearchResult({
      collegeName: target,
      isAvailable: available
    });

    // If college is not available, automatically open the Campus Ambassador modal
    if (!available) {
      setAmbassadorCollege(target);
      setShowAmbassadorModal(true);
      setApplicationSubmitted(false);
    }

    setIsDropdownOpen(false);
    if (onSearch) onSearch(target);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handlePerformSearch(inputValue);
  };

  const handleSelectSuggestion = (collegeName: string) => {
    setInputValue(collegeName);
    setIsDropdownOpen(false);
    handlePerformSearch(collegeName);
  };

  const handleCampusSelect = (name: string) => {
    setInputValue(name);
    handlePerformSearch(name);
  };

  return (
    <section id="campuses" className="py-8 sm:py-10 bg-[#FFFFFF] relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          
          {/* Left Column: 3D Dotted Rotating Interactive Globe */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 w-full flex justify-center"
          >
            <InteractiveGlobe onSelectCampus={handleCampusSelect} selectedCollege={searchResult?.collegeName} />
          </motion.div>

          {/* Right Column: Heading, Copy, and College Search Bar */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 flex flex-col items-start"
          >
            <h2 className="text-[28px] sm:text-[34px] font-extrabold text-brand-dark leading-[1.18] tracking-tight">
              Check If We're Available<br />
              On Your Campus!
            </h2>

            <p className="mt-2 text-brand-secondary text-[13.5px] sm:text-[14px] leading-relaxed max-w-lg">
              Search your college below or explore the 3D globe to check whether Campus Buddy is available on your campus.
            </p>

            {/* College Search Box */}
            <div className="relative w-full max-w-xl mt-5" ref={dropdownRef}>
              <form
                onSubmit={handleFormSubmit}
                className="w-full bg-white border border-[#E8EBF0] p-1.5 pl-4 sm:pl-5 rounded-full shadow-[0_8px_24px_rgba(8,96,232,0.06),0_2px_6px_rgba(0,0,0,0.04)] flex items-center justify-between gap-3 transition-all hover:border-brand-blue/40 relative z-30"
              >
                {/* Search Input field */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-brand-blue" />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Search College
                    </span>
                    <div className="relative flex items-center">
                      <input
                        id="college-search-input"
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => {
                          const val = e.target.value;
                          setInputValue(val);
                          if (!val.trim()) {
                            setSearchResult(null);
                          }
                          setIsDropdownOpen(true);
                        }}
                        onFocus={() => {
                          if (inputValue.trim().length >= 2 || suggestions.length > 0) {
                            setIsDropdownOpen(true);
                          }
                        }}
                        placeholder="Search your college or university..."
                        className="bg-transparent text-[13px] font-semibold text-brand-dark focus:outline-none w-full truncate pr-6 placeholder:font-normal placeholder:text-gray-400"
                        autoComplete="off"
                      />
                      {inputValue && (
                        <button
                          type="button"
                          onClick={() => {
                            setInputValue('');
                            setSearchResult(null);
                            inputRef.current?.focus();
                          }}
                          className="absolute right-0 text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
                          aria-label="Clear search"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Circular Dark Search Button */}
                <button
                  type="submit"
                  className="w-11 h-11 rounded-full bg-brand-btnDark hover:bg-black text-white flex items-center justify-center shrink-0 shadow-md transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                  aria-label="Check campus availability"
                  title="Check campus availability"
                >
                  <Search className="w-4 h-4" />
                </button>
              </form>

              {/* Autocomplete Dropdown */}
              <AnimatePresence>
                {isDropdownOpen && inputValue.trim().length >= 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.99 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.99 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-40 max-h-64 overflow-y-auto"
                  >
                    <div className="px-3 py-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-50 flex items-center justify-between">
                      <span>Select College</span>
                      {isLoadingSuggestions && (
                        <Loader2 className="w-3 h-3 text-brand-blue animate-spin" />
                      )}
                    </div>

                    <div className="mt-1 space-y-0.5">
                      {suggestions.length > 0 ? (
                        suggestions.map((item, idx) => (
                          <button
                            key={`${item.name}-${idx}`}
                            type="button"
                            onClick={() => handleSelectSuggestion(item.name)}
                            className="w-full text-left px-3 py-2 rounded-xl text-[12.5px] transition-colors flex items-center justify-between gap-2 hover:bg-gray-50 text-gray-700 cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              <span className="truncate font-medium text-gray-800">
                                {item.name}
                              </span>
                            </div>
                            {item.location && (
                              <span className="text-[11px] text-gray-400 shrink-0">
                                {item.location}
                              </span>
                            )}
                          </button>
                        ))
                      ) : !isLoadingSuggestions ? (
                        <div className="p-3 text-center">
                          <p className="text-[12px] text-gray-500">
                            No college found for "{inputValue}"
                          </p>
                          <button
                            type="button"
                            onClick={() => handleSelectSuggestion(inputValue)}
                            className="mt-1.5 text-[12px] font-bold text-brand-blue hover:underline cursor-pointer"
                          >
                            Check "{inputValue}" anyway →
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Inline Availability Result */}
            <AnimatePresence mode="wait">
              {searchResult && inputValue.trim().length > 0 && (
                <motion.div
                  key={searchResult.collegeName + (searchResult.isAvailable ? '-avail' : '-unavail')}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="mt-3.5 w-full max-w-xl"
                >
                  {searchResult.isAvailable ? (
                    /* AVAILABLE STATUS */
                    <div className="bg-emerald-50/90 border border-emerald-200/90 rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3 shadow-xs">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0 text-emerald-600">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[13.5px] font-bold text-gray-900 truncate">
                              {searchResult.collegeName}
                            </span>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-600 text-white">
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                              Available
                            </span>
                          </div>
                          <p className="text-[12px] text-emerald-800 mt-0.5">
                            Campus Buddy is live and available on this campus!
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* NOT AVAILABLE STATUS: Prompt to become Ambassador */
                    <div className="bg-blue-50/80 border border-blue-200/90 rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3 shadow-xs">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-blue-500/15 flex items-center justify-center shrink-0 text-brand-blue">
                          <School className="w-4 h-4 text-brand-blue" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[13.5px] font-bold text-gray-900 truncate">
                              {searchResult.collegeName}
                            </span>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500 text-white">
                              Not Available Yet
                            </span>
                          </div>
                          <p className="text-[12px] text-slate-600 mt-0.5">
                            Be the 1st to bring Campus Buddy to your college!
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setAmbassadorCollege(searchResult.collegeName);
                          setShowAmbassadorModal(true);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-brand-blue hover:bg-blue-600 text-white text-[11.5px] font-bold shrink-0 transition-all cursor-pointer shadow-xs active:scale-95"
                      >
                        Become Ambassador →
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>


          </motion.div>

        </div>
      </div>

      {/* CAMPUS AMBASSADOR POPUP MODAL (Horizontal Rectangular Frosted Glass Card) */}
      <AnimatePresence>
        {showAmbassadorModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAmbassadorModal(false)}
              className="absolute inset-0 bg-slate-950/50 backdrop-blur-md"
            />

            {/* Fixed Horizontal Rectangular Frosted Glass Card (Non-scrollable, No scrollbars) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-[780px] max-h-[90vh] overflow-y-auto rounded-[24px] sm:rounded-[32px] p-5 sm:p-7 z-10 overflow-x-hidden bg-white/75 backdrop-blur-3xl border border-brand-blue/30 shadow-[0_30px_80px_-15px_rgba(8,96,232,0.25),inset_0_0_28px_2px_rgba(8,96,232,0.25),inset_0_1px_2px_rgba(255,255,255,0.95)]"
            >
              {/* Brand Blue Color Gradient Orbs Matching Button Colour */}
              {/* 1. Top-Right Soft Blue Diffusion */}
              <div className="absolute -top-12 -right-12 w-80 h-80 bg-gradient-to-bl from-brand-blue/45 via-brand-blue/20 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
              
              {/* 2. Bottom-Left Vibrant Blue Patch */}
              <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-gradient-to-tr from-brand-blue/50 via-blue-600/30 to-transparent rounded-full blur-2xl pointer-events-none -z-10" />

              {/* 3. Center-Left Bright White Reflection Highlight */}
              <div className="absolute top-2 left-10 w-72 h-44 bg-white/80 rounded-full blur-2xl pointer-events-none -z-10" />

              {/* 4. Bottom-Right Subtle Brand Blue Glow */}
              <div className="absolute -bottom-14 -right-14 w-52 h-52 bg-brand-blue/25 rounded-full blur-2xl pointer-events-none -z-10" />

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setShowAmbassadorModal(false)}
                className="absolute top-4 right-4 sm:top-5 sm:right-5 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-500 hover:text-slate-800 border border-brand-blue/25 shadow-xs flex items-center justify-center transition-all cursor-pointer z-20"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Horizontal 2-Column Grid Layout */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                
                {/* Left Column: Heading, Subtitle & Application Form */}
                <div className="md:col-span-6 flex flex-col justify-between">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-brand-blue text-[11px] font-bold uppercase tracking-wider mb-2.5">
                      <GraduationCap className="w-3.5 h-3.5 text-brand-blue" />
                      <span>Campus Ambassador</span>
                    </div>

                    <h3 className="text-[20px] sm:text-[23px] font-black text-slate-900 leading-tight">
                      Become the 1st at{' '}
                      <span className="text-brand-blue">{ambassadorCollege || 'Your College'}</span>!
                    </h3>
                    <p className="mt-1.5 text-[12.5px] text-slate-500 leading-relaxed">
                      Campus Buddy hasn't launched at your college yet. Step up as our official Campus Ambassador and lead the movement!
                    </p>
                  </div>

                  {/* Form / Success State */}
                  {!applicationSubmitted ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        setApplicationSubmitted(true);
                      }}
                      className="mt-4 pt-3.5 border-t border-slate-200/60 flex flex-col gap-2.5"
                    >
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          required
                          placeholder="Your Name"
                          className="px-3 py-2 rounded-xl border border-slate-200/80 bg-white/90 text-[12px] focus:outline-none focus:border-brand-blue text-slate-900 placeholder:text-gray-400"
                        />
                        <input
                          type="tel"
                          required
                          placeholder="WhatsApp No."
                          className="px-3 py-2 rounded-xl border border-slate-200/80 bg-white/90 text-[12px] focus:outline-none focus:border-brand-blue text-slate-900 placeholder:text-gray-400"
                        />
                      </div>
                      <input
                        type="email"
                        required
                        placeholder="College or Personal Email"
                        className="px-3 py-2 rounded-xl border border-slate-200/80 bg-white/90 text-[12px] focus:outline-none focus:border-brand-blue text-slate-900 placeholder:text-gray-400"
                      />

                      <button
                        type="submit"
                        className="w-full py-2.5 rounded-xl bg-brand-blue hover:bg-blue-600 text-white font-bold text-[12.5px] shadow-[0_6px_20px_rgba(8,96,232,0.3)] transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2 mt-0.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Apply as Ambassador</span>
                      </button>
                    </form>
                  ) : (
                    <div className="mt-4 p-4 rounded-2xl bg-emerald-50/90 border border-emerald-200/90 text-center">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <h4 className="text-[13.5px] font-extrabold text-emerald-900">Application Received!</h4>
                      <p className="text-[11.5px] text-emerald-700 mt-0.5 leading-snug">
                        Our team will reach out via WhatsApp shortly to launch Campus Buddy at {ambassadorCollege || 'your college'}.
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowAmbassadorModal(false)}
                        className="mt-2.5 px-3.5 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-bold hover:bg-emerald-700 transition-colors cursor-pointer"
                      >
                        Done
                      </button>
                    </div>
                  )}
                </div>

                {/* Right Column: Concise Benefit Points (Clean, no text clutter) */}
                <div className="md:col-span-6 space-y-2">
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Ambassador Benefits
                  </div>
                  {[
                    {
                      icon: <Award className="w-4 h-4 text-brand-blue" />,
                      title: 'Official Certificate & LOR',
                      desc: 'Signed credentials to boost your resume.'
                    },
                    {
                      icon: <Coins className="w-4 h-4 text-emerald-600" />,
                      title: 'Performance Stipends & Cash Rewards',
                      desc: 'Weekly payouts & milestone cash bonuses.'
                    },
                    {
                      icon: <Rocket className="w-4 h-4 text-brand-orange" />,
                      title: 'Direct Founder Mentorship',
                      desc: '1-on-1 sessions on growth & leadership.'
                    },
                    {
                      icon: <Gift className="w-4 h-4 text-indigo-600" />,
                      title: 'Exclusive Swag & Merch Kit',
                      desc: 'Official hoodies, t-shirts & swag pack.'
                    },
                    {
                      icon: <Users className="w-4 h-4 text-purple-600" />,
                      title: 'Lead Your College Community',
                      desc: 'Host student meetups & campus drives.'
                    }
                  ].map((b, bIdx) => (
                    <div
                      key={bIdx}
                      className="p-2 sm:p-2.5 rounded-2xl bg-white/70 backdrop-blur-md border border-white/90 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex items-center gap-2.5 text-left transition-all hover:bg-white/90"
                    >
                      <div className="w-7 h-7 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-center shrink-0 shadow-2xs">
                        {b.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h5 className="text-[12px] font-bold text-slate-900 leading-tight truncate">
                          {b.title}
                        </h5>
                        <p className="text-[11px] text-slate-500 leading-tight mt-0.5 truncate">
                          {b.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

