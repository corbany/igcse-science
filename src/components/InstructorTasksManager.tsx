import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  BookOpen, 
  Award, 
  FileText, 
  Plus, 
  Users, 
  User, 
  Trash2, 
  ArrowRight, 
  Check, 
  X, 
  AlertTriangle, 
  Filter, 
  Search,
  Sparkles,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Bell,
  Layers,
  CheckSquare,
  Mail,
  Copy,
  ExternalLink,
  Settings,
  Send,
  UserCheck
} from 'lucide-react';
import { 
  ClassTask, 
  TaskSubmission, 
  TaskType, 
  TaskProgressStatus, 
  ScienceSubject, 
  UserProfile 
} from '../types';
import { 
  ClassItem, 
  ClassStudentItem, 
  createClassTask, 
  fetchClassTasks, 
  fetchTaskSubmissions, 
  deleteClassTask, 
  updateClassTaskDueDate,
  fetchStudentsInClass,
  notifyStudentsOfTaskAssignment,
  subscribeToClassTasks,
  subscribeToTaskSubmissions
} from '../services/firestoreService';
import { CAMBRIDGE_0653_TOPIC_SUBTOPICS } from '../services/googleDriveService';
import { allSubtopicsData, SubtopicTopicGroup } from '../data/subtopicSlidesData';
import { EmailDispatchModal } from './EmailDispatchModal';

interface InstructorTasksManagerProps {
  currentUser: UserProfile;
  classes: ClassItem[];
  selectedClassId?: string;
  onNavigateToLessons?: (subtopicCode?: string) => void;
}

export const InstructorTasksManager: React.FC<InstructorTasksManagerProps> = ({
  currentUser,
  classes,
  selectedClassId: initialSelectedClassId,
  onNavigateToLessons
}) => {
  const [tasks, setTasks] = useState<ClassTask[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedClassId, setSelectedClassId] = useState<string>(initialSelectedClassId || 'all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'overdue'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Create task modal state
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [creating, setCreating] = useState<boolean>(false);
  const [feedbackNotice, setFeedbackNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New task form state
  const [newTitle, setNewTitle] = useState<string>('Read B1.1 Characteristics of Living Organisms & Complete Practice Quiz');
  const [newDescription, setNewDescription] = useState<string>(
    '1. Open and read through the lesson slides for B1.1: Characteristics of Living Organisms (MRS GREN).\n' +
    '2. Update your understanding using the Traffic Light rating (Green, Amber, or Red).\n' +
    '3. Complete the practice quiz challenge to test your mastery before the deadline.'
  );
  const [newClassId, setNewClassId] = useState<string>(classes[0]?.id || 'all');
  const [newType, setNewType] = useState<TaskType>('both');
  const [newSubject, setNewSubject] = useState<ScienceSubject | 'all'>('biology');
  const [newDueDate, setNewDueDate] = useState<string>(() => {
    // Default due date: 3 days from now at 23:59
    const d = new Date();
    d.setDate(d.getDate() + 3);
    d.setHours(23, 59, 0, 0);
    return d.toISOString().slice(0, 16);
  });
  const [newSubtopicInput, setNewSubtopicInput] = useState<string>('');
  const [selectedSubtopics, setSelectedSubtopics] = useState<string[]>(['B1.1']);
  const [newRequiredQuizLength, setNewRequiredQuizLength] = useState<number>(10);
  const [newRequireSlidesAndTL, setNewRequireSlidesAndTL] = useState<boolean>(true);

  // Subtopic Selector Filter States
  const [subtopicFilterSubject, setSubtopicFilterSubject] = useState<'all' | 'biology' | 'chemistry' | 'physics'>('all');
  const [subtopicFilterTopic, setSubtopicFilterTopic] = useState<string>('all');
  const [subtopicSearchQuery, setSubtopicSearchQuery] = useState<string>('');
  const [showSubtopicBrowser, setShowSubtopicBrowser] = useState<boolean>(true);
  const [sendEmailNotification, setSendEmailNotification] = useState<boolean>(true);
  
  // Individual student targeting
  const [targetAudienceType, setTargetAudienceType] = useState<'entire_class' | 'specific_students'>('entire_class');
  const [classStudents, setClassStudents] = useState<ClassStudentItem[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [loadingStudents, setLoadingStudents] = useState<boolean>(false);

  // Task details and submissions drilldown
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [taskSubmissions, setTaskSubmissions] = useState<Record<string, TaskSubmission[]>>({});
  const [loadingSubmissions, setLoadingSubmissions] = useState<Record<string, boolean>>({});
  const [sendingEmailTaskId, setSendingEmailTaskId] = useState<string | null>(null);
  const [copiedLinkTaskId, setCopiedLinkTaskId] = useState<string | null>(null);
  const [additionalEmailsInput, setAdditionalEmailsInput] = useState<string>('');

  // Email Dispatch & 1-Click Modal state
  const [showSmtpModal, setShowSmtpModal] = useState<boolean>(false);
  const [smtpStatus, setSmtpStatus] = useState<{ configured: boolean; host: string; port: number; secure: boolean; user: string; from: string; hasPassword?: boolean } | null>(null);
  const [lastEmailAction, setLastEmailAction] = useState<{
    taskId: string;
    taskTitle: string;
    count: number;
    method: string;
    smtpConfigured: boolean;
    mailtoUrl?: string;
    gmailComposeUrl?: string;
    warning?: string;
    subject?: string;
    emailText?: string;
    recipients?: { studentName: string; studentEmail: string }[];
  } | null>(null);

  const loadSmtpStatus = async () => {
    // Check if browser-direct EmailJS is configured in localStorage
    try {
      const savedEmailJs = localStorage.getItem('igcse_emailjs_config');
      if (savedEmailJs) {
        const parsed = JSON.parse(savedEmailJs);
        if (parsed.serviceId && parsed.templateId && parsed.publicKey) {
          setSmtpStatus({
            configured: true,
            host: 'EmailJS Browser API',
            port: 443,
            secure: true,
            user: parsed.senderName || currentUser.email || 'Instructor',
            from: parsed.senderName || 'Instructor'
          });
          return;
        }
      }
    } catch {}

    try {
      const res = await fetch('/api/smtp-config');
      if (res.ok) {
        const data = await res.json();
        setSmtpStatus(data);
      }
    } catch {}
  };

  useEffect(() => {
    loadSmtpStatus();
  }, []);

  // Unique topics across allSubtopicsData for dropdown filtering
  const uniqueTopics = useMemo(() => {
    const map = new Map<string, { topicCode: string; topicName: string; subject: ScienceSubject }>();
    allSubtopicsData.forEach(item => {
      if (!map.has(item.topicCode)) {
        map.set(item.topicCode, {
          topicCode: item.topicCode,
          topicName: item.topicName,
          subject: item.subject
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.topicCode.localeCompare(b.topicCode, undefined, { numeric: true }));
  }, []);

  // Filtered subtopics based on user selections
  const filteredSubtopicsList = useMemo(() => {
    return allSubtopicsData.filter(item => {
      if (subtopicFilterSubject !== 'all' && item.subject !== subtopicFilterSubject) {
        return false;
      }
      if (subtopicFilterTopic !== 'all' && item.topicCode !== subtopicFilterTopic) {
        return false;
      }
      if (subtopicSearchQuery.trim()) {
        const q = subtopicSearchQuery.toLowerCase();
        const matchCode = item.subtopicCode.toLowerCase().includes(q);
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchTopic = item.topicName.toLowerCase().includes(q);
        const matchSummary = item.syllabusSummary?.some(s => s.toLowerCase().includes(q));
        if (!matchCode && !matchTitle && !matchTopic && !matchSummary) {
          return false;
        }
      }
      return true;
    });
  }, [subtopicFilterSubject, subtopicFilterTopic, subtopicSearchQuery]);

  // Helper to auto-fill title & description based on selected subtopic, activity type, and exact quiz length
  const autoFillTitleAndDescription = (type: TaskType, codes: string[], quizLen: number = newRequiredQuizLength) => {
    if (codes.length === 0) return;
    const primaryCode = codes[0];
    const subtopicInfo = allSubtopicsData.find(s => s.subtopicCode.toUpperCase() === primaryCode.toUpperCase());
    const titlePart = subtopicInfo ? `${primaryCode} ${subtopicInfo.title}` : primaryCode;
    const safeLen = Math.max(1, Math.min(40, Number(quizLen) || 10));
    
    if (type === 'both') {
      setNewTitle(`Read ${titlePart} Slides, Traffic Light Quiz & ${safeLen}-Q Practice Quiz`);
      setNewDescription(
        `1. Open and read through ALL lesson slides for ${titlePart}.\n` +
        `2. Complete the 10-question Traffic Light Mastery Quiz inside Lesson Slides.\n` +
        `3. Complete the Practice Quiz choosing the exact quiz length of ${safeLen} questions (your % for ${safeLen} Qs will be recorded).`
      );
    } else if (type === 'slides_traffic_light') {
      setNewTitle(`Read ${titlePart} & Complete Traffic Light Quiz`);
      setNewDescription(
        `1. Read through ALL lesson slides for ${titlePart}.\n` +
        `2. Complete the Traffic Light Mastery Quiz to verify your understanding.`
      );
    } else if (type === 'practice_quiz') {
      setNewTitle(`${safeLen}-Question Practice Quiz: ${titlePart}`);
      setNewDescription(
        `1. Read all assigned slides for ${titlePart} and complete the Traffic Light Quiz.\n` +
        `2. Complete the ${safeLen}-question practice quiz (choose exact length ${safeLen} in the Quiz Engine) before the deadline.`
      );
    }
  };

  // Subscribe to real-time live updates for tasks across owned and shared classes
  useEffect(() => {
    setLoading(true);
    const userClassIds = classes.map(c => c.id);
    const unsubscribe = subscribeToClassTasks(
      selectedClassId === 'all' ? undefined : selectedClassId,
      currentUser.id,
      (liveTasks) => {
        setTasks(liveTasks);
        setLoading(false);
      },
      userClassIds
    );
    return () => unsubscribe();
  }, [selectedClassId, currentUser.id, classes]);

  // Load students when target class changes for modal
  useEffect(() => {
    if (newClassId && newClassId !== 'all') {
      setLoadingStudents(true);
      fetchStudentsInClass(newClassId)
        .then(students => {
          setClassStudents(students);
          setSelectedStudentIds([]);
        })
        .catch(err => console.error('Failed to load class students for assignment:', err))
        .finally(() => setLoadingStudents(false));
    } else {
      setClassStudents([]);
      setSelectedStudentIds([]);
    }
  }, [newClassId]);

  // Live real-time subscription for expanded task submissions
  useEffect(() => {
    if (!expandedTaskId) return;
    const task = tasks.find(t => t.id === expandedTaskId);
    const classId = task?.classId || 'all';

    setLoadingSubmissions(prev => ({ ...prev, [expandedTaskId]: true }));
    const unsubscribe = subscribeToTaskSubmissions(expandedTaskId, classId, (subs) => {
      setTaskSubmissions(prev => ({ ...prev, [expandedTaskId]: subs }));
      setLoadingSubmissions(prev => ({ ...prev, [expandedTaskId]: false }));
    });

    return () => unsubscribe();
  }, [expandedTaskId, tasks]);

  // Toggle expanded task
  const toggleExpandTask = (taskId: string, classId: string) => {
    if (expandedTaskId === taskId) {
      setExpandedTaskId(null);
    } else {
      setExpandedTaskId(taskId);
    }
  };

  const handleAddSubtopic = (code: string) => {
    const clean = code.trim().toUpperCase();
    if (clean && !selectedSubtopics.includes(clean)) {
      const updated = [...selectedSubtopics, clean];
      setSelectedSubtopics(updated);
      autoFillTitleAndDescription(newType, updated);
    }
    setNewSubtopicInput('');
  };

  const handleRemoveSubtopic = (code: string) => {
    const updated = selectedSubtopics.filter(s => s !== code);
    setSelectedSubtopics(updated);
    if (updated.length > 0) {
      autoFillTitleAndDescription(newType, updated);
    }
  };

  const handleToggleSubtopic = (code: string) => {
    const clean = code.trim().toUpperCase();
    let updated: string[];
    if (selectedSubtopics.includes(clean)) {
      updated = selectedSubtopics.filter(s => s !== clean);
    } else {
      updated = [...selectedSubtopics, clean];
    }
    setSelectedSubtopics(updated);
    if (updated.length > 0) {
      autoFillTitleAndDescription(newType, updated);
      // Auto-set target subject if not explicitly selected
      const subInfo = allSubtopicsData.find(s => s.subtopicCode === updated[0]);
      if (subInfo) {
        setNewSubject(subInfo.subject);
      }
    }
  };

  const handleToggleStudentSelection = (studentId: string) => {
    if (selectedStudentIds.includes(studentId)) {
      setSelectedStudentIds(selectedStudentIds.filter(id => id !== studentId));
    } else {
      setSelectedStudentIds([...selectedStudentIds, studentId]);
    }
  };

  const handleSelectAllStudents = () => {
    if (selectedStudentIds.length === classStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(classStudents.map(s => s.studentId));
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setFeedbackNotice({ type: 'error', text: 'Please enter a task title.' });
      return;
    }
    if (!newDueDate) {
      setFeedbackNotice({ type: 'error', text: 'Please select a due date and time.' });
      return;
    }
    if (selectedSubtopics.length === 0) {
      setFeedbackNotice({ type: 'error', text: 'Please select at least one Cambridge subtopic for this task.' });
      return;
    }
    if (targetAudienceType === 'specific_students' && selectedStudentIds.length === 0) {
      setFeedbackNotice({ type: 'error', text: 'Please select at least one student or choose Entire Class.' });
      return;
    }

    setCreating(true);
    setFeedbackNotice(null);

    try {
      const targetClassName = newClassId === 'all' 
        ? 'All Science Classes' 
        : (classes.find(c => c.id === newClassId)?.name || 'Class');

      // Determine subject from selected subtopic
      let effectiveSubject = newSubject;
      if (selectedSubtopics.length > 0) {
        const firstSub = allSubtopicsData.find(s => s.subtopicCode === selectedSubtopics[0]);
        if (firstSub) {
          effectiveSubject = firstSub.subject;
        }
      }

      // Prepare explicit recipients list for reliable email delivery
      let explicitRecipients: { studentId: string; studentName: string; studentEmail: string }[] | undefined = undefined;
      if (targetAudienceType === 'specific_students' && selectedStudentIds.length > 0) {
        explicitRecipients = classStudents
          .filter(s => selectedStudentIds.includes(s.studentId))
          .map(s => ({
            studentId: s.studentId,
            studentName: s.name,
            studentEmail: s.email && s.email.includes('@') ? s.email : `${s.name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'student'}@gisboyshigh.net`
          }));
      } else if (newClassId !== 'all' && classStudents.length > 0) {
        explicitRecipients = classStudents.map(s => ({
          studentId: s.studentId,
          studentName: s.name,
          studentEmail: s.email && s.email.includes('@') ? s.email : `${s.name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'student'}@gisboyshigh.net`
        }));
      }

      // Collect any additional notification emails (e.g. instructor copy, test emails)
      const additionalEmailsList = additionalEmailsInput.trim()
        ? additionalEmailsInput.split(/[,;\s]+/).map(s => s.trim().toLowerCase()).filter(s => s.includes('@'))
        : [currentUser.email || 'corbanb@gisboyshigh.net'];

      const created = await createClassTask({
        classId: newClassId,
        className: targetClassName,
        title: newTitle.trim(),
        description: newDescription.trim(),
        type: newType,
        targetSubtopics: selectedSubtopics,
        targetSubject: effectiveSubject,
        targetStudentIds: targetAudienceType === 'specific_students' ? selectedStudentIds : undefined,
        requiredQuizLength: Math.max(1, Math.min(40, Number(newRequiredQuizLength) || 10)),
        requireSlidesAndTrafficLight: newRequireSlidesAndTL,
        dueDate: new Date(newDueDate).toISOString(),
        instructorId: currentUser.id,
        instructorName: currentUser.name,
        instructorEmail: currentUser.email || 'corbanb@gisboyshigh.net'
      }, {
        sendEmail: sendEmailNotification,
        explicitRecipients,
        additionalEmails: additionalEmailsList
      });

      setTasks([created, ...tasks]);
      const notifResult = (created as any).notificationResult;

      if (sendEmailNotification && notifResult) {
        const studentCount = notifResult.count || (explicitRecipients?.length || 1);
        if (notifResult.smtpConfigured) {
          setFeedbackNotice({ 
            type: 'success', 
            text: `✅ Task "${created.title}" successfully assigned! Automated emails are being dispatched to ${studentCount} recipients via your SMTP server.` 
          });
        } else {
          setFeedbackNotice({ 
            type: 'success', 
            text: `✅ Task "${created.title}" published! SMTP server is not yet configured. Use the 1-Click Gmail or Mail App button below to send immediately.` 
          });
        }

        setLastEmailAction({
          taskId: created.id,
          taskTitle: created.title,
          count: studentCount,
          method: notifResult.method,
          smtpConfigured: Boolean(notifResult.smtpConfigured),
          mailtoUrl: notifResult.mailtoUrl,
          gmailComposeUrl: notifResult.gmailComposeUrl,
          warning: notifResult.warning,
          subject: notifResult.subject,
          emailText: notifResult.emailText,
          recipients: notifResult.recipients || []
        });
      } else {
        setFeedbackNotice({ 
          type: 'success', 
          text: `Task "${created.title}" successfully assigned!` 
        });
      }

      setShowCreateModal(false);
      setAdditionalEmailsInput('');

      // Reset form to clean default
      setSelectedSubtopics(['B1.1']);
      setNewRequiredQuizLength(10);
      setNewRequireSlidesAndTL(true);
      autoFillTitleAndDescription('both', ['B1.1'], 10);
      setSelectedStudentIds([]);
      setTargetAudienceType('entire_class');
    } catch (err: any) {
      setFeedbackNotice({ type: 'error', text: err?.message || 'Failed to create task.' });
    } finally {
      setCreating(false);
    }
  };

  const handleSendEmailReminder = async (task: ClassTask, e: React.MouseEvent) => {
    e.stopPropagation();
    setSendingEmailTaskId(task.id);
    try {
      let recipients: { studentId: string; studentName: string; studentEmail: string }[] = [];
      const subs = taskSubmissions[task.id];
      if (subs && subs.length > 0) {
        recipients = subs
          .filter(s => s.status !== 'completed')
          .map(s => ({
            studentId: s.studentId,
            studentName: s.studentName,
            studentEmail: s.studentEmail && s.studentEmail.includes('@')
              ? s.studentEmail
              : `${s.studentName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'student'}@gisboyshigh.net`
          }));
      }

      if (recipients.length === 0) {
        if (task.classId !== 'all') {
          const students = await fetchStudentsInClass(task.classId);
          recipients = students
            .filter(s => !task.targetStudentIds || task.targetStudentIds.length === 0 || task.targetStudentIds.includes(s.studentId))
            .map(s => ({
              studentId: s.studentId,
              studentName: s.name,
              studentEmail: s.email && s.email.includes('@')
                ? s.email
                : `${s.name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'student'}@gisboyshigh.net`
            }));
        } else {
          for (const c of classes) {
            const students = await fetchStudentsInClass(c.id);
            for (const s of students) {
              if (!task.targetStudentIds || task.targetStudentIds.length === 0 || task.targetStudentIds.includes(s.studentId)) {
                recipients.push({
                  studentId: s.studentId,
                  studentName: s.name,
                  studentEmail: s.email && s.email.includes('@')
                    ? s.email
                    : `${s.name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'student'}@gisboyshigh.net`
                });
              }
            }
          }
        }
      }

      if (recipients.length === 0) {
        setFeedbackNotice({ type: 'error', text: 'No students found to email for this task.' });
        return;
      }

      const notifResult = await notifyStudentsOfTaskAssignment(task, recipients, [currentUser.email || 'corbanb@gisboyshigh.net']);
      const studentCount = notifResult.count || recipients.length;
      if (notifResult.smtpConfigured) {
        setFeedbackNotice({
          type: 'success',
          text: `📧 Dispatched task email notifications to ${studentCount} student${studentCount !== 1 ? 's' : ''} via your SMTP server!`
        });
      } else {
        setFeedbackNotice({
          type: 'success',
          text: `📧 Prepared 1-Click Email notification for ${studentCount} students! Use the Gmail or Mail App button below to dispatch.`
        });
      }

      if (notifResult.mailtoUrl || notifResult.gmailComposeUrl) {
        setLastEmailAction({
          taskId: task.id,
          taskTitle: task.title,
          count: studentCount,
          method: notifResult.method,
          smtpConfigured: Boolean(notifResult.smtpConfigured),
          mailtoUrl: notifResult.mailtoUrl,
          gmailComposeUrl: notifResult.gmailComposeUrl,
          warning: notifResult.warning,
          subject: notifResult.subject,
          emailText: notifResult.emailText,
          recipients: notifResult.recipients || []
        });
      }
    } catch (err: any) {
      setFeedbackNotice({ type: 'error', text: 'Failed to dispatch email notifications.' });
    } finally {
      setSendingEmailTaskId(null);
    }
  };

  const handleCopyStudentLink = (task: ClassTask, e: React.MouseEvent) => {
    e.stopPropagation();
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://ais-dev-fezihukeplecjbhmw6fblt-840997730911.asia-southeast1.run.app';
    const link = `${origin}/?tab=assignments&taskId=${encodeURIComponent(task.id)}`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(link);
      setCopiedLinkTaskId(task.id);
      setTimeout(() => setCopiedLinkTaskId(null), 2500);
      setFeedbackNotice({
        type: 'success',
        text: `📋 Copied student task link: ${link}`
      });
    }
  };

  const handleDeleteTask = async (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this task? All student progress for this task will be permanently removed.')) {
      return;
    }

    try {
      await deleteClassTask(taskId);
      setTasks(tasks.filter(t => t.id !== taskId));
      setFeedbackNotice({ type: 'success', text: 'Task deleted successfully.' });
    } catch (err: any) {
      setFeedbackNotice({ type: 'error', text: err?.message || 'Failed to delete task.' });
    }
  };

  const handleQuickExtendDueDate = async (taskId: string, daysToAdd: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const currentDue = new Date(task.dueDate);
    currentDue.setDate(currentDue.getDate() + daysToAdd);
    const newDueStr = currentDue.toISOString();

    try {
      await updateClassTaskDueDate(taskId, newDueStr);
      setTasks(tasks.map(t => t.id === taskId ? { ...t, dueDate: newDueStr } : t));
      setFeedbackNotice({ type: 'success', text: `Due date extended by ${daysToAdd} days!` });
    } catch (err: any) {
      setFeedbackNotice({ type: 'error', text: 'Failed to update due date.' });
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.targetSubtopics.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const isOverdue = new Date(task.dueDate).getTime() < Date.now();
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'overdue' && isOverdue) || 
      (statusFilter === 'active' && !isOverdue);

    return matchesSearch && matchesStatus;
  });

  const now = Date.now();

  return (
    <div className="space-y-6">
      {/* Feedback Banner */}
      {feedbackNotice && (
        <div className={`p-4 rounded-2xl flex items-center justify-between text-xs font-semibold ${
          feedbackNotice.type === 'success' 
            ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300' 
            : 'bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-500/40 text-rose-800 dark:text-rose-300'
        }`}>
          <div className="flex items-center gap-2">
            {feedbackNotice.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />}
            <span>{feedbackNotice.text}</span>
          </div>
          <button onClick={() => setFeedbackNotice(null)} className="p-1 hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Last Email Action Helper Card */}
      {lastEmailAction && (
        <div className="bg-[#EBF3F5] dark:bg-zinc-900 border-2 border-black dark:border-white rounded-2xl p-4 text-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-white dark:bg-black text-[#1E293B] dark:text-white border border-black dark:border-white">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-[#1E293B] dark:text-white text-sm">Student Email Dispatch: {lastEmailAction.taskTitle}</span>
                <span className="text-slate-600 dark:text-slate-400 ml-2">({lastEmailAction.count} student{lastEmailAction.count !== 1 ? 's' : ''})</span>
              </div>
            </div>
            <button 
              onClick={() => setLastEmailAction(null)}
              className="text-slate-500 hover:text-black dark:hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[#1E293B] dark:text-slate-300 text-xs">
            {lastEmailAction.smtpConfigured 
              ? 'Automated delivery is in progress via your verified SMTP mail server. You can also launch Gmail or copy the pre-formatted announcement below:'
              : 'Your students are ready to be notified! Click below to send directly through Gmail or your email app with all student addresses in BCC.'}
          </p>

          <div className="flex items-center gap-2 flex-wrap pt-1">
            {lastEmailAction.gmailComposeUrl && (
              <a
                href={lastEmailAction.gmailComposeUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-black dark:hover:bg-slate-200 border-2 border-black font-bold text-xs flex items-center gap-1.5 transition shadow-xs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in Gmail (BCC {lastEmailAction.count} Students)</span>
              </a>
            )}

            {lastEmailAction.mailtoUrl && (
              <a
                href={lastEmailAction.mailtoUrl}
                className="px-3.5 py-1.5 rounded-xl bg-[#FDFBF7] dark:bg-black hover:bg-white dark:hover:bg-zinc-900 text-[#1E293B] dark:text-slate-200 font-semibold text-xs flex items-center gap-1.5 border-2 border-black dark:border-white transition"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Default Mail App</span>
              </a>
            )}

            {lastEmailAction.emailText && (
              <button
                onClick={() => {
                  if (typeof navigator !== 'undefined' && navigator.clipboard) {
                    navigator.clipboard.writeText(lastEmailAction.emailText || '');
                    setFeedbackNotice({ type: 'success', text: '📋 Copied full email notification announcement to clipboard!' });
                  }
                }}
                className="px-3.5 py-1.5 rounded-xl bg-[#FDFBF7] dark:bg-black hover:bg-white dark:hover:bg-zinc-900 text-[#1E293B] dark:text-slate-200 font-semibold text-xs flex items-center gap-1.5 border-2 border-black dark:border-white transition"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Copy Announcement Text</span>
              </button>
            )}

            {lastEmailAction.recipients && lastEmailAction.recipients.length > 0 && (
              <button
                onClick={() => {
                  if (typeof navigator !== 'undefined' && navigator.clipboard) {
                    const emailList = lastEmailAction.recipients!.map(r => r.studentEmail).join(', ');
                    navigator.clipboard.writeText(emailList);
                    setFeedbackNotice({ type: 'success', text: `📋 Copied ${lastEmailAction.recipients!.length} student email addresses to clipboard!` });
                  }
                }}
                className="px-3.5 py-1.5 rounded-xl bg-[#FDFBF7] dark:bg-black hover:bg-white dark:hover:bg-zinc-900 text-[#1E293B] dark:text-slate-200 font-semibold text-xs flex items-center gap-1.5 border-2 border-black dark:border-white transition"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Student Emails (BCC)</span>
              </button>
            )}

            <button
              onClick={() => setShowSmtpModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-black hover:bg-slate-50 dark:hover:bg-zinc-900 text-[#1E293B] dark:text-white font-semibold text-xs flex items-center gap-1.5 border-2 border-black dark:border-white transition ml-auto"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Email Server Settings & Logs</span>
            </button>
          </div>
        </div>
      )}

      {/* Header and Controls */}
      <div className="bg-white dark:bg-black border border-[#E2E8F0] dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#EBF3F5] dark:bg-zinc-800 text-[#1E293B] dark:text-slate-200 border border-slate-300 dark:border-zinc-700">
                Homework & Assignments Engine
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {tasks.length} Total Task{tasks.length !== 1 ? 's' : ''} Set
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-[#1E293B] dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-slate-700 dark:text-slate-300" />
              <span>Class Tasks & Student Progress Tracking</span>
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl">
              Assign slide deck reading with the traffic light system (Red/Amber/Green), practice quizzes, or revision papers. Set deadlines and monitor live student completion.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setShowSmtpModal(true)}
              className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#FDFBF7] dark:bg-black hover:bg-white dark:hover:bg-zinc-900 text-[#1E293B] dark:text-slate-200 border-2 border-black dark:border-white font-semibold text-xs transition shadow-xs shrink-0"
              title="Configure EmailJS or inspect email delivery logs"
            >
              <Mail className="w-4 h-4 text-slate-700 dark:text-slate-300" />
              <span>Email Delivery</span>
              {smtpStatus?.configured ? (
                <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400"></span>
                  SMTP Active
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600 dark:bg-amber-400"></span>
                  1-Click Gmail
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setNewClassId(classes[0]?.id || 'all');
                setShowCreateModal(true);
              }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-black dark:hover:bg-slate-200 border-2 border-black font-bold text-xs shadow-xs transition shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Set New Task</span>
            </button>
          </div>
        </div>

        {/* Filters and search bar */}
        <div className="pt-3 border-t border-[#E2E8F0] dark:border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
            <span className="text-slate-600 dark:text-slate-400 font-semibold">Class:</span>
            <select
              value={selectedClassId}
              onChange={e => setSelectedClassId(e.target.value)}
              className="bg-[#FDFBF7] dark:bg-black border-2 border-black dark:border-white text-[#1E293B] dark:text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none font-medium"
            >
              <option value="all">All Classes ({classes.length} Available)</option>
              {classes.map(c => {
                const isOwner = c.instructorEmail?.toLowerCase() === currentUser.email?.toLowerCase() || c.instructorId === currentUser.id;
                return (
                  <option key={c.id} value={c.id}>
                    {isOwner ? '👑 [My Class] ' : '👥 [Shared Class] '}{c.name} ({c.classCode})
                  </option>
                );
              })}
            </select>

            <span className="text-slate-600 dark:text-slate-400 font-semibold ml-2">Status:</span>
            <div className="flex items-center gap-1 bg-[#FDFBF7] dark:bg-black p-1 rounded-lg border-2 border-black dark:border-white">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded-md font-semibold transition ${
                  statusFilter === 'all' 
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-xs' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white'
                }`}
              >
                All ({tasks.length})
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-2.5 py-1 rounded-md font-semibold transition ${
                  statusFilter === 'active' 
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-xs' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white'
                }`}
              >
                Active ({tasks.filter(t => new Date(t.dueDate).getTime() >= now).length})
              </button>
              <button
                onClick={() => setStatusFilter('overdue')}
                className={`px-2.5 py-1 rounded-md font-semibold transition ${
                  statusFilter === 'overdue' 
                    ? 'bg-rose-700 text-white shadow-xs' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400'
                }`}
              >
                Past Due ({tasks.filter(t => new Date(t.dueDate).getTime() < now).length})
              </button>
            </div>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search tasks or subtopics..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#FDFBF7] dark:bg-black border-2 border-black dark:border-white text-[#1E293B] dark:text-slate-200 placeholder-slate-400 text-xs focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Task List */}
      {loading ? (
        <div className="bg-white dark:bg-black border border-[#E2E8F0] dark:border-zinc-800 rounded-2xl p-12 text-center text-slate-500 dark:text-slate-400 shadow-xs">
          <div className="w-8 h-8 border-2 border-black dark:border-white border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs font-semibold">Loading assignments and tracking data...</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="bg-[#FDFBF7] dark:bg-black border-2 border-dashed border-slate-300 dark:border-zinc-800 rounded-2xl p-12 text-center space-y-3">
          <Calendar className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-[#1E293B] dark:text-white">No tasks found</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            {searchQuery 
              ? `No assignments match your search query "${searchQuery}".`
              : 'You have not set any tasks for this class yet. Click "Set New Task" above to assign lesson slide reading or quizzes to your students.'}
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-black dark:hover:bg-slate-200 border-2 border-black font-semibold text-xs transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Task</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map(task => {
            const isExpanded = expandedTaskId === task.id;
            const subs = taskSubmissions[task.id] || [];
            const isSubsLoading = loadingSubmissions[task.id];

            const dueDateObj = new Date(task.dueDate);
            const isOverdue = dueDateObj.getTime() < now;
            const diffDays = Math.ceil((dueDateObj.getTime() - now) / (1000 * 60 * 60 * 24));

            // Calculate progress counts
            const totalTarget = task.targetStudentIds && task.targetStudentIds.length > 0
              ? task.targetStudentIds.length
              : Math.max(subs.length, 1);
            
            const completedCount = subs.filter(s => s.status === 'completed').length;
            const inProgressCount = subs.filter(s => s.status === 'incomplete').length;
            const notStartedCount = Math.max(0, totalTarget - completedCount - inProgressCount);
            
            const completedPct = totalTarget > 0 ? Math.round((completedCount / totalTarget) * 100) : 0;
            const inProgressPct = totalTarget > 0 ? Math.round((inProgressCount / totalTarget) * 100) : 0;

            return (
              <div 
                key={task.id}
                className="bg-white dark:bg-black border border-[#E2E8F0] dark:border-zinc-800 hover:border-black dark:hover:border-white rounded-2xl transition shadow-xs overflow-hidden"
              >
                {/* Main Task Header Card */}
                <div 
                  onClick={() => toggleExpandTask(task.id, task.classId)}
                  className="p-5 sm:p-6 cursor-pointer select-none space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Task Type Badge */}
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${
                          task.type === 'both'
                            ? 'bg-[#EBF3F5] dark:bg-zinc-800 text-[#1E293B] dark:text-white border-slate-300 dark:border-zinc-700'
                            : task.type === 'slides_traffic_light'
                              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                              : task.type === 'practice_quiz'
                                ? 'bg-sky-50 dark:bg-sky-950/50 text-sky-800 dark:text-sky-300 border-sky-300 dark:border-sky-700'
                                : 'bg-[#FDFBF7] dark:bg-zinc-800 text-[#1E293B] dark:text-white border-slate-300 dark:border-zinc-700'
                        }`}>
                          {task.type === 'both' && (
                            <>
                              <Sparkles className="w-3 h-3 text-slate-700 dark:text-slate-300" />
                              <span>Both: Slides & Quiz</span>
                            </>
                          )}
                          {task.type === 'slides_traffic_light' && (
                            <>
                              <BookOpen className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                              <span>Slides & Traffic Lights</span>
                            </>
                          )}
                          {task.type === 'practice_quiz' && (
                            <>
                              <Award className="w-3 h-3 text-sky-600 dark:text-sky-400" />
                              <span>Practice Quiz</span>
                            </>
                          )}
                          {task.type !== 'both' && task.type !== 'slides_traffic_light' && task.type !== 'practice_quiz' && (
                            <>
                              <FileText className="w-3 h-3" />
                              <span>{task.type === 'exam_paper' ? 'Past Paper Review' : 'Custom Task'}</span>
                            </>
                          )}
                        </span>

                        {/* Class Identifier */}
                        <span className="text-[11px] font-semibold text-[#1E293B] dark:text-slate-300 bg-[#FDFBF7] dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 px-2.5 py-0.5 rounded-md">
                          {task.className}
                        </span>

                        {(task.type === 'both' || task.type === 'practice_quiz' || task.type === 'exam_paper') && (
                          <span className="text-[11px] font-mono font-bold text-sky-900 dark:text-sky-200 bg-sky-50 dark:bg-sky-950/50 border border-sky-300 dark:border-sky-700 px-2.5 py-0.5 rounded-md">
                            Quiz Length: {task.requiredQuizLength || 10} Qs
                          </span>
                        )}

                        {/* Audience scope */}
                        {task.targetStudentIds && task.targetStudentIds.length > 0 ? (
                          <span className="text-[11px] font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span>{task.targetStudentIds.length} Specific Student{task.targetStudentIds.length > 1 ? 's' : ''}</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <span>Whole Class</span>
                          </span>
                        )}

                        {/* Instructor who created the task */}
                        <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 bg-[#FDFBF7] dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <UserCheck className="w-3 h-3 text-slate-700 dark:text-slate-300" />
                          <span>By {task.instructorName || task.instructorEmail || 'Instructor'}</span>
                        </span>
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-[#1E293B] dark:text-white hover:underline transition">
                        {task.title}
                      </h3>

                      {task.description && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                    </div>

                    {/* Due Date & Overdue Badge */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0">
                      <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${
                        isOverdue
                          ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-500/40 text-rose-800 dark:text-rose-300 animate-pulse'
                          : diffDays <= 1
                            ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-300 dark:border-amber-500/40 text-amber-800 dark:text-amber-300'
                            : 'bg-[#FDFBF7] dark:bg-zinc-900 border-slate-300 dark:border-zinc-700 text-[#1E293B] dark:text-slate-300'
                      }`}>
                        <Clock className="w-3.5 h-3.5" />
                        <span>
                          {isOverdue 
                            ? `Overdue (${dueDateObj.toLocaleDateString()})` 
                            : diffDays === 0 
                              ? 'Due Today' 
                              : diffDays === 1 
                                ? 'Due Tomorrow' 
                                : `Due in ${diffDays} days`}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                        <span>Due:</span>
                        <span className="text-[#1E293B] dark:text-slate-200 font-mono font-medium">
                          {dueDateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Target Subtopics Chips */}
                  {task.targetSubtopics && task.targetSubtopics.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Target Subtopics:</span>
                      {task.targetSubtopics.map(code => (
                        <span 
                          key={code}
                          className="px-2 py-0.5 rounded-md bg-[#FDFBF7] dark:bg-zinc-900 text-[#1E293B] dark:text-slate-200 border-2 border-black dark:border-zinc-700 text-xs font-mono font-bold"
                        >
                          {code}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Real-time Progress Bar & Summary */}
                  <div className="space-y-2 pt-2 border-t border-[#E2E8F0] dark:border-zinc-800">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Student Progress:</span>
                        <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400"></span>
                          {completedCount} Completed ({completedPct}%)
                        </span>
                        <span className="text-amber-700 dark:text-amber-400 font-bold flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-amber-600 dark:bg-amber-400"></span>
                          {inProgressCount} In Progress
                        </span>
                        <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                          {notStartedCount} Not Started
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-[#1E293B] dark:text-slate-200 font-semibold">
                        <span>{isExpanded ? 'Hide Student Roster' : 'View Student Roster'}</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>

                    {/* Progress Track */}
                    <div className="w-full h-2.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden flex border border-slate-200 dark:border-zinc-700">
                      <div 
                        className="bg-emerald-600 dark:bg-emerald-500 transition-all duration-300" 
                        style={{ width: `${completedPct}%` }}
                        title={`${completedCount} Completed (${completedPct}%)`}
                      ></div>
                      <div 
                        className="bg-amber-500 transition-all duration-300" 
                        style={{ width: `${inProgressPct}%` }}
                        title={`${inProgressCount} In Progress (${inProgressPct}%)`}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Expanded Student Drilldown Roster */}
                {isExpanded && (
                  <div className="bg-[#FDFBF7] dark:bg-black border-t-2 border-black dark:border-zinc-800 p-5 sm:p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0] dark:border-zinc-800">
                      <div>
                        <h4 className="text-sm font-bold text-[#1E293B] dark:text-white flex items-center gap-2">
                          <Users className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                          <span>Student Submission Roster & Verification</span>
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          Live tracking of student engagement, completion status, and quiz/traffic-light submissions.
                        </p>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={e => handleSendEmailReminder(task, e)}
                          disabled={sendingEmailTaskId === task.id}
                          title="Dispatch email notification or reminder to students"
                          className="px-3 py-1.5 rounded-xl bg-white dark:bg-black hover:bg-slate-50 dark:hover:bg-zinc-900 text-[#1E293B] dark:text-white border-2 border-black dark:border-white text-xs font-semibold transition flex items-center gap-1.5 disabled:opacity-50"
                        >
                          {sendingEmailTaskId === task.id ? (
                            <div className="w-3.5 h-3.5 border-2 border-black dark:border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Mail className="w-3.5 h-3.5" />
                          )}
                          <span>{sendingEmailTaskId === task.id ? 'Sending...' : 'Email Students'}</span>
                        </button>

                        <button
                          onClick={e => handleCopyStudentLink(task, e)}
                          title="Copy direct link for students to access this task in the portal"
                          className="px-3 py-1.5 rounded-xl bg-white dark:bg-black hover:bg-slate-50 dark:hover:bg-zinc-900 text-[#1E293B] dark:text-white border-2 border-black dark:border-white text-xs font-semibold transition flex items-center gap-1.5"
                        >
                          {copiedLinkTaskId === task.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                              <span className="text-emerald-700 dark:text-emerald-300">Link Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-slate-500" />
                              <span>Copy Student Link</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={e => handleQuickExtendDueDate(task.id, 2, e)}
                          title="Extend due date by 2 days"
                          className="px-3 py-1.5 rounded-xl bg-white dark:bg-black hover:bg-slate-50 dark:hover:bg-zinc-900 text-[#1E293B] dark:text-white text-xs font-semibold border-2 border-black dark:border-white transition"
                        >
                          +2 Days Deadline
                        </button>

                        <button
                          onClick={e => handleDeleteTask(task.id, e)}
                          title="Permanently delete this task"
                          className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-700 text-xs font-semibold transition flex items-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>

                    {isSubsLoading ? (
                      <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                        <div className="w-6 h-6 border-2 border-black dark:border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <span className="text-xs">Fetching student progress records...</span>
                      </div>
                    ) : subs.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-zinc-900 rounded-xl border border-slate-300 dark:border-zinc-800">
                        No students enrolled yet or waiting for initial activity.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-slate-300 dark:border-zinc-800 text-slate-600 dark:text-slate-400 font-semibold">
                              <th className="pb-2.5">Student</th>
                              <th className="pb-2.5">Status</th>
                              <th className="pb-2.5">Deadline State</th>
                              <th className="pb-2.5">Activity / Result</th>
                              <th className="pb-2.5 text-right">Completed On</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#E2E8F0] dark:divide-zinc-800">
                            {subs.map(sub => {
                              const isSubOverdue = isOverdue && sub.status !== 'completed';

                              return (
                                <tr key={sub.studentId} className="hover:bg-white dark:hover:bg-zinc-900/60 transition">
                                  <td className="py-2.5 font-medium text-[#1E293B] dark:text-slate-200">
                                    <div className="font-semibold">{sub.studentName}</div>
                                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{sub.studentEmail}</div>
                                  </td>

                                  <td className="py-2.5">
                                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1 ${
                                      sub.status === 'completed'
                                        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                                        : sub.status === 'incomplete'
                                          ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                                          : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-zinc-700'
                                    }`}>
                                      {sub.status === 'completed' && <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />}
                                      {sub.status === 'incomplete' && <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />}
                                      {sub.status === 'not_started' && <span className="w-2 h-2 rounded-full bg-slate-400"></span>}
                                      <span>
                                        {sub.status === 'completed' ? 'Completed' :
                                         sub.status === 'incomplete' ? 'In Progress' : 'Not Started'}
                                      </span>
                                    </span>
                                  </td>

                                  <td className="py-2.5">
                                    {sub.status === 'completed' ? (
                                      <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">On Time</span>
                                    ) : isSubOverdue ? (
                                      <span className="text-[11px] font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1">
                                        <AlertTriangle className="w-3 h-3" />
                                        <span>Overdue</span>
                                      </span>
                                    ) : (
                                      <span className="text-[11px] text-slate-500 dark:text-slate-400">Pending</span>
                                    )}
                                  </td>

                                  <td className="py-2.5 text-[#1E293B] dark:text-slate-300">
                                    {(() => {
                                      const reqLen = task.requiredQuizLength || sub.requiredQuizLength || 10;
                                      const needsPQ = task.type === 'both' || task.type === 'practice_quiz' || task.type === 'exam_paper';
                                      const tlPct = sub.trafficLightQuizScore;
                                      const hasTLQuiz = Boolean(sub.trafficLightQuizCompleted || tlPct !== undefined);
                                      const pqPct = sub.practiceQuizScore ?? (sub.quizCompleted ? sub.quizScore : undefined);
                                      const pqLen = sub.practiceQuizLength || reqLen;

                                      return (
                                        <div className="flex flex-col gap-1">
                                          {/* 1. Slide reading status */}
                                          <div className="flex items-center gap-1.5">
                                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Slides:</span>
                                            {sub.slidesCompleted ? (
                                              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">
                                                ✓ All Read{sub.slidesTotalCount ? ` (${sub.slidesReadCount || sub.slidesTotalCount}/${sub.slidesTotalCount})` : ''}
                                              </span>
                                            ) : (sub.slidesReadCount || 0) > 0 ? (
                                              <span className="text-[10px] text-amber-700 dark:text-amber-300 font-semibold">
                                                Reading ({sub.slidesReadCount}/{sub.slidesTotalCount || '?'})
                                              </span>
                                            ) : (
                                              <span className="text-[10px] text-slate-500">Pending Slides</span>
                                            )}
                                          </div>

                                          {/* 2. Traffic Light Quiz status */}
                                          <div className="flex items-center gap-1.5">
                                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">TL Quiz:</span>
                                            {hasTLQuiz ? (
                                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#FDFBF7] dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700">
                                                {sub.trafficLight && (
                                                  <span className={`w-2 h-2 rounded-full ${
                                                    sub.trafficLight === 'green' ? 'bg-emerald-500' :
                                                    sub.trafficLight === 'orange' ? 'bg-amber-500' : 'bg-rose-500'
                                                  }`}></span>
                                                )}
                                                <span>
                                                  {sub.trafficLight === 'green' ? 'Green' : sub.trafficLight === 'orange' ? 'Amber' : sub.trafficLight === 'red' ? 'Red' : 'Done'}
                                                  {tlPct !== undefined ? ` (${tlPct}%)` : ''}
                                                </span>
                                              </span>
                                            ) : sub.trafficLight ? (
                                              <span className="text-[10px] text-amber-700 dark:text-amber-300">
                                                Self-rating: {sub.trafficLight === 'orange' ? 'Amber' : sub.trafficLight} (TL Quiz pending)
                                              </span>
                                            ) : (
                                              <span className="text-[10px] text-slate-500">Pending TL Quiz</span>
                                            )}
                                          </div>

                                          {/* 3. Exact-length Practice Quiz status */}
                                          {needsPQ && (
                                            <div className="flex items-center gap-1.5">
                                              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Practice Quiz:</span>
                                              {pqPct !== undefined ? (
                                                <span className="font-bold text-sky-800 dark:text-sky-300 text-[10px] bg-sky-50 dark:bg-sky-950/40 px-1.5 py-0.5 rounded border border-sky-300 dark:border-sky-700">
                                                  {pqPct}% ({pqLen} Qs)
                                                </span>
                                              ) : (
                                                <span className="text-[10px] text-slate-500">Pending ({reqLen} Qs)</span>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })()}
                                  </td>

                                  <td className="py-2.5 text-right text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                                    {sub.completedAt 
                                      ? new Date(sub.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                                      : '—'}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create Task Modal - Viewport constrained, always visible header & options */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white dark:bg-black border-2 border-black dark:border-white rounded-2xl sm:rounded-3xl flex flex-col shadow-2xl my-2 sm:my-auto max-h-[86vh] sm:max-h-[82vh] overflow-hidden shrink-0">
            {/* Fixed Modal Header */}
            <div className="px-5 sm:px-6 py-3 sm:py-3.5 border-b border-[#E2E8F0] dark:border-zinc-800 flex items-center justify-between shrink-0 bg-[#FDFBF7] dark:bg-black z-10">
              <div className="space-y-0.5">
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Class Task Generator</span>
                <h3 className="text-sm sm:text-base font-bold text-[#1E293B] dark:text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                  <span>Assign Task to Students</span>
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-xl text-slate-500 hover:text-black dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
                title="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              {/* Scrollable Form Body */}
              <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-3.5 sm:py-4 space-y-3 sm:space-y-3.5 text-xs bg-white dark:bg-black">
              {/* Task Title */}
              <div className="space-y-1.5">
                <label className="font-semibold text-[#1E293B] dark:text-slate-200">Task Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Read B1.1 Characteristics of Living Organisms & Set Traffic Light"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FDFBF7] dark:bg-black border-2 border-black dark:border-white text-[#1E293B] dark:text-slate-100 placeholder-slate-400 focus:outline-none font-medium"
                />
              </div>

              {/* Task Activity Type Selection: Both, Slides, or Quiz */}
              <div className="space-y-2">
                <label className="font-semibold text-[#1E293B] dark:text-slate-200 flex items-center justify-between">
                  <span>Task Activity Type *</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">Choose slides, quiz, or both</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Option 1: Both Slides & Quiz */}
                  <div
                    onClick={() => {
                      setNewType('both');
                      if (selectedSubtopics.length > 0) {
                        autoFillTitleAndDescription('both', selectedSubtopics);
                      }
                    }}
                    className={`p-2.5 sm:p-3 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                      newType === 'both'
                        ? 'bg-[#EBF3F5] dark:bg-zinc-900 border-2 border-black dark:border-white text-[#1E293B] dark:text-white shadow-xs'
                        : 'bg-[#FDFBF7] dark:bg-black border border-slate-300 dark:border-zinc-800 text-slate-700 dark:text-slate-300 hover:border-black dark:hover:border-zinc-600'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-slate-400 text-xs font-bold">+</span>
                          <Award className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-zinc-800 text-[#1E293B] dark:text-slate-300 border border-slate-400 dark:border-zinc-700">
                          Both Tasks
                        </span>
                      </div>
                      <div>
                        <div className="font-bold text-sm text-[#1E293B] dark:text-white flex items-center gap-1.5">
                          <span>Both: Slides & Quiz</span>
                        </div>
                        <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                          Students read the slide deck, mark their traffic light confidence, <strong className="font-semibold text-black dark:text-white">and</strong> take the practice quiz.
                        </div>
                      </div>
                    </div>
                    {newType === 'both' && (
                      <div className="mt-2.5 pt-2 border-t border-black/20 dark:border-white/20 flex items-center gap-1 text-[11px] font-bold text-black dark:text-white">
                        <Check className="w-3.5 h-3.5" />
                        <span>Selected (Comprehensive)</span>
                      </div>
                    )}
                  </div>

                  {/* Option 2: Slides & Traffic Light only */}
                  <div
                    onClick={() => {
                      setNewType('slides_traffic_light');
                      if (selectedSubtopics.length > 0) {
                        autoFillTitleAndDescription('slides_traffic_light', selectedSubtopics);
                      }
                    }}
                    className={`p-2.5 sm:p-3 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                      newType === 'slides_traffic_light'
                        ? 'bg-[#EBF3F5] dark:bg-zinc-900 border-2 border-black dark:border-white text-[#1E293B] dark:text-white shadow-xs'
                        : 'bg-[#FDFBF7] dark:bg-black border border-slate-300 dark:border-zinc-800 text-slate-700 dark:text-slate-300 hover:border-black dark:hover:border-zinc-600'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                          Slides Only
                        </span>
                      </div>
                      <div>
                        <div className="font-bold text-sm text-[#1E293B] dark:text-white">Slides & Traffic Light</div>
                        <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                          Student reads presentation slides and sets Red / Amber / Green confidence rating to reflect understanding.
                        </div>
                      </div>
                    </div>
                    {newType === 'slides_traffic_light' && (
                      <div className="mt-2.5 pt-2 border-t border-black/20 dark:border-white/20 flex items-center gap-1 text-[11px] font-bold text-black dark:text-white">
                        <Check className="w-3.5 h-3.5" />
                        <span>Selected</span>
                      </div>
                    )}
                  </div>

                  {/* Option 3: Practice Quiz only */}
                  <div
                    onClick={() => {
                      setNewType('practice_quiz');
                      if (selectedSubtopics.length > 0) {
                        autoFillTitleAndDescription('practice_quiz', selectedSubtopics);
                      }
                    }}
                    className={`p-2.5 sm:p-3 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                      newType === 'practice_quiz'
                        ? 'bg-[#EBF3F5] dark:bg-zinc-900 border-2 border-black dark:border-white text-[#1E293B] dark:text-white shadow-xs'
                        : 'bg-[#FDFBF7] dark:bg-black border border-slate-300 dark:border-zinc-800 text-slate-700 dark:text-slate-300 hover:border-black dark:hover:border-zinc-600'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Award className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-700">
                          Quiz Only
                        </span>
                      </div>
                      <div>
                        <div className="font-bold text-sm text-[#1E293B] dark:text-white">Practice Quiz Challenge</div>
                        <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                          Student reads all slides, completes the Traffic Light Quiz, and finishes a {newRequiredQuizLength}-question Practice Quiz.
                        </div>
                      </div>
                    </div>
                    {newType === 'practice_quiz' && (
                      <div className="mt-2.5 pt-2 border-t border-black/20 dark:border-white/20 flex items-center gap-1 text-[11px] font-bold text-black dark:text-white">
                        <Check className="w-3.5 h-3.5" />
                        <span>Selected</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Exact Quiz Length & Strict Completion Gate */}
              <div className="p-3.5 rounded-2xl bg-[#FDFBF7] dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="font-bold text-[#1E293B] dark:text-white block">
                      Exact Quiz Length Required (Questions) *
                    </label>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      Students are instructed to select this exact length and their % score is recorded specifically for this quiz length.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <input
                      type="number"
                      min={1}
                      max={40}
                      value={newRequiredQuizLength}
                      onChange={e => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val)) {
                          const clamped = Math.max(1, Math.min(40, val));
                          setNewRequiredQuizLength(clamped);
                          if (selectedSubtopics.length > 0) {
                            autoFillTitleAndDescription(newType, selectedSubtopics, clamped);
                          }
                        }
                      }}
                      className="w-16 px-2 py-1 text-center font-mono font-bold text-xs rounded-lg bg-white dark:bg-black border-2 border-black dark:border-white text-[#1E293B] dark:text-white"
                    />
                    <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Qs (1–40)</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {[5, 10, 15, 20, 30, 40].map(len => (
                    <button
                      key={len}
                      type="button"
                      onClick={() => {
                        setNewRequiredQuizLength(len);
                        if (selectedSubtopics.length > 0) {
                          autoFillTitleAndDescription(newType, selectedSubtopics, len);
                        }
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition cursor-pointer ${
                        newRequiredQuizLength === len
                          ? 'bg-slate-900 text-white border-black dark:bg-white dark:text-black'
                          : 'bg-white text-slate-700 border-slate-300 hover:border-black dark:bg-black dark:text-slate-300'
                      }`}
                    >
                      {len} Questions
                    </button>
                  ))}
                </div>

                <label className="flex items-center gap-2 pt-1.5 border-t border-slate-200 dark:border-zinc-800 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={newRequireSlidesAndTL}
                    onChange={e => setNewRequireSlidesAndTL(e.target.checked)}
                    className="w-4 h-4 accent-slate-900 cursor-pointer"
                  />
                  <span className="text-[11px] font-semibold text-[#1E293B] dark:text-slate-200">
                    Require students to read all assigned slides & complete Traffic Light Quiz before marking task complete
                  </span>
                </label>
              </div>

              {/* Class Target */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-[#1E293B] dark:text-slate-200">Target Class *</label>
                  <select
                    value={newClassId}
                    onChange={e => setNewClassId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FDFBF7] dark:bg-black border-2 border-black dark:border-white text-[#1E293B] dark:text-slate-100 focus:outline-none font-medium"
                  >
                    <option value="all">All Available Classes (Owned & Shared)</option>
                    {classes.map(c => {
                      const isOwner = c.instructorEmail?.toLowerCase() === currentUser.email?.toLowerCase() || c.instructorId === currentUser.id;
                      return (
                        <option key={c.id} value={c.id}>
                          {isOwner ? '👑 [My Class] ' : '👥 [Shared with Me] '}{c.name} ({c.classCode})
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-[#1E293B] dark:text-slate-200">Due Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={newDueDate}
                    onChange={e => setNewDueDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FDFBF7] dark:bg-black border-2 border-black dark:border-white text-[#1E293B] dark:text-slate-100 focus:outline-none font-medium"
                  />
                </div>
              </div>

              {/* Student Audience Selector: Whole Class vs Specific Students */}
              <div className="space-y-2 pt-2 border-t border-[#E2E8F0] dark:border-zinc-800">
                <label className="font-semibold text-[#1E293B] dark:text-slate-200 flex items-center justify-between">
                  <span>Student Audience Scope:</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setTargetAudienceType('entire_class')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition border ${
                        targetAudienceType === 'entire_class' 
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-black border-black' 
                          : 'bg-[#FDFBF7] dark:bg-black text-slate-700 dark:text-slate-300 border-slate-300 dark:border-zinc-700'
                      }`}
                    >
                      Entire Class
                    </button>
                    <button
                      type="button"
                      onClick={() => setTargetAudienceType('specific_students')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition border ${
                        targetAudienceType === 'specific_students' 
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-black border-black' 
                          : 'bg-[#FDFBF7] dark:bg-black text-slate-700 dark:text-slate-300 border-slate-300 dark:border-zinc-700'
                      }`}
                    >
                      Specific Students ({selectedStudentIds.length})
                    </button>
                  </div>
                </label>

                {targetAudienceType === 'specific_students' && (
                  <div className="bg-[#FDFBF7] dark:bg-black p-4 rounded-2xl border-2 border-black dark:border-white space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
                      <span>Select individual students for tailored revision:</span>
                      <button
                        type="button"
                        onClick={handleSelectAllStudents}
                        className="text-black dark:text-white hover:underline font-bold"
                      >
                        {selectedStudentIds.length === classStudents.length ? 'Deselect All' : 'Select All'}
                      </button>
                    </div>

                    {loadingStudents ? (
                      <div className="p-4 text-center text-slate-500">Loading student roster...</div>
                    ) : classStudents.length === 0 ? (
                      <div className="p-3 text-center text-slate-500">
                        {newClassId === 'all' 
                          ? 'Please select a specific class above to pick individual students.' 
                          : 'No students enrolled in this class yet.'}
                      </div>
                    ) : (
                      <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                        {classStudents.map(student => {
                          const isSelected = selectedStudentIds.includes(student.studentId);
                          return (
                            <div
                              key={student.studentId}
                              onClick={() => handleToggleStudentSelection(student.studentId)}
                              className={`p-2 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                                isSelected 
                                  ? 'bg-[#EBF3F5] dark:bg-zinc-900 border-2 border-black dark:border-white text-[#1E293B] dark:text-white font-bold' 
                                  : 'bg-white dark:bg-black border border-slate-300 dark:border-zinc-800 text-slate-700 dark:text-slate-300 hover:border-black'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                                  isSelected ? 'bg-black text-white dark:bg-white dark:text-black border-black' : 'border-slate-400'
                                }`}>
                                  {isSelected && <Check className="w-3 h-3" />}
                                </div>
                                <span className="font-semibold">{student.name}</span>
                                <span className="text-[10px] text-slate-500 font-mono">({student.email})</span>
                              </div>
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-zinc-700">
                                {student.tier}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Interactive Cambridge Subtopic Selector */}
              <div className="space-y-3 pt-2 border-t border-[#E2E8F0] dark:border-zinc-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="font-semibold text-[#1E293B] dark:text-slate-200 flex items-center gap-1.5">
                      <span>Target Cambridge Subtopic(s) *</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EBF3F5] dark:bg-zinc-800 text-[#1E293B] dark:text-white border border-slate-300 dark:border-zinc-700">
                        {selectedSubtopics.length} Selected
                      </span>
                    </label>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      Search by keyword, filter by subject/topic, or click any subtopic below to assign.
                    </p>
                  </div>

                  {selectedSubtopics.length > 0 && (
                    <button
                      type="button"
                      onClick={() => autoFillTitleAndDescription(newType, selectedSubtopics)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-black hover:bg-slate-50 dark:hover:bg-zinc-900 text-[#1E293B] dark:text-white border-2 border-black dark:border-white text-[11px] font-bold transition shrink-0"
                      title="Auto-generate title and instructions from the selected subtopics"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>✨ Auto-Fill Title & Guidance</span>
                    </button>
                  )}
                </div>

                {/* Selected Subtopic Chips Tray */}
                <div className="p-2.5 rounded-2xl bg-[#FDFBF7] dark:bg-black border-2 border-black dark:border-white space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
                    <span className="font-medium">Currently Selected Subtopic(s):</span>
                    {selectedSubtopics.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedSubtopics([])}
                        className="text-rose-600 hover:underline font-semibold transition"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  {selectedSubtopics.length === 0 ? (
                    <div className="p-3 text-center text-xs text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-700 rounded-xl flex items-center justify-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Please select at least one subtopic from the browser below.</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 flex-wrap">
                      {selectedSubtopics.map(code => {
                        const info = allSubtopicsData.find(s => s.subtopicCode.toUpperCase() === code.toUpperCase());
                        return (
                          <div 
                            key={code}
                            className="px-3 py-1.5 rounded-xl border-2 border-black dark:border-white bg-white dark:bg-zinc-900 text-[#1E293B] dark:text-white flex items-center gap-2 text-xs font-medium shadow-xs"
                          >
                            <span className="font-mono font-bold bg-[#EBF3F5] dark:bg-black px-1.5 py-0.5 rounded border border-slate-300 dark:border-zinc-700">
                              {code}
                            </span>
                            <span className="truncate max-w-[200px] sm:max-w-[260px]">
                              {info ? info.title : code}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveSubtopic(code)}
                              className="p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-zinc-700 transition"
                              title={`Remove ${code}`}
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Subtopic Browser Container */}
                <div className="bg-[#FDFBF7] dark:bg-black p-3.5 rounded-2xl border border-slate-300 dark:border-zinc-800 space-y-3">
                  {/* Search and Filters Bar */}
                  <div className="space-y-2.5">
                    {/* Live Search Input */}
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={subtopicSearchQuery}
                        onChange={e => setSubtopicSearchQuery(e.target.value)}
                        placeholder="Search by keyword, topic, or code (e.g. photosynthesis, acids, waves, B1.1, heart, cells)..."
                        className="w-full pl-9 pr-8 py-2 rounded-xl bg-white dark:bg-black border-2 border-black dark:border-white text-[#1E293B] dark:text-slate-100 placeholder-slate-400 text-xs focus:outline-none font-medium"
                      />
                      {subtopicSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setSubtopicSearchQuery('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-black dark:hover:text-white p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Subject Tabs & Topic Select */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      {/* Subject Filter Tabs */}
                      <div className="flex items-center gap-1 bg-white dark:bg-black p-1 rounded-xl border-2 border-black dark:border-white overflow-x-auto text-[11px]">
                        <button
                          type="button"
                          onClick={() => {
                            setSubtopicFilterSubject('all');
                            setSubtopicFilterTopic('all');
                          }}
                          className={`px-2.5 py-1 rounded-lg font-bold transition shrink-0 ${
                            subtopicFilterSubject === 'all'
                              ? 'bg-slate-900 text-white dark:bg-white dark:text-black'
                              : 'text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white'
                          }`}
                        >
                          All (106)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSubtopicFilterSubject('biology');
                            setSubtopicFilterTopic('all');
                          }}
                          className={`px-2.5 py-1 rounded-lg font-bold transition shrink-0 flex items-center gap-1 ${
                            subtopicFilterSubject === 'biology'
                              ? 'bg-emerald-700 text-white shadow-xs'
                              : 'text-slate-600 dark:text-slate-400 hover:text-emerald-700'
                          }`}
                        >
                          <span>🧬 Biology</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSubtopicFilterSubject('chemistry');
                            setSubtopicFilterTopic('all');
                          }}
                          className={`px-2.5 py-1 rounded-lg font-bold transition shrink-0 flex items-center gap-1 ${
                            subtopicFilterSubject === 'chemistry'
                              ? 'bg-sky-700 text-white shadow-xs'
                              : 'text-slate-600 dark:text-slate-400 hover:text-sky-700'
                          }`}
                        >
                          <span>🧪 Chemistry</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSubtopicFilterSubject('physics');
                            setSubtopicFilterTopic('all');
                          }}
                          className={`px-2.5 py-1 rounded-lg font-bold transition shrink-0 flex items-center gap-1 ${
                            subtopicFilterSubject === 'physics'
                              ? 'bg-amber-700 text-white shadow-xs'
                              : 'text-slate-600 dark:text-slate-400 hover:text-amber-700'
                          }`}
                        >
                          <span>⚡ Physics</span>
                        </button>
                      </div>

                      {/* Topic Dropdown */}
                      <div className="flex items-center gap-1.5">
                        <select
                          value={subtopicFilterTopic}
                          onChange={e => setSubtopicFilterTopic(e.target.value)}
                          className="bg-white dark:bg-black border-2 border-black dark:border-white text-[#1E293B] dark:text-slate-200 rounded-xl px-3 py-1.5 text-[11px] focus:outline-none font-medium w-full sm:w-56 truncate"
                        >
                          <option value="all">All Topics in {subtopicFilterSubject === 'all' ? 'Science' : subtopicFilterSubject}</option>
                          {uniqueTopics
                            .filter(t => subtopicFilterSubject === 'all' || t.subject === subtopicFilterSubject)
                            .map(t => (
                              <option key={t.topicCode} value={t.topicCode}>
                                {t.topicCode}: {t.topicName}
                              </option>
                            ))
                          }
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Subtopics Scrollable Grid */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 px-1">
                      <span>Showing {filteredSubtopicsList.length} Cambridge Subtopic{filteredSubtopicsList.length !== 1 ? 's' : ''}:</span>
                      <span className="italic">Click any row to select or deselect</span>
                    </div>

                    <div className="max-h-40 sm:max-h-44 overflow-y-auto space-y-1.5 pr-1 rounded-xl">
                      {filteredSubtopicsList.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-500 bg-white dark:bg-zinc-900 rounded-xl border border-slate-300 dark:border-zinc-800">
                          No subtopics match your current search/filters. Try clearing your search keyword.
                        </div>
                      ) : (
                        filteredSubtopicsList.map(item => {
                          const isSelected = selectedSubtopics.includes(item.subtopicCode);
                          return (
                            <div
                              key={item.subtopicCode}
                              onClick={() => handleToggleSubtopic(item.subtopicCode)}
                              className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition select-none ${
                                isSelected
                                  ? 'bg-[#EBF3F5] dark:bg-zinc-900 border-2 border-black dark:border-white shadow-xs font-semibold'
                                  : 'bg-white dark:bg-black border border-slate-300 dark:border-zinc-800 hover:border-black text-[#1E293B] dark:text-slate-300'
                              }`}
                            >
                              <div className="flex items-start gap-2.5 min-w-0 pr-2">
                                <span className={`px-2 py-0.5 rounded-md font-mono font-bold text-xs border shrink-0 mt-0.5 ${
                                  isSelected 
                                    ? 'bg-slate-900 text-white dark:bg-white dark:text-black border-black' 
                                    : 'bg-[#FDFBF7] dark:bg-zinc-900 text-[#1E293B] dark:text-slate-300 border-slate-300 dark:border-zinc-700'
                                }`}>
                                  {item.subtopicCode}
                                </span>

                                <div className="min-w-0 space-y-0.5">
                                  <div className="font-semibold text-xs text-[#1E293B] dark:text-white truncate flex items-center gap-1.5">
                                    <span>{item.title}</span>
                                    <span className="text-[10px] font-normal px-1.5 py-0.2 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-zinc-700">
                                      {item.tier}
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-slate-500 truncate">
                                    Topic {item.topicCode}: {item.topicName}
                                  </div>
                                </div>
                              </div>

                              <div className="shrink-0">
                                {isSelected ? (
                                  <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-black text-[11px] font-bold flex items-center gap-1">
                                    <Check className="w-3 h-3" />
                                    <span>Selected</span>
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-1 rounded-lg bg-[#FDFBF7] dark:bg-zinc-900 hover:bg-slate-100 text-slate-700 dark:text-slate-300 text-[11px] font-semibold border border-slate-300 dark:border-zinc-700 transition">
                                    + Add
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Manual Code Input Bar (Fallback) */}
                  <div className="pt-2 border-t border-[#E2E8F0] dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-[11px] text-slate-600 dark:text-slate-400 shrink-0">Or type code:</span>
                      <input
                        type="text"
                        value={newSubtopicInput}
                        onChange={e => setNewSubtopicInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddSubtopic(newSubtopicInput);
                          }
                        }}
                        placeholder="e.g. B1.1, C2.3, P4.1..."
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-black border-2 border-black dark:border-white text-[#1E293B] dark:text-slate-100 placeholder-slate-400 font-mono text-xs w-32 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddSubtopic(newSubtopicInput)}
                        className="px-2.5 py-1 rounded-lg bg-[#FDFBF7] dark:bg-black hover:bg-white text-[#1E293B] dark:text-slate-200 font-semibold text-xs border-2 border-black dark:border-white"
                      >
                        + Add
                      </button>
                    </div>

                    {/* Quick Suggestions Chips */}
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="text-[10px] text-slate-500">Popular:</span>
                      {['B1.1', 'B2.1', 'C1.1', 'C8.1', 'P1.1', 'P4.1.1'].map(code => (
                        <button
                          key={code}
                          type="button"
                          onClick={() => handleAddSubtopic(code)}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition border ${
                            selectedSubtopics.includes(code)
                              ? 'bg-slate-900 text-white dark:bg-white dark:text-black border-black font-bold'
                              : 'bg-white dark:bg-black text-slate-600 dark:text-slate-400 hover:text-black border-slate-300 dark:border-zinc-700'
                          }`}
                        >
                          +{code}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Instructions / Description */}
              <div className="space-y-1.5 pt-2 border-t border-[#E2E8F0] dark:border-zinc-800">
                <label className="font-semibold text-[#1E293B] dark:text-slate-200">Teacher Guidance & Instructions (Optional)</label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  placeholder="e.g. Review key terms on slides 4-8. Once you understand the concepts, update your traffic light to Green and attempt the practice quiz."
                  className="w-full px-3.5 py-2 rounded-xl bg-[#FDFBF7] dark:bg-black border-2 border-black dark:border-white text-[#1E293B] dark:text-slate-100 placeholder-slate-400 focus:outline-none font-normal"
                ></textarea>
              </div>

              {/* Student Email Notification Option Card */}
              <div className="p-4 rounded-2xl bg-[#EBF3F5] dark:bg-zinc-900 border-2 border-black dark:border-white space-y-3 shadow-xs">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-white dark:bg-black text-[#1E293B] dark:text-white border-2 border-black dark:border-white shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="font-bold text-[#1E293B] dark:text-white flex items-center gap-1.5 flex-wrap">
                        <span>Notify Students by Email</span>
                        {smtpStatus?.configured ? (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                            🟢 SMTP Background Auto-Send
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                            🟡 1-Click Gmail / Mail App
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-400">
                        Dispatches assignment details (title, due date, syllabus subtopics, and direct portal link) to each assigned student.
                      </div>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={sendEmailNotification}
                      onChange={e => setSendEmailNotification(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-300 dark:bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-slate-900 dark:peer-checked:bg-white"></div>
                  </label>
                </div>

                {sendEmailNotification && (
                  <div className="pt-2 border-t border-black/15 dark:border-white/15 space-y-2 text-xs">
                    {!smtpStatus?.configured && (
                      <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-700 flex items-center justify-between gap-2 text-amber-900 dark:text-amber-200">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                          <span className="text-[11px]">
                            SMTP mail server is not configured yet. <strong>1-Click Gmail & Email App launcher</strong> will open right after creation so you can notify students immediately.
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowSmtpModal(true)}
                          className="px-2.5 py-1 rounded-lg bg-white dark:bg-black text-[#1E293B] dark:text-slate-200 font-bold text-[11px] border border-black dark:border-white transition shrink-0"
                        >
                          Setup EmailJS
                        </button>
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="font-semibold text-[#1E293B] dark:text-slate-200 text-[11px] flex items-center justify-between">
                        <span>Additional Notification Emails (Optional)</span>
                        <span className="text-[10px] text-slate-500">Your email ({currentUser.email || 'corbanb@gisboyshigh.net'}) is included by default</span>
                      </label>
                      <input
                        type="text"
                        value={additionalEmailsInput}
                        onChange={e => setAdditionalEmailsInput(e.target.value)}
                        placeholder="e.g. corbanb@gisboyshigh.net, co-teacher@gisboyshigh.net, test@email.com"
                        className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-black border-2 border-black dark:border-white text-[#1E293B] dark:text-slate-100 placeholder-slate-400 font-mono text-xs focus:outline-none"
                      />
                      <p className="text-[10px] text-slate-500">
                        Separate multiple emails with commas. All recipients will receive the assignment details and direct portal link.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              </div>

              {/* Fixed Modal Footer */}
              <div className="px-5 sm:px-6 py-3.5 border-t border-[#E2E8F0] dark:border-zinc-800 bg-[#FDFBF7] dark:bg-black flex items-center justify-between gap-3 shrink-0">
                <div className="text-[11px] text-slate-600 dark:text-slate-400 hidden sm:block">
                  {selectedSubtopics.length > 0 ? (
                    <span>Assigned to <strong className="text-black dark:text-white font-bold">{selectedSubtopics.length}</strong> subtopic{selectedSubtopics.length !== 1 ? 's' : ''}</span>
                  ) : (
                    <span className="text-amber-700 dark:text-amber-400 font-medium">Please select at least 1 subtopic</span>
                  )}
                </div>
                <div className="flex items-center gap-2.5 ml-auto">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 rounded-xl bg-[#FDFBF7] dark:bg-black hover:bg-white dark:hover:bg-zinc-900 text-[#1E293B] dark:text-slate-200 font-semibold transition text-xs border-2 border-black dark:border-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-black dark:hover:bg-slate-200 border-2 border-black font-bold transition shadow-xs disabled:opacity-50 text-xs"
                  >
                    {creating && <div className="w-3.5 h-3.5 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin"></div>}
                    <span>Publish Task to Class</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Email Dispatch Modal with EmailJS & 1-Click Fallback */}
      <EmailDispatchModal
        isOpen={showSmtpModal}
        onClose={() => setShowSmtpModal(false)}
        currentUser={currentUser}
        currentTask={
          lastEmailAction
            ? {
                id: lastEmailAction.taskId,
                title: lastEmailAction.taskTitle,
                dueDate: new Date(Date.now() + 86400000 * 3).toLocaleDateString(),
                instructions: 'Please log in to your Cambridge 0653 revision hub and complete the assigned task before the deadline.'
              }
            : tasks[0] || null
        }
        studentRecipients={
          lastEmailAction?.recipients?.map(r => ({
            studentName: r.studentName,
            studentEmail: r.studentEmail
          })) || []
        }
      />
    </div>
  );
};
