import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle2, Circle } from 'lucide-react';

const steps = [
  { id: 1, label: 'Finding Route...', desc: 'Resolving geocoding via OpenStreetMap Nominatim' },
  { id: 2, label: 'Calculating Stops...', desc: 'Sourcing path coordinates & distances from OSRM' },
  { id: 3, label: 'Generating Hours of Service...', desc: 'Applying FMCSA 11h/14h/70h duty cycle limits' },
  { id: 4, label: 'Drawing FMCSA Log Sheets...', desc: 'Mapping duty timelines into scanned-paper daily SVGs' },
  { id: 5, label: 'Preparing PDF & Analytics...', desc: 'Calculating recaps & formatting document viewer' },
];

export const LoadingState: React.FC = () => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [progress, setProgress] = useState(0);

  // Animate steps and progress bar
  useEffect(() => {
    const stepDuration = 700; // time per step in ms
    const intervalTime = 50;  // progress bar tick in ms
    const totalDuration = stepDuration * steps.length;
    let elapsed = 0;

    const timer = setInterval(() => {
      elapsed += intervalTime;
      const calculatedProgress = Math.min(100, (elapsed / totalDuration) * 100);
      setProgress(calculatedProgress);

      const currentStep = Math.min(steps.length - 1, Math.floor((calculatedProgress / 100) * steps.length));
      setCurrentStepIdx(currentStep);

      if (elapsed >= totalDuration) {
        clearInterval(timer);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full flex flex-col items-center justify-center border border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-12 shadow-lg"
    >
      <div className="w-full max-w-md flex flex-col items-center">
        
        {/* Radar Sweeper Visual Indicator */}
        <div className="relative w-28 h-28 rounded-full border border-blue-500/20 dark:border-blue-400/25 bg-slate-950 flex items-center justify-center overflow-hidden mb-6 shadow-inner shadow-blue-500/10">
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes radarSweep {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            .radar-hand {
              position: absolute;
              inset: 0px;
              border-radius: 9999px;
              background: conic-gradient(from 0deg, rgba(59, 130, 246, 0.4) 0%, rgba(59, 130, 246, 0) 45%);
              transform-origin: 50% 50%;
              animation: radarSweep 2.5s linear infinite;
              pointer-events: none;
              z-index: 5;
            }
          `}} />
          
          {/* Sweeping radar hand */}
          <div className="radar-hand" />
          
          {/* Internal target grids */}
          <div className="absolute w-20 h-20 rounded-full border border-blue-500/10 dark:border-blue-400/10" />
          <div className="absolute w-12 h-12 rounded-full border border-blue-500/10 dark:border-blue-400/10" />
          <div className="absolute w-6 h-6 rounded-full border border-blue-500/5 dark:border-blue-400/5" />
          
          {/* Radar target axes */}
          <div className="absolute w-full h-[0.5px] bg-blue-500/10 dark:bg-blue-400/10" />
          <div className="absolute h-full w-[0.5px] bg-blue-500/10 dark:bg-blue-400/10" />
          
          {/* Geocoding blip 1 (OSRM node) */}
          <div className="absolute top-1/4 left-1/3 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-md shadow-emerald-500 animate-ping" style={{ animationDelay: '0.2s', animationDuration: '2s' }} />
          <div className="absolute top-1/4 left-1/3 w-1.5 h-1.5 rounded-full bg-emerald-500" />
          
          {/* Geocoding blip 2 (Nominatim destination) */}
          <div className="absolute bottom-1/3 right-1/4 w-1.5 h-1.5 rounded-full bg-blue-400 shadow-md shadow-blue-500 animate-ping" style={{ animationDelay: '0.8s', animationDuration: '2s' }} />
          <div className="absolute bottom-1/3 right-1/4 w-1.5 h-1.5 rounded-full bg-blue-500" />
          
          {/* Center coordinate point */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse flex items-center justify-center z-10">
            <div className="w-1.5 h-1.5 rounded-full bg-white" />
          </div>
        </div>

        {/* Loading Header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
            Compiling Compliance Schedule
          </h3>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-semibold leading-relaxed">
            Please wait while the geocoders & FMCSA limits synchronize.
          </p>
        </div>

        {/* Global Progress Bar */}
        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-6 relative border border-slate-200/20 dark:border-slate-700/20">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full"
            style={{ width: `${progress}%` }}
            transition={{ ease: 'linear' }}
          />
        </div>

        {/* Step-by-Step workflow tracker */}
        <div className="w-full flex flex-col gap-3">
          {steps.map((step, idx) => {
            const isCompleted = idx < currentStepIdx;
            const isActive = idx === currentStepIdx;
            
            return (
              <div
                key={step.id}
                className={`flex items-start gap-3 p-3 rounded-2xl border transition-all duration-300 ${
                  isActive 
                    ? 'border-blue-200 dark:border-blue-900 bg-blue-50/20 dark:bg-blue-950/10 shadow-sm shadow-blue-500/5' 
                    : isCompleted 
                      ? 'border-slate-100 dark:border-slate-800/50 opacity-80' 
                      : 'border-transparent opacity-40'
                }`}
              >
                {/* State Icon */}
                <div className="mt-0.5 shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 fill-emerald-50 dark:fill-transparent" />
                  ) : isActive ? (
                    <Loader2 className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400 animate-spin" />
                  ) : (
                    <Circle className="w-4.5 h-4.5 text-slate-350 dark:text-slate-700" />
                  )}
                </div>

                {/* Step labels */}
                <div className="flex-1 text-left">
                  <div className={`text-xs font-bold ${
                    isActive 
                      ? 'text-slate-900 dark:text-white' 
                      : isCompleted 
                        ? 'text-slate-700 dark:text-slate-300' 
                        : 'text-slate-400 dark:text-slate-600'
                  }`}>
                    {step.label}
                  </div>
                  <div className={`text-[9px] mt-0.5 leading-relaxed font-semibold ${
                    isActive 
                      ? 'text-slate-500 dark:text-slate-400' 
                      : isCompleted 
                        ? 'text-slate-400 dark:text-slate-500' 
                        : 'text-slate-350 dark:text-slate-700'
                  }`}>
                    {step.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </motion.div>
  );
};
export default LoadingState;
