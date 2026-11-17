import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, RotateCcw, SlidersHorizontal } from 'lucide-react';

export default function FilterSortScreen({
  filterState = {
    sort: 'recommended',
    minPrice: '',
    maxPrice: '',
    condition: 'all',
    category: 'all'
  },
  onApplyFilters,
  onResetFilters,
  onNavigateBack
}) {
  // Staged / Draft state initialized from current filterState
  const [draftSort, setDraftSort] = useState(filterState.sort || 'recommended');
  const [draftMinPrice, setDraftMinPrice] = useState(filterState.minPrice || '');
  const [draftMaxPrice, setDraftMaxPrice] = useState(filterState.maxPrice || '');
  const [draftCondition, setDraftCondition] = useState(filterState.condition || 'all');
  const [draftCategory, setDraftCategory] = useState(filterState.category || 'all');

  const categories = [
    { id: 'all', label: 'All Items' },
    { id: 'books', label: 'Books & Notes' },
    { id: 'electronics', label: 'Electronics' },
    { id: 'cycles', label: 'Cycles & Vehicles' },
    { id: 'dorm', label: 'Dorm Essentials' },
  ];

  const sortOptions = [
    { id: 'recommended', label: 'Recommended', desc: 'Best matches & popularity' },
    { id: 'price_low', label: 'Price: Low to High', desc: 'Most affordable first' },
    { id: 'price_high', label: 'Price: High to Low', desc: 'Premium listings first' },
    { id: 'newest', label: 'Newest First', desc: 'Recently posted' },
  ];

  const conditionOptions = [
    { id: 'all', label: 'All Conditions' },
    { id: 'new', label: 'Brand New' },
    { id: 'like_new', label: 'Like New' },
    { id: 'good', label: 'Good' },
    { id: 'fair', label: 'Fair' },
  ];

  const pricePresets = [
    { label: 'Under ₹1,000', min: '', max: '1000' },
    { label: '₹1,000 - ₹5,000', min: '1000', max: '5000' },
    { label: '₹5,000 - ₹25,000', min: '5000', max: '25000' },
    { label: '₹25,000 - ₹2,00,000', min: '25000', max: '200000' },
  ];

  const handleResetDraft = () => {
    setDraftSort('recommended');
    setDraftMinPrice('');
    setDraftMaxPrice('');
    setDraftCondition('all');
    setDraftCategory('all');
    if (onResetFilters) onResetFilters();
  };

  const handleApply = () => {
    if (onApplyFilters) {
      onApplyFilters({
        sort: draftSort,
        minPrice: draftMinPrice,
        maxPrice: draftMaxPrice,
        condition: draftCondition,
        category: draftCategory
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="w-full h-full min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between overflow-hidden font-sans select-none relative"
    >
      {/* 1. Header Bar */}
      <div className="pt-14 pb-3.5 px-4 bg-white border-b border-slate-100 flex items-center justify-between shadow-2xs shrink-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateBack}
            className="w-11 h-11 min-w-[44px] max-w-[44px] min-h-[44px] max-h-[44px] rounded-full bg-[#F5F3F3] hover:bg-slate-200/60 border border-slate-100 flex items-center justify-center text-slate-900 transition-all duration-200 hover:-translate-x-0.5 active:scale-95 shrink-0 group"
            title="Back to Home"
          >
            <ArrowLeft className="w-5 h-5 transition-transform duration-200 group-hover:-translate-x-0.5" />
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 font-sans tracking-tight">
              Filter & Sort
            </h1>
            <p className="text-xs text-slate-500 font-normal">
              Customize marketplace listings
            </p>
          </div>
        </div>
      </div>

      {/* 2. Scrollable Body Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 pb-32 space-y-5 no-scrollbar text-left">
        
        {/* Sort Section */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-2xs space-y-3">
          <div>
            <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
              Sort By
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {sortOptions.map(opt => {
              const isSel = draftSort === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setDraftSort(opt.id)}
                  className={`p-3 rounded-2xl border transition-all text-left flex items-center justify-between ${
                    isSel
                      ? 'border-[#1944F1] bg-blue-50/70 text-[#1944F1] shadow-2xs ring-1 ring-[#1944F1]'
                      : 'border-slate-100 bg-[#F8FAFC] text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <span className={`block text-xs ${isSel ? 'font-bold' : 'font-medium'}`}>
                      {opt.label}
                    </span>
                    <span className="block text-[11px] text-slate-400 mt-0.5">
                      {opt.desc}
                    </span>
                  </div>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border transition-all ${
                    isSel ? 'bg-[#1944F1] border-[#1944F1] text-white' : 'border-slate-300 bg-white'
                  }`}>
                    {isSel && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Price Range Section */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-2xs space-y-3.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Price Range
            </label>
            {(draftMinPrice || draftMaxPrice) && (
              <button
                type="button"
                onClick={() => { setDraftMinPrice(''); setDraftMaxPrice(''); }}
                className="text-xs font-semibold text-[#1944F1] hover:underline"
              >
                Clear Price
              </button>
            )}
          </div>

          {/* Quick price chips */}
          <div className="grid grid-cols-2 gap-2">
            {pricePresets.map((preset, idx) => {
              const isPreset = draftMinPrice === preset.min && draftMaxPrice === preset.max;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    if (isPreset) {
                      setDraftMinPrice('');
                      setDraftMaxPrice('');
                    } else {
                      setDraftMinPrice(preset.min);
                      setDraftMaxPrice(preset.max);
                    }
                  }}
                  className={`py-2 px-3 rounded-2xl text-xs border transition-all text-center font-medium ${
                    isPreset
                      ? 'bg-[#1944F1] text-white border-[#1944F1] shadow-2xs font-bold'
                      : 'bg-[#F8FAFC] border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          {/* Custom Min / Max inputs */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-xs font-semibold text-slate-400">₹</span>
              <input
                type="number"
                min="0"
                max="200000"
                placeholder="Min price"
                value={draftMinPrice}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '') {
                    setDraftMinPrice('');
                  } else {
                    const num = Math.max(0, Math.min(200000, Number(val)));
                    setDraftMinPrice(String(num));
                  }
                }}
                className="w-full pl-7 pr-3 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#1944F1]"
              />
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-xs font-semibold text-slate-400">₹</span>
              <input
                type="number"
                min="0"
                max="200000"
                placeholder="Max price"
                value={draftMaxPrice}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '') {
                    setDraftMaxPrice('');
                  } else {
                    const num = Math.max(0, Math.min(200000, Number(val)));
                    setDraftMaxPrice(String(num));
                  }
                }}
                className="w-full pl-7 pr-3 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#1944F1]"
              />
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium px-0.5">
            <span>Minimum: ₹0</span>
            <span>Max budget: ₹2,00,000</span>
          </div>
        </div>

        {/* Category Section */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-2xs space-y-3">
          <div>
            <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
              Category
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => {
              const isSel = draftCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setDraftCategory(cat.id)}
                  className={`px-4 py-2.5 rounded-2xl text-xs border transition-all ${
                    isSel
                      ? 'bg-[#1944F1] text-white border-[#1944F1] font-bold shadow-2xs'
                      : 'bg-[#F8FAFC] border-slate-200 text-slate-700 hover:bg-slate-100 font-medium'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Condition Section */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-2xs space-y-3">
          <div>
            <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
              Item Condition
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            {conditionOptions.map(cond => {
              const isSel = draftCondition === cond.id;
              return (
                <button
                  key={cond.id}
                  type="button"
                  onClick={() => setDraftCondition(cond.id)}
                  className={`px-4 py-2.5 rounded-2xl text-xs border transition-all ${
                    isSel
                      ? 'bg-[#1944F1] text-white border-[#1944F1] font-bold shadow-2xs'
                      : 'bg-[#F8FAFC] border-slate-200 text-slate-700 hover:bg-slate-100 font-medium'
                  }`}
                >
                  {cond.label}
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* 3. Bottom Fixed Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 px-6 flex items-center gap-3 z-40 shadow-lg">
        <button
          type="button"
          onClick={handleResetDraft}
          className="flex-1 py-3 px-4 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-all active:scale-[0.98] flex items-center justify-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>

        <button
          type="button"
          onClick={handleApply}
          className="flex-[2] py-3 px-4 rounded-2xl bg-[#1944F1] hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <Check className="w-4 h-4 stroke-[2.5]" />
          <span>Show Results</span>
        </button>
      </div>

    </motion.div>
  );
}
