import React from 'react';
import { 
  BookOpen, 
  FileText, 
  Gamepad2, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Award, 
  BarChart3, 
  Users, 
  Calendar,
  Layers,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { UserProfile, StudentProgress, TaskWithSubmission } from '../types';

interface DashboardProps {
  user: UserProfile;
  progress: StudentProgress;
  tasks: TaskWithSubmission[];
  enrolledClassCount: number;
  onNavigateToTasks: () => void;
  onNavigateToLessons: (subtopicCode?: string) => void;
  onNavigateToQuizzes: () => void;
  onNavigateToRoyale: () => void;
  onNavigateToLeaderboard?: () => void;
  onNavigateToClasses?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  progress,
  tasks,
  enrolledClassCount,
  onNavigateToTasks,
  onNavigateToLessons,
  onNavigateToQuizzes,
  onNavigateToRoyale,
  onNavigateToLeaderboard,
  onNavigateToClasses
}) => {
  const completedLessonsCount = (progress.completedLessons || []).length;
  const pendingTasks = tasks.filter(t => t.submission?.status !== 'completed');
  const completedTasks = tasks.filter(t => t.submission?.status === 'completed');

  // Calculate high-level traffic light counts
  const trafficLights = progress.trafficLights || {};
  const greenCount = Object.values(trafficLights).filter(l => l === 'green').length;
  const orangeCount = Object.values(trafficLights).filter(l => l === 'orange').length;
  const redCount = Object.values(trafficLights).filter(l => l === 'red').length;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-12 font-sans text-slate-800">

      {/* Welcome Banner Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-600 bg-[#EBF3F5] px-2.5 py-1 rounded border border-slate-300 inline-block">
              {user.role === 'instructor' ? 'Instructor Dashboard' : 'Student Study Dashboard'}
            </span>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              Welcome back, {user.name}
            </h1>
            <p className="text-base text-slate-600">
              Here is your quick summary of revision tasks, lessons, and practice activities for today.
            </p>
          </div>

          {/* Target Grade Badge */}
          <div className="bg-[#FDFBF7] border border-slate-300 rounded-xl p-4 text-center shrink-0">
            <span className="block text-xs font-semibold text-slate-600">Target Grade</span>
            <span className="block text-2xl font-bold text-slate-800">{user.targetGrade || 'A*'}</span>
          </div>
        </div>

        {/* 1-Click Primary Action Buttons */}
        <div className="mt-6 pt-5 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={onNavigateToTasks}
            className="p-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition"
          >
            <Clock className="w-4 h-4" />
            <span>View Tasks ({pendingTasks.length})</span>
          </button>

          <button
            onClick={() => onNavigateToLessons()}
            className="p-3.5 bg-[#EBF3F5] hover:bg-[#d8e9ec] text-slate-800 border border-slate-400 rounded-lg font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition"
          >
            <BookOpen className="w-4 h-4" />
            <span>Study Lessons</span>
          </button>

          <button
            onClick={onNavigateToRoyale}
            className="p-3.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-400 rounded-lg font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition"
          >
            <Gamepad2 className="w-4 h-4" />
            <span>Start Game Arena</span>
          </button>
        </div>
      </div>

      {/* Status Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Pending Tasks */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">Pending Tasks</span>
            <Clock className="w-4 h-4 text-slate-600" />
          </div>
          <div className="text-3xl font-bold text-slate-800">{pendingTasks.length}</div>
          <p className="text-xs text-slate-600">
            {completedTasks.length} tasks completed so far
          </p>
        </div>

        {/* Card 2: Completed Lessons */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">Completed Lessons</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-3xl font-bold text-slate-800">{completedLessonsCount}</div>
          <p className="text-xs text-slate-600">
            Interactive syllabus slide decks
          </p>
        </div>

        {/* Card 3: Traffic Light Health */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">Syllabus Confidence</span>
            <BarChart3 className="w-4 h-4 text-slate-600" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
              {greenCount} Green
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
              {orangeCount} Amber
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300">
              {redCount} Red
            </span>
          </div>
          <p className="text-xs text-slate-600">
            Target 80%+ on knowledge checks
          </p>
        </div>

        {/* Card 4: Enrolled Classes */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">Active Classes</span>
            <Users className="w-4 h-4 text-slate-600" />
          </div>
          <div className="text-3xl font-bold text-slate-800">{enrolledClassCount}</div>
          <p className="text-xs text-slate-600">
            {enrolledClassCount > 0 ? 'Connected to instructor' : 'Enter class code'}
          </p>
        </div>

      </div>

      {/* Main Two-Column Content: Active Tasks & Revision Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols): Active Assignments Checklist */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Active Assignments
              </h2>
              <p className="text-sm text-slate-600">
                Prioritize homework due soon. Click to open lesson or submit work.
              </p>
            </div>
            <button
              onClick={onNavigateToTasks}
              className="text-sm font-bold text-slate-800 hover:text-black flex items-center gap-1 cursor-pointer"
            >
              <span>View all</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {pendingTasks.length === 0 ? (
            <div className="bg-[#FDFBF7] border border-slate-200 rounded-lg p-6 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-700 mx-auto" />
              <p className="text-base font-bold text-slate-800">No pending assignments</p>
              <p className="text-sm text-slate-600">
                Great job! You have finished all active class assignments.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingTasks.slice(0, 4).map((task) => {
                const subtopicCode = task.targetSubtopics?.[0];
                const subjectLabel = task.targetSubject && task.targetSubject !== 'all' ? task.targetSubject.toUpperCase() : 'SCIENCE';

                return (
                  <div
                    key={task.id}
                    className="bg-[#FDFBF7] border border-slate-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-400 transition"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-white text-slate-800 border border-slate-300">
                          {subjectLabel}
                        </span>
                        {subtopicCode && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#EBF3F5] text-slate-800 border border-slate-300">
                            {subtopicCode}
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-slate-800">
                        {task.title}
                      </h3>
                      {task.dueDate && (
                        <p className="text-xs text-slate-600">
                          Due date: <strong className="text-slate-800">{new Date(task.dueDate).toLocaleDateString()}</strong>
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {subtopicCode && (
                        <button
                          onClick={() => onNavigateToLessons(subtopicCode)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg cursor-pointer"
                        >
                          View Task
                        </button>
                      )}
                      <button
                        onClick={onNavigateToTasks}
                        className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg cursor-pointer"
                      >
                        View Checklist
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column (1 Col): Science Subjects & Quick Actions */}
        <div className="space-y-4">
          
          {/* Science Subjects Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
            <h2 className="text-base font-bold text-slate-800">
              Science Subjects
            </h2>
            <ul className="space-y-2 text-sm">
              <li 
                onClick={() => onNavigateToLessons('B1')}
                className="p-2.5 rounded-lg border border-slate-200 bg-[#FDFBF7] hover:bg-[#EBF3F5] transition cursor-pointer flex items-center justify-between"
              >
                <div>
                  <strong className="block text-slate-800">Biology</strong>
                  <span className="text-xs text-slate-600">Cells, Systems, Organisms</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-600" />
              </li>

              <li 
                onClick={() => onNavigateToLessons('C1')}
                className="p-2.5 rounded-lg border border-slate-200 bg-[#FDFBF7] hover:bg-[#EBF3F5] transition cursor-pointer flex items-center justify-between"
              >
                <div>
                  <strong className="block text-slate-800">Chemistry</strong>
                  <span className="text-xs text-slate-600">Atoms, Reactions, Stoichiometry</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-600" />
              </li>

              <li 
                onClick={() => onNavigateToLessons('P1')}
                className="p-2.5 rounded-lg border border-slate-200 bg-[#FDFBF7] hover:bg-[#EBF3F5] transition cursor-pointer flex items-center justify-between"
              >
                <div>
                  <strong className="block text-slate-800">Physics</strong>
                  <span className="text-xs text-slate-600">Forces, Energy, Electricity, Waves</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-600" />
              </li>
            </ul>
          </div>

          {/* Quick Study Checklist Bullet Points */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
            <h2 className="text-base font-bold text-slate-800">
              Revision Checklist
            </h2>
            <ul className="list-disc list-inside space-y-1.5 text-sm text-slate-700">
              <li>Review lesson slide definitions before quizzes</li>
              <li>Aim for at least 80% on 10-question checks</li>
              <li>Re-attempt red and amber subtopics</li>
              <li>Check due dates on assigned homework tasks</li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
};
