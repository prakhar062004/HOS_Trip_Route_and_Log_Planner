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
      <div className="w-full max-w-md">
        
        {/* Loading Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <Loader2 className="w-10 h-10 text-blue-600 dark:text-blue-400 animate-spin mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Compiling Compliance Schedule
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Please wait while the scheduling engines synchronize.
          </p>
        </div>

        {/* Global Progress Bar */}
        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-8 relative border border-slate-200/20 dark:border-slate-700/20">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full"
            style={{ width: `${progress}%` }}
            transition={{ ease: 'linear' }}
          />
        </div>

        {/* Step-by-Step workflow tracker */}
        <div className="flex flex-col gap-4">
          {steps.map((step, idx) => {
            const isCompleted = idx < currentStepIdx;
            const isActive = idx === currentStepIdx;
            
            return (
              <div
                key={step.id}
                className={`flex items-start gap-3.5 p-3.5 rounded-2xl border transition-all duration-300 ${
                  isActive 
                    ? 'border-blue-200 dark:border-blue-900 bg-blue-50/20 dark:bg-blue-950/10' 
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
                    <Circle className="w-4.5 h-4.5 text-slate-300 dark:text-slate-700" />
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
                  <div className={`text-[10px] mt-0.5 leading-relaxed font-medium ${
                    isActive 
                      ? 'text-slate-500 dark:text-slate-400' 
                      : isCompleted 
                        ? 'text-slate-400 dark:text-slate-500' 
                        : 'text-slate-300 dark:text-slate-700'
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
