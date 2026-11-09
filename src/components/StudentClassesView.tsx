import React, { useState, useEffect } from 'react';
import { 
  Users, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  BookOpen, 
  GraduationCap, 
  Clock, 
  User, 
  ArrowRight,
  Trophy,
  Calendar,
  FileText
} from 'lucide-react';
import { UserProfile, StudentProgress } from '../types';
import { 
  ClassItem, 
  joinClassWithCode, 
  fetchStudentEnrolledClasses 
} from '../services/firestoreService';
import { TaskView } from './TaskView';
import { StudentLeaderboard } from './StudentLeaderboard';

interface StudentClassesViewProps {
  user: UserProfile;
  progress: StudentProgress;
  onNavigateToLessons?: (subtopicCode?: string) => void;
  onNavigateToQuizzes?: (topicCode?: string) => void;
  initialTab?: 'tasks' | 'classes' | 'leaderboard';
}

export const StudentClassesView: React.FC<StudentClassesViewProps> = ({
  user,
  progress,
  onNavigateToLessons,
  onNavigateToQuizzes,
  initialTab = 'tasks'
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'tasks' | 'classes' | 'leaderboard'>(initialTab);
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
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-12 font-sans text-slate-800">
      
      {/* Banner Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#EBF3F5] text-slate-800 border border-slate-300">
                Student Classes Portal
              </span>
              <span className="text-xs font-semibold text-slate-600">
                Cambridge IGCSE 0653
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2.5">
              <Users className="w-6 h-6 text-slate-700" />
              <span>My Classes and Cohorts</span>
            </h1>
            <p className="text-base text-slate-600 max-w-2xl">
              Connect with your teacher by entering your class code. Your revision progress and quiz scores sync automatically to your teacher's gradebook.
            </p>
          </div>

          <div className="bg-[#EBF3F5] border border-slate-300 rounded-lg px-5 py-3 text-center shrink-0">
            <span className="block text-2xl font-bold text-slate-800">{enrolledClasses.length}</span>
            <span className="block text-xs font-semibold text-slate-600">Enrolled Classes</span>
          </div>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="mt-6 pt-4 border-t border-slate-200 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveSubTab('tasks')}
            className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 cursor-pointer transition border ${
              activeSubTab === 'tasks'
                ? 'bg-slate-800 text-white border-slate-800'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Assigned Tasks</span>
          </button>

          <button
            onClick={() => setActiveSubTab('classes')}
            className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 cursor-pointer transition border ${
              activeSubTab === 'classes'
                ? 'bg-slate-800 text-white border-slate-800'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Enrolled Classes ({enrolledClasses.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('leaderboard')}
            className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 cursor-pointer transition border ${
              activeSubTab === 'leaderboard'
                ? 'bg-slate-800 text-white border-slate-800'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-600" />
            <span>Class Leaderboard</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Leaderboard */}
      {activeSubTab === 'leaderboard' ? (
        <StudentLeaderboard
          user={user}
          progress={progress}
          enrolledClassIds={enrolledClasses.map(c => c.id)}
          onNavigateToLessons={onNavigateToLessons}
          onNavigateToQuizzes={onNavigateToQuizzes}
        />
      ) : activeSubTab === 'tasks' ? (
        /* Tab 2: Assigned Tasks */
        <TaskView
          user={user}
          progress={progress}
          enrolledClassIds={enrolledClasses.map(c => c.id)}
          onNavigateToLessons={onNavigateToLessons}
          onNavigateToQuizzes={onNavigateToQuizzes}
        />
      ) : (
        /* Tab 3: Enrolled Classes & Join Code */
        <div className="space-y-6">
          {/* Join Class Form Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-slate-700" />
                <span>Join a New Class</span>
              </h2>
              <p className="text-sm text-slate-600">
                Enter the class code given by your teacher (for example: <strong className="font-mono text-slate-800 font-bold">SCI-8492</strong>).
              </p>
            </div>

            <form onSubmit={handleJoinClass} className="flex flex-col sm:flex-row gap-3 max-w-xl">
              <div className="relative flex-1">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={classCodeInput}
                  onChange={e => setClassCodeInput(e.target.value.toUpperCase())}
                  placeholder="Enter code (e.g. SCI-8492)"
                  maxLength={12}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FDFBF7] border-2 border-black rounded-lg text-base font-mono font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white uppercase tracking-wider"
                />
              </div>

              <button
                type="submit"
                disabled={joining || !classCodeInput.trim()}
                className={`px-5 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition ${
                  joining || !classCodeInput.trim()
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-slate-800 hover:bg-slate-700 text-white'
                }`}
              >
                {joining ? 'Connecting...' : 'Join Class'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {statusMessage && (
              <div className={`p-3.5 rounded-lg text-sm flex items-start gap-2.5 border ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-rose-50 border-rose-300 text-rose-900'
              }`}>
                {statusMessage.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
                )}
                <span className="font-semibold">{statusMessage.text}</span>
              </div>
            )}
          </div>

          {/* Enrolled Classes List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-slate-700" />
                <span>My Active Classes ({enrolledClasses.length})</span>
              </h2>
              <span className="text-xs font-semibold text-slate-600">
                Syncs live with instructor gradebooks
              </span>
            </div>

            {loadingClasses ? (
              <div className="p-8 text-center text-slate-600 bg-white border border-slate-200 rounded-xl">
                <p className="text-base font-semibold">Loading your enrolled classes...</p>
              </div>
            ) : enrolledClasses.length === 0 ? (
              <div className="p-8 text-center bg-white border border-slate-200 rounded-xl space-y-2">
                <GraduationCap className="w-10 h-10 text-slate-400 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">You have not joined any classes yet</h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  Ask your science teacher for your class code to join your cohort and receive assignments.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {enrolledClasses.map(cls => (
                  <div 
                    key={cls.id} 
                    className="bg-white border border-slate-200 hover:border-slate-400 rounded-xl p-5 transition shadow-xs space-y-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#EBF3F5] text-slate-800 border border-slate-300">
                            {cls.classCode}
                          </span>
                          <span className="text-xs font-bold text-slate-600 capitalize">
                            {cls.subject === 'all' ? 'All Sciences' : `${cls.subject} Focused`}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-slate-800">{cls.name}</h3>
                        {cls.description && (
                          <p className="text-sm text-slate-600">{cls.description}</p>
                        )}
                      </div>

                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 ring-4 ring-emerald-100" title="Active Connection" />
                    </div>

                    <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 font-semibold">
                          <User className="w-3.5 h-3.5 text-slate-500" />
                          <span>Instructor:</span>
                        </span>
                        <strong className="text-slate-800">{cls.instructorName}</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Email:</span>
                        <span className="font-mono text-slate-700">{cls.instructorEmail}</span>
                      </div>
                    </div>

                    {/* Shared Progress Snapshot */}
                    <div className="bg-[#FDFBF7] border border-slate-200 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600 font-semibold">Shared Progress</span>
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Connected</span>
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-white p-2 rounded-md border border-slate-200">
                          <span className="text-slate-500 block text-[11px]">Completed Decks</span>
                          <strong className="text-slate-800 text-sm">{completedCount} Lessons</strong>
                        </div>
                        <div className="bg-white p-2 rounded-md border border-slate-200">
                          <span className="text-slate-500 block text-[11px]">Quiz Average</span>
                          <strong className="text-slate-800 text-sm">{avgQuizScore}%</strong>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        onClick={() => setActiveSubTab('leaderboard')}
                        className="w-full py-2 px-3 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-300 text-xs font-bold text-amber-900 transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Trophy className="w-3.5 h-3.5 text-amber-700" />
                        <span>View Class Leaderboard</span>
                      </button>
                      {onNavigateToLessons && (
                        <button
                          onClick={() => onNavigateToLessons?.()}
                          className="flex-1 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition text-center cursor-pointer flex items-center justify-center gap-1"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Study Slides</span>
                        </button>
                      )}
                      {onNavigateToQuizzes && (
                        <button
                          onClick={() => onNavigateToQuizzes?.()}
                          className="flex-1 py-2 px-3 rounded-lg bg-[#EBF3F5] hover:bg-[#d8e9ec] border border-slate-400 text-xs font-bold text-slate-800 transition text-center cursor-pointer flex items-center justify-center gap-1"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Practice Quizzes</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
