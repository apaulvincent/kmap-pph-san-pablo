import {
    alpha,
    Box,
    Button,
    Paper,
    Stack,
    TextField,
    Typography
} from '@mui/material';
import { Copy, Move, Settings } from 'lucide-react';
import React, { useState } from 'react';

interface AdminToolProps {
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  onBoundsChange: (newBounds: any) => void;
  lastClickedCoord: { lat: number; lng: number } | null;
  isMoveMode: boolean;
  onToggleMoveMode: () => void;
}

const AdminTool: React.FC<AdminToolProps> = ({ 
    bounds, 
    onBoundsChange, 
    lastClickedCoord,
    isMoveMode,
    onToggleMoveMode
}) => {
  const [blockName, setBlockName] = useState("");
  const [lotName, setLotName] = useState("");

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
        borderRadius: 3,
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
          <Button 
            size="small" 
            variant={isMoveMode ? "contained" : "outlined"} 
            color={isMoveMode ? "secondary" : "primary"}
            onClick={onToggleMoveMode}
            startIcon={<Move size={14} />}
            sx={{ borderRadius: 2, fontSize: '0.65rem', py: 0.5 }}
          >
            {isMoveMode ? "DRAGGING" : "DRAG MAP"}
          </Button>
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

        <Box sx={{ bgcolor: alpha('#1e3a8a', 0.05), p: 1.5, borderRadius: 2 }}>
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
              <Button 
                variant="contained" 
                size="small" 
                startIcon={<Copy size={14} />} 
                onClick={handleCopyCoord}
                fullWidth
              >
                Copy for blocks.ts
              </Button>
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
