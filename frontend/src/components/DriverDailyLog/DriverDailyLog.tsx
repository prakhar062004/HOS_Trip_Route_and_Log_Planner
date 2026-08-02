import React, { useState, useEffect } from 'react';
import type { DriverLogData, LogInterval, RemarkEntry, DutyStatus, RecapDay } from './types';
import { Header } from './Header';
import { LogGrid } from './LogGrid';
import { Remarks } from './Remarks';
import { Recap } from './Recap';
import { syncRemarksWithIntervals } from './utils/slots';
import { Printer, RefreshCw, HelpCircle } from 'lucide-react';


// Helper to generate the past 8 days dates starting from a baseline date
const generateRecapDays = (baseDateStr: string): RecapDay[] => {
  const recapDays: RecapDay[] = [];
  const baseDate = new Date(baseDateStr + 'T00:00:00');
  
  // Historical sample hours for Days 1-7 to show recap roll-over
  const sampleHours = [8.5, 7.0, 9.25, 0, 8.0, 10.5, 6.75];

  for (let i = 7; i >= 0; i--) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() - i);
    const dateString = d.toISOString().split('T')[0];
    
    recapDays.push({
      date: dateString,
      hoursWorked: i === 0 ? 0 : sampleHours[7 - i] || 8.0,
      isToday: i === 0,
    });
  }
  return recapDays;
};

// Initial Mock Log Data
const getInitialData = (): DriverLogData => {
  const todayStr = new Date().toISOString().split('T')[0];
  
  const initialIntervals: LogInterval[] = [
    { start: '00:00', end: '06:00', status: 'OFF_DUTY' },
    { start: '06:00', end: '07:00', status: 'ON_DUTY' }, // Pre-trip inspection
    { start: '07:00', end: '11:30', status: 'DRIVING' }, // Morning run
    { start: '11:30', end: '12:30', status: 'ON_DUTY' }, // Fueling & Lunch
    { start: '12:30', end: '16:30', status: 'DRIVING' }, // Afternoon run
    { start: '16:30', end: '17:00', status: 'ON_DUTY' }, // Post-trip inspection
    { start: '17:00', end: '24:00', status: 'OFF_DUTY' }, // Rest
  ];

  const initialRemarks: RemarkEntry[] = [
    { id: '1', time: '06:00', status: 'ON_DUTY', location: 'Chicago, IL', text: 'Pre-Trip Inspection' },
    { id: '2', time: '07:00', status: 'DRIVING', location: 'Chicago, IL', text: 'Start driving' },
    { id: '3', time: '11:30', status: 'ON_DUTY', location: 'Indianapolis, IN', text: 'Fueling & Lunch' },
    { id: '4', time: '12:30', status: 'DRIVING', location: 'Indianapolis, IN', text: 'Resume driving' },
    { id: '5', time: '16:30', status: 'ON_DUTY', location: 'Louisville, KY', text: 'Post-Trip Inspection' },
    { id: '6', time: '17:00', status: 'OFF_DUTY', location: 'Louisville, KY', text: 'End shift / Off-duty' },
  ];

  return {
    date: todayStr,
    fromCity: 'Chicago, IL',
    toCity: 'Louisville, KY',
    carrierName: 'Interstate Freight Logistics',
    mainOfficeAddress: '500 Logistics Parkway, Chicago, IL 60611',
    homeTerminalAddress: 'Chicago Terminal #12, Chicago, IL',
    truckTractorNumber: 'TRK-905',
    trailerNumber: 'TRL-402',
    licensePlate: 'IL 948-2831',
    odometerStart: 142320,
    odometerEnd: 142690,
    totalMilesToday: 370,
    shippingDocs: 'B/L 849201-X',
    manifestNumber: '',
    shipper: 'Midwest Distribution Co.',
    commodity: 'Auto Parts & Assemblies',
    driverSignatureName: 'Alexander J. Mercer',
    driverSignatureDate: todayStr,
    intervals: initialIntervals,
    remarks: initialRemarks,
    recapDays: generateRecapDays(todayStr),
  };
};

interface DriverDailyLogProps {
  controlledLogData?: DriverLogData;
  onControlledLogDataChange?: (updatedData: DriverLogData) => void;
  isEmbedded?: boolean;
}

export const DriverDailyLog: React.FC<DriverDailyLogProps> = ({
  controlledLogData,
  onControlledLogDataChange,
  isEmbedded = false,
}) => {
  const [data, setData] = useState<DriverLogData>(controlledLogData || getInitialData());
  const [activeBrushStatus, setActiveBrushStatus] = useState<DutyStatus>('DRIVING');

  // Sync state if controlledLogData changes from parent
  useEffect(() => {
    if (controlledLogData) {
      setData(controlledLogData);
    }
  }, [controlledLogData]);

  // Synchronize recapDays dates and signature date if the primary log date changes
  useEffect(() => {
    if (!controlledLogData) {
      setData((prev) => ({
        ...prev,
        recapDays: generateRecapDays(prev.date),
        driverSignatureDate: prev.date,
      }));
    }
  }, [data.date, controlledLogData]);

  // General state update handler
  const handleDataChange = (updates: Partial<DriverLogData>) => {
    setData((prev) => {
      const merged = { ...prev, ...updates };
      
      // If intervals are updated, automatically sync the remarks list transitions
      if (updates.intervals) {
        merged.remarks = syncRemarksWithIntervals(updates.intervals, prev.remarks);
      }
      
      if (onControlledLogDataChange) {
        onControlledLogDataChange(merged);
      }
      
      return merged;
    });
  };

  // Reset log back to default sample
  const handleResetLog = () => {
    if (window.confirm('Reset all fields and drawing to initial default mock log?')) {
      setData(getInitialData());
    }
  };

  // Clear log (completely blank)
  const handleClearLog = () => {
    if (window.confirm('Clear all log entries and start with a completely empty sheet?')) {
      const todayStr = data.date;
      setData({
        date: todayStr,
        fromCity: '',
        toCity: '',
        carrierName: '',
        mainOfficeAddress: '',
        homeTerminalAddress: '',
        truckTractorNumber: '',
        trailerNumber: '',
        licensePlate: '',
        odometerStart: 0,
        odometerEnd: 0,
        totalMilesToday: 0,
        shippingDocs: '',
        manifestNumber: '',
        shipper: '',
        commodity: '',
        driverSignatureName: '',
        driverSignatureDate: todayStr,
        intervals: [{ start: '00:00', end: '24:00', status: 'OFF_DUTY' }],
        remarks: [],
        recapDays: generateRecapDays(todayStr),
      });
    }
  };

  // Trigger Print preview
  const handlePrint = () => {
    window.print();
  };

  // Core printable document layout
  const paperContent = (
    <main className="print-page w-full max-w-5xl mx-auto bg-white border border-slate-300 shadow-xl print:shadow-none print:border-none p-4 md:p-8 rounded-lg print:rounded-none flex flex-col gap-0 select-text text-slate-800">
      
      {/* Header Field Inputs */}
      <Header data={data} onChange={handleDataChange} />

      {/* 24-Hour Grid & Canvas Drawing Area */}
      <LogGrid
        intervals={data.intervals}
        onChange={(newIntervals) => handleDataChange({ intervals: newIntervals })}
        activeStatus={activeBrushStatus}
        setActiveStatus={setActiveBrushStatus}
      />

      {/* Remarks Section */}
      <Remarks data={data} onChange={handleDataChange} />

      {/* Bottom HOS Recap Panel */}
      <Recap data={data} onChange={handleDataChange} />

      {/* Signatures & Certification block */}
      <div className="w-full border-x-2 border-b-2 border-slate-900 bg-white p-4 text-xs font-semibold text-slate-800 flex flex-col md:flex-row justify-between gap-6">
        <div className="flex-1 flex flex-col justify-end text-[10px] leading-relaxed text-slate-500 font-medium">
          <p className="uppercase font-bold text-slate-700 mb-1">Driver Certification</p>
          <p>I hereby certify that these entries are true and correct and that I have recorded my duties in compliance with the Federal Motor Carrier Safety Regulations (FMCSR) part 395.</p>
        </div>
        
        <div className="flex flex-wrap gap-4 justify-between md:justify-end items-end">
          {/* Signature Line */}
          <div className="flex flex-col w-56">
            <div className="h-10 flex items-end justify-center pb-1 relative border-b border-slate-400">
              {data.driverSignatureName && (
                <span className="font-signature text-2xl text-blue-800 select-none pb-1 animate-fade-in absolute">
                  {data.driverSignatureName}
                </span>
              )}
            </div>
            <span className="text-[9px] text-slate-500 uppercase mt-1 font-bold">
              Driver's Signature (Signed)
            </span>
          </div>

          {/* Date line */}
          <div className="flex flex-col w-32">
            <div className="h-10 flex items-end justify-center pb-1 font-mono text-sm border-b border-slate-400 text-slate-800">
              {data.driverSignatureDate}
            </div>
            <span className="text-[9px] text-slate-500 uppercase mt-1 font-bold">
              Date Signed
            </span>
          </div>
        </div>
      </div>
    </main>
  );

  if (isEmbedded) {
    return paperContent;
  }

  return (
    <div className="min-h-screen bg-slate-100 py-6 px-4 sm:px-6 md:py-10 no-print-bg text-slate-800">
      
      {/* Interactive Admin Tool Belt */}
      <div className="no-print max-w-5xl mx-auto mb-6 bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-slate-900 text-white text-[10px] uppercase px-1.5 py-0.5 rounded font-black tracking-wider">
              FMCSA Compliant
            </span>
            <h2 className="text-sm font-bold text-slate-800">
              Interactive Logbook Dashboard
            </h2>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Fill in values, drag on the grid to adjust logs, then print or export directly.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end flex-wrap">
          <button
            onClick={handleResetLog}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer"
            title="Load initial pre-filled demo data"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Load Demo Log</span>
          </button>
          <button
            onClick={handleClearLog}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer"
            title="Clear all fields"
          >
            <span>Clear Grid</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-md hover:shadow transition-all cursor-pointer"
            title="Open print panel (formats automatically to A4/Letter)"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Export PDF</span>
          </button>
        </div>
      </div>

      {/* Main Paper Sheet Representation */}
      {paperContent}

      {/* Helpful Instructions footer (no-print) */}
      <footer className="no-print max-w-5xl mx-auto mt-6 text-center text-[10px] text-slate-400 font-medium flex items-center justify-center gap-1">
        <HelpCircle className="w-3.5 h-3.5" />
        <span>Double-click or drag on rows directly. To print or save, press <strong>Ctrl+P</strong>. Set margins to "None" in your printer options for the best paper-log results.</span>
      </footer>

    </div>
  );
};

export default DriverDailyLog;
