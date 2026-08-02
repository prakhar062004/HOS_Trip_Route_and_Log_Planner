import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, HelpCircle, User } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [isDark, setIsDark] = useState(false);

  // Sync with document element for dark mode class
  useEffect(() => {
    const isDarkStored = localStorage.getItem('theme') === 'dark' || 
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    setIsDark(isDarkStored);
    if (isDarkStored) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <motion.nav
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="sticky top-4 z-50 w-full max-w-[1360px] mx-auto px-4 no-print"
    >
      <div className="w-full backdrop-blur-md bg-white/70 dark:bg-slate-900/80 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-lg shadow-slate-100/40 dark:shadow-none px-4 py-3 flex items-center justify-between transition-colors duration-300">
        
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-slate-900 dark:bg-white shadow-md">
            <img src="/logo.svg" className="w-6 h-6 object-contain" alt="HOS Logo" />
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-tight text-slate-950 dark:text-white uppercase">
              HOS Route Planner
            </span>
            <span className="hidden sm:inline-block ml-2 px-1.5 py-0.5 rounded-full text-[9px] bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">
              HOS ELD
            </span>
          </div>
        </div>

        {/* Center/Right: Nav items & Controls */}
        <div className="flex items-center gap-4">

          <button
            onClick={() => window.open('https://fmcsa.dot.gov', '_blank')}
            className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
            title="HOS Help / DOT Docs"
          >
            <HelpCircle className="w-4.5 h-4.5" />
          </button>

          {/* Vertical divider */}
          <div className="w-px h-5 bg-slate-200 dark:bg-slate-800" />

          {/* Dark Mode Switcher */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={toggleDarkMode}
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all cursor-pointer shadow-sm border border-slate-200/50 dark:border-slate-700/50"
            title="Toggle Theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
          </motion.button>

          {/* User profile avatar */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 shadow-inner cursor-pointer border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              <User className="w-4 h-4" />
            </div>
          </div>
        </div>

      </div>
    </motion.nav>
  );
};
