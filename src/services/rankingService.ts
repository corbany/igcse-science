import { LeaderboardEntry, UserProfile, StudentProgress, ExamTier, StudentBadge } from '../types';
import { fetchStudentsInClass, fetchAllRegisteredStudents, ClassStudentItem, fetchStudentEnrolledClasses, DEFAULT_CLASS_ITEM, ClassItem } from './firestoreService';
import { evaluateStudentBadges, calculateStudentLevel, BADGE_DEFINITIONS } from './badgeService';

// Fallback diverse Cambridge 0653 cohort classmates so the competition is always thrilling
export const COHORT_PEERS: { 
  name: string; 
  email: string; 
  tier: ExamTier; 
  streak: number; 
  decks: number; 
  quizzesPassed: number; 
  totalQuizScore: number;
  badgesCount: number;
  featuredBadgeId: string;
}[] = [
  { name: 'Chloe Vance', email: 'chloe.vance@cambridge-academy.org', tier: 'Extended', streak: 12, decks: 58, quizzesPassed: 16, totalQuizScore: 154, badgesCount: 14, featuredBadgeId: 'quiz_cambridge_distinction' },
  { name: 'Tariq Al-Mansoor', email: 'tariq.m@science-high.edu', tier: 'Extended', streak: 9, decks: 49, quizzesPassed: 14, totalQuizScore: 132, badgesCount: 12, featuredBadgeId: 'topic_B2' },
  { name: 'Mei-Ling Chen', email: 'meiling.chen@global-igcse.com', tier: 'Extended', streak: 15, decks: 45, quizzesPassed: 12, totalQuizScore: 118, badgesCount: 11, featuredBadgeId: 'streak_14' },
  { name: 'Lucas Rossi', email: 'lucas.rossi@international.school', tier: 'Extended', streak: 6, decks: 38, quizzesPassed: 10, totalQuizScore: 98, badgesCount: 9, featuredBadgeId: 'topic_C5' },
  { name: 'Amara Okafor', email: 'amara.okafor@lagos-science.net', tier: 'Core', streak: 8, decks: 32, quizzesPassed: 8, totalQuizScore: 78, badgesCount: 8, featuredBadgeId: 'streak_7' },
  { name: 'Oliver Bennett', email: 'oliver.bennett@st-peters.ac.uk', tier: 'Extended', streak: 4, decks: 28, quizzesPassed: 7, totalQuizScore: 68, badgesCount: 7, featuredBadgeId: 'quiz_sharpshooter' },
  { name: 'Sofia Rodriguez', email: 'sofia.r@madrid-intl.es', tier: 'Extended', streak: 5, decks: 24, quizzesPassed: 6, totalQuizScore: 56, badgesCount: 6, featuredBadgeId: 'topic_P1' },
  { name: 'Devan Patel', email: 'devan.patel@mumbai-scholars.in', tier: 'Core', streak: 3, decks: 19, quizzesPassed: 5, totalQuizScore: 48, badgesCount: 5, featuredBadgeId: 'streak_3' }
];

function calculatePeerXP(peer: typeof COHORT_PEERS[0]): number {
  return (peer.decks * 50) + (peer.totalQuizScore * 15) + (peer.streak * 25) + (peer.badgesCount * 120);
}

function resolvePeerBadges(peer: typeof COHORT_PEERS[0]): StudentBadge[] {
  const list: StudentBadge[] = [];
  const featured = BADGE_DEFINITIONS.find(b => b.id === peer.featuredBadgeId);
  if (featured) {
    list.push({ ...featured, unlockedAt: new Date(Date.now() - 86400000 * 2).toISOString() });
  }
  // Add common badges based on peer badgesCount
  for (const b of BADGE_DEFINITIONS) {
    if (b.id !== peer.featuredBadgeId && list.length < peer.badgesCount) {
      list.push({ ...b, unlockedAt: new Date(Date.now() - 86400000 * (list.length + 1)).toISOString() });
    }
  }
  return list;
}

export interface ClassLeaderboardData {
  classItem?: ClassItem;
  entries: LeaderboardEntry[];
  currentUserEntry?: LeaderboardEntry;
  topThree: LeaderboardEntry[];
  totalClassBadges: number;
  totalClassQuizScore: number;
  totalCompetitors: number;
}

/**
 * Fetch and aggregate badges and total quiz scores across all students in a class.
 * Privacy invariant: individual quiz averages for other students are strictly withheld.
 */
export async function getClassStudentLeaderboard(
  classId: string,
  currentUser?: UserProfile | null,
  currentProgress?: StudentProgress
): Promise<ClassLeaderboardData> {
  let rawStudents: ClassStudentItem[] = [];
  let classInfo: ClassItem | undefined;

  try {
    if (currentUser?.id) {
      const classes = await fetchStudentEnrolledClasses(currentUser.id);
      classInfo = classes.find(c => c.id === classId);
    }
    rawStudents = await fetchStudentsInClass(classId);
  } catch (err) {
    console.warn('Error fetching class students for leaderboard, using fallback cohort:', err);
    rawStudents = [];
  }

  // Live evaluation for current student
  let currentStudentEvaluatedXP = 0;
  let currentStudentStreak = 1;
  let currentStudentBadgesCount = 0;
  let currentStudentDecks = 0;
  let currentStudentTotalQuizScore = 0;
  let currentStudentQuizzesCount = 0;
  let currentStudentUnlockedBadges: StudentBadge[] = [];
  let currentStudentAccuracy = 0; // Private to current student only

  if (currentProgress) {
    const badgeEval = evaluateStudentBadges(currentProgress, currentUser);
    currentStudentEvaluatedXP = badgeEval.totalXP;
    currentStudentStreak = currentProgress.currentStreak || 1;
    currentStudentBadgesCount = badgeEval.unlockedBadges.length;
    currentStudentUnlockedBadges = badgeEval.unlockedBadges;

    const completedSet = new Set([
      ...(currentProgress.completedLessons || []),
      ...Object.keys(currentProgress.trafficLights || {}),
      ...Object.keys(currentProgress.subtopicQuizScores || {})
    ]);
    currentStudentDecks = completedSet.size;

    // Calculate cumulative total quiz score
    const subtopicScores = Object.values(currentProgress.subtopicQuizScores || {});
    const quizScores = Object.values(currentProgress.quizScores || {});

    currentStudentTotalQuizScore = subtopicScores.reduce((acc, s) => acc + (s.score || 0), 0) +
                                   quizScores.reduce((acc, q) => acc + (q.score || 0), 0);
    currentStudentQuizzesCount = subtopicScores.length + quizScores.length;

    // Private accuracy for current user's eyes only
    const allPercentages = [
      ...subtopicScores.map(q => q.percentage),
      ...quizScores.map(q => Math.round((q.score / (q.total || 1)) * 100))
    ];
    if (allPercentages.length > 0) {
      currentStudentAccuracy = Math.round(allPercentages.reduce((a, b) => a + b, 0) / allPercentages.length);
    }
  }

  const studentMap = new Map<string, LeaderboardEntry>();

  // Process enrolled students in the class
  for (const s of rawStudents) {
    if (!s.name && !s.email) continue;

    const isCurrent = currentUser
      ? (s.studentId === currentUser.id || s.email.toLowerCase() === currentUser.email.toLowerCase())
      : false;

    // Evaluate badges for classmate
    let badgesCount = s.badgesCount || 0;
    let unlockedBadges: StudentBadge[] = [];
    let xp = s.xp || 0;
    let streak = s.streakDays || 1;
    let decks = s.completedLessonsCount || (s.completedLessons?.length || 0);

    // Compute raw cumulative total quiz score
    let totalScore = s.totalQuizScore || 0;
    let quizCount = s.quizzesCompletedCount || 0;

    const scores = Object.values(s.quizScores || {});
    const subscores = Object.values(s.subtopicQuizScores || {});

    if (totalScore === 0) {
      totalScore = subscores.reduce((a, b) => a + (b.score || 0), 0) +
                   scores.reduce((a, b) => a + (b.score || 0), 0);
      quizCount = subscores.length + scores.length;
    }

    // Evaluate badges from progress if not pre-computed
    if (badgesCount === 0 || unlockedBadges.length === 0) {
      const peerProgress: StudentProgress = {
        completedLessons: s.completedLessons || [],
        trafficLights: s.trafficLights || {},
        subtopicQuizScores: s.subtopicQuizScores || {},
        quizScores: s.quizScores || {},
        topicConfidence: s.topicConfidence || {},
        savedNotes: {},
        currentStreak: s.streakDays || 1,
        featuredBadgeId: s.featuredBadgeId
      };
      const peerBadgeEval = evaluateStudentBadges(peerProgress, {
        id: s.studentId,
        name: s.name,
        email: s.email,
        role: 'student',
        tier: s.tier || 'Extended'
      });
      badgesCount = Math.max(badgesCount, peerBadgeEval.unlockedBadges.length);
      unlockedBadges = peerBadgeEval.unlockedBadges;
      if (xp === 0) xp = peerBadgeEval.totalXP;
    }

    if (isCurrent) {
      xp = Math.max(xp, currentStudentEvaluatedXP);
      streak = Math.max(streak, currentStudentStreak);
      badgesCount = Math.max(badgesCount, currentStudentBadgesCount);
      decks = Math.max(decks, currentStudentDecks);
      totalScore = Math.max(totalScore, currentStudentTotalQuizScore);
      quizCount = Math.max(quizCount, currentStudentQuizzesCount);
      unlockedBadges = currentStudentUnlockedBadges;
    } else if (xp === 0) {
      xp = (decks * 50) + (totalScore * 15) + (streak * 25) + (badgesCount * 120);
    }

    const featuredBadgeDef = BADGE_DEFINITIONS.find(b => b.id === (s.featuredBadgeId || 'streak_1'));

    studentMap.set(s.studentId, {
      studentId: s.studentId,
      name: isCurrent && currentUser ? currentUser.name : (s.name || 'Student'),
      email: s.email,
      tier: s.tier || 'Extended',
      xp,
      rank: 0,
      streakDays: streak,
      completedLessonsCount: decks,
      badgesCount,
      totalQuizScore: totalScore,
      quizzesCompletedCount: quizCount,
      unlockedBadges,
      featuredBadge: featuredBadgeDef as any,
      // PRIVACY INVARIANT: only provide quizAccuracy for current user
      quizAccuracy: isCurrent ? currentStudentAccuracy : undefined,
      lastActive: s.lastActive || new Date().toISOString(),
      isCurrentUser: isCurrent
    });
  }

  // Ensure current user is included in the map
  if (currentUser && !studentMap.has(currentUser.id)) {
    const featuredBadgeDef = BADGE_DEFINITIONS.find(b => b.id === (currentProgress?.featuredBadgeId || 'streak_1'));
    studentMap.set(currentUser.id, {
      studentId: currentUser.id,
      name: currentUser.name,
      email: currentUser.email,
      tier: currentUser.tier,
      xp: currentStudentEvaluatedXP,
      rank: 0,
      streakDays: currentStudentStreak,
      completedLessonsCount: currentStudentDecks,
      badgesCount: currentStudentBadgesCount,
      totalQuizScore: currentStudentTotalQuizScore,
      quizzesCompletedCount: currentStudentQuizzesCount,
      unlockedBadges: currentStudentUnlockedBadges,
      featuredBadge: featuredBadgeDef as any,
      quizAccuracy: currentStudentAccuracy,
      lastActive: new Date().toISOString(),
      isCurrentUser: true
    });
  }

  // Populate cohort classmates if class size is small (< 5) to keep class competition exciting
  if (studentMap.size < 6) {
    COHORT_PEERS.forEach((peer, i) => {
      const peerId = `cohort_classmate_${i}`;
      if (!studentMap.has(peerId)) {
        const featuredBadgeDef = BADGE_DEFINITIONS.find(b => b.id === peer.featuredBadgeId);
        const unlockedBadges = resolvePeerBadges(peer);
        studentMap.set(peerId, {
          studentId: peerId,
          name: peer.name,
          email: peer.email,
          tier: peer.tier,
          xp: calculatePeerXP(peer),
          rank: 0,
          streakDays: peer.streak,
          completedLessonsCount: peer.decks,
          badgesCount: peer.badgesCount,
          totalQuizScore: peer.totalQuizScore,
          quizzesCompletedCount: peer.quizzesPassed,
          unlockedBadges,
          featuredBadge: featuredBadgeDef as any,
          // PRIVACY INVARIANT: NO quiz average for other students
          quizAccuracy: undefined,
          lastActive: new Date(Date.now() - (i * 3600000 * 3)).toISOString(),
          isCurrentUser: false
        });
      }
    });
  }

  // Sort primarily by totalQuizScore, then by badgesCount, then by xp
  const sorted = Array.from(studentMap.values()).sort((a, b) => {
    const scoreA = a.totalQuizScore || 0;
    const scoreB = b.totalQuizScore || 0;
    if (scoreB !== scoreA) return scoreB - scoreA;
    if (b.badgesCount !== a.badgesCount) return b.badgesCount - a.badgesCount;
    return b.xp - a.xp;
  });

  // Assign ranks
  sorted.forEach((entry, index) => {
    entry.rank = index + 1;
  });

  const currentUserEntry = sorted.find(s => s.isCurrentUser);
  const topThree = sorted.slice(0, 3);

  // Compute class totals
  const totalClassBadges = sorted.reduce((sum, s) => sum + s.badgesCount, 0);
  const totalClassQuizScore = sorted.reduce((sum, s) => sum + (s.totalQuizScore || 0), 0);

  return {
    classItem: classInfo || DEFAULT_CLASS_ITEM,
    entries: sorted,
    currentUserEntry,
    topThree,
    totalClassBadges,
    totalClassQuizScore,
    totalCompetitors: sorted.length
  };
}

/**
 * Legacy compatibility adapter for StudentLeaderboardView
 */
export async function getStudentLeaderboard(
  scope: 'class' | 'global',
  currentClassId?: string,
  currentUser?: UserProfile | null,
  currentProgress?: StudentProgress
): Promise<{
  entries: LeaderboardEntry[];
  currentUserEntry?: LeaderboardEntry;
  topThree: LeaderboardEntry[];
  totalCompetitors: number;
}> {
  const result = await getClassStudentLeaderboard(
    currentClassId || DEFAULT_CLASS_ITEM.id,
    currentUser,
    currentProgress
  );

  return {
    entries: result.entries,
    currentUserEntry: result.currentUserEntry,
    topThree: result.topThree,
    totalCompetitors: result.totalCompetitors
  };
}
