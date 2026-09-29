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
  UserCheck,
  X
} from 'lucide-react';
import { 
  getActiveGoogleSlideSubtopics, 
  saveGoogleSlidesOverride, 
  batchSaveGoogleSlidesOverrides, 
  resetGoogleSlidesOverrides, 
  formatGoogleSlidesUrl, 
  GoogleSlideSubtopic 
} from '../data/googleSlidesRegistry';
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
  INITIAL_INSTRUCTOR_EMAILS
} from '../services/firestoreService';
import { UserProfile, ScienceSubject } from '../types';

interface StudentRosterItem {
  id: string;
  name: string;
  tier: 'Core' | 'Extended';
  progressPct: number;
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
}

export const InstructorDashboard: React.FC<InstructorDashboardProps> = ({ 
  currentUser,
  onSwitchToStudentMode, 
  onNavigateToLessons 
}) => {
  const [dashboardTab, setDashboardTab] = useState<'classes' | 'invites' | 'roster' | 'drive' | 'slides'>('classes');
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

  // Create class modal state
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newClassName, setNewClassName] = useState<string>('');
  const [newClassSubject, setNewClassSubject] = useState<ScienceSubject | 'all'>('all');
  const [newClassCustomCode, setNewClassCustomCode] = useState<string>('');
  const [newClassDesc, setNewClassDesc] = useState<string>('');
  const [creatingClass, setCreatingClass] = useState<boolean>(false);

  // Load classes created by this instructor
  const loadInstructorClasses = async () => {
    setLoadingClasses(true);
    try {
      const result = await fetchClassesByInstructor(currentUser.id);
      setClasses(result);
      if (result.length > 0 && !selectedClass) {
        setSelectedClass(result[0]);
      }
    } catch (err) {
      console.error('Failed to load instructor classes:', err);
    } finally {
      setLoadingClasses(false);
    }
  };

  useEffect(() => {
    loadInstructorClasses();
  }, [currentUser.id]);

  // Load students for selected class
  useEffect(() => {
    let isMounted = true;
    async function loadStudents() {
      if (!selectedClass) {
        setClassStudents([]);
        return;
      }
      setLoadingStudents(true);
      try {
        const students = await fetchStudentsInClass(selectedClass.id);
        if (isMounted) {
          setClassStudents(students);
        }
      } catch (err) {
        console.error('Failed to load students in class:', err);
      } finally {
        if (isMounted) setLoadingStudents(false);
      }
    }
    loadStudents();
    return () => { isMounted = false; };
  }, [selectedClass?.id]);

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
      setSyncedDriveSlides(result.presentations || []);
      setDriveSyncStatusMessage(result.message);
    } catch (err: any) {
      console.error('Failed to organize drive lessons:', err);
      if (err?.message?.includes('401') || err?.message?.includes('authentication')) {
        clearCachedDriveToken();
      }
      setDriveSyncStatusMessage(`Error organizing lessons: ${err?.message || 'Check folder access or Google sign-in.'}`);
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
      setDriveSyncStatusMessage(`Replaced all lessons. Successfully re-synced ${freshSlides.length} Google Slides presentations!`);
    } catch (err: any) {
      console.error('Failed to replace lessons:', err);
      if (err?.message?.includes('401') || err?.message?.includes('authentication')) {
        clearCachedDriveToken();
      }
      setDriveSyncStatusMessage(`Error replacing lessons: ${err?.message || 'Check folder access or Google sign-in.'}`);
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

  // Convert real enrolled class students into StudentRosterItem
  const rosterStudents: StudentRosterItem[] = useMemo(() => {
    return classStudents.map(std => {
      const bioQuiz = std.quizScores?.['biology'];
      const chemQuiz = std.quizScores?.['chemistry'];
      const physQuiz = std.quizScores?.['physics'];
      const bioScore = bioQuiz && bioQuiz.total > 0 ? Math.round((bioQuiz.score / bioQuiz.total) * 100) : 0;
      const chemScore = chemQuiz && chemQuiz.total > 0 ? Math.round((chemQuiz.score / chemQuiz.total) * 100) : 0;
      const physScore = physQuiz && physQuiz.total > 0 ? Math.round((physQuiz.score / physQuiz.total) * 100) : 0;
      
      const progressPct = Math.min(100, Math.round(((std.completedLessonsCount || 0) / 33) * 100));
      const weakArea = std.weakTopics && std.weakTopics.length > 0 ? std.weakTopics.join(', ') : 'None identified';
      
      let status: 'Excelling' | 'On Track' | 'Intervention Required' = 'On Track';
      if (progressPct >= 80) {
        status = 'Excelling';
      } else if (progressPct < 40 || (std.weakTopics && std.weakTopics.length >= 3)) {
        status = 'Intervention Required';
      }

      return {
        id: std.studentId,
        name: std.name || 'Student',
        tier: std.tier || 'Extended',
        progressPct,
        bioScore,
        chemScore,
        physScore,
        weakArea,
        status
      };
    });
  }, [classStudents]);

  const filteredStudents = rosterStudents.filter(student => {
    const matchSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.weakArea.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTier = tierFilter === 'all' || student.tier === tierFilter;
    const matchStatus = statusFilter === 'all' || student.status === statusFilter;
    return matchSearch && matchTier && matchStatus;
  });

  const filteredSlides = slidesSubtopics.filter(s => {
    if (!slidesSearchTerm.trim()) return true;
    const q = slidesSearchTerm.toLowerCase();
    return s.title.toLowerCase().includes(q) || s.topicCode.toLowerCase().includes(q) || s.subject.toLowerCase().includes(q);
  });

  const avgProgress = rosterStudents.length > 0
    ? Math.round(rosterStudents.reduce((acc, s) => acc + s.progressPct, 0) / rosterStudents.length)
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
      <div className="bg-slate-900 border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
              Instructor & Administrative View
            </span>
            <span className="text-xs font-medium text-slate-400">
              Signed in as: <span className="text-white font-semibold">{currentUser.name}</span> ({currentUser.email})
            </span>
          </div>
          <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Users className="w-7 h-7 text-purple-400" />
            <span>Instructor Teaching & Class Management Hub</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
            Create classes with shareable join codes, track student progress live across Cambridge units, invite fellow instructors, and manage Google Drive lesson folders.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {onSwitchToStudentMode && (
            <button
              onClick={onSwitchToStudentMode}
              className="text-xs px-3.5 py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-2 transition"
              title="Preview the simplified student revision interface"
            >
              <GraduationCap className="w-4 h-4 text-emerald-400" />
              <span>Preview Student View</span>
            </button>
          )}

          <button
            onClick={() => setShowCreateModal(true)}
            className="text-xs px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center gap-2 transition shadow-md shadow-purple-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Class</span>
          </button>
        </div>
      </div>

      {actionNotice && (
        <div className="bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs p-3.5 rounded-2xl flex items-center gap-2 animate-pulse">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold">{actionNotice}</span>
        </div>
      )}

      {/* Dashboard Section Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 flex-wrap">
        <button
          onClick={() => setDashboardTab('classes')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            dashboardTab === 'classes'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>My Classes & Student Tracking ({classes.length})</span>
        </button>

        <button
          onClick={() => setDashboardTab('invites')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            dashboardTab === 'invites'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>Instructor Team & Invites</span>
        </button>

        <button
          onClick={() => setDashboardTab('roster')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            dashboardTab === 'roster'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Cohort Overview Analytics</span>
        </button>

        <button
          onClick={() => setDashboardTab('drive')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            dashboardTab === 'drive'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <FolderSync className="w-4 h-4" />
          <span>Google Drive Folder & Sync Center ({syncedDriveSlides.length})</span>
        </button>

        <button
          onClick={() => setDashboardTab('slides')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            dashboardTab === 'slides'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-800 text-slate-400 hover:text-white'
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
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-400" />
                <span>Active Classes Created by You</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Each class has a unique Class Code. Give this code to your students to track their real-time progress.
              </p>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 self-start transition shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Class</span>
            </button>
          </div>

          {loadingClasses ? (
            <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-3xl">
              <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <span className="text-xs text-slate-400">Loading your classes...</span>
            </div>
          ) : classes.length === 0 ? (
            <div className="p-10 text-center bg-slate-900/60 border border-dashed border-slate-800 rounded-3xl space-y-4">
              <BookOpen className="w-12 h-12 text-slate-600 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-200">No classes created yet</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Create your first class with a specific class code so students can join and you can monitor their progress.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow-md"
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
                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedClass(c)}
                      className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-purple-950/40 border-purple-500 shadow-md shadow-purple-500/10'
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">
                              {c.classCode}
                            </span>
                            <span className="text-[10px] uppercase font-semibold text-slate-400">
                              {c.subject}
                            </span>
                          </div>
                          <h3 className="text-sm font-bold text-white mt-1">{c.name}</h3>
                          {c.description && (
                            <p className="text-xs text-slate-400 line-clamp-1">{c.description}</p>
                          )}
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClass(c.id, c.name);
                          }}
                          className="p-1.5 text-slate-500 hover:text-rose-400 transition"
                          title="Delete class"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-medium">
                          <span className="font-bold text-white">{c.studentCount || 0}</span> students enrolled
                        </span>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyCode(c.classCode);
                          }}
                          className="flex items-center gap-1 text-[11px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-purple-300 font-medium transition"
                          title="Copy class code to share with students"
                        >
                          {copiedCode === c.classCode ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400 font-bold">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy Code</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Class Student Roster & Live Tracking */}
              {selectedClass && (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
                  {/* Class Header Bar */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                          Class Tracking Dashboard
                        </span>
                        <span className="text-xs font-mono font-bold text-emerald-400">
                          Code: {selectedClass.classCode}
                        </span>
                      </div>
                      <h2 className="text-xl font-black text-white">{selectedClass.name}</h2>
                      <p className="text-xs text-slate-400">
                        Instructor: <strong className="text-slate-200">{selectedClass.instructorName}</strong> • Linked to your account
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap">
                      <button
                        onClick={() => handleCopyCode(selectedClass.classCode)}
                        className="px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs font-bold flex items-center gap-1.5 transition"
                      >
                        {copiedCode === selectedClass.classCode ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-400" />
                            <span className="text-emerald-400">Code Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span>Share Class Code ({selectedClass.classCode})</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={handleExportClassCSV}
                        disabled={classStudents.length === 0}
                        className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
                      >
                        <FileDown className="w-4 h-4 text-purple-400" />
                        <span>Export CSV</span>
                      </button>
                    </div>
                  </div>

                  {/* Summary Metric Chips */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
                      <span className="text-xs text-slate-400">Enrolled Students</span>
                      <div className="text-2xl font-black text-white mt-1 font-mono">{classStudents.length}</div>
                      <span className="text-[11px] text-purple-400 mt-0.5 block">Joined with code {selectedClass.classCode}</span>
                    </div>

                    <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
                      <span className="text-xs text-slate-400">Class Average Quiz Score</span>
                      <div className="text-2xl font-black text-emerald-400 mt-1">
                        {classStudents.length > 0 
                          ? Math.round(classStudents.reduce((acc, s) => {
                              const scores = Object.values(s.quizScores || {});
                              if (scores.length === 0) return acc;
                              const studentAvg = scores.reduce((a, b) => a + (b.score / (b.total || 1)), 0) / scores.length;
                              return acc + (studentAvg * 100);
                            }, 0) / classStudents.length)
                          : 0}%
                      </div>
                      <span className="text-[11px] text-slate-400 mt-0.5 block">Across Biology, Chemistry & Physics</span>
                    </div>

                    <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
                      <span className="text-xs text-slate-400">Total Lessons Completed</span>
                      <div className="text-2xl font-black text-sky-400 mt-1 font-mono">
                        {classStudents.reduce((acc, s) => acc + (s.completedLessonsCount || 0), 0)}
                      </div>
                      <span className="text-[11px] text-slate-400 mt-0.5 block">Sum of all student completed decks</span>
                    </div>
                  </div>

                  {/* Students Table */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-white flex items-center justify-between">
                      <span>Enrolled Students & Progress Breakdown</span>
                      <span className="text-xs font-normal text-slate-400">
                        Live progress synced from student activity
                      </span>
                    </h3>

                    {loadingStudents ? (
                      <div className="p-8 text-center text-slate-400 bg-slate-950/40 rounded-2xl border border-slate-800">
                        <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <span className="text-xs">Loading class student roster...</span>
                      </div>
                    ) : classStudents.length === 0 ? (
                      <div className="p-8 text-center bg-slate-950/40 border border-dashed border-slate-800 rounded-2xl space-y-2">
                        <Users className="w-8 h-8 text-slate-600 mx-auto" />
                        <h4 className="text-sm font-bold text-slate-300">No students enrolled yet</h4>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto">
                          Tell students to log in and enter class code <span className="font-mono text-emerald-400 font-bold">{selectedClass.classCode}</span> in "My Classes".
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto rounded-2xl border border-slate-800">
                        <table className="min-w-full text-xs text-left text-slate-200">
                          <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                            <tr>
                              <th className="p-3">Student</th>
                              <th className="p-3">Tier</th>
                              <th className="p-3">Completed Lessons</th>
                              <th className="p-3">Quiz Scores</th>
                              <th className="p-3">Weak Topics (Confidence ≤ 2)</th>
                              <th className="p-3">Last Active</th>
                              <th className="p-3">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800 bg-slate-900/60">
                            {classStudents.map(std => {
                              const bioScore = std.quizScores?.biology ? Math.round((std.quizScores.biology.score / std.quizScores.biology.total) * 100) : '-';
                              const chemScore = std.quizScores?.chemistry ? Math.round((std.quizScores.chemistry.score / std.quizScores.chemistry.total) * 100) : '-';
                              const physScore = std.quizScores?.physics ? Math.round((std.quizScores.physics.score / std.quizScores.physics.total) * 100) : '-';

                              return (
                                <tr key={std.studentId} className="hover:bg-slate-800/40 transition">
                                  <td className="p-3">
                                    <div className="font-semibold text-white">{std.name}</div>
                                    <div className="text-[10px] text-slate-400 font-mono">{std.email}</div>
                                  </td>
                                  <td className="p-3">
                                    <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                                      std.tier === 'Extended' ? 'bg-amber-500/20 text-amber-300' : 'bg-blue-500/20 text-blue-300'
                                    }`}>
                                      {std.tier}
                                    </span>
                                  </td>
                                  <td className="p-3 font-mono font-bold text-emerald-400">
                                    {std.completedLessonsCount} Decks
                                  </td>
                                  <td className="p-3">
                                    <div className="flex items-center gap-1.5 font-mono text-[11px]">
                                      <span className="text-emerald-400" title="Biology">B: {bioScore}%</span>
                                      <span className="text-slate-600">•</span>
                                      <span className="text-sky-400" title="Chemistry">C: {chemScore}%</span>
                                      <span className="text-slate-600">•</span>
                                      <span className="text-amber-400" title="Physics">P: {physScore}%</span>
                                    </div>
                                  </td>
                                  <td className="p-3">
                                    {std.weakTopics && std.weakTopics.length > 0 ? (
                                      <div className="flex flex-wrap gap-1">
                                        {std.weakTopics.slice(0, 3).map((wt, wIdx) => (
                                          <span key={`${wt}-${wIdx}`} className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-semibold">
                                            {wt}
                                          </span>
                                        ))}
                                        {std.weakTopics.length > 3 && (
                                          <span className="text-[10px] text-slate-500">+{std.weakTopics.length - 3}</span>
                                        )}
                                      </div>
                                    ) : (
                                      <span className="text-emerald-400 text-[11px] font-medium">None flagged</span>
                                    )}
                                  </td>
                                  <td className="p-3 text-[11px] text-slate-400">
                                    {std.lastActive ? new Date(std.lastActive).toLocaleDateString() : 'Recently'}
                                  </td>
                                  <td className="p-3">
                                    <button
                                      onClick={() => handleRemoveStudent(std.studentId, std.name)}
                                      className="p-1 text-slate-500 hover:text-rose-400 transition"
                                      title="Remove from class"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
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
      {/* TAB 2: INSTRUCTOR TEAM & INVITATIONS                          */}
      {/* ============================================================= */}
      {dashboardTab === 'invites' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-purple-500/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="max-w-2xl space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  Educator Access Control
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
                <UserPlus className="w-6 h-6 text-purple-400" />
                <span>Invite People as Instructors</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                By default, all people signing in with Google log in as <strong className="text-emerald-400">Students</strong>. To grant educator privileges, enter their Google account email below. Once invited, when they sign in they will automatically receive the <strong className="text-purple-300">Instructor View</strong> and can create and manage classes.
              </p>
            </div>

            {/* Invite Form */}
            <form onSubmit={handleSendInvite} className="max-w-xl flex flex-col sm:flex-row gap-3 pt-2">
              <div className="relative flex-1">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={newInviteEmail}
                  onChange={e => setNewInviteEmail(e.target.value)}
                  placeholder="colleague@school.edu (Google Account)"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <button
                type="submit"
                disabled={inviting || !newInviteEmail.trim()}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-md disabled:opacity-50"
              >
                {inviting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
                  ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-300'
                  : 'bg-red-950/40 border border-red-500/40 text-red-300'
              }`}>
                {inviteStatusMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                )}
                <span>{inviteStatusMsg.text}</span>
              </div>
            )}
          </div>

          {/* Current Instructors & Pending Invites Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-purple-400" />
              <span>Instructors & Invitations</span>
            </h3>

            {/* Permanent Admin note */}
            <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 text-xs flex items-center justify-between text-purple-200">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
                <span>Primary Lead Educator: <strong className="font-mono text-white">corbanb@gisboyshigh.net</strong> (Permanent Instructor Access)</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">
                Owner
              </span>
            </div>

            {instructorInvites.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-slate-950/40 rounded-2xl border border-slate-800">
                No additional instructors invited yet. Invite your colleagues using the form above!
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-800">
                <table className="min-w-full text-xs text-left text-slate-200">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-semibold">
                    <tr>
                      <th className="p-3">Instructor Email</th>
                      <th className="p-3">Invited By</th>
                      <th className="p-3">Invited Date</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-900/60">
                    {instructorInvites.map(inv => (
                      <tr key={inv.id} className="hover:bg-slate-800/40 transition">
                        <td className="p-3 font-mono font-semibold text-white">{inv.email}</td>
                        <td className="p-3 text-slate-300">{inv.invitedByName}</td>
                        <td className="p-3 text-slate-400">{new Date(inv.invitedAt).toLocaleDateString()}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            Instructor Role Active
                          </span>
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => handleDeleteInvite(inv.id, inv.email)}
                            className="text-[11px] text-rose-400 hover:text-rose-300 transition"
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
      {/* TAB 3: COHORT OVERVIEW ANALYTICS (EXISTING ROSTER)           */}
      {/* ============================================================= */}
      {dashboardTab === 'roster' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
              <span className="text-xs text-slate-400 font-medium">Cohort Syllabus Mastery</span>
              <div className="text-2xl font-black text-white mt-1 font-mono">{avgProgress}%</div>
              <div className="text-xs text-slate-400 mt-1 flex items-center gap-1 font-medium">
                <Users className="w-3.5 h-3.5 text-purple-400" />
                <span>{rosterStudents.length} student{rosterStudents.length === 1 ? '' : 's'} enrolled</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
              <span className="text-xs text-slate-400 font-medium">Biology Average (B1–B16)</span>
              <div className="text-2xl font-black text-emerald-400 mt-1 font-mono">{avgBio}%</div>
              <div className="text-xs text-slate-400 mt-1">Based on student quiz scores</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
              <span className="text-xs text-slate-400 font-medium">Chemistry Average (C1–C12)</span>
              <div className="text-2xl font-black text-sky-400 mt-1 font-mono">{avgChem}%</div>
              <div className="text-xs text-slate-400 mt-1">Based on student quiz scores</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
              <span className="text-xs text-slate-400 font-medium">Physics Average (P1–P5)</span>
              <div className="text-2xl font-black text-amber-400 mt-1 font-mono">{avgPhys}%</div>
              <div className="text-xs text-slate-400 mt-1">Based on student quiz scores</div>
            </div>
          </div>

          {/* Student Mastery Breakdown */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Student Mastery Breakdown</span>
                  {selectedClass && (
                    <span className="text-xs font-normal text-slate-400">
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
                    className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.classCode})</option>
                    ))}
                  </select>
                )}

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Search student or weak topic..."
                    className="pl-8 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                <select
                  value={tierFilter}
                  onChange={e => setTierFilter(e.target.value as any)}
                  className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
                >
                  <option value="all">All Tiers</option>
                  <option value="Core">Core</option>
                  <option value="Extended">Extended</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value as any)}
                  className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="Excelling">Excelling</option>
                  <option value="On Track">On Track</option>
                  <option value="Intervention Required">Intervention Required</option>
                </select>

                {rosterStudents.length > 0 && (
                  <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                    title="Export CSV"
                  >
                    <FileDown className="w-3.5 h-3.5 text-purple-400" />
                    <span>CSV</span>
                  </button>
                )}
              </div>
            </div>

            {rosterStudents.length === 0 ? (
              <div className="p-12 text-center bg-slate-950/40 border border-dashed border-slate-800 rounded-2xl space-y-3">
                <Users className="w-12 h-12 text-slate-600 mx-auto" />
                <h3 className="text-base font-bold text-slate-200">No Enrolled Students</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  {selectedClass ? (
                    <>
                      No students have joined <span className="text-purple-300 font-semibold">{selectedClass.name}</span> yet. Share your Class Code <span className="font-mono font-bold text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/60">{selectedClass.classCode}</span> with students so they can join.
                    </>
                  ) : (
                    'Create a class in the Classes tab and share your Class Code with students to view their live syllabus mastery and quiz analytics.'
                  )}
                </p>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="p-8 text-center bg-slate-950/30 border border-slate-800/80 rounded-2xl space-y-1">
                <p className="text-sm font-semibold text-slate-300">No students match filter</p>
                <p className="text-xs text-slate-500">Try adjusting your search query, tier filter, or status filter.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs text-left text-slate-200 border border-slate-800 rounded-xl overflow-hidden">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-semibold">
                    <tr>
                      <th className="p-3 border-b border-slate-800">Student Name</th>
                      <th className="p-3 border-b border-slate-800">Tier</th>
                      <th className="p-3 border-b border-slate-800">Syllabus %</th>
                      <th className="p-3 border-b border-slate-800">Biology</th>
                      <th className="p-3 border-b border-slate-800">Chemistry</th>
                      <th className="p-3 border-b border-slate-800">Physics</th>
                      <th className="p-3 border-b border-slate-800">Priority Weak Topic</th>
                      <th className="p-3 border-b border-slate-800">Status</th>
                      <th className="p-3 border-b border-slate-800">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-900/60">
                    {filteredStudents.map(std => {
                      let statusClass = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
                      if (std.status === 'Intervention Required') {
                        statusClass = 'bg-rose-500/20 text-rose-300 border-rose-500/30';
                      } else if (std.status === 'On Track') {
                        statusClass = 'bg-blue-500/20 text-blue-300 border-blue-500/30';
                      }

                      return (
                        <tr key={std.id} className="hover:bg-slate-800/40 transition">
                          <td className="p-3 font-semibold text-white">{std.name}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                              std.tier === 'Extended' ? 'bg-amber-500/20 text-amber-300' : 'bg-blue-500/20 text-blue-300'
                            }`}>
                              {std.tier}
                            </span>
                          </td>
                          <td className="p-3 font-mono font-bold text-emerald-400">{std.progressPct}%</td>
                          <td className="p-3 font-mono">{std.bioScore}%</td>
                          <td className="p-3 font-mono">{std.chemScore}%</td>
                          <td className="p-3 font-mono">{std.physScore}%</td>
                          <td className="p-3 font-medium text-amber-300">{std.weakArea}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded border text-[10px] font-semibold ${statusClass}`}>
                              {std.status}
                            </span>
                          </td>
                          <td className="p-3">
                            <button
                              onClick={() => handleSendReminder(std.name)}
                              className="text-[11px] px-2.5 py-1 bg-purple-600/30 text-purple-300 border border-purple-500/40 rounded hover:bg-purple-600/50 transition font-medium"
                            >
                              Nudge / Assign
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
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
          <div className="bg-slate-900 border border-purple-500/30 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                    Live Drive Connection
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    Folder ID: {TARGET_DRIVE_FOLDER_ID}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <FolderSync className="w-5 h-5 text-purple-400" />
                  <span>Google Drive Slides Folder Sync</span>
                </h2>
                <p className="text-xs text-slate-400 max-w-2xl">
                  Connect and synchronize official Cambridge IGCSE 0653 lesson slides directly from your Google Drive folder.
                  Files named with topic codes (e.g., <code className="text-purple-300">B1.1 Characteristics...</code>, <code className="text-purple-300">C2.1...</code>) automatically embed inside the corresponding student lesson decks without manual configuration.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <button
                  onClick={handleOrganizeDriveInDashboard}
                  disabled={isOrganizingDrive || isSyncingDrive}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-sm ${
                    isOrganizingDrive
                      ? 'bg-amber-800 text-white animate-pulse'
                      : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-amber-600/30'
                  }`}
                  title="Reads the syllabus code at the start of each file name (e.g. P1.5.1.), creates corresponding subfolders in Google Drive, moves lessons into them, and replaces all synced lessons freshly."
                >
                  <FolderCheck className={`w-4 h-4 ${isOrganizingDrive ? 'animate-spin' : ''}`} />
                  <span>{isOrganizingDrive ? 'Organizing Subfolders...' : 'Sort Lessons into Subfolders (e.g. P1.5.1)'}</span>
                </button>

                <button
                  onClick={handleReplaceAllLessonsInDashboard}
                  disabled={isSyncingDrive || isOrganizingDrive}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-sm ${
                    isSyncingDrive && !isOrganizingDrive
                      ? 'bg-purple-800 text-white animate-pulse'
                      : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/30'
                  }`}
                  title="Clears all existing cached lessons and re-syncs from Drive freshly."
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncingDrive ? 'animate-spin' : ''}`} />
                  <span>Replace All Lessons & Re-Sync</span>
                </button>

                <a
                  href={TARGET_DRIVE_FOLDER_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold transition"
                >
                  <span>Open Drive Folder</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </a>
              </div>
            </div>

            {driveSyncStatusMessage && (
              <div className="mt-4 text-xs px-4 py-3 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-200 flex items-center justify-between">
                <span>{driveSyncStatusMessage}</span>
                <button onClick={() => setDriveSyncStatusMessage(null)} className="text-slate-400 hover:text-white">
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Drive Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-xs text-slate-400">Total Synced Presentations</span>
              <div className="text-2xl font-black text-white mt-1 font-mono">{syncedDriveSlides.length}</div>
              <span className="text-[11px] text-purple-400 mt-0.5 block">Stored locally for instant student access</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-xs text-slate-400">Target Subjects Supported</span>
              <div className="text-2xl font-black text-emerald-400 mt-1">Bio • Chem • Phys</div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">All 33 Cambridge Combined Science units</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-xs text-slate-400">Student Mode Visibility</span>
              <div className="text-2xl font-black text-sky-400 mt-1">Simplified & Clean</div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Drive folders & sync tools hidden from students</span>
            </div>
          </div>

          {/* Synced Files Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Cloud className="w-4 h-4 text-purple-400" />
                <span>Synced Google Slides Presentations ({syncedDriveSlides.length})</span>
              </h3>
            </div>

            {syncedDriveSlides.length === 0 ? (
              <div className="p-8 text-center space-y-3">
                <FolderSync className="w-10 h-10 text-slate-600 mx-auto" />
                <p className="text-sm text-slate-300 font-semibold">No presentations synced from Drive folder yet</p>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Click the <strong>Replace All Lessons & Re-Sync</strong> button above to fetch all slide decks from your folder.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-semibold">
                    <tr>
                      <th className="p-3">Detected Code</th>
                      <th className="p-3">Drive File Name</th>
                      <th className="p-3">Drive File ID</th>
                      <th className="p-3">Subfolder</th>
                      <th className="p-3">Live Slide Link</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {syncedDriveSlides.map((slide, idx) => (
                      <tr key={slide.id || idx} className="hover:bg-slate-800/40">
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            {slide.extractedCode || slide.matchedSubtopicCode || 'Generic'}
                          </span>
                        </td>
                        <td className="p-3 font-medium text-white">{slide.name}</td>
                        <td className="p-3 font-mono text-[10px] text-slate-400">{slide.id}</td>
                        <td className="p-3 text-slate-400">Synced Unit</td>
                        <td className="p-3">
                          <a
                            href={slide.webViewLink || `https://docs.google.com/presentation/d/${slide.id}/edit`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-400 hover:text-purple-300 flex items-center gap-1 font-semibold"
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
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Play className="w-5 h-5 text-emerald-400 fill-current" />
                  <span>Google Slides Curriculum URL Overrides</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Customize the presentation embed URL for each of the 33 syllabus subtopics.
                </p>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={slidesSearchTerm}
                  onChange={e => setSlidesSearchTerm(e.target.value)}
                  placeholder="Filter subtopics (e.g. B2, C9)..."
                  className="pl-8 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-semibold">
                  <tr>
                    <th className="p-3">Code</th>
                    <th className="p-3">Subtopic Title</th>
                    <th className="p-3">Subject</th>
                    <th className="p-3">Current Slides URL / ID</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-900/60">
                  {filteredSlides.map(slide => (
                    <tr key={slide.id || slide.subtopicCode || `${slide.topicCode}-${slide.subtopicCode}`} className="hover:bg-slate-800/40">
                      <td className="p-3 font-mono font-bold text-white">{slide.subtopicCode || slide.topicCode}</td>
                      <td className="p-3 font-medium text-slate-200">{slide.title}</td>
                      <td className="p-3 capitalize text-slate-400">{slide.subject}</td>
                      <td className="p-3 font-mono text-[11px] text-slate-400 truncate max-w-xs">
                        {slide.googleSlidesUrl}
                      </td>
                      <td className="p-3">
                        <a
                          href={slide.googleSlidesUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
                        >
                          <span>Preview</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                    </tr>
                  ))}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-purple-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Create New Class</h3>
                  <p className="text-xs text-slate-400">Linked to your instructor profile</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateClass} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Class Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={newClassName}
                  onChange={e => setNewClassName(e.target.value)}
                  placeholder="e.g. Year 10 IGCSE Science - Set A"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Subject Focus
                </label>
                <select
                  value={newClassSubject}
                  onChange={e => setNewClassSubject(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Sciences (Bio, Chem, Phys)</option>
                  <option value="biology">Biology Focused (B1–B16)</option>
                  <option value="chemistry">Chemistry Focused (C1–C12)</option>
                  <option value="physics">Physics Focused (P1–P5)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Custom Class Code <span className="text-[10px] text-slate-400">(Optional, leaves auto-generated if blank)</span>
                </label>
                <input
                  type="text"
                  value={newClassCustomCode}
                  onChange={e => setNewClassCustomCode(e.target.value.toUpperCase())}
                  placeholder="e.g. SCI-9421 or 9421"
                  maxLength={10}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Description / Period Notes <span className="text-[10px] text-slate-400">(Optional)</span>
                </label>
                <textarea
                  value={newClassDesc}
                  onChange={e => setNewClassDesc(e.target.value)}
                  placeholder="e.g. Period 3 Mon/Wed. Extended tier preparation."
                  rows={2}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingClass || !newClassName.trim()}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow-md shadow-purple-600/30 disabled:opacity-50"
                >
                  {creatingClass ? 'Creating Class...' : 'Create Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
