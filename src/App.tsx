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
import { StudentTaskProgressBar } from './components/StudentTaskProgressBar';
import { TaskView } from './components/TaskView';
import { Dashboard } from './components/Dashboard';
import { subscribeToBattleState, BattleEventState } from './services/firebaseGameService';
import { ScienceSubject, UserProfile, StudentProgress, TrafficLightStatus, SubtopicQuizResult, TaskWithSubmission } from './types';
import { resolveSubtopicByQuery } from './data/subtopicSlidesData';
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
    return 'dashboard';
  });
  const [selectedSubject, setSelectedSubject] = useState<ScienceSubject | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [targetLessonCode, setTargetLessonCode] = useState<string | null>(null);

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

          // Load enrolled classes for progress sync
          const classes = await fetchStudentEnrolledClasses(profile.id);
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
          setUser(profile);
          localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(profile));
          setEnrolledClassIds(validClasses.map(c => c.id));
        } catch (e) {
          console.error('Error resolving user profile on auth change:', e);
        }
      } else {
        const stored = localStorage.getItem(STORAGE_KEY_USER);
        if (stored) {
          try {
            const profile = JSON.parse(stored);
            if (profile && profile.id) {
              const classes = await fetchStudentEnrolledClasses(profile.id);
              const validClasses = classes.filter(c => c && c.id && c.id !== 'class_default_0653');
              if (profile.role === 'student' && validClasses.length === 0) {
                localStorage.removeItem(STORAGE_KEY_USER);
                localStorage.removeItem('igcse_0653_offline_enrolled_' + profile.id);
                setUser(null);
                setEnrolledClassIds([]);
                setSignOutNotice('Notice: The default class SCI-0653 has been retired. Students must enter an instructor-created class code to access revision materials. Please sign in and enter your teacher’s class code.');
              } else {
                setUser(profile);
                setEnrolledClassIds(validClasses.map(c => c.id));
              }
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
            const classes = await fetchStudentEnrolledClasses(profile.id);
            const validClasses = classes.filter(c => c && c.id && c.id !== 'class_default_0653');
            setUser(profile);
            localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(profile));
            setEnrolledClassIds(validClasses.map(c => c.id));
          } catch (e) {
            console.error('Error fetching enrolled classes:', e);
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
            localStorage.removeItem(STORAGE_KEY_USER);
            setUser(null);
            setEnrolledClassIds([]);
          }}
          onClassJoined={(classItem) => {
            setEnrolledClassIds([classItem.id]);
          }}
        />
      </div>
    );
  }

  // 4. Authenticated App Experience
  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${theme === 'dark' ? 'bg-black text-slate-100' : 'bg-[#FDFBF7] text-slate-800'}`}>
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
          setCurrentTab('dashboard');
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
        <div className="bg-[#FDFBF7] border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800">Student Space</span>
              <span>•</span>
              <span>{user.name} ({user.email})</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentTab('classes')}
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
      {isEffectiveStudent && (
        <StudentTaskProgressBar
          tasks={studentTasks}
          onNavigateToTasks={() => setCurrentTab('tasks')}
          enrolledClassCount={enrolledClassIds.length}
        />
      )}

      {/* MODULE 1: USER PROFILE & LOADOUT BANNER */}
      {isEffectiveStudent && (
        <div className="border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8 py-3 shadow-xs">
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
              onNavigateToLessons={handleOpenLesson}
              onNavigateToQuizzes={() => setCurrentTab('quizzes')}
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
              onNavigateToRoyale={() => setCurrentTab('royale')}
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
                onClose={() => setCurrentTab('instructor')}
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
