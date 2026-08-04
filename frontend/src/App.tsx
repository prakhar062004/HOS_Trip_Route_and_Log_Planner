import { useState, useEffect } from 'react';
import { Navbar } from './components/SaaS/Navbar';
import { Hero } from './components/SaaS/Hero';
import { Dashboard } from './components/SaaS/Dashboard';
import { Footer } from './components/SaaS/Footer';

function App() {
  const [activeTripData, setActiveTripData] = useState<any>(null);
  const [savedLogs, setSavedLogs] = useState<any[]>([]);

  // Load saved logs from localStorage on mount
  useEffect(() => {
    const history = localStorage.getItem('hos_log_history');
    if (history) {
      try {
        setSavedLogs(JSON.parse(history));
      } catch (e) {
        console.error("Failed to parse log history:", e);
      }
    }
  }, []);

  // Real-time Dynamic Favicon & Browser Tab Title Sync
  useEffect(() => {
    // Compliant Brand Logo Favicon (High-Visibility Solid Blue Circle Map Pin)
    const compliantSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
        <circle cx="16" cy="16" r="15" fill="#2563eb" />
        <path d="M16 6 C11.5 6 8 9.5 8 14 C8 20 16 27 16 27 C16 27 24 20 24 14 C24 9.5 20.5 6 16 6 Z M16 17 C14.3 17 13 15.7 13 14 C13 12.3 14.3 11 16 11 C17.7 11 19 12.3 19 14 C19 15.7 17.7 17 16 17 Z" fill="white" />
      </svg>
    `.trim();

    // HOS Violation Warning Favicon (High-Visibility Solid Red Circle Map Pin)
    const violationSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
        <circle cx="16" cy="16" r="15" fill="#ef4444" />
        <path d="M16 6 C11.5 6 8 9.5 8 14 C8 20 16 27 16 27 C16 27 24 20 24 14 C24 9.5 20.5 6 16 6 Z M16 17 C14.3 17 13 15.7 13 14 C13 12.3 14.3 11 16 11 C17.7 11 19 12.3 19 14 C19 15.7 17.7 17 16 17 Z" fill="white" />
      </svg>
    `.trim();

    const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    
    if (activeTripData) {
      let isViolated = false;
      const dailyLogs = activeTripData.daily_logs || [];

      // Scan all daily logs in the active trip data for compliance
      dailyLogs.forEach((log: any) => {
        let driving = 0;
        let onDuty = 0;

        (log.intervals || []).forEach((i: any) => {
          const [startH, startM] = i.start.split(':').map(Number);
          const [endH, endM] = i.end.split(':').map(Number);
          const dur = Math.max(0, ((endH * 60 + endM) - (startH * 60 + startM)) / 60);
          if (i.status === 'DRIVING') driving += dur;
          else if (i.status === 'ON_DUTY') onDuty += dur;
        });

        if (driving > 11.0 || (driving + onDuty) > 14.0) {
          isViolated = true;
        }
      });

      // Update document title and icon dynamically
      if (isViolated) {
        document.title = "⚠️ HOS VIOLATION - Route Planner";
        if (link) link.href = `data:image/svg+xml;utf8,${encodeURIComponent(violationSvg)}`;
      } else {
        document.title = "HOS ELD - Compliant Route Planner";
        if (link) link.href = `data:image/svg+xml;utf8,${encodeURIComponent(compliantSvg)}`;
      }
    } else {
      // Default initial states when no active haul is loaded
      document.title = "HOS ELD - Route Planner";
      if (link) link.href = `data:image/svg+xml;utf8,${encodeURIComponent(compliantSvg)}`;
    }
  }, [activeTripData]);

  const handleSaveLog = (tripData: any) => {
    // Sync activeTripData state
    setActiveTripData(tripData);

    // Generate preview metrics
    const logDate = tripData.daily_logs[0]?.date || new Date().toISOString().split('T')[0];
    const fromCity = tripData.daily_logs[0]?.fromCity || 'Start Terminal';
    const toCity = tripData.daily_logs[tripData.daily_logs.length - 1]?.toCity || 'Final Dropoff';
    
    setSavedLogs((prev) => {
      // Find if we already have a log with the same date and route endpoints
      const existingIdx = prev.findIndex(item => item.date === logDate && item.fromCity === fromCity && item.toCity === toCity);
      
      let nextHistory = [...prev];
      if (existingIdx !== -1) {
        // Overwrite existing log updates (for edits)
        nextHistory[existingIdx] = {
          ...nextHistory[existingIdx],
          tripData: tripData,
          timestamp: new Date().toLocaleString()
        };
      } else {
        // Prepend new generated log
        const newLog = {
          id: `log_${Date.now()}`,
          timestamp: new Date().toLocaleString(),
          date: logDate,
          fromCity: fromCity,
          toCity: toCity,
          distance: tripData.total_distance_miles,
          hours: tripData.total_driving_hours,
          tripData: tripData
        };
        nextHistory = [newLog, ...nextHistory].slice(0, 10);
      }
      localStorage.setItem('hos_log_history', JSON.stringify(nextHistory));
      return nextHistory;
    });
  };

  const handleLoadLog = (tripData: any) => {
    setActiveTripData(tripData);
    
    // Smooth scroll down to the logbook container once loaded
    setTimeout(() => {
      const el = document.getElementById('logbook-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);
  };

  const handleClearHistory = () => {
    localStorage.removeItem('hos_log_history');
    setSavedLogs([]);
  };

  const handleRemoveLogFromHistory = (id: string) => {
    setSavedLogs((prev) => {
      const nextHistory = prev.filter(log => log.id !== id);
      localStorage.setItem('hos_log_history', JSON.stringify(nextHistory));
      return nextHistory;
    });
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-300 flex flex-col relative overflow-x-hidden">
      {/* Creative background mesh and glowing ambient elements */}
      <div className="absolute inset-0 -z-50 overflow-hidden pointer-events-none no-print">
        {/* Dotted Grid mesh pattern overlay */}
        <div className="absolute inset-0 bg-grid-mesh opacity-100" />
        
        {/* Soft floating colored ambient glows */}
        <div className="absolute top-[-10%] left-[5%] w-[45%] h-[40%] bg-blue-500/10 dark:bg-blue-600/5 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-[20%] right-[10%] w-[35%] h-[35%] bg-purple-500/10 dark:bg-purple-600/5 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '10s' }} />
        <div className="absolute bottom-[20%] left-[-5%] w-[45%] h-[45%] bg-indigo-500/10 dark:bg-indigo-600/5 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '12s' }} />
        <div className="absolute bottom-[-10%] right-[15%] w-[40%] h-[40%] bg-pink-500/5 dark:bg-pink-600/5 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '9s' }} />
      </div>

      <Navbar 
        savedLogs={savedLogs}
        onLoadLog={handleLoadLog}
        onClearHistory={handleClearHistory}
        onRemoveLogFromHistory={handleRemoveLogFromHistory}
      />
      <Hero />
      <Dashboard 
        loadedTripData={activeTripData}
        onSaveLog={handleSaveLog}
      />
      <Footer />
    </div>
  );
}

export default App;
