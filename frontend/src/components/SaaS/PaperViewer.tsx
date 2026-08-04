import React, { useState, useRef, useEffect } from 'react';
import { Printer, Maximize2, Minimize2, FileDown } from 'lucide-react';
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [containerWidth, setContainerWidth] = useState(1024);
  const [sheetHeight, setSheetHeight] = useState(860);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  // ResizeObserver to track container width dynamically
  useEffect(() => {
    if (!resizeRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setContainerWidth(entry.contentRect.width || 1024);
      }
    });
    observer.observe(resizeRef.current);
    
    // Initial measurement of the sheet height
    if (sheetRef.current) {
      setSheetHeight(sheetRef.current.offsetHeight);
    }

    return () => observer.disconnect();
  }, []);

  // Update sheet height when data changes (e.g. remarks list grows/shrinks)
  useEffect(() => {
    if (sheetRef.current) {
      const timer = setTimeout(() => {
        if (sheetRef.current) {
          setSheetHeight(sheetRef.current.offsetHeight);
        }
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [data]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
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

  // Compute the exact zoom factor required to fit the current container width (1024px baseline)
  const computedZoom = isFullscreen 
    ? Math.min(1.4, (containerWidth - 48) / 1024) 
    : Math.min(1, containerWidth / 1024);

  return (
    <div
      ref={containerRef}
      className={`w-full border border-slate-200 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-950/40 rounded-3xl flex flex-col transition-all duration-300 ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none bg-slate-950 p-6 overflow-hidden' : 'shadow-md shadow-slate-100 dark:shadow-none'
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
          <span className="hidden sm:inline-block px-1.5 py-0.5 text-[8px] font-extrabold uppercase rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
            A4 A-Scale: {Math.round(computedZoom * 100)}%
          </span>
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

      {/* Responsive Paper Sheet Container */}
      <div 
        ref={resizeRef} 
        className={`relative w-full flex transition-all duration-300 ${
          isFullscreen 
            ? 'flex-1 overflow-y-auto justify-center p-6 bg-slate-900/50 dark:bg-slate-950/70 rounded-b-3xl' 
            : 'overflow-hidden bg-white dark:bg-slate-900 rounded-b-3xl justify-start'
        }`}
        style={isFullscreen ? { height: 'calc(100vh - 80px)' } : { height: `${sheetHeight * computedZoom}px` }}
      >
        <div
          ref={sheetRef}
          style={{ 
            transform: `scale(${computedZoom})`, 
            transformOrigin: isFullscreen ? 'top center' : 'top left',
            width: '1024px'
          }}
          className={`shadow-2xl bg-white flex-shrink-0 transition-all ${
            isFullscreen 
              ? 'relative border border-slate-200 dark:border-slate-800' 
              : 'absolute left-0 top-0 border-transparent shadow-inner'
          }`}
        >
          {/* Render our dynamic FMCSA SVG log sheet */}
          <DriverDailyLog controlledLogData={data} onControlledLogDataChange={onChange} isEmbedded={true} />
        </div>

        {/* Print-only viewport overlay */}
        <div className="hidden print:block absolute inset-0 bg-white">
          <DriverDailyLog controlledLogData={data} onControlledLogDataChange={onChange} isEmbedded={true} />
        </div>
      </div>

    </div>
  );
};
export default PaperViewer;
