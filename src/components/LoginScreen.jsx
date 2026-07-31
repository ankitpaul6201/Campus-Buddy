import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { loginUser, saveAuthSession } from '../lib/api';

export default function LoginScreen({ onNavigate, onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Please enter your username or college email.');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const res = await loginUser({ username, password });
      setLoading(false);
      if (res && res.user) {
        if (onLoginSuccess) {
          onLoginSuccess(res.user);
        }
      } else {
        setError('Account not found. Please sign up first before signing in.');
      }
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Account not found. Please sign up first before signing in.');
    }
  };

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
              {(error.includes('sign up') || error.includes('Sign up')) && (
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
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username or College Email"
              className="w-full px-5 py-4 bg-[#F3F4F6] text-slate-900 placeholder-slate-400 rounded-2xl text-base font-normal focus:outline-none focus:ring-2 focus:ring-[#1944F1] transition-all"
            />
          </div>

          <div className="relative">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
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
