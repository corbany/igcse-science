import { CompletedActivity, UserProfile, StudentProgress, TaskWithSubmission, ScienceSubject } from '../types';
import { getSubtopicByCode } from '../data/subtopicSlidesData';

const ACTIVITY_LOG_KEY_PREFIX = 'igcse_0653_activity_log_';

/**
 * Persistently logs a completed task or quiz to the student's recent activity stream in localStorage.
 */
export function logCompletedActivity(
  studentId: string,
  activity: Omit<CompletedActivity, 'id' | 'completedAt'> & { completedAt?: string; id?: string }
): void {
  if (typeof window === 'undefined' || !studentId) return;
  try {
    const key = `${ACTIVITY_LOG_KEY_PREFIX}${studentId}`;
    const raw = localStorage.getItem(key);
    const existing: CompletedActivity[] = raw ? JSON.parse(raw) : [];

    const completedAt = activity.completedAt || new Date().toISOString();
    const newEntry: CompletedActivity = {
      ...activity,
      id: activity.id || `${activity.type}-${activity.code || 'item'}-${Date.now()}`,
      completedAt
    };

    // Prepend new activity and keep the last 50 entries
    const updated = [newEntry, ...existing.filter(e => e.id !== newEntry.id)].slice(0, 50);
    localStorage.setItem(key, JSON.stringify(updated));

    // Dispatch custom event for real-time reactive UI updates
    window.dispatchEvent(new CustomEvent('igcse_activity_logged', { detail: newEntry }));
  } catch (err) {
    console.warn('Failed to log student activity:', err);
  }
}

/**
 * Aggregates, parses, sorts, and extracts the last N completed tasks or quizzes for a student.
 * Pulls from:
 * 1. Assigned class tasks with completed submissions
 * 2. Subtopic quiz scores with timestamps
 * 3. Subject practice arena quiz scores with timestamps
 * 4. Persistent activity log stream
 */
export function getRecentCompletedActivities(
  user: UserProfile,
  progress: StudentProgress,
  tasks: TaskWithSubmission[] = [],
  limit = 5
): CompletedActivity[] {
  const activityMap = new Map<string, CompletedActivity>();

  // 1. Ingest stored activity logs
  if (typeof window !== 'undefined' && user?.id) {
    try {
      const key = `${ACTIVITY_LOG_KEY_PREFIX}${user.id}`;
      const raw = localStorage.getItem(key);
      if (raw) {
        const storedList: CompletedActivity[] = JSON.parse(raw);
        storedList.forEach(item => {
          if (item && item.completedAt && !isNaN(new Date(item.completedAt).getTime())) {
            activityMap.set(item.id, item);
          }
        });
      }
    } catch (e) {
      console.warn('Error reading stored activities:', e);
    }
  }

  // 2. Ingest assigned class tasks completed by the student
  (tasks || []).forEach(task => {
    if (task.submission?.status === 'completed') {
      const ts = task.submission.completedAt || task.submission.lastActivityAt || task.createdAt;
      if (!ts || isNaN(new Date(ts).getTime())) return;

      const subtopic = task.targetSubtopics?.[0] || '';
      const subject: ScienceSubject | undefined = subtopic.startsWith('B') 
        ? 'biology' 
        : subtopic.startsWith('C') 
          ? 'chemistry' 
          : subtopic.startsWith('P') 
            ? 'physics' 
            : undefined;

      const id = `task-${task.id}`;
      activityMap.set(id, {
        id,
        type: 'task',
        title: task.title,
        subtitle: task.className ? `${task.className} • Assigned Task` : 'Class Assignment',
        code: subtopic || undefined,
        subject,
        score: task.submission.quizScore,
        trafficLight: task.submission.trafficLight,
        completedAt: ts
      });
    }
  });

  // 3. Ingest Subtopic 10-Question Quizzes from progress.subtopicQuizScores
  const subtopicScores = progress?.subtopicQuizScores || {};
  Object.entries(subtopicScores).forEach(([code, res]) => {
    if (res && res.date && !isNaN(new Date(res.date).getTime())) {
      const subtopicMeta = getSubtopicByCode(code);
      const subject: ScienceSubject = (code.startsWith('B') 
        ? 'biology' 
        : code.startsWith('C') 
          ? 'chemistry' 
          : 'physics') as ScienceSubject;

      const id = `subtopic-${code}`;
      // Only set if not already present or if newer
      const existing = activityMap.get(id);
      if (!existing || new Date(res.date).getTime() >= new Date(existing.completedAt).getTime()) {
        activityMap.set(id, {
          id,
          type: 'subtopic_quiz',
          title: `${code} ${subtopicMeta?.title || 'Knowledge Check'}`,
          subtitle: '10-Question Knowledge Check',
          code,
          subject,
          score: res.score,
          total: res.total || 10,
          percentage: res.percentage,
          passed: res.passed,
          trafficLight: res.percentage >= 80 ? 'green' : res.percentage >= 50 ? 'orange' : 'red',
          completedAt: res.date
        });
      }
    }
  });

  // 4. Ingest Subject Arena Quizzes from progress.quizScores
  const subjectScores = progress?.quizScores || {};
  Object.entries(subjectScores).forEach(([subj, res]) => {
    if (res && res.date && !isNaN(new Date(res.date).getTime())) {
      const pct = Math.round((res.score / (res.total || 1)) * 100);
      const id = `arena-${subj}`;
      const existing = activityMap.get(id);
      if (!existing || new Date(res.date).getTime() >= new Date(existing.completedAt).getTime()) {
        activityMap.set(id, {
          id,
          type: 'subject_quiz',
          title: `${subj.charAt(0).toUpperCase() + subj.slice(1)} Practice Arena Quiz`,
          subtitle: 'Comprehensive Practice Exam',
          subject: subj as ScienceSubject,
          score: res.score,
          total: res.total,
          percentage: pct,
          passed: pct >= 70,
          trafficLight: pct >= 80 ? 'green' : pct >= 50 ? 'orange' : 'red',
          completedAt: res.date
        });
      }
    }
  });

  // Convert to array and sort descending (latest completed first)
  const allActivities = Array.from(activityMap.values())
    .filter(a => a.completedAt && !isNaN(new Date(a.completedAt).getTime()))
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());

  // Return exactly the last N items (defaults to 5)
  return allActivities.slice(0, limit);
}

/**
 * Formats an ISO timestamp into a readable date and time string.
 * Example: "Oct 19, 2026 at 4:15 PM"
 */
export function formatActivityTimestamp(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return 'Recently';

    const datePart = d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    const timePart = d.toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit'
    });

    return `${datePart} at ${timePart}`;
  } catch {
    return 'Recently';
  }
}

/**
 * Calculates a friendly relative time string (e.g. "Just now", "5m ago", "2h ago", "Yesterday").
 */
export function getActivityRelativeTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    const now = Date.now();
    const diffMs = now - d.getTime();

    if (isNaN(diffMs)) return 'Recently';
    if (diffMs < 0) return 'Just now';

    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;

    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return 'Recently';
  }
}

/**
 * Returns a precise ISO/locale timestamp tooltip string for screen readers and tooltips.
 */
export function getActivityExactTooltip(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleString(undefined, {
      weekday: 'short',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    });
  } catch {
    return isoString;
  }
}
