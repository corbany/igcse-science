import { QuizQuestion, ScienceSubject } from '../types';
import { allSubtopicsData, getSubtopicByCode, SubtopicTopicGroup } from './subtopicSlidesData';
import { TOPIC_TEMPLATES } from './syllabusQuestionsBank';

/**
 * Randomizes the 4 options for each question so the correct answer is
 * distributed across A (0), B (1), C (2), and D (3) rather than all being set to A.
 * Enforces a balanced distribution across the 10 questions.
 */
export function randomizeQuizQuestions(questions: QuizQuestion[]): QuizQuestion[] {
  if (!questions || questions.length === 0) return [];

  // Create a balanced target distribution of indices across the 10 questions:
  // e.g. [0, 1, 2, 3, 0, 1, 2, 3, random, random]
  const targetIndices = [0, 1, 2, 3, 0, 1, 2, 3, Math.floor(Math.random() * 4), Math.floor(Math.random() * 4)];
  
  // Shuffle targetIndices array using Fisher-Yates
  for (let i = targetIndices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [targetIndices[i], targetIndices[j]] = [targetIndices[j], targetIndices[i]];
  }

  return questions.map((q, idx) => {
    const targetCorrectIdx = targetIndices[idx % targetIndices.length];
    const correctOpt = q.options[q.correctIndex] ?? q.options[0];
    const distractors = q.options.filter((_, i) => i !== q.correctIndex);

    // Shuffle distractors
    const shuffledDistractors = [...distractors];
    for (let i = shuffledDistractors.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledDistractors[i], shuffledDistractors[j]] = [shuffledDistractors[j], shuffledDistractors[i]];
    }

    // Insert correct answer at targetCorrectIdx and fill other 3 positions with distractors
    const newOptions: string[] = [];
    let d = 0;
    for (let pos = 0; pos < 4; pos++) {
      if (pos === targetCorrectIdx) {
        newOptions.push(correctOpt);
      } else {
        newOptions.push(shuffledDistractors[d++] || `Alternative choice ${pos + 1}`);
      }
    }

    return {
      ...q,
      options: newOptions,
      correctIndex: targetCorrectIdx
    };
  });
}

// Master Predefined Bank for High-Yield Subtopics
export const predefinedSubtopicQuizzes: Record<string, QuizQuestion[]> = {
  // ==========================================
  // BIOLOGY SUBTOPICS
  // ==========================================
  'B1.1': [
    {
      id: 'b1-1-q1',
      subject: 'biology',
      topicCode: 'B1',
      question: 'Which acronym represents the seven characteristics of all living organisms in Cambridge IGCSE Biology?',
      options: ['MRS GREN', 'ATP DNA', 'ROYGBIV', 'PEMDAS'],
      correctIndex: 0,
      explanation: 'MRS GREN stands for Movement, Respiration, Sensitivity, Growth, Reproduction, Excretion, and Nutrition.',
      syllabusRef: 'B1.1'
    },
    {
      id: 'b1-1-q2',
      subject: 'biology',
      topicCode: 'B1',
      question: 'Which of the following is the accurate biological definition of respiration?',
      options: [
        'Breathing air into and out of the lungs',
        'Chemical reactions in cells that break down nutrient molecules to release energy for metabolism',
        'The permanent increase in size and dry mass of an organism',
        'The removal of undigested food as faeces'
      ],
      correctIndex: 1,
      explanation: 'Respiration is the cellular chemical process breaking down glucose to release ATP energy. Breathing is gas exchange/ventilation.',
      syllabusRef: 'B1.1'
    },
    {
      id: 'b1-1-q3',
      subject: 'biology',
      topicCode: 'B1',
      question: 'What is defined as the ability to detect and respond to changes in the internal or external environment?',
      options: ['Sensitivity', 'Movement', 'Excretion', 'Nutrition'],
      correctIndex: 0,
      explanation: 'Sensitivity is detecting and responding to environmental stimuli.',
      syllabusRef: 'B1.1'
    },
    {
      id: 'b1-1-q4',
      subject: 'biology',
      topicCode: 'B1',
      question: 'Why is reproduction essential for a species of living organisms?',
      options: [
        'To ensure individual organisms grow larger',
        'To make more of the same kind of organism, preventing extinction',
        'To release toxic metabolic waste products',
        'To produce ATP directly from sunlight'
      ],
      correctIndex: 1,
      explanation: 'Reproduction makes more of the same kind of organism, ensuring species survival over generations.',
      syllabusRef: 'B1.1'
    },
    {
      id: 'b1-1-q5',
      subject: 'biology',
      topicCode: 'B1',
      question: 'Excretion is strictly defined in Cambridge science as the removal from organisms of which substances?',
      options: [
        'Toxic substances and waste products of metabolism',
        'Undigested solid food material as faeces (egestion)',
        'Excess water from the mouth during eating',
        'Carbon dioxide inhaled from the atmosphere'
      ],
      correctIndex: 0,
      explanation: 'Excretion removes toxic waste products of metabolism (e.g. urea, CO2). Egestion is passing unabsorbed faeces.',
      syllabusRef: 'B1.1'
    },
    {
      id: 'b1-1-q6',
      subject: 'biology',
      topicCode: 'B1',
      question: 'How does plant movement typically differ from animal movement?',
      options: [
        'Plants move from place to place by swimming',
        'Plant movement is typically slow growth towards or away from stimuli (tropisms)',
        'Plants do not move any part of their body at all',
        'Plants move only during night time'
      ],
      correctIndex: 1,
      explanation: 'Plants exhibit growth movements such as phototropism (towards light) rather than locomotion.',
      syllabusRef: 'B1.1'
    },
    {
      id: 'b1-1-q7',
      subject: 'biology',
      topicCode: 'B1',
      question: 'Which life process is defined as taking in materials for energy, growth, and development?',
      options: ['Nutrition', 'Respiration', 'Excretion', 'Reproduction'],
      correctIndex: 0,
      explanation: 'Nutrition provides the chemical compounds required for energy and biosynthesis.',
      syllabusRef: 'B1.1'
    },
    {
      id: 'b1-1-q8',
      subject: 'biology',
      topicCode: 'B1',
      question: 'Why is a motor car not classified as a living organism, despite moving and consuming fuel?',
      options: [
        'It moves too fast compared to animals',
        'It cannot carry out cellular respiration, growth, or biological reproduction',
        'It produces exhaust gases',
        'It is made of metal alloys'
      ],
      correctIndex: 1,
      explanation: 'Non-living machines do not possess cellular structure, dry mass growth, or biological reproduction.',
      syllabusRef: 'B1.1'
    },
    {
      id: 'b1-1-q9',
      subject: 'biology',
      topicCode: 'B1',
      question: 'Growth is strictly defined as a permanent increase in size and what other measurement?',
      options: ['Wet mass', 'Dry mass', 'Water volume', 'External surface area'],
      correctIndex: 1,
      explanation: 'Growth is defined as a permanent increase in size and dry mass (mass without water content).',
      syllabusRef: 'B1.1'
    },
    {
      id: 'b1-1-q10',
      subject: 'biology',
      topicCode: 'B1',
      question: 'Which waste product of human cellular metabolism is excreted by the lungs?',
      options: ['Urea', 'Carbon dioxide', 'Faeces', 'Glucose'],
      correctIndex: 1,
      explanation: 'Carbon dioxide produced by cellular respiration is transported in blood and excreted through the lungs.',
      syllabusRef: 'B1.1'
    }
  ],

  'B2.1': [
    {
      id: 'b2-1-q1',
      subject: 'biology',
      topicCode: 'B2',
      question: 'Which organelle is found in both plant and animal cells and is the site of aerobic cellular respiration?',
      options: ['Mitochondria', 'Chloroplast', 'Large permanent vacuole', 'Cellulose cell wall'],
      correctIndex: 0,
      explanation: 'Mitochondria are the sites of aerobic respiration where glucose is oxidized to release ATP energy.',
      syllabusRef: 'B2.1'
    },
    {
      id: 'b2-1-q2',
      subject: 'biology',
      topicCode: 'B2',
      question: 'Which three structures are present in plant cells but absent from animal cells?',
      options: [
        'Cellulose cell wall, chloroplasts, and large permanent vacuole',
        'Cell membrane, ribosomes, and mitochondria',
        'Nucleus, cytoplasm, and cell membrane',
        'Ribosomes, circular DNA, and flagella'
      ],
      correctIndex: 0,
      explanation: 'Plant cells have a cellulose cell wall, chloroplasts for photosynthesis, and a large central vacuole.',
      syllabusRef: 'B2.1'
    },
    {
      id: 'b2-1-q3',
      subject: 'biology',
      topicCode: 'B2',
      question: 'What is the function of the cell membrane?',
      options: [
        'Controls what enters and exits the cell as a partially permeable barrier',
        'Contains the green pigment chlorophyll for photosynthesis',
        'Synthesises lipids and stores food reserves',
        'Provides rigid mechanical support to prevent lysis'
      ],
      correctIndex: 0,
      explanation: 'The cell membrane is a partially permeable barrier controlling the movement of substances in and out.',
      syllabusRef: 'B2.1'
    },
    {
      id: 'b2-1-q4',
      subject: 'biology',
      topicCode: 'B2',
      question: 'How do bacterial cells (prokaryotes) differ fundamentally from plant and animal cells?',
      options: [
        'They have no cell membrane',
        'They lack a true nucleus; their genetic material is a circular loop of DNA and plasmids',
        'They do not contain ribosomes',
        'They are multicellular organisms'
      ],
      correctIndex: 1,
      explanation: 'Bacterial cells lack a membrane-bound nucleus and mitochondria; their DNA is a circular loop plus plasmids.',
      syllabusRef: 'B2.1'
    },
    {
      id: 'b2-1-q5',
      subject: 'biology',
      topicCode: 'B2',
      question: 'Which adaptation enables red blood cells to transport oxygen with maximum efficiency?',
      options: [
        'Biconcave disc shape, no nucleus, and packed with haemoglobin',
        'Long extensions to absorb mineral ions by active transport',
        'High density of chloroplasts to absorb light',
        'Cilia on their surface to sweep mucus'
      ],
      correctIndex: 0,
      explanation: 'Biconcave shape increases surface area to volume ratio; lack of nucleus allows more haemoglobin.',
      syllabusRef: 'B2.1'
    },
    {
      id: 'b2-1-q6',
      subject: 'biology',
      topicCode: 'B2',
      question: 'What is the correct biological hierarchy from simplest to most complex?',
      options: [
        'Cell -> Tissue -> Organ -> Organ system -> Organism',
        'Organelle -> Organ -> Tissue -> Cell -> Organism',
        'Tissue -> Cell -> Organ system -> Organ -> Organism',
        'Organism -> Organ system -> Organ -> Tissue -> Cell'
      ],
      correctIndex: 0,
      explanation: 'Cells group into tissues, tissues into organs, organs into organ systems, forming an organism.',
      syllabusRef: 'B2.1'
    },
    {
      id: 'b2-1-q7',
      subject: 'biology',
      topicCode: 'B2',
      question: 'If an image of a cell is 40 mm across and the magnification is x400, what is the actual size?',
      options: ['0.1 mm (100 μm)', '16 mm', '10 mm', '0.01 mm'],
      correctIndex: 0,
      explanation: 'Actual size = Image size / Magnification = 40 mm / 400 = 0.1 mm (or 100 μm).',
      syllabusRef: 'B2.1'
    },
    {
      id: 'b2-1-q8',
      subject: 'biology',
      topicCode: 'B2',
      question: 'Which specialised plant cell contains the highest concentration of chloroplasts for photosynthesis?',
      options: [
        'Palisade mesophyll cell',
        'Root hair cell',
        'Xylem vessel',
        'Epidermal cell'
      ],
      correctIndex: 0,
      explanation: 'Palisade mesophyll cells in the upper leaf are column-shaped and packed with chloroplasts to absorb sunlight.',
      syllabusRef: 'B2.1'
    },
    {
      id: 'b2-1-q9',
      subject: 'biology',
      topicCode: 'B2',
      question: 'Why do root hair cells not contain chloroplasts?',
      options: [
        'They are underground in the dark and cannot photosynthesize',
        'They are too small to fit chloroplasts',
        'Chloroplasts would prevent water absorption',
        'They lack a cell wall'
      ],
      correctIndex: 0,
      explanation: 'Roots are underground where light is absent; developing chloroplasts would waste metabolic energy.',
      syllabusRef: 'B2.1'
    },
    {
      id: 'b2-1-q10',
      subject: 'biology',
      topicCode: 'B2',
      question: 'What is the primary function of ribosomes in all living cells?',
      options: [
        'Protein synthesis',
        'Photosynthesis',
        'Aerobic respiration',
        'Storage of starch grains'
      ],
      correctIndex: 0,
      explanation: 'Ribosomes translate mRNA to assemble amino acids into proteins.',
      syllabusRef: 'B2.1'
    }
  ],

  'B3.1': [
    {
      id: 'b3-1-q1',
      subject: 'biology',
      topicCode: 'B3',
      question: 'What is the scientific definition of diffusion in Cambridge IGCSE Biology?',
      options: [
        'The net movement of particles from a region of higher concentration to lower concentration down a concentration gradient as a result of random motion',
        'The movement of water through a fully permeable cell wall using ATP energy',
        'The active pumping of mineral ions against a concentration gradient',
        'The chemical breakdown of starch into maltose by enzymes'
      ],
      correctIndex: 0,
      explanation: 'Diffusion is the passive net movement of particles down a concentration gradient due to random kinetic motion.',
      syllabusRef: 'B3.1'
    },
    {
      id: 'b3-1-q2',
      subject: 'biology',
      topicCode: 'B3',
      question: 'Which combination of factors will increase the rate of diffusion most significantly?',
      options: [
        'Higher temperature, steeper concentration gradient, and larger surface area',
        'Lower temperature, thicker membrane, and smaller surface area',
        'Equal concentration on both sides and freezing temperature',
        'Longer diffusion distance and smaller concentration gradient'
      ],
      correctIndex: 0,
      explanation: 'Diffusion rate increases with temperature (more kinetic energy), steeper gradient, and larger surface area.',
      syllabusRef: 'B3.1'
    },
    {
      id: 'b3-1-q3',
      subject: 'biology',
      topicCode: 'B3',
      question: 'Osmosis is specifically defined as the diffusion of which substance through a partially permeable membrane?',
      options: ['Water molecules', 'Glucose molecules', 'Sodium ions', 'Protein chains'],
      correctIndex: 0,
      explanation: 'Osmosis is the net movement of water molecules from high water potential (dilute) to low water potential (concentrated) through a partially permeable membrane.',
      syllabusRef: 'B3.1'
    },
    {
      id: 'b3-1-q4',
      subject: 'biology',
      topicCode: 'B3',
      question: 'What happens to plant cells placed in a concentrated sucrose solution?',
      options: [
        'Water leaves the cell by osmosis; cytoplasm shrinks from cell wall and cell becomes plasmolysed (flaccid)',
        'Water enters the cell until it bursts (lysis)',
        'The cell wall dissolves completely',
        'Turgor pressure increases dramatically'
      ],
      correctIndex: 0,
      explanation: 'In concentrated solution, water leaves the vacuole by osmosis, causing plasmolysis (flaccidity).',
      syllabusRef: 'B3.1'
    },
    {
      id: 'b3-1-q5',
      subject: 'biology',
      topicCode: 'B3',
      question: 'Why do red blood cells burst when placed in pure distilled water, whereas plant cells do not?',
      options: [
        'Plant cells have a rigid cellulose cell wall that prevents bursting; animal cells only have a delicate cell membrane',
        'Red blood cells actively pump water inside',
        'Plant cell walls are impermeable to water',
        'Animal cell membranes lack carrier proteins'
      ],
      correctIndex: 0,
      explanation: 'Plant cell walls withstand turgor pressure; animal cells lack cell walls and undergo osmotic lysis.',
      syllabusRef: 'B3.1'
    },
    {
      id: 'b3-1-q6',
      subject: 'biology',
      topicCode: 'B3',
      question: 'In an osmosis experiment using potato cylinders, why should cylinders be gently blotted dry before weighing?',
      options: [
        'To remove excess surface liquid which would artificially increase the recorded mass',
        'To evaporate the cell sap inside the potato',
        'To kill bacteria on the potato surface',
        'To increase the rate of osmosis during drying'
      ],
      correctIndex: 0,
      explanation: 'Excess liquid clinging to the outside would give an inaccurate, higher mass measurement.',
      syllabusRef: 'B3.1'
    },
    {
      id: 'b3-1-q7',
      subject: 'biology',
      topicCode: 'B3',
      question: 'Active transport is the movement of particles through a cell membrane with which characteristics?',
      options: [
        'Against a concentration gradient using energy from respiration and carrier proteins',
        'Down a concentration gradient without energy requirement',
        'Movement of water through stomata by transpiration',
        'Passive flow of oxygen into red blood cells'
      ],
      correctIndex: 0,
      explanation: 'Active transport moves particles from low to high concentration using ATP energy and membrane carrier proteins.',
      syllabusRef: 'B3.1'
    },
    {
      id: 'b3-1-q8',
      subject: 'biology',
      topicCode: 'B3',
      question: 'Where in a flowering plant does active transport primarily occur?',
      options: [
        'Uptake of mineral ions by root hair cells from low soil concentrations',
        'Evaporation of water from spongy mesophyll cells',
        'Diffusion of carbon dioxide through open stomata',
        'Movement of sucrose in phloem sieve tubes'
      ],
      correctIndex: 0,
      explanation: 'Root hairs absorb nitrates and potassium from dilute soil water using active transport.',
      syllabusRef: 'B3.1'
    },
    {
      id: 'b3-1-q9',
      subject: 'biology',
      topicCode: 'B3',
      question: 'A solution with a low concentration of solute molecules has what kind of water potential?',
      options: ['High water potential', 'Low water potential', 'Negative water potential', 'Zero water potential'],
      correctIndex: 0,
      explanation: 'Dilute solutions contain more free water molecules and therefore have a higher water potential.',
      syllabusRef: 'B3.1'
    },
    {
      id: 'b3-1-q10',
      subject: 'biology',
      topicCode: 'B3',
      question: 'Why are potato cylinders measured for percentage change in mass rather than change in mass alone?',
      options: [
        'Initial potato cylinders may not have had identical starting masses; percentage change allows fair comparison',
        'Percentage change eliminates experimental error completely',
        'Water cannot be measured in grams',
        'Balances only display percentage values'
      ],
      correctIndex: 0,
      explanation: 'Calculating percentage change controls for slight differences in initial starting mass of tissue pieces.',
      syllabusRef: 'B3.1'
    }
  ],

  'B10.1': [
    {
      id: 'b10-1-q1',
      subject: 'biology',
      topicCode: 'B10',
      question: 'What is the biological definition of a pathogen?',
      options: ['A harmless bacterium in yogurt', 'A disease-causing organism', 'An antibody produced by lymphocytes', 'A red blood cell'],
      correctIndex: 1,
      explanation: 'A pathogen is defined as any disease-causing organism (including bacteria, viruses, fungi, and protists).',
      syllabusRef: 'B10.1'
    },
    {
      id: 'b10-1-q2',
      subject: 'biology',
      topicCode: 'B10',
      question: 'Which of the following is an example of DIRECT disease transmission?',
      options: ['Drinking contaminated well water', 'Sneezing airborne droplets into a room', 'Transfer of bodily fluids through sexual contact or blood transfusion', 'A housefly landing on uncovered meat'],
      correctIndex: 2,
      explanation: 'Direct transmission occurs via direct physical contact between an infected host and susceptible host (e.g. bodily fluids, blood).',
      syllabusRef: 'B10.1'
    },
    {
      id: 'b10-1-q3',
      subject: 'biology',
      topicCode: 'B10',
      question: 'Which human body defence is correctly classified as a CHEMICAL barrier?',
      options: ['Skin', 'Hairs in the nose', 'Hydrochloric acid in the stomach', 'Eyelashes'],
      correctIndex: 2,
      explanation: 'Hydrochloric acid (pH 1-2) chemically destroys pathogens in food. Skin and hairs are mechanical barriers.',
      syllabusRef: 'B10.1'
    },
    {
      id: 'b10-1-q4',
      subject: 'biology',
      topicCode: 'B10',
      question: 'Which two structural features make up a virus particle?',
      options: ['Nucleus and cytoplasm', 'Protein coat (capsid) and genetic material (DNA or RNA)', 'Cell wall and flagellum', 'Ribosomes and mitochondria'],
      correctIndex: 1,
      explanation: 'Viruses are non-cellular; they consist only of genetic material encased within a protective protein coat.',
      syllabusRef: 'B10.1'
    },
    {
      id: 'b10-1-q5',
      subject: 'biology',
      topicCode: 'B10',
      question: 'Active immunity is defined as defence against a pathogen by which mechanism?',
      options: ['Taking aspirin daily', 'Antibody production in the body', 'Swallowing probiotics', 'Passive diffusion of oxygen'],
      correctIndex: 1,
      explanation: 'Active immunity is acquired when the host\'s own lymphocytes produce antibodies in response to antigens.',
      syllabusRef: 'B10.1'
    },
    {
      id: 'b10-1-q6',
      subject: 'biology',
      topicCode: 'B10',
      question: 'What do vaccines contain that stimulates an immune response without causing the disease?',
      options: ['Large doses of antibiotics', 'Weakened or dead forms of the pathogen (or its antigens)', 'Synthetic human hormones', 'Live virulent viruses'],
      correctIndex: 1,
      explanation: 'Vaccines contain harmless, dead, or attenuated antigens that trigger antibody and memory cell production.',
      syllabusRef: 'B10.1'
    },
    {
      id: 'b10-1-q7',
      subject: 'biology',
      topicCode: 'B10',
      question: 'Why does the secondary immune response produce antibodies much faster and in higher quantities upon reinfection?',
      options: ['Because red blood cells remember the shape', 'Because long-lived memory cells recognize the antigen immediately', 'Because stomach acid becomes twice as strong', 'Because pathogens mutate instantly'],
      correctIndex: 1,
      explanation: 'Memory cells formed during primary exposure persist and differentiate rapidly into antibody-secreting cells upon re-encounter.',
      syllabusRef: 'B10.1'
    },
    {
      id: 'b10-1-q8',
      subject: 'biology',
      topicCode: 'B10',
      question: 'Why are antibiotics ineffective against viral diseases like influenza and the common cold?',
      options: [
        'Viruses are too large for antibiotics to reach',
        'Viruses reproduce inside host cells and lack bacterial cell walls and metabolic machinery',
        'Viruses produce antibody shields',
        'Antibiotics only work in cold temperatures'
      ],
      correctIndex: 1,
      explanation: 'Antibiotics target bacterial cell wall synthesis or bacterial ribosomes. Viruses utilize host cell machinery, making antibiotics ineffective.',
      syllabusRef: 'B10.1'
    },
    {
      id: 'b10-1-q9',
      subject: 'biology',
      topicCode: 'B10',
      question: 'Which of the following is NOT one of the 5 key pillars of disease control via hygiene and sanitation?',
      options: ['Clean water supply', 'Safe sewage treatment', 'Universal prescription of antibiotics for viral colds', 'Proper food hygiene'],
      correctIndex: 2,
      explanation: 'Overprescribing antibiotics is dangerous and causes resistant strains like MRSA; it does not treat viruses.',
      syllabusRef: 'B10.1'
    },
    {
      id: 'b10-1-q10',
      subject: 'biology',
      topicCode: 'B10',
      question: 'What happens when antibodies bind to complementary antigens on bacterial surfaces?',
      options: [
        'Pathogens are caused to agglutinate (clump together), facilitating engulfment by phagocytes',
        'The host red blood cells burst',
        'The bacteria become immune to stomach acid',
        'The antibodies turn into new viruses'
      ],
      correctIndex: 0,
      explanation: 'Antibodies bind specifically to antigens, neutralizing toxins and clumping pathogens for rapid destruction by phagocytes.',
      syllabusRef: 'B10.1'
    }
  ],

  // ==========================================
  // CHEMISTRY SUBTOPICS
  // ==========================================
  'C1.1': [
    {
      id: 'c1-1-q1',
      subject: 'chemistry',
      topicCode: 'C1',
      question: 'In terms of kinetic particle theory, what describes the arrangement and motion of particles in a solid?',
      options: [
        'Closely packed in a regular lattice; vibrating about fixed positions',
        'Randomly arranged with large gaps; moving rapidly in straight lines',
        'Touching each other in random positions; able to slide past each other',
        'Stationary with zero kinetic energy'
      ],
      correctIndex: 0,
      explanation: 'Solid particles are arranged in a regular three-dimensional lattice and vibrate around fixed positions.',
      syllabusRef: 'C1.1'
    },
    {
      id: 'c1-1-q2',
      subject: 'chemistry',
      topicCode: 'C1',
      question: 'Why are gases easily compressed, whereas solids and liquids cannot be compressed significantly?',
      options: [
        'Gas particles have large spaces between them compared to particle size',
        'Gas particles are soft and squishy',
        'Solids have no mass',
        'Liquids contain air pockets'
      ],
      correctIndex: 0,
      explanation: 'Gases consist mostly of empty space between widely separated particles, allowing them to be compressed.',
      syllabusRef: 'C1.1'
    },
    {
      id: 'c1-1-q3',
      subject: 'chemistry',
      topicCode: 'C1',
      question: 'What phase change occurs when a substance changes directly from a solid to a gas without entering the liquid state?',
      options: ['Sublimation', 'Evaporation', 'Condensation', 'Melting'],
      correctIndex: 0,
      explanation: 'Sublimation is the direct transition from solid to gas (e.g. dry ice CO2 or iodine).',
      syllabusRef: 'C1.1'
    },
    {
      id: 'c1-1-q4',
      subject: 'chemistry',
      topicCode: 'C1',
      question: 'During melting of ice at 0°C, why does the temperature remain constant even though thermal energy is continually supplied?',
      options: [
        'Thermal energy is used to overcome intermolecular forces of attraction between water molecules rather than increasing kinetic energy',
        'The thermometer breaks at 0°C',
        'The water molecules are destroyed',
        'Ice absorbs negative heat'
      ],
      correctIndex: 0,
      explanation: 'Latent heat of fusion breaks intermolecular bonds during a change of state at constant temperature.',
      syllabusRef: 'C1.1'
    },
    {
      id: 'c1-1-q5',
      subject: 'chemistry',
      topicCode: 'C1',
      question: 'How does increasing temperature affect the pressure of a fixed volume of gas?',
      options: [
        'Pressure increases because particles gain kinetic energy, move faster, and collide more frequently and forcefully with container walls',
        'Pressure decreases because particles condense',
        'Pressure remains completely unchanged',
        'The gas particles stop colliding'
      ],
      correctIndex: 0,
      explanation: 'Higher temperature increases average kinetic energy and velocity of gas particles, causing harder and more frequent wall collisions.',
      syllabusRef: 'C1.1'
    },
    {
      id: 'c1-1-q6',
      subject: 'chemistry',
      topicCode: 'C1',
      question: 'What is the key difference between boiling and evaporation of a liquid?',
      options: [
        'Boiling occurs at a specific boiling point throughout the liquid; evaporation occurs at any temperature below the boiling point and only at the surface',
        'Evaporation produces gas bubbles throughout the liquid',
        'Boiling is a physical change while evaporation is a chemical reaction',
        'Evaporation only happens in vacuum'
      ],
      correctIndex: 0,
      explanation: 'Boiling happens at a fixed temperature with bubbles throughout; evaporation occurs at the liquid surface at any temperature.',
      syllabusRef: 'C1.1'
    },
    {
      id: 'c1-1-q7',
      subject: 'chemistry',
      topicCode: 'C1',
      question: 'In the diffusion of ammonia (NH3) and hydrogen chloride (HCl) in a glass tube, where does the white ammonium chloride ring form?',
      options: [
        'Closer to the HCl end, because ammonia has a lower molecular mass (Mr=17) and diffuses faster than HCl (Mr=36.5)',
        'Exactly in the center between the two cotton wool plugs',
        'Closer to the NH3 end because HCl is lighter',
        'At both ends simultaneously'
      ],
      correctIndex: 0,
      explanation: 'Lighter gas molecules (NH3, Mr=17) have higher average velocity and diffuse faster than heavier HCl (Mr=36.5).',
      syllabusRef: 'C1.1'
    },
    {
      id: 'c1-1-q8',
      subject: 'chemistry',
      topicCode: 'C1',
      question: 'A substance melts at -114°C and boils at 78°C. What state of matter is it in at 25°C?',
      options: ['Liquid', 'Solid', 'Gas', 'Plasma'],
      correctIndex: 0,
      explanation: 'Since 25°C is between melting point (-114°C) and boiling point (78°C), the substance is in the liquid state.',
      syllabusRef: 'C1.1'
    },
    {
      id: 'c1-1-q9',
      subject: 'chemistry',
      topicCode: 'C1',
      question: 'Which process describes the change from a gas to a liquid?',
      options: ['Condensation', 'Evaporation', 'Freezing', 'Sublimation'],
      correctIndex: 0,
      explanation: 'Condensation is the physical state change from gas to liquid as thermal energy is removed.',
      syllabusRef: 'C1.1'
    },
    {
      id: 'c1-1-q10',
      subject: 'chemistry',
      topicCode: 'C1',
      question: 'Brownian motion provides direct visual evidence for which fundamental theory?',
      options: [
        'The kinetic theory that particles in fluids are in continuous, random motion',
        'The nuclear model of the atom',
        'The law of conservation of mass in reactions',
        'The periodic recurrence of chemical elements'
      ],
      correctIndex: 0,
      explanation: 'Random erratic motion of smoke particles or pollen grains results from collisions with invisible fast-moving fluid molecules.',
      syllabusRef: 'C1.1'
    }
  ],

  'C11.4': [
    {
      id: 'c11-4-q1',
      subject: 'chemistry',
      topicCode: 'C11',
      question: 'What is the functional group that distinguishes alkenes from alkanes?',
      options: ['Carbon-carbon single bond (C-C)', 'Carbon-carbon double bond (C=C)', 'Hydroxyl group (-OH)', 'Carboxylic acid group (-COOH)'],
      correctIndex: 1,
      explanation: 'Alkenes are unsaturated hydrocarbons containing at least one carbon-carbon double bond (C=C).',
      syllabusRef: 'C11.4'
    },
    {
      id: 'c11-4-q2',
      subject: 'chemistry',
      topicCode: 'C11',
      question: 'What is the chemical test used to distinguish between an alkane and an alkene?',
      options: ['Universal indicator solution', 'Bromine water', 'Limewater test', 'Flame test'],
      correctIndex: 1,
      explanation: 'Bromine water tests for unsaturation. Alkenes decolorize bromine water from orange to colourless.',
      syllabusRef: 'C11.4'
    },
    {
      id: 'c11-4-q3',
      subject: 'chemistry',
      topicCode: 'C11',
      question: 'What colour change is observed when ethene gas is bubbled into orange bromine water?',
      options: ['Orange to purple', 'Orange to colourless (decolorises)', 'Colourless to orange', 'Blue to brick red'],
      correctIndex: 1,
      explanation: 'The C=C double bond opens and adds bromine across the carbons, forming colourless 1,2-dibromoethane.',
      syllabusRef: 'C11.4'
    },
    {
      id: 'c11-4-q4',
      subject: 'chemistry',
      topicCode: 'C11',
      question: 'What process is used industrially to break large alkane molecules into smaller alkanes and alkenes?',
      options: ['Fractional distillation', 'Catalytic cracking', 'Neutralisation', 'Filtration'],
      correctIndex: 1,
      explanation: 'Cracking thermally decomposes long-chain hydrocarbons into shorter, more useful fuels and alkenes.',
      syllabusRef: 'C11.4'
    },
    {
      id: 'c11-4-q5',
      subject: 'chemistry',
      topicCode: 'C11',
      question: 'Which conditions are typically required for the catalytic cracking of decane (C10H22)?',
      options: ['Room temperature and water', 'High temperature (~600-700°C) and a catalyst (aluminium oxide / porous pot)', 'Freezing temperatures and oxygen', 'High voltage direct current'],
      correctIndex: 1,
      explanation: 'Cracking requires high thermal energy (600-700°C) and an aluminosilicate / broken porcelain catalyst.',
      syllabusRef: 'C11.4'
    },
    {
      id: 'c11-4-q6',
      subject: 'chemistry',
      topicCode: 'C11',
      question: 'In the cracking reaction: C10H22 -> C8H18 + X, what is product X?',
      options: ['Methane (CH4)', 'Ethene (C2H4)', 'Propane (C3H8)', 'Hydrogen (H2)'],
      correctIndex: 1,
      explanation: '10 - 8 = 2 carbons; 22 - 18 = 4 hydrogens. Product X is ethene (C2H4).',
      syllabusRef: 'C11.4'
    },
    {
      id: 'c11-4-q7',
      subject: 'chemistry',
      topicCode: 'C11',
      question: 'What product is formed when ethene reacts with hydrogen gas (hydrogenation) in the presence of a nickel catalyst at 150°C?',
      options: ['Ethanol', 'Ethane', 'Carbon dioxide', 'Poly(ethene)'],
      correctIndex: 1,
      explanation: 'Hydrogenation adds H2 across the double bond of ethene (C2H4 + H2 -> C2H6 ethane).',
      syllabusRef: 'C11.4'
    },
    {
      id: 'c11-4-q8',
      subject: 'chemistry',
      topicCode: 'C11',
      question: 'What is the industrial application of the hydrogenation of vegetable oils?',
      options: ['Producing petrol for racing cars', 'Manufacturing solid margarine from liquid plant oils', 'Purifying domestic drinking water', 'Making dynamite'],
      correctIndex: 1,
      explanation: 'Hydrogenating unsaturated vegetable oils raises their melting point, converting them into spreadable margarine.',
      syllabusRef: 'C11.4'
    },
    {
      id: 'c11-4-q9',
      subject: 'chemistry',
      topicCode: 'C11',
      question: 'When ethene reacts with steam in the presence of concentrated phosphoric acid catalyst, what compound is synthesized?',
      options: ['Methane', 'Ethanol', 'Ethanoic acid', 'Bromoethane'],
      correctIndex: 1,
      explanation: 'Hydration of ethene: C2H4 + H2O (g) -> C2H5OH (ethanol).',
      syllabusRef: 'C11.4'
    },
    {
      id: 'c11-4-q10',
      subject: 'chemistry',
      topicCode: 'C11',
      question: 'Why are alkenes classified as \'unsaturated\' hydrocarbons?',
      options: [
        'They contain water in their molecular structure',
        'They contain fewer hydrogen atoms than the maximum possible due to a C=C double bond',
        'They dissolve completely in water',
        'They cannot react with oxygen'
      ],
      correctIndex: 1,
      explanation: 'Unsaturated compounds contain carbon-carbon double bonds, meaning they do not hold the maximum capacity of hydrogen atoms.',
      syllabusRef: 'C11.4'
    }
  ],

  // ==========================================
  // PHYSICS SUBTOPICS
  // ==========================================
  'P1.1': [
    {
      id: 'p1-1-q1',
      subject: 'physics',
      topicCode: 'P1',
      question: 'What is the formula to calculate the average speed of a moving object?',
      options: ['Speed = distance / time', 'Speed = acceleration × time', 'Speed = force / mass', 'Speed = distance × time'],
      correctIndex: 0,
      explanation: 'Average speed is defined as the total distance travelled divided by the total time taken (v = d/t).',
      syllabusRef: 'P1.1'
    },
    {
      id: 'p1-1-q2',
      subject: 'physics',
      topicCode: 'P1',
      question: 'What does the gradient (slope) of a distance-time graph represent?',
      options: ['Speed', 'Acceleration', 'Distance', 'Force'],
      correctIndex: 0,
      explanation: 'The gradient of a distance-time graph = change in distance / change in time = speed.',
      syllabusRef: 'P1.1'
    },
    {
      id: 'p1-1-q3',
      subject: 'physics',
      topicCode: 'P1',
      question: 'What does a horizontal (flat) line on a distance-time graph represent?',
      options: ['The object is stationary (at rest)', 'Constant high speed', 'Constant acceleration', 'Moving backwards'],
      correctIndex: 0,
      explanation: 'A flat line indicates distance is not changing as time passes; the speed is 0 m/s.',
      syllabusRef: 'P1.1'
    },
    {
      id: 'p1-1-q4',
      subject: 'physics',
      topicCode: 'P1',
      question: 'What does the gradient of a speed-time (or velocity-time) graph represent?',
      options: ['Acceleration', 'Speed', 'Distance travelled', 'Resultant force'],
      correctIndex: 0,
      explanation: 'Gradient of velocity-time graph = change in velocity / change in time = acceleration (a = Δv/Δt).',
      syllabusRef: 'P1.1'
    },
    {
      id: 'p1-1-q5',
      subject: 'physics',
      topicCode: 'P1',
      question: 'How is the distance travelled determined from a speed-time graph?',
      options: [
        'By calculating the area under the speed-time graph',
        'By measuring the highest speed reached',
        'By finding the gradient of the graph',
        'By reading the time axis intercept'
      ],
      correctIndex: 0,
      explanation: 'The area under any speed-time graph corresponds directly to the total distance travelled.',
      syllabusRef: 'P1.1'
    },
    {
      id: 'p1-1-q6',
      subject: 'physics',
      topicCode: 'P1',
      question: 'A car accelerates uniformly from rest to 20 m/s in 5 seconds. What is its acceleration?',
      options: ['4 m/s²', '100 m/s²', '0.25 m/s²', '15 m/s²'],
      correctIndex: 0,
      explanation: 'Acceleration a = (v - u) / t = (20 - 0) / 5 = 4 m/s².',
      syllabusRef: 'P1.1'
    },
    {
      id: 'p1-1-q7',
      subject: 'physics',
      topicCode: 'P1',
      question: 'What does a horizontal line on a velocity-time graph represent?',
      options: [
        'Constant speed (zero acceleration)',
        'Object is at rest',
        'Uniform acceleration',
        'Decreasing distance'
      ],
      correctIndex: 0,
      explanation: 'Velocity remains unchanged over time, meaning speed is constant and acceleration is zero.',
      syllabusRef: 'P1.1'
    },
    {
      id: 'p1-1-q8',
      subject: 'physics',
      topicCode: 'P1',
      question: 'What is deceleration?',
      options: [
        'Negative acceleration (decrease in speed over time)',
        'Moving in a circular orbit',
        'Maximum constant velocity',
        'The force of air resistance'
      ],
      correctIndex: 0,
      explanation: 'Deceleration (or retardation) is negative acceleration where velocity decreases over time.',
      syllabusRef: 'P1.1'
    },
    {
      id: 'p1-1-q9',
      subject: 'physics',
      topicCode: 'P1',
      question: 'What is the SI unit of acceleration?',
      options: ['m/s²', 'm/s', 'km/h', 'N/kg'],
      correctIndex: 0,
      explanation: 'Acceleration measures rate of change of velocity in metres per second squared (m/s²).',
      syllabusRef: 'P1.1'
    },
    {
      id: 'p1-1-q10',
      subject: 'physics',
      topicCode: 'P1',
      question: 'A cyclist travels 1500 metres in 100 seconds. What is their average speed?',
      options: ['15 m/s', '150 m/s', '1.5 m/s', '25 m/s'],
      correctIndex: 0,
      explanation: 'Speed = distance / time = 1500 m / 100 s = 15 m/s.',
      syllabusRef: 'P1.1'
    }
  ],

  'P1.2': [
    {
      id: 'p1-2-q1',
      subject: 'physics',
      topicCode: 'P1',
      question: 'What is the relationship between mass, weight, and gravitational field strength?',
      options: ['Weight = mass × gravitational field strength (W = mg)', 'Mass = weight × g', 'Weight = mass / g', 'Mass = weight / volume'],
      correctIndex: 0,
      explanation: 'Weight is the gravitational force acting on an object: W = mg (where g ≈ 9.8 N/kg or 10 N/kg on Earth).',
      syllabusRef: 'P1.2'
    },
    {
      id: 'p1-2-q2',
      subject: 'physics',
      topicCode: 'P1',
      question: 'What is Newton\'s Second Law relating resultant force, mass, and acceleration?',
      options: ['Resultant force = mass × acceleration (F = ma)', 'F = m / a', 'F = a / m', 'F = mass × speed'],
      correctIndex: 0,
      explanation: 'Resultant force produces an acceleration proportional to force and inversely proportional to mass: F = ma.',
      syllabusRef: 'P1.2'
    },
    {
      id: 'p1-2-q3',
      subject: 'physics',
      topicCode: 'P1',
      question: 'An astronaut has a mass of 80 kg on Earth. What is the astronaut\'s mass on the Moon (where g ≈ 1.6 N/kg)?',
      options: ['80 kg', '128 kg', '13.3 kg', '0 kg'],
      correctIndex: 0,
      explanation: 'Mass is the amount of matter in an object and remains constant anywhere in the universe; weight changes with g.',
      syllabusRef: 'P1.2'
    },
    {
      id: 'p1-2-q4',
      subject: 'physics',
      topicCode: 'P1',
      question: 'What is Hooke\'s Law for an elastic spring?',
      options: [
        'Extension is directly proportional to load force, provided the limit of proportionality is not exceeded (F = kx)',
        'Force is inversely proportional to spring length',
        'Springs always return to original shape regardless of load',
        'Extension = mass × gravitational field'
      ],
      correctIndex: 0,
      explanation: 'Hooke\'s Law states F = kx (load is proportional to extension up to the limit of proportionality).',
      syllabusRef: 'P1.2'
    },
    {
      id: 'p1-2-q5',
      subject: 'physics',
      topicCode: 'P1',
      question: 'What is terminal velocity for a falling object through a fluid such as air?',
      options: [
        'The constant maximum velocity reached when upward drag force equals downward weight (resultant force = 0)',
        'The speed of light in vacuum',
        'The velocity when an object hits the ground',
        'When acceleration reaches 9.8 m/s²'
      ],
      correctIndex: 0,
      explanation: 'Terminal velocity occurs when resistive drag balances gravitational weight; acceleration becomes 0.',
      syllabusRef: 'P1.2'
    },
    {
      id: 'p1-2-q6',
      subject: 'physics',
      topicCode: 'P1',
      question: 'A resultant force of 24 N acts on an object of mass 6 kg. What is the acceleration produced?',
      options: ['4 m/s²', '144 m/s²', '0.25 m/s²', '18 m/s²'],
      correctIndex: 0,
      explanation: 'a = F / m = 24 N / 6 kg = 4 m/s².',
      syllabusRef: 'P1.2'
    },
    {
      id: 'p1-2-q7',
      subject: 'physics',
      topicCode: 'P1',
      question: 'What is the effect of friction on moving surfaces in contact?',
      options: [
        'It opposes relative motion and converts kinetic energy into thermal energy',
        'It always accelerates the object forward',
        'It destroys kinetic energy without creating heat',
        'It eliminates gravitational attraction'
      ],
      correctIndex: 0,
      explanation: 'Friction opposes relative motion and dissipates mechanical energy as heat.',
      syllabusRef: 'P1.2'
    },
    {
      id: 'p1-2-q8',
      subject: 'physics',
      topicCode: 'P1',
      question: 'When two opposite forces acting on a trolley are 15 N to the right and 15 N to the left, what is the resultant force?',
      options: ['0 N (balanced forces)', '30 N to the right', '15 N to the left', '225 N'],
      correctIndex: 0,
      explanation: 'Opposing equal forces cancel out: 15 N - 15 N = 0 N (balanced, object maintains constant velocity).',
      syllabusRef: 'P1.2'
    },
    {
      id: 'p1-2-q9',
      subject: 'physics',
      topicCode: 'P1',
      question: 'What instrument is used in the laboratory to measure force or weight in newtons?',
      options: ['Newton spring balance (force meter)', 'Top-pan electronic balance', 'Micrometer screw gauge', 'Graduated measuring cylinder'],
      correctIndex: 0,
      explanation: 'A spring balance calibrated in newtons measures force directly via spring extension.',
      syllabusRef: 'P1.2'
    },
    {
      id: 'p1-2-q10',
      subject: 'physics',
      topicCode: 'P1',
      question: 'What happens to a spring stretched beyond its elastic limit (limit of proportionality)?',
      options: [
        'It undergoes permanent plastic deformation and will not return to its original length',
        'It doubles its spring constant',
        'Its extension becomes zero',
        'It behaves as an ideal liquid'
      ],
      correctIndex: 0,
      explanation: 'Beyond the elastic limit, plastic deformation occurs and the spring remains permanently stretched.',
      syllabusRef: 'P1.2'
    }
  ]
};

/**
 * Builds a dynamic, unique 10-question quiz specifically tailored to ANY subtopic
 * by analyzing its slides, starter questions/answers, tasks, and syllabus objectives.
 */
function buildDynamicSubtopicQuiz(subtopic: SubtopicTopicGroup): QuizQuestion[] {
  const code = subtopic.subtopicCode;
  const title = subtopic.title;
  const subject = subtopic.subject;
  const topicCode = subtopic.topicCode;
  const decks = subtopic.decks || [];
  const primaryDeck = decks[0];

  const questions: QuizQuestion[] = [];

  // 1. Starter Look-Back Question (if present in deck)
  if (primaryDeck?.starterLookBack?.question && primaryDeck.starterLookBack.answer) {
    questions.push({
      id: `${code}-q-lookback`,
      subject,
      topicCode,
      question: `[Lesson Review] ${primaryDeck.starterLookBack.question}`,
      options: [
        primaryDeck.starterLookBack.answer,
        'No measurable relationship could be determined from prior experimental tests',
        'The opposite occurs due to thermal degradation in laboratory conditions',
        'All variables remain independent of biological or physical mechanisms'
      ],
      correctIndex: 0,
      explanation: `From the lesson starter: ${primaryDeck.starterLookBack.answer}`,
      syllabusRef: code
    });
  }

  // 2. Starter Look-Forward / Core Problem (if present)
  if (primaryDeck?.starterLookForward?.question && primaryDeck.starterLookForward.answer) {
    questions.push({
      id: `${code}-q-lookforward`,
      subject,
      topicCode,
      question: `[Concept Investigation] ${primaryDeck.starterLookForward.question}`,
      options: [
        primaryDeck.starterLookForward.answer,
        'Physical processes operate purely by chance with no fixed scientific rules',
        'The reaction cannot occur in Cambridge syllabus laboratory conditions',
        'Only temperature dictates reactions without molecular interactions'
      ],
      correctIndex: 0,
      explanation: `From the lesson starter inquiry: ${primaryDeck.starterLookForward.answer}`,
      syllabusRef: code
    });
  }

  // 3. Extract Specific Theory Slide Definitions & Principles
  const theorySlides = decks.flatMap(d => d.slides || []).filter(s => s.slideType === 'theory' || s.slideType === 'starter');
  theorySlides.forEach((slide, sIdx) => {
    if (questions.length >= 8) return;
    
    // Look for bullet points with key definitions (e.g. "• Term: definition")
    const bulletDef = slide.content.find(c => c.includes(':') && c.length > 25);
    if (bulletDef) {
      const parts = bulletDef.replace(/^•\s*/, '').split(':');
      const term = parts[0].trim();
      const def = parts.slice(1).join(':').trim();

      if (term.length < 35 && def.length > 15) {
        questions.push({
          id: `${code}-q-theory-${sIdx}`,
          subject,
          topicCode,
          question: `According to the lesson slides on "${slide.title}", which scientific concept is described as: "${def}"?`,
          options: [
            term,
            primaryDeck?.keywords[sIdx % (primaryDeck.keywords.length || 1)] || 'Equilibrium constant',
            'Independent control factor',
            'Caloric heat capacity'
          ],
          correctIndex: 0,
          explanation: `In ${code}, ${term} is explicitly defined as: ${def}`,
          syllabusRef: code
        });
      }
    } else if (slide.content.length > 0) {
      // General theory statement
      const keyFact = slide.content[0].replace(/^•\s*/, '');
      questions.push({
        id: `${code}-q-slide-${sIdx}`,
        subject,
        topicCode,
        question: `In the study of ${title} ("${slide.title}"), which statement reflects the key scientific principle taught?`,
        options: [
          keyFact,
          'Atoms and energy are created and destroyed during ordinary reactions',
          'Results depend entirely on non-reproducible external conditions',
          'No quantitative measurements are required for verification'
        ],
        correctIndex: 0,
        explanation: `From lesson slides: ${keyFact}`,
        syllabusRef: code
      });
    }
  });

  // 4. Practical Investigation, Equipment & Safety
  const practicalSlide = decks.flatMap(d => d.slides || []).find(s => s.practicalInfo || s.slideType === 'practical');
  if (practicalSlide?.practicalInfo) {
    const p = practicalSlide.practicalInfo;
    if (p.equipment && p.equipment.length > 0) {
      questions.push({
        id: `${code}-q-apparatus`,
        subject,
        topicCode,
        question: `When carrying out the practical investigation for ${title} (${p.aim}), which apparatus is essential?`,
        options: [
          p.equipment.slice(0, 3).join(', '),
          'Mercury barometer, uncalibrated scoop, non-sterile soil',
          'Plastic basin without volume markings, iron nails, ruler only',
          'Barometer and telescope only'
        ],
        correctIndex: 0,
        explanation: `Required Cambridge laboratory equipment: ${p.equipment.join(', ')}.`,
        syllabusRef: code
      });
    }

    if (p.riskAssessment && p.riskAssessment.length > 0) {
      const risk = p.riskAssessment[0];
      questions.push({
        id: `${code}-q-safety`,
        subject,
        topicCode,
        question: `In the risk assessment for ${title} (${risk.hazard}), what is the required laboratory precaution?`,
        options: [
          risk.precaution,
          'Perform experiment without eye protection to observe closer',
          'Heat flammable substances directly over an open naked flame',
          'Dispose of all concentrated chemicals directly into the open sink'
        ],
        correctIndex: 0,
        explanation: `Safety precaution for ${risk.hazard}: ${risk.precaution}.`,
        syllabusRef: code
      });
    }
  }

  // 5. Classroom Tasks & Solutions
  const taskSlide = decks.flatMap(d => d.slides || []).find(s => s.task);
  if (taskSlide?.task) {
    const t = taskSlide.task;
    if (t.solution) {
      questions.push({
        id: `${code}-q-task`,
        subject,
        topicCode,
        question: `Regarding the classroom exercise on "${t.taskName}": ${t.instructions.slice(0, 100)}... what is the correct scientific outcome?`,
        options: [
          t.solution.slice(0, 120),
          'The rate decreases exponentially to zero immediately',
          'No reaction occurs because temperature remains neutral',
          'The experiment violates the conservation of mass'
        ],
        correctIndex: 0,
        explanation: `Classroom task solution: ${t.solution}`,
        syllabusRef: code
      });
    }
  }

  // 6. Syllabus Objectives from Specification Summary
  (subtopic.syllabusSummary || []).forEach((summaryPoint, idx) => {
    if (questions.length >= 10) return;
    questions.push({
      id: `${code}-q-summary-${idx}`,
      subject,
      topicCode,
      question: `Which statement accurately aligns with the Cambridge 0653 syllabus specification for ${code}: "${title}"?`,
      options: [
        summaryPoint,
        'Chemical and physical systems do not obey predictable laws of conservation',
        'Measurements should be taken without standard units or repeats',
        'Observations in this topic are independent of atoms, forces, or cells'
      ],
      correctIndex: 0,
      explanation: `Cambridge 0653 specification requirement: ${summaryPoint}`,
      syllabusRef: code
    });
  });

  // 7. Fill remainder from topic question templates in syllabusQuestionsBank if needed
  if (questions.length < 10 && TOPIC_TEMPLATES[topicCode]) {
    const templates = TOPIC_TEMPLATES[topicCode];
    templates.forEach((tmpl, tIdx) => {
      if (questions.length >= 10) return;
      const vars = tmpl.generateVars ? tmpl.generateVars() : {};
      const stem = typeof tmpl.stem === 'function' ? tmpl.stem(vars) : tmpl.stem;
      const correct = typeof tmpl.correct === 'function' ? tmpl.correct(vars) : tmpl.correct;
      const distractors = typeof tmpl.distractors === 'function' ? tmpl.distractors(vars) : tmpl.distractors;
      const explanation = typeof tmpl.explanation === 'function' ? tmpl.explanation(vars) : tmpl.explanation;

      questions.push({
        id: `${code}-q-bank-${tIdx}`,
        subject,
        topicCode,
        question: stem,
        options: [correct, ...distractors],
        correctIndex: 0,
        explanation,
        syllabusRef: code
      });
    });
  }

  // 8. If still under 10, add subtopic keyword applications
  let kwIdx = 0;
  while (questions.length < 10) {
    const kw = primaryDeck?.keywords[kwIdx] || `concept ${kwIdx + 1}`;
    questions.push({
      id: `${code}-q-kw-${kwIdx}`,
      subject,
      topicCode,
      question: `Why is understanding "${kw}" essential when answering Cambridge exam questions for ${code} (${title})?`,
      options: [
        `It represents a core scientific principle and mark-scheme keyword required to explain the mechanism in ${title}`,
        'It is an arbitrary historical label not used in exam mark schemes',
        'It applies only to theoretical physics in outer space',
        'It describes an anomalous error that examiners always penalise'
      ],
      correctIndex: 0,
      explanation: `"${kw}" is a mandatory Cambridge syllabus keyword for ${code}.`,
      syllabusRef: code
    });
    kwIdx++;
  }

  return questions.slice(0, 10);
}

/**
 * Returns a complete, 10-question quiz tailored specifically to the given subtopic.
 * Guarantees that:
 * 1. Questions are grounded in the subtopic's actual slides, starter prompts, and syllabus points.
 * 2. Every question has its options randomized, with correctIndex evenly spread across A (0), B (1), C (2), and D (3).
 */
export function getQuizForSubtopic(subtopicCode: string): QuizQuestion[] {
  const normalized = subtopicCode.trim().toUpperCase();

  // 1. Check if a high-yield hand-crafted bank exists
  if (predefinedSubtopicQuizzes[normalized] && predefinedSubtopicQuizzes[normalized].length >= 10) {
    const baseBank = predefinedSubtopicQuizzes[normalized].slice(0, 10);
    return randomizeQuizQuestions(baseBank);
  }

  // 2. Look up the subtopic in our comprehensive Cambridge data
  const subtopic = getSubtopicByCode(normalized) || 
    allSubtopicsData.find(s => s.subtopicCode.toLowerCase() === normalized.toLowerCase());

  if (subtopic) {
    const dynamicQuiz = buildDynamicSubtopicQuiz(subtopic);
    return randomizeQuizQuestions(dynamicQuiz);
  }

  // 3. Fallback for any unknown code
  const subject: ScienceSubject = normalized.startsWith('B') ? 'biology' : normalized.startsWith('C') ? 'chemistry' : 'physics';
  const topicCode = normalized.split('.')[0] || 'B1';
  const fallbackTemplates = TOPIC_TEMPLATES[topicCode] || TOPIC_TEMPLATES['B1'] || [];

  const fallbackQuestions: QuizQuestion[] = fallbackTemplates.slice(0, 10).map((tmpl, idx) => {
    const vars = tmpl.generateVars ? tmpl.generateVars() : {};
    const stem = typeof tmpl.stem === 'function' ? tmpl.stem(vars) : tmpl.stem;
    const correct = typeof tmpl.correct === 'function' ? tmpl.correct(vars) : tmpl.correct;
    const distractors = typeof tmpl.distractors === 'function' ? tmpl.distractors(vars) : tmpl.distractors;
    const explanation = typeof tmpl.explanation === 'function' ? tmpl.explanation(vars) : tmpl.explanation;

    return {
      id: `${normalized}-fb-${idx}`,
      subject,
      topicCode,
      question: stem,
      options: [correct, ...distractors],
      correctIndex: 0,
      explanation,
      syllabusRef: normalized
    };
  });

  return randomizeQuizQuestions(fallbackQuestions);
}
