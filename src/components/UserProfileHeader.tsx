import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Sparkles, 
  Coins, 
  Swords, 
  ShoppingBag, 
  ShieldAlert, 
  ShieldCheck, 
  Zap,
  Flame,
  Award,
  Lock,
  Layers
} from 'lucide-react';
import { UserProfile } from '../types';
import { 
  UserGameProfile, 
  subscribeToGameProfile, 
  calculateLevelFromXP, 
  SHOP_ITEMS,
  BattleEventState
} from '../services/firebaseGameService';
import { SCIENCE_SKIN_SVGS, SKIN_ALIASES } from '../data/spriteAtlasData';

interface UserProfileHeaderProps {
  user: UserProfile;
  theme?: 'dark' | 'light';
  battleState?: BattleEventState | null;
  onOpenShop?: () => void;
  onOpenCollection?: () => void;
  onOpenArena?: () => void;
  onOpenRoyale?: () => void;
  compact?: boolean;
}

export const UserProfileHeader: React.FC<UserProfileHeaderProps> = ({
  user,
  theme,
  battleState,
  onOpenShop,
  onOpenCollection,
  onOpenArena,
  onOpenRoyale,
  compact = false
}) => {
  const handleOpenRoyale = onOpenRoyale || onOpenArena;
  const [gameProfile, setGameProfile] = useState<UserGameProfile | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    const unsub = subscribeToGameProfile(user.id, (p) => {
      setGameProfile(p);
    });
    return () => unsub();
  }, [user?.id]);

  const levelInfo = calculateLevelFromXP(gameProfile?.xp ?? user?.xp ?? 0);
  const currentSkinId = gameProfile?.equippedSkin || gameProfile?.avatar || 'classic_chemist';
  const resolvedSkinId = SKIN_ALIASES[currentSkinId] || currentSkinId;
  const avatarSvg = SCIENCE_SKIN_SVGS[resolvedSkinId] || SCIENCE_SKIN_SVGS[currentSkinId];
  const equippedSkin = SHOP_ITEMS.find(i => i.id === currentSkinId || i.id === resolvedSkinId) || 
                       SHOP_ITEMS.find(i => i.id === 'classic_chemist') || 
                       SHOP_ITEMS[0];
  const equippedWp = SHOP_ITEMS.find(i => i.id === gameProfile?.equippedWeapon) || SHOP_ITEMS[6];

  const gold = gameProfile?.gold ?? 100;
  const wood = gameProfile?.wood ?? 20;
  const brick = gameProfile?.brick ?? 10;
  const metal = gameProfile?.metal ?? 5;
  const hasCrown = gameProfile?.monthlyCrown;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-xl backdrop-blur-md relative overflow-hidden transition-all duration-200">
      {/* Background Accent Ambient Glow */}
      <div className="absolute -top-10 -right-10 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4 relative z-10">
        
        {/* Left: Avatar, Level & XP Bar */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar Icon Frame */}
          <div className="relative group shrink-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-700 border-2 border-emerald-500/40 p-1 flex items-center justify-center shadow-lg shadow-emerald-500/10 transition-transform group-hover:scale-105 overflow-hidden">
              {avatarSvg ? (
                <img 
                  src={avatarSvg} 
                  alt={equippedSkin.name} 
                  className="w-10 h-12 object-contain" 
                  style={{ imageRendering: 'pixelated' }} 
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                    const fb = e.currentTarget.nextElementSibling as HTMLElement;
                    if (fb) fb.style.display = 'inline';
                  }}
                />
              ) : null}
              <span 
                className="text-2xl sm:text-3xl select-none" 
                role="img" 
                aria-label="avatar"
                style={{ display: avatarSvg ? 'none' : 'inline' }}
              >
                {equippedSkin.icon}
              </span>
            </div>
            {/* Level Pill */}
            <div className="absolute -bottom-1.5 -right-1 px-1.5 py-0.2 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black tracking-tight border border-slate-900 shadow-md">
              LV {levelInfo.level}
            </div>
            {/* Monthly Victory Crown badge */}
            {hasCrown && (
              <div 
                className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-[10px] shadow-lg animate-bounce border border-slate-900"
                title="Monthly Victory Crown Winner!"
              >
                👑
              </div>
            )}
          </div>

          {/* Name & Animated XP Progress */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm sm:text-base font-black text-white truncate tracking-tight">
                {user.name || 'Science Scholar'}
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300">
                {equippedSkin.name}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center gap-1">
                <span>{equippedWp.icon}</span>
                <span className="hidden sm:inline">{equippedWp.name}</span>
              </span>
            </div>

            {/* XP Bar */}
            <div className="mt-1.5 space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-semibold flex items-center gap-1">
                  <Zap className="w-3 h-3 text-emerald-400" />
                  XP: {levelInfo.currentLevelXp} / {levelInfo.nextLevelXp}
                </span>
                <span className="font-mono text-emerald-400 font-bold">
                  {levelInfo.progressPct}% to LV {levelInfo.level + 1}
                </span>
              </div>
              <div className="w-full sm:w-64 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/60">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500 shadow-sm shadow-emerald-500/50"
                  style={{ width: `${levelInfo.progressPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Center / Right: Gold, Materials (Wood, Brick, Metal) & Arena Actions */}
        <div className="flex items-center justify-between lg:justify-end gap-2 sm:gap-4 flex-wrap pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800">
          
          {/* Economy Counters: Gold & Materials */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* Gold Balance */}
            <div 
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 shadow-xs"
              title="Gold coins earned from revising slides & acing quizzes"
            >
              <Coins className="w-4 h-4 text-amber-400 animate-pulse" />
              <span className="font-black font-mono text-xs sm:text-sm">{gold}</span>
              <span className="text-[10px] text-amber-400/80 font-bold uppercase hidden sm:inline">Gold</span>
            </div>

            {/* Building Materials Badges */}
            <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
              {/* Wood */}
              <div 
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-900/30 text-amber-300 text-xs font-mono font-bold"
                title="Wood Materials (10 per Wood Wall)"
              >
                <span>🪵</span>
                <span>{wood}</span>
              </div>
              {/* Brick */}
              <div 
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-orange-950/40 text-orange-300 text-xs font-mono font-bold"
                title="Brick Materials (15 per High-Ground Ramp)"
              >
                <span>🧱</span>
                <span>{brick}</span>
              </div>
              {/* Metal */}
              <div 
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800/80 text-cyan-300 text-xs font-mono font-bold"
                title="Metal Materials (15 per Metal Bunker)"
              >
                <span>⚙️</span>
                <span>{metal}</span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons: Loadout Shop & Revision Royale */}
          <div className="flex items-center gap-2 shrink-0">
            {onOpenShop && (
              <button
                onClick={onOpenShop}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition shadow-xs hover:border-slate-600 active:scale-95 cursor-pointer"
                title="Open Avatar & Mystery Booster Packs Shop"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Avatar Shop</span>
                <span className="sm:hidden">Shop</span>
              </button>
            )}

            {onOpenCollection && (
              <button
                onClick={onOpenCollection}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition shadow-xs hover:border-slate-600 active:scale-95 cursor-pointer"
                title="View Personal Science Character Card Collection & Binder"
              >
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">My Collection</span>
                <span className="sm:hidden">Cards</span>
              </button>
            )}

            {handleOpenRoyale && (
              (user.role === 'instructor' || battleState?.status === 'IN_PROGRESS') ? (
                <button
                  onClick={handleOpenRoyale}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs transition shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer animate-pulse"
                  title="Battle Royale is Live! Join Match Now"
                >
                  <Swords className="w-3.5 h-3.5 text-white animate-spin-slow" />
                  <span>Royale (LIVE!)</span>
                </button>
              ) : (
                <button
                  onClick={handleOpenRoyale}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-400 text-xs font-bold transition hover:text-slate-300 hover:border-slate-700 cursor-pointer"
                  title="Battle Royale is locked until your instructor starts the match"
                >
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">Royale (Locked)</span>
                  <span className="sm:hidden">Locked</span>
                </button>
              )
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
