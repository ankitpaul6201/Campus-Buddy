import React from 'react';
import { motion } from 'framer-motion';
import { FlipButton } from './ui/Button';

interface CommunitySectionProps {
  onJoin: () => void;
}

export const CommunitySection: React.FC<CommunitySectionProps> = ({ onJoin }) => {
  return (
    <section id="community" className="py-20 sm:py-28 bg-[#FFFFFF] relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

          {/* Left Column: Heading, description, CTA */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 flex flex-col items-start"
          >
            <div className="relative mb-3">
              <h2 className="text-[26px] sm:text-[40px] font-extrabold text-brand-dark leading-[1.15] tracking-tight">
                Campus Life Is Better<br />
                When We Connect!
              </h2>
            </div>

            <p className="mt-2 text-brand-secondary text-[13.5px] sm:text-[14.5px] leading-relaxed max-w-md">
              Meet fellow students, share useful finds, discover campus services and make
              everyday college life a little easier.
            </p>

            <div className="mt-8">
              <FlipButton
                variant="dark"
                onClick={onJoin}
                className="px-8 py-3.5"
              >
                Join Campus Buddy
              </FlipButton>
            </div>
          </motion.div>

          {/* Right Column: Visual College Hub & Connected Student Network (Image 1 Style with Flowing Line Animation) */}
          <div className="lg:col-span-7 flex justify-center">
            <div className="relative w-full max-w-[340px] sm:max-w-[500px] aspect-square flex items-center justify-center select-none mx-auto">

              {/* Dotted Grid Matrix with Blurred/Feathered Radial Mask Blending Seamlessly into White Background */}
              <div
                className="absolute inset-0 pointer-events-none opacity-50"
                style={{
                  backgroundImage: 'radial-gradient(#94A3B8 1.25px, transparent 1.25px)',
                  backgroundSize: '24px 24px',
                  backgroundPosition: '12px 12px',
                  maskImage: 'radial-gradient(ellipse 65% 65% at 50% 50%, black 35%, transparent 72%)',
                  WebkitMaskImage: 'radial-gradient(ellipse 65% 65% at 50% 50%, black 35%, transparent 72%)'
                }}
              />

              {/* Soft Center Radial Brand Blue Glow */}
              <div className="absolute w-72 h-72 rounded-full bg-brand-blue/5 blur-3xl pointer-events-none" />

              {/* SVG Network Connector Lines with Flowing Animation */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none z-10"
                viewBox="0 0 500 500"
                fill="none"
              >
                <defs>
                  {/* Flowing Pulse Gradient */}
                  <linearGradient id="flowPulse" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0860E8" stopOpacity="0.2" />
                    <stop offset="50%" stopColor="#0860E8" stopOpacity="1" />
                    <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.9" />
                  </linearGradient>
                </defs>

                <style>{`
                  @keyframes flowLineLong {
                    0% { stroke-dashoffset: 52; }
                    100% { stroke-dashoffset: -220; }
                  }
                  @keyframes flowLineMed {
                    0% { stroke-dashoffset: 44; }
                    100% { stroke-dashoffset: -180; }
                  }
                  @keyframes flowLineShort {
                    0% { stroke-dashoffset: 32; }
                    100% { stroke-dashoffset: -110; }
                  }
                  .animate-flow-long {
                    animation: flowLineLong 2.5s linear infinite;
                  }
                  .animate-flow-med {
                    animation: flowLineMed 2.1s linear infinite;
                  }
                  .animate-flow-short {
                    animation: flowLineShort 1.6s linear infinite;
                  }
                `}</style>

                {/* 6 Circuit Connection Paths - Single Long Line Enters, Travels & Exits */}
                {[
                  // 1. Center Top to Top-Left Node (Casio fx-991CW) - Long curve (~193px)
                  {
                    d: 'M 230 204 V 120 Q 230 100 210 100 H 132',
                    dash: '52 220',
                    animClass: 'animate-flow-long',
                    delay: '0s'
                  },
                  // 2. Center Top to Top-Right Node (Python Peer) - Med curve (~125px)
                  {
                    d: 'M 270 204 V 155 Q 270 140 290 140 H 320 Q 340 140 340 132',
                    dash: '44 180',
                    animClass: 'animate-flow-med',
                    delay: '0.4s'
                  },
                  // 3. Center Left to Middle-Left Node (Join Us) - Short straight (72px)
                  {
                    d: 'M 204 250 H 132',
                    dash: '32 110',
                    animClass: 'animate-flow-short',
                    delay: '0.8s'
                  },
                  // 4. Center Right to Middle-Right Node (Fest Photos) - Short straight (72px)
                  {
                    d: 'M 296 250 H 378',
                    dash: '32 110',
                    animClass: 'animate-flow-short',
                    delay: '1.2s'
                  },
                  // 5. Center Bottom to Bottom-Left Node (DBMS Notes Deal) - Long curve (~193px)
                  {
                    d: 'M 230 296 V 380 Q 230 400 210 400 H 132',
                    dash: '52 220',
                    animClass: 'animate-flow-long',
                    delay: '0.6s'
                  },
                  // 6. Center Bottom to Bottom-Right Node (Verified Peer) - Med curve (~153px)
                  {
                    d: 'M 270 296 V 360 Q 270 380 290 380 H 348',
                    dash: '44 180',
                    animClass: 'animate-flow-med',
                    delay: '1.0s'
                  }
                ].map((pathObj, idx) => (
                  <g key={idx}>
                    {/* Base Static Circuit Track */}
                    <path
                      d={pathObj.d}
                      stroke="#E2E8F0"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Soft Light-Blue Glow Trail */}
                    <path
                      d={pathObj.d}
                      stroke="#38BDF8"
                      strokeWidth="5.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeDasharray={pathObj.dash}
                      className={pathObj.animClass}
                      style={{
                        animationDelay: pathObj.delay,
                        opacity: 0.3
                      }}
                    />

                    {/* Single Traveling Core Beam (Solid brand-blue #0860E8) */}
                    <path
                      d={pathObj.d}
                      stroke="#0860E8"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeDasharray={pathObj.dash}
                      className={pathObj.animClass}
                      style={{ animationDelay: pathObj.delay }}
                    />
                  </g>
                ))}
              </svg>

              {/* ---------------- CENTER: COLLEGE BUILDING HUB (Dead-Center at 250,250) ---------------- */}
              <div
                className="absolute z-30 pointer-events-auto"
                style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: 'spring', damping: 20, stiffness: 240, delay: 0.15 }}
                  className="relative flex items-center justify-center"
                >
                  {/* Ambient glow behind center card */}
                  <div className="absolute inset-0 rounded-3xl bg-brand-blue/20 blur-xl animate-pulse -z-10" />

                  {/* College Hub Card (92px x 92px matching Center Flow Coordinates 204..296) */}
                  <div className="w-[92px] h-[92px] rounded-3xl bg-white border-2 border-brand-blue/35 shadow-[0_12px_32px_rgba(8,96,232,0.18)] p-2 flex flex-col items-center justify-center hover:scale-105 transition-transform duration-300">
                    <img
                      src="/sviet-college-icon.png"
                      alt="Campus College Building"
                      className="w-12 h-12 object-contain rounded-xl"
                    />
                    <span className="text-[10px] font-black text-brand-dark tracking-tight leading-tight mt-0.5">
                      Campus Hub
                    </span>
                    <span className="text-[8px] font-extrabold text-brand-blue uppercase tracking-wider leading-none mt-0.5">
                      Network
                    </span>
                  </div>
                </motion.div>
              </div>

              {/* ---------------- 6 OUTER CONNECTED STUDENT NODES (Accurately Centered at Path Endpoints) ---------------- */}
              {[
                {
                  id: 1,
                  left: '20%',
                  top: '20%',
                  avatar: '/avatars/student-1.jpg',
                  name: 'Student Seller',
                  badge: 'Casio fx-991CW • ₹650',
                  badgePosition: '-top-6 left-1/2 -translate-x-1/2',
                  badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                  dotColor: 'bg-emerald-500'
                },
                {
                  id: 2,
                  left: '68%',
                  top: '20%',
                  avatar: '/avatars/student-2.jpg',
                  name: 'Student Coder',
                  badge: 'Python Peer • ₹99/hr',
                  badgePosition: '-top-6 left-1/2 -translate-x-1/2',
                  badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
                  dotColor: 'bg-sky-500'
                },
                {
                  id: 3,
                  left: '20%',
                  top: '50%',
                  avatar: '/avatars/student-3.jpg',
                  name: 'Student Lead',
                  badge: 'Drafter • ₹150',
                  badgePosition: '-bottom-6 left-1/2 -translate-x-1/2',
                  badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
                  dotColor: 'bg-amber-500'
                },
                {
                  id: 4,
                  left: '82%',
                  top: '50%',
                  avatar: '/avatars/student-4.jpg',
                  name: 'Student Creative',
                  badge: 'Need Drafter',
                  badgePosition: '-bottom-6 left-1/2 -translate-x-1/2',
                  badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
                  dotColor: 'bg-amber-500'
                },
                {
                  id: 5,
                  left: '20%',
                  top: '80%',
                  avatar: '/avatars/student-5.jpg',
                  name: 'Student Peer',
                  badge: 'Python Tutor Needed',
                  badgePosition: '-bottom-6 left-1/2 -translate-x-1/2',
                  badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
                  dotColor: 'bg-sky-500'
                },
                {
                  id: 6,
                  left: '76%',
                  top: '76%',
                  avatar: '/avatars/student-6.jpg',
                  name: 'Verified Student',
                  badge: 'Need Calculator',
                  badgePosition: '-bottom-6 left-1/2 -translate-x-1/2',
                  badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                  dotColor: 'bg-emerald-500'
                }
              ].map((node) => (
                <div
                  key={node.id}
                  className="absolute z-20 group"
                  style={{ left: node.left, top: node.top, transform: 'translate(-50%, -50%)' }}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.7 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.12 * node.id, type: 'spring', damping: 20 }}
                    className="relative flex items-center justify-center"
                  >
                    {/* Floating Speech/Status Badge */}
                    <div
                      className={`absolute ${node.badgePosition} whitespace-nowrap px-2.5 py-0.5 rounded-full text-[9.5px] font-bold border shadow-xs pointer-events-none transition-transform group-hover:scale-105 ${node.badgeColor} flex items-center gap-1.5`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${node.dotColor}`} />
                      <span>{node.badge}</span>
                    </div>

                    {/* 64x64 Squircle Node Card matching Image 1 with Student Avatar */}
                    <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200/90 shadow-md hover:shadow-xl hover:border-brand-blue/50 p-1 flex items-center justify-center transition-all duration-300 group-hover:scale-110 cursor-pointer">
                      <img
                        src={node.avatar}
                        alt={node.name}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    </div>
                  </motion.div>
                </div>
              ))}

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
