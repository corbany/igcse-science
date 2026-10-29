import { ItemRarity, ShopItem } from '../services/firebaseGameService';

export interface FrameRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface CharacterSpriteAnimation {
  idle: FrameRect[];
  walkDown: FrameRect[];
  walkUp: FrameRect[];
  walkSide: FrameRect[];
  action: FrameRect[];
}

export interface FantasySkinDefinition {
  id: string;
  name: string;
  title: string;
  rarity: ItemRarity;
  category: 'skin';
  price: number;
  icon: string;
  imageSrc: string; // Local path: '/assets/characters/{id}.png'
  sheetImg: string;
  avatarImg?: string;
  subject?: string;
  frames: CharacterSpriteAnimation;
  lore: string;
  ability: string;
  cardColor: string;
  borderClass: string;
  holoGradient: string;
  cardNumber: string;
  packNumber: 1 | 2 | 3 | 4;
  theme: {
    auraColor: string;
    badgeBg: string;
  };
}

// Standard 32x32 top-down animation frames from 128x128 sprite sheet
const standardFrames: CharacterSpriteAnimation = {
  idle: [
    { x: 0, y: 0, w: 32, h: 32 },
    { x: 0, y: 0, w: 32, h: 32 },
    { x: 32, y: 0, w: 32, h: 32 }
  ],
  walkDown: [
    { x: 0, y: 0, w: 32, h: 32 },
    { x: 32, y: 0, w: 32, h: 32 },
    { x: 0, y: 0, w: 32, h: 32 },
    { x: 64, y: 0, w: 32, h: 32 }
  ],
  walkSide: [
    { x: 0, y: 64, w: 32, h: 32 },
    { x: 32, y: 64, w: 32, h: 32 },
    { x: 0, y: 64, w: 32, h: 32 },
    { x: 64, y: 64, w: 32, h: 32 }
  ],
  walkUp: [
    { x: 0, y: 96, w: 32, h: 32 },
    { x: 32, y: 96, w: 32, h: 32 },
    { x: 0, y: 96, w: 32, h: 32 },
    { x: 64, y: 96, w: 32, h: 32 }
  ],
  action: [
    { x: 96, y: 0, w: 32, h: 32 }
  ]
};

// ============================================================================
// 18 FANTASY DUNGEON CHARACTERS (NIKASTUDIO TOP-DOWN SPRITE PACK)
// ============================================================================

export const ALL_FANTASY_SKINS: FantasySkinDefinition[] = [
  // --- COMMON (3) ---
  {
    id: 'cultist',
    name: 'Cultist',
    title: 'Occult Acolyte',
    rarity: 'common',
    category: 'skin',
    price: 80,
    icon: '🔮',
    imageSrc: '/assets/characters/cultist.png',
    sheetImg: '/assets/characters/cultist.png',
    frames: standardFrames,
    lore: 'Devotee of the forgotten catacombs, draped in dark crimson robes with arcane sigils.',
    ability: 'Blood Ritual: Siphons subtle life essence from fallen foes.',
    cardColor: 'from-purple-900 to-slate-950',
    borderClass: 'border-purple-600/60 shadow-purple-900/30',
    holoGradient: 'linear-gradient(135deg, rgba(168,85,247,0.3) 0%, rgba(220,38,38,0.2) 100%)',
    cardNumber: '01/18',
    packNumber: 1,
    theme: { auraColor: '#a855f7', badgeBg: 'bg-purple-950/80 border-purple-500/50' }
  },
  {
    id: 'skeleton_warrior',
    name: 'Skeleton',
    title: 'Risen Warrior',
    rarity: 'common',
    category: 'skin',
    price: 90,
    icon: '💀',
    imageSrc: '/assets/characters/skeleton_warrior.png',
    sheetImg: '/assets/characters/skeleton_warrior.png',
    frames: standardFrames,
    lore: 'An ancient guardian reanimated from the bone crypts, clad in pitted iron and cracked armor.',
    ability: 'Brittle Guard: Absorbs single fatal physical strikes with bone plating.',
    cardColor: 'from-stone-800 to-slate-950',
    borderClass: 'border-stone-500/60 shadow-stone-800/30',
    holoGradient: 'linear-gradient(135deg, rgba(214,211,209,0.3) 0%, rgba(120,113,108,0.2) 100%)',
    cardNumber: '02/18',
    packNumber: 1,
    theme: { auraColor: '#78716c', badgeBg: 'bg-stone-900/80 border-stone-500/50' }
  },
  {
    id: 'goblin',
    name: 'Goblin',
    title: 'Dungeon Scavenger',
    rarity: 'common',
    category: 'skin',
    price: 100,
    icon: '👺',
    imageSrc: '/assets/characters/goblin.png',
    sheetImg: '/assets/characters/goblin.png',
    frames: standardFrames,
    lore: 'A nimble cave-dweller wielding a crude cleaver and an obsession for shiny loot crates.',
    ability: 'Gold Snatcher: Finds bonus gold and wood in destroyed structures.',
    cardColor: 'from-lime-900 to-slate-950',
    borderClass: 'border-lime-600/60 shadow-lime-900/30',
    holoGradient: 'linear-gradient(135deg, rgba(132,204,22,0.3) 0%, rgba(101,163,13,0.2) 100%)',
    cardNumber: '03/18',
    packNumber: 1,
    theme: { auraColor: '#84cc16', badgeBg: 'bg-lime-950/80 border-lime-500/50' }
  },

  // --- RARE (4) ---
  {
    id: 'archer_hero',
    name: 'Archer',
    title: 'Keen Ranger',
    rarity: 'rare',
    category: 'skin',
    price: 160,
    icon: '🏹',
    imageSrc: '/assets/characters/archer_hero.png',
    sheetImg: '/assets/characters/archer_hero.png',
    frames: standardFrames,
    lore: 'A deadly marksman hailing from the whispering forest, boasting unmatched bowstring speed.',
    ability: 'Eagle Eye: Extended weapon projectile velocity and precision.',
    cardColor: 'from-emerald-900 to-slate-950',
    borderClass: 'border-emerald-500/70 shadow-emerald-900/40',
    holoGradient: 'linear-gradient(135deg, rgba(16,185,129,0.35) 0%, rgba(5,150,105,0.25) 100%)',
    cardNumber: '04/18',
    packNumber: 2,
    theme: { auraColor: '#10b981', badgeBg: 'bg-emerald-950/80 border-emerald-500/50' }
  },
  {
    id: 'rogue',
    name: 'Rogue',
    title: 'Shadow Stalker',
    rarity: 'rare',
    category: 'skin',
    price: 180,
    icon: '🗡️',
    imageSrc: '/assets/characters/rogue.png',
    sheetImg: '/assets/characters/rogue.png',
    frames: standardFrames,
    lore: 'Slips through shadows unnoticed with dual daggers coated in paralyzing cavern venom.',
    ability: 'Silent Stride: Footstep sounds reduced across terrain surfaces.',
    cardColor: 'from-indigo-900 to-slate-950',
    borderClass: 'border-indigo-500/70 shadow-indigo-900/40',
    holoGradient: 'linear-gradient(135deg, rgba(99,102,241,0.35) 0%, rgba(79,70,229,0.25) 100%)',
    cardNumber: '05/18',
    packNumber: 2,
    theme: { auraColor: '#6366f1', badgeBg: 'bg-indigo-950/80 border-indigo-500/50' }
  },
  {
    id: 'necromancer',
    name: 'Necromancer',
    title: 'Soul Harvester',
    rarity: 'rare',
    category: 'skin',
    price: 200,
    icon: '💀',
    imageSrc: '/assets/characters/necromancer.png',
    sheetImg: '/assets/characters/necromancer.png',
    frames: standardFrames,
    lore: 'Channels the chill of the underworld with a staff carved from dragon bone.',
    ability: 'Spectral Flame: Attacks leave lingering soul-burn damage.',
    cardColor: 'from-cyan-950 to-slate-950',
    borderClass: 'border-cyan-500/70 shadow-cyan-900/40',
    holoGradient: 'linear-gradient(135deg, rgba(6,182,212,0.35) 0%, rgba(14,116,144,0.25) 100%)',
    cardNumber: '06/18',
    packNumber: 2,
    theme: { auraColor: '#06b6d4', badgeBg: 'bg-cyan-950/80 border-cyan-500/50' }
  },
  {
    id: 'discoverer',
    name: 'Discoverer',
    title: 'Relic Seeker',
    rarity: 'rare',
    category: 'skin',
    price: 210,
    icon: '🧭',
    imageSrc: '/assets/characters/discoverer.png',
    sheetImg: '/assets/characters/discoverer.png',
    frames: standardFrames,
    lore: 'Bold cartographer who mapped the deepest labyrinth levels and unsealed forgotten vaults.',
    ability: 'Cartography: Displays storm countdown timer and crate landing pings on HUD.',
    cardColor: 'from-amber-950 to-slate-950',
    borderClass: 'border-amber-500/70 shadow-amber-900/40',
    holoGradient: 'linear-gradient(135deg, rgba(245,158,11,0.35) 0%, rgba(217,119,6,0.25) 100%)',
    cardNumber: '07/18',
    packNumber: 2,
    theme: { auraColor: '#f59e0b', badgeBg: 'bg-amber-950/80 border-amber-500/50' }
  },

  // --- EPIC (4) ---
  {
    id: 'white_mage',
    name: 'White Mage',
    title: 'High Cleric',
    rarity: 'epic',
    category: 'skin',
    price: 320,
    icon: '✨',
    imageSrc: '/assets/characters/white_mage.png',
    sheetImg: '/assets/characters/white_mage.png',
    frames: standardFrames,
    lore: 'A master of celestial radiance who wards allies against the creeping storm corruption.',
    ability: 'Divine Mend: Regenerates HP when resting on high-ground structures.',
    cardColor: 'from-slate-800 via-rose-950 to-slate-950',
    borderClass: 'border-rose-400/80 shadow-rose-600/40',
    holoGradient: 'linear-gradient(135deg, rgba(244,63,94,0.4) 0%, rgba(254,240,138,0.3) 100%)',
    cardNumber: '08/18',
    packNumber: 3,
    theme: { auraColor: '#fb7185', badgeBg: 'bg-rose-950/80 border-rose-500/50' }
  },
  {
    id: 'paladin',
    name: 'Paladin',
    title: 'Holy Crusader',
    rarity: 'epic',
    category: 'skin',
    price: 340,
    icon: '🛡️',
    imageSrc: '/assets/characters/paladin.png',
    sheetImg: '/assets/characters/paladin.png',
    frames: standardFrames,
    lore: 'Clad in polished silver and gold plate, brandishing a sacred sun-crest shield.',
    ability: 'Aegis of Light: Boosts starting shield capacity by +25.',
    cardColor: 'from-blue-950 via-sky-900 to-slate-950',
    borderClass: 'border-sky-400/80 shadow-sky-600/40',
    holoGradient: 'linear-gradient(135deg, rgba(56,189,248,0.4) 0%, rgba(234,179,8,0.3) 100%)',
    cardNumber: '09/18',
    packNumber: 3,
    theme: { auraColor: '#38bdf8', badgeBg: 'bg-sky-950/80 border-sky-500/50' }
  },
  {
    id: 'dark_knight',
    name: 'Dark Knight',
    title: 'Abyssal Champion',
    rarity: 'epic',
    category: 'skin',
    price: 360,
    icon: '⚔️',
    imageSrc: '/assets/characters/dark_knight.png',
    sheetImg: '/assets/characters/dark_knight.png',
    frames: standardFrames,
    lore: 'Forged in volcanic depths, bearing an obsidian greatsword that drinks enemy life.',
    ability: 'Bloodthirst: Eliminating a player instantly restores +30 Shield.',
    cardColor: 'from-neutral-950 via-red-950 to-slate-950',
    borderClass: 'border-red-600/80 shadow-red-900/50',
    holoGradient: 'linear-gradient(135deg, rgba(220,38,38,0.4) 0%, rgba(0,0,0,0.6) 100%)',
    cardNumber: '10/18',
    packNumber: 3,
    theme: { auraColor: '#ef4444', badgeBg: 'bg-red-950/80 border-red-500/50' }
  },
  {
    id: 'warlock',
    name: 'Warlock',
    title: 'Eldritch Summoner',
    rarity: 'epic',
    category: 'skin',
    price: 380,
    icon: '👁️',
    imageSrc: '/assets/characters/warlock.png',
    sheetImg: '/assets/characters/warlock.png',
    frames: standardFrames,
    lore: 'Commands chaotic nether-energies with a swirling orb of cosmic void.',
    ability: 'Nether Surge: Alternate fire abilities recharge 15% faster.',
    cardColor: 'from-purple-950 via-fuchsia-950 to-slate-950',
    borderClass: 'border-fuchsia-500/80 shadow-fuchsia-900/50',
    holoGradient: 'linear-gradient(135deg, rgba(217,70,239,0.4) 0%, rgba(147,51,234,0.3) 100%)',
    cardNumber: '11/18',
    packNumber: 3,
    theme: { auraColor: '#d946ef', badgeBg: 'bg-fuchsia-950/80 border-fuchsia-500/50' }
  },

  // --- LEGENDARY (4) ---
  {
    id: 'knight_hero',
    name: 'Knight Hero',
    title: 'Crown Champion',
    rarity: 'legendary',
    category: 'skin',
    price: 600,
    icon: '👑',
    imageSrc: '/assets/characters/knight_hero.png',
    sheetImg: '/assets/characters/knight_hero.png',
    frames: standardFrames,
    lore: 'The sovereign champion of the royal kingdom, clad in gleaming full plate and azure plume.',
    ability: 'Royal Banner: Increases building speed and structure reinforcement.',
    cardColor: 'from-blue-900 via-amber-900 to-slate-950',
    borderClass: 'border-yellow-400/90 shadow-yellow-500/50 ring-1 ring-yellow-400/40',
    holoGradient: 'linear-gradient(135deg, rgba(250,204,21,0.5) 0%, rgba(59,130,246,0.35) 100%)',
    cardNumber: '12/18',
    packNumber: 4,
    theme: { auraColor: '#facc15', badgeBg: 'bg-yellow-950/80 border-yellow-500/50' }
  },
  {
    id: 'dragon_slayer',
    name: 'Dragon Slayer',
    title: 'Wyrm Cleaver',
    rarity: 'legendary',
    category: 'skin',
    price: 650,
    icon: '🐉',
    imageSrc: '/assets/characters/dragon_slayer.png',
    sheetImg: '/assets/characters/dragon_slayer.png',
    frames: standardFrames,
    lore: 'Wears the impenetrable red scales of an ancient magma wyrm, wielding flame-forged steel.',
    ability: 'Dragon Hide: Takes 20% reduced damage from the storm surge.',
    cardColor: 'from-orange-950 via-red-900 to-slate-950',
    borderClass: 'border-orange-500/90 shadow-orange-600/50 ring-1 ring-orange-400/40',
    holoGradient: 'linear-gradient(135deg, rgba(249,115,22,0.5) 0%, rgba(239,68,68,0.35) 100%)',
    cardNumber: '13/18',
    packNumber: 4,
    theme: { auraColor: '#f97316', badgeBg: 'bg-orange-950/80 border-orange-500/50' }
  },
  {
    id: 'shadow_assassin',
    name: 'Shadow Assassin',
    title: 'Night Reaper',
    rarity: 'legendary',
    category: 'skin',
    price: 700,
    icon: '🥷',
    imageSrc: '/assets/characters/shadow_assassin.png',
    sheetImg: '/assets/characters/shadow_assassin.png',
    frames: standardFrames,
    lore: 'A silent phantom cloaked in violet smoke ribbons, striking lethal blows from the dark.',
    ability: 'Phase Step: Movement speed increased by 10% after taking damage.',
    cardColor: 'from-violet-950 via-slate-900 to-slate-950',
    borderClass: 'border-violet-400/90 shadow-violet-600/50 ring-1 ring-violet-400/40',
    holoGradient: 'linear-gradient(135deg, rgba(139,92,246,0.5) 0%, rgba(124,58,237,0.35) 100%)',
    cardNumber: '14/18',
    packNumber: 4,
    theme: { auraColor: '#a78bfa', badgeBg: 'bg-violet-950/80 border-violet-500/50' }
  },
  {
    id: 'berserker',
    name: 'Berserker',
    title: 'Iron Marauder',
    rarity: 'legendary',
    category: 'skin',
    price: 720,
    icon: '🪓',
    imageSrc: '/assets/characters/berserker.png',
    sheetImg: '/assets/characters/berserker.png',
    frames: standardFrames,
    lore: 'A hulking warrior wielding a double-headed battleaxe, entering frenzy when low on health.',
    ability: 'Blood Frenzy: Attack rate surges by +25% when HP drops below 35%.',
    cardColor: 'from-amber-950 via-stone-900 to-slate-950',
    borderClass: 'border-amber-500/90 shadow-amber-600/50 ring-1 ring-amber-400/40',
    holoGradient: 'linear-gradient(135deg, rgba(217,119,6,0.5) 0%, rgba(180,83,9,0.35) 100%)',
    cardNumber: '15/18',
    packNumber: 4,
    theme: { auraColor: '#f59e0b', badgeBg: 'bg-amber-950/80 border-amber-500/50' }
  },

  // --- MYTHIC (0.5% Drop Rate) (3) ---
  {
    id: 'slime_king',
    name: 'Slime King',
    title: 'Gelatinous Monarch',
    rarity: 'mythic',
    category: 'skin',
    price: 1500,
    icon: '👑',
    imageSrc: '/assets/characters/slime_king.png',
    sheetImg: '/assets/characters/slime_king.png',
    frames: standardFrames,
    lore: 'The sovereign ruler of all slimes, crowned in pure gold with a ruby that pulsates with royal might.',
    ability: 'Royal Bounce: Bounces effortlessly over small obstacles and ramps.',
    cardColor: 'from-emerald-950 via-teal-900 to-slate-950',
    borderClass: 'border-emerald-300 shadow-emerald-400/60 ring-2 ring-emerald-400/60',
    holoGradient: 'linear-gradient(135deg, rgba(52,211,153,0.6) 0%, rgba(250,204,21,0.5) 50%, rgba(16,185,129,0.4) 100%)',
    cardNumber: '16/18',
    packNumber: 4,
    theme: { auraColor: '#10b981', badgeBg: 'bg-emerald-950 border-emerald-400' }
  },
  {
    id: 'overlord',
    name: 'Overlord',
    title: 'Nether Tyrant',
    rarity: 'mythic',
    category: 'skin',
    price: 1800,
    icon: '👹',
    imageSrc: '/assets/characters/overlord.png',
    sheetImg: '/assets/characters/overlord.png',
    frames: standardFrames,
    lore: 'The apex demon king of the abyss, wrapped in living hellfire with a chaos scythe.',
    ability: 'Doom Cloak: Emits an intimidating aura that disrupts enemy crosshairs.',
    cardColor: 'from-red-950 via-purple-950 to-slate-950',
    borderClass: 'border-rose-400 shadow-rose-500/70 ring-2 ring-rose-500/60',
    holoGradient: 'linear-gradient(135deg, rgba(244,63,94,0.6) 0%, rgba(147,51,234,0.5) 50%, rgba(225,29,72,0.4) 100%)',
    cardNumber: '17/18',
    packNumber: 4,
    theme: { auraColor: '#e11d48', badgeBg: 'bg-rose-950 border-rose-400' }
  },
  {
    id: 'archangel',
    name: 'Archangel',
    title: 'Seraph of the Dawn',
    rarity: 'mythic',
    category: 'skin',
    price: 2000,
    icon: '🪽',
    imageSrc: '/assets/characters/archangel.png',
    sheetImg: '/assets/characters/archangel.png',
    frames: standardFrames,
    lore: 'A towering divine celestial with burning wings of starlight and a blade of pure holy fire.',
    ability: 'Heavenly Grace: Immune to fall damage and gains +15% storm resistance.',
    cardColor: 'from-amber-950 via-yellow-900 to-slate-950',
    borderClass: 'border-yellow-200 shadow-yellow-400/80 ring-2 ring-yellow-300/70',
    holoGradient: 'linear-gradient(135deg, rgba(254,240,138,0.7) 0%, rgba(250,204,21,0.6) 50%, rgba(255,255,255,0.5) 100%)',
    cardNumber: '18/18',
    packNumber: 4,
    theme: { auraColor: '#fef08a', badgeBg: 'bg-yellow-950 border-yellow-300' }
  }
];

// Helper to look up any skin definition (with alias fallback)
export const FANTASY_SKIN_ALIASES: Record<string, string> = {
  // Legacy aliases
  classic_chemist: 'cultist',
  quantum_physicist: 'archangel',
  laser_optics_tech: 'white_mage',
  polar_astronomer: 'discoverer',
  circuit_engineer: 'archer_hero',
  robotics_mechanist: 'skeleton_warrior',
  biohazard_specialist: 'paladin',
  virology_researcher: 'necromancer',
  plant_pathologist: 'goblin',
  field_botanist: 'archer_hero',
  field_entomologist: 'rogue',
  crystallographer: 'warlock',
  marine_oceanographer: 'knight_hero',
  fossil_paleontologist: 'dragon_slayer',
  cryo_glaciologist: 'shadow_assassin',
  mining_geologist: 'berserker',
  radiation_hazard_suit: 'dark_knight',
  pharmaceutical_tech: 'cultist',
  bioinformatics_dev: 'warlock',
  wildlife_ecologist: 'rogue',
  // Short names
  skeleton: 'skeleton_warrior',
  archer: 'archer_hero'
};

export function getFantasySkin(id: string): FantasySkinDefinition {
  const resolvedId = FANTASY_SKIN_ALIASES[id] || id;
  const found = ALL_FANTASY_SKINS.find(s => s.id === resolvedId || s.id === id);
  return found || ALL_FANTASY_SKINS[0];
}

// Convert to ShopItem format for inventory & store compatibility
export const FANTASY_SHOP_SKINS: ShopItem[] = ALL_FANTASY_SKINS.map(s => ({
  id: s.id,
  name: s.name,
  category: 'skin',
  rarity: s.rarity,
  description: `${s.title}: ${s.lore}`,
  price: s.price,
  icon: s.icon,
  imageSrc: s.imageSrc,
  packNumber: s.packNumber
}));
