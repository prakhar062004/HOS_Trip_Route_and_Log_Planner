import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, AlertTriangle, ShieldCheck } from 'lucide-react';
import type { DriverLogData } from '../DriverDailyLog/types';

interface AnalyticsProps {
  log: DriverLogData;
  onChange?: (updatedLog: DriverLogData) => void;
}

export const Analytics: React.FC<AnalyticsProps> = ({ log, onChange }) => {
  // Helper to parse interval durations
  const getIntervalDuration = (start: string, end: string): number => {
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    const startTotal = startH * 60 + startM;
    const endTotal = endH * 60 + endM;
    return Math.max(0, (endTotal - startTotal) / 60);
  };

  const getStatusTotals = (intervals: any[]) => {
    let offDuty = 0;
    let sleeper = 0;
    let driving = 0;
    let onDuty = 0;

    (intervals || []).forEach((i) => {
      const duration = getIntervalDuration(i.start, i.end);
      if (i.status === 'OFF_DUTY') offDuty += duration;
      else if (i.status === 'SLEEPER') sleeper += duration;
      else if (i.status === 'DRIVING') driving += duration;
      else if (i.status === 'ON_DUTY') onDuty += duration;
    });

    return { offDuty, sleeper, driving, onDuty };
  };

  const { offDuty, sleeper, driving, onDuty } = getStatusTotals(log.intervals);
  const totalDuty = driving + onDuty;

  // Percentage calculations for HOS Daily Rules
  const drivePercent = Math.min(100, (driving / 11) * 100);
  const dutyPercent = Math.min(100, (totalDuty / 14) * 100);

  // SVG Radial properties
  const radius = 40;
  const circumference = 2 * Math.PI * radius;

  // Status allocations out of 24 hours
  const statusItems = [
    { label: 'Off Duty (OFF)', hours: offDuty, color: 'bg-slate-400 dark:bg-slate-650', text: 'text-slate-500' },
    { label: 'Sleeper Berth (SB)', hours: sleeper, color: 'bg-indigo-600 dark:bg-indigo-500', text: 'text-indigo-600 dark:text-indigo-400' },
    { label: 'Driving (D)', hours: driving, color: 'bg-blue-600 dark:bg-blue-500', text: 'text-blue-600 dark:text-blue-400' },
    { label: 'On Duty (ND)', hours: onDuty, color: 'bg-emerald-600 dark:bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' },
  ];

  // HOS Compliance Auto-Resolver Logic
  const autoResolveHOS = () => {
    if (!onChange) return;
    
    // Perform deep-clone of active intervals to avoid React state mutations
    const nextIntervals = JSON.parse(JSON.stringify(log.intervals || []));
    let totalDriving = 0;
    let totalOnDuty = 0;

    nextIntervals.forEach((i: any) => {
      const dur = getIntervalDuration(i.start, i.end);
      if (i.status === 'DRIVING') totalDriving += dur;
      else if (i.status === 'ON_DUTY') totalOnDuty += dur;
    });

    // 1. Resolve 11h Driving violations
    if (totalDriving > 11.0) {
      let excess = totalDriving - 11.0;
      // Step backwards and shrink driving segments into OFF_DUTY periods
      for (let i = nextIntervals.length - 1; i >= 0; i--) {
        if (nextIntervals[i].status === 'DRIVING') {
          const dur = getIntervalDuration(nextIntervals[i].start, nextIntervals[i].end);
          if (dur <= excess) {
            nextIntervals[i].status = 'OFF_DUTY';
            excess -= dur;
          } else {
            const [eh, em] = nextIntervals[i].end.split(':').map(Number);
            const endMin = eh * 60 + em;
            const newEndMin = endMin - Math.round(excess * 60);
            
            const splitH = Math.floor(newEndMin / 60);
            const splitM = newEndMin % 60;
            const splitTime = `${String(splitH).padStart(2, '0')}:${String(splitM).padStart(2, '0')}`;

            const offDutySeg = {
              start: splitTime,
              end: nextIntervals[i].end,
              status: 'OFF_DUTY'
            };

            nextIntervals[i].end = splitTime;
            nextIntervals.splice(i + 1, 0, offDutySeg);
            break;
          }
        }
      }
    }

    // Recompute intermediate totals to calculate duty caps
    let uDriving = 0;
    let uOnDuty = 0;
    nextIntervals.forEach((i: any) => {
      const dur = getIntervalDuration(i.start, i.end);
      if (i.status === 'DRIVING') uDriving += dur;
      else if (i.status === 'ON_DUTY') uOnDuty += dur;
    });

    const updatedTotalDuty = uDriving + uOnDuty;

    // 2. Resolve 14h Duty violations
    if (updatedTotalDuty > 14.0) {
      let excess = updatedTotalDuty - 14.0;
      // Step backwards and shrink active duty segments into OFF_DUTY periods
      for (let i = nextIntervals.length - 1; i >= 0; i--) {
        if (nextIntervals[i].status === 'DRIVING' || nextIntervals[i].status === 'ON_DUTY') {
          const dur = getIntervalDuration(nextIntervals[i].start, nextIntervals[i].end);
          if (dur <= excess) {
            nextIntervals[i].status = 'OFF_DUTY';
            excess -= dur;
          } else {
            const [eh, em] = nextIntervals[i].end.split(':').map(Number);
            const endMin = eh * 60 + em;
            const newEndMin = endMin - Math.round(excess * 60);
            
            const splitH = Math.floor(newEndMin / 60);
            const splitM = newEndMin % 60;
            const splitTime = `${String(splitH).padStart(2, '0')}:${String(splitM).padStart(2, '0')}`;

            const offDutySeg = {
              start: splitTime,
              end: nextIntervals[i].end,
              status: 'OFF_DUTY'
            };

            nextIntervals[i].end = splitTime;
            nextIntervals.splice(i + 1, 0, offDutySeg);
            break;
          }
        }
      }
    }

    // Fire log sheet updates callback
    onChange({
      ...log,
      intervals: nextIntervals
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      id="analytics-section"
      style={{ scrollMarginTop: '105px' }}
      className="w-full border border-slate-200/40 dark:border-slate-800/50 bg-white dark:bg-slate-900 rounded-3xl p-5 md:p-6 shadow-md shadow-slate-100 dark:shadow-none transition-all duration-300"
    >
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <BarChart3 className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-white">
            HOS Day Analytics
          </h3>
        </div>
        <span className="text-[8px] font-black bg-blue-500/10 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded uppercase tracking-wider">
          Compliance Dials
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        
        {/* Left: Two side-by-side circular progress gauges (5 columns) */}
        <div className="md:col-span-5 flex flex-row gap-6 justify-center items-center py-4">
          
          {/* Ring 1: Driving Limit (11 Hours) */}
          <div className="flex flex-col items-center relative group/ring cursor-default">
            {/* Ambient glow highlight */}
            <div className="absolute inset-0 bg-blue-500/5 rounded-full blur-xl scale-75 opacity-0 group-hover/ring:opacity-100 transition duration-500" />
            
            <svg className="w-24 h-24 transform -rotate-90 drop-shadow-md relative z-10" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="stroke-slate-100 dark:stroke-slate-800 fill-none"
                strokeWidth="7.5"
              />
              <motion.circle
                cx="50"
                cy="50"
                r={radius}
                className="stroke-blue-600 dark:stroke-blue-400 fill-none"
                strokeWidth="7.5"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: circumference - (drivePercent / 100) * circumference }}
                transition={{ duration: 1, ease: 'easeOut' }}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute top-[28px] flex flex-col items-center justify-center z-10 text-center select-none">
              <span className="text-base font-black text-slate-800 dark:text-white font-mono leading-none">
                {driving.toFixed(1)}h
              </span>
              <span className="text-[7px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider mt-1">
                Driving
              </span>
            </div>
            <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 mt-2 z-10 transition-colors group-hover/ring:text-blue-500">
              Limit: 11.0h
            </span>
          </div>

          {/* Ring 2: Total Duty Limit (14 Hours) */}
          <div className="flex flex-col items-center relative group/ring cursor-default">
            {/* Ambient glow highlight */}
            <div className="absolute inset-0 bg-emerald-500/5 rounded-full blur-xl scale-75 opacity-0 group-hover/ring:opacity-100 transition duration-500" />
            
            <svg className="w-24 h-24 transform -rotate-90 drop-shadow-md relative z-10" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="stroke-slate-100 dark:stroke-slate-800 fill-none"
                strokeWidth="7.5"
              />
              <motion.circle
                cx="50"
                cy="50"
                r={radius}
                className="stroke-emerald-500 dark:stroke-emerald-450 fill-none"
                strokeWidth="7.5"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: circumference - (dutyPercent / 100) * circumference }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.15 }}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute top-[28px] flex flex-col items-center justify-center z-10 text-center select-none">
              <span className="text-base font-black text-slate-800 dark:text-white font-mono leading-none">
                {totalDuty.toFixed(1)}h
              </span>
              <span className="text-[7px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider mt-1">
                On-Duty
              </span>
            </div>
            <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 mt-2 z-10 transition-colors group-hover/ring:text-emerald-500">
              Limit: 14.0h
            </span>
          </div>

        </div>

        {/* Right: Allocation breakdown progress gauges (7 columns) */}
        <div className="md:col-span-7 flex flex-col gap-4 text-left">
          <div className="flex flex-col gap-2">
            {statusItems.map((item, idx) => {
              const share = Math.round((item.hours / 24) * 100);
              
              return (
                <div 
                  key={idx} 
                  className="flex flex-col gap-1 p-1 px-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-950/60 transition-all duration-200 group/bar cursor-default"
                >
                  <div className="flex items-center justify-between text-[10px] font-bold transition-transform duration-200 group-hover/bar:translate-x-1">
                    <span className="text-slate-700 dark:text-slate-350">{item.label}</span>
                    <span className={item.text}>{item.hours.toFixed(1)} hrs ({share}%)</span>
                  </div>
                  
                  {/* Gauge bar */}
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-850 rounded-full overflow-hidden border border-slate-200/10 dark:border-slate-700/10">
                    <motion.div
                      className={`h-full ${item.color} rounded-full`}
                      initial={{ width: 0 }}
                      animate={{ width: `${share}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut', delay: idx * 0.05 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom quick tip banner */}
          <div className={`flex items-start gap-2.5 p-3.5 rounded-2xl border text-[10px] leading-relaxed font-semibold transition-all duration-300 mt-1 ${
            driving > 11.0 || totalDuty > 14.0 
              ? 'bg-rose-500/10 dark:bg-rose-950/20 border-rose-500/30 text-rose-700 dark:text-rose-400 shadow-md shadow-rose-950/10'
              : 'bg-emerald-500/10 dark:bg-emerald-950/20 border-emerald-500/30 text-slate-700 dark:text-slate-350 shadow-sm'
          }`}>
            {driving > 11.0 || totalDuty > 14.0 ? (
              <>
                <div className="relative flex items-center justify-center shrink-0 w-4 h-4 mt-0.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping absolute opacity-75" />
                  <AlertTriangle className="w-4 h-4 text-rose-500 relative z-10" />
                </div>
                <div className="flex-1 text-left flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="font-extrabold uppercase tracking-wide">
                    HOS Limits Exceeded! Exceeded 11h driving or 14h duty hours today. Rest required.
                  </span>
                  {onChange && (
                    <button
                      type="button"
                      onClick={autoResolveHOS}
                      className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-black text-[9px] uppercase tracking-wider rounded-lg shadow-sm hover:shadow transition-all shrink-0 cursor-pointer"
                    >
                      Auto-Resolve
                    </button>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="relative flex items-center justify-center shrink-0 w-4 h-4 mt-0.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping absolute opacity-75" />
                  <ShieldCheck className="w-4 h-4 text-emerald-500 relative z-10" />
                </div>
                <span>
                  All daily hours are within the 11-hour driving and 14-hour on-duty window. Compliant.
                </span>
              </>
            )}
          </div>
        </div>

      </div>
    </motion.div>
  );
};
export default Analytics;
