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

  // SMTP Settings & 1-Click Email Dispatch state
  const [showSmtpModal, setShowSmtpModal] = useState<boolean>(false);
  const [smtpModalTab, setSmtpModalTab] = useState<'config' | 'logs' | 'guide'>('config');
  const [emailLogs, setEmailLogs] = useState<any[]>([]);
  const [loadingEmailLogs, setLoadingEmailLogs] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [smtpStatus, setSmtpStatus] = useState<{ configured: boolean; host: string; port: number; secure: boolean; user: string; from: string; hasPassword?: boolean } | null>(null);
  const [smtpForm, setSmtpForm] = useState<{ host: string; port: number; secure: boolean; user: string; pass: string; from: string }>({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    user: currentUser.email || 'corbanb@gisboyshigh.net',
    pass: '',
    from: `"Mr. Corban" <${currentUser.email || 'corbanb@gisboyshigh.net'}>`
  });
  const [smtpTesting, setSmtpTesting] = useState<boolean>(false);
  const [smtpTestResult, setSmtpTestResult] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
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

  const fetchEmailLogs = async () => {
    setLoadingEmailLogs(true);
    try {
      const res = await fetch('/api/email-logs');
      if (res.ok) {
        const data = await res.json();
        setEmailLogs(data.logs || []);
      }
    } catch {
    } finally {
      setLoadingEmailLogs(false);
    }
  };

  const handleClearEmailLogs = async () => {
    try {
      await fetch('/api/clear-email-logs', { method: 'POST' });
      setEmailLogs([]);
    } catch {}
  };

  const loadSmtpStatus = async () => {
    try {
      const res = await fetch('/api/smtp-config');
      if (res.ok) {
        const data = await res.json();
        setSmtpStatus(data);
        if (data.configured) {
          setSmtpForm({
            host: data.host || 'smtp.gmail.com',
            port: data.port || 587,
            secure: Boolean(data.secure),
            user: data.user || currentUser.email || 'corbanb@gisboyshigh.net',
            pass: '',
            from: data.from || `"Mr. Corban" <${data.user || currentUser.email || 'corbanb@gisboyshigh.net'}>`
          });
        }
      }
    } catch {}
  };

  useEffect(() => {
    loadSmtpStatus();
  }, []);

  const handleTestSmtp = async () => {
    setSmtpTesting(true);
    setSmtpTestResult(null);
    try {
      const res = await fetch('/api/test-smtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientEmail: currentUser.email || 'corbanb@gisboyshigh.net' })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSmtpTestResult({ type: 'success', text: data.message || `Test email dispatched to ${currentUser.email}!` });
      } else {
        setSmtpTestResult({ type: 'error', text: data.error || 'SMTP test connection failed.' });
      }
    } catch (err: any) {
      setSmtpTestResult({ type: 'error', text: err?.message || 'Failed to reach SMTP test endpoint.' });
    } finally {
      setSmtpTesting(false);
    }
  };

  const handleSaveSmtp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/smtp-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(smtpForm)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFeedbackNotice({ type: 'success', text: '✅ SMTP settings successfully updated and activated!' });
        loadSmtpStatus();
        setShowSmtpModal(false);
      } else {
        setSmtpTestResult({ type: 'error', text: data.error || 'Failed to save SMTP configuration.' });
      }
    } catch (err: any) {
      setSmtpTestResult({ type: 'error', text: err?.message || 'Error saving SMTP configuration.' });
    }
  };

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

  // Helper to auto-fill title & description based on selected subtopic and activity type
  const autoFillTitleAndDescription = (type: TaskType, codes: string[]) => {
    if (codes.length === 0) return;
    const primaryCode = codes[0];
    const subtopicInfo = allSubtopicsData.find(s => s.subtopicCode.toUpperCase() === primaryCode.toUpperCase());
    const titlePart = subtopicInfo ? `${primaryCode} ${subtopicInfo.title}` : primaryCode;
    
    if (type === 'both') {
      setNewTitle(`Read ${titlePart} & Complete Practice Quiz`);
      setNewDescription(
        `1. Open and review the lesson slides for ${titlePart}.\n` +
        `2. Rate your understanding using the Traffic Light system (Green, Amber, or Red).\n` +
        `3. Complete the practice quiz challenge on this subtopic to evaluate your understanding.`
      );
    } else if (type === 'slides_traffic_light') {
      setNewTitle(`Read ${titlePart} & Set Traffic Light`);
      setNewDescription(
        `Review the lesson slides for ${titlePart}. Update your confidence traffic light rating (Green / Amber / Red) when you finish studying.`
      );
    } else if (type === 'practice_quiz') {
      setNewTitle(`Practice Quiz: ${titlePart}`);
      setNewDescription(
        `Complete the 10-question practice quiz on ${titlePart} before the deadline to assess your exam readiness.`
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
      autoFillTitleAndDescription('both', ['B1.1']);
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
            ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300' 
            : 'bg-rose-950/60 border border-rose-500/40 text-rose-300'
        }`}>
          <div className="flex items-center gap-2">
            {feedbackNotice.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-rose-400" />}
            <span>{feedbackNotice.text}</span>
          </div>
          <button onClick={() => setFeedbackNotice(null)} className="p-1 hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Last Email Action Helper Card */}
      {lastEmailAction && (
        <div className="bg-purple-950/40 border border-purple-500/40 rounded-2xl p-4 text-xs space-y-3 animate-in fade-in-50 duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300">
                <Mail className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <span className="font-bold text-white text-sm">Student Email Dispatch: {lastEmailAction.taskTitle}</span>
                <span className="text-purple-300 ml-2">({lastEmailAction.count} student{lastEmailAction.count !== 1 ? 's' : ''})</span>
              </div>
            </div>
            <button 
              onClick={() => setLastEmailAction(null)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-slate-300 text-xs">
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
                className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in Gmail (BCC {lastEmailAction.count} Students)</span>
              </a>
            )}

            {lastEmailAction.mailtoUrl && (
              <a
                href={lastEmailAction.mailtoUrl}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-1.5 border border-slate-700 transition"
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
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-1.5 border border-slate-700 transition"
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
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-1.5 border border-slate-700 transition"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Student Emails (BCC)</span>
              </button>
            )}

            <button
              onClick={() => {
                setShowSmtpModal(true);
                fetchEmailLogs();
              }}
              className="px-3.5 py-1.5 rounded-xl bg-purple-900/60 hover:bg-purple-800 text-purple-200 font-semibold text-xs flex items-center gap-1.5 border border-purple-500/40 transition ml-auto"
            >
              <Settings className="w-3.5 h-3.5 text-purple-300" />
              <span>Email Server Settings & Logs</span>
            </button>
          </div>
        </div>
      )}

      {/* Header and Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                Homework & Assignments Engine
              </span>
              <span className="text-xs text-slate-400">
                {tasks.length} Total Task{tasks.length !== 1 ? 's' : ''} Set
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-400" />
              <span>Class Tasks & Student Progress Tracking</span>
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl">
              Assign slide deck reading with the traffic light system (Red/Amber/Green), practice quizzes, or revision papers. Set deadlines and monitor live student completion.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => {
                setShowSmtpModal(true);
                fetchEmailLogs();
              }}
              className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition shadow-xs shrink-0"
              title="Configure SMTP mail server or inspect email delivery logs"
            >
              <Mail className="w-4 h-4 text-purple-400" />
              <span>Email Delivery</span>
              {smtpStatus?.configured ? (
                <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  SMTP Active
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  1-Click Gmail
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setNewClassId(classes[0]?.id || 'all');
                setShowCreateModal(true);
              }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md hover:shadow-purple-600/30 transition shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Set New Task</span>
            </button>
          </div>
        </div>

        {/* Filters and search bar */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
            <span className="text-slate-400 font-medium">Class:</span>
            <select
              value={selectedClassId}
              onChange={e => setSelectedClassId(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-500 font-medium"
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

            <span className="text-slate-400 font-medium ml-2">Status:</span>
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded-md font-semibold transition ${
                  statusFilter === 'all' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({tasks.length})
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-2.5 py-1 rounded-md font-semibold transition ${
                  statusFilter === 'active' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                Active ({tasks.filter(t => new Date(t.dueDate).getTime() >= now).length})
              </button>
              <button
                onClick={() => setStatusFilter('overdue')}
                className={`px-2.5 py-1 rounded-md font-semibold transition ${
                  statusFilter === 'overdue' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-400 hover:text-rose-400'
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
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-400 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Task List */}
      {loading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs font-semibold">Loading assignments and tracking data...</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="bg-slate-900/60 border border-dashed border-slate-800 rounded-3xl p-12 text-center space-y-3">
          <Calendar className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-300">No tasks found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {searchQuery 
              ? `No assignments match your search query "${searchQuery}".`
              : 'You have not set any tasks for this class yet. Click "Set New Task" above to assign lesson slide reading or quizzes to your students.'}
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition"
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
                className="bg-slate-900 border border-slate-800 hover:border-purple-500/40 rounded-3xl transition shadow-sm overflow-hidden"
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
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                            : task.type === 'slides_traffic_light'
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                              : task.type === 'practice_quiz'
                                ? 'bg-sky-500/15 text-sky-400 border-sky-500/30'
                                : 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                        }`}>
                          {task.type === 'both' && (
                            <>
                              <Sparkles className="w-3 h-3 text-purple-400" />
                              <span>Both: Slides & Quiz</span>
                            </>
                          )}
                          {task.type === 'slides_traffic_light' && (
                            <>
                              <BookOpen className="w-3 h-3 text-emerald-400" />
                              <span>Slides & Traffic Lights</span>
                            </>
                          )}
                          {task.type === 'practice_quiz' && (
                            <>
                              <Award className="w-3 h-3 text-sky-400" />
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
                        <span className="text-[11px] font-semibold text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded-md">
                          {task.className}
                        </span>

                        {/* Audience scope */}
                        {task.targetStudentIds && task.targetStudentIds.length > 0 ? (
                          <span className="text-[11px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span>{task.targetStudentIds.length} Specific Student{task.targetStudentIds.length > 1 ? 's' : ''}</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <span>Whole Class</span>
                          </span>
                        )}

                        {/* Instructor who created the task */}
                        <span className="text-[11px] font-medium text-slate-300 bg-slate-800/80 border border-slate-700/60 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <UserCheck className="w-3 h-3 text-purple-400" />
                          <span>By {task.instructorName || task.instructorEmail || 'Instructor'}</span>
                        </span>
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-white hover:text-purple-300 transition">
                        {task.title}
                      </h3>

                      {task.description && (
                        <p className="text-xs text-slate-400 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                    </div>

                    {/* Due Date & Overdue Badge */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0">
                      <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${
                        isOverdue
                          ? 'bg-rose-950/60 border-rose-500/40 text-rose-300 animate-pulse'
                          : diffDays <= 1
                            ? 'bg-amber-950/50 border-amber-500/40 text-amber-300'
                            : 'bg-slate-800 border-slate-700 text-slate-300'
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

                      <div className="flex items-center gap-1 text-[11px] text-slate-400">
                        <span>Due:</span>
                        <span className="text-slate-200 font-mono font-medium">
                          {dueDateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Target Subtopics Chips */}
                  {task.targetSubtopics && task.targetSubtopics.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className="text-[11px] text-slate-400 font-medium">Target Subtopics:</span>
                      {task.targetSubtopics.map(code => (
                        <span 
                          key={code}
                          className="px-2 py-0.5 rounded-md bg-slate-800 text-purple-300 border border-slate-700 text-xs font-mono font-bold"
                        >
                          {code}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Real-time Progress Bar & Summary */}
                  <div className="space-y-2 pt-2 border-t border-slate-800/80">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-slate-300">Student Progress:</span>
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                          {completedCount} Completed ({completedPct}%)
                        </span>
                        <span className="text-amber-400 font-bold flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                          {inProgressCount} In Progress
                        </span>
                        <span className="text-slate-400 font-medium flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                          {notStartedCount} Not Started
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-purple-400 font-semibold">
                        <span>{isExpanded ? 'Hide Student Roster' : 'View Student Roster'}</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>

                    {/* Progress Track */}
                    <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden flex">
                      <div 
                        className="bg-emerald-500 transition-all duration-300" 
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
                  <div className="bg-slate-950 border-t border-slate-800 p-5 sm:p-6 space-y-4 animate-in fade-in-50 duration-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <Users className="w-4 h-4 text-purple-400" />
                          <span>Student Submission Roster & Verification</span>
                        </h4>
                        <p className="text-xs text-slate-400">
                          Live tracking of student engagement, completion status, and quiz/traffic-light submissions.
                        </p>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={e => handleSendEmailReminder(task, e)}
                          disabled={sendingEmailTaskId === task.id}
                          title="Dispatch email notification or reminder to students"
                          className="px-3 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 text-purple-300 border border-purple-500/40 text-xs font-semibold transition flex items-center gap-1.5 disabled:opacity-50"
                        >
                          {sendingEmailTaskId === task.id ? (
                            <div className="w-3.5 h-3.5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Mail className="w-3.5 h-3.5 text-purple-400" />
                          )}
                          <span>{sendingEmailTaskId === task.id ? 'Sending...' : 'Email Students'}</span>
                        </button>

                        <button
                          onClick={e => handleCopyStudentLink(task, e)}
                          title="Copy direct link for students to access this task in the portal"
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold transition flex items-center gap-1.5"
                        >
                          {copiedLinkTaskId === task.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-300">Link Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-slate-400" />
                              <span>Copy Student Link</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={e => handleQuickExtendDueDate(task.id, 2, e)}
                          title="Extend due date by 2 days"
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
                        >
                          +2 Days Deadline
                        </button>

                        <button
                          onClick={e => handleDeleteTask(task.id, e)}
                          title="Permanently delete this task"
                          className="px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 text-xs font-semibold transition flex items-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>

                    {isSubsLoading ? (
                      <div className="p-8 text-center text-slate-400">
                        <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <span className="text-xs">Fetching student progress records...</span>
                      </div>
                    ) : subs.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400 bg-slate-900/40 rounded-2xl border border-slate-800">
                        No students enrolled yet or waiting for initial activity.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                              <th className="pb-2.5">Student</th>
                              <th className="pb-2.5">Status</th>
                              <th className="pb-2.5">Deadline State</th>
                              <th className="pb-2.5">Activity / Result</th>
                              <th className="pb-2.5 text-right">Completed On</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60">
                            {subs.map(sub => {
                              const isSubOverdue = isOverdue && sub.status !== 'completed';

                              return (
                                <tr key={sub.studentId} className="hover:bg-slate-900/50 transition">
                                  <td className="py-2.5 font-medium text-slate-200">
                                    <div className="font-semibold">{sub.studentName}</div>
                                    <div className="text-[10px] text-slate-400 font-mono">{sub.studentEmail}</div>
                                  </td>

                                  <td className="py-2.5">
                                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1 ${
                                      sub.status === 'completed'
                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                        : sub.status === 'incomplete'
                                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                                    }`}>
                                      {sub.status === 'completed' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                                      {sub.status === 'incomplete' && <Clock className="w-3 h-3 text-amber-400" />}
                                      {sub.status === 'not_started' && <span className="w-2 h-2 rounded-full bg-slate-500"></span>}
                                      <span>
                                        {sub.status === 'completed' ? 'Completed' :
                                         sub.status === 'incomplete' ? 'In Progress' : 'Not Started'}
                                      </span>
                                    </span>
                                  </td>

                                  <td className="py-2.5">
                                    {sub.status === 'completed' ? (
                                      <span className="text-[11px] font-semibold text-emerald-400">On Time</span>
                                    ) : isSubOverdue ? (
                                      <span className="text-[11px] font-bold text-rose-400 flex items-center gap-1">
                                        <AlertTriangle className="w-3 h-3" />
                                        <span>Overdue</span>
                                      </span>
                                    ) : (
                                      <span className="text-[11px] text-slate-400">Pending</span>
                                    )}
                                  </td>

                                  <td className="py-2.5 text-slate-300">
                                    {task.type === 'both' ? (
                                      <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-1.5">
                                          <span className="text-[10px] text-slate-400 font-medium">Slides:</span>
                                          {sub.trafficLight ? (
                                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800">
                                              <span className={`w-2 h-2 rounded-full ${
                                                sub.trafficLight === 'green' ? 'bg-emerald-400' :
                                                sub.trafficLight === 'orange' ? 'bg-amber-400' : 'bg-rose-500'
                                              }`}></span>
                                              <span>{sub.trafficLight === 'orange' ? 'Amber/Orange' : sub.trafficLight === 'green' ? 'Green' : 'Red'} Grade</span>
                                            </span>
                                          ) : sub.slidesCompleted ? (
                                            <span className="text-[10px] text-emerald-400 font-medium">✓ Completed</span>
                                          ) : (
                                            <span className="text-[10px] text-slate-500 italic">Pending rating</span>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                          <span className="text-[10px] text-slate-400 font-medium">Quiz:</span>
                                          {sub.quizScore !== undefined ? (
                                            <span className="font-bold text-sky-400 text-[10px] bg-sky-950/40 px-1.5 py-0.5 rounded border border-sky-500/30">
                                              {sub.quizScore}% Score
                                            </span>
                                          ) : (
                                            <span className="text-[10px] text-slate-500 italic">Pending quiz</span>
                                          )}
                                        </div>
                                      </div>
                                    ) : (
                                      <div>
                                        {sub.trafficLight && (
                                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-800">
                                            <span className={`w-2.5 h-2.5 rounded-full ${
                                              sub.trafficLight === 'green' ? 'bg-emerald-400' :
                                              sub.trafficLight === 'orange' ? 'bg-amber-400' : 'bg-rose-500'
                                            }`}></span>
                                            <span>{sub.trafficLight === 'orange' ? 'Amber/Orange' : sub.trafficLight === 'green' ? 'Green' : 'Red'} Grade</span>
                                          </span>
                                        )}
                                        {sub.quizScore !== undefined && (
                                          <span className="font-bold text-sky-400 text-xs">
                                            Quiz Score: {sub.quizScore}%
                                          </span>
                                        )}
                                        {!sub.trafficLight && sub.quizScore === undefined && (
                                          <span className="text-slate-400 italic">No submissions yet</span>
                                        )}
                                      </div>
                                    )}
                                  </td>

                                  <td className="py-2.5 text-right text-slate-400 font-mono text-[11px]">
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
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl flex flex-col shadow-2xl my-2 sm:my-auto max-h-[86vh] sm:max-h-[82vh] overflow-hidden animate-in zoom-in-95 duration-150 shrink-0">
            {/* Fixed Modal Header */}
            <div className="px-5 sm:px-6 py-3 sm:py-3.5 border-b border-slate-800/90 flex items-center justify-between shrink-0 bg-slate-900/95 backdrop-blur-sm z-10">
              <div className="space-y-0.5">
                <span className="text-[10px] sm:text-[11px] font-bold text-purple-400 uppercase tracking-wider">Class Task Generator</span>
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-400" />
                  <span>Assign Task to Students</span>
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
                title="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              {/* Scrollable Form Body - Smooth scrolling, never pushed above viewport */}
              <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-3.5 sm:py-4 space-y-3 sm:space-y-3.5 text-xs scrollbar-thin scrollbar-thumb-slate-700">
              {/* Task Title */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Task Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Read B1.1 Characteristics of Living Organisms & Set Traffic Light"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                />
              </div>

              {/* Task Activity Type Selection: Both, Slides, or Quiz */}
              <div className="space-y-2">
                <label className="font-semibold text-slate-300 flex items-center justify-between">
                  <span>Task Activity Type *</span>
                  <span className="text-[11px] text-purple-400 font-normal">Choose slides, quiz, or both</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Option 1: Both Slides & Quiz (Comprehensive) */}
                  <div
                    onClick={() => {
                      setNewType('both');
                      if (selectedSubtopics.length > 0) {
                        autoFillTitleAndDescription('both', selectedSubtopics);
                      }
                    }}
                    className={`p-2.5 sm:p-3 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                      newType === 'both'
                        ? 'bg-purple-950/50 border-purple-500 text-white shadow-md ring-1 ring-purple-500/40'
                        : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <BookOpen className="w-4 h-4 text-emerald-400" />
                          <span className="text-slate-500 text-xs font-bold">+</span>
                          <Award className="w-4 h-4 text-sky-400" />
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          Both Tasks
                        </span>
                      </div>
                      <div>
                        <div className="font-bold text-sm text-white flex items-center gap-1.5">
                          <span>Both: Slides & Quiz</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                          Students read the slide deck, mark their traffic light confidence, <strong className="text-purple-300 font-semibold">and</strong> take the practice quiz.
                        </div>
                      </div>
                    </div>
                    {newType === 'both' && (
                      <div className="mt-2.5 pt-2 border-t border-purple-500/30 flex items-center gap-1 text-[11px] text-purple-300 font-medium">
                        <Check className="w-3.5 h-3.5 text-purple-400" />
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
                        ? 'bg-purple-950/50 border-purple-500 text-white shadow-md ring-1 ring-purple-500/40'
                        : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <BookOpen className="w-4 h-4 text-emerald-400" />
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          Slides Only
                        </span>
                      </div>
                      <div>
                        <div className="font-bold text-sm text-white">Slides & Traffic Light</div>
                        <div className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                          Student reads presentation slides and sets Red / Amber / Green confidence rating to reflect understanding.
                        </div>
                      </div>
                    </div>
                    {newType === 'slides_traffic_light' && (
                      <div className="mt-2.5 pt-2 border-t border-purple-500/30 flex items-center gap-1 text-[11px] text-emerald-300 font-medium">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
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
                        ? 'bg-purple-950/50 border-purple-500 text-white shadow-md ring-1 ring-purple-500/40'
                        : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Award className="w-4 h-4 text-sky-400" />
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30">
                          Quiz Only
                        </span>
                      </div>
                      <div>
                        <div className="font-bold text-sm text-white">Practice Quiz Challenge</div>
                        <div className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                          Student completes the 10-question Cambridge syllabus quiz to test retention and exam skills.
                        </div>
                      </div>
                    </div>
                    {newType === 'practice_quiz' && (
                      <div className="mt-2.5 pt-2 border-t border-purple-500/30 flex items-center gap-1 text-[11px] text-sky-300 font-medium">
                        <Check className="w-3.5 h-3.5 text-sky-400" />
                        <span>Selected</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Class Target */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">Target Class *</label>
                  <select
                    value={newClassId}
                    onChange={e => setNewClassId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
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
                  <label className="font-semibold text-slate-300">Due Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={newDueDate}
                    onChange={e => setNewDueDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                  />
                </div>
              </div>

              {/* Student Audience Selector: Whole Class vs Specific Students */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="font-semibold text-slate-300 flex items-center justify-between">
                  <span>Student Audience Scope:</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setTargetAudienceType('entire_class')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                        targetAudienceType === 'entire_class' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      Entire Class
                    </button>
                    <button
                      type="button"
                      onClick={() => setTargetAudienceType('specific_students')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                        targetAudienceType === 'specific_students' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      Specific Students ({selectedStudentIds.length})
                    </button>
                  </div>
                </label>

                {targetAudienceType === 'specific_students' && (
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Select individual students for tailored revision:</span>
                      <button
                        type="button"
                        onClick={handleSelectAllStudents}
                        className="text-purple-400 hover:underline font-semibold"
                      >
                        {selectedStudentIds.length === classStudents.length ? 'Deselect All' : 'Select All'}
                      </button>
                    </div>

                    {loadingStudents ? (
                      <div className="p-4 text-center text-slate-400">Loading student roster...</div>
                    ) : classStudents.length === 0 ? (
                      <div className="p-3 text-center text-slate-400">
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
                                  ? 'bg-purple-950/40 border-purple-500/50 text-white' 
                                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                                  isSelected ? 'bg-purple-600 border-purple-500 text-white' : 'border-slate-700'
                                }`}>
                                  {isSelected && <Check className="w-3 h-3" />}
                                </div>
                                <span className="font-semibold">{student.name}</span>
                                <span className="text-[10px] text-slate-400 font-mono">({student.email})</span>
                              </div>
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
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
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                      <span>Target Cambridge Subtopic(s) *</span>
                      <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {selectedSubtopics.length} Selected
                      </span>
                    </label>
                    <p className="text-[11px] text-slate-400">
                      Search by keyword, filter by subject/topic, or click any subtopic below to assign.
                    </p>
                  </div>

                  {selectedSubtopics.length > 0 && (
                    <button
                      type="button"
                      onClick={() => autoFillTitleAndDescription(newType, selectedSubtopics)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 text-purple-300 border border-purple-500/40 text-[11px] font-bold transition shrink-0"
                      title="Auto-generate title and instructions from the selected subtopics"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      <span>✨ Auto-Fill Title & Guidance</span>
                    </button>
                  )}
                </div>

                {/* Selected Subtopic Chips Tray */}
                <div className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-medium">Currently Selected Subtopic(s):</span>
                    {selectedSubtopics.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedSubtopics([])}
                        className="text-slate-400 hover:text-rose-400 transition"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  {selectedSubtopics.length === 0 ? (
                    <div className="p-3 text-center text-xs text-amber-300/80 bg-amber-950/20 border border-amber-500/30 rounded-xl flex items-center justify-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Please select at least one subtopic from the browser below.</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 flex-wrap">
                      {selectedSubtopics.map(code => {
                        const info = allSubtopicsData.find(s => s.subtopicCode.toUpperCase() === code.toUpperCase());
                        const subjectColor = 
                          info?.subject === 'biology' ? 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40' :
                          info?.subject === 'chemistry' ? 'text-sky-400 border-sky-500/40 bg-sky-950/40' :
                          info?.subject === 'physics' ? 'text-amber-400 border-amber-500/40 bg-amber-950/40' :
                          'text-purple-300 border-purple-500/40 bg-purple-950/40';

                        return (
                          <div 
                            key={code}
                            className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 text-xs font-medium shadow-xs ${subjectColor}`}
                          >
                            <span className="font-mono font-bold text-white bg-slate-900/80 px-1.5 py-0.5 rounded border border-white/10">
                              {code}
                            </span>
                            <span className="truncate max-w-[200px] sm:max-w-[260px]">
                              {info ? info.title : code}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveSubtopic(code)}
                              className="p-0.5 rounded-full hover:bg-white/20 transition text-white/70 hover:text-white"
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
                <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 space-y-3">
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
                        className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-400 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500 font-medium"
                      />
                      {subtopicSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setSubtopicSearchQuery('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Subject Tabs & Topic Select */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      {/* Subject Filter Tabs */}
                      <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 overflow-x-auto text-[11px]">
                        <button
                          type="button"
                          onClick={() => {
                            setSubtopicFilterSubject('all');
                            setSubtopicFilterTopic('all');
                          }}
                          className={`px-2.5 py-1 rounded-lg font-bold transition shrink-0 ${
                            subtopicFilterSubject === 'all'
                              ? 'bg-purple-600 text-white shadow-xs'
                              : 'text-slate-400 hover:text-white'
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
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'text-slate-400 hover:text-emerald-400'
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
                              ? 'bg-sky-600 text-white shadow-xs'
                              : 'text-slate-400 hover:text-sky-400'
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
                              ? 'bg-amber-600 text-white shadow-xs'
                              : 'text-slate-400 hover:text-amber-400'
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
                          className="bg-slate-900 border border-slate-700 text-slate-200 rounded-xl px-3 py-1.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-purple-500 font-medium w-full sm:w-56 truncate"
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
                    <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                      <span>Showing {filteredSubtopicsList.length} Cambridge Subtopic{filteredSubtopicsList.length !== 1 ? 's' : ''}:</span>
                      <span className="italic">Click any row to select or deselect</span>
                    </div>

                    <div className="max-h-40 sm:max-h-44 overflow-y-auto space-y-1.5 pr-1 rounded-xl">
                      {filteredSubtopicsList.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-400 bg-slate-900/60 rounded-xl border border-slate-800">
                          No subtopics match your current search/filters. Try clearing your search keyword.
                        </div>
                      ) : (
                        filteredSubtopicsList.map(item => {
                          const isSelected = selectedSubtopics.includes(item.subtopicCode);
                          const subjectBadgeColor = 
                            item.subject === 'biology' ? 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30' :
                            item.subject === 'chemistry' ? 'text-sky-400 bg-sky-950/40 border-sky-500/30' :
                            'text-amber-400 bg-amber-950/40 border-amber-500/30';

                          return (
                            <div
                              key={item.subtopicCode}
                              onClick={() => handleToggleSubtopic(item.subtopicCode)}
                              className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition select-none ${
                                isSelected
                                  ? 'bg-purple-950/50 border-purple-500/70 shadow-xs ring-1 ring-purple-500/30'
                                  : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:bg-slate-800/80 text-slate-300'
                              }`}
                            >
                              <div className="flex items-start gap-2.5 min-w-0 pr-2">
                                <span className={`px-2 py-0.5 rounded-md font-mono font-bold text-xs border shrink-0 mt-0.5 ${
                                  isSelected ? 'bg-purple-600 text-white border-purple-500' : subjectBadgeColor
                                }`}>
                                  {item.subtopicCode}
                                </span>

                                <div className="min-w-0 space-y-0.5">
                                  <div className="font-semibold text-xs text-white truncate flex items-center gap-1.5">
                                    <span>{item.title}</span>
                                    <span className="text-[10px] font-normal px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                                      {item.tier}
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-slate-400 truncate">
                                    Topic {item.topicCode}: {item.topicName}
                                  </div>
                                </div>
                              </div>

                              <div className="shrink-0">
                                {isSelected ? (
                                  <span className="px-2.5 py-1 rounded-lg bg-purple-600 text-white text-[11px] font-bold flex items-center gap-1">
                                    <Check className="w-3 h-3" />
                                    <span>Selected</span>
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold border border-slate-700 transition">
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
                  <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-[11px] text-slate-400 shrink-0">Or type code:</span>
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
                        className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 font-mono text-xs w-32 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddSubtopic(newSubtopicInput)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700"
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
                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition ${
                            selectedSubtopics.includes(code)
                              ? 'bg-purple-600 text-white font-bold'
                              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
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
              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <label className="font-semibold text-slate-300">Teacher Guidance & Instructions (Optional)</label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  placeholder="e.g. Review key terms on slides 4-8. Once you understand the concepts, update your traffic light to Green and attempt the practice quiz."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 font-normal"
                ></textarea>
              </div>

              {/* Student Email Notification Option Card */}
              <div className="p-4 rounded-2xl bg-slate-950/90 border border-purple-500/30 space-y-3 shadow-xs">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0">
                      <Mail className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="font-bold text-white flex items-center gap-1.5 flex-wrap">
                        <span>Notify Students by Email</span>
                        {smtpStatus?.configured ? (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            🟢 SMTP Background Auto-Send
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            🟡 1-Click Gmail / Mail App
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">
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
                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                {sendEmailNotification && (
                  <div className="pt-2 border-t border-slate-800/80 space-y-2 text-xs">
                    {!smtpStatus?.configured && (
                      <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between gap-2 text-amber-200">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                          <span className="text-[11px]">
                            SMTP mail server is not configured yet. <strong>1-Click Gmail & Email App launcher</strong> will open right after creation so you can notify students immediately.
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setShowSmtpModal(true);
                            fetchEmailLogs();
                          }}
                          className="px-2.5 py-1 rounded-lg bg-amber-600/30 hover:bg-amber-600/50 text-amber-200 font-bold text-[11px] border border-amber-500/30 transition shrink-0"
                        >
                          Setup SMTP
                        </button>
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="font-semibold text-slate-300 text-[11px] flex items-center justify-between">
                        <span>Additional Notification Emails (Optional)</span>
                        <span className="text-[10px] text-slate-400">Your email ({currentUser.email || 'corbanb@gisboyshigh.net'}) is included by default</span>
                      </label>
                      <input
                        type="text"
                        value={additionalEmailsInput}
                        onChange={e => setAdditionalEmailsInput(e.target.value)}
                        placeholder="e.g. corbanb@gisboyshigh.net, co-teacher@gisboyshigh.net, test@email.com"
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 placeholder-slate-500 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                      <p className="text-[10px] text-slate-400">
                        Separate multiple emails with commas. All recipients will receive the assignment details and direct portal link.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              </div>

              {/* Fixed Modal Footer - Always in view */}
              <div className="px-5 sm:px-6 py-3.5 border-t border-slate-800/90 bg-slate-900/95 backdrop-blur-sm flex items-center justify-between gap-3 shrink-0">
                <div className="text-[11px] text-slate-400 hidden sm:block">
                  {selectedSubtopics.length > 0 ? (
                    <span>Assigned to <strong className="text-purple-300 font-semibold">{selectedSubtopics.length}</strong> subtopic{selectedSubtopics.length !== 1 ? 's' : ''}</span>
                  ) : (
                    <span className="text-amber-400 font-medium">Please select at least 1 subtopic</span>
                  )}
                </div>
                <div className="flex items-center gap-2.5 ml-auto">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition shadow-md disabled:opacity-50 text-xs"
                  >
                    {creating && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                    <span>Publish Task to Class</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SMTP Configuration & Delivery Logs Modal */}
      {showSmtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in-50 duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <span>Task Email Dispatch & Server Settings</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Ensure student task emails deliver reliably via SMTP or 1-Click Gmail.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowSmtpModal(false);
                  setSmtpTestResult(null);
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex items-center gap-1 px-5 pt-3 border-b border-slate-800/80 bg-slate-950/50 text-xs">
              <button
                type="button"
                onClick={() => setSmtpModalTab('config')}
                className={`px-4 py-2.5 rounded-t-xl font-bold transition flex items-center gap-2 border-b-2 ${
                  smtpModalTab === 'config'
                    ? 'border-purple-500 text-purple-300 bg-slate-900/90'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                <span>SMTP Server Setup</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSmtpModalTab('logs');
                  fetchEmailLogs();
                }}
                className={`px-4 py-2.5 rounded-t-xl font-bold transition flex items-center gap-2 border-b-2 ${
                  smtpModalTab === 'logs'
                    ? 'border-purple-500 text-purple-300 bg-slate-900/90'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Delivery Logs</span>
                {emailLogs.length > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300 font-mono">
                    {emailLogs.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setSmtpModalTab('guide')}
                className={`px-4 py-2.5 rounded-t-xl font-bold transition flex items-center gap-2 border-b-2 ${
                  smtpModalTab === 'guide'
                    ? 'border-purple-500 text-purple-300 bg-slate-900/90'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Google Setup Guide</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
              {smtpModalTab === 'config' && (
                <form onSubmit={handleSaveSmtp} className="space-y-4">
                  {/* Status Banner */}
                  <div className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                    smtpStatus?.configured
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                      : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                  }`}>
                    <div className="flex items-center gap-2.5">
                      {smtpStatus?.configured ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                      )}
                      <div>
                        <div className="font-bold text-white text-xs">
                          {smtpStatus?.configured 
                            ? `Active SMTP Server: ${smtpStatus.host}:${smtpStatus.port}`
                            : 'SMTP Mail Server Not Configured'}
                        </div>
                        <div className="text-[11px] opacity-90">
                          {smtpStatus?.configured
                            ? `Automated background task emails are sent from "${smtpStatus.user}".`
                            : 'Tasks currently use 1-Click Gmail and Mail App dispatching until SMTP is configured below.'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Preset quick buttons */}
                  <div className="space-y-1">
                    <span className="text-[11px] text-slate-400 font-semibold">Quick Presets:</span>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => {
                          setSmtpForm({
                            host: 'smtp.gmail.com',
                            port: 587,
                            secure: false,
                            user: currentUser.email || 'corbanb@gisboyshigh.net',
                            pass: smtpForm.pass,
                            from: `"Mr. Corban" <${currentUser.email || 'corbanb@gisboyshigh.net'}>`
                          });
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs transition"
                      >
                        ⚡ Google Workspace / Gmail (587 TLS)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSmtpForm({
                            host: 'smtp.gmail.com',
                            port: 465,
                            secure: true,
                            user: currentUser.email || 'corbanb@gisboyshigh.net',
                            pass: smtpForm.pass,
                            from: `"Mr. Corban" <${currentUser.email || 'corbanb@gisboyshigh.net'}>`
                          });
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs transition"
                      >
                        🔒 Google SSL (465 SSL)
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-300">SMTP Host Server</label>
                      <input
                        type="text"
                        required
                        value={smtpForm.host}
                        onChange={e => setSmtpForm({ ...smtpForm, host: e.target.value })}
                        placeholder="smtp.gmail.com"
                        className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 font-mono focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="font-semibold text-slate-300">Port & Security</label>
                        <label className="flex items-center gap-1.5 text-[11px] text-slate-400 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={smtpForm.secure}
                            onChange={e => setSmtpForm({ ...smtpForm, secure: e.target.checked })}
                            className="rounded bg-slate-800 border-slate-700 text-purple-600 focus:ring-0"
                          />
                          <span>SSL (Port 465)</span>
                        </label>
                      </div>
                      <input
                        type="number"
                        required
                        value={smtpForm.port}
                        onChange={e => setSmtpForm({ ...smtpForm, port: parseInt(e.target.value, 10) || 587 })}
                        placeholder="587"
                        className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 font-mono focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-300">User / Sender Email Address</label>
                      <input
                        type="email"
                        required
                        value={smtpForm.user}
                        onChange={e => setSmtpForm({ ...smtpForm, user: e.target.value })}
                        placeholder="corbanb@gisboyshigh.net"
                        className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 font-mono focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="font-semibold text-slate-300">
                          Password / Google App Password
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-[10px] text-purple-400 hover:text-purple-300 underline"
                        >
                          {showPassword ? 'Hide' : 'Show'}
                        </button>
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={smtpForm.pass}
                        onChange={e => setSmtpForm({ ...smtpForm, pass: e.target.value })}
                        placeholder={smtpStatus?.hasPassword ? '(Password configured — leave empty to keep)' : '16-character Google App Password'}
                        className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 font-mono focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  {/* Important Google Workspace notice */}
                  <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 text-purple-200 text-[11px] space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-white">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      <span>Note for Google Workspace / Gmail Accounts:</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      Google blocks regular account passwords for SMTP. You must use a <strong>16-character Google App Password</strong> generated at{' '}
                      <a
                        href="https://myaccount.google.com/apppasswords"
                        target="_blank"
                        rel="noreferrer"
                        className="text-purple-300 underline font-semibold hover:text-white"
                      >
                        myaccount.google.com/apppasswords
                      </a>{' '}
                      (requires 2-Step Verification enabled).
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-300">From Header Display Name</label>
                    <input
                      type="text"
                      value={smtpForm.from}
                      onChange={e => setSmtpForm({ ...smtpForm, from: e.target.value })}
                      placeholder={`"Mr. Corban" <${currentUser.email || 'corbanb@gisboyshigh.net'}>`}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 font-mono focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>

                  {/* Test Result Message */}
                  {smtpTestResult && (
                    <div className={`p-3.5 rounded-xl border flex items-start gap-2.5 ${
                      smtpTestResult.type === 'success'
                        ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-200'
                        : 'bg-rose-950/50 border-rose-500/40 text-rose-200'
                    }`}>
                      {smtpTestResult.type === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      )}
                      <div className="space-y-1">
                        <div className="font-bold">{smtpTestResult.type === 'success' ? 'Connection Successful' : 'Connection Failed'}</div>
                        <div className="text-[11px] leading-relaxed">{smtpTestResult.text}</div>
                      </div>
                    </div>
                  )}

                  {/* Buttons */}
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      disabled={smtpTesting}
                      onClick={handleTestSmtp}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center gap-2 transition disabled:opacity-50"
                    >
                      {smtpTesting ? (
                        <div className="w-3.5 h-3.5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Send className="w-3.5 h-3.5 text-purple-400" />
                      )}
                      <span>Test Connection ({currentUser.email || 'corbanb@gisboyshigh.net'})</span>
                    </button>

                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition"
                    >
                      Save & Activate SMTP
                    </button>
                  </div>
                </form>
              )}

              {smtpModalTab === 'logs' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-300">
                      Recent Task Email Delivery Logs ({emailLogs.length})
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={fetchEmailLogs}
                        disabled={loadingEmailLogs}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs flex items-center gap-1 border border-slate-700"
                      >
                        <RefreshCw className={`w-3 h-3 ${loadingEmailLogs ? 'animate-spin' : ''}`} />
                        <span>Refresh</span>
                      </button>
                      {emailLogs.length > 0 && (
                        <button
                          type="button"
                          onClick={handleClearEmailLogs}
                          className="px-2.5 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 font-medium text-xs border border-rose-800/40"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>

                  {loadingEmailLogs ? (
                    <div className="p-8 text-center text-slate-400">
                      <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      <span>Loading delivery logs...</span>
                    </div>
                  ) : emailLogs.length === 0 ? (
                    <div className="p-8 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-center space-y-2">
                      <Mail className="w-8 h-8 text-slate-600 mx-auto" />
                      <div className="font-semibold text-slate-300 text-sm">No delivery logs recorded yet</div>
                      <p className="text-slate-400 text-xs max-w-sm mx-auto">
                        When you assign a task or click &quot;Send Email Reminder&quot;, delivery records and server responses will appear here in real-time.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                      {emailLogs.map(log => (
                        <div
                          key={log.id}
                          className={`p-3 rounded-xl border space-y-1 ${
                            log.status === 'sent'
                              ? 'bg-emerald-950/20 border-emerald-500/30'
                              : log.status === 'failed'
                              ? 'bg-rose-950/30 border-rose-500/40'
                              : 'bg-slate-950/70 border-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-white text-xs">{log.taskTitle}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              log.status === 'sent'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                : log.status === 'failed'
                                ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                                : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            }`}>
                              {log.status === 'sent' ? '✓ Delivered via SMTP' : log.status === 'failed' ? '✕ Failed' : 'Ready for 1-Click Send'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-400">
                            <span>To: <strong className="text-slate-200">{log.recipientName}</strong> ({log.recipientEmail})</span>
                            <span className="font-mono text-[10px]">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                          </div>

                          {log.info && (
                            <div className="text-[10px] text-slate-400 font-mono">{log.info}</div>
                          )}

                          {log.error && (
                            <div className="text-[11px] text-rose-300 bg-rose-950/40 p-2 rounded-lg border border-rose-900/50 mt-1">
                              <strong>Error:</strong> {log.error}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {smtpModalTab === 'guide' && (
                <div className="space-y-4 text-xs leading-relaxed">
                  <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 space-y-2">
                    <h4 className="font-bold text-sm text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      <span>Why Were Task Emails Not Going Through?</span>
                    </h4>
                    <p className="text-slate-300">
                      Standard automated email dispatch requires an authenticated SMTP server. For Google accounts (including <strong>@gisboyshigh.net</strong> and personal Gmail), Google enforces 2-Step Verification and requires a dedicated <strong>Google App Password</strong>. Using your normal Google login password causes Google to reject the connection with code <strong>535 Authentication Failed</strong>.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-bold text-white text-sm">Two Easy Ways to Notify Students:</h4>

                    {/* Option 1: 1-Click Gmail */}
                    <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-2">
                      <div className="flex items-center gap-2 font-bold text-white text-xs">
                        <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[11px]">1</span>
                        <span>Zero-Configuration: 1-Click Gmail & Mail App (Fastest)</span>
                      </div>
                      <p className="text-slate-300 text-xs pl-7">
                        When you create a task or click &quot;Send Email Reminder&quot;, the system automatically prepares a <strong>1-Click Open in Gmail</strong> button. Clicking it instantly launches your Gmail compose window with:
                      </p>
                      <ul className="list-disc pl-11 text-slate-400 space-y-1 text-xs">
                        <li>All assigned students pre-populated into <strong>BCC</strong> for privacy.</li>
                        <li>Formatted assignment title, subtopics, due date, and direct portal link.</li>
                        <li>You simply review and click Send in Gmail! No server configuration needed.</li>
                      </ul>
                    </div>

                    {/* Option 2: Automated SMTP */}
                    <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-2">
                      <div className="flex items-center gap-2 font-bold text-white text-xs">
                        <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[11px]">2</span>
                        <span>Automated Background Delivery via Google App Password</span>
                      </div>
                      <p className="text-slate-300 text-xs pl-7">
                        To enable seamless background auto-delivery straight from your email address:
                      </p>
                      <ol className="list-decimal pl-11 text-slate-300 space-y-1 text-xs">
                        <li>Make sure 2-Step Verification is active on your Google / GIS Boys High account.</li>
                        <li>
                          Visit{' '}
                          <a
                            href="https://myaccount.google.com/apppasswords"
                            target="_blank"
                            rel="noreferrer"
                            className="text-purple-300 underline font-semibold hover:text-white"
                          >
                            myaccount.google.com/apppasswords
                          </a>
                        </li>
                        <li>Create a new App Password named <strong>&quot;IGCSE Science Hub&quot;</strong>.</li>
                        <li>Copy the 16-letter password and paste it into the <strong>Password</strong> field in the SMTP Setup tab.</li>
                        <li>Click <strong>&quot;Test Connection&quot;</strong> to confirm, then <strong>&quot;Save & Activate SMTP&quot;</strong>.</li>
                      </ol>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Cambridge 0653 Science Revision Hub • Instructor Notification System
              </span>
              <button
                type="button"
                onClick={() => {
                  setShowSmtpModal(false);
                  setSmtpTestResult(null);
                }}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition"
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
