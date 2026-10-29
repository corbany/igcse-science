import { QuizQuestion, ScienceSubject } from '../types';

/**
 * Master Question Library for Cambridge IGCSE Combined Science 0653.
 * Strictly aligned with syllabus learning objectives, Paper 2 MCQ standards,
 * and Paper 6 practical skills.
 * 
 * Features:
 * - Scenario and experimental observation questions
 * - Causal mechanisms and explanations
 * - Quantitative calculations with realistic numbers
 * - Chemical & food tests (Benedict's, Biuret, Iodine, Ethanol, Flame tests, Cation/Anion tests)
 * - Structural and functional distinctions (e.g. arteries vs veins, xylem vs phloem)
 * - Strictly NO mole calculations from mass/concentration in C3 (excluded in Cambridge 0653)
 * - Zero tautological questions (NO "which concept describes 'X'?" with answer 'X')
 */

export const TOPIC_QUESTION_LIBRARY: Record<string, QuizQuestion[]> = {
  // ==========================================
  // BIOLOGY TOPICS (B1 - B16)
  // ==========================================

  // B1 Characteristics of Living Organisms
  'B1': [
    {
      id: 'lib-b1-1',
      subject: 'biology',
      topicCode: 'B1',
      question: 'Which characteristic of living organisms describes the biochemical breakdown of nutrient molecules in cells to release energy for metabolic processes?',
      options: [
        'Respiration',
        'Nutrition',
        'Excretion',
        'Sensitivity'
      ],
      correctIndex: 0,
      explanation: 'Respiration is defined as the chemical reactions in cells that break down nutrient molecules and release energy for metabolism. Breathing is ventilation/gas exchange.',
      syllabusRef: 'B1.1'
    },
    {
      id: 'lib-b1-2',
      subject: 'biology',
      topicCode: 'B1',
      question: 'A student observes an organism expelling undigested food as faeces. Why is this process classified as egestion rather than excretion in Cambridge Biology?',
      options: [
        'Egestion is the removal of undigested dietary matter that has never entered cells; excretion removes toxic waste products of cellular metabolism',
        'Egestion only occurs in plants while excretion only occurs in mammals',
        'Egestion releases energy while excretion requires cellular energy',
        'Egestion involves gaseous exchange across alveoli while excretion occurs in the kidneys'
      ],
      correctIndex: 0,
      explanation: 'Excretion is the removal of toxic materials and substances in excess of requirements produced by cellular metabolism (e.g. urea, CO2). Egestion is passing out undigested food as faeces.',
      syllabusRef: 'B1.1'
    },
    {
      id: 'lib-b1-3',
      subject: 'biology',
      topicCode: 'B1',
      question: 'A potted plant on a windowsill bends its stem towards the sunlight over several days. Which two characteristics of life are directly illustrated?',
      options: [
        'Sensitivity and Growth',
        'Nutrition and Respiration',
        'Excretion and Reproduction',
        'Movement and Egestion'
      ],
      correctIndex: 0,
      explanation: 'Detecting light stimulus is sensitivity (phototropism), and differential elongation of cells in the shoot causes growth-mediated bending.',
      syllabusRef: 'B1.1'
    },
    {
      id: 'lib-b1-4',
      subject: 'biology',
      topicCode: 'B1',
      question: 'How is "growth" strictly defined in the Cambridge IGCSE 0653 syllabus?',
      options: [
        'A permanent increase in size and dry mass by an increase in cell number or cell size',
        'A temporary increase in fresh mass caused by water absorption',
        'An increase in body surface area without change in mass',
        'The process of making more individuals of the same kind of organism'
      ],
      correctIndex: 0,
      explanation: 'Cambridge mark schemes define growth as a permanent increase in size and dry mass (mass of organism with all water removed) by an increase in cell number, cell size, or both.',
      syllabusRef: 'B1.1'
    }
  ],

  // B2 Cells & Organisation
  'B2': [
    {
      id: 'lib-b2-1',
      subject: 'biology',
      topicCode: 'B2',
      question: 'Which cellular structures are found in both a human liver cell and a plant palisade mesophyll cell?',
      options: [
        'Cytoplasm, cell membrane, nucleus, and mitochondria',
        'Cell wall, chloroplasts, and large central vacuole',
        'Cell membrane, cell wall, and cytoplasm',
        'Chloroplasts, nucleus, and glycogen granules'
      ],
      correctIndex: 0,
      explanation: 'Both plant and animal cells contain a cell membrane, cytoplasm, nucleus, and mitochondria. Cell walls and chloroplasts are absent from animal cells.',
      syllabusRef: 'B2.1'
    },
    {
      id: 'lib-b2-2',
      subject: 'biology',
      topicCode: 'B2',
      question: 'A student views a root hair cell under a light microscope. The image length of the cell on a diagram is 48 mm, and the magnification is ×400. What is the actual length of the cell?',
      options: [
        '120 μm',
        '12 μm',
        '1200 μm',
        '1.2 μm'
      ],
      correctIndex: 0,
      explanation: 'Convert image size to μm: 48 mm × 1000 = 48,000 μm. Actual size A = Image I ÷ Magnification M = 48,000 ÷ 400 = 120 μm.',
      syllabusRef: 'B2.2'
    },
    {
      id: 'lib-b2-3',
      subject: 'biology',
      topicCode: 'B2',
      question: 'How is the structure of a red blood cell adapted to its primary physiological function?',
      options: [
        'Biconcave disc shape gives a large surface area-to-volume ratio, and lack of a nucleus provides more space for haemoglobin',
        'Thick cellulose cell wall prevents bursting under high blood pressure',
        'Long axon coated in a myelin sheath accelerates electrical impulses',
        'Numerous cilia beat rhythmically to sweep mucus along the lumen'
      ],
      correctIndex: 0,
      explanation: 'Red blood cells have a biconcave disc shape to maximise surface area for rapid oxygen diffusion and no nucleus to carry maximum haemoglobin.',
      syllabusRef: 'B2.2'
    },
    {
      id: 'lib-b2-4',
      subject: 'biology',
      topicCode: 'B2',
      question: 'Which sequence correctly represents increasing levels of biological organisation in a multicellular organism?',
      options: [
        'Heart muscle cell → Cardiac muscle tissue → Heart → Circulatory system',
        'Circulatory system → Heart → Cardiac muscle tissue → Heart muscle cell',
        'Heart muscle cell → Heart → Cardiac muscle tissue → Circulatory system',
        'Cardiac muscle tissue → Heart muscle cell → Circulatory system → Heart'
      ],
      correctIndex: 0,
      explanation: 'Organelles → Cells → Tissues (group of similar cells performing a function) → Organs (group of tissues) → Organ systems → Organism.',
      syllabusRef: 'B2.1'
    }
  ],

  // B3 Movement in & out of Cells
  'B3': [
    {
      id: 'lib-b3-1',
      subject: 'biology',
      topicCode: 'B3',
      question: 'A cylinder of fresh potato is placed in a concentrated sucrose solution (lower water potential than potato sap). After 2 hours, what changes in mass and texture occur?',
      options: [
        'Mass decreases and the cylinder becomes limp and flaccid because water moved out by osmosis',
        'Mass increases and the cylinder becomes firm and turgid because sucrose entered by diffusion',
        'Mass remains unchanged because plant cell walls prevent any movement of water',
        'Mass increases because water moves into the potato cells down a water potential gradient'
      ],
      correctIndex: 0,
      explanation: 'The concentrated sucrose solution has a lower water potential than the potato cell sap. Water moves OUT of the cells by osmosis down the water potential gradient, causing mass loss and flaccidity.',
      syllabusRef: 'B3.2'
    },
    {
      id: 'lib-b3-2',
      subject: 'biology',
      topicCode: 'B3',
      question: 'Why do human red blood cells burst (lyse) when placed in pure distilled water, whereas plant cells do not?',
      options: [
        'Plant cells have a rigid cellulose cell wall that resists internal turgor pressure; animal cells have only a flexible cell membrane',
        'Plant cells have a partially permeable membrane that prevents water entering',
        'Animal cell membranes actively pump water inwards against the concentration gradient',
        'Distilled water dissolves the animal cell membrane but strengthens the plant cuticle'
      ],
      correctIndex: 0,
      explanation: 'Water enters both cells by osmosis. Animal cells lack a cell wall and burst when swelling; plant cells develop turgor pressure against their cellulose cell wall and become turgid without bursting.',
      syllabusRef: 'B3.2'
    },
    {
      id: 'lib-b3-3',
      subject: 'biology',
      topicCode: 'B3',
      question: 'How does active transport differ fundamentally from simple diffusion in living cells?',
      options: [
        'Active transport moves particles against a concentration gradient using energy released from cellular respiration via protein carriers',
        'Active transport occurs only in dead cells through non-selective pores',
        'Active transport moves only water molecules down a water potential gradient',
        'Active transport does not require carrier proteins or metabolic energy'
      ],
      correctIndex: 0,
      explanation: 'Active transport moves ions or molecules from a region of lower concentration to higher concentration against a gradient, requiring energy (ATP) from respiration and membrane carrier proteins.',
      syllabusRef: 'B3.3'
    }
  ],

  // B4 Biological Molecules
  'B4': [
    {
      id: 'lib-b4-1',
      subject: 'biology',
      topicCode: 'B4',
      question: 'Which reagent, procedure, and positive observation confirms the presence of reducing sugars (such as glucose) in a food sample?',
      options: [
        'Add Benedict\'s solution and heat in a boiling water bath; colour changes from blue to green, yellow, or brick-red precipitate',
        'Add Biuret solution at room temperature; colour changes from pale blue to purple/lilac',
        'Add iodine solution at room temperature; colour changes from yellow-brown to blue-black',
        'Dissolve in ethanol, pour into water; a cloudy white emulsion forms'
      ],
      correctIndex: 0,
      explanation: 'Benedict\'s test requires heating with the reagent. The initial blue colour changes to green, yellow, orange, or brick-red depending on sugar concentration.',
      syllabusRef: 'B4.1'
    },
    {
      id: 'lib-b4-2',
      subject: 'biology',
      topicCode: 'B4',
      question: 'What are the basic sub-unit monomers that make up a protein polymer?',
      options: [
        'Amino acids',
        'Fatty acids and glycerol',
        'Simple sugars (glucose)',
        'Nucleotides'
      ],
      correctIndex: 0,
      explanation: 'Proteins are long chains of amino acids linked by peptide bonds. Carbohydrates are made of simple sugars; lipids are made of glycerol and fatty acids.',
      syllabusRef: 'B4.1'
    },
    {
      id: 'lib-b4-3',
      subject: 'biology',
      topicCode: 'B4',
      question: 'A food scientist conducts an ethanol emulsion test on a cooking oil sample. What is the correct procedure and positive result?',
      options: [
        'Shake the sample with ethanol to dissolve lipids, then pour into water; a milky white emulsion appears',
        'Boil the sample directly in water and add iodine; a yellow-brown solution forms',
        'Add dilute hydrochloric acid and boil; a brick-red precipitate forms',
        'Add sodium hydroxide and copper sulfate; a deep purple colour develops'
      ],
      correctIndex: 0,
      explanation: 'Lipids dissolve in ethanol but are insoluble in water. When poured into water, tiny lipid droplets precipitate, creating a cloudy white emulsion.',
      syllabusRef: 'B4.1'
    }
  ],

  // B5 Enzymes
  'B5': [
    {
      id: 'lib-b5-1',
      subject: 'biology',
      topicCode: 'B5',
      question: 'Why does the rate of an enzyme-catalysed reaction decrease to zero when the temperature is raised significantly above the optimum (e.g. above 60 °C)?',
      options: [
        'Excess thermal kinetic energy breaks bonds maintaining the enzyme\'s active site shape; substrate can no longer bind (denaturation)',
        'Substrate molecules are permanently destroyed by the high temperature',
        'Enzyme molecules collide with each other and are converted into product molecules',
        'The activation energy of the reaction increases until collisions cease entirely'
      ],
      correctIndex: 0,
      explanation: 'High temperatures break hydrogen and ionic bonds in the enzyme protein, irreversibly altering the 3D tertiary structure of the active site so substrates cannot fit (denaturation).',
      syllabusRef: 'B5.1'
    },
    {
      id: 'lib-b5-2',
      subject: 'biology',
      topicCode: 'B5',
      question: 'How do enzymes accelerate chemical reactions in biological systems?',
      options: [
        'They act as biological catalysts that lower the activation energy required for the reaction without being consumed',
        'They increase the total thermal energy of the system by releasing heat',
        'They alter the chemical equilibrium so only forward reactions occur',
        'They permanently bind to products to prevent the reverse reaction from taking place'
      ],
      correctIndex: 0,
      explanation: 'Enzymes are protein catalysts that lower activation energy, speeding up metabolic reactions without undergoing permanent chemical change themselves.',
      syllabusRef: 'B5.1'
    },
    {
      id: 'lib-b5-3',
      subject: 'biology',
      topicCode: 'B5',
      question: 'In an experiment investigating salivary amylase activity at different pH values, what is the dependent variable measured?',
      options: [
        'The time taken for starch to disappear, measured by testing samples with iodine solution',
        'The pH buffer solution added to each test tube',
        'The temperature maintained by the thermostatic water bath',
        'The concentration of amylase solution dispensed into each tube'
      ],
      correctIndex: 0,
      explanation: 'The independent variable is pH (varied by the experimenter). The dependent variable is reaction rate / time for starch digestion (tested using iodine on a spotting tile).',
      syllabusRef: 'B5.1'
    }
  ],

  // B6 Plant Nutrition
  'B6': [
    {
      id: 'lib-b6-1',
      subject: 'biology',
      topicCode: 'B6',
      question: 'Which balanced chemical equation correctly represents photosynthesis in green plants under Cambridge Extended tier?',
      options: [
        '6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂',
        'C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O',
        '6CO₂ + 12H₂O → C₆H₁₂O₆ + 6O₂ + 6H₂O',
        'CO₂ + H₂O → CH₂O + O₂'
      ],
      correctIndex: 0,
      explanation: 'Photosynthesis uses light energy absorbed by chlorophyll to convert carbon dioxide and water into glucose and oxygen: 6CO2 + 6H2O -> C6H12O6 + 6O2.',
      syllabusRef: 'B6.1'
    },
    {
      id: 'lib-b6-2',
      subject: 'biology',
      topicCode: 'B6',
      question: 'How are palisade mesophyll cells in a dicotyledonous leaf structurally adapted to maximise photosynthesis?',
      options: [
        'They are tightly packed near the upper leaf surface and contain the highest density of chloroplasts',
        'They possess large air spaces to allow rapid diffusion of carbon dioxide to the stomata',
        'They have thick waxy cuticles that reflect excess light into the lower epidermis',
        'They lack nuclei so that sunlight can penetrate directly to the spongy layer'
      ],
      correctIndex: 0,
      explanation: 'Palisade cells are column-shaped and situated directly under the transparent upper epidermis, packed with chloroplasts to intercept maximum sunlight.',
      syllabusRef: 'B6.2'
    },
    {
      id: 'lib-b6-3',
      subject: 'biology',
      topicCode: 'B6',
      question: 'In an experiment using the pondweed Elodea, what observation is used to measure the rate of photosynthesis when light intensity is varied?',
      options: [
        'Counting the number of oxygen gas bubbles released per minute from the cut stem',
        'Measuring the change in water temperature in the beaker',
        'Weighing the pondweed before and after exposure to light',
        'Recording the volume of carbon dioxide absorbed by the lamp'
      ],
      correctIndex: 0,
      explanation: 'The volume of oxygen gas produced or the count of bubbles released per unit time indicates the rate of photosynthesis.',
      syllabusRef: 'B6.1'
    }
  ],

  // B7 Human Nutrition
  'B7': [
    {
      id: 'lib-b7-1',
      subject: 'biology',
      topicCode: 'B7',
      question: 'Which nutritional deficiency condition results from a severe lack of vitamin C in the human diet?',
      options: [
        'Scurvy (bleeding gums and poor wound healing)',
        'Rickets (soft, bent bones in growing children)',
        'Anaemia (reduced oxygen-carrying capacity of blood)',
        'Kwashiorkor (swollen abdomen from protein deficiency)'
      ],
      correctIndex: 0,
      explanation: 'Lack of vitamin C causes scurvy. Lack of vitamin D or calcium causes rickets. Lack of iron causes anaemia.',
      syllabusRef: 'B7.1'
    },
    {
      id: 'lib-b7-2',
      subject: 'biology',
      topicCode: 'B7',
      question: 'What are the two major digestive functions of bile produced by the liver and stored in the gallbladder?',
      options: [
        'Neutralises acidic chyme from the stomach and emulsifies large lipid droplets into small droplets for lipase action',
        'Hydrolyses proteins into amino acids and kills pathogenic bacteria with hydrochloric acid',
        'Absorbs glucose directly into the lacteal of the villi',
        'Converts excess amino acids into urea and breaks down glycogen'
      ],
      correctIndex: 0,
      explanation: 'Bile is alkaline: it neutralises acidic stomach acid creating optimum pH for intestinal enzymes, and emulsifies fats (increasing surface area for lipase).',
      syllabusRef: 'B7.3'
    },
    {
      id: 'lib-b7-3',
      subject: 'biology',
      topicCode: 'B7',
      question: 'Which digestive enzyme is secreted into the stomach to initiate protein breakdown in an acidic environment (pH 1.5–2)?',
      options: [
        'Pepsin (protease)',
        'Amylase',
        'Lipase',
        'Maltase'
      ],
      correctIndex: 0,
      explanation: 'Pepsin is an endopeptidase that hydrolyses proteins in the stomach. It requires the low pH provided by hydrochloric acid for optimum activity.',
      syllabusRef: 'B7.3'
    }
  ],

  // B8 Transport in Plants
  'B8': [
    {
      id: 'lib-b8-1',
      subject: 'biology',
      topicCode: 'B8',
      question: 'What are the two main transport tissues in plants and what substances do they transport?',
      options: [
        'Xylem transports water and dissolved mineral ions upwards; phloem transports sucrose and amino acids upwards and downwards',
        'Xylem transports glucose and oxygen downwards; phloem transports water and starch upwards',
        'Xylem transports mineral ions to the roots; phloem transports water to the stomata',
        'Xylem transports carbon dioxide; phloem transports proteins to chloroplasts'
      ],
      correctIndex: 0,
      explanation: 'Xylem vessels are dead hollow tubes transporting water and minerals from roots to leaves (transpiration stream). Phloem transports sucrose and amino acids (translocation).',
      syllabusRef: 'B8.1'
    },
    {
      id: 'lib-b8-2',
      subject: 'biology',
      topicCode: 'B8',
      question: 'Which combination of environmental conditions causes the highest rate of transpiration in a leafy shoot?',
      options: [
        'High temperature, bright sunlight, windy (high air movement), and low humidity',
        'Low temperature, darkness, still air, and high humidity',
        'High humidity, cold conditions, and low light intensity',
        'High humidity, zero air movement, and bright sunlight'
      ],
      correctIndex: 0,
      explanation: 'Transpiration is evaporation of water from leaves. High temperature increases water kinetic energy, wind removes humid boundary layer, bright light opens stomata, and dry air steepens the concentration gradient.',
      syllabusRef: 'B8.3'
    }
  ],

  // B9 Transport in Animals
  'B9': [
    {
      id: 'lib-b9-1',
      subject: 'biology',
      topicCode: 'B9',
      question: 'Why is the muscular wall of the left ventricle significantly thicker than that of the right ventricle in the mammalian heart?',
      options: [
        'The left ventricle must generate higher pressure to pump blood through the systemic circulation around the entire body',
        'The left ventricle pumps deoxygenated blood to the lungs under high resistance',
        'The left ventricle receives blood directly from the vena cava at high pressure',
        'The left ventricle contains more valves that require extra muscular support'
      ],
      correctIndex: 0,
      explanation: 'The right ventricle only pumps blood to the nearby lungs (pulmonary loop). The left ventricle pumps oxygenated blood through the aorta to all body organs against higher peripheral resistance.',
      syllabusRef: 'B9.2'
    },
    {
      id: 'lib-b9-2',
      subject: 'biology',
      topicCode: 'B9',
      question: 'How do veins differ structurally from arteries, and what is the function of the valves in veins?',
      options: [
        'Veins have thinner muscular walls, wider lumens, and valves to prevent backflow of blood under low pressure',
        'Veins have thicker elastic walls and narrower lumens to maintain pulsating high blood pressure',
        'Veins lack lumens and transport blood via capillary action',
        'Veins contain valves to accelerate blood flow as it approaches the lungs'
      ],
      correctIndex: 0,
      explanation: 'Arteries carry blood under high pulsating pressure (thick muscle/elastic walls). Veins carry blood under low pressure back to the heart, featuring wide lumens and semilunar valves to stop backflow.',
      syllabusRef: 'B9.3'
    },
    {
      id: 'lib-b9-3',
      subject: 'biology',
      topicCode: 'B9',
      question: 'Which blood vessels carry oxygenated blood?',
      options: [
        'Aorta and pulmonary veins',
        'Vena cava and pulmonary arteries',
        'Pulmonary arteries and coronary veins',
        'Hepatic portal vein and renal veins'
      ],
      correctIndex: 0,
      explanation: 'The pulmonary veins carry oxygenated blood from the lungs to the left atrium. The aorta carries oxygenated blood from the left ventricle to the body. Pulmonary artery carries deoxygenated blood.',
      syllabusRef: 'B9.2'
    }
  ],

  // B10 Diseases & Immunity
  'B10': [
    {
      id: 'lib-b10-1',
      subject: 'biology',
      topicCode: 'B10',
      question: 'How do lymphocytes and phagocytes cooperate to protect the human body against pathogenic infections?',
      options: [
        'Lymphocytes produce specific antibodies that bind to pathogen antigens; phagocytes engulf and digest pathogens by phagocytosis',
        'Phagocytes produce memory cells while lymphocytes inject hydrochloric acid into bacteria',
        'Lymphocytes dissolve the pathogens\' cell walls directly; phagocytes neutralise toxins with bile',
        'Both cell types secrete mucus to physically trap bacteria in the stomach'
      ],
      correctIndex: 0,
      explanation: 'Lymphocytes recognize foreign antigens and secrete matching antibodies (and form memory cells). Phagocytes ingest pathogens via phagocytosis and hydrolyse them with enzymes.',
      syllabusRef: 'B10.1'
    },
    {
      id: 'lib-b10-2',
      subject: 'biology',
      topicCode: 'B10',
      question: 'How does vaccination stimulate active immunity against a specific viral or bacterial disease?',
      options: [
        'It introduces harmless, weakened, or dead antigens that stimulate lymphocytes to produce antibodies and long-lived memory cells',
        'It introduces active antibiotics that destroy all viruses in the bloodstream',
        'It coats red blood cells with a protective barrier against pathogen attachment',
        'It temporarily raises body core temperature to 45 °C to denature viral proteins'
      ],
      correctIndex: 0,
      explanation: 'Vaccines expose the immune system to pathogen antigens without causing disease, producing memory cells for a rapid, high-concentration secondary antibody response upon real infection.',
      syllabusRef: 'B10.1'
    }
  ],

  // B11 Gas Exchange in Humans
  'B11': [
    {
      id: 'lib-b11-1',
      subject: 'biology',
      topicCode: 'B11',
      question: 'Which features of alveoli in human lungs adapt them for rapid and efficient gas exchange?',
      options: [
        'Large total surface area, one-cell-thick walls for short diffusion distance, moist lining, and extensive capillary network',
        'Thick muscular walls to pump air actively into red blood cells',
        'Dry inner surface and small surface area to prevent moisture loss',
        'Ciliated lining that sweeps oxygen gas molecules directly into the pulmonary vein'
      ],
      correctIndex: 0,
      explanation: 'Alveoli have millions of tiny sacs (huge surface area), thin squamous epithelium (short diffusion pathway), moist lining (gases dissolve), and dense capillary blood flow (steep concentration gradient).',
      syllabusRef: 'B11.1'
    },
    {
      id: 'lib-b11-2',
      subject: 'biology',
      topicCode: 'B11',
      question: 'What muscular movements occur during inspiration (breathing in) in humans?',
      options: [
        'External intercostal muscles contract (pulling ribs up and out) and diaphragm contracts and flattens; thoracic volume increases and pressure decreases',
        'Diaphragm relaxes and domes upwards; thoracic volume decreases and pressure increases',
        'Internal intercostal muscles contract pulling ribs down and in; thoracic volume drops',
        'Both diaphragm and intercostal muscles relax simultaneously to pull air in'
      ],
      correctIndex: 0,
      explanation: 'During inhalation: external intercostals contract (ribs move up and out) and diaphragm contracts (flattens). Thorax volume expands, reducing internal pressure below atmospheric pressure so air rushes in.',
      syllabusRef: 'B11.1'
    }
  ],

  // B12 Respiration
  'B12': [
    {
      id: 'lib-b12-1',
      subject: 'biology',
      topicCode: 'B12',
      question: 'What are the products of anaerobic respiration in human muscle cells during vigorous exercise, and what biological debt is created?',
      options: [
        'Lactic acid is produced; creates an oxygen debt that requires continued rapid breathing after exercise',
        'Ethanol and carbon dioxide are produced; creates an alcohol debt',
        'Water and carbon dioxide are produced with maximum ATP release',
        'Glucose and oxygen are produced to replenish glycogen stores'
      ],
      correctIndex: 0,
      explanation: 'In human muscles: Glucose -> Lactic acid. Lactic acid causes muscle fatigue and cramps; post-exercise oxygen is needed to transport it to the liver and break it down aerobically (oxygen debt).',
      syllabusRef: 'B12.1'
    },
    {
      id: 'lib-b12-2',
      subject: 'biology',
      topicCode: 'B12',
      question: 'Which chemical equation describes anaerobic respiration in yeast during brewing or breadmaking (alcoholic fermentation)?',
      options: [
        'Glucose → Ethanol + Carbon dioxide',
        'Glucose → Lactic acid + Energy',
        'Glucose + Oxygen → Carbon dioxide + Water',
        'Ethanol + Carbon dioxide → Glucose + Water'
      ],
      correctIndex: 0,
      explanation: 'In yeast: C6H12O6 -> 2C2H5OH + 2CO2. Carbon dioxide causes bread dough to rise; ethanol is the alcohol in brewing.',
      syllabusRef: 'B12.1'
    }
  ],

  // B13 Coordination & Response
  'B13': [
    {
      id: 'lib-b13-1',
      subject: 'biology',
      topicCode: 'B13',
      question: 'What is the correct pathway of an electrical impulse in a simple reflex arc (e.g. withdrawing hand from hot pan)?',
      options: [
        'Stimulus → Receptor → Sensory neurone → Relay neurone in spinal cord → Motor neurone → Effector (muscle) → Response',
        'Receptor → Motor neurone → Brain → Sensory neurone → Effector',
        'Stimulus → Effector → Relay neurone → Sensory neurone → Brain',
        'Effector → Motor neurone → Relay neurone → Receptor → Response'
      ],
      correctIndex: 0,
      explanation: 'Reflex arcs are involuntary and rapid: Receptor detects stimulus -> Sensory neurone -> Relay neurone in CNS -> Motor neurone -> Effector muscle/gland.',
      syllabusRef: 'B13.1'
    },
    {
      id: 'lib-b13-2',
      subject: 'biology',
      topicCode: 'B13',
      question: 'What physiological effects are triggered by the release of adrenaline from the adrenal glands into the bloodstream?',
      options: [
        'Increased heart rate, increased breathing rate, dilated pupils, and conversion of liver glycogen to glucose for muscles',
        'Decreased heart rate, constricted bronchioles, and accelerated digestion',
        'Decreased blood glucose concentration and constriction of skeletal muscle arterioles',
        'Immediate stimulation of sleep cycles and reduced metabolic rate'
      ],
      correctIndex: 0,
      explanation: 'Adrenaline prepares the body for "fight or flight": boosts cardiac output, widens airways, diverts blood to skeletal muscles, and elevates blood glucose.',
      syllabusRef: 'B13.1'
    }
  ],

  // B14 Reproduction
  'B14': [
    {
      id: 'lib-b14-1',
      subject: 'biology',
      topicCode: 'B14',
      question: 'In the human female reproductive system, where does fertilisation of the ovum by a sperm cell normally occur?',
      options: [
        'In the oviduct (Fallopian tube)',
        'In the uterus (womb)',
        'In the ovary',
        'In the cervix'
      ],
      correctIndex: 0,
      explanation: 'Fertilisation occurs in the upper third of the oviduct. The resulting zygote divides to form an embryo which travels to implant in the endometrium of the uterus.',
      syllabusRef: 'B14.1'
    },
    {
      id: 'lib-b14-2',
      subject: 'biology',
      topicCode: 'B14',
      question: 'How do the floral adaptations of wind-pollinated flowers differ from insect-pollinated flowers?',
      options: [
        'Wind-pollinated flowers have small dull petals, no nectar, and feathery stigmas and stamens hanging outside the flower',
        'Wind-pollinated flowers have large colourful petals, sweet nectar, and sticky enclosed stigmas',
        'Wind-pollinated flowers produce small numbers of heavy, spiky pollen grains',
        'Wind-pollinated flowers rely on scented guide lines to attract bees'
      ],
      correctIndex: 0,
      explanation: 'Wind pollination features exposed pendulous anthers releasing vast quantities of light smooth pollen, and large feathery stigmas to trap airborne pollen.',
      syllabusRef: 'B14.2'
    }
  ],

  // B15 Organisms & Environment
  'B15': [
    {
      id: 'lib-b15-1',
      subject: 'biology',
      topicCode: 'B15',
      question: 'In a food web, why does available energy decrease significantly from one trophic level to the next (only ~10% transferred)?',
      options: [
        'Energy is lost as metabolic heat during respiration, excretion of waste products, and uneaten or undigested body parts',
        'Higher trophic organisms deliberately destroy energy to maintain population balance',
        'Carnivores have smaller digestive tracts that cannot absorb chemical energy',
        'Photosynthesis ceases to supply energy once herbivores are consumed'
      ],
      correctIndex: 0,
      explanation: 'Most ingested energy is used in cellular respiration (lost as heat), movement, or excreted in faeces/urine; only ~10% is incorporated into new biomass for the next consumer.',
      syllabusRef: 'B15.1'
    },
    {
      id: 'lib-b15-2',
      subject: 'biology',
      topicCode: 'B15',
      question: 'Which biological process removes carbon dioxide from the atmosphere in the global carbon cycle?',
      options: [
        'Photosynthesis by green plants and phytoplankton',
        'Aerobic respiration by decomposers and animals',
        'Combustion of fossil fuels in power stations',
        'Volcanic outgassing and decomposition'
      ],
      correctIndex: 0,
      explanation: 'Photosynthesis is the only biological process that takes carbon dioxide out of the atmosphere to synthesize organic compounds (glucose, starch).',
      syllabusRef: 'B15.2'
    }
  ],

  // B16 Human Influences on Ecosystems
  'B16': [
    {
      id: 'lib-b16-1',
      subject: 'biology',
      topicCode: 'B16',
      question: 'What ecological crisis is caused when excessive nitrate fertilisers leach from agricultural fields into freshwater lakes (eutrophication)?',
      options: [
        'Algal bloom blocks sunlight → submerged plants die → decomposer bacteria multiply and consume dissolved oxygen → fish die of suffocation',
        'Nitrates acidify water directly, dissolving fish scales on contact',
        'Water becomes toxic to plants, causing all algae to vanish immediately',
        'Aquatic plants produce toxic methane gas that suffocates water birds'
      ],
      correctIndex: 0,
      explanation: 'Eutrophication sequence: fertiliser runoff -> rapid algae growth -> light blocked -> benthic plants die -> aerobic bacteria decompose dead biomass consuming oxygen -> severe hypoxia kills aquatic fauna.',
      syllabusRef: 'B16.1'
    },
    {
      id: 'lib-b16-2',
      subject: 'biology',
      topicCode: 'B16',
      question: 'Which two gases are the primary greenhouse gases whose increased atmospheric concentrations contribute to enhanced global warming?',
      options: [
        'Carbon dioxide and methane',
        'Oxygen and nitrogen',
        'Sulfur dioxide and carbon monoxide',
        'Argon and helium'
      ],
      correctIndex: 0,
      explanation: 'Carbon dioxide (from fossil fuel combustion and deforestation) and methane (from livestock and rice paddy decomposition) trap outgoing infrared radiation.',
      syllabusRef: 'B16.1'
    }
  ],

  // ==========================================
  // CHEMISTRY TOPICS (C1 - C12)
  // ==========================================

  // C1 States of Matter
  'C1': [
    {
      id: 'lib-c1-1',
      subject: 'chemistry',
      topicCode: 'C1',
      question: 'According to kinetic particle theory, what happens to the particles of a substance during melting?',
      options: [
        'Particles gain kinetic energy, vibrate faster, overcome strong attractive forces, and slide over each other in an irregular arrangement',
        'Particles expand in individual volume until they turn into gas bubbles',
        'Chemical bonds within molecules are destroyed to form isolated free atoms',
        'Particles lose all kinetic energy and freeze in place'
      ],
      correctIndex: 0,
      explanation: 'Melting is a physical state change: particles gain kinetic energy, overcome fixed lattice positions, and move into liquid arrangement with random close packing.',
      syllabusRef: 'C1.1'
    },
    {
      id: 'lib-c1-2',
      subject: 'chemistry',
      topicCode: 'C1',
      question: 'A crystal of purple potassium manganate(VII) is placed at the bottom of a beaker of still water. Over several hours, the entire liquid turns uniformly purple without stirring. Which process explains this observation?',
      options: [
        'Diffusion: particles dissolve and move randomly from high concentration to low concentration',
        'Osmosis: water molecules move into the potassium crystal under hydrostatic pressure',
        'Thermal convection: heating creates rapid circular fluid currents',
        'Filtration: water molecules separate potassium ions mechanically'
      ],
      correctIndex: 0,
      explanation: 'Diffusion is the net movement of particles from a region of higher concentration to lower concentration as a result of their random motion.',
      syllabusRef: 'C1.1'
    }
  ],

  // C2 Atoms, Elements & Compounds
  'C2': [
    {
      id: 'lib-c2-1',
      subject: 'chemistry',
      topicCode: 'C2',
      question: 'An atom of chlorine has a proton number (atomic number) of 17 and a nucleon number (mass number) of 35. How many protons, neutrons, and electrons are present in a neutral chlorine atom?',
      options: [
        '17 protons, 18 neutrons, 17 electrons',
        '17 protons, 35 neutrons, 17 electrons',
        '18 protons, 17 neutrons, 18 electrons',
        '35 protons, 17 neutrons, 35 electrons'
      ],
      correctIndex: 0,
      explanation: 'Proton number = 17 (so 17 protons, 17 electrons in neutral atom). Neutrons = Nucleon number - Proton number = 35 - 17 = 18 neutrons.',
      syllabusRef: 'C2.2'
    },
    {
      id: 'lib-c2-2',
      subject: 'chemistry',
      topicCode: 'C2',
      question: 'Why do ionic compounds such as sodium chloride (NaCl) have high melting and boiling points?',
      options: [
        'Strong electrostatic forces of attraction between oppositely charged ions in a giant ionic lattice require large amounts of energy to overcome',
        'Weak intermolecular forces between separate covalent molecules require little energy',
        'Sodium and chlorine atoms share pairs of electrons in rigid giant covalent networks',
        'Delocalised electrons conduct heat rapidly throughout the metal lattice'
      ],
      correctIndex: 0,
      explanation: 'Giant ionic lattices contain millions of Na+ and Cl- ions held together by strong electrostatic attractions acting in all directions, requiring high temperatures to break.',
      syllabusRef: 'C2.4'
    },
    {
      id: 'lib-c2-3',
      subject: 'chemistry',
      topicCode: 'C2',
      question: 'How is a compound fundamentally different from a mixture?',
      options: [
        'A compound consists of two or more elements chemically bonded in fixed proportions with properties different from its elements; a mixture can be separated by physical methods',
        'A compound can be separated by filtration, whereas a mixture requires electrolysis',
        'A compound contains only one type of atom; a mixture contains multiple types of molecules',
        'A compound has variable boiling points; a mixture has a sharp, fixed boiling point'
      ],
      correctIndex: 0,
      explanation: 'In compounds, elements are chemically combined in fixed ratios and separation requires chemical reactions. Mixtures are physically mixed with variable composition.',
      syllabusRef: 'C2.1'
    }
  ],

  // C3 Stoichiometry & Chemical Equations (Strictly NO Moles in 0653!)
  'C3': [
    {
      id: 'lib-c3-1',
      subject: 'chemistry',
      topicCode: 'C3',
      question: 'In a thermal decomposition experiment, 12.4 g of green copper(II) carbonate is heated completely. 8.0 g of black copper(II) oxide solid remains in the crucible. According to the Law of Conservation of Mass, what mass of carbon dioxide gas escaped?',
      options: [
        '4.4 g',
        '20.4 g',
        '8.0 g',
        '12.4 g'
      ],
      correctIndex: 0,
      explanation: 'Law of Conservation of Mass: Mass of reactants = Mass of products. 12.4 g CuCO3 = 8.0 g CuO + mass of CO2. Therefore mass of CO2 = 12.4 - 8.0 = 4.4 g.',
      syllabusRef: 'C3.1'
    },
    {
      id: 'lib-c3-2',
      subject: 'chemistry',
      topicCode: 'C3',
      question: 'Which balanced chemical equation correctly includes state symbols for the reaction between aqueous calcium hydroxide (limewater) and carbon dioxide gas forming a calcium carbonate precipitate?',
      options: [
        'Ca(OH)₂(aq) + CO₂(g) → CaCO₃(s) + H₂O(l)',
        'Ca(OH)₂(s) + CO₂(aq) → CaCO₃(aq) + H₂O(g)',
        'CaO(s) + CO₂(g) → CaCO₃(s)',
        'CaOH(aq) + CO₂(g) → CaCO₂(s) + H₂O(l)'
      ],
      correctIndex: 0,
      explanation: 'Limewater is Ca(OH)2(aq), carbon dioxide is CO2(g), white milky precipitate is CaCO3(s), and water is H2O(l).',
      syllabusRef: 'C3.1'
    },
    {
      id: 'lib-c3-3',
      subject: 'chemistry',
      topicCode: 'C3',
      question: 'Calculate the relative formula mass (Mr) of calcium nitrate, Ca(NO₃)₂. (Relative atomic masses: Ca = 40, N = 14, O = 16)',
      options: [
        '164',
        '102',
        '150',
        '204'
      ],
      correctIndex: 0,
      explanation: 'Mr = 40 + 2 × [14 + (3 × 16)] = 40 + 2 × [14 + 48] = 40 + 2 × 62 = 40 + 124 = 164.',
      syllabusRef: 'C3.1'
    }
  ],

  // C4 Electrochemistry & Electrolysis
  'C4': [
    {
      id: 'lib-c4-1',
      subject: 'chemistry',
      topicCode: 'C4',
      question: 'During the electrolysis of molten lead(II) bromide using inert graphite electrodes, what products are formed at the cathode (negative electrode) and anode (positive electrode)?',
      options: [
        'Cathode: shiny grey lead metal; Anode: reddish-brown bromine gas',
        'Cathode: brown bromine gas; Anode: grey lead metal',
        'Cathode: hydrogen gas; Anode: oxygen gas',
        'Cathode: lead bromide solution; Anode: carbon dioxide gas'
      ],
      correctIndex: 0,
      explanation: 'Positive Pb2+ ions are attracted to the negative cathode and gain electrons (reduction: Pb2+ + 2e- -> Pb). Negative Br- ions migrate to the anode and lose electrons (oxidation: 2Br- -> Br2 + 2e-).',
      syllabusRef: 'C4.1'
    },
    {
      id: 'lib-c4-2',
      subject: 'chemistry',
      topicCode: 'C4',
      question: 'Why must solid ionic compounds be molten or dissolved in water to undergo electrolysis?',
      options: [
        'In solid state, ions are locked in fixed lattice positions and cannot move; when molten or aqueous, ions are mobile and carry electrical charge',
        'Solid ionic compounds do not contain any electrons',
        'Water reacts chemically with electrodes to produce voltage',
        'Heating solid salts transforms ionic bonds into metallic bonds'
      ],
      correctIndex: 0,
      explanation: 'Electrolysis requires mobile ions to carry electric current through the electrolyte. In solids, ions are held rigid by electrostatic forces.',
      syllabusRef: 'C4.1'
    }
  ],

  // C5 Chemical Energetics
  'C5': [
    {
      id: 'lib-c5-1',
      subject: 'chemistry',
      topicCode: 'C5',
      question: 'Which statement accurately describes an exothermic chemical reaction?',
      options: [
        'Thermal energy is transferred to the surroundings, temperature of the surroundings rises, and overall energy change ΔH is negative',
        'Thermal energy is absorbed from the surroundings, temperature drops, and ΔH is positive',
        'Bond breaking releases more energy than bond making consumes',
        'The products have higher chemical potential energy than the reactants'
      ],
      correctIndex: 0,
      explanation: 'In exothermic reactions, energy released during product bond making exceeds energy needed for reactant bond breaking. Heat is released, raising temperature (ΔH is negative).',
      syllabusRef: 'C5.1'
    },
    {
      id: 'lib-c5-2',
      subject: 'chemistry',
      topicCode: 'C5',
      question: 'In an energy level pathway diagram for an endothermic reaction, how are the reactant and product energy levels positioned relative to each other?',
      options: [
        'Products are at a higher energy level than reactants, and activation energy arrow points upwards from reactants',
        'Products are at a lower energy level than reactants, and ΔH arrow points downwards',
        'Reactants and products are at the identical horizontal energy level',
        'Activation energy is zero because heat is absorbed spontaneously'
      ],
      correctIndex: 0,
      explanation: 'In endothermic reactions, energy is absorbed from the surroundings, so products have higher energy than reactants (ΔH is positive).',
      syllabusRef: 'C5.1'
    }
  ],

  // C6 Chemical Reactions & Rates
  'C6': [
    {
      id: 'lib-c6-1',
      subject: 'chemistry',
      topicCode: 'C6',
      question: 'Using collision theory, why does increasing the temperature of reacting solutions increase the rate of reaction?',
      options: [
        'Particles gain kinetic energy, move faster, collide more frequently, and a far greater proportion of collisions possess the activation energy',
        'Particles increase in size, increasing the collision area without changing energy',
        'Temperature acts as a chemical catalyst by providing an alternative reaction pathway',
        'Higher temperature increases the concentration of reactants in the mixture'
      ],
      correctIndex: 0,
      explanation: 'Higher temperature increases particle kinetic energy: particles collide more often, and critically, a much higher fraction of collisions exceed the activation energy threshold.',
      syllabusRef: 'C6.1'
    },
    {
      id: 'lib-c6-2',
      subject: 'chemistry',
      topicCode: 'C6',
      question: 'A student investigates the reaction between marble chips (calcium carbonate) and dilute hydrochloric acid. Which change would increase the initial rate of reaction while producing the exact same total volume of carbon dioxide gas?',
      options: [
        'Crushing the marble chips into a fine powder (same total mass)',
        'Decreasing the concentration of hydrochloric acid',
        'Lowering the temperature of the acid to 10 °C',
        'Doubling the mass of calcium carbonate used'
      ],
      correctIndex: 0,
      explanation: 'Powdered marble has a much larger surface area, increasing collision frequency and initial rate. Because the total mass is identical, the final volume of CO2 gas is unchanged.',
      syllabusRef: 'C6.1'
    }
  ],

  // C7 Acids, Bases & Salts
  'C7': [
    {
      id: 'lib-c7-1',
      subject: 'chemistry',
      topicCode: 'C7',
      question: 'What are the products formed when dilute sulfuric acid reacts with copper(II) carbonate solid?',
      options: [
        'Copper(II) sulfate, water, and carbon dioxide',
        'Copper(II) sulfate and hydrogen gas only',
        'Copper(II) chloride, water, and oxygen',
        'Copper(II) oxide and sulfur dioxide'
      ],
      correctIndex: 0,
      explanation: 'General rule: Acid + Metal Carbonate -> Salt + Water + Carbon Dioxide. Sulfuric acid gives sulfate salt: H2SO4 + CuCO3 -> CuSO4 + H2O + CO2.',
      syllabusRef: 'C7.1'
    },
    {
      id: 'lib-c7-2',
      subject: 'chemistry',
      topicCode: 'C7',
      question: 'In the laboratory preparation of pure dry crystals of copper(II) sulfate from insoluble copper(II) oxide and dilute sulfuric acid, why is the oxide added in excess?',
      options: [
        'To ensure all sulfuric acid is completely neutralised so the resulting salt solution is neutral',
        'To act as a catalyst for the crystallisation process',
        'Because unreacted acid evaporates leaving pure crystals',
        'To prevent the solution from turning blue during heating'
      ],
      correctIndex: 0,
      explanation: 'Excess insoluble base ensures 100% of the acid is reacted. The remaining solid excess base is easily removed by simple filtration, leaving pure aqueous CuSO4.',
      syllabusRef: 'C7.2'
    }
  ],

  // C8 The Periodic Table
  'C8': [
    {
      id: 'lib-c8-1',
      subject: 'chemistry',
      topicCode: 'C8',
      question: 'How do the physical and chemical properties of Group I alkali metals (Li, Na, K) change going down the group?',
      options: [
        'Reactivity with water increases, melting points decrease, and density generally increases',
        'Reactivity decreases, hardness increases, and melting points increase',
        'Outer shell electrons are held more strongly by the nucleus going down',
        'They form acidic oxides that dissolve in water to give pH 1'
      ],
      correctIndex: 0,
      explanation: 'Down Group I: outer electron is further from nucleus and shielded by more shells, so it is lost more easily (reactivity increases). Melting points decrease.',
      syllabusRef: 'C8.1'
    },
    {
      id: 'lib-c8-2',
      subject: 'chemistry',
      topicCode: 'C8',
      question: 'Chlorine gas is bubbled into a colourless solution of potassium bromide. What observation confirms a displacement reaction?',
      options: [
        'Solution turns reddish-brown due to the formation of aqueous bromine',
        'A white precipitate of silver chloride forms immediately',
        'Bubbles of hydrogen gas are vigorously evolved',
        'Solution remains colourless because bromine is more reactive than chlorine'
      ],
      correctIndex: 0,
      explanation: 'Chlorine is more reactive than bromine and displaces bromide ions: Cl2 + 2KBr -> 2KCl + Br2. The displaced bromine colours the solution orange/red-brown.',
      syllabusRef: 'C8.2'
    },
    {
      id: 'lib-c8-3',
      subject: 'chemistry',
      topicCode: 'C8',
      question: 'Why are the Group VIII (Group 0) noble gases (He, Ne, Ar, Kr) chemically unreactive (inert)?',
      options: [
        'They already have full outer electron shells (stable electronic configuration), so they do not readily gain, lose, or share electrons',
        'They have zero protons in their atomic nuclei',
        'Their nuclei exert no electrostatic attraction on valence electrons',
        'They exist only as diatomic molecules joined by triple covalent bonds'
      ],
      correctIndex: 0,
      explanation: 'Noble gases have complete outer electron shells (2 for helium, 8 for others), providing exceptional chemical stability without needing to form bonds.',
      syllabusRef: 'C8.3'
    }
  ],

  // C9 Metals & Reactivity Series
  'C9': [
    {
      id: 'lib-c9-1',
      subject: 'chemistry',
      topicCode: 'C9',
      question: 'In the industrial extraction of iron in a blast furnace, what is the chemical role of carbon monoxide (CO)?',
      options: [
        'It acts as a reducing agent that reduces iron(III) oxide (haematite) to molten iron: Fe₂O₃ + 3CO → 2Fe + 3CO₂',
        'It acts as an oxidising agent that oxidises limestone into calcium silicate',
        'It burns with oxygen to provide the cooling gas needed to solidify the iron',
        'It neutralises acidic sulfur impurities in the slag layer'
      ],
      correctIndex: 0,
      explanation: 'Carbon monoxide reduces haematite: Fe2O3 + 3CO -> 2Fe + 3CO2. Iron(III) oxide loses oxygen (is reduced); CO gains oxygen (is oxidised).',
      syllabusRef: 'C9.2'
    },
    {
      id: 'lib-c9-2',
      subject: 'chemistry',
      topicCode: 'C9',
      question: 'Why are alloys (such as steel or brass) harder and stronger than pure metals?',
      options: [
        'Different sized atoms of the alloying element disrupt the regular metal lattice, preventing layers of atoms from sliding easily over one another',
        'Alloys contain no free delocalised electrons',
        'Alloying converts metallic bonding into giant ionic lattices',
        'Alloys have lower densities that repel mechanical impact'
      ],
      correctIndex: 0,
      explanation: 'Pure metals have regular layers that slide easily (malleable). In alloys, different sized atoms disrupt this regular lattice, pinning the layers against sliding under force.',
      syllabusRef: 'C9.3'
    }
  ],

  // C10 Chemistry of the Environment
  'C10': [
    {
      id: 'lib-c10-1',
      subject: 'chemistry',
      topicCode: 'C10',
      question: 'What is the approximate composition of clean, dry air according to the Cambridge syllabus?',
      options: [
        '78% nitrogen, 21% oxygen, ~0.9% argon, ~0.04% carbon dioxide',
        '50% nitrogen, 50% oxygen',
        '78% oxygen, 21% nitrogen, 1% carbon dioxide',
        '70% carbon dioxide, 20% oxygen, 10% nitrogen'
      ],
      correctIndex: 0,
      explanation: 'Clean dry air is approximately 78% N2, 21% O2, with remaining 1% consisting of argon, noble gases, water vapour, and ~0.04% CO2.',
      syllabusRef: 'C10.1'
    },
    {
      id: 'lib-c10-2',
      subject: 'chemistry',
      topicCode: 'C10',
      question: 'Why is carbon monoxide (CO) considered a dangerous, toxic atmospheric pollutant?',
      options: [
        'It binds irreversibly to haemoglobin in red blood cells, preventing normal oxygen transport to vital organs',
        'It dissolves in cloud droplets to form concentrated sulfuric acid rain',
        'It depletes the stratospheric ozone layer over polar regions',
        'It causes rapid eutrophication in freshwater lakes and rivers'
      ],
      correctIndex: 0,
      explanation: 'Carbon monoxide forms carboxyhaemoglobin with higher affinity than oxygen, depriving the brain and heart of essential oxygen (toxic asphyxiant).',
      syllabusRef: 'C10.1'
    }
  ],

  // C11 Organic Chemistry
  'C11': [
    {
      id: 'lib-c11-1',
      subject: 'chemistry',
      topicCode: 'C11',
      question: 'What chemical test and observation distinguishes an unsaturated hydrocarbon (alkene, e.g. ethene) from a saturated hydrocarbon (alkane, e.g. ethane)?',
      options: [
        'Add aqueous bromine (bromine water); alkene decolourises bromine water from orange-brown to colourless rapidly',
        'Add acidified potassium manganate(VII); alkane turns the solution deep purple',
        'Add limewater; alkene turns limewater milky without combustion',
        'Ignite with a splint; only alkenes burn with a completely soot-free blue flame'
      ],
      correctIndex: 0,
      explanation: 'Bromine water test: Alkenes undergo addition reaction across the double bond C=C, rapidly decolourising orange bromine water. Alkanes show no reaction without UV light.',
      syllabusRef: 'C11.3'
    },
    {
      id: 'lib-c11-2',
      subject: 'chemistry',
      topicCode: 'C11',
      question: 'What are the products of complete combustion of a hydrocarbon fuel in excess oxygen?',
      options: [
        'Carbon dioxide and water only',
        'Carbon monoxide and hydrogen gas',
        'Carbon soot and water vapour',
        'Methane and oxygen'
      ],
      correctIndex: 0,
      explanation: 'Hydrocarbon + excess O2 -> CO2 + H2O. Incomplete combustion in limited oxygen produces toxic CO and carbon particulates (soot).',
      syllabusRef: 'C11.2'
    }
  ],

  // C12 Experimental Techniques & Analysis
  'C12': [
    {
      id: 'lib-c12-1',
      subject: 'chemistry',
      topicCode: 'C12',
      question: 'Which chemical reagent and observation confirms the presence of chloride ions (Cl⁻) in an aqueous solution?',
      options: [
        'Acidify with dilute nitric acid, then add aqueous silver nitrate; a white precipitate forms that dissolves in dilute ammonia',
        'Add aqueous sodium hydroxide; a light blue gelatinous precipitate forms',
        'Acidify with dilute hydrochloric acid, then add aqueous barium nitrate; a white precipitate forms',
        'Dip a nichrome wire and place in a flame; a lilac flame appears'
      ],
      correctIndex: 0,
      explanation: 'Halide test: Acidify with HNO3 to remove carbonates, then add AgNO3. Chloride forms white AgCl precipitate; bromide forms cream AgBr; iodide forms yellow AgI.',
      syllabusRef: 'C12.4'
    },
    {
      id: 'lib-c12-2',
      subject: 'chemistry',
      topicCode: 'C12',
      question: 'In paper chromatography, how is the retention factor (Rf value) of a separated dye calculated?',
      options: [
        'Distance travelled by substance ÷ Distance travelled by solvent front',
        'Distance travelled by solvent front ÷ Distance travelled by substance',
        'Total length of chromatography paper × Spot diameter',
        'Mass of dye extracted ÷ Volume of solvent placed in beaker'
      ],
      correctIndex: 0,
      explanation: 'Rf = (Distance moved by dye spot) / (Distance moved by solvent front). The value is always between 0 and 1.',
      syllabusRef: 'C12.1'
    },
    {
      id: 'lib-c12-3',
      subject: 'chemistry',
      topicCode: 'C12',
      question: 'What gas test and observation identifies hydrogen gas (H₂)?',
      options: [
        'Hold a lighted wooden splint near the mouth of the tube; a squeaky "pop" sound is heard',
        'Insert a glowing splint into the gas; the splint relights',
        'Bubble through aqueous calcium hydroxide (limewater); solution turns cloudy/milky',
        'Hold damp red litmus paper in the gas; paper turns blue'
      ],
      correctIndex: 0,
      explanation: 'Hydrogen burns rapidly with oxygen in air: 2H2 + O2 -> 2H2O with a characteristic squeaky pop sound.',
      syllabusRef: 'C12.4'
    }
  ],

  // ==========================================
  // PHYSICS TOPICS (P1 - P5)
  // ==========================================

  // P1 Motion, Forces & Energy
  'P1': [
    {
      id: 'lib-p1-1',
      subject: 'physics',
      topicCode: 'P1',
      question: 'A cyclist accelerates uniformly from rest to a speed of 12 m/s in 4.0 seconds. What is the acceleration and the total distance travelled?',
      options: [
        'Acceleration = 3.0 m/s²; Distance = 24 m',
        'Acceleration = 48 m/s²; Distance = 48 m',
        'Acceleration = 0.33 m/s²; Distance = 12 m',
        'Acceleration = 3.0 m/s²; Distance = 48 m'
      ],
      correctIndex: 0,
      explanation: 'Acceleration a = (v - u) / t = (12 - 0) / 4 = 3.0 m/s2. Distance = Area under speed-time graph = 1/2 × base × height = 1/2 × 4 × 12 = 24 m.',
      syllabusRef: 'P1.1'
    },
    {
      id: 'lib-p1-2',
      subject: 'physics',
      topicCode: 'P1',
      question: 'A resultant force of 45 N acts on an object of mass 15 kg. What acceleration is produced?',
      options: [
        '3.0 m/s²',
        '0.33 m/s²',
        '675 m/s²',
        '30 m/s²'
      ],
      correctIndex: 0,
      explanation: 'Using Newton\'s second law F = ma: a = F / m = 45 N / 15 kg = 3.0 m/s2.',
      syllabusRef: 'P1.2'
    },
    {
      id: 'lib-p1-3',
      subject: 'physics',
      topicCode: 'P1',
      question: 'An electric motor does 600 J of useful work in 5.0 seconds. If the electrical energy supplied to the motor during this time is 800 J, what is the power output and the efficiency?',
      options: [
        'Power = 120 W; Efficiency = 75%',
        'Power = 160 W; Efficiency = 80%',
        'Power = 3000 W; Efficiency = 133%',
        'Power = 120 W; Efficiency = 25%'
      ],
      correctIndex: 0,
      explanation: 'Power P = Work / time = 600 J / 5 s = 120 W. Efficiency = (Useful energy output / Total energy input) × 100% = (600 / 800) × 100% = 75%.',
      syllabusRef: 'P1.7'
    },
    {
      id: 'lib-p1-4',
      subject: 'physics',
      topicCode: 'P1',
      question: 'A rock of mass 540 g is lowered into a measuring cylinder containing 150 cm³ of water. The water level rises to 210 cm³. What is the density of the rock?',
      options: [
        '9.0 g/cm³',
        '2.57 g/cm³',
        '0.11 g/cm³',
        '32,400 g/cm³'
      ],
      correctIndex: 0,
      explanation: 'Displaced volume V = 210 - 150 = 60 cm3. Density ρ = mass / volume = 540 g / 60 cm3 = 9.0 g/cm3.',
      syllabusRef: 'P1.3'
    }
  ],

  // P2 Thermal Physics
  'P2': [
    {
      id: 'lib-p2-1',
      subject: 'physics',
      topicCode: 'P2',
      question: 'Why are metals significantly better thermal conductors than non-metals and insulators?',
      options: [
        'Metals contain mobile delocalised free electrons that transfer kinetic energy rapidly through the lattice alongside atomic vibrations',
        'Metals have lower density so heat passes through open air pockets',
        'Metals emit gamma rays when warmed',
        'Metals undergo convection within their solid crystalline lattice'
      ],
      correctIndex: 0,
      explanation: 'In non-metals, conduction relies solely on slow lattice vibrations between neighboring atoms. In metals, free electrons diffuse rapidly through the lattice, transferring thermal energy much faster.',
      syllabusRef: 'P2.3.1'
    },
    {
      id: 'lib-p2-2',
      subject: 'physics',
      topicCode: 'P2',
      question: 'Which surface is the best absorber and best emitter of infrared thermal radiation?',
      options: [
        'Dull, matte black surface',
        'Shiny, polished silver surface',
        'Transparent glass surface',
        'Smooth white gloss surface'
      ],
      correctIndex: 0,
      explanation: 'Matte black surfaces are the best absorbers and emitters of thermal radiation. Shiny silver surfaces are good reflectors and poor emitters/absorbers.',
      syllabusRef: 'P2.3.3'
    },
    {
      id: 'lib-p2-3',
      subject: 'physics',
      topicCode: 'P2',
      question: 'Why does the temperature of pure water remain constant at 100 °C during boiling, even though thermal energy continues to be supplied?',
      options: [
        'Thermal energy is used as latent heat to overcome intermolecular attractions between liquid molecules, rather than raising kinetic energy',
        'The thermometer bulb becomes thermally insulated by water vapour bubbles',
        'Boiling destroys thermal energy in accordance with equilibrium constraints',
        'Convection currents transfer heat into the surrounding air instantly'
      ],
      correctIndex: 0,
      explanation: 'Temperature measures average particle kinetic energy. During a phase change, heat supplied is latent heat used to separate particles against intermolecular forces, so temperature remains constant.',
      syllabusRef: 'P2.2.2'
    }
  ],

  // P3 Waves, Light & Sound
  'P3': [
    {
      id: 'lib-p3-1',
      subject: 'physics',
      topicCode: 'P3',
      question: 'A water wave has a frequency of 5.0 Hz and a wavelength of 0.40 m. What is the wave speed?',
      options: [
        '2.0 m/s',
        '12.5 m/s',
        '0.08 m/s',
        '5.4 m/s'
      ],
      correctIndex: 0,
      explanation: 'Using wave equation v = f × λ = 5.0 Hz × 0.40 m = 2.0 m/s.',
      syllabusRef: 'P3.1'
    },
    {
      id: 'lib-p3-2',
      subject: 'physics',
      topicCode: 'P3',
      question: 'A ray of light in air strikes a rectangular glass block at an angle of incidence of 45°. What happens to the ray as it enters the glass?',
      options: [
        'The ray slows down and bends towards the normal because glass has a higher optical density than air',
        'The ray speeds up and bends away from the normal',
        'The ray reflects totally because 45° exceeds the critical angle of air',
        'The ray continues straight through without any change in direction or speed'
      ],
      correctIndex: 0,
      explanation: 'Light travels slower in glass than in air. When entering a more optically dense medium at an angle, light refracts towards the normal (angle of refraction < angle of incidence).',
      syllabusRef: 'P3.2.2'
    },
    {
      id: 'lib-p3-3',
      subject: 'physics',
      topicCode: 'P3',
      question: 'Which list correctly orders electromagnetic waves from lowest frequency (longest wavelength) to highest frequency (shortest wavelength)?',
      options: [
        'Radio waves → Microwaves → Infrared → Visible light → Ultraviolet → X-rays → Gamma rays',
        'Gamma rays → X-rays → Ultraviolet → Visible light → Infrared → Microwaves → Radio waves',
        'Visible light → Infrared → Ultraviolet → Radio waves → X-rays → Gamma rays',
        'Radio waves → Infrared → Visible light → Microwaves → Gamma rays → X-rays'
      ],
      correctIndex: 0,
      explanation: 'EM spectrum order by increasing frequency / photon energy: Radio -> Micro -> IR -> Visible (Red to Violet) -> UV -> X-rays -> Gamma rays.',
      syllabusRef: 'P3.3'
    },
    {
      id: 'lib-p3-4',
      subject: 'physics',
      topicCode: 'P3',
      question: 'A ship sounds an echo sounder pulse towards the seabed. The reflected sound echo is detected 0.80 seconds later. If the speed of sound in seawater is 1500 m/s, what is the depth of the seabed?',
      options: [
        '600 m',
        '1200 m',
        '300 m',
        '1875 m'
      ],
      correctIndex: 0,
      explanation: 'The sound travels to the seabed and back (total distance = 2 × depth). Distance = speed × time = 1500 × 0.80 = 1200 m. Depth = 1200 / 2 = 600 m.',
      syllabusRef: 'P3.4'
    }
  ],

  // P4 Electricity & Magnetism
  'P4': [
    {
      id: 'lib-p4-1',
      subject: 'physics',
      topicCode: 'P4',
      question: 'A resistor in a circuit has a potential difference of 12 V across it, and a current of 0.50 A flows through it. What is the resistance and electrical power dissipated?',
      options: [
        'Resistance = 24 Ω; Power = 6.0 W',
        'Resistance = 6.0 Ω; Power = 24 W',
        'Resistance = 0.042 Ω; Power = 12 W',
        'Resistance = 24 Ω; Power = 288 W'
      ],
      correctIndex: 0,
      explanation: 'Ohm\'s Law R = V / I = 12 V / 0.50 A = 24 Ω. Power P = V × I = 12 V × 0.50 A = 6.0 W.',
      syllabusRef: 'P4.2.2'
    },
    {
      id: 'lib-p4-2',
      subject: 'physics',
      topicCode: 'P4',
      question: 'Two identical 10 Ω resistors are connected in parallel across a 6.0 V battery. What is the total combined resistance and the total current drawn from the battery?',
      options: [
        'Total resistance = 5.0 Ω; Total current = 1.2 A',
        'Total resistance = 20 Ω; Total current = 0.30 A',
        'Total resistance = 10 Ω; Total current = 0.60 A',
        'Total resistance = 2.5 Ω; Total current = 2.4 A'
      ],
      correctIndex: 0,
      explanation: 'For parallel resistors: 1/R = 1/R1 + 1/R2 = 1/10 + 1/10 = 2/10 -> R = 5.0 Ω. Total current I = V / R = 6.0 / 5.0 = 1.2 A.',
      syllabusRef: 'P4.2.2'
    },
    {
      id: 'lib-p4-3',
      subject: 'physics',
      topicCode: 'P4',
      question: 'What is the electrical safety role of a fuse in a domestic mains plug?',
      options: [
        'It contains a thin wire that melts and breaks the live circuit if current exceeds the safe rating, preventing overheating and fire',
        'It steps down the 230 V mains voltage to safe 12 V DC',
        'It stores electrical charge to supply back-up power during an outage',
        'It directs excess current into the neutral wire without disconnecting power'
      ],
      correctIndex: 0,
      explanation: 'Fuses protect appliances and wiring: when excessive current flows through the live wire, the fuse element heats and melts, disconnecting the supply.',
      syllabusRef: 'P4.3'
    }
  ],

  // P5 Nuclear & Space Physics
  'P5': [
    {
      id: 'lib-p5-1',
      subject: 'physics',
      topicCode: 'P5',
      question: 'Compare the penetrating power and ionising capability of alpha (α), beta (β), and gamma (γ) radiation.',
      options: [
        'Alpha is most ionising and stopped by paper; beta has moderate penetration stopped by aluminium; gamma is most penetrating stopped by thick lead',
        'Gamma is most ionising and stopped by paper; alpha penetrates thick lead easily',
        'Beta is a helium nucleus with highest mass; alpha is a fast electron',
        'All three types have identical penetrating ability in air'
      ],
      correctIndex: 0,
      explanation: 'Alpha (He nucleus) has charge +2 and large mass: high ionising, low penetration (paper). Beta (fast electron): moderate. Gamma (EM wave): low ionising, high penetration (requires dense lead).',
      syllabusRef: 'P5.1'
    },
    {
      id: 'lib-p5-2',
      subject: 'physics',
      topicCode: 'P5',
      question: 'A radioactive isotope sample has an initial activity of 800 counts/minute. The half-life is 6.0 hours. What will the activity be after 18 hours?',
      options: [
        '100 counts/minute',
        '200 counts/minute',
        '50 counts/minute',
        '267 counts/minute'
      ],
      correctIndex: 0,
      explanation: 'Number of half-lives elapsed = 18 hours / 6.0 hours = 3 half-lives. 800 -> 400 (after 1st) -> 200 (after 2nd) -> 100 counts/min (after 3rd).',
      syllabusRef: 'P5.1'
    },
    {
      id: 'lib-p5-3',
      subject: 'physics',
      topicCode: 'P5',
      question: 'What is the correct order of the eight planets in our Solar System in increasing distance from the Sun?',
      options: [
        'Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune',
        'Mercury, Mars, Earth, Venus, Saturn, Jupiter, Neptune, Uranus',
        'Venus, Mercury, Earth, Mars, Jupiter, Uranus, Saturn, Neptune',
        'Mars, Earth, Venus, Mercury, Jupiter, Saturn, Neptune, Uranus'
      ],
      correctIndex: 0,
      explanation: 'Planets in order from Sun: Mercury, Venus, Earth, Mars (rocky inner planets), Jupiter, Saturn, Uranus, Neptune (gas/ice giants).',
      syllabusRef: 'P5.2.1'
    }
  ]
};

/**
 * Generates dynamic, parametric calculation questions with realistic random values.
 * Gives genuine variety on repeated attempts.
 */
export function generateParametricQuestion(topicCode: string, subtopicCode: string, seed: number): QuizQuestion | null {
  const code = subtopicCode.toUpperCase();
  const subject: ScienceSubject = topicCode.startsWith('B') ? 'biology' : topicCode.startsWith('C') ? 'chemistry' : 'physics';

  // 1. Biology Magnification (B2)
  if (topicCode === 'B2' || code.startsWith('B2')) {
    const actualUmPool = [15, 20, 25, 40, 50, 75, 80, 120];
    const magPool = [200, 250, 400, 500, 800, 1000];
    const actualUm = actualUmPool[seed % actualUmPool.length];
    const mag = magPool[(seed + 2) % magPool.length];
    const imageMm = (actualUm * mag) / 1000;
    const correct = `${actualUm} μm`;
    const opts = [
      correct,
      `${(actualUm * 10).toFixed(0)} μm`,
      `${(actualUm / 10).toFixed(1)} μm`,
      `${(imageMm * mag).toFixed(0)} μm`
    ];
    return {
      id: `param-b2-${seed}`,
      subject: 'biology',
      topicCode: 'B2',
      question: `Under a microscope, a diagram of a plant cell measures ${imageMm} mm in length. If the magnification is ×${mag}, what is the actual length of the cell?`,
      options: opts,
      correctIndex: 0,
      explanation: `Actual size A = Image size I ÷ Magnification M. Convert Image to μm: ${imageMm} mm × 1000 = ${imageMm * 1000} μm. A = ${imageMm * 1000} ÷ ${mag} = ${actualUm} μm.`,
      syllabusRef: code
    };
  }

  // 2. Chemistry Law of Conservation of Mass & Reacting Masses (C3) - STRICTLY NO MOLES
  if (topicCode === 'C3' || code.startsWith('C3')) {
    const mgMass = Number((1.2 + (seed % 5) * 0.6).toFixed(1));
    const oMass = Number((0.8 + (seed % 5) * 0.4).toFixed(1));
    const mgoMass = Number((mgMass + oMass).toFixed(1));
    const correct = `${mgoMass} g`;
    const opts = [
      correct,
      `${(mgoMass * 1.5).toFixed(1)} g`,
      `${(mgoMass - 0.4).toFixed(1)} g`,
      `${(mgMass).toFixed(1)} g`
    ];
    return {
      id: `param-c3-${seed}`,
      subject: 'chemistry',
      topicCode: 'C3',
      question: `A student ignites ${mgMass} g of magnesium ribbon in a closed crucible with excess air. The magnesium reacts completely with ${oMass} g of oxygen gas. According to the Law of Conservation of Mass, what mass of magnesium oxide is formed?`,
      options: opts,
      correctIndex: 0,
      explanation: `Total mass of products = Total mass of reactants. Mass of MgO = ${mgMass} g (Mg) + ${oMass} g (O₂) = ${mgoMass} g. (In Cambridge 0653, mole calculations from mass/concentration are not required).`,
      syllabusRef: code
    };
  }

  // 3. Physics Speed, Acceleration & Dynamics (P1)
  if (topicCode === 'P1' || code.startsWith('P1')) {
    const isAcceleration = seed % 2 === 0;
    if (isAcceleration) {
      const u = 0;
      const t = 4 + (seed % 4);
      const v = t * (2 + (seed % 3));
      const a = (v - u) / t;
      const correct = `${a.toFixed(1)} m/s²`;
      return {
        id: `param-p1-acc-${seed}`,
        subject: 'physics',
        topicCode: 'P1',
        question: `A racing drone accelerates uniformly from rest to a speed of ${v} m/s in a time of ${t} seconds. What is its acceleration?`,
        options: [correct, `${(a * 2).toFixed(1)} m/s²`, `${(v * t).toFixed(0)} m/s²`, `${(a / 2).toFixed(1)} m/s²`],
        correctIndex: 0,
        explanation: `Acceleration a = (v - u) / t = (${v} - 0) / ${t} = ${a.toFixed(1)} m/s².`,
        syllabusRef: code
      };
    } else {
      const mass = 12 + (seed % 8) * 4;
      const acc = 2 + (seed % 4);
      const force = mass * acc;
      const correct = `${force} N`;
      return {
        id: `param-p1-force-${seed}`,
        subject: 'physics',
        topicCode: 'P1',
        question: `What resultant force is required to accelerate a trolley of mass ${mass} kg at an acceleration of ${acc} m/s²?`,
        options: [correct, `${(mass / acc).toFixed(1)} N`, `${(force * 2)} N`, `${(force - mass)} N`],
        correctIndex: 0,
        explanation: `Using Newton\'s second law: Resultant force F = m × a = ${mass} kg × ${acc} m/s² = ${force} N.`,
        syllabusRef: code
      };
    }
  }

  // 4. Physics Waves (P3)
  if (topicCode === 'P3' || code.startsWith('P3')) {
    const f = 100 + (seed % 8) * 50;
    const v = 340;
    const lambda = Number((v / f).toFixed(2));
    const correct = `${lambda} m`;
    return {
      id: `param-p3-${seed}`,
      subject: 'physics',
      topicCode: 'P3',
      question: `A loudspeaker emits a sound wave with a frequency of ${f} Hz through air. If the speed of sound is ${v} m/s, what is the wavelength of the sound wave?`,
      options: [correct, `${(lambda * 2).toFixed(2)} m`, `${(f / v).toFixed(2)} m`, `${(f * v).toFixed(0)} m`],
      correctIndex: 0,
      explanation: `Using wave equation v = f × λ: λ = v / f = ${v} / ${f} = ${lambda} m.`,
      syllabusRef: code
    };
  }

  // 5. Physics Electricity Ohm's Law (P4)
  if (topicCode === 'P4' || code.startsWith('P4')) {
    const i = 0.2 + (seed % 5) * 0.2;
    const r = 20 + (seed % 6) * 10;
    const v = Number((i * r).toFixed(1));
    const correct = `${v} V`;
    return {
      id: `param-p4-${seed}`,
      subject: 'physics',
      topicCode: 'P4',
      question: `A current of ${i.toFixed(1)} A flows through a fixed resistor of resistance ${r} Ω. What is the potential difference across the resistor?`,
      options: [correct, `${(r / i).toFixed(1)} V`, `${(v * 2).toFixed(1)} V`, `${(v / 2).toFixed(1)} V`],
      correctIndex: 0,
      explanation: `Using Ohm\'s Law V = I × R = ${i.toFixed(1)} A × ${r} Ω = ${v} V.`,
      syllabusRef: code
    };
  }

  // 6. Physics Half-Life (P5)
  if (topicCode === 'P5' || code.startsWith('P5')) {
    const halfLife = 4 + (seed % 4) * 2;
    const n = 3;
    const totalTime = halfLife * n;
    const initialActivity = 800;
    const finalActivity = initialActivity / Math.pow(2, n);
    const correct = `${finalActivity} Bq`;
    return {
      id: `param-p5-${seed}`,
      subject: 'physics',
      topicCode: 'P5',
      question: `A radioactive source has an initial activity of ${initialActivity} Bq and a half-life of ${halfLife} hours. What will its activity be after ${totalTime} hours?`,
      options: [correct, `${finalActivity * 2} Bq`, `${finalActivity / 2} Bq`, `${initialActivity / 3} Bq`],
      correctIndex: 0,
      explanation: `Number of half-lives elapsed = ${totalTime} ÷ ${halfLife} = ${n} half-lives. Activity halves ${n} times: ${initialActivity} → ${initialActivity / 2} → ${initialActivity / 4} → ${finalActivity} Bq.`,
      syllabusRef: code
    };
  }

  return null;
}
