import { PastExamPaper } from '../../types';

export const specimen2025Paper6: PastExamPaper = {
  id: 'specimen-2025-p6',
  code: '0653/06',
  title: 'Paper 6 Alternative to Practical - Specimen 2025',
  series: 'Specimen 2025',
  paperNumber: 'Paper 6',
  tier: 'Alternative to Practical',
  duration: '1 hour',
  totalMarks: 40,
  description: 'Official Cambridge IGCSE Combined Science Paper 6 with authentic practical investigation questions, apparatus diagrams, syringe readings, planning tasks, and qualitative analysis reference.',
  hasQualitativeAnalysisNotes: true,
  examinerNotes: [
    'Drawings of cut biological surfaces must be large (occupy > 50% of box), with smooth continuous outlines and NO shading.',
    'Syringe measurements must be read carefully from the bottom edge of the plunger (e.g. 1.4 cm³ remaining).',
    'In planning questions, clearly specify essential measuring apparatus, controlled variables with quantities, and how results will be processed.'
  ],
  questions: [
    {
      id: 'p6-q1',
      number: 1,
      questionText: 'A student investigates vitamin C in apple juice.\n(a) In the drawing box below, make a large drawing of the cut surface of the apple shown in Fig. 1.1.\n(b) Testing apple juice using DCPIP (dark blue solution that turns colourless with vitamin C). Syringe initial volume = 10.0 cm³.',
      correctAnswer: 'Drawing criteria: size > 50%, smooth continuous outline, no shading, 5 core sections with pips. Syringe reading = 1.4 cm³; volume added = 8.6 cm³; average = 8.6 cm³; repeats minimise random error.',
      marks: 7,
      explanation: 'Syringe reading in Fig. 1.2 is 1.4 cm³. Added volume = 10.0 - 1.4 = 8.6 cm³. Average = (8.7 + 8.5 + 8.6) / 3 = 8.6 cm³. Repeating the experiment allows anomalies to be spotted and minimises the effect of random errors.',
      examinerComment: 'Common pitfalls: Writing "so an average can be calculated" alone does not earn credit for why experiments are repeated; you must say to identify anomalies or minimise random error. Reading syringe as 1.6 rather than 1.4 was also common.',
      subject: 'biology',
      syllabusCode: 'B4.1',
      questionType: 'practical',
      diagramSvg: `<svg viewBox="0 0 320 200" class="w-full max-w-sm mx-auto stroke-slate-200 fill-none" stroke-width="2">
        <!-- Apple Cut Surface -->
        <circle cx="100" cy="100" r="75" fill="#1e293b" stroke="#f43f5e" stroke-width="3"/>
        <circle cx="100" cy="100" r="28" stroke="#fbbf24" stroke-dasharray="3,2"/>
        <!-- 5 core segments -->
        <ellipse cx="100" cy="85" rx="5" ry="10" fill="#f59e0b"/>
        <ellipse cx="88" cy="95" rx="10" ry="5" fill="#f59e0b"/>
        <ellipse cx="112" cy="95" rx="10" ry="5" fill="#f59e0b"/>
        <ellipse cx="93" cy="112" rx="7" ry="8" fill="#f59e0b"/>
        <ellipse cx="107" cy="112" rx="7" ry="8" fill="#f59e0b"/>
        <text x="100" y="192" fill="#94a3b8" font-size="11" text-anchor="middle">Fig. 1.1: Cut apple cross section</text>
        
        <!-- Syringe diagram -->
        <g transform="translate(210, 20)">
          <rect x="20" y="20" width="30" height="130" fill="#0f172a" stroke="#38bdf8"/>
          <!-- Plunger line at 1.4 -->
          <rect x="21" y="112" width="28" height="38" fill="#38bdf8" opacity="0.3"/>
          <line x1="10" y1="112" x2="60" y2="112" stroke="#f43f5e" stroke-width="2"/>
          <text x="75" y="116" fill="#f43f5e" font-size="10" font-weight="bold">1.4 cm³</text>
          <!-- Graduation marks -->
          <line x1="20" y1="30" x2="30" y2="30" stroke="#94a3b8"/><text x="12" y="33" fill="#94a3b8" font-size="8">10</text>
          <line x1="20" y1="50" x2="30" y2="50" stroke="#94a3b8"/><text x="12" y="53" fill="#94a3b8" font-size="8">8</text>
          <line x1="20" y1="70" x2="30" y2="70" stroke="#94a3b8"/><text x="12" y="73" fill="#94a3b8" font-size="8">6</text>
          <line x1="20" y1="90" x2="30" y2="90" stroke="#94a3b8"/><text x="12" y="93" fill="#94a3b8" font-size="8">4</text>
          <line x1="20" y1="110" x2="30" y2="110" stroke="#94a3b8"/><text x="12" y="113" fill="#94a3b8" font-size="8">2</text>
          <text x="35" y="170" fill="#94a3b8" font-size="10" text-anchor="middle">Fig. 1.2: Syringe</text>
        </g>
      </svg>`,
      diagramCaption: 'Fig. 1.1: Apple cut surface; Fig. 1.2: 10.0 cm³ syringe reading remaining apple juice.',
      subParts: [
        {
          id: 'p6-1-bi',
          partLabel: '(b)(i)',
          questionText: 'Record the volume of apple juice remaining in the syringe for experiment 3 in Table 1.1 (to nearest 0.1 cm³):',
          marks: 1,
          correctAnswer: '1.4',
          placeholder: 'e.g. 1.4',
          units: 'cm³'
        },
        {
          id: 'p6-1-bii',
          partLabel: '(b)(ii)',
          questionText: 'Calculate the volume of apple juice added to the DCPIP in experiment 3 (Initial 10.0 cm³ - remaining):',
          marks: 1,
          correctAnswer: '8.6',
          placeholder: 'e.g. 8.6',
          units: 'cm³'
        },
        {
          id: 'p6-1-biii',
          partLabel: '(b)(iii)',
          questionText: 'Calculate the average volume of apple juice added across Experiments 1 (8.7), 2 (8.5), and 3 (8.6):',
          marks: 1,
          correctAnswer: '8.6',
          placeholder: 'e.g. 8.6',
          units: 'cm³'
        },
        {
          id: 'p6-1-biv',
          partLabel: '(b)(iv)',
          questionText: 'Suggest why the student repeats the experiment.',
          marks: 1,
          correctAnswer: 'to minimise the effect of random error by averaging and to identify any anomalous results',
          acceptedAnswers: ['minimise random error', 'identify anomalies', 'check reliability']
        }
      ]
    },
    {
      id: 'p6-q2',
      number: 2,
      questionText: 'When an aquatic plant is exposed to light, it produces bubbles of oxygen gas.\nPlan an investigation to determine the relationship between light intensity and the volume of oxygen gas produced by the aquatic plant.\nYou are provided with: inverted test-tube, water, inverted funnel, aquatic plant in a beaker (Fig. 2.1).\nIn your plan include:\n- Additional apparatus and chemicals (lamp, metre rule, stopwatch, gas syringe / graduated measuring tube, sodium hydrogencarbonate)\n- Method and safety precautions (hot lamp / water near electricity)\n- Variables to control (water temperature, CO2 concentration, plant species)\n- How to process results (plot volume or rate against distance/light intensity).',
      correctAnswer: 'Comprehensive plan scoring across: apparatus, method, controlled variables, and data processing.',
      marks: 7,
      explanation: 'Mark scheme points: 1) Lamp/light source + metre rule/gas syringe; 2) Vary distance (e.g. 10, 20, 30, 40 cm); 3) Safety: keep liquids away from electrical plugs / do not touch hot lamp; 4) Measure volume of oxygen over fixed time (e.g. 5 mins) or count bubbles per minute; 5) Control temperature with water bath; 6) Control CO2 with dissolved sodium hydrogencarbonate; 7) Repeat at each distance and plot volume/rate vs distance or 1/d².',
      subject: 'biology',
      syllabusCode: 'B6.1',
      questionType: 'practical',
      diagramSvg: `<svg viewBox="0 0 280 220" class="w-full max-w-xs mx-auto stroke-slate-200 fill-none" stroke-width="2">
        <!-- Beaker -->
        <rect x="40" y="40" width="200" height="160" rx="4" fill="#0f172a" stroke="#94a3b8" stroke-width="2"/>
        <!-- Water line -->
        <line x1="40" y1="70" x2="240" y2="70" stroke="#38bdf8" stroke-dasharray="4,2"/>
        <!-- Inverted Funnel -->
        <path d="M 60 180 L 120 110 L 120 70 L 160 70 L 160 110 L 220 180 Z" fill="#1e293b" stroke="#cbd5e1"/>
        <!-- Inverted Test tube over stem -->
        <rect x="125" y="25" width="30" height="100" rx="6" fill="#1e293b" stroke="#38bdf8"/>
        <!-- Aquatic plant inside funnel -->
        <path d="M 140 180 C 120 150 130 130 140 120 C 150 130 160 150 140 180" stroke="#10b981" stroke-width="3"/>
        <circle cx="140" cy="80" r="3" fill="#38bdf8"/>
        <circle cx="138" cy="65" r="2.5" fill="#38bdf8"/>
        <circle cx="142" cy="50" r="3" fill="#38bdf8"/>
        <text x="140" y="210" fill="#94a3b8" font-size="10" text-anchor="middle">Fig. 2.1: Inverted funnel & test-tube apparatus</text>
      </svg>`,
      diagramCaption: 'Fig. 2.1: Apparatus for collecting oxygen gas produced by an aquatic plant.'
    },
    {
      id: 'p6-q3',
      number: 3,
      questionText: 'A student investigates the reaction between metal F and dilute sulfuric acid.\n(a)(i) Squeaky pop with lighted splint -> Gas: Hydrogen (H2)\n(a)(ii) Reaction faster with copper(II) sulfate -> Observation: More vigorous effervescence / solid dissolves faster\n(a)(iii) Addition of aqueous NaOH gives white precipitate -> Ions: Calcium (Ca²⁺) and Zinc (Zn²⁺)\n(b) Stopwatch readings for inverted cylinder gas collection (Fig. 3.2):\n- 5 cm³ gas: 0:10.04 -> 10 s\n- 25 cm³ gas: 0:56.61 -> 57 s',
      correctAnswer: 'H2 | more effervescence | Ca²⁺ and Zn²⁺ | 10 s and 57 s | IV: volume of gas, DV: time | Line of best fit | Gas syringe improvement',
      marks: 13,
      explanation: 'Pop test confirms Hydrogen. Faster reaction shows quicker bubbling. White precipitate with NaOH identifies either zinc or calcium. Stopwatch readings rounded to nearest second are 10 s and 57 s. Graph of volume vs time shows time taken increases as gas volume increases. Source of error: delay in replacing stopper or reading cylinder meniscus while bubbling. Improvement: use a gas syringe.',
      examinerComment: 'Examiners noted: Reaction times MUST be recorded to nearest whole second (10 and 57). 43.0 or 10.04 were penalized.',
      subject: 'chemistry',
      syllabusCode: 'C8.1',
      questionType: 'practical',
      subParts: [
        {
          id: 'p6-3-ai',
          partLabel: '(a)(i)',
          questionText: 'Identify the gas that "pops" with a lighted splint:',
          marks: 1,
          correctAnswer: 'hydrogen',
          acceptedAnswers: ['hydrogen', 'H2']
        },
        {
          id: 'p6-3-aii',
          partLabel: '(a)(ii)',
          questionText: 'Suggest one observation that shows the reaction is faster when copper(II) sulfate is added:',
          marks: 1,
          correctAnswer: 'fizzes more rapidly / faster rate of bubbles / solid disappears more quickly',
          acceptedAnswers: ['fizzes more', 'faster bubbling', 'more effervescence', 'disappears faster']
        },
        {
          id: 'p6-3-aiii',
          partLabel: '(a)(iii)',
          questionText: 'A white precipitate forms when aqueous sodium hydroxide is added. Suggest TWO possible identities for the cation:',
          marks: 1,
          correctAnswer: 'zinc and calcium',
          acceptedAnswers: ['zinc and calcium', 'Zn2+ and Ca2+', 'calcium and zinc']
        },
        {
          id: 'p6-3-bi',
          partLabel: '(b)(i)',
          questionText: 'Record in seconds (to nearest whole second) the time for 5 cm³ (0:10.04) and 25 cm³ (0:56.61):',
          marks: 2,
          correctAnswer: '10, 57',
          placeholder: 'e.g. 10 and 57'
        }
      ]
    },
    {
      id: 'p6-q4',
      number: 4,
      questionText: 'A student determines the density of the material used to make a metre rule.\n(a)(ii) Measuring width w and thickness t of the actual-size cross-section (Fig. 4.2):\n- w = 2.5 cm\n- t = 0.5 cm\n(a)(iii) Why is it not appropriate to record to nearest 0.01 cm? Ruler has a smallest division of 0.1 cm (1 mm precision).\n(a)(iv) Length L = 100.0 cm. Calculate volume V = L × w × t = 100.0 × 2.5 × 0.5 = 125 cm³.\n(b) Balancing method: x1 = 67.1 - 60.0 = 7.1 cm; x2 = 84.2 - 70.0 = 14.2 cm. Mass M = 5(x1 + x2) = 5(7.1 + 14.2) = 106.5 g.\n(c) Balance reads 0.1 g with nothing on it: Name = electronic balance; Error = zero / systematic error.\n(d) Calculate density ρ = M / V = 106.5 / 125 = 0.852 -> 0.85 g/cm³ (2 significant figures).',
      correctAnswer: 'w=2.5 cm, t=0.5 cm | ruler precision is 0.1 cm | V=125 cm³ | x1=7.1 cm, x2=14.2 cm, M=106.5 g | electronic balance, zero error | density = 0.85 g/cm³',
      marks: 13,
      explanation: 'Measurements from 1:1 scale diagram yield width 2.5 cm and thickness 0.5 cm. Ruler smallest division is 1 mm (0.1 cm), so recording to 0.01 cm is an unjustified false precision. Mass M = 5(7.1 + 14.2) = 106.5 g. Electronic balance displaying 0.1 g without load represents a zero error. Density = 106.5 / 125 = 0.852 g/cm³, which rounds to 0.85 g/cm³ to 2 significant figures.',
      examinerComment: 'Examiners noted: Final answer MUST be given to exactly two significant figures (0.85 g/cm³). 0.852 alone without rounding lost the precision mark.',
      subject: 'physics',
      syllabusCode: 'P1.1',
      questionType: 'practical',
      subParts: [
        {
          id: 'p6-4-aii',
          partLabel: '(a)(ii)',
          questionText: 'Record width w and thickness t to nearest 0.1 cm:',
          marks: 2,
          correctAnswer: 'w = 2.5, t = 0.5',
          placeholder: 'w in cm, t in cm'
        },
        {
          id: 'p6-4-aiv',
          partLabel: '(a)(iv)',
          questionText: 'Calculate volume V = 100.0 × 2.5 × 0.5:',
          marks: 1,
          correctAnswer: '125',
          units: 'cm³'
        },
        {
          id: 'p6-4-b',
          partLabel: '(b)',
          questionText: 'Calculate mass M = 5(7.1 + 14.2):',
          marks: 1,
          correctAnswer: '106.5',
          units: 'g'
        },
        {
          id: 'p6-4-d',
          partLabel: '(d)',
          questionText: 'Calculate density ρ = M / V to TWO significant figures with unit:',
          marks: 3,
          correctAnswer: '0.85 g/cm³',
          placeholder: 'e.g. 0.85 g/cm³'
        }
      ]
    }
  ]
};
