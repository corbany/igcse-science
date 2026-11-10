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
