import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Sun, Moon, HelpCircle, User, LogOut, CheckCircle2, Menu, X, History, Trash2 } from 'lucide-react';

interface NavbarProps {
  savedLogs?: any[];
  onLoadLog?: (tripData: any) => void;
  onClearHistory?: () => void;
  onRemoveLogFromHistory?: (id: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  savedLogs = [],
  onLoadLog,
  onClearHistory,
  onRemoveLogFromHistory
}) => {
  const [isDark, setIsDark] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const profileRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);

  // Setup scroll values using Framer Motion for organic interpolation
  const { scrollY } = useScroll();
  
  // Interpolations (scroll distance of 0px to 120px)
  const maxWidth = useTransform(scrollY, [0, 120], ['1360px', '1150px']);
  const top = useTransform(scrollY, [0, 120], ['24px', '8px']);
  const paddingY = useTransform(scrollY, [0, 120], ['12px', '6px']);
  
  // Liquid Glass transparency interpolations for dark/light modes (Approx 80% transparency = 20% opacity when scrolled)
  const bgLight = useTransform(scrollY, [0, 120], ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.2)']);
  const bgDark = useTransform(scrollY, [0, 120], ['rgba(9, 15, 29, 0.08)', 'rgba(15, 23, 42, 0.2)']);
  const borderLight = useTransform(scrollY, [0, 120], ['rgba(255, 255, 255, 0.1)', 'rgba(226, 232, 240, 0.2)']);
  const borderDark = useTransform(scrollY, [0, 120], ['rgba(30, 41, 59, 0.1)', 'rgba(30, 41, 59, 0.2)']);
  const shadow = useTransform(scrollY, [0, 120], [
    '0px 0px 0px rgba(0, 0, 0, 0)', 
    '0px 4px 12px rgba(15, 23, 42, 0.08)'
  ]);

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

  // Sync scroll boolean for mobile top offsetting
  useEffect(() => {
    const unsubscribe = scrollY.on('change', (latest) => {
      setIsScrolled(latest > 20);
    });
    return () => unsubscribe();
  }, [scrollY]);

  // Click outside to close profile dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false);
      }
      if (historyRef.current && !historyRef.current.contains(event.target as Node)) {
        setShowHistory(false);
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
    window.location.reload();
  };

  const scrollToSection = (id: string) => {
    setShowMobileMenu(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <motion.nav
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={{ top, maxWidth }}
      className="fixed z-50 left-1/2 -translate-x-1/2 w-full px-4 no-print"
    >
      {/* Apple Liquid UI Glassmorphic Capsule Container (Exactly like CodeHelp) */}
      <motion.div 
        style={{
          paddingTop: paddingY,
          paddingBottom: paddingY,
          background: isDark ? bgDark : bgLight,
          borderColor: isDark ? borderDark : borderLight,
          boxShadow: shadow
        }}
        className="w-full flex items-center justify-between relative z-20 rounded-full border backdrop-blur-xl transition-colors duration-300 px-6"
      >
        
        {/* Left: Brand Identity / Logo */}
        <div 
          onClick={handleLogoClick}
          className="flex items-center gap-3 cursor-pointer select-none group"
          title="Refresh Dashboard"
        >
          <div className="w-8 h-8 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
            <svg viewBox="0 0 32 32" className="w-7 h-7" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="nav-logo-grad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#2563eb" />
                  <stop offset="100%" stopColor="#1d4ed8" />
                </linearGradient>
              </defs>
              <circle cx="16" cy="16" r="15" fill="url(#nav-logo-grad)" className="shadow-md" />
              <path d="M16 6 C11.5 6 8 9.5 8 14 C8 20 16 27 16 27 C16 27 24 20 24 14 C24 9.5 20.5 6 16 6 Z M16 17 C14.3 17 13 15.7 13 14 C13 12.3 14.3 11 16 11 C17.7 11 19 12.3 19 14 C19 15.7 17.7 17 16 17 Z" fill="white" />
            </svg>
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

        {/* Center: Navigation capsule menu items (Exactly like CodeHelp center menu) */}
        <nav aria-label="Main" className="hidden lg:flex items-center justify-center flex-1 mx-4">
          <ul className="flex items-center gap-1 bg-slate-50/40 dark:bg-slate-950/20 border border-slate-200/50 dark:border-slate-800/35 px-1.5 py-1 rounded-full backdrop-blur-sm shadow-inner">
            <li>
              <button 
                onClick={() => scrollToSection('trip-planner-section')}
                className="inline-flex h-8 w-max items-center justify-center rounded-full px-4 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm transition-all cursor-pointer select-none"
              >
                Dashboard
              </button>
            </li>
            <li>
              <button 
                onClick={() => scrollToSection('route-map-section')}
                className="inline-flex h-8 w-max items-center justify-center rounded-full px-4 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm transition-all cursor-pointer select-none"
              >
                Route Map
              </button>
            </li>
            <li>
              <button 
                onClick={() => scrollToSection('logbook-section')}
                className="inline-flex h-8 w-max items-center justify-center rounded-full px-4 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm transition-all cursor-pointer select-none"
              >
                Daily Log Sheet
              </button>
            </li>
            <li>
              <button 
                onClick={() => scrollToSection('analytics-section')}
                className="inline-flex h-8 w-max items-center justify-center rounded-full px-4 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm transition-all cursor-pointer select-none"
              >
                HOS Analytics
              </button>
            </li>
          </ul>
        </nav>

        {/* Right: Controls & Actions */}
        <div className="flex items-center gap-3">
          
          {/* Help Docs Link */}
          <a
            href="https://www.fmcsa.dot.gov/regulations/hours-service/summary-hours-service-regulations"
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-50/40 hover:bg-slate-100/50 dark:bg-slate-800/40 dark:hover:bg-slate-700/50 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer border border-white/10"
            title="Hours of Service regulations help docs"
          >
            <HelpCircle className="w-4 h-4" />
          </a>

          {/* Dark Mode Switcher */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={toggleDarkMode}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-50/40 hover:bg-slate-100/50 dark:bg-slate-800/40 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-300 transition-all cursor-pointer shadow-sm border border-white/10 overflow-hidden"
            title="Toggle Theme"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={isDark ? 'dark' : 'light'}
                initial={{ y: 8, opacity: 0, rotate: -45 }}
                animate={{ y: 0, opacity: 1, rotate: 0 }}
                exit={{ y: -8, opacity: 0, rotate: 45 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              >
                {isDark ? (
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <Moon className="w-3.5 h-3.5 text-indigo-500" />
                )}
              </motion.div>
            </AnimatePresence>
          </motion.button>

          {/* Log History Panel (Saved hauls tracker) */}
          <div className="flex items-center relative" ref={historyRef}>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowHistory(!showHistory)}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-sm border border-white/10 relative ${
                showHistory 
                  ? 'bg-blue-600 text-white dark:bg-blue-500' 
                  : 'bg-slate-50/40 hover:bg-slate-100/50 dark:bg-slate-800/40 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-300'
              }`}
              title="View Log History"
            >
              <History className="w-3.5 h-3.5" />
              {savedLogs.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full flex items-center justify-center text-[8px] font-black animate-pulse">
                  {savedLogs.length}
                </span>
              )}
            </motion.button>

            <AnimatePresence>
              {showHistory && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="absolute right-0 top-[42px] z-50 w-80 p-4 rounded-2xl backdrop-blur-xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/50 dark:border-slate-800/50 shadow-2xl text-left select-text"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5 mb-3">
                    <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-800 dark:text-white">
                      ELD Log History
                    </h4>
                    {savedLogs.length > 0 && (
                      <button
                        onClick={() => {
                          if (onClearHistory && confirm("Are you sure you want to clear all history?")) {
                            onClearHistory();
                            setShowHistory(false);
                          }
                        }}
                        className="text-[8px] font-black uppercase text-rose-500 hover:text-rose-650 dark:hover:text-rose-450 cursor-pointer"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  {savedLogs.length === 0 ? (
                    <div className="py-6 text-center flex flex-col items-center justify-center gap-2">
                      <History className="w-8 h-8 text-slate-350 dark:text-slate-700 stroke-[1.5]" />
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                        No saved logs. Generate compliant ELD logs to store them here!
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
                      {savedLogs.map((log) => (
                        <div
                          key={log.id}
                          className="flex items-center justify-between gap-2 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 bg-white/50 dark:bg-slate-900/50 transition-colors group/item"
                        >
                          <div 
                            onClick={() => {
                              if (onLoadLog) {
                                onLoadLog(log.tripData);
                                setShowHistory(false);
                              }
                            }}
                            className="flex-1 cursor-pointer min-w-0"
                          >
                            <div className="flex justify-between items-center text-[9px] font-bold text-slate-400">
                              <span>Log Date: {log.date}</span>
                              <span className="text-[8px] font-medium text-slate-500 dark:text-slate-400">{log.timestamp.split(',')[1]?.trim() || ''}</span>
                            </div>
                            <h5 className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200 mt-1 truncate">
                              {log.fromCity.split(',')[0]} ➔ {log.toCity.split(',')[0]}
                            </h5>
                            <p className="text-[9px] text-slate-500 font-medium mt-0.5">
                              {log.distance.toFixed(0)} mi • {log.hours.toFixed(1)} hrs driving
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              if (onRemoveLogFromHistory) {
                                onRemoveLogFromHistory(log.id);
                              }
                            }}
                            className="p-1 rounded-lg text-slate-450 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 opacity-0 group-hover/item:opacity-100 transition-all cursor-pointer"
                            title="Remove from history"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User profile avatar dropdown */}
          <div className="flex items-center relative" ref={profileRef}>
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 shadow-inner cursor-pointer border border-white/15 hover:border-slate-300 dark:hover:border-slate-600 transition-all"
              title="View User Profile"
            >
              <User className="w-4 h-4" />
            </button>

            {/* Profile Dropdown panel */}
            <AnimatePresence>
              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="absolute right-0 top-[42px] z-50 w-72 p-4 rounded-2xl backdrop-blur-xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/50 dark:border-slate-800/50 shadow-2xl text-left select-text"
                >
                  <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold shadow-md">
                      RK
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-950 dark:text-white">Rajesh Kumar</h4>
                      <p className="text-[10px] text-slate-500 font-medium leading-tight">Class-A Commercial Driver (CDL)</p>
                    </div>
                  </div>

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
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black text-[9px] uppercase tracking-wide">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                        </span>
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

          {/* Responsive Mobile Menu Button (Exactly like CodeHelp mobile menu trigger) */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 lg:hidden cursor-pointer border border-white/10"
            title="Toggle Menu"
          >
            {showMobileMenu ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

      </motion.div>

      {/* Responsive Mobile Dropdown Drawer (Exactly like CodeHelp responsive overlays) */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={`absolute left-4 right-4 z-15 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-xl lg:hidden flex flex-col gap-2 ${
              isScrolled ? 'top-[50px]' : 'top-[58px]'
            }`}
          >
            <button 
              onClick={() => scrollToSection('trip-planner-section')}
              className="w-full py-2.5 rounded-xl text-left px-4 text-xs font-black text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-950 dark:hover:text-white transition-colors"
            >
              Dashboard
            </button>
            <button 
              onClick={() => scrollToSection('route-map-section')}
              className="w-full py-2.5 rounded-xl text-left px-4 text-xs font-black text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-950 dark:hover:text-white transition-colors"
            >
              Route Map
            </button>
            <button 
              onClick={() => scrollToSection('logbook-section')}
              className="w-full py-2.5 rounded-xl text-left px-4 text-xs font-black text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-950 dark:hover:text-white transition-colors"
            >
              Daily Log Sheet
            </button>
            <button 
              onClick={() => scrollToSection('analytics-section')}
              className="w-full py-2.5 rounded-xl text-left px-4 text-xs font-black text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-950 dark:hover:text-white transition-colors"
            >
              HOS Analytics
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.nav>
  );
};
export default Navbar;
