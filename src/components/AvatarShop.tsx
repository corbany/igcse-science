import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  Zap,
  Shield,
  Activity,
  Flame,
  Eye
} from 'lucide-react';
import { UserProfile } from '../types';
import { 
  ItemRarity, 
  UserGameProfile, 
  subscribeToGameProfile,
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
  ALL_WEAPON_ITEMS
} from '../data/gameCatalogData';

export type { BoosterPackConfig };
export { BOOSTER_PACKS, RARITY_RANK, ALL_WEAPON_ITEMS };

export type SkinCard = FantasySkinDefinition;
export const ALL_SKIN_CARDS: SkinCard[] = ALL_FANTASY_SKINS;

export type BoosterReward = 
  | { type: 'skin'; item: SkinCard }
  | { type: 'weapon'; item: ShopItem };

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

  playReveal(rarity: ItemRarity) {
    this.initCtx();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const notes = rarity === 'mythic' 
      ? [523.25, 659.25, 783.99, 1046.50]
      : rarity === 'legendary' 
      ? [440, 554.37, 659.25, 880]
      : [392, 493.88, 587.33];

    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.1);
      gain.gain.setValueAtTime(0.2, t + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, t + idx * 0.1 + 0.35);
      osc.start(t + idx * 0.1);
      osc.stop(t + idx * 0.1 + 0.35);
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
  const [pulledReward, setPulledReward] = useState<BoosterReward | null>(null);
  const [isDuplicate, setIsDuplicate] = useState<boolean>(false);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    if (!user?.id) return;
    const unsub = subscribeToGameProfile(user.id, (profile) => {
      setGameProfile(profile);
    });
    return () => unsub();
  }, [user?.id]);

  const currentGold = gameProfile?.gold ?? 100;
  const unlockedSkins = gameProfile?.unlockedSkins ?? ['cultist'];
  const equippedSkin = gameProfile?.equippedSkin ?? 'cultist';
  const equippedWeapon = gameProfile?.equippedWeapon ?? 'wpn_starter_blaster';
  const inventory = gameProfile?.inventory ?? ['wpn_starter_blaster', 'bunsen_burner', 'cultist'];
  const giftedPacks = gameProfile?.giftedPacks ?? {};
  const totalGiftedPacks = useMemo(
    () => Object.values(giftedPacks).reduce((sum, count) => sum + Math.max(0, Number(count) || 0), 0),
    [giftedPacks]
  );
  const recentRewards = useMemo(
    () => [...(gameProfile?.rewardHistory || [])].reverse().slice(0, 6),
    [gameProfile?.rewardHistory]
  );
  const isInstructor = user?.role === 'instructor';

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
    return ALL_WEAPON_ITEMS.filter(w => inventory.includes(w.id) || w.id === 'wpn_starter_blaster' || w.id === 'bunsen_burner').length;
  }, [isInstructor, inventory]);

  const rollRarity = (odds: BoosterPackConfig['odds']): ItemRarity => {
    const rand = Math.random() * 100;
    if (rand < odds.mythic) return 'mythic';
    if (rand < odds.mythic + odds.legendary) return 'legendary';
    if (rand < odds.mythic + odds.legendary + odds.epic) return 'epic';
    if (rand < odds.mythic + odds.legendary + odds.epic + odds.rare) return 'rare';
    return 'common';
  };

  const handleOpenPack = async (pack: BoosterPackConfig, useGiftedOverride?: boolean) => {
    if (!user?.id) return;
    const giftedAvailable = Math.max(0, Number(giftedPacks[pack.id] || 0));
    const useGiftedPack = useGiftedOverride ?? giftedAvailable > 0;

    if (useGiftedPack && giftedAvailable <= 0) {
      setFeedback('No gifted packs of this tier available.');
      return;
    }

    if (!useGiftedPack && !isInstructor && currentGold < pack.price) {
      setFeedback(`You need ${pack.price} Gold to open this pack.`);
      return;
    }

    setIsProcessing(true);
    setFeedback(null);

    try {
      const rolledRarity = rollRarity(pack.odds);
      const isSkinDrop = Math.random() < 0.65;

      let reward: BoosterReward;
      let duplicate = false;

      if (isSkinDrop) {
        let matchingSkins = ALL_SKIN_CARDS.filter(s => s.rarity === rolledRarity);
        if (matchingSkins.length === 0) matchingSkins = ALL_SKIN_CARDS;
        const selected = matchingSkins[Math.floor(Math.random() * matchingSkins.length)];
        reward = { type: 'skin', item: selected };
        duplicate = unlockedSkins.includes(selected.id) || selected.id === 'cultist';
      } else {
        let matchingWeapons = ALL_WEAPON_ITEMS.filter(w => w.rarity === rolledRarity);
        if (matchingWeapons.length === 0) matchingWeapons = ALL_WEAPON_ITEMS;
        const selected = matchingWeapons[Math.floor(Math.random() * matchingWeapons.length)];
        reward = { type: 'weapon', item: selected };
        duplicate = inventory.includes(selected.id) || selected.id === 'wpn_starter_blaster' || selected.id === 'bunsen_burner';
      }

      const txResult = await openBoosterPackTransaction(user.id, {
        packId: pack.id,
        packPrice: pack.price,
        useGiftedPack,
        unlockedItemId: reward.item.id,
        unlockedItemType: reward.type,
        isInstructor
      });

      if (!txResult.success) {
        setFeedback(txResult.error || 'Could not open booster pack. Please try again.');
        return;
      }

      if (txResult.profile) {
        setGameProfile(txResult.profile);
      }

      setPulledReward(reward);
      setIsDuplicate(duplicate);
      packSfx.playReveal(reward.item.rarity);
    } catch (e) {
      console.error('Failed to open pack:', e);
      setFeedback('Error opening pack. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEquipSkin = async (skinId: string) => {
    if (!user?.id) return;
    setGameProfile(prev => prev ? ({ ...prev, equippedSkin: skinId, avatar: skinId }) : prev);
    const localKey = `igcse_game_profile_${user.id}`;
    try {
      const cached = getLocalGameItem<any>(localKey, {});
      setLocalGameItem(localKey, { ...cached, equippedSkin: skinId, avatar: skinId });
    } catch (e) {}

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
      const cached = getLocalGameItem<any>(localKey, {});
      setLocalGameItem(localKey, { ...cached, equippedWeapon: weaponId });
    } catch (e) {}

    try {
      await equipItem(user.id, 'weapon', weaponId);
      setFeedback('Equipped weapon successfully.');
    } catch (err) {
      console.warn('Error equipping weapon:', err);
      setFeedback('Equipped weapon successfully.');
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-12 font-sans text-slate-800">
      
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-slate-700" />
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                Character and Arsenal Shop
              </h1>
            </div>
            <p className="text-base text-slate-600 mt-1">
              Unlock science avatars, customize your sprite loadout, and equip weapons for the Battle Royale arena.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Gold Balance Card */}
            <div className="bg-[#FDFBF7] border border-slate-300 rounded-lg px-4 py-2 text-center">
              <span className="block text-xs font-semibold text-slate-600">Your Balance</span>
              <div className="flex items-center justify-center gap-1.5 text-lg font-bold text-slate-800">
                <Coins className="w-4 h-4 text-amber-600" />
                <span>{currentGold} Gold</span>
              </div>
            </div>

            {onNavigateToArena && (isInstructor || battleState?.status === 'IN_PROGRESS') && (
              <button
                onClick={onNavigateToArena}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-bold flex items-center gap-2 cursor-pointer transition"
              >
                <span>Enter Arena</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {handleClose && (
              <button
                onClick={handleClose}
                className="p-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 cursor-pointer"
                title="Back to Study"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className="mt-4 p-3 rounded-lg bg-[#EBF3F5] border border-slate-300 text-slate-800 text-sm font-semibold flex items-center justify-between">
            <span>{feedback}</span>
            <button onClick={() => setFeedback(null)} className="text-slate-600 hover:text-black">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Navigation Tabs with Icons and Text Labels */}
        <div className="mt-6 pt-4 border-t border-slate-200 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('shop')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold border transition cursor-pointer ${
              activeTab === 'shop'
                ? 'bg-slate-800 text-white border-slate-800'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Booster Packs{totalGiftedPacks > 0 ? ` (${totalGiftedPacks} Free)` : ''}</span>
          </button>

          <button
            onClick={() => setActiveTab('collection')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold border transition cursor-pointer ${
              activeTab === 'collection'
                ? 'bg-slate-800 text-white border-slate-800'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>My Characters ({unlockedSkinsCount} / {ALL_SKIN_CARDS.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('armory')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold border transition cursor-pointer ${
              activeTab === 'armory'
                ? 'bg-slate-800 text-white border-slate-800'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
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
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-emerald-700 shrink-0" />
                <div className="text-sm">
                  <span className="font-bold">
                    You have {totalGiftedPacks} free Gifted Booster Pack{totalGiftedPacks === 1 ? '' : 's'} awarded by your instructor.
                  </span>
                  <span className="text-emerald-800 ml-1.5">Open them below at no Gold cost.</span>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {BOOSTER_PACKS.map((pack) => {
              const giftedCount = Math.max(0, Number(giftedPacks[pack.id] || 0));
              const canAfford = currentGold >= pack.price;

              return (
                <div
                  key={pack.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-400 transition"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-600 tabular-nums">
                        {pack.badge}{giftedCount > 0 ? ` · ${giftedCount} Free Gifted` : ''}
                      </span>
                      <span className="text-base font-bold text-slate-800 tabular-nums">
                        {pack.price} Gold
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-slate-800">
                        {pack.name}
                      </h3>
                      <p className="text-sm text-slate-600 mt-1">
                        {pack.description}
                      </p>
                    </div>

                    {/* Clean Drop Rates Bullet Points */}
                    <div className="bg-[#FDFBF7] border border-slate-200 rounded-lg p-3 text-xs text-slate-700">
                      <p className="font-bold text-slate-800 mb-1">Rarity odds:</p>
                      <ul className="grid grid-cols-2 gap-1 tabular-nums">
                        <li>Common: {pack.odds.common}%</li>
                        <li>Rare: {pack.odds.rare}%</li>
                        <li>Epic: {pack.odds.epic}%</li>
                        <li>Legendary: {pack.odds.legendary}%</li>
                      </ul>
                    </div>
                  </div>

                  {/* Open Pack Action Buttons */}
                  <div className="space-y-2">
                    {giftedCount > 0 && (
                      <button
                        onClick={() => handleOpenPack(pack, true)}
                        disabled={isProcessing}
                        className="w-full py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition bg-emerald-700 hover:bg-emerald-600 text-white"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Open Free Gifted Pack ({giftedCount} left)</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleOpenPack(pack, false)}
                      disabled={(!canAfford && !isInstructor) || isProcessing}
                      className={`w-full py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition ${
                        canAfford || isInstructor
                          ? giftedCount > 0
                            ? 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-300'
                            : 'bg-slate-800 hover:bg-slate-700 text-white'
                          : 'bg-slate-100 text-slate-400 border border-slate-300 cursor-not-allowed'
                      }`}
                    >
                      <Package className="w-4 h-4" />
                      <span>{canAfford || isInstructor ? `Open Pack for ${pack.price} Gold` : `Requires ${pack.price} Gold`}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {recentRewards.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Recent Rewards from Your Instructor</h3>
                <span className="text-xs text-slate-500 tabular-nums">{recentRewards.length} recent</span>
              </div>
              <div className="divide-y divide-slate-200">
                {recentRewards.map((rec) => (
                  <div key={rec.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 truncate">
                        {rec.rewardType === 'gold'
                          ? `+${rec.quantity} Gold`
                          : rec.rewardType === 'booster_pack'
                          ? `${rec.quantity}× ${rec.itemName}`
                          : rec.itemName}
                      </p>
                      <p className="text-slate-500 truncate">
                        Awarded by {rec.awardedBy}{rec.note ? ` · "${rec.note}"` : ''}
                      </p>
                    </div>
                    <span className="text-slate-500 tabular-nums shrink-0">
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
              const rankInfo = RARITY_RANK[card.rarity] || { rank: 5, label: card.rarity, badgeClass: 'bg-slate-100 text-slate-800 border-slate-300' };

              if (!isUnlocked) {
                // HIDDEN LOCKED SKIN
                return (
                  <div
                    key={card.id}
                    className="bg-white dark:bg-black border-2 border-slate-300 dark:border-zinc-800 rounded-xl p-4 shadow-xs flex flex-col justify-between space-y-3 opacity-90"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          Undiscovered Champion
                        </span>
                        <span className={`text-[11px] px-2 py-0.5 rounded border ${rankInfo.badgeClass}`}>
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
                          🔒 Undiscovered {card.rarity.charAt(0).toUpperCase() + card.rarity.slice(1)} Skin
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

              // UNLOCKED SKIN: Fully visible with high-res portrait, attributes, ability & equip action
              return (
                <div
                  key={card.id}
                  className="bg-white dark:bg-black border-2 border-black dark:border-zinc-700 rounded-xl p-4 shadow-xs flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 border border-emerald-400">
                          ✓ Unlocked
                        </span>
                        <span className="text-xs font-bold text-slate-600 dark:text-zinc-400">
                          {card.subject || 'Science'}
                        </span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded border ${rankInfo.badgeClass}`}>
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

                    {/* Skin Attributes: Defense and Speed */}
                    <div className="bg-[#EDE6D8] dark:bg-zinc-900/80 border border-slate-300 dark:border-zinc-800 rounded-lg p-2.5 text-xs space-y-1.5">
                      <div>
                        <div className="flex items-center justify-between text-slate-800 dark:text-zinc-200 font-bold mb-0.5">
                          <span className="flex items-center gap-1">
                            <Shield className="w-3 h-3 text-indigo-700" />
                            <span>Defense</span>
                          </span>
                          <span className="font-mono">{card.defense}/100</span>
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
                            <Activity className="w-3 h-3 text-emerald-700" />
                            <span>Speed</span>
                          </span>
                          <span className="font-mono">{card.speed}/100</span>
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
              const isOwned = isInstructor || inventory.includes(weapon.id) || weapon.price === 0 || weapon.id === 'wpn_starter_blaster' || weapon.id === 'bunsen_burner';
              const isEquipped = equippedWeapon === weapon.id;
              const rankInfo = RARITY_RANK[weapon.rarity] || { rank: 5, label: weapon.rarity, badgeClass: 'bg-slate-100 text-slate-800 border-slate-300' };

              if (!isOwned) {
                // HIDDEN LOCKED WEAPON
                return (
                  <div
                    key={weapon.id}
                    className="bg-white dark:bg-black border-2 border-slate-300 dark:border-zinc-800 rounded-xl p-4 shadow-xs flex flex-col justify-between space-y-3 opacity-90"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          Undiscovered Weapon
                        </span>
                        <span className={`text-[11px] px-2 py-0.5 rounded border ${rankInfo.badgeClass}`}>
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
                          🔒 Undiscovered {weapon.rarity.charAt(0).toUpperCase() + weapon.rarity.slice(1)} Weapon
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

              // UNLOCKED WEAPON: Fully visible with icon, attributes, and equip option
              return (
                <div
                  key={weapon.id}
                  className="bg-white dark:bg-black border-2 border-black dark:border-zinc-700 rounded-xl p-4 shadow-xs flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{weapon.icon}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 border border-emerald-400">
                          ✓ Unlocked
                        </span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded border ${rankInfo.badgeClass}`}>
                        Rank {rankInfo.rank} • {rankInfo.label}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">{weapon.name}</h3>
                      <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">{weapon.description}</p>
                    </div>

                    {/* Weapon Attributes: Damage, Fire Rate, Range */}
                    <div className="bg-[#EDE6D8] dark:bg-zinc-900/80 border border-slate-300 dark:border-zinc-800 rounded-lg p-2.5 text-xs text-slate-800 dark:text-zinc-200 grid grid-cols-3 gap-2 text-center">
                      <div className="p-1 bg-white/70 dark:bg-black/40 rounded border border-slate-300 dark:border-zinc-800">
                        <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-400 block">Damage</span>
                        <strong className="text-rose-700 dark:text-rose-400 font-mono text-xs">{weapon.stats?.damage || 18} HP</strong>
                      </div>
                      <div className="p-1 bg-white/70 dark:bg-black/40 rounded border border-slate-300 dark:border-zinc-800">
                        <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-400 block">Fire Rate</span>
                        <strong className="text-indigo-700 dark:text-indigo-400 font-mono text-xs">{weapon.stats?.fireRate || 2.5}/s</strong>
                      </div>
                      <div className="p-1 bg-white/70 dark:bg-black/40 rounded border border-slate-300 dark:border-zinc-800">
                        <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-400 block">Range</span>
                        <strong className="text-emerald-700 dark:text-emerald-400 font-mono text-xs">{weapon.stats?.range || 400}m</strong>
                      </div>
                    </div>

                    {weapon.stats?.specialEffect && (
                      <p className="text-[11px] text-slate-600 dark:text-zinc-400 font-medium">
                        <strong>Effect:</strong> {weapon.stats.specialEffect}
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

      {/* Reward Reveal Dialog */}
      {pulledReward && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-xl p-6 max-w-sm w-full space-y-4 shadow-md text-center">
            <h3 className="text-xl font-bold text-slate-800">
              {isDuplicate ? 'Duplicate Item' : 'New Unlock!'}
            </h3>

            <div className="bg-[#FDFBF7] border border-slate-200 rounded-lg p-4 flex flex-col items-center justify-center">
              {pulledReward.type === 'skin' ? (
                <img 
                  src={pulledReward.item.portraitPath || pulledReward.item.spritePath || `/assets/characters/${pulledReward.item.id}.png`}
                  alt={pulledReward.item.name}
                  className="w-24 h-24 object-contain pixelated"
                />
              ) : (
                <span className="text-5xl">{pulledReward.item.icon}</span>
              )}
              <h4 className="text-base font-bold text-slate-800 mt-2">{pulledReward.item.name}</h4>
              <span className="text-xs text-slate-600 font-semibold">
                Rank {RARITY_RANK[pulledReward.item.rarity]?.rank || 5} • {pulledReward.item.rarity}
              </span>
              {pulledReward.type === 'skin' ? (
                <div className="flex items-center gap-3 text-xs text-slate-700 mt-2 bg-white/80 px-3 py-1 rounded-lg border border-slate-200">
                  <span>Defense: <strong>{pulledReward.item.defense}/100</strong></span>
                  <span>•</span>
                  <span>Speed: <strong>{pulledReward.item.speed}/100</strong></span>
                </div>
              ) : (
                <div className="flex items-center gap-3 text-xs text-slate-700 mt-2 bg-white/80 px-3 py-1 rounded-lg border border-slate-200">
                  <span>Damage: <strong>{pulledReward.item.stats?.damage || 18} HP</strong></span>
                  <span>•</span>
                  <span>Fire Rate: <strong>{pulledReward.item.stats?.fireRate || 2.5}/s</strong></span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
              {pulledReward.type === 'skin' ? (
                <button
                  onClick={() => {
                    handleEquipSkin(pulledReward.item.id);
                    setPulledReward(null);
                  }}
                  className="w-full sm:flex-1 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold cursor-pointer transition shadow-xs"
                >
                  Equip Now
                </button>
              ) : (
                <button
                  onClick={() => {
                    handleEquipWeapon(pulledReward.item.id);
                    setPulledReward(null);
                  }}
                  className="w-full sm:flex-1 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold cursor-pointer transition shadow-xs"
                >
                  Equip Now
                </button>
              )}

              <button
                onClick={() => {
                  setActiveTab(pulledReward.type === 'skin' ? 'collection' : 'armory');
                  setPulledReward(null);
                }}
                className="w-full sm:flex-1 py-2 bg-[#EDE6D8] hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 border-2 border-black dark:border-zinc-700 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition shadow-xs"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View in {pulledReward.type === 'skin' ? 'Collection' : 'Armory'}</span>
              </button>

              <button
                onClick={() => setPulledReward(null)}
                className="w-full sm:w-auto px-3.5 py-2 border-2 border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 rounded-lg text-xs font-bold hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
