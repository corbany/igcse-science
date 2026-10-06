import React, { useState, useEffect } from 'react';
import { 
  Users, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  BookOpen, 
  GraduationCap, 
  ShieldCheck, 
  BarChart3, 
  Clock, 
  User, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { UserProfile, StudentProgress } from '../types';
import { 
  ClassItem, 
  joinClassWithCode, 
  fetchStudentEnrolledClasses 
} from '../services/firestoreService';
import { StudentTasksPanel } from './StudentTasksPanel';
import { Calendar } from 'lucide-react';

interface StudentClassesViewProps {
  user: UserProfile;
  progress: StudentProgress;
  onNavigateToLessons?: (subtopicCode?: string) => void;
  onNavigateToQuizzes?: (topicCode?: string) => void;
  initialTab?: 'tasks' | 'classes';
}

export const StudentClassesView: React.FC<StudentClassesViewProps> = ({
  user,
  progress,
  onNavigateToLessons,
  onNavigateToQuizzes,
  initialTab = 'tasks'
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'tasks' | 'classes'>(initialTab);
  const [classCodeInput, setClassCodeInput] = useState<string>('');
  const [joining, setJoining] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [enrolledClasses, setEnrolledClasses] = useState<ClassItem[]>([]);
  const [loadingClasses, setLoadingClasses] = useState<boolean>(true);

  // Load classes student is enrolled in
  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoadingClasses(true);
      try {
        const classes = await fetchStudentEnrolledClasses(user.id);
        if (isMounted) {
          setEnrolledClasses(classes);
        }
      } catch (err) {
        console.error('Failed to load student classes:', err);
      } finally {
        if (isMounted) setLoadingClasses(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, [user.id]);

  const handleJoinClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classCodeInput.trim()) return;

    setJoining(true);
    setStatusMessage(null);
    try {
      const result = await joinClassWithCode(classCodeInput.trim(), user, progress);
      if (result.success && result.classItem) {
        setStatusMessage({ type: 'success', text: result.message });
        setClassCodeInput('');
        // Add to local state if not present
        if (!enrolledClasses.some(c => c.id === result.classItem!.id)) {
          setEnrolledClasses(prev => [result.classItem!, ...prev]);
        }
      } else {
        setStatusMessage({ type: 'error', text: result.message });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'Error joining class.' });
    } finally {
      setJoining(false);
    }
  };

  const completedCount = progress.completedLessons?.length || 0;
  const quizScoresList = Object.values(progress.quizScores || {});
  const avgQuizScore = quizScoresList.length > 0 
    ? Math.round((quizScoresList.reduce((acc, q) => acc + (q.score / (q.total || 1)), 0) / quizScoresList.length) * 100)
    : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/60 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Student Classes Portal
              </span>
              <span className="text-xs text-slate-400">
                Cambridge IGCSE 0653
              </span>
            </div>
            <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <Users className="w-7 h-7 text-emerald-400" />
              <span>My Classes & Progress Sharing</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Join your teacher's class using the specific class code provided by your instructor. Your progress, completed lesson decks, and quiz scores will automatically be shared with your instructor.
            </p>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-center shrink-0">
            <div className="text-2xl font-black text-emerald-400">{enrolledClasses.length}</div>
            <div className="text-xs text-slate-400 font-medium">Joined Classes</div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveSubTab('tasks')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeSubTab === 'tasks'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Assigned Tasks & Homework</span>
        </button>

        <button
          onClick={() => setActiveSubTab('classes')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeSubTab === 'classes'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Enrolled Classes & Join Code ({enrolledClasses.length})</span>
        </button>
      </div>

      {activeSubTab === 'tasks' ? (
        <StudentTasksPanel
          user={user}
          progress={progress}
          enrolledClassIds={enrolledClasses.map(c => c.id)}
          onNavigateToLessons={onNavigateToLessons}
          onNavigateToQuizzes={onNavigateToQuizzes}
        />
      ) : (
        <>
          {/* Join Class Form Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="max-w-xl mx-auto space-y-5">
          <div className="text-center space-y-1">
            <div className="inline-flex items-center justify-center p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 mb-1">
              <KeyRound className="w-5 h-5" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white">Enter Class Code</h2>
            <p className="text-xs text-slate-400">
              Ask your teacher for your class code (e.g. <span className="font-mono text-emerald-400 font-bold">SCI-8492</span>) to join their class.
            </p>
          </div>

          <form onSubmit={handleJoinClass} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={classCodeInput}
                onChange={e => setClassCodeInput(e.target.value.toUpperCase())}
                placeholder="e.g. SCI-8492"
                maxLength={10}
                className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-700 rounded-2xl text-sm font-mono tracking-wider text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase"
              />
            </div>
            <button
              type="submit"
              disabled={joining || !classCodeInput.trim()}
              className={`px-6 py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition shadow-md ${
                joining || !classCodeInput.trim()
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
              }`}
            >
              {joining ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Joining...</span>
                </>
              ) : (
                <>
                  <span>Join Class</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {statusMessage && (
            <div className={`p-4 rounded-2xl text-xs flex items-start gap-3 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-300'
                : 'bg-red-950/40 border border-red-500/40 text-red-300'
            }`}>
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 font-medium">{statusMessage.text}</div>
            </div>
          )}
        </div>
      </div>

      {/* Enrolled Classes List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            <span>My Enrolled Classes ({enrolledClasses.length})</span>
          </h2>
          <span className="text-xs text-slate-400">
            Progress updates sync automatically with your instructors
          </span>
        </div>

        {loadingClasses ? (
          <div className="p-8 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-3xl">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <span className="text-xs">Loading your classes...</span>
          </div>
        ) : enrolledClasses.length === 0 ? (
          <div className="p-10 text-center bg-slate-900/60 border border-dashed border-slate-800 rounded-3xl space-y-3">
            <GraduationCap className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-300">You haven't joined any classes yet</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Ask your science teacher for your class code to join your cohort and start sharing your revision progress.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {enrolledClasses.map(cls => (
              <div 
                key={cls.id} 
                className="bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-3xl p-6 transition shadow-sm space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        {cls.classCode}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400 capitalize">
                        {cls.subject === 'all' ? 'All Sciences (Bio, Chem, Phys)' : `${cls.subject} Focused`}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white">{cls.name}</h3>
                    {cls.description && (
                      <p className="text-xs text-slate-400">{cls.description}</p>
                    )}
                  </div>

                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 ring-4 ring-emerald-400/20" title="Active Connection"></span>
                </div>

                <div className="pt-2 border-t border-slate-800 text-xs text-slate-400 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-purple-400" />
                      <span>Instructor:</span>
                    </span>
                    <span className="font-semibold text-slate-200">{cls.instructorName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Instructor Email:</span>
                    <span className="font-mono text-slate-300">{cls.instructorEmail}</span>
                  </div>
                </div>

                {/* Progress Snapshot Shared */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-medium">Shared Progress Snapshot</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Syncing Live
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-900 p-2 rounded-xl border border-slate-800/80">
                      <span className="text-slate-400 block text-[10px]">Completed Decks</span>
                      <span className="font-bold text-white text-sm">{completedCount} Lessons</span>
                    </div>
                    <div className="bg-slate-900 p-2 rounded-xl border border-slate-800/80">
                      <span className="text-slate-400 block text-[10px]">Average Quiz Score</span>
                      <span className="font-bold text-white text-sm">{avgQuizScore}%</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  {onNavigateToLessons && (
                    <button
                      onClick={() => onNavigateToLessons?.()}
                      className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition text-center"
                    >
                      Study Slides
                    </button>
                  )}
                  {onNavigateToQuizzes && (
                    <button
                      onClick={() => onNavigateToQuizzes?.()}
                      className="flex-1 py-2 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-xs font-semibold text-emerald-300 transition text-center"
                    >
                      Practice Quizzes
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </>
      )}
    </div>
  );
};
