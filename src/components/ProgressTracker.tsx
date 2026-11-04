import React, { useState, useMemo, useEffect } from 'react';
import { 
  BarChart3, 
  CheckCircle2, 
  Star, 
  TrendingUp, 
  TrendingDown,
  BookOpen, 
  Clock, 
  Award, 
  Flame,
  ChevronRight,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Filter,
  Users,
  UserCheck,
  Search,
  GraduationCap,
  ChevronDown,
  ArrowLeft,
  RefreshCw,
  Trophy,
  User,
  Target,
  Zap,
  Activity,
  History,
  RotateCcw
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Legend
} from 'recharts';
import { StudentProgress, UserProfile, TrafficLightStatus, ScienceSubject } from '../types';
import { syllabusItems } from '../data/syllabusData';
import { allSubtopicsData } from '../data/subtopicSlidesData';
import { 
  fetchClassesByInstructor, 
  fetchStudentsInClass, 
  subscribeToClassStudents,
  ClassItem, 
  ClassStudentItem 
} from '../services/firestoreService';

interface ProgressTrackerProps {
  progress: StudentProgress;
  user: UserProfile;
  onUpdateConfidence: (topicCode: string, rating: number) => void;
  onNavigateToTopic: (topicCode: string) => void;
  onNavigateToLeaderboard?: () => void;
  onNavigateToProfile?: () => void;
}

interface EnrichedStudentItem extends ClassStudentItem {
  className?: string;
  classCode?: string;
  classId?: string;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  progress,
  user,
  onUpdateConfidence,
  onNavigateToTopic,
  onNavigateToLeaderboard,
  onNavigateToProfile
}) => {
  const isInstructor = user.role === 'instructor';

  // Instructor Cohort States
  const [instructorViewMode, setInstructorViewMode] = useState<'roster' | 'student-detail'>(
    isInstructor ? 'roster' : 'student-detail'
  );
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [allCohortStudents, setAllCohortStudents] = useState<EnrichedStudentItem[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [studentSearchQuery, setStudentSearchQuery] = useState<string>('');
  const [isLoadingCohort, setIsLoadingCohort] = useState<boolean>(isInstructor);

  // Load instructor classes & students with real-time live sync
  const loadInstructorData = async () => {
    if (!isInstructor) return;
    setIsLoadingCohort(true);
    try {
      // Pass both user.id and user.email so classes shared with this instructor are fully included
      const clsList = await fetchClassesByInstructor(user.id, user.email);
      setClasses(clsList);

      const studentMap = new Map<string, EnrichedStudentItem>();

      // Fetch students from each owned or shared class
      for (const cls of clsList) {
        const students = await fetchStudentsInClass(cls.id);
        students.forEach(st => {
          const completedSet = new Set<string>([
            ...(st.completedLessons || []),
            ...Object.keys(st.trafficLights || {}),
            ...Object.keys(st.subtopicQuizScores || {})
          ]);
          studentMap.set(st.studentId, {
            ...st,
            className: cls.name,
            classCode: cls.classCode,
            classId: cls.id,
            completedLessonsCount: Math.max(st.completedLessonsCount || 0, completedSet.size),
            completedLessons: Array.from(completedSet)
          });
        });
      }

      const combined = Array.from(studentMap.values());
      setAllCohortStudents(combined);
    } catch (e) {
      console.error('Error loading cohort in ProgressTracker:', e);
    } finally {
      setIsLoadingCohort(false);
    }
  };

  useEffect(() => {
    if (isInstructor) {
      loadInstructorData();
    }
  }, [isInstructor, user.id, user.email]);

  // Real-time live Firestore subscriptions for each class
  useEffect(() => {
    if (!isInstructor || classes.length === 0) return;

    const unsubs: (() => void)[] = [];

    classes.forEach(cls => {
      const unsub = subscribeToClassStudents(cls.id, (liveClassStudents) => {
        setAllCohortStudents(prev => {
          const map = new Map<string, EnrichedStudentItem>();
          prev.forEach(st => map.set(st.studentId, st));
          liveClassStudents.forEach(st => {
            const completedSet = new Set<string>([
              ...(st.completedLessons || []),
              ...Object.keys(st.trafficLights || {}),
              ...Object.keys(st.subtopicQuizScores || {})
            ]);
            map.set(st.studentId, {
              ...st,
              className: cls.name,
              classCode: cls.classCode,
              classId: cls.id,
              completedLessonsCount: Math.max(st.completedLessonsCount || 0, completedSet.size),
              completedLessons: Array.from(completedSet)
            });
          });
          return Array.from(map.values());
        });
      });
      unsubs.push(unsub);
    });

    const handleLiveSyncEvent = () => {
      loadInstructorData();
    };

    window.addEventListener('igcse_student_progress_synced', handleLiveSyncEvent);
    window.addEventListener('storage', handleLiveSyncEvent);

    return () => {
      unsubs.forEach(u => u());
      window.removeEventListener('igcse_student_progress_synced', handleLiveSyncEvent);
      window.removeEventListener('storage', handleLiveSyncEvent);
    };
  }, [isInstructor, classes]);

  // Derive selected student if viewing an individual student as instructor
  const selectedStudent = useMemo(() => {
    if (!isInstructor || !selectedStudentId) return null;
    return allCohortStudents.find(s => s.studentId === selectedStudentId) || null;
  }, [isInstructor, selectedStudentId, allCohortStudents]);

  // Determine active progress to display: student's progress or logged-in user's progress
  const activeProgress: StudentProgress = useMemo(() => {
    if (isInstructor && selectedStudent) {
      const studentDecks = new Set<string>([
        ...(selectedStudent.completedLessons || []),
        ...Object.keys(selectedStudent.trafficLights || {}),
        ...Object.keys(selectedStudent.subtopicQuizScores || {})
      ]);
      return {
        completedLessons: Array.from(studentDecks),
        topicConfidence: selectedStudent.topicConfidence || {},
        trafficLights: selectedStudent.trafficLights || {},
        subtopicQuizScores: selectedStudent.subtopicQuizScores || {},
        savedNotes: {},
        quizScores: selectedStudent.quizScores || {},
        lastActive: selectedStudent.lastActive
      };
    }
    const studentDecks = new Set<string>([
      ...(progress.completedLessons || []),
      ...Object.keys(progress.trafficLights || {}),
      ...Object.keys(progress.subtopicQuizScores || {})
    ]);
    return {
      ...progress,
      completedLessons: Array.from(studentDecks)
    };
  }, [isInstructor, selectedStudent, progress]);

  // Subject and traffic filters
  const [activeCategory, setActiveCategory] = useState<'all' | 'biology' | 'chemistry' | 'physics'>('all');
  const [trafficFilter, setTrafficFilter] = useState<'all' | 'red' | 'orange' | 'green'>('all');

  // Tracker View Modes: 'trends' | 'curriculum' | 'confidence' | 'all'
  const [trackerTab, setTrackerTab] = useState<'trends' | 'curriculum' | 'confidence' | 'all'>('trends');

  // Performance Trends states
  const [trendsSubject, setTrendsSubject] = useState<'all' | 'biology' | 'chemistry' | 'physics'>('all');
  const [showBenchmarkComparison, setShowBenchmarkComparison] = useState<boolean>(false);

  // Subtopic metadata lookup for quick name and subject resolution
  const subtopicMetaMap = useMemo(() => {
    const map = new Map<string, { title: string; subject: ScienceSubject; topicName: string }>();
    allSubtopicsData.forEach(sub => {
      map.set(sub.subtopicCode, {
        title: sub.title,
        subject: sub.subject,
        topicName: sub.topicName
      });
    });
    return map;
  }, []);

  // Compute student quiz progression over time
  const studentQuizTrendData = useMemo(() => {
    const rawScores = activeProgress.subtopicQuizScores || {};
    const entries = Object.entries(rawScores);

    const items: Array<{
      subtopicCode: string;
      title: string;
      subject: ScienceSubject;
      score: number;
      total: number;
      percentage: number;
      passed: boolean;
      date: string;
      timestamp: number;
      formattedDate: string;
      displayLabel: string;
      movingAvg?: number;
      displayIndex?: number;
      isSample?: boolean;
    }> = [];

    entries.forEach(([code, data]) => {
      if (!data) return;
      const meta = subtopicMetaMap.get(code);
      const subject: ScienceSubject = meta?.subject || (code.startsWith('B') ? 'biology' : code.startsWith('C') ? 'chemistry' : 'physics');

      if (trendsSubject !== 'all' && subject !== trendsSubject) {
        return;
      }

      const timestamp = data.date ? new Date(data.date).getTime() : 0;
      const validTimestamp = isNaN(timestamp) || timestamp === 0 ? Date.now() : timestamp;
      const formattedDate = new Date(validTimestamp).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric'
      });

      const total = data.total || 10;
      const percentage = data.percentage !== undefined ? data.percentage : Math.round((data.score / total) * 100);

      items.push({
        subtopicCode: code,
        title: meta?.title || `Subtopic ${code}`,
        subject,
        score: data.score,
        total,
        percentage,
        passed: data.passed !== undefined ? data.passed : (percentage >= 80),
        date: data.date || new Date().toISOString(),
        timestamp: validTimestamp,
        formattedDate,
        displayLabel: code
      });
    });

    // Sort chronologically ascending
    items.sort((a, b) => a.timestamp - b.timestamp);

    // Compute rolling 3-quiz moving average
    return items.map((item, idx, arr) => {
      const windowStart = Math.max(0, idx - 2);
      const windowItems = arr.slice(windowStart, idx + 1);
      const avg = Math.round(windowItems.reduce((acc, curr) => acc + curr.percentage, 0) / windowItems.length);
      return {
        ...item,
        movingAvg: avg,
        displayIndex: idx + 1
      };
    });
  }, [activeProgress.subtopicQuizScores, trendsSubject, subtopicMetaMap]);

  // Sample benchmark progression curve (available if 0 quizzes or when toggled)
  const sampleBenchmarkData = useMemo(() => {
    let sampleCodes: { code: string; pct: number; daysAgo: number }[] = [];
    if (trendsSubject === 'biology') {
      sampleCodes = [
        { code: 'B1.1', pct: 50, daysAgo: 24 },
        { code: 'B1.2', pct: 60, daysAgo: 21 },
        { code: 'B2.1', pct: 60, daysAgo: 17 },
        { code: 'B2.2', pct: 70, daysAgo: 14 },
        { code: 'B3.1', pct: 70, daysAgo: 10 },
        { code: 'B4.1', pct: 80, daysAgo: 7 },
        { code: 'B5.1', pct: 90, daysAgo: 4 },
        { code: 'B6.1', pct: 100, daysAgo: 1 }
      ];
    } else if (trendsSubject === 'chemistry') {
      sampleCodes = [
        { code: 'C1.1', pct: 50, daysAgo: 25 },
        { code: 'C1.2', pct: 60, daysAgo: 22 },
        { code: 'C2.1', pct: 60, daysAgo: 18 },
        { code: 'C2.2', pct: 70, daysAgo: 15 },
        { code: 'C3.1', pct: 70, daysAgo: 11 },
        { code: 'C4.1', pct: 80, daysAgo: 7 },
        { code: 'C5.1', pct: 80, daysAgo: 4 },
        { code: 'C6.1', pct: 90, daysAgo: 1 }
      ];
    } else if (trendsSubject === 'physics') {
      sampleCodes = [
        { code: 'P1.1', pct: 50, daysAgo: 26 },
        { code: 'P1.2', pct: 60, daysAgo: 21 },
        { code: 'P2.1', pct: 60, daysAgo: 17 },
        { code: 'P2.2', pct: 70, daysAgo: 13 },
        { code: 'P3.1', pct: 80, daysAgo: 9 },
        { code: 'P4.1', pct: 80, daysAgo: 6 },
        { code: 'P5.1', pct: 90, daysAgo: 3 },
        { code: 'P6.1', pct: 100, daysAgo: 1 }
      ];
    } else {
      sampleCodes = [
        { code: 'B1.1', pct: 50, daysAgo: 28 },
        { code: 'C1.1', pct: 60, daysAgo: 24 },
        { code: 'P1.1', pct: 60, daysAgo: 20 },
        { code: 'B2.1', pct: 70, daysAgo: 16 },
        { code: 'C2.1', pct: 70, daysAgo: 12 },
        { code: 'P2.1', pct: 80, daysAgo: 8 },
        { code: 'B3.1', pct: 90, daysAgo: 5 },
        { code: 'C3.1', pct: 90, daysAgo: 2 },
        { code: 'P3.1', pct: 100, daysAgo: 0 }
      ];
    }

    return sampleCodes.map((s, idx, arr) => {
      const date = new Date(Date.now() - s.daysAgo * 86400000);
      const meta = subtopicMetaMap.get(s.code);
      const windowStart = Math.max(0, idx - 2);
      const windowItems = arr.slice(windowStart, idx + 1);
      const avg = Math.round(windowItems.reduce((acc, curr) => acc + curr.pct, 0) / windowItems.length);

      return {
        subtopicCode: s.code,
        title: meta?.title || `Subtopic ${s.code}`,
        subject: (s.code.startsWith('B') ? 'biology' : s.code.startsWith('C') ? 'chemistry' : 'physics') as ScienceSubject,
        score: Math.round(s.pct / 10),
        total: 10,
        percentage: s.pct,
        passed: s.pct >= 80,
        date: date.toISOString(),
        timestamp: date.getTime(),
        formattedDate: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        displayLabel: s.code,
        movingAvg: avg,
        displayIndex: idx + 1,
        isSample: true
      };
    });
  }, [trendsSubject, subtopicMetaMap]);

  // Active trend dataset (prefers real scores; if 0, falls back to sample when preview is toggled)
  const currentTrendDataset = studentQuizTrendData.length > 0 
    ? studentQuizTrendData 
    : (showBenchmarkComparison ? sampleBenchmarkData : []);

  // Performance stats computed for active subject
  const trendStats = useMemo(() => {
    if (currentTrendDataset.length === 0) {
      return {
        count: 0,
        avg: 0,
        latest: 0,
        highest: 0,
        masteryCount: 0,
        masteryRate: 0,
        delta: 0,
        isImproving: true
      };
    }
    const count = currentTrendDataset.length;
    const percentages = currentTrendDataset.map(d => d.percentage);
    const avg = Math.round(percentages.reduce((a, b) => a + b, 0) / count);
    const latest = currentTrendDataset[count - 1].percentage;
    const highest = Math.max(...percentages);
    const masteryCount = currentTrendDataset.filter(d => d.percentage >= 80).length;
    const masteryRate = Math.round((masteryCount / count) * 100);

    let delta = 0;
    if (count >= 2) {
      const firstScore = currentTrendDataset[0].percentage;
      delta = latest - firstScore;
    }
    const isImproving = delta >= 0;

    return {
      count,
      avg,
      latest,
      highest,
      masteryCount,
      masteryRate,
      delta,
      isImproving
    };
  }, [currentTrendDataset]);

  // Chart visual theme per subject
  const subjectChartTheme = useMemo(() => {
    switch (trendsSubject) {
      case 'biology':
        return {
          stroke: '#10b981',
          fillStart: '#10b981',
          fillStop: '#047857',
          movingAvgStroke: '#34d399',
          name: 'Biology',
          badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
        };
      case 'chemistry':
        return {
          stroke: '#06b6d4',
          fillStart: '#06b6d4',
          fillStop: '#0e7490',
          movingAvgStroke: '#38bdf8',
          name: 'Chemistry',
          badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
        };
      case 'physics':
        return {
          stroke: '#a855f7',
          fillStart: '#a855f7',
          fillStop: '#7e22ce',
          movingAvgStroke: '#f59e0b',
          name: 'Physics',
          badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40'
        };
      default:
        return {
          stroke: '#10b981',
          fillStart: '#10b981',
          fillStop: '#0f766e',
          movingAvgStroke: '#38bdf8',
          name: 'All Sciences',
          badgeClass: 'bg-teal-500/20 text-teal-300 border-teal-500/40'
        };
    }
  }, [trendsSubject]);

  const trafficLights = activeProgress.trafficLights || {};
  const quizScores = activeProgress.subtopicQuizScores || {};
  const completedLessons = activeProgress.completedLessons || [];

  // Compute Traffic Light statistics across all subtopics
  const stats = useMemo(() => {
    let total = allSubtopicsData.length;
    let green = 0;
    let orange = 0;
    let red = 0;
    let unranked = 0;

    const subjectStats = {
      biology: { total: 0, green: 0, orange: 0, red: 0, unranked: 0 },
      chemistry: { total: 0, green: 0, orange: 0, red: 0, unranked: 0 },
      physics: { total: 0, green: 0, orange: 0, red: 0, unranked: 0 }
    };

    allSubtopicsData.forEach(sub => {
      const status = trafficLights[sub.subtopicCode];
      subjectStats[sub.subject].total++;

      if (status === 'green') {
        green++;
        subjectStats[sub.subject].green++;
      } else if (status === 'orange') {
        orange++;
        subjectStats[sub.subject].orange++;
      } else if (status === 'red') {
        red++;
        subjectStats[sub.subject].red++;
      } else {
        unranked++;
        subjectStats[sub.subject].unranked++;
      }
    });

    const masteryPct = total > 0 ? Math.round((green / total) * 100) : 0;

    return { total, green, orange, red, unranked, masteryPct, subjectStats };
  }, [trafficLights]);

  const completedDecksCount = completedLessons.length;
  const slideDeckPct = stats.total > 0 ? Math.min(100, Math.round((completedDecksCount / stats.total) * 100)) : 0;

  const coveredCodes = useMemo(() => {
    return new Set<string>([
      ...completedLessons,
      ...Object.keys(trafficLights),
      ...Object.keys(quizScores)
    ]);
  }, [completedLessons, trafficLights, quizScores]);
  
  const syllabusCoveredCount = coveredCodes.size;
  const syllabusPct = stats.total > 0 ? Math.min(100, Math.round((syllabusCoveredCount / stats.total) * 100)) : 0;

  // Filtered subtopics based on subject tab and traffic light status
  const displayedSubtopics = useMemo(() => {
    return allSubtopicsData.filter(sub => {
      if (activeCategory !== 'all' && sub.subject !== activeCategory) return false;
      const status = trafficLights[sub.subtopicCode];
      if (trafficFilter === 'green' && status !== 'green') return false;
      if (trafficFilter === 'orange' && status !== 'orange') return false;
      if (trafficFilter === 'red' && status !== 'red') return false;
      return true;
    });
  }, [activeCategory, trafficFilter, trafficLights]);

  const filteredSyllabusItems = syllabusItems.filter(item => 
    activeCategory === 'all' || item.subject === activeCategory
  );

  // Filter students for Instructor Roster view
  const filteredStudents = useMemo(() => {
    return allCohortStudents.filter(st => {
      if (selectedClassId !== 'all' && st.classId !== selectedClassId) {
        return false;
      }
      if (studentSearchQuery.trim()) {
        const q = studentSearchQuery.toLowerCase();
        return (
          st.name.toLowerCase().includes(q) ||
          st.email.toLowerCase().includes(q) ||
          (st.className && st.className.toLowerCase().includes(q)) ||
          (st.classCode && st.classCode.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [allCohortStudents, selectedClassId, studentSearchQuery]);

  // Cohort Aggregates
  const cohortStats = useMemo(() => {
    const totalCount = allCohortStudents.length;
    if (totalCount === 0) return { totalCount: 0, avgGreen: 0, highPerformers: 0 };
    
    let totalGreenSum = 0;
    let high = 0;
    allCohortStudents.forEach(st => {
      const greenCount = Object.values(st.trafficLights || {}).filter(t => t === 'green').length;
      totalGreenSum += greenCount;
      if (greenCount >= 10) high++;
    });

    return {
      totalCount,
      avgGreen: Math.round(totalGreenSum / totalCount),
      highPerformers: high
    };
  }, [allCohortStudents]);

  // ==============================================================
  // INSTRUCTOR VIEW: COHORT ROSTER (See all students)
  // ==============================================================
  if (isInstructor && instructorViewMode === 'roster') {
    return (
      <div className="space-y-6">
        {/* Instructor Cohort Header */}
        <div className="bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  Instructor Analytics
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Cambridge IGCSE 0653
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
                <Users className="w-7 h-7 text-purple-400" />
                <span>Student Cohort Progress Tracker</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Review all enrolled students across your classes. Click on any student to inspect their detailed curriculum mastery, traffic lights, and 10-question quiz results.
              </p>
            </div>

            {/* Quick Cohort Summary Cards */}
            <div className="flex items-center gap-3 shrink-0 flex-wrap">
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center min-w-[110px]">
                <div className="text-2xl font-black font-mono text-purple-400">
                  {cohortStats.totalCount}
                </div>
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                  Total Students
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center min-w-[110px]">
                <div className="text-2xl font-black font-mono text-emerald-400">
                  {cohortStats.avgGreen}
                </div>
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                  Avg Green Badges
                </div>
              </div>

              <button
                onClick={loadInstructorData}
                disabled={isLoadingCohort}
                className="p-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition flex items-center justify-center cursor-pointer shadow-lg shadow-purple-600/30"
                title="Refresh student roster"
              >
                <RefreshCw className={`w-5 h-5 ${isLoadingCohort ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Controls: Class Selector & Student Search */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Filter Class:
            </span>
            <button
              onClick={() => setSelectedClassId('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedClassId === 'all'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              All Classes ({allCohortStudents.length})
            </button>
            {classes.map(cls => (
              <button
                key={cls.id}
                onClick={() => setSelectedClassId(cls.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  selectedClassId === cls.id
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span>{cls.name}</span>
                <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-900/80 text-purple-300">
                  {cls.classCode}
                </span>
              </button>
            ))}
          </div>

          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={studentSearchQuery}
              onChange={(e) => setStudentSearchQuery(e.target.value)}
              placeholder="Search student name or email..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* Student Roster Cards / Table */}
        {filteredStudents.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
            <Users className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-lg font-bold text-white">No Students Found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {allCohortStudents.length === 0
                ? "No students have joined your classes yet. Share your Class Code (e.g. SCI-0653) with your students so they can join upon sign-in."
                : "No students matched your search criteria."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStudents.map(student => {
              const lights = student.trafficLights || {};
              const greenCount = Object.values(lights).filter(t => t === 'green').length;
              const orangeCount = Object.values(lights).filter(t => t === 'orange').length;
              const redCount = Object.values(lights).filter(t => t === 'red').length;
              const totalSubtopics = allSubtopicsData.length;
              const greenPct = Math.round((greenCount / totalSubtopics) * 100);

              // Calculate average quiz score
              const quizList = Object.values(student.subtopicQuizScores || {});
              const avgQuizPct = quizList.length > 0 
                ? Math.round(quizList.reduce((acc, q) => acc + (q.percentage || 0), 0) / quizList.length)
                : null;

              return (
                <div
                  key={student.studentId}
                  onClick={() => {
                    setSelectedStudentId(student.studentId);
                    setInstructorViewMode('student-detail');
                  }}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/60 hover:shadow-xl hover:shadow-purple-950/20 transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    {/* Student Name & Tier */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition flex items-center gap-1.5">
                          <span>{student.name}</span>
                        </h3>
                        <p className="text-xs text-slate-400 font-mono truncate max-w-[200px]">
                          {student.email}
                        </p>
                      </div>
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                        student.tier === 'Core'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      }`}>
                        {student.tier || 'Extended'}
                      </span>
                    </div>

                    {/* Class badge */}
                    {student.className && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <GraduationCap className="w-3.5 h-3.5 text-purple-400" />
                        <span className="truncate">{student.className}</span>
                        <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-purple-300">
                          {student.classCode}
                        </span>
                      </div>
                    )}

                    {/* Live Slide Decks & Syllabus % Stats */}
                    <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                      <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between">
                        <span className="text-slate-400 text-[11px] flex items-center gap-1">
                          <BookOpen className="w-3 h-3 text-emerald-400" />
                          <span>Slide Decks:</span>
                        </span>
                        <span className="font-mono font-bold text-emerald-400">
                          {student.completedLessonsCount || 0} / {totalSubtopics}
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between">
                        <span className="text-slate-400 text-[11px] flex items-center gap-1">
                          <GraduationCap className="w-3 h-3 text-sky-400" />
                          <span>Syllabus:</span>
                        </span>
                        <span className="font-mono font-bold text-sky-400">
                          {Math.min(100, Math.round(((student.completedLessonsCount || 0) / totalSubtopics) * 100))}%
                        </span>
                      </div>
                    </div>

                    {/* Green Mastery Bar */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-300 flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Green Mastery:</span>
                        </span>
                        <span className="font-mono font-bold text-emerald-400">
                          {greenCount} / {totalSubtopics} ({greenPct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                          style={{ width: `${greenPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Traffic light counts summary */}
                    <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                      <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold">
                        <div>{greenCount}</div>
                        <div className="text-[10px] text-emerald-400/80 font-sans font-semibold">Green</div>
                      </div>
                      <div className="p-2 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold">
                        <div>{orangeCount}</div>
                        <div className="text-[10px] text-amber-400/80 font-sans font-semibold">Amber/Orange</div>
                      </div>
                      <div className="p-2 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs font-mono font-bold">
                        <div>{redCount}</div>
                        <div className="text-[10px] text-rose-400/80 font-sans font-semibold">Red</div>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Quiz average & inspect button */}
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                    <div className="text-slate-400">
                      {avgQuizPct !== null ? (
                        <span>Quiz Avg: <strong className="text-white font-mono">{avgQuizPct}%</strong></span>
                      ) : (
                        <span className="text-slate-500 italic">No quizzes yet</span>
                      )}
                    </div>

                    <button
                      type="button"
                      className="flex items-center gap-1 font-bold text-purple-400 group-hover:text-purple-300 transition"
                    >
                      <span>View Progress</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ==============================================================
  // DETAILED PROGRESS VIEW (Single Student or Personal Progress)
  // ==============================================================
  return (
    <div className="space-y-8">
      {/* If Instructor Viewing an Individual Student: Top Sticky Banner */}
      {isInstructor && selectedStudent && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-950/90 to-slate-900 border border-purple-500/40 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setInstructorViewMode('roster')}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5 text-xs font-bold cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to All Students</span>
            </button>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300">
                  Student Detailed View
                </span>
                <span className="text-[11px] px-2 py-0.2 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {selectedStudent.className || 'Combined Science'}
                </span>
              </div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <span>{selectedStudent.name}</span>
                <span className="text-xs text-slate-400 font-mono font-normal">({selectedStudent.email})</span>
              </h2>
            </div>
          </div>

          {/* Quick Student Switcher Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Switch:</span>
            <select
              value={selectedStudent.studentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-purple-500/40 text-xs font-bold text-white focus:outline-none focus:border-purple-400 cursor-pointer"
            >
              {allCohortStudents.map(st => (
                <option key={st.studentId} value={st.studentId}>
                  {st.name} ({st.tier || 'Extended'})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Top Welcome & Milestone Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-mono px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {isInstructor && selectedStudent ? selectedStudent.tier : user.tier} Tier Candidate
              </span>
              {(isInstructor && selectedStudent ? selectedStudent.joinedAt : user.examDate) && (
                <span className="text-xs text-slate-400 font-medium">
                  {isInstructor && selectedStudent 
                    ? `Enrolled: ${new Date(selectedStudent.joinedAt).toLocaleDateString()}` 
                    : `Target Exam: ${user.examDate}`}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {isInstructor && selectedStudent ? `${selectedStudent.name}'s` : `${user.name}'s`} Curriculum Mastery & Traffic Light Tracker
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
              Track traffic light rankings across all {stats.total} subtopics in Biology, Chemistry, and Physics. 
              Earn <span className="text-emerald-400 font-bold">Green status</span> by scoring ≥80% on each subtopic's 10-Question Knowledge Check.
            </p>

            {!isInstructor && (
              <div className="pt-2 flex flex-wrap items-center gap-2">
                {onNavigateToProfile && (
                  <button
                    onClick={onNavigateToProfile}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs transition shadow-xs"
                  >
                    <User className="w-3.5 h-3.5 text-emerald-400" />
                    <span>My Profile & Recent Activity</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}

                {onNavigateToLeaderboard && (
                  <button
                    onClick={onNavigateToLeaderboard}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-bold text-xs transition shadow-xs"
                  >
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    <span>Compare Rank in Class Leaderboard</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Live Progress Gauges: Slide Decks, Syllabus %, Green Mastery */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Slide Deck Completion */}
            <div className="flex items-center gap-3 bg-slate-950/70 px-4 py-3 rounded-xl border border-slate-800 min-w-[170px]">
              <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400 shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Slide Decks Read</div>
                <div className="text-sm font-bold text-white font-mono mt-0.5">
                  {completedDecksCount} / {stats.total} <span className="text-emerald-400 text-xs font-semibold">({slideDeckPct}%)</span>
                </div>
                <div className="w-24 bg-slate-800 h-1.5 rounded-full mt-1 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-300" style={{ width: `${slideDeckPct}%` }} />
                </div>
              </div>
            </div>

            {/* Syllabus % Coverage */}
            <div className="flex items-center gap-3 bg-slate-950/70 px-4 py-3 rounded-xl border border-slate-800 min-w-[170px]">
              <div className="p-2 rounded-lg bg-sky-500/15 text-sky-400 shrink-0">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Syllabus Covered</div>
                <div className="text-sm font-bold text-white font-mono mt-0.5">
                  {syllabusPct}% <span className="text-slate-400 text-xs font-normal">({syllabusCoveredCount}/{stats.total})</span>
                </div>
                <div className="w-24 bg-slate-800 h-1.5 rounded-full mt-1 overflow-hidden">
                  <div className="h-full bg-sky-500 rounded-full transition-all duration-300" style={{ width: `${syllabusPct}%` }} />
                </div>
              </div>
            </div>

            {/* Traffic Light Mastery Circular Gauge */}
            <div className="flex items-center gap-3 bg-slate-950/70 px-4 py-3 rounded-xl border border-slate-800 shrink-0">
              <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-800"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-emerald-500 transition-all duration-500"
                    strokeDasharray={`${stats.masteryPct}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute text-xs font-bold text-white font-mono">{stats.masteryPct}%</span>
              </div>
              <div>
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Green Mastery</div>
                <div className="text-sm font-bold text-white mt-0.5">{stats.green} of {stats.total}</div>
                <div className="text-[10px] text-emerald-400 font-medium mt-0.5 flex items-center gap-1">
                  <Flame className="w-3 h-3" />
                  <span>≥80% certified</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Traffic Light Summary Cards (Green, Orange, Red, Unranked) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          {/* GREEN CARD */}
          <div 
            onClick={() => setTrafficFilter(trafficFilter === 'green' ? 'all' : 'green')}
            className={`p-3.5 rounded-xl border cursor-pointer transition ${
              trafficFilter === 'green'
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/30'
                : 'bg-slate-950/60 border-slate-800 hover:border-emerald-500/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>Green (≥80%)</span>
              </span>
              <span className="text-lg font-mono font-bold text-white">{stats.green}</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Mastered & certified</p>
          </div>

          {/* ORANGE CARD */}
          <div 
            onClick={() => setTrafficFilter(trafficFilter === 'orange' ? 'all' : 'orange')}
            className={`p-3.5 rounded-xl border cursor-pointer transition ${
              trafficFilter === 'orange'
                ? 'bg-amber-500/20 border-amber-500 text-amber-300 ring-2 ring-amber-500/30'
                : 'bg-slate-950/60 border-slate-800 hover:border-amber-500/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span>Amber / Orange (50%, 60%, 70%)</span>
              </span>
              <span className="text-lg font-mono font-bold text-white">{stats.orange}</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Solid foundation · Review for Green</p>
          </div>

          {/* RED CARD */}
          <div 
            onClick={() => setTrafficFilter(trafficFilter === 'red' ? 'all' : 'red')}
            className={`p-3.5 rounded-xl border cursor-pointer transition ${
              trafficFilter === 'red'
                ? 'bg-rose-500/20 border-rose-500 text-rose-300 ring-2 ring-rose-500/30'
                : 'bg-slate-950/60 border-slate-800 hover:border-rose-500/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span>Red (40% or less)</span>
              </span>
              <span className="text-lg font-mono font-bold text-white">{stats.red}</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Priority focus · Review lesson slides</p>
          </div>

          {/* UNRANKED CARD */}
          <div 
            onClick={() => setTrafficFilter('all')}
            className={`p-3.5 rounded-xl border cursor-pointer transition ${
              trafficFilter === 'all'
                ? 'bg-slate-800 border-slate-600 ring-2 ring-slate-500/30'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-600"></span>
                <span>All Subtopics</span>
              </span>
              <span className="text-lg font-mono font-bold text-white">{stats.total}</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Complete syllabus</p>
          </div>
        </div>
      </div>

      {/* View Mode Navigation Tabs: Trends | Curriculum Mastery | Confidence Matrix | All Views */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-2.5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setTrackerTab('trends')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
              trackerTab === 'trends'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-950/40 ring-1 ring-emerald-400/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-emerald-300" />
            <span>Performance Trends</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-500/30 font-mono">
              Recharts
            </span>
          </button>

          <button
            onClick={() => setTrackerTab('curriculum')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
              trackerTab === 'curriculum'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-950/40 ring-1 ring-emerald-400/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-sky-400" />
            <span>Curriculum Mastery ({stats.total})</span>
          </button>

          <button
            onClick={() => setTrackerTab('confidence')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
              trackerTab === 'confidence'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-950/40 ring-1 ring-emerald-400/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Star className="w-4 h-4 text-amber-400" />
            <span>Confidence Matrix</span>
          </button>

          <button
            onClick={() => setTrackerTab('all')}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
              trackerTab === 'all'
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>All Views</span>
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400 shrink-0 self-end sm:self-auto px-2">
          {studentQuizTrendData.length === 0 && (
            <button
              onClick={() => setShowBenchmarkComparison(prev => !prev)}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition cursor-pointer flex items-center gap-1.5 ${
                showBenchmarkComparison 
                  ? 'bg-purple-500/20 border-purple-500/40 text-purple-300' 
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>{showBenchmarkComparison ? 'Hide Benchmark Curve' : 'Preview Benchmark Curve'}</span>
            </button>
          )}
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>{studentQuizTrendData.length} Real Quizzes</span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 1. PERFORMANCE TRENDS VIEW (Recharts Quiz Progression)         */}
      {/* ============================================================== */}
      {(trackerTab === 'trends' || trackerTab === 'all') && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 space-y-6 shadow-sm">
          {/* Header & Subject Filter Tabs */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[11px] uppercase font-bold px-2 py-0.5 rounded-full border ${subjectChartTheme.badgeClass}`}>
                  {subjectChartTheme.name}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  IGCSE 0653 Progression
                </span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2 mt-1">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <span>Performance Trends & Score Progression</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                Plotting quiz score trajectories across revision sessions. The dashed green line indicates the Cambridge 80% Green Mastery benchmark.
              </p>
            </div>

            {/* Subject Selector Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 shrink-0 overflow-x-auto">
              <button
                onClick={() => setTrendsSubject('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
                  trendsSubject === 'all'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All Sciences
              </button>
              <button
                onClick={() => setTrendsSubject('biology')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  trendsSubject === 'biology'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Biology</span>
              </button>
              <button
                onClick={() => setTrendsSubject('chemistry')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  trendsSubject === 'chemistry'
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                <span>Chemistry</span>
              </button>
              <button
                onClick={() => setTrendsSubject('physics')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  trendsSubject === 'physics'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                <span>Physics</span>
              </button>
            </div>
          </div>

          {/* 5 KPI Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {/* 1. Average Score */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Average Score</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono text-white">
                  {trendStats.count > 0 ? `${trendStats.avg}%` : '—'}
                </span>
                {trendStats.count > 0 && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                    trendStats.avg >= 80 
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                      : trendStats.avg >= 50
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  }`}>
                    {trendStats.avg >= 80 ? 'Mastery' : trendStats.avg >= 50 ? 'Solid' : 'Focus'}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-500 mt-1 truncate">Mean across {trendStats.count} attempts</p>
            </div>

            {/* 2. Latest Score */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Latest Score</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono text-white">
                  {trendStats.count > 0 ? `${trendStats.latest}%` : '—'}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {trendStats.count > 0 ? `(${Math.round(trendStats.latest / 10)}/10)` : ''}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1 truncate">Most recent subtopic quiz</p>
            </div>

            {/* 3. Highest Score */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Highest Score</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono text-amber-400 flex items-center gap-1">
                  <span>{trendStats.count > 0 ? `${trendStats.highest}%` : '—'}</span>
                  {trendStats.highest === 100 && <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1 truncate">Peak knowledge check</p>
            </div>

            {/* 4. Green Mastery Certified */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">≥80% Green Passed</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono text-emerald-400">
                  {trendStats.masteryCount}
                </span>
                <span className="text-xs text-slate-400 font-mono">/ {trendStats.count} ({trendStats.masteryRate}%)</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1 truncate">Certified green subtopics</p>
            </div>

            {/* 5. Score Progression Delta */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between col-span-2 sm:col-span-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Progression Delta</span>
              <div className="mt-2 flex items-center gap-1.5">
                {trendStats.count >= 2 ? (
                  <>
                    {trendStats.isImproving ? (
                      <TrendingUp className="w-5 h-5 text-emerald-400 shrink-0" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-rose-400 shrink-0" />
                    )}
                    <span className={`text-2xl font-black font-mono ${trendStats.isImproving ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {trendStats.delta >= 0 ? `+${trendStats.delta}%` : `${trendStats.delta}%`}
                    </span>
                  </>
                ) : (
                  <span className="text-2xl font-black font-mono text-slate-400">—</span>
                )}
              </div>
              <p className="text-[10px] text-slate-500 mt-1 truncate">Latest vs baseline score</p>
            </div>
          </div>

          {/* Benchmark Notice Banner if viewing sample benchmark */}
          {currentTrendDataset.some(d => d.isSample) && (
            <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/40 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-purple-200">
                <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
                <span>
                  <strong>Sample Progression Benchmark Active:</strong> Demonstrating realistic 8-quiz score growth curve across {subjectChartTheme.name}. Take any quiz in the curriculum to plot your personal live data!
                </span>
              </div>
              <button
                onClick={() => setShowBenchmarkComparison(false)}
                className="px-2.5 py-1 rounded-lg bg-purple-900/60 hover:bg-purple-800 text-purple-200 font-bold transition text-[11px] shrink-0 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Recharts Area / Line Chart Container */}
          {currentTrendDataset.length === 0 ? (
            <div className="p-10 rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center mx-auto text-slate-400">
                <Activity className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">No Quizzes Recorded Yet for {subjectChartTheme.name}</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Take your first subtopic knowledge check in {subjectChartTheme.name} to start plotting your performance trajectory, rolling average, and mastery status!
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setShowBenchmarkComparison(true)}
                  className="px-4 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/40 border border-purple-500/50 text-purple-200 font-bold text-xs transition flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Sparkles className="w-4 h-4 text-purple-300" />
                  <span>Preview Sample Benchmark Curve</span>
                </button>
                <button
                  onClick={() => {
                    const firstCode = trendsSubject === 'chemistry' ? 'C1.1' : trendsSubject === 'physics' ? 'P1.1' : 'B1.1';
                    onNavigateToTopic(firstCode);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Start First Quiz ({trendsSubject === 'chemistry' ? 'C1.1' : trendsSubject === 'physics' ? 'P1.1' : 'B1.1'})</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Chronological Score Trajectory ({currentTrendDataset.length} Points)</span>
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: subjectChartTheme.stroke }} />
                    <span>Score (%)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 border-t border-dashed" style={{ borderColor: subjectChartTheme.movingAvgStroke, borderWidth: '2px' }} />
                    <span>Rolling 3-Quiz Avg</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                    <span className="w-3 h-0.5 border-t border-dashed border-emerald-500" style={{ borderWidth: '2px' }} />
                    <span>≥80% Green Target</span>
                  </div>
                </div>
              </div>

              {/* Responsive Container wrapping AreaChart */}
              <div className="w-full h-[320px] pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={currentTrendDataset}
                    margin={{ top: 15, right: 25, left: -10, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient id="trendScoreGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={subjectChartTheme.fillStart} stopOpacity={0.35} />
                        <stop offset="95%" stopColor={subjectChartTheme.fillStop} stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.35} vertical={false} />
                    <XAxis 
                      dataKey="displayLabel" 
                      stroke="#64748b" 
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      tickLine={{ stroke: '#475569' }}
                    />
                    <YAxis 
                      domain={[0, 100]} 
                      stroke="#64748b" 
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      tickLine={{ stroke: '#475569' }}
                      tickFormatter={(v) => `${v}%`}
                      ticks={[0, 20, 40, 60, 80, 100]}
                    />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const item = payload[0].payload;
                          if (!item) return null;
                          const isGreen = item.percentage >= 80;
                          const isAmber = item.percentage >= 50 && item.percentage < 80;

                          return (
                            <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700 p-3.5 rounded-xl shadow-2xl text-xs space-y-2 z-50 min-w-[220px]">
                              <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
                                <span className="font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                                  {item.subtopicCode}
                                </span>
                                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                                  {item.subject}
                                </span>
                              </div>
                              <div className="font-semibold text-white text-xs leading-snug">
                                {item.title}
                              </div>
                              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-slate-500" />
                                <span>{item.formattedDate}</span>
                                {item.isSample && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-mono">
                                    Sample Benchmark
                                  </span>
                                )}
                              </div>
                              <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between">
                                <span className="text-slate-400">Score:</span>
                                <span className="font-mono font-bold text-white text-sm">
                                  {item.score}/{item.total} <span className={isGreen ? 'text-emerald-400' : isAmber ? 'text-amber-400' : 'text-rose-400'}>({item.percentage}%)</span>
                                </span>
                              </div>
                              {item.movingAvg !== undefined && (
                                <div className="flex items-center justify-between text-[11px] text-slate-400">
                                  <span>Rolling 3-Quiz Avg:</span>
                                  <span className="font-mono font-bold text-sky-400">{item.movingAvg}%</span>
                                </div>
                              )}
                              <div className="pt-1">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                  isGreen
                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                    : isAmber
                                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                    : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                }`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${
                                    isGreen ? 'bg-emerald-400' : isAmber ? 'bg-amber-400' : 'bg-rose-400'
                                  }`} />
                                  {isGreen ? 'Green Mastery (≥80%)' : isAmber ? 'Amber (50-70%)' : 'Red Priority (≤40%)'}
                                </span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <ReferenceLine 
                      y={80} 
                      stroke="#10b981" 
                      strokeDasharray="4 4" 
                      strokeWidth={1.5}
                      label={{ value: '80% Target', fill: '#10b981', fontSize: 10, position: 'insideTopRight' }}
                    />
                    <ReferenceLine 
                      y={50} 
                      stroke="#f59e0b" 
                      strokeDasharray="3 3" 
                      strokeWidth={1}
                      label={{ value: '50% Amber', fill: '#f59e0b', fontSize: 9, position: 'insideBottomRight' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="percentage"
                      name="Score (%)"
                      stroke={subjectChartTheme.stroke}
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#trendScoreGradient)"
                      activeDot={{ r: 6, fill: subjectChartTheme.stroke, stroke: '#ffffff', strokeWidth: 2 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="movingAvg"
                      name="Rolling Average"
                      stroke={subjectChartTheme.movingAvgStroke}
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Chronological Quiz Progression Log Table */}
          {currentTrendDataset.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <History className="w-4 h-4 text-emerald-400" />
                  <span>Detailed Quiz History & Subtopic Logs</span>
                </h3>
                <span className="text-xs text-slate-400">
                  Showing {currentTrendDataset.length} chronologically logged attempts
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Subject</th>
                      <th className="py-2.5 px-3">Subtopic</th>
                      <th className="py-2.5 px-3">Score</th>
                      <th className="py-2.5 px-3">Mastery Status</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {currentTrendDataset.map((item, idx) => {
                      const isGreen = item.percentage >= 80;
                      const isAmber = item.percentage >= 50 && item.percentage < 80;

                      return (
                        <tr key={`${item.subtopicCode}-${idx}`} className="hover:bg-slate-900/40 transition">
                          <td className="py-2.5 px-3 font-mono text-slate-500 font-bold">
                            {idx + 1}
                          </td>
                          <td className="py-2.5 px-3 text-slate-300 font-medium whitespace-nowrap">
                            {item.formattedDate}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="capitalize text-[11px] font-semibold text-slate-300">
                              {item.subject}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-2 max-w-md">
                              <span className="font-mono text-[11px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-emerald-400 border border-slate-700 shrink-0">
                                {item.subtopicCode}
                              </span>
                              <span className="text-white font-medium truncate">{item.title}</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap font-mono font-bold">
                            <span className="text-white">{item.score}/{item.total}</span>
                            <span className={`ml-1.5 text-xs ${isGreen ? 'text-emerald-400' : isAmber ? 'text-amber-400' : 'text-rose-400'}`}>
                              ({item.percentage}%)
                            </span>
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              isGreen
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                : isAmber
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${isGreen ? 'bg-emerald-400' : isAmber ? 'bg-amber-400' : 'bg-rose-400'}`} />
                              <span>{isGreen ? 'Green' : isAmber ? 'Amber' : 'Red'}</span>
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right whitespace-nowrap">
                            <button
                              onClick={() => onNavigateToTopic(item.subtopicCode)}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px] transition inline-flex items-center gap-1 cursor-pointer"
                            >
                              <span>Review</span>
                              <ChevronRight className="w-3.5 h-3.5 text-emerald-400" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. SUBJECT MASTERY BREAKDOWN TABS (Curriculum Grid)            */}
      {/* ============================================================== */}
      {(trackerTab === 'curriculum' || trackerTab === 'all') && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-400" />
                <span>Syllabus Subtopic Breakdown</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Review individual subtopic ratings. Click on any subtopic to view its lesson slides.
              </p>
            </div>

            {/* Subject Switcher Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 shrink-0">
              {(['all', 'biology', 'chemistry', 'physics'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition cursor-pointer ${
                    activeCategory === cat
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Subtopic Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {displayedSubtopics.map(sub => {
              const status = trafficLights[sub.subtopicCode];
              const quizResult = quizScores[sub.subtopicCode];

              let badgeColor = 'bg-slate-800 text-slate-400 border-slate-700';
              let dotColor = 'bg-slate-600';
              if (status === 'green') {
                badgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
                dotColor = 'bg-emerald-500';
              } else if (status === 'orange') {
                badgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
                dotColor = 'bg-amber-500';
              } else if (status === 'red') {
                badgeColor = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
                dotColor = 'bg-rose-500';
              }

              return (
                <div
                  key={sub.subtopicCode}
                  className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition flex items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                        {sub.subtopicCode}
                      </span>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${badgeColor}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
                        <span>{status || 'Unranked'}</span>
                      </span>
                      {quizResult && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                          Quiz: {quizResult.score}/10 ({quizResult.percentage}%)
                        </span>
                      )}
                      {completedLessons.includes(sub.subtopicCode) && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                          <span>Deck Read</span>
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-white truncate">{sub.title}</h3>
                  </div>

                  <button
                    onClick={() => onNavigateToTopic(sub.subtopicCode)}
                    title="Open lesson slides and quiz for this subtopic"
                    className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition shrink-0 flex items-center gap-1 text-xs font-medium cursor-pointer"
                  >
                    <span className="hidden sm:inline">Slides</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. TOPIC CONFIDENCE MATRIX (Syllabus Units)                    */}
      {/* ============================================================== */}
      {(trackerTab === 'confidence' || trackerTab === 'all') && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400" />
                <span>Syllabus Unit Confidence Ratings</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Star ratings automatically feed into the AI Revision Schedule and Recommendations.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredSyllabusItems.map(item => {
              const currentRating = activeProgress.topicConfidence[item.code] || 3;

              return (
                <div 
                  key={item.code}
                  className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between gap-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                          {item.code}
                        </span>
                        <span className="text-xs capitalize text-slate-400 font-medium">
                          {item.subject}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-white leading-snug">{item.title}</h3>
                    </div>

                    <button
                      onClick={() => onNavigateToTopic(item.code)}
                      title="Open lesson slides for this topic"
                      className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                    <span className="text-[11px] text-slate-400">Confidence Level:</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map(starVal => (
                        <button
                          key={starVal}
                          disabled={isInstructor && !!selectedStudent}
                          onClick={() => onUpdateConfidence(item.code, starVal)}
                          className={`p-1 transition ${
                            starVal <= currentRating
                              ? 'text-amber-400 hover:text-amber-300'
                              : 'text-slate-700 hover:text-slate-500'
                          }`}
                        >
                          <Star className="w-4 h-4 fill-current" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
