import React from 'react';
import { ShieldAlert } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="no-print w-full max-w-[1360px] mx-auto px-4 py-8 mt-12 border-t border-slate-200/50 dark:border-slate-800/50 text-slate-400 dark:text-slate-600 transition-colors duration-300">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left: copyright info */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            HOS Route Planner
          </span>
          <span className="text-[10px]">&copy; {new Date().getFullYear()} All Rights Reserved.</span>
        </div>

        {/* Center: Regulatory note */}
        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-full border border-slate-200/20 dark:border-slate-800/20 text-[9px] font-bold">
          <ShieldAlert className="w-3.5 h-3.5 text-blue-500" />
          <span>ELD compliance is subject to FMCSA CFR Title 49 rules.</span>
        </div>

        {/* Right: quick references */}
        <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider">
          <a
            href="https://fmcsa.dot.gov"
            target="_blank"
            rel="noreferrer"
            className="hover:text-slate-800 dark:hover:text-slate-300 transition-colors"
          >
            FMCSA Home
          </a>
          <a
            href="https://fmcsa.dot.gov/hours-service/elds/electronic-logging-devices"
            target="_blank"
            rel="noreferrer"
            className="hover:text-slate-800 dark:hover:text-slate-300 transition-colors"
          >
            ELD Mandate
          </a>
        </div>

      </div>
    </footer>
  );
};
