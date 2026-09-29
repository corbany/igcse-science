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
  increment
} from 'firebase/firestore';
import { db } from './firebaseAuth';
import { UserProfile, StudentProgress, TrafficLightStatus, SubtopicQuizResult, ScienceSubject, ExamTier } from '../types';

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
}

export interface ClassStudentItem {
  studentId: string;
  name: string;
  email: string;
  tier: ExamTier;
  joinedAt: string;
  lastActive: string;
  completedLessonsCount: number;
  quizScores: Record<string, { score: number; total: number; date: string }>;
  subtopicQuizScores: Record<string, SubtopicQuizResult>;
  topicConfidence: Record<string, number>;
  trafficLights: Record<string, TrafficLightStatus>;
  weakTopics: string[];
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
    studentCount: 0
  };

  // Save to local storage
  const localClasses = getLocalItem<ClassItem[]>(LOCAL_CLASSES_KEY, []);
  localClasses.unshift(classData);
  setLocalItem(LOCAL_CLASSES_KEY, localClasses);

  // Try Firestore
  try {
    const classRef = doc(db, 'classes', classId);
    await setDoc(classRef, classData);
  } catch {
    // Offline: saved locally
  }

  return { 
    success: true, 
    classItem: classData, 
    message: `Class "${classData.name}" created with code ${classData.classCode}!` 
  };
}

/**
 * Fetch all classes created by an instructor
 */
export async function fetchClassesByInstructor(instructorId: string): Promise<ClassItem[]> {
  const localClasses = getLocalItem<ClassItem[]>(LOCAL_CLASSES_KEY, []);
  const instructorLocal = localClasses.filter(c => c.instructorId === instructorId);

  try {
    const q = query(
      collection(db, 'classes'),
      where('instructorId', '==', instructorId)
    );
    const snap = await getDocs(q);
    const remoteClasses: ClassItem[] = [];
    snap.forEach(docSnap => {
      remoteClasses.push(docSnap.data() as ClassItem);
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

  // Check local classes first
  const localClasses = getLocalItem<ClassItem[]>(LOCAL_CLASSES_KEY, []);
  const match = localClasses.find(c => 
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

  const enrollmentData: ClassStudentItem = {
    studentId: student.id,
    name: student.name,
    email: student.email,
    tier: student.tier,
    joinedAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
    completedLessonsCount: (progress.completedLessons || []).length,
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
  } catch {
    // Offline: enrolled locally
  }

  return { 
    success: true, 
    classItem: targetClass, 
    message: `Successfully joined ${targetClass.name} (Code: ${targetClass.classCode})!` 
  };
}

/**
 * Fetch all classes a student is enrolled in
 */
export async function fetchStudentEnrolledClasses(studentId: string): Promise<ClassItem[]> {
  const enrolledKey = `${LOCAL_ENROLLED_PREFIX}${studentId}`;
  const localEnrolled = getLocalItem<ClassItem[]>(enrolledKey, []);

  try {
    const userRef = doc(db, 'users', studentId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const enrolledIds: string[] = userSnap.data().enrolledClassIds || [];
      if (enrolledIds.length > 0) {
        const classes: ClassItem[] = [];
        for (const classId of enrolledIds) {
          const classSnap = await getDoc(doc(db, 'classes', classId));
          if (classSnap.exists()) {
            classes.push(classSnap.data() as ClassItem);
          }
        }
        if (classes.length > 0) {
          setLocalItem(enrolledKey, classes);
          return classes;
        }
      }
    }
  } catch {
    // Offline mode: return local enrolled classes
  }

  return localEnrolled;
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
      completedLessonsCount: (progress.completedLessons || []).length,
      quizScores: progress.quizScores || {},
      subtopicQuizScores: progress.subtopicQuizScores || {},
      topicConfidence: progress.topicConfidence || {},
      trafficLights: progress.trafficLights || {},
      weakTopics
    };

    if (idx >= 0) {
      localStudents[idx] = updatedRecord;
    } else {
      localStudents.push(updatedRecord);
    }
    setLocalItem(studentKey, localStudents);

    // Try Firestore
    try {
      const studentDocRef = doc(db, 'classes', classId, 'students', student.id);
      updateDoc(studentDocRef, {
        name: student.name,
        email: student.email,
        tier: student.tier,
        lastActive: new Date().toISOString(),
        completedLessonsCount: (progress.completedLessons || []).length,
        quizScores: progress.quizScores || {},
        subtopicQuizScores: progress.subtopicQuizScores || {},
        topicConfidence: progress.topicConfidence || {},
        trafficLights: progress.trafficLights || {},
        weakTopics
      }).catch(() => {});
    } catch {
      // Offline
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
