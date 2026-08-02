import React, { useState } from 'react';
import { Play, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';

interface TripFormProps {
  onSubmit: (formData: any) => void;
  isLoading: boolean;
}

export const TripForm: React.FC<TripFormProps> = ({ onSubmit, isLoading }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [formData, setFormData] = useState({
    current_location: 'Chicago, IL',
    pickup_location: 'Detroit, MI',
    dropoff_location: 'Dallas, TX',
    cycle_hours: '45.0',
    start_date: new Date().toISOString().split('T')[0],
    
    // Advanced fields
    carrierName: 'Interstate Freight Logistics',
    mainOfficeAddress: '500 Logistics Parkway, Chicago, IL 60611',
    homeTerminalAddress: 'Chicago Terminal #12, Chicago, IL',
    truckTractorNumber: 'TRK-905',
    trailerNumber: 'TRL-402',
    licensePlate: 'IL 948-2831',
    odometerStart: '124500',
    shipper: 'Midwest Distribution Co.',
    commodity: 'Auto Parts & Assemblies',
    driverName: 'Alexander J. Mercer',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleReset = () => {
    setFormData({
      current_location: '',
      pickup_location: '',
      dropoff_location: '',
      cycle_hours: '0.0',
      start_date: new Date().toISOString().split('T')[0],
      carrierName: 'Interstate Freight Logistics',
      mainOfficeAddress: '500 Logistics Parkway, Chicago, IL 60611',
      homeTerminalAddress: 'Chicago Terminal #12, Chicago, IL',
      truckTractorNumber: 'TRK-905',
      trailerNumber: 'TRL-402',
      licensePlate: 'IL 948-2831',
      odometerStart: '124500',
      shipper: 'Midwest Distribution Co.',
      commodity: 'Auto Parts & Assemblies',
      driverName: 'Alexander J. Mercer',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2 mb-4">
        Trip parameters
      </h2>

      <div className="flex flex-col gap-4">
        {/* Row 1: Current location */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold uppercase text-slate-500">Current Location (Start Point)</label>
          <input
            type="text"
            name="current_location"
            value={formData.current_location}
            onChange={handleChange}
            required
            placeholder="e.g. Chicago, IL"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white"
          />
        </div>

        {/* Row 2: Pickup Location */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold uppercase text-slate-500">Pickup Location (Loading Stop)</label>
          <input
            type="text"
            name="pickup_location"
            value={formData.pickup_location}
            onChange={handleChange}
            required
            placeholder="e.g. Detroit, MI"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white"
          />
        </div>

        {/* Row 3: Dropoff Location */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold uppercase text-slate-500">Dropoff Location (Destination)</label>
          <input
            type="text"
            name="dropoff_location"
            value={formData.dropoff_location}
            onChange={handleChange}
            required
            placeholder="e.g. Dallas, TX"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white"
          />
        </div>

        {/* Row 4: Cycle Hours & Start Date */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase text-slate-500">Current Cycle (Hours Used)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="70"
              name="cycle_hours"
              value={formData.cycle_hours}
              onChange={handleChange}
              required
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white text-right font-mono"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase text-slate-500">Trip Start Date</label>
            <input
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              required
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white font-mono"
            />
          </div>
        </div>

        {/* Advanced Carrier/Driver Details */}
        <div className="border-t border-slate-100 pt-3">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center justify-between w-full text-slate-500 hover:text-slate-800 text-[10px] font-bold uppercase tracking-wider cursor-pointer"
          >
            <span>Carrier & Driver Log Info</span>
            {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showAdvanced && (
            <div className="grid grid-cols-1 gap-3 mt-3 animate-fade-in">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold uppercase text-slate-400">Driver Name</label>
                <input
                  type="text"
                  name="driverName"
                  value={formData.driverName}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-[11px] bg-slate-50 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold uppercase text-slate-400">Tractor No.</label>
                  <input
                    type="text"
                    name="truckTractorNumber"
                    value={formData.truckTractorNumber}
                    onChange={handleChange}
                    className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-[11px] bg-slate-50 focus:bg-white focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold uppercase text-slate-400">Trailer No.</label>
                  <input
                    type="text"
                    name="trailerNumber"
                    value={formData.trailerNumber}
                    onChange={handleChange}
                    className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-[11px] bg-slate-50 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold uppercase text-slate-400">License Plate</label>
                  <input
                    type="text"
                    name="licensePlate"
                    value={formData.licensePlate}
                    onChange={handleChange}
                    className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-[11px] bg-slate-50 focus:bg-white focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold uppercase text-slate-400">Odo Start</label>
                  <input
                    type="number"
                    name="odometerStart"
                    value={formData.odometerStart}
                    onChange={handleChange}
                    className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-[11px] bg-slate-50 focus:bg-white focus:outline-none text-right font-mono"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold uppercase text-slate-400">Carrier Name</label>
                <input
                  type="text"
                  name="carrierName"
                  value={formData.carrierName}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-[11px] bg-slate-50 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold uppercase text-slate-400">Office Address</label>
                <input
                  type="text"
                  name="mainOfficeAddress"
                  value={formData.mainOfficeAddress}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-[11px] bg-slate-50 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold uppercase text-slate-400">Shipper</label>
                  <input
                    type="text"
                    name="shipper"
                    value={formData.shipper}
                    onChange={handleChange}
                    className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-[11px] bg-slate-50 focus:bg-white focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold uppercase text-slate-400">Commodity</label>
                  <input
                    type="text"
                    name="commodity"
                    value={formData.commodity}
                    onChange={handleChange}
                    className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-[11px] bg-slate-50 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-3 border-t border-slate-100 pt-4 mt-2">
          <button
            type="button"
            onClick={handleReset}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-slate-300 text-slate-700 font-bold rounded-lg text-xs hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-[2] flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-900 text-white font-bold rounded-lg text-xs hover:bg-slate-800 shadow-md transition-all disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <Play className="w-3.5 h-3.5" />
            )}
            <span>{isLoading ? 'Planning...' : 'Generate HOS logs'}</span>
          </button>
        </div>
      </div>
    </form>
  );
};
