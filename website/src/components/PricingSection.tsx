import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';

interface PricingSectionProps {
  onSelectPlan?: (planName: string) => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ onSelectPlan }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');

  const plans = [
    {
      name: 'Free',
      isPro: false,
      isNonSubscription: true,
      monthlyPrice: 'Free',
      annualPrice: 'Free',
      period: '₹0/month',
      buttonText: 'Get Started Free',
      features: [
        '1 ad per month',
        'Ads expire after 1 month',
        'Regular feed placement',
        'Limited visibility and reach',
        'Standard student-to-student in-app chat',
        'Student campus verification badge'
      ]
    },
    {
      name: 'Premium',
      isPro: true,
      isNonSubscription: false,
      monthlyPrice: '₹49',
      annualPrice: '₹39',
      period: '/month',
      buttonText: 'Upgrade to Premium',
      features: [
        '10 ads per month',
        'Ads stay live until subscription ends',
        'Highlighted listing badge in campus feed',
        'Bump listing to top of campus feed every 48 hrs',
        'Auto-relist expired items in 1 tap',
        'Best value plan'
      ]
    },
    {
      name: 'Pro',
      isPro: false,
      isNonSubscription: false,
      monthlyPrice: '₹149',
      annualPrice: '₹119',
      period: '/month',
      buttonText: 'Upgrade to PRO',
      features: [
        'Unlimited ads per month',
        'Premium featured placement at top of home page',
        'Priority visibility in search results',
        'Verified PRO seller badge on profile',
        'Multi-category listing: gear, notes & tutoring',
        'Semester clearance hostel-wide broadcast'
      ]
    }
  ];

  const handlePlanClick = (planName: string) => {
    if (onSelectPlan) {
      onSelectPlan(planName);
    }
  };

  return (
    <section id="pricing" className="py-14 sm:py-24 bg-[#FFFFFF] relative overflow-hidden max-w-full">
      {/* Background Soft Aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[900px] h-[320px] sm:h-[500px] bg-gradient-to-tr from-blue-100/30 via-indigo-50/20 to-sky-100/30 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-4 sm:px-8 relative z-10">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-[28px] sm:text-[44px] font-extrabold text-brand-dark tracking-tight leading-[1.15]"
          >
            Pricing that scales with you
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-3.5 text-brand-secondary text-[14px] sm:text-[15px] leading-relaxed max-w-2xl mx-auto"
          >
            Whether you're buying a single semester textbook or running a bustling student venture,
            Campus Buddy offers flexible plans designed for Indian college budgets. Choose a plan that fits where you are now, and upgrade anytime as you grow.
          </motion.p>

          {/* Smooth Bouncy Glassmorphic Monthly / Annually Pill Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-7 inline-flex items-center p-1.5 rounded-full bg-white/80 backdrop-blur-2xl border border-slate-200/90 shadow-[0_8px_30px_rgba(8,96,232,0.06),0_2px_8px_rgba(0,0,0,0.04),inset_0_1px_2px_rgba(255,255,255,0.9)] relative"
          >
            {/* Monthly Button */}
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className="relative px-6 py-2 rounded-full text-[13px] font-bold cursor-pointer transition-colors duration-200 select-none z-10"
            >
              {billingCycle === 'monthly' && (
                <motion.div
                  layoutId="billingCyclePill"
                  transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                  className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-[0_4px_16px_rgba(37,99,235,0.38)] -z-10"
                />
              )}
              <span className={billingCycle === 'monthly' ? 'text-white' : 'text-slate-600 hover:text-slate-900'}>
                Monthly
              </span>
            </button>

            {/* Annually Button */}
            <button
              type="button"
              onClick={() => setBillingCycle('annually')}
              className="relative px-6 py-2 rounded-full text-[13px] font-bold cursor-pointer transition-colors duration-200 flex items-center gap-1.5 select-none z-10"
            >
              {billingCycle === 'annually' && (
                <motion.div
                  layoutId="billingCyclePill"
                  transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                  className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-[0_4px_16px_rgba(37,99,235,0.38)] -z-10"
                />
              )}
              <span className={billingCycle === 'annually' ? 'text-white' : 'text-slate-600 hover:text-slate-900'}>
                Annually
              </span>
              <span
                className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full transition-colors ${billingCycle === 'annually' ? 'bg-white/25 text-white' : 'bg-emerald-100 text-emerald-700'
                  }`}
              >
                -20%
              </span>
            </button>
          </motion.div>
        </div>

        {/* 3 Pricing Cards Grid: Aligned Perfectly at the Bottom (items-end) */}
        <div className="mt-10 sm:mt-20 grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 lg:gap-7 items-end">
          {plans.map((plan, idx) => {
            const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice;

            if (plan.isPro) {
              /* ========================================================
                 CENTER PRO CARD:
                 - Extends upward for superior prominence
                 - Flushed equally at the bottom with left and right cards
                 - Flip-up animated button
                 - Smooth bouncy price transitions
                 - Purple-Blue gradient on top, white frosted glass body
                 ======================================================== */
              return (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.15 }}
                  whileHover={{ y: -8, transition: { type: 'spring', stiffness: 350, damping: 25 } }}
                  className="relative rounded-[28px] sm:rounded-[36px] p-6 sm:p-9 flex flex-col justify-between transition-all duration-300 bg-white/95 backdrop-blur-3xl border-2 border-indigo-500/90 shadow-[0_35px_90px_-15px_rgba(99,102,241,0.45),0_0_0_1px_rgba(255,255,255,0.9)_inset] overflow-hidden z-20 md:mb-0 min-h-[520px] sm:min-h-[580px]"
                >
                  {/* Top Rich Purple-Blue Radiant Glow Gradient */}
                  <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-[#6366F1] via-[#4F46E5] to-transparent pointer-events-none rounded-t-[36px]" />

                  {/* Ambient Light Diffusion in Glass */}
                  <div className="absolute -top-16 -right-16 w-52 h-52 bg-indigo-400/40 rounded-full blur-3xl pointer-events-none -z-10" />
                  <div className="absolute bottom-0 inset-x-0 h-36 bg-gradient-to-t from-white/95 to-transparent pointer-events-none" />

                  {/* Header Content */}
                  <div className="relative z-10">
                    {/* Plan Name */}
                    <div className="mb-2">
                      <h3 className="text-[20px] sm:text-[22px] font-black tracking-wide text-white">
                        {plan.name}
                      </h3>
                    </div>

                    {/* Price with Smooth Bouncy Transition */}
                    <div className="mt-4 flex items-baseline gap-1.5 overflow-hidden h-[54px]">
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={price}
                          initial={{ opacity: 0, y: 14, scale: 0.94 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -14, scale: 0.94 }}
                          transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                          className="text-[44px] sm:text-[50px] font-black text-white tracking-tight leading-none drop-shadow-xs inline-block"
                        >
                          {price}
                        </motion.span>
                      </AnimatePresence>
                      <span className="text-[14px] text-indigo-100 font-medium">
                        {plan.period}
                      </span>
                    </div>

                    {/* Flip-Up Animated White Pill Button */}
                    <button
                      type="button"
                      onClick={() => handlePlanClick(plan.name)}
                      className="group relative w-full mt-6 py-3.5 rounded-full bg-white hover:bg-slate-50 text-slate-900 font-extrabold text-[14px] transition-all duration-300 active:scale-97 shadow-[0_10px_25px_rgba(0,0,0,0.15)] hover:shadow-[0_14px_30px_rgba(0,0,0,0.2)] cursor-pointer text-center block overflow-hidden"
                    >
                      <span className="relative inline-flex flex-col h-[1.35em] overflow-hidden pointer-events-none">
                        <span className="inline-block transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-full group-active:-translate-y-full">
                          {plan.buttonText}
                        </span>
                        <span
                          className="absolute top-full left-0 inline-block transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-full group-active:-translate-y-full"
                          aria-hidden="true"
                        >
                          {plan.buttonText}
                        </span>
                      </span>
                    </button>
                  </div>

                  {/* Features Checklist */}
                  <ul className="relative z-10 mt-6 space-y-3 pt-5 border-t border-slate-200/80">
                    {plan.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-3 text-[13px] text-slate-800 font-medium">
                        <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 shadow-xs">
                          <Check className="w-3 h-3 text-white stroke-[3]" />
                        </div>
                        <span className="leading-snug">{feature}</span>
                      </li>
                    ))}
                  </ul>

                </motion.div>
              );
            }

            /* ========================================================
               LEFT (Free Tier) & RIGHT (Pro Subscription) CARDS:
               - Glassmorphism with white inside background
               - Aligned equally at the bottom
               - Flip-up animated button
               - Smooth bouncy price transitions
               ======================================================== */
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.15 * idx }}
                whileHover={{ y: -6, transition: { type: 'spring', stiffness: 350, damping: 25 } }}
                className="relative rounded-[28px] sm:rounded-[32px] p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 bg-white/80 backdrop-blur-2xl border border-slate-200/80 shadow-[0_20px_50px_rgba(8,96,232,0.06),0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-2xl hover:border-slate-300 min-h-[460px] sm:min-h-[510px]"
              >
                <div>
                  {/* Plan Name */}
                  <h3 className="text-[18px] sm:text-[20px] font-extrabold tracking-wide text-slate-900">
                    {plan.name}
                  </h3>

                  {/* Price with Smooth Bouncy Transition */}
                  <div className="mt-4 flex items-baseline gap-1.5 overflow-hidden h-[48px]">
                    {plan.period === 'Non-subscription' ? (
                      <span className="text-[26px] sm:text-[30px] font-black text-slate-900 tracking-tight leading-none inline-block">
                        Non-subscription
                      </span>
                    ) : plan.monthlyPrice === 'Free' ? (
                      <div className="flex items-baseline gap-1">
                        <span className="text-[38px] sm:text-[44px] font-black text-slate-900 tracking-tight leading-none inline-block">
                          ₹0
                        </span>
                        <span className="text-[13px] text-slate-500 font-semibold">
                          /month
                        </span>
                      </div>
                    ) : (
                      <>
                        <AnimatePresence mode="wait">
                          <motion.span
                            key={price}
                            initial={{ opacity: 0, y: 12, scale: 0.94 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -12, scale: 0.94 }}
                            transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                            className="text-[38px] sm:text-[44px] font-black text-slate-900 tracking-tight leading-none inline-block"
                          >
                            {price}
                          </motion.span>
                        </AnimatePresence>
                        <span className="text-[13px] text-slate-500 font-semibold">
                          {plan.period}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Flip-Up Animated Dark Pill Button */}
                  <button
                    type="button"
                    onClick={() => handlePlanClick(plan.name)}
                    className="group relative w-full mt-6 py-3 rounded-full bg-[#0F172A] hover:bg-black text-white font-bold text-[13.5px] transition-all duration-300 active:scale-97 shadow-md hover:shadow-lg cursor-pointer text-center block overflow-hidden"
                  >
                    <span className="relative inline-flex flex-col h-[1.35em] overflow-hidden pointer-events-none">
                      <span className="inline-block transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-full group-active:-translate-y-full">
                        {plan.buttonText}
                      </span>
                      <span
                        className="absolute top-full left-0 inline-block transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-full group-active:-translate-y-full"
                        aria-hidden="true"
                      >
                        {plan.buttonText}
                      </span>
                    </span>
                  </button>
                </div>

                {/* Features Checklist */}
                <ul className="mt-6 space-y-3 pt-4 border-t border-slate-100">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-3 text-[13px] text-slate-700">
                      <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center shrink-0 shadow-xs">
                        <Check className="w-3 h-3 text-white stroke-[3]" />
                      </div>
                      <span className="leading-snug">{feature}</span>
                    </li>
                  ))}
                </ul>

              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
