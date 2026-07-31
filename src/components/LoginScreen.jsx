import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useSignIn } from '@clerk/clerk-react';

export default function LoginScreen({ onNavigate }) {
  const { signIn, setActive, isLoaded } = useSignIn();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Support email verification on login if user is unverified
  const [verificationStep, setVerificationStep] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;
    setError('');

    if (!identifier.trim()) {
      setError('Please enter your email.');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const result = await signIn.create({
        identifier: identifier.trim(),
        password,
      });

      if (result.status === 'complete') {
        // Clerk session is active — App.jsx useEffect will detect isSignedIn=true
        await setActive({ session: result.createdSessionId });
      } else if (result.status === 'needs_first_factor') {
        // User has an unverified factor (e.g. email verification code required)
        const emailFactor = result.supportedFirstFactors?.find(f => f.strategy === 'email_code');
        if (emailFactor) {
          await signIn.prepareFirstFactor({
            strategy: 'email_code',
            emailAddressId: emailFactor.emailAddressId
          });
          setVerificationStep(true);
        } else {
          setError(`Login incomplete (Status: ${result.status}). Verification required but no email option found.`);
        }
      } else {
        setError(`Login incomplete (Status: ${result.status}). Please check your details.`);
      }
    } catch (err) {
      const msg = err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || '';
      if (msg.includes('No account') || msg.includes('not found') || msg.includes('identifier')) {
        setError("No account found. Please sign up first before signing in.");
      } else if (msg.includes('password') || msg.includes('incorrect')) {
        setError('Incorrect password. Please try again.');
      } else {
        setError(msg || 'Sign in failed. Please check your details and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;
    setError('');
    setLoading(true);

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'email_code',
        code: verificationCode,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
      } else {
        setError('Verification incomplete. Please try again.');
      }
    } catch (err) {
      const msg = err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || '';
      setError(msg || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Verification Screen Render ──────────────────────────────────────────
  if (verificationStep) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full h-full min-h-screen bg-[#1944F1] flex flex-col justify-between overflow-hidden select-none font-sans relative"
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
              Enter the 6-digit verification code sent to your email to complete your sign in.
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
              disabled={loading || verificationCode.length < 6}
              className="w-full py-4 px-6 rounded-2xl bg-[#0F0F0F] hover:bg-black text-white font-semibold text-base shadow-md transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Verifying...' : 'Verify & Sign In'}
            </button>
          </form>
        </div>
      </motion.div>
    );
  }

  // ─── Standard Login Screen Render ─────────────────────────────────────────
  return (
    <motion.div
      key="login-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="w-full h-full min-h-screen bg-[#1944F1] flex flex-col justify-between overflow-hidden select-none font-sans relative"
    >
      {/* Top Header Section */}
      <div className="pt-14 px-6 pb-6 flex flex-col justify-between shrink-0">
        <div className="flex items-center justify-between">
          <button
            onClick={() => onNavigate('welcome')}
            className="text-white p-1 hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>

          <button
            onClick={() => onNavigate('signup')}
            className="text-white font-medium text-sm hover:opacity-90 transition-opacity"
          >
            Sign Up
          </button>
        </div>

        <div className="mt-6 space-y-1.5">
          <h1 className="text-3xl font-bold tracking-tight text-white font-sans">
            Welcome Back
          </h1>
          <p className="text-xs text-blue-100/90 leading-relaxed font-normal">
            Sign in to continue trading with verified students on your campus.
          </p>
        </div>
      </div>

      {/* Bottom Sheet Card */}
      <div className="bg-white text-slate-900 rounded-t-[36px] px-7 pt-7 pb-10 flex-1 flex flex-col justify-start shadow-2xl relative z-10 overflow-y-auto space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 text-xs sm:text-sm font-normal leading-relaxed">
              {error}
              {error.includes('sign up') && (
                <button
                  type="button"
                  onClick={() => onNavigate('signup')}
                  className="block mt-1.5 text-[#1944F1] font-semibold underline underline-offset-2"
                >
                  Create an account →
                </button>
              )}
            </div>
          )}

          <div className="relative">
            <input
              type="email"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="College Email"
              autoComplete="email"
              className="w-full px-5 py-4 bg-[#F3F4F6] text-slate-900 placeholder-slate-400 rounded-2xl text-base font-normal focus:outline-none focus:ring-2 focus:ring-[#1944F1] transition-all"
            />
          </div>

          <div className="relative">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete="current-password"
              className="w-full px-5 py-4 bg-[#F3F4F6] text-slate-900 placeholder-slate-400 rounded-2xl text-base font-normal focus:outline-none focus:ring-2 focus:ring-[#1944F1] transition-all"
            />
          </div>

          <div className="flex justify-end pt-0.5">
            <button
              type="button"
              className="text-xs font-semibold text-[#1944F1] hover:underline"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading || !isLoaded}
            className="w-full py-4 px-6 rounded-2xl bg-[#0F0F0F] hover:bg-black text-white font-semibold text-base shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            <span>{loading ? 'Signing In...' : 'Sign In'}</span>
            {!loading && <ArrowRight className="w-5 h-5" />}
          </button>
        </form>

        {/* Sign up prompt */}
        <div className="pt-2 text-center">
          <p className="text-sm text-slate-500 font-normal">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => onNavigate('signup')}
              className="text-[#1944F1] font-semibold hover:underline"
            >
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </motion.div>
  );
}
