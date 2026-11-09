import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Award, 
  CheckCircle, 
  XCircle, 
  RotateCcw, 
  Sparkles, 
  Check, 
  HelpCircle, 
  ArrowRight, 
  TrendingUp, 
  Brain, 
  Clock, 
  Sliders, 
  CheckSquare, 
  Square, 
  Search, 
  BookOpen, 
  Layers, 
  Dna, 
  Atom, 
  Zap, 
  AlertCircle, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  RefreshCw, 
  GraduationCap,
  Flame,
  MessageSquare,
  FileQuestion
} from 'lucide-react';
import { QuizQuestion, ScienceSubject } from '../types';
import { 
  ALL_SYLLABUS_TOPICS, 
  SyllabusTopicOption, 
  generateAIQuiz, 
  estimateCambridgeGrade,
  isGeneticsQuestion,
  deduplicateQuestionsList,
  ALL_SUBTOPIC_OPTIONS
} from '../services/quizService';

interface QuizArenaProps {
  onQuizCompleted: (subject: string, score: number, total: number) => void;
  onAskAITutor: (query: string, topicCode: string) => void;
  weakTopics?: string[];
  onOpenLesson?: (topicCode: string) => void;
}

type QuizPhase = 'config' | 'generating' | 'active' | 'completed';

export const QuizArena: React.FC<QuizArenaProps> = ({ 
  onQuizCompleted, 
  onAskAITutor, 
  weakTopics = [],
  onOpenLesson 
}) => {
  // Phase state
  const [phase, setPhase] = useState<QuizPhase>('config');

  // Configuration state
  const [numQuestions, setNumQuestions] = useState<number>(10);
  const [selectedTopics, setSelectedTopics] = useState<string[]>(() => [
    'B1', 'B2', 'B3', 'B4', 'B5',
    'C1', 'C2', 'C3', 'C4',
    'P1', 'P2', 'P3', 'P4'
  ]);
  const [selectedSubtopics, setSelectedSubtopics] = useState<string[]>([]);
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});
  const [attemptCount, setAttemptCount] = useState<number>(1);
  const [tier, setTier] = useState<'Extended' | 'Core' | 'Mixed'>('Extended');
  const [topicSearch, setTopicSearch] = useState<string>('');
  const [activeSubjectTab, setActiveSubjectTab] = useState<'all' | 'biology' | 'chemistry' | 'physics'>('all');

  // Active Quiz State
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  const [score, setScore] = useState<number>(0);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [generationSource, setGenerationSource] = useState<string>('gemini-3.8-flash');
  const [isNavDrawerOpen, setIsNavDrawerOpen] = useState<boolean>(false);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'incorrect' | 'correct'>('all');

  const timerRef = useRef<any>(null);

  // Timer effect
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isTimerRunning]);

  // Current Question helper
  const currentQ = useMemo(() => {
    return questions[currentIdx] || null;
  }, [questions, currentIdx]);

  // Group subtopics by topic code
  const subtopicsByTopic = useMemo(() => {
    const map: Record<string, { code: string; title: string }[]> = {};
    ALL_SUBTOPIC_OPTIONS.forEach(sub => {
      const topCode = sub.topicCode;
      if (!map[topCode]) map[topCode] = [];
      map[topCode].push({ code: sub.code, title: sub.title });
    });
    return map;
  }, []);

  // Filter topics by subject tab and search
  const filteredTopics = useMemo(() => {
    return ALL_SYLLABUS_TOPICS.filter(t => {
      if (activeSubjectTab !== 'all' && t.subject !== activeSubjectTab) return false;
      if (topicSearch.trim()) {
        const q = topicSearch.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchCode = t.code.toLowerCase().includes(q);
        const matchConcepts = t.keyConcepts.toLowerCase().includes(q);
        const subs = subtopicsByTopic[t.code] || [];
        const matchSub = subs.some(s => s.code.toLowerCase().includes(q) || s.title.toLowerCase().includes(q));
        return matchTitle || matchCode || matchConcepts || matchSub;
      }
      return true;
    });
  }, [activeSubjectTab, topicSearch, subtopicsByTopic]);

  // Toggle single topic
  const handleToggleTopic = (topicCode: string) => {
    setSelectedTopics(prev => {
      if (prev.includes(topicCode)) {
        const next = prev.filter(c => c !== topicCode);
        const subs = subtopicsByTopic[topicCode] || [];
        const subCodes = subs.map(s => s.code);
        setSelectedSubtopics(curr => curr.filter(sc => !subCodes.includes(sc)));
        return next;
      } else {
        return [...prev, topicCode];
      }
    });
  };

  // Toggle single subtopic
  const handleToggleSubtopic = (subtopicCode: string, parentTopicCode: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedSubtopics(prev => {
      if (prev.includes(subtopicCode)) {
        return prev.filter(c => c !== subtopicCode);
      } else {
        if (!selectedTopics.includes(parentTopicCode)) {
          setSelectedTopics(curr => [...curr, parentTopicCode]);
        }
        return [...prev, subtopicCode];
      }
    });
  };

  // Toggle subtopics tray
  const handleToggleExpandTopic = (topicCode: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedTopics(prev => ({
      ...prev,
      [topicCode]: !prev[topicCode]
    }));
  };

  // Quick select presets
  const handleSelectAll = () => {
    setSelectedTopics(ALL_SYLLABUS_TOPICS.map(t => t.code));
  };

  const handleClearAll = () => {
    setSelectedTopics([]);
    setSelectedSubtopics([]);
  };

  const handleSelectOnlySubject = (subj: ScienceSubject) => {
    setSelectedTopics(ALL_SYLLABUS_TOPICS.filter(t => t.subject === subj).map(t => t.code));
    setSelectedSubtopics([]);
    setActiveSubjectTab(subj);
  };

  // Start generation
  const handleStartGeneration = async (isRetry = false) => {
    if (selectedTopics.length === 0 && selectedSubtopics.length === 0) return;

    setPhase('generating');
    setIsTimerRunning(false);
    setTimerSeconds(0);
    setCurrentIdx(0);
    setScore(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);

    const nextAttempt = isRetry ? attemptCount + 1 : attemptCount;
    if (isRetry) setAttemptCount(nextAttempt);

    try {
      const result = await generateAIQuiz({
        topics: selectedTopics,
        numQuestions,
        tier,
        attemptNumber: nextAttempt,
        subtopics: selectedSubtopics
      });

      const finalQuestions = deduplicateQuestionsList(result.questions);

      setQuestions(finalQuestions);
      setUserAnswers(new Array(finalQuestions.length).fill(null));
      setGenerationSource(result.source || 'gemini-3.8-flash');
      setPhase('active');
      setIsTimerRunning(true);
    } catch (err) {
      console.error('Quiz generation failed:', err);
      setPhase('config');
    }
  };

  // Select an option during active quiz
  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(idx);
  };

  // Submit answer for current question
  const handleSubmitAnswer = () => {
    if (selectedOption === null || isAnswerSubmitted || !currentQ) return;

    setIsAnswerSubmitted(true);
    const isCorrect = selectedOption === currentQ.correctIndex;

    setUserAnswers(prev => {
      const next = [...prev];
      next[currentIdx] = selectedOption;
      return next;
    });

    if (isCorrect) {
      setScore(prev => prev + 1);
    }
  };

  // Next Question
  const handleNextQuestion = () => {
    if (currentIdx < questions.length - 1) {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      const existingAnswer = userAnswers[nextIdx];
      setSelectedOption(existingAnswer);
      setIsAnswerSubmitted(existingAnswer !== null);
    } else {
      handleFinishQuiz();
    }
  };

  // Jump to specific question
  const handleJumpToQuestion = (targetIdx: number) => {
    if (targetIdx < 0 || targetIdx >= questions.length) return;
    setCurrentIdx(targetIdx);
    const existing = userAnswers[targetIdx];
    setSelectedOption(existing);
    setIsAnswerSubmitted(existing !== null);
    setIsNavDrawerOpen(false);
  };

  // Finish Quiz
  const handleFinishQuiz = () => {
    setIsTimerRunning(false);
    setPhase('completed');

    let primarySubject = 'all';
    if (activeSubjectTab !== 'all') {
      primarySubject = activeSubjectTab;
    } else if (selectedTopics.length > 0) {
      const firstTopic = ALL_SYLLABUS_TOPICS.find(t => t.code === selectedTopics[0]);
      if (firstTopic) primarySubject = firstTopic.subject;
    }

    onQuizCompleted(primarySubject, score, questions.length);
  };

  // Format seconds to mm:ss
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Grade calculation
  const gradeInfo = useMemo(() => {
    if (questions.length === 0) return { grade: 'N/A', percentage: 0, feedback: '' };
    return estimateCambridgeGrade(score, questions.length);
  }, [score, questions.length]);

  // Subject breakdown for results
  const subjectBreakdown = useMemo(() => {
    const counts = {
      biology: { correct: 0, total: 0 },
      chemistry: { correct: 0, total: 0 },
      physics: { correct: 0, total: 0 }
    };

    questions.forEach((q, idx) => {
      const subj = q.subject;
      if (counts[subj]) {
        counts[subj].total += 1;
        if (userAnswers[idx] === q.correctIndex) {
          counts[subj].correct += 1;
        }
      }
    });

    return counts;
  }, [questions, userAnswers]);

  // Weak topics identified in this quiz
  const weakTopicsInQuiz = useMemo(() => {
    const set = new Set<string>();
    questions.forEach((q, idx) => {
      if (userAnswers[idx] !== q.correctIndex) {
        set.add(`${q.topicCode} (${q.topicTitle || q.subject})`);
      }
    });
    return Array.from(set);
  }, [questions, userAnswers]);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-12 font-sans text-slate-800">
      
      {/* 1. QUIZ BUILDER & TOPIC SELECTION PHASE */}
      {phase === 'config' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#EBF3F5] text-slate-800 border border-slate-300">
                    Practice Engine
                  </span>
                  <span className="text-xs font-semibold text-slate-600">
                    Cambridge 0653 Multiple Choice
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                  <FileQuestion className="w-6 h-6 text-slate-700" />
                  <span>Practice Quizzes and Exam Drills</span>
                </h1>
                <p className="text-base text-slate-600 max-w-2xl">
                  Choose your curriculum topics to generate practice quizzes. Tested against official Cambridge 0653 objectives with immediate step-by-step feedback.
                </p>
              </div>

              <div className="bg-[#EBF3F5] border border-slate-300 rounded-lg px-5 py-3 text-center shrink-0">
                <span className="block text-2xl font-bold text-slate-800">
                  {selectedTopics.length}
                </span>
                <span className="block text-xs font-semibold text-slate-600">
                  of {ALL_SYLLABUS_TOPICS.length} Topics
                </span>
              </div>
            </div>
          </div>

          {/* Configuration Card: Question Count & Curriculum Tier */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Question Count Selector */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-slate-700" />
                    <span>Number of Questions</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="40"
                      value={numQuestions}
                      onChange={e => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val)) {
                          setNumQuestions(Math.min(40, Math.max(1, val)));
                        }
                      }}
                      className="w-16 px-2 py-1 text-center font-mono font-bold text-sm rounded-md bg-[#FDFBF7] border-2 border-black text-slate-800 focus:outline-none"
                    />
                    <span className="text-xs font-bold text-slate-600">/ 40 max</span>
                  </div>
                </div>

                <input
                  type="range"
                  min="1"
                  max="40"
                  value={numQuestions}
                  onChange={e => setNumQuestions(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-800"
                />

                <div className="flex flex-wrap gap-2 pt-1">
                  {[5, 10, 15, 20, 30, 40].map(cnt => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setNumQuestions(cnt)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
                        numQuestions === cnt
                          ? 'bg-slate-800 text-white border-slate-800'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {cnt === 40 ? '40 Mock' : `${cnt} Qs`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Examination Tier */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-slate-700" />
                  <span>Curriculum Tier</span>
                </label>

                <div className="grid grid-cols-3 gap-2">
                  {(['Extended', 'Core', 'Mixed'] as const).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTier(t)}
                      className={`p-3 rounded-lg border text-center transition cursor-pointer ${
                        tier === t
                          ? 'bg-slate-800 text-white border-slate-800'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <div className="text-sm font-bold">{t}</div>
                      <div className="text-xs opacity-75 mt-0.5">
                        {t === 'Extended' ? 'Paper 2' : t === 'Core' ? 'Paper 1' : 'Both Papers'}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="text-xs text-slate-600 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Estimated time: ~{Math.round(numQuestions * 1.5)} minutes (1.5 min per question)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Topic Selection Area */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-slate-700" />
                  <span>Choose Topics to Include</span>
                </h2>
                <p className="text-sm text-slate-600">
                  Select specific syllabus units or apply subject filters.
                </p>
              </div>

              {/* Presets */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition cursor-pointer"
                >
                  All 33 Topics
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectOnlySubject('biology')}
                  className="px-3 py-1.5 rounded-lg bg-[#EBF3F5] border border-slate-300 text-slate-800 hover:bg-[#d8e9ec] text-xs font-bold transition cursor-pointer"
                >
                  Biology (B1–B16)
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectOnlySubject('chemistry')}
                  className="px-3 py-1.5 rounded-lg bg-[#EBF3F5] border border-slate-300 text-slate-800 hover:bg-[#d8e9ec] text-xs font-bold transition cursor-pointer"
                >
                  Chemistry (C1–C12)
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectOnlySubject('physics')}
                  className="px-3 py-1.5 rounded-lg bg-[#EBF3F5] border border-slate-300 text-slate-800 hover:bg-[#d8e9ec] text-xs font-bold transition cursor-pointer"
                >
                  Physics (P1–P5)
                </button>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition cursor-pointer"
                >
                  Clear Selection
                </button>
              </div>
            </div>

            {/* Subject Tabs & Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveSubjectTab('all')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold border transition cursor-pointer ${
                    activeSubjectTab === 'all'
                      ? 'bg-slate-800 text-white border-slate-800'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  All Sciences ({ALL_SYLLABUS_TOPICS.length})
                </button>
                <button
                  onClick={() => setActiveSubjectTab('biology')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold border transition cursor-pointer flex items-center gap-1.5 ${
                    activeSubjectTab === 'biology'
                      ? 'bg-slate-800 text-white border-slate-800'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <Dna className="w-3.5 h-3.5" />
                  <span>Biology</span>
                </button>
                <button
                  onClick={() => setActiveSubjectTab('chemistry')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold border transition cursor-pointer flex items-center gap-1.5 ${
                    activeSubjectTab === 'chemistry'
                      ? 'bg-slate-800 text-white border-slate-800'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <Atom className="w-3.5 h-3.5" />
                  <span>Chemistry</span>
                </button>
                <button
                  onClick={() => setActiveSubjectTab('physics')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold border transition cursor-pointer flex items-center gap-1.5 ${
                    activeSubjectTab === 'physics'
                      ? 'bg-slate-800 text-white border-slate-800'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Physics</span>
                </button>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={topicSearch}
                  onChange={e => setTopicSearch(e.target.value)}
                  placeholder="Search topics or keywords..."
                  className="pl-9 pr-3 py-2 bg-[#FDFBF7] border-2 border-black rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white w-full sm:w-64"
                />
              </div>
            </div>

            {/* Topic Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-1">
              {filteredTopics.map(t => {
                const isSelected = selectedTopics.includes(t.code);
                const subtopics = subtopicsByTopic[t.code] || [];
                const isExpanded = Boolean(expandedTopics[t.code]);
                const activeSubtopicsForTopic = subtopics.filter(st => selectedSubtopics.includes(st.code));

                return (
                  <div
                    key={t.code}
                    className={`rounded-lg border transition select-none flex flex-col ${
                      isSelected
                        ? 'bg-[#EBF3F5] border-2 border-slate-800 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    <div 
                      onClick={() => handleToggleTopic(t.code)}
                      className="p-3 cursor-pointer flex items-start gap-3"
                    >
                      <div className="pt-0.5">
                        <div className={`w-4 h-4 rounded-md flex items-center justify-center text-xs font-bold ${
                          isSelected ? 'bg-slate-800 text-white' : 'border border-slate-400'
                        }`}>
                          {isSelected && '✓'}
                        </div>
                      </div>

                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1.5">
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-white text-slate-800 border border-slate-300">
                              {t.code}
                            </span>
                            <span className="text-sm font-bold text-slate-800 truncate">
                              {t.title}
                            </span>
                          </div>

                          {subtopics.length > 0 && (
                            <button
                              type="button"
                              onClick={(e) => handleToggleExpandTopic(t.code, e)}
                              className="text-xs px-2 py-0.5 rounded bg-white border border-slate-300 text-slate-600 hover:text-slate-800 flex items-center gap-1 shrink-0 transition"
                            >
                              <span>{subtopics.length}</span>
                              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-1">
                          {t.keyConcepts}
                        </p>
                        {activeSubtopicsForTopic.length > 0 && (
                          <div className="text-xs text-emerald-700 font-bold">
                            ✓ {activeSubtopicsForTopic.length} of {subtopics.length} subtopics focused
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Expandable Subtopics Tray */}
                    {isExpanded && subtopics.length > 0 && (
                      <div className="p-3 bg-[#FDFBF7] border-t border-slate-200 rounded-b-lg space-y-2">
                        <div className="flex items-center justify-between text-xs text-slate-600">
                          <span className="font-bold text-slate-800">Target Subtopics:</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const allSubCodes = subtopics.map(st => st.code);
                              const allSelected = allSubCodes.every(c => selectedSubtopics.includes(c));
                              if (allSelected) {
                                setSelectedSubtopics(prev => prev.filter(c => !allSubCodes.includes(c)));
                              } else {
                                setSelectedSubtopics(prev => Array.from(new Set([...prev, ...allSubCodes])));
                                if (!selectedTopics.includes(t.code)) setSelectedTopics(curr => [...curr, t.code]);
                              }
                            }}
                            className="text-xs text-slate-800 font-bold hover:underline"
                          >
                            Toggle all
                          </button>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          {subtopics.map(st => {
                            const isSubSelected = selectedSubtopics.includes(st.code);
                            return (
                              <button
                                key={st.code}
                                type="button"
                                onClick={(e) => handleToggleSubtopic(st.code, t.code, e)}
                                className={`text-left text-xs p-2 rounded-md border transition flex items-center justify-between gap-2 cursor-pointer ${
                                  isSubSelected
                                    ? 'bg-[#EBF3F5] border-slate-800 text-slate-800 font-bold'
                                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <span className="font-mono text-[11px] px-1 py-0.5 rounded bg-slate-100 border border-slate-300">
                                    {st.code}
                                  </span>
                                  <span className="truncate text-xs">{st.title}</span>
                                </div>
                                {isSubSelected && <Check className="w-3.5 h-3.5 text-slate-800 shrink-0" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {selectedTopics.length === 0 && selectedSubtopics.length === 0 && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-300 text-rose-800 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
                <span>Please select at least 1 topic or subtopic to generate a quiz.</span>
              </div>
            )}
          </div>

          {/* Start Quiz Action */}
          <div className="flex items-center justify-end">
            <button
              onClick={() => handleStartGeneration(false)}
              disabled={selectedTopics.length === 0 && selectedSubtopics.length === 0}
              className={`w-full sm:w-auto px-8 py-3.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                selectedTopics.length === 0 && selectedSubtopics.length === 0
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-slate-800 hover:bg-slate-700 text-white shadow-xs'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {selectedSubtopics.length > 0 
                  ? `Generate Quiz (${numQuestions} Questions • ${selectedSubtopics.length} Subtopics)`
                  : `Generate Quiz (${numQuestions} Questions • ${selectedTopics.length} Topics)`}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 2. GENERATING PHASE */}
      {phase === 'generating' && (
        <div className="min-h-[400px] bg-white border border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center space-y-5 shadow-xs">
          <div className="w-12 h-12 border-4 border-slate-300 border-t-slate-800 rounded-full animate-spin" />

          <div className="space-y-1 max-w-md">
            <h2 className="text-xl font-bold text-slate-800">
              Generating Cambridge Questions...
            </h2>
            <p className="text-base text-slate-600">
              Preparing {numQuestions} multiple choice questions aligned with Cambridge 0653 objectives for your selected units.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-[#FDFBF7] border border-slate-300 text-sm text-slate-700 max-w-lg text-left">
            <strong className="block text-slate-800 mb-1">Cambridge 0653 Exam Tip:</strong>
            <p className="text-slate-600">
              Paper 1 & Paper 2 consist of 40 multiple-choice questions with 4 options each. All questions are worth 1 mark, with no penalties for incorrect answers.
            </p>
          </div>
        </div>
      )}

      {/* 3. ACTIVE QUIZ TAKING PHASE */}
      {phase === 'active' && currentQ && (
        <div className="space-y-5">
          {/* Top Control Bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold px-3 py-1 rounded-md bg-[#EBF3F5] text-slate-800 border border-slate-300">
                Question {currentIdx + 1} of {questions.length}
              </span>

              <span className="text-sm font-semibold text-slate-600 hidden sm:inline">
                Score: <strong className="text-slate-800">{score}</strong> / {currentIdx + (isAnswerSubmitted ? 1 : 0)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Elapsed Timer */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#FDFBF7] border border-slate-300 text-sm font-bold text-slate-800">
                <Clock className="w-4 h-4 text-slate-600" />
                <span>{formatTime(timerSeconds)}</span>
              </div>

              {/* Grid Toggle */}
              <button
                onClick={() => setIsNavDrawerOpen(prev => !prev)}
                className="px-3 py-1 rounded-md bg-white hover:bg-slate-100 border border-slate-300 text-sm font-bold text-slate-800 transition flex items-center gap-1 cursor-pointer"
              >
                <span>Grid</span>
                {isNavDrawerOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={handleFinishQuiz}
                className="px-3 py-1 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 text-sm font-bold transition cursor-pointer"
              >
                End Quiz
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-slate-800 transition-all duration-300"
              style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
            />
          </div>

          {/* Question Grid Navigator */}
          {isNavDrawerOpen && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-xs">
              <div className="text-sm font-bold text-slate-800 flex items-center justify-between">
                <span>Jump to Question</span>
                <span className="text-xs text-slate-500 font-normal">Blue = Answered • Dark = Current</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {questions.map((q, idx) => {
                  const isCurrent = idx === currentIdx;
                  const isAnswered = userAnswers[idx] !== null && userAnswers[idx] !== undefined;

                  return (
                    <button
                      key={q.id || idx}
                      onClick={() => handleJumpToQuestion(idx)}
                      className={`w-9 h-9 rounded-md text-sm font-bold transition cursor-pointer ${
                        isCurrent
                          ? 'bg-slate-800 text-white'
                          : isAnswered
                            ? 'bg-[#EBF3F5] text-slate-800 border border-slate-400'
                            : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Main Question Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-5 shadow-xs">
            {/* Topic & Syllabus Ref Badge */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-[#EBF3F5] text-slate-800 border border-slate-300">
                {currentQ.topicCode} • {currentQ.topicTitle || currentQ.subject.toUpperCase()}
              </span>
              {currentQ.syllabusRef && (
                <span className="text-xs text-slate-600">
                  Objective: {currentQ.syllabusRef}
                </span>
              )}
            </div>

            {/* Question Stem */}
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 leading-snug">
              {currentQ.question}
            </h2>

            {/* Options List */}
            <div className="space-y-3 pt-2">
              {currentQ.options.map((optText, optIdx) => {
                const optLetter = ['A', 'B', 'C', 'D'][optIdx];
                const isSelected = selectedOption === optIdx;
                const isCorrect = isAnswerSubmitted && optIdx === currentQ.correctIndex;
                const isWrong = isAnswerSubmitted && isSelected && optIdx !== currentQ.correctIndex;

                let cardStyle = 'bg-[#FDFBF7] border-2 border-black text-slate-800 hover:bg-white';
                let letterStyle = 'bg-slate-100 text-slate-800 border border-slate-300';

                if (isSelected && !isAnswerSubmitted) {
                  cardStyle = 'bg-[#EBF3F5] border-2 border-slate-800 text-slate-800 font-bold';
                  letterStyle = 'bg-slate-800 text-white';
                }

                if (isCorrect) {
                  cardStyle = 'bg-emerald-50 border-2 border-emerald-700 text-emerald-900 font-bold';
                  letterStyle = 'bg-emerald-700 text-white';
                } else if (isWrong) {
                  cardStyle = 'bg-rose-50 border-2 border-rose-700 text-rose-900 font-bold';
                  letterStyle = 'bg-rose-700 text-white';
                }

                return (
                  <button
                    key={optIdx}
                    disabled={isAnswerSubmitted}
                    onClick={() => handleSelectOption(optIdx)}
                    className={`w-full p-4 rounded-lg border-2 text-left flex items-start gap-3.5 transition cursor-pointer ${cardStyle}`}
                  >
                    <div className={`w-7 h-7 rounded-md flex items-center justify-center font-bold text-xs shrink-0 ${letterStyle}`}>
                      {isCorrect ? <Check className="w-4 h-4" /> : isWrong ? <XCircle className="w-4 h-4" /> : optLetter}
                    </div>

                    <div className="flex-1 text-base leading-relaxed pt-0.5">
                      {optText}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Bottom Actions & Explanation */}
            <div className="pt-4 border-t border-slate-200 space-y-4">
              {!isAnswerSubmitted ? (
                <div className="flex justify-end">
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={selectedOption === null}
                    className={`px-6 py-2.5 rounded-lg text-sm font-bold transition ${
                      selectedOption === null
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-slate-800 hover:bg-slate-700 text-white cursor-pointer'
                    }`}
                  >
                    Submit Answer
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Result Banner */}
                  <div className={`p-4 rounded-lg text-base flex items-start gap-3 border ${
                    selectedOption === currentQ.correctIndex
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : 'bg-rose-50 border-rose-300 text-rose-900'
                  }`}>
                    {selectedOption === currentQ.correctIndex ? (
                      <CheckCircle className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1">
                      <strong className="block text-base">
                        {selectedOption === currentQ.correctIndex ? 'Correct Answer' : 'Incorrect Answer'}
                      </strong>
                      <p className="text-sm leading-relaxed">
                        {currentQ.explanation}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <button
                      onClick={() => onAskAITutor(
                        `Explain Cambridge 0653 ${currentQ.topicCode} question: "${currentQ.question}" and why the answer is "${currentQ.options[currentQ.correctIndex]}"`,
                        currentQ.topicCode
                      )}
                      className="px-4 py-2 rounded-lg bg-[#FDFBF7] hover:bg-slate-100 border border-slate-300 text-slate-800 text-sm font-bold flex items-center gap-2 transition cursor-pointer"
                    >
                      <Brain className="w-4 h-4 text-slate-700" />
                      <span>Ask AI Tutor</span>
                    </button>

                    <button
                      onClick={handleNextQuestion}
                      className="px-6 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold flex items-center gap-2 transition cursor-pointer"
                    >
                      <span>{currentIdx < questions.length - 1 ? 'Next Question' : 'View Results'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. RESULTS & ANALYTICS PHASE */}
      {phase === 'completed' && (
        <div className="space-y-6">
          {/* Main Results Score Banner */}
          <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-xs text-center space-y-6">
            <div className="relative inline-flex items-center justify-center w-36 h-36 rounded-full border-4 border-slate-800 bg-[#EBF3F5]">
              <div className="flex flex-col items-center justify-center">
                <span className="text-xs font-bold text-slate-600">Score</span>
                <span className="text-3xl font-bold text-slate-800">
                  {score}/{questions.length}
                </span>
                <span className="text-xs font-bold text-slate-700">Grade {gradeInfo.grade}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-600 block">
                Completed in {formatTime(timerSeconds)}
              </span>
              <h2 className="text-2xl font-bold text-slate-800">
                {score} of {questions.length} Correct ({gradeInfo.percentage}%)
              </h2>
              <p className="text-base text-slate-600 max-w-md mx-auto pt-1">
                {gradeInfo.feedback}
              </p>
            </div>

            {/* Subject Breakdown Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mx-auto pt-2">
              <div className="p-4 rounded-lg bg-[#FDFBF7] border border-slate-200 text-center space-y-1">
                <span className="text-xs font-bold text-slate-600 block">Biology</span>
                <div className="text-xl font-bold text-slate-800">
                  {subjectBreakdown.biology.correct} / {subjectBreakdown.biology.total}
                </div>
                <div className="text-xs text-slate-500">
                  {subjectBreakdown.biology.total > 0 ? `${Math.round((subjectBreakdown.biology.correct / subjectBreakdown.biology.total) * 100)}%` : 'N/A'}
                </div>
              </div>

              <div className="p-4 rounded-lg bg-[#FDFBF7] border border-slate-200 text-center space-y-1">
                <span className="text-xs font-bold text-slate-600 block">Chemistry</span>
                <div className="text-xl font-bold text-slate-800">
                  {subjectBreakdown.chemistry.correct} / {subjectBreakdown.chemistry.total}
                </div>
                <div className="text-xs text-slate-500">
                  {subjectBreakdown.chemistry.total > 0 ? `${Math.round((subjectBreakdown.chemistry.correct / subjectBreakdown.chemistry.total) * 100)}%` : 'N/A'}
                </div>
              </div>

              <div className="p-4 rounded-lg bg-[#FDFBF7] border border-slate-200 text-center space-y-1">
                <span className="text-xs font-bold text-slate-600 block">Physics</span>
                <div className="text-xl font-bold text-slate-800">
                  {subjectBreakdown.physics.correct} / {subjectBreakdown.physics.total}
                </div>
                <div className="text-xs text-slate-500">
                  {subjectBreakdown.physics.total > 0 ? `${Math.round((subjectBreakdown.physics.correct / subjectBreakdown.physics.total) * 100)}%` : 'N/A'}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-slate-200">
              <button
                onClick={() => setPhase('config')}
                className="px-6 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold flex items-center gap-2 cursor-pointer transition"
              >
                <Sliders className="w-4 h-4" />
                <span>Configure New Quiz</span>
              </button>

              <button
                onClick={() => handleStartGeneration(true)}
                className="px-6 py-2.5 rounded-lg bg-[#EBF3F5] hover:bg-[#d8e9ec] border border-slate-400 text-slate-800 text-sm font-bold flex items-center gap-2 cursor-pointer transition"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry Quiz</span>
              </button>
            </div>
          </div>

          {/* Weak Topics Analysis */}
          {weakTopicsInQuiz.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-3">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-600" />
                <span>Priority Revision Areas</span>
              </h3>
              <p className="text-sm text-slate-600">
                You had incorrect responses in these topics:
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {weakTopicsInQuiz.map(wt => (
                  <span
                    key={wt}
                    className="px-3 py-1 rounded-md bg-rose-50 border border-rose-300 text-rose-800 text-xs font-bold"
                  >
                    {wt}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Question-by-Question Review */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-700" />
                <span>Question Review ({questions.length} Items)</span>
              </h3>

              <div className="flex items-center gap-2">
                {(['all', 'incorrect', 'correct'] as const).map(filt => (
                  <button
                    key={filt}
                    onClick={() => setReviewFilter(filt)}
                    className={`px-3 py-1 rounded-md text-xs font-bold capitalize transition cursor-pointer border ${
                      reviewFilter === filt
                        ? 'bg-slate-800 text-white border-slate-800'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {filt}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {questions.map((q, idx) => {
                const userAnsIdx = userAnswers[idx];
                const isCorrect = userAnsIdx === q.correctIndex;

                if (reviewFilter === 'incorrect' && isCorrect) return null;
                if (reviewFilter === 'correct' && !isCorrect) return null;

                return (
                  <div
                    key={q.id || idx}
                    className={`p-5 rounded-lg border transition space-y-3 ${
                      isCorrect
                        ? 'bg-white border-emerald-300'
                        : 'bg-white border-rose-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs ${
                          isCorrect ? 'bg-emerald-700 text-white' : 'bg-rose-700 text-white'
                        }`}>
                          {idx + 1}
                        </span>
                        <strong className="text-slate-800">
                          {q.topicCode} • {q.topicTitle || q.subject}
                        </strong>
                      </div>

                      <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                        isCorrect ? 'bg-emerald-50 text-emerald-800 border border-emerald-300' : 'bg-rose-50 text-rose-800 border border-rose-300'
                      }`}>
                        {isCorrect ? 'Correct (+1)' : 'Incorrect (0)'}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-slate-800 leading-relaxed">
                      {q.question}
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="p-3 rounded-md bg-[#FDFBF7] border border-slate-200 space-y-0.5">
                        <span className="text-xs text-slate-500 font-bold block">Your Answer:</span>
                        <strong className={isCorrect ? 'text-emerald-800' : 'text-rose-800'}>
                          {userAnsIdx !== null && userAnsIdx !== undefined ? `${['A', 'B', 'C', 'D'][userAnsIdx]}: ${q.options[userAnsIdx]}` : 'Not answered'}
                        </strong>
                      </div>

                      <div className="p-3 rounded-md bg-[#FDFBF7] border border-slate-200 space-y-0.5">
                        <span className="text-xs text-slate-500 font-bold block">Correct Answer:</span>
                        <strong className="text-emerald-800">
                          {['A', 'B', 'C', 'D'][q.correctIndex]}: {q.options[q.correctIndex]}
                        </strong>
                      </div>
                    </div>

                    <p className="text-sm text-slate-700 bg-[#FDFBF7] p-3 rounded-md border border-slate-200 leading-relaxed">
                      <strong className="text-slate-800">Explanation: </strong> {q.explanation}
                    </p>

                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => onAskAITutor(
                          `Explain Cambridge 0653 ${q.topicCode} question: "${q.question}" and why the answer is "${q.options[q.correctIndex]}"`,
                          q.topicCode
                        )}
                        className="text-xs text-slate-700 hover:text-black flex items-center gap-1 font-bold transition cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Ask AI Tutor to explain this question</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
