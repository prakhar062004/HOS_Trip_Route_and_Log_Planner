import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2 } from 'lucide-react';
import { TripPlannerCard } from './TripPlannerCard';
import { SummaryCards } from './SummaryCards';
import { RouteMap } from './RouteMap';
import { Timeline } from './Timeline';
import { LogTabs } from './LogTabs';
import { PaperViewer } from './PaperViewer';
import { Analytics } from './Analytics';
import { LoadingState } from './LoadingState';
import { EmptyState } from './EmptyState';
import type { DriverLogData } from '../DriverDailyLog/types';

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

export const Dashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [tripData, setTripData] = useState<TripData | null>(null);
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  const handlePlanTrip = async (formPayload: any) => {
    setIsLoading(true);
    setError(null);
    setTripData(null);
    setShowToast(false);

    try {
      const response = await fetch('http://localhost:8000/api/plan-trip/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          current_location: formPayload.current_location,
          pickup_location: formPayload.pickup_location,
          dropoff_location: formPayload.dropoff_location,
          cycle_hours: parseFloat(formPayload.cycle_hours || '0'),
          start_date: formPayload.start_date,
          carrierName: formPayload.carrierName,
          mainOfficeAddress: formPayload.mainOfficeAddress,
          homeTerminalAddress: formPayload.homeTerminalAddress,
          truckTractorNumber: formPayload.truckTractorNumber,
          trailerNumber: formPayload.trailerNumber,
          licensePlate: formPayload.licensePlate,
          odometerStart: parseInt(formPayload.odometerStart || '124500'),
          shipper: formPayload.shipper,
          commodity: formPayload.commodity,
          driverName: formPayload.driverName,
          shippingDocs: formPayload.shippingDocs,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate HOS path.');
      }

      const resData = await response.json();
      
      // Delay state update slightly to show full loader progress
      setTimeout(() => {
        setTripData(resData);
        setSelectedDayIdx(0);
        setIsLoading(false);
        setShowToast(true);
        // Dismiss toast after 4s
        setTimeout(() => setShowToast(false), 4000);
      }, 3500);

    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      setIsLoading(false);
    }
  };

  // Persist drag and brush edits inside the local state array
  const handleLogChange = (updatedLog: DriverLogData) => {
    if (!tripData) return;
    const updatedLogs = [...tripData.daily_logs];
    updatedLogs[selectedDayIdx] = updatedLog;
    setTripData({
      ...tripData,
      daily_logs: updatedLogs,
    });
  };

  return (
    <main id="trip-planner-section" className="w-full max-w-[1360px] mx-auto px-4 py-8 relative">
      
      {/* Toast Alert success Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-24 right-4 md:right-8 z-50 flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 px-5 py-4 rounded-2xl shadow-xl max-w-sm pointer-events-auto"
          >
            <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
            <div className="text-left">
              <div className="text-xs font-black uppercase tracking-wider">HOS Logs Generated</div>
              <div className="text-[10px] opacity-90 mt-0.5 leading-relaxed">
                Stops calculated and FMCSA daily logs drawn successfully.
              </div>
            </div>
            <button onClick={() => setShowToast(false)} className="text-emerald-400 hover:text-emerald-600 ml-2 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Alert Box */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-start gap-3 bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 p-4 rounded-2xl shadow-sm text-left"
        >
          <div className="w-5 h-5 rounded-full bg-rose-200 dark:bg-rose-900 text-rose-700 dark:text-rose-300 flex items-center justify-center text-xs font-black shrink-0">
            !
          </div>
          <div className="flex-1">
            <div className="text-xs font-black uppercase tracking-wider">Planning Failed</div>
            <div className="text-[10px] mt-0.5 leading-relaxed font-semibold">{error}</div>
          </div>
        </motion.div>
      )}

      {/* Conditional Layout Rendering */}
      {isLoading ? (
        <div className="w-full max-w-xl mx-auto my-12">
          <LoadingState />
        </div>
      ) : !tripData ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-4">
            <TripPlannerCard onSubmit={handlePlanTrip} isLoading={isLoading} />
          </div>
          <div className="lg:col-span-8 h-full flex flex-col justify-center">
            <EmptyState />
          </div>
        </div>
      ) : (
        /* Success Dashboard layout grid */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
        >
          {/* Left Column: Forms, Stats, Maps, Timelines, Analytics */}
          <div className="lg:col-span-5 flex flex-col gap-6 no-print">
            <TripPlannerCard onSubmit={handlePlanTrip} isLoading={isLoading} />
            
            <SummaryCards
              distance={tripData.total_distance_miles}
              drivingHours={tripData.total_driving_hours}
              stops={tripData.stops}
              dailyLogs={tripData.daily_logs}
            />

            <RouteMap
              startCoords={tripData.start_coords}
              pickupCoords={tripData.pickup_coords}
              dropoffCoords={tripData.dropoff_coords}
              routeGeometry1={tripData.route_geometry_1}
              routeGeometry2={tripData.route_geometry_2}
              stops={tripData.stops}
            />

            <Timeline stops={tripData.stops} />

            <Analytics log={tripData.daily_logs[selectedDayIdx]} />
          </div>

          {/* Right Column: Generated Log Tabs list & SVG Document Viewer */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="no-print">
              <LogTabs
                dailyLogs={tripData.daily_logs}
                selectedDayIdx={selectedDayIdx}
                onSelectDay={setSelectedDayIdx}
              />
            </div>

            <PaperViewer
              data={tripData.daily_logs[selectedDayIdx]}
              onChange={handleLogChange}
              dayIdx={selectedDayIdx}
            />
          </div>
        </motion.div>
      )}

    </main>
  );
};
