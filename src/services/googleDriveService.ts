import { SlideDeckOption } from '../data/googleSlidesRegistry';
import firebaseConfig from '../../firebase-applet-config.json';

export const TARGET_DRIVE_FOLDER_ID = '1kypXZXP3nY9pFxuSJOTZ1anODYxxfZ1a';
export const TARGET_DRIVE_FOLDER_URL = `https://drive.google.com/drive/folders/${TARGET_DRIVE_FOLDER_ID}`;

export const DRIVE_STORAGE_KEY = 'igcse_0653_drive_synced_slides_v3';
export const DRIVE_STORAGE_PDFS_KEY = 'igcse_0653_drive_synced_pdfs_v3';
export const DRIVE_LAST_SYNC_KEY = 'igcse_0653_drive_last_sync_timestamp';
export const MANUAL_SLIDES_STORAGE_KEY = 'igcse_0653_manual_slides_overrides';

export interface DriveSyncedSlideItem {
  id: string; // Google Drive file ID
  name: string; // EXACT unmodified file name from Drive
  mimeType: string;
  webViewLink?: string;
  thumbnailLink?: string;
  createdTime?: string;
  modifiedTime?: string;
  extractedCode: string | null; // e.g. "B1.1", "C2.3", "P4.1"
  matchedSubtopicCode: string | null;
  googleSlidesEmbedUrl: string;
  googleSlidesDirectUrl: string;
}

export interface DriveSyncedPdfItem {
  id: string;
  name: string; // Exact title
  mimeType: string;
  webViewLink?: string;
  thumbnailLink?: string;
}

export interface DriveSyncResult {
  folderId: string;
  totalItemsFound: number;
  presentationsCount: number;
  pdfsCount: number;
  slides: DriveSyncedSlideItem[];
  pdfs: DriveSyncedPdfItem[];
  syncTimestamp: number;
}

/**
 * Canonical Cambridge IGCSE 0653 Subtopics Sequence for every Topic.
 * Used to accurately map sequential lesson numbers (e.g. "B9 Lesson 2", "P1 Lesson 5", "P2 Lesson 6")
 * into their exact Cambridge subtopic codes.
 */
export const CAMBRIDGE_0653_TOPIC_SUBTOPICS: Record<string, string[]> = {
  // Biology (16 Topics, 33 Subtopics)
  B1: ['B1.1'],
  B2: ['B2.1', 'B2.2'],
  B3: ['B3.1', 'B3.2', 'B3.3'],
  B4: ['B4.1'],
  B5: ['B5.1'],
  B6: ['B6.1', 'B6.2'],
  B7: ['B7.1', 'B7.2', 'B7.3'],
  B8: ['B8.1', 'B8.2', 'B8.3'],
  B9: ['B9.1', 'B9.2', 'B9.3', 'B9.4'],
  B10: ['B10.1'],
  B11: ['B11.1'],
  B12: ['B12.1'],
  B13: ['B13.1'],
  B14: ['B14.1', 'B14.2'],
  B15: ['B15.1', 'B15.2', 'B15.3'],
  B16: ['B16.1', 'B16.2'],

  // Chemistry (12 Topics, 34 Subtopics)
  C1: ['C1.1'],
  C2: ['C2.1', 'C2.2', 'C2.3', 'C2.4'],
  C3: ['C3.1'],
  C4: ['C4.1'],
  C5: ['C5.1'],
  C6: ['C6.1', 'C6.2', 'C6.3'],
  C7: ['C7.1', 'C7.2', 'C7.3'],
  C8: ['C8.1', 'C8.2', 'C8.3', 'C8.4', 'C8.5'],
  C9: ['C9.1', 'C9.2', 'C9.3', 'C9.4', 'C9.5', 'C9.6'],
  C10: ['C10.1', 'C10.2'],
  C11: ['C11.1', 'C11.2', 'C11.3', 'C11.4', 'C11.5'],
  C12: ['C12.1', 'C12.2', 'C12.3', 'C12.4'],

  // Physics (5 Topics, 39 Subtopics)
  P1: ['P1.1', 'P1.2', 'P1.3', 'P1.4', 'P1.5.1', 'P1.6.1', 'P1.6.2', 'P1.6.3', 'P1.6.4', 'P1.7'],
  P2: ['P2.1.1', 'P2.1.2', 'P2.1.3', 'P2.2.1', 'P2.2.2', 'P2.3.1', 'P2.3.2', 'P2.3.3', 'P2.3.4'],
  P3: ['P3.1', 'P3.2.1', 'P3.2.2', 'P3.2.3', 'P3.2.4', 'P3.3', 'P3.4'],
  P4: ['P4.1.1', 'P4.1.2', 'P4.1.3', 'P4.1.4', 'P4.1.5', 'P4.2.1', 'P4.2.2', 'P4.3', 'P4.4'],
  P5: ['P5.1.1', 'P5.2.1', 'P5.2.2', 'P5.2.3']
};

export const ALL_VALID_SUBTOPIC_CODES = new Set<string>(
  Object.values(CAMBRIDGE_0653_TOPIC_SUBTOPICS).flat()
);

/**
 * Standard Cambridge IGCSE 0653 syllabus shorthand codes mapped to canonical subtopic codes.
 */
export const CAMBRIDGE_0653_SHORTHAND_MAP: Record<string, string> = {
  'P1.5': 'P1.5.1',
  'P1.6': 'P1.6.1',
  'P2.1': 'P2.1.1',
  'P2.2': 'P2.2.1',
  'P2.3': 'P2.3.1',
  'P3.2': 'P3.2.1',
  'P4.1': 'P4.1.1',
  'P4.2': 'P4.2.1',
  'P5.1': 'P5.1.1',
  'P5.2': 'P5.2.1'
};

/**
 * Master Cambridge IGCSE 0653 Topic-to-Subtopic Semantic Keyword Rules
 * Ensures lesson presentations from Google Drive with descriptive titles (e.g. "B9 The Heart", "B9 Blood Vessels")
 * are correctly placed into their exact subtopics (B9.2, B9.3, etc.) rather than all collapsing into the first subtopic.
 * Covers all Biology, Chemistry, and Physics topics.
 */
export const TOPIC_SUBTOPIC_KEYWORD_RULES: Record<string, Array<{ subtopic: string; keywords: string[] }>> = {
  // Biology
  B1: [
    { subtopic: 'B1.1', keywords: ['living organism', 'characteristics of living', 'mrs gren', 'movement', 'respiration in organism', 'sensitivity', 'growth', 'reproduction in living', 'excretion', 'nutrition in living'] }
  ],
  B2: [
    { subtopic: 'B2.2', keywords: ['microscope', 'magnification', 'specimen', 'onion', 'actual size', 'image size', 'm = i / a', 'eyepiece', 'graticule', 'micrometre', 'micrometer'] },
    { subtopic: 'B2.1', keywords: ['cell', 'ultrastructure', 'organelle', 'nucleus', 'mitochondri', 'chloroplast', 'vacuole', 'specialised', 'specialized', 'ciliated', 'root hair', 'palisade', 'ribosome', 'cytoplasm'] }
  ],
  B3: [
    { subtopic: 'B3.3', keywords: ['active transport', 'carrier protein', 'atp', 'against concentration', 'against gradient', 'energy required'] },
    { subtopic: 'B3.2', keywords: ['osmosis', 'potato', 'water potential', 'turgid', 'turgor', 'plasmolysis', 'flaccid', 'cylinder', 'partially permeable', 'selectively permeable'] },
    { subtopic: 'B3.1', keywords: ['diffusion', 'concentration gradient', 'kinetic', 'random motion', 'surface area to volume', 'gas diffusion'] }
  ],
  B4: [
    { subtopic: 'B4.1', keywords: ['biological molecule', 'carbohydrate', 'glucose', 'starch', 'protein', 'amino acid', 'lipid', 'fat', 'oil', 'benedict', 'iodine test', 'biuret', 'ethanol emulsion', 'food test'] }
  ],
  B5: [
    { subtopic: 'B5.1', keywords: ['enzyme', 'catalyst', 'active site', 'substrate', 'denaturation', 'denatured', 'optimum temperature', 'optimum ph', 'collision', 'enzyme-substrate'] }
  ],
  B6: [
    { subtopic: 'B6.2', keywords: ['leaf structure', 'leaf anatomy', 'cross section', 'anatomy of leaf', 'cuticle', 'epidermis', 'palisade mesophyll', 'spongy mesophyll', 'stomata', 'guard cell', 'gas exchange in leaf', 'air space'] },
    { subtopic: 'B6.1', keywords: ['photosynthesis', 'limiting factor', 'light intensity', 'chlorophyll', 'hydrogencarbonate', 'starch test in leaf', 'destarching', 'photosynthesis equation'] }
  ],
  B7: [
    { subtopic: 'B7.3', keywords: ['chemical digestion', 'enzyme', 'amylase', 'protease', 'pepsin', 'trypsin', 'lipase', 'visking', 'model gut', 'bile', 'emulsification', 'hydrochloric acid', 'digestive enzyme', 'maltase'] },
    { subtopic: 'B7.2', keywords: ['alimentary canal', 'digestive system', 'organ', 'ingestion', 'digestion', 'absorption', 'assimilation', 'egestion', 'oesophagus', 'stomach', 'duodenum', 'ileum', 'colon', 'rectum', 'peristalsis', 'villi', 'mouth', 'pancreas', 'gall bladder'] },
    { subtopic: 'B7.1', keywords: ['diet', 'nutrient', 'balanced diet', 'vitamin', 'mineral', 'calcium', 'iron', 'fibre', 'scurvy', 'rickets', 'malnutrition', 'food label', 'energy requirements', 'starvation', 'obesity', 'deficiency'] }
  ],
  B8: [
    { subtopic: 'B8.3', keywords: ['transpiration', 'potometer', 'evaporation', 'stomata', 'humidity', 'transpiration stream', 'wind speed', 'wilting', 'temperature transpiration'] },
    { subtopic: 'B8.2', keywords: ['water uptake', 'root hair', 'pathway of water', 'cortex', 'osmosis in root', 'root hair cell'] },
    { subtopic: 'B8.1', keywords: ['xylem', 'phloem', 'translocation', 'vascular bundle', 'lignin', 'support', 'transport in plant', 'sucrose transport'] }
  ],
  B9: [
    { subtopic: 'B9.2', keywords: ['heart', 'cardiac', 'ventricle', 'atrium', 'atria', 'valve', 'valves in heart', 'chd', 'coronary', 'dissection', 'septum', 'aorta', 'pulse', 'ecg', 'heart attack', 'atherosclerosis', 'bypass', 'stent', 'angina', 'left ventricle', 'right ventricle'] },
    { subtopic: 'B9.3', keywords: ['vessel', 'vessels', 'artery', 'arteries', 'vein', 'veins', 'capillary', 'capillaries', 'lumen', 'endothelium', 'blood pressure', 'elastic wall', 'muscular wall', 'valves in vein'] },
    { subtopic: 'B9.4', keywords: ['component', 'components', 'blood cell', 'red blood', 'white blood', 'platelet', 'platelets', 'plasma', 'haemoglobin', 'phagocyt', 'lymphocyt', 'clotting', 'bioviewer', 'smear', 'blood film', 'antibody', 'fibrinogen'] },
    { subtopic: 'B9.1', keywords: ['circulation', 'circulatory', 'double circulation', 'pulmonary', 'systemic', 'circulatory system', 'single circulation', 'fish circulation'] }
  ],
  B10: [
    { subtopic: 'B10.1', keywords: ['pathogen', 'disease', 'transmissible', 'immunity', 'vaccination', 'vaccine', 'antibiotic', 'penicillin', 'virus', 'bacteria', 'fungus', 'antigen', 'memory cell', 'mrsa'] }
  ],
  B11: [
    { subtopic: 'B11.1', keywords: ['gas exchange', 'breathing', 'respiratory system', 'trachea', 'bronchus', 'bronchiole', 'alveoli', 'alveolus', 'lung', 'diaphragm', 'intercostal', 'ventilation', 'inhalation', 'exhalation'] }
  ],
  B12: [
    { subtopic: 'B12.1', keywords: ['respiration', 'aerobic', 'anaerobic', 'glucose', 'oxygen debt', 'lactic acid', 'fermentation', 'yeast respiration'] }
  ],
  B13: [
    { subtopic: 'B13.1', keywords: ['coordination', 'nervous system', 'neurone', 'reflex arc', 'synapse', 'hormone', 'adrenaline', 'insulin', 'homeostasis', 'temperature regulation', 'skin', 'vasoconstriction', 'vasodilation', 'tropism', 'phototropism', 'auxin'] }
  ],
  B14: [
    { subtopic: 'B14.2', keywords: ['human reproduction', 'menstrual', 'menstruation', 'testis', 'testes', 'ovary', 'uterus', 'gamete', 'sperm', 'ovum', 'fertilisation in human', 'puberty', 'prostate', 'penis', 'vagina', 'placenta', 'embryo'] },
    { subtopic: 'B14.1', keywords: ['plant reproduction', 'flower', 'pollination', 'anther', 'stigma', 'carpel', 'stamen', 'petal', 'sepal', 'ovule', 'seed', 'germination', 'nectar', 'insect pollination', 'wind pollination'] }
  ],
  B15: [
    { subtopic: 'B15.3', keywords: ['carbon cycle', 'combustion', 'fossil fuel', 'carbon sink', 'decomposition', 'greenhouse effect in carbon', 'photosynthesis in carbon'] },
    { subtopic: 'B15.2', keywords: ['food chain', 'food web', 'trophic', 'herbivore', 'carnivore', 'biomass', 'pyramid of biomass', 'pyramid of numbers', 'consumer', 'producer', 'energy transfer in food'] },
    { subtopic: 'B15.1', keywords: ['energy flow', 'producer', 'sunlight', 'ecosystem', 'light energy to chemical', 'flow of energy'] }
  ],
  B16: [
    { subtopic: 'B16.2', keywords: ['conservation', 'endangered', 'reserve', 'captive breeding', 'biodiversity', 'seed bank', 'national park', 'sustainable'] },
    { subtopic: 'B16.1', keywords: ['destruction', 'deforestation', 'habitat', 'pollution', 'soil erosion', 'logging', 'extinction', 'climate change in habitat'] }
  ],

  // Chemistry
  C1: [
    { subtopic: 'C1.1', keywords: ['states of matter', 'kinetic particle', 'solid liquid gas', 'melting', 'boiling', 'freezing', 'condensation', 'sublimation', 'heating curve', 'cooling curve', 'diffusion of gas'] }
  ],
  C2: [
    { subtopic: 'C2.4', keywords: ['covalent', 'simple molecule', 'simple molecular', 'sharing electron', 'covalent bond', 'shared pair', 'dot and cross covalent', 'intermolecular'] },
    { subtopic: 'C2.3', keywords: ['ion', 'ionic', 'lattice', 'transfer electron', 'cation', 'anion', 'electrostatic', 'giant ionic', 'dot and cross ionic'] },
    { subtopic: 'C2.2', keywords: ['atomic structure', 'periodic table', 'electron configuration', 'electronic configuration', 'subatomic', 'proton', 'neutron', 'atomic number', 'mass number', 'isotope'] },
    { subtopic: 'C2.1', keywords: ['element', 'compound', 'mixture', 'pure substance'] }
  ],
  C3: [
    { subtopic: 'C3.1', keywords: ['stoichiometry', 'formula', 'chemical equation', 'balanced equation', 'relative atomic mass', 'relative molecular mass', 'conservation of mass', 'state symbol'] }
  ],
  C4: [
    { subtopic: 'C4.1', keywords: ['electrochemistry', 'electrolysis', 'electrolyte', 'cathode', 'anode', 'molten', 'electroplating', 'inert electrode', 'lead bromide', 'copper refining'] }
  ],
  C5: [
    { subtopic: 'C5.1', keywords: ['energetics', 'exothermic', 'endothermic', 'energy level diagram', 'activation energy', 'bond breaking', 'bond making'] }
  ],
  C6: [
    { subtopic: 'C6.3', keywords: ['redox', 'oxidation', 'reduction', 'reducing agent', 'oxidising agent', 'electron loss', 'electron gain', 'oil rig', 'displacement redox'] },
    { subtopic: 'C6.2', keywords: ['rate of reaction', 'collision theory', 'activation energy', 'catalyst', 'concentration effect', 'surface area', 'temperature effect', 'gas syringe', 'disappearing cross'] },
    { subtopic: 'C6.1', keywords: ['physical change', 'chemical change', 'reversibility', 'thermal decomposition'] }
  ],
  C7: [
    { subtopic: 'C7.3', keywords: ['preparation of salt', 'salt', 'salts', 'insoluble salt', 'precipitation', 'titration', 'crystallisation', 'making salt', 'excess metal', 'excess base'] },
    { subtopic: 'C7.2', keywords: ['oxide', 'oxides', 'basic oxide', 'acidic oxide', 'amphoteric', 'neutral oxide', 'metal oxide', 'non-metal oxide'] },
    { subtopic: 'C7.1', keywords: ['acid', 'base', 'alkali', 'indicator', 'litmus', 'methyl orange', 'ph scale', 'neutralisation', 'universal indicator', 'thymolphthalein'] }
  ],
  C8: [
    { subtopic: 'C8.5', keywords: ['noble gas', 'noble gases', 'argon', 'helium', 'neon', 'inert', 'unreactive', 'group 8', 'group viii', 'group 0'] },
    { subtopic: 'C8.4', keywords: ['transition element', 'transition metal', 'coloured compound', 'catalytic', 'variable oxidation', 'catalyst metal'] },
    { subtopic: 'C8.3', keywords: ['halogen', 'halogens', 'group 7', 'group vii', 'chlorine', 'bromine', 'iodine', 'displacement', 'halide'] },
    { subtopic: 'C8.2', keywords: ['alkali metal', 'group 1', 'group i', 'lithium', 'sodium', 'potassium', 'reactivity trend down group 1'] },
    { subtopic: 'C8.1', keywords: ['arrangement of elements', 'periodic table group', 'period', 'valence electron', 'metallic to non-metallic'] }
  ],
  C9: [
    { subtopic: 'C9.6', keywords: ['extraction of metal', 'blast furnace', 'iron extraction', 'hematite', 'haematite', 'limestone', 'coke', 'reduction by carbon', 'bauxite', 'electrolysis of aluminium', 'slag'] },
    { subtopic: 'C9.5', keywords: ['corrosion', 'rusting', 'rust', 'galvanising', 'sacrificial protection', 'barrier', 'painting', 'greasing'] },
    { subtopic: 'C9.4', keywords: ['reactivity series', 'metal displacement', 'reactivity with water', 'reactivity with acid', 'reduction with carbon'] },
    { subtopic: 'C9.3', keywords: ['alloy', 'alloys', 'brass', 'steel', 'bronze', 'hardness of alloy', 'distorted layer'] },
    { subtopic: 'C9.2', keywords: ['uses of metal', 'aluminium use', 'copper use', 'overhead cable', 'electrical wire', 'aircraft'] },
    { subtopic: 'C9.1', keywords: ['properties of metal', 'metallic bonding', 'malleability', 'ductility', 'electrical conductivity', 'delocalised electron'] }
  ],
  C10: [
    { subtopic: 'C10.2', keywords: ['air quality', 'climate change', 'greenhouse gas', 'pollutant', 'carbon monoxide', 'sulfur dioxide', 'nitrogen oxide', 'acid rain', 'catalytic converter', 'global warming'] },
    { subtopic: 'C10.1', keywords: ['water test', 'water treatment', 'chlorination', 'anhydrous copper', 'cobalt chloride', 'filtration of water', 'sedimentation', 'drinking water'] }
  ],
  C11: [
    { subtopic: 'C11.5', keywords: ['polymer', 'polymers', 'addition polymerisation', 'poly(ethene)', 'polyethene', 'monomer', 'plastics'] },
    { subtopic: 'C11.4', keywords: ['alkene', 'alkenes', 'cracking', 'bromine water', 'unsaturated', 'double bond', 'addition reaction', 'ethene', 'propene'] },
    { subtopic: 'C11.3', keywords: ['alkane', 'alkanes', 'combustion', 'saturated', 'methane', 'ethane', 'propane', 'butane', 'complete combustion'] },
    { subtopic: 'C11.2', keywords: ['fractional distillation', 'crude oil', 'petroleum', 'fractions', 'refinery gas', 'gasoline', 'diesel', 'bitumen', 'kerosene', 'fuel oil'] },
    { subtopic: 'C11.1', keywords: ['organic terminology', 'homologous series', 'hydrocarbon', 'functional group'] }
  ],
  C12: [
    { subtopic: 'C12.4', keywords: ['identification of ion', 'test for ion', 'flame test', 'cation test', 'anion test', 'gas test', 'sodium hydroxide test', 'ammonia test', 'limewater', 'halide test', 'squeaky pop', 'splint'] },
    { subtopic: 'C12.3', keywords: ['separation and purification', 'distillation', 'filtration', 'crystallisation', 'purity', 'melting point purity'] },
    { subtopic: 'C12.2', keywords: ['chromatography', 'rf value', 'chromatogram', 'solvent front', 'locating agent'] },
    { subtopic: 'C12.1', keywords: ['experimental design', 'apparatus', 'measuring cylinder', 'burette', 'pipette', 'solubility', 'gas syringe'] }
  ],

  // Physics
  P1: [
    { subtopic: 'P1.7', keywords: ['pressure', 'p = f/a', 'pascal', 'hydraulic', 'n/m2', 'sharp knife', 'tyres'] },
    { subtopic: 'P1.6.4', keywords: ['power', 'rate of energy', 'watt', 'p = w/t', 'p = e/t', 'kilowatt'] },
    { subtopic: 'P1.6.3', keywords: ['energy resource', 'renewable', 'solar', 'wind', 'fossil fuel', 'hydroelectric', 'geothermal', 'nuclear energy', 'tidal', 'wave power'] },
    { subtopic: 'P1.6.2', keywords: ['work done', 'efficiency', 'w = f x d', 'useful output', 'joule'] },
    { subtopic: 'P1.6.1', keywords: ['energy store', 'kinetic energy', 'gravitational potential', 'elastic', 'thermal energy', 'energy transfer'] },
    { subtopic: 'P1.5.1', keywords: ['force', 'forces', 'friction', 'drag', 'newton', 'terminal velocity', 'f = ma', 'resultant force', 'hooke', 'extension'] },
    { subtopic: 'P1.4', keywords: ['density', 'eureka can', 'displacement', 'mass / volume', 'rho = m/v'] },
    { subtopic: 'P1.3', keywords: ['mass and weight', 'mass', 'weight', 'gravity', 'w = mg', 'gravitational field'] },
    { subtopic: 'P1.2', keywords: ['speed', 'velocity', 'acceleration', 'distance-time', 'velocity-time', 'motion graph', 'gradient'] },
    { subtopic: 'P1.1', keywords: ['measuring', 'pendulum', 'micrometer', 'vernier', 'stopwatch', 'physical quantities'] }
  ],
  P2: [
    { subtopic: 'P2.3.4', keywords: ['thermal insulation', 'vacuum flask', 'loft insulation', 'double glazing', 'reducing heat loss'] },
    { subtopic: 'P2.3.3', keywords: ['thermal radiation', 'leslie cube', 'infrared', 'matt black', 'shiny silver', 'radiation', 'emission'] },
    { subtopic: 'P2.3.2', keywords: ['thermal convection', 'convection current', 'density change in fluid', 'heating liquid'] },
    { subtopic: 'P2.3.1', keywords: ['thermal conduction', 'conduction', 'delocalised electron', 'lattice vibration', 'solid conductor'] },
    { subtopic: 'P2.2.2', keywords: ['evaporation', 'cooling effect', 'evaporative cooling', 'sweat cooling'] },
    { subtopic: 'P2.2.1', keywords: ['thermal expansion', 'expansion of solid', 'bimetallic strip', 'liquid expansion'] },
    { subtopic: 'P2.1.3', keywords: ['boyle', 'pressure and volume', 'p1v1 = p2v2', "boyle's law", 'inversely proportional'] },
    { subtopic: 'P2.1.2', keywords: ['gas pressure', 'molecular collision', 'temperature and gas pressure', 'particle momentum'] },
    { subtopic: 'P2.1.1', keywords: ['states of matter', 'particle arrangement', 'solid liquid gas model', 'forces between particles'] }
  ],
  P3: [
    { subtopic: 'P3.4', keywords: ['sound', 'echo', 'ultrasound', 'compression', 'rarefaction', 'pitch', 'amplitude of sound', 'speed of sound'] },
    { subtopic: 'P3.3', keywords: ['electromagnetic spectrum', 'em spectrum', 'radio wave', 'microwave', 'infrared', 'ultraviolet', 'x-ray', 'gamma'] },
    { subtopic: 'P3.2.4', keywords: ['dispersion of light', 'dispersion', 'prism', 'white light spectrum', 'rainbow', 'roygbiv'] },
    { subtopic: 'P3.2.3', keywords: ['converging lens', 'convex lens', 'focal length', 'focal point', 'ray diagram', 'thin lens', 'magnifying glass'] },
    { subtopic: 'P3.2.2', keywords: ['refraction', 'glass block', 'angle of refraction', 'snell', 'bending of light'] },
    { subtopic: 'P3.2.1', keywords: ['reflection', 'ray box', 'law of reflection', 'plane mirror', 'normal', 'virtual image'] },
    { subtopic: 'P3.1', keywords: ['wave properties', 'transverse wave', 'longitudinal wave', 'wave speed', 'v = f x lambda', 'wavelength', 'frequency', 'amplitude'] }
  ],
  P4: [
    { subtopic: 'P4.4', keywords: ['electromagnetic converter', 'motor', 'generator', 'electric motor', 'transformer', 'step-up', 'step-down', 'electromagnet'] },
    { subtopic: 'P4.3', keywords: ['electrical safety', 'fuse', 'earthing', 'circuit breaker', 'double insulation', 'electrical hazard'] },
    { subtopic: 'P4.2.2', keywords: ['series and parallel', 'parallel circuit', 'series circuit', 'combined resistance'] },
    { subtopic: 'P4.2.1', keywords: ['circuit symbol', 'circuit diagram', 'cell', 'battery', 'switch', 'lamp', 'thermistor', 'ldr'] },
    { subtopic: 'P4.1.5', keywords: ['electrical energy and power', 'p = iv', 'e = ivt', 'electrical power', 'kilowatt-hour'] },
    { subtopic: 'P4.1.4', keywords: ['resistance and ohm', "ohm's law", 'v = ir', 'resistor iv', 'filament lamp', 'variable resistor'] },
    { subtopic: 'P4.1.3', keywords: ['electromotive force', 'potential difference', 'voltage', 'emf', 'voltmeter', 'v = w/q'] },
    { subtopic: 'P4.1.2', keywords: ['electric current', 'current', 'ammeter', 'charge', 'q = it', 'ampere'] },
    { subtopic: 'P4.1.1', keywords: ['electrical charge', 'electrostatic', 'friction charging', 'positive charge', 'negative charge', 'coulomb'] }
  ],
  P5: [
    { subtopic: 'P5.2.3', keywords: ['galaxies and the universe', 'galaxy', 'milky way', 'redshift', 'big bang', 'expanding universe', 'doppler'] },
    { subtopic: 'P5.2.2', keywords: ['life cycle of stars', 'star life cycle', 'supernova', 'white dwarf', 'neutron star', 'black hole', 'protostar', 'red giant'] },
    { subtopic: 'P5.2.1', keywords: ['the sun', 'orbital speed', 'light-year', 'nuclear fusion in sun'] },
    { subtopic: 'P5.1.1', keywords: ['solar system', 'planets of solar system', 'planetary orbit', 'elliptical orbit', 'planets'] }
  ]
};

/**
 * Extracts the Cambridge lesson code at the start or within the lesson title.
 * Correctly identifies multi-segment codes like B9.1, B9.2, B9.3, B9.4, P1.5.1,
 * as well as "B9 Lesson 2", "B9 L3", "B9 - 4", "B9_2", "P1 Lesson 5", "P2 Lesson 6", etc.
 * Maps sequential lesson numbers within a topic to the exact canonical Cambridge subtopic code.
 */
export function extractLessonCode(title: string): string | null {
  if (!title || !title.trim()) return null;
  const clean = title.trim();

  // Pattern 0: Exact code at the very start of the string, e.g. "P1.5.1. Density", "P1.5.1 Forces", "[P1.5.1] ...", "(P1.5.1) ..."
  const leadingCodeMatch = clean.match(/^[\[(]?([BCP]\d+(?:\.\d+)+)[\])]?(?:\.|\s|:|-|_|$)/i);
  if (leadingCodeMatch) {
    const raw = leadingCodeMatch[1].toUpperCase();
    if (ALL_VALID_SUBTOPIC_CODES.has(raw)) return raw;
    if (CAMBRIDGE_0653_SHORTHAND_MAP[raw]) return CAMBRIDGE_0653_SHORTHAND_MAP[raw];
    return raw;
  }

  // Pattern 1: Exact subtopic code with decimals, e.g. "B9.2", "P1.5.1", "C2.3"
  const multiDotMatch = clean.match(/\b([BCP]\d+(?:\.\d+)+)\b/i);
  if (multiDotMatch) {
    const raw = multiDotMatch[1].toUpperCase();
    if (ALL_VALID_SUBTOPIC_CODES.has(raw)) return raw;
    if (CAMBRIDGE_0653_SHORTHAND_MAP[raw]) return CAMBRIDGE_0653_SHORTHAND_MAP[raw];
    return raw;
  }

  // Pattern 2: Spaced decimal notation, e.g. "B9 . 2" or "B9. 2"
  const spacedDotMatch = clean.match(/\b([BCP]\d+)\s*\.\s*(\d+(?:\.\d+)*)\b/i);
  if (spacedDotMatch) {
    const raw = `${spacedDotMatch[1].toUpperCase()}.${spacedDotMatch[2]}`;
    if (ALL_VALID_SUBTOPIC_CODES.has(raw)) return raw;
    if (CAMBRIDGE_0653_SHORTHAND_MAP[raw]) return CAMBRIDGE_0653_SHORTHAND_MAP[raw];
    return raw;
  }

  // Pattern 3: Bracketed code at start, e.g. "[B9.2] ...", "(C2.3) ..."
  const bracketMatch = clean.match(/^[\[(]([BCP]\d+(?:\.\d+)*)[\])]/i);
  if (bracketMatch) {
    const raw = bracketMatch[1].toUpperCase();
    if (ALL_VALID_SUBTOPIC_CODES.has(raw)) return raw;
    if (CAMBRIDGE_0653_SHORTHAND_MAP[raw]) return CAMBRIDGE_0653_SHORTHAND_MAP[raw];
    return raw;
  }

  // Pattern 4: Topic + Lesson/Part number, e.g. "B9 Lesson 2", "B9 - 2", "B9_3", "B9 L4", "B9_L2", "B9: 2"
  const lessonNumMatch = clean.match(/([BCP]\d+)[\s._:-]*(?:Lesson|L|Part|Pt|Unit)?[\s._:-]*(\d+)(?:[^\d]|$)/i);
  if (lessonNumMatch) {
    const topic = lessonNumMatch[1].toUpperCase();
    const num = parseInt(lessonNumMatch[2], 10);
    const subtopics = CAMBRIDGE_0653_TOPIC_SUBTOPICS[topic];
    if (subtopics && num >= 1 && num <= subtopics.length) {
      return subtopics[num - 1];
    }
    return `${topic}.${num}`;
  }

  // Pattern 5: Inverted prefix like "Lesson 2 - B9"
  const invertedMatch = clean.match(/(?:Lesson|L|Part)[\s._:-]*(\d+)[\s._:-]+([BCP]\d+)/i);
  if (invertedMatch) {
    const topic = invertedMatch[2].toUpperCase();
    const num = parseInt(invertedMatch[1], 10);
    const subtopics = CAMBRIDGE_0653_TOPIC_SUBTOPICS[topic];
    if (subtopics && num >= 1 && num <= subtopics.length) {
      return subtopics[num - 1];
    }
    return `${topic}.${num}`;
  }

  // Pattern 6: General topic prefix, e.g. "B9 ...", "C2 ...", "P1 ..."
  const startMatch = clean.match(/^([BCP]\d+)/i);
  if (startMatch) {
    return startMatch[1].toUpperCase();
  }

  // Pattern 7: Any topic code
  const anyTopicMatch = clean.match(/\b([BCP]\d+)\b/i);
  if (anyTopicMatch) {
    return anyTopicMatch[1].toUpperCase();
  }

  return null;
}

/**
 * Master resolution: accurately matches any Google Drive lesson presentation title
 * to its exact Cambridge subtopic code (e.g. B9.1, B9.2, B9.3, B9.4, P1.5.1, C8.3).
 * Always treats the lesson title as the primary source of truth so that no lesson
 * is incorrectly relegated to the first subtopic.
 */
export function resolveSubtopicForSlide(title: string, rawCode?: string | null): string | null {
  if (!title && !rawCode) return null;
  const cleanTitle = (title || '').trim();

  // 1. First, extract code directly from title
  const extracted = cleanTitle ? extractLessonCode(cleanTitle) : null;
  if (extracted) {
    // If the extracted code is already a valid canonical subtopic (e.g. "B9.2", "P1.5.1", "C8.3")
    if (ALL_VALID_SUBTOPIC_CODES.has(extracted)) {
      return extracted;
    }
    if (CAMBRIDGE_0653_SHORTHAND_MAP[extracted]) {
      return CAMBRIDGE_0653_SHORTHAND_MAP[extracted];
    }
  }

  // 2. Determine topic context (e.g. "B9", "C8", "P1") from extracted or title
  let topic: string | null = null;
  if (extracted && !extracted.includes('.')) {
    topic = extracted;
  } else if (cleanTitle) {
    const topicMatch = cleanTitle.match(/\b([BCP]\d+)\b/i);
    if (topicMatch) {
      topic = topicMatch[1].toUpperCase();
    }
  }

  // 3. If topic is identified (e.g. "B9", "C8", "P1"), apply syllabus semantic keyword rules
  if (topic && TOPIC_SUBTOPIC_KEYWORD_RULES[topic]) {
    const lowerTitle = cleanTitle.toLowerCase();
    for (const rule of TOPIC_SUBTOPIC_KEYWORD_RULES[topic]) {
      for (const kw of rule.keywords) {
        if (lowerTitle.includes(kw.toLowerCase())) {
          return rule.subtopic;
        }
      }
    }
  }

  // 4. If title has no topic prefix, search global keywords across all topics
  if (cleanTitle) {
    const lowerTitle = cleanTitle.toLowerCase();
    for (const topicKey of Object.keys(TOPIC_SUBTOPIC_KEYWORD_RULES)) {
      for (const rule of TOPIC_SUBTOPIC_KEYWORD_RULES[topicKey]) {
        for (const kw of rule.keywords) {
          if (kw.length >= 5 && lowerTitle.includes(kw.toLowerCase())) {
            return rule.subtopic;
          }
        }
      }
    }
  }

  // 5. If topic is known and has only 1 subtopic in Cambridge 0653 (e.g. B1, B4, B5, B10, C1, C3, etc.)
  if (topic && CAMBRIDGE_0653_TOPIC_SUBTOPICS[topic] && CAMBRIDGE_0653_TOPIC_SUBTOPICS[topic].length === 1) {
    return CAMBRIDGE_0653_TOPIC_SUBTOPICS[topic][0];
  }

  // 6. If title has an extracted code with a dot that was not recognized, return it
  if (extracted && extracted.includes('.')) {
    return extracted;
  }

  // 7. If title yielded no match, check rawCode hint (validating against canonical codes)
  if (rawCode) {
    const upperRaw = rawCode.toUpperCase().trim();
    if (ALL_VALID_SUBTOPIC_CODES.has(upperRaw)) {
      return upperRaw;
    }
    if (CAMBRIDGE_0653_SHORTHAND_MAP[upperRaw]) {
      return CAMBRIDGE_0653_SHORTHAND_MAP[upperRaw];
    }
  }

  // 8. Default topic mapping fallback (only if no subtopic or keywords match)
  if (topic) {
    return matchToSubtopicCode(topic);
  }

  return null;
}

/**
 * Maps an extracted code (e.g. "B1.1", "B1", "C2", etc.) to a specific subtopicCode
 */
export function matchToSubtopicCode(extractedCode: string | null, title?: string): string | null {
  if (title) {
    const resolved = resolveSubtopicForSlide(title, extractedCode);
    if (resolved) return resolved;
  }

  if (!extractedCode) return null;
  const upper = extractedCode.toUpperCase();

  // If already full subtopic like B1.1, C2.3, P4.1
  if (upper.includes('.')) {
    return upper;
  }

  // If just B1, B2, C1, P1 etc., default to the primary subtopic
  const defaultMap: Record<string, string> = {
    'B1': 'B1.1',
    'B2': 'B2.1',
    'B3': 'B3.1',
    'B4': 'B4.1',
    'B5': 'B5.1',
    'B6': 'B6.1',
    'B7': 'B7.1',
    'B8': 'B8.1',
    'B9': 'B9.1',
    'B10': 'B10.1',
    'B11': 'B11.1',
    'B12': 'B12.1',
    'B13': 'B13.1',
    'B14': 'B14.1',
    'B15': 'B15.1',
    'B16': 'B16.1',
    'C1': 'C1.1',
    'C2': 'C2.1',
    'C3': 'C3.1',
    'C4': 'C4.1',
    'C5': 'C5.1',
    'C6': 'C6.1',
    'C7': 'C7.1',
    'C8': 'C8.1',
    'C9': 'C9.1',
    'C10': 'C10.1',
    'C11': 'C11.1',
    'C12': 'C12.1',
    'P1': 'P1.1',
    'P2': 'P2.1.1',
    'P3': 'P3.1',
    'P4': 'P4.1.1',
    'P5': 'P5.1.1',
    'P6': 'P6.1',
  };

  return defaultMap[upper] || upper;
}

/**
 * Recursively fetches all files from the specified Google Drive folder.
 * Resilient to argument order (token or folderId first) and handles API authentication cleanly.
 */
export async function fetchAllDriveFolderFiles(
  arg1?: string | null,
  arg2?: string | null
): Promise<{ presentations: DriveSyncedSlideItem[]; pdfs: DriveSyncedPdfItem[] }> {
  let accessToken: string | null = null;
  let folderId = TARGET_DRIVE_FOLDER_ID;

  // Resilient argument detection:
  // If one argument is the target folder or resembles a folder ID, and the other is a token
  if (arg1 && arg2) {
    if (arg1 === TARGET_DRIVE_FOLDER_ID || (!arg1.startsWith('ya29.') && arg1.length < 45 && !arg1.includes('.'))) {
      folderId = arg1;
      accessToken = arg2;
    } else {
      accessToken = arg1;
      folderId = arg2;
    }
  } else if (arg1) {
    if (arg1 === TARGET_DRIVE_FOLDER_ID || (!arg1.startsWith('ya29.') && arg1.length < 45 && !arg1.includes('.'))) {
      folderId = arg1;
    } else {
      accessToken = arg1;
    }
  }

  const presentations: DriveSyncedSlideItem[] = [];
  const pdfs: DriveSyncedPdfItem[] = [];

  async function crawlFolder(currentFolderId: string, parentFolderName?: string) {
    let pageToken: string | null = null;

    do {
      const url = new URL('https://www.googleapis.com/drive/v3/files');
      url.searchParams.set('q', `'${currentFolderId}' in parents and trashed = false`);
      url.searchParams.set('fields', 'nextPageToken, files(id, name, mimeType, webViewLink, webContentLink, thumbnailLink, createdTime, modifiedTime)');
      url.searchParams.set('pageSize', '100');
      url.searchParams.set('orderBy', 'name');
      if (pageToken) {
        url.searchParams.set('pageToken', pageToken);
      }

      // Prepare headers
      const headers: Record<string, string> = {
        Accept: 'application/json'
      };

      if (accessToken && accessToken.trim()) {
        headers['Authorization'] = `Bearer ${accessToken.trim()}`;
      } else if (firebaseConfig.apiKey) {
        url.searchParams.set('key', firebaseConfig.apiKey);
      }

      let response = await fetch(url.toString(), { headers });

      // If token expired (401) and API key is available, attempt public query fallback
      if (response.status === 401 && accessToken && firebaseConfig.apiKey) {
        const fallbackUrl = new URL(url.toString());
        fallbackUrl.searchParams.set('key', firebaseConfig.apiKey);
        const fallbackHeaders: Record<string, string> = { Accept: 'application/json' };
        const fallbackResponse = await fetch(fallbackUrl.toString(), { headers: fallbackHeaders });
        if (fallbackResponse.ok) {
          response = fallbackResponse;
        }
      }

      if (!response.ok) {
        let errorDetails = '';
        try {
          const errJson = await response.json();
          errorDetails = errJson?.error?.message || response.statusText;
        } catch {
          errorDetails = await response.text();
        }

        if (response.status === 401) {
          throw new Error('Google Drive access requires signing in. Please click "Sync Drive Slides" to authenticate with your Google account.');
        } else if (response.status === 403) {
          throw new Error(`Google Drive permission notice: ${errorDetails}. Please ensure you have access to folder ${currentFolderId}.`);
        } else if (response.status === 404) {
          throw new Error(`Folder ID ${currentFolderId} not found in Google Drive.`);
        }
        throw new Error(`Google Drive API error (${response.status}): ${errorDetails}`);
      }

      const data = await response.json();
      const files = data.files || [];

      for (const file of files) {
        if (file.mimeType === 'application/vnd.google-apps.folder') {
          // Recurse into subfolder, passing folder name
          await crawlFolder(file.id, file.name);
        } else if (
          file.mimeType === 'application/vnd.google-apps.presentation' ||
          file.mimeType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
          file.name.endsWith('.pptx') ||
          file.name.endsWith('.gslides') ||
          file.name.toLowerCase().includes('lesson') ||
          file.name.toLowerCase().includes('slide')
        ) {
          const codeFromFileName = extractLessonCode(file.name);
          const codeFromFolder = parentFolderName ? extractLessonCode(parentFolderName) : null;
          const effectiveCode = codeFromFileName || codeFromFolder;
          const matchedSubtopic = resolveSubtopicForSlide(file.name, effectiveCode) || 
            (parentFolderName ? resolveSubtopicForSlide(parentFolderName) : null);

          presentations.push({
            id: file.id,
            name: file.name, // EXACT title preserved without modification
            mimeType: file.mimeType,
            webViewLink: file.webViewLink,
            thumbnailLink: file.thumbnailLink,
            createdTime: file.createdTime,
            modifiedTime: file.modifiedTime,
            extractedCode: matchedSubtopic || effectiveCode,
            matchedSubtopicCode: matchedSubtopic,
            googleSlidesEmbedUrl: `https://docs.google.com/presentation/d/${file.id}/embed?start=false&loop=false&delayms=3000`,
            googleSlidesDirectUrl: file.webViewLink || `https://docs.google.com/presentation/d/${file.id}/edit`
          });
        } else if (file.mimeType === 'application/pdf' || file.name.endsWith('.pdf')) {
          pdfs.push({
            id: file.id,
            name: file.name,
            mimeType: file.mimeType,
            webViewLink: file.webViewLink,
            thumbnailLink: file.thumbnailLink
          });
        }
      }

      pageToken = data.nextPageToken || null;
    } while (pageToken);
  }

  await crawlFolder(folderId);
  return { presentations, pdfs };
}

export interface DriveOrganizeResult {
  success: boolean;
  totalFoundInRoot: number;
  filesMoved: Array<{ fileId: string; fileName: string; targetFolder: string; subtopicCode: string }>;
  foldersCreated: string[];
  totalPresentations: number;
  presentations: DriveSyncedSlideItem[];
  message: string;
}

/**
 * Reads each lesson in the Google Drive root folder, extracts the syllabus code
 * at the start of the name (e.g. "P1.5.1.", "B9.2.", "C9.5."), finds or creates
 * the corresponding subfolder (named with that code), and moves the file into that subfolder.
 * Then replaces all locally cached lessons by performing a fresh recursive scan.
 */
export async function organizeDriveLessonsIntoSubfolders(
  accessToken: string,
  rootFolderId: string = TARGET_DRIVE_FOLDER_ID
): Promise<DriveOrganizeResult> {
  if (!accessToken || !accessToken.trim()) {
    throw new Error('Google Drive authorization required to organize folders. Please sign in with your Google account.');
  }

  const token = accessToken.trim();
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
    'Content-Type': 'application/json'
  };

  // Step 1: List all files and folders directly inside the root folder
  let pageToken: string | null = null;
  const rootItems: Array<{ id: string; name: string; mimeType: string; parents?: string[] }> = [];

  do {
    const listUrl = new URL('https://www.googleapis.com/drive/v3/files');
    listUrl.searchParams.set('q', `'${rootFolderId}' in parents and trashed = false`);
    listUrl.searchParams.set('fields', 'nextPageToken, files(id, name, mimeType, parents)');
    listUrl.searchParams.set('pageSize', '100');
    if (pageToken) listUrl.searchParams.set('pageToken', pageToken);

    const res = await fetch(listUrl.toString(), { headers });
    if (!res.ok) {
      let err = '';
      try {
        const errJson = await res.json();
        err = errJson?.error?.message || res.statusText;
      } catch {
        err = await res.text();
      }
      throw new Error(`Failed to list root Drive folder (${res.status}): ${err}`);
    }

    const data = await res.json();
    if (data.files && Array.isArray(data.files)) {
      rootItems.push(...data.files);
    }
    pageToken = data.nextPageToken || null;
  } while (pageToken);

  // Step 2: Index existing subfolders directly under root
  // Map normalized code -> subfolder ID
  const existingSubfolderMap: Record<string, string> = {};
  for (const item of rootItems) {
    if (item.mimeType === 'application/vnd.google-apps.folder') {
      const folderCode = extractLessonCode(item.name);
      if (folderCode) {
        existingSubfolderMap[folderCode.toUpperCase()] = item.id;
      }
      existingSubfolderMap[item.name.trim().toUpperCase()] = item.id;
    }
  }

  // Step 3: For each file in root folder, read code at start of name and move to corresponding subfolder
  const filesMoved: Array<{ fileId: string; fileName: string; targetFolder: string; subtopicCode: string }> = [];
  const foldersCreated: string[] = [];

  for (const item of rootItems) {
    // Skip folders
    if (item.mimeType === 'application/vnd.google-apps.folder') continue;

    // Check if it's a presentation or lesson file
    const isLesson = 
      item.mimeType === 'application/vnd.google-apps.presentation' ||
      item.mimeType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
      item.name.endsWith('.pptx') ||
      item.name.endsWith('.gslides') ||
      item.name.toLowerCase().includes('lesson') ||
      item.name.toLowerCase().includes('slide') ||
      item.mimeType === 'application/pdf' ||
      item.name.endsWith('.pdf');

    if (!isLesson) continue;

    // Read code at start of name, e.g. "P1.5.1." or "B9.2"
    const code = extractLessonCode(item.name) || resolveSubtopicForSlide(item.name);
    if (!code) continue;

    const normalizedCode = code.toUpperCase();
    let targetFolderId = existingSubfolderMap[normalizedCode];

    // If subfolder doesn't exist, create it inside root folder
    if (!targetFolderId) {
      const createFolderRes = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: normalizedCode,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [rootFolderId]
        })
      });

      if (!createFolderRes.ok) {
        let err = '';
        try {
          const errJson = await createFolderRes.json();
          err = errJson?.error?.message || createFolderRes.statusText;
        } catch {
          err = await createFolderRes.text();
        }
        console.warn(`Failed to create subfolder for ${normalizedCode}:`, err);
        continue;
      }

      const newFolder = await createFolderRes.json();
      targetFolderId = newFolder.id;
      existingSubfolderMap[normalizedCode] = targetFolderId;
      foldersCreated.push(normalizedCode);
    }

    // Move file: remove rootFolderId parent, add targetFolderId parent
    const moveUrl = new URL(`https://www.googleapis.com/drive/v3/files/${item.id}`);
    moveUrl.searchParams.set('addParents', targetFolderId);
    moveUrl.searchParams.set('removeParents', rootFolderId);
    moveUrl.searchParams.set('fields', 'id, parents');

    const moveRes = await fetch(moveUrl.toString(), {
      method: 'PATCH',
      headers
    });

    if (moveRes.ok) {
      filesMoved.push({
        fileId: item.id,
        fileName: item.name,
        targetFolder: normalizedCode,
        subtopicCode: normalizedCode
      });
    } else {
      let err = '';
      try {
        const errJson = await moveRes.json();
        err = errJson?.error?.message || moveRes.statusText;
      } catch {
        err = await moveRes.text();
      }
      console.warn(`Failed to move file ${item.name} into subfolder ${normalizedCode}:`, err);
    }
  }

  // Step 4: "replace all lessons and do it again"
  // Completely flush existing cached lessons in localStorage and re-fetch everything fresh
  localStorage.removeItem(DRIVE_STORAGE_KEY);
  localStorage.removeItem(DRIVE_STORAGE_PDFS_KEY);
  localStorage.removeItem(DRIVE_LAST_SYNC_KEY);

  const freshResult = await fetchAllDriveFolderFiles(token, rootFolderId);
  const totalPresentations = freshResult.presentations.length;

  // Save new fresh presentations to localStorage
  localStorage.setItem(DRIVE_STORAGE_KEY, JSON.stringify(freshResult.presentations));
  localStorage.setItem(DRIVE_STORAGE_PDFS_KEY, JSON.stringify(freshResult.pdfs));
  localStorage.setItem(DRIVE_LAST_SYNC_KEY, String(Date.now()));

  return {
    success: true,
    totalFoundInRoot: rootItems.filter(i => i.mimeType !== 'application/vnd.google-apps.folder').length,
    filesMoved,
    foldersCreated,
    totalPresentations,
    presentations: freshResult.presentations,
    message: filesMoved.length > 0 
      ? `Organized ${filesMoved.length} lessons into corresponding subfolders (${foldersCreated.length} new subfolders created: ${foldersCreated.join(', ')}). Replaced all lessons and freshly re-synced ${totalPresentations} presentations.`
      : `All ${totalPresentations} lessons are organized in their corresponding subfolders. Replaced all stored lessons with fresh Drive sync.`
  };
}

/**
 * Replaces all cached lessons and re-fetches from Drive fresh.
 */
export async function replaceAllSyncedLessons(accessToken: string, folderId: string = TARGET_DRIVE_FOLDER_ID): Promise<DriveSyncedSlideItem[]> {
  localStorage.removeItem(DRIVE_STORAGE_KEY);
  localStorage.removeItem(DRIVE_STORAGE_PDFS_KEY);
  localStorage.removeItem(DRIVE_LAST_SYNC_KEY);

  const res = await fetchAllDriveFolderFiles(accessToken, folderId);
  localStorage.setItem(DRIVE_STORAGE_KEY, JSON.stringify(res.presentations));
  localStorage.setItem(DRIVE_STORAGE_PDFS_KEY, JSON.stringify(res.pdfs));
  localStorage.setItem(DRIVE_LAST_SYNC_KEY, String(Date.now()));

  return res.presentations;
}

/**
 * Saves fetched Drive items to local storage.
 */
export function saveDriveSyncToLocalStorage(result: DriveSyncResult): void {
  try {
    localStorage.setItem(DRIVE_STORAGE_KEY, JSON.stringify(result.slides));
    localStorage.setItem(DRIVE_STORAGE_PDFS_KEY, JSON.stringify(result.pdfs));
    localStorage.setItem(DRIVE_LAST_SYNC_KEY, String(result.syncTimestamp));
  } catch (err) {
    console.error('Failed to cache Drive slides in localStorage:', err);
  }
}

/**
 * Retrieves cached synced Drive slides from local storage.
 * Automatically checks and upgrades any legacy cached slides (e.g. from previous syncs
 * where B9 lessons were incorrectly mapped to B9.1) so they immediately sort into
 * their proper subtopics (B9.2, B9.3, B9.4, etc.) without requiring a manual resync.
 */
export function getCachedDriveSlides(): DriveSyncedSlideItem[] {
  try {
    const raw = localStorage.getItem(DRIVE_STORAGE_KEY);
    if (!raw) return [];
    const parsed: DriveSyncedSlideItem[] = JSON.parse(raw);
    let hasUpgrade = false;

    const upgraded = parsed.map(slide => {
      const accurateSubtopic = resolveSubtopicForSlide(slide.name);
      if (accurateSubtopic && accurateSubtopic !== slide.matchedSubtopicCode) {
        hasUpgrade = true;
        return {
          ...slide,
          extractedCode: accurateSubtopic,
          matchedSubtopicCode: accurateSubtopic
        };
      }
      return slide;
    });

    if (hasUpgrade) {
      try {
        localStorage.setItem(DRIVE_STORAGE_KEY, JSON.stringify(upgraded));
      } catch (e) {
        // ignore storage errors
      }
    }

    return upgraded;
  } catch (err) {
    console.error('Failed to parse cached Drive slides:', err);
    return [];
  }
}

/**
 * Retrieves cached synced PDFs (such as past exam papers in Drive).
 */
export function getCachedDrivePdfs(): DriveSyncedPdfItem[] {
  try {
    const raw = localStorage.getItem(DRIVE_STORAGE_PDFS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse cached Drive PDFs:', err);
    return [];
  }
}

export function getLastSyncTime(): number | null {
  try {
    const raw = localStorage.getItem(DRIVE_LAST_SYNC_KEY);
    return raw ? Number(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Converts synced Drive slides into SlideDeckOptions grouped by subtopic code.
 * Preserves the exact name without modification.
 */
export function mapSyncedSlidesToSubtopics(syncedSlides: DriveSyncedSlideItem[]): Record<string, SlideDeckOption[]> {
  const map: Record<string, SlideDeckOption[]> = {};

  for (const item of syncedSlides) {
    const subCode = resolveSubtopicForSlide(item.name) || item.matchedSubtopicCode || item.extractedCode || 'GENERAL';
    if (!map[subCode]) {
      map[subCode] = [];
    }

    // Determine deck type badge hint from title
    const lowerName = item.name.toLowerCase();
    let deckType: 'Theory' | 'Practical' | 'Planning' | 'Calculations' | 'Revision' = 'Theory';
    if (lowerName.includes('practical') || lowerName.includes('investigation') || lowerName.includes('experiment')) {
      deckType = 'Practical';
    } else if (lowerName.includes('calc') || lowerName.includes('equation') || lowerName.includes('formula')) {
      deckType = 'Calculations';
    } else if (lowerName.includes('plan') || lowerName.includes('method')) {
      deckType = 'Planning';
    } else if (lowerName.includes('revision') || lowerName.includes('exam') || lowerName.includes('summary')) {
      deckType = 'Revision';
    }

    map[subCode].push({
      id: `drive-${item.id}`,
      title: item.name, // EXACT title untouched
      deckType,
      googleSlidesUrl: item.googleSlidesDirectUrl,
      googleSlidesEmbedUrl: item.googleSlidesEmbedUrl,
      description: `Exact presentation from Drive folder 1kypXZXP3nY9pFxuSJOTZ1anODYxxfZ1a (Code: ${item.extractedCode || 'N/A'})`
    });
  }

  return map;
}

/**
 * Parses a Google Slides URL or ID to extract the pure presentation ID.
 */
export function extractGooglePresentationId(urlOrId: string): string | null {
  if (!urlOrId || !urlOrId.trim()) return null;
  const clean = urlOrId.trim();

  // Pattern: https://docs.google.com/presentation/d/{ID}/...
  const match = clean.match(/\/presentation\/d\/([a-zA-Z0-9_-]+)/i);
  if (match && match[1]) {
    return match[1];
  }

  // If it's already an ID (alphanumeric, dashes, underscores, length >= 20)
  if (/^[a-zA-Z0-9_-]{20,}$/.test(clean)) {
    return clean;
  }

  return null;
}

export function buildGoogleSlidesEmbedUrl(presentationId: string): string {
  return `https://docs.google.com/presentation/d/${presentationId}/embed?start=false&loop=false&delayms=3000`;
}

export function buildGoogleSlidesDirectUrl(presentationId: string): string {
  return `https://docs.google.com/presentation/d/${presentationId}/edit`;
}

export function getManualSlideOverrides(): Record<string, { presentationId: string; title: string; embedUrl: string; directUrl: string }> {
  try {
    const raw = localStorage.getItem(MANUAL_SLIDES_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (e) {
    return {};
  }
}

export function saveManualSlideOverride(subtopicCode: string, input: string, title?: string): boolean {
  try {
    const id = extractGooglePresentationId(input);
    if (!id) return false;
    const current = getManualSlideOverrides();
    current[subtopicCode] = {
      presentationId: id,
      title: title || `${subtopicCode} Google Slides Presentation`,
      embedUrl: buildGoogleSlidesEmbedUrl(id),
      directUrl: buildGoogleSlidesDirectUrl(id)
    };
    localStorage.setItem(MANUAL_SLIDES_STORAGE_KEY, JSON.stringify(current));
    return true;
  } catch (e) {
    console.error('Failed to save manual slide override', e);
    return false;
  }
}

