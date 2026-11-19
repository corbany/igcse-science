import type { ItemRarity, ShopItem } from '../services/firebaseGameService';

export interface BoosterPackConfig {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  badge: string;
  description: string;
  packNumber: 1 | 2 | 3 | 4;
  odds: {
    common: number;
    rare: number;
    epic: number;
    legendary: number;
    mythic: number;
  };
}

export const BOOSTER_PACKS: BoosterPackConfig[] = [
  {
    id: 'pack_1_catacombs',
    name: 'Pack 1: Starter Science Pack',
    subtitle: 'Tier I Science Champions and Lab Tools',
    price: 90,
    badge: 'Pack 1',
    packNumber: 1,
    description: 'Contains common and rare science characters and standard laboratory weapons.',
    odds: { common: 50, rare: 35, epic: 11, legendary: 3.5, mythic: 0.5 }
  },
  {
    id: 'pack_2_citadel',
    name: 'Pack 2: Advanced Science Pack',
    subtitle: 'Tier II Characters and Energy Tools',
    price: 120,
    badge: 'Pack 2',
    packNumber: 2,
    description: 'Higher chance for rare skirmishers, epic characters, and high-energy weapons.',
    odds: { common: 40, rare: 42, epic: 14, legendary: 3.5, mythic: 0.5 }
  },
  {
    id: 'pack_3_legends',
    name: 'Pack 3: Master Science Pack',
    subtitle: 'Tier III Armored Champions and Top Arsenals',
    price: 150,
    badge: 'Pack 3',
    packNumber: 3,
    description: 'Guarantees higher chances for legendary heroes and top-tier scientific equipment.',
    odds: { common: 25, rare: 40, epic: 24, legendary: 10.5, mythic: 0.5 }
  },
  {
    id: 'super_gold_pack',
    name: 'Super Gold Science Pack',
    subtitle: 'All 19 Characters and 10 Weapons',
    price: 250,
    badge: 'Super Pack',
    packNumber: 4,
    description: 'Premium booster pack with boosted epic and legendary drop rates.',
    odds: { common: 20, rare: 40, epic: 28, legendary: 11.5, mythic: 0.5 }
  }
];

export const RARITY_RANK: Record<ItemRarity, { rank: number; label: string; badgeClass: string }> = {
  mythic: { rank: 1, label: 'Mythic', badgeClass: 'bg-rose-100 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200 border-rose-300 dark:border-rose-800 font-black' },
  legendary: { rank: 2, label: 'Legendary', badgeClass: 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-800 font-bold' },
  epic: { rank: 3, label: 'Epic', badgeClass: 'bg-purple-100 dark:bg-purple-950/60 text-purple-900 dark:text-purple-200 border-purple-300 dark:border-purple-800 font-bold' },
  rare: { rank: 4, label: 'Rare', badgeClass: 'bg-cyan-100 dark:bg-cyan-950/60 text-cyan-900 dark:text-cyan-200 border-cyan-300 dark:border-cyan-800 font-bold' },
  common: { rank: 5, label: 'Common', badgeClass: 'bg-slate-100 dark:bg-zinc-900 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-zinc-700 font-semibold' }
};

export const ALL_WEAPON_ITEMS: ShopItem[] = [
  // --- 1. COMMON: Thermal Bunsen Burner (Starter) ---
  {
    id: 'bunsen_burner',
    name: 'Thermal Bunsen Burner',
    category: 'weapon',
    rarity: 'common',
    price: 0,
    icon: '🔥',
    description: 'Pressurized laboratory methane burner. High fire rate flame burst with continuous thermal cone spray.',
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

  // --- 2. COMMON: Corrosive Acid Pipette ---
  {
    id: 'acid_pipette',
    name: 'Corrosive Acid Pipette',
    category: 'weapon',
    rarity: 'common',
    price: 80,
    icon: '🧪',
    description: 'Pressurized jet of dilute hydrochloric acid that rapidly dissolves defenses and leaves caustic residue.',
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

  // --- 3. RARE: Cryogenic Frost Ray ---
  {
    id: 'cryo_freeze_ray',
    name: 'Cryogenic Frost Ray',
    category: 'weapon',
    rarity: 'rare',
    price: 180,
    icon: '❄️',
    description: 'Sub-zero liquid nitrogen emitter. Fires frosty beams that chill and slow enemy movement by 35% for 3.5s.',
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

  // --- 4. RARE: Prismatic Laser Cannon ---
  {
    id: 'laser_pointer',
    name: 'Prismatic Laser Cannon',
    category: 'weapon',
    rarity: 'rare',
    price: 220,
    icon: '🔦',
    description: 'Coherent Ruby photon beam. Extreme range and piercing photons that penetrate through enemies to hit targets behind them.',
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

  // --- 5. EPIC: Tesla Arc Disruptor ---
  {
    id: 'tesla_coil',
    name: 'Tesla Arc Disruptor',
    category: 'weapon',
    rarity: 'epic',
    price: 340,
    icon: '⚡',
    description: 'High-voltage electrostatic discharging coil that arcs across up to 3 consecutive targets within 215px.',
    stats: {
      damage: 35,
      fireRate: 3.6,
      cooldownSeconds: 0.28,
      range: 440,
      beamColor: '#38bdf8',
      specialEffect: '3-Target Chain Lightning',
      altFire: {
        altName: 'EMP Pulse Nova',
        altCooldownSeconds: 5.0,
        altDamage: 50,
        altType: 'emp_burst',
        altDescription: 'Releases a radial 360° electromagnetic pulse wave knocking back nearby hostiles.'
      }
    }
  },

  // --- 6. EPIC: Ultrasonic Resonator ---
  {
    id: 'centrifuge_sonic_blaster',
    name: 'Ultrasonic Resonator',
    category: 'weapon',
    rarity: 'epic',
    price: 380,
    icon: '🔊',
    description: 'Fires high-decibel acoustic resonance shock rings that violently push back opponents and structures.',
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

  // --- 7. LEGENDARY: Relativistic Particle Accelerator ---
  {
    id: 'particle_accelerator',
    name: 'Relativistic Particle Accelerator',
    category: 'weapon',
    rarity: 'legendary',
    price: 520,
    icon: '🌀',
    description: 'Relativistic particle collider firing supercharged dark matter plasma spheres that decimate barriers.',
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
        altDescription: 'Generates a gravity well that drags nearby enemies inward toward its center until it fades and implodes.'
      }
    }
  },

  // --- 8. LEGENDARY: Biohazard Mutagen Railgun ---
  {
    id: 'biohazard_railgun',
    name: 'Biohazard Mutagen Railgun',
    category: 'weapon',
    rarity: 'legendary',
    price: 580,
    icon: '☣️',
    description: 'Electromagnetic railgun propelling radioactive tungsten slugs with supreme penetrating sniper velocity.',
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

  // --- 9. MYTHIC: Quantum Displacer Rifle ---
  {
    id: 'quantum_displacer',
    name: 'Quantum Displacer Rifle',
    category: 'weapon',
    rarity: 'mythic',
    price: 780,
    icon: '🌌',
    description: 'Harnesses quantum entanglement to fire tachyon bolts that distort spacetime. Teleportation alternate fire.',
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

  // --- 10. MYTHIC: Antimatter Annihilator Core ---
  {
    id: 'antimatter_annihilator',
    name: 'Antimatter Annihilator Core',
    category: 'weapon',
    rarity: 'mythic',
    price: 950,
    icon: '⚛️',
    description: 'Top-secret particle synthesizer firing pure antiparticles that cause catastrophic subatomic annihilation.',
    stats: {
      damage: 115,
      fireRate: 0.7,
      cooldownSeconds: 1.35,
      range: 750,
      beamColor: '#f43f5e',
      specialEffect: 'Positron Annihilation',
      altFire: {
        altName: 'Orbital Positron Strike',
        altCooldownSeconds: 18.0,
        altDamage: 130,
        altType: 'orbital_strike',
        altDescription: 'Calls down a devastating orbital positron death ray targeting the mouse position after a 0.55s laser lock (18s recharge).'
      }
    }
  }
];

// 1-to-1 legacy ID -> canonical in-game arena weapon ID mapping for existing player inventories
export const WEAPON_ALIASES: Record<string, string> = {
  wpn_starter_blaster: 'bunsen_burner',
  wpn_freezer_lance: 'cryo_freeze_ray',
  wpn_sniper_railgun: 'laser_pointer',
  wpn_heavy_cannon: 'tesla_coil',
  wpn_rapid_repeater: 'centrifuge_sonic_blaster',
  wpn_solar_disintegrator: 'particle_accelerator',
  wpn_quantum_rifle: 'quantum_displacer',
  wpn_antimatter_rifle: 'antimatter_annihilator'
};

export const CATALOG_TO_ARENA_WEAPON_ALIASES: Record<string, string> = WEAPON_ALIASES;

export function resolveArenaWeaponId(weaponId?: string): string {
  if (!weaponId) return 'bunsen_burner';
  return WEAPON_ALIASES[weaponId] || weaponId;
}

export function resolveWeaponItem(weaponId?: string): ShopItem {
  if (!weaponId) return ALL_WEAPON_ITEMS[0];
  const canonicalId = resolveArenaWeaponId(weaponId);
  return (
    ALL_WEAPON_ITEMS.find(w => w.id === canonicalId || w.id === weaponId) ||
    ALL_WEAPON_ITEMS[0]
  );
}

export function hasWeaponInInventory(inventory: string[] | undefined, weaponId: string): boolean {
  const targetCanonical = resolveArenaWeaponId(weaponId);
  if (targetCanonical === 'bunsen_burner') return true;
  if (!inventory || inventory.length === 0) return false;
  return inventory.some(ownedId => resolveArenaWeaponId(ownedId) === targetCanonical);
}

export function getBoosterPackById(packId?: string): BoosterPackConfig | undefined {
  if (!packId) return undefined;
  return BOOSTER_PACKS.find(p => p.id === packId);
}

export const SKIN_DROP_PROBABILITY = 0.65;

/**
 * Roll a rarity tier strictly proportional to the pack's configured odds.
 * Normalizes weights so minor floating-point variance or non-100 sums never skew tiers.
 */
export function rollRarity(
  odds: BoosterPackConfig['odds'],
  rng: () => number = Math.random
): ItemRarity {
  const mythic = Math.max(0, Number(odds.mythic) || 0);
  const legendary = Math.max(0, Number(odds.legendary) || 0);
  const epic = Math.max(0, Number(odds.epic) || 0);
  const rare = Math.max(0, Number(odds.rare) || 0);
  const common = Math.max(0, Number(odds.common) || 0);
  const total = mythic + legendary + epic + rare + common;

  if (total <= 0) return 'common';

  const roll = Math.min(0.999999999999, Math.max(0, rng())) * total;
  let threshold = mythic;
  if (roll < threshold) return 'mythic';
  threshold += legendary;
  if (roll < threshold) return 'legendary';
  threshold += epic;
  if (roll < threshold) return 'epic';
  threshold += rare;
  if (roll < threshold) return 'rare';
  return 'common';
}

/**
 * Roll a booster pack reward (65% skin / 35% weapon) preserving the exact rolled rarity tier.
 */
export function rollPackReward<TSkin extends { id: string; rarity: ItemRarity }>(
  odds: BoosterPackConfig['odds'],
  skins: TSkin[],
  weapons: ShopItem[] = ALL_WEAPON_ITEMS,
  rng: () => number = Math.random
): { type: 'skin'; item: TSkin; rarity: ItemRarity } | { type: 'weapon'; item: ShopItem; rarity: ItemRarity } {
  const rolledRarity = rollRarity(odds, rng);
  const isSkinDrop = rng() < SKIN_DROP_PROBABILITY;

  const matchingSkins = skins.filter(s => s.rarity === rolledRarity);
  const matchingWeapons = weapons.filter(w => w.rarity === rolledRarity);

  if (isSkinDrop) {
    if (matchingSkins.length > 0) {
      const selected = matchingSkins[Math.floor(rng() * matchingSkins.length)];
      return { type: 'skin', item: selected, rarity: rolledRarity };
    }
    if (matchingWeapons.length > 0) {
      const selected = matchingWeapons[Math.floor(rng() * matchingWeapons.length)];
      return { type: 'weapon', item: selected, rarity: rolledRarity };
    }
  } else {
    if (matchingWeapons.length > 0) {
      const selected = matchingWeapons[Math.floor(rng() * matchingWeapons.length)];
      return { type: 'weapon', item: selected, rarity: rolledRarity };
    }
    if (matchingSkins.length > 0) {
      const selected = matchingSkins[Math.floor(rng() * matchingSkins.length)];
      return { type: 'skin', item: selected, rarity: rolledRarity };
    }
  }

  // Fallback only if a rarity has neither skins nor weapons in catalog
  const selected = skins[Math.floor(rng() * skins.length)];
  return { type: 'skin', item: selected, rarity: selected.rarity };
}


