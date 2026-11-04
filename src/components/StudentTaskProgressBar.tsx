import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  ArrowRight, 
  Trophy, 
  AlertCircle,
  FileText,
  ListTodo
} from 'lucide-react';
import { TaskWithSubmission } from '../types';

interface StudentTaskProgressBarProps {
  tasks: TaskWithSubmission[];
  onNavigateToTasks: () => void;
  enrolledClassCount?: number;
}

export const StudentTaskProgressBar: React.FC<StudentTaskProgressBarProps> = ({
  tasks,
  onNavigateToTasks,
  enrolledClassCount = 0
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.submission?.status === 'completed').length;
  const pendingTasks = tasks.filter(t => t.submission?.status !== 'completed');
  const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const isAllComplete = totalTasks > 0 && completedTasks === totalTasks;

  // If no enrolled classes and no tasks, show a subtle prompt
  if (totalTasks === 0 && enrolledClassCount === 0) {
    return (
      <aside aria-label="Class enrollment reminder" className="sticky top-0 z-35 bg-slate-900/95 border-b border-slate-800 backdrop-blur-md px-3 py-1.5 transition-all shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs gap-3">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span className="font-semibold text-slate-200">Enrolled in 0 Classes:</span>
            <span className="text-slate-400 hidden sm:inline">Join your instructor's class code to receive live Cambridge assignments and track progress.</span>
          </div>
          <button
            onClick={onNavigateToTasks}
            className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
          >
            <span>Join Class</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside aria-label="Assigned class tasks progression" className="sticky top-0 z-35 bg-slate-950/95 border-b border-slate-800/90 shadow-md backdrop-blur-md transition-all duration-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2">
        <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
          
          {/* Left: Indicator & Headline */}
          <div className="flex items-center gap-2.5 min-w-0 shrink-0">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
              isAllComplete
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-xs'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
            }`}>
              {isAllComplete ? <Trophy className="w-4 h-4 text-amber-400" /> : <ListTodo className="w-4 h-4 text-emerald-400" />}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-white tracking-tight truncate">
                  Tasks Progression
                </span>
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full border ${
                  isAllComplete
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : percentage >= 50
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}>
                  {completedTasks}/{totalTasks} Done ({percentage}%)
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block truncate">
                {isAllComplete
                  ? 'Great job! All current class assignments are completed.'
                  : `${pendingTasks.length} task${pendingTasks.length !== 1 ? 's' : ''} remaining for your enrolled classes.`}
              </p>
            </div>
          </div>

          {/* Center: Dynamic Animated Glowing Progress Bar */}
          <div className="flex-1 max-w-md mx-2 min-w-[120px] w-full sm:w-auto">
            <div className="relative w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  isAllComplete
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-300 shadow-[0_0_12px_rgba(251,191,36,0.6)]'
                    : 'bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                }`}
                style={{ width: `${Math.max(percentage, totalTasks === 0 ? 100 : 4)}%` }}
              />
            </div>
          </div>

          {/* Right: Quick Actions & Expand Toggle */}
          <div className="flex items-center gap-2 shrink-0">
            {pendingTasks.length > 0 && (
              <button
                onClick={() => setIsExpanded(prev => !prev)}
                className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] font-semibold text-slate-300 transition flex items-center gap-1 cursor-pointer"
                title="Toggle quick task preview"
              >
                <span>{pendingTasks.length} Due</span>
                {isExpanded ? <ChevronUp className="w-3 h-3 text-slate-400" /> : <ChevronDown className="w-3 h-3 text-slate-400" />}
              </button>
            )}

            <button
              onClick={onNavigateToTasks}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 ${
                isAllComplete
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-500/20'
              }`}
            >
              <span>{isAllComplete ? 'Review Tasks' : 'Open Tasks'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

        {/* Expandable Quick Dropdown Drawer (Shows Pending Tasks preview directly without leaving page) */}
        {isExpanded && pendingTasks.length > 0 && (
          <div className="mt-2.5 pt-2.5 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 animate-in fade-in slide-in-from-top-1 duration-150">
            {pendingTasks.slice(0, 6).map(task => {
              const isOverdue = task.dueDate && new Date(task.dueDate).getTime() < Date.now();
              return (
                <div
                  key={task.id}
                  onClick={onNavigateToTasks}
                  className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition flex items-start justify-between gap-2 cursor-pointer group"
                >
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded font-mono ${
                        task.type === 'practice_quiz' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {task.type}
                      </span>
                      {task.targetSubtopics?.[0] && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          {task.targetSubtopics[0]}
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-bold text-white truncate group-hover:text-emerald-300 transition">
                      {task.title}
                    </div>
                    {task.className && (
                      <div className="text-[10px] text-slate-500 truncate">
                        {task.className}
                      </div>
                    )}
                  </div>

                  {task.dueDate && (
                    <span className={`text-[10px] font-mono shrink-0 px-1.5 py-0.5 rounded ${
                      isOverdue ? 'bg-rose-950/60 text-rose-300 border border-rose-500/30' : 'text-slate-400'
                    }`}>
                      {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>
    </aside>
  );
};
