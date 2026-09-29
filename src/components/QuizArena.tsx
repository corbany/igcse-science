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
  MessageSquare
} from 'lucide-react';
import { QuizQuestion, ScienceSubject } from '../types';
import { 
  ALL_SYLLABUS_TOPICS, 
  SyllabusTopicOption, 
  generateAIQuiz, 
  estimateCambridgeGrade 
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

  // Topic selection helpers
  const handleToggleTopic = (code: string) => {
    setSelectedTopics(prev => 
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const handleSelectAll = () => {
    setSelectedTopics(ALL_SYLLABUS_TOPICS.map(t => t.code));
  };

  const handleClearAll = () => {
    setSelectedTopics([]);
  };

  const handleSelectSubject = (subj: ScienceSubject) => {
    const codes = ALL_SYLLABUS_TOPICS.filter(t => t.subject === subj).map(t => t.code);
    setSelectedTopics(prev => Array.from(new Set([...prev, ...codes])));
  };

  const handleSelectOnlySubject = (subj: ScienceSubject) => {
    const codes = ALL_SYLLABUS_TOPICS.filter(t => t.subject === subj).map(t => t.code);
    setSelectedTopics(codes);
  };

  // Filtered topics for UI grid
  const filteredTopics = useMemo(() => {
    return ALL_SYLLABUS_TOPICS.filter(t => {
      const matchSubject = activeSubjectTab === 'all' || t.subject === activeSubjectTab;
      const matchQuery = !topicSearch.trim() || 
        t.code.toLowerCase().includes(topicSearch.toLowerCase()) ||
        t.title.toLowerCase().includes(topicSearch.toLowerCase()) ||
        t.keyConcepts.toLowerCase().includes(topicSearch.toLowerCase());
      return matchSubject && matchQuery;
    });
  }, [activeSubjectTab, topicSearch]);

  // Start Generation of New AI Quiz
  const handleStartGeneration = async () => {
    if (selectedTopics.length === 0) return;

    setPhase('generating');
    try {
      const result = await generateAIQuiz({
        topics: selectedTopics,
        numQuestions: numQuestions,
        tier: tier
      });

      setQuestions(result.questions);
      setGenerationSource(result.source);
      setCurrentIdx(0);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
      setUserAnswers(new Array(result.questions.length).fill(null));
      setScore(0);
      setTimerSeconds(0);
      setIsTimerRunning(true);
      setPhase('active');
    } catch (err) {
      console.error('Failed to generate quiz:', err);
      setPhase('config');
    }
  };

  // Handling Answer Submission
  const currentQ = questions[currentIdx];

  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null || !currentQ || isAnswerSubmitted) return;

    const isCorrect = selectedOption === currentQ.correctIndex;
    setIsAnswerSubmitted(true);

    const updatedAnswers = [...userAnswers];
    updatedAnswers[currentIdx] = selectedOption;
    setUserAnswers(updatedAnswers);

    if (isCorrect) {
      setScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentIdx < questions.length - 1) {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      const existingAnswer = userAnswers[nextIdx];
      setSelectedOption(existingAnswer !== null && existingAnswer !== undefined ? existingAnswer : null);
      setIsAnswerSubmitted(existingAnswer !== null && existingAnswer !== undefined);
    } else {
      // Quiz complete
      handleFinishQuiz();
    }
  };

  const handleJumpToQuestion = (targetIdx: number) => {
    if (targetIdx < 0 || targetIdx >= questions.length) return;
    setCurrentIdx(targetIdx);
    const existing = userAnswers[targetIdx];
    setSelectedOption(existing !== null && existing !== undefined ? existing : null);
    setIsAnswerSubmitted(existing !== null && existing !== undefined);
    setIsNavDrawerOpen(false);
  };

  const handleFinishQuiz = () => {
    setIsTimerRunning(false);
    setPhase('completed');

    // Determine primary subject or mixed
    const subjects = questions.map(q => q.subject);
    const uniqueSubj = Array.from(new Set(subjects));
    const mainSubject = uniqueSubj.length === 1 ? uniqueSubj[0] : 'all';

    onQuizCompleted(mainSubject, score + (isAnswerSubmitted && selectedOption === currentQ?.correctIndex ? 0 : 0), questions.length);
  };

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  // Results calculation
  const gradeInfo = useMemo(() => {
    return estimateCambridgeGrade(score, questions.length);
  }, [score, questions.length]);

  // Subject breakdown for results
  const subjectBreakdown = useMemo(() => {
    const map: Record<ScienceSubject, { correct: number; total: number }> = {
      biology: { correct: 0, total: 0 },
      chemistry: { correct: 0, total: 0 },
      physics: { correct: 0, total: 0 }
    };

    questions.forEach((q, idx) => {
      const ans = userAnswers[idx];
      map[q.subject].total += 1;
      if (ans === q.correctIndex) {
        map[q.subject].correct += 1;
      }
    });

    return map;
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
    <div className="max-w-5xl mx-auto space-y-6">
      {/* ============================================================= */}
      {/* 1. QUIZ BUILDER & TOPIC SELECTION PHASE                      */}
      {/* ============================================================= */}
      {phase === 'config' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/60 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Gemini AI Practice Engine</span>
                  </span>
                  <span className="text-xs text-slate-400">
                    Cambridge IGCSE 0653 Multiple Choice (Paper 1 & 2)
                  </span>
                </div>
                <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
                  <Award className="w-7 h-7 text-emerald-400" />
                  <span>AI Practice Quiz Generator</span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
                  Choose the exact syllabus topics you want to practice and set the number of questions (up to 40). Every session generates a brand-new set of multiple choice questions based on official Cambridge syllabus content.
                </p>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-center shrink-0">
                <div className="text-2xl font-black text-emerald-400 font-mono">
                  {selectedTopics.length} / {ALL_SYLLABUS_TOPICS.length}
                </div>
                <div className="text-xs text-slate-400 font-medium">Topics Selected</div>
              </div>
            </div>
          </div>

          {/* Configuration Card: Number of Questions & Tier */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Question Count Selector (Max 40) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-white flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-emerald-400" />
                    <span>Number of Questions (Max 40)</span>
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
                      className="w-14 px-2 py-1 text-center font-mono font-bold text-xs rounded-lg bg-slate-950 border border-emerald-500/40 text-emerald-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <span className="text-xs font-mono font-bold px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      / 40 max
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <input
                    type="range"
                    min="1"
                    max="40"
                    value={numQuestions}
                    onChange={e => setNumQuestions(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>1 miniquiz</span>
                    <span>10 standard</span>
                    <span>20 half paper</span>
                    <span>40 full mock (max)</span>
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {[5, 10, 15, 20, 30, 40].map(cnt => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setNumQuestions(cnt)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                        numQuestions === cnt
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                      }`}
                    >
                      {cnt === 40 ? '40 (Full Paper Mock)' : `${cnt} Qs`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Examination Tier */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-white flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-purple-400" />
                  <span>Curriculum Tier</span>
                </label>

                <div className="grid grid-cols-3 gap-2">
                  {(['Extended', 'Core', 'Mixed'] as const).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTier(t)}
                      className={`p-3 rounded-2xl border text-center transition ${
                        tier === t
                          ? 'bg-purple-600/20 border-purple-500 text-white font-bold'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="text-xs font-bold">{t}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {t === 'Extended' ? 'Paper 2 (A*–C)' : t === 'Core' ? 'Paper 1 (C–G)' : 'All Levels'}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="text-[11px] text-slate-400 pt-1 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Estimated duration: ~{Math.round(numQuestions * 1.5)} minutes (1.5 min / question)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Topic Selection Area */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="space-y-1">
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-emerald-400" />
                  <span>Choose Topics to Cover</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Select individual units or use the quick subject presets below.
                </p>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
                >
                  All 33 Topics
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectOnlySubject('biology')}
                  className="px-2.5 py-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/30 text-xs font-semibold text-emerald-300 transition"
                >
                  Bio Only (B1–B16)
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectOnlySubject('chemistry')}
                  className="px-2.5 py-1.5 rounded-xl bg-sky-950/60 hover:bg-sky-900/60 border border-sky-500/30 text-xs font-semibold text-sky-300 transition"
                >
                  Chem Only (C1–C12)
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectOnlySubject('physics')}
                  className="px-2.5 py-1.5 rounded-xl bg-amber-950/60 hover:bg-amber-900/60 border border-amber-500/30 text-xs font-semibold text-amber-300 transition"
                >
                  Phys Only (P1–P5)
                </button>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-400 hover:text-white transition"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Subject Tabs & Search Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-2xl text-xs overflow-x-auto">
                <button
                  onClick={() => setActiveSubjectTab('all')}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition ${
                    activeSubjectTab === 'all'
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All ({ALL_SYLLABUS_TOPICS.length})
                </button>
                <button
                  onClick={() => setActiveSubjectTab('biology')}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition flex items-center gap-1.5 ${
                    activeSubjectTab === 'biology'
                      ? 'bg-emerald-600 text-white'
                      : 'text-emerald-400 hover:bg-slate-850'
                  }`}
                >
                  <Dna className="w-3.5 h-3.5" />
                  <span>Biology (16)</span>
                </button>
                <button
                  onClick={() => setActiveSubjectTab('chemistry')}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition flex items-center gap-1.5 ${
                    activeSubjectTab === 'chemistry'
                      ? 'bg-sky-600 text-white'
                      : 'text-sky-400 hover:bg-slate-850'
                  }`}
                >
                  <Atom className="w-3.5 h-3.5" />
                  <span>Chemistry (12)</span>
                </button>
                <button
                  onClick={() => setActiveSubjectTab('physics')}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition flex items-center gap-1.5 ${
                    activeSubjectTab === 'physics'
                      ? 'bg-amber-600 text-white'
                      : 'text-amber-400 hover:bg-slate-850'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Physics (5)</span>
                </button>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={topicSearch}
                  onChange={e => setTopicSearch(e.target.value)}
                  placeholder="Filter topics (e.g. Cells, C4, Waves)..."
                  className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full sm:w-64"
                />
              </div>
            </div>

            {/* Topic Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-1">
              {filteredTopics.map(t => {
                const isSelected = selectedTopics.includes(t.code);
                let badgeClass = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
                if (t.subject === 'chemistry') badgeClass = 'bg-sky-500/20 text-sky-300 border-sky-500/40';
                if (t.subject === 'physics') badgeClass = 'bg-amber-500/20 text-amber-300 border-amber-500/40';

                return (
                  <div
                    key={t.code}
                    onClick={() => handleToggleTopic(t.code)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition select-none flex items-start gap-3 ${
                      isSelected
                        ? 'bg-slate-850 border-emerald-500/50 shadow-xs'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="pt-0.5">
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-600 shrink-0" />
                      )}
                    </div>

                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${badgeClass}`}>
                          {t.code}
                        </span>
                        <span className="text-xs font-bold text-white truncate">
                          {t.title}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-1">
                        {t.keyConcepts}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedTopics.length === 0 && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Please select at least 1 topic to generate a quiz.</span>
              </div>
            )}
          </div>

          {/* Start Button */}
          <div className="flex items-center justify-end gap-4">
            <button
              onClick={handleStartGeneration}
              disabled={selectedTopics.length === 0}
              className={`w-full sm:w-auto px-8 py-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2.5 transition shadow-lg ${
                selectedTopics.length === 0
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/30'
              }`}
            >
              <Sparkles className="w-4 h-4 text-emerald-200" />
              <span>
                Generate AI Quiz ({numQuestions} Questions across {selectedTopics.length} Topics)
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* 2. GENERATING PHASE                                          */}
      {/* ============================================================= */}
      {phase === 'generating' && (
        <div className="min-h-[450px] bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-emerald-400 animate-pulse" />
            </div>
          </div>

          <div className="space-y-2 max-w-md">
            <h2 className="text-xl font-black text-white">
              Generating Fresh Cambridge Questions...
            </h2>
            <p className="text-xs text-slate-400">
              Gemini AI is crafting {numQuestions} brand-new multiple choice questions aligned with official Cambridge 0653 objectives for your {selectedTopics.length} selected topics.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 max-w-lg space-y-1">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
              Cambridge 0653 Exam Tip
            </span>
            <p className="text-slate-400">
              Paper 1 & Paper 2 consist of 40 multiple-choice questions with 4 options each. All questions are worth 1 mark, with no penalties for incorrect answers.
            </p>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* 3. ACTIVE QUIZ TAKING PHASE                                  */}
      {/* ============================================================= */}
      {phase === 'active' && currentQ && (
        <div className="space-y-6">
          {/* Top Control Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Question {currentIdx + 1} of {questions.length}
              </span>

              <span className="text-xs font-semibold text-slate-400 hidden sm:inline">
                Score: <strong className="text-white font-mono">{score}</strong> / {currentIdx + (isAnswerSubmitted ? 1 : 0)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Elapsed Timer */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{formatTime(timerSeconds)}</span>
              </div>

              {/* Question Grid Navigator Button */}
              <button
                onClick={() => setIsNavDrawerOpen(prev => !prev)}
                className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition flex items-center gap-1"
              >
                <span>Grid</span>
                {isNavDrawerOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>

              <button
                onClick={handleFinishQuiz}
                className="px-3 py-1 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 border border-rose-500/40 text-rose-300 text-xs font-semibold transition"
              >
                End Quiz
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
              style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
            ></div>
          </div>

          {/* Question Navigator Drawer */}
          {isNavDrawerOpen && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 animate-in fade-in space-y-2">
              <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Quick Jump to Question</span>
                <span className="text-[11px] text-slate-500">Green = Answered • Blue = Current</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {questions.map((q, idx) => {
                  const isCurrent = idx === currentIdx;
                  const isAnswered = userAnswers[idx] !== null && userAnswers[idx] !== undefined;

                  return (
                    <button
                      key={q.id || idx}
                      onClick={() => handleJumpToQuestion(idx)}
                      className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition ${
                        isCurrent
                          ? 'bg-indigo-600 text-white ring-2 ring-indigo-400'
                          : isAnswered
                            ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                            : 'bg-slate-850 text-slate-400 hover:text-white'
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
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            {/* Topic & Syllabus Ref Badge */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-md border ${
                currentQ.subject === 'biology'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : currentQ.subject === 'chemistry'
                    ? 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              }`}>
                {currentQ.topicCode} • {currentQ.topicTitle || currentQ.subject.toUpperCase()}
              </span>

              <span className="text-[11px] font-mono text-slate-400">
                Syllabus: {currentQ.syllabusRef}
              </span>
            </div>

            {/* Question Stem */}
            <h2 className="text-base sm:text-xl font-bold text-white leading-relaxed">
              {currentQ.question}
            </h2>

            {/* Options List */}
            <div className="space-y-3 pt-2">
              {currentQ.options.map((optText, optIdx) => {
                const optLetter = ['A', 'B', 'C', 'D'][optIdx];
                const isSelected = selectedOption === optIdx;
                const isCorrect = isAnswerSubmitted && optIdx === currentQ.correctIndex;
                const isWrong = isAnswerSubmitted && isSelected && optIdx !== currentQ.correctIndex;

                let cardStyle = 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-200';
                let letterStyle = 'bg-slate-800 text-slate-300';

                if (isSelected && !isAnswerSubmitted) {
                  cardStyle = 'bg-indigo-950/40 border-indigo-500 text-white ring-1 ring-indigo-500';
                  letterStyle = 'bg-indigo-600 text-white';
                }

                if (isCorrect) {
                  cardStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500';
                  letterStyle = 'bg-emerald-600 text-white';
                } else if (isWrong) {
                  cardStyle = 'bg-rose-950/60 border-rose-500 text-rose-200 ring-1 ring-rose-500';
                  letterStyle = 'bg-rose-600 text-white';
                }

                return (
                  <button
                    key={optIdx}
                    disabled={isAnswerSubmitted}
                    onClick={() => handleSelectOption(optIdx)}
                    className={`w-full p-4 rounded-2xl border text-left flex items-start gap-3.5 transition ${cardStyle}`}
                  >
                    <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${letterStyle}`}>
                      {isCorrect ? <Check className="w-4 h-4" /> : isWrong ? <XCircle className="w-4 h-4" /> : optLetter}
                    </div>

                    <div className="flex-1 text-xs sm:text-sm font-medium leading-relaxed pt-0.5">
                      {optText}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Bottom Actions & Explanation */}
            <div className="pt-4 border-t border-slate-800 space-y-4">
              {!isAnswerSubmitted ? (
                <div className="flex justify-end">
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={selectedOption === null}
                    className={`px-6 py-2.5 rounded-xl text-xs font-bold transition shadow-md ${
                      selectedOption === null
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                    }`}
                  >
                    Submit Answer
                  </button>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in">
                  {/* Result Banner */}
                  <div className={`p-4 rounded-2xl text-xs sm:text-sm flex items-start gap-3 ${
                    selectedOption === currentQ.correctIndex
                      ? 'bg-emerald-950/50 border border-emerald-500/40 text-emerald-300'
                      : 'bg-rose-950/50 border border-rose-500/40 text-rose-300'
                  }`}>
                    {selectedOption === currentQ.correctIndex ? (
                      <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1">
                      <div className="font-bold">
                        {selectedOption === currentQ.correctIndex ? 'Correct!' : 'Incorrect'}
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {currentQ.explanation}
                      </p>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <button
                      onClick={() => onAskAITutor(
                        `Explain Cambridge 0653 ${currentQ.topicCode} question: "${currentQ.question}" and why the answer is "${currentQ.options[currentQ.correctIndex]}"`,
                        currentQ.topicCode
                      )}
                      className="px-3.5 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <Brain className="w-4 h-4 text-indigo-400" />
                      <span>Ask AI Tutor About This</span>
                    </button>

                    <button
                      onClick={handleNextQuestion}
                      className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 transition shadow-md shadow-emerald-600/20"
                    >
                      <span>{currentIdx < questions.length - 1 ? 'Next Question' : 'Finish & View Results'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* 4. RESULTS & ANALYTICS PHASE                                 */}
      {/* ============================================================= */}
      {phase === 'completed' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Main Results Score Banner */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-6">
            <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 mb-1">
              <Award className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Quiz Complete • Time: {formatTime(timerSeconds)}
              </span>
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                {score} / {questions.length} Correct
              </h1>
              <div className="text-xl sm:text-2xl font-black text-emerald-400">
                {gradeInfo.percentage}% • Cambridge Grade: {gradeInfo.grade}
              </div>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto pt-1">
                {gradeInfo.feedback}
              </p>
            </div>

            {/* Subject Breakdown Chips */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mx-auto pt-2">
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-0.5">
                <span className="text-[11px] font-bold text-emerald-400">Biology</span>
                <div className="text-lg font-black text-white font-mono">
                  {subjectBreakdown.biology.correct} / {subjectBreakdown.biology.total}
                </div>
                <div className="text-[10px] text-slate-500">
                  {subjectBreakdown.biology.total > 0 ? `${Math.round((subjectBreakdown.biology.correct / subjectBreakdown.biology.total) * 100)}%` : 'N/A'}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-0.5">
                <span className="text-[11px] font-bold text-sky-400">Chemistry</span>
                <div className="text-lg font-black text-white font-mono">
                  {subjectBreakdown.chemistry.correct} / {subjectBreakdown.chemistry.total}
                </div>
                <div className="text-[10px] text-slate-500">
                  {subjectBreakdown.chemistry.total > 0 ? `${Math.round((subjectBreakdown.chemistry.correct / subjectBreakdown.chemistry.total) * 100)}%` : 'N/A'}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-0.5">
                <span className="text-[11px] font-bold text-amber-400">Physics</span>
                <div className="text-lg font-black text-white font-mono">
                  {subjectBreakdown.physics.correct} / {subjectBreakdown.physics.total}
                </div>
                <div className="text-[10px] text-slate-500">
                  {subjectBreakdown.physics.total > 0 ? `${Math.round((subjectBreakdown.physics.correct / subjectBreakdown.physics.total) * 100)}%` : 'N/A'}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => setPhase('config')}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-md shadow-emerald-600/30 flex items-center gap-2"
              >
                <Sliders className="w-4 h-4" />
                <span>Configure New Quiz</span>
              </button>

              <button
                onClick={handleStartGeneration}
                className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow-md shadow-purple-600/30 flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Regenerate Fresh AI Questions (Same Topics)</span>
              </button>
            </div>
          </div>

          {/* Weak Topics Analysis */}
          {weakTopicsInQuiz.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-3 shadow-sm">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-rose-400" />
                <span>Priority Revision Areas Identified</span>
              </h3>
              <p className="text-xs text-slate-400">
                You had mistakes in these topics. Consider reviewing the corresponding interactive lesson slides:
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {weakTopicsInQuiz.map(wt => (
                  <span
                    key={wt}
                    className="px-3 py-1 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold"
                  >
                    {wt}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Question-by-Question Review */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span>Question Review ({questions.length} Items)</span>
              </h3>

              <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl text-xs">
                {(['all', 'incorrect', 'correct'] as const).map(filt => (
                  <button
                    key={filt}
                    onClick={() => setReviewFilter(filt)}
                    className={`px-3 py-1 rounded-lg capitalize font-semibold transition ${
                      reviewFilter === filt
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-400 hover:text-white'
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
                    className={`p-5 rounded-2xl border transition space-y-3 ${
                      isCorrect
                        ? 'bg-emerald-950/15 border-emerald-500/30'
                        : 'bg-rose-950/15 border-rose-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                          isCorrect ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                        }`}>
                          {idx + 1}
                        </span>
                        <span className="font-mono font-bold text-slate-300">
                          {q.topicCode} • {q.topicTitle || q.subject}
                        </span>
                      </div>

                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isCorrect ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                      }`}>
                        {isCorrect ? 'Correct (+1)' : 'Incorrect (0)'}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white">
                      {q.question}
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-0.5">
                        <span className="text-[10px] text-slate-400 block">Your Answer</span>
                        <span className={isCorrect ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                          {userAnsIdx !== null && userAnsIdx !== undefined ? `${['A', 'B', 'C', 'D'][userAnsIdx]}: ${q.options[userAnsIdx]}` : 'Not answered'}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-0.5">
                        <span className="text-[10px] text-slate-400 block">Correct Cambridge Answer</span>
                        <span className="text-emerald-400 font-semibold">
                          {['A', 'B', 'C', 'D'][q.correctIndex]}: {q.options[q.correctIndex]}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 bg-slate-950/40 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
                      <strong className="text-emerald-400">Examiner Rationale:</strong> {q.explanation}
                    </p>

                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => onAskAITutor(
                          `Explain Cambridge 0653 ${q.topicCode} question: "${q.question}" and why the answer is "${q.options[q.correctIndex]}"`,
                          q.topicCode
                        )}
                        className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>Ask AI Tutor to break this down</span>
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
