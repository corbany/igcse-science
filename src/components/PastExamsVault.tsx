import React, { useState, useMemo, useEffect } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  HelpCircle, 
  Sparkles, 
  Search, 
  Clock, 
  BookOpen, 
  Check, 
  X,
  ExternalLink,
  Award,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Send,
  Loader2,
  Table as TableIcon,
  Eye,
  AlertCircle,
  GraduationCap
} from 'lucide-react';
import { PastExamPaper, ExamQuestionItem, ScienceSubject, ExamAnswerAnalysis } from '../types';
import { pastExamPapers } from '../data/pastPapersData';
import { ExamPaperFigureScreenshot } from './ExamPaperFigureScreenshot';
import { getCachedDrivePdfs, DriveSyncedPdfItem, TARGET_DRIVE_FOLDER_URL } from '../services/googleDriveService';

interface PastExamsVaultProps {
  isInstructor?: boolean;
  onAskAITutor: (query: string, topicCode: string) => void;
}

const STORAGE_PREFIX = 'cambridge_0653_answers_';

export const PastExamsVault: React.FC<PastExamsVaultProps> = ({ isInstructor = false, onAskAITutor }) => {
  const [selectedPaperId, setSelectedPaperId] = useState<string>(pastExamPapers[0]?.id || '');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<ScienceSubject | 'all'>('all');
  
  // Student typed responses & MCQ choices
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_PREFIX}global`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Solutions & Mark Scheme visibility
  const [revealedSolutions, setRevealedSolutions] = useState<Record<string, boolean>>({});

  // AI Analysis states
  const [analyses, setAnalyses] = useState<Record<string, ExamAnswerAnalysis>>({});
  const [isAnalyzing, setIsAnalyzing] = useState<Record<string, boolean>>({});
  const [analysisErrors, setAnalysisErrors] = useState<Record<string, string>>({});

  // Candidate Details for authentic paper feel
  const [candidateName, setCandidateName] = useState('Alex Taylor');
  const [candidateNumber, setCandidateNumber] = useState('0042');
  const [centreNumber, setCentreNumber] = useState('GB0653');

  // Periodic Table modal toggle
  const [showPeriodicTable, setShowPeriodicTable] = useState(false);

  // Full paper summary modal
  const [showScoreModal, setShowScoreModal] = useState(false);

  // Active exam paper
  const activePaper = useMemo(() => {
    return pastExamPapers.find(p => p.id === selectedPaperId) || pastExamPapers[0];
  }, [selectedPaperId]);

  // Persist answers
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}global`, JSON.stringify(userAnswers));
    } catch (e) {
      console.error('Failed to save answers', e);
    }
  }, [userAnswers]);

  const filteredQuestions = useMemo(() => {
    if (!activePaper) return [];
    if (selectedSubjectFilter === 'all') return activePaper.questions;
    return activePaper.questions.filter(q => q.subject === selectedSubjectFilter);
  }, [activePaper, selectedSubjectFilter]);

  const handleTextAnswerChange = (questionId: string, text: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: text
    }));
  };

  const handleSelectOption = (questionId: string, optionKey: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: optionKey
    }));
  };

  const toggleSolution = (questionId: string) => {
    setRevealedSolutions(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  // Trigger AI Analysis against the official Cambridge Mark Scheme
  const handleAnalyzeAnswer = async (question: ExamQuestionItem) => {
    const studentAnswer = userAnswers[question.id];
    if (!studentAnswer || !studentAnswer.trim()) {
      alert('Please write an answer before requesting an AI Mark Scheme analysis.');
      return;
    }

    setIsAnalyzing(prev => ({ ...prev, [question.id]: true }));
    setAnalysisErrors(prev => ({ ...prev, [question.id]: '' }));

    try {
      const response = await fetch('/api/exam-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: question.id,
          fullLabel: question.fullLabel || `${question.number}`,
          questionText: question.questionText,
          marks: question.marks,
          correctAnswer: question.correctAnswer,
          markSchemeBreakdown: question.markSchemeBreakdown || [],
          guidanceNotes: question.guidanceNotes || [],
          examinerComment: question.examinerComment || '',
          studentAnswer: studentAnswer.trim(),
          paperCode: activePaper.code
        })
      });

      if (!response.ok) {
        throw new Error('Failed to evaluate answer. Please try again.');
      }

      const data = await response.json();
      if (data.analysis) {
        setAnalyses(prev => ({
          ...prev,
          [question.id]: data.analysis
        }));
      }
    } catch (err: any) {
      console.error('Error analyzing answer:', err);
      setAnalysisErrors(prev => ({
        ...prev,
        [question.id]: err.message || 'Error occurred while contacting Cambridge AI examiner.'
      }));
    } finally {
      setIsAnalyzing(prev => ({ ...prev, [question.id]: false }));
    }
  };

  // Calculate paper totals and grades
  const paperStats = useMemo(() => {
    if (!activePaper) return { totalEarned: 0, totalPossible: 0, percentage: 0, grade: 'U' };

    let totalEarned = 0;
    let totalPossible = 0;

    activePaper.questions.forEach(q => {
      totalPossible += q.marks;
      if (q.questionType === 'mcq') {
        if (userAnswers[q.id] === q.correctAnswer) {
          totalEarned += q.marks;
        }
      } else {
        const analysis = analyses[q.id];
        if (analysis) {
          totalEarned += analysis.marksAwarded;
        }
      }
    });

    const percentage = totalPossible > 0 ? Math.round((totalEarned / totalPossible) * 100) : 0;
    
    // Determine grade from boundaries
    let grade = 'U';
    const bounds = activePaper.gradeBoundaries;
    if (bounds) {
      if (bounds.aStar && totalEarned >= bounds.aStar) grade = 'A*';
      else if (bounds.a && totalEarned >= bounds.a) grade = 'A';
      else if (bounds.b && totalEarned >= bounds.b) grade = 'B';
      else if (bounds.c && totalEarned >= bounds.c) grade = 'C';
      else if (bounds.d && totalEarned >= bounds.d) grade = 'D';
      else if (bounds.e && totalEarned >= bounds.e) grade = 'E';
      else if (bounds.f && totalEarned >= bounds.f) grade = 'F';
      else if (bounds.g && totalEarned >= bounds.g) grade = 'G';
    }

    return { totalEarned, totalPossible, percentage, grade };
  }, [activePaper, userAnswers, analyses]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Cambridge IGCSE 0653 Interactive Exam Vault
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Official past papers with diagrams, candidate typing areas, and AI Mark Scheme Analysis
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowPeriodicTable(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition"
          >
            <TableIcon className="w-4 h-4 text-sky-400" />
            <span>Periodic Table</span>
          </button>

          <button
            onClick={() => setShowScoreModal(true)}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-2 transition shadow-sm"
          >
            <GraduationCap className="w-4 h-4" />
            <span>Paper Grade ({paperStats.totalEarned}/{paperStats.totalPossible})</span>
          </button>
        </div>
      </div>

      {/* Paper Selector Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {pastExamPapers.map(paper => {
          const isSelected = paper.id === selectedPaperId;
          return (
            <button
              key={paper.id}
              onClick={() => setSelectedPaperId(paper.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border shrink-0 flex items-center gap-2 ${
                isSelected
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-950/40'
                  : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="font-mono uppercase px-1.5 py-0.5 rounded bg-black/20 text-[10px]">
                {paper.code}
              </span>
              <span>{paper.paperNumber} ({paper.series})</span>
            </button>
          );
        })}
      </div>

      {/* Examination Paper Figures Info Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2.5 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong className="text-white">Official Examination Paper Figures:</strong> All official paper figures (apparatus, circuit schematics, meters, graphs, and anatomical diagrams) are automatically inserted into the corresponding questions. Click any figure to enlarge to full screen.
          </span>
        </div>
        {isInstructor && (
          <div className="flex items-center gap-3 shrink-0">
            <a
              href={TARGET_DRIVE_FOLDER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 font-semibold transition"
              title="Open Google Drive folder in a new tab"
            >
              <span>Drive Folder (1NUzEO8F)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </div>

      {/* Active Paper Document View */}
      {activePaper && (
        <div className="space-y-6">
          {/* Authentic Cambridge Exam Paper Header Sheet */}
          <div className="bg-slate-900 border-2 border-slate-700/80 rounded-2xl p-6 space-y-5 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-4">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 font-bold block">
                  Cambridge Assessment International Education
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-white mt-1">
                  Cambridge IGCSE™ Combined Science {activePaper.code}
                </h2>
                <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-400">
                  <span className="font-medium text-slate-300">{activePaper.title}</span>
                  <span>•</span>
                  <span>{activePaper.series}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-sky-400">
                    <Clock className="w-3.5 h-3.5" />
                    {activePaper.duration}
                  </span>
                  <span>•</span>
                  <span className="font-semibold text-amber-400">
                    [Total Marks: {activePaper.totalMarks}]
                  </span>
                </div>
              </div>

              {/* Candidate Info Input Box */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-xs space-y-2 shrink-0 sm:w-72">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-400">Candidate:</span>
                  <input
                    type="text"
                    value={candidateName}
                    onChange={e => setCandidateName(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-white font-medium text-right text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-400">Centre / Number:</span>
                  <div className="flex gap-1">
                    <input
                      type="text"
                      value={centreNumber}
                      onChange={e => setCentreNumber(e.target.value)}
                      className="w-16 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-white font-mono text-center text-xs focus:outline-none focus:border-emerald-500"
                    />
                    <input
                      type="text"
                      value={candidateNumber}
                      onChange={e => setCandidateNumber(e.target.value)}
                      className="w-14 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-white font-mono text-center text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Official Instructions */}
            {activePaper.examinerNotes && (
              <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 text-xs space-y-2">
                <span className="font-bold text-slate-300 uppercase tracking-wider block text-[11px]">
                  Official Candidate Instructions:
                </span>
                <ul className="list-disc pl-5 text-slate-400 space-y-1">
                  {activePaper.examinerNotes.map((note, i) => (
                    <li key={i}>{note}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Subject Filters within Paper */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-400 mr-1 font-medium">Filter Subject:</span>
                {(['all', 'biology', 'chemistry', 'physics'] as const).map(subj => (
                  <button
                    key={subj}
                    onClick={() => setSelectedSubjectFilter(subj)}
                    className={`px-3 py-1 rounded-lg capitalize font-medium transition ${
                      selectedSubjectFilter === subj
                        ? 'bg-slate-700 text-white font-bold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    {subj}
                  </button>
                ))}
              </div>

              <span className="text-xs text-slate-400">
                Showing {filteredQuestions.length} of {activePaper.questions.length} questions
              </span>
            </div>
          </div>

          {/* Question List */}
          <div className="space-y-8">
            {filteredQuestions.map(q => {
              const studentAnswer = userAnswers[q.id] || '';
              const isRevealed = revealedSolutions[q.id];
              const isMcq = q.questionType === 'mcq';
              const analysis = analyses[q.id];
              const analyzing = isAnalyzing[q.id];
              const analysisError = analysisErrors[q.id];

              return (
                <div 
                  key={q.id}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-6 space-y-5 transition shadow-sm"
                >
                  {/* Question Header */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold font-mono text-sm">
                        {q.fullLabel || q.number}
                      </span>
                      <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 uppercase">
                        {q.syllabusCode} • {q.subject}
                      </span>
                    </div>

                    <span className="text-xs font-bold text-amber-400 font-mono bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
                      [{q.marks} Mark{q.marks === 1 ? '' : 's'}]
                    </span>
                  </div>

                  {/* Question Prompt */}
                  <div className="text-sm sm:text-base font-normal text-slate-100 whitespace-pre-line leading-relaxed">
                    {q.questionText}
                  </div>

                  {/* Examination Paper Figure (Authentic PDF figure representation) */}
                  {(q.figureCaption || q.figureScreenshotUrl || q.diagramSvg || q.questionText.includes('Fig.')) ? (
                    <ExamPaperFigureScreenshot 
                      question={q} 
                      paperTitle={activePaper.title}
                    />
                  ) : null}

                  {/* Multiple Choice Options (for Paper 1 & 2) */}
                  {isMcq && q.options && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {q.options.map(opt => {
                        const isChosen = studentAnswer === opt.key;
                        const isCorrect = isRevealed && opt.key === q.correctAnswer;
                        const isWrong = isRevealed && isChosen && opt.key !== q.correctAnswer;

                        let style = 'bg-slate-950/70 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700';
                        if (isChosen && !isRevealed) {
                          style = 'bg-indigo-600/20 border-indigo-500 text-white font-semibold ring-1 ring-indigo-500/50';
                        } else if (isCorrect) {
                          style = 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-bold ring-1 ring-emerald-500';
                        } else if (isWrong) {
                          style = 'bg-rose-950/60 border-rose-500 text-rose-200';
                        }

                        return (
                          <button
                            key={opt.key}
                            onClick={() => handleSelectOption(q.id, opt.key)}
                            className={`text-left p-3.5 rounded-xl border text-xs sm:text-sm flex items-start gap-3 transition ${style}`}
                          >
                            <span className="font-bold font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700 shrink-0">
                              {opt.key}
                            </span>
                            <span className="leading-relaxed">{opt.text}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Interactive Written Answer Area (for Theory & Alternative to Practical) */}
                  {!isMcq && (
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between text-xs">
                        <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                          <span>Candidate Written Response:</span>
                        </label>
                        <span className="text-slate-500 font-mono">
                          {studentAnswer.trim() ? studentAnswer.trim().split(/\s+/).length : 0} words
                        </span>
                      </div>

                      <div className="relative">
                        <textarea
                          rows={q.marks >= 3 ? 5 : 3}
                          value={studentAnswer}
                          onChange={e => handleTextAnswerChange(q.id, e.target.value)}
                          placeholder={q.inputPlaceholder || "Type your answer here in complete scientific sentences (show calculations, formulas and units where applicable)..."}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 transition font-sans leading-relaxed"
                        />
                      </div>

                      {/* AI Examiner Analysis Action Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleAnalyzeAnswer(q)}
                            disabled={analyzing || !studentAnswer.trim()}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
                              analyzing
                                ? 'bg-indigo-700 text-white cursor-wait'
                                : studentAnswer.trim()
                                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                            }`}
                          >
                            {analyzing ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>AI Examiner Evaluating...</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                                <span>AI Mark Scheme Analysis</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => toggleSolution(q.id)}
                            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-400" />
                            <span>{isRevealed ? 'Hide Official Mark Scheme' : 'View Mark Scheme'}</span>
                          </button>
                        </div>

                        <button
                          onClick={() => onAskAITutor(`Please tutor me on Cambridge question ${q.fullLabel || q.number} (${q.syllabusCode}):\n\n${q.questionText}\n\nCandidate drafted: "${studentAnswer}"`, q.syllabusCode)}
                          className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-1"
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span>Ask AI Tutor for guidance</span>
                        </button>
                      </div>

                      {/* Error Banner */}
                      {analysisError && (
                        <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>{analysisError}</span>
                        </div>
                      )}

                      {/* AI Analysis Feedback Report */}
                      {analysis && (
                        <div className="mt-4 p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950/30 border border-indigo-500/30 text-xs space-y-4">
                          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-indigo-500/20 pb-3">
                            <div className="flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-indigo-400" />
                              <span className="font-bold text-white text-sm">Official Cambridge Examiner Assessment</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className={`px-3 py-1 rounded-full font-mono font-bold text-xs ${
                                analysis.marksAwarded === analysis.maxMarks
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : analysis.marksAwarded > 0
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              }`}>
                                Marks Awarded: {analysis.marksAwarded} / {analysis.maxMarks} ({analysis.percentage}%)
                              </span>
                            </div>
                          </div>

                          {/* Point-by-point breakdown */}
                          {analysis.markBreakdown && analysis.markBreakdown.length > 0 && (
                            <div className="space-y-2">
                              <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">
                                Mark Scheme Point Breakdown:
                              </span>
                              <div className="space-y-1.5">
                                {analysis.markBreakdown.map((pt, i) => (
                                  <div 
                                    key={i} 
                                    className={`p-2.5 rounded-xl border flex items-start gap-2.5 ${
                                      pt.awarded 
                                        ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200' 
                                        : 'bg-rose-950/20 border-rose-500/20 text-rose-300'
                                    }`}
                                  >
                                    <span className="shrink-0 mt-0.5">
                                      {pt.awarded ? (
                                        <Check className="w-4 h-4 text-emerald-400 font-bold" />
                                      ) : (
                                        <X className="w-4 h-4 text-rose-400" />
                                      )}
                                    </span>
                                    <div className="space-y-0.5">
                                      <span className="font-semibold block">{pt.point}</span>
                                      <span className="text-[11px] opacity-90 block">{pt.reason}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Examiner Feedback */}
                          {analysis.examinerFeedback && (
                            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-slate-300 leading-relaxed">
                              <span className="font-bold text-amber-400 mr-1">Examiner Note:</span>
                              {analysis.examinerFeedback}
                            </div>
                          )}

                          {/* Model Answer */}
                          {analysis.modelAnswer && (
                            <div className="bg-slate-950/60 p-3 rounded-xl border border-emerald-500/20 text-emerald-300/90 leading-relaxed">
                              <span className="font-bold text-emerald-400 block mb-1">Official Model Answer:</span>
                              {analysis.modelAnswer}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Official Published Mark Scheme & Examiner Notes Drawer */}
                  {isRevealed && (
                    <div className="mt-4 p-5 rounded-2xl bg-slate-950 border border-emerald-500/30 text-xs space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span className="font-bold text-emerald-300">Published Cambridge Mark Scheme</span>
                        </div>
                        <span className="font-mono text-emerald-400 font-bold">
                          Max: {q.marks} Mark{q.marks === 1 ? '' : 's'}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <span className="font-bold text-slate-300">Expected Response / Criteria:</span>
                        <p className="text-slate-200 whitespace-pre-line leading-relaxed font-sans">
                          {q.correctAnswer}
                        </p>
                      </div>

                      {q.markSchemeBreakdown && q.markSchemeBreakdown.length > 0 && (
                        <div className="space-y-1 pt-1">
                          <span className="font-semibold text-slate-400">Mark Points:</span>
                          <ul className="list-disc pl-5 text-slate-300 space-y-0.5">
                            {q.markSchemeBreakdown.map((pt, i) => (
                              <li key={i}>{pt}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {q.guidanceNotes && q.guidanceNotes.length > 0 && (
                        <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-slate-400 space-y-1">
                          <span className="font-bold text-sky-400 block text-[11px]">Examiner Guidance Notes:</span>
                          <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                            {q.guidanceNotes.map((g, i) => (
                              <li key={i}>{g}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {q.examinerComment && (
                        <div className="bg-amber-950/20 p-2.5 rounded-lg border border-amber-500/20 text-amber-300 text-[11px] leading-relaxed">
                          <span className="font-bold text-amber-400">Examiner Report Commentary: </span>
                          {q.examinerComment}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Candidate Script Case Study (for Example Candidate Responses) */}
                  {q.exampleCandidateResponse && (
                    <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-purple-500/30 text-xs space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-purple-300">Example Candidate Script & Examiner Critique:</span>
                        <span className="font-mono text-purple-400 font-bold">
                          Awarded: {q.exampleCandidateResponse.marksAwarded} / {q.marks}
                        </span>
                      </div>
                      <blockquote className="italic border-l-2 border-purple-500/50 pl-3 text-slate-300">
                        {q.exampleCandidateResponse.candidateAnswer}
                      </blockquote>
                      <p className="text-slate-400 text-[11px] leading-relaxed">
                        {q.exampleCandidateResponse.examinerComment}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Periodic Table Modal */}
      {showPeriodicTable && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TableIcon className="w-5 h-5 text-sky-400" />
                <h3 className="font-bold text-white text-base">Cambridge IGCSE Periodic Table of Elements</h3>
              </div>
              <button
                onClick={() => setShowPeriodicTable(false)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-auto space-y-4 text-xs">
              <p className="text-slate-400">
                Key: <span className="font-mono font-bold text-emerald-400">Z</span> = atomic (proton) number, <span className="font-mono font-bold text-sky-400">Ar</span> = relative atomic mass.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 font-mono">
                {[
                  { z: 1, sym: 'H', name: 'Hydrogen', ar: 1 },
                  { z: 2, sym: 'He', name: 'Helium', ar: 4 },
                  { z: 3, sym: 'Li', name: 'Lithium', ar: 7 },
                  { z: 4, sym: 'Be', name: 'Beryllium', ar: 9 },
                  { z: 5, sym: 'B', name: 'Boron', ar: 11 },
                  { z: 6, sym: 'C', name: 'Carbon', ar: 12 },
                  { z: 7, sym: 'N', name: 'Nitrogen', ar: 14 },
                  { z: 8, sym: 'O', name: 'Oxygen', ar: 16 },
                  { z: 9, sym: 'F', name: 'Fluorine', ar: 19 },
                  { z: 10, sym: 'Ne', name: 'Neon', ar: 20 },
                  { z: 11, sym: 'Na', name: 'Sodium', ar: 23 },
                  { z: 12, sym: 'Mg', name: 'Magnesium', ar: 24 },
                  { z: 13, sym: 'Al', name: 'Aluminium', ar: 27 },
                  { z: 14, sym: 'Si', name: 'Silicon', ar: 28 },
                  { z: 15, sym: 'P', name: 'Phosphorus', ar: 31 },
                  { z: 16, sym: 'S', name: 'Sulfur', ar: 32 },
                  { z: 17, sym: 'Cl', name: 'Chlorine', ar: 35.5 },
                  { z: 18, sym: 'Ar', name: 'Argon', ar: 40 },
                  { z: 19, sym: 'K', name: 'Potassium', ar: 39 },
                  { z: 20, sym: 'Ca', name: 'Calcium', ar: 40 },
                  { z: 26, sym: 'Fe', name: 'Iron', ar: 56 },
                  { z: 29, sym: 'Cu', name: 'Copper', ar: 64 },
                  { z: 30, sym: 'Zn', name: 'Zinc', ar: 65 },
                  { z: 35, sym: 'Br', name: 'Bromine', ar: 80 },
                  { z: 53, sym: 'I', name: 'Iodine', ar: 127 },
                  { z: 82, sym: 'Pb', name: 'Lead', ar: 207 }
                ].map(elem => (
                  <div key={elem.z} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center text-center">
                    <span className="text-[10px] text-emerald-400 font-bold">{elem.z}</span>
                    <span className="text-lg font-bold text-white tracking-wider">{elem.sym}</span>
                    <span className="text-[10px] text-slate-300">{elem.name}</span>
                    <span className="text-[10px] text-sky-400 font-bold">{elem.ar}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grade Summary Modal */}
      {showScoreModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">Examination Grade Assessment</h3>
              </div>
              <button
                onClick={() => setShowScoreModal(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center py-3 space-y-2">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500 text-3xl font-extrabold text-emerald-400">
                {paperStats.grade}
              </div>
              <h4 className="text-lg font-bold text-white">Estimated Cambridge Grade</h4>
              <p className="text-xs text-slate-400">
                Based on official Cambridge grade boundaries for {activePaper.code} ({activePaper.series})
              </p>
            </div>

            <div className="bg-slate-950 rounded-xl p-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Candidate Name:</span>
                <span className="font-semibold text-white">{candidateName}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Marks Scored:</span>
                <span className="font-bold text-emerald-400 font-mono">
                  {paperStats.totalEarned} / {paperStats.totalPossible}
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Overall Percentage:</span>
                <span className="font-bold text-sky-400 font-mono">
                  {paperStats.percentage}%
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowScoreModal(false)}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition"
            >
              Continue Revision
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
