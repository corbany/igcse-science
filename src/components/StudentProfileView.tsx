import React, { useState, useMemo, useEffect } from 'react';
import { 
  UserProfile, 
  StudentProgress, 
  BadgeCategory, 
  ScienceSubject,
  StudentBadge,
  TaskWithSubmission,
  CompletedActivity 
} from '../types';
import { 
  evaluateStudentBadges, 
  calculateStudentLevel, 
  calculateStreak 
} from '../services/badgeService';
import { VirtualMedalBadge } from './VirtualMedalBadge';
import { 
  MedalTierIcon, 
  MedalCountsSummary, 
  MiniMedalPill, 
  DynamicCategoryMedalGroup,
  StudentMedalStrip
} from './MedalTypeBadge';
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
  BookOpen,
  Clock,
  History,
  ClipboardCheck,
  ArrowRight,
  Check
} from 'lucide-react';
import { fetchTasksForStudent } from '../services/firestoreService';
import { 
  getRecentCompletedActivities, 
  formatActivityTimestamp, 
  getActivityRelativeTime, 
  getActivityExactTooltip 
} from '../services/activityService';

interface StudentProfileViewProps {
  user: UserProfile;
  progress: StudentProgress;
  enrolledClassIds?: string[];
  tasks?: TaskWithSubmission[];
  onUpdateUser?: (updated: UserProfile) => void;
  onUpdateProgress?: (updated: StudentProgress) => void;
  onNavigateToLeaderboard?: () => void;
  onNavigateToLessons?: (subtopicCode?: string) => void;
  onNavigateToQuizzes?: (topicCode?: string) => void;
}

export const StudentProfileView: React.FC<StudentProfileViewProps> = ({
  user,
  progress,
  enrolledClassIds = [],
  tasks,
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

  // Live tasks and real-time activity updates state
  const [liveTasks, setLiveTasks] = useState<TaskWithSubmission[]>(tasks || []);
  const [activityRefreshKey, setActivityRefreshKey] = useState<number>(0);

  useEffect(() => {
    if (tasks && tasks.length > 0) {
      setLiveTasks(tasks);
    } else {
      let isMounted = true;
      fetchTasksForStudent(user, enrolledClassIds || [], progress)
        .then(t => {
          if (isMounted) setLiveTasks(t);
        })
        .catch(err => console.warn('Could not load tasks for student profile:', err));
      return () => { isMounted = false; };
    }
  }, [tasks, user.id, (enrolledClassIds || []).join(','), progress]);

  // Listen for real-time task completion and activity events
  useEffect(() => {
    const handleActivityUpdate = () => {
      setActivityRefreshKey(k => k + 1);
    };
    window.addEventListener('igcse_activity_logged', handleActivityUpdate);
    window.addEventListener('igcse_task_submission_updated', handleActivityUpdate);
    window.addEventListener('storage', handleActivityUpdate);
    return () => {
      window.removeEventListener('igcse_activity_logged', handleActivityUpdate);
      window.removeEventListener('igcse_task_submission_updated', handleActivityUpdate);
      window.removeEventListener('storage', handleActivityUpdate);
    };
  }, []);

  // Compute the last 5 completed tasks or quizzes with their respective timestamps
  const recentActivities = useMemo(() => {
    return getRecentCompletedActivities(user, progress, liveTasks, 5);
  }, [user, progress, liveTasks, activityRefreshKey]);

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
    <div className="space-y-6 animate-in fade-in duration-200 text-slate-800 max-w-6xl mx-auto pb-12">
      {/* 1. HERO PROFILE HEADER */}
      <div className="rounded-3xl bg-white border border-[#E2E8F0] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Avatar and Identity */}
          <div className="flex items-start sm:items-center gap-4 sm:gap-6">
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-amber-100 border-2 border-black flex items-center justify-center shrink-0">
                <div className="text-slate-900 font-black text-2xl sm:text-3xl">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'S'}
                </div>
              </div>
              <div className="absolute -bottom-2 -right-1 px-2 py-0.5 rounded-full bg-amber-300 text-slate-950 text-[10px] font-bold uppercase tracking-wider border border-amber-400 shadow-xs flex items-center gap-0.5">
                <Star className="w-3 h-3 fill-slate-950" />
                <span>Lvl {levelInfo.level}</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {user.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#EBF3F5] text-teal-800 border border-teal-300">
                  {levelInfo.title}
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                  {user.tier} Tier
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono">
                {user.email}
              </p>
              <div className="pt-1 flex flex-wrap items-center gap-4 text-xs text-slate-600 font-medium">
                <span className="flex items-center gap-1.5 text-amber-700 font-bold">
                  <Flame className="w-4 h-4 fill-amber-600 text-amber-600" />
                  <span>{streakInfo.currentStreak} Day Study Streak</span>
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-700">
                  Target Grade: <strong className="text-slate-900 font-bold">{user.targetGrade || 'A*'}</strong>
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-700">
                  Exam Series: <strong className="text-slate-900 font-bold">May/June 2026</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Level & XP Card */}
          <div className="bg-[#FDFBF7] border border-slate-200 rounded-2xl p-4 min-w-[240px] flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Rank Progress</span>
              <span className="font-mono font-bold text-amber-800">{totalXP} Total XP</span>
            </div>
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-slate-900">Level {levelInfo.level}</span>
                <span className="text-slate-500 text-[11px] font-medium">{levelInfo.progressPercent}% to Lvl {levelInfo.level + 1}</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${levelInfo.progressPercent}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1.5 text-right font-mono font-medium">
                {levelInfo.nextLevelXP - totalXP} XP to Level {levelInfo.level + 1}
              </p>
            </div>
            {onNavigateToLeaderboard && (
              <button
                onClick={onNavigateToLeaderboard}
                className="mt-3 w-full py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-900 font-bold text-xs transition flex items-center justify-center gap-1.5 border-2 border-black shadow-xs cursor-pointer active:scale-95"
              >
                <Trophy className="w-3.5 h-3.5 text-amber-600" />
                <span>View Class Leaderboard & Rankings</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 2. STATS ROW */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-200">
          <div className="bg-[#FDFBF7] rounded-2xl p-3.5 border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 text-amber-700 mb-1">
              <Flame className="w-4 h-4 fill-amber-600" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Current Streak</span>
            </div>
            <div className="text-xl font-black text-slate-900">{streakInfo.currentStreak} <span className="text-xs font-normal text-slate-500">Days</span></div>
            <p className="text-[10px] text-slate-500 mt-0.5 font-medium">Best record: {streakInfo.longestStreak} days</p>
          </div>

          <div className="bg-[#FDFBF7] rounded-2xl p-3.5 border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 text-emerald-700 mb-1">
              <Award className="w-4 h-4" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Virtual Medals</span>
            </div>
            <div className="text-xl font-black text-slate-900">{unlockedBadges.length} <span className="text-xs font-normal text-slate-500">/ {allBadges.length}</span></div>
            <p className="text-[10px] text-emerald-800 mt-0.5 font-bold">{Math.round((unlockedBadges.length / allBadges.length) * 100)}% unlocked</p>
            <div className="mt-2 pt-2 border-t border-slate-200">
              <StudentMedalStrip badges={unlockedBadges} compact={true} showCategoryBreakdown={false} />
            </div>
          </div>

          <div className="bg-[#FDFBF7] rounded-2xl p-3.5 border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 text-teal-700 mb-1">
              <BookOpen className="w-4 h-4" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Decks Mastered</span>
            </div>
            <div className="text-xl font-black text-slate-900">
              {progress.completedLessons?.length || 0} <span className="text-xs font-normal text-slate-500">/ 106</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5 font-medium">Full 0653 syllabus</p>
          </div>

          <div className="bg-[#FDFBF7] rounded-2xl p-3.5 border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 text-purple-700 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Quiz Accuracy</span>
            </div>
            <div className="text-xl font-black text-slate-900">{avgAccuracy}%</div>
            <p className="text-[10px] text-purple-800 mt-0.5 font-bold">Across all tested topics</p>
          </div>
        </div>
      </div>

      {/* 3. RECENT ACTIVITY */}
      <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 sm:p-8 space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EBF3F5] border border-teal-200 flex items-center justify-center text-teal-700 shrink-0">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Recent Activity</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 font-mono">
                  Last 5 Completed
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5 font-medium">
                The last 5 tasks or quizzes you completed with verified completion timestamps, scores, and mastery statuses.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FDFBF7] border border-slate-300 text-[11px] font-mono font-bold text-emerald-800 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              <span>Live Synced Activity</span>
            </div>
          </div>
        </div>

        {recentActivities.length === 0 ? (
          <div className="text-center py-10 px-4 bg-[#FDFBF7] rounded-2xl border border-slate-200 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-300 flex items-center justify-center text-slate-400 mx-auto">
              <Clock className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900">No Completed Activities Recorded Yet</h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto font-medium">
                Once you complete your assigned class homework, review lesson slides, or take 10-question practice quizzes, your 5 most recent completions will appear here with exact timestamps.
              </p>
            </div>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
              {onNavigateToQuizzes && (
                <button
                  onClick={() => onNavigateToQuizzes()}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Take a Practice Quiz</span>
                </button>
              )}
              {onNavigateToLessons && (
                <button
                  onClick={() => onNavigateToLessons()}
                  className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-900 font-bold text-xs transition flex items-center gap-1.5 border-2 border-black cursor-pointer shadow-xs active:scale-95"
                >
                  <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Browse Lesson Slides</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {recentActivities.map((act, idx) => {
              const isTask = act.type === 'task';
              const isSubtopicQuiz = act.type === 'subtopic_quiz';
              const isSubjectQuiz = act.type === 'subject_quiz';

              return (
                <div
                  key={act.id || idx}
                  className="p-4 rounded-2xl bg-[#FDFBF7] border border-slate-200 hover:border-slate-300 transition flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs group"
                >
                  {/* Left: Indicator, Title, Topic & Subject Tags */}
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="w-6 h-6 rounded-lg bg-white border border-slate-300 text-[11px] font-mono font-bold text-slate-700 flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                        isTask 
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : isSubtopicQuiz
                            ? 'bg-sky-50 text-sky-800 border-sky-300'
                            : 'bg-purple-50 text-purple-800 border-purple-300'
                      }`}>
                        {isTask && <ClipboardCheck className="w-4 h-4" />}
                        {isSubtopicQuiz && <Award className="w-4 h-4" />}
                        {isSubjectQuiz && <Trophy className="w-4 h-4" />}
                      </div>
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                          isTask 
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : isSubtopicQuiz
                              ? 'bg-sky-50 text-sky-800 border-sky-300'
                              : 'bg-purple-50 text-purple-800 border-purple-300'
                        }`}>
                          {isTask ? 'Class Task' : isSubtopicQuiz ? '10-Q Knowledge Check' : 'Subject Practice Quiz'}
                        </span>

                        {act.code && (
                          <span className={`px-2 py-0.2 rounded-md font-mono text-[11px] font-bold border ${
                            act.subject === 'biology' 
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : act.subject === 'chemistry'
                                ? 'bg-amber-50 text-amber-800 border-amber-300'
                                : 'bg-sky-50 text-sky-800 border-sky-300'
                          }`}>
                            {act.code}
                          </span>
                        )}

                        <span className="text-[11px] text-slate-400 hidden sm:inline">•</span>
                        <span className="text-[11px] text-slate-600 truncate hidden sm:inline font-medium">
                          {act.subtitle || 'Completed Activity'}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 tracking-tight truncate group-hover:text-emerald-700 transition">
                        {act.title}
                      </h4>
                    </div>
                  </div>

                  {/* Middle: Performance / Score & Status */}
                  <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
                    {/* Score / Percentage Badge */}
                    {act.score !== undefined && (
                      <div className={`px-2.5 py-1 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 ${
                        (act.percentage !== undefined ? act.percentage >= 80 : act.score >= 8)
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : (act.percentage !== undefined ? act.percentage >= 50 : act.score >= 5)
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : 'bg-rose-50 text-rose-800 border-rose-300'
                      }`}>
                        <Award className="w-3.5 h-3.5" />
                        <span>
                          {act.total !== undefined ? `${act.score}/${act.total}` : `${act.score}%`}
                          {act.percentage !== undefined && ` (${act.percentage}%)`}
                        </span>
                      </div>
                    )}

                    {/* Traffic Light Dot */}
                    {act.trafficLight && (
                      <div 
                        className={`w-3.5 h-3.5 rounded-full shadow-xs ${
                          act.trafficLight === 'green' ? 'bg-emerald-500' :
                          act.trafficLight === 'orange' ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        title={`Traffic light status: ${act.trafficLight}`}
                      />
                    )}

                    {/* Auto-Verified Complete Badge */}
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="hidden sm:inline">Completed</span>
                    </span>
                  </div>

                  {/* Right: Respective Timestamps & Navigation Link */}
                  <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-slate-200 shrink-0">
                    <div 
                      className="text-left md:text-right space-y-0.5 cursor-help"
                      title={`Completed on: ${getActivityExactTooltip(act.completedAt)}`}
                    >
                      <div className="flex items-center md:justify-end gap-1.5 text-xs font-mono font-bold text-slate-800">
                        <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{formatActivityTimestamp(act.completedAt)}</span>
                      </div>
                      <div className="flex items-center md:justify-end gap-1.5 text-[10px]">
                        <span className="text-slate-500">Timestamp:</span>
                        <span className="px-2 py-0.2 rounded-full font-bold bg-white text-slate-700 border border-slate-300">
                          {getActivityRelativeTime(act.completedAt)}
                        </span>
                      </div>
                    </div>

                    {/* Quick navigation shortcut button */}
                    {act.code && onNavigateToLessons && (
                      <button
                        onClick={() => onNavigateToLessons(act.code)}
                        className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-900 border-2 border-black text-xs font-bold transition flex items-center gap-1 shrink-0 cursor-pointer shadow-xs active:scale-95"
                        title={`Review ${act.code} lesson slides`}
                      >
                        <span>Review</span>
                        <ArrowRight className="w-3 h-3 text-emerald-600" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. FEATURED MEDAL SPOTLIGHT */}
      {featuredBadge && (
        <div className="bg-[#FDFBF7] border border-amber-300 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-xs text-slate-800">
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
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-300 text-slate-950 flex items-center gap-1 shadow-xs border border-amber-400">
                  <Star className="w-3 h-3 fill-slate-950" />
                  <span>Featured Medal</span>
                </span>
                <span className="text-xs font-mono text-amber-800 font-bold">+{featuredBadge.xpReward} XP</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mt-1">{featuredBadge.title}</h3>
              <p className="text-xs text-slate-600 max-w-lg mt-0.5 font-medium">{featuredBadge.description}</p>
              {featuredBadge.unlockedAt && (
                <p className="text-[11px] text-slate-500 mt-1 font-mono font-medium">
                  Earned on {new Date(featuredBadge.unlockedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                </p>
              )}
            </div>
          </div>

          <div className="text-xs text-slate-500 text-center sm:text-right shrink-0 font-medium">
            <p className="text-[11px] text-slate-600">Displayed on class leaderboard</p>
            <p className="text-[10px] text-slate-400">Click any medal below to change featured medal</p>
          </div>
        </div>
      )}

      {/* 4. DYNAMIC EARNED VIRTUAL MEDALS BY ACHIEVEMENT */}
      <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 sm:p-8 space-y-5 shadow-xs text-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2.5">
            <Award className="w-6 h-6 text-amber-600" />
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Earned Virtual Badges & Medals</h2>
              <p className="text-xs text-slate-600 font-medium">
                Dynamically tracked achievements for revision streaks, topic module completions, and quiz performance.
              </p>
            </div>
          </div>
          <MedalCountsSummary badges={unlockedBadges} size="md" />
        </div>

        {/* Dynamic earned virtual badges summary strip */}
        <StudentMedalStrip badges={unlockedBadges} compact={false} showCategoryBreakdown={true} />

        {/* 3 Categories with icons for each medal type */}
        <div className="space-y-3.5">
          {/* Streaks */}
          <DynamicCategoryMedalGroup
            title="Revision Streaks"
            category="streak"
            badges={allBadges}
            onBadgeClick={(b) => setSelectedBadgeForModal(b)}
          />

          {/* Module Completions */}
          <DynamicCategoryMedalGroup
            title="Topic Module Completions"
            category="topic_module"
            badges={allBadges}
            onBadgeClick={(b) => setSelectedBadgeForModal(b)}
          />

          {/* Quiz Performance */}
          <DynamicCategoryMedalGroup
            title="Quiz Performance & Mastery"
            category="quiz"
            badges={allBadges}
            onBadgeClick={(b) => setSelectedBadgeForModal(b)}
          />
        </div>
      </div>

      {/* 5. MEDAL TROPHY CABINET & FILTER CONTROLS */}
      <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs text-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <Trophy className="w-6 h-6 text-amber-600" />
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Virtual Medals Showcase</h2>
            </div>
            <p className="text-xs text-slate-600 mt-1 font-medium">
              Virtual medals awarded for study streaks, completing entire topic modules, and scoring highly on Cambridge quizzes.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchBadgeQuery}
              onChange={e => setSearchBadgeQuery(e.target.value)}
              placeholder="Search medals..."
              className="w-full pl-9 pr-3 py-2 bg-[#FDFBF7] border-2 border-black rounded-xl text-xs font-bold text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200">
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
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  selectedCategory === tab.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-[#FDFBF7] hover:bg-slate-100 text-slate-700 border border-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Status & Subject Filters */}
          <div className="flex items-center gap-2">
            {/* Subject Filter */}
            {selectedCategory === 'topic_module' && (
              <select
                value={selectedSubject}
                onChange={e => setSelectedSubject(e.target.value as any)}
                className="bg-[#FDFBF7] border-2 border-black rounded-xl px-2.5 py-1.5 text-xs text-slate-900 font-bold focus:outline-none cursor-pointer"
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
              className="bg-[#FDFBF7] border-2 border-black rounded-xl px-2.5 py-1.5 text-xs text-slate-900 font-bold focus:outline-none cursor-pointer"
            >
              <option value="all">All Status ({allBadges.length})</option>
              <option value="unlocked">Earned Medals ({unlockedBadges.length})</option>
              <option value="locked">In Progress ({lockedBadges.length})</option>
            </select>
          </div>
        </div>

        {/* Medals Grid */}
        {filteredBadges.length === 0 ? (
          <div className="text-center py-12 bg-[#FDFBF7] rounded-2xl border border-slate-200 p-6 space-y-2">
            <Award className="w-10 h-10 text-slate-400 mx-auto" />
            <h4 className="text-sm font-bold text-slate-900">No medals match your filter</h4>
            <p className="text-xs text-slate-600 max-w-sm mx-auto font-medium">
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
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-2 border-black rounded-3xl max-w-md w-full p-6 text-center space-y-4 shadow-xl relative animate-in zoom-in-95 duration-150 text-slate-800">
            <button
              onClick={() => setSelectedBadgeForModal(null)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 text-lg font-bold p-1 cursor-pointer"
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
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                selectedBadgeForModal.rarity === 'diamond' 
                  ? 'bg-teal-50 text-teal-800 border-teal-300' 
                  : selectedBadgeForModal.rarity === 'gold' 
                  ? 'bg-amber-50 text-amber-800 border-amber-300' 
                  : selectedBadgeForModal.rarity === 'silver'
                  ? 'bg-slate-100 text-slate-800 border-slate-300'
                  : 'bg-amber-100 text-amber-900 border-amber-400'
              }`}>
                {selectedBadgeForModal.rarity} Medal
              </span>
              <h3 className="text-xl font-bold text-slate-900 pt-1">{selectedBadgeForModal.title}</h3>
              <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed font-medium">
                {selectedBadgeForModal.description}
              </p>
            </div>

            <div className="bg-[#FDFBF7] border border-slate-200 rounded-2xl p-3 text-xs space-y-2 text-left">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">XP Reward:</span>
                <span className="font-mono font-bold text-amber-800">+{selectedBadgeForModal.xpReward} XP</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Status:</span>
                {selectedBadgeForModal.unlockedAt ? (
                  <span className="text-emerald-800 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Unlocked on {new Date(selectedBadgeForModal.unlockedAt).toLocaleDateString()}</span>
                  </span>
                ) : (
                  <span className="text-amber-800 font-bold">
                    {selectedBadgeForModal.progress?.label || 'In progress'}
                  </span>
                )}
              </div>
              {!selectedBadgeForModal.unlockedAt && selectedBadgeForModal.progress && (
                <div className="pt-1">
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-emerald-600 h-full rounded-full"
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
                  className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-xs border border-amber-500 cursor-pointer active:scale-95"
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
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Study Module {selectedBadgeForModal.topicCode} Slides</span>
                  </button>
                )
              )}
              <button
                onClick={() => setSelectedBadgeForModal(null)}
                className="w-full py-2 rounded-xl bg-white hover:bg-slate-50 border-2 border-black text-slate-800 font-bold text-xs transition cursor-pointer shadow-xs active:scale-95"
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
