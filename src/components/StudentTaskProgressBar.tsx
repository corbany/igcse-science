import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight, 
  Trophy, 
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

  if (totalTasks === 0 && enrolledClassCount === 0) {
    return (
      <aside aria-label="Class enrollment reminder" className="bg-[#EBF3F5] border-b border-slate-300 px-4 py-2 font-sans text-slate-800 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">Enrolled in 0 Classes:</span>
            <span className="text-slate-600 hidden sm:inline">Join your instructor's class code to receive live Cambridge assignments and track progress.</span>
          </div>
          <button
            onClick={onNavigateToTasks}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition flex items-center gap-1 cursor-pointer"
          >
            <span>Join Class</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside aria-label="Assigned class tasks progression" className="bg-[#EBF3F5] border-b border-slate-300 px-4 py-2 font-sans text-slate-800 shadow-xs">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
          
          {/* Left: Indicator & Headline */}
          <div className="flex items-center gap-2.5 min-w-0 shrink-0">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 bg-white border border-slate-300 text-slate-800">
              {isAllComplete ? <Trophy className="w-4 h-4 text-slate-800" /> : <ListTodo className="w-4 h-4 text-slate-800" />}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800 tracking-tight truncate">
                  Tasks Progression
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white text-slate-800 border border-slate-300">
                  {completedTasks}/{totalTasks} Completed ({percentage}%)
                </span>
              </div>
            </div>
          </div>

          {/* Center: Clean Non-Neon Progress Bar */}
          <div className="flex-1 max-w-md mx-2 min-w-[120px] w-full sm:w-auto">
            <div className="relative w-full h-2.5 bg-white rounded-full overflow-hidden border border-slate-300">
              <div
                className="h-full bg-slate-800 rounded-full transition-all duration-300"
                style={{ width: `${Math.max(percentage, totalTasks === 0 ? 100 : 4)}%` }}
              />
            </div>
          </div>

          {/* Right: Quick Actions & Expand Toggle */}
          <div className="flex items-center gap-2 shrink-0">
            {pendingTasks.length > 0 && (
              <button
                onClick={() => setIsExpanded(prev => !prev)}
                className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-xs font-semibold text-slate-700 transition flex items-center gap-1 cursor-pointer"
                title="Toggle quick task preview"
              >
                <span>{pendingTasks.length} Due</span>
                {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-700" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-700" />}
              </button>
            )}

            <button
              onClick={onNavigateToTasks}
              className="px-3.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>{isAllComplete ? 'Review Tasks' : 'View Tasks'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

        {/* Expandable Quick Dropdown Drawer in Soothing Pastel Card */}
        {isExpanded && pendingTasks.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-300 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {pendingTasks.slice(0, 6).map(task => {
              const isOverdue = task.dueDate && new Date(task.dueDate).getTime() < Date.now();
              return (
                <div
                  key={task.id}
                  onClick={onNavigateToTasks}
                  className="p-2.5 rounded-lg bg-white border border-slate-300 hover:border-slate-500 transition flex items-start justify-between gap-2 cursor-pointer shadow-xs"
                >
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#EBF3F5] text-slate-800 border border-slate-300">
                        {task.type || 'Assignment'}
                      </span>
                      {task.targetSubtopics?.[0] && (
                        <span className="text-[10px] text-slate-600 font-semibold">
                          {task.targetSubtopics[0]}
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-bold text-slate-800 truncate">
                      {task.title}
                    </div>
                  </div>

                  {task.dueDate && (
                    <span className={`text-[10px] font-semibold shrink-0 px-1.5 py-0.5 rounded border ${
                      isOverdue ? 'bg-rose-50 text-rose-800 border-rose-300' : 'bg-[#FDFBF7] text-slate-700 border-slate-300'
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
