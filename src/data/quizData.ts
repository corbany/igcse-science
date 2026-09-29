import { QuizQuestion } from '../types';

export const practiceQuizzes: QuizQuestion[] = [
  // BIOLOGY
  {
    id: 'q-bio-1',
    subject: 'biology',
    topicCode: 'B1',
    question: 'Which characteristic of living organisms describes the chemical reactions in cells that break down nutrient molecules to release energy for metabolism?',
    options: ['Excretion', 'Nutrition', 'Respiration', 'Sensitivity'],
    correctIndex: 2,
    explanation: 'Respiration is defined in Cambridge 0653 B1 as the chemical reactions in cells that break down nutrient molecules and release energy for metabolism.',
    syllabusRef: 'B1.1'
  },
  {
    id: 'q-bio-2',
    subject: 'biology',
    topicCode: 'B2',
    question: 'A student measures a diagram of a root hair cell as 45 mm long. The actual length is 150 μm. What is the magnification?',
    options: ['x 30', 'x 300', 'x 3000', 'x 0.3'],
    correctIndex: 1,
    explanation: 'Convert 45 mm into μm: 45 × 1000 = 45,000 μm. Magnification = Image ÷ Actual = 45,000 ÷ 150 = x300.',
    syllabusRef: 'B2.2'
  },
  {
    id: 'q-bio-3',
    subject: 'biology',
    topicCode: 'B3',
    question: 'What happens to a plant cell when placed in a concentrated sucrose solution with a lower water potential than the cell sap?',
    options: [
      'Water enters by osmosis and the cell becomes turgid',
      'Water leaves by osmosis and the cell becomes flaccid / plasmolysed',
      'Solute enters by diffusion and the cell bursts',
      'Water leaves by active transport requiring energy'
    ],
    correctIndex: 1,
    explanation: 'Water moves from high water potential (inside cell) to lower water potential (concentrated solution) through the partially permeable membrane, causing the cytoplasm to pull away from the cell wall (flaccid/plasmolysis).',
    syllabusRef: 'B3.2'
  },
  {
    id: 'q-bio-4',
    subject: 'biology',
    topicCode: 'B4',
    question: 'Which reagent and observation confirms the presence of protein in a biological sample?',
    options: [
      'Iodine solution turning blue-black',
      'Benedict\'s solution turning brick-red on heating',
      'Biuret solution turning purple / lilac',
      'Ethanol emulsion remaining clear'
    ],
    correctIndex: 2,
    explanation: 'The Biuret test uses dilute sodium hydroxide and copper sulfate; a colour change from pale blue to purple/lilac confirms peptide bonds in proteins.',
    syllabusRef: 'B4.1'
  },
  {
    id: 'q-bio-5',
    subject: 'biology',
    topicCode: 'B5',
    question: 'Why does the rate of an enzyme-controlled reaction drop to zero when the temperature rises above 60 °C?',
    options: [
      'The kinetic energy of the substrate drops to zero',
      'The active site of the enzyme denatures and changes shape permanently',
      'The enzyme turns into an inhibitor',
      'The substrate molecules become insoluble'
    ],
    correctIndex: 1,
    explanation: 'High thermal energy breaks bonds holding the enzyme\'s specific 3D shape, denaturing the active site so substrates can no longer bind.',
    syllabusRef: 'B5.1'
  },
  {
    id: 'q-bio-6',
    subject: 'biology',
    topicCode: 'B9',
    question: 'Which blood vessel carries oxygenated blood from the lungs into the left atrium of the heart?',
    options: ['Aorta', 'Pulmonary artery', 'Pulmonary vein', 'Vena cava'],
    correctIndex: 2,
    explanation: 'The pulmonary vein is the only vein carrying oxygenated blood, transporting it from the alveoli in the lungs into the left atrium.',
    syllabusRef: 'B9.2'
  },
  {
    id: 'q-bio-7',
    subject: 'biology',
    topicCode: 'B13',
    question: 'Why does a doctor refuse to prescribe penicillin or other antibiotics for a viral infection like influenza?',
    options: [
      'Antibiotics are toxic to human red blood cells',
      'Antibiotics only kill bacteria by disrupting cellular processes, not viruses',
      'Viruses produce antibodies that neutralise the antibiotic',
      'Antibiotics are only used as painkillers'
    ],
    correctIndex: 1,
    explanation: 'Viruses replicate inside human host cells and lack bacterial cell walls or bacterial metabolic pathways, making them unaffected by antibiotics.',
    syllabusRef: 'B13.1'
  },

  // CHEMISTRY
  {
    id: 'q-chm-1',
    subject: 'chemistry',
    topicCode: 'C2',
    question: 'An atom has atomic number 17 and mass number 35. How many protons, neutrons, and electrons does it have?',
    options: [
      '17 protons, 18 neutrons, 17 electrons',
      '17 protons, 35 neutrons, 17 electrons',
      '18 protons, 17 neutrons, 18 electrons',
      '35 protons, 17 neutrons, 35 electrons'
    ],
    correctIndex: 0,
    explanation: 'Protons = atomic number = 17. Electrons in neutral atom = 17. Neutrons = Mass number - atomic number = 35 - 17 = 18.',
    syllabusRef: 'C2.2'
  },
  {
    id: 'q-chm-2',
    subject: 'chemistry',
    topicCode: 'C2',
    question: 'Why do simple covalent compounds such as methane (CH4) and water (H2O) have low melting and boiling points?',
    options: [
      'Covalent bonds within the molecules are extremely weak',
      'Intermolecular forces between the molecules are weak and require little energy to overcome',
      'They form a giant lattice with mobile electrons',
      'They contain alternating positive and negative ions'
    ],
    correctIndex: 1,
    explanation: 'Covalent bonds between atoms are strong, but the forces of attraction between separate molecules (intermolecular forces) are weak.',
    syllabusRef: 'C2.4'
  },
  {
    id: 'q-chm-3',
    subject: 'chemistry',
    topicCode: 'C4',
    question: 'During the electrolysis of concentrated aqueous sodium chloride, what substance is produced at the anode and what is observed?',
    options: [
      'Sodium metal; grey solid deposited',
      'Hydrogen gas; burns with a squeaky pop',
      'Chlorine gas; pale yellow-green gas that bleaches damp litmus paper',
      'Oxygen gas; relights a glowing splint'
    ],
    correctIndex: 2,
    explanation: 'Chloride ions (Cl-) are discharged at the positive anode to form chlorine gas (Cl2), which bleaches damp litmus paper white.',
    syllabusRef: 'C4.1'
  },
  {
    id: 'q-chm-4',
    subject: 'chemistry',
    topicCode: 'C5',
    question: 'Which statement correctly describes bond breaking and bond making in chemical reactions?',
    options: [
      'Bond breaking is exothermic and bond making is endothermic',
      'Bond breaking is endothermic and bond making is exothermic',
      'Both bond breaking and bond making are always exothermic',
      'Both bond breaking and bond making are always endothermic'
    ],
    correctIndex: 1,
    explanation: 'Energy must be taken in to break bonds (endothermic); when new bonds form, energy is released to the surroundings (exothermic).',
    syllabusRef: 'C5.1'
  },
  {
    id: 'q-chm-5',
    subject: 'chemistry',
    topicCode: 'C8',
    question: 'A student adds aqueous chlorine (Cl2) to a solution of potassium bromide (KBr). What happens?',
    options: [
      'No reaction occurs because bromine is more reactive than chlorine',
      'Chlorine displaces bromine; the solution turns orange as bromine is formed',
      'A white precipitate of silver bromide is formed',
      'Potassium metal precipitates at the bottom'
    ],
    correctIndex: 1,
    explanation: 'Chlorine is higher in Group VII than bromine and therefore more reactive. It displaces bromide ions: Cl2 + 2KBr -> 2KCl + Br2 (orange solution).',
    syllabusRef: 'C8.3'
  },
  {
    id: 'q-chm-6',
    subject: 'chemistry',
    topicCode: 'C9',
    question: 'Why is stainless steel harder and stronger than pure iron?',
    options: [
      'It contains only smaller carbon atoms that slide effortlessly',
      'The different sized atoms (Fe, Cr, Ni, C) disrupt the regular layers, preventing them from sliding over each other',
      'It has ionic bonds instead of metallic bonds',
      'It has lower density and higher malleability'
    ],
    correctIndex: 1,
    explanation: 'In pure iron, uniform atoms form regular layers that slide easily when force is applied. In an alloy, different-sized atoms distort the lattice so layers cannot slide.',
    syllabusRef: 'C9.3'
  },
  {
    id: 'q-chm-7',
    subject: 'chemistry',
    topicCode: 'C12',
    question: 'An unknown aqueous solution gives a white precipitate with aqueous sodium hydroxide that is SOLUBLE in excess to give a colourless solution. What cation is present?',
    options: ['Calcium (Ca2+)', 'Iron(II) (Fe2+)', 'Zinc (Zn2+)', 'Copper(II) (Cu2+)'],
    correctIndex: 2,
    explanation: 'Both Ca2+ and Zn2+ form white precipitates with NaOH, but only Zinc hydroxide dissolves in excess alkali to form a colourless solution.',
    syllabusRef: 'C12.4'
  },

  // PHYSICS
  {
    id: 'q-phy-1',
    subject: 'physics',
    topicCode: 'P1',
    question: 'On Earth, a rock has mass 25 kg. What is its weight using the 2025-2027 Cambridge syllabus gravitational constant (g = 9.8 N/kg)?',
    options: ['2.55 N', '25 N', '245 N', '250 N'],
    correctIndex: 2,
    explanation: 'W = m × g = 25 kg × 9.8 N/kg = 245 N.',
    syllabusRef: 'P1.3'
  },
  {
    id: 'q-phy-2',
    subject: 'physics',
    topicCode: 'P1',
    question: 'A speed-time graph shows an object accelerating uniformly from rest to 15 m/s in 6 seconds, then travelling at 15 m/s for 10 seconds. What is the total distance travelled?',
    options: ['90 m', '150 m', '195 m', '240 m'],
    correctIndex: 2,
    explanation: 'Distance = area under graph. Triangle area = 1/2 × 6 s × 15 m/s = 45 m. Rectangle area = 10 s × 15 m/s = 150 m. Total distance = 45 + 150 = 195 m.',
    syllabusRef: 'P1.2'
  },
  {
    id: 'q-phy-3',
    subject: 'physics',
    topicCode: 'P1',
    question: 'A block exerts a downward force of 600 N over a contact area of 0.2 m². What is the pressure exerted on the floor?',
    options: ['120 Pa', '600 Pa', '3000 Pa', '12000 Pa'],
    correctIndex: 2,
    explanation: 'p = F / A = 600 N ÷ 0.2 m² = 3000 Pa (N/m²).',
    syllabusRef: 'P1.7'
  },
  {
    id: 'q-phy-4',
    subject: 'physics',
    topicCode: 'P2',
    question: 'Why do metal cooking pots heat soup much faster than glass or ceramic pots?',
    options: [
      'Metals have lower density than glass',
      'Metals contain free delocalised electrons that rapidly transfer thermal kinetic energy through the metallic lattice',
      'Metals emit more infrared radiation into the soup',
      'Glass prevents convection currents from forming'
    ],
    correctIndex: 1,
    explanation: 'In metals, mobile delocalised electrons move quickly through the lattice, colliding with distant metal ions to transfer heat much faster than lattice vibrations alone.',
    syllabusRef: 'P2.3.1'
  },
  {
    id: 'q-phy-5',
    subject: 'physics',
    topicCode: 'P3',
    question: 'A sound wave has a frequency of 500 Hz and travels at 340 m/s in air. What is its wavelength?',
    options: ['0.68 m', '1.47 m', '170 m', '170,000 m'],
    correctIndex: 0,
    explanation: 'v = f × λ -> λ = v / f = 340 m/s ÷ 500 Hz = 0.68 m.',
    syllabusRef: 'P3.1'
  },
  {
    id: 'q-phy-6',
    subject: 'physics',
    topicCode: 'P4',
    question: 'Two resistors of 10 Ω each are connected in PARALLEL to a 12 V battery. What is the combined resistance of the circuit and the current from the battery?',
    options: [
      'Combined resistance = 20 Ω; Current = 0.6 A',
      'Combined resistance = 5 Ω; Current = 2.4 A',
      'Combined resistance = 10 Ω; Current = 1.2 A',
      'Combined resistance = 5 Ω; Current = 0.6 A'
    ],
    correctIndex: 1,
    explanation: 'In parallel: 1/R = 1/10 + 1/10 = 2/10 -> R = 10/2 = 5 Ω. Total current I = V / R = 12 V ÷ 5 Ω = 2.4 A.',
    syllabusRef: 'P4.2.2'
  },
  {
    id: 'q-phy-7',
    subject: 'physics',
    topicCode: 'P5',
    question: 'Which observation provides key evidence that the Universe is expanding as stated by the Big Bang Theory?',
    options: [
      'The Sun emits infrared and ultraviolet light',
      'Light from distant galaxies is red-shifted (stretched to longer wavelengths)',
      'Planets orbit the Sun with elliptical paths',
      'White dwarfs cool into black dwarfs'
    ],
    correctIndex: 1,
    explanation: 'Light emitted from galaxies moving away from Earth has its wavelength stretched toward the red end of the spectrum (redshift). Distant galaxies exhibit greater redshift, proving expansion.',
    syllabusRef: 'P5.2.3'
  }
];
