import { PastExamPaper } from '../../types';
import { 
  FIGURE_TOY_CAR_GRAPH_SPEC_7_1, 
  FIGURE_TOY_CAR_CIRCUIT_SPEC_9_1 
} from '../examFiguresSvg';

export const specimen2025Paper4: PastExamPaper = {
  id: 'specimen-2025-p4',
  code: '0653/04',
  title: 'Paper 4 Theory (Extended) - Specimen 2025',
  series: 'Specimen 2025',
  paperNumber: 'Paper 4',
  tier: 'Extended',
  duration: '1 hour 15 minutes',
  totalMarks: 80,
  description: 'Official Cambridge IGCSE Combined Science Extended Theory Paper covering all 3 sciences with full authentic diagrams, calculations, and official mark schemes.',
  examinerNotes: [
    'In chemical equations, ensure formulas and state symbols are balanced correctly.',
    'For graph analysis (e.g. antibody response curve), quote specific values and days with correct units.',
    'Show all working in calculations to secure method marks even if the final answer contains an arithmetic slip.'
  ],
  questions: [
    {
      id: 'p4-q1',
      number: 1,
      questionText: 'Fig. 1.1 shows a sign in a hospital kitchen: "WASH YOUR HANDS TO PREVENT THE SPREAD OF PATHOGENS".\n(a)(i) Define pathogen: A disease-causing organism.\n(a)(ii) State two ways washing hands prevents spread: Removes pathogens from skin; prevents transfer to food/surfaces.\n(b) Fig. 1.2 shows antibody concentration after initial vaccination on day 0 and booster on day 28.\nCompare the response to the booster vaccination with the response to the initial vaccination: Rate of antibody production is much faster; peak concentration is much higher; antibody levels remain elevated for longer.\n(c) Name the type of immunity provided by vaccination: Active immunity.',
      correctAnswer: 'disease-causing organism | removes bacteria from skin | faster rate, higher peak concentration, lasts longer | active immunity',
      marks: 9,
      explanation: 'Pathogen is defined as a disease-causing organism. Vaccination stimulates lymphocytes to produce specific antibodies and memory cells. When the booster is given, memory cells recognize the antigen immediately, triggering a rapid and massive production of antibodies that persist in the blood (active immunity).',
      examinerComment: 'Candidates who said "fights disease" rather than "causes disease" lost the pathogen mark. In graph comparison, referencing both time to peak and maximum concentration was rewarded.',
      subject: 'biology',
      syllabusCode: 'B10.1',
      questionType: 'structured',
      diagramSvg: `<svg viewBox="0 0 340 180" class="w-full max-w-sm mx-auto stroke-slate-200 fill-none" stroke-width="2">
        <!-- Graph axes -->
        <line x1="40" y1="150" x2="310" y2="150" stroke="#94a3b8" stroke-width="2"/>
        <line x1="40" y1="20" x2="40" y2="150" stroke="#94a3b8" stroke-width="2"/>
        <text x="175" y="172" fill="#94a3b8" font-size="10" text-anchor="middle">Time / days</text>
        <text x="15" y="80" fill="#94a3b8" font-size="9" transform="rotate(-90 15 80)" text-anchor="middle">Antibody Conc.</text>
        <!-- Initial response curve -->
        <path d="M 40 150 Q 70 150 85 110 Q 100 80 120 120 L 150 145" stroke="#38bdf8" stroke-width="2.5"/>
        <text x="60" y="70" fill="#38bdf8" font-size="9">Initial (Day 0)</text>
        <!-- Booster curve (much higher, steeper) -->
        <path d="M 150 145 Q 160 145 175 40 Q 190 30 250 50 L 300 70" stroke="#f43f5e" stroke-width="2.5"/>
        <text x="210" y="25" fill="#f43f5e" font-size="9">Booster (Day 28)</text>
      </svg>`,
      diagramCaption: 'Fig. 1.2: Graph of antibody concentration against time following initial and booster vaccinations.'
    },
    {
      id: 'p4-q2',
      number: 2,
      questionText: 'Fig. 2.1 shows a cross-section of a dicotyledonous plant stem.\n(a)(i) Identify tissue Q in the outer region of the vascular bundle: Phloem.\n(a)(ii) State the substance transported in tissue Q: Sucrose (or amino acids).\n(b) Write the balanced chemical equation for photosynthesis: 6CO2 + 6H2O -> C6H12O6 + 6O2.\n(c) Hydrogencarbonate indicator in tubes:\n- Tube A (Dark): Yellow (high CO2 from respiration only)\n- Tube B (Dim light): Red / orange (compensation point)\n- Tube C (Bright light): Purple (photosynthesis exceeds respiration, CO2 used up).\n(d) Explain how deforestation affects biodiversity: Loss of habitat and food sources reduces species populations, causing loss of species diversity.',
      correctAnswer: 'phloem | sucrose | 6CO2 + 6H2O -> C6H12O6 + 6O2 | Tube A yellow, Tube C purple | habitat destruction reduces species diversity',
      marks: 9,
      explanation: 'Phloem transports sucrose and amino acids via translocation. In tube A (darkness), the pondweed can only respire, releasing CO2 which lowers pH and turns indicator yellow. In tube C (bright light), rate of photosynthesis exceeds respiration, consuming CO2 and raising pH to turn indicator purple.',
      subject: 'biology',
      syllabusCode: 'B8.1',
      questionType: 'structured'
    },
    {
      id: 'p4-q3',
      number: 3,
      questionText: 'Fig. 3.1 shows the human digestive system.\n(a)(i) Identify structure X (opening at end of alimentary canal) and state its function: Anus; egestion of faeces.\n(a)(ii) Identify organ Y (produces pancreatic juice): Pancreas; secretes lipase, amylase, trypsin.\n(a)(iii) State the two end products of fat digestion by lipase: Fatty acids and glycerol.\n(b) Fig. 3.2 shows rate of reaction of salivary amylase vs pH (optimum pH 7).\nExplain why salivary amylase stops working when it enters the stomach: Stomach contains hydrochloric acid (pH 1-2); the strong acid denatures amylase by altering the shape of its active site so starch can no longer bind.',
      correctAnswer: 'X = anus (egestion) | Y = pancreas | fatty acids and glycerol | denatured by stomach acid (pH 1-2) changing active site shape',
      marks: 9,
      explanation: 'Lipase hydrolyses lipids into 1 glycerol and 3 fatty acid molecules. Salivary amylase is adapted to neutral pH (~7). In the highly acidic gastric juice (pH 1-2), hydrogen bonds in the enzyme protein structure break, irreversibly denaturing the active site.',
      subject: 'biology',
      syllabusCode: 'B7.1',
      questionType: 'structured'
    },
    {
      id: 'p4-q4',
      number: 4,
      questionText: 'Fig. 4.1 shows energy profile diagrams for Reaction 1 (exothermic) and Reaction 2 (endothermic).\n(a)(i) Define activation energy: The minimum energy that colliding particles must possess to react.\n(a)(ii) State and explain how the temperature of the reaction mixture changes during Reaction 2: Temperature decreases because thermal energy is absorbed from the surroundings (endothermic reaction).\n(b) Write a balanced chemical equation for the reaction of calcium carbonate with dilute hydrochloric acid:\nCaCO3 + 2HCl -> CaCl2 + H2O + CO2.\n(c) Using collision theory, explain why increasing the temperature increases the rate of reaction: Particles gain kinetic energy and move faster, colliding more frequently; a much greater proportion of colliding particles possess energy greater than or equal to the activation energy (successful collisions per second increase).',
      correctAnswer: 'minimum energy to react | temperature decreases (endothermic absorbs heat) | CaCO3 + 2HCl -> CaCl2 + H2O + CO2 | higher kinetic energy, higher collision frequency, greater proportion >= Ea',
      marks: 8,
      explanation: 'Activation energy is the barrier to reaction. In an endothermic process, energy is absorbed from surroundings, causing a drop in temperature. Higher temperatures increase collision frequency and the fraction of collisions with energy exceeding Ea.',
      subject: 'chemistry',
      syllabusCode: 'C5.1',
      questionType: 'structured',
      diagramSvg: `<svg viewBox="0 0 340 180" class="w-full max-w-sm mx-auto stroke-slate-200 fill-none" stroke-width="2">
        <!-- Reaction 1: Exothermic -->
        <g transform="translate(10, 20)">
          <line x1="20" y1="130" x2="140" y2="130" stroke="#64748b"/>
          <line x1="20" y1="20" x2="20" y2="130" stroke="#64748b"/>
          <path d="M 25 80 L 50 80 C 60 80 70 30 85 30 C 100 30 110 115 135 115" stroke="#38bdf8" stroke-width="2"/>
          <text x="80" y="145" fill="#38bdf8" font-size="10" text-anchor="middle">Reaction 1 (Exothermic)</text>
          <text x="25" y="75" fill="#94a3b8" font-size="8">Reactants</text>
          <text x="100" y="110" fill="#94a3b8" font-size="8">Products</text>
        </g>
        <!-- Reaction 2: Endothermic -->
        <g transform="translate(170, 20)">
          <line x1="20" y1="130" x2="140" y2="130" stroke="#64748b"/>
          <line x1="20" y1="20" x2="20" y2="130" stroke="#64748b"/>
          <path d="M 25 110 L 50 110 C 60 110 70 25 85 25 C 100 25 110 65 135 65" stroke="#f43f5e" stroke-width="2"/>
          <text x="80" y="145" fill="#f43f5e" font-size="10" text-anchor="middle">Reaction 2 (Endothermic)</text>
          <text x="25" y="105" fill="#94a3b8" font-size="8">Reactants</text>
          <text x="100" y="60" fill="#94a3b8" font-size="8">Products</text>
        </g>
      </svg>`,
      diagramCaption: 'Fig. 4.1: Reaction pathway diagrams for Reaction 1 and Reaction 2.'
    },
    {
      id: 'p4-q5',
      number: 5,
      questionText: 'Table 5.1 compares properties of aluminium and copper.\n(a)(i) State one property that makes aluminium suitable for overhead power cables: Low density / lightweight.\n(a)(ii) State one property of aluminium that makes it suitable for food containers: Non-toxic / resistant to corrosion.\n(b) Fig. 5.1 shows the arrangement of atoms in an alloy of steel (iron containing carbon atoms).\nExplain why steel is harder and stronger than pure iron: In pure iron, regular layers of identical atoms can slide over each other easily; in steel, different-sized carbon atoms disrupt the regular lattice, preventing layers from sliding.',
      correctAnswer: 'low density | resistant to corrosion / non-toxic | carbon atoms are different size and disrupt layers preventing them from sliding',
      marks: 7,
      explanation: 'Overhead cables need low weight to avoid sagging or breaking pylons. In steel, carbon atoms fit interstitially between iron atoms, distorting the plane of atoms so dislocations cannot easily move.',
      subject: 'chemistry',
      syllabusCode: 'C10.1',
      questionType: 'structured'
    },
    {
      id: 'p4-q7',
      number: 7,
      questionText: 'Fig. 7.1 shows the speed-time graph for a battery-powered toy car on a flat track.\n(a)(i) State the time at which the car reaches its maximum speed: 40 s (speed = 1.5 m/s).\n(a)(ii) Identify the time interval during which the car is decelerating: 100 s to 120 s.\n(a)(iii) Calculate the distance travelled while the car travels at constant speed (40 s to 100 s):\nDistance = speed × time = 1.5 m/s × (100 - 40) s = 1.5 × 60 = 90 m.\n(b) The car then drives up a ramp of vertical height 0.15 m. Mass of car = 55 kg. (g = 9.8 N/kg).\nCalculate the increase in gravitational potential energy:\nΔEp = m × g × h = 55 × 9.8 × 0.15 = 80.85 -> 81 J.',
      correctAnswer: '40 s | 100 s to 120 s | distance = 90 m | ΔEp = 81 J',
      marks: 9,
      explanation: 'Constant speed is maintained from 40s to 100s (duration = 60s). Distance = area of rectangle = 1.5 × 60 = 90 m. Gravitational potential energy increase = mgh = 55 × 9.8 × 0.15 = 80.85 J (rounds to 81 J).',
      subject: 'physics',
      syllabusCode: 'P1.1',
      questionType: 'structured',
      figureCaption: 'Fig. 7.1',
      diagramSvg: FIGURE_TOY_CAR_GRAPH_SPEC_7_1,
      diagramCaption: 'Fig. 7.1: Speed-time graph for the toy car.'
    },
    {
      id: 'p4-q9',
      number: 9,
      questionText: 'Fig. 9.1 shows the circuit diagram for the toy car containing headlights (component S) and a drive motor (component U).\n(a)(i) Component S is a light-emitting diode (LED).\n(a)(ii) Resistors T (5.4 Ω) and U (3.5 Ω) in series:\nCombined resistance = 5.4 + 3.5 = 8.9 Ω.\n(a)(iii) Ammeter reading for whole circuit with branches S (0.2 A) and U (2.5 A) in parallel:\nTotal current = 0.2 + 2.5 = 2.7 A.\n(b) Battery transfers 36 J of energy to the motor in 10 seconds. Useful kinetic energy gained = 32 J.\nCalculate the percentage efficiency:\nEfficiency = (Useful output / Total input) × 100% = (32 / 36) × 100% = 88.9%.',
      correctAnswer: 'LED | 8.9 Ω | 2.7 A | efficiency = 88.9%',
      marks: 10,
      explanation: 'In series, resistances add directly (5.4 + 3.5 = 8.9 Ω). In parallel, branch currents sum together (0.2 + 2.5 = 2.7 A). Efficiency = (32 / 36) × 100 = 88.88% -> 88.9%.',
      subject: 'physics',
      syllabusCode: 'P4.1',
      questionType: 'structured',
      figureCaption: 'Fig. 9.1',
      diagramSvg: FIGURE_TOY_CAR_CIRCUIT_SPEC_9_1,
      diagramCaption: 'Fig. 9.1: Circuit diagram for the toy car with LED headlights and motor.'
    }
  ]
};
