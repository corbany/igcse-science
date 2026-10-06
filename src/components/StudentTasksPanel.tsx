import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  BookOpen, 
  Award, 
  FileText, 
  User, 
  ArrowRight, 
  AlertTriangle, 
  Filter, 
  Search, 
  Check, 
  Sparkles,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  RefreshCw,
  Bell
} from 'lucide-react';
import { 
  TaskWithSubmission, 
  TaskProgressStatus, 
  UserProfile, 
  StudentProgress, 
  TrafficLightStatus 
} from '../types';
import { 
  fetchTasksForStudent, 
  updateTaskSubmission 
} from '../services/firestoreService';

interface StudentTasksPanelProps {
  user: UserProfile;
  progress: StudentProgress;
  enrolledClassIds: string[];
  onNavigateToLessons?: (subtopicCode?: string) => void;
  onNavigateToQuizzes?: (topicCode?: string) => void;
  onTaskUpdated?: () => void;
}

export const StudentTasksPanel: React.FC<StudentTasksPanelProps> = ({
  user,
  progress,
  enrolledClassIds,
  onNavigateToLessons,
  onNavigateToQuizzes,
  onTaskUpdated
}) => {
  const [tasks, setTasks] = useState<TaskWithSubmission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'todo' | 'overdue' | 'completed'>('todo');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  const loadStudentTasks = async () => {
    setLoading(true);
    try {
      const fetched = await fetchTasksForStudent(user, enrolledClassIds, progress);
      setTasks(fetched);
    } catch (err) {
      console.error('Failed to load student tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudentTasks();
  }, [user.id, enrolledClassIds.length]);

  const handleToggleTaskComplete = async (task: TaskWithSubmission) => {
    setUpdatingTaskId(task.id);
    const newStatus: TaskProgressStatus = task.submission?.status === 'completed' ? 'incomplete' : 'completed';
    
    try {
      const updated = await updateTaskSubmission(task.id, user.id, {
        status: newStatus,
        studentName: user.name,
        studentEmail: user.email,
        completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined
      });

      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, submission: updated, isOverdue: t.isOverdue && newStatus !== 'completed' } : t));
      if (onTaskUpdated) onTaskUpdated();
    } catch (err) {
      console.error('Failed to update task submission:', err);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const handleStartTask = (task: TaskWithSubmission) => {
    const subtopic = task.targetSubtopics[0] || '';
    if (task.type === 'slides_traffic_light' && onNavigateToLessons) {
      onNavigateToLessons(subtopic);
    } else if (task.type === 'practice_quiz' && onNavigateToQuizzes) {
      onNavigateToQuizzes(subtopic);
    } else if (onNavigateToLessons) {
      onNavigateToLessons(subtopic);
    }
  };

  const now = Date.now();
  const overdueTasks = tasks.filter(t => t.isOverdue && t.submission?.status !== 'completed');
  const todoTasks = tasks.filter(t => t.submission?.status !== 'completed');
  const completedTasks = tasks.filter(t => t.submission?.status === 'completed');

  // Filter tasks based on view tab
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.targetSubtopics.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const status = task.submission?.status || 'not_started';
    const matchesStatus = 
      statusFilter === 'all' ? true :
      statusFilter === 'todo' ? status !== 'completed' :
      statusFilter === 'overdue' ? (task.isOverdue && status !== 'completed') :
      statusFilter === 'completed' ? status === 'completed' : true;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Urgent Notifications Strip */}
      {overdueTasks.length > 0 && (
        <div className="bg-rose-950/60 border border-rose-500/50 rounded-2xl p-4 text-xs text-rose-200 flex items-start gap-3 shadow-sm animate-pulse">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1 flex-1">
            <div className="font-bold text-sm text-white flex items-center gap-2">
              <span>Attention: You have {overdueTasks.length} Overdue Assignment{overdueTasks.length > 1 ? 's' : ''}!</span>
            </div>
            <p className="text-rose-300">
              Please complete these tasks and mark your traffic lights or quizzes so your instructor can review your progress.
            </p>
            <div className="pt-1 flex items-center gap-2 flex-wrap">
              {overdueTasks.slice(0, 3).map(ot => (
                <button
                  key={ot.id}
                  onClick={() => handleStartTask(ot)}
                  className="px-2.5 py-1 rounded-lg bg-rose-900/80 hover:bg-rose-800 text-white font-bold text-[11px] flex items-center gap-1 transition"
                >
                  <span>{ot.title}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Header Card with Statistics */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Assigned Homework & Revision Tracker
              </span>
              <span className="text-xs text-slate-400">
                {tasks.length} Total Assignment{tasks.length !== 1 ? 's' : ''}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-400" />
              <span>Teacher Assignments & Due Dates</span>
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl">
              Tasks set specifically for your science class. Complete slide deck reading, mark your traffic light confidence, and complete practice quizzes before the due date.
            </p>
          </div>

          <button
            onClick={loadStudentTasks}
            title="Refresh assignments"
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition flex items-center gap-1.5 text-xs font-semibold self-start sm:self-center"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-800/80">
          <div 
            onClick={() => setStatusFilter('todo')}
            className={`p-3 rounded-2xl border cursor-pointer transition ${
              statusFilter === 'todo' 
                ? 'bg-amber-950/30 border-amber-500/50' 
                : 'bg-slate-950 border-slate-800 hover:border-slate-700'
            }`}
          >
            <span className="text-[11px] text-slate-400 block font-medium">To Do / Pending</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-xl font-bold text-amber-400">{todoTasks.length}</span>
              <span className="text-[10px] text-slate-500">Tasks</span>
            </div>
          </div>

          <div 
            onClick={() => setStatusFilter('overdue')}
            className={`p-3 rounded-2xl border cursor-pointer transition ${
              statusFilter === 'overdue' 
                ? 'bg-rose-950/40 border-rose-500/50' 
                : 'bg-slate-950 border-slate-800 hover:border-slate-700'
            }`}
          >
            <span className="text-[11px] text-slate-400 block font-medium">Overdue</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-xl font-bold text-rose-400">{overdueTasks.length}</span>
              <span className="text-[10px] text-slate-500">Tasks</span>
            </div>
          </div>

          <div 
            onClick={() => setStatusFilter('completed')}
            className={`p-3 rounded-2xl border cursor-pointer transition ${
              statusFilter === 'completed' 
                ? 'bg-emerald-950/30 border-emerald-500/50' 
                : 'bg-slate-950 border-slate-800 hover:border-slate-700'
            }`}
          >
            <span className="text-[11px] text-slate-400 block font-medium">Completed</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-xl font-bold text-emerald-400">{completedTasks.length}</span>
              <span className="text-[10px] text-slate-500">Finished</span>
            </div>
          </div>

          <div 
            onClick={() => setStatusFilter('all')}
            className={`p-3 rounded-2xl border cursor-pointer transition ${
              statusFilter === 'all' 
                ? 'bg-slate-800 border-purple-500/50' 
                : 'bg-slate-950 border-slate-800 hover:border-slate-700'
            }`}
          >
            <span className="text-[11px] text-slate-400 block font-medium">Completion Rate</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-xl font-bold text-purple-400">
                {tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 100}%
              </span>
              <span className="text-[10px] text-slate-500">Total</span>
            </div>
          </div>
        </div>

        {/* Filters and search */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setStatusFilter('todo')}
              className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 ${
                statusFilter === 'todo' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              To Do ({todoTasks.length})
            </button>
            <button
              onClick={() => setStatusFilter('overdue')}
              className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 ${
                statusFilter === 'overdue' ? 'bg-rose-600 text-white shadow-xs' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Overdue ({overdueTasks.length})
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 ${
                statusFilter === 'completed' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Completed ({completedTasks.length})
            </button>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 ${
                statusFilter === 'all' ? 'bg-slate-700 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              All Tasks ({tasks.length})
            </button>
          </div>

          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search tasks or codes..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-400 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Task Cards List */}
      {loading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs font-semibold">Checking your assigned class tasks...</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="bg-slate-900/60 border border-dashed border-slate-800 rounded-3xl p-10 text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-500/60 mx-auto" />
          <h3 className="text-base font-bold text-slate-300">
            {statusFilter === 'todo' ? 'All caught up! No pending tasks.' :
             statusFilter === 'overdue' ? 'No overdue assignments! Great job!' :
             'No tasks match your selection.'}
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {statusFilter === 'todo'
              ? 'You have completed all assignments set by your instructors. Check back later or revise ahead in Lesson Slides.'
              : 'Tasks set by your teacher with deadlines will appear here automatically.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTasks.map(task => {
            const submission = task.submission;
            const isCompleted = submission?.status === 'completed';
            const dueDateObj = new Date(task.dueDate);
            const isOverdue = task.isOverdue && !isCompleted;
            const diffDays = Math.ceil((dueDateObj.getTime() - now) / (1000 * 60 * 60 * 24));

            return (
              <div
                key={task.id}
                className={`bg-slate-900 border rounded-3xl p-5 sm:p-6 transition shadow-sm space-y-4 flex flex-col justify-between ${
                  isCompleted 
                    ? 'border-emerald-500/30 bg-gradient-to-b from-slate-900 to-emerald-950/20' 
                    : isOverdue 
                      ? 'border-rose-500/40 bg-gradient-to-b from-slate-900 to-rose-950/20' 
                      : 'border-slate-800 hover:border-emerald-500/40'
                }`}
              >
                <div className="space-y-3">
                  {/* Top Row: Type & Due Badge */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${
                      task.type === 'both'
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                        : task.type === 'slides_traffic_light'
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : task.type === 'practice_quiz'
                            ? 'bg-sky-500/15 text-sky-400 border-sky-500/30'
                            : 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                    }`}>
                      {task.type === 'both' && <Sparkles className="w-3 h-3 text-purple-400" />}
                      {task.type === 'slides_traffic_light' && <BookOpen className="w-3 h-3 text-emerald-400" />}
                      {task.type === 'practice_quiz' && <Award className="w-3 h-3 text-sky-400" />}
                      {task.type === 'exam_paper' && <FileText className="w-3 h-3" />}
                      <span>
                        {task.type === 'both' ? 'Both: Slides & Quiz' :
                         task.type === 'slides_traffic_light' ? 'Slides & Traffic Lights' :
                         task.type === 'practice_quiz' ? 'Practice Quiz' : 'Assignment'}
                      </span>
                    </span>

                    {/* Due Date Indicator */}
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-lg border flex items-center gap-1 ${
                      isCompleted
                        ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                        : isOverdue
                          ? 'bg-rose-950/60 text-rose-300 border-rose-500/40 animate-pulse'
                          : diffDays <= 1
                            ? 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}>
                      <Clock className="w-3 h-3" />
                      <span>
                        {isCompleted 
                          ? 'Done' 
                          : isOverdue 
                            ? `Overdue (${dueDateObj.toLocaleDateString()})` 
                            : diffDays === 0 
                              ? 'Due Today' 
                              : diffDays === 1 
                                ? 'Due Tomorrow' 
                                : `Due in ${diffDays}d`}
                      </span>
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className={`text-base font-bold transition ${isCompleted ? 'text-slate-300 line-through' : 'text-white'}`}>
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="text-xs text-slate-400 mt-1 line-clamp-3">
                        {task.description}
                      </p>
                    )}
                  </div>

                  {/* Dual Task Progress Components (for 'both' tasks) */}
                  {task.type === 'both' && (
                    <div className="p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                        <span>Required Components:</span>
                        <span className="text-purple-300 font-bold">
                          {isCompleted ? '2 of 2 Finished' : (submission?.trafficLight || submission?.quizScore !== undefined) ? '1 of 2 Complete' : '0 of 2 Complete'}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {/* Component 1: Slides & Traffic Light */}
                        <div className={`p-2 rounded-xl border flex items-center justify-between ${
                          submission?.trafficLight || submission?.slidesCompleted
                            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                            : 'bg-slate-900 border-slate-800 text-slate-300'
                        }`}>
                          <div className="flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span className="font-semibold truncate">1. Slides & Light</span>
                          </div>
                          {submission?.trafficLight ? (
                            <span className="flex items-center gap-1 text-[11px] font-bold shrink-0">
                              <span className={`w-2.5 h-2.5 rounded-full ${
                                submission.trafficLight === 'green' ? 'bg-emerald-400' :
                                submission.trafficLight === 'orange' ? 'bg-amber-400' : 'bg-rose-500'
                              }`}></span>
                              <span className="capitalize">{submission.trafficLight}</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-500 shrink-0">Pending</span>
                          )}
                        </div>

                        {/* Component 2: Practice Quiz */}
                        <div className={`p-2 rounded-xl border flex items-center justify-between ${
                          submission?.quizScore !== undefined || submission?.quizCompleted
                            ? 'bg-sky-950/40 border-sky-500/40 text-sky-300'
                            : 'bg-slate-900 border-slate-800 text-slate-300'
                        }`}>
                          <div className="flex items-center gap-1.5">
                            <Award className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                            <span className="font-semibold truncate">2. Practice Quiz</span>
                          </div>
                          {submission?.quizScore !== undefined ? (
                            <span className="text-[11px] font-bold text-sky-400 shrink-0">
                              {submission.quizScore}% Score
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-500 shrink-0">Pending</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Target Subtopics */}
                  {task.targetSubtopics && task.targetSubtopics.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className="text-[11px] text-slate-500 font-medium">Subtopic:</span>
                      {task.targetSubtopics.map(code => (
                        <span 
                          key={code}
                          className="px-2 py-0.5 rounded-md bg-slate-800 text-emerald-300 border border-slate-700 text-xs font-mono font-bold"
                        >
                          {code}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Class & Instructor info */}
                  <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
                    <span className="truncate">{task.className}</span>
                    <span className="text-slate-300 font-medium">Instructor: {task.instructorName}</span>
                  </div>
                </div>

                {/* Bottom Action Section */}
                <div className="pt-3 border-t border-slate-800 space-y-2.5">
                  {/* Status Indicator Card */}
                  <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Your Status:</span>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 ${
                        isCompleted
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : submission?.status === 'incomplete'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            : 'bg-slate-800 text-slate-400'
                      }`}>
                        {isCompleted && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                        <span>
                          {isCompleted ? 'Completed' :
                           submission?.status === 'incomplete' ? 'In Progress' : 'Not Started'}
                        </span>
                      </span>

                      {submission?.trafficLight && (
                        <span className={`w-3 h-3 rounded-full ${
                          submission.trafficLight === 'green' ? 'bg-emerald-400' :
                          submission.trafficLight === 'orange' ? 'bg-amber-400' : 'bg-rose-500'
                        }`} title={`Traffic light rating: ${submission.trafficLight}`}></span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {task.type === 'both' ? (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <button
                        onClick={() => onNavigateToLessons && onNavigateToLessons(task.targetSubtopics[0])}
                        className="flex-1 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>1. Open Slides & Set Light</span>
                      </button>

                      <button
                        onClick={() => onNavigateToQuizzes && onNavigateToQuizzes(task.targetSubtopics[0])}
                        className="flex-1 py-2 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>2. Take Practice Quiz</span>
                      </button>

                      <button
                        onClick={() => handleToggleTaskComplete(task)}
                        disabled={updatingTaskId === task.id}
                        title={isCompleted ? 'Mark as Incomplete' : 'Mark as Completed'}
                        className={`p-2 rounded-xl border text-xs font-semibold transition shrink-0 self-center sm:self-auto ${
                          isCompleted 
                            ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white' 
                            : 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/60'
                        }`}
                      >
                        {isCompleted ? <Check className="w-4 h-4 text-emerald-400" /> : <Check className="w-4 h-4" />}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleStartTask(task)}
                        className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        {task.type === 'slides_traffic_light' ? (
                          <>
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>Open Slides & Set Light</span>
                          </>
                        ) : task.type === 'practice_quiz' ? (
                          <>
                            <Award className="w-3.5 h-3.5" />
                            <span>Start Quiz</span>
                          </>
                        ) : (
                          <>
                            <span>Go to Lesson</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleToggleTaskComplete(task)}
                        disabled={updatingTaskId === task.id}
                        title={isCompleted ? 'Mark as Incomplete' : 'Mark as Completed'}
                        className={`p-2 rounded-xl border text-xs font-semibold transition shrink-0 ${
                          isCompleted 
                            ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white' 
                            : 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/60'
                        }`}
                      >
                        {isCompleted ? <Check className="w-4 h-4 text-emerald-400" /> : <Check className="w-4 h-4" />}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
