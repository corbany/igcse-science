import { QuizQuestion, ScienceSubject } from '../types';
import { generateDynamicSyllabusQuestions } from '../data/syllabusQuestionsBank';

export interface SyllabusTopicOption {
  code: string;
  subject: ScienceSubject;
  title: string;
  keyConcepts: string;
}

export const ALL_SYLLABUS_TOPICS: SyllabusTopicOption[] = [
  // BIOLOGY (B1 - B16)
  { code: 'B1', subject: 'biology', title: 'Characteristics of Living Organisms', keyConcepts: 'MRS GREN, metabolism, excretion vs egestion' },
  { code: 'B2', subject: 'biology', title: 'Cells & Organisation', keyConcepts: 'Plant vs animal vs bacterial cells, magnification M = I/A' },
  { code: 'B3', subject: 'biology', title: 'Movement In & Out of Cells', keyConcepts: 'Diffusion, osmosis, active transport, water potential' },
  { code: 'B4', subject: 'biology', title: 'Biological Molecules', keyConcepts: 'Carbohydrates, fats, proteins, food test reagents' },
  { code: 'B5', subject: 'biology', title: 'Enzymes', keyConcepts: 'Active site, denaturation, optimum temp & pH, lock & key' },
  { code: 'B6', subject: 'biology', title: 'Plant Nutrition', keyConcepts: 'Photosynthesis equation, leaf anatomy, limiting factors' },
  { code: 'B7', subject: 'biology', title: 'Human Nutrition', keyConcepts: 'Balanced diet, digestive enzymes, peristalsis, absorption' },
  { code: 'B8', subject: 'biology', title: 'Transport in Plants', keyConcepts: 'Xylem, phloem, transpiration, root hair absorption' },
  { code: 'B9', subject: 'biology', title: 'Transport in Animals', keyConcepts: 'Heart anatomy, double circulation, arteries, veins, blood' },
  { code: 'B10', subject: 'biology', title: 'Diseases & Immunity', keyConcepts: 'Pathogens, virus structure, antibodies, vaccines' },
  { code: 'B11', subject: 'biology', title: 'Gas Exchange in Humans', keyConcepts: 'Alveoli features, breathing mechanism, lung volumes' },
  { code: 'B12', subject: 'biology', title: 'Respiration', keyConcepts: 'Aerobic equation, energy uses, mitochondria' },
  { code: 'B13', subject: 'biology', title: 'Coordination & Response', keyConcepts: 'Nervous system, reflex arc, hormones, eye, homeostasis' },
  { code: 'B14', subject: 'biology', title: 'Reproduction', keyConcepts: 'Asexual vs sexual, flower pollination, human menstrual cycle' },
  { code: 'B15', subject: 'biology', title: 'Inheritance', keyConcepts: 'Chromosomes, DNA, monohybrid crosses, genotype vs phenotype' },
  { code: 'B16', subject: 'biology', title: 'Ecosystems & Environment', keyConcepts: 'Food chains, 10% energy transfer, carbon cycle, deforestation' },

  // CHEMISTRY (C1 - C12)
  { code: 'C1', subject: 'chemistry', title: 'States of Matter', keyConcepts: 'Particle model, heating curves, diffusion, gas pressure' },
  { code: 'C2', subject: 'chemistry', title: 'Atoms, Elements & Compounds', keyConcepts: 'Atomic number, electron configuration, ionic & covalent bonding' },
  { code: 'C3', subject: 'chemistry', title: 'Stoichiometry', keyConcepts: 'Formula writing, balancing equations, conservation of mass' },
  { code: 'C4', subject: 'chemistry', title: 'Electrochemistry', keyConcepts: 'Electrolysis of molten PbBr2, conc NaCl, dilute H2SO4' },
  { code: 'C5', subject: 'chemistry', title: 'Chemical Energetics', keyConcepts: 'Exothermic vs endothermic, bond energies, reaction profiles' },
  { code: 'C6', subject: 'chemistry', title: 'Chemical Reactions & Rates', keyConcepts: 'Collision theory, catalysts, surface area, redox reactions' },
  { code: 'C7', subject: 'chemistry', title: 'Acids, Bases & Salts', keyConcepts: 'pH scale, oxides, neutralization, salt preparation methods' },
  { code: 'C8', subject: 'chemistry', title: 'The Periodic Table', keyConcepts: 'Group 1 alkali metals, Group 7 halogens, noble gases' },
  { code: 'C9', subject: 'chemistry', title: 'Metals & Reactivity Series', keyConcepts: 'Reactivity series, blast furnace iron extraction, alloys' },
  { code: 'C10', subject: 'chemistry', title: 'Chemistry of the Environment', keyConcepts: 'Water testing, air composition, greenhouse gases, pollution' },
  { code: 'C11', subject: 'chemistry', title: 'Organic Chemistry', keyConcepts: 'Alkanes, alkenes, cracking, fractional distillation, addition' },
  { code: 'C12', subject: 'chemistry', title: 'Experimental Techniques & Analysis', keyConcepts: 'Apparatus, chromatography, cation/anion/gas identification' },

  // PHYSICS (P1 - P5)
  { code: 'P1', subject: 'physics', title: 'Motion, Forces & Energy', keyConcepts: 'v=s/t, a=Δv/t, W=mg (g=9.8), density, resultant F=ma, work & power' },
  { code: 'P2', subject: 'physics', title: 'Thermal Physics', keyConcepts: 'Conduction, convection, radiation, thermal expansion, evaporation' },
  { code: 'P3', subject: 'physics', title: 'Waves, Light & Sound', keyConcepts: 'v=fλ, reflection, refraction, lenses, EM spectrum, sound echoes' },
  { code: 'P4', subject: 'physics', title: 'Electricity & Magnetism', keyConcepts: 'Charge Q=It, Ohm’s Law V=IR, series vs parallel, power P=IV' },
  { code: 'P5', subject: 'physics', title: 'Nuclear & Space Physics', keyConcepts: 'Solar system, orbital speed, star life cycle, nuclear fusion' }
];

export interface GenerateQuizParams {
  topics: string[];
  numQuestions: number;
  tier?: 'Extended' | 'Core' | 'Mixed';
}

export interface QuizGenerationResult {
  questions: QuizQuestion[];
  source: string;
}

/**
 * Request AI-generated multiple-choice questions from backend or client fallback
 */
export async function generateAIQuiz(params: GenerateQuizParams): Promise<QuizGenerationResult> {
  const clampedNum = Math.min(40, Math.max(1, Math.round(params.numQuestions || 10)));
  const targetTopics = params.topics.length > 0 ? params.topics : ALL_SYLLABUS_TOPICS.map(t => t.code);
  const sessionSeed = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  try {
    const res = await fetch('/api/generate-quiz', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        topics: targetTopics,
        numQuestions: clampedNum,
        tier: params.tier || 'Extended',
        seed: sessionSeed
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.quiz) && data.quiz.length > 0) {
        return {
          questions: data.quiz,
          source: data.source || 'gemini-3.8-flash'
        };
      }
    }
  } catch (err) {
    console.warn('API call to /api/generate-quiz failed, using dynamic syllabus generator:', err);
  }

  // Fallback to high-fidelity client-side generation covering all 33 topics
  const fallbackQuestions = generateClientFallbackQuiz(targetTopics, clampedNum, params.tier);
  return {
    questions: fallbackQuestions,
    source: 'syllabus-engine'
  };
}

/**
 * Client-side dynamic question generator with randomized seeds covering all 33 topics
 */
export function generateClientFallbackQuiz(topics: string[], count: number, tier: string = 'Extended'): QuizQuestion[] {
  const cleanTopics = topics.length > 0 ? topics : ALL_SYLLABUS_TOPICS.map(t => t.code);
  const uniqueSeed = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  return generateDynamicSyllabusQuestions(cleanTopics, count, tier, uniqueSeed);
}

function createQuestionTemplate(
  code: string,
  subject: ScienceSubject,
  title: string,
  index: number,
  seed: number
): QuizQuestion {
  const variant = (index + seed) % 4;
  const id = `q-${code.toLowerCase()}-${seed}-${index + 1}`;

  // Biology templates (B1 - B16)
  if (subject === 'biology') {
    if (code === 'B1') {
      const variants = [
        {
          question: 'Which of the following correctly defines "excretion" according to Cambridge IGCSE Biology?',
          options: [
            'The removal of toxic materials and the waste products of metabolism from organisms',
            'The passing out of food that has not been digested or absorbed as faeces',
            'The breakdown of glucose in cells to release energy for metabolic processes',
            'The permanent increase in size and dry mass by an increase in cell number'
          ],
          correctIndex: 0,
          explanation: 'Excretion is strictly defined as the removal of toxic waste products of metabolism and substances in excess. Removal of undigested faeces is egestion.'
        },
        {
          question: 'An organism moves its tentacles when touched by a foreign object. Which two MRS GREN characteristics are demonstrated?',
          options: [
            'Sensitivity and Movement',
            'Nutrition and Respiration',
            'Growth and Reproduction',
            'Excretion and Sensitivity'
          ],
          correctIndex: 0,
          explanation: 'Detecting the touch is sensitivity (response to environmental change), and moving the tentacles is movement (action causing change of position).'
        }
      ];
      const selected = variants[variant % variants.length];
      return { id, subject, topicCode: code, topicTitle: title, syllabusRef: 'B1.1', ...selected };
    }

    if (code === 'B2') {
      const variants = [
        {
          question: 'An image of a bacterial cell is measured with a ruler as 30 mm across. If the magnification is x6000, what is the actual width?',
          options: ['5 μm', '0.5 μm', '50 μm', '0.005 μm'],
          correctIndex: 0,
          explanation: 'Convert 30 mm into micrometres: 30 × 1000 = 30,000 μm. Actual size = Image ÷ Magnification = 30,000 ÷ 6,000 = 5 μm.'
        },
        {
          question: 'Which structure is present in plant cells and bacterial cells, but never in animal cells?',
          options: ['Cell wall', 'Mitochondria', 'Nucleus', 'Endoplasmic reticulum'],
          correctIndex: 0,
          explanation: 'Both plant and bacterial cells possess a cell wall (cellulose in plants, peptidoglycan in bacteria), whereas animal cells lack a cell wall.'
        }
      ];
      const selected = variants[variant % variants.length];
      return { id, subject, topicCode: code, topicTitle: title, syllabusRef: 'B2.1', ...selected };
    }

    if (code === 'B3') {
      const variants = [
        {
          question: 'Potato cylinders placed in a 1.0 mol/dm³ concentrated sucrose solution lose mass and become floppy. What explains this?',
          options: [
            'Water moved out of potato cells by osmosis down a water potential gradient',
            'Sugar entered the potato cells by active transport requiring ATP',
            'Water entered the potato cells causing them to become turgid',
            'Sucrose molecules diffused out through the cell membrane'
          ],
          correctIndex: 0,
          explanation: 'The potato cells have a higher water potential than the concentrated sucrose solution, so water moves out by osmosis, causing cells to become flaccid/plasmolysed.'
        },
        {
          question: 'Which process requires energy from respiration and carrier proteins in the cell membrane to move mineral ions against a concentration gradient?',
          options: ['Active transport', 'Osmosis', 'Diffusion', 'Transpiration'],
          correctIndex: 0,
          explanation: 'Active transport moves particles against their concentration gradient using energy from respiration and specific protein carriers.'
        }
      ];
      const selected = variants[variant % variants.length];
      return { id, subject, topicCode: code, topicTitle: title, syllabusRef: 'B3.1', ...selected };
    }

    if (code === 'B4') {
      const variants = [
        {
          question: 'Which reagent is used to test for reducing sugars and what colour change indicates a positive result upon heating?',
          options: [
            'Benedict’s solution; blue turns brick-red precipitate',
            'Biuret reagent; blue turns purple/lilac',
            'Iodine solution; brown turns blue-black',
            'Ethanol emulsion; colourless turns cloudy white'
          ],
          correctIndex: 0,
          explanation: 'Benedict’s solution heated in a water bath tests for reducing sugars (like glucose), changing from clear blue to green, yellow, orange, and finally brick-red.'
        },
        {
          question: 'A food sample shaken with ethanol and then poured into cold distilled water produces a milky-white emulsion. What nutrient is present?',
          options: ['Lipid / Fat', 'Protein', 'Starch', 'Vitamin C'],
          correctIndex: 0,
          explanation: 'Lipids dissolve in ethanol but are insoluble in water, forming a fine milky-white emulsion.'
        }
      ];
      const selected = variants[variant % variants.length];
      return { id, subject, topicCode: code, topicTitle: title, syllabusRef: 'B4.1', ...selected };
    }

    if (code === 'B5') {
      const variants = [
        {
          question: 'Why does an enzyme-catalysed reaction rate decrease to zero when the temperature is raised to 70 °C?',
          options: [
            'High kinetic energy disrupts active site tertiary shape so substrate can no longer bind (denatured)',
            'The substrate molecules run out of thermal energy to collide',
            'The enzyme molecules turn into substrate molecules',
            'The optimum pH shifts to strongly alkaline'
          ],
          correctIndex: 0,
          explanation: 'Excessive thermal energy breaks hydrogen and ionic bonds holding the enzyme in its 3D conformation, denaturing the active site.'
        },
        {
          question: 'Which statement accurately describes the "lock and key" hypothesis of enzyme action?',
          options: [
            'The substrate molecule is complementary in shape to the enzyme active site',
            'Any substrate can bind to any enzyme active site indiscriminately',
            'The enzyme permanently changes into product molecules',
            'The substrate locks the enzyme inside the cell membrane'
          ],
          correctIndex: 0,
          explanation: 'The substrate fits into the complementary shape of the enzyme active site like a key in a lock.'
        }
      ];
      const selected = variants[variant % variants.length];
      return { id, subject, topicCode: code, topicTitle: title, syllabusRef: 'B5.1', ...selected };
    }

    if (code === 'B6') {
      return {
        id, subject, topicCode: code, topicTitle: title, syllabusRef: 'B6.1',
        question: 'Which cells in a green dicotyledonous leaf contain the highest density of chloroplasts for photosynthesis?',
        options: ['Palisade mesophyll cells', 'Upper epidermal cells', 'Spongy mesophyll cells', 'Guard cells'],
        correctIndex: 0,
        explanation: 'Palisade mesophyll cells are situated directly below the upper transparent cuticle and are packed with chloroplasts to maximize light capture.'
      };
    }

    if (code === 'B7') {
      return {
        id, subject, topicCode: code, topicTitle: title, syllabusRef: 'B7.1',
        question: 'Where is bile produced, where is it stored, and what is its dual role in the digestive system?',
        options: [
          'Produced in liver, stored in gall bladder; neutralises stomach acid and emulsifies fats',
          'Produced in pancreas, stored in liver; digests proteins and starches',
          'Produced in gall bladder, stored in stomach; kills pathogens with hydrochloric acid',
          'Produced in small intestine, stored in colon; absorbs water and minerals'
        ],
        correctIndex: 0,
        explanation: 'Bile is synthesized by the liver, stored in the gall bladder, and empties into the duodenum where it neutralizes acidic chyme and breaks fat globules into microscopic droplets (emulsification).'
      };
    }

    if (code === 'B8') {
      return {
        id, subject, topicCode: code, topicTitle: title, syllabusRef: 'B8.1',
        question: 'Through which tissue and mechanism is water transported upwards from plant roots to leaves?',
        options: [
          'Xylem vessels by transpiration pull and cohesion of water molecules',
          'Phloem sieve tubes by active translocation requiring companion cells',
          'Root cortex cells by positive air pressure from stomata',
          'Epidermal cells by gravity drainage'
        ],
        correctIndex: 0,
        explanation: 'Transpiration evaporates water from leaf mesophyll cells, creating suction that pulls continuous columns of water up lignified xylem vessels.'
      };
    }

    if (code === 'B9') {
      return {
        id, subject, topicCode: code, topicTitle: title, syllabusRef: 'B9.1',
        question: 'Which heart chamber has the thickest muscular wall and why?',
        options: [
          'Left ventricle; needs to generate high pressure to pump oxygenated blood around the entire systemic body',
          'Right ventricle; needs to pump deoxygenated blood to the lungs',
          'Left atrium; receives blood from the pulmonary vein',
          'Right atrium; receives blood from the vena cava'
        ],
        correctIndex: 0,
        explanation: 'The left ventricle has much thicker myocardium than the right ventricle because it must pump blood through the high-resistance systemic circulation.'
      };
    }

    if (code === 'B10' || code === 'B11' || code === 'B12' || code === 'B13' || code === 'B14' || code === 'B15' || code === 'B16') {
      const bioTopicBank: Record<string, { q: string; opts: string[]; exp: string }> = {
        'B10': {
          q: 'Which component of the immune system produces specific Y-shaped antibodies that bind to pathogen antigens?',
          opts: ['Lymphocytes', 'Phagocytes', 'Platelets', 'Red blood cells'],
          exp: 'B-lymphocytes produce specific antibodies. Phagocytes engulf and digest pathogens by phagocytosis.'
        },
        'B11': {
          q: 'Which adaptation of alveoli provides the fastest rate of gas exchange in the human lungs?',
          opts: ['One-cell thick epithelium with extensive capillary network and moist lining', 'Thick cartilage rings preventing airway collapse', 'Ciliated epithelial cells producing sticky mucus', 'Strong smooth muscle contracting with each breath'],
          exp: 'Alveoli have a single layer of squamous epithelial cells and dense surrounding capillaries, minimizing diffusion distance.'
        },
        'B12': {
          q: 'What is the balanced chemical symbol equation for aerobic cellular respiration?',
          opts: ['C6H12O6 + 6O2 -> 6CO2 + 6H2O', '6CO2 + 6H2O -> C6H12O6 + 6O2', 'C6H12O6 -> 2C2H5OH + 2CO2', 'C6H12O6 -> 2C3H6O3'],
          exp: 'Aerobic respiration consumes glucose and oxygen to release cellular energy, yielding carbon dioxide and water.'
        },
        'B13': {
          q: 'In a spinal reflex arc, what is the correct order of components following a painful stimulus?',
          opts: ['Receptor -> Sensory neurone -> Relay neurone -> Motor neurone -> Effector', 'Receptor -> Motor neurone -> Relay neurone -> Sensory neurone -> Brain', 'Effector -> Sensory neurone -> Relay neurone -> Motor neurone -> Receptor', 'Receptor -> Brain -> Sensory neurone -> Effector'],
          exp: 'A reflex arc bypasses conscious brain processing: Receptor -> Sensory neurone -> Relay neurone in spinal cord -> Motor neurone -> Effector muscle.'
        },
        'B14': {
          q: 'On which day of a typical 28-day human menstrual cycle does ovulation usually occur?',
          opts: ['Day 14', 'Day 1', 'Day 7', 'Day 28'],
          exp: 'A surge in Luteinising Hormone (LH) triggers release of an egg cell (ovulation) on approximately day 14.'
        },
        'B15': {
          q: 'Two heterozygous (Bb) brown-eyed parents have a child. Brown (B) is dominant to blue (b). What is the probability of having a blue-eyed child?',
          opts: ['25% (1 in 4)', '50% (1 in 2)', '75% (3 in 4)', '0% (none)'],
          exp: 'A cross of Bb × Bb yields genotypes 1 BB : 2 Bb : 1 bb. Only the homozygous recessive (bb) has blue eyes (1/4 = 25%).'
        },
        'B16': {
          q: 'Approximately what percentage of energy is transferred from one trophic level to the next in a food chain?',
          opts: ['10%', '50%', '90%', '100%'],
          exp: 'Roughly 90% of energy is lost as heat, movement, and undigested waste; only about 10% is incorporated into new biomass.'
        }
      };
      const cur = bioTopicBank[code] || bioTopicBank['B10'];
      return { id, subject, topicCode: code, topicTitle: title, syllabusRef: `${code}.1`, question: cur.q, options: cur.opts, correctIndex: 0, explanation: cur.exp };
    }
  }

  // Chemistry templates
  if (subject === 'chemistry') {
    if (code === 'C1' || code === 'C2') {
      const variants = [
        {
          question: 'An atom of an element has an atomic number of 11 and a mass number of 23. What is the number of neutrons and its electron configuration?',
          options: [
            '12 neutrons, electron configuration 2,8,1',
            '11 neutrons, electron configuration 2,8,2',
            '23 neutrons, electron configuration 2,8,1',
            '12 neutrons, electron configuration 2,8,3'
          ],
          correctIndex: 0,
          explanation: 'Neutrons = Mass number - Atomic number = 23 - 11 = 12. Atomic number 11 corresponds to Sodium with 11 electrons arranged as 2, 8, 1.'
        },
        {
          question: 'Why do simple molecular covalent substances (like methane CH4 and water H2O) have low melting and boiling points?',
          options: [
            'Weak intermolecular forces between molecules require little energy to break',
            'The covalent bonds inside the molecules are very weak',
            'They contain free mobile electrons that escape easily',
            'Their giant lattice of positive and negative ions breaks down'
          ],
          correctIndex: 0,
          explanation: 'Covalent bonds inside the molecule are strong, but weak intermolecular forces between molecules require very little thermal energy to overcome.'
        },
        {
          question: 'Which statement accurately describes an ionic compound such as sodium chloride (NaCl)?',
          options: [
            'High melting point, conducts electricity only when molten or dissolved in water',
            'Low boiling point, conducts electricity in both solid and liquid states',
            'High melting point, never conducts electricity under any conditions',
            'Low melting point, insoluble in water and non-conducting'
          ],
          correctIndex: 0,
          explanation: 'Ionic compounds have giant ionic lattices with strong electrostatic attractions. Ions are fixed in solid state, but become mobile and conduct when molten or aqueous.'
        },
        {
          question: 'What happens to the arrangement and movement of gas particles when cooled to form a liquid?',
          options: [
            'Particles move closer together and transition from random fast motion to sliding over each other',
            'Particles move further apart and vibrate about fixed positions',
            'Particles lose all kinetic energy and cease movement completely',
            'Particles expand in size and form a rigid hexagonal lattice'
          ],
          correctIndex: 0,
          explanation: 'Condensation brings gas particles closer together into an irregular liquid arrangement where particles can slide past one another.'
        }
      ];
      const selected = variants[variant % variants.length];
      return { id, subject, topicCode: code, topicTitle: title, syllabusRef: 'C2.1', ...selected };
    }

    if (code === 'C4') {
      const variants = [
        {
          question: 'During the electrolysis of concentrated aqueous sodium chloride (brine), which products are formed at the anode and cathode?',
          options: [
            'Anode (+): Chlorine gas; Cathode (-): Hydrogen gas',
            'Anode (+): Oxygen gas; Cathode (-): Sodium metal',
            'Anode (+): Hydrogen gas; Cathode (-): Chlorine gas',
            'Anode (+): Sodium metal; Cathode (-): Hydroxide gas'
          ],
          correctIndex: 0,
          explanation: 'In concentrated NaCl(aq), chloride ions are discharged at the anode to form Cl2. At the cathode, H+ is discharged rather than Na+ because hydrogen is less reactive, forming H2.'
        },
        {
          question: 'Molten lead(II) bromide (PbBr2) is electrolysed using inert carbon electrodes. What is observed at each electrode?',
          options: [
            'Cathode: Silvery-grey bead of molten lead; Anode: Red-brown pungent fumes of bromine gas',
            'Cathode: Brown gas bubbles; Anode: Grey lead deposit',
            'Cathode: Hydrogen gas; Anode: Oxygen gas',
            'Cathode: Yellow sulfur; Anode: Colorless gas'
          ],
          correctIndex: 0,
          explanation: 'Pb2+ ions gain electrons at the negative cathode to produce molten lead metal (grey). Br- ions lose electrons at the positive anode to produce brown bromine gas (Br2).'
        },
        {
          question: 'What is the electrolyte in the industrial extraction of aluminium metal by Hall-Héroult electrolysis?',
          options: [
            'Alumina (Al2O3) dissolved in molten cryolite',
            'Concentrated aqueous aluminium chloride solution',
            'Solid bauxite rock heated with carbon monoxide',
            'Molten lead aluminate'
          ],
          correctIndex: 0,
          explanation: 'Alumina has a very high melting point (~2070°C). Dissolving it in molten cryolite lowers the operating temperature to ~950°C and increases conductivity.'
        },
        {
          question: 'Why do carbon anodes need to be replaced periodically during the industrial electrolysis of aluminium oxide?',
          options: [
            'Oxygen gas produced at the anode reacts with the hot carbon electrodes to form carbon dioxide gas',
            'Molten aluminium dissolves the carbon anodes directly',
            'The carbon anodes melt into the cryolite electrolyte',
            'Carbon reacts with cryolite to form toxic chlorine'
          ],
          correctIndex: 0,
          explanation: 'The oxygen gas discharged at the anode reacts with the graphite (carbon) anodes at 950°C: C + O2 -> CO2, gradually burning away the anodes.'
        }
      ];
      const selected = variants[variant % variants.length];
      return { id, subject, topicCode: code, topicTitle: title, syllabusRef: 'C4.1', ...selected };
    }

    if (code === 'C3' || code === 'C5' || code === 'C6' || code === 'C7' || code === 'C8' || code === 'C9' || code === 'C10' || code === 'C11' || code === 'C12') {
      const chemBank: Record<string, { q: string; opts: string[]; exp: string }> = {
        'C3': {
          q: 'What is the correct balanced equation for the reaction of magnesium with hydrochloric acid?',
          opts: ['Mg + 2HCl -> MgCl2 + H2', 'Mg + HCl -> MgCl + H', '2Mg + 2HCl -> 2MgCl + H2', 'Mg + 2HCl -> MgCl + H2O'],
          exp: 'Magnesium has a valency of 2 (Mg2+), forming magnesium chloride (MgCl2) and releasing hydrogen gas (H2).'
        },
        'C5': {
          q: 'Which statement accurately describes an exothermic chemical reaction?',
          opts: [
            'Energy released during bond formation is greater than energy absorbed to break bonds, so temperature increases',
            'Energy absorbed to break bonds is greater than energy released forming bonds, so temperature falls',
            'No bonds are broken or formed during the reaction',
            'The activation energy is zero and heat is absorbed from surroundings'
          ],
          exp: 'Exothermic reactions have negative ΔH: bond making (exothermic) releases more energy than bond breaking (endothermic) requires.'
        },
        'C6': {
          q: 'Why does increasing the concentration of an aqueous reactant increase the rate of reaction?',
          opts: [
            'More particles per unit volume lead to more frequent collisions between reacting particles',
            'Particles gain higher individual kinetic energy and move faster',
            'The activation energy of the reaction is lowered',
            'The orientation of molecules becomes aligned automatically'
          ],
          exp: 'Higher concentration increases particle density, which increases the frequency of collisions per unit time.'
        },
        'C7': {
          q: 'Which pair of reagents and method should be used to prepare a pure, dry sample of copper(II) sulfate crystals?',
          opts: [
            'Add excess copper(II) oxide to warm dilute sulfuric acid, filter out unreacted oxide, and crystallise filtrate',
            'Titrate copper metal with concentrated sulfuric acid using methyl orange indicator',
            'Mix aqueous copper chloride and sodium sulfate and collect the precipitate',
            'Burn copper wire in sulfur dioxide gas and dissolve in water'
          ],
          exp: 'Copper is unreactive with dilute acid, so the insoluble base method (excess CuO + H2SO4, filter, evaporate to crystallisation point) is required.'
        },
        'C8': {
          q: 'What trend is observed as you descend Group 1 (the alkali metals) in the Periodic Table?',
          opts: [
            'Reactivity increases and melting point decreases',
            'Reactivity decreases and melting point increases',
            'Density decreases and reactivity decreases',
            'Number of outer valence electrons increases'
          ],
          exp: 'Descending Group 1: atoms get larger, outer electron is further from nucleus and more shielded, so it is lost more easily (reactivity increases), while metallic bonding weakens (melting point decreases).'
        },
        'C9': {
          q: 'What is the main reducing agent responsible for converting hematite (Fe2O3) to molten iron in the blast furnace?',
          opts: ['Carbon monoxide (CO)', 'Limestone (CaCO3)', 'Carbon dioxide (CO2)', 'Slag (CaSiO3)'],
          exp: 'Coke reacts with oxygen to form CO2, which reacts with more coke to produce carbon monoxide (CO), the primary gaseous reducing agent: Fe2O3 + 3CO -> 2Fe + 3CO2.'
        },
        'C10': {
          q: 'Which chemical test confirms the presence of pure water without other dissolved substances?',
          opts: [
            'Boils at exactly 100 °C and freezes at 0 °C at 1 atmosphere pressure',
            'Turns anhydrous copper(II) sulfate from white to blue',
            'Turns cobalt(II) chloride paper from blue to pink',
            'Has a neutral pH of 7 with universal indicator'
          ],
          exp: 'Anhydrous CuSO4 or CoCl2 paper tests for the presence of water, but sharp boiling point at 100 °C and freezing at 0 °C confirms purity.'
        },
        'C11': {
          q: 'What colour change is observed when an alkene (such as ethene C2H4) is bubbled through aqueous bromine water?',
          opts: [
            'Orange/brown turns colourless (decolourises)',
            'Colourless turns deep purple',
            'Pale yellow turns dark blue',
            'No colour change occurs'
          ],
          exp: 'Alkenes contain a reactive C=C double bond that undergoes addition reaction with bromine water, turning it from orange-brown to colourless.'
        },
        'C12': {
          q: 'In qualitative analysis, which gas turns damp red litmus paper blue and produces dense white fumes with concentrated HCl?',
          opts: ['Ammonia (NH3)', 'Chlorine (Cl2)', 'Carbon dioxide (CO2)', 'Hydrogen (H2)'],
          exp: 'Ammonia is the only common alkaline gas; it turns red litmus blue and reacts with HCl gas to form ammonium chloride smoke.'
        }
      };
      const cur = chemBank[code] || chemBank['C3'];
      return { id, subject, topicCode: code, topicTitle: title, syllabusRef: `${code}.1`, question: cur.q, options: cur.opts, correctIndex: 0, explanation: cur.exp };
    }
  }

  // Physics templates
  if (subject === 'physics') {
    if (code === 'P1') {
      const variants = [
        {
          question: 'A car accelerates uniformly from rest to a speed of 24 m/s in a time of 8 seconds. What is the acceleration and the total distance travelled?',
          options: [
            'Acceleration = 3.0 m/s², Distance = 96 m',
            'Acceleration = 3.0 m/s², Distance = 192 m',
            'Acceleration = 0.33 m/s², Distance = 96 m',
            'Acceleration = 2.0 m/s², Distance = 48 m'
          ],
          correctIndex: 0,
          explanation: 'Acceleration a = (v - u) / t = (24 - 0) / 8 = 3.0 m/s². Area under speed-time triangle = 0.5 × base × height = 0.5 × 8 × 24 = 96 m.'
        },
        {
          question: 'On Earth, a rock has a mass of 5.0 kg. What is its weight on Earth (where g = 9.8 N/kg) and what would its mass be on the Moon?',
          options: [
            'Weight on Earth = 49 N, Mass on Moon = 5.0 kg',
            'Weight on Earth = 50 N, Mass on Moon = 0.83 kg',
            'Weight on Earth = 5.0 N, Mass on Moon = 49 kg',
            'Weight on Earth = 49 kg, Mass on Moon = 5.0 N'
          ],
          correctIndex: 0,
          explanation: 'Weight W = m × g = 5.0 kg × 9.8 N/kg = 49 N. Mass is the amount of matter in an object and remains constant (5.0 kg) anywhere in the universe.'
        }
      ];
      const selected = variants[variant % variants.length];
      return { id, subject, topicCode: code, topicTitle: title, syllabusRef: 'P1.2', ...selected };
    }

    if (code === 'P2') {
      return {
        id, subject, topicCode: code, topicTitle: title, syllabusRef: 'P2.1',
        question: 'Why are metals significantly better thermal conductors than non-metals and insulators?',
        options: [
          'Metals possess free delocalised electrons that rapidly transfer kinetic energy through the lattice',
          'Metal atoms expand into liquids when heated',
          'Metals radiate more infrared energy than non-metals',
          'Metals have lower density so heat rises through convection'
        ],
        correctIndex: 0,
        explanation: 'In metals, delocalised valence electrons collide with ions and carry thermal energy quickly throughout the solid structure alongside lattice vibrations.'
      };
    }

    if (code === 'P3') {
      const variants = [
        {
          question: 'A sound wave travels through air at 330 m/s with a frequency of 660 Hz. What is its wavelength?',
          options: ['0.50 m', '2.0 m', '217,800 m', '0.0015 m'],
          correctIndex: 0,
          explanation: 'Wave speed v = f × λ. Therefore λ = v ÷ f = 330 ÷ 660 = 0.50 m.'
        },
        {
          question: 'Which electromagnetic radiation has the highest frequency and shortest wavelength in the EM spectrum?',
          options: ['Gamma rays', 'Radio waves', 'Microwaves', 'Visible violet light'],
          correctIndex: 0,
          explanation: 'In the EM spectrum (Radio, Micro, Infrared, Visible, UV, X-ray, Gamma), Gamma rays have the highest frequency and energy.'
        }
      ];
      const selected = variants[variant % variants.length];
      return { id, subject, topicCode: code, topicTitle: title, syllabusRef: 'P3.1', ...selected };
    }

    if (code === 'P4') {
      const variants = [
        {
          question: 'Two resistors of resistance 6.0 Ω and 12.0 Ω are connected in parallel across a 12 V power supply. What is the total circuit resistance and total current drawn?',
          options: [
            'Total Resistance = 4.0 Ω, Total Current = 3.0 A',
            'Total Resistance = 18.0 Ω, Total Current = 0.67 A',
            'Total Resistance = 8.0 Ω, Total Current = 1.5 A',
            'Total Resistance = 2.0 Ω, Total Current = 6.0 A'
          ],
          correctIndex: 0,
          explanation: 'Parallel formula: 1/R = 1/6 + 1/12 = 2/12 + 1/12 = 3/12 = 1/4 -> R = 4.0 Ω. Current I = V / R = 12 / 4.0 = 3.0 A.'
        },
        {
          question: 'An electric heater operating at 230 V draws a current of 8.0 A. What is the electrical power and the energy transferred in 10 minutes?',
          options: [
            'Power = 1840 W, Energy = 1,104,000 J',
            'Power = 1840 W, Energy = 18,400 J',
            'Power = 28.75 W, Energy = 17,250 J',
            'Power = 184 W, Energy = 110,400 J'
          ],
          correctIndex: 0,
          explanation: 'Power P = V × I = 230 × 8.0 = 1840 W. Time in seconds = 10 × 60 = 600 s. Energy E = P × t = 1840 × 600 = 1,104,000 J (or 1.104 MJ).'
        }
      ];
      const selected = variants[variant % variants.length];
      return { id, subject, topicCode: code, topicTitle: title, syllabusRef: 'P4.2', ...selected };
    }

    if (code === 'P5') {
      return {
        id, subject, topicCode: code, topicTitle: title, syllabusRef: 'P5.1',
        question: 'Which process powers the Sun and releases vast amounts of energy in stellar cores?',
        options: [
          'Nuclear fusion of hydrogen nuclei into helium nuclei under extreme temperature and pressure',
          'Nuclear fission of uranium atoms splitting into smaller daughter nuclei',
          'Exothermic combustion of hydrogen gas reacting with oxygen',
          'Gravitational collapse with friction between solar dust'
        ],
        correctIndex: 0,
        explanation: 'In the core of main sequence stars like the Sun, hydrogen nuclei fuse together into helium at millions of kelvins, releasing energy according to E=mc².'
      };
    }
  }

  // Generic dynamic question matching topic
  return {
    id,
    subject,
    topicCode: code,
    topicTitle: title,
    syllabusRef: `${code}.1`,
    question: `Which statement represents a core scientific principle in Cambridge IGCSE 0653 topic "${title}"?`,
    options: [
      `Key concept in ${title}: specific experimental observation and verified syllabus law.`,
      `Distractor claiming incorrect energy conversion in ${title}.`,
      `Common misconception confusing terminology in ${title}.`,
      `Alternative incorrect unit or direction of transfer in ${title}.`
    ],
    correctIndex: 0,
    explanation: `According to Cambridge IGCSE Combined Science 0653 ${code}, understanding ${title} requires distinguishing scientific principles from common misconceptions.`
  };
}

function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Cambridge IGCSE 0653 Grade boundary estimator for MCQs
 */
export function estimateCambridgeGrade(score: number, total: number): {
  grade: 'A*' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'U';
  percentage: number;
  feedback: string;
} {
  const pct = Math.round((score / Math.max(1, total)) * 100);

  if (pct >= 85) {
    return { grade: 'A*', percentage: pct, feedback: 'Exceptional mastery! Ready for top marks in Cambridge Paper 1 & 2.' };
  } else if (pct >= 75) {
    return { grade: 'A', percentage: pct, feedback: 'Excellent performance! High command across key syllabus topics.' };
  } else if (pct >= 65) {
    return { grade: 'B', percentage: pct, feedback: 'Strong pass! A few minor misconceptions to review.' };
  } else if (pct >= 55) {
    return { grade: 'C', percentage: pct, feedback: 'Solid Core benchmark achieved. Focus on Extended details.' };
  } else if (pct >= 45) {
    return { grade: 'D', percentage: pct, feedback: 'Approaching standard. Review weak topics using lesson slides.' };
  } else if (pct >= 35) {
    return { grade: 'E', percentage: pct, feedback: 'Needs reinforcement in foundational equations and definitions.' };
  } else {
    return { grade: 'U', percentage: pct, feedback: 'Significant revision required. Ask AI Tutor for step-by-step guidance.' };
  }
}
