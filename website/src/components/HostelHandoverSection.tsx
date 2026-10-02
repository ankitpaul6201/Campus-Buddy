import React from 'react';
import { motion } from 'framer-motion';
import { Building2, ArrowRight, RefreshCw, Sparkles, MapPin } from 'lucide-react';
import { OrangeBurstDoodle } from './Doodles';

interface HostelHandoverProps {
  onExploreCTA: () => void;
}

export const HostelHandoverSection: React.FC<HostelHandoverProps> = ({ onExploreCTA }) => {
  return (
    <section className="py-20 sm:py-28 bg-[#FFFFFF] relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="bg-gradient-to-br from-[#F5FAFE] via-[#FFFFFF] to-[#EFF7FE] border border-[#E0EEFA] rounded-3xl p-8 sm:p-14 relative overflow-hidden shadow-soft">
          
          {/* Subtle Background Radial */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-blue/5 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
            
            {/* Left Content */}
            <div className="lg:col-span-7 flex flex-col items-start">
              <div className="relative mb-3">
                <div className="absolute -top-7 right-0 w-8 pointer-events-none">
                  <OrangeBurstDoodle />
                </div>

                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-orange bg-orange-50 px-3 py-1 rounded-full border border-orange-100 inline-block mb-3">
                  Hostel Handover
                </span>

                <h2 className="text-[30px] sm:text-[38px] font-extrabold text-brand-dark leading-[1.15] tracking-tight">
                  Moving out? Pass it on<br />
                  to the next student.
                </h2>
              </div>

              <p className="mt-3 text-brand-secondary text-[13.5px] sm:text-[14.5px] leading-relaxed max-w-lg">
                Make it easier for useful books, cycles, furniture, and hostel essentials to find their next owner within the student community. When semesters shift or seniors graduate, keep useful gear on campus instead of packing it away or abandoning it.
              </p>

              {/* Handover Use Cases Badges */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                <div className="flex items-center gap-2.5 p-3 bg-white/90 rounded-xl border border-gray-100 shadow-2xs">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-brand-blue flex items-center justify-center shrink-0">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-[12px] font-bold text-brand-dark">Hostel Move-Out</h5>
                    <p className="text-[10px] text-gray-400">Hand over kettles, racks & lamps</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-3 bg-white/90 rounded-xl border border-gray-100 shadow-2xs">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 text-brand-orange flex items-center justify-center shrink-0">
                    <RefreshCw className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-[12px] font-bold text-brand-dark">Semester Rollovers</h5>
                    <p className="text-[10px] text-gray-400">Pass reference books to juniors</p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <button
                  onClick={onExploreCTA}
                  className="px-7 py-3 bg-brand-btnDark hover:bg-black text-white text-[13.5px] font-semibold rounded-full shadow-[0_6px_20px_rgba(25,29,37,0.18)] hover:-translate-y-0.5 active:scale-98 transition-all duration-200 cursor-pointer flex items-center gap-2 group"
                >
                  <span>Explore Campus Buddy</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>

            {/* Right Visual: Hostel Handover Campus Card */}
            <div className="lg:col-span-5 flex justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-sm bg-white rounded-3xl p-6 border border-[#E0EEFA] shadow-xl relative"
              >
                {/* Floating Handover Badge */}
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-[12px] font-bold text-brand-dark">Active Campus Handover</h4>
                      <p className="text-[10px] text-gray-400 flex items-center gap-0.5">
                        <MapPin className="w-3 h-3 text-brand-blue" /> Boys Hostel Block B Canteen
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    Completed
                  </span>
                </div>

                {/* Handover Illustrative Item Preview */}
                <div className="mt-4 flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
                  <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-white border border-gray-200">
                    <img
                      src="https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=200&auto=format&fit=crop&q=80"
                      alt="Campus Cycle"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-bold text-brand-dark truncate">
                      Hero Sprint 21-Speed Cycle
                    </p>
                    <p className="text-[10px] text-gray-500">Passed from 4th Year to 2nd Year</p>
                    <span className="text-[12px] font-extrabold text-brand-blue mt-0.5 block">
                      ₹2,200
                    </span>
                  </div>
                </div>

                {/* Micro quote */}
                <div className="mt-4 p-3 bg-blue-50/60 rounded-xl border border-blue-100/60 text-[11px] text-brand-dark leading-relaxed">
                  "Cleared out my hostel room in 24 hours without leaving anything behind. Handed it over directly in the campus cafeteria!"
                  <div className="mt-1 font-semibold text-brand-blue text-[10px]">
                    — Final Year Mechanical Senior
                  </div>
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
