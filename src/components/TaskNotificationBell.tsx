import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  AlertTriangle, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  ArrowRight, 
  X,
  BookOpen,
  Award
} from 'lucide-react';
import { ClassTask, TaskWithSubmission, UserProfile, StudentProgress } from '../types';
import { fetchTasksForStudent, fetchClassTasks } from '../services/firestoreService';
import { db } from '../services/firebaseAuth';
import { collection, getDocs, query, where } from 'firebase/firestore';

interface RewardNotificationItem {
  id: string;
  title: string;
  message: string;
  createdAt: string;
}

interface TaskNotificationBellProps {
  user: UserProfile;
  progress?: StudentProgress;
  enrolledClassIds: string[];
  theme: 'dark' | 'light';
  onNavigateToTasks?: () => void;
  onNavigateToLessons?: (subtopicCode?: string, task?: ClassTask | TaskWithSubmission) => void;
  onNavigateToQuizzes?: (topicCode?: string, task?: ClassTask | TaskWithSubmission) => void;
}

export const TaskNotificationBell: React.FC<TaskNotificationBellProps> = ({
  user,
  progress,
  enrolledClassIds,
  theme,
  onNavigateToTasks,
  onNavigateToLessons,
  onNavigateToQuizzes
}) => {
  const [tasks, setTasks] = useState<TaskWithSubmission[]>([]);
  const [rewardNotifs, setRewardNotifs] = useState<RewardNotificationItem[]>([]);
  const [open, setOpen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const dismissedStorageKey = `igcse_dismissed_reward_notifs_${user.id}`;
  const getDismissedIds = (): Set<string> => {
    try {
      const raw = localStorage.getItem(dismissedStorageKey);
      return new Set(raw ? JSON.parse(raw) : []);
    } catch {
      return new Set();
    }
  };

  const dismissRewardNotif = (notifId: string) => {
    const next = getDismissedIds();
    next.add(notifId);
    try {
      localStorage.setItem(dismissedStorageKey, JSON.stringify(Array.from(next)));
    } catch {}
    setRewardNotifs(prev => prev.filter(n => n.id !== notifId));
  };

  useEffect(() => {
    let isMounted = true;
    async function check() {
      try {
        if (user.role === 'student') {
          const [studentTasks, rewardSnap] = await Promise.all([
            fetchTasksForStudent(user, enrolledClassIds, progress),
            getDocs(query(collection(db, 'notifications'), where('targetStudentIds', 'array-contains', user.id))).catch(() => null)
          ]);
          if (isMounted) setTasks(studentTasks);
          if (isMounted && rewardSnap) {
            const dismissed = getDismissedIds();
            const rewards: RewardNotificationItem[] = [];
            rewardSnap.forEach((docSnap) => {
              const d = docSnap.data();
              if (d?.type === 'instructor_reward' && !dismissed.has(docSnap.id)) {
                rewards.push({
                  id: docSnap.id,
                  title: d.title || 'Instructor Reward',
                  message: d.message || 'You received a reward!',
                  createdAt: d.createdAt || new Date().toISOString()
                });
              }
            });
            rewards.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setRewardNotifs(rewards.slice(0, 5));
          }
        } else {
          // Instructor
          const classTasks = await fetchClassTasks(undefined, user.id);
          const mapped: TaskWithSubmission[] = classTasks.map(t => ({
            ...t,
            isOverdue: t.status !== 'ended' && new Date(t.dueDate).getTime() < Date.now()
          }));
          if (isMounted) setTasks(mapped);
        }
      } catch (err) {
        // silent
      }
    }

    check();
    const interval = setInterval(check, 60000); // Check every minute
    const onSubUpdate = () => { check(); };
    if (typeof window !== 'undefined') {
      window.addEventListener('igcse_task_submission_updated', onSubUpdate);
      window.addEventListener('igcse_game_profile_updated', onSubUpdate);
    }
    return () => {
      isMounted = false;
      clearInterval(interval);
      if (typeof window !== 'undefined') {
        window.removeEventListener('igcse_task_submission_updated', onSubUpdate);
        window.removeEventListener('igcse_game_profile_updated', onSubUpdate);
      }
    };
  }, [user.id, user.role, enrolledClassIds.length, progress]);

  // Click outside to close
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const now = Date.now();
  const activeTasks = tasks.filter(t => t.status !== 'ended');
  const overdueTasks = activeTasks.filter(t => t.isOverdue && t.submission?.status !== 'completed');
  const pendingTasks = activeTasks.filter(t => t.submission?.status !== 'completed');
  const alertCount = user.role === 'student'
    ? (overdueTasks.length > 0 ? overdueTasks.length : pendingTasks.length) + rewardNotifs.length
    : activeTasks.length;
  const hasUrgent = overdueTasks.length > 0;

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen(prev => !prev)}
        title={hasUrgent ? `${overdueTasks.length} Overdue Assignments!` : `${pendingTasks.length} Pending Tasks`}
        className={`relative p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border font-semibold transition flex items-center gap-1.5 text-xs select-none ${
          hasUrgent
            ? 'bg-rose-950/60 border-rose-500/50 text-rose-300 hover:bg-rose-900/60 shadow-xs animate-pulse'
            : pendingTasks.length > 0
              ? theme === 'dark'
                ? 'bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-700'
                : 'bg-slate-100 border-slate-300 text-amber-700 hover:bg-slate-200'
              : theme === 'dark'
                ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                : 'bg-slate-100 border-slate-300 text-slate-700 hover:text-slate-900'
        }`}
      >
        <Bell className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Tasks</span>
        {alertCount > 0 && (
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
            hasUrgent 
              ? 'bg-rose-500 text-white' 
              : 'bg-emerald-500 text-slate-950'
          }`}>
            {alertCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {open && (
        <div className={`absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border p-4 shadow-2xl z-50 animate-in fade-in-50 zoom-in-95 duration-150 ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                {user.role === 'student' ? 'Assignments & Deadlines' : 'Active Class Tasks'}
              </h3>
            </div>
            <button onClick={() => setOpen(false)} className="p-1 hover:opacity-75">
              <X className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

          {/* Body */}
          <div className="py-3 max-h-80 overflow-y-auto space-y-2.5">
            {rewardNotifs.length > 0 && (
              <div className="space-y-2">
                {rewardNotifs.map(notif => (
                  <div key={notif.id} className="bg-emerald-950/50 border border-emerald-500/40 rounded-xl p-2.5 text-xs text-emerald-100 flex items-start justify-between gap-2">
                    <div className="space-y-0.5 min-w-0">
                      <div className="font-bold flex items-center gap-1.5 text-emerald-300">
                        <Award className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate">{notif.title}</span>
                      </div>
                      <p className="text-[11px] text-emerald-100/90 leading-snug">{notif.message}</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        dismissRewardNotif(notif.id);
                      }}
                      className="p-0.5 text-emerald-300 hover:text-white shrink-0"
                      title="Dismiss"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeTasks.length === 0 && rewardNotifs.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400 space-y-1">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="font-semibold text-slate-300">No active tasks right now</p>
                <p className="text-[11px]">You're all caught up on class assignments.</p>
              </div>
            ) : (
              <>
                {/* Overdue alert banner if any */}
                {overdueTasks.length > 0 && (
                  <div className="bg-rose-950/60 border border-rose-500/40 rounded-xl p-2.5 text-xs text-rose-200 space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-rose-300">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                      <span>{overdueTasks.length} Overdue Task{overdueTasks.length > 1 ? 's' : ''}!</span>
                    </div>
                    <p className="text-[11px] text-rose-300/80">
                      Please complete these assignments immediately to update your progress.
                    </p>
                  </div>
                )}

                {/* List items */}
                {activeTasks.slice(0, 4).map(task => {
                  const dueDateObj = new Date(task.dueDate);
                  const isDone = task.submission?.status === 'completed';
                  const isOver = task.isOverdue && !isDone;
                  const diffDays = Math.ceil((dueDateObj.getTime() - now) / (1000 * 60 * 60 * 24));

                  return (
                    <div
                      key={task.id}
                      onClick={() => {
                        setOpen(false);
                        if (task.type === 'both') {
                          if (onNavigateToTasks) onNavigateToTasks();
                          else if (onNavigateToLessons) onNavigateToLessons(task.targetSubtopics[0], task);
                        } else if (task.type === 'slides_traffic_light' && onNavigateToLessons) {
                          onNavigateToLessons(task.targetSubtopics[0], task);
                        } else if (task.type === 'practice_quiz' && onNavigateToQuizzes) {
                          onNavigateToQuizzes(task.targetSubtopics[0], task);
                        } else if (onNavigateToTasks) {
                          onNavigateToTasks();
                        }
                      }}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition space-y-1.5 ${
                        isDone 
                          ? 'bg-slate-950/50 border-slate-800/80 opacity-60 hover:opacity-100' 
                          : isOver 
                            ? 'bg-rose-950/30 border-rose-500/30 hover:border-rose-500/60' 
                            : 'bg-slate-800/60 border-slate-700/80 hover:border-emerald-500/50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          task.type === 'both'
                            ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                            : task.type === 'slides_traffic_light'
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                              : 'bg-sky-500/15 text-sky-400 border-sky-500/30'
                        }`}>
                          {task.type === 'both' ? 'Both: Slides & Quiz' :
                           task.type === 'slides_traffic_light' ? 'Slides & Traffic Light' : 'Practice Quiz'}
                        </span>

                        <span className={`text-[10px] font-bold ${
                          isDone 
                            ? 'text-emerald-400' 
                            : isOver 
                              ? 'text-rose-400 font-semibold' 
                              : diffDays <= 1 
                                ? 'text-amber-400' 
                                : 'text-slate-400'
                        }`}>
                          {isDone ? 'Completed' : isOver ? 'OVERDUE' : diffDays === 0 ? 'Due Today' : `Due in ${diffDays}d`}
                        </span>
                      </div>

                      <div className="font-semibold text-white line-clamp-1">
                        {task.title}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                        <span className="truncate">{task.className}</span>
                        <span className="text-emerald-400 font-medium flex items-center gap-0.5">
                          <span>Start</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>

          {/* Footer */}
          {onNavigateToTasks && (
            <div className="pt-2 border-t border-slate-800/80">
              <button
                onClick={() => {
                  setOpen(false);
                  onNavigateToTasks();
                }}
                className="w-full py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition text-center shadow-xs"
              >
                Open Full Homework & Tasks Dashboard
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
