import { SubtopicTopicGroup } from './subtopicSlidesData';

export const chemistrySubtopicsData: SubtopicTopicGroup[] = [
  {
    subtopicCode: 'C1.1',
    topicCode: 'C1',
    topicName: 'States of matter',
    title: 'States of Matter & Kinetic Particle Theory',
    subject: 'chemistry',
    tier: 'Core & Supplement',
    syllabusSummary: [
      'State distinguishing properties of solids, liquids, and gases.',
      'Describe structures in terms of particle separation, arrangement, and motion.',
      'Explain changes of state: melting, boiling, evaporating, freezing, condensing.',
      'Describe effects of temperature and pressure on gas volume.'
    ],
    decks: [
      {
        id: 'deck-c1-1',
        subtopicCode: 'C1.1',
        topicCode: 'C1',
        title: 'States of Matter & Changes of State',
        subtopicHeader: '[C1.1] States of Matter',
        classworkDate: '29/04/2025',
        objectives: [
          'Explain state changes in terms of kinetic theory of particles.',
          'Analyse data on melting and boiling points to determine state of matter.'
        ],
        keywords: ['particles', 'kinetic energy', 'solids', 'liquids', 'gases', 'melting', 'boiling', 'sublimation'],
        starterLookBack: {
          question: 'What are the three digestive enzymes and what are their substrates and products?',
          answer: 'Amylase (starch -> glucose), Lipase (lipids -> fatty acids + glycerol), Protease (proteins -> amino acids).'
        },
        slides: [
          {
            id: 'c1-1-s1',
            slideNumber: 1,
            subtopicHeader: '[C1.1] Particle Models',
            title: 'Solids, Liquids, and Gases',
            slideType: 'theory',
            content: [
              '• Solid: Particles closely packed in a regular lattice; vibrate around fixed positions; strong forces of attraction; cannot be compressed; fixed shape & volume.',
              '• Liquid: Particles touching but randomly arranged; can slide past one another; medium kinetic energy; fixed volume but takes shape of container; cannot be compressed.',
              '• Gas: Particles far apart with large empty spaces; move randomly in all directions at high speeds; negligible forces of attraction; no fixed shape or volume; easily compressed.'
            ]
          },
          {
            id: 'c1-1-s2',
            slideNumber: 2,
            subtopicHeader: '[C1.1] Changes of State',
            title: 'Phase Changes & Physical vs Chemical Change',
            slideType: 'theory',
            content: [
              '• Melting: Solid -> Liquid (particles gain kinetic energy and overcome lattice forces).',
              '• Boiling/Evaporating: Liquid -> Gas.',
              '• Condensing: Gas -> Liquid (particles lose kinetic energy and attractive forces pull them close).',
              '• Freezing/Solidifying: Liquid -> Solid.',
              '• Sublimation: Solid turns directly into gas without liquid phase (e.g. dry ice CO2).',
              '• Deposition: Gas turns directly into solid (e.g. frost/snow).',
              '• Key Point: Changes of state are PHYSICAL changes: mass is conserved and no new substances are formed.'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'C2.1',
    topicCode: 'C2',
    topicName: 'Atoms, elements and compounds',
    title: 'Elements, Compounds and Mixtures',
    subject: 'chemistry',
    tier: 'Core',
    syllabusSummary: [
      'Describe differences between elements, compounds, and mixtures.'
    ],
    decks: [
      {
        id: 'deck-c2-1',
        subtopicCode: 'C2.1',
        topicCode: 'C2',
        title: 'Elements, Compounds and Mixtures',
        subtopicHeader: '[C2.1] Elements, Compounds and Mixtures',
        classworkDate: '29/04/2025',
        objectives: [
          'Define and identify elements and compounds.',
          'Explain how properties of elements change in compounds.'
        ],
        keywords: ['atom', 'element', 'compound', 'mixture', 'chemical bond'],
        slides: [
          {
            id: 'c2-1-s1',
            slideNumber: 1,
            subtopicHeader: '[C2.1] Definitions & Models',
            title: 'Classifying Matter',
            slideType: 'theory',
            content: [
              '• Element: A substance made up of only ONE type of atom (e.g. O2, Fe, Na, Cl2). Cannot be broken down chemically.',
              '• Compound: A substance made of two or more DIFFERENT elements chemically bonded together in fixed proportions (e.g. H2O, CO2, NaCl). Properties are totally different from component elements.',
              '• Mixture: Two or more substances (elements or compounds) physically mixed together but NOT chemically bonded (e.g. air, sea water, iron filings + sulfur). Each component retains its original properties and can be separated by physical methods.'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'C2.2',
    topicCode: 'C2',
    topicName: 'Atoms, elements and compounds',
    title: 'Atomic Structure & The Periodic Table',
    subject: 'chemistry',
    tier: 'Core',
    syllabusSummary: [
      'Central nucleus with protons and neutrons, surrounded by electrons in shells.',
      'Relative charges and masses: proton (+1, 1), neutron (0, 1), electron (-1, 0.0005).',
      'Proton/atomic number and mass/nucleon number; electronic configuration 1 to 20 (e.g. 2,8,3).'
    ],
    decks: [
      {
        id: 'deck-c2-2',
        subtopicCode: 'C2.2',
        topicCode: 'C2',
        title: 'Atomic Structure & Electronic Configurations',
        subtopicHeader: '[C2.2] Atomic Structure and the Periodic Table',
        classworkDate: '30/04/2025 - 19/03/2026',
        objectives: [
          'Identify trends in the periodic table.',
          'Label the atom and define atomic number and mass number.',
          'Write electronic configurations for the first 20 elements (2,8,8 rule).'
        ],
        keywords: ['atomic number', 'mass number', 'protons', 'neutrons', 'electrons', 'electron shells'],
        slides: [
          {
            id: 'c2-2-s1',
            slideNumber: 1,
            subtopicHeader: '[C2.2] Subatomic Particles',
            title: 'Structure of the Atom',
            slideType: 'theory',
            content: [
              '• Proton: Relative mass = 1, Relative charge = +1, Location = Nucleus.',
              '• Neutron: Relative mass = 1, Relative charge = 0 (neutral), Location = Nucleus.',
              '• Electron: Relative mass = 0.0005 (negligible), Relative charge = -1, Location = Shells orbiting nucleus.',
              '• Atomic (Proton) Number: Number of protons in the nucleus (defines the element). In a neutral atom, number of electrons = number of protons.',
              '• Mass (Nucleon) Number: Total number of protons + neutrons in the nucleus.',
              '• Neutrons = Mass Number - Atomic Number.'
            ]
          },
          {
            id: 'c2-2-s2',
            slideNumber: 2,
            subtopicHeader: '[C2.2] The 2,8,8 Electron Rule',
            title: 'Electron Configuration Rules',
            slideType: 'theory',
            content: [
              '• 1st Shell: Maximum 2 electrons.',
              '• 2nd Shell: Maximum 8 electrons.',
              '• 3rd Shell: Maximum 8 electrons.',
              '• 4th Shell: Up to 2 electrons for Calcium (2,8,8,2).',
              '• Connection to Periodic Table:',
              '  - Group Number (columns) = Number of electrons in outer shell.',
              '  - Period Number (rows) = Number of occupied electron shells.'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'C2.3',
    topicCode: 'C2',
    topicName: 'Atoms, elements and compounds',
    title: 'Ions & Ionic Bonds',
    subject: 'chemistry',
    tier: 'Core & Supplement',
    syllabusSummary: [
      'Cations (positive ions, metals lose electrons) and anions (negative ions, non-metals gain electrons).',
      'Ionic bond as strong electrostatic attraction between oppositely charged ions.',
      'Giant lattice structure (regular alternating +/- ions in NaCl); high mp/bp, conducts when molten/aqueous, soluble.'
    ],
    decks: [
      {
        id: 'deck-c2-3',
        subtopicCode: 'C2.3',
        topicCode: 'C2',
        title: 'Ionic Bonding & Giant Lattice Properties',
        subtopicHeader: '[C2.3] Ionic Bonding',
        classworkDate: '25/02/2025',
        objectives: [
          'Describe the formation of ions and draw electron configurations for ions.',
          'Explain giant ionic lattice structures and their physical properties.'
        ],
        keywords: ['ion', 'cation', 'anion', 'electrostatic attraction', 'giant lattice', 'brittle', 'conductivity'],
        slides: [
          {
            id: 'c2-3-s1',
            slideNumber: 1,
            subtopicHeader: '[C2.3] Ion Formation',
            title: 'Cations, Anions & The Octet Rule',
            slideType: 'theory',
            content: [
              '• Metals in Groups I, II, III LOSE outer electrons to attain a full outer shell, forming POSITIVE ions (Cations). E.g. Na -> Na+ + e-, Mg -> Mg2+ + 2e-.',
              '• Non-metals in Groups V, VI, VII GAIN electrons to complete outer shell, forming NEGATIVE ions (Anions). E.g. Cl + e- -> Cl-, O + 2e- -> O2-.',
              '• Ionic Bond: The strong electrostatic force of attraction between oppositely charged positive and negative ions.'
            ]
          },
          {
            id: 'c2-3-s2',
            slideNumber: 2,
            subtopicHeader: '[C2.3] Giant Lattice Properties',
            title: 'Properties of Ionic Compounds',
            slideType: 'theory',
            content: [
              '• Giant Ionic Lattice (e.g. NaCl): 3D regular repeating cubic network of alternating Na+ and Cl- ions.',
              '• High Melting & Boiling Points: Millions of strong electrostatic bonds in all directions require large amounts of heat energy to break.',
              '• Electrical Conductivity:',
              '  - SOLID: Does NOT conduct because ions are held firmly in fixed positions in the lattice.',
              '  - MOLTEN / AQUEOUS: Conducts electricity well because the ionic lattice breaks down and ions are FREE TO MOVE and carry charge.',
              '• Brittle: A sharp force causes layers of ions to shift; like charges align and strongly repel, shattering the crystal.'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'C2.4',
    topicCode: 'C2',
    topicName: 'Atoms, elements and compounds',
    title: 'Simple Molecules & Covalent Bonds',
    subject: 'chemistry',
    tier: 'Core & Supplement',
    syllabusSummary: [
      'Covalent bond formed when a pair of electrons is shared between two non-metal atoms.',
      'Dot-and-cross diagrams: H2, Cl2, H2O, CH4, NH3, HCl, CH3OH, C2H4, O2, CO2, N2.',
      'Properties: Low melting & boiling points (weak intermolecular forces), poor electrical conductivity.'
    ],
    decks: [
      {
        id: 'deck-c2-4',
        subtopicCode: 'C2.4',
        topicCode: 'C2',
        title: 'Covalent Bonding & Simple Molecular Substances',
        subtopicHeader: '[C2.4] Covalent Bonding',
        classworkDate: '18/03/2026',
        objectives: [
          'Describe covalent bonding as sharing pairs of electrons between non-metals.',
          'Draw dot-and-cross diagrams for single, double (O2, CO2, C2H4), and triple (N2) bonds.',
          'Explain why simple molecular substances have low melting/boiling points and are electrical insulators.'
        ],
        keywords: ['covalent bond', 'shared pair', 'intermolecular forces', 'insulator', 'double bond', 'triple bond'],
        slides: [
          {
            id: 'c2-4-s1',
            slideNumber: 1,
            subtopicHeader: '[C2.4] Covalent Bonding Nature',
            title: 'Sharing Electrons to Attain Stability',
            slideType: 'theory',
            content: [
              '• A covalent bond forms when pairs of electrons are shared between non-metal atoms to achieve noble gas configurations.',
              '• Single Bonds (1 shared pair, 2 electrons): H2, Cl2, HCl, H2O, CH4, NH3.',
              '• Double Bonds (2 shared pairs, 4 electrons): O2 (O=O), CO2 (O=C=O), Ethene C2H4 (H2C=CH2).',
              '• Triple Bonds (3 shared pairs, 6 electrons): N2 (N≡N).'
            ]
          },
          {
            id: 'c2-4-s2',
            slideNumber: 2,
            subtopicHeader: '[C2.4] Simple Molecular Properties',
            title: 'Weak Intermolecular Forces vs Strong Covalent Bonds',
            slideType: 'theory',
            content: [
              '• Within each molecule: Covalent bonds are extremely strong.',
              '• Between separate molecules: Only WEAK INTERMOLECULAR FORCES exist.',
              '• Low Melting & Boiling Points: When boiling, covalent bonds DO NOT BREAK; only the weak intermolecular forces are overcome, which takes very little energy.',
              '• Poor Electrical Conductors: Neutral molecules possess no free-moving electrons and no ions to carry electric charge.'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'C3.1',
    topicCode: 'C3',
    topicName: 'Stoichiometry',
    title: 'Formulas & Chemical Equations',
    subject: 'chemistry',
    tier: 'Core & Supplement',
    syllabusSummary: [
      'Molecular formula as number and type of atoms in one molecule.',
      'Deduce formulas from models/charges; balance symbol equations with state symbols (s), (l), (g), (aq).'
    ],
    decks: [
      {
        id: 'deck-c3-1',
        subtopicCode: 'C3.1',
        topicCode: 'C3',
        title: 'Chemical Formulas & Balancing Equations',
        subtopicHeader: '[C3.1] Using Chemical Formulae',
        classworkDate: '07/05/2025',
        objectives: [
          'Calculate number of atoms of each element in chemical formulas.',
          'Balance symbol equations using coefficients.',
          'Apply state symbols: (s), (l), (g), (aq).'
        ],
        keywords: ['formula', 'reactants', 'products', 'balanced equation', 'coefficients', 'state symbols'],
        slides: [
          {
            id: 'c3-1-s1',
            slideNumber: 1,
            subtopicHeader: '[C3.1] Formula Rules',
            title: 'Reading Chemical Formulas & Brackets',
            slideType: 'theory',
            content: [
              '• Subscript numbers multiply only the element directly to their left: H2O = 2 H, 1 O.',
              '• Numbers outside brackets multiply everything inside: Mg(OH)2 = 1 Mg, 2 O, 2 H.',
              '• Coefficients (big numbers in front) multiply the entire formula: 2Al2O3 = 4 Al, 6 O.',
              '• Law of Conservation of Mass: Atoms are neither created nor destroyed during a chemical reaction; they are simply rearranged. Thus, equations must be balanced on both sides.'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'C4.1',
    topicCode: 'C4',
    topicName: 'Electrochemistry',
    title: 'Electrolysis: Molten & Aqueous',
    subject: 'chemistry',
    tier: 'Core & Supplement',
    syllabusSummary: [
      'Define electrolysis as decomposition of an ionic compound, molten or aqueous, by electric current.',
      'Anode (+) and cathode (-); products for molten PbBr2, concentrated aqueous NaCl, dilute H2SO4.',
      'Metals/H2 form at cathode, non-metals form at anode; aqueous CuSO4 practical.'
    ],
    decks: [
      {
        id: 'deck-c4-1-molten',
        subtopicCode: 'C4.1',
        topicCode: 'C4',
        title: 'Molten Electrolysis (Lead(II) Bromide)',
        subtopicHeader: '[C4.1] Electrolysis (molten)',
        classworkDate: '20/03/2026',
        objectives: [
          'Define electrolysis and identify anode (+), cathode (-), and electrolyte.',
          'Predict products for molten binary compounds: PbBr2.'
        ],
        keywords: ['electrolysis', 'electrolyte', 'anode', 'cathode', 'cation', 'anion', 'molten'],
        slides: [
          {
            id: 'c4-1-s1',
            slideNumber: 1,
            subtopicHeader: '[C4.1] Molten Electrolysis',
            title: 'Electrolysis of Molten Lead(II) Bromide (PbBr2)',
            slideType: 'theory',
            content: [
              '• Electrolyte: Molten ionic substance where ions are free to move.',
              '• PANIC: Positive Anode, Negative Is Cathode.',
              '• Cations (+ ions) are attracted to the Cathode (-): Pb2+ + 2e- -> Pb (silvery bead of molten lead forms).',
              '• Anions (- ions) are attracted to the Anode (+): 2Br- -> Br2 + 2e- (brown pungent bromine gas fumes evolved).'
            ]
          }
        ]
      },
      {
        id: 'deck-c4-1-aqueous',
        subtopicCode: 'C4.1',
        topicCode: 'C4',
        title: 'Aqueous Electrolysis (NaCl, H2SO4 & CuSO4 Practical)',
        subtopicHeader: '[C4.1] Electrolysis (Aqueous)',
        classworkDate: '24/03/2026',
        objectives: [
          'Predict products in aqueous electrolysis with H+ and OH- ions present.',
          'Describe the copper sulfate practical using graphite electrodes.'
        ],
        keywords: ['aqueous', 'discharge', 'selective discharge', 'copper sulfate', 'inert electrodes'],
        slides: [
          {
            id: 'c4-1-aq1',
            slideNumber: 1,
            subtopicHeader: '[C4.1] Aqueous Rules',
            title: 'Rules for Selective Discharge in Water',
            slideType: 'theory',
            content: [
              '• In aqueous solutions, water dissociates into H+ and OH- in addition to solute ions.',
              '• At Cathode (-): Hydrogen gas (H2) forms UNLESS the metal is less reactive than hydrogen (Copper, Silver, Gold).',
              '• At Anode (+): Halogen gas forms if halide ions are concentrated (Cl2, Br2, I2); otherwise, OXYGEN gas forms from OH- ions: 4OH- -> O2 + 2H2O + 4e-.',
              '• Concentrated NaCl (aq): H2 gas at cathode; Cl2 gas at anode; remaining solution is NaOH (alkaline, turns universal indicator blue).',
              '• Dilute H2SO4 (aq): H2 gas at cathode; O2 gas at anode (2:1 volume ratio).',
              '• Aqueous CuSO4 with graphite: Pink-brown copper metal plates onto cathode; oxygen gas bubbles at anode.'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'C5.1',
    topicCode: 'C5',
    topicName: 'Chemical energetics',
    title: 'Exothermic & Endothermic Reactions',
    subject: 'chemistry',
    tier: 'Core & Supplement',
    syllabusSummary: [
      'Exothermic transfers thermal energy to surroundings (temp increase).',
      'Endothermic takes in thermal energy from surroundings (temp decrease).',
      'Activation energy Ea; reaction pathway diagrams; bond breaking is endothermic, bond making is exothermic.'
    ],
    decks: [
      {
        id: 'deck-c5-1',
        subtopicCode: 'C5.1',
        topicCode: 'C5',
        title: 'Energetics, Reaction Profiles & Polystyrene Cup Practical',
        subtopicHeader: '[C5.1] Exothermic and Endothermic Reactions',
        classworkDate: '20/04/2026 - 23/04/2026',
        objectives: [
          'Distinguish between exothermic and endothermic reactions by temperature change.',
          'Draw and interpret reaction profiles with activation energy Ea and ΔH.',
          'Explain energetics: bond breaking takes in energy (endo); bond making releases energy (exo).'
        ],
        keywords: ['exothermic', 'endothermic', 'activation energy', 'reaction profile', 'bond breaking', 'bond making'],
        slides: [
          {
            id: 'c5-1-s1',
            slideNumber: 1,
            subtopicHeader: '[C5.1] Exo vs Endo',
            title: 'Thermal Energy Changes in Reactions',
            slideType: 'theory',
            content: [
              '• Exothermic: Releases thermal energy to surroundings -> Temperature of surroundings increases (e.g. combustion, neutralization, magnesium + acid). Products have less chemical energy than reactants (ΔH negative).',
              '• Endothermic: Absorbs thermal energy from surroundings -> Temperature of surroundings decreases (e.g. thermal decomposition, citric acid + sodium hydrogencarbonate). Products have more energy than reactants (ΔH positive).',
              '• Bond Energetics Rule:',
              '  - Breaking bonds is ENDOTHERMIC (energy must be supplied to pull atoms apart).',
              '  - Making bonds is EXOTHERMIC (energy is released when new bonds form).',
              '  - If energy released forming bonds > energy absorbed breaking bonds = EXOTHERMIC overall.'
            ]
          },
          {
            id: 'c5-1-s2',
            slideNumber: 2,
            subtopicHeader: '[C5.1] Reaction Profiles',
            title: 'Reaction Profiles & Activation Energy (Ea)',
            slideType: 'theory',
            content: [
              '• Activation Energy (Ea): The minimum energy colliding particles must possess in order to react.',
              '• Exothermic Profile: Reactants start higher than products; hump represents Ea from reactant level to peak; overall arrow from reactants to products points DOWN (energy released).',
              '• Endothermic Profile: Products finish higher than reactants; arrow points UP (energy absorbed).'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'C6.1',
    topicCode: 'C6',
    topicName: 'Chemical reactions',
    title: 'Physical and Chemical Changes',
    subject: 'chemistry',
    tier: 'Core',
    syllabusSummary: [
      'Identify physical and chemical changes and understand differences between them (reversibility, mass conservation, new substances).'
    ],
    decks: [
      {
        id: 'deck-c6-1',
        subtopicCode: 'C6.1',
        topicCode: 'C6',
        title: 'Physical vs Chemical Changes',
        subtopicHeader: '[C6.1] Physical and Chemical Changes',
        classworkDate: '24/06/2025',
        objectives: [
          'Describe properties of physical and chemical reactions.',
          'Identify evidence of chemical changes (effervescence, precipitate, temperature change, colour change).'
        ],
        keywords: ['reversible', 'irreversible', 'physical change', 'chemical change'],
        slides: [
          {
            id: 'c6-1-s1',
            slideNumber: 1,
            subtopicHeader: '[C6.1] Comparing Changes',
            title: 'Physical vs Chemical Transformations',
            slideType: 'theory',
            content: [
              '• Physical Change: No new chemical substances formed; easily reversible; involves state changes or dissolving (e.g. melting ice, boiling water, dissolving sugar). Mass remains strictly unchanged.',
              '• Chemical Change: Atoms rearrange into new products with different properties; usually irreversible (e.g. rusting nail, burning wood, frying egg, acid reacting with metal). Signs: gas evolution, temperature change, light emitted, permanent colour change, precipitate.'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'C6.2',
    topicCode: 'C6',
    topicName: 'Chemical reactions',
    title: 'Rate of Reaction & Collision Theory',
    subject: 'chemistry',
    tier: 'Core & Supplement',
    syllabusSummary: [
      'Describe effects of concentration, surface area, temperature, and catalysts on reaction rate.',
      'Explain using collision theory (particles per unit volume, collision frequency, kinetic energy, Ea).',
      'Practical rate measurement methods (gas syringe, mass loss on balance).'
    ],
    decks: [
      {
        id: 'deck-c6-2',
        subtopicCode: 'C6.2',
        topicCode: 'C6',
        title: 'Rate of Reaction & Collision Theory',
        subtopicHeader: '[C6.2] Rates of Reaction',
        classworkDate: '24/06/2026 - 25/06/2026',
        objectives: [
          'Describe methods to measure reaction rates (gas syringe, balance mass loss).',
          'Explain the 4 rate factors using collision theory.'
        ],
        keywords: ['rate of reaction', 'collision theory', 'activation energy', 'surface area', 'concentration', 'catalyst'],
        slides: [
          {
            id: 'c6-2-s1',
            slideNumber: 1,
            subtopicHeader: '[C6.2] Collision Theory Rules',
            title: 'Collision Theory & Reaction Rates',
            slideType: 'theory',
            content: [
              '• For a reaction to occur, particles must collide with sufficient energy (>= Ea) and in correct orientation.',
              '• Rate = Volume of gas produced / Time OR Mass lost / Time.',
              '• 1. Concentration: More particles per unit volume -> higher frequency of successful collisions.',
              '• 2. Surface Area: Powdering a solid exposes more surface particles -> higher collision frequency.',
              '• 3. Temperature: Increases kinetic energy so particles move faster AND a much higher proportion of particles possess energy exceeding Ea -> significantly higher frequency of effective collisions.',
              '• 4. Catalyst: Speeds up reaction without being consumed by providing an alternative pathway with a LOWER activation energy.'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'C6.3',
    topicCode: 'C6',
    topicName: 'Chemical reactions',
    title: 'Redox Reactions',
    subject: 'chemistry',
    tier: 'Core & Supplement',
    syllabusSummary: [
      'Define redox as simultaneous oxidation and reduction.',
      'Oxidation is gain of oxygen / loss of electrons (OIL); Reduction is loss of oxygen / gain of electrons (RIG).',
      'Roman numerals for oxidation state: iron(II), iron(III), copper(II).'
    ],
    decks: [
      {
        id: 'deck-c6-3',
        subtopicCode: 'C6.3',
        topicCode: 'C6',
        title: 'Redox Reactions & Oxidation States',
        subtopicHeader: '[C6.3] Redox reactions',
        classworkDate: '30/06/2026',
        objectives: [
          'Define oxidation as gain of oxygen / loss of electrons, and reduction as loss of oxygen / gain of electrons.',
          'Identify redox in blast furnace and displacement reactions; use Roman numerals for oxidation numbers.'
        ],
        keywords: ['oxidation', 'reduction', 'redox', 'OILRIG', 'oxidation state', 'thermite'],
        slides: [
          {
            id: 'c6-3-s1',
            slideNumber: 1,
            subtopicHeader: '[C6.3] Redox Definitions',
            title: 'Oxygen Transfer & OILRIG',
            slideType: 'theory',
            content: [
              '• In terms of Oxygen: Oxidation is GAIN of oxygen; Reduction is LOSS of oxygen.',
              '  - Example: Fe2O3 + 3CO -> 2Fe + 3CO2. Iron(III) oxide is reduced (loses O); Carbon monoxide is oxidized (gains O).',
              '• In terms of Electrons (OILRIG):',
              '  - Oxidation Is Loss of electrons.',
              '  - Reduction Is Gain of electrons.',
              '• Oxidation Numbers: Roman numerals show metal charge: Iron(II) is Fe2+, Iron(III) is Fe3+, Copper(II) is Cu2+.'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'C7.1',
    topicCode: 'C7',
    topicName: 'Acids, bases and salts',
    title: 'Acids, Bases & Indicators',
    subject: 'chemistry',
    tier: 'Core',
    syllabusSummary: [
      'Reactions of acids with metals, bases, and carbonates.',
      'Effects on litmus, methyl orange, and universal indicator; bases as metal oxides/hydroxides; alkalis as soluble bases.'
    ],
    decks: [
      {
        id: 'deck-c7-1',
        subtopicCode: 'C7.1',
        topicCode: 'C7',
        title: 'Acids, Alkalis & Indicator Colour Changes',
        subtopicHeader: '[C7.1] Acids and Alkalis',
        classworkDate: '11/06/2026 - 12/06/2025',
        objectives: [
          'Describe the pH scale and chemical nature of acids (H+) and alkalis (OH-).',
          'Recall colour changes of Litmus, Methyl orange, and Universal Indicator.'
        ],
        keywords: ['pH', 'acid', 'alkali', 'base', 'universal indicator', 'methyl orange', 'litmus', 'neutralisation'],
        slides: [
          {
            id: 'c7-1-s1',
            slideNumber: 1,
            subtopicHeader: '[C7.1] Acid & Alkali Chemistry',
            title: 'Acids, Bases & Indicators',
            slideType: 'theory',
            content: [
              '• Aqueous Acids: Release H+ (hydrogen) ions; pH < 7.',
              '• Aqueous Alkalis: Soluble bases releasing OH- (hydroxide) ions; pH > 7.',
              '• Neutral Solution: pH = 7 (H+ and OH- balance to form H2O).',
              '• Indicator Colours:',
              '  - Litmus: Red in acid, Blue in alkali.',
              '  - Methyl Orange: Red in acid (pH < 3.1), Yellow in neutral/alkali (pH > 4.4).',
              '  - Universal Indicator: Red (strong acid) -> Orange/Yellow (weak acid) -> Green (pH 7 neutral) -> Blue (weak alkali) -> Purple (strong alkali).'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'C7.2',
    topicCode: 'C7',
    topicName: 'Acids, bases and salts',
    title: 'Acidic & Basic Oxides',
    subject: 'chemistry',
    tier: 'Core',
    syllabusSummary: [
      'Classify oxides as acidic (SO2, CO2 - non-metal oxides) or basic (CuO, CaO, MgO - metal oxides).'
    ],
    decks: [
      {
        id: 'deck-c7-2',
        subtopicCode: 'C7.2',
        topicCode: 'C7',
        title: 'Classification of Oxides: Basic vs Acidic',
        subtopicHeader: '[C7.2] Indicators & Oxides',
        classworkDate: '12/06/2025',
        objectives: [
          'Classify oxides as basic or acidic related to metallic and non-metallic character.',
          'Describe how basic oxides react with acids and acidic oxides dissolve in water to form acids.'
        ],
        keywords: ['basic oxide', 'acidic oxide', 'metal oxide', 'non-metal oxide'],
        slides: [
          {
            id: 'c7-2-s1',
            slideNumber: 1,
            subtopicHeader: '[C7.2] Metal vs Non-Metal Oxides',
            title: 'Basic and Acidic Oxides',
            slideType: 'theory',
            content: [
              '• Basic Oxides: Formed by metals (e.g. CaO, MgO, CuO, Na2O). React with acids to form salt + water. Soluble basic oxides dissolve in water to form alkaline solutions (pH > 7).',
              '• Acidic Oxides: Formed by non-metals (e.g. SO2, CO2, NO2). Dissolve in water to form acidic solutions (e.g. SO2 + H2O -> H2SO3 acid, pH < 7). React with bases to form salts.'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'C7.3',
    topicCode: 'C7',
    topicName: 'Acids, bases and salts',
    title: 'Preparation of Salts',
    subject: 'chemistry',
    tier: 'Core & Supplement',
    syllabusSummary: [
      'Preparation of soluble salts: acid + alkali by titration; acid + excess metal / insoluble base / carbonate followed by filtration and crystallization.',
      'Preparation of insoluble salts by precipitation.'
    ],
    decks: [
      {
        id: 'deck-c7-3',
        subtopicCode: 'C7.3',
        topicCode: 'C7',
        title: 'Making Soluble & Insoluble Salts Practical',
        subtopicHeader: '[C7.3] Making insoluble salts',
        classworkDate: '18/06/2025 - 24/06/2025',
        objectives: [
          'Describe preparing copper sulfate crystals from copper oxide and sulfuric acid.',
          'Describe preparing insoluble salts by precipitation.'
        ],
        keywords: ['salt preparation', 'excess base', 'filtration', 'crystallisation', 'precipitation', 'filtrate', 'residue'],
        slides: [
          {
            id: 'c7-3-s1',
            slideNumber: 1,
            subtopicHeader: '[C7.3] Soluble Salt Method',
            title: 'Soluble Salt Practical (Copper Sulfate Crystals)',
            slideType: 'practical',
            content: [
              '1. Warm dilute sulfuric acid in a beaker.',
              '2. Add copper(II) oxide powder in EXCESS (until solid remains at bottom) to ensure ALL acid has reacted.',
              '3. Filter mixture through filter paper into evaporating basin to remove unreacted solid copper oxide (residue).',
              '4. Heat filtrate over water bath to evaporate water until point of crystallization (crystals form on glass rod).',
              '5. Leave saturated solution to cool slowly; filter off crystals and dry between filter papers.'
            ]
          },
          {
            id: 'c7-3-s2',
            slideNumber: 2,
            subtopicHeader: '[C7.3] Insoluble Salt Method',
            title: 'Insoluble Salts via Precipitation',
            slideType: 'theory',
            content: [
              '• General: Soluble salt (aq) + Soluble salt (aq) -> Insoluble salt (s) + Soluble salt (aq).',
              '• Example: Na2CO3 (aq) + CuSO4 (aq) -> CuCO3 (s) [precipitate] + Na2SO4 (aq).',
              '• Purification: 1) Mix solutions; 2) Filter off insoluble precipitate; 3) Wash residue with distilled water to remove traces of solution; 4) Dry in a warm oven.'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'C8.1',
    topicCode: 'C8',
    topicName: 'The Periodic Table',
    title: 'Arrangement of Elements',
    subject: 'chemistry',
    tier: 'Core & Supplement',
    syllabusSummary: [
      'Periodic table arranged in order of proton number; periods and groups; transition from metallic to non-metallic character across a period.'
    ],
    decks: [
      {
        id: 'deck-c8-1',
        subtopicCode: 'C8.1',
        topicCode: 'C8',
        title: 'Periodic Table Arrangement & Trends',
        subtopicHeader: '[C8.1] The Periodic Table',
        classworkDate: '30/04/2025',
        objectives: [
          'Describe arrangement by increasing atomic number.',
          'Describe transition from metallic to non-metallic character across a period.'
        ],
        keywords: ['periodic table', 'periods', 'groups', 'metallic character'],
        slides: [
          {
            id: 'c8-1-s1',
            slideNumber: 1,
            subtopicHeader: '[C8.1] Organization',
            title: 'Periods, Groups & Metallic Character',
            slideType: 'theory',
            content: [
              '• Elements arranged in order of increasing atomic (proton) number.',
              '• Periods (horizontal rows): Number of electron shells.',
              '• Groups (vertical columns): Elements with same number of outer-shell electrons and similar chemical properties.',
              '• Across a Period (Left to Right): Elements change from metals (reactive metals on far left) to metalloids, then to non-metals on the right.'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'C8.2',
    topicCode: 'C8',
    topicName: 'The Periodic Table',
    title: 'Group I Alkali Metals',
    subject: 'chemistry',
    tier: 'Core & Supplement',
    syllabusSummary: [
      'Alkali metals: Li, Na, K soft metals; trends down group: decreasing melting point, increasing density, increasing reactivity with water.'
    ],
    decks: [
      {
        id: 'deck-c8-2',
        subtopicCode: 'C8.2',
        topicCode: 'C8',
        title: 'Group 1 Alkali Metals Properties & Reactions',
        subtopicHeader: '[C8.2] Group 1 Metals',
        classworkDate: '14/05/2025',
        objectives: [
          'Describe Group 1 metals as soft, low-density metals.',
          'Explain trends down Group 1: melting point decreases, density increases, reactivity increases.',
          'Write equations for reactions with oxygen and water.'
        ],
        keywords: ['alkali metals', 'lithium', 'sodium', 'potassium', 'reactivity trend', 'metal hydroxide'],
        slides: [
          {
            id: 'c8-2-s1',
            slideNumber: 1,
            subtopicHeader: '[C8.2] Group 1 Trends',
            title: 'Properties & Reactivity Trend Down Group 1',
            slideType: 'theory',
            content: [
              '• Physical Properties: Silvery, soft enough to cut with a knife, low density (Li, Na, K float on water), low melting points.',
              '• Reactions with Water: Metal + Water -> Metal Hydroxide + Hydrogen gas.',
              '  - Lithium: Fizzes gently, floats, dissolves.',
              '  - Sodium: Melts into a silvery ball, fizzes vigorously, moves across water.',
              '  - Potassium: Ignites instantly with a lilac flame, pops with small explosion.',
              '• Why Reactivity Increases Down Group: Atoms get larger -> outer electron is further from positive nucleus and shielded by more electron shells -> weaker electrostatic attraction -> outer electron is lost more easily.'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'C8.3',
    topicCode: 'C8',
    topicName: 'The Periodic Table',
    title: 'Group VII Halogens',
    subject: 'chemistry',
    tier: 'Core & Supplement',
    syllabusSummary: [
      'Halogens: Cl2, Br2, I2 diatomic non-metals; trends: increasing density, decreasing reactivity.',
      'Appearances: Cl2 pale yellow-green gas, Br2 red-brown liquid, I2 grey-black solid; displacement reactions.'
    ],
    decks: [
      {
        id: 'deck-c8-3',
        subtopicCode: 'C8.3',
        topicCode: 'C8',
        title: 'Halogens & Displacement Reactions Practical',
        subtopicHeader: '[C8.3] Group 7 - Halogens',
        classworkDate: '15/05/2025 - 26/03/2026',
        objectives: [
          'Describe colours and states of halogens (Cl2, Br2, I2).',
          'Describe and explain displacement reactions of halogens with halide ions.'
        ],
        keywords: ['halogen', 'halide', 'diatomic', 'displacement', 'spotting tile'],
        slides: [
          {
            id: 'c8-3-s1',
            slideNumber: 1,
            subtopicHeader: '[C8.3] Halogen Appearances & Trends',
            title: 'Halogens Properties & Reactivity',
            slideType: 'theory',
            content: [
              '• Fluorine (F2): Pale yellow gas.',
              '• Chlorine (Cl2): Pale yellow-green gas.',
              '• Bromine (Br2): Red-brown liquid (forms orange vapour).',
              '• Iodine (I2): Grey-black solid (sublimes to purple vapour; brown in solution).',
              '• Trends Down Group VII: Melting/boiling points increase; density increases; reactivity DECREASES.',
              '• Why Reactivity Decreases: Larger atomic radius -> incoming electron is further from nucleus and more shielded -> harder to attract and gain an electron.'
            ]
          },
          {
            id: 'c8-3-s2',
            slideNumber: 2,
            subtopicHeader: '[C8.3] Halogen Displacement',
            title: 'Displacement Reactions on Spotting Tile',
            slideType: 'practical',
            content: [
              '• Rule: A more reactive halogen will displace a less reactive halide ion from its aqueous salt solution.',
              '• Chlorine + Potassium Bromide -> Potassium Chloride + Bromine (turns orange): Cl2 + 2KBr -> 2KCl + Br2.',
              '• Chlorine + Potassium Iodide -> Potassium Chloride + Iodine (turns brown): Cl2 + 2KI -> 2KCl + I2.',
              '• Bromine + Potassium Iodide -> Potassium Bromide + Iodine (turns brown): Br2 + 2KI -> 2KBr + I2.',
              '• Bromine + Potassium Chloride -> NO REACTION (bromine is less reactive than chlorine).'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'C8.4',
    topicCode: 'C8',
    topicName: 'The Periodic Table',
    title: 'Transition Elements',
    subject: 'chemistry',
    tier: 'Core',
    syllabusSummary: [
      'Transition elements: high densities, high melting points, form coloured compounds, act as catalysts.'
    ],
    decks: [
      {
        id: 'deck-c8-4',
        subtopicCode: 'C8.4',
        topicCode: 'C8',
        title: 'Transition Elements Properties & Catalysis',
        subtopicHeader: '[C8.4] Transition Metals and Noble Gases',
        classworkDate: '30/03/2026',
        objectives: [
          'State typical properties of transition metals.',
          'Compare transition metals with Group 1 alkali metals.'
        ],
        keywords: ['transition metals', 'density', 'coloured compounds', 'catalyst'],
        slides: [
          {
            id: 'c8-4-s1',
            slideNumber: 1,
            subtopicHeader: '[C8.4] Properties',
            title: 'Physical & Chemical Properties of Transition Metals',
            slideType: 'theory',
            content: [
              '• Location: Central d-block of periodic table (between Groups II and III).',
              '• Physical Properties: High density, high melting and boiling points, hard and strong.',
              '• Chemical Properties: 1) Form colourful compounds (e.g. Cu2+ blue, Fe2+ green, Fe3+ brown); 2) Have variable oxidation states (e.g. Fe(II) and Fe(III)); 3) Often act as industrial catalysts (e.g. Iron in Haber process, Nickel in alkene hydrogenation).'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'C8.5',
    topicCode: 'C8',
    topicName: 'The Periodic Table',
    title: 'Noble Gases',
    subject: 'chemistry',
    tier: 'Core',
    syllabusSummary: [
      'Group VIII/0 noble gases as unreactive, monatomic gases; explain stability in terms of full outer shell; uses of He, Ne, Ar, Kr.'
    ],
    decks: [
      {
        id: 'deck-c8-5',
        subtopicCode: 'C8.5',
        topicCode: 'C8',
        title: 'Noble Gases: Inert Monatomic Elements & Uses',
        subtopicHeader: '[C8.5] Noble Gases',
        classworkDate: '30/03/2026',
        objectives: [
          'Explain why noble gases are unreactive and monatomic.',
          'State everyday uses of helium, neon, argon, and krypton.'
        ],
        keywords: ['noble gases', 'monatomic', 'inert', 'full outer shell'],
        slides: [
          {
            id: 'c8-5-s1',
            slideNumber: 1,
            subtopicHeader: '[C8.5] Noble Gases',
            title: 'Electronic Stability & Applications',
            slideType: 'theory',
            content: [
              '• Inert Nature: Noble gases possess a full, stable outer shell of electrons (He has 2; Ne, Ar, Kr have 8). They have no tendency to lose, gain, or share electrons.',
              '• Monatomic: Exist as single, unbonded atoms.',
              '• Uses:',
              '  - Helium: Low density and non-flammable; used in party balloons and airships.',
              '  - Neon: Emits glowing orange-red light when electric discharge passes through; used in advertising signs.',
              '  - Argon: Inert shielding gas in filament light bulbs to prevent tungsten oxidation, and in arc welding.',
              '  - Krypton: In laser eye surgery and high-efficiency double glazing windows.'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'C9.1',
    topicCode: 'C9',
    topicName: 'Metals',
    title: 'Properties of Metals',
    subject: 'chemistry',
    tier: 'Core',
    syllabusSummary: [
      'Compare physical properties of metals and non-metals (thermal/electrical conductivity, malleability, ductility, mp/bp).',
      'Reactions of metals with dilute acids, cold water, and steam.'
    ],
    decks: [
      {
        id: 'deck-c9-1',
        subtopicCode: 'C9.1',
        topicCode: 'C9',
        title: 'Properties and Uses of Metals',
        subtopicHeader: '[C9.1] Properties and Uses of Metals',
        classworkDate: '05/11/2025',
        objectives: [
          'Compare physical properties of metals and non-metals.',
          'Explain how properties make metals suitable for specific applications.'
        ],
        keywords: ['malleable', 'ductile', 'sonorous', 'thermal conductivity', 'electrical conductivity'],
        slides: [
          {
            id: 'c9-1-s1',
            slideNumber: 1,
            subtopicHeader: '[C9.1] Metallic Properties',
            title: 'Metals vs Non-Metals',
            slideType: 'theory',
            content: [
              '• Electrical Conductivity: Good (delocalised electrons free to move). Non-metals are poor (except graphite).',
              '• Thermal Conductivity: Good (lattice vibrations + mobile electrons). Non-metals are poor insulators.',
              '• Mechanical Properties: Malleable (can be hammered into shape) and ductile (can be drawn into wires) because layers of metal ions slide over each other without breaking metallic bonds.',
              '• Melting/Boiling Points: High (strong metallic bonding). Non-metals typically low.'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'C9.2',
    topicCode: 'C9',
    topicName: 'Metals',
    title: 'Uses of Metals',
    subject: 'chemistry',
    tier: 'Core',
    syllabusSummary: [
      'Uses in terms of physical properties: aluminium (aircraft - low density, overhead cables - low density & conductivity, food containers - corrosion resistance); copper (wiring - good electrical conductivity).'
    ],
    decks: [
      {
        id: 'deck-c9-2',
        subtopicCode: 'C9.2',
        topicCode: 'C9',
        title: 'Specific Uses of Aluminium and Copper',
        subtopicHeader: '[C9.2] Uses of Metals',
        classworkDate: '05/11/2025',
        objectives: [
          'Explain why aluminium is used for aircraft, overhead cables, and food containers.',
          'Explain why copper is used for electrical wiring.'
        ],
        keywords: ['aluminium', 'copper', 'overhead cables', 'aircraft', 'wiring'],
        slides: [
          {
            id: 'c9-2-s1',
            slideNumber: 1,
            subtopicHeader: '[C9.2] Metal Applications',
            title: 'Linking Properties to Industrial Uses',
            slideType: 'theory',
            content: [
              '• Aluminium in Aircraft: Very low density (lightweight) and high strength-to-weight ratio.',
              '• Aluminium in Overhead Power Cables: Low density prevents cable sagging, coupled with good electrical conductivity.',
              '• Aluminium in Food Containers: Forms a protective, unreactive oxide layer that resists corrosion by acidic foods.',
              '• Copper in Electrical Wiring: Outstanding electrical conductor, ductile, and high melting point for safe current flow.'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'C9.3',
    topicCode: 'C9',
    topicName: 'Metals',
    title: 'Alloys & Their Properties',
    subject: 'chemistry',
    tier: 'Core & Supplement',
    syllabusSummary: [
      'Describe alloys as mixtures of metal with other elements: brass (Cu + Zn), stainless steel (Fe + Cr + Ni + C).',
      'Explain in terms of structure why alloys are harder/stronger (different sized atoms disrupt regular layers so they cannot slide).'
    ],
    decks: [
      {
        id: 'deck-c9-3',
        subtopicCode: 'C9.3',
        topicCode: 'C9',
        title: 'Alloys: Composition, Structure & Hardness',
        subtopicHeader: '[C9.3] Alloys',
        classworkDate: '10/11/2025',
        objectives: [
          'Describe what an alloy is and how its structure differs from pure metals.',
          'Explain why alloys are harder and stronger than pure metals.'
        ],
        keywords: ['alloy', 'mixture', 'brass', 'stainless steel', 'bronze', 'layers sliding'],
        slides: [
          {
            id: 'c9-3-s1',
            slideNumber: 1,
            subtopicHeader: '[C9.3] Why Alloys are Harder',
            title: 'Disrupted Layers in Alloys',
            slideType: 'theory',
            content: [
              '• Pure Metals: Contain identical atoms arranged in uniform, regular layers. When force is applied, these layers slide easily over one another, making pure metals relatively soft.',
              '• Alloys: Mixtures of a metal with other elements (e.g. Brass = Copper + Zinc; Stainless Steel = Iron + Chromium + Nickel + Carbon; Bronze = Copper + Tin).',
              '• Structural Explanation: Different-sized atoms distort and disrupt the regular layers of atoms. This prevents the layers from sliding over each other, making alloys much harder and stronger.'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'C9.4',
    topicCode: 'C9',
    topicName: 'Metals',
    title: 'Reactivity Series',
    subject: 'chemistry',
    tier: 'Core & Supplement',
    syllabusSummary: [
      'Order: K > Na > Ca > Mg > Al > (C) > Zn > Fe > (H) > Cu > Ag > Au.',
      'Reactions with cold water, steam, and dilute hydrochloric acid.'
    ],
    decks: [
      {
        id: 'deck-c9-4',
        subtopicCode: 'C9.4',
        topicCode: 'C9',
        title: 'The Reactivity Series of Metals',
        subtopicHeader: '[C9.4] Reactivity Series',
        classworkDate: '07/11/2025',
        objectives: [
          'Recall the order of the reactivity series.',
          'Describe reactions with cold water, steam, and dilute acids.'
        ],
        keywords: ['reactivity series', 'displacement', 'effervescence', 'hydrogen'],
        slides: [
          {
            id: 'c9-4-s1',
            slideNumber: 1,
            subtopicHeader: '[C9.4] Reactivity Hierarchy',
            title: 'Reactions with Water, Steam & Acid',
            slideType: 'theory',
            content: [
              '• Order: Potassium > Sodium > Calcium > Magnesium > Aluminium > (Carbon) > Zinc > Iron > (Hydrogen) > Copper > Silver > Gold.',
              '• Cold Water: K, Na, Ca react violently to produce metal hydroxide + hydrogen gas.',
              '• Steam: Mg, Zn, Fe react slowly with steam to produce metal oxide + hydrogen gas.',
              '• Dilute Acid: Metals above hydrogen react with dilute HCl to produce metal chloride salt + hydrogen gas. Metals below hydrogen (Cu, Ag, Au) DO NOT react.'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'C9.5',
    topicCode: 'C9',
    topicName: 'Metals',
    title: 'Corrosion of Metals & Rusting',
    subject: 'chemistry',
    tier: 'Core',
    syllabusSummary: [
      'Conditions required for rusting of iron: oxygen and water must both be present simultaneously.',
      'Rusting is an oxidation reaction forming hydrated iron(III) oxide (Fe2O3·xH2O).',
      'Investigating rusting: control experiments with dry air (drying agent), boiled water with oil seal, and tap water.',
      'Barrier methods of rust prevention: painting, greasing/oiling, plastic coating, and tin plating.',
      'Sacrificial protection and galvanising: zinc is more reactive than iron, oxidising preferentially (Zn -> Zn2+ + 2e-) even when scratched.'
    ],
    decks: [
      {
        id: 'deck-c9-5-1',
        subtopicCode: 'C9.5',
        topicCode: 'C9',
        title: 'Lesson 1: Corrosion of Metals, Rusting Conditions & Barrier Protection',
        subtopicHeader: '[C9.5] Corrosion of Metals & Rusting',
        classworkDate: '08/11/2025',
        objectives: [
          'Define corrosion and distinguish it from the specific rusting of iron and steel.',
          'State that both oxygen (air) and water are essential conditions for iron to rust.',
          'Explain how barrier methods (painting, greasing, plastic coating) prevent corrosion.'
        ],
        keywords: ['corrosion', 'rusting', 'oxidation', 'hydrated iron(III) oxide', 'barrier method', 'painting', 'greasing', 'plastic coating'],
        starterLookBack: {
          question: 'What is oxidation in terms of oxygen gain, and which elements in Topic C9 are most easily oxidised?',
          answer: 'Oxidation is the gain of oxygen or loss of electrons. Reactive metals such as potassium, sodium, and magnesium oxidise very rapidly, whereas iron oxidises slowly in moist air.'
        },
        starterLookForward: {
          question: 'Why does a bicycle chain left in the rain become stiff and reddish-brown, while an aluminium window frame remains shiny?',
          answer: 'Iron in the bicycle chain reacts with water and oxygen to form flaky, porous rust (Fe2O3·xH2O) which falls away. Aluminium quickly forms an unreactive, adherent protective oxide layer (Al2O3) that seals the surface against further attack.'
        },
        slides: [
          {
            id: 'c9-5-1-s1',
            slideNumber: 1,
            subtopicHeader: '[C9.5] Starter & Lesson Objectives',
            title: 'Starter: What Causes Metals to Corrode?',
            slideType: 'starter',
            content: [
              '• Objectives: Define corrosion and distinguish it from rusting; state the two mandatory conditions for rusting; evaluate barrier methods.',
              '• Key Definition: Corrosion is the destruction of any metal through chemical reactions with environmental substances (water, oxygen, acidic gases).',
              '• Vital Distinction: Rusting is the scientific term used EXCLUSIVELY for the corrosion of iron and iron alloys (such as mild steel). All other metals corrode, but they do NOT rust.',
              '• Thought Experiment: Why do ocean ships and seaside bridges suffer from metal decay far faster than structures in arid desert environments?'
            ]
          },
          {
            id: 'c9-5-1-s2',
            slideNumber: 2,
            subtopicHeader: '[C9.5] Chemistry of Rusting',
            title: 'The Chemical Nature of Rust: Hydrated Iron(III) Oxide',
            slideType: 'theory',
            content: [
              '• Word Equation: Iron + Oxygen + Water ➔ Hydrated Iron(III) oxide (Rust).',
              '• Chemical Formula: Fe2O3·xH2O, where x represents a variable number of water molecules bound into the crystal lattice.',
              '• Balanced Symbol Equation: 4Fe(s) + 3O2(g) + 2xH2O(l) ➔ 2Fe2O3·xH2O(s).',
              '• Redox Nature: Iron undergoes oxidation by losing electrons: Fe ➔ Fe3+ + 3e-. Oxygen undergoes reduction by gaining electrons: O2 + 4e- ➔ 2O2-.',
              '• Porous Structure: Unlike aluminium oxide, rust is soft, flaky, and porous. As it peels off, fresh underlying iron is continually exposed to oxygen and water until the entire object fails.'
            ]
          },
          {
            id: 'c9-5-1-s3',
            slideNumber: 3,
            subtopicHeader: '[C9.5] Investigating Rusting Conditions',
            title: 'Required Practical: The 4-Test-Tube Experiment',
            slideType: 'practical',
            content: [
              '• Tube 1 (Control - Air + Water): Clean iron nail partially submerged in tap water. Result: HEAVY RUST forms within 3–5 days (both O2 and H2O present).',
              '• Tube 2 (Water Only - No Oxygen): Clean nail in boiled water topped with an oil barrier. Boiled water drives out dissolved O2; oil prevents air re-entry. Result: NO RUST (proves oxygen is required).',
              '• Tube 3 (Air Only - No Water): Clean nail in sealed dry test tube with anhydrous calcium chloride (drying agent) and rubber bung. Result: NO RUST (proves water is required).',
              '• Tube 4 (Accelerated - Salt Water): Clean nail in sodium chloride solution + air. Dissolved Na+ and Cl- ions increase electrolyte conductivity, drastically accelerating rust rate!'
            ],
            practicalInfo: {
              aim: 'Determine the necessary conditions (oxygen and water) required for iron to rust.',
              equipment: ['4 test tubes with racks', 'Clean iron nails', 'Boiled deionised water', 'Paraffin/mineral oil', 'Anhydrous calcium chloride', 'Sodium chloride solution', 'Rubber bungs'],
              method: [
                'Set up Tube 1 with an iron nail in tap water exposed to air.',
                'Set up Tube 2 by boiling water to expel dissolved air, inserting the nail, and pouring a 1 cm layer of oil on top.',
                'Set up Tube 3 by placing anhydrous calcium chloride at the bottom of a dry test tube, inserting a nail on cotton wool, and sealing tightly with a rubber bung.',
                'Set up Tube 4 with an iron nail in 3% NaCl salt solution exposed to air.',
                'Leave tubes undisturbed for 5 days and record rust formation and colour changes.'
              ],
              riskAssessment: [
                { hazard: 'Iron nails', risk: 'Puncture wounds or scratches from sharp points', precaution: 'Handle with care; inspect nails before use.' },
                { hazard: 'Boiling water', risk: 'Scalding and thermal burns', precaution: 'Use heat-resistant gloves and allow water to cool slightly before adding oil.' }
              ]
            }
          },
          {
            id: 'c9-5-1-s4',
            slideNumber: 4,
            subtopicHeader: '[C9.5] Barrier Methods of Prevention',
            title: 'Preventing Rust: Physical Barrier Methods',
            slideType: 'theory',
            content: [
              '• Fundamental Principle: Physical barriers place an impermeable shield between the metal and the atmosphere, excluding BOTH oxygen and moisture.',
              '• Painting: Applied to large stationary structures (car bodies, suspension bridges, garden gates, ship superstructures). Cost-effective and decorative, but if the paint is scratched or chips, rust will form beneath the paint layer.',
              '• Greasing and Oiling: Used for moving mechanical machinery, bicycle chains, tools, and engine components where paint would be worn away by friction.',
              '• Plastic Coating: Applied to wire coat hangers, garden fences, dishwasher racks, and bicycle baskets. Impervious to water and resists scratching.',
              '• Electroplating / Tin Plating: Food cans made of mild steel are plated with a thin layer of tin (Sn). Tin is non-toxic and unreactive with weak food acids.'
            ]
          },
          {
            id: 'c9-5-1-s5',
            slideNumber: 5,
            subtopicHeader: '[C9.5] AfL Practice & Fill in the Blanks',
            title: 'Task: Apply Rusting Concepts & Methods',
            slideType: 'task',
            content: [
              'Task 1: Complete the fill-in-the-blanks using the technical word bank.',
              'Task 2: Select the best rust prevention method for bicycle gears vs suspension bridge cables.',
              'Task 3 (Exam Challenge): Explain why a steel food can rusts much faster if the internal tin coating is dented or scratched.'
            ],
            task: {
              taskName: 'Corrosion and Rust Prevention Matching',
              instructions: 'Fill in the blanks and solve the industrial engineering application questions.',
              wordBank: ['oxygen', 'water', 'hydrated iron(III) oxide', 'barrier', 'greasing', 'painting', 'oxidation', 'electrolyte'],
              fillBlanks: 'Rusting is an [oxidation] reaction requiring both [oxygen] and [water] simultaneously to produce [hydrated iron(III) oxide]. Applying a [barrier] like [painting] for bridges or [greasing] for moving chains keeps out moist air. Dissolved salt acts as an [electrolyte] that accelerates rusting.',
              solution: 'oxidation, oxygen, water, hydrated iron(III) oxide, barrier, painting, greasing, electrolyte.',
              challengeQuestion: 'Why does iron rust faster in seaside towns compared to inland desert towns?',
              challengeSolution: 'Seaside towns have high humidity (plentiful water vapor) and airborne salt spray (NaCl). Salt dissolves in moisture forming an electrolyte solution, which facilitates electron transfer during oxidation and greatly accelerates rusting.'
            }
          },
          {
            id: 'c9-5-1-s6',
            slideNumber: 6,
            subtopicHeader: '[C9.5] Plenary Knowledge Check',
            title: 'Exit Ticket: 4-Point Summary & Check',
            slideType: 'plenary',
            content: [
              '• Q1: What are the two essential conditions required for iron to rust? ➔ Oxygen and water.',
              '• Q2: What is the chemical name and formula for rust? ➔ Hydrated iron(III) oxide, Fe2O3·xH2O.',
              '• Q3: Why is boiling the water necessary in the control tube? ➔ Boiling drives out dissolved oxygen gas.',
              '• Q4: Why is greasing preferred over painting for bicycle chains? ➔ Greasing lubricates moving parts while preventing oxygen and water contact; paint would quickly crack and scrape off under motion.'
            ]
          }
        ]
      },
      {
        id: 'deck-c9-5-2',
        subtopicCode: 'C9.5',
        topicCode: 'C9',
        title: 'Lesson 2: Sacrificial Protection, Galvanising & Advanced Prevention',
        subtopicHeader: '[C9.5] Sacrificial Protection & Galvanising',
        classworkDate: '09/11/2025',
        objectives: [
          'Explain sacrificial protection and galvanising using the reactivity series of metals.',
          'Describe the role of zinc coating on steel (dual barrier and sacrificial protection).',
          'Evaluate methods of rust prevention for specific engineering applications (ships, underground pipes, food cans).'
        ],
        keywords: ['sacrificial protection', 'galvanising', 'zinc', 'reactivity series', 'sacrificial anode', 'stainless steel', 'alloying'],
        starterLookBack: {
          question: 'Where is zinc placed relative to iron in the reactivity series?',
          answer: 'Zinc is above iron in the reactivity series (K, Na, Ca, Mg, Al, Zn, Fe...). Therefore, zinc is more reactive than iron and loses electrons more readily.'
        },
        starterLookForward: {
          question: 'If a galvanised iron roof is scratched, exposing the iron underneath, why does the iron still NOT rust?',
          answer: 'Because zinc is more reactive than iron. Zinc gives up its electrons preferentially (Zn -> Zn2+ + 2e-) to protect the iron, sacrificing itself.'
        },
        slides: [
          {
            id: 'c9-5-2-s1',
            slideNumber: 1,
            subtopicHeader: '[C9.5] Starter & Objectives',
            title: 'Starter: Beyond Barriers — Active Metal Protection',
            slideType: 'starter',
            content: [
              '• Objectives: Explain sacrificial protection using the reactivity series; distinguish galvanising from pure barrier methods; compare alloy resistance (stainless steel).',
              '• The Dilemma: If a painted steel ship hull is scratched on a rock at sea, seawater and oxygen reach the bare steel immediately. How can we protect the steel even when the surface is scratched?',
              '• Key Concept: Sacrificial protection uses a MORE REACTIVE metal that sacrifices itself to save the iron.'
            ]
          },
          {
            id: 'c9-5-2-s2',
            slideNumber: 2,
            subtopicHeader: '[C9.5] Galvanising with Zinc',
            title: 'Galvanising: The Dual Protection Mechanism',
            slideType: 'theory',
            content: [
              '• Definition: Galvanising is the process of coating iron or steel with a protective layer of zinc (often by hot-dip galvanising in molten zinc).',
              '• Mechanism 1 (Barrier Protection): The continuous zinc layer physically prevents oxygen and water from reaching the underlying steel.',
              '• Mechanism 2 (Sacrificial Protection): If the zinc coating is scratched, chipped, or cut, the iron remains protected!',
              '• Why It Works: Zinc is higher in the reactivity series than iron (Zn > Fe). Zinc oxidises more readily, releasing electrons: Zn(s) ➔ Zn2+(aq) + 2e-.',
              '• Electron Protection: The released electrons flow to the iron, preventing Fe from losing electrons and becoming Fe2+/Fe3+. Iron remains unoxidised until all surrounding zinc has reacted.',
              '• Common Applications: Corrugated steel roofing, motorway crash barriers, buckets, nails, and car chassis.'
            ]
          },
          {
            id: 'c9-5-2-s3',
            slideNumber: 3,
            subtopicHeader: '[C9.5] Sacrificial Anodes in Industry',
            title: 'Sacrificial Anodes: Ship Hulls & Underground Pipelines',
            slideType: 'theory',
            content: [
              '• Ship Hulls at Sea: Large blocks of zinc or magnesium (sacrificial anodes) are bolted at regular intervals onto the steel hull and bronze propeller shafts.',
              '• Action: In salty seawater (strong electrolyte), the zinc blocks corrode slowly over months, protecting the steel hull. When depleted, the cheap zinc blocks are easily unbolted and replaced during routine dry-dock maintenance.',
              '• Underground Gas & Oil Steel Pipelines: Zinc or magnesium rods are buried adjacent to the steel pipe and connected via electrical cables. The zinc anode corrodes in the moist soil, keeping the underground pipe intact without digging up miles of pipeline.',
              '• Comparison with Copper: If iron is connected to a LESS reactive metal like copper (Cu < Fe), the iron oxidises much FASTER because iron sacrifices itself to copper!'
            ]
          },
          {
            id: 'c9-5-2-s4',
            slideNumber: 4,
            subtopicHeader: '[C9.5] Alloying & Stainless Steel',
            title: 'Alloying: Stainless Steel for Permanent Protection',
            slideType: 'theory',
            content: [
              '• Composition: Stainless steel is an alloy composed of iron mixed with chromium (~18%), nickel (~8%), and carbon.',
              '• Protective Mechanism: Chromium reacts with atmospheric oxygen to form an invisible, microscopic, self-repairing layer of chromium(III) oxide (Cr2O3) across the surface.',
              '• Self-Healing: If scratched, fresh chromium in the alloy instantly reacts with oxygen to restore the oxide film, preventing rust from ever taking hold.',
              '• Industrial & Domestic Uses: Cutlery, surgical instruments, kitchen sinks, chemical reaction vessels, and brewery vats.',
              '• Trade-off: Stainless steel is significantly more expensive than mild steel, so it is reserved for cutlery, medical equipment, and chemical plants rather than large bridges or car bodies.'
            ]
          },
          {
            id: 'c9-5-2-s5',
            slideNumber: 5,
            subtopicHeader: '[C9.5] Engineering Application Matrix',
            title: 'Task: Choose the Right Protection Method',
            slideType: 'task',
            content: [
              'Match each object to the optimal rust prevention method and justify your choice based on durability, cost, and friction.',
              '1. Underground steel gas pipeline ➔ Sacrificial magnesium anode.',
              '2. Surgical scalpel / hospital instruments ➔ Stainless steel alloy.',
              '3. Suspension bridge support cables ➔ Galvanising and heavy industrial painting.',
              '4. Bicycle chain links ➔ Oiling / greasing.',
              '5. Steel baked bean tin ➔ Food-grade tin (Sn) plating or polymer lining.'
            ],
            task: {
              taskName: 'Industrial Corrosion Prevention Decision Matrix',
              instructions: 'Select the optimal method for each industrial challenge and justify using chemical reasoning.',
              wordBank: ['sacrificial anode', 'galvanising', 'stainless steel', 'greasing', 'tin plating', 'impermeable'],
              fillBlanks: 'Underground pipelines use [sacrificial anode] blocks of zinc or magnesium. Surgical scalpels are made of [stainless steel] for sterile corrosion resistance. Motorway crash barriers employ [galvanising] for long-term outdoor durability. Moving machine gears require [greasing] to reduce friction while excluding water.',
              solution: 'sacrificial anode, stainless steel, galvanising, greasing.',
              challengeQuestion: 'Explain why tin cans are suitable for canned soup, but once opened and dented, must not be used to store leftover acidic food in the fridge.',
              challengeSolution: 'Tin (Sn) is less reactive than iron. While the coating is intact, it acts as a barrier. If the tin coating is scratched or dented, iron is exposed in contact with tin. Because iron is MORE reactive than tin, iron acts as the sacrificial anode and corrodes even faster than pure iron, contaminating the food.'
            }
          },
          {
            id: 'c9-5-2-s6',
            slideNumber: 6,
            subtopicHeader: '[C9.5] Comprehensive Plenary & Exam Master',
            title: 'Exam Master: Key Takeaways & Cambridge Exam Tips',
            slideType: 'plenary',
            content: [
              '• Condition Rule: Rusting ONLY occurs when BOTH oxygen (O2) and water (H2O) are present. Salt water accelerates the rate.',
              '• Barrier Rule: Paint, grease, plastic, and tin provide physical barriers. If a barrier is breached, rusting begins.',
              '• Sacrificial Rule: Zinc and magnesium are more reactive than iron. They donate electrons (Zn ➔ Zn2+ + 2e-), sacrificially protecting iron even when scratched!',
              '• Galvanising = Dual protection (zinc barrier + sacrificial protection).',
              '• Examiner Tip: Never say "metals rust" in an exam. Only IRON and STEEL rust; all other metals corrode!'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'C9.6',
    topicCode: 'C9',
    topicName: 'Metals',
    title: 'Extraction of Metals',
    subject: 'chemistry',
    tier: 'Core & Supplement',
    syllabusSummary: [
      'Ease in obtaining metals related to reactivity series.',
      'Iron extracted from hematite by carbon reduction in blast furnace (C + O2, C + CO2, Fe2O3 + CO).',
      'Aluminium extracted from bauxite by electrolysis.'
    ],
    decks: [
      {
        id: 'deck-c9-6',
        subtopicCode: 'C9.6',
        topicCode: 'C9',
        title: 'Metal Extraction: Blast Furnace & Electrolysis',
        subtopicHeader: '[C9.6] Extraction of Metals',
        classworkDate: '25/03/2026',
        objectives: [
          'Relate extraction method to position in reactivity series.',
          'Describe extraction of aluminium from bauxite and iron from hematite in the blast furnace.'
        ],
        keywords: ['bauxite', 'hematite', 'blast furnace', 'coke', 'limestone', 'reduction'],
        slides: [
          {
            id: 'c9-6-s1',
            slideNumber: 1,
            subtopicHeader: '[C9.6] Blast Furnace Steps',
            title: 'Extraction of Iron in the Blast Furnace',
            slideType: 'theory',
            content: [
              '• Raw Materials: Hematite (Fe2O3), Coke (C), Limestone (CaCO3), Hot air blast.',
              '• Step 1 (Heat generation): C + O2 -> CO2 (highly exothermic combustion).',
              '• Step 2 (Reducing agent formation): C + CO2 -> 2CO (carbon monoxide produced).',
              '• Step 3 (Reduction of iron): Fe2O3 + 3CO -> 2Fe + 3CO2 (iron(III) oxide reduced to molten iron).',
              '• Slag Formation: Limestone thermal decomposition CaCO3 -> CaO + CO2. Basic CaO reacts with acidic sand impurities: CaO + SiO2 -> CaSiO3 (molten slag floats on iron).'
            ]
          },
          {
            id: 'c9-6-s2',
            slideNumber: 2,
            subtopicHeader: '[C9.6] Aluminium Extraction',
            title: 'Electrolysis of Aluminium from Bauxite',
            slideType: 'theory',
            content: [
              '• Aluminium is more reactive than carbon, so carbon reduction cannot be used.',
              '• Aluminium oxide (from bauxite) is dissolved in molten cryolite to lower melting point from 2000°C to ~950°C (saving massive electrical energy).',
              '• Cathode (-): Al3+ + 3e- -> Al (liquid aluminium tapped off at bottom).',
              '• Anode (+): 2O2- -> O2 + 4e-. Hot oxygen reacts with graphite anodes, burning them away: C + O2 -> CO2 (anodes must be replaced regularly).'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'C10.1',
    topicCode: 'C10',
    topicName: 'Chemistry of the environment',
    title: 'Water Tests & Domestic Treatment',
    subject: 'chemistry',
    tier: 'Core',
    syllabusSummary: [
      'Chemical tests for water: anhydrous cobalt(II) chloride (blue to pink), anhydrous copper(II) sulfate (white to blue).',
      'Distilled water vs tap water; domestic water treatment: sedimentation, filtration, carbon, chlorination.'
    ],
    decks: [
      {
        id: 'deck-c10-1',
        subtopicCode: 'C10.1',
        topicCode: 'C10',
        title: 'Chemical Tests for Water & Water Treatment',
        subtopicHeader: '[C10.1] Water',
        classworkDate: '30/10/2025',
        objectives: [
          'Describe chemical tests for water using cobalt(II) chloride and copper(II) sulfate.',
          'Explain the steps involved in domestic water purification.'
        ],
        keywords: ['anhydrous', 'cobalt chloride', 'copper sulfate', 'distilled water', 'sedimentation', 'chlorination'],
        slides: [
          {
            id: 'c10-1-s1',
            slideNumber: 1,
            subtopicHeader: '[C10.1] Chemical Tests for Water',
            title: 'Testing for Water Presence',
            slideType: 'theory',
            content: [
              '• Test 1: Anhydrous Copper(II) Sulfate powder changes from WHITE to BLUE in the presence of water: CuSO4 (s) + 5H2O (l) -> CuSO4·5H2O (s).',
              '• Test 2: Anhydrous Cobalt(II) Chloride paper changes from BLUE to PINK in the presence of water.',
              '• Purity Check: These tests show water is PRESENT, not pure. Pure water boils at exactly 100°C and melts at 0°C at 1 atm.',
              '• Why Use Distilled Water: Tap water contains dissolved mineral ions that can interfere with experimental reactions or form unwanted precipitates.'
            ]
          },
          {
            id: 'c10-1-s2',
            slideNumber: 2,
            subtopicHeader: '[C10.1] Water Treatment',
            title: 'Domestic Water Purification Steps',
            slideType: 'theory',
            content: [
              '1. Sedimentation: Untreated water is pumped into large settlement tanks; large insoluble particles settle at bottom.',
              '2. Filtration: Water flows through coarse gravel and fine sand beds to filter out suspended solid particles.',
              '3. Activated Carbon: Adsorbs dissolved organic molecules to eliminate unpleasant odours and tastes.',
              '4. Chlorination: Controlled chlorine gas added to kill harmful microbes and bacteria, preventing cholera and typhoid.'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'C10.2',
    topicCode: 'C10',
    topicName: 'Chemistry of the environment',
    title: 'Air Quality & Climate Change',
    subject: 'chemistry',
    tier: 'Core & Supplement',
    syllabusSummary: [
      'Composition of clean dry air: ~78% N2, ~21% O2, ~1% noble gases/CO2.',
      'Pollutants, sources & adverse effects: CO2 (global warming), CO (toxic), particulates (respiratory/cancer), CH4 (global warming), NOx (acid rain), SO2 (acid rain).',
      'Strategies to reduce climate change & acid rain; greenhouse effect mechanism.'
    ],
    decks: [
      {
        id: 'deck-c10-2',
        subtopicCode: 'C10.2',
        topicCode: 'C10',
        title: 'Atmospheric Pollutants, Greenhouse Effect & Climate',
        subtopicHeader: '[C10.2] Atmospheric Pollutants',
        classworkDate: '31/10/2025 - 04/11/2025',
        objectives: [
          'State composition of clean, dry air.',
          'Identify sources and environmental effects of CO2, CO, particulates, CH4, NOx, and SO2.',
          'Explain the greenhouse effect and strategies to reduce climate change.'
        ],
        keywords: ['nitrogen', 'oxygen', 'carbon monoxide', 'particulates', 'sulfur dioxide', 'acid rain', 'greenhouse effect'],
        slides: [
          {
            id: 'c10-2-s1',
            slideNumber: 1,
            subtopicHeader: '[C10.2] Air Pollutants Summary',
            title: 'Air Pollutants: Sources & Health Impacts',
            slideType: 'theory',
            content: [
              '• Clean Dry Air: ~78% Nitrogen (N2), ~21% Oxygen (O2), ~1% Argon, CO2, and other gases.',
              '• Carbon Dioxide (CO2): Complete combustion of fossil fuels -> enhanced greenhouse effect and climate change.',
              '• Carbon Monoxide (CO): Incomplete combustion of carbon fuels -> toxic odourless gas, binds haemoglobin preventing O2 transport.',
              '• Particulates (Soot C): Incomplete combustion -> respiratory illnesses and cancer.',
              '• Methane (CH4): Decomposition of waste and cattle digestive gases -> potent greenhouse gas.',
              '• Sulfur Dioxide (SO2): Combustion of sulfur-containing fossil fuels -> dissolves in cloud droplets forming acid rain.',
              '• Oxides of Nitrogen (NOx): High temperature reaction of N2 and O2 inside car engines -> acid rain and respiratory problems.'
            ]
          },
          {
            id: 'c10-2-s2',
            slideNumber: 2,
            subtopicHeader: '[C10.2] Greenhouse Effect',
            title: 'Greenhouse Effect & Mitigation Strategies',
            slideType: 'theory',
            content: [
              '• Mechanism: Short-wavelength solar radiation passes through atmosphere and is absorbed by Earth\'s surface. Earth re-radiates long-wavelength infrared radiation. Greenhouse gases (CO2, CH4) absorb and re-emit infrared, trapping thermal energy in the atmosphere.',
              '• Climate Change Strategies: 1) Reforestation (photosynthesis absorbs CO2); 2) Reduce livestock farming (cuts CH4); 3) Switch to renewable energy (wind/solar); 4) Use low-sulfur fuels and flue-gas desulfurization (scrubbers) to prevent acid rain.'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'C11.1',
    topicCode: 'C11',
    topicName: 'Organic chemistry',
    title: 'Organic Terminology',
    subject: 'chemistry',
    tier: 'Core & Supplement',
    syllabusSummary: [
      'Saturated (all C-C single bonds) vs unsaturated (contains C=C double bonds).',
      'Homologous series: family of similar compounds with same general formula and trend in physical properties.'
    ],
    decks: [
      {
        id: 'deck-c11-1',
        subtopicCode: 'C11.1',
        topicCode: 'C11',
        title: 'Organic Terminology & Homologous Series',
        subtopicHeader: '[C11.1] Crude Oil & Hydrocarbons',
        classworkDate: '04/05/2026',
        objectives: [
          'Define hydrocarbons as containing hydrogen and carbon ONLY.',
          'Define saturated, unsaturated, and homologous series.'
        ],
        keywords: ['hydrocarbon', 'homologous series', 'saturated', 'unsaturated', 'general formula'],
        slides: [
          {
            id: 'c11-1-s1',
            slideNumber: 1,
            subtopicHeader: '[C11.1] Core Definitions',
            title: 'Hydrocarbon Families & Bonding',
            slideType: 'theory',
            content: [
              '• Hydrocarbon: A compound containing HYDROGEN AND CARBON ONLY (if oxygen or sulfur is present, it is NOT a hydrocarbon).',
              '• Saturated: Molecules in which all carbon-carbon bonds are SINGLE bonds (e.g. Alkanes).',
              '• Unsaturated: Molecules containing one or more carbon-carbon DOUBLE bonds (e.g. Alkenes C=C).',
              '• Homologous Series Characteristics: 1) Same general formula; 2) Same functional group; 3) Similar chemical properties; 4) Gradual trend in physical properties (e.g. boiling point increases with chain length).'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'C11.2',
    topicCode: 'C11',
    topicName: 'Organic chemistry',
    title: 'Fuels & Fractional Distillation',
    subject: 'chemistry',
    tier: 'Core & Supplement',
    syllabusSummary: [
      'Fossil fuels: coal, natural gas (methane), petroleum.',
      'Separation of petroleum into fractions by fractional distillation.',
      'Uses: refinery gas (heating/cooking), gasoline/petrol (cars), naphtha (chemical feedstock), diesel (diesel engines), bitumen (roads); column property trends.'
    ],
    decks: [
      {
        id: 'deck-c11-2',
        subtopicCode: 'C11.2',
        topicCode: 'C11',
        title: 'Petroleum & Fractional Distillation Column',
        subtopicHeader: '[C11.2] Fractional Distillation',
        classworkDate: '05/05/2026',
        objectives: [
          'Describe how petroleum is separated into fractions based on boiling point.',
          'Identify specific uses of refinery gas, petrol, naphtha, diesel, and bitumen.'
        ],
        keywords: ['fractional distillation', 'refinery gas', 'gasoline', 'naphtha', 'diesel', 'bitumen', 'viscosity', 'volatility'],
        slides: [
          {
            id: 'c11-2-s1',
            slideNumber: 1,
            subtopicHeader: '[C11.2] Distillation Column',
            title: 'Fractionating Column & Trends',
            slideType: 'theory',
            content: [
              '• Crude oil is vapourised at ~350°C and fed into the bottom of fractionating column (hot at bottom ~400°C, cooler at top ~20°C).',
              '• Vapours rise; each fraction condenses at the height where the temperature falls below its boiling point.',
              '• Trends from Bottom to Top: Decreasing chain length, lower boiling point, lower viscosity (more runny), higher volatility, and higher flammability.'
            ]
          },
          {
            id: 'c11-2-s2',
            slideNumber: 2,
            subtopicHeader: '[C11.2] Uses of Fractions',
            title: '5 Main Petroleum Fractions & Their Uses',
            slideType: 'theory',
            content: [
              '1. Refinery Gas (top): Bottled gas for domestic heating and cooking.',
              '2. Gasoline / Petrol: Fuel for cars.',
              '3. Naphtha: Chemical feedstock for manufacturing petrochemicals and plastics.',
              '4. Diesel Oil / Gas Oil: Fuel for diesel engines, trucks, and trains.',
              '5. Bitumen (bottom): Thick residue for surfacing roads and roofing.'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'C11.3',
    topicCode: 'C11',
    topicName: 'Organic chemistry',
    title: 'Alkanes',
    subject: 'chemistry',
    tier: 'Core',
    syllabusSummary: [
      'Alkanes have single covalent C-C bonds and are saturated hydrocarbons.',
      'Properties: generally unreactive except in combustion; general formula CnH2n+2.'
    ],
    decks: [
      {
        id: 'deck-c11-3',
        subtopicCode: 'C11.3',
        topicCode: 'C11',
        title: 'Alkanes: Structure & Combustion',
        subtopicHeader: '[C11.3] Alkanes and Alkenes',
        classworkDate: '06/05/2026 - 08/05/2026',
        objectives: [
          'Describe structure and properties of alkanes (Methane, Ethane, Propane, Butane).',
          'Write balanced equations for complete and incomplete combustion.'
        ],
        keywords: ['alkane', 'saturated', 'methane', 'ethane', 'combustion', 'carbon monoxide'],
        slides: [
          {
            id: 'c11-3-s1',
            slideNumber: 1,
            subtopicHeader: '[C11.3] Alkane Homologous Series',
            title: 'Saturated Alkanes (CnH2n+2)',
            slideType: 'theory',
            content: [
              '• General formula: CnH2n+2.',
              '• First 4 alkanes: Methane (CH4), Ethane (C2H6), Propane (C3H8), Butane (C4H10).',
              '• Reactivity: Unreactive due to strong, stable C-C and C-H single bonds.',
              '• Complete Combustion (excess O2): Alkane + Oxygen -> Carbon dioxide + Water. E.g. CH4 + 2O2 -> CO2 + 2H2O.',
              '• Incomplete Combustion (limited O2): Produces toxic carbon monoxide (CO) and soot particulates (C).'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'C11.4',
    topicCode: 'C11',
    topicName: 'Organic chemistry',
    title: 'Alkenes, Cracking & Addition Reactions',
    subject: 'chemistry',
    tier: 'Core & Supplement',
    syllabusSummary: [
      'Alkenes contain C=C double bond (unsaturated hydrocarbons CnH2n).',
      'Bromine water test: orange to colourless.',
      'Manufacture by cracking larger alkanes (high temperature & catalyst).',
      'Addition reactions with bromine, hydrogen (Ni catalyst), steam (acid catalyst).'
    ],
    decks: [
      {
        id: 'deck-c11-4-cracking',
        subtopicCode: 'C11.4',
        topicCode: 'C11',
        title: 'Cracking & The Bromine Water Test',
        subtopicHeader: '[C11.4] Cracking and Combustion',
        classworkDate: '08/05/2026',
        objectives: [
          'Describe catalytic and steam cracking.',
          'Describe the bromine water test for unsaturation.'
        ],
        keywords: ['cracking', 'thermal decomposition', 'bromine water', 'unsaturated', 'ethene'],
        slides: [
          {
            id: 'c11-4-c1',
            slideNumber: 1,
            subtopicHeader: '[C11.4] Cracking Process',
            title: 'Cracking: Thermal Decomposition of Alkanes',
            slideType: 'theory',
            content: [
              '• Cracking: Thermal decomposition breaking large, less useful long-chain alkanes into smaller, more useful alkanes (for fuels) and alkenes (for polymers).',
              '• Conditions: High temperature (~600-700°C) and a catalyst (aluminium oxide / porous pot).',
              '• Example: C10H22 (decane) -> C8H18 (octane) + C2H4 (ethene).',
              '• Test for Unsaturation (Bromine Water):',
              '  - Alkanes (saturated): Bromine water stays ORANGE (no reaction in the dark).',
              '  - Alkenes (unsaturated C=C): Bromine water turns from ORANGE to COLOURLESS (decolorises).'
            ]
          }
        ]
      },
      {
        id: 'deck-c11-4-addition',
        subtopicCode: 'C11.4',
        topicCode: 'C11',
        title: 'Alkene Addition Reactions',
        subtopicHeader: '[C11.4] Alkene Addition Reactions',
        classworkDate: '21/05/2026',
        objectives: [
          'Describe addition reactions of alkenes with bromine, hydrogen, and steam.',
          'Identify required industrial catalysts and conditions.'
        ],
        keywords: ['addition reaction', 'hydrogenation', 'hydration', 'nickel catalyst', 'acid catalyst'],
        slides: [
          {
            id: 'c11-4-a1',
            slideNumber: 1,
            subtopicHeader: '[C11.4] Addition Mechanisms',
            title: '3 Crucial Addition Reactions of Alkenes',
            slideType: 'theory',
            content: [
              '• In an addition reaction, the C=C double bond opens up into a single bond, allowing new atoms to add across the carbons (forming ONE single product):',
              '1. With Bromine (Br2): Ethene + Bromine -> 1,2-dibromoethane (liquid turns colourless).',
              '2. With Hydrogen (H2) - Hydrogenation: Requires Nickel catalyst at 150°C. Ethene + H2 -> Ethane. Used to turn liquid vegetable oils into solid margarine.',
              '3. With Steam (H2O) - Hydration: Requires concentrated Phosphoric Acid (H3PO4) catalyst, 300°C, 60 atm. Ethene + Steam -> Ethanol.'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'C11.5',
    topicCode: 'C11',
    topicName: 'Organic chemistry',
    title: 'Polymers',
    subject: 'chemistry',
    tier: 'Core',
    syllabusSummary: [
      'Define polymers as large molecules built from smaller monomer units.',
      'Formation of poly(ethene) by addition polymerisation of ethene monomers.'
    ],
    decks: [
      {
        id: 'deck-c11-5',
        subtopicCode: 'C11.5',
        topicCode: 'C11',
        title: 'Addition Polymerisation & Poly(ethene)',
        subtopicHeader: '[C11.5] Polymers',
        classworkDate: '14/05/2026',
        objectives: [
          'Define polymers and monomers.',
          'Describe formation of poly(ethene) via addition polymerisation.'
        ],
        keywords: ['polymer', 'monomer', 'poly(ethene)', 'addition polymerisation', 'cross-linking'],
        slides: [
          {
            id: 'c11-5-s1',
            slideNumber: 1,
            subtopicHeader: '[C11.5] Polymerisation',
            title: 'Monomers to Polymers: Poly(ethene)',
            slideType: 'theory',
            content: [
              '• Monomer: Small reactive molecule with a C=C double bond (e.g. ethene).',
              '• Polymer: Large, long-chain macromolecule built up from thousands of repeating monomer units.',
              '• Addition Polymerisation: The C=C double bonds in ethene open up under pressure and join together to form a saturated poly(ethene) chain. Only ONE product is made.',
              '• PVA Slime Demo: Polyvinyl alcohol strands are cross-linked by borate ions, preventing strands from sliding freely, turning runny liquid glue into thick bouncy slime.'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'C12.1',
    topicCode: 'C12',
    topicName: 'Experimental techniques and chemical analysis',
    title: 'Experimental Design & Apparatus',
    subject: 'chemistry',
    tier: 'Core',
    syllabusSummary: [
      'Name apparatus for time, temperature, mass, volume (stopwatches, thermometers, balances, burettes, volumetric pipettes, measuring cylinders, gas syringes).',
      'Definitions: solvent, solute, solution, saturated solution, residue, filtrate.'
    ],
    decks: [
      {
        id: 'deck-c12-1',
        subtopicCode: 'C12.1',
        topicCode: 'C12',
        title: 'Scientific Apparatus & Solubility Terms',
        subtopicHeader: '[C12.1] Solubility',
        classworkDate: '03/06/2026',
        objectives: [
          'Select appropriate laboratory equipment for accurate measurements.',
          'Define key terms relating to solubility and mixtures.'
        ],
        keywords: ['burette', 'volumetric pipette', 'measuring cylinder', 'solute', 'solvent', 'saturated'],
        slides: [
          {
            id: 'c12-1-s1',
            slideNumber: 1,
            subtopicHeader: '[C12.1] Measuring Apparatus',
            title: 'Precision Laboratory Equipment',
            slideType: 'theory',
            content: [
              '• Measuring Volume of Liquids: Burette (high precision, read bottom of meniscus), Volumetric Pipette (fixed exact volumes e.g. 25.0 cm³), Measuring Cylinder (approximate volume).',
              '• Measuring Gas Volume: Gas Syringe (collects gas produced in reaction without pressure buildup).',
              '• Mass: Electronic balance (tare to zero before adding substance).',
              '• Definitions:',
              '  - Solute: Solid or gas that dissolves in liquid.',
              '  - Solvent: Liquid in which solute dissolves.',
              '  - Solution: Homogeneous mixture formed when solute dissolves in solvent.',
              '  - Saturated Solution: Solution containing the maximum possible concentration of dissolved solute at that temperature.'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'C12.2',
    topicCode: 'C12',
    topicName: 'Experimental techniques and chemical analysis',
    title: 'Chromatography',
    subject: 'chemistry',
    tier: 'Core & Supplement',
    syllabusSummary: [
      'Paper chromatography to separate soluble coloured mixtures.',
      'Interpret chromatograms (pure vs impure); Rf = distance by substance / distance by solvent.'
    ],
    decks: [
      {
        id: 'deck-c12-2',
        subtopicCode: 'C12.2',
        topicCode: 'C12',
        title: 'Paper Chromatography Practical & Rf Values',
        subtopicHeader: '[C12.2] Chromatography',
        classworkDate: '04/06/2025 - 06/06/2025',
        objectives: [
          'Explain how paper chromatography separates coloured dyes.',
          'Calculate retention factor (Rf) values.'
        ],
        keywords: ['chromatography', 'stationary phase', 'mobile phase', 'solvent front', 'Rf value'],
        slides: [
          {
            id: 'c12-2-s1',
            slideNumber: 1,
            subtopicHeader: '[C12.2] Technique Rules',
            title: 'Principles & Crucial Rules of Chromatography',
            slideType: 'practical',
            content: [
              '• Stationary Phase: Chromatography paper.',
              '• Mobile Phase: Liquid solvent (water or ethanol) moving up the paper.',
              '• Separation Basis: Differences in solubility in mobile phase and attraction to stationary paper.',
              '• Rule 1: Origin / Baseline MUST be drawn in PENCIL because graphite is insoluble in the solvent (ink would dissolve and run).',
              '• Rule 2: Solvent level must be BELOW the pencil baseline to prevent spots washing into the solvent pool.',
              '• Formula: Rf = Distance travelled by spot ÷ Distance travelled by solvent front.'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'C12.3',
    topicCode: 'C12',
    topicName: 'Experimental techniques and chemical analysis',
    title: 'Separation and Purification',
    subject: 'chemistry',
    tier: 'Core',
    syllabusSummary: [
      'Methods: suitable solvent, filtration, crystallisation, simple distillation, fractional distillation.'
    ],
    decks: [
      {
        id: 'deck-c12-3',
        subtopicCode: 'C12.3',
        topicCode: 'C12',
        title: 'Purification & Separation Techniques',
        subtopicHeader: '[C12.3] Separation and Purification',
        classworkDate: '09/06/2025',
        objectives: [
          'Select suitable separation methods based on physical properties of mixtures.',
          'Describe simple and fractional distillation.'
        ],
        keywords: ['filtration', 'crystallisation', 'simple distillation', 'fractional distillation', 'condenser'],
        slides: [
          {
            id: 'c12-3-s1',
            slideNumber: 1,
            subtopicHeader: '[C12.3] Separation Methods',
            title: 'Selecting the Correct Separation Method',
            slideType: 'theory',
            content: [
              '• Filtration: Separates insoluble solid from liquid (e.g. sand from water). Residue on paper, filtrate in flask.',
              '• Crystallisation: Separates dissolved solute from solution (e.g. copper sulfate crystals).',
              '• Simple Distillation: Separates pure liquid solvent from solution (e.g. pure water from seawater). Liquid boils, vapour cools in Liebig condenser and collects as distillate.',
              '• Fractional Distillation: Separates miscible liquids with different boiling points (e.g. ethanol and water, crude oil). Vapours pass through fractionating column with glass beads to increase surface area.'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'C12.4',
    topicCode: 'C12',
    topicName: 'Experimental techniques and chemical analysis',
    title: 'Identification of Ions & Gases',
    subject: 'chemistry',
    tier: 'Core',
    syllabusSummary: [
      'Tests for anions: carbonate (acid -> CO2), chloride/bromide/iodide (nitric acid + silver nitrate), sulfate (nitric acid + barium nitrate).',
      'Tests for aqueous cations with NaOH & NH3: NH4+, Ca2+, Cu2+, Fe2+, Fe3+, Zn2+.',
      'Tests for gases: NH3 (damp red litmus blue), CO2 (limewater milky), Cl2 (bleaches damp litmus), H2 (pop with lighted splint), O2 (relights glowing splint).',
      'Flame tests: Li+ (red), Na+ (yellow), K+ (lilac), Cu2+ (blue-green).'
    ],
    decks: [
      {
        id: 'deck-c12-4-anions',
        subtopicCode: 'C12.4',
        topicCode: 'C12',
        title: 'Tests for Anions (Carbonate, Sulfate, Halides)',
        subtopicHeader: '[C12.4] Test for Anions',
        classworkDate: '14/05/2026',
        objectives: [
          'Describe reagents and precipitates for carbonate, sulfate, chloride, bromide, and iodide ions.'
        ],
        keywords: ['anion', 'carbonate', 'sulfate', 'halide', 'silver nitrate', 'barium nitrate', 'precipitate'],
        slides: [
          {
            id: 'c12-4-a1',
            slideNumber: 1,
            subtopicHeader: '[C12.4] Anions Table',
            title: 'Qualitative Tests for Negative Ions',
            slideType: 'theory',
            content: [
              '• Carbonate (CO32-): Add dilute acid -> effervescence -> bubble gas through limewater -> turns cloudy/milky.',
              '• Sulfate (SO42-): Acidify with dilute nitric acid, then add aqueous Barium Nitrate, Ba(NO3)2 -> thick WHITE precipitate of BaSO4.',
              '• Halides (Cl-, Br-, I-): Acidify with dilute nitric acid, then add aqueous Silver Nitrate, AgNO3:',
              '  - Chloride (Cl-): WHITE precipitate of AgCl.',
              '  - Bromide (Br-): CREAM precipitate of AgBr.',
              '  - Iodide (I-): YELLOW precipitate of AgI.'
            ]
          }
        ]
      },
      {
        id: 'deck-c12-4-cations',
        subtopicCode: 'C12.4',
        topicCode: 'C12',
        title: 'Tests for Cations & Flame Tests',
        subtopicHeader: '[C12.4] Tests for Cations (solution & flame)',
        classworkDate: '17/05/2026 - 19/05/2026',
        objectives: [
          'Identify metal cations using aqueous sodium hydroxide and flame tests.'
        ],
        keywords: ['cation', 'flame test', 'sodium hydroxide', 'precipitate', 'lithium', 'copper'],
        slides: [
          {
            id: 'c12-4-c1',
            slideNumber: 1,
            subtopicHeader: '[C12.4] Aqueous Cations Table',
            title: 'Aqueous NaOH Precipitates',
            slideType: 'theory',
            content: [
              '• Copper(II) (Cu2+): Light blue precipitate; insoluble in excess NaOH.',
              '• Iron(II) (Fe2+): Green precipitate; insoluble in excess; turns brown near surface.',
              '• Iron(III) (Fe3+): Red-brown precipitate; insoluble in excess.',
              '• Calcium (Ca2+): White precipitate; INSOLUBLE in excess NaOH.',
              '• Zinc (Zn2+): White precipitate; SOLUBLE in excess NaOH, giving a colourless solution.',
              '• Ammonium (NH4+): No precipitate; gently warming produces pungent ammonia gas that turns damp red litmus paper blue.'
            ]
          },
          {
            id: 'c12-4-c2',
            slideNumber: 2,
            subtopicHeader: '[C12.4] Flame Tests & Gases',
            title: 'Flame Tests and Common Gas Tests',
            slideType: 'theory',
            content: [
              '• Flame Tests (Clean nichrome wire dipped in HCl into roaring blue flame):',
              '  - Lithium (Li+): RED flame.',
              '  - Sodium (Na+): YELLOW flame.',
              '  - Potassium (K+): LILAC flame.',
              '  - Copper(II) (Cu2+): BLUE-GREEN flame.',
              '• Gas Tests:',
              '  - Hydrogen (H2): Lighted splint goes \'pop\'.',
              '  - Oxygen (O2): Relights a glowing splint.',
              '  - Carbon Dioxide (CO2): Turns limewater milky/cloudy.',
              '  - Chlorine (Cl2): Bleaches damp blue litmus paper white.',
              '  - Ammonia (NH3): Turns damp red litmus paper blue.'
            ]
          }
        ]
      }
    ]
  }
];
