import { ScienceSubject } from '../types';
import { allSubtopicsData } from './subtopicSlidesData';
import { TARGET_DRIVE_FOLDER_ID, DRIVE_STORAGE_KEY } from '../services/googleDriveService';

export interface SlideDeckOption {
  id: string;
  title: string;
  deckType: 'Theory' | 'Practical' | 'Planning' | 'Calculations' | 'Revision';
  googleSlidesUrl: string;
  googleSlidesEmbedUrl: string;
  description?: string;
  slideCount?: number;
}

export interface GoogleSlideSubtopic {
  id: string;
  topicCode: string; // e.g. B1, B2, C1, P1
  subtopicCode: string; // e.g. B1.1, B2.1
  title: string;
  subject: ScienceSubject;
  tier: 'Core' | 'Supplement' | 'Core & Supplement';
  durationMinutes: number;
  googleSlidesUrl: string; // Active / selected URL
  googleSlidesEmbedUrl: string; // Active / selected embed URL
  isCustomUrl?: boolean;
  slideDecks: SlideDeckOption[]; // Multiple slide decks for this subtopic
  syllabusSummary: string[];
}

const STORAGE_KEY_MULTI_SLIDES = 'igcse_0653_multi_slides_decks';

/**
 * Robustly parses and formats any Google Slides URL or Presentation ID
 * into a clean, responsive iframe embed URL and a presentation launch URL.
 */
export function formatGoogleSlidesUrl(
  input: string,
  options?: { start?: boolean; loop?: boolean; delayMs?: number }
): { embedUrl: string; directUrl: string; isValid: boolean; presentationId: string | null } {
  if (!input || !input.trim()) {
    return { embedUrl: '', directUrl: '', isValid: false, presentationId: null };
  }

  const trimmed = input.trim();
  const start = options?.start ? 'true' : 'false';
  const loop = options?.loop ? 'true' : 'false';
  const delayMs = options?.delayMs || 3000;

  // Case 1: Published presentations: /presentation/d/e/{PUBLISHED_ID}/pub or /embed
  const publishedMatch = trimmed.match(/\/presentation\/d\/e\/([a-zA-Z0-9_-]+)/);
  if (publishedMatch) {
    const pubId = publishedMatch[1];
    return {
      embedUrl: `https://docs.google.com/presentation/d/e/${pubId}/embed?start=${start}&loop=${loop}&delayms=${delayMs}`,
      directUrl: `https://docs.google.com/presentation/d/e/${pubId}/pub?start=false`,
      isValid: true,
      presentationId: pubId
    };
  }

  // Case 2: Standard Google Slides URL: /presentation/d/{ID}
  const standardMatch = trimmed.match(/\/presentation\/d\/([a-zA-Z0-9_-]+)/);
  if (standardMatch) {
    const id = standardMatch[1];
    return {
      embedUrl: `https://docs.google.com/presentation/d/${id}/embed?start=${start}&loop=${loop}&delayms=${delayMs}`,
      directUrl: `https://docs.google.com/presentation/d/${id}/present`,
      isValid: true,
      presentationId: id
    };
  }

  // Case 3: Raw ID string (alphanumeric, typically 20-50 chars)
  if (/^[a-zA-Z0-9_-]{20,}$/.test(trimmed)) {
    return {
      embedUrl: `https://docs.google.com/presentation/d/${trimmed}/embed?start=${start}&loop=${loop}&delayms=${delayMs}`,
      directUrl: `https://docs.google.com/presentation/d/${trimmed}/present`,
      isValid: true,
      presentationId: trimmed
    };
  }

  // Case 4: Already an embed url or standard docs URL
  if (trimmed.includes('docs.google.com/presentation/')) {
    const idExtract = trimmed.split('/d/')[1]?.split('/')[0];
    if (idExtract) {
      return {
        embedUrl: `https://docs.google.com/presentation/d/${idExtract}/embed?start=${start}&loop=${loop}&delayms=${delayMs}`,
        directUrl: `https://docs.google.com/presentation/d/${idExtract}/present`,
        isValid: true,
        presentationId: idExtract
      };
    }
  }

  return { embedUrl: '', directUrl: '', isValid: false, presentationId: null };
}

// Master Cambridge IGCSE 0653 Combined Science Subtopics with Multiple Google Slides Decks
// Automatically builds from all 106 subtopics across Biology, Chemistry, and Physics (including B9.1, B9.2, B9.3, B9.4, etc.)
export const initialSubtopicDecks: GoogleSlideSubtopic[] = allSubtopicsData.map(subtopic => ({
  id: `subtopic-${subtopic.subtopicCode.toLowerCase().replace(/\./g, '-')}`,
  topicCode: subtopic.topicCode,
  subtopicCode: subtopic.subtopicCode,
  title: subtopic.title,
  subject: subtopic.subject,
  tier: subtopic.tier,
  durationMinutes: 45,
  googleSlidesUrl: subtopic.googleSlidesUrl || "",
  googleSlidesEmbedUrl: subtopic.googleSlidesEmbedUrl || "",
  slideDecks: [],
  syllabusSummary: subtopic.syllabusSummary || []
}));

/**
 * Retrieve user-customized Google Slides overrides from localStorage
 */
export function getStoredGoogleSlidesOverrides(): Record<string, string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MULTI_SLIDES);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error('Error reading google slides registry from localStorage', e);
    return {};
  }
}

/**
 * Save custom Google Slides URL for a specific subtopic or deck
 */
export function saveGoogleSlidesOverride(subtopicCodeOrDeckId: string, url: string): void {
  try {
    const current = getStoredGoogleSlidesOverrides();
    current[subtopicCodeOrDeckId.toUpperCase()] = url.trim();
    localStorage.setItem(STORAGE_KEY_MULTI_SLIDES, JSON.stringify(current));
  } catch (e) {
    console.error('Error saving google slides override', e);
  }
}

/**
 * Save multiple custom Google Slides URLs at once
 */
export function batchSaveGoogleSlidesOverrides(mapping: Record<string, string>): void {
  try {
    const current = getStoredGoogleSlidesOverrides();
    Object.entries(mapping).forEach(([key, url]) => {
      if (url && url.trim()) {
        current[key.toUpperCase()] = url.trim();
      }
    });
    localStorage.setItem(STORAGE_KEY_MULTI_SLIDES, JSON.stringify(current));
  } catch (e) {
    console.error('Error batch saving google slides overrides', e);
  }
}

/**
 * Reset all custom Google Slides overrides
 */
export function resetGoogleSlidesOverrides(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_MULTI_SLIDES);
  } catch (e) {
    console.error('Error resetting google slides overrides', e);
  }
}

/**
 * Generate batch template text for easy copy-pasting
 */
export function generateBatchTemplateText(): string {
  const overrides = getStoredGoogleSlidesOverrides();
  return initialSubtopicDecks
    .map(subtopic => {
      const existing = overrides[subtopic.subtopicCode.toUpperCase()] || subtopic.googleSlidesUrl;
      return `${subtopic.subtopicCode}: ${existing}`;
    })
    .join('\n');
}

/**
 * Merge default subtopics with user custom Google Slides overrides and synced Google Drive decks
 */
export function getActiveGoogleSlideSubtopics(): GoogleSlideSubtopic[] {
  const overrides = getStoredGoogleSlidesOverrides();

  // Read any synced Drive slide decks
  let driveMap: Record<string, SlideDeckOption[]> = {};
  try {
    const rawDrive = localStorage.getItem(DRIVE_STORAGE_KEY);
    if (rawDrive) {
      const driveItems = JSON.parse(rawDrive);
      if (Array.isArray(driveItems)) {
        for (const item of driveItems) {
          const subCode = (item.matchedSubtopicCode || item.extractedCode || 'GENERAL').toUpperCase();
          if (!driveMap[subCode]) driveMap[subCode] = [];

          const lower = (item.name || '').toLowerCase();
          let deckType: SlideDeckOption['deckType'] = 'Theory';
          if (lower.includes('practical') || lower.includes('investigation') || lower.includes('experiment')) {
            deckType = 'Practical';
          } else if (lower.includes('calc') || lower.includes('equation') || lower.includes('formula')) {
            deckType = 'Calculations';
          } else if (lower.includes('revision') || lower.includes('exam')) {
            deckType = 'Revision';
          }

          driveMap[subCode].push({
            id: `drive-${item.id}`,
            title: item.name, // EXACT title preserved without alteration
            deckType,
            googleSlidesUrl: item.googleSlidesDirectUrl || `https://docs.google.com/presentation/d/${item.id}/edit`,
            googleSlidesEmbedUrl: item.googleSlidesEmbedUrl || `https://docs.google.com/presentation/d/${item.id}/embed?start=false&loop=false&delayms=3000`,
            description: `Exact presentation from Google Drive folder ${TARGET_DRIVE_FOLDER_ID} (Lesson code: ${subCode})`
          });
        }
      }
    }
  } catch (err) {
    console.error('Failed to parse cached Drive decks in getActiveGoogleSlideSubtopics:', err);
  }

  return initialSubtopicDecks.map(subtopic => {
    // Check if subtopic has an override
    const customSubtopicUrl = overrides[subtopic.subtopicCode.toUpperCase()];
    
    // Check if individual decks have overrides
    const updatedDecks = subtopic.slideDecks.map(deck => {
      const customDeckUrl = overrides[deck.id.toUpperCase()];
      if (customDeckUrl) {
        const parsed = formatGoogleSlidesUrl(customDeckUrl);
        if (parsed.isValid) {
          return {
            ...deck,
            googleSlidesUrl: parsed.directUrl,
            googleSlidesEmbedUrl: parsed.embedUrl,
            isCustomUrl: true
          };
        }
      }
      return deck;
    });

    // Check if any Drive decks match this specific subtopic (e.g. "B9.2")
    const matchedDriveDecks = driveMap[subtopic.subtopicCode.toUpperCase()] || [];

    // Combine decks, placing exact Drive decks first!
    const combinedDecks = [...matchedDriveDecks, ...updatedDecks];

    // Priority for active URL:
    // 1. Matched Drive deck (if synced from Drive)
    // 2. Custom manual override
    // 3. Default subtopic URL
    let activeUrl = subtopic.googleSlidesUrl;
    let activeEmbed = subtopic.googleSlidesEmbedUrl;

    if (matchedDriveDecks.length > 0) {
      activeUrl = matchedDriveDecks[0].googleSlidesUrl;
      activeEmbed = matchedDriveDecks[0].googleSlidesEmbedUrl;
    } else if (customSubtopicUrl) {
      const parsed = formatGoogleSlidesUrl(customSubtopicUrl);
      if (parsed.isValid) {
        activeUrl = parsed.directUrl;
        activeEmbed = parsed.embedUrl;
      }
    }

    return {
      ...subtopic,
      googleSlidesUrl: activeUrl,
      googleSlidesEmbedUrl: activeEmbed,
      isCustomUrl: matchedDriveDecks.length > 0 || !!customSubtopicUrl,
      slideDecks: combinedDecks
    };
  });
}
