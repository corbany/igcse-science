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
import { AIChatTutor } from './components/AIChatTutor';
import { GoogleSignInGate } from './components/GoogleSignInGate';
import { ClassCodeGateModal } from './components/ClassCodeGateModal';
import { ScienceSubject, UserProfile, StudentProgress, TrafficLightStatus, SubtopicQuizResult } from './types';
import { 
  Sparkles, 
  Users,
  ShieldAlert,
  GraduationCap
} from 'lucide-react';
import { auth, logout } from './services/firebaseAuth';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { 
  getOrCreateUserProfile, 
  syncStudentProgressToClasses, 
  fetchStudentEnrolledClasses 
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
  // Navigation & filter state
  const [currentTab, setCurrentTab] = useState<string>('lessons');
  const [selectedSubject, setSelectedSubject] = useState<ScienceSubject | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

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
    }
  }, [progress, user, enrolledClassIds]);

  // Handler functions for progress updates
  const handleToggleCompleteLesson = (lessonId: string) => {
    setProgress(prev => {
      const isCompleted = prev.completedLessons.includes(lessonId);
      const newCompleted = isCompleted
        ? prev.completedLessons.filter(id => id !== lessonId)
        : [...prev.completedLessons, lessonId];
      return { ...prev, completedLessons: newCompleted, lastActive: new Date().toISOString() };
    });
  };

  const handleUpdateConfidence = (topicCode: string, rating: number) => {
    setProgress(prev => ({
      ...prev,
      topicConfidence: {
        ...prev.topicConfidence,
        [topicCode]: rating
      },
      lastActive: new Date().toISOString()
    }));
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
    setProgress(prev => ({
      ...prev,
      quizScores: {
        ...prev.quizScores,
        [subject]: { score, total, date: new Date().toISOString() }
      },
      lastActive: new Date().toISOString()
    }));
  };

  const handleUpdateTrafficLight = (subtopicCode: string, status: TrafficLightStatus) => {
    setProgress(prev => ({
      ...prev,
      trafficLights: {
        ...(prev.trafficLights || {}),
        [subtopicCode]: status
      },
      lastActive: new Date().toISOString()
    }));
  };

  const handleSaveSubtopicQuizResult = (subtopicCode: string, result: SubtopicQuizResult) => {
    setProgress(prev => ({
      ...prev,
      subtopicQuizScores: {
        ...(prev.subtopicQuizScores || {}),
        [subtopicCode]: result
      },
      lastActive: new Date().toISOString()
    }));
  };

  const handleAskAITutor = (query: string, _topicCode?: string) => {
    setChatInitialQuery(query);
    setCurrentTab('chat');
  };

  const handleOpenLesson = (topicCode: string) => {
    setSearchQuery(topicCode);
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
      />

      {/* Role Distinction Sub-bar */}
      {user.role === 'instructor' ? (
        <div className="bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 border-b border-purple-500/30 px-4 sm:px-6 lg:px-8 py-2.5 transition">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
              <span className="font-bold text-purple-300">Instructor Mode Active:</span>
              <span className="text-slate-300">
                You have full access to class creation, student progress tracking, instructor team invitations, and Google Drive folder synchronization.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
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

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Render Tab Views */}
        {currentTab === 'lessons' && (
          <LessonSlidesViewer
            isInstructor={user.role === 'instructor'}
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

        {currentTab === 'classes' && user.role === 'student' && (
          <StudentClassesView
            user={user}
            progress={progress}
            onNavigateToLessons={() => setCurrentTab('lessons')}
            onNavigateToQuizzes={() => setCurrentTab('quizzes')}
          />
        )}

        {currentTab === 'exams' && (
          <PastExamsVault
            isInstructor={user.role === 'instructor'}
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
          <ProgressTracker
            progress={progress}
            user={user}
            onUpdateConfidence={handleUpdateConfidence}
            onNavigateToTopic={handleOpenLesson}
          />
        )}

        {currentTab === 'guidelines' && (
          <ExamGuidelines />
        )}

        {currentTab === 'schedule' && (
          <RevisionSchedule
            user={user}
            weakTopics={weakTopicCodes}
            onOpenLesson={handleOpenLesson}
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
          user.role === 'instructor' ? (
            <InstructorDashboard
              currentUser={user}
              onSwitchToStudentMode={() => {
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
