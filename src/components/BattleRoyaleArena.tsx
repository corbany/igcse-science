import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Shield, 
  Heart, 
  Zap, 
  Flame, 
  Sparkles, 
  Trophy, 
  AlertTriangle, 
  Volume2, 
  VolumeX, 
  Music,
  Maximize2,
  Minimize2,
  Crosshair,
  Package,
  Layers,
  Award,
  RotateCcw,
  RotateCw,
  X,
  Compass,
  MapPin,
  Radio,
  Eye,
  Info
} from 'lucide-react';
import { UserProfile } from '../types';
import { 
  ArenaPlayer, 
  ArenaStructure, 
  SupplyCrate, 
  BattleEventState, 
  UserGameProfile,
  subscribeToArenaPlayers, 
  subscribeToStructures, 
  subscribeToSupplyCrates, 
  subscribeToBattleState, 
  subscribeToGameProfile,
  updatePlayerPosition, 
  ensureArenaPlayer,
  damageArenaPlayer, 
  placeArenaStructure, 
  damageArenaStructure, 
  claimSupplyCrate, 
  declareBattleWinner, 
  resetBattleEvent,
  dropMidGameSupplyCrate,
  SHOP_ITEMS,
  ShopItem,
  equipItem
} from '../services/firebaseGameService';
import { 
  ALL_FANTASY_SKINS, 
  FANTASY_SKIN_ALIASES, 
  getFantasySkin, 
  FantasySkinDefinition,
  CHARACTER_ACTION_SHEETS,
  ActionSheets
} from '../data/fantasySkinsData';

// ============================================================================
// CONSTANTS & MAP METRICS
// ============================================================================

export const MAP_SIZE = 5120; // 5120px x 5120px massive open arena

// 1. Exact Kenney 16x16 Roguelike Sheet Slicing Math (16px tile + 1px border spacing)
export const TILE_SIZE = 16;  // Kenney 16x16 sheet source tile
export const TILE_GAP = 1;    // 1px border spacing
export const WORLD_TILE_SIZE = 32; // Scaled on canvas to 32x32 with ctx.imageSmoothingEnabled = false
export const TILES_COUNT = Math.floor(MAP_SIZE / WORLD_TILE_SIZE); // 160 x 160 tiles

// Helper formula for source coordinates: sx = col * 17 and sy = row * 17
export const getTileSourceCoords = (col: number, row: number) => ({
  sx: col * (TILE_SIZE + TILE_GAP), // col * 17
  sy: row * (TILE_SIZE + TILE_GAP)  // row * 17
});

export type BuildingStyle = 'stone' | 'wood' | 'castle' | 'terracotta' | 'brick';

export interface BuildingTile {
  col: number; // grid tile col
  row: number; // grid tile row
  sheetCol: number;
  sheetRow: number;
  isRoof?: boolean;
}

export interface GeneratedBuilding {
  id: string;
  name: string;
  tileX: number;
  tileY: number;
  width: number; // in tiles
  height: number; // in tiles
  worldX: number; // in pixels
  worldY: number;
  worldW: number;
  worldH: number;
  style: BuildingStyle;
  tiles: BuildingTile[];
  hitbox: { x: number; y: number; w: number; h: number };
  doorway: { x: number; y: number; w: number; h: number };
  perimeterProps: SceneryProp[];
  interiorLoot: GroundLootItem[];
}

type BiomeType = 'meadows' | 'desert' | 'ruins' | 'forum';
type TerrainSurface = 'grass' | 'asphalt' | 'pavement' | 'dirt' | 'sand' | 'stone' | 'water';

interface TileData {
  biome: BiomeType;
  surface: TerrainSurface;
  baseColor: string;
  sheetCol: number; // Solid grass base: col 5, row 0
  sheetRow: number;
  overlayCol?: number;
  overlayRow?: number;
  hasRoadMarking?: 'h_dash' | 'v_dash' | 'crosswalk' | null;
  detailType: number;
  isWater?: boolean;
  isRoad?: boolean;
}

// Environmental Scenery Prop (Sorted by Y for depth)
interface SceneryProp {
  id: string;
  x: number;
  y: number; // Ground anchor (feet / trunk base)
  type: 
    | 'oak_tree' 
    | 'pine_tree' 
    | 'round_tree'
    | 'tree_stump'
    | 'tent'
    | 'fence'
    | 'flower'
    | 'campfire'
    | 'palm_tree' 
    | 'orange_tree' 
    | 'bush'
    | 'container_blue' 
    | 'container_red' 
    | 'container_orange' 
    | 'barrel_oil' 
    | 'crate_wood' 
    | 'boulder' 
    | 'ruined_wall' 
    | 'stone_column' 
    | 'cactus'
    | 'building_wall'
    | 'desk_table'
    | 'bookshelf'
    | 'computer_console';
  width: number;
  height: number;
  footprintRadius: number;
  hp: number;
  maxHp: number;
  materialDrop: 'wood' | 'brick' | 'metal';
  dropAmount: number;
  spriteKey: string;
  sheetCol?: number;
  sheetRow?: number;
  sheetTopRow?: number;
}

// Ground Loot Item (Bananas, Shield Cells, Ammo Boxes)
interface GroundLootItem {
  id: string;
  x: number;
  y: number;
  type: 'banana' | 'shield_cell' | 'ammo_box' | 'speed_flask';
  name: string;
  spriteKey: string;
  healHp?: number;
  grantShield?: number;
  grantMats?: { wood: number; brick: number; metal: number };
  isCollected: boolean;
}

interface Projectile {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rangeRemaining: number;
  damage: number;
  ownerId: string;
  weaponId: string;
  color: string;
  isHighGround?: boolean;
}

interface ParticleFX {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  alpha: number;
  type: 'spark' | 'smoke' | 'flame' | 'electric' | 'wood_chip' | 'stone_chip' | 'dust' | 'banana_peel';
}

interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
}

// Renderable entity in the Y-Sorted depth queue
interface YSortEntity {
  sortY: number;
  render: (ctx: CanvasRenderingContext2D, now: number) => void;
}

interface BattleRoyaleArenaProps {
  user: UserProfile;
  onExitArena?: () => void;
  onExit?: () => void;
  onOpenShop?: () => void;
}

// ============================================================================
// IMAGE ASSET SPRITE MANIFEST & PRELOADER (READY FOR URLS & HIGH-RES SPRITES)
// ============================================================================

const createSvgDataUri = (svgString: string): string => {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString.trim())}`;
};

export const SPRITE_MANIFEST: Record<string, string> = {
  // --- TERRAIN & DECALS ---
  terrain_asphalt: createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50">
      <rect width="50" height="50" fill="#1e293b"/>
      <rect x="2" y="2" width="46" height="46" fill="#0f172a" fill-opacity="0.2"/>
      <circle cx="12" cy="18" r="1.5" fill="#334155"/>
      <circle cx="38" cy="34" r="1.5" fill="#334155"/>
    </svg>
  `),
  terrain_pavement: createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50">
      <rect width="50" height="50" fill="#475569"/>
      <rect x="1" y="1" width="48" height="48" fill="#64748b"/>
      <line x1="0" y1="0" x2="50" y2="0" stroke="#334155" stroke-width="2"/>
      <line x1="0" y1="0" x2="0" y2="50" stroke="#334155" stroke-width="2"/>
    </svg>
  `),
  terrain_grass: createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50">
      <rect width="50" height="50" fill="#15803d"/>
      <path d="M12 18 L14 10 L16 18 M32 38 L34 28 L36 38" stroke="#4ade80" stroke-width="1.8" stroke-linecap="round"/>
    </svg>
  `),
  terrain_dirt: createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50">
      <rect width="50" height="50" fill="#78350f"/>
      <circle cx="15" cy="12" r="2" fill="#92400e"/>
      <circle cx="36" cy="38" r="2.5" fill="#581c87" fill-opacity="0.3"/>
    </svg>
  `),

  // --- ENVIRONMENT PROPS (TREES, CONTAINERS, BARRELS, CRATES) ---
  prop_oak_tree: createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" width="120" height="150" viewBox="0 0 120 150">
      <!-- Ground Shadow -->
      <ellipse cx="60" cy="138" rx="48" ry="12" fill="#000000" fill-opacity="0.35"/>
      <!-- Trunk -->
      <rect x="52" y="105" width="16" height="32" rx="3" fill="#78350f"/>
      <path d="M54 112 L54 130 M62 110 L62 128" stroke="#451a03" stroke-width="2"/>
      <!-- Canopy Base Layer -->
      <circle cx="60" cy="72" r="50" fill="#15803d"/>
      <!-- Mid Foliage Clusters -->
      <circle cx="42" cy="58" r="32" fill="#16a34a"/>
      <circle cx="78" cy="62" r="34" fill="#16a34a"/>
      <!-- Top Sunlit Crown -->
      <circle cx="60" cy="46" r="32" fill="#22c55e"/>
      <circle cx="52" cy="38" r="18" fill="#4ade80" fill-opacity="0.7"/>
    </svg>
  `),
  prop_round_tree: createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" width="120" height="150" viewBox="0 0 120 150">
      <ellipse cx="60" cy="138" rx="46" ry="12" fill="#000000" fill-opacity="0.35"/>
      <rect x="52" y="105" width="16" height="32" rx="3" fill="#78350f"/>
      <path d="M54 112 L54 130 M62 110 L62 128" stroke="#451a03" stroke-width="2"/>
      <circle cx="60" cy="72" r="50" fill="#15803d"/>
      <circle cx="42" cy="58" r="32" fill="#16a34a"/>
      <circle cx="78" cy="62" r="34" fill="#16a34a"/>
      <circle cx="60" cy="46" r="32" fill="#22c55e"/>
      <circle cx="52" cy="38" r="18" fill="#4ade80" fill-opacity="0.7"/>
    </svg>
  `),
  prop_tree_stump: createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60">
      <ellipse cx="30" cy="52" rx="24" ry="7" fill="#000000" fill-opacity="0.35"/>
      <rect x="15" y="28" width="30" height="22" rx="4" fill="#78350f"/>
      <ellipse cx="30" cy="28" rx="15" ry="6" fill="#d97706"/>
      <ellipse cx="30" cy="28" rx="10" ry="4" fill="#fef08a" stroke="#b45309" stroke-width="1.5"/>
      <circle cx="30" cy="28" r="2" fill="#78350f"/>
    </svg>
  `),
  prop_tent: createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">
      <ellipse cx="40" cy="70" rx="36" ry="8" fill="#000000" fill-opacity="0.35"/>
      <polygon points="10,68 70,68 40,16" fill="#d97706"/>
      <polygon points="10,68 40,68 40,16" fill="#b45309"/>
      <polygon points="32,68 48,68 40,36" fill="#1e293b"/>
    </svg>
  `),
  prop_fence: createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60">
      <ellipse cx="30" cy="54" rx="26" ry="5" fill="#000000" fill-opacity="0.3"/>
      <rect x="8" y="20" width="8" height="32" rx="2" fill="#92400e"/>
      <rect x="44" y="20" width="8" height="32" rx="2" fill="#92400e"/>
      <rect x="6" y="26" width="48" height="6" rx="1" fill="#b45309"/>
      <rect x="6" y="38" width="48" height="6" rx="1" fill="#b45309"/>
    </svg>
  `),
  prop_flower: createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      <rect x="15" y="16" width="2" height="12" fill="#15803d"/>
      <circle cx="16" cy="12" r="5" fill="#f43f5e"/>
      <circle cx="16" cy="12" r="2" fill="#fef08a"/>
    </svg>
  `),
  prop_pine_tree: createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="150" viewBox="0 0 100 150">
      <ellipse cx="50" cy="140" rx="38" ry="10" fill="#000000" fill-opacity="0.35"/>
      <rect x="44" y="112" width="12" height="28" fill="#78350f"/>
      <!-- Tier 1 -->
      <polygon points="12,118 88,118 50,75" fill="#14532d"/>
      <!-- Tier 2 -->
      <polygon points="20,88 80,88 50,48" fill="#166534"/>
      <!-- Tier 3 -->
      <polygon points="28,58 72,58 50,15" fill="#15803d"/>
      <!-- Highlight -->
      <polygon points="40,42 60,42 50,15" fill="#22c55e" fill-opacity="0.8"/>
    </svg>
  `),
  prop_palm_tree: createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" width="130" height="160" viewBox="0 0 130 160">
      <ellipse cx="65" cy="148" rx="46" ry="11" fill="#000000" fill-opacity="0.35"/>
      <!-- Trunk -->
      <path d="M60 148 Q68 100 64 65 L70 65 Q74 100 68 148 Z" fill="#92400e"/>
      <!-- Fronds -->
      <path d="M66 65 Q40 40 10 50 Q45 60 66 65 Z" fill="#15803d"/>
      <path d="M66 65 Q90 35 120 48 Q85 62 66 65 Z" fill="#16a34a"/>
      <path d="M66 65 Q70 15 65 5 Q60 25 66 65 Z" fill="#22c55e"/>
      <path d="M66 65 Q30 75 12 95 Q40 85 66 65 Z" fill="#14532d"/>
      <path d="M66 65 Q100 75 118 92 Q90 85 66 65 Z" fill="#15803d"/>
    </svg>
  `),
  prop_container_blue: createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" width="120" height="80" viewBox="0 0 120 80">
      <!-- Shadow -->
      <rect x="6" y="24" width="112" height="54" rx="6" fill="#000000" fill-opacity="0.35"/>
      <!-- Container Body -->
      <rect x="4" y="16" width="112" height="52" rx="4" fill="#0284c7" stroke="#0369a1" stroke-width="2"/>
      <!-- Corrugated panels -->
      <line x1="20" y1="16" x2="20" y2="68" stroke="#075985" stroke-width="3"/>
      <line x1="36" y1="16" x2="36" y2="68" stroke="#075985" stroke-width="3"/>
      <line x1="52" y1="16" x2="52" y2="68" stroke="#075985" stroke-width="3"/>
      <line x1="68" y1="16" x2="68" y2="68" stroke="#075985" stroke-width="3"/>
      <line x1="84" y1="16" x2="84" y2="68" stroke="#075985" stroke-width="3"/>
      <line x1="100" y1="16" x2="100" y2="68" stroke="#075985" stroke-width="3"/>
      <!-- Top Highlight -->
      <line x1="4" y1="18" x2="116" y2="18" stroke="#38bdf8" stroke-width="2"/>
      <!-- Door latches -->
      <rect x="56" y="32" width="8" height="18" fill="#e2e8f0"/>
      <!-- Shipping Text -->
      <text x="12" y="32" fill="#ffffff" font-size="8" font-family="monospace" font-weight="bold">SAR-994</text>
    </svg>
  `),
  prop_container_red: createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" width="120" height="80" viewBox="0 0 120 80">
      <rect x="6" y="24" width="112" height="54" rx="6" fill="#000000" fill-opacity="0.35"/>
      <rect x="4" y="16" width="112" height="52" rx="4" fill="#b91c1c" stroke="#991b1b" stroke-width="2"/>
      <line x1="20" y1="16" x2="20" y2="68" stroke="#7f1d1d" stroke-width="3"/>
      <line x1="36" y1="16" x2="36" y2="68" stroke="#7f1d1d" stroke-width="3"/>
      <line x1="52" y1="16" x2="52" y2="68" stroke="#7f1d1d" stroke-width="3"/>
      <line x1="68" y1="16" x2="68" y2="68" stroke="#7f1d1d" stroke-width="3"/>
      <line x1="84" y1="16" x2="84" y2="68" stroke="#7f1d1d" stroke-width="3"/>
      <line x1="100" y1="16" x2="100" y2="68" stroke="#7f1d1d" stroke-width="3"/>
      <line x1="4" y1="18" x2="116" y2="18" stroke="#f87171" stroke-width="2"/>
      <rect x="56" y="32" width="8" height="18" fill="#e2e8f0"/>
      <text x="12" y="32" fill="#ffffff" font-size="8" font-family="monospace" font-weight="bold">EXP-0653</text>
    </svg>
  `),
  prop_container_orange: createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" width="120" height="80" viewBox="0 0 120 80">
      <rect x="6" y="24" width="112" height="54" rx="6" fill="#000000" fill-opacity="0.35"/>
      <rect x="4" y="16" width="112" height="52" rx="4" fill="#c2410c" stroke="#9a3412" stroke-width="2"/>
      <line x1="20" y1="16" x2="20" y2="68" stroke="#7c2d12" stroke-width="3"/>
      <line x1="40" y1="16" x2="40" y2="68" stroke="#7c2d12" stroke-width="3"/>
      <line x1="60" y1="16" x2="60" y2="68" stroke="#7c2d12" stroke-width="3"/>
      <line x1="80" y1="16" x2="80" y2="68" stroke="#7c2d12" stroke-width="3"/>
      <line x1="100" y1="16" x2="100" y2="68" stroke="#7c2d12" stroke-width="3"/>
      <line x1="4" y1="18" x2="116" y2="18" stroke="#fb923c" stroke-width="2"/>
      <rect x="56" y="32" width="8" height="18" fill="#e2e8f0"/>
    </svg>
  `),
  prop_barrel_oil: createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="52" viewBox="0 0 40 52">
      <ellipse cx="20" cy="48" rx="16" ry="4" fill="#000000" fill-opacity="0.35"/>
      <rect x="6" y="10" width="28" height="36" rx="4" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
      <!-- Yellow hazard band -->
      <rect x="6" y="22" width="28" height="10" fill="#eab308"/>
      <text x="13" y="30" fill="#000000" font-size="8" font-weight="bold">☣</text>
      <!-- Rim lines -->
      <ellipse cx="20" cy="10" rx="14" ry="4" fill="#334155"/>
      <ellipse cx="20" cy="46" rx="14" ry="4" fill="#0f172a"/>
    </svg>
  `),
  prop_crate_wood: createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
      <rect x="4" y="8" width="40" height="38" rx="4" fill="#000000" fill-opacity="0.35"/>
      <rect x="2" y="4" width="44" height="40" rx="3" fill="#92400e" stroke="#78350f" stroke-width="2"/>
      <line x1="2" y1="4" x2="46" y2="44" stroke="#451a03" stroke-width="2"/>
      <line x1="46" y1="4" x2="2" y2="44" stroke="#451a03" stroke-width="2"/>
      <rect x="6" y="8" width="36" height="32" fill="none" stroke="#b45309" stroke-width="2"/>
    </svg>
  `),

  // --- GROUND LOOT (BANANAS, WEAPONS, SHIELD, MEDKIT) ---
  loot_banana: createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
      <circle cx="18" cy="18" r="16" fill="#facc15" fill-opacity="0.25"/>
      <path d="M8 24 C 12 28, 24 28, 28 12 C 26 18, 16 22, 10 20 Z" fill="#facc15" stroke="#ca8a04" stroke-width="1.5"/>
      <circle cx="8" cy="24" r="1.5" fill="#713f12"/>
      <circle cx="28" cy="12" r="1.5" fill="#713f12"/>
    </svg>
  `),
  loot_shield_cell: createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
      <circle cx="18" cy="18" r="16" fill="#06b6d4" fill-opacity="0.25"/>
      <rect x="12" y="8" width="12" height="20" rx="3" fill="#0891b2" stroke="#22d3ee" stroke-width="1.5"/>
      <text x="14" y="22" fill="#ffffff" font-size="11" font-weight="bold">⚡</text>
    </svg>
  `),
  loot_ammo_box: createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
      <circle cx="18" cy="18" r="16" fill="#10b981" fill-opacity="0.25"/>
      <rect x="9" y="11" width="18" height="14" rx="2" fill="#15803d" stroke="#4ade80" stroke-width="1.5"/>
      <text x="12" y="22" fill="#fef08a" font-size="10" font-weight="bold">🪵</text>
    </svg>
  `),
  loot_speed_flask: createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
      <circle cx="18" cy="18" r="16" fill="#a855f7" fill-opacity="0.25"/>
      <circle cx="18" cy="22" r="7" fill="#9333ea" stroke="#d8b4fe" stroke-width="1.5"/>
      <rect x="16" y="10" width="4" height="6" fill="#d8b4fe"/>
    </svg>
  `),

  // --- 19 FANTASY DUNGEON CHARACTER PORTRAITS & SPRITES ---
  char_cultist: '/assets/characters/cultist.png',
  char_skeleton_warrior: '/assets/characters/skeleton_warrior.png',
  char_goblin: '/assets/characters/goblin.png',
  char_archer_hero: '/assets/characters/archer_hero.png',
  char_rogue: '/assets/characters/rogue.png',
  char_necromancer: '/assets/characters/necromancer.png',
  char_discoverer: '/assets/characters/discoverer.png',
  char_white_mage: '/assets/characters/white_mage.png',
  char_paladin: '/assets/characters/paladin.png',
  char_dark_knight: '/assets/characters/dark_knight.png',
  char_warlock: '/assets/characters/warlock.png',
  char_knight_hero: '/assets/characters/knight_hero.png',
  char_dragon_slayer: '/assets/characters/dragon_slayer.png',
  char_shadow_assassin: '/assets/characters/shadow_assassin.png',
  char_berserker: '/assets/characters/berserker.png',
  char_slime_king: '/assets/characters/slime_king.png',
  char_overlord: '/assets/characters/overlord.png',
  char_archangel: '/assets/characters/archangel.png',
  char_bat: '/assets/characters/bat.png',
  char_slime: '/assets/characters/slime.png',
  char_elitearcher: '/assets/characters/elitearcher.png',
  char_merchant: '/assets/characters/merchant.png',

  // --- 16x16 ROGUELIKE LANDSCAPE SPRITESHEET ---
  landscape_sheet: '/assets/roguelikeSheet_transparent.png'
};

// Global shared cache for 1024x1024 modular character action sheets (idle, walk, run, attack, hurt, death)
const characterActionCache = new Map<string, HTMLImageElement>();
export function getActionSheetImage(src: string): HTMLImageElement | null {
  if (!src) return null;
  let img = characterActionCache.get(src);
  if (!img) {
    img = new Image();
    img.src = src;
    characterActionCache.set(src, img);
  }
  if (img.complete && img.naturalWidth > 0) return img;
  return null;
}

// ============================================================================
// AUDIO SYNTHESIZER FOR TOP-DOWN ACTION
// ============================================================================

// ============================================================================
// HTML5 SPATIAL AUDIO & PROCEDURAL MUSIC ENGINE
// ============================================================================

export function calculateStormState(
  elapsedSeconds: number,
  targetFinalCenter: { x: number; y: number }
): {
  radius: number;
  center: { x: number; y: number };
  isSurging: boolean;
  secondsIntoCycle: number;
  progress: number;
} {
  const TOTAL_DURATION = 600; // 10 minutes total
  const START_RADIUS = 3600; // Starts right on the boundary of 5000x5000 world (corners ~3536px)
  const FINAL_RADIUS = 75; // Final intense showdown ring
  const TOTAL_SHRINK = START_RADIUS - FINAL_RADIUS; // 3525px

  // 10 cycles of 60 seconds:
  // 50s at normal rate, 10s at 3.5x surge rate
  // Total shrink units per cycle = 50 + 10 * 3.5 = 85 units
  // Over 10 cycles = 850 units -> unitRate = TOTAL_SHRINK / 850
  const NORMAL_RATE = TOTAL_SHRINK / 850; // ~4.147 px/s
  const SURGE_RATE = NORMAL_RATE * 3.5; // ~14.515 px/s

  const t = Math.max(0, Math.min(TOTAL_DURATION, elapsedSeconds));
  const completedCycles = Math.floor(t / 60);
  const cycleSeconds = t % 60;

  let shrunk = completedCycles * 85 * NORMAL_RATE;
  if (cycleSeconds <= 50) {
    shrunk += cycleSeconds * NORMAL_RATE;
  } else {
    shrunk += 50 * NORMAL_RATE + (cycleSeconds - 50) * SURGE_RATE;
  }

  const radius = Math.max(FINAL_RADIUS, START_RADIUS - shrunk);
  const progress = Math.min(1, Math.max(0, (START_RADIUS - radius) / TOTAL_SHRINK));

  // Smoothly interpolate storm center from map center (2500, 2500) to randomized destination
  const easeProgress = progress * progress * (3 - 2 * progress);
  const centerX = 2500 + (targetFinalCenter.x - 2500) * easeProgress;
  const centerY = 2500 + (targetFinalCenter.y - 2500) * easeProgress;

  const isSurging = cycleSeconds >= 50 && t < TOTAL_DURATION;

  return {
    radius,
    center: { x: centerX, y: centerY },
    isSurging,
    secondsIntoCycle: cycleSeconds,
    progress
  };
}

export function getMatchFinalCenter(
  startedAt?: string | null, 
  customCenter?: { x: number; y: number }
): { x: number; y: number } {
  if (customCenter && customCenter.x && customCenter.y) return customCenter;
  if (!startedAt) return { x: 2850, y: 1950 };
  let hash = 0;
  for (let i = 0; i < startedAt.length; i++) {
    hash = (hash << 5) - hash + startedAt.charCodeAt(i);
    hash |= 0;
  }
  const x = 1300 + Math.abs((hash * 9301 + 49297) % 2400);
  const y = 1300 + Math.abs((hash * 49297 + 9301) % 2400);
  return { x, y };
}

class ArenaSoundEngine {
  private ctx: AudioContext | null = null;
  public sfxEnabled: boolean = true;
  public musicEnabled: boolean = true;

  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;

  // 16-Bit Chiptune Arcade Music Engine
  private musicInterval: number | null = null;
  private isMusicRunning: boolean = false;
  private currentTension: number = 0;
  private currentSurging: boolean = false;
  private currentStep: number = 0;
  public currentTrackIndex: number = 0;
  private noiseBuffer: AudioBuffer | null = null;

  public initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.sfxGain = this.ctx.createGain();
        this.musicGain = this.ctx.createGain();

        this.sfxGain.connect(this.masterGain);
        this.musicGain.connect(this.masterGain);
        this.masterGain.connect(this.ctx.destination);

        this.sfxGain.gain.setValueAtTime(this.sfxEnabled ? 1 : 0, this.ctx.currentTime);
        this.musicGain.gain.setValueAtTime(this.musicEnabled ? 0.22 : 0, this.ctx.currentTime);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setSfxEnabled(enabled: boolean) {
    this.sfxEnabled = enabled;
    if (this.ctx && this.sfxGain) {
      this.sfxGain.gain.setValueAtTime(enabled ? 1 : 0, this.ctx.currentTime);
    }
  }

  public setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled;
    if (this.ctx && this.musicGain) {
      this.musicGain.gain.setValueAtTime(enabled ? 0.22 : 0, this.ctx.currentTime);
    }
  }

  /**
   * Spatial Audio Bus Router: Computes acoustic distance falloff and stereo panning
   * relative to the local listener's position in the massive arena.
   */
  private getSpatialBus(
    sourceX?: number,
    sourceY?: number,
    listenerX?: number,
    listenerY?: number,
    maxDistance: number = 1400
  ): { targetNode: AudioNode; gainFactor: number } | null {
    if (!this.sfxEnabled) return null;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return null;

    if (sourceX === undefined || sourceY === undefined || listenerX === undefined || listenerY === undefined) {
      return { targetNode: this.sfxGain, gainFactor: 1 };
    }

    const dx = sourceX - listenerX;
    const dy = sourceY - listenerY;
    const dist = Math.hypot(dx, dy);

    if (dist > maxDistance) return null; // Outside audible perimeter

    const falloff = Math.max(0, 1 - dist / maxDistance);
    const distanceGain = Math.pow(falloff, 1.4); // Quadratic physical dropoff
    if (distanceGain <= 0.005) return null;

    // Stereo panning (-1 left to +1 right)
    const pan = Math.max(-1, Math.min(1, dx / (maxDistance * 0.45)));

    try {
      if (this.ctx.createStereoPanner) {
        const panner = this.ctx.createStereoPanner();
        panner.pan.setValueAtTime(pan, this.ctx.currentTime);

        const gainNode = this.ctx.createGain();
        gainNode.gain.setValueAtTime(distanceGain, this.ctx.currentTime);

        gainNode.connect(panner);
        panner.connect(this.sfxGain);
        return { targetNode: gainNode, gainFactor: distanceGain };
      }
    } catch {
      // Fallback
    }

    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(distanceGain, this.ctx.currentTime);
    gainNode.connect(this.sfxGain);
    return { targetNode: gainNode, gainFactor: distanceGain };
  }

  /**
   * Spatial Footsteps: Localized footsteps with surface-specific timbres
   */
  playSpatialFootstep(
    sourceX: number,
    sourceY: number,
    listenerX: number,
    listenerY: number,
    surface: string = 'grass'
  ) {
    const bus = this.getSpatialBus(sourceX, sourceY, listenerX, listenerY, 600);
    if (!bus || !this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(bus.targetNode);

    if (surface === 'asphalt' || surface === 'pavement') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, t);
      osc.frequency.exponentialRampToValueAtTime(60, t + 0.04);
      gain.gain.setValueAtTime(0.18 * bus.gainFactor, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
      osc.start(t);
      osc.stop(t + 0.04);
    } else if (surface === 'sand') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(100, t);
      osc.frequency.exponentialRampToValueAtTime(45, t + 0.05);
      gain.gain.setValueAtTime(0.12 * bus.gainFactor, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
      osc.start(t);
      osc.stop(t + 0.05);
    } else if (surface === 'stone') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(220, t);
      osc.frequency.exponentialRampToValueAtTime(80, t + 0.035);
      gain.gain.setValueAtTime(0.14 * bus.gainFactor, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);
      osc.start(t);
      osc.stop(t + 0.035);
    } else {
      // Grass (soft tap)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(90, t);
      osc.frequency.exponentialRampToValueAtTime(40, t + 0.045);
      gain.gain.setValueAtTime(0.14 * bus.gainFactor, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);
      osc.start(t);
      osc.stop(t + 0.045);
    }
  }

  /**
   * Spatial Weapon Fire: Localized gunfire with characteristic acoustics
   */
  playSpatialShoot(
    weaponId: string,
    sourceX?: number,
    sourceY?: number,
    listenerX?: number,
    listenerY?: number
  ) {
    const bus = this.getSpatialBus(sourceX, sourceY, listenerX, listenerY, 2000);
    if (!bus || !this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(bus.targetNode);

    if (weaponId === 'laser_pointer') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1100, t);
      osc.frequency.exponentialRampToValueAtTime(180, t + 0.12);
      gain.gain.setValueAtTime(0.24 * bus.gainFactor, t);
      gain.gain.exponentialRampToValueAtTime(0.005, t + 0.12);
      osc.start(t);
      osc.stop(t + 0.12);
    } else if (weaponId === 'tesla_coil') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(460, t);
      osc.frequency.setValueAtTime(920, t + 0.04);
      osc.frequency.exponentialRampToValueAtTime(120, t + 0.16);
      gain.gain.setValueAtTime(0.25 * bus.gainFactor, t);
      gain.gain.exponentialRampToValueAtTime(0.005, t + 0.16);
      osc.start(t);
      osc.stop(t + 0.16);
    } else if (weaponId === 'particle_accelerator') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(160, t);
      osc.frequency.exponentialRampToValueAtTime(780, t + 0.09);
      osc.frequency.exponentialRampToValueAtTime(70, t + 0.24);
      gain.gain.setValueAtTime(0.32 * bus.gainFactor, t);
      gain.gain.exponentialRampToValueAtTime(0.005, t + 0.24);
      osc.start(t);
      osc.stop(t + 0.24);
    } else if (weaponId === 'acid_pipette') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, t);
      osc.frequency.exponentialRampToValueAtTime(130, t + 0.14);
      gain.gain.setValueAtTime(0.22 * bus.gainFactor, t);
      gain.gain.exponentialRampToValueAtTime(0.005, t + 0.14);
      osc.start(t);
      osc.stop(t + 0.14);
    } else {
      // Bunsen Burner flame burst
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(280, t);
      osc.frequency.exponentialRampToValueAtTime(65, t + 0.15);
      gain.gain.setValueAtTime(0.22 * bus.gainFactor, t);
      gain.gain.exponentialRampToValueAtTime(0.005, t + 0.15);
      osc.start(t);
      osc.stop(t + 0.15);
    }
  }

  playShoot(weaponId: string, sourceX?: number, sourceY?: number, listenerX?: number, listenerY?: number) {
    this.playSpatialShoot(weaponId, sourceX, sourceY, listenerX, listenerY);
  }

  /**
   * Spatial Building Construction: Localized placement sound
   */
  playSpatialBuild(
    type: 'wood_wall' | 'brick_ramp' | 'metal_bunker' = 'wood_wall',
    sourceX?: number,
    sourceY?: number,
    listenerX?: number,
    listenerY?: number
  ) {
    const bus = this.getSpatialBus(sourceX, sourceY, listenerX, listenerY, 1500);
    if (!bus || !this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(bus.targetNode);

    if (type === 'wood_wall') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(260, t);
      osc.frequency.exponentialRampToValueAtTime(110, t + 0.09);
      gain.gain.setValueAtTime(0.28 * bus.gainFactor, t);
      gain.gain.exponentialRampToValueAtTime(0.005, t + 0.09);
      osc.start(t);
      osc.stop(t + 0.09);
    } else if (type === 'brick_ramp') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, t);
      osc.frequency.exponentialRampToValueAtTime(60, t + 0.11);
      gain.gain.setValueAtTime(0.26 * bus.gainFactor, t);
      gain.gain.exponentialRampToValueAtTime(0.005, t + 0.11);
      osc.start(t);
      osc.stop(t + 0.11);
    } else {
      // Metal bunker
      osc.type = 'sine';
      osc.frequency.setValueAtTime(640, t);
      osc.frequency.exponentialRampToValueAtTime(180, t + 0.2);
      gain.gain.setValueAtTime(0.3 * bus.gainFactor, t);
      gain.gain.exponentialRampToValueAtTime(0.005, t + 0.2);
      osc.start(t);
      osc.stop(t + 0.2);
    }
  }

  playBuild(type: 'wood_wall' | 'brick_ramp' | 'metal_bunker' = 'wood_wall', sourceX?: number, sourceY?: number, listenerX?: number, listenerY?: number) {
    this.playSpatialBuild(type, sourceX, sourceY, listenerX, listenerY);
  }

  playSpatialHit(sourceX?: number, sourceY?: number, listenerX?: number, listenerY?: number) {
    const bus = this.getSpatialBus(sourceX, sourceY, listenerX, listenerY, 1400);
    if (!bus || !this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(bus.targetNode);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(50, t + 0.1);
    gain.gain.setValueAtTime(0.25 * bus.gainFactor, t);
    gain.gain.exponentialRampToValueAtTime(0.005, t + 0.1);
    osc.start(t);
    osc.stop(t + 0.1);
  }

  playHit(sourceX?: number, sourceY?: number, listenerX?: number, listenerY?: number) {
    this.playSpatialHit(sourceX, sourceY, listenerX, listenerY);
  }

  playStormSurgeAlert() {
    if (!this.sfxEnabled) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    [0, 0.14, 0.28].forEach((offset, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(700 + idx * 180, t + offset);
      osc.frequency.exponentialRampToValueAtTime(1200 + idx * 140, t + offset + 0.11);
      gain.gain.setValueAtTime(0.24, t + offset);
      gain.gain.exponentialRampToValueAtTime(0.005, t + offset + 0.11);
      osc.start(t + offset);
      osc.stop(t + offset + 0.11);
    });
  }

  playEatBanana() {
    if (!this.sfxEnabled) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.exponentialRampToValueAtTime(800, t + 0.1);
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
    osc.start(t);
    osc.stop(t + 0.12);
  }

  playRotate() {
    if (!this.sfxEnabled) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.exponentialRampToValueAtTime(680, t + 0.08);
    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.09);
    osc.start(t);
    osc.stop(t + 0.09);
  }

  playVictory() {
    if (!this.sfxEnabled) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.12);
      gain.gain.setValueAtTime(0.25, t + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.01, t + idx * 0.12 + 0.35);
      osc.start(t + idx * 0.12);
      osc.stop(t + idx * 0.12 + 0.35);
    });
  }

  // --------------------------------------------------------------------------
  // 16-BIT CHIPTUNE RETRO ARCADE BGM SYNTHESIZER
  // --------------------------------------------------------------------------

  private createNoiseBuffer() {
    if (!this.ctx) return;
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.12);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    this.noiseBuffer = buffer;
  }

  private playChiptuneDrum(type: 'kick' | 'snare' | 'hihat', time: number) {
    if (!this.ctx || !this.musicGain || !this.musicEnabled) return;
    try {
      if (type === 'kick') {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.musicGain);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, time);
        osc.frequency.exponentialRampToValueAtTime(32, time + 0.08);
        gain.gain.setValueAtTime(0.32, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.09);
        osc.start(time);
        osc.stop(time + 0.095);
      } else if (type === 'snare') {
        if (!this.noiseBuffer) this.createNoiseBuffer();
        if (this.noiseBuffer) {
          const noise = this.ctx.createBufferSource();
          noise.buffer = this.noiseBuffer;
          const filter = this.ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(1250, time);
          filter.Q.setValueAtTime(1.8, time);
          const gain = this.ctx.createGain();
          noise.connect(filter);
          filter.connect(gain);
          gain.connect(this.musicGain);
          gain.gain.setValueAtTime(0.22, time);
          gain.gain.exponentialRampToValueAtTime(0.001, time + 0.11);
          noise.start(time);
          noise.stop(time + 0.12);
        }
      } else if (type === 'hihat') {
        if (!this.noiseBuffer) this.createNoiseBuffer();
        if (this.noiseBuffer) {
          const noise = this.ctx.createBufferSource();
          noise.buffer = this.noiseBuffer;
          const filter = this.ctx.createBiquadFilter();
          filter.type = 'highpass';
          filter.frequency.setValueAtTime(4500, time);
          const gain = this.ctx.createGain();
          noise.connect(filter);
          filter.connect(gain);
          gain.connect(this.musicGain);
          gain.gain.setValueAtTime(0.08, time);
          gain.gain.exponentialRampToValueAtTime(0.001, time + 0.035);
          noise.start(time);
          noise.stop(time + 0.04);
        }
      }
    } catch {}
  }

  private play16BitLead(freq: number, time: number, duration: number, isHigh: boolean) {
    if (!this.ctx || !this.musicGain || !this.musicEnabled || freq <= 0) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.musicGain);
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, time);

      const vol = isHigh ? 0.13 : 0.09;
      gain.gain.setValueAtTime(vol, time);
      gain.gain.setValueAtTime(vol * 0.8, time + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

      osc.start(time);
      osc.stop(time + duration + 0.01);
    } catch {}
  }

  private play16BitBass(freq: number, time: number, duration: number) {
    if (!this.ctx || !this.musicGain || !this.musicEnabled || freq <= 0) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.musicGain);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, time);
      gain.gain.setValueAtTime(0.25, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
      osc.start(time);
      osc.stop(time + duration + 0.01);
    } catch {}
  }

  private play16BitArp(notes: number[], time: number) {
    if (!this.ctx || !this.musicGain || !this.musicEnabled || notes.length === 0) return;
    try {
      const stepT = 0.032;
      notes.forEach((f, idx) => {
        if (f <= 0) return;
        const nTime = time + idx * stepT;
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.connect(gain);
        gain.connect(this.musicGain!);
        osc.type = 'square';
        osc.frequency.setValueAtTime(f, nTime);
        gain.gain.setValueAtTime(0.065, nTime);
        gain.gain.exponentialRampToValueAtTime(0.001, nTime + 0.038);
        osc.start(nTime);
        osc.stop(nTime + 0.04);
      });
    } catch {}
  }

  public getTrackName(): string {
    const names = [
      '16-Bit Cyber Royale',
      'Retro Genesis Battlefield',
      'Final Storm Annihilation'
    ];
    return names[this.currentTrackIndex % names.length];
  }

  public cycleTrack(): string {
    this.currentTrackIndex = (this.currentTrackIndex + 1) % 3;
    this.currentStep = 0;
    if (this.isMusicRunning) {
      this.stopMusic();
      this.startMusic();
    }
    return this.getTrackName();
  }

  startMusic() {
    if (this.isMusicRunning) return;
    this.initCtx();
    if (!this.ctx || !this.musicGain) return;

    this.isMusicRunning = true;
    this.createNoiseBuffer();

    // 16-Bit Track Step Patterns (32-step loop)
    // Track 0: D Minor Cyber Arcade (136 BPM = 110ms per 16th step)
    const T0_LEAD = [
      293.66, 0, 349.23, 392.00, 440.00, 0, 587.33, 0, 
      523.25, 440.00, 0, 349.23, 392.00, 440.00, 349.23, 329.63,
      293.66, 0, 349.23, 440.00, 523.25, 0, 587.33, 0, 
      698.46, 659.25, 587.33, 523.25, 440.00, 523.25, 587.33, 0
    ];
    const T0_BASS = [
      73.42, 73.42, 146.83, 73.42, 87.31, 87.31, 174.61, 87.31,
      98.00, 98.00, 196.00, 98.00, 110.00, 110.00, 220.00, 110.00,
      116.54, 116.54, 233.08, 116.54, 130.81, 130.81, 261.63, 130.81,
      73.42, 73.42, 146.83, 73.42, 110.00, 98.00, 87.31, 82.41
    ];

    // Track 1: A Minor Genesis Theme (142 BPM = 104ms per 16th step)
    const T1_LEAD = [
      440.00, 0, 523.25, 587.33, 659.25, 0, 783.99, 0,
      659.25, 587.33, 523.25, 440.00, 493.88, 523.25, 493.88, 392.00,
      440.00, 0, 523.25, 659.25, 880.00, 0, 783.99, 0,
      659.25, 783.99, 659.25, 587.33, 523.25, 493.88, 440.00, 0
    ];
    const T1_BASS = [
      110.00, 110.00, 220.00, 110.00, 130.81, 130.81, 261.63, 130.81,
      146.83, 146.83, 293.66, 146.83, 164.81, 164.81, 329.63, 164.81,
      174.61, 174.61, 349.23, 174.61, 196.00, 196.00, 392.00, 196.00,
      110.00, 110.00, 220.00, 110.00, 164.81, 146.83, 130.81, 123.47
    ];

    // Track 2: C Minor Boss Battle (148 BPM = 98ms per 16th step)
    const T2_LEAD = [
      261.63, 311.13, 392.00, 523.25, 466.16, 392.00, 349.23, 311.13,
      261.63, 0, 311.13, 392.00, 523.25, 622.25, 587.33, 523.25,
      466.16, 0, 523.25, 466.16, 392.00, 0, 349.23, 311.13,
      261.63, 311.13, 392.00, 466.16, 523.25, 622.25, 783.99, 0
    ];
    const T2_BASS = [
      65.41, 65.41, 130.81, 65.41, 77.78, 77.78, 155.56, 77.78,
      87.31, 87.31, 174.61, 87.31, 98.00, 98.00, 196.00, 98.00,
      103.83, 103.83, 207.65, 103.83, 116.54, 116.54, 233.08, 116.54,
      65.41, 65.41, 130.81, 65.41, 98.00, 87.31, 77.78, 73.42
    ];

    const tracks = [
      { lead: T0_LEAD, bass: T0_BASS, stepMs: 110 },
      { lead: T1_LEAD, bass: T1_BASS, stepMs: 104 },
      { lead: T2_LEAD, bass: T2_BASS, stepMs: 98 }
    ];

    this.currentStep = 0;

    const tick = () => {
      if (!this.ctx || !this.musicGain || !this.musicEnabled) return;
      if (this.ctx.state === 'suspended') return;

      const track = tracks[this.currentTrackIndex % tracks.length];
      const nowT = this.ctx.currentTime;
      const step = this.currentStep % 32;

      // 1. Chiptune Drums
      if (step % 8 === 0) {
        this.playChiptuneDrum('kick', nowT);
      } else if (step % 8 === 4) {
        this.playChiptuneDrum('snare', nowT);
      } else if (step % 2 === 0) {
        this.playChiptuneDrum('hihat', nowT);
      }
      if (this.currentSurging && step % 4 === 2) {
        this.playChiptuneDrum('snare', nowT);
      }

      // 2. Triangle Bassline (Every 16th step)
      const bassFreq = track.bass[step];
      if (bassFreq > 0) {
        this.play16BitBass(bassFreq, nowT, (track.stepMs / 1000) * 0.9);
      }

      // 3. Square Wave Lead 1 (Melodic hook)
      const leadFreq = track.lead[step];
      if (leadFreq > 0) {
        this.play16BitLead(leadFreq, nowT, (track.stepMs / 1000) * 0.85, this.currentSurging);
      }

      // 4. Square Wave Lead 2 / Arpeggio Chords (on offbeats & high tension)
      if (step % 4 === 2 || (this.currentTension > 0.4 && step % 2 === 1)) {
        const root = bassFreq * 4;
        const arpChord = [root, root * 1.2, root * 1.5, root * 2];
        this.play16BitArp(arpChord, nowT);
      }

      this.currentStep++;
    };

    const baseInterval = tracks[this.currentTrackIndex % tracks.length].stepMs;
    const activeInterval = this.currentSurging 
      ? Math.round(baseInterval * 0.88) 
      : Math.round(baseInterval - this.currentTension * 18);

    this.musicInterval = window.setInterval(tick, activeInterval);
  }

  updateMusicTension(tension: number, isSurging: boolean) {
    const prevSurge = this.currentSurging;
    this.currentTension = Math.max(0, Math.min(1, tension));
    this.currentSurging = isSurging;

    if (prevSurge !== isSurging && this.isMusicRunning) {
      if (this.musicInterval) {
        clearInterval(this.musicInterval);
        this.musicInterval = null;
      }
      this.isMusicRunning = false;
      this.startMusic();
    }
  }

  stopMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    this.isMusicRunning = false;
  }
}

const soundEngine = new ArenaSoundEngine();

// ============================================================================
// MAP GENERATOR (ROADS, CONTAINER YARD, FOREST, SCATTERED LOOT)
// ============================================================================

// ============================================================================
// 3. BUILDING PREFAB GENERATOR & MULTI-LAYER MAP ENGINE
// ============================================================================

interface BuildingStyleConfig {
  roofTL: { col: number; row: number };
  roofTM: { col: number; row: number };
  roofTR: { col: number; row: number };
  roofML?: { col: number; row: number };
  roofMM?: { col: number; row: number };
  roofMR?: { col: number; row: number };
  wallL: { col: number; row: number };
  wallM: { col: number; row: number };
  wallR: { col: number; row: number };
  wallWindow: { col: number; row: number };
  foundationL: { col: number; row: number };
  foundationM: { col: number; row: number };
  foundationR: { col: number; row: number };
  door: { col: number; row: number };
  floor: { col: number; row: number; surface: TerrainSurface; color: string };
  primaryMat: 'brick' | 'wood' | 'metal';
}

const BUILDING_STYLES: Record<BuildingStyle, BuildingStyleConfig> = {
  terracotta: {
    roofTL: { col: 2, row: 18 },
    roofTM: { col: 3, row: 18 },
    roofTR: { col: 4, row: 18 },
    roofML: { col: 2, row: 19 },
    roofMM: { col: 3, row: 19 },
    roofMR: { col: 4, row: 19 },
    wallL: { col: 20, row: 12 },
    wallM: { col: 21, row: 12 },
    wallR: { col: 22, row: 12 },
    wallWindow: { col: 23, row: 12 },
    foundationL: { col: 20, row: 13 },
    foundationM: { col: 21, row: 13 },
    foundationR: { col: 22, row: 13 },
    door: { col: 19, row: 13 },
    floor: { col: 20, row: 14, surface: 'stone', color: '#475569' },
    primaryMat: 'brick'
  },
  wood: {
    roofTL: { col: 10, row: 17 },
    roofTM: { col: 11, row: 17 },
    roofTR: { col: 12, row: 17 },
    roofML: { col: 10, row: 18 },
    roofMM: { col: 11, row: 18 },
    roofMR: { col: 12, row: 18 },
    wallL: { col: 13, row: 12 },
    wallM: { col: 14, row: 12 },
    wallR: { col: 15, row: 12 },
    wallWindow: { col: 14, row: 13 },
    foundationL: { col: 13, row: 13 },
    foundationM: { col: 14, row: 13 },
    foundationR: { col: 15, row: 13 },
    door: { col: 11, row: 13 },
    floor: { col: 12, row: 3, surface: 'dirt', color: '#78350f' },
    primaryMat: 'wood'
  },
  castle: {
    roofTL: { col: 21, row: 26 },
    roofTM: { col: 22, row: 26 },
    roofTR: { col: 23, row: 26 },
    roofML: { col: 21, row: 27 },
    roofMM: { col: 22, row: 27 },
    roofMR: { col: 23, row: 27 },
    wallL: { col: 20, row: 12 },
    wallM: { col: 21, row: 12 },
    wallR: { col: 22, row: 12 },
    wallWindow: { col: 23, row: 12 },
    foundationL: { col: 20, row: 13 },
    foundationM: { col: 21, row: 13 },
    foundationR: { col: 22, row: 13 },
    door: { col: 20, row: 13 },
    floor: { col: 20, row: 14, surface: 'stone', color: '#334155' },
    primaryMat: 'brick'
  },
  stone: {
    roofTL: { col: 21, row: 26 },
    roofTM: { col: 22, row: 26 },
    roofTR: { col: 23, row: 26 },
    roofML: { col: 21, row: 27 },
    roofMM: { col: 22, row: 27 },
    roofMR: { col: 23, row: 27 },
    wallL: { col: 20, row: 12 },
    wallM: { col: 21, row: 12 },
    wallR: { col: 22, row: 12 },
    wallWindow: { col: 23, row: 12 },
    foundationL: { col: 20, row: 13 },
    foundationM: { col: 21, row: 13 },
    foundationR: { col: 22, row: 13 },
    door: { col: 19, row: 13 },
    floor: { col: 21, row: 14, surface: 'stone', color: '#475569' },
    primaryMat: 'brick'
  },
  brick: {
    roofTL: { col: 12, row: 26 },
    roofTM: { col: 13, row: 26 },
    roofTR: { col: 14, row: 26 },
    roofML: { col: 12, row: 27 },
    roofMM: { col: 13, row: 27 },
    roofMR: { col: 14, row: 27 },
    wallL: { col: 24, row: 12 },
    wallM: { col: 25, row: 12 },
    wallR: { col: 26, row: 12 },
    wallWindow: { col: 23, row: 12 },
    foundationL: { col: 24, row: 13 },
    foundationM: { col: 25, row: 13 },
    foundationR: { col: 26, row: 13 },
    door: { col: 19, row: 13 },
    floor: { col: 22, row: 14, surface: 'stone', color: '#334155' },
    primaryMat: 'brick'
  }
};

/**
 * 3. BUILDING PREFAB GENERATOR & DRAW FUNCTIONS
 * Calculates correct corner, wall, window, roof, and door tile offsets from the sheet grid,
 * and builds valid hitboxes so the player collides with walls and doors instead of walking through roofs.
 */
export function generateBuilding(
  x: number, // tile column or pixel coordinate
  y: number, // tile row or pixel coordinate
  width: number, // width in tiles
  height: number, // height in tiles
  style: BuildingStyle = 'stone',
  name = 'Building'
): GeneratedBuilding {
  const tileX = x > 180 ? Math.floor(x / WORLD_TILE_SIZE) : Math.floor(x);
  const tileY = y > 180 ? Math.floor(y / WORLD_TILE_SIZE) : Math.floor(y);
  const wTiles = Math.max(3, Math.floor(width));
  const hTiles = Math.max(3, Math.floor(height));

  const worldX = tileX * WORLD_TILE_SIZE;
  const worldY = tileY * WORLD_TILE_SIZE;
  const worldW = wTiles * WORLD_TILE_SIZE;
  const worldH = hTiles * WORLD_TILE_SIZE;

  const conf = BUILDING_STYLES[style] || BUILDING_STYLES.stone;
  const tiles: BuildingTile[] = [];

  const roofRowCount = hTiles >= 4 ? 2 : 1;
  const doorRelC = Math.floor(wTiles / 2);

  // Generate building tile slice offsets
  for (let dr = 0; dr < hTiles; dr++) {
    for (let dc = 0; dc < wTiles; dc++) {
      const c = tileX + dc;
      const r = tileY + dr;
      let sheetCol = conf.wallM.col;
      let sheetRow = conf.wallM.row;
      let isRoof = false;

      // 1. Roof Top Row
      if (dr === 0) {
        isRoof = true;
        if (dc === 0) {
          sheetCol = conf.roofTL.col;
          sheetRow = conf.roofTL.row;
        } else if (dc === wTiles - 1) {
          sheetCol = conf.roofTR.col;
          sheetRow = conf.roofTR.row;
        } else {
          sheetCol = conf.roofTM.col;
          sheetRow = conf.roofTM.row;
        }
      }
      // 2. Roof Lower / Overhang Row
      else if (dr === 1 && roofRowCount > 1) {
        isRoof = true;
        if (dc === 0) {
          sheetCol = conf.roofML?.col ?? conf.roofTL.col;
          sheetRow = conf.roofML?.row ?? conf.roofTL.row;
        } else if (dc === wTiles - 1) {
          sheetCol = conf.roofMR?.col ?? conf.roofTR.col;
          sheetRow = conf.roofMR?.row ?? conf.roofTR.row;
        } else {
          sheetCol = conf.roofMM?.col ?? conf.roofTM.col;
          sheetRow = conf.roofMM?.row ?? conf.roofTM.row;
        }
      }
      // 3. Wall Middle Rows
      else if (dr < hTiles - 1) {
        if (dc === 0) {
          sheetCol = conf.wallL.col;
          sheetRow = conf.wallL.row;
        } else if (dc === wTiles - 1) {
          sheetCol = conf.wallR.col;
          sheetRow = conf.wallR.row;
        } else if (dc % 2 === 1 && dc !== doorRelC) {
          sheetCol = conf.wallWindow.col;
          sheetRow = conf.wallWindow.row;
        } else {
          sheetCol = conf.wallM.col;
          sheetRow = conf.wallM.row;
        }
      }
      // 4. Door / Foundation Bottom Row
      else {
        if (dc === 0) {
          sheetCol = conf.foundationL.col;
          sheetRow = conf.foundationL.row;
        } else if (dc === wTiles - 1) {
          sheetCol = conf.foundationR.col;
          sheetRow = conf.foundationR.row;
        } else if (dc === doorRelC) {
          sheetCol = conf.door.col;
          sheetRow = conf.door.row;
        } else {
          sheetCol = conf.foundationM.col;
          sheetRow = conf.foundationM.row;
        }
      }

      tiles.push({
        col: c,
        row: r,
        sheetCol,
        sheetRow,
        isRoof
      });
    }
  }

  // Hitbox & Doorway Opening (Solid walls and roofs block player movement)
  const hitbox = {
    x: worldX,
    y: worldY,
    w: worldW,
    h: worldH
  };

  const doorWorldX = (tileX + doorRelC) * WORLD_TILE_SIZE;
  const doorWorldY = (tileY + hTiles - 1) * WORLD_TILE_SIZE;
  const doorway = {
    x: doorWorldX + 4,
    y: doorWorldY,
    w: WORLD_TILE_SIZE - 8,
    h: WORLD_TILE_SIZE
  };

  // Grouped Perimeter Props (Fences, Crates, Barrels, Trees)
  const perimeterProps: SceneryProp[] = [];
  const bldgId = `bldg_${tileX}_${tileY}`;

  // 1. Stacked wood crate at corner
  perimeterProps.push({
    id: `${bldgId}_crate`,
    x: worldX - 14,
    y: worldY + worldH - 6,
    type: 'crate_wood',
    width: 32,
    height: 32,
    footprintRadius: 14,
    hp: 60,
    maxHp: 60,
    materialDrop: 'wood',
    dropAmount: 4,
    spriteKey: 'prop_crate_wood',
    sheetCol: 7,
    sheetRow: 23
  });

  // 2. Storage barrel near entrance
  perimeterProps.push({
    id: `${bldgId}_barrel`,
    x: doorWorldX + WORLD_TILE_SIZE + 14,
    y: doorWorldY + 16,
    type: 'barrel_oil',
    width: 28,
    height: 32,
    footprintRadius: 12,
    hp: 75,
    maxHp: 75,
    materialDrop: conf.primaryMat,
    dropAmount: 4,
    spriteKey: 'prop_barrel_oil',
    sheetCol: 6,
    sheetRow: 23
  });

  // 3. Fencing lining property perimeter
  perimeterProps.push({
    id: `${bldgId}_fence_l`,
    x: worldX - 26,
    y: worldY + worldH - 4,
    type: 'fence',
    width: 32,
    height: 32,
    footprintRadius: 10,
    hp: 80,
    maxHp: 80,
    materialDrop: 'wood',
    dropAmount: 3,
    spriteKey: 'prop_fence',
    sheetCol: 13,
    sheetRow: 13
  });

  // 4. Perimeter Tree in garden/alley
  perimeterProps.push({
    id: `${bldgId}_tree`,
    x: worldX + worldW + 28,
    y: worldY + 20,
    type: style === 'wood' ? 'pine_tree' : 'round_tree',
    width: 36,
    height: 48,
    footprintRadius: 14,
    hp: 90,
    maxHp: 90,
    materialDrop: 'wood',
    dropAmount: 6,
    spriteKey: style === 'wood' ? 'prop_pine_tree' : 'prop_round_tree',
    sheetCol: style === 'wood' ? 16 : 13,
    sheetRow: 9,
    sheetTopRow: 8
  });

  // 5. Interior / Porch loot cache
  const interiorLoot: GroundLootItem[] = [
    {
      id: `${bldgId}_loot`,
      x: doorWorldX + WORLD_TILE_SIZE / 2,
      y: doorWorldY + WORLD_TILE_SIZE / 2 - 6,
      type: 'banana',
      name: `${name} Ration Supply`,
      spriteKey: 'loot_banana',
      healHp: 25,
      isCollected: false
    }
  ];

  return {
    id: bldgId,
    name,
    tileX,
    tileY,
    width: wTiles,
    height: hTiles,
    worldX,
    worldY,
    worldW,
    worldH,
    style,
    tiles,
    hitbox,
    doorway,
    perimeterProps,
    interiorLoot
  };
}

/**
 * LAYER 2: drawHousePrefab(x, y, width, height, style, name)
 * Builds complete 4x4 or 3x3 houses with matching roof lines, wall panels, windows, and doors.
 */
export function drawHousePrefab(
  x: number,
  y: number,
  width: number = 4,
  height: number = 4,
  style: BuildingStyle = 'stone',
  name: string = 'House'
): GeneratedBuilding {
  return generateBuilding(x, y, width, height, style, name);
}

/**
 * LAYER 1: drawWaterBody(startX, startY, width, height)
 * Renders a connected pond using official Kenney 9-slice water tile coordinates:
 * - Top-Left Corner: (col: 0, row: 0)
 * - Top Edge: (col: 1, row: 0)
 * - Top-Right Corner: (col: 2, row: 0)
 * - Left Edge: (col: 0, row: 1)
 * - Inner Water Fill: (col: 1, row: 1)
 * - Right Edge: (col: 2, row: 1)
 * - Bottom-Left Corner: (col: 0, row: 2)
 * - Bottom Edge: (col: 1, row: 2)
 * - Bottom-Right Corner: (col: 2, row: 2)
 */
export function drawWaterBody(
  tiles: TileData[][],
  startX: number,
  startY: number,
  width: number,
  height: number
) {
  for (let dy = 0; dy < height; dy++) {
    for (let dx = 0; dx < width; dx++) {
      const c = startX + dx;
      const r = startY + dy;
      if (r < 0 || r >= TILES_COUNT || c < 0 || c >= TILES_COUNT) continue;

      let sheetCol = 1;
      let sheetRow = 1;

      if (dx === 0 && dy === 0) {
        // Top-Left Corner: (col: 0, row: 0)
        sheetCol = 0;
        sheetRow = 0;
      } else if (dx === width - 1 && dy === 0) {
        // Top-Right Corner: (col: 2, row: 0)
        sheetCol = 2;
        sheetRow = 0;
      } else if (dy === 0) {
        // Top Edge: (col: 1, row: 0)
        sheetCol = 1;
        sheetRow = 0;
      } else if (dx === 0 && dy === height - 1) {
        // Bottom-Left Corner: (col: 0, row: 2)
        sheetCol = 0;
        sheetRow = 2;
      } else if (dx === width - 1 && dy === height - 1) {
        // Bottom-Right Corner: (col: 2, row: 2)
        sheetCol = 2;
        sheetRow = 2;
      } else if (dy === height - 1) {
        // Bottom Edge: (col: 1, row: 2)
        sheetCol = 1;
        sheetRow = 2;
      } else if (dx === 0) {
        // Left Edge: (col: 0, row: 1)
        sheetCol = 0;
        sheetRow = 1;
      } else if (dx === width - 1) {
        // Right Edge: (col: 2, row: 1)
        sheetCol = 2;
        sheetRow = 1;
      } else {
        // Inner Water Fill: (col: 1, row: 1)
        sheetCol = 1;
        sheetRow = 1;
      }

      tiles[r][c].surface = 'water';
      tiles[r][c].baseColor = '#0284c7';
      tiles[r][c].overlayCol = sheetCol;
      tiles[r][c].overlayRow = sheetRow;
      tiles[r][c].isWater = true;
    }
  }
}

/**
 * LAYER 1: drawDirtRoad(startX, startY, length, direction, roadWidth)
 * Renders connected dirt roads and crossroads with coherent tile indices:
 * - Horizontal: col: 6, row: 0
 * - Vertical: col: 7, row: 1
 * - Intersection: col: 6, row: 1
 */
export function drawDirtRoad(
  tiles: TileData[][],
  startX: number,
  startY: number,
  length: number,
  direction: 'horizontal' | 'vertical' = 'horizontal',
  roadWidth: number = 2
) {
  const isHoriz = direction === 'horizontal';
  const w = isHoriz ? length : roadWidth;
  const h = isHoriz ? roadWidth : length;

  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      const c = startX + dx;
      const r = startY + dy;
      if (r < 0 || r >= TILES_COUNT || c < 0 || c >= TILES_COUNT) continue;
      if (tiles[r][c].isWater) continue; // Keep water bodies intact

      let sheetCol = isHoriz ? 6 : 7;
      let sheetRow = isHoriz ? 0 : 1;

      // Crossing / intersection tile
      if (tiles[r][c].isRoad) {
        sheetCol = 6;
        sheetRow = 1;
      }

      tiles[r][c].surface = 'dirt';
      tiles[r][c].baseColor = '#78350f';
      tiles[r][c].overlayCol = sheetCol;
      tiles[r][c].overlayRow = sheetRow;
      tiles[r][c].isRoad = true;
    }
  }
}

/**
/**
 * 2. MULTI-LAYER MAP ENGINE & WORLD GENERATION BLUEPRINT
 * - LAYER 0: Solid Ground Base (100% Solid Grass across 160x160 world grid, eliminating black gaps)
 * - LAYER 1: Structured Water & Dirt Regions (3 Lake features, interconnecting dirt paths, village squares)
 * - LAYER 2: Prefab Structures (2 small villages built with 4x4 and 3x3 houses)
 * - LAYER 3: Foliage, Camping Zones, and Y-Sorted Props (Pine forest, Round trees, Tents, Fences, Flowers, Stumps)
 */
function generateSuperAnimalStyleMap(): {
  tiles: TileData[][];
  scenery: SceneryProp[];
  groundLoot: GroundLootItem[];
  buildings: GeneratedBuilding[];
} {
  const tiles: TileData[][] = [];
  const scenery: SceneryProp[] = [];
  const groundLoot: GroundLootItem[] = [];
  const buildings: GeneratedBuilding[] = [];

  const pseudoNoise = (x: number, y: number, seed: number) => {
    const val = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
    return val - Math.floor(val);
  };

  // =========================================================================
  // LAYER 0 (SOLID GROUND BASE): 100% Solid Grass across the 5120px World
  // =========================================================================
  for (let r = 0; r < TILES_COUNT; r++) {
    const row: TileData[] = [];
    for (let c = 0; c < TILES_COUNT; c++) {
      // Solid base grass (Kenney roguelikeSheet tile col: 5, row: 0)
      row.push({
        biome: 'meadows',
        surface: 'grass',
        baseColor: '#15803d',
        sheetCol: 5,
        sheetRow: 0,
        detailType: 0,
        isWater: false,
        isRoad: false
      });
    }
    tiles.push(row);
  }

  // =========================================================================
  // LAYER 1: 3 DISTINCT LAKE FEATURES (9-Slice Connected Water Bodies)
  // =========================================================================
  // 1. Lake 1 (North-West Deep Pine Lake): 18 x 14 tiles
  drawWaterBody(tiles, 34, 20, 18, 14);

  // 2. Lake 2 (South-West Mirror Lake): 22 x 16 tiles
  drawWaterBody(tiles, 38, 102, 22, 16);

  // 3. Lake 3 (East Sunken Lake): 22 x 16 tiles
  drawWaterBody(tiles, 114, 46, 22, 16);

  // =========================================================================
  // LAYER 1: INTERCONNECTING DIRT PATHS & ARTERIAL HIGHWAYS
  // =========================================================================
  // A. North-South Grand Avenue (crosses entire world, 3 tiles wide)
  drawDirtRoad(tiles, 72, 0, 160, 'vertical', 3);

  // B. East-West Grand Avenue (crosses entire world, 3 tiles wide)
  drawDirtRoad(tiles, 0, 75, 160, 'horizontal', 3);

  // C. Logging trail through Dense Pine Forest along left border
  drawDirtRoad(tiles, 12, 0, 160, 'vertical', 2);

  // D. Branch paths connecting Lakes and Villages
  drawDirtRoad(tiles, 52, 38, 20, 'horizontal', 2); // Lake 1 to Village 1
  drawDirtRoad(tiles, 60, 104, 12, 'horizontal', 2); // Lake 2 to South Avenue
  drawDirtRoad(tiles, 92, 54, 22, 'horizontal', 2);  // Village 1 to Lake 3

  // E. Crossroads connector to Village 2 (South-East)
  drawDirtRoad(tiles, 75, 75, 29, 'horizontal', 2);
  drawDirtRoad(tiles, 104, 75, 28, 'vertical', 2);

  // =========================================================================
  // LAYER 2: 2 SMALL VILLAGES (PREFAB STRUCTURES)
  // =========================================================================
  // --- VILLAGE 1: Millbrook Village (North-Central, around tile 72, 38) ---
  const v1Buildings = [
    drawHousePrefab(66, 32, 4, 4, 'stone', 'Millbrook Manor'),
    drawHousePrefab(76, 32, 4, 4, 'wood', 'Millbrook Tavern'),
    drawHousePrefab(66, 42, 3, 3, 'brick', 'Blacksmith Workshop'),
    drawHousePrefab(76, 42, 3, 3, 'wood', 'Village Cottage')
  ];
  // Village 1 Courtyard / Plaza paths
  drawDirtRoad(tiles, 64, 38, 18, 'horizontal', 3);
  drawDirtRoad(tiles, 72, 30, 18, 'vertical', 3);

  v1Buildings.forEach(b => {
    buildings.push(b);
    scenery.push(...b.perimeterProps);
    groundLoot.push(...b.interiorLoot);
  });

  // --- VILLAGE 2: Riverside Hamlet (South-East, around tile 105, 104) ---
  const v2Buildings = [
    drawHousePrefab(98, 96, 4, 4, 'wood', 'Riverside Lodge'),
    drawHousePrefab(108, 96, 3, 4, 'stone', 'Hamlet Watchtower'),
    drawHousePrefab(98, 108, 4, 3, 'terracotta', 'Herbalist Hall'),
    drawHousePrefab(108, 108, 3, 3, 'brick', 'Hamlet Granary')
  ];
  // Village 2 internal paths
  drawDirtRoad(tiles, 96, 103, 18, 'horizontal', 3);
  drawDirtRoad(tiles, 104, 94, 20, 'vertical', 3);

  v2Buildings.forEach(b => {
    buildings.push(b);
    scenery.push(...b.perimeterProps);
    groundLoot.push(...b.interiorLoot);
  });

  // =========================================================================
  // LAYER 3: DENSE PINE FOREST ZONE ALONG LEFT BORDER (Cols 0 to 24)
  // =========================================================================
  let propId = 1000;
  for (let r = 2; r < TILES_COUNT - 2; r += 2) {
    for (let c = 1; c < 24; c += 2) {
      // Leave logging trail clear (around c: 12)
      if (Math.abs(c - 12) <= 1) continue;

      const n = pseudoNoise(c, r, 333);
      if (n > 0.35) {
        // Pine Tree (Conical Evergreen: col 16/18, row 9, top row 8)
        scenery.push({
          id: `pine_forest_${propId++}`,
          x: c * WORLD_TILE_SIZE + 16,
          y: r * WORLD_TILE_SIZE + 28,
          type: 'pine_tree',
          width: 36,
          height: 48,
          footprintRadius: 14,
          hp: 90,
          maxHp: 90,
          materialDrop: 'wood',
          dropAmount: 5,
          spriteKey: 'prop_pine_tree',
          sheetCol: n > 0.65 ? 18 : 16,
          sheetRow: 9,
          sheetTopRow: 8
        });
      } else if (n > 0.18) {
        // Tree Stump (col: 28, row: 9)
        scenery.push({
          id: `stump_forest_${propId++}`,
          x: c * WORLD_TILE_SIZE + 16,
          y: r * WORLD_TILE_SIZE + 24,
          type: 'tree_stump',
          width: 32,
          height: 32,
          footprintRadius: 12,
          hp: 50,
          maxHp: 50,
          materialDrop: 'wood',
          dropAmount: 3,
          spriteKey: 'prop_tree_stump',
          sheetCol: 28,
          sheetRow: 9
        });
      } else if (n > 0.08) {
        // Forest Wildflowers (col: 1, row: 7)
        scenery.push({
          id: `flower_forest_${propId++}`,
          x: c * WORLD_TILE_SIZE + 16,
          y: r * WORLD_TILE_SIZE + 20,
          type: 'flower',
          width: 24,
          height: 24,
          footprintRadius: 0,
          hp: 1,
          maxHp: 1,
          materialDrop: 'wood',
          dropAmount: 0,
          spriteKey: 'prop_flower',
          sheetCol: 1,
          sheetRow: 7
        });
      }
    }
  }

  // =========================================================================
  // LAYER 3: CAMPING ZONES WITH TENTS
  // =========================================================================
  // Camp 1: Pine Ridge Camp (tile 28, 62; world: 896, 1984)
  const camp1X = 28 * WORLD_TILE_SIZE;
  const camp1Y = 62 * WORLD_TILE_SIZE;
  // 3 Tents (col: 15, row: 24)
  scenery.push(
    {
      id: `camp1_tent_1`,
      x: camp1X - 24,
      y: camp1Y - 10,
      type: 'tent',
      width: 44,
      height: 40,
      footprintRadius: 18,
      hp: 100,
      maxHp: 100,
      materialDrop: 'wood',
      dropAmount: 4,
      spriteKey: 'prop_tent',
      sheetCol: 15,
      sheetRow: 24
    },
    {
      id: `camp1_tent_2`,
      x: camp1X + 36,
      y: camp1Y - 14,
      type: 'tent',
      width: 44,
      height: 40,
      footprintRadius: 18,
      hp: 100,
      maxHp: 100,
      materialDrop: 'wood',
      dropAmount: 4,
      spriteKey: 'prop_tent',
      sheetCol: 15,
      sheetRow: 24
    },
    {
      id: `camp1_tent_3`,
      x: camp1X,
      y: camp1Y + 36,
      type: 'tent',
      width: 44,
      height: 40,
      footprintRadius: 18,
      hp: 100,
      maxHp: 100,
      materialDrop: 'wood',
      dropAmount: 4,
      spriteKey: 'prop_tent',
      sheetCol: 13,
      sheetRow: 24
    },
    // Tree Stumps around campfire
    {
      id: `camp1_stump_1`,
      x: camp1X - 16,
      y: camp1Y + 14,
      type: 'tree_stump',
      width: 32,
      height: 32,
      footprintRadius: 12,
      hp: 50,
      maxHp: 50,
      materialDrop: 'wood',
      dropAmount: 3,
      spriteKey: 'prop_tree_stump',
      sheetCol: 28,
      sheetRow: 9
    },
    {
      id: `camp1_stump_2`,
      x: camp1X + 24,
      y: camp1Y + 14,
      type: 'tree_stump',
      width: 32,
      height: 32,
      footprintRadius: 12,
      hp: 50,
      maxHp: 50,
      materialDrop: 'wood',
      dropAmount: 3,
      spriteKey: 'prop_tree_stump',
      sheetCol: 28,
      sheetRow: 9
    }
  );
  groundLoot.push(
    {
      id: 'camp1_loot_1',
      x: camp1X + 4,
      y: camp1Y + 12,
      type: 'banana',
      name: 'Camp Rations',
      spriteKey: 'loot_banana',
      healHp: 25,
      isCollected: false
    },
    {
      id: 'camp1_loot_2',
      x: camp1X - 30,
      y: camp1Y + 16,
      type: 'shield_cell',
      name: 'Camp Shield Battery',
      spriteKey: 'loot_shield_cell',
      grantShield: 30,
      isCollected: false
    }
  );

  // Camp 2: Lakeside Outpost (tile 53, 18; world: 1696, 576)
  const camp2X = 53 * WORLD_TILE_SIZE;
  const camp2Y = 18 * WORLD_TILE_SIZE;
  scenery.push(
    {
      id: `camp2_tent_1`,
      x: camp2X - 20,
      y: camp2Y,
      type: 'tent',
      width: 44,
      height: 40,
      footprintRadius: 18,
      hp: 100,
      maxHp: 100,
      materialDrop: 'wood',
      dropAmount: 4,
      spriteKey: 'prop_tent',
      sheetCol: 15,
      sheetRow: 24
    },
    {
      id: `camp2_tent_2`,
      x: camp2X + 32,
      y: camp2Y,
      type: 'tent',
      width: 44,
      height: 40,
      footprintRadius: 18,
      hp: 100,
      maxHp: 100,
      materialDrop: 'wood',
      dropAmount: 4,
      spriteKey: 'prop_tent',
      sheetCol: 15,
      sheetRow: 24
    },
    {
      id: `camp2_barrel_1`,
      x: camp2X + 6,
      y: camp2Y + 22,
      type: 'barrel_oil',
      width: 28,
      height: 32,
      footprintRadius: 12,
      hp: 75,
      maxHp: 75,
      materialDrop: 'wood',
      dropAmount: 3,
      spriteKey: 'prop_barrel_oil',
      sheetCol: 6,
      sheetRow: 23
    },
    {
      id: `camp2_fence_1`,
      x: camp2X - 44,
      y: camp2Y + 10,
      type: 'fence',
      width: 32,
      height: 32,
      footprintRadius: 10,
      hp: 80,
      maxHp: 80,
      materialDrop: 'wood',
      dropAmount: 3,
      spriteKey: 'prop_fence',
      sheetCol: 13,
      sheetRow: 13
    }
  );
  groundLoot.push({
    id: 'camp2_loot_1',
    x: camp2X + 8,
    y: camp2Y - 10,
    type: 'banana',
    name: 'Lakeside Supplies',
    spriteKey: 'loot_banana',
    healHp: 25,
    isCollected: false
  });

  // Camp 3: Highland Clearing Camp (tile 132, 116; world: 4224, 3712)
  const camp3X = 132 * WORLD_TILE_SIZE;
  const camp3Y = 116 * WORLD_TILE_SIZE;
  scenery.push(
    {
      id: `camp3_tent_1`,
      x: camp3X - 22,
      y: camp3Y - 10,
      type: 'tent',
      width: 44,
      height: 40,
      footprintRadius: 18,
      hp: 100,
      maxHp: 100,
      materialDrop: 'wood',
      dropAmount: 4,
      spriteKey: 'prop_tent',
      sheetCol: 15,
      sheetRow: 24
    },
    {
      id: `camp3_tent_2`,
      x: camp3X + 28,
      y: camp3Y - 10,
      type: 'tent',
      width: 44,
      height: 40,
      footprintRadius: 18,
      hp: 100,
      maxHp: 100,
      materialDrop: 'wood',
      dropAmount: 4,
      spriteKey: 'prop_tent',
      sheetCol: 15,
      sheetRow: 24
    },
    {
      id: `camp3_stump_1`,
      x: camp3X + 2,
      y: camp3Y + 18,
      type: 'tree_stump',
      width: 32,
      height: 32,
      footprintRadius: 12,
      hp: 50,
      maxHp: 50,
      materialDrop: 'wood',
      dropAmount: 3,
      spriteKey: 'prop_tree_stump',
      sheetCol: 28,
      sheetRow: 9
    }
  );
  groundLoot.push({
    id: 'camp3_loot_1',
    x: camp3X + 2,
    y: camp3Y - 4,
    type: 'ammo_box',
    name: 'Highland Cache',
    spriteKey: 'loot_ammo_box',
    grantMats: { wood: 20, brick: 15, metal: 10 },
    isCollected: false
  });

  // =========================================================================
  // LAYER 3: SCATTERED STANDALONE PROPS OVER GRASS & DIRT
  // Pine Trees (col: 16/18, row: 9), Round Trees (col: 13/14/15, row: 9), Fences, Flowers, Stumps
  // =========================================================================
  for (let i = 0; i < 350; i++) {
    const rx = 850 + Math.floor(pseudoNoise(i, 11, 777) * (MAP_SIZE - 950));
    const ry = 100 + Math.floor(pseudoNoise(i, 22, 888) * (MAP_SIZE - 200));

    // Avoid center crossroads
    if (Math.hypot(rx - 2560, ry - 2560) < 220) continue;

    // Avoid highways
    if (Math.abs(rx - 2304) < 70 || Math.abs(ry - 2400) < 70) continue;

    // Avoid buildings
    const insideBuilding = buildings.some(
      b => rx >= b.worldX - 35 && rx <= b.worldX + b.worldW + 35 &&
           ry >= b.worldY - 35 && ry <= b.worldY + b.worldH + 35
    );
    if (insideBuilding) continue;

    // Avoid water bodies
    const tileCol = Math.floor(rx / WORLD_TILE_SIZE);
    const tileRow = Math.floor(ry / WORLD_TILE_SIZE);
    if (tiles[tileRow]?.[tileCol]?.isWater) continue;

    const roll = pseudoNoise(i, 33, 999);
    let propType: SceneryProp['type'] = 'round_tree';
    let sheetCol = 13;
    let sheetRow = 9;
    let sheetTopRow: number | undefined = 8;
    let w = 38;
    let h = 48;
    let radius = 15;
    let hp = 85;
    let mat: SceneryProp['materialDrop'] = 'wood';
    let dropAmt = 5;

    if (roll > 0.65) {
      // Pine Tree: (Conical Evergreen: col 16 or 18, row 9, top 8)
      propType = 'pine_tree';
      sheetCol = roll > 0.82 ? 18 : 16;
      sheetRow = 9;
      sheetTopRow = 8;
      w = 36;
      h = 48;
      radius = 14;
      hp = 90;
    } else if (roll > 0.35) {
      // Round Tree: (Vibrant/Forest/Autumn: col 13, 14, or 15, row 9, top 8)
      propType = 'round_tree';
      sheetCol = roll > 0.55 ? 13 : (roll > 0.45 ? 15 : 14);
      sheetRow = 9;
      sheetTopRow = 8;
      w = 38;
      h = 48;
      radius = 15;
      hp = 85;
    } else if (roll > 0.22) {
      // Tree Stump: (col: 28, row: 9)
      propType = 'tree_stump';
      sheetCol = 28;
      sheetRow = 9;
      sheetTopRow = undefined;
      w = 32;
      h = 32;
      radius = 12;
      hp = 50;
      dropAmt = 3;
    } else if (roll > 0.12) {
      // Wooden Fence: (col: 13, row: 13)
      propType = 'fence';
      sheetCol = 13;
      sheetRow = 13;
      sheetTopRow = undefined;
      w = 32;
      h = 32;
      radius = 10;
      hp = 70;
      dropAmt = 2;
    } else {
      // Red / Yellow Wildflowers: (col: 1, row: 7)
      propType = 'flower';
      sheetCol = 1;
      sheetRow = 7;
      sheetTopRow = undefined;
      w = 24;
      h = 24;
      radius = 0;
      hp = 1;
      dropAmt = 0;
    }

    scenery.push({
      id: `scatter_prop_${propId++}`,
      x: rx,
      y: ry,
      type: propType,
      width: w,
      height: h,
      footprintRadius: radius,
      hp,
      maxHp: hp,
      materialDrop: mat,
      dropAmount: dropAmt,
      spriteKey: `prop_${propType}`,
      sheetCol,
      sheetRow
    });
  }

  // Ground Loot Pickups scattered in clearings
  let lootId = 100;
  for (let l = 0; l < 45; l++) {
    const lx = 800 + Math.floor(pseudoNoise(l, 44, 123) * (MAP_SIZE - 950));
    const ly = 200 + Math.floor(pseudoNoise(l, 55, 456) * (MAP_SIZE - 400));
    const tileCol = Math.floor(lx / WORLD_TILE_SIZE);
    const tileRow = Math.floor(ly / WORLD_TILE_SIZE);
    if (tiles[tileRow]?.[tileCol]?.isWater) continue;

    const roll = l % 4;
    if (roll === 0) {
      groundLoot.push({
        id: `loot_${lootId++}`,
        x: lx,
        y: ly,
        type: 'banana',
        name: 'Heal Banana',
        spriteKey: 'loot_banana',
        healHp: 25,
        isCollected: false
      });
    } else if (roll === 1) {
      groundLoot.push({
        id: `loot_${lootId++}`,
        x: lx,
        y: ly,
        type: 'shield_cell',
        name: 'Shield Battery',
        spriteKey: 'loot_shield_cell',
        grantShield: 30,
        isCollected: false
      });
    } else if (roll === 2) {
      groundLoot.push({
        id: `loot_${lootId++}`,
        x: lx,
        y: ly,
        type: 'ammo_box',
        name: 'Building Supply Cache',
        spriteKey: 'loot_ammo_box',
        grantMats: { wood: 15, brick: 10, metal: 5 },
        isCollected: false
      });
    } else {
      groundLoot.push({
        id: `loot_${lootId++}`,
        x: lx,
        y: ly,
        type: 'speed_flask',
        name: 'Speed Catalyst',
        spriteKey: 'loot_speed_flask',
        healHp: 15,
        grantShield: 15,
        isCollected: false
      });
    }
  }

  return { tiles, scenery, groundLoot, buildings };
}

// ============================================================================
// MAIN BATTLE ROYALE ARENA COMPONENT (IMAGE SPRITE ENGINE & Y-SORTING)
// ============================================================================

export const BattleRoyaleArena: React.FC<BattleRoyaleArenaProps> = ({
  user,
  onExitArena,
  onExit,
  onOpenShop
}) => {
  const handleExit = onExit || onExitArena;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Asset Preloader Cache
  const imageAssets = useRef<Record<string, HTMLImageElement>>({});
  const [assetsPreloaded, setAssetsPreloaded] = useState<boolean>(false);

  // Preload Image Assets on Mount
  useEffect(() => {
    let loadedCount = 0;
    const entries = Object.entries(SPRITE_MANIFEST);
    const total = entries.length;

    entries.forEach(([key, src]) => {
      const img = new Image();
      img.onload = () => {
        loadedCount++;
        if (loadedCount === total) setAssetsPreloaded(true);
      };
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === total) setAssetsPreloaded(true);
      };
      img.src = src;
      imageAssets.current[key] = img;
    });

    // Also preload the 1024x1024 modular character action sheets (idle, walk, run, attack, hurt, death)
    Object.values(CHARACTER_ACTION_SHEETS).forEach(sheets => {
      [sheets.idle, sheets.walk, sheets.run, sheets.attack, sheets.hurt, sheets.death].forEach(url => {
        if (url && !characterActionCache.has(url)) {
          const img = new Image();
          img.src = url;
          characterActionCache.set(url, img);
        }
      });
    });
  }, []);

  // Tracking animation transitions (damage, death)
  const localDeathTimeRef = useRef<number>(0);
  const lastDamageTimeRef = useRef<number>(0);
  const prevLocalHpRef = useRef<number>(100);

  // Firestore Synced States
  const [arenaPlayers, setArenaPlayers] = useState<ArenaPlayer[]>([]);
  const [structures, setStructures] = useState<ArenaStructure[]>([]);
  const [crates, setCrates] = useState<SupplyCrate[]>([]);
  const [battleState, setBattleState] = useState<BattleEventState | null>(null);
  const [gameProfile, setGameProfile] = useState<UserGameProfile | null>(null);

  // Local Player State
  const [localX, setLocalX] = useState<number>(2500);
  const [localY, setLocalY] = useState<number>(2500);
  const [localHp, setLocalHp] = useState<number>(100);
  const [localShield, setLocalShield] = useState<number>(50);
  const [localWood, setLocalWood] = useState<number>(30);
  const [localBrick, setLocalBrick] = useState<number>(20);
  const [localMetal, setLocalMetal] = useState<number>(15);
  const [facingAngle, setFacingAngle] = useState<number>(0);
  const [isAlive, setIsAlive] = useState<boolean>(true);
  const [kills, setKills] = useState<number>(0);
  const [walkCycle, setWalkCycle] = useState<number>(0);
  const hasSpawnSynced = useRef<boolean>(false);

  // Fullscreen, Audio & Minimap UI state
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [soundMuted, setSoundMuted] = useState<boolean>(false);
  const [musicMuted, setMusicMuted] = useState<boolean>(false);
  const [minimapExpanded, setMinimapExpanded] = useState<boolean>(false);

  // Storm Dynamics (10-minute contraction with 10s-per-minute surge & random final center)
  const [stormRadius, setStormRadius] = useState<number>(3600);
  const stormCenter = useRef<{ x: number; y: number }>({ x: 2500, y: 2500 });
  const targetFinalCenterRef = useRef<{ x: number; y: number }>({ x: 2850, y: 1950 });
  const matchStartTimeRef = useRef<number>(Date.now());
  const [matchElapsedSeconds, setMatchElapsedSeconds] = useState<number>(0);
  const [isSurgeActive, setIsSurgeActive] = useState<boolean>(false);
  const wasSurgingRef = useRef<boolean>(false);

  // Spatial Audio Footsteps tracking
  const lastLocalFootstepTime = useRef<number>(0);
  const prevEnemyPositions = useRef<Record<string, { x: number; y: number; lastStepTime: number }>>({});

  // Combat Buffs & Cooldowns
  const [highGroundUntil, setHighGroundUntil] = useState<number>(0);
  const [metalShieldUntil, setMetalShieldUntil] = useState<number>(0);
  const [doubleDamageUntil, setDoubleDamageUntil] = useState<number>(0);
  const [powerCooldownUntil, setPowerCooldownUntil] = useState<number>(0);
  const [lastShotTime, setLastShotTime] = useState<number>(0);
  const [altFireCooldownUntil, setAltFireCooldownUntil] = useState<number>(0);
  const [acousticShieldUntil, setAcousticShieldUntil] = useState<number>(0);
  const [activeWeaponId, setActiveWeaponId] = useState<string>('bunsen_burner');
  const [musicTrackName, setMusicTrackName] = useState<string>('16-Bit Cyber Royale');
  const [activeSkinId, setActiveSkinId] = useState<string>('quantum_physicist');
  const [showInstructorSkinDrawer, setShowInstructorSkinDrawer] = useState<boolean>(false);

  // Supply Crate Modal
  const [activeCrateModal, setActiveCrateModal] = useState<SupplyCrate | null>(null);
  const [crateQuestionTimer, setCrateQuestionTimer] = useState<number>(3);
  const [crateFeedback, setCrateFeedback] = useState<string | null>(null);

  // Victory Celebration Modal
  const [winnerCelebration, setWinnerCelebration] = useState<{ name: string; avatar: string } | null>(null);

  // World Generation Cache
  const worldDataRef = useRef<{
    tiles: TileData[][];
    scenery: SceneryProp[];
    groundLoot: GroundLootItem[];
    buildings: GeneratedBuilding[];
  } | null>(null);

  if (!worldDataRef.current) {
    worldDataRef.current = generateSuperAnimalStyleMap();
  }

  // Camera State
  const cameraRef = useRef<{ x: number; y: number }>({ x: 2500 - 450, y: 2500 - 325 });

  // Projectiles & Particles
  const projectilesRef = useRef<Projectile[]>([]);
  const particlesRef = useRef<ParticleFX[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);

  // Input Keys & Mouse
  const keysPressed = useRef<Record<string, boolean>>({});
  const mouseScreenPos = useRef<{ x: number; y: number }>({ x: 500, y: 350 });

  // Building Blueprint Hologram Preview & Rotation State
  const [selectedBuildType, setSelectedBuildType] = useState<'wood_wall' | 'brick_ramp' | 'metal_bunker' | null>(null);
  const [buildRotation, setBuildRotation] = useState<number>(0); // 0, 90, 180, 270 (wrap 360)
  const previewPosRef = useRef<{ x: number; y: number; isValid: boolean }>({ x: 2500, y: 2500, isValid: true });

  // Viewport Dimensions
  const [viewDims, setViewDims] = useState<{ width: number; height: number }>({ width: 1000, height: 650 });

  // Fullscreen Toggle
  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        if (containerRef.current?.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch (err) {
      console.warn('Error toggling fullscreen:', err);
    }
  }, []);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Procedural Music & Audio Context Start
  useEffect(() => {
    soundEngine.initCtx();
    soundEngine.startMusic();

    const handleFirstGesture = () => {
      soundEngine.initCtx();
    };

    window.addEventListener('click', handleFirstGesture, { once: true });
    window.addEventListener('keydown', handleFirstGesture, { once: true });

    return () => {
      soundEngine.stopMusic();
      window.removeEventListener('click', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
    };
  }, []);

  useEffect(() => {
    soundEngine.setSfxEnabled(!soundMuted);
  }, [soundMuted]);

  useEffect(() => {
    soundEngine.setMusicEnabled(!musicMuted);
  }, [musicMuted]);

  // 1. Subscribe to Firestore Real-Time collections
  useEffect(() => {
    const unsubPlayers = subscribeToArenaPlayers((players) => {
      setArenaPlayers(players);
      const me = players.find(p => p.uid === user.id);
      if (me) {
        if (me.hp < prevLocalHpRef.current) {
          lastDamageTimeRef.current = Date.now();
        }
        if (!me.isAlive && prevLocalHpRef.current > 0 && localDeathTimeRef.current === 0) {
          localDeathTimeRef.current = Date.now();
        }
        prevLocalHpRef.current = me.hp;
        setLocalHp(me.hp);
        setLocalShield(me.shield);
        setIsAlive(me.isAlive);
        setKills(me.kills || 0);
        if (me.wood !== undefined) setLocalWood(me.wood);
        if (me.brick !== undefined) setLocalBrick(me.brick);
        if (me.metal !== undefined) setLocalMetal(me.metal);

        // Spawn position sync
        if (!hasSpawnSynced.current && me.x !== undefined && me.y !== undefined) {
          setLocalX(me.x);
          setLocalY(me.y);
          cameraRef.current.x = Math.max(0, Math.min(MAP_SIZE - viewDims.width, me.x - viewDims.width / 2));
          cameraRef.current.y = Math.max(0, Math.min(MAP_SIZE - viewDims.height, me.y - viewDims.height / 2));
          hasSpawnSynced.current = true;
        }
      }
    });

    const unsubStructs = subscribeToStructures((s) => setStructures(s));
    const unsubCrates = subscribeToSupplyCrates((c) => setCrates(c));

    const unsubState = subscribeToBattleState((st) => {
      setBattleState(st);
      if (st.status === 'IN_PROGRESS' && st.startedAt) {
        const startMs = new Date(st.startedAt).getTime();
        // If match was started within the last 10 minutes (600s), track elapsed time accurately;
        // if older than 10 mins (lingering session from hours ago), start fresh so players aren't damaged instantly
        if (Date.now() - startMs < 600 * 1000) {
          matchStartTimeRef.current = startMs;
        } else {
          matchStartTimeRef.current = Date.now();
        }
        if (st.stormFinalCenter) {
          targetFinalCenterRef.current = st.stormFinalCenter;
        } else {
          targetFinalCenterRef.current = getMatchFinalCenter(st.startedAt);
        }
      } else if (st.status === 'LOBBY') {
        matchStartTimeRef.current = Date.now();
      }
      if (st.status === 'ENDED' && st.currentWinner) {
        setWinnerCelebration(st.currentWinner);
        soundEngine.playVictory();
      }
    });

    return () => {
      unsubPlayers();
      unsubStructs();
      unsubCrates();
      unsubState();
    };
  }, [user.id, viewDims.width, viewDims.height]);

  // Subscribe to own profile for loadout
  useEffect(() => {
    if (!user.id) return;
    const unsub = subscribeToGameProfile(user.id, (p) => {
      setGameProfile(p);
      setLocalWood(p.wood);
      setLocalBrick(p.brick);
      setLocalMetal(p.metal);
    });
    return () => unsub();
  }, [user.id]);

  // Ensure local player or spectator is registered in battleEvent/players/items/{user.id}
  useEffect(() => {
    if (!user?.id) return;
    const isTeacher = user.role === 'instructor' || gameProfile?.role === 'instructor';
    const initialAvatar = activeSkinId || gameProfile?.equippedSkin || gameProfile?.avatar || 'cultist';
    const initialWeapon = gameProfile?.equippedWeapon || 'bunsen_burner';

    ensureArenaPlayer({
      uid: user.id,
      name: user.name || (isTeacher ? 'Instructor (Admin)' : 'Hero'),
      avatar: initialAvatar,
      equippedWeapon: initialWeapon,
      x: localX,
      y: localY,
      angle: 0,
      hp: 100,
      maxHp: 100,
      shield: 50,
      maxShield: 100,
      wood: Math.max(10, gameProfile?.wood ?? 20),
      brick: Math.max(10, gameProfile?.brick ?? 10),
      metal: Math.max(5, gameProfile?.metal ?? 5),
      isAlive: true,
      kills: 0
    });
  }, [user?.id, user?.name, user?.role, activeSkinId, gameProfile?.equippedSkin, gameProfile?.avatar, gameProfile?.equippedWeapon]);

  // Auto-resize canvas viewport (supports Fullscreen mode and responsive display)
  useEffect(() => {
    const handleResize = () => {
      if (document.fullscreenElement) {
        setViewDims({
          width: window.innerWidth,
          height: Math.max(480, window.innerHeight - 100)
        });
      } else {
        const canvas = canvasRef.current;
        if (canvas && canvas.parentElement) {
          const parentW = canvas.parentElement.clientWidth;
          const w = Math.min(1200, Math.max(340, parentW));
          const h = Math.min(750, Math.max(480, Math.round(w * 0.62)));
          setViewDims({ width: w, height: h });
        }
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    document.addEventListener('fullscreenchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('fullscreenchange', handleResize);
    };
  }, [isFullscreen]);

  // Keep activeWeaponId & activeSkinId synced if gameProfile updates
  useEffect(() => {
    if (gameProfile?.equippedWeapon) {
      setActiveWeaponId(gameProfile.equippedWeapon);
    }
  }, [gameProfile?.equippedWeapon]);

  useEffect(() => {
    if (gameProfile?.equippedSkin) {
      setActiveSkinId(gameProfile.equippedSkin);
    }
  }, [gameProfile?.equippedSkin]);

  // Instructor detection
  const isInstructor = user?.role === 'instructor' || gameProfile?.role === 'instructor';

  // Resolve equipped items
  const effectiveWeaponId = activeWeaponId || gameProfile?.equippedWeapon || 'bunsen_burner';
  const equippedWeapon: ShopItem = SHOP_ITEMS.find(i => i.id === effectiveWeaponId) || SHOP_ITEMS.find(i => i.category === 'weapon') || SHOP_ITEMS[0];
  const equippedPowerId = gameProfile?.equippedPower || 'element_shield';
  const equippedPower: ShopItem = SHOP_ITEMS.find(i => i.id === equippedPowerId) || SHOP_ITEMS[11];
  const effectiveSkinId = activeSkinId || gameProfile?.equippedSkin || gameProfile?.avatar || 'cultist';
  const equippedSkin: ShopItem = SHOP_ITEMS.find(i => i.id === effectiveSkinId) || SHOP_ITEMS[0];

  // Switch weapon immediately in arena
  const handleSelectWeapon = async (wId: string) => {
    setActiveWeaponId(wId);
    soundEngine.playRotate();
    await equipItem(user.id, 'weapon', wId);
  };

  // Switch skin immediately in arena (Instructors have full access to all 20 skins)
  const handleSelectSkin = async (skinId: string) => {
    setActiveSkinId(skinId);
    soundEngine.playRotate();
    await equipItem(user.id, 'skin', skinId);
    ensureArenaPlayer({
      uid: user.id,
      name: user.name || (isInstructor ? 'Instructor (Admin)' : 'Scientist'),
      avatar: skinId,
      equippedWeapon: effectiveWeaponId,
      x: localX,
      y: localY,
      angle: facingAngle,
      hp: localHp,
      maxHp: 100,
      shield: localShield,
      maxShield: 100,
      wood: localWood,
      brick: localBrick,
      metal: localMetal,
      isAlive: isAlive,
      kills: kills
    });
  };

  // Helper: Particle Spawner
  const spawnParticles = (
    x: number, 
    y: number, 
    color: string, 
    type: ParticleFX['type'], 
    count = 5, 
    speed = 3
  ) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * 2 * Math.PI;
      const spd = (0.5 + Math.random()) * speed;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        life: 0,
        maxLife: 15 + Math.random() * 20,
        color,
        size: 2 + Math.random() * 3,
        alpha: 1,
        type
      });
    }
  };

  // Helper: Floating Text
  const addFloatingText = (x: number, y: number, text: string, color: string) => {
    floatingTextsRef.current.push({
      id: `ft_${Date.now()}_${Math.random()}`,
      x,
      y,
      text,
      color,
      life: 0
    });
  };

  // 2. Keyboard & Mouse Input Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysPressed.current[key] = true;

      if (e.key === '1') {
        e.preventDefault();
        setSelectedBuildType(prev => prev === 'wood_wall' ? null : 'wood_wall');
      } else if (e.key === '2') {
        e.preventDefault();
        setSelectedBuildType(prev => prev === 'brick_ramp' ? null : 'brick_ramp');
      } else if (e.key === '3') {
        e.preventDefault();
        setSelectedBuildType(prev => prev === 'metal_bunker' ? null : 'metal_bunker');
      } else if (key === 'f') {
        e.preventDefault();
        handleFireWeaponRef.current(true);
      } else if (['4', '5', '6', '7', '8', '9', '0'].includes(e.key)) {
        e.preventDefault();
        const weaponIndexMap: Record<string, number> = {
          '4': 0, '5': 1, '6': 2, '7': 3, '8': 4, '9': 5, '0': 6
        };
        const allWeapons = SHOP_ITEMS.filter(i => i.category === 'weapon');
        const targetWeapon = allWeapons[weaponIndexMap[e.key]];
        if (targetWeapon) {
          handleSelectWeapon(targetWeapon.id);
        }
      } else if (key === 'r') {
        e.preventDefault();
        setBuildRotation(prev => ((prev + 90) % 360));
        soundEngine.playRotate();
      } else if (key === 'escape') {
        e.preventDefault();
        setSelectedBuildType(null);
      } else if (key === 'e' || key === 'q') {
        e.preventDefault();
        triggerSpecialPower();
      } else if (key === 'm') {
        e.preventDefault();
        setMinimapExpanded(prev => !prev);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [localX, localY, facingAngle, localWood, localBrick, localMetal, isAlive, activeWeaponId]);

  // Toggle building preview mode
  const buildStructure = (type: 'wood_wall' | 'brick_ramp' | 'metal_bunker') => {
    if (!isAlive) return;
    setSelectedBuildType(prev => prev === type ? null : type);
  };

  // 3. Real-Time 3D Building Placement (at blueprint preview position, safely offset)
  const executeBuildStructure = async (type: 'wood_wall' | 'brick_ramp' | 'metal_bunker') => {
    if (!isAlive) return;

    const prev = previewPosRef.current;
    if (!prev.isValid) {
      soundEngine.playSpatialHit(localX, localY, localX, localY);
      addFloatingText(localX, localY - 30, 'NOT ENOUGH MATERIALS!', '#ef4444');
      return;
    }

    const wx = prev.x;
    const wy = prev.y;
    const rot = buildRotation;
    const id = `struct_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;

    if (type === 'wood_wall') {
      if (localWood < 10) return;
      setLocalWood(p => Math.max(0, p - 10));
      soundEngine.playSpatialBuild('wood_wall', wx, wy, localX, localY);
      spawnParticles(wx, wy, '#f59e0b', 'wood_chip', 8, 4);
      addFloatingText(wx, wy - 18, `-10 🪵 Wall (${rot}°)`, '#fde68a');

      await placeArenaStructure({
        id,
        x: wx,
        y: wy,
        type: 'wood_wall',
        hp: 100,
        maxHp: 100,
        ownerId: user.id,
        createdAt: new Date().toISOString(),
        rotation: rot
      }, { wood: 10 }, user.id);

    } else if (type === 'brick_ramp') {
      if (localBrick < 15) return;
      setLocalBrick(p => Math.max(0, p - 15));
      setHighGroundUntil(Date.now() + 10000);
      soundEngine.playSpatialBuild('brick_ramp', wx, wy, localX, localY);
      spawnParticles(wx, wy, '#fb923c', 'stone_chip', 10, 4);
      addFloatingText(wx, wy - 22, `HIGH GROUND +20% DMG (${rot}°)`, '#fb923c');

      await placeArenaStructure({
        id,
        x: wx,
        y: wy,
        type: 'brick_ramp',
        hp: 120,
        maxHp: 120,
        ownerId: user.id,
        createdAt: new Date().toISOString(),
        rotation: rot
      }, { brick: 15 }, user.id);

    } else if (type === 'metal_bunker') {
      if (localMetal < 15) return;
      setLocalMetal(p => Math.max(0, p - 15));
      setMetalShieldUntil(Date.now() + 5000);
      soundEngine.playSpatialBuild('metal_bunker', wx, wy, localX, localY);
      spawnParticles(wx, wy, '#22d3ee', 'electric', 12, 5);
      addFloatingText(wx, wy - 22, `METAL SHIELD -50% DMG (${rot}°)`, '#38bdf8');

      await placeArenaStructure({
        id,
        x: wx,
        y: wy,
        type: 'metal_bunker',
        hp: 250,
        maxHp: 250,
        ownerId: user.id,
        createdAt: new Date().toISOString(),
        rotation: rot
      }, { metal: 15 }, user.id);

      await updatePlayerPosition(user.id, {
        metalShieldActiveUntil: Date.now() + 5000
      });
    }
  };

  // 4. Special Power Activation
  const triggerSpecialPower = async () => {
    if (!isAlive || Date.now() < powerCooldownUntil) return;
    const cooldownMs = (equippedPower.stats?.cooldownSeconds || 20) * 1000;
    setPowerCooldownUntil(Date.now() + cooldownMs);

    if (equippedPower.id === 'element_shield') {
      setLocalShield(prev => Math.min(100, prev + 40));
      spawnParticles(localX, localY, '#38bdf8', 'electric', 15, 4);
      addFloatingText(localX, localY - 25, '+40 SHIELD!', '#38bdf8');
      await updatePlayerPosition(user.id, { shield: Math.min(100, localShield + 40) });
    } else if (equippedPower.id === 'damage_boost') {
      setDoubleDamageUntil(Date.now() + 5000);
      spawnParticles(localX, localY, '#f43f5e', 'flame', 15, 5);
      addFloatingText(localX, localY - 25, '2X DAMAGE ACTIVE!', '#fb7185');
    } else if (equippedPower.id === 'quantum_dash') {
      const dashDist = 240;
      const newX = Math.max(60, Math.min(MAP_SIZE - 60, localX + Math.cos(facingAngle) * dashDist));
      const newY = Math.max(60, Math.min(MAP_SIZE - 60, localY + Math.sin(facingAngle) * dashDist));
      spawnParticles(localX, localY, '#a855f7', 'electric', 20, 6);
      setLocalX(newX);
      setLocalY(newY);
      spawnParticles(newX, newY, '#a855f7', 'spark', 15, 5);
      addFloatingText(newX, newY - 20, 'QUANTUM DASH', '#c084fc');
      await updatePlayerPosition(user.id, { x: newX, y: newY });
    } else if (equippedPower.id === 'matter_synthesizer') {
      setLocalWood(prev => prev + 15);
      setLocalBrick(prev => prev + 10);
      setLocalMetal(prev => prev + 5);
      spawnParticles(localX, localY, '#10b981', 'spark', 16, 4);
      addFloatingText(localX, localY - 25, '+15🪵 +10🧱 +5⚙️', '#34d399');
      await updatePlayerPosition(user.id, {
        wood: localWood + 15,
        brick: localBrick + 10,
        metal: localMetal + 5
      });
    }
  };

  // Ref to always access latest handleFireWeapon inside event listeners
  const handleFireWeaponRef = useRef<(isAlt?: boolean) => void>(() => {});

  // 5. Fire Weapon (Primary & Alternate Fire)
  const handleFireWeapon = async (isAlt = false) => {
    if (!isAlive) return;
    const now = Date.now();
    const isDoubleDamage = now < doubleDamageUntil;
    const isHighGround = now < highGroundUntil;

    const canvas = canvasRef.current;
    const rect = canvas?.getBoundingClientRect();
    const mouseCanvasX = rect ? mouseScreenPos.current.x - rect.left : viewDims.width / 2;
    const mouseCanvasY = rect ? mouseScreenPos.current.y - rect.top : viewDims.height / 2;
    const worldMouseX = Math.max(60, Math.min(MAP_SIZE - 60, mouseCanvasX + cameraRef.current.x));
    const worldMouseY = Math.max(60, Math.min(MAP_SIZE - 60, mouseCanvasY + cameraRef.current.y));

    if (isAlt) {
      // --- ALTERNATE FIRE MODE ---
      const alt = equippedWeapon.stats?.altFire;
      if (!alt) return;

      if (now < altFireCooldownUntil) {
        const rem = ((altFireCooldownUntil - now) / 1000).toFixed(1);
        addFloatingText(localX, localY - 25, `ALT-FIRE COOLDOWN (${rem}s)`, '#ef4444');
        return;
      }

      const altCooldownMs = (alt.altCooldownSeconds || 3) * 1000;
      setAltFireCooldownUntil(now + altCooldownMs);

      let altDmg = alt.altDamage || 40;
      if (isHighGround) altDmg = Math.round(altDmg * 1.2);
      if (isDoubleDamage) altDmg *= 2;

      switch (alt.altType) {
        case 'teleport': {
          // QUANTUM DISPLACER WARP TELEPORT (Teleports directly to where mouse is aimed!)
          const fromX = localX;
          const fromY = localY;
          const toX = worldMouseX;
          const toY = worldMouseY;

          // Departure FX
          spawnParticles(fromX, fromY, '#06b6d4', 'electric', 20, 6);
          spawnParticles(fromX, fromY, '#a855f7', 'spark', 15, 5);

          // Teleport player immediately
          setLocalX(toX);
          setLocalY(toY);
          cameraRef.current.x = Math.max(0, Math.min(MAP_SIZE - viewDims.width, toX - viewDims.width / 2));
          cameraRef.current.y = Math.max(0, Math.min(MAP_SIZE - viewDims.height, toY - viewDims.height / 2));

          // Arrival FX & Shockwave
          spawnParticles(toX, toY, '#06b6d4', 'electric', 25, 6);
          spawnParticles(toX, toY, '#38bdf8', 'flame', 15, 5);
          addFloatingText(toX, toY - 28, '⚡ QUANTUM WARP!', '#22d3ee');
          soundEngine.playSpatialBuild('metal_bunker', toX, toY, toX, toY);

          // Arrival Shockwave damage to nearby enemies
          arenaPlayers.forEach(p => {
            if (p.uid !== user.id && p.isAlive) {
              const d = Math.hypot(p.x - toX, p.y - toY);
              if (d < 120) {
                damageArenaPlayer(p.uid, altDmg, user.id).then(res => {
                  if (res.killed) setKills(k => k + 1);
                });
                spawnParticles(p.x, p.y, '#06b6d4', 'spark', 10, 4);
                addFloatingText(p.x, p.y - 30, `-${altDmg} WARP SHOCK`, '#06b6d4');
              }
            }
          });

          await updatePlayerPosition(user.id, { x: Math.round(toX), y: Math.round(toY) });
          break;
        }

        case 'ring_wave': {
          // BUNSEN BURNER: 360° Overheat Heatwave (12 radial flame projectiles)
          soundEngine.playSpatialShoot('bunsen_burner', localX, localY, localX, localY);
          addFloatingText(localX, localY - 25, '🔥 360° HEATWAVE!', '#f97316');
          spawnParticles(localX, localY, '#f97316', 'flame', 24, 6);

          const ringCount = 12;
          for (let i = 0; i < ringCount; i++) {
            const rad = (i / ringCount) * Math.PI * 2;
            projectilesRef.current.push({
              id: `alt_ring_${now}_${i}`,
              x: localX + Math.cos(rad) * 20,
              y: localY + Math.sin(rad) * 20,
              vx: Math.cos(rad) * 12,
              vy: Math.sin(rad) * 12,
              rangeRemaining: 260,
              damage: altDmg,
              ownerId: user.id,
              weaponId: equippedWeapon.id,
              color: '#f97316',
              isHighGround
            });
          }
          break;
        }

        case 'acid_pool': {
          // ACID PIPETTE: Chemical Acid Splash (3 acid globules in cluster)
          soundEngine.playSpatialShoot('acid_pipette', localX, localY, localX, localY);
          addFloatingText(localX, localY - 25, '🧪 ACID SPLASH!', '#10b981');
          spawnParticles(localX, localY, '#10b981', 'spark', 15, 4);

          for (let i = -1; i <= 1; i++) {
            const rad = facingAngle + i * 0.15;
            projectilesRef.current.push({
              id: `alt_acid_${now}_${i}`,
              x: localX + Math.cos(rad) * 25,
              y: localY + Math.sin(rad) * 25,
              vx: Math.cos(rad) * 14,
              vy: Math.sin(rad) * 14,
              rangeRemaining: 400,
              damage: altDmg,
              ownerId: user.id,
              weaponId: equippedWeapon.id,
              color: '#10b981',
              isHighGround
            });
          }
          break;
        }

        case 'freeze_blast': {
          // CRYO RAY: Glacial Freeze Blast (Large ice crystal + 5 shard fan)
          soundEngine.playSpatialShoot('cryo_freeze_ray', localX, localY, localX, localY);
          addFloatingText(localX, localY - 25, '❄️ GLACIAL BLAST!', '#06b6d4');
          spawnParticles(localX, localY, '#06b6d4', 'spark', 18, 5);

          for (let i = -2; i <= 2; i++) {
            const rad = facingAngle + i * 0.12;
            projectilesRef.current.push({
              id: `alt_freeze_${now}_${i}`,
              x: localX + Math.cos(rad) * 25,
              y: localY + Math.sin(rad) * 25,
              vx: Math.cos(rad) * (i === 0 ? 17 : 14),
              vy: Math.sin(rad) * (i === 0 ? 17 : 14),
              rangeRemaining: 480,
              damage: i === 0 ? altDmg : Math.round(altDmg * 0.65),
              ownerId: user.id,
              weaponId: equippedWeapon.id,
              color: '#38bdf8',
              isHighGround
            });
          }
          break;
        }

        case 'spread_beam': {
          // LASER CANNON: Prismatic Tri-Splitter (3 ruby lasers across 40° fan)
          soundEngine.playSpatialShoot('laser_pointer', localX, localY, localX, localY);
          addFloatingText(localX, localY - 25, '🔦 TRI-LASER!', '#ef4444');
          spawnParticles(localX, localY, '#ef4444', 'spark', 12, 5);

          [-0.26, 0, 0.26].forEach((offset, idx) => {
            const rad = facingAngle + offset;
            projectilesRef.current.push({
              id: `alt_laser_${now}_${idx}`,
              x: localX + Math.cos(rad) * 26,
              y: localY + Math.sin(rad) * 26,
              vx: Math.cos(rad) * 24,
              vy: Math.sin(rad) * 24,
              rangeRemaining: 680,
              damage: altDmg,
              ownerId: user.id,
              weaponId: equippedWeapon.id,
              color: '#ef4444',
              isHighGround
            });
          });
          break;
        }

        case 'emp_burst': {
          // TESLA ARC: EMP Pulse Nova (Radial 220px electric burst)
          soundEngine.playSpatialShoot('tesla_coil', localX, localY, localX, localY);
          addFloatingText(localX, localY - 25, '⚡ EMP PULSE NOVA!', '#38bdf8');
          spawnParticles(localX, localY, '#38bdf8', 'electric', 30, 7);

          arenaPlayers.forEach(p => {
            if (p.uid !== user.id && p.isAlive) {
              const d = Math.hypot(p.x - localX, p.y - localY);
              if (d < 220) {
                damageArenaPlayer(p.uid, altDmg, user.id).then(res => {
                  if (res.killed) setKills(k => k + 1);
                });
                spawnParticles(p.x, p.y, '#38bdf8', 'electric', 12, 5);
                addFloatingText(p.x, p.y - 30, `-${altDmg} EMP STUN`, '#38bdf8');
              }
            }
          });
          break;
        }

        case 'sonic_barrier': {
          // ULTRASONIC RESONATOR: Acoustic Deflector Shield (active barrier + knockback wave)
          soundEngine.playSpatialShoot('centrifuge_sonic_blaster', localX, localY, localX, localY);
          setAcousticShieldUntil(now + 2800);
          addFloatingText(localX, localY - 25, '🔊 ACOUSTIC DEFLECTOR (2.8s)', '#eab308');
          spawnParticles(localX, localY, '#eab308', 'spark', 25, 6);

          arenaPlayers.forEach(p => {
            if (p.uid !== user.id && p.isAlive) {
              const d = Math.hypot(p.x - localX, p.y - localY);
              if (d < 180) {
                damageArenaPlayer(p.uid, altDmg, user.id).then(res => {
                  if (res.killed) setKills(k => k + 1);
                });
                spawnParticles(p.x, p.y, '#eab308', 'spark', 10, 4);
                addFloatingText(p.x, p.y - 30, `-${altDmg} ACOUSTIC SHOCK`, '#eab308');
              }
            }
          });
          break;
        }

        case 'vortex': {
          // PARTICLE ACCELERATOR: Gravitational Vortex (Launches singularity to mouse target)
          soundEngine.playSpatialShoot('particle_accelerator', localX, localY, localX, localY);
          addFloatingText(localX, localY - 25, '🌀 GRAVITATIONAL VORTEX!', '#a855f7');
          spawnParticles(localX, localY, '#a855f7', 'electric', 20, 6);

          const targetDist = Math.hypot(worldMouseX - localX, worldMouseY - localY);
          const aimAngle = Math.atan2(worldMouseY - localY, worldMouseX - localX);
          projectilesRef.current.push({
            id: `alt_vortex_${now}`,
            x: localX + Math.cos(aimAngle) * 25,
            y: localY + Math.sin(aimAngle) * 25,
            vx: Math.cos(aimAngle) * 16,
            vy: Math.sin(aimAngle) * 16,
            rangeRemaining: Math.min(650, targetDist),
            damage: altDmg,
            ownerId: user.id,
            weaponId: equippedWeapon.id,
            color: '#a855f7',
            isHighGround
          });

          arenaPlayers.forEach(p => {
            if (p.uid !== user.id && p.isAlive) {
              const d = Math.hypot(p.x - worldMouseX, p.y - worldMouseY);
              if (d < 180) {
                spawnParticles(p.x, p.y, '#a855f7', 'spark', 8, 4);
                damageArenaPlayer(p.uid, altDmg, user.id).then(res => {
                  if (res.killed) setKills(k => k + 1);
                });
                addFloatingText(p.x, p.y - 30, `-${altDmg} VORTEX CRUSH`, '#c084fc');
              }
            }
          });
          break;
        }

        case 'cluster_bomb': {
          // BIOHAZARD RAILGUN: Mutagenic Cluster Bomb (3 spreading toxic canisters)
          soundEngine.playSpatialShoot('biohazard_railgun', localX, localY, localX, localY);
          addFloatingText(localX, localY - 25, '☣️ CLUSTER CANISTERS!', '#84cc16');
          spawnParticles(localX, localY, '#84cc16', 'smoke', 20, 5);

          [-0.2, 0, 0.2].forEach((offset, idx) => {
            const rad = facingAngle + offset;
            projectilesRef.current.push({
              id: `alt_cluster_${now}_${idx}`,
              x: localX + Math.cos(rad) * 26,
              y: localY + Math.sin(rad) * 26,
              vx: Math.cos(rad) * 18,
              vy: Math.sin(rad) * 18,
              rangeRemaining: 600,
              damage: altDmg,
              ownerId: user.id,
              weaponId: equippedWeapon.id,
              color: '#84cc16',
              isHighGround
            });
          });
          break;
        }

        case 'orbital_strike': {
          // ANTIMATTER ANNIHILATOR: Orbital Positron Strike
          soundEngine.playSpatialShoot('antimatter_annihilator', localX, localY, localX, localY);
          addFloatingText(worldMouseX, worldMouseY - 35, '⚠️ ORBITAL LOCK!', '#f43f5e');
          spawnParticles(worldMouseX, worldMouseY, '#f43f5e', 'spark', 15, 4);

          setTimeout(() => {
            spawnParticles(worldMouseX, worldMouseY, '#f43f5e', 'flame', 35, 8);
            spawnParticles(worldMouseX, worldMouseY, '#fb7185', 'electric', 25, 7);
            addFloatingText(worldMouseX, worldMouseY - 30, '💥 130 ANNIHILATION!', '#fda4af');
            soundEngine.playSpatialBuild('metal_bunker', worldMouseX, worldMouseY, localX, localY);

            arenaPlayers.forEach(p => {
              if (p.uid !== user.id && p.isAlive) {
                const d = Math.hypot(p.x - worldMouseX, p.y - worldMouseY);
                if (d < 160) {
                  damageArenaPlayer(p.uid, altDmg, user.id).then(res => {
                    if (res.killed) setKills(k => k + 1);
                  });
                  spawnParticles(p.x, p.y, '#f43f5e', 'flame', 15, 6);
                  addFloatingText(p.x, p.y - 30, `-${altDmg} POSITRON BLAST`, '#f43f5e');
                }
              }
            });
          }, 250);
          break;
        }
      }
      return;
    }

    // --- PRIMARY FIRE MODE ---
    const cooldownMs = (equippedWeapon.stats?.cooldownSeconds || 0.4) * 1000;
    if (now - lastShotTime < cooldownMs) return;
    setLastShotTime(now);

    const baseDamage = equippedWeapon.stats?.damage || 20;
    let finalDamage = baseDamage;
    if (isHighGround) finalDamage = Math.round(finalDamage * 1.2);
    if (isDoubleDamage) finalDamage = finalDamage * 2;

    const speed = equippedWeapon.id === 'laser_pointer' ? 24 : (equippedWeapon.id === 'biohazard_railgun' ? 22 : 18);
    const beamColor = equippedWeapon.stats?.beamColor || '#f97316';

    const proj: Projectile = {
      id: `proj_${now}_${Math.random()}`,
      x: localX + Math.cos(facingAngle) * 26,
      y: localY + Math.sin(facingAngle) * 26,
      vx: Math.cos(facingAngle) * speed,
      vy: Math.sin(facingAngle) * speed,
      rangeRemaining: equippedWeapon.stats?.range || 520,
      damage: finalDamage,
      ownerId: user.id,
      weaponId: equippedWeapon.id,
      color: beamColor,
      isHighGround
    };

    projectilesRef.current.push(proj);
    soundEngine.playSpatialShoot(equippedWeapon.id, localX, localY, localX, localY);

    // Muzzle flash
    spawnParticles(
      localX + Math.cos(facingAngle) * 28,
      localY + Math.sin(facingAngle) * 28,
      beamColor,
      'spark',
      4,
      3
    );
  };

  handleFireWeaponRef.current = handleFireWeapon;

  // 6. MAIN 60FPS GAME LOOP WITH Y-SORTING DEPTH ENGINE & VIEWPORT CULLING
  useEffect(() => {
    let animationFrameId: number;
    let lastPositionSync = 0;
    let lastStormDamageTime = 0;

    const gameLoop = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const now = Date.now();
      const viewW = viewDims.width;
      const viewH = viewDims.height;

      // --- 1. LOCAL PLAYER MOVEMENT & GROUND LOOT COLLISION ---
      if (isAlive) {
        let dx = 0;
        let dy = 0;
        const speed = 5.2;

        if (keysPressed.current['w'] || keysPressed.current['arrowup']) dy -= speed;
        if (keysPressed.current['s'] || keysPressed.current['arrowdown']) dy += speed;
        if (keysPressed.current['a'] || keysPressed.current['arrowleft']) dx -= speed;
        if (keysPressed.current['d'] || keysPressed.current['arrowright']) dx += speed;

        if (dx !== 0 && dy !== 0) {
          dx *= 0.7071;
          dy *= 0.7071;
        }

        if (dx !== 0 || dy !== 0) {
          setWalkCycle(prev => (prev + 0.25) % (Math.PI * 2));

          // Spatial Footstep Sound for Local Player
          if (now - lastLocalFootstepTime.current > 290) {
            lastLocalFootstepTime.current = now;
            const tileCol = Math.min(TILES_COUNT - 1, Math.max(0, Math.floor(localX / WORLD_TILE_SIZE)));
            const tileRow = Math.min(TILES_COUNT - 1, Math.max(0, Math.floor(localY / WORLD_TILE_SIZE)));
            const surface = worldDataRef.current?.tiles[tileRow]?.[tileCol]?.surface || 'grass';
            soundEngine.playSpatialFootstep(localX, localY, localX, localY, surface);
          }

          const nextX = Math.max(35, Math.min(MAP_SIZE - 35, localX + dx));
          const nextY = Math.max(35, Math.min(MAP_SIZE - 35, localY + dy));

          let blocked = false;
          const collRadius = 18;

          // Prop base collision
          if (worldDataRef.current) {
            for (const sc of worldDataRef.current.scenery) {
              if (sc.hp > 0) {
                const dist = Math.hypot(nextX - sc.x, nextY - sc.y);
                if (dist < collRadius + sc.footprintRadius * 0.7) {
                  blocked = true;
                  break;
                }
              }
            }
          }

          // Building solid hitbox collision (Roof and walls block player movement)
          if (!blocked && worldDataRef.current?.buildings) {
            for (const bldg of worldDataRef.current.buildings) {
              const hb = bldg.hitbox;
              if (
                nextX + collRadius > hb.x &&
                nextX - collRadius < hb.x + hb.w &&
                nextY + collRadius > hb.y &&
                nextY - collRadius < hb.y + hb.h
              ) {
                const dw = bldg.doorway;
                const isAtDoorX = nextX >= dw.x && nextX <= dw.x + dw.w;
                const isAtDoorY = nextY >= dw.y - 12 && nextY <= dw.y + dw.h + 12;
                if (isAtDoorX && isAtDoorY) {
                  const roofLimitY = hb.y + WORLD_TILE_SIZE * (bldg.height >= 4 ? 2 : 1);
                  if (nextY < roofLimitY) {
                    blocked = true;
                    break;
                  }
                  continue;
                }
                blocked = true;
                break;
              }
            }
          }

          // Structure collision with One-Way Ramp Access
          if (!blocked) {
            for (const st of structures) {
              const dist = Math.hypot(nextX - st.x, nextY - st.y);
              if (dist < collRadius + 18) {
                if (st.type === 'brick_ramp') {
                  // One-way access: allow moving in the direction of the ramp ascent
                  const rot = st.rotation || 0;
                  const rad = ((rot - 90) * Math.PI) / 180;
                  const nx = Math.cos(rad);
                  const ny = Math.sin(rad);

                  const moveMag = Math.hypot(dx, dy);
                  if (moveMag > 0.001) {
                    const mdx = dx / moveMag;
                    const mdy = dy / moveMag;
                    const alignment = mdx * nx + mdy * ny;

                    // If moving in ascent direction (or sideways across), allow passage & grant high ground!
                    if (alignment >= -0.2) {
                      setHighGroundUntil(Date.now() + 3500);
                      continue; // NOT blocked! Free passage!
                    }
                  }
                  // Moving in reverse against one-way gate: blocked!
                  blocked = true;
                  break;
                } else {
                  // Walls and bunkers block all directions
                  blocked = true;
                  break;
                }
              }
            }
          }

          if (!blocked) {
            setLocalX(nextX);
            setLocalY(nextY);

            if (Math.random() < 0.2) {
              spawnParticles(nextX - dx * 2, nextY - dy * 2, '#64748b', 'dust', 1, 1);
            }
          }
        }

        // Unstuck safeguard: ensure player is never trapped inside building walls/roofs
        if (worldDataRef.current?.buildings) {
          for (const bldg of worldDataRef.current.buildings) {
            const hb = bldg.hitbox;
            if (
              localX > hb.x + 10 && localX < hb.x + hb.w - 10 &&
              localY > hb.y + 10 && localY < hb.y + hb.h - 10
            ) {
              const dw = bldg.doorway;
              const isAtDoor = localX >= dw.x && localX <= dw.x + dw.w && localY >= dw.y - 10 && localY <= dw.y + dw.h + 10;
              if (!isAtDoor) {
                setLocalX(dw.x + dw.w / 2);
                setLocalY(dw.y + dw.h + 24);
                break;
              }
            }
          }
        }

        // Unstuck safeguard: ensure player is never trapped inside walls or bunkers (exclude ramps!)
        for (const st of structures) {
          if (st.type === 'brick_ramp') continue; // NEVER push player off ramps - ramps are walkable platforms!
          const dist = Math.hypot(localX - st.x, localY - st.y);
          const minSafeDist = 38;
          if (dist < minSafeDist) {
            const pushAngle = dist > 0.05 ? Math.atan2(localY - st.y, localX - st.x) : facingAngle;
            const pushDist = minSafeDist - dist + 4;
            setLocalX(prev => Math.max(35, Math.min(MAP_SIZE - 35, prev + Math.cos(pushAngle) * pushDist)));
            setLocalY(prev => Math.max(35, Math.min(MAP_SIZE - 35, prev + Math.sin(pushAngle) * pushDist)));
            break;
          }
        }

        // Water walking ripple particles
        const curCol = Math.min(TILES_COUNT - 1, Math.max(0, Math.floor(localX / WORLD_TILE_SIZE)));
        const curRow = Math.min(TILES_COUNT - 1, Math.max(0, Math.floor(localY / WORLD_TILE_SIZE)));
        if (worldDataRef.current?.tiles[curRow]?.[curCol]?.isWater && Math.random() < 0.2) {
          spawnParticles(localX, localY, '#38bdf8', 'spark', 2, 1.2);
        }

        // Aim angle towards mouse in world space
        const rect = canvas.getBoundingClientRect();
        const mouseCanvasX = mouseScreenPos.current.x - rect.left;
        const mouseCanvasY = mouseScreenPos.current.y - rect.top;
        const worldMouseX = mouseCanvasX + cameraRef.current.x;
        const worldMouseY = mouseCanvasY + cameraRef.current.y;

        const angle = Math.atan2(worldMouseY - localY, worldMouseX - localX);
        setFacingAngle(angle);

        // Ground Loot Pickup Detection (Super Animal Royale banana & gear pickup!)
        if (worldDataRef.current) {
          worldDataRef.current.groundLoot.forEach(loot => {
            if (!loot.isCollected) {
              const dist = Math.hypot(localX - loot.x, localY - loot.y);
              if (dist < 28) {
                loot.isCollected = true;
                soundEngine.playEatBanana();

                if (loot.type === 'banana') {
                  setLocalHp(prev => Math.min(100, prev + (loot.healHp || 25)));
                  addFloatingText(localX, localY - 25, '+25 HP Banana Snack! 🍌', '#facc15');
                  spawnParticles(localX, localY, '#facc15', 'banana_peel', 6, 2);
                } else if (loot.type === 'shield_cell') {
                  setLocalShield(prev => Math.min(100, prev + (loot.grantShield || 30)));
                  addFloatingText(localX, localY - 25, '+30 Shield Battery! ⚡', '#22d3ee');
                  spawnParticles(localX, localY, '#22d3ee', 'electric', 6, 2);
                } else if (loot.type === 'ammo_box') {
                  setLocalWood(prev => prev + 15);
                  setLocalBrick(prev => prev + 10);
                  setLocalMetal(prev => prev + 5);
                  addFloatingText(localX, localY - 25, '+15🪵 +10🧱 +5⚙️ Crate', '#4ade80');
                } else {
                  setLocalHp(prev => Math.min(100, prev + 15));
                  setLocalShield(prev => Math.min(100, prev + 15));
                  addFloatingText(localX, localY - 25, '+15 HP & Shield Catalyst!', '#c084fc');
                }
              }
            }
          });
        }

        // Sync position to Firestore throttled at ~120ms
        if (now - lastPositionSync > 120) {
          lastPositionSync = now;
          updatePlayerPosition(user.id, {
            x: Math.round(localX),
            y: Math.round(localY),
            angle: Number(angle.toFixed(2))
          }).catch(() => {});
        }
      }

      // --- 2. REMOTE PLAYERS SPATIAL FOOTSTEPS ---
      arenaPlayers.forEach(p => {
        if (p.uid !== user.id && p.isAlive) {
          const prevPos = prevEnemyPositions.current[p.uid];
          if (prevPos) {
            const movedDist = Math.hypot(p.x - prevPos.x, p.y - prevPos.y);
            if (movedDist > 3.5 && now - prevPos.lastStepTime > 320) {
              prevPos.lastStepTime = now;
              const enemyTileCol = Math.min(TILES_COUNT - 1, Math.max(0, Math.floor(p.x / WORLD_TILE_SIZE)));
              const enemyTileRow = Math.min(TILES_COUNT - 1, Math.max(0, Math.floor(p.y / WORLD_TILE_SIZE)));
              const enemySurface = worldDataRef.current?.tiles[enemyTileRow]?.[enemyTileCol]?.surface || 'grass';
              soundEngine.playSpatialFootstep(p.x, p.y, localX, localY, enemySurface);
            }
            prevPos.x = p.x;
            prevPos.y = p.y;
          } else {
            prevEnemyPositions.current[p.uid] = { x: p.x, y: p.y, lastStepTime: now };
          }
        }
      });

      // --- 3. SMOOTH CAMERA TRACKING ---
      const targetCamX = localX - viewW / 2;
      const targetCamY = localY - viewH / 2;
      cameraRef.current.x += (targetCamX - cameraRef.current.x) * 0.14;
      cameraRef.current.y += (targetCamY - cameraRef.current.y) * 0.14;

      cameraRef.current.x = Math.max(0, Math.min(MAP_SIZE - viewW, cameraRef.current.x));
      cameraRef.current.y = Math.max(0, Math.min(MAP_SIZE - viewH, cameraRef.current.y));

      const camX = cameraRef.current.x;
      const camY = cameraRef.current.y;

      // --- 4. 10-MINUTE SHRINKING STORM CIRCLE WITH 10S-PER-MINUTE SURGE & RANDOM CENTER ---
      const isMatchActive = !battleState || battleState.status === 'IN_PROGRESS';
      const elapsedSec = isMatchActive ? Math.max(0, (now - matchStartTimeRef.current) / 1000) : 0;
      setMatchElapsedSeconds(elapsedSec);

      const storm = calculateStormState(elapsedSec, targetFinalCenterRef.current);
      setStormRadius(storm.radius);
      stormCenter.current = storm.center;

      // Trigger warning sound on entering storm surge
      if (storm.isSurging && !wasSurgingRef.current && isMatchActive) {
        soundEngine.playStormSurgeAlert();
      }
      wasSurgingRef.current = storm.isSurging;
      setIsSurgeActive(storm.isSurging && isMatchActive);

      // Dynamically modulate background music tension
      soundEngine.updateMusicTension(storm.progress, storm.isSurging && isMatchActive);

      // Damage only occurs when player is outside the eye of the storm during an active match
      const distFromCenter = Math.hypot(localX - stormCenter.current.x, localY - stormCenter.current.y);
      const isOutsideEye = distFromCenter > storm.radius;
      if (isOutsideEye && isAlive && isMatchActive) {
        if (now - lastStormDamageTime > 1000) {
          lastStormDamageTime = now;
          soundEngine.playSpatialHit(localX, localY, localX, localY);
          addFloatingText(localX, localY - 32, '⚡ -5 STORM DAMAGE', '#c084fc');
          damageArenaPlayer(user.id, 5).then(res => {
            if (res.killed) setIsAlive(false);
          });
        }
      }

      // --- 5. SUPPLY CRATE COLLISION ---
      crates.forEach(crate => {
        if (!crate.isClaimed && isAlive) {
          const distToCrate = Math.hypot(localX - crate.x, localY - crate.y);
          if (distToCrate < 34 && !activeCrateModal) {
            setActiveCrateModal(crate);
            setCrateQuestionTimer(3);
            setCrateFeedback(null);
          }
        }
      });

      // --- 6. SIMULATE PROJECTILES ---
      const activeProjectiles: Projectile[] = [];

      projectilesRef.current.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.rangeRemaining -= Math.hypot(p.vx, p.vy);

        // Acoustic Deflector Shield active on local player: deflect incoming enemy projectiles!
        if (now < acousticShieldUntil && p.ownerId !== user.id) {
          const distToPlayer = Math.hypot(p.x - localX, p.y - localY);
          if (distToPlayer < 65) {
            p.vx = -p.vx * 1.25;
            p.vy = -p.vy * 1.25;
            p.ownerId = user.id;
            p.color = '#eab308';
            spawnParticles(p.x, p.y, '#eab308', 'electric', 10, 4);
            soundEngine.playSpatialHit(p.x, p.y, localX, localY);
            addFloatingText(localX, localY - 26, 'DEFLECTED! 🛡️', '#eab308');
          }
        }

        let hit = false;

        // Collision with building walls and roofs
        if (worldDataRef.current?.buildings) {
          for (const bldg of worldDataRef.current.buildings) {
            const hb = bldg.hitbox;
            if (p.x >= hb.x && p.x <= hb.x + hb.w && p.y >= hb.y && p.y <= hb.y + hb.h) {
              hit = true;
              soundEngine.playSpatialHit(p.x, p.y, localX, localY);
              spawnParticles(p.x, p.y, '#94a3b8', 'stone_chip', 5, 2.5);
              break;
            }
          }
        }

        // Collision with props
        if (!hit && worldDataRef.current) {
          for (const sc of worldDataRef.current.scenery) {
            if (sc.hp > 0) {
              const dist = Math.hypot(p.x - sc.x, p.y - sc.y);
              if (dist < sc.footprintRadius) {
                hit = true;
                sc.hp -= p.damage;
                soundEngine.playSpatialHit(p.x, p.y, localX, localY);

                if (sc.materialDrop === 'wood') {
                  spawnParticles(p.x, p.y, '#f59e0b', 'wood_chip', 6, 3);
                } else if (sc.materialDrop === 'brick') {
                  spawnParticles(p.x, p.y, '#fb923c', 'stone_chip', 6, 3);
                } else {
                  spawnParticles(p.x, p.y, '#38bdf8', 'spark', 6, 4);
                }

                if (sc.hp <= 0 && p.ownerId === user.id) {
                  if (sc.materialDrop === 'wood') setLocalWood(prev => prev + sc.dropAmount);
                  if (sc.materialDrop === 'brick') setLocalBrick(prev => prev + sc.dropAmount);
                  if (sc.materialDrop === 'metal') setLocalMetal(prev => prev + sc.dropAmount);
                  addFloatingText(sc.x, sc.y - 20, `+${sc.dropAmount} ${sc.materialDrop.toUpperCase()}`, '#4ade80');
                }
                break;
              }
            }
          }
        }

        // Collision with structures
        if (!hit) {
          for (const st of structures) {
            const distToStruct = Math.hypot(p.x - st.x, p.y - st.y);
            if (distToStruct < 28) {
              if (p.isHighGround && st.type === 'wood_wall') continue;
              hit = true;
              damageArenaStructure(st.id, p.damage);
              soundEngine.playSpatialHit(p.x, p.y, localX, localY);
              spawnParticles(p.x, p.y, '#94a3b8', 'stone_chip', 6, 3);
              break;
            }
          }
        }

        // Collision with other players
        if (!hit) {
          for (const enemy of arenaPlayers) {
            if (enemy.uid !== p.ownerId && enemy.isAlive) {
              const distToEnemy = Math.hypot(p.x - enemy.x, p.y - enemy.y);
              if (distToEnemy < 24) {
                hit = true;
                soundEngine.playSpatialHit(enemy.x, enemy.y, localX, localY);
                spawnParticles(enemy.x, enemy.y, '#ef4444', 'spark', 8, 4);
                addFloatingText(enemy.x, enemy.y - 32, `-${p.damage}`, '#ef4444');

                damageArenaPlayer(enemy.uid, p.damage, p.ownerId).then(res => {
                  if (res.killed && p.ownerId === user.id) {
                    setKills(prev => prev + 1);
                    addFloatingText(enemy.x, enemy.y - 48, 'ELIMINATED! 💀', '#fbbf24');
                  }
                });
                break;
              }
            }
          }
        }

        if (!hit && p.rangeRemaining > 0 && p.x > 0 && p.x < MAP_SIZE && p.y > 0 && p.y < MAP_SIZE) {
          activeProjectiles.push(p);

          if (Math.random() < 0.6) {
            particlesRef.current.push({
              x: p.x,
              y: p.y,
              vx: (Math.random() - 0.5) * 0.8,
              vy: (Math.random() - 0.5) * 0.8,
              life: 0,
              maxLife: 10,
              color: p.color,
              size: 2,
              alpha: 0.8,
              type: p.weaponId === 'bunsen_burner' ? 'flame' : 'spark'
            });
          }
        }
      });

      projectilesRef.current = activeProjectiles;

      // Update particles
      particlesRef.current.forEach(pt => {
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life++;
        pt.alpha = Math.max(0, 1 - pt.life / pt.maxLife);
      });
      particlesRef.current = particlesRef.current.filter(pt => pt.life < pt.maxLife);

      // Update floating texts
      floatingTextsRef.current.forEach(ft => {
        ft.y -= 0.7;
        ft.life++;
      });
      floatingTextsRef.current = floatingTextsRef.current.filter(ft => ft.life < 45);

      // =======================================================================
      // --- 6. CANVAS RENDERING WITH Y-SORTING DEPTH ENGINE & CULLING ---
      // =======================================================================
      ctx.save();
      ctx.clearRect(0, 0, viewW, viewH);

      // Translate world by Camera position
      ctx.translate(-camX, -camY);

      // =======================================================================
      // LAYER 0 (SOLID GROUND BASE): 100% SOLID GRASS (col: 5, row: 0)
      // Iterates through every visible viewport cell to eliminate all black gaps!
      // =======================================================================
      const startCol = Math.max(0, Math.floor((camX - 32) / WORLD_TILE_SIZE));
      const endCol = Math.min(TILES_COUNT - 1, Math.ceil((camX + viewW + 32) / WORLD_TILE_SIZE));
      const startRow = Math.max(0, Math.floor((camY - 32) / WORLD_TILE_SIZE));
      const endRow = Math.min(TILES_COUNT - 1, Math.ceil((camY + viewH + 32) / WORLD_TILE_SIZE));

      const sheetImg = imageAssets.current['landscape_sheet'];
      const hasSheet = sheetImg && sheetImg.complete && sheetImg.naturalWidth > 0;

      ctx.imageSmoothingEnabled = false; // Crisp 16x16 Kenney pixel scaling
      const solidGrassCoords = getTileSourceCoords(5, 0); // Solid grass: col 5, row 0 (sx: 5*17, sy: 0*17)

      for (let r = startRow; r <= endRow; r++) {
        for (let c = startCol; c <= endCol; c++) {
          const tx = c * WORLD_TILE_SIZE;
          const ty = r * WORLD_TILE_SIZE;

          if (hasSheet) {
            ctx.drawImage(
              sheetImg,
              solidGrassCoords.sx,
              solidGrassCoords.sy,
              TILE_SIZE,
              TILE_SIZE,
              tx,
              ty,
              WORLD_TILE_SIZE,
              WORLD_TILE_SIZE
            );
          } else {
            ctx.fillStyle = '#15803d';
            ctx.fillRect(tx, ty, WORLD_TILE_SIZE, WORLD_TILE_SIZE);
          }
        }
      }

      // =======================================================================
      // LAYER 1 (STRUCTURED WATER & DIRT REGIONS): 9-Slice Ponds & Dirt Roads
      // =======================================================================
      if (worldDataRef.current) {
        for (let r = startRow; r <= endRow; r++) {
          for (let c = startCol; c <= endCol; c++) {
            const tile = worldDataRef.current.tiles[r]?.[c];
            if (!tile) continue;

            if (tile.overlayCol !== undefined && tile.overlayRow !== undefined) {
              const tx = c * WORLD_TILE_SIZE;
              const ty = r * WORLD_TILE_SIZE;
              if (hasSheet) {
                const { sx, sy } = getTileSourceCoords(tile.overlayCol, tile.overlayRow);
                ctx.drawImage(
                  sheetImg,
                  sx,
                  sy,
                  TILE_SIZE,
                  TILE_SIZE,
                  tx,
                  ty,
                  WORLD_TILE_SIZE,
                  WORLD_TILE_SIZE
                );
              } else {
                ctx.fillStyle = tile.baseColor;
                ctx.fillRect(tx, ty, WORLD_TILE_SIZE, WORLD_TILE_SIZE);
              }
            }
          }
        }
      }

      // =======================================================================
      // LAYER 2 (PREFAB STRUCTURES): 4x4 and 3x3 Houses (Roof, Walls, Doors)
      // =======================================================================
      if (worldDataRef.current?.buildings) {
        for (const bldg of worldDataRef.current.buildings) {
          const hb = bldg.hitbox;
          // Viewport culling check
          if (
            hb.x + hb.w < camX - 40 ||
            hb.x > camX + viewW + 40 ||
            hb.y + hb.h < camY - 40 ||
            hb.y > camY + viewH + 40
          ) {
            continue;
          }

          // Soft building ground shadow
          ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
          ctx.fillRect(hb.x + 4, hb.y + hb.h - 8, hb.w, 14);

          // Draw building tiles (Roof Top row -> Wall Middle rows -> Door/Foundation Bottom row)
          for (const t of bldg.tiles) {
            const tx = t.col * WORLD_TILE_SIZE;
            const ty = t.row * WORLD_TILE_SIZE;

            if (hasSheet) {
              const { sx, sy } = getTileSourceCoords(t.sheetCol, t.sheetRow);
              ctx.drawImage(
                sheetImg,
                sx,
                sy,
                TILE_SIZE,
                TILE_SIZE,
                tx,
                ty,
                WORLD_TILE_SIZE,
                WORLD_TILE_SIZE
              );
            } else {
              ctx.fillStyle = t.isRoof ? '#991b1b' : '#64748b';
              ctx.fillRect(tx, ty, WORLD_TILE_SIZE, WORLD_TILE_SIZE);
            }
          }
        }
      }

      // =======================================================================
      // LAYER 3 (DECORATIONS & Y-SORTED PROPS): Trees, Fences, Tents, Flowers, Stumps
      // =======================================================================
      const ySortQueue: YSortEntity[] = [];

      // 1. Scenery Props (Pine Trees, Round Trees, Fences, Tents, Flowers, Stumps)
      if (worldDataRef.current) {
        worldDataRef.current.scenery.forEach(sc => {
          // Viewport culling check
          if (
            sc.x + sc.width / 2 < camX - 30 ||
            sc.x - sc.width / 2 > camX + viewW + 30 ||
            sc.y + sc.height < camY - 30 ||
            sc.y - sc.height > camY + viewH + 30
          ) {
            return;
          }

          if (sc.hp <= 0) return;

          ySortQueue.push({
            sortY: sc.y, // Footprint ground Y
            render: (cContext) => {
              cContext.save();

              // 1. Normalize tile coordinates for any scenery prop
              let col = sc.sheetCol;
              let row = sc.sheetRow;
              let topRow = sc.sheetTopRow;

              if (sc.type === 'pine_tree') {
                if (col === undefined || col === 0 || row === 8) {
                  col = 16;
                  row = 9;
                  topRow = 8;
                }
              } else if (sc.type === 'round_tree' || sc.type === 'oak_tree') {
                if (col === undefined || col === 1 || row === 8) {
                  col = 13;
                  row = 9;
                  topRow = 8;
                }
              } else if (sc.type === 'tree_stump') {
                if (col === undefined || col === 0) {
                  col = 28;
                  row = 9;
                }
              } else if (sc.type === 'tent') {
                if (col === undefined || col === 5) {
                  col = 15;
                  row = 24;
                }
              } else if (sc.type === 'fence') {
                if (col === undefined || col === 12) {
                  col = 13;
                  row = 13;
                }
              } else if (sc.type === 'flower') {
                if (col === undefined || col === 0) {
                  col = 1;
                  row = 7;
                }
              }

              // 2. Soft ground shadow under prop
              if (sc.type !== 'flower') {
                cContext.fillStyle = 'rgba(0, 0, 0, 0.28)';
                cContext.beginPath();
                cContext.ellipse(sc.x, sc.y + 2, sc.footprintRadius * 1.15, sc.footprintRadius * 0.45, 0, 0, Math.PI * 2);
                cContext.fill();
              }

              // 3. Render Sprite from Kenney roguelikeSheet
              if (hasSheet && col !== undefined && row !== undefined) {
                cContext.imageSmoothingEnabled = false;

                if (topRow !== undefined) {
                  // Two-tile tall structure (e.g. Kenney Pine / Round Tree: row 8 top crown + row 9 lower canopy & trunk)
                  const { sx: sxTop, sy: syTop } = getTileSourceCoords(col, topRow);
                  const { sx: sxBot, sy: syBot } = getTileSourceCoords(col, row);
                  const halfH = sc.height * 0.53;

                  // Upper canopy / spire
                  cContext.drawImage(
                    sheetImg,
                    sxTop, syTop, TILE_SIZE, TILE_SIZE,
                    sc.x - sc.width / 2,
                    sc.y - sc.height,
                    sc.width,
                    halfH
                  );
                  // Lower canopy & trunk
                  cContext.drawImage(
                    sheetImg,
                    sxBot, syBot, TILE_SIZE, TILE_SIZE,
                    sc.x - sc.width / 2,
                    sc.y - halfH + 1,
                    sc.width,
                    halfH
                  );
                } else {
                  // Single tile prop (Stump, Tent, Fence, Flower, Crate, Barrel)
                  const { sx, sy } = getTileSourceCoords(col, row);
                  cContext.drawImage(
                    sheetImg,
                    sx, sy, TILE_SIZE, TILE_SIZE,
                    sc.x - sc.width / 2,
                    sc.y - sc.height + (sc.type === 'flower' ? 0 : 2),
                    sc.width,
                    sc.height
                  );
                }
              } else {
                // Fallback: Check loaded preloaded SVG image asset
                const fallbackImg = imageAssets.current[sc.spriteKey] || 
                                    (sc.type === 'round_tree' ? imageAssets.current['prop_oak_tree'] : null) ||
                                    (sc.type === 'pine_tree' ? imageAssets.current['prop_pine_tree'] : null);
                if (fallbackImg && fallbackImg.complete && fallbackImg.naturalWidth > 0) {
                  cContext.drawImage(
                    fallbackImg,
                    sc.x - sc.width / 2,
                    sc.y - sc.height + sc.footprintRadius * 0.35,
                    sc.width,
                    sc.height
                  );
                } else {
                  // Rich procedural fallback with visible trunk and foliage (never blends into grass!)
                  if (sc.type === 'pine_tree') {
                    // Brown wooden trunk
                    cContext.fillStyle = '#78350f';
                    cContext.fillRect(sc.x - 4, sc.y - 12, 8, 12);
                    // Tier 1 (dark pine base)
                    cContext.fillStyle = '#14532d';
                    cContext.beginPath();
                    cContext.moveTo(sc.x - sc.width * 0.44, sc.y - 8);
                    cContext.lineTo(sc.x + sc.width * 0.44, sc.y - 8);
                    cContext.lineTo(sc.x, sc.y - sc.height * 0.55);
                    cContext.closePath();
                    cContext.fill();
                    // Tier 2 (mid green)
                    cContext.fillStyle = '#166534';
                    cContext.beginPath();
                    cContext.moveTo(sc.x - sc.width * 0.36, sc.y - sc.height * 0.38);
                    cContext.lineTo(sc.x + sc.width * 0.36, sc.y - sc.height * 0.38);
                    cContext.lineTo(sc.x, sc.y - sc.height * 0.8);
                    cContext.closePath();
                    cContext.fill();
                    // Tier 3 (bright peak)
                    cContext.fillStyle = '#22c55e';
                    cContext.beginPath();
                    cContext.moveTo(sc.x - sc.width * 0.26, sc.y - sc.height * 0.65);
                    cContext.lineTo(sc.x + sc.width * 0.26, sc.y - sc.height * 0.65);
                    cContext.lineTo(sc.x, sc.y - sc.height);
                    cContext.closePath();
                    cContext.fill();
                  } else if (sc.type === 'round_tree' || sc.type === 'oak_tree') {
                    // Sturdy wooden trunk
                    cContext.fillStyle = '#78350f';
                    cContext.fillRect(sc.x - 5, sc.y - 16, 10, 16);
                    // Canopy shadow base
                    cContext.fillStyle = '#14532d';
                    cContext.beginPath();
                    cContext.arc(sc.x, sc.y - sc.height * 0.58, sc.width * 0.42, 0, Math.PI * 2);
                    cContext.fill();
                    // Foliage clusters
                    cContext.fillStyle = '#16a34a';
                    cContext.beginPath();
                    cContext.arc(sc.x - sc.width * 0.15, sc.y - sc.height * 0.64, sc.width * 0.3, 0, Math.PI * 2);
                    cContext.arc(sc.x + sc.width * 0.15, sc.y - sc.height * 0.6, sc.width * 0.32, 0, Math.PI * 2);
                    cContext.fill();
                    // Sunlit crown
                    cContext.fillStyle = '#22c55e';
                    cContext.beginPath();
                    cContext.arc(sc.x, sc.y - sc.height * 0.74, sc.width * 0.28, 0, Math.PI * 2);
                    cContext.fill();
                  } else if (sc.type === 'tree_stump') {
                    cContext.fillStyle = '#78350f';
                    cContext.fillRect(sc.x - 8, sc.y - 12, 16, 12);
                    cContext.fillStyle = '#d97706';
                    cContext.beginPath();
                    cContext.ellipse(sc.x, sc.y - 12, 8, 4, 0, 0, Math.PI * 2);
                    cContext.fill();
                    cContext.fillStyle = '#fef08a';
                    cContext.beginPath();
                    cContext.ellipse(sc.x, sc.y - 12, 5, 2.5, 0, 0, Math.PI * 2);
                    cContext.fill();
                  } else if (sc.type === 'tent') {
                    cContext.fillStyle = '#d97706';
                    cContext.beginPath();
                    cContext.moveTo(sc.x - sc.width * 0.45, sc.y);
                    cContext.lineTo(sc.x + sc.width * 0.45, sc.y);
                    cContext.lineTo(sc.x, sc.y - sc.height * 0.85);
                    cContext.closePath();
                    cContext.fill();
                    cContext.fillStyle = '#1e293b';
                    cContext.beginPath();
                    cContext.moveTo(sc.x - 6, sc.y);
                    cContext.lineTo(sc.x + 6, sc.y);
                    cContext.lineTo(sc.x, sc.y - sc.height * 0.5);
                    cContext.closePath();
                    cContext.fill();
                  } else if (sc.type === 'fence') {
                    cContext.fillStyle = '#92400e';
                    cContext.fillRect(sc.x - sc.width * 0.4, sc.y - 14, 6, 14);
                    cContext.fillRect(sc.x + sc.width * 0.4 - 6, sc.y - 14, 6, 14);
                    cContext.fillStyle = '#b45309';
                    cContext.fillRect(sc.x - sc.width * 0.45, sc.y - 12, sc.width * 0.9, 4);
                    cContext.fillRect(sc.x - sc.width * 0.45, sc.y - 6, sc.width * 0.9, 4);
                  } else if (sc.type === 'flower') {
                    cContext.fillStyle = '#15803d';
                    cContext.fillRect(sc.x - 1, sc.y - 10, 2, 10);
                    cContext.fillStyle = '#f43f5e';
                    cContext.beginPath();
                    cContext.arc(sc.x, sc.y - 12, 5, 0, Math.PI * 2);
                    cContext.fill();
                    cContext.fillStyle = '#fef08a';
                    cContext.beginPath();
                    cContext.arc(sc.x, sc.y - 12, 2, 0, Math.PI * 2);
                    cContext.fill();
                  } else {
                    cContext.fillStyle = '#b45309';
                    cContext.fillRect(sc.x - sc.width / 2, sc.y - sc.height, sc.width, sc.height);
                  }
                }
              }

              // Health bar if damaged
              if (sc.hp < sc.maxHp && sc.hp > 0) {
                const hpPct = Math.max(0, sc.hp / sc.maxHp);
                cContext.fillStyle = '#0f172a';
                cContext.fillRect(sc.x - 18, sc.y - sc.height - 8, 36, 4);
                cContext.fillStyle = '#22c55e';
                cContext.fillRect(sc.x - 18, sc.y - sc.height - 8, 36 * hpPct, 4);
              }
              cContext.restore();
            }
          });
        });
      }

      // 2. Ground Loot Pickups (Bananas, Shield Cells, Ammo Boxes)
      if (worldDataRef.current) {
        worldDataRef.current.groundLoot.forEach(loot => {
          if (loot.isCollected) return;

          if (
            loot.x < camX - 20 ||
            loot.x > camX + viewW + 20 ||
            loot.y < camY - 20 ||
            loot.y > camY + viewH + 20
          ) {
            return;
          }

          ySortQueue.push({
            sortY: loot.y,
            render: (cContext, cNow) => {
              cContext.save();
              const bob = Math.sin(cNow / 240) * 4;

              // Glowing ground halo
              cContext.fillStyle = loot.type === 'banana' ? 'rgba(250, 204, 21, 0.25)' : 'rgba(34, 211, 238, 0.25)';
              cContext.beginPath();
              cContext.ellipse(loot.x, loot.y + 6, 14, 6, 0, 0, Math.PI * 2);
              cContext.fill();

              const img = imageAssets.current[loot.spriteKey];
              if (img && img.complete && img.naturalWidth > 0) {
                cContext.drawImage(img, loot.x - 16, loot.y - 16 + bob, 32, 32);
              } else {
                cContext.font = '20px sans-serif';
                cContext.textAlign = 'center';
                cContext.textBaseline = 'middle';
                cContext.fillText(loot.type === 'banana' ? '🍌' : '⚡', loot.x, loot.y + bob);
              }

              cContext.restore();
            }
          });
        });
      }

      // 3. Placed Structures (Wood Walls, Brick Ramps, Metal Bunkers)
      structures.forEach(st => {
        if (
          st.x + 50 < camX ||
          st.x - 50 > camX + viewW ||
          st.y + 50 < camY ||
          st.y - 50 > camY + viewH
        ) {
          return;
        }

        ySortQueue.push({
          sortY: st.y + 10,
          render: (cContext) => {
            cContext.save();
            cContext.translate(st.x, st.y);

            // Structure rotation (0, 90, 180, 270 degrees)
            const rot = ((st.rotation || 0) * Math.PI) / 180;
            cContext.rotate(rot);

            // Structure shadow
            cContext.fillStyle = 'rgba(0, 0, 0, 0.4)';
            cContext.beginPath();
            cContext.ellipse(0, 14, 28, 10, 0, 0, 2 * Math.PI);
            cContext.fill();

            if (st.type === 'wood_wall') {
              const bw = 46;
              const bh = 24;
              const depth = 12;

              // Front face
              cContext.fillStyle = '#78350f';
              cContext.fillRect(-bw / 2, -bh / 2, bw, bh);
              cContext.strokeStyle = '#92400e';
              cContext.lineWidth = 1.8;
              cContext.strokeRect(-bw / 2, -bh / 2, bw, bh);

              // Wood grain slats
              cContext.fillStyle = '#92400e';
              cContext.fillRect(-bw / 2 + 4, -bh / 2 + 6, bw - 8, 2);
              cContext.fillRect(-bw / 2 + 4, -bh / 2 + 14, bw - 8, 2);

              // Top face
              cContext.fillStyle = '#b45309';
              cContext.beginPath();
              cContext.moveTo(-bw / 2, -bh / 2);
              cContext.lineTo(-bw / 2 + depth, -bh / 2 - depth);
              cContext.lineTo(bw / 2 + depth, -bh / 2 - depth);
              cContext.lineTo(bw / 2, -bh / 2);
              cContext.closePath();
              cContext.fill();
              cContext.stroke();

              // Right face
              cContext.fillStyle = '#451a03';
              cContext.beginPath();
              cContext.moveTo(bw / 2, -bh / 2);
              cContext.lineTo(bw / 2 + depth, -bh / 2 - depth);
              cContext.lineTo(bw / 2 + depth, bh / 2 - depth);
              cContext.lineTo(bw / 2, bh / 2);
              cContext.closePath();
              cContext.fill();
              cContext.stroke();
            } else if (st.type === 'brick_ramp') {
              // Brick base ramp
              cContext.fillStyle = '#9a3412';
              cContext.beginPath();
              cContext.moveTo(-24, 20);
              cContext.lineTo(24, 20);
              cContext.lineTo(18, -24);
              cContext.lineTo(-18, -24);
              cContext.closePath();
              cContext.fill();
              cContext.strokeStyle = '#ea580c';
              cContext.lineWidth = 2.5;
              cContext.stroke();

              // Stepped ridges
              cContext.strokeStyle = '#c2410c';
              cContext.lineWidth = 2;
              cContext.beginPath();
              cContext.moveTo(-21, 10); cContext.lineTo(21, 10);
              cContext.moveTo(-18, -2); cContext.lineTo(18, -2);
              cContext.moveTo(-15, -14); cContext.lineTo(15, -14);
              cContext.stroke();

              // Back blocked edge (Red one-way barrier indicator)
              cContext.strokeStyle = '#ef4444';
              cContext.lineWidth = 3;
              cContext.beginPath();
              cContext.moveTo(-24, 20);
              cContext.lineTo(24, 20);
              cContext.stroke();

              // Glowing animated one-way ascent chevrons (Green/Gold)
              const pulse = (Math.sin(Date.now() / 200) + 1) * 0.5;
              cContext.strokeStyle = `rgba(74, 222, 128, ${0.7 + pulse * 0.3})`;
              cContext.lineWidth = 2.5;
              cContext.beginPath();
              cContext.moveTo(-9, 6); cContext.lineTo(0, -4); cContext.lineTo(9, 6);
              cContext.moveTo(-7, -4); cContext.lineTo(0, -14); cContext.lineTo(7, -4);
              cContext.stroke();

              // "ONE WAY" badge
              cContext.fillStyle = '#4ade80';
              cContext.font = 'bold 7px sans-serif';
              cContext.textAlign = 'center';
              cContext.fillText('▲ ONE WAY', 0, 16);
            } else if (st.type === 'metal_bunker') {
              cContext.fillStyle = '#0e7490';
              cContext.beginPath();
              cContext.arc(0, 0, 26, 0, 2 * Math.PI);
              cContext.fill();
              cContext.strokeStyle = '#22d3ee';
              cContext.lineWidth = 3;
              cContext.stroke();

              cContext.strokeStyle = 'rgba(34, 211, 238, 0.45)';
              cContext.lineWidth = 4;
              cContext.beginPath();
              cContext.arc(0, 0, 32, 0, 2 * Math.PI);
              cContext.stroke();

              // Bunker cross slit
              cContext.strokeStyle = '#083344';
              cContext.lineWidth = 3;
              cContext.beginPath();
              cContext.moveTo(-14, 0); cContext.lineTo(14, 0);
              cContext.moveTo(0, -14); cContext.lineTo(0, 14);
              cContext.stroke();
            }

            // Restore rotation before rendering upright HP Bar
            cContext.rotate(-rot);
            const hpPct = Math.max(0, st.hp / st.maxHp);
            cContext.fillStyle = '#0f172a';
            cContext.fillRect(-20, -32, 40, 5);
            cContext.fillStyle = hpPct > 0.5 ? '#10b981' : '#f59e0b';
            cContext.fillRect(-20, -32, 40 * hpPct, 5);
            cContext.strokeStyle = '#334155';
            cContext.lineWidth = 1;
            cContext.strokeRect(-20, -32, 40, 5);

            cContext.restore();
          }
        });
      });

      // 4. Supply Crates
      crates.forEach(cr => {
        if (cr.isClaimed) return;
        if (
          cr.x + 60 < camX ||
          cr.x - 60 > camX + viewW ||
          cr.y + 60 < camY ||
          cr.y - 60 > camY + viewH
        ) {
          return;
        }

        ySortQueue.push({
          sortY: cr.y + 12,
          render: (cContext, cNow) => {
            cContext.save();
            cContext.translate(cr.x, cr.y);

            const pulse = (Math.sin(cNow / 200) + 1) / 2;
            cContext.strokeStyle = cr.rewardType === 'shield' ? 'rgba(56, 189, 248, 0.65)' : 'rgba(250, 204, 21, 0.65)';
            cContext.lineWidth = 2 + pulse * 2;
            cContext.beginPath();
            cContext.arc(0, 10, 24 + pulse * 6, 0, 2 * Math.PI);
            cContext.stroke();

            // Parachute
            cContext.fillStyle = cr.rewardType === 'shield' ? '#0284c7' : '#eab308';
            cContext.beginPath();
            cContext.arc(0, -36, 26, Math.PI, 2 * Math.PI);
            cContext.fill();
            cContext.strokeStyle = '#ffffff';
            cContext.lineWidth = 2;
            cContext.stroke();

            cContext.font = '28px sans-serif';
            cContext.textAlign = 'center';
            cContext.textBaseline = 'middle';
            cContext.fillText('📦', 0, 0);

            cContext.font = 'bold 9px sans-serif';
            cContext.fillStyle = '#ffffff';
            cContext.fillText(cr.rewardType === 'shield' ? 'SHIELD CRATE' : 'MATS CRATE', 0, 24);

            cContext.restore();
          }
        });
      });

      // =======================================================================
      // (C) COMPOSITE "PAPER-DOLL" CHARACTER RENDER FUNCTION
      // =======================================================================
      const renderPaperDoll = (
        cContext: CanvasRenderingContext2D,
        pX: number,
        pY: number,
        angle: number,
        skinId: string,
        weaponId: string,
        isLocal: boolean,
        pName: string,
        hp: number,
        shield: number,
        isHighGround: boolean,
        isMetalShield: boolean,
        stride: number,
        cNow: number,
        isAcousticShield?: boolean
      ) => {
        cContext.save();
        cContext.translate(pX, pY);

        // 1. LAYER 1: DROP SHADOW
        cContext.fillStyle = 'rgba(0, 0, 0, 0.45)';
        cContext.beginPath();
        cContext.ellipse(0, 14, 20, 10, 0, 0, 2 * Math.PI);
        cContext.fill();

        // Buff auras
        if (isHighGround) {
          cContext.strokeStyle = '#fb923c';
          cContext.lineWidth = 4;
          cContext.beginPath();
          cContext.arc(0, 0, 30, 0, 2 * Math.PI);
          cContext.stroke();
        }
        if (isMetalShield) {
          cContext.strokeStyle = '#22d3ee';
          cContext.lineWidth = 4;
          cContext.beginPath();
          cContext.arc(0, 0, 32, 0, 2 * Math.PI);
          cContext.stroke();
        }
        if (isAcousticShield) {
          cContext.strokeStyle = 'rgba(234, 179, 8, 0.9)';
          cContext.lineWidth = 3;
          cContext.beginPath();
          cContext.arc(0, 0, 34 + Math.sin(cNow / 100) * 3, 0, 2 * Math.PI);
          cContext.stroke();
        }

        // Check if fantasy character sprite sheet is available
        const resolvedSkinId = FANTASY_SKIN_ALIASES[skinId] || skinId;
        const skinDef = getFantasySkin(resolvedSkinId);
        const sheets = skinDef.actionSheets || CHARACTER_ACTION_SHEETS[resolvedSkinId] || CHARACTER_ACTION_SHEETS.hero;

        // Determine active action state:
        // 1. Death: if dead / hp <= 0
        // 2. Hurt: if recent damage (< 320ms)
        // 3. Attack: if recently fired (< 280ms)
        // 4. Run / Walk: if moving (run if sprinting, walk otherwise)
        // 5. Idle: standing still
        const isDead = isLocal ? !isAlive : (hp <= 0);
        const isHurt = isLocal ? (cNow - lastDamageTimeRef.current < 320) : false;
        const isAttacking = isLocal ? (cNow - lastShotTime < 280) : false;
        const isMoving = Math.abs(Math.sin(stride)) > 0.04;
        const isSprinting = isMoving && isLocal && (!!keysPressed.current['shift'] || Math.abs(Math.sin(stride)) > 0.45);

        let activeAction: 'idle' | 'walk' | 'run' | 'attack' | 'hurt' | 'death' = 'idle';
        if (isDead) {
          activeAction = 'death';
        } else if (isHurt) {
          activeAction = 'hurt';
        } else if (isAttacking) {
          activeAction = 'attack';
        } else if (isSprinting) {
          activeAction = 'run';
        } else if (isMoving) {
          activeAction = 'walk';
        } else {
          activeAction = 'idle';
        }

        const activeSheetSrc = sheets[activeAction] || sheets.idle;
        const sheetImg = getActionSheetImage(activeSheetSrc) || 
                         getActionSheetImage(sheets.idle) || 
                         imageAssets.current[`char_${resolvedSkinId}`] || 
                         imageAssets.current[`char_${skinId}`] || 
                         imageAssets.current['char_knight_hero'] ||
                         imageAssets.current['char_cultist'];
        const hasSheet = sheetImg && sheetImg.complete && sheetImg.naturalWidth > 0;

        if (hasSheet) {
          // --- FULL 4-DIRECTION TOP-DOWN WALKING & IDLE PIXEL SPRITE ANIMATION ---
          cContext.save();

          // Movement bobbing
          const walkBob = (isMoving && !isDead) ? Math.abs(Math.sin(stride)) * -2 : 0;
          cContext.translate(0, walkBob);

          // Facing direction from aim angle (0: East, PI/2: South, -PI/2: North, PI / -PI: West)
          const sinA = Math.sin(angle);
          const cosA = Math.cos(angle);

          // Grid Layout in 1024x1024 modular sheets (4 directions):
          // Row 0 = Facing Down / South (towards viewer)
          // Row 1 = Facing Up / North (away from viewer)
          // Row 2 = Facing Left / West
          // Row 3 = Facing Right / East
          let dirRow = 0;
          if (sinA > 0.45) {
            dirRow = 0; // Down
          } else if (sinA < -0.45) {
            dirRow = 1; // Up
          } else if (cosA < 0) {
            dirRow = 2; // Left
          } else {
            dirRow = 3; // Right
          }

          // Frame column calculation
          let frameCol = 0;
          if (activeAction === 'death') {
            const deathElapsed = isLocal ? (cNow - (localDeathTimeRef.current || cNow)) : 500;
            frameCol = Math.min(3, Math.floor(Math.max(0, deathElapsed) / 130));
          } else if (activeAction === 'hurt') {
            const hurtElapsed = isLocal ? (cNow - lastDamageTimeRef.current) : 0;
            frameCol = Math.min(3, Math.floor(Math.max(0, hurtElapsed) / 80));
          } else if (activeAction === 'attack') {
            const shotElapsed = isLocal ? (cNow - lastShotTime) : 0;
            frameCol = Math.min(3, Math.floor(Math.max(0, shotElapsed) / 70));
          } else if (activeAction === 'run') {
            frameCol = Math.floor(cNow / 110) % 4;
          } else if (activeAction === 'walk') {
            frameCol = Math.floor(cNow / 140) % 4;
          } else {
            // Idle subtle breathing animation
            frameCol = Math.floor(cNow / 260) % 4;
          }

          // Support both 1024x1024 modular sheets (256x256 frames) and legacy sheets
          const isModular1024 = sheetImg.naturalWidth >= 512;
          const frameSize = isModular1024 ? 256 : 32;

          const sx = frameCol * frameSize;
          const sy = dirRow * frameSize;
          const sw = frameSize;
          const sh = frameSize;

          // Scale source frames cleanly to 48x48 pixel size on the 5000px map canvas
          const sprW = 48;
          const sprH = 48;
          cContext.imageSmoothingEnabled = false;
          cContext.drawImage(
            sheetImg,
            sx,
            sy,
            sw,
            sh,
            -sprW / 2,
            -sprH + 16,
            sprW,
            sprH
          );

          cContext.restore();

          // Held Weapon anchored & rotated towards crosshair (only if alive!)
          if (!isDead) {
            cContext.save();
            cContext.rotate(angle);
            const weaponItem = SHOP_ITEMS.find(i => i.id === weaponId) || equippedWeapon;
            const beamCol = weaponItem?.stats?.beamColor || '#f97316';

            // Hands reaching out
            cContext.fillStyle = '#fed7aa';
            cContext.beginPath();
            cContext.roundRect(6, -8, 10, 4, 2);
            cContext.roundRect(6, 4, 10, 4, 2);
            cContext.fill();

            // Weapon body
            cContext.fillStyle = '#0f172a';
            cContext.fillRect(10, -3, 14, 6);
            cContext.fillStyle = beamCol;
            cContext.fillRect(16, -2, 8, 4);
            cContext.strokeStyle = '#020617';
            cContext.lineWidth = 1;
            cContext.strokeRect(10, -3, 14, 6);

            // Glowing energy muzzle
            cContext.fillStyle = beamCol;
            cContext.beginPath();
            cContext.arc(24, 0, 2.5, 0, 2 * Math.PI);
            cContext.fill();
            cContext.restore();
          }
        } else {
          // Fallback to geometric composite paper-doll if sprite still preloading
          cContext.rotate(angle);
          const fantasySkin = getFantasySkin(resolvedSkinId);
          const theme = {
            torsoColor: fantasySkin?.theme?.auraColor || '#6366f1',
            collarColor: '#38bdf8',
            pantsColor: '#1e293b',
            hairColor: '#fde047',
            helmetType: 'none',
            auraColor: fantasySkin?.theme?.auraColor || '#a855f7'
          };

          // Distinctive skin aura glow
          cContext.strokeStyle = theme.auraColor;
          cContext.lineWidth = 1.5;
          cContext.beginPath();
          cContext.arc(0, 0, 20, 0, 2 * Math.PI);
          cContext.stroke();

          // 2. LAYER 2: ANIMATED WALKING LEGS
          const legSwing = Math.sin(stride) * 6;
          cContext.fillStyle = theme.pantsColor; // Themed Trousers
          // Left leg
          cContext.fillRect(-9, -10 + legSwing, 6, 12);
          // Right leg
          cContext.fillRect(-9, 2 - legSwing, 6, 12);

          // Boots
          cContext.fillStyle = '#0f172a';
          cContext.fillRect(-11, -11 + legSwing, 4, 5);
          cContext.fillRect(-11, 4 - legSwing, 4, 5);

          // 3. LAYER 3: COMPOSITE TORSO & SKIN OUTFIT
          cContext.fillStyle = theme.torsoColor;
          cContext.beginPath();
          cContext.roundRect(-8, -12, 16, 24, 4);
          cContext.fill();
          cContext.strokeStyle = isLocal ? '#10b981' : theme.collarColor;
          cContext.lineWidth = 2;
          cContext.stroke();

          // Collar badge / accent
          cContext.fillStyle = theme.collarColor;
          cContext.fillRect(-4, -4, 8, 8);

          // 4. LAYER 4: HEAD, HAIR & HATS / ACCESSORIES
          cContext.fillStyle = '#fed7aa';
          cContext.beginPath();
          cContext.arc(2, 0, 9, 0, 2 * Math.PI);
          cContext.fill();
          cContext.strokeStyle = '#78350f';
          cContext.lineWidth = 1;
          cContext.stroke();

          // Themed Hair / Helmet
          cContext.fillStyle = theme.hairColor;
          cContext.beginPath();
          cContext.arc(2, 0, 7.5, Math.PI * 0.7, Math.PI * 2.3);
          cContext.fill();

          // 5. LAYER 5: ARMS & ANCHORED HELD WEAPON SPRITE
          const weaponItem = SHOP_ITEMS.find(i => i.id === weaponId) || equippedWeapon;
          const beamCol = weaponItem?.stats?.beamColor || '#f97316';

          cContext.fillStyle = '#fed7aa';
          cContext.beginPath();
          cContext.roundRect(4, -11, 14, 5, 2);
          cContext.roundRect(4, 6, 14, 5, 2);
          cContext.fill();

          cContext.fillStyle = beamCol;
          cContext.fillRect(14, -3, 18, 6);
          cContext.strokeStyle = '#020617';
          cContext.lineWidth = 1;
          cContext.strokeRect(14, -3, 18, 6);
        }

        cContext.restore();

        // 6. LAYER 6: OVERHEAD ANCHORED STATUS HUD (NAME, HP, SHIELD)
        cContext.save();
        cContext.translate(pX, pY - 34);

        cContext.font = isLocal ? 'bold 11px sans-serif' : '10px sans-serif';
        cContext.fillStyle = isLocal ? '#34d399' : '#ffffff';
        cContext.textAlign = 'center';
        cContext.shadowColor = '#000000';
        cContext.shadowBlur = 4;
        cContext.fillText(isLocal ? `YOU (${pName})` : pName, 0, 0);

        const barW = 40;
        const barH = 4;
        cContext.fillStyle = '#090d16';
        cContext.fillRect(-barW / 2, 4, barW, barH);

        const hpPct = Math.max(0, hp / 100);
        cContext.fillStyle = '#ef4444';
        cContext.fillRect(-barW / 2, 4, barW * hpPct, barH);

        if (shield > 0) {
          const shPct = Math.max(0, shield / 100);
          cContext.fillStyle = '#06b6d4';
          cContext.fillRect(-barW / 2, 9, barW * shPct, barH - 1);
        }

        cContext.restore();
      };

      // 5. Add Other Players to Y-Sort Queue
      arenaPlayers.forEach(p => {
        if (p.uid !== user.id && p.isAlive) {
          if (
            p.x < camX - 50 ||
            p.x > camX + viewW + 50 ||
            p.y < camY - 50 ||
            p.y > camY + viewH + 50
          ) {
            return;
          }

          ySortQueue.push({
            sortY: p.y + 12,
            render: (cContext, cNow) => {
              renderPaperDoll(
                cContext,
                p.x,
                p.y,
                p.angle || 0,
                p.avatar || 'cyber_scientist',
                p.equippedWeapon || 'bunsen_burner',
                false,
                p.name,
                p.hp,
                p.shield,
                Boolean(p.highGroundActive),
                Boolean(p.metalShieldActiveUntil && p.metalShieldActiveUntil > cNow),
                cNow / 150,
                cNow
              );
            }
          });
        }
      });

      // 6. Add Local Player to Y-Sort Queue
      if (isAlive) {
        ySortQueue.push({
          sortY: localY + 12,
          render: (cContext, cNow) => {
            renderPaperDoll(
              cContext,
              localX,
              localY,
              facingAngle,
              effectiveSkinId,
              equippedWeapon.id,
              true,
              user.name,
              localHp,
              localShield,
              cNow < highGroundUntil,
              cNow < metalShieldUntil,
              walkCycle,
              cNow,
              cNow < acousticShieldUntil
            );
          }
        });
      }

      // 7. EXECUTE Y-SORTING ORDER (DEPTH SORTING RENDER!)
      ySortQueue.sort((a, b) => a.sortY - b.sortY);
      ySortQueue.forEach(item => item.render(ctx, now));

      // (D) LAYER 3: FLYING PROJECTILES & COMBAT PARTICLES
      projectilesRef.current.forEach(p => {
        if (
          p.x < camX - 10 ||
          p.x > camX + viewW + 10 ||
          p.y < camY - 10 ||
          p.y > camY + viewH + 10
        ) {
          return;
        }

        ctx.save();
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 14;

        if (p.weaponId === 'laser_pointer') {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 4.5, 0, 2 * Math.PI);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        } else if (p.weaponId === 'particle_accelerator') {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 7.5, 0, 2 * Math.PI);
          ctx.fill();
          ctx.strokeStyle = '#c084fc';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 12, 0, 2 * Math.PI);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.isHighGround ? 6 : 5, 0, 2 * Math.PI);
          ctx.fill();
        }

        ctx.restore();
      });

      // Combat Particles
      particlesRef.current.forEach(pt => {
        if (
          pt.x < camX ||
          pt.x > camX + viewW ||
          pt.y < camY ||
          pt.y > camY + viewH
        ) {
          return;
        }

        ctx.save();
        ctx.globalAlpha = pt.alpha;
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();
      });

      // (E) LAYER 4: EYE OF THE STORM & TRANSPARENT VIOLET WORLD SHROUD
      ctx.save();

      const safeEyeRadius = Math.max(0, stormRadius);
      const isSurging = storm.isSurging;

      // 1. Transparent Violet Filter Outside the Eye of the Storm (where storm damage occurs)
      ctx.beginPath();
      // Outer rect covering the full world space (with safety margin beyond canvas bounds)
      ctx.rect(-1000, -1000, MAP_SIZE + 2000, MAP_SIZE + 2000);
      // Cut out the safe Eye of the Storm
      ctx.arc(stormCenter.current.x, stormCenter.current.y, safeEyeRadius, 0, Math.PI * 2, true);
      // Rich transparent violet tint: 32% opacity normal, 46% during rapid surge
      const violetAlpha = isSurging ? 0.46 : 0.32;
      ctx.fillStyle = `rgba(139, 92, 246, ${violetAlpha})`;
      ctx.fill('evenodd');

      // 2. High-energy electric outer perimeter ring with dynamic neon glow
      const pulse = (Math.sin(now / 180) + 1) / 2;
      ctx.beginPath();
      ctx.arc(stormCenter.current.x, stormCenter.current.y, safeEyeRadius, 0, 2 * Math.PI);
      ctx.strokeStyle = isSurging ? '#f43f5e' : '#c026d3';
      ctx.lineWidth = 7 + pulse * 3.5;
      ctx.shadowColor = isSurging ? '#fda4af' : '#e879f9';
      ctx.shadowBlur = 28;
      ctx.stroke();

      // 3. Crisp neon inner perimeter accent edge
      ctx.beginPath();
      ctx.arc(stormCenter.current.x, stormCenter.current.y, safeEyeRadius, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(250, 232, 255, 0.75)';
      ctx.lineWidth = 2;
      ctx.shadowBlur = 0;
      ctx.stroke();

      // 4. Subtle electric energy spark particles orbiting along the storm boundary
      const sparkCount = 6;
      for (let s = 0; s < sparkCount; s++) {
        const sparkAngle = (now / 1500 + (s * Math.PI * 2) / sparkCount) % (Math.PI * 2);
        const sx = stormCenter.current.x + Math.cos(sparkAngle) * safeEyeRadius;
        const sy = stormCenter.current.y + Math.sin(sparkAngle) * safeEyeRadius;
        if (sx >= camX - 30 && sx <= camX + viewW + 30 && sy >= camY - 30 && sy <= camY + viewH + 30) {
          ctx.beginPath();
          ctx.arc(sx, sy, 3 + Math.sin(now / 120 + s) * 1.5, 0, Math.PI * 2);
          ctx.fillStyle = '#f0abfc';
          ctx.shadowColor = '#ffffff';
          ctx.shadowBlur = 12;
          ctx.fill();
        }
      }

      ctx.restore();

      // (F) LAYER 5: FLOATING COMBAT TEXTS
      floatingTextsRef.current.forEach(ft => {
        ctx.save();
        ctx.font = 'bold 12px sans-serif';
        ctx.fillStyle = ft.color;
        ctx.textAlign = 'center';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 6;
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      });

      // (G) LAYER 6: GHOST BLUEPRINT PLACEMENT PREVIEW & ROTATION
      if (selectedBuildType && isAlive) {
        // Calculate preview world coordinates based on mouse position
        const canvasRect = canvas.getBoundingClientRect();
        const mouseX = mouseScreenPos.current.x - canvasRect.left;
        const mouseY = mouseScreenPos.current.y - canvasRect.top;
        const worldMouseX = cameraRef.current.x + mouseX;
        const worldMouseY = cameraRef.current.y + mouseY;

        const dX = worldMouseX - localX;
        const dY = worldMouseY - localY;
        const rawDist = Math.hypot(dX, dY);
        const aimAngle = rawDist > 5 ? Math.atan2(dY, dX) : facingAngle;

        // Clamp distance to [70, 175] so it's always safely outside collision
        const placeDist = Math.max(70, Math.min(175, rawDist));
        const prevX = Math.round(localX + Math.cos(aimAngle) * placeDist);
        const prevY = Math.round(localY + Math.sin(aimAngle) * placeDist);

        // Check material affordability
        let hasEnoughMats = false;
        let matCostText = '';
        if (selectedBuildType === 'wood_wall') {
          hasEnoughMats = localWood >= 10;
          matCostText = '🪵 10 Wood';
        } else if (selectedBuildType === 'brick_ramp') {
          hasEnoughMats = localBrick >= 15;
          matCostText = '🧱 15 Brick';
        } else if (selectedBuildType === 'metal_bunker') {
          hasEnoughMats = localMetal >= 15;
          matCostText = '⚙️ 15 Metal';
        }

        previewPosRef.current = { x: prevX, y: prevY, isValid: hasEnoughMats };

        const ghostColor = hasEnoughMats ? '#06b6d4' : '#ef4444';
        const ghostFill = hasEnoughMats ? 'rgba(6, 182, 212, 0.22)' : 'rgba(239, 68, 68, 0.22)';
        const pulse = (Math.sin(now / 150) + 1) / 2;

        ctx.save();

        // 1. Dashed build tether line from player to preview
        ctx.strokeStyle = hasEnoughMats ? 'rgba(6, 182, 212, 0.55)' : 'rgba(239, 68, 68, 0.55)';
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.moveTo(localX, localY);
        ctx.lineTo(prevX, prevY);
        ctx.stroke();
        ctx.setLineDash([]);

        // 2. Blueprint boundary ring at target
        ctx.strokeStyle = ghostColor;
        ctx.lineWidth = 2 + pulse * 1.5;
        ctx.beginPath();
        ctx.arc(prevX, prevY, 34 + pulse * 4, 0, 2 * Math.PI);
        ctx.stroke();

        // 3. Draw Rotated Ghost Hologram
        ctx.translate(prevX, prevY);
        ctx.rotate((buildRotation * Math.PI) / 180);

        if (selectedBuildType === 'wood_wall') {
          const bw = 46;
          const bh = 24;
          ctx.fillStyle = ghostFill;
          ctx.strokeStyle = ghostColor;
          ctx.lineWidth = 2;
          ctx.fillRect(-bw / 2, -bh / 2, bw, bh);
          ctx.strokeRect(-bw / 2, -bh / 2, bw, bh);
        } else if (selectedBuildType === 'brick_ramp') {
          ctx.fillStyle = ghostFill;
          ctx.strokeStyle = ghostColor;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(-24, 18);
          ctx.lineTo(24, 18);
          ctx.lineTo(16, -22);
          ctx.lineTo(-16, -22);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          // Arrow up
          ctx.beginPath();
          ctx.moveTo(-6, 2);
          ctx.lineTo(0, -12);
          ctx.lineTo(6, 2);
          ctx.stroke();
        } else if (selectedBuildType === 'metal_bunker') {
          ctx.fillStyle = ghostFill;
          ctx.strokeStyle = ghostColor;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(0, 0, 26, 0, 2 * Math.PI);
          ctx.fill();
          ctx.stroke();
          // Turret slit
          ctx.beginPath();
          ctx.moveTo(-14, 0); ctx.lineTo(14, 0);
          ctx.moveTo(0, -14); ctx.lineTo(0, 14);
          ctx.stroke();
        }

        // Reset rotation for text badge
        ctx.rotate(-(buildRotation * Math.PI) / 180);

        // 4. Compact Floating Badge over Ghost Preview
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.strokeStyle = ghostColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(-60, -48, 120, 22, 6);
        ctx.fill();
        ctx.stroke();

        ctx.font = 'bold 10px monospace';
        ctx.fillStyle = hasEnoughMats ? '#22d3ee' : '#f87171';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${matCostText} [${buildRotation}°]`, 0, -37);

        ctx.restore();
      }

      ctx.restore(); // Restore Viewport Camera

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [
    localX, 
    localY, 
    facingAngle, 
    walkCycle,
    isAlive, 
    stormRadius, 
    crates, 
    structures, 
    arenaPlayers, 
    highGroundUntil, 
    metalShieldUntil, 
    doubleDamageUntil, 
    activeCrateModal, 
    equippedWeapon, 
    equippedSkin,
    selectedBuildType,
    buildRotation,
    localWood,
    localBrick,
    localMetal,
    user.id, 
    user.name,
    viewDims
  ]);

  // 7. Auto Victory Royale Detection
  useEffect(() => {
    const alivePlayers = arenaPlayers.filter(p => p.isAlive);
    if (alivePlayers.length === 1 && arenaPlayers.length > 1 && battleState?.status === 'IN_PROGRESS') {
      const victor = alivePlayers[0];
      declareBattleWinner({
        uid: victor.uid,
        name: victor.name,
        avatar: victor.avatar
      });
    }
  }, [arenaPlayers, battleState?.status]);

  // Crate 3-second rapid question timer
  useEffect(() => {
    if (!activeCrateModal) return;
    const interval = setInterval(() => {
      setCrateQuestionTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setActiveCrateModal(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeCrateModal]);

  // Answer science supply drop question
  const handleAnswerCrateQuestion = async (idx: number) => {
    if (!activeCrateModal) return;
    const isCorrect = idx === activeCrateModal.question.answerIndex;

    if (isCorrect) {
      setCrateFeedback('✅ Correct! Supply rewards claimed!');
      soundEngine.playVictory();
      await claimSupplyCrate(activeCrateModal.id, user.id, activeCrateModal.rewardType);
      if (activeCrateModal.rewardType === 'shield') {
        setLocalShield(prev => Math.min(100, prev + 50));
      } else {
        setLocalWood(prev => prev + 20);
        setLocalBrick(prev => prev + 15);
        setLocalMetal(prev => prev + 10);
      }
      setTimeout(() => {
        setActiveCrateModal(null);
        setCrateFeedback(null);
      }, 900);
    } else {
      setCrateFeedback(`❌ Incorrect! ${activeCrateModal.question.explanation}`);
      soundEngine.playHit();
      setTimeout(() => {
        setActiveCrateModal(null);
        setCrateFeedback(null);
      }, 2000);
    }
  };

  const aliveCount = arenaPlayers.filter(p => p.isAlive).length;
  const isMatchCurrentlyActive = !battleState || battleState.status === 'IN_PROGRESS';
  const distToStormSafe = isMatchCurrentlyActive 
    ? Math.max(0, Math.round(Math.hypot(localX - stormCenter.current.x, localY - stormCenter.current.y) - stormRadius))
    : 0;
  const matchMinutes = Math.floor(matchElapsedSeconds / 60);
  const matchSecs = Math.floor(matchElapsedSeconds % 60);
  const timeFormatted = `${String(matchMinutes).padStart(2, '0')}:${String(matchSecs).padStart(2, '0')}`;

  return (
    <div 
      ref={containerRef}
      className={`relative w-full ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-950 p-2 sm:p-3 flex flex-col justify-between overflow-hidden' : 'max-w-6xl mx-auto space-y-2.5 pb-6'} select-none font-sans`}
    >
      
      {/* =========================================================================
          TOP STATUS BAR & STATS
          ========================================================================= */}
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-2.5 sm:p-3 shadow-xl backdrop-blur-md flex flex-wrap items-center justify-between gap-2.5">
        
        {/* Left: Health, Shield & Character Info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-950/70 px-2.5 py-1.5 rounded-xl border border-slate-800">
            <span className="text-xl">{equippedSkin.icon}</span>
            <div className="hidden sm:block">
              <span className="text-xs font-black text-white block leading-tight">{user.name}</span>
              <span className="text-[10px] font-bold block">
                {user.role === 'instructor' ? (
                  <span className="text-amber-300 flex items-center gap-1 font-black">
                    <span>Instructor</span>
                    <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-400/40">∞ GOLD</span>
                  </span>
                ) : (
                  <span className="text-emerald-400">{equippedSkin.name}</span>
                )}
              </span>
            </div>
          </div>

          {/* Health Bar */}
          <div className="space-y-0.5">
            <div className="flex items-center justify-between text-[11px] font-black">
              <span className="text-rose-400 flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500 animate-pulse" />
                <span>HP {localHp}/100</span>
              </span>
            </div>
            <div className="w-24 sm:w-32 h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div 
                className="h-full bg-gradient-to-r from-rose-600 via-rose-500 to-red-400 transition-all duration-150"
                style={{ width: `${Math.max(0, localHp)}%` }}
              />
            </div>
          </div>

          {/* Shield Bar */}
          <div className="space-y-0.5">
            <div className="flex items-center justify-between text-[11px] font-black">
              <span className="text-cyan-400 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 fill-cyan-500 text-cyan-500" />
                <span>SHIELD {localShield}/100</span>
              </span>
            </div>
            <div className="w-24 sm:w-32 h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div 
                className="h-full bg-gradient-to-r from-cyan-600 via-cyan-500 to-blue-400 transition-all duration-150"
                style={{ width: `${Math.max(0, localShield)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Center: Match Timer, Alive Counter, Kills & Storm Alert */}
        <div className="flex items-center gap-2.5 bg-slate-950/80 px-3.5 py-1.5 rounded-xl border border-slate-800 font-mono text-xs">
          <div className="text-center">
            <span className="text-[9px] text-slate-400 uppercase font-black block">Time</span>
            <span className="text-sm sm:text-base font-black text-cyan-400">{timeFormatted}</span>
          </div>
          <div className="h-5 w-px bg-slate-800" />
          <div className="text-center">
            <span className="text-[9px] text-slate-400 uppercase font-black block">Alive</span>
            <span className="text-sm sm:text-base font-black text-emerald-400">{aliveCount}</span>
          </div>
          <div className="h-5 w-px bg-slate-800" />
          <div className="text-center">
            <span className="text-[9px] text-slate-400 uppercase font-black block">Kills</span>
            <span className="text-sm sm:text-base font-black text-rose-400">{kills}</span>
          </div>
          <div className="h-5 w-px bg-slate-800" />
          <div className="text-center">
            <span className="text-[9px] text-slate-400 uppercase font-black block">Storm</span>
            <span className={`text-xs font-black ${distToStormSafe > 0 ? 'text-rose-500 animate-pulse' : 'text-purple-400'}`}>
              {distToStormSafe > 0 ? `-${distToStormSafe}m` : 'SAFE'}
            </span>
          </div>
        </div>

        {/* Right: Sound, Music, Fullscreen, Minimap Toggle & Leave */}
        <div className="flex items-center gap-2">
          {/* SFX Toggle */}
          <button
            onClick={() => setSoundMuted(prev => !prev)}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
            title={soundMuted ? 'Unmute SFX' : 'Mute SFX'}
          >
            {soundMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Background Music Toggle */}
          <button
            onClick={() => setMusicMuted(prev => !prev)}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
            title={musicMuted ? 'Unmute 16-Bit Music' : 'Mute 16-Bit Music'}
          >
            <Music className={`w-4 h-4 ${musicMuted ? 'text-slate-500' : 'text-fuchsia-400'}`} />
          </button>

          {/* 16-Bit Track Cycler Pill */}
          <button
            onClick={() => {
              if (musicMuted) setMusicMuted(false);
              const name = soundEngine.cycleTrack();
              setMusicTrackName(name);
            }}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-fuchsia-950/60 hover:bg-fuchsia-900/70 text-fuchsia-200 border border-fuchsia-500/40 text-[11px] font-black transition cursor-pointer shadow-[0_0_12px_rgba(217,70,239,0.2)]"
            title="Click to cycle 16-Bit Chiptune battle tracks"
          >
            <span className="animate-pulse">🎮</span>
            <span>16-BIT: {musicTrackName}</span>
          </button>

          {/* Instructor Skin Drawer Quick-Morph Button */}
          {isInstructor && (
            <button
              onClick={() => setShowInstructorSkinDrawer(prev => !prev)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-black transition cursor-pointer shadow-md ${
                showInstructorSkinDrawer
                  ? 'bg-amber-500/30 border-amber-400 text-amber-200 ring-2 ring-amber-400'
                  : 'bg-amber-950/60 hover:bg-amber-900/70 text-amber-300 border-amber-500/40'
              }`}
              title="Instructor Instant Character Morph (All 20 Science Characters Unlocked)"
            >
              <span>👔</span>
              <span className="hidden md:inline">Morph (20/20)</span>
            </button>
          )}

          {/* Full Screen Toggle Button */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
            title={isFullscreen ? 'Exit Full Screen' : 'Full Screen Mode'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4 text-amber-400" /> : <Maximize2 className="w-4 h-4 text-amber-400" />}
          </button>

          {/* Minimap Toggle */}
          <button
            onClick={() => setMinimapExpanded(prev => !prev)}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
            title="Toggle Minimap [M]"
          >
            <Compass className="w-4 h-4 text-cyan-400" />
          </button>

          {/* Leave Battle */}
          <button
            onClick={handleExit}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold transition cursor-pointer"
          >
            Leave
          </button>
        </div>

      </div>

      {/* =========================================================================
          2D CANVAS VIEWPORT (SPRITE ENGINE, Y-SORTING DEPTH, DYNAMIC MINIMAP)
          ========================================================================= */}
      <div 
        className={`relative w-full rounded-3xl overflow-hidden border-2 border-slate-800/90 shadow-2xl bg-slate-950 cursor-crosshair ${isFullscreen ? 'flex-1 my-1' : ''}`}
        style={isFullscreen ? { height: `${viewDims.height}px` } : { height: `${viewDims.height}px` }}
        onMouseMove={(e) => {
          mouseScreenPos.current = { x: e.clientX, y: e.clientY };
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          if (!selectedBuildType) {
            handleFireWeapon(true);
          }
        }}
        onMouseDown={(e) => {
          if (e.button === 2) {
            e.preventDefault();
            if (!selectedBuildType) {
              handleFireWeapon(true);
            }
          }
        }}
        onClick={(e) => {
          if (selectedBuildType) {
            executeBuildStructure(selectedBuildType);
          } else {
            handleFireWeapon(false);
          }
        }}
      >
        <canvas
          ref={canvasRef}
          width={viewDims.width}
          height={viewDims.height}
          className="w-full h-full block"
        />

        {/* Storm Danger Screen Vignette when outside the Eye of the Storm */}
        {distToStormSafe > 0 && (
          <div className="absolute inset-0 pointer-events-none border-[14px] border-purple-600/50 shadow-[inset_0_0_85px_rgba(139,92,246,0.65)] animate-pulse" />
        )}

        {/* ⚠️ STORM SURGE (10s) ALERT BANNER */}
        {isSurgeActive && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
            <div className="flex items-center gap-2 bg-fuchsia-950/95 border-2 border-fuchsia-400 text-fuchsia-100 px-4 py-2 rounded-2xl font-black text-xs sm:text-sm tracking-wide shadow-[0_0_35px_rgba(217,70,239,0.95)] animate-bounce backdrop-blur-md">
              <Zap className="w-4 h-4 text-amber-300 fill-amber-300 animate-pulse" />
              <span>⚠️ STORM SURGE: RAPID CONTRACTION ACTIVE! (10s)</span>
              <Zap className="w-4 h-4 text-amber-300 fill-amber-300 animate-pulse" />
            </div>
          </div>
        )}

        {/* =====================================================================
            DYNAMIC MINIMAP HUD OVERLAY (TOP-RIGHT CORNER)
            ===================================================================== */}
        <div className={`absolute top-4 right-4 z-20 transition-all duration-200 ${minimapExpanded ? 'w-60 h-60' : 'w-44 h-44'}`}>
          <div className="relative w-full h-full rounded-2xl overflow-hidden border-2 border-fuchsia-500/70 bg-slate-950/90 backdrop-blur-md shadow-2xl p-1">
            <svg 
              viewBox={`0 0 ${MAP_SIZE} ${MAP_SIZE}`} 
              className="w-full h-full rounded-xl overflow-hidden bg-slate-900"
            >
              <defs>
                <mask id="minimap-storm-mask">
                  <rect x="0" y="0" width={MAP_SIZE} height={MAP_SIZE} fill="white" />
                  <circle 
                    cx={Number.isFinite(stormCenter.current?.x) ? stormCenter.current.x : 2560} 
                    cy={Number.isFinite(stormCenter.current?.y) ? stormCenter.current.y : 2560} 
                    r={Math.max(0, Number.isFinite(stormRadius) ? stormRadius : 3600)} 
                    fill="black" 
                  />
                </mask>
              </defs>

              {/* World Blueprint: Dense Pine Forest Zone along west border */}
              <rect x="0" y="0" width="800" height={MAP_SIZE} fill="#064e3b" opacity="0.6" />

              {/* World Blueprint: Lush Green Meadows */}
              <rect x="800" y="0" width={MAP_SIZE - 800} height={MAP_SIZE} fill="#15803d" opacity="0.45" />

              {/* 3 Structured Lakes on Radar */}
              {/* Lake 1 (North-West) */}
              <rect x="1088" y="640" width="576" height="448" rx="80" fill="#0284c7" opacity="0.75" />
              {/* Lake 2 (South Mirror) */}
              <rect x="1216" y="3264" width="704" height="512" rx="90" fill="#0284c7" opacity="0.75" />
              {/* Lake 3 (East Sunken) */}
              <rect x="3648" y="1472" width="704" height="512" rx="90" fill="#0284c7" opacity="0.75" />

              {/* Dirt Arterial Highways on Radar */}
              <line x1="0" y1="2400" x2={MAP_SIZE} y2="2400" stroke="#78350f" strokeWidth="110" opacity="0.85" />
              <line x1="2304" y1="0" x2="2304" y2={MAP_SIZE} stroke="#78350f" strokeWidth="110" opacity="0.85" />
              {/* Forest Logging Trail */}
              <line x1="384" y1="0" x2="384" y2={MAP_SIZE} stroke="#78350f" strokeWidth="70" opacity="0.7" />

              {/* 2 Small Villages on Radar */}
              <rect x="2100" y="1000" width="580" height="480" rx="40" fill="#334155" opacity="0.5" stroke="#fbbf24" strokeWidth="16" />
              <rect x="3100" y="3050" width="580" height="480" rx="40" fill="#334155" opacity="0.5" stroke="#fbbf24" strokeWidth="16" />

              {/* Central Crossroads Ring */}
              <circle cx="2304" cy="2400" r="280" fill="none" stroke="#d97706" strokeWidth="35" opacity="0.6" />

              {/* Transparent Violet Filter Outside Eye on Radar */}
              <rect 
                x="0" 
                y="0" 
                width={MAP_SIZE} 
                height={MAP_SIZE} 
                fill="#8b5cf6" 
                opacity={isSurgeActive ? 0.6 : 0.45} 
                mask="url(#minimap-storm-mask)" 
              />

              {/* Shrinking Storm Safe Zone Ring */}
              <circle 
                cx={Number.isFinite(stormCenter.current?.x) ? stormCenter.current.x : 2560} 
                cy={Number.isFinite(stormCenter.current?.y) ? stormCenter.current.y : 2560} 
                r={Math.max(0, Number.isFinite(stormRadius) ? stormRadius : 3600)} 
                fill="none" 
                stroke={isSurgeActive ? "#f43f5e" : "#d946ef"} 
                strokeWidth="110" 
                opacity="0.95" 
              />

              {/* Target Showdown Destination Center Blip */}
              <circle 
                cx={Number.isFinite(targetFinalCenterRef.current?.x) ? targetFinalCenterRef.current.x : 2560} 
                cy={Number.isFinite(targetFinalCenterRef.current?.y) ? targetFinalCenterRef.current.y : 2560} 
                r="75" 
                fill="#fbbf24" 
                stroke="#ffffff" 
                strokeWidth="20" 
                opacity="0.85" 
              />

              {/* Ground Loot Bananas & Caches */}
              <g id="minimap-ground-loot">
                {(worldDataRef.current?.groundLoot || [])
                  .filter(l => !l.isCollected && Number.isFinite(l.x) && Number.isFinite(l.y))
                  .map(l => (
                    <circle key={`loot_${l.id}`} cx={l.x} cy={l.y} r="35" fill="#facc15" opacity="0.8" />
                  ))}
              </g>

              {/* Supply Drops */}
              <g id="minimap-crates">
                {(crates || [])
                  .filter(c => !c.isClaimed && Number.isFinite(c.x) && Number.isFinite(c.y))
                  .map(c => (
                    <circle key={`crate_${c.id}`} cx={c.x} cy={c.y} r="80" fill="#facc15" stroke="#ffffff" strokeWidth="25" />
                  ))}
              </g>

              {/* Placed Structures */}
              <g id="minimap-structures">
                {(structures || [])
                  .filter(s => Number.isFinite(s.x) && Number.isFinite(s.y))
                  .map(s => (
                    <rect 
                      key={`struct_${s.id}`} 
                      x={s.x - 35} 
                      y={s.y - 35} 
                      width="70" 
                      height="70" 
                      fill={s.type === 'wood_wall' ? '#b45309' : s.type === 'brick_ramp' ? '#ea580c' : '#06b6d4'} 
                    />
                  ))}
              </g>

              {/* Enemy Players (Red) */}
              <g id="minimap-enemies">
                {(arenaPlayers || [])
                  .filter(p => p.uid !== user.id && p.isAlive && Number.isFinite(p.x) && Number.isFinite(p.y))
                  .map(p => (
                    <circle key={`player_${p.uid}`} cx={p.x} cy={p.y} r="90" fill="#ef4444" stroke="#ffffff" strokeWidth="25" />
                  ))}
              </g>

              {/* Camera Viewport Bounding Box */}
              <rect 
                x={Number.isFinite(cameraRef.current?.x) ? cameraRef.current.x : 0} 
                y={Number.isFinite(cameraRef.current?.y) ? cameraRef.current.y : 0} 
                width={Number.isFinite(viewDims?.width) && viewDims.width > 0 ? viewDims.width : 1000} 
                height={Number.isFinite(viewDims?.height) && viewDims.height > 0 ? viewDims.height : 650} 
                fill="none" 
                stroke="#38bdf8" 
                strokeWidth="50" 
                strokeDasharray="140 80"
              />

              {/* Local Player (Green Blip) */}
              <circle 
                cx={Number.isFinite(localX) ? localX : 2560} 
                cy={Number.isFinite(localY) ? localY : 2560} 
                r="110" 
                fill="#10b981" 
                stroke="#ffffff" 
                strokeWidth="30" 
              />
            </svg>

            {/* Radar Header Label */}
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[9px] font-black font-mono text-fuchsia-300 bg-slate-950/80 px-2 py-0.5 rounded">
              <span>RADAR [M]</span>
              <span>5000x5000m</span>
            </div>
          </div>
        </div>

        {/* =====================================================================
            INSTRUCTOR QUICK-MORPH 20-SKIN DRAWER
            ===================================================================== */}
        {isInstructor && showInstructorSkinDrawer && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 w-[95%] max-w-4xl bg-slate-950/95 border-2 border-amber-500/70 rounded-2xl p-3 shadow-[0_0_35px_rgba(245,158,11,0.45)] backdrop-blur-xl animate-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-amber-500/30">
              <div className="flex items-center gap-2">
                <span className="text-lg">👔</span>
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-amber-300 block">
                    Instructor Instant Character Morph: All 18 Fantasy Dungeon Characters Unlocked
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Click any fantasy skin to instantly transform your avatar in the battle arena
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/40 font-mono font-bold">
                  18 / 18 Skins
                </span>
                <button
                  onClick={() => setShowInstructorSkinDrawer(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-9 gap-2 max-h-56 overflow-y-auto pr-1">
              {ALL_FANTASY_SKINS.map((skin) => {
                const isSelected = effectiveSkinId === skin.id || FANTASY_SKIN_ALIASES[effectiveSkinId] === skin.id;
                return (
                  <button
                    key={skin.id}
                    onClick={() => handleSelectSkin(skin.id)}
                    className={`p-1.5 rounded-xl border flex flex-col items-center gap-1 transition cursor-pointer text-center group ${
                      isSelected
                        ? 'bg-amber-500/25 border-amber-400 ring-2 ring-amber-400 shadow-[0_0_14px_rgba(251,191,36,0.5)] scale-105'
                        : 'bg-slate-900/90 border-slate-800 hover:border-amber-500/50 hover:bg-slate-800'
                    }`}
                    title={`${skin.name} (${skin.title})\n${skin.lore}`}
                  >
                    <div className="w-9 h-9 rounded-lg bg-slate-950 flex items-center justify-center overflow-hidden border border-slate-700">
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          backgroundImage: `url(${skin.imageSrc})`,
                          backgroundPosition: '0 0',
                          backgroundSize: '128px 128px',
                          backgroundRepeat: 'no-repeat',
                          transform: 'scale(0.85)',
                          imageRendering: 'pixelated'
                        }}
                      />
                    </div>
                    <span className="text-[9px] font-black text-slate-200 truncate w-full group-hover:text-amber-300 leading-tight">
                      {skin.name}
                    </span>
                    <span className="text-[8px] text-amber-400 font-mono">
                      {skin.rarity.slice(0, 3).toUpperCase()}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* =====================================================================
            BOTTOM ARCADE HOTBAR & ACTIONS
            ===================================================================== */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-slate-950/90 border border-slate-800/90 rounded-2xl p-2 shadow-2xl backdrop-blur-md">
          
          {/* Materials Pill Badges */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 px-2.5 py-1.5 rounded-xl border border-slate-800 text-xs font-mono font-bold">
            <span className="text-amber-400">🪵 {localWood}</span>
            <span className="text-orange-400">🧱 {localBrick}</span>
            <span className="text-cyan-400">⚙️ {localMetal}</span>
          </div>

          <div className="h-6 w-px bg-slate-800" />

          {/* Hotkey [1]: Wood Wall */}
          <button
            onClick={() => buildStructure('wood_wall')}
            className={`px-3 py-1.5 rounded-xl border text-xs font-black flex items-center gap-1.5 transition cursor-pointer ${
              selectedBuildType === 'wood_wall'
                ? 'bg-amber-500/30 border-amber-400 text-amber-200 ring-2 ring-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.5)]'
                : localWood >= 10 
                  ? 'bg-amber-950/40 border-amber-500/50 text-amber-300 hover:bg-amber-900/50' 
                  : 'bg-slate-900 border-slate-800 text-slate-500 opacity-60'
            }`}
          >
            <span className="px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 text-[10px] font-black">1</span>
            <span>🪵 Wall (10)</span>
          </button>

          {/* Hotkey [2]: Brick Ramp */}
          <button
            onClick={() => buildStructure('brick_ramp')}
            className={`px-3 py-1.5 rounded-xl border text-xs font-black flex items-center gap-1.5 transition cursor-pointer ${
              selectedBuildType === 'brick_ramp'
                ? 'bg-orange-500/30 border-orange-400 text-orange-200 ring-2 ring-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.5)]'
                : localBrick >= 15 
                  ? 'bg-orange-950/40 border-orange-500/50 text-orange-300 hover:bg-orange-900/50' 
                  : 'bg-slate-900 border-slate-800 text-slate-500 opacity-60'
            }`}
          >
            <span className="px-1.5 py-0.5 rounded bg-orange-500 text-slate-950 text-[10px] font-black">2</span>
            <span>🧱 Ramp (15)</span>
          </button>

          {/* Hotkey [3]: Metal Bunker */}
          <button
            onClick={() => buildStructure('metal_bunker')}
            className={`px-3 py-1.5 rounded-xl border text-xs font-black flex items-center gap-1.5 transition cursor-pointer ${
              selectedBuildType === 'metal_bunker'
                ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200 ring-2 ring-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]'
                : localMetal >= 15 
                  ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-300 hover:bg-cyan-900/50' 
                  : 'bg-slate-900 border-slate-800 text-slate-500 opacity-60'
            }`}
          >
            <span className="px-1.5 py-0.5 rounded bg-cyan-500 text-slate-950 text-[10px] font-black">3</span>
            <span>⚙️ Bunker (15)</span>
          </button>

          {/* Rotate & Cancel Blueprint Controls when Build Mode is Active */}
          {selectedBuildType && (
            <>
              <div className="h-6 w-px bg-slate-800" />
              <button
                onClick={() => {
                  setBuildRotation(prev => ((prev + 90) % 360));
                  soundEngine.playRotate();
                }}
                className="px-3 py-1.5 rounded-xl border border-cyan-400 bg-cyan-950/80 hover:bg-cyan-900/90 text-cyan-200 text-xs font-black flex items-center gap-1.5 transition cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.4)] animate-pulse"
                title="Rotate Structure 90° [R]"
              >
                <RotateCw className="w-3.5 h-3.5 text-cyan-400" />
                <span>[R] Rotate ({buildRotation}°)</span>
              </button>
              <button
                onClick={() => setSelectedBuildType(null)}
                className="px-2.5 py-1.5 rounded-xl border border-rose-500/60 bg-rose-950/70 hover:bg-rose-900/80 text-rose-300 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                title="Cancel Placement [ESC]"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
            </>
          )}

          {/* Equipped Weapon & Primary Fire */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-black text-slate-300">
            <span className="text-sm">{equippedWeapon.icon}</span>
            <div className="hidden sm:block text-left leading-tight">
              <span className="text-[10px] text-slate-400 block font-normal">Primary [L-Click]</span>
              <span className="text-xs font-bold text-amber-300">{equippedWeapon.name}</span>
            </div>
          </div>

          {/* Alternate Fire Button [F / Right-Click] */}
          {equippedWeapon.stats?.altFire && (
            <button
              onClick={() => handleFireWeapon(true)}
              disabled={Date.now() < altFireCooldownUntil}
              className={`px-3 py-1.5 rounded-xl border text-xs font-black flex items-center gap-1.5 transition cursor-pointer ${
                Date.now() >= altFireCooldownUntil
                  ? 'bg-gradient-to-r from-cyan-950/80 to-purple-950/80 border-cyan-400/80 text-cyan-200 hover:border-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.35)]'
                  : 'bg-slate-900 border-slate-800 text-slate-500 opacity-60'
              }`}
              title={equippedWeapon.stats.altFire.altDescription}
            >
              <span className="px-1.5 py-0.5 rounded bg-cyan-500 text-slate-950 text-[10px] font-black">F</span>
              <span>
                {equippedWeapon.stats.altFire.altType === 'teleport' ? '⚡ ' : '✨ '}
                {equippedWeapon.stats.altFire.altName}
              </span>
              {Date.now() < altFireCooldownUntil && (
                <span className="text-[10px] font-mono text-rose-400">
                  {((altFireCooldownUntil - Date.now()) / 1000).toFixed(1)}s
                </span>
              )}
            </button>
          )}

          {/* Special Ability [E] */}
          <button
            onClick={triggerSpecialPower}
            disabled={Date.now() < powerCooldownUntil}
            className={`px-3 py-1.5 rounded-xl border text-xs font-black flex items-center gap-1.5 transition cursor-pointer ${
              Date.now() >= powerCooldownUntil
                ? 'bg-purple-950/40 border-purple-500/50 text-purple-300 hover:bg-purple-900/50'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            <span className="px-1.5 py-0.5 rounded bg-purple-500 text-slate-950 text-[10px] font-black">E</span>
            <span>{equippedPower.icon} {equippedPower.name}</span>
          </button>

          <div className="h-6 w-px bg-slate-800" />

          {/* Quick-Select Weapon Arsenal (10 Weapons) */}
          <div className="hidden lg:flex items-center gap-1">
            {SHOP_ITEMS.filter(i => i.category === 'weapon').map((w, idx) => {
              const isSelected = w.id === equippedWeapon.id;
              const isOwned = isInstructor || gameProfile?.inventory?.includes(w.id) || w.id === 'bunsen_burner';
              const rarityBorder = 
                w.rarity === 'mythic' ? 'border-rose-400' :
                w.rarity === 'legendary' ? 'border-amber-400' :
                w.rarity === 'epic' ? 'border-purple-400' :
                w.rarity === 'rare' ? 'border-cyan-400' : 'border-slate-600';

              return (
                <button
                  key={w.id}
                  onClick={() => {
                    if (isOwned) handleSelectWeapon(w.id);
                  }}
                  disabled={!isOwned}
                  className={`w-7 h-7 rounded-lg border flex items-center justify-center text-xs transition cursor-pointer relative ${
                    isSelected
                      ? `bg-slate-800 ${rarityBorder} ring-2 ring-amber-400 shadow-md scale-110 z-10`
                      : isOwned
                        ? `bg-slate-900/90 ${rarityBorder} hover:scale-105 opacity-80 hover:opacity-100`
                        : 'bg-slate-950 border-slate-800 opacity-30 cursor-not-allowed'
                  }`}
                  title={`${w.name} (${w.rarity.toUpperCase()}) - ${w.stats?.altFire?.altName || 'Weapon'}`}
                >
                  <span>{w.icon}</span>
                  {idx < 7 && (
                    <span className="absolute -top-1.5 -right-1.5 px-1 rounded-full bg-slate-800 text-[8px] font-mono text-slate-300 border border-slate-700">
                      {idx + 4 <= 9 ? idx + 4 : 0}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Instructor Morph Skin Button in Hotbar */}
          {isInstructor && (
            <button
              onClick={() => setShowInstructorSkinDrawer(prev => !prev)}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-black flex items-center gap-1.5 transition cursor-pointer ${
                showInstructorSkinDrawer
                  ? 'bg-amber-500/30 border-amber-400 text-amber-200 ring-2 ring-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.4)]'
                  : 'bg-amber-950/40 border-amber-500/50 text-amber-300 hover:bg-amber-900/50'
              }`}
              title="Instructor Instant Character Morph (All 20 Science Characters Unlocked)"
            >
              <span>👔</span>
              <span className="hidden xl:inline">Skins (20)</span>
            </button>
          )}

        </div>

        {/* Elimination Overlay */}
        {!isAlive && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-6 text-center animate-in fade-in z-30">
            <div className="space-y-4 max-w-sm bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-2xl">
              <span className="text-4xl block">💀</span>
              <h3 className="text-2xl font-black text-rose-500 uppercase tracking-tight">You Were Eliminated</h3>
              <p className="text-xs text-slate-400">
                You finished with <strong>{kills} eliminations</strong> across the 5000m arena! Revise more Cambridge slide decks to gather extra building materials and gold!
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleExit}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition cursor-pointer"
                >
                  Return to Study
                </button>
                {onOpenShop && (
                  <button
                    onClick={onOpenShop}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition cursor-pointer"
                  >
                    Open Booster Packs
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Victory Royale Celebration Modal */}
        {winnerCelebration && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-6 text-center animate-in zoom-in-95 duration-200 z-40">
            <div className="space-y-5 max-w-md bg-gradient-to-b from-amber-950/60 to-slate-900 border-2 border-amber-500 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
              <div className="text-5xl animate-bounce">👑</div>
              <h2 className="text-3xl font-black text-amber-400 tracking-tight uppercase">
                #1 VICTORY ROYALE!
              </h2>
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-amber-500/30">
                <span className="text-xs text-slate-400 block uppercase font-bold">Champion</span>
                <span className="text-xl font-black text-white">{winnerCelebration.name}</span>
                <span className="text-xs text-amber-400 font-bold block mt-1">+200 XP & Monthly Victory Crown Awarded</span>
              </div>
              <button
                onClick={handleExit}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm uppercase tracking-wider transition shadow-lg cursor-pointer"
              >
                Claim Victory & Return
              </button>
            </div>
          </div>
        )}

        {/* Science Supply Drop Rapid Question Challenge */}
        {activeCrateModal && (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-40">
            <div className="bg-slate-900 border-2 border-cyan-500 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-cyan-400 animate-bounce" />
                  <span className="font-black text-sm text-white">Science Supply Drop Rapid Challenge</span>
                </div>
                <div className="px-2.5 py-1 rounded-full bg-cyan-500 text-slate-950 font-mono font-black text-xs animate-pulse">
                  {crateQuestionTimer}s
                </div>
              </div>

              <p className="text-xs sm:text-sm font-bold text-white leading-relaxed">
                {activeCrateModal.question.question}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {activeCrateModal.question.options.map((opt, oIdx) => (
                  <button
                    key={oIdx}
                    onClick={() => handleAnswerCrateQuestion(oIdx)}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-cyan-600 hover:text-white border border-slate-700 text-xs font-semibold text-slate-200 text-left transition cursor-pointer"
                  >
                    {opt}
                  </button>
                ))}
              </div>

              {crateFeedback && (
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 text-xs font-bold text-center">
                  {crateFeedback}
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Control Legend & Biome Info */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-2.5 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-4 flex-wrap">
          <span>🎮 <strong>WASD / Arrows:</strong> Move (5000m World)</span>
          <span>🎯 <strong>Mouse + Click:</strong> Aim & Fire</span>
          <span>🪵 <strong>1, 2, 3:</strong> Build 3D Defenses</span>
          <span>⚡ <strong>E:</strong> Ability</span>
          <span>🍌 <strong>Loot:</strong> Walk over Bananas to heal HP!</span>
          <span>🧭 <strong>M:</strong> Toggle Radar</span>
        </div>
        <span className="text-[11px] text-fuchsia-400 font-semibold">
          ⚡ Stay inside the Eye of the Storm! The transparent violet shroud outside deals continuous storm damage.
        </span>
      </div>

    </div>
  );
};
