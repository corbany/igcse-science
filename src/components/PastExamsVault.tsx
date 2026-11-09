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
  GraduationCap,
  Download,
  FolderOpen
} from 'lucide-react';
import { PastExamPaper, ExamQuestionItem, ScienceSubject, ExamAnswerAnalysis } from '../types';
import { pastExamPapers } from '../data/pastPapersData';
import { ExamPaperFigureScreenshot } from './ExamPaperFigureScreenshot';
import { getCachedDrivePdfs, DriveSyncedPdfItem } from '../services/googleDriveService';
import { 
  PAST_PAPERS_DRIVE_FOLDER_URL, 
  DRIVE_PAST_PAPERS_CATALOG, 
  DriveExamPaperItem 
} from '../data/drivePastPapersRegistry';

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

  // Candidate Details
  const [candidateName, setCandidateName] = useState('Alex Taylor');
  const [candidateNumber, setCandidateNumber] = useState('0042');
  const [centreNumber, setCentreNumber] = useState('GB0653');

  // Periodic Table modal toggle
  const [showPeriodicTable, setShowPeriodicTable] = useState(false);

  // Full paper summary modal
  const [showScoreModal, setShowScoreModal] = useState(false);

  // Google Drive 50+ papers vault modal
  const [showDriveVaultModal, setShowDriveVaultModal] = useState(false);
  const [driveSearch, setDriveSearch] = useState('');
  const [driveTierFilter, setDriveTierFilter] = useState<'all' | 'Core' | 'Extended' | 'Alternative to Practical'>('all');
  const [driveKindFilter, setDriveKindFilter] = useState<'all' | 'Question Paper' | 'Mark Scheme'>('all');

  const filteredDriveCatalog = useMemo(() => {
    return DRIVE_PAST_PAPERS_CATALOG.filter(item => {
      if (driveTierFilter !== 'all' && item.tier !== driveTierFilter) return false;
      if (driveKindFilter !== 'all' && item.kind !== driveKindFilter) return false;
      if (driveSearch.trim()) {
        const q = driveSearch.toLowerCase();
        return item.name.toLowerCase().includes(q) || 
               item.code.toLowerCase().includes(q) || 
               item.series.toLowerCase().includes(q);
      }
      return true;
    });
  }, [driveSearch, driveTierFilter, driveKindFilter]);

  // Active exam paper
  const activePaper = useMemo(() => {
    return pastExamPapers.find(p => p.id === selectedPaperId) || pastExamPapers[0];
  }, [selectedPaperId]);

  // Filter questions by subject
  const filteredQuestions = useMemo(() => {
    if (!activePaper) return [];
    if (selectedSubjectFilter === 'all') return activePaper.questions;
    return activePaper.questions.filter(q => q.subject === selectedSubjectFilter);
  }, [activePaper, selectedSubjectFilter]);

  // Persist answers
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}global`, JSON.stringify(userAnswers));
    } catch (e) {
      console.warn('Could not save answers to localStorage', e);
    }
  }, [userAnswers]);

  const handleSelectOption = (questionId: string, optKey: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: optKey
    }));
  };

  const handleTextAnswerChange = (questionId: string, text: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: text
    }));
  };

  const toggleSolution = (questionId: string) => {
    setRevealedSolutions(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const handleClearAnswers = () => {
    if (!confirm('Are you sure you want to clear your drafted answers for this paper?')) return;
    setUserAnswers({});
    setRevealedSolutions({});
    setAnalyses({});
  };

  // AI Examiner Evaluation API call
  const handleAnalyzeAnswer = async (q: ExamQuestionItem) => {
    const studentAnswer = userAnswers[q.id];
    if (!studentAnswer || !studentAnswer.trim()) return;

    setIsAnalyzing(prev => ({ ...prev, [q.id]: true }));
    setAnalysisErrors(prev => ({ ...prev, [q.id]: '' }));

    try {
      const response = await fetch('/api/evaluate-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionText: q.questionText,
          correctAnswer: q.correctAnswer,
          maxMarks: q.marks,
          markSchemeBreakdown: q.markSchemeBreakdown || [],
          guidanceNotes: q.guidanceNotes || [],
          candidateAnswer: studentAnswer,
          subject: q.subject,
          syllabusCode: q.syllabusCode
        })
      });

      if (!response.ok) {
        throw new Error(`Evaluation request failed: ${response.statusText}`);
      }

      const result: ExamAnswerAnalysis = await response.json();
      setAnalyses(prev => ({ ...prev, [q.id]: result }));
    } catch (err: any) {
      console.error('Answer evaluation failed:', err);
      setAnalysisErrors(prev => ({
        ...prev,
        [q.id]: err.message || 'Unable to evaluate answer right now. Please try again.'
      }));
    } finally {
      setIsAnalyzing(prev => ({ ...prev, [q.id]: false }));
    }
  };

  // Calculate paper statistics
  const paperStats = useMemo(() => {
    if (!activePaper) return { totalEarned: 0, totalPossible: 0, percentage: 0, grade: 'U' };

    let totalEarned = 0;
    let totalPossible = 0;

    activePaper.questions.forEach(q => {
      totalPossible += q.marks;
      const userAns = userAnswers[q.id];

      if (q.questionType === 'mcq') {
        if (userAns && userAns.toUpperCase() === q.correctAnswer.toUpperCase()) {
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
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-12 font-sans text-slate-800">
      
      {/* Header Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#EBF3F5] text-slate-800 border border-slate-300">
              Official Vault
            </span>
            <span className="text-xs font-semibold text-slate-600">
              Cambridge 0653 Past Examinations
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-slate-700" />
            <span>Past Exam Papers and Mark Schemes</span>
          </h1>
          <p className="text-base text-slate-600 max-w-xl">
            Core & Extended multiple choice exam papers with published mark schemes and instant question grading.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowPeriodicTable(true)}
            className="px-4 py-2 rounded-lg bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-sm font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <TableIcon className="w-4 h-4 text-slate-700" />
            <span>Periodic Table</span>
          </button>

          <button
            onClick={() => setShowScoreModal(true)}
            className="px-4 py-2 rounded-lg bg-[#EBF3F5] hover:bg-[#d8e9ec] text-slate-800 border border-slate-400 font-bold text-sm flex items-center gap-1.5 transition cursor-pointer"
          >
            <GraduationCap className="w-4 h-4 text-slate-700" />
            <span>Grade {paperStats.grade} ({paperStats.totalEarned}/{paperStats.totalPossible})</span>
          </button>
        </div>
      </div>

      {/* Paper Selector Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {pastExamPapers.map(paper => {
          const isSelected = paper.id === selectedPaperId;
          return (
            <button
              key={paper.id}
              onClick={() => setSelectedPaperId(paper.id)}
              className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition border shrink-0 flex items-center gap-2 cursor-pointer ${
                isSelected
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              <span className={`font-mono text-xs px-1.5 py-0.5 rounded ${
                isSelected ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-800 border border-slate-300'
              }`}>
                {paper.code}
              </span>
              <span>{paper.paperNumber} ({paper.series})</span>
            </button>
          );
        })}
      </div>

      {/* Drive Past Papers Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl p-4 text-sm text-slate-700 shadow-xs">
        <div className="flex items-center gap-2 text-slate-600">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>
            <strong className="text-slate-800">Authentic Cambridge Papers:</strong> Interactive Core (Paper 1) and Extended (Paper 2) multiple-choice papers with official figures and mark schemes.
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowDriveVaultModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#EBF3F5] hover:bg-[#d8e9ec] border border-slate-400 text-slate-800 text-xs font-bold transition cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>50+ Drive Papers</span>
          </button>
          <a
            href={PAST_PAPERS_DRIVE_FOLDER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition"
          >
            <span>Drive Folder</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Active Paper Document View */}
      {activePaper && (
        <div className="space-y-6">
          {/* Header Sheet */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-4">
              <div>
                <span className="text-xs font-mono text-slate-500 font-bold block">
                  Cambridge Assessment International Education
                </span>
                <h2 className="text-xl font-bold text-slate-800 mt-1">
                  Cambridge IGCSE Combined Science {activePaper.code}
                </h2>
                <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-600">
                  <strong className="text-slate-800">{activePaper.title}</strong>
                  <span>•</span>
                  <span>{activePaper.series}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-bold text-slate-700">
                    <Clock className="w-3.5 h-3.5" />
                    {activePaper.duration}
                  </span>
                  <span>•</span>
                  <span className="font-semibold text-slate-600">
                    [Total Marks: {activePaper.totalMarks}]
                  </span>
                </div>
              </div>

              {/* Candidate Info Input Box */}
              <div className="bg-[#FDFBF7] border border-slate-300 rounded-lg p-3 text-xs space-y-2 shrink-0 sm:w-72">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-600 font-bold">Candidate:</span>
                  <input
                    type="text"
                    value={candidateName}
                    onChange={e => setCandidateName(e.target.value)}
                    className="bg-white border border-black rounded-md px-2 py-0.5 text-slate-800 font-bold text-right text-xs focus:outline-none"
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-600 font-bold">Centre / No:</span>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={centreNumber}
                      onChange={e => setCentreNumber(e.target.value)}
                      className="w-16 bg-white border border-black rounded-md px-1.5 py-0.5 text-slate-800 font-mono font-bold text-center text-xs focus:outline-none"
                    />
                    <input
                      type="text"
                      value={candidateNumber}
                      onChange={e => setCandidateNumber(e.target.value)}
                      className="w-16 bg-white border border-black rounded-md px-1.5 py-0.5 text-slate-800 font-mono font-bold text-center text-xs focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Official Instructions */}
            {activePaper.examinerNotes && (
              <div className="bg-[#FDFBF7] border border-slate-200 rounded-lg p-4 text-xs space-y-1.5">
                <strong className="text-slate-800 block text-sm">
                  Official Candidate Instructions:
                </strong>
                <ul className="list-disc pl-5 text-slate-700 space-y-1">
                  {activePaper.examinerNotes.map((note, i) => (
                    <li key={i}>{note}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Subject Filters within Paper */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-600 font-bold mr-1">Filter Subject:</span>
                {(['all', 'biology', 'chemistry', 'physics'] as const).map(subj => (
                  <button
                    key={subj}
                    onClick={() => setSelectedSubjectFilter(subj)}
                    className={`px-3 py-1 rounded-md capitalize font-bold transition cursor-pointer border ${
                      selectedSubjectFilter === subj
                        ? 'bg-slate-800 text-white border-slate-800'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {subj}
                  </button>
                ))}
              </div>

              <span className="text-xs text-slate-500 font-semibold">
                Showing {filteredQuestions.length} of {activePaper.questions.length} questions
              </span>
            </div>
          </div>

          {/* Question List */}
          <div className="space-y-6">
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
                  className="bg-white border border-slate-200 hover:border-slate-400 rounded-xl p-6 space-y-4 transition shadow-xs"
                >
                  {/* Question Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-md bg-[#EBF3F5] border border-slate-300 text-slate-800 font-bold font-mono text-sm">
                        Question {q.fullLabel || q.number}
                      </span>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-300 uppercase">
                        {q.syllabusCode} • {q.subject}
                      </span>
                    </div>

                    <span className="text-xs font-bold text-slate-800 font-mono bg-slate-100 px-2.5 py-1 rounded-md border border-slate-300">
                      [{q.marks} Mark{q.marks === 1 ? '' : 's'}]
                    </span>
                  </div>

                  {/* Question Prompt */}
                  <div className="text-base font-bold text-slate-800 whitespace-pre-line leading-relaxed">
                    {q.questionText}
                  </div>

                  {/* Figure Screenshot */}
                  {(q.figureCaption || q.figureScreenshotUrl || q.diagramSvg || q.questionText.includes('Fig.')) ? (
                    <ExamPaperFigureScreenshot 
                      question={q} 
                      paperTitle={activePaper.title}
                    />
                  ) : null}

                  {/* Multiple Choice Options */}
                  {isMcq && q.options && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {q.options.map(opt => {
                        const isChosen = studentAnswer === opt.key;
                        const isCorrect = isRevealed && opt.key === q.correctAnswer;
                        const isWrong = isRevealed && isChosen && opt.key !== q.correctAnswer;

                        let style = 'bg-[#FDFBF7] border-2 border-black text-slate-800 hover:bg-white';
                        if (isChosen && !isRevealed) {
                          style = 'bg-[#EBF3F5] border-2 border-slate-800 font-bold text-slate-800';
                        } else if (isCorrect) {
                          style = 'bg-emerald-50 border-2 border-emerald-700 text-emerald-900 font-bold';
                        } else if (isWrong) {
                          style = 'bg-rose-50 border-2 border-rose-700 text-rose-900 font-bold';
                        }

                        return (
                          <button
                            key={opt.key}
                            onClick={() => handleSelectOption(q.id, opt.key)}
                            className={`text-left p-3.5 rounded-lg border-2 text-sm flex items-start gap-3 transition cursor-pointer ${style}`}
                          >
                            <span className="font-bold font-mono px-2 py-0.5 rounded bg-white border border-slate-300 shrink-0">
                              {opt.key}
                            </span>
                            <span className="leading-relaxed">{opt.text}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Written Answer Area */}
                  {!isMcq && (
                    <div className="space-y-3 pt-1">
                      <div className="flex items-center justify-between text-xs">
                        <label className="font-bold text-slate-700">
                          Candidate Written Response:
                        </label>
                        <span className="text-slate-500 font-mono">
                          {studentAnswer.trim() ? studentAnswer.trim().split(/\s+/).length : 0} words
                        </span>
                      </div>

                      <textarea
                        rows={q.marks >= 3 ? 5 : 3}
                        value={studentAnswer}
                        onChange={e => handleTextAnswerChange(q.id, e.target.value)}
                        placeholder={q.inputPlaceholder || "Type your answer here in complete scientific sentences..."}
                        className="w-full bg-[#FDFBF7] border-2 border-black rounded-lg p-4 text-base text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white transition leading-relaxed"
                      />

                      {/* Analysis action buttons */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleAnalyzeAnswer(q)}
                            disabled={analyzing || !studentAnswer.trim()}
                            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition ${
                              analyzing
                                ? 'bg-slate-700 text-white cursor-wait'
                                : studentAnswer.trim()
                                ? 'bg-slate-800 hover:bg-slate-700 text-white cursor-pointer'
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            }`}
                          >
                            {analyzing ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Evaluating...</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Grade Written Answer</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => toggleSolution(q.id)}
                            className="px-3 py-2 rounded-lg bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-600" />
                            <span>{isRevealed ? 'Hide Mark Scheme' : 'View Mark Scheme'}</span>
                          </button>
                        </div>

                        <button
                          onClick={() => onAskAITutor(`Please tutor me on Cambridge question ${q.fullLabel || q.number} (${q.syllabusCode}):\n\n${q.questionText}\n\nCandidate drafted: "${studentAnswer}"`, q.syllabusCode)}
                          className="text-xs text-slate-700 hover:text-black flex items-center gap-1 font-bold cursor-pointer"
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span>Ask AI Tutor for guidance</span>
                        </button>
                      </div>

                      {/* Error Banner */}
                      {analysisError && (
                        <div className="p-3 rounded-lg bg-rose-50 border border-rose-300 text-rose-800 text-xs flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>{analysisError}</span>
                        </div>
                      )}

                      {/* AI Examiner Analysis Report */}
                      {analysis && (
                        <div className="mt-4 p-5 rounded-lg bg-[#FDFBF7] border border-slate-300 text-xs space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-2">
                            <span className="font-bold text-slate-800 text-sm">Official Cambridge Examiner Assessment</span>
                            <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-[#EBF3F5] text-slate-800 border border-slate-300">
                              Marks Awarded: {analysis.marksAwarded} / {analysis.maxMarks} ({analysis.percentage}%)
                            </span>
                          </div>

                          {analysis.markBreakdown && analysis.markBreakdown.length > 0 && (
                            <div className="space-y-1.5">
                              <strong className="text-slate-800 text-xs block">Mark Scheme Point Breakdown:</strong>
                              {analysis.markBreakdown.map((pt, i) => (
                                <div 
                                  key={i} 
                                  className={`p-2.5 rounded-md border flex items-start gap-2.5 ${
                                    pt.awarded 
                                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900' 
                                      : 'bg-rose-50 border-rose-300 text-rose-900'
                                  }`}
                                >
                                  <span className="shrink-0 mt-0.5 font-bold">
                                    {pt.awarded ? '✓' : '✗'}
                                  </span>
                                  <div>
                                    <span className="font-bold block">{pt.point}</span>
                                    <span className="text-xs opacity-90 block">{pt.reason}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {analysis.examinerFeedback && (
                            <div className="bg-white p-3 rounded-md border border-slate-200 text-slate-700 leading-relaxed">
                              <strong className="text-slate-800 mr-1">Examiner Note: </strong>
                              {analysis.examinerFeedback}
                            </div>
                          )}

                          {analysis.modelAnswer && (
                            <div className="bg-white p-3 rounded-md border border-emerald-300 text-emerald-900 leading-relaxed">
                              <strong className="text-emerald-900 block mb-0.5">Model Answer: </strong>
                              {analysis.modelAnswer}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* MCQ Mark Scheme Toggle */}
                  {isMcq && (
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => toggleSolution(q.id)}
                        className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-600" />
                        <span>{isRevealed ? 'Hide Answer' : 'Check Correct Answer'}</span>
                      </button>
                    </div>
                  )}

                  {/* Official Mark Scheme Details */}
                  {isRevealed && (
                    <div className="mt-3 p-4 rounded-lg bg-[#FDFBF7] border border-slate-300 text-xs space-y-2">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                        <strong className="text-slate-800 text-sm">Published Cambridge Mark Scheme</strong>
                        <span className="font-bold text-slate-700">Max: {q.marks} Mark{q.marks === 1 ? '' : 's'}</span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-800">Expected Response: </span>
                        <span className="text-slate-800 font-semibold">{q.correctAnswer}</span>
                      </div>
                      {q.explanation && (
                        <p className="text-slate-700 leading-relaxed">
                          <strong className="text-slate-800">Rationale: </strong>{q.explanation}
                        </p>
                      )}
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
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-xl text-slate-800">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TableIcon className="w-5 h-5 text-slate-700" />
                <h3 className="font-bold text-slate-800 text-base">Cambridge IGCSE Periodic Table of Elements</h3>
              </div>
              <button
                onClick={() => setShowPeriodicTable(false)}
                className="p-1 rounded-md hover:bg-slate-100 text-slate-600 hover:text-black cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-auto space-y-4 text-xs">
              <p className="text-slate-600">
                Key: <strong className="font-mono text-slate-800">Z</strong> = atomic (proton) number, <strong className="font-mono text-slate-800">Ar</strong> = relative atomic mass.
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
                  { z: 29, sym: 'Cu', name: 'Copper', ar: 63.5 },
                  { z: 30, sym: 'Zn', name: 'Zinc', ar: 65 }
                ].map(elem => (
                  <div key={elem.z} className="p-2.5 rounded-md bg-[#FDFBF7] border border-slate-200 flex flex-col items-center text-center">
                    <span className="text-[10px] text-slate-500">{elem.z}</span>
                    <strong className="text-base font-bold text-slate-800">{elem.sym}</strong>
                    <span className="text-[10px] text-slate-600 truncate max-w-full">{elem.name}</span>
                    <span className="text-[10px] font-bold text-slate-700">{elem.ar}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grade Summary Modal */}
      {showScoreModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-xl w-full max-w-md p-6 space-y-5 shadow-xl text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-slate-700" />
                <h3 className="font-bold text-slate-800 text-base">Examination Grade Assessment</h3>
              </div>
              <button
                onClick={() => setShowScoreModal(false)}
                className="p-1 rounded-md hover:bg-slate-100 text-slate-600 hover:text-black cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center py-2 space-y-2">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#EBF3F5] border-4 border-slate-800 text-3xl font-bold text-slate-800">
                {paperStats.grade}
              </div>
              <h4 className="text-lg font-bold text-slate-800">Estimated Cambridge Grade</h4>
              <p className="text-xs text-slate-600">
                Based on official Cambridge grade boundaries for {activePaper.code} ({activePaper.series})
              </p>
            </div>

            <div className="bg-[#FDFBF7] border border-slate-200 rounded-lg p-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-700">
                <span>Candidate Name:</span>
                <strong className="text-slate-800">{candidateName}</strong>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Marks Scored:</span>
                <strong className="text-slate-800 font-mono">
                  {paperStats.totalEarned} / {paperStats.totalPossible}
                </strong>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Overall Percentage:</span>
                <strong className="text-slate-800 font-mono">
                  {paperStats.percentage}%
                </strong>
              </div>
            </div>

            <button
              onClick={() => setShowScoreModal(false)}
              className="w-full py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition cursor-pointer"
            >
              Continue Revision
            </button>
          </div>
        </div>
      )}

      {/* Google Drive 50+ Papers Vault Modal */}
      {showDriveVaultModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white border border-slate-300 rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-xl overflow-hidden text-slate-800">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-start justify-between gap-4 bg-[#FDFBF7]">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-[#EBF3F5] border border-slate-300 text-slate-800 shrink-0">
                  <FolderOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base sm:text-lg flex items-center gap-2">
                    <span>Cambridge 0653 Past Papers & Mark Schemes</span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-white text-slate-800 border border-slate-300">
                      50+ Official PDFs
                    </span>
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 max-w-2xl">
                    Filter and access authentic Core and Extended Multiple Choice papers, Alternative to Practical papers, and official Mark Schemes.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setShowDriveVaultModal(false)}
                  className="p-1 rounded-md hover:bg-slate-100 text-slate-600 hover:text-black cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Controls */}
            <div className="p-4 border-b border-slate-200 bg-white space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={driveSearch}
                    onChange={(e) => setDriveSearch(e.target.value)}
                    placeholder="Search by series or paper number..."
                    className="w-full pl-9 pr-3 py-2 bg-[#FDFBF7] border-2 border-black rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  {(['all', 'Core', 'Extended', 'Alternative to Practical'] as const).map(tier => (
                    <button
                      key={tier}
                      onClick={() => setDriveTierFilter(tier)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer border ${
                        driveTierFilter === tier
                          ? 'bg-slate-800 text-white border-slate-800'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {tier === 'all' ? 'All Tiers' : tier}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Papers Grid */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredDriveCatalog.map((paper) => {
                  const interactivePaper = pastExamPapers.find(p => {
                    if (paper.code.includes('12/M/26') && p.id === 'paper-0653-12-m-2026') return true;
                    if (paper.code.includes('22/M/26') && p.id === 'paper-0653-22-m-2026') return true;
                    if (paper.code.includes('02/SP/25') && p.id === 'paper-0653-02-sp-2025') return true;
                    if (paper.code.includes('61/M/J/26') && p.id === 'paper-0653-61-mj-2026') return true;
                    if (paper.code.includes('42/O/N/25') && p.id === 'paper-0653-42-on-2025') return true;
                    return false;
                  });

                  return (
                    <div
                      key={paper.id}
                      className="bg-[#FDFBF7] border border-slate-200 hover:border-slate-400 rounded-lg p-3.5 flex flex-col justify-between gap-3 transition"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-white text-slate-800 border border-slate-300">
                            {paper.code}
                          </span>
                          <span className="text-xs font-bold text-slate-600">
                            {paper.kind}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-slate-800 leading-snug">
                          {paper.name.replace(/\.pdf$/i, '')}
                        </h4>

                        <p className="text-xs text-slate-600">
                          {paper.series} • {paper.tier}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                        {interactivePaper && paper.kind === 'Question Paper' && (
                          <button
                            onClick={() => {
                              setSelectedPaperId(interactivePaper.id);
                              setShowDriveVaultModal(false);
                            }}
                            className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold cursor-pointer"
                          >
                            Take Interactive
                          </button>
                        )}

                        <a
                          href={paper.driveViewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded-md bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-bold"
                        >
                          Preview
                        </a>

                        <a
                          href={paper.driveDownloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded-md bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-bold"
                        >
                          Download
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-[#FDFBF7] flex items-center justify-between text-xs">
              <span className="text-slate-600">
                Cambridge IGCSE Combined Science 0653
              </span>
              <button
                onClick={() => setShowDriveVaultModal(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
