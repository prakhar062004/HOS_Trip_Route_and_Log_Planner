import React from 'react';
import { motion } from 'framer-motion';
import { Navigation, Box, Fuel, Moon } from 'lucide-react';

interface Stop {
  id: string;
  status: string;
  location: string;
  description: string;
  startTime: string;
  endTime: string;
  durationHours: number;
}

interface TimelineProps {
  stops: Stop[];
}

export const Timeline: React.FC<TimelineProps> = ({ stops }) => {
  const getIcon = (status: string, desc: string) => {
    const d = desc.toLowerCase();
    if (d.includes('pickup') || d.includes('loading')) return Box;
    if (d.includes('fuel')) return Fuel;
    if (status === 'SLEEPER' || status === 'OFF_DUTY') return Moon;
    return Navigation;
  };

  const getColorClass = (status: string, desc: string) => {
    const d = desc.toLowerCase();
    if (d.includes('pickup')) return 'bg-emerald-500 text-white';
    if (d.includes('fuel')) return 'bg-amber-500 text-white';
    if (status === 'SLEEPER' || status === 'OFF_DUTY') return 'bg-indigo-600 text-white';
    return 'bg-blue-500 text-white';
  };


  // Helper to format stop hours/dates cleanly
  const formatTime = (timeStr: string) => {
    try {
      const dt = new Date(timeStr);
      return dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch {
      return timeStr.split(' ')[1] || timeStr;
    }
  };

  const formatDate = (timeStr: string) => {
    try {
      const dt = new Date(timeStr);
      return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
      className="w-full border border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-slate-900 rounded-3xl p-5 md:p-6 shadow-lg shadow-slate-100/40 dark:shadow-none transition-colors duration-300"
    >
      <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/50 pb-3 mb-5">
        <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
          <Navigation className="w-4 h-4" />
        </div>
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-white">
          HOS Trip Stops Timeline
        </h3>
      </div>

      <div className="relative border-l border-slate-200 dark:border-slate-800 ml-4 pl-7 space-y-6 text-left">
        {stops.map((stop, idx) => {
          const IconComp = getIcon(stop.status, stop.description);
          const colorClass = getColorClass(stop.status, stop.description);
          const timeStart = formatTime(stop.startTime);
          const timeEnd = formatTime(stop.endTime);
          const dateLabel = formatDate(stop.startTime);

          return (
            <motion.div
              key={stop.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="relative group"
            >
              {/* Timeline indicator node */}
              <div className={`absolute -left-[43px] top-0 w-8 h-8 rounded-full flex items-center justify-center shadow-md border-4 border-white dark:border-slate-900 ${colorClass} z-10 transition-transform duration-300 group-hover:scale-110`}>
                <IconComp className="w-3.5 h-3.5" />
              </div>

              {/* Connecting line overlay animation */}
              {idx < stops.length - 1 && (
                <div className="absolute -left-[30px] top-8 w-[2px] h-[calc(100%+24px)] bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-500/20 transition-colors" />
              )}

              {/* Content Panel */}
              <div className={`border border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/20 rounded-2xl p-4 transition-all duration-300 hover:border-slate-200 dark:hover:border-slate-800/80 hover:bg-slate-50/60 dark:hover:bg-slate-900/30`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      {stop.status.replace('_', ' ')}
                    </span>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white mt-0.5">
                      {stop.description}
                    </h4>
                  </div>
                  
                  {/* Transit timings */}
                  <div className="text-right">
                    <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 font-mono">
                      {timeStart} - {timeEnd}
                    </div>
                    {dateLabel && (
                      <div className="text-[9px] text-slate-400 dark:text-slate-500 font-bold mt-0.5">
                        {dateLabel}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100/50 dark:border-slate-800/50">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                    📍 {stop.location}
                  </span>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold font-mono">
                    {stop.durationHours.toFixed(1)} hrs
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
