import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, HelpCircle, User, LogOut, CheckCircle2 } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [isDark, setIsDark] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

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

  // Click outside to close profile dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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

  const handleLogoClick = () => {
    // Reload the entire page when the logo is clicked
    window.location.reload();
  };

  return (
    <motion.nav
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="sticky top-4 z-50 w-full max-w-[1360px] mx-auto px-4 no-print relative"
    >
      {/* Apple Liquid UI Glassmorphic Capsule */}
      <div className="w-full backdrop-blur-xl bg-white/20 dark:bg-slate-950/20 border border-white/25 dark:border-slate-800/40 rounded-full shadow-lg shadow-slate-950/5 dark:shadow-none px-6 py-2.5 flex items-center justify-between transition-colors duration-300 relative z-20">
        
        {/* Left: Brand Identity (Clickable to reload) */}
        <div 
          onClick={handleLogoClick}
          className="flex items-center gap-3 cursor-pointer select-none group"
          title="Refresh Dashboard"
        >
          <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-slate-900 dark:bg-white shadow-md transition-transform duration-300 group-hover:scale-105">
            <img src="/logo.svg" className="w-5 h-5 object-contain" alt="HOS Logo" />
          </div>
          <div>
            <span className="font-extrabold text-xs md:text-sm tracking-tight text-slate-950 dark:text-white uppercase transition-colors">
              HOS Route Planner
            </span>
            <span className="hidden sm:inline-block ml-2 px-1.5 py-0.5 rounded-full text-[8px] bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">
              HOS ELD
            </span>
          </div>
        </div>

        {/* Center/Right: Nav items & Controls */}
        <div className="flex items-center gap-3.5">
          
          {/* Help Docs Link */}
          <a
            href="https://www.fmcsa.dot.gov/regulations/hours-service/summary-hours-service-regulations"
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-50/40 hover:bg-slate-100/50 dark:bg-slate-800/40 dark:hover:bg-slate-700/50 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer border border-white/10"
            title="Hours of Service (HOS) Official Regulations Docs"
          >
            <HelpCircle className="w-4 h-4" />
          </a>

          {/* Vertical divider */}
          <div className="w-px h-5 bg-slate-300/40 dark:bg-slate-800/40" />

          {/* Dark Mode Switcher */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={toggleDarkMode}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-50/40 hover:bg-slate-100/50 dark:bg-slate-800/40 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-300 transition-all cursor-pointer shadow-sm border border-white/10"
            title="Toggle Theme"
          >
            {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400 animate-pulse" /> : <Moon className="w-3.5 h-3.5 text-indigo-500" />}
          </motion.button>

          {/* User profile avatar relative container */}
          <div className="flex items-center relative" ref={profileRef}>
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 shadow-inner cursor-pointer border border-white/15 hover:border-slate-300 dark:hover:border-slate-600 transition-all"
              title="View User Profile"
            >
              <User className="w-4 h-4" />
            </button>

            {/* User profile dropdown card (Liquid UI glassmorphic tooltip card) */}
            <AnimatePresence>
              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="absolute right-0 top-[42px] z-50 w-72 p-4 rounded-2xl backdrop-blur-xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/50 dark:border-slate-800/50 shadow-2xl text-left select-text"
                >
                  {/* Header: Driver Badge */}
                  <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold shadow-md">
                      RK
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-955 dark:text-white">Rajesh Kumar</h4>
                      <p className="text-[10px] text-slate-500 font-medium leading-tight">Class-A Commercial Driver (CDL)</p>
                    </div>
                  </div>

                  {/* Profile Statistics list */}
                  <div className="flex flex-col gap-2.5 text-[10px] text-slate-600 dark:text-slate-400 font-semibold mb-3.5">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-medium">Compliance Rating</span>
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                        <CheckCircle2 className="w-3 h-3" />
                        98.4% Compliant
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Driver Status</span>
                      <span className="px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-black text-[9px] uppercase tracking-wide">
                        Active Duty
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">ELD Tractor Id</span>
                      <span className="text-slate-800 dark:text-slate-200 font-mono">NL-01-A-4832</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Home Terminal</span>
                      <span className="text-slate-800 dark:text-slate-200 text-right truncate max-w-[150px]" title="Kalamboli Terminal, Navi Mumbai">
                        Kalamboli Terminal, Navi Mumbai
                      </span>
                    </div>
                  </div>

                  {/* Logout panel button */}
                  <button
                    onClick={() => {
                      setShowProfile(false);
                      alert("Driver Logged Out successfully (Mock session terminated).");
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-[10px] transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 text-slate-400" />
                    <span>Log Out Driver</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>

    </motion.nav>
  );
};
