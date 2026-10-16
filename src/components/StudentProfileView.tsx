import React, { useState, useMemo } from 'react';
import { 
  UserProfile, 
  StudentProgress, 
  BadgeCategory, 
  ScienceSubject,
  StudentBadge 
} from '../types';
import { 
  evaluateStudentBadges, 
  calculateStudentLevel, 
  calculateStreak 
} from '../services/badgeService';
import { VirtualMedalBadge } from './VirtualMedalBadge';
import { 
  Trophy, 
  Flame, 
  Award, 
  Star, 
  TrendingUp, 
  ShieldCheck, 
  GraduationCap, 
  Sparkles, 
  Calendar, 
  CheckCircle2, 
  Search,
  Filter,
  Users,
  ChevronRight,
  BookOpen
} from 'lucide-react';

interface StudentProfileViewProps {
  user: UserProfile;
  progress: StudentProgress;
  onUpdateUser?: (updated: UserProfile) => void;
  onUpdateProgress?: (updated: StudentProgress) => void;
  onNavigateToLeaderboard?: () => void;
  onNavigateToLessons?: (subtopicCode?: string) => void;
  onNavigateToQuizzes?: (topicCode?: string) => void;
}

export const StudentProfileView: React.FC<StudentProfileViewProps> = ({
  user,
  progress,
  onUpdateUser,
  onUpdateProgress,
  onNavigateToLeaderboard,
  onNavigateToLessons,
  onNavigateToQuizzes
}) => {
  const [selectedCategory, setSelectedCategory] = useState<BadgeCategory | 'all'>('all');
  const [selectedSubject, setSelectedSubject] = useState<ScienceSubject | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [searchBadgeQuery, setSearchBadgeQuery] = useState('');
  const [selectedBadgeForModal, setSelectedBadgeForModal] = useState<StudentBadge | null>(null);

  // Compute live badge evaluation, XP, and Level
  const { allBadges, unlockedBadges, lockedBadges, totalXP } = useMemo(() => {
    return evaluateStudentBadges(progress, user);
  }, [progress, user]);

  const streakInfo = useMemo(() => {
    return calculateStreak(progress);
  }, [progress]);

  const levelInfo = useMemo(() => {
    return calculateStudentLevel(totalXP);
  }, [totalXP]);

  // Featured badge resolution
  const featuredBadge = useMemo(() => {
    const fId = progress.featuredBadgeId || user.featuredBadgeId;
    if (fId) {
      const found = allBadges.find(b => b.id === fId);
      if (found && found.unlockedAt) return found;
    }
    return unlockedBadges[0] || null;
  }, [progress.featuredBadgeId, user.featuredBadgeId, allBadges, unlockedBadges]);

  const handleSetFeaturedBadge = (badgeId: string) => {
    if (onUpdateProgress) {
      onUpdateProgress({
        ...progress,
        featuredBadgeId: badgeId
      });
    }
    if (onUpdateUser) {
      onUpdateUser({
        ...user,
        featuredBadgeId: badgeId
      });
    }
  };

  // Filtered badges list
  const filteredBadges = useMemo(() => {
    return allBadges.filter(badge => {
      if (selectedCategory !== 'all' && badge.category !== selectedCategory) return false;
      if (selectedSubject !== 'all' && badge.subject && badge.subject !== selectedSubject) return false;
      if (filterStatus === 'unlocked' && !badge.unlockedAt) return false;
      if (filterStatus === 'locked' && badge.unlockedAt) return false;
      if (searchBadgeQuery.trim()) {
        const q = searchBadgeQuery.toLowerCase();
        return badge.title.toLowerCase().includes(q) || badge.description.toLowerCase().includes(q);
      }
      return true;
    });
  }, [allBadges, selectedCategory, selectedSubject, filterStatus, searchBadgeQuery]);

  // Quiz accuracy calculation
  const subtopicResults = Object.values(progress.subtopicQuizScores || {});
  const practiceResults = Object.values(progress.quizScores || {});
  const allPercents = [
    ...subtopicResults.map(r => r.percentage),
    ...practiceResults.map(r => Math.round((r.score / (r.total || 1)) * 100))
  ];
  const avgAccuracy = allPercents.length > 0 
    ? Math.round(allPercents.reduce((a, b) => a + b, 0) / allPercents.length)
    : 85;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. HERO PROFILE HEADER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 border border-slate-800 p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Avatar and Identity */}
          <div className="flex items-start sm:items-center gap-4 sm:gap-6">
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-indigo-500 p-1 shadow-lg shadow-emerald-500/20 flex items-center justify-center">
                <div className="w-full h-full bg-slate-950 rounded-xl flex items-center justify-center text-white font-black text-2xl sm:text-3xl">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'S'}
                </div>
              </div>
              <div className="absolute -bottom-2 -right-1 px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-md flex items-center gap-0.5">
                <Star className="w-3 h-3 fill-slate-950" />
                <span>Lvl {levelInfo.level}</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {user.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {levelInfo.title}
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  {user.tier} Tier
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                {user.email}
              </p>
              <div className="pt-1 flex flex-wrap items-center gap-4 text-xs text-slate-300">
                <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <Flame className="w-4 h-4 fill-amber-400" />
                  <span>{streakInfo.currentStreak} Day Study Streak</span>
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-300">
                  Target Grade: <strong className="text-white font-bold">{user.targetGrade || 'A*'}</strong>
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-300">
                  Exam Series: <strong className="text-white font-bold">May/June 2026</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Level & XP Card */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 min-w-[240px] flex flex-col justify-between shadow-inner">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Rank Progress</span>
              <span className="font-mono font-bold text-amber-400">{totalXP} Total XP</span>
            </div>
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-white">Level {levelInfo.level}</span>
                <span className="text-slate-400 text-[11px]">{levelInfo.progressPercent}% to Lvl {levelInfo.level + 1}</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-amber-400 to-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${levelInfo.progressPercent}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1.5 text-right font-mono">
                {levelInfo.nextLevelXP - totalXP} XP to Level {levelInfo.level + 1}
              </p>
            </div>
            {onNavigateToLeaderboard && (
              <button
                onClick={onNavigateToLeaderboard}
                className="mt-3 w-full py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-purple-900/30"
              >
                <Trophy className="w-3.5 h-3.5 text-amber-300" />
                <span>View Class & Cohort Rankings</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 2. STATS ROW */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-950/50 rounded-2xl p-3.5 border border-slate-800/60">
            <div className="flex items-center gap-2 text-amber-400 mb-1">
              <Flame className="w-4 h-4" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Current Streak</span>
            </div>
            <div className="text-xl font-black text-white">{streakInfo.currentStreak} <span className="text-xs font-normal text-slate-400">Days</span></div>
            <p className="text-[10px] text-slate-500 mt-0.5">Best record: {streakInfo.longestStreak} days</p>
          </div>

          <div className="bg-slate-950/50 rounded-2xl p-3.5 border border-slate-800/60">
            <div className="flex items-center gap-2 text-emerald-400 mb-1">
              <Award className="w-4 h-4" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Virtual Medals</span>
            </div>
            <div className="text-xl font-black text-white">{unlockedBadges.length} <span className="text-xs font-normal text-slate-400">/ {allBadges.length}</span></div>
            <p className="text-[10px] text-emerald-400 mt-0.5 font-medium">{Math.round((unlockedBadges.length / allBadges.length) * 100)}% unlocked</p>
          </div>

          <div className="bg-slate-950/50 rounded-2xl p-3.5 border border-slate-800/60">
            <div className="flex items-center gap-2 text-indigo-400 mb-1">
              <BookOpen className="w-4 h-4" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Decks Mastered</span>
            </div>
            <div className="text-xl font-black text-white">
              {progress.completedLessons?.length || 0} <span className="text-xs font-normal text-slate-400">/ 106</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Full 0653 syllabus</p>
          </div>

          <div className="bg-slate-950/50 rounded-2xl p-3.5 border border-slate-800/60">
            <div className="flex items-center gap-2 text-purple-400 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Quiz Accuracy</span>
            </div>
            <div className="text-xl font-black text-white">{avgAccuracy}%</div>
            <p className="text-[10px] text-purple-300 mt-0.5 font-medium">Across all tested topics</p>
          </div>
        </div>
      </div>

      {/* 3. FEATURED MEDAL SPOTLIGHT */}
      {featuredBadge && (
        <div className="bg-gradient-to-r from-amber-950/30 via-slate-900 to-indigo-950/30 border border-amber-500/30 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="shrink-0">
              <VirtualMedalBadge
                badge={featuredBadge}
                size="md"
                showDetails={false}
                isFeatured={true}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 flex items-center gap-1">
                  <Star className="w-3 h-3 fill-slate-950" />
                  <span>Featured Medal</span>
                </span>
                <span className="text-xs font-mono text-amber-400 font-bold">+{featuredBadge.xpReward} XP</span>
              </div>
              <h3 className="text-lg font-bold text-white mt-1">{featuredBadge.title}</h3>
              <p className="text-xs text-slate-300 max-w-lg mt-0.5">{featuredBadge.description}</p>
              {featuredBadge.unlockedAt && (
                <p className="text-[11px] text-slate-400 mt-1 font-mono">
                  Earned on {new Date(featuredBadge.unlockedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                </p>
              )}
            </div>
          </div>

          <div className="text-xs text-slate-400 text-center sm:text-right shrink-0">
            <p className="text-[11px] text-slate-400">Displayed on class leaderboard</p>
            <p className="text-[10px] text-slate-500">Click any medal below to change featured medal</p>
          </div>
        </div>
      )}

      {/* 4. MEDAL TROPHY CABINET & FILTER CONTROLS */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <Trophy className="w-6 h-6 text-amber-400" />
              <h2 className="text-xl font-black text-white tracking-tight">Virtual Medals Showcase</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Virtual medals awarded for study streaks, completing entire topic modules, and scoring highly on Cambridge quizzes.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchBadgeQuery}
              onChange={e => setSearchBadgeQuery(e.target.value)}
              placeholder="Search medals..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: 'All Medals' },
              { id: 'streak', label: 'Streaks' },
              { id: 'topic_module', label: 'Topic Modules' },
              { id: 'quiz', label: 'Quiz Ace' },
              { id: 'milestone', label: 'Milestones' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  selectedCategory === tab.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Status & Subject Filters */}
          <div className="flex items-center gap-2">
            {/* Subject Filter (for topic modules) */}
            {selectedCategory === 'topic_module' && (
              <select
                value={selectedSubject}
                onChange={e => setSelectedSubject(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="all">All Subjects</option>
                <option value="biology">Biology (B1-B16)</option>
                <option value="chemistry">Chemistry (C1-C12)</option>
                <option value="physics">Physics (P1-P5)</option>
              </select>
            )}

            {/* Unlocked / Locked filter */}
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">All Status ({allBadges.length})</option>
              <option value="unlocked">Earned Medals ({unlockedBadges.length})</option>
              <option value="locked">In Progress ({lockedBadges.length})</option>
            </select>
          </div>
        </div>

        {/* Medals Grid */}
        {filteredBadges.length === 0 ? (
          <div className="text-center py-12 bg-slate-950/40 rounded-2xl border border-slate-800/60 p-6 space-y-2">
            <Award className="w-10 h-10 text-slate-600 mx-auto" />
            <h4 className="text-sm font-bold text-white">No medals match your filter</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Try adjusting your category, subject, or search term to see other medals in your showcase.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
            {filteredBadges.map(badge => (
              <VirtualMedalBadge
                key={badge.id}
                badge={badge}
                size="md"
                isFeatured={featuredBadge?.id === badge.id}
                onSelectFeatured={handleSetFeaturedBadge}
                onClick={() => setSelectedBadgeForModal(badge)}
              />
            ))}
          </div>
        )}
      </div>

      {/* 5. MEDAL DETAIL POPUP MODAL */}
      {selectedBadgeForModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl relative animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setSelectedBadgeForModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg font-bold p-1"
            >
              ✕
            </button>

            <div className="flex justify-center pt-2">
              <VirtualMedalBadge
                badge={selectedBadgeForModal}
                size="lg"
                showDetails={false}
                isFeatured={featuredBadge?.id === selectedBadgeForModal.id}
              />
            </div>

            <div className="space-y-1">
              <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                selectedBadgeForModal.rarity === 'diamond' 
                  ? 'bg-cyan-950 text-cyan-300 border-cyan-500/40' 
                  : selectedBadgeForModal.rarity === 'gold' 
                  ? 'bg-amber-950 text-amber-300 border-amber-500/40' 
                  : selectedBadgeForModal.rarity === 'silver'
                  ? 'bg-slate-800 text-slate-200 border-slate-500/40'
                  : 'bg-amber-950 text-amber-400 border-amber-800'
              }`}>
                {selectedBadgeForModal.rarity} Medal
              </span>
              <h3 className="text-xl font-bold text-white pt-1">{selectedBadgeForModal.title}</h3>
              <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
                {selectedBadgeForModal.description}
              </p>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 text-xs space-y-2 text-left">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">XP Reward:</span>
                <span className="font-mono font-bold text-amber-400">+{selectedBadgeForModal.xpReward} XP</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Status:</span>
                {selectedBadgeForModal.unlockedAt ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Unlocked on {new Date(selectedBadgeForModal.unlockedAt).toLocaleDateString()}</span>
                  </span>
                ) : (
                  <span className="text-amber-400 font-medium">
                    {selectedBadgeForModal.progress?.label || 'In progress'}
                  </span>
                )}
              </div>
              {!selectedBadgeForModal.unlockedAt && selectedBadgeForModal.progress && (
                <div className="pt-1">
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full rounded-full"
                      style={{ 
                        width: `${Math.min(100, Math.round((selectedBadgeForModal.progress.current / (selectedBadgeForModal.progress.max || 1)) * 100))}%` 
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 flex flex-col gap-2">
              {selectedBadgeForModal.unlockedAt ? (
                <button
                  onClick={() => {
                    handleSetFeaturedBadge(selectedBadgeForModal.id);
                    setSelectedBadgeForModal(null);
                  }}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-amber-900/30"
                >
                  <Star className="w-4 h-4 fill-slate-950" />
                  <span>Set as Featured Medal</span>
                </button>
              ) : (
                selectedBadgeForModal.topicCode && onNavigateToLessons && (
                  <button
                    onClick={() => {
                      onNavigateToLessons(selectedBadgeForModal.topicCode);
                      setSelectedBadgeForModal(null);
                    }}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center justify-center gap-1.5"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Study Module {selectedBadgeForModal.topicCode} Slides</span>
                  </button>
                )
              )}
              <button
                onClick={() => setSelectedBadgeForModal(null)}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
