import { SlideItem, ScienceSubject } from '../types';

export interface ClassroomLessonSlideDeck {
  topicCode: string;
  subtopicCode: string;
  title: string;
  subject: ScienceSubject;
  classworkDate?: string;
  objectives: string[];
  keywords: string[];
  starterLookBack?: { question: string; answer: string };
  starterLookForward?: { question: string; answer?: string };
  slides: {
    title: string;
    type: 'theory' | 'task' | 'afl' | 'practical' | 'plenary';
    content: string[];
    taskDetails?: {
      taskName: string;
      instruction: string;
      wordBank?: string[];
      fillBlanksText?: string;
      solution: string;
      challengeQuestion?: string;
      challengeSolution?: string;
    };
  }[];
  plenaryQuiz?: { question: string; options: string[]; answer: string }[];
}

export const classroomLessonSlideDecks: Record<string, ClassroomLessonSlideDeck> = {
  'B1': {
    topicCode: 'B1',
    subtopicCode: 'B1.1',
    title: 'Characteristics of Living Things (MRS GREN)',
    subject: 'biology',
    classworkDate: 'xx/xx/xxxx',
    objectives: [
      'Explain the scientific definition of living using the acronym MRS GREN.',
      'Determine between examples of living and non-living substances.'
    ],
    keywords: ['living', 'non-living', 'respiration', 'reproduction', 'movement', 'sensitivity', 'growth', 'excretion', 'nutrition'],
    starterLookBack: {
      question: 'How many Cambridge exams will you sit, what are they, and when do you sit them?',
      answer: '3 exams: Multiple choice (Paper 1/2), Theory (Paper 3/4), and Practical Skills (Paper 5/6), sat in Term 4.'
    },
    starterLookForward: {
      question: 'What does it mean to be alive and why is defining life hard?',
      answer: 'Living organisms carry out all 7 life processes. Aristotle noted living things grow, maintain themselves, and reproduce.'
    },
    slides: [
      {
        title: 'The Seven Life Processes (MRS GREN)',
        type: 'theory',
        content: [
          'All living organisms carry out 7 fundamental life processes:',
          '• Movement: Action by an organism or part causing change of position or aspect.',
          '• Respiration: Chemical reactions in cells that break down nutrient molecules and release energy.',
          '• Sensitivity: Ability to detect and respond to changes in the environment (stimuli).',
          '• Growth: Permanent increase in size and dry mass.',
          '• Reproduction: Processes that make more of the same kind of organism.',
          '• Excretion: Removal from organisms of toxic materials and substances in excess.',
          '• Nutrition: Taking in of materials for energy, growth and development.'
        ]
      },
      {
        title: 'Task 1: Match the Life Processes',
        type: 'task',
        content: ['Match each life process to its exact biological definition.'],
        taskDetails: {
          taskName: 'Task One: Life Process Matching',
          instruction: 'Match the life process with its definition.',
          wordBank: ['Movement', 'Respiration', 'Sensitivity', 'Growth', 'Reproduction', 'Excretion', 'Nutrition'],
          fillBlanksText: 'Takes in nutrients for energy -> Nutrition; Creates offspring -> Reproduction; Reacts to environmental changes -> Sensitivity; Gets rid of waste products -> Excretion; Converts glucose and oxygen into energy -> Respiration; Increases in size over time -> Growth; Changes position or posture -> Movement.',
          solution: 'Nutrition, Reproduction, Sensitivity, Excretion, Respiration, Growth, Movement.',
          challengeQuestion: 'Would you classify a humanoid robot as alive? Justify using MRS GREN.',
          challengeSolution: 'A robot is non-living: it can only perform movement and sensitivity (via sensors). It does not respire, excrete, grow, reproduce, or require biological nutrition.'
        }
      },
      {
        title: 'Task 2: Origins of Life & Aristotle Definition',
        type: 'task',
        content: ['Fill in the blanks regarding cultural stories and scientific characteristics.'],
        taskDetails: {
          taskName: 'Task Two: Fill in the Gaps',
          instruction: 'Use the Word Bank to complete the text.',
          wordBank: ['Papatūānuku', 'living', 'grows', 'mythological', 'non-living', 'Ranginui', 'characteristics', 'scientific', 'reproduces'],
          fillBlanksText: 'There are many theories on how life originated on earth, from [mythological] stories in different cultures to [scientific] theories using evidence. An example is the Māori creation story involving [Papatūānuku] and [Ranginui]. Defining life is hard, so we determine if something is [living] or [non-living] based on observable [characteristics]. Aristotle said that if something [grows], maintains itself and [reproduces] it is alive.',
          solution: 'mythological, scientific, Papatūānuku, Ranginui, living, non-living, characteristics, grows, reproduces.'
        }
      }
    ]
  },

  'B2': {
    topicCode: 'B2',
    subtopicCode: 'B2.1',
    title: 'Cells, Specialised Cells & Organisation',
    subject: 'biology',
    classworkDate: '24/01/2025 & 11/02/2025',
    objectives: [
      'Define cell, tissue, organ, organ system and organism.',
      'Identify and label animal, plant and bacteria cells from diagrams.',
      'Explain functions of subcellular structures and specialised cell adaptations (RBC, root hair, palisade).'
    ],
    keywords: ['cytoplasm', 'vacuole', 'mitochondria', 'cell membrane', 'nucleus', 'chloroplast', 'cell wall', 'ribosomes', 'haemoglobin', 'palisade', 'mesophyll'],
    starterLookBack: {
      question: 'What structures are found in both plant and animal cells, and what structures are ONLY in plant cells?',
      answer: 'Both: nucleus, cell membrane, cytoplasm, mitochondria, ribosomes. ONLY plant: cellulose cell wall, chloroplasts, large permanent vacuole.'
    },
    starterLookForward: {
      question: 'What does specialised mean?',
      answer: 'A cell that has differentiated to develop specific structural adaptations to perform a dedicated function.'
    },
    slides: [
      {
        title: 'Cell Ultrastructure & Organelles',
        type: 'theory',
        content: [
          '• Nucleus: Contains genetic material (chromosomes made of DNA); controls cell activities.',
          '• Cytoplasm: Gel-like substance where metabolic chemical reactions take place.',
          '• Cell Membrane: Partially permeable barrier controlling entry and exit of molecules and ions.',
          '• Mitochondria: Site of aerobic respiration where energy (ATP) is released.',
          '• Ribosomes: Site of protein synthesis.',
          '• Cell Wall: Cellulose layer giving strength, support, and preventing bursting under turgor pressure.',
          '• Chloroplasts: Contain green pigment chlorophyll to absorb light energy for photosynthesis.',
          '• Vacuole: Large central fluid-filled sac containing cell sap; maintains cell shape and turgidity.',
          '• Bacterial Cells (Prokaryotic): Lack a nucleus; contain circular DNA loop in nucleoid and plasmids.'
        ]
      },
      {
        title: 'Specialised Cells Adaptations Table',
        type: 'theory',
        content: [
          '1. Red Blood Cell: Transports oxygen. Biconcave disc shape increases surface area:volume ratio; contains haemoglobin; has NO nucleus for more space; flexible to squeeze through narrow capillaries.',
          '2. Root Hair Cell: Absorbs water and mineral ions from soil. Long thin projection drastically increases surface area; thin cell wall for rapid movement of water by osmosis.',
          '3. Palisade Mesophyll Cell: Absorbs sunlight for photosynthesis. Columnar shape tightly packed at top of leaf; packed with numerous chloroplasts; thin walls for gas exchange.'
        ]
      },
      {
        title: 'Levels of Organisation',
        type: 'task',
        content: ['Hierarchy from smallest to largest.'],
        taskDetails: {
          taskName: 'Levels of Organisation Ordering',
          instruction: 'Place the key terms and biological examples in increasing order of size.',
          wordBank: ['Organelle', 'Cell', 'Tissue', 'Organ', 'Organ system', 'Organism'],
          fillBlanksText: '(Smallest) Organelle (e.g. Nucleus) -> Cell (e.g. Muscle cell) -> Tissue (e.g. Muscle tissue) -> Organ (e.g. Heart) -> Organ System (e.g. Circulatory system) -> Organism (e.g. Human) (Largest)',
          solution: 'Organelle -> Cell -> Tissue -> Organ -> Organ System -> Organism'
        }
      }
    ]
  },

  'B3': {
    topicCode: 'B3',
    subtopicCode: 'B3.1',
    title: 'Movement In & Out of Cells: Diffusion, Osmosis & Active Transport',
    subject: 'biology',
    classworkDate: '18/02/2025 - 26/02/2026',
    objectives: [
      'Define diffusion, osmosis and active transport.',
      'Explain factors affecting diffusion (surface area, temperature, concentration gradient, distance).',
      'Investigate osmosis in potato plant tissue and describe turgid, flaccid, and lysis states.'
    ],
    keywords: ['diffusion', 'osmosis', 'active transport', 'partially permeable', 'concentration gradient', 'turgid', 'flaccid', 'plasmolysis', 'lysis'],
    starterLookBack: {
      question: 'What is diffusion and does it require energy?',
      answer: 'Diffusion is the net movement of particles from an area of higher concentration to lower concentration down a concentration gradient. It does not require energy (passive).'
    },
    starterLookForward: {
      question: 'How is osmosis different from diffusion?',
      answer: 'Osmosis is specifically the net diffusion of water molecules from a dilute solution to a concentrated solution across a partially permeable membrane.'
    },
    slides: [
      {
        title: 'Comparing Transport Mechanisms',
        type: 'theory',
        content: [
          '• Diffusion: Particles move down concentration gradient (high to low). Passive, no membrane strictly required.',
          '• Osmosis: Water moves down water potential gradient (dilute/high water to concentrated/low water) through a partially permeable membrane. Passive.',
          '• Active Transport: Particles move AGAINST concentration gradient (low to high). Requires energy from respiration and carrier proteins in membrane.',
          '• Real Examples: Active transport of nitrate ions from dilute soil into root hair cells; glucose absorption from gut into blood.'
        ]
      },
      {
        title: 'Osmosis in Animal vs Plant Cells',
        type: 'theory',
        content: [
          '• Pure Water (Dilute outside): Water enters by osmosis. Animal cells swell and burst (cell lysis) because they have no cell wall. Plant cells swell, vacuole pushes against cell wall, becoming TURGID (cell wall prevents bursting).',
          '• Concentrated Solution (High solute outside): Water leaves by osmosis. Animal cells shrivel/shrink. Plant cells lose water, cytoplasm pulls away from cell wall, becoming FLACCID and PLASMOLYSED.'
        ]
      },
      {
        title: 'Task: Potato Osmosis Practical Method & Variables',
        type: 'task',
        content: ['Investigating potato cylinders in different sucrose/salt concentrations.'],
        taskDetails: {
          taskName: 'Potato Practical Planning',
          instruction: 'Identify variables and complete the method.',
          wordBank: ['Independent', 'Dependent', 'Control', 'blot dry', 'cork borer', 'percentage change in mass'],
          fillBlanksText: 'Independent variable: Concentration of solution (0M to 1.0M). Dependent variable: Change / percentage change in mass. Control variables: Volume of solution, length of potato cylinder, immersion time, temperature. Always blot dry potato cylinders with a paper towel before weighing to remove surface water.',
          solution: 'IV: concentration; DV: % change in mass; CV: volume, time, temperature, diameter; blot dry.'
        }
      }
    ]
  },

  'B4': {
    topicCode: 'B4',
    subtopicCode: 'B4.1',
    title: 'Biological Molecules & Food Tests',
    subject: 'biology',
    classworkDate: '20/04/2026 - 24/04/2026',
    objectives: [
      'List the chemical elements in carbohydrates, fats/lipids, and proteins.',
      'State that large molecules are synthesized from smaller monomer units.',
      'Perform and interpret food tests: Benedict\'s (reducing sugars), Iodine (starch), Biuret (protein), Ethanol emulsion (lipids).'
    ],
    keywords: ['glucose', 'starch', 'glycogen', 'amino acids', 'glycerol', 'fatty acids', 'benedict', 'biuret', 'iodine', 'ethanol emulsion'],
    slides: [
      {
        title: 'Chemical Composition of Biological Molecules',
        type: 'theory',
        content: [
          '• Carbohydrates (C, H, O): Made of simple sugars (monosaccharides like glucose). Stored as starch in plants and glycogen in animals.',
          '• Lipids / Fats and Oils (C, H, O): Made of 1 glycerol molecule joined to 3 fatty acid chains.',
          '• Proteins (C, H, O, N and sometimes S): Long folded chains of 20 different amino acids; sequence determines 3D shape and function.'
        ]
      },
      {
        title: 'Official Cambridge 0653 Food Test Table',
        type: 'theory',
        content: [
          '1. Reducing Sugars (Glucose): Add Benedict\'s solution and heat in water bath at 80°C for 2 mins. Blue -> Green (trace) -> Yellow -> Brick-red precipitate (high sugar).',
          '2. Starch: Add Iodine solution. Yellow-brown -> Blue-black (starch present).',
          '3. Protein: Add Biuret reagent (sodium hydroxide + copper(II) sulfate). Blue -> Purple / Lilac.',
          '4. Lipids: Dissolve in Ethanol, then pour into cold water. Colourless -> Cloudy milky-white emulsion.'
        ]
      }
    ]
  },

  'B5': {
    topicCode: 'B5',
    subtopicCode: 'B5.1',
    title: 'Enzymes: Biological Catalysts & Enzyme Action',
    subject: 'biology',
    classworkDate: '30/04/2026 - 06/05/2026',
    objectives: [
      'Define enzyme as a biological catalyst that speeds up reactions without being consumed.',
      'Explain enzyme action using the lock and key model and complementary active site.',
      'Describe and explain the effects of temperature and pH on enzyme activity and denaturation.'
    ],
    keywords: ['catalyst', 'active site', 'substrate', 'enzyme-substrate complex', 'optimum', 'denature', 'complementary'],
    slides: [
      {
        title: 'Lock and Key Hypothesis',
        type: 'theory',
        content: [
          '• The enzyme is the "lock" with a uniquely shaped active site.',
          '• The substrate is the "key" which is complementary in shape to the active site.',
          '• Random collisions lead to binding, forming an enzyme-substrate complex.',
          '• The reaction occurs, products are released, and the enzyme remains unchanged to catalyze again.'
        ]
      },
      {
        title: 'Temperature & pH Effects & Denaturation',
        type: 'theory',
        content: [
          '• Low Temperature: Molecules have low kinetic energy; slow movement and few collisions.',
          '• Increasing Temperature: Higher kinetic energy increases collision frequency and rate up to the optimum (typically 37-40°C in humans).',
          '• Beyond Optimum (>45°C): Excessive thermal vibration breaks bonds holding the 3D protein structure. The active site permanently changes shape (DENATURATION). Substrate can no longer fit.',
          '• pH Changes: Extreme acid or alkali disrupts ionic and hydrogen bonds, changing the active site shape and denaturing the enzyme. Pepsin in stomach has optimum pH 2; salivary amylase optimum pH 7.'
        ]
      }
    ]
  },

  'B6': {
    topicCode: 'B6',
    subtopicCode: 'B6.1',
    title: 'Plant Nutrition & Photosynthesis',
    subject: 'biology',
    classworkDate: '06/05/2026 - 15/05/2026',
    objectives: [
      'State the balanced symbol equation for photosynthesis: 6CO2 + 6H2O -> C6H12O6 + 6O2.',
      'Identify leaf structures: cuticle, upper/lower epidermis, palisade mesophyll, spongy mesophyll, stomata, guard cells, xylem, phloem.',
      'Explain limiting factors (light, CO2, temperature) and describe testing leaves for starch.'
    ],
    keywords: ['photosynthesis', 'chlorophyll', 'chloroplast', 'stomata', 'guard cell', 'palisade mesophyll', 'spongy mesophyll', 'hydrogencarbonate'],
    slides: [
      {
        title: 'Photosynthesis Fundamentals & Glucose Uses',
        type: 'theory',
        content: [
          '• Word Equation: Carbon dioxide + water --(light & chlorophyll)--> glucose + oxygen',
          '• Balanced Symbol Equation: 6CO2 + 6H2O -> C6H12O6 + 6O2',
          '• Uses of Glucose in Plants: 1) Respiration to release energy; 2) Converted into insoluble starch for storage; 3) Made into cellulose for cell walls; 4) Combined with nitrates to form amino acids for proteins; 5) Converted to lipids/oils in seeds.'
        ]
      },
      {
        title: 'Leaf Anatomy & Cross Section',
        type: 'theory',
        content: [
          '• Waxy Cuticle: Waterproof layer on surface to minimize water evaporation.',
          '• Upper Epidermis: Transparent thin layer allowing light to reach palisade cells.',
          '• Palisade Mesophyll: Column-shaped cells packed with chloroplasts; principal site of photosynthesis.',
          '• Spongy Mesophyll: Loose arrangement with large air spaces for gas diffusion (CO2, O2, water vapour).',
          '• Vascular Bundle: Xylem on top (transports water/minerals); Phloem below (transports sucrose/amino acids).',
          '• Stomata & Guard Cells: Microscopic pores on underside of leaf that open and close to regulate gas exchange and transpiration.'
        ]
      },
      {
        title: 'Hydrogencarbonate Indicator Test (Gas Exchange in Plants)',
        type: 'theory',
        content: [
          'Hydrogencarbonate indicator reveals CO2 levels:',
          '• Red/Orange: Normal atmospheric CO2 level (e.g. control tube or dim light where photosynthesis = respiration).',
          '• Purple: Low CO2 concentration (Bright light: rate of photosynthesis > rate of respiration, so CO2 is taken up).',
          '• Yellow: High CO2 concentration (Darkness: no photosynthesis, but respiration continues releasing CO2).'
        ]
      }
    ]
  },

  'B7': {
    topicCode: 'B7',
    subtopicCode: 'B7.1',
    title: 'Human Nutrition & the Alimentary Canal',
    subject: 'biology',
    classworkDate: '09/04/2025 - 18/05/2026',
    objectives: [
      'Describe the 5 stages: ingestion, digestion, absorption, assimilation, egestion.',
      'Identify organs of the alimentary canal (mouth, oesophagus, stomach, duodenum, ileum, colon, rectum, anus) and associated organs (liver, pancreas, gall bladder).',
      'Explain villi adaptations and describe the Visking tubing model gut experiment.'
    ],
    keywords: ['ingestion', 'digestion', 'absorption', 'assimilation', 'egestion', 'peristalsis', 'bile', 'villi', 'visking tubing'],
    slides: [
      {
        title: '5 Stages of Food Processing',
        type: 'theory',
        content: [
          '1. Ingestion: Food and drink taken into the mouth.',
          '2. Digestion: Breakdown of large insoluble food molecules into small soluble molecules (physical/mechanical chewing and chemical enzymes).',
          '3. Absorption: Movement of digested food molecules through the wall of the intestine into the blood or lymph.',
          '4. Assimilation: Movement of absorbed food molecules into body cells where they become part of the cells or are used.',
          '5. Egestion: Passing out of food that has not been digested or absorbed, as faeces, through the anus.'
        ]
      },
      {
        title: 'Model Gut (Visking Tubing Experiment)',
        type: 'practical',
        content: [
          '• Visking tubing represents the selectively permeable wall of the small intestine.',
          '• Mixture inside tubing: Starch + Glucose solution. Surrounding water represents blood.',
          '• At 0 mins: Water contains NO starch (iodine = orange-brown) and NO glucose (Benedict\'s = blue).',
          '• After 30 mins: Water tests POSITIVE for glucose (Benedict\'s turns green/yellow/orange) because glucose molecules are small enough to diffuse through microscopic pores.',
          '• Water remains NEGATIVE for starch (iodine remains orange-brown) because starch molecules are too large to pass through.'
        ]
      }
    ]
  },

  'B8': {
    topicCode: 'B8',
    subtopicCode: 'B8.1',
    title: 'Transport in Plants: Xylem, Phloem & Transpiration',
    subject: 'biology',
    classworkDate: '02/02/2026 - 03/02/2026',
    objectives: [
      'Describe the functions and positions of xylem and phloem.',
      'Trace the pathway of water: soil -> root hair cells -> cortex -> xylem -> mesophyll cells -> stomata.',
      'Define transpiration and explain factors affecting transpiration rate using a potometer.'
    ],
    keywords: ['xylem', 'phloem', 'transpiration stream', 'potometer', 'humidity', 'stomata'],
    slides: [
      {
        title: 'Xylem vs Phloem',
        type: 'theory',
        content: [
          '• Xylem: Dead hollow tubes strengthened with lignin. Transports water and dissolved mineral ions upwards from roots to leaves; provides structural support to the plant.',
          '• Phloem: Living cells with sieve plates. Transports sucrose and amino acids both up and down the plant (translocation) to where they are needed for growth or storage.',
          '• Arrangement: In stems, xylem is located on the inside, phloem on the outside of vascular bundles.'
        ]
      },
      {
        title: 'Transpiration & Environmental Factors',
        type: 'theory',
        content: [
          '• Transpiration is the loss of water vapour from plant leaves by evaporation at mesophyll surfaces followed by diffusion through stomata.',
          '• Temperature: Higher temperature increases kinetic energy of water molecules, increasing transpiration rate.',
          '• Wind/Air Movement: Blows water vapour away from leaf surface, maintaining a steep concentration gradient, increasing transpiration rate.',
          '• Humidity: High humidity decreases the concentration gradient between inside and outside of leaf, decreasing transpiration rate.',
          '• Light Intensity: Stomata open in light for photosynthesis, increasing transpiration rate.'
        ]
      }
    ]
  },

  'B9': {
    topicCode: 'B9',
    subtopicCode: 'B9.1',
    title: 'Transport in Animals: Circulatory System, Heart & Blood',
    subject: 'biology',
    classworkDate: '09/02/2026 - 19/02/2026',
    objectives: [
      'Describe the double circulatory system in mammals and advantages.',
      'Identify heart chambers, valves, coronary arteries, and explain why left ventricle wall is thicker.',
      'Compare arteries, veins, and capillaries; explain coronary heart disease (CHD) risk factors.'
    ],
    keywords: ['double circulation', 'atrium', 'ventricle', 'valve', 'coronary artery', 'artery', 'vein', 'capillary', 'plaque', 'atherosclerosis'],
    slides: [
      {
        title: 'Double Circulation & Heart Anatomy',
        type: 'theory',
        content: [
          '• Circuit 1 (Pulmonary): Right ventricle pumps deoxygenated blood to the lungs via pulmonary artery; oxygenated blood returns via pulmonary veins to left atrium.',
          '• Circuit 2 (Systemic): Left ventricle pumps oxygenated blood to all body organs via aorta; deoxygenated blood returns via vena cava to right atrium.',
          '• Advantage: Blood is repressurized after passing through delicate lungs, allowing rapid transport at high pressure to systemic tissues.',
          '• Left Ventricle Wall: Much thicker muscular wall than right ventricle because it must generate greater pressure to pump blood around the entire body.'
        ]
      },
      {
        title: 'Blood Vessels Comparison',
        type: 'theory',
        content: [
          '• Arteries: Carry blood AWAY from heart at high pressure. Thick muscular and elastic walls; narrow lumen; NO valves.',
          '• Veins: Return blood TOWARDS heart at low pressure. Thin walls; wide lumen; VALVES present to prevent backflow of blood.',
          '• Capillaries: Microscopic vessels for exchange. Wall is ONE cell thick and permeable to provide a short diffusion distance for oxygen, glucose, and CO2.'
        ]
      },
      {
        title: 'Coronary Heart Disease (CHD)',
        type: 'theory',
        content: [
          '• Coronary arteries supply oxygen and glucose to cardiac muscle for respiration.',
          '• CHD occurs when fatty deposits (plaque / atheroma) narrow or block coronary arteries.',
          '• Reduces blood flow and oxygen to heart muscle; cells cannot respire and die, leading to a heart attack.',
          '• Controllable Risk Factors: High saturated fat diet (high cholesterol), smoking, lack of exercise, stress, obesity.',
          '• Uncontrollable Risk Factors: Genetic predisposition, increasing age, biological sex (higher in males).'
        ]
      }
    ]
  },

  'B10': {
    topicCode: 'B10',
    subtopicCode: 'B10.1',
    title: 'Pathogens, Immunity, Vaccination & Antibiotics',
    subject: 'biology',
    classworkDate: '24/02/2026 - 22/06/2026',
    objectives: [
      'Define pathogen, transmissible disease, direct and indirect transmission.',
      'Describe mechanical (skin, hairs) and chemical (mucus, stomach acid) barriers.',
      'Explain active immunity, vaccination, memory cells, and antibiotic resistance (MRSA).'
    ],
    keywords: ['pathogen', 'transmissible', 'active immunity', 'antibody', 'antigen', 'vaccine', 'memory cells', 'antibiotic resistance'],
    slides: [
      {
        title: 'Pathogens & Body Defences',
        type: 'theory',
        content: [
          '• Pathogen: A disease-causing organism (viruses, bacteria, fungi, protists).',
          '• Direct Transmission: Contact with body fluids, blood, cuts, sexual contact.',
          '• Indirect Transmission: Contaminated surfaces, air droplets (aerosols), contaminated water/food, animal vectors.',
          '• Mechanical Barriers: Skin (waterproof physical barrier), nose hairs (filter particles).',
          '• Chemical Barriers: Mucus (traps pathogens in respiratory tract; swept by cilia), Stomach acid (HCl kills swallowed pathogens).'
        ]
      },
      {
        title: 'Active Immunity & Vaccination',
        type: 'theory',
        content: [
          '• Active Immunity: Defence against a pathogen by antibody production in the body.',
          '• Antigens: Specific protein markers on pathogen surfaces.',
          '• Lymphocytes: Produce Y-shaped antibodies complementary in shape to pathogen antigens.',
          '• Vaccines: Contain weakened or dead pathogen. Stimulates antibody and MEMORY CELL production without causing disease.',
          '• Secondary Response: If infected later, memory cells recognize antigen immediately and mass-produce antibodies much faster and in higher quantities.'
        ]
      },
      {
        title: 'Antibiotics vs Painkillers & Resistance',
        type: 'theory',
        content: [
          '• Antibiotics (e.g. penicillin): Kill bacteria or inhibit cell wall synthesis. Do NOT affect viruses because viruses reproduce inside host cells.',
          '• Painkillers: Only relieve symptoms (e.g. paracetamol); do not kill pathogens.',
          '• Antibiotic Resistance: Random DNA mutations allow some bacteria to survive antibiotic treatment. Surviving resistant bacteria reproduce with less competition (natural selection). Superbugs like MRSA develop through overprescription.'
        ]
      }
    ]
  },

  'C1': {
    topicCode: 'C1',
    subtopicCode: 'C1.1',
    title: 'States of Matter & Kinetic Theory',
    subject: 'chemistry',
    classworkDate: '29/04/2025',
    objectives: [
      'Describe the arrangement, energy, and motion of particles in solids, liquids, and gases.',
      'Explain state changes (melting, boiling, evaporating, condensing, freezing, subliming).',
      'Describe gas pressure in terms of particle collisions with container walls.'
    ],
    keywords: ['solid', 'liquid', 'gas', 'kinetic energy', 'compression', 'boiling point', 'melting point', 'sublimation', 'gas pressure'],
    slides: [
      {
        title: 'States of Matter Characteristics',
        type: 'theory',
        content: [
          '• Solid: Particles tightly packed in regular lattice; vibrate about fixed positions; strong forces of attraction; fixed volume and shape; cannot be compressed.',
          '• Liquid: Particles touching but randomly arranged; slide past one another; medium kinetic energy; fixed volume, takes shape of container; cannot be compressed.',
          '• Gas: Particles far apart; move randomly at high speeds; negligible intermolecular forces; no fixed shape or volume; easily compressed into smaller volume.'
        ]
      },
      {
        title: 'Gas Pressure & Boyle\'s Law',
        type: 'theory',
        content: [
          '• Gas pressure is caused by gas particles colliding with the interior walls of their container, exerting an outward force per unit area.',
          '• Heating at constant volume: Increases particle kinetic energy and speed -> collisions with walls occur more frequently and with greater force -> pressure increases (directly proportional).',
          '• Decreasing volume: Particles are closer together -> hit container walls more often -> pressure increases (inversely proportional, Boyle\'s Law).'
        ]
      }
    ]
  },

  'C3': {
    topicCode: 'C3',
    subtopicCode: 'C3.1',
    title: 'Atomic Structure & Chemical Bonding',
    subject: 'chemistry',
    classworkDate: '30/04/2025 - 18/03/2026',
    objectives: [
      'State charges and relative masses of protons (+1, 1), neutrons (0, 1), and electrons (-1, 0.0005).',
      'Explain ionic bonding (metal loses electrons to form cation, non-metal gains to form anion) and giant ionic lattice.',
      'Describe covalent bonding (shared pair of electrons) and properties of simple molecular compounds.'
    ],
    keywords: ['proton', 'neutron', 'electron', 'atomic number', 'mass number', 'ionic bond', 'electrostatic', 'covalent bond', 'intermolecular forces'],
    slides: [
      {
        title: 'Ionic vs Simple Covalent Structures',
        type: 'theory',
        content: [
          '• Giant Ionic Lattice (e.g. NaCl): Held by strong electrostatic attraction between oppositely charged ions acting in all directions. High melting/boiling points; conduct electricity ONLY when molten or dissolved in water (ions free to move); brittle.',
          '• Simple Covalent Molecules (e.g. H2O, CH4, O2): Strong covalent bonds within molecules, but WEAK intermolecular forces between molecules. Low melting/boiling points (little energy needed to overcome weak forces); poor electrical conductors (no free electrons or ions).'
        ]
      }
    ]
  },

  'C8': {
    topicCode: 'C8',
    subtopicCode: 'C8.1',
    title: 'Acids, Bases, Indicators & Salt Preparation',
    subject: 'chemistry',
    classworkDate: '11/06/2026 - 24/06/2025',
    objectives: [
      'Define acids as H+ donors (pH < 7) and alkalis as OH- donors (pH > 7).',
      'Recall indicator colours: Litmus, Methyl orange (red in acid, yellow in neutral/alkali), Universal indicator.',
      'Describe preparation of soluble salts (acid + excess insoluble base, filtration, crystallization) and insoluble salts (precipitation).'
    ],
    keywords: ['pH', 'acid', 'base', 'alkali', 'neutralisation', 'titration', 'precipitation', 'filtrate', 'residue'],
    slides: [
      {
        title: 'Acid Reactions & General Equations',
        type: 'theory',
        content: [
          '1. Acid + Metal -> Salt + Hydrogen gas (test: lighted splint squeaky pop).',
          '2. Acid + Base / Alkali -> Salt + Water (neutralisation: H+ + OH- -> H2O).',
          '3. Acid + Metal Carbonate -> Salt + Water + Carbon dioxide (test: turns limewater cloudy/milky).'
        ]
      },
      {
        title: 'Making Copper(II) Sulfate Crystals (Practical Method)',
        type: 'practical',
        content: [
          'Step 1: Gently warm dilute sulfuric acid in a beaker over a Bunsen burner.',
          'Step 2: Add copper(II) oxide powder in EXCESS (until no more dissolves and solid remains at bottom) to ensure all acid is neutralised.',
          'Step 3: Filter the mixture using funnel and filter paper to remove unreacted copper oxide (residue). Copper sulfate solution is the filtrate.',
          'Step 4: Heat filtrate in an evaporating basin over a water bath until saturation point (crystals form on glass rod).',
          'Step 5: Leave to cool slowly so pure blue copper sulfate crystals form, then filter and dry between filter papers.'
        ]
      }
    ]
  },

  'C10': {
    topicCode: 'C10',
    subtopicCode: 'C10.1',
    title: 'Metals, Reactivity Series & Extraction',
    subject: 'chemistry',
    classworkDate: '07/11/2025 - 25/03/2026',
    objectives: [
      'Order metals by reactivity: K > Na > Ca > Mg > Al > (C) > Zn > Fe > (H) > Cu > Ag > Au.',
      'Explain extraction methods: metals above carbon (Aluminium from bauxite via electrolysis); metals below carbon (Iron from hematite via blast furnace reduction).',
      'Explain why alloys (steel, brass) are harder than pure metals.'
    ],
    keywords: ['reactivity series', 'blast furnace', 'bauxite', 'hematite', 'reduction', 'coke', 'limestone', 'alloy'],
    slides: [
      {
        title: 'The Blast Furnace (Iron Extraction)',
        type: 'theory',
        content: [
          '• Raw materials fed into top: Hematite (iron(III) oxide Fe2O3), Coke (carbon C), Limestone (calcium carbonate CaCO3). Hot air blasted in bottom.',
          '• Step 1 (Combustion): C + O2 -> CO2 (exothermic, provides heat).',
          '• Step 2 (Reducing agent formation): C + CO2 -> 2CO (carbon reduces CO2 to carbon monoxide).',
          '• Step 3 (Iron reduction): Fe2O3 + 3CO -> 2Fe + 3CO2 (iron(III) oxide loses oxygen, forming molten iron).',
          '• Limestone role: Decomposes to CaO which reacts with silica impurities to form slag (calcium silicate CaSiO3).'
        ]
      },
      {
        title: 'Structure of Alloys',
        type: 'theory',
        content: [
          '• Pure metals have regular layers of identical atoms that slide over each other easily when force is applied, making them malleable and soft.',
          '• Alloys are mixtures of a metal with different-sized atoms of other elements (e.g. carbon and chromium in iron for stainless steel).',
          '• The different-sized atoms disrupt the regular layers, preventing them from sliding, making alloys much harder and stronger.'
        ]
      }
    ]
  },

  'P1': {
    topicCode: 'P1',
    subtopicCode: 'P1.1',
    title: 'Motion, Forces, Pressure & Energy',
    subject: 'physics',
    classworkDate: '14/07/2025 - 07/08/2025',
    objectives: [
      'Use equations: v = s/t, a = Δv/t, F = ma, W = Fd, p = F/A, P = E/t, Ek = 1/2mv², ΔEp = mgh, ρ = m/V.',
      'Interpret distance-time and speed-time graphs (gradient = speed/acceleration, area under speed-time = distance).',
      'Explain friction, drag, and energy conservation.'
    ],
    keywords: ['speed', 'velocity', 'acceleration', 'resultant force', 'gravity', 'pressure', 'kinetic energy', 'gravitational potential energy', 'work done', 'power'],
    slides: [
      {
        title: 'Core Physics Equations',
        type: 'theory',
        content: [
          '• Speed: v = distance / time (m/s)',
          '• Acceleration: a = (v - u) / t (m/s²); gradient of speed-time graph.',
          '• Distance on Speed-Time Graph: Area under line (triangles + rectangles).',
          '• Newton\'s 2nd Law: Resultant Force F = m × a (N).',
          '• Weight: W = m × g (where g = 9.8 N/kg on Earth).',
          '• Pressure: p = Force / Area (N/m² or Pa).',
          '• Work Done: W = F × d (Joules, where 1 J = 1 Nm).',
          '• Gravitational Potential Energy: ΔEp = m × g × h (J).',
          '• Kinetic Energy: Ek = 1/2 × m × v² (J).',
          '• Power: P = Energy / time = Work / time (Watts, where 1 W = 1 J/s).',
          '• Efficiency: (Useful energy output / Total energy input) × 100%.'
        ]
      }
    ]
  },

  'P4': {
    topicCode: 'P4',
    subtopicCode: 'P4.1',
    title: 'Electricity, Circuits & Electrical Safety',
    subject: 'physics',
    classworkDate: '20/07/2026 - 11/08/2026',
    objectives: [
      'Define current (I = Q/t), e.m.f, and p.d.',
      'Apply Ohm\'s law V = IR and circuit rules in series and parallel.',
      'Explain safety features: fuses, circuit breakers, earthing, double insulation.'
    ],
    keywords: ['current', 'potential difference', 'e.m.f.', 'resistance', 'series', 'parallel', 'fuse', 'earthing', 'power'],
    slides: [
      {
        title: 'Series vs Parallel Circuit Rules',
        type: 'theory',
        content: [
          '• Series Circuits: Current is identical at all points (I1 = I2 = I3). Total voltage is shared across components (VT = V1 + V2). Total resistance is sum of components (RT = R1 + R2 + ...).',
          '• Parallel Circuits: Voltage across each parallel branch is equal to source voltage (VT = V1 = V2). Current splits between branches (IT = I1 + I2). Total resistance is LESS than the smallest individual resistor.',
          '• For two parallel resistors: 1/RT = 1/R1 + 1/R2 or RT = (R1 × R2) / (R1 + R2).'
        ]
      },
      {
        title: 'Electrical Safety in the Home',
        type: 'theory',
        content: [
          '• Overheating Hazard: High currents cause heating in cables due to resistance; can melt insulation and cause fires.',
          '• Fuse: Thin wire with low melting point connected in LIVE wire. Melts and breaks circuit if current exceeds its rating (e.g. 3A, 5A, 13A).',
          '• Earthing Wire: Connects metal casing to ground. If live wire frays and touches metal case, large current surges to earth, blowing the fuse immediately and preventing lethal electric shock.',
          '• Double Insulation: Appliances with plastic casing require no earth wire (symbol: square inside square).'
        ]
      }
    ]
  },

  'C9': {
    topicCode: 'C9',
    subtopicCode: 'C9.5',
    title: 'Corrosion of Metals & Rust Prevention',
    subject: 'chemistry',
    classworkDate: '08/11/2025',
    objectives: [
      'State the two conditions necessary for iron to rust: water and oxygen.',
      'Describe barrier methods for preventing rusting (painting, greasing, plastic coating).',
      'Explain sacrificial protection and galvanising using the reactivity series of metals.'
    ],
    keywords: ['corrosion', 'rusting', 'hydrated iron(III) oxide', 'barrier method', 'painting', 'galvanising', 'sacrificial protection'],
    starterLookBack: {
      question: 'What is oxidation in terms of oxygen gain, and how reactive is iron?',
      answer: 'Oxidation is the gain of oxygen (or loss of electrons). Iron is moderately reactive in the reactivity series and oxidises slowly in moist air.'
    },
    starterLookForward: {
      question: 'Why does an iron bicycle chain rust in the rain, while an aluminium food can does not?',
      answer: 'Iron forms crumbly hydrated iron(III) oxide which flakes away, exposing fresh iron to ongoing corrosion. Aluminium forms a tough, adherent oxide barrier.'
    },
    slides: [
      {
        title: 'Conditions Required for Rusting of Iron',
        type: 'theory',
        content: [
          '• Definition: Rusting is the oxidation of iron or steel into hydrated iron(III) oxide (Fe2O3·xH2O).',
          '• Mandatory Conditions: BOTH oxygen (from air) AND water must be present simultaneously.',
          '• Control Tube 1 (Tap water + air): Heavy rust forms (both oxygen and water present).',
          '• Control Tube 2 (Boiled water + oil seal): No rust (boiling removes dissolved air, oil layer excludes oxygen).',
          '• Control Tube 3 (Anhydrous calcium chloride + dry air): No rust (anhydrous CaCl2 absorbs all water vapor).',
          '• Salt Water: Dissolved sodium chloride ions act as an electrolyte, greatly accelerating rusting.'
        ]
      },
      {
        title: 'Barrier Methods of Rust Prevention',
        type: 'theory',
        content: [
          '• Principle: Form a physical, impermeable seal over iron/steel that excludes oxygen and moisture.',
          '• Painting: Large stationary steel structures (bridges, ship superstructures, car chassis, gates). Must be reapplied if chipped or scratched.',
          '• Greasing and Oiling: Moving machine parts and bicycle chains where friction would wear away paint.',
          '• Plastic Coating: Wire garden fences, dish racks, and coat hangers. Durable and waterproof.',
          '• Tin Plating: Mild steel food cans coated with tin (Sn). Unreactive and non-toxic with acidic food.'
        ]
      },
      {
        title: 'Sacrificial Protection & Galvanising',
        type: 'theory',
        content: [
          '• Galvanising: Iron or steel coated with a layer of zinc (Zn). Provides dual protection:',
          '  1. Physical barrier: Zinc prevents oxygen and water reaching the iron.',
          '  2. Sacrificial protection: If scratched, zinc is higher in reactivity series than iron (Zn > Fe). Zinc oxidises preferentially: Zn -> Zn2+ + 2e-, donating electrons to iron and saving it from rusting.',
          '• Sacrificial Anodes: Large blocks of zinc or magnesium bolted onto ship hulls, oil rigs, and underground pipelines. Replaceable when exhausted.',
          '• Stainless Steel Alloy: Iron mixed with chromium and nickel forms a self-repairing chromium oxide protective film.'
        ]
      },
      {
        title: 'Task: Match Protection Methods to Applications',
        type: 'task',
        content: ['Match each engineered product with its optimal corrosion prevention method.'],
        taskDetails: {
          taskName: 'Corrosion Prevention Matrix',
          instruction: 'Fill in the blanks using the word bank to explain corrosion and barrier protection.',
          wordBank: ['oxygen', 'water', 'hydrated iron(III) oxide', 'galvanising', 'sacrificial anode', 'greasing'],
          fillBlanksText: 'Iron rusting requires both [oxygen] and [water] to produce [hydrated iron(III) oxide]. Moving gears require [greasing] while underground pipes use a [sacrificial anode]. Motorway crash barriers use [galvanising] with zinc.',
          solution: 'oxygen, water, hydrated iron(III) oxide, greasing, sacrificial anode, galvanising.',
          challengeQuestion: 'Why does iron rust faster if connected to copper than if connected to zinc?',
          challengeSolution: 'Copper is less reactive than iron (Cu < Fe), so iron oxidises more readily to donate electrons to copper, accelerating iron corrosion. In contrast, zinc is more reactive than iron (Zn > Fe) and sacrifices itself to protect iron.'
        }
      }
    ],
    plenaryQuiz: [
      {
        question: 'Which two substances are strictly required for iron to rust?',
        options: ['Oxygen and nitrogen', 'Oxygen and water', 'Water and carbon dioxide', 'Hydrogen and oxygen'],
        answer: 'Oxygen and water'
      },
      {
        question: 'What is the chemical name for rust?',
        options: ['Iron(II) chloride', 'Hydrated iron(III) oxide', 'Iron(III) carbonate', 'Iron sulfate'],
        answer: 'Hydrated iron(III) oxide'
      },
      {
        question: 'Why does galvanised iron remain protected even if the zinc coating is scratched?',
        options: ['Zinc is less reactive than iron', 'Zinc is more reactive than iron and oxidises preferentially', 'Zinc turns into paint when scratched', 'Zinc attracts water away from iron'],
        answer: 'Zinc is more reactive than iron and oxidises preferentially'
      }
    ]
  },

  'C9.5': {
    topicCode: 'C9',
    subtopicCode: 'C9.5',
    title: 'Corrosion of Metals & Rust Prevention',
    subject: 'chemistry',
    classworkDate: '08/11/2025',
    objectives: [
      'State the two conditions necessary for iron to rust: water and oxygen.',
      'Describe barrier methods for preventing rusting (painting, greasing, plastic coating).',
      'Explain sacrificial protection and galvanising using the reactivity series of metals.'
    ],
    keywords: ['corrosion', 'rusting', 'hydrated iron(III) oxide', 'barrier method', 'painting', 'galvanising', 'sacrificial protection'],
    starterLookBack: {
      question: 'What is oxidation in terms of oxygen gain, and how reactive is iron in the reactivity series?',
      answer: 'Oxidation is the gain of oxygen (or loss of electrons). Iron is moderately reactive and oxidises slowly in moist air to form rust.'
    },
    starterLookForward: {
      question: 'Why does an iron bicycle chain rust in the rain, while an aluminium window frame does not?',
      answer: 'Iron forms crumbly hydrated iron(III) oxide which flakes away, exposing fresh iron to ongoing corrosion. Aluminium forms a tough, adherent oxide barrier.'
    },
    slides: [
      {
        title: 'Conditions Required for Rusting of Iron',
        type: 'theory',
        content: [
          '• Definition: Rusting is the oxidation of iron or steel into hydrated iron(III) oxide (Fe2O3·xH2O).',
          '• Mandatory Conditions: BOTH oxygen (from air) AND water must be present simultaneously.',
          '• Control Tube 1 (Tap water + air): Heavy rust forms (both oxygen and water present).',
          '• Control Tube 2 (Boiled water + oil seal): No rust (boiling removes dissolved air, oil layer excludes oxygen).',
          '• Control Tube 3 (Anhydrous calcium chloride + dry air): No rust (anhydrous CaCl2 absorbs all water vapor).',
          '• Salt Water: Dissolved sodium chloride ions act as an electrolyte, greatly accelerating rusting.'
        ]
      },
      {
        title: 'Barrier Methods of Rust Prevention',
        type: 'theory',
        content: [
          '• Principle: Form a physical, impermeable seal over iron/steel that excludes oxygen and moisture.',
          '• Painting: Large stationary steel structures (bridges, ship superstructures, car chassis, gates). Must be reapplied if chipped or scratched.',
          '• Greasing and Oiling: Moving machine parts and bicycle chains where friction would wear away paint.',
          '• Plastic Coating: Wire garden fences, dish racks, and coat hangers. Durable and waterproof.',
          '• Tin Plating: Mild steel food cans coated with tin (Sn). Unreactive and non-toxic with acidic food.'
        ]
      },
      {
        title: 'Sacrificial Protection & Galvanising',
        type: 'theory',
        content: [
          '• Galvanising: Iron or steel coated with a layer of zinc (Zn). Provides dual protection:',
          '  1. Physical barrier: Zinc prevents oxygen and water reaching the iron.',
          '  2. Sacrificial protection: If scratched, zinc is higher in reactivity series than iron (Zn > Fe). Zinc oxidises preferentially: Zn -> Zn2+ + 2e-, donating electrons to iron and saving it from rusting.',
          '• Sacrificial Anodes: Large blocks of zinc or magnesium bolted onto ship hulls, oil rigs, and underground pipelines. Replaceable when exhausted.',
          '• Stainless Steel Alloy: Iron mixed with chromium and nickel forms a self-repairing chromium oxide protective film.'
        ]
      },
      {
        title: 'Task: Match Protection Methods to Applications',
        type: 'task',
        content: ['Match each engineered product with its optimal corrosion prevention method.'],
        taskDetails: {
          taskName: 'Corrosion Prevention Matrix',
          instruction: 'Fill in the blanks using the word bank to explain corrosion and barrier protection.',
          wordBank: ['oxygen', 'water', 'hydrated iron(III) oxide', 'galvanising', 'sacrificial anode', 'greasing'],
          fillBlanksText: 'Iron rusting requires both [oxygen] and [water] to produce [hydrated iron(III) oxide]. Moving gears require [greasing] while underground pipes use a [sacrificial anode]. Motorway crash barriers use [galvanising] with zinc.',
          solution: 'oxygen, water, hydrated iron(III) oxide, greasing, sacrificial anode, galvanising.',
          challengeQuestion: 'Why does iron rust faster if connected to copper than if connected to zinc?',
          challengeSolution: 'Copper is less reactive than iron (Cu < Fe), so iron oxidises more readily to donate electrons to copper, accelerating iron corrosion. In contrast, zinc is more reactive than iron (Zn > Fe) and sacrifices itself to protect iron.'
        }
      }
    ],
    plenaryQuiz: [
      {
        question: 'Which two substances are strictly required for iron to rust?',
        options: ['Oxygen and nitrogen', 'Oxygen and water', 'Water and carbon dioxide', 'Hydrogen and oxygen'],
        answer: 'Oxygen and water'
      },
      {
        question: 'What is the chemical name for rust?',
        options: ['Iron(II) chloride', 'Hydrated iron(III) oxide', 'Iron(III) carbonate', 'Iron sulfate'],
        answer: 'Hydrated iron(III) oxide'
      },
      {
        question: 'Why does galvanised iron remain protected even if the zinc coating is scratched?',
        options: ['Zinc is less reactive than iron', 'Zinc is more reactive than iron and oxidises preferentially', 'Zinc turns into paint when scratched', 'Zinc attracts water away from iron'],
        answer: 'Zinc is more reactive than iron and oxidises preferentially'
      }
    ]
  }
};
