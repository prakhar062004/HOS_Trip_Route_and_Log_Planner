import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, AlertTriangle, ShieldCheck } from 'lucide-react';
import type { DriverLogData } from '../DriverDailyLog/types';

interface AnalyticsProps {
  log: DriverLogData;
}

export const Analytics: React.FC<AnalyticsProps> = ({ log }) => {
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

  // Percentage calculations
  const drivePercent = Math.min(100, (driving / 11) * 100);
  const dutyPercent = Math.min(100, (totalDuty / 14) * 100);

  // SVG Radial properties
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffsetDrive = (2 * Math.PI * (radius - 8)) - (drivePercent / 100) * (2 * Math.PI * (radius - 8));
  const strokeDashoffsetDuty = circumference - (dutyPercent / 100) * circumference;

  // Status allocations out of 24 hours
  const statusItems = [
    { label: 'Off Duty (OFF)', hours: offDuty, color: 'bg-slate-400 dark:bg-slate-600', text: 'text-slate-500' },
    { label: 'Sleeper Berth (SB)', hours: sleeper, color: 'bg-indigo-600 dark:bg-indigo-500', text: 'text-indigo-600 dark:text-indigo-400' },
    { label: 'Driving (D)', hours: driving, color: 'bg-blue-600 dark:bg-blue-500', text: 'text-blue-600 dark:text-blue-400' },
    { label: 'On Duty (ND)', hours: onDuty, color: 'bg-emerald-600 dark:bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut', delay: 0.25 }}
      className="w-full border border-slate-200 dark:border-slate-800/50 bg-white dark:bg-slate-900 rounded-3xl p-5 md:p-6 shadow-md shadow-slate-100 dark:shadow-none transition-colors duration-300"
    >
      {/* Section Header */}
      <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-5">
        <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
          <BarChart3 className="w-4 h-4" />
        </div>
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-white">
          HOS Day Analytics
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        
        {/* Left: Dual Radial SVG Wheels (4 columns) */}
        <div className="md:col-span-5 flex flex-col items-center justify-center relative py-2">
          <svg className="w-40 h-40 transform -rotate-90 drop-shadow-md" viewBox="0 0 100 100">
            {/* Outer ring (14h duty limit) track */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              className="stroke-slate-100 dark:stroke-slate-800 fill-none"
              strokeWidth="5"
            />
            {/* Outer ring actual fill */}
            <motion.circle
              cx="50"
              cy="50"
              r={radius}
              className="stroke-emerald-500 dark:stroke-emerald-400 fill-none"
              strokeWidth="5"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: strokeDashoffsetDuty }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              strokeLinecap="round"
            />

            {/* Inner ring (11h driving limit) track */}
            <circle
              cx="50"
              cy="50"
              r={radius - 8}
              className="stroke-slate-100 dark:stroke-slate-800 fill-none"
              strokeWidth="5"
            />
            {/* Inner ring actual fill */}
            <motion.circle
              cx="50"
              cy="50"
              r={radius - 8}
              className="stroke-blue-600 dark:stroke-blue-400 fill-none"
              strokeWidth="5"
              strokeDasharray={2 * Math.PI * (radius - 8)}
              initial={{ strokeDashoffset: 2 * Math.PI * (radius - 8) }}
              animate={{ strokeDashoffset: strokeDashoffsetDrive }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
              strokeLinecap="round"
            />
          </svg>

          {/* Centered dial labels */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-xl font-black text-slate-900 dark:text-white font-mono">
              {totalDuty.toFixed(1)}
            </span>
            <span className="text-[8px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
              Total Duty
            </span>
          </div>

          {/* Legends */}
          <div className="flex gap-4 mt-3 text-[9px] font-bold uppercase tracking-wider">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <span className="text-slate-600 dark:text-slate-400">Driving ({drivePercent.toFixed(0)}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-slate-600 dark:text-slate-400">Duty ({dutyPercent.toFixed(0)}%)</span>
            </div>
          </div>
        </div>

        {/* Right: Allocation breakdown progress gauges (7 columns) */}
        <div className="md:col-span-7 flex flex-col gap-4 text-left">
          <div className="flex flex-col gap-3">
            {statusItems.map((item, idx) => {
              const share = Math.round((item.hours / 24) * 100);
              
              return (
                <div key={idx} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="text-slate-700 dark:text-slate-300">{item.label}</span>
                    <span className={item.text}>{item.hours.toFixed(1)} hrs ({share}%)</span>
                  </div>
                  
                  {/* Gauge bar */}
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200/10 dark:border-slate-700/10">
                    <motion.div
                      className={`h-full ${item.color} rounded-full`}
                      initial={{ width: 0 }}
                      animate={{ width: `${share}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut', delay: idx * 0.05 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom quick tip banner */}
          <div className="flex items-start gap-2 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-200/30 dark:border-slate-800/30 text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium mt-1">
            {driving > 11.0 || totalDuty > 14.0 ? (
              <>
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span className="text-rose-700 dark:text-rose-400 font-semibold">
                  HOS Limits Exceeded! Exceeded 11h driving or 14h duty hours today. Take required rest.
                </span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
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
