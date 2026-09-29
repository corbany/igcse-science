import { PastExamPaper } from '../../types';

export const saveMyExamsReproductionPaper: PastExamPaper = {
  id: 'sme-bio-reproduction',
  code: 'Save My Exams - Biology 0653',
  title: 'Biology Mini Test - Reproduction',
  series: 'Topic Test',
  paperNumber: 'Paper 4',
  tier: 'Extended',
  duration: '35 minutes',
  totalMarks: 25,
  description: '8 structured examination questions on reproduction in plants and humans, pathogens, and immunity with official diagrams, interactive labeling, and mark scheme.',
  examinerNotes: [
    'Drawings of biological specimens must use clear, unbroken pencil outlines without unnecessary shading.',
    'Carefully distinguish between anther (male: produces pollen) and stigma (female: receives pollen).',
    'Fertilisation in humans occurs specifically in the oviduct (fallopian tube), not the uterus.'
  ],
  questions: [
    {
      id: 'sme-q1',
      number: 1,
      questionText: 'Which of the following is the most accurate definition of a drug?',
      options: [
        { key: 'A', text: 'An addictive or harmful substance.' },
        { key: 'B', text: 'A substance taken into the body that modifies or affects chemical reactions.' },
        { key: 'C', text: 'A plant extract that kills bacteria.' },
        { key: 'D', text: 'A substance that produces side effects as well as therapeutic effects.' }
      ],
      correctAnswer: 'B',
      marks: 1,
      explanation: 'By biological definition in Cambridge IGCSE, a drug is any substance taken into the body that modifies or affects chemical reactions in the body.',
      examinerComment: 'Option A is incorrect because not all drugs are harmful or addictive (e.g. antibiotics). Option B is the exact syllabus definition.',
      subject: 'biology',
      syllabusCode: 'B10.1',
      questionType: 'mcq'
    },
    {
      id: 'sme-q2',
      number: 2,
      questionText: 'Which statement best describes the mode of action of antibiotics?',
      options: [
        { key: 'A', text: 'Antibiotics interfere with cellular processes in bacteria, killing them immediately.' },
        { key: 'B', text: 'Antibiotics interfere with cellular processes in all microorganisms, killing them immediately.' },
        { key: 'C', text: 'Antibiotics interfere with cellular processes in bacteria, killing them or preventing their reproduction.' },
        { key: 'D', text: 'Antibiotics interfere with cellular processes in all microorganisms, killing them or preventing their reproduction.' }
      ],
      correctAnswer: 'C',
      marks: 1,
      explanation: 'Antibiotics target bacterial cell structures (such as peptidoglycan cell wall synthesis or bacterial ribosomes). They do not kill all microorganisms (they have zero effect on viruses).',
      examinerComment: 'Crucial distinction: antibiotics only target bacteria, not viruses or all microorganisms.',
      subject: 'biology',
      syllabusCode: 'B10.1',
      questionType: 'mcq'
    },
    {
      id: 'sme-q3',
      number: 3,
      questionText: 'The diagram shows a flower where pollen has landed on the stigma and a pollen tube has grown down into the ovary to fertilise the ovule.\nWhich of these processes have taken place?',
      options: [
        { key: 'A', text: 'pollination: no | fertilisation: no' },
        { key: 'B', text: 'pollination: no | fertilisation: yes' },
        { key: 'C', text: 'pollination: yes | fertilisation: yes' },
        { key: 'D', text: 'pollination: yes | fertilisation: no' }
      ],
      correctAnswer: 'C',
      marks: 1,
      explanation: 'Pollen grains have landed on the stigma (pollination = yes) and the pollen tube has reached the ovule with nuclei fusion (fertilisation = yes).',
      subject: 'biology',
      syllabusCode: 'B14.1',
      questionType: 'mcq',
      diagramSvg: `<svg viewBox="0 0 300 240" class="w-full max-w-xs mx-auto stroke-slate-200 fill-none" stroke-width="2">
        <!-- Petals -->
        <path d="M 150 210 C 100 190 40 140 50 70 C 60 20 120 40 150 90 C 180 40 240 20 250 70 C 260 140 200 190 150 210 Z" fill="#1e293b" stroke="#38bdf8"/>
        <!-- Sepals -->
        <path d="M 130 210 C 90 200 60 220 50 210 M 170 210 C 210 200 240 220 250 210" stroke="#10b981"/>
        <!-- Carpel/Pistil -->
        <path d="M 144 190 C 130 170 130 140 144 110 L 144 50 C 144 42 156 42 156 50 L 156 110 C 170 140 170 170 156 190 Z" fill="#0f172a" stroke="#fbbf24"/>
        <!-- Stigma lobes -->
        <circle cx="146" cy="46" r="5" fill="#f59e0b"/>
        <circle cx="154" cy="46" r="5" fill="#f59e0b"/>
        <!-- Ovules inside ovary -->
        <ellipse cx="145" cy="155" rx="6" ry="10" fill="#10b981"/>
        <ellipse cx="155" cy="155" rx="6" ry="10" fill="#10b981"/>
        <!-- Pollen Tube shown entering -->
        <path d="M 150 48 Q 148 100 150 145" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="3,2"/>
      </svg>`,
      diagramCaption: 'Fig. 3.1: Section through flower showing pollen germination on stigma and pollen tube growth to ovary.'
    },
    {
      id: 'sme-q4',
      number: 4,
      questionText: 'The diagrams show 3 different species of pollen grains as they appear under a microscope (all to the same scale):\nSpecies 1: Medium smooth grains\nSpecies 2: Large grains with spiky/hooked outer walls\nSpecies 3: Very small, numerous light smooth grains\nWhich pollen grains are involved in insect pollination?',
      options: [
        { key: 'A', text: '1 and 2' },
        { key: 'B', text: '2 and 3' },
        { key: 'C', text: '2 only' },
        { key: 'D', text: 'All of them' }
      ],
      correctAnswer: 'C',
      marks: 1,
      explanation: 'Insect-pollinated flowers produce large, heavy, sticky or spiky pollen grains (Species 2) that easily adhere to an insect\'s body. Wind-pollinated species produce small, light, smooth grains in vast quantities (Species 3).',
      subject: 'biology',
      syllabusCode: 'B14.1',
      questionType: 'mcq'
    },
    {
      id: 'sme-q5',
      number: 5,
      questionText: 'The diagram shows the female reproductive system.\nAfter ejaculation, which pathway will the male gamete (sperm) take to fuse with the egg?',
      options: [
        { key: 'A', text: 'Vagina → cervix → uterus → oviduct' },
        { key: 'B', text: 'Ovary → oviduct → uterus → cervix' },
        { key: 'C', text: 'Vagina → uterus → cervix → oviduct' },
        { key: 'D', text: 'Ovary → uterus → cervix → vagina' }
      ],
      correctAnswer: 'A',
      marks: 1,
      explanation: 'Sperm is deposited in the vagina, swims through the cervix into the muscular uterus, and travels up into the oviduct (fallopian tube) where fertilisation occurs.',
      subject: 'biology',
      syllabusCode: 'B15.1',
      questionType: 'mcq',
      diagramSvg: `<svg viewBox="0 0 320 180" class="w-full max-w-sm mx-auto stroke-slate-200 fill-none" stroke-width="2">
        <!-- Uterus & Oviducts -->
        <path d="M 160 140 L 160 115 C 150 110 120 100 120 70 C 120 40 80 40 45 45 C 35 48 35 65 50 65 C 80 65 100 65 110 85 C 115 95 135 110 145 115 L 145 140 Z" fill="#334155"/>
        <path d="M 160 140 L 160 115 C 170 110 200 100 200 70 C 200 40 240 40 275 45 C 285 48 285 65 270 65 C 240 65 220 65 210 85 C 205 95 185 110 175 115 L 175 140 Z" fill="#334155"/>
        <!-- Ovaries -->
        <circle cx="45" cy="75" r="14" fill="#fbbf24" stroke="#f59e0b"/>
        <circle cx="275" cy="75" r="14" fill="#fbbf24" stroke="#f59e0b"/>
        <!-- Cervix & Vagina -->
        <rect x="150" y="115" width="20" height="15" fill="#e2e8f0" stroke="#94a3b8"/>
        <rect x="146" y="130" width="28" height="30" fill="#475569" stroke="#64748b"/>
        <text x="160" y="172" fill="#38bdf8" font-size="10" text-anchor="middle">Vagina (entry)</text>
      </svg>`,
      diagramCaption: 'Fig. 5.1: Female human reproductive anatomy showing vagina, cervix, uterus, and oviducts.'
    },
    {
      id: 'sme-q6',
      number: 6,
      questionText: 'The diagram shows the menstrual cycle. This is a 28-day cycle with menstruation occurring on days 1 to 4.\nWhich time range in the cycle is the woman most likely to get pregnant?',
      options: [
        { key: 'A', text: 'Days 1 - 4' },
        { key: 'B', text: 'Days 7 - 10' },
        { key: 'C', text: 'Days 13 - 16' },
        { key: 'D', text: 'Days 20 - 23' }
      ],
      correctAnswer: 'C',
      marks: 1,
      explanation: 'Ovulation (the release of an egg from the ovary) occurs around Day 14 (typically Days 13-16). This is the fertile window when fertilization is most probable.',
      subject: 'biology',
      syllabusCode: 'B15.1',
      questionType: 'mcq'
    },
    {
      id: 'sme-q7',
      number: 7,
      questionText: 'Fig. 1 shows a section through a flower with structures labelled E, F, G, H, J.\n(a)(i) Match each structure with the letter from Fig. 1:\n- Petal: J\n- Anther: F\n- Stigma: H\n- A male part of the flower: F\n- A part of the carpel: G (or H)\n- Sepal: E\n(a)(ii) Describe the evidence that this flower is pollinated by insects.',
      correctAnswer: 'J, F, H, F, G, E',
      marks: 8,
      explanation: 'Structure E = Sepal; F = Anther; G = Ovary (part of carpel); H = Stigma; J = Petal. Evidence for insect pollination: 1) Large and prominent petals (J) to visually attract insects; 2) Stigma (H) and anthers (F) are enclosed enclosed inside the petals rather than hanging loosely outside.',
      examinerComment: 'Candidates frequently confused anther and stigma. Credit for insect pollination requires explicit reference to visible flower structures (petals inside vs outside).',
      subject: 'biology',
      syllabusCode: 'B14.1',
      questionType: 'structured',
      diagramSvg: `<svg viewBox="0 0 340 280" class="w-full max-w-sm mx-auto stroke-slate-200 fill-none" stroke-width="2">
        <!-- Labels E, F, G, H, J -->
        <text x="50" y="30" fill="#f87171" font-size="14" font-weight="bold">E</text>
        <text x="105" y="30" fill="#f87171" font-size="14" font-weight="bold">F</text>
        <text x="160" y="30" fill="#f87171" font-size="14" font-weight="bold">G</text>
        <text x="215" y="30" fill="#f87171" font-size="14" font-weight="bold">H</text>
        <text x="270" y="30" fill="#f87171" font-size="14" font-weight="bold">J</text>
        <!-- Lines from letters -->
        <line x1="55" y1="35" x2="80" y2="180" stroke="#94a3b8" stroke-dasharray="3,2"/>
        <line x1="110" y1="35" x2="115" y2="95" stroke="#94a3b8" stroke-dasharray="3,2"/>
        <line x1="165" y1="35" x2="165" y2="185" stroke="#94a3b8" stroke-dasharray="3,2"/>
        <line x1="220" y1="35" x2="190" y2="95" stroke="#94a3b8" stroke-dasharray="3,2"/>
        <line x1="275" y1="35" x2="245" y2="110" stroke="#94a3b8" stroke-dasharray="3,2"/>
        <!-- Petal J -->
        <path d="M 170 230 C 120 200 40 150 70 80 C 90 40 150 60 170 120 C 190 60 250 40 270 80 C 300 150 220 200 170 230 Z" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
        <!-- Sepal E -->
        <path d="M 150 230 C 110 220 70 240 60 220 C 60 200 120 180 150 210" fill="#064e3b" stroke="#10b981"/>
        <!-- Carpel: Ovary G, Style, Stigma H -->
        <path d="M 160 220 C 145 200 145 170 162 140 L 162 95 C 160 90 175 90 175 95 L 175 140 C 195 170 195 200 180 220 Z" fill="#0f172a" stroke="#fbbf24"/>
        <!-- Stamen: Filament and Anther F -->
        <path d="M 155 220 C 130 180 110 130 115 95" stroke="#f43f5e" stroke-width="2"/>
        <ellipse cx="115" cy="95" rx="7" ry="10" fill="#f43f5e"/>
        <path d="M 185 220 C 210 180 230 130 225 95" stroke="#f43f5e" stroke-width="2"/>
        <ellipse cx="225" cy="95" rx="7" ry="10" fill="#f43f5e"/>
      </svg>`,
      diagramCaption: 'Fig. 7.1: Longitudinal section through an insect-pollinated dicotyledonous flower.'
    },
    {
      id: 'sme-q8',
      number: 8,
      questionText: '(a) Define the term sexual reproduction. [3 marks]\n(b) Fig. 1 shows the male reproductive system with labels A to D. Complete Table 1:\n- A (Rectum/Anus): transports faeces\n- B (Testis): produces/transports sperm\n- C (Urethra): transports sperm and urine\n- D (Ureter/Bladder duct): transports urine\n(c) State the function of the scrotum. [1 mark]',
      correctAnswer: 'fusion of gamete nuclei | testis, urethra, ureter | temperature regulation',
      marks: 8,
      explanation: '(a) Sexual reproduction: process involving the fusion of the nuclei of two gametes (male and female) to form a zygote, producing offspring that are genetically dissimilar from each other and parents.\n(b) A = rectum; B = testis; C = urethra; D = ureter.\n(c) Function of scrotum: holds testes outside the abdominal cavity to keep them at a slightly cooler temperature (2-3°C lower than body temp) necessary for healthy sperm production.',
      examinerComment: 'Award 3 marks in (a) for: 1) fusion of nuclei; 2) two gametes/sex cells; 3) genetically different offspring. In (c), do not just say "protects testes" without mentioning temperature control.',
      subject: 'biology',
      syllabusCode: 'B15.1',
      questionType: 'structured',
      diagramSvg: `<svg viewBox="0 0 320 220" class="w-full max-w-sm mx-auto stroke-slate-200 fill-none" stroke-width="2">
        <!-- Bladder -->
        <ellipse cx="180" cy="80" rx="25" ry="20" fill="#1e293b" stroke="#94a3b8"/>
        <!-- Ureter D -->
        <path d="M 190 30 L 190 65" stroke="#38bdf8" stroke-width="2.5"/>
        <text x="195" y="40" fill="#38bdf8" font-size="12" font-weight="bold">D</text>
        <!-- Testis B & Scrotum -->
        <ellipse cx="150" cy="180" rx="14" ry="18" fill="#334155" stroke="#fbbf24"/>
        <path d="M 130 160 C 130 210 170 210 170 160" stroke="#cbd5e1" stroke-width="1.5"/>
        <text x="175" y="190" fill="#fbbf24" font-size="12" font-weight="bold">B (Testis)</text>
        <!-- Penis & Urethra C -->
        <path d="M 155 165 C 155 110 165 105 185 115 L 140 145 L 130 190" stroke="#f43f5e" stroke-width="2"/>
        <text x="110" y="165" fill="#f43f5e" font-size="12" font-weight="bold">C (Urethra)</text>
        <!-- Rectum A -->
        <path d="M 215 115 C 235 130 230 170 215 180" stroke="#a855f7" stroke-width="2"/>
        <text x="240" y="145" fill="#a855f7" font-size="12" font-weight="bold">A (Rectum)</text>
      </svg>`,
      diagramCaption: 'Fig. 8.1: Side view diagram of the male human reproductive and urinary systems.'
    }
  ]
};
