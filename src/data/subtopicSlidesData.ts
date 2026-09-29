import { ScienceSubject } from '../types';
import { chemistrySubtopicsData } from './subtopicSlidesDataChemistry';
import { physicsSubtopicsData } from './subtopicSlidesDataPhysics';

export interface ClassroomSlide {
  id: string;
  slideNumber: number;
  subtopicHeader: string; // e.g. "[B10.1] Immunity and the Spread of Disease"
  title: string;
  slideType: 'starter' | 'theory' | 'task' | 'practical' | 'afl' | 'plenary' | 'diagram' | 'math';
  content: string[];
  keywords?: string[];
  task?: {
    taskName: string;
    instructions: string;
    wordBank?: string[];
    fillBlanks?: string;
    solution: string;
    challengeQuestion?: string;
    challengeSolution?: string;
  };
  practicalInfo?: {
    aim: string;
    equipment: string[];
    method: string[];
    riskAssessment: { hazard: string; risk: string; precaution: string }[];
  };
}

export interface TeacherSlideDeck {
  id: string;
  subtopicCode: string; // e.g. 'B10.1'
  topicCode: string; // e.g. 'B10'
  title: string;
  subtopicHeader: string; // e.g. '[B10.1] Immunity and the Spread of Disease'
  classworkDate?: string;
  objectives: string[];
  keywords: string[];
  starterLookBack?: { question: string; answer: string };
  starterLookForward?: { question: string; answer?: string };
  slides: ClassroomSlide[];
}

export interface SubtopicTopicGroup {
  subtopicCode: string; // e.g. 'B1.1'
  topicCode: string; // e.g. 'B1'
  topicName: string; // e.g. 'Characteristics of living organisms'
  title: string; // e.g. 'Characteristics of living organisms (MRS GREN)'
  subject: ScienceSubject;
  tier: 'Core' | 'Supplement' | 'Core & Supplement';
  syllabusSummary: string[];
  decks: TeacherSlideDeck[];
  googleSlidesEmbedUrl?: string;
  googleSlidesUrl?: string;
}

// Full Cambridge IGCSE Combined Science 0653 Biology Subtopics
export const biologySubtopicsData: SubtopicTopicGroup[] = [
  // ==========================================
  // BIOLOGY (B1 - B16)
  // ==========================================
  {
    subtopicCode: 'B1.1',
    topicCode: 'B1',
    topicName: 'Characteristics of living organisms',
    title: 'Characteristics of Living Organisms (MRS GREN)',
    subject: 'biology',
    tier: 'Core',
    syllabusSummary: [
      'Describe the 7 characteristics of living organisms (MRS GREN).',
      'Define movement, respiration, sensitivity, growth, reproduction, excretion, and nutrition.'
    ],
    decks: [
      {
        id: 'deck-b1-1',
        subtopicCode: 'B1.1',
        topicCode: 'B1',
        title: 'Characteristics of Living Things (MRS GREN)',
        subtopicHeader: '[B1.1] Characteristics of Living Things',
        classworkDate: 'xx/xx/xxxx',
        objectives: [
          'Explain the scientific definition of living using the acronym MRS GREN.',
          'Determine between examples of living and non-living substances.'
        ],
        keywords: ['living', 'non-living', 'respiration', 'reproduction', 'movement', 'sensitivity', 'growth', 'excretion', 'nutrition'],
        starterLookBack: {
          question: 'How many Cambridge exams will you sit, what are they, and when do you sit them?',
          answer: '3 exams: Multiple choice (Paper 1/2), Theory (Paper 3/4), and Practical Skills (Paper 5/6), sat in Term 4 of Year 11.'
        },
        starterLookForward: {
          question: 'What does it mean to be alive and why is defining life hard?',
          answer: 'Defining life is hard, so we determine if something is living or non-living based on observable characteristics. Aristotle said that if something grows, maintains itself and reproduces, it is alive.'
        },
        slides: [
          {
            id: 'b1-1-s1',
            slideNumber: 1,
            subtopicHeader: '[B1.1] Starter & Lesson Objectives',
            title: 'Starter: Origins of Life & Defining Life',
            slideType: 'starter',
            content: [
              '• Objectives: Explain the scientific definition of living using MRS GREN; determine between living and non-living.',
              '• Keywords: living, non-living, respiration, reproduction, movement, sensitivity, growth, excretion, nutrition.',
              '• Look forward: Which things around you are alive and how do you know?'
            ]
          },
          {
            id: 'b1-1-s2',
            slideNumber: 2,
            subtopicHeader: '[B1.1] Seven Life Processes',
            title: 'The 7 Life Processes (MRS GREN)',
            slideType: 'theory',
            content: [
              'All living organisms must carry out 7 life processes to be considered alive:',
              '• Movement: Action by an organism or part causing change of position or place.',
              '• Respiration: Chemical reactions in cells transforming glucose and oxygen into energy (ATP). CO2 and water are waste products.',
              '• Sensitivity: Ability to detect and react to changes in the environment.',
              '• Growth: Permanent increase in size and dry mass.',
              '• Reproduction: Creation of offspring (clones or genetic variation) to prevent extinction.',
              '• Excretion: Getting rid of toxic waste products of metabolism from body cells.',
              '• Nutrition: Taking in materials and nutrients required for energy and growth.'
            ]
          },
          {
            id: 'b1-1-s3',
            slideNumber: 3,
            subtopicHeader: '[B1.1] Task & Fill in Gaps',
            title: 'Task 1 & 2: Life Processes & Origin Stories',
            slideType: 'task',
            content: [
              'Task One: Match the life process with the definition.',
              'Task Two: Why is it essential that organisms reproduce?',
              'Task Three: Would you classify a humanoid robot as alive? Justify with MRS GREN.'
            ],
            task: {
              taskName: 'MRS GREN Concept Application',
              instructions: 'Complete the match and justify why fire or a robot is not alive.',
              wordBank: ['Papatūānuku', 'living', 'grows', 'mythological', 'non-living', 'Ranginui', 'characteristics', 'scientific', 'reproduces'],
              fillBlanks: 'There are many theories on how life originated on earth, from [mythological] stories to [scientific] theories. An example is the Māori creation story involving [Papatūānuku] and [Ranginui]. Aristotle said if something [grows], maintains itself and [reproduces] it is alive.',
              solution: 'Robot is non-living because it only displays movement and sensitivity; it does not respire, excrete, grow, reproduce, or require nutrition.',
              challengeQuestion: 'Explain which processes fire carries out and why fire is NOT a living organism.',
              challengeSolution: 'Fire consumes fuel and oxygen and grows, but it is not composed of cells, does not have DNA, does not excrete metabolic waste, and does not carry out biological reproduction.'
            }
          },
          {
            id: 'b1-1-s4',
            slideNumber: 4,
            subtopicHeader: '[B1.1] Plenary Check',
            title: 'Plenary: Check Your Understanding',
            slideType: 'plenary',
            content: [
              '1. What 7 life processes must all living organisms carry out? (MRS GREN)',
              '2. State one similarity and one difference between plant and animal movement.',
              '3. Why is respiration considered a chemical process rather than breathing?'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'B2.1',
    topicCode: 'B2',
    topicName: 'Cells',
    title: 'Cell Structure & Specialised Cells',
    subject: 'biology',
    tier: 'Core & Supplement',
    syllabusSummary: [
      'Describe and compare plant and animal cell ultrastructure (nucleus, cytoplasm, cell membrane, cell wall, chloroplasts, mitochondria, ribosomes, vacuole).',
      'Describe bacterial cells (circular DNA, plasmids, ribosomes, cell wall, cell membrane).',
      'Explain specialised cell adaptations: red blood cells, root hair cells, palisade mesophyll cells.',
      'Describe levels of organisation: cells -> tissues -> organs -> organ systems -> organisms.'
    ],
    decks: [
      {
        id: 'deck-b2-1-cells',
        subtopicCode: 'B2.1',
        topicCode: 'B2',
        title: 'Cells & Subcellular Structures',
        subtopicHeader: '[B2.1] Cells & Organisation',
        classworkDate: '24/01/2025',
        objectives: [
          'Define cell, tissue, organ, organ system and organism.',
          'Identify and label animal, plant and bacteria cells from simple diagrams.',
          'Explain the functions of key subcellular structures.'
        ],
        keywords: ['cytoplasm', 'vacuole', 'mitochondria', 'cell membrane', 'nucleus', 'chloroplast', 'cell wall', 'ribosomes'],
        starterLookBack: {
          question: 'What are the seven life processes and which one means responding to environmental changes?',
          answer: 'Movement, Respiration, Sensitivity, Growth, Reproduction, Excretion, Nutrition. Sensitivity means responding to changes.'
        },
        slides: [
          {
            id: 'b2-1-s1',
            slideNumber: 1,
            subtopicHeader: '[B2.1] Cell Structures',
            title: 'Plant, Animal and Bacterial Organelles',
            slideType: 'theory',
            content: [
              '• Nucleus: Contains chromosomes made of DNA; controls cellular activities.',
              '• Cytoplasm: Gel-like substance where metabolic reactions take place.',
              '• Cell Membrane: Partially permeable layer controlling what enters and exits.',
              '• Mitochondria: Aerobic respiration takes place to release energy (ATP).',
              '• Ribosomes: Synthesise proteins using amino acids.',
              '• Cell Wall: Made of cellulose; fully permeable; supports cell & prevents bursting.',
              '• Chloroplast: Contains green chlorophyll; site of photosynthesis.',
              '• Vacuole: Large central sac containing cell sap; maintains turgor pressure.',
              '• Bacteria (Prokaryotes): Lack a nucleus; contain circular DNA loop and extra circular plasmids.'
            ]
          },
          {
            id: 'b2-1-s2',
            slideNumber: 2,
            subtopicHeader: '[B2.1] Levels of Organisation',
            title: 'Hierarchy of Biological Organisation',
            slideType: 'theory',
            content: [
              '• Organelle: Subcellular structure (e.g. nucleus, mitochondrion).',
              '• Cell: Smallest functional unit of a living organism (e.g. muscle cell).',
              '• Tissue: Group of similar cells working together to perform a function (e.g. muscle tissue).',
              '• Organ: Group of different tissues working together (e.g. stomach, heart).',
              '• Organ System: Group of different organs performing a coordinated body function (e.g. digestive system, circulatory system).',
              '• Organism: Complete living individual plant or animal.'
            ]
          }
        ]
      },
      {
        id: 'deck-b2-1-specialised',
        subtopicCode: 'B2.1',
        topicCode: 'B2',
        title: 'Specialised Cells & Adaptations',
        subtopicHeader: '[B2.1] Specialised Cells',
        classworkDate: '11/02/2025',
        objectives: [
          'Describe the role and adaptations of specialised cells.',
          'Explain the functions of red blood cells, root hair cells, and palisade mesophyll cells.'
        ],
        keywords: ['specialised', 'differentiated', 'palisade', 'mesophyll', 'haemoglobin', 'biconcave', 'surface area'],
        starterLookBack: {
          question: 'What structures are found in both plant and animal cells, and which are ONLY in plant cells?',
          answer: 'Both: nucleus, cytoplasm, cell membrane, mitochondria, ribosomes. ONLY plant: cellulose cell wall, chloroplasts, large permanent vacuole.'
        },
        slides: [
          {
            id: 'b2-1-spec-s1',
            slideNumber: 1,
            subtopicHeader: '[B2.1] Specialised Cells',
            title: 'Key Specialised Cells & Their Adaptations',
            slideType: 'theory',
            content: [
              '1. Red Blood Cell: Transports oxygen from lungs to respiring body tissues.',
              '   • Biconcave disc shape increases surface area to volume ratio for rapid oxygen diffusion.',
              '   • Contains haemoglobin pigment that binds oxygen into oxyhaemoglobin.',
              '   • Has NO nucleus: maximizes internal space to carry more haemoglobin.',
              '   • Very flexible: squeezes through narrow capillary lumens without rupturing.',
              '2. Root Hair Cell: Absorbs water and mineral ions from soil.',
              '   • Long, thin projection creates large surface area for absorption by osmosis.',
              '   • Thin cell wall allows short diffusion pathway.',
              '3. Palisade Mesophyll Cell: Primary site of photosynthesis in leaves.',
              '   • Tall and columnar; tightly packed at upper surface to absorb maximum sunlight.',
              '   • Packed with high concentration of chloroplasts.'
            ]
          },
          {
            id: 'b2-1-spec-s2',
            slideNumber: 2,
            subtopicHeader: '[B2.1] Specialised Cells Task',
            title: 'Task: Specialised Cells Summary & Challenge',
            slideType: 'task',
            content: [
              'Task 1: Complete table of cell type, adaptations, and biological function.',
              'Task 2: Why must red blood cells be flexible?',
              'Challenge: Antarctic icefish survive with no red blood cells or haemoglobin. Explain how.'
            ],
            task: {
              taskName: 'Specialised Cells Analysis',
              instructions: 'Answer questions in full biological sentences.',
              solution: 'RBCs must squeeze through capillaries that are only 5-8 μm wide without getting stuck.',
              challengeQuestion: 'Why can icefish survive in cold Antarctic waters without haemoglobin in their blood?',
              challengeSolution: 'Very cold water holds a significantly higher concentration of dissolved oxygen, so oxygen diffuses directly into the blood plasma to meet the fish\'s metabolic demands.'
            }
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'B2.2',
    topicCode: 'B2',
    topicName: 'Cells',
    title: 'Size of Specimens & Microscope Calculations',
    subject: 'biology',
    tier: 'Core & Supplement',
    syllabusSummary: [
      'Formula: Magnification = Image size / Actual size (M = I / A).',
      'Convert units between millimetres (mm) and micrometres (μm) (1 mm = 1000 μm).',
      'Microscope parts and practical preparation of onion epidermis stained with iodine.'
    ],
    decks: [
      {
        id: 'deck-b2-2-calcs',
        subtopicCode: 'B2.2',
        topicCode: 'B2',
        title: 'Microscope Calculations (M = I / A)',
        subtopicHeader: '[B2.2] Microscope Calculations',
        classworkDate: '13/02/2025',
        objectives: [
          'Recap parts of a light microscope.',
          'Calculate total magnification = eyepiece lens × objective lens.',
          'Use the formula: Image size = Actual size × Magnification (I = A × M).'
        ],
        keywords: ['magnify', 'real image', 'actual size', 'micrometre', 'millimetre', 'objective lens', 'eyepiece'],
        starterLookBack: {
          question: 'What is a specialised cell and name two adaptations of red blood cells?',
          answer: 'A cell differentiated for a specific function. RBC: biconcave disc (high SA:V ratio), no nucleus (more haemoglobin), flexible.'
        },
        slides: [
          {
            id: 'b2-2-c1',
            slideNumber: 1,
            subtopicHeader: '[B2.2] Magnification Formula Triangle',
            title: 'The Magnification Triangle (I = A × M)',
            slideType: 'math',
            content: [
              '• Total Magnification = Eyepiece lens magnification × Objective lens magnification.',
              '  Example: 10x eyepiece × 40x objective = 400x total magnification.',
              '• The I-A-M Triangle:',
              '  - Magnification (M) = Image size (I) ÷ Actual real size (A)',
              '  - Actual size (A) = Image size (I) ÷ Magnification (M)',
              '  - Image size (I) = Actual size (A) × Magnification (M)',
              '• Critical Step: Image size (I) and Actual size (A) MUST be in the same units!',
              '  - 1 cm = 10 mm = 10,000 μm',
              '  - 1 mm = 1,000 μm'
            ]
          },
          {
            id: 'b2-2-c2',
            slideNumber: 2,
            subtopicHeader: '[B2.2] Worked Calculation Examples',
            title: 'Step-by-Step Microscope Calculations',
            slideType: 'math',
            content: [
              'Example 1: An image of a cell is 8 mm long. Magnification is x100. Find actual size in mm.',
              '  A = I ÷ M = 8 mm ÷ 100 = 0.08 mm (or 80 μm).',
              'Example 2: Actual diameter is 30 μm. Image is 9 mm. Calculate magnification.',
              '  Convert units: I = 9 mm × 1000 = 9000 μm.',
              '  M = I ÷ A = 9000 μm ÷ 30 μm = x300.',
              'Example 3: A starch grain measures 2.5 cm across under x100. Find actual size in μm.',
              '  I = 2.5 cm × 10,000 = 25,000 μm. A = 25,000 ÷ 100 = 250 μm.'
            ]
          }
        ]
      },
      {
        id: 'deck-b2-2-practical',
        subtopicCode: 'B2.2',
        topicCode: 'B2',
        title: 'Microscopes Practical: Preparing Onion Epidermis Slide',
        subtopicHeader: '[B2.2] Microscopes Practical',
        classworkDate: '14/02/2025',
        objectives: [
          'Follow a method accurately and safely to prepare a microscope slide.',
          'Draw an accurate scientific line drawing and calculate magnification and cell size from field of view.'
        ],
        keywords: ['slide', 'cover slip', 'iodine', 'stain', 'coarse focus', 'fine focus', 'field of view'],
        slides: [
          {
            id: 'b2-2-p1',
            slideNumber: 1,
            subtopicHeader: '[B2.2] Onion Slide Practical Method',
            title: 'Specimen Preparation Method & Safety',
            slideType: 'practical',
            content: [
              '1. Peel a thin, transparent, single-cell layer of onion epidermis using forceps.',
              '2. Place flat on clean glass slide without creases or overlapping.',
              '3. Add 1 drop of iodine solution to stain cell nuclei and starch.',
              '4. Lower cover slip slowly at 45° angle with a mounted needle to prevent air bubbles.',
              '5. Place on stage; begin on lowest power (x4) objective for widest field of view.',
              '6. Focus with coarse adjustment knob, then sharpen with fine focus knob.'
            ],
            practicalInfo: {
              aim: 'Prepare a specimen slide of onion epidermis and observe under light microscope.',
              equipment: ['Glass slide', 'Cover slip', 'Onion', 'Iodine solution', 'Mounted needle', 'Forceps', 'Dropper pipette', 'Light microscope'],
              method: [
                'Peel thin onion epidermis.',
                'Place flat on glass slide.',
                'Stain with 1 drop iodine.',
                'Lower cover slip at angle to avoid air bubbles.',
                'Observe starting at x4 objective, then switch to x10 or x40.'
              ],
              riskAssessment: [
                { hazard: 'Iodine solution', risk: 'Harmful, skin/eye irritant, stains', precaution: 'Wear safety goggles; wash skin immediately if contact occurs.' },
                { hazard: 'Glassware / Scalpel', risk: 'Cuts from broken glass or blade', precaution: 'Cut on white tile; report breakages to teacher; handle with care.' }
              ]
            }
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'B3.1',
    topicCode: 'B3',
    topicName: 'Movement into and out of cells',
    title: 'Diffusion',
    subject: 'biology',
    tier: 'Core & Supplement',
    syllabusSummary: [
      'Define diffusion as net movement of particles from higher to lower concentration down a concentration gradient.',
      'Factors affecting rate: surface area, temperature, concentration gradient, distance.',
      'Gas exchange and solute diffusion across membranes.'
    ],
    decks: [
      {
        id: 'deck-b3-1',
        subtopicCode: 'B3.1',
        topicCode: 'B3',
        title: 'Diffusion & Factors Affecting Rate',
        subtopicHeader: '[B3.1] Diffusion',
        classworkDate: '18/02/2025',
        objectives: [
          'Define diffusion as the net movement of particles from high to low concentration down a concentration gradient.',
          'State the 4 factors that affect the rate of diffusion: surface area, temperature, concentration gradient, distance.'
        ],
        keywords: ['concentration gradient', 'net movement', 'equilibrium', 'kinetic energy', 'diffusion distance'],
        starterLookBack: {
          question: 'If a 30 μm red blood cell has magnification x300, what is the image size in mm?',
          answer: 'I = A × M = 30 μm × 300 = 9000 μm = 9 mm.'
        },
        slides: [
          {
            id: 'b3-1-s1',
            slideNumber: 1,
            subtopicHeader: '[B3.1] Diffusion Definition',
            title: 'What is Diffusion?',
            slideType: 'theory',
            content: [
              '• Diffusion is the net movement of particles (molecules or ions) from a region of higher concentration to a region of lower concentration, down a concentration gradient, as a result of their random motion.',
              '• Passive Process: Requires no energy input from the cell.',
              '• Biological Examples:',
              '  - Oxygen diffuses from high concentration in alveoli into low concentration in blood.',
              '  - Carbon dioxide diffuses from blood into alveoli to be exhaled.',
              '  - Glucose diffuses from gut cavity across villi epithelium into blood.'
            ]
          },
          {
            id: 'b3-1-s2',
            slideNumber: 2,
            subtopicHeader: '[B3.1] Factors Affecting Rate',
            title: '4 Factors Influencing Diffusion Rate',
            slideType: 'theory',
            content: [
              '1. Concentration Gradient: The steeper the concentration difference between two areas, the faster the net diffusion.',
              '2. Temperature: Higher temperature -> particles have greater kinetic energy -> move faster -> collide more frequently -> faster diffusion.',
              '3. Surface Area: Larger surface area of membrane -> more particles can diffuse simultaneously -> faster rate.',
              '4. Distance: Shorter diffusion pathway (e.g. alveoli walls are one cell thick) -> faster diffusion.'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'B3.2',
    topicCode: 'B3',
    topicName: 'Movement into and out of cells',
    title: 'Osmosis & Potato Cylinder Practical',
    subject: 'biology',
    tier: 'Core & Supplement',
    syllabusSummary: [
      'Define osmosis as net diffusion of water molecules through a partially permeable membrane from dilute (high water potential) to concentrated (low water potential).',
      'Investigate potato cylinders in varying sucrose/salt concentrations.',
      'Explain effects on plant cells (turgid, turgor pressure, flaccid, plasmolysis) and animal cells (lysis, shrivelling).'
    ],
    decks: [
      {
        id: 'deck-b3-2-theory',
        subtopicCode: 'B3.2',
        topicCode: 'B3',
        title: 'Osmosis in Plant and Animal Cells',
        subtopicHeader: '[B3.2] Osmosis',
        classworkDate: '26/02/2026',
        objectives: [
          'Define osmosis and compare with diffusion and active transport.',
          'Describe turgid, flaccid, plasmolysis in plants and cell lysis in animal cells.'
        ],
        keywords: ['osmosis', 'partially permeable', 'dilute', 'concentrated', 'turgid', 'flaccid', 'plasmolysis', 'cell lysis'],
        slides: [
          {
            id: 'b3-2-s1',
            slideNumber: 1,
            subtopicHeader: '[B3.2] Osmosis Definition',
            title: 'Osmosis & Water Potential',
            slideType: 'theory',
            content: [
              '• Osmosis is the net movement of water molecules from a region of higher water potential (dilute solution) to a region of lower water potential (concentrated solution) through a partially permeable membrane.',
              '• Dilute Solution = High water concentration, low solute.',
              '• Concentrated Solution = Low water concentration, high solute.',
              '• Partially Permeable Membrane: Microscopic holes allow small water molecules to pass, but block larger solute molecules (sucrose, starch).'
            ]
          },
          {
            id: 'b3-2-s2',
            slideNumber: 2,
            subtopicHeader: '[B3.2] Plant vs Animal Cells',
            title: 'Cellular Effects of Osmosis',
            slideType: 'theory',
            content: [
              '• Animal Cell in Pure Water: Water enters by osmosis -> swells -> bursts (CELL LYSIS) because it lacks a rigid cell wall.',
              '• Animal Cell in Concentrated Salt: Water leaves by osmosis -> shrinks / shrivels.',
              '• Plant Cell in Pure Water: Water enters -> vacuole swells -> pushes against strong cellulose cell wall -> cell becomes TURGID (turgor pressure supports non-woody stems).',
              '• Plant Cell in Concentrated Salt: Water leaves -> vacuole shrinks -> cytoplasm pulls away from cell wall -> cell becomes FLACCID and PLASMOLYSED.'
            ]
          }
        ]
      },
      {
        id: 'deck-b3-2-practical',
        subtopicCode: 'B3.2',
        topicCode: 'B3',
        title: 'Osmosis Practical: Potato Cylinders in Solutions',
        subtopicHeader: '[B3.2] Osmosis Practical',
        classworkDate: '25/02/2025 - 04/03/2026',
        objectives: [
          'Plan and carry out practical testing effect of sugar/salt concentration on mass of plant tissue.',
          'Calculate percentage change in mass: % change = (Change in mass / Initial mass) × 100.'
        ],
        keywords: ['cork borer', 'independent variable', 'dependent variable', 'blot dry', 'percentage change'],
        slides: [
          {
            id: 'b3-2-p1',
            slideNumber: 1,
            subtopicHeader: '[B3.2] Potato Osmosis Method',
            title: 'Potato Practical Method & Variables',
            slideType: 'practical',
            content: [
              '• IV: Concentration of salt/sugar solution (0M, 0.2M, 0.4M, 0.6M, 0.8M, 1.0M).',
              '• DV: Percentage change in mass (%) = [(Final mass - Initial mass) / Initial mass] × 100.',
              '• Control Variables: Same potato, cylinder diameter, volume of solution (20 cm³), immersion time, temperature.',
              '• Key Technique: Carefully BLOT DRY potato cylinders with paper towel before recording final mass to remove excess external surface liquid.'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'B3.3',
    topicCode: 'B3',
    topicName: 'Movement into and out of cells',
    title: 'Active Transport',
    subject: 'biology',
    tier: 'Supplement',
    syllabusSummary: [
      'Define active transport as movement of particles through a membrane against a concentration gradient using energy from respiration.',
      'Importance in root hairs for ion uptake (e.g. nitrates) and in gut for glucose absorption.'
    ],
    decks: [
      {
        id: 'deck-b3-3',
        subtopicCode: 'B3.3',
        topicCode: 'B3',
        title: 'Active Transport: Energy-Dependent Movement',
        subtopicHeader: '[B3.3] Active Transport',
        classworkDate: '19/02/2025',
        objectives: [
          'Define active transport and identify where it takes place.',
          'Explain why active transport is essential for living organisms.'
        ],
        keywords: ['active transport', 'concentration gradient', 'energy', 'respiration', 'carrier protein', 'root hair cells'],
        slides: [
          {
            id: 'b3-3-s1',
            slideNumber: 1,
            subtopicHeader: '[B3.3] Active Transport Fundamentals',
            title: 'Mechanism of Active Transport',
            slideType: 'theory',
            content: [
              '• Definition: Active transport is the movement of particles through a cell membrane from a region of lower concentration to a region of higher concentration (i.e. AGAINST a concentration gradient), using energy from respiration.',
              '• Carrier Proteins: Specific transport proteins embedded in the cell membrane use ATP energy to pump particles across against the gradient.',
              '• Dependence on Respiration: Any factor that reduces respiration (e.g. lack of oxygen, cyanide poison, cold) slows or stops active transport.'
            ]
          },
          {
            id: 'b3-3-s2',
            slideNumber: 2,
            subtopicHeader: '[B3.3] Real-Life Examples',
            title: 'Crucial Roles in Plants & Animals',
            slideType: 'theory',
            content: [
              '1. Mineral Ion Uptake in Plants: Nitrate and sulfate ion concentration in soil water is very low (e.g. 0.15 mmol/dm³), while inside root hair cells it is high (e.g. 1.4 mmol/dm³). Plants use active transport to absorb these ions.',
              '2. Glucose Absorption in Small Intestine: When glucose concentration in the blood is higher than in the intestinal lumen, active transport ensures no nutrients are wasted.',
              '3. Salt Glands in Crocodiles: Specialized salt glands actively excrete excess salt from the blood into the sea against a steep gradient.'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'B4.1',
    topicCode: 'B4',
    topicName: 'Biological molecules',
    title: 'Biological Molecules & Food Tests',
    subject: 'biology',
    tier: 'Core',
    syllabusSummary: [
      'Chemical elements in carbohydrates (C, H, O), fats (C, H, O), proteins (C, H, O, N, sometimes S).',
      'Large molecules from smaller subunits: starch/glycogen/cellulose from glucose; proteins from amino acids; lipids from fatty acids & glycerol.',
      'Food tests: Iodine for starch, Benedict\'s for reducing sugars, Biuret for proteins, Ethanol emulsion for lipids.'
    ],
    decks: [
      {
        id: 'deck-b4-1',
        subtopicCode: 'B4.1',
        topicCode: 'B4',
        title: 'Biological Molecules & Qualitative Food Tests',
        subtopicHeader: '[B4.1] Biological Molecules',
        classworkDate: '20/04/2026 - 24/04/2026',
        objectives: [
          'List chemical elements that make up carbohydrates, fats, and proteins.',
          'Describe food tests for sugar, starch, proteins, and lipids.'
        ],
        keywords: ['carbohydrates', 'lipids', 'proteins', 'glucose', 'starch', 'glycogen', 'amino acids', 'benedict', 'biuret'],
        slides: [
          {
            id: 'b4-1-s1',
            slideNumber: 1,
            subtopicHeader: '[B4.1] Molecular Subunits',
            title: 'Elements & Monomers of Macromolecules',
            slideType: 'theory',
            content: [
              '• Carbohydrates: Carbon (C), Hydrogen (H), Oxygen (O). Monomer is simple sugar (glucose). Form complex polymers: Starch (plant storage), Glycogen (animal storage), Cellulose (plant cell walls).',
              '• Lipids (Fats & Oils): Carbon (C), Hydrogen (H), Oxygen (O). Built from 1 glycerol molecule joined to 3 fatty acid chains. Used for long-term energy storage, insulation, and cell membranes.',
              '• Proteins: Carbon (C), Hydrogen (H), Oxygen (O), Nitrogen (N), and sometimes Sulfur (S). Built from 20 different amino acids joined in unique sequences.'
            ]
          },
          {
            id: 'b4-1-s2',
            slideNumber: 2,
            subtopicHeader: '[B4.1] Food Tests Summary',
            title: 'Official Food Tests Reagents & Results',
            slideType: 'practical',
            content: [
              '1. Reducing Sugars (Glucose): Add Benedict\'s solution and heat in water bath (~80°C). Result: Blue -> Green -> Yellow -> Brick-red precipitate.',
              '2. Starch: Add drops of Iodine solution. Result: Orange-brown -> Blue-black.',
              '3. Proteins: Add Biuret reagent (NaOH + CuSO4). Result: Pale blue -> Purple / Lilac.',
              '4. Lipids: Shake with Ethanol, then pour into cold water. Result: Colourless -> Milky-white emulsion.'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'B5.1',
    topicCode: 'B5',
    topicName: 'Enzymes',
    title: 'Enzymes & Amylase pH Practical',
    subject: 'biology',
    tier: 'Core & Supplement',
    syllabusSummary: [
      'Describe enzymes as proteins functioning as biological catalysts.',
      'Explain enzyme action with active site, enzyme-substrate complex, substrate, and product (lock & key).',
      'Explain effects of temperature and pH on activity: kinetic energy, collision frequency, denaturation.'
    ],
    decks: [
      {
        id: 'deck-b5-1',
        subtopicCode: 'B5.1',
        topicCode: 'B5',
        title: 'Enzymes: Mechanism, Temperature & pH',
        subtopicHeader: '[B5.1] Enzymes',
        classworkDate: '30/04/2026 - 06/05/2026',
        objectives: [
          'Explain the structure and function of enzymes including lock and key model.',
          'Explain the effects of temperature and pH on enzyme activity and denaturation.',
          'Plan and carry out amylase starch breakdown with spotting tiles and iodine.'
        ],
        keywords: ['enzyme', 'catalyst', 'active site', 'substrate', 'complex', 'denature', 'optimum', 'amylase', 'buffer'],
        slides: [
          {
            id: 'b5-1-s1',
            slideNumber: 1,
            subtopicHeader: '[B5.1] Lock and Key Theory',
            title: 'Enzyme Action & Specificity',
            slideType: 'theory',
            content: [
              '• Enzymes are 3D globular proteins functioning as biological catalysts (speed up reactions without being used up).',
              '• Lock and Key Theory:',
              '  - Active site has a specific, complementary 3D shape.',
              '  - Substrate molecule fits into active site like a key into a lock.',
              '  - Forms temporary Enzyme-Substrate Complex.',
              '  - Chemical bonds break/form, releasing products. Enzyme is unchanged.'
            ]
          },
          {
            id: 'b5-1-s2',
            slideNumber: 2,
            subtopicHeader: '[B5.1] Amylase pH Practical',
            title: 'Investigating pH on Amylase Activity',
            slideType: 'practical',
            content: [
              '• Method: Mix 2 cm³ amylase with 1 cm³ pH buffer (pH 3, 6, 8, 11) and 2 cm³ starch solution.',
              '• Every 30 seconds, add a drop of mixture to an iodine spot on a dimple tile.',
              '• While starch is present: Iodine turns blue-black.',
              '• When all starch is digested to glucose: Iodine remains orange-brown.',
              '• Rate is fastest at optimum pH (around pH 7 for amylase). At extreme acidic (pH 2) or alkaline (pH 14) conditions, active site denatures and starch is NEVER broken down.'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'B6.1',
    topicCode: 'B6',
    topicName: 'Plant nutrition',
    title: 'Photosynthesis, Limiting Factors & Leaves',
    subject: 'biology',
    tier: 'Core & Supplement',
    syllabusSummary: [
      'Define photosynthesis; word & balanced symbol equation: 6CO2 + 6H2O -> C6H12O6 + 6O2.',
      'Chlorophyll transfers light energy into chemical energy in carbohydrates.',
      'Limiting factors: light intensity, CO2 concentration, temperature.',
      'Gas exchange with hydrogencarbonate indicator; variegated leaf starch testing.'
    ],
    decks: [
      {
        id: 'deck-b6-1',
        subtopicCode: 'B6.1',
        topicCode: 'B6',
        title: 'Photosynthesis Equations & Limiting Factors',
        subtopicHeader: '[B6.1] Photosynthesis',
        classworkDate: '06/05/2026 - 13/05/2026',
        objectives: [
          'Describe photosynthesis and write word & balanced symbol equations.',
          'Describe the uses of glucose in plants.',
          'Explain limiting factors (light, CO2, temperature) and analyze rate graphs.'
        ],
        keywords: ['photosynthesis', 'chlorophyll', 'glucose', 'limiting factor', 'hydrogencarbonate', 'variegated'],
        slides: [
          {
            id: 'b6-1-s1',
            slideNumber: 1,
            subtopicHeader: '[B6.1] Photosynthesis Equations',
            title: 'Chemical Reactions of Photosynthesis',
            slideType: 'theory',
            content: [
              '• Photosynthesis: Process by which plants synthesize carbohydrates from raw materials using light energy absorbed by chlorophyll.',
              '• Word equation: Carbon dioxide + water -> glucose + oxygen (in presence of light & chlorophyll).',
              '• Balanced symbol equation: 6CO2 + 6H2O -> C6H12O6 + 6O2.',
              '• Uses of Glucose in Plants: 1) Respiration; 2) Stored as insoluble starch; 3) Converted to cellulose for cell walls; 4) Combined with nitrates to make amino acids & proteins; 5) Converted into oils/lipids in seeds.'
            ]
          },
          {
            id: 'b6-1-s2',
            slideNumber: 2,
            subtopicHeader: '[B6.1] Limiting Factors',
            title: 'Light, CO2 and Temperature Graphs',
            slideType: 'theory',
            content: [
              '• Limiting Factor: The environmental factor in shortest supply that limits or slows down rate.',
              '• Light Intensity: As light increases, rate increases proportionally until it plateaus (another factor like CO2 or temp is limiting).',
              '• Carbon Dioxide: As CO2 increases, rate increases until it plateaus.',
              '• Temperature: As temperature increases to optimum (~25-30°C), kinetic energy increases rate. Above optimum, enzymes denature and rate drops to zero.'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'B6.2',
    topicCode: 'B6',
    topicName: 'Plant nutrition',
    title: 'Leaf Structure & Adaptations',
    subject: 'biology',
    tier: 'Core',
    syllabusSummary: [
      'Identify in leaf cross-sections: cuticle, upper and lower epidermis, guard cells and stomata, palisade mesophyll, spongy mesophyll, air spaces, vascular bundle (xylem and phloem).'
    ],
    decks: [
      {
        id: 'deck-b6-2',
        subtopicCode: 'B6.2',
        topicCode: 'B6',
        title: 'Leaf Anatomy Cross-Section & Gas Exchange',
        subtopicHeader: '[B6.2] Leaf Structure',
        classworkDate: '15/05/2026',
        objectives: [
          'Identify and label all structures in a dicotyledonous leaf cross-section.',
          'Explain how each structure adapts the leaf for photosynthesis and gas exchange.'
        ],
        keywords: ['stomata', 'guard cell', 'palisade mesophyll', 'spongy mesophyll', 'waxy cuticle', 'xylem', 'phloem', 'vascular bundle'],
        slides: [
          {
            id: 'b6-2-s1',
            slideNumber: 1,
            subtopicHeader: '[B6.2] Leaf Cross Section',
            title: 'Tissues and Functions in the Leaf',
            slideType: 'theory',
            content: [
              '• Waxy Cuticle: Waterproof layer preventing excessive water loss by evaporation.',
              '• Upper Epidermis: Transparent single layer letting light penetrate to photosynthetic cells.',
              '• Palisade Mesophyll: Packed with abundant chloroplasts; vertically elongated; primary site of photosynthesis.',
              '• Spongy Mesophyll: Rounded cells with large intercellular air spaces facilitating gas diffusion (CO2 in, O2 out).',
              '• Stomata & Guard Cells: Microscopic pores mostly on lower epidermis; guard cells become turgid to open stomata and flaccid to close.',
              '• Vascular Bundle: Xylem on upper side (carries water & minerals), Phloem on lower side (carries sucrose).'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'B7.1',
    topicCode: 'B7',
    topicName: 'Human nutrition',
    title: 'Diet & Balanced Nutrition',
    subject: 'biology',
    tier: 'Core',
    syllabusSummary: [
      'Describe balanced diet.',
      'Dietary sources & importance of carbohydrates, fats/oils, proteins, vitamins C & D, mineral ions calcium & iron, fibre, and water.'
    ],
    decks: [
      {
        id: 'deck-b7-1',
        subtopicCode: 'B7.1',
        topicCode: 'B7',
        title: 'Diet, Essential Nutrients & Nutrition Labels',
        subtopicHeader: '[B7.1] Diet',
        classworkDate: '18/05/2026',
        objectives: [
          'Describe what is meant by a balanced diet.',
          'State the roles and dietary sources of the 7 essential nutrients.'
        ],
        keywords: ['balanced diet', 'carbohydrate', 'lipid', 'protein', 'vitamin C', 'vitamin D', 'calcium', 'iron', 'fibre'],
        slides: [
          {
            id: 'b7-1-s1',
            slideNumber: 1,
            subtopicHeader: '[B7.1] Nutrients Overview',
            title: 'The Seven Essential Nutrients',
            slideType: 'theory',
            content: [
              '• Carbohydrates: Fast energy release (simple glucose) and sustained energy (starch).',
              '• Lipids: Long-term energy store, protection of vital organs, thermal insulation under skin.',
              '• Proteins: Growth and repair of body tissues; enzymes and hormones.',
              '• Vitamin C: Collagen synthesis, healthy skin/gums; prevents scurvy (citrus fruits).',
              '• Vitamin D: Calcium absorption, strong bones & teeth; prevents rickets (fish, eggs, sunlight).',
              '• Calcium: Mineral for strong bones and teeth; blood clotting (milk, cheese).',
              '• Iron: Component of haemoglobin in red blood cells for oxygen transport; prevents anaemia (red meat, spinach).',
              '• Fibre (Roughage): Indigestible plant material providing bulk for peristalsis, preventing constipation.',
              '• Water: Solvent for metabolic reactions, transport medium in blood, temperature regulation.'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'B7.2',
    topicCode: 'B7',
    topicName: 'Human nutrition',
    title: 'Digestive System Organs',
    subject: 'biology',
    tier: 'Core',
    syllabusSummary: [
      'Identify organs of alimentary canal: mouth, oesophagus, stomach, small intestine (duodenum, ileum), large intestine (colon, rectum, anus).',
      'Identify associated organs: salivary glands, pancreas, liver, gall bladder.',
      'Functions in ingestion, digestion, absorption, assimilation, egestion.'
    ],
    decks: [
      {
        id: 'deck-b7-2',
        subtopicCode: 'B7.2',
        topicCode: 'B7',
        title: 'Alimentary Canal & 5 Stages of Digestion',
        subtopicHeader: '[B7.2] Digestion',
        classworkDate: '09/04/2025',
        objectives: [
          'Identify and label all key structures of the digestive system.',
          'Describe the 5 stages: ingestion, digestion, absorption, assimilation, egestion.'
        ],
        keywords: ['alimentary canal', 'ingestion', 'digestion', 'absorption', 'assimilation', 'egestion', 'peristalsis', 'villi'],
        slides: [
          {
            id: 'b7-2-s1',
            slideNumber: 1,
            subtopicHeader: '[B7.2] 5 Key Stages',
            title: '5 Stages of Food Processing',
            slideType: 'theory',
            content: [
              '1. Ingestion: Taking food and drink into the body through the mouth.',
              '2. Digestion: Mechanical and chemical breakdown of large insoluble food into small soluble molecules.',
              '3. Absorption: Movement of digested food molecules from the small intestine (ileum) across villi into the blood.',
              '4. Assimilation: Uptake and use of nutrients by body cells to build molecules or release energy.',
              '5. Egestion: Removal of undigested, unabsorbed waste food as faeces through the anus (distinct from metabolic excretion).'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'B7.3',
    topicCode: 'B7',
    topicName: 'Human nutrition',
    title: 'Digestion & Digestive Enzymes',
    subject: 'biology',
    tier: 'Core & Supplement',
    syllabusSummary: [
      'Physical vs chemical digestion.',
      'Enzymes: Amylase breaks starch to simple sugars, proteases break proteins to amino acids, lipase breaks fats to fatty acids & glycerol.',
      'Sites of secretion & action; HCl in stomach kills pathogens and provides acidic pH for pepsin; Visking tubing model gut.'
    ],
    decks: [
      {
        id: 'deck-b7-3-enzymes',
        subtopicCode: 'B7.3',
        topicCode: 'B7',
        title: 'Digestive Enzymes & Sites of Action',
        subtopicHeader: '[B7.3] Digestive Enzymes',
        classworkDate: '03/04/2025',
        objectives: [
          'State the functions of amylase, protease, and lipase.',
          'Describe where digestive enzymes are secreted and where they act in the body.'
        ],
        keywords: ['amylase', 'protease', 'lipase', 'hydrochloric acid', 'pepsin', 'trypsin', 'bile'],
        slides: [
          {
            id: 'b7-3-s1',
            slideNumber: 1,
            subtopicHeader: '[B7.3] Enzyme Summary Table',
            title: 'Digestive Enzymes, Substrates & Products',
            slideType: 'theory',
            content: [
              '• Amylase: Made in salivary glands and pancreas; acts in mouth and duodenum; digests Starch -> Maltose / Glucose.',
              '• Protease (Pepsin): Made in gastric glands of stomach wall; acts in stomach (pH 2); digests Proteins -> Polypeptides/Amino acids.',
              '• Protease (Trypsin): Made in pancreas; acts in duodenum/ileum (pH 7-8); digests Proteins -> Amino acids.',
              '• Lipase: Made in pancreas; acts in duodenum; digests Lipids (fats/oils) -> Fatty acids + Glycerol.',
              '• Bile: Produced by liver, stored in gallbladder, released into duodenum; neutralizes acidic stomach chyme and emulsifies fats into droplets to increase surface area for lipase.'
            ]
          }
        ]
      },
      {
        id: 'deck-b7-3-modelgut',
        subtopicCode: 'B7.3',
        topicCode: 'B7',
        title: 'Model Gut Practical (Visking Tubing Experiment)',
        subtopicHeader: '[B7.3] Model Gut Experiment',
        classworkDate: '03/04/2025',
        objectives: [
          'Model absorption in the small intestine using Visking dialysis tubing.',
          'Explain why glucose diffuses into surrounding water while starch cannot.'
        ],
        keywords: ['visking tubing', 'dialysis', 'partially permeable', 'starch', 'glucose', 'diffusion'],
        slides: [
          {
            id: 'b7-3-p1',
            slideNumber: 1,
            subtopicHeader: '[B7.3] Model Gut Procedure',
            title: 'Visking Tubing Model of the Gut',
            slideType: 'practical',
            content: [
              '• Inside tubing: Mixture of starch + glucose solution (represents digested food in intestinal lumen).',
              '• Surrounding beaker water: Represents blood bloodstream.',
              '• Results at 0 min: Beaker water tests negative for both starch (iodine orange-brown) and glucose (Benedict\'s blue).',
              '• Results after 30 min: Beaker water tests POSITIVE for glucose (Benedict\'s turns green/yellow/red) because glucose molecules are small enough to pass through pores.',
              '• Beaker water remains NEGATIVE for starch because starch molecules are macromolecules too large to diffuse across.'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'B8.1',
    topicCode: 'B8',
    topicName: 'Transport in plants',
    title: 'Xylem and Phloem',
    subject: 'biology',
    tier: 'Core & Supplement',
    syllabusSummary: [
      'Functions: Xylem transports water and mineral ions, provides support; Phloem transports sucrose and amino acids.',
      'Positions in dicot roots, stems, and leaves.'
    ],
    decks: [
      {
        id: 'deck-b8-1',
        subtopicCode: 'B8.1',
        topicCode: 'B8',
        title: 'Xylem and Phloem Functions & Distribution',
        subtopicHeader: '[B8.1] Transport in Plants',
        classworkDate: '02/02/2026',
        objectives: [
          'Describe the functions and positions of xylem and phloem in roots, stems, and leaves.',
          'Explain why multicellular plants require specialized transport systems.'
        ],
        keywords: ['xylem', 'phloem', 'lignin', 'translocation', 'vascular bundle', 'dicotyledonous'],
        slides: [
          {
            id: 'b8-1-s1',
            slideNumber: 1,
            subtopicHeader: '[B8.1] Transport Vessels',
            title: 'Xylem vs Phloem Structure and Function',
            slideType: 'theory',
            content: [
              '• Need for Transport: Diffusion is too slow over large distances in multicellular plants.',
              '• Xylem: Dead hollow vessels reinforced with lignin. Transports water and dissolved mineral ions upwards from roots to stems and leaves; provides structural support.',
              '• Phloem: Living cells with sieve plates and companion cells. Transports sucrose and amino acids upwards and downwards (translocation) to growing points and storage organs.',
              '• Anatomical Positions: In dicot stem vascular bundles, XYLEM is always on the inside (closer to center), and PHLOEM is on the outside.'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'B8.2',
    topicCode: 'B8',
    topicName: 'Transport in plants',
    title: 'Water Uptake',
    subject: 'biology',
    tier: 'Core & Supplement',
    syllabusSummary: [
      'Root hair cells structure and function; large surface area increases uptake.',
      'Pathway of water: root hair cells -> root cortex cells -> xylem -> mesophyll cells.'
    ],
    decks: [
      {
        id: 'deck-b8-2',
        subtopicCode: 'B8.2',
        topicCode: 'B8',
        title: 'Pathway of Water from Soil to Leaves',
        subtopicHeader: '[B8.2] Water Uptake',
        classworkDate: '02/02/2026',
        objectives: [
          'Trace the pathway of water through root hair cells, cortex, xylem, and leaf mesophyll.',
          'Explain the role of root hair adaptations in water absorption by osmosis.'
        ],
        keywords: ['root hair', 'cortex', 'osmosis', 'pathway of water', 'mesophyll'],
        slides: [
          {
            id: 'b8-2-s1',
            slideNumber: 1,
            subtopicHeader: '[B8.2] Pathway of Water',
            title: 'Sequential Steps of Water Uptake',
            slideType: 'theory',
            content: [
              '1. Soil Water -> Root Hair Cell: Water enters by osmosis down a water potential gradient; mineral ions are absorbed by active transport.',
              '2. Root Cortex: Water diffuses cell-to-cell across cortex parenchymal cells by osmosis.',
              '3. Xylem Vessels: Water enters central root xylem and is drawn up the stem through negative transpiration pull.',
              '4. Leaf Mesophyll: Water reaches palisade and spongy mesophyll cells for photosynthesis and cell turgor.'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'B8.3',
    topicCode: 'B8',
    topicName: 'Transport in plants',
    title: 'Transpiration & Potometers',
    subject: 'biology',
    tier: 'Core & Supplement',
    syllabusSummary: [
      'Define transpiration as loss of water vapour from leaves.',
      'Factors affecting transpiration: temperature, wind speed, humidity, light intensity; potometer measurements.'
    ],
    decks: [
      {
        id: 'deck-b8-3',
        subtopicCode: 'B8.3',
        topicCode: 'B8',
        title: 'Transpiration Stream & Potometer Practical',
        subtopicHeader: '[B8.3] Transpiration',
        classworkDate: '03/02/2026',
        objectives: [
          'Describe and explain factors affecting transpiration rate.',
          'Analyze potometer data to calculate water uptake rates.'
        ],
        keywords: ['transpiration', 'stomata', 'evaporation', 'potometer', 'humidity', 'wind speed'],
        slides: [
          {
            id: 'b8-3-s1',
            slideNumber: 1,
            subtopicHeader: '[B8.3] Environmental Factors',
            title: 'Transpiration Stream & Factors',
            slideType: 'theory',
            content: [
              '• Transpiration is the loss of water vapour from leaves: water evaporates from moist mesophyll surfaces into air spaces and diffuses out through stomata.',
              '• Factors increasing transpiration rate:',
              '  - Temperature: Increases kinetic energy of water molecules, accelerating evaporation.',
              '  - Wind Speed / Airflow: Blows away moist air boundary layer, maintaining a steep concentration gradient.',
              '  - Light Intensity: Opens stomata for CO2 uptake, allowing water vapour escape.',
              '  - Decreasing Humidity: Low ambient humidity steepens concentration gradient.'
            ]
          },
          {
            id: 'b8-3-p1',
            slideNumber: 2,
            subtopicHeader: '[B8.3] Potometer Practical',
            title: 'Measuring Water Uptake with a Potometer',
            slideType: 'practical',
            content: [
              '• A potometer measures rate of water uptake (closely proportional to transpiration rate).',
              '• Shoot cut underwater to prevent air bubbles entering xylem.',
              '• Apparatus sealed airtight with petroleum jelly.',
              '• An air bubble is introduced into the capillary tube; distance moved per minute is recorded (Rate = Distance / Time).'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'B9.1',
    topicCode: 'B9',
    topicName: 'Transport in animals',
    title: 'Circulatory Systems',
    subject: 'biology',
    tier: 'Core',
    syllabusSummary: [
      'Describe the circulatory system as a system of blood vessels with a pump and valves to ensure one-way flow of blood.'
    ],
    decks: [
      {
        id: 'deck-b9-1',
        subtopicCode: 'B9.1',
        topicCode: 'B9',
        title: 'The Circulatory System & Double Circulation',
        subtopicHeader: '[B9.1] The Circulatory System',
        classworkDate: '09/02/2026',
        objectives: [
          'Describe the double circulatory system in mammals.',
          'Explain the significance of one-way valves in maintaining blood flow.'
        ],
        keywords: ['circulatory system', 'double circulation', 'pulmonary', 'systemic', 'valves'],
        slides: [
          {
            id: 'b9-1-s1',
            slideNumber: 1,
            subtopicHeader: '[B9.1] Double Circulation',
            title: 'Double Circulation in Mammals',
            slideType: 'theory',
            content: [
              '• Double Circulatory System: Blood passes through the heart TWICE for each complete circuit of the body.',
              '• Circuit 1 (Pulmonary): Right side of heart pumps deoxygenated blood to lungs; oxygenated blood returns to left atrium.',
              '• Circuit 2 (Systemic): Left side of heart pumps oxygenated blood at high pressure to all body organs; deoxygenated blood returns to right atrium.',
              '• Benefit: Higher pressure to body organs than single circulation (e.g. fish), ensuring rapid delivery of glucose and oxygen.'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'B9.2',
    topicCode: 'B9',
    topicName: 'Transport in animals',
    title: 'Heart Anatomy & Coronary Heart Disease',
    subject: 'biology',
    tier: 'Core & Supplement',
    syllabusSummary: [
      'Identify heart structures: muscular wall, septum, left/right atria and ventricles, one-way valves, coronary arteries.',
      'Functioning of heart (contraction of atria/ventricles and action of valves); monitoring (ECG, pulse, sounds).',
      'Explain effect of physical activity on heart rate; coronary heart disease (CHD) causes, risk factors, diet & exercise.'
    ],
    decks: [
      {
        id: 'deck-b9-2-heart',
        subtopicCode: 'B9.2',
        topicCode: 'B9',
        title: 'Heart Structure, Function & Dissection',
        subtopicHeader: '[B9.2] The Heart & Dissection',
        classworkDate: '09/02/2026 - 10/02/2026',
        objectives: [
          'Identify chambers, valves, septum, and coronary vessels of mammalian heart.',
          'Explain why left ventricle wall is thicker than right ventricle wall.'
        ],
        keywords: ['right atrium', 'left atrium', 'right ventricle', 'left ventricle', 'septum', 'tricuspid', 'bicuspid', 'aorta', 'pulmonary artery'],
        slides: [
          {
            id: 'b9-2-s1',
            slideNumber: 1,
            subtopicHeader: '[B9.2] Heart Anatomy',
            title: 'Mammalian Heart Anatomy & Blood Pathway',
            slideType: 'theory',
            content: [
              '• Deoxygenated blood enters Right Atrium from body via Vena Cava.',
              '• Right Atrium contracts -> passes blood through tricuspid valve into Right Ventricle.',
              '• Right Ventricle contracts -> pumps blood through pulmonary valve into Pulmonary Artery to lungs.',
              '• Oxygenated blood returns from lungs via Pulmonary Veins into Left Atrium.',
              '• Left Atrium contracts -> passes blood through bicuspid valve into Left Ventricle.',
              '• Left Ventricle contracts -> pumps blood at high pressure through aortic valve into Aorta to body.',
              '• Left Ventricle Muscle: Thickest wall because it must generate enough pressure to circulate blood to the entire body.'
            ]
          }
        ]
      },
      {
        id: 'deck-b9-2-chd',
        subtopicCode: 'B9.2',
        topicCode: 'B9',
        title: 'Coronary Heart Disease (CHD) & Risk Factors',
        subtopicHeader: '[B9.2] Coronary Heart Disease',
        classworkDate: '12/02/2026',
        objectives: [
          'Describe coronary heart disease in terms of blockage of coronary arteries.',
          'Explain controllable vs uncontrollable risk factors and roles of diet and exercise.'
        ],
        keywords: ['coronary artery', 'plaque', 'cholesterol', 'heart attack', 'atherosclerosis', 'risk factors'],
        slides: [
          {
            id: 'b9-2-chd-s1',
            slideNumber: 1,
            subtopicHeader: '[B9.2] CHD Pathophysiology',
            title: 'Causes & Risk Factors of CHD',
            slideType: 'theory',
            content: [
              '• Coronary arteries branch from aorta to supply oxygen and glucose to cardiac muscle cells for respiration.',
              '• Atherosclerosis: Fatty deposits (plaque/cholesterol) build up in coronary artery walls, narrowing the lumen.',
              '• Blood flow and oxygen delivery to heart muscle are reduced; in severe blockages, muscle cells cannot respire and die (Myocardial Infarction / Heart Attack).',
              '• Controllable Factors: Diet high in saturated fat, lack of exercise, cigarette smoking, chronic stress, obesity.',
              '• Uncontrollable Factors: Age (risk increases with age), biological sex (higher in males), genetic predisposition.'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'B9.3',
    topicCode: 'B9',
    topicName: 'Transport in animals',
    title: 'Blood Vessels',
    subject: 'biology',
    tier: 'Core & Supplement',
    syllabusSummary: [
      'Describe structures of arteries, veins, and capillaries (wall thickness, lumen diameter, presence of valves).',
      'Explain structure-function relationship to blood pressure.'
    ],
    decks: [
      {
        id: 'deck-b9-3',
        subtopicCode: 'B9.3',
        topicCode: 'B9',
        title: 'Blood Vessels: Arteries, Veins & Capillaries',
        subtopicHeader: '[B9.3] Blood Vessels',
        classworkDate: '19/02/2026',
        objectives: [
          'Compare wall thickness, lumen size, valves, and pressures in arteries, veins, and capillaries.',
          'Explain how vessel adaptations support their circulatory function.'
        ],
        keywords: ['artery', 'vein', 'capillary', 'lumen', 'valves', 'blood pressure'],
        slides: [
          {
            id: 'b9-3-s1',
            slideNumber: 1,
            subtopicHeader: '[B9.3] Vessels Comparison',
            title: 'Arteries vs Veins vs Capillaries',
            slideType: 'theory',
            content: [
              '• Arteries: Carry blood AWAY from heart under high surging pressure. Thick muscular and elastic walls withstand pressure; narrow lumen maintains pressure; NO valves.',
              '• Veins: Return blood TOWARDS heart under low pressure. Thinner muscular wall; wide lumen reduces flow resistance; semilunar VALVES prevent backflow.',
              '• Capillaries: Microscopic link between arterioles and venules. Walls are ONE cell thick (endothelium) and permeable to minimize diffusion distance for oxygen, glucose, urea, and CO2.'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'B9.4',
    topicCode: 'B9',
    topicName: 'Transport in animals',
    title: 'Blood Components',
    subject: 'biology',
    tier: 'Core & Supplement',
    syllabusSummary: [
      'Components: red blood cells, white blood cells, platelets, plasma.',
      'Functions: RBC oxygen transport (haemoglobin), WBC phagocytosis & antibodies, platelets clotting, plasma transport.'
    ],
    decks: [
      {
        id: 'deck-b9-4',
        subtopicCode: 'B9.4',
        topicCode: 'B9',
        title: 'Blood Components & Bioviewer Investigation',
        subtopicHeader: '[B9.4] Blood Components',
        classworkDate: '19/02/2026',
        objectives: [
          'Describe and explain the functions of the four blood components.',
          'Examine blood smears under bioviewer and microscope.'
        ],
        keywords: ['red blood cell', 'white blood cell', 'platelets', 'plasma', 'haemoglobin', 'phagocytosis', 'antibody'],
        slides: [
          {
            id: 'b9-4-s1',
            slideNumber: 1,
            subtopicHeader: '[B9.4] Blood Components',
            title: 'The 4 Components of Blood',
            slideType: 'theory',
            content: [
              '• Red Blood Cells (Erythrocytes): Contain haemoglobin; biconcave shape; no nucleus; carry oxygen as oxyhaemoglobin.',
              '• White Blood Cells (Leukocytes):',
              '  - Phagocytes: Engulf and digest pathogens by phagocytosis (lobed nucleus).',
              '  - Lymphocytes: Produce specific Y-shaped antibody proteins against pathogen antigens.',
              '• Platelets: Cell fragments essential for blood clotting (converts fibrinogen to insoluble fibrin mesh) to prevent blood loss and pathogen entry.',
              '• Plasma: Straw-coloured liquid transporting blood cells, dissolved nutrients (glucose, amino acids), urea, carbon dioxide, hormones, and heat.'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'B10.1',
    topicCode: 'B10',
    topicName: 'Diseases and immunity',
    title: 'Diseases and Immunity & Pathogens',
    subject: 'biology',
    tier: 'Core & Supplement',
    syllabusSummary: [
      'Define pathogen and transmissible disease; direct vs indirect transmission.',
      'Body defences: mechanical (skin, hairs) and chemical (mucus, stomach acid) barriers; white blood cells.',
      'Features of viruses (protein coat & genetic material); active immunity (antibodies & memory cells); vaccination; hygiene pillars.'
    ],
    decks: [
      {
        id: 'deck-b10-1-pathogens',
        subtopicCode: 'B10.1',
        topicCode: 'B10',
        title: 'Spread of Pathogens (Viruses & Bacteria)',
        subtopicHeader: '[B10.1] Spread of Pathogens (Viruses)',
        classworkDate: '24/02/2026',
        objectives: [
          'Define pathogens and transmissible diseases and describe methods of transmission.',
          'Identify human body defences and structural features of viruses.'
        ],
        keywords: ['pathogen', 'transmissible', 'transmission', 'mucus', 'cilia', 'virus', 'protein coat'],
        starterLookBack: {
          question: 'Name the blood-receiving chambers of the heart and the vessel carrying oxygenated blood from lungs.',
          answer: 'Right and left atria. Pulmonary vein carries oxygenated blood to left atrium.'
        },
        slides: [
          {
            id: 'b10-1-p1',
            slideNumber: 1,
            subtopicHeader: '[B10.1] Pathogens & Transmission',
            title: 'What are Pathogens & How Do They Spread?',
            slideType: 'theory',
            content: [
              '• Pathogen: A disease-causing organism (viruses, bacteria, fungi, protists).',
              '• Transmissible Disease: A disease in which the pathogen can be passed from one host to another.',
              '• Direct Transmission: Passing through direct physical contact (blood, sexual contact, bodily fluids across cuts).',
              '• Indirect Transmission: Passed via contaminated surfaces, airborne aerosol droplets from sneezes/coughs, contaminated food or water, or animal vectors (e.g. mosquitoes).'
            ]
          },
          {
            id: 'b10-1-p2',
            slideNumber: 2,
            subtopicHeader: '[B10.1] Mechanical & Chemical Defences',
            title: 'Human First Line Defences',
            slideType: 'theory',
            content: [
              '• Mechanical Barriers (Physical blockades):',
              '  - Skin: Waterproof, keratinized physical barrier blocking pathogen entry.',
              '  - Nose Hairs: Physical filter trapping airborne dust and pathogen particles.',
              '• Chemical Barriers (Kill or neutralize pathogens):',
              '  - Mucus: Sticky substance secreted in respiratory tract to trap inhaled pathogens; cilia sweep mucus up to throat to be swallowed.',
              '  - Stomach Acid (Hydrochloric acid, pH 1-2): Denatures proteins and destroys most swallowed microorganisms in food.'
            ]
          },
          {
            id: 'b10-1-p3',
            slideNumber: 3,
            subtopicHeader: '[B10.1] Virus Biology',
            title: 'Features of Viruses',
            slideType: 'theory',
            content: [
              '• Viruses are non-cellular (acellular) and significantly smaller than bacteria.',
              '• Structure: Consist ONLY of a PROTEIN COAT (capsid) surrounding GENETIC MATERIAL (DNA or RNA).',
              '• Lack cell membrane, cytoplasm, nucleus, and ribosomes.',
              '• Cannot reproduce on their own; must hijack a host cell to force it to replicate new viral particles until the host cell bursts.'
            ]
          }
        ]
      },
      {
        id: 'deck-b10-1-immunity',
        subtopicCode: 'B10.1',
        topicCode: 'B10',
        title: 'Immunity and the Spread of Disease',
        subtopicHeader: '[B10.1] Immunity and the Spread of Disease',
        classworkDate: '26/02/2026',
        objectives: [
          'Explain the importance of hygiene and sanitation (water, food, sewage) in controlling disease.',
          'Describe active immunity and how it is gained through infection or vaccination.'
        ],
        keywords: ['active immunity', 'lymphocytes', 'antibodies', 'antigens', 'memory cells', 'vaccination', 'hygiene'],
        starterLookBack: {
          question: 'What are the two structural features of a virus and which barrier is mechanical: skin or stomach acid?',
          answer: 'Protein coat and genetic material (DNA/RNA). Skin is a mechanical barrier because it physically blocks pathogens.'
        },
        slides: [
          {
            id: 'b10-1-im1',
            slideNumber: 1,
            subtopicHeader: '[B10.1] 5 Pillars of Disease Control',
            title: 'Sanitation & Hygiene Infrastructure',
            slideType: 'theory',
            content: [
              'Breaking chains of indirect transmission:',
              '1. Clean Water Supply: Chlorination and filtration kill waterborne pathogens (e.g. Vibrio cholerae).',
              '2. Food Hygiene: Cooking kills microbes; refrigeration slows bacterial growth; separating raw and cooked prevents cross-contamination.',
              '3. Personal Hygiene: Handwashing with soap removes microbes from indirect contact surfaces.',
              '4. Waste Disposal: Removing food waste prevents vector infestations (flies, rats).',
              '5. Sewage Treatment: Removes human faecal waste containing high pathogen concentrations, preventing the faecal-oral route into drinking water.'
            ]
          },
          {
            id: 'b10-1-im2',
            slideNumber: 2,
            subtopicHeader: '[B10.1] Active Immunity & Vaccines',
            title: 'Active Immunity, Antibodies & Memory Cells',
            slideType: 'theory',
            content: [
              '• Active Immunity: Defence against a pathogen by antibody production in the body.',
              '• Lymphocytes recognize foreign antigens on pathogen surfaces and produce complementary Y-shaped antibodies.',
              '• Antibodies bind to antigens, causing pathogens to clump (agglutination) for phagocytes to engulf.',
              '• Two Routes: 1) Natural infection; 2) Artificial vaccination (weakened/dead pathogen).',
              '• Secondary Response: Both routes produce MEMORY CELLS that persist in blood for years; if the same pathogen reinvades, memory cells mass-produce antibodies much faster and in higher quantities.'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'B11.1',
    topicCode: 'B11',
    topicName: 'Gas exchange in humans',
    title: 'Gas Exchange in Humans & Breathing System',
    subject: 'biology',
    tier: 'Core & Supplement',
    syllabusSummary: [
      'Identify breathing system parts: lungs, diaphragm, ribs, intercostal muscles, larynx, trachea, bronchi, bronchioles, alveoli, capillaries.',
      'Features of gas exchange surfaces: large surface area, thin surface, good blood supply, good ventilation.',
      'Effects of physical activity on rate and depth of breathing; inhaled vs exhaled air.'
    ],
    decks: [
      {
        id: 'deck-b11-1',
        subtopicCode: 'B11.1',
        topicCode: 'B11',
        title: 'The Breathing System & Alveoli Adaptations',
        subtopicHeader: '[B11.1] The Breathing System',
        classworkDate: '27/02/2026 - 02/03/2026',
        objectives: [
          'Identify and label all key structures of the respiratory system.',
          'Describe the functions and explain the adaptations of the alveoli for gas exchange.'
        ],
        keywords: ['trachea', 'bronchus', 'bronchiole', 'alveoli', 'diaphragm', 'intercostal muscles', 'gas exchange'],
        slides: [
          {
            id: 'b11-1-s1',
            slideNumber: 1,
            subtopicHeader: '[B11.1] Respiratory Anatomy',
            title: 'Pathway of Air into Lungs',
            slideType: 'theory',
            content: [
              '• Air enters through nose/mouth -> larynx -> down trachea (windpipe reinforced with cartilage rings).',
              '• Trachea branches into left and right bronchi -> branch into narrower bronchioles -> terminate in clusters of microscopic air sacs called alveoli.',
              '• Inhaled vs Exhaled Air:',
              '  - Oxygen: Inhaled ~21%, Exhaled ~16% (used in aerobic respiration).',
              '  - Carbon Dioxide: Inhaled ~0.04%, Exhaled ~4% (waste product of respiration).',
              '  - Nitrogen: Inhaled ~78%, Exhaled ~78% (not metabolized by the body).'
            ]
          },
          {
            id: 'b11-1-s2',
            slideNumber: 2,
            subtopicHeader: '[B11.1] Alveoli Adaptations',
            title: 'Adaptations of Alveoli for Gas Exchange',
            slideType: 'theory',
            content: [
              '1. Massive Surface Area: Millions of alveoli provide huge area for gas exchange.',
              '2. Extremely Thin Walls: Epithelial wall is only ONE cell thick, giving a very short diffusion pathway.',
              '3. Rich Capillary Blood Supply: Continuous blood flow maintains a steep concentration gradient for oxygen into blood and CO2 out.',
              '4. Moist Lining: Gases dissolve in moisture for rapid diffusion across membranes.',
              '5. Good Ventilation: Breathing replenishes O2 and removes CO2.'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'B12.1',
    topicCode: 'B12',
    topicName: 'Respiration',
    title: 'Aerobic Respiration',
    subject: 'biology',
    tier: 'Core & Supplement',
    syllabusSummary: [
      'State 5 uses of energy in living organisms: muscle contraction, protein synthesis, cell division, growth, constant body temperature.',
      'Define aerobic respiration; word and balanced symbol equation: C6H12O6 + 6O2 -> 6CO2 + 6H2O.'
    ],
    decks: [
      {
        id: 'deck-b12-1',
        subtopicCode: 'B12.1',
        topicCode: 'B12',
        title: 'Aerobic Respiration & Uses of Energy',
        subtopicHeader: '[B12.1] Aerobic Respiration',
        classworkDate: '02/03/2026',
        objectives: [
          'State the 5 uses of energy in living organisms.',
          'Define aerobic respiration and write word and balanced symbol equations.'
        ],
        keywords: ['aerobic', 'respiration', 'glucose', 'mitochondria', 'ATP', 'exothermic'],
        slides: [
          {
            id: 'b12-1-s1',
            slideNumber: 1,
            subtopicHeader: '[B12.1] Respiration Equations',
            title: 'Aerobic Respiration Chemistry',
            slideType: 'theory',
            content: [
              '• Aerobic Respiration: Chemical reactions in cells that break down nutrient molecules (glucose) using oxygen to release energy (ATP) for metabolism.',
              '• Word Equation: Glucose + Oxygen -> Carbon dioxide + Water + Energy (ATP).',
              '• Balanced Symbol Equation: C6H12O6 + 6O2 -> 6CO2 + 6H2O + Energy.',
              '• Location: Occurs inside the MITOCHONDRIA of cells.',
              '• Energy Uses: 1) Muscle contraction for movement; 2) Protein synthesis; 3) Cell division; 4) Growth and repair; 5) Maintenance of constant body temperature in homeotherms.'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'B13.1',
    topicCode: 'B13',
    topicName: 'Drugs',
    title: 'Antibiotics & Resistant Bacteria',
    subject: 'biology',
    tier: 'Core & Supplement',
    syllabusSummary: [
      'Define drug as a substance taken into body modifying chemical reactions.',
      'Antibiotics treat bacterial infections; do NOT affect viruses.',
      'Antibiotic-resistant bacteria (e.g. MRSA) arise through natural selection; limiting development by avoiding overuse.'
    ],
    decks: [
      {
        id: 'deck-b13-1',
        subtopicCode: 'B13.1',
        topicCode: 'B13',
        title: 'Antibiotics, Painkillers & MRSA Resistance',
        subtopicHeader: '[B13.1] Antibiotics',
        classworkDate: '22/06/2026',
        objectives: [
          'Describe antibiotics and their use in killing bacteria.',
          'Explain why antibiotics cannot destroy viruses.',
          'Explain how antibiotic-resistant bacteria (MRSA) arise by natural selection.'
        ],
        keywords: ['antibiotic', 'painkiller', 'bacteria', 'virus', 'mutation', 'resistant', 'MRSA', 'natural selection'],
        slides: [
          {
            id: 'b13-1-s1',
            slideNumber: 1,
            subtopicHeader: '[B13.1] Antibiotics vs Viruses',
            title: 'Antibiotics and Viral Infections',
            slideType: 'theory',
            content: [
              '• Antibiotics (e.g. penicillin) destroy bacteria or prevent bacterial cell wall formation without harming human cells.',
              '• Why Antibiotics DO NOT Kill Viruses: Viruses reproduce inside host human cells and lack bacterial cell walls or metabolic enzymes; developing drugs that target viruses without damaging host cells is very difficult.',
              '• Painkillers (e.g. paracetamol): Only relieve pain and symptoms; they do NOT kill pathogens.'
            ]
          },
          {
            id: 'b13-1-s2',
            slideNumber: 2,
            subtopicHeader: '[B13.1] Natural Selection of Resistance',
            title: 'Evolution of Antibiotic Resistance (MRSA)',
            slideType: 'theory',
            content: [
              '1. Random genetic mutations occur in bacterial DNA.',
              '2. A mutation provides resistance to a specific antibiotic.',
              '3. Antibiotic course is taken: non-resistant bacteria are killed, but resistant bacteria survive.',
              '4. Surviving resistant bacteria reproduce rapidly with zero competition for nutrients.',
              '5. Entire population becomes resistant (example of natural selection).',
              '• Medical Prevention: Only prescribe when essential; patients must complete the full prescribed course; rotate antibiotics.'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'B14.1',
    topicCode: 'B14',
    topicName: 'Reproduction',
    title: 'Sexual Reproduction in Plants',
    subject: 'biology',
    tier: 'Core & Supplement',
    syllabusSummary: [
      'Parts of insect-pollinated flower: sepals, petals, stamens (anthers, filaments), carpels (stigma, style, ovary, ovule).',
      'Compare wind-pollinated vs insect-pollinated flowers.',
      'Pollination, pollen tube, fertilisation, conditions for germination (water, oxygen, warmth).'
    ],
    decks: [
      {
        id: 'deck-b14-1-flower',
        subtopicCode: 'B14.1',
        topicCode: 'B14',
        title: 'Plant Reproduction & Flower Anatomy',
        subtopicHeader: '[B14.1] Plant Reproduction',
        classworkDate: '23/06/2026',
        objectives: [
          'Identify all key parts of the flower.',
          'Explain the function of male (stamen) and female (carpel) reproductive structures.'
        ],
        keywords: ['flower', 'anther', 'stamen', 'stigma', 'style', 'carpel', 'ovary', 'ovule', 'sepal', 'petal', 'nectary'],
        slides: [
          {
            id: 'b14-1-s1',
            slideNumber: 1,
            subtopicHeader: '[B14.1] Flower Anatomy',
            title: 'Male and Female Flower Organs',
            slideType: 'theory',
            content: [
              '• Male Part (Stamen): Consists of Anther (produces pollen grains containing male gamete nuclei) supported by Filament.',
              '• Female Part (Carpel / Pistil): Consists of sticky Stigma (receives pollen), Style (stalk), and Ovary (contains ovules with female egg nuclei).',
              '• Petals: Brightly coloured and scented with nectary glands to attract pollinating insects.',
              '• Sepals: Green leaf-like structures protecting flower in bud.'
            ]
          }
        ]
      },
      {
        id: 'deck-b14-1-pollination',
        subtopicCode: 'B14.1',
        topicCode: 'B14',
        title: 'Pollination: Insect vs Wind Adaptations',
        subtopicHeader: '[B14.1] Pollination',
        classworkDate: '25/06/2026',
        objectives: [
          'Define pollination (transfer of pollen from anther to stigma).',
          'Compare structural adaptations of wind-pollinated and insect-pollinated flowers.'
        ],
        keywords: ['pollination', 'self-pollination', 'cross-pollination', 'insect-pollinated', 'wind-pollinated'],
        slides: [
          {
            id: 'b14-1-pol1',
            slideNumber: 1,
            subtopicHeader: '[B14.1] Pollination Types',
            title: 'Insect vs Wind Pollination Adaptations',
            slideType: 'theory',
            content: [
              '• Pollination: Transfer of pollen grains from an anther to a stigma.',
              '• Insect-Pollinated Flowers: Bright large petals; sweet scent & nectar; sticky/spiky pollen; enclosed stigma & anthers inside flower.',
              '• Wind-Pollinated Flowers (e.g. grasses, hazel catkins): Dull green/brown tiny petals or none; no scent/nectar; light smooth buoyant pollen produced in huge quantities; feathery exposed stigmas and dangling anthers hanging outside flower.'
            ]
          }
        ]
      },
      {
        id: 'deck-b14-1-fert',
        subtopicCode: 'B14.1',
        topicCode: 'B14',
        title: 'Fertilisation & Seed Germination',
        subtopicHeader: '[B14.1] Fertilisation and Germination',
        classworkDate: '25/06/2026',
        objectives: [
          'Define fertilisation as fusion of pollen nucleus with ovule egg nucleus.',
          'State the 3 essential conditions for seed germination (Water, Oxygen, Warmth - WOW).'
        ],
        keywords: ['fertilisation', 'pollen tube', 'seed', 'fruit', 'germination', 'water', 'oxygen', 'warmth'],
        slides: [
          {
            id: 'b14-1-fert1',
            slideNumber: 1,
            subtopicHeader: '[B14.1] Fertilisation & WOW',
            title: 'Fertilisation & Seed Germination Conditions',
            slideType: 'theory',
            content: [
              '1. Pollen lands on sticky stigma (pollination).',
              '2. Pollen tube grows down through the style into the ovary.',
              '3. Male pollen nucleus passes down tube and fuses with female egg nucleus inside the ovule (FERTILISATION).',
              '4. After fertilisation: Ovule develops into the SEED; Ovary wall becomes the FRUIT.',
              '• Conditions for Seed Germination (WOW):',
              '  - Water: Causes seed to swell, breaks seed coat, activates enzymes.',
              '  - Oxygen: Required for aerobic respiration to release ATP energy for growth.',
              '  - Warmth (suitable temperature): Optimum temperature for enzyme activity.'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'B14.2',
    topicCode: 'B14',
    topicName: 'Reproduction',
    title: 'Sexual Reproduction in Humans',
    subject: 'biology',
    tier: 'Core',
    syllabusSummary: [
      'Male reproductive system: testes, scrotum, sperm ducts, prostate gland, urethra, penis.',
      'Female reproductive system: ovaries, oviducts, uterus, cervix, vagina.',
      'Fertilisation as fusion of sperm & egg nuclei in oviduct; implantation; 28-day menstrual cycle.'
    ],
    decks: [
      {
        id: 'deck-b14-2',
        subtopicCode: 'B14.2',
        topicCode: 'B14',
        title: 'Human Reproductive System & Menstrual Cycle',
        subtopicHeader: '[B14.2] Human Reproductive System',
        classworkDate: '29/06/2026',
        objectives: [
          'Explain function of male and female reproductive systems.',
          'Describe fertilisation in the oviduct, implantation in the uterus, and the 4 stages of the 28-day menstrual cycle.'
        ],
        keywords: ['testes', 'sperm duct', 'urethra', 'penis', 'ovary', 'oviduct', 'uterus', 'cervix', 'vagina', 'ovulation', 'menstruation'],
        slides: [
          {
            id: 'b14-2-s1',
            slideNumber: 1,
            subtopicHeader: '[B14.2] Male & Female Anatomy',
            title: 'Reproductive Organs & Fertilisation',
            slideType: 'theory',
            content: [
              '• Male System: Testes produce sperm & testosterone; Scrotum regulates temperature; Sperm ducts transport sperm; Prostate adds seminal fluid; Urethra carries sperm/urine out through penis.',
              '• Female System: Ovaries produce ova & estrogen/progesterone; Oviduct (fallopian tube) carries egg and is site of FERTILISATION; Uterus is where embryo implants and foetus develops; Cervix is muscular ring at entrance; Vagina receives penis during intercourse.',
              '• Fertilisation: Fusion of sperm nucleus with ovum nucleus inside the OVIDUCT to form a diploid zygote.'
            ]
          },
          {
            id: 'b14-2-s2',
            slideNumber: 2,
            subtopicHeader: '[B14.2] 28-Day Menstrual Cycle',
            title: 'The 4 Stages of the Menstrual Cycle',
            slideType: 'theory',
            content: [
              '• Stage 1 (Days 1–4): Menstruation — spongy lining of uterus breaks down and bleeds.',
              '• Stage 2 (Days 4–14): Lining builds up into thick spongy layer full of blood vessels ready to receive a fertilised egg.',
              '• Stage 3 (Day 14): OVULATION — mature ovum is released from ovary into oviduct.',
              '• Stage 4 (Days 14–28): Lining is maintained. If no fertilised egg implants by Day 28, lining breaks down and cycle restarts.'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'B15.1',
    topicCode: 'B15',
    topicName: 'Organisms and their environment',
    title: 'Energy Flow',
    subject: 'biology',
    tier: 'Core',
    syllabusSummary: [
      'State that the Sun is the principal source of energy input to biological systems.',
      'Describe flow of energy from sunlight to chemical energy in organisms and transfer to environment.'
    ],
    decks: [
      {
        id: 'deck-b15-1',
        subtopicCode: 'B15.1',
        topicCode: 'B15',
        title: 'Energy Flow in Ecosystems',
        subtopicHeader: '[B15.1] Energy Flow',
        classworkDate: '05/10/2025',
        objectives: [
          'State that the Sun is the principal source of energy for biological systems.',
          'Describe light energy conversion into chemical biomass by producers.'
        ],
        keywords: ['sun', 'energy flow', 'photosynthesis', 'biomass', 'producer'],
        slides: [
          {
            id: 'b15-1-s1',
            slideNumber: 1,
            subtopicHeader: '[B15.1] Solar Input',
            title: 'The Sun as Primary Energy Source',
            slideType: 'theory',
            content: [
              '• The Sun is the principal source of energy input to all biological systems on Earth.',
              '• Producers (green plants and algae) trap light energy using chlorophyll and convert it into chemical energy stored in organic molecules (glucose/biomass).',
              '• Energy flows linearly through food chains; only ~10% transfers to each successive trophic level, with ~90% lost as heat, respiration, and excretion.'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'B15.2',
    topicCode: 'B15',
    topicName: 'Organisms and their environment',
    title: 'Food Chains and Food Webs',
    subject: 'biology',
    tier: 'Core & Supplement',
    syllabusSummary: [
      'Construct & interpret food chains and food webs; trophic levels (producer, primary, secondary, tertiary consumer).',
      'Herbivore, carnivore, apex predator, decomposer; 10% energy transfer rule; human impacts on webs.'
    ],
    decks: [
      {
        id: 'deck-b15-2',
        subtopicCode: 'B15.2',
        topicCode: 'B15',
        title: 'Food Chains, Food Webs & Trophic Energy',
        subtopicHeader: '[B15.2] Food Chains and Food Webs',
        classworkDate: '05/10/2025',
        objectives: [
          'Construct food chains and food webs.',
          'Explain why only ~10% of biomass/energy passes along each trophic level.'
        ],
        keywords: ['producer', 'primary consumer', 'secondary consumer', 'apex predator', 'herbivore', 'carnivore', 'decomposer', 'trophic level'],
        slides: [
          {
            id: 'b15-2-s1',
            slideNumber: 1,
            subtopicHeader: '[B15.2] Trophic Levels',
            title: 'Trophic Structure & 10% Rule',
            slideType: 'theory',
            content: [
              '• Producer: Organism that synthesizes its own organic nutrients using sunlight.',
              '• Primary Consumer (Herbivore): Eats producers (Level 2).',
              '• Secondary & Tertiary Consumer (Carnivores): Eat other animals (Levels 3 & 4).',
              '• Apex Predator: Carnivore at top of food chain with no natural predators.',
              '• 10% Rule: Only about 10% of energy is transferred to the next level because: 1) Large amounts used in respiration for movement; 2) Lost as heat; 3) Excreted in urine/faeces; 4) Inedible parts (bones/roots) not consumed.'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'B15.3',
    topicCode: 'B15',
    topicName: 'Organisms and their environment',
    title: 'The Carbon Cycle',
    subject: 'biology',
    tier: 'Core',
    syllabusSummary: [
      'Carbon cycle processes: photosynthesis, respiration, feeding, decomposition, fossil fuel formation, combustion; carbon sinks.'
    ],
    decks: [
      {
        id: 'deck-b15-3',
        subtopicCode: 'B15.3',
        topicCode: 'B15',
        title: 'The Carbon Cycle & Carbon Sinks',
        subtopicHeader: '[B15.3] The Carbon Cycle',
        classworkDate: '15/10/2025',
        objectives: [
          'Identify processes releasing CO2 (respiration, combustion, decomposition).',
          'Identify processes removing CO2 (photosynthesis, ocean dissolving, rock formation).'
        ],
        keywords: ['carbon cycle', 'photosynthesis', 'respiration', 'combustion', 'decomposers', 'fossil fuels', 'carbon sinks'],
        slides: [
          {
            id: 'b15-3-s1',
            slideNumber: 1,
            subtopicHeader: '[B15.3] Carbon Cycle Pathways',
            title: 'Processes in the Global Carbon Cycle',
            slideType: 'theory',
            content: [
              '• Photosynthesis: Plants remove CO2 from air to make glucose (CO2 + H2O -> glucose + O2).',
              '• Respiration: Living cells (plants, animals, decomposers) oxidize glucose, releasing CO2 back into atmosphere.',
              '• Feeding: Carbon compounds (proteins, carbohydrates) pass along food chain.',
              '• Decomposition: Fungi and bacteria break down dead organic matter and respire, releasing CO2.',
              '• Fossil Fuel Formation: Trapped dead biomass under heat and pressure over millions of years forms coal, oil, gas.',
              '• Combustion: Burning fossil fuels releases stored carbon as CO2.',
              '• Carbon Sinks: Oceans (dissolved carbonate/limestone), forests, and soil.'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'B16.1',
    topicCode: 'B16',
    topicName: 'Human influences on ecosystems',
    title: 'Habitat Destruction',
    subject: 'biology',
    tier: 'Core & Supplement',
    syllabusSummary: [
      'Ecosystem and biodiversity definitions.',
      'Causes: increased land use (housing, crops, livestock), extraction of natural resources (mining/logging), freshwater & marine pollution.',
      'Undesirable effects of deforestation (biodiversity loss, extinction, soil erosion, flooding, CO2 increase).'
    ],
    decks: [
      {
        id: 'deck-b16-1',
        subtopicCode: 'B16.1',
        topicCode: 'B16',
        title: 'Habitat Destruction & Deforestation',
        subtopicHeader: '[B16.1] Habitat Destruction',
        classworkDate: '14/10/2025',
        objectives: [
          'Describe an ecosystem and biodiversity.',
          'Identify causes and explain undesirable consequences of habitat destruction and deforestation.'
        ],
        keywords: ['ecosystem', 'biodiversity', 'habitat', 'pollution', 'deforestation', 'soil erosion'],
        slides: [
          {
            id: 'b16-1-s1',
            slideNumber: 1,
            subtopicHeader: '[B16.1] Causes & Effects',
            title: 'Causes and Impacts of Habitat Loss',
            slideType: 'theory',
            content: [
              '• Ecosystem: Community of living organisms interacting with the non-living physical environment.',
              '• Biodiversity: The number and variety of different species living in an area.',
              '• Causes of Destruction: 1) Land clearance for housing and urban expansion; 2) Farmland for crop and livestock production; 3) Extraction of minerals, oil, timber; 4) Freshwater and marine pollution (sewage, fertilizers, plastics).',
              '• Deforestation Impacts: Reduces biodiversity; causes species extinction; leads to soil erosion and desertification; increases flooding risks; elevates atmospheric CO2 (less photosynthesis and burning trees).'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'B16.2',
    topicCode: 'B16',
    topicName: 'Human influences on ecosystems',
    title: 'Conservation',
    subject: 'biology',
    tier: 'Core & Supplement',
    syllabusSummary: [
      'Why organisms become endangered: climate change, habitat destruction, hunting, pollution, introduced species.',
      'Conservation methods: monitoring & protected habitats, education, captive breeding, seed banks.'
    ],
    decks: [
      {
        id: 'deck-b16-2',
        subtopicCode: 'B16.2',
        topicCode: 'B16',
        title: 'Conservation Strategies & Endangered Species',
        subtopicHeader: '[B16.2] Conservation',
        classworkDate: '16/10/2025',
        objectives: [
          'Outline why organisms become endangered or extinct.',
          'Describe conservation methods: habitat protection, education, captive breeding, seed banks.'
        ],
        keywords: ['conservation', 'endangered', 'extinction', 'captive breeding', 'seed banks', 'national parks'],
        slides: [
          {
            id: 'b16-2-s1',
            slideNumber: 1,
            subtopicHeader: '[B16.2] Conservation Methods',
            title: 'Preserving Biodiversity for Future Generations',
            slideType: 'theory',
            content: [
              '• Threats: Habitat loss, poaching/hunting, climate change, chemical pollution, invasive foreign species.',
              '• Protected Areas: National parks and marine reserves safeguard natural habitats from exploitation.',
              '• Captive Breeding Programmes: Zoos breed endangered animals for gradual reintroduction to wild.',
              '• Seed Banks: Seeds from endangered plant species are dried and stored at -20°C to preserve genetic diversity.',
              '• Education: Raising community awareness to reduce consumption and support conservation laws.'
            ]
          }
        ]
      }
    ]
  }
];

export const allSubtopicsData: SubtopicTopicGroup[] = [
  ...biologySubtopicsData,
  ...chemistrySubtopicsData,
  ...physicsSubtopicsData
];

export function getSubtopicsBySubject(subject: ScienceSubject): SubtopicTopicGroup[] {
  return allSubtopicsData.filter(s => s.subject === subject);
}

export function getSubtopicByCode(code: string): SubtopicTopicGroup | undefined {
  return allSubtopicsData.find(s => s.subtopicCode.toLowerCase() === code.toLowerCase());
}
