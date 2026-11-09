import React, { useState, useEffect } from 'react';
import { 
  Coins, 
  ShoppingBag, 
  Layers, 
  Gamepad2, 
  Lock, 
  Zap, 
  Check
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
  battleState,
  onOpenShop,
  onOpenCollection,
  onOpenArena,
  onOpenRoyale
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

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-xs font-sans text-slate-800">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
        
        {/* Left: Avatar, Level & XP Bar */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar Icon Frame */}
          <div className="relative shrink-0">
            <div className="w-12 h-12 rounded-xl bg-[#FDFBF7] border border-slate-300 p-1 flex items-center justify-center overflow-hidden">
              {avatarSvg ? (
                <img 
                  src={avatarSvg} 
                  alt={equippedSkin.name} 
                  className="w-10 h-10 object-contain pixelated" 
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                    const fb = e.currentTarget.nextElementSibling as HTMLElement;
                    if (fb) fb.style.display = 'inline';
                  }}
                />
              ) : null}
              <span 
                className="text-2xl select-none" 
                role="img" 
                aria-label="avatar"
                style={{ display: avatarSvg ? 'none' : 'inline' }}
              >
                {equippedSkin.icon}
              </span>
            </div>
            {/* Level Badge */}
            <div className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded bg-slate-800 text-white text-[10px] font-bold border border-slate-800">
              Lv {levelInfo.level}
            </div>
          </div>

          {/* Name & XP Progress */}
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm sm:text-base font-bold text-slate-800 truncate">
                {user.name || 'Science Scholar'}
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 border border-slate-300 text-slate-700">
                {equippedSkin.name}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#EBF3F5] border border-slate-300 text-slate-800 flex items-center gap-1">
                <span>{equippedWp.icon}</span>
                <span className="hidden sm:inline">{equippedWp.name}</span>
              </span>
            </div>

            {/* XP Bar */}
            <div className="space-y-0.5">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span className="font-semibold flex items-center gap-1">
                  <Zap className="w-3 h-3 text-slate-600" />
                  XP: {levelInfo.currentLevelXp} / {levelInfo.nextLevelXp}
                </span>
                <span className="font-semibold text-slate-800">
                  {levelInfo.progressPct}% to Level {levelInfo.level + 1}
                </span>
              </div>
              <div className="w-full sm:w-60 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-300">
                <div 
                  className="h-full bg-slate-800 rounded-full transition-all duration-300"
                  style={{ width: `${levelInfo.progressPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Center / Right: Gold, Materials & Actions */}
        <div className="flex items-center justify-between lg:justify-end gap-3 flex-wrap pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-200">
          
          {/* Economy Counters: Gold & Materials */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Gold Balance */}
            <div 
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FDFBF7] border border-slate-300 text-slate-800 text-xs font-bold"
              title="Gold coins earned from revising slides & acing quizzes"
            >
              <Coins className="w-4 h-4 text-amber-600" />
              <span>{gold} Gold</span>
            </div>

            {/* Building Materials Badges */}
            <div className="flex items-center gap-1 bg-[#FDFBF7] p-1 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700">
              <span title="Wood Materials">🪵 {wood}</span>
              <span className="text-slate-300">|</span>
              <span title="Brick Materials">🧱 {brick}</span>
              <span className="text-slate-300">|</span>
              <span title="Metal Materials">⚙️ {metal}</span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {onOpenShop && (
              <button
                onClick={onOpenShop}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-bold transition cursor-pointer"
                title="Open Avatar Shop"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-slate-700" />
                <span>Shop</span>
              </button>
            )}

            {onOpenCollection && (
              <button
                onClick={onOpenCollection}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-bold transition cursor-pointer"
                title="View Character Collection"
              >
                <Layers className="w-3.5 h-3.5 text-slate-700" />
                <span>Collection</span>
              </button>
            )}

            {handleOpenRoyale && (
              (user.role === 'instructor' || battleState?.status === 'IN_PROGRESS') ? (
                <button
                  onClick={handleOpenRoyale}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition cursor-pointer"
                  title="Battle Arena is Live"
                >
                  <Gamepad2 className="w-3.5 h-3.5 text-white" />
                  <span>Enter Arena (Live)</span>
                </button>
              ) : battleState?.isLobbyOpen ? (
                <button
                  onClick={handleOpenRoyale}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#EBF3F5] hover:bg-[#d8e9ec] text-slate-800 border border-slate-400 font-bold text-xs transition cursor-pointer"
                  title="Tournament Lobby is Open"
                >
                  <Gamepad2 className="w-3.5 h-3.5 text-slate-800" />
                  <span>Join Lobby</span>
                </button>
              ) : (
                <button
                  onClick={handleOpenRoyale}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-300 text-slate-600 text-xs font-semibold cursor-pointer hover:bg-slate-200"
                  title="Royale tournament lobby is closed until opened by your instructor"
                >
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Arena Closed</span>
                </button>
              )
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
