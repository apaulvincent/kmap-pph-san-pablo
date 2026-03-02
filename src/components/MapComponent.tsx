import { Box, Button } from '@mui/material';
import { addDoc, collection, doc, onSnapshot, setDoc } from 'firebase/firestore';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Settings } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
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
import { db } from '../services/firebase';
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
    isMoveMode?: boolean,
    centerOnInit?: { lat: number, lng: number }
}> = ({ start, end, onCalc, onMapClick, onDragOverlay, isMoveMode, centerOnInit }) => {
  const map = useMap();
  const [startPoint, setStartPoint] = useState<L.LatLng | null>(null);
  const [hasCenteredOnce, setHasCenteredOnce] = useState(false);
  
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
        map.setView([start.lat, start.lng], 19);
    }
  }, [start, end, map, onCalc]);

  useEffect(() => {
    // Only center once, and ONLY when we have a valid coordinate (preferably from Firebase)
    if (centerOnInit && !hasCenteredOnce) {
        // If we are still on default MAP_CENTER but firebase isn't loaded yet,
        // we might want to wait. But if Firebase IS loaded, we definitely center.
        map.setView([centerOnInit.lat, centerOnInit.lng], 19);
        setHasCenteredOnce(true);
    }
  }, [centerOnInit, hasCenteredOnce, map]);

  return null;
};

const MapComponent: React.FC<MapComponentProps> = ({ 
  startLocation, 
  destination,
  onPathCalculated 
}) => {
  const [adminMode, setAdminMode] = useState(false);
  const [isMoveMode, setIsMoveMode] = useState(false);
  const [isResizeMode, setIsResizeMode] = useState(false);
  const [hasLoadedFirebase, setHasLoadedFirebase] = useState(false);
  const [overlayBounds, setOverlayBounds] = useState({
      north: 14.05600,
      south: 14.05200,
      east: 121.28800,
      west: 121.28200
  });
  const [overlayOpacity, setOverlayOpacity] = useState(0.6);
  const [lastPin, setLastPin] = useState<{lat: number, lng: number} | null>(null);

  // 1. Listen for changes from Firebase
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "mapOverlay"), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        if (data.bounds) setOverlayBounds(data.bounds);
        if (data.opacity !== undefined) setOverlayOpacity(data.opacity);
        setHasLoadedFirebase(true);
      }
    });
    return () => unsub();
  }, []);

  // 2. Manual Save to Firebase
  const handleSaveToFirebase = async () => {
    try {
      await setDoc(doc(db, "settings", "mapOverlay"), {
        bounds: overlayBounds,
        opacity: overlayOpacity,
        updatedAt: new Date()
      }, { merge: true });
      toast.success("Map settings saved to Firebase!");
    } catch (e) {
      console.error("Error saving map settings:", e);
      toast.error("Failed to save settings. Check console.");
    }
  };
 
  const handleSaveLot = async (lotData: any) => {
    try {
      if (!lotData.block || !lotData.lot) {
        toast.error("Block and Lot are required");
        return;
      }
      await addDoc(collection(db, "lots"), {
        ...lotData,
        createdAt: new Date()
      });
      toast.success(`Lot ${lotData.block}-${lotData.lot} saved!`);
    } catch (e) {
      console.error("Error saving lot:", e);
      toast.error("Error saving lot. Check console.");
    }
  };

  const handleDragOverlay = (deltaLat: number, deltaLng: number) => {
      setOverlayBounds(prev => ({
          north: prev.north + deltaLat,
          south: prev.south + deltaLat,
          east: prev.east + deltaLng,
          west: prev.west + deltaLng
      }));
  };

  const handleResizeOverlay = (handleId: string, newLat: number, newLng: number) => {
    setOverlayBounds(prev => {
        const newBounds = { ...prev };
        if (handleId.includes('north')) newBounds.north = newLat;
        if (handleId.includes('south')) newBounds.south = newLat;
        if (handleId.includes('east')) newBounds.east = newLng;
        if (handleId.includes('west')) newBounds.west = newLng;
        return newBounds;
    });
  };

  const leafletBounds: L.LatLngBoundsExpression = [
      [overlayBounds.south, overlayBounds.west],
      [overlayBounds.north, overlayBounds.east]
  ];

  // Corners for resize nodes
  const nodes = [
    { id: 'north-west', position: [overlayBounds.north, overlayBounds.west] },
    { id: 'north-east', position: [overlayBounds.north, overlayBounds.east] },
    { id: 'south-west', position: [overlayBounds.south, overlayBounds.west] },
    { id: 'south-east', position: [overlayBounds.south, overlayBounds.east] },
  ];

  return (
    <Box sx={containerStyle}>
      <MapContainer 
        center={[MAP_CENTER.lat, MAP_CENTER.lng]} 
        zoom={19} 
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
          opacity={overlayOpacity}
        />

        {/* Resize Nodes */}
        {adminMode && isResizeMode && nodes.map(node => (
            <Marker 
              key={node.id} 
              position={node.position as L.LatLngExpression}
              draggable={true}
              eventHandlers={{
                drag: (e) => {
                  const latLng = e.target.getLatLng();
                  handleResizeOverlay(node.id, latLng.lat, latLng.lng);
                }
              }}
              icon={L.divIcon({
                className: 'resize-node',
                html: `<div style="width: 12px; height: 12px; background: #e11d48; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 5px rgba(0,0,0,0.3);"></div>`,
                iconSize: [12, 12],
                iconAnchor: [6, 6]
              })}
            />
        ))}

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
          centerOnInit={hasLoadedFirebase ? {
            lat: (overlayBounds.north + overlayBounds.south) / 2,
            lng: (overlayBounds.east + overlayBounds.west) / 2
          } : undefined}
        />
      </MapContainer>

      {/* Admin Toggle */}
      <Button
        variant="contained"
        size="small"
        startIcon={<Settings size={14} />}
        onClick={() => {
            if (adminMode) {
                setIsMoveMode(false);
                setIsResizeMode(false);
            }
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
            borderRadius: 1,
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
            opacity={overlayOpacity}
            onOpacityChange={setOverlayOpacity}
            onSave={handleSaveToFirebase}
            onSaveLot={handleSaveLot}
            lastClickedCoord={lastPin}
            isMoveMode={isMoveMode}
            onToggleMoveMode={() => {
                setIsMoveMode(!isMoveMode);
                if (!isMoveMode) setIsResizeMode(false);
            }}
            isResizeMode={isResizeMode}
            onToggleResizeMode={() => {
                setIsResizeMode(!isResizeMode);
                if (!isResizeMode) setIsMoveMode(false);
            }}
          />
      )}
    </Box>
  );
};

export default React.memo(MapComponent);
