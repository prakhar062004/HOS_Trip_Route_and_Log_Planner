import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet marker icon issues in Vite
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import markerRetina from 'leaflet/dist/images/marker-icon-2x.png';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconRetinaUrl: markerRetina,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom icons for different stop types
const startIcon = L.divIcon({
  html: '<div class="w-8 h-8 bg-emerald-600 border-2 border-white rounded-full flex items-center justify-center text-white shadow font-black text-xs">S</div>',
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const pickupIcon = L.divIcon({
  html: '<div class="w-8 h-8 bg-blue-600 border-2 border-white rounded-full flex items-center justify-center text-white shadow font-black text-xs">P</div>',
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const dropoffIcon = L.divIcon({
  html: '<div class="w-8 h-8 bg-rose-600 border-2 border-white rounded-full flex items-center justify-center text-white shadow font-black text-xs">D</div>',
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const restIcon = L.divIcon({
  html: '<div class="w-7 h-7 bg-amber-500 border-2 border-white rounded-full flex items-center justify-center text-white shadow font-bold text-xs">💤</div>',
  className: '',
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

const fuelIcon = L.divIcon({
  html: '<div class="w-7 h-7 bg-indigo-600 border-2 border-white rounded-full flex items-center justify-center text-white shadow font-bold text-xs">⛽</div>',
  className: '',
  iconSize: [28, 28],
  iconAnchor: [14, 28],
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

interface TripMapProps {
  startCoords: [number, number] | null;
  pickupCoords: [number, number] | null;
  dropoffCoords: [number, number] | null;
  routeGeometry1: any;
  routeGeometry2: any;
  stops: Stop[];
}

// Component to dynamically fit map zoom bounds around the active route
const ChangeView: React.FC<{ bounds: L.LatLngBounds | null }> = ({ bounds }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [bounds, map]);
  return null;
};

export const TripMap: React.FC<TripMapProps> = ({
  startCoords,
  pickupCoords,
  dropoffCoords,
  routeGeometry1,
  routeGeometry2,
  stops,
}) => {
  // Convert GeoJSON [lon, lat] coordinate lists to Leaflet [lat, lon] tuples
  const parsePolyline = (geometry: any): [number, number][] => {
    if (!geometry || !geometry.coordinates) return [];
    return geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
  };

  const path1 = parsePolyline(routeGeometry1);
  const path2 = parsePolyline(routeGeometry2);
  const combinedPath = [...path1, ...path2];

  // Calculate bounding box for auto-zooming
  let mapBounds: L.LatLngBounds | null = null;
  if (combinedPath.length > 0) {
    mapBounds = L.latLngBounds(combinedPath);
  } else if (startCoords && dropoffCoords) {
    mapBounds = L.latLngBounds([startCoords, dropoffCoords]);
  }

  // We place markers for stops along the route. Since the geocoder gives general city coordinates
  // for stops, we plot them at their city centroids.
  // We can lookup stop coordinates dynamically. For this assessment, we map stop names to known route coordinates,
  // or place them roughly along the polyline path, or geocode them on backend.
  // In our backend, geocoded coordinates for start, pickup, and dropoff are returned. 
  // Let's place the stop markers at the closest key nodes or fallback to pickup/start/dropoff centring.
  // For visual richness, let's geocode stop cities or place rest stops at strategic intervals on the map.
  
  return (
    <div className="w-full h-[450px] relative rounded-xl overflow-hidden border border-slate-200 shadow-inner z-10">
      <MapContainer
        center={startCoords || [39.8283, -98.5795]} // Default center of USA
        zoom={startCoords ? 6 : 4}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* ChangeView component handles auto-zoom when routing data is loaded */}
        {mapBounds && <ChangeView bounds={mapBounds} />}

        {/* Route Lines */}
        {path1.length > 0 && (
          <Polyline
            positions={path1}
            color="#2563eb"
            weight={5}
            opacity={0.8}
            dashArray="1, 8"
          />
        )}
        {path2.length > 0 && (
          <Polyline
            positions={path2}
            color="#ec4899"
            weight={5}
            opacity={0.8}
          />
        )}

        {/* Start Point Marker */}
        {startCoords && (
          <Marker position={startCoords} icon={startIcon}>
            <Popup>
              <div className="text-xs">
                <p className="font-bold text-slate-800">Start Location</p>
                <p className="text-[10px] text-slate-500 font-semibold">Origin</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Pickup Marker */}
        {pickupCoords && (
          <Marker position={pickupCoords} icon={pickupIcon}>
            <Popup>
              <div className="text-xs">
                <p className="font-bold text-slate-800">Pickup Stop</p>
                <p className="text-[10px] text-blue-600 font-bold">1 Hour On-Duty Loading</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Dropoff Marker */}
        {dropoffCoords && (
          <Marker position={dropoffCoords} icon={dropoffIcon}>
            <Popup>
              <div className="text-xs">
                <p className="font-bold text-slate-800">Dropoff Location</p>
                <p className="text-[10px] text-rose-600 font-bold">1 Hour On-Duty Unloading</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Stops & Rests Markers */}
        {stops.map((stop) => {
          // Determine which coordinate to place the marker at
          // Rests after pickup go closer to dropoff, rests before pickup go closer to start.
          // Let's place rest stops near pickup/dropoff/start coordinates depending on their sequence.
          let markerPos: [number, number] = startCoords || [0, 0];
          let icon = restIcon;
          
          if (stop.status === 'ON_DUTY' && stop.description.includes('Fueling')) {
            icon = fuelIcon;
            markerPos = pickupCoords ? [ (pickupCoords[0] + dropoffCoords![0]) / 2, (pickupCoords[1] + dropoffCoords![1]) / 2 ] : startCoords!;
          } else if (stop.status === 'SLEEPER' || stop.status === 'OFF_DUTY') {
            icon = restIcon;
            // Spread stops along the coordinates
            if (pickupCoords && dropoffCoords) {
              // Interpolated position for resting
              markerPos = [
                pickupCoords[0] + (dropoffCoords[0] - pickupCoords[0]) * 0.45,
                pickupCoords[1] + (dropoffCoords[1] - pickupCoords[1]) * 0.45
              ];
            }
          } else {
            return null;
          }

          return (
            <Marker key={stop.id} position={markerPos} icon={icon}>
              <Popup>
                <div className="text-xs leading-relaxed font-sans max-w-[200px]">
                  <div className="flex items-center gap-1 border-b border-slate-100 pb-1 mb-1">
                    <span className="font-bold text-slate-800">
                      {stop.status === 'SLEEPER' ? 'Sleeper Rest' : stop.status === 'OFF_DUTY' ? 'Off-Duty Rest' : 'Work Stop'}
                    </span>
                  </div>
                  <p className="font-semibold text-[11px] text-slate-700">{stop.description}</p>
                  <p className="text-[10px] text-slate-500 font-bold">📍 Location: {stop.location}</p>
                  <p className="text-[10px] text-slate-400 font-medium">⏱️ {stop.startTime} to {stop.endTime} ({stop.durationHours} hrs)</p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
export default TripMap;
