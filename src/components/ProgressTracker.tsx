import React, { useState, useMemo, useEffect } from 'react';
import { 
  BarChart3, 
  CheckCircle2, 
  Star, 
  TrendingUp, 
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
  User
} from 'lucide-react';
import { StudentProgress, UserProfile, TrafficLightStatus } from '../types';
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

      {/* SUBJECT MASTERY BREAKDOWN TABS */}
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

      {/* TOPIC CONFIDENCE MATRIX (Syllabus Units) */}
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
    </div>
  );
};
