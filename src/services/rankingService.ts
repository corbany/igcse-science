import { LeaderboardEntry, UserProfile, StudentProgress, StudentBadge } from '../types';
import { 
  fetchStudentsInClass, 
  ClassStudentItem, 
  fetchStudentEnrolledClasses, 
  fetchClassesByInstructor,
  ClassItem 
} from './firestoreService';
import { evaluateStudentBadges, BADGE_DEFINITIONS } from './badgeService';



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
  const emptyResult: ClassLeaderboardData = {
    classItem: undefined,
    entries: [],
    currentUserEntry: undefined,
    topThree: [],
    totalClassBadges: 0,
    totalClassQuizScore: 0,
    totalCompetitors: 0
  };

  // If no class is specified, return empty data
  if (!classId || !classId.trim()) {
    return emptyResult;
  }

  let rawStudents: ClassStudentItem[] = [];
  let classInfo: ClassItem | undefined;

  try {
    if (currentUser?.id) {
      if (currentUser.role === 'instructor') {
        const classes = await fetchClassesByInstructor(currentUser.id, currentUser.email);
        classInfo = classes.find(c => c.id === classId);
      } else {
        const classes = await fetchStudentEnrolledClasses(currentUser.id);
        classInfo = classes.find(c => c.id === classId);

        // Student visibility restriction:
        // Students can ONLY view the leaderboard of a class they are officially enrolled in.
        if (currentUser.role === 'student' && !classInfo) {
          return emptyResult;
        }
      }
    }
    rawStudents = await fetchStudentsInClass(classId);
  } catch (err) {
    console.warn('Error fetching class students for leaderboard:', err);
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

    // Calculate cumulative total quiz score monotonically
    const subtopicScores = Object.values(currentProgress.subtopicQuizScores || {});
    const quizScores = Object.values(currentProgress.quizScores || {});
    const practiceLengthScores = Object.values(currentProgress.practiceQuizByLength || {});
    const lengthDates = new Set(practiceLengthScores.map(r => r?.date).filter(Boolean));
    const unrecordedMainScores = quizScores.filter(q => q && !lengthDates.has(q.date));

    const legacySum =
      subtopicScores.reduce((acc, s) => acc + (s?.score || 0), 0) +
      quizScores.reduce((acc, q) => acc + (q?.score || 0), 0);
    const cumulativeWithLengthSum =
      subtopicScores.reduce((acc, s) => acc + (s?.score || 0), 0) +
      practiceLengthScores.reduce((acc, r) => acc + (r?.score || 0), 0) +
      unrecordedMainScores.reduce((acc, q) => acc + (q?.score || 0), 0);

    currentStudentTotalQuizScore = Math.max(
      currentProgress.cumulativeQuizPoints || 0,
      legacySum,
      cumulativeWithLengthSum
    );
    currentStudentQuizzesCount = Math.max(
      currentProgress.cumulativeQuizzesCount || 0,
      subtopicScores.length + quizScores.length,
      subtopicScores.length + practiceLengthScores.length + unrecordedMainScores.length
    );
    currentStudentEvaluatedXP = Math.max(currentStudentEvaluatedXP, currentProgress.bestTotalXP || 0);

    // Private accuracy for current user's eyes only
    const allPercentages = [
      ...subtopicScores.map(q => q.percentage),
      ...practiceLengthScores.map(r => r.percentage),
      ...unrecordedMainScores.map(q => Math.round((q.score / (q.total || 1)) * 100))
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

    const streak = Math.max(s.streakDays || 1, 1);
    const completedSet = new Set([
      ...(s.completedLessons || []),
      ...Object.keys(s.trafficLights || {}),
      ...Object.keys(s.subtopicQuizScores || {})
    ]);
    let decks = Math.max(s.completedLessonsCount || 0, completedSet.size);

    // Compute cumulative total quiz score monotonically
    const scores = Object.values(s.quizScores || {});
    const subscores = Object.values(s.subtopicQuizScores || {});
    const lengthScores = Object.values(s.practiceQuizByLength || {});
    const peerLengthDates = new Set(lengthScores.map(r => r?.date).filter(Boolean));
    const peerUnrecordedMain = scores.filter(q => q && !peerLengthDates.has(q.date));

    const peerLegacySum =
      subscores.reduce((a, b) => a + (b?.score || 0), 0) +
      scores.reduce((a, b) => a + (b?.score || 0), 0);
    const peerLengthSum =
      subscores.reduce((a, b) => a + (b?.score || 0), 0) +
      lengthScores.reduce((a, b) => a + (b?.score || 0), 0) +
      peerUnrecordedMain.reduce((a, b) => a + (b?.score || 0), 0);

    let totalScore = Math.max(
      s.totalQuizScore || 0,
      s.cumulativeQuizPoints || 0,
      peerLegacySum,
      peerLengthSum
    );
    let quizCount = Math.max(
      s.quizzesCompletedCount || 0,
      s.cumulativeQuizzesCount || 0,
      subscores.length + scores.length,
      subscores.length + lengthScores.length + peerUnrecordedMain.length
    );

    // Evaluate badges & XP monotonically for classmate
    const peerProgress: StudentProgress = {
      completedLessons: s.completedLessons || [],
      slidesReadBySubtopic: s.slidesReadBySubtopic || {},
      trafficLights: s.trafficLights || {},
      subtopicQuizScores: s.subtopicQuizScores || {},
      quizScores: s.quizScores || {},
      practiceQuizByLength: s.practiceQuizByLength || {},
      topicConfidence: s.topicConfidence || {},
      savedNotes: {},
      currentStreak: streak,
      earnedBadges: s.earnedBadges,
      featuredBadgeId: s.featuredBadgeId,
      cumulativeQuizPoints: totalScore,
      cumulativeQuizzesCount: quizCount,
      bestTotalXP: s.bestTotalXP || s.xp || 0
    };
    const peerBadgeEval = evaluateStudentBadges(peerProgress, {
      id: s.studentId,
      name: s.name,
      email: s.email,
      role: 'student',
      tier: s.tier || 'Extended'
    });

    let badgesCount = Math.max(s.badgesCount || 0, s.earnedBadges?.length || 0, peerBadgeEval.unlockedBadges.length);
    let unlockedBadges: StudentBadge[] = peerBadgeEval.unlockedBadges;
    let xp = Math.max(s.xp || 0, s.bestTotalXP || 0, peerBadgeEval.totalXP);
    let finalStreak = streak;

    if (isCurrent) {
      xp = Math.max(xp, currentStudentEvaluatedXP);
      finalStreak = Math.max(finalStreak, currentStudentStreak);
      badgesCount = Math.max(badgesCount, currentStudentBadgesCount);
      decks = Math.max(decks, currentStudentDecks);
      totalScore = Math.max(totalScore, currentStudentTotalQuizScore);
      quizCount = Math.max(quizCount, currentStudentQuizzesCount);
      if (currentStudentUnlockedBadges.length >= unlockedBadges.length) {
        unlockedBadges = currentStudentUnlockedBadges;
      }
    }

    const featuredBadgeDef = BADGE_DEFINITIONS.find(b => b.id === (s.featuredBadgeId || 'streak_1'));

    studentMap.set(s.studentId, {
      studentId: s.studentId,
      name: isCurrent && currentUser ? currentUser.name : (s.name || 'Student'),
      email: s.email,
      tier: s.tier || 'Extended',
      xp,
      rank: 0,
      streakDays: finalStreak,
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
    classItem: classInfo || undefined,
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
    currentClassId || '',
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
