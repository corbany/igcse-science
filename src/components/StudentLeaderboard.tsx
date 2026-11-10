import React, { useState, useEffect, useMemo } from 'react';
import { 
  UserProfile, 
  StudentProgress, 
  LeaderboardEntry, 
  StudentBadge, 
  BadgeRarity 
} from '../types';
import { getClassStudentLeaderboard, ClassLeaderboardData } from '../services/rankingService';
import { 
  fetchStudentEnrolledClasses, 
  fetchClassesByInstructor, 
  ClassItem 
} from '../services/firestoreService';
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
  onNavigateToTeachingHub?: () => void;
}

export const StudentLeaderboard: React.FC<StudentLeaderboardProps> = ({
  user,
  progress,
  enrolledClassIds = [],
  onNavigateToLessons,
  onNavigateToQuizzes,
  onNavigateToProfile,
  onNavigateToTeachingHub
}) => {
  const [enrolledClasses, setEnrolledClasses] = useState<ClassItem[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>(
    enrolledClassIds[0] || ''
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

  // Load user's classes (support both students and instructors)
  useEffect(() => {
    let isMounted = true;
    async function loadClasses() {
      try {
        let classes: ClassItem[] = [];
        if (user.role === 'instructor') {
          classes = await fetchClassesByInstructor(user.id, user.email);
        } else {
          classes = await fetchStudentEnrolledClasses(user.id);
        }
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
  }, [user.id, user.role, user.email]);

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
                       enrolledClasses[0] || null;

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

  if (!loading && enrolledClasses.length === 0) {
    if (user.role === 'instructor') {
      return (
        <div className="rounded-3xl bg-white border border-[#E2E8F0] p-8 sm:p-12 text-center max-w-xl mx-auto space-y-6 shadow-xs my-8 text-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-300 text-amber-700 mx-auto flex items-center justify-center">
            <Trophy className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              No Classes Created Yet
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              Create your first class in the Teaching Hub to generate a live class leaderboard and monitor student rankings, badges, and quiz totals.
            </p>
          </div>
          {onNavigateToTeachingHub && (
            <button
              onClick={onNavigateToTeachingHub}
              className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl border-2 border-black transition cursor-pointer shadow-xs"
            >
              Go to Teaching Hub
            </button>
          )}
        </div>
      );
    }
    return (
      <div className="rounded-3xl bg-white border border-[#E2E8F0] p-8 sm:p-12 text-center max-w-xl mx-auto space-y-6 shadow-xs my-8 text-slate-800">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-300 text-amber-700 mx-auto flex items-center justify-center">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Class Leaderboard Restricted
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
            Leaderboard standings are strictly private to students within their own class. You are not currently enrolled in a verified class.
          </p>
        </div>
        <p className="text-xs text-amber-900 bg-amber-50 border border-amber-300 p-3.5 rounded-2xl font-medium">
          Please ask your instructor for your 8-character class join code to join your class and compare rankings with your classmates.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200 text-slate-800 max-w-6xl mx-auto pb-12">
      {/* 1. HERO HEADER WITH CLASS SELECTOR & AGGREGATE TOTALS */}
      <div className="rounded-3xl bg-white border border-[#E2E8F0] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-300 flex items-center justify-center text-amber-700">
                <Trophy className="w-5 h-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                {user.role === 'instructor' ? 'Instructor Class Leaderboard' : 'Class Leaderboard'}
              </h1>
              {currentClass && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  {currentClass.name}
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed font-medium">
              {user.role === 'instructor' ? (
                <>
                  Inspect rankings, earned badges, and quiz totals for students enrolled in <strong className="text-slate-900 font-bold">{currentClass?.name || 'your class'}</strong>.
                </>
              ) : (
                <>
                  Track your rank and celebrate achievements with classmates in <strong className="text-slate-900 font-bold">{currentClass?.name || 'your class'}</strong>! 
                  Standings are strictly limited to students in your own class, determined by
                  <strong className="text-slate-900 font-bold"> total badges earned</strong> and 
                  <strong className="text-slate-900 font-bold"> cumulative quiz scores</strong>.
                </>
              )}
            </p>
          </div>

          {/* Class Switcher & Refresh controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            {enrolledClasses.length > 0 && (
              <div className="bg-[#FDFBF7] px-3 py-1.5 rounded-xl border-2 border-black flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-900 focus:outline-none cursor-pointer"
                >
                  {enrolledClasses.map(c => (
                    <option key={c.id} value={c.id} className="bg-white text-slate-900">
                      {c.name} ({c.classCode})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {currentClass?.classCode && (
              <button
                onClick={handleCopyClassCode}
                title="Copy class join code to share with classmates"
                className="px-3 py-2 bg-white hover:bg-slate-50 border-2 border-black rounded-xl text-xs font-mono font-bold text-slate-900 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-600" />
                    <span>{currentClass.classCode}</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={loadLeaderboard}
              disabled={loading}
              title="Refresh live leaderboard standings"
              className="p-2.5 bg-white hover:bg-slate-50 border-2 border-black rounded-xl text-slate-700 hover:text-slate-900 transition flex items-center justify-center cursor-pointer shadow-xs active:scale-95"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* CLASS AGGREGATE SUMMARY STATS PILLS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-200">
          <div className="bg-[#FDFBF7] p-3 rounded-2xl border border-slate-200 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Classmates</span>
              <span className="text-sm font-mono font-bold text-slate-900">{sortedEntries.length} Enrolled</span>
            </div>
          </div>

          <div className="bg-[#FDFBF7] p-3 rounded-2xl border border-slate-200 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Total Badges</span>
              <span className="text-sm font-mono font-bold text-amber-800">{leaderboardData.totalClassBadges} Earned</span>
            </div>
          </div>

          <div className="bg-[#FDFBF7] p-3 rounded-2xl border border-slate-200 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Total Quiz Score</span>
              <span className="text-sm font-mono font-bold text-emerald-800">{leaderboardData.totalClassQuizScore} Pts</span>
            </div>
          </div>

          <div className="bg-[#FDFBF7] p-3 rounded-2xl border border-slate-200 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Syllabus</span>
              <span className="text-sm font-mono font-bold text-teal-800">0653 Combined</span>
            </div>
          </div>
        </div>

        {/* PRIVACY GUARANTEE BANNER */}
        <div className="mt-4 p-3.5 rounded-2xl bg-[#EBF3F5] border border-teal-300 flex items-start sm:items-center gap-3 text-xs text-teal-950">
          <div className="w-6 h-6 rounded-lg bg-teal-100 flex items-center justify-center text-teal-700 shrink-0 mt-0.5 sm:mt-0">
            <Lock className="w-3.5 h-3.5" />
          </div>
          <div className="flex-1 leading-relaxed">
            <strong className="font-bold text-slate-900">Class-Exclusive Visibility: </strong>
            <span>
              Rankings, badges, and quiz points are strictly private to students enrolled in <strong className="text-teal-900 font-bold">{currentClass?.name || 'this class'}</strong>. Students in other classes cannot view your standing, and individual test accuracy percentages remain private to each student.
            </span>
          </div>
        </div>

        {/* SINGLE STUDENT CLASS ADVISORY */}
        {sortedEntries.length === 1 && (
          <div className="mt-4 p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-xs text-amber-900 flex items-center gap-2.5">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              You are currently the first student enrolled in <strong>{currentClass?.name}</strong>. Share class code <strong className="text-slate-900 font-mono">{currentClass?.classCode}</strong> with your classmates to compare rankings!
            </span>
          </div>
        )}

        {/* CURRENT USER RANK SPOTLIGHT BANNER */}
        {currentUserEntry && (
          <div className="mt-5 pt-5 border-t border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 border-2 border-black flex items-center justify-center shrink-0">
                <div className="flex flex-col items-center justify-center text-slate-900">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 leading-none">Rank</span>
                  <span className="text-xl font-black leading-none mt-0.5">#{currentUserEntry.rank}</span>
                </div>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">
                    You are in <strong className="text-amber-800 font-black">#{currentUserEntry.rank} Place</strong> in {currentClass?.name || 'your class'}
                  </span>
                  {currentUserEntry.rank === 1 ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-300 text-slate-950 uppercase tracking-wider flex items-center gap-1 shadow-xs">
                      <Crown className="w-3 h-3 fill-slate-950" />
                      <span>Class Champion</span>
                    </span>
                  ) : competitorAhead ? (
                    <span className="text-xs text-slate-500 font-medium">
                      • {(competitorAhead.totalQuizScore || 0) - (currentUserEntry.totalQuizScore || 0) + 1} quiz points behind {competitorAhead.name}
                    </span>
                  ) : null}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-1 font-medium">
                  <span className="flex items-center gap-1">
                    <Target className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Your Total Quiz Score: <strong className="text-slate-900 font-mono">{currentUserEntry.totalQuizScore || 0} pts</strong></span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-amber-600" />
                    <span>Badges: <strong className="text-slate-900 font-mono">{currentUserEntry.badgesCount}</strong></span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
                    <span>Streak: <strong className="text-slate-900 font-mono">{currentUserEntry.streakDays}d</strong></span>
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
                  className="px-3 py-1.5 rounded-xl bg-[#FDFBF7] border border-slate-300 text-[11px] text-slate-700 flex items-center gap-1.5 font-medium"
                >
                  <Lock className="w-3 h-3 text-emerald-600" />
                  <span>My Private Accuracy:</span>
                  <strong className="text-emerald-800 font-mono font-bold">{currentUserEntry.quizAccuracy}%</strong>
                </div>
              )}

              {onNavigateToProfile && (
                <button
                  onClick={onNavigateToProfile}
                  className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-900 font-bold text-xs transition flex items-center gap-1.5 border-2 border-black shadow-xs cursor-pointer active:scale-95"
                  title="View your student profile, recent activity, and earned medals"
                >
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  <span>My Profile & Activity</span>
                </button>
              )}

              {onNavigateToQuizzes && (
                <button
                  onClick={() => onNavigateToQuizzes()}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
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
      {topThreeList.length > 0 && (
        <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="text-center max-w-sm mx-auto mb-6">
            <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Class Honor Podium</span>
              <Sparkles className="w-4 h-4 text-amber-600" />
            </h3>
            <p className="text-xs text-slate-600 font-medium">Leading classmates in {currentClass?.name || 'class'} ranked by total quiz scores & earned badges</p>
          </div>

          <div className={`grid gap-2 sm:gap-6 items-end max-w-2xl mx-auto pt-4 pb-2 ${
            topThreeList.length === 1 ? 'grid-cols-1 max-w-xs' : topThreeList.length === 2 ? 'grid-cols-2 max-w-md' : 'grid-cols-3'
          }`}>
            {/* 2nd Place (Silver) - only if >= 2 */}
            {topThreeList.length >= 2 && (
              <div 
                onClick={() => topThreeList[1] && setInspectedStudent(topThreeList[1])}
                className="flex flex-col items-center cursor-pointer group"
              >
                <div className="relative mb-2">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-200 border-2 border-black flex items-center justify-center group-hover:scale-105 transition">
                    <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-slate-900 font-black text-lg sm:text-xl">
                      {topThreeList[1]?.name.charAt(0) || '2'}
                    </div>
                  </div>
                  <div className="absolute -top-2.5 -right-2 px-2 py-0.5 rounded-full bg-slate-200 text-slate-900 text-[10px] font-bold uppercase tracking-wider border border-slate-400 shadow-xs flex items-center gap-0.5">
                    <Medal className="w-3 h-3 text-slate-700" />
                    <span>#2</span>
                  </div>
                </div>
                <p className="font-bold text-xs sm:text-sm text-slate-900 truncate max-w-[90px] sm:max-w-[120px] text-center group-hover:text-amber-700 transition">
                  {topThreeList[1]?.name}
                </p>
                <p className="font-mono text-xs text-emerald-800 font-bold mt-0.5">
                  {topThreeList[1]?.totalQuizScore || 0} Quiz Pts
                </p>
                <div className="mt-1 flex flex-col items-center">
                  <span className="text-[10px] text-slate-600 font-bold mb-0.5">
                    {topThreeList[1]?.badgesCount || 0} Medals
                  </span>
                  <StudentMedalStrip 
                    badges={topThreeList[1]?.unlockedBadges || []} 
                    compact={true} 
                    showCategoryBreakdown={false}
                  />
                </div>

                {/* Podium Step */}
                <div className="w-full h-20 sm:h-24 bg-[#EBF3F5] rounded-t-2xl border-t-2 border-slate-400 flex flex-col items-center justify-center text-slate-800 text-xs font-bold mt-2 shadow-xs">
                  <span className="text-lg font-black text-slate-900">2nd</span>
                  <span className="text-[10px] text-slate-600 font-bold">Silver</span>
                </div>
              </div>
            )}

            {/* 1st Place (Gold Champion) */}
            <div 
              onClick={() => topThreeList[0] && setInspectedStudent(topThreeList[0])}
              className={`flex flex-col items-center cursor-pointer group ${topThreeList.length === 2 ? 'order-first' : ''}`}
            >
              <Crown className="w-6 h-6 text-amber-500 fill-amber-500 mb-1" />
              <div className="relative mb-2">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-200 border-2 border-black p-0.5 shadow-xs flex items-center justify-center group-hover:scale-105 transition">
                  <div className="w-full h-full bg-amber-50 rounded-[14px] flex items-center justify-center text-amber-900 font-black text-xl sm:text-2xl">
                    {topThreeList[0]?.name.charAt(0) || '1'}
                  </div>
                </div>
                <div className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-bold uppercase tracking-wider shadow-xs flex items-center gap-0.5 border border-amber-500">
                  <Crown className="w-3 h-3 fill-slate-950" />
                  <span>#1</span>
                </div>
              </div>
              <p className="font-bold text-xs sm:text-base text-amber-950 truncate max-w-[100px] sm:max-w-[140px] text-center">
                {topThreeList[0]?.name}
              </p>
              <p className="font-mono text-xs sm:text-sm text-emerald-800 font-black mt-0.5">
                {topThreeList[0]?.totalQuizScore || 0} Quiz Pts
              </p>
              <div className="mt-1 flex flex-col items-center">
                <span className="text-[10px] text-amber-900 font-bold mb-0.5">
                  {topThreeList[0]?.badgesCount || 0} Medals
                </span>
                <StudentMedalStrip 
                  badges={topThreeList[0]?.unlockedBadges || []} 
                  compact={true} 
                  showCategoryBreakdown={false}
                />
              </div>

              {/* Podium Step */}
              <div className="w-full h-28 sm:h-32 bg-[#FDFBF7] rounded-t-2xl border-t-2 border-amber-400 flex flex-col items-center justify-center text-amber-900 text-xs font-bold mt-2 shadow-xs">
                <span className="text-2xl font-black text-slate-900">1st</span>
                <span className="text-[10px] text-amber-800 uppercase font-black tracking-wider">Champion</span>
              </div>
            </div>

            {/* 3rd Place (Bronze) - only if >= 3 */}
            {topThreeList.length >= 3 && (
              <div 
                onClick={() => topThreeList[2] && setInspectedStudent(topThreeList[2])}
                className="flex flex-col items-center cursor-pointer group"
              >
                <div className="relative mb-2">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-amber-100 border-2 border-black flex items-center justify-center group-hover:scale-105 transition">
                    <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-amber-900 font-black text-lg sm:text-xl">
                      {topThreeList[2]?.name.charAt(0) || '3'}
                    </div>
                  </div>
                  <div className="absolute -top-2.5 -right-2 px-2 py-0.5 rounded-full bg-amber-200 text-amber-950 text-[10px] font-bold uppercase tracking-wider border border-amber-400 shadow-xs flex items-center gap-0.5">
                    <Medal className="w-3 h-3 text-amber-800" />
                    <span>#3</span>
                  </div>
                </div>
                <p className="font-bold text-xs sm:text-sm text-slate-900 truncate max-w-[90px] sm:max-w-[120px] text-center group-hover:text-amber-700 transition">
                  {topThreeList[2]?.name}
                </p>
                <p className="font-mono text-xs text-emerald-800 font-bold mt-0.5">
                  {topThreeList[2]?.totalQuizScore || 0} Quiz Pts
                </p>
                <div className="mt-1 flex flex-col items-center">
                  <span className="text-[10px] text-amber-800 font-bold mb-0.5">
                    {topThreeList[2]?.badgesCount || 0} Medals
                  </span>
                  <StudentMedalStrip 
                    badges={topThreeList[2]?.unlockedBadges || []} 
                    compact={true} 
                    showCategoryBreakdown={false}
                  />
                </div>

                {/* Podium Step */}
                <div className="w-full h-16 sm:h-20 bg-[#FDFBF7] rounded-t-2xl border-t-2 border-amber-600 flex flex-col items-center justify-center text-amber-800 text-xs font-bold mt-2 shadow-xs">
                  <span className="text-base font-black text-slate-900">3rd</span>
                  <span className="text-[10px] text-amber-800">Bronze</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. FULL CLASS LEADERBOARD TABLE & FILTER CONTROLS */}
      <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 sm:p-8 space-y-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-600" />
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Class Standings</h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FDFBF7] text-slate-700 border border-slate-300">
              {sortedEntries.length} Students
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Sort Metric Selector */}
            <div className="flex items-center bg-[#FDFBF7] p-1 rounded-xl border border-slate-300 text-xs">
              <button
                onClick={() => setSortBy('quizScore')}
                className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  sortBy === 'quizScore' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Target className="w-3.5 h-3.5" />
                <span>Total Quiz Score</span>
              </button>

              <button
                onClick={() => setSortBy('badges')}
                className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  sortBy === 'badges' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Badges Earned</span>
              </button>

              <button
                onClick={() => setSortBy('xp')}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  sortBy === 'xp' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Overall XP
              </button>

              <button
                onClick={() => setSortBy('streak')}
                className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer ${
                  sortBy === 'streak' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Streak</span>
              </button>
            </div>

            {/* Tier Filter */}
            <div className="bg-[#FDFBF7] px-2.5 py-1.5 rounded-xl border-2 border-black text-xs flex items-center gap-1.5">
              <span className="text-slate-600 font-bold">Tier:</span>
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value as any)}
                className="bg-transparent text-slate-900 font-bold focus:outline-none cursor-pointer"
              >
                <option value="all">All Tiers</option>
                <option value="Extended">Extended Tier</option>
                <option value="Core">Core Tier</option>
              </select>
            </div>

            {/* Search filter */}
            <div className="relative w-44">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Find student..."
                className="w-full pl-8 pr-3 py-1.5 bg-[#FDFBF7] border-2 border-black rounded-xl text-xs font-bold text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Table of Ranks */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-800">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px] bg-[#FDFBF7]">
                <th className="py-3 px-3">Rank</th>
                <th className="py-3 px-3">Student</th>
                <th className="py-3 px-3 text-center">
                  <span className="flex items-center justify-center gap-1">
                    <Target className="w-3 h-3 text-emerald-600" />
                    <span>Total Quiz Score</span>
                  </span>
                </th>
                <th className="py-3 px-3 text-center">
                  <span className="flex items-center justify-center gap-1">
                    <Award className="w-3 h-3 text-amber-600" />
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
            <tbody className="divide-y divide-slate-200 bg-white">
              {sortedEntries.map((student) => {
                const isCurrent = student.isCurrentUser;
                const level = calculateStudentLevel(student.xp);

                return (
                  <tr
                    key={student.studentId}
                    onClick={() => setInspectedStudent(student)}
                    className={`transition cursor-pointer ${
                      isCurrent
                        ? 'bg-amber-50 hover:bg-amber-100 font-bold'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* Rank */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1.5">
                        {student.rank === 1 ? (
                          <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 border border-amber-300 flex items-center justify-center font-bold">
                            <Crown className="w-4 h-4 fill-amber-700 text-amber-700" />
                          </div>
                        ) : student.rank === 2 ? (
                          <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-800 border border-slate-300 flex items-center justify-center font-bold">
                            2
                          </div>
                        ) : student.rank === 3 ? (
                          <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 flex items-center justify-center font-bold">
                            3
                          </div>
                        ) : (
                          <div className="w-7 h-7 rounded-lg bg-[#FDFBF7] text-slate-700 border border-slate-300 flex items-center justify-center font-bold">
                            {student.rank}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Student Identity */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-[#EBF3F5] border border-slate-300 flex items-center justify-center font-bold text-slate-800 text-xs shrink-0">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className={`font-bold ${isCurrent ? 'text-amber-900' : 'text-slate-900'}`}>
                              {student.name}
                            </span>
                            {isCurrent && (
                              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-300 text-slate-950">
                                You
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 font-normal">
                            {level.title} • {student.tier} Tier
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* AGGREGATED TOTAL QUIZ SCORE */}
                    <td className="py-3.5 px-3 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className="font-mono font-bold text-emerald-800 text-sm">
                          {student.totalQuizScore || 0}
                          <span className="text-[10px] text-emerald-700 ml-0.5">pts</span>
                        </span>
                        <span className="text-[9px] text-slate-500 font-normal">
                          {student.quizzesCompletedCount || 0} quizzes
                        </span>
                      </div>
                    </td>

                    {/* DYNAMIC EARNED MEDALS */}
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
                        <span className="text-slate-400 text-[11px]">—</span>
                      )}
                    </td>

                    {/* Streak */}
                    <td className="py-3.5 px-3 text-center">
                      <span className="inline-flex items-center gap-1 font-bold text-amber-700">
                        <Flame className="w-3.5 h-3.5 fill-amber-600" />
                        <span>{student.streakDays}d</span>
                      </span>
                    </td>

                    {/* Decks Read */}
                    <td className="py-3.5 px-3 text-center text-slate-700 font-mono font-medium">
                      {student.completedLessonsCount}
                    </td>

                    {/* Total XP */}
                    <td className="py-3.5 px-3 text-right">
                      <span className="font-mono font-bold text-slate-900 text-sm">
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
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 text-slate-800 text-[11px] font-bold transition flex items-center justify-center gap-1 mx-auto border border-slate-300 cursor-pointer shadow-xs active:scale-95"
                      >
                        <Medal className="w-3 h-3 text-amber-600" />
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
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 text-xs text-slate-600 space-y-3 shadow-xs">
        <div className="flex items-center gap-2 text-slate-900 font-bold">
          <Info className="w-4 h-4 text-amber-600" />
          <span>How Class Standings & Privacy Work</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-700">
          <div className="bg-[#FDFBF7] p-3.5 rounded-xl border border-slate-200 space-y-1">
            <span className="font-bold text-emerald-800 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-emerald-700" />
              <span>Cumulative Quiz Scores</span>
            </span>
            <p className="text-[11px] text-slate-600">
              Each question answered correctly adds to your total quiz score. Practice quizzes and subtopic checks boost your rank marks.
            </p>
          </div>

          <div className="bg-[#FDFBF7] p-3.5 rounded-xl border border-slate-200 space-y-1">
            <span className="font-bold text-amber-800 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-700" />
              <span>Aggregated Badges</span>
            </span>
            <p className="text-[11px] text-slate-600">
              Unlock virtual medals for streaks, Green Light scores (≥80%), and completing topic modules across Biology, Chemistry, and Physics.
            </p>
          </div>

          <div className="bg-[#FDFBF7] p-3.5 rounded-xl border border-slate-200 space-y-1">
            <span className="font-bold text-teal-800 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-teal-700" />
              <span>Privacy Guarantee</span>
            </span>
            <p className="text-[11px] text-slate-600">
              Your test percentage averages and mistakes are confidential. Other classmates can only see your total points and badges, never your averages.
            </p>
          </div>
        </div>
      </div>

      {/* 5. STUDENT BADGES & ACHIEVEMENTS INSPECTION MODAL */}
      {inspectedStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-2 border-black rounded-3xl max-w-lg w-full p-6 text-center space-y-5 shadow-xl relative animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto text-slate-800">
            <button
              onClick={() => setInspectedStudent(null)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 text-lg font-bold p-1 cursor-pointer"
            >
              ✕
            </button>

            <div className="w-16 h-16 rounded-2xl bg-amber-100 border-2 border-black mx-auto flex items-center justify-center text-slate-900 text-2xl font-black shadow-xs">
              {inspectedStudent.name.charAt(0)}
            </div>

            <div>
              <div className="flex items-center justify-center gap-2">
                <h3 className="text-xl font-bold text-slate-900">{inspectedStudent.name}</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                  Rank #{inspectedStudent.rank}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                {inspectedStudent.tier} Tier • {currentClass?.name || 'Class'}
              </p>
            </div>

            {/* Aggregated Totals Grid */}
            <div className="grid grid-cols-3 gap-2.5 text-xs text-left">
              <div className="bg-[#FDFBF7] p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Total Quiz Score</span>
                <span className="text-base font-bold text-emerald-800 font-mono">
                  {inspectedStudent.totalQuizScore || 0} pts
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  {inspectedStudent.quizzesCompletedCount || 0} completed
                </span>
              </div>

              <div className="bg-[#FDFBF7] p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Total Badges</span>
                <span className="text-base font-bold text-amber-800 font-mono flex items-center gap-1">
                  <Award className="w-4 h-4 text-amber-600" />
                  <span>{inspectedStudent.badgesCount}</span>
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Virtual Medals
                </span>
              </div>

              <div className="bg-[#FDFBF7] p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Study Streak</span>
                <span className="text-base font-bold text-amber-800 font-mono flex items-center gap-1">
                  <Flame className="w-4 h-4 fill-amber-600 text-amber-600" />
                  <span>{inspectedStudent.streakDays}d</span>
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Active days
                </span>
              </div>
            </div>

            {/* PRIVACY CONFIRMATION BADGE IN MODAL */}
            <div className="p-2.5 rounded-xl bg-[#EBF3F5] border border-teal-200 text-[11px] text-slate-700 flex items-center justify-center gap-1.5 font-medium">
              <Lock className="w-3.5 h-3.5 text-teal-700 shrink-0" />
              <span>Quiz percentage averages are kept strictly private for student confidentiality.</span>
            </div>

            {/* UNLOCKED BADGES LIST & CATEGORY TABS */}
            <div className="text-left space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                  <Award className="w-4 h-4 text-amber-600" />
                  <span>Earned Virtual Badges & Medals ({inspectedStudent.unlockedBadges?.length || inspectedStudent.badgesCount})</span>
                </span>
                <span className="text-[11px] text-amber-800 font-mono font-bold">
                  {inspectedStudent.xp} XP Earned
                </span>
              </div>

              {/* Medal Counts Breakdown by Tier */}
              <div className="flex flex-wrap items-center justify-between gap-2 bg-[#FDFBF7] p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">Medals by Tier:</span>
                <MedalCountsSummary badges={inspectedStudent.unlockedBadges || []} size="xs" />
              </div>

              {/* Category Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                {[
                  { id: 'all', label: 'All Medals', icon: null, count: (inspectedStudent.unlockedBadges || []).length },
                  { 
                    id: 'streak', 
                    label: 'Streaks', 
                    icon: <Flame className="w-3 h-3 text-amber-600 fill-amber-600" />,
                    count: (inspectedStudent.unlockedBadges || []).filter(b => b.category === 'streak').length 
                  },
                  { 
                    id: 'topic_module', 
                    label: 'Modules', 
                    icon: <BookOpen className="w-3 h-3 text-teal-700" />,
                    count: (inspectedStudent.unlockedBadges || []).filter(b => b.category === 'topic_module').length 
                  },
                  { 
                    id: 'quiz', 
                    label: 'Quizzes', 
                    icon: <Target className="w-3 h-3 text-emerald-600" />,
                    count: (inspectedStudent.unlockedBadges || []).filter(b => b.category === 'quiz').length 
                  }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setInspectedBadgeCategory(tab.id as any)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      inspectedBadgeCategory === tab.id
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-[#FDFBF7] hover:bg-slate-100 text-slate-700 border border-slate-300'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-white border border-slate-300">
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
                    <div className="p-6 rounded-2xl bg-[#FDFBF7] border border-slate-200 text-center text-xs text-slate-600 space-y-1">
                      <Medal className="w-8 h-8 text-slate-400 mx-auto" />
                      <p className="font-bold text-slate-800">No medals earned in this category yet</p>
                      <p className="text-[11px] text-slate-500">Keep revising to unlock badges for this achievement category.</p>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                    {list.map(badge => (
                      <div 
                        key={badge.id}
                        className="p-3 rounded-2xl bg-[#FDFBF7] border border-slate-200 hover:border-slate-300 flex items-start gap-3 transition"
                      >
                        <div className="shrink-0 mt-0.5">
                          <MedalTierIcon rarity={badge.rarity} size="md" category={badge.category} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900 truncate block">{badge.title}</span>
                          </div>
                          <p className="text-[10px] text-slate-600 line-clamp-2 leading-tight mt-0.5 font-medium">
                            {badge.description}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5 text-[9px] font-mono">
                            <span className="font-bold text-amber-800">+{badge.xpReward} XP</span>
                            <span className="text-slate-400">•</span>
                            <span className={`uppercase font-bold ${
                              badge.rarity === 'diamond' ? 'text-teal-700' :
                              badge.rarity === 'gold' ? 'text-amber-800' :
                              badge.rarity === 'silver' ? 'text-slate-600' : 'text-amber-900'
                            }`}>
                              {badge.rarity}
                            </span>
                            {badge.category && (
                              <>
                                <span className="text-slate-400">•</span>
                                <span className="capitalize text-slate-600">{badge.category.replace('_', ' ')}</span>
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
              className="w-full py-2.5 rounded-xl bg-white hover:bg-slate-50 border-2 border-black text-slate-900 font-bold text-xs transition cursor-pointer shadow-xs active:scale-95"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
