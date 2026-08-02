import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';

// Fix for default Leaflet marker icon issues in Vite
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import markerRetina from 'leaflet/dist/images/marker-icon-2x.png';

// Overwrite default options
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerRetina,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface Stop {
  id: string;
  status: string;
  location: string;
  description: string;
  startTime: string;
  endTime: string;
  durationHours: number;
}

interface RouteMapProps {
  startCoords: [number, number];
  pickupCoords: [number, number];
  dropoffCoords: [number, number];
  routeGeometry1: any;
  routeGeometry2: any;
  stops: Stop[];
}

// Controller component to center map bounds automatically
const ChangeView: React.FC<{ bounds: L.LatLngBoundsExpression }> = ({ bounds }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [bounds, map]);
  return null;
};

export const RouteMap: React.FC<RouteMapProps> = ({
  startCoords,
  pickupCoords,
  dropoffCoords,
  routeGeometry1,
  routeGeometry2,
  stops
}) => {
  // Convert GeoJSON [lon, lat] coordinate lists to Leaflet [lat, lon] tuples
  const parsePolyline = (geometry: any): [number, number][] => {
    if (!geometry || !geometry.coordinates) return [];
    return geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
  };

  const path1 = parsePolyline(routeGeometry1);
  const path2 = parsePolyline(routeGeometry2);

  // Define bounding box covering the entire trip path
  const allPoints = [startCoords, pickupCoords, dropoffCoords];
  const bounds = L.latLngBounds(allPoints);

  // Custom Leaflet DivIcons to avoid Vite asset resolution bugs
  const createMarkerIcon = (emoji: string, bgColor: string) => {
    return L.divIcon({
      html: `<div style="background-color: ${bgColor}; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 15px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1); border: 2px solid white;">${emoji}</div>`,
      className: 'custom-map-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16],
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
      className="w-full border border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-lg shadow-slate-100/40 dark:shadow-none transition-colors duration-300"
    >
      <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/50 pb-3 mb-4">
        <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
          <MapPin className="w-4 h-4" />
        </div>
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-white">
          Interactive Route &amp; Haul Map
        </h3>
      </div>

      {/* Map Container Canvas */}
      <div className="w-full h-80 md:h-[400px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner relative z-10">
        <MapContainer
          center={startCoords}
          zoom={6}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
        >
          <ChangeView bounds={bounds} />
          
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Leg 1 Polyline (Dashed Blue - Transit to Pickup) */}
          {path1.length > 0 && (
            <Polyline
              positions={path1}
              pathOptions={{
                color: '#3b82f6',
                weight: 4,
                dashArray: '8 6',
                opacity: 0.85
              }}
            />
          )}

          {/* Leg 2 Polyline (Solid Pink - Loaded haul to Destination) */}
          {path2.length > 0 && (
            <Polyline
              positions={path2}
              pathOptions={{
                color: '#ec4899',
                weight: 5,
                opacity: 0.90
              }}
            />
          )}

          {/* Start Point Marker */}
          <Marker position={startCoords} icon={createMarkerIcon('📍', '#f97316')}>
            <Popup>
              <div className="text-xs font-bold text-slate-900">Start Terminal</div>
            </Popup>
          </Marker>

          {/* Pickup Point Marker */}
          <Marker position={pickupCoords} icon={createMarkerIcon('📦', '#10b981')}>
            <Popup>
              <div className="text-xs font-bold text-slate-900">Pickup Dock (Cargo Loaded)</div>
            </Popup>
          </Marker>

          {/* Dropoff Point Marker */}
          <Marker position={dropoffCoords} icon={createMarkerIcon('🏁', '#ef4444')}>
            <Popup>
              <div className="text-xs font-bold text-slate-900">Destination (Cargo Unloaded)</div>
            </Popup>
          </Marker>

          {/* Scheduled Fuel & Rest stop markers */}
          {stops.map((stop) => {
            const isFuel = stop.description.toLowerCase().includes('fuel');
            const coords = stop.description.toLowerCase().includes('pickup')
              ? pickupCoords
              : stop.description.toLowerCase().includes('drop')
                ? dropoffCoords
                : null;


            // Skip drawing overlapping markers at identical coordinates to avoid clutter
            if (coords) return null;

            // Mock intermediate stop coordinate coordinates
            // We can place intermediate rests on the path segment if we want, or place near the middle.
            // For stops along the OSRM path, let's map them at the pickup point if they are after pickup,
            // or midway along paths. Let's default to intermediate coordinates.
            // In a mock setup, we place stops close to the path coordinates.
            const stopCoords: [number, number] = isFuel ? [pickupCoords[0] + 0.1, pickupCoords[1] - 0.2] : [startCoords[0] + 0.3, startCoords[1] + 0.2];

            return (
              <Marker
                key={stop.id}
                position={stopCoords}
                icon={createMarkerIcon(isFuel ? '⛽' : '💤', isFuel ? '#f59e0b' : '#6366f1')}
              >
                <Popup>
                  <div className="text-xs font-bold text-slate-900">{stop.description}</div>
                  <div className="text-[10px] text-slate-500 mt-1 font-mono">
                    Time: {stop.startTime} to {stop.endTime} ({stop.durationHours} hrs)
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      <div className="flex flex-wrap gap-4 mt-3 justify-center text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-1 border-t-2 border-dashed border-blue-500" />
          <span>Transit Leg (Empty)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-1 bg-pink-500" />
          <span>Hauling Leg (Loaded)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span>Fuel stop</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
          <span>Rest Stop</span>
        </div>
      </div>
    </motion.div>
  );
};
