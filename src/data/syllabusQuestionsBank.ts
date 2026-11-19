import { QuizQuestion, ScienceSubject } from '../types';
import { allSubtopicsData } from './subtopicSlidesData';
import { getQuizForSubtopic, randomizeQuizQuestions } from './subtopicQuizzes';
import { march2026Paper12Core } from './examPapers/march2026Paper12Core';
import { march2026Paper22Extended } from './examPapers/march2026Paper22Extended';
import { specimen2025Paper2 } from './examPapers/specimen2025Paper2';
import { TOPIC_QUESTION_LIBRARY, generateParametricQuestion } from './topicQuestionLibrary';
import { predefinedSubtopicQuizzes } from './predefinedSubtopicQuizzes';
import { CURATED_BIO_QUESTIONS } from './curatedQuestionsBio';
import { CURATED_CHEM_QUESTIONS } from './curatedQuestionsChem';
import { CURATED_PHY_QUESTIONS } from './curatedQuestionsPhy';
import { isValidQuizQuestion, isExtendedOnlyQuestion, matchesExamTier } from './quizSanitizer';
import { practiceQuizzes } from './quizData';

export interface DynamicTopicMeta {
  code: string;
  subject: ScienceSubject;
  title: string;
  syllabusRef: string;
}

// Master list of all 33 Cambridge IGCSE Combined Science 0653 syllabus topics
export const SYLLABUS_TOPICS_META: Record<string, DynamicTopicMeta> = {
  // BIOLOGY (B1 - B16)
  'B1': { code: 'B1', subject: 'biology', title: 'Characteristics of Living Organisms', syllabusRef: 'B1.1' },
  'B2': { code: 'B2', subject: 'biology', title: 'Cells & Organisation', syllabusRef: 'B2.1' },
  'B3': { code: 'B3', subject: 'biology', title: 'Movement In & Out of Cells', syllabusRef: 'B3.1' },
  'B4': { code: 'B4', subject: 'biology', title: 'Biological Molecules', syllabusRef: 'B4.1' },
  'B5': { code: 'B5', subject: 'biology', title: 'Enzymes', syllabusRef: 'B5.1' },
  'B6': { code: 'B6', subject: 'biology', title: 'Plant Nutrition', syllabusRef: 'B6.1' },
  'B7': { code: 'B7', subject: 'biology', title: 'Human Nutrition', syllabusRef: 'B7.1' },
  'B8': { code: 'B8', subject: 'biology', title: 'Transport in Plants', syllabusRef: 'B8.1' },
  'B9': { code: 'B9', subject: 'biology', title: 'Transport in Animals', syllabusRef: 'B9.1' },
  'B10': { code: 'B10', subject: 'biology', title: 'Diseases & Immunity', syllabusRef: 'B10.1' },
  'B11': { code: 'B11', subject: 'biology', title: 'Gas Exchange in Humans', syllabusRef: 'B11.1' },
  'B12': { code: 'B12', subject: 'biology', title: 'Respiration', syllabusRef: 'B12.1' },
  'B13': { code: 'B13', subject: 'biology', title: 'Drugs', syllabusRef: 'B13.1' },
  'B14': { code: 'B14', subject: 'biology', title: 'Reproduction', syllabusRef: 'B14.1' },
  'B15': { code: 'B15', subject: 'biology', title: 'Organisms & Environment', syllabusRef: 'B15.1' },
  'B16': { code: 'B16', subject: 'biology', title: 'Human Influences on Ecosystems', syllabusRef: 'B16.1' },

  // CHEMISTRY (C1 - C12)
  'C1': { code: 'C1', subject: 'chemistry', title: 'States of Matter', syllabusRef: 'C1.1' },
  'C2': { code: 'C2', subject: 'chemistry', title: 'Atoms, Elements & Compounds', syllabusRef: 'C2.1' },
  'C3': { code: 'C3', subject: 'chemistry', title: 'Stoichiometry', syllabusRef: 'C3.1' },
  'C4': { code: 'C4', subject: 'chemistry', title: 'Electrochemistry & Electrolysis', syllabusRef: 'C4.1' },
  'C5': { code: 'C5', subject: 'chemistry', title: 'Chemical Energetics', syllabusRef: 'C5.1' },
  'C6': { code: 'C6', subject: 'chemistry', title: 'Chemical Reactions & Rates', syllabusRef: 'C6.1' },
  'C7': { code: 'C7', subject: 'chemistry', title: 'Acids, Bases & Salts', syllabusRef: 'C7.1' },
  'C8': { code: 'C8', subject: 'chemistry', title: 'The Periodic Table', syllabusRef: 'C8.1' },
  'C9': { code: 'C9', subject: 'chemistry', title: 'Metals & Reactivity Series', syllabusRef: 'C9.1' },
  'C10': { code: 'C10', subject: 'chemistry', title: 'Chemistry of the Environment', syllabusRef: 'C10.1' },
  'C11': { code: 'C11', subject: 'chemistry', title: 'Organic Chemistry', syllabusRef: 'C11.1' },
  'C12': { code: 'C12', subject: 'chemistry', title: 'Experimental Techniques & Analysis', syllabusRef: 'C12.1' },

  // PHYSICS (P1 - P5)
  'P1': { code: 'P1', subject: 'physics', title: 'Motion, Forces & Energy', syllabusRef: 'P1.1' },
  'P2': { code: 'P2', subject: 'physics', title: 'Thermal Physics', syllabusRef: 'P2.1' },
  'P3': { code: 'P3', subject: 'physics', title: 'Waves, Light & Sound', syllabusRef: 'P3.1' },
  'P4': { code: 'P4', subject: 'physics', title: 'Electricity & Magnetism', syllabusRef: 'P4.1' },
  'P5': { code: 'P5', subject: 'physics', title: 'Space Physics', syllabusRef: 'P5.1' }
};

interface QuestionTemplate {
  stem: string | ((v: any) => string);
  correct: string | ((v: any) => string);
  distractors: string[] | ((v: any) => string[]);
  explanation: string | ((v: any) => string);
  generateVars?: () => any;
  ref?: string;
  tier?: 'Core' | 'Extended';
}

// Comprehensive Question Templates for ALL 33 syllabus topics
export const TOPIC_TEMPLATES: Record<string, QuestionTemplate[]> = {
  // B1 Characteristics of Living Organisms
  'B1': [
    {
      stem: 'Which characteristic of living organisms describes the chemical reactions in cells that break down nutrient molecules to release energy for metabolism?',
      correct: 'Respiration',
      distractors: ['Nutrition', 'Excretion', 'Sensitivity'],
      explanation: 'Respiration is strictly defined as the chemical reactions in cells that break down nutrient molecules and release energy for metabolism. Breathing is ventilation/gas exchange.',
      ref: 'B1.1'
    },
    {
      stem: 'Which of the following correctly defines "excretion" according to Cambridge IGCSE Biology?',
      correct: 'The removal of toxic materials and substances in excess of requirements from organisms',
      distractors: [
        'The passing out of food that has not been digested or absorbed as faeces',
        'The permanent increase in size and dry mass by an increase in cell number',
        'The process that makes more of the same kind of organism'
      ],
      explanation: 'Excretion removes toxic metabolic by-products (e.g. CO2, urea). The expulsion of undigested faeces through the anus is egestion, not excretion.',
      ref: 'B1.1'
    },
    {
      stem: 'A mimosa plant folds its leaves rapidly when touched by an insect. Which two life processes are demonstrated?',
      correct: 'Sensitivity and Movement',
      distractors: ['Nutrition and Respiration', 'Growth and Reproduction', 'Excretion and Nutrition'],
      explanation: 'Detecting the touch is sensitivity (response to environmental stimuli) and the folding movement is movement.',
      ref: 'B1.1'
    }
  ],

  // B2 Cells & Organisation
  'B2': [
    {
      generateVars: () => {
        const actualUm = [10, 20, 25, 40, 50, 80][Math.floor(Math.random() * 6)];
        const mag = [200, 400, 500, 800, 1000, 2000][Math.floor(Math.random() * 6)];
        const imageMm = (actualUm * mag) / 1000;
        return { actualUm, mag, imageMm };
      },
      stem: (v: any) => `A photomicrograph shows an onion epidermal cell with an image length of ${v.imageMm} mm. If the magnification is ×${v.mag}, what is the actual length of the cell?`,
      correct: (v: any) => `${v.actualUm} μm`,
      distractors: (v: any) => [
        `${(v.actualUm * 10).toFixed(0)} μm`,
        `${(v.actualUm / 10).toFixed(1)} μm`,
        `${(v.imageMm * v.mag).toFixed(0)} μm`
      ],
      explanation: (v: any) => `Using Actual size A = Image size I / Magnification M: First convert Image size to μm (${v.imageMm} mm × 1000 = ${v.imageMm * 1000} μm). Then ${v.imageMm * 1000} / ${v.mag} = ${v.actualUm} μm.`,
      ref: 'B2.2',
      tier: 'Extended'
    },
    {
      generateVars: () => {
        const actualMm = [0.05, 0.1, 0.12, 0.15, 0.2, 0.25][Math.floor(Math.random() * 6)];
        const mag = [100, 150, 200, 300, 400][Math.floor(Math.random() * 5)];
        const imageMm = Number((actualMm * mag).toFixed(1));
        return { actualMm, mag, imageMm };
      },
      stem: (v: any) => `A light microscope drawing of a leaf cell has an image length of ${v.imageMm} mm at a magnification of ×${v.mag}. What is the actual length of the cell in millimetres?`,
      correct: (v: any) => `${v.actualMm} mm`,
      distractors: (v: any) => [
        `${Number((v.actualMm * 10).toFixed(2))} mm`,
        `${Number((v.actualMm / 10).toFixed(3))} mm`,
        `${Number((v.imageMm * v.mag).toFixed(1))} mm`
      ],
      explanation: (v: any) => `Using Magnification M = Image size I / Actual size A: Actual size A = ${v.imageMm} mm / ${v.mag} = ${v.actualMm} mm.`,
      ref: 'B2.2',
      tier: 'Core'
    },
    {
      stem: 'Which cell structure is found in plant cells and bacterial cells, but is completely absent in animal cells?',
      correct: 'Cell wall',
      distractors: ['Mitochondria', 'Cell membrane', 'Cytoplasm'],
      explanation: 'Plant cells have a cellulose cell wall and bacterial cells have a peptidoglycan cell wall. Animal cells never have a cell wall.',
      ref: 'B2.1',
      tier: 'Core'
    },
    {
      stem: 'What is the correct hierarchical order of biological organisation from simplest to most complex?',
      correct: 'Cell → Tissue → Organ → Organ system → Organism',
      distractors: [
        'Organelle → Organ → Tissue → Organ system → Cell',
        'Tissue → Cell → Organ → Organ system → Organism',
        'Cell → Organ → Tissue → Organism → Organ system'
      ],
      explanation: 'Cells form tissues, tissues form organs, organs form organ systems, which together constitute the organism.',
      ref: 'B2.1',
      tier: 'Core'
    }
  ],

  // B3 Movement In & Out of Cells
  'B3': [
    {
      stem: 'Which process describes the net movement of oxygen particles from a region of higher concentration in the air spaces of a leaf to a lower concentration inside mesophyll cells?',
      correct: 'Diffusion through the partially permeable cell membrane down a concentration gradient',
      distractors: [
        'Osmosis of dissolved solute molecules from high to low water concentration',
        'Evaporation of oxygen vapour through closed guard cells',
        'Convection of air molecules driven by chlorophyll'
      ],
      explanation: 'Diffusion is the net movement of particles from a region of their higher concentration to a region of their lower concentration as a result of random movement.',
      ref: 'B3.1',
      tier: 'Core'
    },
    {
      stem: 'Fresh strips of potato tissue are placed in pure distilled water for 1 hour. What change is observed in the potato strips?',
      correct: 'They gain mass and become firmer because water enters the cells by osmosis',
      distractors: [
        'They lose mass because starch dissolves out of the potato cells',
        'They shrink and soften because water moves out into the distilled water',
        'Their mass stays unchanged because distilled water cannot cross cell membranes'
      ],
      explanation: 'Water diffuses by osmosis through partially permeable membranes from the dilute distilled water outside into the more concentrated cell sap, making the strips heavier and firmer.',
      ref: 'B3.2',
      tier: 'Core'
    },
    {
      stem: 'Potato strips placed in a concentrated sucrose solution (high solute concentration) decrease in mass and become limp. What causes this?',
      correct: 'Water moves out of the potato cells by osmosis down a water potential gradient',
      distractors: [
        'Sugar molecules diffuse rapidly into the potato cells',
        'Water enters the potato cells by active transport requiring ATP',
        'Cell walls dissolve due to low water potential'
      ],
      explanation: 'The external solution has a lower water potential than the cell sap. Water moves out across the partially permeable cell membrane by osmosis, causing cells to become plasmolysed/flaccid.',
      ref: 'B3.2',
      tier: 'Extended'
    },
    {
      stem: 'Which statement correctly distinguishes active transport from diffusion?',
      correct: 'Active transport moves particles against a concentration gradient using energy from respiration',
      distractors: [
        'Active transport is a passive process that requires no energy from ATP',
        'Active transport only involves the movement of pure water molecules',
        'Diffusion requires specific carrier proteins and cellular respiration'
      ],
      explanation: 'Active transport moves particles from low to high concentration using energy released by respiration and carrier proteins in the membrane.',
      ref: 'B3.3',
      tier: 'Extended'
    }
  ],

  // B4 Biological Molecules
  'B4': [
    {
      stem: 'Which reagent and observation confirms the presence of reducing sugars (such as glucose) in a solution?',
      correct: 'Benedict’s solution heated in a water bath; blue colour turns brick-red precipitate',
      distractors: [
        'Iodine solution at room temperature; brown turns blue-black',
        'Biuret reagent; pale blue turns lilac/purple',
        'Ethanol emulsion test; clear solution turns cloudy white'
      ],
      explanation: 'Benedict\'s reagent heated above 80 °C with reducing sugars changes from blue to green, yellow, orange, and finally brick-red precipitate.',
      ref: 'B4.1'
    },
    {
      stem: 'A sample of crushed seed is shaken with ethanol and then decanted into cold water. A milky-white emulsion appears. What does this confirm?',
      correct: 'Fats / Lipids are present',
      distractors: ['Proteins are present', 'Starch is present', 'Vitamin C is present'],
      explanation: 'Lipids dissolve in ethanol but are insoluble in water, forming tiny droplets that scatter light as a milky-white emulsion.',
      ref: 'B4.1'
    }
  ],

  // B5 Enzymes
  'B5': [
    {
      stem: 'Why does the rate of an enzyme-catalysed reaction rapidly decrease to zero when the temperature is raised above 65 °C?',
      correct: 'The enzyme denatures as excessive thermal energy alters the 3D shape of its active site',
      distractors: [
        'Substrate molecules lose all kinetic energy and stop colliding',
        'The enzyme active site contracts and locks permanently onto the substrate',
        'The reaction becomes endothermic and absorbs all available ATP'
      ],
      explanation: 'Excess thermal energy breaks hydrogen and intermolecular bonds maintaining the active site conformation, causing denaturation so the substrate no longer fits.',
      ref: 'B5.1'
    },
    {
      stem: 'Which statement accurately describes the "lock and key" hypothesis of enzyme action?',
      correct: 'The substrate has a complementary shape that fits into the enzyme active site',
      distractors: [
        'Any substrate molecule can bind to any enzyme active site',
        'The enzyme active site permanently changes into product molecules',
        'Enzymes are consumed during the reaction and locked in the product'
      ],
      explanation: 'In the lock and key model, the active site is the lock and the substrate is the key with a precise complementary 3D shape.',
      ref: 'B5.1'
    }
  ],

  // B6 Plant Nutrition
  'B6': [
    {
      stem: 'What is the correct balanced symbol equation for photosynthesis in Cambridge IGCSE 0653?',
      correct: '6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂',
      distractors: [
        'C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O',
        '6CO₂ + 12H₂O → C₆H₁₂O₆ + 6O₂ + 6H₂O',
        'CO₂ + H₂O → CH₂O + O₂'
      ],
      explanation: 'Photosynthesis synthesises glucose from carbon dioxide and water using light trapped by chlorophyll: 6CO2 + 6H2O -> C6H12O6 + 6O2.',
      ref: 'B6.1'
    },
    {
      stem: 'Which leaf tissue is located directly beneath the upper epidermis and contains the highest density of chloroplasts for maximum light absorption?',
      correct: 'Palisade mesophyll',
      distractors: ['Spongy mesophyll', 'Lower epidermis', 'Xylem vessels'],
      explanation: 'Palisade mesophyll cells are vertically elongated, tightly packed, and rich in chloroplasts to absorb maximal incident light.',
      ref: 'B6.2'
    }
  ],

  // B7 Human Nutrition
  'B7': [
    {
      stem: 'In the human digestive system, where is bile produced and what is its primary digestive function?',
      correct: 'Produced in the liver; neutralises stomach acid and emulsifies fats to increase surface area for lipase',
      distractors: [
        'Produced in the gall bladder; chemically digests starch into glucose',
        'Produced in the pancreas; denatures stomach pepsin and breaks down proteins',
        'Produced in the stomach; secretes hydrochloric acid to digest fibre'
      ],
      explanation: 'Bile is produced by the liver, stored in the gall bladder, and released into the duodenum to neutralise acidic chyme and emulsify fats into tiny droplets.',
      ref: 'B7.1'
    },
    {
      stem: 'Which digestive enzyme functions optimally in the acidic environment (pH 1.5–2.0) of the human stomach?',
      correct: 'Pepsin (protease)',
      distractors: ['Salivary amylase', 'Pancreatic lipase', 'Maltase'],
      explanation: 'Pepsin is an endopeptidase secreted in gastric juice that functions optimally in acidic conditions maintained by hydrochloric acid.',
      ref: 'B7.1'
    },
    {
      stem: 'Which nutrient deficiency causes scurvy (bleeding gums and poor wound healing)?',
      correct: 'Vitamin C',
      distractors: ['Vitamin D', 'Iron', 'Calcium'],
      explanation: 'Vitamin C (ascorbic acid) is essential for collagen synthesis; deficiency results in scurvy.',
      ref: 'B7.1'
    }
  ],

  // B8 Transport in Plants
  'B8': [
    {
      stem: 'Which vascular tissue transports water and dissolved mineral ions upward from roots to leaves via the transpiration stream?',
      correct: 'Xylem vessels (dead, hollow lignified tubes)',
      distractors: [
        'Phloem sieve tubes (translocation of sucrose and amino acids)',
        'Cortex parenchyma cells',
        'Pith spongy cells'
      ],
      explanation: 'Xylem consists of hollow, dead lignified cells that carry water and minerals upwards in a continuous transpiration stream.',
      ref: 'B8.1'
    },
    {
      stem: 'Which environmental combination causes the highest rate of transpiration in a leafy shoot?',
      correct: 'High temperature, low humidity, high wind speed, bright light',
      distractors: [
        'Low temperature, high humidity, calm air, darkness',
        'High temperature, high humidity, no wind, bright light',
        'Low temperature, low humidity, high wind speed, darkness'
      ],
      explanation: 'Transpiration increases with higher temperature (greater kinetic energy), lower humidity (steeper water vapour gradient), wind (removes humid boundary layer), and light (opens stomata).',
      ref: 'B8.2'
    }
  ],

  // B9 Transport in Animals
  'B9': [
    {
      stem: 'Which blood vessel carries oxygenated blood from the lungs into the left atrium of the human heart?',
      correct: 'Pulmonary vein',
      distractors: ['Pulmonary artery', 'Vena cava', 'Aorta'],
      explanation: 'Pulmonary veins carry oxygenated blood from the lungs to the left atrium. The pulmonary artery carries deoxygenated blood to the lungs.',
      ref: 'B9.1'
    },
    {
      stem: 'Why do arteries have thicker walls with more elastic fibres and smooth muscle than veins of the same external diameter?',
      correct: 'To withstand and maintain the high, pulsing blood pressure generated by heart ventricles',
      distractors: [
        'To prevent blood from flowing backwards towards capillary beds',
        'Because arteries contain valves that require thick muscular support',
        'To facilitate rapid diffusion of oxygen directly across artery walls'
      ],
      explanation: 'Arterial walls must withstand high, pulsating pressure directly pumped from the left and right ventricles without rupturing.',
      ref: 'B9.2'
    }
  ],

  // B10 Diseases & Immunity
  'B10': [
    {
      stem: 'What is a direct mechanical barrier that prevents pathogens from entering the human body?',
      correct: 'Intact skin and hairs inside the nose trapping dust and microorganisms',
      distractors: [
        'Hydrochloric acid inside the stomach destroying swallowed bacteria',
        'Red blood cells carrying oxygen around the circulatory system',
        'Digestive breakdown of starch inside the mouth'
      ],
      explanation: 'Skin and nasal hairs act as physical/mechanical barriers against pathogen entry; mucus and stomach hydrochloric acid act as chemical barriers.',
      ref: 'B10.1',
      tier: 'Core'
    },
    {
      stem: 'Which term describes a disease in which the pathogen can be passed from one infected host to another?',
      correct: 'A transmissible disease',
      distractors: [
        'A nutritional deficiency disease',
        'A genetic condition',
        'An allergic reaction'
      ],
      explanation: 'A transmissible disease is a disease in which the pathogen can be passed from one host to another via direct contact (e.g. blood) or indirect contact (e.g. contaminated surfaces, food, water, or air droplets).',
      ref: 'B10.1',
      tier: 'Core'
    },
    {
      stem: 'Why are antibiotics like penicillin effective against bacterial infections but completely ineffective against viral diseases like influenza or COVID-19?',
      correct: 'Antibiotics target bacterial cell structures (such as cell walls and bacterial ribosomes) which viruses lack',
      distractors: [
        'Viruses are too small for antibiotic molecules to detect',
        'Antibiotics only work in alkaline body environments',
        'Viruses produce enzymes that destroy antibiotic molecules instantly'
      ],
      explanation: 'Viruses do not possess cell walls, ribosomes, or their own metabolic machinery—they replicate inside host cells, so bacterial targets do not exist in viruses.',
      ref: 'B10.1',
      tier: 'Core'
    },
    {
      stem: 'How does vaccination provide long-term active immunity against a pathogen?',
      correct: 'Harmless antigens stimulate lymphocytes to produce antibodies and long-lived memory cells',
      distractors: [
        'Vaccines supply ready-made antibodies that circulate in blood forever',
        'Vaccines destroy all bacteria in the bloodstream by phagocytosis',
        'Vaccines alter human DNA to prevent pathogen entry'
      ],
      explanation: 'Antigens in the vaccine trigger a primary immune response, generating memory cells that produce antibodies rapidly upon future infection.',
      ref: 'B10.1',
      tier: 'Extended'
    }
  ],

  // B11 Gas Exchange in Humans
  'B11': [
    {
      stem: 'Which adaptation of human alveoli ensures a rapid rate of gas diffusion between alveolar air and capillary blood?',
      correct: 'Extremely thin walls (one cell thick) providing a short diffusion pathway',
      distractors: [
        'Thick muscular walls to pump gases across the capillary membrane',
        'Dry epithelial surface to avoid water droplets obstructing pores',
        'Low blood supply to keep capillary pressure low'
      ],
      explanation: 'Alveoli have single-cell-thick epithelial walls, a vast surface area, a moist lining, and extensive capillary networks ensuring rapid Fickian diffusion.',
      ref: 'B11.1'
    },
    {
      stem: 'During human inhalation (breathing in), what are the actions of the diaphragm and external intercostal muscles?',
      correct: 'Diaphragm contracts and flattens; external intercostal muscles contract pulling ribs up and out',
      distractors: [
        'Diaphragm relaxes and domes upward; external intercostals relax',
        'Diaphragm contracts; external intercostals relax pulling ribs down and in',
        'Diaphragm relaxes; internal intercostals contract pulling ribs upward'
      ],
      explanation: 'During inhalation, the diaphragm contracts and moves downwards, and external intercostals contract, raising the ribcage and lowering thoracic pressure.',
      ref: 'B11.2'
    }
  ],

  // B12 Respiration
  'B12': [
    {
      stem: 'What is the balanced symbol equation for aerobic respiration in human cells?',
      correct: 'C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O',
      distractors: [
        'C₆H₁₂O₆ + O₂ → CO₂ + H₂O',
        '2C₆H₁₂O₆ + 6O₂ → 6CO₂ + 12H₂O',
        '6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂'
      ],
      explanation: 'Aerobic respiration uses oxygen to fully oxidise glucose into carbon dioxide and water, releasing energy stored in ATP.',
      ref: 'B12.1'
    },
    {
      stem: 'Which of the following is an example of an organism using energy released from respiration?',
      correct: 'Muscle contraction, protein synthesis, cell division, and maintaining body temperature',
      distractors: [
        'Osmosis of water down a water potential gradient',
        'Diffusion of oxygen into red blood cells in alveoli',
        'Passive movement of carbon dioxide through stomata'
      ],
      explanation: 'Active biological processes requiring ATP energy include muscle contraction, protein synthesis, cell division, and temperature maintenance in endotherms.',
      ref: 'B12.1'
    }
  ],

  // B13 Drugs
  'B13': [
    {
      stem: 'According to the Cambridge 0653 syllabus, what is the precise scientific definition of a drug?',
      correct: 'Any substance taken into the body that modifies or affects chemical reactions in the body',
      distractors: [
        'Any synthetic chemical manufactured in a laboratory to kill bacterial pathogens',
        'A nutrient that provides energy and raw materials for growth and repair',
        'A substance produced exclusively by white blood cells to neutralize antigens'
      ],
      explanation: 'A drug is defined as any substance taken into the body that modifies or affects chemical reactions in the body.',
      ref: 'B13.1'
    },
    {
      stem: 'Why do antibiotics such as penicillin kill bacteria but have no therapeutic effect against viral infections such as influenza?',
      correct: 'Antibiotics target bacterial cell walls and cell processes; viruses lack cell walls and reproduce inside host human cells',
      distractors: [
        'Viruses are too small to be detected by the immune system or antibiotics',
        'Antibiotics only function in blood plasma whereas viruses live only in red blood cells',
        'Viruses rapidly produce antitoxins that break down antibiotic molecules'
      ],
      explanation: 'Antibiotics disrupt bacterial cell walls or metabolic processes. Viruses lack cellular structures and host their replication inside human cells.',
      ref: 'B13.1'
    },
    {
      stem: 'How does the overuse or premature termination of antibiotic treatments lead to the development of resistant strains such as MRSA?',
      correct: 'Random mutations produce resistant bacteria, which survive antibiotic exposure and reproduce without competition (natural selection)',
      distractors: [
        'The antibiotic directly alters human DNA so antibodies no longer attack bacteria',
        'Bacteria become accustomed to the taste of the antibiotic and metabolize it for energy',
        'Viruses transfer resistance genes directly into human red blood cells'
      ],
      explanation: 'Natural selection: surviving resistant bacteria with random mutations replicate and pass on resistance genes when antibiotics are overused or courses left unfinished.',
      ref: 'B13.1'
    }
  ],

  // B14 Reproduction
  'B14': [
    {
      stem: 'What are the three essential environmental conditions required for non-dormant seeds to germinate?',
      correct: 'Water, Oxygen, and suitable Warmth (temperature)',
      distractors: [
        'Light, Carbon dioxide, and Soil fertiliser',
        'Water, Carbon dioxide, and Chlorophyll',
        'Oxygen, Darkness, and Acidic soil'
      ],
      explanation: 'Seed germination requires WOW: Water (activates enzymes), Oxygen (aerobic respiration), and Warmth (optimum enzyme kinetic rate). Light is not required for most seeds.',
      ref: 'B14.2'
    },
    {
      stem: 'Which feature distinguishes insect-pollinated flowers from wind-pollinated flowers?',
      correct: 'Brightly coloured petals, scented nectaries, and sticky spiky pollen grains',
      distractors: [
        'Feathery pendulous stigmas hanging outside the flower and smooth light pollen',
        'Dull green petals with no scent and vast quantities of lightweight airborne pollen',
        'Absence of stamens and anthers'
      ],
      explanation: 'Insect-pollinated flowers attract pollinators with bright petals, scent, and nectar, and produce sticky pollen to adhere to insect bodies.',
      ref: 'B14.1'
    }
  ],

  // B15 Organisms & Environment
  'B15': [
    {
      stem: 'What is the principal source of energy input to biological ecosystems according to Cambridge 0653?',
      correct: 'Sunlight / Solar energy',
      distractors: ['Geothermal heat from Earth’s core', 'Chemical energy in fossil fuels', 'Nutrients absorbed from soil'],
      explanation: 'The Sun is the principal source of energy input to biological systems; light energy is captured by producers via photosynthesis.',
      ref: 'B15.1'
    },
    {
      stem: 'Which biological process removes carbon dioxide from the atmosphere in the carbon cycle?',
      correct: 'Photosynthesis by green plants and algae',
      distractors: ['Respiration by animals and plants', 'Combustion of fossil fuels', 'Decomposition by bacteria and fungi'],
      explanation: 'Photosynthesis is the only biological process that takes in carbon dioxide from the atmosphere to produce carbohydrates.',
      ref: 'B15.3'
    }
  ],

  // B16 Ecosystems & Environment
  'B16': [
    {
      stem: 'In a typical food chain, what proportion of total energy is typically transferred from one trophic level to the next?',
      correct: 'Approximately 10% (the remaining 90% is lost through heat, respiration, and excretion)',
      distractors: [
        'Approximately 50%',
        'Approximately 90%',
        '100% due to the law of conservation of energy'
      ],
      explanation: 'Roughly 10% of energy is passed to the next level; ~90% is lost via respiration, heat, unconsumed parts, and metabolic waste.',
      ref: 'B16.1'
    },
    {
      stem: 'Which environmental issue is directly exacerbated by extensive deforestation of tropical rainforests?',
      correct: 'Increased atmospheric carbon dioxide concentration and enhanced global warming',
      distractors: [
        'Immediate reduction in greenhouse effect due to cooling timber',
        'Depletion of the stratospheric ozone layer by cellulose emissions',
        'Decreased soil erosion and stabilisation of local river levels'
      ],
      explanation: 'Trees absorb CO2 during photosynthesis. Burning and decomposing felled trees releases stored carbon, increasing atmospheric CO2.',
      ref: 'B16.2'
    }
  ],

  // CHEMISTRY (C1 - C12)
  // C1 States of Matter
  'C1': [
    {
      stem: 'What occurs during the boiling of a pure substance at its normal boiling point?',
      correct: 'Temperature remains constant as thermal energy breaks intermolecular attractions between liquid particles',
      distractors: [
        'Temperature increases rapidly as particles gain kinetic energy',
        'Intramolecular covalent bonds within molecules break down into free atoms',
        'Particles lose kinetic energy and become stationary'
      ],
      explanation: 'During a phase change, heat input (latent heat of vaporisation) overcomes intermolecular forces without increasing temperature.',
      ref: 'C1.1'
    },
    {
      stem: 'In terms of kinetic particle theory, why do gases diffuse faster than liquids at the same temperature?',
      correct: 'Gas particles have much higher average speeds and large spaces between particles with negligible intermolecular forces',
      distractors: [
        'Gas particles have much greater mass than liquid particles',
        'Liquid particles collide with each other less frequently',
        'Gas particles only move in a single fixed direction'
      ],
      explanation: 'Gas particles move rapidly in random directions and are far apart, allowing rapid spreading into empty spaces.',
      ref: 'C1.1'
    }
  ],

  // C2 Atoms, Elements & Compounds
  'C2': [
    {
      generateVars: () => {
        const elements = [
          { name: 'Sodium', symbol: 'Na', Z: 11, config: '2, 8, 1' },
          { name: 'Magnesium', symbol: 'Mg', Z: 12, config: '2, 8, 2' },
          { name: 'Aluminium', symbol: 'Al', Z: 13, config: '2, 8, 3' },
          { name: 'Silicon', symbol: 'Si', Z: 14, config: '2, 8, 4' },
          { name: 'Phosphorus', symbol: 'P', Z: 15, config: '2, 8, 5' },
          { name: 'Sulfur', symbol: 'S', Z: 16, config: '2, 8, 6' },
          { name: 'Chlorine', symbol: 'Cl', Z: 17, config: '2, 8, 7' },
          { name: 'Argon', symbol: 'Ar', Z: 18, config: '2, 8, 8' },
          { name: 'Potassium', symbol: 'K', Z: 19, config: '2, 8, 8, 1' },
          { name: 'Calcium', symbol: 'Ca', Z: 20, config: '2, 8, 8, 2' }
        ];
        return elements[Math.floor(Math.random() * elements.length)];
      },
      stem: (v: any) => `What is the correct electronic configuration of an atom of ${v.name} (atomic number ${v.Z})?`,
      correct: (v: any) => v.config,
      distractors: (v: any) => [
        `2, ${v.Z - 2}`,
        `2, 8, ${v.Z}`,
        `8, 2, ${Math.max(1, v.Z - 10)}`
      ],
      explanation: (v: any) => `Electrons fill shells: up to 2 in shell 1, up to 8 in shell 2, up to 8 in shell 3. For ${v.name} (Z = ${v.Z}), configuration is ${v.config}.`,
      ref: 'C2.1'
    },
    {
      stem: 'Why do giant ionic lattice compounds (such as sodium chloride) conduct electricity when molten or aqueous, but NOT in the solid state?',
      correct: 'In molten/aqueous state, ions are free to move and carry charge; in solid state, ions are locked in fixed lattice positions',
      distractors: [
        'In solid state, free delocalised electrons cannot penetrate the lattice',
        'In molten state, neutral chlorine atoms carry electric charge',
        'Solid sodium chloride consists of neutral molecules with no charges'
      ],
      explanation: 'Ionic conductivity requires mobile charge carriers. In solids, ions are held by strong electrostatic bonds; when melted or dissolved, ions move freely.',
      ref: 'C2.2'
    }
  ],

  // C3 Stoichiometry
  'C3': [
    {
      stem: 'What is the correct balanced symbol equation for the complete combustion of propane gas (C₃H₈)?',
      correct: 'C₃H₈ + 5O₂ → 3CO₂ + 4H₂O',
      distractors: [
        'C₃H₈ + 3O₂ → 3CO₂ + 4H₂',
        '2C₃H₈ + 7O₂ → 6CO₂ + 8H₂O',
        'C₃H₈ + O₂ → 3C + 4H₂O'
      ],
      explanation: '3 carbons produce 3CO2 (requires 6 O atoms). 8 hydrogens produce 4H2O (requires 4 O atoms). Total oxygen atoms = 10, requiring 5O2.',
      ref: 'C3.1'
    },
    {
      stem: 'What is the chemical formula of iron(III) oxide?',
      correct: 'Fe₂O₃',
      distractors: ['FeO', 'Fe₃O₂', 'Fe₃O₄'],
      explanation: 'Iron(III) has ion Fe³⁺ and oxide is O²⁻. Balancing charges requires 2 × Fe³⁺ (+6) and 3 × O²⁻ (-6) = Fe2O3.',
      ref: 'C3.1'
    }
  ],

  // C4 Electrochemistry & Electrolysis
  'C4': [
    {
      stem: 'In the electrolysis of concentrated aqueous sodium chloride (brine) using inert carbon electrodes, what products are formed at the cathode and anode?',
      correct: 'Cathode (-): Hydrogen gas (H₂); Anode (+): Chlorine gas (Cl₂)',
      distractors: [
        'Cathode (-): Sodium metal (Na); Anode (+): Oxygen gas (O₂)',
        'Cathode (-): Chlorine gas (Cl₂); Anode (+): Sodium metal (Na)',
        'Cathode (-): Oxygen gas (O₂); Anode (+): Hydrogen gas (H₂)'
      ],
      explanation: 'At the cathode, H⁺ is less reactive than Na⁺ and discharges as H2. At the anode, halide Cl⁻ is preferentially discharged over OH⁻ to produce Cl2.',
      ref: 'C4.1'
    },
    {
      stem: 'During the electrolysis of molten lead(II) bromide (PbBr₂), what observation is made at the positive anode?',
      correct: 'Red-brown pungent vapour of bromine gas (Br₂) is evolved',
      distractors: [
        'A shiny bead of silvery molten lead metal forms',
        'Colourless gas that relights a glowing splint is formed',
        'White crystalline solid deposits on the electrode'
      ],
      explanation: 'Bromide ions (Br⁻) are attracted to the positive anode and oxidised: 2Br⁻ → Br2 + 2e⁻, releasing brown bromine vapour.',
      ref: 'C4.1'
    }
  ],

  // C5 Chemical Energetics
  'C5': [
    {
      stem: 'A student dissolves ammonium nitrate crystals in a beaker of water and observes that the thermometer reading drops from 22 °C to 15 °C. How should this reaction be classified?',
      correct: 'Endothermic, because thermal energy is taken in from the surroundings',
      distractors: [
        'Exothermic, because thermal energy is transferred to the surroundings',
        'Neutralisation, because the salt dissolves completely in water',
        'Catalytic, because the thermometer temperature fell rapidly'
      ],
      explanation: 'An endothermic reaction absorbs thermal energy from the surroundings, causing the temperature of the solution/surroundings to decrease.',
      ref: 'C5.1',
      tier: 'Core'
    },
    {
      stem: 'When dilute hydrochloric acid is added to magnesium ribbon in a test tube, the mixture fizzes and the thermometer rises from 20 °C to 38 °C. Why did the temperature increase?',
      correct: 'It is an exothermic reaction that transfers thermal energy to the surroundings',
      distractors: [
        'It is an endothermic reaction that absorbs thermal energy from the room',
        'Hydrogen gas released friction heat against the glass walls',
        'Magnesium dissolved without any chemical energy change'
      ],
      explanation: 'Exothermic reactions transfer thermal energy to the surroundings, causing the temperature measured in the reaction mixture to increase.',
      ref: 'C5.1',
      tier: 'Core'
    },
    {
      stem: 'Which of the following chemical processes is always an exothermic reaction?',
      correct: 'Complete combustion of methane gas in oxygen',
      distractors: [
        'Thermal decomposition of calcium carbonate by strong heating',
        'Photosynthesis in green plant leaves using sunlight',
        'Evaporation of liquid ethanol on the skin'
      ],
      explanation: 'Combustion reactions release thermal energy to the surroundings (increasing temperature), making them exothermic.',
      ref: 'C5.1',
      tier: 'Core'
    },
    {
      stem: 'Which statement accurately describes an exothermic chemical reaction in terms of bond energies and temperature change?',
      correct: 'Energy released during bond formation is greater than energy absorbed breaking bonds; temperature of surroundings rises',
      distractors: [
        'Energy absorbed breaking bonds is greater than energy released forming bonds; temperature falls',
        'No bonds are broken during an exothermic reaction; enthalpy change ΔH is positive',
        'Activation energy is negative and thermal energy is absorbed from surroundings'
      ],
      explanation: 'Bond breaking is endothermic; bond making is exothermic. If energy released by bond making exceeds energy taken to break bonds, ΔH is negative (exothermic) and temperature increases.',
      ref: 'C5.1',
      tier: 'Extended'
    }
  ],

  // C6 Chemical Reactions & Rates
  'C6': [
    {
      stem: 'Why does increasing the surface area of a solid reactant (e.g. using marble powder instead of chips) increase the rate of reaction?',
      correct: 'More particles are exposed, leading to a higher frequency of collisions with reactant particles',
      distractors: [
        'Particles gain higher individual kinetic energy and collide with greater force',
        'The activation energy Ea of the chemical reaction is significantly lowered',
        'The equilibrium constant shifts towards products'
      ],
      explanation: 'Dividing a solid exposes more surface particles to collisions per second (higher collision frequency), without changing particle kinetic energy.',
      ref: 'C6.1'
    },
    {
      stem: 'How does a catalyst increase the rate of a chemical reaction without being consumed?',
      correct: 'It provides an alternative reaction pathway with a lower activation energy',
      distractors: [
        'It increases the temperature of reacting particles internally',
        'It increases the concentration of reacting molecules',
        'It changes the overall enthalpy change ΔH of the reaction'
      ],
      explanation: 'A catalyst offers an alternative route requiring lower activation energy (Ea), allowing a greater fraction of collisions to be successful.',
      ref: 'C6.1'
    }
  ],

  // C7 Acids, Bases & Salts
  'C7': [
    {
      stem: 'Which experimental procedure should be used to prepare a pure, dry sample of copper(II) sulfate crystals from sulfuric acid?',
      correct: 'Add excess copper(II) oxide to warm dilute sulfuric acid, filter off excess oxide, and gently evaporate filtrate to crystallisation point',
      distractors: [
        'Titrate dilute sulfuric acid with copper metal using phenolphthalein indicator',
        'Mix copper(II) chloride solution with sodium sulfate solution and collect precipitate',
        'Heat copper metal wire with concentrated sulfuric acid in an evaporating basin'
      ],
      explanation: 'Copper does not react with dilute acid, so an insoluble base (CuO) in excess is used, filtered, and crystallised.',
      ref: 'C7.1'
    },
    {
      stem: 'What type of oxide is sulfur dioxide (SO₂), and what is its effect on damp blue litmus paper?',
      correct: 'Acidic oxide; turns damp blue litmus paper red',
      distractors: [
        'Basic oxide; turns damp red litmus paper blue',
        'Amphoteric oxide; has no effect on litmus',
        'Neutral oxide; bleaches litmus paper white'
      ],
      explanation: 'Non-metal oxides like SO2 are acidic; in moisture they form sulfurous acid (H2SO3) which turns blue litmus red.',
      ref: 'C7.2'
    }
  ],

  // C8 The Periodic Table
  'C8': [
    {
      stem: 'What trend is observed as you descend Group 1 (the alkali metals) from lithium to caesium?',
      correct: 'Reactivity with water increases, while melting point and boiling point decrease',
      distractors: [
        'Reactivity with water decreases, while density and melting point increase',
        'Valence electron number increases from 1 to 7',
        'Atoms become smaller with stronger electrostatic hold on outer electrons'
      ],
      explanation: 'Down Group 1, atomic radius increases and outer electron is further from the nucleus with more shielding, making it easier to lose (more reactive). Metallic bonding weakens, lowering melting points.',
      ref: 'C8.1'
    },
    {
      stem: 'What observation is made when chlorine gas is bubbled into a solution of colourless potassium iodide (KI)?',
      correct: 'Solution turns reddish-brown as chlorine displaces iodide to form iodine (I₂)',
      distractors: [
        'A white precipitate of potassium chloride forms immediately',
        'Solution remains colourless because iodide is more reactive than chlorine',
        'Dense purple fumes of iodine gas erupt and solidify on walls'
      ],
      explanation: 'Chlorine is more reactive than iodine and displaces iodide ions: Cl2 + 2KI → 2KCl + I2 (aq), producing brown aqueous iodine.',
      ref: 'C8.2'
    }
  ],

  // C9 Metals & Reactivity Series
  'C9': [
    {
      stem: 'In the blast furnace for the extraction of iron, what is the principal reducing agent that reduces iron(III) oxide (Fe₂O₃) to molten iron?',
      correct: 'Carbon monoxide gas (CO)',
      distractors: [
        'Limestone (calcium carbonate, CaCO₃)',
        'Calcium silicate slag (CaSiO₃)',
        'Carbon dioxide gas (CO₂)'
      ],
      explanation: 'Coke reacts with oxygen to form CO2, which reacts with more hot coke to form CO: Fe2O3 + 3CO → 2Fe + 3CO2.',
      ref: 'C9.1'
    },
    {
      stem: 'Why is aluminium extracted by the electrolysis of molten aluminium oxide (in molten cryolite) rather than reduction with carbon?',
      correct: 'Aluminium is more reactive than carbon, so carbon cannot reduce aluminium oxide',
      distractors: [
        'Aluminium oxide reacts explosively with carbon powder',
        'Reduction with carbon produces toxic cyanide compounds',
        'Aluminium has a lower melting point than carbon'
      ],
      explanation: 'In the reactivity series, aluminium is above carbon, so carbon cannot displace aluminium from its oxide.',
      ref: 'C9.2'
    }
  ],

  // C10 Chemistry of the Environment
  'C10': [
    {
      stem: 'Which test chemically confirms the presence of water, and which test verifies its purity?',
      correct: 'Presence: turns anhydrous copper(II) sulfate from white to blue; Purity: sharp boiling point at exactly 100 °C at 1 atm',
      distractors: [
        'Presence: turns cobalt(II) chloride paper from pink to blue; Purity: pH = 7',
        'Presence: sharp boiling point at 100 °C; Purity: absence of bacteria',
        'Presence: conducts electricity; Purity: clear colourless appearance'
      ],
      explanation: 'Anhydrous CuSO4 (white to blue) tests for water. Fixed physical constants (boiling point 100 °C and freezing point 0 °C) confirm purity.',
      ref: 'C10.1'
    },
    {
      stem: 'What are the percentage proportions of nitrogen and oxygen in clean, dry air?',
      correct: 'Approximately 78% Nitrogen, 21% Oxygen',
      distractors: [
        'Approximately 50% Nitrogen, 50% Oxygen',
        'Approximately 21% Nitrogen, 78% Oxygen',
        'Approximately 70% Nitrogen, 28% Oxygen, 2% Carbon dioxide'
      ],
      explanation: 'Clean dry air contains ~78% N2, ~21% O2, ~0.9% Argon, and ~0.04% CO2.',
      ref: 'C10.2'
    }
  ],

  // C11 Organic Chemistry
  'C11': [
    {
      stem: 'What is observed when an unsaturated hydrocarbon (such as ethene C₂H₄) is shaken with orange/brown bromine water?',
      correct: 'The bromine water rapidly decolourises (turns from orange-brown to colourless)',
      distractors: [
        'The solution turns deep purple with evolution of hydrogen gas',
        'A white precipitate of poly(ethene) settles at the bottom',
        'No change occurs because alkenes are unreactive at room temperature'
      ],
      explanation: 'Alkenes have a C=C double bond that undergoes addition with bromine across the double bond, decolourising bromine water.',
      ref: 'C11.1'
    },
    {
      stem: 'Which process breaks long-chain alkane molecules into shorter, more useful alkanes and alkenes using high temperature and a catalyst?',
      correct: 'Catalytic cracking',
      distractors: ['Fractional distillation', 'Addition polymerisation', 'Complete combustion'],
      explanation: 'Cracking thermal decomposition splits long-chain hydrocarbons over hot catalyst into shorter fuels and alkenes.',
      ref: 'C11.2'
    }
  ],

  // C12 Experimental Techniques & Analysis
  'C12': [
    {
      stem: 'In qualitative analysis, an unknown solution produces a green precipitate with aqueous sodium hydroxide (NaOH) that remains insoluble in excess. What cation is present?',
      correct: 'Iron(II) ion (Fe²⁺)',
      distractors: ['Iron(III) ion (Fe³⁺)', 'Copper(II) ion (Cu²⁺)', 'Zinc ion (Zn²⁺)'],
      explanation: 'Fe²⁺ produces a dirty green precipitate of Fe(OH)2. Fe³⁺ gives a red-brown precipitate; Cu²⁺ gives light blue.',
      ref: 'C12.1'
    },
    {
      stem: 'Which gas turns damp red litmus paper blue and produces dense white smoke when held near concentrated hydrochloric acid vapour?',
      correct: 'Ammonia (NH₃)',
      distractors: ['Chlorine (Cl₂)', 'Carbon dioxide (CO₂)', 'Sulfur dioxide (SO₂)'],
      explanation: 'Ammonia is alkaline gas, turning red litmus blue and reacting with HCl vapour to form ammonium chloride smoke: NH3 + HCl → NH4Cl.',
      ref: 'C12.2'
    }
  ],

  // PHYSICS (P1 - P5)
  // P1 Motion, Forces & Energy
  'P1': [
    {
      generateVars: () => {
        const u = 0;
        const v = [12, 16, 20, 24, 30, 36][Math.floor(Math.random() * 6)];
        const t = [4, 5, 6, 8, 10, 12][Math.floor(Math.random() * 6)];
        const a = Number((v / t).toFixed(2));
        const s = Number((0.5 * v * t).toFixed(1));
        return { u, v, t, a, s };
      },
      stem: (v: any) => `A vehicle accelerates uniformly from rest to a speed of ${v.v} m/s in ${v.t} seconds. What is its acceleration and the distance travelled during this time?`,
      correct: (v: any) => `Acceleration = ${v.a} m/s², Distance = ${v.s} m`,
      distractors: (v: any) => [
        `Acceleration = ${(v.a * 2).toFixed(2)} m/s², Distance = ${(v.s * 2).toFixed(1)} m`,
        `Acceleration = ${v.a} m/s², Distance = ${(v.v * v.t).toFixed(1)} m`,
        `Acceleration = ${(v.v / 2).toFixed(2)} m/s², Distance = ${v.s} m`
      ],
      explanation: (v: any) => `Acceleration a = (v - u) / t = ${v.v} / ${v.t} = ${v.a} m/s². Distance = area under speed-time graph = 0.5 × base × height = 0.5 × ${v.t} × ${v.v} = ${v.s} m.`,
      ref: 'P1.1'
    },
    {
      generateVars: () => {
        const mass = [2.5, 4.0, 5.0, 8.0, 10.0, 15.0][Math.floor(Math.random() * 6)];
        const g = 9.8;
        const weight = Number((mass * g).toFixed(1));
        return { mass, weight };
      },
      stem: (v: any) => `An instrument package has a mass of ${v.mass} kg. On Earth where g = 9.8 N/kg, what is its weight, and what would its mass be on the Moon?`,
      correct: (v: any) => `Weight on Earth = ${v.weight} N; Mass on Moon = ${v.mass} kg`,
      distractors: (v: any) => [
        `Weight on Earth = ${(v.weight / 6).toFixed(1)} N; Mass on Moon = ${(v.mass / 6).toFixed(2)} kg`,
        `Weight on Earth = ${v.mass} N; Mass on Moon = ${v.weight} kg`,
        `Weight on Earth = ${(v.mass * 10).toFixed(0)} N; Mass on Moon = 0 kg`
      ],
      explanation: (v: any) => `Weight W = m × g = ${v.mass} × 9.8 = ${v.weight} N. Mass is the quantity of matter and does not change when moved to the Moon (${v.mass} kg).`,
      ref: 'P1.2'
    },
    {
      generateVars: () => {
        const mass = [2, 4, 5, 8, 10][Math.floor(Math.random() * 5)];
        const speed = [4, 6, 8, 10, 12][Math.floor(Math.random() * 5)];
        const ke = 0.5 * mass * speed * speed;
        return { mass, speed, ke };
      },
      stem: (v: any) => `What is the kinetic energy of a runner of mass ${v.mass}0 kg moving at a constant velocity of ${v.speed} m/s?`,
      correct: (v: any) => `${v.ke * 10} J`,
      distractors: (v: any) => [
        `${v.mass * 10 * v.speed} J`,
        `${(v.ke * 5).toFixed(0)} J`,
        `${(v.ke * 20).toFixed(0)} J`
      ],
      explanation: (v: any) => `Kinetic Energy Ek = 1/2 × m × v² = 0.5 × ${v.mass * 10} × (${v.speed})² = ${v.ke * 10} J.`,
      ref: 'P1.4'
    }
  ],

  // P2 Thermal Physics
  'P2': [
    {
      stem: 'Why do metals conduct thermal energy much more rapidly than non-metallic solids such as wood or plastic?',
      correct: 'Metals possess delocalised free electrons that transfer kinetic energy rapidly through collisions with lattice ions',
      distractors: [
        'Metals expand into liquids when heated',
        'Metals emit high frequency infrared radiation internally',
        'Metal atoms undergo convection currents within the solid lattice'
      ],
      explanation: 'In metals, conduction occurs both by lattice ion vibrations and by mobile delocalised electrons diffusing through the structure.',
      ref: 'P2.1'
    },
    {
      stem: 'Which surface is the best absorber and the best emitter of infrared thermal radiation?',
      correct: 'Dull, matte black surface',
      distractors: [
        'Shiny, polished silver surface',
        'Glossy white surface',
        'Transparent glass surface'
      ],
      explanation: 'Matte black surfaces are the best absorbers and best emitters of IR radiation. Shiny silver surfaces are good reflectors and poor emitters.',
      ref: 'P2.2'
    }
  ],

  // P3 Waves, Light & Sound
  'P3': [
    {
      generateVars: () => {
        const speeds = [300, 330, 340, 1500];
        const freqs = [100, 200, 500, 1000, 2000];
        const v = speeds[Math.floor(Math.random() * speeds.length)];
        const f = freqs[Math.floor(Math.random() * freqs.length)];
        const lambda = Number((v / f).toFixed(2));
        return { v, f, lambda };
      },
      stem: (v: any) => `A sound wave travels through a medium at ${v.v} m/s with a frequency of ${v.f} Hz. What is its wavelength?`,
      correct: (v: any) => `${v.lambda} m`,
      distractors: (v: any) => [
        `${(v.lambda * 10).toFixed(1)} m`,
        `${(v.v * v.f).toLocaleString()} m`,
        `${(v.lambda / 2).toFixed(2)} m`
      ],
      explanation: (v: any) => `Using the wave equation v = f × λ: λ = v / f = ${v.v} / ${v.f} = ${v.lambda} m.`,
      ref: 'P3.1'
    },
    {
      stem: 'Which electromagnetic waves have the highest frequency and shortest wavelength in the EM spectrum?',
      correct: 'Gamma rays',
      distractors: ['Radio waves', 'Microwaves', 'Ultraviolet waves'],
      explanation: 'The EM spectrum in order of increasing frequency and decreasing wavelength: Radio → Micro → Infrared → Visible → Ultraviolet → X-ray → Gamma.',
      ref: 'P3.2'
    },
    {
      stem: 'What is the audible frequency range for normal human hearing?',
      correct: '20 Hz to 20,000 Hz (20 kHz)',
      distractors: ['2 Hz to 200 Hz', '200 Hz to 200,000 Hz', '20 kHz to 2 MHz'],
      explanation: 'Humans hear sound frequencies between 20 Hz and 20 kHz. Frequencies above 20 kHz are ultrasound.',
      ref: 'P3.3'
    }
  ],

  // P4 Electricity & Magnetism
  'P4': [
    {
      generateVars: () => {
        const r1 = [6, 10, 12, 20][Math.floor(Math.random() * 4)];
        const r2 = r1; // equal parallel resistors
        const rTotal = r1 / 2;
        const voltage = [12, 24][Math.floor(Math.random() * 2)];
        const current = Number((voltage / rTotal).toFixed(1));
        return { r1, r2, rTotal, voltage, current };
      },
      stem: (v: any) => `Two identical ${v.r1} Ω resistors are connected in parallel across a ${v.voltage} V DC battery. What is the combined total resistance and total current drawn?`,
      correct: (v: any) => `Combined Resistance = ${v.rTotal} Ω; Total Current = ${v.current} A`,
      distractors: (v: any) => [
        `Combined Resistance = ${v.r1 * 2} Ω; Total Current = ${(v.voltage / (v.r1 * 2)).toFixed(2)} A`,
        `Combined Resistance = ${v.r1} Ω; Total Current = ${(v.voltage / v.r1).toFixed(1)} A`,
        `Combined Resistance = ${(v.rTotal / 2).toFixed(1)} Ω; Total Current = ${(v.current * 2).toFixed(1)} A`
      ],
      explanation: (v: any) => `For two parallel resistors: 1/R = 1/${v.r1} + 1/${v.r2} = 2/${v.r1} → R = ${v.rTotal} Ω. Current I = V / R = ${v.voltage} / ${v.rTotal} = ${v.current} A.`,
      ref: 'P4.2'
    },
    {
      generateVars: () => {
        const voltage = 230;
        const current = [2, 5, 8, 10][Math.floor(Math.random() * 4)];
        const power = voltage * current;
        const mins = 10;
        const energy = power * mins * 60;
        return { voltage, current, power, mins, energy };
      },
      stem: (v: any) => `An electrical kettle plugged into a ${v.voltage} V mains socket draws a current of ${v.current} A. What is its power rating and the energy transferred in ${v.mins} minutes?`,
      correct: (v: any) => `Power = ${v.power} W; Energy = ${(v.energy / 1000).toLocaleString()} kJ`,
      distractors: (v: any) => [
        `Power = ${v.power} W; Energy = ${(v.power * v.mins).toLocaleString()} J`,
        `Power = ${(v.power / 2).toFixed(0)} W; Energy = ${(v.energy / 100).toLocaleString()} J`,
        `Power = ${(v.voltage / v.current).toFixed(1)} W; Energy = ${v.energy.toLocaleString()} kJ`
      ],
      explanation: (v: any) => `Power P = V × I = ${v.voltage} × ${v.current} = ${v.power} W. Energy E = P × t = ${v.power} W × (${v.mins} × 60 s) = ${v.energy} J = ${v.energy / 1000} kJ.`,
      ref: 'P4.3'
    }
  ],

  // P5 Space Physics
  'P5': [
    {
      stem: 'Which nuclear reaction powers the core of the Sun and main sequence stars, releasing vast amounts of energy?',
      correct: 'Nuclear fusion of light hydrogen nuclei into helium nuclei',
      distractors: [
        'Gravitational friction between orbiting gas giant planets',
        'Chemical combustion of hydrogen gas in solar oxygen',
        'Thermal convection currents passing through the asteroid belt'
      ],
      explanation: 'In the core of the Sun, hydrogen nuclei fuse into helium at extreme temperature and pressure, releasing energy.',
      ref: 'P5.2.1'
    },
    {
      stem: 'What observation of light emitted from distant galaxies provides evidence that the Universe is expanding (Big Bang theory)?',
      correct: 'Light is red-shifted to longer wavelengths, with more distant galaxies showing greater redshift',
      distractors: [
        'Light is blue-shifted to shorter wavelengths as galaxies move closer to Earth',
        'Light slows down below 3.0 × 10⁸ m/s as it leaves the Milky Way',
        'All distant stars appear bright green due to ozone absorption'
      ],
      explanation: 'Space itself is expanding, stretching the wavelength of light from receding galaxies toward the red end of the spectrum (redshift). More distant galaxies recede faster and show greater redshift.',
      ref: 'P5.2.3'
    },
    {
      stem: 'Which evolutionary sequence correctly describes the life cycle of a low-mass star like our Sun after leaving the main sequence?',
      correct: 'Red giant → planetary nebula + white dwarf',
      distractors: [
        'Red supergiant → supernova → black hole',
        'Protostar → neutron star → asteroid belt',
        'Main sequence → supernova → red dwarf'
      ],
      explanation: 'A Sun-sized star runs out of hydrogen in its core, expands into a red giant, sheds its outer gas layers as a planetary nebula, and leaves behind a dense white dwarf.',
      ref: 'P5.2.2'
    }
  ]
};

/**
 * Helper to calculate fair, even integer quotas across a list of selected topics.
 * Guarantees difference between any two selected topics is at most 1 question.
 */
export function calculateTopicQuotas(topics: string[], totalCount: number): Map<string, number> {
  const quotas = new Map<string, number>();
  if (!topics || topics.length === 0 || totalCount <= 0) return quotas;

  const K = topics.length;
  // If requested count is less than or equal to topic count, pick totalCount distinct topics
  if (totalCount <= K) {
    // Preserve topic order but distribute 1 to each of the first totalCount topics
    for (let i = 0; i < K; i++) {
      quotas.set(topics[i], i < totalCount ? 1 : 0);
    }
    return quotas;
  }

  const base = Math.floor(totalCount / K);
  const remainder = totalCount % K;

  for (let i = 0; i < K; i++) {
    quotas.set(topics[i], base + (i < remainder ? 1 : 0));
  }
  return quotas;
}

/**
 * Generate a set of unique dynamic syllabus questions for the selected topics.
 * GUARANTEES AN EVEN PROPORTION OF QUESTIONS ACROSS ALL CHOSEN TOPICS
 * AND ZERO REPEAT QUESTIONS WITHIN THE PRACTICE QUIZ.
 *
 * Tier semantics:
 * - 'Core': STRICTLY Core syllabus objectives only (Paper 1 Core level; excludes all Supplement-only content).
 * - 'Extended': Entire syllabus — BOTH Core and Extended (Supplement) syllabus objectives (Paper 1 + Paper 2).
 */
export function generateDynamicSyllabusQuestions(
  topics: string[],
  count: number,
  tier: string = 'Extended',
  seed: string = ''
): QuizQuestion[] {
  const safeCount = Math.min(40, Math.max(1, count));
  const rawTopics = topics.length > 0 ? topics : Object.keys(SYLLABUS_TOPICS_META);
  const uniqueToken = seed || `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const globalSeenStems = new Set<string>();

  const normalizeStem = (text: string) => text.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();

  // Support parent topics ("B1"), specific subtopics ("B1.1"), or mixed selections evenly
  const activeTopicCodes = rawTopics.length > 0 ? Array.from(new Set(rawTopics)) : Object.keys(SYLLABUS_TOPICS_META);

  // 1. Calculate the exact, fair quota for each chosen topic/subtopic (even distribution)
  const topicQuotas = calculateTopicQuotas(activeTopicCodes, safeCount);

  // 2. Prepare official exam papers pool & curriculum tier
  const normTier = (tier || 'Extended').trim().toLowerCase();
  const isCoreOnly = normTier === 'core' || normTier === 'foundation';
  const effectiveTier: 'Core' | 'Extended' = isCoreOnly ? 'Core' : 'Extended';

  // Core includes strictly Paper 1 Core; Extended includes the full syllabus (Paper 1 Core + Paper 2 Extended)
  const candidateExamPapers = isCoreOnly
    ? [march2026Paper12Core]
    : [march2026Paper22Extended, specimen2025Paper2, march2026Paper12Core];

  const shuffleArray = <T,>(arr: T[]): T[] => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  // Map to store gathered questions per topic bucket
  const topicBuckets = new Map<string, QuizQuestion[]>();
  for (const code of activeTopicCodes) {
    topicBuckets.set(code, []);
  }

  // 3. Collect tier-eligible candidates for each topicCode, shuffle/mix, then satisfy quota
  for (const topicCode of activeTopicCodes) {
    const quota = topicQuotas.get(topicCode) || 0;
    if (quota <= 0) continue;

    const isExactSubtopic = topicCode.includes('.');
    const parentCode = isExactSubtopic ? topicCode.split('.')[0].toUpperCase() : topicCode.toUpperCase();
    const meta = SYLLABUS_TOPICS_META[parentCode] || SYLLABUS_TOPICS_META['B1'];

    const poolCandidates: QuizQuestion[] = [];
    const localSeen = new Set<string>();

    const pushCandidate = (q: QuizQuestion) => {
      if (!isValidQuizQuestion(q)) return;
      if (!matchesExamTier(q, effectiveTier)) return;
      const norm = normalizeStem(q.question);
      if (norm.length < 15 || globalSeenStems.has(norm) || localSeen.has(norm)) return;
      localSeen.add(norm);
      poolCandidates.push({
        ...q,
        tier: isExtendedOnlyQuestion(q) ? 'Extended' : (q.tier || 'Core')
      });
    };

    // 3a. Sourced from TOPIC_TEMPLATES
    const templates = TOPIC_TEMPLATES[parentCode] || [];
    for (let tIdx = 0; tIdx < templates.length; tIdx++) {
      const template = templates[tIdx];
      if (isCoreOnly && template.tier === 'Extended') continue;
      if (isExactSubtopic && template.ref && template.ref.toUpperCase() !== topicCode.toUpperCase()) continue;
      const iterations = template.generateVars ? 3 : 1;
      for (let v = 0; v < iterations; v++) {
        const vars = template.generateVars ? template.generateVars() : null;
        const stem = typeof template.stem === 'function' ? template.stem(vars) : template.stem;
        const correctAns = typeof template.correct === 'function' ? template.correct(vars) : template.correct;
        const distractors = typeof template.distractors === 'function' ? template.distractors(vars) : template.distractors;
        const explanation = typeof template.explanation === 'function' ? template.explanation(vars) : template.explanation;

        const rawOptions = [correctAns, ...distractors.slice(0, 3)];
        const shuffled = shuffleArray(rawOptions);
        const correctIndex = shuffled.indexOf(correctAns);

        pushCandidate({
          id: `tpl-${parentCode.toLowerCase()}-${uniqueToken}-${tIdx}-${v}`,
          subject: meta.subject,
          topicCode: parentCode,
          topicTitle: meta.title,
          syllabusRef: template.ref || meta.syllabusRef,
          tier: template.tier,
          question: stem,
          options: shuffled,
          correctIndex: correctIndex >= 0 ? correctIndex : 0,
          explanation
        });
      }
    }

    // 3b. Sourced from Curated Banks & TOPIC_QUESTION_LIBRARY
    const curatedSources: Record<string, QuizQuestion[]>[] = [
      predefinedSubtopicQuizzes,
      CURATED_BIO_QUESTIONS,
      CURATED_CHEM_QUESTIONS,
      CURATED_PHY_QUESTIONS
    ];
    for (const bank of curatedSources) {
      for (const [k, list] of Object.entries(bank)) {
        const matches = isExactSubtopic
          ? k.toUpperCase() === topicCode.toUpperCase()
          : k.toUpperCase().startsWith(`${parentCode}.`);
        if (!matches) continue;
        for (let idx = 0; idx < list.length; idx++) {
          const cq = list[idx];
          pushCandidate({
            ...cq,
            topicCode: parentCode,
            topicTitle: meta.title,
            id: `cur-${k.toLowerCase()}-${uniqueToken}-${idx + 1}`
          });
        }
      }
    }

    const topicLib = TOPIC_QUESTION_LIBRARY[parentCode] || [];
    for (let idx = 0; idx < topicLib.length; idx++) {
      const tq = topicLib[idx];
      if (isExactSubtopic && tq.syllabusRef && tq.syllabusRef.toUpperCase() !== topicCode.toUpperCase()) continue;
      pushCandidate({
        ...tq,
        topicCode: parentCode,
        topicTitle: meta.title,
        id: `lib-${parentCode.toLowerCase()}-${uniqueToken}-${idx + 1}`
      });
    }

    // 3c. Sourced from Cambridge examination papers
    for (const paper of candidateExamPapers) {
      for (const q of paper.questions) {
        const qTopic = q.syllabusCode ? q.syllabusCode.split('.')[0].toUpperCase() : '';
        const matches = isExactSubtopic
          ? q.syllabusCode?.toUpperCase() === topicCode.toUpperCase()
          : qTopic === parentCode;
        if (matches && q.options && q.options.length === 4) {
          const optTexts = q.options.map(opt => typeof opt === 'string' ? opt : (opt as any).text);
          const letter = q.correctAnswer || 'A';
          const correctIdx = ['A', 'B', 'C', 'D'].indexOf(letter);

          pushCandidate({
            id: `exam-${q.id}-${uniqueToken}`,
            subject: q.subject,
            topicCode: parentCode,
            topicTitle: meta.title,
            syllabusRef: q.syllabusCode,
            tier: paper.tier === 'Extended' ? 'Extended' : 'Core',
            question: q.questionText,
            options: optTexts,
            correctIndex: correctIdx >= 0 ? correctIdx : 0,
            explanation: q.explanation || `Correct answer is Option ${letter}. Sourced from official Cambridge IGCSE 0653 ${paper.tier} Multiple Choice examination.`
          });
        }
      }
    }

    // 3d. Sourced from clean subtopics engine (tier-filtered)
    const matchingSubtopics = allSubtopicsData.filter(s =>
      isExactSubtopic
        ? s.subtopicCode.toUpperCase() === topicCode.toUpperCase()
        : (s.topicCode === parentCode || s.subtopicCode.startsWith(`${parentCode}.`))
    );
    for (const sub of matchingSubtopics) {
      const subQuiz = getQuizForSubtopic(sub.subtopicCode, { count: 12, tier: effectiveTier });
      for (let idx = 0; idx < subQuiz.length; idx++) {
        const q = subQuiz[idx];
        pushCandidate({
          ...q,
          topicCode: parentCode,
          topicTitle: meta.title,
          id: `sub-${sub.subtopicCode.toLowerCase()}-${uniqueToken}-${idx + 1}`
        });
      }
    }

    // 3e. Formula parametric variations ONLY for formula-based topics (B2, C3, P1, P3, P4, P5)
    if (['B2', 'C3', 'P1', 'P3', 'P4', 'P5'].includes(parentCode)) {
      const baseSeed = Math.floor(Math.random() * 100);
      for (let paramCounter = 1; paramCounter <= 10; paramCounter++) {
        const paramQ = generateParametricQuestion(
          parentCode,
          isExactSubtopic ? topicCode : `${parentCode}.1`,
          baseSeed + paramCounter,
          effectiveTier
        );
        if (paramQ) {
          pushCandidate({
            ...paramQ,
            topicTitle: meta.title,
            id: `param-${parentCode.toLowerCase()}-${uniqueToken}-${paramCounter}`
          });
        }
      }
    }

    // 3f. Graceful parent fallback if an exact Supplement-only subtopic (e.g. B3.3) was queried in Core mode
    if (isExactSubtopic && isCoreOnly && poolCandidates.length < quota) {
      const fallbackTopicLib = TOPIC_QUESTION_LIBRARY[parentCode] || [];
      for (let idx = 0; idx < fallbackTopicLib.length && poolCandidates.length < quota * 2; idx++) {
        pushCandidate({
          ...fallbackTopicLib[idx],
          topicCode: parentCode,
          topicTitle: meta.title,
          id: `lib-fb-${parentCode.toLowerCase()}-${uniqueToken}-${idx + 1}`
        });
      }
      for (let tIdx = 0; tIdx < templates.length && poolCandidates.length < quota * 2; tIdx++) {
        const template = templates[tIdx];
        if (template.tier === 'Extended') continue;
        const vars = template.generateVars ? template.generateVars() : null;
        const stem = typeof template.stem === 'function' ? template.stem(vars) : template.stem;
        const correctAns = typeof template.correct === 'function' ? template.correct(vars) : template.correct;
        const distractors = typeof template.distractors === 'function' ? template.distractors(vars) : template.distractors;
        const explanation = typeof template.explanation === 'function' ? template.explanation(vars) : template.explanation;
        const rawOptions = [correctAns, ...distractors.slice(0, 3)];
        const shuffled = shuffleArray(rawOptions);
        pushCandidate({
          id: `tpl-fb-${parentCode.toLowerCase()}-${uniqueToken}-${tIdx}`,
          subject: meta.subject,
          topicCode: parentCode,
          topicTitle: meta.title,
          syllabusRef: template.ref || meta.syllabusRef,
          tier: template.tier,
          question: stem,
          options: shuffled,
          correctIndex: Math.max(0, shuffled.indexOf(correctAns)),
          explanation
        });
      }
    }

    // Shuffle candidates so repeated attempts & Core vs Extended provide fresh coverage;
    // for Extended, ensure both Core and Extended candidates are interleaved when both exist.
    let orderedCandidates = shuffleArray(poolCandidates);
    if (!isCoreOnly) {
      const corePool = orderedCandidates.filter(q => q.tier !== 'Extended');
      const extPool = orderedCandidates.filter(q => q.tier === 'Extended');
      if (corePool.length > 0 && extPool.length > 0) {
        const mixed: QuizQuestion[] = [];
        const maxLen = Math.max(corePool.length, extPool.length);
        for (let i = 0; i < maxLen; i++) {
          if (i < extPool.length) mixed.push(extPool[i]);
          if (i < corePool.length) mixed.push(corePool[i]);
        }
        orderedCandidates = mixed;
      }
    }

    const bucket = topicBuckets.get(topicCode) || [];
    for (const candidate of orderedCandidates) {
      if (bucket.length >= quota) break;
      const norm = normalizeStem(candidate.question);
      if (globalSeenStems.has(norm)) continue;
      globalSeenStems.add(norm);
      bucket.push(candidate);
    }
    topicBuckets.set(topicCode, bucket);
  }

  // 4. Interleave questions round-robin across chosen topics for perfectly even progression
  const finalInterleaved: QuizQuestion[] = [];
  const maxBucketLen = Math.max(0, ...Array.from(topicBuckets.values()).map(b => b.length));

  for (let r = 0; r < maxBucketLen; r++) {
    for (const code of activeTopicCodes) {
      const bucket = topicBuckets.get(code);
      if (bucket && r < bucket.length) {
        finalInterleaved.push(bucket[r]);
        if (finalInterleaved.length >= safeCount) break;
      }
    }
    if (finalInterleaved.length >= safeCount) break;
  }

  return randomizeQuizQuestions(finalInterleaved.slice(0, safeCount));
}

export interface VaultCrateQuestion {
  id: string;
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
  subject: ScienceSubject;
}

let cachedPracticeVaultPool: QuizQuestion[] | null = null;

function buildPracticeVaultPool(): QuizQuestion[] {
  if (cachedPracticeVaultPool && cachedPracticeVaultPool.length > 0) {
    return cachedPracticeVaultPool;
  }

  const collected: QuizQuestion[] = [];
  const seenStems = new Set<string>();
  const normStem = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();

  const pushIfValid = (q: QuizQuestion) => {
    if (!isValidQuizQuestion(q)) return;
    const key = normStem(q.question);
    if (key.length < 15 || seenStems.has(key)) return;
    seenStems.add(key);
    collected.push(q);
  };

  // 1. Core practiceQuizzes bank
  for (const q of practiceQuizzes) pushIfValid(q);

  // 2. Curated Biology, Chemistry, Physics & Subtopic banks
  const banks: Record<string, QuizQuestion[]>[] = [
    CURATED_BIO_QUESTIONS,
    CURATED_CHEM_QUESTIONS,
    CURATED_PHY_QUESTIONS,
    predefinedSubtopicQuizzes
  ];
  for (const bank of banks) {
    for (const list of Object.values(bank)) {
      for (const q of list) pushIfValid(q);
    }
  }

  // 3. Topic Question Library
  for (const list of Object.values(TOPIC_QUESTION_LIBRARY)) {
    for (const q of list) pushIfValid(q);
  }

  // 4. Official Cambridge 0653 Exam Papers (4-option MCQs)
  for (const paper of [march2026Paper12Core, march2026Paper22Extended, specimen2025Paper2]) {
    for (const q of paper.questions) {
      if (!q.options || q.options.length !== 4) continue;
      const optTexts = q.options.map(opt => (typeof opt === 'string' ? opt : (opt as any).text));
      const letter = q.correctAnswer || 'A';
      const correctIdx = ['A', 'B', 'C', 'D'].indexOf(letter);
      const topicCode = q.syllabusCode ? q.syllabusCode.split('.')[0].toUpperCase() : 'B1';
      pushIfValid({
        id: `vault-exam-${q.id}`,
        subject: q.subject,
        topicCode,
        syllabusRef: q.syllabusCode,
        question: q.questionText,
        options: optTexts,
        correctIndex: correctIdx >= 0 ? correctIdx : 0,
        explanation:
          q.explanation ||
          `Correct answer is Option ${letter}. Sourced from official Cambridge IGCSE 0653 ${paper.tier} paper.`
      });
    }
  }

  // 5. Topic Templates (static & parameterized samples)
  for (const [parentCode, templates] of Object.entries(TOPIC_TEMPLATES)) {
    const meta = SYLLABUS_TOPICS_META[parentCode] || SYLLABUS_TOPICS_META['B1'];
    templates.forEach((tpl, tIdx) => {
      const vars = tpl.generateVars ? tpl.generateVars() : null;
      const stem = typeof tpl.stem === 'function' ? tpl.stem(vars) : tpl.stem;
      const correctAns = typeof tpl.correct === 'function' ? tpl.correct(vars) : tpl.correct;
      const distractors = typeof tpl.distractors === 'function' ? tpl.distractors(vars) : tpl.distractors;
      const explanation = typeof tpl.explanation === 'function' ? tpl.explanation(vars) : tpl.explanation;
      pushIfValid({
        id: `vault-tpl-${parentCode.toLowerCase()}-${tIdx}`,
        subject: meta.subject,
        topicCode: parentCode,
        topicTitle: meta.title,
        syllabusRef: tpl.ref || meta.syllabusRef,
        question: stem,
        options: [correctAns, ...distractors.slice(0, 3)],
        correctIndex: 0,
        explanation
      });
    });
  }

  // 6. Clean subtopic engine quizzes
  for (const sub of allSubtopicsData) {
    const subQuiz = getQuizForSubtopic(sub.subtopicCode, { count: 8 });
    for (const q of subQuiz) pushIfValid(q);
  }

  cachedPracticeVaultPool = collected;
  return collected;
}

/**
 * Picks `count` randomized, syllabus-validated questions directly from the Practice Quiz Question Vault,
 * shuffling both question selection and the 4 answer options every time.
 */
export function getRandomizedPracticeVaultQuestions(
  count: number = 1,
  excludeIds?: Set<string>
): VaultCrateQuestion[] {
  const safeCount = Math.max(1, count);
  const pool = buildPracticeVaultPool();

  // Filter out recently seen IDs if plenty of unseen questions remain
  let candidates = excludeIds && excludeIds.size > 0
    ? pool.filter(q => !excludeIds.has(q.id))
    : [...pool];

  if (candidates.length < safeCount) {
    candidates = [...pool];
  }

  // Fisher-Yates shuffle on candidates
  const shuffledPool = [...candidates];
  for (let i = shuffledPool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledPool[i], shuffledPool[j]] = [shuffledPool[j], shuffledPool[i]];
  }

  const picked = shuffledPool.slice(0, safeCount);

  // Randomize option order for every picked question and convert to VaultCrateQuestion
  return picked.map((q) => {
    const safeCorrectIdx =
      typeof q.correctIndex === 'number' && q.correctIndex >= 0 && q.correctIndex < q.options.length
        ? q.correctIndex
        : 0;
    const tagged = q.options.map((text, idx) => ({ text, isCorrect: idx === safeCorrectIdx }));
    for (let i = tagged.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tagged[i], tagged[j]] = [tagged[j], tagged[i]];
    }
    const newAnswerIndex = Math.max(0, tagged.findIndex(o => o.isCorrect));

    return {
      id: q.id,
      question: q.question,
      options: tagged.map(o => o.text),
      answerIndex: newAnswerIndex,
      explanation: q.explanation || 'Review the Cambridge IGCSE 0653 topic notes for full details.',
      subject: q.subject || 'biology'
    };
  });
}
