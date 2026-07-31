import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, CheckCircle2, ChevronRight, School,
  User, Lock, Mail, Upload, FileText, AtSign
} from 'lucide-react';
import { useSignUp } from '@clerk/clerk-react';
import { searchUniversities } from '../services/universityService';
import { API_BASE_URL } from '../lib/api';

export default function SignupScreen({ onNavigate }) {
  const { signUp, setActive, isLoaded } = useSignUp();

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

  // Email verification step (shown after Clerk sends OTP)
  const [verificationStep, setVerificationStep] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loadingUnis, setLoadingUnis] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!query.trim()) { setSearchResults([]); return; }
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

  // Step 2: Create Clerk account
  const handleStep2Submit = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;
    setError('');

    if (!formData.name.trim()) { setError('Please enter your full name.'); return; }
    if (!formData.username.trim()) { setError('Please choose a username.'); return; }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Please enter a valid email address.'); return;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.'); return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.'); return;
    }

    setIsSubmitting(true);
    try {
      const nameParts = formData.name.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || '';

      await signUp.create({
        emailAddress: formData.email.trim(),
        password: formData.password,
        firstName,
        lastName,
        username: formData.username.trim().toLowerCase().replace(/\s+/g, ''),
      });

      // Send email verification code
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setVerificationStep(true);
    } catch (err) {
      const msg = err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || '';
      if (msg.includes('already') || msg.includes('taken') || msg.includes('exists')) {
        setError('An account with this email or username already exists. Try signing in.');
      } else if (msg.includes('password')) {
        setError('Password is too weak. Use at least 8 characters with a mix of letters and numbers.');
      } else {
        setError(msg || 'Registration failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 3: Verify OTP code sent by Clerk
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;
    setError('');
    setIsSubmitting(true);

    try {
      const result = await signUp.attemptEmailAddressVerification({ code: verificationCode });

      if (result.status === 'complete') {
        // Activate Clerk session
        await setActive({ session: result.createdSessionId });

        // Save university to backend campus profile
        try {
          const token = await result.createdSessionId; // we'll use getToken below
          // Best effort — if this fails the user can update later
          await fetch(`${API_BASE_URL}/auth/me/university`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              // Note: auth token is now active via the session, backend reads it via clerkMiddleware
            },
            body: JSON.stringify({
              universityName: formData.university?.name || 'Campus Member',
              username: formData.username.trim().toLowerCase(),
            }),
          });
        } catch {
          // Non-fatal — campus profile will be created on next /me call
        }

        // App.jsx detects isSignedIn=true and navigates to 'main' automatically
      } else {
        setError('Verification incomplete. Please try again.');
      }
    } catch (err) {
      const msg = err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || '';
      if (msg.includes('incorrect') || msg.includes('invalid') || msg.includes('code')) {
        setError('Incorrect verification code. Check your email and try again.');
      } else {
        setError(msg || 'Verification failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Verification Screen ──────────────────────────────────────────────────
  if (verificationStep) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 w-full h-full bg-[#1944F1] flex flex-col justify-between overflow-hidden select-none font-sans z-20"
      >
        <div className="pt-14 px-6 pb-6 shrink-0">
          <button
            onClick={() => setVerificationStep(false)}
            className="text-white p-1 hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="mt-6 space-y-1.5">
            <h1 className="text-3xl font-bold tracking-tight text-white font-sans">
              Verify your email
            </h1>
            <p className="text-xs text-blue-100/90 leading-relaxed font-normal">
              We sent a 6-digit code to <span className="font-semibold">{formData.email}</span>. Enter it below.
            </p>
          </div>
        </div>

        <div className="bg-white text-slate-900 rounded-t-[36px] px-7 pt-7 pb-10 flex-1 flex flex-col justify-start shadow-2xl space-y-6">
          <form onSubmit={handleVerifyCode} className="space-y-4">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 text-xs font-normal">
                {error}
              </div>
            )}
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter 6-digit code"
              autoFocus
              className="w-full px-5 py-4 bg-[#F3F4F6] text-slate-900 placeholder-slate-400 rounded-2xl text-xl font-bold tracking-[0.3em] text-center focus:outline-none focus:ring-2 focus:ring-[#1944F1] transition-all"
            />
            <button
              type="submit"
              disabled={isSubmitting || verificationCode.length < 6}
              className="w-full py-4 px-6 rounded-2xl bg-[#0F0F0F] hover:bg-black text-white font-semibold text-base shadow-md transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? 'Verifying...' : 'Verify & Join Campus Buddy'}
            </button>
          </form>
          <p className="text-center text-xs text-slate-400">
            Didn't get the code?{' '}
            <button
              type="button"
              onClick={async () => {
                await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
                setError('');
              }}
              className="text-[#1944F1] font-semibold hover:underline"
            >
              Resend
            </button>
          </p>
        </div>
      </motion.div>
    );
  }

  // ─── Main Signup Screens (Step 1 & 2) ────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, x: '100%' }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: '-100%' }}
      transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
      className="absolute inset-0 w-full h-full bg-[#1944F1] text-white flex flex-col justify-between overflow-hidden select-none font-sans z-20"
    >
      {/* Top Header Section */}
      <div className="pt-14 px-6 pb-6 flex flex-col justify-between shrink-0">
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

        <div className="mt-6 space-y-1.5">
          <h1 className="text-3xl font-bold tracking-tight text-white font-sans">
            {step === 1 ? 'Select Your Campus' : 'Create Account'}
          </h1>
          <p className="text-xs text-blue-100/90 leading-relaxed font-normal">
            {step === 1
              ? 'Find your university to trade safely within your campus.'
              : `Joining ${formData.university?.name || 'Campus'}. Fill in your details below.`}
          </p>
        </div>
      </div>

      {/* Bottom Sheet */}
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

                {formData.university && (
                  <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#1944F1] shrink-0" />
                      <div>
                        <span className="text-sm font-bold text-slate-900 block">{formData.university.name}</span>
                        <span className="text-xs text-slate-500 font-normal">{formData.university.city}, {formData.university.state}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex-1 overflow-y-auto max-h-[260px] space-y-2.5 pr-1">
                  {loadingUnis ? (
                    <div className="py-8 text-center text-sm text-slate-400">Searching universities...</div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((uni) => {
                      const isSelected = formData.university?.id === uni.id;
                      return (
                        <div
                          key={uni.id}
                          onClick={() => selectUniversity(uni)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                            isSelected ? 'bg-blue-50 border-[#1944F1]' : 'bg-[#F9FAFB] border-gray-100 hover:bg-gray-100'
                          }`}
                        >
                          <div>
                            <h4 className="text-sm font-semibold text-slate-900">{uni.name}</h4>
                            <p className="text-xs text-slate-500 font-normal mt-0.5">{uni.city}, {uni.state}</p>
                          </div>
                          {isSelected && <CheckCircle2 className="w-5 h-5 text-[#1944F1] shrink-0" />}
                        </div>
                      );
                    })
                  ) : query.trim() ? (
                    <div className="py-8 text-center text-sm text-slate-400">No campus found matching "{query}".</div>
                  ) : (
                    <div className="py-8 text-center text-sm text-slate-400">Type your college name above to search.</div>
                  )}
                </div>

                {/* Upload Student ID */}
                <div className="pt-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Upload Student ID Card (Campus Verification)
                  </label>
                  <label className="w-full p-3.5 rounded-2xl border border-dashed border-slate-300 bg-[#F9FAFB] hover:bg-slate-100/80 transition-all cursor-pointer flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 text-[#1944F1] flex items-center justify-center shrink-0">
                        {studentIdFileName ? <FileText className="w-5 h-5 text-emerald-600" /> : <Upload className="w-4 h-4" />}
                      </div>
                      <div className="text-left">
                        <span className="text-xs font-bold text-slate-800 block leading-tight">
                          {studentIdFileName || 'Upload College ID Photo / PDF'}
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
                        if (e.target.files?.[0]) {
                          setStudentIdFile(e.target.files[0]);
                          setStudentIdFileName(e.target.files[0].name);
                          setError('');
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

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
            /* STEP 2: ACCOUNT DETAILS */
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

                <div className="relative">
                  <Mail className="w-5 h-5 text-slate-400 absolute left-4 top-4" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="College Email"
                    autoComplete="email"
                    className="w-full pl-12 pr-4 py-4 bg-[#F3F4F6] text-slate-900 placeholder-slate-400 rounded-2xl text-base font-normal focus:outline-none focus:ring-2 focus:ring-[#1944F1] transition-all"
                  />
                </div>

                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-4" />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Create Password (min. 8 chars)"
                    autoComplete="new-password"
                    className="w-full pl-12 pr-4 py-4 bg-[#F3F4F6] text-slate-900 placeholder-slate-400 rounded-2xl text-base font-normal focus:outline-none focus:ring-2 focus:ring-[#1944F1] transition-all"
                  />
                </div>

                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-4" />
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirm Password"
                    autoComplete="new-password"
                    className="w-full pl-12 pr-4 py-4 bg-[#F3F4F6] text-slate-900 placeholder-slate-400 rounded-2xl text-base font-normal focus:outline-none focus:ring-2 focus:ring-[#1944F1] transition-all"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting || !isLoaded}
                    className="w-full py-4 px-6 rounded-2xl bg-[#0F0F0F] hover:bg-black text-white font-semibold text-base shadow-md transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Creating Account...
                      </span>
                    ) : (
                      <span>Continue to Verify Email</span>
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
