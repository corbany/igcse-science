/**
 * Firebase Game & Revision Royale Service
 * Backing service for RPG profile, anti-exploit slide verification,
 * Avatar Shop loadouts, and real-time Battle Royale tournament events.
 * 
 * FIRESTORE DATA STRUCTURE:
 * 
 * /users/{userId}
 *   - level: number (e.g. 5)
 *   - xp: number (e.g. 450)
 *   - gold: number (e.g. 240)
 *   - wood: number (e.g. 45)
 *   - brick: number (e.g. 30)
 *   - metal: number (e.g. 15)
 *   - avatar: string (equipped skin ID: 'cyber_scientist')
 *   - equippedWeapon: string (equipped weapon ID: 'bunsen_burner')
 *   - equippedPower: string (equipped special ability: 'element_shield')
 *   - inventory: string[] (owned cosmetic and weapon IDs)
 *   - monthlyCrown: boolean (Monthly Victory Crown badge unlocked)
 * 
 * /users/{userId}/completedModules/{moduleId}
 *   - claimedAt: ISO string
 *   - wood: number
 *   - brick: number
 *   - metal: number
 *   - xp: number
 *   - gold: number
 * 
 * /battleEvent/config
 *   - nextEventDate: ISO string (e.g. '2026-11-06T16:00:00Z')
 *   - title: string ("Monthly Cambridge 0653 Revision Royale")
 *   - description: string ("Compete with classmates, build defenses, and answer science supply drops!")
 *   - season: number (1)
 * 
 * /battleEvent/state
 *   - status: 'LOBBY' | 'IN_PROGRESS' | 'ENDED'
 *   - startedAt: ISO string | null
 *   - stormRadius: number (shrinks from 900 to 0)
 *   - stormCenter: { x: number, y: number }
 *   - currentWinner: { uid: string, name: string, avatar: string } | null
 * 
 * /battleEvent/lobby/{uid}
 *   - uid: string
 *   - name: string
 *   - avatar: string
 *   - equippedWeapon: string
 *   - wood, brick, metal: number
 *   - isReady: boolean
 *   - joinedAt: ISO string
 * 
 * /battleEvent/players/{uid}
 *   - uid: string
 *   - name: string
 *   - avatar: string
 *   - equippedWeapon: string
 *   - x, y: number
 *   - angle: number (radians)
 *   - hp: number (0-100)
 *   - maxHp: number (100)
 *   - shield: number (0-100)
 *   - maxShield: number (100)
 *   - wood, brick, metal: number
 *   - isAlive: boolean
 *   - kills: number
 * 
 * /battleEvent/structures/{structureId}
 *   - id: string
 *   - x, y: number
 *   - type: 'wood_wall' | 'brick_ramp' | 'metal_bunker'
 *   - hp: number
 *   - maxHp: number
 *   - ownerId: string
 *   - createdAt: ISO string
 * 
 * /battleEvent/crates/{crateId}
 *   - id: string
 *   - x, y: number
 *   - isClaimed: boolean
 *   - rewardType: 'shield' | 'materials'
 *   - question: ScienceQuestion
 */

import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  onSnapshot, 
  increment,
  getDocs,
  writeBatch,
  runTransaction
} from 'firebase/firestore';
import { db, auth } from './firebaseAuth';
import { getFantasySkin } from '../data/fantasySkinsData';
import { notifyServerBattleControl } from './battleRealtimeClient';
import { getRandomizedPracticeVaultQuestions } from '../data/syllabusQuestionsBank';

export type InstructorRewardType = 'booster_pack' | 'gold' | 'skin' | 'weapon';

export interface InstructorRewardRecord {
  id: string;
  rewardType: InstructorRewardType;
  itemId?: string;
  itemName: string;
  quantity: number;
  note?: string;
  awardedBy: string;
  awardedByEmail?: string;
  awardedAt: string;
}

export interface UserGameProfile {
  uid: string;
  level: number;
  xp: number;
  gold: number;
  wood: number;
  brick: number;
  metal: number;
  avatar: string;
  role?: string;
  equippedSkin?: string;
  equippedWeapon: string;
  equippedPower: string;
  inventory: string[];
  unlockedSkins?: string[];
  giftedPacks?: Record<string, number>;
  rewardHistory?: InstructorRewardRecord[];
  monthlyCrown?: boolean;
}

export type ShopCategory = 'skin' | 'weapon' | 'power';
export type ItemRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

export interface WeaponAltFireStats {
  altName: string;
  altCooldownSeconds: number;
  altDamage: number;
  altType: 'teleport' | 'ring_wave' | 'acid_pool' | 'freeze_blast' | 'spread_beam' | 'emp_burst' | 'sonic_barrier' | 'vortex' | 'cluster_bomb' | 'orbital_strike';
  altDescription: string;
}

export interface ShopItem {
  id: string;
  name: string;
  category: ShopCategory;
  rarity: ItemRarity;
  description: string;
  price: number;
  icon: string;
  imageSrc?: string;
  packNumber?: number;
  stats?: {
    damage?: number;
    fireRate?: number;
    cooldownSeconds?: number;
    range?: number;
    beamColor?: string;
    specialEffect?: string;
    duration?: number;
    altFire?: WeaponAltFireStats;
  };
}

export interface BattleEventConfig {
  nextEventDate: string;
  title: string;
  description: string;
  season: number;
}

export interface BattleEventState {
  status: 'LOBBY' | 'IN_PROGRESS' | 'ENDED';
  isLobbyOpen?: boolean; // When true, instructor has opened the lobby for students
  startedAt: string | null;
  stormRadius: number;
  stormCenter: { x: number; y: number };
  stormFinalCenter?: { x: number; y: number };
  currentWinner: { uid: string; name: string; avatar: string } | null;
}

export interface LobbyPlayer {
  uid: string;
  name: string;
  avatar: string;
  equippedWeapon: string;
  wood: number;
  brick: number;
  metal: number;
  isReady: boolean;
  joinedAt: string;
}

export interface ArenaPlayer {
  uid: string;
  name: string;
  avatar: string;
  equippedWeapon: string;
  x: number;
  y: number;
  angle: number;
  hp: number;
  maxHp: number;
  shield: number;
  maxShield: number;
  wood: number;
  brick: number;
  metal: number;
  isAlive: boolean;
  kills: number;
  highGroundActive?: boolean;
  metalShieldActiveUntil?: number;
  brittleGuardUsedAt?: number;
  royalAbsorptionUsedAt?: number;
  frostSlowUntil?: number;
}

export interface ArenaStructure {
  id: string;
  x: number;
  y: number;
  type: 'wood_wall' | 'brick_ramp' | 'metal_bunker';
  hp: number;
  maxHp: number;
  ownerId: string;
  createdAt: string;
  rotation?: number; // 0, 90, 180, 270 degrees
}

export interface ScienceQuestion {
  id: string;
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
  subject: 'biology' | 'chemistry' | 'physics';
}

export interface SupplyCrate {
  id: string;
  x: number;
  y: number;
  isClaimed: boolean;
  rewardType: 'shield' | 'materials';
  question: ScienceQuestion;
}

export interface SupplyCrateDropOptions {
  center?: { x: number; y: number };
  radius?: number;
  x?: number;
  y?: number;
  rewardType?: 'shield' | 'materials';
}

export const samplePointWithinStormEye = (
  center: { x: number; y: number },
  radius: number,
  mapSize: number = 5120,
  marginPx?: number
): { x: number; y: number } => {
  const cx = Number.isFinite(center?.x) ? center.x : 2500;
  const cy = Number.isFinite(center?.y) ? center.y : 2500;
  const effectiveRadius = Math.max(40, Number.isFinite(radius) ? radius : 3600);
  const edgeMargin = marginPx ?? Math.min(130, Math.max(20, effectiveRadius * 0.1));
  const safeRadius = Math.max(16, effectiveRadius - edgeMargin);
  const minBound = 140;
  const maxBound = mapSize - 140;

  for (let attempt = 0; attempt < 30; attempt++) {
    const angle = Math.random() * 2 * Math.PI;
    const dist = Math.sqrt(Math.random()) * safeRadius;
    const x = Math.round(cx + Math.cos(angle) * dist);
    const y = Math.round(cy + Math.sin(angle) * dist);
    if (x >= minBound && x <= maxBound && y >= minBound && y <= maxBound) {
      return { x, y };
    }
  }

  // Fallback: clamp center into map and sample tight safe point inside both storm and map
  const clampedX = Math.max(minBound, Math.min(maxBound, Math.round(cx)));
  const clampedY = Math.max(minBound, Math.min(maxBound, Math.round(cy)));
  return { x: clampedX, y: clampedY };
};

// ============================================================================
// SHOP CATALOG & ITEMS DEFINITION
// ============================================================================

export const SHOP_ITEMS: ShopItem[] = [
  // --- 18 FANTASY DUNGEON SKINS (NIKASTUDIO TOP-DOWN SPRITE PACK) ---
  {
    id: 'cultist',
    name: 'Cultist',
    category: 'skin',
    rarity: 'common',
    description: 'Occult Acolyte: Devotee of the forgotten catacombs, draped in dark crimson robes with arcane sigils.',
    price: 0,
    icon: '🔮',
    imageSrc: '/assets/characters/cultist.png'
  },
  {
    id: 'skeleton_warrior',
    name: 'Skeleton',
    category: 'skin',
    rarity: 'common',
    description: 'Risen Warrior: An ancient guardian reanimated from the bone crypts, clad in pitted iron.',
    price: 80,
    icon: '💀',
    imageSrc: '/assets/characters/skeleton_warrior.png'
  },
  {
    id: 'goblin',
    name: 'Goblin',
    category: 'skin',
    rarity: 'common',
    description: 'Dungeon Scavenger: A nimble cave-dweller wielding a crude cleaver and an obsession for shiny loot.',
    price: 90,
    icon: '👺',
    imageSrc: '/assets/characters/goblin.png'
  },
  {
    id: 'archer_hero',
    name: 'Archer',
    category: 'skin',
    rarity: 'rare',
    description: 'Keen Ranger: A deadly marksman hailing from the whispering forest, boasting unmatched bowstring speed.',
    price: 160,
    icon: '🏹',
    imageSrc: '/assets/characters/archer_hero.png'
  },
  {
    id: 'rogue',
    name: 'Rogue',
    category: 'skin',
    rarity: 'rare',
    description: 'Shadow Stalker: Slips through shadows unnoticed with dual daggers coated in paralyzing cavern venom.',
    price: 180,
    icon: '🗡️',
    imageSrc: '/assets/characters/rogue.png'
  },
  {
    id: 'necromancer',
    name: 'Necromancer',
    category: 'skin',
    rarity: 'rare',
    description: 'Soul Harvester: Channels the chill of the underworld with a staff carved from dragon bone.',
    price: 200,
    icon: '💀',
    imageSrc: '/assets/characters/necromancer.png'
  },
  {
    id: 'discoverer',
    name: 'Discoverer',
    category: 'skin',
    rarity: 'rare',
    description: 'Relic Seeker: Bold cartographer who mapped the deepest labyrinth levels and unsealed forgotten vaults.',
    price: 210,
    icon: '🧭',
    imageSrc: '/assets/characters/discoverer.png'
  },
  {
    id: 'white_mage',
    name: 'White Mage',
    category: 'skin',
    rarity: 'epic',
    description: 'High Cleric: A master of celestial radiance who wards allies against the creeping storm corruption.',
    price: 320,
    icon: '✨',
    imageSrc: '/assets/characters/white_mage.png'
  },
  {
    id: 'paladin',
    name: 'Paladin',
    category: 'skin',
    rarity: 'epic',
    description: 'Holy Crusader: Clad in polished silver and gold plate, brandishing a sacred sun-crest shield.',
    price: 340,
    icon: '🛡️',
    imageSrc: '/assets/characters/paladin.png'
  },
  {
    id: 'dark_knight',
    name: 'Dark Knight',
    category: 'skin',
    rarity: 'epic',
    description: 'Abyssal Champion: Forged in volcanic depths, bearing an obsidian greatsword that drinks enemy life.',
    price: 360,
    icon: '⚔️',
    imageSrc: '/assets/characters/dark_knight.png'
  },
  {
    id: 'warlock',
    name: 'Warlock',
    category: 'skin',
    rarity: 'epic',
    description: 'Eldritch Summoner: Commands chaotic nether-energies with a swirling orb of cosmic void.',
    price: 380,
    icon: '👁️',
    imageSrc: '/assets/characters/warlock.png'
  },
  {
    id: 'knight_hero',
    name: 'Knight Hero',
    category: 'skin',
    rarity: 'legendary',
    description: 'Crown Champion: The sovereign champion of the royal kingdom, clad in gleaming full plate and azure plume.',
    price: 600,
    icon: '👑',
    imageSrc: '/assets/characters/knight_hero.png'
  },
  {
    id: 'dragon_slayer',
    name: 'Dragon Slayer',
    category: 'skin',
    rarity: 'legendary',
    description: 'Wyrm Cleaver: Wears the impenetrable red scales of an ancient magma wyrm, wielding flame-forged steel.',
    price: 650,
    icon: '🐉',
    imageSrc: '/assets/characters/dragon_slayer.png'
  },
  {
    id: 'shadow_assassin',
    name: 'Shadow Assassin',
    category: 'skin',
    rarity: 'legendary',
    description: 'Night Reaper: A silent phantom cloaked in violet smoke ribbons, striking lethal blows from the dark.',
    price: 700,
    icon: '🥷',
    imageSrc: '/assets/characters/shadow_assassin.png'
  },
  {
    id: 'berserker',
    name: 'Berserker',
    category: 'skin',
    rarity: 'legendary',
    description: 'Iron Marauder: A hulking warrior wielding a double-headed battleaxe, entering frenzy when low on health.',
    price: 720,
    icon: '🪓',
    imageSrc: '/assets/characters/berserker.png'
  },
  {
    id: 'slime_king',
    name: 'Slime King',
    category: 'skin',
    rarity: 'mythic',
    description: 'Gelatinous Monarch: The sovereign ruler of all slimes, crowned in pure gold with a royal ruby.',
    price: 1500,
    icon: '👑',
    imageSrc: '/assets/characters/slime_king.png'
  },
  {
    id: 'overlord',
    name: 'Overlord',
    category: 'skin',
    rarity: 'mythic',
    description: 'Nether Tyrant: The apex demon king of the abyss, wrapped in living hellfire with a chaos scythe.',
    price: 1800,
    icon: '👹',
    imageSrc: '/assets/characters/overlord.png'
  },
  {
    id: 'archangel',
    name: 'Archangel',
    category: 'skin',
    rarity: 'mythic',
    description: 'Seraph of the Dawn: A towering divine celestial with burning wings of starlight and a blade of holy fire.',
    price: 2000,
    icon: '🪽',
    imageSrc: '/assets/characters/archangel.png'
  },

  // --- 10 WEAPONS (RANKED BY RARITY WITH ALTERNATE FIRE MODES) ---
  // 1. Common: Thermal Bunsen Burner
  {
    id: 'bunsen_burner',
    name: 'Thermal Bunsen Burner',
    category: 'weapon',
    rarity: 'common',
    description: 'Pressurized laboratory methane burner. High fire rate flame burst with continuous thermal cone spray.',
    price: 0,
    icon: '🔥',
    stats: {
      damage: 16,
      fireRate: 4.5,
      cooldownSeconds: 0.22,
      range: 340,
      beamColor: '#f97316',
      specialEffect: 'Thermal Spray',
      altFire: {
        altName: 'Overheat Heatwave',
        altCooldownSeconds: 3.0,
        altDamage: 32,
        altType: 'ring_wave',
        altDescription: 'Discharges an expanding 360° thermal flame shockwave pushing enemies back.'
      }
    }
  },

  // 2. Common: Corrosive Acid Pipette
  {
    id: 'acid_pipette',
    name: 'Corrosive Acid Pipette',
    category: 'weapon',
    rarity: 'common',
    description: 'Pressurized jet of dilute hydrochloric acid that rapidly dissolves defenses and leaves caustic residue.',
    price: 80,
    icon: '🧪',
    stats: {
      damage: 20,
      fireRate: 3.1,
      cooldownSeconds: 0.32,
      range: 380,
      beamColor: '#10b981',
      specialEffect: 'Acid Dissolution',
      altFire: {
        altName: 'Chemical Acid Splash',
        altCooldownSeconds: 3.5,
        altDamage: 25,
        altType: 'acid_pool',
        altDescription: 'Launches an acid vial creating a lingering corrosive toxic splash pool for 3.5s.'
      }
    }
  },

  // 3. Rare: Cryogenic Frost Ray
  {
    id: 'cryo_freeze_ray',
    name: 'Cryogenic Frost Ray',
    category: 'weapon',
    rarity: 'rare',
    description: 'Sub-zero liquid nitrogen emitter. Fires frosty beams that chill and slow enemy movement by 35% for 3.5s.',
    price: 180,
    icon: '❄️',
    stats: {
      damage: 28,
      fireRate: 2.2,
      cooldownSeconds: 0.45,
      range: 460,
      beamColor: '#06b6d4',
      specialEffect: 'Cryo Frost Chill (-35% Speed 3.5s)',
      altFire: {
        altName: 'Glacial Freeze Blast',
        altCooldownSeconds: 4.5,
        altDamage: 45,
        altType: 'freeze_blast',
        altDescription: 'Shoots a spread of icy crystals that shatter on impact and slow enemies by 35% for 3.5s.'
      }
    }
  },

  // 4. Rare: Prismatic Laser Cannon
  {
    id: 'laser_pointer',
    name: 'Prismatic Laser Cannon',
    category: 'weapon',
    rarity: 'rare',
    description: 'Coherent Ruby photon beam. Extreme range and piercing photons that penetrate through enemies to hit targets behind them.',
    price: 220,
    icon: '🔦',
    stats: {
      damage: 38,
      fireRate: 1.8,
      cooldownSeconds: 0.55,
      range: 640,
      beamColor: '#ef4444',
      specialEffect: 'Piercing Photon Beam',
      altFire: {
        altName: 'Prismatic Tri-Splitter',
        altCooldownSeconds: 4.0,
        altDamage: 32,
        altType: 'spread_beam',
        altDescription: 'Splits ruby beam through optical crystal to fire 3 enemy-piercing lasers across a 40° fan.'
      }
    }
  },

  // 5. Epic: Tesla Arc Disruptor
  {
    id: 'tesla_coil',
    name: 'Tesla Arc Disruptor',
    category: 'weapon',
    rarity: 'epic',
    description: 'High-voltage electrostatic discharging coil that crackles with chainable voltage arcs.',
    price: 340,
    icon: '⚡',
    stats: {
      damage: 35,
      fireRate: 3.6,
      cooldownSeconds: 0.28,
      range: 440,
      beamColor: '#38bdf8',
      specialEffect: 'Voltage Arc',
      altFire: {
        altName: 'EMP Pulse Nova',
        altCooldownSeconds: 5.0,
        altDamage: 50,
        altType: 'emp_burst',
        altDescription: 'Releases a radial 360° electromagnetic pulse wave knocking back nearby hostiles.'
      }
    }
  },

  // 6. Epic: Ultrasonic Resonator
  {
    id: 'centrifuge_sonic_blaster',
    name: 'Ultrasonic Resonator',
    category: 'weapon',
    rarity: 'epic',
    description: 'Fires high-decibel acoustic resonance shock rings that violently push back opponents and structures.',
    price: 380,
    icon: '🔊',
    stats: {
      damage: 48,
      fireRate: 1.4,
      cooldownSeconds: 0.70,
      range: 500,
      beamColor: '#eab308',
      specialEffect: 'Acoustic Shockwave',
      altFire: {
        altName: 'Acoustic Deflector Shield',
        altCooldownSeconds: 5.5,
        altDamage: 40,
        altType: 'sonic_barrier',
        altDescription: 'Deploys an ultrasonic barrier projecting around the player to deflect projectiles for 2.5s.'
      }
    }
  },

  // 7. Legendary: Relativistic Particle Accelerator
  {
    id: 'particle_accelerator',
    name: 'Relativistic Particle Accelerator',
    category: 'weapon',
    rarity: 'legendary',
    description: 'Relativistic particle collider firing supercharged dark matter plasma spheres that decimate barriers.',
    price: 520,
    icon: '🌀',
    stats: {
      damage: 68,
      fireRate: 1.1,
      cooldownSeconds: 0.95,
      range: 640,
      beamColor: '#a855f7',
      specialEffect: 'Dark Matter Plasma',
      altFire: {
        altName: 'Gravitational Vortex',
        altCooldownSeconds: 7.0,
        altDamage: 60,
        altType: 'vortex',
        altDescription: 'Generates a micro gravitational singularity pulling enemies inward and imploding.'
      }
    }
  },

  // 8. Legendary: Biohazard Mutagen Railgun
  {
    id: 'biohazard_railgun',
    name: 'Biohazard Mutagen Railgun',
    category: 'weapon',
    rarity: 'legendary',
    description: 'Electromagnetic railgun propelling radioactive tungsten slugs with supreme penetrating sniper velocity.',
    price: 580,
    icon: '☣️',
    stats: {
      damage: 88,
      fireRate: 0.9,
      cooldownSeconds: 1.15,
      range: 780,
      beamColor: '#84cc16',
      specialEffect: 'Radioactive Kinetic Slug',
      altFire: {
        altName: 'Mutagenic Cluster Bomb',
        altCooldownSeconds: 6.5,
        altDamage: 45,
        altType: 'cluster_bomb',
        altDescription: 'Launches 3 spreading toxic canisters that detonate into poisonous corrosive clouds.'
      }
    }
  },

  // 9. Mythic: Quantum Displacer Rifle (TELEPORTATION WEAPON)
  {
    id: 'quantum_displacer',
    name: 'Quantum Displacer Rifle',
    category: 'weapon',
    rarity: 'mythic',
    description: 'Harnesses quantum entanglement to fire tachyon bolts that distort spacetime. Teleportation alternate fire.',
    price: 780,
    icon: '🌌',
    stats: {
      damage: 54,
      fireRate: 4.0,
      cooldownSeconds: 0.25,
      range: 680,
      beamColor: '#06b6d4',
      specialEffect: 'Tachyon Quantum Phase',
      altFire: {
        altName: 'Quantum Warp Teleport',
        altCooldownSeconds: 3.5,
        altDamage: 40,
        altType: 'teleport',
        altDescription: 'Instantly teleports you directly to where your mouse is aimed in the arena! Emits arrival shock.'
      }
    }
  },

  // 10. Mythic: Antimatter Annihilator Core
  {
    id: 'antimatter_annihilator',
    name: 'Antimatter Annihilator Core',
    category: 'weapon',
    rarity: 'mythic',
    description: 'Top-secret particle synthesizer firing pure antiparticles that cause catastrophic subatomic annihilation.',
    price: 950,
    icon: '⚛️',
    stats: {
      damage: 115,
      fireRate: 0.7,
      cooldownSeconds: 1.35,
      range: 750,
      beamColor: '#f43f5e',
      specialEffect: 'Positron Annihilation',
      altFire: {
        altName: 'Orbital Positron Strike',
        altCooldownSeconds: 8.5,
        altDamage: 130,
        altType: 'orbital_strike',
        altDescription: 'Calls down an orbital positron death ray targeting the mouse position after 0.5s laser lock.'
      }
    }
  },

  // --- SPECIAL POWERS ---
  {
    id: 'element_shield',
    name: 'Element Shield',
    category: 'power',
    rarity: 'common',
    description: 'Instantly generate +40 bonus protective energy barrier around your avatar.',
    price: 0,
    icon: '🛡️',
    stats: {
      cooldownSeconds: 20,
      specialEffect: '+40 Shield Instantly'
    }
  },
  {
    id: 'damage_boost',
    name: 'Double Damage Boost',
    category: 'power',
    rarity: 'rare',
    description: 'Overcharges your equipped science weapon to deal 2x damage for 5 seconds.',
    price: 150,
    icon: '💥',
    stats: {
      cooldownSeconds: 25,
      duration: 5,
      specialEffect: '200% Attack Damage'
    }
  },
  {
    id: 'quantum_dash',
    name: 'Quantum Dash',
    category: 'power',
    rarity: 'epic',
    description: 'Instantly blink forward 150 pixels through molecular phase shift.',
    price: 240,
    icon: '💨',
    stats: {
      cooldownSeconds: 12,
      specialEffect: 'Phase Warp Blink'
    }
  },
  {
    id: 'matter_synthesizer',
    name: 'Material Synthesizer',
    category: 'power',
    rarity: 'legendary',
    description: 'Synthesizes emergency building materials (+15 Wood, +10 Brick, +5 Metal) on command.',
    price: 380,
    icon: '🧱',
    stats: {
      cooldownSeconds: 30,
      specialEffect: '+15 Wood, +10 Brick, +5 Metal'
    }
  }
];

// ============================================================================
// SCIENCE QUESTIONS FOR SUPPLY CRATES (CAMBRIDGE 0653)
// ============================================================================

export const CRATE_SCIENCE_QUESTIONS: ScienceQuestion[] = [
  {
    id: 'q_b_enzymes',
    question: 'What happens to enzymes when temperatures exceed their optimum threshold?',
    options: ['They replicate faster', 'Their active site denatures and changes shape', 'They become permanent co-factors', 'They convert into starch'],
    answerIndex: 1,
    explanation: 'High temperatures break hydrogen bonds, causing the active site to denature so the substrate can no longer fit.',
    subject: 'biology'
  },
  {
    id: 'q_b_diffusion',
    question: 'Which process describes net movement of particles from high to low concentration down a concentration gradient?',
    options: ['Osmosis', 'Active Transport', 'Diffusion', 'Transpiration'],
    answerIndex: 2,
    explanation: 'Diffusion is the net movement of particles down a concentration gradient as a result of their random movement.',
    subject: 'biology'
  },
  {
    id: 'q_c_neutralisation',
    question: 'When hydrochloric acid reacts with sodium hydroxide, what are the products?',
    options: ['Sodium chloride + Hydrogen', 'Sodium chloride + Water', 'Sodium carbonate + Water', 'Sodium oxide + Carbon dioxide'],
    answerIndex: 1,
    explanation: 'Acid + Alkali -> Salt + Water. HCl + NaOH -> NaCl + H2O.',
    subject: 'chemistry'
  },
  {
    id: 'q_c_exothermic',
    question: 'In an exothermic chemical reaction, what happens to thermal energy and temperature?',
    options: ['Energy is absorbed; temperature decreases', 'Energy is released; temperature of surroundings increases', 'No energy change occurs', 'Mass increases significantly'],
    answerIndex: 1,
    explanation: 'Exothermic reactions transfer thermal energy to the surroundings, causing the temperature to rise.',
    subject: 'chemistry'
  },
  {
    id: 'q_p_resistors',
    question: 'According to Ohm\'s Law, what is the formula relating Voltage (V), Current (I), and Resistance (R)?',
    options: ['V = I / R', 'V = I × R', 'V = I + R', 'V = R / I'],
    answerIndex: 1,
    explanation: 'Ohm\'s Law states Voltage = Current × Resistance (V = I × R).',
    subject: 'physics'
  },
  {
    id: 'q_p_fma',
    question: 'What is the resultant force needed to accelerate a 4 kg mass at 3 m/s²?',
    options: ['1.33 N', '7 N', '12 N', '0.75 N'],
    answerIndex: 2,
    explanation: 'Resultant Force F = m × a = 4 kg × 3 m/s² = 12 N.',
    subject: 'physics'
  },
  {
    id: 'q_b_photosynthesis',
    question: 'What are the two essential chemical reactants for plant photosynthesis?',
    options: ['Glucose + Oxygen', 'Carbon dioxide + Water', 'Carbon dioxide + Glucose', 'Nitrogen + Water'],
    answerIndex: 1,
    explanation: 'Photosynthesis equation: 6CO2 + 6H2O -> C6H12O6 + 6O2.',
    subject: 'biology'
  },
  {
    id: 'q_p_waves',
    question: 'Which region of the electromagnetic spectrum has the highest frequency?',
    options: ['Radio waves', 'Microwaves', 'Visible light', 'Gamma rays'],
    answerIndex: 3,
    explanation: 'Gamma rays possess the shortest wavelength and highest frequency in the electromagnetic spectrum.',
    subject: 'physics'
  }
];

export const LEVEL_UP_GOLD_REWARD = 50;
export const MAX_PRACTICE_QUIZ_QUESTIONS = 40;
export const MAX_PRACTICE_QUIZ_GOLD = 200;

/**
 * Calculates Gold earned for completing a Practice Quiz or Traffic Light Quiz.
 * Gold scales up monotonically with the number of questions completed,
 * with a maximum of 200 Gold for a 40-question quiz.
 */
export const calculateQuizGoldReward = (totalQuestions: number, score?: number): number => {
  const safeTotal = Math.max(0, Math.min(MAX_PRACTICE_QUIZ_QUESTIONS, Math.round(totalQuestions || 0)));
  if (safeTotal <= 0) return 0;

  const maxGoldForLength = Math.min(
    MAX_PRACTICE_QUIZ_GOLD,
    Math.round((safeTotal / MAX_PRACTICE_QUIZ_QUESTIONS) * MAX_PRACTICE_QUIZ_GOLD)
  );

  if (typeof score === 'number' && !isNaN(score)) {
    const safeScore = Math.max(0, Math.min(safeTotal, score));
    const accuracy = safeScore / safeTotal;
    // 75% completion base + 25% accuracy bonus so larger quizzes always earn more up to 200 Gold at 40 Qs
    const weighted = Math.round(maxGoldForLength * (0.75 + 0.25 * accuracy));
    return Math.max(1, Math.min(MAX_PRACTICE_QUIZ_GOLD, Math.min(maxGoldForLength, weighted)));
  }

  return Math.max(1, maxGoldForLength);
};

/**
 * Calculates XP earned alongside a completed Practice Quiz or Traffic Light Quiz.
 */
export const calculateQuizXPReward = (totalQuestions: number, score?: number): number => {
  const goldEarned = calculateQuizGoldReward(totalQuestions, score);
  if (goldEarned <= 0) return 0;
  return Math.max(10, Math.round(goldEarned * 0.5));
};

// Helper to calculate student level from XP
export const calculateLevelFromXP = (xp: number = 0): { level: number; currentLevelXp: number; nextLevelXp: number; progressPct: number } => {
  const safeXp = Math.max(0, xp);
  const xpPerLevel = 100;
  const level = Math.floor(safeXp / xpPerLevel) + 1;
  const currentLevelXp = safeXp % xpPerLevel;
  const nextLevelXp = xpPerLevel;
  const progressPct = Math.min(100, Math.round((currentLevelXp / nextLevelXp) * 100));
  return { level, currentLevelXp, nextLevelXp, progressPct };
};

// ============================================================================
// PROFILE & INVENTORY MANAGEMENT & OFFLINE QUOTA FALLBACK
// ============================================================================

// Local storage keys for resilient offline & quota-exceeded fallback
export const LOCAL_BATTLE_CONFIG_KEY = 'igcse_battle_config_fallback';
export const LOCAL_BATTLE_STATE_KEY = 'igcse_battle_state_fallback';
export const LOCAL_LOBBY_PLAYERS_KEY = 'igcse_battle_lobby_fallback';
export const LOCAL_ARENA_PLAYERS_KEY = 'igcse_battle_players_fallback';
export const LOCAL_STRUCTURES_KEY = 'igcse_battle_structures_fallback';
export const LOCAL_CRATES_KEY = 'igcse_battle_crates_fallback';

const memoryGameCache = new Map<string, any>();
const pendingPersistTimers = new Map<string, ReturnType<typeof setTimeout>>();

export function getLocalGameItem<T>(key: string, defaultVal: T): T {
  if (memoryGameCache.has(key)) {
    return memoryGameCache.get(key) as T;
  }
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
    const parsed = raw ? JSON.parse(raw) : defaultVal;
    memoryGameCache.set(key, parsed);
    return parsed;
  } catch {
    return defaultVal;
  }
}

export function setLocalGameItem(key: string, value: any): void {
  memoryGameCache.set(key, value);
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(value));
    }
  } catch {
    // quota exceeded or private mode
  }
}

/**
 * Updates fast in-memory cache immediately and debounces expensive JSON.stringify
 * localStorage writes so high-frequency 30-player Firestore snapshots never freeze the UI thread.
 */
export function scheduleLocalGameItem(key: string, value: any, delayMs: number = 2500): void {
  memoryGameCache.set(key, value);
  if (typeof window === 'undefined') return;
  if (pendingPersistTimers.has(key)) return;
  const timer = setTimeout(() => {
    pendingPersistTimers.delete(key);
    try {
      const latest = memoryGameCache.get(key);
      if (latest !== undefined) {
        localStorage.setItem(key, JSON.stringify(latest));
      }
    } catch {
      // ignore storage quota errors
    }
  }, delayMs);
  pendingPersistTimers.set(key, timer);
}

let isFirestoreQuotaExhausted = false;
let quotaExhaustedTimestamp = 0;
const QUOTA_BACKOFF_MS = 20000; // 20s cooldown for noisy position updates only

export const resetFirestoreQuotaState = (): void => {
  isFirestoreQuotaExhausted = false;
  quotaExhaustedTimestamp = 0;
};

export const handleFirestoreError = (err: any, context?: string): void => {
  if (err?.code === 'resource-exhausted' || (err?.message && err.message.toLowerCase().includes('quota exceeded'))) {
    if (!isFirestoreQuotaExhausted) {
      console.warn(`[Firestore Quota Exceeded] ${context || 'Listener'}: Throttling non-critical position syncs briefly.`);
    }
    isFirestoreQuotaExhausted = true;
    quotaExhaustedTimestamp = Date.now();
  } else {
    console.warn(`[Firestore ${context || 'Listener'}]`, err?.message || err);
  }
};

export const canPerformFirestoreWrite = (): boolean => {
  if (!isFirestoreQuotaExhausted) return true;
  if (Date.now() - quotaExhaustedTimestamp > QUOTA_BACKOFF_MS) {
    isFirestoreQuotaExhausted = false;
    return true;
  }
  return false;
};

export const ALL_FANTASY_SKIN_IDS = [
  'cultist', 'skeleton_warrior', 'goblin', 'slime', 'archer_hero', 'rogue',
  'necromancer', 'discoverer', 'bat', 'white_mage', 'paladin', 'dark_knight',
  'warlock', 'elitearcher', 'knight_hero', 'dragon_slayer', 'shadow_assassin',
  'slime_king', 'overlord'
];

export const ALL_CANONICAL_WEAPON_IDS = [
  'wpn_starter_blaster', 'bunsen_burner', 'acid_pipette', 'wpn_heavy_cannon',
  'wpn_rapid_repeater', 'wpn_sniper_railgun', 'wpn_freezer_lance', 'wpn_solar_disintegrator',
  'quantum_displacer', 'wpn_antimatter_rifle'
];

const DEFAULT_GAME_PROFILE: UserGameProfile = {
  uid: '',
  level: 1,
  xp: 0,
  gold: 100, // starting balance
  wood: 25,
  brick: 15,
  metal: 10,
  avatar: 'cultist',
  equippedSkin: 'cultist',
  equippedWeapon: 'wpn_starter_blaster',
  equippedPower: 'element_shield',
  inventory: ['cultist', 'wpn_starter_blaster', 'bunsen_burner', 'element_shield'],
  unlockedSkins: ['cultist'],
  giftedPacks: {},
  rewardHistory: [],
  monthlyCrown: false
};

export const normalizeUserGameProfile = (
  uid: string,
  data?: Record<string, any> | null
): UserGameProfile => {
  if (!data) {
    return { ...DEFAULT_GAME_PROFILE, uid, giftedPacks: {}, rewardHistory: [] };
  }

  const xp = Number(data.xp || 0);
  const level = Math.max(Number(data.level || 1), calculateLevelFromXP(xp).level);
  const isInstructor = data.role === 'instructor';
  const allPowerIds = ['element_shield', 'damage_boost', 'quantum_dash', 'matter_synthesizer'];

  const inv = isInstructor
    ? Array.from(new Set([...ALL_FANTASY_SKIN_IDS, ...ALL_CANONICAL_WEAPON_IDS, ...allPowerIds]))
    : (Array.isArray(data.inventory) ? [...data.inventory] : [...DEFAULT_GAME_PROFILE.inventory]);

  if (!inv.includes('cultist')) inv.push('cultist');
  if (!inv.includes('wpn_starter_blaster')) inv.push('wpn_starter_blaster');
  if (!inv.includes('bunsen_burner')) inv.push('bunsen_burner');

  const skins = isInstructor
    ? [...ALL_FANTASY_SKIN_IDS]
    : (Array.isArray(data.unlockedSkins)
        ? [...data.unlockedSkins]
        : inv.filter(id => ALL_FANTASY_SKIN_IDS.includes(id)));

  if (!skins.includes('cultist')) {
    skins.unshift('cultist');
  }

  const rawPacks = data.giftedPacks && typeof data.giftedPacks === 'object' ? data.giftedPacks : {};
  const giftedPacks: Record<string, number> = {};
  Object.entries(rawPacks).forEach(([packId, count]) => {
    const num = Math.max(0, Math.floor(Number(count) || 0));
    if (num > 0) giftedPacks[packId] = num;
  });

  const rewardHistory: InstructorRewardRecord[] = Array.isArray(data.rewardHistory)
    ? data.rewardHistory.slice(-25)
    : [];

  return {
    uid,
    level: isInstructor ? 99 : level,
    xp,
    role: data.role,
    gold: isInstructor ? 999999 : Math.max(0, Number(data.gold ?? data.goldCoins ?? DEFAULT_GAME_PROFILE.gold)),
    wood: isInstructor ? 9999 : Number(data.wood ?? DEFAULT_GAME_PROFILE.wood),
    brick: isInstructor ? 9999 : Number(data.brick ?? DEFAULT_GAME_PROFILE.brick),
    metal: isInstructor ? 9999 : Number(data.metal ?? DEFAULT_GAME_PROFILE.metal),
    avatar: data.equippedSkin || data.avatar || DEFAULT_GAME_PROFILE.avatar,
    equippedSkin: data.equippedSkin || data.avatar || DEFAULT_GAME_PROFILE.avatar,
    equippedWeapon: data.equippedWeapon || DEFAULT_GAME_PROFILE.equippedWeapon,
    equippedPower: data.equippedPower || DEFAULT_GAME_PROFILE.equippedPower,
    inventory: inv,
    unlockedSkins: skins,
    giftedPacks,
    rewardHistory,
    monthlyCrown: isInstructor ? true : Boolean(data.monthlyCrown)
  };
};

/**
 * Fetch a single student's RPG profile snapshot from Firestore (/users/{uid})
 */
export const fetchStudentGameProfile = async (uid: string): Promise<UserGameProfile> => {
  if (!uid) return { ...DEFAULT_GAME_PROFILE, uid: '' };
  const localKey = `igcse_game_profile_${uid}`;
  try {
    const userDocRef = doc(db, 'users', uid);
    const snap = await getDoc(userDocRef);
    const profile = normalizeUserGameProfile(uid, snap.exists() ? snap.data() : null);
    setLocalGameItem(localKey, profile);
    return profile;
  } catch (err) {
    handleFirestoreError(err, 'fetchStudentGameProfile');
    return getLocalGameItem<UserGameProfile>(localKey, { ...DEFAULT_GAME_PROFILE, uid });
  }
};

/**
 * Batch fetch RPG profiles for all students in a class (for Instructor Dashboard)
 */
export const fetchStudentsGameProfilesMap = async (
  studentIds: string[]
): Promise<Record<string, UserGameProfile>> => {
  const uniqueIds = Array.from(new Set(studentIds.filter(Boolean)));
  const result: Record<string, UserGameProfile> = {};
  if (uniqueIds.length === 0) return result;

  const CHUNK_SIZE = 20;
  for (let i = 0; i < uniqueIds.length; i += CHUNK_SIZE) {
    const chunk = uniqueIds.slice(i, i + CHUNK_SIZE);
    const settled = await Promise.all(
      chunk.map(async (uid) => {
        const profile = await fetchStudentGameProfile(uid);
        return { uid, profile };
      })
    );
    settled.forEach(({ uid, profile }) => {
      result[uid] = profile;
    });
  }
  return result;
};

/**
 * Subscribe to real-time student RPG profile in Firestore (/users/{uid})
 */
export const subscribeToGameProfile = (
  uid: string, 
  callback: (profile: UserGameProfile) => void
): (() => void) => {
  if (!uid) return () => {};
  
  const localKey = `igcse_game_profile_${uid}`;
  const localCached = getLocalGameItem<UserGameProfile | null>(localKey, null);
  if (localCached) {
    callback(localCached);
  }

  const handleLocalProfileEvent = (e: Event) => {
    const customEvent = e as CustomEvent<{ uid?: string; profile?: UserGameProfile }>;
    if (customEvent.detail?.uid === uid && customEvent.detail?.profile) {
      callback(customEvent.detail.profile);
    } else {
      const updatedLocal = getLocalGameItem<UserGameProfile | null>(localKey, null);
      if (updatedLocal) callback(updatedLocal);
    }
  };
  if (typeof window !== 'undefined') {
    window.addEventListener('igcse_game_profile_updated', handleLocalProfileEvent);
  }

  let unsubSnapshot: () => void = () => {};
  try {
    const userDocRef = doc(db, 'users', uid);
    unsubSnapshot = onSnapshot(userDocRef, (snap) => {
      const profile = normalizeUserGameProfile(uid, snap.exists() ? snap.data() : null);
      setLocalGameItem(localKey, profile);
      callback(profile);
    }, (err) => {
      handleFirestoreError(err, 'subscribeToGameProfile');
      const fallback = getLocalGameItem<UserGameProfile>(localKey, { ...DEFAULT_GAME_PROFILE, uid });
      callback(fallback);
    });
  } catch (err) {
    handleFirestoreError(err, 'subscribeToGameProfile');
    const fallback = getLocalGameItem<UserGameProfile>(localKey, { ...DEFAULT_GAME_PROFILE, uid });
    callback(fallback);
  }

  return () => {
    unsubSnapshot();
    if (typeof window !== 'undefined') {
      window.removeEventListener('igcse_game_profile_updated', handleLocalProfileEvent);
    }
  };
};

/**
 * Equip a skin, weapon, or power
 */
export const equipItem = async (
  uid: string,
  category: ShopCategory,
  itemId: string
): Promise<void> => {
  if (!uid || !itemId) return;
  const userDocRef = doc(db, 'users', uid);
  
  const updatePayload: Record<string, any> = {};
  if (category === 'skin') {
    updatePayload.avatar = itemId;
    updatePayload.equippedSkin = itemId;
  }
  if (category === 'weapon') updatePayload.equippedWeapon = itemId;
  if (category === 'power') updatePayload.equippedPower = itemId;

  await setDoc(userDocRef, updatePayload, { merge: true });

  // Sync to live arena player if present
  try {
    const arenaPlayerDoc = doc(db, 'battleEvent', 'players', 'items', uid);
    if (category === 'skin') {
      await setDoc(arenaPlayerDoc, { avatar: itemId }, { merge: true });
    } else if (category === 'weapon') {
      await setDoc(arenaPlayerDoc, { equippedWeapon: itemId }, { merge: true });
    }
  } catch (err) {
    // Arena session might not be active; ignore
  }
};

/**
 * Purchase an item from the Avatar & Loadout Shop
 */
export const buyShopItem = async (
  uid: string,
  item: ShopItem,
  currentGold: number,
  currentInventory: string[]
): Promise<{ success: boolean; message: string }> => {
  if (!uid) return { success: false, message: 'You must be signed in to purchase items.' };
  if (currentInventory.includes(item.id)) {
    return { success: false, message: 'You already own this item!' };
  }

  const userDocRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userDocRef);
  const isInstructor = userSnap.data()?.role === 'instructor';

  if (!isInstructor && currentGold < item.price) {
    return { success: false, message: `Insufficient Gold! You need ${item.price - currentGold} more Gold.` };
  }

  const newInventory = [...currentInventory, item.id];
  const newGold = isInstructor ? 999999 : currentGold - item.price;

  const updateData: Record<string, any> = {
    gold: newGold,
    inventory: newInventory
  };

  // Automatically equip purchased item
  if (item.category === 'skin') updateData.avatar = item.id;
  if (item.category === 'weapon') updateData.equippedWeapon = item.id;
  if (item.category === 'power') updateData.equippedPower = item.id;

  await updateDoc(userDocRef, updateData);

  return { success: true, message: `Successfully purchased ${item.name}!` };
};

/**
 * Teacher host action: Reset all students' gold, skins, and weapons back to the first common type.
 * Ensures instructors are preserved and all students start clean with 100 gold, Cultist skin, and Bunsen Burner.
 */
export const resetAllStudentsGameProfiles = async (
  instructorEmail?: string
): Promise<{ success: boolean; count: number; message: string }> => {
  try {
    const usersSnap = await getDocs(collection(db, 'users'));
    const batch = writeBatch(db);
    let count = 0;

    usersSnap.forEach((userDoc) => {
      const data = userDoc.data();
      // Skip instructors
      if (
        data.role === 'instructor' || 
        userDoc.id === 'corbanb_instructor' || 
        data.email === 'corbanb@gisboyshigh.net' || 
        data.email === 'sarahb@gisboyshigh.net' ||
        (instructorEmail && data.email === instructorEmail)
      ) {
        return;
      }

      const userRef = doc(db, 'users', userDoc.id);
      batch.update(userRef, {
        gold: 100,
        wood: 25,
        brick: 15,
        metal: 10,
        avatar: 'cultist',
        equippedSkin: 'cultist',
        unlockedSkins: ['cultist'],
        equippedWeapon: 'bunsen_burner',
        equippedPower: 'element_shield',
        inventory: ['cultist', 'bunsen_burner', 'element_shield'],
        giftedPacks: {},
        monthlyCrown: false
      });
      count++;
    });

    if (count > 0) {
      await batch.commit();
    }

    return {
      success: true,
      count,
      message: `Successfully reset ${count} students' loadouts back to common starter skins ('cultist'), weapons ('bunsen_burner'), and 100 gold!`
    };
  } catch (err: any) {
    console.error('Failed to reset student game profiles:', err);
    return {
      success: false,
      count: 0,
      message: `Failed to reset student profiles: ${err?.message || 'Firestore error'}`
    };
  }
};

/**
 * Atomically open a booster pack using either a free gifted pack or Gold coins.
 */
export const openBoosterPackTransaction = async (
  uid: string,
  options: {
    packId: string;
    packPrice: number;
    useGiftedPack: boolean;
    unlockedItemId: string;
    unlockedItemType: 'skin' | 'weapon';
    isInstructor?: boolean;
  }
): Promise<{ success: boolean; profile?: UserGameProfile; error?: string }> => {
  if (!uid) return { success: false, error: 'Missing user ID.' };
  const localKey = `igcse_game_profile_${uid}`;

  try {
    const userRef = doc(db, 'users', uid);
    const updatedProfile = await runTransaction(db, async (tx) => {
      const snap = await tx.get(userRef);
      const data = snap.exists() ? snap.data() : {};
      const current = normalizeUserGameProfile(uid, data);

      const giftedMap: Record<string, number> = { ...(current.giftedPacks || {}) };
      const availableGifted = Math.max(0, Number(giftedMap[options.packId] || 0));

      let nextGold = current.gold;
      if (options.useGiftedPack) {
        if (availableGifted <= 0) {
          throw new Error('No gifted packs of this tier remaining.');
        }
        const remaining = availableGifted - 1;
        if (remaining > 0) {
          giftedMap[options.packId] = remaining;
        } else {
          delete giftedMap[options.packId];
        }
      } else if (!options.isInstructor) {
        if (current.gold < options.packPrice) {
          throw new Error(`Insufficient Gold! You need ${options.packPrice} Gold.`);
        }
        nextGold = Math.max(0, current.gold - options.packPrice);
      }

      const nextUnlockedSkins =
        options.unlockedItemType === 'skin' && !(current.unlockedSkins || []).includes(options.unlockedItemId)
          ? [...(current.unlockedSkins || ['cultist']), options.unlockedItemId]
          : [...(current.unlockedSkins || ['cultist'])];

      const nextInventory = current.inventory.includes(options.unlockedItemId)
        ? [...current.inventory]
        : [...current.inventory, options.unlockedItemId];

      const writePayload: Record<string, any> = {
        giftedPacks: giftedMap,
        unlockedSkins: nextUnlockedSkins,
        inventory: nextInventory
      };

      if (!options.isInstructor) {
        writePayload.gold = nextGold;
        writePayload.goldCoins = nextGold;
      }

      tx.set(userRef, writePayload, { merge: true });

      return normalizeUserGameProfile(uid, {
        ...data,
        ...writePayload
      });
    });

    setLocalGameItem(localKey, updatedProfile);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('igcse_game_profile_updated', { detail: { uid, profile: updatedProfile } }));
    }
    return { success: true, profile: updatedProfile };
  } catch (err: any) {
    handleFirestoreError(err, 'openBoosterPackTransaction');
    return { success: false, error: err?.message || 'Failed to open booster pack.' };
  }
};

export interface AwardRewardParams {
  targetStudents: { studentId: string; name?: string; email?: string }[];
  rewardType: InstructorRewardType;
  packId?: string;
  quantity?: number;
  goldAmount?: number;
  skinId?: string;
  weaponId?: string;
  itemName: string;
  note?: string;
  instructor: { id: string; name: string; email?: string };
}

/**
 * Instructor Reward System:
 * Grant Booster Packs, Gold, Skins, or Weapons to one or multiple students.
 * Persists atomically to /users/{studentId} and dispatches an in-app notification.
 */
export const awardInstructorReward = async (
  params: AwardRewardParams
): Promise<{
  success: boolean;
  updatedCount: number;
  message: string;
  updatedProfiles: Record<string, UserGameProfile>;
}> => {
  const { targetStudents, rewardType, packId, skinId, weaponId, itemName, note, instructor } = params;
  const quantity = Math.max(1, Math.floor(Number(params.quantity) || 1));
  const goldAmount = Math.max(1, Math.floor(Number(params.goldAmount) || 0));

  if (!targetStudents || targetStudents.length === 0) {
    return { success: false, updatedCount: 0, message: 'No recipient students selected.', updatedProfiles: {} };
  }

  const nowIso = new Date().toISOString();
  const baseRewardId = `rew_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const updatedProfiles: Record<string, UserGameProfile> = {};
  let updatedCount = 0;

  for (const target of targetStudents) {
    const uid = target.studentId;
    if (!uid) continue;

    const rewardRecord: InstructorRewardRecord = {
      id: `${baseRewardId}_${uid.slice(0, 6)}`,
      rewardType,
      itemId:
        rewardType === 'booster_pack'
          ? packId
          : rewardType === 'skin'
          ? skinId
          : rewardType === 'weapon'
          ? weaponId
          : 'gold',
      itemName,
      quantity: rewardType === 'gold' ? goldAmount : quantity,
      note: note?.trim() || undefined,
      awardedBy: instructor.name || 'Instructor',
      awardedByEmail: instructor.email,
      awardedAt: nowIso
    };

    try {
      const userRef = doc(db, 'users', uid);
      const updated = await runTransaction(db, async (tx) => {
        const snap = await tx.get(userRef);
        const existingData = snap.exists() ? snap.data() : {
          uid,
          name: target.name || 'Student',
          email: target.email || '',
          role: 'student'
        };
        const current = normalizeUserGameProfile(uid, existingData);

        const nextHistory = [...(current.rewardHistory || []), rewardRecord].slice(-25);
        const updateFields: Record<string, any> = {
          rewardHistory: nextHistory
        };

        if (!snap.exists()) {
          updateFields.uid = uid;
          updateFields.name = target.name || 'Student';
          updateFields.email = target.email || '';
          updateFields.role = 'student';
          updateFields.gold = current.gold;
          updateFields.inventory = current.inventory;
          updateFields.unlockedSkins = current.unlockedSkins;
          updateFields.equippedSkin = current.equippedSkin;
          updateFields.equippedWeapon = current.equippedWeapon;
          updateFields.equippedPower = current.equippedPower;
          updateFields.level = current.level;
          updateFields.xp = current.xp;
        }

        if (rewardType === 'booster_pack' && packId) {
          const nextGifted = { ...(current.giftedPacks || {}) };
          nextGifted[packId] = Math.max(0, Number(nextGifted[packId] || 0)) + quantity;
          updateFields.giftedPacks = nextGifted;
        } else if (rewardType === 'gold') {
          const nextGold = Math.max(0, current.gold + goldAmount);
          updateFields.gold = nextGold;
          updateFields.goldCoins = nextGold;
        } else if (rewardType === 'skin' && skinId) {
          const nextSkins = (current.unlockedSkins || ['cultist']).includes(skinId)
            ? [...(current.unlockedSkins || ['cultist'])]
            : [...(current.unlockedSkins || ['cultist']), skinId];
          const nextInv = current.inventory.includes(skinId)
            ? [...current.inventory]
            : [...current.inventory, skinId];
          updateFields.unlockedSkins = nextSkins;
          updateFields.inventory = nextInv;
        } else if (rewardType === 'weapon' && weaponId) {
          const nextInv = current.inventory.includes(weaponId)
            ? [...current.inventory]
            : [...current.inventory, weaponId];
          updateFields.inventory = nextInv;
        }

        tx.set(userRef, updateFields, { merge: true });

        return normalizeUserGameProfile(uid, {
          ...existingData,
          ...updateFields
        });
      });

      updatedProfiles[uid] = updated;
      setLocalGameItem(`igcse_game_profile_${uid}`, updated);

      // Write an in-app notification so the student sees a celebratory alert
      const rewardLabel =
        rewardType === 'gold'
          ? `+${goldAmount} Gold`
          : rewardType === 'booster_pack'
          ? `${quantity}x ${itemName}`
          : itemName;

      const notifId = `reward_${baseRewardId}_${uid}`;
      await setDoc(doc(db, 'notifications', notifId), {
        id: notifId,
        type: 'instructor_reward',
        rewardType,
        itemName: rewardLabel,
        title: `Reward Received: ${rewardLabel}`,
        message: note?.trim()
          ? `${instructor.name || 'Your instructor'} awarded you ${rewardLabel}: "${note.trim()}"`
          : `${instructor.name || 'Your instructor'} awarded you ${rewardLabel}.`,
        awardedBy: instructor.name || 'Instructor',
        createdAt: nowIso,
        targetStudentIds: [uid]
      }).catch(() => {});

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('igcse_game_profile_updated', { detail: { uid, profile: updated } }));
      }

      updatedCount++;
    } catch (err) {
      handleFirestoreError(err, 'awardInstructorReward');
    }
  }

  if (updatedCount === 0) {
    return {
      success: false,
      updatedCount: 0,
      message: 'Failed to deliver reward. Please check your connection and try again.',
      updatedProfiles
    };
  }

  const recipientSummary =
    targetStudents.length === 1
      ? targetStudents[0].name || 'student'
      : `${updatedCount} students`;

  const summaryItem =
    rewardType === 'gold'
      ? `${goldAmount} Gold`
      : rewardType === 'booster_pack'
      ? `${quantity}× ${itemName}`
      : itemName;

  return {
    success: true,
    updatedCount,
    message: `Awarded ${summaryItem} to ${recipientSummary}.`,
    updatedProfiles
  };
};

// ============================================================================
// MODULE 2: ANTI-EXPLOIT SLIDE REVISION VERIFICATION & REWARDS
// ============================================================================

export interface ModuleClaimResult {
  success: boolean;
  alreadyClaimed: boolean;
  message: string;
  rewards?: {
    wood: number;
    brick: number;
    metal: number;
    xp: number;
    gold: number;
  };
}

const LOCAL_CLAIMED_MODULES_PREFIX = 'igcse_claimed_modules_';

function getClaimedModulesSet(uid: string): Set<string> {
  const list = getLocalGameItem<string[]>(`${LOCAL_CLAIMED_MODULES_PREFIX}${uid}`, []);
  return new Set(list);
}

function saveClaimedModuleLocally(uid: string, moduleId: string): void {
  const currentSet = getClaimedModulesSet(uid);
  currentSet.add(moduleId);
  setLocalGameItem(`${LOCAL_CLAIMED_MODULES_PREFIX}${uid}`, Array.from(currentSet));
}

/**
 * Check if a student has already claimed rewards for a specific revision module.
 * Prioritizes fast local storage check to avoid unnecessary Firestore read quota.
 */
export const checkModuleClaimed = async (uid: string, moduleId: string): Promise<boolean> => {
  if (!uid || !moduleId) return false;

  // 1. Check local cache first - instant and zero Firestore read cost
  const localClaimed = getClaimedModulesSet(uid);
  if (localClaimed.has(moduleId)) {
    return true;
  }

  // If quota is exhausted or circuit-breaker active, return local check result immediately
  if (!canPerformFirestoreWrite()) {
    return false;
  }

  try {
    const claimDocRef = doc(db, 'users', uid, 'completedModules', moduleId);
    const snap = await getDoc(claimDocRef);
    if (snap.exists()) {
      saveClaimedModuleLocally(uid, moduleId);
      return true;
    }
    return false;
  } catch (e: any) {
    handleFirestoreError(e, 'checkModuleClaimed');
    return false;
  }
};

export interface QuizAndLevelRewardResult {
  quizGold: number;
  levelUpGold: number;
  totalGoldAdded: number;
  xpAdded: number;
  levelsGained: number;
  newGameLevel: number;
  newScholarLevel: number;
}

const REWARDED_LEVELS_PREFIX = 'igcse_rewarded_levels_';

interface RewardedLevelsRecord {
  gameLevel: number;
  scholarLevel: number;
}

function getLocalRewardedLevels(uid: string): RewardedLevelsRecord | null {
  return getLocalGameItem<RewardedLevelsRecord | null>(`${REWARDED_LEVELS_PREFIX}${uid}`, null);
}

function setLocalRewardedLevels(uid: string, record: RewardedLevelsRecord): void {
  setLocalGameItem(`${REWARDED_LEVELS_PREFIX}${uid}`, record);
}

function dispatchGameProfileUpdated(uid: string, profile: UserGameProfile): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('igcse_game_profile_updated', { detail: { uid, profile } }));
  }
}

/**
 * Initializes the local baseline of rewarded levels on sign-in / boot
 * so historical levels are never retroactively double-paid, while all new level-ups earn Gold.
 */
export const ensureRewardedLevelBaseline = (
  uid: string,
  currentScholarLevel: number,
  currentGameLevel?: number
): void => {
  if (!uid) return;
  const existing = getLocalRewardedLevels(uid);
  const localProfile = getLocalGameItem<UserGameProfile | null>(`igcse_game_profile_${uid}`, null);
  const detectedGameLevel = currentGameLevel ?? calculateLevelFromXP(localProfile?.xp || 0).level;
  if (!existing) {
    setLocalRewardedLevels(uid, {
      gameLevel: Math.max(1, detectedGameLevel),
      scholarLevel: Math.max(1, currentScholarLevel)
    });
  }
};

/**
 * Awards Gold and XP when a student completes a Practice Quiz or Traffic Light Quiz,
 * and awards bonus Level-Up Gold whenever their Game XP Level OR Scholar Rank Level increases.
 */
export const awardQuizAndLevelGold = async (params: {
  uid: string;
  quizQuestionsCompleted?: number;
  quizScore?: number;
  prevScholarLevel: number;
  newScholarLevel: number;
  isInstructorPreview?: boolean;
}): Promise<QuizAndLevelRewardResult> => {
  const {
    uid,
    quizQuestionsCompleted = 0,
    quizScore,
    prevScholarLevel,
    newScholarLevel,
    isInstructorPreview = false
  } = params;

  const quizGold = quizQuestionsCompleted > 0
    ? calculateQuizGoldReward(quizQuestionsCompleted, quizScore)
    : 0;
  const xpAdded = quizQuestionsCompleted > 0
    ? calculateQuizXPReward(quizQuestionsCompleted, quizScore)
    : 0;

  if (!uid) {
    return {
      quizGold,
      levelUpGold: 0,
      totalGoldAdded: quizGold,
      xpAdded,
      levelsGained: 0,
      newGameLevel: 1,
      newScholarLevel: Math.max(1, newScholarLevel)
    };
  }

  const localKey = `igcse_game_profile_${uid}`;
  const localProfile = getLocalGameItem<UserGameProfile>(localKey, { ...DEFAULT_GAME_PROFILE, uid });
  const localRewarded = getLocalRewardedLevels(uid);

  let remoteData: Record<string, any> = {};
  if (!isInstructorPreview && canPerformFirestoreWrite()) {
    try {
      const snap = await getDoc(doc(db, 'users', uid));
      if (snap.exists()) {
        remoteData = snap.data() || {};
      }
    } catch (e) {
      handleFirestoreError(e, 'awardQuizAndLevelGold:read');
    }
  }

  const isActualInstructor = remoteData.role === 'instructor' || localProfile.role === 'instructor';
  const prevXp = Math.max(Number(remoteData.xp || 0), localProfile.xp || 0);
  const newXp = prevXp + xpAdded;

  const prevComputedGameLevel = calculateLevelFromXP(prevXp).level;
  const newComputedGameLevel = calculateLevelFromXP(newXp).level;
  const baselineGameLevel = Math.max(
    1,
    Number(remoteData.rewardedGameLevel || 0),
    localRewarded?.gameLevel || 0,
    prevComputedGameLevel
  );
  const gameLevelsGained = Math.max(0, newComputedGameLevel - baselineGameLevel);

  const baselineScholarLevel = Math.max(
    1,
    Number(remoteData.rewardedScholarLevel || 0),
    localRewarded?.scholarLevel || 0,
    prevScholarLevel
  );
  const scholarLevelsGained = Math.max(0, newScholarLevel - baselineScholarLevel);

  const levelsGained = gameLevelsGained + scholarLevelsGained;
  const levelUpGold = levelsGained * LEVEL_UP_GOLD_REWARD;
  const totalGoldAdded = quizGold + levelUpGold;

  if (isInstructorPreview || isActualInstructor) {
    return {
      quizGold,
      levelUpGold,
      totalGoldAdded,
      xpAdded,
      levelsGained,
      newGameLevel: newComputedGameLevel,
      newScholarLevel: Math.max(baselineScholarLevel, newScholarLevel)
    };
  }

  const nextRewardedGameLevel = Math.max(baselineGameLevel, newComputedGameLevel);
  const nextRewardedScholarLevel = Math.max(baselineScholarLevel, newScholarLevel);
  setLocalRewardedLevels(uid, {
    gameLevel: nextRewardedGameLevel,
    scholarLevel: nextRewardedScholarLevel
  });

  const baseGold = Math.max(Number(remoteData.gold ?? remoteData.goldCoins ?? localProfile.gold ?? DEFAULT_GAME_PROFILE.gold), 0);
  const updatedLocalProfile: UserGameProfile = {
    ...localProfile,
    uid,
    xp: newXp,
    level: Math.max(localProfile.level || 1, newComputedGameLevel),
    gold: baseGold + totalGoldAdded
  };
  setLocalGameItem(localKey, updatedLocalProfile);
  dispatchGameProfileUpdated(uid, updatedLocalProfile);

  if ((totalGoldAdded > 0 || xpAdded > 0 || levelsGained > 0 || newScholarLevel > (Number(remoteData.rewardedScholarLevel) || 0)) && canPerformFirestoreWrite()) {
    try {
      const userDocRef = doc(db, 'users', uid);
      const writePayload: Record<string, any> = {
        level: nextRewardedGameLevel,
        rewardedGameLevel: nextRewardedGameLevel,
        rewardedScholarLevel: nextRewardedScholarLevel,
        lastActive: new Date().toISOString()
      };
      if (xpAdded > 0) writePayload.xp = increment(xpAdded);
      if (totalGoldAdded > 0) writePayload.gold = increment(totalGoldAdded);
      await setDoc(userDocRef, writePayload, { merge: true });
    } catch (e) {
      handleFirestoreError(e, 'awardQuizAndLevelGold:write');
    }
  }

  return {
    quizGold,
    levelUpGold,
    totalGoldAdded,
    xpAdded,
    levelsGained,
    newGameLevel: nextRewardedGameLevel,
    newScholarLevel: nextRewardedScholarLevel
  };
};

/**
 * Disburse genuine revision rewards to student's Firestore profile
 * Guaranteed anti-farming check: verifies /users/{uid}/completedModules/{moduleId}
 */
export const claimModuleRevisionReward = async (
  uid: string,
  moduleId: string,
  slideCount: number,
  totalDwellSeconds: number
): Promise<ModuleClaimResult> => {
  if (!uid || !moduleId) {
    return { success: false, alreadyClaimed: false, message: 'Student ID and Module ID required.' };
  }

  // Anti-exploit check: dwell time threshold (must exceed 1 full minute = 60s)
  const requiredSeconds = 60;
  if (totalDwellSeconds < requiredSeconds) {
    return {
      success: false,
      alreadyClaimed: false,
      message: `Anti-exploit gate active: you spent ${totalDwellSeconds}s (minimum 60s / 1 full minute required, and all slides must be clicked through).`
    };
  }

  const localClaimed = getClaimedModulesSet(uid);
  if (localClaimed.has(moduleId)) {
    return {
      success: false,
      alreadyClaimed: true,
      message: 'Module completed! Complete topic quizzes for additional materials.'
    };
  }

  // Check for level-up from +50 XP
  const localProfile = getLocalGameItem<UserGameProfile | null>(`igcse_game_profile_${uid}`, null);
  const localRewarded = getLocalRewardedLevels(uid);
  const prevXp = localProfile?.xp || 0;
  const newXp = prevXp + 50;
  const prevLevel = Math.max(calculateLevelFromXP(prevXp).level, localRewarded?.gameLevel || 1);
  const newLevel = calculateLevelFromXP(newXp).level;
  const levelsGained = Math.max(0, newLevel - prevLevel);
  const levelUpGold = levelsGained * LEVEL_UP_GOLD_REWARD;

  // Genuine first-time reward: +20 Wood, +10 Brick, +5 Metal, +50 XP, +20 Gold (+ levelUpGold if leveled up)
  const rewards = {
    wood: 20,
    brick: 10,
    metal: 5,
    xp: 50,
    gold: 20 + levelUpGold
  };

  // Mark claimed locally immediately
  saveClaimedModuleLocally(uid, moduleId);

  // Update local profile immediately
  if (localProfile) {
    const updated: UserGameProfile = {
      ...localProfile,
      wood: (localProfile.wood || 0) + rewards.wood,
      brick: (localProfile.brick || 0) + rewards.brick,
      metal: (localProfile.metal || 0) + rewards.metal,
      xp: (localProfile.xp || 0) + rewards.xp,
      level: Math.max(localProfile.level || 1, newLevel),
      gold: (localProfile.gold || 0) + rewards.gold
    };
    setLocalGameItem(`igcse_game_profile_${uid}`, updated);
    if (levelsGained > 0) {
      setLocalRewardedLevels(uid, {
        gameLevel: newLevel,
        scholarLevel: localRewarded?.scholarLevel || 1
      });
    }
    dispatchGameProfileUpdated(uid, updated);
  }

  if (canPerformFirestoreWrite()) {
    try {
      const claimDocRef = doc(db, 'users', uid, 'completedModules', moduleId);
      const claimSnap = await getDoc(claimDocRef);

      if (claimSnap.exists()) {
        return {
          success: false,
          alreadyClaimed: true,
          message: 'Module completed! Complete topic quizzes for additional materials.'
        };
      }

      const userDocRef = doc(db, 'users', uid);

      // Write claim record
      await setDoc(claimDocRef, {
        claimedAt: new Date().toISOString(),
        ...rewards
      });

      // Increment student profile
      await setDoc(userDocRef, {
        wood: increment(rewards.wood),
        brick: increment(rewards.brick),
        metal: increment(rewards.metal),
        xp: increment(rewards.xp),
        gold: increment(rewards.gold),
        level: newLevel,
        rewardedGameLevel: Math.max(prevLevel, newLevel)
      }, { merge: true });
    } catch (e: any) {
      handleFirestoreError(e, 'claimModuleRevisionReward');
    }
  }

  return {
    success: true,
    alreadyClaimed: false,
    message: levelUpGold > 0
      ? `Genuine revision verified! +20 Wood, +10 Brick, +5 Metal, +50 XP, and +${rewards.gold} Gold (including +${levelUpGold} Level-Up Bonus!) added to your loadout.`
      : 'Genuine revision verified! +20 Wood, +10 Brick, +5 Metal, +50 XP, and +20 Gold added to your loadout.',
    rewards
  };
};

// ============================================================================
// MODULE 3 & 4: TOURNAMENT LOBBY & TEACHER HOST CONTROLS
// ============================================================================

const DEFAULT_EVENT_CONFIG: BattleEventConfig = {
  nextEventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  title: 'Monthly Cambridge 0653 Revision Royale',
  description: 'Battle Royale arena tournament — build walls, dodge the shrinking storm, and answer Science Supply Crates!',
  season: 1
};

const DEFAULT_EVENT_STATE: BattleEventState = {
  status: 'LOBBY',
  isLobbyOpen: false, // Students do not have access until instructor opens the lobby
  startedAt: null,
  stormRadius: 3600,
  stormCenter: { x: 2500, y: 2500 },
  currentWinner: null
};

/**
 * Subscribe to the event schedule config (/battleEvent/config)
 */
export const subscribeToBattleConfig = (
  callback: (config: BattleEventConfig) => void
): (() => void) => {
  const cached = getLocalGameItem<BattleEventConfig>(LOCAL_BATTLE_CONFIG_KEY, DEFAULT_EVENT_CONFIG);
  callback(cached);

  try {
    const configDoc = doc(db, 'battleEvent', 'config');
    return onSnapshot(configDoc, (snap) => {
      if (snap.exists()) {
        const data = snap.data() as BattleEventConfig;
        setLocalGameItem(LOCAL_BATTLE_CONFIG_KEY, data);
        callback(data);
      } else {
        callback(DEFAULT_EVENT_CONFIG);
      }
    }, (err) => {
      handleFirestoreError(err, 'subscribeToBattleConfig');
      callback(getLocalGameItem<BattleEventConfig>(LOCAL_BATTLE_CONFIG_KEY, DEFAULT_EVENT_CONFIG));
    });
  } catch (err) {
    handleFirestoreError(err, 'subscribeToBattleConfig');
    return () => {};
  }
};

/**
 * Teacher control: Update tournament schedule
 */
export const updateBattleConfig = async (config: Partial<BattleEventConfig>): Promise<void> => {
  const current = getLocalGameItem<BattleEventConfig>(LOCAL_BATTLE_CONFIG_KEY, DEFAULT_EVENT_CONFIG);
  setLocalGameItem(LOCAL_BATTLE_CONFIG_KEY, { ...current, ...config });

  if (!canPerformFirestoreWrite()) return;
  try {
    const configDoc = doc(db, 'battleEvent', 'config');
    await setDoc(configDoc, config, { merge: true });
  } catch (err) {
    handleFirestoreError(err, 'updateBattleConfig');
  }
};

/**
 * Teacher host control: Open or close the tournament lobby for students
 */
export const setLobbyOpen = async (isOpen: boolean): Promise<void> => {
  const current = getLocalGameItem<BattleEventState>(LOCAL_BATTLE_STATE_KEY, DEFAULT_EVENT_STATE);
  const updated: BattleEventState = { ...current, isLobbyOpen: isOpen };
  setLocalGameItem(LOCAL_BATTLE_STATE_KEY, updated);

  if (!canPerformFirestoreWrite()) return;
  try {
    const stateDoc = doc(db, 'battleEvent', 'state');
    await setDoc(stateDoc, { isLobbyOpen: isOpen }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, 'setLobbyOpen');
  }
};

/**
 * Subscribe to the live arena state (/battleEvent/state)
 */
export const subscribeToBattleState = (
  callback: (state: BattleEventState) => void
): (() => void) => {
  const cached = getLocalGameItem<BattleEventState>(LOCAL_BATTLE_STATE_KEY, DEFAULT_EVENT_STATE);
  callback(cached);

  try {
    const stateDoc = doc(db, 'battleEvent', 'state');
    return onSnapshot(stateDoc, (snap) => {
      if (snap.exists()) {
        const data = snap.data() as BattleEventState;
        setLocalGameItem(LOCAL_BATTLE_STATE_KEY, data);
        callback(data);
      } else {
        callback(DEFAULT_EVENT_STATE);
      }
    }, (err) => {
      handleFirestoreError(err, 'subscribeToBattleState');
      callback(getLocalGameItem<BattleEventState>(LOCAL_BATTLE_STATE_KEY, DEFAULT_EVENT_STATE));
    });
  } catch (err) {
    handleFirestoreError(err, 'subscribeToBattleState');
    return () => {};
  }
};

/**
 * Subscribe to connected students waiting in the lobby (/battleEvent/lobby)
 */
export const subscribeToLobby = (
  callback: (players: LobbyPlayer[]) => void
): (() => void) => {
  const cached = getLocalGameItem<LobbyPlayer[]>(LOCAL_LOBBY_PLAYERS_KEY, []);
  callback(cached);

  try {
    const lobbyColl = collection(db, 'battleEvent', 'lobby', 'members');
    return onSnapshot(lobbyColl, (snap) => {
      const seenUids = new Set<string>();
      const list: LobbyPlayer[] = [];
      snap.forEach((docSnap) => {
        const data = docSnap.data() as Partial<LobbyPlayer>;
        const resolvedUid = (data.uid || docSnap.id || '').trim();
        if (!resolvedUid || seenUids.has(resolvedUid)) return;
        seenUids.add(resolvedUid);
        list.push({ ...(data as LobbyPlayer), uid: resolvedUid });
      });
      setLocalGameItem(LOCAL_LOBBY_PLAYERS_KEY, list);
      callback(list);
    }, (err) => {
      handleFirestoreError(err, 'subscribeToLobby');
      callback(getLocalGameItem<LobbyPlayer[]>(LOCAL_LOBBY_PLAYERS_KEY, []));
    });
  } catch (err) {
    handleFirestoreError(err, 'subscribeToLobby');
    return () => {};
  }
};

/**
 * Student action: Join Lobby
 */
export const joinLobby = async (player: LobbyPlayer): Promise<void> => {
  if (!player.uid) return;
  const currentLobby = getLocalGameItem<LobbyPlayer[]>(LOCAL_LOBBY_PLAYERS_KEY, []);
  const nextLobby = [...currentLobby.filter(p => p.uid !== player.uid), { ...player, joinedAt: new Date().toISOString() }];
  setLocalGameItem(LOCAL_LOBBY_PLAYERS_KEY, nextLobby);

  if (!canPerformFirestoreWrite()) return;
  try {
    const playerDoc = doc(db, 'battleEvent', 'lobby', 'members', player.uid);
    await setDoc(playerDoc, {
      ...player,
      joinedAt: new Date().toISOString()
    });
  } catch (err) {
    handleFirestoreError(err, 'joinLobby');
  }
};

/**
 * Student action: Leave Lobby
 */
export const leaveLobby = async (uid: string): Promise<void> => {
  if (!uid) return;
  const currentLobby = getLocalGameItem<LobbyPlayer[]>(LOCAL_LOBBY_PLAYERS_KEY, []);
  setLocalGameItem(LOCAL_LOBBY_PLAYERS_KEY, currentLobby.filter(p => p.uid !== uid));

  if (!canPerformFirestoreWrite()) return;
  try {
    const playerDoc = doc(db, 'battleEvent', 'lobby', 'members', uid);
    await deleteDoc(playerDoc);
  } catch (err) {
    handleFirestoreError(err, 'leaveLobby');
  }
};

/**
 * Student action: Toggle Ready Status
 */
export const setLobbyReady = async (uid: string, isReady: boolean): Promise<void> => {
  if (!uid) return;
  const playerDoc = doc(db, 'battleEvent', 'lobby', 'members', uid);
  try {
    await setDoc(playerDoc, { isReady }, { merge: true });
  } catch (err) {
    console.warn('Error setting lobby ready state:', err);
  }
};

// ============================================================================
// MODULE 4: TEACHER BATTLE CONTROLS
// ============================================================================

type BatchOp =
  | { type: 'set'; ref: ReturnType<typeof doc>; data: any }
  | { type: 'delete'; ref: ReturnType<typeof doc> };

const commitBatchOpsInChunks = async (ops: BatchOp[], chunkSize: number = 400): Promise<void> => {
  for (let i = 0; i < ops.length; i += chunkSize) {
    const slice = ops.slice(i, i + chunkSize);
    const batch = writeBatch(db);
    for (const op of slice) {
      if (op.type === 'set') {
        batch.set(op.ref, op.data);
      } else {
        batch.delete(op.ref);
      }
    }
    await batch.commit();
  }
};

/**
 * Teacher host action: START BATTLE ROYALE
 * Sets status to "IN_PROGRESS", initializes arena players from lobby,
 * clears old map structures, and spawns randomized science supply crates.
 */
export const startBattleRoyale = async (): Promise<void> => {
  resetFirestoreQuotaState();
  const stateDoc = doc(db, 'battleEvent', 'state');

  // 1. Fetch connected lobby players and old arena entities in parallel (4x faster startup)
  const lobbyColl = collection(db, 'battleEvent', 'lobby', 'members');
  const structuresColl = collection(db, 'battleEvent', 'structures', 'items');
  const cratesColl = collection(db, 'battleEvent', 'crates', 'items');
  const playersColl = collection(db, 'battleEvent', 'players', 'items');

  const [lobbySnap, structSnap, cratesSnap, playersSnap] = await Promise.all([
    getDocs(lobbyColl),
    getDocs(structuresColl),
    getDocs(cratesColl),
    getDocs(playersColl)
  ]);

  const ops: BatchOp[] = [];
  structSnap.forEach(s => ops.push({ type: 'delete', ref: s.ref }));
  cratesSnap.forEach(c => ops.push({ type: 'delete', ref: c.ref }));
  playersSnap.forEach(p => ops.push({ type: 'delete', ref: p.ref }));

  // 2. Initialize Arena Players with circular spawn distribution
  const count = lobbySnap.size || 1;
  let idx = 0;
  const arenaCenter = 2500;
  const spawnRadius = 1400;
  const initializedPlayers: ArenaPlayer[] = [];

  lobbySnap.forEach((docSnap) => {
    const l = docSnap.data() as LobbyPlayer;
    const angle = (idx / count) * 2 * Math.PI;
    const x = Math.round(arenaCenter + Math.cos(angle) * spawnRadius);
    const y = Math.round(arenaCenter + Math.sin(angle) * spawnRadius);
    const resolvedSkin = getFantasySkin(l.avatar || 'cultist');
    const isKnightHero = resolvedSkin.id === 'knight_hero';

    const arenaPlayer: ArenaPlayer = {
      uid: l.uid,
      name: l.name,
      avatar: l.avatar || 'cultist',
      equippedWeapon: l.equippedWeapon || 'bunsen_burner',
      x,
      y,
      angle: angle + Math.PI, // look toward center
      hp: 100,
      maxHp: 100,
      shield: isKnightHero ? 70 : 50,
      maxShield: isKnightHero ? 120 : 100,
      wood: Math.max(10, l.wood || 20),
      brick: Math.max(10, l.brick || 10),
      metal: Math.max(5, l.metal || 5),
      isAlive: true,
      kills: 0
    };

    initializedPlayers.push(arenaPlayer);
    const targetDoc = doc(db, 'battleEvent', 'players', 'items', l.uid);
    ops.push({ type: 'set', ref: targetDoc, data: arenaPlayer });
    idx++;
  });

  // 3. Spawn 10 initial Science Supply Crates randomly within the opening Eye of the Storm
  // Questions come directly from the randomized Practice Quiz Question Vault
  const initialVaultQuestions = getRandomizedPracticeVaultQuestions(10);
  const initialCrates: SupplyCrate[] = [];
  for (let c = 0; c < 10; c++) {
    const q = initialVaultQuestions[c] || CRATE_SCIENCE_QUESTIONS[c % CRATE_SCIENCE_QUESTIONS.length];
    const pt = samplePointWithinStormEye({ x: arenaCenter, y: arenaCenter }, 3600);

    const crateId = `crate_${Date.now()}_${c}`;
    const crateData: SupplyCrate = {
      id: crateId,
      x: pt.x,
      y: pt.y,
      isClaimed: false,
      rewardType: c % 2 === 0 ? 'shield' : 'materials',
      question: q
    };
    initialCrates.push(crateData);
    const crateRef = doc(db, 'battleEvent', 'crates', 'items', crateId);
    ops.push({ type: 'set', ref: crateRef, data: crateData });
  }

  // 4. Set state to IN_PROGRESS with 3600px border radius and randomized finish center
  const randomFinalX = Math.round(1300 + Math.random() * 2400);
  const randomFinalY = Math.round(1300 + Math.random() * 2400);

  const liveState: BattleEventState = {
    status: 'IN_PROGRESS',
    isLobbyOpen: true,
    startedAt: new Date().toISOString(),
    stormRadius: 3600,
    stormCenter: { x: arenaCenter, y: arenaCenter },
    stormFinalCenter: { x: randomFinalX, y: randomFinalY },
    currentWinner: null
  };
  setLocalGameItem(LOCAL_BATTLE_STATE_KEY, liveState);
  setLocalGameItem(LOCAL_ARENA_PLAYERS_KEY, initializedPlayers);
  setLocalGameItem(LOCAL_STRUCTURES_KEY, []);
  setLocalGameItem(LOCAL_CRATES_KEY, initialCrates);
  ops.push({ type: 'set', ref: stateDoc, data: liveState });

  // Notify live WS server room immediately alongside batched Firestore commit
  await Promise.all([
    notifyServerBattleControl({
      action: 'start',
      state: liveState,
      players: initializedPlayers,
      crates: initialCrates
    }),
    commitBatchOpsInChunks(ops)
  ]);
};

/**
 * Teacher host action: Reset match and clear arena
 */
export const resetBattleEvent = async (): Promise<void> => {
  resetFirestoreQuotaState();
  setLocalGameItem(LOCAL_BATTLE_STATE_KEY, DEFAULT_EVENT_STATE);
  setLocalGameItem(LOCAL_ARENA_PLAYERS_KEY, []);
  setLocalGameItem(LOCAL_STRUCTURES_KEY, []);
  setLocalGameItem(LOCAL_CRATES_KEY, []);

  const ops: BatchOp[] = [];
  const playersColl = collection(db, 'battleEvent', 'players', 'items');
  const structuresColl = collection(db, 'battleEvent', 'structures', 'items');
  const cratesColl = collection(db, 'battleEvent', 'crates', 'items');

  const [playersSnap, structSnap, cratesSnap] = await Promise.all([
    getDocs(playersColl),
    getDocs(structuresColl),
    getDocs(cratesColl)
  ]);

  playersSnap.forEach(p => ops.push({ type: 'delete', ref: p.ref }));
  structSnap.forEach(s => ops.push({ type: 'delete', ref: s.ref }));
  cratesSnap.forEach(c => ops.push({ type: 'delete', ref: c.ref }));

  const stateDoc = doc(db, 'battleEvent', 'state');
  ops.push({ type: 'set', ref: stateDoc, data: DEFAULT_EVENT_STATE });

  await Promise.all([
    notifyServerBattleControl({
      action: 'reset',
      state: DEFAULT_EVENT_STATE
    }),
    commitBatchOpsInChunks(ops)
  ]);
};

const awardWinnerRewardsOnce = async (winnerUid: string): Promise<void> => {
  if (!winnerUid || winnerUid.startsWith('dummy_')) return;
  try {
    const userDoc = doc(db, 'users', winnerUid);
    const snap = await getDoc(userDoc);
    const prevXp = snap.exists() ? Number(snap.data()?.xp || 0) : 0;
    const prevLevel = Math.max(calculateLevelFromXP(prevXp).level, snap.exists() ? Number(snap.data()?.rewardedGameLevel || 1) : 1);
    const newLevel = calculateLevelFromXP(prevXp + 200).level;
    const levelUpGold = Math.max(0, newLevel - prevLevel) * LEVEL_UP_GOLD_REWARD;
    await setDoc(userDoc, {
      monthlyCrown: true,
      xp: increment(200),
      gold: increment(100 + levelUpGold),
      level: Math.max(prevLevel, newLevel),
      rewardedGameLevel: Math.max(prevLevel, newLevel)
    }, { merge: true });
  } catch {
    try {
      const userDoc = doc(db, 'users', winnerUid);
      await setDoc(userDoc, {
        monthlyCrown: true,
        xp: increment(200),
        gold: increment(100)
      }, { merge: true });
    } catch {}
  }
};

/**
 * Win condition: Declare match winner (transactional so 30 clients cannot double-award XP/Gold)
 */
export const declareBattleWinner = async (winner: { uid: string; name: string; avatar: string }): Promise<void> => {
  const stateDoc = doc(db, 'battleEvent', 'state');
  let transitionedToEnded = false;
  try {
    transitionedToEnded = await runTransaction(db, async (tx) => {
      const snap = await tx.get(stateDoc);
      const current = snap.exists() ? (snap.data() as BattleEventState) : DEFAULT_EVENT_STATE;
      if (current.status === 'ENDED') {
        return false;
      }
      tx.set(stateDoc, {
        status: 'ENDED',
        isLobbyOpen: false,
        currentWinner: winner
      }, { merge: true });
      return true;
    });
  } catch (err) {
    console.warn('Transaction fallback in declareBattleWinner:', err);
    try {
      await setDoc(stateDoc, {
        status: 'ENDED',
        isLobbyOpen: false,
        currentWinner: winner
      }, { merge: true });
      transitionedToEnded = true;
    } catch {}
  }

  if (transitionedToEnded && winner.uid) {
    notifyServerBattleControl({
      action: 'end',
      state: { status: 'ENDED', isLobbyOpen: false, currentWinner: winner }
    }).catch(() => {});
    await awardWinnerRewardsOnce(winner.uid);
  }
};

/**
 * Teacher host action: End the current active match immediately.
 * NEVER blocked by quota backoff — instructor controls take top priority.
 * Passing `customWinner = null` explicitly ends as a draw with no winner;
 * passing `undefined` auto-selects the top surviving student.
 */
export const endBattleRoyale = async (
  customWinner?: { uid: string; name: string; avatar: string } | null,
  _reason?: string
): Promise<void> => {
  resetFirestoreQuotaState();

  let winner: { uid: string; name: string; avatar: string } | null = customWinner === undefined ? null : customWinner;

  if (customWinner === undefined) {
    try {
      let candidates = getLocalGameItem<ArenaPlayer[]>(LOCAL_ARENA_PLAYERS_KEY, []);
      if (candidates.length === 0) {
        const playersSnap = await getDocs(collection(db, 'battleEvent', 'players', 'items'));
        const remoteList: ArenaPlayer[] = [];
        playersSnap.forEach(d => remoteList.push(d.data() as ArenaPlayer));
        candidates = remoteList;
      }
      const realPlayers = candidates.filter(p => !p.uid.startsWith('dummy_'));
      const pool = realPlayers.length > 0 ? realPlayers : candidates;
      const alivePlayers = pool.filter(p => p.isAlive);
      const sorted = [...(alivePlayers.length > 0 ? alivePlayers : pool)].sort(
        (a, b) => (b.kills * 100 + b.hp) - (a.kills * 100 + a.hp)
      );
      if (sorted.length > 0) {
        winner = {
          uid: sorted[0].uid,
          name: sorted[0].name,
          avatar: sorted[0].avatar
        };
      }
    } catch {}
  }

  const prevState = getLocalGameItem<BattleEventState>(LOCAL_BATTLE_STATE_KEY, DEFAULT_EVENT_STATE);
  const wasAlreadyEnded = prevState?.status === 'ENDED';

  const endedState: Partial<BattleEventState> = {
    status: 'ENDED',
    isLobbyOpen: false,
    currentWinner: winner
  };

  setLocalGameItem(LOCAL_BATTLE_STATE_KEY, { ...prevState, ...endedState });

  // Immediately push end state through WebSocket server room so all 32 live players transition at once
  notifyServerBattleControl({
    action: 'end',
    state: endedState
  }).catch(() => {});

  const stateDoc = doc(db, 'battleEvent', 'state');
  let writeSucceeded = false;
  let lastError: any = null;

  for (let attempt = 0; attempt < 2 && !writeSucceeded; attempt++) {
    try {
      await setDoc(stateDoc, endedState, { merge: true });
      writeSucceeded = true;
    } catch (e) {
      lastError = e;
      if (attempt === 0) {
        await new Promise(resolve => setTimeout(resolve, 350));
      }
    }
  }

  if (!writeSucceeded && lastError) {
    handleFirestoreError(lastError, 'endBattleRoyale');
    throw lastError;
  }

  // Award crown and bonus XP/gold once if transitioning out of active match
  if (winner && winner.uid && !wasAlreadyEnded) {
    await awardWinnerRewardsOnce(winner.uid);
  }
};

// ============================================================================
// MODULE 5: 2D BATTLE ROYALE ARENA SYNCING & MECHANICS
// ============================================================================

/**
 * Subscribe to live arena players
 */
export const subscribeToArenaPlayers = (
  callback: (players: ArenaPlayer[]) => void
): (() => void) => {
  const cached = getLocalGameItem<ArenaPlayer[]>(LOCAL_ARENA_PLAYERS_KEY, []);
  if (cached.length > 0) callback(cached);

  try {
    const playersColl = collection(db, 'battleEvent', 'players', 'items');
    return onSnapshot(playersColl, (snap) => {
      const seenUids = new Set<string>();
      const list: ArenaPlayer[] = [];
      snap.forEach((docSnap) => {
        const data = docSnap.data() as Partial<ArenaPlayer>;
        const resolvedUid = (data.uid || docSnap.id || '').trim();
        if (!resolvedUid || seenUids.has(resolvedUid)) return;
        seenUids.add(resolvedUid);
        list.push({ ...(data as ArenaPlayer), uid: resolvedUid });
      });
      scheduleLocalGameItem(LOCAL_ARENA_PLAYERS_KEY, list, 3000);
      callback(list);
    }, (err) => {
      handleFirestoreError(err, 'subscribeToArenaPlayers');
      callback(getLocalGameItem<ArenaPlayer[]>(LOCAL_ARENA_PLAYERS_KEY, []));
    });
  } catch (err) {
    handleFirestoreError(err, 'subscribeToArenaPlayers');
    return () => {};
  }
};

/**
 * Ensure an arena player document exists in /battleEvent/players/items/{uid}.
 * If missing, initializes the player with their loadout and stats.
 */
export const ensureArenaPlayer = async (player: ArenaPlayer): Promise<void> => {
  if (!player.uid) return;
  const currentPlayers = getLocalGameItem<ArenaPlayer[]>(LOCAL_ARENA_PLAYERS_KEY, []);
  if (!currentPlayers.some(p => p.uid === player.uid)) {
    setLocalGameItem(LOCAL_ARENA_PLAYERS_KEY, [...currentPlayers, player]);
  }

  if (!canPerformFirestoreWrite()) return;
  const playerDoc = doc(db, 'battleEvent', 'players', 'items', player.uid);
  try {
    const snap = await getDoc(playerDoc);
    if (!snap.exists()) {
      await setDoc(playerDoc, player);
    }
  } catch (err) {
    handleFirestoreError(err, 'ensureArenaPlayer');
  }
};

/**
 * Sync local player position & orientation
 * Uses setDoc with merge: true to avoid "No document to update" error if the player doc is missing or match reset
 */
export const updatePlayerPosition = async (
  uid: string, 
  data: Partial<ArenaPlayer>
): Promise<void> => {
  if (!uid) return;
  const currentPlayers = getLocalGameItem<ArenaPlayer[]>(LOCAL_ARENA_PLAYERS_KEY, []);
  const idx = currentPlayers.findIndex(p => p.uid === uid);
  if (idx >= 0) {
    currentPlayers[idx] = { ...currentPlayers[idx], ...data };
  } else {
    currentPlayers.push({ ...data, uid } as ArenaPlayer);
  }
  scheduleLocalGameItem(LOCAL_ARENA_PLAYERS_KEY, currentPlayers, 2500);

  if (!canPerformFirestoreWrite()) return;
  const playerDoc = doc(db, 'battleEvent', 'players', 'items', uid);
  try {
    await setDoc(playerDoc, data, { merge: true });
  } catch (err) {
    handleFirestoreError(err, 'updatePlayerPosition');
  }
};

const computePlayerDamageOutcome = (
  target: ArenaPlayer,
  damageAmount: number,
  isStormDamage: boolean,
  nowMs: number
): {
  newShield: number;
  newHp: number;
  isKilled: boolean;
  bricksGained: number;
  brittleGuardTriggered: boolean;
  royalAbsorptionUsedAt?: number;
  brittleGuardUsedAt?: number;
} => {
  const skinDef = getFantasySkin(target.avatar || 'cultist');
  let actualDamage = Math.max(1, damageAmount);
  let bricksGained = 0;
  let brittleGuardTriggered = false;
  let royalAbsorptionUsedAt = target.royalAbsorptionUsedAt;
  let brittleGuardUsedAt = target.brittleGuardUsedAt;

  if (isStormDamage) {
    if (skinDef.id === 'dark_knight') {
      actualDamage = Math.max(1, Math.round(actualDamage * 0.5));
    }
  } else {
    if (target.metalShieldActiveUntil && target.metalShieldActiveUntil > nowMs) {
      actualDamage = Math.round(actualDamage * 0.5);
    }

    const defReduction = Math.min(0.25, Math.max(0, ((skinDef.defense - 18) / 80) * 0.25));
    actualDamage = Math.max(1, Math.round(actualDamage * (1 - defReduction)));

    if (skinDef.id === 'slime') {
      actualDamage = Math.max(1, Math.round(actualDamage * 0.85));
    }

    if (skinDef.id === 'slime_king' && (!target.royalAbsorptionUsedAt || nowMs - target.royalAbsorptionUsedAt >= 10000)) {
      const absorbed = Math.max(1, Math.round(actualDamage * 0.5));
      actualDamage = Math.max(1, actualDamage - absorbed);
      bricksGained = Math.max(6, Math.round(absorbed * 0.5));
      royalAbsorptionUsedAt = nowMs;
    }
  }

  let newShield = target.shield || 0;
  let newHp = target.hp ?? 100;

  if (isStormDamage) {
    newHp = Math.max(0, newHp - actualDamage);
  } else {
    if (newShield > 0) {
      if (newShield >= actualDamage) {
        newShield -= actualDamage;
        actualDamage = 0;
      } else {
        actualDamage -= newShield;
        newShield = 0;
      }
    }
    newHp = Math.max(0, newHp - actualDamage);

    if (
      newHp <= 0 &&
      skinDef.id === 'skeleton_warrior' &&
      (!target.brittleGuardUsedAt || nowMs - target.brittleGuardUsedAt >= 25000)
    ) {
      newHp = 20;
      brittleGuardTriggered = true;
      brittleGuardUsedAt = nowMs;
    }
  }

  return {
    newShield,
    newHp,
    isKilled: newHp <= 0,
    bricksGained,
    brittleGuardTriggered,
    royalAbsorptionUsedAt,
    brittleGuardUsedAt
  };
};

/**
 * Deal damage to a player (absorbs shield first, applies skin defense & special abilities).
 * Combat damage is critical state — NEVER skipped silently during position-sync throttling;
 * uses Firestore transaction to prevent concurrent hit overwrites and invincible player states.
 */
export const damageArenaPlayer = async (
  targetUid: string,
  damageAmount: number,
  attackerUid?: string,
  isStormDamage: boolean = false,
  chillMs: number = 0
): Promise<{ killed: boolean; bricksGained?: number; brittleGuardTriggered?: boolean }> => {
  if (!targetUid) return { killed: false };

  const nowMs = Date.now();
  const clampedChillMs = !isStormDamage && chillMs > 0 ? Math.min(6000, Math.round(chillMs)) : 0;
  const currentPlayers = getLocalGameItem<ArenaPlayer[]>(LOCAL_ARENA_PLAYERS_KEY, []);
  const targetLocal = currentPlayers.find(p => p.uid === targetUid);
  let localKilled = false;
  let localBricksGained = 0;
  let localBrittleTriggered = false;

  if (targetLocal && targetLocal.isAlive) {
    const outcome = computePlayerDamageOutcome(targetLocal, damageAmount, isStormDamage, nowMs);
    localKilled = outcome.isKilled;
    localBricksGained = outcome.bricksGained;
    localBrittleTriggered = outcome.brittleGuardTriggered;
    targetLocal.shield = outcome.newShield;
    targetLocal.hp = outcome.newHp;
    targetLocal.isAlive = !outcome.isKilled;
    if (outcome.bricksGained > 0) {
      targetLocal.brick = (targetLocal.brick || 0) + outcome.bricksGained;
    }
    if (outcome.royalAbsorptionUsedAt !== undefined) {
      targetLocal.royalAbsorptionUsedAt = outcome.royalAbsorptionUsedAt;
    }
    if (outcome.brittleGuardUsedAt !== undefined) {
      targetLocal.brittleGuardUsedAt = outcome.brittleGuardUsedAt;
    }
    if (clampedChillMs > 0 && !outcome.isKilled) {
      targetLocal.frostSlowUntil = Math.max(targetLocal.frostSlowUntil || 0, nowMs + clampedChillMs);
    }
    scheduleLocalGameItem(LOCAL_ARENA_PLAYERS_KEY, currentPlayers, 1500);
  }

  const targetDoc = doc(db, 'battleEvent', 'players', 'items', targetUid);
  try {
    const result = await runTransaction(db, async (tx) => {
      const snap = await tx.get(targetDoc);
      if (!snap.exists()) {
        return {
          killed: localKilled,
          bricksGained: localBricksGained,
          brittleGuardTriggered: localBrittleTriggered,
          shouldCreditKill: false
        };
      }

      const current = snap.data() as ArenaPlayer;
      if (!current.isAlive || (current.hp ?? 0) <= 0) {
        if (current.isAlive) {
          tx.set(targetDoc, { hp: 0, isAlive: false }, { merge: true });
        }
        return { killed: false, bricksGained: 0, brittleGuardTriggered: false, shouldCreditKill: false };
      }

      const outcome = computePlayerDamageOutcome(current, damageAmount, isStormDamage, nowMs);
      const updatePayload: Record<string, any> = {
        shield: outcome.newShield,
        hp: outcome.newHp,
        isAlive: !outcome.isKilled
      };
      if (outcome.bricksGained > 0) {
        updatePayload.brick = increment(outcome.bricksGained);
      }
      if (outcome.royalAbsorptionUsedAt !== undefined) {
        updatePayload.royalAbsorptionUsedAt = outcome.royalAbsorptionUsedAt;
      }
      if (outcome.brittleGuardUsedAt !== undefined) {
        updatePayload.brittleGuardUsedAt = outcome.brittleGuardUsedAt;
      }
      if (clampedChillMs > 0 && !outcome.isKilled) {
        updatePayload.frostSlowUntil = Math.max(current.frostSlowUntil || 0, nowMs + clampedChillMs);
      }

      tx.set(targetDoc, updatePayload, { merge: true });

      return {
        killed: outcome.isKilled,
        bricksGained: outcome.bricksGained,
        brittleGuardTriggered: outcome.brittleGuardTriggered,
        shouldCreditKill: Boolean(outcome.isKilled && attackerUid && attackerUid !== targetUid && !isStormDamage)
      };
    });

    if (result.shouldCreditKill && attackerUid) {
      const attackerDoc = doc(db, 'battleEvent', 'players', 'items', attackerUid);
      await setDoc(attackerDoc, {
        kills: increment(1)
      }, { merge: true }).catch(() => {});
    }

    return {
      killed: result.killed,
      bricksGained: result.bricksGained,
      brittleGuardTriggered: result.brittleGuardTriggered
    };
  } catch (err) {
    handleFirestoreError(err, 'damageArenaPlayer');
    return {
      killed: localKilled,
      bricksGained: localBricksGained,
      brittleGuardTriggered: localBrittleTriggered
    };
  }
};

/**
 * Subscribe to placed building structures
 */
export const subscribeToStructures = (
  callback: (structures: ArenaStructure[]) => void
): (() => void) => {
  const cached = getLocalGameItem<ArenaStructure[]>(LOCAL_STRUCTURES_KEY, []);
  callback(cached);

  try {
    const coll = collection(db, 'battleEvent', 'structures', 'items');
    return onSnapshot(coll, (snap) => {
      const list: ArenaStructure[] = [];
      snap.forEach((docSnap) => {
        list.push(docSnap.data() as ArenaStructure);
      });
      scheduleLocalGameItem(LOCAL_STRUCTURES_KEY, list, 2500);
      callback(list);
    }, (err) => {
      handleFirestoreError(err, 'subscribeToStructures');
      callback(getLocalGameItem<ArenaStructure[]>(LOCAL_STRUCTURES_KEY, []));
    });
  } catch (err) {
    handleFirestoreError(err, 'subscribeToStructures');
    return () => {};
  }
};

/**
 * Remove all player-built structures (local fallback + Firestore) when starting or resetting an arena session.
 */
export const clearArenaStructures = async (): Promise<void> => {
  setLocalGameItem(LOCAL_STRUCTURES_KEY, []);

  if (!canPerformFirestoreWrite()) return;
  try {
    const structuresColl = collection(db, 'battleEvent', 'structures', 'items');
    const structSnap = await getDocs(structuresColl);
    if (structSnap.empty) return;
    const batch = writeBatch(db);
    structSnap.forEach(s => batch.delete(s.ref));
    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, 'clearArenaStructures');
  }
};

/**
 * Place a building structure (Wood Wall, Brick Ramp, Metal Bunker)
 */
export const placeArenaStructure = async (
  structure: ArenaStructure,
  materialCost: { wood?: number; brick?: number; metal?: number },
  builderUid: string
): Promise<boolean> => {
  if (!builderUid || !structure.id) return false;

  const currentStructs = getLocalGameItem<ArenaStructure[]>(LOCAL_STRUCTURES_KEY, []);
  setLocalGameItem(LOCAL_STRUCTURES_KEY, [...currentStructs, structure]);

  if (!canPerformFirestoreWrite()) return true;

  const structDoc = doc(db, 'battleEvent', 'structures', 'items', structure.id);
  const playerDoc = doc(db, 'battleEvent', 'players', 'items', builderUid);

  try {
    // Write structure
    await setDoc(structDoc, structure);

    // Deduct material cost from player
    const deductPayload: Record<string, any> = {};
    if (materialCost.wood) deductPayload.wood = increment(-materialCost.wood);
    if (materialCost.brick) deductPayload.brick = increment(-materialCost.brick);
    if (materialCost.metal) deductPayload.metal = increment(-materialCost.metal);

    if (Object.keys(deductPayload).length > 0) {
      await setDoc(playerDoc, deductPayload, { merge: true });
    }

    return true;
  } catch (err) {
    handleFirestoreError(err, 'placeArenaStructure');
    return true;
  }
};

/**
 * Damage or destroy a placed structure
 */
export const damageArenaStructure = async (structureId: string, damage: number): Promise<{ destroyed: boolean }> => {
  if (!structureId) return { destroyed: false };

  let localDestroyed = false;
  const currentStructs = getLocalGameItem<ArenaStructure[]>(LOCAL_STRUCTURES_KEY, []);
  const structIdx = currentStructs.findIndex(s => s.id === structureId);
  if (structIdx >= 0) {
    const newHp = currentStructs[structIdx].hp - damage;
    if (newHp <= 0) {
      currentStructs.splice(structIdx, 1);
      localDestroyed = true;
    } else {
      currentStructs[structIdx].hp = newHp;
    }
    setLocalGameItem(LOCAL_STRUCTURES_KEY, currentStructs);
  }

  if (!canPerformFirestoreWrite()) return { destroyed: localDestroyed };

  const structDoc = doc(db, 'battleEvent', 'structures', 'items', structureId);
  try {
    const snap = await getDoc(structDoc);
    if (!snap.exists()) return { destroyed: localDestroyed };

    const current = snap.data() as ArenaStructure;
    const newHp = current.hp - damage;

    if (newHp <= 0) {
      await deleteDoc(structDoc);
      return { destroyed: true };
    } else {
      await setDoc(structDoc, { hp: newHp }, { merge: true });
      return { destroyed: false };
    }
  } catch (err) {
    handleFirestoreError(err, 'damageArenaStructure');
    return { destroyed: localDestroyed };
  }
};

/**
 * Subscribe to supply crates
 */
export const subscribeToSupplyCrates = (
  callback: (crates: SupplyCrate[]) => void
): (() => void) => {
  const cached = getLocalGameItem<SupplyCrate[]>(LOCAL_CRATES_KEY, []);
  callback(cached);

  try {
    const coll = collection(db, 'battleEvent', 'crates', 'items');
    return onSnapshot(coll, (snap) => {
      const list: SupplyCrate[] = [];
      snap.forEach((docSnap) => {
        list.push(docSnap.data() as SupplyCrate);
      });
      scheduleLocalGameItem(LOCAL_CRATES_KEY, list, 2500);
      callback(list);
    }, (err) => {
      handleFirestoreError(err, 'subscribeToSupplyCrates');
      callback(getLocalGameItem<SupplyCrate[]>(LOCAL_CRATES_KEY, []));
    });
  } catch (err) {
    handleFirestoreError(err, 'subscribeToSupplyCrates');
    return () => {};
  }
};

/**
 * Compute live storm center and radius from battle state timestamps if callers omit explicit storm coordinates
 */
const resolveActiveStormGeometry = (options?: SupplyCrateDropOptions): { center: { x: number; y: number }; radius: number } => {
  if (options?.center && options?.radius !== undefined) {
    return { center: options.center, radius: options.radius };
  }

  const cachedState = getLocalGameItem<BattleEventState>(LOCAL_BATTLE_STATE_KEY, DEFAULT_EVENT_STATE);
  let center = options?.center || cachedState.stormCenter || { x: 2500, y: 2500 };
  let radius = options?.radius ?? (Number.isFinite(cachedState.stormRadius) ? cachedState.stormRadius : 3600);

  if (cachedState.status === 'IN_PROGRESS' && cachedState.startedAt) {
    const elapsedSec = Math.max(0, Math.min(600, (Date.now() - new Date(cachedState.startedAt).getTime()) / 1000));
    if (elapsedSec < 600) {
      const START_RADIUS = 3600;
      const FINAL_RADIUS = 75;
      const TOTAL_SHRINK = START_RADIUS - FINAL_RADIUS;
      const NORMAL_RATE = TOTAL_SHRINK / 850;
      const SURGE_RATE = NORMAL_RATE * 3.5;
      const completedCycles = Math.floor(elapsedSec / 60);
      const cycleSec = elapsedSec % 60;
      let shrunk = completedCycles * 85 * NORMAL_RATE;
      shrunk += cycleSec <= 50 ? cycleSec * NORMAL_RATE : 50 * NORMAL_RATE + (cycleSec - 50) * SURGE_RATE;
      radius = Math.max(FINAL_RADIUS, START_RADIUS - shrunk);
      const progress = Math.min(1, Math.max(0, (START_RADIUS - radius) / TOTAL_SHRINK));
      const easeProgress = progress * progress * (3 - 2 * progress);
      const finalCenter = cachedState.stormFinalCenter || { x: 2500, y: 2500 };
      center = {
        x: 2500 + (finalCenter.x - 2500) * easeProgress,
        y: 2500 + (finalCenter.y - 2500) * easeProgress
      };
    }
  }

  return { center, radius };
};

/**
 * Spawn a new randomized mid-game supply crate strictly within the current Eye of the Storm
 */
export const dropMidGameSupplyCrate = async (options?: SupplyCrateDropOptions): Promise<SupplyCrate | null> => {
  const { center, radius } = resolveActiveStormGeometry(options);
  let x = options?.x;
  let y = options?.y;

  // Validate explicit coords or sample uniformly within the safe storm circle
  const safeRadius = Math.max(20, radius - Math.min(120, Math.max(20, radius * 0.08)));
  if (
    x === undefined ||
    y === undefined ||
    !Number.isFinite(x) ||
    !Number.isFinite(y) ||
    Math.hypot(x - center.x, y - center.y) > safeRadius
  ) {
    const pt = samplePointWithinStormEye(center, radius);
    x = pt.x;
    y = pt.y;
  }

  const crateId = `crate_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const [vaultQ] = getRandomizedPracticeVaultQuestions(1);
  const q = vaultQ || CRATE_SCIENCE_QUESTIONS[Math.floor(Math.random() * CRATE_SCIENCE_QUESTIONS.length)];
  const newCrate: SupplyCrate = {
    id: crateId,
    x: Math.round(x),
    y: Math.round(y),
    isClaimed: false,
    rewardType: options?.rewardType || (Math.random() > 0.5 ? 'shield' : 'materials'),
    question: q
  };

  // Always update local fallback immediately so offline/solo testing works instantaneously
  const existingCrates = getLocalGameItem<SupplyCrate[]>(LOCAL_CRATES_KEY, []);
  setLocalGameItem(LOCAL_CRATES_KEY, [...existingCrates, newCrate]);

  // Also broadcast into the live 20Hz WebSocket battle room
  notifyServerBattleControl({ action: 'crate_drop', crate: newCrate }).catch(() => {});

  if (!canPerformFirestoreWrite()) {
    return newCrate;
  }

  try {
    const crateRef = doc(db, 'battleEvent', 'crates', 'items', crateId);
    await setDoc(crateRef, newCrate);
  } catch (err) {
    handleFirestoreError(err, 'dropMidGameSupplyCrate');
  }

  return newCrate;
};

/**
 * Claim supply crate upon answering science question
 */
export const claimSupplyCrate = async (
  crateId: string, 
  uid: string, 
  rewardType: 'shield' | 'materials'
): Promise<void> => {
  if (!crateId || !uid) return;

  // Immediately remove from local crate cache
  const existingCrates = getLocalGameItem<SupplyCrate[]>(LOCAL_CRATES_KEY, []);
  setLocalGameItem(LOCAL_CRATES_KEY, existingCrates.filter(c => c.id !== crateId));

  // Apply reward to local player cache
  const currentPlayers = getLocalGameItem<ArenaPlayer[]>(LOCAL_ARENA_PLAYERS_KEY, []);
  const playerIdx = currentPlayers.findIndex(p => p.uid === uid);
  let isGoblin = false;
  let maxShieldCap = 100;
  if (playerIdx >= 0) {
    const p = currentPlayers[playerIdx];
    const skinDef = getFantasySkin(p.avatar || 'cultist');
    isGoblin = skinDef.id === 'goblin';
    maxShieldCap = skinDef.id === 'knight_hero' ? 120 : (p.maxShield || 100);
    if (rewardType === 'shield') {
      const prevSh = p.shield || 0;
      p.shield = Math.min(maxShieldCap, prevSh + 50);
      const overflow = Math.max(0, prevSh + 50 - maxShieldCap);
      if (overflow > 0) {
        p.hp = Math.min(100, (p.hp || 0) + overflow);
      }
    } else {
      p.wood = (p.wood || 0) + (isGoblin ? 30 : 20);
      p.brick = (p.brick || 0) + (isGoblin ? 23 : 15);
      p.metal = (p.metal || 0) + (isGoblin ? 15 : 10);
    }
    setLocalGameItem(LOCAL_ARENA_PLAYERS_KEY, currentPlayers);
  }

  if (!canPerformFirestoreWrite()) return;

  const crateDoc = doc(db, 'battleEvent', 'crates', 'items', crateId);
  const playerDoc = doc(db, 'battleEvent', 'players', 'items', uid);

  try {
    await deleteDoc(crateDoc);

    if (rewardType === 'shield') {
      const pSnap = await getDoc(playerDoc);
      const currentShield = pSnap.exists() ? Number(pSnap.data()?.shield || 0) : 0;
      const currentHp = pSnap.exists() ? Number(pSnap.data()?.hp ?? 100) : 100;
      const cap = pSnap.exists() && getFantasySkin(pSnap.data()?.avatar || 'cultist').id === 'knight_hero' ? 120 : maxShieldCap;
      const overflow = Math.max(0, currentShield + 50 - cap);
      await setDoc(playerDoc, {
        shield: Math.min(cap, currentShield + 50),
        ...(overflow > 0 ? { hp: Math.min(100, currentHp + overflow) } : {})
      }, { merge: true });
    } else {
      await setDoc(playerDoc, {
        wood: increment(isGoblin ? 30 : 20),
        brick: increment(isGoblin ? 23 : 15),
        metal: increment(isGoblin ? 15 : 10)
      }, { merge: true });
    }

    if (isGoblin) {
      await setDoc(doc(db, 'users', uid), { gold: increment(15) }, { merge: true }).catch(() => {});
    }
  } catch (err) {
    handleFirestoreError(err, 'claimSupplyCrate');
  }
};
