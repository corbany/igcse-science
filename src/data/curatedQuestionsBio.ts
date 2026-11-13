import { QuizQuestion } from '../types';

/**
 * Curated Cambridge IGCSE Combined Science (0653) Biology MCQs
 * Grouped cleanly by exact syllabus subtopic code so Traffic Light and Practice quizzes
 * always serve real, accurate, non-nonsensical questions.
 */
export const CURATED_BIO_QUESTIONS: Record<string, QuizQuestion[]> = {
  'B2.2': [
    {
      id: 'cb-b22-1',
      subject: 'biology',
      topicCode: 'B2',
      syllabusRef: 'B2.2',
      question: 'How many micrometres (μm) are equivalent to 1 millimetre (mm)?',
      options: ['1000 μm', '100 μm', '10 μm', '10,000 μm'],
      correctIndex: 0,
      explanation: '1 mm = 1000 μm. To convert millimetres to micrometres, multiply by 1000.'
    },
    {
      id: 'cb-b22-2',
      subject: 'biology',
      topicCode: 'B2',
      syllabusRef: 'B2.2',
      question: 'Which formula correctly relates magnification (M), image size (I), and actual specimen size (A)?',
      options: ['M = I ÷ A', 'M = A ÷ I', 'M = I × A', 'A = M ÷ I'],
      correctIndex: 0,
      explanation: 'Magnification = Image size ÷ Actual size (M = I / A). Both I and A must be in the same units.'
    },
    {
      id: 'cb-b22-3',
      subject: 'biology',
      topicCode: 'B2',
      syllabusRef: 'B2.2',
      question: 'A drawing of a chloroplast has an image length of 45 mm and the magnification is ×1500. What is the actual length of the chloroplast in micrometres?',
      options: ['30 μm', '3.0 μm', '300 μm', '67.5 μm'],
      correctIndex: 0,
      explanation: 'Convert 45 mm = 45,000 μm. Actual size = 45,000 μm ÷ 1500 = 30 μm.'
    },
    {
      id: 'cb-b22-4',
      subject: 'biology',
      topicCode: 'B2',
      syllabusRef: 'B2.2',
      question: 'A cheek cell has an actual diameter of 60 μm. In a photograph, its diameter measures 24 mm. What is the magnification?',
      options: ['×400', '×40', '×4000', '×2.5'],
      correctIndex: 0,
      explanation: '24 mm = 24,000 μm. Magnification = 24,000 ÷ 60 = ×400.'
    }
  ],

  'B3.2': [
    {
      id: 'cb-b32-1',
      subject: 'biology',
      topicCode: 'B3',
      syllabusRef: 'B3.2',
      question: 'What happens to a potato cylinder placed in pure distilled water for 45 minutes?',
      options: [
        'It gains mass and becomes firm (turgid) because water enters cells by osmosis',
        'It loses mass and becomes flaccid because water leaves cells by osmosis',
        'Its mass stays unchanged because potato cell walls block water entry',
        'It loses mass because starch diffuses out through the cell membrane'
      ],
      correctIndex: 0,
      explanation: 'Distilled water has a higher water potential than potato cell sap, so water moves into the cells by osmosis down a water potential gradient.'
    },
    {
      id: 'cb-b32-2',
      subject: 'biology',
      topicCode: 'B3',
      syllabusRef: 'B3.2',
      question: 'Why must all potato cylinders be cut to the same diameter and length before starting an osmosis investigation?',
      options: [
        'To control the surface area to volume ratio so the comparison between sucrose concentrations is a fair test',
        'So that every cylinder has exactly the same sucrose concentration inside its vacuoles',
        'To prevent enzymes from denaturing during weighing',
        'So that water only diffuses into the smallest cylinder'
      ],
      correctIndex: 0,
      explanation: 'Keeping dimensions identical controls the surface area to volume ratio, ensuring percentage change in mass depends only on solution concentration.'
    },
    {
      id: 'cb-b32-3',
      subject: 'biology',
      topicCode: 'B3',
      syllabusRef: 'B3.2',
      question: 'In an osmosis experiment, why is percentage change in mass calculated instead of using raw mass change in grams?',
      options: [
        'Because initial masses of potato cylinders differ slightly, so percentage change allows a fair comparison',
        'Because balances cannot measure changes smaller than 1 gram',
        'Because osmosis only changes volume and not mass',
        'Because percentage change removes the need to blot the cylinders dry'
      ],
      correctIndex: 0,
      explanation: 'Even careful cutting produces small differences in starting mass; percentage change = (change in mass ÷ initial mass) × 100 normalises the data.'
    },
    {
      id: 'cb-b32-4',
      subject: 'biology',
      topicCode: 'B3',
      syllabusRef: 'B3.2',
      question: 'A potato cylinder shows 0% change in mass after soaking in a 0.35 mol/dm³ sucrose solution. What does this indicate?',
      options: [
        'The water potential of the potato cell sap equals the water potential of the 0.35 mol/dm³ sucrose solution',
        'The potato cell membranes have become impermeable to water',
        'Active transport is pumping sucrose out at the same rate it diffuses in',
        'Osmosis stops completely whenever sucrose is dissolved in water'
      ],
      correctIndex: 0,
      explanation: 'At the isotonic point (0% mass change), there is no net movement of water because internal and external water potentials are equal.'
    },
    {
      id: 'cb-b32-5',
      subject: 'biology',
      topicCode: 'B3',
      syllabusRef: 'B3.2',
      question: 'Which term describes a plant cell whose cytoplasm and cell membrane have pulled away from the cell wall in a very concentrated sugar solution?',
      options: ['Plasmolysed', 'Turgid', 'Haemolysed', 'Crenated'],
      correctIndex: 0,
      explanation: 'When water leaves a plant cell by osmosis in a concentrated solution, the vacuole shrinks and the membrane pulls away from the cell wall (plasmolysis).'
    }
  ],

  'B3.3': [
    {
      id: 'cb-b33-1',
      subject: 'biology',
      topicCode: 'B3',
      syllabusRef: 'B3.3',
      question: 'How does active transport differ from diffusion?',
      options: [
        'Active transport moves particles against a concentration gradient using energy from respiration',
        'Active transport only moves water molecules through a cell wall',
        'Active transport is a passive process that slows down as respiration increases',
        'Active transport moves gases from high pressure to low pressure without carrier proteins'
      ],
      correctIndex: 0,
      explanation: 'Active transport requires energy (ATP) from cellular respiration and membrane carrier proteins to move ions/molecules from low to high concentration.'
    },
    {
      id: 'cb-b33-2',
      subject: 'biology',
      topicCode: 'B3',
      syllabusRef: 'B3.3',
      question: 'Why do root hair cells contain many mitochondria?',
      options: [
        'To release energy via aerobic respiration for active transport of mineral ions from soil',
        'To absorb sunlight underground for photosynthesis',
        'To store nitrate ions in large vacuoles',
        'To lower the water potential of cellulose cell walls'
      ],
      correctIndex: 0,
      explanation: 'Mineral ion concentration in soil water is often lower than inside root hair cells, so uptake requires active transport powered by ATP from mitochondria.'
    },
    {
      id: 'cb-b33-3',
      subject: 'biology',
      topicCode: 'B3',
      syllabusRef: 'B3.3',
      question: 'When soil becomes waterlogged and lacks oxygen, mineral ion uptake by plant roots decreases sharply. Why?',
      options: [
        'Root hair cells cannot carry out aerobic respiration to supply energy for active transport',
        'Water dissolves the carrier proteins in the cell membrane',
        'Osmosis reverses and pushes mineral ions out through xylem vessels',
        'Roots need atmospheric nitrogen gas to diffuse directly into mitochondria'
      ],
      correctIndex: 0,
      explanation: 'Without oxygen, aerobic respiration stops, reducing energy available for active transport of mineral ions against the gradient.'
    },
    {
      id: 'cb-b33-4',
      subject: 'biology',
      topicCode: 'B3',
      syllabusRef: 'B3.3',
      question: 'In the human small intestine, how is glucose absorbed into villus epithelial cells when lumen concentration becomes lower than blood concentration?',
      options: [
        'By active transport through carrier proteins in the cell membrane',
        'By osmosis through aquaporins',
        'By simple diffusion down a concentration gradient',
        'By evaporation across the microvilli'
      ],
      correctIndex: 0,
      explanation: 'Even when glucose concentration in the gut lumen drops below blood levels, active transport absorbs the remaining glucose using respiration energy.'
    }
  ],

  'B6.1': [
    {
      id: 'cb-b61-1',
      subject: 'biology',
      topicCode: 'B6',
      syllabusRef: 'B6.1',
      question: 'What is the correct word equation for photosynthesis?',
      options: [
        'carbon dioxide + water → glucose + oxygen',
        'glucose + oxygen → carbon dioxide + water',
        'carbon dioxide + oxygen → glucose + water',
        'water + mineral ions → starch + nitrogen'
      ],
      correctIndex: 0,
      explanation: 'Plants use light energy absorbed by chlorophyll to combine carbon dioxide and water into glucose and oxygen.'
    },
    {
      id: 'cb-b61-2',
      subject: 'biology',
      topicCode: 'B6',
      syllabusRef: 'B6.1',
      question: 'Why must a potted plant be placed in a dark cupboard for 24–48 hours before testing a leaf for starch?',
      options: [
        'To destarch the leaves so any starch found afterwards was made during the experiment',
        'To kill chlorophyll molecules so iodine can penetrate the leaf',
        'To increase the rate of transpiration before illumination',
        'To allow carbon dioxide to accumulate inside the chloroplasts'
      ],
      correctIndex: 0,
      explanation: 'Destarching ensures existing starch reserves are respired away, making the experiment a valid test for new photosynthesis.'
    },
    {
      id: 'cb-b61-3',
      subject: 'biology',
      topicCode: 'B6',
      syllabusRef: 'B6.1',
      question: 'When testing a leaf for starch, why is the leaf boiled in ethanol inside a hot water bath rather than directly over a Bunsen flame?',
      options: [
        'Ethanol is highly flammable and could ignite if heated directly by a naked flame',
        'Ethanol boils only above 120 °C so a water bath heats it faster',
        'A Bunsen flame would turn iodine solution purple',
        'Hot water prevents starch from dissolving out of the leaf'
      ],
      correctIndex: 0,
      explanation: 'Ethanol removes green chlorophyll so iodine colour changes are clearly visible, and a hot water bath prevents flammable ethanol vapour from catching fire.'
    },
    {
      id: 'cb-b61-4',
      subject: 'biology',
      topicCode: 'B6',
      syllabusRef: 'B6.1',
      question: 'At high light intensity, increasing light intensity further no longer increases the rate of photosynthesis. What does this show?',
      options: [
        'Another factor such as carbon dioxide concentration or temperature is now limiting the rate',
        'The plant has run out of water in its xylem vessels',
        'Chlorophyll has stopped absorbing light energy',
        'Respiration has overtaken photosynthesis'
      ],
      correctIndex: 0,
      explanation: 'When a rate graph plateaus despite increasing one factor, a different environmental variable (CO₂ concentration or temperature) is the limiting factor.'
    },
    {
      id: 'cb-b61-5',
      subject: 'biology',
      topicCode: 'B6',
      syllabusRef: 'B6.1',
      question: 'Which mineral ion is needed by plants to manufacture chlorophyll, and what symptom appears if it is deficient?',
      options: [
        'Magnesium ions; leaves turn yellow between veins (chlorosis)',
        'Nitrate ions; roots rot and stop absorbing water',
        'Calcium ions; petals fail to open',
        'Iron ions; xylem vessels collapse'
      ],
      correctIndex: 0,
      explanation: 'Magnesium is an essential component of the chlorophyll molecule. Magnesium deficiency causes yellowing of leaves (chlorosis).'
    }
  ],

  'B6.2': [
    {
      id: 'cb-b62-1',
      subject: 'biology',
      topicCode: 'B6',
      syllabusRef: 'B6.2',
      question: 'Why are upper epidermal cells of a leaf transparent and lacking chloroplasts?',
      options: [
        'To allow light to pass straight through to the chloroplast-rich palisade mesophyll layer below',
        'To prevent oxygen from leaving the top of the leaf',
        'To absorb mineral ions directly from rainwater',
        'To store starch grains during winter'
      ],
      correctIndex: 0,
      explanation: 'The transparent upper epidermis acts like a window, letting maximum sunlight reach the palisade mesophyll cells.'
    },
    {
      id: 'cb-b62-2',
      subject: 'biology',
      topicCode: 'B6',
      syllabusRef: 'B6.2',
      question: 'What is the main advantage of the large air spaces inside the spongy mesophyll layer of a leaf?',
      options: [
        'They allow rapid diffusion of carbon dioxide and oxygen between stomata and photosynthesising cells',
        'They provide structural support instead of xylem vessels',
        'They trap rainwater to increase turgor pressure',
        'They reflect ultraviolet light away from guard cells'
      ],
      correctIndex: 0,
      explanation: 'Air spaces in the spongy mesophyll create a large internal gas-exchange surface area and allow fast gas diffusion in the gas phase.'
    },
    {
      id: 'cb-b62-3',
      subject: 'biology',
      topicCode: 'B6',
      syllabusRef: 'B6.2',
      question: 'Which pair of specialised cells controls the opening and closing of each stoma on the lower epidermis?',
      options: ['Guard cells', 'Palisade cells', 'Companion cells', 'Root hair cells'],
      correctIndex: 0,
      explanation: 'Guard cells change shape as they gain or lose water by osmosis, opening the stoma in daylight and closing it when water is scarce.'
    },
    {
      id: 'cb-b62-4',
      subject: 'biology',
      topicCode: 'B6',
      syllabusRef: 'B6.2',
      question: 'What is the function of the waxy cuticle covering the upper surface of a leaf?',
      options: [
        'To reduce uncontrolled water loss by evaporation from the leaf surface',
        'To absorb carbon dioxide directly from the air',
        'To transport sucrose to the roots',
        'To anchor the leaf to the stem'
      ],
      correctIndex: 0,
      explanation: 'The waterproof waxy cuticle limits water evaporation while remaining thin and transparent so sunlight reaches the palisade layer.'
    },
    {
      id: 'cb-b62-5',
      subject: 'biology',
      topicCode: 'B6',
      syllabusRef: 'B6.2',
      question: 'Why are most stomata located on the underside (lower epidermis) of a typical terrestrial leaf?',
      options: [
        'It is cooler and shaded from direct sunlight, reducing excessive water loss by transpiration',
        'Carbon dioxide is denser than air and sinks beneath leaves',
        'It prevents oxygen produced in photosynthesis from escaping',
        'Upper epidermal cells are too thick for guard cells to form'
      ],
      correctIndex: 0,
      explanation: 'Having stomata on the shaded lower surface reduces direct heating and air movement across the pores, conserving water.'
    }
  ],

  'B7.1': [
    {
      id: 'cb-b71-1',
      subject: 'biology',
      topicCode: 'B7',
      syllabusRef: 'B7.1',
      question: 'What is meant by a balanced diet?',
      options: [
        'A diet that contains all essential nutrients in the correct proportions to meet a person’s energy and growth needs',
        'A diet containing equal masses of carbohydrate, fat, and protein every day',
        'A diet that excludes all fats and carbohydrates to prevent weight gain',
        'Eating only fruit and vegetables without dairy or meat'
      ],
      correctIndex: 0,
      explanation: 'A balanced diet supplies carbohydrates, proteins, lipids, vitamins, minerals, fibre, and water in proportions appropriate for age, sex, and activity.'
    },
    {
      id: 'cb-b71-2',
      subject: 'biology',
      topicCode: 'B7',
      syllabusRef: 'B7.1',
      question: 'Deficiency of Vitamin C causes scurvy (bleeding gums and slow wound healing). Which food source is rich in Vitamin C?',
      options: ['Citrus fruits such as oranges and lemons', 'Refined white sugar and butter', 'Red meat and liver', 'Wholegrain bread and rice'],
      correctIndex: 0,
      explanation: 'Fresh citrus fruits, peppers, and green vegetables are rich in Vitamin C (ascorbic acid), needed to maintain healthy connective tissue.'
    },
    {
      id: 'cb-b71-3',
      subject: 'biology',
      topicCode: 'B7',
      syllabusRef: 'B7.1',
      question: 'Which deficiency disease results from lack of Vitamin D or calcium ions in a growing child’s diet?',
      options: ['Rickets (soft, deformed bones)', 'Scurvy (bleeding gums)', 'Anaemia (low haemoglobin)', 'Kwashiorkor (protein deficiency)'],
      correctIndex: 0,
      explanation: 'Calcium is required for strong bones and teeth, and Vitamin D is needed for calcium absorption; deficiency causes rickets.'
    },
    {
      id: 'cb-b71-4',
      subject: 'biology',
      topicCode: 'B7',
      syllabusRef: 'B7.1',
      question: 'Why is dietary fibre (roughage) essential even though humans cannot digest cellulose?',
      options: [
        'It adds bulk to food so intestinal muscles can push it along by peristalsis and prevents constipation',
        'It is broken down into amino acids in the stomach for muscle growth',
        'It provides twice as much energy per gram as fat',
        'It neutralises bile salts inside the pancreas'
      ],
      correctIndex: 0,
      explanation: 'Insoluble fibre stretches the gut wall, stimulating peristaltic contractions in the intestine and preventing constipation.'
    },
    {
      id: 'cb-b71-5',
      subject: 'biology',
      topicCode: 'B7',
      syllabusRef: 'B7.1',
      question: 'Why does a deficiency of iron in the diet lead to tiredness and shortness of breath?',
      options: [
        'Iron is needed to make haemoglobin in red blood cells, which carries oxygen for respiration',
        'Iron is used to build tooth enamel and bone matrix',
        'Iron acts as the primary digestive enzyme in the small intestine',
        'Iron provides insulation beneath the skin'
      ],
      correctIndex: 0,
      explanation: 'Lack of iron reduces haemoglobin production (anaemia), lowering the oxygen-carrying capacity of blood.'
    }
  ],

  'B7.2': [
    {
      id: 'cb-b72-1',
      subject: 'biology',
      topicCode: 'B7',
      syllabusRef: 'B7.2',
      question: 'Which sequence shows the correct order of organs along the human alimentary canal?',
      options: [
        'Mouth → oesophagus → stomach → small intestine → large intestine → rectum → anus',
        'Mouth → stomach → oesophagus → large intestine → small intestine → anus',
        'Mouth → oesophagus → pancreas → stomach → small intestine → anus',
        'Mouth → liver → stomach → duodenum → colon → rectum'
      ],
      correctIndex: 0,
      explanation: 'Food passes along the alimentary canal from mouth → oesophagus → stomach → small intestine (duodenum & ileum) → large intestine (colon & rectum) → anus.'
    },
    {
      id: 'cb-b72-2',
      subject: 'biology',
      topicCode: 'B7',
      syllabusRef: 'B7.2',
      question: 'Which organs are associated digestive glands that secrete juices into the alimentary canal without food passing through them?',
      options: [
        'Salivary glands, pancreas, liver, and gall bladder',
        'Oesophagus, stomach, and colon',
        'Duodenum, ileum, and rectum',
        'Trachea, bronchi, and alveoli'
      ],
      correctIndex: 0,
      explanation: 'Salivary glands, pancreas, liver, and gall bladder are associated organs that deliver saliva, pancreatic juice, and bile via ducts.'
    },
    {
      id: 'cb-b72-3',
      subject: 'biology',
      topicCode: 'B7',
      syllabusRef: 'B7.2',
      question: 'What is the main function of the colon (first part of the large intestine)?',
      options: [
        'Absorption of remaining water from undigested food remains',
        'Secretion of hydrochloric acid and pepsin to digest proteins',
        'Emulsification of lipids using newly made bile',
        'Absorption of all glucose and amino acids into capillaries'
      ],
      correctIndex: 0,
      explanation: 'Most water and digested nutrients are absorbed in the small intestine; the colon absorbs remaining water from undigested waste before faeces form.'
    },
    {
      id: 'cb-b72-4',
      subject: 'biology',
      topicCode: 'B7',
      syllabusRef: 'B7.2',
      question: 'Which adaptation of the small intestine (ileum) gives it a massive surface area for rapid absorption of digested nutrients?',
      options: [
        'Millions of finger-like villi and microscopic microvilli lining its inner wall',
        'Thick rings of smooth cartilage keeping the lumen wide open',
        'A thick waterproof layer of mucus blocking water movement',
        'Strong sphincter valves separating every 5 cm of the tube'
      ],
      correctIndex: 0,
      explanation: 'Villi and microvilli greatly increase surface area, while thin one-cell-thick epithelium and dense capillaries maintain steep diffusion gradients.'
    },
    {
      id: 'cb-b72-5',
      subject: 'biology',
      topicCode: 'B7',
      syllabusRef: 'B7.2',
      question: 'What is the difference between ingestion and egestion?',
      options: [
        'Ingestion is taking food into the body through the mouth; egestion is passing out undigested food as faeces through the anus',
        'Ingestion is breaking down food by enzymes; egestion is removing urea from blood in the kidneys',
        'Ingestion is absorption into blood; egestion is swallowing food down the oesophagus',
        'Ingestion is chewing with teeth; egestion is churning in the stomach'
      ],
      correctIndex: 0,
      explanation: 'Ingestion occurs at the mouth; egestion is removal of undigested waste (faeces) at the anus.'
    }
  ],

  'B7.3': [
    {
      id: 'cb-b73-1',
      subject: 'biology',
      topicCode: 'B7',
      syllabusRef: 'B7.3',
      question: 'What is the role of hydrochloric acid (HCl) in gastric juice inside the human stomach?',
      options: [
        'Kills harmful bacteria in food and provides the acidic pH (~2) optimum for protease (pepsin)',
        'Emulsifies fats into tiny droplets before entering the duodenum',
        'Digests starch molecules directly into glucose',
        'Neutralises alkaline secretions from the salivary glands'
      ],
      correctIndex: 0,
      explanation: 'Stomach acid destroys pathogens ingested with food and maintains pH 1.5–2.0 so pepsin can digest proteins efficiently.'
    },
    {
      id: 'cb-b73-2',
      subject: 'biology',
      topicCode: 'B7',
      syllabusRef: 'B7.3',
      question: 'Which enzyme breaks down proteins into amino acids, and where does trypsin act?',
      options: [
        'Protease; trypsin is secreted by the pancreas and acts in the small intestine (duodenum)',
        'Amylase; acts in the stomach to form maltose',
        'Lipase; acts in the mouth to form fatty acids and glycerol',
        'Maltase; acts in the large intestine to form glycogen'
      ],
      correctIndex: 0,
      explanation: 'Proteases digest proteins into amino acids: pepsin acts in the acidic stomach, while trypsin from the pancreas acts in the alkaline small intestine.'
    },
    {
      id: 'cb-b73-3',
      subject: 'biology',
      topicCode: 'B7',
      syllabusRef: 'B7.3',
      question: 'How does bile assist the enzyme lipase during fat digestion in the duodenum?',
      options: [
        'Bile salts emulsify large fat globules into small droplets, increasing surface area for lipase, and alkaline bile neutralises stomach acid',
        'Bile contains lipase molecules that chemically hydrolyse triglycerides directly',
        'Bile lowers the pH of the small intestine to pH 2 to activate lipase',
        'Bile converts glycerol into glucose before absorption'
      ],
      correctIndex: 0,
      explanation: 'Bile is not an enzyme; it emulsifies lipids physically to increase surface area and neutralises acidic chyme so pancreatic lipase works at its optimum pH.'
    },
    {
      id: 'cb-b73-4',
      subject: 'biology',
      topicCode: 'B7',
      syllabusRef: 'B7.3',
      question: 'What are the final soluble products of lipid (fat) digestion by lipase?',
      options: ['Fatty acids and glycerol', 'Amino acids and peptides', 'Maltose and glucose', 'Glycogen and cellulose'],
      correctIndex: 0,
      explanation: 'Lipase breaks ester bonds in fats and oils to yield soluble fatty acids and glycerol molecules.'
    },
    {
      id: 'cb-b73-5',
      subject: 'biology',
      topicCode: 'B7',
      syllabusRef: 'B7.3',
      question: 'Which enzyme completes the digestion of maltose into glucose on the epithelium of the small intestine?',
      options: ['Maltase', 'Amylase', 'Pepsin', 'Lipase'],
      correctIndex: 0,
      explanation: 'Amylase breaks starch down to maltose; maltase then breaks maltose down into absorbable glucose molecules.'
    }
  ],

  'B8.1': [
    {
      id: 'cb-b81-1',
      subject: 'biology',
      topicCode: 'B8',
      syllabusRef: 'B8.1',
      question: 'What substances are transported by xylem vessels and in which direction?',
      options: [
        'Water and dissolved mineral ions, transported upwards only from roots to stems and leaves',
        'Sucrose and amino acids, transported both upwards and downwards',
        'Glucose and oxygen, transported downwards from leaves to roots',
        'Starch grains and carbon dioxide, transported throughout the cortex'
      ],
      correctIndex: 0,
      explanation: 'Xylem transports water and mineral ions from the roots upwards to the leaves in the transpiration stream.'
    },
    {
      id: 'cb-b81-2',
      subject: 'biology',
      topicCode: 'B8',
      syllabusRef: 'B8.1',
      question: 'How is the structure of a xylem vessel adapted for water transport and plant support?',
      options: [
        'Dead hollow cells joined end-to-end with no cross walls and thickened walls reinforced with lignin',
        'Living cells containing many chloroplasts and perforated sieve plates',
        'Thin elastic membranes that expand to store starch',
        'Open stomata along the outside of the stem'
      ],
      correctIndex: 0,
      explanation: 'Lack of cytoplasm and end walls allows continuous unobstructed water flow, while thick lignin rings prevent collapse under tension and provide mechanical support.'
    },
    {
      id: 'cb-b81-3',
      subject: 'biology',
      topicCode: 'B8',
      syllabusRef: 'B8.1',
      question: 'In a cross-section of a young dicotyledonous stem, how are xylem and phloem arranged inside each vascular bundle?',
      options: [
        'Xylem is on the inside (closer to the centre) and phloem is on the outside',
        'Phloem forms a solid X-shape in the very centre and xylem sits in the epidermis',
        'Both tissues are mixed randomly throughout the pith',
        'Phloem is on the inside and xylem forms the outer bark'
      ],
      correctIndex: 0,
      explanation: 'In a dicot stem vascular bundle, xylem faces inwards toward the pith and phloem faces outwards toward the cortex.'
    },
    {
      id: 'cb-b81-4',
      subject: 'biology',
      topicCode: 'B8',
      syllabusRef: 'B8.1',
      question: 'What substances are transported by phloem tissue in plants?',
      options: ['Sucrose and amino acids (translocation)', 'Water and nitrate ions only', 'Insoluble starch and cellulose', 'Oxygen and chlorophyll'],
      correctIndex: 0,
      explanation: 'Phloem transports manufactured sucrose and amino acids from sources (e.g. leaves) to sinks (roots, flowers, growing shoots).'
    }
  ],

  'B8.2': [
    {
      id: 'cb-b82-1',
      subject: 'biology',
      topicCode: 'B8',
      syllabusRef: 'B8.2',
      question: 'How is a root hair cell adapted for rapid uptake of water from soil?',
      options: [
        'A long thin finger-like extension provides a very large surface area across a thin cell wall',
        'A thick waxy cuticle covers the tip to retain water inside',
        'Many chloroplasts provide energy directly from sunlight',
        'Lignified dead walls resist osmotic swelling'
      ],
      correctIndex: 0,
      explanation: 'The root hair projection greatly increases surface area in contact with soil water for rapid osmosis and active mineral uptake.'
    },
    {
      id: 'cb-b82-2',
      subject: 'biology',
      topicCode: 'B8',
      syllabusRef: 'B8.2',
      question: 'What is the correct pathway of water from the soil into the stem of a plant?',
      options: [
        'Soil water → root hair cell → root cortex cells → xylem vessels in root → stem xylem',
        'Soil water → phloem → root cortex cells → root hair cell → leaf stomata',
        'Soil water → root hair cell → stomata → root cortex → xylem',
        'Soil water → spongy mesophyll → xylem → root hair cell'
      ],
      correctIndex: 0,
      explanation: 'Water enters root hair cells by osmosis, passes across the root cortex from cell to cell, and enters xylem vessels to rise up the stem.'
    },
    {
      id: 'cb-b82-3',
      subject: 'biology',
      topicCode: 'B8',
      syllabusRef: 'B8.2',
      question: 'By which process does water move from damp soil into root hair cells?',
      options: [
        'Osmosis, down a water potential gradient',
        'Transpiration, through open stomata',
        'Active transport, against a concentration gradient',
        'Evaporation into root air spaces'
      ],
      correctIndex: 0,
      explanation: 'Soil water has a higher water potential than concentrated root hair cell sap, so water enters passively by osmosis.'
    },
    {
      id: 'cb-b82-4',
      subject: 'biology',
      topicCode: 'B8',
      syllabusRef: 'B8.2',
      question: 'If excessive chemical fertiliser is added to soil around plant roots, why may the plant wilt?',
      options: [
        'Soil water potential drops below root cell sap water potential, causing water to leave root cells by osmosis',
        'Fertiliser clogs the waxy cuticle on upper leaves',
        'Nitrate ions block phloem sieve plates inside the stem',
        'Root hairs grow too rapidly and burst'
      ],
      correctIndex: 0,
      explanation: 'Concentrated dissolved fertiliser lowers soil water potential so water diffuses out of root cells by osmosis, causing wilting.'
    }
  ],

  'B8.3': [
    {
      id: 'cb-b83-1',
      subject: 'biology',
      topicCode: 'B8',
      syllabusRef: 'B8.3',
      question: 'What is the definition of transpiration in plants?',
      options: [
        'The loss of water vapour from leaves by evaporation from mesophyll cell surfaces followed by diffusion out through stomata',
        'The active pumping of liquid water out of root hair cells',
        'The transport of dissolved sugars from leaves to roots through phloem',
        'The uptake of carbon dioxide into palisade cells during daylight'
      ],
      correctIndex: 0,
      explanation: 'Transpiration is the evaporation of water at the surfaces of mesophyll cells followed by loss of water vapour through the stomata.'
    },
    {
      id: 'cb-b83-2',
      subject: 'biology',
      topicCode: 'B8',
      syllabusRef: 'B8.3',
      question: 'Which set of environmental changes would cause the fastest rate of transpiration?',
      options: [
        'High temperature, high wind speed, and low humidity',
        'Low temperature, still air, and high humidity',
        'Darkness, high humidity, and cold soil',
        'Low light intensity, cool air, and saturated air'
      ],
      correctIndex: 0,
      explanation: 'Warmth speeds evaporation, wind blows humid air away, and low atmospheric humidity maintains a steep water vapour diffusion gradient.'
    },
    {
      id: 'cb-b83-3',
      subject: 'biology',
      topicCode: 'B8',
      syllabusRef: 'B8.3',
      question: 'What does a bubble potometer directly measure during a plant transpiration practical?',
      options: [
        'The rate of water uptake by a leafy shoot (used to estimate transpiration rate)',
        'The mass of glucose produced during photosynthesis',
        'The rate of oxygen release through stomata',
        'The concentration of mineral ions entering xylem vessels'
      ],
      correctIndex: 0,
      explanation: 'A potometer measures water uptake rate by tracking the distance an air bubble moves along a capillary tube per unit time.'
    },
    {
      id: 'cb-b83-4',
      subject: 'biology',
      topicCode: 'B8',
      syllabusRef: 'B8.3',
      question: 'Why must a leafy shoot be cut and fitted into a potometer underwater?',
      options: [
        'To prevent air bubbles from entering xylem vessels and breaking the continuous water column',
        'To wash away starch grains from the phloem',
        'To open all stomata wider before starting the timer',
        'To dissolve the waxy cuticle on the stem'
      ],
      correctIndex: 0,
      explanation: 'Air bubbles inside xylem break cohesion between water molecules, stopping transpiration pull up the shoot.'
    },
    {
      id: 'cb-b83-5',
      subject: 'biology',
      topicCode: 'B8',
      syllabusRef: 'B8.3',
      question: 'Why does high atmospheric humidity decrease the rate of transpiration?',
      options: [
        'It reduces the water vapour concentration gradient between the inside of the leaf and the outside air',
        'It causes guard cells to gain sugar and close stomata completely',
        'It freezes water inside spongy mesophyll cells',
        'It increases cohesion inside xylem vessels'
      ],
      correctIndex: 0,
      explanation: 'Humid outside air already contains many water vapour molecules, lowering the concentration gradient for diffusion out through stomata.'
    }
  ],

  'B9.1': [
    {
      id: 'cb-b91-1',
      subject: 'biology',
      topicCode: 'B9',
      syllabusRef: 'B9.1',
      question: 'Why do mammals have a double circulatory system?',
      options: [
        'Blood passes through the heart twice per complete circuit: once to the lungs at lower pressure and once to the body at high pressure',
        'Mammals have two separate hearts—one on the left and one on the right of the ribs',
        'Oxygenated and deoxygenated blood mix inside the ventricles before leaving the heart',
        'Blood passes through both kidneys before returning to the right atrium'
      ],
      correctIndex: 0,
      explanation: 'Double circulation sends deoxygenated blood gently to delicate lung capillaries (pulmonary circuit), then returns oxygenated blood to the heart to be pumped forcefully to the body (systemic circuit).'
    },
    {
      id: 'cb-b91-2',
      subject: 'biology',
      topicCode: 'B9',
      syllabusRef: 'B9.1',
      question: 'What is a key advantage of a double circulatory system compared with a fish’s single circulatory system?',
      options: [
        'It maintains high blood pressure to body tissues, allowing faster oxygen delivery and higher metabolic rate',
        'It eliminates the need for valves in veins',
        'It removes the need for red blood cells to carry oxygen',
        'It forces blood through capillaries slower so pressure drops to zero'
      ],
      correctIndex: 0,
      explanation: 'Repumping oxygenated blood after the lungs restores high pressure for rapid systemic flow to active organs and muscles.'
    },
    {
      id: 'cb-b91-3',
      subject: 'biology',
      topicCode: 'B9',
      syllabusRef: 'B9.1',
      question: 'In a mammal, where does blood go immediately after leaving the right ventricle?',
      options: [
        'To the lungs via the pulmonary artery',
        'To the body tissues via the aorta',
        'To the left atrium via the vena cava',
        'To the liver via the hepatic portal vein'
      ],
      correctIndex: 0,
      explanation: 'Deoxygenated blood is pumped by the right ventricle through the pulmonary artery to the lungs for gas exchange.'
    },
    {
      id: 'cb-b91-4',
      subject: 'biology',
      topicCode: 'B9',
      syllabusRef: 'B9.1',
      question: 'Which statement correctly describes a single circulatory system (such as in a bony fish)?',
      options: [
        'Blood passes through the heart only once during one complete circuit of the body',
        'Blood bypasses capillaries completely and flows inside body cavities',
        'Only oxygenated blood enters the heart chambers',
        'The heart contains four separate muscular chambers'
      ],
      correctIndex: 0,
      explanation: 'In single circulation, blood passes through the heart once per circuit: heart → gills → body → heart.'
    }
  ],

  'B9.2': [
    {
      id: 'cb-b92-1',
      subject: 'biology',
      topicCode: 'B9',
      syllabusRef: 'B9.2',
      question: 'Why is the muscular wall of the left ventricle much thicker than that of the right ventricle?',
      options: [
        'The left ventricle must pump blood at high pressure all around the body, whereas the right ventricle pumps only to the nearby lungs',
        'The left ventricle holds twice the volume of blood as the right ventricle',
        'The right ventricle does not contract during the cardiac cycle',
        'The left ventricle receives blood directly from the vena cava'
      ],
      correctIndex: 0,
      explanation: 'Greater muscle thickness generates higher pressure needed to overcome the resistance of the systemic body circulation.'
    },
    {
      id: 'cb-b92-2',
      subject: 'biology',
      topicCode: 'B9',
      syllabusRef: 'B9.2',
      question: 'What is the function of valves inside the heart (atrioventricular and semilunar valves)?',
      options: [
        'To ensure blood flows in one direction only and prevent backflow',
        'To oxygenate blood before it enters the aorta',
        'To increase the heart rate during vigorous exercise',
        'To filter bacteria out of blood plasma'
      ],
      correctIndex: 0,
      explanation: 'Heart valves snap shut when pressure behind them drops, ensuring unidirectional blood flow.'
    },
    {
      id: 'cb-b92-3',
      subject: 'biology',
      topicCode: 'B9',
      syllabusRef: 'B9.2',
      question: 'What causes coronary heart disease (CHD)?',
      options: [
        'Blockage or narrowing of the coronary arteries by fatty deposits (atheroma/plaque), starving heart muscle of oxygen',
        'Infection of the pulmonary vein by fungal spores',
        'Overproduction of platelets causing blood pressure to fall to zero',
        'Thickening of the septum between the left and right atria'
      ],
      correctIndex: 0,
      explanation: 'Coronary arteries supply oxygenated blood to heart muscle. Fatty plaques narrow these arteries, reducing oxygen supply for respiration.'
    },
    {
      id: 'cb-b92-4',
      subject: 'biology',
      topicCode: 'B9',
      syllabusRef: 'B9.2',
      question: 'Which set of lifestyle factors increases the risk of developing coronary heart disease?',
      options: [
        'Diet high in saturated fats, smoking, chronic stress, and lack of exercise',
        'Regular aerobic exercise and eating plenty of dietary fibre',
        'Drinking clean water and eating fresh citrus fruits',
        'Getting vaccinated against viral respiratory illnesses'
      ],
      correctIndex: 0,
      explanation: 'High saturated fat, smoking (damages artery linings and lowers oxygen carriage), lack of exercise, and stress are key modifiable CHD risk factors.'
    }
  ],

  'B9.3': [
    {
      id: 'cb-b93-1',
      subject: 'biology',
      topicCode: 'B9',
      syllabusRef: 'B9.3',
      question: 'How is the structure of an artery adapted to carry blood away from the heart at high pressure?',
      options: [
        'Thick walls containing smooth muscle and elastic fibres with a narrow lumen',
        'Thin one-cell-thick walls to allow gas diffusion',
        'Wide lumen with pocket valves along its length',
        'Perforated walls containing sieve plates'
      ],
      correctIndex: 0,
      explanation: 'Thick muscular and elastic walls withstand high pressure pulses and recoil smoothly to keep blood moving forward.'
    },
    {
      id: 'cb-b93-2',
      subject: 'biology',
      topicCode: 'B9',
      syllabusRef: 'B9.3',
      question: 'Why do veins contain pocket valves while arteries do not?',
      options: [
        'Blood in veins flows at low pressure, so valves are needed to prevent backflow towards capillaries',
        'Veins carry blood at higher pressure than arteries',
        'Veins must pump oxygenated blood into the lungs',
        'Valves in veins help speed up diffusion of glucose into muscle cells'
      ],
      correctIndex: 0,
      explanation: 'Blood pressure drops drastically after passing through capillary beds, so low-pressure veins rely on skeletal muscle squeezing and one-way valves.'
    },
    {
      id: 'cb-b93-3',
      subject: 'biology',
      topicCode: 'B9',
      syllabusRef: 'B9.3',
      question: 'Which feature allows capillaries to exchange oxygen, carbon dioxide, and nutrients rapidly with body cells?',
      options: [
        'Walls that are only one cell thick, giving a very short diffusion distance',
        'Thick elastic walls that expand during ventricular systole',
        'Large valves spaced every centimetre',
        'Thick rings of cartilage preventing collapse'
      ],
      correctIndex: 0,
      explanation: 'Single-cell-thick capillary walls and slow blood flow maximise time and surface efficiency for diffusion of substances.'
    },
    {
      id: 'cb-b93-4',
      subject: 'biology',
      topicCode: 'B9',
      syllabusRef: 'B9.3',
      question: 'Which blood vessel brings oxygenated blood back from the lungs directly into the left atrium?',
      options: ['Pulmonary vein', 'Pulmonary artery', 'Vena cava', 'Aorta'],
      correctIndex: 0,
      explanation: 'Veins carry blood towards the heart; the pulmonary vein returns freshly oxygenated blood from the lungs to the left atrium.'
    }
  ],

  'B9.4': [
    {
      id: 'cb-b94-1',
      subject: 'biology',
      topicCode: 'B9',
      syllabusRef: 'B9.4',
      question: 'Which blood component is responsible for transporting dissolved carbon dioxide, glucose, urea, and hormones?',
      options: ['Blood plasma', 'Red blood cells', 'Platelets', 'Phagocytes'],
      correctIndex: 0,
      explanation: 'Plasma is the pale yellow liquid component of blood that transports dissolved solutes, ions, waste (urea, CO₂), nutrients, and heat.'
    },
    {
      id: 'cb-b94-2',
      subject: 'biology',
      topicCode: 'B9',
      syllabusRef: 'B9.4',
      question: 'How do phagocytes defend the body against invading bacterial pathogens?',
      options: [
        'They engulf and digest pathogens inside the cell by phagocytosis',
        'They produce specific Y-shaped antibodies that lock onto antigens',
        'They release fibrin to seal open skin wounds',
        'They carry oxygen using iron-rich haemoglobin'
      ],
      correctIndex: 0,
      explanation: 'Phagocytes have lobed nuclei and flexible membranes to engulf and enzymatically digest pathogens.'
    },
    {
      id: 'cb-b94-3',
      subject: 'biology',
      topicCode: 'B9',
      syllabusRef: 'B9.4',
      question: 'What is the main function of platelets in mammalian blood?',
      options: [
        'Blood clotting to prevent excessive blood loss and block entry of pathogens at wounds',
        'Transporting oxygen from alveoli to respiring muscle cells',
        'Producing antibodies against viral infections',
        'Regulating blood glucose concentration'
      ],
      correctIndex: 0,
      explanation: 'Platelets are cell fragments that initiate blood clotting, converting soluble fibrinogen into an insoluble mesh of fibrin.'
    },
    {
      id: 'cb-b94-4',
      subject: 'biology',
      topicCode: 'B9',
      syllabusRef: 'B9.4',
      question: 'Why does having no nucleus help mammalian red blood cells carry out their function?',
      options: [
        'It leaves more internal space to pack in haemoglobin molecules for oxygen transport',
        'It allows them to divide faster by mitosis inside capillaries',
        'It enables them to squeeze into lymph nodes and produce antibodies',
        'It prevents them from consuming carbon dioxide during respiration'
      ],
      correctIndex: 0,
      explanation: 'Lacking a nucleus maximises room for oxygen-binding haemoglobin, complemented by a biconcave disc shape for large surface area.'
    }
  ],

  'B10.1': [
    {
      id: 'cb-b101-1',
      subject: 'biology',
      topicCode: 'B10',
      syllabusRef: 'B10.1',
      question: 'What is a pathogen?',
      options: [
        'A disease-causing microorganism (such as certain bacteria, viruses, fungi, or protoctists)',
        'A white blood cell that engulfs foreign bacteria',
        'A protein molecule produced by lymphocytes to neutralise toxins',
        'A mechanical barrier such as skin or stomach acid'
      ],
      correctIndex: 0,
      explanation: 'A pathogen is a biological organism or infectious agent (virus, bacterium, fungus, protoctist) that causes transmissible disease.'
    },
    {
      id: 'cb-b101-2',
      subject: 'biology',
      topicCode: 'B10',
      syllabusRef: 'B10.1',
      question: 'Which statement correctly distinguishes passive immunity from active immunity?',
      options: [
        'Active immunity involves the body making its own antibodies and memory cells; passive immunity is short-term protection from ready-made antibodies',
        'Passive immunity lasts for a lifetime because memory cells are injected',
        'Active immunity is only obtained from breast milk and antitoxin injections',
        'Passive immunity stimulates phagocytes to mutate into antibodies'
      ],
      correctIndex: 0,
      explanation: 'Active immunity develops after infection or vaccination and creates memory cells for long-term defence; passive immunity transfers pre-formed antibodies (e.g. across placenta or in breast milk) with no memory cells.'
    },
    {
      id: 'cb-b101-3',
      subject: 'biology',
      topicCode: 'B10',
      syllabusRef: 'B10.1',
      question: 'Which chemical defence in the human digestive tract destroys many swallowed pathogens before they reach the intestine?',
      options: [
        'Hydrochloric acid in the stomach',
        'Amylase secreted in saliva',
        'Bile stored in the gall bladder',
        'Fibrinogen in blood plasma'
      ],
      correctIndex: 0,
      explanation: 'Hydrochloric acid (pH ~2) in gastric juice kills bacteria ingested in food and water. Skin and nasal hairs/mucus act as physical/mechanical barriers.'
    },
    {
      id: 'cb-b101-4',
      subject: 'biology',
      topicCode: 'B10',
      syllabusRef: 'B10.1',
      question: 'Why does a specific antibody only bind to one type of pathogen?',
      options: [
        'The antibody has a specific shape that is complementary only to the antigen on that pathogen',
        'Antibodies only dissolve in blood plasma near the heart',
        'Pathogens carry different charges that repel phagocytes',
        'Lymphocytes can only travel inside arteries'
      ],
      correctIndex: 0,
      explanation: 'Each lymphocyte makes antibodies with an antigen-binding site whose 3D shape fits only its complementary pathogen antigen.'
    },
    {
      id: 'cb-b101-5',
      subject: 'biology',
      topicCode: 'B10',
      syllabusRef: 'B10.1',
      question: 'How can a transmissible disease be spread by indirect transmission?',
      options: [
        'Through contaminated food, drinking water, unwashed hands, air droplets, or animal vectors',
        'Only by direct skin-to-skin contact or exchange of blood',
        'By inheriting defective genes from biological parents',
        'By consuming a diet deficient in vitamin C'
      ],
      correctIndex: 0,
      explanation: 'Indirect transmission passes pathogens via contaminated surfaces, food/water, droplets in air, or biological vectors without direct host-to-host contact.'
    },
    {
      id: 'cb-b101-6',
      subject: 'biology',
      topicCode: 'B10',
      syllabusRef: 'B10.1',
      question: 'How does vaccination protect a large population against an infectious disease?',
      options: [
        'Weakened or dead pathogens stimulate lymphocytes to make antibodies and memory cells, conferring herd immunity',
        'Vaccines inject live antibiotics directly into bone marrow',
        'Vaccines permanently turn skin cells into phagocytes',
        'Vaccines sterilise drinking water supplies around the patient'
      ],
      correctIndex: 0,
      explanation: 'Vaccination triggers a primary immune response creating long-lived memory cells; when most people are immune, transmission chains break (herd immunity).'
    },
    {
      id: 'cb-b101-7',
      subject: 'biology',
      topicCode: 'B10',
      syllabusRef: 'B10.1',
      question: 'Why does chlorination of drinking water supplies reduce the spread of diseases such as cholera?',
      options: [
        'Chlorine kills pathogenic bacteria present in contaminated water before it is consumed',
        'Chlorine thickens the human stomach lining to block bacteria',
        'Chlorine stimulates human lymphocytes to secrete antibodies',
        'Chlorine precipitates dissolved oxygen out of water'
      ],
      correctIndex: 0,
      explanation: 'Treating drinking water with chlorine kills waterborne bacterial pathogens (e.g. Vibrio cholerae), preventing sewage-borne outbreaks.'
    },
    {
      id: 'cb-b101-8',
      subject: 'biology',
      topicCode: 'B10',
      syllabusRef: 'B10.1',
      question: 'Which two barriers are classified as mechanical defences of the human body against pathogens?',
      options: [
        'The skin epidermis and hairs in the nose',
        'Stomach hydrochloric acid and blood plasma',
        'Mucus in the bronchi and antibodies from lymphocytes',
        'Phagocytes in tissue fluid and bile salts'
      ],
      correctIndex: 0,
      explanation: 'Physical/mechanical barriers block pathogen entry (skin, hairs in nose); chemical barriers destroy pathogens chemically (mucus, stomach HCl).'
    }
  ],

  'B11.1': [
    {
      id: 'cb-b111-1',
      subject: 'biology',
      topicCode: 'B11',
      syllabusRef: 'B11.1',
      question: 'Why does the trachea have C-shaped rings of cartilage in its wall?',
      options: [
        'To support the airway and keep it open against pressure changes during breathing',
        'To secrete mucus that traps dust and bacteria',
        'To contract forcefully and push air out during exhalation',
        'To absorb oxygen directly into capillaries in the neck'
      ],
      correctIndex: 0,
      explanation: 'Cartilage rings prevent the trachea from collapsing during inhalation when chest pressure drops, while C-shape allows the oesophagus behind it to expand when swallowing.'
    },
    {
      id: 'cb-b111-2',
      subject: 'biology',
      topicCode: 'B11',
      syllabusRef: 'B11.1',
      question: 'How do goblet cells and ciliated epithelial cells protect the lungs?',
      options: [
        'Goblet cells secrete sticky mucus to trap dust and microbes; cilia sweep the mucus upwards away from the lungs',
        'Ciliated cells engulf bacteria directly by phagocytosis',
        'Goblet cells release hydrochloric acid into the bronchi',
        'Cilia pump oxygen actively into the blood plasma'
      ],
      correctIndex: 0,
      explanation: 'Goblet cells produce mucus that traps inhaled particles and pathogens; beating cilia move this mucus up to the throat to be swallowed.'
    },
    {
      id: 'cb-b111-3',
      subject: 'biology',
      topicCode: 'B11',
      syllabusRef: 'B11.1',
      question: 'What happens to the diaphragm, external intercostal muscles, thorax volume, and pressure during inspiration (breathing in)?',
      options: [
        'Diaphragm and external intercostals contract; ribs move up and out; thorax volume increases and pressure falls below atmospheric pressure',
        'Diaphragm relaxes and domes upwards; ribs drop; thorax volume decreases and pressure rises',
        'Internal intercostals contract strongly; diaphragm relaxes; thorax volume increases',
        'Diaphragm contracts while ribcage moves inwards to compress air into alveoli'
      ],
      correctIndex: 0,
      explanation: 'During inhalation, external intercostals pull ribs up and out and the diaphragm flattens, increasing thoracic volume and lowering air pressure so air rushes in.'
    },
    {
      id: 'cb-b111-4',
      subject: 'biology',
      topicCode: 'B11',
      syllabusRef: 'B11.1',
      question: 'How does the composition of expired (exhaled) air compare with inspired (inhaled) air?',
      options: [
        'Expired air contains less oxygen (~16%), more carbon dioxide (~4%), and is saturated with water vapour',
        'Expired air contains 0% oxygen and 100% carbon dioxide',
        'Expired air contains more oxygen (~21%) and less carbon dioxide (~0.04%)',
        'Expired air contains less water vapour and less nitrogen than inspired air'
      ],
      correctIndex: 0,
      explanation: 'Gas exchange in alveoli removes some oxygen (~21% → 16%), adds carbon dioxide from respiration (~0.04% → 4%), and saturates air with water vapour.'
    },
    {
      id: 'cb-b111-5',
      subject: 'biology',
      topicCode: 'B11',
      syllabusRef: 'B11.1',
      question: 'What is the result of bubbling expired air through clear limewater compared with inspired air?',
      options: [
        'Limewater turns milky (cloudy white) much faster with expired air because it contains about 4% carbon dioxide vs 0.04% in inspired air',
        'Limewater turns brick-red with expired air because of oxygen enrichment',
        'Limewater stays clear with expired air because oxygen is absorbed',
        'Limewater turns blue-black because expired air contains water vapour'
      ],
      correctIndex: 0,
      explanation: 'Carbon dioxide reacts with calcium hydroxide (limewater) to form an insoluble white precipitate of calcium carbonate.'
    },
    {
      id: 'cb-b111-6',
      subject: 'biology',
      topicCode: 'B11',
      syllabusRef: 'B11.1',
      question: 'Why do alveoli have an extremely thin (one-cell-thick) wall and a dense capillary network?',
      options: [
        'To provide a very short diffusion distance and maintain a steep concentration gradient for fast gas exchange',
        'To prevent oxygen from dissolving in moisture lining the lungs',
        'To pump blood back to the left ventricle at high systolic pressure',
        'To allow cilia to sweep nitrogen out of the blood'
      ],
      correctIndex: 0,
      explanation: 'Rapid blood flow through dense capillaries maintains steep O₂ and CO₂ concentration gradients across a 1-cell-thick diffusion barrier.'
    },
    {
      id: 'cb-b111-7',
      subject: 'biology',
      topicCode: 'B11',
      syllabusRef: 'B11.1',
      question: 'How does the breathing rate and depth of breathing change during vigorous physical exercise, and why?',
      options: [
        'Both rate and depth increase to supply more oxygen to muscles and remove increased carbon dioxide',
        'Both rate and depth decrease to conserve glycogen stores',
        'Rate increases while depth falls to zero to prevent water loss',
        'Only breathing depth increases while heart rate drops'
      ],
      correctIndex: 0,
      explanation: 'Rising blood CO₂ levels detected by the brain trigger faster, deeper ventilation so alveoli exchange more O₂ and CO₂ per minute.'
    },
    {
      id: 'cb-b111-8',
      subject: 'biology',
      topicCode: 'B11',
      syllabusRef: 'B11.1',
      question: 'Which air passageway branches directly off the trachea to enter the left and right lungs?',
      options: ['Bronchi', 'Alveoli', 'Diaphragm', 'Oesophagus'],
      correctIndex: 0,
      explanation: 'The trachea splits into two bronchi (one entering each lung), which subdivide into bronchioles ending in alveoli.'
    }
  ],

  'B12.1': [
    {
      id: 'cb-b121-1',
      subject: 'biology',
      topicCode: 'B12',
      syllabusRef: 'B12.1',
      question: 'What is the correct word equation for aerobic respiration?',
      options: [
        'glucose + oxygen → carbon dioxide + water (+ energy released)',
        'carbon dioxide + water → glucose + oxygen',
        'glucose → lactic acid',
        'glucose → alcohol + carbon dioxide'
      ],
      correctIndex: 0,
      explanation: 'Aerobic respiration uses oxygen to completely break down glucose in mitochondria, forming carbon dioxide and water and releasing energy.'
    },
    {
      id: 'cb-b121-2',
      subject: 'biology',
      topicCode: 'B12',
      syllabusRef: 'B12.1',
      question: 'Which statement correctly lists processes in the human body that use energy released by respiration?',
      options: [
        'Muscle contraction, protein synthesis, active transport, and maintaining a constant body temperature',
        'Diffusion of oxygen in alveoli and osmosis in capillaries',
        'Evaporation of sweat and passive movement of water up xylem',
        'Neutralisation of stomach acid by bile'
      ],
      correctIndex: 0,
      explanation: 'Energy from respiration powers muscle contraction, protein synthesis, cell division, active transport, growth, nerve impulses, and thermoregulation.'
    },
    {
      id: 'cb-b121-3',
      subject: 'biology',
      topicCode: 'B12',
      syllabusRef: 'B12.1',
      question: 'Inside which organelle in eukaryotic cells does most aerobic respiration take place?',
      options: ['Mitochondria', 'Chloroplasts', 'Ribosomes', 'Cell wall'],
      correctIndex: 0,
      explanation: 'Mitochondria contain the enzymes for aerobic respiration; active cells like muscle and sperm cells have many mitochondria.'
    },
    {
      id: 'cb-b121-4',
      subject: 'biology',
      topicCode: 'B12',
      syllabusRef: 'B12.1',
      question: 'When germinating seeds respire in a sealed flask connected to a thermometer, what is observed and why?',
      options: [
        'Temperature rises because aerobic respiration releases thermal energy as well as metabolic energy',
        'Temperature falls because germination absorbs heat from the flask',
        'Temperature stays constant because seeds only photosynthesise',
        'Oxygen concentration increases inside the sealed flask'
      ],
      correctIndex: 0,
      explanation: 'Respiring seeds release heat energy into the insulated vacuum flask, raising temperature (unlike boiled dead seeds used as a control).'
    },
    {
      id: 'cb-b121-5',
      subject: 'biology',
      topicCode: 'B12',
      syllabusRef: 'B12.1',
      question: 'Why does aerobic respiration release much more energy per glucose molecule than anaerobic respiration in muscle cells?',
      options: [
        'Aerobic respiration completely breaks down glucose into CO₂ and H₂O, whereas anaerobic respiration only partially breaks down glucose into lactic acid',
        'Anaerobic respiration absorbs energy from ATP rather than releasing it',
        'Aerobic respiration takes place without enzymes inside blood plasma',
        'Lactic acid contains no carbon atoms'
      ],
      correctIndex: 0,
      explanation: 'Because lactic acid still stores significant chemical energy in its bonds, anaerobic respiration releases far less energy per glucose molecule.'
    },
    {
      id: 'cb-b121-6',
      subject: 'biology',
      topicCode: 'B12',
      syllabusRef: 'B12.1',
      question: 'What is the correct chemical symbol equation for aerobic respiration?',
      options: [
        'C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O',
        '6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂',
        'C₆H₁₂O₆ → 2C₂H₅OH + 2CO₂',
        'C₆H₁₂O₆ + 3O₂ → 6CO + 6H₂O'
      ],
      correctIndex: 0,
      explanation: 'One glucose molecule reacts with 6 O₂ molecules to form 6 CO₂ and 6 H₂O molecules.'
    },
    {
      id: 'cb-b121-7',
      subject: 'biology',
      topicCode: 'B12',
      syllabusRef: 'B12.1',
      question: 'Why does an athlete continue to breathe deeply and have an elevated heart rate immediately after a 400 m sprint?',
      options: [
        'To repay the oxygen debt by supplying extra oxygen to break down accumulated lactic acid in the liver',
        'To produce additional ethanol in skeletal muscles',
        'To stop aerobic respiration in the heart muscle',
        'To increase the concentration of glucose in exhaled air'
      ],
      correctIndex: 0,
      explanation: 'After vigorous anaerobic exercise, high breathing and heart rates transport lactic acid to the liver and supply O₂ to aerobically respire/remove it (repaying the oxygen debt).'
    },
    {
      id: 'cb-b121-8',
      subject: 'biology',
      topicCode: 'B12',
      syllabusRef: 'B12.1',
      question: 'Which two products are formed during anaerobic respiration in yeast?',
      options: [
        'Alcohol (ethanol) and carbon dioxide',
        'Lactic acid and oxygen',
        'Carbon dioxide and water only',
        'Starch and glycogen'
      ],
      correctIndex: 0,
      explanation: 'Yeast respires anaerobically via fermentation: glucose → alcohol (ethanol) + carbon dioxide.'
    }
  ],

  'B13.1': [
    {
      id: 'cb-b131-1',
      subject: 'biology',
      topicCode: 'B13',
      syllabusRef: 'B13.1',
      question: 'How does the Cambridge IGCSE 0653 syllabus define a drug?',
      options: [
        'Any substance taken into the body that modifies or affects chemical reactions in the body',
        'Only illegal substances that damage nervous tissue',
        'Any protein molecule produced by lymphocytes to destroy bacteria',
        'Any dietary nutrient needed for cellular respiration'
      ],
      correctIndex: 0,
      explanation: 'By Cambridge definition, a drug is any substance taken into the body that modifies or affects chemical reactions in the body (including antibiotics and medicinal drugs).'
    },
    {
      id: 'cb-b131-2',
      subject: 'biology',
      topicCode: 'B13',
      syllabusRef: 'B13.1',
      question: 'Why are antibiotics ineffective against viral diseases such as measles or influenza?',
      options: [
        'Antibiotics target bacterial cell walls and bacterial metabolism, whereas viruses have no cell walls and replicate inside host cells',
        'Viruses rapidly pump antibiotics out through their cell walls',
        'Viruses live exclusively in blood plasma where antibiotics cannot dissolve',
        'Antibiotics turn viruses into harmless bacteria'
      ],
      correctIndex: 0,
      explanation: 'Viruses lack cellular structures (such as peptidoglycan cell walls and ribosomes) that antibiotics attack.'
    },
    {
      id: 'cb-b131-3',
      subject: 'biology',
      topicCode: 'B13',
      syllabusRef: 'B13.1',
      question: 'How can overuse of antibiotics lead to resistant strains of bacteria such as MRSA?',
      options: [
        'Non-resistant bacteria are killed, allowing bacteria with a random resistant mutation to survive, reproduce, and pass on the resistance',
        'Antibiotics directly force every bacterium to grow a thicker capsule on purpose',
        'Human white blood cells stop attacking bacteria after antibiotic treatment',
        'Viruses transfer antibiotic resistance genes to humans'
      ],
      correctIndex: 0,
      explanation: 'This is natural selection: antibiotics act as a selection pressure killing susceptible bacteria while mutated resistant bacteria survive and multiply.'
    },
    {
      id: 'cb-b131-4',
      subject: 'biology',
      topicCode: 'B13',
      syllabusRef: 'B13.1',
      question: 'Which practice helps minimise the development and spread of antibiotic-resistant bacteria?',
      options: [
        'Using antibiotics only when prescribed for bacterial infections and completing the full course',
        'Taking leftover antibiotics whenever you have a viral cold',
        'Adding high doses of penicillin routinely to animal drinking water',
        'Stopping an antibiotic course as soon as symptoms start to fade'
      ],
      correctIndex: 0,
      explanation: 'Avoiding unnecessary prescriptions (especially for viral infections) and completing the full course prevents partially resistant bacteria from surviving and multiplying.'
    },
    {
      id: 'cb-b131-5',
      subject: 'biology',
      topicCode: 'B13',
      syllabusRef: 'B13.1',
      question: 'What does an antibiotic such as penicillin actually treat?',
      options: [
        'Bacterial infections by killing bacteria or stopping their growth',
        'Viral infections such as the common cold or COVID-19',
        'Genetic disorders such as cystic fibrosis',
        'Dietary deficiency diseases such as scurvy'
      ],
      correctIndex: 0,
      explanation: 'Antibiotics specifically treat bacterial infections by disrupting bacterial cell wall synthesis or bacterial protein production.'
    },
    {
      id: 'cb-b131-6',
      subject: 'biology',
      topicCode: 'B13',
      syllabusRef: 'B13.1',
      question: 'What happens if a patient stops taking prescribed antibiotics early as soon as they feel better?',
      options: [
        'Partially resistant bacteria that were not yet killed survive, reproduce, and increase the proportion of resistant bacteria',
        'All remaining bacteria immediately mutate into harmless viruses',
        'The human liver converts the unused medicine into white blood cells',
        'Antibiotic resistance is permanently eliminated from the body'
      ],
      correctIndex: 0,
      explanation: 'Stopping early leaves behind the toughest, most resistant bacterial cells, allowing them to multiply and pass resistance on.'
    },
    {
      id: 'cb-b131-7',
      subject: 'biology',
      topicCode: 'B13',
      syllabusRef: 'B13.1',
      question: 'In a bacterial population treated repeatedly with the same antibiotic, why does the percentage of resistant bacteria increase over generations?',
      options: [
        'Resistant bacteria have a selective advantage, survive the antibiotic, and pass resistance alleles to their offspring',
        'Antibiotics act as nutrients exclusively for non-resistant bacteria',
        'Human antibodies transfer antibiotic resistance directly to bacteria',
        'Non-resistant bacteria develop immunity without cell division'
      ],
      correctIndex: 0,
      explanation: 'Resistant variants survive antibiotic selection pressure and divide rapidly, increasing resistance frequency in the population.'
    },
    {
      id: 'cb-b131-8',
      subject: 'biology',
      topicCode: 'B13',
      syllabusRef: 'B13.1',
      question: 'Which statement correctly explains why MRSA is dangerous in hospital environments?',
      options: [
        'MRSA is a strain of bacteria that has developed resistance to multiple commonly used antibiotics, making infections hard to treat',
        'MRSA is an airborne virus that destroys red blood cells instantly',
        'MRSA is a toxic chemical found in contaminated hospital water',
        'MRSA is a mutated white blood cell that attacks nerve tissue'
      ],
      correctIndex: 0,
      explanation: 'MRSA (methicillin-resistant Staphylococcus aureus) is an antibiotic-resistant bacterium selected for in environments with frequent antibiotic use.'
    }
  ],

  'B14.1': [
    {
      id: 'cb-b141-1',
      subject: 'biology',
      topicCode: 'B14',
      syllabusRef: 'B14.1',
      question: 'What is pollination in flowering plants?',
      options: [
        'The transfer of pollen grains from an anther to a stigma',
        'The fusion of a male gamete nucleus with an ovule nucleus',
        'The dispersal of ripe seeds away from the parent plant',
        'The growth of a root radicle from a germinating seed'
      ],
      correctIndex: 0,
      explanation: 'Pollination is specifically the transfer of pollen from anther to stigma. Fertilisation occurs later when the male nucleus fuses with the egg nucleus in the ovule.'
    },
    {
      id: 'cb-b141-2',
      subject: 'biology',
      topicCode: 'B14',
      syllabusRef: 'B14.1',
      question: 'Which features are characteristic of an insect-pollinated flower?',
      options: [
        'Large brightly coloured petals, sweet scent, nectar guides, and sticky or spiky pollen inside the flower',
        'No petals, dull green bracts, feathery protruding stigmas, and huge amounts of smooth light pollen',
        'Anthers dangling outside on long flexible filaments without nectaries',
        'Dry dust-like pollen blown exclusively by summer winds'
      ],
      correctIndex: 0,
      explanation: 'Insect-pollinated flowers attract insects using bright petals, scent, and nectar, placing sticky pollen and stigmas where insects brush against them.'
    },
    {
      id: 'cb-b141-3',
      subject: 'biology',
      topicCode: 'B14',
      syllabusRef: 'B14.1',
      question: 'Which three environmental conditions are strictly required for most seeds to germinate?',
      options: [
        'Water, oxygen, and a suitable temperature (warmth)',
        'Sunlight, carbon dioxide, and mineral nitrates',
        'Chlorophyll, soil humus, and wind',
        'Light, low humidity, and freezing winter cold'
      ],
      correctIndex: 0,
      explanation: 'Germinating seeds use stored food reserves and aerobic respiration, requiring water (to activate enzymes), oxygen (for respiration), and suitable temperature (for enzyme activity).'
    },
    {
      id: 'cb-b141-4',
      subject: 'biology',
      topicCode: 'B14',
      syllabusRef: 'B14.1',
      question: 'What is the difference between self-pollination and cross-pollination?',
      options: [
        'Self-pollination transfers pollen within the same flower or plant; cross-pollination transfers pollen to another plant of the same species',
        'Self-pollination happens in wind-pollinated grasses only',
        'Cross-pollination requires two completely different plant species',
        'Self-pollination is a form of asexual vegetative propagation'
      ],
      correctIndex: 0,
      explanation: 'Self-pollination stays on the same plant, whereas cross-pollination transfers pollen from the anther of one plant to the stigma of a different individual of the same species.'
    }
  ],

  'B14.2': [
    {
      id: 'cb-b142-1',
      subject: 'biology',
      topicCode: 'B14',
      syllabusRef: 'B14.2',
      question: 'Where does fertilisation normally take place in the human female reproductive system?',
      options: ['In the oviduct (Fallopian tube)', 'Inside the ovary', 'In the vagina', 'In the cervix'],
      correctIndex: 0,
      explanation: 'Sperm swim through the cervix and uterus into the oviduct, where one sperm nucleus fuses with the egg cell nucleus.'
    },
    {
      id: 'cb-b142-2',
      subject: 'biology',
      topicCode: 'B14',
      syllabusRef: 'B14.2',
      question: 'How is a human sperm cell specially adapted for reaching and fertilising an egg?',
      options: [
        'A flagellum (tail) for swimming, many mitochondria in the mid-piece for energy, and enzymes in the acrosome to digest the egg coat',
        'A large store of yolk lipid and a thick jelly coat',
        'Cilia covering the head to sweep fluid backwards',
        'A cellulose cell wall preventing osmotic bursting'
      ],
      correctIndex: 0,
      explanation: 'Sperm have a streamlined head with acrosome enzymes, mitochondria supplying energy for the flagellum, and a haploid nucleus.'
    },
    {
      id: 'cb-b142-3',
      subject: 'biology',
      topicCode: 'B14',
      syllabusRef: 'B14.2',
      question: 'What is the role of the placenta during pregnancy?',
      options: [
        'Allows diffusion of oxygen and nutrients from maternal blood to fetal blood, and removes carbon dioxide and urea',
        'Mixes maternal red blood cells directly with fetal blood cells',
        'Carries out aerobic digestion of milk proteins for the fetus',
        'Produces sperm and egg cells inside the uterus'
      ],
      correctIndex: 0,
      explanation: 'The placenta separates maternal and fetal bloodstreams while providing a thin, large surface area for exchange of gases, nutrients, and wastes.'
    },
    {
      id: 'cb-b142-4',
      subject: 'biology',
      topicCode: 'B14',
      syllabusRef: 'B14.2',
      question: 'What is the main role of oestrogen during the human menstrual cycle?',
      options: [
        'Repairs and thickens the uterus lining (endometrium) after menstruation',
        'Causes shedding of the uterus lining on day 1',
        'Directly stimulates milk ejection from the mammary glands',
        'Destroys unfertilised sperm cells in the oviduct'
      ],
      correctIndex: 0,
      explanation: 'Oestrogen rises during days 5–14 to rebuild and thicken the vascular uterus lining; progesterone then maintains that lining.'
    }
  ],

  'B15.1': [
    {
      id: 'cb-b151-1',
      subject: 'biology',
      topicCode: 'B15',
      syllabusRef: 'B15.1',
      question: 'What is the principal source of energy input to biological systems on Earth?',
      options: ['The Sun (sunlight)', 'Geothermal heat in the ocean floor', 'Mineral nitrates in soil', 'Atmospheric carbon dioxide'],
      correctIndex: 0,
      explanation: 'Light energy from the Sun is captured by photosynthetic producers and enters food chains as chemical energy.'
    },
    {
      id: 'cb-b151-2',
      subject: 'biology',
      topicCode: 'B15',
      syllabusRef: 'B15.1',
      question: 'Why is energy flow through an ecosystem described as non-cyclical (one-way)?',
      options: [
        'Energy is lost at each trophic level as heat to the surroundings and cannot be reused by plants',
        'Decomposers destroy energy completely so it vanishes from the universe',
        'Carnivores reflect all light energy back into space',
        'Producers only absorb energy once per year'
      ],
      correctIndex: 0,
      explanation: 'Unlike carbon and nitrogen atoms which cycle endlessly, energy enters as sunlight and eventually dissipates into the environment as heat from respiration.'
    },
    {
      id: 'cb-b151-3',
      subject: 'biology',
      topicCode: 'B15',
      syllabusRef: 'B15.1',
      question: 'Which organisms convert light energy into chemical energy stored in organic molecules?',
      options: ['Producers (green plants and algae)', 'Primary consumers (herbivores)', 'Decomposers (saprophytic fungi)', 'Tertiary consumers (apex predators)'],
      correctIndex: 0,
      explanation: 'Producers make their own organic nutrients using light energy via photosynthesis.'
    }
  ],

  'B15.2': [
    {
      id: 'cb-b152-1',
      subject: 'biology',
      topicCode: 'B15',
      syllabusRef: 'B15.2',
      question: 'What do the arrows in a food chain or food web represent?',
      options: [
        'The direction of energy transfer from one organism to the organism that eats it',
        'Which organism hunts the smallest prey',
        'The recycling of carbon dioxide back to the Sun',
        'The order in which organisms evolved'
      ],
      correctIndex: 0,
      explanation: 'Arrows always point from the organism being eaten towards the consumer, showing the flow of energy and biomass.'
    },
    {
      id: 'cb-b152-2',
      subject: 'biology',
      topicCode: 'B15',
      syllabusRef: 'B15.2',
      question: 'Why do food chains rarely have more than four or five trophic levels?',
      options: [
        'Around 90% of energy is lost at each level (via respiration heat, movement, and undigested waste), leaving too little energy to support higher predators',
        'Tertiary consumers cannot digest animal protein efficiently',
        'Producers run out of carbon dioxide after four trophic transfers',
        'Top predators reproduce faster than primary consumers'
      ],
      correctIndex: 0,
      explanation: 'Because only roughly 10% of energy passes from one trophic level to the next, available energy becomes too small beyond the 4th or 5th trophic level.'
    },
    {
      id: 'cb-b152-3',
      subject: 'biology',
      topicCode: 'B15',
      syllabusRef: 'B15.2',
      question: 'In the food chain: Grass → Grasshopper → Frog → Snake, which organism is the secondary consumer?',
      options: ['Frog', 'Grass', 'Grasshopper', 'Snake'],
      correctIndex: 0,
      explanation: 'Grass = producer; Grasshopper = primary consumer; Frog = secondary consumer; Snake = tertiary consumer.'
    },
    {
      id: 'cb-b152-4',
      subject: 'biology',
      topicCode: 'B15',
      syllabusRef: 'B15.2',
      question: 'What is the essential ecological role of decomposers (bacteria and fungi) in a food web?',
      options: [
        'They break down dead organic matter and waste, returning mineral ions to the soil and carbon dioxide to the air',
        'They capture solar energy using chlorophyll in the dark',
        'They hunt top carnivores to control population size',
        'They convert atmospheric nitrogen into fossil fuels'
      ],
      correctIndex: 0,
      explanation: 'Decomposers digest dead organisms and waste products, releasing soluble mineral nutrients for plants and CO₂ via respiration.'
    }
  ],

  'B15.3': [
    {
      id: 'cb-b153-1',
      subject: 'biology',
      topicCode: 'B15',
      syllabusRef: 'B15.3',
      question: 'Which biological process is the only major natural way carbon dioxide is removed from the atmosphere in the carbon cycle?',
      options: ['Photosynthesis', 'Respiration', 'Combustion', 'Decomposition'],
      correctIndex: 0,
      explanation: 'Photosynthesis by green plants and algae absorbs atmospheric CO₂ and locks carbon into organic carbohydrates.'
    },
    {
      id: 'cb-b153-2',
      subject: 'biology',
      topicCode: 'B15',
      syllabusRef: 'B15.3',
      question: 'Which three processes all return carbon dioxide directly into the atmosphere?',
      options: [
        'Respiration (by plants, animals, and decomposers), combustion of fossil fuels, and decomposition',
        'Photosynthesis, feeding, and fossilisation',
        'Transpiration, osmosis, and active transport',
        'Fossilisation, sedimentation, and photosynthesis'
      ],
      correctIndex: 0,
      explanation: 'All living organisms—including plants and decomposers—release CO₂ via respiration, and burning wood or fossil fuels releases CO₂ by combustion.'
    },
    {
      id: 'cb-b153-3',
      subject: 'biology',
      topicCode: 'B15',
      syllabusRef: 'B15.3',
      question: 'How does large-scale deforestation increase atmospheric carbon dioxide concentration?',
      options: [
        'Fewer trees carry out photosynthesis to absorb CO₂, and burning/decaying felled trees releases extra CO₂',
        'Cutting down trees stops cellular respiration in soil animals',
        'Tree stumps release methane that immediately freezes into CO₂',
        'Cleared soil reflects sunlight and causes oceans to boil'
      ],
      correctIndex: 0,
      explanation: 'Deforestation removes major photosynthetic carbon sinks and frequently involves burning timber or accelerated microbial decay.'
    }
  ],

  'B16.1': [
    {
      id: 'cb-b161-1',
      subject: 'biology',
      topicCode: 'B16',
      syllabusRef: 'B16.1',
      question: 'Which human activities are major causes of habitat destruction?',
      options: [
        'Clearing forests for agriculture, livestock grazing, housing, timber extraction, and mining',
        'Establishing national parks and replanting native trees',
        'Practising crop rotation and organic composting',
        'Setting legal fishing quotas and marine reserves'
      ],
      correctIndex: 0,
      explanation: 'Urban development, land clearance for crops/livestock, and resource extraction remove natural habitats and reduce biodiversity.'
    },
    {
      id: 'cb-b161-2',
      subject: 'biology',
      topicCode: 'B16',
      syllabusRef: 'B16.1',
      question: 'What undesirable environmental effects can result from clearing tropical rainforests on steep hillsides?',
      options: [
        'Loss of biodiversity, soil erosion by rain, flooding downstream, and increased atmospheric CO₂',
        'Higher soil fertility and increased annual rainfall',
        'Increase in endangered mammal populations and slower climate warming',
        'Instant conversion of subsoil into fossil coal'
      ],
      correctIndex: 0,
      explanation: 'Without tree roots holding soil and canopies intercepting rain, heavy rainfall washes topsoil into rivers, causing erosion, flooding, extinction, and CO₂ build-up.'
    },
    {
      id: 'cb-b161-3',
      subject: 'biology',
      topicCode: 'B16',
      syllabusRef: 'B16.1',
      question: 'Why does untreated sewage or excess nitrate fertiliser entering a river cause aquatic fish to die (eutrophication)?',
      options: [
        'Algal blooms block light; dead algae are decomposed by aerobic bacteria which multiply and use up dissolved oxygen',
        'Nitrates make the river water acidic enough to dissolve fish scales immediately',
        'Algae release toxic carbon monoxide that suffocates fish on contact',
        'Fertilisers freeze dissolved oxygen into solid crystals'
      ],
      correctIndex: 0,
      explanation: 'Excess nutrients trigger rapid algal growth; when algae die, aerobic decomposers multiply hugely and deplete dissolved oxygen, suffocating fish.'
    }
  ],

  'B16.2': [
    {
      id: 'cb-b162-1',
      subject: 'biology',
      topicCode: 'B16',
      syllabusRef: 'B16.2',
      question: 'What is meant by a sustainable resource in conservation biology?',
      options: [
        'A resource that is produced as rapidly as it is removed from the environment so that it does not run out',
        'A fossil fuel deposit that can be mined using underground shafts',
        'A non-biodegradable plastic polymer buried in landfill sites',
        'An endangered species kept exclusively inside zoos'
      ],
      correctIndex: 0,
      explanation: 'Sustainable management (e.g. replanting timber forests, regulating fish stock quotas) ensures harvest rates never exceed natural regeneration.'
    },
    {
      id: 'cb-b162-2',
      subject: 'biology',
      topicCode: 'B16',
      syllabusRef: 'B16.2',
      question: 'Which methods help conserve endangered species and prevent extinction?',
      options: [
        'Protecting natural habitats, monitoring populations, captive breeding programmes, seed banks, and legal protection',
        'Introducing non-native predators to compete with local wildlife',
        'Draining wetlands to expand monoculture farms',
        'Removing all fishing mesh size limits'
      ],
      correctIndex: 0,
      explanation: 'Effective conservation combines habitat protection, legal enforcement, education, captive breeding, and seed banks.'
    },
    {
      id: 'cb-b162-3',
      subject: 'biology',
      topicCode: 'B16',
      syllabusRef: 'B16.2',
      question: 'How do mesh size regulations help conserve commercial fish stocks sustainably?',
      options: [
        'Larger mesh holes let young, immature fish escape so they can grow and breed before capture',
        'Smaller mesh sizes trap algae so big fish can swim away',
        'Metal mesh traps oxygen bubbles underwater',
        'Fine nets catch only predator sharks'
      ],
      correctIndex: 0,
      explanation: 'Using nets with larger mesh openings allows juvenile fish to escape and reproduce, sustaining future fish populations.'
    }
  ]
};
