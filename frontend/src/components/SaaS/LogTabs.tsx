import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';
import type { DriverLogData } from '../DriverDailyLog/types';

interface LogTabsProps {
  dailyLogs: DriverLogData[];
  selectedDayIdx: number;
  onSelectDay: (idx: number) => void;
}

export const LogTabs: React.FC<LogTabsProps> = ({
  dailyLogs,
  selectedDayIdx,
  onSelectDay
}) => {
  // Helper to format date cleanly
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr + 'T00:00:00');
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

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

  // Check if a specific day has violations
  const hasDayViolations = (log: DriverLogData) => {
    const { driving, onDuty } = getStatusTotals(log.intervals);
    const dutyHrs = driving + onDuty;
    return driving > 11.0 || dutyHrs > 14.0;
  };

  return (
    <div className="flex flex-col gap-4 text-left">
      <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-1">
        <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
          <Calendar className="w-4 h-4" />
        </div>
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-white">
          Generated Daily Logs
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3.5">
        {dailyLogs.map((log, idx) => {
          const isSelected = idx === selectedDayIdx;
          const { driving: driveHrs, onDuty: onDutyHrs } = getStatusTotals(log.intervals);
          const dutyHrs = driveHrs + onDutyHrs;
          const hasViolation = hasDayViolations(log);

          return (
            <motion.div
              key={idx}
              whileHover={{ y: -2, scale: 1.01 }}
              onClick={() => onSelectDay(idx)}
              className={`border rounded-2xl p-4 flex flex-col items-start justify-between cursor-pointer relative overflow-hidden transition-all duration-300 ${
                isSelected
                  ? 'border-blue-500 dark:border-blue-500 bg-blue-50/20 dark:bg-blue-950/15 shadow-md shadow-blue-100/50 dark:shadow-none'
                  : 'border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm shadow-slate-100/40 dark:shadow-none hover:border-slate-300 dark:hover:border-slate-800/80 hover:bg-slate-50/20 dark:hover:bg-slate-900/40'
              }`}
            >
              {/* Selected left indicator bar */}
              {isSelected && (
                <div className="absolute left-0 top-0 h-full w-1.5 bg-blue-500" />
              )}

              {/* Day title & Compliance Badge */}
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <FileText className={`w-4.5 h-4.5 ${isSelected ? 'text-blue-500' : 'text-slate-400'}`} />
                  <span className="text-xs font-black text-slate-900 dark:text-white">
                    Day {idx + 1}
                  </span>
                </div>
                
                {/* Status Badge */}
                {hasViolation ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-extrabold uppercase">
                    <AlertTriangle className="w-2.5 h-2.5" />
                    <span>Violation</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-extrabold uppercase">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    <span>Compliant</span>
                  </span>
                )}
              </div>

              {/* Date details */}
              <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 mt-2 font-mono uppercase tracking-wider">
                {formatDate(log.date || '')}
              </div>

              {/* Day stats grid */}
              <div className="grid grid-cols-2 gap-4 w-full mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/60 text-slate-500 dark:text-slate-400">
                <div>
                  <div className="text-[9px] font-bold uppercase text-slate-400 dark:text-slate-600">Driving</div>
                  <div className="text-[11px] font-bold font-mono mt-0.5 text-slate-800 dark:text-slate-300">
                    {driveHrs.toFixed(1)} hrs
                  </div>
                </div>
                <div>
                  <div className="text-[9px] font-bold uppercase text-slate-400 dark:text-slate-600">On Duty</div>
                  <div className="text-[11px] font-bold font-mono mt-0.5 text-slate-800 dark:text-slate-300">
                    {dutyHrs.toFixed(1)} hrs
                  </div>
                </div>
              </div>

            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
