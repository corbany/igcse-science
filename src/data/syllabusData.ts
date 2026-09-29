import { SyllabusItem } from '../types';

export const syllabusItems: SyllabusItem[] = [
  // BIOLOGY (B1 - B16)
  {
    id: 'B1',
    code: 'B1',
    subject: 'biology',
    title: 'Characteristics of Living Organisms',
    coreObjectives: [
      'Describe the 7 characteristics of living organisms (MRS GREN): Movement, Respiration, Sensitivity, Growth, Reproduction, Excretion, Nutrition.',
      'Define movement as an action by an organism causing a change of position or place.',
      'Define respiration as chemical reactions in cells breaking down nutrient molecules to release energy for metabolism.',
      'Define sensitivity as detecting and responding to internal/external environmental changes.',
      'Define growth as permanent increase in size and dry mass.',
      'Define reproduction as processes that make more of the same kind of organism.',
      'Define excretion as removal of toxic waste products of metabolism and substances in excess.',
      'Define nutrition as taking in materials for energy, growth and development.'
    ],
    essentialKeywords: ['Movement', 'Respiration', 'Sensitivity', 'Growth', 'Reproduction', 'Excretion', 'Nutrition', 'Metabolism', 'Dry mass'],
    commonMisconceptions: ['Confusing excretion (cellular waste like CO2/urea) with egestion (removal of undigested faeces).', 'Thinking fire is alive because it grows and consumes oxygen.']
  },
  {
    id: 'B2',
    code: 'B2',
    subject: 'biology',
    title: 'Cells & Organisation',
    coreObjectives: [
      'Describe and compare plant vs animal cells (cell wall, cell membrane, nucleus, cytoplasm, chloroplasts, ribosomes, mitochondria, vacuoles).',
      'Describe bacterial cells (cell wall, cell membrane, cytoplasm, ribosomes, circular DNA, plasmids, no nucleus).',
      'Describe the meaning of cell, tissue, organ, organ system, and organism.',
      'State and use the formula: Magnification = Image size / Actual size (A = I / M).'
    ],
    supplementObjectives: [
      'State specialised cell functions: root hair cell (absorption), palisade mesophyll (photosynthesis), red blood cell (oxygen transport).',
      'Convert measurements between millimetres (mm) and micrometres (μm) (1 mm = 1000 μm).'
    ],
    essentialKeywords: ['Cell wall', 'Cell membrane', 'Nucleus', 'Mitochondria', 'Ribosome', 'Vacuole', 'Chloroplast', 'Plasmid', 'Circular DNA', 'Magnification', 'Micrometre (μm)'],
    suggestedPracticals: ['Preparing onion skin microscope slide with iodine stain.', 'Measuring cell dimensions across microscope field of view.']
  },
  {
    id: 'B3',
    code: 'B3',
    subject: 'biology',
    title: 'Movement In & Out of Cells',
    coreObjectives: [
      'Describe diffusion as net movement of particles down a concentration gradient due to random motion.',
      'State that substances enter/leave cells by diffusion through cell membrane.',
      'Describe osmosis as water diffusion through partially permeable membranes.',
      'Investigate and describe effects on plant tissues immersed in solutions of different concentrations.'
    ],
    supplementObjectives: [
      'Investigate factors influencing diffusion: surface area, temperature, concentration gradient, distance.',
      'Explain osmosis in terms of water potential (dilute = high water potential, concentrated = low water potential).',
      'Explain effects on plant cells: turgid, turgor pressure, flaccid, plasmolysis.',
      'Describe active transport against concentration gradient using energy from respiration and carrier proteins (e.g. ion uptake in root hairs).'
    ],
    essentialKeywords: ['Diffusion', 'Concentration gradient', 'Osmosis', 'Partially permeable', 'Water potential', 'Turgid', 'Flaccid', 'Plasmolysis', 'Active transport'],
    suggestedPracticals: ['Investigating osmosis in potato cylinders across varying sucrose/salt solutions.']
  },
  {
    id: 'B4',
    code: 'B4',
    subject: 'biology',
    title: 'Biological Molecules',
    coreObjectives: [
      'List chemical elements in carbohydrates (C, H, O), fats (C, H, O), and proteins (C, H, O, N, sometimes S).',
      'State that large molecules are synthesized from smaller subunits: starch/glycogen/cellulose from glucose; proteins from amino acids; fats/oils from fatty acids and glycerol.',
      'Describe food tests: Iodine for starch (orange-brown to blue-black); Benedict’s for reducing sugars (blue to green/yellow/brick-red with heat); Biuret test for proteins (blue to purple/lilac); Ethanol emulsion for fats (milky emulsion).'
    ],
    essentialKeywords: ['Carbohydrate', 'Lipid', 'Protein', 'Amino acid', 'Glucose', 'Starch', 'Glycogen', 'Iodine', 'Benedict\'s', 'Biuret', 'Ethanol emulsion'],
    suggestedPracticals: ['Testing food samples with all four qualitative chemical reagents.']
  },
  {
    id: 'B5',
    code: 'B5',
    subject: 'biology',
    title: 'Enzymes',
    coreObjectives: [
      'Define enzymes as biological catalysts (proteins) involved in metabolic reactions.',
      'Investigate and describe the effect of temperature and pH on enzyme activity.'
    ],
    supplementObjectives: [
      'Explain enzyme action using lock and key model: active site, enzyme-substrate complex, substrate and products.',
      'Explain temperature and pH effects on rate: kinetic energy, frequency of collisions, denaturation (irreversible change in active site shape).'
    ],
    essentialKeywords: ['Enzyme', 'Catalyst', 'Active site', 'Substrate', 'Enzyme-substrate complex', 'Denatured', 'Optimum temperature', 'Optimum pH'],
    suggestedPracticals: ['Investigating effect of pH on amylase breakdown of starch using spotting tiles and iodine.']
  },
  {
    id: 'B6',
    code: 'B6',
    subject: 'biology',
    title: 'Plant Nutrition',
    coreObjectives: [
      'Describe photosynthesis as plants synthesizing carbohydrates from raw materials using light energy.',
      'Word equation: carbon dioxide + water -> glucose + oxygen (with light & chlorophyll).',
      'Identify leaf structures: cuticle, upper/lower epidermis, guard cells, stomata, palisade mesophyll, spongy mesophyll, xylem, phloem.',
      'State that chlorophyll is the green pigment in chloroplasts that absorbs light.'
    ],
    supplementObjectives: [
      'Balanced symbol equation: 6CO2 + 6H2O -> C6H12O6 + 6O2.',
      'Explain limiting factors: light intensity, carbon dioxide concentration, temperature.',
      'Investigate aquatic plant gas exchange using hydrogencarbonate indicator.'
    ],
    essentialKeywords: ['Photosynthesis', 'Chlorophyll', 'Chloroplast', 'Palisade mesophyll', 'Stomata', 'Guard cells', 'Limiting factor', 'Hydrogencarbonate indicator']
  },
  {
    id: 'B7',
    code: 'B7',
    subject: 'biology',
    title: 'Human Nutrition & Digestion',
    coreObjectives: [
      'Describe balanced diet: carbohydrates, fats, proteins, vitamins C & D, mineral ions (Ca & Fe), fibre, water.',
      'Identify digestive organs: mouth, oesophagus, stomach, small intestine (duodenum & ileum), large intestine (colon, rectum, anus), liver, gall bladder, pancreas.',
      'Describe 5 stages: Ingestion, Digestion (physical & chemical), Absorption, Assimilation, Egestion.'
    ],
    supplementObjectives: [
      'Enzymes: amylase (starch -> sugars), protease (protein -> amino acids), lipase (fats -> fatty acids & glycerol).',
      'State secretion and action sites of digestive enzymes.',
      'Role of HCl in gastric juice (kills harmful microbes, provides acidic pH for stomach protease).'
    ],
    essentialKeywords: ['Alimentary canal', 'Ingestion', 'Physical digestion', 'Chemical digestion', 'Absorption', 'Assimilation', 'Egestion', 'Amylase', 'Protease', 'Lipase', 'Villi'],
    suggestedPracticals: ['Model gut experiment with Visking tubing showing glucose diffusion but starch retention.']
  },
  {
    id: 'B8',
    code: 'B8',
    subject: 'biology',
    title: 'Transport in Plants',
    coreObjectives: [
      'State functions of xylem (water & mineral ions transport, support) and phloem (sucrose & amino acids).',
      'Identify xylem and phloem in roots, stems, and leaves.',
      'Identify root hair cells and state their water uptake by osmosis.',
      'Outline pathway of water: root hair -> root cortex -> xylem -> mesophyll cells.',
      'Define transpiration as water vapour loss from leaves.'
    ],
    supplementObjectives: [
      'Large surface area of root hairs increases ion and water uptake.',
      'Investigate and explain effects of temperature and wind speed on transpiration rate using a potometer.'
    ],
    essentialKeywords: ['Xylem', 'Phloem', 'Transpiration stream', 'Root hair cell', 'Cortex', 'Stomata', 'Potometer']
  },
  {
    id: 'B9',
    code: 'B9',
    subject: 'biology',
    title: 'Transport in Animals',
    coreObjectives: [
      'Describe circulatory system as blood vessels, pump, and one-way valves.',
      'Heart structure: muscular wall, septum, left/right atria, left/right ventricles, valves, coronary arteries.',
      'Blood vessels: arteries (away from heart, thick walls, small lumen), veins (to heart, valves, large lumen), capillaries (exchange of materials).',
      'Blood components: red blood cells, white blood cells, platelets, plasma.',
      'Describe coronary heart disease (CHD) and risk factors (diet, lack of exercise, stress, smoking, age, sex, genetics).'
    ],
    supplementObjectives: [
      'Functioning of heart muscles and one-way valves.',
      'Roles of diet and exercise in reducing CHD risk.',
      'Blood clotting role in preventing blood loss and pathogen entry.'
    ],
    essentialKeywords: ['Double circulation', 'Right/left ventricle', 'Atrium', 'Aorta', 'Vena cava', 'Pulmonary artery', 'Pulmonary vein', 'Coronary heart disease', 'Platelets', 'Haemoglobin']
  },
  {
    id: 'B10',
    code: 'B10',
    subject: 'biology',
    title: 'Diseases & Immunity',
    coreObjectives: [
      'Define pathogen as a disease-causing organism.',
      'Define transmissible disease as passed from one host to another.',
      'Transmission routes: direct (blood, bodily fluids) and indirect (air droplets, contaminated food/water/surfaces).',
      'Body defences: mechanical (skin, nose hairs), chemical (mucus, stomach acid), internal (white blood cells).'
    ],
    supplementObjectives: [
      'Virus structure: protein coat and genetic material (no nucleus/cell membrane).',
      'Explain disease control methods: clean water supply, hygienic food prep, personal hygiene, waste disposal, sewage treatment.',
      'Define active immunity as defense against pathogen by antibody production.',
      'Active immunity gained through infection or vaccination with memory cells.'
    ],
    essentialKeywords: ['Pathogen', 'Transmissible disease', 'Direct/indirect contact', 'Mechanical barrier', 'Chemical barrier', 'Antibodies', 'Vaccine', 'Memory cells', 'Active immunity']
  },
  {
    id: 'B11',
    code: 'B11',
    subject: 'biology',
    title: 'Gas Exchange in Humans',
    coreObjectives: [
      'Identify breathing structures: larynx, trachea, bronchi, bronchioles, alveoli, diaphragm, ribs, intercostal muscles.',
      'Describe effects of physical activity on breathing rate and depth.'
    ],
    supplementObjectives: [
      'Describe gas exchange surface adaptations: large surface area, thin wall (one cell thick), good blood supply, good ventilation.'
    ],
    essentialKeywords: ['Alveoli', 'Trachea', 'Bronchi', 'Diaphragm', 'Intercostal muscles', 'Gas exchange', 'Diffusion distance']
  },
  {
    id: 'B12',
    code: 'B12',
    subject: 'biology',
    title: 'Respiration',
    coreObjectives: [
      'Define aerobic respiration as chemical reactions in cells that use oxygen to break down nutrient molecules to release energy.',
      'State 5 uses of energy: muscle contraction, protein synthesis, cell division, growth, constant body temperature.',
      'Word equation: glucose + oxygen -> carbon dioxide + water.'
    ],
    supplementObjectives: [
      'Balanced symbol equation: C6H12O6 + 6O2 -> 6CO2 + 6H2O.'
    ],
    essentialKeywords: ['Aerobic respiration', 'Mitochondria', 'Glucose', 'ATP', 'Exothermic']
  },
  {
    id: 'B13',
    code: 'B13',
    subject: 'biology',
    title: 'Drugs',
    coreObjectives: [
      'Define drug as any substance taken into body that modifies or affects chemical reactions.',
      'Describe antibiotics for treating bacterial infections.',
      'State that antibiotics kill bacteria but do NOT kill viruses.',
      'State that bacteria can develop resistance to antibiotics.'
    ],
    supplementObjectives: [
      'Explain how prudent antibiotic usage limits resistant strains (e.g. MRSA).'
    ],
    essentialKeywords: ['Drug', 'Antibiotic', 'Bacteria', 'Virus', 'Antibiotic resistance', 'MRSA']
  },
  {
    id: 'B14',
    code: 'B14',
    subject: 'biology',
    title: 'Reproduction',
    coreObjectives: [
      'Insect-pollinated flower: sepals, petals, stamens (anther & filament), carpels (stigma, style, ovary, ovule).',
      'Define pollination as transfer of pollen from anther to stigma.',
      'State fertilisation occurs when pollen nucleus fuses with ovule nucleus.',
      'Environmental germination conditions: water, oxygen, suitable temperature.',
      'Human male & female reproductive systems.',
      '28-day menstrual cycle: ovulation at day 14, uterus lining breakdown and repair.'
    ],
    supplementObjectives: [
      'Contrast insect vs wind-pollinated flowers (feathery stigma outside, loose anthers, light smooth pollen).'
    ],
    essentialKeywords: ['Pollination', 'Fertilisation', 'Anther', 'Stigma', 'Ovule', 'Germination', 'Menstrual cycle', 'Ovulation']
  },
  {
    id: 'B15',
    code: 'B15',
    subject: 'biology',
    title: 'Organisms & Environment',
    coreObjectives: [
      'Sun is principal energy source in biological systems.',
      'Energy flow: light energy -> chemical energy -> transferred along food chain -> lost as heat.',
      'Food chains and food webs: producer, primary consumer, secondary consumer, tertiary consumer, herbivore, carnivore, decomposer.',
      'Describe the carbon cycle: photosynthesis, respiration, feeding, decomposition, combustion, fossil fuels.'
    ],
    supplementObjectives: [
      'Human impacts on food webs: overharvesting and foreign species introduction.'
    ],
    essentialKeywords: ['Producer', 'Consumer', 'Trophic level', 'Food web', 'Decomposer', 'Carbon cycle', 'Combustion', 'Biomass (10% rule)']
  },
  {
    id: 'B16',
    code: 'B16',
    subject: 'biology',
    title: 'Human Influences on Ecosystems',
    coreObjectives: [
      'Define ecosystem and biodiversity.',
      'Reasons for habitat destruction: housing, crops, livestock, mining, pollution.',
      'Undesirable effects of deforestation: reduced biodiversity, extinction, soil erosion, flooding, CO2 increase.',
      'Conservation methods: protected areas, education, captive breeding, seed banks.'
    ],
    essentialKeywords: ['Ecosystem', 'Biodiversity', 'Deforestation', 'Conservation', 'Captive breeding', 'Seed bank']
  },

  // CHEMISTRY (C1 - C12)
  {
    id: 'C1',
    code: 'C1',
    subject: 'chemistry',
    title: 'States of Matter',
    coreObjectives: [
      'Properties of solids, liquids, and gases (shape, volume, compressibility, density).',
      'Describe structures in terms of particle separation, arrangement, and motion.',
      'Changes of state: melting, boiling, evaporating, freezing, condensing.',
      'Describe effect of temperature and pressure on gas volume.'
    ],
    supplementObjectives: [
      'Explain state changes using kinetic particle theory and Boyle\'s law.'
    ],
    essentialKeywords: ['Kinetic theory', 'Melting', 'Boiling', 'Evaporation', 'Condensation', 'Sublimation', 'Boyle\'s law']
  },
  {
    id: 'C2',
    code: 'C2',
    subject: 'chemistry',
    title: 'Atoms, Elements & Compounds',
    coreObjectives: [
      'Differences between elements, compounds, and mixtures.',
      'Structure of atom: central nucleus (protons + neutrons), electrons in shells.',
      'Define proton number (atomic number) and mass number (nucleon number).',
      'Electronic configuration of first 20 elements (2,8,8 rule).',
      'Formation of positive ions (cations) and negative ions (anions).',
      'Ionic bond as strong electrostatic attraction between oppositely charged ions.',
      'Covalent bond as shared pair of electrons between non-metal atoms (H2, Cl2, H2O, CH4, NH3, HCl).'
    ],
    supplementObjectives: [
      'Giant lattice structure of ionic compounds (e.g. NaCl) and physical properties (high melting/boiling point, conducts when molten/aqueous).',
      'Covalent dot-and-cross diagrams for CH3OH, C2H4, O2, CO2, N2.',
      'Explain simple molecular compound properties (low melting point due to weak intermolecular forces; non-conductors).'
    ],
    essentialKeywords: ['Proton number', 'Mass number', 'Electron configuration', 'Cation', 'Anion', 'Electrostatic attraction', 'Giant ionic lattice', 'Covalent bond', 'Intermolecular forces']
  },
  {
    id: 'C3',
    code: 'C3',
    subject: 'chemistry',
    title: 'Stoichiometry',
    coreObjectives: [
      'State chemical formulas of elements and compounds in syllabus.',
      'Define molecular formula as number and type of atoms in one molecule.',
      'Construct word equations and balance simple symbol equations with state symbols (s, l, g, aq).'
    ],
    supplementObjectives: [
      'Deduce formula of ionic compounds from ion charges.',
      'Construct balanced ionic equations with state symbols.'
    ],
    essentialKeywords: ['Molecular formula', 'State symbols', 'Balancing equations', 'Ionic equation', 'Law of conservation of mass']
  },
  {
    id: 'C4',
    code: 'C4',
    subject: 'chemistry',
    title: 'Electrochemistry',
    coreObjectives: [
      'Define electrolysis as decomposition of ionic compound (molten/aqueous) by electric current.',
      'Identify anode (+), cathode (-), electrolyte.',
      'Describe electrolysis observations for: molten lead(II) bromide, concentrated aqueous sodium chloride, dilute sulfuric acid with inert graphite electrodes.'
    ],
    supplementObjectives: [
      'Predict products: metals or hydrogen at cathode; non-metals at anode.',
      'Predict products of molten binary compounds.'
    ],
    essentialKeywords: ['Electrolysis', 'Electrolyte', 'Anode', 'Cathode', 'Inert electrodes', 'Lead(II) bromide', 'Aqueous NaCl']
  },
  {
    id: 'C5',
    code: 'C5',
    subject: 'chemistry',
    title: 'Chemical Energetics',
    coreObjectives: [
      'Exothermic reactions transfer thermal energy to surroundings (temp increases).',
      'Endothermic reactions absorb thermal energy from surroundings (temp decreases).'
    ],
    supplementObjectives: [
      'Interpret reaction pathway diagrams for exothermic and endothermic reactions.',
      'Define activation energy (Ea) as minimum energy colliding particles must have to react.',
      'Bond breaking is endothermic; bond making is exothermic.'
    ],
    essentialKeywords: ['Exothermic', 'Endothermic', 'Activation energy (Ea)', 'Reaction pathway diagram', 'Bond breaking', 'Bond making']
  },
  {
    id: 'C6',
    code: 'C6',
    subject: 'chemistry',
    title: 'Chemical Reactions & Rates',
    coreObjectives: [
      'Distinguish between physical and chemical changes.',
      'Describe effects on rate: concentration, surface area, temperature, catalyst.',
      'Practical rate measurement: gas syringe, mass loss on balance.',
      'Define redox as simultaneous oxidation (gain of oxygen) and reduction (loss of oxygen).'
    ],
    supplementObjectives: [
      'Explain rate effects using collision theory (particle collisions per unit volume, kinetic energy >= Ea).',
      'Identify oxidation numbers in ions: iron(II), iron(III), copper(II).'
    ],
    essentialKeywords: ['Rate of reaction', 'Collision theory', 'Activation energy', 'Catalyst', 'Redox', 'Oxidation', 'Reduction']
  },
  {
    id: 'C7',
    code: 'C7',
    subject: 'chemistry',
    title: 'Acids, Bases & Salts',
    coreObjectives: [
      'Reactions of acids with metals, bases, and carbonates.',
      'Indicators: litmus (red in acid, blue in alkali), methyl orange (red in acid, yellow in alkali), universal indicator pH.',
      'Bases are metal oxides/hydroxides; alkalis are soluble bases.',
      'Classify oxides: basic (metal oxides like CaO, CuO) and acidic (non-metal oxides like SO2, CO2).',
      'Prepare soluble salts: titration (acid + alkali), excess base/metal/carbonate + acid followed by filtration and crystallisation.'
    ],
    supplementObjectives: [
      'Preparation of insoluble salts by precipitation.'
    ],
    essentialKeywords: ['Acid', 'Base', 'Alkali', 'Neutralisation', 'Basic oxide', 'Acidic oxide', 'Titration', 'Precipitation', 'Crystallisation']
  },
  {
    id: 'C8',
    code: 'C8',
    subject: 'chemistry',
    title: 'The Periodic Table',
    coreObjectives: [
      'Periodic Table arranged by increasing proton number in periods and groups.',
      'Group I alkali metals (Li, Na, K): soft, low density, decreasing melting point, increasing reactivity with water/air.',
      'Group VII halogens (Cl2, Br2, I2): diatomic non-metals, increasing density, decreasing reactivity, colors (Cl2 yellow-green gas, Br2 red-brown liquid, I2 grey-black solid).',
      'Group VIII noble gases: unreactive monatomic gases with full outer shells.'
    ],
    supplementObjectives: [
      'Halogen displacement reactions in aqueous solution.',
      'Transition elements properties: high density/melting point, coloured compounds, act as catalysts.'
    ],
    essentialKeywords: ['Alkali metals', 'Halogens', 'Displacement', 'Noble gases', 'Transition elements', 'Diatomic', 'Monatomic']
  },
  {
    id: 'C9',
    code: 'C9',
    subject: 'chemistry',
    title: 'Metals',
    coreObjectives: [
      'Physical properties of metals vs non-metals (conductivity, malleability, ductility, melting points).',
      'Uses of metals: aluminium (low density, corrosion resistant for aircraft/cables/food containers); copper (electrical wiring).',
      'Alloys as mixtures of metal with other elements (brass = Cu+Zn; stainless steel = Fe+Cr+Ni+C).',
      'Reactivity series order: K, Na, Ca, Mg, Al, (C), Zn, Fe, (H), Cu, Ag, Au.',
      'Corrosion of iron (rusting requires water + oxygen); barrier methods (painting, greasing, plastic coating).',
      'Extraction of metals: iron from hematite in blast furnace; aluminium from bauxite by electrolysis.'
    ],
    supplementObjectives: [
      'Explain why alloys are harder than pure metals (different sized atoms disrupt regular layers so layers cannot slide).',
      'Blast furnace chemical equations: C + O2 -> CO2; C + CO2 -> 2CO; Fe2O3 + 3CO -> 2Fe + 3CO2.'
    ],
    essentialKeywords: ['Malleability', 'Ductility', 'Alloy', 'Reactivity series', 'Rusting', 'Hematite', 'Blast furnace', 'Bauxite', 'Electrolysis']
  },
  {
    id: 'C10',
    code: 'C10',
    subject: 'chemistry',
    title: 'Chemistry of the Environment',
    coreObjectives: [
      'Chemical tests for water: anhydrous cobalt(II) chloride (blue to pink); anhydrous copper(II) sulfate (white to blue).',
      'Domestic water treatment: sedimentation, filtration, carbon filtration (tastes/odours), chlorination (kills microbes).',
      'Clean dry air composition: ~78% N2, ~21% O2, remainder noble gases & CO2.',
      'Pollutants: CO (toxic, incomplete combustion), particulates (respiratory illness/cancer), CH4 (decay/digestion), NOx (car engines, acid rain), SO2 (sulfur fuel combustion, acid rain).'
    ],
    supplementObjectives: [
      'Strategies to reduce climate change (planting trees, reducing livestock, renewables).',
      'Greenhouse effect: greenhouse gases absorb outgoing infrared radiation, reducing heat loss to space.'
    ],
    essentialKeywords: ['Anhydrous copper sulfate', 'Cobalt chloride', 'Chlorination', 'Particulates', 'Carbon monoxide', 'Sulfur dioxide', 'Acid rain', 'Greenhouse effect']
  },
  {
    id: 'C11',
    code: 'C11',
    subject: 'chemistry',
    title: 'Organic Chemistry',
    coreObjectives: [
      'Hydrocarbons contain carbon and hydrogen only.',
      'Fossil fuels: coal, natural gas (methane), petroleum.',
      'Fractional distillation of petroleum fractions and uses: refinery gas (heating/cooking), petrol (cars), naphtha (feedstock), diesel (diesel engines), bitumen (roads).',
      'Alkanes: single covalent C-C bonds, saturated, general formula CnH2n+2, combustion.',
      'Alkenes: C=C double bond, unsaturated, test with bromine water (turns from orange to colourless).'
    ],
    supplementObjectives: [
      'Cracking of alkanes over hot catalyst/steam to produce alkenes and hydrogen.',
      'Alkene addition reactions: with bromine (dibromoalkane), with hydrogen (nickel catalyst -> alkane), with steam (acid catalyst -> alcohol).',
      'Addition polymerisation of ethene to form poly(ethene).'
    ],
    essentialKeywords: ['Hydrocarbon', 'Homologous series', 'Fractional distillation', 'Alkanes', 'Alkenes', 'Saturated', 'Unsaturated', 'Cracking', 'Addition reaction', 'Polymerisation']
  },
  {
    id: 'C12',
    code: 'C12',
    subject: 'chemistry',
    title: 'Experimental Techniques & Analysis',
    coreObjectives: [
      'Measuring apparatus: stop-watch, thermometer, balance, burette, volumetric pipette, measuring cylinder, gas syringe.',
      'Definitions: solute, solvent, solution, saturated solution, residue, filtrate.',
      'Paper chromatography to separate soluble dyes; calculate Rf = distance spot / distance solvent.',
      'Separation methods: solvent dissolving, filtration, crystallisation, simple distillation, fractional distillation.',
      'Identification of anions: carbonate (acid + limewater milky), chloride (white ppt with AgNO3), bromide (cream ppt with AgNO3), iodide (yellow ppt with AgNO3), sulfate (white ppt with Ba(NO3)2).',
      'Identification of aqueous cations with NaOH: Cu2+ (light blue ppt), Fe2+ (green ppt), Fe3+ (red-brown ppt), Ca2+ (white ppt insoluble in excess), Zn2+ (white ppt soluble in excess), NH4+ (ammonia gas on warming).',
      'Flame tests: Li+ (red), Na+ (yellow), K+ (lilac), Cu2+ (blue-green).',
      'Gas tests: H2 (lighted splint pops), O2 (relights glowing splint), CO2 (limewater milky), Cl2 (bleaches damp litmus), NH3 (turns damp red litmus blue).'
    ],
    essentialKeywords: ['Chromatography', 'Rf value', 'Distillation', 'Precipitate', 'Flame test', 'Limewater', 'Cation tests', 'Anion tests']
  },

  // PHYSICS (P1 - P5)
  {
    id: 'P1',
    code: 'P1',
    subject: 'physics',
    title: 'Motion, Forces & Energy',
    coreObjectives: [
      'Use rulers, measuring cylinders, and stopwatches; measure multiples to find average (e.g. period of pendulum).',
      'Speed v = s / t; average speed = total distance / total time.',
      'Interpret distance-time graphs (gradient = speed) and speed-time graphs (gradient = acceleration, area under graph = distance).',
      'Mass (quantity of matter) vs Weight (gravitational force W = mg, g = 9.8 N/kg).',
      'Density ρ = m / V; determine density of liquids, regular and irregular solids by displacement.',
      'Resultant force along straight line; balanced forces (Newton\'s 1st Law: rest or constant speed in straight line).',
      'Friction & drag opposing motion and causing heating.',
      'Energy stores: kinetic, gravitational potential, chemical, elastic, nuclear, electrostatic, internal (thermal).',
      'Energy transfers: mechanical work, electrical current, heating, radiation (HERM).',
      'Work done W = Fd = ΔE; Power P = W/t = E/t.',
      'Pressure p = F / A.'
    ],
    supplementObjectives: [
      'Acceleration a = Δv / Δt; calculate area under speed-time graph.',
      'Free fall acceleration g = 9.8 m/s².',
      'Newton\'s 2nd law: F = ma.',
      'Kinetic energy Ek = 1/2 m v²; Gravitational potential energy ΔEp = m g Δh.',
      'Efficiency = (useful energy output / total energy input) x 100%.'
    ],
    essentialKeywords: ['Speed', 'Acceleration', 'Resultant force', 'Newton\'s laws', 'Inertia', 'Weight (W=mg)', 'Density (ρ=m/V)', 'Kinetic energy', 'GPE', 'Efficiency', 'Pressure (p=F/A)']
  },
  {
    id: 'P2',
    code: 'P2',
    subject: 'physics',
    title: 'Thermal Physics',
    coreObjectives: [
      'Kinetic particle model of solids, liquids, and gases; motion related to temperature.',
      'Thermal expansion of solids, liquids, and gases at constant pressure.',
      'Evaporation as escape of high-energy particles causing cooling of liquid.',
      'Thermal energy transfer: conduction (conductors vs insulators), convection (fluids, density changes), radiation (infrared, dull black vs shiny white absorbers/emitters).'
    ],
    supplementObjectives: [
      'Conduction in solids in terms of lattice vibrations and free mobile electrons in metals.',
      'Convection currents explained by thermal expansion and density changes.',
      'Leslie cube experiments to distinguish emission/absorption of thermal radiation; Earth radiation balance.'
    ],
    essentialKeywords: ['Thermal expansion', 'Evaporation cooling', 'Conduction', 'Lattice vibration', 'Free electrons', 'Convection current', 'Thermal radiation', 'Infrared', 'Leslie cube']
  },
  {
    id: 'P3',
    code: 'P3',
    subject: 'physics',
    title: 'Waves & Light & Sound',
    coreObjectives: [
      'Waves transfer energy without transferring matter; wavelength λ, frequency f, amplitude, crest, trough, speed v = f λ.',
      'Reflection at plane surface (angle of incidence = angle of reflection, i = r).',
      'Refraction as change of speed causing change of direction.',
      'Thin converging lens: principal axis, principal focus (F), focal length (f), real images (enlarged/diminished, upright/inverted).',
      'Dispersion of white light by prism into 7 colours (ROYGBIV).',
      'Electromagnetic spectrum in order of wavelength/frequency (Radio, Microwave, IR, Visible, UV, X-ray, Gamma); vacuum speed 3.0 x 10^8 m/s; uses and hazards.',
      'Sound: produced by vibrating sources, longitudinal wave, requires medium, audible range 20 Hz to 20 kHz, echoes.'
    ],
    supplementObjectives: [
      'Transverse (vibrations perpendicular to propagation) vs Longitudinal (vibrations parallel).',
      'Sound speed in solids > liquids > gases; compressions (high pressure) and rarefactions (low pressure).',
      'Ultrasound defined as frequency > 20 kHz.'
    ],
    essentialKeywords: ['Transverse', 'Longitudinal', 'Wavelength', 'Frequency', 'Wave speed (v=fλ)', 'Reflection', 'Refraction', 'Thin converging lens', 'Dispersion', 'Electromagnetic spectrum', 'Ultrasound', 'Echo']
  },
  {
    id: 'P4',
    code: 'P4',
    subject: 'physics',
    title: 'Electricity',
    coreObjectives: [
      'Electric charge: positive and negative, measured in Coulombs; like charges repel, unlike attract.',
      'Conductors (free electrons) vs Insulators.',
      'Current I = Q / t (Amperes); direct current (d.c.) vs alternating current (a.c.); conventional current (+ to -) vs electron flow (- to +).',
      'Voltage e.m.f. (source) vs p.d. (between two points) in Volts.',
      'Resistance R = V / I (Ohms).',
      'Series circuits: current same throughout, voltage shared.',
      'Parallel circuits: voltage same across branches, current shared.',
      'Electrical power P = IV; energy E = IVt; kWh and cost calculation.',
      'Safety: heating effect, hazards (damaged insulation, overheating, damp, overloading), fuses, trip switches, earthing, double insulation.'
    ],
    supplementObjectives: [
      'Resistance proportional to length and inversely proportional to cross-sectional area.',
      'Parallel resistance formula: 1/R_total = 1/R1 + 1/R2 (total resistance less than either branch).'
    ],
    essentialKeywords: ['Charge (Q=It)', 'Current', 'Electromotive force (e.m.f.)', 'Potential difference (p.d.)', 'Resistance (R=V/I)', 'Ohm\'s law', 'Kilowatt-hour (kWh)', 'Fuse', 'Earthing', 'Double insulation']
  },
  {
    id: 'P5',
    code: 'P5',
    subject: 'physics',
    title: 'Space Physics',
    coreObjectives: [
      'Solar System: Sun (one star), 8 named planets (Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune), dwarf planets, asteroid belt, moons.',
      'Sun contains 99.8% of Solar System mass; gravity keeps objects in orbit.',
      'Light-year definition; speed of light 3.0 x 10^8 m/s; calculate travel time across Solar System.',
      'Sun is medium-sized star radiating mostly infrared, visible light, and ultraviolet.',
      'Star formation from protostar in nebula; life cycle of small stars (red giant -> planetary nebula + white dwarf) vs large stars (red supergiant -> supernova -> neutron star or black hole).',
      'Milky Way galaxy diameter ~100,000 light-years; Big Bang theory (Universe expanding from single hot dense point ~13.8 billion years old).'
    ],
    supplementObjectives: [
      'Orbital speed formula v = 2πr / T (orbital radius r, orbital period T in seconds).',
      'Sun\'s energy powered by nuclear fusion of hydrogen into helium in core.',
      'Outer planet orbital speeds decrease as distance from Sun increases (weaker gravitational attraction).'
    ],
    essentialKeywords: ['Solar System', 'Orbital speed (v=2πr/T)', 'Light-year', 'Nuclear fusion', 'Protostar', 'Red giant', 'Supernova', 'White dwarf', 'Black hole', 'Milky Way', 'Big Bang']
  }
];
