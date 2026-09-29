export interface CommandWord {
  word: string;
  meaning: string;
  example: string;
}

export interface QualitativeTest {
  name: string;
  type: 'anion' | 'cation' | 'gas' | 'flame';
  testProcedure: string;
  expectedResult: string;
  chemicalEquationOrDetails?: string;
}

export const examTierDetails = {
  overview: "Cambridge IGCSE Combined Science 0653 candidates take three papers. The course offers a choice between Core curriculum and Extended curriculum tiers.",
  tiers: [
    {
      name: "Core Assessment",
      gradeRange: "Eligible for grades C to G only",
      targetCandidates: "Candidates who have studied the Core syllabus content only, or who are expected to achieve a grade D or below.",
      papers: [
        {
          name: "Paper 1: Multiple Choice (Core)",
          duration: "45 minutes",
          marks: 40,
          weighting: "30%",
          description: "40 compulsory four-option multiple-choice questions testing Core content only (AO1 & AO2)."
        },
        {
          name: "Paper 3: Theory (Core)",
          duration: "1 hour 15 minutes",
          marks: 80,
          weighting: "50%",
          description: "Short-answer and structured questions testing Core subject content (AO1 & AO2)."
        },
        {
          name: "Paper 5 or Paper 6 (Practical or Alt to Practical)",
          duration: "Paper 5: 1h 15m | Paper 6: 1h",
          marks: 40,
          weighting: "20%",
          description: "Tests experimental skills and investigations (AO3)."
        }
      ]
    },
    {
      name: "Extended Assessment",
      gradeRange: "Eligible for grades A* to G",
      targetCandidates: "Candidates who have studied the Extended syllabus content (both Core and Supplement), aiming for grades A* to C.",
      papers: [
        {
          name: "Paper 2: Multiple Choice (Extended)",
          duration: "45 minutes",
          marks: 40,
          weighting: "30%",
          description: "40 compulsory four-option multiple-choice questions testing Core and Supplement content (AO1 & AO2)."
        },
        {
          name: "Paper 4: Theory (Extended)",
          duration: "1 hour 15 minutes",
          marks: 80,
          weighting: "50%",
          description: "Short-answer and structured questions testing Core and Supplement content (AO1 & AO2)."
        },
        {
          name: "Paper 5 or Paper 6 (Practical or Alt to Practical)",
          duration: "Paper 5: 1h 15m | Paper 6: 1h",
          marks: 40,
          weighting: "20%",
          description: "Tests experimental skills and investigations (AO3)."
        }
      ]
    }
  ],
  assessmentObjectives: [
    {
      code: "AO1",
      title: "Knowledge with understanding",
      weighting: "50%",
      description: "Demonstrate recall and understanding of scientific phenomena, facts, laws, definitions, concepts, theories, and symbols/units."
    },
    {
      code: "AO2",
      title: "Handling information and problem-solving",
      weighting: "30%",
      description: "Locate, select, organise, translate, manipulate numerical data, identify patterns/trends, make predictions, and solve quantitative problems in unfamiliar contexts."
    },
    {
      code: "AO3",
      title: "Experimental skills and investigations",
      weighting: "20%",
      description: "Plan investigations, safely handle laboratory apparatus, record systematic observations/measurements, evaluate data, identify anomalies, and suggest improvements."
    }
  ]
};

export const commandWordsGlossary: CommandWord[] = [
  { word: "Analyse", meaning: "Examine in detail to show meaning, identify elements and the relationship between them.", example: "Analyse the rate of reaction graph to determine when the reaction finishes." },
  { word: "Calculate", meaning: "Work out from given facts, figures or information; show clear working with units.", example: "Calculate the acceleration using a = Δv / Δt." },
  { word: "Compare", meaning: "Identify / comment on similarities and/or differences between two or more items.", example: "Compare the structure and function of arteries and veins." },
  { word: "Deduce", meaning: "Conclude from available information or data.", example: "Deduce the order of reactivity from the table of displacement observations." },
  { word: "Define", meaning: "Give precise meaning using syllabus wording.", example: "Define active transport." },
  { word: "Describe", meaning: "State the points of a topic / give characteristics and main features (what happens).", example: "Describe the changes that happen to water molecules during boiling." },
  { word: "Determine", meaning: "Establish an answer using the information available.", example: "Determine the time taken to collect 25 cm³ of gas from the stopwatch display." },
  { word: "Explain", meaning: "Set out purposes or reasons / make relationships clear / say why and/or how using scientific evidence.", example: "Explain why enzymes denature above their optimum temperature." },
  { word: "Identify", meaning: "Name / select / recognise.", example: "Identify the gas that relights a glowing splint." },
  { word: "Outline", meaning: "Set out the main points concisely.", example: "Outline the pathway taken by water through a plant root to the leaf." },
  { word: "Predict", meaning: "Suggest what may happen based on available information or trends.", example: "Predict the state of astatine at room temperature." },
  { word: "State", meaning: "Express in clear, brief terms without lengthy explanation.", example: "State the unit for electrical charge." },
  { word: "Suggest", meaning: "Apply knowledge and understanding to situations where there are a range of valid responses.", example: "Suggest why the student blotted the potato cylinders before weighing." }
];

export const qualitativeAnalysisNotes: QualitativeTest[] = [
  // Anions
  {
    name: "Carbonate (CO₃²⁻)",
    type: "anion",
    testProcedure: "Add dilute acid (e.g. HCl), then test escaping gas with limewater.",
    expectedResult: "Effervescence (bubbling); gas turns limewater milky/cloudy.",
    chemicalEquationOrDetails: "CO₃²⁻(aq) + 2H⁺(aq) -> H₂O(l) + CO₂(g)"
  },
  {
    name: "Chloride (Cl⁻) [in solution]",
    type: "anion",
    testProcedure: "Acidify with dilute nitric acid (HNO₃), then add aqueous silver nitrate (AgNO₃).",
    expectedResult: "White precipitate formed (AgCl).",
    chemicalEquationOrDetails: "Ag⁺(aq) + Cl⁻(aq) -> AgCl(s)"
  },
  {
    name: "Bromide (Br⁻) [in solution]",
    type: "anion",
    testProcedure: "Acidify with dilute nitric acid (HNO₃), then add aqueous silver nitrate (AgNO₃).",
    expectedResult: "Cream precipitate formed (AgBr).",
    chemicalEquationOrDetails: "Ag⁺(aq) + Br⁻(aq) -> AgBr(s)"
  },
  {
    name: "Iodide (I⁻) [in solution]",
    type: "anion",
    testProcedure: "Acidify with dilute nitric acid (HNO₃), then add aqueous silver nitrate (AgNO₃).",
    expectedResult: "Yellow precipitate formed (AgI).",
    chemicalEquationOrDetails: "Ag⁺(aq) + I⁻(aq) -> AgI(s)"
  },
  {
    name: "Sulfate (SO₄²⁻) [in solution]",
    type: "anion",
    testProcedure: "Acidify with dilute nitric acid (HNO₃), then add aqueous barium nitrate (Ba(NO₃)₂).",
    expectedResult: "White precipitate formed (BaSO₄).",
    chemicalEquationOrDetails: "Ba²⁺(aq) + SO₄²⁻(aq) -> BaSO₄(s)"
  },

  // Cations (Aqueous)
  {
    name: "Ammonium (NH₄⁺)",
    type: "cation",
    testProcedure: "Add aqueous sodium hydroxide (NaOH) and heat gently. Test gas with damp red litmus paper.",
    expectedResult: "No precipitate; pungent ammonia gas produced on warming which turns damp red litmus paper blue.",
    chemicalEquationOrDetails: "NH₄⁺(aq) + OH⁻(aq) -> NH₃(g) + H₂O(l)"
  },
  {
    name: "Calcium (Ca²⁺)",
    type: "cation",
    testProcedure: "Add aqueous sodium hydroxide (NaOH); then add aqueous ammonia (NH₃).",
    expectedResult: "With NaOH: White precipitate, insoluble in excess. With NH₃: No precipitate or very slight white precipitate.",
    chemicalEquationOrDetails: "Ca²⁺(aq) + 2OH⁻(aq) -> Ca(OH)₂(s)"
  },
  {
    name: "Copper(II) (Cu²⁺)",
    type: "cation",
    testProcedure: "Add aqueous sodium hydroxide; then add aqueous ammonia.",
    expectedResult: "With NaOH: Light blue precipitate, insoluble in excess. With NH₃: Light blue precipitate, soluble in excess giving a deep dark blue solution.",
    chemicalEquationOrDetails: "Cu²⁺(aq) + 2OH⁻(aq) -> Cu(OH)₂(s)"
  },
  {
    name: "Iron(II) (Fe²⁺)",
    type: "cation",
    testProcedure: "Add aqueous sodium hydroxide; then add aqueous ammonia.",
    expectedResult: "With NaOH: Green precipitate, insoluble in excess, turns brown near surface on standing. With NH₃: Green precipitate, insoluble in excess.",
    chemicalEquationOrDetails: "Fe²⁺(aq) + 2OH⁻(aq) -> Fe(OH)₂(s)"
  },
  {
    name: "Iron(III) (Fe³⁺)",
    type: "cation",
    testProcedure: "Add aqueous sodium hydroxide; then add aqueous ammonia.",
    expectedResult: "With NaOH: Red-brown precipitate, insoluble in excess. With NH₃: Red-brown precipitate, insoluble in excess.",
    chemicalEquationOrDetails: "Fe³⁺(aq) + 3OH⁻(aq) -> Fe(OH)₃(s)"
  },
  {
    name: "Zinc (Zn²⁺)",
    type: "cation",
    testProcedure: "Add aqueous sodium hydroxide; then add aqueous ammonia.",
    expectedResult: "With NaOH: White precipitate, SOLUBLE in excess giving a colourless solution. With NH₃: White precipitate, soluble in excess giving a colourless solution.",
    chemicalEquationOrDetails: "Zn²⁺(aq) + 2OH⁻(aq) -> Zn(OH)₂(s) -> complex ion [Zn(OH)₄]²⁻"
  },

  // Gases
  {
    name: "Ammonia (NH₃)",
    type: "gas",
    testProcedure: "Hold damp red litmus paper near the gas.",
    expectedResult: "Damp red litmus paper turns blue (alkaline gas)."
  },
  {
    name: "Carbon dioxide (CO₂)",
    type: "gas",
    testProcedure: "Bubble gas through limewater (aqueous calcium hydroxide).",
    expectedResult: "Turns limewater milky / cloudy."
  },
  {
    name: "Chlorine (Cl₂)",
    type: "gas",
    testProcedure: "Hold damp blue/red litmus paper in the gas.",
    expectedResult: "Bleaches damp litmus paper white (pungent swimming-pool odour)."
  },
  {
    name: "Hydrogen (H₂)",
    type: "gas",
    testProcedure: "Hold a lighted wooden splint near the mouth of the test tube.",
    expectedResult: "Burns with a squeaky 'pop' sound."
  },
  {
    name: "Oxygen (O₂)",
    type: "gas",
    testProcedure: "Insert a glowing wooden splint into the gas.",
    expectedResult: "Relights the glowing splint."
  },

  // Flame Tests
  {
    name: "Lithium (Li⁺)",
    type: "flame",
    testProcedure: "Clean nichrome wire in conc HCl, dip in sample, hold in blue Bunsen flame.",
    expectedResult: "Red flame."
  },
  {
    name: "Sodium (Na⁺)",
    type: "flame",
    testProcedure: "Clean nichrome wire in conc HCl, dip in sample, hold in blue Bunsen flame.",
    expectedResult: "Yellow flame."
  },
  {
    name: "Potassium (K⁺)",
    type: "flame",
    testProcedure: "Clean nichrome wire in conc HCl, dip in sample, hold in blue Bunsen flame.",
    expectedResult: "Lilac flame."
  },
  {
    name: "Copper(II) (Cu²⁺)",
    type: "flame",
    testProcedure: "Clean nichrome wire in conc HCl, dip in sample, hold in blue Bunsen flame.",
    expectedResult: "Blue-green flame."
  }
];
