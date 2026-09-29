import { LessonSlideDeck } from '../types';
import { initialSubtopicDecks } from './googleSlidesRegistry';

export const lessonSlideDecks: LessonSlideDeck[] = initialSubtopicDecks.map(deck => ({
  id: deck.id,
  topicCode: deck.topicCode,
  subtopicCode: deck.subtopicCode,
  title: deck.title,
  subject: deck.subject,
  tier: deck.tier,
  durationMinutes: deck.durationMinutes,
  googleSlidesUrl: deck.googleSlidesUrl,
  googleSlidesEmbedUrl: deck.googleSlidesEmbedUrl,
  keyTakeaways: deck.syllabusSummary,
  slides: []
}));
