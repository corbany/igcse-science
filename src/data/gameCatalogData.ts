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
  // --- COMMON (Rank 5) ---
  {
    id: 'wpn_starter_blaster',
    name: 'Laboratory Pulse Blaster',
    category: 'weapon',
    rarity: 'common',
    price: 0,
    icon: '🔫',
    description: 'Standard issue laboratory scientific blaster for precision target practice.',
    stats: { damage: 18, fireRate: 2.9, cooldownSeconds: 0.35, range: 450, specialEffect: 'laser' }
  },
  {
    id: 'bunsen_burner',
    name: 'Thermal Bunsen Burner',
    category: 'weapon',
    rarity: 'common',
    price: 0,
    icon: '🔥',
    description: 'Pressurized laboratory methane burner with continuous thermal cone spray.',
    stats: { damage: 16, fireRate: 4.5, cooldownSeconds: 0.22, range: 340, specialEffect: 'thermal' }
  },
  {
    id: 'acid_pipette',
    name: 'Corrosive Acid Pipette',
    category: 'weapon',
    rarity: 'common',
    price: 80,
    icon: '🧪',
    description: 'Pressurized jet of dilute hydrochloric acid that rapidly dissolves defenses.',
    stats: { damage: 20, fireRate: 3.1, cooldownSeconds: 0.32, range: 380, specialEffect: 'acid' }
  },

  // --- RARE (Rank 4) ---
  {
    id: 'wpn_heavy_cannon',
    name: 'Tesla Ion Cannon',
    category: 'weapon',
    rarity: 'rare',
    price: 180,
    icon: '⚡',
    description: 'Fires high-voltage electromagnetic rounds that pierce multiple targets.',
    stats: { damage: 45, fireRate: 1.2, cooldownSeconds: 0.85, range: 600, specialEffect: 'lightning' }
  },
  {
    id: 'wpn_rapid_repeater',
    name: 'Quantum Rapid Repeater',
    category: 'weapon',
    rarity: 'rare',
    price: 150,
    icon: '🌀',
    description: 'Rapid-fire quantum particle accelerator with high cycle rate.',
    stats: { damage: 12, fireRate: 8.3, cooldownSeconds: 0.12, range: 380, specialEffect: 'plasma' }
  },

  // --- EPIC (Rank 3) ---
  {
    id: 'wpn_sniper_railgun',
    name: 'Linear Accelerator Railgun',
    category: 'weapon',
    rarity: 'epic',
    price: 260,
    icon: '🎯',
    description: 'Long-range electromagnetic photon rifle that penetrates through enemies to hit targets behind them.',
    stats: { damage: 85, fireRate: 0.7, cooldownSeconds: 1.4, range: 900, specialEffect: 'beam' }
  },
  {
    id: 'wpn_freezer_lance',
    name: 'Cryogenic Absolute Zero Lance',
    category: 'weapon',
    rarity: 'epic',
    price: 240,
    icon: '❄️',
    description: 'Emits a cryogenic beam that chills and slows enemy movement speed by 35% for 3.5s.',
    stats: { damage: 32, fireRate: 2.0, cooldownSeconds: 0.5, range: 500, specialEffect: 'frost' }
  },

  // --- LEGENDARY (Rank 2) ---
  {
    id: 'wpn_solar_disintegrator',
    name: 'Solar Thermal Disintegrator',
    category: 'weapon',
    rarity: 'legendary',
    price: 360,
    icon: '☀️',
    description: 'Channels concentrated solar radiation for massive thermal area damage.',
    stats: { damage: 95, fireRate: 0.8, cooldownSeconds: 1.2, range: 750, specialEffect: 'solar' }
  },

  // --- MYTHIC (Rank 1) ---
  {
    id: 'quantum_displacer',
    name: 'Quantum Displacer Rifle',
    category: 'weapon',
    rarity: 'mythic',
    price: 780,
    icon: '🌌',
    description: 'Harnesses quantum entanglement to fire tachyon bolts with phase warp.',
    stats: { damage: 54, fireRate: 4.0, cooldownSeconds: 0.25, range: 680, specialEffect: 'tachyon' }
  },
  {
    id: 'wpn_antimatter_rifle',
    name: 'Antimatter Annihilator',
    category: 'weapon',
    rarity: 'mythic',
    price: 500,
    icon: '⚛️',
    description: 'Experimental antimatter particle rifle with maximum theoretical power.',
    stats: { damage: 120, fireRate: 0.7, cooldownSeconds: 1.5, range: 850, specialEffect: 'void' }
  }
];

export const WEAPON_ALIASES: Record<string, string> = {
  cryo_freeze_ray: 'wpn_freezer_lance',
  laser_pointer: 'wpn_sniper_railgun',
  tesla_coil: 'wpn_heavy_cannon',
  centrifuge_sonic_blaster: 'wpn_rapid_repeater',
  particle_accelerator: 'wpn_solar_disintegrator',
  biohazard_railgun: 'wpn_sniper_railgun',
  wpn_quantum_rifle: 'quantum_displacer',
  antimatter_annihilator: 'wpn_antimatter_rifle'
};

export const CATALOG_TO_ARENA_WEAPON_ALIASES: Record<string, string> = {
  wpn_starter_blaster: 'bunsen_burner',
  wpn_freezer_lance: 'cryo_freeze_ray',
  wpn_sniper_railgun: 'laser_pointer',
  wpn_heavy_cannon: 'tesla_coil',
  wpn_rapid_repeater: 'centrifuge_sonic_blaster',
  wpn_solar_disintegrator: 'particle_accelerator',
  wpn_quantum_rifle: 'quantum_displacer',
  wpn_antimatter_rifle: 'antimatter_annihilator'
};

export function resolveWeaponItem(weaponId?: string): ShopItem {
  if (!weaponId) return ALL_WEAPON_ITEMS[0];
  const canonicalId = WEAPON_ALIASES[weaponId] || weaponId;
  return (
    ALL_WEAPON_ITEMS.find(w => w.id === canonicalId || w.id === weaponId) ||
    ALL_WEAPON_ITEMS[0]
  );
}

export function resolveArenaWeaponId(weaponId?: string): string {
  if (!weaponId) return 'bunsen_burner';
  return CATALOG_TO_ARENA_WEAPON_ALIASES[weaponId] || weaponId;
}

export function hasWeaponInInventory(inventory: string[] | undefined, weaponId: string): boolean {
  if (!inventory || inventory.length === 0) return false;
  if (inventory.includes(weaponId)) return true;
  const canonical = WEAPON_ALIASES[weaponId];
  if (canonical && inventory.includes(canonical)) return true;
  const arenaId = CATALOG_TO_ARENA_WEAPON_ALIASES[weaponId];
  if (arenaId && inventory.includes(arenaId)) return true;
  // Check any other alias that maps to the same canonical or arena weapon
  return inventory.some(ownedId => {
    const ownedCanonical = WEAPON_ALIASES[ownedId] || ownedId;
    const targetCanonical = WEAPON_ALIASES[weaponId] || weaponId;
    return ownedCanonical === targetCanonical || resolveArenaWeaponId(ownedId) === resolveArenaWeaponId(weaponId);
  });
}

export function getBoosterPackById(packId?: string): BoosterPackConfig | undefined {
  if (!packId) return undefined;
  return BOOSTER_PACKS.find(p => p.id === packId);
}

