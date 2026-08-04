import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  RotateCcw, 
  ChevronDown, 
  ChevronUp, 
  MapPin, 
  Loader2, 
  Calendar, 
  Clock, 
  ClipboardList, 
  Shield,
  Truck,
  User as UserIcon
} from 'lucide-react';

interface LocationInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
  placeholder: string;
  required?: boolean;
  role: 'start' | 'pickup' | 'destination';
}

const LocationInput: React.FC<LocationInputProps> = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  role
}) => {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showDropdown || !value || value.length < 3) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        const response = await fetch(`${API_BASE}/api/suggest-locations/?q=${encodeURIComponent(value)}`);
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data);
        }
      } catch (err) {
        console.error("Suggestions fetch error:", err);
      } finally {
        setLoading(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [value, showDropdown]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRoleTheme = () => {
    switch (role) {
      case 'start':
        return {
          icon: 'text-blue-500 dark:text-blue-400',
          focus: 'focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400',
          glow: 'group-focus-within:bg-blue-500/10'
        };
      case 'pickup':
        return {
          icon: 'text-amber-500 dark:text-amber-400',
          focus: 'focus:ring-amber-500/20 focus:border-amber-500 dark:focus:border-amber-400',
          glow: 'group-focus-within:bg-amber-500/10'
        };
      case 'destination':
        return {
          icon: 'text-emerald-500 dark:text-emerald-400',
          focus: 'focus:ring-emerald-500/20 focus:border-emerald-500 dark:focus:border-emerald-400',
          glow: 'group-focus-within:bg-emerald-500/10'
        };
    }
  };

  const theme = getRoleTheme();

  return (
    <div className="flex flex-col gap-1 relative text-left group" ref={dropdownRef}>
      <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 transition-colors group-focus-within:text-slate-700 dark:group-focus-within:text-slate-350">
        {label}
      </label>
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
          className={`w-full border border-slate-200 dark:border-slate-800/80 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 ${theme.focus} transition-all placeholder-slate-400 dark:placeholder-slate-600 font-medium`}
        />
        <MapPin className={`w-4 h-4 ${theme.icon} absolute left-3 transition-transform duration-300 group-focus-within:scale-110`} />
        {loading && <Loader2 className="w-4 h-4 text-slate-400 absolute right-3 animate-spin" />}
      </div>

      {showDropdown && suggestions.length > 0 && (
        <div className="absolute top-[54px] left-0 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
          {suggestions.map((sug, idx) => (
            <div
              key={idx}
              onClick={() => {
                onChange(name, sug.display_name);
                setShowDropdown(false);
              }}
              className="px-3.5 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-[11px] text-slate-700 dark:text-slate-300 cursor-pointer font-medium truncate transition-colors"
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

interface TripPlannerCardProps {
  onSubmit: (formData: any) => void;
  isLoading: boolean;
}

export const TripPlannerCard: React.FC<TripPlannerCardProps> = ({ onSubmit, isLoading }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isResetHovered, setIsResetHovered] = useState(false);
  const [formData, setFormData] = useState({
    current_location: '',
    pickup_location: '',
    dropoff_location: '',
    cycle_hours: '0.0',
    start_date: new Date().toISOString().split('T')[0],
    carrierName: '',
    mainOfficeAddress: '',
    homeTerminalAddress: '',
    truckTractorNumber: '',
    trailerNumber: '',
    licensePlate: '',
    odometerStart: '',
    shipper: '',
    commodity: '',
    driverName: '',
    shippingDocs: '',
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
      carrierName: '',
      mainOfficeAddress: '',
      homeTerminalAddress: '',
      truckTractorNumber: '',
      trailerNumber: '',
      licensePlate: '',
      odometerStart: '',
      shipper: '',
      commodity: '',
      driverName: '',
      shippingDocs: '',
    });
  };

  return (
    <div className="w-full border border-slate-200 dark:border-slate-800/50 bg-white dark:bg-slate-900 rounded-3xl p-5 md:p-6 shadow-md shadow-slate-100 dark:shadow-none transition-colors duration-300">
      
      {/* Visual Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-3 mb-5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <ClipboardList className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-white">
            Trip Parameters
          </h3>
        </div>
        <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800/80 text-slate-400 dark:text-slate-500">
          FMCSA HOS
        </span>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 relative">
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes laserPulse {
            0% { transform: translateY(-100%); }
            100% { transform: translateY(300%); }
          }
          .animate-laser-pulse {
            animation: laserPulse 3s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          }
        `}} />

        {/* Connected Routing Locations (Timeline visualization with moving laser tracker) */}
        <div className="relative pl-5 border-l border-transparent ml-3.5 flex flex-col gap-5 text-left">
          
          {/* Laser Tracker Line */}
          <div className="absolute left-[-1px] top-8 bottom-8 w-[1.5px] bg-slate-200 dark:bg-slate-800/80 pointer-events-none overflow-hidden rounded-full z-0">
            <div className="w-full h-16 bg-gradient-to-b from-transparent via-blue-500 to-transparent animate-laser-pulse" />
          </div>

          {/* Start Input with pulsing Dot */}
          <div className="relative">
            <div className="absolute -left-[26px] top-[30px] w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-blue-50 dark:ring-blue-950/40 z-10 animate-pulse" />
            <LocationInput
              label="Current Location (Start)"
              name="current_location"
              value={formData.current_location}
              onChange={handleLocationChange}
              required
              placeholder="Enter starting terminal..."
              role="start"
            />
          </div>

          {/* Pickup Input with Dot */}
          <div className="relative">
            <div className="absolute -left-[26px] top-[30px] w-2.5 h-2.5 rounded-full bg-amber-500 ring-4 ring-amber-50 dark:ring-amber-950/40 z-10" />
            <LocationInput
              label="Pickup Location (Loading)"
              name="pickup_location"
              value={formData.pickup_location}
              onChange={handleLocationChange}
              required
              placeholder="Enter loading dock..."
              role="pickup"
            />
          </div>

          {/* Dropoff Input with Dot */}
          <div className="relative">
            <div className="absolute -left-[26px] top-[30px] w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-50 dark:ring-emerald-950/40 z-10" />
            <LocationInput
              label="Dropoff Location (Drop)"
              name="dropoff_location"
              value={formData.dropoff_location}
              onChange={handleLocationChange}
              required
              placeholder="Enter dropoff destination..."
              role="destination"
            />
          </div>
        </div>

        {/* Cycle Hours & Start Date */}
        <div className="grid grid-cols-2 gap-3 text-left">
          <div className="flex flex-col gap-1 relative group/field">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 group-focus-within/field:text-blue-500">
              Cycle (Hrs Used)
            </label>
            <div className="relative flex items-center">
              <input
                type="number"
                step="0.1"
                min="0"
                max="70"
                name="cycle_hours"
                value={formData.cycle_hours}
                onChange={handleTextChange}
                required
                className="w-full border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono"
              />
              <Clock className="w-4 h-4 text-slate-400 dark:text-slate-600 absolute left-3 transition-colors group-focus-within/field:text-blue-500" />
            </div>
          </div>
          <div className="flex flex-col gap-1 relative group/field">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 group-focus-within/field:text-blue-500">
              Trip Start Date
            </label>
            <div className="relative flex items-center">
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleTextChange}
                required
                className="w-full border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono"
              />
              <Calendar className="w-4 h-4 text-slate-400 dark:text-slate-600 absolute left-3 transition-colors group-focus-within/field:text-blue-500" />
            </div>
          </div>
        </div>

        {/* Advanced Carrier/Driver Details */}
        <div className="border-t border-slate-100 dark:border-slate-850 pt-4 mt-1 text-left">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center justify-between w-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-blue-500" />
              <span>Carrier & Driver Log Info</span>
            </span>
            {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          <AnimatePresence>
            {showAdvanced && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="flex flex-col gap-4 mt-4 pt-1">
                  
                  {/* Category 1: Driver & Load Info */}
                  <div className="p-3.5 bg-slate-50/50 dark:bg-slate-950/30 rounded-2xl border border-slate-150 dark:border-slate-850/80 flex flex-col gap-3">
                    <div className="flex items-center gap-1 border-b border-slate-100 dark:border-slate-850 pb-1.5 mb-1 text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      <UserIcon className="w-3 h-3 text-blue-500" />
                      <span>Driver & Cargo Details</span>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-extrabold uppercase text-slate-400 dark:text-slate-600">Driver Name</label>
                      <input
                        type="text"
                        name="driverName"
                        value={formData.driverName}
                        onChange={handleTextChange}
                        placeholder="e.g. Rajesh Kumar"
                        className="w-full border border-slate-200 dark:border-slate-800/80 rounded-xl px-3 py-2 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-extrabold uppercase text-slate-400 dark:text-slate-600">Shipper</label>
                        <input
                          type="text"
                          name="shipper"
                          value={formData.shipper}
                          onChange={handleTextChange}
                          placeholder="e.g. Tata Steel Ltd."
                          className="w-full border border-slate-200 dark:border-slate-800/80 rounded-xl px-3 py-2 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-extrabold uppercase text-slate-400 dark:text-slate-600">Commodity</label>
                        <input
                          type="text"
                          name="commodity"
                          value={formData.commodity}
                          onChange={handleTextChange}
                          placeholder="e.g. Industrial Castings"
                          className="w-full border border-slate-200 dark:border-slate-800/80 rounded-xl px-3 py-2 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-extrabold uppercase text-slate-400 dark:text-slate-600">Shipping Document (B/L No.)</label>
                      <input
                        type="text"
                        name="shippingDocs"
                        value={formData.shippingDocs}
                        onChange={handleTextChange}
                        placeholder="e.g. E-Way Bill #84920831"
                        className="w-full border border-slate-200 dark:border-slate-800/80 rounded-xl px-3 py-2 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                      />
                    </div>
                  </div>

                  {/* Category 2: Carrier & Vehicle Info */}
                  <div className="p-3.5 bg-slate-50/50 dark:bg-slate-950/30 rounded-2xl border border-slate-150 dark:border-slate-850/80 flex flex-col gap-3">
                    <div className="flex items-center gap-1 border-b border-slate-100 dark:border-slate-850 pb-1.5 mb-1 text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      <Truck className="w-3 h-3 text-blue-500" />
                      <span>Carrier & Tractor Details</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-extrabold uppercase text-slate-400 dark:text-slate-600">Truck No.</label>
                        <input
                          type="text"
                          name="truckTractorNumber"
                          value={formData.truckTractorNumber}
                          onChange={handleTextChange}
                          placeholder="e.g. NL-01-A-4832"
                          className="w-full border border-slate-200 dark:border-slate-800/80 rounded-xl px-3 py-2 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-extrabold uppercase text-slate-400 dark:text-slate-600">Trailer No.</label>
                        <input
                          type="text"
                          name="trailerNumber"
                          value={formData.trailerNumber}
                          onChange={handleTextChange}
                          placeholder="e.g. MH-43-XY-9081"
                          className="w-full border border-slate-200 dark:border-slate-800/80 rounded-xl px-3 py-2 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-extrabold uppercase text-slate-400 dark:text-slate-600">License Plate No.</label>
                        <input
                          type="text"
                          name="licensePlate"
                          value={formData.licensePlate}
                          onChange={handleTextChange}
                          placeholder="e.g. MH-43-XY-9081"
                          className="w-full border border-slate-200 dark:border-slate-800/80 rounded-xl px-3 py-2 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-extrabold uppercase text-slate-400 dark:text-slate-600">Odometer (mi)</label>
                        <input
                          type="number"
                          name="odometerStart"
                          value={formData.odometerStart}
                          onChange={handleTextChange}
                          placeholder="e.g. 124500"
                          className="w-full border border-slate-200 dark:border-slate-800/80 rounded-xl px-3 py-2 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-right font-mono"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-extrabold uppercase text-slate-400 dark:text-slate-600">Carrier Name</label>
                      <input
                        type="text"
                        name="carrierName"
                        value={formData.carrierName}
                        onChange={handleTextChange}
                        placeholder="e.g. Indian Roadlines Logistics Ltd."
                        className="w-full border border-slate-200 dark:border-slate-800/80 rounded-xl px-3 py-2 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-extrabold uppercase text-slate-400 dark:text-slate-600">Carrier Office Address</label>
                      <input
                        type="text"
                        name="mainOfficeAddress"
                        value={formData.mainOfficeAddress}
                        onChange={handleTextChange}
                        placeholder="e.g. Plot 42, Sector 10, Kalamboli, Navi Mumbai"
                        className="w-full border border-slate-200 dark:border-slate-800/80 rounded-xl px-3 py-2 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-extrabold uppercase text-slate-400 dark:text-slate-600">Home Terminal Address</label>
                      <input
                        type="text"
                        name="homeTerminalAddress"
                        value={formData.homeTerminalAddress}
                        onChange={handleTextChange}
                        placeholder="e.g. Kalamboli Hub, Navi Mumbai, MH"
                        className="w-full border border-slate-200 dark:border-slate-800/80 rounded-xl px-3 py-2 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                      />
                    </div>
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Form Action Controls */}
        <div className="flex gap-3 border-t border-slate-100 dark:border-slate-850 pt-4 mt-2">
          
          {/* Animated Reset Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onHoverStart={() => setIsResetHovered(true)}
            onHoverEnd={() => setIsResetHovered(false)}
            type="button"
            onClick={handleReset}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer select-none"
          >
            <motion.div
              animate={{ rotate: isResetHovered ? -180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            </motion.div>
            <span>Reset</span>
          </motion.button>

          {/* Primary Submit Button with Pulse Glow */}
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: '0px 8px 20px rgba(37, 99, 235, 0.25)' }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="flex-[2] flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-xs hover:bg-blue-700 transition-all disabled:opacity-50 cursor-pointer select-none"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <Play className="w-3.5 h-3.5" />
            )}
            <span>{isLoading ? 'Planning...' : 'Generate HOS logs'}</span>
          </motion.button>
        </div>
      </form>
    </div>
  );
};
export default TripPlannerCard;
