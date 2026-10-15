import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Eye, EyeOff, Mail, KeyRound, Lock } from 'lucide-react';
import { apiLogin, apiForgotPassword, apiVerifyResetCode, apiResetPassword, getStoredUser } from '../lib/api';

export default function LoginScreen({ onNavigate, onLoginSuccess }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Support email verification on login if user is unverified / 2FA
  const [verificationStep, setVerificationStep] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  // Forgot password flow states
  // 'none' | 'email' | 'otp' | 'new_password'
  const [forgotStep, setForgotStep] = useState('none');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [isOtpResent, setIsOtpResent] = useState(false);
  const [infoMsg, setInfoMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      const result = await apiLogin({
        email: identifier.trim(),
        password,
      });

      const is2FAEnabled = (() => {
        const saved = localStorage.getItem('user_2fa_enabled');
        return saved !== null ? JSON.parse(saved) : false;
      })();

      if (is2FAEnabled) {
        setVerificationStep(true);
      } else {
        if (onLoginSuccess) {
          onLoginSuccess(result.user);
        } else {
          onNavigate('main');
        }
      }
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('No account') || msg.includes('not found')) {
        setError("No account found. Please sign up first before signing in.");
      } else if (msg.includes('password') || msg.includes('incorrect') || msg.includes('Incorrect')) {
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
    setError('');
    if (verificationCode.length < 4) {
      setError('Please enter the verification code.');
      return;
    }
    setLoading(true);
    try {
      const user = getStoredUser();
      if (onLoginSuccess) {
        onLoginSuccess(user);
      } else {
        onNavigate('main');
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Forgot Password: Step 1 - Send OTP to email ──────────────────────
  const handleForgotSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMsg('');

    const trimmedEmail = forgotEmail.trim().toLowerCase();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setError('Please enter your valid email address.');
      return;
    }

    setIsOtpResent(false);
    setLoading(true);
    try {
      const res = await apiForgotPassword({ email: trimmedEmail });
      if (res?.devCode) {
        setForgotOtp(res.devCode);
        setInfoMsg(res.message || `Dev Mode: Your OTP is ${res.devCode} (No email service configured)`);
      } else {
        setForgotOtp('');
        setInfoMsg('');
      }
      setForgotStep('otp');
    } catch (err) {
      setError(err.message || 'No account found with this email. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Forgot Password: Step 2 - Verify OTP ────────────────────────────
  const handleForgotVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedCode = forgotOtp.trim();
    if (trimmedCode.length < 6) {
      setError('Please enter the 6-digit verification code sent to your email.');
      return;
    }

    setLoading(true);
    try {
      await apiVerifyResetCode({
        email: forgotEmail.trim().toLowerCase(),
        code: trimmedCode,
      });
      setError('');
      setInfoMsg('');
      setForgotStep('new_password');
    } catch (err) {
      setError(err.message || 'Invalid or expired verification code. Please check your email and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsOtpResent(false);
    setError('');
    setInfoMsg('');
    setLoading(true);
    try {
      const res = await apiForgotPassword({ email: forgotEmail.trim().toLowerCase() });
      if (res?.devCode) {
        setForgotOtp(res.devCode);
      } else {
        setForgotOtp('');
      }
      setIsOtpResent(true);
    } catch (err) {
      setError(err.message || 'Failed to resend code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Forgot Password: Step 3 - Set new password ───────────────────────
  const handleForgotSetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    try {
      const res = await apiResetPassword({
        email: forgotEmail.trim().toLowerCase(),
        code: forgotOtp.trim(),
        newPassword,
      });

      setForgotSuccess(true);
      setTimeout(() => {
        if (res.user && onLoginSuccess) {
          onLoginSuccess(res.user);
        } else if (onLoginSuccess) {
          onLoginSuccess(getStoredUser());
        } else {
          onNavigate('main');
        }
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForgotFlow = () => {
    setForgotStep('none');
    setForgotEmail('');
    setForgotOtp('');
    setNewPassword('');
    setInfoMsg('');
    setError('');
    setForgotSuccess(false);
    setIsOtpResent(false);
  };

  // ─── Forgot Password Screens ──────────────────────────────────────────
  if (forgotStep !== 'none') {
    const stepConfig = {
      email: {
        title: 'Reset Password',
        subtitle: 'Enter the email associated with your account. We\'ll send you a 6-digit verification code.',
        icon: Mail,
      },
      otp: {
        title: 'Enter Verification Code',
        subtitle: isOtpResent
          ? `A new 6-digit verification code has been sent to ${forgotEmail}. Please check your inbox and spam folder.`
          : `We've sent a 6-digit code to ${forgotEmail}. Enter it below to verify your identity.`,
        icon: KeyRound,
      },
      new_password: {
        title: 'Create New Password',
        subtitle: 'Choose a strong new password for your account. Must be at least 8 characters.',
        icon: Lock,
      },
    };

    const current = stepConfig[forgotStep];
    const StepIcon = current.icon;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full h-full min-h-screen bg-[#1944F1] flex flex-col justify-between overflow-hidden select-none font-sans relative"
      >
        <div className="pt-14 px-6 pb-6 shrink-0">
          <button
            onClick={() => {
              if (forgotStep === 'otp') setForgotStep('email');
              else if (forgotStep === 'new_password') setForgotStep('otp');
              else resetForgotFlow();
            }}
            className="text-white p-1 hover:opacity-90 transition-all duration-200 hover:-translate-x-1 active:-translate-x-1.5 active:scale-95 group"
            title="Go back"
          >
            <ArrowLeft className="w-6 h-6 transition-transform duration-200 group-hover:-translate-x-0.5 group-active:-translate-x-1" />
          </button>
          <div className="mt-6 space-y-1.5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
                <StepIcon className="w-5 h-5 text-white" />
              </div>
              {/* Step indicators */}
              <div className="flex items-center gap-1.5 ml-auto">
                {['email', 'otp', 'new_password'].map((step, i) => (
                  <div
                    key={step}
                    className={`h-1.5 rounded-full transition-all ${
                      step === forgotStep ? 'w-6 bg-white' : 
                      ['email', 'otp', 'new_password'].indexOf(forgotStep) > i ? 'w-3 bg-white/60' : 'w-3 bg-white/25'
                    }`}
                  />
                ))}
              </div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white font-sans">
              {current.title}
            </h1>
            <p className="text-xs text-blue-100/90 leading-relaxed font-normal">
              {current.subtitle}
            </p>
          </div>
        </div>

        <div className="bg-white text-slate-900 rounded-t-[36px] px-7 pt-7 pb-10 flex-1 flex flex-col justify-start shadow-2xl space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 text-xs font-normal">
              {error}
            </div>
          )}

          {forgotSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 text-xs font-semibold">
              Password reset successfully! Signing you in...
            </div>
          )}

          {/* Step 1: Enter email */}
          {forgotStep === 'email' && (
            <form onSubmit={handleForgotSendOtp} className="space-y-4">
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="Your email"
                autoFocus
                autoComplete="email"
                className="w-full px-5 py-4 bg-white text-slate-900 placeholder-slate-400 rounded-2xl text-base font-normal border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1944F1] focus:border-transparent transition-all"
              />
              <button
                type="submit"
                disabled={loading || !forgotEmail.trim()}
                className="w-full py-4 px-6 rounded-2xl bg-[#0F0F0F] hover:bg-black text-white font-semibold text-base shadow-md transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'Sending Code...' : 'Send Verification Code'}
              </button>
            </form>
          )}

          {/* Step 2: Enter OTP */}
          {forgotStep === 'otp' && (
            <form onSubmit={handleForgotVerifyOtp} className="space-y-4">
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={forgotOtp}
                onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 6-digit code"
                autoFocus
                className="w-full px-5 py-4 bg-[#F3F4F6] text-slate-900 placeholder-slate-400 rounded-2xl text-xl font-bold tracking-[0.3em] text-center focus:outline-none focus:ring-2 focus:ring-[#1944F1] transition-all"
              />
              <button
                type="submit"
                disabled={loading || forgotOtp.length < 6}
                className="w-full py-4 px-6 rounded-2xl bg-[#0F0F0F] hover:bg-black text-white font-semibold text-base shadow-md transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={loading}
                className="w-full text-center text-xs font-semibold text-[#1944F1] hover:underline disabled:opacity-50"
              >
                {loading ? 'Sending code...' : "Didn't receive the code? Resend"}
              </button>
            </form>
          )}

          {/* Step 3: Set new password */}
          {forgotStep === 'new_password' && (
            <form onSubmit={handleForgotSetPassword} className="space-y-4">
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  autoFocus
                  autoComplete="new-password"
                  className="w-full pl-5 pr-12 py-4 bg-white text-slate-900 placeholder-slate-400 rounded-2xl text-base font-normal border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1944F1] focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                >
                  {showNewPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
              </div>

              {newPassword.length > 0 && (
                <div className="flex items-center gap-2 px-1">
                  <div className={`h-1.5 flex-1 rounded-full transition-all ${
                    newPassword.length >= 8 ? 'bg-emerald-400' : 'bg-slate-200'
                  }`} />
                  <div className={`h-1.5 flex-1 rounded-full transition-all ${
                    newPassword.length >= 10 && /[0-9]/.test(newPassword) ? 'bg-emerald-400' : 'bg-slate-200'
                  }`} />
                  <div className={`h-1.5 flex-1 rounded-full transition-all ${
                    newPassword.length >= 12 && /[!@#$%^&*]/.test(newPassword) ? 'bg-emerald-400' : 'bg-slate-200'
                  }`} />
                  <span className="text-[10px] font-medium text-slate-400 ml-1">
                    {newPassword.length < 8 ? 'Too short' : newPassword.length < 10 ? 'Good' : 'Strong'}
                  </span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || newPassword.length < 8}
                className="w-full py-4 px-6 rounded-2xl bg-[#0F0F0F] hover:bg-black text-white font-semibold text-base shadow-md transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}

          {/* Back to sign in */}
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={resetForgotFlow}
              className="text-sm text-slate-500 font-normal hover:text-[#1944F1] transition-colors"
            >
              ← Back to Sign In
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

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
            className="text-white p-1 hover:opacity-90 transition-all duration-200 hover:-translate-x-1 active:-translate-x-1.5 active:scale-95 group"
            title="Go back"
          >
            <ArrowLeft className="w-6 h-6 transition-transform duration-200 group-hover:-translate-x-0.5 group-active:-translate-x-1" />
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
            className="text-white p-1 hover:opacity-90 transition-all duration-200 hover:-translate-x-1 active:-translate-x-1.5 active:scale-95 group"
            title="Go back"
          >
            <ArrowLeft className="w-6 h-6 transition-transform duration-200 group-hover:-translate-x-0.5 group-active:-translate-x-1" />
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
              className="w-full px-5 py-4 bg-white text-slate-900 placeholder-slate-400 rounded-2xl text-base font-normal border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1944F1] focus:border-transparent transition-all"
            />
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete="current-password"
              className="w-full pl-5 pr-12 py-4 bg-white text-slate-900 placeholder-slate-400 rounded-2xl text-base font-normal border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1944F1] focus:border-transparent transition-all"
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

          <div className="flex justify-end pt-0.5">
            <button
              type="button"
              onClick={() => {
                setError('');
                setForgotEmail(identifier);
                setForgotStep('email');
              }}
              className="text-xs font-semibold text-[#1944F1] hover:underline"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
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
