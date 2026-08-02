import React from 'react';
import { motion } from 'framer-motion';
import { Navigation, Clock, Fuel, Bed, FileText, Shield } from 'lucide-react';
import type { DriverLogData } from '../DriverDailyLog/types';

interface Stop {
  id: string;
  status: string;
  location: string;
  description: string;
  startTime: string;
  endTime: string;
  durationHours: number;
}

interface SummaryCardsProps {
  distance: number;
  drivingHours: number;
  stops: Stop[];
  dailyLogs: DriverLogData[];
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  distance,
  drivingHours,
  stops,
  dailyLogs
}) => {
  // Compute counts
  const fuelStopsCount = stops.filter(s => s.description.toLowerCase().includes('fuel')).length;
  const restStopsCount = stops.filter(s => s.status === 'SLEEPER' || (s.status === 'OFF_DUTY' && s.durationHours >= 9)).length;
  
  // Calculate remaining cycle hours from the last log page's recap table
  const lastLog = dailyLogs[dailyLogs.length - 1];
  let cycleRemaining = 25.0;
  if (lastLog && lastLog.recapDays) {
    const past7DaysSum = lastLog.recapDays
      .filter((d) => !d.isToday)
      .reduce((acc, d) => acc + d.hoursWorked, 0);
    cycleRemaining = Math.max(0, 70.0 - past7DaysSum);
  }

  const statItems = [
    {
      label: 'Total Distance',
      value: `${distance.toLocaleString()} mi`,
      icon: Navigation,
      color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40',
      desc: 'Route geometry total'
    },
    {
      label: 'Driving Hours',
      value: `${drivingHours.toFixed(1)} hrs`,
      icon: Clock,
      color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40',
      desc: 'Time spent in driving status'
    },
    {
      label: 'Fueling Stops',
      value: `${fuelStopsCount} stops`,
      icon: Fuel,
      color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40',
      desc: 'Scheduled every 1,000 miles'
    },
    {
      label: 'Sleeper Rests',
      value: `${restStopsCount} breaks`,
      icon: Bed,
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40',
      desc: '10-hour sleeper rests'
    },
    {
      label: 'Daily Log Sheets',
      value: `${dailyLogs.length} pages`,
      icon: FileText,
      color: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/40',
      desc: '24-hour log grids created'
    },
    {
      label: 'Cycle Available',
      value: `${cycleRemaining.toFixed(1)} hrs`,
      icon: Shield,
      color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40',
      desc: 'Rolling 70h clock remaining'
    }
  ];

  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 sm:grid-cols-3 gap-4"
    >
      {statItems.map((item, idx) => (
        <motion.div
          key={idx}
          variants={cardVariants}
          whileHover={{ y: -3, scale: 1.01 }}
          className="border border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-slate-900 rounded-2xl p-4 flex flex-col items-start text-left shadow-md shadow-slate-100/40 dark:shadow-none transition-colors duration-300 relative overflow-hidden group"
        >
          {/* Accent light highlight */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          {/* Icon Badge */}
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.color} mb-3.5`}>
            <item.icon className="w-4 h-4" />
          </div>

          <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {item.label}
          </div>
          
          <div className="text-lg font-black mt-1 text-slate-900 dark:text-white font-mono tracking-tight">
            {item.value}
          </div>

          <div className="text-[9px] text-slate-500 mt-1 truncate w-full font-medium">
            {item.desc}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};
