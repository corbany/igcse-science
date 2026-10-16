import React from 'react';
import { 
  Flame, 
  Target, 
  Award, 
  Crown, 
  Sparkles, 
  BookOpen, 
  Trophy, 
  Dna, 
  FlaskConical, 
  Zap, 
  Lock, 
  Check, 
  Star 
} from 'lucide-react';
import { StudentBadge, BadgeRarity } from '../types';

interface VirtualMedalBadgeProps {
  badge: StudentBadge;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showDetails?: boolean;
  isFeatured?: boolean;
  onSelectFeatured?: (badgeId: string) => void;
  onClick?: () => void;
}

export const VirtualMedalBadge: React.FC<VirtualMedalBadgeProps> = ({
  badge,
  size = 'md',
  showDetails = true,
  isFeatured = false,
  onSelectFeatured,
  onClick
}) => {
  const isUnlocked = !!badge.unlockedAt;

  // Icon selector
  const renderIcon = (className: string) => {
    switch (badge.icon) {
      case 'flame':
        return <Flame className={className} />;
      case 'target':
        return <Target className={className} />;
      case 'crown':
        return <Crown className={className} />;
      case 'sparkles':
        return <Sparkles className={className} />;
      case 'book':
        return <BookOpen className={className} />;
      case 'trophy':
        return <Trophy className={className} />;
      case 'dna':
        return <Dna className={className} />;
      case 'flask':
        return <FlaskConical className={className} />;
      case 'zap':
        return <Zap className={className} />;
      default:
        return <Award className={className} />;
    }
  };

  // Dimensions
  const dimensions = {
    sm: {
      medal: 'w-10 h-10',
      ribbon: 'w-6 h-3',
      icon: 'w-4 h-4',
      text: 'text-[10px]',
      title: 'text-xs',
      badgePadding: 'p-1.5'
    },
    md: {
      medal: 'w-16 h-16',
      ribbon: 'w-10 h-5',
      icon: 'w-7 h-7',
      text: 'text-xs',
      title: 'text-sm',
      badgePadding: 'p-3'
    },
    lg: {
      medal: 'w-24 h-24',
      ribbon: 'w-14 h-7',
      icon: 'w-11 h-11',
      text: 'text-xs',
      title: 'text-base',
      badgePadding: 'p-4'
    },
    xl: {
      medal: 'w-32 h-32',
      ribbon: 'w-20 h-10',
      icon: 'w-14 h-14',
      text: 'text-sm',
      title: 'text-lg',
      badgePadding: 'p-5'
    }
  }[size];

  // Rarity color palettes
  const rarityStyles: Record<BadgeRarity, {
    border: string;
    bgGradient: string;
    innerRing: string;
    glow: string;
    ribbon: string;
    accentText: string;
    tagBg: string;
  }> = {
    bronze: {
      border: 'border-amber-700/80',
      bgGradient: 'from-amber-700 via-amber-600 to-yellow-800',
      innerRing: 'border-amber-500/60',
      glow: 'shadow-amber-900/40',
      ribbon: 'from-amber-800 via-red-900 to-amber-800',
      accentText: 'text-amber-500 dark:text-amber-400',
      tagBg: 'bg-amber-950/40 text-amber-400 border-amber-800/40'
    },
    silver: {
      border: 'border-slate-300 dark:border-slate-400',
      bgGradient: 'from-slate-300 via-slate-100 to-slate-400 dark:from-slate-400 dark:via-slate-200 dark:to-slate-600',
      innerRing: 'border-white/80',
      glow: 'shadow-slate-400/30',
      ribbon: 'from-blue-900 via-indigo-700 to-blue-900',
      accentText: 'text-slate-600 dark:text-slate-300',
      tagBg: 'bg-slate-800/50 text-slate-300 border-slate-600/40'
    },
    gold: {
      border: 'border-yellow-400',
      bgGradient: 'from-amber-400 via-yellow-200 to-amber-600',
      innerRing: 'border-yellow-100/90',
      glow: 'shadow-yellow-500/50',
      ribbon: 'from-emerald-800 via-teal-700 to-emerald-800',
      accentText: 'text-amber-600 dark:text-yellow-400',
      tagBg: 'bg-amber-950/40 text-amber-300 border-yellow-500/40'
    },
    diamond: {
      border: 'border-cyan-300',
      bgGradient: 'from-cyan-300 via-sky-100 to-indigo-500',
      innerRing: 'border-white',
      glow: 'shadow-cyan-400/50',
      ribbon: 'from-violet-900 via-indigo-600 to-purple-900',
      accentText: 'text-cyan-500 dark:text-cyan-300',
      tagBg: 'bg-cyan-950/40 text-cyan-300 border-cyan-400/40'
    }
  };

  const style = rarityStyles[badge.rarity] || rarityStyles.bronze;

  return (
    <div 
      onClick={onClick}
      className={`group relative flex flex-col items-center rounded-2xl border transition-all duration-200 select-none ${dimensions.badgePadding} ${
        isUnlocked
          ? `bg-slate-900/70 dark:bg-slate-900/90 border-slate-700/80 hover:border-emerald-500/60 hover:shadow-lg ${style.glow} hover:-translate-y-0.5 cursor-pointer`
          : 'bg-slate-900/30 dark:bg-slate-950/40 border-slate-800/60 opacity-60 hover:opacity-80'
      } ${isFeatured ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-900 shadow-amber-500/30' : ''}`}
    >
      {/* Featured Star Ribbon */}
      {isFeatured && (
        <div className="absolute -top-2.5 right-2 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md z-20">
          <Star className="w-3 h-3 fill-slate-950" />
          <span>Featured</span>
        </div>
      )}

      {/* Ribbon Top */}
      <div className={`relative ${dimensions.ribbon} mb-1 flex justify-center overflow-hidden`}>
        <div className={`w-full h-full bg-gradient-to-r ${isUnlocked ? style.ribbon : 'from-slate-700 to-slate-800'} rounded-t-sm shadow-xs border-t border-x border-white/20 relative`}>
          <div className="absolute inset-x-1/2 -translate-x-1/2 inset-y-0 w-1/3 bg-white/20"></div>
          {/* V-cut ribbon tail */}
          <div className="absolute bottom-0 inset-x-0 h-1 bg-slate-900/80 dark:bg-slate-950 clip-ribbon"></div>
        </div>
      </div>

      {/* Round Virtual Medal Coin */}
      <div className="relative">
        <div
          className={`${dimensions.medal} rounded-full border-2 ${
            isUnlocked ? style.border : 'border-slate-700'
          } p-1 shadow-md transition-transform group-hover:scale-105 relative flex items-center justify-center`}
        >
          {/* Metallic Inner Disc */}
          <div
            className={`w-full h-full rounded-full bg-gradient-to-br ${
              isUnlocked ? style.bgGradient : 'from-slate-800 via-slate-700 to-slate-900'
            } flex items-center justify-center relative shadow-inner overflow-hidden`}
          >
            {/* Specular highlight glint */}
            {isUnlocked && (
              <>
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-white/40 rounded-full blur-xs pointer-events-none transform rotate-45"></div>
                <div className="absolute inset-1 rounded-full border border-dashed border-white/40 pointer-events-none"></div>
              </>
            )}

            {/* Medal Center Emblem */}
            <div className={`relative z-10 ${isUnlocked ? 'text-slate-950 drop-shadow-sm font-black' : 'text-slate-500'}`}>
              {isUnlocked ? (
                renderIcon(dimensions.icon)
              ) : (
                <Lock className={dimensions.icon} />
              )}
            </div>
          </div>
        </div>

        {/* Small Rarity Pill on bottom edge */}
        <span className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded-full text-[9px] font-extrabold uppercase tracking-wider border shadow-xs ${
          isUnlocked ? style.tagBg : 'bg-slate-800 text-slate-500 border-slate-700'
        }`}>
          {badge.rarity}
        </span>
      </div>

      {/* Badge Information & Description */}
      {showDetails && (
        <div className="mt-3.5 text-center w-full flex flex-col items-center">
          <h4 className={`font-bold tracking-tight text-white line-clamp-1 ${dimensions.title}`}>
            {badge.title}
          </h4>
          <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2 max-w-[180px] leading-tight">
            {badge.description}
          </p>

          {/* XP & Status Pill */}
          <div className="mt-2 flex items-center gap-1.5 text-[11px]">
            <span className="font-mono font-bold text-amber-400">
              +{badge.xpReward} XP
            </span>
            <span className="text-slate-600">•</span>
            {isUnlocked ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                <Check className="w-3 h-3" />
                <span>Earned</span>
              </span>
            ) : (
              <span className="text-slate-500 font-medium">
                {badge.progress?.label || 'In progress'}
              </span>
            )}
          </div>

          {/* Progress bar for locked badges */}
          {!isUnlocked && badge.progress && (
            <div className="w-full mt-2 bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ 
                  width: `${Math.min(100, Math.round((badge.progress.current / (badge.progress.max || 1)) * 100))}%` 
                }}
              />
            </div>
          )}

          {/* Feature Badge Button */}
          {isUnlocked && onSelectFeatured && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectFeatured(badge.id);
              }}
              className={`mt-2.5 w-full py-1 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 ${
                isFeatured 
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700'
              }`}
            >
              <Star className="w-3 h-3" />
              <span>{isFeatured ? 'Current Featured' : 'Set as Featured'}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
