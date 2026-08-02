import React, { useState } from 'react';
import { TripForm } from './TripForm';
import { TripMap } from './TripMap';

import { DriverDailyLog } from '../DriverDailyLog/DriverDailyLog';
import type { DriverLogData } from '../DriverDailyLog/types';

import { Map, Calendar, Navigation, Info, AlertCircle } from 'lucide-react';

interface Stop {
  id: string;
  status: string;
  location: string;
  description: string;
  startTime: string;
  endTime: string;
  durationHours: number;
}

interface TripData {
  start_coords: [number, number];
  pickup_coords: [number, number];
  dropoff_coords: [number, number];
  route_geometry_1: any;
  route_geometry_2: any;
  total_distance_miles: number;
  total_driving_hours: number;
  stops: Stop[];
  daily_logs: DriverLogData[];
}

export const TripDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'map' | 'logs'>('map');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tripData, setTripData] = useState<TripData | null>(null);
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(0);

  // Submit form data to Django backend
  const handlePlanTrip = async (formData: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/api/plan-trip/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to plan trip. Please check your inputs.');
      }

      const resData = await response.json();
      setTripData(resData);
      setSelectedDayIdx(0);
      setActiveTab('map'); // Switch to map view to show path first
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  // Keep track of user edits on any particular daily log sheet
  const handleLogChange = (dayIndex: number, updatedLog: DriverLogData) => {
    if (!tripData) return;
    const updatedLogs = [...tripData.daily_logs];
    updatedLogs[dayIndex] = updatedLog;
    setTripData({
      ...tripData,
      daily_logs: updatedLogs,
    });
  };

  // Helper to format date display (e.g. "2026-08-02" -> "Aug 02")
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr + 'T00:00:00');
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-6 px-4 flex flex-col gap-6">
      {/* Page Header */}
      <header className="no-print flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200 pb-4 gap-4">
        <div className="flex items-center gap-3">
          <img src="/logo.svg" className="w-10 h-10 drop-shadow-sm" alt="HOS Planner Logo" />
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              HOS Route &amp; Log Planner
            </h1>
            <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
              Calculate routes, automate mandatory rest breaks, and generate pixel-perfect FMCSA daily driver logs.
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-slate-200 p-1 rounded-lg shadow-inner">
          <button
            onClick={() => setActiveTab('map')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'map' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>Map & Stop Schedule</span>
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'logs' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Daily Log Sheets</span>
            {tripData && (
              <span className="ml-1 px-1.5 py-0.5 bg-slate-900 text-white rounded-full text-[9px] font-black">
                {tripData.daily_logs.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Error Alert */}
      {error && (
        <div className="no-print flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl shadow-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span className="text-xs font-semibold">{error}</span>
        </div>
      )}

      {/* Tab 1 Content: Form, Map, and Stops */}
      {activeTab === 'map' && (
        <div className="no-print grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Input Form Column (4 columns) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <TripForm onSubmit={handlePlanTrip} isLoading={isLoading} />
            
            {/* Trip statistics card */}
            {tripData && (
              <div className="bg-slate-900 text-white p-5 rounded-xl shadow-md flex flex-col gap-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-1.5">
                  Trip Summary
                </h3>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-black">Distance</div>
                    <div className="text-xl font-bold mt-1 font-mono-grid text-white">
                      {tripData.total_distance_miles} <span className="text-xs font-normal">mi</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-black">Driving Duration</div>
                    <div className="text-xl font-bold mt-1 font-mono-grid text-white">
                      {tripData.total_driving_hours} <span className="text-xs font-normal">hrs</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1.5 border-t border-slate-800 pt-2 leading-relaxed">
                  <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>Stops and rests are computed under the property-carrying HOS 70h/8d cycle limits.</span>
                </div>
              </div>
            )}
          </div>

          {/* Interactive Map & Stops Column (8 columns) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {tripData ? (
              <div className="flex flex-col gap-6">
                <TripMap
                  startCoords={tripData.start_coords}
                  pickupCoords={tripData.pickup_coords}
                  dropoffCoords={tripData.dropoff_coords}
                  routeGeometry1={tripData.route_geometry_1}
                  routeGeometry2={tripData.route_geometry_2}
                  stops={tripData.stops}
                />

                {/* Scheduled Stops Timeline */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2 mb-4 flex items-center gap-1.5">
                    <Navigation className="w-4 h-4 text-slate-700" />
                    <span>HOS Trip Stops Timeline</span>
                  </h3>
                  
                  <div className="relative border-l border-slate-200 ml-3 pl-6 space-y-6">
                    {tripData.stops.map((stop) => {
                      const isRest = stop.status === 'SLEEPER' || stop.status === 'OFF_DUTY';
                      const isFuel = stop.description.includes('Fueling');
                      
                      return (
                        <div key={stop.id} className="relative">
                          {/* Circular Marker Line Node */}
                          <span className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center text-[10px] ${
                            isRest ? 'bg-amber-500' : isFuel ? 'bg-indigo-600' : 'bg-blue-600'
                          }`} />
                          
                          <div className="text-xs">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-bold text-slate-800">{stop.description}</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                isRest ? 'bg-amber-100 text-amber-800' : isFuel ? 'bg-indigo-100 text-indigo-800' : 'bg-blue-100 text-blue-800'
                              }`}>
                                {stop.status.replace('_', ' ')}
                              </span>
                              <span className="text-slate-400 font-medium">({stop.durationHours} hrs)</span>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1 font-bold">📍 Location: {stop.location}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5 font-medium">⏱️ {stop.startTime} to {stop.endTime}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full h-[450px] bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center p-6 text-center text-slate-400 font-medium shadow-inner">
                <Map className="w-12 h-12 text-slate-300 mb-3 animate-pulse" />
                <p className="text-sm">No active route loaded.</p>
                <p className="text-xs text-slate-300 mt-1 max-w-sm">Enter your current, loading, and destination locations on the left, then click "Generate HOS logs" to plan the route and stops.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2 Content: Generated Daily Logs */}
      {activeTab === 'logs' && (
        <div className="w-full">
          {tripData ? (
            <div className="flex flex-col gap-6">
              
              {/* Day selection Pagination bar (no-print) */}
              <div className="no-print bg-white border border-slate-200 p-3 rounded-xl shadow-sm flex items-center gap-3 overflow-x-auto">
                <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider whitespace-nowrap">
                  Daily Log Sheets:
                </span>
                <div className="flex items-center gap-2">
                  {tripData.daily_logs.map((log, idx) => {
                    const isSelected = selectedDayIdx === idx;
                    return (
                      <button
                        key={log.date}
                        onClick={() => setSelectedDayIdx(idx)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                          isSelected
                            ? 'bg-slate-900 text-white shadow-md'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        Day {idx + 1} ({formatDate(log.date)})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Renders the controlled Driver Daily Log sheet component */}
              <DriverDailyLog
                controlledLogData={tripData.daily_logs[selectedDayIdx]}
                onControlledLogDataChange={(updatedLog) => handleLogChange(selectedDayIdx, updatedLog)}
              />
            </div>
          ) : (
            <div className="no-print w-full bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl py-12 flex flex-col items-center justify-center p-6 text-center text-slate-400 font-medium shadow-inner">
              <Calendar className="w-12 h-12 text-slate-300 mb-3 animate-pulse" />
              <p className="text-sm">No daily log sheets generated.</p>
              <p className="text-xs text-slate-300 mt-1 max-w-sm">After you input your trip parameters and calculate the route, log sheets for each day of the trip will appear here.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default TripDashboard;
