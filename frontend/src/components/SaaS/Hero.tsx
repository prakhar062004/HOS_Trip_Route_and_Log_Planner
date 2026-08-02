import React from 'react';
import { motion } from 'framer-motion';
import { Truck, ArrowRight, BookOpen } from 'lucide-react';

export const Hero: React.FC = () => {
  const scrollToPlanner = () => {
    const el = document.getElementById('trip-planner-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative w-full max-w-[1360px] mx-auto px-4 mt-6 no-print overflow-hidden rounded-3xl">
      {/* Background ambient light mesh */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-slate-50 to-indigo-50/30 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900/50 -z-10 transition-colors duration-300" />
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] bg-blue-400/10 dark:bg-blue-600/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[60%] bg-indigo-400/10 dark:bg-indigo-600/5 rounded-full blur-[100px]" />

      <div className="w-full border border-slate-200/40 dark:border-slate-800/40 rounded-3xl px-6 py-10 md:py-16 md:px-12 flex flex-col md:flex-row items-center justify-between gap-8 transition-colors duration-300">
        
        {/* Left Column: Heading and Action buttons */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
          className="flex-1 flex flex-col items-start gap-4 text-left max-w-lg"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold uppercase tracking-widest shadow-sm">
            <Truck className="w-3.5 h-3.5 text-blue-500" />
            <span>Next-Gen Logistics</span>
          </div>

          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-950 dark:text-white leading-tight">
            HOS ELD <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">Route Planner</span>
          </h2>

          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
            Generate compliant electronic log sheets, calculate Hours of Service (HOS) automatically, and visualize your complete haul in seconds. Built for modern carriers and drivers.
          </p>

          <div className="flex flex-wrap items-center gap-3.5 mt-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={scrollToPlanner}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-bold rounded-xl text-xs hover:bg-slate-800 dark:hover:bg-slate-100 shadow-md shadow-slate-200 dark:shadow-none transition-all cursor-pointer"
            >
              <span>Plan Trip</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.open('https://fmcsa.dot.gov/regulations/hours-service/summary-hours-service-regulations', '_blank')}
              className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs hover:bg-slate-50 dark:hover:bg-slate-800/50 shadow-sm transition-all cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-slate-400" />
              <span>DOT HOS Regulations</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Right Column: Truck Vector SVG Graphic */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
          className="flex-1 w-full max-w-sm md:max-w-md"
        >
          <div className="relative p-6 bg-white/40 dark:bg-slate-900/30 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-inner flex items-center justify-center">
            {/* Styled vector semi-truck illustration */}
            <svg
              viewBox="0 0 200 120"
              className="w-full h-auto text-slate-800 dark:text-slate-200 drop-shadow-lg"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Ground road path */}
              <line x1="10" y1="105" x2="190" y2="105" stroke="#94a3b8" strokeWidth="3" strokeDasharray="6 4" />
              
              {/* Semi-trailer block */}
              <rect x="25" y="25" width="105" height="65" rx="4" fill="none" stroke="currentColor" strokeWidth="2.5" />
              {/* Trailer details */}
              <line x1="30" y1="25" x2="30" y2="90" stroke="#64748b" strokeWidth="1.5" />
              <line x1="125" y1="25" x2="125" y2="90" stroke="#64748b" strokeWidth="1.5" />
              <path d="M 50,45 L 110,45" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
              <path d="M 50,55 L 110,55" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />

              {/* Cab back connector */}
              <path d="M 130,85 L 140,85" stroke="currentColor" strokeWidth="2.5" />
              
              {/* Cab block */}
              <path d="M 140,90 L 140,45 L 165,45 C 165,45 170,45 173,50 L 183,68 C 185,72 186,75 186,80 L 186,90 Z" fill="none" stroke="currentColor" strokeWidth="2.5" />
              {/* Cab window */}
              <path d="M 152,52 L 165,52 L 175,68 L 152,68 Z" fill="none" stroke="currentColor" strokeWidth="2.5" />
              
              {/* Cab wheel arch */}
              <path d="M 164,90 C 164,83 176,83 176,90" fill="none" stroke="currentColor" strokeWidth="2.5" />
              
              {/* Trailer wheel arches */}
              <path d="M 32,90 C 32,83 44,83 44,90" fill="none" stroke="currentColor" strokeWidth="2.5" />
              <path d="M 46,90 C 46,83 58,83 58,90" fill="none" stroke="currentColor" strokeWidth="2.5" />
              <path d="M 112,90 C 112,83 124,83 124,90" fill="none" stroke="currentColor" strokeWidth="2.5" />
              
              {/* Wheels (double rear, single front cab) */}
              <circle cx="38" cy="95" r="8" fill="currentColor" />
              <circle cx="38" cy="95" r="3" fill="#f8fafc" className="dark:fill-slate-950" />
              
              <circle cx="52" cy="95" r="8" fill="currentColor" />
              <circle cx="52" cy="95" r="3" fill="#f8fafc" className="dark:fill-slate-950" />
              
              <circle cx="118" cy="95" r="8" fill="currentColor" />
              <circle cx="118" cy="95" r="3" fill="#f8fafc" className="dark:fill-slate-950" />
              
              <circle cx="170" cy="95" r="8" fill="currentColor" />
              <circle cx="170" cy="95" r="3" fill="#f8fafc" className="dark:fill-slate-950" />
              
              {/* Exhaust Pipe */}
              <path d="M 142,45 L 142,20 L 145,18" stroke="currentColor" strokeWidth="2" />
              
              {/* Fuel tank */}
              <rect x="75" y="90" width="22" height="8" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </div>
        </motion.div>

      </div>
    </section>
  );
};
