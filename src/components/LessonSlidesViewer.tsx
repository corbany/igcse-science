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
  Presentation,
  PanelLeftClose,
  PanelLeftOpen,
  PanelLeft,
  ChevronDown,
  FlaskConical,
  Clock,
  Lock,
  RefreshCw,
  Key,
  XCircle,
  CheckCircle2,
  ChevronUp
} from 'lucide-react';
import { ScienceSubject, TrafficLightStatus, SubtopicQuizResult, StudentProgress, SubtopicSlideProgress } from '../types';
import { 
  allSubtopicsData, 
  SubtopicTopicGroup, 
  TeacherSlideDeck, 
  ClassroomSlide,
  getSubtopicsBySubject,
  resolveSubtopicByQuery 
} from '../data/subtopicSlidesData';
import { getQuizForSubtopic, getSubtopicQuestionPoolSize } from '../data/subtopicQuizzes';
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
import { 
  subscribeToCurriculumSlides, 
  saveSharedSlideOverride, 
  saveSharedSyncedDriveSlides 
} from '../services/firestoreService';
import { formatGoogleSlidesUrl } from '../data/googleSlidesRegistry';
import { signInWithGoogle, signInWithDriveScope, getCachedDriveToken, clearCachedDriveToken, auth } from '../services/firebaseAuth';
import { claimModuleRevisionReward, checkModuleClaimed } from '../services/firebaseGameService';
import { UserProfile } from '../types';

export interface ActiveLessonTaskContext {
  taskId: string;
  title: string;
  targetSubtopics: string[];
  targetSubject?: ScienceSubject | 'all';
  requiredQuizLength: number;
  type?: string;
}

interface LessonSlidesViewerProps {
  user?: UserProfile;
  isInstructor?: boolean;
  selectedSubject: ScienceSubject | 'all';
  searchQuery: string;
  targetSubtopicCode?: string | null;
  onClearTargetSubtopicCode?: () => void;
  completedLessons: string[];
  slidesReadBySubtopic?: Record<string, SubtopicSlideProgress>;
  trafficLights: Record<string, TrafficLightStatus>;
  subtopicQuizScores: Record<string, SubtopicQuizResult>;
  activeTaskContext?: ActiveLessonTaskContext | null;
  onUpdateSlidesRead?: (subtopicCode: string, slideProgress: SubtopicSlideProgress) => void;
  onUpdateTrafficLight: (subtopicCode: string, status: TrafficLightStatus) => void;
  onSaveQuizResult: (subtopicCode: string, result: SubtopicQuizResult) => void;
  onToggleCompleteLesson: (lessonId: string) => void;
  onSaveNoteFromSlide: (topicCode: string, note: string) => void;
  onNavigateToTaskQuiz?: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const LessonSlidesViewer: React.FC<LessonSlidesViewerProps> = ({
  user,
  isInstructor = false,
  selectedSubject,
  searchQuery,
  targetSubtopicCode,
  onClearTargetSubtopicCode,
  completedLessons,
  slidesReadBySubtopic = {},
  trafficLights = {},
  subtopicQuizScores = {},
  activeTaskContext = null,
  onUpdateSlidesRead,
  onUpdateTrafficLight,
  onSaveQuizResult,
  onToggleCompleteLesson,
  onSaveNoteFromSlide,
  onNavigateToTaskQuiz,
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

  // React to targetSubtopicCode navigation from student tasks or assignment links
  useEffect(() => {
    if (!targetSubtopicCode) return;
    const matched = resolveSubtopicByQuery(targetSubtopicCode);
    if (matched) {
      setActiveSubjectTab(matched.subject);
      setStatusFilter('all');
      setSelectedSubtopicCode(matched.subtopicCode);
      setActiveDeckIndex(0);
      setActiveSlideIndex(0);
      setExpandedSubtopics(prev => ({
        ...prev,
        [matched.subtopicCode]: true
      }));
    }
    if (onClearTargetSubtopicCode) {
      onClearTargetSubtopicCode();
    }
  }, [targetSubtopicCode, onClearTargetSubtopicCode]);

  const [activeDeckIndex, setActiveDeckIndex] = useState<number>(0);
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [copiedNote, setCopiedNote] = useState<boolean>(false);

  // Sidebar expanded / minimized state (allows hiding sidebar to focus on slides)
  const [isSidebarExpanded, setIsSidebarExpanded] = useState<boolean>(true);

  // Subtopic accordion expanded state: subtopicCode -> boolean
  const [expandedSubtopics, setExpandedSubtopics] = useState<Record<string, boolean>>(() => ({
    'B1.1': true
  }));

  // Auto-expand subtopic when selected
  useEffect(() => {
    if (selectedSubtopicCode) {
      setExpandedSubtopics(prev => ({
        ...prev,
        [selectedSubtopicCode]: true
      }));
    }
  }, [selectedSubtopicCode]);

  const toggleSubtopicExpanded = (code: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExpandedSubtopics(prev => ({
      ...prev,
      [code]: !prev[code]
    }));
  };

  const handleExpandAllSubtopics = () => {
    const allExp: Record<string, boolean> = {};
    filteredSubtopics.forEach(s => {
      allExp[s.subtopicCode] = true;
    });
    setExpandedSubtopics(allExp);
  };

  const handleCollapseAllSubtopics = () => {
    setExpandedSubtopics({});
  };

  // Helper to categorize lesson deck type cleanly
  const getDeckCategoryInfo = (deckTitle: string) => {
    const t = (deckTitle || '').toLowerCase();
    if (t.includes('practical') || t.includes('experiment') || t.includes('investigat') || t.includes('testing') || t.includes('method')) {
      return { 
        label: 'Practical', 
        badge: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
        icon: '🔬'
      };
    }
    if (t.includes('calculation') || t.includes('formula') || t.includes('math') || t.includes('magnif') || t.includes('rate') || t.includes('stoichio')) {
      return { 
        label: 'Calculations', 
        badge: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
        icon: '🔢'
      };
    }
    if (t.includes('planning') || t.includes('design') || t.includes('evaluation')) {
      return { 
        label: 'Planning', 
        badge: 'bg-purple-500/15 text-purple-400 border border-purple-500/30',
        icon: '📋'
      };
    }
    return { 
      label: 'Theory', 
      badge: 'bg-slate-700/50 text-slate-300 border border-slate-600/40',
      icon: '📖'
    };
  };

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
  const [quizTimerSeconds, setQuizTimerSeconds] = useState<number>(0);
  const [quizReviewFilter, setQuizReviewFilter] = useState<'all' | 'incorrect' | 'correct'>('all');

  // Quiz active timer
  useEffect(() => {
    let interval: any = null;
    if (isQuizModalOpen && !quizCompleted) {
      interval = setInterval(() => {
        setQuizTimerSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isQuizModalOpen, quizCompleted]);

  const formatQuizTimer = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getCambridgeGrade = (pct: number) => {
    if (pct >= 90) return { grade: 'A*', label: 'Grade A* (Outstanding)', color: 'text-amber-400 bg-amber-500/15 border-amber-500/40' };
    if (pct >= 80) return { grade: 'A', label: 'Grade A (Mastery Certified)', color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/40' };
    if (pct >= 70) return { grade: 'B', label: 'Grade B (Proficient)', color: 'text-teal-400 bg-teal-500/15 border-teal-500/40' };
    if (pct >= 60) return { grade: 'C', label: 'Grade C (Standard Pass)', color: 'text-sky-400 bg-sky-500/15 border-sky-500/40' };
    if (pct >= 50) return { grade: 'D', label: 'Grade D (Developing)', color: 'text-amber-400 bg-amber-500/15 border-amber-500/40' };
    if (pct >= 40) return { grade: 'E', label: 'Grade E (Basic Foundation)', color: 'text-orange-400 bg-orange-500/15 border-orange-500/40' };
    return { grade: 'U', label: 'Grade U (Needs Revision)', color: 'text-rose-400 bg-rose-500/15 border-rose-500/40' };
  };

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

  // ==========================================================================
  // MODULE 2: ANTI-EXPLOIT SLIDE REVISION STATE & GATES (60s dwell & entire deck clicked)
  // ==========================================================================
  const [nextSlideCountdown, setNextSlideCountdown] = useState<number>(5);
  const [deckDwellSeconds, setDeckDwellSeconds] = useState<number>(0);
  const [isModuleClaimed, setIsModuleClaimed] = useState<boolean>(false);
  const [claimLoading, setClaimLoading] = useState<boolean>(false);
  const [claimFeedback, setClaimFeedback] = useState<{ message: string; isError?: boolean; rewards?: any } | null>(null);

  // Track all unique slide indices visited by the student in the current deck
  const [visitedSlideIndices, setVisitedSlideIndices] = useState<Set<number>>(() => new Set([0]));

  // Reset visited slides when changing subtopic or slide deck
  useEffect(() => {
    setVisitedSlideIndices(new Set([0]));
  }, [selectedSubtopicCode, activeDeckIndex]);

  // Record active slide index into visited set
  useEffect(() => {
    setVisitedSlideIndices(prev => {
      const next = new Set(prev);
      next.add(activeSlideIndex);
      return next;
    });
  }, [activeSlideIndex]);

  // Derived gate metrics (updated further below once Drive slide mode is evaluated)
  const totalDeckSlidesCount = currentDeck?.slides?.length || 1;
  const hasClickedThroughAllSlidesInteractive = visitedSlideIndices.size >= totalDeckSlidesCount;
  const isDwellOneMinuteReached = deckDwellSeconds >= 60;

  // 1. Dwell-Time Lock: Lock "Next" button with 5-second countdown on every slide change
  useEffect(() => {
    setNextSlideCountdown(5);
    const timer = setInterval(() => {
      setNextSlideCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeSlideIndex, activeDeckIndex, selectedSubtopicCode]);

  // 2. Track total dwell time spent reading slides across active subtopic deck
  useEffect(() => {
    setDeckDwellSeconds(0);
    const interval = setInterval(() => {
      setDeckDwellSeconds(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedSubtopicCode, activeDeckIndex]);

  // Check if current module has already been claimed in Firestore
  useEffect(() => {
    const currentUid = auth.currentUser?.uid || user?.id;
    if (!currentUid || !selectedSubtopicCode) {
      setIsModuleClaimed(false);
      return;
    }
    checkModuleClaimed(currentUid, selectedSubtopicCode).then(claimed => {
      setIsModuleClaimed(claimed);
    });
  }, [selectedSubtopicCode, user?.id]);

  const handleClaimRevisionRewards = async () => {
    const currentUid = auth.currentUser?.uid || user?.id;
    if (!currentUid || claimLoading) return;

    const hasAllSlides = hasMatchingDriveSlide
      ? isCurrentSubtopicAllSlidesRead
      : hasClickedThroughAllSlidesInteractive;

    if (!isDwellOneMinuteReached || !hasAllSlides) {
      setClaimFeedback({
        message: `Requirements not met: You must spend at least 1 minute (60s) studying and complete all slides (${currentSubtopicReadCount}/${currentSubtopicTotalSlides} slides read, dwell ${deckDwellSeconds}s/60s).`,
        isError: true
      });
      return;
    }

    setClaimLoading(true);
    setClaimFeedback(null);

    const slideCount = currentDeck?.slides?.length || 5;
    try {
      const res = await claimModuleRevisionReward(
        currentUid,
        currentSubtopic.subtopicCode,
        slideCount,
        deckDwellSeconds
      );

      if (res.success) {
        setIsModuleClaimed(true);
        setClaimFeedback({ message: res.message, rewards: res.rewards });
      } else {
        setClaimFeedback({ message: res.message, isError: true });
      }
    } catch (e: any) {
      setClaimFeedback({ message: e?.message || 'Failed to claim rewards.', isError: true });
    } finally {
      setClaimLoading(false);
    }
  };

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

  // Real-time Firestore sync of teacher's linked Google Drive slide decks across all students
  useEffect(() => {
    const unsub = subscribeToCurriculumSlides((data) => {
      if (data.overrides && Object.keys(data.overrides).length > 0) {
        setManualOverrides(prev => ({ ...prev, ...data.overrides }));
      }
      if (Array.isArray(data.syncedSlides) && data.syncedSlides.length > 0) {
        setSyncedSlides(data.syncedSlides);
      }
    });
    return () => unsub();
  }, []);

  // If instructor has local cached slides, auto-publish them to Firestore so all students can view them
  useEffect(() => {
    if (isInstructor) {
      const cached = getCachedDriveSlides();
      const localOverrides = getManualSlideOverrides();
      if (cached.length > 0) {
        saveSharedSyncedDriveSlides(cached, user?.email).catch(() => {});
      }
      if (Object.keys(localOverrides).length > 0) {
        Object.entries(localOverrides).forEach(([code, val]) => {
          saveSharedSlideOverride(code, val, user?.email).catch(() => {});
        });
      }
    }
  }, [isInstructor, user?.email]);

  // Find exact unaltered drive slides for currentSubtopic across all Biology, Chemistry, and Physics topics
  const driveSlidesForCurrentSubtopic = useMemo(() => {
    if (!currentSubtopic) return [];
    const list: Array<{ id: string; name: string; embedUrl: string; directUrl: string; source: 'drive' | 'manual' }> = [];
    const targetCode = currentSubtopic.subtopicCode.toUpperCase(); // e.g. "B9.2", "C2.3", "P1.5.1"
    
    // 1. Check manual override for this subtopic code (case-insensitive check)
    const override = manualOverrides[currentSubtopic.subtopicCode] || manualOverrides[targetCode];
    if (override) {
      list.push({
        id: override.presentationId,
        name: override.title || `${currentSubtopic.subtopicCode} Google Slides Presentation`,
        embedUrl: override.embedUrl,
        directUrl: override.directUrl,
        source: 'manual'
      });
    }

    // 2. Check if subtopic data has a linked Google Slides presentation
    if (currentSubtopic.googleSlidesEmbedUrl || currentSubtopic.googleSlidesUrl) {
      const parsed = formatGoogleSlidesUrl(currentSubtopic.googleSlidesEmbedUrl || currentSubtopic.googleSlidesUrl || '');
      if (parsed.isValid && !list.some(item => item.embedUrl === parsed.embedUrl)) {
        list.push({
          id: `syllabus-slide-${currentSubtopic.subtopicCode}`,
          name: `${currentSubtopic.subtopicCode} - ${currentSubtopic.title} (Teacher Slide Deck)`,
          embedUrl: parsed.embedUrl,
          directUrl: parsed.directUrl,
          source: 'manual'
        });
      }
    }

    // 3. Check synced slides from Drive folder
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

  // Persistent cumulative slide reading progress for current subtopic (across all decks or Drive parts)
  const currentSubtopicSavedSlides: SubtopicSlideProgress | undefined = useMemo(() => {
    if (!currentSubtopic) return undefined;
    return slidesReadBySubtopic[currentSubtopic.subtopicCode] ||
      slidesReadBySubtopic[currentSubtopic.subtopicCode.toUpperCase()];
  }, [slidesReadBySubtopic, currentSubtopic]);

  const totalInteractiveSlidesForSubtopic = useMemo(() => {
    if (!currentSubtopic?.decks?.length) return 1;
    return Math.max(1, currentSubtopic.decks.reduce((acc, d) => acc + (d.slides?.length || 0), 0));
  }, [currentSubtopic]);

  const currentSubtopicTotalSlides = hasMatchingDriveSlide
    ? Math.max(1, driveSlidesForCurrentSubtopic.length)
    : totalInteractiveSlidesForSubtopic;

  const isCurrentSubtopicAllSlidesRead = useMemo(() => {
    if (!currentSubtopicSavedSlides) return false;
    if (currentSubtopicSavedSlides.allSlidesRead) return true;
    const keys = currentSubtopicSavedSlides.visitedKeys || [];
    if (hasMatchingDriveSlide) {
      const partKeys = keys.filter(k => k.startsWith('drive-part-'));
      return partKeys.length >= currentSubtopicTotalSlides && keys.includes('drive-confirmed');
    }
    const interactiveKeys = keys.filter(k => k.startsWith('d'));
    return interactiveKeys.length >= currentSubtopicTotalSlides;
  }, [currentSubtopicSavedSlides, hasMatchingDriveSlide, currentSubtopicTotalSlides]);

  const currentSubtopicReadCount = useMemo(() => {
    const keys = currentSubtopicSavedSlides?.visitedKeys || [];
    if (hasMatchingDriveSlide) {
      return Math.min(currentSubtopicTotalSlides, keys.filter(k => k.startsWith('drive-part-')).length);
    }
    return Math.min(currentSubtopicTotalSlides, keys.filter(k => k.startsWith('d')).length);
  }, [currentSubtopicSavedSlides, hasMatchingDriveSlide, currentSubtopicTotalSlides]);

  const hasClickedThroughAllSlides = hasMatchingDriveSlide
    ? isCurrentSubtopicAllSlidesRead
    : hasClickedThroughAllSlidesInteractive;
  const canClaimRevisionRewards = isDwellOneMinuteReached && hasClickedThroughAllSlides && !isModuleClaimed && !claimLoading;

  // Persist current slide or Drive part view into slidesReadBySubtopic
  useEffect(() => {
    if (!currentSubtopic || !onUpdateSlidesRead) return;
    const code = currentSubtopic.subtopicCode;
    const existing = slidesReadBySubtopic[code] || slidesReadBySubtopic[code.toUpperCase()];
    const existingKeys = new Set(existing?.visitedKeys || []);

    if (hasMatchingDriveSlide) {
      const key = `drive-part-${activeDriveSlideIdx}`;
      const hadKey = existingKeys.has(key);
      if (hadKey && existing?.totalSlides === currentSubtopicTotalSlides) return;
      existingKeys.add(key);
      const nextKeys = Array.from(existingKeys);
      const partCount = nextKeys.filter(k => k.startsWith('drive-part-')).length;
      const allRead = existing?.allSlidesRead === true || (partCount >= currentSubtopicTotalSlides && existingKeys.has('drive-confirmed'));
      onUpdateSlidesRead(code, {
        visitedKeys: nextKeys,
        totalSlides: currentSubtopicTotalSlides,
        allSlidesRead: allRead,
        updatedAt: new Date().toISOString()
      });
    } else if (currentDeck && currentDeck.slides && currentDeck.slides[activeSlideIndex]) {
      const key = `d${activeDeckIndex}-s${activeSlideIndex}`;
      const hadKey = existingKeys.has(key);
      existingKeys.add(key);
      const nextKeys = Array.from(existingKeys);
      const interactiveCount = nextKeys.filter(k => k.startsWith('d')).length;
      const allRead = existing?.allSlidesRead === true || interactiveCount >= currentSubtopicTotalSlides;
      if (hadKey && existing?.totalSlides === currentSubtopicTotalSlides && existing?.allSlidesRead === allRead) return;
      onUpdateSlidesRead(code, {
        visitedKeys: nextKeys,
        totalSlides: currentSubtopicTotalSlides,
        allSlidesRead: allRead,
        updatedAt: new Date().toISOString()
      });
    }
  }, [
    currentSubtopic?.subtopicCode,
    hasMatchingDriveSlide,
    activeDriveSlideIdx,
    activeDeckIndex,
    activeSlideIndex,
    currentSubtopicTotalSlides
  ]);

  const handleConfirmDriveSlidesRead = () => {
    if (!currentSubtopic || !onUpdateSlidesRead) return;
    const code = currentSubtopic.subtopicCode;
    const existing = slidesReadBySubtopic[code] || slidesReadBySubtopic[code.toUpperCase()];
    const existingKeys = new Set(existing?.visitedKeys || []);
    existingKeys.add(`drive-part-${activeDriveSlideIdx}`);
    existingKeys.add('drive-confirmed');
    const nextKeys = Array.from(existingKeys);
    const partCount = nextKeys.filter(k => k.startsWith('drive-part-')).length;
    const allRead = partCount >= currentSubtopicTotalSlides;
    onUpdateSlidesRead(code, {
      visitedKeys: nextKeys,
      totalSlides: currentSubtopicTotalSlides,
      allSlidesRead: allRead,
      updatedAt: new Date().toISOString()
    });
    if (allRead && !completedLessons.includes(code)) {
      onToggleCompleteLesson(code);
    }
  };

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
        token = await signInWithDriveScope();
      }
      if (!token) {
        setDriveSyncMessage('Google Drive permissions required to organize folders. Click "Grant Drive Access" below to authenticate.');
        setIsOrganizingDrive(false);
        return;
      }
      setDriveSyncMessage('Scanning lesson drive, detecting subtopic codes (e.g. P1.5.1, C9.5), and placing files into corresponding subfolders...');
      const result = await organizeDriveLessonsIntoSubfolders(token, TARGET_DRIVE_FOLDER_ID);
      const organizedPresentations = result.presentations || [];
      setSyncedSlides(organizedPresentations);
      if (organizedPresentations.length > 0) {
        await saveSharedSyncedDriveSlides(organizedPresentations, user?.email);
      }
      setDriveSyncMessage(result.message);
    } catch (err: any) {
      if (err?.isInsufficientScope || err?.message?.includes('insufficient') || err?.message?.includes('403') || err?.message?.includes('401')) {
        console.warn('Google Drive permission notice:', err?.message);
        clearCachedDriveToken();
        setDriveSyncMessage(`Drive Permissions Notice: ${err?.message || 'Google Drive permissions required. Please re-authenticate to grant access.'}`);
      } else {
        console.error('Failed to organize drive lessons:', err);
        setDriveSyncMessage(`Error organizing lessons: ${err?.message || 'Check folder access or Google sign-in.'}`);
      }
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
        token = await signInWithDriveScope();
      }
      if (!token) {
        setDriveSyncMessage('Google Drive permissions required to replace lessons. Click "Grant Drive Access" below to authenticate.');
        setIsSyncingDrive(false);
        return;
      }
      setDriveSyncMessage('Replacing all stored lessons and re-syncing from Drive...');
      const freshSlides = await replaceAllSyncedLessons(token, TARGET_DRIVE_FOLDER_ID);
      setSyncedSlides(freshSlides);
      if (freshSlides.length > 0) {
        await saveSharedSyncedDriveSlides(freshSlides, user?.email);
      }
      setDriveSyncMessage(`Replaced all lessons. Successfully re-synced ${freshSlides.length} Google Slides presentations and published to all students!`);
    } catch (err: any) {
      if (err?.isInsufficientScope || err?.message?.includes('insufficient') || err?.message?.includes('403') || err?.message?.includes('401')) {
        console.warn('Google Drive permission notice:', err?.message);
        clearCachedDriveToken();
        setDriveSyncMessage(`Drive Permissions Notice: ${err?.message || 'Google Drive permissions required. Please re-authenticate to grant access.'}`);
      } else {
        console.error('Failed to replace lessons:', err);
        setDriveSyncMessage(`Error replacing lessons: ${err?.message || 'Check folder access or Google sign-in.'}`);
      }
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
        token = await signInWithDriveScope();
      }
      if (!token) {
        setDriveSyncMessage('Google Drive permissions required to sync presentations. Click "Grant Drive Access" below to authenticate.');
        setIsSyncingDrive(false);
        return;
      }
      const result = await fetchAllDriveFolderFiles(token, TARGET_DRIVE_FOLDER_ID);
      const fetchedSlides = result.presentations || [];
      if (fetchedSlides.length > 0) {
        localStorage.setItem(DRIVE_STORAGE_KEY, JSON.stringify(fetchedSlides));
        setSyncedSlides(fetchedSlides);
        await saveSharedSyncedDriveSlides(fetchedSlides, user?.email);
        setDriveSyncMessage(`Successfully fetched & published ${fetchedSlides.length} slide decks from Drive folder to all students!`);
      } else {
        setDriveSyncMessage('Connected to folder 1kypXZXP3nY9pFxuSJOTZ1anODYxxfZ1a. (0 matching slide decks found yet)');
      }
    } catch (err: any) {
      console.error('Drive sync failed:', err);
      if (err?.message?.includes('401') || err?.isInsufficientScope || err?.message?.includes('insufficient')) {
        clearCachedDriveToken();
      }
      const msg = err?.message || 'Check folder access or Google sign-in.';
      setDriveSyncMessage(`Drive sync: ${msg}`);
    } finally {
      setIsSyncingDrive(false);
    }
  };

  const handleSaveManualSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInputUrl.trim() || !currentSubtopic) return;
    const ok = saveManualSlideOverride(currentSubtopic.subtopicCode, manualInputUrl.trim(), `${currentSubtopic.subtopicCode} - ${currentSubtopic.title}`, user?.email);
    if (ok) {
      const overrides = getManualSlideOverrides();
      setManualOverrides(overrides);
      const updated = overrides[currentSubtopic.subtopicCode] || overrides[currentSubtopic.subtopicCode.toUpperCase()];
      if (updated) {
        await saveSharedSlideOverride(currentSubtopic.subtopicCode, updated, user?.email);
      }
      setManualInputUrl('');
      setShowManualInput(false);
      setDriveSyncMessage(`✅ Embedded & published presentation for [${currentSubtopic.subtopicCode}] to all students!`);
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
  // Note: Self-rating Red/Amber does NOT mark slides read or complete tasks — students must read all slides & finish the Traffic Light Quiz.
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

  // Subtopic quiz attempt tracker to ensure non-repeating fresh questions on consecutive attempts
  const [subtopicAttemptCounts, setSubtopicAttemptCounts] = useState<Record<string, number>>({});

  // Launch subtopic quiz with guaranteed fresh questions
  const startQuizForSubtopic = (code: string, isRetake: boolean = false) => {
    const nextAttempt = (subtopicAttemptCounts[code] || 0) + (isRetake ? 1 : 1);
    setSubtopicAttemptCounts(prev => ({ ...prev, [code]: nextAttempt }));
    const questions = getQuizForSubtopic(code, { attemptNumber: nextAttempt, resetHistory: isRetake });
    setQuizSubtopicCode(code);
    setQuizQuestions(questions);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setSubmittedAnswers({});
    setQuizCompleted(false);
    setQuizScore(0);
    setQuizTimerSeconds(0);
    setQuizReviewFilter('all');
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
    const percentage = Math.round((score / Math.max(1, quizQuestions.length)) * 100);
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

    // 80%+ = Green, 50%, 60%, 70% = Amber/Orange, <= 40% (<50%) = Red
    const trafficStatus: TrafficLightStatus = percentage >= 80 ? 'green' : percentage >= 50 ? 'orange' : 'red';
    onUpdateTrafficLight(quizSubtopicCode, trafficStatus);

    // Automatically mark the slide deck completed ONLY when all slides in this subtopic have been genuinely read
    if (isCurrentSubtopicAllSlidesRead && !completedLessons.includes(quizSubtopicCode)) {
      onToggleCompleteLesson(quizSubtopicCode);
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
      const nextIdx = activeSlideIndex + 1;
      setActiveSlideIndex(nextIdx);
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
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-12 font-sans text-slate-800">
      {/* Header & Subject Filter Strip */}
      <div className="rounded-xl border border-slate-200 p-6 transition bg-white shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#EBF3F5] text-slate-800 border border-slate-300">
                Cambridge 0653
              </span>
              <span className="text-xs font-semibold text-slate-600">
                {subjectCounts.total} Syllabus Units
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800">
              Syllabus Library and Lesson Slides
            </h1>
            <p className="text-base text-slate-600 max-w-2xl">
              Curated Cambridge IGCSE Combined Science slide presentations, syllabus objectives, and 10-question mastery checks.
            </p>
          </div>

          {/* Google Drive Folder Sync & Direct Folder Link - INSTRUCTOR ONLY */}
          {isInstructor ? (
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 shrink-0 self-start lg:self-center">
              <button
                onClick={handleOrganizeDriveLessons}
                disabled={isOrganizingDrive || isSyncingDrive}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition bg-white text-slate-800 border border-slate-300 hover:bg-slate-100 cursor-pointer"
                title="Sort Drive files into subfolders"
              >
                <FolderSync className={`w-3.5 h-3.5 ${isOrganizingDrive ? 'animate-spin' : ''}`} />
                <span>{isOrganizingDrive ? 'Sorting...' : 'Sort Subfolders'}</span>
              </button>

              <button
                onClick={handleReplaceAllLessons}
                disabled={isSyncingDrive || isOrganizingDrive}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition bg-slate-800 text-white hover:bg-slate-700 cursor-pointer"
                title="Re-sync from Drive"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isSyncingDrive ? 'animate-spin' : ''}`} />
                <span>Sync Lessons</span>
              </button>

              <a
                href={TARGET_DRIVE_FOLDER_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
              >
                <span>Drive Folder</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#EBF3F5] text-slate-800 border border-slate-300 text-xs font-bold self-start lg:self-center">
              <CheckCircle className="w-4 h-4 text-emerald-700" />
              <span>Score ≥80% for Green Status</span>
            </div>
          )}
        </div>

        {/* Sync message if present (Instructor only) */}
        {isInstructor && driveSyncMessage && (
          <div className="mt-3 text-xs px-4 py-2.5 rounded-lg bg-[#FDFBF7] border border-slate-300 text-slate-800 flex flex-wrap items-center justify-between gap-2">
            <span className="flex-1 min-w-[240px] leading-relaxed">{driveSyncMessage}</span>
            <div className="flex items-center gap-2">
              {(driveSyncMessage.includes('insufficient') || 
                driveSyncMessage.includes('Permissions Notice') || 
                driveSyncMessage.includes('re-authenticate') || 
                driveSyncMessage.includes('permissions required') ||
                driveSyncMessage.includes('Grant Drive Access')) && (
                <button
                  type="button"
                  onClick={async () => {
                    setDriveSyncMessage('Opening Google authorization popup with Drive permissions...');
                    try {
                      clearCachedDriveToken();
                      const tok = await signInWithDriveScope();
                      if (tok) {
                        setDriveSyncMessage('Drive permission granted! Syncing presentations now...');
                        const res = await replaceAllSyncedLessons(tok, TARGET_DRIVE_FOLDER_ID);
                        setSyncedSlides(res);
                        setDriveSyncMessage(`Drive connected! Successfully synced ${res.length} Google Slides presentations.`);
                      } else {
                        setDriveSyncMessage('Drive authorization was cancelled or closed.');
                      }
                    } catch (e: any) {
                      setDriveSyncMessage(`Authorization error: ${e?.message || 'Failed to authorize Drive'}`);
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>Grant Drive Access</span>
                </button>
              )}
              <button 
                onClick={() => setDriveSyncMessage(null)} 
                className="text-slate-500 hover:text-slate-800 p-1 rounded-md"
                title="Dismiss notice"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* 3 Science Subject Selector Bar */}
        <div className="mt-5 pt-4 border-t border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveSubjectTab('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer select-none border ${
                activeSubjectTab === 'all'
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              All Units ({subjectCounts.total})
            </button>

            <button
              onClick={() => setActiveSubjectTab('biology')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer select-none border ${
                activeSubjectTab === 'biology'
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              <span>Biology ({subjectCounts.biology})</span>
            </button>

            <button
              onClick={() => setActiveSubjectTab('chemistry')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer select-none border ${
                activeSubjectTab === 'chemistry'
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              <span>Chemistry ({subjectCounts.chemistry})</span>
            </button>

            <button
              onClick={() => setActiveSubjectTab('physics')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer select-none border ${
                activeSubjectTab === 'physics'
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-600"></span>
              <span>Physics ({subjectCounts.physics})</span>
            </button>
          </div>

          {/* Traffic Light Quick Filter Buttons */}
          <div className="flex items-center gap-1.5 p-1 rounded-lg border border-slate-300 bg-[#FDFBF7] text-xs">
            <span className="text-xs font-bold text-slate-600 px-1">Status:</span>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
                statusFilter === 'all' 
                  ? 'bg-slate-800 text-white' 
                  : 'text-slate-700 hover:bg-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('green')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
                statusFilter === 'green' 
                  ? 'bg-emerald-700 text-white' 
                  : 'text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Green ({currentSubjectTrafficCounts.green})</span>
            </button>
            <button
              onClick={() => setStatusFilter('orange')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
                statusFilter === 'orange' 
                  ? 'bg-amber-700 text-white' 
                  : 'text-amber-800 hover:bg-amber-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>Amber ({currentSubjectTrafficCounts.orange})</span>
            </button>
            <button
              onClick={() => setStatusFilter('red')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
                statusFilter === 'red' 
                  ? 'bg-rose-700 text-white' 
                  : 'text-rose-800 hover:bg-rose-100'
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
        {/* LEFT COLUMN: Subtopics Accordion/List (lg:col-span-4) - Collapsible via button */}
        {isSidebarExpanded && (
          <div className="lg:col-span-4 rounded-2xl border border-[#E2E8F0] bg-white p-4 space-y-3 max-h-[850px] overflow-y-auto shadow-xs">
            {/* Sidebar Header with Minimise Button and Expand/Collapse All */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-700" />
                <h2 className="font-bold text-sm text-slate-800">Subtopics</h2>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#EBF3F5] text-slate-700 border border-slate-300">
                  {filteredSubtopics.length}
                </span>
              </div>
              
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    const anyExpanded = filteredSubtopics.some(s => expandedSubtopics[s.subtopicCode]);
                    if (anyExpanded) {
                      handleCollapseAllSubtopics();
                    } else {
                      handleExpandAllSubtopics();
                    }
                  }}
                  className="text-xs font-bold px-2 py-1 rounded-lg transition border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 cursor-pointer"
                  title="Toggle expand or collapse all subtopic lessons"
                >
                  {filteredSubtopics.some(s => expandedSubtopics[s.subtopicCode]) ? 'Collapse all' : 'Expand all'}
                </button>

                <button
                  type="button"
                  onClick={() => setIsSidebarExpanded(false)}
                  className="p-1.5 rounded-lg transition border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 flex items-center gap-1 text-xs font-bold cursor-pointer"
                  title="Minimise sidebar to expand slides view"
                >
                  <PanelLeftClose className="w-4 h-4 text-slate-600" />
                  <span className="text-xs hidden sm:inline">Minimise</span>
                </button>
              </div>
            </div>

            {/* Simple list of Subtopics grouped by topic */}
            <div className="space-y-3">
              {groupedSubtopics.map(group => (
                <div key={group.topicCode} className="space-y-1">
                  {/* Clean Topic Header */}
                  <div className="px-2 py-1 rounded-md text-xs font-bold bg-[#FDFBF7] text-slate-700 border border-slate-200 flex items-center justify-between">
                    <span className="truncate">{group.topicCode}: {group.topicName}</span>
                    <span className="font-mono text-[10px] text-slate-500 shrink-0 ml-1">
                      {group.items.length} {group.items.length === 1 ? 'subtopic' : 'subtopics'}
                    </span>
                  </div>

                  {/* Clean Subtopics List */}
                  <div className="space-y-1">
                    {group.items.map(sub => {
                      const isSelected = sub.subtopicCode === selectedSubtopicCode;
                      const isExpanded = !!expandedSubtopics[sub.subtopicCode];
                      const light = trafficLights[sub.subtopicCode];
                      const subDecks = sub.decks || [];
                      const lessonCount = subDecks.length || 1;

                      return (
                        <div
                          key={sub.subtopicCode}
                          className={`rounded-xl border transition-all overflow-hidden ${
                            isSelected
                              ? 'border-2 border-black bg-[#EBF3F5] shadow-xs'
                              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-[#FDFBF7]'
                          }`}
                        >
                          {/* Subtopic Header Row: Code, Name, Traffic Light Status, Expand/Minimise Button */}
                          <div 
                            onClick={() => {
                              setSelectedSubtopicCode(sub.subtopicCode);
                              setActiveDeckIndex(0);
                              setActiveSlideIndex(0);
                              if (!isExpanded) {
                                toggleSubtopicExpanded(sub.subtopicCode);
                              }
                            }}
                            className="w-full text-left p-3 flex items-center justify-between gap-2.5 cursor-pointer select-none group"
                          >
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              {/* Subtopic Code */}
                              <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded-md shrink-0 transition ${
                                isSelected
                                  ? 'bg-slate-800 text-white'
                                  : 'bg-[#FDFBF7] text-slate-700 border border-slate-300'
                              }`}>
                                {sub.subtopicCode}
                              </span>

                              {/* Subtopic Name */}
                              <span className={`text-xs font-bold truncate ${
                                isSelected ? 'text-slate-900' : 'text-slate-800 group-hover:text-black'
                              }`}>
                                {sub.title}
                              </span>
                            </div>

                            {/* Right side: Traffic Light Status Dot + Expand/Minimise Toggle */}
                            <div className="shrink-0 flex items-center gap-2">
                              {/* Traffic Light Dot Indicator */}
                              {light === 'green' && (
                                <span 
                                  title="Mastered (Quiz ≥ 80%)" 
                                  className="w-2.5 h-2.5 rounded-full bg-emerald-600 shadow-xs"
                                />
                              )}
                              {light === 'orange' && (
                                <span 
                                  title="Needs some revision" 
                                  className="w-2.5 h-2.5 rounded-full bg-amber-500"
                                />
                              )}
                              {light === 'red' && (
                                <span 
                                  title="Needs revision" 
                                  className="w-2.5 h-2.5 rounded-full bg-rose-500"
                                />
                              )}
                              {!light && (
                                <span 
                                  title="Unranked knowledge" 
                                  className="w-2 h-2 rounded-full border border-slate-400"
                                />
                              )}

                              {/* Expand/Minimise Chevron Button */}
                              <button
                                type="button"
                                onClick={(e) => toggleSubtopicExpanded(sub.subtopicCode, e)}
                                className="p-1 rounded-md transition hover:bg-slate-200 text-slate-600 hover:text-black cursor-pointer"
                                title={isExpanded ? "Minimise lessons list" : `Expand ${lessonCount} categorised ${lessonCount === 1 ? 'lesson' : 'lessons'}`}
                              >
                                <div className="flex items-center gap-0.5">
                                  <span className="text-[10px] font-mono text-slate-500 mr-0.5">
                                    {lessonCount}
                                  </span>
                                  {isExpanded ? (
                                    <ChevronDown className="w-3.5 h-3.5 text-slate-600" />
                                  ) : (
                                    <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                                  )}
                                </div>
                              </button>
                            </div>
                          </div>

                          {/* Categorised Lessons List (Shown when student expands subtopic) */}
                          {isExpanded && (
                            <div className="px-2.5 pb-2.5 pt-1 space-y-1.5 border-t border-slate-200 bg-[#FDFBF7]">
                              <div className="flex items-center justify-between text-[10px] font-bold text-slate-600 uppercase tracking-wide px-1 pt-0.5">
                                <span>Categorised lessons ({subDecks.length})</span>
                                <span className="text-[10px] font-normal normal-case text-slate-500">Click to load</span>
                              </div>

                              <div className="space-y-1">
                                {subDecks.map((deck, deckIdx) => {
                                  const isDeckActive = isSelected && activeDeckIndex === deckIdx;
                                  const cat = getDeckCategoryInfo(deck.title);

                                  return (
                                    <button
                                      key={deck.id || deckIdx}
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedSubtopicCode(sub.subtopicCode);
                                        setActiveDeckIndex(deckIdx);
                                        setActiveSlideIndex(0);
                                      }}
                                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition flex items-center justify-between gap-2 border cursor-pointer ${
                                        isDeckActive
                                          ? 'bg-white border-2 border-black text-slate-900 font-bold shadow-2xs'
                                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                                      }`}
                                    >
                                      <div className="flex items-center gap-2 min-w-0">
                                        <span className="text-xs shrink-0">{cat.icon}</span>
                                        <div className="min-w-0">
                                          <p className="truncate text-xs leading-tight font-medium text-slate-800">
                                            {deck.title}
                                          </p>
                                        </div>
                                      </div>

                                      <div className="shrink-0 flex items-center gap-1.5">
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${cat.badge}`}>
                                          {cat.label}
                                        </span>
                                        <span className="text-xs font-mono text-slate-500">
                                          {deck.slides?.length || 0}s
                                        </span>
                                        {isDeckActive && (
                                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                                        )}
                                      </div>
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
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RIGHT COLUMN: Slide Presentation & Traffic Light Controls */}
        <div className={isSidebarExpanded ? 'lg:col-span-8 space-y-6' : 'lg:col-span-12 space-y-6'}>
          {/* ASSIGNED TASK CHECKLIST BANNER */}
          {activeTaskContext && (
            <div className="rounded-2xl border-2 border-black bg-[#EBF3F5] p-4 sm:p-5 space-y-3 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    Active Assigned Task Checklist
                  </span>
                  <h3 className="text-base font-bold text-slate-900">{activeTaskContext.title}</h3>
                </div>
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-slate-800 self-start sm:self-center">
                  Target: {activeTaskContext.targetSubtopics.join(', ')}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                  isCurrentSubtopicAllSlidesRead
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold'
                    : 'bg-white border-slate-300 text-slate-700'
                }`}>
                  <span>1. Read All Slides</span>
                  <span className="font-mono">
                    {isCurrentSubtopicAllSlidesRead ? '✓ Done' : `${currentSubtopicReadCount}/${currentSubtopicTotalSlides}`}
                  </span>
                </div>
                <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                  subtopicQuizScores[currentSubtopic.subtopicCode]
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold'
                    : 'bg-white border-slate-300 text-slate-700'
                }`}>
                  <span>2. Traffic Light Quiz</span>
                  <span className="font-mono">
                    {subtopicQuizScores[currentSubtopic.subtopicCode]
                      ? `✓ ${subtopicQuizScores[currentSubtopic.subtopicCode].percentage}%`
                      : 'Pending'}
                  </span>
                </div>
                {(activeTaskContext.type === 'both' || activeTaskContext.type === 'practice_quiz') && (
                  <div className="p-2.5 rounded-xl border bg-white border-slate-300 text-slate-800 flex items-center justify-between gap-2">
                    <span className="font-semibold">3. Practice Quiz ({activeTaskContext.requiredQuizLength} Qs)</span>
                    {onNavigateToTaskQuiz && (
                      <button
                        type="button"
                        onClick={onNavigateToTaskQuiz}
                        className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-900 text-white text-[11px] font-bold cursor-pointer shrink-0"
                      >
                        Open Quiz
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Unit Spotlight Header & Rating */}
          <div className="rounded-2xl border border-[#E2E8F0] p-6 sm:p-7 transition bg-white shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5 border-b pb-5 mb-5 border-slate-200">
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-slate-800 bg-[#EBF3F5] border border-slate-300 px-2.5 py-0.5 rounded-full">
                    Unit Spotlight · {currentSubtopic.subtopicCode}
                  </span>
                  <span className="text-xs font-medium text-slate-600 capitalize">
                    {currentSubtopic.subject} · {currentSubtopic.tier}
                  </span>
                  <span className="text-xs text-slate-500">
                    • {currentLessonCount} {currentLessonCount === 1 ? 'lesson' : 'lessons'}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800 leading-tight">
                  {currentSubtopic.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600">
                  Cambridge International Examinations · {currentSubtopic.topicCode}: {currentSubtopic.topicName}
                </p>
              </div>

              {/* Sidebar Minimise / Expand Button */}
              <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                <button
                  type="button"
                  onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
                  className="p-2 rounded-lg border border-slate-300 hover:bg-slate-100 transition text-slate-700 cursor-pointer"
                  title={isSidebarExpanded ? "Minimise sidebar" : "Show sidebar"}
                >
                  {isSidebarExpanded ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* TRAFFIC LIGHT CONTROLS: Red, Amber, Green */}
            <div className="p-4 rounded-xl border border-slate-200 bg-[#FDFBF7] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wide text-slate-700">
                    Traffic Light Mastery Assessment
                  </span>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Self-rate your confidence. Achieving <strong className="text-emerald-700 font-bold">Green</strong> requires scoring ≥80% on the official 10-question check.
                  </p>
                </div>

                {subtopicQuizScores[currentSubtopic.subtopicCode] && (
                  <div className="text-right font-mono text-xs">
                    <span className="text-slate-600">Latest check: </span>
                    <span className={`font-bold ${
                      subtopicQuizScores[currentSubtopic.subtopicCode].passed ? 'text-emerald-700' : 'text-amber-700'
                    }`}>
                      {subtopicQuizScores[currentSubtopic.subtopicCode].score}/{subtopicQuizScores[currentSubtopic.subtopicCode].total || 10} ({subtopicQuizScores[currentSubtopic.subtopicCode].percentage}%)
                    </span>
                  </div>
                )}
              </div>

              {/* 3 Traffic Light Action Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                {/* RED BUTTON */}
                <button
                  onClick={() => handleTrafficLightSelect(currentSubtopic.subtopicCode, 'red')}
                  className={`p-3.5 rounded-xl border text-left transition flex items-center gap-3 cursor-pointer ${
                    trafficLights[currentSubtopic.subtopicCode] === 'red'
                      ? 'bg-rose-50 border-2 border-rose-600 text-rose-900 shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-800 hover:border-slate-400'
                  }`}
                >
                  <div className="w-5 h-5 rounded-full bg-rose-600 shrink-0 flex items-center justify-center text-white text-xs font-bold">
                    {trafficLights[currentSubtopic.subtopicCode] === 'red' ? '✓' : ''}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-rose-800 uppercase font-mono">Red (≤40%)</div>
                    <div className="text-xs text-slate-600 leading-tight">Needs revision & notes</div>
                  </div>
                </button>

                {/* ORANGE BUTTON */}
                <button
                  onClick={() => handleTrafficLightSelect(currentSubtopic.subtopicCode, 'orange')}
                  className={`p-3.5 rounded-xl border text-left transition flex items-center gap-3 cursor-pointer ${
                    trafficLights[currentSubtopic.subtopicCode] === 'orange'
                      ? 'bg-amber-50 border-2 border-amber-600 text-amber-900 shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-800 hover:border-slate-400'
                  }`}
                >
                  <div className="w-5 h-5 rounded-full bg-amber-600 shrink-0 flex items-center justify-center text-white text-xs font-bold">
                    {trafficLights[currentSubtopic.subtopicCode] === 'orange' ? '✓' : ''}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-amber-800 uppercase font-mono">Amber (50–70%)</div>
                    <div className="text-xs text-slate-600 leading-tight">Solid working foundation</div>
                  </div>
                </button>

                {/* GREEN BUTTON (Trigger Quiz if <80%) */}
                <button
                  onClick={() => handleTrafficLightSelect(currentSubtopic.subtopicCode, 'green')}
                  className={`p-3.5 rounded-xl border text-left transition flex items-center gap-3 cursor-pointer ${
                    trafficLights[currentSubtopic.subtopicCode] === 'green'
                      ? 'bg-emerald-50 border-2 border-emerald-600 text-emerald-900 shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-800 hover:border-slate-400'
                  }`}
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-600 shrink-0 flex items-center justify-center text-white text-xs font-bold">
                    {trafficLights[currentSubtopic.subtopicCode] === 'green' ? '✓' : '★'}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-emerald-800 uppercase font-mono flex items-center gap-1">
                      <span>Green (≥80%)</span>
                      <Award className="w-3.5 h-3.5 text-emerald-700" />
                    </div>
                    <div className="text-xs text-slate-600 leading-tight">
                      {subtopicQuizScores[currentSubtopic.subtopicCode]?.passed
                        ? 'Mastered! Exam certified'
                        : 'Unlock via 10-Q Quiz'}
                    </div>
                  </div>
                </button>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-200">
                <button
                  onClick={() => onToggleCompleteLesson(currentSubtopic.subtopicCode)}
                  disabled={!isCurrentSubtopicAllSlidesRead && !completedLessons.includes(currentSubtopic.subtopicCode)}
                  title={
                    isCurrentSubtopicAllSlidesRead
                      ? 'All slides read — toggle lesson completion'
                      : `Read all ${currentSubtopicTotalSlides} slides first (${currentSubtopicReadCount}/${currentSubtopicTotalSlides} viewed)`
                  }
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
                    completedLessons.includes(currentSubtopic.subtopicCode)
                      ? 'bg-emerald-700 text-white font-bold cursor-pointer'
                      : isCurrentSubtopicAllSlidesRead
                        ? 'border border-slate-300 hover:bg-slate-100 text-slate-800 bg-white cursor-pointer'
                        : 'border border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {isCurrentSubtopicAllSlidesRead || completedLessons.includes(currentSubtopic.subtopicCode) ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <Lock className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {completedLessons.includes(currentSubtopic.subtopicCode)
                      ? '✓ All slides read & completed'
                      : isCurrentSubtopicAllSlidesRead
                        ? 'Mark lesson read (All slides viewed)'
                        : `Read all slides (${currentSubtopicReadCount}/${currentSubtopicTotalSlides})`}
                  </span>
                </button>

                <button
                  onClick={() => startQuizForSubtopic(currentSubtopic.subtopicCode)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>Take 10-question knowledge check</span>
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
            <div className="rounded-2xl border border-[#E2E8F0] transition shadow-xs overflow-hidden bg-white">
              {/* Slide Top Toolbar for Exact Unaltered Google Slide */}
              <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-[#FDFBF7]">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-[#EBF3F5] text-slate-800 border border-slate-300">
                    [{currentSubtopic.subtopicCode}] {currentSubtopic.title} · ({currentLessonCount} {currentLessonCount === 1 ? 'lesson' : 'lessons'})
                  </span>
                  {isInstructor ? (
                    <>
                      <span className="text-xs px-3 py-1 rounded-full bg-white text-slate-700 border border-slate-300 font-bold flex items-center gap-1.5">
                        <Cloud className="w-3.5 h-3.5 text-blue-600" />
                        <span>Exact Drive Slide</span>
                      </span>
                      <span className="text-xs text-slate-600 font-medium truncate max-w-xs md:max-w-md" title={activeDriveSlide.name}>
                        {activeDriveSlide.name}
                      </span>
                    </>
                  ) : (
                    <span className="text-xs px-3 py-1 rounded-full bg-white text-slate-700 border border-slate-300 font-bold flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Cambridge Slide Deck</span>
                    </span>
                  )}
                </div>

                {/* Toolbar controls */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* If multiple decks match this subtopic, deck switcher */}
                  {driveSlidesForCurrentSubtopic.length > 1 && (
                    <div className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-xl border border-slate-300">
                      <Layers className="w-3.5 h-3.5 text-slate-600" />
                      <span className="text-xs text-slate-700 font-bold">Deck:</span>
                      <select
                        value={activeDriveSlideIdx}
                        onChange={e => setActiveDriveSlideIdx(Number(e.target.value))}
                        className="text-xs px-2 py-0.5 rounded-lg border-none font-bold bg-transparent text-slate-800 focus:outline-none cursor-pointer"
                      >
                        {driveSlidesForCurrentSubtopic.map((d, i) => (
                          <option key={d.id} value={i} className="bg-white text-slate-800">
                            Lesson {i + 1}: {d.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Companion AI Notes Toggle */}
                  {currentDeck && (
                    <button
                      onClick={() => setShowAiNotesWithDrive(prev => !prev)}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                        showAiNotesWithDrive
                          ? 'bg-slate-800 text-white border-slate-800'
                          : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                      title="Toggle syllabus companion notes and practical risk assessment"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{showAiNotesWithDrive ? 'Hide notes' : 'Notes'}</span>
                    </button>
                  )}

                  <a
                    href={activeDriveSlide.directUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white transition shadow-2xs cursor-pointer"
                    title="Open full Google Slides presentation in a new tab"
                  >
                    <span>Open in Slides</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  {/* Instructor-only Set Slide URL button */}
                  {isInstructor && (
                    <button
                      onClick={() => setShowManualInput(prev => !prev)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                        showManualInput
                          ? 'bg-slate-800 text-white border-slate-800'
                          : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                      title="Instructor: Set custom slide URL or presentation ID"
                    >
                      <span>{showManualInput ? 'Close' : 'Set slide URL'}</span>
                    </button>
                  )}

                  <button
                    onClick={() => setIsFullScreen(prev => !prev)}
                    className="p-2 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 transition cursor-pointer text-xs"
                    title={isFullScreen ? "Exit Fullscreen" : "Fullscreen presentation"}
                  >
                    {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Manual URL Direct Embed Form (Instructor Only) */}
              {isInstructor && showManualInput && (
                <div className="p-4 border-b border-slate-200 bg-[#FDFBF7] space-y-3">
                  <form onSubmit={handleSaveManualSlide} className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={manualInputUrl}
                      onChange={e => setManualInputUrl(e.target.value)}
                      placeholder={`Paste Google Slides link or presentation ID for [${currentSubtopic.subtopicCode}]...`}
                      className="flex-1 px-3 py-2 rounded-xl text-xs border-2 border-black bg-[#FDFBF7] text-slate-800 placeholder-slate-500 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white shrink-0 transition cursor-pointer"
                    >
                      Save slide embed
                    </button>
                  </form>
                  <p className="text-xs text-slate-600">
                    Accepts any Google Slides URL or Presentation ID from your Drive folder.
                  </p>
                </div>
              )}

              {/* Large Lesson Deck Switcher (Drive Slides) */}
              {driveSlidesForCurrentSubtopic.length > 1 && (
                <div className="p-4 sm:p-5 border-b border-slate-200 bg-[#FDFBF7] space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-white text-slate-800 border border-slate-300 flex items-center justify-center font-bold shrink-0">
                        <Presentation className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wide flex items-center gap-2 text-slate-800">
                          <span>{isInstructor ? 'Switch Lesson Deck' : 'Select Lesson'}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EBF3F5] text-slate-700 border border-slate-300">
                            {driveSlidesForCurrentSubtopic.length} {driveSlidesForCurrentSubtopic.length === 1 ? 'part' : 'parts'}
                          </span>
                        </h4>
                      </div>
                    </div>
                    <div className="text-xs font-mono uppercase tracking-wider px-3 py-1 rounded-xl bg-white border border-slate-300 text-slate-700 self-start sm:self-auto">
                      Part {activeDriveSlideIdx + 1} of {driveSlidesForCurrentSubtopic.length}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
                    {driveSlidesForCurrentSubtopic.map((slideItem, idx) => {
                      const isCurrent = idx === activeDriveSlideIdx;
                      return (
                        <button
                          key={slideItem.id}
                          onClick={() => setActiveDriveSlideIdx(idx)}
                          className={`flex items-start gap-3 p-3 rounded-xl border text-left transition cursor-pointer ${
                            isCurrent
                              ? 'bg-[#EBF3F5] border-2 border-black text-slate-900 shadow-2xs font-bold'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center font-bold text-xs transition ${
                            isCurrent 
                              ? 'bg-slate-800 text-white'
                              : 'bg-[#FDFBF7] text-slate-700 border border-slate-300'
                          }`}>
                            0{idx + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1 mb-0.5">
                              <span className={`text-[10px] font-bold uppercase tracking-wider ${
                                isCurrent ? 'text-slate-900' : 'text-slate-500'
                              }`}>
                                Lesson {idx + 1}
                              </span>
                              {isCurrent && (
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                              )}
                            </div>
                            <p className="text-xs font-semibold line-clamp-2 leading-tight" title={slideItem.name}>
                              {slideItem.name}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Slide Content: Google Slides Iframe Embed */}
              <div className="p-3 sm:p-5 bg-[#FDFBF7] border-b border-slate-200">
                <div className="space-y-3">
                  <div className="relative w-full aspect-[16/9] min-h-[480px] sm:min-h-[580px] rounded-xl overflow-hidden bg-white shadow-xs border border-slate-300">
                    <iframe
                      src={activeDriveSlide.embedUrl}
                      title={activeDriveSlide.name}
                      className="w-full h-full border-0 absolute inset-0"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-slate-600 px-1 pt-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                      <span>Showing presentation from Google Drive: <strong className="text-slate-800">{activeDriveSlide.name}</strong></span>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      {isCurrentSubtopicAllSlidesRead ? (
                        <span className="px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-400 text-emerald-800 font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>All {currentSubtopicTotalSlides} Slide Deck{currentSubtopicTotalSlides > 1 ? 's' : ''} Confirmed Read</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleConfirmDriveSlidesRead}
                          disabled={deckDwellSeconds < 20 || currentSubtopicReadCount < currentSubtopicTotalSlides}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                            deckDwellSeconds >= 20 && currentSubtopicReadCount >= currentSubtopicTotalSlides
                              ? 'bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer shadow-xs'
                              : 'bg-slate-200 text-slate-500 border border-slate-300 cursor-not-allowed'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>
                            {currentSubtopicReadCount < currentSubtopicTotalSlides
                              ? `View all ${currentSubtopicTotalSlides} parts (${currentSubtopicReadCount}/${currentSubtopicTotalSlides})`
                              : deckDwellSeconds < 20
                                ? `Confirm All Slides Read (${Math.max(0, 20 - deckDwellSeconds)}s)`
                                : 'Confirm All Slides Read'}
                          </span>
                        </button>
                      )}
                      <a
                        href={TARGET_DRIVE_FOLDER_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-700 hover:text-black hover:underline flex items-center gap-1 font-bold"
                      >
                        <span>Drive Folder</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Optional AI Companion Notes under Drive Slide */}
              {showAiNotesWithDrive && currentDeck && (
                <div className="p-6 border-b border-slate-200 bg-white space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold flex items-center gap-2 text-slate-800">
                      <BookOpen className="w-4 h-4 text-emerald-700" />
                      <span>Cambridge 0653 AI Syllabus Notes & Practical Guidelines</span>
                    </h4>
                    <button
                      onClick={handleCopyNotes}
                      className="text-xs px-2.5 py-1 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 flex items-center gap-1 cursor-pointer font-bold"
                    >
                      {copiedNote ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedNote ? 'Copied' : 'Copy notes'}</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs leading-relaxed">
                    {currentDeck.slides.map((s, idx) => (
                      <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-[#FDFBF7] text-slate-800">
                        <div className="font-bold text-slate-800 mb-1">{s.title}</div>
                        <ul className="list-disc pl-4 space-y-1 text-slate-600">
                          {s.content.slice(0, 3).map((pt, pidx) => (
                            <li key={pidx}>{pt}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Revision Royale Dwell / Rewards Bar (1-minute dwell & all slides clicked requirement) */}
              <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#FDFBF7]">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-300 flex items-center justify-center text-amber-700 font-bold text-lg shrink-0">
                    🎮
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold uppercase tracking-wide text-amber-800">
                        Revision Royale Rewards
                      </span>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-white text-slate-700 border border-slate-300 font-mono" title="Dwell Time (1 min required)">
                        ⏱️ {Math.floor(deckDwellSeconds / 60)}:{(deckDwellSeconds % 60).toString().padStart(2, '0')} / 01:00
                      </span>
                      <span className={`text-xs px-1.5 py-0.5 rounded font-mono border ${
                        hasClickedThroughAllSlides 
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold' 
                          : 'bg-white text-slate-700 border-slate-300'
                      }`} title="Slides confirmed">
                        📑 Decks: {currentSubtopicReadCount} / {currentSubtopicTotalSlides}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {isModuleClaimed ? (
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5 inline text-emerald-700" /> Module completed! Complete topic quizzes for additional materials.
                        </span>
                      ) : !hasClickedThroughAllSlides && !isDwellOneMinuteReached ? (
                        <span>Requirement: Confirm all {currentSubtopicTotalSlides} slide deck{currentSubtopicTotalSlides > 1 ? 's' : ''} read & study for 1 minute ({Math.max(0, 60 - deckDwellSeconds)}s remaining).</span>
                      ) : !hasClickedThroughAllSlides ? (
                        <span className="text-amber-700 font-semibold">Almost there: Click &quot;Confirm All Slides Read&quot; above once you finish viewing the slides.</span>
                      ) : !isDwellOneMinuteReached ? (
                        <span>Dwell Gate: study for 1 minute ({Math.max(0, 60 - deckDwellSeconds)}s remaining) to unlock battle materials.</span>
                      ) : (
                        <span className="text-emerald-700 font-bold">All slides read & 1 minute dwell satisfied! Claim +20 Wood, +10 Brick, +5 Metal, +50 XP & +20 Gold.</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="w-full sm:w-auto flex items-center justify-end">
                  {isModuleClaimed ? (
                    <span className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-50 border border-emerald-300 text-emerald-800 flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4" /> Claimed
                    </span>
                  ) : (
                    <button
                      onClick={handleClaimRevisionRewards}
                      disabled={!canClaimRevisionRewards}
                      className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                        canClaimRevisionRewards
                          ? 'bg-slate-800 hover:bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed'
                      }`}
                    >
                      <Sparkles className="w-4 h-4" />
                      {claimLoading ? 'Verifying...' : 'Claim Revision Rewards'}
                    </button>
                  )}
                </div>
              </div>

              {claimFeedback && (
                <div className={`mx-4 mb-4 p-3 rounded-xl border text-xs font-medium flex items-center justify-between ${
                  claimFeedback.isError 
                    ? 'bg-rose-50 border-rose-300 text-rose-800' 
                    : 'bg-emerald-50 border-emerald-300 text-emerald-800'
                }`}>
                  <span>{claimFeedback.message}</span>
                  {claimFeedback.rewards && (
                    <span className="font-mono font-bold text-slate-800">
                      +{claimFeedback.rewards.wood}🪵 +{claimFeedback.rewards.brick}🧱 +{claimFeedback.rewards.metal}⚙️ +{claimFeedback.rewards.xp}XP +{claimFeedback.rewards.gold}🪙
                    </span>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* SUBTOPIC MISSING CORRESPONDING GOOGLE SLIDE FROM DRIVE: AI Generated Slide Deck */
            currentDeck && currentSlide && (
              <div className="rounded-2xl border border-[#E2E8F0] transition shadow-xs overflow-hidden bg-white">
                {/* Slide Top Toolbar with Header */}
                <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-[#FDFBF7]">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-[#EBF3F5] text-slate-800 border border-slate-300">
                      {currentSlide.subtopicHeader || `[${currentSubtopic.subtopicCode}] ${currentSubtopic.title}`} · ({currentLessonCount} {currentLessonCount === 1 ? 'lesson' : 'lessons'})
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-white text-slate-700 border border-slate-300 font-bold">
                      Interactive Deck
                    </span>
                    <span className="text-xs text-slate-600 font-mono">
                      Slide {activeSlideIndex + 1} of {currentDeck.slides.length}
                    </span>
                  </div>

                  {/* Toolbar controls */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => setShowManualInput(prev => !prev)}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-bold transition cursor-pointer ${
                        showManualInput
                          ? 'bg-slate-800 text-white border-slate-800'
                          : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                      title="Link or embed a direct Google Slides presentation for this subtopic"
                    >
                      <Cloud className="w-3.5 h-3.5 text-blue-600" />
                      <span>{showManualInput ? 'Close' : 'Set slide URL'}</span>
                    </button>

                    <button
                      onClick={handleCopyNotes}
                      title="Copy slide notes to clipboard and syllabus notebook"
                      className={`p-2 rounded-lg text-xs font-bold transition flex items-center gap-1 border border-slate-300 cursor-pointer ${
                        copiedNote
                          ? 'bg-emerald-700 text-white'
                          : 'bg-white hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      {copiedNote ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span className="hidden sm:inline">{copiedNote ? 'Copied' : 'Save notes'}</span>
                    </button>
                  </div>
                </div>

                {/* Manual URL Form */}
                {showManualInput && (
                  <div className="p-4 border-b border-slate-200 bg-[#FDFBF7] space-y-3">
                    <form onSubmit={handleSaveManualSlide} className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={manualInputUrl}
                        onChange={e => setManualInputUrl(e.target.value)}
                        placeholder={`Paste Google Slides link or presentation ID for [${currentSubtopic.subtopicCode}]...`}
                        className="flex-1 px-3 py-2 rounded-xl text-xs border-2 border-black bg-white text-slate-800 placeholder-slate-400 focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white shrink-0 transition cursor-pointer"
                      >
                        Embed direct slide
                      </button>
                    </form>
                    <p className="text-xs text-slate-600">
                      Paste any Google Slides URL or Presentation ID to replace this interactive deck.
                    </p>
                  </div>
                )}

                {/* Lesson Deck Switcher (AI Syllabus Decks) */}
                {currentSubtopic.decks.length > 1 && (
                  <div className="p-4 sm:p-5 border-b border-slate-200 bg-[#FDFBF7] space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-white text-slate-800 border border-slate-300 flex items-center justify-center font-bold shrink-0">
                          <Presentation className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold tracking-wide flex items-center gap-2 text-slate-800">
                            <span>Switch Lesson Deck</span>
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#EBF3F5] text-slate-800 border border-slate-300">
                              {currentSubtopic.decks.length} lessons available
                            </span>
                          </h4>
                          <p className="text-xs text-slate-600">
                            This subtopic has multiple lesson decks. Click any lesson below to view its slides:
                          </p>
                        </div>
                      </div>
                      <div className="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-white border border-slate-300 text-slate-700 self-start sm:self-auto">
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
                            className={`flex items-start gap-3.5 p-3.5 rounded-xl border text-left transition relative cursor-pointer ${
                              isCurrent
                                ? 'bg-[#EBF3F5] border-2 border-black text-slate-900 shadow-2xs font-bold'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                            }`}
                          >
                            <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center font-bold text-sm transition ${
                              isCurrent ? 'bg-slate-800 text-white' : 'bg-[#FDFBF7] text-slate-700 border border-slate-300'
                            }`}>
                              {idx + 1}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1 mb-1">
                                <span className={`text-xs font-bold uppercase tracking-wider ${
                                  isCurrent ? 'text-slate-900' : 'text-slate-500'
                                }`}>
                                  Lesson {idx + 1}
                                </span>
                                <span className="text-xs font-mono text-slate-500">
                                  {deck.slides.length} slides
                                </span>
                              </div>
                              <p className="text-xs font-bold line-clamp-2 leading-snug" title={deck.title}>
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
                <div className="p-6 sm:p-8 space-y-6 bg-white text-slate-800">
                  {/* Slide Title */}
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800">
                      {currentSlide.title}
                    </h3>
                    <div className="w-12 h-1 bg-slate-800 rounded-full mt-2"></div>
                  </div>

                  {/* Slide Content Bullet Points */}
                  <div className="space-y-3.5 leading-relaxed">
                    {currentSlide.content.map((point, idx) => (
                      <div 
                        key={idx} 
                        className="p-3.5 rounded-xl border border-slate-200 bg-[#FDFBF7] text-slate-800 text-base"
                      >
                        {point}
                      </div>
                    ))}
                  </div>

                  {/* Special Practical Box if present */}
                  {currentSlide.practicalInfo && (
                    <div className="p-4 rounded-xl border border-amber-300 bg-amber-50 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wide">
                        <Lightbulb className="w-4 h-4 text-amber-700" />
                        <span>Cambridge Required Practical Protocol & Risk Assessment</span>
                      </div>
                      <div className="text-xs space-y-2 text-slate-700">
                        <div><strong className="text-slate-900">Aim:</strong> {currentSlide.practicalInfo.aim}</div>
                        <div><strong className="text-slate-900">Equipment:</strong> {currentSlide.practicalInfo.equipment.join(', ')}</div>
                        <div>
                          <strong className="text-slate-900">Safety precaution:</strong> {currentSlide.practicalInfo.riskAssessment[0]?.hazard} - {currentSlide.practicalInfo.riskAssessment[0]?.precaution}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Keywords Cloud */}
                  {currentDeck.keywords && currentDeck.keywords.length > 0 && (
                    <div className="pt-2 border-t border-slate-200 flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-600">Syllabus keywords:</span>
                      {currentDeck.keywords.map(kw => (
                        <span 
                          key={kw} 
                          className="text-xs px-2 py-0.5 rounded-md font-mono font-medium bg-[#EBF3F5] text-slate-700 border border-slate-300"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Slide Bottom Navigation Bar */}
                <div className="p-4 border-t border-slate-200 flex items-center justify-between gap-4 bg-[#FDFBF7]">
                  <button
                    onClick={goToPreviousSlide}
                    disabled={activeSlideIndex === 0 && activeDeckIndex === 0}
                    className={`flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      activeSlideIndex === 0 && activeDeckIndex === 0
                        ? 'opacity-40 cursor-not-allowed border border-slate-200 bg-white text-slate-400'
                        : 'bg-white border-2 border-black hover:bg-slate-100 text-slate-800 shadow-2xs'
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous slide</span>
                  </button>

                  {/* Slide dots indicator */}
                  <div className="hidden sm:flex items-center gap-1.5 overflow-x-auto">
                    {currentDeck.slides.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveSlideIndex(idx)}
                        title={`Go to slide ${idx + 1}`}
                        className={`w-2.5 h-2.5 rounded-full transition cursor-pointer ${
                          idx === activeSlideIndex 
                            ? 'bg-slate-800 scale-125' 
                            : 'bg-slate-300 hover:bg-slate-400'
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={goToNextSlide}
                    disabled={(activeSlideIndex === currentDeck.slides.length - 1 && activeDeckIndex === currentSubtopic.decks.length - 1) || nextSlideCountdown > 0}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      activeSlideIndex === currentDeck.slides.length - 1 && activeDeckIndex === currentSubtopic.decks.length - 1
                        ? 'opacity-40 cursor-not-allowed bg-slate-200 text-slate-500 border border-slate-300'
                        : nextSlideCountdown > 0
                          ? 'bg-amber-100 text-amber-900 border border-amber-300 cursor-wait'
                          : 'bg-slate-800 hover:bg-slate-900 text-white shadow-xs'
                    }`}
                  >
                    {nextSlideCountdown > 0 ? (
                      <>
                        <Lock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                        <span>Next ({nextSlideCountdown}s)</span>
                      </>
                    ) : activeSlideIndex === currentDeck.slides.length - 1 && activeDeckIndex === currentSubtopic.decks.length - 1 ? (
                      <span>Deck finished</span>
                    ) : (
                      <>
                        <span>Next slide</span>
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                {/* Revision Royale Rewards Bar (1-minute dwell & all slides clicked requirement) */}
                <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#FDFBF7]">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-300 flex items-center justify-center text-amber-700 font-bold text-lg shrink-0">
                      🎮
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold uppercase tracking-wide text-amber-800">
                          Revision Royale Rewards
                        </span>
                        <span className="text-xs px-1.5 py-0.5 rounded bg-white text-slate-700 border border-slate-300 font-mono" title="Dwell Time (1 min required)">
                          ⏱️ {Math.floor(deckDwellSeconds / 60)}:{(deckDwellSeconds % 60).toString().padStart(2, '0')} / 01:00
                        </span>
                        <span className={`text-xs px-1.5 py-0.5 rounded font-mono border ${
                          hasClickedThroughAllSlides 
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold' 
                            : 'bg-white text-slate-700 border-slate-300'
                        }`} title="Slides viewed">
                          📑 Slides: {visitedSlideIndices.size} / {totalDeckSlidesCount}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {isModuleClaimed ? (
                          <span className="text-emerald-700 font-bold flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5 inline text-emerald-700" /> Module completed! Complete topic quizzes for additional materials.
                          </span>
                        ) : !hasClickedThroughAllSlides && !isDwellOneMinuteReached ? (
                          <span>Requirement: Click through all slides ({visitedSlideIndices.size}/{totalDeckSlidesCount}) & study for 1 minute ({Math.max(0, 60 - deckDwellSeconds)}s remaining).</span>
                        ) : !hasClickedThroughAllSlides ? (
                          <span className="text-amber-700 font-semibold">Almost there: Click through remaining slides ({visitedSlideIndices.size}/{totalDeckSlidesCount} viewed) to unlock rewards.</span>
                        ) : !isDwellOneMinuteReached ? (
                          <span>Dwell Gate: study for 1 minute ({Math.max(0, 60 - deckDwellSeconds)}s remaining) to unlock battle materials.</span>
                        ) : (
                          <span className="text-emerald-700 font-bold">All slides viewed & 1 minute dwell satisfied! Claim +20 Wood, +10 Brick, +5 Metal, +50 XP & +20 Gold.</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="w-full sm:w-auto flex items-center justify-end">
                    {isModuleClaimed ? (
                      <span className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-50 border border-emerald-300 text-emerald-800 flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4" /> Claimed
                      </span>
                    ) : (
                      <button
                        onClick={handleClaimRevisionRewards}
                        disabled={!canClaimRevisionRewards}
                        className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                          canClaimRevisionRewards
                            ? 'bg-slate-800 hover:bg-slate-900 text-white shadow-xs'
                            : 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed'
                        }`}
                      >
                        <Sparkles className="w-4 h-4" />
                        {claimLoading ? 'Verifying...' : 'Claim Revision Rewards'}
                      </button>
                    )}
                  </div>
                </div>

                {claimFeedback && (
                  <div className={`mx-4 mb-4 p-3 rounded-xl border text-xs font-medium flex items-center justify-between ${
                    claimFeedback.isError 
                      ? 'bg-rose-50 border-rose-300 text-rose-800' 
                      : 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  }`}>
                    <span>{claimFeedback.message}</span>
                    {claimFeedback.rewards && (
                      <span className="font-mono font-bold text-slate-800">
                        +{claimFeedback.rewards.wood}🪵 +{claimFeedback.rewards.brick}🧱 +{claimFeedback.rewards.metal}⚙️ +{claimFeedback.rewards.xp}XP +{claimFeedback.rewards.gold}🪙
                      </span>
                    )}
                  </div>
                )}
              </div>
            )
          )}

          {/* Syllabus Objectives Summary for this Subtopic */}
          {currentSubtopic.syllabusSummary && (
            <div className="rounded-2xl border border-[#E2E8F0] p-5 space-y-3 bg-white shadow-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <h4 className="font-bold text-xs uppercase tracking-wide text-slate-700">
                  Cambridge 0653 Syllabus Learning Outcomes:
                </h4>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-700 list-disc list-inside">
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="rounded-3xl border-2 border-black max-w-3xl w-full p-5 sm:p-7 space-y-6 shadow-2xl max-h-[92vh] overflow-y-auto bg-white text-slate-800">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-4 border-slate-200 gap-3">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg border ${
                    (quizQuestions[0]?.subject || currentSubtopic?.subject) === 'chemistry'
                      ? 'bg-cyan-50 text-cyan-800 border-cyan-300'
                      : (quizQuestions[0]?.subject || currentSubtopic?.subject) === 'physics'
                        ? 'bg-purple-50 text-purple-800 border-purple-300'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  }`}>
                    [{quizSubtopicCode}] {currentSubtopic?.title || 'Subtopic Lesson'}
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-[#FDFBF7] text-slate-700 border border-slate-300">
                    Cambridge 0653 Paper 2 Standards
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#EBF3F5] text-slate-800 border border-slate-300">
                    Attempt #{subtopicAttemptCounts[quizSubtopicCode] || 1}
                  </span>
                </div>
                <h3 className="font-bold text-base sm:text-lg tracking-tight truncate text-slate-800">
                  Traffic Light Mastery Check: 10 Target Questions
                </h3>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Active Elapsed Timer */}
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#FDFBF7] border border-slate-300 text-xs font-mono text-slate-700">
                  <Clock className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{formatQuizTimer(quizTimerSeconds)}</span>
                </div>

                <button
                  onClick={() => startQuizForSubtopic(quizSubtopicCode, true)}
                  title="Generate a completely fresh 10-question set from the bank"
                  className="hidden sm:flex text-xs px-2.5 py-1 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-black items-center gap-1.5 transition font-bold cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3 text-slate-700" />
                  <span>Fresh Set</span>
                </button>
                <button 
                  onClick={() => setIsQuizModalOpen(false)}
                  className="text-slate-600 hover:text-black p-1 rounded-xl hover:bg-slate-100 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* If Quiz Not Completed: Question by Question */}
            {!quizCompleted && quizQuestions.length > 0 && (
              <div className="space-y-6">
                {/* 10-Question Navigator Pill Strip */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span className="font-bold text-slate-700">Question Navigator:</span>
                    <span>
                      Answered: <strong className="text-slate-900 font-mono">{Object.keys(submittedAnswers).length}</strong> / {quizQuestions.length}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {quizQuestions.map((q, idx) => {
                      const isCurrent = idx === currentQuestionIndex;
                      const isAnswered = submittedAnswers[idx];
                      const isCorrect = selectedAnswers[idx] === q.correctIndex;

                      return (
                        <button
                          key={q.id || idx}
                          type="button"
                          onClick={() => setCurrentQuestionIndex(idx)}
                          className={`w-8 h-8 rounded-xl text-xs font-mono font-bold transition flex items-center justify-center cursor-pointer ${
                            isCurrent
                              ? 'bg-slate-800 text-white ring-2 ring-slate-800 shadow-md'
                              : isAnswered
                                ? isCorrect
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-400 font-bold'
                                  : 'bg-rose-50 text-rose-800 border border-rose-400 font-bold'
                                : 'bg-[#FDFBF7] text-slate-700 hover:text-slate-900 border border-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-slate-800 transition-all duration-300"
                    style={{ width: `${((currentQuestionIndex + 1) / quizQuestions.length) * 100}%` }}
                  />
                </div>

                {/* Active Question Card */}
                {quizQuestions[currentQuestionIndex] && (
                  <div className="space-y-5 bg-[#FDFBF7] border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs">
                    {/* Question metadata badge */}
                    <div className="flex items-center justify-between text-xs text-slate-600 gap-2 flex-wrap">
                      <span className="font-mono font-bold text-slate-800">
                        Question {currentQuestionIndex + 1} of {quizQuestions.length}
                      </span>
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-300">
                        Syllabus Ref: {quizQuestions[currentQuestionIndex].syllabusRef || quizSubtopicCode}
                      </span>
                    </div>

                    <h4 className="text-base sm:text-lg font-bold leading-relaxed text-slate-800">
                      {quizQuestions[currentQuestionIndex].question}
                    </h4>

                    {/* 4 Options */}
                    <div className="space-y-3">
                      {quizQuestions[currentQuestionIndex].options.map((opt, optIdx) => {
                        const optLetter = ['A', 'B', 'C', 'D'][optIdx];
                        const isSelected = selectedAnswers[currentQuestionIndex] === optIdx;
                        const isSubmitted = submittedAnswers[currentQuestionIndex];
                        const isCorrect = optIdx === quizQuestions[currentQuestionIndex].correctIndex;
                        const isWrong = isSubmitted && isSelected && !isCorrect;

                        let cardStyle = 'bg-white border-2 border-black hover:bg-[#EBF3F5] text-slate-800';
                        let letterStyle = 'bg-[#FDFBF7] text-slate-700 border border-slate-300';

                        if (isSelected && !isSubmitted) {
                          cardStyle = 'bg-[#EBF3F5] border-2 border-black text-slate-900 shadow-2xs font-bold';
                          letterStyle = 'bg-slate-800 text-white';
                        }

                        if (isSubmitted) {
                          if (isCorrect) {
                            cardStyle = 'bg-emerald-50 border-2 border-emerald-600 text-emerald-900 font-bold';
                            letterStyle = 'bg-emerald-600 text-white';
                          } else if (isWrong) {
                            cardStyle = 'bg-rose-50 border-2 border-rose-600 text-rose-900 font-bold';
                            letterStyle = 'bg-rose-600 text-white';
                          } else {
                            cardStyle = 'opacity-40 border border-slate-200 bg-white text-slate-500';
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            disabled={isSubmitted}
                            onClick={() => handleSelectQuizAnswer(currentQuestionIndex, optIdx)}
                            className={`w-full text-left p-3.5 sm:p-4 rounded-xl text-xs sm:text-sm transition flex items-start gap-3.5 cursor-pointer ${cardStyle}`}
                          >
                            <span className={`w-7 h-7 rounded-lg font-mono font-bold text-xs flex items-center justify-center shrink-0 ${letterStyle}`}>
                              {isSubmitted && isCorrect ? <Check className="w-4 h-4 text-white" /> : isSubmitted && isWrong ? <X className="w-4 h-4 text-white" /> : optLetter}
                            </span>
                            <span className="flex-1 leading-relaxed pt-0.5">{opt}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Instant Explanation upon answering */}
                    {submittedAnswers[currentQuestionIndex] && (
                      <div className="space-y-3 pt-2">
                        <div className={`p-4 rounded-xl border text-xs sm:text-sm flex items-start gap-3 ${
                          selectedAnswers[currentQuestionIndex] === quizQuestions[currentQuestionIndex].correctIndex
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                            : 'bg-rose-50 border-rose-300 text-rose-800'
                        }`}>
                          {selectedAnswers[currentQuestionIndex] === quizQuestions[currentQuestionIndex].correctIndex ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                          ) : (
                            <XCircle className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
                          )}
                          <div className="space-y-1">
                            <div className="font-bold">
                              {selectedAnswers[currentQuestionIndex] === quizQuestions[currentQuestionIndex].correctIndex ? 'Correct!' : 'Incorrect'}
                            </div>
                            <p className="text-xs text-slate-700 leading-relaxed">
                              {quizQuestions[currentQuestionIndex].explanation}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Modal Navigation Buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                  <button
                    onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentQuestionIndex === 0}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      currentQuestionIndex === 0 ? 'opacity-40 cursor-not-allowed border border-slate-200 bg-white text-slate-400' : 'bg-white border border-black hover:bg-slate-100 text-slate-800'
                    }`}
                  >
                    Previous
                  </button>

                  {currentQuestionIndex < quizQuestions.length - 1 ? (
                    <button
                      onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                      className="px-6 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                    >
                      <span>Next question</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={handleCompleteQuiz}
                      disabled={Object.keys(submittedAnswers).length < quizQuestions.length}
                      className={`px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                        Object.keys(submittedAnswers).length < quizQuestions.length
                          ? 'opacity-40 cursor-not-allowed bg-slate-200 text-slate-500 border border-slate-300'
                          : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs'
                      }`}
                    >
                      <Award className="w-4 h-4" />
                      <span>Submit & certify status</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* If Quiz Completed: Score Summary, Traffic Light Status & Full Review Mode */}
            {quizCompleted && (() => {
              const quizPct = Math.round((quizScore / Math.max(1, quizQuestions.length)) * 100);
              return (
              <div className="space-y-6 py-2">
                {/* Result Hero Banner */}
                <div className="text-center space-y-4">
                  <div 
                    className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-3xl font-black shadow-xs"
                    style={{
                      backgroundColor: quizPct >= 80 ? '#059669' : quizPct >= 50 ? '#d97706' : '#e11d48',
                      color: '#ffffff'
                    }}
                  >
                    {quizPct >= 80 ? '🎉' : quizPct >= 50 ? '⚠️' : '🚨'}
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-2xl font-bold tracking-tight text-slate-800">
                      {quizPct >= 80 
                        ? 'Green Status Awarded (Mastery Certified)' 
                        : quizPct >= 50 
                          ? 'Amber / Orange Grade Assigned' 
                          : 'Red Grade Assigned (Needs Revision)'}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600">
                      You scored <strong className="text-slate-800 font-mono text-base">{quizScore}/{quizQuestions.length}</strong> ({quizPct}%) on [{quizSubtopicCode}].
                    </p>
                  </div>

                  {/* Cambridge Grade Prediction Pill */}
                  <div className="flex items-center justify-center gap-2 flex-wrap pt-1">
                    <span className={`text-xs font-mono font-bold px-3 py-1 rounded-xl border ${getCambridgeGrade(quizPct).color}`}>
                      {getCambridgeGrade(quizPct).label}
                    </span>
                    <span className="text-xs font-mono px-3 py-1 rounded-xl bg-white border border-slate-300 text-slate-700">
                      ⏱ Time: {formatQuizTimer(quizTimerSeconds)}
                    </span>
                  </div>
                </div>

                {/* Status Guidance Card */}
                {quizPct >= 80 ? (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-800 max-w-lg mx-auto space-y-1">
                    <div className="font-bold text-sm text-emerald-900 flex items-center justify-center gap-1.5">
                      <span>✓ High Mastery Certified (80%+)</span>
                    </div>
                    <p className="text-center text-slate-700">
                      Outstanding performance! Your score meets the Cambridge 80% threshold. Green status has been recorded in your Progress Tracker.
                    </p>
                  </div>
                ) : quizPct >= 50 ? (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-xs text-amber-800 max-w-lg mx-auto space-y-1">
                    <div className="font-bold text-sm text-amber-900 flex items-center justify-center gap-1.5">
                      <span>⚠️ Amber / Orange Grade Awarded (50% - 79%)</span>
                    </div>
                    <p className="text-center text-slate-700">
                      Good effort! Scoring in the 50%–79% range assigns you an <strong>Amber / Orange grade</strong>. Review the key formulas and explanations in the lesson slides to reach the 80%+ threshold for Green status!
                    </p>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-xs text-rose-800 max-w-lg mx-auto space-y-1">
                    <div className="font-bold text-sm text-rose-900 flex items-center justify-center gap-1.5">
                      <span>🚨 Red Grade Assigned (Under 50%)</span>
                    </div>
                    <p className="text-center text-slate-700">
                      Scoring below 50% assigns you a <strong>Red grade</strong>. Key syllabus definitions require reinforcement. Please review the interactive lesson slides carefully and retake the quiz.
                    </p>
                  </div>
                )}

                {/* Question-by-Question Review Section with Filter Tabs */}
                <div className="space-y-4 pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <h5 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-emerald-700" />
                      <span>Detailed Question Breakdown & Review</span>
                    </h5>

                    {/* Review Filter Tabs */}
                    <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#FDFBF7] border border-slate-200 text-xs">
                      <button
                        type="button"
                        onClick={() => setQuizReviewFilter('all')}
                        className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                          quizReviewFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        All ({quizQuestions.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuizReviewFilter('incorrect')}
                        className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                          quizReviewFilter === 'incorrect' ? 'bg-rose-100 text-rose-800' : 'text-rose-700 hover:text-rose-900'
                        }`}
                      >
                        Incorrect ({quizQuestions.length - quizScore})
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuizReviewFilter('correct')}
                        className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                          quizReviewFilter === 'correct' ? 'bg-emerald-100 text-emerald-800' : 'text-emerald-700 hover:text-emerald-900'
                        }`}
                      >
                        Correct ({quizScore})
                      </button>
                    </div>
                  </div>

                  {/* Filtered Question Review List */}
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                    {quizQuestions
                      .map((q, idx) => ({ q, idx }))
                      .filter(({ q, idx }) => {
                        const isCorrect = selectedAnswers[idx] === q.correctIndex;
                        if (quizReviewFilter === 'correct') return isCorrect;
                        if (quizReviewFilter === 'incorrect') return !isCorrect;
                        return true;
                      })
                      .map(({ q, idx }) => {
                        const userChoiceIdx = selectedAnswers[idx];
                        const isCorrect = userChoiceIdx === q.correctIndex;

                        return (
                          <div
                            key={q.id || idx}
                            className={`p-4 rounded-xl border text-xs space-y-2.5 transition ${
                              isCorrect
                                ? 'bg-emerald-50/50 border-emerald-300'
                                : 'bg-rose-50/50 border-rose-300'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-mono font-bold text-slate-600">
                                #{idx + 1} • Ref: {q.syllabusRef || quizSubtopicCode}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                              }`}>
                                {isCorrect ? 'Correct' : 'Needs Review'}
                              </span>
                            </div>

                            <p className="font-bold text-slate-800 text-xs sm:text-sm">
                              {q.question}
                            </p>

                            <div className="space-y-1 pt-1 text-xs">
                              <div className="flex items-center gap-2">
                                <span className="text-slate-600 font-semibold w-24 shrink-0">Your Answer:</span>
                                <span className={isCorrect ? 'text-emerald-800 font-bold' : 'text-rose-800 font-bold'}>
                                  {userChoiceIdx !== undefined && q.options[userChoiceIdx] ? q.options[userChoiceIdx] : 'Unanswered'}
                                </span>
                              </div>
                              {!isCorrect && (
                                <div className="flex items-center gap-2">
                                  <span className="text-slate-600 font-semibold w-24 shrink-0">Correct Answer:</span>
                                  <span className="text-emerald-800 font-bold">
                                    {q.options[q.correctIndex]}
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs space-y-1">
                              <span className="font-bold text-slate-800">Examiner Rationale:</span>
                              <p className="text-slate-600 leading-relaxed">
                                {q.explanation}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Completion Actions */}
                <div className="pt-4 border-t border-slate-200 flex items-center justify-center gap-3 flex-wrap">
                  <button
                    onClick={() => startQuizForSubtopic(quizSubtopicCode, true)}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white shadow-xs flex items-center gap-2 transition cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Practice with NEW questions (fresh rotation)</span>
                  </button>
                  <button
                    onClick={() => setIsQuizModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 text-slate-800 border border-black transition shadow-xs cursor-pointer"
                  >
                    Back to lesson slides
                  </button>
                </div>
              </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

