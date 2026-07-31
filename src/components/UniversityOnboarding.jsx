import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Globe2, MapPin, CheckCircle2, ChevronRight, Loader2, PlusCircle, ShieldCheck } from 'lucide-react';
import { COUNTRIES, STATES, searchUniversitiesOnServer } from '../services/universityService';
import RequestUniversityModal from './RequestUniversityModal';

export default function UniversityOnboarding({ onSelectUniversity, onCancel }) {
  const [selectedCountry, setSelectedCountry] = useState('US');
  const [selectedState, setSelectedState] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUniversity, setSelectedUniversity] = useState(null);
  const [validationError, setValidationError] = useState('');
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  const debounceTimerRef = useRef(null);

  // States available for selected country
  const currentStates = STATES[selectedCountry] || [];
  const currentCountryObj = COUNTRIES.find(c => c.id === selectedCountry);

  // Debounced server search when query changes
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    debounceTimerRef.current = setTimeout(async () => {
      const results = await searchUniversitiesOnServer(searchQuery, selectedCountry, selectedState);
      setSearchResults(results);
      setIsSearching(false);
    }, 280);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [searchQuery, selectedCountry, selectedState]);

  const handleUniversitySelect = (univ) => {
    setSelectedUniversity(univ);
    setValidationError('');
  };

  const handleContinue = () => {
    if (!selectedCountry) {
      setValidationError('Please select a country.');
      return;
    }
    if (!selectedUniversity) {
      setValidationError('Please search and select a verified university from the list.');
      return;
    }

    onSelectUniversity({
      countryId: selectedCountry,
      stateId: selectedState,
      universityId: selectedUniversity.id,
      universityName: selectedUniversity.name,
      domain: selectedUniversity.domain,
      city: selectedUniversity.city
    });
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-slate-900 flex flex-col justify-between max-w-md mx-auto relative overflow-hidden select-none font-sans">
      
      {/* Top Header Banner */}
      <div className="bg-[#1944F1] text-white pt-14 px-6 pb-8 rounded-b-[36px] shadow-lg relative z-10">
        <div className="flex items-center justify-between mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white text-[11px] font-medium backdrop-blur-sm">
            <Globe2 className="w-3.5 h-3.5" /> Worldwide Campuses ({COUNTRIES.length} Countries)
          </span>
          {onCancel && (
            <button onClick={onCancel} className="text-white/80 hover:text-white text-xs font-medium">
              Back
            </button>
          )}
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-white font-sans">
          Select Your Campus
        </h1>
        <p className="text-sm text-blue-100/90 leading-relaxed font-normal mt-1">
          Join your official campus marketplace. Select your university to start buying & selling.
        </p>
      </div>

      {/* Main Form Area */}
      <div className="flex-1 p-6 space-y-5 overflow-y-auto">
        {validationError && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-medium flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Step 1: Select Country (Complete Global List) */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center justify-between">
            <span>Step 1: Select Country ({COUNTRIES.length} Countries)</span>
            <span className="text-[11px] text-[#1944F1] font-normal">{currentCountryObj?.flagEmoji} {currentCountryObj?.name}</span>
          </label>
          <div className="relative">
            <select
              value={selectedCountry}
              onChange={(e) => {
                setSelectedCountry(e.target.value);
                setSelectedState('');
                setSelectedUniversity(null);
                setSearchQuery('');
              }}
              className="w-full px-4 py-3.5 bg-white border border-gray-200 text-slate-900 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1944F1] shadow-sm cursor-pointer appearance-none"
            >
              {COUNTRIES.map(c => (
                <option key={c.id} value={c.id}>
                  {c.flagEmoji} {c.name} ({c.isoCode})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Step 2: Select State / Province */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Step 2: State / Region {currentStates.length > 0 ? `(${currentStates.length} Regions)` : '(All Regions)'}
          </label>
          <select
            value={selectedState}
            onChange={(e) => {
              setSelectedState(e.target.value);
              setSelectedUniversity(null);
              setSearchQuery('');
            }}
            className="w-full px-4 py-3.5 bg-white border border-gray-200 text-slate-900 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1944F1] shadow-sm cursor-pointer appearance-none"
          >
            <option value="">All States / Regions</option>
            {currentStates.map(s => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Step 3: Search University */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Step 3: Search University
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedUniversity(null);
                setValidationError('');
              }}
              placeholder="Search your university..."
              className="w-full pl-11 pr-10 py-3.5 bg-white border border-gray-200 text-slate-900 placeholder-slate-400 rounded-2xl text-sm font-normal focus:outline-none focus:ring-2 focus:ring-[#1944F1] shadow-sm"
            />
            {isSearching && (
              <Loader2 className="w-4 h-4 text-[#1944F1] animate-spin absolute right-4 top-4" />
            )}
          </div>

          {/* Autocomplete Results Dropdown */}
          {searchQuery.trim().length >= 2 && (
            <div className="mt-2 bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden max-h-64 overflow-y-auto divide-y divide-gray-100">
              {searchResults.length > 0 ? (
                searchResults.map(univ => (
                  <button
                    key={univ.id}
                    type="button"
                    onClick={() => handleUniversitySelect(univ)}
                    className={`w-full p-3.5 text-left flex items-start justify-between transition-colors ${
                      selectedUniversity?.id === univ.id ? 'bg-blue-50/70 border-l-4 border-[#1944F1]' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900">{univ.name}</span>
                        {univ.verified && (
                          <ShieldCheck className="w-4 h-4 text-[#1944F1] shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {univ.city || 'Campus'}</span>
                        <span>•</span>
                        <span className="font-mono text-[11px] text-[#1944F1] bg-blue-100/60 px-1.5 py-0.5 rounded">@{univ.domain}</span>
                      </div>
                    </div>
                    {selectedUniversity?.id === univ.id && (
                      <CheckCircle2 className="w-5 h-5 text-[#1944F1] shrink-0 mt-1" />
                    )}
                  </button>
                ))
              ) : !isSearching ? (
                /* Can't find university prompt */
                <div className="p-5 text-center space-y-3">
                  <p className="text-xs text-slate-500 font-normal">
                    Can't find your university in our records?
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsRequestModalOpen(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1944F1] bg-blue-50 px-3.5 py-2 rounded-xl hover:bg-blue-100 transition-colors"
                  >
                    <PlusCircle className="w-4 h-4" /> Request University
                  </button>
                </div>
              ) : null}
            </div>
          )}

          {/* Currently Selected University Badge */}
          {selectedUniversity && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-emerald-800 text-xs">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <div className="font-bold text-slate-900 text-sm">{selectedUniversity.name}</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">Campus ID: {selectedUniversity.id} • {selectedUniversity.city}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="p-6 bg-white border-t border-gray-100 space-y-3">
        <button
          type="button"
          onClick={handleContinue}
          disabled={!selectedUniversity}
          className="w-full py-4 px-6 rounded-2xl bg-[#0F0F0F] hover:bg-black text-white font-medium text-sm shadow-md transition-all active:scale-[0.98] disabled:opacity-40 flex items-center justify-center gap-2"
        >
          <span>Continue with Selected Campus</span>
          <ChevronRight className="w-4 h-4" />
        </button>

        <p className="text-center text-[11px] text-slate-500 font-normal">
          All students from your campus will share the same campus marketplace.
        </p>
      </div>

      {/* Request University Modal */}
      <RequestUniversityModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        initialCountry={selectedCountry}
        initialState={selectedState}
      />
    </div>
  );
}
