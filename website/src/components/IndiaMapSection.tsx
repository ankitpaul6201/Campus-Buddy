import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  MapPin,
  ChevronDown,
  CheckCircle2,
  XCircle,
  X,
  Loader2
} from 'lucide-react';
import { IndiaMap } from './IndiaMap';
import { COLLEGES, isCampusAvailable, AVAILABLE_CAMPUS } from '../data/mockData';
import { MapLocationPin } from '../types';
import { CurvedThreadDoodle } from './Doodles';

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

  // Search result state (only populated after clicking search button)
  const [searchResult, setSearchResult] = useState<{
    collegeName: string;
    isAvailable: boolean;
  } | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

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

      // Local fallback from Indian college dataset if MongoDB backend is not active
      const lower = trimmed.toLowerCase();
      const localMatches: CollegeSuggestion[] = COLLEGES
        .filter((c) => c.toLowerCase().includes(lower))
        .map((c) => ({ name: c }));

      // Also ensure SVIET is suggested if typing sviet / swami
      if (
        (lower.includes('sv') || lower.includes('sviet') || lower.includes('swami')) &&
        !localMatches.some((m) => isCampusAvailable(m.name))
      ) {
        localMatches.unshift({
          name: 'SVIET Chandigarh',
          location: 'Banur / Chandigarh, Punjab'
        });
      }

      setSuggestions(localMatches);
      setIsLoadingSuggestions(false);
    }, 250);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [inputValue]);

  // Execute availability check ONLY after clicking the search button or pressing enter
  const handlePerformSearch = (collegeToSearch: string) => {
    const target = collegeToSearch.trim();
    if (!target) return;

    const available = isCampusAvailable(target);
    setSearchResult({
      collegeName: target,
      isAvailable: available
    });

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
    // User can click search icon or we can check on select
    handlePerformSearch(collegeName);
  };

  const handlePinSelect = (pin: MapLocationPin) => {
    setInputValue(pin.name);
    handlePerformSearch(pin.name);
  };

  return (
    <section id="marketplace" className="py-20 sm:py-28 bg-[#FFFFFF] relative overflow-hidden">
      {/* Decorative Light-Blue Looping Thread on the right side behind text */}
      <div className="absolute top-1/4 right-0 w-[420px] pointer-events-none opacity-70 z-0">
        <CurvedThreadDoodle />
      </div>

      <div className="max-w-6xl mx-auto px-5 sm:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: India Halftone Map with Pins */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 w-full flex justify-center"
          >
            <IndiaMap onSelectPin={handlePinSelect} selectedCollege={searchResult?.collegeName} />
          </motion.div>

          {/* Right Column: Heading, Copy, and College Search Bar */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 flex flex-col items-start"
          >
            <h2 className="text-[32px] sm:text-[40px] font-extrabold text-brand-dark leading-[1.15] tracking-tight">
              Check If We're Available<br />
              On Your Campus!
            </h2>

            <p className="mt-4 text-brand-secondary text-[13.5px] sm:text-[14.5px] leading-relaxed max-w-md">
              Search your college or university below to see if Campus Buddy is live in your campus community. Currently available exclusively at SVIET Chandigarh!
            </p>

            {/* College Search Box (Categories removed, single college search pill) */}
            <div className="relative w-full max-w-xl mt-8" ref={dropdownRef}>
              <form
                onSubmit={handleFormSubmit}
                className="w-full bg-white border border-[#E8EBF0] p-2 pl-4 sm:pl-5 rounded-full shadow-[0_10px_30px_rgba(8,96,232,0.06),0_2px_8px_rgba(0,0,0,0.04)] flex items-center justify-between gap-3 transition-all hover:border-brand-blue/40 relative z-30"
              >
                {/* Location / College Search Input field */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-brand-orange" />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <label
                      htmlFor="college-search-input"
                      className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                    >
                      Location <ChevronDown className="w-2.5 h-2.5" />
                    </label>
                    <div className="relative flex items-center">
                      <input
                        id="college-search-input"
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => {
                          setInputValue(e.target.value);
                          setIsDropdownOpen(true);
                        }}
                        onFocus={() => {
                          if (inputValue.trim().length >= 2 || suggestions.length > 0) {
                            setIsDropdownOpen(true);
                          }
                        }}
                        placeholder="Search your college or university..."
                        className="bg-transparent text-[13px] font-bold text-brand-dark focus:outline-none w-full truncate pr-6 placeholder:font-normal placeholder:text-gray-400"
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
                          aria-label="Clear college search"
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
                  className="w-12 h-12 rounded-full bg-brand-btnDark hover:bg-black text-white flex items-center justify-center shrink-0 shadow-md transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                  aria-label="Check campus availability"
                  title="Check campus availability"
                >
                  <Search className="w-4 h-4" />
                </button>
              </form>

              {/* Autocomplete Dropdown from MongoDB Database */}
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
                      <span>Select College from Database</span>
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
                            className="w-full text-left px-3 py-2.5 rounded-xl text-[12.5px] transition-colors flex items-center justify-between gap-2 hover:bg-gray-50 text-gray-700 cursor-pointer"
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
                            Search "{inputValue}" anyway →
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Availability Result (Displayed ONLY after clicking the search button) */}
            <AnimatePresence mode="wait">
              {searchResult && (
                <motion.div
                  key={searchResult.collegeName + (searchResult.isAvailable ? '-avail' : '-unavail')}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="mt-4 w-full max-w-xl"
                >
                  {searchResult.isAvailable ? (
                    /* AVAILABLE STATUS: SVIET Chandigarh */
                    <div className="bg-emerald-50/90 border border-emerald-200/90 rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-3 shadow-xs">
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
                            Campus Buddy is currently live and available at this campus!
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* NOT AVAILABLE STATUS: Any other college */
                    <div className="bg-rose-50/90 border border-rose-200/90 rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-3 shadow-xs">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-rose-500/15 flex items-center justify-center shrink-0 text-rose-600">
                          <XCircle className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[13.5px] font-bold text-gray-900 truncate">
                              {searchResult.collegeName}
                            </span>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-600 text-white">
                              Not Available
                            </span>
                          </div>
                          <p className="text-[12px] text-rose-800 mt-0.5">
                            Campus Buddy is currently available at <strong>{AVAILABLE_CAMPUS}</strong> only.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Popular Items Row matching screenshot */}
            <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] text-gray-500">
              <span className="font-semibold text-brand-dark">Popular:</span>
              {['Engineering Drafter', 'Casio Calc', 'Hostel Kettle', 'Lab Goggles'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    setInputValue('SVIET Chandigarh');
                    handlePerformSearch('SVIET Chandigarh');
                  }}
                  className="px-2.5 py-1 rounded-full bg-gray-50 hover:bg-blue-50 text-gray-600 hover:text-brand-blue border border-gray-100 transition-colors cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>

          </motion.div>

        </div>
      </div>
    </section>
  );
};


