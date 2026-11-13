import { QuizQuestion } from '../types';
import { predefinedSubtopicQuizzes } from './predefinedSubtopicQuizzes';
import { selectFreshSubtopicQuiz, buildComprehensiveSubtopicPool, getSeenQuestionIds, clearSeenQuestionHistory } from './expandedSubtopicQuestions';
import { getSubtopicQuiz, getSubtopicPoolSize } from './subtopicQuestionEngine';

export { predefinedSubtopicQuizzes, selectFreshSubtopicQuiz, buildComprehensiveSubtopicPool, getSeenQuestionIds, clearSeenQuestionHistory };

/**
 * Randomizes the 4 options for each question so the correct answer is
 * distributed across A (0), B (1), C (2), and D (3) rather than all being set to A.
 * Enforces a balanced distribution across the 10 questions.
 */
export function randomizeQuizQuestions(questions: QuizQuestion[]): QuizQuestion[] {
  if (!questions || questions.length === 0) return [];

  const targetIndices = [0, 1, 2, 3, 0, 1, 2, 3, Math.floor(Math.random() * 4), Math.floor(Math.random() * 4)];
  for (let i = targetIndices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [targetIndices[i], targetIndices[j]] = [targetIndices[j], targetIndices[i]];
  }

  return questions.map((q, idx) => {
    const targetCorrectIdx = targetIndices[idx % targetIndices.length];
    const correctOpt = q.options[q.correctIndex] ?? q.options[0];
    const distractors = q.options.filter((_, i) => i !== q.correctIndex);

    const shuffledDistractors = [...distractors];
    for (let i = shuffledDistractors.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledDistractors[i], shuffledDistractors[j]] = [shuffledDistractors[j], shuffledDistractors[i]];
    }

    const newOptions: string[] = [];
    let d = 0;
    for (let pos = 0; pos < 4; pos++) {
      if (pos === targetCorrectIdx) {
        newOptions.push(correctOpt);
      } else {
        newOptions.push(shuffledDistractors[d++] || '');
      }
    }

    return {
      ...q,
      options: newOptions,
      correctIndex: targetCorrectIdx
    };
  });
}

export function deduplicateQuizQuestions(questions: QuizQuestion[]): QuizQuestion[] {
  if (!questions || questions.length === 0) return [];
  const seen = new Set<string>();
  const unique: QuizQuestion[] = [];
  for (const q of questions) {
    if (!q || !q.question) continue;
    const norm = q.question.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
    if (norm.length >= 10 && !seen.has(norm)) {
      seen.add(norm);
      unique.push(q);
    }
  }
  return unique;
}

/**
 * Returns the total number of unique, syllabus-aligned questions available in the pool for a subtopic.
 */
export function getSubtopicQuestionPoolSize(subtopicCode: string): number {
  return getSubtopicPoolSize(subtopicCode);
}

/**
 * Returns a complete, 10-question quiz tailored specifically to the given subtopic.
 */
export function getQuizForSubtopic(
  subtopicCode: string,
  options?: {
    attemptNumber?: number;
    count?: number;
    resetHistory?: boolean;
  }
): QuizQuestion[] {
  return getSubtopicQuiz(subtopicCode, options);
}
