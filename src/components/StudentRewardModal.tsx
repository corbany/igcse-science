import React, { useMemo, useState } from 'react';
import {
  Check,
  Coins,
  Crosshair,
  Gift,
  Layers,
  Package,
  Search,
  Sparkles,
  X
} from 'lucide-react';
import {
  awardInstructorReward,
  InstructorRewardType,
  UserGameProfile
} from '../services/firebaseGameService';
import { ALL_FANTASY_SKINS } from '../data/fantasySkinsData';
import {
  ALL_WEAPON_ITEMS,
  BOOSTER_PACKS,
  RARITY_RANK,
  hasWeaponInInventory
} from '../data/gameCatalogData';
import { UserProfile } from '../types';

export interface RewardTargetStudent {
  studentId: string;
  name: string;
  email?: string;
}

interface StudentRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  targets: RewardTargetStudent[];
  instructor: UserProfile;
  studentProfiles?: Record<string, UserGameProfile>;
  initialRewardType?: InstructorRewardType;
  initialItemId?: string;
  onRewardSuccess?: (
    message: string,
    updatedProfiles: Record<string, UserGameProfile>
  ) => void;
}

const GOLD_PRESETS = [25, 50, 100, 250, 500];
const PACK_QTY_PRESETS = [1, 2, 3, 5];
const NOTE_PRESETS = [
  'Excellent quiz score',
  'Consistent revision progress',
  'Strong class contribution'
];

export const StudentRewardModal: React.FC<StudentRewardModalProps> = ({
  isOpen,
  onClose,
  targets,
  instructor,
  studentProfiles = {},
  initialRewardType = 'booster_pack',
  initialItemId,
  onRewardSuccess
}) => {
  const [rewardType, setRewardType] = useState<InstructorRewardType>(initialRewardType);
  const [selectedPackId, setSelectedPackId] = useState<string>(
    initialRewardType === 'booster_pack' && initialItemId
      ? initialItemId
      : BOOSTER_PACKS[0].id
  );
  const [packQuantity, setPackQuantity] = useState<number>(1);
  const [goldAmount, setGoldAmount] = useState<number>(100);
  const [selectedSkinId, setSelectedSkinId] = useState<string>(
    initialRewardType === 'skin' && initialItemId
      ? initialItemId
      : ALL_FANTASY_SKINS[1]?.id || ALL_FANTASY_SKINS[0].id
  );
  const [selectedWeaponId, setSelectedWeaponId] = useState<string>(
    initialRewardType === 'weapon' && initialItemId
      ? initialItemId
      : ALL_WEAPON_ITEMS[1]?.id || ALL_WEAPON_ITEMS[0].id
  );
  const [itemSearch, setItemSearch] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const singleTarget = targets.length === 1 ? targets[0] : null;
  const singleProfile = singleTarget ? studentProfiles[singleTarget.studentId] : undefined;

  const sortedSkins = useMemo(() => {
    const q = itemSearch.trim().toLowerCase();
    return [...ALL_FANTASY_SKINS]
      .filter(
        s =>
          !q ||
          s.name.toLowerCase().includes(q) ||
          s.rarity.toLowerCase().includes(q) ||
          (s.title || '').toLowerCase().includes(q)
      )
      .sort((a, b) => (RARITY_RANK[a.rarity]?.rank ?? 99) - (RARITY_RANK[b.rarity]?.rank ?? 99));
  }, [itemSearch]);

  const sortedWeapons = useMemo(() => {
    const q = itemSearch.trim().toLowerCase();
    return [...ALL_WEAPON_ITEMS]
      .filter(
        w =>
          !q ||
          w.name.toLowerCase().includes(q) ||
          w.rarity.toLowerCase().includes(q) ||
          (w.stats?.specialEffect || '').toLowerCase().includes(q)
      )
      .sort((a, b) => (RARITY_RANK[a.rarity]?.rank ?? 99) - (RARITY_RANK[b.rarity]?.rank ?? 99));
  }, [itemSearch]);

  if (!isOpen || targets.length === 0) return null;

  const selectedPack = BOOSTER_PACKS.find(p => p.id === selectedPackId) || BOOSTER_PACKS[0];
  const selectedSkin = ALL_FANTASY_SKINS.find(s => s.id === selectedSkinId) || ALL_FANTASY_SKINS[0];
  const selectedWeapon = ALL_WEAPON_ITEMS.find(w => w.id === selectedWeaponId) || ALL_WEAPON_ITEMS[0];

  const resolvedItemName =
    rewardType === 'booster_pack'
      ? selectedPack.name
      : rewardType === 'gold'
      ? `${goldAmount} Gold`
      : rewardType === 'skin'
      ? selectedSkin.name
      : selectedWeapon.name;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (rewardType === 'gold' && (!Number.isFinite(goldAmount) || goldAmount < 1 || goldAmount > 10000)) {
      setErrorMsg('Please enter a Gold amount between 1 and 10,000.');
      return;
    }

    if (rewardType === 'booster_pack' && (!Number.isFinite(packQuantity) || packQuantity < 1 || packQuantity > 20)) {
      setErrorMsg('Please choose between 1 and 20 packs.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await awardInstructorReward({
        targetStudents: targets,
        rewardType,
        packId: rewardType === 'booster_pack' ? selectedPack.id : undefined,
        quantity: rewardType === 'booster_pack' ? packQuantity : 1,
        goldAmount: rewardType === 'gold' ? goldAmount : undefined,
        skinId: rewardType === 'skin' ? selectedSkin.id : undefined,
        weaponId: rewardType === 'weapon' ? selectedWeapon.id : undefined,
        itemName: resolvedItemName,
        note: note.trim() || undefined,
        instructor: {
          id: instructor.id,
          name: instructor.name,
          email: instructor.email
        }
      });

      if (res.success) {
        onRewardSuccess?.(res.message, res.updatedProfiles);
        onClose();
      } else {
        setErrorMsg(res.message || 'Unable to grant reward.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Unexpected error granting reward.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-black border-2 border-black dark:border-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-xl text-slate-900 dark:text-slate-100">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 p-5 sm:p-6 border-b border-slate-200 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#EBF3F5] dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 flex items-center justify-center shrink-0">
              <Gift className="w-5 h-5 text-slate-900 dark:text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
                {singleTarget
                  ? `Award Reward to ${singleTarget.name}`
                  : `Award Reward to ${targets.length} Selected Students`}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 tabular-nums truncate">
                {singleProfile
                  ? `Level ${singleProfile.level} · ${singleProfile.gold} Gold · ${(singleProfile.unlockedSkins || ['cultist']).length}/19 Skins · ${ALL_WEAPON_ITEMS.filter(w => singleProfile.inventory.includes(w.id) || w.price === 0).length}/10 Weapons`
                  : singleTarget
                  ? singleTarget.email || 'Individual reward grant'
                  : targets.map(t => t.name).slice(0, 4).join(', ') + (targets.length > 4 ? ` +${targets.length - 4} more` : '')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-black dark:hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 text-xs font-semibold text-rose-800 dark:text-rose-200">
              {errorMsg}
            </div>
          )}

          {/* Reward Type Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block">
              Reward Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'booster_pack' as const, label: 'Booster Pack', icon: Package },
                { id: 'gold' as const, label: 'Gold Coins', icon: Coins },
                { id: 'skin' as const, label: 'Character Skin', icon: Layers },
                { id: 'weapon' as const, label: 'Weapon', icon: Crosshair }
              ].map((opt) => {
                const Icon = opt.icon;
                const active = rewardType === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setRewardType(opt.id);
                      setItemSearch('');
                      setErrorMsg(null);
                    }}
                    className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      active
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-black border-black dark:border-white'
                        : 'bg-[#FDFBF7] dark:bg-zinc-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-zinc-700 hover:border-slate-500'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* MODE 1: BOOSTER PACKS */}
          {rewardType === 'booster_pack' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {BOOSTER_PACKS.map((pack) => {
                  const isSelected = selectedPackId === pack.id;
                  const studentHas = singleProfile?.giftedPacks?.[pack.id] || 0;
                  return (
                    <button
                      key={pack.id}
                      type="button"
                      onClick={() => setSelectedPackId(pack.id)}
                      className={`text-left p-3.5 rounded-xl border transition cursor-pointer space-y-1.5 ${
                        isSelected
                          ? 'bg-[#EBF3F5] dark:bg-zinc-900 border-2 border-black dark:border-white'
                          : 'bg-white dark:bg-black border-slate-300 dark:border-zinc-800 hover:border-slate-500'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {pack.name}
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-slate-900 dark:text-white shrink-0" />}
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">
                        {pack.description}
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 tabular-nums pt-1">
                        <span>Store value: {pack.price} Gold</span>
                        {singleProfile && (
                          <span>Unopened: {studentHas}</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#FDFBF7] dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800">
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    Pack Quantity
                  </span>
                  <span className="text-[11px] text-slate-600 dark:text-slate-400">
                    Students can open gifted packs in the Shop at 0 Gold cost.
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {PACK_QTY_PRESETS.map((qty) => (
                    <button
                      key={qty}
                      type="button"
                      onClick={() => setPackQuantity(qty)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border tabular-nums cursor-pointer transition ${
                        packQuantity === qty
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-black border-black dark:border-white'
                          : 'bg-white dark:bg-black text-slate-700 dark:text-slate-300 border-slate-300 dark:border-zinc-700'
                      }`}
                    >
                      {qty}×
                    </button>
                  ))}
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={packQuantity}
                    onChange={(e) => setPackQuantity(Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
                    className="w-16 px-2 py-1.5 rounded-lg text-xs font-bold text-center tabular-nums bg-white dark:bg-black border border-slate-300 dark:border-zinc-700"
                  />
                </div>
              </div>
            </div>
          )}

          {/* MODE 2: GOLD COINS */}
          {rewardType === 'gold' && (
            <div className="space-y-3 p-4 rounded-xl bg-[#FDFBF7] dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-xs font-bold text-slate-900 dark:text-white">
                  Gold Amount to Award
                </label>
                {singleProfile && (
                  <span className="text-xs text-slate-600 dark:text-slate-400 tabular-nums">
                    Current: <strong className="text-slate-900 dark:text-white">{singleProfile.gold} Gold</strong> → New:{' '}
                    <strong className="text-emerald-700 dark:text-emerald-400">{singleProfile.gold + goldAmount} Gold</strong>
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {GOLD_PRESETS.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setGoldAmount(amt)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border tabular-nums cursor-pointer transition ${
                      goldAmount === amt
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-black border-black dark:border-white'
                        : 'bg-white dark:bg-black text-slate-700 dark:text-slate-300 border-slate-300 dark:border-zinc-700'
                    }`}
                  >
                    +{amt} Gold
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs text-slate-600 dark:text-slate-400">Custom amount:</span>
                <input
                  type="number"
                  min={1}
                  max={10000}
                  value={goldAmount}
                  onChange={(e) => setGoldAmount(Math.max(1, Math.min(10000, Number(e.target.value) || 0)))}
                  className="w-28 px-3 py-1.5 rounded-lg text-xs font-bold tabular-nums bg-white dark:bg-black border border-slate-300 dark:border-zinc-700"
                />
              </div>
            </div>
          )}

          {/* MODE 3: SKIN PICKER */}
          {rewardType === 'skin' && (
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={itemSearch}
                  onChange={(e) => setItemSearch(e.target.value)}
                  placeholder="Search 19 character skins by name or rarity..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-black border border-slate-300 dark:border-zinc-700"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto pr-1">
                {sortedSkins.map((skin) => {
                  const isSelected = selectedSkinId === skin.id;
                  const alreadyOwned = singleProfile
                    ? (singleProfile.unlockedSkins || ['cultist']).includes(skin.id) || skin.id === 'cultist'
                    : false;
                  const rankInfo = RARITY_RANK[skin.rarity];

                  return (
                    <button
                      key={skin.id}
                      type="button"
                      onClick={() => setSelectedSkinId(skin.id)}
                      className={`text-left p-2.5 rounded-xl border flex items-center gap-2.5 transition cursor-pointer ${
                        isSelected
                          ? 'bg-[#EBF3F5] dark:bg-zinc-900 border-2 border-black dark:border-white'
                          : 'bg-white dark:bg-black border-slate-200 dark:border-zinc-800 hover:border-slate-400'
                      }`}
                    >
                      <img
                        src={skin.portraitPath || skin.spritePath || `/assets/characters/${skin.id}.png`}
                        alt={skin.name}
                        className="w-10 h-10 rounded-lg object-contain bg-[#EDE6D8] dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 p-0.5 pixelated shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {skin.name}
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-slate-900 dark:text-white shrink-0" />}
                        </div>
                        <div className="text-[11px] text-slate-600 dark:text-slate-400 tabular-nums truncate">
                          {rankInfo?.label || skin.rarity} · DEF {skin.defense} · SPD {skin.speed}
                        </div>
                        {alreadyOwned && (
                          <div className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                            Already owned
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* MODE 4: WEAPON PICKER */}
          {rewardType === 'weapon' && (
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={itemSearch}
                  onChange={(e) => setItemSearch(e.target.value)}
                  placeholder="Search weapons by name or rarity..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-black border border-slate-300 dark:border-zinc-700"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
                {sortedWeapons.map((weapon) => {
                  const isSelected = selectedWeaponId === weapon.id;
                  const alreadyOwned = singleProfile
                    ? hasWeaponInInventory(singleProfile.inventory, weapon.id)
                    : false;
                  const rankInfo = RARITY_RANK[weapon.rarity];

                  return (
                    <button
                      key={weapon.id}
                      type="button"
                      onClick={() => setSelectedWeaponId(weapon.id)}
                      className={`text-left p-3 rounded-xl border flex items-start gap-2.5 transition cursor-pointer ${
                        isSelected
                          ? 'bg-[#EBF3F5] dark:bg-zinc-900 border-2 border-black dark:border-white'
                          : 'bg-white dark:bg-black border-slate-200 dark:border-zinc-800 hover:border-slate-400'
                      }`}
                    >
                      <span className="text-xl leading-none mt-0.5 shrink-0">{weapon.icon}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {weapon.name}
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-slate-900 dark:text-white shrink-0" />}
                        </div>
                        <div className="text-[11px] text-slate-600 dark:text-slate-400 tabular-nums">
                          {rankInfo?.label || weapon.rarity} · {weapon.stats?.damage || 18} DMG · {weapon.stats?.fireRate || 2.5}/s · {weapon.stats?.range || 400}m
                        </div>
                        {alreadyOwned && (
                          <div className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
                            Already in armory
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Optional Note */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Optional Note to Student{targets.length > 1 ? 's' : ''}
              </label>
              <div className="flex items-center gap-1.5 flex-wrap">
                {NOTE_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setNote(preset)}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-zinc-700 cursor-pointer transition"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Great improvement on your Chemistry quiz!"
              maxLength={140}
              className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-black border border-slate-300 dark:border-zinc-700"
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-black border border-slate-300 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-900 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-black border border-black dark:border-white flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {submitting
                  ? 'Sending Reward...'
                  : rewardType === 'booster_pack'
                  ? `Award ${packQuantity}× ${selectedPack.badge}`
                  : rewardType === 'gold'
                  ? `Award ${goldAmount} Gold`
                  : rewardType === 'skin'
                  ? `Award ${selectedSkin.name}`
                  : `Award ${selectedWeapon.name}`}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
