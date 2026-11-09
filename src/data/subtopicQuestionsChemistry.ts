import { QuizQuestion } from '../types';

/**
 * Authentic Cambridge IGCSE Combined Science 0653 Chemistry Subtopic Questions.
 * Strictly aligned with Paper 2 Multiple Choice syllabus learning objectives.
 */
export const CHEMISTRY_SUBTOPIC_QUESTIONS: Record<string, QuizQuestion[]> = {
  // C3.1 Formulas & Chemical Equations
  'C3.1': [
    {
      id: 'c3-1-q1',
      subject: 'chemistry',
      topicCode: 'C3',
      syllabusRef: 'C3.1',
      question: 'What are the correct balancing coefficients for the reaction: _ Al + _ O2 → _ Al2O3?',
      options: [
        '4, 3, 2',
        '2, 3, 1',
        '2, 1, 2',
        '4, 2, 3'
      ],
      correctIndex: 0,
      explanation: 'Balancing: 4 Al + 3 O2 → 2 Al2O3 gives 4 aluminium atoms and 6 oxygen atoms on both sides.'
    },
    {
      id: 'c3-1-q2',
      subject: 'chemistry',
      topicCode: 'C3',
      syllabusRef: 'C3.1',
      question: 'What is the correct chemical formula for magnesium nitrate, formed from Mg²⁺ and NO3⁻ ions?',
      options: [
        'Mg(NO3)2',
        'MgNO3',
        'Mg2NO3',
        'Mg3(NO2)2'
      ],
      correctIndex: 0,
      explanation: 'To balance the 2+ charge of magnesium, two nitrate ions (NO3⁻) are required, giving Mg(NO3)2.'
    },
    {
      id: 'c3-1-q3',
      subject: 'chemistry',
      topicCode: 'C3',
      syllabusRef: 'C3.1',
      question: 'What is the formula of iron(III) oxide formed from Fe³⁺ and O²⁻ ions?',
      options: [
        'Fe2O3',
        'FeO',
        'Fe3O2',
        'Fe3O4'
      ],
      correctIndex: 0,
      explanation: 'Two Fe³⁺ ions (+6) balance three O²⁻ ions (-6), giving the empirical formula Fe2O3.'
    }
  ],

  // C4.1 Electrolysis
  'C4.1': [
    {
      id: 'c4-1-q1',
      subject: 'chemistry',
      topicCode: 'C4',
      syllabusRef: 'C4.1',
      question: 'During the electrolysis of molten lead(II) bromide using inert graphite electrodes, what is formed at each electrode?',
      options: [
        'Lead metal at the cathode (negative electrode) and bromine gas at the anode (positive electrode)',
        'Bromine at the cathode and lead at the anode',
        'Hydrogen gas at the cathode and oxygen at the anode',
        'Lead bromide vapour at both electrodes'
      ],
      correctIndex: 0,
      explanation: 'Positive Pb²⁺ cations migrate to the negative cathode gaining electrons (reduction) to form molten lead. Negative Br⁻ anions migrate to the positive anode losing electrons (oxidation) to form bromine gas.'
    },
    {
      id: 'c4-1-q2',
      subject: 'chemistry',
      topicCode: 'C4',
      syllabusRef: 'C4.1',
      question: 'During the electrolysis of concentrated aqueous sodium chloride (brine), which gas is liberated at the cathode?',
      options: [
        'Hydrogen gas',
        'Sodium vapour',
        'Chlorine gas',
        'Oxygen gas'
      ],
      correctIndex: 0,
      explanation: 'In aqueous solution, both Na⁺ and H⁺ are present at the cathode. Because hydrogen is less reactive than sodium, H⁺ ions are preferentially discharged to form H2 gas.'
    },
    {
      id: 'c4-1-q3',
      subject: 'chemistry',
      topicCode: 'C4',
      syllabusRef: 'C4.1',
      question: 'Why do ionic compounds such as sodium chloride conduct electricity when molten or dissolved in water, but NOT when solid?',
      options: [
        'In molten or aqueous state, ions are free to move and carry charge; in the solid state, ions are locked in a rigid lattice',
        'In the solid state, electrons are trapped inside protons',
        'Dissolving creates free delocalised metallic electrons',
        'Solid ionic compounds contain only covalent bonds'
      ],
      correctIndex: 0,
      explanation: 'Electrical conduction in electrolytes requires mobile charge carriers. In solids, ions vibrate in fixed positions. When molten or dissolved, ions are mobile.'
    }
  ],

  // C5.1 Energetics
  'C5.1': [
    {
      id: 'c5-1-q1',
      subject: 'chemistry',
      topicCode: 'C5',
      syllabusRef: 'C5.1',
      question: 'Which statement accurately describes an exothermic chemical reaction?',
      options: [
        'Thermal energy is transferred to the surroundings, causing the temperature of the surroundings to increase',
        'Thermal energy is absorbed from the surroundings, causing the surrounding temperature to drop',
        'No energy transfer occurs because mass is conserved',
        'Electrical energy is converted entirely into nuclear potential energy'
      ],
      correctIndex: 0,
      explanation: 'Exothermic reactions release thermal energy to the surroundings (ΔH is negative), raising the measured temperature of the reaction mixture.'
    },
    {
      id: 'c5-1-q2',
      subject: 'chemistry',
      topicCode: 'C5',
      syllabusRef: 'C5.1',
      question: 'In terms of chemical bond energies, why is a reaction exothermic overall?',
      options: [
        'The energy released when new bonds form in the products is greater than the energy absorbed to break existing bonds in the reactants',
        'More bonds are broken than are formed during the reaction',
        'Bond breaking releases energy while bond making absorbs energy',
        'The activation energy of the reaction is negative'
      ],
      correctIndex: 0,
      explanation: 'Bond breaking is always endothermic (requires energy input). Bond making is always exothermic (releases energy). A reaction is exothermic when bond-making energy > bond-breaking energy.'
    }
  ],

  // C6.1 Physical vs Chemical Changes
  'C6.1': [
    {
      id: 'c6-1-q1',
      subject: 'chemistry',
      topicCode: 'C6',
      syllabusRef: 'C6.1',
      question: 'Which process represents a physical change rather than a chemical change?',
      options: [
        'The boiling of pure water to form steam',
        'The rusting of an iron nail in moist air',
        'The thermal decomposition of calcium carbonate',
        'The neutralization of hydrochloric acid by sodium hydroxide'
      ],
      correctIndex: 0,
      explanation: 'Boiling water is a reversible change of state; no new chemical substances are created and the molecular composition (H2O) remains identical.'
    },
    {
      id: 'c6-1-q2',
      subject: 'chemistry',
      topicCode: 'C6',
      syllabusRef: 'C6.1',
      question: 'Which observation is definitive evidence that a chemical reaction has taken place?',
      options: [
        'A new substance with completely different chemical properties and permanent colour change / gas evolution is formed',
        'The substance melts into a liquid when heated and solidifies upon cooling',
        'A solid dissolves in water and can be recovered by evaporating the solvent',
        'The mass of a closed container changes during an experiment'
      ],
      correctIndex: 0,
      explanation: 'Chemical changes rearrange atoms to form new chemical products, usually accompanied by energy changes, gas evolution, or precipitate formation.'
    }
  ],

  // C6.2 Rates of Reaction
  'C6.2': [
    {
      id: 'c6-2-q1',
      subject: 'chemistry',
      topicCode: 'C6',
      syllabusRef: 'C6.2',
      question: 'According to collision theory, why does increasing the temperature of a reaction mixture increase the rate of reaction?',
      options: [
        'Particles have higher kinetic energy, collide more frequently, and a much higher fraction of collisions possess energy exceeding the activation energy',
        'Particles decrease in volume so they can collide more easily',
        'The activation energy barrier increases as thermal energy rises',
        'Higher temperatures convert reactants into noble gases'
      ],
      correctIndex: 0,
      explanation: 'Temperature increases both collision frequency and, more importantly, the proportion of collisions that meet or exceed activation energy (Ea).'
    },
    {
      id: 'c6-2-q2',
      subject: 'chemistry',
      topicCode: 'C6',
      syllabusRef: 'C6.2',
      question: 'In an experiment reacting marble chips (calcium carbonate) with hydrochloric acid, why does using powdered marble result in a faster initial rate than large chips?',
      options: [
        'Powder provides a much larger total surface area, allowing a greater frequency of reactant collisions per second',
        'Powder lowers the activation energy of the chemical reaction',
        'Powder increases the concentration of the hydrochloric acid',
        'Powder causes the reaction to change from endothermic to exothermic'
      ],
      correctIndex: 0,
      explanation: 'Smaller particle size exposes a greater surface area of solid reactant to acid collisions, increasing collision frequency per unit time.'
    },
    {
      id: 'c6-2-q3',
      subject: 'chemistry',
      topicCode: 'C6',
      syllabusRef: 'C6.2',
      question: 'What is the function of a catalyst in a chemical reaction?',
      options: [
        'It increases the rate of reaction by providing an alternative reaction pathway with a lower activation energy, without being consumed',
        'It increases the final yield of products at equilibrium',
        'It raises the temperature of the reaction mixture',
        'It acts as an additional reactant that donates electrons to products'
      ],
      correctIndex: 0,
      explanation: 'Catalysts lower the activation energy barrier by providing an alternative mechanism, enabling more collisions to be successful without being permanently altered.'
    }
  ],

  // C7.1 - C7.3 Acids, Bases & Salts
  'C7.1': [
    {
      id: 'c7-1-q1',
      subject: 'chemistry',
      topicCode: 'C7',
      syllabusRef: 'C7.1',
      question: 'Which colour does universal indicator turn when added to a strongly acidic solution (pH 1)?',
      options: [
        'Red',
        'Green',
        'Dark blue / purple',
        'Colourless'
      ],
      correctIndex: 0,
      explanation: 'Universal indicator turns red at pH 1-2 (strong acid), green at pH 7 (neutral), and dark blue/purple at pH 12-14 (strong alkali).'
    },
    {
      id: 'c7-1-q2',
      subject: 'chemistry',
      topicCode: 'C7',
      syllabusRef: 'C7.1',
      question: 'Which ion is responsible for acidity in aqueous solutions according to Cambridge Chemistry?',
      options: [
        'Hydrogen ions, H⁺ (or hydronium H3O⁺)',
        'Hydroxide ions, OH⁻',
        'Chloride ions, Cl⁻',
        'Sulfate ions, SO4²⁻'
      ],
      correctIndex: 0,
      explanation: 'Acids dissociate in water to produce hydrogen ions (H⁺), which are proton donors.'
    }
  ],
  'C7.3': [
    {
      id: 'c7-3-q1',
      subject: 'chemistry',
      topicCode: 'C7',
      syllabusRef: 'C7.3',
      question: 'In the preparation of pure, dry copper(II) sulfate crystals from copper(II) oxide and sulfuric acid, why is excess copper(II) oxide added?',
      options: [
        'To ensure that all of the sulfuric acid is completely neutralised and used up',
        'To speed up the evaporation of the water solvent',
        'To act as a drying agent during crystallization',
        'To prevent the formation of toxic hydrogen gas'
      ],
      correctIndex: 0,
      explanation: 'Adding insoluble base in excess ensures no unreacted sulfuric acid remains in the solution. The excess solid is then removed by filtration.'
    }
  ],

  // C8.2 & C8.3 Periodic Table Groups
  'C8.2': [
    {
      id: 'c8-2-q1',
      subject: 'chemistry',
      topicCode: 'C8',
      syllabusRef: 'C8.2',
      question: 'What is the trend in reactivity of the Group I alkali metals (Li, Na, K) descending the group?',
      options: [
        'Reactivity increases down the group because the outer electron is further from the nucleus and more easily lost',
        'Reactivity decreases down the group because the nucleus becomes larger',
        'Reactivity remains identical because they all possess 1 outer valence electron',
        'Reactivity alternates between odd and even atomic numbers'
      ],
      correctIndex: 0,
      explanation: 'Down Group I, atoms have more electron shells. Increased shielding and distance reduce electrostatic attraction to the single valence electron, making it easier to lose.'
    },
    {
      id: 'c8-2-q2',
      subject: 'chemistry',
      topicCode: 'C8',
      syllabusRef: 'C8.2',
      question: 'When a small piece of potassium is placed into a trough of water containing universal indicator, what is observed?',
      options: [
        'Potassium melts into a ball, fizzes vigorously, burns with a lilac flame, and turns the indicator purple',
        'Potassium sinks to the bottom, slowly dissolves with no bubbles, and turns indicator red',
        'Potassium reacts violently producing brown nitrogen dioxide gas',
        'Potassium explodes immediately forming solid white potassium carbonate'
      ],
      correctIndex: 0,
      explanation: 'Potassium reacts vigorously: 2K + 2H2O → 2KOH + H2. The heat ignites the hydrogen gas with a characteristic lilac flame. Alkaline KOH turns indicator purple.'
    }
  ],
  'C8.3': [
    {
      id: 'c8-3-q1',
      subject: 'chemistry',
      topicCode: 'C8',
      syllabusRef: 'C8.3',
      question: 'What is the colour and physical state of bromine (Br2) at room temperature and pressure?',
      options: [
        'Red-brown liquid',
        'Pale green gas',
        'Dark grey / purple solid',
        'Colourless gas'
      ],
      correctIndex: 0,
      explanation: 'At room temperature: Chlorine is a pale yellow-green gas; Bromine is a dense red-brown volatile liquid; Iodine is a dark grey crystalline solid that sublimes to purple vapour.'
    },
    {
      id: 'c8-3-q2',
      subject: 'chemistry',
      topicCode: 'C8',
      syllabusRef: 'C8.3',
      question: 'Chlorine water is added to a solution of potassium iodide. What colour change is observed and why?',
      options: [
        'The colourless solution turns dark brown because chlorine is more reactive than iodine and displaces it from potassium iodide',
        'The solution turns bright green because potassium chloride precipitates',
        'No reaction occurs because iodine is more reactive than chlorine',
        'A white precipitate of silver chloride forms'
      ],
      correctIndex: 0,
      explanation: 'Chlorine is higher in Group VII and more electronegative than iodine: Cl2 + 2KI → 2KCl + I2. Liberated aqueous iodine turns the solution brown.'
    }
  ],

  // C11.2 - C11.4 Organic Chemistry
  'C11.2': [
    {
      id: 'c11-2-q1',
      subject: 'chemistry',
      topicCode: 'C11',
      syllabusRef: 'C11.2',
      question: 'In the fractional distillation of petroleum (crude oil), which fraction is collected at the top of the fractionating column?',
      options: [
        'Refinery gases (smallest molecules with the lowest boiling points)',
        'Bitumen (largest molecules with the highest boiling points)',
        'Diesel oil (medium chain hydrocarbons)',
        'Kerosene (aviation fuel)'
      ],
      correctIndex: 0,
      explanation: 'The column is coolest at the top. Short-chain hydrocarbons have weak intermolecular forces, lowest boiling points, and condense at the very top as refinery gases.'
    }
  ],
  'C11.3': [
    {
      id: 'c11-3-q1',
      subject: 'chemistry',
      topicCode: 'C11',
      syllabusRef: 'C11.3',
      question: 'What is the general formula for the homologous series of alkanes?',
      options: [
        'CnH2n+2',
        'CnH2n',
        'CnH2n-2',
        'CnH2n+1OH'
      ],
      correctIndex: 0,
      explanation: 'Alkanes are saturated hydrocarbons containing only single C-C bonds with general formula CnH2n+2 (e.g. methane CH4, ethane C2H6).'
    }
  ],
  'C11.4': [
    {
      id: 'c11-4-q1',
      subject: 'chemistry',
      topicCode: 'C11',
      syllabusRef: 'C11.4',
      question: 'What chemical test is used to distinguish between an alkane and an alkene, and what is the positive observation for an alkene?',
      options: [
        'Shake with aqueous bromine water; an alkene rapidly decolourises bromine water from orange-brown to colourless',
        'Heat with Benedict’s solution; an alkene produces a brick-red precipitate',
        'Add universal indicator; an alkene turns red',
        'Burn in air; an alkene produces zero smoke and zero flame'
      ],
      correctIndex: 0,
      explanation: 'Alkenes have reactive C=C double bonds that undergo electrophilic addition with bromine water, turning it from orange-brown to colourless. Alkanes do not react in the dark.'
    }
  ],

  // C12.4 Identification of Ions & Gases
  'C12.4': [
    {
      id: 'c12-4-q1',
      subject: 'chemistry',
      topicCode: 'C12',
      syllabusRef: 'C12.4',
      question: 'Which test and observation confirms the presence of aqueous sulfate ions (SO4²⁻)?',
      options: [
        'Acidify with dilute nitric acid, then add aqueous barium nitrate; a dense white precipitate of barium sulfate forms',
        'Acidify with dilute nitric acid, then add silver nitrate; a yellow precipitate forms',
        'Add aqueous sodium hydroxide; a blue precipitate forms',
        'Add dilute hydrochloric acid and test gas with glowing splint'
      ],
      correctIndex: 0,
      explanation: 'Sulfate ions form an insoluble white precipitate of barium sulfate (BaSO4) when treated with acidified barium nitrate or barium chloride.'
    },
    {
      id: 'c12-4-q2',
      subject: 'chemistry',
      topicCode: 'C12',
      syllabusRef: 'C12.4',
      question: 'A student tests an unknown gas by holding a damp red litmus paper in the gas. The paper turns blue. Which gas is present?',
      options: [
        'Ammonia (NH3)',
        'Chlorine (Cl2)',
        'Carbon dioxide (CO2)',
        'Sulfur dioxide (SO2)'
      ],
      correctIndex: 0,
      explanation: 'Ammonia is the only common alkaline gas tested in Cambridge IGCSE; it dissolves in moisture to form OH⁻ ions, turning damp red litmus blue.'
    },
    {
      id: 'c12-4-q3',
      subject: 'chemistry',
      topicCode: 'C12',
      syllabusRef: 'C12.4',
      tier: 'Core',
      question: 'What flame colour is produced by copper(II) ions (Cu²⁺) during a flame test?',
      options: [
        'Blue-green',
        'Lilac',
        'Crimson red',
        'Golden yellow'
      ],
      correctIndex: 0,
      explanation: 'Flame tests: Li⁺ = red; Na⁺ = yellow; K⁺ = lilac; Cu²⁺ = blue-green.'
    }
  ],

  // C1.1 States of Matter
  'C1.1': [
    {
      id: 'c1-1-chem-q1',
      subject: 'chemistry',
      topicCode: 'C1',
      syllabusRef: 'C1.1',
      tier: 'Core',
      question: 'Which statement accurately describes the arrangement and motion of particles in a gas?',
      options: [
        'Particles are far apart with random arrangement, moving rapidly in all directions in straight lines',
        'Particles are close together in a regular crystal lattice, only vibrating about fixed positions',
        'Particles are tightly packed in random clusters that cannot be compressed',
        'Particles are held in rigid geometric rows by strong electrostatic bonds'
      ],
      correctIndex: 0,
      explanation: 'Gas particles have negligible forces of attraction between them, are widely spaced, and move rapidly and randomly in all directions.'
    },
    {
      id: 'c1-1-chem-q2',
      subject: 'chemistry',
      topicCode: 'C1',
      syllabusRef: 'C1.1',
      tier: 'Extended',
      question: 'Two gas jars are separated by a glass plate. One contains dark brown bromine vapour and the other contains air. When the glass plate is removed, the brown colour slowly spreads throughout both jars. What explains this observation?',
      options: [
        'Both bromine particles and air particles move continuously and randomly in all directions (diffusion)',
        'Bromine particles are pulled upwards by gravity',
        'Air particles chemically digest bromine molecules',
        'Bromine vapour boils into a lighter plasma'
      ],
      correctIndex: 0,
      explanation: 'Diffusion occurs because particles in liquids and gases possess kinetic energy and move randomly in all directions, spreading from high to low concentration.'
    }
  ],

  // C2.1 Elements, Compounds & Mixtures
  'C2.1': [
    {
      id: 'c2-1-q1',
      subject: 'chemistry',
      topicCode: 'C2',
      syllabusRef: 'C2.1',
      tier: 'Core',
      question: 'Which statement describes a chemical compound?',
      options: [
        'A pure substance composed of two or more different elements chemically combined in fixed proportions',
        'A substance containing only one single type of atom',
        'A physical mixture of substances that can be separated by filtration without breaking bonds',
        'A solution of solid particles dispersed in liquid water'
      ],
      correctIndex: 0,
      explanation: 'A compound consists of atoms of two or more different elements chemically bonded together in fixed stoichiometric proportions.'
    }
  ],

  // C2.2 Atomic Structure
  'C2.2': [
    {
      id: 'c2-2-q1',
      subject: 'chemistry',
      topicCode: 'C2',
      syllabusRef: 'C2.2',
      tier: 'Core',
      question: 'An atom of phosphorus has proton (atomic) number 15 and nucleon (mass) number 31. How many electrons, protons, and neutrons does this neutral atom contain?',
      options: [
        '15 electrons, 15 protons, 16 neutrons',
        '15 electrons, 16 protons, 15 neutrons',
        '16 electrons, 15 protons, 31 neutrons',
        '31 electrons, 15 protons, 16 neutrons'
      ],
      correctIndex: 0,
      explanation: 'In a neutral atom, electrons = protons = atomic number = 15. Neutrons = mass number – atomic number = 31 – 15 = 16.'
    },
    {
      id: 'c2-2-q2',
      subject: 'chemistry',
      topicCode: 'C2',
      syllabusRef: 'C2.2',
      tier: 'Extended',
      question: 'What is the electronic configuration of an argon atom (atomic number 18)?',
      options: [
        '2, 8, 8',
        '2, 8, 8, 2',
        '2, 16',
        '8, 8, 2'
      ],
      correctIndex: 0,
      explanation: 'Electrons fill shells in order: 2 in the first shell, 8 in the second, and 8 in the third, giving 2,8,8 (a stable octet).'
    }
  ],

  // C2.3 Ions & Ionic Bonding
  'C2.3': [
    {
      id: 'c2-3-q1',
      subject: 'chemistry',
      topicCode: 'C2',
      syllabusRef: 'C2.3',
      tier: 'Core',
      question: 'When a magnesium atom (electronic configuration 2,8,2) reacts to form a stable magnesium ion, what does it do?',
      options: [
        'It loses its 2 outer valence electrons to form a Mg²⁺ cation with configuration 2,8',
        'It gains 2 electrons to form a Mg²⁻ anion with configuration 2,8,4',
        'It shares 2 pairs of electrons with another magnesium atom',
        'It loses 1 proton from its nucleus'
      ],
      correctIndex: 0,
      explanation: 'Metal atoms lose outer electrons to achieve a stable noble gas configuration. Magnesium loses 2 electrons to form Mg²⁺.'
    },
    {
      id: 'c2-3-q2',
      subject: 'chemistry',
      topicCode: 'C2',
      syllabusRef: 'C2.3',
      tier: 'Extended',
      question: 'Why do ionic compounds have high melting and boiling points?',
      options: [
        'Large amounts of thermal energy are required to overcome the strong electrostatic attractions between oppositely charged ions in the 3D giant ionic lattice',
        'They contain weak intermolecular forces between molecules',
        'Covalent bonds between ions require high energy to break',
        'The delocalised electrons absorb large quantities of heat'
      ],
      correctIndex: 0,
      explanation: 'Ionic crystals consist of regular 3D giant lattices of positive cations and negative anions held together by strong omnidirectional electrostatic forces requiring high temperatures to break.'
    }
  ],

  // C2.4 Simple Molecules & Covalent Bonding
  'C2.4': [
    {
      id: 'c2-4-q1',
      subject: 'chemistry',
      topicCode: 'C2',
      syllabusRef: 'C2.4',
      tier: 'Core',
      question: 'Which type of chemical bond is formed when non-metal atoms share pairs of electrons?',
      options: [
        'Covalent bond',
        'Ionic bond',
        'Metallic bond',
        'Hydrogen bond'
      ],
      correctIndex: 0,
      explanation: 'Covalent bonding involves electrostatic attraction between shared pairs of electrons and the positive nuclei of non-metal atoms.'
    },
    {
      id: 'c2-4-q2',
      subject: 'chemistry',
      topicCode: 'C2',
      syllabusRef: 'C2.4',
      tier: 'Extended',
      question: 'Why does methane (CH4) have a very low boiling point (-161 °C) and exist as a gas at room temperature?',
      options: [
        'The intermolecular forces between simple covalent molecules are very weak and require little energy to overcome',
        'The covalent C-H bonds inside the methane molecule are weak and easily broken',
        'Methane contains mobile delocalised electrons that vaporise rapidly',
        'Methane reacts with nitrogen in the air to remain gaseous'
      ],
      correctIndex: 0,
      explanation: 'Although internal covalent C-H bonds are strong, only weak intermolecular attractive forces exist between separate CH4 molecules, requiring little thermal energy to separate them.'
    }
  ],

  // C6.3 Redox Reactions
  'C6.3': [
    {
      id: 'c6-3-q1',
      subject: 'chemistry',
      topicCode: 'C6',
      syllabusRef: 'C6.3',
      tier: 'Core',
      question: 'In the blast furnace reaction: Fe2O3 + 3CO → 2Fe + 3CO2, which substance acts as the reducing agent?',
      options: [
        'Carbon monoxide (CO)',
        'Iron(III) oxide (Fe2O3)',
        'Molten iron (Fe)',
        'Carbon dioxide (CO2)'
      ],
      correctIndex: 0,
      explanation: 'A reducing agent removes oxygen from another substance and is itself oxidised. Carbon monoxide removes oxygen from Fe2O3 to become CO2.'
    },
    {
      id: 'c6-3-q2',
      subject: 'chemistry',
      topicCode: 'C6',
      syllabusRef: 'C6.3',
      tier: 'Extended',
      question: 'According to electron transfer (OIL RIG), what takes place during oxidation and reduction?',
      options: [
        'Oxidation is Loss of electrons; Reduction is Gain of electrons',
        'Oxidation is Gain of electrons; Reduction is Loss of electrons',
        'Oxidation is Loss of protons; Reduction is Gain of protons',
        'Oxidation is Gain of neutrons; Reduction is Loss of neutrons'
      ],
      correctIndex: 0,
      explanation: 'OIL RIG: Oxidation Is Loss of electrons; Reduction Is Gain of electrons.'
    }
  ],

  // C7.2 Oxides
  'C7.2': [
    {
      id: 'c7-2-q1',
      subject: 'chemistry',
      topicCode: 'C7',
      syllabusRef: 'C7.2',
      tier: 'Core',
      question: 'Which type of oxide is typically formed when a non-metal burns in oxygen (e.g. sulfur or carbon)?',
      options: [
        'Acidic oxide',
        'Basic oxide',
        'Amphoteric oxide',
        'Insoluble neutral metal oxide'
      ],
      correctIndex: 0,
      explanation: 'Non-metal oxides (such as SO2 and CO2) are acidic: they react with water or alkalis to produce acidic solutions or salts.'
    }
  ],

  // C8.1 Periodic Table Trends
  'C8.1': [
    {
      id: 'c8-1-q1',
      subject: 'chemistry',
      topicCode: 'C8',
      syllabusRef: 'C8.1',
      tier: 'Core',
      question: 'How are chemical elements arranged in the modern Cambridge Periodic Table?',
      options: [
        'In order of increasing proton (atomic) number',
        'In order of decreasing atomic mass',
        'Alphabetically by elemental symbol',
        'In order of density'
      ],
      correctIndex: 0,
      explanation: 'The Periodic Table arranges elements in order of increasing atomic number (number of protons in the nucleus).'
    }
  ],

  // C8.4 Transition Elements
  'C8.4': [
    {
      id: 'c8-4-q1',
      subject: 'chemistry',
      topicCode: 'C8',
      syllabusRef: 'C8.4',
      tier: 'Extended',
      question: 'Which set of characteristics distinguishes transition metals (such as iron, copper, and nickel) from Group 1 alkali metals?',
      options: [
        'High density, high melting point, formation of coloured compounds, and catalytic activity',
        'Low density, low melting point, and violent reaction with cold water',
        'Non-conductors of electricity that form white compounds only',
        'Gaseous state at room temperature with full valence electron shells'
      ],
      correctIndex: 0,
      explanation: 'Transition elements have high densities and melting points, exhibit variable oxidation states, form coloured ions/compounds (e.g. blue Cu²⁺), and act as industrial catalysts (e.g. iron in Haber process).'
    }
  ],

  // C8.5 Noble Gases
  'C8.5': [
    {
      id: 'c8-5-q1',
      subject: 'chemistry',
      topicCode: 'C8',
      syllabusRef: 'C8.5',
      tier: 'Core',
      question: 'Why are Group 18 noble gases (helium, neon, argon) chemically unreactive (inert)?',
      options: [
        'They have a completely full outer shell of valence electrons (stable electronic configuration)',
        'They exist only under high atmospheric pressures',
        'Their nuclei contain zero neutrons',
        'They possess strong metallic bonds holding atoms together'
      ],
      correctIndex: 0,
      explanation: 'Noble gases possess full outer electron shells (2 for He, 8 for Ne, Ar), so they do not need to gain, lose, or share electrons to attain stability.'
    }
  ],

  // C9.1 - C9.6 Metals & Metallurgy
  'C9.1': [
    {
      id: 'c9-1-q1',
      subject: 'chemistry',
      topicCode: 'C9',
      syllabusRef: 'C9.1',
      tier: 'Core',
      question: 'Why can pure metals be hammered into thin sheets (malleable) without shattering?',
      options: [
        'Layers of positive metal ions can slide over each other without disrupting the metallic bond',
        'Covalent bonds between metal atoms stretch like rubber',
        'Metals contain hollow air spaces that absorb impact',
        'Metal atoms convert into gas when struck'
      ],
      correctIndex: 0,
      explanation: 'In metallic bonding, regular layers of metal ions can slide past one another while remaining bonded together by the sea of delocalised valence electrons.'
    }
  ],
  'C9.3': [
    {
      id: 'c9-3-q1',
      subject: 'chemistry',
      topicCode: 'C9',
      syllabusRef: 'C9.3',
      tier: 'Extended',
      question: 'Why is bronze (an alloy of copper and tin) harder than pure copper?',
      options: [
        'Tin atoms are of different size to copper atoms, distorting the regular lattice layers and preventing them from sliding easily',
        'Bronze contains ionic bonds that solidify the metal',
        'Tin atoms destroy all delocalised electrons',
        'Pure copper is a liquid at room temperature'
      ],
      correctIndex: 0,
      explanation: 'Alloys introduce atoms of different sizes, distorting regular crystal layers and making it much harder for layers of ions to slide over each other under stress.'
    }
  ],
  'C9.4': [
    {
      id: 'c9-4-q1',
      subject: 'chemistry',
      topicCode: 'C9',
      syllabusRef: 'C9.4',
      tier: 'Core',
      question: 'A piece of zinc is placed into blue copper(II) sulfate solution. What observation is made?',
      options: [
        'A brown-pink solid (copper) deposits on the zinc and the blue colour of the solution fades to colourless',
        'No reaction occurs because copper is more reactive than zinc',
        'Violent flames and hydrogen explosions occur',
        'A white precipitate of barium sulfate forms'
      ],
      correctIndex: 0,
      explanation: 'Zinc is higher in the reactivity series than copper: Zn + CuSO4 → ZnSO4 + Cu. Zinc displaces copper ions from solution, forming colourless zinc sulfate and reddish copper.'
    }
  ],
  'C9.5': [
    {
      id: 'c9-5-q1',
      subject: 'chemistry',
      topicCode: 'C9',
      syllabusRef: 'C9.5',
      tier: 'Extended',
      question: 'How does sacrificial protection prevent the rusting of iron hulls on ocean ships?',
      options: [
        'Blocks of a more reactive metal (such as zinc) oxidise and corrode preferentially, donating electrons to the iron',
        'Zinc creates a plastic waterproof paint over the steel',
        'Iron becomes less reactive when in contact with seawater',
        'Zinc absorbs all salt ions from the water'
      ],
      correctIndex: 0,
      explanation: 'Zinc is more reactive than iron (higher in reactivity series). Zinc oxidises preferentially: Zn → Zn²⁺ + 2e⁻, supplying electrons to the iron and preventing Fe from oxidising into rust.'
    }
  ],
  'C9.6': [
    {
      id: 'c9-6-q1',
      subject: 'chemistry',
      topicCode: 'C9',
      syllabusRef: 'C9.6',
      tier: 'Core',
      question: 'In the extraction of iron in a blast furnace, what is the main chemical reduction reaction converting hematite into molten iron?',
      options: [
        'Fe2O3 + 3CO → 2Fe + 3CO2',
        'Fe + O2 → FeO2',
        'CaCO3 → CaO + CO2',
        'C + O2 → CO2'
      ],
      correctIndex: 0,
      explanation: 'Hematite (Fe2O3) is reduced by carbon monoxide (CO) gas generated in the furnace to produce liquid molten iron and carbon dioxide.'
    }
  ],

  // C10.1 & C10.2 Environmental Chemistry
  'C10.1': [
    {
      id: 'c10-1-q1',
      subject: 'chemistry',
      topicCode: 'C10',
      syllabusRef: 'C10.1',
      tier: 'Core',
      question: 'Which chemical reagent is used to test for the presence of water, turning from white to blue?',
      options: [
        'Anhydrous copper(II) sulfate',
        'Anhydrous cobalt(II) chloride',
        'Potassium manganate(VII)',
        'Limewater'
      ],
      correctIndex: 0,
      explanation: 'White anhydrous copper(II) sulfate (CuSO4) reacts with water to form blue hydrated copper(II) sulfate crystals (CuSO4·5H2O).'
    }
  ],
  'C10.2': [
    {
      id: 'c10-2-q1',
      subject: 'chemistry',
      topicCode: 'C10',
      syllabusRef: 'C10.2',
      tier: 'Core',
      question: 'What are the approximate percentage compositions of nitrogen and oxygen in clean, dry, unpolluted air?',
      options: [
        '78% nitrogen, 21% oxygen',
        '50% nitrogen, 50% oxygen',
        '21% nitrogen, 78% oxygen',
        '95% nitrogen, 4% carbon dioxide'
      ],
      correctIndex: 0,
      explanation: 'Clean air is approximately 78% nitrogen (N2), 21% oxygen (O2), ~0.9% argon, and ~0.04% carbon dioxide.'
    }
  ],

  // C11.1 & C11.5 Organic Chemistry & Polymers
  'C11.1': [
    {
      id: 'c11-1-q1',
      subject: 'chemistry',
      topicCode: 'C11',
      syllabusRef: 'C11.1',
      tier: 'Core',
      question: 'What is a hydrocarbon?',
      options: [
        'A chemical compound consisting of carbon and hydrogen atoms only',
        'Any organic compound containing carbon, hydrogen, and oxygen',
        'A mixture of coal and water',
        'A polymer that dissolves in water'
      ],
      correctIndex: 0,
      explanation: 'A hydrocarbon is strictly defined as a compound containing only carbon and hydrogen atoms (e.g. alkanes, alkenes).'
    }
  ],
  'C11.5': [
    {
      id: 'c11-5-q1',
      subject: 'chemistry',
      topicCode: 'C11',
      syllabusRef: 'C11.5',
      tier: 'Extended',
      question: 'What repeating unit is formed during the addition polymerisation of ethene (C2H4)?',
      options: [
        '-[CH2-CH2]-',
        '-[CH=CH]-',
        '-[CH2-CH2-O]-',
        '-[C=C]-'
      ],
      correctIndex: 0,
      explanation: 'In addition polymerisation of ethene, the double bond opens up to form a continuous single-bonded poly(ethene) carbon backbone with repeating unit -[CH2-CH2]-.'
    }
  ],

  // C12.1 - C12.3 Experimental Techniques
  'C12.1': [
    {
      id: 'c12-1-q1',
      subject: 'chemistry',
      topicCode: 'C12',
      syllabusRef: 'C12.1',
      tier: 'Core',
      question: 'Which piece of laboratory apparatus is most accurate for measuring exactly 25.0 cm³ of alkali during an acid-base titration?',
      options: [
        'Volumetric pipette',
        'Beaker',
        'Conical flask',
        'Gas syringe'
      ],
      correctIndex: 0,
      explanation: 'A volumetric pipette is calibrated to measure fixed precise volumes (such as 25.0 cm³) with high accuracy.'
    }
  ],
  'C12.2': [
    {
      id: 'c12-2-q1',
      subject: 'chemistry',
      topicCode: 'C12',
      syllabusRef: 'C12.2',
      tier: 'Extended',
      question: 'In paper chromatography, a dye spot travels 4.8 cm while the solvent front travels 8.0 cm. What is the Rf value of the dye?',
      options: [
        '0.60',
        '1.67',
        '3.20',
        '0.48'
      ],
      correctIndex: 0,
      explanation: 'Rf formula = distance travelled by substance / distance travelled by solvent front = 4.8 cm / 8.0 cm = 0.60.'
    }
  ],
  'C12.3': [
    {
      id: 'c12-3-q1',
      subject: 'chemistry',
      topicCode: 'C12',
      syllabusRef: 'C12.3',
      tier: 'Core',
      question: 'Which separation technique is used to obtain pure liquid water from aqueous copper(II) sulfate solution?',
      options: [
        'Simple distillation',
        'Filtration through paper',
        'Fractional crystallisation',
        'Paper chromatography'
      ],
      correctIndex: 0,
      explanation: 'Simple distillation separates a volatile solvent from a non-volatile dissolved solute: water evaporates, condenses in the Liebig condenser, and is collected as pure distillate.'
    }
  ]
};

