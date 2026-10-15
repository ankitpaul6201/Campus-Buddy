import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, CheckCircle2, ChevronRight, School,
  User, Lock, Mail, Upload, FileText, Calendar, Eye, EyeOff,
  Scan, ShieldCheck, AlertCircle, XCircle, RefreshCw, Sparkles, Loader2, GraduationCap, WifiOff
} from 'lucide-react';
import { searchUniversities } from '../services/universityService';
import { API_BASE_URL, uploadStudentId, apiSignup } from '../lib/api';
import { verifyStudentIdCard } from '../services/idVerificationService';

export default function SignupScreen({ onNavigate, onLoginSuccess }) {
  const [step, setStep] = useState(1);
  const [studentIdFile, setStudentIdFile] = useState(null);
  const [studentIdFileName, setStudentIdFileName] = useState('');
  const [idPreviewUrl, setIdPreviewUrl] = useState(null);
  const [isUploadingId, setIsUploadingId] = useState(false);
  const [uploadedIdUrl, setUploadedIdUrl] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    university: null,
    name: '',
    dob: '',
    course: '',
    year: '1st Year',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // ID Verification Process state
  const [verificationProgress, setVerificationProgress] = useState({
    phase: 'idle', // 'idle' | 'scanning' | 'verifying_campus' | 'verifying_name' | 'success' | 'failed'
    percentage: 0,
    message: '',
    campusMatched: false,
    campusMatchReason: '',
    nameMatched: false,
    nameMatchReason: '',
    failureReason: '',
    extractedText: ''
  });


  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loadingUnis, setLoadingUnis] = useState(false);
  const [isNetworkOffline, setIsNetworkOffline] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Clean up object URL when component unmounts
  useEffect(() => {
    return () => {
      if (idPreviewUrl) URL.revokeObjectURL(idPreviewUrl);
    };
  }, [idPreviewUrl]);

  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setSearchResults([]);
      setIsNetworkOffline(false);
      setLoadingUnis(false);
      return;
    }

    let isCancelled = false;
    const loadUnis = async () => {
      setLoadingUnis(true);
      setIsNetworkOffline(false);
      try {
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
          setIsNetworkOffline(true);
          setSearchResults([]);
          setLoadingUnis(false);
          return;
        }
        const results = await searchUniversities(query);
        if (!isCancelled) {
          setSearchResults(results);
        }
      } catch (err) {
        if (!isCancelled) {
          if (err.message === 'NETWORK_OFFLINE' || (typeof navigator !== 'undefined' && !navigator.onLine)) {
            setIsNetworkOffline(true);
          }
          setSearchResults([]);
        }
      } finally {
        if (!isCancelled) {
          setLoadingUnis(false);
        }
      }
    };

    const timer = setTimeout(loadUnis, 280);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
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
    if (isUploadingId) {
      setError('Please wait until your Student ID Card has completely uploaded.');
      return;
    }
    if (!uploadedIdUrl) {
      setError('Please upload your Student ID Card for verification before continuing.');
      return;
    }
    const uniName = typeof formData.university === 'string' ? formData.university : (formData.university?.name || formData.university?.universityName || 'Campus Member');
    localStorage.setItem('pending_uni', uniName);
    setError('');
    setStep(2);
  };

  // Run ID Verification with OCR and credential matching
  const startIdVerification = async (fileToScan = studentIdFile) => {
    if (!fileToScan) {
      setError('Student ID document is missing. Please upload your student ID.');
      setStep(1);
      return;
    }

    setStep(3);
    setVerificationProgress({
      phase: 'scanning',
      percentage: 15,
      message: 'Initializing neural OCR engine...',
      campusMatched: false,
      campusMatchReason: '',
      nameMatched: false,
      nameMatchReason: '',
      failureReason: '',
      extractedText: ''
    });

    try {
      const result = await verifyStudentIdCard(
        fileToScan,
        {
          university: formData.university,
          name: formData.name
        },
        (progress) => {
          setVerificationProgress(prev => ({
            ...prev,
            phase: progress.phase,
            percentage: progress.percentage,
            message: progress.message
          }));
        }
      );

      if (result.success) {
        localStorage.setItem('user_id_verified', 'true');
        localStorage.setItem('pending_id_verified', 'true');
        setVerificationProgress({
          phase: 'success',
          percentage: 100,
          message: 'Student ID successfully verified!',
          campusMatched: true,
          campusMatchReason: result.campusMatchReason,
          nameMatched: true,
          nameMatchReason: result.nameMatchReason,
          failureReason: '',
          extractedText: result.extractedText
        });

        // Small delay to let user see the completed checklist with checkmarks
        setTimeout(() => {
          executeSignup();
        }, 1200);
      } else {
        setVerificationProgress({
          phase: 'failed',
          percentage: 100,
          message: 'Verification failed',
          campusMatched: result.campusMatched,
          campusMatchReason: result.campusMatchReason,
          nameMatched: result.nameMatched,
          nameMatchReason: result.nameMatchReason,
          failureReason: result.failureReason,
          extractedText: result.extractedText
        });
      }
    } catch (err) {
      setVerificationProgress({
        phase: 'failed',
        percentage: 100,
        message: 'Verification error',
        campusMatched: false,
        nameMatched: false,
        failureReason: 'Unable to scan ID card. Please ensure your upload is a clear photo or screenshot.',
        extractedText: ''
      });
    }
  };

  // Handle re-upload when verification fails
  const handleReuploadId = async (e) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setStudentIdFile(file);
      setStudentIdFileName(file.name);
      if (idPreviewUrl) URL.revokeObjectURL(idPreviewUrl);
      setIdPreviewUrl(URL.createObjectURL(file));

      // Background upload to Cloudinary
      uploadStudentId(file)
        .then(url => {
          setUploadedIdUrl(url);
          localStorage.setItem('user_student_id_url', url);
        })
        .catch(err => console.error('Cloudinary student ID upload error:', err));

      // Re-trigger verification
      startIdVerification(file);
    }
  };

  // Step 2: Validate details and start ID Verification
  const handleStep2Submit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) { setError('Please enter your full name.'); return; }
    if (!formData.dob) { setError('Please enter your date of birth.'); return; }
    if (!formData.course.trim()) { setError('Please enter your course or major (e.g. B.Tech / B.Sc).'); return; }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Please enter a valid email address.'); return;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.'); return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.'); return;
    }

    if (!studentIdFile) {
      setError('Student ID card missing. Please upload your student ID to continue.');
      setStep(1);
      return;
    }

    // Launch verification process
    startIdVerification(studentIdFile);
  };

  // Execute account creation directly in MongoDB Atlas once ID verification passes
  const executeSignup = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      const uniName = formData.university?.name || (typeof formData.university === 'string' ? formData.university : 'Campus Member');
      localStorage.setItem('pending_uni', uniName);
      localStorage.setItem('pending_dob', formData.dob);
      localStorage.setItem('user_dob', formData.dob);
      localStorage.setItem('pending_course', formData.course.trim());
      localStorage.setItem('user_course', formData.course.trim());
      localStorage.setItem('pending_year', formData.year);
      localStorage.setItem('user_year', formData.year);
      localStorage.setItem('user_id_verified', 'true');
      localStorage.setItem('pending_id_verified', 'true');

      const studentIdUrl = uploadedIdUrl || localStorage.getItem('user_student_id_url') || '';

      const result = await apiSignup({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        dob: formData.dob,
        course: formData.course.trim(),
        year: formData.year,
        universityName: uniName,
        studentIdUrl: studentIdUrl,
        isVerified: true
      });

      if (result.success) {
        if (onLoginSuccess) {
          onLoginSuccess(result.user);
        } else {
          onNavigate('main');
        }
      }
    } catch (err) {
      console.error('Registration error:', err);
      const msg = err.message || '';
      if (msg.includes('already exists') || msg.includes('duplicate')) {
        setError('An account with this email already exists. Please sign in.');
      } else {
        setError(msg || 'Registration failed. Please check your details and try again.');
      }
      setStep(2);
    } finally {
      setIsSubmitting(false);
    }
  };

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
            onClick={() => {
              if (step === 3) setStep(2);
              else if (step === 2) setStep(1);
              else onNavigate('welcome');
            }}
            className="text-white p-1 hover:opacity-90 transition-all duration-200 hover:-translate-x-1 active:-translate-x-1.5 active:scale-95 group"
            title="Go back"
          >
            <ArrowLeft className="w-6 h-6 transition-transform duration-200 group-hover:-translate-x-0.5 group-active:-translate-x-1" />
          </button>

          <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-normal text-white">
            <span>{step === 3 ? 'ID Verification' : `Step ${step} of 2`}</span>
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
            {step === 1 ? 'Select Your Campus' : step === 2 ? 'Create Account' : 'Verify Student ID'}
          </h1>
          <p className="text-xs text-blue-100/90 leading-relaxed font-normal">
            {step === 1
              ? 'Find your university to trade safely within your campus.'
              : step === 2
              ? `Joining ${formData.university?.name || 'Campus'}. Fill in your details below.`
              : 'Verifying credentials against your uploaded student ID card.'}
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
                    onChange={(e) => {
                      setQuery(e.target.value);
                      if (formData.university) {
                        setFormData(prev => ({ ...prev, university: null }));
                      }
                    }}
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
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, university: null }))}
                      className="text-xs font-semibold text-[#1944F1] hover:underline px-2.5 py-1 rounded-lg hover:bg-blue-100/60 transition-colors shrink-0"
                    >
                      Change
                    </button>
                  </div>
                )}

                {!formData.university && (
                  <div className="flex-1 overflow-y-auto max-h-[260px] space-y-2.5 pr-1">
                    {isNetworkOffline ? (
                      <div className="py-8 px-4 text-center space-y-2.5 bg-amber-50/60 rounded-2xl border border-amber-200/60">
                        <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 mx-auto flex items-center justify-center">
                          <WifiOff className="w-5 h-5" />
                        </div>
                        <h5 className="text-sm font-bold text-slate-800">Network Offline</h5>
                        <p className="text-xs text-slate-500 max-w-xs mx-auto">
                          You are currently offline. Please check your internet connection to search colleges.
                        </p>
                      </div>
                    ) : loadingUnis ? (
                      <div className="py-8 text-center text-sm text-slate-400">Searching 55,000+ colleges & universities...</div>
                    ) : searchResults.length > 0 ? (
                      <>
                        {searchResults.slice(0, 60).map((uni) => {
                          const isSelected = formData.university?.id === uni.id;
                          return (
                            <div
                              key={uni.id}
                              onClick={() => selectUniversity(uni)}
                              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${isSelected ? 'bg-blue-50 border-[#1944F1]' : 'bg-[#F9FAFB] border-gray-100 hover:bg-gray-100'
                                }`}
                            >
                              <div className="pr-3">
                                <h4 className="text-sm font-semibold text-slate-900 leading-snug">{uni.name}</h4>
                                <p className="text-xs text-slate-500 font-normal mt-0.5">
                                  {uni.universityName ? `${uni.universityName} • ` : uni.type ? `${uni.type} • ` : ''}
                                  {uni.city ? `${uni.city}, ` : ''}{uni.state || 'India'}
                                </p>
                              </div>
                              {isSelected && <CheckCircle2 className="w-5 h-5 text-[#1944F1] shrink-0" />}
                            </div>
                          );
                        })}
                        {searchResults.length > 60 && (
                          <div className="py-2.5 text-center text-xs text-slate-400">
                            Showing top 60 of {searchResults.length} matches. Type more characters to narrow down.
                          </div>
                        )}
                      </>
                    ) : query.trim().length >= 2 ? (
                      <div className="py-8 text-center text-sm text-slate-400">No college or university found matching "{query}".</div>
                    ) : (
                      <div className="py-10 px-4 text-center space-y-2 text-slate-400">
                        <p className="text-sm font-medium text-slate-500">Search your college or university</p>
                        <p className="text-xs text-slate-400 max-w-xs mx-auto">
                          Search across 55,000+ colleges and universities in India to get started.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Upload Student ID */}
                <div className="pt-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                    <span>Upload Student ID Card (Campus Verification)</span>
                    <span className="text-rose-500 font-bold">*Required</span>
                  </label>
                  <label className={`w-full p-3.5 rounded-2xl border border-dashed transition-all cursor-pointer flex items-center justify-between group ${
                    isUploadingId
                      ? 'border-blue-400 bg-blue-50/60 pointer-events-none'
                      : uploadedIdUrl
                        ? 'border-emerald-300 bg-emerald-50/40 hover:bg-emerald-50/70'
                        : 'border-slate-300 bg-[#F9FAFB] hover:bg-slate-100/80'
                  }`}>
                    <div className="flex items-center gap-3">
                      {idPreviewUrl ? (
                        <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200 shrink-0 relative">
                          <img src={idPreviewUrl} alt="ID preview" className="w-full h-full object-cover" />
                          {isUploadingId && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <Loader2 className="w-4 h-4 text-white animate-spin" />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 text-[#1944F1] flex items-center justify-center shrink-0">
                          {isUploadingId ? (
                            <Loader2 className="w-4 h-4 animate-spin text-[#1944F1]" />
                          ) : uploadedIdUrl ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <Upload className="w-4 h-4" />
                          )}
                        </div>
                      )}
                      <div className="text-left">
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 leading-tight">
                          {isUploadingId ? (
                            'Uploading...'
                          ) : uploadedIdUrl ? (
                            <>
                              <svg 
                                viewBox="0 0 191.667 191.667" 
                                className="w-4 h-4 text-emerald-500 fill-current shrink-0"
                              >
                                <path d="M95.833,0C42.991,0,0,42.99,0,95.833s42.991,95.834,95.833,95.834s95.833-42.991,95.833-95.834S148.676,0,95.833,0z M150.862,79.646l-60.207,60.207c-2.56,2.56-5.963,3.969-9.583,3.969c-3.62,0-7.023-1.409-9.583-3.969l-30.685-30.685 c-2.56-2.56-3.97-5.963-3.97-9.583c0-3.621,1.41-7.024,3.97-9.584c2.559-2.56,5.962-3.97,9.583-3.97c3.62,0,7.024,1.41,9.583,3.971 l21.101,21.1l50.623-50.623c2.56-2.56,5.963-3.969,9.583-3.969c3.62,0,7.023,1.409,9.583,3.969 C156.146,65.765,156.146,74.362,150.862,79.646z"/>
                              </svg>
                              <span>Uploaded</span>
                            </>
                          ) : (
                            'Upload College ID Card'
                          )}
                        </span>
                        {!isUploadingId && !uploadedIdUrl && (
                          <span className="text-[10px] text-slate-400 block leading-tight mt-0.5">
                            PNG or JPG format
                          </span>
                        )}
                      </div>
                    </div>
                    {!isUploadingId && (
                      <span className={`text-xs font-semibold px-3 py-1 rounded-xl border shadow-2xs transition-colors shrink-0 ${
                        uploadedIdUrl
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-white text-[#1944F1] border-blue-200 group-hover:bg-blue-50'
                      }`}>
                        {uploadedIdUrl ? 'Change' : 'Browse'}
                      </span>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isUploadingId}
                      className="hidden"
                      onChange={async (e) => {
                        if (e.target.files?.[0]) {
                          const file = e.target.files[0];
                          setStudentIdFile(file);
                          if (idPreviewUrl) URL.revokeObjectURL(idPreviewUrl);
                          setIdPreviewUrl(URL.createObjectURL(file));
                          setStudentIdFileName('Uploading...');
                          setIsUploadingId(true);
                          setUploadedIdUrl('');
                          setError('');
                          try {
                            const url = await uploadStudentId(file);
                            if (url) {
                              setUploadedIdUrl(url);
                              localStorage.setItem('user_student_id_url', url);
                              setStudentIdFileName('Uploaded');
                            } else {
                              throw new Error('Upload failed - no URL returned');
                            }
                          } catch (err) {
                            console.error('Cloudinary student ID upload error:', err);
                            setError('Failed to upload ID card. Please ensure a stable connection and try again.');
                            setStudentIdFileName('');
                            setUploadedIdUrl('');
                            localStorage.removeItem('user_student_id_url');
                          } finally {
                            setIsUploadingId(false);
                          }
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="pt-2">
                {(() => {
                  const isContinueDisabled = !formData.university || isUploadingId || !uploadedIdUrl;
                  return (
                    <button
                      type="button"
                      id="college-continue-btn"
                      onClick={handleStep1Next}
                      disabled={isContinueDisabled}
                      className={`w-full py-4 px-6 rounded-2xl font-semibold text-base transition-all flex items-center justify-center gap-2 ${
                        isContinueDisabled
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none select-none pointer-events-none'
                          : 'bg-[#0F0F0F] hover:bg-black text-white shadow-md active:scale-[0.98] cursor-pointer'
                      }`}
                    >
                      {isUploadingId ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                          <span>Uploading...</span>
                        </>
                      ) : !uploadedIdUrl ? (
                        <>
                          <span>Upload ID Card to Continue</span>
                          <ChevronRight className="w-5 h-5 opacity-40" />
                        </>
                      ) : !formData.university ? (
                        <>
                          <span>Select College to Continue</span>
                          <ChevronRight className="w-5 h-5 opacity-40" />
                        </>
                      ) : (
                        <>
                          <span>Continue</span>
                          <ChevronRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  );
                })()}
              </div>
            </motion.div>
          ) : step === 2 ? (
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
                  <div className="p-3.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 text-xs sm:text-sm font-normal leading-relaxed">
                    <span>{error}</span>
                    {error.includes('already exists') && (
                      <button
                        type="button"
                        onClick={() => onNavigate('login')}
                        className="block mt-1 font-bold text-[#1944F1] hover:underline"
                      >
                        Sign in to your existing account →
                      </button>
                    )}
                  </div>
                )}

                <div className="relative">
                  <User className="w-5 h-5 text-slate-400 absolute left-4 top-4" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Full Name (matches student ID)"
                    className="w-full pl-12 pr-4 py-4 bg-[#F3F4F6] text-slate-900 placeholder-slate-400 rounded-2xl text-base font-normal focus:outline-none focus:ring-2 focus:ring-[#1944F1] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 ml-1">
                    Date of Birth
                  </label>
                  <div className="relative">
                    <Calendar className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="date"
                      value={formData.dob}
                      onChange={(e) => setFormData(prev => ({ ...prev, dob: e.target.value }))}
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full pl-12 pr-4 py-3.5 bg-[#F3F4F6] text-slate-900 rounded-2xl text-base font-normal focus:outline-none focus:ring-2 focus:ring-[#1944F1] transition-all cursor-pointer"
                    />
                  </div>
                </div>

                <div className="relative">
                  <GraduationCap className="w-5 h-5 text-slate-400 absolute left-4 top-4 pointer-events-none" />
                  <input
                    type="text"
                    value={formData.course}
                    onChange={(e) => setFormData(prev => ({ ...prev, course: e.target.value }))}
                    placeholder="Course / Degree (e.g. B.Tech CS, B.Sc, MBA)"
                    className="w-full pl-12 pr-4 py-4 bg-[#F3F4F6] text-slate-900 placeholder-slate-400 rounded-2xl text-base font-normal focus:outline-none focus:ring-2 focus:ring-[#1944F1] transition-all"
                  />
                </div>

                <div className="relative">
                  <select
                    value={formData.year}
                    onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
                    className="w-full px-5 py-4 bg-[#F3F4F6] text-slate-900 rounded-2xl text-base font-normal focus:outline-none focus:ring-2 focus:ring-[#1944F1] transition-all appearance-none cursor-pointer pr-10"
                  >
                    <option value="1st Year">Current Year: 1st Year (Freshman)</option>
                    <option value="2nd Year">Current Year: 2nd Year (Sophomore)</option>
                    <option value="3rd Year">Current Year: 3rd Year (Junior)</option>
                    <option value="4th Year">Current Year: 4th Year (Senior)</option>
                    <option value="Postgraduate / Master's">Current Year: Postgraduate / Master's</option>
                    <option value="Ph.D. Scholar">Current Year: Ph.D. Scholar</option>
                  </select>
                  <ChevronRight className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
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
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Create Password (min. 8 chars)"
                    autoComplete="new-password"
                    className="w-full pl-12 pr-12 py-4 bg-[#F3F4F6] text-slate-900 placeholder-slate-400 rounded-2xl text-base font-normal focus:outline-none focus:ring-2 focus:ring-[#1944F1] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                </div>

                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-4" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirm Password"
                    autoComplete="new-password"
                    className="w-full pl-12 pr-12 py-4 bg-[#F3F4F6] text-slate-900 placeholder-slate-400 rounded-2xl text-base font-normal focus:outline-none focus:ring-2 focus:ring-[#1944F1] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                    title={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 px-6 rounded-2xl bg-[#0F0F0F] hover:bg-black text-white font-semibold text-base shadow-md transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <span>Verify ID & Create Account</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </motion.div>
          ) : (
            /* STEP 3: ID VERIFICATION & SCANNING */
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col justify-between space-y-6 pt-2"
            >
              <div className="space-y-6 flex-1 flex flex-col justify-center items-center">
                {/* ID Scanner Preview Card with Laser Animation */}
                <div className="w-full relative rounded-3xl overflow-hidden border border-slate-200 bg-slate-900 shadow-lg aspect-[16/10] max-h-[320px] flex items-center justify-center">
                  {idPreviewUrl ? (
                    <img
                      src={idPreviewUrl}
                      alt="Student ID Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-6 text-slate-400">
                      <FileText className="w-12 h-12 mx-auto mb-2 text-slate-500" />
                      <p className="text-xs">Student ID Attached</p>
                    </div>
                  )}

                  {/* Laser Scanning Beam Animation */}
                  {verificationProgress.phase !== 'success' && verificationProgress.phase !== 'failed' && (
                    <motion.div
                      animate={{ top: ['0%', '100%', '0%'] }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-[#1944F1] to-transparent shadow-[0_0_18px_#3B82F6]"
                    />
                  )}
                </div>

                {/* Status Text / Result */}
                {verificationProgress.phase === 'failed' ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-3"
                  >
                    <div className="flex items-start gap-2.5">
                      <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <h5 className="font-bold text-rose-900">ID Verification Failed</h5>
                        <p className="text-rose-700 mt-1 font-normal leading-relaxed">
                          {verificationProgress.failureReason}
                        </p>
                      </div>
                    </div>

                    <div className="pt-1 flex flex-col gap-2">
                      <label className="w-full py-3.5 px-4 rounded-xl bg-[#1944F1] hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm active:scale-[0.98]">
                        <Upload className="w-4 h-4" />
                        <span>Upload Another ID Card Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleReuploadId}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="w-full py-2.5 px-4 rounded-xl bg-white border border-rose-200 text-rose-700 hover:bg-rose-100/50 font-semibold text-xs transition-colors"
                      >
                        Change Selected College or Name
                      </button>
                    </div>
                  </motion.div>
                ) : verificationProgress.phase === 'success' ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-4 flex flex-col items-center justify-center text-center space-y-2"
                  >
                    <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <h4 className="text-lg font-bold text-slate-900">ID Verified!</h4>
                    <p className="text-xs text-slate-500 font-normal">Setting up your campus account...</p>
                  </motion.div>
                ) : (
                  <div className="py-4 flex flex-col items-center justify-center text-center space-y-2">
                    <div className="flex items-center gap-2.5 text-slate-800">
                      <Loader2 className="w-5 h-5 text-[#1944F1] animate-spin" />
                      <span className="text-lg font-bold tracking-tight">Verifying ID...</span>
                    </div>
                    <p className="text-xs text-slate-400 font-normal">
                      Please wait a moment while we verify your ID card.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
