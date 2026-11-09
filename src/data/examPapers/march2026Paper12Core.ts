import { PastExamPaper } from '../../types';

export const march2026Paper12Core: PastExamPaper = {
  id: 'paper-0653-12-m26-core',
  code: '0653/12',
  title: 'Paper 1 Multiple Choice (Core) - March 2026',
  series: 'March 2026',
  paperNumber: 'Paper 1',
  tier: 'Core',
  duration: '45 minutes',
  totalMarks: 40,
  paperType: 'multiple-choice',
  description: 'Authentic Cambridge IGCSE Combined Science 0653/12 Core Multiple Choice examination drawn from the official March 2026 examination series. 40 questions covering fundamental concepts across Biology (Q1–13), Chemistry (Q14–26), and Physics (Q27–40).',
  examinerNotes: [
    'Each item has four options (A, B, C, D). Choose the one you consider correct and record your choice.',
    'Calculators may be used on this paper.',
    'A copy of the Periodic Table is provided as standard on the back cover of the question paper.'
  ],
  gradeBoundaries: {
    c: 28,
    d: 23,
    e: 19,
    f: 15,
    g: 11
  },
  questions: [
    // BIOLOGY (Q1 - Q13)
    {
      id: 'm26-12-q1',
      number: 1,
      questionText: 'Which process is carried out by all living organisms to release energy from food substances?',
      options: [
        { key: 'A', text: 'excretion' },
        { key: 'B', text: 'nutrition' },
        { key: 'C', text: 'respiration' },
        { key: 'D', text: 'sensitivity' }
      ],
      correctAnswer: 'C',
      marks: 1,
      explanation: 'Respiration is the chemical reaction in all cells that breaks down nutrient molecules (such as glucose) to release energy for metabolic processes.',
      subject: 'biology',
      syllabusCode: 'B1.1',
      questionType: 'mcq'
    },
    {
      id: 'm26-12-q2',
      number: 2,
      questionText: 'Which cell structure is present in plant cells but absent in animal cells?',
      options: [
        { key: 'A', text: 'cell membrane' },
        { key: 'B', text: 'cellulose cell wall' },
        { key: 'C', text: 'cytoplasm' },
        { key: 'D', text: 'nucleus' }
      ],
      correctAnswer: 'B',
      marks: 1,
      explanation: 'Plant cells have an outer rigid cellulose cell wall that maintains cell shape and prevents lysis. Animal cells do not possess cell walls.',
      subject: 'biology',
      syllabusCode: 'B2.1',
      questionType: 'mcq'
    },
    {
      id: 'm26-12-q3',
      number: 3,
      questionText: 'How does oxygen move from an area of high concentration in the lungs into the blood where its concentration is lower?',
      options: [
        { key: 'A', text: 'active transport' },
        { key: 'B', text: 'diffusion' },
        { key: 'C', text: 'osmosis' },
        { key: 'D', text: 'transpiration' }
      ],
      correctAnswer: 'B',
      marks: 1,
      explanation: 'Diffusion is the net movement of particles from a region of higher concentration to a region of lower concentration down a concentration gradient.',
      subject: 'biology',
      syllabusCode: 'B3.1',
      questionType: 'mcq'
    },
    {
      id: 'm26-12-q4',
      number: 4,
      questionText: 'Which reagent is used to test for the presence of starch in a leaf, and what is the positive colour change?',
      options: [
        { key: 'A', text: 'Benedict’s solution; blue to brick-red' },
        { key: 'B', text: 'Biuret solution; blue to purple' },
        { key: 'C', text: 'Ethanol; colourless to white emulsion' },
        { key: 'D', text: 'Iodine solution; brown to blue-black' }
      ],
      correctAnswer: 'D',
      marks: 1,
      explanation: 'Iodine solution turns from yellow-brown to blue-black in the presence of starch.',
      subject: 'biology',
      syllabusCode: 'B4.1',
      questionType: 'mcq'
    },
    {
      id: 'm26-12-q5',
      number: 5,
      questionText: 'What term describes an enzyme whose active site has permanently lost its shape due to excessively high temperature?',
      options: [
        { key: 'A', text: 'denatured' },
        { key: 'B', text: 'digested' },
        { key: 'C', text: 'fermented' },
        { key: 'D', text: 'neutralised' }
      ],
      correctAnswer: 'A',
      marks: 1,
      explanation: 'At high temperatures, the thermal vibration disrupts hydrogen and ionic bonds stabilizing the enzyme protein, denaturing the active site so substrates can no longer bind.',
      subject: 'biology',
      syllabusCode: 'B5.1',
      questionType: 'mcq'
    },
    {
      id: 'm26-12-q6',
      number: 6,
      questionText: 'What are the two raw materials needed for photosynthesis in green plants?',
      options: [
        { key: 'A', text: 'carbon dioxide and glucose' },
        { key: 'B', text: 'carbon dioxide and water' },
        { key: 'C', text: 'oxygen and glucose' },
        { key: 'D', text: 'oxygen and water' }
      ],
      correctAnswer: 'B',
      marks: 1,
      explanation: 'Photosynthesis equation: 6CO2 + 6H2O → C6H12O6 + 6O2. Plants require carbon dioxide and water in the presence of light and chlorophyll.',
      subject: 'biology',
      syllabusCode: 'B6.1',
      questionType: 'mcq'
    },
    {
      id: 'm26-12-q7',
      number: 7,
      questionText: 'Which dietary component is essential in small amounts to prevent scurvy?',
      options: [
        { key: 'A', text: 'calcium' },
        { key: 'B', text: 'iron' },
        { key: 'C', text: 'vitamin C' },
        { key: 'D', text: 'vitamin D' }
      ],
      correctAnswer: 'C',
      marks: 1,
      explanation: 'Vitamin C is required for collagen synthesis and tissue repair; deficiency leads to scurvy (bleeding gums and poor wound healing).',
      subject: 'biology',
      syllabusCode: 'B7.1',
      questionType: 'mcq'
    },
    {
      id: 'm26-12-q8',
      number: 8,
      questionText: 'Through which plant tissue is water and dissolved mineral ions transported from roots to leaves?',
      options: [
        { key: 'A', text: 'cortex' },
        { key: 'B', text: 'epidermis' },
        { key: 'C', text: 'phloem' },
        { key: 'D', text: 'xylem' }
      ],
      correctAnswer: 'D',
      marks: 1,
      explanation: 'Xylem vessels are hollow, lignified tubes that conduct water and dissolved minerals upwards via the transpiration stream.',
      subject: 'biology',
      syllabusCode: 'B8.1',
      questionType: 'mcq'
    },
    {
      id: 'm26-12-q9',
      number: 9,
      questionText: 'Which chamber of the human heart has the thickest muscular wall to pump blood to the entire body?',
      options: [
        { key: 'A', text: 'left atrium' },
        { key: 'B', text: 'left ventricle' },
        { key: 'C', text: 'right atrium' },
        { key: 'D', text: 'right ventricle' }
      ],
      correctAnswer: 'B',
      marks: 1,
      explanation: 'The left ventricle has the thickest muscular myocardium because it must generate high pressure to pump oxygenated blood through the aorta around the systemic circulation.',
      subject: 'biology',
      syllabusCode: 'B9.2',
      questionType: 'mcq'
    },
    {
      id: 'm26-12-q10',
      number: 10,
      questionText: 'Which blood vessels carry oxygenated blood back from the lungs into the left atrium of the heart?',
      options: [
        { key: 'A', text: 'aorta' },
        { key: 'B', text: 'pulmonary artery' },
        { key: 'C', text: 'pulmonary vein' },
        { key: 'D', text: 'vena cava' }
      ],
      correctAnswer: 'C',
      marks: 1,
      explanation: 'The pulmonary veins carry oxygen-rich blood from the lungs to the left atrium of the heart.',
      subject: 'biology',
      syllabusCode: 'B9.3',
      questionType: 'mcq'
    },
    {
      id: 'm26-12-q11',
      number: 11,
      questionText: 'What gas is produced during vigorous anaerobic respiration in human muscle cells that causes muscle fatigue?',
      options: [
        { key: 'A', text: 'carbon dioxide' },
        { key: 'B', text: 'lactic acid (lactate)' },
        { key: 'C', text: 'methane' },
        { key: 'D', text: 'oxygen' }
      ],
      correctAnswer: 'B',
      marks: 1,
      explanation: 'In human muscles, anaerobic respiration breaks down glucose without oxygen: glucose → lactic acid. Lactic acid builds up, causing fatigue and an oxygen debt.',
      subject: 'biology',
      syllabusCode: 'B12.1',
      questionType: 'mcq'
    },
    {
      id: 'm26-12-q12',
      number: 12,
      questionText: 'What is the correct sequence of structures in a human reflex arc?',
      options: [
        { key: 'A', text: 'receptor → relay neurone → sensory neurone → motor neurone → effector' },
        { key: 'B', text: 'receptor → sensory neurone → relay neurone → motor neurone → effector' },
        { key: 'C', text: 'effector → motor neurone → relay neurone → sensory neurone → receptor' },
        { key: 'D', text: 'receptor → motor neurone → relay neurone → sensory neurone → effector' }
      ],
      correctAnswer: 'B',
      marks: 1,
      explanation: 'Reflex path: Stimulus is detected by Receptor → Sensory neurone → Relay neurone in spinal cord → Motor neurone → Effector (muscle or gland).',
      subject: 'biology',
      syllabusCode: 'B13.1',
      questionType: 'mcq'
    },
    {
      id: 'm26-12-q13',
      number: 13,
      questionText: 'In a food chain, what name is given to green plants that produce biomass using sunlight?',
      options: [
        { key: 'A', text: 'decomposers' },
        { key: 'B', text: 'primary consumers' },
        { key: 'C', text: 'producers' },
        { key: 'D', text: 'secondary consumers' }
      ],
      correctAnswer: 'C',
      marks: 1,
      explanation: 'Producers (autotrophs) synthesize organic nutrients from inorganic compounds using solar energy via photosynthesis.',
      subject: 'biology',
      syllabusCode: 'B15.1',
      questionType: 'mcq'
    },

    // CHEMISTRY (Q14 - Q26)
    {
      id: 'm26-12-q14',
      number: 14,
      questionText: 'Which physical state has a definite fixed volume but takes the shape of its container?',
      options: [
        { key: 'A', text: 'gas only' },
        { key: 'B', text: 'liquid only' },
        { key: 'C', text: 'solid only' },
        { key: 'D', text: 'liquid and gas' }
      ],
      correctAnswer: 'B',
      marks: 1,
      explanation: 'Liquids have close particles that can slide over one another, allowing them to flow and take the shape of the container while maintaining a constant volume.',
      subject: 'chemistry',
      syllabusCode: 'C1.1',
      questionType: 'mcq'
    },
    {
      id: 'm26-12-q15',
      number: 15,
      questionText: 'What is the relative electrical charge and relative mass of a neutron?',
      options: [
        { key: 'A', text: 'charge = 0, mass = 1' },
        { key: 'B', text: 'charge = +1, mass = 1' },
        { key: 'C', text: 'charge = -1, mass = 1/1840' },
        { key: 'D', text: 'charge = 0, mass = 0' }
      ],
      correctAnswer: 'A',
      marks: 1,
      explanation: 'Neutrons are neutral subatomic particles (charge = 0) with a relative mass of 1 located in the atomic nucleus.',
      subject: 'chemistry',
      syllabusCode: 'C2.2',
      questionType: 'mcq'
    },
    {
      id: 'm26-12-q16',
      number: 16,
      questionText: 'An atom has 11 protons and 12 neutrons. What is its nucleon (mass) number?',
      options: [
        { key: 'A', text: '1' },
        { key: 'B', text: '11' },
        { key: 'C', text: '12' },
        { key: 'D', text: '23' }
      ],
      correctAnswer: 'D',
      marks: 1,
      explanation: 'Nucleon number (mass number A) = protons + neutrons = 11 + 12 = 23 (sodium-23).',
      subject: 'chemistry',
      syllabusCode: 'C2.2',
      questionType: 'mcq'
    },
    {
      id: 'm26-12-q17',
      number: 17,
      questionText: 'Which type of chemical bonding involves the transfer of electrons from a metal atom to a non-metal atom?',
      options: [
        { key: 'A', text: 'covalent bonding' },
        { key: 'B', text: 'ionic bonding' },
        { key: 'C', text: 'metallic bonding' },
        { key: 'D', text: 'intermolecular bonding' }
      ],
      correctAnswer: 'B',
      marks: 1,
      explanation: 'Ionic bonding occurs when metal atoms lose electrons to form positive cations, and non-metal atoms gain electrons to form negative anions, resulting in electrostatic attraction.',
      subject: 'chemistry',
      syllabusCode: 'C2.3',
      questionType: 'mcq'
    },
    {
      id: 'm26-12-q18',
      number: 18,
      questionText: 'What is the correct chemical formula for calcium chloride?',
      options: [
        { key: 'A', text: 'CaCl' },
        { key: 'B', text: 'CaCl2' },
        { key: 'C', text: 'Ca2Cl' },
        { key: 'D', text: 'Ca2Cl3' }
      ],
      correctAnswer: 'B',
      marks: 1,
      explanation: 'Calcium forms Ca²⁺ ions and chlorine forms Cl⁻ ions. Two Cl⁻ ions are needed to balance one Ca²⁺ ion, giving CaCl2.',
      subject: 'chemistry',
      syllabusCode: 'C3.1',
      questionType: 'mcq'
    },
    {
      id: 'm26-12-q19',
      number: 19,
      questionText: 'During the electrolysis of molten lead(II) bromide using inert graphite electrodes, what substance is formed at the cathode?',
      options: [
        { key: 'A', text: 'bromine gas' },
        { key: 'B', text: 'hydrogen gas' },
        { key: 'C', text: 'lead metal' },
        { key: 'D', text: 'oxygen gas' }
      ],
      correctAnswer: 'C',
      marks: 1,
      explanation: 'The cathode is the negative electrode. Positive lead ions (Pb²⁺) gain electrons (reduction) at the cathode to form silvery molten lead metal: Pb²⁺ + 2e⁻ → Pb.',
      subject: 'chemistry',
      syllabusCode: 'C4.1',
      questionType: 'mcq'
    },
    {
      id: 'm26-12-q20',
      number: 20,
      questionText: 'Which statement is true for all exothermic chemical reactions?',
      options: [
        { key: 'A', text: 'Thermal energy is taken in from the surroundings, causing temperature to decrease' },
        { key: 'B', text: 'Thermal energy is released to the surroundings, causing temperature to increase' },
        { key: 'C', text: 'The products have higher chemical energy than the reactants' },
        { key: 'D', text: 'No change in temperature occurs' }
      ],
      correctAnswer: 'B',
      marks: 1,
      explanation: 'Exothermic reactions transfer thermal energy to the surroundings, leading to an increase in the temperature of the surroundings.',
      subject: 'chemistry',
      syllabusCode: 'C5.1',
      questionType: 'mcq'
    },
    {
      id: 'm26-12-q21',
      number: 21,
      questionText: 'Which change will increase the rate of reaction between marble chips (calcium carbonate) and dilute hydrochloric acid?',
      options: [
        { key: 'A', text: 'decreasing the acid concentration' },
        { key: 'B', text: 'decreasing the temperature' },
        { key: 'C', text: 'using large marble lumps instead of powdered marble' },
        { key: 'D', text: 'using powdered marble instead of large marble lumps' }
      ],
      correctAnswer: 'D',
      marks: 1,
      explanation: 'Powdering the solid increases its total surface area, exposing more particles to collide with acid ions per unit time, thereby increasing collision frequency and reaction rate.',
      subject: 'chemistry',
      syllabusCode: 'C6.2',
      questionType: 'mcq'
    },
    {
      id: 'm26-12-q22',
      number: 22,
      questionText: 'What is the pH value of a neutral aqueous solution at 25 °C?',
      options: [
        { key: 'A', text: '1' },
        { key: 'B', text: '7' },
        { key: 'C', text: '10' },
        { key: 'D', text: '14' }
      ],
      correctAnswer: 'B',
      marks: 1,
      explanation: 'The pH scale runs from 0 to 14. A pH of 7 indicates neutrality (equal concentrations of H⁺ and OH⁻ ions).',
      subject: 'chemistry',
      syllabusCode: 'C7.1',
      questionType: 'mcq'
    },
    {
      id: 'm26-12-q23',
      number: 23,
      questionText: 'What happens to the reactivity of Group 1 alkali metals (lithium, sodium, potassium) as you go down the group?',
      options: [
        { key: 'A', text: 'reactivity decreases' },
        { key: 'B', text: 'reactivity increases' },
        { key: 'C', text: 'reactivity stays the same' },
        { key: 'D', text: 'they become non-reactive gases' }
      ],
      correctAnswer: 'B',
      marks: 1,
      explanation: 'Down Group 1, atomic radius increases and the single outer electron is shielded by more electron shells, so it is lost more easily, increasing reactivity.',
      subject: 'chemistry',
      syllabusCode: 'C8.2',
      questionType: 'mcq'
    },
    {
      id: 'm26-12-q24',
      number: 24,
      questionText: 'Why is aluminium used for manufacturing aircraft bodies?',
      options: [
        { key: 'A', text: 'high density and low melting point' },
        { key: 'B', text: 'low density and resistance to corrosion' },
        { key: 'C', text: 'magnetic properties and brittleness' },
        { key: 'D', text: 'yellow colour and high electrical resistance' }
      ],
      correctAnswer: 'B',
      marks: 1,
      explanation: 'Aluminium has a low density (lightweight) and forms a protective adherent oxide layer that makes it highly resistant to corrosion.',
      subject: 'chemistry',
      syllabusCode: 'C9.2',
      questionType: 'mcq'
    },
    {
      id: 'm26-12-q25',
      number: 25,
      questionText: 'Which two substances are required for the rusting of iron to occur?',
      options: [
        { key: 'A', text: 'carbon dioxide and water' },
        { key: 'B', text: 'nitrogen and oxygen' },
        { key: 'C', text: 'oxygen and water' },
        { key: 'D', text: 'oxygen and hydrogen' }
      ],
      correctAnswer: 'C',
      marks: 1,
      explanation: 'Rusting of iron requires both oxygen and water to form hydrated iron(III) oxide.',
      subject: 'chemistry',
      syllabusCode: 'C9.5',
      questionType: 'mcq'
    },
    {
      id: 'm26-12-q26',
      number: 26,
      questionText: 'What is the main constituent of natural gas?',
      options: [
        { key: 'A', text: 'butane' },
        { key: 'B', text: 'carbon monoxide' },
        { key: 'C', text: 'ethene' },
        { key: 'D', text: 'methane' }
      ],
      correctAnswer: 'D',
      marks: 1,
      explanation: 'Natural gas is composed primarily of methane (CH4).',
      subject: 'chemistry',
      syllabusCode: 'C11.3',
      questionType: 'mcq'
    },

    // PHYSICS (Q27 - Q40)
    {
      id: 'm26-12-q27',
      number: 27,
      questionText: 'Which instrument is most suitable for measuring the diameter of a thin copper wire with high precision?',
      options: [
        { key: 'A', text: 'measuring cylinder' },
        { key: 'B', text: 'measuring tape' },
        { key: 'C', text: 'micrometer screw gauge' },
        { key: 'D', text: 'half-metre rule' }
      ],
      correctAnswer: 'C',
      marks: 1,
      explanation: 'A micrometer screw gauge measures dimensions to 0.01 mm precision, ideal for thin wires.',
      subject: 'physics',
      syllabusCode: 'P1.1',
      questionType: 'mcq'
    },
    {
      id: 'm26-12-q28',
      number: 28,
      questionText: 'A car travels a distance of 300 metres in 15 seconds. What is its average speed?',
      options: [
        { key: 'A', text: '0.05 m/s' },
        { key: 'B', text: '20 m/s' },
        { key: 'C', text: '315 m/s' },
        { key: 'D', text: '4500 m/s' }
      ],
      correctAnswer: 'B',
      marks: 1,
      explanation: 'Average speed = distance / time = 300 m / 15 s = 20 m/s.',
      subject: 'physics',
      syllabusCode: 'P1.2',
      questionType: 'mcq'
    },
    {
      id: 'm26-12-q29',
      number: 29,
      questionText: 'A stone has a mass of 5.0 kg on Earth where gravitational field strength g = 9.8 N/kg. What is the weight of the stone?',
      options: [
        { key: 'A', text: '0.51 N' },
        { key: 'B', text: '5.0 N' },
        { key: 'C', text: '49 N' },
        { key: 'D', text: '98 N' }
      ],
      correctAnswer: 'C',
      marks: 1,
      explanation: 'Weight W = mass m × gravitational field strength g = 5.0 kg × 9.8 N/kg = 49 N.',
      subject: 'physics',
      syllabusCode: 'P1.3',
      questionType: 'mcq'
    },
    {
      id: 'm26-12-q30',
      number: 30,
      questionText: 'A solid metal block has a mass of 270 g and a volume of 100 cm³. What is the density of the metal?',
      options: [
        { key: 'A', text: '0.37 g/cm³' },
        { key: 'B', text: '2.7 g/cm³' },
        { key: 'C', text: '170 g/cm³' },
        { key: 'D', text: '27 000 g/cm³' }
      ],
      correctAnswer: 'B',
      marks: 1,
      explanation: 'Density ρ = mass / volume = 270 g / 100 cm³ = 2.7 g/cm³ (density of aluminium).',
      subject: 'physics',
      syllabusCode: 'P1.4',
      questionType: 'mcq'
    },
    {
      id: 'm26-12-q31',
      number: 31,
      questionText: 'An unstretched spring has an original length of 12.0 cm. When a weight of 4.0 N is hung on it, the total length becomes 18.0 cm. What is the extension of the spring?',
      options: [
        { key: 'A', text: '4.0 cm' },
        { key: 'B', text: '6.0 cm' },
        { key: 'C', text: '18.0 cm' },
        { key: 'D', text: '30.0 cm' }
      ],
      correctAnswer: 'B',
      marks: 1,
      explanation: 'Extension = stretched length – original length = 18.0 cm – 12.0 cm = 6.0 cm.',
      subject: 'physics',
      syllabusCode: 'P1.5.1',
      questionType: 'mcq'
    },
    {
      id: 'm26-12-q32',
      number: 32,
      questionText: 'A constant horizontal force of 50 N moves a box across a smooth floor through a distance of 4.0 m. How much work is done on the box?',
      options: [
        { key: 'A', text: '12.5 J' },
        { key: 'B', text: '46 J' },
        { key: 'C', text: '54 J' },
        { key: 'D', text: '200 J' }
      ],
      correctAnswer: 'D',
      marks: 1,
      explanation: 'Work done W = Force F × distance d in direction of force = 50 N × 4.0 m = 200 J.',
      subject: 'physics',
      syllabusCode: 'P1.6.2',
      questionType: 'mcq'
    },
    {
      id: 'm26-12-q33',
      number: 33,
      questionText: 'Which energy resource is renewable and does NOT emit carbon dioxide during operation?',
      options: [
        { key: 'A', text: 'coal' },
        { key: 'B', text: 'natural gas' },
        { key: 'C', text: 'petroleum oil' },
        { key: 'D', text: 'wind power' }
      ],
      correctAnswer: 'D',
      marks: 1,
      explanation: 'Wind power harnesses the kinetic energy of air without combustion, so it is renewable and zero-carbon in operation.',
      subject: 'physics',
      syllabusCode: 'P1.6.3',
      questionType: 'mcq'
    },
    {
      id: 'm26-12-q34',
      number: 34,
      questionText: 'Why does sweating cool the human body down on a hot day?',
      options: [
        { key: 'A', text: 'The sweat releases cold thermal energy into the bloodstream' },
        { key: 'B', text: 'The most energetic water molecules evaporate from the skin, lowering the average kinetic energy of remaining molecules' },
        { key: 'C', text: 'Water has zero heat capacity' },
        { key: 'D', text: 'Sweat conducts cold air directly to the internal organs' }
      ],
      correctAnswer: 'B',
      marks: 1,
      explanation: 'Evaporation is a cooling mechanism: high-kinetic-energy liquid particles break bonds and escape into the vapor phase, leaving particles with lower average kinetic energy (lower temperature).',
      subject: 'physics',
      syllabusCode: 'P2.2.2',
      questionType: 'mcq'
    },
    {
      id: 'm26-12-q35',
      number: 35,
      questionText: 'By which thermal transfer mechanism does thermal energy travel from the Sun through the vacuum of space to the Earth?',
      options: [
        { key: 'A', text: 'conduction' },
        { key: 'B', text: 'convection' },
        { key: 'C', text: 'evaporation' },
        { key: 'D', text: 'radiation (infrared waves)' }
      ],
      correctAnswer: 'D',
      marks: 1,
      explanation: 'Conduction and convection both require material particles. Only thermal radiation consists of electromagnetic waves that can propagate through the vacuum of space.',
      subject: 'physics',
      syllabusCode: 'P2.3.3',
      questionType: 'mcq'
    },
    {
      id: 'm26-12-q36',
      number: 36,
      questionText: 'A wave has a frequency of 50 Hz and a wavelength of 0.20 m. What is the speed of the wave?',
      options: [
        { key: 'A', text: '10 m/s' },
        { key: 'B', text: '25 m/s' },
        { key: 'C', text: '50.2 m/s' },
        { key: 'D', text: '250 m/s' }
      ],
      correctAnswer: 'A',
      marks: 1,
      explanation: 'Wave equation: speed v = frequency f × wavelength λ = 50 Hz × 0.20 m = 10 m/s.',
      subject: 'physics',
      syllabusCode: 'P3.1',
      questionType: 'mcq'
    },
    {
      id: 'm26-12-q37',
      number: 37,
      questionText: 'What is the law of reflection for a light ray striking a flat plane mirror?',
      options: [
        { key: 'A', text: 'angle of incidence is always greater than angle of reflection' },
        { key: 'B', text: 'angle of incidence equals the angle of reflection (i = r)' },
        { key: 'C', text: 'angle of incidence is always 90 degrees' },
        { key: 'D', text: 'angle of incidence is half the angle of reflection' }
      ],
      correctAnswer: 'B',
      marks: 1,
      explanation: 'The law of reflection states that the angle of incidence equals the angle of reflection, both measured relative to the normal.',
      subject: 'physics',
      syllabusCode: 'P3.2.1',
      questionType: 'mcq'
    },
    {
      id: 'm26-12-q38',
      number: 38,
      questionText: 'Which electromagnetic wave has the shortest wavelength and highest frequency?',
      options: [
        { key: 'A', text: 'gamma rays' },
        { key: 'B', text: 'microwaves' },
        { key: 'C', text: 'radio waves' },
        { key: 'D', text: 'visible light' }
      ],
      correctAnswer: 'A',
      marks: 1,
      explanation: 'In the electromagnetic spectrum, gamma rays have the highest frequency and shortest wavelength, while radio waves have the longest wavelength.',
      subject: 'physics',
      syllabusCode: 'P3.3',
      questionType: 'mcq'
    },
    {
      id: 'm26-12-q39',
      number: 39,
      questionText: 'A potential difference of 12 V is applied across a 6.0 Ω resistor. What electric current flows through the resistor?',
      options: [
        { key: 'A', text: '0.50 A' },
        { key: 'B', text: '2.0 A' },
        { key: 'C', text: '6.0 A' },
        { key: 'D', text: '72 A' }
      ],
      correctAnswer: 'B',
      marks: 1,
      explanation: 'Ohm’s law: current I = V / R = 12 V / 6.0 Ω = 2.0 A.',
      subject: 'physics',
      syllabusCode: 'P4.1.4',
      questionType: 'mcq'
    },
    {
      id: 'm26-12-q40',
      number: 40,
      questionText: 'Two identical 10 Ω resistors are connected in series. What is the combined resistance of the pair?',
      options: [
        { key: 'A', text: '5.0 Ω' },
        { key: 'B', text: '10 Ω' },
        { key: 'C', text: '20 Ω' },
        { key: 'D', text: '100 Ω' }
      ],
      correctAnswer: 'C',
      marks: 1,
      explanation: 'In series, resistances add directly: R_total = R1 + R2 = 10 Ω + 10 Ω = 20 Ω.',
      subject: 'physics',
      syllabusCode: 'P4.2.2',
      questionType: 'mcq'
    }
  ]
};
