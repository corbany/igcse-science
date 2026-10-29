import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calendar, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  RefreshCw, 
  FileDown, 
  BookOpen,
  Check,
  Search,
  Filter,
  CheckSquare,
  Square,
  AlertCircle,
  Brain,
  Sliders,
  ChevronRight,
  ChevronLeft,
  TrendingUp,
  Target,
  Minus,
  Plus,
  Layers,
  CalendarDays,
  Flame,
  Award,
  ShieldCheck,
  FlaskConical,
  MessageSquare,
  Palette,
  ExternalLink,
  HelpCircle,
  FileText,
  BarChart3
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid
} from 'recharts';
import { RevisionScheduleItem, UserProfile, StudentProgress, ScienceSubject } from '../types';
import { ALL_SYLLABUS_TOPICS, SyllabusTopicOption } from '../services/quizService';
import { getRevisionTasksForTopic, detectTaskAction, TOPIC_REVISION_CONFIGS } from '../data/revisionScheduleTasks';

interface RevisionScheduleProps {
  user: UserProfile;
  weakTopics: string[];
  progress?: StudentProgress;
  onOpenLesson: (topicCode: string) => void;
  onNavigateToQuiz?: (topicCode?: string) => void;
  onAskAITutor?: (query: string, topicCode?: string) => void;
  onNavigateToExams?: () => void;
  onNavigateToNotebook?: () => void;
  onNavigateToGuidelines?: () => void;
}

type TopicSelectionMode = 'analysed_needs' | 'custom_topics';

const STORAGE_KEY_SCHEDULE_STATE = 'cambridge_0653_revision_schedule_state';

export const RevisionSchedule: React.FC<RevisionScheduleProps> = ({
  user,
  weakTopics,
  progress,
  onOpenLesson,
  onNavigateToQuiz,
  onAskAITutor,
  onNavigateToExams,
  onNavigateToNotebook,
  onNavigateToGuidelines
}) => {
  // Load saved preference or defaults
  const savedState = useMemo(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_SCHEDULE_STATE);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  // Initialize exam date: ensure future date so multi-week schedule is active
  const [examDate, setExamDate] = useState<string>(() => {
    const now = new Date();
    if (savedState?.examDate) {
      const saved = new Date(savedState.examDate);
      if (saved > now) return savedState.examDate;
    }
    if (user.examDate) {
      const userDate = new Date(user.examDate);
      if (userDate > now) return user.examDate;
    }
    // Default to 6 weeks from today
    const defaultFuture = new Date(now.getTime() + 6 * 7 * 24 * 60 * 60 * 1000);
    return defaultFuture.toISOString().split('T')[0];
  });
  
  // Weekly Study Target: strictly selectable between 1.0 and 20.0 hours
  const [weeklyHours, setWeeklyHours] = useState<number>(() => {
    const raw = savedState?.weeklyHours ?? 10.0;
    return Math.min(20, Math.max(1, Number(raw) || 10));
  });
  const [studyDaysPerWeek, setStudyDaysPerWeek] = useState<number>(savedState?.studyDaysPerWeek ?? 7);

  const handleUpdateWeeklyHours = (val: number) => {
    if (isNaN(val)) return;
    const clamped = Math.min(20, Math.max(1, Math.round(val * 2) / 2));
    setWeeklyHours(clamped);
  };

  // Topic Selection Mode: 'analysed_needs' vs 'custom_topics'
  const [selectionMode, setSelectionMode] = useState<TopicSelectionMode>(savedState?.selectionMode || 'analysed_needs');
  
  // Custom topic selection state
  const [selectedTopicCodes, setSelectedTopicCodes] = useState<string[]>(
    savedState?.selectedTopicCodes || ['B2', 'B5', 'C4', 'C7', 'P1', 'P4']
  );
  const [topicFilterSubject, setTopicFilterSubject] = useState<'all' | ScienceSubject>('all');
  const [topicSearchQuery, setTopicSearchQuery] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>(savedState?.completedTasks || {});
  const [activeWeekTab, setActiveWeekTab] = useState<number | 'all'>(1);
  const [chartSelectedWeek, setChartSelectedWeek] = useState<number | 'aggregate'>(1);

  // Sync consistency chart selected week when student switches activeWeekTab to a specific week
  useEffect(() => {
    if (typeof activeWeekTab === 'number') {
      setChartSelectedWeek(activeWeekTab);
    }
  }, [activeWeekTab]);

  // Derived Daily Pace Calculation from Weekly Study Target
  const calculatedDailyHours = useMemo(() => {
    return Number((weeklyHours / studyDaysPerWeek).toFixed(1));
  }, [weeklyHours, studyDaysPerWeek]);

  const calculatedSessionMinutes = useMemo(() => {
    return Math.round((weeklyHours * 60) / studyDaysPerWeek);
  }, [weeklyHours, studyDaysPerWeek]);

  // Days until target exam date
  const daysUntilExam = useMemo(() => {
    if (!examDate) return null;
    const target = new Date(examDate);
    const now = new Date();
    const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }, [examDate]);

  // Number of weeks leading up to exam date (1 to 26 weeks)
  const weeksUntilExam = useMemo(() => {
    if (daysUntilExam === null || daysUntilExam === 0) return 4;
    return Math.max(1, Math.min(26, Math.ceil(daysUntilExam / 7)));
  }, [daysUntilExam]);

  // Comprehensive Analysed Needs Detection from student performance
  const analysedNeeds = useMemo(() => {
    const list: { code: string; title: string; subject: ScienceSubject; reason: string; priority: 'high' | 'medium' }[] = [];

    // 1. Weak topics from confidence <= 2
    if (progress?.topicConfidence) {
      Object.entries(progress.topicConfidence).forEach(([code, rating]) => {
        if (rating <= 2) {
          const topic = ALL_SYLLABUS_TOPICS.find(t => t.code === code);
          list.push({
            code,
            title: topic?.title || code,
            subject: topic?.subject || 'biology',
            reason: `Confidence rated ${rating}/5 stars in self-assessment`,
            priority: 'high'
          });
        }
      });
    }

    // 2. Weak topics from quiz accuracy (< 65%)
    if (progress?.quizScores) {
      Object.entries(progress.quizScores).forEach(([code, data]) => {
        const pct = data.total > 0 ? (data.score / data.total) * 100 : 0;
        if (pct < 65 && !list.some(item => item.code === code)) {
          const topic = ALL_SYLLABUS_TOPICS.find(t => t.code === code);
          list.push({
            code,
            title: topic?.title || code,
            subject: topic?.subject || 'chemistry',
            reason: `Quiz accuracy at ${Math.round(pct)}% (target ≥ 75%)`,
            priority: pct < 50 ? 'high' : 'medium'
          });
        }
      });
    }

    // 3. Weak topics from red/orange traffic lights
    if (progress?.trafficLights) {
      Object.entries(progress.trafficLights).forEach(([subCode, status]) => {
        if (status === 'red' || status === 'orange') {
          const parentCode = subCode.split('.')[0];
          if (!list.some(item => item.code === parentCode)) {
            const topic = ALL_SYLLABUS_TOPICS.find(t => t.code === parentCode);
            list.push({
              code: parentCode,
              title: topic?.title || parentCode,
              subject: topic?.subject || 'physics',
              reason: `Subtopic ${subCode} marked as ${status.toUpperCase()} in diagnostic traffic lights`,
              priority: status === 'red' ? 'high' : 'medium'
            });
          }
        }
      });
    }

    // 3. Weak topics explicitly passed
    weakTopics.forEach(code => {
      if (!list.some(item => item.code === code)) {
        const topic = ALL_SYLLABUS_TOPICS.find(t => t.code === code);
        list.push({
          code,
          title: topic?.title || code,
          subject: topic?.subject || 'physics',
          reason: 'Identified as focus area during recent practice sessions',
          priority: 'high'
        });
      }
    });

    // 4. If student has few or no low ratings, recommend foundational Cambridge 0653 benchmark topics
    if (list.length < 4) {
      const benchmarkTopics = [
        { code: 'B5', title: 'Enzymes & Denaturation', subject: 'biology' as ScienceSubject, reason: 'High-frequency Paper 4 Extended concept' },
        { code: 'C4', title: 'Electrochemistry & Electrolysis', subject: 'chemistry' as ScienceSubject, reason: 'Core ionic half-equation topic' },
        { code: 'P4', title: 'Electricity Circuits & Resistance', subject: 'physics' as ScienceSubject, reason: 'Fundamental parallel circuit calculations' },
        { code: 'C7', title: 'Acids, Bases & Salt Preparation', subject: 'chemistry' as ScienceSubject, reason: 'Essential experimental analysis method' },
        { code: 'B3', title: 'Movement In & Out of Cells', subject: 'biology' as ScienceSubject, reason: 'Osmosis & active transport definitions' },
        { code: 'P1', title: 'Motion, Forces & Energy', subject: 'physics' as ScienceSubject, reason: 'Speed-time gradient & resultant F=ma' }
      ];

      for (const b of benchmarkTopics) {
        if (!list.some(item => item.code === b.code)) {
          list.push({
            ...b,
            priority: 'medium'
          });
          if (list.length >= 6) break;
        }
      }
    }

    return list;
  }, [progress, weakTopics]);

  // Client-side multi-week schedule generator helper
  const generateMultiWeekFallback = (
    weeks: number, 
    hours: number, 
    daysCount: number, 
    mode: TopicSelectionMode,
    customCodes: string[],
    weakList: { code: string; title: string; subject: ScienceSubject }[]
  ): { items: RevisionScheduleItem[]; weeklyPlan: any[] } => {
    const sessionMins = Math.min(240, Math.max(10, Math.round((hours * 60) / daysCount)));
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].slice(0, daysCount);
    const items: RevisionScheduleItem[] = [];
    const plan: any[] = [];

    const defaultThemes = [
      { title: 'Core Diagnostic Foundations & High-Yield Principles', topics: ['B5', 'C4', 'P1', 'C7'] },
      { title: 'Chemical Energetics, Bonding & Stoichiometry', topics: ['C1', 'C2', 'C3', 'C5', 'C6'] },
      { title: 'Cellular Biology, Osmosis & Plant Physiology', topics: ['B1', 'B2', 'B3', 'B4', 'B6'] },
      { title: 'Motion, Forces, Work & Thermal Energy Systems', topics: ['P1', 'P2', 'P4'] },
      { title: 'Reactivity Series, Acids, Salts & Environment', topics: ['C7', 'C8', 'C9', 'C10', 'C11'] },
      { title: 'Human Biology, Circulation, Respiration & Coordination', topics: ['B7', 'B8', 'B9', 'B11', 'B12', 'B13'] },
      { title: 'Electricity Circuits, Waves & Nuclear Physics', topics: ['P3', 'P4', 'P5', 'C12'] },
      { title: 'Ecosystems, Genetics & Experimental Practical Skills', topics: ['B14', 'B15', 'B16', 'C12'] },
      { title: 'Cross-Paper Synthesis & Extended Problem-Solving Drill', topics: ['B5', 'C4', 'P4', 'C7', 'P1'] },
      { title: 'Timed Mock Rehearsal & Diagnostic Error Log Remediation', topics: ['C3', 'P1', 'B9', 'C9', 'P4'] },
      { title: 'Cambridge Examiner Traps & Qualitative Analysis Sprint', topics: ['C12', 'B11', 'P3', 'C5', 'B3'] },
      { title: 'Final High-Velocity Revision Sprint & Formula Consolidation', topics: ['P1', 'P4', 'C4', 'B5', 'C3'] }
    ];

    const sourceTopics = mode === 'custom_topics' && customCodes.length > 0
      ? customCodes
      : (weakList.length > 0 ? weakList.map(w => w.code) : ['B5', 'C4', 'P1', 'C7', 'P4', 'B2']);

    for (let w = 1; w <= weeks; w++) {
      let weekTopics: string[];
      let weekTheme: string;

      if (mode === 'custom_topics') {
        const offset = ((w - 1) * 2) % sourceTopics.length;
        weekTopics = [];
        for (let i = 0; i < Math.min(sourceTopics.length, 4); i++) {
          weekTopics.push(sourceTopics[(offset + i) % sourceTopics.length]);
        }
        if (weekTopics.length === 0) weekTopics = sourceTopics;
        weekTheme = w === weeks
          ? `Final Mastery Sprint for Selected Topics: ${weekTopics.slice(0, 3).join(', ')}`
          : `Targeted Revision for Selected Topics: ${weekTopics.slice(0, 3).join(', ')}`;
      } else {
        const preset = defaultThemes[(w - 1) % defaultThemes.length];
        weekTopics = w === 1 && sourceTopics.length > 0
          ? Array.from(new Set([...sourceTopics.slice(0, 3), ...preset.topics]))
          : preset.topics;
        weekTheme = w === weeks
          ? `Final Comprehensive Exam Sprint & High-Yield Consolidation`
          : preset.title;
      }

      days.forEach((dayName, dIdx) => {
        const rawCode = weekTopics[dIdx % weekTopics.length] || 'B5';
        const cleanCode = (rawCode || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 3) || 'B5';
        const topicMeta = ALL_SYLLABUS_TOPICS.find(t => t.code === cleanCode) || {
          code: cleanCode,
          title: `Cambridge 0653 ${cleanCode}`,
          subject: (cleanCode.startsWith('B') ? 'biology' : cleanCode.startsWith('C') ? 'chemistry' : 'physics') as ScienceSubject,
          keyConcepts: 'Core syllabus revision points'
        };

        // Task 1: Specific slides recap, Tasks 2 & 3: Creative topic-relevant follow-ups
        const tasks = getRevisionTasksForTopic(cleanCode, w, weeks);

        items.push({
          id: `w${w}-d${dIdx + 1}-${cleanCode}`,
          week: w,
          day: dayName,
          date: `Week ${w} • ${dayName}`,
          subject: topicMeta.subject,
          topicCode: cleanCode,
          topicTitle: topicMeta.title,
          tasks,
          estimatedMinutes: sessionMins,
          completed: false
        });
      });

      plan.push({
        week: w,
        theme: weekTheme,
        focusTopics: weekTopics.slice(0, 4),
        goals: [
          `Master fundamental definitions and formulas for ${weekTopics.slice(0, 2).join(' & ')}`,
          `Practice Paper 2 MCQ and Paper 4 extended theory questions under timed conditions`,
          `Consolidate error notes and ensure zero repeats in test drills`
        ],
        weeklyTargetHours: hours
      });
    }

    return { items, weeklyPlan: plan };
  };

  // Normalizer to ensure Task 1 is ALWAYS specific slides recap and subsequent tasks are creative
  const normalizeScheduleItems = (rawItems: RevisionScheduleItem[], totalWks: number): RevisionScheduleItem[] => {
    return rawItems.map(item => {
      const code = (item.topicCode || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 3) || 'B2';
      const config = TOPIC_REVISION_CONFIGS[code] || TOPIC_REVISION_CONFIGS[code.slice(0, 2)];
      const defaults = getRevisionTasksForTopic(code, item.week || 1, totalWks);
      let tasks = Array.isArray(item.tasks) && item.tasks.length >= 2 ? [...item.tasks] : defaults;

      // Ensure Task 1 strictly recaps specific slides with slide numbers and key concepts
      const task0Lower = (tasks[0] || '').toLowerCase();
      if (!task0Lower.includes('slide') || !task0Lower.includes('recap') || !config || task0Lower.includes('core syllabus revision points')) {
        tasks[0] = defaults[0];
      }
      if (!tasks[1]) tasks[1] = defaults[1];
      if (!tasks[2]) tasks[2] = defaults[2];

      return {
        ...item,
        topicCode: code,
        tasks
      };
    });
  };

  // Schedule Items State: initialized across all weeks leading up to exam
  const [scheduleItems, setScheduleItems] = useState<RevisionScheduleItem[]>(() => {
    if (Array.isArray(savedState?.scheduleItems) && savedState.scheduleItems.length > 7) {
      return normalizeScheduleItems(savedState.scheduleItems, weeksUntilExam);
    }
    const generated = generateMultiWeekFallback(
      weeksUntilExam,
      weeklyHours,
      studyDaysPerWeek,
      selectionMode,
      selectedTopicCodes,
      analysedNeeds
    );
    return generated.items;
  });

  const [weeklyPlan, setWeeklyPlan] = useState<any[]>(() => {
    if (Array.isArray(savedState?.weeklyPlan) && savedState.weeklyPlan.length > 0) {
      return savedState.weeklyPlan;
    }
    const generated = generateMultiWeekFallback(
      weeksUntilExam,
      weeklyHours,
      studyDaysPerWeek,
      selectionMode,
      selectedTopicCodes,
      analysedNeeds
    );
    return generated.weeklyPlan;
  });

  const [scheduleSummary, setScheduleSummary] = useState<string>(
    savedState?.scheduleSummary || `Adaptive ${weeksUntilExam}-week masterplan allocating ${weeklyHours}h/week to Cambridge 0653 topics.`
  );

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SCHEDULE_STATE, JSON.stringify({
        examDate,
        weeklyHours,
        studyDaysPerWeek,
        selectionMode,
        selectedTopicCodes,
        completedTasks,
        scheduleSummary,
        scheduleItems,
        weeklyPlan
      }));
    } catch {}
  }, [examDate, weeklyHours, studyDaysPerWeek, selectionMode, selectedTopicCodes, completedTasks, scheduleSummary, scheduleItems, weeklyPlan]);

  // Group schedule items by week
  const weeksGrouped = useMemo(() => {
    const map = new Map<number, RevisionScheduleItem[]>();
    scheduleItems.forEach(item => {
      const w = item.week || 1;
      if (!map.has(w)) {
        map.set(w, []);
      }
      map.get(w)!.push(item);
    });

    const maxWeek = Math.max(...Array.from(map.keys()), weeksUntilExam);
    const list: { week: number; items: RevisionScheduleItem[]; theme?: string; focusTopics?: string[]; goals?: string[] }[] = [];

    for (let w = 1; w <= maxWeek; w++) {
      const weekItems = map.get(w) || [];
      const plan = weeklyPlan.find((p: any) => p.week === w);
      list.push({
        week: w,
        items: weekItems,
        theme: plan?.theme || `Week ${w} Comprehensive Revision`,
        focusTopics: plan?.focusTopics || weekItems.map(i => i.topicCode || '').filter(Boolean).slice(0, 3),
        goals: plan?.goals || [
          'Complete syllabus-aligned daily active recall revision',
          'Practice Cambridge Paper 4 structured application questions',
          'Review error log and consolidate flashcards'
        ]
      });
    }

    return list;
  }, [scheduleItems, weeklyPlan, weeksUntilExam]);

  // Filtered syllabus topics for custom selection UI
  const filteredTopics = useMemo(() => {
    return ALL_SYLLABUS_TOPICS.filter(t => {
      const matchSubj = topicFilterSubject === 'all' || t.subject === topicFilterSubject;
      const q = topicSearchQuery.trim().toLowerCase();
      const matchQuery = !q || 
        t.code.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        t.keyConcepts.toLowerCase().includes(q);
      return matchSubj && matchQuery;
    });
  }, [topicFilterSubject, topicSearchQuery]);

  // Topic toggle handler for custom selection
  const handleToggleTopic = (code: string) => {
    setSelectedTopicCodes(prev => {
      if (prev.includes(code)) {
        if (prev.length <= 1) return prev; // Keep at least one
        return prev.filter(c => c !== code);
      } else {
        return [...prev, code];
      }
    });
  };

  const handleSelectAllInSubject = (subj: ScienceSubject) => {
    const codes = ALL_SYLLABUS_TOPICS.filter(t => t.subject === subj).map(t => t.code);
    setSelectedTopicCodes(prev => Array.from(new Set([...prev, ...codes])));
  };

  const handleClearTopics = () => {
    setSelectedTopicCodes(['B2', 'C4', 'P1']);
  };

  // Quick Exam Date Preset Setter
  const handleSetExamPreset = (weeks: number) => {
    const now = new Date();
    const future = new Date(now.getTime() + weeks * 7 * 24 * 60 * 60 * 1000);
    const dateStr = future.toISOString().split('T')[0];
    setExamDate(dateStr);
  };

  // Generate Adaptive Schedule via API (multi-week for all weeks leading to exam)
  const handleGenerateSchedule = async () => {
    setIsLoading(true);
    try {
      const activeTopicsList = selectionMode === 'custom_topics'
        ? selectedTopicCodes
        : analysedNeeds.map(n => `${n.code} ${n.title}`);

      const res = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examDate,
          totalWeeks: weeksUntilExam,
          weeklyHours,
          dailyHours: calculatedDailyHours,
          studyDaysPerWeek,
          topicSelectionMode: selectionMode,
          selectedTopics: selectionMode === 'custom_topics' ? selectedTopicCodes : [],
          weaknesses: selectionMode === 'analysed_needs' ? activeTopicsList : [],
          tier: user.tier || 'Extended'
        })
      });

      const data = await res.json();
      
      const newItems = Array.isArray(data.schedule) && data.schedule.length > 0
        ? data.schedule
        : (Array.isArray(data.items) && data.items.length > 0 ? data.items : null);

      if (newItems && newItems.length > 0) {
        setScheduleItems(normalizeScheduleItems(newItems, weeksUntilExam));
      } else {
        // Fallback multi-week generation
        const generated = generateMultiWeekFallback(
          weeksUntilExam,
          weeklyHours,
          studyDaysPerWeek,
          selectionMode,
          selectedTopicCodes,
          analysedNeeds
        );
        setScheduleItems(generated.items);
        setWeeklyPlan(generated.weeklyPlan);
      }

      if (data.summary) {
        setScheduleSummary(data.summary);
      }
      if (Array.isArray(data.weeklyPlan) && data.weeklyPlan.length > 0) {
        setWeeklyPlan(data.weeklyPlan);
      }
      
      // Reset active week to 1
      setActiveWeekTab(1);
    } catch (e) {
      console.error('Failed to generate revision schedule:', e);
      // Fallback multi-week generation
      const generated = generateMultiWeekFallback(
        weeksUntilExam,
        weeklyHours,
        studyDaysPerWeek,
        selectionMode,
        selectedTopicCodes,
        analysedNeeds
      );
      setScheduleItems(generated.items);
      setWeeklyPlan(generated.weeklyPlan);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-evaluate task completion directly from student progress
  const isTaskAutoCompleted = (item: RevisionScheduleItem, tIdx: number): boolean => {
    if (!progress) return false;
    const code = (item.topicCode || '').toUpperCase();
    if (!code) return false;

    if (tIdx === 0) {
      // Task 1: Review lesson slides / key concepts
      const deckCompleted = (progress.completedLessons || []).some(l => l.toUpperCase().startsWith(code));
      const hasTrafficLight = Object.keys(progress.trafficLights || {}).some(k => k.toUpperCase().startsWith(code));
      return deckCompleted || hasTrafficLight;
    } else if (tIdx === 1) {
      // Task 2: Active recall / solve questions / re-attempt quiz
      const hasQuizScore = Object.keys(progress.subtopicQuizScores || {}).some(k => k.toUpperCase().startsWith(code));
      const hasSubjectQuiz = Boolean(item.subject && progress.quizScores && progress.quizScores[item.subject]);
      return hasQuizScore || hasSubjectQuiz;
    } else {
      // Task 3: Self-evaluate / mark scheme notes / traffic lights
      const hasGreenOrOrange = Object.entries(progress.trafficLights || {}).some(
        ([k, v]) => k.toUpperCase().startsWith(code) && (v === 'green' || v === 'orange')
      );
      const hasNote = Object.keys(progress.savedNotes || {}).some(k => k.toUpperCase().startsWith(code));
      return hasGreenOrOrange || hasNote;
    }
  };

  // Helper to determine if a task is completed (either via automated syllabus progress or manual student check-off)
  const isTaskDone = (item: RevisionScheduleItem, tIdx: number, itemIdx: number = 0): boolean => {
    const tid = `${item.id || itemIdx}-t-${tIdx}`;
    return Boolean(completedTasks[tid] || isTaskAutoCompleted(item, tIdx));
  };

  // Manual completion toggle (especially for offline creative experiments, Feynman explanations, and diagram sketches)
  const handleToggleTask = (item: RevisionScheduleItem, tIdx: number, itemIdx: number = 0) => {
    const tid = `${item.id || itemIdx}-t-${tIdx}`;
    setCompletedTasks(prev => ({
      ...prev,
      [tid]: !prev[tid]
    }));
  };

  // Total task progress and per-week stats (computed from both automated progress and verified manual tasks)
  const { overallStats, weekStatsMap } = useMemo(() => {
    let total = 0;
    let done = 0;
    const perWeek: Record<number, { total: number; done: number; pct: number }> = {};

    scheduleItems.forEach((item, idx) => {
      const w = item.week || 1;
      if (!perWeek[w]) {
        perWeek[w] = { total: 0, done: 0, pct: 0 };
      }

      (item.tasks || []).forEach((_, tIdx) => {
        total++;
        perWeek[w].total++;
        if (isTaskDone(item, tIdx, idx)) {
          done++;
          perWeek[w].done++;
        }
      });
    });

    Object.keys(perWeek).forEach(k => {
      const wk = Number(k);
      perWeek[wk].pct = perWeek[wk].total > 0
        ? Math.round((perWeek[wk].done / perWeek[wk].total) * 100)
        : 0;
    });

    return {
      overallStats: {
        total,
        done,
        pct: total > 0 ? Math.round((done / total) * 100) : 0
      },
      weekStatsMap: perWeek
    };
  }, [scheduleItems, progress, completedTasks]);

  // Export Timetable to Markdown across all weeks
  const handleExportSchedule = () => {
    const lines = [
      `# Cambridge IGCSE Combined Science 0653 - Complete Multi-Week Revision Roadmap`,
      `Target Exam Date: ${examDate} (${daysUntilExam ? daysUntilExam + ' days remaining • ' + weeksUntilExam + ' weeks' : 'Upcoming'})`,
      `Weekly Study Target: ${weeklyHours} hours/week across ${studyDaysPerWeek} study days (~${calculatedSessionMinutes} mins/session)`,
      `Total Planned Revision: ${weeksUntilExam * weeklyHours} hours across ${scheduleItems.length} targeted sessions`,
      `Topic Strategy Mode: ${selectionMode === 'custom_topics' ? 'Student-Chosen Topics' : 'Analysed Diagnostic Needs'}`,
      `Tier: ${user.tier || 'Extended'}`,
      `Overall Completion: ${overallStats.done}/${overallStats.total} Tasks (${overallStats.pct}%)`,
      `\n=======================================================\n`
    ];

    weeksGrouped.forEach(wg => {
      lines.push(`\n# WEEK ${wg.week}: ${wg.theme || 'Focused Syllabus Revision'}`);
      if (wg.goals && wg.goals.length > 0) {
        lines.push(`*Weekly Objectives:*`);
        wg.goals.forEach(g => lines.push(`- ${g}`));
        lines.push('');
      }

      wg.items.forEach((item, idx) => {
        lines.push(`### ${item.day || 'Day ' + (idx + 1)} - [${item.topicCode || 'Science'}] ${item.topicTitle || 'Revision'} (${item.estimatedMinutes || calculatedSessionMinutes} mins)`);
        if (item.tasks && item.tasks.length > 0) {
          item.tasks.forEach((t: string, tIdx: number) => {
            const isDone = isTaskDone(item, tIdx, idx);
            lines.push(`- [${isDone ? 'x' : ' '}] ${t}`);
          });
        }
        lines.push('');
      });
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Cambridge-0653-Complete-${weeksUntilExam}-Week-Roadmap.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Tooltip component for Recharts consistency bar chart
  const ConsistencyCustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl p-3 shadow-2xl text-xs space-y-1.5 min-w-[170px]">
          <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5">
            <span className="font-bold text-white">{data.day}</span>
            {data.topicCode && (
              <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {data.topicCode}
              </span>
            )}
          </div>
          {data.topicTitle && (
            <p className="text-[11px] text-slate-300 line-clamp-1">{data.topicTitle}</p>
          )}
          <div className="flex items-center justify-between text-slate-300 pt-0.5">
            <span className="text-slate-400">Completed:</span>
            <span className="font-mono font-bold text-emerald-400">
              {data.completed} / {data.total} tasks
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>Consistency Rate:</span>
            <span className="font-mono font-semibold text-slate-200">
              {data.percentage}%
            </span>
          </div>
          <div className="pt-1 text-[10px] text-slate-400 flex items-center gap-1 font-medium">
            {data.isFull ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> All tasks completed!
              </span>
            ) : data.hasWork ? (
              <span className="text-cyan-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> In progress
              </span>
            ) : (
              <span className="text-slate-500">Target: {data.total} tasks</span>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Data for the Recharts daily consistency bar chart
  const consistencyData = useMemo(() => {
    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const dayShortMap: Record<string, string> = {
      'Monday': 'Mon',
      'Tuesday': 'Tue',
      'Wednesday': 'Wed',
      'Thursday': 'Thu',
      'Friday': 'Fri',
      'Saturday': 'Sat',
      'Sunday': 'Sun'
    };

    if (chartSelectedWeek === 'aggregate') {
      const map: Record<string, { completed: number; total: number; count: number }> = {};
      dayOrder.forEach(d => {
        map[d] = { completed: 0, total: 0, count: 0 };
      });

      scheduleItems.forEach((item, idx) => {
        const d = item.day || 'Monday';
        if (!map[d]) {
          map[d] = { completed: 0, total: 0, count: 0 };
        }
        map[d].count++;
        (item.tasks || []).forEach((_, tIdx) => {
          map[d].total++;
          if (isTaskDone(item, tIdx, idx)) {
            map[d].completed++;
          }
        });
      });

      const chartPoints = dayOrder
        .filter(d => map[d] && map[d].count > 0)
        .map(d => {
          const c = map[d].completed;
          const tot = map[d].total;
          return {
            day: d,
            shortDay: dayShortMap[d] || d.slice(0, 3),
            completed: c,
            total: tot,
            percentage: tot > 0 ? Math.round((c / tot) * 100) : 0,
            isFull: c >= tot && tot > 0,
            hasWork: c > 0
          };
        });

      const totalCompleted = chartPoints.reduce((acc, p) => acc + p.completed, 0);
      const totalTasks = chartPoints.reduce((acc, p) => acc + p.total, 0);
      const activeDays = chartPoints.filter(p => p.completed > 0).length;
      const fullDays = chartPoints.filter(p => p.isFull).length;
      const consistencyPct = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;
      const maxVal = Math.max(3, ...chartPoints.map(p => Math.max(p.total, p.completed)));

      return {
        points: chartPoints,
        totalCompleted,
        totalTasks,
        activeDays,
        fullDays,
        totalDays: chartPoints.length,
        consistencyPct,
        maxTasks: maxVal
      };
    }

    // Specific week view
    const targetWeek = typeof chartSelectedWeek === 'number' ? chartSelectedWeek : 1;
    const weekItems = scheduleItems.filter(item => (item.week || 1) === targetWeek);

    const chartPoints = weekItems.map((item, idx) => {
      const globalIdx = scheduleItems.findIndex(i => i.id === item.id);
      const tasks = item.tasks || [];
      const completed = tasks.filter((_, tIdx) => isTaskDone(item, tIdx, globalIdx >= 0 ? globalIdx : idx)).length;
      const total = tasks.length;
      const shortDay = dayShortMap[item.day || ''] || (item.day ? item.day.slice(0, 3) : `D${idx + 1}`);

      return {
        day: item.day || `Day ${idx + 1}`,
        shortDay,
        topicCode: item.topicCode || '',
        topicTitle: item.topicTitle || '',
        completed,
        total,
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
        isFull: completed >= total && total > 0,
        hasWork: completed > 0
      };
    });

    const totalCompleted = chartPoints.reduce((acc, p) => acc + p.completed, 0);
    const totalTasks = chartPoints.reduce((acc, p) => acc + p.total, 0);
    const activeDays = chartPoints.filter(p => p.completed > 0).length;
    const fullDays = chartPoints.filter(p => p.isFull).length;
    const consistencyPct = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;
    const maxVal = Math.max(3, ...chartPoints.map(p => Math.max(p.total, p.completed)));

    return {
      points: chartPoints,
      totalCompleted,
      totalTasks,
      activeDays,
      fullDays,
      totalDays: chartPoints.length,
      consistencyPct,
      maxTasks: maxVal
    };
  }, [chartSelectedWeek, scheduleItems, completedTasks, progress]);

  // Determine currently visible items based on activeWeekTab
  const visibleWeekData = useMemo(() => {
    if (activeWeekTab === 'all') {
      return weeksGrouped;
    }
    return weeksGrouped.filter(w => w.week === activeWeekTab);
  }, [activeWeekTab, weeksGrouped]);

  const currentWeekInfo = useMemo(() => {
    if (activeWeekTab === 'all') return null;
    return weeksGrouped.find(w => w.week === activeWeekTab) || weeksGrouped[0];
  }, [activeWeekTab, weeksGrouped]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-md flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Multi-Week Revision Roadmap
                </h1>
                <span className="text-xs font-bold font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  {weeksUntilExam} Weeks
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Targeted Cambridge IGCSE 0653 schedule providing revision work for every single week leading to your exam.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          {daysUntilExam !== null && (
            <div className="px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs font-semibold text-slate-300 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>
                <strong className="text-white font-mono text-sm">{daysUntilExam}</strong> days ({weeksUntilExam} weeks)
              </span>
            </div>
          )}

          <button
            onClick={handleExportSchedule}
            className="text-xs px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold flex items-center gap-2 transition shadow-sm active:scale-95"
            title="Download full multi-week schedule as Markdown"
          >
            <FileDown className="w-4 h-4 text-emerald-400" />
            <span>Export Full Roadmap (.MD)</span>
          </button>
        </div>
      </div>

      {/* Main Configuration Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-md space-y-6">
        {/* Section 1: Weekly Study Target & Exam Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
          {/* Target Exam Date & Quick Presets */}
          <div className="md:col-span-5 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                <span>Target Exam Date</span>
              </label>
              <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                {weeksUntilExam} weeks left
              </span>
            </div>

            <input
              type="date"
              value={examDate}
              onChange={e => setExamDate(e.target.value)}
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />

            {/* Quick Timeline Presets */}
            <div className="space-y-1">
              <span className="text-[11px] text-slate-400 font-medium">Quick timeline options:</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: '4 Wks', weeks: 4 },
                  { label: '6 Wks', weeks: 6 },
                  { label: '8 Wks (2 Mo)', weeks: 8 },
                  { label: '12 Wks (Term)', weeks: 12 },
                  { label: '16 Wks', weeks: 16 }
                ].map(p => (
                  <button
                    key={p.weeks}
                    type="button"
                    onClick={() => handleSetExamPreset(p.weeks)}
                    className="text-[10px] px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:text-white transition font-medium"
                  >
                    +{p.label}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Every single week until <strong className="text-slate-300 font-mono">{examDate}</strong> is assigned structured Cambridge 0653 daily sessions.
            </p>
          </div>

          {/* Weekly Study Target Selector (Selectable between 1 and 20 hours) */}
          <div className="md:col-span-7 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-emerald-400" />
                <span>Weekly Study Target</span>
                <span className="text-[10px] font-normal text-slate-400 normal-case bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700">
                  Select 1 – 20 hrs/week
                </span>
              </label>

              {/* Direct Stepper and Input */}
              <div className="flex items-center gap-1.5 bg-slate-800/90 border border-slate-700 rounded-xl px-2 py-1">
                <button
                  type="button"
                  onClick={() => handleUpdateWeeklyHours(weeklyHours - 0.5)}
                  disabled={weeklyHours <= 1.0}
                  className="w-6 h-6 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:hover:bg-slate-700 text-slate-200 flex items-center justify-center transition active:scale-95"
                  title="Decrease by 0.5 hour"
                  aria-label="Decrease weekly study hours"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <div className="flex items-center">
                  <input
                    type="number"
                    min="1"
                    max="20"
                    step="0.5"
                    value={weeklyHours}
                    onChange={e => handleUpdateWeeklyHours(parseFloat(e.target.value))}
                    className="w-14 bg-transparent text-center font-mono text-xs font-bold text-emerald-400 focus:outline-none"
                    aria-label="Weekly study target hours"
                  />
                  <span className="text-[11px] font-semibold text-slate-400 pr-1">hrs</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleUpdateWeeklyHours(weeklyHours + 0.5)}
                  disabled={weeklyHours >= 20.0}
                  className="w-6 h-6 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:hover:bg-slate-700 text-slate-200 flex items-center justify-center transition active:scale-95"
                  title="Increase by 0.5 hour"
                  aria-label="Increase weekly study hours"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Continuous 1 to 20 Hours Range Slider */}
            <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-3 space-y-2">
              <div className="relative pt-1 pb-1">
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="0.5"
                  value={weeklyHours}
                  onChange={e => handleUpdateWeeklyHours(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500 focus:outline-none"
                  aria-label="Weekly study target slider between 1 and 20 hours"
                />
              </div>

              {/* Slider Scale Ticks */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium px-0.5">
                <button
                  type="button"
                  onClick={() => handleUpdateWeeklyHours(1)}
                  className={`hover:text-emerald-400 transition ${weeklyHours === 1 ? 'text-emerald-400 font-bold' : ''}`}
                >
                  1 hr (Min)
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateWeeklyHours(5)}
                  className={`hover:text-emerald-400 transition ${weeklyHours === 5 ? 'text-emerald-400 font-bold' : ''}`}
                >
                  5 hrs
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateWeeklyHours(10)}
                  className={`hover:text-emerald-400 transition ${weeklyHours === 10 ? 'text-emerald-400 font-bold' : ''}`}
                >
                  10 hrs (Recommended)
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateWeeklyHours(15)}
                  className={`hover:text-emerald-400 transition ${weeklyHours === 15 ? 'text-emerald-400 font-bold' : ''}`}
                >
                  15 hrs
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateWeeklyHours(20)}
                  className={`hover:text-emerald-400 transition ${weeklyHours === 20 ? 'text-emerald-400 font-bold' : ''}`}
                >
                  20 hrs (Max)
                </button>
              </div>
            </div>

            {/* Quick Presets within 1 - 20 hrs */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { label: '2.0 hrs', val: 2.0, desc: 'Light' },
                { label: '5.0 hrs', val: 5.0, desc: 'Steady' },
                { label: '10.0 hrs', val: 10.0, desc: 'Recommended' },
                { label: '15.0 hrs', val: 15.0, desc: 'Intensive' },
                { label: '20.0 hrs', val: 20.0, desc: 'Exam Sprint' }
              ].map(preset => (
                <button
                  key={preset.val}
                  type="button"
                  onClick={() => handleUpdateWeeklyHours(preset.val)}
                  className={`py-1.5 px-2 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center transition ${
                    weeklyHours === preset.val
                      ? 'bg-emerald-600/20 border-emerald-500 text-white ring-1 ring-emerald-500 shadow-sm'
                      : 'bg-slate-800/70 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className="font-bold">{preset.label}</span>
                  <span className="text-[10px] text-slate-400 font-normal">{preset.desc}</span>
                </button>
              ))}
            </div>

            {/* Study Days & Daily Pace Breakdown */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Study Days:</span>
                <div className="inline-flex rounded-lg border border-slate-700 bg-slate-900 p-0.5">
                  <button
                    type="button"
                    onClick={() => setStudyDaysPerWeek(5)}
                    className={`px-2.5 py-1 text-xs rounded-md font-semibold transition ${
                      studyDaysPerWeek === 5
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    5 Days (Weekdays)
                  </button>
                  <button
                    type="button"
                    onClick={() => setStudyDaysPerWeek(7)}
                    className={`px-2.5 py-1 text-xs rounded-md font-semibold transition ${
                      studyDaysPerWeek === 7
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    7 Days (Full Week)
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
                <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>
                  Daily Target: <strong className="text-white font-mono">{calculatedDailyHours}h</strong> (~{calculatedSessionMinutes} mins/session)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Topic Selection Strategy Mode Switcher */}
        <div className="pt-4 border-t border-slate-800/80 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Brain className="w-4 h-4 text-emerald-400" />
                <span>Revision Topic Selection</span>
              </label>
              <span className="text-xs text-slate-400">
                Choose how your multi-week curriculum is populated
              </span>
            </div>

            {/* Mode Selector Tabs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectionMode('analysed_needs')}
                className={`p-3.5 rounded-xl border text-left transition flex items-start gap-3 ${
                  selectionMode === 'analysed_needs'
                    ? 'bg-emerald-950/20 border-emerald-500/60 ring-1 ring-emerald-500/40 text-white'
                    : 'bg-slate-800/50 border-slate-800 text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                  selectionMode === 'analysed_needs'
                    ? 'border-emerald-500 bg-emerald-500 text-slate-950'
                    : 'border-slate-600 bg-slate-900'
                }`}>
                  {selectionMode === 'analysed_needs' && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <div>
                  <div className="font-bold text-sm text-white flex items-center gap-2">
                    <span>Analysed Needs</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Recommended
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Topics across all {weeksUntilExam} weeks are automatically sequenced based on your diagnosed weak areas, quiz accuracies, and Cambridge 0653 syllabus weighting.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectionMode('custom_topics')}
                className={`p-3.5 rounded-xl border text-left transition flex items-start gap-3 ${
                  selectionMode === 'custom_topics'
                    ? 'bg-emerald-950/20 border-emerald-500/60 ring-1 ring-emerald-500/40 text-white'
                    : 'bg-slate-800/50 border-slate-800 text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                  selectionMode === 'custom_topics'
                    ? 'border-emerald-500 bg-emerald-500 text-slate-950'
                    : 'border-slate-600 bg-slate-900'
                }`}>
                  {selectionMode === 'custom_topics' && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <div>
                  <div className="font-bold text-sm text-white flex items-center gap-2">
                    <span>Choose Topics Myself</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {selectedTopicCodes.length} Topics Selected
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Hand-pick specific Cambridge 0653 Biology, Chemistry, or Physics modules. We space and rotate them across all {weeksUntilExam} weeks.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Sub-view A: Analysed Needs Display */}
          {selectionMode === 'analysed_needs' && (
            <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>Diagnosed Priority Focus Areas ({analysedNeeds.length})</span>
                </span>
                <span className="text-[11px] text-slate-400">
                  Sequenced progressively across your {weeksUntilExam}-week plan
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {analysedNeeds.map(item => (
                  <div 
                    key={item.code}
                    className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-2.5 text-xs shadow-sm"
                  >
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border shrink-0 ${
                      item.subject === 'biology' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      item.subject === 'chemistry' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                    }`}>
                      {item.code}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-white truncate">{item.title}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">{item.reason}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sub-view B: Custom Topic Picker */}
          {selectionMode === 'custom_topics' && (
            <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <span className="text-xs font-semibold text-slate-300">
                    Select Syllabus Topics ({selectedTopicCodes.length} selected)
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Click cards to select topics. These will be scheduled across your {weeksUntilExam} weeks.
                  </p>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleSelectAllInSubject('biology')}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition font-medium"
                  >
                    + All Bio
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectAllInSubject('chemistry')}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 transition font-medium"
                  >
                    + All Chem
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectAllInSubject('physics')}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 transition font-medium"
                  >
                    + All Phys
                  </button>
                  <button
                    type="button"
                    onClick={handleClearTopics}
                    className="text-[11px] px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800 w-full sm:w-auto shrink-0">
                  {(['all', 'biology', 'chemistry', 'physics'] as const).map(subj => (
                    <button
                      key={subj}
                      type="button"
                      onClick={() => setTopicFilterSubject(subj)}
                      className={`px-3 py-1 text-xs rounded-lg font-semibold capitalize transition flex-1 sm:flex-none ${
                        topicFilterSubject === subj
                          ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {subj === 'all' ? 'All (33)' : subj}
                    </button>
                  ))}
                </div>

                <div className="relative w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by topic name, code (e.g. B5, C4, P1), or concepts..."
                    value={topicSearchQuery}
                    onChange={e => setTopicSearchQuery(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Topic Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1">
                {filteredTopics.map(topic => {
                  const isSelected = selectedTopicCodes.includes(topic.code);
                  return (
                    <div
                      key={topic.code}
                      onClick={() => handleToggleTopic(topic.code)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition flex items-start gap-2.5 select-none ${
                        isSelected
                          ? 'bg-emerald-950/30 border-emerald-500/50 text-white ring-1 ring-emerald-500/30'
                          : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-900 hover:border-slate-700'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded border mt-0.5 flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-slate-600 bg-slate-950'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                            topic.subject === 'biology' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            topic.subject === 'chemistry' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                            'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                          }`}>
                            {topic.code}
                          </span>
                          <span className="font-bold text-xs truncate text-white">
                            {topic.title}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1">
                          {topic.keyConcepts}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Button: Generate / Recalibrate Schedule */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-400">
              {selectionMode === 'custom_topics' ? (
                <span>Planning <strong>{selectedTopicCodes.length}</strong> topics across <strong>{weeksUntilExam} weeks</strong> at <strong>{weeklyHours}h/week</strong> ({weeksUntilExam * weeklyHours}h total)</span>
              ) : (
                <span>Planning <strong>{analysedNeeds.length}</strong> diagnostic weak topics across <strong>{weeksUntilExam} weeks</strong> at <strong>{weeklyHours}h/week</strong> ({weeksUntilExam * weeklyHours}h total)</span>
              )}
            </div>

            <button
              onClick={handleGenerateSchedule}
              disabled={isLoading}
              className="w-full sm:w-auto py-2.5 px-6 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 active:scale-95 shrink-0"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Calibrating {weeksUntilExam}-Week Roadmap...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-200" />
                  <span>Generate Complete {weeksUntilExam}-Week Schedule ({weeklyHours}h/week)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Multi-Week Roadmap Overview Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Roadmap Trajectory
            </span>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              {weeksUntilExam} Weeks to Exam
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-200">
            {scheduleSummary}
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0 border-t sm:border-t-0 sm:border-l border-slate-800 pt-3 sm:pt-0 sm:pl-5">
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="text-slate-400 font-medium">Overall Progress</span>
              <span className="font-bold font-mono text-emerald-400">{overallStats.done}/{overallStats.total} Tasks ({overallStats.pct}%)</span>
            </div>
            <div className="w-36 sm:w-48 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
                style={{ width: `${overallStats.pct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Daily Revision Consistency Tracker (Recharts Bar Chart) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  Daily Revision Consistency
                </h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  consistencyData.consistencyPct >= 75
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    : consistencyData.consistencyPct >= 35
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                    : consistencyData.totalCompleted > 0
                    ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {consistencyData.consistencyPct >= 75
                    ? '🔥 High Consistency'
                    : consistencyData.consistencyPct >= 35
                    ? '⚡ Steady Rhythm'
                    : consistencyData.totalCompleted > 0
                    ? '🌱 Building Momentum'
                    : '🎯 Target Ready'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Completed revision tasks by day — visual tracking to build study habits & pacing
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
            <span className="text-[11px] text-slate-400 font-medium">Schedule Week:</span>
            <select
              value={chartSelectedWeek}
              onChange={(e) => {
                const val = e.target.value;
                setChartSelectedWeek(val === 'aggregate' ? 'aggregate' : Number(val));
              }}
              className="bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-200 text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition cursor-pointer"
            >
              {Array.from({ length: weeksUntilExam }, (_, i) => i + 1).map((w) => (
                <option key={w} value={w}>
                  Week {w} {w === activeWeekTab ? '• Active Tab' : ''}
                </option>
              ))}
              <option value="aggregate">All Weeks Combined</option>
            </select>
          </div>
        </div>

        {/* Consistency Mini Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl px-3 py-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              Active Days
            </span>
            <span className="text-sm sm:text-base font-black font-mono text-white">
              {consistencyData.activeDays} <span className="text-xs font-normal text-slate-400">/ {consistencyData.totalDays} days</span>
            </span>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl px-3 py-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              100% Target Met
            </span>
            <span className="text-sm sm:text-base font-black font-mono text-emerald-400">
              {consistencyData.fullDays} <span className="text-xs font-normal text-slate-400">days</span>
            </span>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl px-3 py-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              Tasks Completed
            </span>
            <span className="text-sm sm:text-base font-black font-mono text-cyan-400">
              {consistencyData.totalCompleted} <span className="text-xs font-normal text-slate-400">/ {consistencyData.totalTasks}</span>
            </span>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl px-3 py-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              Consistency Pace
            </span>
            <span className="text-sm sm:text-base font-black font-mono text-amber-400">
              {consistencyData.consistencyPct}%
            </span>
          </div>
        </div>

        {/* Small Recharts Bar Chart */}
        <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3">
          <div className="h-36 sm:h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={consistencyData.points}
                margin={{ top: 8, right: 8, left: -24, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.35} vertical={false} />
                <XAxis 
                  dataKey="shortDay" 
                  stroke="#94a3b8" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={{ stroke: '#334155' }} 
                />
                <YAxis 
                  allowDecimals={false} 
                  domain={[0, consistencyData.maxTasks]} 
                  stroke="#94a3b8" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={{ stroke: '#334155' }} 
                />
                <Tooltip 
                  content={<ConsistencyCustomTooltip />} 
                  cursor={{ fill: 'rgba(51, 65, 85, 0.25)' }} 
                />
                <Bar 
                  dataKey="completed" 
                  radius={[4, 4, 0, 0]} 
                  maxBarSize={32}
                  background={{ fill: 'rgba(30, 41, 59, 0.5)', radius: 4 }}
                >
                  {consistencyData.points.map((entry, index) => (
                    <Cell 
                      key={`consistency-bar-${index}`} 
                      fill={
                        entry.isFull 
                          ? '#10b981' 
                          : entry.hasWork 
                          ? '#06b6d4' 
                          : '#475569'
                      } 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Chart Legend & Context Helper */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-slate-800/80 text-[11px] text-slate-400">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
                <span>All tasks done (100%)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500 inline-block" />
                <span>In progress</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-slate-700 inline-block" />
                <span>Pending / Scheduled</span>
              </span>
            </div>
            <span className="text-[10px] text-slate-500 italic">
              Hover over bars to inspect daily tasks & topic codes
            </span>
          </div>
        </div>
      </div>

      {/* Multi-Week Navigation Bar & Week Selector */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <h2 className="text-base font-bold text-white tracking-tight">
              Weekly Revision Breakdown
            </h2>
            <span className="text-xs text-slate-400">
              ({weeksGrouped.length} Weeks Scheduled)
            </span>
          </div>

          {/* Quick Prev / Next navigation for single-week mode */}
          {activeWeekTab !== 'all' && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveWeekTab(prev => (typeof prev === 'number' && prev > 1 ? prev - 1 : prev))}
                disabled={activeWeekTab === 1}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 text-slate-300 text-xs flex items-center gap-1 border border-slate-700 transition"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev Week</span>
              </button>
              <span className="text-xs font-mono font-bold text-slate-200 px-1">
                Week {activeWeekTab} of {weeksGrouped.length}
              </span>
              <button
                type="button"
                onClick={() => setActiveWeekTab(prev => (typeof prev === 'number' && prev < weeksGrouped.length ? prev + 1 : prev))}
                disabled={activeWeekTab === weeksGrouped.length}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 text-slate-300 text-xs flex items-center gap-1 border border-slate-700 transition"
              >
                <span>Next Week</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Week Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveWeekTab('all')}
            className={`px-3 py-1.5 text-xs rounded-xl font-bold whitespace-nowrap transition border ${
              activeWeekTab === 'all'
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            All Weeks ({weeksGrouped.length})
          </button>

          {weeksGrouped.map(wg => {
            const stats = weekStatsMap[wg.week] || { total: 0, done: 0, pct: 0 };
            const isCurrent = activeWeekTab === wg.week;

            return (
              <button
                key={wg.week}
                type="button"
                onClick={() => setActiveWeekTab(wg.week)}
                className={`px-3 py-1.5 text-xs rounded-xl font-bold whitespace-nowrap transition flex items-center gap-2 border ${
                  isCurrent
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span>Week {wg.week}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full border ${
                  isCurrent
                    ? 'bg-emerald-700/80 text-emerald-100 border-emerald-400/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {stats.done}/{stats.total}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Week Focus & Goals Card (When Viewing a Specific Week) */}
      {currentWeekInfo && activeWeekTab !== 'all' && (
        <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 space-y-3 shadow-md bg-gradient-to-r from-emerald-950/20 to-transparent">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800/80 pb-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 font-mono">
                Week {currentWeekInfo.week} Strategy & Focus
              </span>
              <h3 className="text-sm sm:text-base font-bold text-white mt-0.5">
                {currentWeekInfo.theme}
              </h3>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono font-medium text-slate-300">
              <span className="bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
                {weeklyHours}h target &bull; {currentWeekInfo.items.length} sessions
              </span>
            </div>
          </div>

          {currentWeekInfo.goals && currentWeekInfo.goals.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Key Cambridge Mastery Goals for Week {currentWeekInfo.week}:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {currentWeekInfo.goals.map((goal, gIdx) => (
                  <div 
                    key={gIdx}
                    className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-800 text-xs text-slate-200 flex items-start gap-2"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{goal}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Timetable Cards Rendered by Week */}
      <div className="space-y-8">
        {visibleWeekData.map(wg => (
          <div key={wg.week} className="space-y-4">
            {/* Week Divider Header when in "All Weeks" View */}
            {activeWeekTab === 'all' && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono font-bold text-xs">
                    W{wg.week}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">
                      Week {wg.week}: {wg.theme}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {wg.items.length} daily sessions &bull; {weeklyHours} hours planned this week
                    </p>
                  </div>
                </div>

                <div className="text-xs font-mono font-bold text-emerald-400">
                  {weekStatsMap[wg.week]?.done || 0}/{weekStatsMap[wg.week]?.total || 0} tasks done
                </div>
              </div>
            )}

            {/* Daily Sessions Grid */}
            <div className="space-y-4">
              {wg.items.map((item, idx) => (
                <div
                  key={item.id || `${wg.week}-${idx}`}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition space-y-4 shadow-sm"
                >
                  {/* Session Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800/80 pb-3.5">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                        Week {item.week || wg.week} &bull; {item.day || `Day ${idx + 1}`}
                      </span>
                      
                      <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border ${
                        item.subject === 'biology' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                        item.subject === 'chemistry' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                        item.subject === 'physics' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' :
                        'bg-purple-500/10 text-purple-400 border-purple-500/30'
                      }`}>
                        {item.topicCode || 'General'}
                      </span>

                      <span className="font-bold text-sm text-white">
                        {item.topicTitle}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-400 shrink-0">
                      <span className="flex items-center gap-1 font-mono bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.estimatedMinutes || calculatedSessionMinutes} mins</span>
                      </span>

                      <button
                        onClick={() => onOpenLesson(item.topicCode || 'B2')}
                        className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1.5 hover:underline transition"
                      >
                        <BookOpen className="w-4 h-4" />
                        <span>Open Lesson Deck</span>
                      </button>
                    </div>
                  </div>

                  {/* Session Flow Header */}
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/40 border border-slate-800/80 text-[11px] text-slate-400 overflow-x-auto no-scrollbar">
                    <span className="font-bold text-emerald-400 font-mono whitespace-nowrap">Session Sequence:</span>
                    <span className="text-slate-300 font-medium whitespace-nowrap">1. Specific Slides Recap</span>
                    <span className="text-slate-600">&rarr;</span>
                    <span className="text-slate-300 font-medium whitespace-nowrap">2. Creative Application / Tool</span>
                    <span className="text-slate-600">&rarr;</span>
                    <span className="text-slate-300 font-medium whitespace-nowrap">3. Timed Synthesis & Audit</span>
                  </div>

                  {/* Task Checklist for this Day */}
                  <div className="space-y-2.5">
                    {(item.tasks || []).map((task: string, tIdx: number) => {
                      const taskId = `${item.id || idx}-t-${tIdx}`;
                      const action = detectTaskAction(task, item.topicCode || 'Science');
                      const isAutoDone = isTaskAutoCompleted(item, tIdx);
                      const isManualDone = Boolean(completedTasks[taskId]);
                      const isDone = isAutoDone || isManualDone;

                      return (
                        <div
                          key={tIdx}
                          className={`p-3.5 rounded-xl border text-xs transition space-y-2.5 ${
                            isDone
                              ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                              : 'bg-slate-800/40 border-slate-800 hover:border-slate-700/80 text-slate-200'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {/* Interactive completion toggle button */}
                            <button
                              type="button"
                              onClick={() => handleToggleTask(item, tIdx, idx)}
                              className={`w-5 h-5 rounded-lg border mt-0.5 flex items-center justify-center shrink-0 transition cursor-pointer active:scale-90 ${
                                isDone 
                                  ? 'bg-emerald-600 border-emerald-500 text-white shadow-xs ring-2 ring-emerald-500/20' 
                                  : 'border-slate-700 bg-slate-900 hover:border-slate-500 text-transparent'
                              }`}
                              title={isDone ? 'Mark as incomplete' : 'Mark as complete'}
                            >
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </button>

                            <div className="space-y-1.5 flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                {/* Task Type Badge */}
                                {tIdx === 0 ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono">
                                    📖 Task 1 &bull; Slides Recap
                                  </span>
                                ) : (
                                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border font-mono ${action.badgeColor}`}>
                                    Task {tIdx + 1} &bull; {action.badge}
                                  </span>
                                )}

                                {isAutoDone ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                    <ShieldCheck className="w-3 h-3" />
                                    <span>Auto-Verified</span>
                                  </span>
                                ) : isManualDone ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                    <Check className="w-3 h-3" />
                                    <span>Completed</span>
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-slate-500">
                                    {tIdx === 0 ? 'Click to open slide deck' : 'Click tool button below or mark done'}
                                  </span>
                                )}
                              </div>

                              <div className={`leading-relaxed ${isDone ? 'line-through text-slate-400 font-medium' : 'text-slate-100 font-medium'}`}>
                                {task}
                              </div>

                              {/* Interactive 1-Click Action Buttons for Website Tools & Creative Offline Tasks */}
                              <div className="pt-1 flex items-center gap-2 flex-wrap">
                                {tIdx === 0 && (
                                  <button
                                    type="button"
                                    onClick={() => onOpenLesson(item.topicCode || 'B2')}
                                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1.5 transition shadow-xs active:scale-95 cursor-pointer"
                                  >
                                    <BookOpen className="w-3 h-3" />
                                    <span>Open {item.topicCode} Slide Deck</span>
                                  </button>
                                )}

                                {tIdx > 0 && action.type === 'ai_tutor' && onAskAITutor && (
                                  <button
                                    type="button"
                                    onClick={() => onAskAITutor(action.prompt || task, item.topicCode)}
                                    className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] flex items-center gap-1.5 transition shadow-xs active:scale-95 cursor-pointer"
                                  >
                                    <Sparkles className="w-3 h-3" />
                                    <span>Ask AI Tutor This Question</span>
                                  </button>
                                )}

                                {tIdx > 0 && action.type === 'quiz' && onNavigateToQuiz && (
                                  <button
                                    type="button"
                                    onClick={() => onNavigateToQuiz(item.topicCode)}
                                    className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] flex items-center gap-1.5 transition shadow-xs active:scale-95 cursor-pointer"
                                  >
                                    <Target className="w-3 h-3" />
                                    <span>Launch Quiz Arena</span>
                                  </button>
                                )}

                                {tIdx > 0 && action.type === 'exams' && onNavigateToExams && (
                                  <button
                                    type="button"
                                    onClick={() => onNavigateToExams()}
                                    className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-[11px] flex items-center gap-1.5 transition shadow-xs active:scale-95 cursor-pointer"
                                  >
                                    <FileText className="w-3 h-3" />
                                    <span>Open Past Exams Vault</span>
                                  </button>
                                )}

                                {tIdx > 0 && action.type === 'notebook' && onNavigateToNotebook && (
                                  <button
                                    type="button"
                                    onClick={() => onNavigateToNotebook()}
                                    className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[11px] flex items-center gap-1.5 transition shadow-xs active:scale-95 cursor-pointer"
                                  >
                                    <BookOpen className="w-3 h-3" />
                                    <span>Open Syllabus Notebook</span>
                                  </button>
                                )}

                                {tIdx > 0 && action.type === 'guidelines' && onNavigateToGuidelines && (
                                  <button
                                    type="button"
                                    onClick={() => onNavigateToGuidelines()}
                                    className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] flex items-center gap-1.5 transition shadow-xs active:scale-95 cursor-pointer"
                                  >
                                    <FileText className="w-3 h-3" />
                                    <span>View Exam Guidelines</span>
                                  </button>
                                )}

                                {tIdx > 0 && action.type === 'creative' && (
                                  <button
                                    type="button"
                                    onClick={() => handleToggleTask(item, tIdx, idx)}
                                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition active:scale-95 border cursor-pointer ${
                                      isDone
                                        ? 'bg-emerald-600 text-white border-emerald-500'
                                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                                    }`}
                                  >
                                    <Check className="w-3 h-3" />
                                    <span>{isDone ? 'Completed' : 'Mark Creative Task Done'}</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
