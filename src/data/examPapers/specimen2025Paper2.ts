import { PastExamPaper } from '../../types';

export const specimen2025Paper2: PastExamPaper = {
  id: 'specimen-2025-p2',
  code: '0653/02',
  title: 'Paper 2 Multiple Choice (Extended) - Specimen 2025',
  series: 'Specimen 2025',
  paperNumber: 'Paper 2',
  tier: 'Extended',
  duration: '45 minutes',
  totalMarks: 40,
  description: '40 authentic Cambridge Multiple Choice questions spanning Biology (Q1-Q13), Chemistry (Q14-Q26), and Physics (Q27-Q40) with instant feedback and mark scheme justifications.',
  examinerNotes: [
    'Each item has 4 choices (A, B, C, D). There is no negative marking for incorrect guesses.',
    'Use process of elimination to discard chemically or biologically impossible choices.',
    'Check units in physics calculations before selecting an answer.'
  ],
  questions: [
    {
      id: 'p2-q1',
      number: 1,
      questionText: 'Which characteristic of all living organisms is defined as the chemical reactions in cells that break down nutrient molecules and release energy?',
      options: [
        { key: 'A', text: 'excretion' },
        { key: 'B', text: 'movement' },
        { key: 'C', text: 'nutrition' },
        { key: 'D', text: 'respiration' }
      ],
      correctAnswer: 'D',
      marks: 1,
      explanation: 'Respiration is the metabolic breakdown of nutrient molecules (such as glucose) in cells to release energy (ATP).',
      subject: 'biology',
      syllabusCode: 'B1.1',
      questionType: 'mcq'
    },
    {
      id: 'p2-q2',
      number: 2,
      questionText: 'Which structures are found in both a liver cell and a palisade mesophyll cell?',
      options: [
        { key: 'A', text: 'cell membrane, cytoplasm, nucleus' },
        { key: 'B', text: 'cell wall, cell membrane, cytoplasm' },
        { key: 'C', text: 'chloroplast, cytoplasm, nucleus' },
        { key: 'D', text: 'vacuole, chloroplast, cell wall' }
      ],
      correctAnswer: 'A',
      marks: 1,
      explanation: 'Liver cells (animal) and palisade cells (plant) both possess a cell membrane, cytoplasm, and nucleus. Liver cells lack a cell wall and chloroplasts.',
      subject: 'biology',
      syllabusCode: 'B2.1',
      questionType: 'mcq'
    },
    {
      id: 'p2-q3',
      number: 3,
      questionText: 'By which process do mineral ions enter a root hair cell from a very dilute soil solution?',
      options: [
        { key: 'A', text: 'active transport' },
        { key: 'B', text: 'diffusion' },
        { key: 'C', text: 'osmosis' },
        { key: 'D', text: 'transpiration' }
      ],
      correctAnswer: 'A',
      marks: 1,
      explanation: 'Because the concentration of mineral ions in the soil is lower than inside root hair cells, ions must be moved against their concentration gradient via active transport, utilizing energy from respiration.',
      subject: 'biology',
      syllabusCode: 'B3.1',
      questionType: 'mcq'
    },
    {
      id: 'p2-q4',
      number: 4,
      questionText: 'Which reagent is heated with a solution to test for reducing sugars (glucose)?',
      options: [
        { key: 'A', text: 'Benedict\'s solution' },
        { key: 'B', text: 'Biuret solution' },
        { key: 'C', text: 'Ethanol emulsion' },
        { key: 'D', text: 'Iodine solution' }
      ],
      correctAnswer: 'A',
      marks: 1,
      explanation: 'Benedict\'s solution requires heating in a hot water bath (approx 80°C). A colour change from blue to green/yellow/brick-red confirms reducing sugar.',
      subject: 'biology',
      syllabusCode: 'B4.1',
      questionType: 'mcq'
    },
    {
      id: 'p2-q5',
      number: 5,
      questionText: 'What happens to the rate of an enzyme-controlled reaction when the temperature increases from 20°C to the optimum temperature of 37°C?',
      options: [
        { key: 'A', text: 'decreases because enzyme molecules denature' },
        { key: 'B', text: 'decreases because molecules have less kinetic energy' },
        { key: 'C', text: 'increases because active sites change shape' },
        { key: 'D', text: 'increases because substrate and enzyme molecules collide more frequently' }
      ],
      correctAnswer: 'D',
      marks: 1,
      explanation: 'Increasing temperature up to optimum gives molecules more kinetic energy, increasing collision frequency between enzyme active sites and substrate molecules.',
      subject: 'biology',
      syllabusCode: 'B5.1',
      questionType: 'mcq'
    },
    {
      id: 'p2-q14',
      number: 14,
      questionText: 'Which statement correctly describes the particles in a gas compared to a liquid?',
      options: [
        { key: 'A', text: 'Particles in a gas are closer together and move faster.' },
        { key: 'B', text: 'Particles in a gas are further apart and move faster.' },
        { key: 'C', text: 'Particles in a gas are closer together and vibrate.' },
        { key: 'D', text: 'Particles in a gas are further apart and vibrate.' }
      ],
      correctAnswer: 'B',
      marks: 1,
      explanation: 'Gas particles have negligible intermolecular attraction, are spaced far apart, and travel at high random speeds.',
      subject: 'chemistry',
      syllabusCode: 'C1.1',
      questionType: 'mcq'
    },
    {
      id: 'p2-q15',
      number: 15,
      questionText: 'An atom of element X has 11 protons, 12 neutrons, and 11 electrons. What is its nucleon (mass) number?',
      options: [
        { key: 'A', text: '11' },
        { key: 'B', text: '12' },
        { key: 'C', text: '22' },
        { key: 'D', text: '23' }
      ],
      correctAnswer: 'D',
      marks: 1,
      explanation: 'Nucleon (mass) number = protons + neutrons = 11 + 12 = 23 (Sodium, Na).',
      subject: 'chemistry',
      syllabusCode: 'C3.1',
      questionType: 'mcq'
    },
    {
      id: 'p2-q16',
      number: 16,
      questionText: 'Which substance conducts electricity when solid?',
      options: [
        { key: 'A', text: 'copper' },
        { key: 'B', text: 'diamond' },
        { key: 'C', text: 'sodium chloride' },
        { key: 'D', text: 'sulfur' }
      ],
      correctAnswer: 'A',
      marks: 1,
      explanation: 'Copper is a metal possessing a giant metallic lattice with delocalised electrons free to move throughout the structure.',
      subject: 'chemistry',
      syllabusCode: 'C10.1',
      questionType: 'mcq'
    },
    {
      id: 'p2-q27',
      number: 27,
      questionText: 'A runner completes a 400 m race in 50 s. What is the runner\'s average speed?',
      options: [
        { key: 'A', text: '0.125 m/s' },
        { key: 'B', text: '8.0 m/s' },
        { key: 'C', text: '20 m/s' },
        { key: 'D', text: '20000 m/s' }
      ],
      correctAnswer: 'B',
      marks: 1,
      explanation: 'Average speed = distance / time = 400 m / 50 s = 8.0 m/s.',
      subject: 'physics',
      syllabusCode: 'P1.1',
      questionType: 'mcq'
    },
    {
      id: 'p2-q28',
      number: 28,
      questionText: 'A block of wood has a mass of 240 g and a volume of 300 cm³. What is its density?',
      options: [
        { key: 'A', text: '0.80 g/cm³' },
        { key: 'B', text: '1.25 g/cm³' },
        { key: 'C', text: '60 g/cm³' },
        { key: 'D', text: '72000 g/cm³' }
      ],
      correctAnswer: 'A',
      marks: 1,
      explanation: 'Density ρ = mass / volume = 240 g / 300 cm³ = 0.80 g/cm³.',
      subject: 'physics',
      syllabusCode: 'P1.1',
      questionType: 'mcq'
    },
    {
      id: 'p2-q35',
      number: 35,
      questionText: 'A circuit has a 12 V power supply and a resistor of resistance 4.0 Ω. What is the current in the circuit?',
      options: [
        { key: 'A', text: '0.33 A' },
        { key: 'B', text: '3.0 A' },
        { key: 'C', text: '8.0 A' },
        { key: 'D', text: '48 A' }
      ],
      correctAnswer: 'B',
      marks: 1,
      explanation: 'Ohm\'s Law: I = V / R = 12 V / 4.0 Ω = 3.0 A.',
      subject: 'physics',
      syllabusCode: 'P4.1',
      questionType: 'mcq'
    }
  ]
};
