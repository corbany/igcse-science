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
  writeBatch
} from 'firebase/firestore';
import { db, auth } from './firebaseAuth';

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

// ============================================================================
// SHOP CATALOG & ITEMS DEFINITION
// ============================================================================

export const SHOP_ITEMS: ShopItem[] = [
  // --- SKINS: PACK 1 (Physics & Advanced Energy) ---
  {
    id: "quantum_physicist",
    name: "Quantum Physicist",
    category: "skin",
    rarity: "mythic",
    description: "Harnesses superposition wave-functions to bend quantum particle trajectories. Features plasma sphere action.",
    price: 1000,
    icon: "⚛️",
    imageSrc: "/assets/avatars/quantum_physicist.png",
    packNumber: 1
  },
  {
    id: "laser_optics_tech",
    name: "Laser Optics Specialist",
    category: "skin",
    rarity: "epic",
    description: "Calibrates optical cavities and ruby crystal prisms for concentrated stimulated emission beams.",
    price: 320,
    icon: "🔦",
    imageSrc: "/assets/avatars/laser_optics_tech.png",
    packNumber: 1
  },
  {
    id: "polar_astronomer",
    name: "Polar Astronomer",
    category: "skin",
    rarity: "rare",
    description: "Operates high-altitude cryogenic telescopes to map exoplanetary transits with stellar scope precision.",
    price: 180,
    icon: "🔭",
    imageSrc: "/assets/avatars/polar_astronomer.png",
    packNumber: 1
  },
  {
    id: "circuit_engineer",
    name: "Circuit Specialist",
    category: "skin",
    rarity: "common",
    description: "Wires copper armature relays and step-up transformers with industrial toolboxes.",
    price: 80,
    icon: "⚡",
    imageSrc: "/assets/avatars/circuit_engineer.png",
    packNumber: 1
  },
  {
    id: "robotics_mechanist",
    name: "Robotics Mechanist",
    category: "skin",
    rarity: "common",
    description: "Engineers planetary gear trains and precision mechanical actuators with rotating steel gears.",
    price: 80,
    icon: "⚙️",
    imageSrc: "/assets/avatars/robotics_mechanist.png",
    packNumber: 1
  },

  // --- SKINS: PACK 2 (Biology & Life Sciences) ---
  {
    id: "biohazard_specialist",
    name: "Bio-Hazard Specialist",
    category: "skin",
    rarity: "legendary",
    description: "Sealed in a pressurized Level 4 NBC containment suit impervious to toxic storms and reagents.",
    price: 550,
    icon: "☣️",
    imageSrc: "/assets/avatars/biohazard_specialist.png",
    packNumber: 2
  },
  {
    id: "virology_researcher",
    name: "Virology Researcher",
    category: "skin",
    rarity: "epic",
    description: "Cultivates bacteriophages and synthesized monoclonal antibodies under sterile flow hoods.",
    price: 320,
    icon: "🔬",
    imageSrc: "/assets/avatars/virology_researcher.png",
    packNumber: 2
  },
  {
    id: "plant_pathologist",
    name: "Plant Pathologist",
    category: "skin",
    rarity: "rare",
    description: "Extracts defensive alkaloids and chloroplast enzymes from exotic flora in botanical glassware.",
    price: 180,
    icon: "🌿",
    imageSrc: "/assets/avatars/plant_pathologist.png",
    packNumber: 2
  },
  {
    id: "field_botanist",
    name: "Field Botanist",
    category: "skin",
    rarity: "common",
    description: "Catalogs angiosperm leaves and conducts transpiration field experiments on sprouting seeds.",
    price: 80,
    icon: "🌱",
    imageSrc: "/assets/avatars/field_botanist.png",
    packNumber: 2
  },
  {
    id: "field_entomologist",
    name: "Field Entomologist",
    category: "skin",
    rarity: "common",
    description: "Surveys insect population genetics and pollination vectors with sweep nets.",
    price: 80,
    icon: "🦋",
    imageSrc: "/assets/avatars/field_entomologist.png",
    packNumber: 2
  },

  // --- SKINS: PACK 3 (Earth & Space Sciences) ---
  {
    id: "crystallographer",
    name: "Crystallographer",
    category: "skin",
    rarity: "legendary",
    description: "Decodes X-ray diffraction patterns of hexagonal crystal lattices and reflective gems.",
    price: 550,
    icon: "💎",
    imageSrc: "/assets/avatars/crystallographer.png",
    packNumber: 3
  },
  {
    id: "marine_oceanographer",
    name: "Marine Oceanographer",
    category: "skin",
    rarity: "epic",
    description: "Dives into benthic trenches to sample hydrothermal vents and bioluminescent corals.",
    price: 320,
    icon: "🤿",
    imageSrc: "/assets/avatars/marine_oceanographer.png",
    packNumber: 3
  },
  {
    id: "fossil_paleontologist",
    name: "Fossil Paleontologist",
    category: "skin",
    rarity: "rare",
    description: "Excavates Mesozoic vertebrate fossils and reads sedimentary rock strata like an open book.",
    price: 180,
    icon: "🦴",
    imageSrc: "/assets/avatars/fossil_paleontologist.png",
    packNumber: 3
  },
  {
    id: "cryo_glaciologist",
    name: "Cryo Glaciologist",
    category: "skin",
    rarity: "rare",
    description: "Drills deep Antarctic ice cores to reconstruct paleoclimatic carbon dioxide levels in snowstorms.",
    price: 180,
    icon: "❄️",
    imageSrc: "/assets/avatars/cryo_glaciologist.png",
    packNumber: 3
  },
  {
    id: "mining_geologist",
    name: "Mining Geologist",
    category: "skin",
    rarity: "common",
    description: "Identifies igneous mineral deposits and extracts ore with geological pickaxes.",
    price: 80,
    icon: "⛏️",
    imageSrc: "/assets/avatars/mining_geologist.png",
    packNumber: 3
  },

  // --- SKINS: PACK 4 (Applied Science & Chemistry) ---
  {
    id: "radiation_hazard_suit",
    name: "Thermal Radiation Specialist",
    category: "skin",
    rarity: "mythic",
    description: "Armed with an insulated lead-lined thermal suit to handle active fission isotopes and plasma torches.",
    price: 1000,
    icon: "☢️",
    imageSrc: "/assets/avatars/radiation_hazard_suit.png",
    packNumber: 4
  },
  {
    id: "pharmaceutical_tech",
    name: "Pharmaceutical Chemist",
    category: "skin",
    rarity: "epic",
    description: "Calculates molar concentrations and formulates targeted medicinal serum suspensions.",
    price: 320,
    icon: "🧪",
    imageSrc: "/assets/avatars/pharmaceutical_tech.png",
    packNumber: 4
  },
  {
    id: "bioinformatics_dev",
    name: "Bioinformatics Scientist",
    category: "skin",
    rarity: "rare",
    description: "Runs high-performance algorithmic modeling on nucleotide base pairings with mobile computing units.",
    price: 180,
    icon: "💻",
    imageSrc: "/assets/avatars/bioinformatics_dev.png",
    packNumber: 4
  },
  {
    id: "wildlife_ecologist",
    name: "Wildlife Ecologist",
    category: "skin",
    rarity: "common",
    description: "Monitors trophic food webs and biomass transfer with long-distance spotting scopes.",
    price: 80,
    icon: "🦊",
    imageSrc: "/assets/avatars/wildlife_ecologist.png",
    packNumber: 4
  },
  {
    id: "classic_chemist",
    name: "Classic Laboratory Chemist",
    category: "skin",
    rarity: "common",
    description: "Master of balancing titration equations, precipitate formation, and exothermic reactions.",
    price: 0,
    icon: "⚗️",
    imageSrc: "/assets/avatars/classic_chemist.png",
    packNumber: 4
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
    description: 'Sub-zero liquid nitrogen emitter. Pierces air with frosty beams that slow enemy movement by 35%.',
    price: 180,
    icon: '❄️',
    stats: {
      damage: 28,
      cooldownSeconds: 0.45,
      range: 460,
      beamColor: '#06b6d4',
      specialEffect: 'Cryo Frost Chill',
      altFire: {
        altName: 'Glacial Freeze Blast',
        altCooldownSeconds: 4.5,
        altDamage: 45,
        altType: 'freeze_blast',
        altDescription: 'Shoots a heavy ice crystal that shatters on impact into high-damage frost spikes.'
      }
    }
  },

  // 4. Rare: Prismatic Laser Cannon
  {
    id: 'laser_pointer',
    name: 'Prismatic Laser Cannon',
    category: 'weapon',
    rarity: 'rare',
    description: 'Coherent Ruby photon beam. Extreme range and surgical accuracy with high single-shot impact.',
    price: 220,
    icon: '🔦',
    stats: {
      damage: 38,
      cooldownSeconds: 0.55,
      range: 640,
      beamColor: '#ef4444',
      specialEffect: 'Photon Precision',
      altFire: {
        altName: 'Prismatic Tri-Splitter',
        altCooldownSeconds: 4.0,
        altDamage: 32,
        altType: 'spread_beam',
        altDescription: 'Splits ruby beam through optical crystal to fire 3 spread lasers across a 40° fan.'
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
// PROFILE & INVENTORY MANAGEMENT
// ============================================================================

const DEFAULT_GAME_PROFILE: UserGameProfile = {
  uid: '',
  level: 1,
  xp: 0,
  gold: 100, // starting balance
  wood: 25,
  brick: 15,
  metal: 10,
  avatar: 'classic_chemist',
  equippedSkin: 'classic_chemist',
  equippedWeapon: 'bunsen_burner',
  equippedPower: 'element_shield',
  inventory: ['classic_chemist', 'bunsen_burner', 'element_shield'],
  unlockedSkins: ['classic_chemist'],
  monthlyCrown: false
};

/**
 * Subscribe to real-time student RPG profile in Firestore (/users/{uid})
 */
export const subscribeToGameProfile = (
  uid: string, 
  callback: (profile: UserGameProfile) => void
): (() => void) => {
  if (!uid) return () => {};
  const userDocRef = doc(db, 'users', uid);

  return onSnapshot(userDocRef, (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      const xp = Number(data.xp || 0);
      const level = Number(data.level || calculateLevelFromXP(xp).level);
      
      const isInstructor = data.role === 'instructor';
      const all20SkinIds = [
        'quantum_physicist', 'laser_optics_tech', 'polar_astronomer', 'circuit_engineer',
        'robotics_mechanist', 'biohazard_specialist', 'virology_researcher', 'plant_pathologist',
        'field_botanist', 'field_entomologist', 'crystallographer', 'marine_diver',
        'paleontologist', 'cryo_glaciologist', 'mining_geologist', 'radiation_hazard_suit',
        'pharmaceutical_tech', 'bioinformatics_dev', 'wildlife_ecologist', 'classic_chemist',
        // Aliases & legacy IDs
        'cyber_scientist', 'cyber_chemist', 'tesla_electrician', 'tesla_overlord',
        'particle_specialist', 'supernova_cosmologist', 'botanist', 'geneticist',
        'neuro_technologist', 'chrono_quantum_pioneer', 'astrophysicist', 'exoplanet_geologist',
        'cosmic_radiation_tech', 'astro_chemist', 'mad_alchemist', 'alchemist_robes',
        'cyborg_assistant', 'steampunk_inventor', 'antimatter_researcher'
      ];
      const all10WeaponIds = [
        'bunsen_burner', 'acid_pipette', 'cryo_freeze_ray', 'laser_pointer',
        'tesla_coil', 'centrifuge_sonic_blaster', 'particle_accelerator', 'biohazard_railgun',
        'quantum_displacer', 'antimatter_annihilator'
      ];
      const allPowerIds = ['element_shield', 'damage_boost', 'quantum_dash', 'matter_synthesizer'];

      const inv = isInstructor 
        ? Array.from(new Set([...all20SkinIds, ...all10WeaponIds, ...allPowerIds]))
        : (Array.isArray(data.inventory) ? data.inventory : DEFAULT_GAME_PROFILE.inventory);
      
      const skins = isInstructor 
        ? all20SkinIds 
        : (Array.isArray(data.unlockedSkins) 
            ? data.unlockedSkins 
            : inv.filter(id => all20SkinIds.includes(id)));
      if (!skins.includes('classic_chemist')) {
        skins.unshift('classic_chemist');
      }

      const profile: UserGameProfile = {
        uid,
        level: isInstructor ? 99 : level,
        xp,
        role: data.role,
        gold: isInstructor ? 999999 : Number(data.gold ?? DEFAULT_GAME_PROFILE.gold),
        wood: isInstructor ? 9999 : Number(data.wood ?? DEFAULT_GAME_PROFILE.wood),
        brick: isInstructor ? 9999 : Number(data.brick ?? DEFAULT_GAME_PROFILE.brick),
        metal: isInstructor ? 9999 : Number(data.metal ?? DEFAULT_GAME_PROFILE.metal),
        avatar: data.equippedSkin || data.avatar || DEFAULT_GAME_PROFILE.avatar,
        equippedSkin: data.equippedSkin || data.avatar || DEFAULT_GAME_PROFILE.avatar,
        equippedWeapon: data.equippedWeapon || DEFAULT_GAME_PROFILE.equippedWeapon,
        equippedPower: data.equippedPower || DEFAULT_GAME_PROFILE.equippedPower,
        inventory: inv,
        unlockedSkins: skins,
        monthlyCrown: isInstructor ? true : Boolean(data.monthlyCrown)
      };
      callback(profile);
    } else {
      callback({ ...DEFAULT_GAME_PROFILE, uid });
    }
  }, (err) => {
    console.error('Error subscribing to game profile:', err);
  });
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

/**
 * Check if a student has already claimed rewards for a specific revision module
 */
export const checkModuleClaimed = async (uid: string, moduleId: string): Promise<boolean> => {
  if (!uid || !moduleId) return false;
  try {
    const claimDocRef = doc(db, 'users', uid, 'completedModules', moduleId);
    const snap = await getDoc(claimDocRef);
    return snap.exists();
  } catch (e) {
    console.error('Error checking claimed module:', e);
    return false;
  }
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

  // Anti-exploit check: dwell time threshold (must exceed 10 seconds per slide)
  const requiredSeconds = Math.max(10, slideCount * 10);
  if (totalDwellSeconds < requiredSeconds) {
    return {
      success: false,
      alreadyClaimed: false,
      message: `Anti-exploit gate active: you spent ${totalDwellSeconds}s across ${slideCount} slides (minimum ${requiredSeconds}s required for full concept comprehension).`
    };
  }

  const claimDocRef = doc(db, 'users', uid, 'completedModules', moduleId);
  const claimSnap = await getDoc(claimDocRef);

  if (claimSnap.exists()) {
    return {
      success: false,
      alreadyClaimed: true,
      message: 'Module completed! Complete topic quizzes for additional materials.'
    };
  }

  // Genuine first-time reward: +20 Wood, +10 Brick, +5 Metal, +50 XP, +20 Gold
  const rewards = {
    wood: 20,
    brick: 10,
    metal: 5,
    xp: 50,
    gold: 20
  };

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
    gold: increment(rewards.gold)
  }, { merge: true });

  return {
    success: true,
    alreadyClaimed: false,
    message: 'Genuine revision verified! +20 Wood, +10 Brick, +5 Metal, +50 XP, and +20 Gold added to your loadout.',
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
  const configDoc = doc(db, 'battleEvent', 'config');
  return onSnapshot(configDoc, (snap) => {
    if (snap.exists()) {
      callback(snap.data() as BattleEventConfig);
    } else {
      callback(DEFAULT_EVENT_CONFIG);
    }
  });
};

/**
 * Teacher control: Update tournament schedule
 */
export const updateBattleConfig = async (config: Partial<BattleEventConfig>): Promise<void> => {
  const configDoc = doc(db, 'battleEvent', 'config');
  await setDoc(configDoc, config, { merge: true });
};

/**
 * Subscribe to the live arena state (/battleEvent/state)
 */
export const subscribeToBattleState = (
  callback: (state: BattleEventState) => void
): (() => void) => {
  const stateDoc = doc(db, 'battleEvent', 'state');
  return onSnapshot(stateDoc, (snap) => {
    if (snap.exists()) {
      callback(snap.data() as BattleEventState);
    } else {
      callback(DEFAULT_EVENT_STATE);
    }
  });
};

/**
 * Subscribe to connected students waiting in the lobby (/battleEvent/lobby)
 */
export const subscribeToLobby = (
  callback: (players: LobbyPlayer[]) => void
): (() => void) => {
  const lobbyColl = collection(db, 'battleEvent', 'lobby', 'members');
  return onSnapshot(lobbyColl, (snap) => {
    const list: LobbyPlayer[] = [];
    snap.forEach((docSnap) => {
      list.push(docSnap.data() as LobbyPlayer);
    });
    callback(list);
  });
};

/**
 * Student action: Join Lobby
 */
export const joinLobby = async (player: LobbyPlayer): Promise<void> => {
  if (!player.uid) return;
  const playerDoc = doc(db, 'battleEvent', 'lobby', 'members', player.uid);
  await setDoc(playerDoc, {
    ...player,
    joinedAt: new Date().toISOString()
  });
};

/**
 * Student action: Leave Lobby
 */
export const leaveLobby = async (uid: string): Promise<void> => {
  if (!uid) return;
  const playerDoc = doc(db, 'battleEvent', 'lobby', 'members', uid);
  await deleteDoc(playerDoc);
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

/**
 * Teacher host action: START BATTLE ROYALE
 * Sets status to "IN_PROGRESS", initializes arena players from lobby,
 * clears old map structures, and spawns randomized science supply crates.
 */
export const startBattleRoyale = async (): Promise<void> => {
  const stateDoc = doc(db, 'battleEvent', 'state');
  
  // 1. Fetch connected lobby players
  const lobbyColl = collection(db, 'battleEvent', 'lobby', 'members');
  const lobbySnap = await getDocs(lobbyColl);

  const batch = writeBatch(db);

  // 2. Clear old structures and crates
  const structuresColl = collection(db, 'battleEvent', 'structures', 'items');
  const structSnap = await getDocs(structuresColl);
  structSnap.forEach(s => batch.delete(s.ref));

  const cratesColl = collection(db, 'battleEvent', 'crates', 'items');
  const cratesSnap = await getDocs(cratesColl);
  cratesSnap.forEach(c => batch.delete(c.ref));

  // 3. Clear old arena players
  const playersColl = collection(db, 'battleEvent', 'players', 'items');
  const playersSnap = await getDocs(playersColl);
  playersSnap.forEach(p => batch.delete(p.ref));

  // 4. Initialize Arena Players with circular spawn distribution
  const count = lobbySnap.size || 1;
  let idx = 0;
  const arenaCenter = 2500;
  const spawnRadius = 1400;

  lobbySnap.forEach((docSnap) => {
    const l = docSnap.data() as LobbyPlayer;
    const angle = (idx / count) * 2 * Math.PI;
    const x = Math.round(arenaCenter + Math.cos(angle) * spawnRadius);
    const y = Math.round(arenaCenter + Math.sin(angle) * spawnRadius);

    const arenaPlayer: ArenaPlayer = {
      uid: l.uid,
      name: l.name,
      avatar: l.avatar || 'cyber_scientist',
      equippedWeapon: l.equippedWeapon || 'bunsen_burner',
      x,
      y,
      angle: angle + Math.PI, // look toward center
      hp: 100,
      maxHp: 100,
      shield: 50,
      maxShield: 100,
      wood: Math.max(10, l.wood || 20),
      brick: Math.max(10, l.brick || 10),
      metal: Math.max(5, l.metal || 5),
      isAlive: true,
      kills: 0
    };

    const targetDoc = doc(db, 'battleEvent', 'players', 'items', l.uid);
    batch.set(targetDoc, arenaPlayer);
    idx++;
  });

  // 5. Spawn 10 initial Science Supply Crates across the map
  for (let c = 0; c < 10; c++) {
    const q = CRATE_SCIENCE_QUESTIONS[c % CRATE_SCIENCE_QUESTIONS.length];
    const crateAngle = Math.random() * 2 * Math.PI;
    const crateDist = 300 + Math.random() * 1400;
    const cx = Math.round(arenaCenter + Math.cos(crateAngle) * crateDist);
    const cy = Math.round(arenaCenter + Math.sin(crateAngle) * crateDist);

    const crateId = `crate_${Date.now()}_${c}`;
    const crateRef = doc(db, 'battleEvent', 'crates', 'items', crateId);
    batch.set(crateRef, {
      id: crateId,
      x: cx,
      y: cy,
      isClaimed: false,
      rewardType: c % 2 === 0 ? 'shield' : 'materials',
      question: q
    });
  }

  // 6. Set state to IN_PROGRESS with 3600px border radius and randomized finish center
  const randomFinalX = Math.round(1300 + Math.random() * 2400);
  const randomFinalY = Math.round(1300 + Math.random() * 2400);

  batch.set(stateDoc, {
    status: 'IN_PROGRESS',
    startedAt: new Date().toISOString(),
    stormRadius: 3600,
    stormCenter: { x: arenaCenter, y: arenaCenter },
    stormFinalCenter: { x: randomFinalX, y: randomFinalY },
    currentWinner: null
  });

  await batch.commit();
};

/**
 * Teacher host action: Reset match and clear arena
 */
export const resetBattleEvent = async (): Promise<void> => {
  const batch = writeBatch(db);

  // Clear players
  const playersColl = collection(db, 'battleEvent', 'players', 'items');
  const playersSnap = await getDocs(playersColl);
  playersSnap.forEach(p => batch.delete(p.ref));

  // Clear structures
  const structuresColl = collection(db, 'battleEvent', 'structures', 'items');
  const structSnap = await getDocs(structuresColl);
  structSnap.forEach(s => batch.delete(s.ref));

  // Clear crates
  const cratesColl = collection(db, 'battleEvent', 'crates', 'items');
  const cratesSnap = await getDocs(cratesColl);
  cratesSnap.forEach(c => batch.delete(c.ref));

  // Reset state to LOBBY
  const stateDoc = doc(db, 'battleEvent', 'state');
  batch.set(stateDoc, DEFAULT_EVENT_STATE);

  await batch.commit();
};

/**
 * Win condition: Declare match winner
 */
export const declareBattleWinner = async (winner: { uid: string; name: string; avatar: string }): Promise<void> => {
  const stateDoc = doc(db, 'battleEvent', 'state');
  try {
    await setDoc(stateDoc, {
      status: 'ENDED',
      currentWinner: winner
    }, { merge: true });
  } catch (err) {
    console.warn('Error updating battle winner state:', err);
  }

  // Award Monthly Victory Crown badge and +200 XP, +100 Gold to the victor
  if (winner.uid) {
    const userDoc = doc(db, 'users', winner.uid);
    await setDoc(userDoc, {
      monthlyCrown: true,
      xp: increment(200),
      gold: increment(100)
    }, { merge: true });
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
  const playersColl = collection(db, 'battleEvent', 'players', 'items');
  return onSnapshot(playersColl, (snap) => {
    const list: ArenaPlayer[] = [];
    snap.forEach((docSnap) => {
      list.push(docSnap.data() as ArenaPlayer);
    });
    callback(list);
  });
};

/**
 * Ensure an arena player document exists in /battleEvent/players/items/{uid}.
 * If missing, initializes the player with their loadout and stats.
 */
export const ensureArenaPlayer = async (player: ArenaPlayer): Promise<void> => {
  if (!player.uid) return;
  const playerDoc = doc(db, 'battleEvent', 'players', 'items', player.uid);
  try {
    const snap = await getDoc(playerDoc);
    if (!snap.exists()) {
      await setDoc(playerDoc, player);
    } else {
      const data = snap.data();
      const updates: Partial<ArenaPlayer> = {};
      if (player.avatar && data.avatar !== player.avatar) {
        updates.avatar = player.avatar;
      }
      if (player.equippedWeapon && data.equippedWeapon !== player.equippedWeapon) {
        updates.equippedWeapon = player.equippedWeapon;
      }
      if (Object.keys(updates).length > 0) {
        await setDoc(playerDoc, updates, { merge: true });
      }
    }
  } catch (err) {
    console.warn('Could not ensure arena player existence:', err);
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
  const playerDoc = doc(db, 'battleEvent', 'players', 'items', uid);
  try {
    await setDoc(playerDoc, data, { merge: true });
  } catch (err) {
    console.warn('Error syncing player position:', err);
  }
};

/**
 * Deal damage to a player (absorbs shield first, then HP)
 */
export const damageArenaPlayer = async (
  targetUid: string,
  damageAmount: number,
  attackerUid?: string
): Promise<{ killed: boolean }> => {
  if (!targetUid) return { killed: false };
  const targetDoc = doc(db, 'battleEvent', 'players', 'items', targetUid);
  try {
    const snap = await getDoc(targetDoc);
    if (!snap.exists()) return { killed: false };

    const current = snap.data() as ArenaPlayer;
    if (!current.isAlive) return { killed: false };

    // Metal bunker active 50% damage reduction
    let actualDamage = damageAmount;
    if (current.metalShieldActiveUntil && current.metalShieldActiveUntil > Date.now()) {
      actualDamage = Math.round(actualDamage * 0.5);
    }

    let newShield = current.shield;
    let newHp = current.hp;

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
    const isKilled = newHp <= 0;

    await setDoc(targetDoc, {
      shield: newShield,
      hp: newHp,
      isAlive: !isKilled
    }, { merge: true });

    // Credit kill to attacker
    if (isKilled && attackerUid && attackerUid !== targetUid) {
      const attackerDoc = doc(db, 'battleEvent', 'players', 'items', attackerUid);
      await setDoc(attackerDoc, {
        kills: increment(1)
      }, { merge: true }).catch(() => {});
    }

    return { killed: isKilled };
  } catch (err) {
    console.warn('Error damaging player:', err);
    return { killed: false };
  }
};

/**
 * Subscribe to placed building structures
 */
export const subscribeToStructures = (
  callback: (structures: ArenaStructure[]) => void
): (() => void) => {
  const coll = collection(db, 'battleEvent', 'structures', 'items');
  return onSnapshot(coll, (snap) => {
    const list: ArenaStructure[] = [];
    snap.forEach((docSnap) => {
      list.push(docSnap.data() as ArenaStructure);
    });
    callback(list);
  });
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
    console.warn('Error placing arena structure:', err);
    return false;
  }
};

/**
 * Damage or destroy a placed structure
 */
export const damageArenaStructure = async (structureId: string, damage: number): Promise<void> => {
  if (!structureId) return;
  const structDoc = doc(db, 'battleEvent', 'structures', 'items', structureId);
  try {
    const snap = await getDoc(structDoc);
    if (!snap.exists()) return;

    const current = snap.data() as ArenaStructure;
    const newHp = current.hp - damage;

    if (newHp <= 0) {
      await deleteDoc(structDoc);
    } else {
      await setDoc(structDoc, { hp: newHp }, { merge: true });
    }
  } catch (err) {
    console.warn('Error damaging structure:', err);
  }
};

/**
 * Subscribe to supply crates
 */
export const subscribeToSupplyCrates = (
  callback: (crates: SupplyCrate[]) => void
): (() => void) => {
  const coll = collection(db, 'battleEvent', 'crates', 'items');
  return onSnapshot(coll, (snap) => {
    const list: SupplyCrate[] = [];
    snap.forEach((docSnap) => {
      list.push(docSnap.data() as SupplyCrate);
    });
    callback(list);
  });
};

/**
 * Spawn a new randomized mid-game supply crate
 */
export const dropMidGameSupplyCrate = async (): Promise<void> => {
  const crateId = `crate_${Date.now()}`;
  const arenaCenter = 2500;
  const angle = Math.random() * 2 * Math.PI;
  const dist = 200 + Math.random() * 1500;
  const x = Math.round(arenaCenter + Math.cos(angle) * dist);
  const y = Math.round(arenaCenter + Math.sin(angle) * dist);
  const q = CRATE_SCIENCE_QUESTIONS[Math.floor(Math.random() * CRATE_SCIENCE_QUESTIONS.length)];

  const crateRef = doc(db, 'battleEvent', 'crates', 'items', crateId);
  await setDoc(crateRef, {
    id: crateId,
    x,
    y,
    isClaimed: false,
    rewardType: Math.random() > 0.5 ? 'shield' : 'materials',
    question: q
  });
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
  const crateDoc = doc(db, 'battleEvent', 'crates', 'items', crateId);
  const playerDoc = doc(db, 'battleEvent', 'players', 'items', uid);

  try {
    // Delete crate or mark claimed
    await deleteDoc(crateDoc);

    // Apply reward
    if (rewardType === 'shield') {
      await setDoc(playerDoc, {
        shield: increment(50)
      }, { merge: true });
    } else {
      await setDoc(playerDoc, {
        wood: increment(20),
        brick: increment(15),
        metal: increment(10)
      }, { merge: true });
    }
  } catch (err) {
    console.warn('Error claiming supply crate:', err);
  }
};
