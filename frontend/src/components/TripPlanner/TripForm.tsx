import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, ChevronDown, ChevronUp, MapPin, Loader2 } from 'lucide-react';

interface LocationInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
  placeholder: string;
  required?: boolean;
}

// Custom autocomplete input component for geocoding Indian locations
const LocationInput: React.FC<LocationInputProps> = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false
}) => {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced geocoding query
  useEffect(() => {
    if (!showDropdown || !value || value.length < 3) {
      setSuggestions([]);
      return;
    }


    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:8000/api/suggest-locations/?q=${encodeURIComponent(value)}`);
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data);
        }
      } catch (err) {
        console.error("Suggestions fetch error:", err);
      } finally {
        setLoading(false);
      }
    }, 450); // 450ms debounce window

    return () => clearTimeout(timer);
  }, [value]);

  // Click outside listener to dismiss suggestions dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col gap-1 relative" ref={dropdownRef}>
      <label className="text-[10px] font-bold uppercase text-slate-500">{label}</label>
      <div className="relative flex items-center">
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(name, e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          required={required}
          placeholder={placeholder}
          className="w-full border border-slate-300 rounded-lg pl-8 pr-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white"
        />
        <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5" />
        {loading && <Loader2 className="w-3.5 h-3.5 text-slate-500 absolute right-3 animate-spin" />}
      </div>

      {/* Suggestion Dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute top-[52px] left-0 w-full bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto divide-y divide-slate-100">
          {suggestions.map((sug, idx) => (
            <div
              key={idx}
              onClick={() => {
                onChange(name, sug.display_name);
                setShowDropdown(false);
              }}
              className="px-3 py-2 hover:bg-slate-50 text-[11px] text-slate-700 cursor-pointer font-medium truncate"
              title={sug.display_name}
            >
              {sug.display_name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface TripFormProps {
  onSubmit: (formData: any) => void;
  isLoading: boolean;
}

export const TripForm: React.FC<TripFormProps> = ({ onSubmit, isLoading }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [formData, setFormData] = useState({
    current_location: 'Mumbai, Maharashtra, India',
    pickup_location: 'Pune, Maharashtra, India',
    dropoff_location: 'Bengaluru, Karnataka, India',
    cycle_hours: '45.0',
    start_date: new Date().toISOString().split('T')[0],
    
    // Indian road transport defaults
    carrierName: 'Indian Roadlines Logistics Ltd.',
    mainOfficeAddress: 'Plot 42, Sector 10, Kalamboli, Navi Mumbai, MH 410218',
    homeTerminalAddress: 'Navi Mumbai Hub, Kalamboli, MH',
    truckTractorNumber: 'NL-01-A-4832', // National permit truck
    trailerNumber: 'MH-43-XY-9081',
    licensePlate: 'MH-43-XY-9081',
    odometerStart: '124500',
    shipper: 'Tata Steel Ltd.',
    commodity: 'Industrial Castings & Plates',
    driverName: 'Rajesh Kumar',
    shippingDocs: 'E-Way Bill #84920831', // Standard Indian GST Shipping Doc
  });

  const handleLocationChange = (name: string, val: string) => {
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      carrierName: 'Indian Roadlines Logistics Ltd.',
      mainOfficeAddress: 'Plot 42, Sector 10, Kalamboli, Navi Mumbai, MH 410218',
      homeTerminalAddress: 'Navi Mumbai Hub, Kalamboli, MH',
      truckTractorNumber: 'NL-01-A-4832',
      trailerNumber: 'MH-43-XY-9081',
      licensePlate: 'MH-43-XY-9081',
      odometerStart: '124500',
      shipper: 'Tata Steel Ltd.',
      commodity: 'Industrial Castings & Plates',
      driverName: 'Rajesh Kumar',
      shippingDocs: 'E-Way Bill #84920831',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2 mb-4">
        Trip Parameters (India Centric)
      </h2>

      <div className="flex flex-col gap-4">
        {/* Current Location Input */}
        <LocationInput
          label="Current Location (Start)"
          name="current_location"
          value={formData.current_location}
          onChange={handleLocationChange}
          required
          placeholder="Type to search e.g. Mumbai"
        />

        {/* Pickup Location Input */}
        <LocationInput
          label="Pickup Location (Loading)"
          name="pickup_location"
          value={formData.pickup_location}
          onChange={handleLocationChange}
          required
          placeholder="Type to search e.g. Pune"
        />

        {/* Dropoff Location Input */}
        <LocationInput
          label="Dropoff Location (Drop)"
          name="dropoff_location"
          value={formData.dropoff_location}
          onChange={handleLocationChange}
          required
          placeholder="Type to search e.g. Bengaluru"
        />

        {/* Cycle Hours & Start Date */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase text-slate-500">Cycle (Hrs Used)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="70"
              name="cycle_hours"
              value={formData.cycle_hours}
              onChange={handleTextChange}
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
              onChange={handleTextChange}
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
                  onChange={handleTextChange}
                  className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-[11px] bg-slate-50 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold uppercase text-slate-400">Truck / Tractor No.</label>
                  <input
                    type="text"
                    name="truckTractorNumber"
                    value={formData.truckTractorNumber}
                    onChange={handleTextChange}
                    className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-[11px] bg-slate-50 focus:bg-white focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold uppercase text-slate-400">Trailer No.</label>
                  <input
                    type="text"
                    name="trailerNumber"
                    value={formData.trailerNumber}
                    onChange={handleTextChange}
                    className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-[11px] bg-slate-50 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold uppercase text-slate-400">License Plate No.</label>
                  <input
                    type="text"
                    name="licensePlate"
                    value={formData.licensePlate}
                    onChange={handleTextChange}
                    className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-[11px] bg-slate-50 focus:bg-white focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold uppercase text-slate-400">Odometer Start (km)</label>
                  <input
                    type="number"
                    name="odometerStart"
                    value={formData.odometerStart}
                    onChange={handleTextChange}
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
                  onChange={handleTextChange}
                  className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-[11px] bg-slate-50 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold uppercase text-slate-400">GST Regd. Office Address</label>
                <input
                  type="text"
                  name="mainOfficeAddress"
                  value={formData.mainOfficeAddress}
                  onChange={handleTextChange}
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
                    onChange={handleTextChange}
                    className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-[11px] bg-slate-50 focus:bg-white focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold uppercase text-slate-400">Commodity</label>
                  <input
                    type="text"
                    name="commodity"
                    value={formData.commodity}
                    onChange={handleTextChange}
                    className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-[11px] bg-slate-50 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold uppercase text-slate-400">Shipping Document (E-Way Bill / LR No.)</label>
                <input
                  type="text"
                  name="shippingDocs"
                  value={formData.shippingDocs}
                  onChange={handleTextChange}
                  className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-[11px] bg-slate-50 focus:bg-white focus:outline-none"
                />
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
