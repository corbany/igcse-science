import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  X, 
  Save, 
  RotateCcw, 
  Trash2, 
  Move, 
  Paintbrush, 
  Eraser, 
  Maximize2, 
  Minimize2, 
  ZoomIn, 
  ZoomOut, 
  Play, 
  Layers, 
  Compass, 
  Sparkles, 
  Shield, 
  Box, 
  Trees, 
  Home, 
  Check, 
  Undo,
  Download,
  Upload
} from 'lucide-react';
import { UserProfile } from '../types';
import { 
  TILE_SIZE, 
  TILE_GAP, 
  WORLD_TILE_SIZE, 
  TILES_COUNT, 
  MAP_SIZE,
  BuildingStyle,
  BuildingTile,
  GeneratedBuilding,
  generateBuilding,
  drawWaterBody,
  drawDirtRoad
} from './BattleRoyaleArena';

export interface MapEditorWorldData {
  tiles: any[][];
  scenery: any[];
  groundLoot: any[];
  buildings: any[];
}

interface MapDesignEditorProps {
  currentUser: UserProfile;
  worldData: MapEditorWorldData;
  onSaveMap: (updatedWorld: MapEditorWorldData) => void;
  onClose: () => void;
  onTestPlay: (targetX: number, targetY: number) => void;
}

type EditorMode = 'paint' | 'erase' | 'rearrange';
type PaletteCategory = 'terrain' | 'obstacles' | 'buildings' | 'loot';

interface SelectedTool {
  category: PaletteCategory;
  id: string;
  name: string;
  icon: string;
}

const STORAGE_KEY = 'igcse_royale_custom_map_corbanb';

export const MapDesignEditor: React.FC<MapDesignEditorProps> = ({
  currentUser,
  worldData,
  onSaveMap,
  onClose,
  onTestPlay
}) => {
  // Only corbanb@gisboyshigh.net is authorized
  const isAuthorized = currentUser?.email?.toLowerCase() === 'corbanb@gisboyshigh.net';

  // Local deep copy of world data for editing
  const [tiles, setTiles] = useState<any[][]>(() => {
    return worldData.tiles.map(row => row.map(t => ({ ...t })));
  });
  const [scenery, setScenery] = useState<any[]>(() => {
    return worldData.scenery.map(s => ({ ...s }));
  });
  const [buildings, setBuildings] = useState<any[]>(() => {
    return worldData.buildings.map(b => ({ ...b, tiles: b.tiles.map((bt: any) => ({ ...bt })) }));
  });
  const [groundLoot, setGroundLoot] = useState<any[]>(() => {
    return worldData.groundLoot.map(l => ({ ...l }));
  });

  // Editor modes and tool selection
  const [editorMode, setEditorMode] = useState<EditorMode>('paint');
  const [activeCategory, setActiveCategory] = useState<PaletteCategory>('terrain');
  const [selectedTool, setSelectedTool] = useState<SelectedTool>({
    category: 'terrain',
    id: 'water',
    name: 'Lake Water',
    icon: '💧'
  });
  const [brushSize, setBrushSize] = useState<number>(1); // 1, 2, 3, 4 tiles (1x1 exact center tile by default)

  // Canvas Viewport & Camera
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvasSize, setCanvasSize] = useState<{ width: number; height: number }>({ width: 1200, height: 800 });
  const [zoomLevel, setZoomLevel] = useState<number>(0.35); // 0.15 = overview, 1.0 = 1:1 tile view
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 200, y: 120 });
  const isDraggingPan = useRef<boolean>(false);
  const lastMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastPaintedTileRef = useRef<{ col: number; row: number } | null>(null);

  // Rearrange / Selection state
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [selectedObjectType, setSelectedObjectType] = useState<'scenery' | 'building' | 'loot' | null>(null);
  const isDraggingObject = useRef<boolean>(false);

  // Active Crosshair Tile Tracking (Ensures the tile directly in the center of the crosshair is targeted)
  const [hoveredTile, setHoveredTile] = useState<{ col: number; row: number; worldX: number; worldY: number } | null>(null);

  // Auto-resize canvas buffer to match exact display pixel dimensions 1:1
  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;

    const updateSize = () => {
      const w = Math.max(300, parent.clientWidth);
      const h = Math.max(300, parent.clientHeight);
      if (canvas.width !== w) canvas.width = w;
      if (canvas.height !== h) canvas.height = h;
      setCanvasSize({ width: w, height: h });
    };

    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(parent);
    window.addEventListener('resize', updateSize);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  // Status feedback
  const [statusMessage, setStatusMessage] = useState<string | null>('Ready. The highlighted tile inside the crosshair is what you edit.');
  const [historyStack, setHistoryStack] = useState<string[]>([]);

  // --------------------------------------------------------------------------
  // PALETTE DEFINITIONS
  // --------------------------------------------------------------------------
  const TERRAIN_PALETTE = [
    { id: 'water', name: 'Lake Water', icon: '💧', surface: 'water', color: '#0284c7' },
    { id: 'grass', name: 'Lush Grass', icon: '🌿', surface: 'grass', color: '#15803d' },
    { id: 'dirt', name: 'Dirt Road', icon: '🛣️', surface: 'dirt', color: '#78350f' },
    { id: 'stone', name: 'Stone Plaza', icon: '🧱', surface: 'stone', color: '#475569' },
    { id: 'sand', name: 'Desert Sand', icon: '🏜️', surface: 'sand', color: '#d97706' }
  ];

  const OBSTACLE_PALETTE = [
    { id: 'pine_tree', name: 'Pine Tree', icon: '🌲', type: 'pine_tree', mat: 'wood', hp: 90, w: 36, h: 48, radius: 14 },
    { id: 'round_tree', name: 'Oak Tree', icon: '🌳', type: 'round_tree', mat: 'wood', hp: 85, w: 38, h: 48, radius: 15 },
    { id: 'boulder', name: 'Stone Boulder', icon: '🪨', type: 'boulder', mat: 'brick', hp: 120, w: 34, h: 32, radius: 16 },
    { id: 'fence', name: 'Wood Fence', icon: '🪵', type: 'fence', mat: 'wood', hp: 70, w: 32, h: 32, radius: 12 },
    { id: 'bush', name: 'Stealth Bush', icon: '🌱', type: 'bush', mat: 'wood', hp: 40, w: 32, h: 32, radius: 14 },
    { id: 'tree_stump', name: 'Tree Stump', icon: '🪵', type: 'tree_stump', mat: 'wood', hp: 50, w: 32, h: 32, radius: 12 },
    { id: 'tent', name: 'Camp Tent', icon: '⛺', type: 'tent', mat: 'wood', hp: 110, w: 48, h: 48, radius: 20 },
    { id: 'barrel_oil', name: 'Metal Barrel', icon: '🛢️', type: 'barrel_oil', mat: 'metal', hp: 80, w: 28, h: 32, radius: 12 }
  ];

  const BUILDING_PALETTE = [
    { id: 'cabin_wood', name: 'Wood Cabin (3x3)', icon: '🪵', style: 'wood' as BuildingStyle, w: 3, h: 3 },
    { id: 'house_stone', name: 'Stone House (4x4)', icon: '🏠', style: 'stone' as BuildingStyle, w: 4, h: 4 },
    { id: 'castle_tower', name: 'Castle Tower (3x3)', icon: '🏰', style: 'castle' as BuildingStyle, w: 3, h: 3 },
    { id: 'cottage_brick', name: 'Brick Cottage (4x3)', icon: '🏡', style: 'brick' as BuildingStyle, w: 4, h: 3 }
  ];

  const LOOT_PALETTE = [
    { id: 'shield_cell', name: 'Shield Battery', icon: '🛡️', type: 'shield_cell' },
    { id: 'ammo_box', name: 'Heavy Ammo Crate', icon: '📦', type: 'ammo_box' },
    { id: 'speed_flask', name: 'Speed Stim Flask', icon: '⚡', type: 'speed_flask' },
    { id: 'banana', name: 'Health Fruit', icon: '🍌', type: 'banana' }
  ];

  // --------------------------------------------------------------------------
  // RENDER CANVAS MAP
  // --------------------------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Viewport dimensions
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    ctx.save();
    // Apply pan & zoom
    ctx.translate(panOffset.x, panOffset.y);
    ctx.scale(zoomLevel, zoomLevel);

    // 1. World Border Outline
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 4 / zoomLevel;
    ctx.strokeRect(0, 0, MAP_SIZE, MAP_SIZE);

    // 2. Base Terrain Layer
    const step = WORLD_TILE_SIZE;
    for (let r = 0; r < TILES_COUNT; r++) {
      for (let c = 0; c < TILES_COUNT; c++) {
        const t = tiles[r]?.[c];
        if (!t) continue;
        const x = c * step;
        const y = r * step;

        if (t.isWater || t.surface === 'water') {
          ctx.fillStyle = '#0284c7';
        } else if (t.isRoad || t.surface === 'dirt') {
          ctx.fillStyle = '#78350f';
        } else if (t.surface === 'stone') {
          ctx.fillStyle = '#64748b';
        } else if (t.surface === 'sand') {
          ctx.fillStyle = '#d97706';
        } else {
          ctx.fillStyle = (r + c) % 2 === 0 ? '#16a34a' : '#15803d';
        }

        ctx.fillRect(x, y, step, step);
      }
    }

    // 3. Grid Lines (when zoomed in)
    if (zoomLevel >= 0.3) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= TILES_COUNT; i += 4) {
        ctx.beginPath();
        ctx.moveTo(i * step, 0);
        ctx.lineTo(i * step, MAP_SIZE);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i * step);
        ctx.lineTo(MAP_SIZE, i * step);
        ctx.stroke();
      }
    }

    // 4. Buildings Layer
    buildings.forEach(b => {
      ctx.fillStyle = b.style === 'wood' ? '#854d0e' : b.style === 'castle' ? '#475569' : '#334155';
      ctx.fillRect(b.worldX, b.worldY, b.worldW, b.worldH);

      ctx.strokeStyle = selectedObjectId === b.id ? '#fbbf24' : '#1e293b';
      ctx.lineWidth = selectedObjectId === b.id ? 4 : 2;
      ctx.strokeRect(b.worldX, b.worldY, b.worldW, b.worldH);

      // Label
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText(b.name || 'Building', b.worldX + 10, b.worldY + 24);
    });

    // 5. Scenery Props Layer (Sorted by Y)
    const sortedProps = [...scenery].sort((a, b) => a.y - b.y);
    sortedProps.forEach(sc => {
      const isSel = selectedObjectId === sc.id;
      if (sc.type === 'pine_tree') {
        ctx.fillStyle = '#064e3b';
        ctx.beginPath();
        ctx.arc(sc.x, sc.y - 16, sc.radius || 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#78350f';
        ctx.fillRect(sc.x - 3, sc.y - 4, 6, 8);
      } else if (sc.type === 'round_tree') {
        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.arc(sc.x, sc.y - 18, sc.radius || 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#78350f';
        ctx.fillRect(sc.x - 4, sc.y - 6, 8, 10);
      } else if (sc.type === 'boulder') {
        ctx.fillStyle = '#64748b';
        ctx.beginPath();
        ctx.arc(sc.x, sc.y, sc.radius || 15, 0, Math.PI * 2);
        ctx.fill();
      } else if (sc.type === 'fence') {
        ctx.fillStyle = '#b45309';
        ctx.fillRect(sc.x - 14, sc.y - 6, 28, 12);
      } else if (sc.type === 'bush') {
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(sc.x, sc.y, sc.radius || 14, 0, Math.PI * 2);
        ctx.fill();
      } else if (sc.type === 'tent') {
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(sc.x - 20, sc.y - 20, 40, 40);
      } else {
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(sc.x - 12, sc.y - 12, 24, 24);
      }

      if (isSel) {
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(sc.x, sc.y - 10, (sc.radius || 16) + 6, 0, Math.PI * 2);
        ctx.stroke();
      }
    });

    // 6. Ground Loot Layer
    groundLoot.forEach(loot => {
      ctx.fillStyle = loot.type === 'shield_cell' ? '#38bdf8' : loot.type === 'ammo_box' ? '#fbbf24' : '#a855f7';
      ctx.beginPath();
      ctx.arc(loot.x, loot.y, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = selectedObjectId === loot.id ? '#fbbf24' : '#0f172a';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // 7. Active Precision Crosshair & Targeted Tile Highlight
    if (hoveredTile && hoveredTile.col >= 0 && hoveredTile.col < TILES_COUNT && hoveredTile.row >= 0 && hoveredTile.row < TILES_COUNT) {
      let targetStartCol = hoveredTile.col;
      let targetStartRow = hoveredTile.row;
      let targetCols = 1;
      let targetRows = 1;

      if (editorMode === 'paint' && selectedTool.category === 'buildings') {
        const bDef = BUILDING_PALETTE.find(b => b.id === selectedTool.id) || BUILDING_PALETTE[0];
        targetCols = bDef.w;
        targetRows = bDef.h;
        targetStartCol = Math.max(0, Math.min(TILES_COUNT - targetCols, hoveredTile.col - Math.floor(targetCols / 2)));
        targetStartRow = Math.max(0, Math.min(TILES_COUNT - targetRows, hoveredTile.row - Math.floor(targetRows / 2)));
      } else if ((editorMode === 'paint' && selectedTool.category === 'terrain') || editorMode === 'erase') {
        const b = getBrushBounds(hoveredTile.worldX, hoveredTile.worldY, hoveredTile.col, hoveredTile.row, brushSize);
        targetStartCol = b.startCol;
        targetStartRow = b.startRow;
        targetCols = b.size;
        targetRows = b.size;
      }

      // Highlight bounding box around exact targeted tile(s)
      ctx.fillStyle = editorMode === 'erase' ? 'rgba(239, 68, 68, 0.32)' : 'rgba(251, 191, 36, 0.32)';
      ctx.fillRect(targetStartCol * WORLD_TILE_SIZE, targetStartRow * WORLD_TILE_SIZE, targetCols * WORLD_TILE_SIZE, targetRows * WORLD_TILE_SIZE);

      ctx.strokeStyle = editorMode === 'erase' ? '#ef4444' : '#fbbf24';
      ctx.lineWidth = 2.5 / zoomLevel;
      ctx.strokeRect(targetStartCol * WORLD_TILE_SIZE, targetStartRow * WORLD_TILE_SIZE, targetCols * WORLD_TILE_SIZE, targetRows * WORLD_TILE_SIZE);

      // Highlight the exact single tile at the center of the crosshair
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5 / zoomLevel;
      ctx.strokeRect(hoveredTile.col * WORLD_TILE_SIZE, hoveredTile.row * WORLD_TILE_SIZE, WORLD_TILE_SIZE, WORLD_TILE_SIZE);

      // Exact Center of the targeted tile (snapped crosshair center)
      const cx = (hoveredTile.col + 0.5) * WORLD_TILE_SIZE;
      const cy = (hoveredTile.row + 0.5) * WORLD_TILE_SIZE;
      const crossSize = 18 / zoomLevel;

      // Crosshair Hairlines meeting precisely at center of targeted tile
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2 / zoomLevel;
      ctx.beginPath();
      ctx.moveTo(cx - crossSize, cy);
      ctx.lineTo(cx + crossSize, cy);
      ctx.moveTo(cx, cy - crossSize);
      ctx.lineTo(cx, cy + crossSize);
      ctx.stroke();

      // Outer targeting ring
      ctx.strokeStyle = editorMode === 'erase' ? '#ef4444' : '#fbbf24';
      ctx.lineWidth = 1.8 / zoomLevel;
      ctx.beginPath();
      ctx.arc(cx, cy, 8 / zoomLevel, 0, Math.PI * 2);
      ctx.stroke();

      // Precision Center Reticle Dot
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(cx, cy, 2.5 / zoomLevel, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }, [tiles, scenery, buildings, groundLoot, zoomLevel, panOffset, selectedObjectId, hoveredTile, editorMode, selectedTool, brushSize, canvasSize]);

  // Helper: Shared centered brush bounds used identically for crosshair preview & editing
  function getBrushBounds(worldX: number, worldY: number, tileCol: number, tileRow: number, size: number) {
    let startCol = tileCol;
    let startRow = tileRow;
    if (size % 2 === 1) {
      // Odd sizes (1x1, 3x3): hovered tile is exact center
      const half = Math.floor(size / 2);
      startCol = tileCol - half;
      startRow = tileRow - half;
    } else {
      // Even sizes (2x2, 4x4): centered around nearest grid intersection to cursor
      startCol = Math.round(worldX / WORLD_TILE_SIZE) - size / 2;
      startRow = Math.round(worldY / WORLD_TILE_SIZE) - size / 2;
    }
    return { startCol, startRow, size };
  }

  // --------------------------------------------------------------------------
  // INTERACTIVE CANVAS INTERACTIONS (Paint, Erase, Drag Rearrange)
  // --------------------------------------------------------------------------
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { worldX: 0, worldY: 0, tileCol: 0, tileRow: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / Math.max(1, rect.width);
    const scaleY = canvas.height / Math.max(1, rect.height);
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    const worldX = (mouseX - panOffset.x) / zoomLevel;
    const worldY = (mouseY - panOffset.y) / zoomLevel;
    const tileCol = Math.floor(worldX / WORLD_TILE_SIZE);
    const tileRow = Math.floor(worldY / WORLD_TILE_SIZE);

    return { worldX, worldY, tileCol, tileRow };
  };

  const applyToolAt = (worldX: number, worldY: number, tileCol: number, tileRow: number) => {
    if (tileCol < 0 || tileCol >= TILES_COUNT || tileRow < 0 || tileRow >= TILES_COUNT) return;

    const tileCenterX = Math.round((tileCol + 0.5) * WORLD_TILE_SIZE);
    const tileCenterY = Math.round((tileRow + 0.5) * WORLD_TILE_SIZE);

    if (editorMode === 'erase') {
      // 1. Remove any scenery prop near hovered tile center or cursor
      const propIdx = scenery.findIndex(s =>
        Math.hypot(s.x - tileCenterX, s.y - tileCenterY) < (s.radius || 20) + 12 ||
        Math.hypot(s.x - worldX, s.y - worldY) < (s.radius || 20) + 10
      );
      if (propIdx >= 0) {
        setScenery(prev => prev.filter((_, idx) => idx !== propIdx));
        setStatusMessage(`Removed obstacle prop at tile [${tileCol}, ${tileRow}].`);
        return;
      }

      // 2. Remove building if clicked inside
      const bldgIdx = buildings.findIndex(b => 
        worldX >= b.worldX && worldX <= b.worldX + b.worldW &&
        worldY >= b.worldY && worldY <= b.worldY + b.worldH
      );
      if (bldgIdx >= 0) {
        setBuildings(prev => prev.filter((_, idx) => idx !== bldgIdx));
        setStatusMessage(`Removed building at tile [${tileCol}, ${tileRow}].`);
        return;
      }

      // 3. Remove ground loot
      const lootIdx = groundLoot.findIndex(l =>
        Math.hypot(l.x - tileCenterX, l.y - tileCenterY) < 22 ||
        Math.hypot(l.x - worldX, l.y - worldY) < 20
      );
      if (lootIdx >= 0) {
        setGroundLoot(prev => prev.filter((_, idx) => idx !== lootIdx));
        setStatusMessage(`Removed loot item at tile [${tileCol}, ${tileRow}].`);
        return;
      }

      // 4. Otherwise revert terrain tiles centered under crosshair to grass
      const { startCol, startRow, size } = getBrushBounds(worldX, worldY, tileCol, tileRow, brushSize);
      setTiles(prev => {
        const copy = prev.map(r => [...r]);
        for (let dy = 0; dy < size; dy++) {
          for (let dx = 0; dx < size; dx++) {
            const c = startCol + dx;
            const r = startRow + dy;
            if (r >= 0 && r < TILES_COUNT && c >= 0 && c < TILES_COUNT) {
              copy[r][c] = {
                biome: 'meadows',
                surface: 'grass',
                baseColor: '#15803d',
                sheetCol: 5,
                sheetRow: 0,
                detailType: 0,
                isWater: false,
                isRoad: false
              };
            }
          }
        }
        return copy;
      });
      setStatusMessage(`Erased tile [${tileCol}, ${tileRow}] to grass.`);
      return;
    }

    if (editorMode === 'paint') {
      if (selectedTool.category === 'terrain') {
        const { startCol, startRow, size } = getBrushBounds(worldX, worldY, tileCol, tileRow, brushSize);
        setTiles(prev => {
          const copy = prev.map(r => [...r]);
          for (let dy = 0; dy < size; dy++) {
            for (let dx = 0; dx < size; dx++) {
              const c = startCol + dx;
              const r = startRow + dy;
              if (r >= 0 && r < TILES_COUNT && c >= 0 && c < TILES_COUNT) {
                if (selectedTool.id === 'water') {
                  copy[r][c].surface = 'water';
                  copy[r][c].baseColor = '#0284c7';
                  copy[r][c].isWater = true;
                  copy[r][c].isRoad = false;
                  copy[r][c].overlayCol = 1;
                  copy[r][c].overlayRow = 1;
                } else if (selectedTool.id === 'dirt') {
                  copy[r][c].surface = 'dirt';
                  copy[r][c].baseColor = '#78350f';
                  copy[r][c].isWater = false;
                  copy[r][c].isRoad = true;
                  copy[r][c].overlayCol = 6;
                  copy[r][c].overlayRow = 0;
                } else if (selectedTool.id === 'stone') {
                  copy[r][c].surface = 'stone';
                  copy[r][c].baseColor = '#475569';
                  copy[r][c].isWater = false;
                  copy[r][c].isRoad = true;
                  copy[r][c].overlayCol = 8;
                  copy[r][c].overlayRow = 3;
                } else if (selectedTool.id === 'sand') {
                  copy[r][c].surface = 'sand';
                  copy[r][c].baseColor = '#d97706';
                  copy[r][c].isWater = false;
                  copy[r][c].isRoad = false;
                } else {
                  copy[r][c].surface = 'grass';
                  copy[r][c].baseColor = '#15803d';
                  copy[r][c].isWater = false;
                  copy[r][c].isRoad = false;
                  copy[r][c].sheetCol = 5;
                  copy[r][c].sheetRow = 0;
                }
              }
            }
          }
          return copy;
        });
        setStatusMessage(`Painted ${selectedTool.name} centered on tile [${tileCol}, ${tileRow}].`);
      } else if (selectedTool.category === 'obstacles') {
        const def = OBSTACLE_PALETTE.find(o => o.id === selectedTool.id) || OBSTACLE_PALETTE[0];
        const newProp = {
          id: `prop_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          x: tileCenterX,
          y: tileCenterY,
          type: def.type,
          width: def.w,
          height: def.h,
          footprintRadius: def.radius,
          radius: def.radius,
          hp: def.hp,
          maxHp: def.hp,
          materialDrop: def.mat,
          dropAmount: 5,
          spriteKey: def.type
        };
        setScenery(prev => [...prev, newProp]);
        setStatusMessage(`Placed ${def.name} at center of tile [${tileCol}, ${tileRow}].`);
      } else if (selectedTool.category === 'buildings') {
        const bDef = BUILDING_PALETTE.find(b => b.id === selectedTool.id) || BUILDING_PALETTE[0];
        const startCol = Math.max(0, Math.min(TILES_COUNT - bDef.w, tileCol - Math.floor(bDef.w / 2)));
        const startRow = Math.max(0, Math.min(TILES_COUNT - bDef.h, tileRow - Math.floor(bDef.h / 2)));
        const newBuilding = generateBuilding(
          startCol, 
          startRow, 
          bDef.w, 
          bDef.h, 
          bDef.style, 
          bDef.name
        );
        setBuildings(prev => [...prev, newBuilding]);
        setStatusMessage(`Constructed ${bDef.name} centered at tile [${tileCol}, ${tileRow}].`);
      } else if (selectedTool.category === 'loot') {
        const lDef = LOOT_PALETTE.find(l => l.id === selectedTool.id) || LOOT_PALETTE[0];
        const newLoot = {
          id: `loot_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          x: tileCenterX,
          y: tileCenterY,
          type: lDef.type,
          name: lDef.name,
          spriteKey: lDef.type,
          isCollected: false
        };
        setGroundLoot(prev => [...prev, newLoot]);
        setStatusMessage(`Spawned ${lDef.name} at center of tile [${tileCol}, ${tileRow}].`);
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Right click or Alt+Click: pan canvas
    if (e.button === 2 || e.altKey) {
      isDraggingPan.current = true;
      lastMousePos.current = { x: e.clientX, y: e.clientY };
      return;
    }

    const { worldX, worldY, tileCol, tileRow } = getCanvasCoords(e);
    setHoveredTile({ col: tileCol, row: tileRow, worldX, worldY });

    if (editorMode === 'rearrange') {
      // Find object under cursor
      const clickedProp = scenery.find(s => Math.hypot(s.x - worldX, s.y - worldY) < (s.radius || 20) + 12);
      if (clickedProp) {
        setSelectedObjectId(clickedProp.id);
        setSelectedObjectType('scenery');
        isDraggingObject.current = true;
        setStatusMessage(`Selected ${clickedProp.type}. Drag mouse to move.`);
        return;
      }

      const clickedBldg = buildings.find(b => 
        worldX >= b.worldX && worldX <= b.worldX + b.worldW &&
        worldY >= b.worldY && worldY <= b.worldY + b.worldH
      );
      if (clickedBldg) {
        setSelectedObjectId(clickedBldg.id);
        setSelectedObjectType('building');
        isDraggingObject.current = true;
        setStatusMessage(`Selected ${clickedBldg.name}. Drag mouse to move.`);
        return;
      }

      const clickedLoot = groundLoot.find(l => Math.hypot(l.x - worldX, l.y - worldY) < 25);
      if (clickedLoot) {
        setSelectedObjectId(clickedLoot.id);
        setSelectedObjectType('loot');
        isDraggingObject.current = true;
        setStatusMessage(`Selected ${clickedLoot.name}. Drag mouse to move.`);
        return;
      }

      setSelectedObjectId(null);
      setSelectedObjectType(null);
      return;
    }

    // Paint or Erase mode
    lastPaintedTileRef.current = { col: tileCol, row: tileRow };
    applyToolAt(worldX, worldY, tileCol, tileRow);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDraggingPan.current) {
      const dx = e.clientX - lastMousePos.current.x;
      const dy = e.clientY - lastMousePos.current.y;
      setPanOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      lastMousePos.current = { x: e.clientX, y: e.clientY };
      return;
    }

    const { worldX, worldY, tileCol, tileRow } = getCanvasCoords(e);
    setHoveredTile({ col: tileCol, row: tileRow, worldX, worldY });

    if (isDraggingObject.current && selectedObjectId) {
      const tileCenterX = Math.round((tileCol + 0.5) * WORLD_TILE_SIZE);
      const tileCenterY = Math.round((tileRow + 0.5) * WORLD_TILE_SIZE);

      if (selectedObjectType === 'scenery') {
        setScenery(prev => prev.map(s => {
          if (s.id === selectedObjectId) {
            return { ...s, x: tileCenterX, y: tileCenterY };
          }
          return s;
        }));
      } else if (selectedObjectType === 'building') {
        setBuildings(prev => prev.map(b => {
          if (b.id === selectedObjectId) {
            const snappedCol = Math.max(0, Math.min(TILES_COUNT - b.width, tileCol - Math.floor(b.width / 2)));
            const snappedRow = Math.max(0, Math.min(TILES_COUNT - b.height, tileRow - Math.floor(b.height / 2)));
            return {
              ...b,
              tileX: snappedCol,
              tileY: snappedRow,
              worldX: snappedCol * WORLD_TILE_SIZE,
              worldY: snappedRow * WORLD_TILE_SIZE
            };
          }
          return b;
        }));
      } else if (selectedObjectType === 'loot') {
        setGroundLoot(prev => prev.map(l => {
          if (l.id === selectedObjectId) {
            return { ...l, x: tileCenterX, y: tileCenterY };
          }
          return l;
        }));
      }
      return;
    }

    // Continuous painting on drag for terrain or erase (deduplicated per tile)
    const canDragPaint = editorMode === 'erase' || (editorMode === 'paint' && selectedTool.category === 'terrain');
    if (e.buttons === 1 && canDragPaint) {
      if (!lastPaintedTileRef.current || lastPaintedTileRef.current.col !== tileCol || lastPaintedTileRef.current.row !== tileRow) {
        lastPaintedTileRef.current = { col: tileCol, row: tileRow };
        applyToolAt(worldX, worldY, tileCol, tileRow);
      }
    }
  };

  const handleMouseUp = () => {
    isDraggingPan.current = false;
    isDraggingObject.current = false;
    lastPaintedTileRef.current = null;
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / Math.max(1, rect.width);
    const scaleY = canvas.height / Math.max(1, rect.height);
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    const zoomFactor = e.deltaY < 0 ? 1.12 : 0.89;
    const newZoom = Math.min(2.0, Math.max(0.12, zoomLevel * zoomFactor));

    // Anchor zoom right at the crosshair position
    const worldX = (mouseX - panOffset.x) / zoomLevel;
    const worldY = (mouseY - panOffset.y) / zoomLevel;
    setPanOffset({
      x: mouseX - worldX * newZoom,
      y: mouseY - worldY * newZoom
    });
    setZoomLevel(newZoom);
  };

  // --------------------------------------------------------------------------
  // SAVE, RESET & PRESETS
  // --------------------------------------------------------------------------
  const handleSaveMap = () => {
    const updatedWorld: MapEditorWorldData = {
      tiles,
      scenery,
      groundLoot,
      buildings
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedWorld));
    } catch {
      // localStorage may fail if large; ignore
    }

    onSaveMap(updatedWorld);
    setStatusMessage('✅ Custom map saved successfully! Arena is synced.');
  };

  const handleClearAllObstacles = () => {
    if (window.confirm('Clear all trees, rocks, fences, and props from the arena?')) {
      setScenery([]);
      setStatusMessage('Wiped all obstacle props.');
    }
  };

  const handleResetToDefault = () => {
    if (window.confirm('Reset arena back to the standard Super Animal Style default map?')) {
      localStorage.removeItem(STORAGE_KEY);
      setTiles(worldData.tiles.map(row => row.map(t => ({ ...t }))));
      setScenery(worldData.scenery.map(s => ({ ...s })));
      setBuildings(worldData.buildings.map(b => ({ ...b })));
      setGroundLoot(worldData.groundLoot.map(l => ({ ...l })));
      setStatusMessage('Reset to default arena layout.');
    }
  };

  // If not corbanb@gisboyshigh.net, block access
  if (!isAuthorized) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-2xl max-w-md text-center space-y-4 shadow-xl border border-slate-200">
          <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto font-bold text-xl">
            🔒
          </div>
          <h2 className="text-xl font-bold text-slate-900">Map Designer Restricted</h2>
          <p className="text-xs text-slate-600">
            Map design controls are exclusively available for instructor account <strong>corbanb@gisboyshigh.net</strong>.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex flex-col select-none text-slate-800 animate-in fade-in">
      {/* Top Header Bar */}
      <div className="h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between shrink-0 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-100 border border-purple-300 text-purple-700 font-black flex items-center justify-center text-base">
            🛠️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-slate-900 tracking-tight">
                Revision Royale • Interactive Map Studio
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-300">
                corbanb@gisboyshigh.net
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Add, remove, and rearrange tiles, obstacles, lakes, roads, and buildings across the 5120px arena.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const updatedWorld: MapEditorWorldData = { tiles, scenery, groundLoot, buildings };
              try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedWorld));
              } catch {}
              onSaveMap(updatedWorld);
              const centerWorldX = (canvasSize.width / 2 - panOffset.x) / zoomLevel;
              const centerWorldY = (canvasSize.height / 2 - panOffset.y) / zoomLevel;
              onTestPlay(centerWorldX, centerWorldY);
            }}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            title="Save and launch live arena testing at the current map center"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Test Map in Game</span>
          </button>

          <button
            onClick={handleSaveMap}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Custom Map</span>
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition cursor-pointer"
            title="Close Map Editor"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Studio Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Toolbar & Palette */}
        <div className="w-72 bg-white border-r border-slate-200 flex flex-col shrink-0 overflow-y-auto">
          {/* Mode Selector */}
          <div className="p-3 border-b border-slate-200 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
              Editor Mode
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => setEditorMode('paint')}
                className={`py-2 px-1 rounded-lg text-xs font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
                  editorMode === 'paint'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Paintbrush className="w-4 h-4" />
                <span>Add / Paint</span>
              </button>

              <button
                onClick={() => setEditorMode('erase')}
                className={`py-2 px-1 rounded-lg text-xs font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
                  editorMode === 'erase'
                    ? 'bg-rose-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Eraser className="w-4 h-4" />
                <span>Remove</span>
              </button>

              <button
                onClick={() => setEditorMode('rearrange')}
                className={`py-2 px-1 rounded-lg text-xs font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
                  editorMode === 'rearrange'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Move className="w-4 h-4" />
                <span>Rearrange</span>
              </button>
            </div>
          </div>

          {/* Palette Category Selector (for Paint mode) */}
          {editorMode === 'paint' && (
            <div className="p-3 border-b border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                  Tool Palette
                </span>
                {/* Brush size */}
                <div className="flex items-center gap-1 text-[11px] font-mono text-slate-600">
                  <span>Size:</span>
                  {[1, 2, 3, 4].map(s => (
                    <button
                      key={s}
                      onClick={() => setBrushSize(s)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                        brushSize === s ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {s}x{s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-4 gap-1 text-[11px] font-bold">
                {[
                  { cat: 'terrain', label: 'Terrain', icon: '🌿' },
                  { cat: 'obstacles', label: 'Cover', icon: '🌲' },
                  { cat: 'buildings', label: 'Buildings', icon: '🏠' },
                  { cat: 'loot', label: 'Spawns', icon: '🎁' }
                ].map(tab => (
                  <button
                    key={tab.cat}
                    onClick={() => setActiveCategory(tab.cat as PaletteCategory)}
                    className={`py-1.5 px-1 rounded-md flex flex-col items-center transition cursor-pointer ${
                      activeCategory === tab.cat
                        ? 'bg-slate-200 text-slate-900 border border-slate-300 font-bold'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span className="text-[9px] mt-0.5">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tool Items Grid */}
          <div className="flex-1 p-3 overflow-y-auto space-y-1.5">
            {editorMode === 'paint' && activeCategory === 'terrain' && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wide block mb-1">
                  Terrain Tiles
                </span>
                {TERRAIN_PALETTE.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTool({ category: 'terrain', id: t.id, name: t.name, icon: t.icon })}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-xs font-semibold transition cursor-pointer border ${
                      selectedTool.id === t.id
                        ? 'bg-purple-50 border-purple-400 text-purple-900 shadow-2xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{t.icon}</span>
                      <span>{t.name}</span>
                    </div>
                    <span className="w-3.5 h-3.5 rounded-full border border-black/10" style={{ backgroundColor: t.color }} />
                  </button>
                ))}
              </div>
            )}

            {editorMode === 'paint' && activeCategory === 'obstacles' && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wide block mb-1">
                  Obstacles, Cover & Trees
                </span>
                {OBSTACLE_PALETTE.map(o => (
                  <button
                    key={o.id}
                    onClick={() => setSelectedTool({ category: 'obstacles', id: o.id, name: o.name, icon: o.icon })}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-xs font-semibold transition cursor-pointer border ${
                      selectedTool.id === o.id
                        ? 'bg-purple-50 border-purple-400 text-purple-900 shadow-2xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{o.icon}</span>
                      <span>{o.name}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">{o.hp} HP</span>
                  </button>
                ))}
              </div>
            )}

            {editorMode === 'paint' && activeCategory === 'buildings' && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wide block mb-1">
                  Pre-Fab Structures
                </span>
                {BUILDING_PALETTE.map(b => (
                  <button
                    key={b.id}
                    onClick={() => setSelectedTool({ category: 'buildings', id: b.id, name: b.name, icon: b.icon })}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-xs font-semibold transition cursor-pointer border ${
                      selectedTool.id === b.id
                        ? 'bg-purple-50 border-purple-400 text-purple-900 shadow-2xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{b.icon}</span>
                      <span>{b.name}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">{b.w}x{b.h}</span>
                  </button>
                ))}
              </div>
            )}

            {editorMode === 'paint' && activeCategory === 'loot' && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wide block mb-1">
                  Loot & Shrines
                </span>
                {LOOT_PALETTE.map(l => (
                  <button
                    key={l.id}
                    onClick={() => setSelectedTool({ category: 'loot', id: l.id, name: l.name, icon: l.icon })}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-xs font-semibold transition cursor-pointer border ${
                      selectedTool.id === l.id
                        ? 'bg-purple-50 border-purple-400 text-purple-900 shadow-2xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{l.icon}</span>
                      <span>{l.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {editorMode === 'erase' && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 space-y-2">
                <div className="font-bold flex items-center gap-1.5">
                  <Eraser className="w-4 h-4 text-rose-600" />
                  <span>Eraser Active</span>
                </div>
                <p className="text-[11px] leading-relaxed text-rose-700">
                  Click or drag on any obstacle (tree, boulder, fence), building, or loot item to delete it. Click on roads or water to revert them to grass.
                </p>
              </div>
            )}

            {editorMode === 'rearrange' && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-2">
                <div className="font-bold flex items-center gap-1.5">
                  <Move className="w-4 h-4 text-amber-700" />
                  <span>Rearrange Tool Active</span>
                </div>
                <p className="text-[11px] leading-relaxed text-amber-800">
                  Click any tree, rock, fence, or building on the canvas and drag it to rearrange positions anywhere on the 5120px arena!
                </p>
              </div>
            )}
          </div>

          {/* Quick Preset Utilities */}
          <div className="p-3 border-t border-slate-200 bg-[#FDFBF7] space-y-1.5">
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wide block">
              Quick Operations
            </span>
            <button
              onClick={handleClearAllObstacles}
              className="w-full py-1.5 px-2 rounded-lg bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All Obstacles</span>
            </button>
            <button
              onClick={handleResetToDefault}
              className="w-full py-1.5 px-2 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Default Arena</span>
            </button>
          </div>
        </div>

        {/* Center Canvas Viewport */}
        <div className="flex-1 bg-slate-900 relative overflow-hidden flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => {
              setHoveredTile(null);
              handleMouseUp();
            }}
            onWheel={handleWheel}
            onContextMenu={e => e.preventDefault()}
            className="w-full h-full cursor-crosshair block"
          />

          {/* Floating Zoom & Navigation Controls */}
          <div className="absolute bottom-4 right-4 bg-white/95 border border-slate-300 rounded-xl p-1.5 shadow-lg flex items-center gap-1 backdrop-blur-xs">
            <button
              onClick={() => setZoomLevel(prev => Math.min(2.0, prev + 0.15))}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700 cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-mono font-bold text-slate-700 px-1">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel(prev => Math.max(0.12, prev - 0.15))}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700 cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <div className="w-[1px] h-4 bg-slate-200 mx-1" />
            <button
              onClick={() => {
                setZoomLevel(0.15);
                setPanOffset({
                  x: Math.round((canvasSize.width - MAP_SIZE * 0.15) / 2),
                  y: Math.round((canvasSize.height - MAP_SIZE * 0.15) / 2)
                });
              }}
              className="px-2 py-1 rounded-lg hover:bg-slate-100 text-[11px] font-bold text-slate-700 cursor-pointer"
              title="Fit Full Arena"
            >
              Fit
            </button>
          </div>

          {/* Status Message Overlay */}
          <div className="absolute top-4 left-4 bg-white/95 border border-slate-300 rounded-xl px-3 py-1.5 shadow-md text-xs font-semibold text-slate-800 backdrop-blur-xs flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              {hoveredTile && hoveredTile.col >= 0 && hoveredTile.col < TILES_COUNT && hoveredTile.row >= 0 && hoveredTile.row < TILES_COUNT
                ? `Tile [${hoveredTile.col}, ${hoveredTile.row}] • ${statusMessage}`
                : statusMessage}
            </span>
          </div>

          {/* Canvas Navigation Hint */}
          <div className="absolute bottom-4 left-4 bg-slate-950/70 border border-slate-800 text-white/80 rounded-lg px-2.5 py-1 text-[10px] font-mono backdrop-blur-xs">
            Right-Click + Drag or Alt + Drag to Pan • Scroll to Zoom
          </div>
        </div>
      </div>
    </div>
  );
};
