import { QuizQuestion } from '../types';

const GENETICS_REGEX = /\b(monohybrid|punnett|allele|alleles|heterozygous|homozygous|genotypes?|phenotypes?|codominan\w*|pedigree (chart|diagram)|karyotype|dihybrid|mendel\w*|inheritance|inherited traits?|gene pool|genetic variation|genetic engineering|genetic disorder|genetic cross)\b/i;
const MOLE_CALC_REGEX = /\b(molar mass|avogadro|dm3 of gas at rtp|mol\/dm3|number of moles|how many moles|calculate.*moles?)\b/i;

const NONSENSE_PATTERNS: RegExp[] = [
  /specifically describes/i,
  /\[prior knowledge check\]/i,
  /learning objective:/i,
  /\boperates as\b.*\bwithout mass transfer\b/i,
  /\bdecrease spontaneously\b/i,
  /\bindependent of concentration\b/i,
  /\bunaffected by changes in temperature, pH\b/i,
  /\bnon-living mineral crystals with zero energy\b/i,
  /\banaerobic pathway mechanisms independent\b/i,
  /\bactivation energy is unattainable\b/i,
  /\bvacuole storage\b/i,
  /\bprokaryotes without involvement of enzymes\b/i,
  /\bactivation energy destroys covalent bonds\b/i,
  /\binsoluble ionic precipitate with zero\b/i,
  /\bdecreases inversely proportional to the cube\b/i,
  /\baccelerates without limit\b/i,
  /\bthermodynamic conservation principles in cells\b/i,
  /\belectric current through the component decreases linearly when the potential difference is doubled\b/i,
  /\bdefined as:\s*".*example\s*\d/i,
  /\bthe role of\s+(example\s*\d+|convert units|note|hint|summary|key point|recap|task|objective)\b/i,
];

const IMPERATIVE_OBJECTIVE_OPTION_REGEX = /^(describe|identify|explain|state that|outline|define|list|compare|recall)\s+(the|use of|associated|organs|how|why|that)\b/i;

function normalizeOptionForComparison(opt: string): string {
  const s = opt.trim().toLowerCase()
    .replace(/^[a-d][\)\.\:]\s+/i, '')
    .replace(/[.,;:!?'"`]+$/g, '')
    .replace(/\s+/g, ' ');
  return s;
}

function singularizeSimple(s: string): string {
  // Collapse simple plural duplicates like "Solid" vs "solids", "ion" vs "ions"
  if (s.length > 4 && !s.includes(' ') && s.endsWith('s') && !s.endsWith('ss') && !s.endsWith('us') && !s.endsWith('is')) {
    return s.slice(0, -1);
  }
  return s;
}

/**
 * Validates that a quiz question is clear, unambiguous, free of broken auto-generation artifacts,
 * free of duplicate or singular/plural equivalent options, and strictly compliant with Cambridge 0653.
 */
export function isValidQuizQuestion(q: QuizQuestion | null | undefined): boolean {
  if (!q || typeof q.question !== 'string' || !Array.isArray(q.options) || q.options.length !== 4) {
    return false;
  }

  const stem = q.question.trim();
  if (stem.length < 15) return false;

  // Reject nonsensical / auto-generated placeholder stems or distractors
  const combined = `${stem} ${q.options.join(' ')}`;
  for (const pat of NONSENSE_PATTERNS) {
    if (pat.test(combined)) return false;
  }

  // Reject syllabus objective command-verb strings dumped verbatim as options
  if (q.options.some(opt => IMPERATIVE_OBJECTIVE_OPTION_REGEX.test(opt.trim()))) {
    return false;
  }

  // Reject bogus placeholder option labels like "Example 2", "Convert units", "Option A"
  for (const opt of q.options) {
    const trimmed = opt.trim();
    if (!trimmed) return false;
    if (/^(example\s*\d+|convert units|option\s*[a-d]|alternative\s*\d+)$/i.test(trimmed)) {
      return false;
    }
  }

  // Reject truncated slide quote definitions (e.g., `defined as: "... fixed shap"?`)
  if (/defined as:\s*"[^"]{100,}"\??$/i.test(stem)) {
    const quoteMatch = stem.match(/defined as:\s*"([^"]+)"/i);
    if (quoteMatch && quoteMatch[1]) {
      const inner = quoteMatch[1].trim();
      // Reject if sliced mid-word or at exact buffer cap (~140 chars without terminal punctuation)
      if (inner.length >= 135 && !/[.!?]$/.test(inner)) {
        return false;
      }
    }
  }

  // Validate 4 distinct options (also catching case/punctuation/simple plural duplicates like "Solid" vs "solids")
  const normOpts = q.options.map(normalizeOptionForComparison);
  if (new Set(normOpts).size < 4) return false;

  const singularOpts = normOpts.map(singularizeSimple);
  if (new Set(singularOpts).size < 4) return false;

  // Reject tautology where a short non-numeric correct answer is literally quoted in the stem
  const correctIdx = typeof q.correctIndex === 'number' && q.correctIndex >= 0 && q.correctIndex <= 3 ? q.correctIndex : 0;
  const correctOpt = (q.options[correctIdx] || '').trim().toLowerCase();
  if (correctOpt.length > 3 && correctOpt.length < 40 && !/^\d/.test(correctOpt)) {
    if (stem.toLowerCase().includes(`"${correctOpt}"`) || stem.toLowerCase().includes(`'${correctOpt}'`)) {
      return false;
    }
  }

  // Enforce Cambridge 0653 syllabus exclusions (no genetics / Punnett squares, no mole concentration math)
  const fullText = `${combined} ${q.explanation || ''}`;
  if (GENETICS_REGEX.test(fullText)) return false;
  if (MOLE_CALC_REGEX.test(combined)) return false;

  return true;
}

export function sanitizeQuizQuestions(questions: QuizQuestion[]): QuizQuestion[] {
  const seen = new Set<string>();
  const valid: QuizQuestion[] = [];
  for (const q of questions) {
    if (!isValidQuizQuestion(q)) continue;
    const norm = q.question.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
    if (norm.length >= 15 && !seen.has(norm)) {
      seen.add(norm);
      valid.push(q);
    }
  }
  return valid;
}
