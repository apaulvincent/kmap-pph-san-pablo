export interface LocationCoords {
  lat: number;
  lng: number;
  label: string;
}

export interface BlockLot {
  block: string;
  lot: string;
  phase?: string;
  coords: LocationCoords;
}

// Map center: PHirst Park Homes San Pablo entrance
export const MAP_CENTER = { lat: 14.053805, lng: 121.284242 };

// Sample Coordinates for demonstration
export const SAMPLE_BLOCKS: BlockLot[] = [
  // Phase 1 - Entrance Area
  { block: "1", lot: "1", coords: { lat: 14.054320, lng: 121.284500, label: "Block 1 Lot 1" } },
  { block: "1", lot: "2", coords: { lat: 14.054280, lng: 121.284550, label: "Block 1 Lot 2" } },
  { block: "1", lot: "3", coords: { lat: 14.054240, lng: 121.284600, label: "Block 1 Lot 3" } },
  { block: "2", lot: "1", coords: { lat: 14.054500, lng: 121.284800, label: "Block 2 Lot 1" } },
  { block: "2", lot: "5", coords: { lat: 14.054450, lng: 121.284950, label: "Block 2 Lot 5" } },

  // Phase 2 - Near Prime Hub
  { block: "5", lot: "1", coords: { lat: 14.053900, lng: 121.285200, label: "Block 5 Lot 1" } },
  { block: "5", lot: "10", coords: { lat: 14.053750, lng: 121.285400, label: "Block 5 Lot 10" } },
  { block: "12", lot: "1", coords: { lat: 14.053600, lng: 121.286300, label: "Block 12 Lot 1" } },
  { block: "12", lot: "5", coords: { lat: 14.053400, lng: 121.286500, label: "Block 12 Lot 5" } },

  // Phase 3 - Deeper into subdivision
  { block: "20", lot: "1", coords: { lat: 14.052800, lng: 121.288000, label: "Block 20 Lot 1" } },
  { block: "20", lot: "15", coords: { lat: 14.052500, lng: 121.288500, label: "Block 20 Lot 15" } },
  { block: "25", lot: "1", coords: { lat: 14.052000, lng: 121.289500, label: "Block 25 Lot 1" } },

  // Landmarks
  { block: "Clubhouse", lot: "1", coords: { lat: 14.053535, lng: 121.286121, label: "Prime Hub Clubhouse" } },
  { block: "Pool", lot: "1", coords: { lat: 14.053600, lng: 121.286300, label: "Puddle Place (Pool)" } },
  { block: "Entrance", lot: "1", coords: { lat: 14.054452, lng: 121.284144, label: "Main Entrance" } },
  { block: "Basketball", lot: "1", coords: { lat: 14.053400, lng: 121.285800, label: "Pass Central (Basketball)" } }
];

export const getLotCoords = (block: string, lot: string): LocationCoords | null => {
  const found = SAMPLE_BLOCKS.find(b => b.block === block && b.lot === lot);
  return found ? found.coords : null;
};
