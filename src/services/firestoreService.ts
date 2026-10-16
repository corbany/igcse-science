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
import { UserProfile, StudentProgress, TrafficLightStatus, SubtopicQuizResult, ScienceSubject, ExamTier, ClassTask, TaskSubmission, TaskWithSubmission, TaskProgressStatus } from '../types';

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

export const DEFAULT_CLASS_CODE = 'SCI-0653';
export const DEFAULT_CLASS_ITEM: ClassItem = {
  id: 'class_default_0653',
  classCode: 'SCI-0653',
  name: 'Cambridge IGCSE Combined Science (0653)',
  subject: 'all',
  description: 'Official class for Cambridge IGCSE Combined Science syllabus revision.',
  instructorId: 'corbanb_instructor',
  instructorName: 'Mr. Corban',
  instructorEmail: 'corbanb@gisboyshigh.net',
  createdAt: '2026-01-01T00:00:00.000Z',
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
  quizScores: Record<string, { score: number; total: number; date: string }>;
  subtopicQuizScores: Record<string, SubtopicQuizResult>;
  topicConfidence: Record<string, number>;
  trafficLights: Record<string, TrafficLightStatus>;
  weakTopics: string[];
  badgesCount?: number;
  totalQuizScore?: number;
  quizzesCompletedCount?: number;
  xp?: number;
  featuredBadgeId?: string;
  streakDays?: number;
}

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

  const localClasses = getLocalItem<ClassItem[]>(LOCAL_CLASSES_KEY, [DEFAULT_CLASS_ITEM]);
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
  const localClasses = getLocalItem<ClassItem[]>(LOCAL_CLASSES_KEY, [DEFAULT_CLASS_ITEM]);
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
  const localClasses = getLocalItem<ClassItem[]>(LOCAL_CLASSES_KEY, [DEFAULT_CLASS_ITEM]);
  const cleanEmail = (instructorEmail || '').toLowerCase().trim();
  const isPrimary = cleanEmail === 'corbanb@gisboyshigh.net' || instructorId === 'corbanb_instructor';

  const instructorLocal = localClasses.filter(c => 
    c.instructorId === instructorId || 
    (cleanEmail && c.instructorEmail?.toLowerCase() === cleanEmail) ||
    (cleanEmail && Array.isArray(c.sharedInstructorEmails) && c.sharedInstructorEmails.map(e => e.toLowerCase()).includes(cleanEmail)) ||
    (isPrimary && (c.id === DEFAULT_CLASS_ITEM.id || c.instructorEmail === 'corbanb@gisboyshigh.net'))
  );

  try {
    const snap = await getDocs(collection(db, 'classes'));
    const remoteClasses: ClassItem[] = [];
    snap.forEach(docSnap => {
      const c = docSnap.data() as ClassItem;
      if (c && c.id) {
        if (
          c.instructorId === instructorId || 
          (cleanEmail && c.instructorEmail?.toLowerCase() === cleanEmail) ||
          (cleanEmail && Array.isArray(c.sharedInstructorEmails) && c.sharedInstructorEmails.map(e => e.toLowerCase()).includes(cleanEmail)) ||
          (isPrimary && (c.id === DEFAULT_CLASS_ITEM.id || c.instructorEmail === 'corbanb@gisboyshigh.net'))
        ) {
          remoteClasses.push(c);
        }
      }
    });

    // Always ensure default class is represented for primary instructor
    if (isPrimary && !remoteClasses.some(c => c.id === DEFAULT_CLASS_ITEM.id)) {
      remoteClasses.unshift(DEFAULT_CLASS_ITEM);
    }

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

  if (isPrimary && !instructorLocal.some(c => c.id === DEFAULT_CLASS_ITEM.id)) {
    instructorLocal.unshift(DEFAULT_CLASS_ITEM);
  }

  return instructorLocal.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/**
 * Find class by class code (case-insensitive)
 */
export async function findClassByCode(rawCode: string): Promise<ClassItem | null> {
  const cleanCode = rawCode.trim().toUpperCase();
  if (!cleanCode) return null;

  // Check local classes first
  const localClasses = getLocalItem<ClassItem[]>(LOCAL_CLASSES_KEY, []);
  let match = localClasses.find(c => 
    c.classCode.toUpperCase() === cleanCode || 
    c.classCode.toUpperCase() === `SCI-${cleanCode}`
  );
  if (match) return match;

  try {
    const q = query(
      collection(db, 'classes'),
      where('classCode', '==', cleanCode)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs[0].data() as ClassItem;
    }

    const q2 = query(
      collection(db, 'classes'),
      where('classCode', '==', `SCI-${cleanCode}`)
    );
    const snap2 = await getDocs(q2);
    if (!snap2.empty) {
      return snap2.docs[0].data() as ClassItem;
    }
  } catch {
    // Offline
  }

  // Fallback: If code matches default class code SCI-0653 or 0653, ensure default class is registered
  if (cleanCode === 'SCI-0653' || cleanCode === '0653') {
    const updated = [...localClasses, DEFAULT_CLASS_ITEM];
    setLocalItem(LOCAL_CLASSES_KEY, updated);
    try {
      setDoc(doc(db, 'classes', DEFAULT_CLASS_ITEM.id), DEFAULT_CLASS_ITEM, { merge: true }).catch(() => {});
    } catch {}
    return DEFAULT_CLASS_ITEM;
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
  const targetClass = await findClassByCode(classCode);
  if (!targetClass) {
    return { 
      success: false, 
      message: `No class found with code "${classCode.toUpperCase()}". Please verify the code with your instructor.` 
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
  const localEnrolled = getLocalItem<ClassItem[]>(enrolledKey, [DEFAULT_CLASS_ITEM]);

  try {
    const userRef = doc(db, 'users', studentId);
    const userSnap = await getDoc(userRef);
    const enrolledIds: string[] = (userSnap.exists() && userSnap.data()?.enrolledClassIds) || [];
    
    // Always include DEFAULT_CLASS_ITEM for Cambridge 0653 syllabus
    if (!enrolledIds.includes(DEFAULT_CLASS_ITEM.id)) {
      enrolledIds.unshift(DEFAULT_CLASS_ITEM.id);
    }

    const classes: ClassItem[] = [];
    for (const classId of enrolledIds) {
      if (classId === DEFAULT_CLASS_ITEM.id) {
        classes.push(DEFAULT_CLASS_ITEM);
        continue;
      }
      try {
        const classSnap = await getDoc(doc(db, 'classes', classId));
        if (classSnap.exists()) {
          classes.push(classSnap.data() as ClassItem);
        }
      } catch {}
    }

    // Also check if student exists in any class's students subcollection
    try {
      const allClassSnap = await getDocs(collection(db, 'classes'));
      for (const cd of allClassSnap.docs) {
        if (!classes.some(c => c.id === cd.id)) {
          const studentDoc = await getDoc(doc(db, 'classes', cd.id, 'students', studentId));
          if (studentDoc.exists()) {
            classes.push(cd.data() as ClassItem);
          }
        }
      }
    } catch {}

    if (classes.length > 0) {
      setLocalItem(enrolledKey, classes);
      return classes;
    }
  } catch {
    // Offline mode: return local enrolled classes
  }

  if (!localEnrolled.some(c => c.id === DEFAULT_CLASS_ITEM.id)) {
    localEnrolled.unshift(DEFAULT_CLASS_ITEM);
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
  const localClasses = getLocalItem<ClassItem[]>(LOCAL_CLASSES_KEY, [DEFAULT_CLASS_ITEM]);
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

    // If default class has no students in subcollection, query all registered students
    if (classId === DEFAULT_CLASS_ITEM.id || classId === 'class_default_0653') {
      const allReg = await fetchAllRegisteredStudents();
      if (allReg.length > 0) {
        setLocalItem(studentKey, allReg);
        return allReg;
      }
    }
  } catch {
    // Offline mode: return local students
  }

  return localStudents.sort((a, b) => b.lastActive.localeCompare(a.lastActive));
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

  const weakTopics = Object.entries(progress.topicConfidence || {})
    .filter(([_, rating]) => rating <= 2)
    .map(([code]) => code);

  // Unify completed lessons, traffic lights, and quiz scores so slide deck and syllabus tracking is 100% updated live
  const completedDecks = Array.from(new Set([
    ...(progress.completedLessons || []),
    ...Object.keys(progress.trafficLights || {}),
    ...Object.keys(progress.subtopicQuizScores || {})
  ]));

  const subScores = Object.values(progress.subtopicQuizScores || {});
  const mainScores = Object.values(progress.quizScores || {});
  const totalQuizScore = subScores.reduce((acc, s) => acc + (s.score || 0), 0) + mainScores.reduce((acc, q) => acc + (q.score || 0), 0);
  const quizzesCompletedCount = subScores.length + mainScores.length;

  for (const classId of enrolledClassIds) {
    // Update local cache
    const studentKey = `${LOCAL_STUDENTS_PREFIX}${classId}`;
    const localStudents = getLocalItem<ClassStudentItem[]>(studentKey, []);
    const idx = localStudents.findIndex(s => s.studentId === student.id);
    const updatedRecord: ClassStudentItem = {
      studentId: student.id,
      name: student.name,
      email: student.email,
      tier: student.tier,
      joinedAt: idx >= 0 ? localStudents[idx].joinedAt : new Date().toISOString(),
      lastActive: new Date().toISOString(),
      completedLessonsCount: completedDecks.length,
      completedLessons: completedDecks,
      quizScores: progress.quizScores || {},
      subtopicQuizScores: progress.subtopicQuizScores || {},
      topicConfidence: progress.topicConfidence || {},
      trafficLights: progress.trafficLights || {},
      weakTopics,
      totalQuizScore,
      quizzesCompletedCount,
      badgesCount: progress.earnedBadges?.length || (localStudents[idx]?.badgesCount || 0),
      featuredBadgeId: progress.featuredBadgeId || student.featuredBadgeId,
      streakDays: progress.currentStreak || 1,
      xp: student.xp || 0
    };

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

// -------------------------------------------------------------
// INSTRUCTOR TASKS & STUDENT HOMEWORK ASSIGNMENTS
// -------------------------------------------------------------

export interface CreateClassTaskOptions {
  sendEmail?: boolean;
  explicitRecipients?: { studentId: string; studentName: string; studentEmail: string }[];
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
): Promise<ClassTask> {
  const id = `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const createdAt = new Date().toISOString();

  // Ensure ALL fields are defined to prevent Firestore rejection
  const newTask: ClassTask = {
    ...taskData,
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

  // 3. Dispatch automated email notification to all targeted students if requested
  if (options?.sendEmail !== false) {
    const emailRecipients = studentList
      .filter(s => s.email && s.email.includes('@'))
      .map(s => ({
        studentId: s.studentId,
        studentName: s.name,
        studentEmail: s.email
      }));

    if (emailRecipients.length > 0) {
      try {
        await notifyStudentsOfTaskAssignment(newTask, emailRecipients);
      } catch (err) {
        console.warn('Failed to dispatch task assignment email notifications:', err);
      }
    }
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('igcse_task_created', { detail: { task: newTask } }));
    window.dispatchEvent(new CustomEvent('igcse_task_submission_updated', { detail: { taskId: id } }));
  }

  return newTask;
}

/**
 * Dispatches an automated email notification to students when a task is set.
 */
export async function notifyStudentsOfTaskAssignment(
  task: ClassTask,
  explicitRecipients?: { studentId: string; studentName: string; studentEmail: string }[]
): Promise<TaskNotificationResult> {
  const fallbackResult: TaskNotificationResult = {
    count: 0,
    method: 'none',
    smtpConfigured: false,
    recipients: []
  };

  try {
    let recipients = explicitRecipients || [];

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
            studentEmail: s.email
          }));
      }
    }

    if (recipients.length === 0) {
      console.log('[notifyStudentsOfTaskAssignment] No student recipients found for task:', task.id);
      return fallbackResult;
    }

    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';

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
      console.log(`[notifyStudentsOfTaskAssignment] Server dispatch result:`, data);
      return {
        count: data.count || recipients.length,
        method: data.method || (data.smtpConfigured ? 'smtp' : 'email_client_ready'),
        smtpConfigured: Boolean(data.smtpConfigured),
        mailtoUrl: data.mailtoUrl,
        gmailComposeUrl: data.gmailComposeUrl,
        warning: data.warning,
        subject: data.subject,
        emailText: data.emailText,
        recipients: recipients.map(r => ({ studentName: r.studentName, studentEmail: r.studentEmail }))
      };
    } else {
      console.warn('[notifyStudentsOfTaskAssignment] Server error response:', await res.text());
    }
  } catch (err) {
    console.warn('[notifyStudentsOfTaskAssignment] Email dispatch failed:', err);
  }
  return fallbackResult;
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

/**
 * Fetch tasks applicable to a student (based on their enrolled classes and/or UID).
 */
export async function fetchTasksForStudent(
  student: UserProfile,
  enrolledClassIds: string[],
  studentProgress?: StudentProgress
): Promise<TaskWithSubmission[]> {
  const allTasks = await fetchClassTasks();
  const studentTasks: TaskWithSubmission[] = [];
  const now = Date.now();

  const studentCleanEmail = (student.email || '').toLowerCase().trim();
  const activeClassIds = new Set(enrolledClassIds || []);
  activeClassIds.add(DEFAULT_CLASS_ITEM.id);
  activeClassIds.add('class_default_0653');

  // If student only has default class in local memory, also resolve enrolled classes from Firestore user profile
  if (activeClassIds.size <= 2 && student.id) {
    try {
      const userDoc = await getDoc(doc(db, 'users', student.id));
      if (userDoc.exists()) {
        const userClasses: string[] = userDoc.data()?.enrolledClassIds || [];
        userClasses.forEach(cid => activeClassIds.add(cid));
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
    // - OR task is for default class
    const isClassMatch = 
      task.classId === 'all' || 
      activeClassIds.has(task.classId) || 
      task.classId === DEFAULT_CLASS_ITEM.id || 
      task.classId === 'class_default_0653';

    // If teacher selected specific students, only targeted students see it.
    // If teacher set task for class (or all classes), all students enrolled in that class see it.
    // If the student hasn't entered a custom class code yet, show course-wide & syllabus tasks so assignments are never hidden.
    const appliesToStudent = hasTargetIds 
      ? isTargetedDirectly 
      : (isClassMatch || task.classId === 'all' || activeClassIds.size <= 2);

    if (appliesToStudent) {
      // Fetch or derive student's submission status
      let submission: TaskSubmission | undefined = undefined;

      // Check local storage submission
      const subKey = `${LOCAL_TASK_SUBMISSIONS_PREFIX}${task.id}`;
      const localSubs = getLocalItem<Record<string, TaskSubmission>>(subKey, {});
      if (localSubs[student.id]) {
        submission = localSubs[student.id];
      }

      // Check Firestore submission
      try {
        const subDoc = await getDoc(doc(db, 'tasks', task.id, 'submissions', student.id));
        if (subDoc.exists()) {
          submission = subDoc.data() as TaskSubmission;
          localSubs[student.id] = submission;
          setLocalItem(subKey, localSubs);
        }
      } catch {
        // use local
      }

      // If no recorded submission yet, verify if student's progress already completed it!
      if (!submission) {
        let initialStatus: TaskProgressStatus = 'not_started';
        let trafficLightVal: TrafficLightStatus | undefined = undefined;
        let quizScoreVal: number | undefined = undefined;

        if (studentProgress) {
          if (task.type === 'both' && task.targetSubtopics?.length > 0) {
            const hasSlides = task.targetSubtopics.every(
              sub => studentProgress.trafficLights && studentProgress.trafficLights[sub]
            );
            const hasQuiz = task.targetSubtopics.some(
              sub => studentProgress.subtopicQuizScores && studentProgress.subtopicQuizScores[sub]
            );

            if (hasSlides) trafficLightVal = studentProgress.trafficLights[task.targetSubtopics[0]];
            if (hasQuiz) quizScoreVal = studentProgress.subtopicQuizScores[task.targetSubtopics[0]]?.score;

            if (hasSlides && hasQuiz) {
              initialStatus = 'completed';
            } else if (hasSlides || hasQuiz) {
              initialStatus = 'incomplete';
            }
          } else if (task.type === 'slides_traffic_light' && task.targetSubtopics?.length > 0) {
            const hasAllLights = task.targetSubtopics.every(
              sub => studentProgress.trafficLights && studentProgress.trafficLights[sub]
            );
            if (hasAllLights) {
              initialStatus = 'completed';
              trafficLightVal = studentProgress.trafficLights[task.targetSubtopics[0]];
            } else if (task.targetSubtopics.some(sub => studentProgress.trafficLights && studentProgress.trafficLights[sub])) {
              initialStatus = 'incomplete';
            }
          } else if (task.type === 'practice_quiz' && task.targetSubtopics?.length > 0) {
            const hasQuiz = task.targetSubtopics.some(
              sub => studentProgress.subtopicQuizScores && studentProgress.subtopicQuizScores[sub]
            );
            if (hasQuiz) {
              initialStatus = 'completed';
              quizScoreVal = studentProgress.subtopicQuizScores[task.targetSubtopics[0]]?.score;
            }
          }
        }

        submission = {
          studentId: student.id,
          studentName: student.name,
          studentEmail: student.email,
          status: initialStatus,
          trafficLight: trafficLightVal,
          quizScore: quizScoreVal,
          completedAt: initialStatus === 'completed' ? new Date().toISOString() : undefined
        };

        // Cache submission
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
    completedAt: update.status === 'completed' ? (existing.completedAt || new Date().toISOString()) : existing.completedAt
  };

  localSubs[studentId] = updated;
  setLocalItem(subKey, localSubs);

  try {
    const subRef = doc(db, 'tasks', taskId, 'submissions', studentId);
    await setDoc(subRef, updated, { merge: true });
  } catch (err) {
    console.warn('Offline: Saved task submission locally.', err);
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('igcse_task_submission_updated', {
      detail: { taskId, studentId, status: updated.status }
    }));
  }

  return updated;
}

/**
 * Retrieves all student submissions for an instructor reviewing a task.
 */
export async function fetchTaskSubmissions(taskId: string, classId?: string): Promise<TaskSubmission[]> {
  const subKey = `${LOCAL_TASK_SUBMISSIONS_PREFIX}${taskId}`;
  const localSubsMap = getLocalItem<Record<string, TaskSubmission>>(subKey, {});
  const result: TaskSubmission[] = [];

  // 1. Fetch from Firestore
  try {
    const snap = await getDocs(collection(db, 'tasks', taskId, 'submissions'));
    snap.forEach(d => {
      const data = d.data() as TaskSubmission;
      if (data && data.studentId) {
        localSubsMap[data.studentId] = data;
      }
    });
    setLocalItem(subKey, localSubsMap);
  } catch {
    // Offline
  }

  // 2. If classId provided, make sure all enrolled students are represented (default 'not_started')
  if (classId && classId !== 'all') {
    const students = await fetchStudentsInClass(classId);
    for (const student of students) {
      if (!localSubsMap[student.studentId]) {
        localSubsMap[student.studentId] = {
          studentId: student.studentId,
          studentName: student.name,
          studentEmail: student.email,
          status: 'not_started'
        };
      }
    }
  }

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
  const idx = localTasks.findIndex(t => t.id !== taskId);
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

/**
 * Checks if a student's newly updated traffic light or quiz score completes any assigned tasks.
 */
export async function autoCheckTaskCompletion(
  student: UserProfile,
  enrolledClassIds: string[],
  actionType: 'traffic_light' | 'quiz',
  subtopicCode: string,
  extra?: { trafficLight?: TrafficLightStatus; quizScore?: number }
): Promise<void> {
  try {
    const studentTasks = await fetchTasksForStudent(student, enrolledClassIds);
    for (const task of studentTasks) {
      if (task.submission?.status === 'completed') continue;

      if (task.type === 'both') {
        const matchesSubtopic = task.targetSubtopics.includes(subtopicCode) || 
          task.targetSubtopics.some(s => subtopicCode.startsWith(s));

        if (matchesSubtopic) {
          const currentSub = task.submission;
          const slidesDone = actionType === 'traffic_light' ? true : (currentSub?.slidesCompleted || currentSub?.trafficLight !== undefined);
          const quizDone = actionType === 'quiz' ? true : (currentSub?.quizCompleted || currentSub?.quizScore !== undefined);

          const isFullyCompleted = slidesDone && quizDone;

          await updateTaskSubmission(task.id, student.id, {
            status: isFullyCompleted ? 'completed' : 'incomplete',
            trafficLight: actionType === 'traffic_light' ? extra?.trafficLight : currentSub?.trafficLight,
            quizScore: actionType === 'quiz' ? extra?.quizScore : currentSub?.quizScore,
            slidesCompleted: slidesDone,
            quizCompleted: quizDone,
            studentName: student.name,
            studentEmail: student.email,
            completedAt: isFullyCompleted ? new Date().toISOString() : undefined
          });
        }
      } else if (actionType === 'traffic_light' && task.type === 'slides_traffic_light') {
        if (task.targetSubtopics.includes(subtopicCode)) {
          await updateTaskSubmission(task.id, student.id, {
            status: 'completed',
            trafficLight: extra?.trafficLight,
            studentName: student.name,
            studentEmail: student.email,
            completedAt: new Date().toISOString()
          });
        }
      } else if (actionType === 'quiz' && task.type === 'practice_quiz') {
        if (task.targetSubtopics.includes(subtopicCode) || task.targetSubtopics.some(s => subtopicCode.startsWith(s))) {
          await updateTaskSubmission(task.id, student.id, {
            status: 'completed',
            quizScore: extra?.quizScore,
            studentName: student.name,
            studentEmail: student.email,
            completedAt: new Date().toISOString()
          });
        }
      }
    }
  } catch (err) {
    console.warn('Auto task check error:', err);
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
  callback: (submissions: TaskSubmission[]) => void
): () => void {
  // Initial fire
  fetchTaskSubmissions(taskId, classId).then(callback).catch(() => {});

  let unsubFirestore: (() => void) | null = null;
  try {
    const subCol = collection(db, 'tasks', taskId, 'submissions');
    unsubFirestore = onSnapshot(subCol, () => {
      fetchTaskSubmissions(taskId, classId).then(callback).catch(() => {});
    }, (err) => {
      console.warn('Submissions onSnapshot error:', err);
    });
  } catch {
    // Offline
  }

  const handleLocalUpdate = () => {
    fetchTaskSubmissions(taskId, classId).then(callback).catch(() => {});
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('igcse_task_submission_updated', handleLocalUpdate);
  }

  return () => {
    if (unsubFirestore) unsubFirestore();
    if (typeof window !== 'undefined') {
      window.removeEventListener('igcse_task_submission_updated', handleLocalUpdate);
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
      console.warn('Class students onSnapshot error:', err);
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
      console.warn('Student tasks onSnapshot error:', err);
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

