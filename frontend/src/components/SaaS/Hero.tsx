import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Truck, ArrowRight, BookOpen } from 'lucide-react';

export const Hero: React.FC = () => {
  const [isLaunched, setIsLaunched] = useState(false);

  const scrollToPlanner = () => {
    setIsLaunched(true);
    
    // Scroll at 1.1s, exactly when the truck has driven off-screen and faded out.
    // This avoids rendering overlapping scroll layout updates and animation steps concurrently.
    setTimeout(() => {
      const el = document.getElementById('trip-planner-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
      
      // Reset launch state once user has scrolled past
      setTimeout(() => {
        setIsLaunched(false);
      }, 1200);
    }, 1100);
  };

  return (
    <section className="relative w-full max-w-[1360px] mx-auto px-4 mt-24 no-print overflow-hidden rounded-3xl">
      {/* Background ambient light mesh */}
      <div className="absolute inset-0 bg-transparent -z-10 transition-colors duration-300" />

      <div className="w-full border border-slate-200/40 dark:border-slate-800/35 rounded-3xl px-6 py-12 md:py-20 md:px-12 flex flex-col md:flex-row items-center justify-between gap-10 transition-colors duration-300 bg-white/20 dark:bg-slate-900/10 backdrop-blur-md">
        
        {/* Left Column: Typography Header & CTAs */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
          className="flex-1 flex flex-col items-start gap-5 text-left max-w-xl"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 text-blue-600 dark:text-blue-400 font-black uppercase tracking-widest shadow-sm border border-blue-500/10 dark:border-blue-400/20 backdrop-blur-md">
            <Truck className="w-3.5 h-3.5 text-blue-500 animate-bounce" style={{ animationDuration: '3s' }} />
            <span>Next-Gen Logistics</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-950 dark:text-white leading-tight">
            HOS ELD <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 dark:from-blue-400 dark:via-indigo-300 dark:to-purple-400 bg-clip-text text-transparent">
              Route Planner
            </span>
          </h1>

          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-semibold max-w-md">
            Generate compliant electronic log sheets, calculate Hours of Service (HOS) automatically, and visualize your complete haul in seconds. Built for modern carriers and drivers.
          </p>

          <div className="flex flex-wrap items-center gap-3.5 mt-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={scrollToPlanner}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-950 hover:bg-slate-900 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer"
            >
              <span>Launch Route Planner</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
            <motion.a
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              href="https://www.fmcsa.dot.gov/regulations/hours-service/summary-hours-service-regulations"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs hover:bg-slate-50 dark:hover:bg-slate-800/50 shadow-sm transition-all cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-slate-400" />
              <span>DOT HOS Regulations</span>
            </motion.a>
          </div>
        </motion.div>

        {/* Right Column: Truck Vector SVG Graphic */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
          className="flex-1 w-full max-w-sm md:max-w-md relative group"
        >
          {/* Subtle glow behind the truck layout */}
          <div className="absolute -inset-1.5 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-3xl blur-[20px] opacity-45 group-hover:opacity-60 transition duration-1000 -z-10" />

          <div className="relative p-6 bg-white/40 dark:bg-slate-900/30 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-inner flex items-center justify-center overflow-hidden cursor-pointer">
            {/* Embedded styles for GPU accelerated dynamic keyframe truck motion */}
            <style dangerouslySetInnerHTML={{__html: `
              @keyframes roadDrive {
                from { stroke-dashoffset: 10; }
                to { stroke-dashoffset: 0; }
              }
              @keyframes truckBob {
                0% { transform: translate3d(0, 0, 0); }
                50% { transform: translate3d(0, -1.5px, 0); }
                100% { transform: translate3d(0, 0, 0); }
              }
              @keyframes truckLaunch {
                0% { transform: translate3d(0, 0, 0); opacity: 1; }
                20% { transform: translate3d(8px, -2.5px, 0); opacity: 1; }
                100% { transform: translate3d(260px, -1px, 0); opacity: 0; }
              }
              @keyframes roadLaunch {
                from { stroke-dashoffset: 10; opacity: 1; }
                to { stroke-dashoffset: -50; opacity: 0; }
              }
              
              /* GPU Layer configurations */
              .animate-road-drive {
                animation: roadDrive 0.4s linear infinite;
                will-change: stroke-dashoffset;
              }
              .animate-truck-bob {
                animation: truckBob 0.25s ease-in-out infinite;
                will-change: transform;
              }
              .animate-truck-launch {
                animation: truckLaunch 1.2s cubic-bezier(0.25, 1, 0.5, 1) forwards;
                will-change: transform;
              }
              .animate-road-launch {
                animation: roadLaunch 1.2s cubic-bezier(0.25, 1, 0.5, 1) forwards;
                will-change: stroke-dashoffset, opacity;
              }
              
              /* Pause animation when user hovers on the card */
              .group:hover .animate-road-drive {
                animation-play-state: paused;
              }
              .group:hover .animate-truck-bob {
                animation-play-state: paused;
              }
            `}} />
            
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
              <line 
                x1="10" 
                y1="105" 
                x2="190" 
                y2="105" 
                stroke="#94a3b8" 
                strokeWidth="3" 
                strokeDasharray="6 4"
                className={isLaunched ? 'animate-road-launch' : 'animate-road-drive'} 
              />
              
              {/* Animated Truck Body Group */}
              <g className={`origin-bottom ${isLaunched ? 'animate-truck-launch' : 'animate-truck-bob'}`}>
                {/* Semi-trailer block (Vibrant Blue outline with soft translucent gradient fill) */}
                <rect x="25" y="25" width="105" height="65" rx="4" fill="rgba(59, 130, 246, 0.05)" stroke="#3b82f6" strokeWidth="2.5" />
                {/* Trailer details */}
                <line x1="30" y1="25" x2="30" y2="90" stroke="#3b82f6" strokeWidth="1.5" />
                <line x1="125" y1="25" x2="125" y2="90" stroke="#3b82f6" strokeWidth="1.5" />
                <path d="M 50,45 L 110,45" stroke="#60a5fa" strokeWidth="1" strokeDasharray="3 3" opacity="0.8" />
                <path d="M 50,55 L 110,55" stroke="#60a5fa" strokeWidth="1" strokeDasharray="3 3" opacity="0.8" />

                {/* Cab back connector */}
                <path d="M 130,85 L 140,85" stroke="#94a3b8" strokeWidth="2.5" />
                
                {/* Cab block (Electric Violet outline with translucent fill) */}
                <path d="M 140,90 L 140,45 L 165,45 C 165,45 170,45 173,50 L 183,68 C 185,72 186,75 186,80 L 186,90 Z" fill="rgba(139, 92, 246, 0.08)" stroke="#8b5cf6" strokeWidth="2.5" />
                {/* Cab window (Glowing Neon Cyan glass) */}
                <path d="M 152,52 L 165,52 L 175,68 L 152,68 Z" fill="rgba(6, 182, 212, 0.2)" stroke="#06b6d4" strokeWidth="2.5" />
                
                {/* Cab wheel arch */}
                <path d="M 164,90 C 164,83 176,83 176,90" fill="none" stroke="#64748b" strokeWidth="2.5" />
                
                {/* Trailer wheel arches */}
                <path d="M 32,90 C 32,83 44,83 44,90" fill="none" stroke="#475569" strokeWidth="2.5" />
                <path d="M 46,90 C 46,83 58,83 58,90" fill="none" stroke="#475569" strokeWidth="2.5" />
                <path d="M 112,90 C 112,83 124,83 124,90" fill="none" stroke="#475569" strokeWidth="2.5" />
                
                {/* Wheels (Rubber Charcoal tires, Metallic Slate hubs) */}
                <circle cx="38" cy="95" r="8" fill="#334155" />
                <circle cx="38" cy="95" r="3" fill="#cbd5e1" />
                
                <circle cx="52" cy="95" r="8" fill="#334155" />
                <circle cx="52" cy="95" r="3" fill="#cbd5e1" />
                
                <circle cx="118" cy="95" r="8" fill="#334155" />
                <circle cx="118" cy="95" r="3" fill="#cbd5e1" />
                
                <circle cx="170" cy="95" r="8" fill="#334155" />
                <circle cx="170" cy="95" r="3" fill="#cbd5e1" />
                
                {/* Exhaust Pipe (Silver Chrome) */}
                <path d="M 142,45 L 142,20 L 145,18" stroke="#cbd5e1" strokeWidth="2" />
                
                {/* Fuel tank (Polished Steel) */}
                <rect x="75" y="90" width="22" height="8" rx="2" fill="#475569" stroke="#94a3b8" strokeWidth="1.5" />
              </g>
            </svg>
          </div>
        </motion.div>

      </div>
    </section>
  );
};
export default Hero;
