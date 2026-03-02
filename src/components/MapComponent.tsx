import { Box } from '@mui/material';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import React from 'react';
import {
    ImageOverlay,
    MapContainer,
    Marker,
    Polyline,
    Popup,
    TileLayer,
    useMap
} from 'react-leaflet';
import type { LocationCoords } from '../data/blocks';
import { MAP_CENTER } from '../data/blocks';

// Fix for default marker icons in Leaflet + Vite/React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const containerStyle = {
  width: '100%',
  height: '100vh',
};

// Subdivision Image Overlay Bounds (Approximate for PHirst Park San Pablo) - Same as Google GroundsOverlay
const overlayBounds: L.LatLngBoundsExpression = [
  [14.052, 121.282], // southwest
  [14.056, 121.288]  // northeast
];

interface MapComponentProps {
  startLocation: LocationCoords | null;
  destination: LocationCoords | null;
  onPathCalculated?: (distance: string, duration: string) => void;
}

// Sub-component to sync map center and calculate distances
const MapController: React.FC<{ start: LocationCoords | null, end: LocationCoords | null, onCalc?: (dist: string, dur: string) => void }> = ({ start, end, onCalc }) => {
  const map = useMap();

  React.useEffect(() => {
    if (start && end) {
      const p1 = L.latLng(start.lat, start.lng);
      const p2 = L.latLng(end.lat, end.lng);
      
      const bounds = L.latLngBounds([p1, p2]);
      map.fitBounds(bounds, { padding: [50, 50] });

      // In the free stack, we'll calculate simple geodesic distance for now
      // (as a replacement for Directions API)
      const distInMeters = p1.distanceTo(p2);
      const distText = distInMeters > 1000 
        ? `${(distInMeters / 1000).toFixed(2)} km` 
        : `${Math.round(distInMeters)} m`;
      
      const durSecs = distInMeters / 1.1; // Estimated walking speed (1.1 m/s)
      const durText = `${Math.round(durSecs / 60)} mins`;

      if (onCalc) onCalc(distText, durText);
    } else if (start) {
        map.setView([start.lat, start.lng], 18);
    }
  }, [start, end, map, onCalc]);

  return null;
};

const MapComponent: React.FC<MapComponentProps> = ({ 
  startLocation, 
  destination,
  onPathCalculated 
}) => {
  return (
    <Box sx={containerStyle}>
      <MapContainer 
        center={[MAP_CENTER.lat, MAP_CENTER.lng]} 
        zoom={17} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* 
          Uncomment to use the PPH subdivision map image as an overlay. 
          Make sure to place 'kmap.png' in the 'public' folder.
        */}
        <ImageOverlay
          url="/kmap.png"
          bounds={overlayBounds}
          opacity={0.6}
        />

        {startLocation && (
          <Marker position={[startLocation.lat, startLocation.lng]}>
            <Popup>
              <b>Start</b>: {startLocation.label}
            </Popup>
          </Marker>
        )}

        {destination && (
          <Marker position={[destination.lat, destination.lng]}>
            <Popup>
              <b>Destination House</b>: {destination.label}
            </Popup>
          </Marker>
        )}

        {startLocation && destination && (
          <Polyline 
            positions={[
              [startLocation.lat, startLocation.lng],
              [destination.lat, destination.lng]
            ]} 
            color="#3b82f6"
            weight={6}
            opacity={0.7}
            dashArray="10, 10" // Visual cue that this is a direct path suggestion
          />
        )}

        <MapController 
          start={startLocation} 
          end={destination} 
          onCalc={onPathCalculated} 
        />
      </MapContainer>
    </Box>
  );
};

export default React.memo(MapComponent);
