import { PastExamPaper } from '../../types';

export const octNov2025Paper42: PastExamPaper = {
  id: 'oct-nov-2025-p42',
  code: '0653/42',
  title: 'Paper 42 Theory (Extended) - Oct/Nov 2025',
  series: 'October/November 2025',
  paperNumber: 'Paper 4',
  tier: 'Extended',
  duration: '1 hour 15 minutes',
  totalMarks: 80,
  description: 'Official Cambridge IGCSE Combined Science 0653/42 Extended Theory Paper with exact leaf anatomy diagrams, bacterial cell structures, grassland food web trophic levels, titration, and electrical circuit networks.',
  examinerNotes: [
    'Distinguish clearly between palisade and spongy mesophyll cell roles in gas exchange and photosynthesis.',
    'State symbols: (s) solid, (l) liquid, (g) gas, (aq) aqueous.',
    'In circuit analysis, recall parallel resistance formula: 1/RT = 1/R1 + 1/R2.'
  ],
  questions: [
    {
      id: 'p42-q1',
      number: 1,
      questionText: 'Fig. 1.1 shows a cross-section of a dicotyledonous leaf.\n(a)(i) Identify cells B (irregular cells with air spaces): Spongy mesophyll.\n(a)(ii) Identify structure C (pore on lower epidermis): Stoma (stomata).\n(a)(iii) Identify cell E in vascular bundle that transports sucrose: Phloem sieve tube element.\n(b) Fig. 1.2 is a graph of rate of photosynthesis vs temperature (°C).\nCalculate the difference in rate between 10°C (rate = 2) and 25°C (rate = 32):\nDifference = 32 - 2 = 30 arbitrary units.\n(c) Using collision theory, explain the increase in rate from 10°C to 25°C: Enzymes and substrate molecules gain kinetic energy and move faster, colliding more frequently and with greater energy to form enzyme-substrate complexes.',
      correctAnswer: 'B = spongy mesophyll, C = stoma, E = phloem | difference = 30 | higher kinetic energy, higher collision frequency',
      marks: 9,
      explanation: 'Spongy mesophyll cells are loosely arranged to allow diffusion of carbon dioxide and oxygen. Stomata open and close to control gas exchange. Photosynthesis is enzyme-controlled; increasing temperature up to optimum increases molecular kinetic energy and successful collision frequency.',
      subject: 'biology',
      syllabusCode: 'B6.1',
      questionType: 'structured',
      diagramSvg: `<svg viewBox="0 0 320 200" class="w-full max-w-sm mx-auto stroke-slate-200 fill-none" stroke-width="2">
        <!-- Upper Cuticle & Epidermis -->
        <rect x="20" y="20" width="280" height="15" fill="#334155" stroke="#94a3b8"/>
        <!-- Palisade mesophyll -->
        <rect x="25" y="38" width="20" height="50" rx="3" fill="#065f46" stroke="#10b981"/>
        <rect x="50" y="38" width="20" height="50" rx="3" fill="#065f46" stroke="#10b981"/>
        <rect x="75" y="38" width="20" height="50" rx="3" fill="#065f46" stroke="#10b981"/>
        <!-- Spongy mesophyll B -->
        <circle cx="45" cy="115" r="14" fill="#047857" stroke="#34d399"/>
        <circle cx="85" cy="125" r="15" fill="#047857" stroke="#34d399"/>
        <text x="55" y="125" fill="#f87171" font-size="12" font-weight="bold">B</text>
        <!-- Vascular Bundle: Phloem E -->
        <circle cx="160" cy="90" r="30" fill="#1e293b" stroke="#fbbf24"/>
        <circle cx="160" cy="105" r="10" fill="#3b82f6"/>
        <text x="175" y="110" fill="#60a5fa" font-size="11" font-weight="bold">E</text>
        <!-- Lower epidermis & Stoma C -->
        <rect x="20" y="155" width="280" height="15" fill="#334155" stroke="#94a3b8"/>
        <ellipse cx="140" cy="162" rx="8" ry="4" fill="#0284c7"/>
        <text x="140" y="185" fill="#38bdf8" font-size="11" font-weight="bold">C (Stoma)</text>
      </svg>`,
      diagramCaption: 'Fig. 1.1: Detailed cross-section through a dicotyledonous leaf blade.'
    },
    {
      id: 'p42-q2',
      number: 2,
      questionText: 'Fig. 2.1 shows a bacterial cell.\n(a)(i) State the function of ribosomes: Protein synthesis.\n(a)(ii) State one structure present in plant cells that is absent in bacterial cells: Nucleus / chloroplasts / mitochondria.\n(b) Describe the role of platelets in the human body: Blood clotting to prevent blood loss and prevent the entry of pathogens into wounds.\n(c) Explain why taking antibiotics does not cure a viral infection: Viruses do not possess bacterial cell walls or metabolic pathways targeted by antibiotics; viruses reproduce inside host cells.',
      correctAnswer: 'protein synthesis | nucleus / mitochondria | blood clotting and seal wounds | viruses lack cell wall and live inside host cells',
      marks: 8,
      explanation: 'Bacteria are prokaryotes lacking membrane-bound organelles (nucleus, mitochondria). Platelets release clotting factors that convert soluble fibrinogen into insoluble fibrin mesh. Antibiotics only disrupt bacterial structures (e.g. cell wall formation), having zero effect on viruses.',
      subject: 'biology',
      syllabusCode: 'B2.1',
      questionType: 'structured'
    },
    {
      id: 'p42-q3',
      number: 3,
      questionText: 'Fig. 3.1 shows a food web in an African grassland ecosystem:\nGrass -> Rabbit -> Wildcat -> Lion\nGrass -> Mouse -> Hawk\nGrass -> Topi -> Hyena -> Lion\n(a)(i) Name one herbivore (primary consumer): Rabbit / Mouse / Topi.\n(a)(ii) Name one organism that feeds at two trophic levels: Lion / Wildcat.\n(b) A fire burns 80% of the grassland.\nExplain how this will cause the population of lions to decrease: Destruction of grass reduces food for primary consumers (herbivores: topi, rabbits); herbivore populations crash, leaving less prey for secondary consumers and carnivores, starving the top predators (lions).',
      correctAnswer: 'rabbit / mouse / topi | wildcat / lion | less grass means herbivores starve, leading to less prey for lions',
      marks: 7,
      explanation: 'Grass is the producer (trophic level 1). Herbivores (rabbit, topi, mouse) are primary consumers (level 2). Loss of vegetation disrupts the entire food chain because less chemical energy is transferred up trophic levels.',
      subject: 'biology',
      syllabusCode: 'B16.1',
      questionType: 'structured'
    },
    {
      id: 'p42-q4',
      number: 4,
      questionText: 'A student titrates aqueous sodium hydroxide (in flask) with dilute hydrochloric acid (in burette).\n(a) Write the balanced chemical equation with state symbols:\nNaOH(aq) + HCl(aq) -> NaCl(aq) + H2O(l).\n(b) State the colour change of methyl orange indicator at the end-point:\nYellow to orange (or red).\n(c) State whether the reaction is exothermic or endothermic: Exothermic (neutralisation reactions release thermal energy).',
      correctAnswer: 'NaOH(aq) + HCl(aq) -> NaCl(aq) + H2O(l) | yellow to orange/red | exothermic',
      marks: 6,
      explanation: 'Neutralisation between strong acid and strong base is exothermic. Methyl orange is yellow in alkaline solution and turns red in acidic conditions; end-point neutral colour is orange.',
      subject: 'chemistry',
      syllabusCode: 'C8.1',
      questionType: 'structured'
    },
    {
      id: 'p42-q5',
      number: 5,
      questionText: 'The blast furnace is used to extract iron from hematite (Fe2O3).\n(a)(i) Complete the word equation for reduction of iron(III) oxide:\nIron(III) oxide + carbon monoxide -> Iron + carbon dioxide.\n(a)(ii) State why this reaction is described as reduction: Iron(III) oxide loses oxygen (or iron ions gain electrons Fe³⁺ + 3e⁻ -> Fe).\n(b) Draw a dot-and-cross diagram to show the bonding in carbon dioxide (CO2):\nCentral carbon atom shares two pairs of electrons with each oxygen atom (two double covalent bonds; 4 shared pairs total).',
      correctAnswer: 'Iron + carbon dioxide | iron oxide loses oxygen | two C=O double bonds (4 shared pairs)',
      marks: 8,
      explanation: 'Carbon monoxide acts as the reducing agent in the blast furnace: Fe2O3 + 3CO -> 2Fe + 3CO2. In CO2, C has 4 valence electrons, each O has 6; sharing two pairs with each O gives every atom a stable full outer octet.',
      subject: 'chemistry',
      syllabusCode: 'C7.1',
      questionType: 'structured'
    },
    {
      id: 'p42-q9',
      number: 9,
      questionText: 'Fig. 9.1 shows an electrical circuit with a 15 Ω resistor in series with a parallel combination of a 12 Ω resistor and a 24 Ω resistor, powered by a 12 V power supply.\n(a)(i) Calculate the combined resistance of the 12 Ω and 24 Ω resistors in parallel:\n1/Rp = 1/12 + 1/24 = 2/24 + 1/24 = 3/24 -> Rp = 24/3 = 8.0 Ω.\n(a)(ii) Calculate total circuit resistance:\nR_total = 15 + 8 = 23 Ω.\n(a)(iii) Calculate the current through the 15 Ω resistor:\nI = V / R = 12 / 23 = 0.52 A.\n(b) Fig. 9.2 shows a plane mirror. State the law of reflection: Angle of incidence equals angle of reflection (i = r).',
      correctAnswer: '8.0 Ω | 23 Ω | 0.52 A | angle of incidence equals angle of reflection',
      marks: 9,
      explanation: 'Parallel resistance Rp = (R1 × R2) / (R1 + R2) = (12 × 24) / 36 = 288 / 36 = 8.0 Ω. Total resistance = 15 + 8 = 23 Ω. Total current I = V / R = 12 / 23 = 0.5217 A. The law of reflection states i = r.',
      subject: 'physics',
      syllabusCode: 'P4.1',
      questionType: 'structured'
    }
  ]
};
