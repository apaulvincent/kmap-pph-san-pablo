import {
    alpha,
    Box,
    Button,
    IconButton,
    Paper,
    Slider,
    Stack,
    TextField,
    Typography
} from '@mui/material';
import { Copy, Home, Move, Save, Settings } from 'lucide-react';
import React, { useState } from 'react';

interface AdminToolProps {
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  onBoundsChange: (newBounds: any) => void;
  opacity: number;
  onOpacityChange: (newOpacity: number) => void;
  onSave: () => void;
  onSaveLot: (lotData: any) => void;
  lastClickedCoord: { lat: number; lng: number } | null;
  isMoveMode: boolean;
  onToggleMoveMode: () => void;
  isResizeMode: boolean;
  onToggleResizeMode: () => void;
}

const AdminTool: React.FC<AdminToolProps> = ({ 
    bounds, 
    onBoundsChange, 
    opacity,
    onOpacityChange,
    onSave,
    onSaveLot,
    lastClickedCoord,
    isMoveMode,
    onToggleMoveMode,
    isResizeMode,
    onToggleResizeMode
}) => {
  const [blockName, setBlockName] = useState("");
  const [lotName, setLotName] = useState("");
  const [phase, setPhase] = useState("");

  const handleCopyCoord = () => {
    if (!lastClickedCoord) return;
    const jsonStr = `{ block: "${blockName}", lot: "${lotName}", coords: { lat: ${lastClickedCoord.lat.toFixed(6)}, lng: ${lastClickedCoord.lng.toFixed(6)}, label: "Block ${blockName} Lot ${lotName}" } },`;
    navigator.clipboard.writeText(jsonStr);
    alert("Copied entry to clipboard!");
  };

  return (
    <Paper
      elevation={4}
      sx={{
        position: 'absolute',
        top: 80,
        right: 24,
        zIndex: 2000,
        width: 320,
        p: 2,
        borderRadius: 1,
        background: alpha('#ffffff', 0.9),
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(0,0,0,0.1)',
      }}
    >
      <Stack spacing={2}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <Settings size={18} />
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>ADMIN: Map Aligner</Typography>
          </Box>
          <Stack direction="row" spacing={0.5}>
            <Button 
                size="small" 
                variant={isMoveMode ? "contained" : "outlined"} 
                color={isMoveMode ? "secondary" : "primary"}
                onClick={onToggleMoveMode}
                startIcon={<Move size={14} />}
                sx={{ borderRadius: 1, fontSize: '0.6rem', py: 0.5, minWidth: 0, px: 1 }}
            >
                {isMoveMode ? "DRAGGING" : "DRAG"}
            </Button>
            <Button 
                size="small" 
                variant={isResizeMode ? "contained" : "outlined"} 
                color={isResizeMode ? "secondary" : "primary"}
                onClick={onToggleResizeMode}
                startIcon={<Settings size={14} />} // Using Settings as placeholder icon for resize
                sx={{ borderRadius: 1, fontSize: '0.6rem', py: 0.5, minWidth: 0, px: 1 }}
            >
                {isResizeMode ? "RESIZING" : "RESIZE"}
            </Button>
          </Stack>
        </Box>

        <Box>
          <Typography variant="caption" sx={{ opacity: 0.6, display: 'block', mb: 1 }}>OVERLAY BOUNDS</Typography>
          <Stack spacing={1.5}>
            <TextField
              label="North"
              size="small"
              type="number"
              value={bounds.north}
              onChange={(e) => onBoundsChange({ ...bounds, north: parseFloat(e.target.value) || 0 })}
              inputProps={{ step: 0.000001 }}
            />
            <TextField
              label="South"
              size="small"
              type="number"
              value={bounds.south}
              onChange={(e) => onBoundsChange({ ...bounds, south: parseFloat(e.target.value) || 0 })}
              inputProps={{ step: 0.000001 }}
            />
            <TextField
              label="East"
              size="small"
              type="number"
              value={bounds.east}
              onChange={(e) => onBoundsChange({ ...bounds, east: parseFloat(e.target.value) || 0 })}
              inputProps={{ step: 0.000001 }}
            />
            <TextField
              label="West"
              size="small"
              type="number"
              value={bounds.west}
              onChange={(e) => onBoundsChange({ ...bounds, west: parseFloat(e.target.value) || 0 })}
              inputProps={{ step: 0.000001 }}
            />
          </Stack>
        </Box>

        <Box>
          <Typography variant="caption" sx={{ opacity: 0.6, display: 'block', mb: 1 }}>OVERLAY OPACITY</Typography>
          <Box px={1}>
            <Slider
              value={opacity}
              min={0}
              max={1}
              step={0.01}
              onChange={(_, val) => onOpacityChange(val as number)}
              valueLabelDisplay="auto"
            />
          </Box>
        </Box>

        <Button 
          variant="contained" 
          color="success" 
          onClick={onSave}
          startIcon={<Save size={16} />}
          fullWidth
          sx={{ borderRadius: 1, py: 1, fontWeight: 700 }}
        >
          Save to Firebase
        </Button>

        <Box sx={{ bgcolor: alpha('#1e3a8a', 0.05), p: 1.5, borderRadius: 1 }}>
          <Typography variant="caption" sx={{ opacity: 0.6, display: 'block', mb: 1 }}>PIN HOUSE (CLICK MAP)</Typography>
          {lastClickedCoord ? (
            <Stack spacing={1}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                Lat: {lastClickedCoord.lat.toFixed(6)}, Lng: {lastClickedCoord.lng.toFixed(6)}
              </Typography>
              <Stack direction="row" spacing={1}>
                <TextField size="small" placeholder="Blk" value={blockName} onChange={(e) => setBlockName(e.target.value)} />
                <TextField size="small" placeholder="Lot" value={lotName} onChange={(e) => setLotName(e.target.value)} />
              </Stack>
              <TextField size="small" fullWidth placeholder="Phase (e.g. Phase 1)" value={phase} onChange={(e) => setPhase(e.target.value)} />
              
              <Stack direction="row" spacing={1}>
                <Button 
                  variant="contained" 
                  size="small" 
                  startIcon={<Home size={14} />} 
                  onClick={() => onSaveLot({ block: blockName, lot: lotName, phase, coords: { lat: lastClickedCoord.lat, lng: lastClickedCoord.lng, label: `Block ${blockName} Lot ${lotName}` } })}
                  fullWidth
                  color="info"
                  sx={{ borderRadius: 1 }}
                >
                  Save to Firebase
                </Button>
                <IconButton 
                  size="small" 
                  onClick={handleCopyCoord}
                  sx={{ bgcolor: alpha('#000', 0.05) }}
                >
                  <Copy size={14} />
                </IconButton>
              </Stack>
            </Stack>
          ) : (
            <Typography variant="caption" sx={{ fontStyle: 'italic', opacity: 0.5 }}>
              Click anywhere on the map to get coordinates...
            </Typography>
          )}
        </Box>
      </Stack>
    </Paper>
  );
};

export default AdminTool;
