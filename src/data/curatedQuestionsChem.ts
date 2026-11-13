import { QuizQuestion } from '../types';

/**
 * Curated Cambridge IGCSE Combined Science (0653) Chemistry MCQs
 * Grouped strictly by subtopic code (C2.1 - C12.4). Zero mole calculations.
 */
export const CURATED_CHEM_QUESTIONS: Record<string, QuizQuestion[]> = {
  'C2.1': [
    {
      id: 'cc-c21-1',
      subject: 'chemistry',
      topicCode: 'C2',
      syllabusRef: 'C2.1',
      question: 'Which statement accurately distinguishes a compound from a mixture?',
      options: [
        'A compound contains elements chemically bonded in a fixed ratio with properties different from its elements',
        'A compound can be easily separated into its original elements by filtration',
        'A mixture has a fixed composition by mass and cannot vary',
        'Elements in a mixture chemically react whenever they are stirred together'
      ],
      correctIndex: 0,
      explanation: 'Compounds are formed by chemical bonding in fixed proportions; mixtures are physically combined and can vary in composition.'
    },
    {
      id: 'cc-c21-2',
      subject: 'chemistry',
      topicCode: 'C2',
      syllabusRef: 'C2.1',
      question: 'Iron filings and sulfur powder are stirred together at room temperature without heating. Which statement is correct?',
      options: [
        'They form a mixture, so a magnet can still attract and remove the iron filings',
        'They form iron(II) sulfide, a magnetic black compound',
        'The sulfur dissolves the iron filings chemically at room temperature',
        'The ratio of iron to sulfur must be fixed before mixing'
      ],
      correctIndex: 0,
      explanation: 'Without heating, iron and sulfur form a physical mixture retaining individual properties such as iron’s magnetism.'
    },
    {
      id: 'cc-c21-3',
      subject: 'chemistry',
      topicCode: 'C2',
      syllabusRef: 'C2.1',
      question: 'Which substance is classified as a pure element?',
      options: ['Copper wire (Cu)', 'Sodium chloride (NaCl)', 'Sea water', 'Brass alloy'],
      correctIndex: 0,
      explanation: 'Copper consists of only one type of atom (Cu). NaCl is a compound; sea water and brass are mixtures.'
    }
  ],

  'C2.2': [
    {
      id: 'cc-c22-1',
      subject: 'chemistry',
      topicCode: 'C2',
      syllabusRef: 'C2.2',
      question: 'An atom has proton number 11 and nucleon number 23. How many neutrons and electrons does a neutral atom of this element contain?',
      options: ['12 neutrons and 11 electrons', '11 neutrons and 12 electrons', '23 neutrons and 11 electrons', '12 neutrons and 23 electrons'],
      correctIndex: 0,
      explanation: 'Number of neutrons = nucleon number − proton number = 23 − 11 = 12. Neutral atoms have equal protons and electrons (11).'
    },
    {
      id: 'cc-c22-2',
      subject: 'chemistry',
      topicCode: 'C2',
      syllabusRef: 'C2.2',
      question: 'Why are carbon-12 and carbon-14 isotopes of the same element?',
      options: [
        'Both have 6 protons in their nuclei, while their nuclei contain different numbers of neutrons',
        'Both have 12 neutrons and different numbers of outer-shell electrons',
        'Carbon-14 has 8 protons while carbon-12 has 6 protons',
        'They react differently with oxygen during combustion due to different electron shells'
      ],
      correctIndex: 0,
      explanation: 'Isotopes are atoms of the same element with the same proton number (atomic number) but different numbers of neutrons.'
    },
    {
      id: 'cc-c22-3',
      subject: 'chemistry',
      topicCode: 'C2',
      syllabusRef: 'C2.2',
      question: 'An element has electronic configuration 2,8,7. Which group and period of the Periodic Table does it belong to?',
      options: ['Group VII, Period 3', 'Group III, Period 7', 'Group VII, Period 2', 'Group I, Period 3'],
      correctIndex: 0,
      explanation: 'Three occupied electron shells = Period 3; seven outer-shell electrons = Group VII.'
    }
  ],

  'C2.3': [
    {
      id: 'cc-c23-1',
      subject: 'chemistry',
      topicCode: 'C2',
      syllabusRef: 'C2.3',
      question: 'How does a magnesium atom (electronic structure 2,8,2) form an ionic bond with oxygen (2,6)?',
      options: [
        'Magnesium transfers 2 outer electrons to oxygen, forming Mg²⁺ and O²⁻ ions that attract electrostatically',
        'Magnesium shares two pairs of electrons with oxygen to form discrete molecules',
        'Oxygen transfers 2 electrons to magnesium, forming Mg²⁻ and O²⁺ ions',
        'Magnesium gains 6 electrons into its third shell from oxygen'
      ],
      correctIndex: 0,
      explanation: 'Metal atoms lose outer electrons to form positive cations (Mg²⁺); non-metal oxygen gains 2 electrons to form O²⁻.'
    },
    {
      id: 'cc-c23-2',
      subject: 'chemistry',
      topicCode: 'C2',
      syllabusRef: 'C2.3',
      question: 'Why do ionic compounds conduct electricity when molten or dissolved in water, but NOT when solid?',
      options: [
        'In solids, ions are fixed in a giant lattice and cannot move; when molten or aqueous, ions are free to move and carry charge',
        'Solids contain no charged particles until heated above 500°C',
        'Water breaks covalent bonds into free delocalised electrons',
        'Molten ionic compounds conduct using free electrons flowing through the liquid'
      ],
      correctIndex: 0,
      explanation: 'Electrical conduction in ionic substances requires mobile ions. In the solid lattice ions only vibrate in fixed positions.'
    },
    {
      id: 'cc-c23-3',
      subject: 'chemistry',
      topicCode: 'C2',
      syllabusRef: 'C2.3',
      question: 'Why does solid sodium chloride have a high melting point (801°C)?',
      options: [
        'Strong electrostatic attractions between oppositely charged Na⁺ and Cl⁻ ions throughout a giant lattice require lots of heat energy to break',
        'Weak intermolecular forces between NaCl molecules require little energy to overcome',
        'Covalent bonds between sodium atoms are extremely strong',
        'Free electrons hold the chloride ions together'
      ],
      correctIndex: 0,
      explanation: 'A large amount of thermal energy is needed to overcome the strong electrostatic forces in a giant 3D ionic lattice.'
    }
  ],

  'C2.4': [
    {
      id: 'cc-c24-1',
      subject: 'chemistry',
      topicCode: 'C2',
      syllabusRef: 'C2.4',
      question: 'How is a single covalent bond formed between two hydrogen atoms in a hydrogen molecule (H₂)?',
      options: [
        'One pair of electrons is shared equally between the two hydrogen nuclei',
        'One hydrogen atom transfers its electron completely to form H⁺ and H⁻ ions',
        'A sea of delocalised electrons surrounds fixed H⁺ ions',
        'Two pairs of protons are shared between the outer shells'
      ],
      correctIndex: 0,
      explanation: 'A covalent bond forms when non-metal atoms share a pair of electrons so both achieve full outer shells.'
    },
    {
      id: 'cc-c24-2',
      subject: 'chemistry',
      topicCode: 'C2',
      syllabusRef: 'C2.4',
      question: 'Why do simple molecular covalent substances such as methane (CH₄) and chlorine (Cl₂) have low boiling points?',
      options: [
        'Only weak intermolecular forces exist between molecules, requiring little energy to overcome during boiling',
        'The covalent bonds inside each molecule are weak and snap easily at room temperature',
        'Simple molecules carry high electrical charges that repel each other',
        'They consist of giant 3D lattices held by weak electrostatic attractions'
      ],
      correctIndex: 0,
      explanation: 'Boiling simple covalent substances breaks weak intermolecular forces between molecules, not the strong covalent bonds inside them.'
    },
    {
      id: 'cc-c24-3',
      subject: 'chemistry',
      topicCode: 'C2',
      syllabusRef: 'C2.4',
      question: 'Why do simple covalent substances such as pure water or candle wax not conduct electricity?',
      options: [
        'Their molecules are electrically neutral and contain neither free ions nor delocalised electrons',
        'Their ions are locked inside a giant ionic lattice',
        'All valence electrons remain inside the atomic nuclei',
        'Their covalent bonds vibrate too fast for electrons to cross'
      ],
      correctIndex: 0,
      explanation: 'Electrical conduction requires mobile charge carriers (free ions or delocalised electrons), which simple molecules lack.'
    }
  ],

  'C3.1': [
    {
      id: 'cc-c31-1',
      subject: 'chemistry',
      topicCode: 'C3',
      syllabusRef: 'C3.1',
      question: 'What is the correct chemical formula for calcium hydroxide formed from Ca²⁺ ions and OH⁻ ions?',
      options: ['Ca(OH)₂', 'CaOH₂', 'Ca₂OH', 'Ca(OH)'],
      correctIndex: 0,
      explanation: 'One Ca²⁺ (+2) ion balances two OH⁻ (−1) ions, written using brackets as Ca(OH)₂.'
    },
    {
      id: 'cc-c31-2',
      subject: 'chemistry',
      topicCode: 'C3',
      syllabusRef: 'C3.1',
      question: 'What does the state symbol (aq) indicate in a balanced chemical equation?',
      options: [
        'The substance is dissolved in water to form an aqueous solution',
        'The substance is a pure liquid melted by heating',
        'The substance is a colourless gas produced in the flask',
        'The substance is an insoluble solid precipitate'
      ],
      correctIndex: 0,
      explanation: '(s) = solid, (l) = pure liquid, (g) = gas, and (aq) = aqueous (dissolved in water).'
    },
    {
      id: 'cc-c31-3',
      subject: 'chemistry',
      topicCode: 'C3',
      syllabusRef: 'C3.1',
      question: 'In a balanced symbol equation for the combustion of methane: CH₄ + xO₂ → CO₂ + yH₂O, what are the values of x and y?',
      options: ['x = 2, y = 2', 'x = 1, y = 2', 'x = 2, y = 1', 'x = 4, y = 2'],
      correctIndex: 0,
      explanation: 'CH₄ + 2O₂ → CO₂ + 2H₂O balances 1 C, 4 H, and 4 O atoms on both sides.'
    }
  ],

  'C5.1': [
    {
      id: 'cc-c51-1',
      subject: 'chemistry',
      topicCode: 'C5',
      syllabusRef: 'C5.1',
      question: 'When solid ammonium nitrate dissolves in water, the thermometer reading drops from 22°C to 13°C. How is this process classified?',
      options: [
        'Endothermic, because thermal energy is absorbed from the surroundings (solution)',
        'Exothermic, because thermal energy is released into the surroundings',
        'Exothermic, because bonds formed release excess heat',
        'Neutral, because no colour change occurred'
      ],
      correctIndex: 0,
      explanation: 'An endothermic process takes in thermal energy from the surroundings, lowering the measured temperature.'
    },
    {
      id: 'cc-c51-2',
      subject: 'chemistry',
      topicCode: 'C5',
      syllabusRef: 'C5.1',
      question: 'Which statement correctly describes bond breaking and bond making in an exothermic reaction?',
      options: [
        'More energy is released forming new bonds in products than is absorbed breaking bonds in reactants',
        'Bond breaking releases heat while bond forming absorbs heat',
        'Equal amounts of energy are absorbed in bond breaking and released in bond making',
        'Activation energy is zero so no bonds need to break'
      ],
      correctIndex: 0,
      explanation: 'Bond breaking is endothermic; bond making is exothermic. Overall ΔH is negative when bond making releases more energy than bond breaking requires.'
    },
    {
      id: 'cc-c51-3',
      subject: 'chemistry',
      topicCode: 'C5',
      syllabusRef: 'C5.1',
      question: 'What is meant by the term "activation energy" (Eₐ)?',
      options: [
        'The minimum energy colliding reactant particles must possess for a reaction to occur',
        'The total thermal energy released at the end of a combustion reaction',
        'The temperature at which a solid catalyst melts',
        'The energy difference between products and reactants'
      ],
      correctIndex: 0,
      explanation: 'Activation energy is the energy barrier that must be overcome by colliding particles for successful bond breaking and reaction.'
    },
    {
      id: 'cc-c51-4',
      subject: 'chemistry',
      topicCode: 'C5',
      syllabusRef: 'C5.1',
      question: 'In a reaction pathway (energy level) diagram for an exothermic reaction, how does the energy of the products compare with the reactants?',
      options: [
        'Products have less chemical energy than reactants, so ΔH is negative',
        'Products have more chemical energy than reactants, so ΔH is positive',
        'Products and reactants always have identical energy',
        'The activation energy peak lies below the reactants'
      ],
      correctIndex: 0,
      explanation: 'In an exothermic reaction, thermal energy is released to the surroundings, so products sit at a lower energy level than reactants (negative enthalpy change ΔH).'
    },
    {
      id: 'cc-c51-5',
      subject: 'chemistry',
      topicCode: 'C5',
      syllabusRef: 'C5.1',
      question: 'Which reaction is an everyday example of an exothermic process?',
      options: [
        'Combustion of methane fuel in a Bunsen burner',
        'Thermal decomposition of calcium carbonate in a kiln',
        'Photosynthesis in green plant leaves',
        'Electrolysis of molten lead(II) bromide'
      ],
      correctIndex: 0,
      explanation: 'Combustion, neutralisation, and respiration transfer thermal energy to the surroundings and are exothermic.'
    },
    {
      id: 'cc-c51-6',
      subject: 'chemistry',
      topicCode: 'C5',
      syllabusRef: 'C5.1',
      question: 'When calcium carbonate is heated strongly, it undergoes thermal decomposition (CaCO₃ → CaO + CO₂). Why is this reaction endothermic?',
      options: [
        'Continuous thermal energy must be taken in from the surroundings to break chemical bonds',
        'The surroundings become warmer without any external heating',
        'More energy is released making bonds than breaking bonds',
        'The products are at a lower energy level than the reactants'
      ],
      correctIndex: 0,
      explanation: 'Thermal decomposition requires continuous heat input to break bonds in CaCO₃, giving a positive enthalpy change (+ΔH).'
    },
    {
      id: 'cc-c51-7',
      subject: 'chemistry',
      topicCode: 'C5',
      syllabusRef: 'C5.1',
      question: 'On a reaction pathway diagram, which arrow represents the activation energy (Eₐ)?',
      options: [
        'The upward vertical arrow from the reactants energy level to the highest peak (transition state)',
        'The downward vertical arrow from the reactants to the products',
        'The vertical arrow from the products down to zero energy',
        'The horizontal arrow along the reaction progress axis'
      ],
      correctIndex: 0,
      explanation: 'Activation energy Eₐ is always measured from the energy level of the reactants up to the maximum energy peak of the curve.'
    },
    {
      id: 'cc-c51-8',
      subject: 'chemistry',
      topicCode: 'C5',
      syllabusRef: 'C5.1',
      question: 'Hydrochloric acid is added to sodium hydroxide solution in a polystyrene cup. The temperature rises from 21.0°C to 27.5°C. What type of reaction is this?',
      options: [
        'An exothermic neutralisation reaction',
        'An endothermic neutralisation reaction',
        'An endothermic precipitation reaction',
        'A physical change with zero enthalpy change'
      ],
      correctIndex: 0,
      explanation: 'A temperature rise shows thermal energy was transferred from the reaction mixture into the solution, proving neutralisation is exothermic.'
    }
  ],

  'C6.1': [
    {
      id: 'cc-c61-1',
      subject: 'chemistry',
      topicCode: 'C6',
      syllabusRef: 'C6.1',
      question: 'Which process is an example of a physical change rather than a chemical change?',
      options: [
        'Sublimation of solid iodine crystals into purple iodine vapour',
        'Burning magnesium ribbon in air to form white magnesium oxide ash',
        'Reacting dilute hydrochloric acid with zinc granules',
        'Rusting of an iron nail in damp air'
      ],
      correctIndex: 0,
      explanation: 'Change of state (sublimation) is a physical change because no new substance is formed and it is easily reversed by cooling.'
    },
    {
      id: 'cc-c61-2',
      subject: 'chemistry',
      topicCode: 'C6',
      syllabusRef: 'C6.1',
      question: 'Which observation provides strong evidence that a chemical reaction has taken place?',
      options: [
        'A new insoluble solid precipitate or effervescence of a gas is produced with a temperature change',
        'Liquid water freezes into ice crystals below 0°C',
        'Sugar crystals disappear when stirred into warm tea',
        'A copper wire bends when pulled by pliers'
      ],
      correctIndex: 0,
      explanation: 'Formation of a new gas, colour change, precipitate, or irreversible energy change indicates new chemical products.'
    }
  ],

  'C6.2': [
    {
      id: 'cc-c62-1',
      subject: 'chemistry',
      topicCode: 'C6',
      syllabusRef: 'C6.2',
      question: 'Why does crushing marble chips (calcium carbonate) into powder increase the rate of reaction with hydrochloric acid?',
      options: [
        'It increases the exposed surface area, raising the frequency of successful particle collisions',
        'It lowers the activation energy of the reaction like a catalyst',
        'It increases the average kinetic energy of the acid molecules',
        'It raises the concentration of hydrochloric acid'
      ],
      correctIndex: 0,
      explanation: 'Powdered solid exposes far more surface particles to acid particles, increasing collision frequency per second.'
    },
    {
      id: 'cc-c62-2',
      subject: 'chemistry',
      topicCode: 'C6',
      syllabusRef: 'C6.2',
      question: 'How does increasing temperature increase the rate of a chemical reaction according to collision theory?',
      options: [
        'Particles move faster, collide more frequently, and a greater proportion have energy equal to or exceeding the activation energy',
        'Particles double in mass so collisions last longer',
        'The catalyst becomes heavier and attracts reactants',
        'Concentrations increase because liquid volume expands'
      ],
      correctIndex: 0,
      explanation: 'Higher temperature raises kinetic energy -> higher collision frequency AND more collisions exceed Eₐ.'
    }
  ],

  'C6.3': [
    {
      id: 'cc-c63-1',
      subject: 'chemistry',
      topicCode: 'C6',
      syllabusRef: 'C6.3',
      question: 'In the reaction: CuO(s) + H₂(g) → Cu(s) + H₂O(g), which substance is reduced?',
      options: [
        'Copper(II) oxide (CuO), because it loses oxygen',
        'Hydrogen (H₂), because it gains oxygen',
        'Water (H₂O), because it forms as steam',
        'Copper (Cu), because it gains oxygen'
      ],
      correctIndex: 0,
      explanation: 'Reduction is loss of oxygen (or gain of electrons). CuO loses oxygen to form Cu, so CuO is reduced.'
    },
    {
      id: 'cc-c63-2',
      subject: 'chemistry',
      topicCode: 'C6',
      syllabusRef: 'C6.3',
      question: 'Using OIL RIG, what happens during oxidation in terms of electron transfer?',
      options: [
        'Oxidation Is Loss of electrons (e.g. Mg → Mg²⁺ + 2e⁻)',
        'Oxidation Is Gain of electrons',
        'Oxidation Is Gain of protons in the nucleus',
        'Oxidation Is Loss of covalent molecules'
      ],
      correctIndex: 0,
      explanation: 'OIL RIG: Oxidation Is Loss of electrons; Reduction Is Gain of electrons.'
    }
  ],

  'C7.1': [
    {
      id: 'cc-c71-1',
      subject: 'chemistry',
      topicCode: 'C7',
      syllabusRef: 'C7.1',
      question: 'Which ion is responsible for the acidic properties of aqueous acids such as hydrochloric acid?',
      options: ['Hydrogen ion (H⁺)', 'Hydroxide ion (OH⁻)', 'Chloride ion (Cl⁻)', 'Oxide ion (O²⁻)'],
      correctIndex: 0,
      explanation: 'Acids produce excess H⁺(aq) ions in water; alkalis produce excess OH⁻(aq) ions.'
    },
    {
      id: 'cc-c71-2',
      subject: 'chemistry',
      topicCode: 'C7',
      syllabusRef: 'C7.1',
      question: 'What colour does methyl orange indicator turn in a strong alkaline solution such as sodium hydroxide (pH 13)?',
      options: ['Yellow', 'Red', 'Blue', 'Colourless'],
      correctIndex: 0,
      explanation: 'Methyl orange is red in acidic solution, orange at neutral transition, and yellow in alkaline solutions.'
    },
    {
      id: 'cc-c71-3',
      subject: 'chemistry',
      topicCode: 'C7',
      syllabusRef: 'C7.1',
      question: 'What happens when a dilute acid reacts completely with an aqueous alkali during neutralisation?',
      options: [
        'A salt and water are formed, and the ionic equation is H⁺(aq) + OH⁻(aq) → H₂O(l)',
        'Hydrogen gas is always bubbled off alongside a solid precipitate',
        'Carbon dioxide gas turns limewater milky',
        'The pH decreases from 7 down to 1'
      ],
      correctIndex: 0,
      explanation: 'Acid + Alkali → Salt + Water. In ionic terms, H⁺ + OH⁻ → H₂O.'
    }
  ],

  'C7.2': [
    {
      id: 'cc-c72-1',
      subject: 'chemistry',
      topicCode: 'C7',
      syllabusRef: 'C7.2',
      question: 'How are non-metal oxides such as sulfur dioxide (SO₂) and carbon dioxide (CO₂) generally classified?',
      options: [
        'Acidic oxides, because they react with alkalis to form a salt and water',
        'Basic oxides, because they turn red litmus paper blue',
        'Amphoteric oxides, because they react only with water',
        'Metallic oxides, because they conduct electricity when solid'
      ],
      correctIndex: 0,
      explanation: 'Non-metal oxides are generally acidic oxides (CO₂, SO₂, NO₂), whereas metal oxides (e.g. CuO, MgO) are basic oxides.'
    },
    {
      id: 'cc-c72-2',
      subject: 'chemistry',
      topicCode: 'C7',
      syllabusRef: 'C7.2',
      question: 'Which pair of oxides are amphoteric (reacting with BOTH acids and alkalis to form a salt and water)?',
      options: [
        'Aluminium oxide (Al₂O₃) and zinc oxide (ZnO)',
        'Calcium oxide (CaO) and magnesium oxide (MgO)',
        'Carbon dioxide (CO₂) and sulfur dioxide (SO₂)',
        'Sodium oxide (Na₂O) and potassium oxide (K₂O)'
      ],
      correctIndex: 0,
      explanation: 'In Cambridge 0653, Al₂O₃ and ZnO are the classic examples of amphoteric oxides.'
    },
    {
      id: 'cc-c72-3',
      subject: 'chemistry',
      topicCode: 'C7',
      syllabusRef: 'C7.2',
      question: 'Which gas is produced when solid copper(II) oxide (CuO) is warmed gently with dilute sulfuric acid?',
      options: [
        'No gas is produced; a blue solution of copper(II) sulfate and water are formed',
        'Hydrogen gas, which burns with a squeaky pop',
        'Carbon dioxide gas, which turns limewater milky',
        'Oxygen gas, which relights a glowing splint'
      ],
      correctIndex: 0,
      explanation: 'Metal oxide + Acid → Salt + Water (no gas is released unless a metal or carbonate reacts).'
    }
  ],

  'C7.3': [
    {
      id: 'cc-c73-1',
      subject: 'chemistry',
      topicCode: 'C7',
      syllabusRef: 'C7.3',
      question: 'Why is an excess of insoluble copper(II) oxide added to warm dilute sulfuric acid when preparing pure dry copper(II) sulfate crystals?',
      options: [
        'To ensure all the acid reacts completely, after which the excess unreacted solid is easily removed by filtration',
        'To increase the temperature of the acid above its boiling point',
        'Because copper(II) oxide dissolves completely in pure cold water',
        'To ensure concentrated sulfuric acid remains mixed with the crystals'
      ],
      correctIndex: 0,
      explanation: 'Using excess insoluble base neutralises all acid; the excess solid is filtered off, leaving a pure salt solution to crystallise.'
    },
    {
      id: 'cc-c73-2',
      subject: 'chemistry',
      topicCode: 'C7',
      syllabusRef: 'C7.3',
      question: 'Which technique is used to crystallise soluble copper(II) sulfate from its pure aqueous filtrate?',
      options: [
        'Heat to evaporate some water until crystallisation point, leave to cool slowly, filter crystals and pat dry with filter paper',
        'Boil the filtrate completely to dryness over a roaring blue Bunsen flame',
        'Add silver nitrate solution and collect the white precipitate',
        'Cool the solution in dry ice before adding hydrochloric acid'
      ],
      correctIndex: 0,
      explanation: 'Heating to saturation point then cooling allows hydrated crystals to grow cleanly without decomposing them.'
    },
    {
      id: 'cc-c73-3',
      subject: 'chemistry',
      topicCode: 'C7',
      syllabusRef: 'C7.3',
      question: 'Which pair of reactants can be used safely to prepare soluble zinc chloride crystals in the laboratory?',
      options: [
        'Zinc carbonate + dilute hydrochloric acid',
        'Zinc metal + dilute sulfuric acid',
        'Copper metal + dilute hydrochloric acid',
        'Zinc sulfate + sodium nitrate'
      ],
      correctIndex: 0,
      explanation: 'Zinc carbonate reacts with HCl to form soluble ZnCl₂, H₂O, and CO₂ gas. Copper is unreactive with dilute acids.'
    }
  ],

  'C8.1': [
    {
      id: 'cc-c81-1',
      subject: 'chemistry',
      topicCode: 'C8',
      syllabusRef: 'C8.1',
      question: 'In the modern Periodic Table, in what order are the elements arranged from left to right?',
      options: [
        'In order of increasing proton (atomic) number',
        'In order of increasing relative atomic mass only',
        'In alphabetical order by chemical symbol',
        'In order of decreasing melting point'
      ],
      correctIndex: 0,
      explanation: 'Elements are ordered by increasing proton number; elements with the same number of outer-shell electrons sit in the same vertical group.'
    },
    {
      id: 'cc-c81-2',
      subject: 'chemistry',
      topicCode: 'C8',
      syllabusRef: 'C8.1',
      question: 'Where are metallic elements located in the Periodic Table compared to non-metallic elements?',
      options: [
        'Metals are on the left and in the centre; non-metals are towards the right and top-right',
        'Metals are exclusively in Group VIII; non-metals are in Group I',
        'Metals occupy Period 1 only; non-metals occupy Period 7 only',
        'Metals and non-metals alternate in every single column'
      ],
      correctIndex: 0,
      explanation: 'As you move left to right across a period, elements change from metallic character to non-metallic character.'
    },
    {
      id: 'cc-c81-3',
      subject: 'chemistry',
      topicCode: 'C8',
      syllabusRef: 'C8.1',
      question: 'Why do elements in the same vertical group of the Periodic Table share similar chemical properties?',
      options: [
        'They have the same number of electrons in their outermost (valence) shell',
        'They have the same total number of occupied electron shells',
        'They all share the exact same nucleon number',
        'They all exist in the same physical state at 25°C'
      ],
      correctIndex: 0,
      explanation: 'Chemical reactivity depends mainly on outer-shell (valence) electrons, which match the group number for Groups I–VII.'
    }
  ],

  'C8.2': [
    {
      id: 'cc-c82-1',
      subject: 'chemistry',
      topicCode: 'C8',
      syllabusRef: 'C8.2',
      question: 'Which trend occurs down Group I (from lithium to sodium to potassium)?',
      options: [
        'Metals become softer, melting points decrease, and reactivity with water increases',
        'Melting points increase and reactivity with water decreases',
        'Density increases continuously and the metals stop reacting with cold water',
        'Metals become harder and form covalent chlorides'
      ],
      correctIndex: 0,
      explanation: 'Down Group I, the outer electron is further from the nucleus and more easily lost, increasing reactivity while melting point decreases.'
    },
    {
      id: 'cc-c82-2',
      subject: 'chemistry',
      topicCode: 'C8',
      syllabusRef: 'C8.2',
      question: 'What are the two products when sodium metal reacts with cold water?',
      options: [
        'Aqueous sodium hydroxide and hydrogen gas',
        'Sodium oxide precipitate and oxygen gas',
        'Sodium hydride and carbon dioxide',
        'Sodium metal hydroxide and steam only'
      ],
      correctIndex: 0,
      explanation: '2Na(s) + 2H₂O(l) → 2NaOH(aq) + H₂(g). The alkaline NaOH solution turns universal indicator purple/blue.'
    }
  ],

  'C8.3': [
    {
      id: 'cc-c83-1',
      subject: 'chemistry',
      topicCode: 'C8',
      syllabusRef: 'C8.3',
      question: 'Which statement correctly describes the physical state and colour of halogens at room temperature?',
      options: [
        'Chlorine is a pale yellow-green gas, bromine is a red-brown liquid, and iodine is a grey-black solid',
        'Chlorine is a colourless liquid, bromine is a yellow solid, and iodine is a violet gas',
        'All halogens are gases at room temperature and pressure',
        'Bromine is a green gas and chlorine is a brown liquid'
      ],
      correctIndex: 0,
      explanation: 'Down Group VII, melting/boiling points increase and colours become darker: Cl₂ (yellow-green gas), Br₂ (red-brown liquid), I₂ (grey-black solid).'
    },
    {
      id: 'cc-c83-2',
      subject: 'chemistry',
      topicCode: 'C8',
      syllabusRef: 'C8.3',
      question: 'What is observed when aqueous chlorine is added to colourless aqueous potassium bromide?',
      options: [
        'The solution turns orange-brown because the more reactive chlorine displaces bromine',
        'A silver grey solid precipitates out immediately',
        'No reaction occurs because bromine is more reactive than chlorine',
        'Bubbles of chlorine dioxide ignite on contact with water'
      ],
      correctIndex: 0,
      explanation: 'Cl₂(aq) + 2KBr(aq) → 2KCl(aq) + Br₂(aq). Reactivity decreases down Group VII, so chlorine displaces bromine.'
    }
  ],

  'C8.4': [
    {
      id: 'cc-c84-1',
      subject: 'chemistry',
      topicCode: 'C8',
      syllabusRef: 'C8.4',
      question: 'Which set of properties is typical of transition elements (such as iron and copper) compared to Group I metals?',
      options: [
        'High density, high melting points, form coloured compounds, and often act as catalysts',
        'Low density (float on water), low melting points, and form white compounds only',
        'Exist only as colourless monatomic gases',
        'React explosively with cold water to release hydrogen'
      ],
      correctIndex: 0,
      explanation: 'Transition metals have high densities and melting points, variable oxidation states, coloured compounds, and catalytic properties (e.g. Fe in Haber process).'
    },
    {
      id: 'cc-c84-2',
      subject: 'chemistry',
      topicCode: 'C8',
      syllabusRef: 'C8.4',
      question: 'Which property explains why compounds of copper (such as CuSO₄·5H₂O) are blue while sodium chloride (NaCl) is white?',
      options: [
        'Copper is a transition element, and transition elements typically form coloured compounds',
        'Sodium forms giant covalent lattices that reflect all visible wavelengths',
        'Copper(II) sulfate contains nitrogen atoms from air',
        'All compounds of Group I metals absorb red light'
      ],
      correctIndex: 0,
      explanation: 'Forming coloured compounds (e.g. blue Cu²⁺, green Fe²⁺, orange-brown Fe³⁺) is a hallmark of transition elements.'
    },
    {
      id: 'cc-c84-3',
      subject: 'chemistry',
      topicCode: 'C8',
      syllabusRef: 'C8.4',
      question: 'Which transition metal acts as an industrial catalyst in the manufacture of ammonia (Haber process)?',
      options: ['Iron', 'Sodium', 'Aluminium', 'Calcium'],
      correctIndex: 0,
      explanation: 'Finely divided iron catalysts speed up the synthesis of ammonia without being consumed.'
    }
  ],

  'C8.5': [
    {
      id: 'cc-c85-1',
      subject: 'chemistry',
      topicCode: 'C8',
      syllabusRef: 'C8.5',
      question: 'Why are Group VIII noble gases (helium, neon, argon) chemically unreactive and monatomic?',
      options: [
        'Their atoms already have a full outermost electron shell, so they do not easily gain, lose, or share electrons',
        'Their nuclei contain zero neutrons',
        'They form strong triple covalent bonds between identical atoms',
        'They are too dense to collide with oxygen molecules'
      ],
      correctIndex: 0,
      explanation: 'Helium has 2 outer electrons and neon/argon have 8 (full valence shells), making noble gases inert monatomic gases.'
    },
    {
      id: 'cc-c85-2',
      subject: 'chemistry',
      topicCode: 'C8',
      syllabusRef: 'C8.5',
      question: 'Why is argon used inside filament light bulbs and during arc welding of reactive metals?',
      options: [
        'It provides an inert atmosphere that prevents the hot metal filament or weld from reacting with oxygen',
        'It reacts exothermically with tungsten to brighten the filament',
        'It is the lightest gas in the Periodic Table and floats the bulb',
        'It converts electrical current directly into ultraviolet light'
      ],
      correctIndex: 0,
      explanation: 'Argon’s unreactive nature protects hot metals from oxidation.'
    },
    {
      id: 'cc-c85-3',
      subject: 'chemistry',
      topicCode: 'C8',
      syllabusRef: 'C8.5',
      question: 'Why is helium preferred over hydrogen for filling weather balloons and airships?',
      options: [
        'Helium has low density AND is non-flammable (inert), whereas hydrogen is highly explosive',
        'Helium has a higher density than air',
        'Helium condenses into a liquid inside balloons at room temperature',
        'Hydrogen reacts with nitrogen in cold high-altitude air'
      ],
      correctIndex: 0,
      explanation: 'Helium’s low density provides buoyancy without the fire/explosion hazard of flammable hydrogen.'
    }
  ],

  'C9.1': [
    {
      id: 'cc-c91-1',
      subject: 'chemistry',
      topicCode: 'C9',
      syllabusRef: 'C9.1',
      question: 'Which physical properties distinguish typical metals from solid non-metals?',
      options: [
        'Good thermal and electrical conductivity, malleability, ductility, and shiny lustre',
        'Brittle when hammered, poor electrical conductors, and always low melting points',
        'Dull surface, insulating solids, and gaseous below 100°C',
        'Insoluble lattices that conduct only when dissolved in water'
      ],
      correctIndex: 0,
      explanation: 'Metals are malleable, ductile, lustrous, and good conductors of heat and electricity due to delocalised electrons and metallic bonding.'
    },
    {
      id: 'cc-c91-2',
      subject: 'chemistry',
      topicCode: 'C9',
      syllabusRef: 'C9.1',
      question: 'What happens when magnesium reacts with dilute hydrochloric acid?',
      options: [
        'Magnesium dissolves rapidly with effervescence to form aqueous magnesium chloride and hydrogen gas',
        'A brown layer of copper precipitates on the magnesium',
        'Oxygen gas is given off and relights a glowing splint',
        'No visible change takes place unless heated to 400°C'
      ],
      correctIndex: 0,
      explanation: 'Metal + dilute acid → Salt + Hydrogen gas: Mg + 2HCl → MgCl₂ + H₂.'
    },
    {
      id: 'cc-c91-3',
      subject: 'chemistry',
      topicCode: 'C9',
      syllabusRef: 'C9.1',
      question: 'Why does copper NOT react with dilute sulfuric acid?',
      options: [
        'Copper is less reactive than hydrogen in the reactivity series',
        'Copper forms an explosive oxide layer immediately in acid',
        'Sulfuric acid only reacts with non-metals',
        'Copper has a melting point too high for acid contact'
      ],
      correctIndex: 0,
      explanation: 'Metals below hydrogen in the reactivity series (copper, silver, gold) cannot displace H⁺ ions from dilute acids.'
    }
  ],

  'C9.2': [
    {
      id: 'cc-c92-1',
      subject: 'chemistry',
      topicCode: 'C9',
      syllabusRef: 'C9.2',
      question: 'Which two properties explain why aluminium is used to manufacture aircraft bodies?',
      options: [
        'Low density (lightweight) and resistance to corrosion due to its protective oxide layer',
        'Highest density of all metals and high magnetic attraction',
        'Reacts rapidly with rainwater to produce protective hydrogen gas',
        'Extreme brittleness and low electrical conductivity'
      ],
      correctIndex: 0,
      explanation: 'Aluminium is lightweight (low density) and naturally corrosion-resistant due to a thin, impermeable Al₂O₃ surface coating.'
    },
    {
      id: 'cc-c92-2',
      subject: 'chemistry',
      topicCode: 'C9',
      syllabusRef: 'C9.2',
      question: 'Why is aluminium chosen for overhead high-voltage electrical power cables (often with a steel core)?',
      options: [
        'Good electrical conductivity, low density (lightweight), and resistance to corrosion',
        'It has the lowest melting point of all engineering metals',
        'It glows brightly when carrying alternating current',
        'It reacts with nitrogen in the air to insulate the cable'
      ],
      correctIndex: 0,
      explanation: 'Overhead cables require high conductivity, low weight (so pylons support long spans), and corrosion resistance.'
    },
    {
      id: 'cc-c92-3',
      subject: 'chemistry',
      topicCode: 'C9',
      syllabusRef: 'C9.2',
      question: 'Why is copper widely used in household electrical wiring?',
      options: [
        'Very high electrical conductivity and high ductility (easily drawn into thin wires)',
        'Extremely low melting point and bright silver colour',
        'Reacts vigorously with plastic insulation',
        'Lowest density of all structural metals'
      ],
      correctIndex: 0,
      explanation: 'Copper is an exceptional conductor of electricity and is ductile enough to draw into wires.'
    },
    {
      id: 'cc-c92-4',
      subject: 'chemistry',
      topicCode: 'C9',
      syllabusRef: 'C9.2',
      question: 'Why is aluminium safe to use for food containers and drink cans despite being high in the reactivity series?',
      options: [
        'An unreactive, tightly adhering surface layer of aluminium oxide (Al₂O₃) protects the underlying metal from acid attack',
        'Aluminium sits below gold in the reactivity series',
        'All food cans are lined internally with molten sodium',
        'Aluminium reacts with acidic drinks to neutralise them completely'
      ],
      correctIndex: 0,
      explanation: 'Aluminium quickly forms a tough, impermeable oxide coat that prevents corrosion by water and mild food acids.'
    }
  ],

  'C9.3': [
    {
      id: 'cc-c93-1',
      subject: 'chemistry',
      topicCode: 'C9',
      syllabusRef: 'C9.3',
      question: 'What is the definition of an alloy, and why is brass (copper + zinc) harder than pure copper?',
      options: [
        'An alloy is a mixture of a metal with other elements; differently sized atoms disrupt regular layers so layers cannot slide easily',
        'An alloy is a pure ionic compound whose covalent bonds resist bending',
        'Alloys soften metals by removing all metallic bonds',
        'Zinc atoms evaporate from brass leaving hollow crystals'
      ],
      correctIndex: 0,
      explanation: 'Different atomic radii distort the regular metallic lattice, blocking layers of cations from sliding over each other under force.'
    },
    {
      id: 'cc-c93-2',
      subject: 'chemistry',
      topicCode: 'C9',
      syllabusRef: 'C9.3',
      question: 'Stainless steel is an alloy made by mixing iron with chromium and nickel. Which major advantage does it provide for surgical instruments and cutlery?',
      options: [
        'High hardness combined with strong resistance to rusting and corrosion',
        'Lower melting point than pure liquid mercury',
        'Ability to dissolve easily in dilute kitchen vinegar',
        'Zero density so instruments float in water'
      ],
      correctIndex: 0,
      explanation: 'Chromium and nickel prevent rusting and strengthen steel, making stainless steel ideal for cutlery and medical tools.'
    }
  ],

  'C9.4': [
    {
      id: 'cc-c94-1',
      subject: 'chemistry',
      topicCode: 'C9',
      syllabusRef: 'C9.4',
      question: 'Four metals W, X, Y, Z are tested: X displaces W from WSO₄, Y reacts rapidly with cold water, and Z does not react with steam or dilute HCl. What is the order from MOST to LEAST reactive?',
      options: ['Y > X > W > Z', 'Z > W > X > Y', 'X > Y > Z > W', 'W > X > Y > Z'],
      correctIndex: 0,
      explanation: 'Reacting with cold water (Y) indicates highest reactivity; X > W via displacement; Z unreactive with acid is lowest.'
    },
    {
      id: 'cc-c94-2',
      subject: 'chemistry',
      topicCode: 'C9',
      syllabusRef: 'C9.4',
      question: 'What is observed when a clean iron nail is placed into blue aqueous copper(II) sulfate solution?',
      options: [
        'A pink-brown layer of copper coats the nail and the blue solution fades to pale green',
        'Silvery iron crystals dissolve into a colourless gas',
        'No reaction occurs because copper is more reactive than iron',
        'The solution turns dark purple immediately'
      ],
      correctIndex: 0,
      explanation: 'Iron is more reactive than copper and displaces Cu²⁺ ions: Fe(s) + CuSO₄(aq) → FeSO₄(aq) (pale green) + Cu(s).'
    }
  ],

  'C9.5': [
    {
      id: 'cc-c95-1',
      subject: 'chemistry',
      topicCode: 'C9',
      syllabusRef: 'C9.5',
      question: 'Which two substances are BOTH essential for iron to rust?',
      options: ['Water and oxygen', 'Water and nitrogen', 'Dry carbon dioxide and oil', 'Oxygen and anhydrous calcium chloride'],
      correctIndex: 0,
      explanation: 'Rusting is the oxidation of iron forming hydrated iron(III) oxide, requiring both water (moisture) and oxygen.'
    },
    {
      id: 'cc-c95-2',
      subject: 'chemistry',
      topicCode: 'C9',
      syllabusRef: 'C9.5',
      question: 'How does coating iron with zinc (galvanising) protect an iron sheet even if the zinc coating is scratched?',
      options: [
        'Sacrificial protection: zinc is more reactive than iron so zinc oxidises preferentially instead of the iron',
        'Zinc melts into the scratch to seal it chemically',
        'Zinc neutralises oxygen gas before it touches the iron',
        'Iron absorbs zinc atoms to turn into stainless steel'
      ],
      correctIndex: 0,
      explanation: 'Because zinc is above iron in the reactivity series, it loses electrons first and protects exposed iron sacrificially.'
    },
    {
      id: 'cc-c95-3',
      subject: 'chemistry',
      topicCode: 'C9',
      syllabusRef: 'C9.5',
      question: 'In a test tube experiment, why is an iron nail placed with boiled distilled water covered by a layer of oil?',
      options: [
        'Boiling drives out dissolved oxygen and the oil layer prevents atmospheric oxygen re-dissolving',
        'Oil supplies extra oxygen directly to the iron surface',
        'Boiled water acts as a catalyst to speed up rusting',
        'Oil dissolves the iron nail slowly over 24 hours'
      ],
      correctIndex: 0,
      explanation: 'With water present but zero oxygen, the iron nail will not rust, proving oxygen is necessary.'
    }
  ],

  'C9.6': [
    {
      id: 'cc-c96-1',
      subject: 'chemistry',
      topicCode: 'C9',
      syllabusRef: 'C9.6',
      question: 'In the blast furnace extraction of iron from hematite (Fe₂O₃), which substance acts as the main reducing agent converting iron(III) oxide into molten iron?',
      options: ['Carbon monoxide (CO)', 'Limestone (CaCO₃)', 'Molten slag (CaSiO₃)', 'Nitrogen gas (N₂)'],
      correctIndex: 0,
      explanation: 'Fe₂O₃(s) + 3CO(g) → 2Fe(l) + 3CO₂(g). Carbon monoxide reduces iron(III) oxide to iron.'
    },
    {
      id: 'cc-c96-2',
      subject: 'chemistry',
      topicCode: 'C9',
      syllabusRef: 'C9.6',
      question: 'What is the purpose of adding limestone (calcium carbonate) to the blast furnace?',
      options: [
        'It thermally decomposes into calcium oxide (CaO), which reacts with acidic silicon dioxide impurities to form molten slag',
        'It acts as a catalyst to lower the melting point of hematite',
        'It dissolves pure iron into an aqueous solution',
        'It supplies extra nitrogen gas to cool the furnace'
      ],
      correctIndex: 0,
      explanation: 'CaCO₃ → CaO + CO₂; then CaO + SiO₂ → CaSiO₃ (molten slag), removing sandy silicon dioxide impurities.'
    },
    {
      id: 'cc-c96-3',
      subject: 'chemistry',
      topicCode: 'C9',
      syllabusRef: 'C9.6',
      question: 'Why must aluminium be extracted from purified bauxite (Al₂O₃) by electrolysis rather than heating with carbon?',
      options: [
        'Aluminium is more reactive than carbon, so carbon cannot reduce aluminium oxide',
        'Aluminium has a higher density than molten slag',
        'Carbon reacts explosively with cryolite at 950°C',
        'Aluminium oxide dissolves readily in cold rainwater'
      ],
      correctIndex: 0,
      explanation: 'Metals above carbon in the reactivity series (K, Na, Ca, Mg, Al) are extracted by electrolysis of molten compounds.'
    }
  ],

  'C10.1': [
    {
      id: 'cc-c101-1',
      subject: 'chemistry',
      topicCode: 'C10',
      syllabusRef: 'C10.1',
      question: 'What colour change is observed when water is added to white anhydrous copper(II) sulfate?',
      options: ['White to blue', 'Blue to pink', 'Pink to blue', 'Orange to green'],
      correctIndex: 0,
      explanation: 'Chemical test for water: anhydrous CuSO₄ turns white → blue; dry cobalt(II) chloride paper turns blue → pink.'
    },
    {
      id: 'cc-c101-2',
      subject: 'chemistry',
      topicCode: 'C10',
      syllabusRef: 'C10.1',
      question: 'How can a chemist verify that a clear sample of water is pure water (not a salt solution)?',
      options: [
        'Measure its boiling point and melting point: pure water boils sharply at 100°C and freezes at 0°C at standard pressure',
        'Test it with universal indicator paper to see if it turns green',
        'Bubble carbon dioxide through it to check for milkiness',
        'Add anhydrous copper(II) sulfate and check if it turns blue'
      ],
      correctIndex: 0,
      explanation: 'Chemical tests (CuSO₄ / CoCl₂) only detect the presence of water; purity is confirmed by sharp melting (0°C) and boiling (100°C) points.'
    },
    {
      id: 'cc-c101-3',
      subject: 'chemistry',
      topicCode: 'C10',
      syllabusRef: 'C10.1',
      question: 'Why are sedimentation/filtration, activated carbon, and chlorination used in domestic water treatment?',
      options: [
        'Filtration removes insoluble solids, carbon removes tastes/odours, and chlorination kills harmful microbes',
        'Chlorination increases water hardness by adding calcium ions',
        'Carbon converts toxic nitrates into oxygen gas',
        'Filtration lowers the boiling point of water to 80°C'
      ],
      correctIndex: 0,
      explanation: 'Sedimentation/filtration remove suspended particles, carbon adsorbs organic odours/tastes, and chlorine disinfects microbes.'
    }
  ],

  'C10.2': [
    {
      id: 'cc-c102-1',
      subject: 'chemistry',
      topicCode: 'C10',
      syllabusRef: 'C10.2',
      question: 'What are the approximate percentage compositions of nitrogen and oxygen in clean, dry air?',
      options: ['78% nitrogen and 21% oxygen', '50% nitrogen and 49% oxygen', '78% oxygen and 21% nitrogen', '90% nitrogen and 9% carbon dioxide'],
      correctIndex: 0,
      explanation: 'Clean, dry air consists of approximately 78% nitrogen, 21% oxygen, and ~1% noble gases (mainly argon) + ~0.04% CO₂.'
    },
    {
      id: 'cc-c102-2',
      subject: 'chemistry',
      topicCode: 'C10',
      syllabusRef: 'C10.2',
      question: 'How do greenhouse gases such as carbon dioxide and methane contribute to global warming?',
      options: [
        'They absorb thermal (infrared) energy emitted by Earth’s surface and re-emit it, reducing heat loss to space',
        'They reflect incoming ultraviolet light away from Earth’s surface',
        'They destroy oxygen molecules inside the lower troposphere',
        'They generate exothermic heat directly when exposed to moonlight'
      ],
      correctIndex: 0,
      explanation: 'Greenhouse gases trap outgoing long-wavelength thermal/infrared radiation, warming the atmosphere.'
    },
    {
      id: 'cc-c102-3',
      subject: 'chemistry',
      topicCode: 'C10',
      syllabusRef: 'C10.2',
      question: 'Which reaction occurs inside a car’s catalytic converter to reduce toxic exhaust emissions?',
      options: [
        '2CO + 2NO → 2CO₂ + N₂',
        'CO₂ + N₂ → 2CO + 2NO',
        'CH₄ + 2O₂ → CO + 2H₂',
        'SO₂ + H₂O → H₂SO₃'
      ],
      correctIndex: 0,
      explanation: 'Catalytic converters convert toxic carbon monoxide and nitrogen oxides into less harmful carbon dioxide and nitrogen gas.'
    }
  ],

  'C11.1': [
    {
      id: 'cc-c111-1',
      subject: 'chemistry',
      topicCode: 'C11',
      syllabusRef: 'C11.1',
      question: 'What defines a "homologous series" in organic chemistry?',
      options: [
        'A family of organic compounds with the same functional group, the same general formula, and similar chemical properties',
        'A mixture of hydrocarbons separated strictly by filtration',
        'Isomers that all share identical physical boiling points',
        'Inorganic ionic salts containing only carbon and nitrogen'
      ],
      correctIndex: 0,
      explanation: 'Members of a homologous series share the same functional group and general formula, differing from each consecutive member by –CH₂–.'
    },
    {
      id: 'cc-c111-2',
      subject: 'chemistry',
      topicCode: 'C11',
      syllabusRef: 'C11.1',
      question: 'Which term correctly describes a "saturated" hydrocarbon?',
      options: [
        'A molecule containing carbon and hydrogen atoms only, with all carbon–carbon bonds being single covalent bonds',
        'A hydrocarbon containing at least one C=C double covalent bond',
        'A hydrocarbon fully dissolved in aqueous sodium hydroxide',
        'A compound containing oxygen and hydroxide functional groups'
      ],
      correctIndex: 0,
      explanation: 'Saturated organic compounds (alkanes) contain only C–C single bonds; unsaturated molecules (alkenes) contain C=C double bonds.'
    },
    {
      id: 'cc-c111-3',
      subject: 'chemistry',
      topicCode: 'C11',
      syllabusRef: 'C11.1',
      question: 'What does the term "hydrocarbon" strictly mean?',
      options: [
        'A compound made up of hydrogen and carbon atoms only',
        'Any compound dissolved in water containing dissolved carbon dioxide',
        'An organic alcohol containing –OH groups',
        'Any fossil fuel containing sulfur and nitrogen impurities'
      ],
      correctIndex: 0,
      explanation: 'Hydrocarbons consist strictly of hydrogen and carbon atoms (e.g. alkanes and alkenes).'
    }
  ],

  'C11.2': [
    {
      id: 'cc-c112-1',
      subject: 'chemistry',
      topicCode: 'C11',
      syllabusRef: 'C11.2',
      question: 'Why can petroleum (crude oil) be separated into fractions such as refinery gas, petrol, and bitumen using fractional distillation?',
      options: [
        'Hydrocarbons in the different fractions have different boiling point ranges based on chain length',
        'Longer hydrocarbon chains are magnetic and attracted to the top of the tower',
        'Fractions react chemically with steam inside the fractionating column',
        'Smaller hydrocarbon molecules have much higher boiling points than bitumen'
      ],
      correctIndex: 0,
      explanation: 'Longer chains have stronger intermolecular forces and higher boiling points, condensing lower in the hot column.'
    },
    {
      id: 'cc-c112-2',
      subject: 'chemistry',
      topicCode: 'C11',
      syllabusRef: 'C11.2',
      question: 'How do viscosity and flammability change as hydrocarbon chain length increases from petrol to diesel to bitumen?',
      options: [
        'Viscosity increases (thicker), boiling point increases, and flammability decreases',
        'Viscosity decreases and volatility increases',
        'Boiling point decreases and flame becomes smokeless blue',
        'Molecules become lighter gases at room temperature'
      ],
      correctIndex: 0,
      explanation: 'Longer-chain hydrocarbons are thicker (more viscous), less volatile, less flammable, and have higher boiling points.'
    }
  ],

  'C11.3': [
    {
      id: 'cc-c113-1',
      subject: 'chemistry',
      topicCode: 'C11',
      syllabusRef: 'C11.3',
      question: 'What is the general formula of the alkane homologous series, and what are the products of complete combustion of an alkane?',
      options: [
        'General formula CₙH₂ₙ₊₂; complete combustion forms carbon dioxide and water',
        'General formula CₙH₂ₙ; complete combustion forms carbon monoxide and hydrogen',
        'General formula CₙH₂ₙ₊₂; complete combustion forms soot and hydrogen only',
        'General formula CₙH₂ₙ₋₂; complete combustion forms carbon dioxide and oxygen'
      ],
      correctIndex: 0,
      explanation: 'Alkanes follow CₙH₂ₙ₊₂ (e.g. CH₄, C₂H₆) and undergo complete combustion in plentiful oxygen to form CO₂ and H₂O.'
    },
    {
      id: 'cc-c113-2',
      subject: 'chemistry',
      topicCode: 'C11',
      syllabusRef: 'C11.3',
      question: 'Why are alkanes generally unreactive towards aqueous reagents such as bromine water in the dark?',
      options: [
        'All carbon atoms are joined by strong single covalent bonds with no C=C double bond available for addition',
        'Alkanes have full ionic shells like noble gases',
        'Alkanes float on bromine water because they are denser',
        'Alkanes decompose before touching aqueous solutions'
      ],
      correctIndex: 0,
      explanation: 'Being saturated (single bonds only), alkanes do not undergo addition reactions with bromine water.'
    }
  ],

  'C11.4': [
    {
      id: 'cc-c114-1',
      subject: 'chemistry',
      topicCode: 'C11',
      syllabusRef: 'C11.4',
      question: 'What colour change occurs when ethene gas is bubbled through orange-brown aqueous bromine (bromine water)?',
      options: [
        'Orange-brown bromine water turns colourless rapidly due to an addition reaction across the C=C double bond',
        'Bromine water turns dark green with an alkaline precipitate',
        'No colour change occurs at room temperature',
        'A black solid deposit of pure carbon settles out'
      ],
      correctIndex: 0,
      explanation: 'Decolourising bromine water (orange → colourless) is the diagnostic test for an unsaturated alkene (C=C double bond).'
    },
    {
      id: 'cc-c114-2',
      subject: 'chemistry',
      topicCode: 'C11',
      syllabusRef: 'C11.4',
      question: 'When decane (C₁₀H₂₂) is cracked over a hot catalyst, it produces octane (C₈H₁₈) and one other molecule. What is the other product?',
      options: ['Ethene (C₂H₄)', 'Ethane (C₂H₆)', 'Methane (CH₄)', 'Propene (C₃H₆)'],
      correctIndex: 0,
      explanation: 'Conservation of atoms in cracking: C₁₀H₂₂ → C₈H₁₈ + C₂H₄ (ethene).'
    }
  ],

  'C11.5': [
    {
      id: 'cc-c115-1',
      subject: 'chemistry',
      topicCode: 'C11',
      syllabusRef: 'C11.5',
      question: 'What happens to ethene monomers (CH₂=CH₂) when they undergo addition polymerisation to form poly(ethene)?',
      options: [
        'Many small alkene monomer molecules join together as their C=C double bonds open into single C–C bonds forming one long polymer chain',
        'Ethene monomers react with water to release toxic hydrogen chloride gas',
        'Long polymer chains are broken down by heat into small monomers',
        'Covalent bonds break completely to form gaseous carbon and hydrogen'
      ],
      correctIndex: 0,
      explanation: 'In addition polymerisation, unsaturated monomers join end-to-end with no small molecule lost, forming a saturated polymer chain.'
    },
    {
      id: 'cc-c115-2',
      subject: 'chemistry',
      topicCode: 'C11',
      syllabusRef: 'C11.5',
      question: 'Why do synthetic plastics such as poly(ethene) accumulate in landfill sites and oceans for decades?',
      options: [
        'Their strong carbon–carbon single bonds make them non-biodegradable and resistant to microbial enzymes',
        'They dissolve immediately in rainwater and contaminate underground rocks',
        'They evaporate rapidly into the stratosphere',
        'They react vigorously with sea salt to multiply in mass'
      ],
      correctIndex: 0,
      explanation: 'Non-biodegradable synthetic polymers persist in the environment because bacteria cannot easily break their long saturated chains.'
    },
    {
      id: 'cc-c115-3',
      subject: 'chemistry',
      topicCode: 'C11',
      syllabusRef: 'C11.5',
      question: 'Which statement correctly distinguishes a monomer from a polymer?',
      options: [
        'A monomer is a small reactive molecule; a polymer is a giant long-chain molecule built from many repeating monomer units',
        'A polymer is a single gas molecule; a monomer is a crystal lattice of ions',
        'Monomers are always metals; polymers are always noble gases',
        'Polymers have much lower molecular mass than their monomers'
      ],
      correctIndex: 0,
      explanation: 'Polymers ("many parts") are macromolecules formed by joining thousands of small monomer units together.'
    }
  ],

  'C12.1': [
    {
      id: 'cc-c121-1',
      subject: 'chemistry',
      topicCode: 'C12',
      syllabusRef: 'C12.1',
      question: 'Which piece of apparatus measures an exact fixed volume (such as 25.0 cm³) of aqueous alkali most accurately for a titration?',
      options: ['A volumetric pipette (with safety filler)', 'A 100 cm³ glass beaker', 'A measuring cylinder', 'A conical flask'],
      correctIndex: 0,
      explanation: 'A volumetric pipette measures one exact volume (e.g. 25.0 cm³) to high precision; a burette measures variable volumes to ±0.05 cm³.'
    },
    {
      id: 'cc-c121-2',
      subject: 'chemistry',
      topicCode: 'C12',
      syllabusRef: 'C12.1',
      question: 'Which gas collection method is suitable for dry ammonia gas (NH₃), which is soluble in water and LESS dense than air?',
      options: [
        'Upward delivery (into an inverted gas jar)',
        'Collection over water in a trough',
        'Downward delivery (into an upright gas jar)',
        'Bubbling directly through concentrated hydrochloric acid'
      ],
      correctIndex: 0,
      explanation: 'Ammonia dissolves in water (so cannot be collected over water) and is lighter than air (Mr = 17 < air ~29), requiring upward delivery.'
    },
    {
      id: 'cc-c121-3',
      subject: 'chemistry',
      topicCode: 'C12',
      syllabusRef: 'C12.1',
      question: 'Why should an ethanol-containing flask be heated in an electric hot water bath rather than directly with a Bunsen burner?',
      options: [
        'Ethanol is volatile and highly flammable, so an open flame could ignite the vapour',
        'A Bunsen flame freezes ethanol crystals onto glass',
        'Ethanol only boils at temperatures above 500°C',
        'Water baths remove all oxygen from the laboratory'
      ],
      correctIndex: 0,
      explanation: 'Flammable volatile liquids (like ethanol) must always be heated gently in a water bath away from naked flames.'
    }
  ],

  'C12.2': [
    {
      id: 'cc-c122-1',
      subject: 'chemistry',
      topicCode: 'C12',
      syllabusRef: 'C12.2',
      question: 'In paper chromatography, why must the baseline near the bottom of the paper be drawn in PENCIL rather than ink?',
      options: [
        'Pencil graphite is insoluble in the solvent, whereas pen ink would dissolve and travel up the paper, contaminating the spots',
        'Pencil reacts with the dyes to make spots glow brighter',
        'Ink prevents water from climbing up the filter paper by capillary action',
        'Pencil marks dissolve completely to calibrate the Rf scale'
      ],
      correctIndex: 0,
      explanation: 'Graphite is insoluble in chromatography solvents, ensuring a fixed baseline reference without interfering spots.'
    },
    {
      id: 'cc-c122-2',
      subject: 'chemistry',
      topicCode: 'C12',
      syllabusRef: 'C12.2',
      question: 'A dye spot travels 4.2 cm from the baseline while the solvent front travels 7.0 cm from the baseline. What is the Rf value of the dye?',
      options: ['0.60', '1.67', '0.42', '2.80'],
      correctIndex: 0,
      explanation: 'Rf = distance travelled by substance ÷ distance travelled by solvent front = 4.2 ÷ 7.0 = 0.60 (always ≤ 1).'
    },
    {
      id: 'cc-c122-3',
      subject: 'chemistry',
      topicCode: 'C12',
      syllabusRef: 'C12.2',
      question: 'Why must the solvent level in a chromatography beaker stay BELOW the pencil baseline and sample spots?',
      options: [
        'So the sample spots do not wash/dissolve directly down into the beaker instead of rising up the paper',
        'So the solvent evaporates before reaching the top of the paper',
        'To ensure the spots fall downwards instead of rising',
        'Because paper dissolves if submerged more than 5 mm'
      ],
      correctIndex: 0,
      explanation: 'If the spots sit below the solvent surface, dyes dissolve straight into the bulk solvent rather than separating up the paper.'
    }
  ],

  'C12.3': [
    {
      id: 'cc-c123-1',
      subject: 'chemistry',
      topicCode: 'C12',
      syllabusRef: 'C12.3',
      question: 'Which sequence of steps cleanly separates a dry solid mixture of sand and sodium chloride (table salt)?',
      options: [
        'Add water to dissolve the salt, filter to collect sand residue, and evaporate/crystallise the salt filtrate',
        'Heat the dry mixture gently to sublime the sand away',
        'Use a bar magnet to pull sodium chloride crystals away from sand',
        'Distil the dry mixture directly at 100°C without adding water'
      ],
      correctIndex: 0,
      explanation: 'Sodium chloride is soluble in water while sand is insoluble; dissolution + filtration + evaporation separates both cleanly.'
    },
    {
      id: 'cc-c123-2',
      subject: 'chemistry',
      topicCode: 'C12',
      syllabusRef: 'C12.3',
      question: 'Which apparatus is used to separate miscible liquids with close boiling points, such as ethanol (78°C) and water (100°C)?',
      options: [
        'Fractional distillation apparatus with a fractionating column and Liebig condenser',
        'Filter funnel with fluted filter paper',
        'A simple separating funnel',
        'Paper chromatography strip'
      ],
      correctIndex: 0,
      explanation: 'Fractional distillation separates miscible liquids based on differing boiling points.'
    },
    {
      id: 'cc-c123-3',
      subject: 'chemistry',
      topicCode: 'C12',
      syllabusRef: 'C12.3',
      question: 'How does an impurity dissolved in a pure solid sample affect its melting point?',
      options: [
        'It lowers the melting point and causes it to melt over a wider temperature range',
        'It raises the melting point to an exact sharp temperature',
        'It leaves the melting point completely unchanged',
        'It turns the solid directly into an explosive gas'
      ],
      correctIndex: 0,
      explanation: 'Impurities lower and broaden a substance’s melting point and elevate/broaden its boiling point.'
    }
  ],

  'C12.4': [
    {
      id: 'cc-c124-1',
      subject: 'chemistry',
      topicCode: 'C12',
      syllabusRef: 'C12.4',
      question: 'What is observed when acidified aqueous silver nitrate is added to a solution containing chloride ions (Cl⁻)?',
      options: [
        'A white precipitate of silver chloride forms',
        'A bright yellow precipitate forms',
        'A cream precipitate forms',
        'Bubbles of pungent chlorine gas escape'
      ],
      correctIndex: 0,
      explanation: 'Halide tests with acidified AgNO₃(aq): Cl⁻ gives a white precipitate, Br⁻ cream precipitate, and I⁻ yellow precipitate.'
    },
    {
      id: 'cc-c124-2',
      subject: 'chemistry',
      topicCode: 'C12',
      syllabusRef: 'C12.4',
      question: 'Which reagent and observation confirm the presence of sulfate ions (SO₄²⁻) in solution?',
      options: [
        'Acidify with dilute nitric acid (or HCl) then add aqueous barium nitrate/chloride → white precipitate',
        'Add aqueous sodium hydroxide → blue precipitate insoluble in excess',
        'Add dilute nitric acid → brisk effervescence turning limewater milky',
        'Insert damp red litmus paper → turns blue'
      ],
      correctIndex: 0,
      explanation: 'Acidified barium nitrate/chloride gives an insoluble white precipitate of barium sulfate (BaSO₄) if SO₄²⁻ is present.'
    }
  ]
};
