import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, PlusCircle, CheckCircle2, AlertCircle } from 'lucide-react';
import { searchUniversities } from '../services/universityService';
import SearchResultTile from './SearchResultTile';

export default function UniversitySearchField({ selectedUniversity, onSelectUniversity }) {
  const [query, setQuery] = useState(selectedUniversity ? selectedUniversity.name : '');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const debounceTimerRef = useRef(null);

  // Sync external selected university name to search input field display
  useEffect(() => {
    if (selectedUniversity) {
      setQuery(selectedUniversity.name);
    }
  }, [selectedUniversity]);

  // Debounced search logic (300ms delay)
  const handleInputChange = (e) => {
    const text = e.target.value;
    setQuery(text);
    onSelectUniversity(null); // Reset selection when user modifies query

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!text || text.trim().length < 2) {
      setResults([]);
      setIsSearching(false);
      setIsDropdownOpen(false);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    setIsDropdownOpen(true);

    debounceTimerRef.current = setTimeout(async () => {
      const data = await searchUniversities(text);
      setResults(data);
      setIsSearching(false);
      setHasSearched(true);
    }, 300);
  };

  const handleSelectResult = (university) => {
    // Populate search field with university name
    setQuery(university.name);
    // Close dropdown
    setIsDropdownOpen(false);
    // Store university object with universityId as source of truth
    onSelectUniversity({
      universityId: university.id,
      name: university.name,
      city: university.city,
      country: university.country,
      website: university.website
    });
  };

  const handleRequestUniversity = () => {
    alert('Coming Soon');
  };

  return (
    <div className="relative w-full">
      <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1.5">
        Search & Select University *
      </label>

      {/* Rounded Search Input Field */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>

        <input
          type="text"
          value={query}
          onFocus={() => {
            if (query.trim().length >= 2) {
              setIsDropdownOpen(true);
            }
          }}
          onChange={handleInputChange}
          placeholder="Search your university..."
          className="w-full pl-11 pr-11 py-3.5 bg-[#F3F4F6] text-slate-900 placeholder-slate-400 rounded-2xl text-sm font-normal focus:outline-none focus:ring-2 focus:ring-[#1944F1] transition-all"
        />

        {/* Loading Spinner inside search field while searching */}
        {isSearching && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-[#1944F1]">
            <Loader2 className="w-4 h-4 animate-spin" />
          </div>
        )}
      </div>

      {/* Selected University Status Indicator */}
      {selectedUniversity ? (
        <div className="mt-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-800">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-normal text-slate-800">
              Selected: <strong className="font-semibold text-slate-900">{selectedUniversity.name}</strong>
            </span>
          </div>
          <span className="font-mono text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
            ID: {selectedUniversity.universityId}
          </span>
        </div>
      ) : query.trim().length >= 2 && !isSearching && !isDropdownOpen && (
        <p className="mt-1.5 text-[11px] text-amber-600 flex items-center gap-1 font-normal">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>Please select a university from the search results.</span>
        </p>
      )}

      {/* Dropdown Results (Only appears after user starts typing) */}
      {isDropdownOpen && query.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-gray-200 shadow-2xl z-40 max-h-60 overflow-y-auto divide-y divide-gray-100">
          {results.length > 0 ? (
            results.map((university) => (
              <SearchResultTile
                key={university.id}
                university={university}
                isSelected={selectedUniversity?.universityId === university.id}
                onSelect={handleSelectResult}
              />
            ))
          ) : !isSearching && hasSearched ? (
            /* No Universities Found UI */
            <div className="p-5 text-center space-y-3">
              <p className="text-xs text-slate-500 font-normal">
                Couldn't find your university.
              </p>
              <button
                type="button"
                onClick={handleRequestUniversity}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1944F1] bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-colors"
              >
                <PlusCircle className="w-4 h-4" /> Request University
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
