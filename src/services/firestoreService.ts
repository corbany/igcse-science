import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where,
  increment,
  onSnapshot
} from 'firebase/firestore';
import { db } from './firebaseAuth';
import { UserProfile, StudentProgress, TrafficLightStatus, SubtopicQuizResult, SubtopicSlideProgress, QuizLengthRecord, ScienceSubject, ExamTier, ClassTask, TaskSubmission, TaskWithSubmission, TaskProgressStatus } from '../types';
import { evaluateStudentBadges } from './badgeService';

// The owner/primary educator email who always has instructor access
export const INITIAL_INSTRUCTOR_EMAILS = [
  'corbanb@gisboyshigh.net'
];

// Local Storage Fallback Keys for seamless offline & local resilience
const LOCAL_USERS_KEY = 'igcse_0653_offline_users';
const LOCAL_CLASSES_KEY = 'igcse_0653_offline_classes';
const LOCAL_STUDENTS_PREFIX = 'igcse_0653_offline_class_students_';
const LOCAL_INVITES_KEY = 'igcse_0653_offline_invites';
const LOCAL_ENROLLED_PREFIX = 'igcse_0653_offline_enrolled_';
const LOCAL_NOTIFICATIONS_KEY = 'igcse_0653_instructor_notifications';
const LOCAL_TASKS_KEY = 'igcse_0653_offline_tasks';
const LOCAL_TASK_SUBMISSIONS_PREFIX = 'igcse_0653_offline_task_subs_';

export const DEFAULT_CLASS_CODE = '';
export const DEFAULT_CLASS_ITEM: ClassItem = {
  id: '',
  classCode: '',
  name: '',
  subject: 'all',
  description: 'Deprecated default class - auto-enrollment removed.',
  instructorId: '',
  instructorName: '',
  instructorEmail: '',
  createdAt: '',
  studentCount: 0
};

export interface SharedInstructorRecord {
  email: string;
  name?: string;
  sharedAt: string;
  addedBy: string;
}

export interface ClassItem {
  id: string;
  classCode: string;
  name: string;
  subject: ScienceSubject | 'all';
  description?: string;
  instructorId: string;
  instructorName: string;
  instructorEmail: string;
  createdAt: string;
  studentCount: number;
  sharedInstructorEmails?: string[];
  sharedInstructors?: SharedInstructorRecord[];
}

export interface ClassStudentItem {
  studentId: string;
  name: string;
  email: string;
  tier: ExamTier;
  joinedAt: string;
  lastActive: string;
  completedLessonsCount: number;
  completedLessons?: string[];
  slidesReadBySubtopic?: Record<string, SubtopicSlideProgress>;
  quizScores: Record<string, { score: number; total: number; date: string }>;
  practiceQuizByLength?: Record<string, QuizLengthRecord>;
  subtopicQuizScores: Record<string, SubtopicQuizResult>;
  topicConfidence: Record<string, number>;
  trafficLights: Record<string, TrafficLightStatus>;
  weakTopics: string[];
  badgesCount?: number;
  earnedBadges?: { badgeId: string; unlockedAt: string }[];
  totalQuizScore?: number;
  cumulativeQuizPoints?: number;
  cumulativeQuizzesCount?: number;
  quizzesCompletedCount?: number;
  xp?: number;
  bestTotalXP?: number;
  featuredBadgeId?: string;
  streakDays?: number;
}

const hydratedRemoteMaxByClassStudent = new Map<string, Partial<ClassStudentItem>>();

export interface InstructorInviteItem {
  id: string;
  email: string;
  invitedByUid: string;
  invitedByName: string;
  invitedByEmail: string;
  invitedAt: string;
  status: 'pending' | 'accepted';
}

// -------------------------------------------------------------
// HELPER STORAGE FUNCTIONS
// -------------------------------------------------------------

function getLocalItem<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function setLocalItem(key: string, value: any): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // quota exceeded or private mode
  }
}

/**
 * Sanitizes object by removing any undefined properties recursively to prevent
 * FirebaseError: Function setDoc() called with invalid data. Unsupported field value: undefined
 */
export function cleanFirestoreData<T extends Record<string, any>>(obj: T): any {
  if (obj === null || obj === undefined) return null;
  if (Array.isArray(obj)) {
    return obj
      .filter(item => item !== undefined)
      .map(item => (typeof item === 'object' && item !== null ? cleanFirestoreData(item) : item));
  }
  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (value !== null && typeof value === 'object' && !(value instanceof Date)) {
        result[key] = cleanFirestoreData(value);
      } else {
        result[key] = value;
      }
    }
  }
  return result;
}

// -------------------------------------------------------------
// INSTRUCTOR CHECK & USER PROFILES
// -------------------------------------------------------------

/**
 * Check if an email has instructor privilege
 */
export async function checkIfEmailIsInstructor(email: string): Promise<boolean> {
  if (!email) return false;
  const cleanEmail = email.toLowerCase().trim();
  
  if (INITIAL_INSTRUCTOR_EMAILS.map(e => e.toLowerCase()).includes(cleanEmail)) {
    return true;
  }

  // Check local invites first
  const localInvites = getLocalItem<InstructorInviteItem[]>(LOCAL_INVITES_KEY, []);
  if (localInvites.some(inv => inv.email.toLowerCase() === cleanEmail)) {
    return true;
  }

  try {
    const q = query(
      collection(db, 'instructor_invites'),
      where('email', '==', cleanEmail)
    );
    const snap = await getDocs(q);
    return !snap.empty;
  } catch {
    // Offline or API disabled - rely on local invites check
    return false;
  }
}

/**
 * Fetch or initialize a user profile with offline fallback
 */
export async function getOrCreateUserProfile(
  authUid: string,
  authName: string,
  authEmail: string
): Promise<UserProfile> {
  const cleanEmail = (authEmail || '').toLowerCase().trim();
  const isInstructor = await checkIfEmailIsInstructor(cleanEmail);
  const defaultRole: 'student' | 'instructor' = isInstructor ? 'instructor' : 'student';

  // Check locally cached user profile
  const localUsers = getLocalItem<Record<string, UserProfile>>(LOCAL_USERS_KEY, {});
  const cachedProfile = localUsers[authUid];

  const profileFallback: UserProfile = {
    id: authUid,
    name: cachedProfile?.name || authName || (defaultRole === 'instructor' ? 'Instructor' : 'Student'),
    email: cleanEmail,
    role: cachedProfile?.role || defaultRole,
    tier: cachedProfile?.tier || 'Extended',
    targetGrade: cachedProfile?.targetGrade || 'A*',
    examDate: cachedProfile?.examDate || '2026-05-15'
  };

  // If newly invited, upgrade role
  if (isInstructor && profileFallback.role !== 'instructor') {
    profileFallback.role = 'instructor';
  }

  // Cache locally immediately
  localUsers[authUid] = profileFallback;
  setLocalItem(LOCAL_USERS_KEY, localUsers);

  // Try syncing with Firestore silently
  try {
    const userRef = doc(db, 'users', authUid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data();
      let role = (data.role as 'student' | 'instructor') || defaultRole;
      if (isInstructor && role !== 'instructor') {
        role = 'instructor';
        updateDoc(userRef, { role: 'instructor', lastActive: new Date().toISOString() }).catch(() => {});
      }
      const remoteProfile: UserProfile = {
        id: authUid,
        name: data.name || authName || profileFallback.name,
        email: cleanEmail,
        role,
        tier: data.tier || profileFallback.tier,
        targetGrade: data.targetGrade || 'A*',
        examDate: data.examDate || '2026-05-15'
      };
      localUsers[authUid] = remoteProfile;
      setLocalItem(LOCAL_USERS_KEY, localUsers);
      return remoteProfile;
    } else {
      // Create user document in Firestore
      setDoc(userRef, {
        ...profileFallback,
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        enrolledClassIds: []
      }).catch(() => {});
    }
  } catch {
    // Offline mode: proceed with profileFallback
  }

  return profileFallback;
}

/**
 * Update user profile in Firestore and local storage
 */
export async function updateUserProfile(profile: UserProfile): Promise<void> {
  // Update local storage
  const localUsers = getLocalItem<Record<string, UserProfile>>(LOCAL_USERS_KEY, {});
  localUsers[profile.id] = profile;
  setLocalItem(LOCAL_USERS_KEY, localUsers);

  // Try updating Firestore
  try {
    const userRef = doc(db, 'users', profile.id);
    await setDoc(userRef, {
      name: profile.name,
      email: profile.email.toLowerCase().trim(),
      role: profile.role,
      tier: profile.tier,
      targetGrade: profile.targetGrade || 'A*',
      examDate: profile.examDate || '2026-05-15',
      lastActive: new Date().toISOString()
    }, { merge: true });
  } catch {
    // Offline fallback: saved to local storage
  }
}

// -------------------------------------------------------------
// INSTRUCTOR INVITATIONS
// -------------------------------------------------------------

/**
 * Invite a person by email to become an instructor
 */
export async function inviteInstructor(
  targetEmail: string,
  inviter: UserProfile
): Promise<{ success: boolean; message: string }> {
  const cleanEmail = targetEmail.toLowerCase().trim();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { success: false, message: 'Please provide a valid email address.' };
  }

  const localInvites = getLocalItem<InstructorInviteItem[]>(LOCAL_INVITES_KEY, []);
  if (localInvites.some(inv => inv.email.toLowerCase() === cleanEmail)) {
    return { success: false, message: `${cleanEmail} is already invited as an instructor.` };
  }

  const inviteId = cleanEmail.replace(/[^a-zA-Z0-9]/g, '_');
  const newInvite: InstructorInviteItem = {
    id: inviteId,
    email: cleanEmail,
    invitedByUid: inviter.id,
    invitedByName: inviter.name,
    invitedByEmail: inviter.email,
    invitedAt: new Date().toISOString(),
    status: 'pending'
  };

  // Save to local storage
  localInvites.unshift(newInvite);
  setLocalItem(LOCAL_INVITES_KEY, localInvites);

  // Also upgrade local user if already registered
  const localUsers = getLocalItem<Record<string, UserProfile>>(LOCAL_USERS_KEY, {});
  Object.values(localUsers).forEach(u => {
    if (u.email.toLowerCase() === cleanEmail) {
      u.role = 'instructor';
    }
  });
  setLocalItem(LOCAL_USERS_KEY, localUsers);

  // Try Firestore
  try {
    const inviteRef = doc(db, 'instructor_invites', inviteId);
    await setDoc(inviteRef, newInvite);

    const usersQ = query(
      collection(db, 'users'),
      where('email', '==', cleanEmail)
    );
    const userSnap = await getDocs(usersQ);
    for (const u of userSnap.docs) {
      await updateDoc(u.ref, { role: 'instructor' });
    }
  } catch {
    // Offline mode: saved locally
  }

  return { 
    success: true, 
    message: `Instructor invite sent to ${cleanEmail}. They will automatically get Instructor View when they sign in.` 
  };
}

/**
 * Fetch all instructor invites
 */
export async function fetchInstructorInvites(): Promise<InstructorInviteItem[]> {
  const localInvites = getLocalItem<InstructorInviteItem[]>(LOCAL_INVITES_KEY, []);

  try {
    const snap = await getDocs(collection(db, 'instructor_invites'));
    const remoteInvites: InstructorInviteItem[] = [];
    snap.forEach(docSnap => {
      const d = docSnap.data();
      remoteInvites.push({
        id: docSnap.id,
        email: d.email,
        invitedByUid: d.invitedByUid,
        invitedByName: d.invitedByName || 'Instructor',
        invitedByEmail: d.invitedByEmail || '',
        invitedAt: d.invitedAt || new Date().toISOString(),
        status: d.status || 'pending'
      });
    });

    if (remoteInvites.length > 0) {
      setLocalItem(LOCAL_INVITES_KEY, remoteInvites);
      return remoteInvites.sort((a, b) => b.invitedAt.localeCompare(a.invitedAt));
    }
  } catch {
    // Offline mode: proceed with local invites
  }

  return localInvites.sort((a, b) => b.invitedAt.localeCompare(a.invitedAt));
}

/**
 * Revoke/delete an instructor invite
 */
export async function deleteInstructorInvite(inviteId: string, email: string): Promise<boolean> {
  const cleanEmail = email.toLowerCase().trim();

  // Remove from local storage
  const localInvites = getLocalItem<InstructorInviteItem[]>(LOCAL_INVITES_KEY, []);
  setLocalItem(LOCAL_INVITES_KEY, localInvites.filter(i => i.id !== inviteId));

  // Demote user if they exist and are not in INITIAL_INSTRUCTOR_EMAILS
  if (!INITIAL_INSTRUCTOR_EMAILS.map(e => e.toLowerCase()).includes(cleanEmail)) {
    const localUsers = getLocalItem<Record<string, UserProfile>>(LOCAL_USERS_KEY, {});
    Object.values(localUsers).forEach(u => {
      if (u.email.toLowerCase() === cleanEmail) {
        u.role = 'student';
      }
    });
    setLocalItem(LOCAL_USERS_KEY, localUsers);
  }

  try {
    await deleteDoc(doc(db, 'instructor_invites', inviteId));
  } catch {
    // Offline: removed locally
  }

  return true;
}

// -------------------------------------------------------------
// CLASS MANAGEMENT & CODES
// -------------------------------------------------------------

function generateClassCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let randomPart = '';
  for (let i = 0; i < 4; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `SCI-${randomPart}`;
}

/**
 * Create a new class linked to the instructor
 */
export async function createClass(
  params: {
    name: string;
    subject: ScienceSubject | 'all';
    description?: string;
    customCode?: string;
  },
  instructor: UserProfile
): Promise<{ success: boolean; classItem?: ClassItem; message: string }> {
  let finalCode = (params.customCode || generateClassCode()).trim().toUpperCase();
  if (!finalCode.startsWith('SCI-') && finalCode.length <= 6) {
    finalCode = `SCI-${finalCode}`;
  }

  const classId = `class_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  const classData: ClassItem = {
    id: classId,
    classCode: finalCode,
    name: params.name.trim(),
    subject: params.subject,
    description: params.description?.trim() || '',
    instructorId: instructor.id,
    instructorName: instructor.name,
    instructorEmail: instructor.email,
    createdAt: new Date().toISOString(),
    studentCount: 0,
    sharedInstructorEmails: [],
    sharedInstructors: []
  };

  // Save to local storage
  const localClasses = getLocalItem<ClassItem[]>(LOCAL_CLASSES_KEY, []);
  localClasses.unshift(classData);
  setLocalItem(LOCAL_CLASSES_KEY, localClasses);

  // Try Firestore
  try {
    const classRef = doc(db, 'classes', classId);
    await setDoc(classRef, cleanFirestoreData(classData));
  } catch {
    // Offline: saved locally
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('igcse_classes_updated', { detail: { classId } }));
  }

  return { 
    success: true, 
    classItem: classData, 
    message: `Class "${classData.name}" created with code ${classData.classCode}!` 
  };
}

/**
 * Share a class with another instructor by email so they can add tasks and track analytics
 */
export async function shareClassWithInstructor(
  classId: string,
  targetEmail: string,
  currentInstructor: UserProfile
): Promise<{ success: boolean; message: string; classItem?: ClassItem }> {
  const cleanEmail = targetEmail.toLowerCase().trim();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { success: false, message: 'Please provide a valid email address.' };
  }

  const localClasses = getLocalItem<ClassItem[]>(LOCAL_CLASSES_KEY, []);
  const clsIndex = localClasses.findIndex(c => c.id === classId);
  let targetClass = clsIndex >= 0 ? localClasses[clsIndex] : null;

  if (!targetClass) {
    try {
      const snap = await getDoc(doc(db, 'classes', classId));
      if (snap.exists()) {
        targetClass = snap.data() as ClassItem;
      }
    } catch {}
  }

  if (!targetClass) {
    return { success: false, message: 'Class not found.' };
  }

  if (targetClass.instructorEmail?.toLowerCase() === cleanEmail) {
    return { success: false, message: 'This email belongs to the primary creator of the class.' };
  }

  const existingEmails = (targetClass.sharedInstructorEmails || []).map(e => e.toLowerCase());
  if (existingEmails.includes(cleanEmail)) {
    return { success: false, message: `This class is already shared with ${cleanEmail}.` };
  }

  const newRecord: SharedInstructorRecord = {
    email: cleanEmail,
    name: cleanEmail.split('@')[0],
    sharedAt: new Date().toISOString(),
    addedBy: currentInstructor.name || currentInstructor.email
  };

  const updatedClass: ClassItem = {
    ...targetClass,
    sharedInstructorEmails: [...existingEmails, cleanEmail],
    sharedInstructors: [...(targetClass.sharedInstructors || []), newRecord]
  };

  if (clsIndex >= 0) {
    localClasses[clsIndex] = updatedClass;
  } else {
    localClasses.unshift(updatedClass);
  }
  setLocalItem(LOCAL_CLASSES_KEY, localClasses);

  // Upgrade user role to instructor if already registered or invite them
  try {
    const usersQ = query(collection(db, 'users'), where('email', '==', cleanEmail));
    const userSnap = await getDocs(usersQ);
    for (const u of userSnap.docs) {
      await updateDoc(u.ref, { role: 'instructor' });
    }
  } catch {}

  // Update in Firestore
  try {
    const classRef = doc(db, 'classes', classId);
    await setDoc(classRef, cleanFirestoreData(updatedClass), { merge: true });
  } catch (err) {
    console.warn('Firestore write for shared instructor error:', err);
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('igcse_classes_updated', { detail: { classId, updatedClass } }));
  }

  return {
    success: true,
    classItem: updatedClass,
    message: `Class "${updatedClass.name}" successfully shared with ${cleanEmail}! They now have full access to assign tasks and view live progress & analytics.`
  };
}

/**
 * Remove co-instructor access from a class
 */
export async function removeSharedInstructorFromClass(
  classId: string,
  targetEmail: string
): Promise<{ success: boolean; message: string; classItem?: ClassItem }> {
  const cleanEmail = targetEmail.toLowerCase().trim();
  const localClasses = getLocalItem<ClassItem[]>(LOCAL_CLASSES_KEY, []);
  const clsIndex = localClasses.findIndex(c => c.id === classId);
  let targetClass = clsIndex >= 0 ? localClasses[clsIndex] : null;

  if (!targetClass) {
    try {
      const snap = await getDoc(doc(db, 'classes', classId));
      if (snap.exists()) {
        targetClass = snap.data() as ClassItem;
      }
    } catch {}
  }

  if (!targetClass) {
    return { success: false, message: 'Class not found.' };
  }

  const updatedClass: ClassItem = {
    ...targetClass,
    sharedInstructorEmails: (targetClass.sharedInstructorEmails || []).filter(e => e.toLowerCase() !== cleanEmail),
    sharedInstructors: (targetClass.sharedInstructors || []).filter(i => i.email.toLowerCase() !== cleanEmail)
  };

  if (clsIndex >= 0) {
    localClasses[clsIndex] = updatedClass;
  } else {
    localClasses.unshift(updatedClass);
  }
  setLocalItem(LOCAL_CLASSES_KEY, localClasses);

  try {
    const classRef = doc(db, 'classes', classId);
    await setDoc(classRef, cleanFirestoreData(updatedClass), { merge: true });
  } catch (err) {
    console.warn('Firestore update for removeSharedInstructor error:', err);
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('igcse_classes_updated', { detail: { classId, updatedClass } }));
  }

  return {
    success: true,
    classItem: updatedClass,
    message: `Access for ${cleanEmail} has been removed from this class.`
  };
}

/**
 * Fetch all classes created by or shared with an instructor
 */
export async function fetchClassesByInstructor(instructorId: string, instructorEmail?: string): Promise<ClassItem[]> {
  const localClasses = getLocalItem<ClassItem[]>(LOCAL_CLASSES_KEY, []);
  const cleanEmail = (instructorEmail || '').toLowerCase().trim();

  const instructorLocal = localClasses.filter(c => 
    c.id && c.id !== 'class_default_0653' && (
      c.instructorId === instructorId || 
      (cleanEmail && c.instructorEmail?.toLowerCase() === cleanEmail) ||
      (cleanEmail && Array.isArray(c.sharedInstructorEmails) && c.sharedInstructorEmails.map(e => e.toLowerCase()).includes(cleanEmail))
    )
  );

  try {
    const snap = await getDocs(collection(db, 'classes'));
    const remoteClasses: ClassItem[] = [];
    snap.forEach(docSnap => {
      const c = docSnap.data() as ClassItem;
      if (c && c.id && c.id !== 'class_default_0653') {
        if (
          c.instructorId === instructorId || 
          (cleanEmail && c.instructorEmail?.toLowerCase() === cleanEmail) ||
          (cleanEmail && Array.isArray(c.sharedInstructorEmails) && c.sharedInstructorEmails.map(e => e.toLowerCase()).includes(cleanEmail))
        ) {
          remoteClasses.push(c);
        }
      }
    });

    if (remoteClasses.length > 0) {
      // Merge remote with local
      const mergedMap = new Map<string, ClassItem>();
      instructorLocal.forEach(c => mergedMap.set(c.id, c));
      remoteClasses.forEach(c => mergedMap.set(c.id, c));
      const merged = Array.from(mergedMap.values());
      setLocalItem(LOCAL_CLASSES_KEY, merged);
      return merged.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
  } catch {
    // Offline mode: return local classes
  }

  return instructorLocal.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/**
 * Find class by class code (case-insensitive)
 */
export async function findClassByCode(rawCode: string): Promise<ClassItem | null> {
  const cleanCode = rawCode.trim().toUpperCase();
  if (!cleanCode) return null;

  // Block discontinued default code
  if (cleanCode === 'SCI-0653' || cleanCode === '0653') {
    return null;
  }

  // Check local classes first
  const localClasses = getLocalItem<ClassItem[]>(LOCAL_CLASSES_KEY, []);
  let match = localClasses.find(c => 
    c.id !== 'class_default_0653' && (
      c.classCode.toUpperCase() === cleanCode || 
      c.classCode.toUpperCase() === `SCI-${cleanCode}`
    )
  );
  if (match) return match;

  try {
    const q = query(
      collection(db, 'classes'),
      where('classCode', '==', cleanCode)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const c = snap.docs[0].data() as ClassItem;
      if (c && c.id && c.id !== 'class_default_0653') {
        return c;
      }
    }

    const q2 = query(
      collection(db, 'classes'),
      where('classCode', '==', `SCI-${cleanCode}`)
    );
    const snap2 = await getDocs(q2);
    if (!snap2.empty) {
      const c2 = snap2.docs[0].data() as ClassItem;
      if (c2 && c2.id && c2.id !== 'class_default_0653') {
        return c2;
      }
    }
  } catch {
    // Offline
  }

  return null;
}

/**
 * Student joins a class using a class code
 */
export async function joinClassWithCode(
  classCode: string,
  student: UserProfile,
  progress: StudentProgress
): Promise<{ success: boolean; classItem?: ClassItem; message: string }> {
  const clean = classCode.trim().toUpperCase();
  if (clean === 'SCI-0653' || clean === '0653') {
    return {
      success: false,
      message: 'The default class code SCI-0653 has been discontinued. Please enter an active class code provided by your instructor.'
    };
  }

  const targetClass = await findClassByCode(classCode);
  if (!targetClass || targetClass.id === 'class_default_0653') {
    return { 
      success: false, 
      message: `No active class found with code "${classCode.toUpperCase()}". Please verify the code with your instructor.` 
    };
  }

  // Compute weak topics
  const weakTopics = Object.entries(progress.topicConfidence || {})
    .filter(([_, rating]) => rating <= 2)
    .map(([code]) => code);

  const joinedTimestamp = new Date().toISOString();

  // Combine completed lessons, traffic lights, and quiz scores for live 100% accurate deck count
  const completedDecks = Array.from(new Set([
    ...(progress.completedLessons || []),
    ...Object.keys(progress.trafficLights || {}),
    ...Object.keys(progress.subtopicQuizScores || {})
  ]));

  const enrollmentData: ClassStudentItem = {
    studentId: student.id,
    name: student.name,
    email: student.email,
    tier: student.tier,
    joinedAt: joinedTimestamp,
    lastActive: joinedTimestamp,
    completedLessonsCount: completedDecks.length,
    completedLessons: completedDecks,
    quizScores: progress.quizScores || {},
    subtopicQuizScores: progress.subtopicQuizScores || {},
    topicConfidence: progress.topicConfidence || {},
    trafficLights: progress.trafficLights || {},
    weakTopics
  };

  // Save to local class students
  const studentKey = `${LOCAL_STUDENTS_PREFIX}${targetClass.id}`;
  const localClassStudents = getLocalItem<ClassStudentItem[]>(studentKey, []);
  const existingIndex = localClassStudents.findIndex(s => s.studentId === student.id);
  if (existingIndex >= 0) {
    localClassStudents[existingIndex] = enrollmentData;
  } else {
    localClassStudents.push(enrollmentData);
  }
  setLocalItem(studentKey, localClassStudents);

  // Update student's enrolled classes list locally
  const enrolledKey = `${LOCAL_ENROLLED_PREFIX}${student.id}`;
  const localEnrolled = getLocalItem<ClassItem[]>(enrolledKey, []);
  if (!localEnrolled.some(c => c.id === targetClass.id)) {
    targetClass.studentCount = (targetClass.studentCount || 0) + 1;
    localEnrolled.push(targetClass);
    setLocalItem(enrolledKey, localEnrolled);

    // Update in LOCAL_CLASSES_KEY
    const allLocalClasses = getLocalItem<ClassItem[]>(LOCAL_CLASSES_KEY, []);
    const clsIdx = allLocalClasses.findIndex(c => c.id === targetClass.id);
    if (clsIdx >= 0) {
      allLocalClasses[clsIdx].studentCount = (allLocalClasses[clsIdx].studentCount || 0) + 1;
      setLocalItem(LOCAL_CLASSES_KEY, allLocalClasses);
    }
  }

  // Record notification for the instructor
  const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  const notifPayload = {
    id: notificationId,
    type: 'student_joined',
    instructorEmail: targetClass.instructorEmail || 'corbanb@gisboyshigh.net',
    studentId: student.id,
    studentName: student.name,
    studentEmail: student.email,
    studentTier: student.tier,
    classId: targetClass.id,
    className: targetClass.name,
    classCode: targetClass.classCode,
    joinedAt: joinedTimestamp,
    read: false
  };

  const existingNotifs = getLocalItem<any[]>(LOCAL_NOTIFICATIONS_KEY, []);
  existingNotifs.unshift(notifPayload);
  setLocalItem(LOCAL_NOTIFICATIONS_KEY, existingNotifs);

  // Send real email notification via server API
  try {
    fetch('/api/notify-class-join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instructorEmail: targetClass.instructorEmail || 'corbanb@gisboyshigh.net',
        studentName: student.name,
        studentEmail: student.email,
        studentTier: student.tier,
        className: targetClass.name,
        classCode: targetClass.classCode,
        joinedAt: joinedTimestamp
      })
    }).catch(err => {
      console.warn('Class join email dispatch error:', err);
    });
  } catch (err) {
    console.warn('Error invoking /api/notify-class-join:', err);
  }

  // Try Firestore
  try {
    const studentEnrollmentRef = doc(db, 'classes', targetClass.id, 'students', student.id);
    await setDoc(studentEnrollmentRef, enrollmentData, { merge: true });

    const classRef = doc(db, 'classes', targetClass.id);
    await updateDoc(classRef, { studentCount: increment(1) });

    const userRef = doc(db, 'users', student.id);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const curEnrolled: string[] = userSnap.data().enrolledClassIds || [];
      if (!curEnrolled.includes(targetClass.id)) {
        await updateDoc(userRef, {
          enrolledClassIds: [...curEnrolled, targetClass.id]
        });
      }
    }

    // Try storing notification in firestore
    setDoc(doc(db, 'notifications', notificationId), notifPayload).catch(() => {});
  } catch {
    // Offline: enrolled locally
  }

  return { 
    success: true, 
    classItem: targetClass, 
    message: `Successfully joined ${targetClass.name} (Code: ${targetClass.classCode})! Your instructor has been notified by email.` 
  };
}

/**
 * Fetch all classes a student is enrolled in
 */
export async function fetchStudentEnrolledClasses(studentId: string): Promise<ClassItem[]> {
  const enrolledKey = `${LOCAL_ENROLLED_PREFIX}${studentId}`;
  const localEnrolled = getLocalItem<ClassItem[]>(enrolledKey, [])
    .filter(c => c && c.id && c.id !== 'class_default_0653');

  try {
    const userRef = doc(db, 'users', studentId);
    const userSnap = await getDoc(userRef);
    const enrolledIds: string[] = (userSnap.exists() && userSnap.data()?.enrolledClassIds) || [];
    
    // Filter out any invalid default class IDs
    const validEnrolledIds = enrolledIds.filter(id => id && id !== 'class_default_0653');

    const classes: ClassItem[] = [];
    for (const classId of validEnrolledIds) {
      try {
        const classSnap = await getDoc(doc(db, 'classes', classId));
        if (classSnap.exists()) {
          const cData = classSnap.data() as ClassItem;
          if (cData && cData.id && cData.id !== 'class_default_0653') {
            classes.push(cData);
          }
        }
      } catch {}
    }

    // Also check if student exists in any class's students subcollection
    try {
      const allClassSnap = await getDocs(collection(db, 'classes'));
      for (const cd of allClassSnap.docs) {
        if (cd.id === 'class_default_0653') continue;
        if (!classes.some(c => c.id === cd.id)) {
          const studentDoc = await getDoc(doc(db, 'classes', cd.id, 'students', studentId));
          if (studentDoc.exists()) {
            const cData = cd.data() as ClassItem;
            if (cData && cData.id && cData.id !== 'class_default_0653') {
              classes.push(cData);
            }
          }
        }
      }
    } catch {}

    setLocalItem(enrolledKey, classes);
    return classes;
  } catch {
    // Offline mode: return local enrolled classes
  }

  return localEnrolled;
}

/**
 * Fetch all registered students on the platform across users collection and class rosters
 */
export async function fetchAllRegisteredStudents(): Promise<ClassStudentItem[]> {
  const studentMap = new Map<string, ClassStudentItem>();

  // 1. Fetch from users collection where role is 'student'
  try {
    const usersSnap = await getDocs(collection(db, 'users'));
    usersSnap.forEach(d => {
      const data = d.data();
      if (data && (data.role === 'student' || (!data.role && data.email !== 'corbanb@gisboyshigh.net'))) {
        const studentId = d.id;
        studentMap.set(studentId, {
          studentId,
          name: data.name || 'Student',
          email: data.email || '',
          tier: data.tier || 'Extended',
          joinedAt: data.createdAt || new Date().toISOString(),
          lastActive: data.lastActive || new Date().toISOString(),
          completedLessonsCount: 0,
          quizScores: {},
          subtopicQuizScores: {},
          topicConfidence: {},
          trafficLights: {},
          weakTopics: []
        });
      }
    });
  } catch (err) {
    console.warn('Could not read users collection for student list:', err);
  }

  // 2. Fetch from all classes students subcollections
  try {
    const classesSnap = await getDocs(collection(db, 'classes'));
    for (const classDoc of classesSnap.docs) {
      const classId = classDoc.id;
      const classStudents = await fetchStudentsInClass(classId);
      for (const s of classStudents) {
        if (!studentMap.has(s.studentId)) {
          studentMap.set(s.studentId, s);
        } else {
          const existing = studentMap.get(s.studentId)!;
          studentMap.set(s.studentId, {
            ...existing,
            ...s,
            email: s.email || existing.email
          });
        }
      }
    }
  } catch (err) {
    console.warn('Could not read classes subcollections:', err);
  }

  // 3. Fallback to local storage cached students
  const localClasses = getLocalItem<ClassItem[]>(LOCAL_CLASSES_KEY, [])
    .filter(c => c && c.id && c.id !== 'class_default_0653');
  for (const c of localClasses) {
    const studentKey = `${LOCAL_STUDENTS_PREFIX}${c.id}`;
    const localClassStudents = getLocalItem<ClassStudentItem[]>(studentKey, []);
    for (const s of localClassStudents) {
      if (!studentMap.has(s.studentId)) {
        studentMap.set(s.studentId, s);
      }
    }
  }

  return Array.from(studentMap.values()).sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Fetch all students and their detailed progress enrolled in a specific class
 */
export async function fetchStudentsInClass(classId: string): Promise<ClassStudentItem[]> {
  if (!classId || classId === 'class_default_0653') return [];
  const studentKey = `${LOCAL_STUDENTS_PREFIX}${classId}`;
  const localStudents = getLocalItem<ClassStudentItem[]>(studentKey, []);

  try {
    const snap = await getDocs(collection(db, 'classes', classId, 'students'));
    const remoteList: ClassStudentItem[] = [];
    snap.forEach(docSnap => {
      remoteList.push(docSnap.data() as ClassStudentItem);
    });

    if (remoteList.length > 0) {
      setLocalItem(studentKey, remoteList);
      return remoteList.sort((a, b) => b.lastActive.localeCompare(a.lastActive));
    }
  } catch {
    // Offline mode: return local students
  }

  return localStudents.sort((a, b) => b.lastActive.localeCompare(a.lastActive));
}

function mergeSlidesReadMaps(
  ...maps: (Record<string, SubtopicSlideProgress> | undefined)[]
): Record<string, SubtopicSlideProgress> {
  const merged: Record<string, SubtopicSlideProgress> = {};
  const canonicalKeys = new Map<string, string>();

  for (const map of maps) {
    if (!map || typeof map !== 'object') continue;
    for (const [rawKey, entry] of Object.entries(map)) {
      if (!entry || typeof entry !== 'object') continue;
      const upper = rawKey.trim().toUpperCase();
      const targetKey = canonicalKeys.get(upper) || rawKey;
      canonicalKeys.set(upper, targetKey);

      const prev = merged[targetKey];
      if (!prev) {
        merged[targetKey] = {
          visitedKeys: Array.isArray(entry.visitedKeys) ? Array.from(new Set(entry.visitedKeys)) : [],
          totalSlides: Number(entry.totalSlides) || 0,
          allSlidesRead: Boolean(entry.allSlidesRead),
          updatedAt: entry.updatedAt || new Date().toISOString()
        };
      } else {
        const unionKeys = Array.from(new Set([
          ...(Array.isArray(prev.visitedKeys) ? prev.visitedKeys : []),
          ...(Array.isArray(entry.visitedKeys) ? entry.visitedKeys : [])
        ]));
        const prevTime = new Date(prev.updatedAt || 0).getTime() || 0;
        const nextTime = new Date(entry.updatedAt || 0).getTime() || 0;
        const latestTotal = nextTime >= prevTime && (entry.totalSlides || 0) > 0
          ? entry.totalSlides
          : (prev.totalSlides || entry.totalSlides || 0);
        const allSlidesRead = Boolean(prev.allSlidesRead || entry.allSlidesRead);
        merged[targetKey] = {
          visitedKeys: unionKeys,
          totalSlides: latestTotal,
          allSlidesRead,
          updatedAt: nextTime >= prevTime ? (entry.updatedAt || prev.updatedAt) : prev.updatedAt
        };
      }
    }
  }
  return merged;
}

function mergeSubtopicQuizScoresMaps(
  ...maps: (Record<string, SubtopicQuizResult> | undefined)[]
): Record<string, SubtopicQuizResult> {
  const merged: Record<string, SubtopicQuizResult> = {};
  const canonicalKeys = new Map<string, string>();

  for (const map of maps) {
    if (!map || typeof map !== 'object') continue;
    for (const [rawKey, entry] of Object.entries(map)) {
      if (!entry || typeof entry !== 'object') continue;
      const upper = rawKey.trim().toUpperCase();
      const targetKey = canonicalKeys.get(upper) || rawKey;
      canonicalKeys.set(upper, targetKey);

      const prev = merged[targetKey];
      if (!prev) {
        merged[targetKey] = entry;
      } else {
        const prevPct = getSubtopicResultPercentage(prev) ?? -1;
        const nextPct = getSubtopicResultPercentage(entry) ?? -1;
        if (nextPct > prevPct || (nextPct === prevPct && (entry.date || '') >= (prev.date || ''))) {
          merged[targetKey] = entry;
        }
      }
    }
  }
  return merged;
}

function mergePracticeQuizByLengthMaps(
  ...maps: (Record<string, QuizLengthRecord> | undefined)[]
): Record<string, QuizLengthRecord> {
  const merged: Record<string, QuizLengthRecord> = {};
  for (const map of maps) {
    if (!map || typeof map !== 'object') continue;
    for (const [key, rec] of Object.entries(map)) {
      if (!rec || typeof rec !== 'object') continue;
      const prev = merged[key];
      if (!prev) {
        merged[key] = rec;
      } else {
        const prevTime = new Date(prev.date || 0).getTime() || 0;
        const nextTime = new Date(rec.date || 0).getTime() || 0;
        if (nextTime >= prevTime || rec.percentage > prev.percentage) {
          merged[key] = rec;
        }
      }
    }
  }
  return merged;
}

function mergeTrafficLightsMaps(
  ...maps: (Record<string, TrafficLightStatus> | undefined)[]
): Record<string, TrafficLightStatus> {
  const rank: Record<TrafficLightStatus, number> = { red: 1, orange: 2, green: 3 };
  const merged: Record<string, TrafficLightStatus> = {};
  const canonicalKeys = new Map<string, string>();
  for (const map of maps) {
    if (!map || typeof map !== 'object') continue;
    for (const [rawKey, val] of Object.entries(map)) {
      if (!val || !rank[val]) continue;
      const upper = rawKey.trim().toUpperCase();
      const targetKey = canonicalKeys.get(upper) || rawKey;
      canonicalKeys.set(upper, targetKey);
      const prev = merged[targetKey];
      if (!prev || rank[val] >= rank[prev]) {
        merged[targetKey] = val;
      }
    }
  }
  return merged;
}

function mergeQuizScoresMaps(
  ...maps: (Record<string, { score: number; total: number; date: string }> | undefined)[]
): Record<string, { score: number; total: number; date: string }> {
  const merged: Record<string, { score: number; total: number; date: string }> = {};
  for (const map of maps) {
    if (!map || typeof map !== 'object') continue;
    for (const [subj, rec] of Object.entries(map)) {
      if (!rec) continue;
      const prev = merged[subj];
      if (!prev) {
        merged[subj] = rec;
      } else {
        const prevPct = prev.score / Math.max(1, prev.total);
        const nextPct = rec.score / Math.max(1, rec.total);
        if (nextPct > prevPct || (nextPct === prevPct && rec.score >= prev.score)) {
          merged[subj] = rec;
        }
      }
    }
  }
  return merged;
}

/**
 * Hydrate and monotonically merge student progress from Firestore (/users/{uid} and /classes/{classId}/students/{uid})
 * into local StudentProgress so signing in on a new browser or device never loses completed work or overwrites Firestore.
 */
export async function hydrateStudentProgressFromFirestore(
  studentId: string,
  enrolledClassIds: string[],
  localProgress: StudentProgress
): Promise<StudentProgress> {
  if (!studentId) return localProgress;

  const remoteSnapshots: Partial<StudentProgress>[] = [];

  try {
    const userDocSnap = await getDoc(doc(db, 'users', studentId));
    if (userDocSnap.exists()) {
      const data = userDocSnap.data();
      if (data?.progressSnapshot && typeof data.progressSnapshot === 'object') {
        remoteSnapshots.push(data.progressSnapshot as Partial<StudentProgress>);
      }
    }
  } catch {
    // Offline fallback
  }

  for (const classId of enrolledClassIds) {
    if (!classId || classId === 'class_default_0653') continue;
    try {
      const stuSnap = await getDoc(doc(db, 'classes', classId, 'students', studentId));
      if (stuSnap.exists()) {
        const data = stuSnap.data() as ClassStudentItem;
        hydratedRemoteMaxByClassStudent.set(`${classId}_${studentId}`, data);
        remoteSnapshots.push({
          completedLessons: data.completedLessons || [],
          slidesReadBySubtopic: data.slidesReadBySubtopic || {},
          quizScores: data.quizScores || {},
          practiceQuizByLength: data.practiceQuizByLength || {},
          subtopicQuizScores: data.subtopicQuizScores || {},
          topicConfidence: data.topicConfidence || {},
          trafficLights: data.trafficLights || {},
          earnedBadges: data.earnedBadges || [],
          featuredBadgeId: data.featuredBadgeId,
          cumulativeQuizPoints: data.cumulativeQuizPoints || data.totalQuizScore || 0,
          cumulativeQuizzesCount: data.cumulativeQuizzesCount || data.quizzesCompletedCount || 0,
          bestTotalXP: data.bestTotalXP || data.xp || 0,
          currentStreak: data.streakDays || 0
        });
      }
    } catch {
      // Offline fallback
    }
  }

  if (remoteSnapshots.length === 0) {
    return localProgress;
  }

  const mergedSlides = mergeSlidesReadMaps(
    ...remoteSnapshots.map(s => s.slidesReadBySubtopic),
    localProgress.slidesReadBySubtopic
  );
  const readSlideSubtopics = Object.entries(mergedSlides)
    .filter(([_, s]) => s && s.allSlidesRead)
    .map(([code]) => code);

  const completedSet = new Set<string>();
  const completedCanonical = new Set<string>();
  [
    ...remoteSnapshots.flatMap(s => s.completedLessons || []),
    ...(localProgress.completedLessons || []),
    ...readSlideSubtopics
  ].forEach(code => {
    if (!code) return;
    const upper = code.trim().toUpperCase();
    if (!completedCanonical.has(upper)) {
      completedCanonical.add(upper);
      completedSet.add(code);
    }
  });

  const mergedSubScores = mergeSubtopicQuizScoresMaps(
    ...remoteSnapshots.map(s => s.subtopicQuizScores),
    localProgress.subtopicQuizScores
  );
  const quizDerivedLights: Record<string, TrafficLightStatus> = {};
  for (const [code, res] of Object.entries(mergedSubScores)) {
    const pct = getSubtopicResultPercentage(res);
    if (pct !== undefined) {
      quizDerivedLights[code] = calculateTrafficLightFromPercentage(pct);
    }
  }
  const mergedLights = mergeTrafficLightsMaps(
    ...remoteSnapshots.map(s => s.trafficLights),
    localProgress.trafficLights,
    quizDerivedLights
  );

  const mergedQuizScores = mergeQuizScoresMaps(
    ...remoteSnapshots.map(s => s.quizScores),
    localProgress.quizScores
  );
  const mergedPracticeByLength = mergePracticeQuizByLengthMaps(
    ...remoteSnapshots.map(s => s.practiceQuizByLength),
    localProgress.practiceQuizByLength
  );

  const mergedConfidence: Record<string, number> = Object.assign(
    {},
    ...remoteSnapshots.map(s => s.topicConfidence || {}),
    localProgress.topicConfidence || {}
  );
  const mergedNotes: Record<string, string> = Object.assign(
    {},
    ...remoteSnapshots.map(s => s.savedNotes || {}),
    localProgress.savedNotes || {}
  );

  const badgeMap = new Map<string, string>();
  remoteSnapshots.forEach(s => (s.earnedBadges || []).forEach(b => { if (b?.badgeId) badgeMap.set(b.badgeId, b.unlockedAt); }));
  (localProgress.earnedBadges || []).forEach(b => { if (b?.badgeId) badgeMap.set(b.badgeId, b.unlockedAt); });

  const bestTotalXP = Math.max(
    localProgress.bestTotalXP || 0,
    ...remoteSnapshots.map(s => s.bestTotalXP || 0)
  );
  const cumulativeQuizPoints = Math.max(
    localProgress.cumulativeQuizPoints || 0,
    ...remoteSnapshots.map(s => s.cumulativeQuizPoints || 0)
  );
  const cumulativeQuizzesCount = Math.max(
    localProgress.cumulativeQuizzesCount || 0,
    ...remoteSnapshots.map(s => s.cumulativeQuizzesCount || 0)
  );
  const currentStreak = Math.max(
    localProgress.currentStreak || 0,
    ...remoteSnapshots.map(s => s.currentStreak || 0)
  );

  return {
    ...localProgress,
    completedLessons: Array.from(completedSet),
    slidesReadBySubtopic: mergedSlides,
    subtopicQuizScores: mergedSubScores,
    trafficLights: mergedLights,
    quizScores: mergedQuizScores,
    practiceQuizByLength: mergedPracticeByLength,
    topicConfidence: mergedConfidence,
    savedNotes: mergedNotes,
    earnedBadges: Array.from(badgeMap.entries()).map(([badgeId, unlockedAt]) => ({ badgeId, unlockedAt })),
    featuredBadgeId: localProgress.featuredBadgeId || remoteSnapshots.find(s => s.featuredBadgeId)?.featuredBadgeId,
    bestTotalXP,
    cumulativeQuizPoints,
    cumulativeQuizzesCount,
    currentStreak
  };
}

/**
 * Sync student's live progress to all classes they are enrolled in
 */
export async function syncStudentProgressToClasses(
  student: UserProfile,
  progress: StudentProgress,
  enrolledClassIds: string[]
): Promise<void> {
  if (!student.id || enrolledClassIds.length === 0) return;

  const badgeEval = evaluateStudentBadges(progress, student);

  // Also persist a backup snapshot on /users/{student.id} (monotonically merged later on hydrate)
  try {
    await setDoc(doc(db, 'users', student.id), cleanFirestoreData({
      progressSnapshot: {
        completedLessons: progress.completedLessons || [],
        slidesReadBySubtopic: progress.slidesReadBySubtopic || {},
        subtopicQuizScores: progress.subtopicQuizScores || {},
        trafficLights: progress.trafficLights || {},
        quizScores: progress.quizScores || {},
        practiceQuizByLength: progress.practiceQuizByLength || {},
        topicConfidence: progress.topicConfidence || {},
        earnedBadges: progress.earnedBadges || [],
        bestTotalXP: Math.max(progress.bestTotalXP || 0, badgeEval.totalXP),
        cumulativeQuizPoints: progress.cumulativeQuizPoints || 0,
        cumulativeQuizzesCount: progress.cumulativeQuizzesCount || 0
      },
      lastActive: new Date().toISOString()
    }), { merge: true });
  } catch {
    // Offline fallback
  }

  for (const classId of enrolledClassIds) {
    // Update local cache
    const studentKey = `${LOCAL_STUDENTS_PREFIX}${classId}`;
    const localStudents = getLocalItem<ClassStudentItem[]>(studentKey, []);
    const idx = localStudents.findIndex(s => s.studentId === student.id);
    const existingLocal = idx >= 0 ? localStudents[idx] : undefined;

    // Fetch existing Firestore record at most once per session so cross-device high scores are never overwritten
    const cacheKey = `${classId}_${student.id}`;
    let remoteMax = hydratedRemoteMaxByClassStudent.get(cacheKey);
    if (!remoteMax) {
      try {
        const studentDocRef = doc(db, 'classes', classId, 'students', student.id);
        const snap = await getDoc(studentDocRef);
        if (snap.exists()) {
          remoteMax = snap.data() as ClassStudentItem;
        } else {
          remoteMax = {};
        }
      } catch {
        remoteMax = {};
      }
      hydratedRemoteMaxByClassStudent.set(cacheKey, remoteMax);
    }

    const mergedSlidesRead = mergeSlidesReadMaps(
      remoteMax.slidesReadBySubtopic,
      existingLocal?.slidesReadBySubtopic,
      progress.slidesReadBySubtopic
    );
    const readSlideSubtopics = Object.entries(mergedSlidesRead)
      .filter(([_, s]) => s && s.allSlidesRead)
      .map(([code]) => code);
    const completedDecks = Array.from(new Set([
      ...(remoteMax.completedLessons || []),
      ...(existingLocal?.completedLessons || []),
      ...(progress.completedLessons || []),
      ...readSlideSubtopics
    ]));

    const mergedSubtopicScores = mergeSubtopicQuizScoresMaps(
      remoteMax.subtopicQuizScores,
      existingLocal?.subtopicQuizScores,
      progress.subtopicQuizScores
    );
    const mergedPracticeQuizByLength = mergePracticeQuizByLengthMaps(
      remoteMax.practiceQuizByLength,
      existingLocal?.practiceQuizByLength,
      progress.practiceQuizByLength
    );
    const mergedQuizScores = mergeQuizScoresMaps(
      remoteMax.quizScores,
      existingLocal?.quizScores,
      progress.quizScores
    );
    const mergedTopicConfidence: Record<string, number> = {
      ...(remoteMax.topicConfidence || {}),
      ...(existingLocal?.topicConfidence || {}),
      ...(progress.topicConfidence || {})
    };
    const mergedTrafficLights = mergeTrafficLightsMaps(
      remoteMax.trafficLights,
      existingLocal?.trafficLights,
      progress.trafficLights
    );
    const weakTopics = Object.entries(mergedTopicConfidence)
      .filter(([_, rating]) => rating <= 2)
      .map(([code]) => code);

    const subScores = Object.values(mergedSubtopicScores);
    const mainScores = Object.values(mergedQuizScores);
    const lengthRecords = Object.values(mergedPracticeQuizByLength);
    const lengthDates = new Set(lengthRecords.map(r => r?.date).filter(Boolean));
    const unrecordedMain = mainScores.filter(q => q && !lengthDates.has(q.date));

    const legacyQuizSum =
      subScores.reduce((acc, s) => acc + (s?.score || 0), 0) +
      mainScores.reduce((acc, q) => acc + (q?.score || 0), 0);
    const lengthAwareSum =
      subScores.reduce((acc, s) => acc + (s?.score || 0), 0) +
      lengthRecords.reduce((acc, r) => acc + (r?.score || 0), 0) +
      unrecordedMain.reduce((acc, q) => acc + (q?.score || 0), 0);

    const totalQuizScore = Math.max(
      remoteMax.totalQuizScore || 0,
      remoteMax.cumulativeQuizPoints || 0,
      existingLocal?.totalQuizScore || 0,
      existingLocal?.cumulativeQuizPoints || 0,
      progress.cumulativeQuizPoints || 0,
      legacyQuizSum,
      lengthAwareSum
    );
    const quizzesCompletedCount = Math.max(
      remoteMax.quizzesCompletedCount || 0,
      remoteMax.cumulativeQuizzesCount || 0,
      existingLocal?.quizzesCompletedCount || 0,
      existingLocal?.cumulativeQuizzesCount || 0,
      progress.cumulativeQuizzesCount || 0,
      subScores.length + mainScores.length,
      subScores.length + lengthRecords.length + unrecordedMain.length
    );

    const badgeMap = new Map<string, string>();
    (remoteMax.earnedBadges || []).forEach(b => { if (b?.badgeId) badgeMap.set(b.badgeId, b.unlockedAt); });
    (existingLocal?.earnedBadges || []).forEach(b => { if (b?.badgeId) badgeMap.set(b.badgeId, b.unlockedAt); });
    (progress.earnedBadges || []).forEach(b => { if (b?.badgeId) badgeMap.set(b.badgeId, b.unlockedAt); });
    badgeEval.unlockedBadges.forEach(b => {
      if (!badgeMap.has(b.id)) badgeMap.set(b.id, b.unlockedAt || new Date().toISOString());
    });
    const mergedEarnedBadges = Array.from(badgeMap.entries()).map(([badgeId, unlockedAt]) => ({ badgeId, unlockedAt }));

    const badgesCount = Math.max(
      remoteMax.badgesCount || 0,
      existingLocal?.badgesCount || 0,
      mergedEarnedBadges.length,
      badgeEval.unlockedBadges.length
    );
    const monotonicXP = Math.max(
      remoteMax.xp || 0,
      remoteMax.bestTotalXP || 0,
      existingLocal?.xp || 0,
      existingLocal?.bestTotalXP || 0,
      progress.bestTotalXP || 0,
      badgeEval.totalXP,
      student.xp || 0
    );
    const completedLessonsCount = Math.max(
      remoteMax.completedLessonsCount || 0,
      existingLocal?.completedLessonsCount || 0,
      completedDecks.length
    );

    const updatedRecord: ClassStudentItem = {
      studentId: student.id,
      name: student.name,
      email: student.email,
      tier: student.tier,
      joinedAt: existingLocal?.joinedAt || remoteMax.joinedAt || new Date().toISOString(),
      lastActive: new Date().toISOString(),
      completedLessonsCount,
      completedLessons: completedDecks,
      slidesReadBySubtopic: mergedSlidesRead,
      quizScores: mergedQuizScores,
      practiceQuizByLength: mergedPracticeQuizByLength,
      subtopicQuizScores: mergedSubtopicScores,
      topicConfidence: mergedTopicConfidence,
      trafficLights: mergedTrafficLights,
      weakTopics,
      totalQuizScore,
      cumulativeQuizPoints: totalQuizScore,
      quizzesCompletedCount,
      cumulativeQuizzesCount: quizzesCompletedCount,
      badgesCount,
      earnedBadges: mergedEarnedBadges,
      featuredBadgeId: progress.featuredBadgeId || student.featuredBadgeId || remoteMax.featuredBadgeId,
      streakDays: Math.max(progress.currentStreak || 1, existingLocal?.streakDays || 1, remoteMax.streakDays || 1),
      xp: monotonicXP,
      bestTotalXP: monotonicXP
    };

    hydratedRemoteMaxByClassStudent.set(cacheKey, updatedRecord);

    if (idx >= 0) {
      localStudents[idx] = updatedRecord;
    } else {
      localStudents.push(updatedRecord);
    }
    setLocalItem(studentKey, localStudents);

    // Try Firestore with setDoc merge so document is reliably written/updated
    try {
      const studentDocRef = doc(db, 'classes', classId, 'students', student.id);
      await setDoc(studentDocRef, cleanFirestoreData(updatedRecord), { merge: true });
    } catch {
      // Offline fallback
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('igcse_student_progress_synced', {
        detail: { studentId: student.id, classId, record: updatedRecord }
      }));
    }
  }
}

/**
 * Delete a class
 */
export async function deleteClass(classId: string): Promise<boolean> {
  // Delete from local storage
  const localClasses = getLocalItem<ClassItem[]>(LOCAL_CLASSES_KEY, []);
  setLocalItem(LOCAL_CLASSES_KEY, localClasses.filter(c => c.id !== classId));
  try {
    localStorage.removeItem(`${LOCAL_STUDENTS_PREFIX}${classId}`);
  } catch {}

  try {
    const studentsSnap = await getDocs(collection(db, 'classes', classId, 'students'));
    for (const s of studentsSnap.docs) {
      await deleteDoc(s.ref);
    }
    await deleteDoc(doc(db, 'classes', classId));
  } catch {
    // Offline
  }
  return true;
}

/**
 * Remove a student from a class
 */
export async function removeStudentFromClass(classId: string, studentId: string): Promise<boolean> {
  // Remove from local storage
  const studentKey = `${LOCAL_STUDENTS_PREFIX}${classId}`;
  const localStudents = getLocalItem<ClassStudentItem[]>(studentKey, []);
  setLocalItem(studentKey, localStudents.filter(s => s.studentId !== studentId));

  const allLocalClasses = getLocalItem<ClassItem[]>(LOCAL_CLASSES_KEY, []);
  const clsIdx = allLocalClasses.findIndex(c => c.id === classId);
  if (clsIdx >= 0) {
    allLocalClasses[clsIdx].studentCount = Math.max(0, (allLocalClasses[clsIdx].studentCount || 1) - 1);
    setLocalItem(LOCAL_CLASSES_KEY, allLocalClasses);
  }

  try {
    await deleteDoc(doc(db, 'classes', classId, 'students', studentId));
    await updateDoc(doc(db, 'classes', classId), {
      studentCount: increment(-1)
    });
  } catch {
    // Offline
  }

  return true;
}

export interface MoveStudentOptions {
  instructorName?: string;
  instructorEmail?: string;
  notifyStudent?: boolean;
}

export interface MoveStudentResult {
  success: boolean;
  message: string;
  sourceClass?: ClassItem | null;
  targetClass?: ClassItem | null;
  studentName?: string;
}

/**
 * Move a student from one class to another, preserving their full progress, quiz records,
 * and syllabus completion history.
 */
export async function moveStudentToClass(
  studentId: string,
  sourceClassId: string,
  targetClassId: string,
  options?: MoveStudentOptions
): Promise<MoveStudentResult> {
  if (!studentId || !sourceClassId || !targetClassId) {
    return { success: false, message: 'Invalid student or class IDs provided.' };
  }

  if (sourceClassId === targetClassId) {
    return { success: false, message: 'The student is already enrolled in this class.' };
  }

  // 1. Resolve source and target classes
  let sourceClass: ClassItem | null = null;
  let targetClass: ClassItem | null = null;

  // Check local classes
  const localClasses = getLocalItem<ClassItem[]>(LOCAL_CLASSES_KEY, []);
  sourceClass = localClasses.find(c => c.id === sourceClassId) || null;
  targetClass = localClasses.find(c => c.id === targetClassId) || null;

  // If not found locally, query Firestore
  if (!sourceClass && sourceClassId) {
    try {
      const snap = await getDoc(doc(db, 'classes', sourceClassId));
      if (snap.exists()) sourceClass = snap.data() as ClassItem;
    } catch {}
  }
  if (!targetClass && targetClassId) {
    try {
      const snap = await getDoc(doc(db, 'classes', targetClassId));
      if (snap.exists()) targetClass = snap.data() as ClassItem;
    } catch {}
  }

  if (!targetClass) {
    return { success: false, message: 'Target destination class could not be found.' };
  }

  // 2. Locate student's enrollment data from source class
  const sourceStudentKey = `${LOCAL_STUDENTS_PREFIX}${sourceClassId}`;
  const localSourceStudents = getLocalItem<ClassStudentItem[]>(sourceStudentKey, []);
  let studentData = localSourceStudents.find(s => s.studentId === studentId);

  // If not in local source list, check Firestore
  if (!studentData) {
    try {
      const snap = await getDoc(doc(db, 'classes', sourceClassId, 'students', studentId));
      if (snap.exists()) {
        studentData = snap.data() as ClassStudentItem;
      }
    } catch {}
  }

  // If still not found, check user profile or registered students
  if (!studentData) {
    try {
      const userSnap = await getDoc(doc(db, 'users', studentId));
      if (userSnap.exists()) {
        const u = userSnap.data();
        studentData = {
          studentId: u.uid || studentId,
          name: u.name || 'Student',
          email: u.email || '',
          tier: u.tier || 'Core',
          joinedAt: new Date().toISOString(),
          lastActive: new Date().toISOString(),
          completedLessonsCount: 0,
          quizScores: {},
          subtopicQuizScores: {},
          topicConfidence: {},
          trafficLights: {},
          weakTopics: []
        };
      }
    } catch {}
  }

  if (!studentData) {
    studentData = {
      studentId,
      name: 'Student',
      email: '',
      tier: 'Core',
      joinedAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      completedLessonsCount: 0,
      quizScores: {},
      subtopicQuizScores: {},
      topicConfidence: {},
      trafficLights: {},
      weakTopics: []
    };
  }

  const studentName = studentData.name;
  const now = new Date().toISOString();

  // Create updated enrollment object for target class
  const targetEnrollmentData: ClassStudentItem = {
    ...studentData,
    lastActive: now
  };

  // 3. Local Storage Updates:
  // Remove from source class
  setLocalItem(sourceStudentKey, localSourceStudents.filter(s => s.studentId !== studentId));

  // Add to target class
  const targetStudentKey = `${LOCAL_STUDENTS_PREFIX}${targetClassId}`;
  const localTargetStudents = getLocalItem<ClassStudentItem[]>(targetStudentKey, []);
  const targetExistingIdx = localTargetStudents.findIndex(s => s.studentId === studentId);
  if (targetExistingIdx >= 0) {
    localTargetStudents[targetExistingIdx] = targetEnrollmentData;
  } else {
    localTargetStudents.push(targetEnrollmentData);
  }
  setLocalItem(targetStudentKey, localTargetStudents);

  // Update student's enrolled classes list locally
  const enrolledKey = `${LOCAL_ENROLLED_PREFIX}${studentId}`;
  const localEnrolled = getLocalItem<ClassItem[]>(enrolledKey, []);
  const updatedEnrolled = localEnrolled.filter(c => c.id !== sourceClassId);
  if (!updatedEnrolled.some(c => c.id === targetClassId)) {
    updatedEnrolled.push(targetClass);
  }
  setLocalItem(enrolledKey, updatedEnrolled);

  // Update LOCAL_CLASSES_KEY studentCounts
  const allLocalClasses = getLocalItem<ClassItem[]>(LOCAL_CLASSES_KEY, []);
  const srcIdx = allLocalClasses.findIndex(c => c.id === sourceClassId);
  if (srcIdx >= 0) {
    allLocalClasses[srcIdx].studentCount = Math.max(0, (allLocalClasses[srcIdx].studentCount || 1) - 1);
  }
  const tgtIdx = allLocalClasses.findIndex(c => c.id === targetClassId);
  if (tgtIdx >= 0) {
    allLocalClasses[tgtIdx].studentCount = (allLocalClasses[tgtIdx].studentCount || 0) + 1;
  }
  setLocalItem(LOCAL_CLASSES_KEY, allLocalClasses);

  // 4. In-App Notification for Student
  const notificationId = `notif_move_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  const notifPayload = {
    id: notificationId,
    type: 'class_reassigned',
    recipientStudentId: studentId,
    studentName,
    sourceClassId,
    sourceClassName: sourceClass?.name || 'Previous Class',
    targetClassId,
    targetClassName: targetClass.name,
    targetClassCode: targetClass.classCode,
    instructorName: options?.instructorName || 'Your Instructor',
    instructorEmail: options?.instructorEmail || '',
    message: `You were moved from ${sourceClass?.name || 'your previous class'} to ${targetClass.name} (Code: ${targetClass.classCode}). All your syllabus progress and quiz scores have been preserved.`,
    createdAt: now,
    read: false
  };

  const existingNotifs = getLocalItem<any[]>(LOCAL_NOTIFICATIONS_KEY, []);
  existingNotifs.unshift(notifPayload);
  setLocalItem(LOCAL_NOTIFICATIONS_KEY, existingNotifs);

  // 5. Firestore Operations
  try {
    // Write student doc in target class
    const targetStudentRef = doc(db, 'classes', targetClassId, 'students', studentId);
    await setDoc(targetStudentRef, cleanFirestoreData(targetEnrollmentData), { merge: true });

    // Delete student doc in source class
    const sourceStudentRef = doc(db, 'classes', sourceClassId, 'students', studentId);
    await deleteDoc(sourceStudentRef);

    // Update studentCount on both classes
    await updateDoc(doc(db, 'classes', sourceClassId), { studentCount: increment(-1) }).catch(() => {});
    await updateDoc(doc(db, 'classes', targetClassId), { studentCount: increment(1) }).catch(() => {});

    // Update user profile enrolledClassIds
    try {
      const userRef = doc(db, 'users', studentId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const curEnrolled: string[] = userSnap.data().enrolledClassIds || [];
        const nextEnrolled = curEnrolled.filter(id => id !== sourceClassId);
        if (!nextEnrolled.includes(targetClassId)) {
          nextEnrolled.push(targetClassId);
        }
        await updateDoc(userRef, { enrolledClassIds: nextEnrolled });
      }
    } catch {}

    // Store notification in firestore
    setDoc(doc(db, 'notifications', notificationId), cleanFirestoreData(notifPayload)).catch(() => {});
  } catch (err) {
    console.warn('Firestore move student error (offline fallback preserved):', err);
  }

  // 6. Broadcast global events so open listeners update
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('igcse_classes_updated'));
    window.dispatchEvent(new CustomEvent('igcse_progress_updated'));
  }

  return {
    success: true,
    message: `Successfully moved ${studentName} to ${targetClass.name} (Code: ${targetClass.classCode}).`,
    sourceClass,
    targetClass,
    studentName
  };
}

/**
 * Move multiple students from one class to another simultaneously.
 */
export async function moveMultipleStudentsToClass(
  studentIds: string[],
  sourceClassId: string,
  targetClassId: string,
  options?: MoveStudentOptions
): Promise<{ successfulCount: number; failedCount: number; message: string }> {
  let successfulCount = 0;
  let failedCount = 0;

  for (const sid of studentIds) {
    const res = await moveStudentToClass(sid, sourceClassId, targetClassId, options);
    if (res.success) {
      successfulCount++;
    } else {
      failedCount++;
    }
  }

  return {
    successfulCount,
    failedCount,
    message: `Moved ${successfulCount} student${successfulCount === 1 ? '' : 's'} successfully${failedCount > 0 ? ` (${failedCount} failed)` : ''}.`
  };
}

// -------------------------------------------------------------
// INSTRUCTOR TASKS & STUDENT HOMEWORK ASSIGNMENTS
// -------------------------------------------------------------

export interface CreateClassTaskOptions {
  sendEmail?: boolean;
  explicitRecipients?: { studentId: string; studentName: string; studentEmail: string }[];
  additionalEmails?: string[];
  onNotificationDispatched?: (result: TaskNotificationResult) => void;
}

export interface TaskNotificationResult {
  count: number;
  method: 'smtp' | 'email_client_ready' | 'none';
  smtpConfigured: boolean;
  mailtoUrl?: string;
  gmailComposeUrl?: string;
  warning?: string;
  subject?: string;
  emailText?: string;
  recipients?: { studentName: string; studentEmail: string }[];
}

/**
 * Creates a new task/assignment for a class and/or individual students.
 */
export async function createClassTask(
  taskData: Omit<ClassTask, 'id' | 'createdAt'>,
  options?: CreateClassTaskOptions
): Promise<ClassTask & { notificationResult?: TaskNotificationResult }> {
  const id = `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const createdAt = new Date().toISOString();

  // Ensure ALL fields are defined to prevent Firestore rejection
  const newTask: ClassTask = {
    ...taskData,
    requiredQuizLength: Math.max(1, Math.min(40, Number(taskData.requiredQuizLength) || 10)),
    requireSlidesAndTrafficLight: taskData.requireSlidesAndTrafficLight !== false,
    targetStudentIds: Array.isArray(taskData.targetStudentIds) ? taskData.targetStudentIds : [],
    targetSubtopics: Array.isArray(taskData.targetSubtopics) ? taskData.targetSubtopics : [],
    description: taskData.description || '',
    className: taskData.className || 'Combined Science Class',
    id,
    createdAt
  };

  // 1. Update local storage immediately for zero-delay UX
  const localTasks = getLocalItem<ClassTask[]>(LOCAL_TASKS_KEY, []);
  localTasks.unshift(newTask);
  setLocalItem(LOCAL_TASKS_KEY, localTasks);

  // Determine target student list across class or specific students
  let studentList: { studentId: string; name: string; email: string }[] = [];
  if (options?.explicitRecipients && options.explicitRecipients.length > 0) {
    studentList = options.explicitRecipients.map(r => ({
      studentId: r.studentId,
      name: r.studentName,
      email: r.studentEmail
    }));
  } else if (taskData.classId && taskData.classId !== 'all') {
    const classStudents = await fetchStudentsInClass(taskData.classId);
    studentList = classStudents
      .filter(s => !taskData.targetStudentIds || taskData.targetStudentIds.length === 0 || taskData.targetStudentIds.includes(s.studentId))
      .map(s => ({ studentId: s.studentId, name: s.name, email: s.email }));

    // If no students enrolled in this specific custom class yet, also fetch registered students so emails are not missed
    if (studentList.length === 0) {
      const allReg = await fetchAllRegisteredStudents();
      studentList = allReg.map(s => ({ studentId: s.studentId, name: s.name, email: s.email }));
    }
  } else {
    // Collect students across all classes created by instructor + all registered students
    const classes = await fetchClassesByInstructor(taskData.instructorId, taskData.instructorEmail);
    const studentMap = new Map<string, { studentId: string; name: string; email: string }>();
    for (const c of classes) {
      const students = await fetchStudentsInClass(c.id);
      for (const s of students) {
        if (!taskData.targetStudentIds || taskData.targetStudentIds.length === 0 || taskData.targetStudentIds.includes(s.studentId)) {
          studentMap.set(s.studentId, { studentId: s.studentId, name: s.name, email: s.email });
        }
      }
    }
    const allReg = await fetchAllRegisteredStudents();
    for (const s of allReg) {
      if (!taskData.targetStudentIds || taskData.targetStudentIds.length === 0 || taskData.targetStudentIds.includes(s.studentId)) {
        if (!studentMap.has(s.studentId)) {
          studentMap.set(s.studentId, { studentId: s.studentId, name: s.name, email: s.email });
        }
      }
    }
    studentList = Array.from(studentMap.values());
  }

  // 2. Persist to Firestore and initialize submissions
  try {
    const taskRef = doc(db, 'tasks', id);
    const sanitizedDoc = cleanFirestoreData(newTask);
    await setDoc(taskRef, sanitizedDoc);

    // Also write an in-app notification document so students see it immediately
    const notifRef = doc(db, 'notifications', `notif_${id}`);
    await setDoc(notifRef, cleanFirestoreData({
      id: `notif_${id}`,
      taskId: id,
      title: `New Task: ${newTask.title}`,
      message: `Your instructor set a new task for ${newTask.className}. Due: ${newTask.dueDate}`,
      createdAt,
      type: 'task_assigned',
      targetStudentIds: newTask.targetStudentIds || []
    })).catch(() => {});

    for (const student of studentList) {
      if (!student.studentId || typeof student.studentId !== 'string') continue;
      const subRef = doc(db, 'tasks', id, 'submissions', student.studentId);
      const subData: TaskSubmission = {
        studentId: student.studentId,
        studentName: student.name || 'Student',
        studentEmail: student.email || '',
        status: 'not_started',
        lastActivityAt: createdAt
      };
      setDoc(subRef, cleanFirestoreData(subData)).catch(e => console.warn('Sub write warning:', e));

      // Save local sub
      const subKey = `${LOCAL_TASK_SUBMISSIONS_PREFIX}${id}`;
      const localSubs = getLocalItem<Record<string, TaskSubmission>>(subKey, {});
      localSubs[student.studentId] = subData;
      setLocalItem(subKey, localSubs);
    }
  } catch (err) {
    console.error('Firestore write error for task:', err);
  }

  // 3. Dispatch automated email notification to all targeted students + additional emails if requested
  let notifResult: TaskNotificationResult | undefined = undefined;
  if (options?.sendEmail !== false) {
    const emailRecipients = studentList
      .map(s => {
        const email = s.email && s.email.includes('@')
          ? s.email
          : `${s.name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'student'}@gisboyshigh.net`;
        return {
          studentId: s.studentId,
          studentName: s.name || 'Student',
          studentEmail: email
        };
      });

    try {
      notifResult = await notifyStudentsOfTaskAssignment(newTask, emailRecipients, options?.additionalEmails);
      if (options?.onNotificationDispatched && notifResult) {
        options.onNotificationDispatched(notifResult);
      }
    } catch (err) {
      console.warn('Failed to dispatch task assignment email notifications:', err);
    }
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('igcse_task_created', { detail: { task: newTask } }));
    window.dispatchEvent(new CustomEvent('igcse_task_submission_updated', { detail: { taskId: id } }));
  }

  return {
    ...newTask,
    notificationResult: notifResult
  };
}

/**
 * Dispatches an automated email notification to students when a task is set.
 */
export async function notifyStudentsOfTaskAssignment(
  task: ClassTask,
  explicitRecipients?: { studentId: string; studentName: string; studentEmail: string }[],
  additionalEmails?: string[]
): Promise<TaskNotificationResult> {
  const fallbackResult: TaskNotificationResult = {
    count: 0,
    method: 'none',
    smtpConfigured: false,
    recipients: []
  };

  try {
    let recipients = explicitRecipients ? [...explicitRecipients] : [];

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
      }
      
      // If still empty, check across all classes & registered users
      if (recipients.length === 0) {
        const allStudents = await fetchAllRegisteredStudents();
        recipients = allStudents
          .filter(s => !task.targetStudentIds || task.targetStudentIds.length === 0 || task.targetStudentIds.includes(s.studentId))
          .map(s => ({
            studentId: s.studentId,
            studentName: s.name,
            studentEmail: s.email && s.email.includes('@')
              ? s.email
              : `${s.name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'student'}@gisboyshigh.net`
          }));
      }
    }

    // Merge any additional custom notification emails (e.g. instructor, parents, test address)
    if (Array.isArray(additionalEmails) && additionalEmails.length > 0) {
      additionalEmails.forEach(extra => {
        const clean = (extra || '').trim().toLowerCase();
        if (clean && clean.includes('@') && !recipients.some(r => r.studentEmail.toLowerCase() === clean)) {
          recipients.push({
            studentId: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            studentName: clean.split('@')[0],
            studentEmail: clean
          });
        }
      });
    }

    if (recipients.length === 0) {
      console.log('[notifyStudentsOfTaskAssignment] No student recipients found for task:', task.id);
      return fallbackResult;
    }

    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://ais-dev-fezihukeplecjbhmw6fblt-840997730911.asia-southeast1.run.app';
    const portalUrl = `${currentOrigin}/?tab=assignments&taskId=${encodeURIComponent(task.id)}`;
    const bccList = recipients.map(r => r.studentEmail).join(',');
    const taskSubject = `[Cambridge 0653 Science] Assignment: ${task.title}`;
    const taskTypeLabel = task.type === 'slides_traffic_light'
      ? 'Lesson Slide Deck & Traffic Light Rating'
      : task.type === 'practice_quiz'
      ? 'Practice Quiz Challenge'
      : task.type === 'exam_paper'
      ? 'Exam Paper Revision'
      : 'Comprehensive Lesson & Quiz Revision';
    const subtopicsLabel = Array.isArray(task.targetSubtopics) && task.targetSubtopics.length > 0
      ? task.targetSubtopics.join(', ')
      : 'Science Revision';

    const reqLen = Math.max(1, Math.min(40, Number(task.requiredQuizLength) || 10));
    const taskBody = `Dear Students,

A new assignment has been assigned for Cambridge IGCSE Combined Science (0653):

• Task: ${task.title}
• Assignment Type: ${taskTypeLabel}
• Topic: ${subtopicsLabel}
• Exact Quiz Length: ${reqLen} Questions (choose exact length ${reqLen} when taking the quiz)
• Completion Requirements: Read through ALL assigned slides and complete the Traffic Light Quiz${task.type === 'both' || task.type === 'practice_quiz' ? ` + ${reqLen}-question Practice Quiz` : ''}
• Due Date: ${task.dueDate}

Instructions:
${task.description || 'Please log in to your revision hub and complete the assignment before the deadline.'}

Direct Portal Assignment Link:
${portalUrl}

Best regards,
Cambridge IGCSE Combined Science Faculty`;

    const clientMailtoUrl = `mailto:?bcc=${encodeURIComponent(bccList)}&subject=${encodeURIComponent(taskSubject)}&body=${encodeURIComponent(taskBody)}`;
    const clientGmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=&bcc=${encodeURIComponent(bccList)}&su=${encodeURIComponent(taskSubject)}&body=${encodeURIComponent(taskBody)}`;

    // Try server-side endpoint if available
    try {
      const res = await fetch('/api/notify-task-assigned', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients,
          task,
          portalUrl: currentOrigin
        })
      });

      if (res.ok) {
        const data = await res.json();
        return {
          count: data.count || recipients.length,
          method: data.method || (data.smtpConfigured ? 'smtp' : 'email_client_ready'),
          smtpConfigured: Boolean(data.smtpConfigured),
          mailtoUrl: data.mailtoUrl || clientMailtoUrl,
          gmailComposeUrl: data.gmailComposeUrl || clientGmailUrl,
          warning: data.warning,
          subject: data.subject || taskSubject,
          emailText: data.emailText || taskBody,
          recipients: recipients.map(r => ({ studentName: r.studentName, studentEmail: r.studentEmail }))
        };
      }
    } catch {
      // Backend not running (static hosting); proceed seamlessly to client 1-click fallback
    }

    return {
      count: recipients.length,
      method: 'email_client_ready',
      smtpConfigured: false,
      mailtoUrl: clientMailtoUrl,
      gmailComposeUrl: clientGmailUrl,
      subject: taskSubject,
      emailText: taskBody,
      recipients: recipients.map(r => ({ studentName: r.studentName, studentEmail: r.studentEmail }))
    };
  } catch (err) {
    console.warn('[notifyStudentsOfTaskAssignment] Email dispatch fallback triggered:', err);
    return fallbackResult;
  }
}

/**
 * Fetch all tasks created by instructor or for specific class.
 */
export async function fetchClassTasks(
  classId?: string, 
  instructorId?: string,
  allowedClassIds?: string[]
): Promise<ClassTask[]> {
  const localTasks = getLocalItem<ClassTask[]>(LOCAL_TASKS_KEY, []);

  try {
    const q = collection(db, 'tasks');
    const snap = await getDocs(q);
    const firestoreTasks: ClassTask[] = [];

    snap.forEach(d => {
      const data = d.data() as ClassTask;
      if (data && data.id) {
        firestoreTasks.push(data);
      }
    });

    if (firestoreTasks.length > 0) {
      // Merge with local tasks
      const mergedMap = new Map<string, ClassTask>();
      localTasks.forEach(t => mergedMap.set(t.id, t));
      firestoreTasks.forEach(t => mergedMap.set(t.id, t));
      const combined = Array.from(mergedMap.values());
      setLocalItem(LOCAL_TASKS_KEY, combined);

      let filtered = combined;
      if (classId && classId !== 'all') {
        filtered = filtered.filter(t => t.classId === classId || t.classId === 'all');
      } else if (allowedClassIds && allowedClassIds.length > 0) {
        filtered = filtered.filter(t => 
          allowedClassIds.includes(t.classId) || 
          t.classId === 'all' || 
          (instructorId && t.instructorId === instructorId)
        );
      } else if (instructorId) {
        const isPrimary = instructorId === 'corbanb_instructor' || instructorId === 'corbanb@gisboyshigh.net';
        filtered = filtered.filter(t => 
          t.instructorId === instructorId || 
          (isPrimary && (t.instructorId === 'corbanb_instructor' || (t as any).instructorEmail === 'corbanb@gisboyshigh.net'))
        );
      }
      return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  } catch (err) {
    console.warn('Failed to query Firestore tasks, using local cache:', err);
  }

  let filtered = localTasks;
  if (classId && classId !== 'all') {
    filtered = filtered.filter(t => t.classId === classId || t.classId === 'all');
  } else if (allowedClassIds && allowedClassIds.length > 0) {
    filtered = filtered.filter(t => 
      allowedClassIds.includes(t.classId) || 
      t.classId === 'all' || 
      (instructorId && t.instructorId === instructorId)
    );
  } else if (instructorId) {
    const isPrimary = instructorId === 'corbanb_instructor' || instructorId === 'corbanb@gisboyshigh.net';
    filtered = filtered.filter(t => 
      t.instructorId === instructorId || 
      (isPrimary && (t.instructorId === 'corbanb_instructor' || (t as any).instructorEmail === 'corbanb@gisboyshigh.net'))
    );
  }
  return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

function hasSubmissionChanged(prev: TaskSubmission | undefined, next: TaskSubmission): boolean {
  if (!prev) return true;
  return (
    prev.status !== next.status ||
    prev.quizScore !== next.quizScore ||
    prev.practiceQuizScore !== next.practiceQuizScore ||
    prev.practiceQuizLength !== next.practiceQuizLength ||
    prev.trafficLightQuizScore !== next.trafficLightQuizScore ||
    prev.trafficLightQuizCompleted !== next.trafficLightQuizCompleted ||
    prev.slidesCompleted !== next.slidesCompleted ||
    prev.quizCompleted !== next.quizCompleted ||
    prev.trafficLight !== next.trafficLight
  );
}

/**
 * Fetch tasks applicable to a student (based on their enrolled classes and/or UID).
 */
export async function fetchTasksForStudent(
  student: UserProfile,
  enrolledClassIds: string[],
  studentProgress?: StudentProgress,
  options?: { skipAutoPersist?: boolean }
): Promise<TaskWithSubmission[]> {
  const allTasks = await fetchClassTasks();
  const studentTasks: TaskWithSubmission[] = [];
  const now = Date.now();
  let persistedAnyChange = false;

  const studentCleanEmail = (student.email || '').toLowerCase().trim();
  const activeClassIds = new Set((enrolledClassIds || []).filter(id => id && id !== 'class_default_0653'));

  if (activeClassIds.size === 0 && student.id) {
    try {
      const userDoc = await getDoc(doc(db, 'users', student.id));
      if (userDoc.exists()) {
        const userClasses: string[] = userDoc.data()?.enrolledClassIds || [];
        userClasses.filter(cid => cid && cid !== 'class_default_0653').forEach(cid => activeClassIds.add(cid));
      }
    } catch {}
  }

  for (const task of allTasks) {
    // 1. Is student explicitly in targetStudentIds by UID or email?
    const hasTargetIds = Array.isArray(task.targetStudentIds) && task.targetStudentIds.length > 0;
    const isTargetedDirectly = hasTargetIds && (
      task.targetStudentIds!.includes(student.id) ||
      (studentCleanEmail && task.targetStudentIds!.some(id => id.toLowerCase() === studentCleanEmail))
    );

    // 2. Class match:
    // - task applies to 'all' classes
    // - OR student is enrolled in the task's class
    const isClassMatch = 
      task.classId === 'all' || 
      activeClassIds.has(task.classId);

    // If teacher selected specific students, only targeted students see it.
    // If teacher set task for class (or all classes), all students enrolled in that class see it.
    const appliesToStudent = hasTargetIds 
      ? isTargetedDirectly 
      : (isClassMatch || task.classId === 'all');

    if (appliesToStudent) {
      // Fetch or derive student's submission status
      const subKey = `${LOCAL_TASK_SUBMISSIONS_PREFIX}${task.id}`;
      const localSubs = getLocalItem<Record<string, TaskSubmission>>(subKey, {});
      let submission: TaskSubmission | undefined = localSubs[student.id];

      // Check Firestore submission and merge monotonically with local cache
      try {
        const subDoc = await getDoc(doc(db, 'tasks', task.id, 'submissions', student.id));
        if (subDoc.exists()) {
          const remoteSub = subDoc.data() as TaskSubmission;
          submission = submission ? reconcileTaskSubmission(remoteSub, submission) : remoteSub;
          localSubs[student.id] = submission;
          setLocalItem(subKey, localSubs);
        }
      } catch {
        // use local
      }

      // Automatically evaluate if student's progress satisfies strict completion criteria (never downgrades 'completed')
      if (studentProgress && !options?.skipAutoPersist) {
        const prevPersisted = submission;
        const evaluated = evaluateTaskProgressForStudent(task, student, studentProgress, prevPersisted);
        const changed = hasSubmissionChanged(prevPersisted, evaluated);

        submission = evaluated;
        localSubs[student.id] = submission;
        setLocalItem(subKey, localSubs);

        if (changed && evaluated.status !== 'not_started') {
          persistedAnyChange = true;
          try {
            const subRef = doc(db, 'tasks', task.id, 'submissions', student.id);
            await setDoc(subRef, cleanFirestoreData(submission), { merge: true });
          } catch {}
        }
      }

      if (!submission) {
        submission = {
          studentId: student.id,
          studentName: student.name,
          studentEmail: student.email,
          status: 'not_started',
          completedAt: undefined
        };
        localSubs[student.id] = submission;
        setLocalItem(subKey, localSubs);
      }

      const dueTimestamp = new Date(task.dueDate).getTime();
      const isOverdue = dueTimestamp < now && submission.status !== 'completed';

      studentTasks.push({
        ...task,
        submission,
        isOverdue
      });
    }
  }

  if (persistedAnyChange && typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('igcse_task_submission_updated', {
      detail: { studentId: student.id }
    }));
  }

  // Sort: Overdue & Incomplete first, then Not Started, then Completed
  return studentTasks.sort((a, b) => {
    if (a.isOverdue && !b.isOverdue) return -1;
    if (!a.isOverdue && b.isOverdue) return 1;

    const statusOrder: Record<TaskProgressStatus, number> = {
      incomplete: 0,
      not_started: 1,
      completed: 2
    };

    const statusA = a.submission?.status || 'not_started';
    const statusB = b.submission?.status || 'not_started';

    if (statusOrder[statusA] !== statusOrder[statusB]) {
      return statusOrder[statusA] - statusOrder[statusB];
    }

    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });
}

/**
 * Updates a student's submission status for a task (e.g. marked complete, quiz completed, or traffic light set).
 */
export async function updateTaskSubmission(
  taskId: string,
  studentId: string,
  update: Partial<TaskSubmission>
): Promise<TaskSubmission> {
  const subKey = `${LOCAL_TASK_SUBMISSIONS_PREFIX}${taskId}`;
  const localSubs = getLocalItem<Record<string, TaskSubmission>>(subKey, {});
  const existing: TaskSubmission = localSubs[studentId] || {
    studentId,
    studentName: 'Student',
    studentEmail: '',
    status: 'not_started'
  };

  const updated: TaskSubmission = {
    ...existing,
    ...update,
    lastActivityAt: new Date().toISOString(),
    completedAt: update.status === 'completed'
      ? (update.completedAt || existing.completedAt || new Date().toISOString())
      : (update.status ? undefined : existing.completedAt)
  };

  const sanitizedUpdated = cleanFirestoreData(updated) as TaskSubmission;
  localSubs[studentId] = sanitizedUpdated;
  setLocalItem(subKey, localSubs);

  try {
    const subRef = doc(db, 'tasks', taskId, 'submissions', studentId);
    await setDoc(subRef, sanitizedUpdated);
  } catch (err) {
    console.warn('Offline: Saved task submission locally.', err);
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('igcse_task_submission_updated', {
      detail: { taskId, studentId, status: sanitizedUpdated.status }
    }));
  }

  return sanitizedUpdated;
}

function classStudentToProgressSnapshot(stu: ClassStudentItem): StudentProgress {
  return {
    completedLessons: stu.completedLessons || [],
    slidesReadBySubtopic: stu.slidesReadBySubtopic || {},
    quizScores: stu.quizScores || {},
    practiceQuizByLength: stu.practiceQuizByLength || {},
    subtopicQuizScores: stu.subtopicQuizScores || {},
    topicConfidence: stu.topicConfidence || {},
    trafficLights: stu.trafficLights || {},
    savedNotes: {},
    currentStreak: stu.streakDays || 0,
    lastActive: stu.lastActive || new Date().toISOString()
  };
}

/**
 * Retrieves and reconciles all student submissions for an instructor reviewing a task.
 * Ensures enrolled students' live slide & quiz progress is reflected accurately even if
 * a submission document was missing or stale.
 */
export async function fetchTaskSubmissions(
  taskId: string,
  classId?: string,
  taskOverride?: ClassTask
): Promise<TaskSubmission[]> {
  const subKey = `${LOCAL_TASK_SUBMISSIONS_PREFIX}${taskId}`;
  const localSubsMap = getLocalItem<Record<string, TaskSubmission>>(subKey, {});

  // 1. Resolve task definition (needed for live progress reconciliation)
  let resolvedTask = taskOverride;
  if (!resolvedTask) {
    const localTasks = getLocalItem<ClassTask[]>(LOCAL_TASKS_KEY, []);
    resolvedTask = localTasks.find(t => t.id === taskId);
    if (!resolvedTask) {
      try {
        const taskSnap = await getDoc(doc(db, 'tasks', taskId));
        if (taskSnap.exists()) {
          resolvedTask = taskSnap.data() as ClassTask;
        }
      } catch {
        // ignore offline
      }
    }
  }

  // 2. Fetch from Firestore and merge monotonically with local map
  try {
    const snap = await getDocs(collection(db, 'tasks', taskId, 'submissions'));
    snap.forEach(d => {
      const data = d.data() as TaskSubmission;
      if (data && data.studentId) {
        const existing = localSubsMap[data.studentId];
        localSubsMap[data.studentId] = existing ? reconcileTaskSubmission(data, existing) : data;
      }
    });
  } catch {
    // Offline
  }

  // 3. Reconcile against live enrolled students' ClassStudentItem progress
  const effectiveClassId = classId || resolvedTask?.classId;
  let classStudents: ClassStudentItem[] = [];
  if (effectiveClassId && effectiveClassId !== 'all') {
    classStudents = await fetchStudentsInClass(effectiveClassId);
  } else if (effectiveClassId === 'all') {
    classStudents = await fetchAllRegisteredStudents();
  }

  for (const student of classStudents) {
    if (
      resolvedTask &&
      Array.isArray(resolvedTask.targetStudentIds) &&
      resolvedTask.targetStudentIds.length > 0
    ) {
      const cleanEmail = (student.email || '').trim().toLowerCase();
      const targeted =
        resolvedTask.targetStudentIds.includes(student.studentId) ||
        (Boolean(cleanEmail) && resolvedTask.targetStudentIds.some(id => id.trim().toLowerCase() === cleanEmail));
      if (!targeted) continue;
    }

    const existingSub = localSubsMap[student.studentId];
    if (resolvedTask) {
      const progressSnap = classStudentToProgressSnapshot(student);
      const profileStub: UserProfile = {
        id: student.studentId,
        name: student.name,
        email: student.email,
        role: 'student',
        tier: student.tier
      };
      const evaluated = evaluateTaskProgressForStudent(resolvedTask, profileStub, progressSnap, existingSub);
      localSubsMap[student.studentId] = evaluated;

      // Persist upgraded/completed submission silently if Firestore was stale
      if (
        (!existingSub || (existingSub.status !== 'completed' && evaluated.status === 'completed')) &&
        evaluated.status !== 'not_started'
      ) {
        try {
          setDoc(
            doc(db, 'tasks', taskId, 'submissions', student.studentId),
            cleanFirestoreData(evaluated),
            { merge: true }
          ).catch(() => {});
        } catch {}
      }
    } else if (!existingSub) {
      localSubsMap[student.studentId] = {
        studentId: student.studentId,
        studentName: student.name,
        studentEmail: student.email,
        status: 'not_started'
      };
    }
  }

  setLocalItem(subKey, localSubsMap);
  return Object.values(localSubsMap);
}

/**
 * Delete a task
 */
export async function deleteClassTask(taskId: string): Promise<boolean> {
  // Local storage
  const localTasks = getLocalItem<ClassTask[]>(LOCAL_TASKS_KEY, []);
  setLocalItem(LOCAL_TASKS_KEY, localTasks.filter(t => t.id !== taskId));
  try {
    localStorage.removeItem(`${LOCAL_TASK_SUBMISSIONS_PREFIX}${taskId}`);
  } catch {}

  // Firestore
  try {
    const subsSnap = await getDocs(collection(db, 'tasks', taskId, 'submissions'));
    for (const sub of subsSnap.docs) {
      await deleteDoc(sub.ref);
    }
    await deleteDoc(doc(db, 'tasks', taskId));
  } catch {
    // Offline
  }

  return true;
}

/**
 * Update task due date
 */
export async function updateClassTaskDueDate(taskId: string, newDueDate: string): Promise<boolean> {
  const localTasks = getLocalItem<ClassTask[]>(LOCAL_TASKS_KEY, []);
  const idx = localTasks.findIndex(t => t.id === taskId);
  if (idx >= 0) {
    localTasks[idx].dueDate = newDueDate;
    setLocalItem(LOCAL_TASKS_KEY, localTasks);
  }

  try {
    await updateDoc(doc(db, 'tasks', taskId), { dueDate: newDueDate });
  } catch {
    // Offline
  }

  return true;
}

function isTargetSubtopicMatched(targets: string[], subtopicCode: string): boolean {
  if (!targets || targets.length === 0) return true;
  const cleanCode = subtopicCode.trim().toUpperCase();
  return targets.some(target => {
    const cleanTarget = target.trim().toUpperCase();
    return cleanTarget === cleanCode ||
           cleanCode.startsWith(cleanTarget + '.') ||
           cleanTarget.startsWith(cleanCode + '.') ||
           cleanCode === cleanTarget.split('.')[0];
  });
}

export function getSubtopicResultPercentage(res?: SubtopicQuizResult | null): number | undefined {
  if (!res) return undefined;
  if (typeof res.percentage === 'number' && !Number.isNaN(res.percentage)) {
    return Math.round(res.percentage);
  }
  const total = res.total && res.total > 0 ? res.total : 10;
  return Math.round(((res.score || 0) / total) * 100);
}

function findEntryCaseInsensitive<T>(map: Record<string, T> | undefined, key: string): T | undefined {
  if (!map || !key) return undefined;
  if (map[key] !== undefined) return map[key];
  const upper = key.trim().toUpperCase();
  for (const [k, v] of Object.entries(map)) {
    if (k.trim().toUpperCase() === upper) return v;
  }
  return undefined;
}

export function reconcileTaskSubmission(
  evaluated: TaskSubmission,
  existingSub?: TaskSubmission
): TaskSubmission {
  if (!existingSub) return evaluated;

  const slidesCompleted = Boolean(evaluated.slidesCompleted || existingSub.slidesCompleted);
  const trafficLightQuizCompleted = Boolean(evaluated.trafficLightQuizCompleted || existingSub.trafficLightQuizCompleted);
  const practiceQuizScore = evaluated.practiceQuizScore !== undefined ? evaluated.practiceQuizScore : existingSub.practiceQuizScore;
  const practiceQuizLength = evaluated.practiceQuizLength !== undefined ? evaluated.practiceQuizLength : existingSub.practiceQuizLength;
  const trafficLightQuizScore = evaluated.trafficLightQuizScore !== undefined ? evaluated.trafficLightQuizScore : existingSub.trafficLightQuizScore;
  const trafficLight = evaluated.trafficLight || existingSub.trafficLight;
  const quizCompleted = Boolean(evaluated.quizCompleted || existingSub.quizCompleted);
  const quizScore = evaluated.quizScore !== undefined ? evaluated.quizScore : existingSub.quizScore;
  const slidesReadCount = Math.max(evaluated.slidesReadCount || 0, existingSub.slidesReadCount || 0);
  const slidesTotalCount = evaluated.slidesTotalCount || existingSub.slidesTotalCount || 0;

  let status: TaskProgressStatus = evaluated.status;
  if (existingSub.status === 'completed') {
    status = 'completed';
  } else if (
    status === 'not_started' &&
    (existingSub.status === 'incomplete' ||
      slidesCompleted ||
      trafficLightQuizCompleted ||
      practiceQuizScore !== undefined ||
      slidesReadCount > 0 ||
      Boolean(trafficLight))
  ) {
    status = 'incomplete';
  }

  const completedAt =
    status === 'completed'
      ? (evaluated.completedAt || existingSub.completedAt || new Date().toISOString())
      : undefined;

  return {
    ...existingSub,
    ...evaluated,
    studentId: evaluated.studentId || existingSub.studentId,
    studentName: evaluated.studentName || existingSub.studentName || 'Student',
    studentEmail: evaluated.studentEmail || existingSub.studentEmail || '',
    status,
    trafficLight,
    quizScore,
    practiceQuizScore,
    practiceQuizLength,
    trafficLightQuizScore,
    trafficLightQuizCompleted,
    slidesCompleted,
    quizCompleted,
    slidesReadCount,
    slidesTotalCount,
    completedAt
  };
}

export function evaluateTaskProgressForStudent(
  task: ClassTask,
  student: UserProfile,
  studentProgress: StudentProgress,
  existingSub?: TaskSubmission
): TaskSubmission {
  const targets = (task.targetSubtopics || []).map(s => s.trim().toUpperCase()).filter(Boolean);
  const reqLen = Math.max(1, Math.min(40, Number(task.requiredQuizLength) || 10));
  const needsSlidesAndTL = task.requireSlidesAndTrafficLight !== false || task.type === 'both' || task.type === 'slides_traffic_light';
  const needsPracticeQuiz = task.type === 'both' || task.type === 'practice_quiz' || task.type === 'exam_paper';

  const completedLessonsUpper = new Set(
    (studentProgress.completedLessons || []).map(c => String(c).trim().toUpperCase())
  );

  // 1. Evaluate Slide Reading Progress across ALL target subtopics
  let slidesReadCount = 0;
  let slidesTotalCount = 0;
  let slidesDone = false;

  if (targets.length > 0) {
    slidesDone = targets.every(sub => {
      const slideEntry = findEntryCaseInsensitive(studentProgress.slidesReadBySubtopic, sub);
      if (slideEntry) {
        slidesReadCount += Array.isArray(slideEntry.visitedKeys) ? slideEntry.visitedKeys.length : 0;
        slidesTotalCount += slideEntry.totalSlides || 0;
        if (slideEntry.allSlidesRead === true) return true;
      }
      if (completedLessonsUpper.has(sub)) {
        if (slidesTotalCount === 0) {
          slidesReadCount += 1;
          slidesTotalCount += 1;
        }
        return true;
      }
      return false;
    });
  } else {
    const entries = Object.values(studentProgress.slidesReadBySubtopic || {});
    entries.forEach(e => {
      slidesReadCount += Array.isArray(e.visitedKeys) ? e.visitedKeys.length : 0;
      slidesTotalCount += e.totalSlides || 0;
    });
    slidesDone = entries.some(e => e.allSlidesRead === true) || completedLessonsUpper.size > 0;
  }

  if (!slidesDone && existingSub?.slidesCompleted) {
    slidesDone = true;
  }

  // 2. Evaluate Traffic Light Quiz across ALL target subtopics
  let trafficLightQuizDone = false;
  let trafficLightQuizScorePct: number | undefined = undefined;
  let trafficLightVal: TrafficLightStatus | undefined = undefined;

  if (targets.length > 0) {
    const pctList: number[] = [];
    trafficLightQuizDone = targets.every(sub => {
      const res = findEntryCaseInsensitive(studentProgress.subtopicQuizScores, sub);
      const pct = getSubtopicResultPercentage(res);
      if (pct !== undefined) {
        pctList.push(pct);
        return true;
      }
      return false;
    });
    if (pctList.length > 0) {
      trafficLightQuizScorePct = Math.round(pctList.reduce((a, b) => a + b, 0) / pctList.length);
      trafficLightVal = calculateTrafficLightFromPercentage(trafficLightQuizScorePct);
    } else if (existingSub?.trafficLightQuizCompleted) {
      trafficLightQuizDone = true;
      trafficLightQuizScorePct = existingSub.trafficLightQuizScore;
      trafficLightVal = existingSub.trafficLight;
    } else {
      const manualLight = findEntryCaseInsensitive(studentProgress.trafficLights, targets[0]);
      if (manualLight) trafficLightVal = manualLight;
    }
  } else {
    const allSubScores = Object.values(studentProgress.subtopicQuizScores || {});
    if (allSubScores.length > 0) {
      trafficLightQuizDone = true;
      const pcts = allSubScores.map(r => getSubtopicResultPercentage(r) || 0);
      trafficLightQuizScorePct = Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length);
      trafficLightVal = calculateTrafficLightFromPercentage(trafficLightQuizScorePct);
    } else if (existingSub?.trafficLightQuizCompleted) {
      trafficLightQuizDone = true;
      trafficLightQuizScorePct = existingSub.trafficLightQuizScore;
      trafficLightVal = existingSub.trafficLight;
    }
  }

  // 3. Evaluate Practice Quiz matching the EXACT quiz length set in the task
  let practiceQuizDone = false;
  let practiceQuizScorePct: number | undefined = undefined;
  let practiceQuizLen: number | undefined = undefined;

  const lengthRecords = Object.values(studentProgress.practiceQuizByLength || {})
    .filter((rec): rec is QuizLengthRecord => {
      if (!rec) return false;
      const exactDelivered = rec.quizLength === reqLen && rec.total === reqLen;
      const exactRequested =
        rec.requestedLength === reqLen &&
        rec.total > 0 &&
        rec.total >= Math.min(reqLen, rec.quizLength);
      return exactDelivered || exactRequested;
    })
    .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());

  const targetTopicPrefixes = Array.from(new Set(targets.map(t => t.split('.')[0].toUpperCase())));

  const matchingExactAttempt = lengthRecords.find(rec => {
    if (rec.taskId && rec.taskId === task.id) return true;
    if (targets.length === 0) return true;
    const recSubtopics = (rec.subtopics || []).map(s => s.trim().toUpperCase());
    if (recSubtopics.length > 0) {
      return targets.some(t =>
        recSubtopics.some(rs => rs === t || rs.startsWith(t + '.') || t.startsWith(rs + '.'))
      );
    }
    const recTopics = (rec.topics || []).map(t => t.trim().toUpperCase());
    if (recTopics.length > 0) {
      return targetTopicPrefixes.some(tp => recTopics.includes(tp));
    }
    return false;
  });

  if (matchingExactAttempt) {
    practiceQuizDone = true;
    practiceQuizScorePct = Math.round(matchingExactAttempt.percentage);
    practiceQuizLen = matchingExactAttempt.requestedLength === reqLen ? reqLen : matchingExactAttempt.quizLength;
  } else if (existingSub?.practiceQuizLength === reqLen && typeof existingSub.practiceQuizScore === 'number') {
    practiceQuizDone = true;
    practiceQuizScorePct = existingSub.practiceQuizScore;
    practiceQuizLen = reqLen;
  } else if (existingSub?.quizCompleted && existingSub?.status === 'completed') {
    practiceQuizDone = true;
    practiceQuizScorePct = existingSub.practiceQuizScore ?? existingSub.quizScore;
    practiceQuizLen = existingSub.practiceQuizLength || reqLen;
  }

  // 4. Overall completion rule (never downgrade existing 'completed')
  const slidesAndTLMet = !needsSlidesAndTL || (slidesDone && trafficLightQuizDone);
  const practiceMet = !needsPracticeQuiz || practiceQuizDone;
  const hasAnyCriterion = needsSlidesAndTL || needsPracticeQuiz;
  const shouldComplete =
    existingSub?.status === 'completed' ||
    (hasAnyCriterion && slidesAndTLMet && practiceMet);

  const anyProgress =
    slidesReadCount > 0 ||
    slidesDone ||
    trafficLightQuizDone ||
    practiceQuizDone ||
    Boolean(trafficLightVal) ||
    existingSub?.status === 'incomplete';

  const status: TaskProgressStatus = shouldComplete
    ? 'completed'
    : anyProgress
      ? 'incomplete'
      : 'not_started';

  const recordedPercentage =
    practiceQuizScorePct !== undefined
      ? practiceQuizScorePct
      : trafficLightQuizScorePct;

  const evaluated: TaskSubmission = {
    studentId: student.id,
    studentName: student.name || existingSub?.studentName || 'Student',
    studentEmail: student.email || existingSub?.studentEmail || '',
    status,
    trafficLight: trafficLightVal,
    quizScore: recordedPercentage,
    practiceQuizScore: practiceQuizScorePct,
    practiceQuizLength: practiceQuizLen,
    requiredQuizLength: reqLen,
    trafficLightQuizScore: trafficLightQuizScorePct,
    trafficLightQuizCompleted: trafficLightQuizDone,
    slidesCompleted: slidesDone,
    quizCompleted: needsPracticeQuiz ? practiceQuizDone : trafficLightQuizDone,
    slidesReadCount,
    slidesTotalCount,
    notes: existingSub?.notes,
    lastActivityAt: existingSub?.lastActivityAt || new Date().toISOString(),
    completedAt: shouldComplete ? (existingSub?.completedAt || new Date().toISOString()) : undefined
  };

  return reconcileTaskSubmission(evaluated, existingSub);
}

/**
 * Checks if a student's newly updated progress completes or advances any assigned tasks.
 */
export async function autoCheckTaskCompletion(
  student: UserProfile,
  enrolledClassIds: string[],
  actionType: 'traffic_light' | 'quiz' | 'slides',
  subtopicCode: string,
  extra?: { trafficLight?: TrafficLightStatus; quizScore?: number; quizLength?: number; progress?: StudentProgress }
): Promise<void> {
  try {
    let progressSnapshot = extra?.progress;
    if (!progressSnapshot && typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('igcse_0653_student_progress');
        if (raw) progressSnapshot = JSON.parse(raw);
      } catch {}
    }

    if (progressSnapshot) {
      await autoEvaluateAllTasksForStudent(student, enrolledClassIds, progressSnapshot);
      return;
    }

    const studentTasks = await fetchTasksForStudent(student, enrolledClassIds);
    for (const task of studentTasks) {
      if (task.submission?.status === 'completed') continue;
      const matches = isTargetSubtopicMatched(task.targetSubtopics, subtopicCode);
      if (!matches) continue;

      const currentSub = task.submission;
      const reqLen = Math.max(1, Math.min(40, Number(task.requiredQuizLength) || 10));
      const pctScore = extra?.quizScore !== undefined
        ? (extra.quizScore <= 10 && (!extra.quizLength || extra.quizLength === 10)
            ? extra.quizScore * 10
            : extra.quizScore)
        : currentSub?.quizScore;

      if (actionType === 'quiz') {
        const lenMatches = !extra?.quizLength || extra.quizLength === reqLen;
        await updateTaskSubmission(task.id, student.id, {
          quizScore: lenMatches ? pctScore : currentSub?.quizScore,
          practiceQuizScore: lenMatches ? pctScore : currentSub?.practiceQuizScore,
          practiceQuizLength: lenMatches ? (extra?.quizLength || reqLen) : currentSub?.practiceQuizLength,
          requiredQuizLength: reqLen,
          quizCompleted: lenMatches ? true : currentSub?.quizCompleted,
          trafficLight: extra?.trafficLight || currentSub?.trafficLight,
          studentName: student.name,
          studentEmail: student.email
        });
      }
    }
  } catch (err) {
    console.warn('Auto task check error:', err);
  }
}

/**
 * Automatically evaluates all assigned tasks for a student against their current StudentProgress.
 * Strictly verifies that all assigned slides have been read, Traffic Light Quiz is completed,
 * and (if applicable) the Practice Quiz of exact requiredQuizLength has been completed.
 */
export async function autoEvaluateAllTasksForStudent(
  student: UserProfile,
  enrolledClassIds: string[],
  studentProgress: StudentProgress
): Promise<void> {
  if (!student || student.role !== 'student' || !studentProgress) return;
  try {
    // Fetch raw persisted submissions first so we detect exact delta & reliably await Firestore writes
    const studentTasks = await fetchTasksForStudent(student, enrolledClassIds, studentProgress, { skipAutoPersist: true });
    for (const task of studentTasks) {
      const curr = task.submission;
      const evaluated = evaluateTaskProgressForStudent(task, student, studentProgress, curr);
      const changed = hasSubmissionChanged(curr, evaluated);

      if (changed && evaluated.status !== 'not_started') {
        await updateTaskSubmission(task.id, student.id, evaluated);
      }
    }
  } catch (err) {
    console.warn('Error in autoEvaluateAllTasksForStudent:', err);
  }
}

/**
 * Subscribes to real-time updates for class tasks.
 * Updates immediately when tasks are added, modified, or deleted.
 */
export function subscribeToClassTasks(
  classId: string | undefined,
  instructorId: string | undefined,
  callback: (tasks: ClassTask[]) => void,
  allowedClassIds?: string[]
): () => void {
  // Initial fire from local cache
  fetchClassTasks(classId, instructorId, allowedClassIds).then(callback).catch(() => {});

  let unsubFirestore: (() => void) | null = null;
  try {
    const tasksCol = collection(db, 'tasks');
    unsubFirestore = onSnapshot(tasksCol, (snap) => {
      const firestoreTasks: ClassTask[] = [];
      snap.forEach(d => {
        const data = d.data() as ClassTask;
        if (data && data.id) firestoreTasks.push(data);
      });

      const localTasks = getLocalItem<ClassTask[]>(LOCAL_TASKS_KEY, []);
      const mergedMap = new Map<string, ClassTask>();
      localTasks.forEach(t => mergedMap.set(t.id, t));
      firestoreTasks.forEach(t => mergedMap.set(t.id, t));
      const combined = Array.from(mergedMap.values());
      setLocalItem(LOCAL_TASKS_KEY, combined);

      let filtered = combined;
      if (classId && classId !== 'all') {
        filtered = filtered.filter(t => t.classId === classId || t.classId === 'all');
      } else if (allowedClassIds && allowedClassIds.length > 0) {
        filtered = filtered.filter(t => 
          allowedClassIds.includes(t.classId) || 
          t.classId === 'all' || 
          (instructorId && t.instructorId === instructorId)
        );
      } else if (instructorId) {
        filtered = filtered.filter(t => t.instructorId === instructorId);
      }
      callback(filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    }, (err) => {
      console.warn('Tasks onSnapshot error, falling back to local:', err);
      fetchClassTasks(classId, instructorId, allowedClassIds).then(callback).catch(() => {});
    });
  } catch {
    // Offline
  }

  // Also listen for local custom events (cross-tab / in-window updates)
  const handleLocalUpdate = () => {
    fetchClassTasks(classId, instructorId, allowedClassIds).then(callback).catch(() => {});
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('igcse_task_submission_updated', handleLocalUpdate);
    window.addEventListener('storage', handleLocalUpdate);
  }

  return () => {
    if (unsubFirestore) unsubFirestore();
    if (typeof window !== 'undefined') {
      window.removeEventListener('igcse_task_submission_updated', handleLocalUpdate);
      window.removeEventListener('storage', handleLocalUpdate);
    }
  };
}

/**
 * Subscribes to real-time task submissions for an instructor reviewing a specific task.
 * Automatically updates live as students complete the task content!
 */
export function subscribeToTaskSubmissions(
  taskId: string,
  classId: string | undefined,
  callback: (submissions: TaskSubmission[]) => void,
  taskOverride?: ClassTask
): () => void {
  // Initial fire
  fetchTaskSubmissions(taskId, classId, taskOverride).then(callback).catch(() => {});

  let unsubFirestore: (() => void) | null = null;
  try {
    const subCol = collection(db, 'tasks', taskId, 'submissions');
    unsubFirestore = onSnapshot(subCol, () => {
      fetchTaskSubmissions(taskId, classId, taskOverride).then(callback).catch(() => {});
    }, (err) => {
      console.warn('Submissions onSnapshot error, falling back to local:', err);
      fetchTaskSubmissions(taskId, classId, taskOverride).then(callback).catch(() => {});
    });
  } catch {
    // Offline
  }

  const handleLocalUpdate = () => {
    fetchTaskSubmissions(taskId, classId, taskOverride).then(callback).catch(() => {});
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('igcse_task_submission_updated', handleLocalUpdate);
    window.addEventListener('igcse_student_progress_synced', handleLocalUpdate);
  }

  return () => {
    if (unsubFirestore) unsubFirestore();
    if (typeof window !== 'undefined') {
      window.removeEventListener('igcse_task_submission_updated', handleLocalUpdate);
      window.removeEventListener('igcse_student_progress_synced', handleLocalUpdate);
    }
  };
}

/**
 * Subscribes to real-time student roster and quiz results for a class.
 * Automatically updates live as students complete quizzes and update progress!
 */
export function subscribeToClassStudents(
  classId: string,
  callback: (students: ClassStudentItem[]) => void
): () => void {
  // Initial fire
  fetchStudentsInClass(classId).then(callback).catch(() => {});

  let unsubFirestore: (() => void) | null = null;
  try {
    const studentsCol = collection(db, 'classes', classId, 'students');
    unsubFirestore = onSnapshot(studentsCol, (snap) => {
      const studentKey = `${LOCAL_STUDENTS_PREFIX}${classId}`;
      const localStudents = getLocalItem<ClassStudentItem[]>(studentKey, []);
      const map = new Map<string, ClassStudentItem>();
      localStudents.forEach(s => map.set(s.studentId, s));

      snap.forEach(d => {
        const data = d.data() as ClassStudentItem;
        if (data && data.studentId) {
          map.set(data.studentId, data);
        }
      });

      const updated = Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
      setLocalItem(studentKey, updated);
      callback(updated);
    }, (err) => {
      console.warn('Class students onSnapshot error, falling back to local:', err);
      fetchStudentsInClass(classId).then(callback).catch(() => {});
    });
  } catch {
    // Offline
  }

  const handleLocalUpdate = () => {
    fetchStudentsInClass(classId).then(callback).catch(() => {});
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('igcse_student_progress_synced', handleLocalUpdate);
    window.addEventListener('igcse_task_submission_updated', handleLocalUpdate);
    window.addEventListener('storage', handleLocalUpdate);
  }

  return () => {
    if (unsubFirestore) unsubFirestore();
    if (typeof window !== 'undefined') {
      window.removeEventListener('igcse_student_progress_synced', handleLocalUpdate);
      window.removeEventListener('igcse_task_submission_updated', handleLocalUpdate);
      window.removeEventListener('storage', handleLocalUpdate);
    }
  };
}

/**
 * Subscribes to real-time tasks for a student.
 * Updates live as assignments are set or completed.
 */
export function subscribeToStudentTasks(
  student: UserProfile,
  enrolledClassIds: string[],
  studentProgress: StudentProgress | undefined,
  callback: (tasks: TaskWithSubmission[]) => void
): () => void {
  // Initial fire
  fetchTasksForStudent(student, enrolledClassIds, studentProgress).then(callback).catch(() => {});

  let unsubFirestore: (() => void) | null = null;
  try {
    const tasksCol = collection(db, 'tasks');
    unsubFirestore = onSnapshot(tasksCol, () => {
      fetchTasksForStudent(student, enrolledClassIds, studentProgress).then(callback).catch(() => {});
    }, (err) => {
      console.warn('Student tasks onSnapshot error, falling back to local:', err);
      fetchTasksForStudent(student, enrolledClassIds, studentProgress).then(callback).catch(() => {});
    });
  } catch {
    // Offline
  }

  const handleLocalUpdate = () => {
    fetchTasksForStudent(student, enrolledClassIds, studentProgress).then(callback).catch(() => {});
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('igcse_task_submission_updated', handleLocalUpdate);
    window.addEventListener('storage', handleLocalUpdate);
  }

  return () => {
    if (unsubFirestore) unsubFirestore();
    if (typeof window !== 'undefined') {
      window.removeEventListener('igcse_task_submission_updated', handleLocalUpdate);
      window.removeEventListener('storage', handleLocalUpdate);
    }
  };
}

/**
 * Calculates traffic light status according to the new parameters:
 * - 80%+ -> 'green' (Mastered)
 * - 50%, 60%, 70% (50% to 79%) -> 'orange' (Amber/Orange Grade)
 * - 40% or less (<50%) -> 'red' (Red Grade - Needs revision)
 */
export function calculateTrafficLightFromPercentage(percentage: number): TrafficLightStatus {
  if (percentage >= 80) return 'green';
  if (percentage >= 50) return 'orange';
  return 'red';
}

export interface UpdatePastQuizResultsSummary {
  studentsUpdatedCount: number;
  subtopicResultsUpdatedCount: number;
  taskSubmissionsUpdatedCount: number;
  activityLogsUpdatedCount: number;
  details: string[];
}

/**
 * Migrates and recalculates all past student quiz results, traffic light grades,
 * task submissions, and activity logs across Firestore and local storage caches
 * to match the new traffic light thresholds:
 * - 50%, 60%, 70% -> Amber/Orange Grade ('orange')
 * - 40% or less -> Red Grade ('red')
 * - 80%+ -> Green Grade ('green')
 */
export async function updatePastStudentQuizResultsWithNewTrafficLightParameters(): Promise<UpdatePastQuizResultsSummary> {
  const summary: UpdatePastQuizResultsSummary = {
    studentsUpdatedCount: 0,
    subtopicResultsUpdatedCount: 0,
    taskSubmissionsUpdatedCount: 0,
    activityLogsUpdatedCount: 0,
    details: []
  };

  // 1. Update current student's local progress in localStorage
  if (typeof window !== 'undefined') {
    try {
      const storedProgressStr = localStorage.getItem('igcse_0653_student_progress');
      if (storedProgressStr) {
        const storedProgress: StudentProgress = JSON.parse(storedProgressStr);
        let progressChanged = false;
        const updatedLights: Record<string, TrafficLightStatus> = { ...(storedProgress.trafficLights || {}) };

        if (storedProgress.subtopicQuizScores) {
          for (const [code, res] of Object.entries(storedProgress.subtopicQuizScores)) {
            if (res) {
              const pct = res.percentage !== undefined 
                ? res.percentage 
                : Math.round(((res.score || 0) / (res.total || 10)) * 100);
              const newLight = calculateTrafficLightFromPercentage(pct);
              if (updatedLights[code] !== newLight) {
                updatedLights[code] = newLight;
                progressChanged = true;
                summary.subtopicResultsUpdatedCount++;
              }
            }
          }
        }

        if (progressChanged) {
          storedProgress.trafficLights = updatedLights;
          localStorage.setItem('igcse_0653_student_progress', JSON.stringify(storedProgress));
          summary.details.push(`Updated local student progress with ${Object.keys(updatedLights).length} recalculated traffic lights.`);
        }
      }
    } catch (err) {
      console.warn('Error migrating local student progress:', err);
    }
  }

  // 2. Scan and update all enrolled students in classes (Firestore + localStorage)
  try {
    const classIdsToProcess = new Set<string>();

    // Read local classes
    const localClasses = getLocalItem<ClassItem[]>(LOCAL_CLASSES_KEY, []);
    localClasses.filter(c => c && c.id && c.id !== 'class_default_0653').forEach(c => classIdsToProcess.add(c.id));

    // Read Firestore classes
    try {
      const classesSnap = await getDocs(collection(db, 'classes'));
      classesSnap.forEach(d => {
        if (d.id !== 'class_default_0653') classIdsToProcess.add(d.id);
      });
    } catch {}

    for (const classId of classIdsToProcess) {
      const studentKey = `${LOCAL_STUDENTS_PREFIX}${classId}`;
      const localStudents = getLocalItem<ClassStudentItem[]>(studentKey, []);
      let classStudentsChanged = false;

      // Check Firestore students subcollection
      try {
        const subSnap = await getDocs(collection(db, 'classes', classId, 'students'));
        for (const studentDoc of subSnap.docs) {
          const sData = studentDoc.data() as ClassStudentItem;
          let studentChanged = false;
          const updatedLights: Record<string, TrafficLightStatus> = { ...(sData.trafficLights || {}) };

          if (sData.subtopicQuizScores) {
            for (const [code, res] of Object.entries(sData.subtopicQuizScores)) {
              if (res) {
                const pct = res.percentage !== undefined 
                  ? res.percentage 
                  : Math.round(((res.score || 0) / (res.total || 10)) * 100);
                const newLight = calculateTrafficLightFromPercentage(pct);
                if (updatedLights[code] !== newLight) {
                  updatedLights[code] = newLight;
                  studentChanged = true;
                  summary.subtopicResultsUpdatedCount++;
                }
              }
            }
          }

          if (studentChanged) {
            summary.studentsUpdatedCount++;
            summary.details.push(`Updated student ${sData.name} (${sData.email || sData.studentId}) in class ${classId}`);
            await updateDoc(studentDoc.ref, { trafficLights: updatedLights });

            // Sync with local student cache
            const lIdx = localStudents.findIndex(s => s.studentId === sData.studentId);
            if (lIdx >= 0) {
              localStudents[lIdx].trafficLights = updatedLights;
              classStudentsChanged = true;
            }
          }
        }
      } catch (err) {
        console.warn(`Error reading class ${classId} students from Firestore:`, err);
      }

      // Also process any local-only students
      localStudents.forEach(s => {
        let studentChanged = false;
        const updatedLights: Record<string, TrafficLightStatus> = { ...(s.trafficLights || {}) };
        if (s.subtopicQuizScores) {
          for (const [code, res] of Object.entries(s.subtopicQuizScores)) {
            if (res) {
              const pct = res.percentage !== undefined 
                ? res.percentage 
                : Math.round(((res.score || 0) / (res.total || 10)) * 100);
              const newLight = calculateTrafficLightFromPercentage(pct);
              if (updatedLights[code] !== newLight) {
                updatedLights[code] = newLight;
                studentChanged = true;
              }
            }
          }
        }
        if (studentChanged) {
          s.trafficLights = updatedLights;
          classStudentsChanged = true;
        }
      });

      if (classStudentsChanged) {
        setLocalItem(studentKey, localStudents);
      }
    }
  } catch (err) {
    console.warn('Error updating class students:', err);
  }

  // 3. Scan and update all User Profiles (users collection)
  try {
    const usersSnap = await getDocs(collection(db, 'users'));
    for (const uDoc of usersSnap.docs) {
      const uData = uDoc.data();
      if (uData?.progress?.subtopicQuizScores) {
        let userChanged = false;
        const updatedLights: Record<string, TrafficLightStatus> = { ...(uData.progress.trafficLights || {}) };

        for (const [code, res] of Object.entries(uData.progress.subtopicQuizScores as Record<string, SubtopicQuizResult>)) {
          if (res) {
            const pct = res.percentage !== undefined 
              ? res.percentage 
              : Math.round(((res.score || 0) / (res.total || 10)) * 100);
            const newLight = calculateTrafficLightFromPercentage(pct);
            if (updatedLights[code] !== newLight) {
              updatedLights[code] = newLight;
              userChanged = true;
            }
          }
        }

        if (userChanged) {
          await updateDoc(uDoc.ref, {
            'progress.trafficLights': updatedLights
          });
          summary.details.push(`Updated user progress for ${uData.name || uDoc.id}`);
        }
      }
    }
  } catch (err) {
    console.warn('Error updating users collection:', err);
  }

  // 4. Scan and repair all Task Submissions (fix legacy raw counts 0-10 stored as % and false red grades)
  try {
    const tasks = await fetchClassTasks();
    const allStudents = await fetchAllRegisteredStudents();
    const studentMap = new Map<string, ClassStudentItem>();
    allStudents.forEach(s => studentMap.set(s.studentId, s));

    for (const task of tasks) {
      const subKey = `${LOCAL_TASK_SUBMISSIONS_PREFIX}${task.id}`;
      const localSubs = getLocalItem<Record<string, TaskSubmission>>(subKey, {});
      let taskSubsChanged = false;
      const firstSub = task.targetSubtopics?.[0];

      const repairSubmission = (sub: TaskSubmission): Partial<TaskSubmission> | null => {
        const studentRec = studentMap.get(sub.studentId);
        const subResult = firstSub && studentRec?.subtopicQuizScores
          ? findEntryCaseInsensitive(studentRec.subtopicQuizScores, firstSub)
          : undefined;
        const trueSubPct = getSubtopicResultPercentage(subResult);

        let nextScore = sub.quizScore;
        let nextLight = sub.trafficLight;
        let nextTLScore = sub.trafficLightQuizScore;
        let nextTLCompleted = sub.trafficLightQuizCompleted;
        let changed = false;

        // If subtopic quiz result exists, reconcile percentage cleanly
        if (trueSubPct !== undefined) {
          if (sub.trafficLightQuizScore !== trueSubPct) {
            nextTLScore = trueSubPct;
            nextTLCompleted = true;
            changed = true;
          }
          // Fix raw count bug (e.g. score=8 out of 10 stored directly as quizScore=8 -> 8%)
          if (
            sub.quizScore !== undefined &&
            subResult &&
            sub.quizScore === subResult.score &&
            subResult.score !== trueSubPct
          ) {
            nextScore = trueSubPct;
            changed = true;
          }
        } else if (sub.quizScore !== undefined && sub.quizScore > 0 && sub.quizScore <= 10 && !sub.practiceQuizLength) {
          // Heuristic fallback when student record unavailable: legacy 10-question subtopic quiz saved raw score (1-10) as quizScore
          nextScore = Math.round((sub.quizScore / 10) * 100);
          changed = true;
        }

        if (nextScore !== undefined) {
          const recalculatedLight = calculateTrafficLightFromPercentage(nextScore);
          if (sub.trafficLight !== recalculatedLight) {
            nextLight = recalculatedLight;
            changed = true;
          }
        }

        if (!changed) return null;
        return {
          ...(nextScore !== undefined ? { quizScore: nextScore } : {}),
          ...(nextLight !== undefined ? { trafficLight: nextLight } : {}),
          ...(nextTLScore !== undefined ? { trafficLightQuizScore: nextTLScore } : {}),
          ...(nextTLCompleted !== undefined ? { trafficLightQuizCompleted: nextTLCompleted } : {})
        };
      };

      // Update Firestore task submissions
      try {
        const subsSnap = await getDocs(collection(db, 'tasks', task.id, 'submissions'));
        for (const subDoc of subsSnap.docs) {
          const sub = subDoc.data() as TaskSubmission;
          const patch = repairSubmission(sub);
          if (patch) {
            summary.taskSubmissionsUpdatedCount++;
            await updateDoc(subDoc.ref, cleanFirestoreData(patch));

            if (localSubs[sub.studentId]) {
              localSubs[sub.studentId] = { ...localSubs[sub.studentId], ...patch };
              taskSubsChanged = true;
            }
          }
        }
      } catch (err) {
        console.warn(`Error reading task ${task.id} submissions:`, err);
      }

      // Check local task submissions
      for (const [studentId, sub] of Object.entries(localSubs)) {
        const patch = repairSubmission(sub);
        if (patch) {
          localSubs[studentId] = { ...sub, ...patch };
          taskSubsChanged = true;
        }
      }

      if (taskSubsChanged) {
        setLocalItem(subKey, localSubs);
      }
    }
  } catch (err) {
    console.warn('Error updating task submissions:', err);
  }

  // 5. Scan and update all persistent activity logs in localStorage
  if (typeof window !== 'undefined') {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('igcse_0653_activity_log_')) {
          const raw = localStorage.getItem(key);
          if (raw) {
            const activities = JSON.parse(raw);
            let actChanged = false;
            if (Array.isArray(activities)) {
              activities.forEach((act: any) => {
                if (act.percentage !== undefined || act.score !== undefined) {
                  const pct = act.percentage !== undefined 
                    ? act.percentage 
                    : Math.round(((act.score || 0) / (act.total || 10)) * 100);
                  const newLight = calculateTrafficLightFromPercentage(pct);
                  if (act.trafficLight !== newLight) {
                    act.trafficLight = newLight;
                    actChanged = true;
                    summary.activityLogsUpdatedCount++;
                  }
                }
              });
              if (actChanged) {
                localStorage.setItem(key, JSON.stringify(activities));
              }
            }
          }
        }
      }
    } catch (err) {
      console.warn('Error updating activity logs:', err);
    }
  }

  // 6. Notify the application of changes via global events
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('igcse_classes_updated'));
    window.dispatchEvent(new CustomEvent('igcse_task_submission_updated'));
    window.dispatchEvent(new CustomEvent('igcse_progress_updated'));
  }

  return summary;
}

// ============================================================================
// SHARED CURRICULUM SLIDES & GOOGLE DRIVE PRESENTATION SYNC
// ============================================================================

export interface SharedSlideDeckItem {
  presentationId: string;
  title: string;
  embedUrl: string;
  directUrl: string;
  subtopicCode?: string;
  updatedAt?: string;
}

export interface SharedCurriculumSlidesData {
  overrides: Record<string, SharedSlideDeckItem>;
  syncedSlides: any[];
  updatedAt?: string;
  updatedBy?: string;
}

const LOCAL_SHARED_SLIDES_KEY = 'igcse_0653_shared_curriculum_slides';

/**
 * Real-time subscription to teacher-linked Google Slides & synced Drive presentations.
 * Allows all enrolled students and teachers to view the instructor's linked slide decks across devices.
 */
export function subscribeToCurriculumSlides(
  callback: (data: SharedCurriculumSlidesData) => void
): () => void {
  // Read local cache immediately
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_SHARED_SLIDES_KEY) : null;
    if (raw) {
      callback(JSON.parse(raw));
    }
  } catch (e) {
    // ignore
  }

  try {
    const docRef = doc(db, 'settings', 'curriculum_slides');
    return onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const d = snap.data() as SharedCurriculumSlidesData;
        const normalized: SharedCurriculumSlidesData = {
          overrides: d.overrides || {},
          syncedSlides: Array.isArray(d.syncedSlides) ? d.syncedSlides : [],
          updatedAt: d.updatedAt,
          updatedBy: d.updatedBy
        };
        try {
          if (typeof window !== 'undefined') {
            localStorage.setItem(LOCAL_SHARED_SLIDES_KEY, JSON.stringify(normalized));
          }
        } catch (e) {}
        callback(normalized);
      }
    }, (err) => {
      console.warn('subscribeToCurriculumSlides error:', err);
    });
  } catch (e) {
    console.warn('Error creating subscribeToCurriculumSlides listener:', e);
    return () => {};
  }
}

/**
 * Save or update a single subtopic slide deck override in Firestore for all students.
 */
export async function saveSharedSlideOverride(
  subtopicCode: string,
  slideData: SharedSlideDeckItem,
  instructorEmail?: string
): Promise<void> {
  const codeKey = subtopicCode.toUpperCase();
  try {
    const docRef = doc(db, 'settings', 'curriculum_slides');
    const existingSnap = await getDoc(docRef);
    const currentData = existingSnap.exists() ? (existingSnap.data() as SharedCurriculumSlidesData) : { overrides: {}, syncedSlides: [] };
    const newOverrides = {
      ...(currentData.overrides || {}),
      [codeKey]: {
        ...slideData,
        subtopicCode: codeKey,
        updatedAt: new Date().toISOString()
      }
    };
    await setDoc(docRef, {
      ...currentData,
      overrides: newOverrides,
      updatedAt: new Date().toISOString(),
      updatedBy: instructorEmail || 'corbanb@gisboyshigh.net'
    }, { merge: true });

    // Also cache locally
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_SHARED_SLIDES_KEY, JSON.stringify({
        ...currentData,
        overrides: newOverrides
      }));
    }
  } catch (err) {
    console.warn('Failed to save shared slide override to Firestore:', err);
  }
}

/**
 * Batch save multiple subtopic slide overrides to Firestore for all students.
 */
export async function batchSaveSharedSlideOverrides(
  mapping: Record<string, SharedSlideDeckItem>,
  instructorEmail?: string
): Promise<void> {
  try {
    const docRef = doc(db, 'settings', 'curriculum_slides');
    const existingSnap = await getDoc(docRef);
    const currentData = existingSnap.exists() ? (existingSnap.data() as SharedCurriculumSlidesData) : { overrides: {}, syncedSlides: [] };
    const newOverrides = {
      ...(currentData.overrides || {})
    };
    Object.entries(mapping).forEach(([key, val]) => {
      newOverrides[key.toUpperCase()] = {
        ...val,
        subtopicCode: key.toUpperCase(),
        updatedAt: new Date().toISOString()
      };
    });

    await setDoc(docRef, {
      ...currentData,
      overrides: newOverrides,
      updatedAt: new Date().toISOString(),
      updatedBy: instructorEmail || 'corbanb@gisboyshigh.net'
    }, { merge: true });

    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_SHARED_SLIDES_KEY, JSON.stringify({
        ...currentData,
        overrides: newOverrides
      }));
    }
  } catch (err) {
    console.warn('Failed to batch save shared slide overrides:', err);
  }
}

/**
 * Save synced Google Drive slide decks to Firestore so all students can immediately view them.
 */
export async function saveSharedSyncedDriveSlides(
  syncedSlides: any[],
  instructorEmail?: string
): Promise<void> {
  try {
    const docRef = doc(db, 'settings', 'curriculum_slides');
    const existingSnap = await getDoc(docRef);
    const currentData = existingSnap.exists() ? (existingSnap.data() as SharedCurriculumSlidesData) : { overrides: {}, syncedSlides: [] };

    await setDoc(docRef, {
      ...currentData,
      syncedSlides,
      updatedAt: new Date().toISOString(),
      updatedBy: instructorEmail || 'corbanb@gisboyshigh.net'
    }, { merge: true });

    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_SHARED_SLIDES_KEY, JSON.stringify({
        ...currentData,
        syncedSlides
      }));
    }
  } catch (err) {
    console.warn('Failed to save shared synced drive slides:', err);
  }
}



