import React, { useRef } from 'react';
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

// Sub-component to manage spotlight coordinates and SVG curves individually per card
const SummaryCardItem: React.FC<{
  item: any;
  idx: number;
  cardVariants: any;
}> = ({ item, idx, cardVariants }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty('--mouse-x', `${x}px`);
    cardRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  // Unique sparkline vectors corresponding to index (100x30 viewBox)
  const sparklines = [
    // 0: Distance (Ascending ramp)
    'M 0,22 L 20,20 L 45,14 L 65,15 L 85,9 L 100,4',
    // 1: Driving Hours (Sine-wave)
    'M 0,22 Q 15,4 30,20 T 60,6 T 90,18 T 100,10',
    // 2: Fuel Stops (Pulse spikes)
    'M 0,25 L 30,25 L 33,7 L 36,25 L 68,25 L 71,7 L 74,25 L 100,25',
    // 3: Sleeper breaks (Stepping blocks)
    'M 0,20 L 25,20 L 25,12 L 50,12 L 50,22 L 75,22 L 75,15 L 100,15',
    // 4: Log Sheets (Steps upwards)
    'M 0,28 L 20,22 L 40,18 L 60,14 L 80,10 L 100,6',
    // 5: Cycle Available (Descending trend line)
    'M 0,4 L 20,10 L 40,11 L 60,18 L 80,21 L 100,25'
  ];

  const currentSparkline = sparklines[idx] || sparklines[0];

  // Pick highlight color based on the card's accent
  const glowColors = [
    'rgba(59, 130, 246, 0.08)',  // Blue
    'rgba(99, 102, 241, 0.08)',  // Indigo
    'rgba(245, 158, 11, 0.08)',  // Amber
    'rgba(16, 185, 129, 0.08)',  // Emerald
    'rgba(139, 92, 246, 0.08)',  // Violet
    'rgba(239, 68, 68, 0.08)'    // Rose
  ];
  const glowColor = glowColors[idx] || glowColors[0];


  return (
    <motion.div
      ref={cardRef}
      variants={cardVariants}
      whileHover={{ y: -3, scale: 1.01 }}
      onMouseMove={handleMouseMove}
      className="border border-slate-200 dark:border-slate-800/50 bg-white dark:bg-slate-900 rounded-2xl p-4 flex flex-col items-start text-left shadow-md shadow-slate-100 dark:shadow-none transition-colors duration-300 relative overflow-hidden group spotlight-card cursor-default select-none"
    >
      <style dangerouslySetInnerHTML={{__html: `
        .spotlight-card::before {
          content: '';
          position: absolute;
          inset: 0px;
          border-radius: inherit;
          background: radial-gradient(
            150px circle at var(--mouse-x, 0px) var(--mouse-y, 0px),
            ${glowColor},
            transparent 80%
          );
          opacity: 0;
          transition: opacity 0.3s;
          pointer-events: none;
          z-index: 10;
        }
        .spotlight-card:hover::before {
          opacity: 1;
        }
      `}} />

      {/* Accent top boundary line on hover */}
      <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10" />

      {/* Icon Badge */}
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.color} mb-3.5 relative z-10`}>
        <item.icon className="w-4 h-4" />
      </div>

      <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 relative z-10">
        {item.label}
      </div>
      
      <div className="text-lg font-black mt-1 text-slate-900 dark:text-white font-mono tracking-tight relative z-10">
        {item.value}
      </div>

      <div className="text-[9px] text-slate-500 mt-1 truncate w-full font-medium relative z-10">
        {item.desc}
      </div>

      {/* Embedded Sparkline Graphic Background (Fades in on hover) */}
      <div className="absolute bottom-0 left-0 right-0 h-10 w-full opacity-10 group-hover:opacity-25 transition-opacity duration-500 pointer-events-none z-0">
        <svg className="h-full w-full" viewBox="0 0 100 30" preserveAspectRatio="none">
          <path 
            d={currentSparkline} 
            fill="none" 
            stroke="currentColor" 
            className={item.color.split(' ')[0]}
            strokeWidth="1.25" 
            strokeLinecap="round"
          />
          <path 
            d={`${currentSparkline} L 100,30 L 0,30 Z`} 
            fill="currentColor"
            className={item.color.split(' ')[0] + ' opacity-5'}
          />
        </svg>
      </div>
    </motion.div>
  );
};

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
      desc: 'Scheduled fuel stops'
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
      desc: '24-hour log sheets created'
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
        staggerChildren: 0.04
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 sm:grid-cols-3 gap-4"
    >
      {statItems.map((item, idx) => (
        <SummaryCardItem 
          key={idx}
          item={item}
          idx={idx}
          cardVariants={cardVariants}
        />
      ))}
    </motion.div>
  );
};
export default SummaryCards;
