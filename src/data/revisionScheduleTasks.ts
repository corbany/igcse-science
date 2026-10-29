import { ScienceSubject } from '../types';

export interface TopicRevisionTaskConfig {
  code: string;
  title: string;
  subject: ScienceSubject;
  slideRecap: {
    slideRange: string;
    deckTitle: string;
    keyConcepts: string;
  };
  // Creative follow-up tasks: a mix of website tools and offline creative techniques
  creativeTasks: {
    task: string;
    type: 'website_tool' | 'hands_on' | 'feynman' | 'sketch' | 'audit';
    toolTarget?: 'quiz' | 'ai_tutor' | 'exams' | 'notebook' | 'guidelines';
    aiPrompt?: string;
  }[];
}

export const TOPIC_REVISION_CONFIGS: Record<string, TopicRevisionTaskConfig> = {
  // ==========================================
  // BIOLOGY (B1 - B16)
  // ==========================================
  'B1': {
    code: 'B1',
    title: 'Characteristics of Living Organisms',
    subject: 'biology',
    slideRecap: {
      slideRange: 'Slides 1–4',
      deckTitle: 'Characteristics of Living Things (MRS GREN)',
      keyConcepts: 'Scientific definitions of Movement, Respiration, Sensitivity, Growth, Reproduction, Excretion, and Nutrition.'
    },
    creativeTasks: [
      {
        task: 'Ask AI Chat Tutor: "Give me 3 tricky Cambridge exam scenarios that test the difference between excretion and egestion, and quiz me on them."',
        type: 'website_tool',
        toolTarget: 'ai_tutor',
        aiPrompt: 'Give me 3 tricky Cambridge exam scenarios that test the difference between excretion and egestion, and quiz me on them.'
      },
      {
        task: 'Feynman Technique: Explain MRS GREN aloud to a family member or friend in 90 seconds without looking at your notes; ensure you state why a car moving and burning fuel is not alive.',
        type: 'feynman'
      },
      {
        task: 'Launch Quiz Arena on B1: Score 80%+ to confirm your Green diagnostic mastery badge.',
        type: 'website_tool',
        toolTarget: 'quiz'
      }
    ]
  },
  'B2': {
    code: 'B2',
    title: 'Cells & Organisation',
    subject: 'biology',
    slideRecap: {
      slideRange: 'Slides 2–5',
      deckTitle: 'Plant vs Animal Cell Organelles & Microscopic Magnification',
      keyConcepts: 'Organelle functions (chloroplasts, vacuole, cell wall, mitochondria, ribosomes) and magnification formula M = I / A.'
    },
    creativeTasks: [
      {
        task: 'Sketch & Recall: On a blank sheet of paper, sketch a plant palisade cell and a human red blood cell side-by-side; label 3 structures unique to plants and annotate how root hair cells are adapted for absorption.',
        type: 'sketch'
      },
      {
        task: 'Ask AI Chat Tutor: "Generate 2 multi-step Cambridge Paper 4 magnification calculation questions with millimetre to micrometre conversions, and grade my working step-by-step."',
        type: 'website_tool',
        toolTarget: 'ai_tutor',
        aiPrompt: 'Generate 2 multi-step Cambridge Paper 4 magnification calculation questions with millimetre to micrometre conversions, and grade my working step-by-step.'
      },
      {
        task: 'Launch Quiz Arena on B2: Complete the 10-question diagnostic check and lock in your confidence rating in the Syllabus Notebook.',
        type: 'website_tool',
        toolTarget: 'quiz'
      }
    ]
  },
  'B3': {
    code: 'B3',
    title: 'Movement In & Out of Cells',
    subject: 'biology',
    slideRecap: {
      slideRange: 'Slides 1–4',
      deckTitle: 'Diffusion, Osmosis & Active Transport',
      keyConcepts: 'Water potential gradients, turgid vs plasmolysed plant cells, and active transport carrier proteins using cellular ATP.'
    },
    creativeTasks: [
      {
        task: 'Kitchen Mini-Lab: Cut two equal potato strips (or apple slices); submerge one in pure tap water and one in concentrated salt water for 30 minutes; feel the difference in turgidity and explain the net water movement.',
        type: 'hands_on'
      },
      {
        task: 'Ask AI Chat Tutor: "Explain the role of mitochondria and carrier proteins in active transport across root hair cell membranes according to Cambridge mark schemes."',
        type: 'website_tool',
        toolTarget: 'ai_tutor',
        aiPrompt: 'Explain the role of mitochondria and carrier proteins in active transport across root hair cell membranes according to Cambridge mark schemes.'
      },
      {
        task: 'Past Exams Vault: Open Paper 6 Alternative to Practical and review the Visking tubing model gut experiment notes.',
        type: 'website_tool',
        toolTarget: 'exams'
      }
    ]
  },
  'B4': {
    code: 'B4',
    title: 'Biological Molecules',
    subject: 'biology',
    slideRecap: {
      slideRange: 'Slides 1–4',
      deckTitle: 'Carbohydrates, Lipids, Proteins & Cambridge Food Tests',
      keyConcepts: 'Reagent protocols and color changes for Benedict\'s (reducing sugars), Iodine (starch), Biuret (protein), and Ethanol emulsion (fats).'
    },
    creativeTasks: [
      {
        task: 'Flashcard Matrix: Fold a sheet of paper into a 4-quadrant food test reference guide; write the reagent name, initial colour, heating requirement, and positive result for Benedict\'s, Iodine, Biuret, and Ethanol emulsion.',
        type: 'sketch'
      },
      {
        task: 'Ask AI Chat Tutor: "Test me with 3 mystery food sample scenarios containing mixed nutrients, and ask which tests would turn positive."',
        type: 'website_tool',
        toolTarget: 'ai_tutor',
        aiPrompt: 'Test me with 3 mystery food sample scenarios containing mixed nutrients, and ask which tests would turn positive.'
      },
      {
        task: 'Quiz Arena Practice: Complete the B4 diagnostic challenge and review any missed questions.',
        type: 'website_tool',
        toolTarget: 'quiz'
      }
    ]
  },
  'B5': {
    code: 'B5',
    title: 'Enzymes & Active Sites',
    subject: 'biology',
    slideRecap: {
      slideRange: 'Slides 1–3',
      deckTitle: 'Enzyme Action, Lock-and-Key Model & Thermal Denaturation',
      keyConcepts: 'Biological catalyst mechanism, active site complementary fit, kinetic collision rate below optimum, and permanent denaturation past 40°C.'
    },
    creativeTasks: [
      {
        task: 'Feynman Technique: Stand up and explain aloud why enzymes do NOT "die" at high temperatures, but instead "denature" as active sites change shape permanently; use a lock-and-key analogy.',
        type: 'feynman'
      },
      {
        task: 'Ask AI Chat Tutor: "Give me a 4-mark Cambridge Paper 4 extended question on the effect of pH and temperature on amylase, and critique my answer for missing keywords."',
        type: 'website_tool',
        toolTarget: 'ai_tutor',
        aiPrompt: 'Give me a 4-mark Cambridge Paper 4 extended question on the effect of pH and temperature on amylase, and critique my answer for missing keywords.'
      },
      {
        task: 'Sketch Rate Curves: Draw two graphs from memory on paper: Rate vs Temperature and Rate vs pH; label optimum point and the denaturation cliff.',
        type: 'sketch'
      }
    ]
  },
  'B6': {
    code: 'B6',
    title: 'Plant Nutrition & Photosynthesis',
    subject: 'biology',
    slideRecap: {
      slideRange: 'Slides 2–5',
      deckTitle: 'Photosynthesis Chemical Equation & Internal Leaf Cross-Section',
      keyConcepts: 'Balanced equation 6CO₂ + 6H₂O ➔ C₆H₁₂O₆ + 6O₂, palisade mesophyll adaptations, stomata guard cells, and limiting factors (light, CO₂, temp).'
    },
    creativeTasks: [
      {
        task: 'Real-World Leaf Audit: Pick a green leaf from outdoors; identify top waxy cuticle, inspect the underside with a phone magnifier for stomata, and sketch the transverse section from memory.',
        type: 'hands_on'
      },
      {
        task: 'Ask AI Chat Tutor: "Explain how to interpret a graph with two limiting factors curves (e.g. 0.04% CO₂ vs 0.1% CO₂ under varying light intensity) for Cambridge Paper 4."',
        type: 'website_tool',
        toolTarget: 'ai_tutor',
        aiPrompt: 'Explain how to interpret a graph with two limiting factors curves (e.g. 0.04% CO₂ vs 0.1% CO₂ under varying light intensity) for Cambridge Paper 4.'
      },
      {
        task: 'Quiz Arena Drill: Launch the B6 quiz and achieve 80%+ to earn an Amber/Green grade badge.',
        type: 'website_tool',
        toolTarget: 'quiz'
      }
    ]
  },
  'B7': {
    code: 'B7',
    title: 'Human Nutrition & Digestion',
    subject: 'biology',
    slideRecap: {
      slideRange: 'Slides 1–4',
      deckTitle: 'Digestive Enzymes, Bile Emulsification & Balanced Diet',
      keyConcepts: 'Substrates and products of amylase, protease, and lipase; role of bile in fat emulsification and neutralizing stomach hydrochloric acid.'
    },
    creativeTasks: [
      {
        task: 'Digestive Journey Map: Draw the human alimentary canal from mouth to anus on an A4 sheet; annotate where starch, protein, and lipids are broken down and where bile enters.',
        type: 'sketch'
      },
      {
        task: 'Ask AI Chat Tutor: "Why does emulsification of fats by bile salts speed up lipase action? Give the exact 2-mark Cambridge examiner phrasing."',
        type: 'website_tool',
        toolTarget: 'ai_tutor',
        aiPrompt: 'Why does emulsification of fats by bile salts speed up lipase action? Give the exact 2-mark Cambridge examiner phrasing.'
      },
      {
        task: 'Syllabus Notebook: Write a concise note on the 7 dietary components and deficiency diseases (scurvy, rickets, anaemia).',
        type: 'website_tool',
        toolTarget: 'notebook'
      }
    ]
  },
  'B8': {
    code: 'B8',
    title: 'Transport in Plants',
    subject: 'biology',
    slideRecap: {
      slideRange: 'Slides 2–4',
      deckTitle: 'Xylem vs Phloem & Transpiration Stream Mechanics',
      keyConcepts: 'Xylem lignified dead cells transporting water and minerals unidirectionally; phloem translocation of sucrose and amino acids bidirectionally; factors affecting transpiration.'
    },
    creativeTasks: [
      {
        task: 'Celery / Flower Dye Experiment: If available, place a stalk of celery or white flower in water with a drop of food coloring; observe the colored vascular bundles in the stem after 2 hours.',
        type: 'hands_on'
      },
      {
        task: 'Ask AI Chat Tutor: "How does high humidity decrease transpiration rate? Explain using water vapor concentration gradient for Paper 4 Extended."',
        type: 'website_tool',
        toolTarget: 'ai_tutor',
        aiPrompt: 'How does high humidity decrease transpiration rate? Explain using water vapor concentration gradient for Paper 4 Extended.'
      },
      {
        task: 'Launch Quiz Arena on B8: Complete the active recall questions and review feedback.',
        type: 'website_tool',
        toolTarget: 'quiz'
      }
    ]
  },
  'B9': {
    code: 'B9',
    title: 'Transport in Animals',
    subject: 'biology',
    slideRecap: {
      slideRange: 'Slides 1–4',
      deckTitle: 'Heart Anatomy, Double Circulation & Blood Vessels',
      keyConcepts: 'Four heart chambers, atrioventricular and semilunar valves, thicker left ventricle wall, and structural differences between arteries, veins, and capillaries.'
    },
    creativeTasks: [
      {
        task: 'Color-Coded Circuit Sketch: Draw a simplified schematic of the double circulation on paper using a red pen (oxygenated blood) and a blue pen (deoxygenated blood); label vena cava, pulmonary artery, pulmonary vein, and aorta.',
        type: 'sketch'
      },
      {
        task: 'Pulse Rate Observation: Count your resting pulse for 30 seconds; do 20 jumping jacks and re-measure; explain the physiological reason for increased cardiac output and muscle oxygen demand.',
        type: 'hands_on'
      },
      {
        task: 'Ask AI Chat Tutor: "Explain why the muscular wall of the left ventricle is much thicker than the right ventricle in Cambridge mark schemes."',
        type: 'website_tool',
        toolTarget: 'ai_tutor',
        aiPrompt: 'Explain why the muscular wall of the left ventricle is much thicker than the right ventricle in Cambridge mark schemes.'
      }
    ]
  },
  'B10': {
    code: 'B10',
    title: 'Diseases & Immunity',
    subject: 'biology',
    slideRecap: {
      slideRange: 'Slides 1–3',
      deckTitle: 'Pathogens, Body Defences & Vaccination Mechanisms',
      keyConcepts: 'Mechanical (skin, nose hairs) and chemical (mucus, stomach acid) barriers; phagocytes engulfing pathogens vs lymphocytes secreting specific antibodies.'
    },
    creativeTasks: [
      {
        task: 'Vaccine Timeline Diagram: Sketch a primary vs secondary immune response antibody concentration curve on lined paper; label the lag phase, rapid antibody spike, and memory cell persistence.',
        type: 'sketch'
      },
      {
        task: 'Ask AI Chat Tutor: "Test me on active vs passive immunity with 3 real-world medical examples and tell me if my reasoning is correct."',
        type: 'website_tool',
        toolTarget: 'ai_tutor',
        aiPrompt: 'Test me on active vs passive immunity with 3 real-world medical examples and tell me if my reasoning is correct.'
      },
      {
        task: 'Quiz Arena Practice: Test your B10 diagnostic knowledge and log any tricky terms.',
        type: 'website_tool',
        toolTarget: 'quiz'
      }
    ]
  },
  'B11': {
    code: 'B11',
    title: 'Gas Exchange in Humans',
    subject: 'biology',
    slideRecap: {
      slideRange: 'Slides 2–4',
      deckTitle: 'Alveoli Diffusion Surface & Ventilation Mechanics',
      keyConcepts: '4 adaptations of alveoli (large surface area, thin walls, moist lining, capillary network) and diaphragm/intercostal muscle actions during breathing.'
    },
    creativeTasks: [
      {
        task: 'Breathe & Feel Self-Check: Place your hands on your lower ribcage; inhale deeply and feel ribs move up and out as the diaphragm contracts and flattens; state whether thoracic volume and pressure increase or decrease.',
        type: 'hands_on'
      },
      {
        task: 'Ask AI Chat Tutor: "Generate a table comparing the percentage composition of inspired air vs expired air (oxygen, carbon dioxide, nitrogen) and explain each difference."',
        type: 'website_tool',
        toolTarget: 'ai_tutor',
        aiPrompt: 'Generate a table comparing the percentage composition of inspired air vs expired air (oxygen, carbon dioxide, nitrogen) and explain each difference.'
      },
      {
        task: 'Past Exams Vault: Check the 2025 Specimen Paper 2 multiple-choice questions on ventilation.',
        type: 'website_tool',
        toolTarget: 'exams'
      }
    ]
  },
  'B12': {
    code: 'B12',
    title: 'Respiration',
    subject: 'biology',
    slideRecap: {
      slideRange: 'Slides 1–3',
      deckTitle: 'Aerobic vs Anaerobic Respiration & ATP in Mitochondria',
      keyConcepts: 'Word and balanced symbol equation C₆H₁₂O₆ + 6O₂ ➔ 6CO₂ + 6H₂O; 5 uses of energy in living organisms; anaerobic respiration in muscles (lactic acid) vs yeast (alcohol + CO₂).'
    },
    creativeTasks: [
      {
        task: 'Feynman Technique: Explain to someone why respiration is NOT breathing in 60 seconds; state where in the cell it occurs and list 4 distinct ways your body uses the released energy.',
        type: 'feynman'
      },
      {
        task: 'Ask AI Chat Tutor: "Why is less energy released per glucose molecule in anaerobic respiration compared to aerobic respiration? Give the 2-mark Cambridge answer."',
        type: 'website_tool',
        toolTarget: 'ai_tutor',
        aiPrompt: 'Why is less energy released per glucose molecule in anaerobic respiration compared to aerobic respiration? Give the 2-mark Cambridge answer.'
      },
      {
        task: 'Launch Quiz Arena on B12: Aim for 100% on the respiration equation and energy pathways.',
        type: 'website_tool',
        toolTarget: 'quiz'
      }
    ]
  },
  'B13': {
    code: 'B13',
    title: 'Coordination & Response',
    subject: 'biology',
    slideRecap: {
      slideRange: 'Slides 2–4',
      deckTitle: 'Reflex Arc Pathway, Synapses & Eye Accommodation',
      keyConcepts: '5-step reflex pathway (Stimulus ➔ Receptor ➔ Sensory Neurone ➔ Relay Neurone ➔ Motor Neurone ➔ Effector); synapse neurotransmitter diffusion; ciliary muscles and suspensory ligaments in the eye.'
    },
    creativeTasks: [
      {
        task: 'Ruler Drop Reaction Test: Have a partner hold a 30 cm ruler just above your open thumb and forefinger; drop it without warning and catch it; record the drop distance in cm, convert to reaction time, and trace the reflex pathway.',
        type: 'hands_on'
      },
      {
        task: 'Eye Accommodation Cheat-Card: Write the "Near vs Distant Object" rule on an index card: ciliary muscle contraction, suspensory ligament tension, and lens convexity.',
        type: 'sketch'
      },
      {
        task: 'Ask AI Chat Tutor: "Explain how neurotransmitters ensure that nerve impulses travel in one direction only across a synapse for Cambridge Paper 4."',
        type: 'website_tool',
        toolTarget: 'ai_tutor',
        aiPrompt: 'Explain how neurotransmitters ensure that nerve impulses travel in one direction only across a synapse for Cambridge Paper 4.'
      }
    ]
  },
  'B14': {
    code: 'B14',
    title: 'Reproduction',
    subject: 'biology',
    slideRecap: {
      slideRange: 'Slides 1–3',
      deckTitle: 'Asexual vs Sexual Reproduction & Menstrual Hormones',
      keyConcepts: 'Clonal asexual reproduction vs genetically variable sexual reproduction; wind vs insect flower adaptations; functions of FSH, LH, oestrogen, and progesterone.'
    },
    creativeTasks: [
      {
        task: 'Hormone Curve Sketch: Draw the 28-day human menstrual cycle graph from memory; annotate the LH surge triggering ovulation at Day 14 and progesterone maintaining the uterus lining.',
        type: 'sketch'
      },
      {
        task: 'Ask AI Chat Tutor: "Compare insect-pollinated flowers and wind-pollinated flowers in a 4-row table covering petals, stamens, stigmas, and pollen grains."',
        type: 'website_tool',
        toolTarget: 'ai_tutor',
        aiPrompt: 'Compare insect-pollinated flowers and wind-pollinated flowers in a 4-row table covering petals, stamens, stigmas, and pollen grains.'
      },
      {
        task: 'Quiz Arena Practice: Test your reproduction and flower anatomy recall.',
        type: 'website_tool',
        toolTarget: 'quiz'
      }
    ]
  },
  'B15': {
    code: 'B15',
    title: 'Organisms & Environment',
    subject: 'biology',
    slideRecap: {
      slideRange: 'Slides 2–4',
      deckTitle: 'Trophic Levels, Energy Transfer & Pyramids of Biomass',
      keyConcepts: 'Sunlight as initial energy source; 90% energy lost as heat/excretion/respiration between trophic levels; inverted pyramids of numbers vs upright pyramids of biomass.'
    },
    creativeTasks: [
      {
        task: 'Food Web Builder: Draw a realistic 6-organism marine or garden food web on paper; identify primary, secondary, and tertiary consumers and predict the consequence if the top predator is removed.',
        type: 'sketch'
      },
      {
        task: 'Ask AI Chat Tutor: "Explain with 3 distinct reasons why food chains rarely exceed 4 or 5 trophic levels in an ecosystem."',
        type: 'website_tool',
        toolTarget: 'ai_tutor',
        aiPrompt: 'Explain with 3 distinct reasons why food chains rarely exceed 4 or 5 trophic levels in an ecosystem.'
      },
      {
        task: 'Launch Quiz Arena on B15: Secure a Green traffic light score.',
        type: 'website_tool',
        toolTarget: 'quiz'
      }
    ]
  },
  'B16': {
    code: 'B16',
    title: 'Ecosystems & Human Influences',
    subject: 'biology',
    slideRecap: {
      slideRange: 'Slides 1–3',
      deckTitle: 'Carbon Cycle & Human Environmental Impact',
      keyConcepts: 'Carbon cycle processes (photosynthesis, respiration, combustion, decomposition); impacts of deforestation; fertilizer runoff leading to eutrophication.'
    },
    creativeTasks: [
      {
        task: 'Eutrophication Flowchart: Write out the 5 sequential steps of eutrophication on an index card: fertilizer runoff ➔ algal bloom ➔ blocked light/submerged plant death ➔ bacterial decomposer boom & oxygen depletion ➔ death of aquatic life.',
        type: 'sketch'
      },
      {
        task: 'Ask AI Chat Tutor: "Explain how burning fossil fuels and deforestation alter carbon sink reserves, using Cambridge command words."',
        type: 'website_tool',
        toolTarget: 'ai_tutor',
        aiPrompt: 'Explain how burning fossil fuels and deforestation alter carbon sink reserves, using Cambridge command words.'
      },
      {
        task: 'Syllabus Notebook: Record your final B16 summary and self-rate your biology confidence stars.',
        type: 'website_tool',
        toolTarget: 'notebook'
      }
    ]
  },

  // ==========================================
  // CHEMISTRY (C1 - C12)
  // ==========================================
  'C1': {
    code: 'C1',
    title: 'States of Matter',
    subject: 'chemistry',
    slideRecap: {
      slideRange: 'Slides 1–3',
      deckTitle: 'Kinetic Particle Theory, Heating Curves & Gas Diffusion',
      keyConcepts: 'Particle arrangements, forces, and kinetic motion in solids, liquids, and gases; latent heat plateaus on heating curves; inverse relationship between molecular mass (Mr) and diffusion rate.'
    },
    creativeTasks: [
      {
        task: 'Kitchen Diffusion Observation: Drop a tea bag or single droplet of food colouring into cold water vs hot water; observe the speed of colour dispersion and explain using particle kinetic energy.',
        type: 'hands_on'
      },
      {
        task: 'Heating Curve Sketch: Draw a heating curve from ice at -10°C to steam at 110°C on graph paper; annotate the two horizontal plateaus where heat energy breaks intermolecular bonds without temperature rise.',
        type: 'sketch'
      },
      {
        task: 'Ask AI Chat Tutor: "In the reaction between NH₃ gas and HCl gas in a glass tube, explain why the white ring of NH₄Cl forms closer to the HCl end using molecular mass."',
        type: 'website_tool',
        toolTarget: 'ai_tutor',
        aiPrompt: 'In the reaction between NH₃ gas and HCl gas in a glass tube, explain why the white ring of NH₄Cl forms closer to the HCl end using molecular mass.'
      }
    ]
  },
  'C2': {
    code: 'C2',
    title: 'Atoms, Elements & Compounds',
    subject: 'chemistry',
    slideRecap: {
      slideRange: 'Slides 2–5',
      deckTitle: 'Atomic Structure, Isotopes & Dot-and-Cross Bonding',
      keyConcepts: 'Protons, neutrons, electrons; dot-and-cross diagrams for ionic bonding (NaCl, MgO) and covalent molecules (H₂O, CH₄, CO₂); properties of giant ionic lattices vs simple molecular substances.'
    },
    creativeTasks: [
      {
        task: 'Sticky-Note Electron Transfer: Use 2 different colored sticky notes to represent sodium (11 electrons) and chlorine (17 electrons); physically transfer the 1 valence electron to demonstrate ion formation (Na⁺ and Cl⁻).',
        type: 'hands_on'
      },
      {
        task: 'Dot-and-Cross Memory Drill: Draw dot-and-cross diagrams for water (H₂O), methane (CH₄), and oxygen (O₂ with double covalent bond) on paper from memory without checking notes.',
        type: 'sketch'
      },
      {
        task: 'Ask AI Chat Tutor: "Explain why giant ionic compounds conduct electricity when molten or dissolved, but NOT when solid, in Cambridge Paper 4 mark schemes."',
        type: 'website_tool',
        toolTarget: 'ai_tutor',
        aiPrompt: 'Explain why giant ionic compounds conduct electricity when molten or dissolved, but NOT when solid, in Cambridge Paper 4 mark schemes.'
      }
    ]
  },
  'C3': {
    code: 'C3',
    title: 'Stoichiometry & Equations',
    subject: 'chemistry',
    slideRecap: {
      slideRange: 'Slides 1–3',
      deckTitle: 'Chemical Formulas, Balancing Equations & State Symbols',
      keyConcepts: 'Balancing chemical equations, applying state symbols (s, l, g, aq), deducing formulas from ion valencies, and verifying the Law of Conservation of Mass (moles from mass are excluded in 0653).',
    },
    creativeTasks: [
      {
        task: '10-Equation Speed Balance Challenge: Write down 10 unbalanced equations (e.g. Fe + O₂ ➔ Fe₂O₃; Al + HCl ➔ AlCl₃ + H₂) and balance every one with correct state symbols in under 5 minutes.',
        type: 'audit'
      },
      {
        task: 'Ask AI Chat Tutor: "Give me 5 tricky Cambridge 0653 chemical formula deduction questions from ion charges, and check my answers."',
        type: 'website_tool',
        toolTarget: 'ai_tutor',
        aiPrompt: 'Give me 5 tricky Cambridge 0653 chemical formula deduction questions from ion charges, and check my answers.'
      },
      {
        task: 'Launch Quiz Arena on C3: Test your balancing skills and achieve 90%+.',
        type: 'website_tool',
        toolTarget: 'quiz'
      }
    ]
  },
  'C4': {
    code: 'C4',
    title: 'Electrochemistry & Electrolysis',
    subject: 'chemistry',
    slideRecap: {
      slideRange: 'Slides 1–4',
      deckTitle: 'Electrolysis Principles, Molten PbBr₂ & Aqueous Solutions',
      keyConcepts: 'PANIC rule (Positive Anode, Negative Is Cathode); products of molten lead(II) bromide; products of concentrated NaCl(aq) and dilute H₂SO₄(aq); writing ionic half-equations with electrons.'
    },
    creativeTasks: [
      {
        task: 'PANIC Cheat Sheet: Make an index card summarizing the PANIC rule; write the cathode half-equation (reduction) and anode half-equation (oxidation) for molten PbBr₂ and aqueous concentrated NaCl.',
        type: 'sketch'
      },
      {
        task: 'Ask AI Chat Tutor: "In the electrolysis of concentrated aqueous NaCl, explain why hydrogen gas forms at the cathode instead of sodium metal, and why the remaining solution is alkaline."',
        type: 'website_tool',
        toolTarget: 'ai_tutor',
        aiPrompt: 'In the electrolysis of concentrated aqueous NaCl, explain why hydrogen gas forms at the cathode instead of sodium metal, and why the remaining solution is alkaline.'
      },
      {
        task: 'Launch Quiz Arena on C4: Achieve 80%+ to flip your subtopic traffic light to Green.',
        type: 'website_tool',
        toolTarget: 'quiz'
      }
    ]
  },
  'C5': {
    code: 'C5',
    title: 'Chemical Energetics',
    subject: 'chemistry',
    slideRecap: {
      slideRange: 'Slides 1–3',
      deckTitle: 'Exothermic vs Endothermic Profiles & Bond Energy ΔH',
      keyConcepts: 'Reaction profile diagrams showing reactants, products, activation energy (Ea), and enthalpy change (ΔH); calculating overall energy change: ΔH = bonds broken - bonds made.'
    },
    creativeTasks: [
      {
        task: 'Endo/Exo Kitchen Feel: Dissolve a spoonful of table salt or baking soda in a small cup of water and feel the cup (endothermic cooling); compare with vinegar and baking soda effervescence.',
        type: 'hands_on'
      },
      {
        task: 'Reaction Profile Diagrams: Draw an exothermic profile and an endothermic profile side-by-side on paper; label Activation Energy (Ea) arrow from reactants to peak and ΔH arrow.',
        type: 'sketch'
      },
      {
        task: 'Ask AI Chat Tutor: "Provide a 4-mark Cambridge Paper 4 bond energy calculation problem for the combustion of methane: CH₄ + 2O₂ ➔ CO₂ + 2H₂O, and grade my step-by-step math."',
        type: 'website_tool',
        toolTarget: 'ai_tutor',
        aiPrompt: 'Provide a 4-mark Cambridge Paper 4 bond energy calculation problem for the combustion of methane: CH₄ + 2O₂ ➔ CO₂ + 2H₂O, and grade my step-by-step math.'
      }
    ]
  },
  'C6': {
    code: 'C6',
    title: 'Chemical Reactions & Rates',
    subject: 'chemistry',
    slideRecap: {
      slideRange: 'Slides 1–3',
      deckTitle: 'Collision Theory, Factors Affecting Rate & Gas Volume Graphs',
      keyConcepts: 'Collision frequency and activation energy; effect of surface area (powder vs lumps), concentration, temperature, and catalysts; analyzing volume/mass loss vs time curves.'
    },
    creativeTasks: [
      {
        task: 'Surface Area Kitchen Demo: Drop an intact sugar cube vs equivalent loose granulated sugar into two cups of water at identical temperature; observe the dissolving rate difference and explain using surface area.',
        type: 'hands_on'
      },
      {
        task: 'Ask AI Chat Tutor: "Explain why increasing temperature by 10°C often doubles the rate of reaction, focusing on the proportion of particles exceeding activation energy."',
        type: 'website_tool',
        toolTarget: 'ai_tutor',
        aiPrompt: 'Explain why increasing temperature by 10°C often doubles the rate of reaction, focusing on the proportion of particles exceeding activation energy.'
      },
      {
        task: 'Past Exams Vault: Open Paper 6 and practice the practical method for measuring the rate of gas production with an inverted measuring cylinder or gas syringe.',
        type: 'website_tool',
        toolTarget: 'exams'
      }
    ]
  },
  'C7': {
    code: 'C7',
    title: 'Acids, Bases & Salts',
    subject: 'chemistry',
    slideRecap: {
      slideRange: 'Slides 2–4',
      deckTitle: 'Reactions of Acids, Oxide Types & Salt Preparation Methods',
      keyConcepts: 'Reactions: Acid + Metal ➔ Salt + H₂; Acid + Base ➔ Salt + H₂O; Acid + Carbonate ➔ Salt + H₂O + CO₂; method to prepare dry copper(II) sulfate crystals using excess oxide.',
    },
    creativeTasks: [
      {
        task: 'Recipe Card for Copper Sulfate Crystals: Write out the 5-step laboratory preparation recipe for pure, dry copper(II) sulfate crystals on an index card; highlight why excess CuO is used and how to test for the crystallization point.',
        type: 'sketch'
      },
      {
        task: 'Ask AI Chat Tutor: "Classify these 6 oxides: Na₂O, SO₂, Al₂O₃, CO, MgO, ZnO as basic, acidic, amphoteric, or neutral, and quiz me on their reactions with acids and bases."',
        type: 'website_tool',
        toolTarget: 'ai_tutor',
        aiPrompt: 'Classify these 6 oxides: Na₂O, SO₂, Al₂O₃, CO, MgO, ZnO as basic, acidic, amphoteric, or neutral, and quiz me on their reactions with acids and bases.'
      },
      {
        task: 'Quiz Arena Drill: Complete the C7 quiz challenge to verify your acid-base equations.',
        type: 'website_tool',
        toolTarget: 'quiz'
      }
    ]
  },
  'C8': {
    code: 'C8',
    title: 'The Periodic Table',
    subject: 'chemistry',
    slideRecap: {
      slideRange: 'Slides 1–3',
      deckTitle: 'Periodic Table Trends: Group 1, Group 7 & Noble Gases',
      keyConcepts: 'Group 1 alkali metals (increasing reactivity, lower melting points down group); Group 7 halogens (decreasing reactivity, darker colours); halogen displacement reactions.'
    },
    creativeTasks: [
      {
        task: 'Halogen Displacement Drill: Write out the word and chemical equations on paper for: Cl₂ + 2KBr ➔ 2KCl + Br₂ and explain why iodine cannot displace chlorine from sodium chloride.',
        type: 'audit'
      },
      {
        task: 'Ask AI Chat Tutor: "Explain the trend in reactivity down Group 1 in terms of atomic radius, shielding, and ease of losing the outer valence electron for Paper 4 Extended."',
        type: 'website_tool',
        toolTarget: 'ai_tutor',
        aiPrompt: 'Explain the trend in reactivity down Group 1 in terms of atomic radius, shielding, and ease of losing the outer valence electron for Paper 4 Extended.'
      },
      {
        task: 'Launch Quiz Arena on C8: Achieve 85%+ to secure a Green badge.',
        type: 'website_tool',
        toolTarget: 'quiz'
      }
    ]
  },
  'C9': {
    code: 'C9',
    title: 'Metals & Reactivity Series',
    subject: 'chemistry',
    slideRecap: {
      slideRange: 'Slides 1–4',
      deckTitle: 'Reactivity Series, Blast Furnace Reactions & Rust Prevention',
      keyConcepts: 'Reactivity series order: K, Na, Ca, Mg, Al, C, Zn, Fe, H, Cu, Ag, Au; blast furnace reduction equations: C + O₂ ➔ CO₂, CO₂ + C ➔ 2CO, Fe₂O₃ + 3CO ➔ 2Fe + 3CO₂; limestone slag formation; rust prevention (galvanising vs sacrificial protection).',
    },
    creativeTasks: [
      {
        task: 'Reactivity Mnemonic & Furnace Diagram: Create a memorable sentence mnemonic for the reactivity series (e.g. Please Stop Calling Me A Careless Zebra Instead Try Learning How Copper Saves Gold); draw a blast furnace with the 3 main reactions.',
        type: 'sketch'
      },
      {
        task: 'Ask AI Chat Tutor: "Explain the difference between barrier methods, galvanising, and sacrificial protection for rust prevention in Cambridge mark schemes."',
        type: 'website_tool',
        toolTarget: 'ai_tutor',
        aiPrompt: 'Explain the difference between barrier methods, galvanising, and sacrificial protection for rust prevention in Cambridge mark schemes.'
      },
      {
        task: 'Syllabus Notebook: Write a summary of thermal decomposition of metal carbonates across the reactivity series.',
        type: 'website_tool',
        toolTarget: 'notebook'
      }
    ]
  },
  'C10': {
    code: 'C10',
    title: 'Chemistry of the Environment',
    subject: 'chemistry',
    slideRecap: {
      slideRange: 'Slides 1–3',
      deckTitle: 'Clean Air Composition, Pollutants & Water Tests',
      keyConcepts: 'Clean dry air percentages (78% N₂, 21% O₂, noble gases, CO₂); pollutants (CO, SO₂, NOₓ); catalytic converter redox reactions; chemical tests for water (anhydrous CuSO₄ white to blue; CoCl₂ blue to pink).'
    },
    creativeTasks: [
      {
        task: 'Pollutant Crime File: Create a mini-table listing Carbon Monoxide, Sulfur Dioxide, and Oxides of Nitrogen: list the source, environmental/health hazard, and reduction method for each.',
        type: 'sketch'
      },
      {
        task: 'Ask AI Chat Tutor: "Explain the distinction between testing for the presence of water with anhydrous cobalt(II) chloride vs proving water is pure by its boiling point at 100°C."',
        type: 'website_tool',
        toolTarget: 'ai_tutor',
        aiPrompt: 'Explain the distinction between testing for the presence of water with anhydrous cobalt(II) chloride vs proving water is pure by its boiling point at 100°C.'
      },
      {
        task: 'Quiz Arena Drill: Test your environmental chemistry recall and lock in your score.',
        type: 'website_tool',
        toolTarget: 'quiz'
      }
    ]
  },
  'C11': {
    code: 'C11',
    title: 'Organic Chemistry',
    subject: 'chemistry',
    slideRecap: {
      slideRange: 'Slides 1–3',
      deckTitle: 'Alkanes, Alkenes, Petroleum Fractions & Catalytic Cracking',
      keyConcepts: 'Alkanes general formula CₙH₂ₙ₊₂ vs alkenes CₙH₂ₙ; fractional distillation of petroleum based on chain length and boiling points; cracking long-chain alkanes; bromine water test (orange to colourless).'
    },
    creativeTasks: [
      {
        task: 'Petroleum Fraction Column: Draw the fractional distillation column on paper; arrange Refinery Gas, Gasoline, Naphtha, Kerosene, Diesel, Fuel Oil, and Bitumen from top to bottom; annotate boiling point, viscosity, and flammability trends.',
        type: 'sketch'
      },
      {
        task: 'Ask AI Chat Tutor: "Explain the chemical mechanism of bromine water decolourisation by ethene with structural formula diagrams and balanced equation."',
        type: 'website_tool',
        toolTarget: 'ai_tutor',
        aiPrompt: 'Explain the chemical mechanism of bromine water decolourisation by ethene with structural formula diagrams and balanced equation.'
      },
      {
        task: 'Launch Quiz Arena on C11: Complete the organic chemistry diagnostic quiz.',
        type: 'website_tool',
        toolTarget: 'quiz'
      }
    ]
  },
  'C12': {
    code: 'C12',
    title: 'Experimental Techniques & Analysis',
    subject: 'chemistry',
    slideRecap: {
      slideRange: 'Slides 1–4',
      deckTitle: 'Qualitative Analysis: Flame Tests, Cations, Anions & Gases',
      keyConcepts: 'Flame tests (Li⁺ red, Na⁺ yellow, K⁺ lilac, Cu²⁺ blue-green); aqueous NaOH and NH₃ cation precipitates (Fe²⁺ green, Fe³⁺ red-brown, Cu²⁺ light blue, Zn²⁺ white soluble in both, Ca²⁺ white insoluble); halide anion tests with AgNO₃; gas tests (H₂, O₂, CO₂, Cl₂, NH₃).'
    },
    creativeTasks: [
      {
        task: 'Qualitative Analysis Flashcard Grid: Fold an A4 paper into a 3-column table for Cations: Aqueous NaOH observation, Aqueous NH₃ observation, and Flame test colour; highlight which precipitates dissolve in excess reagent.',
        type: 'sketch'
      },
      {
        task: 'Ask AI Chat Tutor: "Give me 3 Paper 6 unknown salt identification puzzles where I have to deduce the cation and anion from experimental observations, and tell me if I get them right."',
        type: 'website_tool',
        toolTarget: 'ai_tutor',
        aiPrompt: 'Give me 3 Paper 6 unknown salt identification puzzles where I have to deduce the cation and anion from experimental observations, and tell me if I get them right.'
      },
      {
        task: 'Exam Guidelines Tab: Inspect the official Cambridge Qualitative Analysis Notes tables and commit the key colours to memory.',
        type: 'website_tool',
        toolTarget: 'guidelines'
      }
    ]
  },

  // ==========================================
  // PHYSICS (P1 - P5)
  // ==========================================
  'P1': {
    code: 'P1',
    title: 'Motion, Forces & Energy',
    subject: 'physics',
    slideRecap: {
      slideRange: 'Slides 1–4',
      deckTitle: 'Speed-Time Graphs, Newton\'s Laws & Work/Energy Formulas',
      keyConcepts: 'Calculating acceleration from speed-time gradient (a = Δv/t); calculating distance as area under speed-time graph; W = mg (using g = 9.8 N/kg); F = ma; density ρ = m/V; Work = F × d; Ek = ½mv²; GPE = mgΔh.'
    },
    creativeTasks: [
      {
        task: 'Speed & Step Physics: Measure a 10-metre distance in a room or corridor; time yourself walking and jogging with a stopwatch; calculate speed v = s/t and sketch a realistic speed-time graph with acceleration, constant speed, and deceleration.',
        type: 'hands_on'
      },
      {
        task: 'Ask AI Chat Tutor: "Give me a multi-stage Cambridge Paper 4 physics problem involving a car accelerating, cruising, and braking; test me on calculating both acceleration and total distance from area under the graph."',
        type: 'website_tool',
        toolTarget: 'ai_tutor',
        aiPrompt: 'Give me a multi-stage Cambridge Paper 4 physics problem involving a car accelerating, cruising, and braking; test me on calculating both acceleration and total distance from area under the graph.'
      },
      {
        task: 'Launch Quiz Arena on P1: Test your calculation speed and score 80%+ to flip your traffic light to Green.',
        type: 'website_tool',
        toolTarget: 'quiz'
      }
    ]
  },
  'P2': {
    code: 'P2',
    title: 'Thermal Physics',
    subject: 'physics',
    slideRecap: {
      slideRange: 'Slides 1–3',
      deckTitle: 'Conduction, Convection & Radiation Emissivity',
      keyConcepts: 'Conduction mechanism via lattice vibrations and free delocalised electrons in metals; convection fluid currents driven by density changes; thermal radiation emissivity/absorption on dull black vs shiny silver surfaces.'
    },
    creativeTasks: [
      {
        task: 'Tactile Thermal Check: Touch a metal chair leg/door handle and a wooden tabletop in the same room; explain aloud to yourself why the metal feels colder even though both are at identical room temperature.',
        type: 'hands_on'
      },
      {
        task: 'Vacuum Flask Annotated Diagram: Sketch an insulated thermos vacuum flask on paper; label where conduction, convection, and radiation are stopped (vacuum gap, silvered walls, plastic stopper).',
        type: 'sketch'
      },
      {
        task: 'Ask AI Chat Tutor: "Explain the mechanism of convection in water when heated at the base of a beaker in terms of particle spacing and fluid density changes for Paper 4."',
        type: 'website_tool',
        toolTarget: 'ai_tutor',
        aiPrompt: 'Explain the mechanism of convection in water when heated at the base of a beaker in terms of particle spacing and fluid density changes for Paper 4.'
      }
    ]
  },
  'P3': {
    code: 'P3',
    title: 'Waves, Light & Sound',
    subject: 'physics',
    slideRecap: {
      slideRange: 'Slides 1–3',
      deckTitle: 'Wave Speed Equation v = fλ, Snell\'s Law & EM Spectrum',
      keyConcepts: 'Transverse vs longitudinal waves; wave equation v = f × λ; reflection and refraction index n = sin i / sin r; total internal reflection critical angle sin c = 1/n; ordering the electromagnetic spectrum from radio to gamma rays.'
    },
    creativeTasks: [
      {
        task: 'Glass Refraction Experiment: Shine a small flashlight or phone light through a clear glass of water onto a sheet of paper at an angle; observe the light bending towards the normal and identify the refracted ray.',
        type: 'hands_on'
      },
      {
        task: 'EM Spectrum Mnemonic & Hazards: Write out the 7 regions of the EM spectrum in order of increasing frequency; annotate the primary practical use and biological hazard of Ultraviolet, X-rays, and Gamma rays.',
        type: 'sketch'
      },
      {
        task: 'Ask AI Chat Tutor: "Provide 2 multi-step Cambridge Paper 4 refraction calculation problems using Snell\'s law n = sin i / sin r, and grade my angle calculations."',
        type: 'website_tool',
        toolTarget: 'ai_tutor',
        aiPrompt: 'Provide 2 multi-step Cambridge Paper 4 refraction calculation problems using Snell\'s law n = sin i / sin r, and grade my angle calculations.'
      }
    ]
  },
  'P4': {
    code: 'P4',
    title: 'Electricity & Circuits',
    subject: 'physics',
    slideRecap: {
      slideRange: 'Slides 1–4',
      deckTitle: 'Ohm\'s Law, Series vs Parallel Circuits & Power P = VI',
      keyConcepts: 'Ohm\'s law V = I × R; charge Q = I × t; series resistance R_total = R₁ + R₂; parallel resistance 1/R_total = 1/R₁ + 1/R₂; electrical power P = VI = I²R; electrical energy E = Pt = VIt.'
    },
    creativeTasks: [
      {
        task: 'Dual Circuit Schematic: Draw two circuits on paper side-by-side: two 6Ω resistors in series with a 12V supply vs two 6Ω resistors in parallel with a 12V supply; calculate current through each and total circuit power.',
        type: 'sketch'
      },
      {
        task: 'Ask AI Chat Tutor: "Why is the combined resistance of resistors in parallel ALWAYS smaller than the resistance of the smallest individual resistor? Explain conceptually and mathematically."',
        type: 'website_tool',
        toolTarget: 'ai_tutor',
        aiPrompt: 'Why is the combined resistance of resistors in parallel ALWAYS smaller than the resistance of the smallest individual resistor? Explain conceptually and mathematically.'
      },
      {
        task: 'Launch Quiz Arena on P4: Complete the circuit calculations quiz and achieve 80%+ for a Green grade.',
        type: 'website_tool',
        toolTarget: 'quiz'
      }
    ]
  },
  'P5': {
    code: 'P5',
    title: 'Nuclear & Space Physics',
    subject: 'physics',
    slideRecap: {
      slideRange: 'Slides 1–3',
      deckTitle: 'Nuclear Fusion in the Sun, Planetary Orbits & Star Life Cycles',
      keyConcepts: 'Nuclear fusion in stars converting hydrogen nuclei into helium with energy release; orbital speed v = 2πr / T; star evolutionary lifecycle from nebula to protostar, main sequence, red giant, and white dwarf.'
    },
    creativeTasks: [
      {
        task: 'Star Life-Cycle Comic Strip: Draw a 4-panel timeline showing the life of our Sun: Nebula ➔ Main Sequence Star (balanced gravity and radiation pressure) ➔ Red Giant ➔ White Dwarf; annotate the fuel consumed at each stage.',
        type: 'sketch'
      },
      {
        task: 'Ask AI Chat Tutor: "Give me an orbital speed calculation problem for a satellite orbiting Earth using v = 2πr / T with radius in kilometres and period in hours, and check my unit conversions."',
        type: 'website_tool',
        toolTarget: 'ai_tutor',
        aiPrompt: 'Give me an orbital speed calculation problem for a satellite orbiting Earth using v = 2πr / T with radius in kilometres and period in hours, and check my unit conversions.'
      },
      {
        task: 'Syllabus Notebook: Write your summary note for P5 and rate your physics confidence stars.',
        type: 'website_tool',
        toolTarget: 'notebook'
      }
    ]
  }
};

/**
 * Returns a tailored 3-task revision plan for any Cambridge topic, ensuring:
 * 1. Task 1 is ALWAYS recapping specific slides with slide numbers and key concepts.
 * 2. Subsequent tasks are creative, topic-relevant, blending website tools and creative offline tasks.
 */
export function getRevisionTasksForTopic(topicCode: string, weekNum: number = 1, totalWeeks: number = 6): string[] {
  const cleanCode = (topicCode || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 3) || 'B2';
  const config = TOPIC_REVISION_CONFIGS[cleanCode] || TOPIC_REVISION_CONFIGS[cleanCode.slice(0, 2)] || {
    code: cleanCode,
    title: topicCode,
    subject: cleanCode.startsWith('B') ? 'biology' : cleanCode.startsWith('C') ? 'chemistry' : 'physics',
    slideRecap: {
      slideRange: 'Slides 1–3',
      deckTitle: `${cleanCode} Key Syllabus Concepts`,
      keyConcepts: 'Core definitions, formulas, and experimental methods.'
    },
    creativeTasks: [
      {
        task: `Launch Quiz Arena on ${cleanCode}: Score 80%+ to secure an instant Green traffic light.`,
        type: 'website_tool',
        toolTarget: 'quiz'
      },
      {
        task: `Feynman Technique: Explain the core mechanism of ${cleanCode} aloud for 2 minutes without using notes.`,
        type: 'feynman'
      }
    ]
  };

  // Task 1: Strictly recapping specific slides with slide numbers, deck title, and key concepts
  const task1 = `Recap ${config.slideRecap.slideRange} of ${config.code} (${config.slideRecap.deckTitle}: ${config.slideRecap.keyConcepts})`;

  // Task 2 & Task 3: Creative follow-ups (rotating through the creative pool so subsequent weeks stay novel)
  const creativePool = config.creativeTasks || [];
  const poolLen = Math.max(1, creativePool.length);
  const task2Idx = (weekNum - 1) % poolLen;
  const task3Idx = weekNum % poolLen;

  let task2 = creativePool[task2Idx]?.task || `Launch Quiz Arena on ${config.code}: Achieve 80%+ to secure a Green traffic light.`;
  let task3 = creativePool[task3Idx !== task2Idx ? task3Idx : (task3Idx + 1) % poolLen]?.task || `Feynman Technique: Explain ${config.title} aloud for 2 minutes from memory.`;

  // As the exam nears (final 2 weeks), add timed exam drill flavor to task 3 if available
  if (weekNum >= totalWeeks - 1 && poolLen > 2) {
    const examTask = creativePool.find(t => t.toolTarget === 'exams' || t.task.toLowerCase().includes('past exam') || t.task.toLowerCase().includes('paper 4') || t.task.toLowerCase().includes('paper 6'));
    if (examTask) {
      task3 = examTask.task;
    } else if (creativePool[2]?.task) {
      task3 = creativePool[2].task;
    }
  }

  return [task1, task2, task3];
}

/**
 * Detects interactive quick action metadata from a task description
 */
export function detectTaskAction(taskText: string, topicCode: string): {
  type: 'slides' | 'quiz' | 'ai_tutor' | 'exams' | 'notebook' | 'guidelines' | 'creative';
  label: string;
  badge: string;
  badgeColor: string;
  prompt?: string;
} {
  const t = taskText.toLowerCase();

  if (t.includes('recap slide') || t.includes('review slide') || t.startsWith('recap')) {
    return {
      type: 'slides',
      label: `Open ${topicCode} Slide Deck`,
      badge: '📖 Slides Recap',
      badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
    };
  }

  if (t.includes('quiz arena') || t.includes('practice quiz') || t.includes('10-question diagnostic')) {
    return {
      type: 'quiz',
      label: 'Launch Quiz Arena',
      badge: '🎯 Practice Quiz',
      badgeColor: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30'
    };
  }

  if (t.includes('ask ai') || t.includes('ai chat tutor')) {
    // Extract the quoted prompt if present
    const promptMatch = taskText.match(/["“](.+?)["”]/);
    const prompt = promptMatch ? promptMatch[1] : `Explain key concepts and exam mark scheme points for Cambridge 0653 ${topicCode}`;
    return {
      type: 'ai_tutor',
      label: 'Ask AI Chat Tutor',
      prompt,
      badge: '🤖 AI Chat Tutor',
      badgeColor: 'bg-purple-500/15 text-purple-400 border-purple-500/30'
    };
  }

  if (t.includes('past exams') || t.includes('paper 4') || t.includes('paper 6') || t.includes('specimen')) {
    return {
      type: 'exams',
      label: 'Open Past Exams Vault',
      badge: '📄 Exam Vault',
      badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30'
    };
  }

  if (t.includes('syllabus notebook') || t.includes('notebook')) {
    return {
      type: 'notebook',
      label: 'Open Syllabus Notebook',
      badge: '📓 Notebook',
      badgeColor: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
    };
  }

  if (t.includes('exam guidelines') || t.includes('qualitative analysis notes')) {
    return {
      type: 'guidelines',
      label: 'View Guidelines & Notes',
      badge: '📋 Guidelines',
      badgeColor: 'bg-rose-500/15 text-rose-400 border-rose-500/30'
    };
  }

  if (t.includes('feynman') || t.includes('explain aloud') || t.includes('teach')) {
    return {
      type: 'creative',
      label: 'Mark Done',
      badge: '🗣️ Feynman Technique',
      badgeColor: 'bg-orange-500/15 text-orange-400 border-orange-500/30'
    };
  }

  if (t.includes('sketch') || t.includes('draw') || t.includes('diagram') || t.includes('flashcard') || t.includes('cheat-sheet')) {
    return {
      type: 'creative',
      label: 'Mark Done',
      badge: '🎨 Visual Recall & Sketch',
      badgeColor: 'bg-pink-500/15 text-pink-400 border-pink-500/30'
    };
  }

  if (t.includes('kitchen') || t.includes('experiment') || t.includes('practical') || t.includes('hands-on') || t.includes('demo') || t.includes('pulse')) {
    return {
      type: 'creative',
      label: 'Mark Done',
      badge: '🧪 Hands-On Mini Lab',
      badgeColor: 'bg-teal-500/15 text-teal-400 border-teal-500/30'
    };
  }

  return {
    type: 'creative',
    label: 'Mark Done',
    badge: '⚡ Creative Mastery',
    badgeColor: 'bg-blue-500/15 text-blue-400 border-blue-500/30'
  };
}
