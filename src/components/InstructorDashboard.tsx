import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart3, 
  Users, 
  Award, 
  AlertTriangle, 
  Search, 
  FileDown, 
  CheckCircle, 
  Sparkles, 
  TrendingUp, 
  Filter, 
  ExternalLink, 
  Link as LinkIcon, 
  RotateCcw, 
  UploadCloud, 
  Check, 
  Play, 
  FolderSync, 
  Cloud, 
  FolderCheck, 
  Eye, 
  RefreshCw, 
  GraduationCap,
  Plus,
  Copy,
  Trash2,
  Mail,
  UserPlus,
  KeyRound,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  Calendar,
  X,
  ArrowRightLeft,
  Swords,
  Edit3,
  Trophy,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ClipboardCheck,
  Gift,
  Package,
  Coins,
  Layers,
  Crosshair,
  Lock
} from 'lucide-react';
import { InstructorTasksManager } from './InstructorTasksManager';
import { TaskAnalyticsPage } from './TaskAnalyticsPage';
import { StudentRewardModal, RewardTargetStudent } from './StudentRewardModal';
import {
  UserGameProfile,
  InstructorRewardType,
  fetchStudentsGameProfilesMap,
  subscribeToGameProfile,
  calculateLevelFromXP
} from '../services/firebaseGameService';
import { ALL_FANTASY_SKINS, getFantasySkin, FANTASY_SKIN_ALIASES } from '../data/fantasySkinsData';
import { ALL_WEAPON_ITEMS, BOOSTER_PACKS, RARITY_RANK, resolveWeaponItem } from '../data/gameCatalogData';
import { 
  getActiveGoogleSlideSubtopics, 
  saveGoogleSlidesOverride, 
  batchSaveGoogleSlidesOverrides, 
  resetGoogleSlidesOverrides, 
  formatGoogleSlidesUrl, 
  GoogleSlideSubtopic 
} from '../data/googleSlidesRegistry';
import { 
  subscribeToCurriculumSlides, 
  saveSharedSlideOverride, 
  batchSaveSharedSlideOverrides, 
  saveSharedSyncedDriveSlides 
} from '../services/firestoreService';
import { 
  TARGET_DRIVE_FOLDER_ID, 
  TARGET_DRIVE_FOLDER_URL, 
  fetchAllDriveFolderFiles, 
  organizeDriveLessonsIntoSubfolders, 
  replaceAllSyncedLessons, 
  DRIVE_STORAGE_KEY, 
  DriveSyncedSlideItem, 
  resolveSubtopicForSlide 
} from '../services/googleDriveService';
import { signInWithGoogle, getCachedDriveToken, clearCachedDriveToken } from '../services/firebaseAuth';
import { 
  ClassItem, 
  ClassStudentItem, 
  InstructorInviteItem,
  createClass, 
  fetchClassesByInstructor, 
  fetchStudentsInClass, 
  deleteClass, 
  removeStudentFromClass, 
  inviteInstructor, 
  fetchInstructorInvites, 
  deleteInstructorInvite,
  INITIAL_INSTRUCTOR_EMAILS,
  subscribeToClassStudents,
  shareClassWithInstructor,
  removeSharedInstructorFromClass,
  updatePastStudentQuizResultsWithNewTrafficLightParameters,
  UpdatePastQuizResultsSummary,
  moveStudentToClass,
  moveMultipleStudentsToClass
} from '../services/firestoreService';
import { allSubtopicsData } from '../data/subtopicSlidesData';
import { UserProfile, ScienceSubject } from '../types';

interface StudentRosterItem {
  id: string;
  name: string;
  tier: 'Core' | 'Extended';
  progressPct: number;
  slideDeckCount: number;
  slideDeckPct: number;
  syllabusPct: number;
  bioScore: number;
  chemScore: number;
  physScore: number;
  weakArea: string;
  status: 'Excelling' | 'On Track' | 'Intervention Required';
}

interface InstructorDashboardProps {
  currentUser: UserProfile;
  onSwitchToStudentMode?: () => void;
  onNavigateToLessons?: () => void;
  onNavigateToRoyale?: () => void;
  onNavigateToLeaderboard?: () => void;
  initialTab?: 'classes' | 'tasks' | 'task_analytics' | 'cohort' | 'roster' | 'invites' | 'drive' | 'slides';
}

export const InstructorDashboard: React.FC<InstructorDashboardProps> = ({ 
  currentUser,
  onSwitchToStudentMode, 
  onNavigateToLessons,
  onNavigateToRoyale,
  onNavigateToLeaderboard,
  initialTab = 'classes'
}) => {
  const [dashboardTab, setDashboardTab] = useState<'classes' | 'tasks' | 'task_analytics' | 'cohort' | 'roster' | 'invites' | 'drive' | 'slides'>(() => {
    return (initialTab === 'cohort' || initialTab === 'roster') ? 'cohort' : initialTab;
  });

  useEffect(() => {
    if (initialTab) {
      setDashboardTab((initialTab === 'cohort' || initialTab === 'roster') ? 'cohort' : initialTab);
    }
  }, [initialTab]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [tierFilter, setTierFilter] = useState<'all' | 'Core' | 'Extended'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Excelling' | 'On Track' | 'Intervention Required'>('all');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // -------------------------------------------------------------
  // CLASSES & STUDENT PROGRESS TRACKING
  // -------------------------------------------------------------
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [classStudents, setClassStudents] = useState<ClassStudentItem[]>([]);
  const [loadingClasses, setLoadingClasses] = useState<boolean>(true);
  const [loadingStudents, setLoadingStudents] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Student individual analysis modal state
  const [selectedStudentForAnalysis, setSelectedStudentForAnalysis] = useState<ClassStudentItem | null>(null);
  const [studentModalTab, setStudentModalTab] = useState<'academic' | 'game_collection'>('academic');
  const [skinCollectionFilter, setSkinCollectionFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [studentGameProfiles, setStudentGameProfiles] = useState<Record<string, UserGameProfile>>({});
  const [rewardModalConfig, setRewardModalConfig] = useState<{
    isOpen: boolean;
    targets: RewardTargetStudent[];
    initialRewardType?: InstructorRewardType;
    initialItemId?: string;
  }>({ isOpen: false, targets: [] });
  const [analysisSubjectFilter, setAnalysisSubjectFilter] = useState<'all' | 'biology' | 'chemistry' | 'physics'>('all');
  const [modalQuizSort, setModalQuizSort] = useState<{ column: 'topic' | 'subject' | 'score' | 'percentage' | 'result' | 'date' | null; direction: 'asc' | 'desc' }>({ column: null, direction: 'asc' });
  const [modalQuizFilters, setModalQuizFilters] = useState<{ topic: string; result: 'all' | 'passed' | 'review'; scoreRange: 'all' | 'high' | 'mid' | 'low' }>({
    topic: '',
    result: 'all',
    scoreRange: 'all'
  });

  // Class Analysis (Enrolled Students table) per-column sort & filter state
  type ClassSortCol = 'name' | 'tier' | 'gameLevel' | 'decks' | 'syllabus' | 'trafficLights' | 'quizScores' | 'weakTopics' | 'lastActive';
  const [classSort, setClassSort] = useState<{ column: ClassSortCol | null; direction: 'asc' | 'desc' }>({ column: null, direction: 'asc' });
  const [classColFilters, setClassColFilters] = useState<{
    student: string;
    tier: 'all' | 'Core' | 'Extended';
    gameLevel: 'all' | 'has_packs' | 'lv5_plus' | 'high_gold';
    decks: 'all' | 'zero' | 'low' | 'mid' | 'high';
    syllabus: 'all' | 'zero' | 'low' | 'mid' | 'high';
    trafficLights: 'all' | 'has_green' | 'has_amber' | 'has_red' | 'unrated';
    quizScores: 'all' | 'high' | 'mid' | 'low' | 'none' | 'has_bio' | 'has_chem' | 'has_phys';
    weakTopics: string;
    lastActive: 'all' | 'today' | 'week' | 'month' | 'older';
  }>({
    student: '',
    tier: 'all',
    gameLevel: 'all',
    decks: 'all',
    syllabus: 'all',
    trafficLights: 'all',
    quizScores: 'all',
    weakTopics: '',
    lastActive: 'all'
  });

  // Cohort / Student Analysis table per-column sort & filter state
  type CohortSortCol = 'name' | 'tier' | 'slideDecks' | 'syllabusPct' | 'bioScore' | 'chemScore' | 'physScore' | 'weakArea' | 'status';
  const [cohortSort, setCohortSort] = useState<{ column: CohortSortCol | null; direction: 'asc' | 'desc' }>({ column: null, direction: 'asc' });
  const [cohortColFilters, setCohortColFilters] = useState<{
    name: string;
    slideDecks: 'all' | 'zero' | 'low' | 'mid' | 'high';
    syllabusPct: 'all' | 'zero' | 'low' | 'mid' | 'high';
    bioScore: 'all' | 'high' | 'mid' | 'low' | 'zero';
    chemScore: 'all' | 'high' | 'mid' | 'low' | 'zero';
    physScore: 'all' | 'high' | 'mid' | 'low' | 'zero';
    weakArea: string;
  }>({
    name: '',
    slideDecks: 'all',
    syllabusPct: 'all',
    bioScore: 'all',
    chemScore: 'all',
    physScore: 'all',
    weakArea: ''
  });

  // Create class modal state
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newClassName, setNewClassName] = useState<string>('');
  const [newClassSubject, setNewClassSubject] = useState<ScienceSubject | 'all'>('all');
  const [newClassCustomCode, setNewClassCustomCode] = useState<string>('');
  const [newClassDesc, setNewClassDesc] = useState<string>('');
  const [creatingClass, setCreatingClass] = useState<boolean>(false);

  // Share class with co-instructors modal state
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [classToShare, setClassToShare] = useState<ClassItem | null>(null);
  const [shareEmailInput, setShareEmailInput] = useState<string>('');
  const [sharingClass, setSharingClass] = useState<boolean>(false);
  const [shareFeedbackMsg, setShareFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Move students to different class modal state
  const [showMoveModal, setShowMoveModal] = useState<boolean>(false);
  const [studentsToMove, setStudentsToMove] = useState<{ studentId: string; name: string; currentClassId: string; currentClassName: string }[]>([]);
  const [targetClassIdForMove, setTargetClassIdForMove] = useState<string>('');
  const [movingStudents, setMovingStudents] = useState<boolean>(false);
  const [notifyStudentOnMove, setNotifyStudentOnMove] = useState<boolean>(true);
  const [selectedStudentIdsForBatch, setSelectedStudentIdsForBatch] = useState<Set<string>>(new Set());

  // Recalculate past student quiz results with new traffic light parameters
  const [updatingQuizParameters, setUpdatingQuizParameters] = useState<boolean>(false);
  const [updateResultsModalSummary, setUpdateResultsModalSummary] = useState<UpdatePastQuizResultsSummary | null>(null);

  const handleUpdateAllPastQuizResults = async () => {
    setUpdatingQuizParameters(true);
    try {
      const summary = await updatePastStudentQuizResultsWithNewTrafficLightParameters();
      setUpdateResultsModalSummary(summary);
      setActionNotice(`Recalculated past quiz results: ${summary.subtopicResultsUpdatedCount} quiz grades & ${summary.taskSubmissionsUpdatedCount} task submissions updated!`);
      setTimeout(() => setActionNotice(null), 6000);
      await loadInstructorClasses();
    } catch (err: any) {
      alert(`Error updating quiz parameters: ${err?.message || 'Failed to update'}`);
    } finally {
      setUpdatingQuizParameters(false);
    }
  };

  // Load classes created by or shared with this instructor
  const loadInstructorClasses = async () => {
    setLoadingClasses(true);
    try {
      const result = await fetchClassesByInstructor(currentUser.id, currentUser.email);
      setClasses(result);
      if (result.length > 0) {
        setSelectedClass(current => {
          if (!current) return result[0];
          return result.find(c => c.id === current.id) || result[0];
        });
      }
    } catch (err) {
      console.error('Failed to load instructor classes:', err);
    } finally {
      setLoadingClasses(false);
    }
  };

  useEffect(() => {
    loadInstructorClasses();

    const handleClassUpdate = () => {
      loadInstructorClasses();
    };

    window.addEventListener('igcse_classes_updated', handleClassUpdate);
    window.addEventListener('storage', handleClassUpdate);
    return () => {
      window.removeEventListener('igcse_classes_updated', handleClassUpdate);
      window.removeEventListener('storage', handleClassUpdate);
    };
  }, [currentUser.id, currentUser.email]);

  // Real-time live subscription for students in selected class
  useEffect(() => {
    if (!selectedClass) {
      setClassStudents([]);
      return;
    }
    setLoadingStudents(true);
    const unsubscribe = subscribeToClassStudents(selectedClass.id, (liveStudents) => {
      setClassStudents(liveStudents);
      setLoadingStudents(false);
      // If student analysis modal is open, keep student object in sync
      setSelectedStudentForAnalysis(current => {
        if (!current) return null;
        return liveStudents.find(s => s.studentId === current.studentId) || current;
      });
    });

    return () => unsubscribe();
  }, [selectedClass?.id]);

  // Batch fetch RPG profiles (level, gold, weapon packs, skins, weapons) for students in selected class
  useEffect(() => {
    const ids = classStudents.map(s => s.studentId).filter(Boolean);
    if (ids.length === 0) return;
    let active = true;
    fetchStudentsGameProfilesMap(ids).then((map) => {
      if (active) {
        setStudentGameProfiles(prev => ({ ...prev, ...map }));
      }
    }).catch(() => {});
    return () => {
      active = false;
    };
  }, [classStudents]);

  // Live subscribe to game profile when inspecting an individual student
  useEffect(() => {
    if (!selectedStudentForAnalysis?.studentId) return;
    const sid = selectedStudentForAnalysis.studentId;
    const unsub = subscribeToGameProfile(sid, (liveProfile) => {
      setStudentGameProfiles(prev => ({ ...prev, [sid]: liveProfile }));
    });
    return () => unsub();
  }, [selectedStudentForAnalysis?.studentId]);

  const openStudentModal = (std: ClassStudentItem, tab: 'academic' | 'game_collection' = 'academic') => {
    setSelectedStudentForAnalysis(std);
    setStudentModalTab(tab);
  };

  const openRewardModal = (
    targets: RewardTargetStudent[],
    initialRewardType: InstructorRewardType = 'booster_pack',
    initialItemId?: string
  ) => {
    setRewardModalConfig({
      isOpen: true,
      targets,
      initialRewardType,
      initialItemId
    });
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    setCreatingClass(true);
    try {
      const res = await createClass({
        name: newClassName.trim(),
        subject: newClassSubject,
        customCode: newClassCustomCode.trim() || undefined,
        description: newClassDesc.trim() || undefined
      }, currentUser);

      if (res.success && res.classItem) {
        setClasses(prev => [res.classItem!, ...prev]);
        setSelectedClass(res.classItem);
        setShowCreateModal(false);
        setNewClassName('');
        setNewClassCustomCode('');
        setNewClassDesc('');
        setActionNotice(res.message);
        setTimeout(() => setActionNotice(null), 4000);
      } else {
        alert(res.message);
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to create class');
    } finally {
      setCreatingClass(false);
    }
  };

  const handleDeleteClass = async (classId: string, className: string) => {
    if (!window.confirm(`Are you sure you want to delete class "${className}"? This will unlink enrolled students.`)) {
      return;
    }
    const success = await deleteClass(classId);
    if (success) {
      const updated = classes.filter(c => c.id !== classId);
      setClasses(updated);
      if (selectedClass?.id === classId) {
        setSelectedClass(updated[0] || null);
      }
      setActionNotice(`Class "${className}" removed.`);
      setTimeout(() => setActionNotice(null), 3000);
    }
  };

  const handleRemoveStudent = async (studentId: string, studentName: string) => {
    if (!selectedClass) return;
    if (!window.confirm(`Remove ${studentName} from ${selectedClass.name}?`)) return;

    const ok = await removeStudentFromClass(selectedClass.id, studentId);
    if (ok) {
      setClassStudents(prev => prev.filter(s => s.studentId !== studentId));
      setSelectedClass(prev => prev ? { ...prev, studentCount: Math.max(0, prev.studentCount - 1) } : null);
      setActionNotice(`${studentName} removed from class.`);
      setTimeout(() => setActionNotice(null), 3000);
    }
  };

  const handleOpenMoveModalSingle = (
    student: { studentId: string; name: string },
    sourceClassId?: string,
    sourceClassName?: string
  ) => {
    const srcId = sourceClassId || selectedClass?.id || (classes[0]?.id || '');
    const srcName = sourceClassName || selectedClass?.name || (classes[0]?.name || '');
    setStudentsToMove([{
      studentId: student.studentId,
      name: student.name,
      currentClassId: srcId,
      currentClassName: srcName
    }]);

    const allCandidateClasses = classes;
    const available = allCandidateClasses.filter(c => c.id !== srcId);
    setTargetClassIdForMove(available[0]?.id || '');
    setShowMoveModal(true);
  };

  const handleOpenMoveModalBatch = () => {
    if (selectedStudentIdsForBatch.size === 0 || !selectedClass) return;
    const toMove = classStudents
      .filter(s => selectedStudentIdsForBatch.has(s.studentId))
      .map(s => ({
        studentId: s.studentId,
        name: s.name,
        currentClassId: selectedClass.id,
        currentClassName: selectedClass.name
      }));
    if (toMove.length === 0) return;
    setStudentsToMove(toMove);

    const allCandidateClasses = classes;
    const available = allCandidateClasses.filter(c => c.id !== selectedClass.id);
    setTargetClassIdForMove(available[0]?.id || '');
    setShowMoveModal(true);
  };

  const toggleSelectAllStudents = (visibleStudentIds?: string[]) => {
    const targetIds = visibleStudentIds && visibleStudentIds.length > 0
      ? visibleStudentIds
      : classStudents.map(s => s.studentId);
    const allSelected = targetIds.length > 0 && targetIds.every(id => selectedStudentIdsForBatch.has(id));
    if (allSelected) {
      setSelectedStudentIdsForBatch(prev => {
        const next = new Set(prev);
        targetIds.forEach(id => next.delete(id));
        return next;
      });
    } else {
      setSelectedStudentIdsForBatch(prev => {
        const next = new Set(prev);
        targetIds.forEach(id => next.add(id));
        return next;
      });
    }
  };

  const toggleSelectStudent = (studentId: string) => {
    setSelectedStudentIdsForBatch(prev => {
      const next = new Set(prev);
      if (next.has(studentId)) {
        next.delete(studentId);
      } else {
        next.add(studentId);
      }
      return next;
    });
  };

  const handleConfirmMoveStudents = async () => {
    if (!targetClassIdForMove || studentsToMove.length === 0) return;
    setMovingStudents(true);
    try {
      const sourceClassId = studentsToMove[0].currentClassId;
      const studentIds = studentsToMove.map(s => s.studentId);
      
      const result = await moveMultipleStudentsToClass(
        studentIds,
        sourceClassId,
        targetClassIdForMove,
        {
          instructorName: currentUser.name,
          instructorEmail: currentUser.email,
          notifyStudent: notifyStudentOnMove
        }
      );

      const allCandidateClasses = classes;
      const targetClassObj = allCandidateClasses.find(c => c.id === targetClassIdForMove);
      const targetName = targetClassObj?.name || 'new class';

      if (selectedClass && selectedClass.id === sourceClassId) {
        setClassStudents(prev => prev.filter(s => !studentIds.includes(s.studentId)));
        setSelectedClass(prev => prev ? {
          ...prev,
          studentCount: Math.max(0, prev.studentCount - result.successfulCount)
        } : null);
      }

      if (selectedStudentForAnalysis && studentIds.includes(selectedStudentForAnalysis.studentId)) {
        setSelectedStudentForAnalysis(null);
      }

      setSelectedStudentIdsForBatch(new Set());
      setShowMoveModal(false);
      setStudentsToMove([]);

      const msg = studentsToMove.length === 1 
        ? `Successfully moved ${studentsToMove[0].name} to ${targetName}!`
        : `Successfully moved ${result.successfulCount} students to ${targetName}!`;
      setActionNotice(msg);
      setTimeout(() => setActionNotice(null), 5000);

      await loadInstructorClasses();
    } catch (err: any) {
      alert(`Error moving student(s): ${err?.message || 'Operation failed'}`);
    } finally {
      setMovingStudents(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleExportClassCSV = () => {
    if (!selectedClass) return;
    const headers = ['Student ID,Name,Email,Tier,Joined At,Completed Lessons,Weak Topics,Last Active'];
    const rows = classStudents.map(s => 
      `${s.studentId},"${s.name}","${s.email}",${s.tier},"${s.joinedAt}",${s.completedLessonsCount},"${s.weakTopics.join('; ')}","${s.lastActive}"`
    );
    const csvContent = headers.concat(rows).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedClass.name.replace(/[^a-zA-Z0-9]/g, '_')}_Student_Roster.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Handlers for sharing classes with co-instructors
  const handleShareClassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classToShare || !shareEmailInput.trim()) return;
    setSharingClass(true);
    setShareFeedbackMsg(null);
    try {
      const res = await shareClassWithInstructor(classToShare.id, shareEmailInput.trim(), currentUser);
      if (res.success && res.classItem) {
        setShareFeedbackMsg({ type: 'success', text: res.message });
        setShareEmailInput('');
        setClassToShare(res.classItem);
        setClasses(prev => prev.map(c => c.id === res.classItem!.id ? res.classItem! : c));
        if (selectedClass?.id === res.classItem.id) {
          setSelectedClass(res.classItem);
        }
      } else {
        setShareFeedbackMsg({ type: 'error', text: res.message || 'Failed to share class.' });
      }
    } catch (err: any) {
      setShareFeedbackMsg({ type: 'error', text: err?.message || 'Error sharing class.' });
    } finally {
      setSharingClass(false);
    }
  };

  const handleRemoveSharedInstructor = async (targetEmail: string) => {
    if (!classToShare) return;
    setSharingClass(true);
    setShareFeedbackMsg(null);
    try {
      const res = await removeSharedInstructorFromClass(classToShare.id, targetEmail);
      if (res.success && res.classItem) {
        setShareFeedbackMsg({ type: 'success', text: res.message });
        setClassToShare(res.classItem);
        setClasses(prev => prev.map(c => c.id === res.classItem!.id ? res.classItem! : c));
        if (selectedClass?.id === res.classItem.id) {
          setSelectedClass(res.classItem);
        }
      } else {
        setShareFeedbackMsg({ type: 'error', text: res.message || 'Failed to remove instructor access.' });
      }
    } catch (err: any) {
      setShareFeedbackMsg({ type: 'error', text: err?.message || 'Error removing instructor access.' });
    } finally {
      setSharingClass(false);
    }
  };

  // -------------------------------------------------------------
  // INSTRUCTOR TEAM & INVITATIONS
  // -------------------------------------------------------------
  const [instructorInvites, setInstructorInvites] = useState<InstructorInviteItem[]>([]);
  const [newInviteEmail, setNewInviteEmail] = useState<string>('');
  const [inviting, setInviting] = useState<boolean>(false);
  const [inviteStatusMsg, setInviteStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadInvites = async () => {
    try {
      const items = await fetchInstructorInvites();
      setInstructorInvites(items);
    } catch (err) {
      console.error('Failed to load instructor invites:', err);
    }
  };

  useEffect(() => {
    if (dashboardTab === 'invites') {
      loadInvites();
    }
  }, [dashboardTab]);

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInviteEmail.trim()) return;

    setInviting(true);
    setInviteStatusMsg(null);
    try {
      const res = await inviteInstructor(newInviteEmail.trim(), currentUser);
      if (res.success) {
        setInviteStatusMsg({ type: 'success', text: res.message });
        setNewInviteEmail('');
        await loadInvites();
      } else {
        setInviteStatusMsg({ type: 'error', text: res.message });
      }
    } catch (err: any) {
      setInviteStatusMsg({ type: 'error', text: err?.message || 'Failed to send invite.' });
    } finally {
      setInviting(false);
    }
  };

  const handleDeleteInvite = async (inviteId: string, email: string) => {
    if (!window.confirm(`Revoke instructor access for ${email}?`)) return;
    const ok = await deleteInstructorInvite(inviteId, email);
    if (ok) {
      setInstructorInvites(prev => prev.filter(i => i.id !== inviteId));
      setActionNotice(`Instructor access for ${email} revoked.`);
      setTimeout(() => setActionNotice(null), 3000);
    }
  };

  // -------------------------------------------------------------
  // GOOGLE DRIVE SYNC & RE-ORGANIZATION
  // -------------------------------------------------------------
  const [isSyncingDrive, setIsSyncingDrive] = useState<boolean>(false);
  const [isOrganizingDrive, setIsOrganizingDrive] = useState<boolean>(false);
  const [driveSyncStatusMessage, setDriveSyncStatusMessage] = useState<string | null>(null);
  const [syncedDriveSlides, setSyncedDriveSlides] = useState<DriveSyncedSlideItem[]>(() => {
    try {
      const raw = localStorage.getItem(DRIVE_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const handleOrganizeDriveInDashboard = async () => {
    setIsOrganizingDrive(true);
    setDriveSyncStatusMessage(null);
    try {
      let token = await getCachedDriveToken();
      if (!token) token = await signInWithGoogle();
      if (!token) {
        setDriveSyncStatusMessage('Google sign-in was cancelled or required. Please sign in to authenticate with Google Drive.');
        setIsOrganizingDrive(false);
        return;
      }

      setDriveSyncStatusMessage('Scanning lesson drive, detecting subtopic codes (e.g. P1.5.1, C9.5), and placing files into corresponding subfolders...');
      const result = await organizeDriveLessonsIntoSubfolders(token, TARGET_DRIVE_FOLDER_ID);
      const organizedPresentations = result.presentations || [];
      setSyncedDriveSlides(organizedPresentations);
      if (organizedPresentations.length > 0) {
        await saveSharedSyncedDriveSlides(organizedPresentations, currentUser?.email);
      }
      setDriveSyncStatusMessage(result.message);
    } catch (err: any) {
      if (err?.isInsufficientScope || err?.message?.includes('insufficient') || err?.message?.includes('403') || err?.message?.includes('401')) {
        console.warn('Google Drive permission notice:', err?.message);
        clearCachedDriveToken();
        setDriveSyncStatusMessage(`Drive Permissions Notice: ${err?.message || 'Google Drive permissions required. Please authenticate to grant access.'}`);
      } else {
        console.error('Failed to organize drive lessons:', err);
        setDriveSyncStatusMessage(`Error organizing lessons: ${err?.message || 'Check folder access or Google sign-in.'}`);
      }
    } finally {
      setIsOrganizingDrive(false);
    }
  };

  const handleReplaceAllLessonsInDashboard = async () => {
    setIsSyncingDrive(true);
    setDriveSyncStatusMessage(null);
    try {
      let token = await getCachedDriveToken();
      if (!token) token = await signInWithGoogle();
      if (!token) {
        setDriveSyncStatusMessage('Google sign-in was cancelled or required. Please sign in to authenticate with Google Drive.');
        setIsSyncingDrive(false);
        return;
      }

      setDriveSyncStatusMessage('Replacing all stored lessons and re-syncing from Drive...');
      const freshSlides = await replaceAllSyncedLessons(token, TARGET_DRIVE_FOLDER_ID);
      setSyncedDriveSlides(freshSlides);
      if (freshSlides.length > 0) {
        await saveSharedSyncedDriveSlides(freshSlides, currentUser?.email);
      }
      setDriveSyncStatusMessage(`Replaced all lessons. Successfully re-synced ${freshSlides.length} Google Slides presentations and published to students!`);
    } catch (err: any) {
      if (err?.isInsufficientScope || err?.message?.includes('insufficient') || err?.message?.includes('403') || err?.message?.includes('401')) {
        console.warn('Google Drive permission notice:', err?.message);
        clearCachedDriveToken();
        setDriveSyncStatusMessage(`Drive Permissions Notice: ${err?.message || 'Google Drive permissions required. Please authenticate to grant access.'}`);
      } else {
        console.error('Failed to replace lessons:', err);
        setDriveSyncStatusMessage(`Error replacing lessons: ${err?.message || 'Check folder access or Google sign-in.'}`);
      }
    } finally {
      setIsSyncingDrive(false);
    }
  };

  // -------------------------------------------------------------
  // GOOGLE SLIDES OVERRIDES & REGISTRY
  // -------------------------------------------------------------
  const [slidesSubtopics, setSlidesSubtopics] = useState<GoogleSlideSubtopic[]>(() => getActiveGoogleSlideSubtopics());
  const [editingTopicCode, setEditingTopicCode] = useState<string | null>(null);
  const [editingUrlValue, setEditingUrlValue] = useState<string>('');
  const [slidesSearchTerm, setSlidesSearchTerm] = useState<string>('');

  const refreshSlidesList = () => {
    setSlidesSubtopics(getActiveGoogleSlideSubtopics());
  };

  // Real-time listener for shared curriculum slides
  useEffect(() => {
    const unsub = subscribeToCurriculumSlides(() => {
      setSlidesSubtopics(getActiveGoogleSlideSubtopics());
    });
    return () => unsub();
  }, []);

  const handleSaveSlideOverride = async (code: string, url: string) => {
    saveGoogleSlidesOverride(code, url);
    const parsed = formatGoogleSlidesUrl(url);
    if (parsed.isValid) {
      await saveSharedSlideOverride(code, {
        presentationId: parsed.presentationId || '',
        title: `${code} Google Slides Presentation`,
        embedUrl: parsed.embedUrl,
        directUrl: parsed.directUrl,
        subtopicCode: code.toUpperCase()
      }, currentUser?.email);
    }
    refreshSlidesList();
    setEditingTopicCode(null);
    setEditingUrlValue('');
  };

  // Convert real enrolled class students into StudentRosterItem
  const rosterStudents: StudentRosterItem[] = useMemo(() => {
    return classStudents.map(std => {
      const bioQuiz = std.quizScores?.['biology'];
      const chemQuiz = std.quizScores?.['chemistry'];
      const physQuiz = std.quizScores?.['physics'];
      const bioScore = bioQuiz && bioQuiz.total > 0 ? Math.round((bioQuiz.score / bioQuiz.total) * 100) : 0;
      const chemScore = chemQuiz && chemQuiz.total > 0 ? Math.round((chemQuiz.score / chemQuiz.total) * 100) : 0;
      const physScore = physQuiz && physQuiz.total > 0 ? Math.round((physQuiz.score / physQuiz.total) * 100) : 0;
      
      const completedDecksSet = new Set<string>([
        ...(std.completedLessons || []),
        ...Object.keys(std.trafficLights || {}),
        ...Object.keys(std.subtopicQuizScores || {})
      ]);
      const slideDeckCount = Math.max(std.completedLessonsCount || 0, completedDecksSet.size);
      const slideDeckPct = Math.min(100, Math.round((slideDeckCount / 106) * 100));
      const syllabusPct = Math.min(100, Math.round((completedDecksSet.size / 106) * 100));

      const progressPct = syllabusPct;
      const weakArea = std.weakTopics && std.weakTopics.length > 0 ? std.weakTopics.join(', ') : 'None identified';
      
      let status: 'Excelling' | 'On Track' | 'Intervention Required' = 'On Track';
      if (progressPct >= 75) {
        status = 'Excelling';
      } else if (progressPct < 35 || (std.weakTopics && std.weakTopics.length >= 3)) {
        status = 'Intervention Required';
      }

      return {
        id: std.studentId,
        name: std.name || 'Student',
        tier: std.tier || 'Extended',
        progressPct,
        slideDeckCount,
        slideDeckPct,
        syllabusPct,
        bioScore,
        chemScore,
        physScore,
        weakArea,
        status
      };
    });
  }, [classStudents]);

  const isClassNumericCol = (col: ClassSortCol) =>
    col === 'gameLevel' || col === 'decks' || col === 'syllabus' || col === 'trafficLights' || col === 'quizScores' || col === 'weakTopics' || col === 'lastActive';

  const toggleClassSort = (col: ClassSortCol) => {
    const firstDir: 'asc' | 'desc' = isClassNumericCol(col) ? 'desc' : 'asc';
    const secondDir: 'asc' | 'desc' = firstDir === 'asc' ? 'desc' : 'asc';
    setClassSort(prev => {
      if (prev.column !== col) return { column: col, direction: firstDir };
      if (prev.direction === firstDir) return { column: col, direction: secondDir };
      return { column: null, direction: 'asc' };
    });
  };

  const setClassColumnOrder = (col: ClassSortCol, value: string) => {
    if (value === 'default') {
      if (classSort.column === col) setClassSort({ column: null, direction: 'asc' });
    } else {
      setClassSort({ column: col, direction: value as 'asc' | 'desc' });
    }
  };

  const resetClassFiltersAndSort = () => {
    setClassSort({ column: null, direction: 'asc' });
    setClassColFilters({
      student: '',
      tier: 'all',
      gameLevel: 'all',
      decks: 'all',
      syllabus: 'all',
      trafficLights: 'all',
      quizScores: 'all',
      weakTopics: '',
      lastActive: 'all'
    });
  };

  const hasActiveClassFiltersOrSort =
    classSort.column !== null ||
    classColFilters.student.trim() !== '' ||
    classColFilters.tier !== 'all' ||
    classColFilters.gameLevel !== 'all' ||
    classColFilters.decks !== 'all' ||
    classColFilters.syllabus !== 'all' ||
    classColFilters.trafficLights !== 'all' ||
    classColFilters.quizScores !== 'all' ||
    classColFilters.weakTopics.trim() !== '' ||
    classColFilters.lastActive !== 'all';

  const enrichedClassStudents = useMemo(() => {
    return classStudents.map(std => {
      const bioPct = std.quizScores?.biology && std.quizScores.biology.total > 0
        ? Math.round((std.quizScores.biology.score / std.quizScores.biology.total) * 100)
        : null;
      const chemPct = std.quizScores?.chemistry && std.quizScores.chemistry.total > 0
        ? Math.round((std.quizScores.chemistry.score / std.quizScores.chemistry.total) * 100)
        : null;
      const physPct = std.quizScores?.physics && std.quizScores.physics.total > 0
        ? Math.round((std.quizScores.physics.score / std.quizScores.physics.total) * 100)
        : null;
      const takenScores = [bioPct, chemPct, physPct].filter((v): v is number => v !== null);
      const avgQuizPct = takenScores.length > 0
        ? Math.round(takenScores.reduce((a, b) => a + b, 0) / takenScores.length)
        : null;

      const studentDecksSet = new Set<string>([
        ...(std.completedLessons || []),
        ...Object.keys(std.trafficLights || {}),
        ...Object.keys(std.subtopicQuizScores || {})
      ]);
      const decksCompleted = Math.max(std.completedLessonsCount || 0, studentDecksSet.size);
      const slideDeckPct = Math.min(100, Math.round((decksCompleted / 106) * 100));
      const syllabusPct = Math.min(100, Math.round((studentDecksSet.size / 106) * 100));

      const greenCount = Object.values(std.trafficLights || {}).filter(t => t === 'green').length;
      const orangeCount = Object.values(std.trafficLights || {}).filter(t => t === 'orange').length;
      const redCount = Object.values(std.trafficLights || {}).filter(t => t === 'red').length;
      const totalTL = greenCount + orangeCount + redCount;
      const lastActiveMs = std.lastActive ? new Date(std.lastActive).getTime() : 0;

      const gameProfile = studentGameProfiles[std.studentId];
      const levelInfo = calculateLevelFromXP(gameProfile?.xp ?? std.xp ?? 0);
      const gameLevel = Math.max(gameProfile?.level || 1, levelInfo.level);
      const goldBalance = gameProfile?.gold ?? 100;
      const unlockedSkinsCount = ALL_FANTASY_SKINS.filter(
        s => s.id === 'cultist' || (gameProfile?.unlockedSkins || []).includes(s.id)
      ).length;
      const unlockedWeaponsCount = ALL_WEAPON_ITEMS.filter(
        w => w.price === 0 || w.id === 'wpn_starter_blaster' || w.id === 'bunsen_burner' || (gameProfile?.inventory || []).includes(w.id)
      ).length;
      const pendingPacksCount = Object.values(gameProfile?.giftedPacks || {}).reduce(
        (sum, n) => sum + Math.max(0, Number(n) || 0),
        0
      );

      return {
        std,
        bioPct,
        chemPct,
        physPct,
        avgQuizPct,
        decksCompleted,
        slideDeckPct,
        syllabusPct,
        greenCount,
        orangeCount,
        redCount,
        totalTL,
        lastActiveMs: Number.isFinite(lastActiveMs) ? lastActiveMs : 0,
        gameProfile,
        gameLevel,
        goldBalance,
        unlockedSkinsCount,
        unlockedWeaponsCount,
        pendingPacksCount
      };
    });
  }, [classStudents, studentGameProfiles]);

  const displayedClassStudents = useMemo(() => {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    const filtered = enrichedClassStudents.filter(row => {
      const { std } = row;
      if (classColFilters.student.trim()) {
        const q = classColFilters.student.toLowerCase();
        const matchName = (std.name || '').toLowerCase().includes(q);
        const matchEmail = (std.email || '').toLowerCase().includes(q);
        if (!matchName && !matchEmail) return false;
      }
      if (classColFilters.tier !== 'all' && (std.tier || 'Extended') !== classColFilters.tier) {
        return false;
      }
      if (classColFilters.gameLevel !== 'all') {
        if (classColFilters.gameLevel === 'has_packs' && row.pendingPacksCount === 0) return false;
        if (classColFilters.gameLevel === 'lv5_plus' && row.gameLevel < 5) return false;
        if (classColFilters.gameLevel === 'high_gold' && row.goldBalance < 250) return false;
      }
      if (classColFilters.decks !== 'all') {
        if (classColFilters.decks === 'zero' && row.decksCompleted !== 0) return false;
        if (classColFilters.decks === 'low' && (row.slideDeckPct < 1 || row.slideDeckPct > 25)) return false;
        if (classColFilters.decks === 'mid' && (row.slideDeckPct < 26 || row.slideDeckPct > 74)) return false;
        if (classColFilters.decks === 'high' && row.slideDeckPct < 75) return false;
      }
      if (classColFilters.syllabus !== 'all') {
        if (classColFilters.syllabus === 'zero' && row.syllabusPct !== 0) return false;
        if (classColFilters.syllabus === 'low' && (row.syllabusPct < 1 || row.syllabusPct > 34)) return false;
        if (classColFilters.syllabus === 'mid' && (row.syllabusPct < 35 || row.syllabusPct > 74)) return false;
        if (classColFilters.syllabus === 'high' && row.syllabusPct < 75) return false;
      }
      if (classColFilters.trafficLights !== 'all') {
        if (classColFilters.trafficLights === 'has_green' && row.greenCount === 0) return false;
        if (classColFilters.trafficLights === 'has_amber' && row.orangeCount === 0) return false;
        if (classColFilters.trafficLights === 'has_red' && row.redCount === 0) return false;
        if (classColFilters.trafficLights === 'unrated' && row.totalTL > 0) return false;
      }
      if (classColFilters.quizScores !== 'all') {
        if (classColFilters.quizScores === 'none' && row.avgQuizPct !== null) return false;
        if (classColFilters.quizScores === 'high' && (row.avgQuizPct === null || row.avgQuizPct < 80)) return false;
        if (classColFilters.quizScores === 'mid' && (row.avgQuizPct === null || row.avgQuizPct < 50 || row.avgQuizPct >= 80)) return false;
        if (classColFilters.quizScores === 'low' && (row.avgQuizPct === null || row.avgQuizPct >= 50)) return false;
        if (classColFilters.quizScores === 'has_bio' && row.bioPct === null) return false;
        if (classColFilters.quizScores === 'has_chem' && row.chemPct === null) return false;
        if (classColFilters.quizScores === 'has_phys' && row.physPct === null) return false;
      }
      if (classColFilters.weakTopics.trim()) {
        const q = classColFilters.weakTopics.toLowerCase();
        const weakText = (std.weakTopics && std.weakTopics.length > 0 ? std.weakTopics.join(', ') : 'none flagged').toLowerCase();
        if (!weakText.includes(q)) return false;
      }
      if (classColFilters.lastActive !== 'all') {
        const diff = row.lastActiveMs ? now - row.lastActiveMs : Infinity;
        if (classColFilters.lastActive === 'today' && diff > dayMs) return false;
        if (classColFilters.lastActive === 'week' && diff > 7 * dayMs) return false;
        if (classColFilters.lastActive === 'month' && diff > 30 * dayMs) return false;
        if (classColFilters.lastActive === 'older' && diff <= 30 * dayMs) return false;
      }
      return true;
    });

    if (!classSort.column) return filtered;

    const dir = classSort.direction === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      switch (classSort.column) {
        case 'name':
          return dir * (a.std.name || '').localeCompare(b.std.name || '', undefined, { sensitivity: 'base' });
        case 'tier':
          return dir * (a.std.tier || 'Extended').localeCompare(b.std.tier || 'Extended');
        case 'gameLevel': {
          if (a.gameLevel !== b.gameLevel) return dir * (a.gameLevel - b.gameLevel);
          return dir * (a.goldBalance - b.goldBalance);
        }
        case 'decks':
          return dir * (a.decksCompleted - b.decksCompleted);
        case 'syllabus':
          return dir * (a.syllabusPct - b.syllabusPct);
        case 'trafficLights': {
          const scoreA = a.greenCount * 10000 + a.orangeCount * 100 - a.redCount;
          const scoreB = b.greenCount * 10000 + b.orangeCount * 100 - b.redCount;
          return dir * (scoreA - scoreB);
        }
        case 'quizScores':
          return dir * ((a.avgQuizPct ?? -1) - (b.avgQuizPct ?? -1));
        case 'weakTopics': {
          const lenA = a.std.weakTopics?.length || 0;
          const lenB = b.std.weakTopics?.length || 0;
          if (lenA !== lenB) return dir * (lenA - lenB);
          return dir * (a.std.weakTopics?.join(', ') || '').localeCompare(b.std.weakTopics?.join(', ') || '');
        }
        case 'lastActive':
          return dir * (a.lastActiveMs - b.lastActiveMs);
        default:
          return 0;
      }
    });
  }, [enrichedClassStudents, classColFilters, classSort]);

  const isCohortNumericCol = (col: CohortSortCol) =>
    col === 'slideDecks' || col === 'syllabusPct' || col === 'bioScore' || col === 'chemScore' || col === 'physScore';

  const toggleCohortSort = (col: CohortSortCol) => {
    const firstDir: 'asc' | 'desc' = isCohortNumericCol(col) ? 'desc' : 'asc';
    const secondDir: 'asc' | 'desc' = firstDir === 'asc' ? 'desc' : 'asc';
    setCohortSort(prev => {
      if (prev.column !== col) return { column: col, direction: firstDir };
      if (prev.direction === firstDir) return { column: col, direction: secondDir };
      return { column: null, direction: 'asc' };
    });
  };

  const setCohortColumnOrder = (col: CohortSortCol, value: string) => {
    if (value === 'default') {
      if (cohortSort.column === col) setCohortSort({ column: null, direction: 'asc' });
    } else {
      setCohortSort({ column: col, direction: value as 'asc' | 'desc' });
    }
  };

  const resetCohortFiltersAndSort = () => {
    setCohortSort({ column: null, direction: 'asc' });
    setSearchTerm('');
    setTierFilter('all');
    setStatusFilter('all');
    setCohortColFilters({
      name: '',
      slideDecks: 'all',
      syllabusPct: 'all',
      bioScore: 'all',
      chemScore: 'all',
      physScore: 'all',
      weakArea: ''
    });
  };

  const hasActiveCohortFiltersOrSort =
    cohortSort.column !== null ||
    searchTerm.trim() !== '' ||
    tierFilter !== 'all' ||
    statusFilter !== 'all' ||
    cohortColFilters.name.trim() !== '' ||
    cohortColFilters.slideDecks !== 'all' ||
    cohortColFilters.syllabusPct !== 'all' ||
    cohortColFilters.bioScore !== 'all' ||
    cohortColFilters.chemScore !== 'all' ||
    cohortColFilters.physScore !== 'all' ||
    cohortColFilters.weakArea.trim() !== '';

  const matchScoreRangeFilter = (val: number, filterVal: 'all' | 'high' | 'mid' | 'low' | 'zero') => {
    if (filterVal === 'all') return true;
    if (filterVal === 'high') return val >= 80;
    if (filterVal === 'mid') return val >= 50 && val < 80;
    if (filterVal === 'low') return val >= 1 && val < 50;
    if (filterVal === 'zero') return val === 0;
    return true;
  };

  const filteredStudents = useMemo(() => {
    const filtered = rosterStudents.filter(student => {
      const matchSearch = !searchTerm.trim() ||
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.weakArea.toLowerCase().includes(searchTerm.toLowerCase());
      const matchNameCol = !cohortColFilters.name.trim() ||
        student.name.toLowerCase().includes(cohortColFilters.name.toLowerCase());
      const matchTier = tierFilter === 'all' || student.tier === tierFilter;
      const matchStatus = statusFilter === 'all' || student.status === statusFilter;

      const matchDecks =
        cohortColFilters.slideDecks === 'all' ||
        (cohortColFilters.slideDecks === 'zero' && student.slideDeckCount === 0) ||
        (cohortColFilters.slideDecks === 'low' && student.slideDeckPct >= 1 && student.slideDeckPct <= 25) ||
        (cohortColFilters.slideDecks === 'mid' && student.slideDeckPct >= 26 && student.slideDeckPct <= 74) ||
        (cohortColFilters.slideDecks === 'high' && student.slideDeckPct >= 75);

      const matchSyllabus =
        cohortColFilters.syllabusPct === 'all' ||
        (cohortColFilters.syllabusPct === 'zero' && student.syllabusPct === 0) ||
        (cohortColFilters.syllabusPct === 'low' && student.syllabusPct >= 1 && student.syllabusPct <= 34) ||
        (cohortColFilters.syllabusPct === 'mid' && student.syllabusPct >= 35 && student.syllabusPct <= 74) ||
        (cohortColFilters.syllabusPct === 'high' && student.syllabusPct >= 75);

      const matchBio = matchScoreRangeFilter(student.bioScore, cohortColFilters.bioScore);
      const matchChem = matchScoreRangeFilter(student.chemScore, cohortColFilters.chemScore);
      const matchPhys = matchScoreRangeFilter(student.physScore, cohortColFilters.physScore);
      const matchWeakCol = !cohortColFilters.weakArea.trim() ||
        student.weakArea.toLowerCase().includes(cohortColFilters.weakArea.toLowerCase());

      return matchSearch && matchNameCol && matchTier && matchStatus && matchDecks && matchSyllabus && matchBio && matchChem && matchPhys && matchWeakCol;
    });

    if (!cohortSort.column) return filtered;

    const dir = cohortSort.direction === 'asc' ? 1 : -1;
    const statusRank: Record<StudentRosterItem['status'], number> = {
      'Intervention Required': 0,
      'On Track': 1,
      'Excelling': 2
    };

    return [...filtered].sort((a, b) => {
      switch (cohortSort.column) {
        case 'name':
          return dir * a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
        case 'tier':
          return dir * a.tier.localeCompare(b.tier);
        case 'slideDecks':
          return dir * (a.slideDeckCount - b.slideDeckCount);
        case 'syllabusPct':
          return dir * (a.syllabusPct - b.syllabusPct);
        case 'bioScore':
          return dir * (a.bioScore - b.bioScore);
        case 'chemScore':
          return dir * (a.chemScore - b.chemScore);
        case 'physScore':
          return dir * (a.physScore - b.physScore);
        case 'weakArea': {
          const noneA = a.weakArea === 'None identified' ? 0 : 1;
          const noneB = b.weakArea === 'None identified' ? 0 : 1;
          if (noneA !== noneB) return dir * (noneA - noneB);
          return dir * a.weakArea.localeCompare(b.weakArea, undefined, { sensitivity: 'base' });
        }
        case 'status':
          return dir * (statusRank[a.status] - statusRank[b.status]);
        default:
          return 0;
      }
    });
  }, [rosterStudents, searchTerm, tierFilter, statusFilter, cohortColFilters, cohortSort]);

  const filteredSlides = slidesSubtopics.filter(s => {
    if (!slidesSearchTerm.trim()) return true;
    const q = slidesSearchTerm.toLowerCase();
    return s.title.toLowerCase().includes(q) || s.topicCode.toLowerCase().includes(q) || s.subject.toLowerCase().includes(q);
  });

  const avgProgress = rosterStudents.length > 0
    ? Math.round(rosterStudents.reduce((acc, s) => acc + s.progressPct, 0) / rosterStudents.length)
    : 0;
  const avgSlideDeckPct = rosterStudents.length > 0
    ? Math.round(rosterStudents.reduce((acc, s) => acc + s.slideDeckPct, 0) / rosterStudents.length)
    : 0;
  const avgSyllabusPct = rosterStudents.length > 0
    ? Math.round(rosterStudents.reduce((acc, s) => acc + s.syllabusPct, 0) / rosterStudents.length)
    : 0;
  const avgSlideCount = rosterStudents.length > 0
    ? Math.round(rosterStudents.reduce((acc, s) => acc + s.slideDeckCount, 0) / rosterStudents.length)
    : 0;
  const avgBio = rosterStudents.length > 0
    ? Math.round(rosterStudents.reduce((acc, s) => acc + s.bioScore, 0) / rosterStudents.length)
    : 0;
  const avgChem = rosterStudents.length > 0
    ? Math.round(rosterStudents.reduce((acc, s) => acc + s.chemScore, 0) / rosterStudents.length)
    : 0;
  const avgPhys = rosterStudents.length > 0
    ? Math.round(rosterStudents.reduce((acc, s) => acc + s.physScore, 0) / rosterStudents.length)
    : 0;
  const interventionCount = rosterStudents.filter(s => s.status === 'Intervention Required').length;

  const handleExportCSV = () => {
    if (rosterStudents.length === 0) return;
    const headers = ['ID,Name,Tier,Progress%,BioScore,ChemScore,PhysScore,WeakArea,Status'];
    const rows = rosterStudents.map(s => 
      `${s.id},"${s.name}",${s.tier},${s.progressPct},${s.bioScore},${s.chemScore},${s.physScore},"${s.weakArea}",${s.status}`
    );
    const csvContent = headers.concat(rows).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedClass?.name ? selectedClass.name.replace(/[^a-zA-Z0-9]/g, '_') : 'Class'}-Student-Roster.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSendReminder = (name: string) => {
    setActionNotice(`Sent automated revision reminder & practice worksheet to ${name}`);
    setTimeout(() => setActionNotice(null), 3500);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner with Clear Instructor Status */}
      <div className="bg-white dark:bg-black border border-[#E2E8F0] dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#EBF3F5] dark:bg-zinc-900 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-zinc-700">
              Instructor & Administrative View
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Signed in as: <span className="text-slate-900 dark:text-white font-bold">{currentUser.name}</span> ({currentUser.email})
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Users className="w-6 h-6 text-slate-800 dark:text-slate-200" />
            <span>Instructor Teaching & Class Management Hub</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
            Create classes with shareable join codes, track student progress live across Cambridge units, invite fellow instructors, and manage Google Drive lesson folders.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {onNavigateToLeaderboard && (
            <button
              onClick={onNavigateToLeaderboard}
              className="text-xs px-3.5 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 border-2 border-black font-bold flex items-center gap-2 transition shadow-xs cursor-pointer"
              title="Inspect live class leaderboards and student performance rankings"
            >
              <Trophy className="w-4 h-4 text-amber-800" />
              <span>Class Leaderboard</span>
            </button>
          )}

          {onNavigateToRoyale && (
            <button
              onClick={onNavigateToRoyale}
              className="text-xs px-3.5 py-2 rounded-xl bg-[#FDFBF7] dark:bg-zinc-900 hover:bg-[#EBF3F5] dark:hover:bg-zinc-800 text-slate-900 dark:text-white border-2 border-black dark:border-white font-bold flex items-center gap-2 transition shadow-xs cursor-pointer"
              title="Open Admin Battle Control: Open/Close Student Lobby, start Royale match & manage quiz questions"
            >
              <Swords className="w-4 h-4 text-slate-900 dark:text-white" />
              <span>Royale Battle Control</span>
            </button>
          )}

          {onSwitchToStudentMode && (
            <button
              onClick={onSwitchToStudentMode}
              className="text-xs px-3.5 py-2 rounded-xl bg-[#EBF3F5] dark:bg-zinc-900 hover:bg-[#FDFBF7] dark:hover:bg-zinc-800 text-slate-900 dark:text-white border-2 border-black dark:border-white font-bold flex items-center gap-2 transition shadow-xs"
              title="Preview the simplified student revision interface"
            >
              <GraduationCap className="w-4 h-4 text-slate-900 dark:text-white" />
              <span>Preview Student View</span>
            </button>
          )}

          <button
            onClick={() => setShowCreateModal(true)}
            className="text-xs px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-black font-bold flex items-center gap-2 transition shadow-xs border border-black"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Class</span>
          </button>
        </div>
      </div>

      {actionNotice && (
        <div className="bg-[#EBF3F5] dark:bg-zinc-900 border-2 border-black dark:border-white text-slate-900 dark:text-slate-100 text-xs p-3.5 rounded-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="font-bold">{actionNotice}</span>
        </div>
      )}

      {/* Dashboard Section Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-zinc-800 pb-3 flex-wrap">
        <button
          onClick={() => setDashboardTab('classes')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            dashboardTab === 'classes'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-xs border border-black dark:border-white'
              : 'bg-white dark:bg-black text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>My Classes & Students ({classes.length})</span>
        </button>

        <button
          onClick={() => setDashboardTab('tasks')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            dashboardTab === 'tasks'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-xs border border-black dark:border-white'
              : 'bg-white dark:bg-black text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Class Tasks & Homework</span>
        </button>

        <button
          onClick={() => setDashboardTab('task_analytics')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            dashboardTab === 'task_analytics'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-xs border border-black dark:border-white'
              : 'bg-white dark:bg-black text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-900'
          }`}
        >
          <ClipboardCheck className="w-4 h-4" />
          <span>Task Analytics</span>
        </button>

        <button
          onClick={() => setDashboardTab('cohort')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            (dashboardTab === 'cohort' || dashboardTab === 'roster')
              ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-xs border border-black dark:border-white'
              : 'bg-white dark:bg-black text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-900'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Cohort Progress & Analytics</span>
        </button>

        <button
          onClick={() => setDashboardTab('invites')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            dashboardTab === 'invites'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-xs border border-black dark:border-white'
              : 'bg-white dark:bg-black text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-900'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>Instructor Team & Invites</span>
        </button>

        <button
          onClick={() => setDashboardTab('drive')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            dashboardTab === 'drive'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-xs border border-black dark:border-white'
              : 'bg-white dark:bg-black text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-900'
          }`}
        >
          <FolderSync className="w-4 h-4" />
          <span>Google Drive Folder & Sync Center ({syncedDriveSlides.length})</span>
        </button>

        <button
          onClick={() => setDashboardTab('slides')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            dashboardTab === 'slides'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-xs border border-black dark:border-white'
              : 'bg-white dark:bg-black text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-900'
          }`}
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Google Slides Curriculum</span>
        </button>
      </div>

      {/* ============================================================= */}
      {/* TAB 1: CLASSES & STUDENT PROGRESS TRACKING                    */}
      {/* ============================================================= */}
      {dashboardTab === 'classes' && (
        <div className="space-y-6">
          {/* Header row with Class Cards */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-slate-800 dark:text-slate-200" />
                <span>Active Classes Created by You</span>
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Each class has a unique Class Code. Give this code to your students to track their real-time progress.
              </p>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-black text-xs font-bold rounded-xl flex items-center gap-2 self-start transition shadow-xs border border-black"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Class</span>
            </button>
          </div>

          {loadingClasses ? (
            <div className="p-8 text-center bg-white dark:bg-black border border-[#E2E8F0] dark:border-zinc-800 rounded-2xl shadow-xs">
              <div className="w-6 h-6 border-2 border-black dark:border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Loading your classes...</span>
            </div>
          ) : classes.length === 0 ? (
            <div className="p-10 text-center bg-white dark:bg-black border border-dashed border-slate-300 dark:border-zinc-800 rounded-2xl shadow-xs space-y-4">
              <BookOpen className="w-12 h-12 text-slate-400 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">No classes created yet</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                  Create your first class with a specific class code so students can join and you can monitor their progress.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-black text-xs font-bold transition shadow-xs border border-black"
              >
                Create Class Now
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Class Selector Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {classes.map(c => {
                  const isSelected = selectedClass?.id === c.id;
                  const isOwner = c.instructorEmail?.toLowerCase() === currentUser.email?.toLowerCase() || c.instructorId === currentUser.id;
                  const sharedCount = c.sharedInstructorEmails?.length || 0;

                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedClass(c)}
                      className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#EBF3F5] dark:bg-zinc-900 border-2 border-black dark:border-white shadow-xs'
                          : 'bg-white dark:bg-black border-[#E2E8F0] dark:border-zinc-800 hover:border-slate-400'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#FDFBF7] dark:bg-black text-slate-900 dark:text-white border-2 border-black dark:border-white">
                              {c.classCode}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#EBF3F5] dark:bg-zinc-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-zinc-700">
                              {isOwner ? 'Class Owner' : 'Co-Instructor'}
                            </span>
                            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                              {c.subject}
                            </span>
                          </div>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">{c.name}</h3>
                          {c.description && (
                            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1">{c.description}</p>
                          )}
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClass(c.id, c.name);
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 transition"
                          title="Delete class"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between text-xs gap-2 flex-wrap">
                        <span className="text-slate-600 dark:text-slate-400 font-medium">
                          <span className="font-bold text-slate-900 dark:text-white">{c.studentCount || 0}</span> enrolled
                          {sharedCount > 0 ? (
                            <span className="text-slate-700 dark:text-slate-300 ml-1.5">• {sharedCount} co-teacher{sharedCount > 1 ? 's' : ''}</span>
                          ) : (
                            <span className="text-slate-500 ml-1.5">• Sole teacher</span>
                          )}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setClassToShare(c);
                              setShowShareModal(true);
                            }}
                            className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-white dark:bg-black hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-800 dark:text-slate-200 border border-black dark:border-white font-bold transition"
                            title="Share class with other instructors so you can collaborate on tasks & analytics"
                          >
                            <Users className="w-3 h-3" />
                            <span>Share</span>
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyCode(c.classCode);
                            }}
                            className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg bg-[#FDFBF7] dark:bg-zinc-900 hover:bg-[#EBF3F5] text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-zinc-700 font-bold transition"
                            title="Copy class code to share with students"
                          >
                            {copiedCode === c.classCode ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                <span className="text-emerald-700 dark:text-emerald-400 font-bold">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Code</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Class Student Roster & Live Tracking */}
              {selectedClass && (
                <div className="bg-white dark:bg-black border border-[#E2E8F0] dark:border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
                  {/* Class Header Bar */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-zinc-800">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#EBF3F5] dark:bg-zinc-900 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-zinc-700">
                          Class Tracking Dashboard
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-900 dark:text-white px-2 py-0.5 rounded bg-[#FDFBF7] dark:bg-zinc-900 border-2 border-black dark:border-white">
                          Code: {selectedClass.classCode}
                        </span>
                        {selectedClass.instructorEmail?.toLowerCase() === currentUser.email?.toLowerCase() ? (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#EBF3F5] dark:bg-zinc-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-zinc-700">
                            You are the Owner
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-zinc-700">
                            Shared with you
                          </span>
                        )}
                      </div>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selectedClass.name}</h2>
                      <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 flex-wrap">
                        <span>
                          Created by: <strong className="text-slate-900 dark:text-white">{selectedClass.instructorName || selectedClass.instructorEmail}</strong>
                        </span>
                        {selectedClass.sharedInstructors && selectedClass.sharedInstructors.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-slate-500">• Co-Teachers:</span>
                            {selectedClass.sharedInstructors.map(inst => (
                              <span key={inst.email} className="px-2 py-0.5 rounded-md bg-[#FDFBF7] dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 text-slate-800 dark:text-slate-200 text-[10px] font-bold flex items-center gap-1">
                                <UserCheck className="w-3 h-3" />
                                <span>{inst.email}</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap">
                      <button
                        onClick={() => {
                          setClassToShare(selectedClass);
                          setShowShareModal(true);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-black text-xs font-bold flex items-center gap-1.5 transition shadow-xs border border-black"
                        title="Share this class with other instructors so they can add tasks and track the same progress"
                      >
                        <Users className="w-4 h-4" />
                        <span>Share Class {selectedClass.sharedInstructorEmails?.length ? `(${selectedClass.sharedInstructorEmails.length})` : ''}</span>
                      </button>

                      <button
                        onClick={() => handleCopyCode(selectedClass.classCode)}
                        className="px-3.5 py-2 rounded-xl bg-white dark:bg-black hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-900 dark:text-white border-2 border-black dark:border-white text-xs font-bold flex items-center gap-1.5 transition"
                      >
                        {copiedCode === selectedClass.classCode ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-emerald-700 dark:text-emerald-400 font-bold">Code Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span>Copy Code ({selectedClass.classCode})</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={handleExportClassCSV}
                        disabled={classStudents.length === 0}
                        className="px-3.5 py-2 rounded-xl bg-[#FDFBF7] dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-800 dark:text-slate-200 border border-black dark:border-white text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-50"
                      >
                        <FileDown className="w-4 h-4" />
                        <span>Export CSV</span>
                      </button>
                    </div>
                  </div>

                  {/* Summary Metric Chips with Live Slide Deck Completion & Syllabus % */}
                  {(() => {
                    const totalStudents = classStudents.length;
                    const totalDecksSum = classStudents.reduce((acc, s) => acc + (s.completedLessonsCount || 0), 0);
                    const avgDecksPerStudent = totalStudents > 0 ? Math.round((totalDecksSum / totalStudents) * 10) / 10 : 0;
                    const classAvgSlidePct = totalStudents > 0
                      ? Math.round(classStudents.reduce((acc, s) => acc + Math.min(100, Math.round(((s.completedLessonsCount || 0) / 106) * 100)), 0) / totalStudents)
                      : 0;
                    const classAvgSyllabusPct = totalStudents > 0
                      ? Math.round(classStudents.reduce((acc, s) => {
                          const covered = Math.max(
                            s.completedLessonsCount || 0,
                            Math.max(Object.keys(s.trafficLights || {}).length, Object.keys(s.subtopicQuizScores || {}).length)
                          );
                          return acc + Math.min(100, Math.round((covered / 106) * 100));
                        }, 0) / totalStudents)
                      : 0;
                    const classAvgQuiz = totalStudents > 0
                      ? Math.round(classStudents.reduce((acc, s) => {
                          const scores = Object.values(s.quizScores || {});
                          if (scores.length === 0) return acc;
                          const studentAvg = scores.reduce((a, b) => a + (b.score / (b.total || 1)), 0) / scores.length;
                          return acc + (studentAvg * 100);
                        }, 0) / totalStudents)
                      : 0;

                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-[#FDFBF7] dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4">
                          <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Enrolled Students</span>
                          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1 font-mono">{totalStudents}</div>
                          <span className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 block font-medium">Joined via code {selectedClass.classCode}</span>
                        </div>

                        <div className="bg-[#FDFBF7] dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4">
                          <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Avg Slide Deck Completion</span>
                          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1 font-mono">{classAvgSlidePct}%</div>
                          <span className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 block font-medium">{avgDecksPerStudent} of 106 decks read avg</span>
                        </div>

                        <div className="bg-[#FDFBF7] dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4">
                          <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Avg Syllabus Coverage</span>
                          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1 font-mono">{classAvgSyllabusPct}%</div>
                          <span className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 block font-medium">Combined slides & quiz checks</span>
                        </div>

                        <div className="bg-[#FDFBF7] dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4">
                          <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Class Average Quiz Score</span>
                          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1 font-mono">{classAvgQuiz}%</div>
                          <span className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 block font-medium">Across Bio, Chem & Physics</span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Students Table */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
                      <span>Enrolled Students & Progress Breakdown</span>
                      <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span>Live real-time student updates</span>
                      </span>
                    </h3>

                    {loadingStudents ? (
                      <div className="p-8 text-center text-slate-600 dark:text-slate-400 bg-[#FDFBF7] dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800">
                        <div className="w-5 h-5 border-2 border-black dark:border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <span className="text-xs font-medium">Loading class student roster...</span>
                      </div>
                    ) : classStudents.length === 0 ? (
                      <div className="p-8 text-center bg-[#FDFBF7] dark:bg-zinc-900 border border-dashed border-slate-300 dark:border-zinc-800 rounded-2xl space-y-2">
                        <Users className="w-8 h-8 text-slate-400 mx-auto" />
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">No students enrolled yet</h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
                          Tell students to log in and enter class code <span className="font-mono text-slate-900 dark:text-white font-bold bg-[#EBF3F5] dark:bg-black px-2 py-0.5 rounded border border-black dark:border-white">{selectedClass.classCode}</span> in "My Classes".
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {/* Batch Action Toolbar */}
                        {selectedStudentIdsForBatch.size > 0 && (
                          <div className="flex items-center justify-between p-3 rounded-xl bg-[#EBF3F5] dark:bg-zinc-900 border-2 border-black dark:border-white text-xs animate-in fade-in">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-slate-900 dark:bg-white"></span>
                              <span className="font-bold text-slate-900 dark:text-white">
                                {selectedStudentIdsForBatch.size} {selectedStudentIdsForBatch.size === 1 ? 'student' : 'students'} selected
                              </span>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <button
                                type="button"
                                onClick={() => {
                                  const selected = classStudents
                                    .filter(s => selectedStudentIdsForBatch.has(s.studentId))
                                    .map(s => ({ studentId: s.studentId, name: s.name, email: s.email }));
                                  openRewardModal(selected, 'booster_pack');
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold transition shadow-xs border border-emerald-800 cursor-pointer"
                              >
                                <Gift className="w-3.5 h-3.5" />
                                <span>Reward Selected</span>
                              </button>
                              <button
                                type="button"
                                onClick={handleOpenMoveModalBatch}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-black font-bold transition shadow-xs border border-black"
                              >
                                <ArrowRightLeft className="w-3.5 h-3.5" />
                                <span>Move Selected to Another Class</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setSelectedStudentIdsForBatch(new Set())}
                                className="px-2.5 py-1.5 rounded-lg text-slate-800 dark:text-slate-200 bg-white dark:bg-black hover:bg-slate-100 dark:hover:bg-zinc-800 font-bold border border-black dark:border-white transition"
                              >
                                Clear Selection
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Filter Summary & Reset Bar */}
                        <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs">
                          <span className="text-slate-600 dark:text-slate-400 font-medium">
                            Showing <strong className="text-slate-900 dark:text-white">{displayedClassStudents.length}</strong> of <strong className="text-slate-900 dark:text-white">{classStudents.length}</strong> student{classStudents.length === 1 ? '' : 's'}
                            {classSort.column && (
                              <span className="ml-2 text-[11px] text-slate-500 dark:text-slate-400">
                                • Ordered by <strong className="text-slate-800 dark:text-slate-200">{classSort.column}</strong> ({isClassNumericCol(classSort.column) ? (classSort.direction === 'desc' ? 'High → Low' : 'Low → High') : (classSort.direction === 'asc' ? 'A → Z' : 'Z → A')})
                              </span>
                            )}
                          </span>
                          {hasActiveClassFiltersOrSort && (
                            <button
                              type="button"
                              onClick={resetClassFiltersAndSort}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FDFBF7] dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-zinc-700 text-[11px] font-bold transition"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Reset Filters &amp; Order</span>
                            </button>
                          )}
                        </div>

                        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-zinc-800">
                          <table className="min-w-full text-xs text-left text-slate-800 dark:text-slate-200">
                            <thead className="bg-[#FDFBF7] dark:bg-zinc-900 text-slate-700 dark:text-slate-300 font-bold text-[11px] tracking-wider border-b border-slate-200 dark:border-zinc-800">
                              <tr>
                                <th className="p-3 w-8">
                                  <input
                                    type="checkbox"
                                    checked={displayedClassStudents.length > 0 && displayedClassStudents.every(r => selectedStudentIdsForBatch.has(r.std.studentId))}
                                    onChange={() => toggleSelectAllStudents(displayedClassStudents.map(r => r.std.studentId))}
                                    title="Select all visible students for batch action"
                                    className="rounded border-black dark:border-white bg-[#FDFBF7] dark:bg-black text-slate-900 w-3.5 h-3.5 cursor-pointer"
                                  />
                                </th>
                                <th className="p-3">
                                  <button type="button" onClick={() => toggleClassSort('name')} className="inline-flex items-center gap-1 hover:text-black dark:hover:text-white transition text-left">
                                    <span>Student</span>
                                    {classSort.column === 'name' ? (
                                      <span className="inline-flex items-center gap-0.5 text-[10px] font-mono bg-slate-900 text-white dark:bg-white dark:text-black px-1 py-0.5 rounded">
                                        {classSort.direction === 'asc' ? 'A→Z' : 'Z→A'}
                                      </span>
                                    ) : <ArrowUpDown className="w-3 h-3 opacity-40" />}
                                  </button>
                                </th>
                                <th className="p-3">
                                  <button type="button" onClick={() => toggleClassSort('tier')} className="inline-flex items-center gap-1 hover:text-black dark:hover:text-white transition text-left">
                                    <span>Tier</span>
                                    {classSort.column === 'tier' ? (classSort.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-40" />}
                                  </button>
                                </th>
                                <th className="p-3">
                                  <button type="button" onClick={() => toggleClassSort('gameLevel')} className="inline-flex items-center gap-1 hover:text-black dark:hover:text-white transition text-left">
                                    <span>Level &amp; Loadout</span>
                                    {classSort.column === 'gameLevel' ? (
                                      <span className="inline-flex items-center gap-0.5 text-[10px] font-mono bg-slate-900 text-white dark:bg-white dark:text-black px-1 py-0.5 rounded">
                                        {classSort.direction === 'desc' ? 'Hi→Lo' : 'Lo→Hi'}
                                      </span>
                                    ) : <ArrowUpDown className="w-3 h-3 opacity-40" />}
                                  </button>
                                </th>
                                <th className="p-3">
                                  <button type="button" onClick={() => toggleClassSort('decks')} className="inline-flex items-center gap-1 hover:text-black dark:hover:text-white transition text-left">
                                    <span>Slide Decks Completed</span>
                                    {classSort.column === 'decks' ? (
                                      <span className="inline-flex items-center gap-0.5 text-[10px] font-mono bg-slate-900 text-white dark:bg-white dark:text-black px-1 py-0.5 rounded">
                                        {classSort.direction === 'desc' ? 'Hi→Lo' : 'Lo→Hi'}
                                      </span>
                                    ) : <ArrowUpDown className="w-3 h-3 opacity-40" />}
                                  </button>
                                </th>
                                <th className="p-3">
                                  <button type="button" onClick={() => toggleClassSort('syllabus')} className="inline-flex items-center gap-1 hover:text-black dark:hover:text-white transition text-left">
                                    <span>Syllabus %</span>
                                    {classSort.column === 'syllabus' ? (
                                      <span className="inline-flex items-center gap-0.5 text-[10px] font-mono bg-slate-900 text-white dark:bg-white dark:text-black px-1 py-0.5 rounded">
                                        {classSort.direction === 'desc' ? 'Hi→Lo' : 'Lo→Hi'}
                                      </span>
                                    ) : <ArrowUpDown className="w-3 h-3 opacity-40" />}
                                  </button>
                                </th>
                                <th className="p-3">
                                  <button type="button" onClick={() => toggleClassSort('trafficLights')} className="inline-flex items-center gap-1 hover:text-black dark:hover:text-white transition text-left">
                                    <span>Traffic Lights</span>
                                    {classSort.column === 'trafficLights' ? (
                                      <span className="inline-flex items-center gap-0.5 text-[10px] font-mono bg-slate-900 text-white dark:bg-white dark:text-black px-1 py-0.5 rounded">
                                        {classSort.direction === 'desc' ? 'Hi→Lo' : 'Lo→Hi'}
                                      </span>
                                    ) : <ArrowUpDown className="w-3 h-3 opacity-40" />}
                                  </button>
                                </th>
                                <th className="p-3">
                                  <button type="button" onClick={() => toggleClassSort('quizScores')} className="inline-flex items-center gap-1 hover:text-black dark:hover:text-white transition text-left">
                                    <span>Quiz Scores</span>
                                    {classSort.column === 'quizScores' ? (
                                      <span className="inline-flex items-center gap-0.5 text-[10px] font-mono bg-slate-900 text-white dark:bg-white dark:text-black px-1 py-0.5 rounded">
                                        {classSort.direction === 'desc' ? 'Hi→Lo' : 'Lo→Hi'}
                                      </span>
                                    ) : <ArrowUpDown className="w-3 h-3 opacity-40" />}
                                  </button>
                                </th>
                                <th className="p-3">
                                  <button type="button" onClick={() => toggleClassSort('weakTopics')} className="inline-flex items-center gap-1 hover:text-black dark:hover:text-white transition text-left">
                                    <span>Weak Topics</span>
                                    {classSort.column === 'weakTopics' ? (
                                      <span className="inline-flex items-center gap-0.5 text-[10px] font-mono bg-slate-900 text-white dark:bg-white dark:text-black px-1 py-0.5 rounded">
                                        {classSort.direction === 'desc' ? 'Hi→Lo' : 'Lo→Hi'}
                                      </span>
                                    ) : <ArrowUpDown className="w-3 h-3 opacity-40" />}
                                  </button>
                                </th>
                                <th className="p-3">
                                  <button type="button" onClick={() => toggleClassSort('lastActive')} className="inline-flex items-center gap-1 hover:text-black dark:hover:text-white transition text-left">
                                    <span>Last Active</span>
                                    {classSort.column === 'lastActive' ? (classSort.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-40" />}
                                  </button>
                                </th>
                                <th className="p-3">Action</th>
                              </tr>
                              {/* Per-column inline filter & order row */}
                              <tr className="bg-slate-50/90 dark:bg-zinc-950 border-t border-slate-200 dark:border-zinc-800 font-normal align-top">
                                <th className="p-1.5 text-center pt-2.5">
                                  <Filter className="w-3 h-3 text-slate-400 mx-auto" />
                                </th>
                                <th className="p-1.5 space-y-1">
                                  <select
                                    value={classSort.column === 'name' ? classSort.direction : 'default'}
                                    onChange={e => setClassColumnOrder('name', e.target.value)}
                                    className="w-full px-1.5 py-0.5 text-xs rounded-md bg-white dark:bg-black border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-slate-100 font-semibold"
                                  >
                                    <option value="default">Order: Default</option>
                                    <option value="asc">A → Z (Alphabetical)</option>
                                    <option value="desc">Z → A (Reverse)</option>
                                  </select>
                                  <input
                                    type="text"
                                    value={classColFilters.student}
                                    onChange={e => setClassColFilters(prev => ({ ...prev, student: e.target.value }))}
                                    placeholder="Search name/email..."
                                    className="w-full min-w-[115px] px-1.5 py-0.5 text-xs rounded-md bg-white dark:bg-black border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 font-medium"
                                  />
                                </th>
                                <th className="p-1.5">
                                  <select
                                    value={classColFilters.tier}
                                    onChange={e => setClassColFilters(prev => ({ ...prev, tier: e.target.value as any }))}
                                    className="w-full px-1.5 py-0.5 text-xs rounded-md bg-white dark:bg-black border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-slate-100 font-medium"
                                  >
                                    <option value="all">All Tiers</option>
                                    <option value="Core">Core</option>
                                    <option value="Extended">Extended</option>
                                  </select>
                                </th>
                                <th className="p-1.5 space-y-1">
                                  <select
                                    value={classSort.column === 'gameLevel' ? classSort.direction : 'default'}
                                    onChange={e => setClassColumnOrder('gameLevel', e.target.value)}
                                    className="w-full px-1.5 py-0.5 text-xs rounded-md bg-white dark:bg-black border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-slate-100 font-semibold"
                                  >
                                    <option value="default">Order: Default</option>
                                    <option value="desc">High → Low</option>
                                    <option value="asc">Low → High</option>
                                  </select>
                                  <select
                                    value={classColFilters.gameLevel}
                                    onChange={e => setClassColFilters(prev => ({ ...prev, gameLevel: e.target.value as any }))}
                                    className="w-full px-1.5 py-0.5 text-xs rounded-md bg-white dark:bg-black border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-slate-100 font-medium"
                                  >
                                    <option value="all">All Loadouts</option>
                                    <option value="has_packs">Has Gifted Packs</option>
                                    <option value="lv5_plus">Level 5+</option>
                                    <option value="high_gold">250+ Gold</option>
                                  </select>
                                </th>
                                <th className="p-1.5 space-y-1">
                                  <select
                                    value={classSort.column === 'decks' ? classSort.direction : 'default'}
                                    onChange={e => setClassColumnOrder('decks', e.target.value)}
                                    className="w-full px-1.5 py-0.5 text-xs rounded-md bg-white dark:bg-black border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-slate-100 font-semibold"
                                  >
                                    <option value="default">Order: Default</option>
                                    <option value="desc">High → Low</option>
                                    <option value="asc">Low → High</option>
                                  </select>
                                  <select
                                    value={classColFilters.decks}
                                    onChange={e => setClassColFilters(prev => ({ ...prev, decks: e.target.value as any }))}
                                    className="w-full px-1.5 py-0.5 text-xs rounded-md bg-white dark:bg-black border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-slate-100 font-medium"
                                  >
                                    <option value="all">All Decks</option>
                                    <option value="high">75–100%</option>
                                    <option value="mid">26–74%</option>
                                    <option value="low">1–25%</option>
                                    <option value="zero">0 decks</option>
                                  </select>
                                </th>
                                <th className="p-1.5 space-y-1">
                                  <select
                                    value={classSort.column === 'syllabus' ? classSort.direction : 'default'}
                                    onChange={e => setClassColumnOrder('syllabus', e.target.value)}
                                    className="w-full px-1.5 py-0.5 text-xs rounded-md bg-white dark:bg-black border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-slate-100 font-semibold"
                                  >
                                    <option value="default">Order: Default</option>
                                    <option value="desc">High → Low</option>
                                    <option value="asc">Low → High</option>
                                  </select>
                                  <select
                                    value={classColFilters.syllabus}
                                    onChange={e => setClassColFilters(prev => ({ ...prev, syllabus: e.target.value as any }))}
                                    className="w-full px-1.5 py-0.5 text-xs rounded-md bg-white dark:bg-black border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-slate-100 font-medium"
                                  >
                                    <option value="all">All %</option>
                                    <option value="high">75–100%</option>
                                    <option value="mid">35–74%</option>
                                    <option value="low">1–34%</option>
                                    <option value="zero">0%</option>
                                  </select>
                                </th>
                                <th className="p-1.5 space-y-1">
                                  <select
                                    value={classSort.column === 'trafficLights' ? classSort.direction : 'default'}
                                    onChange={e => setClassColumnOrder('trafficLights', e.target.value)}
                                    className="w-full px-1.5 py-0.5 text-xs rounded-md bg-white dark:bg-black border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-slate-100 font-semibold"
                                  >
                                    <option value="default">Order: Default</option>
                                    <option value="desc">High → Low</option>
                                    <option value="asc">Low → High</option>
                                  </select>
                                  <select
                                    value={classColFilters.trafficLights}
                                    onChange={e => setClassColFilters(prev => ({ ...prev, trafficLights: e.target.value as any }))}
                                    className="w-full px-1.5 py-0.5 text-xs rounded-md bg-white dark:bg-black border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-slate-100 font-medium"
                                  >
                                    <option value="all">All Lights</option>
                                    <option value="has_green">Has Green</option>
                                    <option value="has_amber">Has Amber</option>
                                    <option value="has_red">Has Red</option>
                                    <option value="unrated">Unrated</option>
                                  </select>
                                </th>
                                <th className="p-1.5 space-y-1">
                                  <select
                                    value={classSort.column === 'quizScores' ? classSort.direction : 'default'}
                                    onChange={e => setClassColumnOrder('quizScores', e.target.value)}
                                    className="w-full px-1.5 py-0.5 text-xs rounded-md bg-white dark:bg-black border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-slate-100 font-semibold"
                                  >
                                    <option value="default">Order: Default</option>
                                    <option value="desc">High → Low</option>
                                    <option value="asc">Low → High</option>
                                  </select>
                                  <select
                                    value={classColFilters.quizScores}
                                    onChange={e => setClassColFilters(prev => ({ ...prev, quizScores: e.target.value as any }))}
                                    className="w-full px-1.5 py-0.5 text-xs rounded-md bg-white dark:bg-black border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-slate-100 font-medium"
                                  >
                                    <option value="all">All Scores</option>
                                    <option value="high">Avg ≥ 80%</option>
                                    <option value="mid">Avg 50–79%</option>
                                    <option value="low">Avg &lt; 50%</option>
                                    <option value="has_bio">Has Bio</option>
                                    <option value="has_chem">Has Chem</option>
                                    <option value="has_phys">Has Phys</option>
                                    <option value="none">No Quizzes</option>
                                  </select>
                                </th>
                                <th className="p-1.5 space-y-1">
                                  <select
                                    value={classSort.column === 'weakTopics' ? classSort.direction : 'default'}
                                    onChange={e => setClassColumnOrder('weakTopics', e.target.value)}
                                    className="w-full px-1.5 py-0.5 text-xs rounded-md bg-white dark:bg-black border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-slate-100 font-semibold"
                                  >
                                    <option value="default">Order: Default</option>
                                    <option value="desc">Count: High → Low</option>
                                    <option value="asc">Count: Low → High</option>
                                  </select>
                                  <input
                                    type="text"
                                    value={classColFilters.weakTopics}
                                    onChange={e => setClassColFilters(prev => ({ ...prev, weakTopics: e.target.value }))}
                                    placeholder="Filter topic / none..."
                                    className="w-full min-w-[100px] px-1.5 py-0.5 text-xs rounded-md bg-white dark:bg-black border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 font-medium"
                                  />
                                </th>
                                <th className="p-1.5 space-y-1">
                                  <select
                                    value={classSort.column === 'lastActive' ? classSort.direction : 'default'}
                                    onChange={e => setClassColumnOrder('lastActive', e.target.value)}
                                    className="w-full px-1.5 py-0.5 text-xs rounded-md bg-white dark:bg-black border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-slate-100 font-semibold"
                                  >
                                    <option value="default">Order: Default</option>
                                    <option value="desc">Newest → Oldest</option>
                                    <option value="asc">Oldest → Newest</option>
                                  </select>
                                  <select
                                    value={classColFilters.lastActive}
                                    onChange={e => setClassColFilters(prev => ({ ...prev, lastActive: e.target.value as any }))}
                                    className="w-full px-1.5 py-0.5 text-xs rounded-md bg-white dark:bg-black border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-slate-100 font-medium"
                                  >
                                    <option value="all">Any Time</option>
                                    <option value="today">Last 24h</option>
                                    <option value="week">Last 7d</option>
                                    <option value="month">Last 30d</option>
                                    <option value="older">&gt; 30d ago</option>
                                  </select>
                                </th>
                                <th className="p-2">
                                  {hasActiveClassFiltersOrSort && (
                                    <button
                                      type="button"
                                      onClick={resetClassFiltersAndSort}
                                      className="px-2 py-1 rounded-lg bg-white dark:bg-black border border-slate-300 dark:border-zinc-700 text-[10px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
                                    >
                                      Clear
                                    </button>
                                  )}
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-zinc-800 bg-white dark:bg-black">
                              {displayedClassStudents.length === 0 ? (
                                <tr>
                                  <td colSpan={11} className="p-6 text-center text-xs text-slate-500 dark:text-slate-400">
                                    No students match the selected column filters.{' '}
                                    <button type="button" onClick={resetClassFiltersAndSort} className="underline font-bold text-slate-800 dark:text-slate-200">
                                      Reset filters
                                    </button>
                                  </td>
                                </tr>
                              ) : displayedClassStudents.map(row => {
                                const { std, bioPct, chemPct, physPct, decksCompleted, slideDeckPct, syllabusPct, greenCount, orangeCount, redCount, gameLevel, goldBalance, unlockedSkinsCount, unlockedWeaponsCount, pendingPacksCount } = row;
                                const isSelected = selectedStudentIdsForBatch.has(std.studentId);
                                const bioScore = bioPct !== null ? bioPct : '-';
                                const chemScore = chemPct !== null ? chemPct : '-';
                                const physScore = physPct !== null ? physPct : '-';

                                return (
                                  <tr key={std.studentId} className={`transition ${isSelected ? 'bg-[#EBF3F5] dark:bg-zinc-900/60' : 'hover:bg-slate-50 dark:hover:bg-zinc-900/40'}`}>
                                    <td className="p-3">
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => toggleSelectStudent(std.studentId)}
                                        className="rounded border-black dark:border-white bg-[#FDFBF7] dark:bg-black text-slate-900 w-3.5 h-3.5 cursor-pointer"
                                      />
                                    </td>
                                    <td className="p-3">
                                      <button
                                        onClick={() => openStudentModal(std, 'academic')}
                                        className="text-left group/std hover:opacity-90 transition"
                                        title="Click to view detailed quiz results, loadout & skin collections"
                                      >
                                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                          <span>{std.name}</span>
                                          <Eye className="w-3 h-3 text-slate-700 dark:text-slate-300 opacity-0 group-hover/std:opacity-100 transition" />
                                        </div>
                                        <div className="text-[10px] text-slate-500 font-mono">{std.email}</div>
                                      </button>
                                    </td>
                                    <td className="p-3">
                                      <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-[#FDFBF7] dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 text-slate-800 dark:text-slate-200">
                                        {std.tier}
                                      </span>
                                    </td>
                                    <td className="p-3">
                                      <button
                                        type="button"
                                        onClick={() => openStudentModal(std, 'game_collection')}
                                        className="text-left space-y-0.5 hover:opacity-80 transition cursor-pointer"
                                        title="Inspect student's levels, weapon packs, and skin collection"
                                      >
                                        <div className="text-[11px] font-bold text-slate-900 dark:text-white tabular-nums whitespace-nowrap">
                                          Lv {gameLevel} · {goldBalance} Gold
                                        </div>
                                        <div className="text-[10px] text-slate-600 dark:text-slate-400 tabular-nums whitespace-nowrap">
                                          {unlockedSkinsCount}/19 Skins · {unlockedWeaponsCount}/10 Weapons
                                        </div>
                                        {pendingPacksCount > 0 && (
                                          <div className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 tabular-nums whitespace-nowrap">
                                            {pendingPacksCount} unopened pack{pendingPacksCount === 1 ? '' : 's'}
                                          </div>
                                        )}
                                      </button>
                                    </td>
                                    <td className="p-3">
                                      <div className="space-y-1">
                                        <div className="flex items-center justify-between text-[11px] font-mono">
                                          <span className="font-bold text-slate-900 dark:text-white">{decksCompleted} / 106</span>
                                          <span className="text-slate-500">{slideDeckPct}%</span>
                                        </div>
                                        <div className="w-24 h-1.5 rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden">
                                          <div className="h-full bg-slate-800 dark:bg-white rounded-full" style={{ width: `${slideDeckPct}%` }} />
                                        </div>
                                      </div>
                                    </td>
                                    <td className="p-3">
                                      <div className="space-y-1">
                                        <div className="flex items-center justify-between text-[11px] font-mono">
                                          <span className="font-bold text-slate-900 dark:text-white">{syllabusPct}%</span>
                                        </div>
                                        <div className="w-20 h-1.5 rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden">
                                          <div className="h-full bg-slate-700 dark:bg-slate-300 rounded-full" style={{ width: `${syllabusPct}%` }} />
                                        </div>
                                      </div>
                                    </td>
                                    <td className="p-3">
                                      <div className="flex items-center gap-1.5 text-[11px] font-mono">
                                        <span className="px-1.5 py-0.5 rounded bg-white dark:bg-black text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-zinc-700 font-bold" title="Green Mastery">
                                          🟢 {greenCount}
                                        </span>
                                        <span className="px-1.5 py-0.5 rounded bg-white dark:bg-black text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-zinc-700 font-bold" title="Orange Needs Revision">
                                          🟠 {orangeCount}
                                        </span>
                                        <span className="px-1.5 py-0.5 rounded bg-white dark:bg-black text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-zinc-700 font-bold" title="Red Priority">
                                          🔴 {redCount}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="p-3">
                                      <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold">
                                        <span className="text-slate-900 dark:text-white" title="Biology">B: {bioScore}%</span>
                                        <span className="text-slate-400">•</span>
                                        <span className="text-slate-900 dark:text-white" title="Chemistry">C: {chemScore}%</span>
                                        <span className="text-slate-400">•</span>
                                        <span className="text-slate-900 dark:text-white" title="Physics">P: {physScore}%</span>
                                      </div>
                                    </td>
                                    <td className="p-3">
                                      {std.weakTopics && std.weakTopics.length > 0 ? (
                                        <div className="flex flex-wrap gap-1">
                                          {std.weakTopics.slice(0, 3).map((wt, wIdx) => (
                                            <span key={`${wt}-${wIdx}`} className="px-1.5 py-0.5 rounded bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800 text-[10px] font-bold">
                                              {wt}
                                            </span>
                                          ))}
                                          {std.weakTopics.length > 3 && (
                                            <span className="text-[10px] text-slate-500 font-bold">+{std.weakTopics.length - 3}</span>
                                          )}
                                        </div>
                                      ) : (
                                        <span className="text-emerald-700 dark:text-emerald-400 text-[11px] font-bold">None flagged</span>
                                      )}
                                    </td>
                                    <td className="p-3 text-[11px] text-slate-500 dark:text-slate-400">
                                      {std.lastActive ? new Date(std.lastActive).toLocaleDateString() : 'Recently'}
                                    </td>
                                    <td className="p-3">
                                      <div className="flex items-center gap-1.5">
                                        <button
                                          onClick={() => openStudentModal(std, 'academic')}
                                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-black hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-800 dark:text-white border border-black dark:border-white text-[11px] font-bold transition"
                                          title="View quiz results, syllabus progress & game collections"
                                        >
                                          <Eye className="w-3 h-3" />
                                          <span>Analysis</span>
                                        </button>
                                        <button
                                          onClick={() => openRewardModal([{ studentId: std.studentId, name: std.name, email: std.email }], 'booster_pack')}
                                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white border border-emerald-800 text-[11px] font-bold transition cursor-pointer"
                                          title="Award booster packs, gold, skins, or weapons"
                                        >
                                          <Gift className="w-3 h-3" />
                                          <span>Reward</span>
                                        </button>
                                        <button
                                          onClick={() => handleOpenMoveModalSingle(std)}
                                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#EBF3F5] dark:bg-zinc-900 hover:bg-[#FDFBF7] text-slate-800 dark:text-white border border-slate-300 dark:border-zinc-700 text-[11px] font-bold transition"
                                          title="Move student to a different class"
                                        >
                                          <ArrowRightLeft className="w-3 h-3" />
                                          <span>Move</span>
                                        </button>
                                        <button
                                          onClick={() => handleRemoveStudent(std.studentId, std.name)}
                                          className="p-1 text-slate-400 hover:text-rose-600 transition"
                                          title="Remove from class"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
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
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ============================================================= */}
      {/* TAB: CLASS TASKS & HOMEWORK ASSIGNMENTS                       */}
      {/* ============================================================= */}
      {dashboardTab === 'tasks' && (
        <InstructorTasksManager
          currentUser={currentUser}
          classes={classes}
          selectedClassId={selectedClass?.id}
          onNavigateToLessons={onNavigateToLessons}
          onOpenTaskAnalytics={() => setDashboardTab('task_analytics')}
        />
      )}

      {/* ============================================================= */}
      {/* TAB: TASK COMPLETION ANALYTICS MATRIX                         */}
      {/* ============================================================= */}
      {dashboardTab === 'task_analytics' && (
        <TaskAnalyticsPage
          currentUser={currentUser}
          classes={classes}
          selectedClassId={selectedClass?.id}
          onSelectClassId={(cid) => {
            const match = classes.find(c => c.id === cid);
            if (match) setSelectedClass(match);
          }}
          onNavigateToTasks={() => setDashboardTab('tasks')}
        />
      )}

      {/* ============================================================= */}
      {/* TAB 2: INSTRUCTOR TEAM & INVITATIONS                          */}
      {/* ============================================================= */}
      {dashboardTab === 'invites' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-black border border-[#E2E8F0] dark:border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="max-w-2xl space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#EBF3F5] dark:bg-zinc-900 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-zinc-700">
                  Educator Access Control
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                <UserPlus className="w-6 h-6 text-slate-800 dark:text-slate-200" />
                <span>Invite People as Instructors</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                By default, all people signing in with Google log in as <strong className="text-slate-900 dark:text-white">Students</strong>. To grant educator privileges, enter their Google account email below. Once invited, when they sign in they will automatically receive the <strong className="text-slate-900 dark:text-white">Instructor View</strong> and can create and manage classes.
              </p>
            </div>

            {/* Invite Form */}
            <form onSubmit={handleSendInvite} className="max-w-xl flex flex-col sm:flex-row gap-3 pt-2">
              <div className="relative flex-1">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={newInviteEmail}
                  onChange={e => setNewInviteEmail(e.target.value)}
                  placeholder="colleague@school.edu (Google Account)"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FDFBF7] dark:bg-black border-2 border-black dark:border-white rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-500"
                />
              </div>

              <button
                type="submit"
                disabled={inviting || !newInviteEmail.trim()}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-black font-bold text-xs flex items-center justify-center gap-2 transition shadow-xs border border-black disabled:opacity-50"
              >
                {inviting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin"></div>
                    <span>Inviting...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Invite as Instructor</span>
                  </>
                )}
              </button>
            </form>

            {inviteStatusMsg && (
              <div className={`p-4 rounded-xl text-xs flex items-start gap-2.5 ${
                inviteStatusMsg.type === 'success'
                  ? 'bg-[#EBF3F5] dark:bg-zinc-900 border-2 border-black dark:border-white text-slate-900 dark:text-slate-100'
                  : 'bg-rose-50 dark:bg-rose-950/40 border-2 border-black dark:border-white text-rose-900 dark:text-rose-200'
              }`}>
                {inviteStatusMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                )}
                <span className="font-bold">{inviteStatusMsg.text}</span>
              </div>
            )}
          </div>

          {/* Current Instructors & Pending Invites Table */}
          <div className="bg-white dark:bg-black border border-[#E2E8F0] dark:border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-slate-800 dark:text-slate-200" />
              <span>Instructors & Invitations</span>
            </h3>

            {/* Permanent Admin note */}
            <div className="p-3 rounded-xl bg-[#EBF3F5] dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 text-xs flex items-center justify-between text-slate-800 dark:text-slate-200">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-900 dark:bg-white"></span>
                <span>Primary Lead Educator: <strong className="font-mono text-slate-900 dark:text-white">corbanb@gisboyshigh.net</strong> (Permanent Instructor Access)</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white dark:bg-black text-slate-800 dark:text-slate-200 border border-black dark:border-white">
                Owner
              </span>
            </div>

            {instructorInvites.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 bg-[#FDFBF7] dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800">
                No additional instructors invited yet. Invite your colleagues using the form above!
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-zinc-800">
                <table className="min-w-full text-xs text-left text-slate-800 dark:text-slate-200">
                  <thead className="bg-[#FDFBF7] dark:bg-zinc-900 text-slate-700 dark:text-slate-300 text-[11px] border-b border-slate-200 dark:border-zinc-800 font-bold">
                    <tr>
                      <th className="p-3">Instructor Email</th>
                      <th className="p-3">Invited By</th>
                      <th className="p-3">Invited Date</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-zinc-800 bg-white dark:bg-black">
                    {instructorInvites.map(inv => (
                      <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/40 transition">
                        <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">{inv.email}</td>
                        <td className="p-3 text-slate-700 dark:text-slate-300">{inv.invitedByName}</td>
                        <td className="p-3 text-slate-500">{new Date(inv.invitedAt).toLocaleDateString()}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#EBF3F5] dark:bg-zinc-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-zinc-700">
                            Instructor Role Active
                          </span>
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => handleDeleteInvite(inv.id, inv.email)}
                            className="text-[11px] font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 transition"
                          >
                            Revoke Access
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* TAB 3: INTEGRATED COHORT PROGRESS & MASTERY ANALYTICS         */}
      {/* ============================================================= */}
      {(dashboardTab === 'cohort' || dashboardTab === 'roster') && (
        <div className="space-y-6">
          {/* Traffic Light Recalibration Banner & Action */}
          <div className="bg-white dark:bg-black border border-[#E2E8F0] dark:border-zinc-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EBF3F5] dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 flex items-center justify-center shrink-0">
                <RefreshCw className={`w-5 h-5 text-slate-800 dark:text-slate-200 ${updatingQuizParameters ? 'animate-spin' : ''}`} />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 flex-wrap">
                  <span>Traffic Light Grading Parameters</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FDFBF7] dark:bg-zinc-900 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-zinc-700">
                    50%, 60%, 70% Amber/Orange
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FDFBF7] dark:bg-zinc-900 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-zinc-700">
                    ≤40% Red
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FDFBF7] dark:bg-zinc-900 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-zinc-700">
                    80%+ Green
                  </span>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Recalculate all past student quiz records, traffic lights, and task submissions across your classes with the new thresholds.
                </div>
              </div>
            </div>

            <button
              onClick={handleUpdateAllPastQuizResults}
              disabled={updatingQuizParameters}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-black font-bold text-xs transition flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-50 shadow-xs border border-black"
              title="Recalculate past student quiz results to match Amber/Orange (50%, 60%, 70%), Red (40% or less), Green (80%+)"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${updatingQuizParameters ? 'animate-spin' : ''}`} />
              <span>{updatingQuizParameters ? 'Updating Past Results...' : 'Recalculate All Past Student Results'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-[#FDFBF7] dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
              <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Cohort Syllabus Coverage</span>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1 font-mono">{avgSyllabusPct}%</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1 font-medium">
                <Users className="w-3.5 h-3.5" />
                <span>{rosterStudents.length} student{rosterStudents.length === 1 ? '' : 's'} enrolled</span>
              </div>
            </div>

            <div className="bg-[#FDFBF7] dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
              <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Slide Decks Completed</span>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1 font-mono">{avgSlideDeckPct}%</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {avgSlideCount} of 106 decks read avg
              </div>
            </div>

            <div className="bg-[#FDFBF7] dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
              <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Biology Average (B1–B16)</span>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1 font-mono">{avgBio}%</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Based on student quiz scores</div>
            </div>

            <div className="bg-[#FDFBF7] dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
              <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Chemistry Average (C1–C12)</span>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1 font-mono">{avgChem}%</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Based on student quiz scores</div>
            </div>

            <div className="bg-[#FDFBF7] dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
              <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Physics Average (P1–P5)</span>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1 font-mono">{avgPhys}%</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Based on student quiz scores</div>
            </div>
          </div>

          {/* Student Mastery Breakdown */}
          <div className="bg-white dark:bg-black border border-[#E2E8F0] dark:border-zinc-800 rounded-2xl p-6 space-y-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Student Mastery Breakdown</span>
                  {selectedClass && (
                    <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                      — {selectedClass.name} ({rosterStudents.length} student{rosterStudents.length === 1 ? '' : 's'})
                    </span>
                  )}
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {classes.length > 1 && (
                  <select
                    value={selectedClass?.id || ''}
                    onChange={e => {
                      const found = classes.find(c => c.id === e.target.value);
                      if (found) setSelectedClass(found);
                    }}
                    className="bg-[#FDFBF7] dark:bg-black border-2 border-black dark:border-white text-slate-900 dark:text-slate-100 text-xs rounded-xl px-2.5 py-1.5 font-medium"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.classCode})</option>
                    ))}
                  </select>
                )}

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Search student or weak topic..."
                    className="pl-8 pr-3 py-1.5 bg-[#FDFBF7] dark:bg-black border-2 border-black dark:border-white rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-500 font-medium"
                  />
                </div>

                <select
                  value={tierFilter}
                  onChange={e => setTierFilter(e.target.value as any)}
                  className="bg-[#FDFBF7] dark:bg-black border-2 border-black dark:border-white text-slate-900 dark:text-slate-100 text-xs rounded-xl px-2.5 py-1.5 font-medium"
                >
                  <option value="all">All Tiers</option>
                  <option value="Core">Core</option>
                  <option value="Extended">Extended</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value as any)}
                  className="bg-[#FDFBF7] dark:bg-black border-2 border-black dark:border-white text-slate-900 dark:text-slate-100 text-xs rounded-xl px-2.5 py-1.5 font-medium"
                >
                  <option value="all">All Statuses</option>
                  <option value="Excelling">Excelling</option>
                  <option value="On Track">On Track</option>
                  <option value="Intervention Required">Intervention Required</option>
                </select>

                {rosterStudents.length > 0 && (
                  <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-xl bg-[#FDFBF7] dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-800 dark:text-slate-200 border border-black dark:border-white font-bold transition"
                    title="Export CSV"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    <span>CSV</span>
                  </button>
                )}
              </div>
            </div>

            {rosterStudents.length === 0 ? (
              <div className="p-12 text-center bg-[#FDFBF7] dark:bg-zinc-900 border border-dashed border-slate-300 dark:border-zinc-800 rounded-2xl space-y-3">
                <Users className="w-12 h-12 text-slate-400 mx-auto" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">No Enrolled Students</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                  {selectedClass ? (
                    <>
                      No students have joined <span className="text-slate-900 dark:text-white font-bold">{selectedClass.name}</span> yet. Share your Class Code <span className="font-mono font-bold text-slate-900 dark:text-white bg-[#EBF3F5] dark:bg-black px-2 py-0.5 rounded border border-black dark:border-white">{selectedClass.classCode}</span> with students so they can join.
                    </>
                  ) : (
                    'Create a class in the Classes tab and share your Class Code with students to view their live syllabus mastery and quiz analytics.'
                  )}
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">
                    Showing <strong className="text-slate-900 dark:text-white">{filteredStudents.length}</strong> of <strong className="text-slate-900 dark:text-white">{rosterStudents.length}</strong> student{rosterStudents.length === 1 ? '' : 's'}
                    {cohortSort.column && (
                      <span className="ml-2 text-[11px] text-slate-500 dark:text-slate-400">
                        • Ordered by <strong className="text-slate-800 dark:text-slate-200">{cohortSort.column}</strong> ({isCohortNumericCol(cohortSort.column) ? (cohortSort.direction === 'desc' ? 'High → Low' : 'Low → High') : (cohortSort.direction === 'asc' ? 'A → Z' : 'Z → A')})
                      </span>
                    )}
                  </span>
                  {hasActiveCohortFiltersOrSort && (
                    <button
                      type="button"
                      onClick={resetCohortFiltersAndSort}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FDFBF7] dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-zinc-700 text-[11px] font-bold transition"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset Filters &amp; Order</span>
                    </button>
                  )}
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-zinc-800">
                  <table className="min-w-full text-xs text-left text-slate-800 dark:text-slate-200">
                    <thead className="bg-[#FDFBF7] dark:bg-zinc-900 text-slate-700 dark:text-slate-300 font-bold text-[11px] border-b border-slate-200 dark:border-zinc-800">
                      <tr>
                        <th className="p-3">
                          <button type="button" onClick={() => toggleCohortSort('name')} className="inline-flex items-center gap-1 hover:text-black dark:hover:text-white transition text-left">
                            <span>Student Name</span>
                            {cohortSort.column === 'name' ? (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-mono bg-slate-900 text-white dark:bg-white dark:text-black px-1 py-0.5 rounded">
                                {cohortSort.direction === 'asc' ? 'A→Z' : 'Z→A'}
                              </span>
                            ) : <ArrowUpDown className="w-3 h-3 opacity-40" />}
                          </button>
                        </th>
                        <th className="p-3">
                          <button type="button" onClick={() => toggleCohortSort('tier')} className="inline-flex items-center gap-1 hover:text-black dark:hover:text-white transition text-left">
                            <span>Tier</span>
                            {cohortSort.column === 'tier' ? (cohortSort.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-40" />}
                          </button>
                        </th>
                        <th className="p-3">
                          <button type="button" onClick={() => toggleCohortSort('slideDecks')} className="inline-flex items-center gap-1 hover:text-black dark:hover:text-white transition text-left">
                            <span>Slide Decks</span>
                            {cohortSort.column === 'slideDecks' ? (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-mono bg-slate-900 text-white dark:bg-white dark:text-black px-1 py-0.5 rounded">
                                {cohortSort.direction === 'desc' ? 'Hi→Lo' : 'Lo→Hi'}
                              </span>
                            ) : <ArrowUpDown className="w-3 h-3 opacity-40" />}
                          </button>
                        </th>
                        <th className="p-3">
                          <button type="button" onClick={() => toggleCohortSort('syllabusPct')} className="inline-flex items-center gap-1 hover:text-black dark:hover:text-white transition text-left">
                            <span>Syllabus %</span>
                            {cohortSort.column === 'syllabusPct' ? (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-mono bg-slate-900 text-white dark:bg-white dark:text-black px-1 py-0.5 rounded">
                                {cohortSort.direction === 'desc' ? 'Hi→Lo' : 'Lo→Hi'}
                              </span>
                            ) : <ArrowUpDown className="w-3 h-3 opacity-40" />}
                          </button>
                        </th>
                        <th className="p-3">
                          <button type="button" onClick={() => toggleCohortSort('bioScore')} className="inline-flex items-center gap-1 hover:text-black dark:hover:text-white transition text-left">
                            <span>Biology</span>
                            {cohortSort.column === 'bioScore' ? (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-mono bg-slate-900 text-white dark:bg-white dark:text-black px-1 py-0.5 rounded">
                                {cohortSort.direction === 'desc' ? 'Hi→Lo' : 'Lo→Hi'}
                              </span>
                            ) : <ArrowUpDown className="w-3 h-3 opacity-40" />}
                          </button>
                        </th>
                        <th className="p-3">
                          <button type="button" onClick={() => toggleCohortSort('chemScore')} className="inline-flex items-center gap-1 hover:text-black dark:hover:text-white transition text-left">
                            <span>Chemistry</span>
                            {cohortSort.column === 'chemScore' ? (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-mono bg-slate-900 text-white dark:bg-white dark:text-black px-1 py-0.5 rounded">
                                {cohortSort.direction === 'desc' ? 'Hi→Lo' : 'Lo→Hi'}
                              </span>
                            ) : <ArrowUpDown className="w-3 h-3 opacity-40" />}
                          </button>
                        </th>
                        <th className="p-3">
                          <button type="button" onClick={() => toggleCohortSort('physScore')} className="inline-flex items-center gap-1 hover:text-black dark:hover:text-white transition text-left">
                            <span>Physics</span>
                            {cohortSort.column === 'physScore' ? (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-mono bg-slate-900 text-white dark:bg-white dark:text-black px-1 py-0.5 rounded">
                                {cohortSort.direction === 'desc' ? 'Hi→Lo' : 'Lo→Hi'}
                              </span>
                            ) : <ArrowUpDown className="w-3 h-3 opacity-40" />}
                          </button>
                        </th>
                        <th className="p-3">
                          <button type="button" onClick={() => toggleCohortSort('weakArea')} className="inline-flex items-center gap-1 hover:text-black dark:hover:text-white transition text-left">
                            <span>Priority Weak Topic</span>
                            {cohortSort.column === 'weakArea' ? (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-mono bg-slate-900 text-white dark:bg-white dark:text-black px-1 py-0.5 rounded">
                                {cohortSort.direction === 'asc' ? 'A→Z' : 'Z→A'}
                              </span>
                            ) : <ArrowUpDown className="w-3 h-3 opacity-40" />}
                          </button>
                        </th>
                        <th className="p-3">
                          <button type="button" onClick={() => toggleCohortSort('status')} className="inline-flex items-center gap-1 hover:text-black dark:hover:text-white transition text-left">
                            <span>Status</span>
                            {cohortSort.column === 'status' ? (cohortSort.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-40" />}
                          </button>
                        </th>
                        <th className="p-3">Action</th>
                      </tr>
                      {/* Per-column inline filter & order row */}
                      <tr className="bg-slate-50/90 dark:bg-zinc-950 border-t border-slate-200 dark:border-zinc-800 font-normal align-top">
                        <th className="p-1.5 space-y-1">
                          <select
                            value={cohortSort.column === 'name' ? cohortSort.direction : 'default'}
                            onChange={e => setCohortColumnOrder('name', e.target.value)}
                            className="w-full px-1.5 py-0.5 text-xs rounded-md bg-white dark:bg-black border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-slate-100 font-semibold"
                          >
                            <option value="default">Order: Default</option>
                            <option value="asc">A → Z (Alphabetical)</option>
                            <option value="desc">Z → A (Reverse)</option>
                          </select>
                          <input
                            type="text"
                            value={cohortColFilters.name}
                            onChange={e => setCohortColFilters(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Search student..."
                            className="w-full min-w-[115px] px-1.5 py-0.5 text-xs rounded-md bg-white dark:bg-black border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 font-medium"
                          />
                        </th>
                        <th className="p-1.5">
                          <select
                            value={tierFilter}
                            onChange={e => setTierFilter(e.target.value as any)}
                            className="w-full px-1.5 py-0.5 text-xs rounded-md bg-white dark:bg-black border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-slate-100 font-medium"
                          >
                            <option value="all">All</option>
                            <option value="Core">Core</option>
                            <option value="Extended">Extended</option>
                          </select>
                        </th>
                        <th className="p-1.5 space-y-1">
                          <select
                            value={cohortSort.column === 'slideDecks' ? cohortSort.direction : 'default'}
                            onChange={e => setCohortColumnOrder('slideDecks', e.target.value)}
                            className="w-full px-1.5 py-0.5 text-xs rounded-md bg-white dark:bg-black border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-slate-100 font-semibold"
                          >
                            <option value="default">Order: Default</option>
                            <option value="desc">High → Low</option>
                            <option value="asc">Low → High</option>
                          </select>
                          <select
                            value={cohortColFilters.slideDecks}
                            onChange={e => setCohortColFilters(prev => ({ ...prev, slideDecks: e.target.value as any }))}
                            className="w-full px-1.5 py-0.5 text-xs rounded-md bg-white dark:bg-black border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-slate-100 font-medium"
                          >
                            <option value="all">All</option>
                            <option value="high">75–100%</option>
                            <option value="mid">26–74%</option>
                            <option value="low">1–25%</option>
                            <option value="zero">0 decks</option>
                          </select>
                        </th>
                        <th className="p-1.5 space-y-1">
                          <select
                            value={cohortSort.column === 'syllabusPct' ? cohortSort.direction : 'default'}
                            onChange={e => setCohortColumnOrder('syllabusPct', e.target.value)}
                            className="w-full px-1.5 py-0.5 text-xs rounded-md bg-white dark:bg-black border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-slate-100 font-semibold"
                          >
                            <option value="default">Order: Default</option>
                            <option value="desc">High → Low</option>
                            <option value="asc">Low → High</option>
                          </select>
                          <select
                            value={cohortColFilters.syllabusPct}
                            onChange={e => setCohortColFilters(prev => ({ ...prev, syllabusPct: e.target.value as any }))}
                            className="w-full px-1.5 py-0.5 text-xs rounded-md bg-white dark:bg-black border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-slate-100 font-medium"
                          >
                            <option value="all">All</option>
                            <option value="high">75–100%</option>
                            <option value="mid">35–74%</option>
                            <option value="low">1–34%</option>
                            <option value="zero">0%</option>
                          </select>
                        </th>
                        <th className="p-1.5 space-y-1">
                          <select
                            value={cohortSort.column === 'bioScore' ? cohortSort.direction : 'default'}
                            onChange={e => setCohortColumnOrder('bioScore', e.target.value)}
                            className="w-full px-1.5 py-0.5 text-xs rounded-md bg-white dark:bg-black border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-slate-100 font-semibold"
                          >
                            <option value="default">Order: Default</option>
                            <option value="desc">High → Low</option>
                            <option value="asc">Low → High</option>
                          </select>
                          <select
                            value={cohortColFilters.bioScore}
                            onChange={e => setCohortColFilters(prev => ({ ...prev, bioScore: e.target.value as any }))}
                            className="w-full px-1.5 py-0.5 text-xs rounded-md bg-white dark:bg-black border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-slate-100 font-medium"
                          >
                            <option value="all">All</option>
                            <option value="high">≥ 80%</option>
                            <option value="mid">50–79%</option>
                            <option value="low">1–49%</option>
                            <option value="zero">0%</option>
                          </select>
                        </th>
                        <th className="p-1.5 space-y-1">
                          <select
                            value={cohortSort.column === 'chemScore' ? cohortSort.direction : 'default'}
                            onChange={e => setCohortColumnOrder('chemScore', e.target.value)}
                            className="w-full px-1.5 py-0.5 text-xs rounded-md bg-white dark:bg-black border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-slate-100 font-semibold"
                          >
                            <option value="default">Order: Default</option>
                            <option value="desc">High → Low</option>
                            <option value="asc">Low → High</option>
                          </select>
                          <select
                            value={cohortColFilters.chemScore}
                            onChange={e => setCohortColFilters(prev => ({ ...prev, chemScore: e.target.value as any }))}
                            className="w-full px-1.5 py-0.5 text-xs rounded-md bg-white dark:bg-black border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-slate-100 font-medium"
                          >
                            <option value="all">All</option>
                            <option value="high">≥ 80%</option>
                            <option value="mid">50–79%</option>
                            <option value="low">1–49%</option>
                            <option value="zero">0%</option>
                          </select>
                        </th>
                        <th className="p-1.5 space-y-1">
                          <select
                            value={cohortSort.column === 'physScore' ? cohortSort.direction : 'default'}
                            onChange={e => setCohortColumnOrder('physScore', e.target.value)}
                            className="w-full px-1.5 py-0.5 text-xs rounded-md bg-white dark:bg-black border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-slate-100 font-semibold"
                          >
                            <option value="default">Order: Default</option>
                            <option value="desc">High → Low</option>
                            <option value="asc">Low → High</option>
                          </select>
                          <select
                            value={cohortColFilters.physScore}
                            onChange={e => setCohortColFilters(prev => ({ ...prev, physScore: e.target.value as any }))}
                            className="w-full px-1.5 py-0.5 text-xs rounded-md bg-white dark:bg-black border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-slate-100 font-medium"
                          >
                            <option value="all">All</option>
                            <option value="high">≥ 80%</option>
                            <option value="mid">50–79%</option>
                            <option value="low">1–49%</option>
                            <option value="zero">0%</option>
                          </select>
                        </th>
                        <th className="p-1.5 space-y-1">
                          <select
                            value={cohortSort.column === 'weakArea' ? cohortSort.direction : 'default'}
                            onChange={e => setCohortColumnOrder('weakArea', e.target.value)}
                            className="w-full px-1.5 py-0.5 text-xs rounded-md bg-white dark:bg-black border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-slate-100 font-semibold"
                          >
                            <option value="default">Order: Default</option>
                            <option value="asc">A → Z</option>
                            <option value="desc">Z → A</option>
                          </select>
                          <input
                            type="text"
                            value={cohortColFilters.weakArea}
                            onChange={e => setCohortColFilters(prev => ({ ...prev, weakArea: e.target.value }))}
                            placeholder="Filter topic..."
                            className="w-full min-w-[100px] px-1.5 py-0.5 text-xs rounded-md bg-white dark:bg-black border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 font-medium"
                          />
                        </th>
                        <th className="p-1.5">
                          <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value as any)}
                            className="w-full px-1.5 py-0.5 text-xs rounded-md bg-white dark:bg-black border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-slate-100 font-medium"
                          >
                            <option value="all">All</option>
                            <option value="Excelling">Excelling</option>
                            <option value="On Track">On Track</option>
                            <option value="Intervention Required">Intervention Required</option>
                          </select>
                        </th>
                        <th className="p-2">
                          {hasActiveCohortFiltersOrSort && (
                            <button
                              type="button"
                              onClick={resetCohortFiltersAndSort}
                              className="px-2 py-1 rounded-lg bg-white dark:bg-black border border-slate-300 dark:border-zinc-700 text-[10px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
                            >
                              Clear
                            </button>
                          )}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-zinc-800 bg-white dark:bg-black">
                      {filteredStudents.length === 0 ? (
                        <tr>
                          <td colSpan={10} className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">
                            No students match the current filters.{' '}
                            <button type="button" onClick={resetCohortFiltersAndSort} className="underline font-bold text-slate-800 dark:text-slate-200">
                              Reset all filters
                            </button>
                          </td>
                        </tr>
                      ) : filteredStudents.map(std => {
                      let statusClass = 'bg-[#EBF3F5] dark:bg-zinc-900 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-zinc-700';
                      if (std.status === 'Intervention Required') {
                        statusClass = 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800';
                      }

                      return (
                        <tr key={std.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/40 transition">
                          <td className="p-3">
                            <button
                              onClick={() => {
                                const found = classStudents.find(cs => cs.studentId === std.id);
                                if (found) {
                                  setSelectedStudentForAnalysis(found);
                                } else {
                                  setSelectedStudentForAnalysis({
                                    studentId: std.id,
                                    name: std.name,
                                    email: '',
                                    tier: std.tier,
                                    joinedAt: '',
                                    lastActive: '',
                                    completedLessonsCount: std.slideDeckCount,
                                    quizScores: {
                                      biology: { score: std.bioScore, total: 100, date: '' },
                                      chemistry: { score: std.chemScore, total: 100, date: '' },
                                      physics: { score: std.physScore, total: 100, date: '' }
                                    },
                                    subtopicQuizScores: {},
                                    topicConfidence: {},
                                    trafficLights: {},
                                    weakTopics: std.weakArea !== 'None identified' ? std.weakArea.split(', ') : []
                                  });
                                }
                              }}
                              className="text-left font-bold text-slate-900 dark:text-white hover:opacity-90 flex items-center gap-1.5 transition group/name"
                              title="Click to view student's individual practice quiz results"
                            >
                              <span>{std.name}</span>
                              <Eye className="w-3 h-3 text-slate-700 dark:text-slate-300 opacity-0 group-hover/name:opacity-100 transition" />
                            </button>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-[#FDFBF7] dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 text-slate-800 dark:text-slate-200">
                              {std.tier}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-[11px] font-mono">
                                <span className="font-bold text-slate-900 dark:text-white">{std.slideDeckCount} / 106</span>
                                <span className="text-slate-500">{std.slideDeckPct}%</span>
                              </div>
                              <div className="w-20 h-1.5 rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden">
                                <div className="h-full bg-slate-800 dark:bg-white rounded-full" style={{ width: `${std.slideDeckPct}%` }} />
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-[11px] font-mono">
                                <span className="font-bold text-slate-900 dark:text-white">{std.syllabusPct}%</span>
                              </div>
                              <div className="w-16 h-1.5 rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden">
                                <div className="h-full bg-slate-700 dark:bg-slate-300 rounded-full" style={{ width: `${std.syllabusPct}%` }} />
                              </div>
                            </div>
                          </td>
                          <td className="p-3 font-mono font-bold">{std.bioScore}%</td>
                          <td className="p-3 font-mono font-bold">{std.chemScore}%</td>
                          <td className="p-3 font-mono font-bold">{std.physScore}%</td>
                          <td className="p-3 font-bold text-slate-800 dark:text-slate-200">{std.weakArea}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${statusClass}`}>
                              {std.status}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => {
                                  const found = classStudents.find(cs => cs.studentId === std.id);
                                  if (found) {
                                    setSelectedStudentForAnalysis(found);
                                  } else {
                                    setSelectedStudentForAnalysis({
                                      studentId: std.id,
                                      name: std.name,
                                      email: '',
                                      tier: std.tier,
                                      joinedAt: '',
                                      lastActive: '',
                                      completedLessonsCount: Math.round((std.progressPct / 100) * 33),
                                      quizScores: {
                                        biology: { score: std.bioScore, total: 100, date: '' },
                                        chemistry: { score: std.chemScore, total: 100, date: '' },
                                        physics: { score: std.physScore, total: 100, date: '' }
                                      },
                                      subtopicQuizScores: {},
                                      topicConfidence: {},
                                      trafficLights: {},
                                      weakTopics: std.weakArea !== 'None identified' ? std.weakArea.split(', ') : []
                                    });
                                  }
                                }}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-black hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-800 dark:text-white border border-black dark:border-white text-[11px] font-bold transition"
                                title="View individual practice quiz results"
                              >
                                <Eye className="w-3 h-3" />
                                <span>Analysis</span>
                              </button>
                              <button
                                onClick={() => handleSendReminder(std.name)}
                                className="text-[11px] px-2 py-1 bg-[#FDFBF7] dark:bg-zinc-900 hover:bg-slate-100 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-zinc-700 rounded-lg transition font-bold"
                              >
                                Nudge
                              </button>
                              <button
                                onClick={() => handleOpenMoveModalSingle(
                                  { studentId: std.id, name: std.name },
                                  selectedClass?.id,
                                  selectedClass?.name
                                )}
                                className="flex items-center gap-1 px-2 py-1 bg-[#EBF3F5] dark:bg-zinc-900 hover:bg-[#FDFBF7] text-slate-800 dark:text-white border border-slate-300 dark:border-zinc-700 rounded-lg text-[11px] font-bold transition"
                                title="Move student to a different class"
                              >
                                <ArrowRightLeft className="w-3 h-3" />
                                <span>Move</span>
                              </button>
                            </div>
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
        </div>
      )}

      {/* ============================================================= */}
      {/* TAB 4: GOOGLE DRIVE FOLDER & SYNC CENTER                      */}
      {/* ============================================================= */}
      {dashboardTab === 'drive' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-black border border-[#E2E8F0] dark:border-zinc-800 rounded-2xl p-6 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#EBF3F5] dark:bg-zinc-900 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-zinc-700">
                    Live Drive Connection
                  </span>
                  <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                    Folder ID: {TARGET_DRIVE_FOLDER_ID}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FolderSync className="w-5 h-5 text-slate-800 dark:text-slate-200" />
                  <span>Google Drive Slides Folder Sync</span>
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl">
                  Connect and synchronize official Cambridge IGCSE 0653 lesson slides directly from your Google Drive folder.
                  Files named with topic codes (e.g., <code className="font-bold text-slate-900 dark:text-white">B1.1 Characteristics...</code>, <code className="font-bold text-slate-900 dark:text-white">C2.1...</code>) automatically embed inside the corresponding student lesson decks without manual configuration.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <button
                  onClick={handleOrganizeDriveInDashboard}
                  disabled={isOrganizingDrive || isSyncingDrive}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-black border border-black"
                  title="Reads the syllabus code at the start of each file name (e.g. P1.5.1.), creates corresponding subfolders in Google Drive, moves lessons into them, and replaces all synced lessons freshly."
                >
                  <FolderCheck className={`w-4 h-4 ${isOrganizingDrive ? 'animate-spin' : ''}`} />
                  <span>{isOrganizingDrive ? 'Organizing Subfolders...' : 'Sort Lessons into Subfolders (e.g. P1.5.1)'}</span>
                </button>

                <button
                  onClick={handleReplaceAllLessonsInDashboard}
                  disabled={isSyncingDrive || isOrganizingDrive}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs bg-[#EBF3F5] dark:bg-zinc-900 hover:bg-[#FDFBF7] text-slate-900 dark:text-white border-2 border-black dark:border-white"
                  title="Clears all existing cached lessons and re-syncs from Drive freshly."
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncingDrive ? 'animate-spin' : ''}`} />
                  <span>Replace All Lessons & Re-Sync</span>
                </button>

                <a
                  href={TARGET_DRIVE_FOLDER_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-black hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-800 dark:text-slate-200 text-xs font-bold transition"
                >
                  <span>Open Drive Folder</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {driveSyncStatusMessage && (
              <div className="mt-4 text-xs px-4 py-3 rounded-xl bg-[#EBF3F5] dark:bg-zinc-900 border-2 border-black dark:border-white text-slate-900 dark:text-slate-100 flex items-center justify-between font-bold">
                <span>{driveSyncStatusMessage}</span>
                <button onClick={() => setDriveSyncStatusMessage(null)} className="text-slate-500 hover:text-black dark:hover:text-white">
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Drive Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#FDFBF7] dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs">
              <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Total Synced Presentations</span>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1 font-mono">{syncedDriveSlides.length}</div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block font-medium">Stored locally for instant student access</span>
            </div>

            <div className="bg-[#FDFBF7] dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs">
              <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Target Subjects Supported</span>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">Bio • Chem • Phys</div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block font-medium">All 33 Cambridge Combined Science units</span>
            </div>

            <div className="bg-[#FDFBF7] dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs">
              <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Student Mode Visibility</span>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">Simplified & Clean</div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block font-medium">Drive folders & sync tools hidden from students</span>
            </div>
          </div>

          {/* Synced Files Table */}
          <div className="bg-white dark:bg-black border border-[#E2E8F0] dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Cloud className="w-4 h-4 text-slate-800 dark:text-slate-200" />
                <span>Synced Google Slides Presentations ({syncedDriveSlides.length})</span>
              </h3>
            </div>

            {syncedDriveSlides.length === 0 ? (
              <div className="p-8 text-center space-y-3 bg-[#FDFBF7] dark:bg-zinc-900">
                <FolderSync className="w-10 h-10 text-slate-400 mx-auto" />
                <p className="text-sm text-slate-900 dark:text-white font-bold">No presentations synced from Drive folder yet</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                  Click the <strong>Replace All Lessons & Re-Sync</strong> button above to fetch all slide decks from your folder.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-800 dark:text-slate-200">
                  <thead className="bg-[#FDFBF7] dark:bg-zinc-900 text-slate-700 dark:text-slate-300 text-[11px] border-b border-slate-200 dark:border-zinc-800 font-bold">
                    <tr>
                      <th className="p-3">Detected Code</th>
                      <th className="p-3">Drive File Name</th>
                      <th className="p-3">Drive File ID</th>
                      <th className="p-3">Subfolder</th>
                      <th className="p-3">Live Slide Link</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-zinc-800">
                    {syncedDriveSlides.map((slide, idx) => (
                      <tr key={slide.id || idx} className="hover:bg-slate-50 dark:hover:bg-zinc-900/40">
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-[#FDFBF7] dark:bg-black text-slate-900 dark:text-white border border-black dark:border-white">
                            {slide.extractedCode || slide.matchedSubtopicCode || 'Generic'}
                          </span>
                        </td>
                        <td className="p-3 font-bold text-slate-900 dark:text-white">{slide.name}</td>
                        <td className="p-3 font-mono text-[10px] text-slate-500">{slide.id}</td>
                        <td className="p-3 text-slate-500">Synced Unit</td>
                        <td className="p-3">
                          <a
                            href={slide.webViewLink || `https://docs.google.com/presentation/d/${slide.id}/edit`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-900 dark:text-white hover:underline flex items-center gap-1 font-bold"
                          >
                            <span>Open</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* TAB 5: GOOGLE SLIDES CURRICULUM REGISTRY                      */}
      {/* ============================================================= */}
      {dashboardTab === 'slides' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-black border border-[#E2E8F0] dark:border-zinc-800 rounded-2xl p-6 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Play className="w-5 h-5 text-slate-800 dark:text-slate-200 fill-current" />
                  <span>Google Slides Curriculum URL Overrides</span>
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Customize the presentation embed URL for each of the 33 syllabus subtopics.
                </p>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={slidesSearchTerm}
                  onChange={e => setSlidesSearchTerm(e.target.value)}
                  placeholder="Filter subtopics (e.g. B2, C9)..."
                  className="pl-8 pr-3 py-1.5 bg-[#FDFBF7] dark:bg-black border-2 border-black dark:border-white rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-500 font-medium"
                />
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-zinc-800">
              <table className="w-full text-left text-xs text-slate-800 dark:text-slate-200">
                <thead className="bg-[#FDFBF7] dark:bg-zinc-900 text-slate-700 dark:text-slate-300 text-[11px] border-b border-slate-200 dark:border-zinc-800 font-bold">
                  <tr>
                    <th className="p-3">Code</th>
                    <th className="p-3">Subtopic Title</th>
                    <th className="p-3">Subject</th>
                    <th className="p-3">Current Slides URL / ID</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-zinc-800 bg-white dark:bg-black">
                  {filteredSlides.map(slide => {
                    const slideCode = slide.subtopicCode || slide.topicCode;
                    const isEditing = editingTopicCode === slideCode;
                    return (
                      <tr key={slide.id || slide.subtopicCode || `${slide.topicCode}-${slide.subtopicCode}`} className="hover:bg-slate-50 dark:hover:bg-zinc-900/40">
                        <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">{slideCode}</td>
                        <td className="p-3 font-bold text-slate-800 dark:text-slate-200">{slide.title}</td>
                        <td className="p-3 capitalize text-slate-500">{slide.subject}</td>
                        <td className="p-3">
                          {isEditing ? (
                            <div className="space-y-1">
                              <input
                                type="text"
                                value={editingUrlValue}
                                onChange={e => setEditingUrlValue(e.target.value)}
                                placeholder="Paste Google Slides share link, embed URL, or doc ID..."
                                className="w-full min-w-[260px] bg-[#FDFBF7] dark:bg-black border-2 border-black dark:border-white rounded-lg px-2.5 py-1 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-500 font-mono"
                                autoFocus
                              />
                              <span className="text-[10px] text-slate-500 block">Saves to cloud & instantly publishes to all student accounts.</span>
                            </div>
                          ) : slide.googleSlidesUrl ? (
                            <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300 truncate block max-w-xs" title={slide.googleSlidesUrl}>
                              {slide.googleSlidesUrl}
                            </span>
                          ) : (
                            <span className="italic text-slate-400 text-xs">No presentation linked</span>
                          )}
                        </td>
                        <td className="p-3">
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleSaveSlideOverride(slideCode, editingUrlValue)}
                                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs flex items-center gap-1 border border-black"
                              >
                                <Check className="w-3 h-3" />
                                <span>Save & Publish</span>
                              </button>
                              <button
                                onClick={() => { setEditingTopicCode(null); setEditingUrlValue(''); }}
                                className="px-2 py-1 bg-white dark:bg-black hover:bg-slate-100 text-slate-800 dark:text-slate-200 border border-slate-300 rounded-lg text-xs font-bold"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => {
                                  setEditingTopicCode(slideCode);
                                  setEditingUrlValue(slide.googleSlidesUrl || '');
                                }}
                                className="text-slate-900 dark:text-white hover:underline flex items-center gap-1 font-bold text-xs"
                              >
                                <Edit3 className="w-3 h-3" />
                                <span>Edit URL</span>
                              </button>
                              {slide.googleSlidesUrl && (
                                <a
                                  href={slide.googleSlidesUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-slate-900 dark:text-white hover:underline flex items-center gap-1 font-bold text-xs"
                                >
                                  <span>Preview</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL: CREATE CLASS                                           */}
      {/* ============================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-black border-2 border-black dark:border-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-xl space-y-6 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#EBF3F5] dark:bg-zinc-900 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-zinc-700">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Create New Class</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Linked to your instructor profile</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-slate-500 hover:text-black dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateClass} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  Class Name <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={newClassName}
                  onChange={e => setNewClassName(e.target.value)}
                  placeholder="e.g. Year 10 IGCSE Science - Set A"
                  required
                  className="w-full px-3.5 py-2.5 bg-[#FDFBF7] dark:bg-black border-2 border-black dark:border-white rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  Subject Focus
                </label>
                <select
                  value={newClassSubject}
                  onChange={e => setNewClassSubject(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-[#FDFBF7] dark:bg-black border-2 border-black dark:border-white rounded-xl text-xs text-slate-900 dark:text-slate-100 font-medium"
                >
                  <option value="all">All Sciences (Bio, Chem, Phys)</option>
                  <option value="biology">Biology Focused (B1–B16)</option>
                  <option value="chemistry">Chemistry Focused (C1–C12)</option>
                  <option value="physics">Physics Focused (P1–P5)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  Custom Class Code <span className="text-[10px] text-slate-500">(Optional, leaves auto-generated if blank)</span>
                </label>
                <input
                  type="text"
                  value={newClassCustomCode}
                  onChange={e => setNewClassCustomCode(e.target.value.toUpperCase())}
                  placeholder="e.g. SCI-9421 or 9421"
                  maxLength={10}
                  className="w-full px-3.5 py-2.5 bg-[#FDFBF7] dark:bg-black border-2 border-black dark:border-white rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-slate-100 placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  Description / Period Notes <span className="text-[10px] text-slate-500">(Optional)</span>
                </label>
                <textarea
                  value={newClassDesc}
                  onChange={e => setNewClassDesc(e.target.value)}
                  placeholder="e.g. Period 3 Mon/Wed. Extended tier preparation."
                  rows={2}
                  className="w-full px-3.5 py-2 bg-[#FDFBF7] dark:bg-black border-2 border-black dark:border-white rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-500 resize-none font-medium"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingClass || !newClassName.trim()}
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-black text-xs font-bold transition shadow-xs border border-black disabled:opacity-50"
                >
                  {creatingClass ? 'Creating Class...' : 'Create Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL: SHARE CLASS WITH CO-INSTRUCTORS                        */}
      {/* ============================================================= */}
      {showShareModal && classToShare && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-black border-2 border-black dark:border-white rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-xl space-y-6 max-h-[90vh] overflow-y-auto text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#EBF3F5] dark:bg-zinc-900 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-zinc-700">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Share Class with Instructors</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Collaborative class teaching & shared analytics</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowShareModal(false);
                  setClassToShare(null);
                  setShareFeedbackMsg(null);
                }}
                className="p-1 text-slate-500 hover:text-black dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target Class Info */}
            <div className="p-3.5 rounded-xl bg-[#FDFBF7] dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white">{classToShare.name}</span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#EBF3F5] dark:bg-black text-slate-900 dark:text-white border-2 border-black dark:border-white">
                  {classToShare.classCode}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Created by: <span className="text-slate-900 dark:text-white font-bold">{classToShare.instructorName || classToShare.instructorEmail}</span> ({classToShare.instructorEmail})
              </p>
            </div>

            {/* Share Feedback Notice */}
            {shareFeedbackMsg && (
              <div className={`p-3 rounded-xl border-2 border-black dark:border-white text-xs flex items-center gap-2 ${
                shareFeedbackMsg.type === 'success'
                  ? 'bg-[#EBF3F5] dark:bg-zinc-900 text-slate-900 dark:text-slate-100'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200'
              }`}>
                {shareFeedbackMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                )}
                <span className="font-bold">{shareFeedbackMsg.text}</span>
              </div>
            )}

            {/* Existing Shared Co-Instructors */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Current Co-Instructors with Access
              </label>
              {classToShare.sharedInstructors && classToShare.sharedInstructors.length > 0 ? (
                <div className="space-y-2">
                  {classToShare.sharedInstructors.map(inst => (
                    <div
                      key={inst.email}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-[#FDFBF7] dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-900 dark:bg-white text-white dark:text-black font-bold flex items-center justify-center text-xs">
                          {inst.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">{inst.email}</div>
                          <div className="text-[10px] text-slate-500">
                            Added {new Date(inst.sharedAt).toLocaleDateString()} by {inst.addedBy}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveSharedInstructor(inst.email)}
                        disabled={sharingClass}
                        className="text-[11px] font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 px-2 py-1 rounded bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 transition disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 p-3 bg-[#FDFBF7] dark:bg-zinc-900 rounded-xl border border-dashed border-slate-300 dark:border-zinc-800">
                  No co-instructors added to this class yet. Add fellow science teachers below.
                </p>
              )}
            </div>

            {/* Add New Co-Instructor Form */}
            <form onSubmit={handleShareClassSubmit} className="space-y-3 pt-2 border-t border-slate-200 dark:border-zinc-800">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Add Instructor by Email
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  value={shareEmailInput}
                  onChange={e => setShareEmailInput(e.target.value)}
                  placeholder="e.g. colleague.teacher@school.net"
                  required
                  className="flex-1 px-3.5 py-2.5 bg-[#FDFBF7] dark:bg-black border-2 border-black dark:border-white rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-500 font-medium"
                />
                <button
                  type="submit"
                  disabled={sharingClass || !shareEmailInput.trim()}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-black text-xs font-bold transition shadow-xs border border-black disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{sharingClass ? 'Adding...' : 'Share Access'}</span>
                </button>
              </div>
            </form>

            {/* Collaborative Features Explanation */}
            <div className="p-3.5 rounded-xl bg-[#EBF3F5] dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 space-y-1.5 text-xs text-slate-800 dark:text-slate-200">
              <div className="font-bold flex items-center gap-1.5 text-slate-900 dark:text-white">
                <ShieldCheck className="w-4 h-4" />
                <span>Shared Instructor Privileges:</span>
              </div>
              <ul className="space-y-1 text-[11px] text-slate-600 dark:text-slate-400 list-disc list-inside">
                <li>Create and assign homework tasks & quizzes to this shared class</li>
                <li>Track live slide deck completion and syllabus % coverage in real time</li>
                <li>Inspect individual student scores, quiz attempts, and traffic lights</li>
              </ul>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowShareModal(false);
                  setClassToShare(null);
                  setShareFeedbackMsg(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-black hover:bg-slate-100 border border-black dark:border-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL: INDIVIDUAL STUDENT ANALYSIS & QUIZ RESULTS             */}
      {/* ============================================================= */}
      {selectedStudentForAnalysis && (() => {
        // Prepare list of subtopic practice quizzes
        const subtopicQuizzes = Object.entries(selectedStudentForAnalysis.subtopicQuizScores || {}).map(([code, res]) => {
          const subInfo = allSubtopicsData.find(s => s.subtopicCode.toLowerCase() === code.toLowerCase());
          const pct = typeof res.percentage === 'number' ? res.percentage : (res.total > 0 ? Math.round((res.score / res.total) * 100) : 0);
          return {
            id: `sub-${code}`,
            code: code.toUpperCase(),
            title: subInfo ? subInfo.title : `Subtopic ${code}`,
            subject: subInfo ? subInfo.subject : (code.toUpperCase().startsWith('B') ? 'biology' : code.toUpperCase().startsWith('C') ? 'chemistry' : 'physics'),
            score: res.score,
            total: res.total,
            percentage: pct,
            passed: res.passed ?? (pct >= 80),
            date: res.date
          };
        });

        // Prepare subject-level arena quiz scores
        const subjectQuizzes = Object.entries(selectedStudentForAnalysis.quizScores || {}).map(([subKey, res]) => {
          const pct = res.total > 0 ? Math.round((res.score / res.total) * 100) : 0;
          return {
            id: `arena-${subKey}`,
            code: subKey.toUpperCase().slice(0, 4),
            title: `${subKey.charAt(0).toUpperCase() + subKey.slice(1)} Arena Checkpoint Quiz`,
            subject: subKey.toLowerCase() as ScienceSubject,
            score: res.score,
            total: res.total,
            percentage: pct,
            passed: pct >= 80,
            date: res.date
          };
        });

        const allQuizzes = [...subtopicQuizzes, ...subjectQuizzes];
        const filteredQuizzesRaw = allQuizzes.filter(q => {
          if (analysisSubjectFilter !== 'all' && q.subject !== analysisSubjectFilter) return false;
          if (modalQuizFilters.topic.trim()) {
            const term = modalQuizFilters.topic.toLowerCase();
            if (!q.code.toLowerCase().includes(term) && !q.title.toLowerCase().includes(term)) return false;
          }
          if (modalQuizFilters.result === 'passed' && !q.passed) return false;
          if (modalQuizFilters.result === 'review' && q.passed) return false;
          if (modalQuizFilters.scoreRange === 'high' && q.percentage < 80) return false;
          if (modalQuizFilters.scoreRange === 'mid' && (q.percentage < 50 || q.percentage >= 80)) return false;
          if (modalQuizFilters.scoreRange === 'low' && q.percentage >= 50) return false;
          return true;
        });

        const toggleModalQuizSort = (col: 'topic' | 'subject' | 'score' | 'percentage' | 'result' | 'date') => {
          const isNumeric = col === 'score' || col === 'percentage' || col === 'date';
          const firstDir: 'asc' | 'desc' = isNumeric ? 'desc' : 'asc';
          const secondDir: 'asc' | 'desc' = firstDir === 'asc' ? 'desc' : 'asc';
          setModalQuizSort(prev => {
            if (prev.column !== col) return { column: col, direction: firstDir };
            if (prev.direction === firstDir) return { column: col, direction: secondDir };
            return { column: null, direction: 'asc' };
          });
        };

        const filteredQuizzes = modalQuizSort.column
          ? [...filteredQuizzesRaw].sort((a, b) => {
              const dir = modalQuizSort.direction === 'asc' ? 1 : -1;
              switch (modalQuizSort.column) {
                case 'topic':
                  return dir * `${a.code} ${a.title}`.localeCompare(`${b.code} ${b.title}`, undefined, { numeric: true });
                case 'subject':
                  return dir * a.subject.localeCompare(b.subject);
                case 'score':
                  return dir * (a.score - b.score);
                case 'percentage':
                  return dir * (a.percentage - b.percentage);
                case 'result':
                  return dir * (Number(a.passed) - Number(b.passed));
                case 'date': {
                  const tA = a.date ? new Date(a.date).getTime() : 0;
                  const tB = b.date ? new Date(b.date).getTime() : 0;
                  return dir * (tA - tB);
                }
                default:
                  return 0;
              }
            })
          : filteredQuizzesRaw;

        // Summary calculations
        const totalQuizzes = allQuizzes.length;
        const avgQuizScore = totalQuizzes > 0
          ? Math.round(allQuizzes.reduce((acc, q) => acc + q.percentage, 0) / totalQuizzes)
          : 0;
        const passedQuizzes = allQuizzes.filter(q => q.passed).length;
        const passRate = totalQuizzes > 0 ? Math.round((passedQuizzes / totalQuizzes) * 100) : 0;

        // Traffic lights count
        const trafficLights = selectedStudentForAnalysis.trafficLights || {};
        const redLights = Object.entries(trafficLights).filter(([, v]) => v === 'red');
        const orangeLights = Object.entries(trafficLights).filter(([, v]) => v === 'orange');
        const greenLights = Object.entries(trafficLights).filter(([, v]) => v === 'green');

        const studentDeckSet = new Set<string>([
          ...(selectedStudentForAnalysis.completedLessons || []),
          ...Object.keys(selectedStudentForAnalysis.trafficLights || {}),
          ...Object.keys(selectedStudentForAnalysis.subtopicQuizScores || {})
        ]);
        const effectiveSlideDecks = Math.max(selectedStudentForAnalysis.completedLessonsCount || 0, studentDeckSet.size);
        const studentSlidePct = Math.min(100, Math.round((effectiveSlideDecks / 106) * 100));
        const studentSyllabusPct = Math.min(100, Math.round((studentDeckSet.size / 106) * 100));

        const activeGameProfile = studentGameProfiles[selectedStudentForAnalysis.studentId];
        const xpTotal = activeGameProfile?.xp ?? selectedStudentForAnalysis.xp ?? 0;
        const xpProgress = calculateLevelFromXP(xpTotal);
        const effectiveLevel = Math.max(activeGameProfile?.level || 1, xpProgress.level);
        const studentGold = activeGameProfile?.gold ?? 100;
        const studentUnlockedSkins = activeGameProfile?.unlockedSkins || ['cultist'];
        const studentInventory = activeGameProfile?.inventory || ['cultist', 'wpn_starter_blaster', 'bunsen_burner'];
        const equippedSkinId = activeGameProfile?.equippedSkin || activeGameProfile?.avatar || 'cultist';
        const equippedSkinDef = getFantasySkin(equippedSkinId);
        const equippedWeaponDef = resolveWeaponItem(activeGameProfile?.equippedWeapon);
        const giftedPacksMap = activeGameProfile?.giftedPacks || {};
        const totalUnopenedPacks = Object.values(giftedPacksMap).reduce((sum, n) => sum + Math.max(0, Number(n) || 0), 0);
        const rewardLog = [...(activeGameProfile?.rewardHistory || [])].reverse();

        const sortedSkinsForModal = [...ALL_FANTASY_SKINS].sort(
          (a, b) => (RARITY_RANK[a.rarity]?.rank ?? 99) - (RARITY_RANK[b.rarity]?.rank ?? 99)
        );
        const unlockedSkinCountModal = sortedSkinsForModal.filter(
          s => s.id === 'cultist' || studentUnlockedSkins.includes(s.id)
        ).length;
        const visibleSkinsForModal = sortedSkinsForModal.filter((s) => {
          const isOwned = s.id === 'cultist' || studentUnlockedSkins.includes(s.id);
          if (skinCollectionFilter === 'unlocked') return isOwned;
          if (skinCollectionFilter === 'locked') return !isOwned;
          return true;
        });

        const sortedWeaponsForModal = [...ALL_WEAPON_ITEMS].sort(
          (a, b) => (RARITY_RANK[a.rarity]?.rank ?? 99) - (RARITY_RANK[b.rarity]?.rank ?? 99)
        );
        const unlockedWeaponCountModal = sortedWeaponsForModal.filter(
          w => w.price === 0 || w.id === 'wpn_starter_blaster' || w.id === 'bunsen_burner' || studentInventory.includes(w.id)
        ).length;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white dark:bg-black border-2 border-black dark:border-white rounded-2xl max-w-5xl w-full max-h-[92vh] overflow-y-auto shadow-xl p-6 sm:p-8 space-y-6 text-slate-900 dark:text-slate-100">
              {/* Modal Header */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200 dark:border-zinc-800">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-[#EBF3F5] dark:bg-zinc-900 border-2 border-black dark:border-white flex items-center justify-center text-slate-900 dark:text-white font-bold text-lg shadow-xs shrink-0 overflow-hidden">
                    <img
                      src={equippedSkinDef.portraitPath || equippedSkinDef.spritePath || `/assets/characters/${equippedSkinDef.id}.png`}
                      alt={equippedSkinDef.name}
                      className="w-10 h-10 object-contain pixelated"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">{selectedStudentForAnalysis.name}</h3>
                      <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-[#FDFBF7] dark:bg-zinc-900 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-zinc-700">
                        {selectedStudentForAnalysis.tier} Tier
                      </span>
                      <span className="text-xs text-slate-500 font-mono">
                        {selectedStudentForAnalysis.email || 'Student Email'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 tabular-nums">
                      Level {effectiveLevel} · {studentGold} Gold · {unlockedSkinCountModal}/19 Skins · {unlockedWeaponCountModal}/10 Weapons · {totalUnopenedPacks} Gifted Pack{totalUnopenedPacks === 1 ? '' : 's'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => openRewardModal([{
                      studentId: selectedStudentForAnalysis.studentId,
                      name: selectedStudentForAnalysis.name,
                      email: selectedStudentForAnalysis.email
                    }], 'booster_pack')}
                    className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Gift className="w-4 h-4" />
                    <span>Award Reward</span>
                  </button>
                  <button
                    onClick={() => setSelectedStudentForAnalysis(null)}
                    className="p-1.5 rounded-xl text-slate-500 hover:text-black dark:hover:text-white transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Section Switcher */}
              <div className="flex items-center gap-2 border-b border-slate-200 dark:border-zinc-800 pb-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => setStudentModalTab('academic')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center gap-2 ${
                    studentModalTab === 'academic'
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-black border-black dark:border-white'
                      : 'bg-white dark:bg-black text-slate-700 dark:text-slate-300 border-slate-300 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-900'
                  }`}
                >
                  <Award className="w-4 h-4" />
                  <span>Academic &amp; Quizzes</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStudentModalTab('game_collection')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center gap-2 ${
                    studentModalTab === 'game_collection'
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-black border-black dark:border-white'
                      : 'bg-white dark:bg-black text-slate-700 dark:text-slate-300 border-slate-300 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-900'
                  }`}
                >
                  <Package className="w-4 h-4" />
                  <span>Levels, Weapon Packs &amp; Skins</span>
                </button>
              </div>

              {studentModalTab === 'academic' && (
                <>
              {/* Top KPI Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="bg-[#FDFBF7] dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-2xl p-3.5">
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Practice Quizzes Taken</div>
                  <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">{totalQuizzes}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Completed checkpoints</div>
                </div>

                <div className="bg-[#FDFBF7] dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-2xl p-3.5">
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Average Quiz Score</div>
                  <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                    {avgQuizScore}%
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Across all science topics</div>
                </div>

                <div className="bg-[#FDFBF7] dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-2xl p-3.5">
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Green Light Pass Rate</div>
                  <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">{passRate}%</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{passedQuizzes} of {totalQuizzes} passed (≥80%)</div>
                </div>

                <div className="bg-[#FDFBF7] dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-2xl p-3.5">
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Slide Decks Read</div>
                  <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                    {effectiveSlideDecks} <span className="text-xs font-normal text-slate-500">/ 106</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{studentSlidePct}% of curriculum decks</div>
                </div>

                <div className="bg-[#FDFBF7] dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-2xl p-3.5">
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Syllabus % Coverage</div>
                  <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                    {studentSyllabusPct}%
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{studentDeckSet.size} of 106 topics covered</div>
                </div>
              </div>

              {/* INDIVIDUAL PRACTICE QUIZ RESULTS SECTION */}
              <div className="space-y-4 bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Award className="w-4 h-4 text-slate-800 dark:text-slate-200" />
                      <span>Individual Practice Quiz Results ({filteredQuizzes.length})</span>
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      Live record of every practice quiz completed by this student.
                    </p>
                  </div>

                  {/* Subject Filter Pills */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => setAnalysisSubjectFilter('all')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition border ${
                        analysisSubjectFilter === 'all'
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-black border-black dark:border-white shadow-xs'
                          : 'bg-[#FDFBF7] dark:bg-zinc-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-zinc-700 hover:bg-slate-100'
                      }`}
                    >
                      All ({allQuizzes.length})
                    </button>
                    <button
                      onClick={() => setAnalysisSubjectFilter('biology')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition border ${
                        analysisSubjectFilter === 'biology'
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-black border-black dark:border-white shadow-xs'
                          : 'bg-[#FDFBF7] dark:bg-zinc-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-zinc-700 hover:bg-slate-100'
                      }`}
                    >
                      Biology ({allQuizzes.filter(q => q.subject === 'biology').length})
                    </button>
                    <button
                      onClick={() => setAnalysisSubjectFilter('chemistry')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition border ${
                        analysisSubjectFilter === 'chemistry'
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-black border-black dark:border-white shadow-xs'
                          : 'bg-[#FDFBF7] dark:bg-zinc-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-zinc-700 hover:bg-slate-100'
                      }`}
                    >
                      Chemistry ({allQuizzes.filter(q => q.subject === 'chemistry').length})
                    </button>
                    <button
                      onClick={() => setAnalysisSubjectFilter('physics')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition border ${
                        analysisSubjectFilter === 'physics'
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-black border-black dark:border-white shadow-xs'
                          : 'bg-[#FDFBF7] dark:bg-zinc-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-zinc-700 hover:bg-slate-100'
                      }`}
                    >
                      Physics ({allQuizzes.filter(q => q.subject === 'physics').length})
                    </button>
                  </div>
                </div>

                {/* Quizzes List or Empty State */}
                {allQuizzes.length === 0 ? (
                  <div className="p-8 text-center bg-[#FDFBF7] dark:bg-zinc-900 border border-dashed border-slate-300 dark:border-zinc-800 rounded-xl space-y-2">
                    <Award className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-xs font-bold text-slate-900 dark:text-white">No practice quizzes completed yet</p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
                      {selectedStudentForAnalysis.name} has not finished any quizzes in this category. You can set a practice quiz task using the button below.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-zinc-800">
                    <table className="min-w-full text-xs text-left text-slate-800 dark:text-slate-200">
                      <thead className="bg-[#FDFBF7] dark:bg-zinc-900 text-slate-700 dark:text-slate-300 text-[11px] border-b border-slate-200 dark:border-zinc-800 font-bold">
                        <tr>
                          <th className="p-3">
                            <button type="button" onClick={() => toggleModalQuizSort('topic')} className="inline-flex items-center gap-1 hover:text-black dark:hover:text-white transition">
                              <span>Topic / Quiz</span>
                              {modalQuizSort.column === 'topic' ? (
                                <span className="inline-flex items-center gap-0.5 text-[10px] font-mono bg-slate-900 text-white dark:bg-white dark:text-black px-1 py-0.5 rounded">
                                  {modalQuizSort.direction === 'asc' ? 'A→Z' : 'Z→A'}
                                </span>
                              ) : <ArrowUpDown className="w-3 h-3 opacity-40" />}
                            </button>
                          </th>
                          <th className="p-3">
                            <button type="button" onClick={() => toggleModalQuizSort('subject')} className="inline-flex items-center gap-1 hover:text-black dark:hover:text-white transition">
                              <span>Subject</span>
                              {modalQuizSort.column === 'subject' ? (modalQuizSort.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-40" />}
                            </button>
                          </th>
                          <th className="p-3">
                            <button type="button" onClick={() => toggleModalQuizSort('score')} className="inline-flex items-center gap-1 hover:text-black dark:hover:text-white transition">
                              <span>Score</span>
                              {modalQuizSort.column === 'score' ? (
                                <span className="inline-flex items-center gap-0.5 text-[10px] font-mono bg-slate-900 text-white dark:bg-white dark:text-black px-1 py-0.5 rounded">
                                  {modalQuizSort.direction === 'desc' ? 'Hi→Lo' : 'Lo→Hi'}
                                </span>
                              ) : <ArrowUpDown className="w-3 h-3 opacity-40" />}
                            </button>
                          </th>
                          <th className="p-3">
                            <button type="button" onClick={() => toggleModalQuizSort('percentage')} className="inline-flex items-center gap-1 hover:text-black dark:hover:text-white transition">
                              <span>Percentage</span>
                              {modalQuizSort.column === 'percentage' ? (
                                <span className="inline-flex items-center gap-0.5 text-[10px] font-mono bg-slate-900 text-white dark:bg-white dark:text-black px-1 py-0.5 rounded">
                                  {modalQuizSort.direction === 'desc' ? 'Hi→Lo' : 'Lo→Hi'}
                                </span>
                              ) : <ArrowUpDown className="w-3 h-3 opacity-40" />}
                            </button>
                          </th>
                          <th className="p-3">
                            <button type="button" onClick={() => toggleModalQuizSort('result')} className="inline-flex items-center gap-1 hover:text-black dark:hover:text-white transition">
                              <span>Result</span>
                              {modalQuizSort.column === 'result' ? (modalQuizSort.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-40" />}
                            </button>
                          </th>
                          <th className="p-3">
                            <button type="button" onClick={() => toggleModalQuizSort('date')} className="inline-flex items-center gap-1 hover:text-black dark:hover:text-white transition">
                              <span>Date Completed</span>
                              {modalQuizSort.column === 'date' ? (modalQuizSort.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-40" />}
                            </button>
                          </th>
                        </tr>
                        <tr className="bg-slate-50/90 dark:bg-zinc-950 border-t border-slate-200 dark:border-zinc-800 font-normal align-top">
                          <th className="p-1.5 space-y-1">
                            <select
                              value={modalQuizSort.column === 'topic' ? modalQuizSort.direction : 'default'}
                              onChange={e => setModalQuizSort(e.target.value === 'default' ? { column: null, direction: 'asc' } : { column: 'topic', direction: e.target.value as 'asc' | 'desc' })}
                              className="w-full px-1.5 py-0.5 text-xs rounded-md bg-white dark:bg-black border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-slate-100 font-semibold"
                            >
                              <option value="default">Order: Default</option>
                              <option value="asc">A → Z</option>
                              <option value="desc">Z → A</option>
                            </select>
                            <input
                              type="text"
                              value={modalQuizFilters.topic}
                              onChange={e => setModalQuizFilters(prev => ({ ...prev, topic: e.target.value }))}
                              placeholder="Filter topic..."
                              className="w-full px-1.5 py-0.5 text-xs rounded-md bg-white dark:bg-black border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 font-medium"
                            />
                          </th>
                          <th className="p-1.5">
                            <select
                              value={analysisSubjectFilter}
                              onChange={e => setAnalysisSubjectFilter(e.target.value as any)}
                              className="w-full px-1.5 py-0.5 text-xs rounded-md bg-white dark:bg-black border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-slate-100 font-medium"
                            >
                              <option value="all">All</option>
                              <option value="biology">Biology</option>
                              <option value="chemistry">Chemistry</option>
                              <option value="physics">Physics</option>
                            </select>
                          </th>
                          <th className="p-1.5">
                            <select
                              value={modalQuizSort.column === 'score' ? modalQuizSort.direction : 'default'}
                              onChange={e => setModalQuizSort(e.target.value === 'default' ? { column: null, direction: 'asc' } : { column: 'score', direction: e.target.value as 'asc' | 'desc' })}
                              className="w-full px-1.5 py-0.5 text-xs rounded-md bg-white dark:bg-black border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-slate-100 font-semibold"
                            >
                              <option value="default">Order: Default</option>
                              <option value="desc">High → Low</option>
                              <option value="asc">Low → High</option>
                            </select>
                          </th>
                          <th className="p-1.5 space-y-1">
                            <select
                              value={modalQuizSort.column === 'percentage' ? modalQuizSort.direction : 'default'}
                              onChange={e => setModalQuizSort(e.target.value === 'default' ? { column: null, direction: 'asc' } : { column: 'percentage', direction: e.target.value as 'asc' | 'desc' })}
                              className="w-full px-1.5 py-0.5 text-xs rounded-md bg-white dark:bg-black border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-slate-100 font-semibold"
                            >
                              <option value="default">Order: Default</option>
                              <option value="desc">High → Low</option>
                              <option value="asc">Low → High</option>
                            </select>
                            <select
                              value={modalQuizFilters.scoreRange}
                              onChange={e => setModalQuizFilters(prev => ({ ...prev, scoreRange: e.target.value as any }))}
                              className="w-full px-1.5 py-0.5 text-xs rounded-md bg-white dark:bg-black border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-slate-100 font-medium"
                            >
                              <option value="all">All %</option>
                              <option value="high">≥ 80%</option>
                              <option value="mid">50–79%</option>
                              <option value="low">&lt; 50%</option>
                            </select>
                          </th>
                          <th className="p-1.5">
                            <select
                              value={modalQuizFilters.result}
                              onChange={e => setModalQuizFilters(prev => ({ ...prev, result: e.target.value as any }))}
                              className="w-full px-1.5 py-0.5 text-xs rounded-md bg-white dark:bg-black border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-slate-100 font-medium"
                            >
                              <option value="all">All</option>
                              <option value="passed">Green Light</option>
                              <option value="review">Needs Review</option>
                            </select>
                          </th>
                          <th className="p-1.5 space-y-1">
                            <select
                              value={modalQuizSort.column === 'date' ? modalQuizSort.direction : 'default'}
                              onChange={e => setModalQuizSort(e.target.value === 'default' ? { column: null, direction: 'asc' } : { column: 'date', direction: e.target.value as 'asc' | 'desc' })}
                              className="w-full px-1.5 py-0.5 text-xs rounded-md bg-white dark:bg-black border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-slate-100 font-semibold"
                            >
                              <option value="default">Order: Default</option>
                              <option value="desc">Newest → Oldest</option>
                              <option value="asc">Oldest → Newest</option>
                            </select>
                            {(modalQuizFilters.topic || modalQuizFilters.result !== 'all' || modalQuizFilters.scoreRange !== 'all' || modalQuizSort.column) && (
                              <button
                                type="button"
                                onClick={() => {
                                  setModalQuizSort({ column: null, direction: 'asc' });
                                  setModalQuizFilters({ topic: '', result: 'all', scoreRange: 'all' });
                                  setAnalysisSubjectFilter('all');
                                }}
                                className="w-full px-2 py-1 rounded-lg bg-white dark:bg-black border border-slate-300 dark:border-zinc-700 text-[10px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
                              >
                                Reset
                              </button>
                            )}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-zinc-800 bg-white dark:bg-black">
                        {filteredQuizzes.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-6 text-center text-xs text-slate-500">
                              No quiz results match your column filters.
                            </td>
                          </tr>
                        ) : filteredQuizzes.map(quiz => (
                          <tr key={quiz.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/40 transition">
                            <td className="p-3">
                              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <span className="font-mono px-1.5 py-0.5 rounded bg-[#FDFBF7] dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700">{quiz.code}</span>
                                <span>{quiz.title}</span>
                              </div>
                            </td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded capitalize font-bold text-[10px] bg-[#EBF3F5] dark:bg-zinc-900 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-zinc-700">
                                {quiz.subject}
                              </span>
                            </td>
                            <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">
                              {quiz.score} / {quiz.total}
                            </td>
                            <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">
                              {quiz.percentage}%
                            </td>
                            <td className="p-3">
                              {quiz.passed ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#EBF3F5] dark:bg-zinc-900 text-slate-900 dark:text-white border border-black dark:border-white">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                  <span>Green Light (Passed)</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                                  <AlertCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                                  <span>Needs Review</span>
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-slate-500 text-[11px] font-mono">
                              {quiz.date ? new Date(quiz.date).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recorded'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* TRAFFIC LIGHT STATUS & WEAK AREAS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Traffic Light Ratings */}
                <div className="p-4 rounded-2xl bg-[#FDFBF7] dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
                    <span>Self-Rated Traffic Lights</span>
                    <span className="text-[10px] text-slate-500">{Object.keys(trafficLights).length} rated</span>
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2.5 rounded-xl bg-white dark:bg-black border border-slate-300 dark:border-zinc-700 text-center">
                      <div className="text-lg font-bold text-slate-900 dark:text-white font-mono">{greenLights.length}</div>
                      <div className="text-[10px] text-slate-700 dark:text-slate-300 font-bold">🟢 Green (Confident)</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white dark:bg-black border border-slate-300 dark:border-zinc-700 text-center">
                      <div className="text-lg font-bold text-slate-900 dark:text-white font-mono">{orangeLights.length}</div>
                      <div className="text-[10px] text-slate-700 dark:text-slate-300 font-bold">🟠 Amber (Partial)</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white dark:bg-black border border-slate-300 dark:border-zinc-700 text-center">
                      <div className="text-lg font-bold text-slate-900 dark:text-white font-mono">{redLights.length}</div>
                      <div className="text-[10px] text-slate-700 dark:text-slate-300 font-bold">🔴 Red (Needs Help)</div>
                    </div>
                  </div>
                  {redLights.length > 0 && (
                    <div className="text-[11px] text-slate-700 dark:text-slate-300 pt-1">
                      <strong>Red topics requiring intervention:</strong> {redLights.map(([code]) => code).join(', ')}
                    </div>
                  )}
                </div>

                {/* Priority Weak Areas */}
                <div className="p-4 rounded-2xl bg-[#FDFBF7] dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
                    <span>Identified Weak Areas</span>
                  </h4>
                  {selectedStudentForAnalysis.weakTopics && selectedStudentForAnalysis.weakTopics.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {selectedStudentForAnalysis.weakTopics.map((wt, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-bold">
                          {wt}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-emerald-700 dark:text-emerald-400 pt-2 font-bold">
                      No critical weak topics flagged. Student is performing consistently across evaluated topics.
                    </p>
                  )}
                </div>
              </div>
                </>
              )}

              {studentModalTab === 'game_collection' && (
                <div className="space-y-6">
                  {/* Level, XP, Gold & Active Loadout Overview */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="bg-[#FDFBF7] dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600 dark:text-slate-400 font-medium">Player Level</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">{xpProgress.progressPct}%</span>
                      </div>
                      <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                        Level {effectiveLevel}
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden">
                        <div
                          className="h-full bg-slate-900 dark:bg-white rounded-full"
                          style={{ width: `${xpProgress.progressPct}%` }}
                        />
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                        {xpTotal} total XP ({xpProgress.currentLevelXp}/{xpProgress.nextLevelXp} to next)
                      </div>
                    </div>

                    <div className="bg-[#FDFBF7] dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Gold Balance</span>
                        <button
                          type="button"
                          onClick={() => openRewardModal([{
                            studentId: selectedStudentForAnalysis.studentId,
                            name: selectedStudentForAnalysis.name,
                            email: selectedStudentForAnalysis.email
                          }], 'gold')}
                          className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
                        >
                          +Award Gold
                        </button>
                      </div>
                      <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums flex items-center gap-2 my-1">
                        <Coins className="w-5 h-5 text-amber-600" />
                        <span>{studentGold}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                        Materials: {activeGameProfile?.wood ?? 25}W · {activeGameProfile?.brick ?? 15}B · {activeGameProfile?.metal ?? 10}M
                      </div>
                    </div>

                    <div className="bg-[#FDFBF7] dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col justify-between">
                      <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">Equipped Skin</div>
                      <div className="flex items-center gap-2.5 my-1">
                        <img
                          src={equippedSkinDef.portraitPath || equippedSkinDef.spritePath || `/assets/characters/${equippedSkinDef.id}.png`}
                          alt={equippedSkinDef.name}
                          className="w-9 h-9 rounded-lg object-contain bg-[#EDE6D8] dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 p-0.5 pixelated"
                        />
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-slate-900 dark:text-white truncate">{equippedSkinDef.name}</div>
                          <div className="text-[11px] text-slate-500 capitalize">{equippedSkinDef.rarity}</div>
                        </div>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                        {unlockedSkinCountModal} of {ALL_FANTASY_SKINS.length} skins unlocked
                      </div>
                    </div>

                    <div className="bg-[#FDFBF7] dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col justify-between">
                      <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">Equipped Weapon</div>
                      <div className="flex items-center gap-2.5 my-1">
                        <span className="text-2xl leading-none">{equippedWeaponDef.icon}</span>
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-slate-900 dark:text-white truncate">{equippedWeaponDef.name}</div>
                          <div className="text-[11px] text-slate-500 capitalize">
                            {equippedWeaponDef.rarity} · {equippedWeaponDef.stats?.damage || 18} DMG
                          </div>
                        </div>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                        {unlockedWeaponCountModal} of {ALL_WEAPON_ITEMS.length} weapons unlocked
                      </div>
                    </div>
                  </div>

                  {/* Booster / Weapon Packs Section */}
                  <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          <span>Weapon &amp; Science Booster Packs ({totalUnopenedPacks} Unopened)</span>
                        </h4>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400">
                          Gifted booster packs appear as free pack opens in the student's Shop.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => openRewardModal([{
                          studentId: selectedStudentForAnalysis.studentId,
                          name: selectedStudentForAnalysis.name,
                          email: selectedStudentForAnalysis.email
                        }], 'booster_pack')}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-black text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Gift className="w-3.5 h-3.5" />
                        <span>Grant Booster Pack</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {BOOSTER_PACKS.map((pack) => {
                        const count = Math.max(0, Number(giftedPacksMap[pack.id] || 0));
                        return (
                          <div
                            key={pack.id}
                            className="p-3.5 rounded-xl bg-[#FDFBF7] dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 flex flex-col justify-between space-y-2.5"
                          >
                            <div>
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">{pack.badge}</span>
                                <span className={`text-xs font-mono font-bold tabular-nums ${count > 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500'}`}>
                                  {count} Unopened
                                </span>
                              </div>
                              <div className="text-xs font-bold text-slate-900 dark:text-white mt-1">{pack.name}</div>
                            </div>
                            <button
                              type="button"
                              onClick={() => openRewardModal([{
                                studentId: selectedStudentForAnalysis.studentId,
                                name: selectedStudentForAnalysis.name,
                                email: selectedStudentForAnalysis.email
                              }], 'booster_pack', pack.id)}
                              className="w-full py-1.5 rounded-lg bg-white dark:bg-black hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-zinc-700 text-[11px] font-bold cursor-pointer transition"
                            >
                              + Award {pack.badge}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Weapon Collection / Armory Section */}
                  <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <Crosshair className="w-4 h-4" />
                          <span>Weapon Collection ({unlockedWeaponCountModal} / {ALL_WEAPON_ITEMS.length})</span>
                        </h4>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400">
                          Equipped, unlocked, and locked arena weapons for this student.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => openRewardModal([{
                          studentId: selectedStudentForAnalysis.studentId,
                          name: selectedStudentForAnalysis.name,
                          email: selectedStudentForAnalysis.email
                        }], 'weapon')}
                        className="px-3 py-1.5 rounded-lg bg-white dark:bg-black hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-900 dark:text-white border border-slate-300 dark:border-zinc-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Gift className="w-3.5 h-3.5" />
                        <span>Award Weapon</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {sortedWeaponsForModal.map((weapon) => {
                        const isOwned = weapon.price === 0 || weapon.id === 'wpn_starter_blaster' || weapon.id === 'bunsen_burner' || studentInventory.includes(weapon.id);
                        const isEquipped = activeGameProfile?.equippedWeapon === weapon.id;
                        const rankInfo = RARITY_RANK[weapon.rarity];

                        return (
                          <div
                            key={weapon.id}
                            className={`p-3 rounded-xl border flex items-start justify-between gap-2.5 ${
                              isEquipped
                                ? 'bg-[#EBF3F5] dark:bg-zinc-900 border-black dark:border-white'
                                : isOwned
                                ? 'bg-white dark:bg-black border-slate-300 dark:border-zinc-700'
                                : 'bg-slate-50/70 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 opacity-75'
                            }`}
                          >
                            <div className="flex items-start gap-2.5 min-w-0">
                              <span className="text-xl leading-none mt-0.5 shrink-0">{weapon.icon}</span>
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{weapon.name}</div>
                                <div className="text-[11px] text-slate-600 dark:text-slate-400 tabular-nums">
                                  {rankInfo?.label || weapon.rarity} · {weapon.stats?.damage || 18} DMG · {weapon.stats?.fireRate || 2.5}/s
                                </div>
                                <div className="text-[10px] font-bold mt-0.5">
                                  {isEquipped ? (
                                    <span className="text-emerald-700 dark:text-emerald-400">Equipped</span>
                                  ) : isOwned ? (
                                    <span className="text-slate-600 dark:text-slate-400">Unlocked</span>
                                  ) : (
                                    <span className="text-slate-500">Locked</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            {!isOwned && (
                              <button
                                type="button"
                                onClick={() => openRewardModal([{
                                  studentId: selectedStudentForAnalysis.studentId,
                                  name: selectedStudentForAnalysis.name,
                                  email: selectedStudentForAnalysis.email
                                }], 'weapon', weapon.id)}
                                className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-200 text-white dark:text-black text-[10px] font-bold shrink-0 cursor-pointer"
                              >
                                Award
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Skin Collection Section */}
                  <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <Layers className="w-4 h-4" />
                          <span>Skin Collection ({unlockedSkinCountModal} / {ALL_FANTASY_SKINS.length})</span>
                        </h4>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400">
                          View unlocked champions or award missing skins directly.
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        {(['all', 'unlocked', 'locked'] as const).map((mode) => (
                          <button
                            key={mode}
                            type="button"
                            onClick={() => setSkinCollectionFilter(mode)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border capitalize cursor-pointer transition ${
                              skinCollectionFilter === mode
                                ? 'bg-slate-900 text-white dark:bg-white dark:text-black border-black dark:border-white'
                                : 'bg-[#FDFBF7] dark:bg-zinc-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-zinc-700'
                            }`}
                          >
                            {mode === 'all' ? `All (${ALL_FANTASY_SKINS.length})` : mode === 'unlocked' ? `Unlocked (${unlockedSkinCountModal})` : `Locked (${ALL_FANTASY_SKINS.length - unlockedSkinCountModal})`}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                      {visibleSkinsForModal.map((skin) => {
                        const isOwned = skin.id === 'cultist' || studentUnlockedSkins.includes(skin.id);
                        const isEquipped = equippedSkinId === skin.id || FANTASY_SKIN_ALIASES[equippedSkinId] === skin.id;
                        const rankInfo = RARITY_RANK[skin.rarity];

                        return (
                          <div
                            key={skin.id}
                            className={`p-3 rounded-xl border flex items-center justify-between gap-2.5 ${
                              isEquipped
                                ? 'bg-[#EBF3F5] dark:bg-zinc-900 border-black dark:border-white'
                                : isOwned
                                ? 'bg-white dark:bg-black border-slate-300 dark:border-zinc-700'
                                : 'bg-slate-50/70 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 opacity-75'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="relative shrink-0">
                                <img
                                  src={skin.portraitPath || skin.spritePath || `/assets/characters/${skin.id}.png`}
                                  alt={skin.name}
                                  className={`w-10 h-10 rounded-lg object-contain bg-[#EDE6D8] dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 p-0.5 pixelated ${isOwned ? '' : 'grayscale opacity-60'}`}
                                />
                                {!isOwned && (
                                  <Lock className="w-3 h-3 text-slate-700 dark:text-slate-300 absolute -top-1 -right-1 bg-white dark:bg-black rounded-full p-0.5 border border-slate-300" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{skin.name}</div>
                                <div className="text-[11px] text-slate-600 dark:text-slate-400 tabular-nums">
                                  {rankInfo?.label || skin.rarity} · DEF {skin.defense} · SPD {skin.speed}
                                </div>
                                <div className="text-[10px] font-bold">
                                  {isEquipped ? (
                                    <span className="text-emerald-700 dark:text-emerald-400">Equipped</span>
                                  ) : isOwned ? (
                                    <span className="text-slate-600 dark:text-slate-400">Unlocked</span>
                                  ) : (
                                    <span className="text-slate-500">Locked</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {!isOwned && (
                              <button
                                type="button"
                                onClick={() => openRewardModal([{
                                  studentId: selectedStudentForAnalysis.studentId,
                                  name: selectedStudentForAnalysis.name,
                                  email: selectedStudentForAnalysis.email
                                }], 'skin', skin.id)}
                                className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-200 text-white dark:text-black text-[10px] font-bold shrink-0 cursor-pointer"
                              >
                                Award
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Reward History Log */}
                  <div className="bg-[#FDFBF7] dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 space-y-2.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Instructor Reward History ({rewardLog.length})
                    </h4>
                    {rewardLog.length === 0 ? (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        No manual instructor rewards have been granted to this student yet.
                      </p>
                    ) : (
                      <div className="divide-y divide-slate-200 dark:divide-zinc-800">
                        {rewardLog.slice(0, 10).map((entry) => (
                          <div key={entry.id} className="py-2 flex items-center justify-between gap-3 text-xs">
                            <div className="min-w-0">
                              <span className="font-bold text-slate-900 dark:text-white">
                                {entry.rewardType === 'gold'
                                  ? `+${entry.quantity} Gold`
                                  : entry.rewardType === 'booster_pack'
                                  ? `${entry.quantity}× ${entry.itemName}`
                                  : entry.itemName}
                              </span>
                              <span className="text-slate-500 dark:text-slate-400 ml-2">
                                by {entry.awardedBy}{entry.note ? ` · "${entry.note}"` : ''}
                              </span>
                            </div>
                            <span className="text-[11px] font-mono text-slate-500 tabular-nums shrink-0">
                              {new Date(entry.awardedAt).toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Modal Actions Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-zinc-800 flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedStudentForAnalysis(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-black hover:bg-slate-100 border border-black dark:border-white transition"
                >
                  Close Analysis
                </button>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      const student = {
                        studentId: selectedStudentForAnalysis.studentId,
                        name: selectedStudentForAnalysis.name
                      };
                      handleOpenMoveModalSingle(student, selectedClass?.id, selectedClass?.name);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-900 dark:text-white bg-[#EBF3F5] dark:bg-zinc-900 hover:bg-[#FDFBF7] border-2 border-black dark:border-white transition flex items-center gap-1.5 shadow-xs"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    <span>Move Class</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const studentId = selectedStudentForAnalysis.studentId;
                      setSelectedStudentForAnalysis(null);
                      setDashboardTab('tasks');
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 dark:text-black transition flex items-center gap-1.5 shadow-xs border border-black"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Assign Task to This Student</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Move Student(s) to Another Class Modal */}
      {showMoveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-black border-2 border-black dark:border-white rounded-2xl max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-xl animate-in zoom-in-95 duration-200 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#EBF3F5] dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 flex items-center justify-center">
                  <ArrowRightLeft className="w-5 h-5 text-slate-800 dark:text-slate-200" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {studentsToMove.length === 1 ? 'Move Student to Another Class' : `Move ${studentsToMove.length} Students to Another Class`}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    From: <span className="text-slate-900 dark:text-white font-bold">{studentsToMove[0]?.currentClassName || 'Current Class'}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!movingStudents) {
                    setShowMoveModal(false);
                    setStudentsToMove([]);
                  }
                }}
                disabled={movingStudents}
                className="p-1.5 rounded-lg text-slate-500 hover:text-black dark:hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Students Selected List */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {studentsToMove.length === 1 ? 'Student to Reassign:' : `Selected Students (${studentsToMove.length}):`}
              </label>
              <div className="max-h-32 overflow-y-auto p-2.5 rounded-xl bg-[#FDFBF7] dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-1">
                {studentsToMove.map(s => (
                  <div key={s.studentId} className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-white dark:bg-black border border-slate-200 dark:border-zinc-800">
                    <span className="font-bold text-slate-900 dark:text-white">{s.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">ID: {s.studentId.slice(0, 10)}...</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Target Class Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Select Destination Class <span className="text-rose-600">*</span>
              </label>
              {(() => {
                const currentSrcId = studentsToMove[0]?.currentClassId;
                const allCandidateClasses = classes.filter(c => c.id !== currentSrcId);

                if (allCandidateClasses.length === 0) {
                  return (
                    <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-bold">
                      No other classes available to transfer into. Please create a new class first.
                    </div>
                  );
                }

                return (
                  <select
                    value={targetClassIdForMove}
                    onChange={(e) => setTargetClassIdForMove(e.target.value)}
                    disabled={movingStudents}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FDFBF7] dark:bg-black border-2 border-black dark:border-white text-slate-900 dark:text-slate-100 text-xs font-medium"
                  >
                    {allCandidateClasses.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.subject && c.subject !== 'all' ? `(${c.subject})` : ''} — Code: {c.classCode || 'Standard'} ({c.studentCount || 0} students)
                      </option>
                    ))}
                  </select>
                );
              })()}
            </div>

            {/* Progress Preservation Guarantee Info Box */}
            <div className="p-3.5 rounded-2xl bg-[#EBF3F5] dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 space-y-1.5 text-xs text-slate-800 dark:text-slate-200">
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Progress & Records Guaranteed</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                Reassigning preserves all completed lesson decks (106/106), quiz score breakdowns, confidence traffic lights (Green/Amber/Red), identified weak topics, XP, and badges seamlessly.
              </p>
            </div>

            {/* In-app Notification Toggle */}
            <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-800 dark:text-slate-200 select-none font-medium">
              <input
                type="checkbox"
                checked={notifyStudentOnMove}
                onChange={(e) => setNotifyStudentOnMove(e.target.checked)}
                disabled={movingStudents}
                className="rounded border-black dark:border-white bg-[#FDFBF7] dark:bg-black text-slate-900 w-4 h-4"
              />
              <span>Send in-app notification to student(s) about this class transfer</span>
            </label>

            {/* Modal Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowMoveModal(false);
                  setStudentsToMove([]);
                }}
                disabled={movingStudents}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-black hover:bg-slate-100 border border-black dark:border-white transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmMoveStudents}
                disabled={movingStudents || !targetClassIdForMove}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-black font-bold text-xs transition shadow-xs border border-black flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {movingStudents ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin"></div>
                    <span>Moving Student(s)...</span>
                  </>
                ) : (
                  <>
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    <span>Confirm Class Transfer</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recalculate Past Quiz Results Summary Modal */}
      {updateResultsModalSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-black border-2 border-black dark:border-white rounded-2xl max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-xl animate-in zoom-in-95 duration-200 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#EBF3F5] dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Quiz Parameters Recalculation Complete</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">All past records synchronized to new grading rules</p>
                </div>
              </div>
              <button
                onClick={() => setUpdateResultsModalSummary(null)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-black dark:hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded-2xl bg-[#FDFBF7] dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
                <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
                  {updateResultsModalSummary.subtopicResultsUpdatedCount}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 font-bold mt-0.5">Quiz Grades Updated</div>
              </div>
              <div className="p-3 rounded-2xl bg-[#FDFBF7] dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
                <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
                  {updateResultsModalSummary.taskSubmissionsUpdatedCount}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 font-bold mt-0.5">Task Submissions Updated</div>
              </div>
            </div>

            {/* Parameter Legend */}
            <div className="p-3.5 rounded-2xl bg-[#EBF3F5] dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 space-y-2 text-xs">
              <div className="font-bold text-slate-900 dark:text-white">Active Grading Parameters Applied:</div>
              <div className="space-y-1.5 text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                  <span className="font-bold text-slate-900 dark:text-white">Green Grade:</span>
                  <span>80% or higher score (Mastery)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></span>
                  <span className="font-bold text-slate-900 dark:text-white">Amber / Orange Grade:</span>
                  <span>50%, 60%, 70% score (In progress)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0"></span>
                  <span className="font-bold text-slate-900 dark:text-white">Red Grade:</span>
                  <span>40% or less score (Needs revision)</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setUpdateResultsModalSummary(null)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-black font-bold text-xs transition shadow-xs border border-black"
              >
                Close &amp; View Analytics
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instructor Reward Modal (Single Student or Batch) */}
      {rewardModalConfig.isOpen && (
        <StudentRewardModal
          isOpen={rewardModalConfig.isOpen}
          onClose={() => setRewardModalConfig(prev => ({ ...prev, isOpen: false }))}
          targets={rewardModalConfig.targets}
          instructor={currentUser}
          studentProfiles={studentGameProfiles}
          initialRewardType={rewardModalConfig.initialRewardType}
          initialItemId={rewardModalConfig.initialItemId}
          onRewardSuccess={(message, updatedProfiles) => {
            setStudentGameProfiles(prev => ({ ...prev, ...updatedProfiles }));
            setActionNotice(message);
            setTimeout(() => setActionNotice(null), 5000);
          }}
        />
      )}
    </div>
  );
};
