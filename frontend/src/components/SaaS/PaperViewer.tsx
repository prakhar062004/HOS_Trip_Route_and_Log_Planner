import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ZoomIn, ZoomOut, RotateCcw, Printer, Maximize2, Minimize2, FileDown } from 'lucide-react';
import { DriverDailyLog } from '../DriverDailyLog/DriverDailyLog';
import type { DriverLogData } from '../DriverDailyLog/types';

interface PaperViewerProps {
  data: DriverLogData;
  onChange: (updatedLog: DriverLogData) => void;
  dayIdx: number;
}

export const PaperViewer: React.FC<PaperViewerProps> = ({
  data,
  onChange,
  dayIdx
}) => {
  const [zoom, setZoom] = useState(0.65);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => setZoom(z => Math.min(1.4, z + 0.05));
  const handleZoomOut = () => setZoom(z => Math.max(0.5, z - 0.05));
  const handleZoomReset = () => setZoom(0.65);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Standard ELD mock download PDF or call window.print
    window.print();
  };

  // Listen to escape key or full screen events
  useEffect(() => {
    function onFullscreenChange() {
      setIsFullscreen(!!document.fullscreenElement);
    }
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error('Error entering fullscreen:', err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div
      ref={containerRef}
      className={`w-full border border-slate-200 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-950/40 rounded-3xl flex flex-col transition-all duration-300 ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none bg-slate-950 p-6' : 'shadow-md shadow-slate-100 dark:shadow-none'
      }`}
    >
      {/* Top Toolbar */}
      <div className="no-print w-full border-b border-slate-200/60 dark:border-slate-800/60 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-4 py-3 rounded-t-3xl flex items-center justify-between gap-4 z-10 transition-colors">
        
        {/* Left: Document info */}
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-blue-500 text-white flex items-center justify-center text-[10px] font-black">
            {dayIdx + 1}
          </div>
          <span className="text-xs font-black uppercase text-slate-800 dark:text-white">
            Daily Log Sheet
          </span>
        </div>

        {/* Center: Zoom Controls */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200/50 dark:border-slate-700/50">
          <button
            onClick={handleZoomOut}
            className="w-7 h-7 rounded-md flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] font-bold font-mono px-2 text-slate-600 dark:text-slate-400 min-w-10 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="w-7 h-7 rounded-md flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1" />
          <button
            onClick={handleZoomReset}
            className="w-7 h-7 rounded-md flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
            title="Reset Zoom"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200/50 dark:border-slate-700/50 text-slate-600 dark:text-slate-300 cursor-pointer transition-all"
            title="Print Log"
          >
            <Printer className="w-4 h-4" />
          </button>
          <button
            onClick={handleDownload}
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200/50 dark:border-slate-700/50 text-slate-600 dark:text-slate-300 cursor-pointer transition-all"
            title="Export as PDF"
          >
            <FileDown className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-slate-200 dark:bg-slate-800 mx-0.5" />
          <button
            onClick={toggleFullscreen}
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200/50 dark:border-slate-700/50 text-slate-600 dark:text-slate-300 cursor-pointer transition-all"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>

      </div>

      {/* Paper Sheet Container */}
      <div className="flex-1 overflow-auto flex items-start justify-center p-4 h-[380px] relative">
        <motion.div
          style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
          transition={{ ease: 'easeOut', duration: 0.15 }}
          className="shadow-2xl shadow-slate-900/10 border border-slate-200 dark:border-transparent bg-white rounded-none no-print transition-shadow w-[1024px] flex-shrink-0"
        >
          {/* Render our dynamic FMCSA SVG log sheet */}
          <DriverDailyLog controlledLogData={data} onControlledLogDataChange={onChange} isEmbedded={true} />
        </motion.div>

        {/* Print-only viewport overlay (Leverages browser layout styling to hide toolbar and center paper on print) */}
        <div className="hidden print:block absolute inset-0 bg-white">
          <DriverDailyLog controlledLogData={data} onControlledLogDataChange={onChange} isEmbedded={true} />
        </div>
      </div>

    </div>
  );
};
