import { PastExamPaper } from '../../types';

export const modelGutPracticalPack: PastExamPaper = {
  id: 'model-gut-practical-pack',
  code: 'Cambridge Teaching Pack',
  title: 'Digestion: The Model Gut Practical Pack (Worksheets A-K)',
  series: 'Investigation Pack',
  paperNumber: 'Paper 6',
  tier: 'Practical',
  duration: '50 minutes',
  totalMarks: 30,
  description: 'Authentic Cambridge Classroom Practical Pack on the Visking Tubing Model Gut with interactive laboratory safety spotting, apparatus design, results tables, and starch-amylase analysis.',
  examinerNotes: [
    'Always tie hair back and wear eye protection when heating chemicals.',
    'Iodine test requires only room temperature; Benedict\'s test requires a boiling water bath (>80°C).',
    'Visking tubing represents the partially permeable wall of the ileum (small intestine).'
  ],
  questions: [
    {
      id: 'gut-q1',
      number: 1,
      questionText: 'Worksheet B: Laboratory Safety in Digestion Practical\nIdentify 3 safety hazards in the laboratory scene and write the appropriate precaution:\n1. Open flame unattended with hair down -> Precaution: Tie long hair back and turn Bunsen burner to safety flame when not in use.\n2. Boiling tube pointed towards a student -> Precaution: Point mouth of test tube away from yourself and others.\n3. Broken glass left on bench -> Precaution: Report immediately to teacher and dispose in glass bin, not general waste.',
      correctAnswer: 'hair tied back | mouth of test tube pointed away | broken glass in glass bin',
      marks: 6,
      explanation: 'Laboratory regulations require eye protection, tying back loose hair or clothing, keeping test tube mouths oriented away from all individuals during heating, and immediate containment of broken glassware.',
      subject: 'biology',
      syllabusCode: 'B7.1',
      questionType: 'structured'
    },
    {
      id: 'gut-q2',
      number: 2,
      questionText: 'Worksheet E: Experimental Setup & Biological Analogy\n(a) What biological organ does the Visking tubing represent?\n(b) What liquid in the human body does the distilled water in the boiling tube represent?\n(c) Why was starch unable to pass through the Visking tubing, but glucose was able to pass through?',
      correctAnswer: 'Small intestine (ileum) | Blood / blood plasma | Starch is a large insoluble polymer; glucose is a small soluble monomer that can pass through microscopic pores.',
      marks: 6,
      explanation: 'Visking tubing has microscopic pores functioning as a selectively permeable membrane (modelling the small intestine wall). Water outside models the blood circulation. Starch molecules are too large to fit through pores, whereas glucose molecules are small enough to diffuse through.',
      subject: 'biology',
      syllabusCode: 'B7.1',
      questionType: 'structured',
      diagramSvg: `<svg viewBox="0 0 300 220" class="w-full max-w-xs mx-auto stroke-slate-200 fill-none" stroke-width="2">
        <!-- Boiling tube -->
        <rect x="110" y="30" width="80" height="160" rx="20" fill="#0f172a" stroke="#94a3b8" stroke-width="2"/>
        <!-- Water line (blood) -->
        <rect x="111" y="70" width="78" height="110" rx="15" fill="#0284c7" opacity="0.3"/>
        <text x="50" y="110" fill="#38bdf8" font-size="11">Water (Blood)</text>
        <line x1="110" y1="110" x2="80" y2="110" stroke="#38bdf8"/>
        <!-- Visking Tubing -->
        <rect x="130" y="50" width="40" height="120" rx="10" fill="#f59e0b" opacity="0.4" stroke="#d97706" stroke-dasharray="3,2"/>
        <text x="245" y="80" fill="#fbbf24" font-size="11">Visking Tubing</text>
        <line x1="170" y1="80" x2="200" y2="80" stroke="#fbbf24"/>
        <text x="245" y="95" fill="#94a3b8" font-size="9">(Small intestine)</text>
        <!-- Starch & Glucose labels -->
        <circle cx="140" cy="100" r="4" fill="#ef4444"/>
        <circle cx="150" cy="110" r="4" fill="#ef4444"/>
        <text x="245" y="140" fill="#ef4444" font-size="10">● Starch (trapped)</text>
        <circle cx="120" cy="140" r="2" fill="#10b981"/>
        <circle cx="178" cy="145" r="2" fill="#10b981"/>
        <text x="245" y="160" fill="#10b981" font-size="10">· Glucose (diffused)</text>
      </svg>`,
      diagramCaption: 'Fig. 2.1: Model gut apparatus using Visking tubing in a boiling tube of water.'
    },
    {
      id: 'gut-q3',
      number: 3,
      questionText: 'Worksheet H: Interpreting Results Over 30 Minutes\nAt 0 minutes: Water outside tests NEGATIVE for starch (remains orange-brown) and NEGATIVE for glucose (remains blue).\nAt 30 minutes with amylase added inside tubing:\n- Water outside with Iodine: Remains orange-brown.\n- Water outside with Benedict\'s + heat: Turns green, then orange/brick-red.\nExplain these observations in terms of enzyme digestion and diffusion.',
      correctAnswer: 'Amylase breaks down starch into maltose/glucose; glucose molecules are small enough to diffuse across Visking tubing into water; starch was not present outside.',
      marks: 5,
      explanation: 'Amylase digests large insoluble starch polymers into smaller reducing sugars. The sugars diffuse down their concentration gradient through the Visking membrane into the external water, yielding a positive Benedict\'s reaction.',
      subject: 'biology',
      syllabusCode: 'B5.1',
      questionType: 'structured'
    }
  ]
};
