import React, { useState, useMemo, useEffect } from 'react';
import { 
  BookOpen, 
  CheckCircle, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Minimize2, 
  ExternalLink, 
  Sparkles, 
  Copy, 
  Check, 
  Search, 
  X, 
  RotateCcw, 
  Award, 
  AlertCircle, 
  HelpCircle, 
  Filter, 
  Flame, 
  Sun, 
  Moon, 
  Lightbulb, 
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  Layers,
  FileText,
  FolderSync,
  Cloud,
  Plus,
  Play,
  Share2,
  Presentation
} from 'lucide-react';
import { ScienceSubject, TrafficLightStatus, SubtopicQuizResult, StudentProgress } from '../types';
import { 
  allSubtopicsData, 
  SubtopicTopicGroup, 
  TeacherSlideDeck, 
  ClassroomSlide,
  getSubtopicsBySubject 
} from '../data/subtopicSlidesData';
import { getQuizForSubtopic } from '../data/subtopicQuizzes';
import { 
  TARGET_DRIVE_FOLDER_ID, 
  TARGET_DRIVE_FOLDER_URL, 
  fetchAllDriveFolderFiles, 
  organizeDriveLessonsIntoSubfolders,
  replaceAllSyncedLessons,
  extractLessonCode, 
  resolveSubtopicForSlide,
  DriveSyncedSlideItem, 
  DRIVE_STORAGE_KEY, 
  getCachedDriveSlides,
  getManualSlideOverrides, 
  saveManualSlideOverride 
} from '../services/googleDriveService';
import { signInWithGoogle, getCachedDriveToken, clearCachedDriveToken } from '../services/firebaseAuth';

interface LessonSlidesViewerProps {
  isInstructor?: boolean;
  selectedSubject: ScienceSubject | 'all';
  searchQuery: string;
  completedLessons: string[];
  trafficLights: Record<string, TrafficLightStatus>;
  subtopicQuizScores: Record<string, SubtopicQuizResult>;
  onUpdateTrafficLight: (subtopicCode: string, status: TrafficLightStatus) => void;
  onSaveQuizResult: (subtopicCode: string, result: SubtopicQuizResult) => void;
  onToggleCompleteLesson: (lessonId: string) => void;
  onSaveNoteFromSlide: (topicCode: string, note: string) => void;
  onAskAITutor: (query: string, topicCode: string) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const LessonSlidesViewer: React.FC<LessonSlidesViewerProps> = ({
  isInstructor = false,
  selectedSubject,
  searchQuery,
  completedLessons,
  trafficLights = {},
  subtopicQuizScores = {},
  onUpdateTrafficLight,
  onSaveQuizResult,
  onToggleCompleteLesson,
  onSaveNoteFromSlide,
  onAskAITutor,
  theme,
  onToggleTheme
}) => {
  // Active subject tab within Lesson Slides: biology | chemistry | physics | all
  const [activeSubjectTab, setActiveSubjectTab] = useState<ScienceSubject | 'all'>(() => {
    return selectedSubject !== 'all' ? selectedSubject : 'biology';
  });

  // Sync when prop changes
  useEffect(() => {
    if (selectedSubject !== 'all') {
      setActiveSubjectTab(selectedSubject);
    }
  }, [selectedSubject]);

  // Selected subtopic
  const [selectedSubtopicCode, setSelectedSubtopicCode] = useState<string>('B1.1');
  const [activeDeckIndex, setActiveDeckIndex] = useState<number>(0);
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [copiedNote, setCopiedNote] = useState<boolean>(false);

  // Status Filter for subtopics (all, red, orange, green, unranked)
  const [statusFilter, setStatusFilter] = useState<'all' | 'red' | 'orange' | 'green' | 'unranked'>('all');

  // Quiz Modal State for Green status certification
  const [isQuizModalOpen, setIsQuizModalOpen] = useState<boolean>(false);
  const [quizSubtopicCode, setQuizSubtopicCode] = useState<string>('');
  const [quizQuestions, setQuizQuestions] = useState<ReturnType<typeof getQuizForSubtopic>>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submittedAnswers, setSubmittedAnswers] = useState<Record<number, boolean>>({});
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);

  // Filter subtopics based on subject, search, and traffic light filter
  const filteredSubtopics = useMemo(() => {
    return allSubtopicsData.filter(subtopic => {
      // Subject filter
      if (activeSubjectTab !== 'all' && subtopic.subject !== activeSubjectTab) {
        return false;
      }
      // Traffic light filter
      const currentLight = trafficLights[subtopic.subtopicCode];
      if (statusFilter === 'unranked' && currentLight) return false;
      if (statusFilter !== 'all' && statusFilter !== 'unranked' && currentLight !== statusFilter) return false;

      // Text search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesCode = subtopic.subtopicCode.toLowerCase().includes(q);
        const matchesTopic = subtopic.topicCode.toLowerCase().includes(q);
        const matchesTitle = subtopic.title.toLowerCase().includes(q);
        const matchesDeck = subtopic.decks.some(d => 
          d.title.toLowerCase().includes(q) || 
          d.keywords.some(k => k.toLowerCase().includes(q)) ||
          d.slides.some(s => s.title.toLowerCase().includes(q) || s.content.some(c => c.toLowerCase().includes(q)))
        );
        return matchesCode || matchesTopic || matchesTitle || matchesDeck;
      }

      return true;
    });
  }, [activeSubjectTab, statusFilter, searchQuery, trafficLights]);

  // Current active subtopic object
  const currentSubtopic: SubtopicTopicGroup = useMemo(() => {
    const found = allSubtopicsData.find(s => s.subtopicCode === selectedSubtopicCode);
    if (found) return found;
    return filteredSubtopics[0] || allSubtopicsData[0];
  }, [selectedSubtopicCode, filteredSubtopics]);

  // Keep selectedSubtopicCode valid if filter changes
  useEffect(() => {
    if (filteredSubtopics.length > 0 && !filteredSubtopics.some(s => s.subtopicCode === selectedSubtopicCode)) {
      setSelectedSubtopicCode(filteredSubtopics[0].subtopicCode);
      setActiveDeckIndex(0);
      setActiveSlideIndex(0);
    }
  }, [filteredSubtopics, selectedSubtopicCode]);

  // Current deck and slide
  const currentDeck: TeacherSlideDeck = currentSubtopic?.decks[activeDeckIndex] || currentSubtopic?.decks[0];
  const currentSlide: ClassroomSlide = currentDeck?.slides[activeSlideIndex] || currentDeck?.slides[0];

  // Google Drive Synced Slides State
  const [isSyncingDrive, setIsSyncingDrive] = useState<boolean>(false);
  const [driveSyncMessage, setDriveSyncMessage] = useState<string | null>(null);
  const [showAiNotesWithDrive, setShowAiNotesWithDrive] = useState<boolean>(false);
  const [syncedSlides, setSyncedSlides] = useState<DriveSyncedSlideItem[]>(() => {
    return getCachedDriveSlides();
  });
  const [manualOverrides, setManualOverrides] = useState<Record<string, { presentationId: string; title: string; embedUrl: string; directUrl: string }>>(() => {
    return getManualSlideOverrides();
  });
  const [manualInputUrl, setManualInputUrl] = useState<string>('');
  const [showManualInput, setShowManualInput] = useState<boolean>(false);

  // Find exact unaltered drive slides for currentSubtopic across all Biology, Chemistry, and Physics topics
  const driveSlidesForCurrentSubtopic = useMemo(() => {
    if (!currentSubtopic) return [];
    const list: Array<{ id: string; name: string; embedUrl: string; directUrl: string; source: 'drive' | 'manual' }> = [];
    
    // 1. Check manual override for this subtopic code
    if (manualOverrides[currentSubtopic.subtopicCode]) {
      const o = manualOverrides[currentSubtopic.subtopicCode];
      list.push({
        id: o.presentationId,
        name: o.title,
        embedUrl: o.embedUrl,
        directUrl: o.directUrl,
        source: 'manual'
      });
    }

    // 2. Check synced slides from Drive folder
    const targetCode = currentSubtopic.subtopicCode.toUpperCase(); // e.g. "B9.2", "C2.3", "P1.5.1"
    const targetTopic = currentSubtopic.topicCode.toUpperCase();   // e.g. "B9"

    for (const slide of syncedSlides) {
      // Resolve exact Cambridge subtopic code using slide name as primary source of truth
      const resolvedCode = (
        resolveSubtopicForSlide(slide.name) || 
        slide.matchedSubtopicCode || 
        slide.extractedCode || 
        ''
      ).toUpperCase();

      const slideNameUpper = slide.name.toUpperCase();

      // Check exact subtopic code match
      const exactCodeMatch = resolvedCode === targetCode;
      
      // Prefix matching with common delimiters: "B9.2 ", "B9.2-", "B9.2_", "[B9.2]", "(B9.2)", "B9.2:"
      const nameStartsWithCode = 
        slideNameUpper.startsWith(targetCode + ' ') ||
        slideNameUpper.startsWith(targetCode + '-') ||
        slideNameUpper.startsWith(targetCode + '_') ||
        slideNameUpper.startsWith(targetCode + ':') ||
        slideNameUpper.startsWith(targetCode + '.') ||
        slideNameUpper.startsWith(`[${targetCode}]`) ||
        slideNameUpper.startsWith(`(${targetCode})`);

      // Bracketed or surrounded code anywhere in the title
      const bracketMatch = 
        slideNameUpper.includes(`[${targetCode}]`) || 
        slideNameUpper.includes(`(${targetCode})`);

      // Guard: if resolvedCode points to another distinct subtopic (e.g. B9.2, B9.3, B9.4),
      // DO NOT let it leak into B9.1 or other subtopics!
      if (resolvedCode && resolvedCode !== targetCode) {
        continue;
      }

      if (exactCodeMatch || nameStartsWithCode || bracketMatch) {
        if (!list.some(item => item.id === slide.id)) {
          list.push({
            id: slide.id,
            name: slide.name, // EXACT unaltered title from Google Drive
            embedUrl: slide.googleSlidesEmbedUrl,
            directUrl: slide.googleSlidesDirectUrl,
            source: 'drive'
          });
        }
      }
    }

    return list;
  }, [currentSubtopic, syncedSlides, manualOverrides]);

  const [activeDriveSlideIdx, setActiveDriveSlideIdx] = useState<number>(0);
  const activeDriveSlide = driveSlidesForCurrentSubtopic[activeDriveSlideIdx] || driveSlidesForCurrentSubtopic[0] || null;

  // Check if current subtopic has a matching exact Google Drive slide
  const hasMatchingDriveSlide = useMemo(() => {
    return driveSlidesForCurrentSubtopic.length > 0;
  }, [driveSlidesForCurrentSubtopic]);

  // Total clear lesson count for current subtopic
  const currentLessonCount = useMemo(() => {
    if (!currentSubtopic) return 1;
    return Math.max(currentSubtopic.decks?.length || 1, driveSlidesForCurrentSubtopic.length);
  }, [currentSubtopic, driveSlidesForCurrentSubtopic]);

  // Set of all subtopic codes that currently have an exact Drive slide linked
  const subtopicsWithDriveSlides = useMemo(() => {
    const set = new Set<string>();
    Object.keys(manualOverrides).forEach(code => set.add(code.toUpperCase()));
    for (const slide of syncedSlides) {
      const code = (
        resolveSubtopicForSlide(slide.name) || 
        slide.matchedSubtopicCode || 
        slide.extractedCode || 
        ''
      ).toUpperCase();
      if (code) set.add(code);
    }
    return set;
  }, [syncedSlides, manualOverrides]);

  // Reset slide index and companion notes when switching subtopics
  useEffect(() => {
    setActiveDriveSlideIdx(0);
    setActiveSlideIndex(0);
    setActiveDeckIndex(0);
    setShowAiNotesWithDrive(false);
  }, [selectedSubtopicCode]);

  const [isOrganizingDrive, setIsOrganizingDrive] = useState<boolean>(false);

  // Automatically sort lessons in Drive into corresponding subfolders based on leading syllabus code (e.g. P1.5.1.),
  // and replace all stored lessons with a fresh sync
  const handleOrganizeDriveLessons = async () => {
    setIsOrganizingDrive(true);
    setDriveSyncMessage(null);
    try {
      let token = await getCachedDriveToken();
      if (!token) {
        token = await signInWithGoogle();
      }
      if (!token) {
        setDriveSyncMessage('Google sign-in was cancelled or required. Please sign in to authenticate with Google Drive.');
        setIsOrganizingDrive(false);
        return;
      }
      setDriveSyncMessage('Scanning lesson drive, detecting subtopic codes (e.g. P1.5.1, C9.5), and placing files into corresponding subfolders...');
      const result = await organizeDriveLessonsIntoSubfolders(token, TARGET_DRIVE_FOLDER_ID);
      setSyncedSlides(result.presentations || []);
      setDriveSyncMessage(result.message);
    } catch (err: any) {
      console.error('Failed to organize drive lessons:', err);
      if (err?.message?.includes('401') || err?.message?.includes('authentication')) {
        clearCachedDriveToken();
      }
      setDriveSyncMessage(`Error organizing lessons: ${err?.message || 'Check folder access or Google sign-in.'}`);
    } finally {
      setIsOrganizingDrive(false);
    }
  };

  // Replaces all lessons cleanly by clearing the local cache and re-fetching freshly
  const handleReplaceAllLessons = async () => {
    setIsSyncingDrive(true);
    setDriveSyncMessage(null);
    try {
      let token = await getCachedDriveToken();
      if (!token) {
        token = await signInWithGoogle();
      }
      if (!token) {
        setDriveSyncMessage('Google sign-in was cancelled or required. Please sign in to sync your Google Drive folder.');
        setIsSyncingDrive(false);
        return;
      }
      setDriveSyncMessage('Replacing all stored lessons and re-syncing from Drive...');
      const freshSlides = await replaceAllSyncedLessons(token, TARGET_DRIVE_FOLDER_ID);
      setSyncedSlides(freshSlides);
      setDriveSyncMessage(`Replaced all lessons. Successfully re-synced ${freshSlides.length} Google Slides presentations!`);
    } catch (err: any) {
      console.error('Failed to replace lessons:', err);
      if (err?.message?.includes('401') || err?.message?.includes('authentication')) {
        clearCachedDriveToken();
      }
      setDriveSyncMessage(`Error replacing lessons: ${err?.message || 'Check folder access or Google sign-in.'}`);
    } finally {
      setIsSyncingDrive(false);
    }
  };

  // Handle Drive Sync
  const handleSyncDriveFolder = async () => {
    setIsSyncingDrive(true);
    setDriveSyncMessage(null);
    try {
      let token = await getCachedDriveToken();
      if (!token) {
        token = await signInWithGoogle();
      }
      if (!token) {
        setDriveSyncMessage('Google sign-in was cancelled or required. Please sign in to sync your Google Drive folder.');
        setIsSyncingDrive(false);
        return;
      }
      const result = await fetchAllDriveFolderFiles(token, TARGET_DRIVE_FOLDER_ID);
      const fetchedSlides = result.presentations || [];
      if (fetchedSlides.length > 0) {
        localStorage.setItem(DRIVE_STORAGE_KEY, JSON.stringify(fetchedSlides));
        setSyncedSlides(fetchedSlides);
        setDriveSyncMessage(`Successfully fetched ${fetchedSlides.length} slide decks from Drive folder!`);
      } else {
        setDriveSyncMessage('Connected to folder 1kypXZXP3nY9pFxuSJOTZ1anODYxxfZ1a. (0 matching slide decks found yet)');
      }
    } catch (err: any) {
      console.error('Drive sync failed:', err);
      if (err?.message?.includes('401') || err?.message?.includes('authentication')) {
        clearCachedDriveToken();
      }
      const msg = err?.message || 'Check folder access or Google sign-in.';
      setDriveSyncMessage(`Drive sync: ${msg}`);
    } finally {
      setIsSyncingDrive(false);
    }
  };

  const handleSaveManualSlide = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInputUrl.trim() || !currentSubtopic) return;
    const ok = saveManualSlideOverride(currentSubtopic.subtopicCode, manualInputUrl.trim());
    if (ok) {
      setManualOverrides(getManualSlideOverrides());
      setManualInputUrl('');
      setShowManualInput(false);
      setDriveSyncMessage(`Embedded presentation for ${currentSubtopic.subtopicCode}!`);
    } else {
      setDriveSyncMessage('Please enter a valid Google Slides link or presentation ID.');
    }
  };

  // Subject color palettes
  const subjectColors = {
    biology: {
      accent: 'emerald',
      bg: theme === 'dark' ? 'bg-emerald-950/30' : 'bg-emerald-50',
      border: theme === 'dark' ? 'border-emerald-500/30' : 'border-emerald-200',
      text: theme === 'dark' ? 'text-emerald-400' : 'text-emerald-700',
      badge: theme === 'dark' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-emerald-100 text-emerald-800 border-emerald-300'
    },
    chemistry: {
      accent: 'sky',
      bg: theme === 'dark' ? 'bg-sky-950/30' : 'bg-sky-50',
      border: theme === 'dark' ? 'border-sky-500/30' : 'border-sky-200',
      text: theme === 'dark' ? 'text-sky-400' : 'text-sky-700',
      badge: theme === 'dark' ? 'bg-sky-500/20 text-sky-300 border-sky-500/30' : 'bg-sky-100 text-sky-800 border-sky-300'
    },
    physics: {
      accent: 'amber',
      bg: theme === 'dark' ? 'bg-amber-950/30' : 'bg-amber-50',
      border: theme === 'dark' ? 'border-amber-500/30' : 'border-amber-200',
      text: theme === 'dark' ? 'text-amber-400' : 'text-amber-700',
      badge: theme === 'dark' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-amber-100 text-amber-800 border-amber-300'
    }
  };

  const currentThemeStyles = subjectColors[currentSubtopic?.subject || 'biology'];

  // Subtopic counts by subject for summary badge
  const subjectCounts = useMemo(() => {
    return {
      biology: allSubtopicsData.filter(s => s.subject === 'biology').length,
      chemistry: allSubtopicsData.filter(s => s.subject === 'chemistry').length,
      physics: allSubtopicsData.filter(s => s.subject === 'physics').length,
      total: allSubtopicsData.length
    };
  }, []);

  // Traffic light counts for the current subject
  const currentSubjectTrafficCounts = useMemo(() => {
    const list = activeSubjectTab === 'all' 
      ? allSubtopicsData 
      : allSubtopicsData.filter(s => s.subject === activeSubjectTab);
    
    let red = 0;
    let orange = 0;
    let green = 0;
    let unranked = 0;

    list.forEach(item => {
      const st = trafficLights[item.subtopicCode];
      if (st === 'green') green++;
      else if (st === 'orange') orange++;
      else if (st === 'red') red++;
      else unranked++;
    });

    return { red, orange, green, unranked, total: list.length };
  }, [activeSubjectTab, trafficLights]);

  // Group filtered subtopics by main Topic (e.g. B1, B2)
  const groupedSubtopics = useMemo(() => {
    const map = new Map<string, { topicCode: string; topicName: string; items: SubtopicTopicGroup[] }>();
    filteredSubtopics.forEach(sub => {
      if (!map.has(sub.topicCode)) {
        map.set(sub.topicCode, {
          topicCode: sub.topicCode,
          topicName: sub.topicName,
          items: []
        });
      }
      map.get(sub.topicCode)!.items.push(sub);
    });
    return Array.from(map.values());
  }, [filteredSubtopics]);

  // Traffic light click handler
  const handleTrafficLightSelect = (subtopicCode: string, status: TrafficLightStatus) => {
    if (status === 'green') {
      // Check if student has already passed the 10-question quiz (>= 80%)
      const existingScore = subtopicQuizScores[subtopicCode];
      if (existingScore && existingScore.percentage >= 80) {
        onUpdateTrafficLight(subtopicCode, 'green');
      } else {
        // Open the 10-question quiz modal
        startQuizForSubtopic(subtopicCode);
      }
    } else {
      // Red or Orange can be selected directly based on student self-assessment
      onUpdateTrafficLight(subtopicCode, status);
    }
  };

  // Launch subtopic quiz
  const startQuizForSubtopic = (code: string) => {
    const questions = getQuizForSubtopic(code);
    setQuizSubtopicCode(code);
    setQuizQuestions(questions);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setSubmittedAnswers({});
    setQuizCompleted(false);
    setQuizScore(0);
    setIsQuizModalOpen(true);
  };

  // Answer quiz question
  const handleSelectQuizAnswer = (qIdx: number, optionIdx: number) => {
    if (submittedAnswers[qIdx]) return;
    setSelectedAnswers(prev => ({ ...prev, [qIdx]: optionIdx }));
    setSubmittedAnswers(prev => ({ ...prev, [qIdx]: true }));
  };

  // Finish quiz evaluation
  const handleCompleteQuiz = () => {
    let score = 0;
    quizQuestions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        score++;
      }
    });
    const percentage = Math.round((score / quizQuestions.length) * 100);
    const passed = percentage >= 80;

    setQuizScore(score);
    setQuizCompleted(true);

    const result: SubtopicQuizResult = {
      score,
      total: quizQuestions.length,
      percentage,
      passed,
      date: new Date().toISOString().split('T')[0]
    };

    onSaveQuizResult(quizSubtopicCode, result);

    if (passed) {
      onUpdateTrafficLight(quizSubtopicCode, 'green');
    }
  };

  // Slide navigation
  const goToPreviousSlide = () => {
    if (activeSlideIndex > 0) {
      setActiveSlideIndex(prev => prev - 1);
    } else if (activeDeckIndex > 0) {
      const prevDeck = currentSubtopic.decks[activeDeckIndex - 1];
      setActiveDeckIndex(activeDeckIndex - 1);
      setActiveSlideIndex(prevDeck.slides.length - 1);
    }
  };

  const goToNextSlide = () => {
    if (currentDeck && activeSlideIndex < currentDeck.slides.length - 1) {
      setActiveSlideIndex(prev => prev + 1);
    } else if (activeDeckIndex < (currentSubtopic?.decks.length || 1) - 1) {
      setActiveDeckIndex(prev => prev + 1);
      setActiveSlideIndex(0);
    }
  };

  // Copy slide notes to notebook
  const handleCopyNotes = () => {
    if (!currentSlide) return;
    const noteText = `[${currentSubtopic.subtopicCode}] ${currentSlide.title}\n${currentSlide.content.join('\n')}`;
    navigator.clipboard.writeText(noteText);
    onSaveNoteFromSlide(currentSubtopic.subtopicCode, noteText);
    setCopiedNote(true);
    setTimeout(() => setCopiedNote(false), 2000);
  };

  return (
    <div className={`space-y-6 ${theme === 'light' ? 'text-slate-800' : 'text-slate-100'}`}>
      {/* Subject Tabs & Traffic Light Summary Banner */}
      <div className={`rounded-2xl border p-5 sm:p-6 transition shadow-sm ${
        theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded border ${
                theme === 'dark' ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-300'
              }`}>
                Cambridge IGCSE 0653
              </span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                theme === 'dark' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {subjectCounts.total} Subtopic Slide Units
              </span>
            </div>
            <h1 className={`text-xl sm:text-2xl font-black tracking-tight ${
              theme === 'dark' ? 'text-white' : 'text-slate-900'
            }`}>
              Interactive Lesson Slide Decks & Subtopic Mastery
            </h1>
            <p className={`text-xs sm:text-sm ${
              theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
            }`}>
              Browse every syllabus subtopic with the subtopic code in every slide header. Track your mastery using the 
              <span className="font-semibold text-emerald-400 mx-1">Traffic Light System</span> 
              (earn Green by scoring ≥80% on the 10-Question Knowledge Check).
            </p>
          </div>

          {/* Google Drive Folder Sync & Direct Folder Link - INSTRUCTOR ONLY */}
          {isInstructor ? (
            <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 shrink-0 self-start lg:self-center">
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-purple-500/15 text-purple-400 border border-purple-500/30">
                Instructor Drive Tools
              </span>
              <button
                onClick={handleOrganizeDriveLessons}
                disabled={isOrganizingDrive || isSyncingDrive}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition shadow-xs ${
                  isOrganizingDrive 
                    ? 'bg-amber-800 text-white animate-pulse'
                    : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-amber-600/30'
                }`}
                title="Reads the syllabus code at the start of each file name (e.g. P1.5.1.), creates corresponding subfolders in Google Drive, moves lessons into them, and replaces all synced lessons freshly."
              >
                <FolderSync className={`w-3.5 h-3.5 ${isOrganizingDrive ? 'animate-spin' : ''}`} />
                <span>
                  {isOrganizingDrive 
                    ? 'Sorting into Subfolders...' 
                    : 'Sort into Subfolders (e.g. P1.5.1)'}
                </span>
              </button>

              <button
                onClick={handleReplaceAllLessons}
                disabled={isSyncingDrive || isOrganizingDrive}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition shadow-xs ${
                  isSyncingDrive && !isOrganizingDrive
                    ? 'bg-purple-800 text-white animate-pulse'
                    : 'bg-purple-600 hover:bg-purple-500 text-white'
                }`}
                title="Clears all existing cached lessons and re-syncs from Drive freshly."
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isSyncingDrive ? 'animate-spin' : ''}`} />
                <span>Replace All Lessons</span>
              </button>

              <a
                href={TARGET_DRIVE_FOLDER_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition ${
                  theme === 'dark' 
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                }`}
                title="Open Google Drive folder in new tab"
              >
                <span>Drive Folder</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>
            </div>
          ) : (
            /* STUDENT MODE: Clean status badge */
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold self-start lg:self-center">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Score ≥80% on 10-Q Quiz to earn Green Status</span>
            </div>
          )}
        </div>

        {/* Sync message if present (Instructor only) */}
        {isInstructor && driveSyncMessage && (
          <div className="mt-3 text-xs px-3.5 py-2 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 flex items-center justify-between">
            <span>{driveSyncMessage}</span>
            <button onClick={() => setDriveSyncMessage(null)} className="text-slate-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 3 Science Subject Selector Bar */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveSubjectTab('biology')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                activeSubjectTab === 'biology'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : theme === 'dark' 
                    ? 'bg-slate-800/80 text-emerald-400 hover:bg-slate-800 border border-slate-700/60' 
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span>Biology Topics (B1–B16)</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeSubjectTab === 'biology' ? 'bg-emerald-700 text-white' : 'bg-emerald-950/60 text-emerald-300'
              }`}>
                {subjectCounts.biology}
              </span>
            </button>

            <button
              onClick={() => setActiveSubjectTab('chemistry')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                activeSubjectTab === 'chemistry'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                  : theme === 'dark' 
                    ? 'bg-slate-800/80 text-sky-400 hover:bg-slate-800 border border-slate-700/60' 
                    : 'bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
              <span>Chemistry Topics (C1–C12)</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeSubjectTab === 'chemistry' ? 'bg-sky-700 text-white' : 'bg-sky-950/60 text-sky-300'
              }`}>
                {subjectCounts.chemistry}
              </span>
            </button>

            <button
              onClick={() => setActiveSubjectTab('physics')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                activeSubjectTab === 'physics'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                  : theme === 'dark' 
                    ? 'bg-slate-800/80 text-amber-400 hover:bg-slate-800 border border-slate-700/60' 
                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              <span>Physics Topics (P1–P5)</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeSubjectTab === 'physics' ? 'bg-amber-700 text-white' : 'bg-amber-950/60 text-amber-300'
              }`}>
                {subjectCounts.physics}
              </span>
            </button>

            <button
              onClick={() => setActiveSubjectTab('all')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition ${
                activeSubjectTab === 'all'
                  ? 'bg-slate-700 text-white'
                  : theme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Subjects
            </button>
          </div>

          {/* Traffic Light Quick Filter Pill */}
          <div className={`flex items-center gap-1.5 p-1 rounded-xl border text-xs ${
            theme === 'dark' ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-100 border-slate-300'
          }`}>
            <span className="text-[11px] font-semibold text-slate-400 px-2">Filter Status:</span>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                statusFilter === 'all' 
                  ? 'bg-slate-700 text-white' 
                  : theme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({currentSubjectTrafficCounts.total})
            </button>
            <button
              onClick={() => setStatusFilter('green')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition ${
                statusFilter === 'green' 
                  ? 'bg-emerald-600 text-white' 
                  : 'text-emerald-400 hover:bg-emerald-500/10'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Green ({currentSubjectTrafficCounts.green})</span>
            </button>
            <button
              onClick={() => setStatusFilter('orange')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition ${
                statusFilter === 'orange' 
                  ? 'bg-amber-600 text-white' 
                  : 'text-amber-400 hover:bg-amber-500/10'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>Orange ({currentSubjectTrafficCounts.orange})</span>
            </button>
            <button
              onClick={() => setStatusFilter('red')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition ${
                statusFilter === 'red' 
                  ? 'bg-rose-600 text-white' 
                  : 'text-rose-400 hover:bg-rose-500/10'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span>Red ({currentSubjectTrafficCounts.red})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Subtopics Navigator | Right Slide Presentation & Traffic Light Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Subtopics Accordion/List (lg:col-span-4) */}
        <div className={`lg:col-span-4 rounded-2xl border p-4 space-y-4 max-h-[850px] overflow-y-auto ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <h2 className="font-bold text-sm">Subtopics Directory</h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {filteredSubtopics.length} Available
            </span>
          </div>

          {/* Grouped Subtopics by main topic */}
          <div className="space-y-4">
            {groupedSubtopics.map(group => (
              <div key={group.topicCode} className="space-y-1.5">
                <div className={`px-2 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider flex items-center justify-between ${
                  theme === 'dark' ? 'bg-slate-950/70 text-slate-400' : 'bg-slate-100 text-slate-600'
                }`}>
                  <span>{group.topicCode}: {group.topicName}</span>
                  <span className="font-mono text-[10px]">
                    {group.items.length} units • {group.items.reduce((acc, it) => acc + (it.decks?.length || 1), 0)} lessons
                  </span>
                </div>

                <div className="space-y-1">
                  {group.items.map(sub => {
                    const isSelected = sub.subtopicCode === selectedSubtopicCode;
                    const light = trafficLights[sub.subtopicCode];
                    const quizResult = subtopicQuizScores[sub.subtopicCode];
                    const subLessonCount = sub.decks?.length || 1;

                    return (
                      <button
                        key={sub.subtopicCode}
                        onClick={() => {
                          setSelectedSubtopicCode(sub.subtopicCode);
                          setActiveDeckIndex(0);
                          setActiveSlideIndex(0);
                        }}
                        className={`w-full text-left p-2.5 rounded-xl transition flex items-center justify-between gap-2 border ${
                          isSelected
                            ? theme === 'dark'
                              ? 'bg-slate-800 border-emerald-500/50 shadow-sm'
                              : 'bg-emerald-50 border-emerald-400 shadow-xs'
                            : theme === 'dark'
                              ? 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/60'
                              : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-mono text-xs font-bold text-emerald-400">
                              [{sub.subtopicCode}]
                            </span>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                              sub.tier.includes('Supplement') 
                                ? 'bg-amber-500/20 text-amber-300' 
                                : 'bg-blue-500/20 text-blue-300'
                            }`}>
                              {sub.tier}
                            </span>
                            {/* Clear number of lessons badge */}
                            <span 
                              className={`text-[10px] px-1.5 py-0.2 rounded font-black border ${
                                subLessonCount > 1
                                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                                  : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
                              }`} 
                              title={`${subLessonCount} lessons in this subtopic`}
                            >
                              {subLessonCount} {subLessonCount === 1 ? 'Lesson' : 'Lessons'}
                            </span>
                            {isInstructor && subtopicsWithDriveSlides.has(sub.subtopicCode.toUpperCase()) && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-0.5" title="Instructor: Exact Google Drive slide linked">
                                <Cloud className="w-2.5 h-2.5" />
                                <span>Drive</span>
                              </span>
                            )}
                            {quizResult && quizResult.passed && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                                {quizResult.score}/10 (Quiz)
                              </span>
                            )}
                          </div>
                          <p className={`text-xs font-semibold truncate ${
                            isSelected 
                              ? theme === 'dark' ? 'text-white' : 'text-slate-900' 
                              : theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                          }`}>
                            {sub.title}
                            <span className="ml-1.5 opacity-65 font-normal text-[11px]">
                              ({subLessonCount} {subLessonCount === 1 ? 'lesson' : 'lessons'})
                            </span>
                          </p>
                        </div>

                        {/* Traffic Light Dot Indicator */}
                        <div className="shrink-0 flex items-center gap-1">
                          {light === 'green' && (
                            <span 
                              title="Mastered (Quiz ≥ 80%)" 
                              className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-xs shadow-emerald-500/50 flex items-center justify-center text-[8px] text-slate-950 font-bold"
                            >
                              ✓
                            </span>
                          )}
                          {light === 'orange' && (
                            <span 
                              title="Needs some revision" 
                              className="w-3.5 h-3.5 rounded-full bg-amber-500 shadow-xs shadow-amber-500/50"
                            />
                          )}
                          {light === 'red' && (
                            <span 
                              title="Needs a lot of revision" 
                              className="w-3.5 h-3.5 rounded-full bg-rose-500 shadow-xs shadow-rose-500/50"
                            />
                          )}
                          {!light && (
                            <span 
                              title="Unranked - Click to rank knowledge" 
                              className="w-3 h-3 rounded-full border border-dashed border-slate-500"
                            />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: Active Subtopic Slide Viewer & Traffic Light Panel (lg:col-span-8) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Subtopic Header & Traffic Light Ranking System */}
          <div className={`rounded-2xl border p-5 sm:p-6 transition shadow-sm ${
            theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4 mb-4 border-slate-800/80">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`font-mono text-sm font-black px-2.5 py-0.5 rounded border ${currentThemeStyles.badge}`}>
                    [{currentSubtopic.subtopicCode}] {currentSubtopic.subject.toUpperCase()}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    theme === 'dark' ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {currentSubtopic.topicName}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                    {currentSubtopic.tier}
                  </span>
                  {/* Clear number of lessons badge */}
                  <span className="inline-flex items-center gap-1.5 text-xs font-black px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-xs">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{currentLessonCount} {currentLessonCount === 1 ? 'Lesson' : 'Lessons'}</span>
                  </span>
                </div>
                <div className="flex flex-wrap items-baseline gap-2.5 mt-1.5">
                  <h2 className={`text-xl sm:text-2xl font-black ${
                    theme === 'dark' ? 'text-white' : 'text-slate-900'
                  }`}>
                    {currentSubtopic.title}
                  </h2>
                  <span className="text-base font-extrabold text-emerald-400 font-mono">
                    • {currentLessonCount} {currentLessonCount === 1 ? 'Lesson' : 'Lessons'}
                  </span>
                </div>
              </div>

              {/* Large, obvious Lesson Deck Switcher in Subtopic Header when multiple lessons exist */}
              {currentLessonCount > 1 && (
                <div className={`p-3 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0 shadow-sm ${
                  theme === 'dark' ? 'bg-slate-950/80 border-slate-700/80' : 'bg-slate-100/90 border-slate-300'
                }`}>
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-black uppercase tracking-wider text-slate-300">
                      Lesson Decks ({currentLessonCount}):
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {Array.from({ length: currentLessonCount }).map((_, i) => {
                      const isCurrent = hasMatchingDriveSlide 
                        ? i === activeDriveSlideIdx 
                        : i === activeDeckIndex;
                      const deckTitle = hasMatchingDriveSlide
                        ? (driveSlidesForCurrentSubtopic[i]?.name || `Lesson ${i + 1}`)
                        : (currentSubtopic.decks[i]?.title || `Lesson ${i + 1}`);

                      return (
                        <button
                          key={i}
                          onClick={() => {
                            if (hasMatchingDriveSlide) {
                              setActiveDriveSlideIdx(i);
                            } else {
                              setActiveDeckIndex(i);
                              setActiveSlideIndex(0);
                            }
                          }}
                          className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 shadow-sm cursor-pointer ${
                            isCurrent
                              ? hasMatchingDriveSlide
                                ? 'bg-blue-600 text-white ring-2 ring-blue-400 shadow-blue-600/30'
                                : 'bg-emerald-600 text-white ring-2 ring-emerald-400 shadow-emerald-600/30'
                              : theme === 'dark'
                                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                                : 'bg-white text-slate-800 hover:bg-slate-200 border border-slate-300'
                          }`}
                          title={deckTitle}
                        >
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                            isCurrent ? 'bg-white text-slate-950' : 'bg-slate-700 text-slate-300'
                          }`}>
                            {i + 1}
                          </span>
                          <span>Lesson {i + 1}</span>
                          {isCurrent && (
                            <span className="text-[10px] uppercase font-bold opacity-90">
                              (Active)
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* TRAFFIC LIGHT CONTROLS: Red, Orange, Green (with 80% quiz requirement) */}
            <div className={`p-4 rounded-xl border space-y-3 ${
              theme === 'dark' ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Subtopic Traffic Light Knowledge Rating:
                    </span>
                    {trafficLights[currentSubtopic.subtopicCode] && (
                      <span className={`text-xs font-bold capitalize px-2 py-0.2 rounded-full ${
                        trafficLights[currentSubtopic.subtopicCode] === 'green'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : trafficLights[currentSubtopic.subtopicCode] === 'orange'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}>
                        Current: {trafficLights[currentSubtopic.subtopicCode]}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    How well do you know this subtopic? (To achieve <strong className="text-emerald-400">Green</strong>, you must score ≥80% on the 10-question quiz).
                  </p>
                </div>

                {/* Subtopic Quiz Score summary if taken */}
                {subtopicQuizScores[currentSubtopic.subtopicCode] && (
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400">Knowledge Check: </span>
                    <span className={`text-xs font-bold font-mono ${
                      subtopicQuizScores[currentSubtopic.subtopicCode].passed ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      {subtopicQuizScores[currentSubtopic.subtopicCode].score}/10 ({subtopicQuizScores[currentSubtopic.subtopicCode].percentage}%)
                    </span>
                  </div>
                )}
              </div>

              {/* 3 Interactive Traffic Light Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                {/* RED BUTTON */}
                <button
                  onClick={() => handleTrafficLightSelect(currentSubtopic.subtopicCode, 'red')}
                  className={`p-3 rounded-xl border text-left transition flex items-center gap-3 ${
                    trafficLights[currentSubtopic.subtopicCode] === 'red'
                      ? 'bg-rose-500/20 border-rose-500 text-rose-300 ring-2 ring-rose-500/30'
                      : theme === 'dark' 
                        ? 'bg-slate-900 border-slate-800 text-slate-300 hover:border-rose-500/50' 
                        : 'bg-white border-slate-200 text-slate-700 hover:border-rose-400'
                  }`}
                >
                  <div className="w-5 h-5 rounded-full bg-rose-500 shrink-0 flex items-center justify-center text-white text-xs font-bold shadow-xs shadow-rose-500/50">
                    {trafficLights[currentSubtopic.subtopicCode] === 'red' ? '✓' : ''}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-rose-400">Red Status</div>
                    <div className="text-[10px] text-slate-400 leading-tight">Need a lot more revision</div>
                  </div>
                </button>

                {/* ORANGE BUTTON */}
                <button
                  onClick={() => handleTrafficLightSelect(currentSubtopic.subtopicCode, 'orange')}
                  className={`p-3 rounded-xl border text-left transition flex items-center gap-3 ${
                    trafficLights[currentSubtopic.subtopicCode] === 'orange'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 ring-2 ring-amber-500/30'
                      : theme === 'dark' 
                        ? 'bg-slate-900 border-slate-800 text-slate-300 hover:border-amber-500/50' 
                        : 'bg-white border-slate-200 text-slate-700 hover:border-amber-400'
                  }`}
                >
                  <div className="w-5 h-5 rounded-full bg-amber-500 shrink-0 flex items-center justify-center text-white text-xs font-bold shadow-xs shadow-amber-500/50">
                    {trafficLights[currentSubtopic.subtopicCode] === 'orange' ? '✓' : ''}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-amber-400">Orange Status</div>
                    <div className="text-[10px] text-slate-400 leading-tight">Need some more revision</div>
                  </div>
                </button>

                {/* GREEN BUTTON (Trigger Quiz if <80%) */}
                <button
                  onClick={() => handleTrafficLightSelect(currentSubtopic.subtopicCode, 'green')}
                  className={`p-3 rounded-xl border text-left transition flex items-center gap-3 ${
                    trafficLights[currentSubtopic.subtopicCode] === 'green'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/30'
                      : theme === 'dark' 
                        ? 'bg-slate-900 border-slate-800 text-slate-300 hover:border-emerald-500/50' 
                        : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-400'
                  }`}
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-500 shrink-0 flex items-center justify-center text-slate-950 text-xs font-black shadow-xs shadow-emerald-500/50">
                    {trafficLights[currentSubtopic.subtopicCode] === 'green' ? '✓' : '★'}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <span>Green Status</span>
                      <Award className="w-3 h-3" />
                    </div>
                    <div className="text-[10px] text-slate-400 leading-tight">
                      {subtopicQuizScores[currentSubtopic.subtopicCode]?.passed
                        ? 'Mastered! (Score ≥ 80%)'
                        : 'Requires 10-Q Quiz (≥80%)'}
                    </div>
                  </div>
                </button>
              </div>

              {/* Take/Retake Quiz Direct Action Link */}
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-400 text-[11px]">
                  Want to verify or improve your knowledge?
                </span>
                <button
                  onClick={() => startQuizForSubtopic(currentSubtopic.subtopicCode)}
                  className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 transition"
                >
                  <span>Take 10-Question Knowledge Check</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* EXACT UNALTERED GOOGLE SLIDES (IF PRESENT IN DRIVE)                      */}
          {/* OR AI GENERATED SLIDES (IF MISSING FROM DRIVE)                          */}
          {/* ========================================================================= */}
          {hasMatchingDriveSlide && activeDriveSlide ? (
            <div className={`rounded-2xl border transition shadow-sm overflow-hidden ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              {/* Slide Top Toolbar for Exact Unaltered Google Slide */}
              <div className={`p-4 border-b flex flex-wrap items-center justify-between gap-3 ${
                theme === 'dark' ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-100 border-slate-200'
              }`}>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-black px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    [{currentSubtopic.subtopicCode}] {currentSubtopic.title} · ({currentLessonCount} {currentLessonCount === 1 ? 'Lesson' : 'Lessons'})
                  </span>
                  {isInstructor ? (
                    <>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold flex items-center gap-1">
                        <Cloud className="w-3 h-3 text-purple-400" />
                        <span>Exact Drive Slide</span>
                      </span>
                      <span className="text-xs text-slate-400 font-medium truncate max-w-xs md:max-w-md" title={activeDriveSlide.name}>
                        {activeDriveSlide.name}
                      </span>
                    </>
                  ) : (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 font-semibold flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-emerald-400" />
                      <span>Cambridge Slide Deck</span>
                    </span>
                  )}
                </div>

                {/* Toolbar controls */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* If multiple decks match this subtopic, deck switcher */}
                  {driveSlidesForCurrentSubtopic.length > 1 && (
                    <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-700">
                      <Layers className="w-3.5 h-3.5 text-blue-400" />
                      <span className="text-xs text-slate-300 font-bold">Deck:</span>
                      <select
                        value={activeDriveSlideIdx}
                        onChange={e => setActiveDriveSlideIdx(Number(e.target.value))}
                        className={`text-xs px-2 py-1 rounded-lg border font-bold ${
                          theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-800'
                        }`}
                      >
                        {driveSlidesForCurrentSubtopic.map((d, i) => (
                          <option key={d.id} value={i}>Lesson {i + 1}: {d.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Companion AI Notes Toggle */}
                  {currentDeck && (
                    <button
                      onClick={() => setShowAiNotesWithDrive(prev => !prev)}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition ${
                        showAiNotesWithDrive
                          ? 'bg-emerald-600 text-white border-emerald-500'
                          : theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white' : 'bg-white border-slate-300 text-slate-700'
                      }`}
                      title="Toggle syllabus companion notes and practical risk assessment"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{showAiNotesWithDrive ? 'Hide Notes' : 'Companion Notes'}</span>
                    </button>
                  )}

                  <a
                    href={activeDriveSlide.directUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-xs"
                    title="Open full Google Slides presentation in a new tab"
                  >
                    <span>Open in Slides</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  {/* Instructor-only Set Slide URL button */}
                  {isInstructor && (
                    <button
                      onClick={() => setShowManualInput(prev => !prev)}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition ${
                        showManualInput
                          ? 'bg-purple-600 text-white border-purple-500'
                          : theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white' : 'bg-white border-slate-300 text-slate-700'
                      }`}
                      title="Instructor: Set custom slide URL or presentation ID"
                    >
                      <span>{showManualInput ? 'Close' : 'Set Slide URL'}</span>
                    </button>
                  )}

                  <button
                    onClick={() => setIsFullScreen(prev => !prev)}
                    className={`p-2 rounded-lg border text-xs transition ${
                      theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white' : 'bg-white border-slate-300 text-slate-700'
                    }`}
                    title={isFullScreen ? "Exit Fullscreen" : "Fullscreen presentation"}
                  >
                    {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Manual URL / Presentation ID Direct Embed Form (Instructor Only) */}
              {isInstructor && showManualInput && (
                <div className={`p-4 border-b space-y-3 ${
                  theme === 'dark' ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <form onSubmit={handleSaveManualSlide} className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={manualInputUrl}
                      onChange={e => setManualInputUrl(e.target.value)}
                      placeholder={`Paste Google Slides link or presentation ID for [${currentSubtopic.subtopicCode}]...`}
                      className={`flex-1 px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        theme === 'dark' ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shrink-0 transition"
                    >
                      Save Slide Embed
                    </button>
                  </form>
                  <p className="text-[11px] text-slate-400">
                    Accepts any Google Slides URL or Presentation ID from your Drive folder (<code>1kypXZXP3nY9pFxuSJOTZ1anODYxxfZ1a</code>).
                  </p>
                </div>
              )}

              {/* LARGE & OBVIOUS LESSON DECK SWITCHER (DRIVE SLIDES) */}
              {driveSlidesForCurrentSubtopic.length > 1 && (
                <div className={`p-4 sm:p-5 border-b space-y-3 ${
                  theme === 'dark' ? 'bg-slate-950/95 border-slate-800' : 'bg-blue-50/90 border-blue-200'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold shrink-0 shadow-xs">
                        <Presentation className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black tracking-wide flex items-center gap-2">
                          <span className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>
                            {isInstructor ? 'SWITCH LESSON DECK' : 'SELECT LESSON'}
                          </span>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                            {driveSlidesForCurrentSubtopic.length} {driveSlidesForCurrentSubtopic.length === 1 ? 'Part' : 'Parts'}
                          </span>
                        </h4>
                        <p className="text-xs text-slate-400">
                          {isInstructor 
                            ? 'Switch between Google Slides presentations for this subtopic:' 
                            : 'Choose a lesson part to view its interactive presentation:'}
                        </p>
                      </div>
                    </div>
                    <div className="text-xs font-black font-mono px-3.5 py-1.5 rounded-xl bg-blue-950/80 border border-blue-500/40 text-blue-300 self-start sm:self-auto shadow-xs">
                      Active: Lesson {activeDriveSlideIdx + 1} of {driveSlidesForCurrentSubtopic.length}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                    {driveSlidesForCurrentSubtopic.map((slideItem, idx) => {
                      const isCurrent = idx === activeDriveSlideIdx;
                      return (
                        <button
                          key={slideItem.id}
                          onClick={() => setActiveDriveSlideIdx(idx)}
                          className={`flex items-start gap-3.5 p-3.5 rounded-2xl border text-left transition relative cursor-pointer ${
                            isCurrent
                              ? 'bg-blue-600 border-blue-400 text-white shadow-xl shadow-blue-600/30 ring-2 ring-blue-400 scale-[1.01]'
                              : theme === 'dark'
                                ? 'bg-slate-900/90 border-slate-800 text-slate-300 hover:bg-slate-850 hover:border-slate-700 hover:text-white'
                                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-950 shadow-xs'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center font-black text-base transition ${
                            isCurrent ? 'bg-white text-blue-600 shadow-md' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          }`}>
                            {idx + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className={`text-xs font-black uppercase tracking-wider ${
                                isCurrent ? 'text-blue-100' : 'text-blue-400'
                              }`}>
                                Lesson Deck {idx + 1}
                              </span>
                              {isCurrent ? (
                                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-white/20 text-white shadow-xs">
                                  Current Deck
                                </span>
                              ) : (
                                <span className="text-[10px] font-semibold text-slate-400">
                                  Click to load
                                </span>
                              )}
                            </div>
                            <p className={`text-xs font-bold line-clamp-2 leading-snug ${isCurrent ? 'text-white' : ''}`} title={slideItem.name}>
                              {slideItem.name}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Slide Content: Unaltered Google Slides Iframe Embed */}
              <div className="p-3 sm:p-5 bg-slate-950">
                <div className="space-y-3">
                  <div className="relative w-full aspect-[16/9] min-h-[480px] sm:min-h-[580px] rounded-xl overflow-hidden bg-black shadow-xl border border-slate-800">
                    <iframe
                      src={activeDriveSlide.embedUrl}
                      title={activeDriveSlide.name}
                      className="w-full h-full border-0 absolute inset-0"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-slate-400 px-1 pt-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>Showing exact, unaltered presentation from Google Drive: <strong className="text-slate-200">{activeDriveSlide.name}</strong></span>
                    </div>
                    <a
                      href={TARGET_DRIVE_FOLDER_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      <span>Drive Folder: 1kypXZXP3nY9pFxuSJOTZ1anODYxxfZ1a</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Optional AI Companion Notes under Drive Slide */}
              {showAiNotesWithDrive && currentDeck && (
                <div className={`p-6 border-t space-y-4 ${
                  theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold flex items-center gap-2 text-emerald-400">
                      <BookOpen className="w-4 h-4" />
                      <span>Cambridge 0653 AI Syllabus Notes & Practical Guidelines</span>
                    </h4>
                    <button
                      onClick={handleCopyNotes}
                      className="text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1"
                    >
                      {copiedNote ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedNote ? 'Copied' : 'Copy All Notes'}</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs leading-relaxed">
                    {currentDeck.slides.map((s, idx) => (
                      <div key={idx} className={`p-3 rounded-xl border ${
                        theme === 'dark' ? 'bg-slate-950/60 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
                      }`}>
                        <div className="font-bold text-emerald-400 mb-1">{s.title}</div>
                        <ul className="list-disc pl-4 space-y-1">
                          {s.content.slice(0, 3).map((pt, pidx) => (
                            <li key={pidx}>{pt}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* SUBTOPIC MISSING CORRESPONDING GOOGLE SLIDE FROM DRIVE: Keep AI Generated Slide Deck */
            currentDeck && currentSlide && (
              <div className={`rounded-2xl border transition shadow-sm overflow-hidden ${
                theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                {/* Slide Top Toolbar with Header containing [SubtopicCode] */}
                <div className={`p-4 border-b flex flex-wrap items-center justify-between gap-3 ${
                  theme === 'dark' ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-100 border-slate-200'
                }`}>
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Every single slide has the subtopic letter and number in the header with lesson count! */}
                    <span className="font-mono text-xs font-black px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {currentSlide.subtopicHeader || `[${currentSubtopic.subtopicCode}] ${currentSubtopic.title}`} · ({currentLessonCount} {currentLessonCount === 1 ? 'Lesson' : 'Lessons'})
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                      AI-Generated Deck
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Slide {activeSlideIndex + 1} of {currentDeck.slides.length}
                    </span>
                  </div>

                  {/* Toolbar controls */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => setShowManualInput(prev => !prev)}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition ${
                        showManualInput
                          ? 'bg-blue-600 text-white border-blue-500'
                          : theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white' : 'bg-white border-slate-300 text-slate-700'
                      }`}
                      title="Link or embed a direct Google Slides presentation for this subtopic"
                    >
                      <Cloud className="w-3.5 h-3.5 text-blue-400" />
                      <span>{showManualInput ? 'Close' : 'Set Slide URL'}</span>
                    </button>

                    <button
                      onClick={handleCopyNotes}
                      title="Copy slide notes to clipboard and syllabus notebook"
                      className={`p-2 rounded-lg text-xs font-medium transition flex items-center gap-1 ${
                        copiedNote
                          ? 'bg-emerald-500 text-slate-950'
                          : theme === 'dark' ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-200 text-slate-600'
                      }`}
                    >
                      {copiedNote ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span className="hidden sm:inline">{copiedNote ? 'Copied' : 'Save Notes'}</span>
                    </button>

                    <button
                      onClick={() => onAskAITutor(`Explain ${currentSlide.title} for IGCSE 0653 [${currentSubtopic.subtopicCode}]`, currentSubtopic.subtopicCode)}
                      title="Ask AI Tutor to explain this slide"
                      className="p-2 rounded-lg text-xs font-medium text-emerald-400 hover:bg-emerald-500/10 transition flex items-center gap-1"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span className="hidden sm:inline">Ask Tutor</span>
                    </button>
                  </div>
                </div>

                {/* Manual URL / Presentation ID Direct Embed Form */}
                {showManualInput && (
                  <div className={`p-4 border-b space-y-3 ${
                    theme === 'dark' ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <form onSubmit={handleSaveManualSlide} className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={manualInputUrl}
                        onChange={e => setManualInputUrl(e.target.value)}
                        placeholder={`Paste Google Slides link or presentation ID for [${currentSubtopic.subtopicCode}]...`}
                        className={`flex-1 px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                          theme === 'dark' ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                        }`}
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shrink-0 transition"
                      >
                        Embed Direct Slide
                      </button>
                    </form>
                    <p className="text-[11px] text-slate-400">
                      Paste any Google Slides URL or Presentation ID from your Drive folder (<code>1kypXZXP3nY9pFxuSJOTZ1anODYxxfZ1a</code>) to replace this AI slide with your exact presentation.
                    </p>
                  </div>
                )}

                {/* LARGE & OBVIOUS LESSON DECK SWITCHER (AI SYLLABUS DECKS) */}
                {currentSubtopic.decks.length > 1 && (
                  <div className={`p-4 sm:p-5 border-b space-y-3 ${
                    theme === 'dark' ? 'bg-slate-950/95 border-slate-800' : 'bg-emerald-50/90 border-emerald-200'
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold shrink-0 shadow-xs">
                          <Presentation className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black tracking-wide flex items-center gap-2">
                            <span className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>SWITCH LESSON DECK</span>
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              {currentSubtopic.decks.length} Lessons Available
                            </span>
                          </h4>
                          <p className="text-xs text-slate-400">
                            This subtopic has multiple lesson decks. Click any lesson below to view its slides:
                          </p>
                        </div>
                      </div>
                      <div className="text-xs font-black font-mono px-3.5 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 self-start sm:self-auto shadow-xs">
                        Active: Lesson {activeDeckIndex + 1} of {currentSubtopic.decks.length}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                      {currentSubtopic.decks.map((deck, idx) => {
                        const isCurrent = idx === activeDeckIndex;
                        return (
                          <button
                            key={deck.id}
                            onClick={() => {
                              setActiveDeckIndex(idx);
                              setActiveSlideIndex(0);
                            }}
                            className={`flex items-start gap-3.5 p-3.5 rounded-2xl border text-left transition relative cursor-pointer ${
                              isCurrent
                                ? 'bg-emerald-600 border-emerald-400 text-white shadow-xl shadow-emerald-600/30 ring-2 ring-emerald-400 scale-[1.01]'
                                : theme === 'dark'
                                  ? 'bg-slate-900/90 border-slate-800 text-slate-300 hover:bg-slate-850 hover:border-slate-700 hover:text-white'
                                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-950 shadow-xs'
                            }`}
                          >
                            <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center font-black text-base transition ${
                              isCurrent ? 'bg-white text-emerald-600 shadow-md' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            }`}>
                              {idx + 1}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1 mb-1">
                                <span className={`text-xs font-black uppercase tracking-wider ${
                                  isCurrent ? 'text-emerald-100' : 'text-emerald-400'
                                }`}>
                                  Lesson {idx + 1}
                                </span>
                                <span className={`text-[10px] font-mono font-bold ${
                                  isCurrent ? 'text-emerald-100' : 'text-slate-400'
                                }`}>
                                  {deck.slides.length} Slides
                                </span>
                              </div>
                              <p className={`text-xs font-bold line-clamp-2 leading-snug ${isCurrent ? 'text-white' : ''}`} title={deck.title}>
                                {deck.title}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Slide Body Canvas */}
                <div className={`p-6 sm:p-8 space-y-6 ${
                  theme === 'dark' ? 'bg-slate-900/90' : 'bg-white'
                }`}>
                  {/* Slide Title */}
                  <div>
                    <h3 className={`text-xl sm:text-2xl font-bold tracking-tight ${
                      theme === 'dark' ? 'text-white' : 'text-slate-900'
                    }`}>
                      {currentSlide.title}
                    </h3>
                    <div className="w-12 h-1 bg-emerald-500 rounded-full mt-2"></div>
                  </div>

                  {/* Slide Content Bullet Points */}
                  <div className="space-y-3.5 leading-relaxed">
                    {currentSlide.content.map((point, idx) => (
                      <div 
                        key={idx} 
                        className={`p-3.5 rounded-xl border text-sm sm:text-base ${
                          theme === 'dark' 
                            ? 'bg-slate-950/50 border-slate-800/80 text-slate-200' 
                            : 'bg-slate-50 border-slate-200 text-slate-800'
                        }`}
                      >
                        {point}
                      </div>
                    ))}
                  </div>

                  {/* Special Practical Box if present */}
                  {currentSlide.practicalInfo && (
                    <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                        <Lightbulb className="w-4 h-4" />
                        <span>Cambridge Required Practical Protocol & Risk Assessment</span>
                      </div>
                      <div className="text-xs space-y-2 text-slate-300">
                        <div><strong className="text-white">Aim:</strong> {currentSlide.practicalInfo.aim}</div>
                        <div><strong className="text-white">Equipment:</strong> {currentSlide.practicalInfo.equipment.join(', ')}</div>
                        <div>
                          <strong className="text-white">Safety Precaution:</strong> {currentSlide.practicalInfo.riskAssessment[0]?.hazard} - {currentSlide.practicalInfo.riskAssessment[0]?.precaution}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Keywords Cloud */}
                  {currentDeck.keywords && currentDeck.keywords.length > 0 && (
                    <div className="pt-2 border-t border-slate-800/60 flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-slate-400">Syllabus Keywords:</span>
                      {currentDeck.keywords.map(kw => (
                        <span 
                          key={kw} 
                          className={`text-xs px-2 py-0.5 rounded-full font-mono font-medium ${
                            theme === 'dark' ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Slide Bottom Navigation Bar */}
                <div className={`p-4 border-t flex items-center justify-between gap-4 ${
                  theme === 'dark' ? 'bg-slate-950/90 border-slate-800' : 'bg-slate-100 border-slate-200'
                }`}>
                  <button
                    onClick={goToPreviousSlide}
                    disabled={activeSlideIndex === 0 && activeDeckIndex === 0}
                    className={`flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold transition ${
                      activeSlideIndex === 0 && activeDeckIndex === 0
                        ? 'opacity-40 cursor-not-allowed'
                        : theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous Slide</span>
                  </button>

                  {/* Slide dots indicator */}
                  <div className="hidden sm:flex items-center gap-1.5 overflow-x-auto">
                    {currentDeck.slides.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveSlideIndex(idx)}
                        title={`Go to slide ${idx + 1}`}
                        className={`w-2.5 h-2.5 rounded-full transition ${
                          idx === activeSlideIndex 
                            ? 'bg-emerald-400 scale-125' 
                            : theme === 'dark' ? 'bg-slate-700 hover:bg-slate-500' : 'bg-slate-300 hover:bg-slate-400'
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={goToNextSlide}
                    disabled={activeSlideIndex === currentDeck.slides.length - 1 && activeDeckIndex === currentSubtopic.decks.length - 1}
                    className={`flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold transition ${
                      activeSlideIndex === currentDeck.slides.length - 1 && activeDeckIndex === currentSubtopic.decks.length - 1
                        ? 'opacity-40 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    }`}
                  >
                    <span>Next Slide</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          )}

          {/* Syllabus Objectives Summary for this Subtopic */}
          {currentSubtopic.syllabusSummary && (
            <div className={`rounded-2xl border p-5 space-y-3 ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                  Cambridge 0653 Syllabus Learning Outcomes:
                </h4>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
                {currentSubtopic.syllabusSummary.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* 10-QUESTION SUBTOPIC QUIZ MODAL FOR GREEN STATUS CERTIFICATION */}
      {isQuizModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`rounded-2xl border max-w-2xl w-full p-6 sm:p-7 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto ${
            theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-4 border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  ★
                </div>
                <div>
                  <h3 className="font-bold text-base">
                    [{quizSubtopicCode}] Knowledge Check: Green Status Quiz
                  </h3>
                  <p className="text-xs text-slate-400">
                    Cambridge Standard: Score at least 80% (8/10) to earn Green status
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsQuizModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* If Quiz Not Completed: Question by Question */}
            {!quizCompleted && quizQuestions.length > 0 && (
              <div className="space-y-6">
                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                    <span>Question {currentQuestionIndex + 1} of {quizQuestions.length}</span>
                    <span>Answered: {Object.keys(submittedAnswers).length} / {quizQuestions.length}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 transition-all duration-300"
                      style={{ width: `${((currentQuestionIndex + 1) / quizQuestions.length) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Active Question Card */}
                {quizQuestions[currentQuestionIndex] && (
                  <div className="space-y-4">
                    <h4 className="text-base sm:text-lg font-bold text-white leading-snug">
                      {quizQuestions[currentQuestionIndex].question}
                    </h4>

                    {/* 4 Options */}
                    <div className="space-y-2.5">
                      {quizQuestions[currentQuestionIndex].options.map((opt, optIdx) => {
                        const isSelected = selectedAnswers[currentQuestionIndex] === optIdx;
                        const isSubmitted = submittedAnswers[currentQuestionIndex];
                        const isCorrect = optIdx === quizQuestions[currentQuestionIndex].correctIndex;

                        let btnStyle = theme === 'dark' 
                          ? 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-200' 
                          : 'bg-slate-50 border-slate-300 hover:border-slate-400 text-slate-800';

                        if (isSubmitted) {
                          if (isCorrect) {
                            btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-semibold';
                          } else if (isSelected) {
                            btnStyle = 'bg-rose-500/20 border-rose-500 text-rose-300';
                          } else {
                            btnStyle = 'opacity-50 border-slate-800';
                          }
                        } else if (isSelected) {
                          btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-300';
                        }

                        return (
                          <button
                            key={optIdx}
                            onClick={() => handleSelectQuizAnswer(currentQuestionIndex, optIdx)}
                            className={`w-full text-left p-3.5 rounded-xl border text-sm transition flex items-start gap-3 ${btnStyle}`}
                          >
                            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-800 shrink-0">
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span className="flex-1">{opt}</span>
                            {isSubmitted && isCorrect && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>

                    {/* Instant Explanation upon answering */}
                    {submittedAnswers[currentQuestionIndex] && (
                      <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-1">
                        <div className="font-bold text-emerald-400">Examiner Rationale:</div>
                        <p className="text-slate-300 leading-relaxed">
                          {quizQuestions[currentQuestionIndex].explanation}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Modal Navigation Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                  <button
                    onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentQuestionIndex === 0}
                    className={`px-4 py-2 rounded-xl text-xs font-bold ${
                      currentQuestionIndex === 0 ? 'opacity-40 cursor-not-allowed' : 'bg-slate-800 hover:bg-slate-700 text-white'
                    }`}
                  >
                    Previous
                  </button>

                  {currentQuestionIndex < quizQuestions.length - 1 ? (
                    <button
                      onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                      className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
                    >
                      Next Question
                    </button>
                  ) : (
                    <button
                      onClick={handleCompleteQuiz}
                      disabled={Object.keys(submittedAnswers).length < quizQuestions.length}
                      className={`px-5 py-2 rounded-xl text-xs font-bold ${
                        Object.keys(submittedAnswers).length < quizQuestions.length
                          ? 'opacity-40 cursor-not-allowed bg-slate-800 text-slate-400'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg'
                      }`}
                    >
                      Submit & Certify Status
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* If Quiz Completed: Score Summary & Status Award */}
            {quizCompleted && (
              <div className="text-center py-6 space-y-5">
                <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-3xl font-black shadow-xl"
                  style={{
                    backgroundColor: quizScore >= 8 ? '#10b981' : '#f59e0b',
                    color: '#020617'
                  }}
                >
                  {quizScore >= 8 ? '🎉' : '📚'}
                </div>

                <div className="space-y-1">
                  <h4 className="text-2xl font-black text-white">
                    {quizScore >= 8 ? 'Green Status Unlocked!' : 'Keep Revising for Green Status'}
                  </h4>
                  <p className="text-sm text-slate-300">
                    You scored <strong className="text-emerald-400 font-mono text-base">{quizScore}/10</strong> ({Math.round((quizScore / 10) * 100)}%) on [{quizSubtopicCode}].
                  </p>
                </div>

                {quizScore >= 8 ? (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 max-w-md mx-auto">
                    Outstanding mastery! Your score meets the minimum 80% threshold. Green status has been permanently recorded in your Progress Tracker.
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 max-w-md mx-auto">
                    You need at least 8/10 (80%) for Green status. Your status has been preserved as Orange/Red so you can review the lesson slides and retake anytime!
                  </div>
                )}

                <div className="pt-4 flex items-center justify-center gap-3">
                  <button
                    onClick={() => startQuizForSubtopic(quizSubtopicCode)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white"
                  >
                    Retake Quiz
                  </button>
                  <button
                    onClick={() => setIsQuizModalOpen(false)}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
                  >
                    Back to Lesson Slides
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
