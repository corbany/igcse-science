import React from 'react';
import { 
  Flame, 
  Target, 
  Award, 
  BookOpen, 
  Trophy, 
  Sparkles, 
  Crown, 
  Gem, 
  Medal, 
  CheckCircle2, 
  Dna, 
  FlaskConical, 
  Zap,
  Star,
  Check,
  Shield
} from 'lucide-react';
import { StudentBadge, BadgeRarity, BadgeCategory } from '../types';

interface MedalTierIconProps {
  rarity: BadgeRarity;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
  className?: string;
  category?: BadgeCategory;
}

/**
 * Visual medal tier icon for Diamond, Gold, Silver, and Bronze
 */
export const MedalTierIcon: React.FC<MedalTierIconProps> = ({
  rarity,
  size = 'sm',
  showLabel = false,
  className = '',
  category
}) => {
  const sizeMap = {
    xs: { icon: 'w-2.5 h-2.5', container: 'w-4 h-4 text-[8px]' },
    sm: { icon: 'w-3.5 h-3.5', container: 'w-6 h-6 text-[10px]' },
    md: { icon: 'w-4.5 h-4.5', container: 'w-8 h-8 text-xs' },
    lg: { icon: 'w-6 h-6', container: 'w-10 h-10 text-sm' },
    xl: { icon: 'w-8 h-8', container: 'w-14 h-14 text-base' }
  }[size];

  const tierConfig: Record<BadgeRarity, {
    label: string;
    containerClass: string;
    iconClass: string;
    symbol: string;
    border: string;
    glow: string;
    ribbonClass: string;
  }> = {
    diamond: {
      label: 'Diamond',
      containerClass: 'bg-gradient-to-tr from-cyan-400 via-sky-200 to-indigo-500 text-slate-950 shadow-cyan-500/40',
      iconClass: 'text-slate-950 fill-cyan-100',
      symbol: '💎',
      border: 'border-cyan-300 ring-1 ring-cyan-400/50',
      glow: 'shadow-md shadow-cyan-500/30',
      ribbonClass: 'bg-cyan-500'
    },
    gold: {
      label: 'Gold',
      containerClass: 'bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-600 text-slate-950 shadow-amber-500/40',
      iconClass: 'text-slate-950 fill-yellow-100',
      symbol: '🥇',
      border: 'border-yellow-300 ring-1 ring-amber-400/50',
      glow: 'shadow-md shadow-yellow-500/30',
      ribbonClass: 'bg-amber-500'
    },
    silver: {
      label: 'Silver',
      containerClass: 'bg-gradient-to-tr from-slate-300 via-white to-slate-400 text-slate-900 shadow-slate-400/30',
      iconClass: 'text-slate-900 fill-slate-200',
      symbol: '🥈',
      border: 'border-slate-300 ring-1 ring-slate-400/40',
      glow: 'shadow-md shadow-slate-400/20',
      ribbonClass: 'bg-slate-400'
    },
    bronze: {
      label: 'Bronze',
      containerClass: 'bg-gradient-to-tr from-amber-800 via-amber-600 to-amber-900 text-white shadow-amber-900/40',
      iconClass: 'text-white fill-amber-300',
      symbol: '🥉',
      border: 'border-amber-600 ring-1 ring-amber-700/50',
      glow: 'shadow-md shadow-amber-900/20',
      ribbonClass: 'bg-amber-800'
    }
  };

  const config = tierConfig[rarity] || tierConfig.bronze;

  const renderIcon = () => {
    if (rarity === 'diamond') {
      return <Gem className={sizeMap.icon} />;
    }
    if (category === 'streak') {
      return <Flame className={sizeMap.icon} />;
    }
    if (category === 'quiz') {
      return <Target className={sizeMap.icon} />;
    }
    if (category === 'topic_module') {
      return <BookOpen className={sizeMap.icon} />;
    }
    return <Medal className={sizeMap.icon} />;
  };

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <div 
        title={`${config.label} Medal`}
        className={`rounded-full flex items-center justify-center font-black shrink-0 border ${config.border} ${config.containerClass} ${sizeMap.container} ${config.glow} transition-transform hover:scale-110`}
      >
        {renderIcon()}
      </div>
      {showLabel && (
        <span className="font-bold text-xs capitalize text-slate-200">
          {config.label}
        </span>
      )}
    </div>
  );
};

interface MedalCountsSummaryProps {
  badges: StudentBadge[];
  size?: 'xs' | 'sm' | 'md';
  className?: string;
  showZeroes?: boolean;
}

/**
 * Breakdown summary of earned medals by type (Diamond, Gold, Silver, Bronze)
 */
export const MedalCountsSummary: React.FC<MedalCountsSummaryProps> = ({
  badges = [],
  size = 'sm',
  className = '',
  showZeroes = true
}) => {
  const counts = React.useMemo(() => {
    const res = { diamond: 0, gold: 0, silver: 0, bronze: 0, total: 0 };
    badges.forEach(b => {
      if (b.unlockedAt) {
        if (b.rarity in res) {
          res[b.rarity as keyof typeof res]++;
          res.total++;
        }
      }
    });
    return res;
  }, [badges]);

  return (
    <div className={`flex flex-wrap items-center gap-1.5 sm:gap-2 ${className}`}>
      {/* Diamond */}
      {(showZeroes || counts.diamond > 0) && (
        <div 
          title={`${counts.diamond} Diamond Medals Earned`}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-cyan-950/40 border border-cyan-500/40 text-cyan-300 font-mono text-xs shadow-xs"
        >
          <MedalTierIcon rarity="diamond" size="xs" />
          <span className="font-black">{counts.diamond}</span>
        </div>
      )}

      {/* Gold */}
      {(showZeroes || counts.gold > 0) && (
        <div 
          title={`${counts.gold} Gold Medals Earned`}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-300 font-mono text-xs shadow-xs"
        >
          <MedalTierIcon rarity="gold" size="xs" />
          <span className="font-black">{counts.gold}</span>
        </div>
      )}

      {/* Silver */}
      {(showZeroes || counts.silver > 0) && (
        <div 
          title={`${counts.silver} Silver Medals Earned`}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900/60 border border-slate-500/40 text-slate-200 font-mono text-xs shadow-xs"
        >
          <MedalTierIcon rarity="silver" size="xs" />
          <span className="font-black">{counts.silver}</span>
        </div>
      )}

      {/* Bronze */}
      {(showZeroes || counts.bronze > 0) && (
        <div 
          title={`${counts.bronze} Bronze Medals Earned`}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-950/30 border border-amber-800/40 text-amber-400 font-mono text-xs shadow-xs"
        >
          <MedalTierIcon rarity="bronze" size="xs" />
          <span className="font-black">{counts.bronze}</span>
        </div>
      )}
    </div>
  );
};

interface StudentMedalStripProps {
  badges: StudentBadge[];
  compact?: boolean;
  showCategoryBreakdown?: boolean;
  className?: string;
  onClick?: () => void;
}

/**
 * Dynamic horizontal medal badge strip displaying earned medal icons for streaks, 
 * module completions, and quiz performance.
 */
export const StudentMedalStrip: React.FC<StudentMedalStripProps> = ({
  badges = [],
  compact = false,
  showCategoryBreakdown = true,
  className = '',
  onClick
}) => {
  const earned = React.useMemo(() => badges.filter(b => !!b.unlockedAt), [badges]);

  const { tierCounts, categoryCounts } = React.useMemo(() => {
    const tiers = { diamond: 0, gold: 0, silver: 0, bronze: 0 };
    const cats = { streak: 0, topic_module: 0, quiz: 0, milestone: 0 };
    
    earned.forEach(b => {
      if (b.rarity in tiers) tiers[b.rarity as keyof typeof tiers]++;
      if (b.category in cats) cats[b.category as keyof typeof cats]++;
    });

    return { tierCounts: tiers, categoryCounts: cats };
  }, [earned]);

  if (compact) {
    return (
      <div 
        onClick={onClick}
        title={`Earned Medals: ${tierCounts.diamond} Diamond, ${tierCounts.gold} Gold, ${tierCounts.silver} Silver, ${tierCounts.bronze} Bronze • ${categoryCounts.streak} Streaks, ${categoryCounts.topic_module} Modules, ${categoryCounts.quiz} Quizzes`}
        className={`inline-flex items-center gap-2 select-none ${className}`}
      >
        {/* Tier medal icons with counts */}
        <div className="flex items-center gap-1 bg-slate-950/70 px-2 py-0.5 rounded-lg border border-slate-800/80">
          {tierCounts.diamond > 0 && (
            <span className="inline-flex items-center gap-0.5 text-[10px] text-cyan-300 font-mono font-bold">
              <MedalTierIcon rarity="diamond" size="xs" />
              <span>{tierCounts.diamond}</span>
            </span>
          )}
          {tierCounts.gold > 0 && (
            <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-300 font-mono font-bold">
              <MedalTierIcon rarity="gold" size="xs" />
              <span>{tierCounts.gold}</span>
            </span>
          )}
          {tierCounts.silver > 0 && (
            <span className="inline-flex items-center gap-0.5 text-[10px] text-slate-300 font-mono font-bold">
              <MedalTierIcon rarity="silver" size="xs" />
              <span>{tierCounts.silver}</span>
            </span>
          )}
          {tierCounts.bronze > 0 && (
            <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-500 font-mono font-bold">
              <MedalTierIcon rarity="bronze" size="xs" />
              <span>{tierCounts.bronze}</span>
            </span>
          )}
          {earned.length === 0 && (
            <span className="text-[10px] text-slate-500 font-mono">0 Medals</span>
          )}
        </div>

        {/* Category icons with counts */}
        {showCategoryBreakdown && earned.length > 0 && (
          <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
            {categoryCounts.streak > 0 && (
              <span className="inline-flex items-center gap-0.5 text-amber-400 font-bold" title={`${categoryCounts.streak} Streak Medals`}>
                <Flame className="w-3 h-3 fill-amber-400" />
                <span>{categoryCounts.streak}</span>
              </span>
            )}
            {categoryCounts.topic_module > 0 && (
              <span className="inline-flex items-center gap-0.5 text-indigo-400 font-bold" title={`${categoryCounts.topic_module} Module Completion Medals`}>
                <BookOpen className="w-3 h-3" />
                <span>{categoryCounts.topic_module}</span>
              </span>
            )}
            {categoryCounts.quiz > 0 && (
              <span className="inline-flex items-center gap-0.5 text-emerald-400 font-bold" title={`${categoryCounts.quiz} Quiz Mastery Medals`}>
                <Target className="w-3 h-3" />
                <span>{categoryCounts.quiz}</span>
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-wrap items-center justify-between gap-3 ${className}`}>
      {/* Tiers Breakdown */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Medals:</span>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-cyan-300 font-mono font-bold" title="Diamond Medals">
            <MedalTierIcon rarity="diamond" size="xs" />
            <span>{tierCounts.diamond}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-amber-300 font-mono font-bold" title="Gold Medals">
            <MedalTierIcon rarity="gold" size="xs" />
            <span>{tierCounts.gold}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-300 font-mono font-bold" title="Silver Medals">
            <MedalTierIcon rarity="silver" size="xs" />
            <span>{tierCounts.silver}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-amber-500 font-mono font-bold" title="Bronze Medals">
            <MedalTierIcon rarity="bronze" size="xs" />
            <span>{tierCounts.bronze}</span>
          </div>
        </div>
      </div>

      {/* Categories Breakdown */}
      {showCategoryBreakdown && (
        <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-slate-800/80 pt-2 sm:pt-0 sm:pl-3 text-xs">
          <div className="flex items-center gap-1 text-amber-400 font-bold" title="Streak Medals">
            <Flame className="w-3.5 h-3.5 fill-amber-400" />
            <span>{categoryCounts.streak} Streaks</span>
          </div>
          <div className="flex items-center gap-1 text-indigo-400 font-bold" title="Topic Module Medals">
            <BookOpen className="w-3.5 h-3.5" />
            <span>{categoryCounts.topic_module} Modules</span>
          </div>
          <div className="flex items-center gap-1 text-emerald-400 font-bold" title="Quiz Performance Medals">
            <Target className="w-3.5 h-3.5" />
            <span>{categoryCounts.quiz} Quizzes</span>
          </div>
        </div>
      )}
    </div>
  );
};

interface MiniMedalPillProps {
  badge: StudentBadge;
  onClick?: () => void;
  showCategoryIcon?: boolean;
  className?: string;
}

/**
 * Compact medal pill with icon, medal tier styling, and title
 */
export const MiniMedalPill: React.FC<MiniMedalPillProps> = ({
  badge,
  onClick,
  showCategoryIcon = true,
  className = ''
}) => {
  const isUnlocked = !!badge.unlockedAt;

  // Category Icon
  const getCategoryIcon = (cat: BadgeCategory, iconClass: string) => {
    switch (cat) {
      case 'streak':
        return <Flame className={`${iconClass} text-amber-400 fill-amber-400`} />;
      case 'quiz':
        return <Target className={`${iconClass} text-emerald-400`} />;
      case 'topic_module':
        if (badge.subject === 'biology') return <Dna className={`${iconClass} text-emerald-400`} />;
        if (badge.subject === 'chemistry') return <FlaskConical className={`${iconClass} text-teal-400`} />;
        if (badge.subject === 'physics') return <Zap className={`${iconClass} text-indigo-400`} />;
        return <BookOpen className={`${iconClass} text-purple-400`} />;
      default:
        return <Award className={`${iconClass} text-amber-400`} />;
    }
  };

  const rarityBorder = {
    diamond: 'border-cyan-400/50 bg-cyan-950/40 text-cyan-200 hover:border-cyan-300 shadow-cyan-950/50',
    gold: 'border-yellow-400/50 bg-amber-950/40 text-amber-200 hover:border-yellow-300 shadow-amber-950/50',
    silver: 'border-slate-400/50 bg-slate-900/70 text-slate-200 hover:border-slate-300 shadow-slate-900/50',
    bronze: 'border-amber-700/50 bg-amber-950/30 text-amber-300 hover:border-amber-600 shadow-amber-950/40'
  }[badge.rarity] || 'border-slate-700 text-slate-300';

  return (
    <div
      onClick={onClick}
      title={`${badge.title} (${badge.rarity.toUpperCase()} Medal) - ${badge.description}`}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs transition cursor-pointer select-none ${rarityBorder} ${
        !isUnlocked ? 'opacity-50 grayscale' : 'shadow-xs hover:scale-102'
      } ${className}`}
    >
      <MedalTierIcon rarity={badge.rarity} size="xs" category={badge.category} />
      {showCategoryIcon && getCategoryIcon(badge.category, 'w-3 h-3')}
      <span className="font-semibold truncate max-w-[130px]">{badge.title}</span>
    </div>
  );
};

interface DynamicCategoryMedalGroupProps {
  title: string;
  category: 'streak' | 'topic_module' | 'quiz';
  badges: StudentBadge[];
  onBadgeClick?: (badge: StudentBadge) => void;
  className?: string;
}

/**
 * Dynamic row group for a specific badge achievement category
 * (Revision Streaks, Topic Module Completions, Quiz Performance)
 */
export const DynamicCategoryMedalGroup: React.FC<DynamicCategoryMedalGroupProps> = ({
  title,
  category,
  badges,
  onBadgeClick,
  className = ''
}) => {
  const earnedBadges = React.useMemo(() => {
    return badges.filter(b => b.category === category && !!b.unlockedAt);
  }, [badges, category]);

  const lockedCount = React.useMemo(() => {
    return badges.filter(b => b.category === category && !b.unlockedAt).length;
  }, [badges, category]);

  const categoryMeta = {
    streak: {
      icon: <Flame className="w-5 h-5 text-amber-400 fill-amber-400" />,
      color: 'text-amber-400',
      bgColor: 'bg-gradient-to-r from-amber-950/20 via-slate-900 to-amber-950/10 border-amber-500/30',
      badgeDesc: 'Earned by maintaining consecutive days of active revision'
    },
    topic_module: {
      icon: <BookOpen className="w-5 h-5 text-indigo-400" />,
      color: 'text-indigo-400',
      bgColor: 'bg-gradient-to-r from-indigo-950/20 via-slate-900 to-indigo-950/10 border-indigo-500/30',
      badgeDesc: 'Earned by completing all subtopics in Cambridge science modules'
    },
    quiz: {
      icon: <Target className="w-5 h-5 text-emerald-400" />,
      color: 'text-emerald-400',
      bgColor: 'bg-gradient-to-r from-emerald-950/20 via-slate-900 to-emerald-950/10 border-emerald-500/30',
      badgeDesc: 'Earned by achieving Green Light (>=80%) and high scores on quizzes'
    }
  }[category];

  return (
    <div className={`p-4 sm:p-5 rounded-2xl border ${categoryMeta.bgColor} space-y-3.5 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 shadow-inner">
            {categoryMeta.icon}
          </div>
          <div>
            <h4 className={`text-sm sm:text-base font-black ${categoryMeta.color} tracking-wide flex items-center gap-2`}>
              <span>{title}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300">
                {earnedBadges.length} Earned
              </span>
            </h4>
            <p className="text-[11px] text-slate-400">{categoryMeta.badgeDesc}</p>
          </div>
        </div>

        {/* Medal counts for this category with distinct icons */}
        {earnedBadges.length > 0 && (
          <MedalCountsSummary badges={earnedBadges} size="sm" />
        )}
      </div>

      {/* Badges List */}
      {earnedBadges.length > 0 ? (
        <div className="flex flex-wrap gap-2 pt-1">
          {earnedBadges.map(badge => (
            <MiniMedalPill
              key={badge.id}
              badge={badge}
              onClick={() => onBadgeClick && onBadgeClick(badge)}
            />
          ))}
        </div>
      ) : (
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <span>No medals earned in this category yet. Start revising to unlock!</span>
          <span className="text-[11px] font-mono text-slate-500">{lockedCount} medals available</span>
        </div>
      )}
    </div>
  );
};
