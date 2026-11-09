import { QuizQuestion } from '../types';

/**
 * Authentic Cambridge IGCSE Combined Science 0653 Biology Subtopic Questions.
 * Strictly aligned with Paper 2 Multiple Choice syllabus learning objectives.
 */
export const BIOLOGY_SUBTOPIC_QUESTIONS: Record<string, QuizQuestion[]> = {
  // B3.1 Diffusion
  'B3.1': [
    {
      id: 'b3-1-q1',
      subject: 'biology',
      topicCode: 'B3',
      syllabusRef: 'B3.1',
      question: 'Which statement correctly defines diffusion according to the Cambridge 0653 Biology syllabus?',
      options: [
        'The net movement of particles from a region of higher concentration to a region of lower concentration down a concentration gradient as a result of their random movement',
        'The movement of water molecules from a dilute solution to a concentrated solution across a partially permeable membrane',
        'The movement of mineral ions against a concentration gradient using energy released from cellular respiration',
        'The bulk transport of solid food vacuoles across the cell surface membrane'
      ],
      correctIndex: 0,
      explanation: 'Diffusion is the passive net movement of particles down a concentration gradient caused by their continuous random thermal motion. No cellular energy (ATP) is required.'
    },
    {
      id: 'b3-1-q2',
      subject: 'biology',
      topicCode: 'B3',
      syllabusRef: 'B3.1',
      question: 'Which combination of factors will result in the fastest rate of diffusion into a cell?',
      options: [
        'High temperature, steep concentration gradient, short diffusion distance, large surface area',
        'Low temperature, shallow concentration gradient, long diffusion distance, large surface area',
        'High temperature, shallow concentration gradient, short diffusion distance, small surface area',
        'Low temperature, steep concentration gradient, short diffusion distance, small surface area'
      ],
      correctIndex: 0,
      explanation: 'Diffusion rate increases with higher temperature (greater particle kinetic energy), steeper concentration gradient, shorter diffusion path, and larger surface area-to-volume ratio.'
    },
    {
      id: 'b3-1-q3',
      subject: 'biology',
      topicCode: 'B3',
      syllabusRef: 'B3.1',
      question: 'A crystal of potassium manganate(VII) is placed at the bottom of a beaker of still water. Over several hours, the entire liquid turns purple without stirring. What explains this observation?',
      options: [
        'Potassium manganate(VII) particles and water molecules move randomly in all directions, dispersing until evenly distributed',
        'Water molecules undergo active transport to pull the crystal particles upwards',
        'Convection currents are set up because the purple solution is less dense than pure water',
        'The purple particles expand in size until they fill the entire volume of the beaker'
      ],
      correctIndex: 0,
      explanation: 'Particles in a liquid possess kinetic energy and move randomly. The potassium manganate(VII) particles diffuse from a region of high concentration at the base throughout the beaker down the concentration gradient.'
    },
    {
      id: 'b3-1-q4',
      subject: 'biology',
      topicCode: 'B3',
      syllabusRef: 'B3.1',
      question: 'During human gas exchange, oxygen moves from the alveolar air space into red blood cells in adjacent capillaries. By which physical process does this transfer occur?',
      options: [
        'Diffusion down an oxygen concentration gradient across the alveolar and capillary walls',
        'Active transport using carrier proteins in the epithelial membranes',
        'Osmosis across the moist surfactant layer',
        'Capillary action driven by arterial blood pressure'
      ],
      correctIndex: 0,
      explanation: 'Alveolar air has a higher concentration of oxygen than deoxygenated capillary blood, allowing oxygen to diffuse passively across the thin moist squamous epithelium into the blood.'
    },
    {
      id: 'b3-1-q5',
      subject: 'biology',
      topicCode: 'B3',
      syllabusRef: 'B3.1',
      question: 'Agar jelly cubes of side lengths 1 cm, 2 cm, and 3 cm soaked in phenolphthalein and dilute NaOH are placed in dilute hydrochloric acid. Which cube will be completely decolourised first?',
      options: [
        'The 1 cm cube, because it has the largest surface area-to-volume ratio and shortest distance to its centre',
        'The 3 cm cube, because it has the largest total surface area exposed to the acid',
        'The 2 cm cube, because it has the optimum balance between volume and surface area',
        'All three cubes decolourise at exactly the same time because acid concentration is identical'
      ],
      correctIndex: 0,
      explanation: 'Smaller organisms and cubes have a significantly larger surface area-to-volume ratio. The acid diffuses through the 1 cm cube to its centre much faster due to the shorter diffusion path.'
    },
    {
      id: 'b3-1-q6',
      subject: 'biology',
      topicCode: 'B3',
      syllabusRef: 'B3.1',
      question: 'Why do large multicellular organisms such as mammals require specialised transport systems (e.g. heart and blood vessels) unlike single-celled amoebae?',
      options: [
        'They have a small surface area-to-volume ratio and long diffusion distances, making direct diffusion too slow to supply internal cells',
        'Their cell surface membranes are completely impermeable to oxygen and glucose',
        'Single-celled amoebae do not carry out cellular respiration or require nutrients',
        'Diffusion cannot occur through eukaryotic cell walls'
      ],
      correctIndex: 0,
      explanation: 'As organism size increases, surface area-to-volume ratio drops drastically and internal cells are too far from external surfaces for simple diffusion alone to meet metabolic demands.'
    }
  ],

  // B3.2 Osmosis & Potato Practical
  'B3.2': [
    {
      id: 'b3-2-q1',
      subject: 'biology',
      topicCode: 'B3',
      syllabusRef: 'B3.2',
      question: 'Which statement accurately defines osmosis?',
      options: [
        'The net movement of water molecules from a region of higher water potential to a region of lower water potential through a partially permeable membrane',
        'The movement of solute particles from a concentrated solution to a dilute solution through a permeable membrane',
        'The active pumping of water molecules across a cell wall using ATP energy',
        'The diffusion of dissolved minerals from high concentration to low concentration'
      ],
      correctIndex: 0,
      explanation: 'Osmosis is specifically the passive net diffusion of water molecules down their water potential gradient across a selectively (partially) permeable membrane.'
    },
    {
      id: 'b3-2-q2',
      subject: 'biology',
      topicCode: 'B3',
      syllabusRef: 'B3.2',
      question: 'A plant cell is placed in pure distilled water for 30 minutes. What will happen to the cell?',
      options: [
        'Water enters by osmosis; the cell becomes turgid and does not burst due to its rigid cellulose cell wall',
        'Water leaves by osmosis; the cell becomes flaccid and plasmolysed',
        'Water enters by osmosis until the cell bursts and lyses completely',
        'Solute particles exit by diffusion until the cytoplasm has zero concentration'
      ],
      correctIndex: 0,
      explanation: 'Pure water has a higher water potential than the plant cell sap. Water enters by osmosis, swelling the vacuole and pushing against the cell wall, generating turgor pressure. The rigid wall prevents bursting.'
    },
    {
      id: 'b3-2-q3',
      subject: 'biology',
      topicCode: 'B3',
      syllabusRef: 'B3.2',
      question: 'What happens to human red blood cells when placed into a concentrated sodium chloride solution?',
      options: [
        'Water leaves the red blood cells by osmosis down a water potential gradient, causing them to shrink and crenate',
        'Water enters by osmosis, causing the red blood cells to swell and lyse',
        'Sodium chloride enters by osmosis, increasing the internal volume of the red blood cells',
        'The red blood cells develop a protective cellulose wall to prevent water loss'
      ],
      correctIndex: 0,
      explanation: 'In concentrated salt solution, the external water potential is lower than inside the red blood cell. Water moves out by osmosis, causing the cell to shrink (crenation).'
    },
    {
      id: 'b3-2-q4',
      subject: 'biology',
      topicCode: 'B3',
      syllabusRef: 'B3.2',
      question: 'In a potato cylinder osmosis experiment, why are the potato cylinders blotted with a paper towel before weighing?',
      options: [
        'To remove excess surface liquid which would otherwise add unmeasured mass and cause systematic error',
        'To squeeze out internal sap from the potato cells before recording',
        'To sterilise the potato cylinders and prevent bacterial growth during the test',
        'To ensure the potato skin is removed completely before measuring'
      ],
      correctIndex: 0,
      explanation: 'Blotting gently removes adhering surface water from the exterior of the cylinder so that only changes in internal mass due to water movement into or out of cells are measured.'
    },
    {
      id: 'b3-2-q5',
      subject: 'biology',
      topicCode: 'B3',
      syllabusRef: 'B3.2',
      question: 'On a graph of percentage change in potato cylinder mass against sucrose concentration, what is indicated by the point where the line crosses the x-axis (0% mass change)?',
      options: [
        'The sucrose concentration that has an equal water potential to the potato cell sap (isotonic)',
        'The concentration at which all water has evaporated from the potato cylinders',
        'The point where cell membranes have become completely destroyed by heat',
        'The point where potato cells have reached maximum turgor pressure'
      ],
      correctIndex: 0,
      explanation: 'At 0% mass change, there is no net movement of water into or out of the potato cells because the external solution and internal cell sap have identical water potentials (isotonic).'
    },
    {
      id: 'b3-2-q6',
      subject: 'biology',
      topicCode: 'B3',
      syllabusRef: 'B3.2',
      question: 'A potato cylinder with an initial mass of 2.00 g has a final mass of 2.30 g after soaking in water. What is the percentage change in mass?',
      options: [
        '+15.0%',
        '+13.0%',
        '+30.0%',
        '+0.30%'
      ],
      correctIndex: 0,
      explanation: 'Percentage change = [(final mass - initial mass) / initial mass] × 100 = [(2.30 - 2.00) / 2.00] × 100 = (0.30 / 2.00) × 100 = +15.0%.'
    }
  ],

  // B3.3 Active Transport
  'B3.3': [
    {
      id: 'b3-3-q1',
      subject: 'biology',
      topicCode: 'B3',
      syllabusRef: 'B3.3',
      question: 'Which statement correctly defines active transport?',
      options: [
        'The movement of particles through a cell membrane from a region of lower concentration to a region of higher concentration using energy from respiration',
        'The movement of water molecules down a water potential gradient across a partially permeable membrane',
        'The passive movement of dissolved gases along a concentration gradient without cellular energy',
        'The uptake of water by plant root hair cells driven by transpiration pull'
      ],
      correctIndex: 0,
      explanation: 'Active transport requires carrier proteins embedded in the membrane and ATP energy from cellular respiration to pump particles against (up) their concentration gradient.'
    },
    {
      id: 'b3-3-q2',
      subject: 'biology',
      topicCode: 'B3',
      syllabusRef: 'B3.3',
      question: 'Which biological process relies directly on active transport?',
      options: [
        'Uptake of mineral ions (such as nitrate) by plant root hair cells from low concentrations in soil',
        'Diffusion of oxygen into blood capillaries in human lung alveoli',
        'Loss of water vapour from stomata during transpiration',
        'Movement of carbon dioxide into leaf mesophyll cells through open stomata'
      ],
      correctIndex: 0,
      explanation: 'Soil water generally contains lower mineral ion concentrations than root hair cell cytoplasm. Plants use active transport powered by ATP from respiration to absorb these ions against the gradient.'
    },
    {
      id: 'b3-3-q3',
      subject: 'biology',
      topicCode: 'B3',
      syllabusRef: 'B3.3',
      question: 'A chemical metabolic poison that inhibits cellular respiration (such as cyanide) is applied to root cells. What will be the immediate effect on ion uptake?',
      options: [
        'Active transport stops because no ATP is generated by respiration to power protein carriers',
        'Diffusion rate increases because cell walls become more permeable',
        'Water uptake by osmosis doubles to compensate for ion loss',
        'The root cells begin photosynthesising to provide alternative energy'
      ],
      correctIndex: 0,
      explanation: 'Active transport is dependent on ATP released during aerobic respiration. Inhibiting respiration deprives carrier proteins of energy, halting active uptake.'
    }
  ],

  // B4.1 Biological Molecules & Food Tests
  'B4.1': [
    {
      id: 'b4-1-q1',
      subject: 'biology',
      topicCode: 'B4',
      syllabusRef: 'B4.1',
      question: 'A student tests an unknown liquid by adding Benedict’s solution and heating in a water bath at 80 °C. The mixture changes from blue to brick-red. Which nutrient is present?',
      options: [
        'Reducing sugar (e.g. glucose)',
        'Starch',
        'Protein',
        'Lipid'
      ],
      correctIndex: 0,
      explanation: 'Benedict’s solution tests for reducing sugars. Upon heating, it forms a coloured precipitate: green (low), yellow/orange (medium), or brick-red (high concentration).'
    },
    {
      id: 'b4-1-q2',
      subject: 'biology',
      topicCode: 'B4',
      syllabusRef: 'B4.1',
      question: 'Which reagent and positive colour change correctly tests for the presence of proteins?',
      options: [
        'Biuret reagent, turning from pale blue to lilac / purple',
        'Iodine solution, turning from brown-orange to blue-black',
        'Ethanol emulsion test, turning from clear to cloudy white emulsion',
        'Benedict’s reagent heated, turning from blue to brick-red'
      ],
      correctIndex: 0,
      explanation: 'Biuret reagent (dilute sodium hydroxide and copper(II) sulfate) tests for peptide bonds in proteins, giving a lilac / violet colour if positive.'
    },
    {
      id: 'b4-1-q3',
      subject: 'biology',
      topicCode: 'B4',
      syllabusRef: 'B4.1',
      question: 'In the ethanol emulsion test for lipids, what procedure is carried out and what indicates a positive result?',
      options: [
        'Dissolve sample in ethanol, pour into equal volume of cold water; a cloudy white emulsion forms',
        'Add ethanol and boil over a naked Bunsen flame; a bright blue solution forms',
        'Add dilute hydrochloric acid and ethanol; effervescence of carbon dioxide is observed',
        'Mix with Benedict’s solution and shake; a purple precipitate settles'
      ],
      correctIndex: 0,
      explanation: 'Lipids dissolve in ethanol but are insoluble in water. Adding water causes dissolved lipid droplets to precipitate as a milky white emulsion.'
    },
    {
      id: 'b4-1-q4',
      subject: 'biology',
      topicCode: 'B4',
      syllabusRef: 'B4.1',
      question: 'What are the smaller building-block molecules (subunits) that make up starch and glycogen?',
      options: [
        'Glucose molecules',
        'Amino acids',
        'Fatty acids and glycerol',
        'Nucleotides'
      ],
      correctIndex: 0,
      explanation: 'Starch and glycogen are polysaccharides synthesized by linking together many glucose subunits.'
    },
    {
      id: 'b4-1-q5',
      subject: 'biology',
      topicCode: 'B4',
      syllabusRef: 'B4.1',
      question: 'Which elements are present in all proteins but are NOT present in carbohydrates or lipids?',
      options: [
        'Nitrogen (and frequently sulfur)',
        'Carbon and hydrogen',
        'Oxygen and phosphorus',
        'Sodium and chlorine'
      ],
      correctIndex: 0,
      explanation: 'Carbohydrates and lipids contain only C, H, and O. Proteins are made of amino acids, which contain nitrogen (N) and often sulfur (S) in addition to C, H, and O.'
    }
  ],

  // B5.1 Enzymes
  'B5.1': [
    {
      id: 'b5-1-q1',
      subject: 'biology',
      topicCode: 'B5',
      syllabusRef: 'B5.1',
      question: 'Which statement correctly defines an enzyme according to the Cambridge 0653 Biology syllabus?',
      options: [
        'A biological catalyst that is a protein and speeds up the rate of a chemical reaction without being changed or consumed',
        'A carbohydrate molecule that provides metabolic fuel during aerobic respiration',
        'A hormone that circulates in the blood to regulate blood glucose concentration',
        'An inorganic mineral ion that prevents cellular decay in human bone tissue'
      ],
      correctIndex: 0,
      explanation: 'Enzymes are protein biological catalysts that lower activation energy and increase reaction rates without being consumed.'
    },
    {
      id: 'b5-1-q2',
      subject: 'biology',
      topicCode: 'B5',
      syllabusRef: 'B5.1',
      question: 'Why does an enzyme lose its catalytic activity when heated to temperatures well above its optimum (e.g. 70 °C)?',
      options: [
        'High thermal energy breaks bonds maintaining the enzyme’s tertiary structure, permanently altering the active site shape so substrate no longer fits (denaturation)',
        'The substrate molecules move too fast to collide with the enzyme',
        'The enzyme breaks down into carbon dioxide and water molecules',
        'The activation energy of the reaction drops to zero'
      ],
      correctIndex: 0,
      explanation: 'At excessive temperatures, intense atomic vibrations break hydrogen and ionic bonds holding the enzyme protein in shape, permanently altering the complementary active site (denaturation).'
    },
    {
      id: 'b5-1-q3',
      subject: 'biology',
      topicCode: 'B5',
      syllabusRef: 'B5.1',
      question: 'In the lock-and-key hypothesis of enzyme action, what do the "lock" and "key" represent?',
      options: [
        'The enzyme’s active site is the lock, and the complementary substrate molecule is the key',
        'The substrate molecule is the lock, and the enzyme protein is the key',
        'The cell membrane is the lock, and the enzyme is the key',
        'The product molecule is the lock, and the cofactor is the key'
      ],
      correctIndex: 0,
      explanation: 'The active site has a specific three-dimensional geometric shape (the lock) complementary to the specific substrate molecule (the key).'
    },
    {
      id: 'b5-1-q4',
      subject: 'biology',
      topicCode: 'B5',
      syllabusRef: 'B5.1',
      question: 'In an experiment investigating amylase activity across pH 4, 6, 7, 8, and 10, how is the completion of starch digestion determined?',
      options: [
        'Drops of the mixture are added to iodine solution on a spotting tile until the iodine remains brown-orange instead of turning blue-black',
        'The mixture is heated with Benedict’s solution until it turns lilac',
        'The mass of the reaction tube is monitored on an analytical balance until it ceases to decrease',
        'A glowing splint is inserted into the tube until it relights'
      ],
      correctIndex: 0,
      explanation: 'Amylase breaks down starch into maltose. Digestion is complete when a sample from the mixture no longer produces a blue-black colour with iodine (iodine stays brown-orange).'
    }
  ],

  // B6.1 & B6.2 Photosynthesis & Leaf Structure
  'B6.1': [
    {
      id: 'b6-1-q1',
      subject: 'biology',
      topicCode: 'B6',
      syllabusRef: 'B6.1',
      question: 'Which word equation correctly summarizes photosynthesis in green plants?',
      options: [
        'Carbon dioxide + water → glucose + oxygen (in the presence of light and chlorophyll)',
        'Glucose + oxygen → carbon dioxide + water (releasing energy)',
        'Carbon dioxide + glucose → water + oxygen (in the presence of chlorophyll)',
        'Oxygen + water → glucose + carbon dioxide (in darkness)'
      ],
      correctIndex: 0,
      explanation: 'Photosynthesis synthesizes glucose and oxygen from carbon dioxide and water, converting light energy into chemical energy stored in glucose.'
    },
    {
      id: 'b6-1-q2',
      subject: 'biology',
      topicCode: 'B6',
      syllabusRef: 'B6.1',
      question: 'Which green pigment absorbs light energy during photosynthesis, and where inside plant cells is it located?',
      options: [
        'Chlorophyll, located in chloroplasts',
        'Haemoglobin, located in red blood cells',
        'Carotene, located in the central vacuole',
        'Melanin, located in the nucleus'
      ],
      correctIndex: 0,
      explanation: 'Chlorophyll is the green light-absorbing pigment embedded in thylakoid membranes within plant cell chloroplasts.'
    },
    {
      id: 'b6-1-q3',
      subject: 'biology',
      topicCode: 'B6',
      syllabusRef: 'B6.1',
      question: 'What is meant by a "limiting factor" in photosynthesis?',
      options: [
        'An environmental factor in shortest supply that directly restricts the rate of photosynthesis',
        'The toxic buildup of oxygen gas inside leaf air spaces',
        'The maximum surface area of a leaf exposed to sunlight',
        'The structural thickness of the waxy cuticle layer'
      ],
      correctIndex: 0,
      explanation: 'A limiting factor is a condition (e.g. light intensity, carbon dioxide concentration, or temperature) that is at its least favorable value, preventing any further increase in rate.'
    },
    {
      id: 'b6-1-q4',
      subject: 'biology',
      topicCode: 'B6',
      syllabusRef: 'B6.1',
      question: 'In an experiment with aquatic pondweed (Elodea), how is the rate of photosynthesis directly measured?',
      options: [
        'By counting the number of oxygen bubbles released per minute from the cut stem',
        'By recording the change in water temperature with a thermocouple',
        'By measuring the volume of water absorbed through the roots',
        'By testing the pond water with Biuret reagent'
      ],
      correctIndex: 0,
      explanation: 'Photosynthesising Elodea produces oxygen gas bubbles from the stem; counting bubbles per unit time (or collecting gas in a capillary tube) gives an index of photosynthetic rate.'
    }
  ],

  // B7.1 - B7.3 Nutrition & Digestion
  'B7.1': [
    {
      id: 'b7-1-q1',
      subject: 'biology',
      topicCode: 'B7',
      syllabusRef: 'B7.1',
      question: 'Which dietary deficiency disease is caused by a lack of Vitamin C, causing bleeding gums and poor wound healing?',
      options: [
        'Scurvy',
        'Rickets',
        'Anaemia',
        'Kwashiorkor'
      ],
      correctIndex: 0,
      explanation: 'Vitamin C is required for collagen synthesis and connective tissue maintenance; severe deficiency causes scurvy (bleeding gums and skin lesions).'
    },
    {
      id: 'b7-1-q2',
      subject: 'biology',
      topicCode: 'B7',
      syllabusRef: 'B7.1',
      question: 'Which mineral ion is essential for synthesizing haemoglobin in red blood cells to transport oxygen?',
      options: [
        'Iron',
        'Calcium',
        'Iodine',
        'Magnesium'
      ],
      correctIndex: 0,
      explanation: 'Iron is the central prosthetic group in haemoglobin that binds oxygen molecules reversibly. Lack of dietary iron leads to anaemia.'
    }
  ],
  'B7.3': [
    {
      id: 'b7-3-q1',
      subject: 'biology',
      topicCode: 'B7',
      syllabusRef: 'B7.3',
      question: 'What is the function of bile in human digestion?',
      options: [
        'It neutralises acidic gastric chyme from the stomach and emulsifies large lipid droplets into smaller droplets to increase surface area for lipase',
        'It contains proteases that chemically break down proteins into amino acids',
        'It converts starch directly into maltose in the duodenum',
        'It kills pathogenic bacteria in the stomach using concentrated hydrochloric acid'
      ],
      correctIndex: 0,
      explanation: 'Bile is an alkaline fluid produced by the liver, stored in the gall bladder. It neutralises stomach acid in the duodenum and emulsifies fats (mechanical digestion) to boost lipase efficiency.'
    },
    {
      id: 'b7-3-q2',
      subject: 'biology',
      topicCode: 'B7',
      syllabusRef: 'B7.3',
      question: 'Which digestive enzyme is produced by the salivary glands and pancreas to digest starch into maltose?',
      options: [
        'Amylase',
        'Pepsin',
        'Lipase',
        'Maltase'
      ],
      correctIndex: 0,
      explanation: 'Amylase breaks down starch (a polysaccharide) into maltose (a disaccharide).'
    },
    {
      id: 'b7-3-q3',
      subject: 'biology',
      topicCode: 'B7',
      syllabusRef: 'B7.3',
      question: 'Which adaptation of the human small intestine (ileum) facilitates rapid absorption of digested nutrients?',
      options: [
        'Millions of microscopic villi and microvilli providing an enormous surface area, a single-cell thick epithelium, and dense capillary networks',
        'Thick muscular walls lined with heavy keratinized stratified squamous cells',
        'A strongly acidic pH that destroys all cellular material',
        'Absence of any blood or lymphatic vessels'
      ],
      correctIndex: 0,
      explanation: 'Villi and microvilli dramatically expand internal surface area. Nutrients have a very short diffusion pathway (one cell thick) into capillaries and lacteals.'
    }
  ],

  // B8.1 - B8.3 Plant Transport & Transpiration
  'B8.1': [
    {
      id: 'b8-1-q1',
      subject: 'biology',
      topicCode: 'B8',
      syllabusRef: 'B8.1',
      question: 'What are the functions of xylem and phloem vessels in flowering plants?',
      options: [
        'Xylem transports water and dissolved mineral ions upwards; phloem transports sucrose and amino acids (translocation) to growing regions and storage organs',
        'Xylem transports glucose to roots; phloem transports water and minerals to flowers',
        'Xylem produces pollen grains; phloem produces cellulose cell walls',
        'Xylem and phloem both exclusively transport starch downwards into soil'
      ],
      correctIndex: 0,
      explanation: 'Xylem consists of dead, hollow, lignified vessels transporting water and mineral ions unidirectionally from roots to leaves. Phloem transports soluble organic nutrients (sucrose, amino acids) bidirectionally.'
    }
  ],
  'B8.3': [
    {
      id: 'b8-3-q1',
      subject: 'biology',
      topicCode: 'B8',
      syllabusRef: 'B8.3',
      question: 'Which statement correctly defines transpiration?',
      options: [
        'The loss of water vapour from plant leaves by evaporation at the surfaces of mesophyll cells followed by diffusion of water vapour through stomata',
        'The active pumping of water from root cortex cells into xylem vessels',
        'The production of liquid water droplets during aerobic respiration in leaf cells',
        'The movement of sucrose solution through phloem sieve tubes'
      ],
      correctIndex: 0,
      explanation: 'Transpiration is the passive evaporation of water from moist mesophyll surfaces into leaf air spaces, followed by diffusion out through open stomatal pores.'
    },
    {
      id: 'b8-3-q2',
      subject: 'biology',
      topicCode: 'B8',
      syllabusRef: 'B8.3',
      question: 'Which environmental conditions produce the highest rate of transpiration in a leafy shoot?',
      options: [
        'High temperature, low humidity, high wind speed, high light intensity',
        'Low temperature, high humidity, still air, darkness',
        'High temperature, high humidity, still air, darkness',
        'Low temperature, low humidity, still air, high light intensity'
      ],
      correctIndex: 0,
      explanation: 'High temperature increases water particle evaporation rate; low humidity steepens the water vapour concentration gradient; wind removes humid air from leaf surfaces; light stimulates stomata to open.'
    }
  ],

  // B9.2 - B9.4 Heart & Blood
  'B9.2': [
    {
      id: 'b9-2-q1',
      subject: 'biology',
      topicCode: 'B9',
      syllabusRef: 'B9.2',
      question: 'Why does the left ventricle of the mammalian heart have a significantly thicker muscular wall than the right ventricle?',
      options: [
        'The left ventricle must pump blood at high pressure throughout the entire systemic body circulation, whereas the right ventricle only pumps to the nearby lungs',
        'The left ventricle receives deoxygenated blood that requires extra force to filter',
        'The left ventricle stores blood during exercise while the right ventricle remains empty',
        'The right ventricle contains valves while the left ventricle does not'
      ],
      correctIndex: 0,
      explanation: 'The right ventricle pumps blood a short distance to the lungs under low pressure to prevent capillary damage. The left ventricle generates high hydrostatic pressure to circulate blood through systemic arteries.'
    },
    {
      id: 'b9-2-q2',
      subject: 'biology',
      topicCode: 'B9',
      syllabusRef: 'B9.2',
      question: 'Which blood vessels supply oxygen and glucose directly to the heart muscle (myocardium)?',
      options: [
        'Coronary arteries',
        'Pulmonary veins',
        'Vena cava',
        'Renal arteries'
      ],
      correctIndex: 0,
      explanation: 'Coronary arteries branch from the aorta to deliver oxygenated, nutrient-rich blood to cardiac muscle cells. Blockage leads to coronary heart disease.'
    }
  ],
  'B9.3': [
    {
      id: 'b9-3-q1',
      subject: 'biology',
      topicCode: 'B9',
      syllabusRef: 'B9.3',
      question: 'Which structural features distinguish arteries from veins?',
      options: [
        'Arteries have thick muscular walls with elastic tissue and narrow lumens with no valves; veins have thinner walls, wide lumens, and semilunar valves',
        'Arteries have thin walls and wide lumens; veins have thick walls and no valves',
        'Arteries always carry deoxygenated blood; veins always carry oxygenated blood',
        'Arteries are one cell thick; veins have multiple layers of cartilage'
      ],
      correctIndex: 0,
      explanation: 'Arteries withstand and maintain high pulsating blood pressure from the heart with thick muscular/elastic walls. Veins carry low-pressure blood back to the heart and need valves to prevent backflow.'
    }
  ],

  // B11.1 Gas Exchange
  'B11.1': [
    {
      id: 'b11-1-q1',
      subject: 'biology',
      topicCode: 'B11',
      syllabusRef: 'B11.1',
      question: 'What muscular movements occur during human inhalation (breathing in)?',
      options: [
        'External intercostal muscles contract pulling ribs up and out; diaphragm contracts and flattens; thorax volume increases, decreasing internal pressure',
        'External intercostal muscles relax pulling ribs down and in; diaphragm relaxes and domes up; thorax volume decreases',
        'Internal intercostal muscles contract; diaphragm relaxes and arches upwards; lungs compress air outwards',
        'The stomach contracts downwards while the trachea expands'
      ],
      correctIndex: 0,
      explanation: 'Inhalation is active: external intercostals contract (ribcage moves up & out) and the diaphragm contracts (flattens). Thorax volume expands, lowering pressure below atmospheric, so air rushes in.'
    },
    {
      id: 'b11-1-q2',
      subject: 'biology',
      topicCode: 'B11',
      syllabusRef: 'B11.1',
      question: 'How are human alveoli adapted for efficient gas exchange?',
      options: [
        'Enormous total surface area, one-cell-thick squamous epithelial walls, moist lining, and an extensive network of blood capillaries',
        'Thick walls lined with cilia and thick cartilage rings to prevent collapse',
        'Dry surfaces and zero blood supply to minimize fluid interference',
        'Thick muscular sphincters that pump air into the lymphatic system'
      ],
      correctIndex: 0,
      explanation: 'Alveoli have a vast surface area, microscopic diffusion distance (one cell thick), moist surfaces for gases to dissolve, and rich capillary blood flow maintaining steep concentration gradients.'
    }
  ],

  // B12.1 Respiration
  'B12.1': [
    {
      id: 'b12-1-q1',
      subject: 'biology',
      topicCode: 'B12',
      syllabusRef: 'B12.1',
      question: 'Which balanced chemical equation represents aerobic cellular respiration in human cells?',
      options: [
        'C6H12O6 + 6O2 → 6CO2 + 6H2O',
        '6CO2 + 6H2O → C6H12O6 + 6O2',
        'C6H12O6 → 2C2H5OH + 2CO2',
        'C6H12O6 → 2C3H6O3'
      ],
      correctIndex: 0,
      explanation: 'Aerobic respiration completely breaks down 1 mole of glucose using 6 moles of oxygen to produce 6 moles of carbon dioxide, 6 moles of water, and cellular energy (ATP).'
    },
    {
      id: 'b12-1-q2',
      subject: 'biology',
      topicCode: 'B12',
      syllabusRef: 'B12.1',
      question: 'What is the end product of anaerobic respiration in vigorously exercising human muscle tissue?',
      options: [
        'Lactic acid (lactate)',
        'Ethanol and carbon dioxide',
        'Water and carbon dioxide',
        'Urea and glucose'
      ],
      correctIndex: 0,
      explanation: 'In human muscles during intense exercise when oxygen supply is insufficient, glucose is partially broken down into lactic acid, creating an oxygen debt.'
    }
  ],

  // B15.1 - B15.3 Ecology & Carbon Cycle
  'B15.1': [
    {
      id: 'b15-1-q1',
      subject: 'biology',
      topicCode: 'B15',
      syllabusRef: 'B15.1',
      question: 'What is the principal source of energy for almost all biological ecosystems on Earth?',
      options: [
        'Light energy from the Sun',
        'Geothermal energy from deep ocean thermal vents',
        'Chemical energy stored in fossil fuels',
        'Thermal energy released from volcanic magma'
      ],
      correctIndex: 0,
      explanation: 'The Sun is the ultimate source of energy: producers convert light into chemical energy via photosynthesis, which is transferred through food webs.'
    },
    {
      id: 'b15-1-q2',
      subject: 'biology',
      topicCode: 'B15',
      syllabusRef: 'B15.1',
      question: 'Approximately what percentage of energy is transferred from one trophic level to the next in a typical food chain?',
      options: [
        'Approximately 10%',
        'Approximately 50%',
        'Approximately 90%',
        'Approximately 100%'
      ],
      correctIndex: 0,
      explanation: 'Roughly 90% of energy is lost at each trophic level via heat from respiration, uneaten parts, excretion, and movement. Only ~10% is incorporated into new biomass.'
    }
  ],
  'B15.3': [
    {
      id: 'b15-3-q1',
      subject: 'biology',
      topicCode: 'B15',
      syllabusRef: 'B15.3',
      tier: 'Core',
      question: 'Which biological process removes carbon dioxide directly from the Earth’s atmosphere?',
      options: [
        'Photosynthesis by plants and algae',
        'Aerobic respiration by animals',
        'Combustion of fossil fuels',
        'Decomposition of dead organic matter by bacteria'
      ],
      correctIndex: 0,
      explanation: 'Photosynthesis is the primary natural process fixing gaseous atmospheric carbon dioxide into organic carbohydrates.'
    }
  ],

  // B1.1 Characteristics of Living Organisms
  'B1.1': [
    {
      id: 'b1-1-q1',
      subject: 'biology',
      topicCode: 'B1',
      syllabusRef: 'B1.1',
      tier: 'Core',
      question: 'Which characteristic of all living organisms is defined as the chemical reactions in cells that break down nutrient molecules and release energy for metabolism?',
      options: [
        'Respiration',
        'Excretion',
        'Nutrition',
        'Sensitivity'
      ],
      correctIndex: 0,
      explanation: 'Respiration is the cellular process breaking down nutrient molecules (such as glucose) to release energy. Excretion is the removal of toxic waste products of metabolism.'
    },
    {
      id: 'b1-1-q2',
      subject: 'biology',
      topicCode: 'B1',
      syllabusRef: 'B1.1',
      tier: 'Core',
      question: 'Which life process is defined as the removal from organisms of the waste products of metabolism, toxic substances, and substances in excess of requirements?',
      options: [
        'Excretion',
        'Egestion',
        'Nutrition',
        'Respiration'
      ],
      correctIndex: 0,
      explanation: 'Excretion is the removal of metabolic waste (such as urea and CO2). Egestion is the passing out of undigested food as faeces through the anus, which is not metabolic waste.'
    },
    {
      id: 'b1-1-q3',
      subject: 'biology',
      topicCode: 'B1',
      syllabusRef: 'B1.1',
      tier: 'Extended',
      question: 'A student observes an organism that detects changes in its surrounding temperature and moves away from light. Which two characteristics of living organisms are demonstrated?',
      options: [
        'Sensitivity and movement',
        'Respiration and growth',
        'Nutrition and excretion',
        'Reproduction and sensitivity'
      ],
      correctIndex: 0,
      explanation: 'Sensitivity is the ability to sense and respond to stimuli in the internal or external environment. Moving away involves the action of an organism or part of an organism causing a change of position.'
    }
  ],

  // B2.1 Cell Structure
  'B2.1': [
    {
      id: 'b2-1-q1',
      subject: 'biology',
      topicCode: 'B2',
      syllabusRef: 'B2.1',
      tier: 'Core',
      question: 'Which structures are found in BOTH a human liver cell and a leaf palisade mesophyll cell?',
      options: [
        'Cell membrane, cytoplasm, and nucleus',
        'Cell wall, chloroplast, and nucleus',
        'Cell membrane, cell wall, and cytoplasm',
        'Large permanent vacuole, cell wall, and chloroplast'
      ],
      correctIndex: 0,
      explanation: 'Animal cells and plant cells both share a cell membrane, cytoplasm, and nucleus. Chloroplasts, cell walls, and large permanent sap vacuoles are unique to plant cells.'
    },
    {
      id: 'b2-1-q2',
      subject: 'biology',
      topicCode: 'B2',
      syllabusRef: 'B2.1',
      tier: 'Extended',
      question: 'How is a root hair cell structurally adapted to carry out its primary function of absorbing water and mineral ions from soil?',
      options: [
        'It has an elongated cellular extension that greatly increases its surface area-to-volume ratio',
        'It contains large numbers of chloroplasts to synthesise sugars in the dark',
        'It has a thick biconcave disc shape to carry dissolved oxygen',
        'It possesses beating cilia to sweep soil water into the cortex'
      ],
      correctIndex: 0,
      explanation: 'The long, narrow root hair projection massively increases surface area for rapid osmosis of water and active transport of mineral ions.'
    },
    {
      id: 'b2-1-q3',
      subject: 'biology',
      topicCode: 'B2',
      syllabusRef: 'B2.1',
      tier: 'Extended',
      question: 'What is the function of ciliated epithelial cells lining the trachea and bronchi in the human respiratory system?',
      options: [
        'Their microscopic hairs (cilia) beat rhythmically to sweep mucus and trapped pathogens upwards away from the lungs',
        'They secrete digestive enzymes to break down inhaled particles',
        'They contract like muscle fibres to increase thorax volume during breathing',
        'They produce hemoglobin to bind inhaled oxygen'
      ],
      correctIndex: 0,
      explanation: 'Cilia sweep mucus (produced by goblet cells) containing trapped dust and bacteria towards the throat, where it is swallowed and destroyed by stomach acid.'
    }
  ],

  // B2.2 Size of Specimens
  'B2.2': [
    {
      id: 'b2-2-q1',
      subject: 'biology',
      topicCode: 'B2',
      syllabusRef: 'B2.2',
      tier: 'Core',
      question: 'A micrograph shows a plant cell. The image width of the cell is 48 mm. If the magnification is ×800, what is the actual width of the cell in micrometres (µm)?',
      options: [
        '60 µm',
        '0.06 µm',
        '6.0 µm',
        '600 µm'
      ],
      correctIndex: 0,
      explanation: 'Magnification formula: Actual size A = Image size I / Magnification M. Convert 48 mm to µm: 48 mm × 1000 = 48 000 µm. Then A = 48 000 µm / 800 = 60 µm.'
    },
    {
      id: 'b2-2-q2',
      subject: 'biology',
      topicCode: 'B2',
      syllabusRef: 'B2.2',
      tier: 'Extended',
      question: 'An actual red blood cell has a diameter of 7.0 µm. In a textbook drawing, it is represented with a diameter of 35 mm. What is the magnification of the drawing?',
      options: [
        '×5000',
        '×500',
        '×50',
        '×200'
      ],
      correctIndex: 0,
      explanation: 'Magnification M = Image size I / Actual size A. Convert 35 mm to µm: 35 × 1000 = 35 000 µm. M = 35 000 µm / 7.0 µm = ×5000.'
    }
  ],

  // B6.2 Leaf Structure
  'B6.2': [
    {
      id: 'b6-2-q1',
      subject: 'biology',
      topicCode: 'B6',
      syllabusRef: 'B6.2',
      tier: 'Core',
      question: 'In a transverse section of a dicotyledonous leaf, which tissue layer contains the highest density of chloroplasts for absorbing sunlight for photosynthesis?',
      options: [
        'Palisade mesophyll layer',
        'Upper waxy cuticle',
        'Spongy mesophyll layer',
        'Lower epidermis'
      ],
      correctIndex: 0,
      explanation: 'Palisade mesophyll cells are vertically arranged near the upper surface and packed with abundant chloroplasts to maximize light absorption for photosynthesis.'
    },
    {
      id: 'b6-2-q2',
      subject: 'biology',
      topicCode: 'B6',
      syllabusRef: 'B6.2',
      tier: 'Extended',
      question: 'How do the large intercellular air spaces in the spongy mesophyll layer adapt the leaf for gas exchange?',
      options: [
        'They provide a large surface area and allow rapid diffusion of carbon dioxide and oxygen between stomata and photosynthetic cells',
        'They store liquid water under high hydrostatic pressure to keep the leaf erect',
        'They absorb green wavelengths of sunlight to warm the leaf',
        'They trap digestive enzymes to break down leaf pests'
      ],
      correctIndex: 0,
      explanation: 'The loose arrangement and numerous air spaces in the spongy mesophyll facilitate the rapid diffusion of CO2 into cells and O2 out of cells.'
    }
  ],

  // B7.2 Alimentary Canal & Peristalsis
  'B7.2': [
    {
      id: 'b7-2-q1',
      subject: 'biology',
      topicCode: 'B7',
      syllabusRef: 'B7.2',
      tier: 'Core',
      question: 'By which muscular mechanism is food pushed along the oesophagus and small intestine?',
      options: [
        'Peristalsis (waves of contraction and relaxation of circular and longitudinal muscles)',
        'Gravity alone pulling the bolus downwards',
        'Active transport across the epithelial lining',
        'Ciliary beating sweeping food into the stomach'
      ],
      correctIndex: 0,
      explanation: 'Peristalsis consists of involuntary waves of contraction behind the food bolus (circular muscles contract, longitudinal muscles relax) that push food through the gut.'
    },
    {
      id: 'b7-2-q2',
      subject: 'biology',
      topicCode: 'B7',
      syllabusRef: 'B7.2',
      tier: 'Extended',
      question: 'Which structural feature of the human small intestine (ileum) greatly increases its surface area for the absorption of digested nutrients?',
      options: [
        'Millions of microscopic finger-like projections called villi, covered in microvilli',
        'Thick keratinised epithelial layers that resist stomach acid',
        'A wide muscular lumen with large storage sphincters',
        'Heavy coats of insoluble mucous granules'
      ],
      correctIndex: 0,
      explanation: 'Villi and microvilli dramatically expand the surface area of the ileum, facilitating rapid diffusion and active transport of glucose, amino acids, and fatty acids into blood capillaries and lacteals.'
    }
  ],

  // B8.2 Water Uptake in Plants
  'B8.2': [
    {
      id: 'b8-2-q1',
      subject: 'biology',
      topicCode: 'B8',
      syllabusRef: 'B8.2',
      tier: 'Core',
      question: 'Soil water enters a root hair cell across its partially permeable surface membrane by which physical process?',
      options: [
        'Osmosis down a water potential gradient from high to low water potential',
        'Active transport using ATP from respiration',
        'Translocation of sugars from root cortex cells',
        'Evaporative cooling from root hairs'
      ],
      correctIndex: 0,
      explanation: 'Soil water has a higher water potential (more dilute) than root hair cell sap. Water moves passively into the cell by osmosis across the partially permeable membrane.'
    }
  ],

  // B9.1 Circulatory Systems
  'B9.1': [
    {
      id: 'b9-1-q1',
      subject: 'biology',
      topicCode: 'B9',
      syllabusRef: 'B9.1',
      tier: 'Core',
      question: 'What is meant by the statement that humans have a "double circulatory system"?',
      options: [
        'Blood passes through the heart twice for every complete circuit of the body (pulmonary and systemic circuits)',
        'Humans have two separate hearts located in the left and right thorax',
        'Blood is pumped forward and backwards alternately in the same blood vessels',
        'The heart beats twice for every respiratory cycle'
      ],
      correctIndex: 0,
      explanation: 'In mammals, blood flows through the heart twice per complete circuit: first pumped to the lungs at lower pressure (pulmonary circuit), then returned and pumped to the rest of the body at high pressure (systemic circuit).'
    }
  ],

  // B9.4 Blood Components & Clotting
  'B9.4': [
    {
      id: 'b9-4-q1',
      subject: 'biology',
      topicCode: 'B9',
      syllabusRef: 'B9.4',
      tier: 'Core',
      question: 'Which blood component contains the iron-rich protein haemoglobin and transports oxygen from the lungs to respiring tissues?',
      options: [
        'Red blood cells (erythrocytes)',
        'Blood platelets',
        'White blood cells (lymphocytes)',
        'Liquid blood plasma'
      ],
      correctIndex: 0,
      explanation: 'Red blood cells contain haemoglobin which binds reversibly with oxygen to form oxyhaemoglobin. Their lack of a nucleus and biconcave shape optimize oxygen transport.'
    },
    {
      id: 'b9-4-q2',
      subject: 'biology',
      topicCode: 'B9',
      syllabusRef: 'B9.4',
      tier: 'Extended',
      question: 'What is the role of blood platelets and the plasma protein fibrinogen during blood clotting?',
      options: [
        'Platelets release clotting factors that convert soluble fibrinogen into insoluble mesh-like fibrin fibres to trap blood cells',
        'Platelets engulf bacteria by phagocytosis and produce antibodies',
        'Fibrinogen dissolves existing clots to restore circulation in damaged vessels',
        'Platelets secrete hydrochloric acid to sterilize open wounds'
      ],
      correctIndex: 0,
      explanation: 'At a wound, platelets aggregate and initiate a cascade converting soluble fibrinogen into an insoluble mesh of fibrin fibres that traps red blood cells, forming a clot to stop blood loss and prevent pathogen entry.'
    }
  ],

  // B10.1 Diseases & Immunity
  'B10.1': [
    {
      id: 'b10-1-q1',
      subject: 'biology',
      topicCode: 'B10',
      syllabusRef: 'B10.1',
      tier: 'Core',
      question: 'What is a pathogen?',
      options: [
        'A disease-causing organism such as a virus, bacterium, or fungus',
        'A chemical produced by white blood cells to neutralize poisons',
        'A harmless microscopic bacterium used in breadmaking',
        'A medicine used to kill viral infections'
      ],
      correctIndex: 0,
      explanation: 'A pathogen is defined by the Cambridge syllabus as a disease-causing organism, including transmissible bacteria, viruses, and fungi.'
    },
    {
      id: 'b10-1-q2',
      subject: 'biology',
      topicCode: 'B10',
      syllabusRef: 'B10.1',
      tier: 'Extended',
      question: 'How does vaccination stimulate active immunity against a specific transmissible disease?',
      options: [
        'Harmless or weakened antigens stimulate lymphocytes to produce specific antibodies and long-lived memory cells',
        'Vaccines directly inject ready-made antibiotics into body tissues',
        'Vaccines destroy all white blood cells so no inflammation can occur',
        'Vaccines alter human DNA to prevent virus replication'
      ],
      correctIndex: 0,
      explanation: 'Vaccines contain weakened or dead pathogens / antigens. Lymphocytes recognize them and clone, producing specific antibodies and memory cells that provide rapid secondary immune responses upon future infection.'
    }
  ],

  // B13.1 Coordination and Response
  'B13.1': [
    {
      id: 'b13-1-q1',
      subject: 'biology',
      topicCode: 'B13',
      syllabusRef: 'B13.1',
      tier: 'Core',
      question: 'What is the junction called across which an electrical nerve impulse is transmitted between two neurones via chemical neurotransmitters?',
      options: [
        'Synapse',
        'Axon terminal',
        'Myelin sheath',
        'Receptor cell'
      ],
      correctIndex: 0,
      explanation: 'A synapse is the microscopic junction between two neurones where the impulse triggers release of neurotransmitter chemicals that diffuse across the synaptic gap.'
    },
    {
      id: 'b13-1-q2',
      subject: 'biology',
      topicCode: 'B13',
      syllabusRef: 'B13.1',
      tier: 'Extended',
      question: 'Which hormone is secreted by adrenal glands in situations of fear or stress to prepare the human body for "fight or flight"?',
      options: [
        'Adrenaline',
        'Insulin',
        'Oestrogen',
        'Glucagon'
      ],
      correctIndex: 0,
      explanation: 'Adrenaline increases heart rate, widens pupils, increases breathing rate, and stimulates glycogen breakdown into glucose to prepare muscles for intense action.'
    }
  ],

  // B14.1 Plant Reproduction
  'B14.1': [
    {
      id: 'b14-1-q1',
      subject: 'biology',
      topicCode: 'B14',
      syllabusRef: 'B14.1',
      tier: 'Core',
      question: 'Which flower structure contains pollen sacs and produces male gametes (pollen grains)?',
      options: [
        'Anther',
        'Stigma',
        'Ovary',
        'Petal'
      ],
      correctIndex: 0,
      explanation: 'The stamen is the male reproductive organ, consisting of a filament supporting the anther, which produces pollen grains.'
    },
    {
      id: 'b14-1-q2',
      subject: 'biology',
      topicCode: 'B14',
      syllabusRef: 'B14.1',
      tier: 'Extended',
      question: 'Which environmental conditions are universally required for the germination of non-dormant seeds?',
      options: [
        'Water, oxygen, and a suitable warm temperature (WOW)',
        'Continuous bright sunlight, carbon dioxide, and fertilizer',
        'Zero oxygen, liquid water, and sub-zero temperatures',
        'Soil minerals, darkness, and carbon monoxide'
      ],
      correctIndex: 0,
      explanation: 'Seeds require Water (to activate enzymes and expand cells), Oxygen (for aerobic respiration), and Warmth (for optimal enzyme activity). Light is not generally required for germination.'
    }
  ],

  // B14.2 Human Reproduction
  'B14.2': [
    {
      id: 'b14-2-q1',
      subject: 'biology',
      topicCode: 'B14',
      syllabusRef: 'B14.2',
      tier: 'Core',
      question: 'Where does the fertilisation of a human ovum (egg cell) by a sperm cell normally occur?',
      options: [
        'In the oviduct (fallopian tube)',
        'Inside the ovary',
        'Inside the uterus (womb)',
        'In the cervix'
      ],
      correctIndex: 0,
      explanation: 'Fertilisation (fusion of nuclei of sperm and ovum) takes place in the upper third of the oviduct (fallopian tube). The fertilised zygote then travels to the uterus for implantation.'
    },
    {
      id: 'b14-2-q2',
      subject: 'biology',
      topicCode: 'B14',
      syllabusRef: 'B14.2',
      tier: 'Extended',
      question: 'What is the function of the placenta during human pregnancy?',
      options: [
        'It allows diffusion of oxygen, glucose, and antibodies from maternal blood to fetal blood, and removal of urea and CO2 without maternal and fetal blood mixing',
        'It produces amniotic fluid to protect the fetus from physical shock',
        'It serves as the site where egg cells are fertilised by sperm',
        'It mechanically pushes the fetus into the birth canal during labour'
      ],
      correctIndex: 0,
      explanation: 'The placenta provides an exchange surface between maternal and fetal blood for nutrients and wastes. It prevents mixing of maternal and fetal blood, protecting the fetus from high maternal blood pressure and immune rejection.'
    }
  ],

  // B15.2 Food Webs & Biomass
  'B15.2': [
    {
      id: 'b15-2-q1',
      subject: 'biology',
      topicCode: 'B15',
      syllabusRef: 'B15.2',
      tier: 'Core',
      question: 'In the food chain: Grass → Grasshopper → Frog → Hawk, which organism occupies the tertiary consumer trophic level?',
      options: [
        'Hawk',
        'Frog',
        'Grasshopper',
        'Grass'
      ],
      correctIndex: 0,
      explanation: 'Trophic levels: Grass (producer, level 1) → Grasshopper (primary consumer, level 2) → Frog (secondary consumer, level 3) → Hawk (tertiary consumer, level 4).'
    }
  ],

  // B16.1 & B16.2 Human Influences on Ecosystems
  'B16.1': [
    {
      id: 'b16-1-q1',
      subject: 'biology',
      topicCode: 'B16',
      syllabusRef: 'B16.1',
      tier: 'Core',
      question: 'Which environmental problem is directly accelerated by large-scale tropical deforestation?',
      options: [
        'Loss of biodiversity, increased risk of flooding, and increased atmospheric carbon dioxide',
        'Depletion of atmospheric nitrogen gas',
        'Global cooling caused by decreased cloud formation',
        'Rapid formation of new fossil fuel reserves'
      ],
      correctIndex: 0,
      explanation: 'Deforestation removes tree habitats (extinction of species), eliminates tree roots that hold topsoil and absorb water (soil erosion and flooding), and reduces photosynthesis while releasing CO2 when felled wood burns or decays.'
    }
  ],
  'B16.2': [
    {
      id: 'b16-2-q1',
      subject: 'biology',
      topicCode: 'B16',
      syllabusRef: 'B16.2',
      tier: 'Core',
      question: 'Why is the conservation of natural habitats and endangered species important for human society?',
      options: [
        'It maintains biodiversity, provides potential sources of new medicinal drugs, and preserves stable ecosystems',
        'It ensures only domesticated farm animals survive on Earth',
        'It eliminates natural predators so prey animals multiply without limit',
        'It accelerates industrial urbanisation'
      ],
      correctIndex: 0,
      explanation: 'Biodiversity conservation preserves genetic resources, potential future medicines, ecosystem services (such as water purification and pollination), and recreational and ethical value.'
    }
  ]
};
