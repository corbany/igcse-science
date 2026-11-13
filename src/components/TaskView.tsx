import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  BookOpen, 
  FileText, 
  Search, 
  Send, 
  Gamepad2, 
  ChevronRight,
  ListChecks,
  Filter,
  Check
} from 'lucide-react';
import { TaskWithSubmission, UserProfile, StudentProgress } from '../types';
import { 
  fetchTasksForStudent, 
  autoEvaluateAllTasksForStudent, 
  subscribeToStudentTasks,
  updateTaskSubmission,
  evaluateTaskProgressForStudent
} from '../services/firestoreService';

interface TaskViewProps {
  user: UserProfile;
  progress: StudentProgress;
  enrolledClassIds: string[];
  onNavigateToLessons?: (subtopicCode?: string, task?: TaskWithSubmission) => void;
  onNavigateToQuizzes?: (topicCode?: string, task?: TaskWithSubmission) => void;
  onNavigateToRoyale?: () => void;
}

export const TaskView: React.FC<TaskViewProps> = ({
  user,
  progress,
  enrolledClassIds,
  onNavigateToLessons,
  onNavigateToQuizzes,
  onNavigateToRoyale
}) => {
  const [tasks, setTasks] = useState<TaskWithSubmission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<'todo' | 'completed' | 'all'>('todo');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTask, setSelectedTask] = useState<TaskWithSubmission | null>(null);
  const [submissionNotes, setSubmissionNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const loadTasks = async () => {
      setLoading(true);
      try {
        await autoEvaluateAllTasksForStudent(user, enrolledClassIds, progress);
        const fetched = await fetchTasksForStudent(user, enrolledClassIds, progress);
        if (isMounted) {
          setTasks(fetched);
          setLoading(false);
        }
      } catch (e) {
        console.error('Error loading tasks:', e);
        if (isMounted) setLoading(false);
      }
    };

    loadTasks();

    const unsubscribe = subscribeToStudentTasks(user, enrolledClassIds, progress, (updatedTasks) => {
      if (isMounted) {
        setTasks(updatedTasks);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [user.id, enrolledClassIds.length, progress]);

  // Filter tasks based on status and search query
  const filteredTasks = tasks.filter(t => {
    const isCompleted = t.submission?.status === 'completed';
    if (statusFilter === 'todo' && isCompleted) return false;
    if (statusFilter === 'completed' && !isCompleted) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchSubject = (t.targetSubject || '').toLowerCase().includes(q);
      const matchSubtopic = (t.targetSubtopics || []).some(s => s.toLowerCase().includes(q));
      return matchTitle || matchSubject || matchSubtopic;
    }
    return true;
  });

  const todoCount = tasks.filter(t => t.submission?.status !== 'completed').length;
  const completedCount = tasks.filter(t => t.submission?.status === 'completed').length;

  const handleSaveTaskNote = async (task: TaskWithSubmission) => {
    if (!task) return;
    setSubmitting(true);
    try {
      await updateTaskSubmission(task.id, user.id, {
        studentName: user.name || 'Student',
        studentEmail: user.email || '',
        notes: submissionNotes
      });
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        setSelectedTask(null);
        setSubmissionNotes('');
      }, 1000);
    } catch (e) {
      console.error('Saving task note failed:', e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-12 font-sans text-slate-800">
      
      {/* Header and Quick Summary Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              Tasks and Assignments
            </h1>
            <p className="text-base text-slate-600 mt-1">
              Review your assigned science homework, revision checkpoints, and class exercises.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-[#EBF3F5] border border-slate-300 rounded-lg px-4 py-2 text-center">
              <span className="block text-xl font-bold text-slate-800">{todoCount}</span>
              <span className="block text-xs font-semibold text-slate-600">To Do</span>
            </div>
            <div className="bg-[#FDFBF7] border border-slate-300 rounded-lg px-4 py-2 text-center">
              <span className="block text-xl font-bold text-slate-800">{completedCount}</span>
              <span className="block text-xs font-semibold text-slate-600">Completed</span>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="mt-6 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Status Tabs with Icons and Text Labels */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setStatusFilter('todo')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-bold border transition ${
                statusFilter === 'todo'
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>To Do ({todoCount})</span>
            </button>

            <button
              onClick={() => setStatusFilter('completed')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-bold border transition ${
                statusFilter === 'completed'
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Completed ({completedCount})</span>
            </button>

            <button
              onClick={() => setStatusFilter('all')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-bold border transition ${
                statusFilter === 'all'
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              <ListChecks className="w-4 h-4" />
              <span>All Tasks ({tasks.length})</span>
            </button>
          </div>

          {/* Search Input with Crisp Black Border */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks or topics..."
              className="w-full pl-9 pr-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Task List Section */}
      {loading ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-600">
          <p className="text-base font-semibold">Loading assignments...</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">All caught up!</h3>
          <p className="text-base text-slate-600 max-w-md mx-auto">
            {statusFilter === 'todo'
              ? 'You have completed all pending tasks in your enrolled classes.'
              : 'No assignments match your search filter.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredTasks.map((task) => {
            const liveSub = evaluateTaskProgressForStudent(task, user, progress, task.submission);
            const isCompleted = liveSub.status === 'completed';
            const isDueDatePassed = task.dueDate && new Date(task.dueDate) < new Date();
            const subtopicCode = task.targetSubtopics?.[0];
            const subjectLabel = task.targetSubject && task.targetSubject !== 'all' ? task.targetSubject.toUpperCase() : 'SCIENCE';
            const reqLen = task.requiredQuizLength || liveSub.requiredQuizLength || 10;
            const needsSlidesAndTL = task.requireSlidesAndTrafficLight !== false || task.type === 'both' || task.type === 'slides_traffic_light';
            const needsPracticeQuiz = task.type === 'both' || task.type === 'practice_quiz' || task.type === 'exam_paper';

            return (
              <div
                key={task.id}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-400 transition space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-300">
                        {subjectLabel}
                      </span>
                      {(task.targetSubtopics || []).map(code => (
                        <span key={code} className="text-xs font-bold px-2 py-0.5 rounded bg-[#EBF3F5] text-slate-800 border border-slate-300 font-mono">
                          {code}
                        </span>
                      ))}
                      {needsPracticeQuiz && (
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-sky-50 text-sky-900 border border-sky-300">
                          Exact Quiz Length: {reqLen} Qs
                        </span>
                      )}
                      {isCompleted ? (
                        <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Completed</span>
                        </span>
                      ) : isDueDatePassed ? (
                        <span className="text-xs font-bold text-rose-700 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Due date passed</span>
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-amber-700 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>In progress</span>
                        </span>
                      )}
                    </div>

                    <h2 className="text-lg font-bold text-slate-800 leading-snug">
                      {task.title}
                    </h2>
                  </div>

                  {/* Due Date Indicator */}
                  {task.dueDate && (
                    <div className="text-xs text-slate-600 font-semibold shrink-0">
                      <span>Due: </span>
                      <strong className="text-slate-800">{new Date(task.dueDate).toLocaleDateString()}</strong>
                    </div>
                  )}
                </div>

                {/* Short bullet points for task description / instructions */}
                {task.description && (
                  <div className="bg-[#FDFBF7] border border-slate-200 rounded-lg p-3 text-sm text-slate-700">
                    <p className="font-semibold text-slate-800 mb-1">Key instructions:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {task.description.split('\n').filter(line => line.trim().length > 0).map((line, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {line.replace(/^[-*•]\s*/, '')}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Strict Auto-Verified Completion Checklist */}
                <div className="bg-[#FDFBF7] border border-slate-300 rounded-lg p-3.5 space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wide text-slate-700 flex items-center justify-between">
                    <span>Completion Checklist (Auto-Verified)</span>
                    <span className={isCompleted ? 'text-emerald-700' : 'text-amber-700'}>
                      {isCompleted ? '✓ All Requirements Met' : 'Complete all steps below'}
                    </span>
                  </div>
                  <div className={`grid grid-cols-1 ${needsSlidesAndTL && needsPracticeQuiz ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-2.5 text-xs`}>
                    {needsSlidesAndTL && (
                      <>
                        <div className={`p-2.5 rounded-lg border flex items-center justify-between gap-2 ${
                          liveSub.slidesCompleted
                            ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold'
                            : 'bg-white border-slate-300 text-slate-700'
                        }`}>
                          <span>1. Read All Slides</span>
                          <span className="font-mono shrink-0">
                            {liveSub.slidesCompleted
                              ? '✓ Read'
                              : liveSub.slidesTotalCount
                                ? `${liveSub.slidesReadCount || 0}/${liveSub.slidesTotalCount}`
                                : 'Pending'}
                          </span>
                        </div>
                        <div className={`p-2.5 rounded-lg border flex items-center justify-between gap-2 ${
                          liveSub.trafficLightQuizCompleted
                            ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold'
                            : 'bg-white border-slate-300 text-slate-700'
                        }`}>
                          <span>2. Traffic Light Quiz</span>
                          <span className="font-mono shrink-0">
                            {liveSub.trafficLightQuizCompleted && liveSub.trafficLightQuizScore !== undefined
                              ? `✓ ${liveSub.trafficLightQuizScore}%`
                              : 'Pending'}
                          </span>
                        </div>
                      </>
                    )}
                    {needsPracticeQuiz && (
                      <div className={`p-2.5 rounded-lg border flex items-center justify-between gap-2 ${
                        liveSub.practiceQuizScore !== undefined
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold'
                          : 'bg-white border-slate-300 text-slate-700'
                      }`}>
                        <span>{needsSlidesAndTL ? '3.' : '1.'} Quiz ({reqLen} Qs Exact)</span>
                        <span className="font-mono shrink-0">
                          {liveSub.practiceQuizScore !== undefined
                            ? `✓ ${liveSub.practiceQuizScore}%`
                            : `Need ${reqLen} Qs`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Primary Student Actions reachable in 1-2 clicks */}
                <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100">
                  {/* Action 1: View Lesson Slides & Traffic Light Quiz */}
                  {onNavigateToLessons && subtopicCode && (
                    <button
                      onClick={() => onNavigateToLessons(subtopicCode, task)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-lg flex items-center gap-2 cursor-pointer transition"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>Open Slides & TL Quiz</span>
                    </button>
                  )}

                  {/* Action 2: Start Exact-Length Practice Quiz */}
                  {onNavigateToQuizzes && needsPracticeQuiz && (
                    <button
                      onClick={() => onNavigateToQuizzes(subtopicCode, task)}
                      className="px-4 py-2 bg-[#EBF3F5] hover:bg-[#d8e9ec] text-slate-800 border border-slate-400 text-sm font-bold rounded-lg flex items-center gap-2 cursor-pointer transition"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Start {reqLen}-Q Practice Quiz</span>
                    </button>
                  )}

                  {/* Action 3: Start Game / Royale Tournament */}
                  {onNavigateToRoyale && (
                    <button
                      onClick={onNavigateToRoyale}
                      className="px-4 py-2 bg-[#FDFBF7] hover:bg-slate-100 text-slate-800 border border-slate-400 text-sm font-bold rounded-lg flex items-center gap-2 cursor-pointer transition"
                    >
                      <Gamepad2 className="w-4 h-4" />
                      <span>Start Game Arena</span>
                    </button>
                  )}

                  {/* Optional Note Button (does not manually mark task complete) */}
                  <button
                    onClick={() => {
                      setSelectedTask(task);
                      setSubmissionNotes(task.submission?.notes || '');
                    }}
                    className="ml-auto px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-sm font-bold rounded-lg flex items-center gap-2 cursor-pointer transition"
                  >
                    <Send className="w-4 h-4" />
                    <span>{task.submission?.notes ? 'Edit Note' : 'Add Note'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Optional Study Note Dialog (Tasks complete automatically once slides & quizzes are finished) */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-xl p-6 max-w-lg w-full space-y-4 shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-800">
                  Study Note: {selectedTask.title}
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  Add a note for your teacher. Note: tasks automatically mark complete only after reading all assigned slides and finishing required quizzes.
                </p>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="text-slate-500 hover:text-slate-800 text-lg font-bold px-2"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">
                Revision note or question for instructor:
              </label>
              <textarea
                rows={4}
                value={submissionNotes}
                onChange={(e) => setSubmissionNotes(e.target.value)}
                placeholder="Write a summary or question about these slides or quiz..."
                className="w-full"
              />
            </div>

            {submitSuccess && (
              <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg p-3 text-sm font-bold flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>Note saved for your instructor!</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedTask(null)}
                disabled={submitting}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm font-bold hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveTaskNote(selectedTask)}
                disabled={submitting}
                className="px-5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold flex items-center gap-2 cursor-pointer shadow-xs"
              >
                {submitting ? 'Saving...' : 'Save Note'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
