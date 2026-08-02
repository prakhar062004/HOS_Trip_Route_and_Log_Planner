import React from 'react';
import type { DriverLogData } from './types';


interface HeaderProps {
  data: DriverLogData;
  onChange: (updates: Partial<DriverLogData>) => void;
}

export const Header: React.FC<HeaderProps> = ({ data, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Parse numeric fields
    if (['odometerStart', 'odometerEnd', 'totalMilesToday'].includes(name)) {
      const numVal = value === '' ? 0 : parseFloat(value);
      const updates: Partial<DriverLogData> = { [name]: isNaN(numVal) ? 0 : numVal };
      
      // Auto-compute total miles today if start/end change
      if (name === 'odometerStart' && !isNaN(numVal)) {
        updates.totalMilesToday = Math.max(0, data.odometerEnd - numVal);
      } else if (name === 'odometerEnd' && !isNaN(numVal)) {
        updates.totalMilesToday = Math.max(0, numVal - data.odometerStart);
      }
      
      onChange(updates);
    } else {
      onChange({ [name]: value });
    }
  };

  return (
    <div className="w-full border-2 border-slate-900 bg-white p-4 text-xs font-semibold text-slate-800 select-none">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-center justify-between border-b-2 border-slate-900 pb-3 mb-4 gap-2">
        <div className="text-center md:text-left">
          <h1 className="text-xl md:text-2xl font-bold tracking-wider text-slate-900 uppercase">
            Driver's Daily Log
          </h1>
          <p className="text-[9px] uppercase tracking-wider text-slate-500 font-medium">
            Form MCS-59 — Prescribed by Federal Motor Carrier Safety Administration (FMCSA)
          </p>
        </div>
        <div className="flex items-center gap-2 border border-slate-900 p-2 rounded bg-slate-50">
          <label className="text-[10px] uppercase font-bold tracking-wider text-slate-700">Date:</label>
          <input
            type="date"
            name="date"
            value={data.date}
            onChange={handleChange}
            className="border border-slate-300 rounded px-2 py-1 bg-white font-mono text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>
      </div>

      {/* Row 1: Carrier & Address Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="flex flex-col">
          <input
            type="text"
            name="carrierName"
            value={data.carrierName}
            onChange={handleChange}
            placeholder="Carrier Name"
            className="border-b border-slate-400 font-mono text-sm py-0.5 focus:outline-none focus:border-slate-900 bg-transparent placeholder-slate-300"
          />
          <span className="text-[9px] text-slate-500 uppercase mt-0.5 font-bold">Name of Carrier</span>
        </div>
        <div className="flex flex-col">
          <input
            type="text"
            name="mainOfficeAddress"
            value={data.mainOfficeAddress}
            onChange={handleChange}
            placeholder="City, State, Zip"
            className="border-b border-slate-400 font-mono text-sm py-0.5 focus:outline-none focus:border-slate-900 bg-transparent placeholder-slate-300"
          />
          <span className="text-[9px] text-slate-500 uppercase mt-0.5 font-bold">Main Office Address</span>
        </div>
        <div className="flex flex-col">
          <input
            type="text"
            name="homeTerminalAddress"
            value={data.homeTerminalAddress}
            onChange={handleChange}
            placeholder="Home Terminal City, State"
            className="border-b border-slate-400 font-mono text-sm py-0.5 focus:outline-none focus:border-slate-900 bg-transparent placeholder-slate-300"
          />
          <span className="text-[9px] text-slate-500 uppercase mt-0.5 font-bold">Home Terminal Address</span>
        </div>
      </div>

      {/* Row 2: Origin, Destination, Odometer, License */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div className="flex flex-col">
          <input
            type="text"
            name="fromCity"
            value={data.fromCity}
            onChange={handleChange}
            placeholder="City & State Abbreviation"
            className="border-b border-slate-400 font-mono text-sm py-0.5 focus:outline-none focus:border-slate-900 bg-transparent placeholder-slate-300"
          />
          <span className="text-[9px] text-slate-500 uppercase mt-0.5 font-bold">From (Start Point)</span>
        </div>
        <div className="flex flex-col">
          <input
            type="text"
            name="toCity"
            value={data.toCity}
            onChange={handleChange}
            placeholder="City & State Abbreviation"
            className="border-b border-slate-400 font-mono text-sm py-0.5 focus:outline-none focus:border-slate-900 bg-transparent placeholder-slate-300"
          />
          <span className="text-[9px] text-slate-500 uppercase mt-0.5 font-bold">To (Destination / Turnpoint)</span>
        </div>
        <div className="flex flex-col">
          <input
            type="text"
            name="licensePlate"
            value={data.licensePlate}
            onChange={handleChange}
            placeholder="e.g. CA 12345"
            className="border-b border-slate-400 font-mono text-sm py-0.5 focus:outline-none focus:border-slate-900 bg-transparent placeholder-slate-300"
          />
          <span className="text-[9px] text-slate-500 uppercase mt-0.5 font-bold">License Plate (State & No.)</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col">
            <input
              type="number"
              name="odometerStart"
              value={data.odometerStart || ''}
              onChange={handleChange}
              placeholder="0"
              className="border-b border-slate-400 font-mono text-sm py-0.5 focus:outline-none focus:border-slate-900 text-right bg-transparent placeholder-slate-300"
            />
            <span className="text-[8px] text-slate-500 uppercase mt-0.5 font-bold">Odo Start</span>
          </div>
          <div className="flex flex-col">
            <input
              type="number"
              name="odometerEnd"
              value={data.odometerEnd || ''}
              onChange={handleChange}
              placeholder="0"
              className="border-b border-slate-400 font-mono text-sm py-0.5 focus:outline-none focus:border-slate-900 text-right bg-transparent placeholder-slate-300"
            />
            <span className="text-[8px] text-slate-500 uppercase mt-0.5 font-bold">Odo End</span>
          </div>
          <div className="flex flex-col">
            <input
              type="number"
              name="totalMilesToday"
              value={data.totalMilesToday || ''}
              onChange={handleChange}
              placeholder="0"
              className="border-b border-slate-400 font-mono text-sm py-0.5 focus:outline-none focus:border-slate-900 text-right bg-transparent placeholder-slate-300"
            />
            <span className="text-[8px] text-slate-500 uppercase mt-0.5 font-bold font-bold text-red-600">Total Miles</span>
          </div>
        </div>
      </div>

      {/* Row 3: Truck, Trailer, Drivers names */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="flex flex-col">
          <input
            type="text"
            name="truckTractorNumber"
            value={data.truckTractorNumber}
            onChange={handleChange}
            placeholder="Tractor No."
            className="border-b border-slate-400 font-mono text-sm py-0.5 focus:outline-none focus:border-slate-900 bg-transparent placeholder-slate-300"
          />
          <span className="text-[9px] text-slate-500 uppercase mt-0.5 font-bold">Truck / Tractor No.</span>
        </div>
        <div className="flex flex-col">
          <input
            type="text"
            name="trailerNumber"
            value={data.trailerNumber}
            onChange={handleChange}
            placeholder="Trailer No(s)."
            className="border-b border-slate-400 font-mono text-sm py-0.5 focus:outline-none focus:border-slate-900 bg-transparent placeholder-slate-300"
          />
          <span className="text-[9px] text-slate-500 uppercase mt-0.5 font-bold">Trailer Number(s)</span>
        </div>
        <div className="flex flex-col">
          <input
            type="text"
            name="driverSignatureName"
            value={data.driverSignatureName}
            onChange={handleChange}
            placeholder="Full Name"
            className="border-b border-slate-400 font-mono text-sm py-0.5 focus:outline-none focus:border-slate-900 bg-transparent placeholder-slate-300"
          />
          <span className="text-[9px] text-slate-500 uppercase mt-0.5 font-bold">Driver Name (Print)</span>
        </div>
        <div className="flex flex-col">
          <input
            type="text"
            name="manifestNumber"
            value={data.manifestNumber}
            onChange={handleChange}
            placeholder="Co-Driver Name"
            className="border-b border-slate-400 font-mono text-sm py-0.5 focus:outline-none focus:border-slate-900 bg-transparent placeholder-slate-300"
          />
          <span className="text-[9px] text-slate-500 uppercase mt-0.5 font-bold">Co-Driver Name (If Any)</span>
        </div>
      </div>
    </div>
  );
};
