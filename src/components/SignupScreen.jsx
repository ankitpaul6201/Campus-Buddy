import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle2, ChevronRight, School, User, Lock, Mail, Upload, FileText, AtSign } from 'lucide-react';
import { searchUniversities } from '../services/universityService';
import { registerUser } from '../lib/api';

export default function SignupScreen({ onNavigate, onSignupSuccess }) {
  const [step, setStep] = useState(1);
  const [studentIdFile, setStudentIdFile] = useState(null);
  const [studentIdFileName, setStudentIdFileName] = useState('');
  const [formData, setFormData] = useState({
    university: null,
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loadingUnis, setLoadingUnis] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoadingUnis(true);
      const results = await searchUniversities(query);
      setSearchResults(results);
      setLoadingUnis(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const selectUniversity = (uni) => {
    setFormData(prev => ({ ...prev, university: uni }));
    setError('');
  };

  const handleStep1Next = () => {
    if (!formData.university) {
      setError('Please select your university or campus to continue.');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleStep2Submit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!formData.username.trim()) {
      setError('Please choose a username for your campus profile.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Please enter a valid college or personal email.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please check again.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await registerUser({
        username: formData.username.trim().toLowerCase().replace(/\s+/g, ''),
        email: formData.email.trim(),
        password: formData.password,
        fullName: formData.name.trim(),
        universityName: formData.university?.name || 'Stanford University'
      });
      setIsSubmitting(false);
      if (res && res.user) {
        if (onSignupSuccess) {
          onSignupSuccess(res.user);
        }
      } else {
        setError('Registration failed. User may already exist.');
      }
    } catch (err) {
      setIsSubmitting(false);
      setError(err.message || 'Registration failed. User already exists or server offline.');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: "100%" }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: "-100%" }}
      transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
      className="absolute inset-0 w-full h-full bg-[#1944F1] text-white flex flex-col justify-between overflow-hidden select-none font-sans z-20"
    >
      {/* Top Header Section - Electric Blue */}
      <div className="pt-14 px-6 pb-6 flex flex-col justify-between shrink-0">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => step === 2 ? setStep(1) : onNavigate('welcome')}
            className="text-white p-1 hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-normal text-white">
            <span>Step {step} of 2</span>
          </div>

          <button
            onClick={() => onNavigate('login')}
            className="text-white font-medium text-sm hover:opacity-90 transition-opacity"
          >
            Sign In
          </button>
        </div>

        {/* Heading: Bold */}
        <div className="mt-6 space-y-1.5">
          <h1 className="text-3xl font-bold tracking-tight text-white font-sans">
            {step === 1 ? 'Select Your Campus' : 'Create Account'}
          </h1>
          {/* Subtitle: Normal font */}
          <p className="text-xs text-blue-100/90 leading-relaxed font-normal">
            {step === 1 
              ? 'Find your university to trade safely within your campus.' 
              : `Joining ${formData.university?.name || 'Campus'}. Fill in your details below.`}
          </p>
        </div>
      </div>

      {/* Bottom Sheet - White Rounded Card */}
      <div className="bg-white text-slate-900 rounded-t-[36px] px-7 pt-7 pb-8 flex-1 flex flex-col justify-between shadow-2xl relative z-10 overflow-y-auto">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            /* STEP 1: SELECT UNIVERSITY */
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-4 flex-1 flex flex-col">
                {error && (
                  <div className="p-3 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 text-xs font-normal">
                    {error}
                  </div>
                )}

                {/* Search Bar - Normal font */}
                <div className="relative">
                  <School className="w-5 h-5 text-slate-400 absolute left-4 top-4" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search university name..."
                    className="w-full pl-12 pr-4 py-4 bg-[#F3F4F6] text-slate-900 placeholder-slate-400 rounded-2xl text-sm sm:text-base font-normal focus:outline-none focus:ring-2 focus:ring-[#1944F1] transition-all"
                  />
                </div>

                {/* Selected Pill Header - Normal font */}
                {formData.university && (
                  <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5.5 h-5.5 text-[#1944F1] shrink-0" />
                      <div>
                        <span className="text-sm font-bold text-slate-900 block font-sans">
                          {formData.university.name}
                        </span>
                        <span className="text-xs text-slate-500 font-normal">
                          {formData.university.city}, {formData.university.state}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Search Results List - Normal font */}
                <div className="flex-1 overflow-y-auto max-h-[260px] space-y-2.5 pr-1">
                  {loadingUnis ? (
                    <div className="py-8 text-center text-sm text-slate-400 font-normal">
                      Searching universities...
                    </div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((uni) => {
                      const isSelected = formData.university?.id === uni.id;
                      return (
                        <div
                          key={uni.id}
                          onClick={() => selectUniversity(uni)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                            isSelected 
                              ? 'bg-blue-50 border-[#1944F1] shadow-xs' 
                              : 'bg-[#F9FAFB] border-gray-100 hover:bg-gray-100'
                          }`}
                        >
                          <div>
                            <h4 className="text-sm font-semibold text-slate-900 font-sans">
                              {uni.name}
                            </h4>
                            <p className="text-xs text-slate-500 font-normal mt-0.5">
                              {uni.city}, {uni.state}
                            </p>
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="w-5 h-5 text-[#1944F1] shrink-0" />
                          )}
                        </div>
                      );
                    })
                  ) : query.trim() ? (
                    <div className="py-8 text-center text-sm text-slate-400 font-normal">
                      No campus found matching "{query}".
                    </div>
                  ) : (
                    <div className="py-8 text-center text-sm text-slate-400 font-normal">
                      Type your college name above to search.
                    </div>
                  )}
                </div>

                {/* Upload College Student ID Card / Proof */}
                <div className="pt-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Upload Student ID Card (Campus Verification)
                  </label>
                  <label className="w-full p-3.5 rounded-2xl border border-dashed border-slate-300 bg-[#F9FAFB] hover:bg-slate-100/80 transition-all cursor-pointer flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 text-[#1944F1] flex items-center justify-center shrink-0">
                        {studentIdFileName ? <FileText className="w-5 h-5 text-emerald-600" /> : <Upload className="w-4.5 h-4.5" />}
                      </div>
                      <div className="text-left">
                        <span className="text-xs font-bold text-slate-800 block leading-tight">
                          {studentIdFileName ? studentIdFileName : 'Upload College ID Photo / PDF'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal block leading-tight mt-0.5">
                          {studentIdFileName ? '✅ ID attached for student verification' : 'PNG, JPG or PDF up to 5MB'}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-[#1944F1] bg-white px-3 py-1 rounded-xl border border-blue-200 shadow-2xs group-hover:bg-blue-50 transition-colors shrink-0">
                      {studentIdFileName ? 'Change' : 'Browse'}
                    </span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setStudentIdFile(e.target.files[0]);
                          setStudentIdFileName(e.target.files[0].name);
                          setError('');
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Step 1 Primary Action Button - Medium font */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleStep1Next}
                  className="w-full py-4 px-6 rounded-2xl bg-[#0F0F0F] hover:bg-black text-white font-semibold text-base shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          ) : (
            /* STEP 2: ACCOUNT DETAILS FORM */
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col justify-between space-y-4"
            >
              <form onSubmit={handleStep2Submit} className="space-y-4 flex-1">
                {error && (
                  <div className="p-3.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 text-xs sm:text-sm font-normal">
                    {error}
                  </div>
                )}

                {/* Full Name Input - Normal font */}
                <div className="relative">
                  <User className="w-5 h-5 text-slate-400 absolute left-4 top-4" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Full Name"
                    className="w-full pl-12 pr-4 py-4 bg-[#F3F4F6] text-slate-900 placeholder-slate-400 rounded-2xl text-base font-normal focus:outline-none focus:ring-2 focus:ring-[#1944F1] transition-all"
                  />
                </div>

                {/* Username Input - Normal font */}
                <div className="relative">
                  <AtSign className="w-5 h-5 text-slate-400 absolute left-4 top-4" />
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value.toLowerCase().replace(/\s+/g, '') }))}
                    placeholder="Username (e.g. alex_rivera)"
                    className="w-full pl-12 pr-4 py-4 bg-[#F3F4F6] text-slate-900 placeholder-slate-400 rounded-2xl text-base font-normal focus:outline-none focus:ring-2 focus:ring-[#1944F1] transition-all"
                  />
                </div>

                {/* College Email Input - Normal font */}
                <div className="relative">
                  <Mail className="w-5 h-5 text-slate-400 absolute left-4 top-4" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="College Email (.edu)"
                    className="w-full pl-12 pr-4 py-4 bg-[#F3F4F6] text-slate-900 placeholder-slate-400 rounded-2xl text-base font-normal focus:outline-none focus:ring-2 focus:ring-[#1944F1] transition-all"
                  />
                </div>

                {/* Password Input - Normal font */}
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-4" />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Create Password"
                    className="w-full pl-12 pr-4 py-4 bg-[#F3F4F6] text-slate-900 placeholder-slate-400 rounded-2xl text-base font-normal focus:outline-none focus:ring-2 focus:ring-[#1944F1] transition-all"
                  />
                </div>

                {/* Confirm Password Input - Normal font */}
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-4" />
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirm Password"
                    className="w-full pl-12 pr-4 py-4 bg-[#F3F4F6] text-slate-900 placeholder-slate-400 rounded-2xl text-base font-normal focus:outline-none focus:ring-2 focus:ring-[#1944F1] transition-all"
                  />
                </div>

                {/* Submit Primary Button - Medium font */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 px-6 rounded-2xl bg-[#0F0F0F] hover:bg-black text-white font-semibold text-base shadow-md transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2 font-normal">
                        <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Creating Account...
                      </span>
                    ) : (
                      <span>Complete Registration</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </motion.div>
  );
}
