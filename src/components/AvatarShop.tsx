import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Coins,
  Check,
  Lock,
  X,
  ArrowRight,
  Layers,
  Package,
  Crosshair,
  Sparkles,
  Shield,
  Activity,
  Eye
} from 'lucide-react';
import { motion, AnimatePresence, MotionConfig } from 'motion/react';
import { UserProfile } from '../types';
import {
  ItemRarity,
  UserGameProfile,
  subscribeToGameProfile,
  fetchStudentGameProfile,
  equipItem,
  ShopItem,
  BattleEventState,
  getLocalGameItem,
  setLocalGameItem,
  openBoosterPackTransaction
} from '../services/firebaseGameService';
import { db } from '../services/firebaseAuth';
import { doc, setDoc } from 'firebase/firestore';
import {
  ALL_FANTASY_SKINS,
  FantasySkinDefinition,
  FANTASY_SKIN_ALIASES
} from '../data/fantasySkinsData';
import {
  BOOSTER_PACKS,
  BoosterPackConfig,
  RARITY_RANK,
  ALL_WEAPON_ITEMS,
  SKIN_DROP_PROBABILITY,
  rollPackReward,
  hasWeaponInInventory,
  resolveArenaWeaponId
} from '../data/gameCatalogData';

export type { BoosterPackConfig };
export { BOOSTER_PACKS, RARITY_RANK, ALL_WEAPON_ITEMS };

export type SkinCard = FantasySkinDefinition;
export const ALL_SKIN_CARDS: SkinCard[] = ALL_FANTASY_SKINS;

export type BoosterReward =
  | { type: 'skin'; item: SkinCard }
  | { type: 'weapon'; item: ShopItem };

type PackOpeningStage = 'idle' | 'charging' | 'bursting' | 'revealed';

class PackSoundFX {
  private ctx: AudioContext | null = null;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  playCharge() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const steps = [220, 277.18, 329.63, 392];
      steps.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.type = 'triangle';
        const start = t + idx * 0.22;
        osc.frequency.setValueAtTime(freq, start);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.08, start + 0.18);
        gain.gain.setValueAtTime(0.08, start);
        gain.gain.exponentialRampToValueAtTime(0.008, start + 0.2);
        osc.start(start);
        osc.stop(start + 0.2);
      });
    } catch {
      // Ignore Web Audio errors when blocked or unsupported
    }
  }

  playBurst(rarity: ItemRarity) {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.type = 'sine';
      const peakFreq = rarity === 'mythic' ? 1174.66 : rarity === 'legendary' ? 987.77 : 783.99;
      osc.frequency.setValueAtTime(260, t);
      osc.frequency.exponentialRampToValueAtTime(peakFreq, t + 0.24);
      gain.gain.setValueAtTime(0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.28);
      osc.start(t);
      osc.stop(t + 0.28);
    } catch {
      // Ignore Web Audio errors
    }
  }

  playReveal(rarity: ItemRarity) {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const notes =
        rarity === 'mythic'
          ? [523.25, 659.25, 783.99, 1046.5, 1318.51]
          : rarity === 'legendary'
          ? [440, 554.37, 659.25, 880]
          : rarity === 'epic'
          ? [392, 493.88, 659.25]
          : [392, 493.88, 587.33];

      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t + idx * 0.09);
        gain.gain.setValueAtTime(0.18, t + idx * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.01, t + idx * 0.09 + 0.34);
        osc.start(t + idx * 0.09);
        osc.stop(t + idx * 0.09 + 0.34);
      });
    } catch {
      // Ignore Web Audio errors
    }
  }

  playEquip() {
    try {
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
      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
      osc.start(t);
      osc.stop(t + 0.15);
    } catch {
      // Ignore Web Audio errors
    }
  }
}

const packSfx = new PackSoundFX();

const PACK_VISUAL_THEME: Record<
  BoosterPackConfig['packNumber'],
  {
    foilBg: string;
    foilBorder: string;
    foilAccent: string;
    burstBg: string;
    tierTag: string;
  }
> = {
  1: {
    foilBg: 'from-slate-800 via-emerald-900 to-slate-950',
    foilBorder: 'border-emerald-400',
    foilAccent: 'text-emerald-300',
    burstBg: 'bg-emerald-400/25',
    tierTag: 'Tier I Foil Pack'
  },
  2: {
    foilBg: 'from-slate-900 via-cyan-900 to-indigo-950',
    foilBorder: 'border-cyan-400',
    foilAccent: 'text-cyan-300',
    burstBg: 'bg-cyan-400/25',
    tierTag: 'Tier II Energy Pack'
  },
  3: {
    foilBg: 'from-slate-900 via-purple-900 to-indigo-950',
    foilBorder: 'border-purple-400',
    foilAccent: 'text-purple-300',
    burstBg: 'bg-purple-400/25',
    tierTag: 'Tier III Master Pack'
  },
  4: {
    foilBg: 'from-amber-700 via-yellow-800 to-slate-950',
    foilBorder: 'border-amber-300',
    foilAccent: 'text-amber-200',
    burstBg: 'bg-amber-400/30',
    tierTag: 'Super Gold Foil Pack'
  }
};

const RARITY_REVEAL_ACCENT: Record<
  ItemRarity,
  { border: string; headerBg: string; pill: string; ring: string }
> = {
  mythic: {
    border: 'border-rose-500 dark:border-rose-400',
    headerBg: 'bg-rose-600 text-white',
    pill: 'bg-rose-100 dark:bg-rose-950/70 text-rose-900 dark:text-rose-200 border-rose-400',
    ring: 'bg-rose-500/20'
  },
  legendary: {
    border: 'border-amber-500 dark:border-amber-400',
    headerBg: 'bg-amber-500 text-slate-950',
    pill: 'bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-200 border-amber-400',
    ring: 'bg-amber-400/20'
  },
  epic: {
    border: 'border-purple-500 dark:border-purple-400',
    headerBg: 'bg-purple-700 text-white',
    pill: 'bg-purple-100 dark:bg-purple-950/70 text-purple-900 dark:text-purple-200 border-purple-400',
    ring: 'bg-purple-500/20'
  },
  rare: {
    border: 'border-cyan-500 dark:border-cyan-400',
    headerBg: 'bg-cyan-700 text-white',
    pill: 'bg-cyan-100 dark:bg-cyan-950/70 text-cyan-900 dark:text-cyan-200 border-cyan-400',
    ring: 'bg-cyan-500/20'
  },
  common: {
    border: 'border-slate-400 dark:border-zinc-600',
    headerBg: 'bg-slate-700 text-white',
    pill: 'bg-slate-100 dark:bg-zinc-900 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-zinc-700',
    ring: 'bg-slate-400/15'
  }
};

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

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
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Multi-stage Pack Opening Animation State
  const [packStage, setPackStage] = useState<PackOpeningStage>('idle');
  const [openingPack, setOpeningPack] = useState<BoosterPackConfig | null>(null);
  const [pulledReward, setPulledReward] = useState<BoosterReward | null>(null);
  const [isDuplicate, setIsDuplicate] = useState<boolean>(false);

  // Synchronous mutex & lifecycle refs to make rapid double-click / race glitches impossible
  const openLockRef = useRef<boolean>(false);
  const mountedRef = useRef<boolean>(true);
  const timersRef = useRef<number[]>([]);

  const clearAnimationTimers = useCallback(() => {
    timersRef.current.forEach((timerId) => window.clearTimeout(timerId));
    timersRef.current = [];
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      clearAnimationTimers();
      openLockRef.current = false;
    };
  }, [clearAnimationTimers]);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    if (!user?.id) return;
    setGameProfile(null);
    const unsub = subscribeToGameProfile(user.id, (profile) => {
      if (mountedRef.current) {
        setGameProfile(profile);
      }
    });
    return () => unsub();
  }, [user?.id]);

  const isProfileReady = gameProfile !== null;
  const isInstructor = user?.role === 'instructor';
  const currentGold = isProfileReady
    ? Math.max(0, Math.floor(Number(gameProfile.gold) || 0))
    : 0;
  const unlockedSkins = gameProfile?.unlockedSkins ?? ['cultist'];
  const equippedSkin = gameProfile?.equippedSkin ?? 'cultist';
  const equippedWeapon = resolveArenaWeaponId(gameProfile?.equippedWeapon || 'bunsen_burner');
  const inventory = gameProfile?.inventory ?? ['bunsen_burner', 'cultist'];
  const giftedPacks = gameProfile?.giftedPacks ?? {};
  const totalGiftedPacks = useMemo(
    () => Object.values(giftedPacks).reduce((sum, count) => sum + Math.max(0, Number(count) || 0), 0),
    [giftedPacks]
  );
  const recentRewards = useMemo(
    () => [...(gameProfile?.rewardHistory || [])].reverse().slice(0, 6),
    [gameProfile?.rewardHistory]
  );

  // Sort skins by rarity rank (Rank 1 Mythic -> Rank 2 Legendary -> Rank 3 Epic -> Rank 4 Rare -> Rank 5 Common)
  const sortedSkins = useMemo(() => {
    return [...ALL_SKIN_CARDS].sort((a, b) => {
      const rankA = RARITY_RANK[a.rarity]?.rank ?? 99;
      const rankB = RARITY_RANK[b.rarity]?.rank ?? 99;
      return rankA - rankB;
    });
  }, []);

  // Sort weapons by rarity rank (Rank 1 Mythic -> Rank 2 Legendary -> Rank 3 Epic -> Rank 4 Rare -> Rank 5 Common)
  const sortedWeapons = useMemo(() => {
    return [...ALL_WEAPON_ITEMS].sort((a, b) => {
      const rankA = RARITY_RANK[a.rarity]?.rank ?? 99;
      const rankB = RARITY_RANK[b.rarity]?.rank ?? 99;
      return rankA - rankB;
    });
  }, []);

  const unlockedSkinsCount = useMemo(() => {
    if (isInstructor) return ALL_SKIN_CARDS.length;
    return ALL_SKIN_CARDS.filter(c => unlockedSkins.includes(c.id) || c.id === 'cultist').length;
  }, [isInstructor, unlockedSkins]);

  const unlockedWeaponsCount = useMemo(() => {
    if (isInstructor) return ALL_WEAPON_ITEMS.length;
    return ALL_WEAPON_ITEMS.filter(w => hasWeaponInInventory(inventory, w.id)).length;
  }, [isInstructor, inventory]);

  const waitForMs = (ms: number): Promise<void> =>
    new Promise((resolve) => {
      const id = window.setTimeout(resolve, ms);
      timersRef.current.push(id);
    });

  const dismissReveal = useCallback(() => {
    clearAnimationTimers();
    setPackStage('idle');
    setOpeningPack(null);
    setPulledReward(null);
    setIsDuplicate(false);
    setIsProcessing(false);
    openLockRef.current = false;
  }, [clearAnimationTimers]);

  const handleOpenPack = async (pack: BoosterPackConfig, useGiftedOverride?: boolean) => {
    // Synchronous mutex prevents rapid double-click / animation-window gold bypasses
    if (!user?.id || !isProfileReady || openLockRef.current || isProcessing || packStage !== 'idle') {
      return;
    }

    const giftedAvailable = Math.max(0, Math.floor(Number(giftedPacks[pack.id] || 0)));
    const useGiftedPack = useGiftedOverride ?? giftedAvailable > 0;

    if (useGiftedPack && giftedAvailable <= 0) {
      setFeedback('No gifted packs of this tier available.');
      return;
    }

    if (!useGiftedPack && !isInstructor && currentGold < pack.price) {
      setFeedback(`You need ${pack.price} Gold to open this pack (current balance: ${currentGold} Gold).`);
      return;
    }

    openLockRef.current = true;
    setIsProcessing(true);
    setFeedback(null);
    clearAnimationTimers();

    try {
      const rolled = rollPackReward(pack.odds, ALL_SKIN_CARDS, ALL_WEAPON_ITEMS);
      const reward: BoosterReward =
        rolled.type === 'skin'
          ? { type: 'skin', item: rolled.item }
          : { type: 'weapon', item: rolled.item };

      const duplicate =
        reward.type === 'skin'
          ? unlockedSkins.includes(reward.item.id) || reward.item.id === 'cultist'
          : hasWeaponInInventory(inventory, reward.item.id);

      // Start sealed foil pack shake/charge animation immediately while atomic Firestore tx runs
      setOpeningPack(pack);
      setPulledReward(null);
      setPackStage('charging');
      packSfx.playCharge();

      const reduced = prefersReducedMotion();
      const chargeDurationMs = reduced ? 180 : 1150;

      // Authoritative Firestore transaction verifies & deducts Gold/giftedPack BEFORE reveal
      const [txResult] = await Promise.all([
        openBoosterPackTransaction(user.id, {
          packId: pack.id,
          packPrice: pack.price,
          useGiftedPack,
          unlockedItemId: reward.item.id,
          unlockedItemType: reward.type,
          isInstructor
        }),
        waitForMs(chargeDurationMs)
      ]);

      if (!mountedRef.current) return;

      if (!txResult.success) {
        // Transaction rejected (e.g. insufficient gold or network failure): abort animation & refresh true balance
        setPackStage('idle');
        setOpeningPack(null);
        setPulledReward(null);
        setFeedback(txResult.error || 'Could not open booster pack. Please try again.');
        setIsProcessing(false);
        openLockRef.current = false;
        fetchStudentGameProfile(user.id)
          .then((freshProfile) => {
            if (mountedRef.current) setGameProfile(freshProfile);
          })
          .catch(() => {});
        return;
      }

      if (txResult.profile) {
        setGameProfile(txResult.profile);
      }

      // Stage 2: Energy burst transition (only after atomic transaction succeeded!)
      setPackStage('bursting');
      packSfx.playBurst(reward.item.rarity);
      await waitForMs(reduced ? 80 : 340);

      if (!mountedRef.current) return;

      // Stage 3: Final card reveal
      setPulledReward(reward);
      setIsDuplicate(duplicate);
      setPackStage('revealed');
      setIsProcessing(false);
      packSfx.playReveal(reward.item.rarity);
    } catch (e) {
      console.error('Failed to open pack:', e);
      if (mountedRef.current) {
        setPackStage('idle');
        setOpeningPack(null);
        setPulledReward(null);
        setFeedback('Error opening pack. Please try again.');
        setIsProcessing(false);
        openLockRef.current = false;
      }
    }
  };

  const handleEquipSkin = async (skinId: string) => {
    if (!user?.id) return;
    setGameProfile(prev => prev ? ({ ...prev, equippedSkin: skinId, avatar: skinId }) : prev);
    const localKey = `igcse_game_profile_${user.id}`;
    try {
      const cached = getLocalGameItem<Record<string, unknown>>(localKey, {});
      setLocalGameItem(localKey, { ...cached, equippedSkin: skinId, avatar: skinId });
    } catch {}

    try {
      const userDocRef = doc(db, 'users', user.id);
      await setDoc(userDocRef, { equippedSkin: skinId, avatar: skinId }, { merge: true });
      await equipItem(user.id, 'skin', skinId);
      setFeedback(`Equipped ${ALL_SKIN_CARDS.find(c => c.id === skinId)?.name || 'Skin'} successfully.`);
    } catch (err) {
      console.warn('Error equipping skin:', err);
      setFeedback(`Equipped ${ALL_SKIN_CARDS.find(c => c.id === skinId)?.name || 'Skin'} successfully.`);
    }
  };

  const handleEquipWeapon = async (weaponId: string) => {
    if (!user?.id) return;
    packSfx.playEquip();
    setGameProfile(prev => prev ? ({ ...prev, equippedWeapon: weaponId }) : prev);
    const localKey = `igcse_game_profile_${user.id}`;
    try {
      const cached = getLocalGameItem<Record<string, unknown>>(localKey, {});
      setLocalGameItem(localKey, { ...cached, equippedWeapon: weaponId });
    } catch {}

    try {
      await equipItem(user.id, 'weapon', weaponId);
      setFeedback('Equipped weapon successfully.');
    } catch (err) {
      console.warn('Error equipping weapon:', err);
      setFeedback('Equipped weapon successfully.');
    }
  };

  const skinChancePercent = Math.round(SKIN_DROP_PROBABILITY * 100);
  const weaponChancePercent = 100 - skinChancePercent;

  return (
    <MotionConfig reducedMotion="user">
      <div className="w-full max-w-5xl mx-auto space-y-6 pb-12 font-sans text-slate-800 dark:text-slate-100">
        {/* Top Header Card */}
        <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
                  Character and Arsenal Shop
                </h1>
              </div>
              <p className="text-base text-slate-600 dark:text-slate-300 mt-1">
                Unlock science avatars, customize your sprite loadout, and equip weapons for the Battle Royale arena.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Gold Balance Card */}
              <div className="bg-[#FDFBF7] dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-lg px-4 py-2 text-center shrink-0">
                <span className="block text-xs font-semibold text-slate-600 dark:text-slate-400">Your Balance</span>
                <div className="flex items-center justify-center gap-1.5 text-lg font-bold text-slate-800 dark:text-white tabular-nums whitespace-nowrap">
                  <Coins className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>{isProfileReady ? `${currentGold.toLocaleString()} Gold` : 'Loading...'}</span>
                </div>
              </div>

              {onNavigateToArena && (isInstructor || battleState?.status === 'IN_PROGRESS') && (
                <button
                  onClick={onNavigateToArena}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-bold flex items-center gap-2 cursor-pointer transition whitespace-nowrap"
                >
                  <span>Enter Arena</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {handleClose && (
                <button
                  onClick={handleClose}
                  className="p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-zinc-900 cursor-pointer"
                  title="Back to Study"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Feedback Alert */}
          {feedback && (
            <div className="mt-4 p-3 rounded-lg bg-[#EBF3F5] dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 text-slate-800 dark:text-slate-100 text-sm font-semibold flex items-center justify-between gap-2">
              <span>{feedback}</span>
              <button
                onClick={() => setFeedback(null)}
                className="text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white shrink-0 cursor-pointer"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-zinc-800 flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('shop')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold border transition cursor-pointer ${
                activeTab === 'shop'
                  ? 'bg-slate-800 dark:bg-white text-white dark:text-black border-slate-800 dark:border-white'
                  : 'bg-white dark:bg-black text-slate-700 dark:text-slate-200 border-slate-300 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-900'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Booster Packs{totalGiftedPacks > 0 ? ` (${totalGiftedPacks} Free)` : ''}</span>
            </button>

            <button
              onClick={() => setActiveTab('collection')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold border transition cursor-pointer ${
                activeTab === 'collection'
                  ? 'bg-slate-800 dark:bg-white text-white dark:text-black border-slate-800 dark:border-white'
                  : 'bg-white dark:bg-black text-slate-700 dark:text-slate-200 border-slate-300 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-900'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>My Characters ({unlockedSkinsCount} / {ALL_SKIN_CARDS.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('armory')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold border transition cursor-pointer ${
                activeTab === 'armory'
                  ? 'bg-slate-800 dark:bg-white text-white dark:text-black border-slate-800 dark:border-white'
                  : 'bg-white dark:bg-black text-slate-700 dark:text-slate-200 border-slate-300 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-900'
              }`}
            >
              <Crosshair className="w-4 h-4" />
              <span>Weapons and Tools ({unlockedWeaponsCount} / {ALL_WEAPON_ITEMS.length})</span>
            </button>
          </div>
        </div>

        {/* TAB 1: BOOSTER PACKS */}
        {activeTab === 'shop' && (
          <div className="space-y-4">
            {totalGiftedPacks > 0 && (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 text-emerald-950 dark:text-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-5 h-5 text-emerald-700 dark:text-emerald-300 shrink-0" />
                  <div className="text-sm">
                    <span className="font-bold">
                      You have {totalGiftedPacks} free Gifted Booster Pack{totalGiftedPacks === 1 ? '' : 's'} awarded by your instructor.
                    </span>
                    <span className="text-emerald-800 dark:text-emerald-300 ml-1.5">
                      Open them below at no Gold cost.
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {BOOSTER_PACKS.map((pack) => {
                const giftedCount = Math.max(0, Math.floor(Number(giftedPacks[pack.id] || 0)));
                const canAfford = isProfileReady && currentGold >= pack.price;
                const buttonsLocked = !isProfileReady || isProcessing || packStage !== 'idle';
                const packTheme = PACK_VISUAL_THEME[pack.packNumber];

                return (
                  <div
                    key={pack.id}
                    className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-400 dark:hover:border-zinc-600 transition"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 tabular-nums">
                          {pack.badge}{giftedCount > 0 ? ` · ${giftedCount} Free Gifted` : ''}
                        </span>
                        <span className="text-base font-bold text-slate-800 dark:text-white tabular-nums whitespace-nowrap">
                          {pack.price} Gold
                        </span>
                      </div>

                      <div className="flex items-start gap-3.5">
                        {/* Mini Sealed Foil Pack Preview */}
                        <div
                          className={`w-14 h-18 rounded-lg bg-gradient-to-br ${packTheme.foilBg} border-2 ${packTheme.foilBorder} flex flex-col items-center justify-center shrink-0 shadow-xs`}
                        >
                          <Package className={`w-5 h-5 ${packTheme.foilAccent}`} />
                          <span className="text-[10px] font-bold text-white/90 mt-1 tabular-nums">
                            #{pack.packNumber}
                          </span>
                        </div>

                        <div className="min-w-0">
                          <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                            {pack.name}
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-slate-300 mt-0.5">
                            {pack.description}
                          </p>
                        </div>
                      </div>

                      {/* Complete Drop Rates for Skins and Weapons */}
                      <div className="bg-[#FDFBF7] dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg p-3 text-xs text-slate-700 dark:text-slate-200 space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-bold text-slate-800 dark:text-white">Rarity odds (Skins &amp; Weapons):</p>
                          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 tabular-nums">
                            {skinChancePercent}% Skin · {weaponChancePercent}% Weapon
                          </span>
                        </div>
                        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-1 tabular-nums">
                          <li>Common: {pack.odds.common}%</li>
                          <li>Rare: {pack.odds.rare}%</li>
                          <li>Epic: {pack.odds.epic}%</li>
                          <li>Legendary: {pack.odds.legendary}%</li>
                          <li className="font-bold text-rose-700 dark:text-rose-300">
                            Mythic: {pack.odds.mythic}%
                          </li>
                        </ul>
                      </div>
                    </div>

                    {/* Open Pack Action Buttons */}
                    <div className="space-y-2">
                      {giftedCount > 0 && (
                        <button
                          onClick={() => handleOpenPack(pack, true)}
                          disabled={buttonsLocked}
                          className={`w-full py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition ${
                            buttonsLocked
                              ? 'bg-emerald-700/50 text-white/80 cursor-not-allowed'
                              : 'bg-emerald-700 hover:bg-emerald-600 text-white cursor-pointer'
                          }`}
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>Open Free Gifted Pack ({giftedCount} left)</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleOpenPack(pack, false)}
                        disabled={buttonsLocked || (!canAfford && !isInstructor)}
                        className={`w-full py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition ${
                          buttonsLocked
                            ? 'bg-slate-200 dark:bg-zinc-900 text-slate-400 dark:text-zinc-500 border border-slate-300 dark:border-zinc-800 cursor-not-allowed'
                            : canAfford || isInstructor
                            ? giftedCount > 0
                              ? 'bg-white dark:bg-black hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-800 dark:text-white border border-slate-300 dark:border-zinc-700 cursor-pointer'
                              : 'bg-slate-800 hover:bg-slate-700 text-white cursor-pointer'
                            : 'bg-slate-100 dark:bg-zinc-900 text-slate-400 dark:text-zinc-500 border border-slate-300 dark:border-zinc-800 cursor-not-allowed'
                        }`}
                      >
                        <Package className="w-4 h-4" />
                        <span>
                          {!isProfileReady
                            ? 'Checking Balance...'
                            : canAfford || isInstructor
                            ? `Open Pack for ${pack.price} Gold`
                            : `Requires ${pack.price} Gold (${Math.max(0, pack.price - currentGold)} more needed)`}
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {recentRewards.length > 0 && (
              <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Recent Rewards from Your Instructor
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                    {recentRewards.length} recent
                  </span>
                </div>
                <div className="divide-y divide-slate-200 dark:divide-zinc-800">
                  {recentRewards.map((rec) => (
                    <div key={rec.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 dark:text-slate-100 truncate">
                          {rec.rewardType === 'gold'
                            ? `+${rec.quantity} Gold`
                            : rec.rewardType === 'booster_pack'
                            ? `${rec.quantity}× ${rec.itemName}`
                            : rec.itemName}
                        </p>
                        <p className="text-slate-500 dark:text-slate-400 truncate">
                          Awarded by {rec.awardedBy}{rec.note ? ` · "${rec.note}"` : ''}
                        </p>
                      </div>
                      <span className="text-slate-500 dark:text-slate-400 tabular-nums shrink-0">
                        {new Date(rec.awardedAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MY CHARACTERS COLLECTION */}
        {activeTab === 'collection' && (
          <div className="space-y-4">
            <div className="p-3.5 bg-[#EDE6D8] dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 rounded-xl text-xs text-slate-800 dark:text-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" />
                <span>
                  <strong>Card Pack Exclusives:</strong> All 19 champions are ranked by rarity. Locked skins remain concealed until pulled in a Booster Pack.
                </span>
              </div>
              <button
                onClick={() => setActiveTab('shop')}
                className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-lg shrink-0 cursor-pointer border border-black"
              >
                Open Packs
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {sortedSkins.map((card) => {
                const isUnlocked = isInstructor || unlockedSkins.includes(card.id) || card.id === 'cultist';
                const isEquipped = equippedSkin === card.id || FANTASY_SKIN_ALIASES[equippedSkin] === card.id;
                const rankInfo = RARITY_RANK[card.rarity] || {
                  rank: 5,
                  label: card.rarity,
                  badgeClass: 'bg-slate-100 text-slate-800 border-slate-300'
                };

                if (!isUnlocked) {
                  return (
                    <div
                      key={card.id}
                      className="bg-white dark:bg-black border-2 border-slate-300 dark:border-zinc-800 rounded-xl p-4 shadow-xs flex flex-col justify-between space-y-3 opacity-90"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-500 tracking-wider">
                            Undiscovered Champion
                          </span>
                          <span className={`text-[11px] px-2 py-0.5 rounded border whitespace-nowrap ${rankInfo.badgeClass}`}>
                            Rank {rankInfo.rank} • {rankInfo.label}
                          </span>
                        </div>

                        <div className="bg-[#EDE6D8] dark:bg-zinc-950 border-2 border-dashed border-slate-400 dark:border-zinc-800 rounded-lg p-3 flex flex-col items-center justify-center h-28 text-center">
                          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 flex items-center justify-center text-slate-600 dark:text-zinc-400">
                            <Lock className="w-5 h-5" />
                          </div>
                          <span className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 mt-1.5">
                            Hidden Character
                          </span>
                        </div>

                        <div>
                          <h3 className="text-sm font-bold text-slate-700 dark:text-zinc-300">
                            Undiscovered {card.rarity.charAt(0).toUpperCase() + card.rarity.slice(1)} Skin
                          </h3>
                          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
                            Defense, speed, and avatar abilities are hidden until unlocked through a Science Card Pack.
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => setActiveTab('shop')}
                        className="w-full py-2 bg-[#EDE6D8] hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 border-2 border-black dark:border-zinc-700 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <Package className="w-3.5 h-3.5 text-amber-700" />
                        <span>Unlock via Card Packs</span>
                      </button>
                    </div>
                  );
                }

                return (
                  <div
                    key={card.id}
                    className="bg-white dark:bg-black border-2 border-black dark:border-zinc-700 rounded-xl p-4 shadow-xs flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 border border-emerald-400 whitespace-nowrap">
                            ✓ Unlocked
                          </span>
                          <span className="text-xs font-bold text-slate-600 dark:text-zinc-400">
                            {card.subject || 'Science'}
                          </span>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded border whitespace-nowrap ${rankInfo.badgeClass}`}>
                          Rank {rankInfo.rank} • {rankInfo.label}
                        </span>
                      </div>

                      <div className="bg-[#EDE6D8] dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 rounded-lg p-2.5 flex items-center justify-center h-28">
                        <img
                          src={card.portraitPath || card.spritePath || `/assets/characters/${card.id}.png`}
                          alt={card.name}
                          className="w-20 h-20 object-contain pixelated"
                          onError={(e) => {
                            const fallback = card.spritePath || `/assets/characters/${card.id}.png`;
                            if (e.currentTarget.src !== fallback) {
                              e.currentTarget.src = fallback;
                            }
                          }}
                        />
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">{card.name}</h3>
                        <p className="text-xs text-slate-600 dark:text-zinc-400">{card.title}</p>
                      </div>

                      {/* Skin Attributes */}
                      <div className="bg-[#EDE6D8] dark:bg-zinc-900/80 border border-slate-300 dark:border-zinc-800 rounded-lg p-2.5 text-xs space-y-1.5">
                        <div>
                          <div className="flex items-center justify-between text-slate-800 dark:text-zinc-200 font-bold mb-0.5">
                            <span className="flex items-center gap-1">
                              <Shield className="w-3 h-3 text-indigo-700 dark:text-indigo-400" />
                              <span>Defense</span>
                            </span>
                            <span className="font-mono tabular-nums">{card.defense}/100</span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-indigo-600 h-full rounded-full transition-all"
                              style={{ width: `${card.defense}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between text-slate-800 dark:text-zinc-200 font-bold mb-0.5">
                            <span className="flex items-center gap-1">
                              <Activity className="w-3 h-3 text-emerald-700 dark:text-emerald-400" />
                              <span>Speed</span>
                            </span>
                            <span className="font-mono tabular-nums">{card.speed}/100</span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-emerald-600 h-full rounded-full transition-all"
                              style={{ width: `${card.speed}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {card.ability && (
                        <p className="text-[11px] text-slate-600 dark:text-zinc-400 font-medium">
                          <strong>Ability:</strong> {card.ability}
                        </p>
                      )}
                    </div>

                    <div>
                      {isEquipped ? (
                        <div className="w-full py-2 bg-emerald-100 dark:bg-emerald-950/80 border-2 border-emerald-500 text-emerald-900 dark:text-emerald-200 rounded-lg text-xs font-bold text-center flex items-center justify-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-300" />
                          <span>Equipped</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEquipSkin(card.id)}
                          className="w-full py-2 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-bold cursor-pointer transition border-2 border-black"
                        >
                          Equip Character
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: WEAPONS AND ARSENAL */}
        {activeTab === 'armory' && (
          <div className="space-y-4">
            <div className="p-3.5 bg-[#EDE6D8] dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 rounded-xl text-xs text-slate-800 dark:text-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" />
                <span>
                  <strong>Card Pack Exclusives:</strong> Weapons can only be unlocked via Science Booster Packs (no direct purchase). Locked weapons remain hidden until unlocked.
                </span>
              </div>
              <button
                onClick={() => setActiveTab('shop')}
                className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-lg shrink-0 cursor-pointer border border-black"
              >
                Open Packs
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {sortedWeapons.map((weapon) => {
                const isOwned = isInstructor || hasWeaponInInventory(inventory, weapon.id);
                const isEquipped = equippedWeapon === weapon.id;
                const rankInfo = RARITY_RANK[weapon.rarity] || {
                  rank: 5,
                  label: weapon.rarity,
                  badgeClass: 'bg-slate-100 text-slate-800 border-slate-300'
                };

                if (!isOwned) {
                  return (
                    <div
                      key={weapon.id}
                      className="bg-white dark:bg-black border-2 border-slate-300 dark:border-zinc-800 rounded-xl p-4 shadow-xs flex flex-col justify-between space-y-3 opacity-90"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-500 tracking-wider">
                            Undiscovered Weapon
                          </span>
                          <span className={`text-[11px] px-2 py-0.5 rounded border whitespace-nowrap ${rankInfo.badgeClass}`}>
                            Rank {rankInfo.rank} • {rankInfo.label}
                          </span>
                        </div>

                        <div className="bg-[#EDE6D8] dark:bg-zinc-950 border-2 border-dashed border-slate-400 dark:border-zinc-800 rounded-lg p-3 flex flex-col items-center justify-center h-28 text-center">
                          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 flex items-center justify-center text-slate-600 dark:text-zinc-400">
                            <Lock className="w-5 h-5" />
                          </div>
                          <span className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 mt-1.5">
                            Hidden Arsenal
                          </span>
                        </div>

                        <div>
                          <h3 className="text-sm font-bold text-slate-700 dark:text-zinc-300">
                            Undiscovered {weapon.rarity.charAt(0).toUpperCase() + weapon.rarity.slice(1)} Weapon
                          </h3>
                          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
                            Damage, fire rate, and firing mechanics are concealed until pulled from a Science Booster Pack.
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => setActiveTab('shop')}
                        className="w-full py-2 bg-[#EDE6D8] hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 border-2 border-black dark:border-zinc-700 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <Package className="w-3.5 h-3.5 text-amber-700" />
                        <span>Unlock via Card Packs</span>
                      </button>
                    </div>
                  );
                }

                return (
                  <div
                    key={weapon.id}
                    className="bg-white dark:bg-black border-2 border-black dark:border-zinc-700 rounded-xl p-4 shadow-xs flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{weapon.icon}</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 border border-emerald-400 whitespace-nowrap">
                            ✓ Unlocked
                          </span>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded border whitespace-nowrap ${rankInfo.badgeClass}`}>
                          Rank {rankInfo.rank} • {rankInfo.label}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">{weapon.name}</h3>
                        <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">{weapon.description}</p>
                      </div>

                      {/* Weapon Attributes */}
                      <div className="bg-[#EDE6D8] dark:bg-zinc-900/80 border border-slate-300 dark:border-zinc-800 rounded-lg p-2.5 text-xs text-slate-800 dark:text-zinc-200 grid grid-cols-3 gap-2 text-center">
                        <div className="p-1 bg-white/70 dark:bg-black/40 rounded border border-slate-300 dark:border-zinc-800">
                          <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 block">Damage</span>
                          <strong className="text-rose-700 dark:text-rose-400 font-mono text-xs tabular-nums">
                            {weapon.stats?.damage || 18} HP
                          </strong>
                        </div>
                        <div className="p-1 bg-white/70 dark:bg-black/40 rounded border border-slate-300 dark:border-zinc-800">
                          <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 block">Fire Rate</span>
                          <strong className="text-indigo-700 dark:text-indigo-400 font-mono text-xs tabular-nums">
                            {weapon.stats?.fireRate || 2.5}/s
                          </strong>
                        </div>
                        <div className="p-1 bg-white/70 dark:bg-black/40 rounded border border-slate-300 dark:border-zinc-800">
                          <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 block">Range</span>
                          <strong className="text-emerald-700 dark:text-emerald-400 font-mono text-xs tabular-nums">
                            {weapon.stats?.range || 400}m
                          </strong>
                        </div>
                      </div>

                      {weapon.stats?.specialEffect && (
                        <p className="text-[11px] text-slate-600 dark:text-zinc-400 font-medium">
                          <strong>Effect:</strong> {weapon.stats.specialEffect}
                        </p>
                      )}

                      {weapon.stats?.altFire && (
                        <p className="text-[11px] text-slate-600 dark:text-zinc-400 font-medium">
                          <strong>Alt-Fire:</strong> {weapon.stats.altFire.altName} ({weapon.stats.altFire.altDamage} DMG · {weapon.stats.altFire.altCooldownSeconds}s CD)
                        </p>
                      )}
                    </div>

                    <div>
                      {isEquipped ? (
                        <div className="w-full py-2 bg-emerald-100 dark:bg-emerald-950/80 border-2 border-emerald-500 text-emerald-900 dark:text-emerald-200 rounded-lg text-xs font-bold text-center flex items-center justify-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-300" />
                          <span>Equipped</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEquipWeapon(weapon.id)}
                          className="w-full py-2 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-bold cursor-pointer transition border-2 border-black"
                        >
                          Equip Weapon
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* MULTI-STAGE PACK OPENING ANIMATION & REVEAL OVERLAY */}
        <AnimatePresence>
          {packStage !== 'idle' && (
            <motion.div
              key="pack-opening-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-slate-950/75 flex items-center justify-center p-4"
            >
              {/* STAGE 1 & 2: SEALED PACK SHAKE + ENERGY BURST */}
              {(packStage === 'charging' || packStage === 'bursting') && openingPack && (() => {
                const packTheme = PACK_VISUAL_THEME[openingPack.packNumber];
                return (
                  <motion.div
                    key="pack-opening-envelope"
                    className="relative flex flex-col items-center justify-center max-w-sm w-full text-center space-y-5"
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={
                      packStage === 'charging'
                        ? {
                            scale: [0.96, 1.04, 0.98, 1.06, 1],
                            rotate: [0, -4, 4, -6, 6, -3, 3, 0],
                            opacity: 1
                          }
                        : {
                            scale: [1.05, 1.38],
                            opacity: [1, 0]
                          }
                    }
                    transition={
                      packStage === 'charging'
                        ? { duration: 1.05, repeat: Infinity, ease: 'easeInOut' }
                        : { duration: 0.32, ease: 'easeOut' }
                    }
                  >
                    {/* Burst Energy Ring (Compositor-only scale + opacity) */}
                    <motion.div
                      className={`absolute w-64 h-64 rounded-full pointer-events-none ${packTheme.burstBg}`}
                      animate={
                        packStage === 'charging'
                          ? { scale: [0.85, 1.12, 0.9], opacity: [0.35, 0.75, 0.35] }
                          : { scale: [1, 1.9], opacity: [0.9, 0] }
                      }
                      transition={
                        packStage === 'charging'
                          ? { duration: 0.9, repeat: Infinity, ease: 'easeInOut' }
                          : { duration: 0.32, ease: 'easeOut' }
                      }
                    />

                    {/* Sealed Booster Pack Foil Card */}
                    <div
                      className={`relative w-52 h-72 rounded-2xl bg-gradient-to-br ${packTheme.foilBg} border-4 ${packTheme.foilBorder} p-5 flex flex-col items-center justify-between shadow-lg`}
                    >
                      <div className="w-full flex items-center justify-between text-[11px] font-bold text-white/80">
                        <span>{openingPack.badge}</span>
                        <span>0653</span>
                      </div>

                      <div className="flex flex-col items-center justify-center space-y-3 my-auto">
                        <motion.div
                          animate={{ rotate: packStage === 'charging' ? [0, 8, -8, 0] : 0 }}
                          transition={{ duration: 0.45, repeat: Infinity }}
                          className="w-20 h-20 rounded-2xl bg-white/10 border border-white/25 flex items-center justify-center"
                        >
                          <Package className={`w-11 h-11 ${packTheme.foilAccent}`} />
                        </motion.div>
                        <div>
                          <p className="text-sm font-bold text-white text-center leading-snug">
                            {openingPack.name}
                          </p>
                          <p className={`text-[11px] font-semibold text-center mt-1 ${packTheme.foilAccent}`}>
                            {packTheme.tierTag}
                          </p>
                        </div>
                      </div>

                      <div className="w-full pt-2 border-t border-white/15 flex items-center justify-center gap-1.5 text-xs font-bold text-white/90">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{packStage === 'charging' ? 'Unsealing Pack...' : 'Revealing!'}</span>
                      </div>
                    </div>

                    <p className="relative text-sm font-bold text-white/95">
                      {packStage === 'charging'
                        ? 'Confirming pack & rolling rarity...'
                        : 'Opening reward!'}
                    </p>
                  </motion.div>
                );
              })()}

              {/* STAGE 3: REWARD REVEAL DIALOG */}
              {packStage === 'revealed' && pulledReward && (() => {
                const rarity = pulledReward.item.rarity;
                const accent = RARITY_REVEAL_ACCENT[rarity] || RARITY_REVEAL_ACCENT.common;
                const rankInfo = RARITY_RANK[rarity] || {
                  rank: 5,
                  label: rarity,
                  badgeClass: 'bg-slate-100 text-slate-800 border-slate-300'
                };

                return (
                  <motion.div
                    key="pack-revealed-card"
                    initial={{ scale: 0.76, rotateY: 55, opacity: 0 }}
                    animate={{ scale: 1, rotateY: 0, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                    className={`bg-white dark:bg-black border-2 ${accent.border} rounded-2xl overflow-hidden max-w-sm w-full shadow-xl text-center`}
                  >
                    {/* Top Rarity Header Strip */}
                    <div className={`px-5 py-3 flex items-center justify-between gap-2 ${accent.headerBg}`}>
                      <div className="flex items-center gap-2 text-sm font-bold">
                        <Sparkles className="w-4 h-4 shrink-0" />
                        <span>{isDuplicate ? 'Duplicate Pull' : 'New Unlock!'}</span>
                      </div>
                      <span className="text-xs font-bold tabular-nums">
                        {pulledReward.type === 'skin' ? 'Character Skin' : 'Arsenal Weapon'}
                      </span>
                    </div>

                    <div className="p-6 space-y-4">
                      {/* Item Preview Box */}
                      <div className="relative bg-[#FDFBF7] dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 flex flex-col items-center justify-center overflow-hidden">
                        <div className={`absolute w-32 h-32 rounded-full pointer-events-none ${accent.ring}`} />
                        <motion.div
                          initial={{ scale: 0.7, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.08, duration: 0.25 }}
                          className="relative"
                        >
                          {pulledReward.type === 'skin' ? (
                            <img
                              src={
                                pulledReward.item.portraitPath ||
                                pulledReward.item.spritePath ||
                                `/assets/characters/${pulledReward.item.id}.png`
                              }
                              alt={pulledReward.item.name}
                              className="w-24 h-24 object-contain pixelated mx-auto"
                            />
                          ) : (
                            <span className="text-5xl block">{pulledReward.item.icon}</span>
                          )}
                        </motion.div>

                        <h4 className="relative text-lg font-bold text-slate-900 dark:text-white mt-3 text-center">
                          {pulledReward.item.name}
                        </h4>
                        <span
                          className={`relative mt-1 text-xs px-2.5 py-0.5 rounded border whitespace-nowrap ${accent.pill}`}
                        >
                          Rank {rankInfo.rank} • {rankInfo.label}
                        </span>

                        {pulledReward.type === 'skin' ? (
                          <div className="relative flex items-center gap-3 text-xs text-slate-700 dark:text-slate-200 mt-3 bg-white/85 dark:bg-zinc-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 tabular-nums">
                            <span>Defense: <strong>{pulledReward.item.defense}/100</strong></span>
                            <span>•</span>
                            <span>Speed: <strong>{pulledReward.item.speed}/100</strong></span>
                          </div>
                        ) : (
                          <div className="relative flex flex-col items-center gap-1.5 mt-3">
                            <div className="flex items-center gap-3 text-xs text-slate-700 dark:text-slate-200 bg-white/85 dark:bg-zinc-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 tabular-nums">
                              <span>Damage: <strong>{pulledReward.item.stats?.damage || 16} HP</strong></span>
                              <span>•</span>
                              <span>Fire Rate: <strong>{pulledReward.item.stats?.fireRate || 2.5}/s</strong></span>
                            </div>
                            {pulledReward.item.stats?.altFire && (
                              <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                                Alt-Fire: {pulledReward.item.stats.altFire.altName}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {!isInstructor && (
                        <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 tabular-nums">
                          <Coins className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                          <span>Remaining Balance: {currentGold.toLocaleString()} Gold</span>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                        {pulledReward.type === 'skin' ? (
                          <button
                            onClick={() => {
                              handleEquipSkin(pulledReward.item.id);
                              dismissReveal();
                            }}
                            className="w-full sm:flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold cursor-pointer transition shadow-xs"
                          >
                            Equip Now
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              handleEquipWeapon(pulledReward.item.id);
                              dismissReveal();
                            }}
                            className="w-full sm:flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold cursor-pointer transition shadow-xs"
                          >
                            Equip Now
                          </button>
                        )}

                        <button
                          onClick={() => {
                            const targetTab = pulledReward.type === 'skin' ? 'collection' : 'armory';
                            setActiveTab(targetTab);
                            dismissReveal();
                          }}
                          className="w-full sm:flex-1 py-2.5 bg-[#EDE6D8] hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 border-2 border-black dark:border-zinc-700 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition shadow-xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View in {pulledReward.type === 'skin' ? 'Collection' : 'Armory'}</span>
                        </button>

                        <button
                          onClick={dismissReveal}
                          className="w-full sm:w-auto px-3.5 py-2.5 border-2 border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 rounded-lg text-xs font-bold hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
};
