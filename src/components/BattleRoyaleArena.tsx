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
  Info,
  Lock
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
  endBattleRoyale,
  dropMidGameSupplyCrate,
  clearArenaStructures,
  samplePointWithinStormEye,
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
import { MapDesignEditor } from './MapDesignEditor';

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
  baseSheetCol?: number; // backdrop wall drawn behind translucent gables, windows & doors
  baseSheetRow?: number;
  overlayCol?: number; // optional roof weathervane / trim overlay
  overlayRow?: number;
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
  hitboxes?: Array<{ x: number; y: number; w: number; h: number }>;
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
  lilyCol?: number; // Water lily pad / flower overlay from roguelikeSheet
  lilyRow?: number;
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
  isDragonBlood?: boolean;
  isWindWalker?: boolean;
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
      <ellipse cx="40" cy="70" rx="34" ry="7" fill="#000000" fill-opacity="0.28"/>
      <polygon points="8,66 72,66 64,26 40,12 16,26" fill="#4ba86d" stroke="#24633d" stroke-width="2.5"/>
      <polygon points="18,66 62,66 40,14" fill="#5eb780" stroke="#24633d" stroke-width="2"/>
      <polygon points="24,66 56,66 40,34" fill="#307e4d"/>
      <line x1="40" y1="34" x2="40" y2="66" stroke="#164228" stroke-width="3"/>
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
    surface: string = 'grass',
    volumeScale: number = 1
  ) {
    const bus = this.getSpatialBus(sourceX, sourceY, listenerX, listenerY, Math.round(600 * Math.max(0.25, volumeScale)));
    if (!bus || !this.ctx) return;

    const effectiveGain = bus.gainFactor * volumeScale;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(bus.targetNode);

    if (surface === 'asphalt' || surface === 'pavement') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, t);
      osc.frequency.exponentialRampToValueAtTime(60, t + 0.04);
      gain.gain.setValueAtTime(0.18 * effectiveGain, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
      osc.start(t);
      osc.stop(t + 0.04);
    } else if (surface === 'sand') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(100, t);
      osc.frequency.exponentialRampToValueAtTime(45, t + 0.05);
      gain.gain.setValueAtTime(0.12 * effectiveGain, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
      osc.start(t);
      osc.stop(t + 0.05);
    } else if (surface === 'stone') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(220, t);
      osc.frequency.exponentialRampToValueAtTime(80, t + 0.035);
      gain.gain.setValueAtTime(0.14 * effectiveGain, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);
      osc.start(t);
      osc.stop(t + 0.035);
    } else {
      // Grass (soft tap)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(90, t);
      osc.frequency.exponentialRampToValueAtTime(40, t + 0.045);
      gain.gain.setValueAtTime(0.14 * effectiveGain, t);
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

  playSonarPing() {
    if (!this.sfxEnabled) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1320, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.14);
    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    osc.start(t);
    osc.stop(t + 0.16);
  }

  playSupplyDrop() {
    if (!this.sfxEnabled) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    [587.33, 880].forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.09);
      gain.gain.setValueAtTime(0.14, t + idx * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.09 + 0.2);
      osc.start(t + idx * 0.09);
      osc.stop(t + idx * 0.09 + 0.21);
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

// Sample1 Kenney Roguelike Building Palette (Warm Tan Shingle Roofs + Cream Stucco Walls)
const SAMPLE1_ROOF = {
  peakL: { col: 20, row: 21 },
  peakR: { col: 21, row: 21 },
  slopeL: { col: 20, row: 22 },
  slopeR: { col: 21, row: 22 },
  gableL: { col: 20, row: 23 },
  gableR: { col: 21, row: 23 },
  gableMidTrim: { col: 22, row: 22 },
  hTopL: { col: 24, row: 21 },
  hTopM: { col: 25, row: 21 },
  hTopR: { col: 26, row: 21 },
  hBotL: { col: 24, row: 22 },
  hBotM: { col: 25, row: 22 },
  hBotR: { col: 26, row: 22 }
};

const SAMPLE1_WALL = {
  midL: { col: 17, row: 15 },
  midC: { col: 18, row: 15 },
  midR: { col: 19, row: 15 },
  botL: { col: 14, row: 15 },
  botC: { col: 13, row: 15 },
  botR: { col: 16, row: 15 },
  eaveL: { col: 17, row: 16 },
  eaveC: { col: 18, row: 16 },
  eaveR: { col: 19, row: 16 }
};

const SAMPLE1_FEATURES = {
  windowLattice: { col: 46, row: 5 },
  doorWoodSingle: { col: 45, row: 4 },
  doorBarnL: { col: 28, row: 8 },
  doorBarnR: { col: 29, row: 8 },
  weathervane: { col: 52, row: 10 },
  porchDeck: { col: 42, row: 28 },
  porchRailL: { col: 41, row: 28 },
  trashBin: { col: 26, row: 7 },
  brickKiln: { col: 26, row: 8 }
};

const BUILDING_STYLES: Record<BuildingStyle, BuildingStyleConfig> = {
  terracotta: {
    roofTL: SAMPLE1_ROOF.peakL,
    roofTM: SAMPLE1_ROOF.hTopM,
    roofTR: SAMPLE1_ROOF.peakR,
    roofML: SAMPLE1_ROOF.slopeL,
    roofMM: SAMPLE1_ROOF.hBotM,
    roofMR: SAMPLE1_ROOF.slopeR,
    wallL: SAMPLE1_WALL.midL,
    wallM: SAMPLE1_WALL.midC,
    wallR: SAMPLE1_WALL.midR,
    wallWindow: SAMPLE1_FEATURES.windowLattice,
    foundationL: SAMPLE1_WALL.botL,
    foundationM: SAMPLE1_WALL.botC,
    foundationR: SAMPLE1_WALL.botR,
    door: SAMPLE1_FEATURES.doorWoodSingle,
    floor: { col: 12, row: 3, surface: 'dirt', color: '#78350f' },
    primaryMat: 'brick'
  },
  wood: {
    roofTL: SAMPLE1_ROOF.peakL,
    roofTM: SAMPLE1_ROOF.hTopM,
    roofTR: SAMPLE1_ROOF.peakR,
    roofML: SAMPLE1_ROOF.slopeL,
    roofMM: SAMPLE1_ROOF.hBotM,
    roofMR: SAMPLE1_ROOF.slopeR,
    wallL: SAMPLE1_WALL.midL,
    wallM: SAMPLE1_WALL.midC,
    wallR: SAMPLE1_WALL.midR,
    wallWindow: SAMPLE1_FEATURES.windowLattice,
    foundationL: SAMPLE1_WALL.botL,
    foundationM: SAMPLE1_WALL.botC,
    foundationR: SAMPLE1_WALL.botR,
    door: SAMPLE1_FEATURES.doorBarnL,
    floor: { col: 12, row: 3, surface: 'dirt', color: '#78350f' },
    primaryMat: 'wood'
  },
  castle: {
    roofTL: SAMPLE1_ROOF.peakL,
    roofTM: SAMPLE1_ROOF.hTopM,
    roofTR: SAMPLE1_ROOF.peakR,
    roofML: SAMPLE1_ROOF.slopeL,
    roofMM: SAMPLE1_ROOF.hBotM,
    roofMR: SAMPLE1_ROOF.slopeR,
    wallL: SAMPLE1_WALL.midL,
    wallM: SAMPLE1_WALL.midC,
    wallR: SAMPLE1_WALL.midR,
    wallWindow: SAMPLE1_FEATURES.windowLattice,
    foundationL: SAMPLE1_WALL.botL,
    foundationM: SAMPLE1_WALL.botC,
    foundationR: SAMPLE1_WALL.botR,
    door: SAMPLE1_FEATURES.doorWoodSingle,
    floor: { col: 20, row: 14, surface: 'stone', color: '#475569' },
    primaryMat: 'brick'
  },
  stone: {
    roofTL: SAMPLE1_ROOF.peakL,
    roofTM: SAMPLE1_ROOF.hTopM,
    roofTR: SAMPLE1_ROOF.peakR,
    roofML: SAMPLE1_ROOF.slopeL,
    roofMM: SAMPLE1_ROOF.hBotM,
    roofMR: SAMPLE1_ROOF.slopeR,
    wallL: SAMPLE1_WALL.midL,
    wallM: SAMPLE1_WALL.midC,
    wallR: SAMPLE1_WALL.midR,
    wallWindow: SAMPLE1_FEATURES.windowLattice,
    foundationL: SAMPLE1_WALL.botL,
    foundationM: SAMPLE1_WALL.botC,
    foundationR: SAMPLE1_WALL.botR,
    door: SAMPLE1_FEATURES.doorWoodSingle,
    floor: { col: 21, row: 14, surface: 'stone', color: '#475569' },
    primaryMat: 'brick'
  },
  brick: {
    roofTL: SAMPLE1_ROOF.peakL,
    roofTM: SAMPLE1_ROOF.hTopM,
    roofTR: SAMPLE1_ROOF.peakR,
    roofML: SAMPLE1_ROOF.slopeL,
    roofMM: SAMPLE1_ROOF.hBotM,
    roofMR: SAMPLE1_ROOF.slopeR,
    wallL: SAMPLE1_WALL.midL,
    wallM: SAMPLE1_WALL.midC,
    wallR: SAMPLE1_WALL.midR,
    wallWindow: SAMPLE1_FEATURES.windowLattice,
    foundationL: SAMPLE1_WALL.botL,
    foundationM: SAMPLE1_WALL.botC,
    foundationR: SAMPLE1_WALL.botR,
    door: SAMPLE1_FEATURES.doorWoodSingle,
    floor: { col: 22, row: 14, surface: 'stone', color: '#334155' },
    primaryMat: 'brick'
  }
};

export function getBuildingHitboxes(bldg: GeneratedBuilding): Array<{ x: number; y: number; w: number; h: number }> {
  return bldg.hitboxes && bldg.hitboxes.length > 0 ? bldg.hitboxes : [bldg.hitbox];
}

/**
 * 3. BUILDING PREFAB GENERATOR & DRAW FUNCTIONS (Modeled directly after Sample1)
 * Builds multi-layered tan gabled roofs + cream stucco walls + lattice windows + wooden/barn doors,
 * and constructs accurate rectangular or L-shaped hitboxes so roofs/walls are solid and doorways passable.
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
  const wTiles = Math.max(2, Math.floor(width));
  const hTiles = Math.max(3, Math.floor(height));

  const worldX = tileX * WORLD_TILE_SIZE;
  const worldY = tileY * WORLD_TILE_SIZE;
  const worldW = wTiles * WORLD_TILE_SIZE;
  const worldH = hTiles * WORLD_TILE_SIZE;

  const conf = BUILDING_STYLES[style] || BUILDING_STYLES.stone;
  const tiles: BuildingTile[] = [];
  const bldgId = `bldg_${tileX}_${tileY}`;

  // Helper to push a gable wing (used for Barn, Village House, Cottage, Porch Villa, and L-Manor main wing)
  const buildGableWing = (
    wingStartCol: number,
    wingW: number,
    wingH: number,
    options: {
      isBarnDoor?: boolean;
      hasWeathervane?: boolean;
      doorColRel?: number;
    } = {}
  ) => {
    const slopeRows = wingH >= 4 ? 2 : 1; // dr=0 (peak), optional dr=1 (full slope)
    const gableRow = wingH >= 4 ? 2 : 1;
    const doorRow = wingH - 1;
    const doorCol = options.doorColRel ?? (wingW === 2 ? 0 : Math.floor(wingW / 2));

    for (let dr = 0; dr < wingH; dr++) {
      for (let dc = 0; dc < wingW; dc++) {
        const c = tileX + wingStartCol + dc;
        const r = tileY + dr;
        const isL = dc === 0;
        const isR = dc === wingW - 1;

        // 1. Gable Peak Row (dr === 0)
        if (dr === 0) {
          const sprite = isL ? SAMPLE1_ROOF.peakL : isR ? SAMPLE1_ROOF.peakR : SAMPLE1_ROOF.hTopM;
          tiles.push({
            col: c,
            row: r,
            sheetCol: sprite.col,
            sheetRow: sprite.row,
            overlayCol: options.hasWeathervane && isL ? SAMPLE1_FEATURES.weathervane.col : undefined,
            overlayRow: options.hasWeathervane && isL ? SAMPLE1_FEATURES.weathervane.row : undefined,
            isRoof: true
          });
        }
        // 2. Full Tan Roof Slope Row (dr === 1 when wingH >= 4)
        else if (dr === 1 && slopeRows >= 2) {
          const sprite = isL ? SAMPLE1_ROOF.slopeL : isR ? SAMPLE1_ROOF.slopeR : SAMPLE1_ROOF.hBotM;
          tiles.push({
            col: c,
            row: r,
            sheetCol: sprite.col,
            sheetRow: sprite.row,
            isRoof: true
          });
        }
        // 3. Triangular Cream Gable Cutout Row (dr === gableRow)
        else if (dr === gableRow && dr < doorRow) {
          const base = isL ? SAMPLE1_WALL.midL : isR ? SAMPLE1_WALL.midR : SAMPLE1_WALL.midC;
          if (isL) {
            tiles.push({
              col: c,
              row: r,
              baseSheetCol: base.col,
              baseSheetRow: base.row,
              sheetCol: SAMPLE1_ROOF.gableL.col,
              sheetRow: SAMPLE1_ROOF.gableL.row,
              isRoof: true
            });
          } else if (isR) {
            tiles.push({
              col: c,
              row: r,
              baseSheetCol: base.col,
              baseSheetRow: base.row,
              sheetCol: SAMPLE1_ROOF.gableR.col,
              sheetRow: SAMPLE1_ROOF.gableR.row,
              isRoof: true
            });
          } else {
            // Center of gable: if wingH === 4 and not a barn, place lattice window cleanly beneath eave ridge
            const showWindowInGable = wingH === 4 && !options.isBarnDoor && dc === doorCol;
            tiles.push({
              col: c,
              row: r,
              baseSheetCol: base.col,
              baseSheetRow: base.row,
              sheetCol: showWindowInGable ? SAMPLE1_FEATURES.windowLattice.col : SAMPLE1_ROOF.gableMidTrim.col,
              sheetRow: showWindowInGable ? SAMPLE1_FEATURES.windowLattice.row : SAMPLE1_ROOF.gableMidTrim.row,
              overlayCol: showWindowInGable ? SAMPLE1_ROOF.gableMidTrim.col : undefined,
              overlayRow: showWindowInGable ? SAMPLE1_ROOF.gableMidTrim.row : undefined,
              isRoof: false
            });
          }
        }
        // 4. Upper Cream Stucco Wall Rows (e.g., dr === 3 on 5-tile-tall Village House)
        else if (dr < doorRow) {
          const base = isL ? SAMPLE1_WALL.midL : isR ? SAMPLE1_WALL.midR : SAMPLE1_WALL.midC;
          const hasWin =
            (wingW >= 3 && dc === doorCol) ||
            (wingW >= 4 && !isL && !isR && dc % 2 === 1);
          tiles.push({
            col: c,
            row: r,
            baseSheetCol: hasWin ? base.col : undefined,
            baseSheetRow: hasWin ? base.row : undefined,
            sheetCol: hasWin ? SAMPLE1_FEATURES.windowLattice.col : base.col,
            sheetRow: hasWin ? SAMPLE1_FEATURES.windowLattice.row : base.row,
            isRoof: false
          });
        }
        // 5. Ground Wall & Doorway Row (dr === doorRow)
        else {
          const base = isL ? SAMPLE1_WALL.botL : isR ? SAMPLE1_WALL.botR : SAMPLE1_WALL.botC;
          if (options.isBarnDoor && wingW === 2) {
            const barnOverlay = isL ? SAMPLE1_FEATURES.doorBarnL : SAMPLE1_FEATURES.doorBarnR;
            tiles.push({
              col: c,
              row: r,
              baseSheetCol: base.col,
              baseSheetRow: base.row,
              sheetCol: barnOverlay.col,
              sheetRow: barnOverlay.row,
              isRoof: false
            });
          } else if (options.isBarnDoor && wingW >= 3 && (dc === doorCol || dc === doorCol - 1)) {
            const barnOverlay = dc === doorCol - 1 ? SAMPLE1_FEATURES.doorBarnL : SAMPLE1_FEATURES.doorBarnR;
            tiles.push({
              col: c,
              row: r,
              baseSheetCol: base.col,
              baseSheetRow: base.row,
              sheetCol: barnOverlay.col,
              sheetRow: barnOverlay.row,
              isRoof: false
            });
          } else if (dc === doorCol) {
            tiles.push({
              col: c,
              row: r,
              baseSheetCol: base.col,
              baseSheetRow: base.row,
              sheetCol: SAMPLE1_FEATURES.doorWoodSingle.col,
              sheetRow: SAMPLE1_FEATURES.doorWoodSingle.row,
              isRoof: false
            });
          } else if (!isL && !isR && wingW >= 4 && dc % 2 === 0) {
            tiles.push({
              col: c,
              row: r,
              baseSheetCol: base.col,
              baseSheetRow: base.row,
              sheetCol: SAMPLE1_FEATURES.windowLattice.col,
              sheetRow: SAMPLE1_FEATURES.windowLattice.row,
              isRoof: false
            });
          } else {
            tiles.push({
              col: c,
              row: r,
              sheetCol: base.col,
              sheetRow: base.row,
              isRoof: false
            });
          }
        }
      }
    }
  };

  let hitboxes: Array<{ x: number; y: number; w: number; h: number }> | undefined;
  let doorWorldX = (tileX + Math.floor(wTiles / 2)) * WORLD_TILE_SIZE;
  const doorWorldY = (tileY + hTiles - 1) * WORLD_TILE_SIZE;
  let doorW = WORLD_TILE_SIZE - 8;

  // Build Sample1 architectural archetype by style & footprint
  if (style === 'castle' && wTiles >= 4 && hTiles >= 4) {
    // L-Shaped Manor (Sample1 bottom-left complex): Main vertical gable wing + lower horizontal wing
    const mainW = wTiles >= 5 ? 3 : 2;
    const wingW = wTiles - mainW;
    const mainDoorRel = mainW === 2 ? 0 : 1;
    buildGableWing(0, mainW, hTiles, { doorColRel: mainDoorRel });

    const wingTopRow = Math.max(1, hTiles - 3);
    for (let dr = wingTopRow; dr < hTiles; dr++) {
      for (let dc = mainW; dc < wTiles; dc++) {
        const c = tileX + dc;
        const r = tileY + dr;
        const isWingR = dc === wTiles - 1;
        if (dr === wingTopRow) {
          const sp = isWingR ? SAMPLE1_ROOF.hTopR : SAMPLE1_ROOF.hTopM;
          tiles.push({ col: c, row: r, sheetCol: sp.col, sheetRow: sp.row, isRoof: true });
        } else if (dr === wingTopRow + 1) {
          const sp = isWingR ? SAMPLE1_ROOF.hBotR : SAMPLE1_ROOF.hBotM;
          tiles.push({ col: c, row: r, sheetCol: sp.col, sheetRow: sp.row, isRoof: true });
        } else {
          const wallBase = isWingR ? SAMPLE1_WALL.eaveR : SAMPLE1_WALL.eaveC;
          const showWin = dc === mainW + Math.floor((wingW - 1) / 2);
          tiles.push({
            col: c,
            row: r,
            baseSheetCol: showWin ? wallBase.col : undefined,
            baseSheetRow: showWin ? wallBase.row : undefined,
            sheetCol: showWin ? SAMPLE1_FEATURES.windowLattice.col : wallBase.col,
            sheetRow: showWin ? SAMPLE1_FEATURES.windowLattice.row : wallBase.row,
            isRoof: false
          });
        }
      }
    }

    hitboxes = [
      { x: worldX, y: worldY, w: mainW * WORLD_TILE_SIZE, h: worldH },
      {
        x: worldX + mainW * WORLD_TILE_SIZE,
        y: worldY + wingTopRow * WORLD_TILE_SIZE,
        w: wingW * WORLD_TILE_SIZE,
        h: (hTiles - wingTopRow) * WORLD_TILE_SIZE
      }
    ];
    doorWorldX = (tileX + mainDoorRel) * WORLD_TILE_SIZE;
  } else if (style === 'brick' && wTiles >= 4 && hTiles >= 4) {
    // Town Porch Villa (Sample1 far-right house): Wooden left porch + main gable body
    const mainW = wTiles - 1;
    const mainDoorRel = Math.floor(mainW / 2);
    buildGableWing(1, mainW, hTiles, { doorColRel: mainDoorRel });

    const porchRoofRow = Math.max(1, hTiles - 3);
    for (let dr = porchRoofRow; dr < hTiles; dr++) {
      const c = tileX;
      const r = tileY + dr;
      if (dr === porchRoofRow) {
        tiles.push({ col: c, row: r, sheetCol: SAMPLE1_ROOF.hTopL.col, sheetRow: SAMPLE1_ROOF.hTopL.row, isRoof: true });
      } else if (dr === porchRoofRow + 1) {
        tiles.push({ col: c, row: r, sheetCol: SAMPLE1_ROOF.hBotL.col, sheetRow: SAMPLE1_ROOF.hBotL.row, isRoof: true });
      } else {
        tiles.push({
          col: c,
          row: r,
          baseSheetCol: SAMPLE1_WALL.eaveL.col,
          baseSheetRow: SAMPLE1_WALL.eaveL.row,
          sheetCol: SAMPLE1_FEATURES.porchDeck.col,
          sheetRow: SAMPLE1_FEATURES.porchDeck.row,
          overlayCol: SAMPLE1_FEATURES.porchRailL.col,
          overlayRow: SAMPLE1_FEATURES.porchRailL.row,
          isRoof: false
        });
      }
    }

    hitboxes = [
      {
        x: worldX,
        y: worldY + porchRoofRow * WORLD_TILE_SIZE,
        w: WORLD_TILE_SIZE,
        h: (hTiles - porchRoofRow) * WORLD_TILE_SIZE
      },
      {
        x: worldX + WORLD_TILE_SIZE,
        y: worldY,
        w: mainW * WORLD_TILE_SIZE,
        h: worldH
      }
    ];
    doorWorldX = (tileX + 1 + mainDoorRel) * WORLD_TILE_SIZE;
  } else if (style === 'wood') {
    // Sample1 Barn / Storage Shed: Wide dark open garage door across center
    buildGableWing(0, wTiles, hTiles, { isBarnDoor: true });
    if (wTiles === 2) {
      doorWorldX = worldX + 8;
      doorW = worldW - 16;
    } else {
      const midC = Math.floor(wTiles / 2);
      doorWorldX = (tileX + midC - 1) * WORLD_TILE_SIZE + 8;
      doorW = WORLD_TILE_SIZE * 2 - 16;
    }
  } else if (style === 'terracotta') {
    // Sample1 Watchpost Cottage: Weathervane on upper-left roof + single wood door
    const doorCol = wTiles === 2 ? 0 : Math.floor(wTiles / 2);
    buildGableWing(0, wTiles, hTiles, { hasWeathervane: true, doorColRel: doorCol });
    doorWorldX = (tileX + doorCol) * WORLD_TILE_SIZE;
  } else {
    // Sample1 Village House ('stone' default): Trapezoidal tan roof, cream gable, lattice window, wood door
    const doorCol = wTiles === 2 ? 0 : Math.floor(wTiles / 2);
    buildGableWing(0, wTiles, hTiles, { doorColRel: doorCol });
    doorWorldX = (tileX + doorCol) * WORLD_TILE_SIZE;
  }

  // Hitbox & Doorway Opening (Solid walls and roofs block player movement)
  const hitbox = {
    x: worldX,
    y: worldY,
    w: worldW,
    h: worldH
  };

  const doorway = {
    x: doorWorldX + (wTiles === 2 && style === 'wood' ? 0 : 4),
    y: doorWorldY,
    w: doorW,
    h: WORLD_TILE_SIZE
  };

  // Sample1-faithful Perimeter Props (Trash Bin by Barn, Brick Kiln by Cottage, Neat Fencing/Tree)
  const perimeterProps: SceneryProp[] = [];

  if (style === 'wood') {
    // Grey metal bin cleanly tucked beside the Barn's bottom-left corner (as in Sample1)
    perimeterProps.push({
      id: `${bldgId}_bin`,
      x: worldX - 18,
      y: worldY + worldH - 12,
      type: 'barrel_oil',
      width: 28,
      height: 28,
      footprintRadius: 12,
      hp: 65,
      maxHp: 65,
      materialDrop: 'metal',
      dropAmount: 4,
      spriteKey: 'prop_barrel_oil',
      sheetCol: SAMPLE1_FEATURES.trashBin.col,
      sheetRow: SAMPLE1_FEATURES.trashBin.row
    });
  } else if (style === 'terracotta') {
    // Small brick kiln/oven beside Cottage bottom-left (as in Sample1)
    perimeterProps.push({
      id: `${bldgId}_kiln`,
      x: worldX - 18,
      y: worldY + worldH - 12,
      type: 'boulder',
      width: 28,
      height: 28,
      footprintRadius: 12,
      hp: 85,
      maxHp: 85,
      materialDrop: 'brick',
      dropAmount: 5,
      spriteKey: 'prop_boulder',
      sheetCol: SAMPLE1_FEATURES.brickKiln.col,
      sheetRow: SAMPLE1_FEATURES.brickKiln.row
    });
  } else {
    // Wood crate at corner
    perimeterProps.push({
      id: `${bldgId}_crate`,
      x: worldX - 16,
      y: worldY + worldH - 10,
      type: 'crate_wood',
      width: 30,
      height: 30,
      footprintRadius: 13,
      hp: 60,
      maxHp: 60,
      materialDrop: 'wood',
      dropAmount: 4,
      spriteKey: 'prop_crate_wood',
      sheetCol: 7,
      sheetRow: 23
    });
  }

  // Neat perimeter round tree (as seen alongside Sample1 cottages)
  perimeterProps.push({
    id: `${bldgId}_tree`,
    x: worldX + worldW + 26,
    y: worldY + 24,
    type: 'round_tree',
    width: 36,
    height: 48,
    footprintRadius: 14,
    hp: 90,
    maxHp: 90,
    materialDrop: 'wood',
    dropAmount: 6,
    spriteKey: 'prop_round_tree',
    sheetCol: 13,
    sheetRow: 9,
    sheetTopRow: 8
  });

  // Interior / Porch loot cache
  const interiorLoot: GroundLootItem[] = [
    {
      id: `${bldgId}_loot`,
      x: doorWorldX + Math.max(WORLD_TILE_SIZE / 2, doorW / 2),
      y: doorWorldY + WORLD_TILE_SIZE / 2 - 4,
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
    hitboxes,
    doorway,
    perimeterProps,
    interiorLoot
  };
}

/**
 * LAYER 2: drawHousePrefab(x, y, width, height, style, name)
 * Builds Sample1-faithful gabled village houses, barns, cottages, porch villas, and L-manors.
 */
export function drawHousePrefab(
  x: number,
  y: number,
  width: number = 3,
  height: number = 5,
  style: BuildingStyle = 'stone',
  name: string = 'House'
): GeneratedBuilding {
  return generateBuilding(x, y, width, height, style, name);
}

/**
 * LAYER 1: drawWaterBody(startX, startY, width, height)
 * Renders a connected Sample1-accurate pond using Kenney 9-slice grass+shoreline water tiles (col 2..4, row 0..2)
 * and scatters floating green lily pads + blooming white water lilies (cols 25,26,28 rows 10..11) across interior tiles.
 */
export function drawWaterBody(
  tiles: TileData[][],
  startX: number,
  startY: number,
  width: number,
  height: number,
  rng: () => number = Math.random
) {
  const lilySprites = [
    { col: 25, row: 11 }, // Blooming white water lily with yellow center on green pad
    { col: 25, row: 11 }, // Extra weight for classic white flower lily
    { col: 26, row: 11 }, // Large notched green lily pad
    { col: 28, row: 10 }, // Paired small green lily pads
    { col: 28, row: 11 }  // Small oval green lily pad
  ];

  let placedLilies = 0;

  for (let dy = 0; dy < height; dy++) {
    for (let dx = 0; dx < width; dx++) {
      const c = startX + dx;
      const r = startY + dy;
      if (r < 0 || r >= TILES_COUNT || c < 0 || c >= TILES_COUNT) continue;

      let sheetCol = 3;
      let sheetRow = 1;
      const isInterior = dx > 0 && dx < width - 1 && dy > 0 && dy < height - 1;

      if (dx === 0 && dy === 0) {
        sheetCol = 2; sheetRow = 0; // Top-Left shoreline corner
      } else if (dx === width - 1 && dy === 0) {
        sheetCol = 4; sheetRow = 0; // Top-Right shoreline corner
      } else if (dy === 0) {
        sheetCol = 3; sheetRow = 0; // Top shoreline edge
      } else if (dx === 0 && dy === height - 1) {
        sheetCol = 2; sheetRow = 2; // Bottom-Left shoreline corner
      } else if (dx === width - 1 && dy === height - 1) {
        sheetCol = 4; sheetRow = 2; // Bottom-Right shoreline corner
      } else if (dy === height - 1) {
        sheetCol = 3; sheetRow = 2; // Bottom shoreline edge
      } else if (dx === 0) {
        sheetCol = 2; sheetRow = 1; // Left shoreline edge
      } else if (dx === width - 1) {
        sheetCol = 4; sheetRow = 1; // Right shoreline edge
      } else {
        // Interior sky-blue water fill with subtle cyan shimmer tile variation
        sheetCol = rng() > 0.72 ? 1 : 3;
        sheetRow = sheetCol === 1 ? 0 : 1;
      }

      tiles[r][c].surface = 'water';
      tiles[r][c].baseColor = '#63c5cf';
      tiles[r][c].overlayCol = sheetCol;
      tiles[r][c].overlayRow = sheetRow;
      tiles[r][c].isWater = true;

      // Sprinkle Sample1 water lilies on interior water tiles (spaced cleanly apart)
      const isDeepInterior = dx >= 2 && dx <= width - 3 && dy >= 2 && dy <= height - 3;
      if (isInterior && (isDeepInterior ? rng() < 0.14 : rng() < 0.05)) {
        const hasAdjacentLily =
          tiles[r - 1]?.[c]?.lilyCol !== undefined ||
          tiles[r]?.[c - 1]?.lilyCol !== undefined ||
          tiles[r - 1]?.[c - 1]?.lilyCol !== undefined;
        if (!hasAdjacentLily) {
          const picked = lilySprites[Math.floor(rng() * lilySprites.length)];
          tiles[r][c].lilyCol = picked.col;
          tiles[r][c].lilyRow = picked.row;
          placedLilies++;
        }
      }
    }
  }

  // Guarantee at least 3 visible water lilies on every pond
  if (placedLilies < 3 && width >= 5 && height >= 5) {
    const fallbackCoords = [
      { dx: Math.floor(width * 0.35), dy: Math.floor(height * 0.35), col: 25, row: 11 },
      { dx: Math.floor(width * 0.65), dy: Math.floor(height * 0.6), col: 25, row: 11 },
      { dx: Math.floor(width * 0.45), dy: Math.floor(height * 0.72), col: 28, row: 10 }
    ];
    for (const fc of fallbackCoords) {
      const r = startY + fc.dy;
      const c = startX + fc.dx;
      if (tiles[r]?.[c]?.isWater && tiles[r][c].lilyCol === undefined) {
        tiles[r][c].lilyCol = fc.col;
        tiles[r][c].lilyRow = fc.row;
      }
    }
  }
}

/**
 * LAYER 1: drawDirtRoad(startX, startY, length, direction, roadWidth)
 * Renders connected warm-brown dirt roads and pathways using Sample1 dirt tiles (6,0 / 6,1 / 8,10).
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

      let sheetCol = isHoriz ? 6 : 6;
      let sheetRow = isHoriz ? 0 : 1;

      if (tiles[r][c].isRoad) {
        sheetCol = 8;
        sheetRow = 10;
      }

      tiles[r][c].surface = 'dirt';
      tiles[r][c].baseColor = '#b48355';
      tiles[r][c].overlayCol = sheetCol;
      tiles[r][c].overlayRow = sheetRow;
      tiles[r][c].lilyCol = undefined;
      tiles[r][c].lilyRow = undefined;
      tiles[r][c].isRoad = true;
    }
  }
}

/**
 * LAYER 1: drawDirtPatch(tiles, startX, startY, width, height)
 * Renders a Sample1 rounded dirt clearing (Kenney 9-slice cols 7..9, rows 9..11) for campgrounds & yards.
 */
export function drawDirtPatch(
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
      if (tiles[r][c].isWater) continue;

      const sheetCol = dx === 0 ? 7 : dx === width - 1 ? 9 : 8;
      const sheetRow = dy === 0 ? 9 : dy === height - 1 ? 11 : 10;

      tiles[r][c].surface = 'dirt';
      tiles[r][c].baseColor = '#b48355';
      tiles[r][c].overlayCol = sheetCol;
      tiles[r][c].overlayRow = sheetRow;
      tiles[r][c].isRoad = true;
    }
  }
}

export interface MapLayoutMeta {
  seed: number;
  forestSide: 'west' | 'east' | 'north' | 'south';
  forestBox: { x: number; y: number; w: number; h: number };
  lakes: Array<{ x: number; y: number; w: number; h: number }>;
  roads: Array<{ x1: number; y1: number; x2: number; y2: number; width: number }>;
  villages: Array<{ x: number; y: number; w: number; h: number; name: string }>;
  hub: { x: number; y: number };
}

export interface GeneratedWorldData {
  tiles: TileData[][];
  scenery: SceneryProp[];
  groundLoot: GroundLootItem[];
  buildings: GeneratedBuilding[];
  mapMeta?: MapLayoutMeta;
}

export function hashSeedString(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createSeededRng(seed: number): () => number {
  let state = (seed >>> 0) || 1;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function getSkinMovementSpeedPxPerSec(
  skinDef: FantasySkinDefinition,
  isSpeedBoosted: boolean = false,
  extraMultiplier: number = 1
): number {
  const clampedStat = Math.max(40, Math.min(100, skinDef?.speed ?? 52));
  // Dramatic scale: Slime (46) ~206 px/s vs Cultist (52) ~238 px/s vs Archer (68) ~322 px/s vs Overlord (96) ~469 px/s
  const basePxPerSec = 175 + ((clampedStat - 40) / 60) * 315;
  return basePxPerSec * (isSpeedBoosted ? 1.25 : 1) * extraMultiplier;
}

/**
 * 2. MULTI-LAYER PROCEDURAL MAP ENGINE (RANDOMIZED LAYOUT ON EVERY PLAY / TEST)
 * - LAYER 0: Solid Ground Base (100% Solid Grass across 160x160 world grid)
 * - LAYER 1: Structured Water & Dirt Regions (3-4 randomized lakes, randomized highways, crossroads hub)
 * - LAYER 2: Prefab Villages (2 randomized settlements with varied building styles & sizes)
 * - LAYER 3: Foliage, Camping Zones, and Y-Sorted Props (Pine forest border, Outposts, Trees, Loot)
 */
function generateSuperAnimalStyleMap(seed: number = Date.now()): GeneratedWorldData {
  const rng = createSeededRng(seed);
  const randInt = (min: number, max: number) => Math.floor(rng() * (max - min + 1)) + min;
  const pick = <T,>(arr: T[]): T => arr[Math.floor(rng() * arr.length)];

  const tiles: TileData[][] = [];
  const scenery: SceneryProp[] = [];
  const groundLoot: GroundLootItem[] = [];
  const buildings: GeneratedBuilding[] = [];

  // =========================================================================
  // LAYER 0 (SOLID GROUND BASE): 100% Solid Grass across the 5120px World
  // =========================================================================
  for (let r = 0; r < TILES_COUNT; r++) {
    const row: TileData[] = [];
    for (let c = 0; c < TILES_COUNT; c++) {
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
  // LAYER 1: RANDOMIZED FOREST SIDE, ARTERIAL ROADS & CENTRAL HUB
  // =========================================================================
  const forestSides: Array<'west' | 'east' | 'north' | 'south'> = ['west', 'east', 'north', 'south'];
  const forestSide = pick(forestSides);

  const hubCol = randInt(64, 92);
  const hubRow = randInt(64, 92);
  const nsRoadCol = hubCol;
  const ewRoadRow = hubRow;

  const lakesMeta: MapLayoutMeta['lakes'] = [];
  const roadsMeta: MapLayoutMeta['roads'] = [];
  const villagesMeta: MapLayoutMeta['villages'] = [];

  const addRoad = (sx: number, sy: number, len: number, dir: 'horizontal' | 'vertical', width: number) => {
    drawDirtRoad(tiles, sx, sy, len, dir, width);
    if (dir === 'horizontal') {
      const yMid = (sy + width / 2) * WORLD_TILE_SIZE;
      roadsMeta.push({
        x1: sx * WORLD_TILE_SIZE,
        y1: yMid,
        x2: (sx + len) * WORLD_TILE_SIZE,
        y2: yMid,
        width: width * WORLD_TILE_SIZE
      });
    } else {
      const xMid = (sx + width / 2) * WORLD_TILE_SIZE;
      roadsMeta.push({
        x1: xMid,
        y1: sy * WORLD_TILE_SIZE,
        x2: xMid,
        y2: (sy + len) * WORLD_TILE_SIZE,
        width: width * WORLD_TILE_SIZE
      });
    }
  };

  // =========================================================================
  // RESERVE ONE DESIGNATED CITY / VILLAGE ZONE (STRICTLY <= 15% OF MAP AREA)
  // 160x160 = 25,600 tiles total -> 15% max = 3,840 tiles.
  // City district is ~46x44 = 2,024 tiles (~7.9% of map, never exceeds 15%).
  // =========================================================================
  const cityW = randInt(44, 48);
  const cityH = randInt(42, 46);
  const maxCityTiles = Math.floor(0.15 * TILES_COUNT * TILES_COUNT); // 3,840 tiles hard cap
  const safeCityW = cityW * cityH > maxCityTiles ? 46 : cityW;
  const safeCityH = cityW * cityH > maxCityTiles ? 44 : cityH;

  const cityCandidateRegions = [
    { c: randInt(28, 34), r: randInt(26, 32) },   // North-West city
    { c: randInt(84, 88), r: randInt(26, 32) },   // North-East city
    { c: randInt(28, 34), r: randInt(86, 90) },   // South-West city
    { c: randInt(84, 88), r: randInt(86, 90) }    // South-East city
  ];
  for (let i = cityCandidateRegions.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [cityCandidateRegions[i], cityCandidateRegions[j]] = [cityCandidateRegions[j], cityCandidateRegions[i]];
  }

  let cityRect = cityCandidateRegions[0];
  for (const cand of cityCandidateRegions) {
    let c = cand.c;
    let r = cand.r;
    if (forestSide === 'west' && c < 26) c = 26;
    if (forestSide === 'east' && c + safeCityW > 134) c = 134 - safeCityW;
    if (forestSide === 'north' && r < 26) r = 26;
    if (forestSide === 'south' && r + safeCityH > 134) r = 134 - safeCityH;

    // Ensure central spawn (78,78) is outside or safely buffered from city blocks
    const centerInCity = 78 >= c - 4 && 78 <= c + safeCityW + 4 && 78 >= r - 4 && 78 <= r + safeCityH + 4;
    if (!centerInCity) {
      cityRect = { c, r };
      break;
    }
  }
  // Final clamp away from forest border
  if (forestSide === 'west' && cityRect.c < 26) cityRect.c = 26;
  if (forestSide === 'east' && cityRect.c + safeCityW > 134) cityRect.c = 134 - safeCityW;
  if (forestSide === 'north' && cityRect.r < 26) cityRect.r = 26;
  if (forestSide === 'south' && cityRect.r + safeCityH > 134) cityRect.r = 134 - safeCityH;

  const overlapsCity = (tileC: number, tileR: number, w: number, h: number, pad = 2) =>
    tileC < cityRect.c + safeCityW + pad &&
    tileC + w + pad > cityRect.c &&
    tileR < cityRect.r + safeCityH + pad &&
    tileR + h + pad > cityRect.r;

  // Place 3-4 distinct randomized lakes in outer zones clear of central spawn (78,78) AND City/Village
  const lakeZones = [
    { minC: 26, maxC: 56, minR: 16, maxR: 50 },
    { minC: 26, maxC: 56, minR: 96, maxR: 132 },
    { minC: 100, maxC: 134, minR: 18, maxR: 54 },
    { minC: 100, maxC: 134, minR: 96, maxR: 132 }
  ];
  for (let i = lakeZones.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [lakeZones[i], lakeZones[j]] = [lakeZones[j], lakeZones[i]];
  }
  const lakeTileRects: Array<{ c: number; r: number; w: number; h: number }> = [];
  for (let i = 0; i < lakeZones.length; i++) {
    const z = lakeZones[i];
    const lw = randInt(14, 21);
    const lh = randInt(12, 16);
    let placedLake = false;
    for (let attempt = 0; attempt < 15 && !placedLake; attempt++) {
      let lc = randInt(z.minC, Math.max(z.minC, z.maxC - lw));
      let lr = randInt(z.minR, Math.max(z.minR, z.maxR - lh));
      if (forestSide === 'west' && lc < 26) lc = 26;
      if (forestSide === 'east' && lc + lw > 134) lc = 134 - lw;
      if (forestSide === 'north' && lr < 26) lr = 26;
      if (forestSide === 'south' && lr + lh > 134) lr = 134 - lh;

      const lakeCenterC = lc + lw / 2;
      const lakeCenterR = lr + lh / 2;
      if (Math.hypot(lakeCenterC - 78, lakeCenterR - 78) < 20) continue;
      if (overlapsCity(lc, lr, lw, lh, 3)) continue;

      drawWaterBody(tiles, lc, lr, lw, lh, rng);
      lakeTileRects.push({ c: lc, r: lr, w: lw, h: lh });
      lakesMeta.push({
        x: lc * WORLD_TILE_SIZE,
        y: lr * WORLD_TILE_SIZE,
        w: lw * WORLD_TILE_SIZE,
        h: lh * WORLD_TILE_SIZE
      });
      placedLake = true;
    }
  }

  // Arterial highways crossing at (nsRoadCol, ewRoadRow)
  addRoad(nsRoadCol, 0, TILES_COUNT, 'vertical', 3);
  addRoad(0, ewRoadRow, TILES_COUNT, 'horizontal', 3);

  // Logging trail through the dense forest zone
  let forestBox = { x: 0, y: 0, w: 800, h: MAP_SIZE };
  if (forestSide === 'west') {
    const trailCol = randInt(10, 15);
    addRoad(trailCol, 0, TILES_COUNT, 'vertical', 2);
    forestBox = { x: 0, y: 0, w: 24 * WORLD_TILE_SIZE, h: MAP_SIZE };
  } else if (forestSide === 'east') {
    const trailCol = randInt(144, 150);
    addRoad(trailCol, 0, TILES_COUNT, 'vertical', 2);
    forestBox = { x: 136 * WORLD_TILE_SIZE, y: 0, w: 24 * WORLD_TILE_SIZE, h: MAP_SIZE };
  } else if (forestSide === 'north') {
    const trailRow = randInt(10, 15);
    addRoad(0, trailRow, TILES_COUNT, 'horizontal', 2);
    forestBox = { x: 0, y: 0, w: MAP_SIZE, h: 24 * WORLD_TILE_SIZE };
  } else {
    const trailRow = randInt(144, 150);
    addRoad(0, trailRow, TILES_COUNT, 'horizontal', 2);
    forestBox = { x: 0, y: 136 * WORLD_TILE_SIZE, w: MAP_SIZE, h: 24 * WORLD_TILE_SIZE };
  }

  const overlapsLake = (tileC: number, tileR: number, w: number, h: number, pad = 2) =>
    lakeTileRects.some(
      l => tileC < l.c + l.w + pad && tileC + w + pad > l.c && tileR < l.r + l.h + pad && tileR + h + pad > l.r
    );

  const overlapsExistingBuilding = (tileC: number, tileR: number, w: number, h: number, padTiles = 3) =>
    buildings.some(
      b =>
        tileC < b.tileX + b.width + padTiles &&
        tileC + w + padTiles > b.tileX &&
        tileR < b.tileY + b.height + padTiles &&
        tileR + h + padTiles > b.tileY
    );

  const areaHasRoadOrWater = (tileC: number, tileR: number, w: number, h: number) => {
    for (let r = tileR; r < tileR + h; r++) {
      for (let c = tileC; c < tileC + w; c++) {
        const t = tiles[r]?.[c];
        if (!t || t.isWater || t.isRoad) return true;
      }
    }
    return false;
  };

  const commitBuildingSafely = (b: GeneratedBuilding) => {
    // Filter perimeter props so trees/crates/bins never sit in water, roads, or neighboring buildings
    const cleanProps = b.perimeterProps.filter(p => {
      const pc = Math.floor(p.x / WORLD_TILE_SIZE);
      const pr = Math.floor(p.y / WORLD_TILE_SIZE);
      const pt = tiles[pr]?.[pc];
      if (!pt || pt.isWater || pt.isRoad) return false;
      const touchesOther = buildings.some(
        ob =>
          p.x >= ob.worldX - 18 &&
          p.x <= ob.worldX + ob.worldW + 18 &&
          p.y >= ob.worldY - 18 &&
          p.y <= ob.worldY + ob.worldH + 18
      );
      return !touchesOther;
    });
    b.perimeterProps = cleanProps;
    buildings.push(b);
    scenery.push(...cleanProps);
    groundLoot.push(...b.interiorLoot);
  };

  // =========================================================================
  // LAYER 2A: ONE DESIGNATED HIGH-DENSITY CITY / VILLAGE (<= 15% OF MAP)
  // Features interconnected pathways separating Sample1 buildings cleanly.
  // =========================================================================
  const cityNames = [
    'Oakridge Market Town',
    'Millbrook Haven',
    'Sunvale Borough',
    'Crestwood Village',
    'Amberwatch Quarter'
  ];
  const cityName = pick(cityNames);
  const cc0 = cityRect.c;
  const cr0 = cityRect.r;

  // Internal street pathways inside the City/Village (creating clean walkable blocks)
  const cityHStreetRows = [
    cr0 + 9,
    cr0 + 21,
    cr0 + 33
  ].filter(r => r + 2 < cr0 + safeCityH - 2);
  const cityVStreetCols = [
    cc0 + 10,
    cc0 + 22,
    cc0 + 34
  ].filter(c => c + 2 < cc0 + safeCityW - 2);

  for (const hr of cityHStreetRows) {
    addRoad(cc0, hr, safeCityW, 'horizontal', 2);
  }
  for (const vc of cityVStreetCols) {
    addRoad(vc, cr0, safeCityH, 'vertical', 2);
  }

  // Connect designated City/Village main streets straight into the arterial highways
  const mainCityHR = cityHStreetRows[Math.floor(cityHStreetRows.length / 2)] ?? cr0 + Math.floor(safeCityH / 2);
  const mainCityVC = cityVStreetCols[Math.floor(cityVStreetCols.length / 2)] ?? cc0 + Math.floor(safeCityW / 2);
  if (cc0 > nsRoadCol) {
    addRoad(nsRoadCol, mainCityHR, cc0 - nsRoadCol + 2, 'horizontal', 2);
  } else if (cc0 + safeCityW < nsRoadCol) {
    addRoad(cc0 + safeCityW - 1, mainCityHR, nsRoadCol - (cc0 + safeCityW) + 3, 'horizontal', 2);
  }
  if (cr0 > ewRoadRow) {
    addRoad(mainCityVC, ewRoadRow, cr0 - ewRoadRow + 2, 'vertical', 2);
  } else if (cr0 + safeCityH < ewRoadRow) {
    addRoad(mainCityVC, cr0 + safeCityH - 1, ewRoadRow - (cr0 + safeCityH) + 3, 'vertical', 2);
  }

  // Populate every city block between the dirt pathways with Sample1 buildings (12-16 dense buildings)
  const hBounds = [cr0, ...cityHStreetRows.map(r => r + 2), cr0 + safeCityH];
  const hEnds = [...cityHStreetRows, cr0 + safeCityH];
  const vBounds = [cc0, ...cityVStreetCols.map(c => c + 2), cc0 + safeCityW];
  const vEnds = [...cityVStreetCols, cc0 + safeCityW];

  const cityArchetypes: Array<{ style: BuildingStyle; w: number; h: number; label: string }> = [
    { style: 'castle', w: 5, h: 4, label: 'Town Manor' },
    { style: 'brick', w: 4, h: 4, label: 'Porch Villa' },
    { style: 'stone', w: 3, h: 5, label: 'Village House' },
    { style: 'wood', w: 2, h: 4, label: 'Supply Barn' },
    { style: 'terracotta', w: 2, h: 4, label: 'Watchpost Cottage' },
    { style: 'stone', w: 3, h: 4, label: 'Townhouse' }
  ];

  let cityBldgCount = 0;
  for (let br = 0; br < hEnds.length; br++) {
    const rMin = hBounds[br] + 1;
    const rMax = hEnds[br] - 1;
    if (rMax - rMin < 5) continue;

    for (let bc = 0; bc < vEnds.length; bc++) {
      const cMin = vBounds[bc] + 1;
      const cMax = vEnds[bc] - 1;
      if (cMax - cMin < 4) continue;

      // Leave occasional central town square or place 1-2 buildings in wider blocks with pathway clearance
      const blockW = cMax - cMin;
      const blockH = rMax - rMin;
      const arch = pick(cityArchetypes);
      const bW = Math.min(arch.w, blockW - 1);
      const bH = Math.min(arch.h, blockH - 1);
      if (bW < 2 || bH < 4) continue;

      const placeC = cMin + Math.max(0, Math.floor((blockW - bW) / 2));
      const placeR = rMax - bH; // Align doorway neatly facing the street pathway directly south!

      if (
        !overlapsLake(placeC, placeR, bW, bH, 1) &&
        !areaHasRoadOrWater(placeC, placeR, bW, bH) &&
        !overlapsExistingBuilding(placeC, placeR, bW, bH, 2)
      ) {
        const bldg = drawHousePrefab(placeC, placeR, bW, bH, arch.style, `${cityName} ${arch.label}`);
        commitBuildingSafely(bldg);
        cityBldgCount++;
      }
    }
  }

  villagesMeta.push({
    x: cc0 * WORLD_TILE_SIZE,
    y: cr0 * WORLD_TILE_SIZE,
    w: safeCityW * WORLD_TILE_SIZE,
    h: safeCityH * WORLD_TILE_SIZE,
    name: `${cityName} (${cityBldgCount} Bldgs)`
  });

  // =========================================================================
  // LAYER 2B: RANDOMLY SCATTERED SAMPLE1 BUILDINGS ACROSS THE ENTIRE MAP
  // Significantly increased rural & outskirts building presence (16-20+ houses/barns/villas)
  // =========================================================================
  const ruralArchetypes: Array<{ style: BuildingStyle; w: number; h: number; label: string }> = [
    { style: 'stone', w: 3, h: 5, label: 'Meadow House' },
    { style: 'wood', w: 2, h: 4, label: 'Field Barn' },
    { style: 'terracotta', w: 2, h: 4, label: 'Outpost Cottage' },
    { style: 'brick', w: 4, h: 4, label: 'Country Villa' },
    { style: 'castle', w: 5, h: 4, label: 'Frontier Manor' },
    { style: 'stone', w: 2, h: 4, label: 'Wayside Cabin' }
  ];

  const targetScatteredBuildings = 18;
  let placedScattered = 0;
  for (let attempt = 0; attempt < 260 && placedScattered < targetScatteredBuildings; attempt++) {
    const arch = pick(ruralArchetypes);
    const scCol = randInt(8, TILES_COUNT - arch.w - 8);
    const scRow = randInt(8, TILES_COUNT - arch.h - 8);

    // Keep clear of central player spawn (tile 78, 78)
    const bCenterC = scCol + arch.w / 2;
    const bCenterR = scRow + arch.h / 2;
    if (Math.hypot(bCenterC - 78, bCenterR - 78) < 10) continue;

    // Keep outside the designated City/Village district
    if (overlapsCity(scCol, scRow, arch.w, arch.h, 4)) continue;

    // Keep clear of lakes (with 2-tile shore margin so it sits cleanly beside or away from ponds)
    if (overlapsLake(scCol, scRow, arch.w, arch.h, 2)) continue;

    // Keep clear of roads and doorway apron (1 tile south of building)
    if (areaHasRoadOrWater(scCol - 1, scRow - 1, arch.w + 2, arch.h + 3)) continue;

    // Keep clear of other buildings (5-tile spacing across rural countryside)
    if (overlapsExistingBuilding(scCol, scRow, arch.w, arch.h, 5)) continue;

    const ruralBldg = drawHousePrefab(scCol, scRow, arch.w, arch.h, arch.style, arch.label);
    commitBuildingSafely(ruralBldg);

    // Small welcoming dirt doorstep path (2x2 tiles just south of doorway)
    const doorTileC = Math.floor(ruralBldg.doorway.x / WORLD_TILE_SIZE);
    const doorTileR = scRow + arch.h;
    drawDirtRoad(tiles, doorTileC, doorTileR, 2, 'vertical', 2);

    placedScattered++;
  }

  // Fallback road spurs toward lakes
  for (const lk of lakeTileRects.slice(0, 2)) {
    const lkMidR = lk.r + Math.floor(lk.h / 2);
    if (lk.c > nsRoadCol) {
      addRoad(nsRoadCol, lkMidR, lk.c - nsRoadCol, 'horizontal', 2);
    } else if (lk.c + lk.w < nsRoadCol) {
      addRoad(lk.c + lk.w, lkMidR, nsRoadCol - (lk.c + lk.w), 'horizontal', 2);
    }
  }

  // =========================================================================
  // LAYER 3: DENSE PINE FOREST BORDER ZONE (ROTATES BY forestSide)
  // =========================================================================
  let propId = 1000;
  const fRStart = forestSide === 'south' ? 136 : 2;
  const fREnd = forestSide === 'north' ? 24 : TILES_COUNT - 2;
  const fCStart = forestSide === 'east' ? 136 : 1;
  const fCEnd = forestSide === 'west' ? 24 : TILES_COUNT - 2;

  for (let r = fRStart; r < fREnd; r += 2) {
    for (let c = fCStart; c < fCEnd; c += 2) {
      if (tiles[r]?.[c]?.isRoad || tiles[r]?.[c]?.isWater) continue;
      if (Math.hypot(c - 78, r - 78) < 12) continue;
      const wx = c * WORLD_TILE_SIZE + 16;
      const wy = r * WORLD_TILE_SIZE + 28;
      if (buildings.some(b => wx >= b.worldX - 36 && wx <= b.worldX + b.worldW + 36 && wy >= b.worldY - 36 && wy <= b.worldY + b.worldH + 36)) {
        continue;
      }

      const n = rng();
      if (n > 0.38) {
        scenery.push({
          id: `pine_forest_${propId++}`,
          x: wx,
          y: wy,
          type: 'pine_tree',
          width: 36,
          height: 48,
          footprintRadius: 14,
          hp: 90,
          maxHp: 90,
          materialDrop: 'wood',
          dropAmount: 5,
          spriteKey: 'prop_pine_tree',
          sheetCol: n > 0.68 ? 18 : 16,
          sheetRow: 9,
          sheetTopRow: 8
        });
      } else if (n > 0.2) {
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
      } else if (n > 0.1) {
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
  // LAYER 3: 3 RANDOMIZED SAMPLE1 CAMPING OUTPOSTS (DIRT CLEARING + GREEN 2x2 TENTS + CAMPFIRE)
  // =========================================================================
  for (let campIdx = 1; campIdx <= 3; campIdx++) {
    for (let attempt = 0; attempt < 35; attempt++) {
      const cc = randInt(24, 134);
      const cr = randInt(20, 136);
      if (Math.hypot(cc - 78, cr - 78) < 14) continue;
      if (overlapsCity(cc - 4, cr - 3, 8, 6, 2)) continue;
      if (overlapsLake(cc - 4, cr - 3, 8, 6, 1)) continue;
      if (areaHasRoadOrWater(cc - 3, cr - 2, 7, 5)) continue;
      if (overlapsExistingBuilding(cc - 3, cr - 2, 7, 5, 2)) continue;

      // Sample1 rounded dirt clearing underneath tents & campfire
      drawDirtPatch(tiles, cc - 3, cr - 2, 7, 5);

      const campX = cc * WORLD_TILE_SIZE;
      const campY = cr * WORLD_TILE_SIZE;
      scenery.push(
        {
          id: `camp${campIdx}_tent_1`,
          x: campX - 36,
          y: campY + 6,
          type: 'tent',
          width: 64,
          height: 64,
          footprintRadius: 24,
          hp: 110,
          maxHp: 110,
          materialDrop: 'wood',
          dropAmount: 4,
          spriteKey: 'prop_tent',
          sheetCol: 46,
          sheetRow: 10
        },
        {
          id: `camp${campIdx}_tent_2`,
          x: campX + 52,
          y: campY + 6,
          type: 'tent',
          width: 64,
          height: 64,
          footprintRadius: 24,
          hp: 110,
          maxHp: 110,
          materialDrop: 'wood',
          dropAmount: 4,
          spriteKey: 'prop_tent',
          sheetCol: 46,
          sheetRow: 10
        },
        {
          id: `camp${campIdx}_campfire`,
          x: campX + 8,
          y: campY + 12,
          type: 'campfire',
          width: 30,
          height: 30,
          footprintRadius: 10,
          hp: 40,
          maxHp: 40,
          materialDrop: 'wood',
          dropAmount: 2,
          spriteKey: 'prop_campfire',
          sheetCol: 14,
          sheetRow: 8
        }
      );
      groundLoot.push(
        {
          id: `camp${campIdx}_loot_1`,
          x: campX + 8,
          y: campY - 12,
          type: campIdx % 2 === 0 ? 'shield_cell' : 'banana',
          name: campIdx % 2 === 0 ? 'Outpost Shield Battery' : 'Outpost Rations',
          spriteKey: campIdx % 2 === 0 ? 'loot_shield_cell' : 'loot_banana',
          healHp: campIdx % 2 === 0 ? undefined : 25,
          grantShield: campIdx % 2 === 0 ? 30 : undefined,
          isCollected: false
        },
        {
          id: `camp${campIdx}_loot_2`,
          x: campX + 52,
          y: campY + 26,
          type: 'speed_flask',
          name: 'Camp Speed Catalyst',
          spriteKey: 'loot_speed_flask',
          healHp: 15,
          grantShield: 15,
          isCollected: false
        }
      );
      break;
    }
  }

  // =========================================================================
  // LAYER 3: RANDOMIZED STANDALONE TREES, FENCES, STUMPS & FLOWERS
  // =========================================================================
  const hubWorldX = (hubCol + 1.5) * WORLD_TILE_SIZE;
  const hubWorldY = (hubRow + 1.5) * WORLD_TILE_SIZE;

  for (let i = 0; i < 380; i++) {
    const rx = 200 + Math.floor(rng() * (MAP_SIZE - 400));
    const ry = 160 + Math.floor(rng() * (MAP_SIZE - 320));

    // Keep central spawn plaza (2500, 2500) and crossroads hub open
    if (Math.hypot(rx - 2500, ry - 2500) < 220) continue;
    if (Math.hypot(rx - hubWorldX, ry - hubWorldY) < 180) continue;

    // Avoid buildings
    const insideBuilding = buildings.some(
      b => rx >= b.worldX - 36 && rx <= b.worldX + b.worldW + 36 &&
           ry >= b.worldY - 36 && ry <= b.worldY + b.worldH + 36
    );
    if (insideBuilding) continue;

    // Avoid water bodies and dirt highways
    const tileCol = Math.floor(rx / WORLD_TILE_SIZE);
    const tileRow = Math.floor(ry / WORLD_TILE_SIZE);
    const tile = tiles[tileRow]?.[tileCol];
    if (!tile || tile.isWater || tile.isRoad) continue;

    const roll = rng();
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
      propType = 'pine_tree';
      sheetCol = roll > 0.82 ? 18 : 16;
      sheetRow = 9;
      sheetTopRow = 8;
      w = 36;
      h = 48;
      radius = 14;
      hp = 90;
    } else if (roll > 0.35) {
      propType = 'round_tree';
      sheetCol = roll > 0.55 ? 13 : (roll > 0.45 ? 15 : 14);
      sheetRow = 9;
      sheetTopRow = 8;
      w = 38;
      h = 48;
      radius = 15;
      hp = 85;
    } else if (roll > 0.22) {
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
      sheetRow,
      sheetTopRow
    });
  }

  // Randomized Ground Loot Pickups across the map
  let lootId = 100;
  for (let l = 0; l < 52; l++) {
    const lx = 260 + Math.floor(rng() * (MAP_SIZE - 520));
    const ly = 260 + Math.floor(rng() * (MAP_SIZE - 520));
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

  return {
    tiles,
    scenery,
    groundLoot,
    buildings,
    mapMeta: {
      seed,
      forestSide,
      forestBox,
      lakes: lakesMeta,
      roads: roadsMeta,
      villages: villagesMeta,
      hub: { x: hubWorldX, y: hubWorldY }
    }
  };
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

  const handleInstructorEndMatch = async () => {
    if (!window.confirm('Are you sure you want to terminate this battle match? The top active survivor will be crowned champion.')) {
      return;
    }
    try {
      await endBattleRoyale();
    } catch (e: any) {
      console.warn('Failed to end battle royale from arena HUD:', e);
    }
  };

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
  const lastStormDamageTimeRef = useRef<number>(0);

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

  // Supply Crate Modal & Storm-Eye Air-Drop Alerts
  const [activeCrateModal, setActiveCrateModal] = useState<SupplyCrate | null>(null);
  const [crateQuestionTimer, setCrateQuestionTimer] = useState<number>(3);
  const [crateFeedback, setCrateFeedback] = useState<string | null>(null);
  const [crateDropBanner, setCrateDropBanner] = useState<string | null>(null);

  // Skin Special Ability Cooldowns & HUD Feedback
  const [skinAbilityFlash, setSkinAbilityFlash] = useState<string | null>(null);
  const [slimeBounceCooldownUntil, setSlimeBounceCooldownUntil] = useState<number>(0);

  // Victory Celebration Modal
  const [winnerCelebration, setWinnerCelebration] = useState<{ name: string; avatar: string } | null>(null);

  // Map Revision & Fresh Procedural Map Generation on Every Play/Test Session
  const [mapRevision, setMapRevision] = useState<number>(0);
  const lastMatchSeedKeyRef = useRef<string | null>(null);
  const didInitResetRef = useRef<boolean>(false);
  const worldDataRef = useRef<GeneratedWorldData | null>(null);

  if (!worldDataRef.current) {
    worldDataRef.current = generateSuperAnimalStyleMap(
      Date.now() + Math.floor(Math.random() * 1000000)
    );
  }

  // Instructor Test & Map Design States (corbanb@gisboyshigh.net only)
  const isOwnerTester = user?.email?.toLowerCase() === 'corbanb@gisboyshigh.net';
  const [showMapEditor, setShowMapEditor] = useState<boolean>(false);
  const [showTestControls, setShowTestControls] = useState<boolean>(false);
  const [isVictoryMinimized, setIsVictoryMinimized] = useState<boolean>(false);

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

  // High-Frequency Mutable Refs for Smooth 60fps Game Loop (No RAF re-mount jitter)
  const playerPosRef = useRef<{ x: number; y: number }>({ x: 2500, y: 2500 });
  const facingAngleRef = useRef<number>(0);
  const walkCycleRef = useRef<number>(0);
  const isLocallyMovingRef = useRef<boolean>(false);
  const isAliveRef = useRef<boolean>(true);
  const hpRef = useRef<number>(100);
  const shieldRef = useRef<number>(50);
  const woodRef = useRef<number>(30);
  const brickRef = useRef<number>(20);
  const metalRef = useRef<number>(15);
  const arenaPlayersRef = useRef<ArenaPlayer[]>([]);
  const structuresRef = useRef<ArenaStructure[]>([]);
  const cratesRef = useRef<SupplyCrate[]>([]);
  const battleStateRef = useRef<BattleEventState | null>(null);
  const activeCrateModalRef = useRef<SupplyCrate | null>(null);
  const selectedBuildTypeRef = useRef<'wood_wall' | 'brick_ramp' | 'metal_bunker' | null>(null);
  const buildRotationRef = useRef<number>(0);
  const viewDimsRef = useRef<{ width: number; height: number }>({ width: 1000, height: 650 });
  const highGroundUntilRef = useRef<number>(0);
  const metalShieldUntilRef = useRef<number>(0);
  const doubleDamageUntilRef = useRef<number>(0);
  const acousticShieldUntilRef = useRef<number>(0);
  const speedBoostUntilRef = useRef<number>(0);
  const lastShotTimeRef = useRef<number>(0);

  // Skin Special Ability Refs (High-Frequency Loop Safe)
  const currentStormRadiusRef = useRef<number>(3600);
  const soulBurnsRef = useRef<Array<{ targetUid: string; ticksRemaining: number; nextTickAt: number; damagePerTick: number }>>([]);
  const lastSiphonAtRef = useRef<number>(0);
  const lastRiverHealAtRef = useRef<number>(0);
  const lastEcholocationAtRef = useRef<number>(0);
  const echolocationRingsRef = useRef<Array<{ x: number; y: number; startedAt: number; maxRadius: number }>>([]);
  const lastCataclysmAtRef = useRef<number>(0);
  const shadowBlinkUntilRef = useRef<number>(0);
  const slimeBounceCooldownUntilRef = useRef<number>(0);
  const brittleGuardCooldownUntilRef = useRef<number>(0);
  const brittleInvulnUntilRef = useRef<number>(0);
  const royalAbsorptionCooldownUntilRef = useRef<number>(0);
  const crateIgniteCooldownRef = useRef<Record<string, number>>({});
  const lastCrateDropTriggerRef = useRef<number>(0);

  const flashSkinAbility = useCallback((label: string) => {
    setSkinAbilityFlash(label);
    setTimeout(() => {
      setSkinAbilityFlash(prev => (prev === label ? null : prev));
    }, 2400);
  }, []);

  const findValidCratePointInStormEye = useCallback(
    (center: { x: number; y: number }, radius: number): { x: number; y: number } => {
      for (let attempt = 0; attempt < 25; attempt++) {
        const pt = samplePointWithinStormEye(center, radius, MAP_SIZE);
        const col = Math.min(TILES_COUNT - 1, Math.max(0, Math.floor(pt.x / WORLD_TILE_SIZE)));
        const row = Math.min(TILES_COUNT - 1, Math.max(0, Math.floor(pt.y / WORLD_TILE_SIZE)));
        const tile = worldDataRef.current?.tiles[row]?.[col];
        if (tile?.isWater) continue;
        const insideBldg = worldDataRef.current?.buildings?.some(
          b => pt.x >= b.hitbox.x - 24 && pt.x <= b.hitbox.x + b.hitbox.w + 24 &&
               pt.y >= b.hitbox.y - 24 && pt.y <= b.hitbox.y + b.hitbox.h + 24
        );
        if (insideBldg) continue;
        return pt;
      }
      return samplePointWithinStormEye(center, radius, MAP_SIZE);
    },
    []
  );

  const setPlayerCoords = useCallback((x: number, y: number) => {
    const cx = Math.max(35, Math.min(MAP_SIZE - 35, x));
    const cy = Math.max(35, Math.min(MAP_SIZE - 35, y));
    playerPosRef.current = { x: cx, y: cy };
    setLocalX(cx);
    setLocalY(cy);
  }, []);

  useEffect(() => { arenaPlayersRef.current = arenaPlayers; }, [arenaPlayers]);
  useEffect(() => { structuresRef.current = structures; }, [structures]);
  useEffect(() => { cratesRef.current = crates; }, [crates]);
  useEffect(() => { battleStateRef.current = battleState; }, [battleState]);
  useEffect(() => { activeCrateModalRef.current = activeCrateModal; }, [activeCrateModal]);
  useEffect(() => { selectedBuildTypeRef.current = selectedBuildType; }, [selectedBuildType]);
  useEffect(() => { buildRotationRef.current = buildRotation; }, [buildRotation]);
  useEffect(() => { viewDimsRef.current = viewDims; }, [viewDims]);
  useEffect(() => { highGroundUntilRef.current = highGroundUntil; }, [highGroundUntil]);
  useEffect(() => { metalShieldUntilRef.current = metalShieldUntil; }, [metalShieldUntil]);
  useEffect(() => { doubleDamageUntilRef.current = doubleDamageUntil; }, [doubleDamageUntil]);
  useEffect(() => { acousticShieldUntilRef.current = acousticShieldUntil; }, [acousticShieldUntil]);
  useEffect(() => { lastShotTimeRef.current = lastShotTime; }, [lastShotTime]);
  useEffect(() => { isAliveRef.current = isAlive; }, [isAlive]);
  useEffect(() => { hpRef.current = localHp; }, [localHp]);
  useEffect(() => { shieldRef.current = localShield; }, [localShield]);
  useEffect(() => { woodRef.current = localWood; }, [localWood]);
  useEffect(() => { brickRef.current = localBrick; }, [localBrick]);
  useEffect(() => { metalRef.current = localMetal; }, [localMetal]);

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

  // Reset player-built structures cleanly on initial mount when starting/testing
  useEffect(() => {
    if (didInitResetRef.current) return;
    didInitResetRef.current = true;
    if (!battleStateRef.current || battleStateRef.current.status !== 'IN_PROGRESS' || isOwnerTester) {
      structuresRef.current = [];
      setStructures([]);
      clearArenaStructures().catch(() => {});
    }
  }, [isOwnerTester]);

  // 1. Subscribe to Firestore Real-Time collections
  useEffect(() => {
    const unsubPlayers = subscribeToArenaPlayers((players) => {
      arenaPlayersRef.current = players;
      setArenaPlayers(players);
      const me = players.find(p => p.uid === user.id);
      if (me) {
        if (me.hp < prevLocalHpRef.current) {
          lastDamageTimeRef.current = Date.now();
        }
        if (me.brittleGuardUsedAt && me.brittleGuardUsedAt + 25000 > brittleGuardCooldownUntilRef.current) {
          brittleGuardCooldownUntilRef.current = me.brittleGuardUsedAt + 25000;
          brittleInvulnUntilRef.current = Date.now() + 1500;
          addFloatingText(playerPosRef.current.x, playerPosRef.current.y - 36, '💀 BRITTLE GUARD SAVED YOU!', '#f59e0b');
          spawnParticles(playerPosRef.current.x, playerPosRef.current.y, '#e7e5e4', 'stone_chip', 18, 5);
          flashSkinAbility('Brittle Guard Triggered!');
        }
        if (me.royalAbsorptionUsedAt && me.royalAbsorptionUsedAt + 10000 > royalAbsorptionCooldownUntilRef.current) {
          royalAbsorptionCooldownUntilRef.current = me.royalAbsorptionUsedAt + 10000;
          addFloatingText(playerPosRef.current.x, playerPosRef.current.y - 36, '👑 ROYAL ABSORPTION -> +BRICKS!', '#34d399');
          spawnParticles(playerPosRef.current.x, playerPosRef.current.y, '#34d399', 'spark', 14, 4);
          flashSkinAbility('Royal Absorption +Bricks!');
        }
        if (!me.isAlive && prevLocalHpRef.current > 0 && localDeathTimeRef.current === 0) {
          localDeathTimeRef.current = Date.now();
        }
        prevLocalHpRef.current = me.hp;
        const resolvedHp = isOwnerTester && localDeathTimeRef.current === 0 && !me.isAlive ? 100 : me.hp;
        const resolvedAlive = isOwnerTester && localDeathTimeRef.current === 0 ? true : me.isAlive;
        hpRef.current = resolvedHp;
        shieldRef.current = me.shield;
        isAliveRef.current = resolvedAlive;
        setLocalHp(resolvedHp);
        setLocalShield(me.shield);
        setIsAlive(resolvedAlive);
        setKills(me.kills || 0);
        if (me.wood !== undefined) {
          woodRef.current = me.wood;
          setLocalWood(me.wood);
        }
        if (me.brick !== undefined) {
          brickRef.current = me.brick;
          setLocalBrick(me.brick);
        }
        if (me.metal !== undefined) {
          metalRef.current = me.metal;
          setLocalMetal(me.metal);
        }

        // Spawn position sync
        if (!hasSpawnSynced.current && me.x !== undefined && me.y !== undefined) {
          setPlayerCoords(me.x, me.y);
          const vd = viewDimsRef.current;
          cameraRef.current.x = Math.max(0, Math.min(MAP_SIZE - vd.width, me.x - vd.width / 2));
          cameraRef.current.y = Math.max(0, Math.min(MAP_SIZE - vd.height, me.y - vd.height / 2));
          hasSpawnSynced.current = true;
        }
      }
    });

    const unsubStructs = subscribeToStructures((s) => {
      structuresRef.current = s;
      setStructures(s);
    });
    const unsubCrates = subscribeToSupplyCrates((c) => {
      cratesRef.current = c;
      setCrates(c);
    });

    const unsubState = subscribeToBattleState((st) => {
      battleStateRef.current = st;
      setBattleState(st);
      if (st.status === 'IN_PROGRESS' && st.startedAt) {
        if (lastMatchSeedKeyRef.current !== st.startedAt) {
          lastMatchSeedKeyRef.current = st.startedAt;
          worldDataRef.current = generateSuperAnimalStyleMap(hashSeedString(st.startedAt));
          structuresRef.current = [];
          setStructures([]);
          if (isOwnerTester) {
            clearArenaStructures().catch(() => {});
          }
          setMapRevision(r => r + 1);
        }
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
        if (lastMatchSeedKeyRef.current !== null) {
          lastMatchSeedKeyRef.current = null;
          structuresRef.current = [];
          setStructures([]);
        }
        matchStartTimeRef.current = Date.now();
      }
      // Do not auto-show victory celebration from previous match sessions for instructor testing
      if (st.status === 'ENDED' && st.currentWinner && !isOwnerTester) {
        setWinnerCelebration(st.currentWinner);
        soundEngine.playVictory();
      } else if (isOwnerTester || st.status !== 'ENDED') {
        setWinnerCelebration(null);
      }
    });

    return () => {
      unsubPlayers();
      unsubStructs();
      unsubCrates();
      unsubState();
    };
  }, [user.id, isOwnerTester, setPlayerCoords]);

  // Subscribe to own profile for loadout
  useEffect(() => {
    if (!user.id) return;
    const unsub = subscribeToGameProfile(user.id, (p) => {
      setGameProfile(p);
      woodRef.current = p.wood;
      brickRef.current = p.brick;
      metalRef.current = p.metal;
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
    const resolvedSkin = getFantasySkin(initialAvatar);
    const isKnightHero = resolvedSkin.id === 'knight_hero';

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
      shield: isKnightHero ? 70 : 50,
      maxShield: isKnightHero ? 120 : 100,
      wood: Math.max(10, gameProfile?.wood ?? 20),
      brick: Math.max(10, gameProfile?.brick ?? 10),
      metal: Math.max(5, gameProfile?.metal ?? 5),
      isAlive: true,
      kills: 0
    });
  }, [user?.id, user?.name, user?.role, activeSkinId, gameProfile?.equippedSkin, gameProfile?.avatar, gameProfile?.equippedWeapon]);

  // Periodic Random Supply Crate Drop strictly within the Eye of the Storm
  const triggerStormEyeCrateDrop = useCallback(async (forceDrop: boolean = false) => {
    const center = stormCenter.current;
    const radius = currentStormRadiusRef.current;
    const cratesNow = cratesRef.current;
    const cratesInEye = cratesNow.filter(
      c => !c.isClaimed && Math.hypot(c.x - center.x, c.y - center.y) <= radius
    );

    if (!forceDrop && (cratesInEye.length >= 8 || cratesNow.filter(c => !c.isClaimed).length >= 12)) {
      return;
    }

    const pt = findValidCratePointInStormEye(center, radius);
    const created = await dropMidGameSupplyCrate({
      center,
      radius,
      x: pt.x,
      y: pt.y
    });
    if (created) {
      if (!cratesRef.current.some(c => c.id === created.id)) {
        const nextCrates = [...cratesRef.current, created];
        cratesRef.current = nextCrates;
        setCrates(nextCrates);
      }
      soundEngine.playSupplyDrop();
      spawnParticles(pt.x, pt.y, '#facc15', 'spark', 18, 5);
      addFloatingText(pt.x, pt.y - 28, '📦 SUPPLY CRATE DROPPED!', '#facc15');
      setCrateDropBanner('📦 Science Supply Crate air-dropped inside the Eye of the Storm!');
      setTimeout(() => {
        setCrateDropBanner(prev =>
          prev === '📦 Science Supply Crate air-dropped inside the Eye of the Storm!' ? null : prev
        );
      }, 3600);
    }
  }, [findValidCratePointInStormEye]);

  useEffect(() => {
    const isTeacherUser = user?.role === 'instructor' || gameProfile?.role === 'instructor';

    const maybeDropPeriodicCrate = (forceIfEmpty: boolean = false) => {
      if (showMapEditor || activeCrateModalRef.current) return;
      const bStatus = battleStateRef.current?.status;
      const canPlayNow = isOwnerTester || bStatus === 'IN_PROGRESS';
      if (!canPlayNow) return;

      // Multi-client deduplication: only the owner tester, instructor, or lowest-UID alive client spawns periodic crates
      const aliveUids = arenaPlayersRef.current
        .filter(p => p.isAlive && !p.uid.startsWith('dummy_'))
        .map(p => p.uid)
        .sort();
      const isElectedDropper =
        isOwnerTester ||
        isTeacherUser ||
        aliveUids.length === 0 ||
        aliveUids[0] === user.id;
      if (!isElectedDropper) return;

      const now = Date.now();
      if (!forceIfEmpty && now - lastCrateDropTriggerRef.current < 14000) return;
      lastCrateDropTriggerRef.current = now;

      const cratesInEye = cratesRef.current.filter(
        c => !c.isClaimed && Math.hypot(c.x - stormCenter.current.x, c.y - stormCenter.current.y) <= currentStormRadiusRef.current
      );
      if (forceIfEmpty && cratesInEye.length >= 3) return;
      triggerStormEyeCrateDrop(false).catch(() => {});
    };

    const initialTimer = setTimeout(() => maybeDropPeriodicCrate(true), 4500);
    const interval = setInterval(() => maybeDropPeriodicCrate(false), 16000);
    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [user.id, user?.role, gameProfile?.role, isOwnerTester, showMapEditor, triggerStormEyeCrateDrop]);

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

  // Resolve equipped items & fantasy skin stats (speed + defense)
  const effectiveWeaponId = activeWeaponId || gameProfile?.equippedWeapon || 'bunsen_burner';
  const equippedWeapon: ShopItem = SHOP_ITEMS.find(i => i.id === effectiveWeaponId) || SHOP_ITEMS.find(i => i.category === 'weapon') || SHOP_ITEMS[0];
  const equippedPowerId = gameProfile?.equippedPower || 'element_shield';
  const equippedPower: ShopItem = SHOP_ITEMS.find(i => i.id === equippedPowerId) || SHOP_ITEMS[11];
  const effectiveSkinId = activeSkinId || gameProfile?.equippedSkin || gameProfile?.avatar || 'cultist';
  const equippedSkinDef: FantasySkinDefinition = getFantasySkin(effectiveSkinId);
  const equippedSkin: ShopItem = SHOP_ITEMS.find(i => i.id === effectiveSkinId) || {
    id: equippedSkinDef.id,
    name: equippedSkinDef.name,
    category: 'skin',
    rarity: equippedSkinDef.rarity,
    price: equippedSkinDef.price,
    icon: equippedSkinDef.icon,
    description: equippedSkinDef.lore
  };

  const equippedWeaponRef = useRef<ShopItem>(equippedWeapon);
  const effectiveSkinIdRef = useRef<string>(effectiveSkinId);
  const effectiveSkinDefRef = useRef<FantasySkinDefinition>(equippedSkinDef);
  useEffect(() => { equippedWeaponRef.current = equippedWeapon; }, [equippedWeapon]);
  useEffect(() => { effectiveSkinIdRef.current = effectiveSkinId; }, [effectiveSkinId]);
  useEffect(() => { effectiveSkinDefRef.current = equippedSkinDef; }, [equippedSkinDef]);

  // Switch weapon immediately in arena
  const handleSelectWeapon = async (wId: string) => {
    setActiveWeaponId(wId);
    soundEngine.playRotate();
    await equipItem(user.id, 'weapon', wId);
  };

  // Switch skin immediately in arena (Instructors have full access to all 19 fantasy skins)
  const handleSelectSkin = async (skinId: string) => {
    const nextSkinDef = getFantasySkin(skinId);
    const prevSkinId = effectiveSkinDefRef.current.id;
    setActiveSkinId(skinId);
    effectiveSkinIdRef.current = skinId;
    effectiveSkinDefRef.current = nextSkinDef;
    soundEngine.playRotate();

    // Knight Hero — Crown of Glory: +20 max shield capacity (120 vs 100)
    const nextMaxShield = nextSkinDef.id === 'knight_hero' ? 120 : 100;
    let nextShield = shieldRef.current;
    if (nextSkinDef.id === 'knight_hero' && prevSkinId !== 'knight_hero') {
      nextShield = Math.min(120, nextShield + 20);
      addFloatingText(playerPosRef.current.x, playerPosRef.current.y - 34, '👑 CROWN OF GLORY: 120 MAX SHIELD!', '#fbbf24');
      flashSkinAbility('Crown of Glory (+20 Max Shield)');
    } else if (nextSkinDef.id !== 'knight_hero' && nextShield > 100) {
      nextShield = 100;
    } else {
      flashSkinAbility(`${nextSkinDef.name}: ${nextSkinDef.ability.split(':')[0]}`);
    }
    shieldRef.current = nextShield;
    setLocalShield(nextShield);

    await equipItem(user.id, 'skin', skinId);
    ensureArenaPlayer({
      uid: user.id,
      name: user.name || (isInstructor ? 'Instructor (Admin)' : 'Scientist'),
      avatar: skinId,
      equippedWeapon: effectiveWeaponId,
      x: Math.round(playerPosRef.current.x),
      y: Math.round(playerPosRef.current.y),
      angle: facingAngleRef.current,
      hp: hpRef.current,
      maxHp: 100,
      shield: nextShield,
      maxShield: nextMaxShield,
      wood: woodRef.current,
      brick: brickRef.current,
      metal: metalRef.current,
      isAlive: isAliveRef.current,
      kills: kills
    });
  };

  // Solo Testing Helper for corbanb@gisboyshigh.net: Spawn training dummy
  const handleSpawnTrainingDummy = () => {
    const px = playerPosRef.current.x;
    const py = playerPosRef.current.y;
    const ang = facingAngleRef.current;
    const dummyId = `dummy_${Date.now()}`;
    const dummyX = Math.round(px + 110 * Math.cos(ang));
    const dummyY = Math.round(py + 110 * Math.sin(ang));
    ensureArenaPlayer({
      uid: dummyId,
      name: '🎯 Training Dummy',
      avatar: 'cultist',
      equippedWeapon: 'bunsen_burner',
      x: dummyX,
      y: dummyY,
      angle: ang + Math.PI,
      hp: 100,
      maxHp: 100,
      shield: 50,
      maxShield: 100,
      wood: 50,
      brick: 30,
      metal: 20,
      isAlive: true,
      kills: 0
    });
    addFloatingText(dummyX, dummyY - 30, 'Dummy Spawned! 🎯', '#38bdf8');
  };

  // Solo Testing Helper: Restore HP, shield, and grant infinite materials
  const handleRestoreHealthAndMats = () => {
    const maxSh = effectiveSkinDefRef.current.id === 'knight_hero' ? 120 : 100;
    hpRef.current = 100;
    shieldRef.current = maxSh;
    woodRef.current += 500;
    brickRef.current += 500;
    metalRef.current += 500;
    setLocalHp(100);
    setLocalShield(maxSh);
    setLocalWood(woodRef.current);
    setLocalBrick(brickRef.current);
    setLocalMetal(metalRef.current);
    addFloatingText(playerPosRef.current.x, playerPosRef.current.y - 30, 'Max HP & +500 Mats! ✨', '#34d399');
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

  // 2. Keyboard & Mouse Input Listeners (Ref-backed so listeners never re-bind on movement)
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
        triggerSpecialPowerRef.current();
      } else if (key === 'g') {
        e.preventDefault();
        triggerSlimeBounceRef.current();
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
  }, [activeWeaponId]);

  // Toggle building preview mode
  const buildStructure = (type: 'wood_wall' | 'brick_ramp' | 'metal_bunker') => {
    if (!isAliveRef.current) return;
    setSelectedBuildType(prev => prev === type ? null : type);
  };

  // 3. Real-Time 3D Building Placement (at blueprint preview position, safely offset)
  const executeBuildStructure = async (type: 'wood_wall' | 'brick_ramp' | 'metal_bunker') => {
    if (!isAliveRef.current) return;
    const px = playerPosRef.current.x;
    const py = playerPosRef.current.y;

    const prev = previewPosRef.current;
    if (!prev.isValid) {
      soundEngine.playSpatialHit(px, py, px, py);
      addFloatingText(px, py - 30, 'NOT ENOUGH MATERIALS!', '#ef4444');
      return;
    }

    const wx = prev.x;
    const wy = prev.y;
    const rot = buildRotationRef.current;
    const id = `struct_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;

    const isPaladin = effectiveSkinDefRef.current.id === 'paladin';
    const hpMult = isPaladin ? 1.25 : 1;

    if (type === 'wood_wall') {
      if (woodRef.current < 10) return;
      woodRef.current = Math.max(0, woodRef.current - 10);
      setLocalWood(woodRef.current);
      const wallHp = Math.round(100 * hpMult);
      soundEngine.playSpatialBuild('wood_wall', wx, wy, px, py);
      spawnParticles(wx, wy, isPaladin ? '#facc15' : '#f59e0b', 'wood_chip', 8, 4);
      addFloatingText(
        wx,
        wy - 18,
        isPaladin ? `-10 🪵 Wall (${wallHp} HP Holy Bulwark!)` : `-10 🪵 Wall (${rot}°)`,
        isPaladin ? '#fde047' : '#fde68a'
      );
      if (isPaladin) flashSkinAbility('Holy Bulwark (+25% Structure HP)');

      await placeArenaStructure({
        id,
        x: wx,
        y: wy,
        type: 'wood_wall',
        hp: wallHp,
        maxHp: wallHp,
        ownerId: user.id,
        createdAt: new Date().toISOString(),
        rotation: rot
      }, { wood: 10 }, user.id);

    } else if (type === 'brick_ramp') {
      if (brickRef.current < 15) return;
      brickRef.current = Math.max(0, brickRef.current - 15);
      setLocalBrick(brickRef.current);
      const rampHp = Math.round(120 * hpMult);
      const hgUntil = Date.now() + 10000;
      highGroundUntilRef.current = hgUntil;
      setHighGroundUntil(hgUntil);
      soundEngine.playSpatialBuild('brick_ramp', wx, wy, px, py);
      spawnParticles(wx, wy, isPaladin ? '#facc15' : '#fb923c', 'stone_chip', 10, 4);
      addFloatingText(
        wx,
        wy - 22,
        isPaladin ? `HIGH GROUND +20% DMG (${rampHp} HP Bulwark!)` : `HIGH GROUND +20% DMG (${rot}°)`,
        isPaladin ? '#fde047' : '#fb923c'
      );
      if (isPaladin) flashSkinAbility('Holy Bulwark (+25% Structure HP)');

      await placeArenaStructure({
        id,
        x: wx,
        y: wy,
        type: 'brick_ramp',
        hp: rampHp,
        maxHp: rampHp,
        ownerId: user.id,
        createdAt: new Date().toISOString(),
        rotation: rot
      }, { brick: 15 }, user.id);

    } else if (type === 'metal_bunker') {
      if (metalRef.current < 15) return;
      metalRef.current = Math.max(0, metalRef.current - 15);
      setLocalMetal(metalRef.current);
      const bunkerHp = Math.round(250 * hpMult);
      const msUntil = Date.now() + 5000;
      metalShieldUntilRef.current = msUntil;
      setMetalShieldUntil(msUntil);
      soundEngine.playSpatialBuild('metal_bunker', wx, wy, px, py);
      spawnParticles(wx, wy, isPaladin ? '#facc15' : '#22d3ee', 'electric', 12, 5);
      addFloatingText(
        wx,
        wy - 22,
        isPaladin ? `HOLY BULWARK METAL (${bunkerHp} HP + Shield)` : `METAL SHIELD -50% DMG (${rot}°)`,
        isPaladin ? '#fde047' : '#38bdf8'
      );
      if (isPaladin) flashSkinAbility('Holy Bulwark (+25% Metal Fortification)');

      await placeArenaStructure({
        id,
        x: wx,
        y: wy,
        type: 'metal_bunker',
        hp: bunkerHp,
        maxHp: bunkerHp,
        ownerId: user.id,
        createdAt: new Date().toISOString(),
        rotation: rot
      }, { metal: 15 }, user.id);

      await updatePlayerPosition(user.id, {
        metalShieldActiveUntil: msUntil
      });
    }
  };

  // Slime — Viscous Form Active Spring Bounce [G]
  const triggerSlimeBounceRef = useRef<() => void>(() => {});
  const triggerSlimeBounce = async () => {
    if (!isAliveRef.current || effectiveSkinDefRef.current.id !== 'slime') return;
    const now = Date.now();
    if (now < slimeBounceCooldownUntilRef.current) return;
    slimeBounceCooldownUntilRef.current = now + 6000;
    setSlimeBounceCooldownUntil(now + 6000);

    const px = playerPosRef.current.x;
    const py = playerPosRef.current.y;
    const ang = facingAngleRef.current;
    let bounceAngle = ang;

    // Bounce along open space or ricochet off nearby scenery/building
    let targetX = px + Math.cos(ang) * 165;
    let targetY = py + Math.sin(ang) * 165;
    const hitBldg = worldDataRef.current?.buildings?.some(b =>
      getBuildingHitboxes(b).some(
        hb => targetX > hb.x && targetX < hb.x + hb.w && targetY > hb.y && targetY < hb.y + hb.h
      )
    );
    if (hitBldg || targetX < 60 || targetX > MAP_SIZE - 60 || targetY < 60 || targetY > MAP_SIZE - 60) {
      bounceAngle = ang + Math.PI * 0.75;
      targetX = Math.max(60, Math.min(MAP_SIZE - 60, px + Math.cos(bounceAngle) * 130));
      targetY = Math.max(60, Math.min(MAP_SIZE - 60, py + Math.sin(bounceAngle) * 130));
    }

    spawnParticles(px, py, '#10b981', 'spark', 14, 5);
    setPlayerCoords(targetX, targetY);
    spawnParticles(targetX, targetY, '#34d399', 'spark', 16, 6);
    soundEngine.playEatBanana();
    addFloatingText(targetX, targetY - 26, '🟢 VISCOUS BOUNCE!', '#34d399');
    flashSkinAbility('Viscous Bounce!');

    arenaPlayersRef.current.forEach(p => {
      if (p.uid !== user.id && p.isAlive && Math.hypot(p.x - targetX, p.y - targetY) < 110) {
        damageArenaPlayer(p.uid, 18, user.id).then(res => {
          if (res.killed) setKills(k => k + 1);
        });
        addFloatingText(p.x, p.y - 28, '-18 SLIME SLAM', '#10b981');
      }
    });

    await updatePlayerPosition(user.id, { x: Math.round(targetX), y: Math.round(targetY) });
  };
  triggerSlimeBounceRef.current = triggerSlimeBounce;

  // 4. Special Power Activation
  const triggerSpecialPowerRef = useRef<() => void>(() => {});
  const triggerSpecialPower = async () => {
    if (!isAliveRef.current || Date.now() < powerCooldownUntil) return;
    const px = playerPosRef.current.x;
    const py = playerPosRef.current.y;
    const ang = facingAngleRef.current;
    const skinId = effectiveSkinDefRef.current.id;
    const isWarlock = skinId === 'warlock';
    const isKnightHero = skinId === 'knight_hero';
    const maxShieldCap = isKnightHero ? 120 : 100;

    let cooldownMs = (equippedPower.stats?.cooldownSeconds || 20) * 1000;
    if (isWarlock) {
      // Warlock — Cosmic Shift: Power cooldown reduced by 25%
      cooldownMs = Math.round(cooldownMs * 0.75);
      flashSkinAbility('Cosmic Shift (-25% Cooldown)');
    }
    setPowerCooldownUntil(Date.now() + cooldownMs);

    if (equippedPower.id === 'element_shield') {
      const nextShield = Math.min(maxShieldCap, shieldRef.current + 40);
      shieldRef.current = nextShield;
      setLocalShield(nextShield);
      spawnParticles(px, py, '#38bdf8', 'electric', 15, 4);
      addFloatingText(px, py - 25, `+40 SHIELD!`, '#38bdf8');
      await updatePlayerPosition(user.id, { shield: nextShield });
    } else if (equippedPower.id === 'damage_boost') {
      const ddUntil = Date.now() + 5000;
      doubleDamageUntilRef.current = ddUntil;
      setDoubleDamageUntil(ddUntil);
      spawnParticles(px, py, '#f43f5e', 'flame', 15, 5);
      addFloatingText(px, py - 25, '2X DAMAGE ACTIVE!', '#fb7185');
    } else if (equippedPower.id === 'quantum_dash') {
      const dashDist = isWarlock ? 280 : 240;
      const newX = Math.max(60, Math.min(MAP_SIZE - 60, px + Math.cos(ang) * dashDist));
      const newY = Math.max(60, Math.min(MAP_SIZE - 60, py + Math.sin(ang) * dashDist));
      spawnParticles(px, py, '#a855f7', 'electric', 20, 6);
      setPlayerCoords(newX, newY);
      spawnParticles(newX, newY, isWarlock ? '#d946ef' : '#a855f7', 'spark', 18, 5);
      addFloatingText(newX, newY - 20, isWarlock ? '🔮 COSMIC SHIFT BLINK (-25% CD)' : 'QUANTUM DASH', '#c084fc');
      if (isWarlock) {
        arenaPlayersRef.current.forEach(p => {
          if (p.uid !== user.id && p.isAlive && Math.hypot(p.x - newX, p.y - newY) < 120) {
            damageArenaPlayer(p.uid, 20, user.id).then(res => {
              if (res.killed) setKills(k => k + 1);
            });
            addFloatingText(p.x, p.y - 30, '-20 VOID SHIFT', '#d946ef');
          }
        });
      }
      await updatePlayerPosition(user.id, { x: Math.round(newX), y: Math.round(newY) });
    } else if (equippedPower.id === 'matter_synthesizer') {
      woodRef.current += 15;
      brickRef.current += 10;
      metalRef.current += 5;
      setLocalWood(woodRef.current);
      setLocalBrick(brickRef.current);
      setLocalMetal(metalRef.current);
      spawnParticles(px, py, '#10b981', 'spark', 16, 4);
      addFloatingText(px, py - 25, '+15🪵 +10🧱 +5⚙️', '#34d399');
      await updatePlayerPosition(user.id, {
        wood: woodRef.current,
        brick: brickRef.current,
        metal: metalRef.current
      });
    }
  };
  triggerSpecialPowerRef.current = triggerSpecialPower;

  // Ref to always access latest handleFireWeapon inside event listeners
  const handleFireWeaponRef = useRef<(isAlt?: boolean) => void>(() => {});

  // 5. Fire Weapon (Primary & Alternate Fire)
  const handleFireWeapon = async (isAlt = false) => {
    if (!isAliveRef.current) return;
    const now = Date.now();
    const px = playerPosRef.current.x;
    const py = playerPosRef.current.y;
    const aimRad = facingAngleRef.current;
    const vd = viewDimsRef.current;
    const curWeapon = equippedWeaponRef.current;
    const isDoubleDamage = now < doubleDamageUntilRef.current;
    const isHighGround = now < highGroundUntilRef.current;

    const canvas = canvasRef.current;
    const rect = canvas?.getBoundingClientRect();
    const mouseCanvasX = rect ? mouseScreenPos.current.x - rect.left : vd.width / 2;
    const mouseCanvasY = rect ? mouseScreenPos.current.y - rect.top : vd.height / 2;
    const worldMouseX = Math.max(60, Math.min(MAP_SIZE - 60, mouseCanvasX + cameraRef.current.x));
    const worldMouseY = Math.max(60, Math.min(MAP_SIZE - 60, mouseCanvasY + cameraRef.current.y));

    const skinId = effectiveSkinDefRef.current.id;

    // Shadow Assassin — Shadow Blink: +18% movement speed surge immediately after weapon discharge
    if (skinId === 'shadow_assassin') {
      shadowBlinkUntilRef.current = now + 2500;
      spawnParticles(px, py, '#8b5cf6', 'smoke', 6, 3);
      flashSkinAbility('Shadow Blink (+18% Speed)');
    }

    if (isAlt) {
      // --- ALTERNATE FIRE MODE ---
      const alt = curWeapon.stats?.altFire;
      if (!alt) return;

      if (now < altFireCooldownUntil) {
        const rem = ((altFireCooldownUntil - now) / 1000).toFixed(1);
        addFloatingText(px, py - 25, `ALT-FIRE COOLDOWN (${rem}s)`, '#ef4444');
        return;
      }

      // Overlord — Cataclysmic Might: Alternate fire recharge rate doubled (50% cooldown)
      // Warlock — Cosmic Shift: Teleport alt-fire cooldown reduced by 25%
      let altCooldownMs = (alt.altCooldownSeconds || 3) * 1000;
      if (skinId === 'overlord') {
        altCooldownMs = Math.round(altCooldownMs * 0.5);
        flashSkinAbility('Cataclysmic Might (2x Alt Recharge)');
      } else if (skinId === 'warlock' && alt.altType === 'teleport') {
        altCooldownMs = Math.round(altCooldownMs * 0.75);
        flashSkinAbility('Cosmic Shift (-25% Teleport CD)');
      }
      setAltFireCooldownUntil(now + altCooldownMs);

      let altDmg = alt.altDamage || 40;
      if (isHighGround) altDmg = Math.round(altDmg * 1.2);
      if (isDoubleDamage) altDmg *= 2;

      switch (alt.altType) {
        case 'teleport': {
          const fromX = px;
          const fromY = py;
          const toX = worldMouseX;
          const toY = worldMouseY;

          spawnParticles(fromX, fromY, '#06b6d4', 'electric', 20, 6);
          spawnParticles(fromX, fromY, '#a855f7', 'spark', 15, 5);

          setPlayerCoords(toX, toY);
          cameraRef.current.x = Math.max(0, Math.min(MAP_SIZE - vd.width, toX - vd.width / 2));
          cameraRef.current.y = Math.max(0, Math.min(MAP_SIZE - vd.height, toY - vd.height / 2));

          spawnParticles(toX, toY, '#06b6d4', 'electric', 25, 6);
          spawnParticles(toX, toY, '#38bdf8', 'flame', 15, 5);
          addFloatingText(toX, toY - 28, '⚡ QUANTUM WARP!', '#22d3ee');
          soundEngine.playSpatialBuild('metal_bunker', toX, toY, toX, toY);

          arenaPlayersRef.current.forEach(p => {
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
          soundEngine.playSpatialShoot('bunsen_burner', px, py, px, py);
          addFloatingText(px, py - 25, '🔥 360° HEATWAVE!', '#f97316');
          spawnParticles(px, py, '#f97316', 'flame', 24, 6);

          const ringCount = 12;
          for (let i = 0; i < ringCount; i++) {
            const rad = (i / ringCount) * Math.PI * 2;
            projectilesRef.current.push({
              id: `alt_ring_${now}_${i}`,
              x: px + Math.cos(rad) * 20,
              y: py + Math.sin(rad) * 20,
              vx: Math.cos(rad) * 12,
              vy: Math.sin(rad) * 12,
              rangeRemaining: 260,
              damage: altDmg,
              ownerId: user.id,
              weaponId: curWeapon.id,
              color: '#f97316',
              isHighGround
            });
          }
          break;
        }

        case 'acid_pool': {
          soundEngine.playSpatialShoot('acid_pipette', px, py, px, py);
          addFloatingText(px, py - 25, '🧪 ACID SPLASH!', '#10b981');
          spawnParticles(px, py, '#10b981', 'spark', 15, 4);

          for (let i = -1; i <= 1; i++) {
            const rad = aimRad + i * 0.15;
            projectilesRef.current.push({
              id: `alt_acid_${now}_${i}`,
              x: px + Math.cos(rad) * 25,
              y: py + Math.sin(rad) * 25,
              vx: Math.cos(rad) * 14,
              vy: Math.sin(rad) * 14,
              rangeRemaining: 400,
              damage: altDmg,
              ownerId: user.id,
              weaponId: curWeapon.id,
              color: '#10b981',
              isHighGround
            });
          }
          break;
        }

        case 'freeze_blast': {
          soundEngine.playSpatialShoot('cryo_freeze_ray', px, py, px, py);
          addFloatingText(px, py - 25, '❄️ GLACIAL BLAST!', '#06b6d4');
          spawnParticles(px, py, '#06b6d4', 'spark', 18, 5);

          for (let i = -2; i <= 2; i++) {
            const rad = aimRad + i * 0.12;
            projectilesRef.current.push({
              id: `alt_freeze_${now}_${i}`,
              x: px + Math.cos(rad) * 25,
              y: py + Math.sin(rad) * 25,
              vx: Math.cos(rad) * (i === 0 ? 17 : 14),
              vy: Math.sin(rad) * (i === 0 ? 17 : 14),
              rangeRemaining: 480,
              damage: i === 0 ? altDmg : Math.round(altDmg * 0.65),
              ownerId: user.id,
              weaponId: curWeapon.id,
              color: '#38bdf8',
              isHighGround
            });
          }
          break;
        }

        case 'spread_beam': {
          soundEngine.playSpatialShoot('laser_pointer', px, py, px, py);
          addFloatingText(px, py - 25, '🔦 TRI-LASER!', '#ef4444');
          spawnParticles(px, py, '#ef4444', 'spark', 12, 5);

          [-0.26, 0, 0.26].forEach((offset, idx) => {
            const rad = aimRad + offset;
            projectilesRef.current.push({
              id: `alt_laser_${now}_${idx}`,
              x: px + Math.cos(rad) * 26,
              y: py + Math.sin(rad) * 26,
              vx: Math.cos(rad) * 24,
              vy: Math.sin(rad) * 24,
              rangeRemaining: 680,
              damage: altDmg,
              ownerId: user.id,
              weaponId: curWeapon.id,
              color: '#ef4444',
              isHighGround
            });
          });
          break;
        }

        case 'emp_burst': {
          soundEngine.playSpatialShoot('tesla_coil', px, py, px, py);
          addFloatingText(px, py - 25, '⚡ EMP PULSE NOVA!', '#38bdf8');
          spawnParticles(px, py, '#38bdf8', 'electric', 30, 7);

          arenaPlayersRef.current.forEach(p => {
            if (p.uid !== user.id && p.isAlive) {
              const d = Math.hypot(p.x - px, p.y - py);
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
          soundEngine.playSpatialShoot('centrifuge_sonic_blaster', px, py, px, py);
          const asUntil = now + 2800;
          acousticShieldUntilRef.current = asUntil;
          setAcousticShieldUntil(asUntil);
          addFloatingText(px, py - 25, '🔊 ACOUSTIC DEFLECTOR (2.8s)', '#eab308');
          spawnParticles(px, py, '#eab308', 'spark', 25, 6);

          arenaPlayersRef.current.forEach(p => {
            if (p.uid !== user.id && p.isAlive) {
              const d = Math.hypot(p.x - px, p.y - py);
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
          soundEngine.playSpatialShoot('particle_accelerator', px, py, px, py);
          addFloatingText(px, py - 25, '🌀 GRAVITATIONAL VORTEX!', '#a855f7');
          spawnParticles(px, py, '#a855f7', 'electric', 20, 6);

          const targetDist = Math.hypot(worldMouseX - px, worldMouseY - py);
          const aimAngle = Math.atan2(worldMouseY - py, worldMouseX - px);
          projectilesRef.current.push({
            id: `alt_vortex_${now}`,
            x: px + Math.cos(aimAngle) * 25,
            y: py + Math.sin(aimAngle) * 25,
            vx: Math.cos(aimAngle) * 16,
            vy: Math.sin(aimAngle) * 16,
            rangeRemaining: Math.min(650, targetDist),
            damage: altDmg,
            ownerId: user.id,
            weaponId: curWeapon.id,
            color: '#a855f7',
            isHighGround
          });

          arenaPlayersRef.current.forEach(p => {
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
          soundEngine.playSpatialShoot('biohazard_railgun', px, py, px, py);
          addFloatingText(px, py - 25, '☣️ CLUSTER CANISTERS!', '#84cc16');
          spawnParticles(px, py, '#84cc16', 'smoke', 20, 5);

          [-0.2, 0, 0.2].forEach((offset, idx) => {
            const rad = aimRad + offset;
            projectilesRef.current.push({
              id: `alt_cluster_${now}_${idx}`,
              x: px + Math.cos(rad) * 26,
              y: py + Math.sin(rad) * 26,
              vx: Math.cos(rad) * 18,
              vy: Math.sin(rad) * 18,
              rangeRemaining: 600,
              damage: altDmg,
              ownerId: user.id,
              weaponId: curWeapon.id,
              color: '#84cc16',
              isHighGround
            });
          });
          break;
        }

        case 'orbital_strike': {
          soundEngine.playSpatialShoot('antimatter_annihilator', px, py, px, py);
          addFloatingText(worldMouseX, worldMouseY - 35, '⚠️ ORBITAL LOCK!', '#f43f5e');
          spawnParticles(worldMouseX, worldMouseY, '#f43f5e', 'spark', 15, 4);

          setTimeout(() => {
            spawnParticles(worldMouseX, worldMouseY, '#f43f5e', 'flame', 35, 8);
            spawnParticles(worldMouseX, worldMouseY, '#fb7185', 'electric', 25, 7);
            addFloatingText(worldMouseX, worldMouseY - 30, '💥 130 ANNIHILATION!', '#fda4af');
            soundEngine.playSpatialBuild('metal_bunker', worldMouseX, worldMouseY, playerPosRef.current.x, playerPosRef.current.y);

            arenaPlayersRef.current.forEach(p => {
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
    const cooldownMs = (curWeapon.stats?.cooldownSeconds || 0.4) * 1000;
    if (now - lastShotTimeRef.current < cooldownMs) return;
    lastShotTimeRef.current = now;
    setLastShotTime(now);

    const baseDamage = curWeapon.stats?.damage || 20;
    let finalDamage = baseDamage;
    if (isHighGround) finalDamage = Math.round(finalDamage * 1.2);
    if (isDoubleDamage) finalDamage = finalDamage * 2;

    // Elite Archer — Wind Walker: Firing while sprinting/moving boosts precision, speed (+20%), and damage (+20%)
    const isWindWalkerActive = skinId === 'elitearcher' && isLocallyMovingRef.current;
    if (isWindWalkerActive) {
      finalDamage = Math.round(finalDamage * 1.2);
      flashSkinAbility('Wind Walker (+20% Sprint Precision DMG)');
    }

    const baseSpeed = curWeapon.id === 'laser_pointer' ? 24 : (curWeapon.id === 'biohazard_railgun' ? 22 : 18);
    // Archer — Eagle Eye: +35% projectile velocity & +30% range
    const isEagleEye = skinId === 'archer_hero';
    const speed = isEagleEye
      ? baseSpeed * 1.35
      : isWindWalkerActive
        ? baseSpeed * 1.2
        : baseSpeed;
    const projRange = isEagleEye
      ? Math.round((curWeapon.stats?.range || 520) * 1.3)
      : (curWeapon.stats?.range || 520);
    const beamColor = skinId === 'dragon_slayer'
      ? '#f97316'
      : isWindWalkerActive
        ? '#2dd4bf'
        : (curWeapon.stats?.beamColor || '#f97316');

    const proj: Projectile = {
      id: `proj_${now}_${Math.random()}`,
      x: px + Math.cos(aimRad) * 26,
      y: py + Math.sin(aimRad) * 26,
      vx: Math.cos(aimRad) * speed,
      vy: Math.sin(aimRad) * speed,
      rangeRemaining: projRange,
      damage: finalDamage,
      ownerId: user.id,
      weaponId: curWeapon.id,
      color: beamColor,
      isHighGround,
      isDragonBlood: skinId === 'dragon_slayer',
      isWindWalker: isWindWalkerActive
    };

    projectilesRef.current.push(proj);
    soundEngine.playSpatialShoot(curWeapon.id, px, py, px, py);

    // Muzzle flash
    spawnParticles(
      px + Math.cos(aimRad) * 28,
      py + Math.sin(aimRad) * 28,
      beamColor,
      skinId === 'dragon_slayer' ? 'flame' : 'spark',
      4,
      3
    );
  };

  handleFireWeaponRef.current = handleFireWeapon;

  // 6. MAIN 60FPS GAME LOOP WITH Y-SORTING DEPTH ENGINE & VIEWPORT CULLING
  useEffect(() => {
    let animationFrameId: number;
    let lastPerf = performance.now();
    let lastHudSync = 0;
    let lastPositionSync = 0;
    let lastSyncedX = 0;
    let lastSyncedY = 0;
    let lastSyncedAngle = 0;

    const isPositionBlocked = (testX: number, testY: number, moveDx: number, moveDy: number): boolean => {
      const collRadius = 18;

      // Prop base collision
      if (worldDataRef.current) {
        for (const sc of worldDataRef.current.scenery) {
          if (sc.hp > 0 && sc.footprintRadius > 0) {
            const dist = Math.hypot(testX - sc.x, testY - sc.y);
            if (dist < collRadius + sc.footprintRadius * 0.7) {
              return true;
            }
          }
        }
      }

      // Building solid hitbox collision (Roof and walls block player movement; compound wings supported)
      if (worldDataRef.current?.buildings) {
        for (const bldg of worldDataRef.current.buildings) {
          for (const hb of getBuildingHitboxes(bldg)) {
            if (
              testX + collRadius > hb.x &&
              testX - collRadius < hb.x + hb.w &&
              testY + collRadius > hb.y &&
              testY - collRadius < hb.y + hb.h
            ) {
              const dw = bldg.doorway;
              const isAtDoorX = testX >= dw.x && testX <= dw.x + dw.w;
              const isAtDoorY = testY >= dw.y - 12 && testY <= dw.y + dw.h + 12;
              if (isAtDoorX && isAtDoorY) {
                const roofLimitY = bldg.hitbox.y + WORLD_TILE_SIZE * (bldg.height >= 4 ? 2 : 1);
                if (testY < roofLimitY) {
                  return true;
                }
                continue;
              }
              return true;
            }
          }
        }
      }

      // Structure collision with One-Way Ramp Access
      for (const st of structuresRef.current) {
        const dist = Math.hypot(testX - st.x, testY - st.y);
        if (dist < collRadius + 18) {
          if (st.type === 'brick_ramp') {
            const rot = st.rotation || 0;
            const rad = ((rot - 90) * Math.PI) / 180;
            const nx = Math.cos(rad);
            const ny = Math.sin(rad);

            const moveMag = Math.hypot(moveDx, moveDy);
            if (moveMag > 0.0001) {
              const mdx = moveDx / moveMag;
              const mdy = moveDy / moveMag;
              const alignment = mdx * nx + mdy * ny;

              if (alignment >= -0.2) {
                const hgUntil = Date.now() + 3500;
                highGroundUntilRef.current = hgUntil;
                setHighGroundUntil(hgUntil);
                continue;
              }
            }
            return true;
          } else {
            return true;
          }
        }
      }

      return false;
    };

    const gameLoop = () => {
      const canvas = canvasRef.current;
      if (!canvas) {
        animationFrameId = requestAnimationFrame(gameLoop);
        return;
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        animationFrameId = requestAnimationFrame(gameLoop);
        return;
      }

      const nowPerf = performance.now();
      const dt = Math.min(0.05, Math.max(0.001, (nowPerf - lastPerf) / 1000));
      lastPerf = nowPerf;
      const frameScale = dt * 60;

      const now = Date.now();
      const viewW = viewDimsRef.current.width;
      const viewH = viewDimsRef.current.height;
      const playerAlive = isAliveRef.current;

      let px = playerPosRef.current.x;
      let py = playerPosRef.current.y;
      const activeSkinIdLoop = effectiveSkinDefRef.current.id;
      const isRogueStealth =
        activeSkinIdLoop === 'rogue' &&
        now - lastShotTimeRef.current > 1500 &&
        now - lastDamageTimeRef.current > 1500;
      const isShadowBlinking = activeSkinIdLoop === 'shadow_assassin' && now < shadowBlinkUntilRef.current;
      const isSlime = activeSkinIdLoop === 'slime';
      const maxShieldCapLoop = activeSkinIdLoop === 'knight_hero' ? 120 : 100;
      const loopSpeedMult = (isRogueStealth ? 1.15 : 1) * (isShadowBlinking ? 1.18 : 1);

      const speedPxPerSec = getSkinMovementSpeedPxPerSec(
        effectiveSkinDefRef.current,
        now < speedBoostUntilRef.current,
        loopSpeedMult
      );

      // --- 1. LOCAL PLAYER SMOOTH DELTA-TIME MOVEMENT & AXIS-SLIDING COLLISION ---
      if (playerAlive) {
        let dirX = 0;
        let dirY = 0;

        if (keysPressed.current['w'] || keysPressed.current['arrowup']) dirY -= 1;
        if (keysPressed.current['s'] || keysPressed.current['arrowdown']) dirY += 1;
        if (keysPressed.current['a'] || keysPressed.current['arrowleft']) dirX -= 1;
        if (keysPressed.current['d'] || keysPressed.current['arrowright']) dirX += 1;

        if (dirX !== 0 && dirY !== 0) {
          dirX *= 0.7071;
          dirY *= 0.7071;
        }

        if (dirX !== 0 || dirY !== 0) {
          const stepX = dirX * speedPxPerSec * dt;
          const stepY = dirY * speedPxPerSec * dt;
          let moved = false;

          // Independent X axis slide
          if (stepX !== 0) {
            const candX = Math.max(35, Math.min(MAP_SIZE - 35, px + stepX));
            if (!isPositionBlocked(candX, py, stepX, 0)) {
              px = candX;
              moved = true;
            }
          }

          // Independent Y axis slide
          if (stepY !== 0) {
            const candY = Math.max(35, Math.min(MAP_SIZE - 35, py + stepY));
            if (!isPositionBlocked(px, candY, 0, stepY)) {
              py = candY;
              moved = true;
            }
          }

          // Slime — Viscous Form: smooth perpendicular obstacle slip when pressing straight into an edge
          if (!moved && isSlime) {
            const slipStep = speedPxPerSec * dt * 0.85;
            if (Math.abs(dirX) >= Math.abs(dirY)) {
              for (const sy of [-slipStep, slipStep]) {
                const candY = Math.max(35, Math.min(MAP_SIZE - 35, py + sy));
                if (!isPositionBlocked(px, candY, 0, sy)) {
                  py = candY;
                  moved = true;
                  break;
                }
              }
            } else {
              for (const sx of [-slipStep, slipStep]) {
                const candX = Math.max(35, Math.min(MAP_SIZE - 35, px + sx));
                if (!isPositionBlocked(candX, py, sx, 0)) {
                  px = candX;
                  moved = true;
                  break;
                }
              }
            }
          }

          playerPosRef.current.x = px;
          playerPosRef.current.y = py;
          isLocallyMovingRef.current = moved;

          if (moved) {
            walkCycleRef.current = (walkCycleRef.current + dt * (speedPxPerSec / 28)) % (Math.PI * 2);

            const footstepIntervalMs = Math.max(175, Math.min(430, 440 - speedPxPerSec * 0.52));
            if (now - lastLocalFootstepTime.current > footstepIntervalMs) {
              lastLocalFootstepTime.current = now;
              const tileCol = Math.min(TILES_COUNT - 1, Math.max(0, Math.floor(px / WORLD_TILE_SIZE)));
              const tileRow = Math.min(TILES_COUNT - 1, Math.max(0, Math.floor(py / WORLD_TILE_SIZE)));
              const surface = worldDataRef.current?.tiles[tileRow]?.[tileCol]?.surface || 'grass';
              soundEngine.playSpatialFootstep(px, py, px, py, surface, isRogueStealth ? 0.2 : 1);
            }

            if (isShadowBlinking && Math.random() < 0.55 * frameScale) {
              spawnParticles(px - dirX * 10, py - dirY * 10, '#8b5cf6', 'smoke', 1, 1.5);
            } else if (Math.random() < 0.22 * frameScale) {
              spawnParticles(px - dirX * 10, py - dirY * 10, '#64748b', 'dust', 1, 1);
            }
          }
        } else {
          isLocallyMovingRef.current = false;
        }

        // Unstuck safeguard: ensure player is never trapped inside building walls/roofs
        if (worldDataRef.current?.buildings) {
          for (const bldg of worldDataRef.current.buildings) {
            const insideAnyWing = getBuildingHitboxes(bldg).some(
              hb => px > hb.x + 10 && px < hb.x + hb.w - 10 && py > hb.y + 10 && py < hb.y + hb.h - 10
            );
            if (insideAnyWing) {
              const dw = bldg.doorway;
              const isAtDoor = px >= dw.x && px <= dw.x + dw.w && py >= dw.y - 10 && py <= dw.y + dw.h + 10;
              if (!isAtDoor) {
                px = dw.x + dw.w / 2;
                py = dw.y + dw.h + 24;
                playerPosRef.current.x = px;
                playerPosRef.current.y = py;
                break;
              }
            }
          }
        }

        // Unstuck safeguard: ensure player is never trapped inside walls or bunkers (exclude ramps!)
        for (const st of structuresRef.current) {
          if (st.type === 'brick_ramp') continue;
          const dist = Math.hypot(px - st.x, py - st.y);
          const minSafeDist = 38;
          if (dist < minSafeDist) {
            const pushAngle = dist > 0.05 ? Math.atan2(py - st.y, px - st.x) : facingAngleRef.current;
            const pushDist = minSafeDist - dist + 4;
            px = Math.max(35, Math.min(MAP_SIZE - 35, px + Math.cos(pushAngle) * pushDist));
            py = Math.max(35, Math.min(MAP_SIZE - 35, py + Math.sin(pushAngle) * pushDist));
            playerPosRef.current.x = px;
            playerPosRef.current.y = py;
            break;
          }
        }

        // Water walking ripple particles
        const curCol = Math.min(TILES_COUNT - 1, Math.max(0, Math.floor(px / WORLD_TILE_SIZE)));
        const curRow = Math.min(TILES_COUNT - 1, Math.max(0, Math.floor(py / WORLD_TILE_SIZE)));
        if (worldDataRef.current?.tiles[curRow]?.[curCol]?.isWater && Math.random() < 0.2 * frameScale) {
          spawnParticles(px, py, '#38bdf8', 'spark', 2, 1.2);
        }

        // Aim angle towards mouse in world space
        const rect = canvas.getBoundingClientRect();
        const mouseCanvasX = mouseScreenPos.current.x - rect.left;
        const mouseCanvasY = mouseScreenPos.current.y - rect.top;
        const worldMouseX = mouseCanvasX + cameraRef.current.x;
        const worldMouseY = mouseCanvasY + cameraRef.current.y;

        const angle = Math.atan2(worldMouseY - py, worldMouseX - px);
        facingAngleRef.current = angle;

        // Ground Loot Pickup Detection
        if (worldDataRef.current) {
          worldDataRef.current.groundLoot.forEach(loot => {
            if (!loot.isCollected) {
              const dist = Math.hypot(px - loot.x, py - loot.y);
              if (dist < 28) {
                loot.isCollected = true;
                soundEngine.playEatBanana();

                if (loot.type === 'banana') {
                  const nextHp = Math.min(100, hpRef.current + (loot.healHp || 25));
                  hpRef.current = nextHp;
                  setLocalHp(nextHp);
                  addFloatingText(px, py - 25, '+25 HP Banana Snack! 🍌', '#facc15');
                  spawnParticles(px, py, '#facc15', 'banana_peel', 6, 2);
                } else if (loot.type === 'shield_cell') {
                  const nextSh = Math.min(maxShieldCapLoop, shieldRef.current + (loot.grantShield || 30));
                  shieldRef.current = nextSh;
                  setLocalShield(nextSh);
                  addFloatingText(px, py - 25, '+30 Shield Battery! ⚡', '#22d3ee');
                  spawnParticles(px, py, '#22d3ee', 'electric', 6, 2);
                } else if (loot.type === 'ammo_box') {
                  woodRef.current += 15;
                  brickRef.current += 10;
                  metalRef.current += 5;
                  setLocalWood(woodRef.current);
                  setLocalBrick(brickRef.current);
                  setLocalMetal(metalRef.current);
                  addFloatingText(px, py - 25, '+15🪵 +10🧱 +5⚙️ Crate', '#4ade80');
                } else {
                  const nextHp = Math.min(100, hpRef.current + 15);
                  const nextSh = Math.min(maxShieldCapLoop, shieldRef.current + 15);
                  hpRef.current = nextHp;
                  shieldRef.current = nextSh;
                  speedBoostUntilRef.current = now + 6000;
                  setLocalHp(nextHp);
                  setLocalShield(nextSh);
                  addFloatingText(px, py - 25, '+15 HP, Shield & +25% Speed (6s)! ⚡', '#c084fc');
                  spawnParticles(px, py, '#c084fc', 'electric', 8, 2.5);
                }
              }
            }
          });
        }

        // Sync position to Firestore throttled to preserve Firestore quota (750ms + distance threshold)
        const distMoved = Math.hypot(px - lastSyncedX, py - lastSyncedY);
        const angleDiff = Math.abs(angle - lastSyncedAngle);
        if (now - lastPositionSync > 750 && (distMoved > 16 || angleDiff > 0.35 || now - lastPositionSync > 3000)) {
          lastPositionSync = now;
          lastSyncedX = px;
          lastSyncedY = py;
          lastSyncedAngle = angle;
          updatePlayerPosition(user.id, {
            x: Math.round(px),
            y: Math.round(py),
            angle: Number(angle.toFixed(2))
          }).catch(() => {});
        }
      } else {
        isLocallyMovingRef.current = false;
      }

      // --- 2. REMOTE PLAYERS SPATIAL FOOTSTEPS ---
      arenaPlayersRef.current.forEach(p => {
        if (p.uid !== user.id && p.isAlive) {
          const prevPos = prevEnemyPositions.current[p.uid];
          if (prevPos) {
            const movedDist = Math.hypot(p.x - prevPos.x, p.y - prevPos.y);
            if (movedDist > 3.5 && now - prevPos.lastStepTime > 320) {
              prevPos.lastStepTime = now;
              const enemyTileCol = Math.min(TILES_COUNT - 1, Math.max(0, Math.floor(p.x / WORLD_TILE_SIZE)));
              const enemyTileRow = Math.min(TILES_COUNT - 1, Math.max(0, Math.floor(p.y / WORLD_TILE_SIZE)));
              const enemySurface = worldDataRef.current?.tiles[enemyTileRow]?.[enemyTileCol]?.surface || 'grass';
              soundEngine.playSpatialFootstep(p.x, p.y, px, py, enemySurface);
            }
            prevPos.x = p.x;
            prevPos.y = p.y;
          } else {
            prevEnemyPositions.current[p.uid] = { x: p.x, y: p.y, lastStepTime: now };
          }
        }
      });

      // --- 3. SMOOTH FRAME-RATE-INDEPENDENT CAMERA TRACKING ---
      const targetCamX = px - viewW / 2;
      const targetCamY = py - viewH / 2;
      const camLerp = 1 - Math.exp(-14 * dt);
      cameraRef.current.x += (targetCamX - cameraRef.current.x) * camLerp;
      cameraRef.current.y += (targetCamY - cameraRef.current.y) * camLerp;

      cameraRef.current.x = Math.max(0, Math.min(MAP_SIZE - viewW, cameraRef.current.x));
      cameraRef.current.y = Math.max(0, Math.min(MAP_SIZE - viewH, cameraRef.current.y));

      const camX = cameraRef.current.x;
      const camY = cameraRef.current.y;

      // --- 4. 10-MINUTE SHRINKING STORM CIRCLE WITH 10S-PER-MINUTE SURGE & RANDOM CENTER ---
      const bState = battleStateRef.current;
      const isMatchActive = !bState || bState.status === 'IN_PROGRESS';
      const elapsedSec = isMatchActive ? Math.max(0, (now - matchStartTimeRef.current) / 1000) : 0;
      const storm = calculateStormState(elapsedSec, targetFinalCenterRef.current);
      stormCenter.current = storm.center;
      currentStormRadiusRef.current = storm.radius;

      if (storm.isSurging && !wasSurgingRef.current && isMatchActive) {
        soundEngine.playStormSurgeAlert();
      }
      wasSurgingRef.current = storm.isSurging;
      soundEngine.updateMusicTension(storm.progress, storm.isSurging && isMatchActive);

      // Throttled HUD & Minimap React State Sync (~120ms so canvas loop stays 60fps butter-smooth)
      if (now - lastHudSync >= 120) {
        lastHudSync = now;
        setLocalX(Math.round(px));
        setLocalY(Math.round(py));
        setFacingAngle(facingAngleRef.current);
        setWalkCycle(walkCycleRef.current);
        setMatchElapsedSeconds(elapsedSec);
        setStormRadius(storm.radius);
        setIsSurgeActive(storm.isSurging && isMatchActive);
      }

      // Storm Damage Outside Eye (Dark Knight reduces storm damage by 50%; Skeleton Warrior Brittle Guard saves fatal hit)
      const distFromCenter = Math.hypot(px - stormCenter.current.x, py - stormCenter.current.y);
      const isOutsideEye = distFromCenter > storm.radius;
      if (isOutsideEye && playerAlive && isMatchActive && now >= brittleInvulnUntilRef.current) {
        if (now - lastStormDamageTimeRef.current >= 1000) {
          lastStormDamageTimeRef.current = now;
          soundEngine.playSpatialHit(px, py, px, py);
          const isDarkKnight = activeSkinIdLoop === 'dark_knight';
          const stormHit = isDarkKnight ? 4 : 8;
          addFloatingText(
            px,
            py - 32,
            isDarkKnight ? '⚔️ -4 STORM (HEAVY ARMOR)' : '⚡ -8 STORM DAMAGE',
            isDarkKnight ? '#94a3b8' : '#c084fc'
          );
          if (isDarkKnight) flashSkinAbility('Heavy Armor (-50% Storm DMG)');

          let nextHp = Math.max(0, hpRef.current - stormHit);
          if (nextHp <= 0 && activeSkinIdLoop === 'skeleton_warrior' && now >= brittleGuardCooldownUntilRef.current) {
            nextHp = 20;
            brittleGuardCooldownUntilRef.current = now + 25000;
            brittleInvulnUntilRef.current = now + 1500;
            addFloatingText(px, py - 42, '💀 BRITTLE GUARD SAVED YOU!', '#f59e0b');
            spawnParticles(px, py, '#e7e5e4', 'stone_chip', 18, 5);
            flashSkinAbility('Brittle Guard (20 HP Save)');
          }

          hpRef.current = nextHp;
          setLocalHp(nextHp);
          if (nextHp <= 0) {
            isAliveRef.current = false;
            setIsAlive(false);
          }
          damageArenaPlayer(user.id, 8, undefined, true).then(res => {
            if (res.killed && !(activeSkinIdLoop === 'skeleton_warrior' && res.brittleGuardTriggered)) {
              isAliveRef.current = false;
              setIsAlive(false);
            }
          });
        }
      }

      // --- 4B. SKIN PASSIVE AURAS & PERIODIC EFFECTS ---
      if (playerAlive) {
        // White Mage — Aura of Restoration: +5 Shield & +3 HP/sec near water tiles (3-tile radius)
        if (activeSkinIdLoop === 'white_mage' && now - lastRiverHealAtRef.current >= 1000) {
          const pCol = Math.min(TILES_COUNT - 1, Math.max(0, Math.floor(px / WORLD_TILE_SIZE)));
          const pRow = Math.min(TILES_COUNT - 1, Math.max(0, Math.floor(py / WORLD_TILE_SIZE)));
          let nearWater = false;
          for (let dr = -3; dr <= 3 && !nearWater; dr++) {
            for (let dc = -3; dc <= 3 && !nearWater; dc++) {
              if (worldDataRef.current?.tiles[pRow + dr]?.[pCol + dc]?.isWater) {
                nearWater = true;
              }
            }
          }
          if (nearWater) {
            lastRiverHealAtRef.current = now;
            const prevHp = hpRef.current;
            const prevSh = shieldRef.current;
            const nextHp = Math.min(100, prevHp + 3);
            const nextSh = Math.min(maxShieldCapLoop, prevSh + 5);
            if (nextHp > prevHp || nextSh > prevSh) {
              hpRef.current = nextHp;
              shieldRef.current = nextSh;
              setLocalHp(nextHp);
              setLocalShield(nextSh);
              spawnParticles(px, py, '#fbbf24', 'spark', 7, 2.5);
              addFloatingText(px, py - 32, '✨ +3HP +5🛡️ Restoration', '#fde047');
              flashSkinAbility('Aura of Restoration (Near Water)');
              updatePlayerPosition(user.id, { hp: nextHp, shield: nextSh }).catch(() => {});
            }
          }
        }

        // Bat — Echolocation: Sonar pulse every 1.5s revealing enemies within 950px
        if (activeSkinIdLoop === 'bat' && now - lastEcholocationAtRef.current >= 1500) {
          lastEcholocationAtRef.current = now;
          echolocationRingsRef.current.push({ x: px, y: py, startedAt: now, maxRadius: 420 });
          const detectedEnemies = arenaPlayersRef.current.filter(
            p => p.uid !== user.id && p.isAlive && Math.hypot(p.x - px, p.y - py) <= 950
          );
          if (detectedEnemies.length > 0) {
            soundEngine.playSonarPing();
            flashSkinAbility(`Echolocation (${detectedEnemies.length} detected)`);
          }
        }
        echolocationRingsRef.current = echolocationRingsRef.current.filter(r => now - r.startedAt < 1100);

        // Overlord — Cataclysmic Might: 140px Storm Eye aura deals 6 dmg/sec to nearby enemies
        if (activeSkinIdLoop === 'overlord' && now - lastCataclysmAtRef.current >= 1000) {
          const nearbyTargets = arenaPlayersRef.current.filter(
            p => p.uid !== user.id && p.isAlive && Math.hypot(p.x - px, p.y - py) <= 140
          );
          if (nearbyTargets.length > 0) {
            lastCataclysmAtRef.current = now;
            spawnParticles(px, py, '#dc2626', 'flame', 10, 4);
            nearbyTargets.forEach(target => {
              addFloatingText(target.x, target.y - 30, '-6🔥 Cataclysm', '#fb7185');
              spawnParticles(target.x, target.y, '#dc2626', 'spark', 6, 3);
              damageArenaPlayer(target.uid, 6, user.id).then(res => {
                if (res.killed) {
                  setKills(prev => prev + 1);
                  addFloatingText(target.x, target.y - 46, 'ELIMINATED! 💀', '#fbbf24');
                }
              });
            });
          }
        }
      }

      // Necromancer — Soul Harvester DoT burn ticks
      if (soulBurnsRef.current.length > 0) {
        const remainingBurns: typeof soulBurnsRef.current = [];
        for (const burn of soulBurnsRef.current) {
          if (now >= burn.nextTickAt) {
            const target = arenaPlayersRef.current.find(p => p.uid === burn.targetUid && p.isAlive);
            if (target) {
              spawnParticles(target.x, target.y, '#06b6d4', 'flame', 6, 2.5);
              addFloatingText(target.x, target.y - 28, `-${burn.damagePerTick}🔥 SOUL BURN`, '#22d3ee');
              damageArenaPlayer(target.uid, burn.damagePerTick, user.id).then(res => {
                if (res.killed) {
                  setKills(prev => prev + 1);
                  addFloatingText(target.x, target.y - 46, 'SOUL HARVESTED! 💀', '#22d3ee');
                }
              });
            }
            if (burn.ticksRemaining > 1) {
              remainingBurns.push({
                ...burn,
                ticksRemaining: burn.ticksRemaining - 1,
                nextTickAt: now + 600
              });
            }
          } else {
            remainingBurns.push(burn);
          }
        }
        soulBurnsRef.current = remainingBurns;
      }

      // --- 5. SUPPLY CRATE COLLISION ---
      cratesRef.current.forEach(crate => {
        if (!crate.isClaimed && playerAlive) {
          const distToCrate = Math.hypot(px - crate.x, py - crate.y);
          if (distToCrate < 34 && !activeCrateModalRef.current) {
            activeCrateModalRef.current = crate;
            setActiveCrateModal(crate);
            setCrateQuestionTimer(3);
            setCrateFeedback(null);
          }
        }
      });

      // --- 6. SIMULATE PROJECTILES ---
      const activeProjectiles: Projectile[] = [];

      projectilesRef.current.forEach(p => {
        p.x += p.vx * frameScale;
        p.y += p.vy * frameScale;
        p.rangeRemaining -= Math.hypot(p.vx, p.vy) * frameScale;

        // Acoustic Deflector Shield active on local player: deflect incoming enemy projectiles!
        if (now < acousticShieldUntilRef.current && p.ownerId !== user.id) {
          const distToPlayer = Math.hypot(p.x - px, p.y - py);
          if (distToPlayer < 65) {
            p.vx = -p.vx * 1.25;
            p.vy = -p.vy * 1.25;
            p.ownerId = user.id;
            p.color = '#eab308';
            spawnParticles(p.x, p.y, '#eab308', 'electric', 10, 4);
            soundEngine.playSpatialHit(p.x, p.y, px, py);
            addFloatingText(px, py - 26, 'DEFLECTED! 🛡️', '#eab308');
          }
        }

        let hit = false;

        // Collision with building walls and roofs
        if (worldDataRef.current?.buildings) {
          for (const bldg of worldDataRef.current.buildings) {
            const hitWing = getBuildingHitboxes(bldg).some(
              hb => p.x >= hb.x && p.x <= hb.x + hb.w && p.y >= hb.y && p.y <= hb.y + hb.h
            );
            if (hitWing) {
              hit = true;
              soundEngine.playSpatialHit(p.x, p.y, px, py);
              spawnParticles(p.x, p.y, '#94a3b8', 'stone_chip', 5, 2.5);
              break;
            }
          }
        }

        // Dragon's Blood — Dragon Slayer projectiles passing within 30px of an unclaimed Supply Crate trigger a fiery ignition blast
        if (p.isDragonBlood && p.ownerId === user.id) {
          for (const cr of cratesRef.current) {
            if (!cr.isClaimed && Math.hypot(p.x - cr.x, p.y - cr.y) < 30) {
              const lastIgnite = crateIgniteCooldownRef.current[cr.id] || 0;
              if (now - lastIgnite > 1200) {
                crateIgniteCooldownRef.current[cr.id] = now;
                hit = true;
                spawnParticles(cr.x, cr.y, '#f97316', 'flame', 22, 6);
                addFloatingText(cr.x, cr.y - 30, '🐉🔥 CRATE IGNITION!', '#fb923c');
                soundEngine.playSpatialHit(cr.x, cr.y, px, py);
                flashSkinAbility("Dragon's Blood (Crate Blast)");
                arenaPlayersRef.current.forEach(en => {
                  if (en.uid !== user.id && en.isAlive && Math.hypot(en.x - cr.x, en.y - cr.y) < 120) {
                    damageArenaPlayer(en.uid, 28, user.id).then(res => {
                      if (res.killed) {
                        setKills(prev => prev + 1);
                        addFloatingText(en.x, en.y - 48, 'ELIMINATED! 💀', '#fbbf24');
                      }
                    });
                    addFloatingText(en.x, en.y - 28, '-28 🔥 BLAST', '#f97316');
                  }
                });
                break;
              }
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
                const propDmg = p.isDragonBlood ? p.damage * 2 : p.damage;
                sc.hp -= propDmg;
                soundEngine.playSpatialHit(p.x, p.y, px, py);

                if (sc.materialDrop === 'wood') {
                  spawnParticles(p.x, p.y, '#f59e0b', 'wood_chip', 6, 3);
                } else if (sc.materialDrop === 'brick') {
                  spawnParticles(p.x, p.y, '#fb923c', 'stone_chip', 6, 3);
                } else {
                  spawnParticles(p.x, p.y, '#38bdf8', 'spark', 6, 4);
                }

                if (sc.hp <= 0 && p.ownerId === user.id) {
                  if (sc.materialDrop === 'wood') {
                    woodRef.current += sc.dropAmount;
                  }
                  if (sc.materialDrop === 'brick') {
                    brickRef.current += sc.dropAmount;
                  }
                  if (sc.materialDrop === 'metal') {
                    metalRef.current += sc.dropAmount;
                  }
                  if (activeSkinIdLoop === 'goblin') {
                    woodRef.current += 3;
                    brickRef.current += 1;
                    addFloatingText(sc.x, sc.y - 36, '👺 +3🪵 +1🧱 Snatched!', '#4ade80');
                    flashSkinAbility('Gold Snatcher (Loot Bonus)');
                  }
                  setLocalWood(woodRef.current);
                  setLocalBrick(brickRef.current);
                  setLocalMetal(metalRef.current);
                  addFloatingText(sc.x, sc.y - 20, `+${sc.dropAmount} ${sc.materialDrop.toUpperCase()}`, '#4ade80');
                }
                break;
              }
            }
          }
        }

        // Collision with structures
        if (!hit) {
          for (const st of structuresRef.current) {
            const distToStruct = Math.hypot(p.x - st.x, p.y - st.y);
            if (distToStruct < 28) {
              if (p.isHighGround && st.type === 'wood_wall') continue;
              hit = true;
              const structDmg = p.isDragonBlood ? p.damage * 2 : p.damage;
              damageArenaStructure(st.id, structDmg).then(res => {
                if (res.destroyed && p.ownerId === user.id && activeSkinIdLoop === 'goblin') {
                  woodRef.current += 8;
                  brickRef.current += 4;
                  metalRef.current += 2;
                  setLocalWood(woodRef.current);
                  setLocalBrick(brickRef.current);
                  setLocalMetal(metalRef.current);
                  addFloatingText(st.x, st.y - 26, '👺 +8🪵 +4🧱 +2⚙️ SNATCHED!', '#4ade80');
                  flashSkinAbility('Gold Snatcher (Structure Loot!)');
                }
              });
              soundEngine.playSpatialHit(p.x, p.y, px, py);
              spawnParticles(p.x, p.y, p.isDragonBlood ? '#f97316' : '#94a3b8', p.isDragonBlood ? 'flame' : 'stone_chip', 6, 3);
              break;
            }
          }
        }

        // Collision with other players
        if (!hit) {
          for (const enemy of arenaPlayersRef.current) {
            if (enemy.uid !== p.ownerId && enemy.isAlive) {
              const distToEnemy = Math.hypot(p.x - enemy.x, p.y - enemy.y);
              if (distToEnemy < 24) {
                hit = true;
                soundEngine.playSpatialHit(enemy.x, enemy.y, px, py);
                spawnParticles(enemy.x, enemy.y, p.isDragonBlood ? '#f97316' : '#ef4444', p.isDragonBlood ? 'flame' : 'spark', 8, 4);
                addFloatingText(enemy.x, enemy.y - 32, `-${p.damage}`, '#ef4444');

                // Dragon's Blood — Flame splash 12 dmg to other nearby enemies within 95px
                if (p.isDragonBlood && p.ownerId === user.id) {
                  spawnParticles(enemy.x, enemy.y, '#f97316', 'flame', 14, 5);
                  arenaPlayersRef.current.forEach(other => {
                    if (other.uid !== enemy.uid && other.uid !== user.id && other.isAlive && Math.hypot(other.x - enemy.x, other.y - enemy.y) < 95) {
                      damageArenaPlayer(other.uid, 12, user.id).then(r => {
                        if (r.killed) setKills(prev => prev + 1);
                      });
                      addFloatingText(other.x, other.y - 28, '-12🔥 SPLASH', '#fb923c');
                    }
                  });
                }

                // Cultist — Dark Siphon (+5 HP on hit, 1.5s CD)
                if (p.ownerId === user.id && activeSkinIdLoop === 'cultist' && now - lastSiphonAtRef.current >= 1500) {
                  lastSiphonAtRef.current = now;
                  const nextHp = Math.min(100, hpRef.current + 5);
                  hpRef.current = nextHp;
                  setLocalHp(nextHp);
                  addFloatingText(px, py - 28, '🧛 +5 HP Siphon', '#f472b6');
                  flashSkinAbility('Dark Siphon (+5 HP)');
                }

                // Necromancer — Soul Harvester (3-tick 4 dmg Soul Burn)
                if (p.ownerId === user.id && activeSkinIdLoop === 'necromancer') {
                  soulBurnsRef.current = [
                    ...soulBurnsRef.current.filter(b => b.targetUid !== enemy.uid),
                    { targetUid: enemy.uid, ticksRemaining: 3, nextTickAt: now + 600, damagePerTick: 4 }
                  ];
                  flashSkinAbility('Soul Harvester (Burn Applied)');
                }

                damageArenaPlayer(enemy.uid, p.damage, p.ownerId).then(res => {
                  if (res.brittleGuardTriggered) {
                    addFloatingText(enemy.x, enemy.y - 44, '💀 BRITTLE GUARD!', '#f59e0b');
                  }
                  if (res.bricksGained && res.bricksGained > 0) {
                    addFloatingText(enemy.x, enemy.y - 44, `👑 ABSORBED (+${res.bricksGained}🧱)`, '#34d399');
                  }
                  if (res.killed && p.ownerId === user.id) {
                    setKills(prev => prev + 1);
                    addFloatingText(enemy.x, enemy.y - 48, 'ELIMINATED! 💀', '#fbbf24');
                    if (activeSkinIdLoop === 'cultist') {
                      const nextHp = Math.min(100, hpRef.current + 25);
                      const nextSh = Math.min(100, shieldRef.current + 15);
                      hpRef.current = nextHp;
                      shieldRef.current = nextSh;
                      setLocalHp(nextHp);
                      setLocalShield(nextSh);
                      addFloatingText(px, py - 38, '🧛 BLOOD RITUAL: +25HP +15🛡️', '#f472b6');
                      flashSkinAbility('Blood Ritual (+25HP +15🛡️)');
                    }
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
        pt.x += pt.vx * frameScale;
        pt.y += pt.vy * frameScale;
        pt.life += frameScale;
        pt.alpha = Math.max(0, 1 - pt.life / pt.maxLife);
      });
      particlesRef.current = particlesRef.current.filter(pt => pt.life < pt.maxLife);

      // Update floating texts
      floatingTextsRef.current.forEach(ft => {
        ft.y -= 0.7 * frameScale;
        ft.life += frameScale;
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
      // LAYER 1 (STRUCTURED WATER, WATER LILIES & DIRT REGIONS): 9-Slice Ponds & Dirt Roads
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
                // Render Sample1 water lilies on top of interior water tiles
                if (tile.isWater && tile.lilyCol !== undefined && tile.lilyRow !== undefined) {
                  const { sx: lsx, sy: lsy } = getTileSourceCoords(tile.lilyCol, tile.lilyRow);
                  ctx.drawImage(
                    sheetImg,
                    lsx,
                    lsy,
                    TILE_SIZE,
                    TILE_SIZE,
                    tx,
                    ty,
                    WORLD_TILE_SIZE,
                    WORLD_TILE_SIZE
                  );
                }
              } else {
                ctx.fillStyle = tile.isWater ? '#63c5cf' : tile.baseColor;
                ctx.fillRect(tx, ty, WORLD_TILE_SIZE, WORLD_TILE_SIZE);
                if (tile.isWater && tile.lilyCol !== undefined) {
                  ctx.fillStyle = '#4ba86d';
                  ctx.beginPath();
                  ctx.arc(tx + 16, ty + 16, 9, 0, Math.PI * 2);
                  ctx.fill();
                  if (tile.lilyCol === 25) {
                    ctx.fillStyle = '#ffffff';
                    ctx.beginPath();
                    ctx.arc(tx + 16, ty + 15, 5, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = '#facc15';
                    ctx.beginPath();
                    ctx.arc(tx + 16, ty + 15, 2, 0, Math.PI * 2);
                    ctx.fill();
                  }
                }
              }
            }
          }
        }
      }

      // =======================================================================
      // LAYER 2 (PREFAB STRUCTURES): Sample1 Gabled Houses, Barns, Cottages & Manors
      // =======================================================================
      if (worldDataRef.current?.buildings) {
        const prevSmooth = ctx.imageSmoothingEnabled;
        ctx.imageSmoothingEnabled = false;
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

          // Soft building ground shadow under each wing hitbox
          ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
          for (const wingHb of getBuildingHitboxes(bldg)) {
            ctx.fillRect(wingHb.x + 3, wingHb.y + wingHb.h - 6, wingHb.w, 10);
          }

          // Draw multi-layered building tiles (Backdrop Wall -> Roof/Gable/Window/Door -> Trim/Weathervane)
          for (const t of bldg.tiles) {
            const tx = t.col * WORLD_TILE_SIZE;
            const ty = t.row * WORLD_TILE_SIZE;

            if (hasSheet) {
              if (t.baseSheetCol !== undefined && t.baseSheetRow !== undefined) {
                const { sx: bsx, sy: bsy } = getTileSourceCoords(t.baseSheetCol, t.baseSheetRow);
                ctx.drawImage(
                  sheetImg,
                  bsx,
                  bsy,
                  TILE_SIZE,
                  TILE_SIZE,
                  tx,
                  ty,
                  WORLD_TILE_SIZE,
                  WORLD_TILE_SIZE
                );
              }
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
              if (t.overlayCol !== undefined && t.overlayRow !== undefined) {
                const { sx: osx, sy: osy } = getTileSourceCoords(t.overlayCol, t.overlayRow);
                ctx.drawImage(
                  sheetImg,
                  osx,
                  osy,
                  TILE_SIZE,
                  TILE_SIZE,
                  tx,
                  ty,
                  WORLD_TILE_SIZE,
                  WORLD_TILE_SIZE
                );
              }
            } else {
              ctx.fillStyle = t.isRoof ? '#b48151' : '#e1d5ba';
              ctx.fillRect(tx, ty, WORLD_TILE_SIZE, WORLD_TILE_SIZE);
            }
          }
        }
        ctx.imageSmoothingEnabled = prevSmooth;
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
                // Sample1 green 2x2 A-frame tent (Kenney cols 46..47, rows 10..11)
                col = 46;
                row = 10;
              } else if (sc.type === 'campfire') {
                if (col === undefined) {
                  col = 14;
                  row = 8;
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

                if (sc.type === 'tent') {
                  // Seamless 2x2 Sample1 Green Tent (cols 46..47, rows 10..11)
                  const halfW = sc.width / 2;
                  const halfH = sc.height / 2;
                  const leftX = sc.x - halfW;
                  const topY = sc.y - sc.height + 2;
                  const parts = [
                    { c: 46, r: 10, dx: 0, dy: 0 },
                    { c: 47, r: 10, dx: halfW, dy: 0 },
                    { c: 46, r: 11, dx: 0, dy: halfH },
                    { c: 47, r: 11, dx: halfW, dy: halfH }
                  ];
                  for (const pt of parts) {
                    const { sx: tsx, sy: tsy } = getTileSourceCoords(pt.c, pt.r);
                    cContext.drawImage(
                      sheetImg,
                      tsx, tsy, TILE_SIZE, TILE_SIZE,
                      leftX + pt.dx, topY + pt.dy, halfW, halfH
                    );
                  }
                } else if (topRow !== undefined) {
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
                  // Single tile prop (Stump, Fence, Flower, Campfire, Crate, Barrel)
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
                    // Exact Sample1 green A-frame tent fallback
                    cContext.fillStyle = '#4ba86d';
                    cContext.strokeStyle = '#24633d';
                    cContext.lineWidth = 2;
                    cContext.beginPath();
                    cContext.moveTo(sc.x - sc.width * 0.45, sc.y);
                    cContext.lineTo(sc.x + sc.width * 0.45, sc.y);
                    cContext.lineTo(sc.x + sc.width * 0.35, sc.y - sc.height * 0.58);
                    cContext.lineTo(sc.x, sc.y - sc.height * 0.9);
                    cContext.lineTo(sc.x - sc.width * 0.35, sc.y - sc.height * 0.58);
                    cContext.closePath();
                    cContext.fill();
                    cContext.stroke();
                    cContext.fillStyle = '#5eb780';
                    cContext.beginPath();
                    cContext.moveTo(sc.x - sc.width * 0.32, sc.y);
                    cContext.lineTo(sc.x + sc.width * 0.32, sc.y);
                    cContext.lineTo(sc.x, sc.y - sc.height * 0.88);
                    cContext.closePath();
                    cContext.fill();
                    cContext.fillStyle = '#307e4d';
                    cContext.beginPath();
                    cContext.moveTo(sc.x - 10, sc.y);
                    cContext.lineTo(sc.x + 10, sc.y);
                    cContext.lineTo(sc.x, sc.y - sc.height * 0.45);
                    cContext.closePath();
                    cContext.fill();
                  } else if (sc.type === 'campfire') {
                    cContext.fillStyle = '#8f673f';
                    cContext.fillRect(sc.x - 10, sc.y - 6, 20, 6);
                    cContext.fillStyle = '#f97316';
                    cContext.beginPath();
                    cContext.arc(sc.x, sc.y - 10, 7, 0, Math.PI * 2);
                    cContext.fill();
                    cContext.fillStyle = '#facc15';
                    cContext.beginPath();
                    cContext.arc(sc.x, sc.y - 9, 4, 0, Math.PI * 2);
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

              // Glowing ground halo (Discoverer Loot Sensor enhances visibility)
              const isDiscovererLoop = activeSkinIdLoop === 'discoverer';
              if (isDiscovererLoop) {
                const sensorPulse = (Math.sin(cNow / 180) + 1) * 0.5;
                cContext.strokeStyle = 'rgba(250, 204, 21, 0.85)';
                cContext.lineWidth = 2;
                cContext.beginPath();
                cContext.arc(loot.x, loot.y, 18 + sensorPulse * 7, 0, Math.PI * 2);
                cContext.stroke();
              }
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
      structuresRef.current.forEach(st => {
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
      cratesRef.current.forEach(cr => {
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
        isAcousticShield?: boolean,
        isMovingOverride?: boolean,
        moveSpeedPx?: number
      ) => {
        cContext.save();
        cContext.translate(pX, pY);

        // Rogue Shadow Step stealth shimmer when out of combat
        const dollSkinId = getFantasySkin(skinId).id;
        if (dollSkinId === 'rogue' && isLocal && isRogueStealth) {
          cContext.globalAlpha = 0.6;
        }

        // Overlord Cataclysmic Might 140px Storm Eye aura ring
        if (dollSkinId === 'overlord' && isLocal && !(!isAliveRef.current)) {
          const auraSpin = cNow / 700;
          cContext.save();
          cContext.rotate(auraSpin);
          cContext.strokeStyle = 'rgba(220, 38, 38, 0.45)';
          cContext.lineWidth = 2.5;
          cContext.setLineDash([14, 10]);
          cContext.beginPath();
          cContext.arc(0, 0, 140, 0, Math.PI * 2);
          cContext.stroke();
          cContext.setLineDash([]);
          cContext.restore();
        }

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
        const isDead = isLocal ? !isAliveRef.current : (hp <= 0);
        const isHurt = isLocal ? (cNow - lastDamageTimeRef.current < 320) : false;
        const isAttacking = isLocal ? (cNow - lastShotTimeRef.current < 280) : false;
        const isMoving = isMovingOverride !== undefined ? isMovingOverride : Math.abs(Math.sin(stride)) > 0.04;
        const isSprinting = isMoving && isLocal && (!!keysPressed.current['shift'] || (moveSpeedPx || 0) >= 340);

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

          const walkBob = (isMoving && !isDead) ? Math.abs(Math.sin(stride)) * -2 : 0;
          cContext.translate(0, walkBob);

          const sinA = Math.sin(angle);
          const cosA = Math.cos(angle);

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

          const speedFrameScale = moveSpeedPx ? Math.max(0.75, Math.min(1.6, moveSpeedPx / 260)) : 1;
          let frameCol = 0;
          if (activeAction === 'death') {
            const deathElapsed = isLocal ? (cNow - (localDeathTimeRef.current || cNow)) : 500;
            frameCol = Math.min(3, Math.floor(Math.max(0, deathElapsed) / 130));
          } else if (activeAction === 'hurt') {
            const hurtElapsed = isLocal ? (cNow - lastDamageTimeRef.current) : 0;
            frameCol = Math.min(3, Math.floor(Math.max(0, hurtElapsed) / 80));
          } else if (activeAction === 'attack') {
            const shotElapsed = isLocal ? (cNow - lastShotTimeRef.current) : 0;
            frameCol = Math.min(3, Math.floor(Math.max(0, shotElapsed) / 70));
          } else if (activeAction === 'run') {
            frameCol = Math.floor(cNow / Math.round(115 / speedFrameScale)) % 4;
          } else if (activeAction === 'walk') {
            frameCol = Math.floor(cNow / Math.round(145 / speedFrameScale)) % 4;
          } else {
            frameCol = Math.floor(cNow / 260) % 4;
          }

          const isModular1024 = sheetImg.naturalWidth >= 512;
          const frameSize = isModular1024 ? 256 : 32;

          const sx = frameCol * frameSize;
          const sy = dirRow * frameSize;
          const sw = frameSize;
          const sh = frameSize;

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
            const weaponItem = SHOP_ITEMS.find(i => i.id === weaponId) || equippedWeaponRef.current;
            const beamCol = weaponItem?.stats?.beamColor || '#f97316';

            cContext.fillStyle = '#fed7aa';
            cContext.beginPath();
            cContext.roundRect(6, -8, 10, 4, 2);
            cContext.roundRect(6, 4, 10, 4, 2);
            cContext.fill();

            cContext.fillStyle = '#0f172a';
            cContext.fillRect(10, -3, 14, 6);
            cContext.fillStyle = beamCol;
            cContext.fillRect(16, -2, 8, 4);
            cContext.strokeStyle = '#020617';
            cContext.lineWidth = 1;
            cContext.strokeRect(10, -3, 14, 6);

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

          cContext.strokeStyle = theme.auraColor;
          cContext.lineWidth = 1.5;
          cContext.beginPath();
          cContext.arc(0, 0, 20, 0, 2 * Math.PI);
          cContext.stroke();

          const legSwing = isMoving ? Math.sin(stride) * 6 : 0;
          cContext.fillStyle = theme.pantsColor;
          cContext.fillRect(-9, -10 + legSwing, 6, 12);
          cContext.fillRect(-9, 2 - legSwing, 6, 12);

          cContext.fillStyle = '#0f172a';
          cContext.fillRect(-11, -11 + legSwing, 4, 5);
          cContext.fillRect(-11, 4 - legSwing, 4, 5);

          cContext.fillStyle = theme.torsoColor;
          cContext.beginPath();
          cContext.roundRect(-8, -12, 16, 24, 4);
          cContext.fill();
          cContext.strokeStyle = isLocal ? '#10b981' : theme.collarColor;
          cContext.lineWidth = 2;
          cContext.stroke();

          cContext.fillStyle = theme.collarColor;
          cContext.fillRect(-4, -4, 8, 8);

          cContext.fillStyle = '#fed7aa';
          cContext.beginPath();
          cContext.arc(2, 0, 9, 0, 2 * Math.PI);
          cContext.fill();
          cContext.strokeStyle = '#78350f';
          cContext.lineWidth = 1;
          cContext.stroke();

          cContext.fillStyle = theme.hairColor;
          cContext.beginPath();
          cContext.arc(2, 0, 7.5, Math.PI * 0.7, Math.PI * 2.3);
          cContext.fill();

          const weaponItem = SHOP_ITEMS.find(i => i.id === weaponId) || equippedWeaponRef.current;
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
          const maxSh = getFantasySkin(resolvedSkinId).id === 'knight_hero' ? 120 : 100;
          const shPct = Math.max(0, Math.min(1, shield / maxSh));
          cContext.fillStyle = getFantasySkin(resolvedSkinId).id === 'knight_hero' ? '#fbbf24' : '#06b6d4';
          cContext.fillRect(-barW / 2, 9, barW * shPct, barH - 1);
        }

        cContext.restore();
      };

      // 5. Add Other Players to Y-Sort Queue
      arenaPlayersRef.current.forEach(p => {
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
      if (playerAlive) {
        ySortQueue.push({
          sortY: py + 12,
          render: (cContext, cNow) => {
            renderPaperDoll(
              cContext,
              px,
              py,
              facingAngleRef.current,
              effectiveSkinIdRef.current,
              equippedWeaponRef.current.id,
              true,
              user.name,
              hpRef.current,
              shieldRef.current,
              cNow < highGroundUntilRef.current,
              cNow < metalShieldUntilRef.current,
              walkCycleRef.current,
              cNow,
              cNow < acousticShieldUntilRef.current,
              isLocallyMovingRef.current,
              speedPxPerSec
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

      const safeEyeRadius = Math.max(0, storm.radius);
      const isSurging = storm.isSurging && isMatchActive;

      // 1. Transparent Violet Filter Outside the Eye of the Storm (where storm damage occurs)
      ctx.beginPath();
      ctx.rect(-1000, -1000, MAP_SIZE + 2000, MAP_SIZE + 2000);
      ctx.arc(stormCenter.current.x, stormCenter.current.y, safeEyeRadius, 0, Math.PI * 2, true);
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

      // (E2) SKIN PASSIVE OVERLAYS: BAT ECHOLOCATION SONAR & DISCOVERER LOOT COMPASS
      if (playerAlive && activeSkinIdLoop === 'bat') {
        ctx.save();
        for (const ring of echolocationRingsRef.current) {
          const progress = Math.min(1, (now - ring.startedAt) / 1100);
          const rad = 30 + progress * ring.maxRadius;
          ctx.strokeStyle = `rgba(168, 85, 247, ${(1 - progress) * 0.7})`;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(ring.x, ring.y, rad, 0, Math.PI * 2);
          ctx.stroke();
        }
        // Highlight all alive enemies within 950px (even behind structures/buildings!)
        arenaPlayersRef.current.forEach(en => {
          if (en.uid !== user.id && en.isAlive) {
            const dist = Math.hypot(en.x - px, en.y - py);
            if (dist <= 950) {
              const pulseSonar = (Math.sin(now / 150) + 1) * 0.5;
              ctx.strokeStyle = '#c084fc';
              ctx.lineWidth = 2.5;
              ctx.beginPath();
              ctx.arc(en.x, en.y, 26 + pulseSonar * 8, 0, Math.PI * 2);
              ctx.stroke();
              ctx.font = 'bold 10px monospace';
              ctx.fillStyle = '#e9d5ff';
              ctx.textAlign = 'center';
              ctx.fillText(`🦇 ${Math.round(dist)}m`, en.x, en.y - 44);
            }
          }
        });
        ctx.restore();
      }

      if (playerAlive && activeSkinIdLoop === 'discoverer') {
        const unclaimedCrates = cratesRef.current.filter(c => !c.isClaimed);
        if (unclaimedCrates.length > 0) {
          let nearest = unclaimedCrates[0];
          let nearestDist = Math.hypot(nearest.x - px, nearest.y - py);
          for (const cr of unclaimedCrates) {
            const d = Math.hypot(cr.x - px, cr.y - py);
            if (d < nearestDist) {
              nearest = cr;
              nearestDist = d;
            }
          }
          if (nearestDist > 85) {
            const dirAng = Math.atan2(nearest.y - py, nearest.x - px);
            const ptrX = px + Math.cos(dirAng) * 95;
            const ptrY = py + Math.sin(dirAng) * 95;
            ctx.save();
            ctx.translate(ptrX, ptrY);
            ctx.rotate(dirAng);
            ctx.fillStyle = '#facc15';
            ctx.strokeStyle = '#0f172a';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(14, 0);
            ctx.lineTo(-8, -8);
            ctx.lineTo(-4, 0);
            ctx.lineTo(-8, 8);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.rotate(-dirAng);
            ctx.font = 'bold 10px monospace';
            ctx.fillStyle = '#fef08a';
            ctx.textAlign = 'center';
            ctx.fillText(`🧭📦 ${Math.round(nearestDist)}m`, 0, -16);
            ctx.restore();
          }
        }
      }

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
      const curBuildType = selectedBuildTypeRef.current;
      const curBuildRot = buildRotationRef.current;
      if (curBuildType && playerAlive) {
        const canvasRect = canvas.getBoundingClientRect();
        const mouseX = mouseScreenPos.current.x - canvasRect.left;
        const mouseY = mouseScreenPos.current.y - canvasRect.top;
        const worldMouseX = cameraRef.current.x + mouseX;
        const worldMouseY = cameraRef.current.y + mouseY;

        const dX = worldMouseX - px;
        const dY = worldMouseY - py;
        const rawDist = Math.hypot(dX, dY);
        const aimAngle = rawDist > 5 ? Math.atan2(dY, dX) : facingAngleRef.current;

        const placeDist = Math.max(70, Math.min(175, rawDist));
        const prevX = Math.round(px + Math.cos(aimAngle) * placeDist);
        const prevY = Math.round(py + Math.sin(aimAngle) * placeDist);

        let hasEnoughMats = false;
        let matCostText = '';
        if (curBuildType === 'wood_wall') {
          hasEnoughMats = woodRef.current >= 10;
          matCostText = '🪵 10 Wood';
        } else if (curBuildType === 'brick_ramp') {
          hasEnoughMats = brickRef.current >= 15;
          matCostText = '🧱 15 Brick';
        } else if (curBuildType === 'metal_bunker') {
          hasEnoughMats = metalRef.current >= 15;
          matCostText = '⚙️ 15 Metal';
        }

        previewPosRef.current = { x: prevX, y: prevY, isValid: hasEnoughMats };

        const ghostColor = hasEnoughMats ? '#06b6d4' : '#ef4444';
        const ghostFill = hasEnoughMats ? 'rgba(6, 182, 212, 0.22)' : 'rgba(239, 68, 68, 0.22)';
        const pulseGhost = (Math.sin(now / 150) + 1) / 2;

        ctx.save();

        ctx.strokeStyle = hasEnoughMats ? 'rgba(6, 182, 212, 0.55)' : 'rgba(239, 68, 68, 0.55)';
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(prevX, prevY);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.strokeStyle = ghostColor;
        ctx.lineWidth = 2 + pulseGhost * 1.5;
        ctx.beginPath();
        ctx.arc(prevX, prevY, 34 + pulseGhost * 4, 0, 2 * Math.PI);
        ctx.stroke();

        ctx.translate(prevX, prevY);
        ctx.rotate((curBuildRot * Math.PI) / 180);

        if (curBuildType === 'wood_wall') {
          const bw = 46;
          const bh = 24;
          ctx.fillStyle = ghostFill;
          ctx.strokeStyle = ghostColor;
          ctx.lineWidth = 2;
          ctx.fillRect(-bw / 2, -bh / 2, bw, bh);
          ctx.strokeRect(-bw / 2, -bh / 2, bw, bh);
        } else if (curBuildType === 'brick_ramp') {
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
          ctx.beginPath();
          ctx.moveTo(-6, 2);
          ctx.lineTo(0, -12);
          ctx.lineTo(6, 2);
          ctx.stroke();
        } else if (curBuildType === 'metal_bunker') {
          ctx.fillStyle = ghostFill;
          ctx.strokeStyle = ghostColor;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(0, 0, 26, 0, 2 * Math.PI);
          ctx.fill();
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(-14, 0); ctx.lineTo(14, 0);
          ctx.moveTo(0, -14); ctx.lineTo(0, 14);
          ctx.stroke();
        }

        ctx.rotate(-(curBuildRot * Math.PI) / 180);

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
        ctx.fillText(`${matCostText} [${curBuildRot}°]`, 0, -37);

        ctx.restore();
      }

      ctx.restore(); // Restore Viewport Camera

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [user.id, user.name, isOwnerTester]);

  // 7. Auto Victory Royale Detection (Disabled during instructor test mode)
  useEffect(() => {
    if (isOwnerTester) return; // Do not auto-declare victory royale when testing solo!
    const alivePlayers = arenaPlayers.filter(p => p.isAlive);
    if (alivePlayers.length === 1 && arenaPlayers.length > 1 && battleState?.status === 'IN_PROGRESS') {
      const victor = alivePlayers[0];
      declareBattleWinner({
        uid: victor.uid,
        name: victor.name,
        avatar: victor.avatar
      });
    }
  }, [arenaPlayers, battleState?.status, isOwnerTester]);

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
    const crateModal = activeCrateModalRef.current || activeCrateModal;
    if (!crateModal) return;
    const isCorrect = idx === crateModal.question.answerIndex;

    if (isCorrect) {
      const skinId = effectiveSkinDefRef.current.id;
      const isGoblin = skinId === 'goblin';
      const maxShCap = skinId === 'knight_hero' ? 120 : 100;
      setCrateFeedback(
        isGoblin
          ? '✅ Correct! Supply rewards claimed + 👺 +50% Goblin Bonus!'
          : '✅ Correct! Supply rewards claimed!'
      );
      soundEngine.playVictory();

      // Immediately remove crate locally so fast movement doesn't re-trigger it
      const nextCrates = cratesRef.current.filter(c => c.id !== crateModal.id);
      cratesRef.current = nextCrates;
      setCrates(nextCrates);

      await claimSupplyCrate(crateModal.id, user.id, crateModal.rewardType);
      if (crateModal.rewardType === 'shield') {
        const nextSh = Math.min(maxShCap, shieldRef.current + 50);
        shieldRef.current = nextSh;
        setLocalShield(nextSh);
      } else {
        woodRef.current += isGoblin ? 30 : 20;
        brickRef.current += isGoblin ? 23 : 15;
        metalRef.current += isGoblin ? 15 : 10;
        setLocalWood(woodRef.current);
        setLocalBrick(brickRef.current);
        setLocalMetal(metalRef.current);
      }
      if (isGoblin) {
        flashSkinAbility('Gold Snatcher (+50% Crate Bonus!)');
      }
      setTimeout(() => {
        activeCrateModalRef.current = null;
        setActiveCrateModal(null);
        setCrateFeedback(null);
      }, 900);
    } else {
      setCrateFeedback(`❌ Incorrect! ${crateModal.question.explanation}`);
      soundEngine.playHit();
      setTimeout(() => {
        activeCrateModalRef.current = null;
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
          TOP STATUS BAR & STATS (CLEAN PASTEL CONTAINER & DARK CHARCOAL TEXT)
          ========================================================================= */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-wrap items-center justify-between gap-3 text-slate-800">
        
        {/* Left: Health, Shield & Character Info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#FDFBF7] px-3 py-1.5 rounded-lg border border-slate-300">
            <span className="text-xl">{equippedSkin.icon}</span>
            <div className="hidden sm:block">
              <span className="text-sm font-bold text-slate-800 block leading-tight">{user.name}</span>
              <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 flex-wrap">
                <span>{equippedSkinDef.name}</span>
                <span className="text-[10px] font-mono bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded border border-amber-300">
                  ⚡ SPD {equippedSkinDef.speed}
                </span>
                <span className="text-[10px] font-mono bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded border border-sky-300">
                  🛡️ DEF {equippedSkinDef.defense}
                </span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded border transition ${
                    skinAbilityFlash
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-400 ring-1 ring-emerald-400'
                      : 'bg-purple-50 text-purple-800 border-purple-200'
                  }`}
                  title={equippedSkinDef.ability}
                >
                  ✨ {skinAbilityFlash || equippedSkinDef.ability.split(':')[0]}
                </span>
              </span>
            </div>
          </div>

          {/* Health Bar */}
          <div className="space-y-0.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span className="flex items-center gap-1 text-rose-700">
                <Heart className="w-3.5 h-3.5 fill-rose-600 text-rose-600" />
                <span>Health: {localHp}/100</span>
              </span>
            </div>
            <div className="w-24 sm:w-32 h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-300">
              <div 
                className="h-full bg-rose-600 transition-all duration-150"
                style={{ width: `${Math.max(0, localHp)}%` }}
              />
            </div>
          </div>

          {/* Shield Bar */}
          {(() => {
            const maxShCap = equippedSkinDef.id === 'knight_hero' ? 120 : 100;
            return (
              <div className="space-y-0.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span className="flex items-center gap-1 text-sky-700">
                    <Shield className="w-3.5 h-3.5 fill-sky-600 text-sky-600" />
                    <span>Shield: {localShield}/{maxShCap}</span>
                  </span>
                </div>
                <div className="w-24 sm:w-32 h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-300">
                  <div 
                    className={`h-full transition-all duration-150 ${equippedSkinDef.id === 'knight_hero' ? 'bg-amber-500' : 'bg-sky-600'}`}
                    style={{ width: `${Math.max(0, Math.min(100, (localShield / maxShCap) * 100))}%` }}
                  />
                </div>
              </div>
            );
          })()}
        </div>

        {/* Center: Match Timer, Alive Counter, Kills & Storm Alert */}
        <div className="flex items-center gap-3 bg-[#EBF3F5] px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-800">
          <div className="text-center">
            <span className="text-[10px] text-slate-600 font-bold block">Time</span>
            <span className="text-sm font-bold text-slate-800">{timeFormatted}</span>
          </div>
          <div className="h-4 w-px bg-slate-300" />
          <div className="text-center">
            <span className="text-[10px] text-slate-600 font-bold block">Alive</span>
            <span className="text-sm font-bold text-slate-800">{aliveCount}</span>
          </div>
          <div className="h-4 w-px bg-slate-300" />
          <div className="text-center">
            <span className="text-[10px] text-slate-600 font-bold block">Kills</span>
            <span className="text-sm font-bold text-slate-800">{kills}</span>
          </div>
          <div className="h-4 w-px bg-slate-300" />
          <div className="text-center">
            <span className="text-[10px] text-slate-600 font-bold block">Storm</span>
            <span className={`text-xs font-bold ${distToStormSafe > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
              {distToStormSafe > 0 ? `-${distToStormSafe}m` : 'Safe zone'}
            </span>
          </div>
        </div>

        {/* Right: Sound, Music, Fullscreen, Minimap Toggle & Leave */}
        <div className="flex items-center gap-2">
          {/* SFX Toggle */}
          <button
            onClick={() => setSoundMuted(prev => !prev)}
            className="p-2 rounded-lg bg-[#FDFBF7] hover:bg-slate-100 text-slate-800 border border-slate-300 transition cursor-pointer"
            title={soundMuted ? 'Unmute sound effects' : 'Mute sound effects'}
          >
            {soundMuted ? <VolumeX className="w-4 h-4 text-rose-600" /> : <Volume2 className="w-4 h-4 text-emerald-700" />}
          </button>

          {/* Background Music Toggle */}
          <button
            onClick={() => setMusicMuted(prev => !prev)}
            className="p-2 rounded-lg bg-[#FDFBF7] hover:bg-slate-100 text-slate-800 border border-slate-300 transition cursor-pointer"
            title={musicMuted ? 'Unmute music' : 'Mute music'}
          >
            <Music className={`w-4 h-4 ${musicMuted ? 'text-slate-400' : 'text-slate-800'}`} />
          </button>

          {/* Full Screen Toggle Button */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-[#FDFBF7] hover:bg-slate-100 text-slate-800 border border-slate-300 transition cursor-pointer"
            title={isFullscreen ? 'Exit full screen' : 'Full screen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Minimap Toggle */}
          <button
            onClick={() => setMinimapExpanded(prev => !prev)}
            className="p-2 rounded-lg bg-[#FDFBF7] hover:bg-slate-100 text-slate-800 border border-slate-300 transition cursor-pointer"
            title="Toggle minimap"
          >
            <Compass className="w-4 h-4 text-slate-800" />
          </button>

          {/* Map Designer & Game Testing Section (corbanb@gisboyshigh.net only) */}
          {isOwnerTester && (
            <>
              <button
                onClick={() => setShowMapEditor(true)}
                className="px-3 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="Open Map Design Section: Add, remove, and rearrange tiles, obstacles, and buildings"
              >
                <span>🛠️</span>
                <span>Design Map</span>
              </button>

              <button
                onClick={() => setShowTestControls(prev => !prev)}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
                  showTestControls 
                    ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-400' 
                    : 'bg-amber-700 hover:bg-amber-600 text-white'
                }`}
                title="Toggle instructor solo testing tools"
              >
                <span>🧪</span>
                <span>Test Tools</span>
              </button>
            </>
          )}

          {/* Instructor End Match Host Control */}
          {isInstructor && (
            <button
              onClick={handleInstructorEndMatch}
              className="px-3 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-600 text-white font-bold text-xs transition cursor-pointer"
              title="End tournament match"
            >
              End Match
            </button>
          )}

          {/* Leave Battle */}
          <button
            onClick={handleExit}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition cursor-pointer"
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

        {/* 📦 PERIODIC STORM-EYE SUPPLY CRATE DROP BANNER */}
        {crateDropBanner && !isSurgeActive && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
            <div className="flex items-center gap-2 bg-amber-950/95 border-2 border-amber-400 text-amber-100 px-4 py-2 rounded-2xl font-bold text-xs sm:text-sm tracking-wide shadow-[0_0_25px_rgba(251,191,36,0.65)] backdrop-blur-md">
              <Package className="w-4 h-4 text-amber-300" />
              <span>{crateDropBanner}</span>
            </div>
          </div>
        )}

        {/* =====================================================================
            DYNAMIC MINIMAP HUD OVERLAY (TOP-RIGHT CORNER)
            ===================================================================== */}
        <div className={`absolute top-4 right-4 z-20 transition-all duration-200 ${minimapExpanded ? 'w-60 h-60' : 'w-44 h-44'}`}>
          <div className="relative w-full h-full rounded-2xl overflow-hidden border-2 border-fuchsia-500/70 bg-slate-950/90 backdrop-blur-md shadow-2xl p-1">
            <svg 
              key={mapRevision}
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

              {/* Dynamic Procedural World Blueprint synced to current mapMeta */}
              {(() => {
                const meta = worldDataRef.current?.mapMeta;
                if (!meta) {
                  return (
                    <>
                      <rect x="0" y="0" width={MAP_SIZE} height={MAP_SIZE} fill="#15803d" opacity="0.45" />
                      <rect x="0" y="0" width="800" height={MAP_SIZE} fill="#064e3b" opacity="0.6" />
                    </>
                  );
                }
                return (
                  <>
                    {/* Base Lush Green Meadows */}
                    <rect x="0" y="0" width={MAP_SIZE} height={MAP_SIZE} fill="#15803d" opacity="0.45" />

                    {/* Dense Pine Forest Zone */}
                    <rect
                      x={meta.forestBox.x}
                      y={meta.forestBox.y}
                      width={meta.forestBox.w}
                      height={meta.forestBox.h}
                      fill="#064e3b"
                      opacity="0.7"
                    />

                    {/* Randomized Lakes */}
                    {meta.lakes.map((lk, idx) => (
                      <rect
                        key={`mlake_${idx}`}
                        x={lk.x}
                        y={lk.y}
                        width={lk.w}
                        height={lk.h}
                        rx="80"
                        fill="#0284c7"
                        opacity="0.78"
                      />
                    ))}

                    {/* Randomized Arterial Highways & Spurs */}
                    {meta.roads.map((rd, idx) => (
                      <line
                        key={`mroad_${idx}`}
                        x1={rd.x1}
                        y1={rd.y1}
                        x2={rd.x2}
                        y2={rd.y2}
                        stroke="#78350f"
                        strokeWidth={rd.width}
                        opacity="0.85"
                      />
                    ))}

                    {/* Designated City / Village District (<= 15% of map) */}
                    {meta.villages.map((vil, idx) => (
                      <rect
                        key={`mvil_${idx}`}
                        x={vil.x}
                        y={vil.y}
                        width={vil.w}
                        height={vil.h}
                        rx="40"
                        fill="#334155"
                        opacity="0.45"
                        stroke="#fbbf24"
                        strokeWidth="18"
                      />
                    ))}

                    {/* Sample1 Buildings (City Cluster + Scattered Homesteads) */}
                    {(worldDataRef.current?.buildings || []).map((bldg, idx) => (
                      <rect
                        key={`mbldg_${bldg.id || idx}`}
                        x={bldg.worldX}
                        y={bldg.worldY}
                        width={bldg.worldW}
                        height={bldg.worldH}
                        fill="#d97706"
                        stroke="#fef3c7"
                        strokeWidth="12"
                        opacity="0.92"
                      />
                    ))}

                    {/* Central Crossroads Hub */}
                    <circle
                      cx={meta.hub.x}
                      cy={meta.hub.y}
                      r="260"
                      fill="none"
                      stroke="#d97706"
                      strokeWidth="35"
                      opacity="0.65"
                    />
                  </>
                );
              })()}

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

              {/* Ground Loot Bananas & Caches (Enhanced for Discoverer) */}
              <g id="minimap-ground-loot">
                {(worldDataRef.current?.groundLoot || [])
                  .filter(l => !l.isCollected && Number.isFinite(l.x) && Number.isFinite(l.y))
                  .map(l => (
                    <circle
                      key={`loot_${l.id}`}
                      cx={l.x}
                      cy={l.y}
                      r={equippedSkinDef.id === 'discoverer' ? '60' : '35'}
                      fill={equippedSkinDef.id === 'discoverer' ? '#fde047' : '#facc15'}
                      opacity={equippedSkinDef.id === 'discoverer' ? '0.95' : '0.8'}
                    />
                  ))}
              </g>

              {/* Supply Drops (Highlighted inside Storm Eye) */}
              <g id="minimap-crates">
                {(crates || [])
                  .filter(c => !c.isClaimed && Number.isFinite(c.x) && Number.isFinite(c.y))
                  .map(c => (
                    <circle
                      key={`crate_${c.id}`}
                      cx={c.x}
                      cy={c.y}
                      r={equippedSkinDef.id === 'discoverer' ? '125' : '85'}
                      fill="#facc15"
                      stroke="#ffffff"
                      strokeWidth="25"
                    />
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

              {/* Enemy Players (Red; Bat Sonar Pings Highlighted Within 950px) */}
              <g id="minimap-enemies">
                {(arenaPlayers || [])
                  .filter(p => p.uid !== user.id && p.isAlive && Number.isFinite(p.x) && Number.isFinite(p.y))
                  .map(p => {
                    const isBatSonarPing = equippedSkinDef.id === 'bat' && Math.hypot(p.x - localX, p.y - localY) <= 950;
                    return (
                      <g key={`player_${p.uid}`}>
                        {isBatSonarPing && (
                          <circle cx={p.x} cy={p.y} r="170" fill="none" stroke="#c084fc" strokeWidth="28" opacity="0.85" />
                        )}
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r={isBatSonarPing ? '105' : '90'}
                          fill={isBatSonarPing ? '#c084fc' : '#ef4444'}
                          stroke="#ffffff"
                          strokeWidth="25"
                        />
                      </g>
                    );
                  })}
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
                    <div className="flex items-center justify-center gap-1 text-[8px] font-mono">
                      <span className="text-amber-300">⚡{skin.speed}</span>
                      <span className="text-sky-300">🛡️{skin.defense}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Test Controls Drawer for corbanb@gisboyshigh.net */}
        {isOwnerTester && showTestControls && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 bg-slate-950/95 border-2 border-amber-500/70 rounded-2xl p-3 shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-4 flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 pr-2 border-r border-slate-700">
              <span className="text-base">🧪</span>
              <span className="text-xs font-bold text-amber-300">Solo Test Suite:</span>
            </div>

            <button
              onClick={handleSpawnTrainingDummy}
              className="px-3 py-1.5 rounded-xl bg-cyan-900/80 hover:bg-cyan-800 text-cyan-200 border border-cyan-500/60 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Spawn an AI training dummy target in front of you"
            >
              <span>🎯</span>
              <span>Spawn Dummy</span>
            </button>

            <button
              onClick={() => triggerStormEyeCrateDrop(true)}
              className="px-3 py-1.5 rounded-xl bg-yellow-900/80 hover:bg-yellow-800 text-yellow-200 border border-yellow-500/60 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Spawn a Science Supply Crate randomly inside the current Eye of the Storm"
            >
              <span>📦</span>
              <span>Drop Crate in Eye</span>
            </button>

            <button
              onClick={handleRestoreHealthAndMats}
              className="px-3 py-1.5 rounded-xl bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 border border-emerald-500/60 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Restore 100 HP, Max Shield, and add 500 Wood/Brick/Metal"
            >
              <span>✨</span>
              <span>Max HP + 500 Mats</span>
            </button>

            <button
              onClick={() => {
                clearArenaStructures().catch(() => {});
                structuresRef.current = [];
                setStructures([]);
                projectilesRef.current = [];
                particlesRef.current = [];
                worldDataRef.current = generateSuperAnimalStyleMap(
                  Date.now() + Math.floor(Math.random() * 1000000)
                );
                setPlayerCoords(2500, 2500);
                cameraRef.current.x = Math.max(0, Math.min(MAP_SIZE - viewDimsRef.current.width, 2500 - viewDimsRef.current.width / 2));
                cameraRef.current.y = Math.max(0, Math.min(MAP_SIZE - viewDimsRef.current.height, 2500 - viewDimsRef.current.height / 2));
                setMapRevision(r => r + 1);
                addFloatingText(2500, 2465, 'New Map & Builds Reset! 🗺️', '#34d399');
              }}
              className="px-3 py-1.5 rounded-xl bg-amber-900/80 hover:bg-amber-800 text-amber-200 border border-amber-500/60 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Clear all player-built structures and generate a fresh randomized map layout"
            >
              <span>🔄</span>
              <span>New Map & Reset Builds</span>
            </button>

            <button
              onClick={() => {
                setShowMapEditor(true);
                setShowTestControls(false);
              }}
              className="px-3 py-1.5 rounded-xl bg-purple-900/80 hover:bg-purple-800 text-purple-200 border border-purple-500/60 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Open Map Design Section"
            >
              <span>🛠️</span>
              <span>Open Map Designer</span>
            </button>

            <button
              onClick={() => setShowTestControls(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer ml-1"
            >
              <X className="w-4 h-4" />
            </button>
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

          {/* Slime Active Skin Ability [G] */}
          {equippedSkinDef.id === 'slime' && (
            <button
              onClick={triggerSlimeBounce}
              disabled={Date.now() < slimeBounceCooldownUntil}
              className={`px-3 py-1.5 rounded-xl border text-xs font-black flex items-center gap-1.5 transition cursor-pointer ${
                Date.now() >= slimeBounceCooldownUntil
                  ? 'bg-emerald-950/60 border-emerald-400/70 text-emerald-200 hover:bg-emerald-900/70'
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
              title={equippedSkinDef.ability}
            >
              <span className="px-1.5 py-0.5 rounded bg-emerald-400 text-slate-950 text-[10px] font-black">G</span>
              <span>🟢 Bounce</span>
              {Date.now() < slimeBounceCooldownUntil && (
                <span className="text-[10px] font-mono text-rose-400">
                  {((slimeBounceCooldownUntil - Date.now()) / 1000).toFixed(1)}s
                </span>
              )}
            </button>
          )}

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
              title={`Instructor Instant Character Morph (All ${ALL_FANTASY_SKINS.length} Fantasy Characters Unlocked)`}
            >
              <span>👔</span>
              <span className="hidden xl:inline">Skins ({ALL_FANTASY_SKINS.length})</span>
            </button>
          )}

        </div>

        {/* Elimination Overlay */}
        {!isAlive && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-6 text-center animate-in fade-in z-30">
            <div className="space-y-4 max-w-sm bg-white border border-slate-300 p-6 rounded-2xl shadow-lg text-slate-800">
              <span className="text-4xl block">💀</span>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">You Were Eliminated</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                You finished with <strong>{kills} eliminations</strong> across the 5000m arena! Revise more Cambridge slide decks to gather extra building materials and gold!
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                {isOwnerTester && (
                  <button
                    onClick={() => {
                      const maxSh = effectiveSkinDefRef.current.id === 'knight_hero' ? 120 : 100;
                      localDeathTimeRef.current = 0;
                      hpRef.current = 100;
                      shieldRef.current = maxSh;
                      isAliveRef.current = true;
                      setLocalHp(100);
                      setLocalShield(maxSh);
                      setIsAlive(true);
                      setWinnerCelebration(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-600 text-white text-xs font-bold transition cursor-pointer shadow-xs"
                  >
                    Respawn & Continue Testing
                  </button>
                )}
                <button
                  onClick={handleExit}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-black text-xs font-bold transition cursor-pointer shadow-xs"
                >
                  Return to Study
                </button>
                {onOpenShop && (
                  <button
                    onClick={onOpenShop}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer shadow-xs border border-black"
                  >
                    Open Booster Packs
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Victory Royale Celebration Modal (Dismissable & See-Behind Enabled) */}
        {winnerCelebration && (
          <div className={`absolute inset-0 flex p-4 sm:p-6 text-center z-40 transition-all ${
            isVictoryMinimized 
              ? 'items-end justify-end bg-transparent pointer-events-none' 
              : 'items-center justify-center bg-black/40'
          }`}>
            <div className={`space-y-3 bg-white/95 border-2 border-amber-400 rounded-2xl shadow-2xl relative text-slate-800 backdrop-blur-md pointer-events-auto transition-all ${
              isVictoryMinimized 
                ? 'p-3 max-w-xs opacity-90 hover:opacity-100 shadow-lg' 
                : 'p-6 sm:p-8 max-w-md w-full opacity-100'
            }`}>
              {/* Dismiss / Close X Button */}
              <button
                onClick={() => setWinnerCelebration(null)}
                className="absolute top-2.5 right-2.5 p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                title="Dismiss and continue game"
              >
                <X className="w-4 h-4" />
              </button>

              {!isVictoryMinimized && <div className="text-4xl">👑</div>}
              <h2 className={`${isVictoryMinimized ? 'text-sm pr-6 text-left' : 'text-2xl'} font-bold text-slate-900 tracking-tight`}>
                {isVictoryMinimized ? `👑 Victory Royale • ${winnerCelebration.name}` : 'Victory Royale!'}
              </h2>
              {!isVictoryMinimized && (
                <div className="p-3.5 rounded-xl bg-[#FDFBF7] border border-slate-300">
                  <span className="text-xs text-slate-600 block font-bold uppercase tracking-wider">Champion</span>
                  <span className="text-xl font-bold text-slate-900">{winnerCelebration.name}</span>
                  <span className="text-xs text-amber-800 font-bold block mt-1">+200 XP and Monthly Victory Crown Awarded</span>
                </div>
              )}

              {/* Action Buttons: See Behind, Continue Testing, or Return */}
              <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                <button
                  onClick={() => setIsVictoryMinimized(prev => !prev)}
                  className="w-full sm:w-1/2 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition border border-slate-300 cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                  title="Toggle see-behind to look at the arena behind this textbox"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-700" />
                  <span>{isVictoryMinimized ? 'Expand Box' : 'See Behind Box'}</span>
                </button>

                <button
                  onClick={() => setWinnerCelebration(null)}
                  className="w-full sm:w-1/2 py-2 px-3 rounded-xl bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs transition shadow-2xs cursor-pointer flex items-center justify-center gap-1.5"
                  title="Close popup and continue playing in the arena"
                >
                  <span>Continue Testing</span>
                </button>
              </div>

              {!isVictoryMinimized && (
                <button
                  onClick={handleExit}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-xs cursor-pointer border border-black/20"
                >
                  Claim Victory and Return
                </button>
              )}
            </div>
          </div>
        )}

        {/* Science Supply Drop Rapid Question Challenge (Dyslexia-friendly pastel modal) */}
        {activeCrateModal && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-4 z-40">
            <div className="bg-white border border-slate-300 rounded-xl p-6 max-w-lg w-full shadow-md space-y-4 text-slate-800">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-slate-800" />
                  <span className="font-bold text-base text-slate-800">Science Supply Challenge</span>
                </div>
                <div className="px-3 py-1 rounded-lg bg-[#EBF3F5] border border-slate-300 text-slate-800 font-bold text-xs">
                  {crateQuestionTimer}s remaining
                </div>
              </div>

              <p className="text-base font-bold text-slate-800 leading-relaxed">
                {activeCrateModal.question.question}
              </p>

              <div className="grid grid-cols-1 gap-2 pt-1">
                {activeCrateModal.question.options.map((opt, oIdx) => (
                  <button
                    key={oIdx}
                    onClick={() => handleAnswerCrateQuestion(oIdx)}
                    className="p-3 rounded-lg bg-[#FDFBF7] hover:bg-[#EBF3F5] text-slate-800 border-2 border-black text-sm font-semibold text-left transition cursor-pointer"
                  >
                    {opt}
                  </button>
                ))}
              </div>

              {crateFeedback && (
                <div className="p-3 rounded-lg bg-[#EBF3F5] border border-slate-300 text-slate-800 text-sm font-bold text-center">
                  {crateFeedback}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TOURNAMENT ACCESS LOCKDOWN FOR STUDENTS BETWEEN SET ROYALE TOURNAMENTS */}
        {!isInstructor && !isOwnerTester && battleState?.status !== 'IN_PROGRESS' && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
            <div className="bg-white border border-slate-300 rounded-xl p-8 max-w-md w-full shadow-md text-center space-y-4 text-slate-800">
              <div className="w-14 h-14 rounded-xl bg-[#EBF3F5] border border-slate-300 flex items-center justify-center text-2xl mx-auto">
                <Lock className="w-7 h-7 text-slate-700" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-300 inline-block">
                  Lobby Waiting Room
                </span>
                <h3 className="text-xl font-bold text-slate-800">Tournament Inactive</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Students join the arena when your instructor begins the live match. Please wait in the lobby or return to study lessons.
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={handleExit}
                  className="w-full py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition cursor-pointer"
                >
                  Return to Lessons
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Map Design Section Modal (Exclusively for corbanb@gisboyshigh.net) */}
        {showMapEditor && worldDataRef.current && (
          <MapDesignEditor
            currentUser={user}
            worldData={worldDataRef.current}
            onSaveMap={(updated) => {
              worldDataRef.current = updated;
              try {
                localStorage.setItem('igcse_royale_custom_map_corbanb', JSON.stringify(updated));
              } catch {}
              setMapRevision(r => r + 1);
              setShowMapEditor(false);
              addFloatingText(playerPosRef.current.x, playerPosRef.current.y - 30, 'Custom Map Applied! 🛠️', '#34d399');
            }}
            onClose={() => setShowMapEditor(false)}
            onTestPlay={(targetX, targetY) => {
              const clampedX = typeof targetX === 'number' && !Number.isNaN(targetX)
                ? Math.max(100, Math.min(MAP_SIZE - 100, targetX))
                : playerPosRef.current.x;
              const clampedY = typeof targetY === 'number' && !Number.isNaN(targetY)
                ? Math.max(100, Math.min(MAP_SIZE - 100, targetY))
                : playerPosRef.current.y;
              setPlayerCoords(clampedX, clampedY);
              isAliveRef.current = true;
              cameraRef.current.x = Math.max(0, Math.min(MAP_SIZE - viewDimsRef.current.width, clampedX - viewDimsRef.current.width / 2));
              cameraRef.current.y = Math.max(0, Math.min(MAP_SIZE - viewDimsRef.current.height, clampedY - viewDimsRef.current.height / 2));
              setWinnerCelebration(null);
              setIsAlive(true);
              setMapRevision(r => r + 1);
              setShowMapEditor(false);
              addFloatingText(clampedX, clampedY - 30, 'Testing Map Location! 🚀', '#38bdf8');
            }}
          />
        )}

      </div>

      {/* Control Legend & Instructions */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-700 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-4 flex-wrap">
          <span><strong>WASD / Arrows:</strong> Move character</span>
          <span><strong>Mouse click:</strong> Aim and fire</span>
          <span><strong>1, 2, 3:</strong> Build defenses</span>
          <span><strong>E:</strong> Science ability</span>
          {equippedSkinDef.id === 'slime' && <span><strong>G:</strong> Viscous Bounce</span>}
          <span><strong>M:</strong> Toggle radar map</span>
          <span className="text-purple-800 font-semibold" title={equippedSkinDef.ability}>
            <strong>{equippedSkinDef.icon} {equippedSkinDef.name}:</strong> {equippedSkinDef.ability}
          </span>
        </div>
        <span className="text-xs text-slate-600 font-semibold">
          Supply crates drop periodically inside the storm eye.
        </span>
      </div>

    </div>
  );
};
