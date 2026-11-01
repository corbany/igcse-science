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

export interface ActionSheets {
  idle: string;
  walk: string;
  run: string;
  attack: string;
  hurt: string;
  death: string;
}

export interface FantasySkinDefinition {
  id: string;
  name: string;
  title: string;
  rarity: ItemRarity;
  category: 'skin';
  price: number;
  icon: string;
  imageSrc: string; // High-res portrait path: '/assets/characters/{id}.png'
  sheetImg: string; // Default idle sheet path: '/assets/aistudio/{name}_idle_sheet_{hash}.png'
  avatarImg?: string;
  portraitPath?: string;
  spritePath?: string;
  subject?: string;
  actionSheets: ActionSheets;
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

// 256x256 modular frames from 1024x1024 sprite sheets (4x4 grid)
const modularFrames256: CharacterSpriteAnimation = {
  idle: [
    { x: 0, y: 0, w: 256, h: 256 },
    { x: 256, y: 0, w: 256, h: 256 },
    { x: 512, y: 0, w: 256, h: 256 },
    { x: 768, y: 0, w: 256, h: 256 }
  ],
  walkDown: [
    { x: 0, y: 0, w: 256, h: 256 },
    { x: 256, y: 0, w: 256, h: 256 },
    { x: 512, y: 0, w: 256, h: 256 },
    { x: 768, y: 0, w: 256, h: 256 }
  ],
  walkUp: [
    { x: 0, y: 256, w: 256, h: 256 },
    { x: 256, y: 256, w: 256, h: 256 },
    { x: 512, y: 256, w: 256, h: 256 },
    { x: 768, y: 256, w: 256, h: 256 }
  ],
  walkSide: [
    { x: 0, y: 512, w: 256, h: 256 },
    { x: 256, y: 512, w: 256, h: 256 },
    { x: 512, y: 512, w: 256, h: 256 },
    { x: 768, y: 512, w: 256, h: 256 }
  ],
  action: [
    { x: 0, y: 0, w: 256, h: 256 },
    { x: 256, y: 0, w: 256, h: 256 },
    { x: 512, y: 0, w: 256, h: 256 },
    { x: 768, y: 0, w: 256, h: 256 }
  ]
};

// ============================================================================
// MODULAR ACTION SHEETS REGISTRY (1024x1024 / 256x256 FRAMES)
// ============================================================================

export const CHARACTER_ACTION_SHEETS: Record<string, ActionSheets> = {
  archer: {
    idle: '/assets/aistudio/archer_idle_sheet_022bd33a.png',
    walk: '/assets/aistudio/archer_walk_sheet_896af865.png',
    run: '/assets/aistudio/archer_run_sheet_8879e672.png',
    attack: '/assets/aistudio/archer_attack_sheet_c631c734.png',
    hurt: '/assets/aistudio/archer_hurt_sheet_a65b19c3.png',
    death: '/assets/aistudio/archer_death_sheet_53b4b5ef.png'
  },
  bat: {
    idle: '/assets/aistudio/bat_idle_sheet_82abec90.png',
    walk: '/assets/aistudio/bat_walk_sheet_ea94ff3f.png',
    run: '/assets/aistudio/bat_run_sheet_f56b54d9.png',
    attack: '/assets/aistudio/bat_attack_sheet_45186c1f.png',
    hurt: '/assets/aistudio/bat_hurt_sheet_b1ee6e0d.png',
    death: '/assets/aistudio/bat_death_sheet_9c4b36d2.png'
  },
  bloodskeleton: {
    idle: '/assets/aistudio/bloodskeleton_idle_sheet_0c19161d.png',
    walk: '/assets/aistudio/bloodskeleton_walk_sheet_f896bd4f.png',
    run: '/assets/aistudio/bloodskeleton_run_sheet_b00b821b.png',
    attack: '/assets/aistudio/bloodskeleton_attack_sheet_bd207f5c.png',
    hurt: '/assets/aistudio/bloodskeleton_hurt_sheet_76439689.png',
    death: '/assets/aistudio/bloodskeleton_death_sheet_ae6e907d.png'
  },
  boss: {
    idle: '/assets/aistudio/boss_idle_sheet_5eca5659.png',
    walk: '/assets/aistudio/boss_walk_sheet_44991c1e.png',
    run: '/assets/aistudio/boss_run_sheet_3047a13c.png',
    attack: '/assets/aistudio/boss_attack_sheet_569f06ee.png',
    hurt: '/assets/aistudio/boss_hurt_sheet_b186f46c.png',
    death: '/assets/aistudio/boss_death_sheet_2be4106c.png'
  },
  elitearcher: {
    idle: '/assets/aistudio/elitearcher_idle_sheet_4142dbdc.png',
    walk: '/assets/aistudio/elitearcher_walk_sheet_a1f48224.png',
    run: '/assets/aistudio/elitearcher_run_sheet_6018d44e.png',
    attack: '/assets/aistudio/elitearcher_attack_sheet_8096578a.png',
    hurt: '/assets/aistudio/elitearcher_hurt_sheet_f679d7bd.png',
    death: '/assets/aistudio/elitearcher_death_sheet_3ac5295d.png'
  },
  fireorc: {
    idle: '/assets/aistudio/fireorc_idle_sheet_e7fcf961.png',
    walk: '/assets/aistudio/fireorc_walk_sheet_91164210.png',
    run: '/assets/aistudio/fireorc_run_sheet_fa3f9919.png',
    attack: '/assets/aistudio/fireorc_attack_sheet_c8fe05d6.png',
    hurt: '/assets/aistudio/fireorc_hurt_sheet_3ddd3b27.png',
    death: '/assets/aistudio/fireorc_death_sheet_d242bbd5.png'
  },
  frostslime: {
    idle: '/assets/aistudio/frostslime_idle_sheet_d472e7ec.png',
    walk: '/assets/aistudio/frostslime_walk_sheet_7e9322f5.png',
    run: '/assets/aistudio/frostslime_run_sheet_c9b107b7.png',
    attack: '/assets/aistudio/frostslime_attack_sheet_e7cbe783.png',
    hurt: '/assets/aistudio/frostslime_hurt_sheet_5a3235b1.png',
    death: '/assets/aistudio/frostslime_death_sheet_e228bce8.png'
  },
  goblin: {
    idle: '/assets/aistudio/goblin_idle_sheet_c2ce115a.png',
    walk: '/assets/aistudio/goblin_walk_sheet_759f3316.png',
    run: '/assets/aistudio/goblin_run_sheet_59857976.png',
    attack: '/assets/aistudio/goblin_attack_sheet_18f46e35.png',
    hurt: '/assets/aistudio/goblin_hurt_sheet_7b1f604d.png',
    death: '/assets/aistudio/goblin_death_sheet_b3018299.png'
  },
  hero: {
    idle: '/assets/aistudio/hero_idle_sheet_50a2ffbe.png',
    walk: '/assets/aistudio/hero_walk_sheet_42e43b3b.png',
    run: '/assets/aistudio/hero_run_sheet_3360c8c7.png',
    attack: '/assets/aistudio/hero_attack_sheet_ab7f4753.png',
    hurt: '/assets/aistudio/hero_hurt_sheet_a824308c.png',
    death: '/assets/aistudio/hero_death_sheet_19b43c96.png'
  },
  mage: {
    idle: '/assets/aistudio/mage_idle_sheet_2c3d3625.png',
    walk: '/assets/aistudio/mage_walk_sheet_f7e497bf.png',
    run: '/assets/aistudio/mage_run_sheet_91d90855.png',
    attack: '/assets/aistudio/mage_attack_sheet_0fd489bc.png',
    hurt: '/assets/aistudio/mage_hurt_sheet_ff263236.png',
    death: '/assets/aistudio/mage_death_sheet_c72231d5.png'
  },
  merchant: {
    idle: '/assets/aistudio/merchant_idle_sheet_3e60e34b.png',
    walk: '/assets/aistudio/merchant_walk_sheet_9cf7f76e.png',
    run: '/assets/aistudio/merchant_walk_sheet_9cf7f76e.png',
    attack: '/assets/aistudio/merchant_sheet_9d262546.png',
    hurt: '/assets/aistudio/merchant_sheet_9d262546.png',
    death: '/assets/aistudio/merchant_sheet_9d262546.png'
  },
  necromancer: {
    idle: '/assets/aistudio/necromancer_idle_sheet_375695eb.png',
    walk: '/assets/aistudio/necromancer_walk_sheet_6c7c81a3.png',
    run: '/assets/aistudio/necromancer_run_sheet_610facc6.png',
    attack: '/assets/aistudio/necromancer_attack_sheet_764e4a55.png',
    hurt: '/assets/aistudio/necromancer_hurt_sheet_def5b07e.png',
    death: '/assets/aistudio/necromancer_death_sheet_b5adfde8.png'
  },
  orc: {
    idle: '/assets/aistudio/orc_idle_sheet_d26e4f49.png',
    walk: '/assets/aistudio/orc_walk_sheet_c1bd7722.png',
    run: '/assets/aistudio/orc_run_sheet_726a2ba7.png',
    attack: '/assets/aistudio/orc_attack_sheet_1fb701c8.png',
    hurt: '/assets/aistudio/orc_hurt_sheet_dcd8ef72.png',
    death: '/assets/aistudio/orc_death_sheet_2d134f92.png'
  },
  shadowgoblin: {
    idle: '/assets/aistudio/shadowgoblin_idle_sheet_966ee65d.png',
    walk: '/assets/aistudio/shadowgoblin_walk_sheet_68f75015.png',
    run: '/assets/aistudio/shadowgoblin_run_sheet_d9271f27.png',
    attack: '/assets/aistudio/shadowgoblin_attack_sheet_364f11d3.png',
    hurt: '/assets/aistudio/shadowgoblin_hurt_sheet_150bdc6d.png',
    death: '/assets/aistudio/shadowgoblin_death_sheet_35591d14.png'
  },
  skeleton: {
    idle: '/assets/aistudio/skeleton_idle_sheet_a23d65d1.png',
    walk: '/assets/aistudio/skeleton_walk_sheet_ba39ec65.png',
    run: '/assets/aistudio/skeleton_run_sheet_9148983c.png',
    attack: '/assets/aistudio/skeleton_attack_sheet_35492229.png',
    hurt: '/assets/aistudio/skeleton_hurt_sheet_28600184.png',
    death: '/assets/aistudio/skeleton_death_sheet_70291b45.png'
  },
  slime: {
    idle: '/assets/aistudio/slime_idle_sheet_795567fa.png',
    walk: '/assets/aistudio/slime_walk_sheet_5398281f.png',
    run: '/assets/aistudio/slime_run_sheet_6f8c2ad8.png',
    attack: '/assets/aistudio/slime_attack_sheet_e4b0ef2f.png',
    hurt: '/assets/aistudio/slime_hurt_sheet_2e75c369.png',
    death: '/assets/aistudio/slime_death_sheet_b1e160ad.png'
  },
  slimeking: {
    idle: '/assets/aistudio/slimeking_idle_sheet_94cd5590.png',
    walk: '/assets/aistudio/slimeking_walk_sheet_dd74efd3.png',
    run: '/assets/aistudio/slimeking_run_sheet_7cc0cf8e.png',
    attack: '/assets/aistudio/slimeking_attack_sheet_43229704.png',
    hurt: '/assets/aistudio/slimeking_hurt_sheet_3146c8c0.png',
    death: '/assets/aistudio/slimeking_death_sheet_50eb5272.png'
  },
  toxicbat: {
    idle: '/assets/aistudio/toxicbat_idle_sheet_36a3077c.png',
    walk: '/assets/aistudio/toxicbat_walk_sheet_6d905bb5.png',
    run: '/assets/aistudio/toxicbat_run_sheet_33ecc5ee.png',
    attack: '/assets/aistudio/toxicbat_attack_sheet_d42b2296.png',
    hurt: '/assets/aistudio/toxicbat_hurt_sheet_4acf742c.png',
    death: '/assets/aistudio/toxicbat_death_sheet_fde65cdf.png'
  },
  villager: {
    idle: '/assets/aistudio/villager_idle_sheet_4533d3ef.png',
    walk: '/assets/aistudio/villager_walk_sheet_0c1eded1.png',
    run: '/assets/aistudio/villager_walk_sheet_0c1eded1.png',
    attack: '/assets/aistudio/villager_sheet_1bf23f20.png',
    hurt: '/assets/aistudio/villager_sheet_1bf23f20.png',
    death: '/assets/aistudio/villager_sheet_1bf23f20.png'
  }
};

// ============================================================================
// 19 FANTASY DUNGEON CHAMPIONS REGISTRY
// ============================================================================

export const ALL_FANTASY_SKINS: FantasySkinDefinition[] = [
  // --- COMMON (4) ---
  {
    id: 'cultist',
    name: 'Cultist',
    title: 'Occult Acolyte',
    rarity: 'common',
    category: 'skin',
    price: 80,
    icon: '🔮',
    imageSrc: '/assets/characters/cultist.png',
    portraitPath: '/assets/characters/cultist.png',
    spritePath: '/assets/characters/cultist.png',
    sheetImg: CHARACTER_ACTION_SHEETS.bloodskeleton.idle,
    actionSheets: CHARACTER_ACTION_SHEETS.bloodskeleton,
    frames: modularFrames256,
    lore: 'Devotee of the forbidden catacombs, draped in crimson robes and bound by ancient blood covenants.',
    ability: 'Blood Ritual: Siphons subtle life essence from fallen foes.',
    cardColor: 'from-purple-900 to-slate-950',
    borderClass: 'border-purple-600/60 shadow-purple-900/30',
    holoGradient: 'linear-gradient(135deg, rgba(168,85,247,0.3) 0%, rgba(220,38,38,0.2) 100%)',
    cardNumber: '01/19',
    packNumber: 1,
    theme: { auraColor: '#a855f7', badgeBg: 'bg-purple-950/80 border-purple-500/50' }
  },
  {
    id: 'skeleton_warrior',
    name: 'Skeleton',
    title: 'Risen Guardian',
    rarity: 'common',
    category: 'skin',
    price: 90,
    icon: '💀',
    imageSrc: '/assets/characters/skeleton_warrior.png',
    portraitPath: '/assets/characters/skeleton_warrior.png',
    spritePath: '/assets/characters/skeleton_warrior.png',
    sheetImg: CHARACTER_ACTION_SHEETS.skeleton.idle,
    actionSheets: CHARACTER_ACTION_SHEETS.skeleton,
    frames: modularFrames256,
    lore: 'An ancient guardian reanimated from the bone crypts, wielding a notched longbow and bone armor.',
    ability: 'Brittle Guard: Absorbs single fatal physical strikes with bone plating.',
    cardColor: 'from-stone-800 to-slate-950',
    borderClass: 'border-stone-500/60 shadow-stone-800/30',
    holoGradient: 'linear-gradient(135deg, rgba(214,211,209,0.3) 0%, rgba(120,113,108,0.2) 100%)',
    cardNumber: '02/19',
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
    portraitPath: '/assets/characters/goblin.png',
    spritePath: '/assets/characters/goblin.png',
    sheetImg: CHARACTER_ACTION_SHEETS.goblin.idle,
    actionSheets: CHARACTER_ACTION_SHEETS.goblin,
    frames: modularFrames256,
    lore: 'A nimble cave-dweller wielding a crude cleaver and an obsession for shiny loot crates.',
    ability: 'Gold Snatcher: Finds bonus gold and wood in destroyed structures.',
    cardColor: 'from-lime-900 to-slate-950',
    borderClass: 'border-lime-600/60 shadow-lime-900/30',
    holoGradient: 'linear-gradient(135deg, rgba(132,204,22,0.3) 0%, rgba(101,163,13,0.2) 100%)',
    cardNumber: '03/19',
    packNumber: 1,
    theme: { auraColor: '#84cc16', badgeBg: 'bg-lime-950/80 border-lime-500/50' }
  },
  {
    id: 'slime',
    name: 'Slime',
    title: 'Gelatinous Puddle',
    rarity: 'common',
    category: 'skin',
    price: 85,
    icon: '🟢',
    imageSrc: '/assets/characters/slime.png',
    portraitPath: '/assets/characters/slime.png',
    spritePath: '/assets/characters/slime.png',
    sheetImg: CHARACTER_ACTION_SHEETS.slime.idle,
    actionSheets: CHARACTER_ACTION_SHEETS.slime,
    frames: modularFrames256,
    lore: 'An emerald acidic blob that wobbles through dungeon corridors absorbing moisture and discarded bolts.',
    ability: 'Viscous Form: Slime body dampens fall impact and bounces off solid surfaces.',
    cardColor: 'from-emerald-900 to-slate-950',
    borderClass: 'border-emerald-600/60 shadow-emerald-900/30',
    holoGradient: 'linear-gradient(135deg, rgba(52,211,153,0.3) 0%, rgba(16,185,129,0.2) 100%)',
    cardNumber: '04/19',
    packNumber: 1,
    theme: { auraColor: '#10b981', badgeBg: 'bg-emerald-950/80 border-emerald-500/50' }
  },

  // --- RARE (5) ---
  {
    id: 'archer_hero',
    name: 'Archer',
    title: 'Keen Ranger',
    rarity: 'rare',
    category: 'skin',
    price: 160,
    icon: '🏹',
    imageSrc: '/assets/characters/archer_hero.png',
    portraitPath: '/assets/characters/archer_hero.png',
    spritePath: '/assets/characters/archer_hero.png',
    sheetImg: CHARACTER_ACTION_SHEETS.archer.idle,
    actionSheets: CHARACTER_ACTION_SHEETS.archer,
    frames: modularFrames256,
    lore: 'A deadly marksman hailing from the whispering forest, boasting unmatched bowstring speed.',
    ability: 'Eagle Eye: Extended weapon projectile velocity and precision.',
    cardColor: 'from-emerald-900 to-slate-950',
    borderClass: 'border-emerald-500/70 shadow-emerald-900/40',
    holoGradient: 'linear-gradient(135deg, rgba(16,185,129,0.35) 0%, rgba(5,150,105,0.25) 100%)',
    cardNumber: '05/19',
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
    portraitPath: '/assets/characters/rogue.png',
    spritePath: '/assets/characters/rogue.png',
    sheetImg: CHARACTER_ACTION_SHEETS.shadowgoblin.idle,
    actionSheets: CHARACTER_ACTION_SHEETS.shadowgoblin,
    frames: modularFrames256,
    lore: 'Slips through shadows unnoticed with dual daggers coated in paralyzing cavern venom.',
    ability: 'Silent Stride: Footstep sounds reduced across terrain surfaces.',
    cardColor: 'from-indigo-900 to-slate-950',
    borderClass: 'border-indigo-500/70 shadow-indigo-900/40',
    holoGradient: 'linear-gradient(135deg, rgba(99,102,241,0.35) 0%, rgba(79,70,229,0.25) 100%)',
    cardNumber: '06/19',
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
    portraitPath: '/assets/characters/necromancer.png',
    spritePath: '/assets/characters/necromancer.png',
    sheetImg: CHARACTER_ACTION_SHEETS.necromancer.idle,
    actionSheets: CHARACTER_ACTION_SHEETS.necromancer,
    frames: modularFrames256,
    lore: 'Channels the chill of the underworld with a staff carved from dragon bone.',
    ability: 'Spectral Flame: Attacks leave lingering soul-burn damage.',
    cardColor: 'from-cyan-950 to-slate-950',
    borderClass: 'border-cyan-500/70 shadow-cyan-900/40',
    holoGradient: 'linear-gradient(135deg, rgba(6,182,212,0.35) 0%, rgba(14,116,144,0.25) 100%)',
    cardNumber: '07/19',
    packNumber: 2,
    theme: { auraColor: '#06b6d4', badgeBg: 'bg-cyan-950/80 border-cyan-500/50' }
  },
  {
    id: 'discoverer',
    name: 'Discoverer',
    title: 'Expedition Scout',
    rarity: 'rare',
    category: 'skin',
    price: 170,
    icon: '🧭',
    imageSrc: '/assets/characters/discoverer.png',
    portraitPath: '/assets/characters/discoverer.png',
    spritePath: '/assets/characters/discoverer.png',
    sheetImg: CHARACTER_ACTION_SHEETS.villager.idle,
    actionSheets: CHARACTER_ACTION_SHEETS.villager,
    frames: modularFrames256,
    lore: 'A veteran cartographer equipped with surveyor sextants and durable canvas travel gear.',
    ability: 'Treasure Sense: Highlights supply crates and high-tier ground loot on minimap.',
    cardColor: 'from-sky-900 to-slate-950',
    borderClass: 'border-sky-500/70 shadow-sky-900/40',
    holoGradient: 'linear-gradient(135deg, rgba(14,165,233,0.35) 0%, rgba(2,132,199,0.25) 100%)',
    cardNumber: '08/19',
    packNumber: 2,
    theme: { auraColor: '#0ea5e9', badgeBg: 'bg-sky-950/80 border-sky-500/50' }
  },
  {
    id: 'bat',
    name: 'Vampire Bat',
    title: 'Cavern Flutterer',
    rarity: 'rare',
    category: 'skin',
    price: 175,
    icon: '🦇',
    imageSrc: '/assets/characters/bat.png',
    portraitPath: '/assets/characters/bat.png',
    spritePath: '/assets/characters/bat.png',
    sheetImg: CHARACTER_ACTION_SHEETS.bat.idle,
    actionSheets: CHARACTER_ACTION_SHEETS.bat,
    frames: modularFrames256,
    lore: 'Flutters silently along the roof of forgotten crypts, swooping down with razor sharp fangs.',
    ability: 'Echolocation: Detects enemy footsteps behind walls with audible frequency pings.',
    cardColor: 'from-violet-950 to-slate-950',
    borderClass: 'border-violet-500/70 shadow-violet-900/40',
    holoGradient: 'linear-gradient(135deg, rgba(139,92,246,0.35) 0%, rgba(109,40,217,0.25) 100%)',
    cardNumber: '09/19',
    packNumber: 2,
    theme: { auraColor: '#8b5cf6', badgeBg: 'bg-violet-950/80 border-violet-500/50' }
  },

  // --- EPIC (5) ---
  {
    id: 'white_mage',
    name: 'White Mage',
    title: 'Archmage of Light',
    rarity: 'epic',
    category: 'skin',
    price: 260,
    icon: '🧙‍♂️',
    imageSrc: '/assets/characters/white_mage.png',
    portraitPath: '/assets/characters/white_mage.png',
    spritePath: '/assets/characters/white_mage.png',
    sheetImg: CHARACTER_ACTION_SHEETS.mage.idle,
    actionSheets: CHARACTER_ACTION_SHEETS.mage,
    frames: modularFrames256,
    lore: 'A master of restoration arts clothed in pristine ivory robes, wielding a crystal prism focus.',
    ability: 'Aura of Restoration: Regenerates shield reserves while standing near river shores.',
    cardColor: 'from-amber-900/60 via-purple-900/80 to-slate-950',
    borderClass: 'border-purple-400 shadow-purple-500/30',
    holoGradient: 'linear-gradient(135deg, rgba(192,132,252,0.4) 0%, rgba(251,191,36,0.3) 100%)',
    cardNumber: '10/19',
    packNumber: 2,
    theme: { auraColor: '#c084fc', badgeBg: 'bg-purple-900/80 border-purple-400/60' }
  },
  {
    id: 'paladin',
    name: 'Paladin',
    title: 'Crusader of Dawn',
    rarity: 'epic',
    category: 'skin',
    price: 280,
    icon: '🛡️',
    imageSrc: '/assets/characters/paladin.png',
    portraitPath: '/assets/characters/paladin.png',
    spritePath: '/assets/characters/paladin.png',
    sheetImg: CHARACTER_ACTION_SHEETS.hero.idle,
    actionSheets: CHARACTER_ACTION_SHEETS.hero,
    frames: modularFrames256,
    lore: 'Clad in polished holy plate mail, carrying the consecrated standard of the high order.',
    ability: 'Holy Bulwark: Placed metal walls gain 25% bonus fortification hitpoints.',
    cardColor: 'from-yellow-900/70 via-amber-950 to-slate-950',
    borderClass: 'border-yellow-400 shadow-yellow-500/30',
    holoGradient: 'linear-gradient(135deg, rgba(250,204,21,0.45) 0%, rgba(217,119,6,0.35) 100%)',
    cardNumber: '11/19',
    packNumber: 3,
    theme: { auraColor: '#facc15', badgeBg: 'bg-yellow-950/80 border-yellow-400/60' }
  },
  {
    id: 'dark_knight',
    name: 'Dark Knight',
    title: 'Abyssal Juggernaut',
    rarity: 'epic',
    category: 'skin',
    price: 300,
    icon: '⚔️',
    imageSrc: '/assets/characters/dark_knight.png',
    portraitPath: '/assets/characters/dark_knight.png',
    spritePath: '/assets/characters/dark_knight.png',
    sheetImg: CHARACTER_ACTION_SHEETS.boss.idle,
    actionSheets: CHARACTER_ACTION_SHEETS.boss,
    frames: modularFrames256,
    lore: 'Heavy dark steel plate forged in volcanic trenches, radiating an intimidating presence.',
    ability: 'Heavy Armor: Reduces incoming damage from the storm boundary.',
    cardColor: 'from-slate-800 via-rose-950 to-slate-950',
    borderClass: 'border-rose-400 shadow-rose-500/30',
    holoGradient: 'linear-gradient(135deg, rgba(244,63,94,0.4) 0%, rgba(136,19,55,0.3) 100%)',
    cardNumber: '12/19',
    packNumber: 3,
    theme: { auraColor: '#f43f5e', badgeBg: 'bg-rose-950/80 border-rose-400/60' }
  },
  {
    id: 'warlock',
    name: 'Warlock',
    title: 'Void Binder',
    rarity: 'epic',
    category: 'skin',
    price: 290,
    icon: '🔮',
    imageSrc: '/assets/characters/warlock.png',
    portraitPath: '/assets/characters/warlock.png',
    spritePath: '/assets/characters/warlock.png',
    sheetImg: CHARACTER_ACTION_SHEETS.mage.idle,
    actionSheets: CHARACTER_ACTION_SHEETS.mage,
    frames: modularFrames256,
    lore: 'Summons cosmic void anomalies from ancient forbidden codices hidden beneath castle libraries.',
    ability: 'Cosmic Shift: Cooldown on Quantum Dash power reduced by 25%.',
    cardColor: 'from-fuchsia-950 via-purple-950 to-slate-950',
    borderClass: 'border-fuchsia-400 shadow-fuchsia-500/30',
    holoGradient: 'linear-gradient(135deg, rgba(217,70,239,0.4) 0%, rgba(147,51,234,0.3) 100%)',
    cardNumber: '13/19',
    packNumber: 2,
    theme: { auraColor: '#d946ef', badgeBg: 'bg-fuchsia-950/80 border-fuchsia-400/60' }
  },
  {
    id: 'elitearcher',
    name: 'Elite Archer',
    title: 'Shadow Marksman',
    rarity: 'epic',
    category: 'skin',
    price: 310,
    icon: '🎯',
    imageSrc: '/assets/characters/elitearcher.png',
    portraitPath: '/assets/characters/elitearcher.png',
    spritePath: '/assets/characters/elitearcher.png',
    sheetImg: CHARACTER_ACTION_SHEETS.elitearcher.idle,
    actionSheets: CHARACTER_ACTION_SHEETS.elitearcher,
    frames: modularFrames256,
    lore: 'An elite composite bow specialist capable of piercing enchanted barriers and storm wind.',
    ability: 'Wind Walker: Arrow and bullet spread reduced by 20% during full sprint.',
    cardColor: 'from-teal-950 via-emerald-950 to-slate-950',
    borderClass: 'border-teal-400 shadow-teal-500/30',
    holoGradient: 'linear-gradient(135deg, rgba(45,212,191,0.4) 0%, rgba(13,148,136,0.3) 100%)',
    cardNumber: '14/19',
    packNumber: 2,
    theme: { auraColor: '#2dd4bf', badgeBg: 'bg-teal-950/80 border-teal-400/60' }
  },

  // --- LEGENDARY (3) ---
  {
    id: 'knight_hero',
    name: 'Knight Hero',
    title: 'Champion of the Realm',
    rarity: 'legendary',
    category: 'skin',
    price: 450,
    icon: '👑',
    imageSrc: '/assets/characters/knight_hero.png',
    portraitPath: '/assets/characters/knight_hero.png',
    spritePath: '/assets/characters/knight_hero.png',
    sheetImg: CHARACTER_ACTION_SHEETS.hero.idle,
    actionSheets: CHARACTER_ACTION_SHEETS.hero,
    frames: modularFrames256,
    lore: 'The chosen champion of the realm, decked in royal sapphire heraldry and gleaming full plate.',
    ability: 'Crown of Glory: Grants +20 initial max shield capacity in every tournament match.',
    cardColor: 'from-amber-950 via-yellow-900 to-slate-950',
    borderClass: 'border-amber-400 shadow-amber-500/40 ring-1 ring-amber-300',
    holoGradient: 'linear-gradient(135deg, rgba(245,158,11,0.5) 0%, rgba(251,191,36,0.4) 50%, rgba(217,119,6,0.3) 100%)',
    cardNumber: '15/19',
    packNumber: 3,
    theme: { auraColor: '#f59e0b', badgeBg: 'bg-amber-950/90 border-amber-400/80' }
  },
  {
    id: 'dragon_slayer',
    name: 'Dragon Slayer',
    title: 'Wyrm Cleaver',
    rarity: 'legendary',
    category: 'skin',
    price: 480,
    icon: '🐉',
    imageSrc: '/assets/characters/dragon_slayer.png',
    portraitPath: '/assets/characters/dragon_slayer.png',
    spritePath: '/assets/characters/dragon_slayer.png',
    sheetImg: CHARACTER_ACTION_SHEETS.fireorc.idle,
    actionSheets: CHARACTER_ACTION_SHEETS.fireorc,
    frames: modularFrames256,
    lore: 'Clad in heat-forged crimson scales carved from an ancient fire drake, wielding molten blades.',
    ability: 'Dragon Blood: Weapon attacks ignite supply crates and enemy ramps for explosive damage.',
    cardColor: 'from-red-950 via-orange-950 to-slate-950',
    borderClass: 'border-orange-400 shadow-orange-500/40 ring-1 ring-orange-300',
    holoGradient: 'linear-gradient(135deg, rgba(249,115,22,0.5) 0%, rgba(239,68,68,0.4) 100%)',
    cardNumber: '16/19',
    packNumber: 3,
    theme: { auraColor: '#f97316', badgeBg: 'bg-orange-950/90 border-orange-400/80' }
  },
  {
    id: 'shadow_assassin',
    name: 'Shadow Assassin',
    title: 'Master of the Eclipse',
    rarity: 'legendary',
    category: 'skin',
    price: 500,
    icon: '🥷',
    imageSrc: '/assets/characters/shadow_assassin.png',
    portraitPath: '/assets/characters/shadow_assassin.png',
    spritePath: '/assets/characters/shadow_assassin.png',
    sheetImg: CHARACTER_ACTION_SHEETS.shadowgoblin.idle,
    actionSheets: CHARACTER_ACTION_SHEETS.shadowgoblin,
    frames: modularFrames256,
    lore: 'A phantom operative of the shadow guild who leaves only whisper-thin smoke in their wake.',
    ability: 'Shadow Blink: Movement speed surged by 15% immediately following weapon discharge.',
    cardColor: 'from-violet-950 via-purple-950 to-slate-950',
    borderClass: 'border-violet-400 shadow-violet-500/40 ring-1 ring-violet-300',
    holoGradient: 'linear-gradient(135deg, rgba(167,139,250,0.5) 0%, rgba(139,92,246,0.4) 100%)',
    cardNumber: '17/19',
    packNumber: 3,
    theme: { auraColor: '#8b5cf6', badgeBg: 'bg-violet-950/90 border-violet-400/80' }
  },

  // --- MYTHIC (2 - 0.5% DROP RATE) ---
  {
    id: 'slime_king',
    name: 'Slime King',
    title: 'Sovereign of the Ooze',
    rarity: 'mythic',
    category: 'skin',
    price: 900,
    icon: '👑🟢',
    imageSrc: '/assets/characters/slime_king.png',
    portraitPath: '/assets/characters/slime_king.png',
    spritePath: '/assets/characters/slime_king.png',
    sheetImg: CHARACTER_ACTION_SHEETS.slimeking.idle,
    actionSheets: CHARACTER_ACTION_SHEETS.slimeking,
    frames: modularFrames256,
    lore: 'The colossal gilded ruler of all dungeon slimes, crowned in gold and radiating glowing royal gelatin.',
    ability: 'Royal Absorption: Absorbs 50% of the first shot received and turns it into building bricks.',
    cardColor: 'from-emerald-950 via-green-900 to-slate-950',
    borderClass: 'border-emerald-300 shadow-[0_0_30px_rgba(52,211,153,0.6)] ring-2 ring-emerald-300 animate-pulse',
    holoGradient: 'linear-gradient(135deg, rgba(52,211,153,0.7) 0%, rgba(251,191,36,0.6) 50%, rgba(16,185,129,0.5) 100%)',
    cardNumber: '18/19',
    packNumber: 4,
    theme: { auraColor: '#34d399', badgeBg: 'bg-emerald-950 border-emerald-300 ring-1 ring-emerald-400' }
  },
  {
    id: 'overlord',
    name: 'Overlord',
    title: 'Dungeon Cataclysm',
    rarity: 'mythic',
    category: 'skin',
    price: 1000,
    icon: '👹👑',
    imageSrc: '/assets/characters/overlord.png',
    portraitPath: '/assets/characters/overlord.png',
    spritePath: '/assets/characters/overlord.png',
    sheetImg: CHARACTER_ACTION_SHEETS.boss.idle,
    actionSheets: CHARACTER_ACTION_SHEETS.boss,
    frames: modularFrames256,
    lore: 'The primordial titan of the dungeon catacombs, clad in demon plate and commanding void flames.',
    ability: 'Cataclysmic Might: Alternate fire recharge rate doubled; storm eye radiates around position.',
    cardColor: 'from-rose-950 via-purple-950 to-slate-950',
    borderClass: 'border-rose-400 shadow-[0_0_35px_rgba(244,63,94,0.7)] ring-2 ring-rose-400 animate-pulse',
    holoGradient: 'linear-gradient(135deg, rgba(244,63,94,0.7) 0%, rgba(168,85,247,0.6) 50%, rgba(251,191,36,0.5) 100%)',
    cardNumber: '19/19',
    packNumber: 4,
    theme: { auraColor: '#f43f5e', badgeBg: 'bg-rose-950 border-rose-400 ring-1 ring-rose-400' }
  }
];

// Ensure fallback portraitPath and spritePath
ALL_FANTASY_SKINS.forEach(s => {
  s.portraitPath = s.portraitPath || `/assets/characters/${s.id}.png`;
  s.spritePath = s.spritePath || `/assets/characters/${s.id}.png`;
  s.avatarImg = s.avatarImg || s.portraitPath;
});

// Helper aliases to seamlessly resolve older skin names or short IDs
export const FANTASY_SKIN_ALIASES: Record<string, string> = {
  // Direct name aliases
  hero: 'knight_hero',
  archer: 'archer_hero',
  skeleton: 'skeleton_warrior',
  slimeking: 'slime_king',
  boss: 'overlord',
  bloodskeleton: 'cultist',
  shadowgoblin: 'rogue',
  fireorc: 'dragon_slayer',
  orc: 'berserker',
  villager: 'discoverer',
  mage: 'white_mage',
  berserker: 'orc',
  archangel: 'knight_hero',

  // Legacy student avatar aliases
  classic_chemist: 'cultist',
  quantum_physicist: 'knight_hero',
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
  wildlife_ecologist: 'rogue'
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
