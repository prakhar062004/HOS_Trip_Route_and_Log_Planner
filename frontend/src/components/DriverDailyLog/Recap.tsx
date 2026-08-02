import React from 'react';
import type { DriverLogData } from './types';

import { calculateHours } from './utils/calculateHours';
import { calculateRecap } from './utils/hosCalculations';
import { ShieldCheck, AlertTriangle, Calendar } from 'lucide-react';

interface RecapProps {
  data: DriverLogData;
  onChange: (updates: Partial<DriverLogData>) => void;
}

export const Recap: React.FC<RecapProps> = ({ data, onChange }) => {
  // 1. Calculate today's individual hour tallies from the grid intervals
  const todayTotals = calculateHours(data.intervals);
  const todayDriving = todayTotals.DRIVING;
  const todayOnDuty = todayTotals.ON_DUTY;
  const todaySleeper = todayTotals.SLEEPER;
  const todayOffDuty = todayTotals.OFF_DUTY;

  // 2. Perform rolling recap calculations using the utility
  const recap = calculateRecap(data.recapDays, todayDriving, todayOnDuty);

  // 3. Update hours for a specific previous day (Day 1 to 7)
  const handleHoursChange = (index: number, val: string) => {
    const numHours = val === '' ? 0 : parseFloat(val);
    const updatedDays = data.recapDays.map((day, i) => {
      if (i === index) {
        return {
          ...day,
          hoursWorked: isNaN(numHours) ? 0 : Math.min(24, Math.max(0, numHours)),
        };
      }
      return day;
    });
    onChange({ recapDays: updatedDays });
  };

  // Helper to format date strings for display (e.g. "2026-08-02" -> "Aug 02")
  const formatDateLabel = (dateStr: string) => {
    try {
      const date = new Date(dateStr + 'T00:00:00'); // avoid timezone offsets
      return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="w-full border-x-2 border-b-2 border-slate-900 bg-white p-4 text-xs font-semibold text-slate-800 grid grid-cols-1 md:grid-cols-12 gap-6">
      
      {/* Column 1: Today's Hours & Compliance Summary (6 Columns) */}
      <div className="col-span-1 md:col-span-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-1.5 border-b border-slate-300 pb-2 mb-3">
            <Calendar className="w-4 h-4 text-slate-700" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Daily Summary & Compliance
            </h2>
          </div>

          {/* Today's summary grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div className="bg-slate-50 border border-slate-200 rounded p-2 text-center shadow-sm">
              <div className="text-[10px] text-slate-500 uppercase font-black">Off Duty</div>
              <div className="font-mono-grid text-base font-bold text-slate-700 mt-0.5">{todayOffDuty.toFixed(2)}</div>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded p-2 text-center shadow-sm">
              <div className="text-[10px] text-orange-500 uppercase font-black">Sleeper</div>
              <div className="font-mono-grid text-base font-bold text-orange-600 mt-0.5">{todaySleeper.toFixed(2)}</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded p-2 text-center shadow-sm">
              <div className="text-[10px] text-red-500 uppercase font-black">Driving</div>
              <div className="font-mono-grid text-base font-bold text-red-600 mt-0.5">{todayDriving.toFixed(2)}</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded p-2 text-center shadow-sm">
              <div className="text-[10px] text-green-500 uppercase font-black">On Duty</div>
              <div className="font-mono-grid text-base font-bold text-green-600 mt-0.5">{todayOnDuty.toFixed(2)}</div>
            </div>
          </div>

          {/* Core math blocks */}
          <div className="flex flex-col gap-2 border border-slate-300 rounded p-3 bg-slate-50 shadow-sm mb-4">
            <div className="flex justify-between items-center text-xs py-1 border-b border-slate-200">
              <span className="text-slate-600 font-bold">Total Duty Hours (Driving + On Duty):</span>
              <span className="font-mono-grid font-bold text-slate-900">
                {recap.todayHours.toFixed(2)} hrs
              </span>
            </div>
            <div className="flex justify-between items-center text-xs py-1 border-b border-slate-200">
              <span className="text-slate-600 font-bold">Cycle Used (Past 8 Days):</span>
              <span className={`font-mono-grid font-bold ${recap.past8DaysTotal > 70 ? 'text-red-600' : 'text-slate-900'}`}>
                {recap.past8DaysTotal.toFixed(2)} / 70 hrs
              </span>
            </div>
            <div className="flex justify-between items-center text-xs py-1 border-b border-slate-200">
              <span className="text-slate-600 font-bold">Cycle Remaining Today:</span>
              <span className="font-mono-grid font-bold text-slate-900 bg-slate-200 px-1.5 py-0.5 rounded">
                {recap.cycleRemaining.toFixed(2)} hrs
              </span>
            </div>
            <div className="flex justify-between items-center text-xs py-1">
              <span className="text-slate-600 font-bold">Hours Available Tomorrow:</span>
              <span className="font-mono-grid font-black text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                {recap.hoursAvailableTomorrow.toFixed(2)} hrs
              </span>
            </div>
          </div>
        </div>

        {/* Violations Warning Bar */}
        <div className="mt-auto">
          {recap.violations.length === 0 ? (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-lg shadow-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <h3 className="font-bold text-xs uppercase">HOS Status: Compliant</h3>
                <p className="text-[10px] text-emerald-600/90 font-medium">All daily driving limits, duty times, and 70h/8d limits are within boundaries.</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2 bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-lg shadow-sm animate-pulse">
              <div className="flex items-center gap-2 border-b border-rose-200 pb-1.5">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                <h3 className="font-bold text-xs uppercase">HOS Violations Detected</h3>
              </div>
              <ul className="list-disc pl-4 text-[10px] space-y-1 font-medium text-rose-700">
                {recap.violations.map((violation, i) => (
                  <li key={i}>{violation}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Column 2: 70-Hour Rolling HOS Recap Table (6 Columns) */}
      <div className="col-span-1 md:col-span-6">
        <div className="flex items-center justify-between border-b border-slate-300 pb-2 mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
            70-Hour / 8-Day HOS Recap
          </h2>
          <span className="text-[9px] text-slate-400 no-print">Click values in column 2 to edit history</span>
        </div>

        <div className="border border-slate-900 overflow-hidden rounded bg-slate-50 shadow-sm">
          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white text-[9px] uppercase tracking-wider font-bold">
                <th className="py-1 px-1 border-r border-slate-800">Day</th>
                <th className="py-1 px-1 border-r border-slate-800">Date</th>
                <th className="py-1 px-1 border-r border-slate-800">On Duty Hours</th>
                <th className="py-1 px-1">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300 text-[10px]">
              {data.recapDays.map((day, idx) => {
                const isToday = idx === 7;
                const displayHours = isToday ? recap.todayHours : day.hoursWorked;

                return (
                  <tr
                    key={day.date}
                    className={`font-semibold ${isToday ? 'bg-amber-50/70 border-y-2 border-amber-500 font-bold' : 'hover:bg-slate-100 transition-colors bg-white'}`}
                  >
                    {/* Day index */}
                    <td className="py-1 px-2 border-r border-slate-300 text-slate-500 font-bold">
                      {idx + 1}
                    </td>
                    
                    {/* Date label */}
                    <td className="py-1 px-2 border-r border-slate-300 font-bold">
                      {formatDateLabel(day.date)} {isToday && <span className="text-[8px] text-amber-600 block sm:inline sm:ml-1 bg-amber-100 px-1 rounded">TODAY</span>}
                    </td>
                    
                    {/* Hours input (editable for past 7 days, read-only for today) */}
                    <td className="py-1 px-2 border-r border-slate-300 font-mono-grid text-[11px]">
                      {isToday ? (
                        <span className="text-slate-950 font-black">{displayHours.toFixed(2)}</span>
                      ) : (
                        <input
                          type="number"
                          step="0.25"
                          min="0"
                          max="24"
                          value={day.hoursWorked || ''}
                          onChange={(e) => handleHoursChange(idx, e.target.value)}
                          className="w-16 text-center border-b border-transparent hover:border-slate-300 focus:border-slate-800 focus:outline-none bg-transparent py-0.5 font-bold cursor-pointer"
                        />
                      )}
                    </td>

                    {/* Auto-recap notes */}
                    <td className="py-1 px-2 text-left text-[9px] text-slate-500 max-w-[150px] truncate font-medium">
                      {isToday ? (
                        <span className="text-amber-700 font-bold">Today's active log</span>
                      ) : idx === 0 ? (
                        <span className="text-slate-400">Drops off tomorrow</span>
                      ) : (
                        <span>Historical log</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
};
