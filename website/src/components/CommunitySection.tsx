import React from 'react';
import { motion } from 'framer-motion';
import { OrangeBurstDoodle, CurvedThreadDoodle } from './Doodles';
import { MessageCircle, CheckCircle2 } from 'lucide-react';

interface CommunitySectionProps {
  onJoin: () => void;
}

export const CommunitySection: React.FC<CommunitySectionProps> = ({ onJoin }) => {
  return (
    <section id="community" className="py-20 sm:py-28 bg-[#FFFFFF] relative overflow-hidden">
      {/* Decorative hand-drawn looping thread under the section */}
      <div className="absolute -bottom-16 left-1/3 w-[450px] pointer-events-none opacity-60 z-0">
        <CurvedThreadDoodle />
      </div>

      <div className="max-w-6xl mx-auto px-5 sm:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-10 items-center">
          
          {/* Left Column: Heading, description, CTA */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 flex flex-col items-start"
          >
            <div className="relative mb-3">
              {/* Orange accent doodle beside headline */}
              <div className="absolute -top-7 right-0 sm:-right-4 w-9 pointer-events-none">
                <OrangeBurstDoodle />
              </div>

              <h2 className="text-[32px] sm:text-[40px] font-extrabold text-brand-dark leading-[1.15] tracking-tight">
                Campus Life Is Better<br />
                When We Connect!
              </h2>
            </div>

            <p className="mt-2 text-brand-secondary text-[13.5px] sm:text-[14.5px] leading-relaxed max-w-md">
              Meet fellow students, share useful finds, discover campus services and make
              everyday college life a little easier.
            </p>

            <button
              onClick={onJoin}
              className="mt-8 px-7 py-3 bg-brand-btnDark hover:bg-black text-white text-[13.5px] font-semibold rounded-full shadow-[0_6px_20px_rgba(25,29,37,0.18)] hover:-translate-y-0.5 active:scale-98 transition-all duration-200 cursor-pointer"
            >
              Join Campus Buddy
            </button>
          </motion.div>

          {/* Right Column: Playful Community Avatar Composition matching screenshot */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="relative w-[340px] sm:w-[400px] h-[360px] sm:h-[400px] flex items-center justify-center select-none">
              
              {/* Pale Blue Soft Cloud Shape Background */}
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className="absolute inset-4 bg-gradient-to-tr from-[#E6F3FE] via-[#F0F7FF] to-[#D9ECFD] rounded-[60px] -z-10 shadow-[0_12px_40px_rgba(8,96,232,0.08)]"
              />

              {/* Central Large Student Avatar */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
                className="relative z-20 w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 bg-white shadow-xl"
              >
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
                  alt="Student Community Lead"
                  className="w-full h-full rounded-full object-cover"
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-brand-blue border-2 border-white flex items-center justify-center text-white">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              </motion.div>

              {/* Avatar 1: Top-Left */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, type: 'spring' }}
                className="absolute top-6 left-6 w-14 h-14 rounded-full p-1 bg-white shadow-md z-10 float-slow"
              >
                <img
                  src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80"
                  alt="Student 1"
                  className="w-full h-full rounded-full object-cover"
                />
              </motion.div>

              {/* Avatar 2: Top-Right */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.38, type: 'spring' }}
                className="absolute top-10 right-8 w-13 h-13 rounded-full p-1 bg-white shadow-md z-10 float-slow-delay"
              >
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
                  alt="Student 2"
                  className="w-full h-full rounded-full object-cover"
                />
              </motion.div>

              {/* Avatar 3: Bottom-Left */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.46, type: 'spring' }}
                className="absolute bottom-6 left-10 w-14 h-14 rounded-full p-1 bg-white shadow-md z-10 float-slow-delay"
              >
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"
                  alt="Student 3"
                  className="w-full h-full rounded-full object-cover"
                />
              </motion.div>

              {/* Avatar 4: Bottom-Right */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.54, type: 'spring' }}
                className="absolute bottom-10 right-14 w-12 h-12 rounded-full p-1 bg-white shadow-md z-10 float-slow"
              >
                <img
                  src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80"
                  alt="Student 4"
                  className="w-full h-full rounded-full object-cover"
                />
              </motion.div>

              {/* Avatar 5: Right Edge */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.62, type: 'spring' }}
                className="absolute top-1/2 -right-2 -translate-y-1/2 w-11 h-11 rounded-full p-1 bg-white shadow-md z-10"
              >
                <img
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"
                  alt="Student 5"
                  className="w-full h-full rounded-full object-cover"
                />
              </motion.div>

              {/* Floating Speech Bubble 1: Top Right (Dark Pill matching screenshot) */}
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6, type: 'spring' }}
                className="absolute top-12 right-20 bg-brand-btnDark text-white px-3 py-1 rounded-full text-[10px] font-semibold shadow-lg z-30"
              >
                <span>Anyone selling DBMS notes?</span>
              </motion.div>

              {/* Floating Speech Bubble 2: Center-Left */}
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.72, type: 'spring' }}
                className="absolute top-36 left-4 bg-brand-btnDark text-white px-3 py-1 rounded-full text-[10px] font-semibold shadow-lg z-30"
              >
                <span>Calculator available!</span>
              </motion.div>

              {/* Floating Speech Bubble 3: Bottom Right */}
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.84, type: 'spring' }}
                className="absolute bottom-20 right-8 bg-brand-btnDark text-white px-3 py-1 rounded-full text-[10px] font-semibold shadow-lg z-30"
              >
                <span>Deal done! 🎉</span>
              </motion.div>

              {/* Floating Social Icons matching screenshot */}
              {/* Twitter Bird Top */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8, type: 'spring' }}
                className="absolute top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#1DA1F2] text-white flex items-center justify-center shadow-md z-30"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>
                </svg>
              </motion.div>

              {/* Instagram Gradient Icon Left */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.9, type: 'spring' }}
                className="absolute top-1/2 left-2 -translate-y-1/2 w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shadow-md z-30"
              >
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 stroke-current stroke-2 fill-none">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </motion.div>

              {/* TikTok / Chat Music Icon Bottom */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 1.0, type: 'spring' }}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-black text-white flex items-center justify-center shadow-md z-30"
              >
                <MessageCircle className="w-4 h-4 text-[#9DD6FA]" />
              </motion.div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
