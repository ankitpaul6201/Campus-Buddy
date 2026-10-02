import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, GraduationCap, CheckCircle2, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [college, setCollege] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2200);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 relative border border-brand-border"
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-brand-dark transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {submitted ? (
            <div className="py-8 text-center flex flex-col items-center">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-3">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-brand-dark">
                {mode === 'login' ? 'Welcome Back!' : 'Verification Link Sent!'}
              </h3>
              <p className="text-xs text-brand-secondary mt-1 max-w-xs">
                {mode === 'login'
                  ? 'Redirecting to your campus dashboard...'
                  : `We sent a magic confirmation code to ${email}. Check your inbox!`}
              </p>
            </div>
          ) : (
            <div>
              {/* Header */}
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-blue-50 text-brand-blue rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-brand-dark">
                  {mode === 'login' ? 'Sign in to Campus Buddy' : 'Join Campus Buddy'}
                </h3>
                <p className="text-xs text-brand-secondary mt-1">
                  {mode === 'login'
                    ? 'Enter your student credentials to continue'
                    : 'Exclusive access for verified college students'}
                </p>
              </div>

              {/* Mode Switcher Tabs */}
              <div className="flex bg-gray-100 p-1 rounded-full mb-5 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className={`flex-1 py-1.5 rounded-full transition-all ${
                    mode === 'login' ? 'bg-white text-brand-dark shadow-xs' : 'text-gray-500'
                  }`}
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className={`flex-1 py-1.5 rounded-full transition-all ${
                    mode === 'register' ? 'bg-white text-brand-dark shadow-xs' : 'text-gray-500'
                  }`}
                >
                  Register
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                    College / University Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@dtu.ac.in or .edu"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-brand-border focus:border-brand-blue focus:ring-1 focus:ring-brand-blue focus:outline-none"
                  />
                </div>

                {mode === 'register' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                      Campus / Institution Name
                    </label>
                    <input
                      type="text"
                      required
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      placeholder="e.g. DTU, IIT Delhi, BITS Pilani"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-brand-border focus:border-brand-blue focus:ring-1 focus:ring-brand-blue focus:outline-none"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-brand-border focus:border-brand-blue focus:ring-1 focus:ring-brand-blue focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-3 bg-brand-btnDark hover:bg-black text-white text-xs font-semibold rounded-full flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
                >
                  <span>{mode === 'login' ? 'Log In' : 'Create Student Account'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>

              <div className="mt-4 text-center">
                <span className="text-[11px] text-gray-400">
                  By continuing, you agree to Campus Buddy's{' '}
                  <span className="text-brand-blue underline cursor-pointer">Student Safety Code</span>.
                </span>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
