import React, { useState, useEffect, useMemo } from 'react';
import { 
  UserProfile, 
  StudentProgress, 
  LeaderboardEntry, 
  StudentBadge, 
  BadgeRarity 
} from '../types';
import { getClassStudentLeaderboard, ClassLeaderboardData } from '../services/rankingService';
import { fetchStudentEnrolledClasses, ClassItem, DEFAULT_CLASS_ITEM } from '../services/firestoreService';
import { calculateStudentLevel } from '../services/badgeService';
import { 
  Trophy, 
  Crown, 
  Medal, 
  Award, 
  Flame, 
  Target, 
  BookOpen, 
  Users, 
  Star, 
  Sparkles, 
  Lock, 
  ShieldCheck, 
  RefreshCw, 
  Search, 
  User,
  Check, 
  Copy, 
  Info, 
  ChevronRight,
  ExternalLink,
  ShieldAlert,
  Dna,
  FlaskConical,
  Zap
} from 'lucide-react';
import { 
  MedalTierIcon, 
  MedalCountsSummary, 
  MiniMedalPill,
  StudentMedalStrip,
  DynamicCategoryMedalGroup
} from './MedalTypeBadge';

interface StudentLeaderboardProps {
  user: UserProfile;
  progress: StudentProgress;
  enrolledClassIds?: string[];
  onNavigateToLessons?: (subtopicCode?: string) => void;
  onNavigateToQuizzes?: (topicCode?: string) => void;
  onNavigateToProfile?: () => void;
}

export const StudentLeaderboard: React.FC<StudentLeaderboardProps> = ({
  user,
  progress,
  enrolledClassIds = [],
  onNavigateToLessons,
  onNavigateToQuizzes,
  onNavigateToProfile
}) => {
  const [enrolledClasses, setEnrolledClasses] = useState<ClassItem[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>(
    enrolledClassIds[0] || DEFAULT_CLASS_ITEM.id
  );
  const [sortBy, setSortBy] = useState<'quizScore' | 'badges' | 'xp' | 'streak'>('quizScore');
  const [tierFilter, setTierFilter] = useState<'all' | 'Extended' | 'Core'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);

  const [leaderboardData, setLeaderboardData] = useState<ClassLeaderboardData>({
    entries: [],
    topThree: [],
    totalClassBadges: 0,
    totalClassQuizScore: 0,
    totalCompetitors: 0
  });

  const [inspectedStudent, setInspectedStudent] = useState<LeaderboardEntry | null>(null);
  const [inspectedBadgeCategory, setInspectedBadgeCategory] = useState<'all' | 'streak' | 'topic_module' | 'quiz'>('all');

  // Load student's enrolled classes
  useEffect(() => {
    let isMounted = true;
    async function loadClasses() {
      try {
        const classes = await fetchStudentEnrolledClasses(user.id);
        if (isMounted) {
          setEnrolledClasses(classes);
          if (classes.length > 0 && !classes.some(c => c.id === selectedClassId)) {
            setSelectedClassId(classes[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load classes for leaderboard:', err);
      }
    }
    loadClasses();
    return () => { isMounted = false; };
  }, [user.id]);

  // Load class-aggregated leaderboard
  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const data = await getClassStudentLeaderboard(selectedClassId, user, progress);
      setLeaderboardData(data);
    } catch (err) {
      console.error('Failed to load class leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaderboard();
  }, [selectedClassId, user.id, progress]);

  // Filtered and sorted leaderboard list
  const sortedEntries = useMemo(() => {
    let list = [...leaderboardData.entries];

    // Filter by tier
    if (tierFilter !== 'all') {
      list = list.filter(e => e.tier === tierFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(e => e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q));
    }

    // Sort according to selected metric
    if (sortBy === 'badges') {
      list.sort((a, b) => b.badgesCount - a.badgesCount || (b.totalQuizScore || 0) - (a.totalQuizScore || 0) || b.xp - a.xp);
    } else if (sortBy === 'streak') {
      list.sort((a, b) => b.streakDays - a.streakDays || (b.totalQuizScore || 0) - (a.totalQuizScore || 0));
    } else if (sortBy === 'xp') {
      list.sort((a, b) => b.xp - a.xp || (b.totalQuizScore || 0) - (a.totalQuizScore || 0));
    } else {
      // Primary: Total Quiz Score
      list.sort((a, b) => (b.totalQuizScore || 0) - (a.totalQuizScore || 0) || b.badgesCount - a.badgesCount || b.xp - a.xp);
    }

    // Re-assign rank numbers based on filtered sort
    return list.map((item, idx) => ({
      ...item,
      rank: idx + 1
    }));
  }, [leaderboardData.entries, sortBy, tierFilter, searchQuery]);

  // Active student current entry & competitor right ahead
  const currentUserEntry = sortedEntries.find(e => e.isCurrentUser);
  const topThreeList = sortedEntries.slice(0, 3);
  const competitorAhead = currentUserEntry && currentUserEntry.rank > 1 
    ? sortedEntries[currentUserEntry.rank - 2] 
    : null;

  const currentClass = enrolledClasses.find(c => c.id === selectedClassId) || 
                       leaderboardData.classItem || 
                       DEFAULT_CLASS_ITEM;

  const handleCopyClassCode = () => {
    if (currentClass?.classCode) {
      navigator.clipboard.writeText(currentClass.classCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const getRarityBadgeStyle = (rarity?: BadgeRarity) => {
    switch (rarity) {
      case 'diamond':
        return 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40';
      case 'gold':
        return 'bg-amber-950/80 text-amber-300 border-amber-500/40';
      case 'silver':
        return 'bg-slate-800 text-slate-200 border-slate-600';
      default:
        return 'bg-amber-900/30 text-amber-400 border-amber-800/40';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. HERO HEADER WITH CLASS SELECTOR & AGGREGATE TOTALS */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/70 to-slate-900 border border-slate-800 p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-inner">
                <Trophy className="w-5 h-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Class Leaderboard
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400/15 text-amber-300 border border-amber-400/30">
                {currentClass.name}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Track your rank and celebrate achievements with your classmates! Standings are determined by
              <strong className="text-white font-semibold"> total badges earned</strong> and 
              <strong className="text-white font-semibold"> cumulative quiz scores</strong>.
            </p>
          </div>

          {/* Class Switcher & Refresh controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            {enrolledClasses.length > 1 && (
              <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
                >
                  {enrolledClasses.map(c => (
                    <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                      {c.name} ({c.classCode})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={handleCopyClassCode}
              title="Copy class join code to share with classmates"
              className="px-3 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-mono font-semibold text-slate-300 hover:text-white transition flex items-center justify-center gap-1.5"
            >
              {copiedCode ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>{currentClass.classCode}</span>
                </>
              )}
            </button>

            <button
              onClick={loadLeaderboard}
              disabled={loading}
              title="Refresh live leaderboard standings"
              className="p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition flex items-center justify-center"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* CLASS AGGREGATE SUMMARY STATS PILLS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800/80 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Classmates</span>
              <span className="text-sm font-mono font-black text-white">{sortedEntries.length} Enrolled</span>
            </div>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800/80 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Total Badges</span>
              <span className="text-sm font-mono font-black text-amber-300">{leaderboardData.totalClassBadges} Earned</span>
            </div>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800/80 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Total Quiz Score</span>
              <span className="text-sm font-mono font-black text-emerald-400">{leaderboardData.totalClassQuizScore} Pts</span>
            </div>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800/80 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Syllabus</span>
              <span className="text-sm font-mono font-black text-cyan-300">0653 Combined</span>
            </div>
          </div>
        </div>

        {/* PRIVACY GUARANTEE BANNER */}
        <div className="mt-4 p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-start sm:items-center gap-3 text-xs text-emerald-300">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5 sm:mt-0">
            <Lock className="w-3.5 h-3.5" />
          </div>
          <div className="flex-1">
            <strong className="font-bold text-white">Student Privacy Protected: </strong>
            <span>
              To foster healthy encouragement and protect privacy, 
              <strong> individual quiz averages and accuracy percentages are kept strictly confidential</strong>. 
              Only aggregated badges and total quiz scores earned are visible.
            </span>
          </div>
        </div>

        {/* CURRENT USER RANK SPOTLIGHT BANNER */}
        {currentUserEntry && (
          <div className="mt-5 pt-5 border-t border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 p-0.5 shadow-lg flex items-center justify-center shrink-0">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex flex-col items-center justify-center text-amber-400">
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 leading-none">Rank</span>
                  <span className="text-xl font-black leading-none mt-0.5">#{currentUserEntry.rank}</span>
                </div>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-white">
                    You are in <strong className="text-amber-400 font-black">#{currentUserEntry.rank} Place</strong> in {currentClass.name}
                  </span>
                  {currentUserEntry.rank === 1 ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950 uppercase tracking-wider flex items-center gap-1 shadow-sm">
                      <Crown className="w-3 h-3 fill-slate-950" />
                      <span>Class Champion</span>
                    </span>
                  ) : competitorAhead ? (
                    <span className="text-xs text-slate-400">
                      • {(competitorAhead.totalQuizScore || 0) - (currentUserEntry.totalQuizScore || 0) + 1} quiz points behind {competitorAhead.name}
                    </span>
                  ) : null}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 mt-1">
                  <span className="flex items-center gap-1">
                    <Target className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Your Total Quiz Score: <strong className="text-white font-mono">{currentUserEntry.totalQuizScore || 0} pts</strong></span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    <span>Badges: <strong className="text-white font-mono">{currentUserEntry.badgesCount}</strong></span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>Streak: <strong className="text-white font-mono">{currentUserEntry.streakDays}d</strong></span>
                  </span>
                </div>

                {/* Dynamic earned virtual badges strip for current user */}
                <div className="mt-2.5">
                  <StudentMedalStrip 
                    badges={currentUserEntry.unlockedBadges || []} 
                    compact={false}
                    showCategoryBreakdown={true}
                  />
                </div>
              </div>
            </div>

            {/* Private Student Stat Badge (visible only to current user) */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {currentUserEntry.quizAccuracy !== undefined && (
                <div 
                  title="Your personal quiz average is private to you and hidden from classmates"
                  className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 flex items-center gap-1.5"
                >
                  <Lock className="w-3 h-3 text-emerald-400" />
                  <span>My Private Accuracy:</span>
                  <strong className="text-emerald-400 font-mono font-bold">{currentUserEntry.quizAccuracy}%</strong>
                </div>
              )}

              {onNavigateToProfile && (
                <button
                  onClick={onNavigateToProfile}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs transition flex items-center gap-1.5 border border-slate-700 shadow-sm"
                  title="View your student profile, recent activity, and earned medals"
                >
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                  <span>My Profile & Recent Activity</span>
                </button>
              )}

              {onNavigateToQuizzes && (
                <button
                  onClick={() => onNavigateToQuizzes()}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-sm"
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>Take Quiz (+Points)</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 2. TOP 3 HONOR PODIUM */}
      {topThreeList.length >= 3 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8">
          <div className="text-center max-w-sm mx-auto mb-6">
            <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Class Honor Podium</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </h3>
            <p className="text-xs text-slate-400">Leading classmates ranked by total quiz scores & earned badges</p>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-6 items-end max-w-2xl mx-auto pt-4 pb-2">
            {/* 2nd Place (Silver) */}
            <div 
              onClick={() => topThreeList[1] && setInspectedStudent(topThreeList[1])}
              className="flex flex-col items-center cursor-pointer group"
            >
              <div className="relative mb-2">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-slate-400 to-slate-200 p-0.5 shadow-lg flex items-center justify-center group-hover:scale-105 transition">
                  <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-white font-black text-lg sm:text-xl">
                    {topThreeList[1]?.name.charAt(0) || '2'}
                  </div>
                </div>
                <div className="absolute -top-2.5 -right-2 px-1.5 py-0.5 rounded-full bg-slate-300 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-0.5">
                  <Medal className="w-3 h-3 fill-slate-950" />
                  <span>#2</span>
                </div>
              </div>
              <p className="font-bold text-xs sm:text-sm text-white truncate max-w-[90px] sm:max-w-[120px] text-center group-hover:text-amber-300 transition">
                {topThreeList[1]?.name}
              </p>
              <p className="font-mono text-xs text-emerald-400 font-bold mt-0.5">
                {topThreeList[1]?.totalQuizScore || 0} Quiz Pts
              </p>
              <div className="mt-1 flex flex-col items-center">
                <span className="text-[10px] text-slate-300 font-bold mb-0.5">
                  {topThreeList[1]?.badgesCount || 0} Medals
                </span>
                <StudentMedalStrip 
                  badges={topThreeList[1]?.unlockedBadges || []} 
                  compact={true} 
                  showCategoryBreakdown={false}
                />
              </div>

              {/* Podium Step */}
              <div className="w-full h-20 sm:h-24 bg-gradient-to-t from-slate-800 to-slate-700/80 rounded-t-2xl border-t-2 border-slate-400 flex flex-col items-center justify-center text-slate-300 text-xs font-bold mt-2 shadow-inner">
                <span className="text-lg font-black text-slate-200">2nd</span>
                <span className="text-[10px] text-slate-400">Silver</span>
              </div>
            </div>

            {/* 1st Place (Gold Champion) */}
            <div 
              onClick={() => topThreeList[0] && setInspectedStudent(topThreeList[0])}
              className="flex flex-col items-center cursor-pointer group"
            >
              <Crown className="w-6 h-6 text-amber-400 fill-amber-400 animate-bounce mb-1" />
              <div className="relative mb-2">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-600 p-1 shadow-xl shadow-amber-500/20 flex items-center justify-center group-hover:scale-105 transition">
                  <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-amber-400 font-black text-xl sm:text-2xl">
                    {topThreeList[0]?.name.charAt(0) || '1'}
                  </div>
                </div>
                <div className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-md flex items-center gap-0.5">
                  <Crown className="w-3 h-3 fill-slate-950" />
                  <span>#1</span>
                </div>
              </div>
              <p className="font-black text-xs sm:text-base text-amber-300 truncate max-w-[100px] sm:max-w-[140px] text-center">
                {topThreeList[0]?.name}
              </p>
              <p className="font-mono text-xs sm:text-sm text-emerald-400 font-black mt-0.5">
                {topThreeList[0]?.totalQuizScore || 0} Quiz Pts
              </p>
              <div className="mt-1 flex flex-col items-center">
                <span className="text-[10px] text-amber-300 font-bold mb-0.5">
                  {topThreeList[0]?.badgesCount || 0} Medals
                </span>
                <StudentMedalStrip 
                  badges={topThreeList[0]?.unlockedBadges || []} 
                  compact={true} 
                  showCategoryBreakdown={false}
                />
              </div>

              {/* Podium Step */}
              <div className="w-full h-28 sm:h-32 bg-gradient-to-t from-amber-950/60 via-slate-800 to-amber-900/40 rounded-t-2xl border-t-2 border-amber-400 flex flex-col items-center justify-center text-amber-300 text-xs font-bold mt-2 shadow-lg shadow-amber-950/50">
                <span className="text-2xl font-black text-amber-300">1st</span>
                <span className="text-[10px] text-amber-400 uppercase font-black tracking-wider">Champion</span>
              </div>
            </div>

            {/* 3rd Place (Bronze) */}
            <div 
              onClick={() => topThreeList[2] && setInspectedStudent(topThreeList[2])}
              className="flex flex-col items-center cursor-pointer group"
            >
              <div className="relative mb-2">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-amber-700 to-amber-500 p-0.5 shadow-lg flex items-center justify-center group-hover:scale-105 transition">
                  <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-white font-black text-lg sm:text-xl">
                    {topThreeList[2]?.name.charAt(0) || '3'}
                  </div>
                </div>
                <div className="absolute -top-2.5 -right-2 px-1.5 py-0.5 rounded-full bg-amber-700 text-white text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-0.5">
                  <Medal className="w-3 h-3" />
                  <span>#3</span>
                </div>
              </div>
              <p className="font-bold text-xs sm:text-sm text-white truncate max-w-[90px] sm:max-w-[120px] text-center group-hover:text-amber-300 transition">
                {topThreeList[2]?.name}
              </p>
              <p className="font-mono text-xs text-emerald-400 font-bold mt-0.5">
                {topThreeList[2]?.totalQuizScore || 0} Quiz Pts
              </p>
              <div className="mt-1 flex flex-col items-center">
                <span className="text-[10px] text-amber-400 font-bold mb-0.5">
                  {topThreeList[2]?.badgesCount || 0} Medals
                </span>
                <StudentMedalStrip 
                  badges={topThreeList[2]?.unlockedBadges || []} 
                  compact={true} 
                  showCategoryBreakdown={false}
                />
              </div>

              {/* Podium Step */}
              <div className="w-full h-16 sm:h-20 bg-gradient-to-t from-slate-800 to-amber-950/40 rounded-t-2xl border-t-2 border-amber-600 flex flex-col items-center justify-center text-amber-500 text-xs font-bold mt-2 shadow-inner">
                <span className="text-base font-black text-amber-400">3rd</span>
                <span className="text-[10px] text-amber-600">Bronze</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. FULL CLASS LEADERBOARD TABLE & FILTER CONTROLS */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-black text-white tracking-tight">Class Standings</h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-300">
              {sortedEntries.length} Students
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Sort Metric Selector */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setSortBy('quizScore')}
                className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                  sortBy === 'quizScore' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Target className="w-3.5 h-3.5" />
                <span>Total Quiz Score</span>
              </button>

              <button
                onClick={() => setSortBy('badges')}
                className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                  sortBy === 'badges' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Badges Earned</span>
              </button>

              <button
                onClick={() => setSortBy('xp')}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${
                  sortBy === 'xp' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                Overall XP
              </button>

              <button
                onClick={() => setSortBy('streak')}
                className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 ${
                  sortBy === 'streak' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Streak</span>
              </button>
            </div>

            {/* Tier Filter */}
            <div className="bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800 text-xs flex items-center gap-1.5">
              <span className="text-slate-500 font-semibold">Tier:</span>
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value as any)}
                className="bg-transparent text-slate-200 font-bold focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-slate-900">All Tiers</option>
                <option value="Extended" className="bg-slate-900">Extended Tier</option>
                <option value="Core" className="bg-slate-900">Core Tier</option>
              </select>
            </div>

            {/* Search filter */}
            <div className="relative w-44">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Find student..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Table of Ranks (Privacy: No individual quiz averages!) */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3">Rank</th>
                <th className="py-3 px-3">Student</th>
                <th className="py-3 px-3 text-center">
                  <span className="flex items-center justify-center gap-1">
                    <Target className="w-3 h-3 text-emerald-400" />
                    <span>Total Quiz Score</span>
                  </span>
                </th>
                <th className="py-3 px-3 text-center">
                  <span className="flex items-center justify-center gap-1">
                    <Award className="w-3 h-3 text-amber-400" />
                    <span>Earned Medals</span>
                  </span>
                </th>
                <th className="py-3 px-3">Featured Medal</th>
                <th className="py-3 px-3 text-center">Streak</th>
                <th className="py-3 px-3 text-center">Decks</th>
                <th className="py-3 px-3 text-right">Total XP</th>
                <th className="py-3 px-3 text-center">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {sortedEntries.map((student) => {
                const isCurrent = student.isCurrentUser;
                const level = calculateStudentLevel(student.xp);

                return (
                  <tr
                    key={student.studentId}
                    onClick={() => setInspectedStudent(student)}
                    className={`transition cursor-pointer ${
                      isCurrent
                        ? 'bg-amber-500/15 hover:bg-amber-500/20 font-semibold'
                        : 'hover:bg-slate-800/60'
                    }`}
                  >
                    {/* Rank */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1.5">
                        {student.rank === 1 ? (
                          <div className="w-7 h-7 rounded-lg bg-amber-400/20 text-amber-400 border border-amber-400/40 flex items-center justify-center font-black">
                            <Crown className="w-4 h-4 fill-amber-400" />
                          </div>
                        ) : student.rank === 2 ? (
                          <div className="w-7 h-7 rounded-lg bg-slate-400/20 text-slate-300 border border-slate-400/40 flex items-center justify-center font-black">
                            2
                          </div>
                        ) : student.rank === 3 ? (
                          <div className="w-7 h-7 rounded-lg bg-amber-700/20 text-amber-500 border border-amber-700/40 flex items-center justify-center font-black">
                            3
                          </div>
                        ) : (
                          <div className="w-7 h-7 rounded-lg bg-slate-950 text-slate-400 border border-slate-800 flex items-center justify-center font-bold">
                            {student.rank}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Student Identity */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-slate-700 to-indigo-600 flex items-center justify-center font-bold text-white text-xs shrink-0">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className={`font-bold ${isCurrent ? 'text-amber-300' : 'text-white'}`}>
                              {student.name}
                            </span>
                            {isCurrent && (
                              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-400 text-slate-950">
                                You
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 font-normal">
                            {level.title} • {student.tier} Tier
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* AGGREGATED TOTAL QUIZ SCORE (RAW MARKS/POINTS) */}
                    <td className="py-3.5 px-3 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className="font-mono font-black text-emerald-400 text-sm">
                          {student.totalQuizScore || 0}
                          <span className="text-[10px] text-emerald-500/80 ml-0.5">pts</span>
                        </span>
                        <span className="text-[9px] text-slate-500 font-normal">
                          {student.quizzesCompletedCount || 0} quizzes
                        </span>
                      </div>
                    </td>

                    {/* DYNAMIC EARNED MEDALS WITH ICONS FOR EACH MEDAL TYPE */}
                    <td className="py-3.5 px-3 text-center">
                      <div className="flex justify-center">
                        <StudentMedalStrip 
                          badges={student.unlockedBadges || []} 
                          compact={true} 
                          showCategoryBreakdown={true}
                          onClick={() => setInspectedStudent(student)}
                          className="cursor-pointer hover:scale-105 transition"
                        />
                      </div>
                    </td>

                    {/* Featured Medal */}
                    <td className="py-3.5 px-3">
                      {student.featuredBadge ? (
                        <MiniMedalPill 
                          badge={student.featuredBadge}
                          onClick={() => setInspectedStudent(student)}
                        />
                      ) : (
                        <span className="text-slate-600 text-[11px]">—</span>
                      )}
                    </td>

                    {/* Streak */}
                    <td className="py-3.5 px-3 text-center">
                      <span className="inline-flex items-center gap-1 font-bold text-amber-400">
                        <Flame className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{student.streakDays}d</span>
                      </span>
                    </td>

                    {/* Decks Read */}
                    <td className="py-3.5 px-3 text-center text-slate-300 font-mono">
                      {student.completedLessonsCount}
                    </td>

                    {/* Total XP */}
                    <td className="py-3.5 px-3 text-right">
                      <span className="font-mono font-black text-amber-400 text-sm">
                        {student.xp}
                      </span>
                      <span className="text-[10px] text-slate-500 ml-1">XP</span>
                    </td>

                    {/* Action / View */}
                    <td className="py-3.5 px-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setInspectedStudent(student);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold transition flex items-center justify-center gap-1 mx-auto"
                      >
                        <Medal className="w-3 h-3 text-amber-400" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. PRIVACY & SCORING INFORMATION FOOTER */}
      <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 text-xs text-slate-400 space-y-3">
        <div className="flex items-center gap-2 text-slate-200 font-bold">
          <Info className="w-4 h-4 text-amber-400" />
          <span>How Class Standings & Privacy Work</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-300">
          <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80 space-y-1">
            <span className="font-bold text-emerald-400 flex items-center gap-1.5">
              <Target className="w-4 h-4" />
              <span>Cumulative Quiz Scores</span>
            </span>
            <p className="text-[11px] text-slate-400">
              Each question answered correctly adds to your total quiz score. Practice quizzes and subtopic checks boost your rank marks.
            </p>
          </div>

          <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80 space-y-1">
            <span className="font-bold text-amber-400 flex items-center gap-1.5">
              <Award className="w-4 h-4" />
              <span>Aggregated Badges</span>
            </span>
            <p className="text-[11px] text-slate-400">
              Unlock virtual medals for streaks, Green Light scores (≥80%), and completing topic modules across Biology, Chemistry, and Physics.
            </p>
          </div>

          <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80 space-y-1">
            <span className="font-bold text-cyan-400 flex items-center gap-1.5">
              <Lock className="w-4 h-4" />
              <span>Privacy Guarantee</span>
            </span>
            <p className="text-[11px] text-slate-400">
              Your test percentage averages and mistakes are confidential. Other classmates can only see your total points and badges, never your averages.
            </p>
          </div>
        </div>
      </div>

      {/* 5. STUDENT BADGES & ACHIEVEMENTS INSPECTION MODAL */}
      {inspectedStudent && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 text-center space-y-5 shadow-2xl relative animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setInspectedStudent(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg font-bold p-1 cursor-pointer"
            >
              ✕
            </button>

            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 mx-auto flex items-center justify-center text-white text-2xl font-black shadow-lg">
              {inspectedStudent.name.charAt(0)}
            </div>

            <div>
              <div className="flex items-center justify-center gap-2">
                <h3 className="text-xl font-black text-white">{inspectedStudent.name}</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Rank #{inspectedStudent.rank}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {inspectedStudent.tier} Tier • {currentClass.name}
              </p>
            </div>

            {/* Aggregated Totals Grid */}
            <div className="grid grid-cols-3 gap-2.5 text-xs text-left">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Quiz Score</span>
                <span className="text-base font-black text-emerald-400 font-mono">
                  {inspectedStudent.totalQuizScore || 0} pts
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  {inspectedStudent.quizzesCompletedCount || 0} completed
                </span>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Badges</span>
                <span className="text-base font-black text-amber-400 font-mono flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  <span>{inspectedStudent.badgesCount}</span>
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Virtual Medals
                </span>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Study Streak</span>
                <span className="text-base font-black text-amber-400 font-mono flex items-center gap-1">
                  <Flame className="w-4 h-4 fill-amber-400" />
                  <span>{inspectedStudent.streakDays}d</span>
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Active days
                </span>
              </div>
            </div>

            {/* PRIVACY CONFIRMATION BADGE IN MODAL */}
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Quiz percentage averages are kept strictly private for student confidentiality.</span>
            </div>

            {/* UNLOCKED BADGES LIST & CATEGORY TABS */}
            <div className="text-left space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
                <span className="font-bold text-white flex items-center gap-1.5 text-xs">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Earned Virtual Badges & Medals ({inspectedStudent.unlockedBadges?.length || inspectedStudent.badgesCount})</span>
                </span>
                <span className="text-[11px] text-amber-400 font-mono font-bold">
                  {inspectedStudent.xp} XP Earned
                </span>
              </div>

              {/* Medal Counts Breakdown by Tier (Diamond, Gold, Silver, Bronze) */}
              <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Medals by Tier:</span>
                <MedalCountsSummary badges={inspectedStudent.unlockedBadges || []} size="xs" />
              </div>

              {/* Category Filter Tabs: All, Streaks, Module Completions, Quiz Performance */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                {[
                  { id: 'all', label: 'All Medals', icon: null, count: (inspectedStudent.unlockedBadges || []).length },
                  { 
                    id: 'streak', 
                    label: 'Streaks', 
                    icon: <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />,
                    count: (inspectedStudent.unlockedBadges || []).filter(b => b.category === 'streak').length 
                  },
                  { 
                    id: 'topic_module', 
                    label: 'Modules', 
                    icon: <BookOpen className="w-3 h-3 text-indigo-400" />,
                    count: (inspectedStudent.unlockedBadges || []).filter(b => b.category === 'topic_module').length 
                  },
                  { 
                    id: 'quiz', 
                    label: 'Quizzes', 
                    icon: <Target className="w-3 h-3 text-emerald-400" />,
                    count: (inspectedStudent.unlockedBadges || []).filter(b => b.category === 'quiz').length 
                  }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setInspectedBadgeCategory(tab.id as any)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                      inspectedBadgeCategory === tab.id
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-900/80 border border-slate-700/60">
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Filtered Badges Cards */}
              {(() => {
                const list = (inspectedStudent.unlockedBadges || []).filter(b => {
                  if (inspectedBadgeCategory === 'all') return true;
                  return b.category === inspectedBadgeCategory;
                });

                if (list.length === 0) {
                  return (
                    <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-400 space-y-1">
                      <Medal className="w-8 h-8 text-slate-600 mx-auto" />
                      <p className="font-semibold text-slate-300">No medals earned in this category yet</p>
                      <p className="text-[11px] text-slate-500">Keep revising to unlock badges for this achievement category.</p>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                    {list.map(badge => (
                      <div 
                        key={badge.id}
                        className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 flex items-start gap-3 transition"
                      >
                        <div className="shrink-0 mt-0.5">
                          <MedalTierIcon rarity={badge.rarity} size="md" category={badge.category} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-white truncate block">{badge.title}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 line-clamp-2 leading-tight mt-0.5">
                            {badge.description}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5 text-[9px] font-mono">
                            <span className="font-bold text-amber-400">+{badge.xpReward} XP</span>
                            <span className="text-slate-600">•</span>
                            <span className={`uppercase font-bold ${
                              badge.rarity === 'diamond' ? 'text-cyan-400' :
                              badge.rarity === 'gold' ? 'text-amber-400' :
                              badge.rarity === 'silver' ? 'text-slate-300' : 'text-amber-600'
                            }`}>
                              {badge.rarity}
                            </span>
                            {badge.category && (
                              <>
                                <span className="text-slate-600">•</span>
                                <span className="capitalize text-slate-400">{badge.category.replace('_', ' ')}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            <button
              onClick={() => setInspectedStudent(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
