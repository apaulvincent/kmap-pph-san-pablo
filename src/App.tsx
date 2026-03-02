import { Box, CssBaseline, ThemeProvider } from '@mui/material';
import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import MapComponent from './components/MapComponent';
import SearchPanel from './components/SearchPanel';
import { AuthProvider } from './context/AuthContext';
import type { LocationCoords } from './data/blocks';
import { theme } from './theme/theme';

function App() {
  const [startLocation, setStartLocation] = useState<LocationCoords | null>(null);
  const [destination, setDestination] = useState<LocationCoords | null>(null);
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');

  const handleSearch = (start: LocationCoords | null, end: LocationCoords | null) => {
    setStartLocation(start);
    setDestination(end);
  };

  const handleClear = () => {
    setStartLocation(null);
    setDestination(null);
    setDistance('');
    setDuration('');
  };

  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Toaster position="top-center" />
        <Box sx={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
          
          {/* Main FREE Map (OpenStreetMap + Leaflet) */}
          <MapComponent 
            startLocation={startLocation}
            destination={destination}
            onPathCalculated={(dist, dur) => {
              setDistance(dist);
              setDuration(dur);
            }}
          />

          {/* Floating Search Panel */}
          <SearchPanel 
            onSearch={handleSearch}
            onClear={handleClear}
            distance={distance}
            duration={duration} 
          />

          {/* Settings / Manual Centering (Optional) */}
          <Box sx={{ position: 'absolute', bottom: 24, right: 24, zIndex: 1000, pointerEvents: 'none' }}>
              <Box sx={{ bgcolor: 'background.paper', p: 1, borderRadius: 1, border: '1px solid rgba(0,0,0,0.1)', pointerEvents: 'auto' }}>
                Map Engine: **OpenStreetMap (Free Stack)**
              </Box>
          </Box>
        </Box>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
