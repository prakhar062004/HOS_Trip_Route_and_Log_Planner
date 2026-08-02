import React from 'react';
import { motion } from 'framer-motion';
import { Compass, Sparkles } from 'lucide-react';

export const EmptyState: React.FC = () => {
  const handleStartPlanning = () => {
    const el = document.getElementById('trip-planner-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      // Find the first input and focus it
      const input = el.querySelector('input');
      if (input) {
        (input as HTMLInputElement).focus();
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="w-full flex flex-col items-center justify-center border border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-slate-900 rounded-3xl p-10 md:p-16 text-center shadow-lg shadow-slate-100/40 dark:shadow-none"
    >
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-inner">
          <Compass className="w-8 h-8 animate-pulse" />
        </div>
        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center shadow-md animate-bounce">
          <Sparkles className="w-3 h-3" />
        </div>
      </div>

      <h3 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">
        No Active Haul Generated
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
        Fill out your starting terminal, cargo loading dock, and final dropoff destination to automatically map the route, schedule HOS-compliant breaks, and draw official driver logs.
      </p>

      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleStartPlanning}
        className="mt-6 px-6 py-2.5 bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-bold rounded-xl text-xs hover:bg-slate-800 dark:hover:bg-slate-100 shadow-md shadow-slate-200 dark:shadow-none transition-all cursor-pointer"
      >
        Start Planning
      </motion.button>
    </motion.div>
  );
};
