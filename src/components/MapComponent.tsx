import { Box, Button } from '@mui/material';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Settings } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import {
    ImageOverlay,
    MapContainer,
    Marker,
    Polyline,
    Popup,
    TileLayer,
    useMap,
    useMapEvents
} from 'react-leaflet';
import type { LocationCoords } from '../data/blocks';
import { MAP_CENTER } from '../data/blocks';
import AdminTool from './AdminTool';

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

interface MapComponentProps {
  startLocation: LocationCoords | null;
  destination: LocationCoords | null;
  onPathCalculated?: (distance: string, duration: string) => void;
}

// Sub-component to sync map center and calculate distances
const MapController: React.FC<{ 
    start: LocationCoords | null, 
    end: LocationCoords | null, 
    onCalc?: (dist: string, dur: string) => void,
    onMapClick: (lat: number, lng: number) => void,
    onDragOverlay?: (deltaLat: number, deltaLng: number) => void,
    isMoveMode?: boolean
}> = ({ start, end, onCalc, onMapClick, onDragOverlay, isMoveMode }) => {
  const map = useMap();
  const [startPoint, setStartPoint] = useState<L.LatLng | null>(null);
  
  useMapEvents({
      click(e) {
          if (!isMoveMode) onMapClick(e.latlng.lat, e.latlng.lng);
      },
      mousedown(e) {
          if (isMoveMode) {
              setStartPoint(e.latlng);
              map.dragging.disable(); // Prevent map from moving while we shift overlay
          }
      },
      mousemove(e) {
          if (isMoveMode && startPoint && onDragOverlay) {
              const deltaLat = e.latlng.lat - startPoint.lat;
              const deltaLng = e.latlng.lng - startPoint.lng;
              onDragOverlay(deltaLat, deltaLng);
              setStartPoint(e.latlng);
          }
      },
      mouseup() {
          setStartPoint(null);
          map.dragging.enable();
      }
  });

  useEffect(() => {
    if (start && end) {
      const p1 = L.latLng(start.lat, start.lng);
      const p2 = L.latLng(end.lat, end.lng);
      
      const bounds = L.latLngBounds([p1, p2]);
      map.fitBounds(bounds, { padding: [50, 50] });

      const distInMeters = p1.distanceTo(p2);
      const distText = distInMeters > 1000 
        ? `${(distInMeters / 1000).toFixed(2)} km` 
        : `${Math.round(distInMeters)} m`;
      
      const durSecs = distInMeters / 1.1;
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
  const [adminMode, setAdminMode] = useState(false);
  const [isMoveMode, setIsMoveMode] = useState(false);
  const [overlayBounds, setOverlayBounds] = useState({
      north: 14.05600,
      south: 14.05200,
      east: 121.28800,
      west: 121.28200
  });
  const [lastPin, setLastPin] = useState<{lat: number, lng: number} | null>(null);

  const handleDragOverlay = (deltaLat: number, deltaLng: number) => {
      setOverlayBounds(prev => ({
          north: prev.north + deltaLat,
          south: prev.south + deltaLat,
          east: prev.east + deltaLng,
          west: prev.west + deltaLng
      }));
  };

  const leafletBounds: L.LatLngBoundsExpression = [
      [overlayBounds.south, overlayBounds.west],
      [overlayBounds.north, overlayBounds.east]
  ];

  return (
    <Box sx={containerStyle}>
      <MapContainer 
        center={[MAP_CENTER.lat, MAP_CENTER.lng]} 
        zoom={17} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ImageOverlay
          url="/kmap.png"
          bounds={leafletBounds}
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

        {lastPin && (
          <Marker position={[lastPin.lat, lastPin.lng]}>
            <Popup>
              <b>Calibrator Pin</b><br/>
              {lastPin.lat.toFixed(6)}, {lastPin.lng.toFixed(6)}
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
            dashArray="10, 10"
          />
        )}

        <MapController 
          start={startLocation} 
          end={destination} 
          onCalc={onPathCalculated}
          onMapClick={(lat, lng) => setLastPin({lat, lng})}
          onDragOverlay={handleDragOverlay}
          isMoveMode={isMoveMode && adminMode}
        />
      </MapContainer>

      {/* Admin Toggle */}
      <Button
        variant="contained"
        size="small"
        startIcon={<Settings size={14} />}
        onClick={() => {
            if (adminMode) setIsMoveMode(false);
            setAdminMode(!adminMode);
        }}
        sx={{
            position: 'absolute',
            top: 24,
            right: 24,
            zIndex: 2000,
            bgcolor: adminMode ? 'secondary.main' : 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(10px)',
            color: adminMode ? 'white' : 'text.primary',
            borderRadius: 2,
            border: '1px solid rgba(0,0,0,0.1)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            '&:hover': { bgcolor: adminMode ? 'secondary.dark' : '#fff' }
        }}
      >
        {adminMode ? 'Close' : 'Admin'}
      </Button>

      {adminMode && (
          <AdminTool 
            bounds={overlayBounds} 
            onBoundsChange={setOverlayBounds} 
            lastClickedCoord={lastPin}
            isMoveMode={isMoveMode}
            onToggleMoveMode={() => setIsMoveMode(!isMoveMode)}
          />
      )}
    </Box>
  );
};

export default React.memo(MapComponent);
