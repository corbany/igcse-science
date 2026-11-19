import { QuizQuestion } from '../types';

const GENETICS_REGEX = /\b(monohybrid|punnett|allele|alleles|heterozygous|homozygous|genotypes?|phenotypes?|codominan\w*|pedigree (chart|diagram)|karyotype|dihybrid|mendel\w*|inheritance|inherited traits?|gene pool|genetic variation|genetic engineering|genetic disorder|genetic cross)\b/i;
const MOLE_CALC_REGEX = /\b(molar mass|avogadro|dm3 of gas at rtp|mol\/dm3|number of moles|how many moles|calculate.*moles?|(calculate|find|what is).{0,25}relative (formula|molecular|atomic) mass)\b/i;
const ISOTOPE_AND_RADIOACTIVITY_REGEX = /\b(isotop\w*|radioisotop\w*|radioactiv\w*|half[- ]?life|alpha[- ]?(particle|decay|radiation|rays?)|beta[- ]?(particle|decay|radiation|rays?)|(alpha|beta)\s*(?:,|and|or)\s*gamma|geiger|becquerel|background radiation|nuclear fission|fission reactor|uranium|plutonium|radon|carbon-14|cobalt-60|iodine-131)\b/i;
const OUT_OF_0653_PHYSICS_CHEM_BIO_REGEX = /\b(snell'?s law|critical angle|total internal reflection|sin\s*\(?i\)?\s*\/\s*sin\s*\(?r\)?|sin\s*c\s*=|fleming'?s|step[- ]up transformer|step[- ]down transformer|solenoid electromagnet|anaerobic respiration|lactic acid|oxygen debt|haber process|eutrophication|algal bloom)\b/i;

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

  // Enforce Cambridge 0653 syllabus exclusions (no isotopes, radioactivity/half-life, genetics, mole/Mr math, Snell's law/TIR, etc.)
  const fullText = `${combined} ${q.explanation || ''}`;
  if (GENETICS_REGEX.test(fullText)) return false;
  if (MOLE_CALC_REGEX.test(combined)) return false;
  if (ISOTOPE_AND_RADIOACTIVITY_REGEX.test(fullText)) return false;
  if (OUT_OF_0653_PHYSICS_CHEM_BIO_REGEX.test(fullText)) return false;

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

/**
 * Determines whether a question tests Supplement (Extended-only) Cambridge 0653 content.
 * Questions returning `false` belong to the Core syllabus (and therefore appear in BOTH Core and Extended quizzes).
 * Questions returning `true` belong exclusively to Extended/Supplement content and must be excluded from Core quizzes.
 * Note: Checks question stem + correct answer + explanation (excluding distractors) so Core questions
 * that mention an Extended term as a wrong distractor are not falsely filtered out.
 */
export function isExtendedOnlyQuestion(q: QuizQuestion | null | undefined): boolean {
  if (!q) return false;

  // Paper 1 Core exam questions are strictly Core-only
  if (q.id && /m26-12-/i.test(q.id)) return false;

  if (q.tier === 'Extended') return true;

  const ref = (q.syllabusRef || '').toUpperCase().trim();
  const topic = (q.topicCode || ref.split('.')[0] || '').toUpperCase().trim();

  // Subtopic B3.3 (Active Transport) is Supplement-only in Cambridge 0653
  if (ref === 'B3.3') return true;

  const correctOpt =
    Array.isArray(q.options) && typeof q.correctIndex === 'number' && q.correctIndex >= 0 && q.correctIndex < q.options.length
      ? String(q.options[q.correctIndex] || '')
      : '';
  const txt = `${q.question || ''} ${correctOpt} ${q.explanation || ''}`;

  // Biology Supplement-only objectives
  if (topic === 'B2' && /(μm|micrometre|micrometer|1000\s*μm|mm\s*(?:to|into|→)\s*μm)/i.test(txt)) return true;
  if (topic === 'B3' && /\b(water potential|plasmolys\w*|turgor pressure|flaccid|active transport|carrier protein)\b/i.test(txt)) return true;
  if (topic === 'B5' && /\b(lock and key|active site|enzyme-substrate complex|denatur\w*|complementary shape)\b/i.test(txt)) return true;
  if (topic === 'B6' && /(6\s*co[₂2]\s*\+\s*6\s*h[₂2]o|c[₆6]h[₁1][₂2]o[₆6]|\blimiting factor\b|\bhydrogencarbonate indicator\b)/i.test(txt)) return true;
  if (topic === 'B7' && /\b(amylase|protease|pepsin|lipase|emulsif\w*)\b/i.test(txt)) return true;
  if (topic === 'B8' && /\b(potometer)\b/i.test(txt)) return true;
  if (topic === 'B9' && /\b(blood clotting|fibrin|one-way valve|heart valves prevent)\b/i.test(txt)) return true;
  if (topic === 'B10' && /\b(active immunity|memory cells?|vaccin\w*|antibod(?:y|ies)|protein coat)\b/i.test(txt)) return true;
  if (topic === 'B11' && /\b(one cell thick|short diffusion (?:distance|pathway))\b/i.test(txt)) return true;
  if (topic === 'B12' && /(c[₆6]h[₁1][₂2]o[₆6]\s*\+\s*6\s*o[₂2])/i.test(txt)) return true;
  if (topic === 'B13' && /\b(mrsa|natural selection)\b/i.test(txt)) return true;
  if (topic === 'B14' && /\b(wind-pollinated|feathery stigma|pendulous)\b/i.test(txt)) return true;
  if (topic === 'B15' && /\b(overharvesting|foreign species|introduced species)\b/i.test(txt)) return true;

  // Chemistry Supplement-only objectives
  if (topic === 'C1' && /\b(boyle'?s law|p1\s*[×*]\s*v1)\b/i.test(txt)) return true;
  if (topic === 'C2' && /\b(giant ionic lattice|intermolecular forces?|ch[₃3]oh|c[₂2]h[₄4]|double covalent|triple covalent)\b/i.test(txt)) return true;
  if (topic === 'C3' && /\b(ionic equation|net ionic|deduce.*formula.*ion charges)\b/i.test(txt)) return true;
  if (topic === 'C4' && /\b(molten binary|predict.*products)\b/i.test(txt)) return true;
  if (topic === 'C5' && /\b(activation energy|\bea\b|reaction pathway diagram|bond breaking|bond making|enthalpy change|Δh)\b/i.test(txt)) return true;
  if (topic === 'C6' && /\b(collision theory|frequency of collisions|colliding particles|oxidation number)\b/i.test(txt)) return true;
  if (topic === 'C7' && /\b(insoluble salt.*precipitation|precipitation.*insoluble salt)\b/i.test(txt)) return true;
  if (topic === 'C8' && /\b(halogen displacement|displaces iodide|displaces bromide|transition elements?|transition metals?)\b/i.test(txt)) return true;
  if (topic === 'C9' && /\b(different[- ]sized atoms|disrupt.*regular layers|layers.*cannot slide|fe[₂2]o[₃3]\s*\+\s*3co)\b/i.test(txt)) return true;
  if (topic === 'C10' && /\b(outgoing infrared|absorb.*infrared|greenhouse effect.*infrared)\b/i.test(txt)) return true;
  if (topic === 'C11' && /\b(catalytic cracking|\bcracking\b|addition reaction|addition polymerisation|poly\(?ethene\)?)\b/i.test(txt)) return true;

  // Physics Supplement-only objectives
  if (
    topic === 'P1' &&
    /(a\s*=\s*\(?v\s*[-−]\s*u\)?\s*\/\s*t|m\/s²|calculate.*acceleration|area under.*speed-time|f\s*=\s*m\s*[×*]?\s*a|newton'?s second law|kinetic energy|ek\s*=|gravitational potential energy|δep\s*=|ep\s*=|efficiency\s*=|useful energy output)/i.test(txt)
  ) {
    return true;
  }
  if (topic === 'P2' && /\b(delocalised.*electrons|free mobile electrons|leslie cube|earth'?s? radiation balance)\b/i.test(txt)) return true;
  if (topic === 'P3' && /\b(compressions?\s+and\s+rarefactions?|ultrasound|perpendicular to.*propagation|parallel to.*propagation|travels fastest in solids)\b/i.test(txt)) return true;
  if (topic === 'P4' && /(1\/r\s*=|parallel resistors?|total resistance less than|proportional to.*length.*cross-sectional)/i.test(txt)) return true;
  if (topic === 'P5' && /\b(orbital speed|2πr\s*\/\s*t|nuclear fusion|hydrogen nuclei fuse|red-?shift|receding galaxies)\b/i.test(txt)) return true;

  return false;
}

/**
 * Returns true if the question is eligible for the selected curriculum tier:
 * - 'Core': ONLY Core syllabus questions (`!isExtendedOnlyQuestion(q)`).
 * - 'Extended': Entire syllabus — BOTH Core and Extended questions (`true`).
 */
export function matchesExamTier(q: QuizQuestion | null | undefined, tier?: string): boolean {
  if (!q) return false;
  const norm = (tier || 'Extended').trim().toLowerCase();
  if (norm === 'core' || norm === 'foundation') {
    return !isExtendedOnlyQuestion(q);
  }
  return true;
}

