import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { FAQS } from '../data/mockData';

export const FAQSection: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>('faq1');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMsg, setStatusMsg] = useState('');

  const toggleFAQ = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setStatus('error');
      setStatusMsg('Please enter a valid student email address.');
      return;
    }

    setStatus('success');
    setStatusMsg('Thanks for subscribing! Campus updates are on the way.');
    setEmail('');
    setTimeout(() => setStatus('idle'), 4000);
  };

  return (
    <section id="faqs" className="py-20 sm:py-28 bg-[#FFFFFF] relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-10 items-start">
          
          {/* Left Column: Heading, description, and Email Subscribe Pill */}
          <div className="lg:col-span-5 flex flex-col items-start">
            <div className="relative mb-3">
              <h2 className="text-[26px] sm:text-[38px] font-extrabold text-brand-dark leading-[1.18] tracking-tight">
                Got A Question<br />
                About Campus Buddy?
              </h2>
            </div>

            <p className="mt-2 text-brand-secondary text-[13px] sm:text-[14px] leading-relaxed max-w-sm">
              If you need help getting started, understanding a listing or connecting with
              the community, we’re here to help.
            </p>

            {/* Email Subscription Pill Form matching reference */}
            <form onSubmit={handleSubscribe} className="mt-8 w-full max-w-sm">
              <div className="relative flex items-center bg-white border border-[#E8EBF0] rounded-full p-1.5 shadow-[0_4px_16px_rgba(25,29,37,0.06)] focus-within:border-brand-blue transition-colors">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status !== 'idle') setStatus('idle');
                  }}
                  placeholder="Enter Your Email"
                  className="flex-1 bg-transparent px-4 py-2 text-[13px] text-brand-dark placeholder-gray-400 focus:outline-none"
                  aria-label="Email address for updates"
                />
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-brand-btnDark hover:bg-black text-white text-[12.5px] font-semibold rounded-full shrink-0 transition-colors shadow-xs cursor-pointer"
                >
                  Subscribe
                </button>
              </div>

              {/* Status messages */}
              {status === 'success' && (
                <div className="mt-2.5 flex items-center gap-1.5 text-emerald-600 text-[11px] font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{statusMsg}</span>
                </div>
              )}
              {status === 'error' && (
                <div className="mt-2.5 flex items-center gap-1.5 text-rose-500 text-[11px] font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{statusMsg}</span>
                </div>
              )}
            </form>
          </div>

          {/* Right Column: FAQ Accordion items with animated arrows */}
          <div className="lg:col-span-7 flex flex-col">
            <p className="text-[13px] text-brand-secondary mb-6 font-medium">
              Maybe your question has already been answered. Check out these common questions:
            </p>

            <div className="space-y-3">
              {FAQS.map((faq, index) => {
                const isOpen = openId === faq.id;
                return (
                  <motion.div
                    key={faq.id}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.08, duration: 0.5 }}
                    className="border-b border-[#E8EBF0] pb-3"
                  >
                    <button
                      onClick={() => toggleFAQ(faq.id)}
                      className="w-full py-2 flex items-center justify-between text-left group cursor-pointer"
                      aria-expanded={isOpen}
                    >
                      <span className="text-[14px] sm:text-[15px] font-bold text-brand-dark group-hover:text-brand-blue transition-colors">
                        {faq.question}
                      </span>

                      {/* Right pointing arrow matching reference screenshot */}
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 text-brand-blue group-hover:translate-x-1 ${
                          isOpen ? 'rotate-90 text-brand-orange' : ''
                        }`}
                      >
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <p className="text-[13px] text-brand-secondary leading-relaxed pt-1 pb-3 pr-8">
                            {faq.answer}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
