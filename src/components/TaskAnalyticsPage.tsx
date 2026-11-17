import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  BookOpen,
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  CircleDashed,
  FileDown,
  Filter,
  Layers,
  RefreshCw,
  RotateCcw,
  Search,
  Users,
  X
} from 'lucide-react';
import {
  ClassTask,
  StudentProgress,
  TaskSubmission,
  UserProfile
} from '../types';
import {
  ClassItem,
  ClassStudentItem,
  evaluateTaskProgressForStudent,
  fetchTaskSubmissions,
  reconcileTaskSubmission,
  subscribeToClassStudents,
  subscribeToClassTasks
} from '../services/firestoreService';

export type TaskAnalyticsCellStatus = 'completed' | 'in_progress' | 'not_started' | 'not_assigned';

export interface ReconciledCellData {
  status: TaskAnalyticsCellStatus;
  submission?: TaskSubmission;
  isOverdue: boolean;
}

interface TaskAnalyticsPageProps {
  currentUser: UserProfile;
  classes: ClassItem[];
  selectedClassId?: string;
  onSelectClassId?: (classId: string) => void;
  onNavigateToTasks?: () => void;
}

interface SelectedCellModalState {
  student: ClassStudentItem;
  task: ClassTask;
  cell: ReconciledCellData;
}

function buildStudentProgressSnapshot(stu: ClassStudentItem): StudentProgress | null {
  if (
    !stu.slidesReadBySubtopic &&
    !stu.subtopicQuizScores &&
    !stu.practiceQuizByLength &&
    !stu.quizScores &&
    !stu.trafficLights &&
    !stu.completedLessons
  ) {
    return null;
  }

  return {
    completedLessons: stu.completedLessons || [],
    slidesReadBySubtopic: stu.slidesReadBySubtopic || {},
    quizScores: stu.quizScores || {},
    practiceQuizByLength: stu.practiceQuizByLength || {},
    subtopicQuizScores: stu.subtopicQuizScores || {},
    topicConfidence: stu.topicConfidence || {},
    trafficLights: stu.trafficLights || {},
    savedNotes: {},
    currentStreak: stu.streakDays || 0,
    lastActive: stu.lastActive || new Date().toISOString()
  };
}

function isStudentAssignedToTask(task: ClassTask, student: ClassStudentItem): boolean {
  if (!Array.isArray(task.targetStudentIds) || task.targetStudentIds.length === 0) {
    return true;
  }
  const cleanEmail = (student.email || '').trim().toLowerCase();
  return (
    task.targetStudentIds.includes(student.studentId) ||
    (Boolean(cleanEmail) && task.targetStudentIds.some(id => id.trim().toLowerCase() === cleanEmail))
  );
}

function formatShortDate(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export const TaskAnalyticsPage: React.FC<TaskAnalyticsPageProps> = ({
  currentUser,
  classes,
  selectedClassId,
  onSelectClassId,
  onNavigateToTasks
}) => {
  const [activeClassId, setActiveClassId] = useState<string>(() => selectedClassId || classes[0]?.id || '');

  useEffect(() => {
    if (selectedClassId && classes.some(c => c.id === selectedClassId)) {
      setActiveClassId(selectedClassId);
    } else if ((!activeClassId || !classes.some(c => c.id === activeClassId)) && classes.length > 0) {
      setActiveClassId(classes[0].id);
    }
  }, [selectedClassId, classes, activeClassId]);

  const activeClass = useMemo(
    () => classes.find(c => c.id === activeClassId) || classes[0] || null,
    [classes, activeClassId]
  );

  const handleClassChange = (nextId: string) => {
    setActiveClassId(nextId);
    if (onSelectClassId) {
      onSelectClassId(nextId);
    }
    setSortConfig({ column: null, direction: 'asc' });
    setTaskStatusFilters({});
  };

  // Live class students & tasks
  const [students, setStudents] = useState<ClassStudentItem[]>([]);
  const [tasks, setTasks] = useState<ClassTask[]>([]);
  const [submissionsByTask, setSubmissionsByTask] = useState<Record<string, Record<string, TaskSubmission>>>({});
  const [loadingRoster, setLoadingRoster] = useState<boolean>(false);
  const [loadingTasks, setLoadingTasks] = useState<boolean>(false);
  const [loadingSubmissions, setLoadingSubmissions] = useState<boolean>(false);
  const [refreshNonce, setRefreshNonce] = useState<number>(0);

  // Filters & sorting state
  const [studentSearch, setStudentSearch] = useState<string>('');
  const [overallFilter, setOverallFilter] = useState<'all' | 'complete' | 'in_progress' | 'not_started'>('all');
  const [taskSearch, setTaskSearch] = useState<string>('');
  const [taskDueFilter, setTaskDueFilter] = useState<'all' | 'active' | 'overdue'>('all');
  const [taskColumnOrder, setTaskColumnOrder] = useState<'newest' | 'due_asc' | 'completion_desc' | 'completion_asc'>('newest');
  const [taskStatusFilters, setTaskStatusFilters] = useState<Record<string, 'all' | 'completed' | 'in_progress' | 'not_started'>>({});

  // Student row sort state: column is 'student', 'overall', or a specific `taskId`
  const [sortConfig, setSortConfig] = useState<{
    column: string | null;
    direction: 'asc' | 'desc';
  }>({ column: null, direction: 'asc' });

  // Cell drilldown modal
  const [selectedCellModal, setSelectedCellModal] = useState<SelectedCellModalState | null>(null);

  // Subscribe to students in the active class
  useEffect(() => {
    if (!activeClass?.id) {
      setStudents([]);
      return;
    }
    setLoadingRoster(true);
    const unsub = subscribeToClassStudents(activeClass.id, (liveStudents) => {
      setStudents(liveStudents);
      setLoadingRoster(false);
    });
    return () => unsub();
  }, [activeClass?.id, refreshNonce]);

  // Subscribe to tasks assigned to the active class
  useEffect(() => {
    if (!activeClass?.id) {
      setTasks([]);
      return;
    }
    setLoadingTasks(true);
    const userClassIds = classes.map(c => c.id);
    const unsub = subscribeToClassTasks(
      activeClass.id,
      currentUser.id,
      (liveTasks) => {
        setTasks(liveTasks);
        setLoadingTasks(false);
      },
      userClassIds
    );
    return () => unsub();
  }, [activeClass?.id, currentUser.id, classes, refreshNonce]);

  // Fetch submissions for all tasks in this class whenever task list or refreshNonce changes
  const loadAllTaskSubmissions = useCallback(async () => {
    if (!activeClass?.id || tasks.length === 0) {
      setSubmissionsByTask({});
      return;
    }
    setLoadingSubmissions(true);
    try {
      const entries = await Promise.all(
        tasks.map(async (task) => {
          const subs = await fetchTaskSubmissions(task.id, activeClass.id, task);
          const map: Record<string, TaskSubmission> = {};
          subs.forEach((s) => {
            if (s && s.studentId) {
              map[s.studentId] = s;
            }
          });
          return [task.id, map] as const;
        })
      );
      const next: Record<string, Record<string, TaskSubmission>> = {};
      entries.forEach(([taskId, map]) => {
        next[taskId] = map;
      });
      setSubmissionsByTask(next);
    } catch (err) {
      console.warn('Error loading submissions for Task Analytics:', err);
    } finally {
      setLoadingSubmissions(false);
    }
  }, [activeClass?.id, tasks]);

  useEffect(() => {
    loadAllTaskSubmissions();
  }, [loadAllTaskSubmissions, refreshNonce]);

  // Also re-sync when a submission updates anywhere in window
  useEffect(() => {
    const onSubUpdate = () => {
      loadAllTaskSubmissions();
    };
    window.addEventListener('igcse_task_submission_updated', onSubUpdate);
    return () => window.removeEventListener('igcse_task_submission_updated', onSubUpdate);
  }, [loadAllTaskSubmissions]);

  const nowTs = Date.now();

  // Build reconciled cell matrix: studentId -> taskId -> ReconciledCellData
  const cellMatrix = useMemo(() => {
    const matrix: Record<string, Record<string, ReconciledCellData>> = {};

    for (const student of students) {
      const row: Record<string, ReconciledCellData> = {};
      const progressSnap = buildStudentProgressSnapshot(student);
      const profileStub: UserProfile = {
        id: student.studentId,
        name: student.name,
        email: student.email,
        role: 'student',
        tier: student.tier
      };

      for (const task of tasks) {
        const assigned = isStudentAssignedToTask(task, student);
        const dueTs = new Date(task.dueDate).getTime();
        const taskPastDue = !Number.isNaN(dueTs) && dueTs < nowTs;

        if (!assigned) {
          row[task.id] = {
            status: 'not_assigned',
            isOverdue: false
          };
          continue;
        }

        const existingSub = submissionsByTask[task.id]?.[student.studentId];
        let effectiveSub: TaskSubmission | undefined = existingSub;

        if (progressSnap) {
          const evaluated = evaluateTaskProgressForStudent(task, profileStub, progressSnap, existingSub);
          effectiveSub = reconcileTaskSubmission(evaluated, existingSub);
        }

        const rawStatus = effectiveSub?.status || 'not_started';
        const status: TaskAnalyticsCellStatus =
          rawStatus === 'completed'
            ? 'completed'
            : rawStatus === 'incomplete'
              ? 'in_progress'
              : 'not_started';

        row[task.id] = {
          status,
          submission: effectiveSub,
          isOverdue: taskPastDue && status !== 'completed'
        };
      }

      matrix[student.studentId] = row;
    }

    return matrix;
  }, [students, tasks, submissionsByTask, nowTs]);

  // Per-task summary metrics across enrolled students
  const taskStatsById = useMemo(() => {
    const map: Record<
      string,
      {
        assignedCount: number;
        completedCount: number;
        inProgressCount: number;
        notStartedCount: number;
        completionPct: number;
      }
    > = {};

    for (const task of tasks) {
      let assignedCount = 0;
      let completedCount = 0;
      let inProgressCount = 0;
      let notStartedCount = 0;

      for (const stu of students) {
        const cell = cellMatrix[stu.studentId]?.[task.id];
        if (!cell || cell.status === 'not_assigned') continue;
        assignedCount += 1;
        if (cell.status === 'completed') completedCount += 1;
        else if (cell.status === 'in_progress') inProgressCount += 1;
        else notStartedCount += 1;
      }

      map[task.id] = {
        assignedCount,
        completedCount,
        inProgressCount,
        notStartedCount,
        completionPct: assignedCount > 0 ? Math.round((completedCount / assignedCount) * 100) : 0
      };
    }

    return map;
  }, [tasks, students, cellMatrix]);

  // Filter & sort task columns
  const visibleTasks = useMemo(() => {
    const q = taskSearch.trim().toLowerCase();
    const filtered = tasks.filter((task) => {
      const dueTs = new Date(task.dueDate).getTime();
      const isOverdue = !Number.isNaN(dueTs) && dueTs < nowTs;
      if (taskDueFilter === 'active' && isOverdue) return false;
      if (taskDueFilter === 'overdue' && !isOverdue) return false;

      if (q) {
        const matchTitle = (task.title || '').toLowerCase().includes(q);
        const matchSub = (task.targetSubtopics || []).some(s => s.toLowerCase().includes(q));
        if (!matchTitle && !matchSub) return false;
      }
      return true;
    });

    return [...filtered].sort((a, b) => {
      if (taskColumnOrder === 'due_asc') {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (taskColumnOrder === 'completion_desc') {
        return (taskStatsById[b.id]?.completionPct ?? 0) - (taskStatsById[a.id]?.completionPct ?? 0);
      }
      if (taskColumnOrder === 'completion_asc') {
        return (taskStatsById[a.id]?.completionPct ?? 0) - (taskStatsById[b.id]?.completionPct ?? 0);
      }
      // newest first (default)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [tasks, taskSearch, taskDueFilter, taskColumnOrder, taskStatsById, nowTs]);

  // Student overall completion metrics across visibleTasks (or all class tasks)
  const studentSummaryById = useMemo(() => {
    const summary: Record<
      string,
      {
        assigned: number;
        completed: number;
        inProgress: number;
        notStarted: number;
        completionPct: number;
      }
    > = {};

    for (const stu of students) {
      let assigned = 0;
      let completed = 0;
      let inProgress = 0;
      let notStarted = 0;

      for (const task of visibleTasks) {
        const cell = cellMatrix[stu.studentId]?.[task.id];
        if (!cell || cell.status === 'not_assigned') continue;
        assigned += 1;
        if (cell.status === 'completed') completed += 1;
        else if (cell.status === 'in_progress') inProgress += 1;
        else notStarted += 1;
      }

      summary[stu.studentId] = {
        assigned,
        completed,
        inProgress,
        notStarted,
        completionPct: assigned > 0 ? Math.round((completed / assigned) * 100) : 0
      };
    }

    return summary;
  }, [students, visibleTasks, cellMatrix]);

  // Overall KPI metrics across the matrix (for visibleTasks & all students in class)
  const overallKPIs = useMemo(() => {
    let totalAssigned = 0;
    let totalCompleted = 0;
    let totalInProgress = 0;
    let totalNotStarted = 0;

    for (const stu of students) {
      const s = studentSummaryById[stu.studentId];
      if (!s) continue;
      totalAssigned += s.assigned;
      totalCompleted += s.completed;
      totalInProgress += s.inProgress;
      totalNotStarted += s.notStarted;
    }

    return {
      totalAssigned,
      totalCompleted,
      totalInProgress,
      totalNotStarted,
      overallCompletionPct: totalAssigned > 0 ? Math.round((totalCompleted / totalAssigned) * 100) : 0
    };
  }, [students, studentSummaryById]);

  // Filtered and sorted student rows
  const displayedStudents = useMemo(() => {
    const q = studentSearch.trim().toLowerCase();

    const filtered = students.filter((stu) => {
      if (q) {
        const nameMatch = (stu.name || '').toLowerCase().includes(q);
        const emailMatch = (stu.email || '').toLowerCase().includes(q);
        if (!nameMatch && !emailMatch) return false;
      }

      const sum = studentSummaryById[stu.studentId];
      if (overallFilter !== 'all' && sum) {
        if (overallFilter === 'complete' && (sum.assigned === 0 || sum.completed !== sum.assigned)) {
          return false;
        }
        if (
          overallFilter === 'in_progress' &&
          !(sum.inProgress > 0 || (sum.completed > 0 && sum.completed < sum.assigned))
        ) {
          return false;
        }
        if (overallFilter === 'not_started' && (sum.completed > 0 || sum.inProgress > 0)) {
          return false;
        }
      }

      // Per-task status filters
      for (const [taskId, filterVal] of Object.entries(taskStatusFilters)) {
        if (!filterVal || filterVal === 'all') continue;
        if (!visibleTasks.some(t => t.id === taskId)) continue;
        const cellStatus = cellMatrix[stu.studentId]?.[taskId]?.status;
        if (cellStatus !== filterVal) return false;
      }

      return true;
    });

    if (!sortConfig.column) {
      return [...filtered].sort((a, b) =>
        (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' })
      );
    }

    const dir = sortConfig.direction === 'asc' ? 1 : -1;
    const statusWeight: Record<TaskAnalyticsCellStatus, number> = {
      completed: 3,
      in_progress: 2,
      not_started: 1,
      not_assigned: 0
    };

    return [...filtered].sort((a, b) => {
      if (sortConfig.column === 'student') {
        return dir * (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' });
      }
      if (sortConfig.column === 'overall') {
        const pctA = studentSummaryById[a.studentId]?.completionPct ?? 0;
        const pctB = studentSummaryById[b.studentId]?.completionPct ?? 0;
        if (pctA !== pctB) return dir * (pctA - pctB);
        return (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' });
      }

      // Sort by specific task column
      const taskId = sortConfig.column!;
      const cellA = cellMatrix[a.studentId]?.[taskId];
      const cellB = cellMatrix[b.studentId]?.[taskId];
      const wA = statusWeight[cellA?.status || 'not_assigned'];
      const wB = statusWeight[cellB?.status || 'not_assigned'];
      if (wA !== wB) return dir * (wA - wB);

      const scoreA = cellA?.submission?.practiceQuizScore ?? cellA?.submission?.quizScore ?? -1;
      const scoreB = cellB?.submission?.practiceQuizScore ?? cellB?.submission?.quizScore ?? -1;
      if (scoreA !== scoreB) return dir * (scoreA - scoreB);

      return (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' });
    });
  }, [students, studentSearch, overallFilter, taskStatusFilters, visibleTasks, cellMatrix, studentSummaryById, sortConfig]);

  const toggleSort = (column: string) => {
    setSortConfig((prev) => {
      if (prev.column === column) {
        if (column === 'student') {
          return prev.direction === 'asc'
            ? { column, direction: 'desc' }
            : { column: null, direction: 'asc' };
        }
        // For numeric/status columns: default to desc (High->Low / Completed first) first, then asc, then clear
        return prev.direction === 'desc'
          ? { column, direction: 'asc' }
          : { column: null, direction: 'asc' };
      }
      return { column, direction: column === 'student' ? 'asc' : 'desc' };
    });
  };

  const setColumnOrderSelect = (column: string, value: string) => {
    if (value === 'default') {
      setSortConfig({ column: null, direction: 'asc' });
    } else {
      setSortConfig({ column, direction: value as 'asc' | 'desc' });
    }
  };

  const hasActiveFiltersOrSort =
    studentSearch.trim() !== '' ||
    overallFilter !== 'all' ||
    taskSearch.trim() !== '' ||
    taskDueFilter !== 'all' ||
    taskColumnOrder !== 'newest' ||
    sortConfig.column !== null ||
    Object.values(taskStatusFilters).some(v => v && v !== 'all');

  const resetAllFiltersAndOrder = () => {
    setStudentSearch('');
    setOverallFilter('all');
    setTaskSearch('');
    setTaskDueFilter('all');
    setTaskColumnOrder('newest');
    setTaskStatusFilters({});
    setSortConfig({ column: null, direction: 'asc' });
  };

  const handleExportCSV = () => {
    if (!activeClass || displayedStudents.length === 0) return;

    const escapeCsv = (val: string) => `"${(val || '').replace(/"/g, '""')}"`;
    const headers = [
      'Student Name',
      'Student Email',
      'Tier',
      'Completed Tasks',
      'Assigned Tasks',
      'Completion %',
      ...visibleTasks.map(t => `${t.title} (${(t.targetSubtopics || []).join('/') || 'General'})`)
    ];

    const rows = displayedStudents.map((stu) => {
      const sum = studentSummaryById[stu.studentId] || { completed: 0, assigned: 0, completionPct: 0 };
      const taskCols = visibleTasks.map((task) => {
        const cell = cellMatrix[stu.studentId]?.[task.id];
        if (!cell || cell.status === 'not_assigned') return 'Not Assigned';
        const statusLabel =
          cell.status === 'completed'
            ? 'Completed'
            : cell.status === 'in_progress'
              ? 'In Progress'
              : 'Not Started';
        const score = cell.submission?.practiceQuizScore ?? cell.submission?.quizScore;
        return score !== undefined ? `${statusLabel} (${score}%)` : statusLabel;
      });
      return [
        stu.name || '',
        stu.email || '',
        stu.tier || 'Core',
        String(sum.completed),
        String(sum.assigned),
        `${sum.completionPct}%`,
        ...taskCols
      ];
    });

    const csvContent =
      headers.map(escapeCsv).join(',') +
      '\n' +
      rows.map(r => r.map(escapeCsv).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${activeClass.name.replace(/\s+/g, '_')}_Task_Analytics.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const isLoadingAny = loadingRoster || loadingTasks || loadingSubmissions;

  return (
    <div className="space-y-6">
      {/* Header & Class / Filter Toolbar */}
      <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span>Teaching Hub</span>
              <span aria-hidden="true">/</span>
              <span>Task Completion Matrix</span>
              {activeClass && (
                <>
                  <span aria-hidden="true">/</span>
                  <span className="font-mono tabular-nums text-slate-700 dark:text-slate-300">{activeClass.classCode}</span>
                </>
              )}
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5 tracking-tight">
              <ClipboardCheck className="w-5 h-5 text-slate-800 dark:text-slate-200 shrink-0" />
              <span>Class Task Completion Analytics</span>
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl">
              Track every student’s status across all assigned tasks in a single matrix view. Each column shows one task and whether each student is Completed, In Progress, or Not Started.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => setRefreshNonce(n => n + 1)}
              disabled={isLoadingAny}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-black hover:bg-slate-50 dark:hover:bg-zinc-900 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-zinc-700 text-xs font-bold flex items-center gap-1.5 transition whitespace-nowrap shrink-0 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAny ? 'animate-spin' : ''}`} />
              <span>Refresh Data</span>
            </button>

            {displayedStudents.length > 0 && visibleTasks.length > 0 && (
              <button
                type="button"
                onClick={handleExportCSV}
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-black hover:bg-slate-50 dark:hover:bg-zinc-900 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-zinc-700 text-xs font-bold flex items-center gap-1.5 transition whitespace-nowrap shrink-0 cursor-pointer"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            )}

            {onNavigateToTasks && (
              <button
                type="button"
                onClick={onNavigateToTasks}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-black dark:hover:bg-slate-200 border border-slate-900 dark:border-white text-xs font-bold flex items-center gap-1.5 transition whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Manage &amp; Set Tasks</span>
              </button>
            )}
          </div>
        </div>

        {/* Class & Task Controls Row */}
        <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Class selector */}
          <div className="space-y-1">
            <label className="block font-semibold text-slate-700 dark:text-slate-300">
              Select Class
            </label>
            <select
              value={activeClass?.id || ''}
              onChange={e => handleClassChange(e.target.value)}
              disabled={classes.length === 0}
              className="table-filter-control w-full px-2 py-0.5 text-xs rounded-md bg-[#FDFBF7] dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              {classes.length === 0 ? (
                <option value="">No classes available</option>
              ) : (
                classes.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.classCode})
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Search tasks */}
          <div className="space-y-1">
            <label className="block font-semibold text-slate-700 dark:text-slate-300">
              Filter Task Columns
            </label>
            <div className="relative">
              <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={taskSearch}
                onChange={e => setTaskSearch(e.target.value)}
                placeholder="Search task title or subtopic..."
                className="table-filter-control has-left-icon w-full pl-7 pr-2 py-0.5 text-xs rounded-md bg-[#FDFBF7] dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>
          </div>

          {/* Deadline filter */}
          <div className="space-y-1">
            <label className="block font-semibold text-slate-700 dark:text-slate-300">
              Task Deadline Scope
            </label>
            <select
              value={taskDueFilter}
              onChange={e => setTaskDueFilter(e.target.value as any)}
              className="table-filter-control w-full px-2 py-0.5 text-xs rounded-md bg-[#FDFBF7] dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              <option value="all">All Assigned Tasks ({tasks.length})</option>
              <option value="active">Active / Upcoming Only</option>
              <option value="overdue">Past Due Only</option>
            </select>
          </div>

          {/* Task Column Ordering */}
          <div className="space-y-1">
            <label className="block font-semibold text-slate-700 dark:text-slate-300">
              Order Task Columns By
            </label>
            <select
              value={taskColumnOrder}
              onChange={e => setTaskColumnOrder(e.target.value as any)}
              className="table-filter-control w-full px-2 py-0.5 text-xs rounded-md bg-[#FDFBF7] dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              <option value="newest">Newest Assigned First</option>
              <option value="due_asc">Due Date (Soonest First)</option>
              <option value="completion_desc">Class Completion % (High → Low)</option>
              <option value="completion_asc">Class Completion % (Low → High)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Empty States: No Classes */}
      {classes.length === 0 ? (
        <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center space-y-3">
          <Users className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No Classes Found</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            Create a class in the My Classes tab first, then assign tasks to monitor class-wide completion here.
          </p>
        </div>
      ) : (
        <>
          {/* 4-Column KPI Summary Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 space-y-1">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Enrolled Students
              </div>
              <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                {students.length}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                {activeClass?.name || 'Selected class'}
              </div>
            </div>

            <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 space-y-1">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Tasks Shown
              </div>
              <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                {visibleTasks.length}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                of {tasks.length} class task{tasks.length === 1 ? '' : 's'}
              </div>
            </div>

            <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 space-y-1">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Overall Completion Rate
              </div>
              <div className="text-2xl font-bold font-mono tabular-nums text-emerald-700 dark:text-emerald-400">
                {overallKPIs.overallCompletionPct}%
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                {overallKPIs.totalCompleted} of {overallKPIs.totalAssigned} assigned submissions completed
              </div>
            </div>

            <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 space-y-1.5">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Status Breakdown
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold tabular-nums flex-wrap">
                <span className="text-emerald-700 dark:text-emerald-400">
                  {overallKPIs.totalCompleted} Completed
                </span>
                <span aria-hidden="true" className="text-slate-300 dark:text-zinc-700">·</span>
                <span className="text-amber-700 dark:text-amber-400">
                  {overallKPIs.totalInProgress} In Progress
                </span>
                <span aria-hidden="true" className="text-slate-300 dark:text-zinc-700">·</span>
                <span className="text-slate-600 dark:text-slate-400">
                  {overallKPIs.totalNotStarted} Not Started
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden flex border border-slate-200 dark:border-zinc-700">
                {overallKPIs.totalAssigned > 0 && (
                  <>
                    <div
                      className="bg-emerald-600 dark:bg-emerald-500 transition-all"
                      style={{ width: `${(overallKPIs.totalCompleted / overallKPIs.totalAssigned) * 100}%` }}
                    />
                    <div
                      className="bg-amber-500 transition-all"
                      style={{ width: `${(overallKPIs.totalInProgress / overallKPIs.totalAssigned) * 100}%` }}
                    />
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Matrix Container */}
          <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 space-y-4">
            {/* Sub-toolbar: Counts & Reset */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-slate-600 dark:text-slate-400 font-medium tabular-nums">
                  Showing <strong className="text-slate-900 dark:text-white">{displayedStudents.length}</strong> of{' '}
                  <strong className="text-slate-900 dark:text-white">{students.length}</strong> student{students.length === 1 ? '' : 's'}
                </span>
                {sortConfig.column && (
                  <span className="text-slate-500 dark:text-slate-400">
                    Ordered by{' '}
                    <strong className="text-slate-800 dark:text-slate-200">
                      {sortConfig.column === 'student'
                        ? 'Student Name'
                        : sortConfig.column === 'overall'
                          ? 'Overall Completion %'
                          : tasks.find(t => t.id === sortConfig.column)?.title || 'Task'}
                    </strong>{' '}
                    (
                    {sortConfig.column === 'student'
                      ? sortConfig.direction === 'asc' ? 'A → Z' : 'Z → A'
                      : sortConfig.column === 'overall'
                        ? sortConfig.direction === 'desc' ? 'High → Low' : 'Low → High'
                        : sortConfig.direction === 'desc' ? 'Completed First' : 'Not Started First'}
                    )
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                {/* Legend */}
                <div className="flex items-center gap-3 text-[11px] font-semibold">
                  <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Completed</span>
                  </span>
                  <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>In Progress</span>
                  </span>
                  <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-400">
                    <CircleDashed className="w-3.5 h-3.5" />
                    <span>Not Started</span>
                  </span>
                </div>

                {hasActiveFiltersOrSort && (
                  <button
                    type="button"
                    onClick={resetAllFiltersAndOrder}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#FDFBF7] dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-zinc-700 text-[11px] font-bold transition cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset Filters &amp; Order</span>
                  </button>
                )}
              </div>
            </div>

            {/* Loading Skeleton */}
            {isLoadingAny && students.length === 0 ? (
              <div className="space-y-2 py-4">
                {[1, 2, 3, 4, 5].map(rowIdx => (
                  <div
                    key={rowIdx}
                    className="h-11 rounded-xl bg-slate-100 dark:bg-zinc-900 animate-pulse border border-slate-200 dark:border-zinc-800"
                  />
                ))}
              </div>
            ) : students.length === 0 ? (
              <div className="p-10 text-center bg-[#FDFBF7] dark:bg-zinc-900/50 border border-dashed border-slate-300 dark:border-zinc-800 rounded-2xl space-y-2">
                <Users className="w-10 h-10 text-slate-400 mx-auto" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Students Enrolled Yet</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                  Share Class Code{' '}
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {activeClass?.classCode || '—'}
                  </span>{' '}
                  with students in <strong className="text-slate-900 dark:text-white">{activeClass?.name}</strong> so their task progress appears in this matrix.
                </p>
              </div>
            ) : tasks.length === 0 ? (
              <div className="p-10 text-center bg-[#FDFBF7] dark:bg-zinc-900/50 border border-dashed border-slate-300 dark:border-zinc-800 rounded-2xl space-y-3">
                <Calendar className="w-10 h-10 text-slate-400 mx-auto" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Tasks Assigned to This Class</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                  Once you set homework or practice quiz tasks for <strong className="text-slate-900 dark:text-white">{activeClass?.name}</strong>, each task will appear here as a column tracking student completion.
                </p>
                {onNavigateToTasks && (
                  <button
                    type="button"
                    onClick={onNavigateToTasks}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-black dark:hover:bg-slate-200 text-xs font-bold transition cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Set First Class Task</span>
                  </button>
                )}
              </div>
            ) : visibleTasks.length === 0 ? (
              <div className="p-10 text-center bg-[#FDFBF7] dark:bg-zinc-900/50 border border-dashed border-slate-300 dark:border-zinc-800 rounded-2xl space-y-2">
                <Filter className="w-9 h-9 text-slate-400 mx-auto" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Tasks Match Current Filter</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Adjust the task search or deadline scope above to show task columns.
                </p>
                <button
                  type="button"
                  onClick={resetAllFiltersAndOrder}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-black text-xs font-bold transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Show All Tasks</span>
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-zinc-800">
                <table className="min-w-full text-xs text-left border-collapse">
                  <thead className="bg-[#FDFBF7] dark:bg-zinc-900 text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-zinc-800">
                    {/* Primary Header Row */}
                    <tr className="align-top">
                      {/* Sticky Student Column Header */}
                      <th className="sticky left-0 z-20 bg-[#FDFBF7] dark:bg-zinc-900 p-3 min-w-[210px] border-r border-slate-200 dark:border-zinc-800">
                        <button
                          type="button"
                          onClick={() => toggleSort('student')}
                          className="inline-flex items-center gap-1.5 font-bold text-slate-900 dark:text-white hover:opacity-80 transition cursor-pointer"
                        >
                          <span>Student</span>
                          {sortConfig.column === 'student' ? (
                            <span className="text-[10px] font-mono bg-slate-900 text-white dark:bg-white dark:text-black px-1.5 py-0.5 rounded">
                              {sortConfig.direction === 'asc' ? 'A→Z' : 'Z→A'}
                            </span>
                          ) : (
                            <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />
                          )}
                        </button>
                        <div className="text-[11px] font-normal text-slate-500 dark:text-slate-400 mt-0.5">
                          {displayedStudents.length} student{displayedStudents.length === 1 ? '' : 's'}
                        </div>
                      </th>

                      {/* Overall Completion % Header */}
                      <th className="p-3 min-w-[140px] border-r border-slate-200 dark:border-zinc-800">
                        <button
                          type="button"
                          onClick={() => toggleSort('overall')}
                          className="inline-flex items-center gap-1.5 font-bold text-slate-900 dark:text-white hover:opacity-80 transition cursor-pointer"
                        >
                          <span>Task Completion</span>
                          {sortConfig.column === 'overall' ? (
                            <span className="text-[10px] font-mono bg-slate-900 text-white dark:bg-white dark:text-black px-1.5 py-0.5 rounded">
                              {sortConfig.direction === 'desc' ? 'Hi→Lo' : 'Lo→Hi'}
                            </span>
                          ) : (
                            <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />
                          )}
                        </button>
                        <div className="text-[11px] font-normal text-slate-500 dark:text-slate-400 mt-0.5 tabular-nums">
                          Class avg: {overallKPIs.overallCompletionPct}%
                        </div>
                      </th>

                      {/* Dynamic Task Columns */}
                      {visibleTasks.map((task) => {
                        const tStats = taskStatsById[task.id] || {
                          assignedCount: 0,
                          completedCount: 0,
                          inProgressCount: 0,
                          notStartedCount: 0,
                          completionPct: 0
                        };
                        const dueTs = new Date(task.dueDate).getTime();
                        const isOverdue = !Number.isNaN(dueTs) && dueTs < nowTs;
                        const subtopicLabel =
                          (task.targetSubtopics || []).length > 0
                            ? task.targetSubtopics.slice(0, 3).join(', ') +
                              (task.targetSubtopics.length > 3 ? ` +${task.targetSubtopics.length - 3}` : '')
                            : 'General';
                        const isSorted = sortConfig.column === task.id;

                        return (
                          <th
                            key={task.id}
                            className="p-3 min-w-[195px] max-w-[235px] border-r last:border-r-0 border-slate-200 dark:border-zinc-800"
                          >
                            <div className="space-y-1.5">
                              <button
                                type="button"
                                onClick={() => toggleSort(task.id)}
                                title={`${task.title} — Click to sort students by completion on this task`}
                                className="w-full flex items-start justify-between gap-1.5 text-left group cursor-pointer"
                              >
                                <span className="font-bold text-slate-900 dark:text-white text-xs leading-snug line-clamp-2 group-hover:underline">
                                  {task.title}
                                </span>
                                <span className="shrink-0 mt-0.5">
                                  {isSorted ? (
                                    sortConfig.direction === 'desc' ? (
                                      <ArrowDown className="w-3.5 h-3.5 text-slate-900 dark:text-white" />
                                    ) : (
                                      <ArrowUp className="w-3.5 h-3.5 text-slate-900 dark:text-white" />
                                    )
                                  ) : (
                                    <ArrowUpDown className="w-3.5 h-3.5 opacity-35 group-hover:opacity-80" />
                                  )}
                                </span>
                              </button>

                              {/* Clean typographic metadata (no pill clutter) */}
                              <div className="text-[11px] font-normal text-slate-600 dark:text-slate-400 flex items-center gap-1.5 flex-wrap tabular-nums">
                                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                                  {subtopicLabel}
                                </span>
                                {(task.type === 'both' || task.type === 'practice_quiz') && (
                                  <>
                                    <span aria-hidden="true">·</span>
                                    <span>{task.requiredQuizLength || 10} Qs</span>
                                  </>
                                )}
                                <span aria-hidden="true">·</span>
                                <span className={isOverdue ? 'text-rose-600 dark:text-rose-400 font-semibold' : ''}>
                                  {isOverdue ? 'Past due ' : 'Due '}
                                  {formatShortDate(task.dueDate)}
                                </span>
                              </div>

                              {/* Mini Stacked Progress Bar & Completed Fraction */}
                              <div className="space-y-1 pt-0.5">
                                <div className="flex items-center justify-between text-[10px] font-semibold tabular-nums">
                                  <span className="text-emerald-700 dark:text-emerald-400">
                                    {tStats.completedCount}/{tStats.assignedCount} done ({tStats.completionPct}%)
                                  </span>
                                  <span className="text-slate-500 dark:text-slate-400">
                                    {tStats.inProgressCount} IP · {tStats.notStartedCount} NS
                                  </span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden flex">
                                  {tStats.assignedCount > 0 && (
                                    <>
                                      <div
                                        className="bg-emerald-600 dark:bg-emerald-500"
                                        style={{ width: `${(tStats.completedCount / tStats.assignedCount) * 100}%` }}
                                      />
                                      <div
                                        className="bg-amber-500"
                                        style={{ width: `${(tStats.inProgressCount / tStats.assignedCount) * 100}%` }}
                                      />
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </th>
                        );
                      })}
                    </tr>

                    {/* Per-Column Filter & Ordering Row */}
                    <tr className="bg-slate-50/90 dark:bg-zinc-950 border-t border-slate-200 dark:border-zinc-800 font-normal align-top">
                      {/* Student Filter & Sort */}
                      <th className="sticky left-0 z-20 bg-slate-50 dark:bg-zinc-950 p-1.5 border-r border-slate-200 dark:border-zinc-800 space-y-1">
                        <select
                          value={sortConfig.column === 'student' ? sortConfig.direction : 'default'}
                          onChange={e => setColumnOrderSelect('student', e.target.value)}
                          className="w-full px-1.5 py-0.5 text-xs rounded-md bg-white dark:bg-black border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-slate-100 font-semibold"
                        >
                          <option value="default">Order: Default</option>
                          <option value="asc">A → Z (Alphabetical)</option>
                          <option value="desc">Z → A (Reverse)</option>
                        </select>
                        <input
                          type="text"
                          value={studentSearch}
                          onChange={e => setStudentSearch(e.target.value)}
                          placeholder="Search student..."
                          className="w-full px-1.5 py-0.5 text-xs rounded-md bg-white dark:bg-black border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 font-medium"
                        />
                      </th>

                      {/* Overall Completion Filter & Sort */}
                      <th className="p-1.5 border-r border-slate-200 dark:border-zinc-800 space-y-1">
                        <select
                          value={sortConfig.column === 'overall' ? sortConfig.direction : 'default'}
                          onChange={e => setColumnOrderSelect('overall', e.target.value)}
                          className="w-full px-1.5 py-0.5 text-xs rounded-md bg-white dark:bg-black border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-slate-100 font-semibold"
                        >
                          <option value="default">Order: Default</option>
                          <option value="desc">High → Low</option>
                          <option value="asc">Low → High</option>
                        </select>
                        <select
                          value={overallFilter}
                          onChange={e => setOverallFilter(e.target.value as any)}
                          className="w-full px-1.5 py-0.5 text-xs rounded-md bg-white dark:bg-black border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-slate-100 font-medium"
                        >
                          <option value="all">All Students</option>
                          <option value="complete">All Tasks Done</option>
                          <option value="in_progress">In Progress / Partial</option>
                          <option value="not_started">None Started</option>
                        </select>
                      </th>

                      {/* Per-Task Order & Status Filter */}
                      {visibleTasks.map((task) => (
                        <th
                          key={task.id}
                          className="p-1.5 border-r last:border-r-0 border-slate-200 dark:border-zinc-800 space-y-1"
                        >
                          <select
                            value={sortConfig.column === task.id ? sortConfig.direction : 'default'}
                            onChange={e => setColumnOrderSelect(task.id, e.target.value)}
                            className="w-full px-1.5 py-0.5 text-xs rounded-md bg-white dark:bg-black border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-slate-100 font-semibold"
                          >
                            <option value="default">Order: Default</option>
                            <option value="desc">Completed First</option>
                            <option value="asc">Not Started First</option>
                          </select>
                          <select
                            value={taskStatusFilters[task.id] || 'all'}
                            onChange={e =>
                              setTaskStatusFilters(prev => ({
                                ...prev,
                                [task.id]: e.target.value as any
                              }))
                            }
                            className="w-full px-1.5 py-0.5 text-xs rounded-md bg-white dark:bg-black border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-slate-100 font-medium"
                          >
                            <option value="all">Filter: All Statuses</option>
                            <option value="completed">Completed</option>
                            <option value="in_progress">In Progress</option>
                            <option value="not_started">Not Started</option>
                          </select>
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-200 dark:divide-zinc-800 bg-white dark:bg-black">
                    {displayedStudents.length === 0 ? (
                      <tr>
                        <td
                          colSpan={2 + visibleTasks.length}
                          className="p-8 text-center text-xs text-slate-500 dark:text-slate-400"
                        >
                          No students match the current column filters.{' '}
                          <button
                            type="button"
                            onClick={resetAllFiltersAndOrder}
                            className="underline font-bold text-slate-900 dark:text-white ml-1 cursor-pointer"
                          >
                            Reset filters
                          </button>
                        </td>
                      </tr>
                    ) : (
                      displayedStudents.map((stu) => {
                        const sum = studentSummaryById[stu.studentId] || {
                          assigned: 0,
                          completed: 0,
                          inProgress: 0,
                          notStarted: 0,
                          completionPct: 0
                        };

                        return (
                          <tr
                            key={stu.studentId}
                            className="hover:bg-slate-50/70 dark:hover:bg-zinc-900/40 transition"
                          >
                            {/* Sticky Student Name Cell */}
                            <td className="sticky left-0 z-10 bg-white dark:bg-black p-3 border-r border-slate-200 dark:border-zinc-800">
                              <div className="font-bold text-slate-900 dark:text-white truncate max-w-[190px]">
                                {stu.name}
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[190px]">
                                {stu.email || stu.tier || 'Student'}
                              </div>
                            </td>

                            {/* Student Overall Task Completion Cell */}
                            <td className="p-3 border-r border-slate-200 dark:border-zinc-800">
                              <div className="space-y-1">
                                <div className="flex items-center justify-between font-mono tabular-nums font-bold text-xs">
                                  <span
                                    className={
                                      sum.assigned > 0 && sum.completed === sum.assigned
                                        ? 'text-emerald-700 dark:text-emerald-400'
                                        : sum.completionPct > 0
                                          ? 'text-amber-700 dark:text-amber-400'
                                          : 'text-slate-500 dark:text-slate-400'
                                    }
                                  >
                                    {sum.completionPct}%
                                  </span>
                                  <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
                                    {sum.completed}/{sum.assigned}
                                  </span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full transition-all ${
                                      sum.completionPct === 100
                                        ? 'bg-emerald-600 dark:bg-emerald-500'
                                        : sum.completionPct > 0
                                          ? 'bg-amber-500'
                                          : 'bg-slate-300 dark:bg-zinc-700'
                                    }`}
                                    style={{ width: `${sum.completionPct}%` }}
                                  />
                                </div>
                              </div>
                            </td>

                            {/* Task Status Matrix Cells */}
                            {visibleTasks.map((task) => {
                              const cell = cellMatrix[stu.studentId]?.[task.id] || {
                                status: 'not_started' as const,
                                isOverdue: false
                              };
                              const sub = cell.submission;

                              if (cell.status === 'not_assigned') {
                                return (
                                  <td
                                    key={task.id}
                                    className="p-2.5 border-r last:border-r-0 border-slate-200 dark:border-zinc-800 text-center"
                                  >
                                    <span className="text-[11px] text-slate-400 dark:text-zinc-600">
                                      Not Assigned
                                    </span>
                                  </td>
                                );
                              }

                              const scorePct = sub?.practiceQuizScore ?? sub?.quizScore;
                              const slidesProgressText =
                                sub?.slidesTotalCount && sub.slidesTotalCount > 0
                                  ? `Slides ${sub.slidesReadCount || 0}/${sub.slidesTotalCount}`
                                  : sub?.slidesCompleted
                                    ? 'Slides read'
                                    : undefined;

                              return (
                                <td
                                  key={task.id}
                                  className="p-2 border-r last:border-r-0 border-slate-200 dark:border-zinc-800 align-middle"
                                >
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setSelectedCellModal({
                                        student: stu,
                                        task,
                                        cell
                                      })
                                    }
                                    title="Click to inspect detailed slide reading & quiz breakdown"
                                    className={`w-full text-left px-2.5 py-2 rounded-xl border transition cursor-pointer ${
                                      cell.status === 'completed'
                                        ? 'bg-emerald-50/90 hover:bg-emerald-100/80 dark:bg-emerald-950/35 dark:hover:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                                        : cell.status === 'in_progress'
                                          ? 'bg-amber-50/90 hover:bg-amber-100/80 dark:bg-amber-950/35 dark:hover:bg-amber-950/60 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                                          : cell.isOverdue
                                            ? 'bg-rose-50/70 hover:bg-rose-100/70 dark:bg-rose-950/25 dark:hover:bg-rose-950/45 border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300'
                                            : 'bg-slate-50 hover:bg-slate-100 dark:bg-zinc-900/70 dark:hover:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-slate-300'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between gap-1.5">
                                      <span className="inline-flex items-center gap-1.5 font-bold text-[11px] whitespace-nowrap">
                                        {cell.status === 'completed' && (
                                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                        )}
                                        {cell.status === 'in_progress' && (
                                          <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                                        )}
                                        {cell.status === 'not_started' && (
                                          <CircleDashed
                                            className={`w-3.5 h-3.5 shrink-0 ${
                                              cell.isOverdue
                                                ? 'text-rose-600 dark:text-rose-400'
                                                : 'text-slate-400 dark:text-slate-500'
                                            }`}
                                          />
                                        )}
                                        <span>
                                          {cell.status === 'completed'
                                            ? 'Completed'
                                            : cell.status === 'in_progress'
                                              ? 'In Progress'
                                              : 'Not Started'}
                                        </span>
                                      </span>

                                      {scorePct !== undefined && (
                                        <span className="text-[11px] font-mono font-bold tabular-nums">
                                          {scorePct}%
                                        </span>
                                      )}
                                    </div>

                                    {/* Subline detail */}
                                    <div className="text-[10px] opacity-80 mt-0.5 truncate tabular-nums">
                                      {cell.status === 'completed' ? (
                                        sub?.completedAt ? `Done ${formatShortDate(sub.completedAt)}` : 'All criteria met'
                                      ) : cell.status === 'in_progress' ? (
                                        [
                                          slidesProgressText,
                                          sub?.trafficLightQuizScore !== undefined
                                            ? `TL ${sub.trafficLightQuizScore}%`
                                            : undefined
                                        ]
                                          .filter(Boolean)
                                          .join(' · ') || 'Started'
                                      ) : cell.isOverdue ? (
                                        'Overdue'
                                      ) : (
                                        'No activity yet'
                                      )}
                                    </div>
                                  </button>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Detailed Student-Task Breakdown Modal */}
      {selectedCellModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedCellModal(null)}
        >
          <div
            className="w-full max-w-lg bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 space-y-5 shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-slate-200 dark:border-zinc-800 pb-4">
              <div className="space-y-1">
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Task Progress Breakdown · {selectedCellModal.student.name}
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                  {selectedCellModal.task.title}
                </h3>
                <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2 flex-wrap">
                  <span>Due {new Date(selectedCellModal.task.dueDate).toLocaleDateString()}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono">
                    {(selectedCellModal.task.targetSubtopics || []).join(', ') || 'General'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCellModal(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-500 dark:text-slate-400 cursor-pointer"
                aria-label="Close detail modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {(() => {
              const sub = selectedCellModal.cell.submission;
              const status = selectedCellModal.cell.status;
              const reqLen = selectedCellModal.task.requiredQuizLength || 10;
              const needsSlidesAndTL =
                selectedCellModal.task.requireSlidesAndTrafficLight !== false ||
                selectedCellModal.task.type === 'both' ||
                selectedCellModal.task.type === 'slides_traffic_light';
              const needsPractice =
                selectedCellModal.task.type === 'both' ||
                selectedCellModal.task.type === 'practice_quiz' ||
                selectedCellModal.task.type === 'exam_paper';

              return (
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-[#FDFBF7] dark:bg-zinc-900">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Overall Status</span>
                    <span
                      className={`inline-flex items-center gap-1.5 font-bold ${
                        status === 'completed'
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : status === 'in_progress'
                            ? 'text-amber-700 dark:text-amber-400'
                            : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {status === 'completed' ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : status === 'in_progress' ? (
                        <Clock className="w-4 h-4" />
                      ) : (
                        <CircleDashed className="w-4 h-4" />
                      )}
                      <span>
                        {status === 'completed'
                          ? 'Completed'
                          : status === 'in_progress'
                            ? 'In Progress'
                            : 'Not Started'}
                      </span>
                    </span>
                  </div>

                  {/* Step 1: Lesson Slides */}
                  {needsSlidesAndTL && (
                    <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-zinc-800">
                      <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-medium">
                        <BookOpen className="w-4 h-4 text-slate-500" />
                        <span>Assigned Lesson Slides</span>
                      </div>
                      <span className="font-mono font-bold tabular-nums text-slate-900 dark:text-white">
                        {sub?.slidesCompleted
                          ? 'All slides read'
                          : sub?.slidesTotalCount && sub.slidesTotalCount > 0
                            ? `${sub.slidesReadCount || 0} / ${sub.slidesTotalCount} slides`
                            : 'Pending'}
                      </span>
                    </div>
                  )}

                  {/* Step 2: Traffic Light Quiz */}
                  {needsSlidesAndTL && (
                    <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-zinc-800">
                      <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-medium">
                        <Layers className="w-4 h-4 text-slate-500" />
                        <span>Traffic Light Mastery Quiz</span>
                      </div>
                      <span className="font-mono font-bold tabular-nums text-slate-900 dark:text-white">
                        {sub?.trafficLightQuizCompleted || sub?.trafficLightQuizScore !== undefined
                          ? `${sub.trafficLightQuizScore ?? '—'}% (${
                              sub.trafficLight === 'green'
                                ? 'Green'
                                : sub.trafficLight === 'orange'
                                  ? 'Amber'
                                  : sub.trafficLight === 'red'
                                    ? 'Red'
                                    : 'Recorded'
                            })`
                          : 'Pending'}
                      </span>
                    </div>
                  )}

                  {/* Step 3: Exact-Length Practice Quiz */}
                  {needsPractice && (
                    <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-zinc-800">
                      <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-medium">
                        <ClipboardCheck className="w-4 h-4 text-slate-500" />
                        <span>Practice Quiz ({reqLen} Qs Required)</span>
                      </div>
                      <span className="font-mono font-bold tabular-nums text-slate-900 dark:text-white">
                        {sub?.practiceQuizScore !== undefined
                          ? `${sub.practiceQuizScore}% (${sub.practiceQuizLength || reqLen} Qs)`
                          : 'Pending'}
                      </span>
                    </div>
                  )}

                  {sub?.completedAt && (
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 text-right pt-1">
                      Completed on {new Date(sub.completedAt).toLocaleString()}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
