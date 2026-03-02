import {
    alpha,
    Box,
    Button,
    Chip,
    Divider,
    Fade,
    IconButton,
    Paper,
    Stack,
    TextField,
    Typography
} from '@mui/material';
import {
    Clock,
    LogIn,
    LogOut,
    Map as MapIcon,
    Navigation,
    Route,
    Search
} from 'lucide-react';
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import type { LocationCoords } from '../data/blocks';
import { SAMPLE_BLOCKS } from '../data/blocks';

interface SearchPanelProps {
  onSearch: (start: LocationCoords | null, end: LocationCoords | null) => void;
  distance: string;
  duration: string;
}

const SearchPanel: React.FC<SearchPanelProps> = ({ onSearch, distance, duration }) => {
  const { user, login, logout } = useAuth();
  const [startBlock, setStartBlock] = useState("");
  const [startLot, setStartLot] = useState("");
  const [destBlock, setDestBlock] = useState("");
  const [destLot, setDestLot] = useState("");
  const [isCurrentLocation, setIsCurrentLocation] = useState(false);

  const handleGetCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        const coords: LocationCoords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          label: "Current Location"
        };
        setIsCurrentLocation(true);
        // Find destination if set
        const dest = findLot(destBlock, destLot);
        onSearch(coords, dest);
      });
    } else {
      alert("Geolocation not supported");
    }
  };

  const findLot = (block: string, lot: string): LocationCoords | null => {
    const found = SAMPLE_BLOCKS.find(b => b.block === block && b.lot === lot);
    return found ? found.coords : null;
  };

  const handleSearch = () => {
    const start = isCurrentLocation 
      ? null // already set via geolocation
      : findLot(startBlock, startLot);
    
    const end = findLot(destBlock, destLot);

    if (end) {
      onSearch(start, end);
    } else {
      alert("Lot not found in demo data. Please try Block 1, Lot 1 or Block 12, Lot 5.");
    }
  };

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 24,
        left: 24,
        zIndex: 1000,
        width: 380,
        maxWidth: 'calc(100vw - 48px)',
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 3,
          background: alpha('#ffffff', 0.85),
          backdropFilter: 'blur(20px)',
          borderRadius: 4,
          border: '1px solid rgba(255, 255, 255, 0.4)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        }}
      >
        <Stack spacing={3}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h2" sx={{ fontSize: '1.25rem', color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
              <MapIcon size={20} /> KMap PPH
            </Typography>
            {user ? (
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="caption" sx={{ fontWeight: 600 }}>{user.displayName?.split(' ')[0]}</Typography>
                <IconButton color="primary" onClick={logout} sx={{ bgcolor: alpha('#1e3a8a', 0.05) }} size="small">
                  <LogOut size={16} />
                </IconButton>
              </Stack>
            ) : (
              <Button 
                variant="text" 
                size="small" 
                startIcon={<LogIn size={14} />}
                onClick={login}
                sx={{ fontSize: '0.75rem', fontWeight: 700 }}
              >
                Sign In
              </Button>
            )}
          </Box>

          <Divider sx={{ opacity: 0.1 }} />

          <Box>
            <Typography variant="subtitle1" gutterBottom sx={{ fontSize: '0.875rem', fontWeight: 700, opacity: 0.6, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Starting Point
            </Typography>
            <Stack direction="row" spacing={1} mb={2}>
              <Button 
                fullWidth 
                variant={isCurrentLocation ? "contained" : "outlined"}
                startIcon={<Navigation size={16} />}
                onClick={handleGetCurrentLocation}
                size="small"
                sx={{ borderRadius: 2 }}
              >
                Current GPS
              </Button>
              <Button 
                fullWidth 
                variant={!isCurrentLocation ? "contained" : "outlined"}
                startIcon={<Search size={16} />}
                onClick={() => setIsCurrentLocation(false)}
                size="small"
                sx={{ borderRadius: 2 }}
              >
                Manual
              </Button>
            </Stack>

            {!isCurrentLocation && (
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Block"
                  size="small"
                  value={startBlock}
                  onChange={(e) => setStartBlock(e.target.value)}
                  placeholder="e.g. 1"
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="Lot"
                  size="small"
                  value={startLot}
                  onChange={(e) => setStartLot(e.target.value)}
                  placeholder="e.g. 1"
                  sx={{ flex: 1 }}
                />
              </Stack>
            )}
            {isCurrentLocation && (
              <Chip 
                label="Using your GPS position" 
                color="info" 
                variant="outlined" 
                onDelete={() => setIsCurrentLocation(false)}
                sx={{ width: '100%', borderRadius: 2 }}
              />
            )}
          </Box>

          <Box>
            <Typography variant="subtitle1" gutterBottom sx={{ fontSize: '0.875rem', fontWeight: 700, opacity: 0.6, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Destination House
            </Typography>
            <Stack direction="row" spacing={2}>
              <TextField
                label="Block"
                size="small"
                value={destBlock}
                onChange={(e) => setDestBlock(e.target.value)}
                placeholder="e.g. 12"
                sx={{ flex: 1 }}
              />
              <TextField
                label="Lot"
                size="small"
                value={destLot}
                onChange={(e) => setDestLot(e.target.value)}
                placeholder="e.g. 5"
                sx={{ flex: 1 }}
              />
            </Stack>
          </Box>

          <Button 
            variant="contained" 
            fullWidth 
            onClick={handleSearch}
            sx={{ 
              py: 1.5, 
              bgcolor: 'primary.main',
              '&:hover': { bgcolor: 'primary.dark' },
              boxShadow: '0 4px 12px rgba(30, 58, 138, 0.3)'
            }}
          >
            Locate House & Route
          </Button>

          {distance && (
            <Fade in={!!distance}>
              <Paper 
                sx={{ 
                  p: 2, 
                  bgcolor: alpha('#1e3a8a', 0.04), 
                  borderRadius: 3,
                  border: '1px solid rgba(30, 58, 138, 0.1)'
                }}
              >
                <Stack direction="row" spacing={2} divider={<Divider orientation="vertical" flexItem sx={{ opacity: 0.1 }} />}>
                  <Box sx={{ flex: 1, textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ display: 'block', opacity: 0.6, fontWeight: 700 }}>DISTANCE</Typography>
                    <Typography variant="h6" color="primary" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                      <Route size={16} /> {distance}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: 1, textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ display: 'block', opacity: 0.6, fontWeight: 700 }}>TRAVEL TIME</Typography>
                    <Typography variant="h6" color="secondary.main" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                      <Clock size={16} /> {duration}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Fade>
          )}

          <Typography variant="caption" sx={{ textAlign: 'center', opacity: 0.4 }}>
            Subdivision map © PHirst Park Homes San Pablo. Pathfinding powered by Google.
          </Typography>
        </Stack>
      </Paper>
      
      {/* Firebase Placeholder */}
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="caption" sx={{ color: alpha('#000000', 0.3), fontWeight: 600 }}>
          Future Update: Firebase Auth for Saved Lots
        </Typography>
      </Box>
    </Box>
  );
};

export default SearchPanel;
