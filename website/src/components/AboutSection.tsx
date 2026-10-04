import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Coins,
  GraduationCap,
  Camera,
  ArrowLeftRight,
  Code2,
  Layers,
  MessageSquareX,
  Users,
  BadgeDollarSign,
  LayoutGrid,
  Leaf,
  Lock,
  ShieldAlert,
  Shield
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface AboutSectionProps {
  onDownloadClick: () => void;
  onExploreMarketplace?: () => void;
}

interface GlassCardProps {
  index: number;
  totalCards: number;
  children: React.ReactNode;
}

const GlassCard: React.FC<GlassCardProps> = ({ index, totalCards, children }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = React.useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 639px)');
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    setIsMobile(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    const card = cardRef.current;
    const container = containerRef.current;
    if (!card || !container) return;

    const targetScale = 1 - (totalCards - index) * 0.038;

    // Set initial state with hardware compositing
    gsap.set(card, {
      scale: 1,
      transformOrigin: 'center top',
      force3D: true
    });

    // Create scroll trigger for stacking effect synchronized with Lenis
    const trigger = ScrollTrigger.create({
      trigger: container,
      start: 'top 32%',
      end: 'bottom center',
      scrub: true,
      onUpdate: (self) => {
        const rawScale = gsap.utils.interpolate(1, targetScale, self.progress);
        const clampedScale = gsap.utils.clamp(targetScale, 1, rawScale);

        gsap.set(card, {
          scale: clampedScale,
          transformOrigin: 'center top',
          force3D: true
        });
      }
    });

    return () => {
      trigger.kill();
    };
  }, [index, totalCards]);

  return (
    <div
      ref={containerRef}
      className="sticky flex items-center justify-center pointer-events-none h-[68vh] sm:h-[82vh] top-[64px] sm:top-[76px]"
      style={{
        zIndex: (index + 1) * 10
      }}
    >
      <div
        ref={cardRef}
        className="card-content pointer-events-auto w-full max-w-[840px] mx-auto px-3 sm:px-0 h-[400px] sm:h-[515px] min-h-[400px] sm:min-h-[515px] max-h-[400px] sm:max-h-[515px]"
        style={{
          position: 'relative',
          borderRadius: '32px',
          top: isMobile ? '0px' : `calc(-1.5vh + ${index * 18}px)`,
          transformOrigin: 'center top',
          willChange: 'transform',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          isolation: 'isolate'
        }}
      >
        {/* --- MAIN FROSTED GLASS CONTAINER --- */}
        <div
          className="relative w-full h-full min-h-full max-h-full rounded-[24px] sm:rounded-[36px] overflow-hidden flex flex-col justify-between"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.72) 0%, rgba(240, 249, 255, 0.58) 50%, rgba(224, 242, 254, 0.45) 100%)',
            backdropFilter: 'blur(30px) saturate(180%)',
            WebkitBackdropFilter: 'blur(30px) saturate(180%)',
            border: '1.5px solid rgba(255, 255, 255, 0.85)',
            willChange: 'transform',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            boxShadow: `
              0 25px 60px -12px rgba(8, 96, 232, 0.16),
              0 8px 24px -4px rgba(2, 132, 199, 0.1),
              inset 0 1.5px 2px rgba(255, 255, 255, 0.95),
              inset 0 -1px 2px rgba(8, 96, 232, 0.1)
            `
          }}
        >
          {/* Top Edge Specular Reflection */}
          <div className="absolute top-0 inset-x-6 sm:inset-x-8 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent opacity-90 pointer-events-none" />

          {/* Actual Card Content */}
          <div className="relative z-10 p-3 sm:p-8 flex-1 flex flex-col justify-between overflow-hidden">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export const AboutSection: React.FC<AboutSectionProps> = () => {
  const sectionRef = useRef<HTMLElement>(null);
  return (
    <section
      id="about"
      ref={sectionRef}
      className="pt-16 pb-20 sm:pt-20 sm:pb-28 bg-[#F8FAFC] relative overflow-visible"
    >
      {/* Background ambient decorative light elements */}
      <div className="absolute top-10 left-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-[#0860E8]/10 via-[#60A5FA]/8 to-transparent rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute top-1/2 right-10 w-[500px] h-[500px] bg-gradient-to-bl from-[#0284C7]/8 via-[#0860E8]/6 to-transparent rounded-full blur-[110px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-1/3 w-[550px] h-[550px] bg-gradient-to-tr from-[#0860E8]/8 via-[#93C5FD]/12 to-white rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <h2 className="text-[28px] sm:text-[40px] font-extrabold text-brand-dark leading-[1.15] tracking-tight">
            Built by Students, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0860E8] via-[#0284C7] to-[#2563EB]">For Students</span>
          </h2>

          <p className="mt-2.5 text-brand-secondary text-[13.5px] sm:text-[15px] leading-relaxed">
            The closed-loop peer-to-peer campus ecosystem making university life affordable, connected, and sustainable.
          </p>
        </div>

        {/* GSAP SCROLLTRIGGER STACKED GLASS CARDS */}
        <div className="relative">

          {/* SINGLE STATIC PAIR OF BLURRED COLOR PATCHES UNDERNEATH ALL STACKED SLIDES */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ zIndex: 5 }}
            aria-hidden="true"
          >
            <div
              className="sticky flex items-center justify-center pointer-events-none h-[68vh] sm:h-[82vh] top-[64px] sm:top-[76px]"
            >
              <div
                className="w-full max-w-[840px] mx-auto px-3 sm:px-0 relative pointer-events-none h-[400px] sm:h-[515px]"
                style={{
                  top: '-1vh'
                }}
              >
                {/* 1. Top-Left Blurred Color Patch (Website Brand Blue / Cyan) */}
                <div className="absolute -top-10 -left-10 w-64 h-64 rounded-full bg-gradient-to-br from-[#0860E8] via-[#0284C7] to-transparent blur-[48px] opacity-85" />
                
                {/* 2. Bottom-Right Blurred Color Patch (Ocean / Sky Blue) */}
                <div className="absolute -bottom-10 -right-10 w-72 h-72 rounded-full bg-gradient-to-tl from-[#0284C7] via-[#38BDF8] to-transparent blur-[52px] opacity-80" />
              </div>
            </div>
          </div>

          {/* CARD 1: WHAT IS CAMPUS BUDDY */}
          <GlassCard index={0} totalCards={4}>
            {/* Card Header Row */}
            <div className="flex items-center justify-between pb-2 sm:pb-3 border-b border-slate-200/90">
              <h3 className="text-[19px] sm:text-[25px] font-extrabold text-brand-dark tracking-tight leading-tight">
                What is Campus Buddy?
              </h3>

              {/* Light Grey Slide Number */}
              <span className="text-[26px] sm:text-[34px] font-black text-slate-300 select-none">
                01
              </span>
            </div>

            {/* Middle Body */}
            <div className="py-1.5 sm:py-3">
              <h4 className="text-[14px] sm:text-[17px] font-bold text-brand-dark leading-snug">
                An Exclusive Intra-Campus Marketplace & Utility Network
              </h4>
              <p className="mt-1 text-brand-secondary text-[12px] sm:text-[13.5px] leading-relaxed">
                Campus Buddy is India’s dedicated peer-to-peer student network. Students meet directly on campus to review items firsthand with complete trust, 0% commission, and zero shipping hassles.
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md bg-emerald-50 text-emerald-700 text-[10px] sm:text-[11px] font-bold border border-emerald-100">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  100% Student-Only (College ID)
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md bg-blue-50 text-brand-blue text-[10px] sm:text-[11px] font-bold border border-blue-100">
                  <Coins className="w-3.5 h-3.5 text-brand-blue" />
                  0% Commission & Zero Shipping
                </span>
              </div>
            </div>

            {/* 4 Pillars Bottom Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 pt-1.5 sm:pt-2">
              {[
                {
                  icon: <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-blue shrink-0" />,
                  title: 'Verified Peers',
                  desc: 'College ID verified'
                },
                {
                  icon: <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />,
                  title: 'Zero Commission',
                  desc: 'Direct UPI, 0% fee'
                },
                {
                  icon: <ArrowLeftRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-orange shrink-0" />,
                  title: 'Hand-to-Hand',
                  desc: 'In-person exchange'
                },
                {
                  icon: <Code2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-blue shrink-0" />,
                  title: 'Skill Gigs',
                  desc: 'Coding & design'
                }
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-2 sm:p-2.5 rounded-xl bg-white/80 border border-white/95 shadow-2xs"
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    {item.icon}
                    <span className="text-[11px] sm:text-[12px] font-bold text-brand-dark truncate">{item.title}</span>
                  </div>
                  <p className="text-[9.5px] sm:text-[10.5px] text-brand-secondary truncate">{item.desc}</p>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* CARD 2: WHY CAMPUS BUDDY EXISTS */}
          <GlassCard index={1} totalCards={4}>
            {/* Card Header Row */}
            <div className="flex items-center justify-between pb-2 sm:pb-3 border-b border-slate-200/90">
              <h3 className="text-[19px] sm:text-[25px] font-extrabold text-brand-dark tracking-tight leading-tight">
                Why Campus Buddy Exists
              </h3>

              {/* Light Grey Slide Number */}
              <span className="text-[26px] sm:text-[34px] font-black text-slate-300 select-none">
                02
              </span>
            </div>

            {/* Middle Body */}
            <div className="py-1.5 sm:py-3">
              <h4 className="text-[14px] sm:text-[17px] font-bold text-brand-dark leading-snug">
                College Essentials Shouldn't Cost a Fortune
              </h4>
              <p className="mt-1 text-brand-secondary text-[11.5px] sm:text-[13.5px] leading-relaxed">
                College essentials shouldn't sit unused after one semester. We make buying, selling, and reusing simple and affordable on campus.
              </p>
            </div>

            {/* Two-column: Problems vs Solutions */}
            <div className="grid grid-cols-2 gap-2 sm:gap-4 flex-1 pb-1">
              {/* Problems Column */}
              <div className="flex flex-col h-full">
                <div className="text-[10px] sm:text-[11.5px] font-extrabold uppercase tracking-wider text-red-500 flex items-center gap-1 mb-1 sm:mb-2">
                  <XCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-500 shrink-0" />
                  <span>The Old Way</span>
                </div>
                <div className="flex-1 flex flex-col justify-between gap-1.5 sm:gap-2.5">
                  {[
                    {
                      icon: <MessageSquareX className="w-3 h-3 sm:w-4 sm:h-4 text-red-500 shrink-0" />,
                      title: 'Messy WhatsApp',
                      desc: 'Listings lost in hundreds of unread messages.'
                    },
                    {
                      icon: <Users className="w-3 h-3 sm:w-4 sm:h-4 text-red-500 shrink-0" />,
                      title: 'Privacy Concerns',
                      desc: 'Sharing personal numbers with strangers.'
                    },
                    {
                      icon: <BadgeDollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-red-500 shrink-0" />,
                      title: 'Overpaying',
                      desc: 'Paying retail for short-term essentials.'
                    }
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="p-1.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-red-50/65 border border-red-100/80 shadow-2xs flex flex-col justify-center"
                    >
                      <div className="flex items-center gap-1 sm:gap-2 mb-0.5 sm:mb-1">
                        {item.icon}
                        <span className="text-[10.5px] sm:text-[12.5px] font-bold text-red-900 leading-snug">
                          {item.title}
                        </span>
                      </div>
                      <p className="text-[9px] sm:text-[11.5px] text-red-700/85 leading-tight sm:leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Solutions Column */}
              <div className="flex flex-col h-full">
                <div className="text-[10px] sm:text-[11.5px] font-extrabold uppercase tracking-wider text-emerald-600 flex items-center gap-1 mb-1 sm:mb-2">
                  <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600 shrink-0" />
                  <span>Campus Buddy</span>
                </div>
                <div className="flex-1 flex flex-col justify-between gap-1.5 sm:gap-2.5">
                  {[
                    {
                      icon: <LayoutGrid className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />,
                      title: 'Organized Feed',
                      desc: 'Books, tools & essentials in one feed.'
                    },
                    {
                      icon: <ShieldCheck className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />,
                      title: 'Campus Verified',
                      desc: 'College ID checks & private in-app chats.'
                    },
                    {
                      icon: <Leaf className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />,
                      title: 'Save & Reuse',
                      desc: 'Peer prices with zero platform cuts.'
                    }
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="p-1.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-emerald-50/65 border border-emerald-100/80 shadow-2xs flex flex-col justify-center"
                    >
                      <div className="flex items-center gap-1 sm:gap-2 mb-0.5 sm:mb-1">
                        {item.icon}
                        <span className="text-[10.5px] sm:text-[12.5px] font-bold text-emerald-950 leading-snug">
                          {item.title}
                        </span>
                      </div>
                      <p className="text-[9px] sm:text-[11.5px] text-emerald-800/85 leading-tight sm:leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>

          {/* CARD 3: TRUST & COMMUNITY SAFETY */}
          <GlassCard index={2} totalCards={4}>
            {/* Card Header Row */}
            <div className="flex items-center justify-between pb-2 sm:pb-3 border-b border-slate-200/90">
              <h3 className="text-[19px] sm:text-[25px] font-extrabold text-brand-dark tracking-tight leading-tight">
                Trust & Community Safety
              </h3>

              {/* Light Grey Slide Number */}
              <span className="text-[26px] sm:text-[34px] font-black text-slate-300 select-none">
                03
              </span>
            </div>

            {/* Middle Body */}
            <div className="py-1.5 sm:py-3">
              <h4 className="text-[14px] sm:text-[17px] font-bold text-brand-dark leading-snug">
                A Safer Marketplace Built Specifically for Students
              </h4>
              <p className="mt-1 text-brand-secondary text-[11.5px] sm:text-[13.5px] leading-relaxed">
                We prioritize authentic peer connections with safeguards designed around campus life.
              </p>
            </div>

            {/* 4 Security Pillars: 2x2 Grid */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3.5 my-auto py-2 sm:py-3">
              {[
                {
                  icon: <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-blue shrink-0" />,
                  title: 'Student Community',
                  desc: 'Exchanges restricted to verified college peers.'
                },
                {
                  icon: <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600 shrink-0" />,
                  title: 'Student Verification',
                  desc: 'Gmail and college ID card verified profiles.'
                },
                {
                  icon: <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-600 shrink-0" />,
                  title: 'In-App Messaging',
                  desc: 'Chat & set meeting spots without phone numbers.'
                },
                {
                  icon: <ShieldAlert className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 shrink-0" />,
                  title: 'Safe Handover',
                  desc: 'Daylight public meetups & 1-tap instant reporting.'
                }
              ].map((item, i) => (
                <div
                  key={i}
                  className="p-2 sm:py-3.5 sm:px-4 rounded-xl sm:rounded-2xl bg-white/75 border border-white/95 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-center"
                >
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-1.5">
                    {item.icon}
                    <h5 className="text-[11px] sm:text-[14px] font-bold text-brand-dark leading-tight">
                      {item.title}
                    </h5>
                  </div>
                  <p className="text-[9.5px] sm:text-[12px] text-brand-secondary leading-snug sm:leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Bottom Row: Campus Safety Guidelines & Action */}
            <div className="flex flex-wrap items-center justify-between gap-1 sm:gap-2.5 pt-1.5 sm:pt-3 border-t border-slate-200/90 mt-auto">
              <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 text-[9.5px] sm:text-[11px]">
                <span className="font-bold text-brand-dark mr-0.5 flex items-center gap-1 text-[9.5px] sm:text-[11.5px]">
                  <Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-brand-blue" />
                  Guidelines:
                </span>
                {['Safety Tips', 'Listing Rules', 'Report Issue'].map((tip, idx) => (
                  <span
                    key={idx}
                    className={`px-1.5 sm:px-2.5 py-0.5 rounded-full text-[8.5px] sm:text-[10.5px] font-semibold border transition-all cursor-default ${
                      tip === 'Report Issue'
                        ? 'bg-rose-50 text-rose-700 border-rose-200/80 hover:bg-rose-100/70'
                        : 'bg-white/80 text-brand-secondary border-gray-200/80 hover:border-gray-300'
                    }`}
                  >
                    {tip}
                  </span>
                ))}
              </div>
            </div>
          </GlassCard>

          {/* CARD 4: STUDENT SKILLS & FREELANCE GIGS */}
          <GlassCard index={3} totalCards={4}>
            {/* Card Header Row */}
            <div className="flex items-center justify-between pb-2 sm:pb-3 border-b border-slate-200/90">
              <h3 className="text-[19px] sm:text-[25px] font-extrabold text-brand-dark tracking-tight leading-tight">
                Student Skills & Freelance
              </h3>

              {/* Light Grey Slide Number */}
              <span className="text-[26px] sm:text-[34px] font-black text-slate-300 select-none">
                04
              </span>
            </div>

            {/* Middle Body */}
            <div className="py-1.5 sm:py-3">
              <h4 className="text-[14px] sm:text-[17px] font-bold text-brand-dark leading-snug">
                Earn by Offering Your Talents to Campus Peers
              </h4>
              <p className="mt-1 text-brand-secondary text-[12px] sm:text-[13.5px] leading-relaxed">
                Connect with skilled peers for coding, photography, design, and tutoring. Keep 100% of what you earn with zero platform cuts.
              </p>
            </div>

            {/* 4 Skill Categories Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 pt-1">
              {[
                {
                  icon: <Code2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-blue" />,
                  title: 'Coding & Dev',
                  desc: 'Web, apps & scripts'
                },
                {
                  icon: <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-600" />,
                  title: 'Photography',
                  desc: 'Fests & portraits'
                },
                {
                  icon: <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600" />,
                  title: 'UI & Design',
                  desc: 'Posters & slides'
                },
                {
                  icon: <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />,
                  title: 'Peer Tutoring',
                  desc: 'Exam prep & notes'
                }
              ].map((skill, sIdx) => (
                <div
                  key={sIdx}
                  className="p-2 sm:p-3 rounded-xl bg-white/80 border border-white/95 shadow-2xs flex flex-col justify-between"
                >
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-blue-50/80 border border-blue-100/80 flex items-center justify-center mb-1 sm:mb-1.5">
                    {skill.icon}
                  </div>
                  <h5 className="text-[11px] sm:text-[12px] font-bold text-brand-dark leading-tight">{skill.title}</h5>
                  <p className="mt-0.5 text-[9.5px] sm:text-[10.5px] text-brand-secondary leading-snug">{skill.desc}</p>
                </div>
              ))}
            </div>

            {/* Bottom Reassurance Banner */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100/90 mt-1">
              <div className="flex items-center gap-2 text-[10.5px] sm:text-[11px] text-brand-secondary">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-semibold text-emerald-800">Coming Soon:</span>
                <span>Offer skills or post gigs within campus</span>
              </div>
            </div>
          </GlassCard>

        </div>
      </div>
    </section>
  );
};

export default AboutSection;
