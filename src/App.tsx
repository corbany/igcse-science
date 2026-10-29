import React, { useState, useEffect } from 'react';
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
import { AIChatTutor } from './components/AIChatTutor';
import { StudentLeaderboard } from './components/StudentLeaderboard';
import { StudentProfileView } from './components/StudentProfileView';
import { GoogleSignInGate } from './components/GoogleSignInGate';
import { ClassCodeGateModal } from './components/ClassCodeGateModal';
import { UserProfileHeader } from './components/UserProfileHeader';
import { AvatarShop } from './components/AvatarShop';
import { GameLobby } from './components/GameLobby';
import { AdminBattleControl } from './components/AdminBattleControl';
import { BattleRoyaleArena } from './components/BattleRoyaleArena';
import { subscribeToBattleState, BattleEventState } from './services/firebaseGameService';
import { ScienceSubject, UserProfile, StudentProgress, TrafficLightStatus, SubtopicQuizResult, TaskWithSubmission } from './types';
import { logCompletedActivity } from './services/activityService';
import { 
  Sparkles, 
  Users,
  ShieldAlert,
  GraduationCap,
  LayoutDashboard,
  Lock,
  Package,
  Layers,
  ArrowRight
} from 'lucide-react';
import { auth, logout } from './services/firebaseAuth';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { 
  getOrCreateUserProfile, 
  syncStudentProgressToClasses, 
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
  savedNotes: {},
  quizScores: {},
  lastActive: new Date().toISOString()
};

export default function App() {
  // Navigation & filter state (supports ?tab=assignments direct links from student task notification emails)
  const [currentTab, setCurrentTab] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search);
        const tabParam = params.get('tab');
        if (tabParam) return tabParam;
      } catch (e) {
        // ignore
      }
    }
    return 'lessons';
  });
  const [selectedSubject, setSelectedSubject] = useState<ScienceSubject | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Auto-switch tab if URL query parameter changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam && tabParam !== currentTab) {
        setCurrentTab(tabParam);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Revision Royale Tournament & Arena State
  const [battleArenaActive, setBattleArenaActive] = useState<boolean>(false);
  const [battleState, setBattleState] = useState<BattleEventState | null>(null);
  const [shopInitialTab, setShopInitialTab] = useState<'shop' | 'collection' | 'armory'>('shop');

  useEffect(() => {
    const unsub = subscribeToBattleState((state) => {
      setBattleState(state);
      if (state.status === 'IN_PROGRESS' && currentTab === 'royale') {
        setBattleArenaActive(true);
      } else if (state.status !== 'IN_PROGRESS') {
        setBattleArenaActive(false);
      }
    });
    return () => unsub();
  }, [currentTab]);

  // Global Theme state (Light / Dark mode)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_THEME);
      return stored === 'light' || stored === 'dark' ? stored : 'dark';
    } catch (e) {
      return 'dark';
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

  // List of enrolled class IDs for live syncing
  const [enrolledClassIds, setEnrolledClassIds] = useState<string[]>([]);

  // Chat query passed between components
  const [chatInitialQuery, setChatInitialQuery] = useState<string>('');

  // Instructor previewing student view mode
  const [isPreviewingAsStudent, setIsPreviewingAsStudent] = useState<boolean>(false);

  // Live real-time student tasks state
  const [studentTasks, setStudentTasks] = useState<TaskWithSubmission[]>([]);

  // Effective student status and synthetic profile for preview mode
  const isEffectiveStudent = user ? (user.role === 'student' || isPreviewingAsStudent) : false;
  const effectiveUser: UserProfile | null = user
    ? (isPreviewingAsStudent && user.role === 'instructor'
        ? { ...user, role: 'student', name: `${user.name} (Student View)` }
        : user)
    : null;

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

  const pendingTasksCount = studentTasks.filter(t => t.submission?.status !== 'completed').length;

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
          setUser(profile);
          localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(profile));
          
          // Load enrolled classes for progress sync
          const classes = await fetchStudentEnrolledClasses(profile.id);
          setEnrolledClassIds(classes.map(c => c.id));
        } catch (e) {
          console.error('Error resolving user profile on auth change:', e);
        }
      } else {
        const stored = localStorage.getItem(STORAGE_KEY_USER);
        if (stored) {
          try {
            const profile = JSON.parse(stored);
            if (profile && profile.id) {
              setUser(profile);
              const classes = await fetchStudentEnrolledClasses(profile.id);
              setEnrolledClassIds(classes.map(c => c.id));
            } else {
              setUser(null);
              setEnrolledClassIds([]);
            }
          } catch {
            setUser(null);
            setEnrolledClassIds([]);
          }
        } else {
          setUser(null);
          setEnrolledClassIds([]);
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

  // Persist progress changes & sync to instructor classes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(progress));
    } catch (e) {
      console.error(e);
    }

    if (user && user.role === 'student' && enrolledClassIds.length > 0) {
      syncStudentProgressToClasses(user, progress, enrolledClassIds);
      autoEvaluateAllTasksForStudent(user, enrolledClassIds, progress);
    }
  }, [progress, user, enrolledClassIds]);

  // Migrate past student quiz results with new traffic light parameters (50%, 60%, 70% Amber/Orange; <=40% Red; 80%+ Green)
  useEffect(() => {
    const MIGRATION_KEY = 'igcse_traffic_light_v2_migrated';
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

  // Handler functions for progress updates
  const handleToggleCompleteLesson = (lessonId: string) => {
    setProgress(prev => {
      const isCompleted = prev.completedLessons.includes(lessonId);
      const newCompleted = isCompleted
        ? prev.completedLessons.filter(id => id !== lessonId)
        : [...prev.completedLessons, lessonId];
      const updated: StudentProgress = { ...prev, completedLessons: newCompleted, lastActive: new Date().toISOString() };
      try {
        localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(updated));
      } catch {}
      if (user && user.role === 'student' && enrolledClassIds.length > 0) {
        syncStudentProgressToClasses(user, updated, enrolledClassIds);
      }
      return updated;
    });

    if (user && user.role === 'student') {
      autoCheckTaskCompletion(user, enrolledClassIds, 'traffic_light', lessonId);
    }
  };

  const handleUpdateConfidence = (topicCode: string, rating: number) => {
    setProgress(prev => {
      const updated: StudentProgress = {
        ...prev,
        topicConfidence: {
          ...prev.topicConfidence,
          [topicCode]: rating
        },
        lastActive: new Date().toISOString()
      };
      try {
        localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(updated));
      } catch {}
      if (user && user.role === 'student' && enrolledClassIds.length > 0) {
        syncStudentProgressToClasses(user, updated, enrolledClassIds);
      }
      return updated;
    });
  };

  const handleUpdateNote = (topicCode: string, noteContent: string) => {
    setProgress(prev => ({
      ...prev,
      savedNotes: {
        ...prev.savedNotes,
        [topicCode]: noteContent
      },
      lastActive: new Date().toISOString()
    }));
  };

  const handleQuizCompleted = (subject: string, score: number, total: number) => {
    setProgress(prev => {
      const updated: StudentProgress = {
        ...prev,
        quizScores: {
          ...prev.quizScores,
          [subject]: { score, total, date: new Date().toISOString() }
        },
        lastActive: new Date().toISOString()
      };
      try {
        localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(updated));
      } catch {}
      if (user && user.role === 'student' && enrolledClassIds.length > 0) {
        syncStudentProgressToClasses(user, updated, enrolledClassIds);
      }
      return updated;
    });

    if (user && user.role === 'student') {
      autoCheckTaskCompletion(user, enrolledClassIds, 'quiz', subject, { quizScore: Math.round((score / total) * 100) });
      logCompletedActivity(user.id, {
        type: 'subject_quiz',
        title: `${subject.charAt(0).toUpperCase() + subject.slice(1)} Practice Arena Quiz`,
        subtitle: 'Comprehensive Practice Exam',
        subject: subject as ScienceSubject,
        score,
        total,
        percentage: Math.round((score / (total || 1)) * 100),
        passed: score / (total || 1) >= 0.7,
        trafficLight: (score / (total || 1) >= 0.8) ? 'green' : (score / (total || 1) >= 0.5) ? 'orange' : 'red',
        completedAt: new Date().toISOString()
      });
    }
  };

  const handleUpdateTrafficLight = (subtopicCode: string, status: TrafficLightStatus) => {
    setProgress(prev => {
      const completedSet = new Set(prev.completedLessons || []);
      // If student reviewed slides and completed traffic light rating, mark slide deck as completed
      completedSet.add(subtopicCode);
      const updated: StudentProgress = {
        ...prev,
        completedLessons: Array.from(completedSet),
        trafficLights: {
          ...(prev.trafficLights || {}),
          [subtopicCode]: status
        },
        lastActive: new Date().toISOString()
      };
      try {
        localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(updated));
      } catch {}
      if (user && user.role === 'student' && enrolledClassIds.length > 0) {
        syncStudentProgressToClasses(user, updated, enrolledClassIds);
      }
      return updated;
    });

    if (user && user.role === 'student') {
      autoCheckTaskCompletion(user, enrolledClassIds, 'traffic_light', subtopicCode, { trafficLight: status });
    }
  };

  const handleSaveSubtopicQuizResult = (subtopicCode: string, result: SubtopicQuizResult) => {
    const assignedLight: TrafficLightStatus = result.percentage >= 80 ? 'green' : result.percentage >= 50 ? 'orange' : 'red';

    setProgress(prev => {
      const completedSet = new Set(prev.completedLessons || []);
      // When traffic light quiz is completed, mark slide deck as completed
      completedSet.add(subtopicCode);
      const updated: StudentProgress = {
        ...prev,
        completedLessons: Array.from(completedSet),
        trafficLights: {
          ...(prev.trafficLights || {}),
          [subtopicCode]: assignedLight
        },
        subtopicQuizScores: {
          ...(prev.subtopicQuizScores || {}),
          [subtopicCode]: result
        },
        lastActive: new Date().toISOString()
      };
      try {
        localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(updated));
      } catch {}
      if (user && isEffectiveStudent && enrolledClassIds.length > 0) {
        syncStudentProgressToClasses(effectiveUser || user, updated, enrolledClassIds);
      }
      return updated;
    });

    if (user && isEffectiveStudent) {
      autoCheckTaskCompletion(effectiveUser || user, enrolledClassIds, 'quiz', subtopicCode, { quizScore: result.score, trafficLight: assignedLight });
      logCompletedActivity(user.id, {
        type: 'subtopic_quiz',
        title: `${subtopicCode} Knowledge Check`,
        subtitle: '10-Question Subtopic Quiz',
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

  const handleAskAITutor = (query: string, _topicCode?: string) => {
    setChatInitialQuery(query);
    setCurrentTab('chat');
  };

  const handleOpenLesson = (topicCode?: string) => {
    if (topicCode) setSearchQuery(topicCode);
    setCurrentTab('lessons');
  };

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (e) {
      console.error('Logout error:', e);
    }
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
      <div className={`min-h-screen flex flex-col items-center justify-center p-6 ${
        theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'
      }`}>
        <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-semibold tracking-wide text-slate-400 animate-pulse">
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
        onSignInSuccess={async (profile) => {
          setUser(profile);
          localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(profile));
          try {
            const classes = await fetchStudentEnrolledClasses(profile.id);
            setEnrolledClassIds(classes.map(c => c.id));
          } catch (e) {
            console.error('Error fetching enrolled classes:', e);
          }
        }}
      />
    );
  }

  // 3. Mandatory Class Code Gate for Students on First Sign-In
  // After students sign in for the first time they must enter a class code to join a class
  if (user.role === 'student' && enrolledClassIds.length === 0) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'}`}>
        <ClassCodeGateModal
          user={user}
          progress={progress}
          theme={theme}
          onClassJoined={(classItem) => {
            setEnrolledClassIds([classItem.id]);
          }}
        />
      </div>
    );
  }

  // 4. Authenticated App Experience
  return (
    <div className={`min-h-screen flex flex-col font-sans selection:bg-emerald-500 selection:text-white transition-colors duration-200 ${
      theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
    }`}>
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
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
        onNavigateToLessons={handleOpenLesson}
        onNavigateToQuizzes={() => setCurrentTab('quizzes')}
        isPreviewingAsStudent={isPreviewingAsStudent}
        onEnterStudentPreview={() => {
          setIsPreviewingAsStudent(true);
          setCurrentTab('lessons');
        }}
        onExitStudentPreview={() => {
          setIsPreviewingAsStudent(false);
          setCurrentTab('instructor');
        }}
        battleState={battleState}
        onOpenShop={() => {
          setShopInitialTab('shop');
          setCurrentTab('shop');
        }}
      />

      {/* Role Distinction Sub-bar */}
      {user.role === 'instructor' && isPreviewingAsStudent ? (
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border-b border-emerald-500/40 px-4 sm:px-6 lg:px-8 py-2.5 transition">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-bold text-emerald-300">Student Preview Active:</span>
              <span className="text-slate-300">
                You are experiencing the exact interface, tabs (Lesson Slides, Quizzes, Past Papers, Syllabus Notebook, Assignments, My Progress, My Classes), and student revision tools.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  setIsPreviewingAsStudent(false);
                  setCurrentTab('instructor');
                }}
                className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Exit Preview & Return to Teaching Hub</span>
              </button>
            </div>
          </div>
        </div>
      ) : user.role === 'instructor' ? (
        <div className="bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 border-b border-purple-500/30 px-4 sm:px-6 lg:px-8 py-2.5 transition">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
              <span className="font-bold text-purple-300">Instructor Mode Active:</span>
              <span className="text-slate-300">
                Teaching Hub integrates your active classes, class tasks & homework manager, and live cohort progress & analytics.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  setIsPreviewingAsStudent(true);
                  setCurrentTab('lessons');
                }}
                className="px-3 py-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                title="Preview exact page and tabs a student would see"
              >
                <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                <span>Preview Student</span>
              </button>

              {currentTab !== 'instructor' ? (
                <button
                  onClick={() => setCurrentTab('instructor')}
                  className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold transition shadow-xs"
                >
                  Open Teaching Hub
                </button>
              ) : (
                <button
                  onClick={() => setCurrentTab('lessons')}
                  className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-semibold transition"
                >
                  View Lesson Slides
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Student Mode indicator: strictly no instructor access */
        <div className="bg-slate-900/60 border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="font-semibold text-emerald-400">Student Space</span>
              <span className="hidden sm:inline text-slate-600">•</span>
              <span className="hidden sm:inline text-slate-400">
                Logged in as {user.name} ({user.email})
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentTab('classes')}
                className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-semibold transition"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Join Class with Code</span>
              </button>
              <span className="text-slate-600">|</span>
              <span className="font-mono text-slate-400 font-medium">Target: {user.targetGrade || 'A*'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Student Pending Tasks Alert Banner */}
      {isEffectiveStudent && pendingTasksCount > 0 && currentTab !== 'assignments' && (
        <div className="bg-amber-950/40 border-b border-amber-500/40 px-4 sm:px-6 lg:px-8 py-2.5 animate-in fade-in">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center gap-2.5 text-amber-300 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shrink-0"></span>
              <span>
                Task Notice: You have <strong>{pendingTasksCount}</strong> assignment{pendingTasksCount === 1 ? '' : 's'} set by your teacher!
              </span>
            </div>
            <button
              onClick={() => setCurrentTab('assignments')}
              className="px-3.5 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition text-xs shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
            >
              <span>Open Assignments Tab</span>
              <span>&rarr;</span>
            </button>
          </div>
        </div>
      )}

      {/* MODULE 1: USER PROFILE & LOADOUT BANNER */}
      {isEffectiveStudent && (
        <div className="border-b border-slate-800/80 bg-slate-950/60 px-4 sm:px-6 lg:px-8 py-3">
          <div className="max-w-7xl mx-auto">
            <UserProfileHeader
              user={effectiveUser || user}
              theme={theme}
              battleState={battleState}
              onOpenShop={() => {
                setShopInitialTab('shop');
                setCurrentTab('shop');
              }}
              onOpenCollection={() => {
                setShopInitialTab('collection');
                setCurrentTab('shop');
              }}
              onOpenRoyale={() => setCurrentTab('royale')}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Render Tab Views */}
        {currentTab === 'assignments' && (
          isEffectiveStudent ? (
            <StudentTasksPanel
              user={effectiveUser || user}
              progress={progress}
              enrolledClassIds={enrolledClassIds}
              onNavigateToLessons={handleOpenLesson}
              onNavigateToQuizzes={() => setCurrentTab('quizzes')}
            />
          ) : (
            <InstructorDashboard
              currentUser={user}
              initialTab="tasks"
              onSwitchToStudentMode={() => {
                setIsPreviewingAsStudent(true);
                setCurrentTab('lessons');
              }}
              onNavigateToLessons={() => setCurrentTab('lessons')}
            />
          )
        )}

        {currentTab === 'lessons' && (
          <LessonSlidesViewer
            user={effectiveUser || user}
            isInstructor={!isEffectiveStudent}
            selectedSubject={selectedSubject}
            searchQuery={searchQuery}
            completedLessons={progress.completedLessons}
            trafficLights={progress.trafficLights || {}}
            subtopicQuizScores={progress.subtopicQuizScores || {}}
            onUpdateTrafficLight={handleUpdateTrafficLight}
            onSaveQuizResult={handleSaveSubtopicQuizResult}
            onToggleCompleteLesson={handleToggleCompleteLesson}
            onSaveNoteFromSlide={handleUpdateNote}
            onAskAITutor={handleAskAITutor}
            theme={theme}
            onToggleTheme={handleToggleTheme}
          />
        )}

        {currentTab === 'classes' && (
          isEffectiveStudent ? (
            <StudentClassesView
              user={effectiveUser || user}
              progress={progress}
              onNavigateToLessons={handleOpenLesson}
              onNavigateToQuizzes={() => setCurrentTab('quizzes')}
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
            onAskAITutor={handleAskAITutor}
          />
        )}

        {currentTab === 'quizzes' && (
          <QuizArena
            onQuizCompleted={handleQuizCompleted}
            onAskAITutor={handleAskAITutor}
          />
        )}

        {currentTab === 'notebook' && (
          <SyllabusNotebook
            selectedSubject={selectedSubject}
            searchQuery={searchQuery}
            savedNotes={progress.savedNotes || {}}
            onUpdateNote={handleUpdateNote}
            onAskAITutor={handleAskAITutor}
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
            onAskAITutor={handleAskAITutor}
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
              (!isEffectiveStudent || battleState?.status === 'IN_PROGRESS')
                ? () => setCurrentTab('royale')
                : undefined
            }
          />
        )}

        {/* MODULE 3, 4, 5: REVISION ROYALE TOURNAMENT, LOBBY & 2D ARENA */}
        {currentTab === 'royale' && (
          !isEffectiveStudent ? (
            battleArenaActive ? (
              <BattleRoyaleArena
                user={user}
                onExit={() => setBattleArenaActive(false)}
              />
            ) : (
              <AdminBattleControl
                currentUser={user}
                onJoinSpectate={() => setBattleArenaActive(true)}
              />
            )
          ) : battleState?.status === 'IN_PROGRESS' ? (
            <BattleRoyaleArena
              user={effectiveUser || user}
              onExit={() => {
                setBattleArenaActive(false);
                setCurrentTab('lessons');
              }}
            />
          ) : (
            /* Student tries to access royale when instructor hasn't started the game */
            <div className="max-w-2xl mx-auto my-10 p-6 sm:p-8 bg-slate-900/95 border border-slate-800 rounded-3xl shadow-2xl text-center space-y-6 backdrop-blur-md">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-3xl mx-auto shadow-lg shadow-amber-500/10">
                <Lock className="w-8 h-8 text-amber-400" />
              </div>
              <div className="space-y-2">
                <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                  <span>Match Locked</span>
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Waiting for Instructor to Start Game
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
                  Students do not have access to the Battle Royale arena until the instructor officially starts the tournament match. You currently have full access to the Avatar Shop and your personal card collection!
                </p>
              </div>

              {/* Real-time listener pulse banner */}
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-center gap-2.5 text-xs font-semibold text-cyan-400">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
                <span>Live status: Waiting for host... You will join automatically when launched!</span>
              </div>

              {/* Accessible alternatives for students */}
              <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => {
                    setShopInitialTab('shop');
                    setCurrentTab('shop');
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition active:scale-95 cursor-pointer"
                >
                  <Package className="w-4 h-4" />
                  <span>Open Avatar Shop</span>
                </button>
                <button
                  onClick={() => {
                    setShopInitialTab('collection');
                    setCurrentTab('shop');
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
                >
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>My Card Collection</span>
                </button>
                <button
                  onClick={() => setCurrentTab('lessons')}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 text-xs font-semibold transition cursor-pointer"
                >
                  <span>Back to Study</span>
                </button>
              </div>
            </div>
          )
        )}

        {currentTab === 'chat' && (
          <AIChatTutor
            user={user}
            initialTopicQuery={chatInitialQuery}
          />
        )}
      </main>

      {/* Floating Bottom AI Chat quick launcher (when not already in chat) */}
      {currentTab !== 'chat' && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => {
              setChatInitialQuery('');
              setCurrentTab('chat');
            }}
            className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs rounded-full shadow-lg hover:shadow-emerald-500/25 hover:scale-105 active:scale-95 transition"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>Ask 0653 AI Tutor</span>
          </button>
        </div>
      )}
    </div>
  );
}
