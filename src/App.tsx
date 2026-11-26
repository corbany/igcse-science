import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { LessonSlidesViewer } from './components/LessonSlidesViewer';
import { SyllabusNotebook } from './components/SyllabusNotebook';
import { ExamGuidelines } from './components/ExamGuidelines';
import { PastExamsVault } from './components/PastExamsVault';
import { QuizArena } from './components/QuizArena';
import { ProgressTracker } from './components/ProgressTracker';
import { RevisionSchedule } from './components/RevisionSchedule';
import { AIRecommendations } from './components/AIRecommendations';
import { InstructorDashboard } from './components/InstructorDashboard';
import { StudentClassesView } from './components/StudentClassesView';
import { StudentTasksPanel } from './components/StudentTasksPanel';
import { StudentLeaderboard } from './components/StudentLeaderboard';
import { StudentProfileView } from './components/StudentProfileView';
import { GoogleSignInGate } from './components/GoogleSignInGate';
import { ClassCodeGateModal } from './components/ClassCodeGateModal';
import { UserProfileHeader } from './components/UserProfileHeader';
import { AvatarShop } from './components/AvatarShop';
import { GameLobby } from './components/GameLobby';
import { AdminBattleControl } from './components/AdminBattleControl';
import { BattleRoyaleArena } from './components/BattleRoyaleArena';
import { ErrorBoundary } from './components/ErrorBoundary';
import { StudentTaskProgressBar } from './components/StudentTaskProgressBar';
import { TaskView } from './components/TaskView';
import { Dashboard } from './components/Dashboard';
import { 
  subscribeToBattleState,
  subscribeToBattleConfig,
  BattleEventState,
  BattleEventConfig,
  awardQuizAndLevelGold,
  ensureRewardedLevelBaseline,
  QuizAndLevelRewardResult,
  recordDailyEngagementStreak,
  DailyStreakResult
} from './services/firebaseGameService';
import { fetchServerBattleState } from './services/battleRealtimeClient';
import {  ScienceSubject, UserProfile, StudentProgress, TrafficLightStatus, SubtopicQuizResult, SubtopicSlideProgress, QuizLengthRecord, TaskWithSubmission, ClassTask, QuizChallenge } from './types';
import {
  subscribeToUserChallenges,
  acceptQuizChallenge,
  declineQuizChallenge
} from './services/challengeService';
import { resolveSubtopicByQuery } from './data/subtopicSlidesData';
import { logCompletedActivity } from './services/activityService';
import { evaluateStudentBadges, calculateStudentLevel, calculateStreak, getLocalDateKey } from './services/badgeService';
import { 
  Users,
  ShieldAlert,
  GraduationCap,
  LayoutDashboard,
  Lock,
  Package,
  Layers,
  ArrowRight,
  Coins,
  Sparkles,
  Flame,
  Swords,
  X
} from 'lucide-react';
import { auth, logout } from './services/firebaseAuth';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { 
  getOrCreateUserProfile, 
  syncStudentProgressToClasses, 
  hydrateStudentProgressFromFirestore,
  fetchStudentEnrolledClasses,
  autoCheckTaskCompletion,
  autoEvaluateAllTasksForStudent,
  subscribeToStudentTasks,
  updatePastStudentQuizResultsWithNewTrafficLightParameters,
  calculateTrafficLightFromPercentage
} from './services/firestoreService';

const STORAGE_KEY_USER = 'igcse_0653_user_profile';
const STORAGE_KEY_PROGRESS = 'igcse_0653_student_progress';
const STORAGE_KEY_THEME = 'igcse_0653_theme';

const defaultProgress: StudentProgress = {
  completedLessons: [],
  topicConfidence: {},
  trafficLights: {},
  subtopicQuizScores: {},
  slidesReadBySubtopic: {},
  savedNotes: {},
  quizScores: {},
  practiceQuizByLength: {},
  cumulativeQuizPoints: 0,
  cumulativeQuizzesCount: 0,
  bestTotalXP: 0,
  lastActive: new Date().toISOString()
};

export default function App() {
  // Navigation & filter state (supports ?tab=assignments direct links from student task notification emails)
  const [currentTab, setCurrentTab] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search);
        const tabParam = params.get('tab');
        if (tabParam && tabParam !== 'chat') return tabParam;
      } catch (e) {
        // ignore
      }
    }
    return 'dashboard';
  });
  const [selectedSubject, setSelectedSubject] = useState<ScienceSubject | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [targetLessonCode, setTargetLessonCode] = useState<string | null>(null);
  const [activeTaskContext, setActiveTaskContext] = useState<{
    taskId: string;
    title: string;
    targetSubtopics: string[];
    targetSubject?: ScienceSubject | 'all';
    requiredQuizLength: number;
    type?: string;
  } | null>(null);

  // Auto-switch tab if URL query parameter changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam && tabParam !== 'chat' && tabParam !== currentTab) {
        setCurrentTab(tabParam);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Revision Royale Tournament & Arena State
  const [battleArenaActive, setBattleArenaActive] = useState<boolean>(false);
  const [studentEnteredArena, setStudentEnteredArena] = useState<boolean>(false);
  const [battleState, setBattleState] = useState<BattleEventState | null>(null);
  const [battleConfig, setBattleConfig] = useState<BattleEventConfig | null>(null);
  const [shopInitialTab, setShopInitialTab] = useState<'shop' | 'collection' | 'armory'>('shop');
  const currentTabRef = useRef<string>(currentTab);
  currentTabRef.current = currentTab;

  useEffect(() => {
    const unsubState = subscribeToBattleState((state) => {
      setBattleState(state);
      if (state.status === 'IN_PROGRESS' && currentTabRef.current === 'royale') {
        setBattleArenaActive(true);
        setStudentEnteredArena(true);
      } else if (state.status !== 'IN_PROGRESS' && state.status !== 'ENDED') {
        setBattleArenaActive(false);
        setStudentEnteredArena(false);
      }
    });
    const unsubConfig = subscribeToBattleConfig((cfg) => {
      setBattleConfig(cfg);
    });
    return () => {
      unsubState();
      unsubConfig();
    };
  }, []);

  useEffect(() => {
    if (battleState?.status === 'IN_PROGRESS' && currentTab === 'royale') {
      setBattleArenaActive(true);
      setStudentEnteredArena(true);
    } else if (battleState && battleState.status !== 'IN_PROGRESS' && battleState.status !== 'ENDED') {
      setBattleArenaActive(false);
      setStudentEnteredArena(false);
    }
  }, [battleState?.status, currentTab]);

  // Global Theme state (Light / Dark mode)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_THEME);
      return stored === 'dark' ? 'dark' : 'light';
    } catch (e) {
      return 'light';
    }
  });

  const handleToggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_THEME, theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {
      console.error(e);
    }
  }, [theme]);

  // Authentication & Profile state
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [signOutNotice, setSignOutNotice] = useState<string | null>(null);
  const initialBootSession = useRef<boolean>(Boolean(localStorage.getItem(STORAGE_KEY_USER)));

  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_USER);
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });

  // Student progress state
  const [progress, setProgress] = useState<StudentProgress>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PROGRESS);
      return stored ? JSON.parse(stored) : defaultProgress;
    } catch (e) {
      return defaultProgress;
    }
  });
  const progressRef = useRef<StudentProgress>(progress);
  progressRef.current = progress;
  const hydratedUidRef = useRef<string | null>(null);

  // List of enrolled class IDs for live syncing
  const [enrolledClassIds, setEnrolledClassIds] = useState<string[]>([]);

  // Instructor previewing student view mode
  const [isPreviewingAsStudent, setIsPreviewingAsStudent] = useState<boolean>(false);

  // Live real-time student tasks state
  const [studentTasks, setStudentTasks] = useState<TaskWithSubmission[]>([]);

  // Live 1v1 Leaderboard Quiz Challenges state
  const [userChallenges, setUserChallenges] = useState<QuizChallenge[]>([]);
  const [activeLiveChallenge, setActiveLiveChallenge] = useState<QuizChallenge | null>(null);
  const dismissedLiveChallengeIdsRef = useRef<Set<string>>(new Set());

  // Effective student status and synthetic profile for preview mode
  const isEffectiveStudent = user ? (user.role === 'student' || isPreviewingAsStudent) : false;
  const effectiveUser: UserProfile | null = user
    ? (isPreviewingAsStudent && user.role === 'instructor'
        ? { ...user, role: 'student', name: `${user.name} (Student View)` }
        : user)
    : null;
  const isStudentLockedInLobby = Boolean(
    isEffectiveStudent &&
    currentTab === 'royale' &&
    battleState?.isLobbyOpen &&
    battleState?.status !== 'IN_PROGRESS'
  );
  const isStudentLockedInLobbyRef = useRef<boolean>(isStudentLockedInLobby);
  isStudentLockedInLobbyRef.current = isStudentLockedInLobby;

  const handleTabChange = (nextTab: string) => {
    if (isStudentLockedInLobbyRef.current && nextTab !== 'royale') {
      return;
    }
    setCurrentTab(nextTab);
  };

  // Fallback poll of server battle state when a student is waiting on the Royale tab
  useEffect(() => {
    if (!isEffectiveStudent || currentTab !== 'royale' || battleArenaActive || battleState?.status === 'IN_PROGRESS') {
      return;
    }
    let cancelled = false;
    const syncFromServer = async () => {
      const srv = await fetchServerBattleState();
      if (cancelled || !srv) return;
      if (srv.config) {
        setBattleConfig(srv.config);
      }
      if (!srv.status) return;
      setBattleState((prev) => {
        const nextStatus = srv.status!;
        const nextLobby = Boolean(srv.isLobbyOpen);
        const nextStartedAt = srv.startedAt || null;
        if (
          prev &&
          prev.status === nextStatus &&
          prev.isLobbyOpen === nextLobby &&
          prev.startedAt === nextStartedAt
        ) {
          return prev;
        }
        return {
          isLobbyOpen: nextLobby,
          status: nextStatus,
          startedAt: nextStartedAt,
          stormRadius: srv.stormRadius ?? prev?.stormRadius ?? 3600,
          stormCenter: srv.stormCenter ?? prev?.stormCenter ?? { x: 2560, y: 2560 },
          stormFinalCenter: srv.stormFinalCenter ?? prev?.stormFinalCenter,
          currentWinner: srv.currentWinner ?? prev?.currentWinner ?? null
        };
      });
    };
    syncFromServer();
    const timer = setInterval(syncFromServer, 3000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [isEffectiveStudent, currentTab, battleArenaActive, battleState?.status]);

  useEffect(() => {
    if (!user?.id || !isEffectiveStudent) {
      setUserChallenges([]);
      setActiveLiveChallenge(null);
      return;
    }
    const unsub = subscribeToUserChallenges(
      user.id,
      (list) => {
        setUserChallenges(list);
        const liveMatch = list.find(
          (c) =>
            (c.status === 'accepted' || c.status === 'in_progress') &&
            !dismissedLiveChallengeIdsRef.current.has(c.id)
        );
        if (liveMatch && !isStudentLockedInLobbyRef.current) {
          setActiveLiveChallenge((prev) => {
            if (prev?.id === liveMatch.id) return prev;
            return liveMatch;
          });
          setCurrentTab('leaderboard');
        }
      },
      (err) => console.warn('Challenge subscription notice:', err)
    );
    return () => unsub();
  }, [user?.id, isEffectiveStudent]);

  const incomingPendingChallenges = user
    ? userChallenges.filter((c) => c.status === 'pending' && c.challengedId === user.id)
    : [];

  // Quiz, Level-Up & Daily Streak Gold reward state + toast
  const [lastQuizReward, setLastQuizReward] = useState<QuizAndLevelRewardResult | null>(null);
  const [rewardToast, setRewardToast] = useState<{
    title: string;
    subtitle: string;
    isLevelUp: boolean;
    variant?: 'quiz' | 'level' | 'streak';
  } | null>(null);
  const rewardToastTimerRef = useRef<any>(null);
  const lastStreakCheckedKeyRef = useRef<string>('');

  const showRewardToast = (res: QuizAndLevelRewardResult, sourceLabel: string) => {
    if (res.totalGoldAdded <= 0 && res.xpAdded <= 0 && res.levelsGained <= 0) return;
    if (rewardToastTimerRef.current) clearTimeout(rewardToastTimerRef.current);

    const isLevelUp = res.levelsGained > 0;
    const parts: string[] = [];
    if (res.quizGold > 0) parts.push(`+${res.quizGold} Quiz Gold`);
    if (res.levelUpGold > 0) parts.push(`+${res.levelUpGold} Level-Up Gold`);
    if (res.xpAdded > 0) parts.push(`+${res.xpAdded} XP`);

    setRewardToast({
      title: isLevelUp
        ? `Level Up! +${res.totalGoldAdded} Gold Earned`
        : `${sourceLabel}: +${res.totalGoldAdded} Gold`,
      subtitle: parts.join(' • '),
      isLevelUp,
      variant: isLevelUp ? 'level' : 'quiz'
    });
    rewardToastTimerRef.current = setTimeout(() => {
      setRewardToast(null);
    }, 5500);
  };

  const showStreakRewardToast = (res: DailyStreakResult) => {
    if (res.goldAwarded <= 0) return;
    if (rewardToastTimerRef.current) clearTimeout(rewardToastTimerRef.current);

    setRewardToast({
      title: `${res.currentStreak}-Day Study Streak! +${res.goldAwarded} Gold`,
      subtitle: `Consecutive daily engagement bonus • Tomorrow: +${res.nextDayBonus} Gold`,
      isLevelUp: false,
      variant: 'streak'
    });
    rewardToastTimerRef.current = setTimeout(() => {
      setRewardToast(null);
    }, 5500);
  };

  const withDailyStreakProgress = (candidate: StudentProgress): StudentProgress => {
    const streakEval = calculateStreak(candidate);
    return {
      ...candidate,
      currentStreak: streakEval.currentStreak,
      longestStreak: streakEval.longestStreak,
      lastStreakDate: streakEval.lastStreakDate,
      activeDates: streakEval.activeDates
    };
  };

  const triggerDailyEngagementTracking = (seedProgress?: StudentProgress) => {
    if (!user?.id || user.role !== 'student' || isPreviewingAsStudent || enrolledClassIds.length === 0) return;
    if (hydratedUidRef.current !== user.id) return;

    const todayKey = getLocalDateKey();
    const dedupeKey = `${user.id}:${todayKey}`;
    if (lastStreakCheckedKeyRef.current === dedupeKey) return;
    lastStreakCheckedKeyRef.current = dedupeKey;

    const source = seedProgress || progressRef.current;
    const localStreakEval = calculateStreak(source);
    if (
      source.lastStreakDate !== localStreakEval.lastStreakDate ||
      source.currentStreak !== localStreakEval.currentStreak ||
      source.longestStreak !== localStreakEval.longestStreak
    ) {
      const nextLocal = applyMonotonicBadgesAndXP({
        ...source,
        currentStreak: localStreakEval.currentStreak,
        longestStreak: localStreakEval.longestStreak,
        lastStreakDate: localStreakEval.lastStreakDate,
        activeDates: localStreakEval.activeDates
      }, user);
      progressRef.current = nextLocal;
      setProgress(nextLocal);
      try {
        localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(nextLocal));
      } catch {}
    }

    recordDailyEngagementStreak(user.id, {
      isInstructorPreview: isPreviewingAsStudent,
      seedStreak: source.currentStreak,
      seedLongestStreak: source.longestStreak,
      seedLastStreakDate: source.lastStreakDate
    }).then((res) => {
      const cur = progressRef.current;
      const mergedDates = Array.from(new Set([...(cur.activeDates || []), res.lastStreakDate])).sort();
      if (
        cur.currentStreak !== res.currentStreak ||
        cur.longestStreak !== res.longestStreak ||
        cur.lastStreakDate !== res.lastStreakDate
      ) {
        const synced = applyMonotonicBadgesAndXP({
          ...cur,
          currentStreak: res.currentStreak,
          longestStreak: Math.max(cur.longestStreak || 0, res.longestStreak),
          lastStreakDate: res.lastStreakDate,
          activeDates: mergedDates
        }, user);
        progressRef.current = synced;
        setProgress(synced);
        try {
          localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(synced));
        } catch {}
      }
      if (res.goldAwarded > 0) {
        showStreakRewardToast(res);
      }
    }).catch(() => {});
  };

  useEffect(() => {
    if (!user?.id || user.role !== 'student') return;
    const currentScholarLv = calculateStudentLevel(progress.bestTotalXP || 0).level;
    ensureRewardedLevelBaseline(user.id, currentScholarLv);
  }, [user?.id, user?.role]);

  // Record daily active engagement once hydrated student session is active
  useEffect(() => {
    if (!user?.id || user.role !== 'student' || isPreviewingAsStudent || enrolledClassIds.length === 0) return;
    if (hydratedUidRef.current !== user.id) return;
    triggerDailyEngagementTracking(progressRef.current);
  }, [user?.id, user?.role, isPreviewingAsStudent, enrolledClassIds.length]);

  // Real-time live subscription for student tasks
  useEffect(() => {
    if (!effectiveUser || !isEffectiveStudent) {
      setStudentTasks([]);
      return;
    }
    const unsubscribe = subscribeToStudentTasks(effectiveUser, enrolledClassIds, progress, (tasks) => {
      setStudentTasks(tasks);
    });
    return () => unsubscribe();
  }, [effectiveUser?.id, effectiveUser?.role, isEffectiveStudent, enrolledClassIds.length, progress]);

  const pendingTasksCount = studentTasks.filter(t => t.status !== 'ended' && t.submission?.status !== 'completed').length;

  // Firebase Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        try {
          const profile = await getOrCreateUserProfile(
            fbUser.uid,
            fbUser.displayName || 'Student',
            fbUser.email || ''
          );

          // Load enrolled classes for progress sync (match by UID or email for auto-heal)
          const classes = await fetchStudentEnrolledClasses(profile.id, profile.email);
          const validClasses = classes.filter(c => c && c.id && c.id !== 'class_default_0653');

          // User requirement:
          // "any student who is currently in the group should be signed out unless they are entered into a class that an instructor has created."
          // If a student had an active pre-existing session on boot, but is not enrolled in any instructor-created class, sign them out immediately!
          if (profile.role === 'student' && validClasses.length === 0 && initialBootSession.current) {
            initialBootSession.current = false;
            localStorage.removeItem(STORAGE_KEY_USER);
            localStorage.removeItem('igcse_0653_offline_enrolled_' + profile.id);
            try {
              await logout();
            } catch {}
            setUser(null);
            setEnrolledClassIds([]);
            setSignOutNotice('Notice: The default class SCI-0653 has been retired. Students must enter an instructor-created class code to access revision materials. Please sign in and enter your teacher’s class code.');
            setAuthLoading(false);
            return;
          }

          initialBootSession.current = false;
          const validIds = validClasses.map(c => c.id);
          if (profile.role === 'student') {
            try {
              const merged = await hydrateStudentProgressFromFirestore(profile.id, validIds, progressRef.current);
              hydratedUidRef.current = profile.id;
              progressRef.current = merged;
              setProgress(merged);
              try {
                localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(merged));
              } catch {}
            } catch {
              hydratedUidRef.current = profile.id;
            }
          } else {
            hydratedUidRef.current = profile.id;
          }
          setUser(profile);
          localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(profile));
          setEnrolledClassIds(validIds);
        } catch (e) {
          console.error('Error resolving user profile on auth change:', e);
        }
      } else {
        const hadStoredUser = Boolean(localStorage.getItem(STORAGE_KEY_USER));
        localStorage.removeItem(STORAGE_KEY_USER);
        hydratedUidRef.current = null;
        setUser(null);
        setEnrolledClassIds([]);
        if (hadStoredUser) {
          setSignOutNotice('Your Google session expired. Please sign in with Google to reconnect to your class and Revision Royale lobby.');
        }
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Strict role security: Students are never allowed into instructor view
  useEffect(() => {
    if (user && user.role === 'student' && currentTab === 'instructor') {
      setCurrentTab('lessons');
    }
  }, [user, currentTab]);

  // Persist user changes
  useEffect(() => {
    if (user) {
      try {
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      } catch (e) {
        console.error(e);
      }
    }
  }, [user]);

  // Persist progress changes & sync to instructor classes once remote progress is hydrated
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(progress));
    } catch (e) {
      console.error(e);
    }

    if (user && user.role === 'student' && enrolledClassIds.length > 0 && hydratedUidRef.current === user.id) {
      syncStudentProgressToClasses(user, progress, enrolledClassIds);
      autoEvaluateAllTasksForStudent(user, enrolledClassIds, progress);
    }
  }, [progress, user, enrolledClassIds]);

  // Migrate past student quiz results with new traffic light parameters & repair legacy raw quiz counts (v3)
  useEffect(() => {
    const MIGRATION_KEY = 'igcse_traffic_light_v3_migrated';
    const subScores = progress?.subtopicQuizScores || {};
    const currentLights = progress?.trafficLights || {};
    let needsUpdate = false;

    for (const [code, res] of Object.entries(subScores)) {
      if (res) {
        const pct = res.percentage !== undefined ? res.percentage : Math.round(((res.score || 0) / (res.total || 10)) * 100);
        const expected = calculateTrafficLightFromPercentage(pct);
        if (currentLights[code] !== expected) {
          needsUpdate = true;
          break;
        }
      }
    }

    if (!localStorage.getItem(MIGRATION_KEY) || needsUpdate) {
      updatePastStudentQuizResultsWithNewTrafficLightParameters().then(() => {
        localStorage.setItem(MIGRATION_KEY, 'true');
        try {
          const raw = localStorage.getItem(STORAGE_KEY_PROGRESS);
          if (raw) setProgress(JSON.parse(raw));
        } catch {}
      }).catch(err => {
        console.warn('Auto-migration error:', err);
      });
    }
  }, [user?.id]);

  // React to global progress updates
  useEffect(() => {
    const handleProgressUpdated = () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY_PROGRESS);
        if (raw) setProgress(JSON.parse(raw));
      } catch {}
    };
    window.addEventListener('igcse_progress_updated', handleProgressUpdated);
    return () => window.removeEventListener('igcse_progress_updated', handleProgressUpdated);
  }, []);

  const applyMonotonicBadgesAndXP = (candidate: StudentProgress, profile?: UserProfile | null): StudentProgress => {
    const badgeEval = evaluateStudentBadges(candidate, profile);
    const mergedMap = new Map<string, string>();
    (candidate.earnedBadges || []).forEach(b => {
      if (b?.badgeId) mergedMap.set(b.badgeId, b.unlockedAt);
    });
    badgeEval.unlockedBadges.forEach(b => {
      if (!mergedMap.has(b.id)) {
        mergedMap.set(b.id, b.unlockedAt || new Date().toISOString());
      }
    });
    const mergedEarned = Array.from(mergedMap.entries()).map(([badgeId, unlockedAt]) => ({ badgeId, unlockedAt }));
    return {
      ...candidate,
      earnedBadges: mergedEarned,
      bestTotalXP: Math.max(candidate.bestTotalXP || 0, badgeEval.totalXP, profile?.xp || 0)
    };
  };

  // Handler functions for progress updates
  const handleUpdateSlidesRead = (subtopicCode: string, slideProgress: SubtopicSlideProgress) => {
    const base = progressRef.current;
    const prevScholarLevel = calculateStudentLevel(base.bestTotalXP || 0).level;
    const completedSet = new Set(base.completedLessons || []);
    if (slideProgress.allSlidesRead) {
      completedSet.add(subtopicCode);
    }
    const updated = applyMonotonicBadgesAndXP(withDailyStreakProgress({
      ...base,
      completedLessons: Array.from(completedSet),
      slidesReadBySubtopic: {
        ...(base.slidesReadBySubtopic || {}),
        [subtopicCode]: slideProgress
      },
      lastActive: new Date().toISOString()
    }), effectiveUser || user);
    const newScholarLevel = calculateStudentLevel(updated.bestTotalXP || 0).level;

    progressRef.current = updated;
    setProgress(updated);
    try {
      localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(updated));
    } catch {}
    triggerDailyEngagementTracking(updated);
    if (user && isEffectiveStudent && enrolledClassIds.length > 0) {
      syncStudentProgressToClasses(effectiveUser || user, updated, enrolledClassIds);
      autoCheckTaskCompletion(effectiveUser || user, enrolledClassIds, 'slides', subtopicCode, { progress: updated });
    }

    if (user && isEffectiveStudent && newScholarLevel > prevScholarLevel) {
      awardQuizAndLevelGold({
        uid: user.id,
        prevScholarLevel,
        newScholarLevel,
        isInstructorPreview: isPreviewingAsStudent
      }).then(res => {
        if (res.levelUpGold > 0) showRewardToast(res, 'Rank Level Up');
      }).catch(() => {});
    }
  };

  const handleToggleCompleteLesson = (lessonId: string) => {
    const base = progressRef.current;
    const isCompleted = base.completedLessons.includes(lessonId);
    // Prevent marking a lesson complete unless all slides in that subtopic have actually been read
    if (!isCompleted && base.slidesReadBySubtopic?.[lessonId] && !base.slidesReadBySubtopic[lessonId].allSlidesRead) {
      return;
    }
    const newCompleted = isCompleted
      ? base.completedLessons.filter(id => id !== lessonId)
      : [...base.completedLessons, lessonId];
    const updated: StudentProgress = withDailyStreakProgress({ ...base, completedLessons: newCompleted, lastActive: new Date().toISOString() });
    progressRef.current = updated;
    setProgress(updated);
    try {
      localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(updated));
    } catch {}
    triggerDailyEngagementTracking(updated);
    if (user && isEffectiveStudent && enrolledClassIds.length > 0) {
      syncStudentProgressToClasses(effectiveUser || user, updated, enrolledClassIds);
      autoCheckTaskCompletion(effectiveUser || user, enrolledClassIds, 'slides', lessonId, { progress: updated });
    }
  };

  const handleUpdateConfidence = (topicCode: string, rating: number) => {
    const base = progressRef.current;
    const updated: StudentProgress = withDailyStreakProgress({
      ...base,
      topicConfidence: {
        ...base.topicConfidence,
        [topicCode]: rating
      },
      lastActive: new Date().toISOString()
    });
    progressRef.current = updated;
    setProgress(updated);
    try {
      localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(updated));
    } catch {}
    triggerDailyEngagementTracking(updated);
    if (user && user.role === 'student' && enrolledClassIds.length > 0) {
      syncStudentProgressToClasses(user, updated, enrolledClassIds);
    }
  };

  const handleUpdateNote = (topicCode: string, noteContent: string) => {
    setProgress(prev => withDailyStreakProgress({
      ...prev,
      savedNotes: {
        ...prev.savedNotes,
        [topicCode]: noteContent
      },
      lastActive: new Date().toISOString()
    }));
    triggerDailyEngagementTracking();
  };

  const handleQuizCompleted = (
    subject: string,
    score: number,
    total: number,
    meta?: { topics?: string[]; subtopics?: string[]; taskId?: string; answeredCount?: number; requestedLength?: number }
  ) => {
    const safeTotal = Math.max(1, total);
    const completedForReward = meta?.answeredCount !== undefined ? Math.max(0, meta.answeredCount) : safeTotal;
    const pct = Math.round((score / safeTotal) * 100);
    const nowIso = new Date().toISOString();
    const recordLen = meta?.requestedLength || safeTotal;
    const recordKey = `${meta?.taskId ? `task_${meta.taskId}` : subject}_len${recordLen}_${(meta?.subtopics && meta.subtopics.length > 0 ? meta.subtopics.slice().sort().join(',') : (meta?.topics || []).slice().sort().join(',')) || 'general'}`;
    const lengthRecord: QuizLengthRecord = {
      score,
      total: safeTotal,
      percentage: pct,
      quizLength: safeTotal,
      requestedLength: meta?.requestedLength ?? safeTotal,
      topics: meta?.topics,
      subtopics: meta?.subtopics,
      taskId: meta?.taskId,
      date: nowIso
    };

    const base = progressRef.current;
    const prevScholarLevel = calculateStudentLevel(base.bestTotalXP || 0).level;

    const prevSubScores = Object.values(base.subtopicQuizScores || {});
    const prevMainScores = Object.values(base.quizScores || {});
    const prevLengthRecords = Object.values(base.practiceQuizByLength || {});
    const prevLengthDates = new Set(prevLengthRecords.map(r => r?.date).filter(Boolean));
    const prevUnrecordedMain = prevMainScores.filter(q => q && !prevLengthDates.has(q.date));

    const prevSubSum = prevSubScores.reduce((acc, s) => acc + (s?.score || 0), 0);
    const prevMainSum = prevMainScores.reduce((acc, q) => acc + (q?.score || 0), 0);
    const prevLengthSum = prevLengthRecords.reduce((acc, r) => acc + (r?.score || 0), 0) +
      prevUnrecordedMain.reduce((acc, q) => acc + (q?.score || 0), 0);

    const prevBaselinePoints = Math.max(
      base.cumulativeQuizPoints || 0,
      prevSubSum + prevMainSum,
      prevSubSum + prevLengthSum
    );
    const prevBaselineCount = Math.max(
      base.cumulativeQuizzesCount || 0,
      prevSubScores.length + prevMainScores.length,
      prevSubScores.length + prevLengthRecords.length + prevUnrecordedMain.length
    );

    // Keep highest subject benchmark so a shorter (<40 question) or lower quiz never reduces subject score or badges
    const existingSubjectScore = base.quizScores?.[subject];
    const existingPct = existingSubjectScore ? (existingSubjectScore.score / Math.max(1, existingSubjectScore.total)) : -1;
    const newPct = score / safeTotal;
    const shouldUpdateSubjectScore =
      !existingSubjectScore ||
      newPct > existingPct ||
      (newPct === existingPct && score >= existingSubjectScore.score);

    const updated = applyMonotonicBadgesAndXP(withDailyStreakProgress({
      ...base,
      quizScores: {
        ...base.quizScores,
        [subject]: shouldUpdateSubjectScore ? { score, total: safeTotal, date: nowIso } : existingSubjectScore
      },
      practiceQuizByLength: {
        ...(base.practiceQuizByLength || {}),
        [recordKey]: lengthRecord
      },
      cumulativeQuizPoints: prevBaselinePoints + score,
      cumulativeQuizzesCount: prevBaselineCount + 1,
      lastActive: nowIso
    }), effectiveUser || user);

    const newScholarLevel = calculateStudentLevel(updated.bestTotalXP || 0).level;

    progressRef.current = updated;
    setProgress(updated);
    try {
      localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(updated));
    } catch {}
    triggerDailyEngagementTracking(updated);
    if (user && isEffectiveStudent && enrolledClassIds.length > 0) {
      syncStudentProgressToClasses(effectiveUser || user, updated, enrolledClassIds);
    }

    if (user && isEffectiveStudent) {
      awardQuizAndLevelGold({
        uid: user.id,
        quizQuestionsCompleted: completedForReward,
        quizScore: score,
        prevScholarLevel,
        newScholarLevel,
        isInstructorPreview: isPreviewingAsStudent
      }).then(rewardRes => {
        setLastQuizReward(rewardRes);
        showRewardToast(rewardRes, `Practice Quiz (${completedForReward} Qs)`);
      }).catch(() => {});

      const targetCode = meta?.subtopics?.[0] || meta?.topics?.[0] || subject;
      autoCheckTaskCompletion(effectiveUser || user, enrolledClassIds, 'quiz', targetCode, {
        quizScore: pct,
        quizLength: meta?.requestedLength ?? safeTotal,
        progress: updated
      });
      logCompletedActivity(user.id, {
        type: 'subject_quiz',
        title: `${subject.charAt(0).toUpperCase() + subject.slice(1)} Practice Quiz (${safeTotal} Questions)`,
        subtitle: meta?.subtopics?.length ? `Topics: ${meta.subtopics.join(', ')}` : 'Practice Quiz Challenge',
        subject: subject as ScienceSubject,
        score,
        total: safeTotal,
        percentage: pct,
        passed: score / safeTotal >= 0.7,
        trafficLight: (score / safeTotal >= 0.8) ? 'green' : (score / safeTotal >= 0.5) ? 'orange' : 'red',
        completedAt: nowIso
      });
    }
  };

  const handleUpdateTrafficLight = (subtopicCode: string, status: TrafficLightStatus) => {
    const base = progressRef.current;
    const updated: StudentProgress = withDailyStreakProgress({
      ...base,
      trafficLights: {
        ...(base.trafficLights || {}),
        [subtopicCode]: status
      },
      lastActive: new Date().toISOString()
    });
    progressRef.current = updated;
    setProgress(updated);
    try {
      localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(updated));
    } catch {}
    triggerDailyEngagementTracking(updated);
    if (user && isEffectiveStudent && enrolledClassIds.length > 0) {
      syncStudentProgressToClasses(effectiveUser || user, updated, enrolledClassIds);
      autoCheckTaskCompletion(effectiveUser || user, enrolledClassIds, 'traffic_light', subtopicCode, {
        trafficLight: status,
        progress: updated
      });
    }
  };

  const handleSaveSubtopicQuizResult = (subtopicCode: string, result: SubtopicQuizResult) => {
    const assignedLight: TrafficLightStatus = result.percentage >= 80 ? 'green' : result.percentage >= 50 ? 'orange' : 'red';
    const base = progressRef.current;
    const prevScholarLevel = calculateStudentLevel(base.bestTotalXP || 0).level;

    const completedSet = new Set(base.completedLessons || []);
    if (base.slidesReadBySubtopic?.[subtopicCode]?.allSlidesRead) {
      completedSet.add(subtopicCode);
    }

    const prevSubScores = Object.values(base.subtopicQuizScores || {});
    const prevMainScores = Object.values(base.quizScores || {});
    const prevLengthRecords = Object.values(base.practiceQuizByLength || {});
    const prevLengthDates = new Set(prevLengthRecords.map(r => r?.date).filter(Boolean));
    const prevUnrecordedMain = prevMainScores.filter(q => q && !prevLengthDates.has(q.date));

    const prevSubSum = prevSubScores.reduce((acc, s) => acc + (s?.score || 0), 0);
    const prevMainSum = prevMainScores.reduce((acc, q) => acc + (q?.score || 0), 0);
    const prevLengthSum = prevLengthRecords.reduce((acc, r) => acc + (r?.score || 0), 0) +
      prevUnrecordedMain.reduce((acc, q) => acc + (q?.score || 0), 0);

    const prevBaselinePoints = Math.max(
      base.cumulativeQuizPoints || 0,
      prevSubSum + prevMainSum,
      prevSubSum + prevLengthSum
    );
    const prevBaselineCount = Math.max(
      base.cumulativeQuizzesCount || 0,
      prevSubScores.length + prevMainScores.length,
      prevSubScores.length + prevLengthRecords.length + prevUnrecordedMain.length
    );

    const updated = applyMonotonicBadgesAndXP(withDailyStreakProgress({
      ...base,
      completedLessons: Array.from(completedSet),
      trafficLights: {
        ...(base.trafficLights || {}),
        [subtopicCode]: assignedLight
      },
      subtopicQuizScores: {
        ...(base.subtopicQuizScores || {}),
        [subtopicCode]: result
      },
      cumulativeQuizPoints: prevBaselinePoints + (result.score || 0),
      cumulativeQuizzesCount: prevBaselineCount + 1,
      lastActive: new Date().toISOString()
    }), effectiveUser || user);

    const newScholarLevel = calculateStudentLevel(updated.bestTotalXP || 0).level;

    progressRef.current = updated;
    setProgress(updated);
    try {
      localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(updated));
    } catch {}
    triggerDailyEngagementTracking(updated);
    if (user && isEffectiveStudent && enrolledClassIds.length > 0) {
      syncStudentProgressToClasses(effectiveUser || user, updated, enrolledClassIds);
    }

    if (user && isEffectiveStudent) {
      awardQuizAndLevelGold({
        uid: user.id,
        quizQuestionsCompleted: result.total || 10,
        quizScore: result.score,
        prevScholarLevel,
        newScholarLevel,
        isInstructorPreview: isPreviewingAsStudent
      }).then(rewardRes => {
        setLastQuizReward(rewardRes);
        showRewardToast(rewardRes, `${subtopicCode} Traffic Light Quiz`);
      }).catch(() => {});

      autoCheckTaskCompletion(effectiveUser || user, enrolledClassIds, 'quiz', subtopicCode, {
        quizScore: result.percentage,
        quizLength: result.total || 10,
        trafficLight: assignedLight,
        progress: updated
      });
      logCompletedActivity(user.id, {
        type: 'subtopic_quiz',
        title: `${subtopicCode} Knowledge Check`,
        subtitle: `${result.total || 10}-Question Traffic Light Quiz`,
        code: subtopicCode,
        subject: (subtopicCode.startsWith('B') ? 'biology' : subtopicCode.startsWith('C') ? 'chemistry' : 'physics') as ScienceSubject,
        score: result.score,
        total: result.total || 10,
        percentage: result.percentage,
        passed: result.passed,
        trafficLight: assignedLight,
        completedAt: result.date || new Date().toISOString()
      });
    }
  };

  const handleOpenTaskInQuizzes = (task: ClassTask | TaskWithSubmission) => {
    setActiveTaskContext({
      taskId: task.id,
      title: task.title,
      targetSubtopics: task.targetSubtopics || [],
      targetSubject: task.targetSubject,
      requiredQuizLength: Math.max(1, Math.min(40, Number(task.requiredQuizLength) || 10)),
      type: task.type
    });
    setCurrentTab('quizzes');
  };

  const handleOpenTaskInLessons = (task: ClassTask | TaskWithSubmission, subtopicCode?: string) => {
    setActiveTaskContext({
      taskId: task.id,
      title: task.title,
      targetSubtopics: task.targetSubtopics || [],
      targetSubject: task.targetSubject,
      requiredQuizLength: Math.max(1, Math.min(40, Number(task.requiredQuizLength) || 10)),
      type: task.type
    });
    handleOpenLesson(subtopicCode || task.targetSubtopics?.[0]);
  };

  const handleOpenLesson = (topicCode?: string) => {
    // Clear global search query so opening a lesson task does NOT filter out all other subtopics from the syllabus sidebar!
    setSearchQuery('');
    if (topicCode) {
      setTargetLessonCode(topicCode);
      const matched = resolveSubtopicByQuery(topicCode);
      if (matched) {
        setSelectedSubject(matched.subject);
      } else {
        const clean = topicCode.trim().toUpperCase();
        if (clean.startsWith('B') || clean.includes('BIO')) {
          setSelectedSubject('biology');
        } else if (clean.startsWith('C') || clean.includes('CHEM')) {
          setSelectedSubject('chemistry');
        } else if (clean.startsWith('P') || clean.includes('PHYS')) {
          setSelectedSubject('physics');
        }
      }
    }
    setCurrentTab('lessons');
  };

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (e) {
      console.error('Logout error:', e);
    }
    hydratedUidRef.current = null;
    setUser(null);
    localStorage.removeItem(STORAGE_KEY_USER);
    setCurrentTab('lessons');
  };

  // Extract weak topics for scheduling and recommendations
  const weakTopicCodes = Object.entries(progress.topicConfidence)
    .filter(([_, rating]) => rating <= 2)
    .map(([code]) => code);

  // 1. Initial Loading State
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#FDFBF7] text-slate-800 font-sans">
        <div className="w-8 h-8 border-3 border-slate-800 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-base font-bold text-slate-800">
          Connecting to Cambridge IGCSE 0653 Science Hub...
        </p>
      </div>
    );
  }

  // 2. Mandatory Google Account Sign-In Gate
  // When people enter this website they have to log in with their Google account.
  if (!user) {
    return (
      <GoogleSignInGate
        theme={theme}
        noticeMessage={signOutNotice}
        onSignInSuccess={async (profile) => {
          setSignOutNotice(null);
          initialBootSession.current = false;
          try {
            const classes = await fetchStudentEnrolledClasses(profile.id, profile.email);
            const validClasses = classes.filter(c => c && c.id && c.id !== 'class_default_0653');
            const validIds = validClasses.map(c => c.id);
            if (profile.role === 'student') {
              const merged = await hydrateStudentProgressFromFirestore(profile.id, validIds, progressRef.current);
              hydratedUidRef.current = profile.id;
              progressRef.current = merged;
              setProgress(merged);
              try {
                localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(merged));
              } catch {}
            } else {
              hydratedUidRef.current = profile.id;
            }
            setUser(profile);
            localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(profile));
            setEnrolledClassIds(validIds);
          } catch (e) {
            console.error('Error fetching enrolled classes:', e);
            hydratedUidRef.current = profile.id;
            setUser(profile);
            setEnrolledClassIds([]);
          }
        }}
      />
    );
  }

  // 3. Mandatory Class Code Gate for Students on First Sign-In
  // After students sign in for the first time they must enter a class code to join an instructor's class
  if (user.role === 'student' && enrolledClassIds.length === 0) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'}`}>
        <ClassCodeGateModal
          user={user}
          progress={progress}
          theme={theme}
          onSignOut={async () => {
            try {
              await logout();
            } catch {}
            hydratedUidRef.current = null;
            localStorage.removeItem(STORAGE_KEY_USER);
            setUser(null);
            setEnrolledClassIds([]);
          }}
          onClassJoined={async (classItem) => {
            hydratedUidRef.current = user.id;
            setEnrolledClassIds([classItem.id]);
          }}
        />
      </div>
    );
  }

  // 4. Authenticated App Experience
  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${theme === 'dark' ? 'bg-black text-slate-100' : 'bg-[#EDE6D8] text-slate-900'}`}>
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={handleTabChange}
        selectedSubject={selectedSubject}
        setSelectedSubject={setSelectedSubject}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        user={user}
        setUser={setUser as any}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onSignOut={handleSignOut}
        enrolledClassIds={enrolledClassIds}
        progress={progress}
        pendingTasksCount={pendingTasksCount}
        onNavigateToLessons={(subtopicCode, task) =>
          task ? handleOpenTaskInLessons(task, subtopicCode) : handleOpenLesson(subtopicCode)
        }
        onNavigateToQuizzes={(_topicCode, task) => {
          if (task) {
            handleOpenTaskInQuizzes(task);
          } else {
            handleTabChange('quizzes');
          }
        }}
        isPreviewingAsStudent={isPreviewingAsStudent}
        onEnterStudentPreview={() => {
          setIsPreviewingAsStudent(true);
          setCurrentTab('dashboard');
        }}
        onExitStudentPreview={() => {
          setIsPreviewingAsStudent(false);
          setCurrentTab('instructor');
        }}
        battleState={battleState}
        battleConfig={battleConfig}
        onOpenShop={() => {
          if (isStudentLockedInLobby) return;
          setShopInitialTab('shop');
          setCurrentTab('shop');
        }}
        pendingChallengesCount={incomingPendingChallenges.length}
        lockedInLobby={isStudentLockedInLobby}
      />

      {/* Role Distinction Sub-bar */}
      {user.role === 'instructor' && isPreviewingAsStudent ? (
        <div className="bg-[#EBF3F5] border-b border-slate-300 px-4 sm:px-6 lg:px-8 py-2 text-xs text-slate-800">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800">Student Preview Mode:</span>
              <span className="text-slate-600">
                You are viewing the app as a student would see it.
              </span>
            </div>
            <button
              onClick={() => {
                setIsPreviewingAsStudent(false);
                setCurrentTab('instructor');
              }}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Exit Preview</span>
            </button>
          </div>
        </div>
      ) : user.role === 'instructor' ? (
        <div className="bg-[#EBF3F5] border-b border-slate-300 px-4 sm:px-6 lg:px-8 py-2 text-xs text-slate-800">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800">Instructor Mode:</span>
              <span className="text-slate-600">
                Manage your classes, assign tasks, and track cohort completion.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  setIsPreviewingAsStudent(true);
                  setCurrentTab('dashboard');
                }}
                className="px-3 py-1 rounded-lg bg-white border border-slate-300 text-slate-800 hover:bg-slate-100 font-bold transition flex items-center gap-1.5 cursor-pointer"
                title="Preview exact page and tabs a student would see"
              >
                <GraduationCap className="w-3.5 h-3.5 text-slate-700" />
                <span>Preview Student</span>
              </button>

              {currentTab !== 'instructor' ? (
                <button
                  onClick={() => setCurrentTab('instructor')}
                  className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold transition"
                >
                  Teaching Hub
                </button>
              ) : (
                <button
                  onClick={() => setCurrentTab('lessons')}
                  className="px-3 py-1 rounded-lg bg-white border border-slate-300 text-slate-800 hover:bg-slate-100 font-semibold transition"
                >
                  View Lessons
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Student Mode indicator */
        <div className="bg-[#F5EFE6] border-b border-slate-300 px-4 sm:px-6 lg:px-8 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800">Student Space</span>
              <span>•</span>
              <span>{user.name} ({user.email})</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleTabChange('classes')}
                className="flex items-center gap-1 text-xs text-slate-800 hover:text-black font-bold transition cursor-pointer"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Join Class</span>
              </button>
              <span>|</span>
              <span className="font-bold text-slate-800">Target Grade: {user.targetGrade || 'A*'}</span>
            </div>
          </div>
        </div>
      )}

      {/* STUDENT TASK PROGRESSION BAR (LOCKED TO TOP OF SCREEN) */}
      {isEffectiveStudent && !isStudentLockedInLobby && (
        <StudentTaskProgressBar
          tasks={studentTasks}
          onNavigateToTasks={() => handleTabChange('tasks')}
          enrolledClassCount={enrolledClassIds.length}
        />
      )}

      {/* INCOMING 1V1 QUIZ CHALLENGE ALERT BANNER (when browsing other tabs) */}
      {isEffectiveStudent && !isStudentLockedInLobby && incomingPendingChallenges.length > 0 && currentTab !== 'leaderboard' && !activeLiveChallenge && (
        <div className="bg-amber-50 border-b border-amber-300 px-4 sm:px-6 lg:px-8 py-2.5 text-xs text-slate-900">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 min-w-0">
              <Swords className="w-4 h-4 text-amber-800 shrink-0" />
              <span className="truncate">
                <strong>{incomingPendingChallenges[0].challengerName}</strong> challenged you to a{' '}
                <strong className="font-mono tabular-nums">{incomingPendingChallenges[0].questionCount}-question</strong> live quiz ({incomingPendingChallenges[0].topics.join(', ')})!
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={async () => {
                  const target = incomingPendingChallenges[0];
                  try {
                    await acceptQuizChallenge(target.id);
                    setActiveLiveChallenge({ ...target, status: 'accepted' });
                    setCurrentTab('leaderboard');
                  } catch (e) {
                    console.error('Accept challenge failed:', e);
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer whitespace-nowrap"
              >
                Accept & Start Live Quiz
              </button>
              <button
                onClick={() => setCurrentTab('leaderboard')}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-bold cursor-pointer whitespace-nowrap"
              >
                View in Leaderboard
              </button>
              <button
                onClick={() => declineQuizChallenge(incomingPendingChallenges[0].id).catch(() => {})}
                className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-rose-50 border border-slate-300 text-rose-700 font-bold cursor-pointer whitespace-nowrap"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 1: USER PROFILE & LOADOUT BANNER */}
      {isEffectiveStudent && (
        <div className="border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8 py-3 shadow-xs">
          <div className="max-w-7xl mx-auto">
            <UserProfileHeader
              user={effectiveUser || user}
              theme={theme}
              battleState={battleState}
              streakDays={progress.currentStreak || calculateStreak(progress).currentStreak}
              longestStreak={progress.longestStreak || calculateStreak(progress).longestStreak}
              onOpenShop={() => {
                if (isStudentLockedInLobby) return;
                setShopInitialTab('shop');
                setCurrentTab('shop');
              }}
              onOpenCollection={() => {
                if (isStudentLockedInLobby) return;
                setShopInitialTab('collection');
                setCurrentTab('shop');
              }}
              onOpenRoyale={() => setCurrentTab('royale')}
              lockedInLobby={isStudentLockedInLobby}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Render Tab Views */}
        {currentTab === 'dashboard' && (
          <Dashboard
            user={effectiveUser || user}
            progress={progress}
            tasks={studentTasks}
            enrolledClassCount={enrolledClassIds.length}
            onNavigateToTasks={() => setCurrentTab('tasks')}
            onNavigateToLessons={handleOpenLesson}
            onNavigateToQuizzes={() => setCurrentTab('quizzes')}
            onNavigateToRoyale={() => setCurrentTab('royale')}
            onNavigateToLeaderboard={() => setCurrentTab('leaderboard')}
            onNavigateToClasses={() => setCurrentTab('classes')}
          />
        )}

        {(currentTab === 'tasks' || currentTab === 'assignments') && (
          isEffectiveStudent ? (
            <TaskView
              user={effectiveUser || user}
              progress={progress}
              enrolledClassIds={enrolledClassIds}
              onNavigateToLessons={(subtopicCode, task) =>
                task ? handleOpenTaskInLessons(task, subtopicCode) : handleOpenLesson(subtopicCode)
              }
              onNavigateToQuizzes={(_topicCode, task) => {
                if (task) {
                  handleOpenTaskInQuizzes(task);
                } else {
                  setCurrentTab('quizzes');
                }
              }}
              onNavigateToRoyale={() => setCurrentTab('royale')}
            />
          ) : (
            <InstructorDashboard
              currentUser={user}
              initialTab="tasks"
              onSwitchToStudentMode={() => {
                setIsPreviewingAsStudent(true);
                setCurrentTab('dashboard');
              }}
              onNavigateToLessons={() => setCurrentTab('lessons')}
              onNavigateToLeaderboard={() => setCurrentTab('leaderboard')}
            />
          )
        )}

        {currentTab === 'lessons' && (
          <LessonSlidesViewer
            user={effectiveUser || user}
            isInstructor={!isEffectiveStudent}
            selectedSubject={selectedSubject}
            searchQuery={searchQuery}
            targetSubtopicCode={targetLessonCode}
            onClearTargetSubtopicCode={() => setTargetLessonCode(null)}
            completedLessons={progress.completedLessons}
            slidesReadBySubtopic={progress.slidesReadBySubtopic || {}}
            trafficLights={progress.trafficLights || {}}
            subtopicQuizScores={progress.subtopicQuizScores || {}}
            activeTaskContext={activeTaskContext}
            onUpdateSlidesRead={handleUpdateSlidesRead}
            onUpdateTrafficLight={handleUpdateTrafficLight}
            onSaveQuizResult={handleSaveSubtopicQuizResult}
            onToggleCompleteLesson={handleToggleCompleteLesson}
            onSaveNoteFromSlide={handleUpdateNote}
            onNavigateToTaskQuiz={() => setCurrentTab('quizzes')}
            theme={theme}
            onToggleTheme={handleToggleTheme}
            lastQuizReward={lastQuizReward}
            onClearQuizReward={() => setLastQuizReward(null)}
          />
        )}

        {currentTab === 'classes' && (
          isEffectiveStudent ? (
            <StudentClassesView
              user={effectiveUser || user}
              progress={progress}
              onNavigateToLessons={(subtopicCode, task) =>
                task ? handleOpenTaskInLessons(task, subtopicCode) : handleOpenLesson(subtopicCode)
              }
              onNavigateToQuizzes={(_topicCode, task) => {
                if (task) {
                  handleOpenTaskInQuizzes(task);
                } else {
                  setCurrentTab('quizzes');
                }
              }}
            />
          ) : (
            <InstructorDashboard
              currentUser={user}
              initialTab="classes"
              onSwitchToStudentMode={() => {
                setIsPreviewingAsStudent(true);
                setCurrentTab('lessons');
              }}
              onNavigateToLessons={() => setCurrentTab('lessons')}
              onNavigateToLeaderboard={() => setCurrentTab('leaderboard')}
            />
          )
        )}

        {currentTab === 'leaderboard' && (
          <StudentLeaderboard
            user={effectiveUser || user}
            progress={progress}
            enrolledClassIds={enrolledClassIds}
            onNavigateToLessons={handleOpenLesson}
            onNavigateToQuizzes={() => setCurrentTab('quizzes')}
            onNavigateToProfile={() => setCurrentTab('profile')}
            onNavigateToTeachingHub={() => setCurrentTab('instructor')}
            challenges={isEffectiveStudent ? userChallenges : undefined}
            activeChallenge={isEffectiveStudent ? activeLiveChallenge : null}
            onEnterChallenge={(c) => {
              dismissedLiveChallengeIdsRef.current.delete(c.id);
              setActiveLiveChallenge(c);
            }}
            onExitChallenge={() => {
              if (activeLiveChallenge) {
                dismissedLiveChallengeIdsRef.current.add(activeLiveChallenge.id);
              }
              setActiveLiveChallenge(null);
            }}
            onChallengeCompleted={(summary) => {
              if (!user || !isEffectiveStudent) return;
              const rewardKey = `igcse_challenge_rewarded_${user.id}_${summary.challengeId}`;
              try {
                if (localStorage.getItem(rewardKey)) return;
                localStorage.setItem(rewardKey, '1');
              } catch {}

              const prevScholarLevel = calculateStudentLevel(progressRef.current.bestTotalXP || 0).level;
              const nextProgress = applyMonotonicBadgesAndXP(
                withDailyStreakProgress({
                  ...progressRef.current,
                  cumulativeQuizPoints: (progressRef.current.cumulativeQuizPoints || 0) + summary.correctCount,
                  cumulativeQuizzesCount: (progressRef.current.cumulativeQuizzesCount || 0) + 1,
                  lastActive: new Date().toISOString()
                }),
                effectiveUser || user
              );
              const newScholarLevel = calculateStudentLevel(nextProgress.bestTotalXP || 0).level;
              progressRef.current = nextProgress;
              setProgress(nextProgress);
              try {
                localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(nextProgress));
              } catch {}
              triggerDailyEngagementTracking(nextProgress);
              if (enrolledClassIds.length > 0) {
                syncStudentProgressToClasses(effectiveUser || user, nextProgress, enrolledClassIds);
              }

              awardQuizAndLevelGold({
                uid: user.id,
                quizQuestionsCompleted: summary.totalQuestions,
                quizScore: summary.correctCount + (summary.won ? 2 : 0),
                prevScholarLevel,
                newScholarLevel,
                isInstructorPreview: isPreviewingAsStudent
              })
                .then((rewardRes) => {
                  showRewardToast(
                    rewardRes,
                    summary.won ? '1v1 Live Challenge Victory' : '1v1 Live Challenge Completed'
                  );
                })
                .catch(() => {});
            }}
          />
        )}

        {currentTab === 'profile' && (
          <StudentProfileView
            user={effectiveUser || user}
            progress={progress}
            enrolledClassIds={enrolledClassIds}
            tasks={studentTasks}
            onUpdateUser={setUser}
            onUpdateProgress={setProgress}
            onNavigateToLeaderboard={() => setCurrentTab('leaderboard')}
            onNavigateToLessons={handleOpenLesson}
            onNavigateToQuizzes={() => setCurrentTab('quizzes')}
          />
        )}

        {currentTab === 'exams' && (
          <PastExamsVault
            isInstructor={!isEffectiveStudent}
          />
        )}

        {currentTab === 'quizzes' && (
          <QuizArena
            taskContext={activeTaskContext}
            onClearTaskContext={() => setActiveTaskContext(null)}
            onQuizCompleted={handleQuizCompleted}
            lastQuizReward={lastQuizReward}
            onClearQuizReward={() => setLastQuizReward(null)}
          />
        )}

        {currentTab === 'notebook' && (
          <SyllabusNotebook
            selectedSubject={selectedSubject}
            searchQuery={searchQuery}
            savedNotes={progress.savedNotes || {}}
            onUpdateNote={handleUpdateNote}
          />
        )}

        {currentTab === 'tracker' && (
          isEffectiveStudent ? (
            <ProgressTracker
              progress={progress}
              user={effectiveUser || user}
              onUpdateConfidence={handleUpdateConfidence}
              onNavigateToTopic={handleOpenLesson}
              onNavigateToLeaderboard={() => setCurrentTab('leaderboard')}
              onNavigateToProfile={() => setCurrentTab('profile')}
            />
          ) : (
            <InstructorDashboard
              currentUser={user}
              initialTab="cohort"
              onSwitchToStudentMode={() => {
                setIsPreviewingAsStudent(true);
                setCurrentTab('lessons');
              }}
              onNavigateToLessons={() => setCurrentTab('lessons')}
              onNavigateToLeaderboard={() => setCurrentTab('leaderboard')}
            />
          )
        )}

        {currentTab === 'guidelines' && (
          <ExamGuidelines />
        )}

        {currentTab === 'schedule' && (
          <RevisionSchedule
            user={user}
            weakTopics={weakTopicCodes}
            progress={progress}
            onOpenLesson={handleOpenLesson}
            onNavigateToQuiz={(topicCode) => {
              if (topicCode) setSearchQuery(topicCode);
              setCurrentTab('quizzes');
            }}
            onNavigateToExams={() => setCurrentTab('exams')}
            onNavigateToNotebook={() => setCurrentTab('notebook')}
            onNavigateToGuidelines={() => setCurrentTab('guidelines')}
          />
        )}

        {currentTab === 'recommendations' && (
          <AIRecommendations
            user={user}
            progress={progress}
            onOpenTopicSlides={handleOpenLesson}
          />
        )}

        {/* INSTRUCTOR VIEW: Strictly protected, only rendered if user.role === 'instructor' */}
        {currentTab === 'instructor' && (
          isPreviewingAsStudent ? (
            <div className="p-8 text-center bg-slate-900 border border-purple-500/40 rounded-3xl space-y-4 max-w-xl mx-auto my-12">
              <GraduationCap className="w-14 h-14 text-emerald-400 mx-auto" />
              <h2 className="text-xl font-bold text-white">Student Preview Mode Active</h2>
              <p className="text-sm text-slate-300">
                You are currently viewing the exact application interface and tabs that your students see. Students do not see the Teaching Hub.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setCurrentTab('lessons')}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Explore Lesson Slides
                </button>
                <button
                  onClick={() => {
                    setIsPreviewingAsStudent(false);
                    setCurrentTab('instructor');
                  }}
                  className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Exit Preview & Return to Teaching Hub
                </button>
              </div>
            </div>
          ) : user.role === 'instructor' ? (
            <InstructorDashboard
              currentUser={user}
              onSwitchToStudentMode={() => {
                setIsPreviewingAsStudent(true);
                setCurrentTab('lessons');
              }}
              onNavigateToLessons={() => setCurrentTab('lessons')}
              onNavigateToRoyale={() => setCurrentTab('royale')}
              onNavigateToLeaderboard={() => setCurrentTab('leaderboard')}
            />
          ) : (
            <div className="p-8 text-center bg-slate-900 border border-rose-500/40 rounded-3xl space-y-3">
              <ShieldAlert className="w-12 h-12 text-rose-400 mx-auto" />
              <h2 className="text-lg font-bold text-white">Access Restricted to Instructors</h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                You are currently signed in as a student. Instructor view is only available to educators who have been invited by an existing instructor.
              </p>
              <button
                onClick={() => setCurrentTab('lessons')}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
              >
                Back to Lessons
              </button>
            </div>
          )
        )}

        {/* MODULE 1: AVATAR LOADOUT & WEAPON SHOP */}
        {currentTab === 'shop' && (
          <AvatarShop
            user={effectiveUser || user}
            initialTab={shopInitialTab}
            battleState={battleState}
            onBack={() => setCurrentTab('lessons')}
            onNavigateToArena={
              (!isEffectiveStudent || battleState?.status === 'IN_PROGRESS' || battleState?.isLobbyOpen)
                ? () => setCurrentTab('royale')
                : undefined
            }
          />
        )}

        {/* MODULE 3, 4, 5: REVISION ROYALE TOURNAMENT, LOBBY & 2D ARENA */}
        {currentTab === 'royale' && (
          (user?.email === 'corbanb@gisboyshigh.net' || !isEffectiveStudent) ? (
            battleArenaActive ? (
              <ErrorBoundary
                fallbackTitle="Arena View Recovered"
                onReturn={() => setBattleArenaActive(false)}
                returnLabel="Back to Match Control"
              >
                <BattleRoyaleArena
                  user={user}
                  onExit={() => setBattleArenaActive(false)}
                />
              </ErrorBoundary>
            ) : (
              <AdminBattleControl
                currentUser={user}
                onJoinSpectate={() => setBattleArenaActive(true)}
                onEnterArena={() => setBattleArenaActive(true)}
                onClose={() => setCurrentTab('instructor')}
              />
            )
          ) : (battleState?.status === 'IN_PROGRESS' || (battleState?.status === 'ENDED' && studentEnteredArena)) ? (
            <ErrorBoundary
              fallbackTitle="Arena View Recovered"
              onReturn={() => {
                setBattleArenaActive(false);
                setStudentEnteredArena(false);
                setCurrentTab('lessons');
              }}
              returnLabel="Return to Lessons"
            >
              <BattleRoyaleArena
                user={effectiveUser || user}
                onExit={() => {
                  setBattleArenaActive(false);
                  setStudentEnteredArena(false);
                  setCurrentTab('lessons');
                }}
              />
            </ErrorBoundary>
          ) : battleState?.isLobbyOpen ? (
            <GameLobby
              user={effectiveUser || user}
              onEnterBattle={() => setBattleArenaActive(true)}
              onBackToStudy={() => setCurrentTab('lessons')}
              onOpenShop={() => {
                setShopInitialTab('shop');
                setCurrentTab('shop');
              }}
            />
          ) : (
            /* Student tries to access royale when instructor has not opened the lobby */
            <div className="max-w-xl mx-auto my-10 p-6 sm:p-8 bg-white border border-slate-200 rounded-xl shadow-xs text-center space-y-5 text-slate-800">
              <div className="w-14 h-14 rounded-xl bg-[#EBF3F5] border border-slate-300 flex items-center justify-center mx-auto">
                <Lock className="w-7 h-7 text-slate-700" />
              </div>
              <div className="space-y-2">
                <span className="text-xs font-bold px-3 py-1 rounded bg-[#EBF3F5] text-slate-700 border border-slate-300 inline-block">
                  Lobby Waiting Room
                </span>
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
                  Tournament Lobby is Closed
                </h2>
                <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                  Students join the tournament once your instructor opens the match lobby. In the meantime, you can customize your character loadout or review lesson slides.
                </p>
              </div>

              {/* Status Note */}
              <div className="p-3 rounded-lg bg-[#FDFBF7] border border-slate-300 text-xs font-semibold text-slate-700">
                Waiting for your instructor to launch the match session.
              </div>

              {/* Accessible alternatives for students */}
              <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => {
                    setShopInitialTab('shop');
                    setCurrentTab('shop');
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Package className="w-4 h-4" />
                  <span>Open Character Shop</span>
                </button>
                <button
                  onClick={() => {
                    setShopInitialTab('collection');
                    setCurrentTab('shop');
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Layers className="w-4 h-4 text-slate-700" />
                  <span>My Collection</span>
                </button>
                <button
                  onClick={() => setCurrentTab('lessons')}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-[#EBF3F5] hover:bg-[#d8e9ec] text-slate-800 border border-slate-400 font-bold text-sm flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <span>Return to Lessons</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )
        )}
      </main>

      {/* Gold, Daily Streak & Level-Up Reward Notification Toast */}
      {rewardToast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm bg-white border-2 border-slate-800 rounded-xl shadow-lg p-4 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${
            rewardToast.isLevelUp
              ? 'bg-emerald-50 border-emerald-400 text-emerald-700'
              : rewardToast.variant === 'streak'
                ? 'bg-amber-50 border-amber-400 text-amber-600'
                : 'bg-amber-50 border-amber-400 text-amber-700'
          }`}>
            {rewardToast.isLevelUp ? (
              <Sparkles className="w-5 h-5" />
            ) : rewardToast.variant === 'streak' ? (
              <Flame className="w-5 h-5 fill-amber-500 text-amber-600" />
            ) : (
              <Coins className="w-5 h-5" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900 leading-tight">{rewardToast.title}</p>
            <p className="text-xs font-semibold text-slate-600 mt-0.5">{rewardToast.subtitle}</p>
          </div>
          <button
            type="button"
            onClick={() => setRewardToast(null)}
            className="text-slate-400 hover:text-slate-700 cursor-pointer p-0.5"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
