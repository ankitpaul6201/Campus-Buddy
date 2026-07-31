import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2, Globe, CheckCircle2, Send } from 'lucide-react';
import { submitUniversityRequest, COUNTRIES, STATES } from '../services/universityService';

export default function RequestUniversityModal({ isOpen, onClose, initialCountry = '', initialState = '' }) {
  const [name, setName] = useState('');
  const [countryId, setCountryId] = useState(initialCountry || 'US');
  const [stateId, setStateId] = useState(initialState || '');
  const [website, setWebsite] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const availableStates = STATES[countryId] || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    await submitUniversityRequest({ name, countryId, stateId, website });
    setSubmitting(false);
    setSuccess(true);

    setTimeout(() => {
      setSuccess(false);
      setName('');
      setWebsite('');
      onClose();
    }, 1800);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative text-slate-900 overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {success ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Request Submitted!</h3>
              <p className="text-xs text-slate-600 max-w-xs mx-auto">
                Thank you! Our campus verification team will review and add <span className="font-semibold text-slate-900">{name}</span> shortly.
              </p>
            </div>
          ) : (
            <div>
              <div className="mb-5 space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1944F1]/10 text-[#1944F1] text-[11px] font-semibold">
                  <Building2 className="w-3.5 h-3.5" /> Can't Find Your Campus?
                </div>
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Request University
                </h3>
                <p className="text-xs text-slate-500 font-normal">
                  Submit your university details so we can add it to Campus Buddy.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5">
                {/* University Name */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    University Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Northwestern University"
                    className="w-full px-4 py-3 bg-[#F3F4F6] text-slate-900 rounded-xl text-sm font-normal focus:outline-none focus:ring-2 focus:ring-[#1944F1]"
                  />
                </div>

                {/* Country */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Country
                    </label>
                    <select
                      value={countryId}
                      onChange={(e) => { setCountryId(e.target.value); setStateId(''); }}
                      className="w-full px-3 py-3 bg-[#F3F4F6] text-slate-900 rounded-xl text-xs font-normal focus:outline-none focus:ring-2 focus:ring-[#1944F1]"
                    >
                      {COUNTRIES.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.flagEmoji} {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* State */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      State / Province
                    </label>
                    <select
                      value={stateId}
                      onChange={(e) => setStateId(e.target.value)}
                      className="w-full px-3 py-3 bg-[#F3F4F6] text-slate-900 rounded-xl text-xs font-normal focus:outline-none focus:ring-2 focus:ring-[#1944F1]"
                    >
                      <option value="">Select State</option>
                      {availableStates.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Website */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Website (Optional)
                  </label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://northwestern.edu"
                      className="w-full pl-10 pr-4 py-3 bg-[#F3F4F6] text-slate-900 rounded-xl text-sm font-normal focus:outline-none focus:ring-2 focus:ring-[#1944F1]"
                    />
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 font-medium text-xs hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !name.trim()}
                    className="flex-1 py-3 px-4 rounded-xl bg-[#0F0F0F] hover:bg-black text-white font-medium text-xs shadow-md disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    {submitting ? 'Submitting...' : <><Send className="w-3.5 h-3.5" /> Request Campus</>}
                  </button>
                </div>
              </form>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
