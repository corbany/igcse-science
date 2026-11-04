import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Coins, 
  Check, 
  Lock, 
  X, 
  ArrowRight, 
  Layers, 
  ShieldCheck, 
  Package, 
  Flame, 
  Zap, 
  Award, 
  RotateCcw, 
  HelpCircle,
  Eye,
  ArrowUpRight,
  Crosshair,
  Radio,
  Compass
} from 'lucide-react';
import { UserProfile } from '../types';
import { 
  ItemRarity, 
  UserGameProfile, 
  subscribeToGameProfile,
  equipItem,
  buyShopItem,
  SHOP_ITEMS,
  ShopItem,
  BattleEventState
} from '../services/firebaseGameService';
import { db } from '../services/firebaseAuth';
import { doc, setDoc, updateDoc, increment, arrayUnion, runTransaction } from 'firebase/firestore';

// ============================================================================
// SKIN CARDS REGISTRY & POKÉMON CARD CATALOG (18 FANTASY DUNGEON SKINS)
// ============================================================================

import { 
  ALL_FANTASY_SKINS, 
  FantasySkinDefinition, 
  FANTASY_SKIN_ALIASES, 
  getFantasySkin 
} from '../data/fantasySkinsData';

export type SkinCard = FantasySkinDefinition;
export const ALL_SKIN_CARDS: SkinCard[] = ALL_FANTASY_SKINS;

export type BoosterReward = 
  | { type: 'skin'; item: SkinCard }
  | { type: 'weapon'; item: ShopItem };

// ============================================================================
// BOOSTER PACK CONFIGURATIONS & DROP PROBABILITIES (0.5% MYTHIC DROP RATE)
// ============================================================================

export interface BoosterPackConfig {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  badge: string;
  description: string;
  foilColor: string;
  packBorder: string;
  accentGlow: string;
  packNumber?: 1 | 2 | 3 | 4;
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
    name: 'Pack 1: Dungeon Catacombs',
    subtitle: 'Tier I Dungeon Champions & Science Weapons',
    price: 90,
    badge: 'Pack 1',
    packNumber: 1,
    description: 'Delve into the damp underground crypts for Common and Rare dungeon characters and laboratory scientific weapons.',
    foilColor: 'from-stone-800 via-neutral-900 to-slate-950',
    packBorder: 'border-stone-500/70',
    accentGlow: 'shadow-stone-500/30',
    odds: { common: 50, rare: 35, epic: 11, legendary: 3.5, mythic: 0.5 }
  },
  {
    id: 'pack_2_citadel',
    name: 'Pack 2: Arcane Citadel',
    subtitle: 'Tier II Arcane Spellcasters & Science Weapons',
    price: 120,
    badge: 'Pack 2',
    packNumber: 2,
    description: 'Storm the arcane towers of the high citadel for Rare skirmishers, Epic spellcasters, and high-energy weapons.',
    foilColor: 'from-indigo-700 via-purple-900 to-slate-950',
    packBorder: 'border-indigo-400/70',
    accentGlow: 'shadow-indigo-500/30',
    odds: { common: 40, rare: 42, epic: 14, legendary: 3.5, mythic: 0.5 }
  },
  {
    id: 'pack_3_legends',
    name: 'Pack 3: Legends & Knights',
    subtitle: 'Tier III Armored Legends & Advanced Arsenals',
    price: 150,
    badge: 'Pack 3',
    packNumber: 3,
    description: 'Summon legendary armored heroes and top-tier scientific weapons forged in epic battle royale combat.',
    foilColor: 'from-amber-600 via-yellow-700 to-slate-950',
    packBorder: 'border-amber-400/70',
    accentGlow: 'shadow-amber-500/30',
    odds: { common: 25, rare: 40, epic: 24, legendary: 10.5, mythic: 0.5 }
  },
  {
    id: 'super_gold_pack',
    name: 'Super Gold Dungeon Pack',
    subtitle: 'All 19 Fantasy Champions & 10 Science Weapons',
    price: 250,
    badge: 'High-Tier Booster',
    description: 'Premium golden foil booster containing all 19 fantasy characters and all 10 science weapons with boosted Epic & Legendary odds!',
    foilColor: 'from-amber-400 via-yellow-600 to-slate-950',
    packBorder: 'border-yellow-300',
    accentGlow: 'shadow-yellow-500/50',
    odds: { common: 20, rare: 40, epic: 28, legendary: 11.5, mythic: 0.5 }
  }
];

// ============================================================================
// ARCADE SOUND SYNTHESIZER
// ============================================================================

class PackSoundFX {
  private ctx: AudioContext | null = null;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  playShake() {
    this.initCtx();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(80, t);
    osc.frequency.linearRampToValueAtTime(140, t + 0.12);
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
    osc.start(t);
    osc.stop(t + 0.12);
  }

  playRip() {
    this.initCtx();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(70, t + 0.3);
    gain.gain.setValueAtTime(0.28, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
    osc.start(t);
    osc.stop(t + 0.3);
  }

  playReveal(rarity: ItemRarity) {
    this.initCtx();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const notes = rarity === 'mythic' 
      ? [523.25, 659.25, 783.99, 1046.50, 1318.51] // C E G C E
      : rarity === 'legendary' 
      ? [440, 554.37, 659.25, 880] // A C# E A
      : [392, 493.88, 587.33]; // G B D

    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.type = rarity === 'mythic' ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.1);
      gain.gain.setValueAtTime(0.25, t + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, t + idx * 0.1 + 0.45);
      osc.start(t + idx * 0.1);
      osc.stop(t + idx * 0.1 + 0.45);
    });
  }

  playEquip() {
    this.initCtx();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.15);
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
    osc.start(t);
    osc.stop(t + 0.15);
  }
}

const packSfx = new PackSoundFX();

// ============================================================================
// MAIN AVATAR POKÉMON PACK-OPENING SHOP COMPONENT
// ============================================================================

interface AvatarShopProps {
  user: UserProfile;
  initialTab?: 'shop' | 'collection' | 'armory';
  battleState?: BattleEventState | null;
  onClose?: () => void;
  onBack?: () => void;
  onNavigateToArena?: () => void;
}

export const AvatarShop: React.FC<AvatarShopProps> = ({
  user,
  initialTab,
  battleState,
  onClose,
  onBack,
  onNavigateToArena
}) => {
  const handleClose = onBack || onClose;
  const [gameProfile, setGameProfile] = useState<UserGameProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'shop' | 'collection' | 'armory'>(initialTab || 'shop');
  const [weaponFilter, setWeaponFilter] = useState<string>('all');

  // Synchronize with parent initialTab if changed
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Pack Opening Animation Ceremony State
  const [openingPack, setOpeningPack] = useState<BoosterPackConfig | null>(null);
  const [animationPhase, setAnimationPhase] = useState<'shaking' | 'tearing' | 'reveal' | null>(null);
  const [pulledReward, setPulledReward] = useState<BoosterReward | null>(null);
  const [isDuplicate, setIsDuplicate] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const ceremonyTimers = useRef<{ interval?: any; timeouts: any[] }>({ timeouts: [] });

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (ceremonyTimers.current.interval) clearInterval(ceremonyTimers.current.interval);
      ceremonyTimers.current.timeouts.forEach(t => clearTimeout(t));
    };
  }, []);

  // Subscribe to real-time student game profile
  useEffect(() => {
    if (!user?.id) return;
    const unsub = subscribeToGameProfile(user.id, (p) => {
      setGameProfile(p);
    });
    return () => unsub();
  }, [user?.id]);

  const isInstructor = user?.role === 'instructor' || gameProfile?.role === 'instructor';
  const rawGold = gameProfile?.gold;
  const currentGold = isInstructor ? 999999 : (typeof rawGold === 'number' && !isNaN(rawGold) ? Math.max(0, rawGold) : 100);
  const unlockedSkins: string[] = isInstructor 
    ? ALL_SKIN_CARDS.map(c => c.id) 
    : (gameProfile?.unlockedSkins ?? ['cultist']);
  const equippedSkin = gameProfile?.equippedSkin || gameProfile?.avatar || 'cultist';
  const equippedWeaponId = gameProfile?.equippedWeapon || 'bunsen_burner';
  const inventory = gameProfile?.inventory || ['cultist', 'bunsen_burner'];

  const ALL_WEAPON_ITEMS: ShopItem[] = useMemo(() => {
    return SHOP_ITEMS.filter(i => i.category === 'weapon');
  }, []);

  // Helper: Weighted Probability RNG Drop Selection (Both Fantasy Skins and Scientific Weapons)
  const selectRandomReward = (
    pack: BoosterPackConfig,
    unlocked: string[],
    inv: string[]
  ): BoosterReward => {
    const roll = Math.random() * 100;
    let chosenRarity: ItemRarity = 'common';

    if (roll < pack.odds.mythic) {
      chosenRarity = 'mythic';
    } else if (roll < pack.odds.mythic + pack.odds.legendary) {
      chosenRarity = 'legendary';
    } else if (roll < pack.odds.mythic + pack.odds.legendary + pack.odds.epic) {
      chosenRarity = 'epic';
    } else if (roll < pack.odds.mythic + pack.odds.legendary + pack.odds.epic + pack.odds.rare) {
      chosenRarity = 'rare';
    } else {
      chosenRarity = 'common';
    }

    const matchingSkins = ALL_SKIN_CARDS.filter(c => c.rarity === chosenRarity);
    const matchingWeapons = ALL_WEAPON_ITEMS.filter(w => w.rarity === chosenRarity);

    // Identify unowned items to increase excitement of opening packs
    const unownedSkins = matchingSkins.filter(s => !unlocked.includes(s.id));
    const unownedWeapons = matchingWeapons.filter(w => !inv.includes(w.id));
    const hasUnowned = unownedSkins.length > 0 || unownedWeapons.length > 0;
    const favorUnowned = hasUnowned && Math.random() < 0.70;

    const candidateSkins = (favorUnowned && unownedSkins.length > 0) ? unownedSkins : matchingSkins;
    const candidateWeapons = (favorUnowned && unownedWeapons.length > 0) ? unownedWeapons : matchingWeapons;

    const chooseWeapon = candidateWeapons.length > 0 && (candidateSkins.length === 0 || Math.random() < 0.50);

    if (chooseWeapon) {
      const weapon = candidateWeapons[Math.floor(Math.random() * candidateWeapons.length)];
      return { type: 'weapon', item: weapon };
    } else if (candidateSkins.length > 0) {
      const skin = candidateSkins[Math.floor(Math.random() * candidateSkins.length)];
      return { type: 'skin', item: skin };
    } else {
      return { type: 'skin', item: ALL_SKIN_CARDS[0] };
    }
  };

  // Trigger Pack Opening Ceremony
  const handleOpenPack = (pack: BoosterPackConfig) => {
    if (!user?.id || isProcessing) return;

    // Strict validation: Students CANNOT open packs if gold is insufficient or negative
    if (!isInstructor && (currentGold < pack.price || currentGold <= 0)) {
      setFeedback(`❌ Insufficient Gold! You need ${pack.price - Math.max(0, currentGold)} more Gold. Revise Cambridge slide decks to earn more!`);
      return;
    }

    // Clear previous timers if any
    if (ceremonyTimers.current.interval) clearInterval(ceremonyTimers.current.interval);
    ceremonyTimers.current.timeouts.forEach(t => clearTimeout(t));
    ceremonyTimers.current.timeouts = [];

    // Optimistically lock and deduct gold immediately in local state to prevent any rapid multi-click exploits
    setIsProcessing(true);
    setOpeningPack(pack);
    setFeedback(null);
    setAnimationPhase('shaking');

    if (!isInstructor) {
      setGameProfile(prev => prev ? { ...prev, gold: Math.max(0, currentGold - pack.price) } : null);
    }

    // 1. Pick card (skin or weapon) and check duplicate
    const droppedReward = selectRandomReward(pack, unlockedSkins, inventory);
    const duplicate = droppedReward.type === 'skin'
      ? unlockedSkins.includes(droppedReward.item.id)
      : (inventory.includes(droppedReward.item.id) || droppedReward.item.id === 'bunsen_burner');

    setPulledReward(droppedReward);
    setIsDuplicate(duplicate);

    // 2. Deduct Gold & Update Firestore via transaction ensuring gold NEVER drops below 0
    try {
      const userDocRef = doc(db, 'users', user.id);
      if (!isInstructor) {
        runTransaction(db, async (transaction) => {
          const userSnap = await transaction.get(userDocRef);
          if (!userSnap.exists()) return;
          const serverGold = Math.max(0, Number(userSnap.data()?.gold ?? 0));
          if (serverGold < pack.price) {
            throw new Error('Insufficient gold');
          }
          const finalGold = Math.max(0, serverGold - pack.price);
          const updatePayload = duplicate
            ? {
                gold: finalGold,
                wood: increment(50),
                metal: increment(20)
              }
            : droppedReward.type === 'skin'
              ? {
                  gold: finalGold,
                  unlockedSkins: arrayUnion(droppedReward.item.id),
                  inventory: arrayUnion(droppedReward.item.id)
                }
              : {
                  gold: finalGold,
                  inventory: arrayUnion(droppedReward.item.id)
                };
          transaction.set(userDocRef, updatePayload, { merge: true });
        }).catch((err) => {
          console.warn('Background pack transaction update error:', err);
        });
      } else {
        const updatePayload = duplicate
          ? {
              gold: 999999,
              wood: increment(50),
              metal: increment(20)
            }
          : droppedReward.type === 'skin'
            ? {
                gold: 999999,
                unlockedSkins: arrayUnion(droppedReward.item.id),
                inventory: arrayUnion(droppedReward.item.id)
              }
            : {
                gold: 999999,
                inventory: arrayUnion(droppedReward.item.id)
              };
        setDoc(userDocRef, updatePayload, { merge: true }).catch((err) => {
          console.warn('Background pack update to Firestore:', err);
        });
      }
    } catch (err) {
      console.warn('Error queuing pack update:', err);
    }

    // 3. Orchestrate 3-Second Opening Ceremony Animation with audio & fail-safes
    try {
      packSfx.playShake();
    } catch (e) {}

    const shakeInterval = setInterval(() => {
      try {
        packSfx.playShake();
      } catch (e) {}
    }, 350);
    ceremonyTimers.current.interval = shakeInterval;

    // Phase 2: Tearing Open & Light Beams (1.1s)
    const t1 = setTimeout(() => {
      clearInterval(shakeInterval);
      setAnimationPhase('tearing');
      try {
        packSfx.playRip();
      } catch (e) {}
    }, 1100);
    ceremonyTimers.current.timeouts.push(t1);

    // Phase 3: Card Reveal & 3D Flip (2.1s)
    const t2 = setTimeout(() => {
      clearInterval(shakeInterval);
      setAnimationPhase('reveal');
      try {
        packSfx.playReveal(droppedReward.item.rarity);
      } catch (e) {}
      setIsProcessing(false);
    }, 2100);
    ceremonyTimers.current.timeouts.push(t2);

    // Fail-safe timeout: Force transition to reveal no matter what within 2.5s
    const tFailSafe = setTimeout(() => {
      clearInterval(shakeInterval);
      setAnimationPhase('reveal');
      setIsProcessing(false);
    }, 2500);
    ceremonyTimers.current.timeouts.push(tFailSafe);
  };

  // Close ceremony modal
  const handleDismissCeremony = () => {
    if (ceremonyTimers.current.interval) clearInterval(ceremonyTimers.current.interval);
    ceremonyTimers.current.timeouts.forEach(t => clearTimeout(t));
    ceremonyTimers.current.timeouts = [];
    setOpeningPack(null);
    setAnimationPhase(null);
    setPulledReward(null);
    setIsProcessing(false);
  };

  // Skip animation directly to card reveal
  const handleSkipToReveal = () => {
    if (ceremonyTimers.current.interval) clearInterval(ceremonyTimers.current.interval);
    ceremonyTimers.current.timeouts.forEach(t => clearTimeout(t));
    ceremonyTimers.current.timeouts = [];
    setAnimationPhase('reveal');
    setIsProcessing(false);
    if (pulledReward) {
      try {
        packSfx.playReveal(pulledReward.item.rarity);
      } catch (e) {}
    }
  };

  // Equip Skin directly from Ceremony or Collection
  const handleEquipSkin = async (skinId: string) => {
    if (!user?.id) return;
    try {
      const userDocRef = doc(db, 'users', user.id);
      await setDoc(userDocRef, {
        equippedSkin: skinId,
        avatar: skinId
      }, { merge: true });
      await equipItem(user.id, 'skin', skinId);
      setFeedback(`✅ Equipped ${ALL_SKIN_CARDS.find(c => c.id === skinId)?.name || 'Skin'} successfully!`);
    } catch (err) {
      console.error('Error equipping skin:', err);
      setFeedback('Failed to equip skin. Please try again.');
    }
  };

  // Equip Weapon directly from Ceremony or Arsenal
  const handleEquipWeapon = async (weaponId: string) => {
    if (!user?.id) return;
    try {
      packSfx.playEquip();
    } catch (e) {}
    try {
      await equipItem(user.id, 'weapon', weaponId);
      const weaponObj = ALL_WEAPON_ITEMS.find(w => w.id === weaponId);
      setFeedback(`⚡ Equipped ${weaponObj?.name || 'Weapon'} successfully!`);
    } catch (err) {
      console.error('Error equipping weapon:', err);
      setFeedback('Failed to equip weapon. Please try again.');
    }
  };

  const getWeaponCardStyle = (rarity: ItemRarity) => {
    switch (rarity) {
      case 'mythic':
        return { bg: 'from-rose-950 via-purple-950 to-slate-950', border: 'border-rose-400' };
      case 'legendary':
        return { bg: 'from-amber-950 via-orange-950 to-slate-950', border: 'border-amber-400' };
      case 'epic':
        return { bg: 'from-purple-950 via-indigo-950 to-slate-950', border: 'border-purple-400' };
      case 'rare':
        return { bg: 'from-cyan-950 via-sky-950 to-slate-950', border: 'border-cyan-400' };
      default:
        return { bg: 'from-slate-900 via-slate-950 to-slate-950', border: 'border-slate-700' };
    }
  };

  const getRarityBadgeStyle = (rarity: ItemRarity) => {
    switch (rarity) {
      case 'mythic':
        return 'bg-gradient-to-r from-rose-500 via-amber-400 to-purple-500 text-white font-black shadow-lg shadow-rose-500/30 animate-pulse';
      case 'legendary':
        return 'bg-amber-500/20 border-amber-400/50 text-amber-300 font-black shadow-amber-500/20';
      case 'epic':
        return 'bg-purple-500/20 border-purple-400/50 text-purple-300 font-bold shadow-purple-500/20';
      case 'rare':
        return 'bg-blue-500/20 border-blue-400/50 text-blue-300 font-bold shadow-blue-500/20';
      default:
        return 'bg-slate-700/50 border-slate-600 text-slate-300 font-medium';
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 select-none font-sans">
      
      {/* =========================================================================
          TOP STORE BANNER & GOLD PILL
          ========================================================================= */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-500/10 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 relative z-10">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 font-black text-2xl shadow-lg shadow-amber-500/25">
                🎴
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Revision Royale Booster Packs
                  </h1>
                  <span className="text-[10px] sm:text-xs font-black px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-purple-500/20 text-amber-300 border border-amber-500/30">
                    Trading Cards
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                  Tear open mystery card packs, unlock rare science avatars, and customize your Battle Royale character!
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            {/* Student Gold Balance Pill */}
            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 shadow-lg">
              <Coins className="w-5 h-5 text-amber-400 animate-bounce" />
              <div>
                <span className="text-[9px] text-amber-400/80 font-black uppercase tracking-wider block">Your Gold</span>
                <span className="font-mono font-black text-base sm:text-lg">{currentGold}</span>
              </div>
            </div>

            {onNavigateToArena && (isInstructor || battleState?.status === 'IN_PROGRESS') ? (
              <button
                onClick={onNavigateToArena}
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-emerald-500/20 transition active:scale-95 cursor-pointer animate-pulse"
              >
                <span>Enter Battle Arena</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : !isInstructor ? (
              <div 
                className="px-3.5 py-2 rounded-2xl bg-slate-950/70 border border-slate-800 text-slate-400 text-xs font-semibold flex items-center gap-1.5"
                title="The Battle Royale is locked until your instructor launches the tournament match"
              >
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Royale: Waiting for Teacher</span>
                <span className="sm:hidden">Royale Locked</span>
              </div>
            ) : null}

            {handleClose && (
              <button
                onClick={handleClose}
                className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
                title="Back to Study"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Feedback alert toast */}
        {feedback && (
          <div className="mt-4 p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center justify-between animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{feedback}</span>
            </div>
            <button onClick={() => setFeedback(null)} className="opacity-70 hover:opacity-100 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* =========================================================================
          NAVIGATION TABS (BOOSTER PACKS vs MY COLLECTION & LOADOUT)
          ========================================================================= */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('shop')}
          className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'shop'
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Booster Pack Shop</span>
        </button>

        <button
          onClick={() => setActiveTab('collection')}
          className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'collection'
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>My Collection ({unlockedSkins.length} / {ALL_SKIN_CARDS.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('armory')}
          className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'armory'
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          <Crosshair className="w-4 h-4 text-rose-400" />
          <span>Arsenal & Weapons (10 Ranked)</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: BOOSTER PACK SHOP (MYSTERY PACKS ONLY)
          ========================================================================= */}
      {activeTab === 'shop' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {BOOSTER_PACKS.map((pack) => {
              const canAfford = currentGold >= pack.price && currentGold > 0;

              return (
                <div
                  key={pack.id}
                  className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden group hover:border-amber-500/40 transition-all duration-300"
                >
                  {/* Subtle Background Glow */}
                  <div className={`absolute -right-16 -top-16 w-56 h-56 rounded-full blur-3xl opacity-20 pointer-events-none ${pack.accentGlow}`} />

                  <div>
                    {/* Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {pack.badge}
                      </span>
                      <div className="flex items-center gap-1.5 text-amber-400 font-mono font-black text-lg">
                        <Coins className="w-5 h-5 text-amber-400" />
                        <span>{pack.price} Gold</span>
                      </div>
                    </div>

                    {/* 3D POKÉMON PACK FOIL ARTWORK */}
                    <div className="relative my-4 flex items-center justify-center py-6">
                      <motion.div
                        whileHover={{ scale: 1.05, rotateY: 8 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        className={`w-48 h-64 rounded-2xl p-4 bg-gradient-to-br ${pack.foilColor} border-2 ${pack.packBorder} shadow-2xl relative flex flex-col justify-between items-center text-center cursor-pointer`}
                      >
                        {/* Metallic foil reflection sweep */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/15 to-transparent rounded-2xl pointer-events-none" />

                        {/* Top Foil Crimping */}
                        <div className="w-full flex items-center justify-between border-b border-white/20 pb-1 text-[8px] font-mono tracking-widest text-white/70">
                          <span>CAMBRIDGE 0653</span>
                          <span>BOOSTER</span>
                        </div>

                        {/* Center Booster Logo Emblem */}
                        <div className="space-y-1">
                          <div className="w-16 h-16 mx-auto rounded-full bg-slate-950/80 border-2 border-white/40 flex items-center justify-center text-3xl shadow-inner">
                            ⚛️
                          </div>
                          <h4 className="text-sm font-black text-white uppercase tracking-tight drop-shadow-md">
                            {pack.id === 'super_gold_pack' ? 'SUPER GOLD' : 'STANDARD'}
                          </h4>
                          <span className="text-[9px] font-bold text-amber-300 uppercase tracking-wider block">
                            1 GUARANTEED CARD
                          </span>
                        </div>

                        {/* Bottom Barcode / Foil Seal */}
                        <div className="w-full border-t border-white/20 pt-1 flex items-center justify-between text-[7px] font-mono text-white/50">
                          <span>OFFICIAL SET</span>
                          <span>|||||||||||||</span>
                        </div>
                      </motion.div>
                    </div>

                    {/* Pack Titles & Description */}
                    <div className="text-center space-y-1">
                      <h3 className="text-xl font-black text-white">{pack.name}</h3>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto">{pack.description}</p>
                    </div>

                    {/* Drop Rates Breakdown */}
                    <div className="mt-5 p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-[11px] font-mono">
                      <span className="text-[10px] font-black uppercase text-slate-400 block mb-1.5 text-center">
                        Drop Rate Probabilities
                      </span>
                      <div className="grid grid-cols-5 gap-1 text-center font-bold">
                        <div className="p-1 rounded bg-slate-800/60 text-slate-300">
                          <span className="block text-[9px] text-slate-400">Common</span>
                          <span>{pack.odds.common}%</span>
                        </div>
                        <div className="p-1 rounded bg-blue-950/40 text-blue-300 border border-blue-500/20">
                          <span className="block text-[9px] text-blue-400">Rare</span>
                          <span>{pack.odds.rare}%</span>
                        </div>
                        <div className="p-1 rounded bg-purple-950/40 text-purple-300 border border-purple-500/20">
                          <span className="block text-[9px] text-purple-400">Epic</span>
                          <span>{pack.odds.epic}%</span>
                        </div>
                        <div className="p-1 rounded bg-amber-950/40 text-amber-300 border border-amber-500/20">
                          <span className="block text-[9px] text-amber-400">Legend</span>
                          <span>{pack.odds.legendary}%</span>
                        </div>
                        <div className="p-1 rounded bg-rose-950/50 text-rose-300 border border-rose-500/30">
                          <span className="block text-[9px] text-rose-400 font-black">Mythic</span>
                          <span className="font-black text-rose-400">{pack.odds.mythic}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Open Pack Button */}
                  <div className="mt-6 pt-4 border-t border-slate-800">
                    <button
                      onClick={() => handleOpenPack(pack)}
                      disabled={!canAfford || isProcessing}
                      className={`w-full py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider transition active:scale-95 flex items-center justify-center gap-2 shadow-xl ${
                        canAfford
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-amber-500/25 cursor-pointer'
                          : 'bg-slate-800/80 text-slate-500 border border-slate-700/80 cursor-not-allowed'
                      }`}
                    >
                      {canAfford ? (
                        <>
                          <Sparkles className="w-4 h-4 text-slate-950" />
                          <span>Tear Open Pack ({pack.price} Gold)</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4 text-slate-500" />
                          <span>Requires {pack.price} Gold</span>
                        </>
                      )}
                    </button>
                    <span className="text-[10px] text-slate-400 text-center block mt-2">
                      ♻️ Duplicate skins auto-convert into +50 Wood 🪵 & +20 Metal ⚙️
                    </span>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: MY COLLECTION & LOADOUT (POKÉMON CARD BINDER SHOWCASE)
          ========================================================================= */}
      {activeTab === 'collection' && (
        <div className="space-y-6">
          
          {/* Collection Progress Banner */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-white">My Science Card Binder</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Equip any unlocked avatar skin to display your unique 2D sprite model and combat aura in the Revision Royale arena!
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-44 h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-300"
                  style={{ width: `${Math.round((unlockedSkins.length / ALL_SKIN_CARDS.length) * 100)}%` }}
                />
              </div>
              <span className="font-mono font-black text-sm text-emerald-400">
                {Math.round((unlockedSkins.length / ALL_SKIN_CARDS.length) * 100)}% Complete
              </span>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {ALL_SKIN_CARDS.map((card) => {
              const isUnlocked = isInstructor || 
                unlockedSkins.includes(card.id) || 
                (FANTASY_SKIN_ALIASES[equippedSkin] === card.id) ||
                Object.entries(FANTASY_SKIN_ALIASES).some(([oldId, newId]) => newId === card.id && unlockedSkins.includes(oldId));

              const isEquippedActive = equippedSkin === card.id || FANTASY_SKIN_ALIASES[equippedSkin] === card.id;

              if (isUnlocked) {
                // UNLOCKED SHINY POKÉMON TRADING CARD
                return (
                  <motion.div
                    key={card.id}
                    whileHover={{ y: -6, scale: 1.02 }}
                    className={`relative rounded-3xl p-4 bg-gradient-to-b ${card.cardColor} border-2 ${card.borderClass} shadow-2xl flex flex-col justify-between overflow-hidden group`}
                  >
                    {/* Holographic light sheen reflection */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                    <div>
                      {/* Card Header: Subject, Rarity, & Number */}
                      <div className="flex items-center justify-between text-[10px] font-mono border-b border-white/10 pb-2">
                        <span className="px-2 py-0.5 rounded-full bg-white/10 text-white font-black uppercase">
                          {card.subject || card.title || 'FANTASY'}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md uppercase ${getRarityBadgeStyle(card.rarity)}`}>
                          {card.rarity}
                        </span>
                        <span className="text-white/60 font-bold">{card.cardNumber}</span>
                      </div>

                      {/* Character Illustration Frame */}
                      <div className="relative my-3 rounded-2xl bg-slate-950/80 border border-white/20 p-3 flex items-center justify-center overflow-hidden shadow-inner h-32">
                        <img 
                          src={card.portraitPath || card.spritePath || `/assets/characters/${card.id}.png`} 
                          alt={card.name} 
                          className="w-24 h-24 object-contain pixelated drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)] group-hover:scale-110 transition-transform" 
                          style={{ imageRendering: 'pixelated' }}
                          onError={(e) => {
                            const fallback = card.spritePath || `/assets/characters/${card.id}.png`;
                            if (e.currentTarget.src !== fallback && !e.currentTarget.src.endsWith(fallback)) {
                              e.currentTarget.src = fallback;
                            }
                          }}
                        />
                      </div>

                      {/* Character Identity */}
                      <div className="text-center space-y-0.5">
                        <h3 className="text-base font-black text-white tracking-tight">{card.name}</h3>
                        <span className="text-[11px] font-bold text-amber-400 block">{card.title}</span>
                      </div>

                      {/* Lore Text */}
                      <p className="text-[11px] text-slate-300 mt-2.5 leading-relaxed bg-slate-950/60 p-2 rounded-xl border border-white/5">
                        {card.lore}
                      </p>

                      {/* Ability Badge */}
                      <div className="mt-2.5 p-2 rounded-xl bg-slate-950/80 border border-amber-500/20 text-[10px] font-bold text-emerald-300 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>{card.ability}</span>
                      </div>
                    </div>

                    {/* Equip Action */}
                    <div className="mt-4 pt-3 border-t border-white/10">
                      {isEquippedActive ? (
                        <div className="w-full py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs font-black flex items-center justify-center gap-1.5 shadow-sm">
                          <Check className="w-4 h-4" />
                          <span>Equipped Active</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEquipSkin(card.id)}
                          className="w-full py-2 rounded-xl bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-200 border border-slate-700 hover:border-emerald-500 text-xs font-black transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                        >
                          <span>Equip Skin</span>
                        </button>
                      )}
                    </div>

                  </motion.div>
                );
              } else {
                // UNOWNED REDACTED MYSTERY CARD (ZERO IMAGE OR SILHOUETTE PREVIEW)
                return (
                  <div
                    key={card.id}
                    className="relative rounded-3xl p-4 bg-slate-950/90 border-2 border-dashed border-slate-800 flex flex-col justify-between text-center"
                  >
                    <div>
                      {/* Top clue */}
                      <div className="flex items-center justify-between text-[10px] font-mono border-b border-slate-800/80 pb-2">
                        <span className="text-slate-500 font-bold uppercase">{card.subject || 'DUNGEON'}</span>
                        <span className={`px-2 py-0.5 rounded-md uppercase text-[9px] ${getRarityBadgeStyle(card.rarity)}`}>
                          {card.rarity}
                        </span>
                        <span className="text-slate-600 font-bold">{card.cardNumber}</span>
                      </div>

                      {/* Redacted Vault Frame - NO image tag or silhouette whatsoever */}
                      <div className="my-3 rounded-2xl bg-slate-900/80 border border-slate-800/80 p-3 flex flex-col items-center justify-center h-32 relative overflow-hidden group">
                        <div className="w-14 h-14 rounded-2xl bg-slate-950/90 border border-slate-700/60 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                          <Lock className="w-7 h-7 text-amber-500/80" />
                        </div>
                        <span className="text-[10px] font-mono font-bold text-slate-500 mt-2 tracking-widest uppercase">
                          ENCRYPTED VAULT
                        </span>
                      </div>

                      {/* Redacted Mystery Info */}
                      <div className="space-y-1">
                        <h4 className="text-sm font-black text-slate-400">???</h4>
                        <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">
                          Classified Champion
                        </span>
                      </div>

                      <p className="text-[10px] text-slate-500 mt-3 p-2 rounded-xl bg-slate-900/50 border border-slate-800/80 leading-relaxed">
                        Classified card. Unlock by opening Booster Packs in the Shop!
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80">
                      <button
                        onClick={() => setActiveTab('shop')}
                        className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-amber-400 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Package className="w-3.5 h-3.5" />
                        <span>Open Booster Packs</span>
                      </button>
                    </div>

                  </div>
                );
              }
            })}
          </div>

        </div>
      )}

      {/* =========================================================================
          TAB 3: ARSENAL & WEAPONS (10 RANKED WEAPONS WITH ALTERNATE FIRE MODES)
          ========================================================================= */}
      {activeTab === 'armory' && (
        <div className="space-y-6">
          {/* Armory Header Banner */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white">Scientific Weapons Arsenal</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-black uppercase">
                  10 Ranked Weapons
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                Ranked by rarity from Common to Mythic. Every weapon features an active <strong className="text-cyan-300">Alternate Fire Mode</strong> (triggered with <strong className="text-amber-300">[F]</strong> key or <strong className="text-amber-300">[Right-Click]</strong> in battle). The mythic <strong className="text-purple-300">Quantum Displacer</strong> allows real-time cursor warp teleportation!
              </p>
            </div>

            {isInstructor && (
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-amber-300 text-xs font-black shrink-0">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Instructor Pass: All 10 Weapons Unlocked</span>
              </div>
            )}
          </div>

          {/* Rarity Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {['all', 'mythic', 'legendary', 'epic', 'rare', 'common'].map((rarity) => (
              <button
                key={rarity}
                onClick={() => setWeaponFilter(rarity)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer shrink-0 border ${
                  weaponFilter === rarity
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border-slate-800'
                }`}
              >
                {rarity === 'all' ? 'All Weapons (10)' : rarity}
              </button>
            ))}
          </div>

          {/* Weapons Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {SHOP_ITEMS.filter(i => i.category === 'weapon' && (weaponFilter === 'all' || i.rarity === weaponFilter)).map((weapon) => {
              const isEquipped = equippedWeaponId === weapon.id;
              const isOwned = isInstructor || inventory.includes(weapon.id) || weapon.id === 'bunsen_burner';
              const canAfford = currentGold >= weapon.price;

              const rarityGradient = 
                weapon.rarity === 'mythic' ? 'from-rose-950/40 via-purple-950/20 to-slate-900 border-rose-500/50 shadow-rose-500/10' :
                weapon.rarity === 'legendary' ? 'from-amber-950/40 via-orange-950/20 to-slate-900 border-amber-500/50 shadow-amber-500/10' :
                weapon.rarity === 'epic' ? 'from-purple-950/40 via-indigo-950/20 to-slate-900 border-purple-500/50 shadow-purple-500/10' :
                weapon.rarity === 'rare' ? 'from-cyan-950/40 via-sky-950/20 to-slate-900 border-cyan-500/50 shadow-cyan-500/10' :
                'from-slate-900 to-slate-950 border-slate-800';

              const badgeColor =
                weapon.rarity === 'mythic' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' :
                weapon.rarity === 'legendary' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                weapon.rarity === 'epic' ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' :
                weapon.rarity === 'rare' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' :
                'bg-slate-800 text-slate-300 border-slate-700';

              const alt = weapon.stats?.altFire;

              if (!isOwned) {
                // REDACTED LOCKED WEAPON - ZERO PREVIEW OF STATS, ALT-FIRE, OR ARTWORK
                return (
                  <div
                    key={weapon.id}
                    className="bg-slate-950/90 border-2 border-dashed border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col justify-between relative overflow-hidden"
                  >
                    <div>
                      {/* Top Header */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 shadow-inner shrink-0">
                            <Lock className="w-6 h-6 text-amber-500/80" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${badgeColor}`}>
                                {weapon.rarity}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                • [Encrypted Blueprint]
                              </span>
                            </div>
                            <h3 className="text-base font-black text-slate-400 mt-0.5">??? Classified Weapon</h3>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-slate-500 leading-relaxed mb-4">
                        Top-secret Cambridge science weapon prototype. Specifications, telemetry, and blueprints are classified until unlocked in Booster Packs!
                      </p>

                      {/* Redacted Primary Stats Grid */}
                      <div className="grid grid-cols-3 gap-2 p-2.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-center mb-4">
                        <div>
                          <span className="text-[9px] text-slate-500 uppercase font-black block">Damage</span>
                          <span className="text-xs font-mono font-black text-slate-600">??? HP</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-500 uppercase font-black block">Fire Rate</span>
                          <span className="text-xs font-mono font-black text-slate-600">???</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-500 uppercase font-black block">Range</span>
                          <span className="text-xs font-mono font-black text-slate-600">???</span>
                        </div>
                      </div>

                      {/* Redacted Alt-Fire Box */}
                      <div className="p-3 rounded-2xl bg-slate-900/50 border border-slate-800/80">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                            <Lock className="w-3.5 h-3.5 text-slate-600" />
                            <span>ALT-FIRE: [CLASSIFIED]</span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-600">
                            Cooldown: ???
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-snug">
                          Alternate fire capability schematics will be decrypted when you pull this weapon from a booster pack.
                        </p>
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
                      <span className="text-[10px] text-slate-500 font-mono">
                        Source: Booster Packs
                      </span>
                      <button
                        onClick={() => setActiveTab('shop')}
                        className="px-5 py-2 rounded-2xl bg-slate-900 hover:bg-slate-850 text-amber-400 border border-amber-500/30 text-xs font-black transition active:scale-95 cursor-pointer shadow-md flex items-center gap-1.5"
                      >
                        <Package className="w-3.5 h-3.5" />
                        <span>Get in Booster Packs</span>
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={weapon.id}
                  className={`bg-gradient-to-br ${rarityGradient} border-2 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col justify-between relative overflow-hidden group transition-all duration-300 hover:scale-[1.01]`}
                >
                  <div>
                    {/* Top Header: Badge, Name, Price */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-slate-950/80 border border-white/10 flex items-center justify-center text-2xl shadow-inner shrink-0 group-hover:scale-110 transition duration-300">
                          {weapon.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${badgeColor}`}>
                              {weapon.rarity}
                            </span>
                            {weapon.stats?.specialEffect && (
                              <span className="text-[10px] text-slate-400 font-mono">
                                • {weapon.stats.specialEffect}
                              </span>
                            )}
                          </div>
                          <h3 className="text-base font-black text-white mt-0.5">{weapon.name}</h3>
                        </div>
                      </div>

                      {weapon.price > 0 && !isOwned && (
                        <div className="flex items-center gap-1 font-mono font-black text-amber-400 text-sm bg-slate-950/80 px-2.5 py-1 rounded-xl border border-slate-800 shrink-0">
                          <Coins className="w-4 h-4 text-amber-400" />
                          <span>{weapon.price}</span>
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-slate-300/90 leading-relaxed mb-4">
                      {weapon.description}
                    </p>

                    {/* Primary Stats Grid */}
                    <div className="grid grid-cols-3 gap-2 p-2.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-center mb-4">
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase font-black block">Damage</span>
                        <span className="text-xs font-black text-rose-400">{weapon.stats?.damage} HP</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase font-black block">Fire Rate</span>
                        <span className="text-xs font-black text-amber-300">{weapon.stats?.cooldownSeconds}s</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase font-black block">Range</span>
                        <span className="text-xs font-black text-cyan-300">{weapon.stats?.range}m</span>
                      </div>
                    </div>

                    {/* Secondary / Alternate Fire Box */}
                    {alt && (
                      <div className="p-3 rounded-2xl bg-slate-950/90 border border-cyan-500/40 relative overflow-hidden">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-1.5 text-xs font-black text-cyan-300">
                            <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                            <span>ALT-FIRE: {alt.altName}</span>
                          </div>
                          <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                            Cooldown: {alt.altCooldownSeconds}s
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-snug">
                          {alt.altDescription}
                        </p>
                        {alt.altType === 'teleport' && (
                          <div className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-purple-300 bg-purple-950/60 p-1.5 rounded-xl border border-purple-500/40">
                            <span>⚡ Warps player avatar directly to the mouse cursor position with instant shockwave!</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
                    <span className="text-[10px] text-slate-400 font-mono">
                      Trigger: [Left Click] / Alt: [F or Right Click]
                    </span>

                    {isEquipped ? (
                      <div className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-black shadow-md">
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Equipped</span>
                      </div>
                    ) : isOwned ? (
                      <button
                        onClick={async () => {
                          if (user?.id) {
                            await equipItem(user.id, 'weapon', weapon.id);
                          }
                        }}
                        className="px-5 py-2 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition active:scale-95 cursor-pointer shadow-lg shadow-amber-500/20"
                      >
                        Equip Weapon
                      </button>
                    ) : (
                      <button
                        onClick={async () => {
                          if (user?.id) {
                            const res = await buyShopItem(user.id, weapon, currentGold, inventory);
                            if (!res.success) setFeedback(res.message);
                          }
                        }}
                        disabled={!canAfford}
                        className={`px-5 py-2 rounded-2xl text-xs font-black transition active:scale-95 cursor-pointer shadow-lg ${
                          canAfford
                            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                        }`}
                      >
                        {canAfford ? `Unlock (${weapon.price} 🪙)` : `Need ${weapon.price} 🪙`}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          ANIMATED PACK OPENING CEREMONY MODAL OVERLAY
          ========================================================================= */}
      <AnimatePresence>
        {openingPack && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 overflow-hidden"
          >
            {/* Persistent Top-Right Close Button (Always clickable during shaking, tearing, reveal) */}
            <button
              onClick={handleDismissCeremony}
              className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition active:scale-95 cursor-pointer shadow-xl flex items-center gap-1.5"
              title="Close ceremony"
            >
              <X className="w-5 h-5" />
              <span className="text-xs font-bold pr-1">Close</span>
            </button>

            {/* Background volumetric light beams */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[600px] h-[600px] bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-rose-500/20 rounded-full blur-3xl animate-pulse" />
            </div>

            <div className="relative z-10 w-full max-w-md flex flex-col items-center text-center">

              {/* STAGE 1: INTENSE SHAKING PACK */}
              {animationPhase === 'shaking' && (
                <div className="space-y-6 flex flex-col items-center">
                  <motion.div
                    animate={{ 
                      rotate: [-3, 3, -4, 4, -2, 2, 0],
                      scale: [1, 1.05, 1.08, 1.05]
                    }}
                    transition={{ repeat: Infinity, duration: 0.18 }}
                    className={`w-56 h-80 rounded-3xl p-6 bg-gradient-to-br ${openingPack.foilColor} border-4 ${openingPack.packBorder} shadow-[0_0_50px_rgba(234,179,8,0.5)] relative flex flex-col justify-between items-center`}
                  >
                    <div className="text-[10px] font-mono text-white/80 font-black tracking-widest uppercase">
                      TEARING PACK...
                    </div>
                    <div className="text-6xl animate-bounce">⚛️</div>
                    <div className="text-xs font-black text-amber-300 uppercase tracking-widest">
                      {openingPack.name}
                    </div>
                  </motion.div>
                  <p className="text-sm font-black text-amber-400 animate-pulse uppercase tracking-wider">
                    Opening Booster Foil...
                  </p>
                  <button
                    onClick={handleSkipToReveal}
                    className="px-4 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-xs font-bold text-amber-300 border border-amber-500/30 transition cursor-pointer flex items-center gap-1 shadow"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Skip to Reveal</span>
                  </button>
                </div>
              )}

              {/* STAGE 2: FOIL TEAR & LIGHT BURST */}
              {animationPhase === 'tearing' && (
                <div className="space-y-6 flex flex-col items-center">
                  <motion.div
                    initial={{ scale: 1 }}
                    animate={{ scale: [1, 1.25, 0.9], opacity: [1, 1, 0] }}
                    transition={{ duration: 0.9 }}
                    className="relative w-64 h-80 flex items-center justify-center"
                  >
                    {/* Explosive radial light burst */}
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 via-amber-400 to-rose-500 rounded-full blur-2xl animate-spin" />
                    <Sparkles className="w-24 h-24 text-white animate-ping" />
                  </motion.div>
                  <p className="text-base font-black text-white uppercase tracking-wider">
                    Unveiling Card...
                  </p>
                  <button
                    onClick={handleSkipToReveal}
                    className="px-4 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-xs font-bold text-amber-300 border border-amber-500/30 transition cursor-pointer flex items-center gap-1 shadow"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Skip to Reveal</span>
                  </button>
                </div>
              )}

              {/* STAGE 3: SHINY TRADING CARD REVEAL & 3D FLIP */}
              {animationPhase === 'reveal' && pulledReward && (
                <motion.div
                  initial={{ rotateY: 180, scale: 0.4, opacity: 0 }}
                  animate={{ rotateY: 0, scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', damping: 14, stiffness: 120 }}
                  className="w-full flex flex-col items-center space-y-4"
                >
                  {/* Duplicate or New Badge */}
                  {isDuplicate ? (
                    <motion.div
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black uppercase tracking-wider flex items-center gap-1.5"
                    >
                      <span>🔁 Duplicate Item Recycled (+50🪵 & +20⚙️)</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{pulledReward.type === 'skin' ? '✨ Brand New Skin Unlocked!' : '⚡ Brand New Science Weapon Unlocked!'}</span>
                    </motion.div>
                  )}

                  {/* REVEALED CARD: FANTASY SKIN */}
                  {pulledReward.type === 'skin' && (() => {
                    const card = pulledReward.item;
                    return (
                      <div
                        className={`relative w-72 sm:w-80 rounded-3xl p-5 bg-gradient-to-b ${card.cardColor} border-3 ${card.borderClass} shadow-2xl flex flex-col justify-between text-left overflow-hidden`}
                      >
                        {/* Holo prismatic shine overlay */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/15 to-transparent pointer-events-none" />

                        <div>
                          {/* Card Header */}
                          <div className="flex items-center justify-between text-[11px] font-mono border-b border-white/10 pb-2">
                            <span className="px-2 py-0.5 rounded-full bg-white/10 text-white font-black uppercase">
                              {card.subject || card.title || 'FANTASY'}
                            </span>
                            <span className={`px-2 py-0.5 rounded-md uppercase ${getRarityBadgeStyle(card.rarity)}`}>
                              {card.rarity}
                            </span>
                            <span className="text-white/60 font-bold">{card.cardNumber}</span>
                          </div>

                          {/* Character Artwork Frame */}
                          <div className="relative my-4 rounded-2xl bg-slate-950/80 border border-white/20 p-4 flex items-center justify-center overflow-hidden shadow-inner h-40">
                            <img 
                              src={card.portraitPath || card.spritePath || `/assets/characters/${card.id}.png`} 
                              alt={card.name} 
                              className="w-28 h-28 object-contain pixelated drop-shadow-[0_12px_24px_rgba(0,0,0,0.8)] animate-in zoom-in-75 duration-300" 
                              style={{ imageRendering: 'pixelated' }}
                              onError={(e) => {
                                const fallback = card.spritePath || `/assets/characters/${card.id}.png`;
                                if (e.currentTarget.src !== fallback && !e.currentTarget.src.endsWith(fallback)) {
                                  e.currentTarget.src = fallback;
                                }
                              }}
                            />
                          </div>

                          {/* Character Title */}
                          <div className="text-center space-y-0.5">
                            <h3 className="text-lg font-black text-white tracking-tight">{card.name}</h3>
                            <span className="text-xs font-bold text-amber-400 block">{card.title}</span>
                          </div>

                          {/* Lore */}
                          <p className="text-xs text-slate-300 mt-3 leading-relaxed bg-slate-950/60 p-2.5 rounded-xl border border-white/5">
                            {card.lore}
                          </p>

                          {/* Ability */}
                          <div className="mt-3 p-2.5 rounded-xl bg-slate-950/80 border border-amber-500/20 text-xs font-bold text-emerald-300 flex items-center gap-2">
                            <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                            <span>{card.ability}</span>
                          </div>
                        </div>

                        {/* Equip Button */}
                        <div className="mt-4 pt-3 border-t border-white/10">
                          <button
                            onClick={() => handleEquipSkin(card.id)}
                            className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/25"
                          >
                            <Check className="w-4 h-4" />
                            <span>Equip This Skin Now</span>
                          </button>
                        </div>
                      </div>
                    );
                  })()}

                  {/* REVEALED CARD: SCIENTIFIC WEAPON */}
                  {pulledReward.type === 'weapon' && (() => {
                    const weapon = pulledReward.item;
                    const style = getWeaponCardStyle(weapon.rarity);
                    return (
                      <div
                        className={`relative w-72 sm:w-80 rounded-3xl p-5 bg-gradient-to-b ${style.bg} border-3 ${style.border} shadow-2xl flex flex-col justify-between text-left overflow-hidden`}
                      >
                        {/* Holo prismatic shine overlay */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/15 to-transparent pointer-events-none" />

                        <div>
                          {/* Card Header */}
                          <div className="flex items-center justify-between text-[11px] font-mono border-b border-white/10 pb-2">
                            <span className="px-2 py-0.5 rounded-full bg-white/10 text-white font-black uppercase tracking-wider">
                              CAMBRIDGE ARSENAL
                            </span>
                            <span className={`px-2 py-0.5 rounded-md uppercase ${getRarityBadgeStyle(weapon.rarity)}`}>
                              {weapon.rarity}
                            </span>
                            <span className="text-white/60 font-bold">{weapon.stats?.specialEffect || 'SCIENCE'}</span>
                          </div>

                          {/* Weapon Artwork Frame */}
                          <div className="relative my-4 rounded-2xl bg-slate-950/80 border border-white/20 p-4 flex flex-col items-center justify-center overflow-hidden shadow-inner h-36">
                            <div className="text-5xl filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)] animate-bounce duration-1000">
                              {weapon.icon}
                            </div>
                            <span className="text-[10px] font-mono font-bold text-cyan-300 mt-2 px-2.5 py-0.5 rounded-full bg-cyan-950/70 border border-cyan-500/40">
                              Beam: {weapon.stats?.specialEffect}
                            </span>
                          </div>

                          {/* Weapon Title */}
                          <div className="text-center space-y-0.5">
                            <h3 className="text-lg font-black text-white tracking-tight">{weapon.name}</h3>
                            <span className="text-xs font-bold text-amber-400 block capitalize">{weapon.rarity} Science Weapon</span>
                          </div>

                          {/* Description */}
                          <p className="text-xs text-slate-300 mt-2.5 leading-relaxed bg-slate-950/60 p-2.5 rounded-xl border border-white/5">
                            {weapon.description}
                          </p>

                          {/* Primary Stats */}
                          <div className="grid grid-cols-3 gap-1.5 p-2 rounded-xl bg-slate-950/80 border border-white/10 text-center mt-2.5">
                            <div>
                              <span className="text-[8px] text-slate-400 uppercase font-black block">Damage</span>
                              <span className="text-xs font-black text-rose-400">{weapon.stats?.damage} HP</span>
                            </div>
                            <div>
                              <span className="text-[8px] text-slate-400 uppercase font-black block">Fire Rate</span>
                              <span className="text-xs font-black text-amber-300">{weapon.stats?.cooldownSeconds}s</span>
                            </div>
                            <div>
                              <span className="text-[8px] text-slate-400 uppercase font-black block">Range</span>
                              <span className="text-xs font-black text-cyan-300">{weapon.stats?.range}m</span>
                            </div>
                          </div>

                          {/* Alt-fire if present */}
                          {weapon.stats?.altFire && (
                            <div className="mt-2.5 p-2 rounded-xl bg-slate-950/90 border border-cyan-500/30 text-[10px] font-bold text-cyan-300 flex items-center justify-between">
                              <span className="flex items-center gap-1 truncate max-w-[170px]" title={weapon.stats.altFire.altName}>
                                <Zap className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                                <span className="truncate">ALT: {weapon.stats.altFire.altName}</span>
                              </span>
                              <span className="text-amber-400 font-mono shrink-0">{weapon.stats.altFire.altCooldownSeconds}s CD</span>
                            </div>
                          )}
                        </div>

                        {/* Equip Button */}
                        <div className="mt-4 pt-3 border-t border-white/10">
                          <button
                            onClick={() => handleEquipWeapon(weapon.id)}
                            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/25"
                          >
                            <Zap className="w-4 h-4" />
                            <span>Equip This Weapon Now</span>
                          </button>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2 w-full max-w-sm">
                    <button
                      onClick={() => handleOpenPack(openingPack)}
                      disabled={isProcessing || currentGold < openingPack.price || currentGold <= 0}
                      className={`w-full sm:flex-1 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition active:scale-95 cursor-pointer shadow-lg ${
                        currentGold >= openingPack.price && currentGold > 0 && !isProcessing
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
                      }`}
                    >
                      Open Another ({openingPack.price} 🪙)
                    </button>

                    <button
                      onClick={() => {
                        const targetTab = pulledReward.type === 'weapon' ? 'armory' : 'collection';
                        handleDismissCeremony();
                        setActiveTab(targetTab);
                      }}
                      className="w-full sm:flex-1 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-black text-xs uppercase tracking-wider transition active:scale-95 cursor-pointer border border-slate-700"
                    >
                      {pulledReward.type === 'weapon' ? 'View in Arsenal' : 'Collection'}
                    </button>

                    <button
                      onClick={handleDismissCeremony}
                      className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs uppercase tracking-wider transition active:scale-95 cursor-pointer border border-slate-800"
                    >
                      Done
                    </button>
                  </div>

                </motion.div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
