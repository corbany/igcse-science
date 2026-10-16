import { StudentBadge, StudentProgress, UserProfile, BadgeCategory, BadgeRarity, ScienceSubject } from '../types';
import { ALL_SYLLABUS_TOPICS } from './quizService';
import { allSubtopicsData } from '../data/subtopicSlidesData';

// Map of topic codes to their subtopics count
const TOPIC_SUBTOPIC_COUNTS: Record<string, number> = {};
allSubtopicsData.forEach(s => {
  TOPIC_SUBTOPIC_COUNTS[s.topicCode] = (TOPIC_SUBTOPIC_COUNTS[s.topicCode] || 0) + 1;
});

/**
 * Master List of System Badges
 */
export const BADGE_DEFINITIONS: Omit<StudentBadge, 'unlockedAt' | 'progress'>[] = [
  // -------------------------------------------------------------
  // STREAK BADGES
  // -------------------------------------------------------------
  {
    id: 'streak_1',
    title: 'First Ignition',
    description: 'Began your revision journey with your first active study day',
    category: 'streak',
    rarity: 'bronze',
    icon: 'flame',
    xpReward: 50
  },
  {
    id: 'streak_3',
    title: 'Consistent Spark',
    description: 'Maintained an unbroken 3-day revision streak',
    category: 'streak',
    rarity: 'silver',
    icon: 'flame',
    xpReward: 120
  },
  {
    id: 'streak_5',
    title: 'Study Momentum',
    description: 'Achieved a 5-day active revision streak',
    category: 'streak',
    rarity: 'silver',
    icon: 'flame',
    xpReward: 200
  },
  {
    id: 'streak_7',
    title: 'Weekly Master',
    description: 'Completed a full 7-day study streak without missing a day',
    category: 'streak',
    rarity: 'gold',
    icon: 'flame',
    xpReward: 350
  },
  {
    id: 'streak_14',
    title: 'Fortnight Titan',
    description: 'Unstoppable! Reached an unbroken 14-day study streak',
    category: 'streak',
    rarity: 'gold',
    icon: 'flame',
    xpReward: 600
  },
  {
    id: 'streak_30',
    title: 'Cambridge Legend',
    description: 'Dedication supreme: Maintained a 30-day revision streak',
    category: 'streak',
    rarity: 'diamond',
    icon: 'flame',
    xpReward: 1200
  },

  // -------------------------------------------------------------
  // QUIZ HIGH SCORE BADGES
  // -------------------------------------------------------------
  {
    id: 'quiz_first_green',
    title: 'Green Light Ace',
    description: 'Scored 80% or above on your first subtopic or practice quiz',
    category: 'quiz',
    rarity: 'bronze',
    icon: 'target',
    xpReward: 75
  },
  {
    id: 'quiz_sharpshooter',
    title: 'Quiz Sharpshooter',
    description: 'Earned a Green Light (>=80%) on 5 different quizzes',
    category: 'quiz',
    rarity: 'silver',
    icon: 'award',
    xpReward: 200
  },
  {
    id: 'quiz_centurion',
    title: 'Quiz Centurion',
    description: 'Mastered 15 quizzes with an outstanding score of 80% or higher',
    category: 'quiz',
    rarity: 'gold',
    icon: 'medal',
    xpReward: 450
  },
  {
    id: 'quiz_perfectionist',
    title: 'Flawless Execution',
    description: 'Scored a perfect 100% on any practice or subtopic quiz',
    category: 'quiz',
    rarity: 'gold',
    icon: 'crown',
    xpReward: 250
  },
  {
    id: 'quiz_triple_hundred',
    title: 'Triple 100% Crown',
    description: 'Achieved a perfect 100% score on 3 different quizzes',
    category: 'quiz',
    rarity: 'gold',
    icon: 'crown',
    xpReward: 500
  },
  {
    id: 'quiz_cambridge_distinction',
    title: 'Cambridge A* Candidate',
    description: 'Scored 90%+ on at least 5 quizzes, demonstrating top-tier exam mastery',
    category: 'quiz',
    rarity: 'diamond',
    icon: 'sparkles',
    xpReward: 800
  },

  // -------------------------------------------------------------
  // LESSON SLIDES MILESTONES
  // -------------------------------------------------------------
  {
    id: 'slides_10',
    title: 'Curious Reader',
    description: 'Read and rated confidence for 10 interactive syllabus slide decks',
    category: 'milestone',
    rarity: 'bronze',
    icon: 'book',
    xpReward: 100
  },
  {
    id: 'slides_30',
    title: 'Syllabus Researcher',
    description: 'Covered 30 slide decks across Biology, Chemistry, and Physics',
    category: 'milestone',
    rarity: 'silver',
    icon: 'book',
    xpReward: 250
  },
  {
    id: 'slides_60',
    title: 'Curriculum Heavyweight',
    description: 'Studied over 60 syllabus slide decks with self-assessments',
    category: 'milestone',
    rarity: 'gold',
    icon: 'award',
    xpReward: 500
  },
  {
    id: 'slides_106',
    title: '0653 Completionist',
    description: 'Mastered all 106 official Cambridge 0653 syllabus slide decks',
    category: 'milestone',
    rarity: 'diamond',
    icon: 'trophy',
    xpReward: 1500
  },

  // -------------------------------------------------------------
  // GRANDMASTER MULTI-MODULE BADGES
  // -------------------------------------------------------------
  {
    id: 'master_biology',
    title: 'Biology Grandmaster',
    description: 'Completed all 16 Biology topic modules (B1 through B16)',
    category: 'topic_module',
    rarity: 'diamond',
    icon: 'dna',
    xpReward: 1000,
    subject: 'biology'
  },
  {
    id: 'master_chemistry',
    title: 'Chemistry Grandmaster',
    description: 'Completed all 12 Chemistry topic modules (C1 through C12)',
    category: 'topic_module',
    rarity: 'diamond',
    icon: 'flask',
    xpReward: 1000,
    subject: 'chemistry'
  },
  {
    id: 'master_physics',
    title: 'Physics Grandmaster',
    description: 'Completed all 5 Physics topic modules (P1 through P5)',
    category: 'topic_module',
    rarity: 'diamond',
    icon: 'atom',
    xpReward: 1000,
    subject: 'physics'
  },
  {
    id: 'master_all',
    title: 'Cambridge Tri-Science Virtuoso',
    description: 'Mastered every single topic module across the entire IGCSE 0653 syllabus',
    category: 'topic_module',
    rarity: 'diamond',
    icon: 'crown',
    xpReward: 2500
  },

  // -------------------------------------------------------------
  // TOPIC MODULE MEDALS (All 33 Topics)
  // -------------------------------------------------------------
  ...ALL_SYLLABUS_TOPICS.map(topic => {
    let rarity: BadgeRarity = 'silver';
    if (['B2', 'B9', 'C2', 'C9', 'P1', 'P4'].includes(topic.code)) {
      rarity = 'gold'; // Major high-weight topics
    }
    return {
      id: `topic_${topic.code}`,
      title: `${topic.code}: ${topic.title}`,
      description: `Completed and mastered all slide decks and quizzes for module ${topic.code}`,
      category: 'topic_module' as BadgeCategory,
      rarity,
      icon: topic.subject === 'biology' ? 'dna' : topic.subject === 'chemistry' ? 'flask' : 'zap',
      xpReward: 250,
      topicCode: topic.code,
      subject: topic.subject
    };
  })
];

/**
 * Calculates current study streak based on last active dates
 */
export function calculateStreak(progress: StudentProgress): {
  currentStreak: number;
  longestStreak: number;
  lastStreakDate: string;
  activeDates: string[];
} {
  const today = new Date().toISOString().split('T')[0];
  const yesterdayDate = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  const existingDates = new Set(progress.activeDates || []);
  existingDates.add(today);
  const activeDates = Array.from(existingDates).sort();

  let currentStreak = progress.currentStreak || 0;
  let longestStreak = progress.longestStreak || 0;
  const lastDate = progress.lastStreakDate;

  if (!lastDate) {
    currentStreak = 1;
  } else if (lastDate === today) {
    // Already counted today
    currentStreak = Math.max(1, currentStreak);
  } else if (lastDate === yesterdayDate) {
    // Consecutive day
    currentStreak += 1;
  } else {
    // Gap day
    currentStreak = 1;
  }

  longestStreak = Math.max(longestStreak, currentStreak);

  return {
    currentStreak,
    longestStreak,
    lastStreakDate: today,
    activeDates
  };
}

/**
 * Evaluates student topic completion across all 33 topics
 */
export function getTopicCompletionMap(progress: StudentProgress): Record<string, { completed: number; total: number; isComplete: boolean }> {
  // Combine all completed decks
  const completedDecks = new Set<string>([
    ...(progress.completedLessons || []),
    ...Object.keys(progress.trafficLights || {}),
    ...Object.keys(progress.subtopicQuizScores || {})
  ]);

  const map: Record<string, { completed: number; total: number; isComplete: boolean }> = {};

  for (const topic of ALL_SYLLABUS_TOPICS) {
    const topicSubtopics = allSubtopicsData.filter(s => s.topicCode === topic.code);
    const total = topicSubtopics.length || TOPIC_SUBTOPIC_COUNTS[topic.code] || 1;
    
    let completedCount = 0;
    for (const sub of topicSubtopics) {
      if (completedDecks.has(sub.subtopicCode)) {
        completedCount++;
      }
    }

    map[topic.code] = {
      completed: completedCount,
      total,
      isComplete: completedCount >= total && total > 0
    };
  }

  return map;
}

/**
 * Evaluates all system badges against the current student progress
 */
export function evaluateStudentBadges(
  progress: StudentProgress,
  user?: UserProfile | null
): {
  allBadges: StudentBadge[];
  unlockedBadges: StudentBadge[];
  lockedBadges: StudentBadge[];
  totalXP: number;
} {
  const streakInfo = calculateStreak(progress);
  const topicMap = getTopicCompletionMap(progress);

  // Completed slide decks count
  const completedDecksSet = new Set<string>([
    ...(progress.completedLessons || []),
    ...Object.keys(progress.trafficLights || {}),
    ...Object.keys(progress.subtopicQuizScores || {})
  ]);
  const slideDeckCount = completedDecksSet.size;

  // Quiz analytics
  const subtopicResults = Object.values(progress.subtopicQuizScores || {});
  const practiceResults = Object.values(progress.quizScores || {}).map(q => ({
    percentage: Math.round((q.score / (q.total || 1)) * 100),
    score: q.score,
    total: q.total
  }));

  const allPercentages = [
    ...subtopicResults.map(r => r.percentage),
    ...practiceResults.map(r => r.percentage)
  ];

  const greenLightQuizzesCount = allPercentages.filter(p => p >= 80).length;
  const perfectQuizzesCount = allPercentages.filter(p => p >= 100).length;
  const highDistinctionQuizzesCount = allPercentages.filter(p => p >= 90).length;

  // Check previously earned badges to preserve unlock timestamp
  const earnedMap = new Map<string, string>();
  if (progress.earnedBadges) {
    progress.earnedBadges.forEach(b => earnedMap.set(b.badgeId, b.unlockedAt));
  }

  const nowIso = new Date().toISOString();

  // Evaluate each badge
  const evaluatedBadges: StudentBadge[] = BADGE_DEFINITIONS.map(badge => {
    let isUnlocked = false;
    let currentVal = 0;
    let maxVal = 1;
    let progressLabel = '';

    // STREAK BADGES
    if (badge.category === 'streak') {
      const targetDays = parseInt(badge.id.replace('streak_', ''), 10) || 1;
      maxVal = targetDays;
      currentVal = Math.min(maxVal, streakInfo.currentStreak);
      progressLabel = `${currentVal} / ${maxVal} Days`;
      isUnlocked = streakInfo.currentStreak >= targetDays;
    }

    // QUIZ BADGES
    else if (badge.category === 'quiz') {
      if (badge.id === 'quiz_first_green') {
        maxVal = 1;
        currentVal = greenLightQuizzesCount >= 1 ? 1 : 0;
        progressLabel = `${currentVal} / 1 Green Light (80%+)`;
        isUnlocked = greenLightQuizzesCount >= 1;
      } else if (badge.id === 'quiz_sharpshooter') {
        maxVal = 5;
        currentVal = Math.min(5, greenLightQuizzesCount);
        progressLabel = `${currentVal} / 5 Green Light Quizzes`;
        isUnlocked = greenLightQuizzesCount >= 5;
      } else if (badge.id === 'quiz_centurion') {
        maxVal = 15;
        currentVal = Math.min(15, greenLightQuizzesCount);
        progressLabel = `${currentVal} / 15 Green Light Quizzes`;
        isUnlocked = greenLightQuizzesCount >= 15;
      } else if (badge.id === 'quiz_perfectionist') {
        maxVal = 1;
        currentVal = perfectQuizzesCount >= 1 ? 1 : 0;
        progressLabel = `${currentVal} / 1 Perfect 100% Quiz`;
        isUnlocked = perfectQuizzesCount >= 1;
      } else if (badge.id === 'quiz_triple_hundred') {
        maxVal = 3;
        currentVal = Math.min(3, perfectQuizzesCount);
        progressLabel = `${currentVal} / 3 Perfect 100% Quizzes`;
        isUnlocked = perfectQuizzesCount >= 3;
      } else if (badge.id === 'quiz_cambridge_distinction') {
        maxVal = 5;
        currentVal = Math.min(5, highDistinctionQuizzesCount);
        progressLabel = `${currentVal} / 5 Quizzes at 90%+`;
        isUnlocked = highDistinctionQuizzesCount >= 5;
      }
    }

    // SLIDE MILESTONE BADGES
    else if (badge.category === 'milestone') {
      const targetDecks = parseInt(badge.id.replace('slides_', ''), 10) || 10;
      maxVal = targetDecks;
      currentVal = Math.min(maxVal, slideDeckCount);
      progressLabel = `${currentVal} / ${maxVal} Slides Read`;
      isUnlocked = slideDeckCount >= targetDecks;
    }

    // TOPIC MODULE BADGES
    else if (badge.category === 'topic_module') {
      if (badge.id === 'master_biology') {
        const bioTopics = ALL_SYLLABUS_TOPICS.filter(t => t.subject === 'biology');
        const completedBio = bioTopics.filter(t => topicMap[t.code]?.isComplete).length;
        maxVal = bioTopics.length;
        currentVal = completedBio;
        progressLabel = `${completedBio} / ${maxVal} Biology Modules`;
        isUnlocked = completedBio === maxVal && maxVal > 0;
      } else if (badge.id === 'master_chemistry') {
        const chemTopics = ALL_SYLLABUS_TOPICS.filter(t => t.subject === 'chemistry');
        const completedChem = chemTopics.filter(t => topicMap[t.code]?.isComplete).length;
        maxVal = chemTopics.length;
        currentVal = completedChem;
        progressLabel = `${completedChem} / ${maxVal} Chemistry Modules`;
        isUnlocked = completedChem === maxVal && maxVal > 0;
      } else if (badge.id === 'master_physics') {
        const physTopics = ALL_SYLLABUS_TOPICS.filter(t => t.subject === 'physics');
        const completedPhys = physTopics.filter(t => topicMap[t.code]?.isComplete).length;
        maxVal = physTopics.length;
        currentVal = completedPhys;
        progressLabel = `${completedPhys} / ${maxVal} Physics Modules`;
        isUnlocked = completedPhys === maxVal && maxVal > 0;
      } else if (badge.id === 'master_all') {
        const totalTopics = ALL_SYLLABUS_TOPICS.length;
        const totalCompleted = ALL_SYLLABUS_TOPICS.filter(t => topicMap[t.code]?.isComplete).length;
        maxVal = totalTopics;
        currentVal = totalCompleted;
        progressLabel = `${totalCompleted} / ${maxVal} Total Modules`;
        isUnlocked = totalCompleted === maxVal && maxVal > 0;
      } else if (badge.topicCode) {
        const tInfo = topicMap[badge.topicCode] || { completed: 0, total: 1, isComplete: false };
        maxVal = tInfo.total;
        currentVal = tInfo.completed;
        progressLabel = `${currentVal} / ${maxVal} Subtopics`;
        isUnlocked = tInfo.isComplete;
      }
    }

    const previouslyUnlockedAt = earnedMap.get(badge.id);

    return {
      ...badge,
      unlockedAt: isUnlocked ? (previouslyUnlockedAt || nowIso) : undefined,
      progress: {
        current: currentVal,
        max: maxVal,
        label: progressLabel
      }
    };
  });

  const unlockedBadges = evaluatedBadges.filter(b => !!b.unlockedAt);
  const lockedBadges = evaluatedBadges.filter(b => !b.unlockedAt);

  // Compute Total XP
  let totalXP = 0;
  // XP from slide decks (50 XP each)
  totalXP += slideDeckCount * 50;
  // XP from quizzes (100 XP per Green light, +50 bonus for 100%)
  totalXP += greenLightQuizzesCount * 100 + perfectQuizzesCount * 50;
  // XP from streaks (25 XP per streak day)
  totalXP += (streakInfo.currentStreak || 1) * 25;
  // XP from unlocked badges
  unlockedBadges.forEach(b => {
    totalXP += b.xpReward;
  });

  return {
    allBadges: evaluatedBadges,
    unlockedBadges,
    lockedBadges,
    totalXP
  };
}

export interface StudentLevelInfo {
  level: number;
  title: string;
  currentXP: number;
  nextLevelXP: number;
  progressPercent: number;
}

/**
 * Calculates level and title from total XP
 */
export function calculateStudentLevel(xp: number): StudentLevelInfo {
  const LEVELS = [
    { level: 1, title: 'Novice Scholar', minXP: 0, nextXP: 300 },
    { level: 2, title: 'Science Explorer', minXP: 300, nextXP: 700 },
    { level: 3, title: 'Lab Apprentice', minXP: 700, nextXP: 1200 },
    { level: 4, title: 'Junior Researcher', minXP: 1200, nextXP: 1800 },
    { level: 5, title: 'Cambridge Scholar', minXP: 1800, nextXP: 2600 },
    { level: 6, title: 'Senior Analyst', minXP: 2600, nextXP: 3600 },
    { level: 7, title: 'Distinction Fellow', minXP: 3600, nextXP: 4800 },
    { level: 8, title: 'Grandmaster Scientist', minXP: 4800, nextXP: 6300 },
    { level: 9, title: 'Syllabus Laureate', minXP: 6300, nextXP: 8000 },
    { level: 10, title: 'Cambridge 0653 Titan', minXP: 8000, nextXP: 10000 }
  ];

  let currentLevel = LEVELS[0];
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXP) {
      currentLevel = LEVELS[i];
      break;
    }
  }

  const range = currentLevel.nextXP - currentLevel.minXP;
  const inLevel = Math.max(0, xp - currentLevel.minXP);
  const progressPercent = Math.min(100, Math.round((inLevel / range) * 100));

  return {
    level: currentLevel.level,
    title: currentLevel.title,
    currentXP: xp,
    nextLevelXP: currentLevel.nextXP,
    progressPercent
  };
}
