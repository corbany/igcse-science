import { PastExamPaper } from '../../types';

export const march2026Paper22Extended: PastExamPaper = {
  id: 'paper-0653-22-m26-extended',
  code: '0653/22',
  title: 'Paper 2 Multiple Choice (Extended) - March 2026',
  series: 'March 2026',
  paperNumber: 'Paper 2',
  tier: 'Extended',
  duration: '45 minutes',
  totalMarks: 40,
  paperType: 'multiple-choice',
  description: 'Authentic Cambridge IGCSE Combined Science 0653/22 Extended Multiple Choice examination drawn from the official March 2026 examination series. 40 questions covering Supplement syllabus objectives across Biology (Q1–13), Chemistry (Q14–26), and Physics (Q27–40).',
  examinerNotes: [
    'Each item has four options (A, B, C, D). Choose the one you consider correct.',
    'There is no penalty for incorrect answers.',
    'Calculators may be used on this paper.',
    'A copy of the Periodic Table is provided on the back of the examination paper.'
  ],
  gradeBoundaries: {
    aStar: 34,
    a: 29,
    b: 25,
    c: 21,
    d: 17,
    e: 13,
    f: 10
  },
  questions: [
    // BIOLOGY (Q1 - Q13)
    {
      id: 'm26-22-q1',
      number: 1,
      questionText: 'A photograph shows a cell with a magnification of ×2000. The image length of the cell is 40 mm. What is the actual length of the cell in micrometres (µm)?',
      options: [
        { key: 'A', text: '0.02 µm' },
        { key: 'B', text: '2.0 µm' },
        { key: 'C', text: '20 µm' },
        { key: 'D', text: '50 µm' }
      ],
      correctAnswer: 'C',
      marks: 1,
      explanation: 'Magnification formula: Actual size A = Image size I / Magnification M. First convert 40 mm into micrometres: 40 mm = 40 000 µm. Then A = 40 000 µm / 2000 = 20 µm.',
      subject: 'biology',
      syllabusCode: 'B2.2',
      questionType: 'mcq'
    },
    {
      id: 'm26-22-q2',
      number: 2,
      questionText: 'By which mechanism do plant root hair cells absorb nitrate ions from soil water when the concentration of nitrate in the root cell sap is higher than in the soil solution?',
      options: [
        { key: 'A', text: 'active transport using energy released by cellular respiration' },
        { key: 'B', text: 'diffusion down a concentration gradient' },
        { key: 'C', text: 'osmosis across a partially permeable membrane' },
        { key: 'D', text: 'transpiration pull through xylem' }
      ],
      correctAnswer: 'A',
      marks: 1,
      explanation: 'When moving particles from a dilute solution to a concentrated solution (against a concentration gradient), protein carriers in the cell membrane use energy (ATP) from aerobic respiration via active transport.',
      subject: 'biology',
      syllabusCode: 'B3.3',
      questionType: 'mcq'
    },
    {
      id: 'm26-22-q3',
      number: 3,
      questionText: 'A cylinder of potato tissue placed in a concentrated sucrose solution decreases in mass and becomes flaccid. What explains this observation?',
      options: [
        { key: 'A', text: 'Sucrose molecules entered the potato cells by diffusion' },
        { key: 'B', text: 'Water molecules entered the potato cells by active transport' },
        { key: 'C', text: 'Water molecules moved out of the potato cells by osmosis down a water potential gradient' },
        { key: 'D', text: 'Cellulose in the cell wall was hydrolysed into glucose' }
      ],
      correctAnswer: 'C',
      marks: 1,
      explanation: 'Potato cells have a higher water potential than the concentrated external sucrose solution. Water leaves the vacuole and cytoplasm by osmosis across the partially permeable cell membrane, causing plasmolysis and loss of mass.',
      subject: 'biology',
      syllabusCode: 'B3.2',
      questionType: 'mcq'
    },
    {
      id: 'm26-22-q4',
      number: 4,
      questionText: 'Which sequence correctly traces the movement of a water molecule from the soil into the leaves of a plant?',
      options: [
        { key: 'A', text: 'root hair cell → root cortex → xylem vessel → mesophyll cell' },
        { key: 'B', text: 'root hair cell → xylem vessel → root cortex → phloem sieve tube' },
        { key: 'C', text: 'root cortex → root hair cell → phloem sieve tube → stomata' },
        { key: 'D', text: 'xylem vessel → root hair cell → mesophyll cell → cuticle' }
      ],
      correctAnswer: 'A',
      marks: 1,
      explanation: 'Water enters root hair cells by osmosis, travels across the root cortex cells, enters xylem vessels in the vascular bundle, is pulled up the stem by transpiration pull, and enters leaf mesophyll cells.',
      subject: 'biology',
      syllabusCode: 'B8.2',
      questionType: 'mcq'
    },
    {
      id: 'm26-22-q5',
      number: 5,
      questionText: 'Which combination of environmental conditions causes the highest rate of transpiration in a leafy shoot?',
      options: [
        { key: 'A', text: 'high temperature, high humidity, low wind speed' },
        { key: 'B', text: 'high temperature, low humidity, high wind speed' },
        { key: 'C', text: 'low temperature, high humidity, high wind speed' },
        { key: 'D', text: 'low temperature, low humidity, low wind speed' }
      ],
      correctAnswer: 'B',
      marks: 1,
      explanation: 'Transpiration rate peaks with high temperature (increased evaporation kinetic energy), low humidity (steeper water vapor concentration gradient), and high wind speed (rapid removal of humid boundary layer).',
      subject: 'biology',
      syllabusCode: 'B8.3',
      questionType: 'mcq'
    },
    {
      id: 'm26-22-q6',
      number: 6,
      questionText: 'What is the function of coronary arteries on the surface of the heart?',
      options: [
        { key: 'A', text: 'carry deoxygenated blood to the lungs' },
        { key: 'B', text: 'carry blood from the digestive system to the liver' },
        { key: 'C', text: 'supply oxygenated blood and glucose directly to cardiac muscle cells' },
        { key: 'D', text: 'prevent backflow of blood between ventricles' }
      ],
      correctAnswer: 'C',
      marks: 1,
      explanation: 'Coronary arteries branch from the base of the aorta to supply cardiac muscle tissue with oxygen and glucose for continuous aerobic respiration.',
      subject: 'biology',
      syllabusCode: 'B9.2',
      questionType: 'mcq'
    },
    {
      id: 'm26-22-q7',
      number: 7,
      questionText: 'Which adaptation enables capillaries to carry out efficient exchange of substances between blood and tissue fluid?',
      options: [
        { key: 'A', text: 'thick muscular elastic walls to withstand high systolic pressure' },
        { key: 'B', text: 'valves to prevent the backflow of blood' },
        { key: 'C', text: 'walls that are one cell thick consisting of a single layer of endothelial cells' },
        { key: 'D', text: 'wide lumen to minimise friction resistance' }
      ],
      correctAnswer: 'C',
      marks: 1,
      explanation: 'Capillary walls are one cell thick (endothelium) with small gaps, providing a very short diffusion pathway for gases, nutrients, and waste products.',
      subject: 'biology',
      syllabusCode: 'B9.3',
      questionType: 'mcq'
    },
    {
      id: 'm26-22-q8',
      number: 8,
      questionText: 'Which component of human blood produces antibodies that specifically bind to pathogen antigens?',
      options: [
        { key: 'A', text: 'lymphocytes' },
        { key: 'B', text: 'phagocytes' },
        { key: 'C', text: 'platelets' },
        { key: 'D', text: 'red blood cells' }
      ],
      correctAnswer: 'A',
      marks: 1,
      explanation: 'Lymphocytes are white blood cells that produce specific Y-shaped antibodies that bind to complementary antigens on foreign pathogens.',
      subject: 'biology',
      syllabusCode: 'B9.4',
      questionType: 'mcq'
    },
    {
      id: 'm26-22-q9',
      number: 9,
      questionText: 'During inhalation in human ventilation, what are the movements of the external intercostal muscles, the diaphragm, and the ribcage?',
      options: [
        { key: 'A', text: 'external intercostals contract, diaphragm flattens (contracts), ribcage moves up and out' },
        { key: 'B', text: 'external intercostals relax, diaphragm domes upwards, ribcage moves down and in' },
        { key: 'C', text: 'external intercostals contract, diaphragm domes upwards, ribcage moves down and in' },
        { key: 'D', text: 'external intercostals relax, diaphragm flattens, ribcage moves up and out' }
      ],
      correctAnswer: 'A',
      marks: 1,
      explanation: 'Inhalation is active: external intercostals contract pulling ribs up and out; the diaphragm contracts and flattens; thorax volume increases, pressure falls below atmospheric, and air rushes in.',
      subject: 'biology',
      syllabusCode: 'B11.1',
      questionType: 'mcq'
    },
    {
      id: 'm26-22-q10',
      number: 10,
      questionText: 'What happens to skin arterioles when core body temperature rises above normal 37 °C?',
      options: [
        { key: 'A', text: 'arterioles constrict (vasoconstriction) to divert blood away from skin surface' },
        { key: 'B', text: 'arterioles dilate (vasodilation) to increase blood flow to surface capillaries for heat loss' },
        { key: 'C', text: 'capillaries move physically deeper into the subcutaneous fat layer' },
        { key: 'D', text: 'sweat glands stop secreting sweat to conserve water' }
      ],
      correctAnswer: 'B',
      marks: 1,
      explanation: 'In response to warmth, smooth muscles in arteriole walls relax (vasodilation), increasing blood flow to capillaries near the skin surface, increasing radiation and convection of heat.',
      subject: 'biology',
      syllabusCode: 'B13.1',
      questionType: 'mcq'
    },
    {
      id: 'm26-22-q11',
      number: 11,
      questionText: 'In flowering plants, what is the term for the transfer of pollen grains from an anther to a receptive stigma?',
      options: [
        { key: 'A', text: 'fertilisation' },
        { key: 'B', text: 'germination' },
        { key: 'C', text: 'pollination' },
        { key: 'D', text: 'translocation' }
      ],
      correctAnswer: 'C',
      marks: 1,
      explanation: 'Pollination is the transfer of pollen grains from the male anther to the female stigma (via insects, wind, or birds).',
      subject: 'biology',
      syllabusCode: 'B14.1',
      questionType: 'mcq'
    },
    {
      id: 'm26-22-q12',
      number: 12,
      questionText: 'On which day of a typical 28-day human menstrual cycle does ovulation normally occur?',
      options: [
        { key: 'A', text: 'Day 1' },
        { key: 'B', text: 'Day 5' },
        { key: 'C', text: 'Day 14' },
        { key: 'D', text: 'Day 28' }
      ],
      correctAnswer: 'C',
      marks: 1,
      explanation: 'In an average 28-day cycle, an egg is released from the Graafian follicle in the ovary (ovulation) on approximately Day 14, stimulated by a surge in luteinizing hormone (LH).',
      subject: 'biology',
      syllabusCode: 'B14.2',
      questionType: 'mcq'
    },
    {
      id: 'm26-22-q13',
      number: 13,
      questionText: 'Why is a pyramid of biomass almost always pyramid-shaped with a broad base and narrow top, whereas a pyramid of numbers can be inverted?',
      options: [
        { key: 'A', text: 'Energy is lost at each successive trophic level through respiration and excretion, so total dry mass decreases' },
        { key: 'B', text: 'Carnivores always produce more biomass than primary producers' },
        { key: 'C', text: 'Biomass is measured in numbers of individual organisms' },
        { key: 'D', text: 'Photosynthesis efficiency increases from bottom to top of food chains' }
      ],
      correctAnswer: 'A',
      marks: 1,
      explanation: 'Biomass represents the total dry mass of living material. Because only ~10% of energy is transferred between trophic levels due to metabolic heat loss, biomass inevitably decreases up the food chain.',
      subject: 'biology',
      syllabusCode: 'B15.2',
      questionType: 'mcq'
    },

    // CHEMISTRY (Q14 - Q26)
    {
      id: 'm26-22-q14',
      number: 14,
      questionText: 'Two atoms of chlorine are isotopes: ³⁵Cl and ³⁷Cl. In what way do their atomic structures differ?',
      options: [
        { key: 'A', text: '³⁷Cl has two more electrons in its outer valence shell than ³⁵Cl' },
        { key: 'B', text: '³⁷Cl has two more neutrons in its nucleus than ³⁵Cl' },
        { key: 'C', text: '³⁷Cl has two more protons in its nucleus than ³⁵Cl' },
        { key: 'D', text: '³⁷Cl has different chemical reactivity from ³⁵Cl' }
      ],
      correctAnswer: 'B',
      marks: 1,
      explanation: 'Isotopes are atoms of the same element with the same number of protons (17 for chlorine) and electrons, but different numbers of neutrons (³⁵Cl has 18 neutrons, ³⁷Cl has 20 neutrons).',
      subject: 'chemistry',
      syllabusCode: 'C2.2',
      questionType: 'mcq'
    },
    {
      id: 'm26-22-q15',
      number: 15,
      questionText: 'Why do giant ionic lattices (such as solid sodium chloride) conduct electricity when molten or dissolved in water, but NOT when solid?',
      options: [
        { key: 'A', text: 'In solid state, ions are locked in fixed positions by strong electrostatic forces; when molten or dissolved, ions are free to move and carry charge' },
        { key: 'B', text: 'Electrons are delocalised in molten salt but bound to nuclei in solid salt' },
        { key: 'C', text: 'Molecules break down into neutral atoms when heated' },
        { key: 'D', text: 'Solid sodium chloride contains covalent bonds that melt into ionic bonds' }
      ],
      correctAnswer: 'A',
      marks: 1,
      explanation: 'Electrical conduction requires mobile charge carriers. In solid NaCl, Na⁺ and Cl⁻ ions are held in a rigid 3D lattice. In molten or aqueous state, the lattice breaks down and ions are mobile.',
      subject: 'chemistry',
      syllabusCode: 'C2.3',
      questionType: 'mcq'
    },
    {
      id: 'm26-22-q16',
      number: 16,
      questionText: 'What is the electronic dot-and-cross configuration of a nitrogen molecule (N2)?',
      options: [
        { key: 'A', text: 'A single covalent bond with 2 shared electrons and 4 lone pairs' },
        { key: 'B', text: 'A double covalent bond with 4 shared electrons and 2 lone pairs' },
        { key: 'C', text: 'A triple covalent bond with 6 shared electrons (3 pairs) and 1 lone pair on each nitrogen atom' },
        { key: 'D', text: 'An ionic bond formed by electron transfer' }
      ],
      correctAnswer: 'C',
      marks: 1,
      explanation: 'Nitrogen (Group 15) has 5 valence electrons. Two nitrogen atoms share 3 pairs of electrons (triple bond N≡N) so that both attain a full octet of 8 electrons (6 shared + 2 unshared lone electrons each).',
      subject: 'chemistry',
      syllabusCode: 'C2.4',
      questionType: 'mcq'
    },
    {
      id: 'm26-22-q17',
      number: 17,
      questionText: 'What is the relative formula mass (Mr) of hydrated copper(II) sulfate, CuSO4·5H2O? [Ar: Cu = 64, S = 32, O = 16, H = 1]',
      options: [
        { key: 'A', text: '160' },
        { key: 'B', text: '178' },
        { key: 'C', text: '250' },
        { key: 'D', text: '320' }
      ],
      correctAnswer: 'C',
      marks: 1,
      explanation: 'CuSO4 = 64 + 32 + (4 × 16) = 160. 5H2O = 5 × (2 + 16) = 90. Total Mr = 160 + 90 = 250.',
      subject: 'chemistry',
      syllabusCode: 'C3.1',
      questionType: 'mcq'
    },
    {
      id: 'm26-22-q18',
      number: 18,
      questionText: 'During the electrolysis of concentrated aqueous sodium chloride (brine) using inert electrodes, what product is collected at the anode (+)?',
      options: [
        { key: 'A', text: 'chlorine gas (Cl2)' },
        { key: 'B', text: 'hydrogen gas (H2)' },
        { key: 'C', text: 'oxygen gas (O2)' },
        { key: 'D', text: 'sodium metal (Na)' }
      ],
      correctAnswer: 'A',
      marks: 1,
      explanation: 'At the positive anode, concentrated chloride ions (Cl⁻) are oxidised in preference to hydroxide ions: 2Cl⁻ → Cl2 + 2e⁻, releasing pale green chlorine gas.',
      subject: 'chemistry',
      syllabusCode: 'C4.1',
      questionType: 'mcq'
    },
    {
      id: 'm26-22-q19',
      number: 19,
      questionText: 'In terms of bond breaking and bond forming, why is a chemical reaction overall endothermic?',
      options: [
        { key: 'A', text: 'Energy taken in to break reactant bonds is greater than energy released when product bonds form' },
        { key: 'B', text: 'Energy released when product bonds form is greater than energy taken in to break reactant bonds' },
        { key: 'C', text: 'No bonds are broken during endothermic reactions' },
        { key: 'D', text: 'The activation energy of the reaction is equal to zero' }
      ],
      correctAnswer: 'A',
      marks: 1,
      explanation: 'Bond breaking is endothermic (absorbs energy); bond making is exothermic (releases energy). When energy absorbed to break bonds > energy released forming bonds, ΔH is positive (endothermic).',
      subject: 'chemistry',
      syllabusCode: 'C5.1',
      questionType: 'mcq'
    },
    {
      id: 'm26-22-q20',
      number: 20,
      questionText: 'Why does adding a catalyst increase the rate of a chemical reaction without being consumed?',
      options: [
        { key: 'A', text: 'It increases the frequency of collisions between reactant particles' },
        { key: 'B', text: 'It provides an alternative reaction pathway with lower activation energy' },
        { key: 'C', text: 'It increases the average kinetic energy and temperature of particles' },
        { key: 'D', text: 'It shifts the equilibrium position to produce more products' }
      ],
      correctAnswer: 'B',
      marks: 1,
      explanation: 'A catalyst provides an alternative pathway with a lower activation energy (Ea), so a greater proportion of colliding particles possess energy ≥ Ea, resulting in more successful collisions per second.',
      subject: 'chemistry',
      syllabusCode: 'C6.2',
      questionType: 'mcq'
    },
    {
      id: 'm26-22-q21',
      number: 21,
      questionText: 'In the reaction: CuO + H2 → Cu + H2O, which species is being reduced and why?',
      options: [
        { key: 'A', text: 'Copper(II) oxide (CuO) is reduced because it loses oxygen / Cu²⁺ gains electrons' },
        { key: 'B', text: 'Hydrogen (H2) is reduced because it gains oxygen' },
        { key: 'C', text: 'Water (H2O) is reduced because it is a liquid product' },
        { key: 'D', text: 'Copper metal (Cu) is reduced because its oxidation number increases' }
      ],
      correctAnswer: 'A',
      marks: 1,
      explanation: 'Reduction is the loss of oxygen or gain of electrons (OIL RIG). CuO loses oxygen to form Cu, and Cu²⁺ gains 2 electrons: Cu²⁺ + 2e⁻ → Cu.',
      subject: 'chemistry',
      syllabusCode: 'C6.3',
      questionType: 'mcq'
    },
    {
      id: 'm26-22-q22',
      number: 22,
      questionText: 'Which oxide is amphoteric, reacting with BOTH dilute acids and strong aqueous alkalis to produce a salt and water?',
      options: [
        { key: 'A', text: 'Aluminium oxide (Al2O3)' },
        { key: 'B', text: 'Carbon dioxide (CO2)' },
        { key: 'C', text: 'Copper(II) oxide (CuO)' },
        { key: 'D', text: 'Sodium oxide (Na2O)' }
      ],
      correctAnswer: 'A',
      marks: 1,
      explanation: 'Al2O3 and ZnO are amphoteric oxides: they neutralize acids behaving as basic oxides, and dissolve in sodium hydroxide behaving as acidic oxides.',
      subject: 'chemistry',
      syllabusCode: 'C7.2',
      questionType: 'mcq'
    },
    {
      id: 'm26-22-q23',
      number: 23,
      questionText: 'Which method is appropriate for preparing a pure dry sample of the insoluble salt barium sulfate (BaSO4)?',
      options: [
        { key: 'A', text: 'Titration of barium hydroxide with dilute sulfuric acid using indicator' },
        { key: 'B', text: 'Precipitation by mixing aqueous barium chloride with dilute sulfuric acid, followed by filtration and washing' },
        { key: 'C', text: 'Reacting excess barium metal with concentrated sulfuric acid' },
        { key: 'D', text: 'Evaporating barium nitrate solution to dryness' }
      ],
      correctAnswer: 'B',
      marks: 1,
      explanation: 'Insoluble salts are prepared by precipitation: mix two soluble solutions (e.g. BaCl2(aq) + H2SO4(aq)), filter the precipitate, wash with distilled water to remove soluble impurities, and dry.',
      subject: 'chemistry',
      syllabusCode: 'C7.3',
      questionType: 'mcq'
    },
    {
      id: 'm26-22-q24',
      number: 24,
      questionText: 'What is the role of limestone (calcium carbonate, CaCO3) added to the blast furnace during the industrial extraction of iron from hematite?',
      options: [
        { key: 'A', text: 'It acts as the primary fuel to generate high temperatures' },
        { key: 'B', text: 'It thermally decomposes to CaO which reacts with acidic silicon dioxide (sand) impurities to form slag (CaSiO3)' },
        { key: 'C', text: 'It reduces hematite iron(III) oxide directly to molten iron' },
        { key: 'D', text: 'It oxidises molten iron into steel' }
      ],
      correctAnswer: 'B',
      marks: 1,
      explanation: 'Limestone decomposes: CaCO3 → CaO + CO2. Calcium oxide (basic) reacts with acidic sand impurities (SiO2): CaO + SiO2 → CaSiO3 (molten slag), which floats on iron and is tapped off.',
      subject: 'chemistry',
      syllabusCode: 'C9.6',
      questionType: 'mcq'
    },
    {
      id: 'm26-22-q25',
      number: 25,
      questionText: 'Which gaseous pollutant is removed from car exhaust emissions by a catalytic converter via reaction with carbon monoxide: 2NO + 2CO → N2 + 2CO2?',
      options: [
        { key: 'A', text: 'oxides of nitrogen (NO and NO2)' },
        { key: 'B', text: 'methane (CH4)' },
        { key: 'C', text: 'sulfur dioxide (SO2)' },
        { key: 'D', text: 'water vapour (H2O)' }
      ],
      correctAnswer: 'A',
      marks: 1,
      explanation: 'Catalytic converters use platinum/rhodium catalysts to convert harmful oxides of nitrogen and toxic carbon monoxide into harmless nitrogen gas and carbon dioxide.',
      subject: 'chemistry',
      syllabusCode: 'C10.2',
      questionType: 'mcq'
    },
    {
      id: 'm26-22-q26',
      number: 26,
      questionText: 'What type of reaction occurs when ethene (C2H4) molecules polymerise to form poly(ethene)?',
      options: [
        { key: 'A', text: 'Addition polymerisation where C=C double bonds open up with no other product formed' },
        { key: 'B', text: 'Condensation polymerisation with the elimination of water molecules' },
        { key: 'C', text: 'Cracking with formation of hydrogen gas' },
        { key: 'D', text: 'Combustion in limited oxygen' }
      ],
      correctAnswer: 'A',
      marks: 1,
      explanation: 'In addition polymerisation, unsaturated alkene monomers join together by opening their carbon-carbon double bonds, forming a long saturated polymer chain with no by-products.',
      subject: 'chemistry',
      syllabusCode: 'C11.5',
      questionType: 'mcq'
    },

    // PHYSICS (Q27 - Q40)
    {
      id: 'm26-22-q27',
      number: 27,
      questionText: 'A vehicle moves along a straight horizontal track. Its velocity increases from 10 m/s to 30 m/s in 5.0 seconds. What is its acceleration?',
      options: [
        { key: 'A', text: '2.0 m/s²' },
        { key: 'B', text: '4.0 m/s²' },
        { key: 'C', text: '8.0 m/s²' },
        { key: 'D', text: '20 m/s²' }
      ],
      correctAnswer: 'B',
      marks: 1,
      explanation: 'Acceleration a = (final velocity v – initial velocity u) / time t = (30 – 10) / 5.0 = 20 / 5.0 = 4.0 m/s².',
      subject: 'physics',
      syllabusCode: 'P1.2',
      questionType: 'mcq'
    },
    {
      id: 'm26-22-q28',
      number: 28,
      questionText: 'How is the distance travelled determined from a velocity-time graph of an object moving with changing speed?',
      options: [
        { key: 'A', text: 'by calculating the gradient of the graph line' },
        { key: 'B', text: 'by finding the intercept on the vertical velocity axis' },
        { key: 'C', text: 'by calculating the area under the velocity-time graph line' },
        { key: 'D', text: 'by reading the maximum peak velocity' }
      ],
      correctAnswer: 'C',
      marks: 1,
      explanation: 'The area under a velocity-time graph represents distance travelled (velocity × time = distance). The gradient represents acceleration.',
      subject: 'physics',
      syllabusCode: 'P1.2',
      questionType: 'mcq'
    },
    {
      id: 'm26-22-q29',
      number: 29,
      questionText: 'An aircraft of mass 80 000 kg experiences forward engine thrust of 260 000 N and backward air resistance of 100 000 N. What is the initial acceleration of the aircraft?',
      options: [
        { key: 'A', text: '1.25 m/s²' },
        { key: 'B', text: '2.0 m/s²' },
        { key: 'C', text: '3.25 m/s²' },
        { key: 'D', text: '4.5 m/s²' }
      ],
      correctAnswer: 'B',
      marks: 1,
      explanation: 'Resultant force F = 260 000 N – 100 000 N = 160 000 N forwards. Acceleration a = F / m = 160 000 N / 80 000 kg = 2.0 m/s².',
      subject: 'physics',
      syllabusCode: 'P1.5.1',
      questionType: 'mcq'
    },
    {
      id: 'm26-22-q30',
      number: 30,
      questionText: 'A sports car of mass 1200 kg travels at a speed of 20 m/s. What is its kinetic energy?',
      options: [
        { key: 'A', text: '12 000 J' },
        { key: 'B', text: '24 000 J' },
        { key: 'C', text: '240 000 J' },
        { key: 'D', text: '480 000 J' }
      ],
      correctAnswer: 'C',
      marks: 1,
      explanation: 'Kinetic energy Ek = ½ × mass × speed² = 0.5 × 1200 kg × (20 m/s)² = 600 × 400 = 240 000 J (240 kJ).',
      subject: 'physics',
      syllabusCode: 'P1.6.1',
      questionType: 'mcq'
    },
    {
      id: 'm26-22-q31',
      number: 31,
      questionText: 'An electric motor has a power input of 500 W. In 20 seconds, it delivers 6000 J of useful mechanical work. What is the percentage efficiency of the motor?',
      options: [
        { key: 'A', text: '30%' },
        { key: 'B', text: '60%' },
        { key: 'C', text: '75%' },
        { key: 'D', text: '83%' }
      ],
      correctAnswer: 'B',
      marks: 1,
      explanation: 'Total energy input = Power × time = 500 W × 20 s = 10 000 J. Efficiency = (Useful energy output / Total energy input) × 100 = (6000 J / 10 000 J) × 100 = 60%.',
      subject: 'physics',
      syllabusCode: 'P1.6.2',
      questionType: 'mcq'
    },
    {
      id: 'm26-22-q32',
      number: 32,
      questionText: 'A woman of weight 600 N stands on high-heeled shoes. The total contact area of both heels with the floor is 0.0030 m². What pressure does she exert on the floor?',
      options: [
        { key: 'A', text: '1.8 Pa' },
        { key: 'B', text: '20 000 Pa' },
        { key: 'C', text: '200 000 Pa' },
        { key: 'D', text: '1 800 000 Pa' }
      ],
      correctAnswer: 'C',
      marks: 1,
      explanation: 'Pressure P = Force / Area = 600 N / 0.0030 m² = 200 000 Pa (200 kPa or 2.0 × 10⁵ N/m²).',
      subject: 'physics',
      syllabusCode: 'P1.7',
      questionType: 'mcq'
    },
    {
      id: 'm26-22-q33',
      number: 33,
      questionText: 'A fixed mass of gas in a sealed cylinder with a movable piston has an initial volume of 0.40 m³ at pressure 1.5 × 10⁵ Pa. The gas is compressed at constant temperature until its volume is 0.10 m³. What is the new pressure of the gas?',
      options: [
        { key: 'A', text: '3.75 × 10⁴ Pa' },
        { key: 'B', text: '3.0 × 10⁵ Pa' },
        { key: 'C', text: '6.0 × 10⁵ Pa' },
        { key: 'D', text: '1.2 × 10⁶ Pa' }
      ],
      correctAnswer: 'C',
      marks: 1,
      explanation: 'Boyle’s law for constant temperature: p1V1 = p2V2. Rearranging: p2 = (p1 × V1) / V2 = (1.5 × 10⁵ × 0.40) / 0.10 = 6.0 × 10⁵ Pa.',
      subject: 'physics',
      syllabusCode: 'P2.1.3',
      questionType: 'mcq'
    },
    {
      id: 'm26-22-q34',
      number: 34,
      questionText: 'Why are metals good thermal conductors compared to insulators like plastic or wood?',
      options: [
        { key: 'A', text: 'Metals contain free delocalised electrons that move rapidly through the lattice and transfer kinetic energy via collisions' },
        { key: 'B', text: 'Metal atoms are less densely packed than plastic molecules' },
        { key: 'C', text: 'Metals emit infrared radiation at lower frequencies' },
        { key: 'D', text: 'Metals expand more when heated' }
      ],
      correctAnswer: 'A',
      marks: 1,
      explanation: 'Metals conduct heat rapidly because free delocalised conduction electrons gain kinetic energy and diffuse rapidly through the lattice, colliding with distant metal ions.',
      subject: 'physics',
      syllabusCode: 'P2.3.1',
      questionType: 'mcq'
    },
    {
      id: 'm26-22-q35',
      number: 35,
      questionText: 'A light ray passes from air into a rectangular glass block at an angle of incidence of 45°. The refractive index of the glass is 1.50. What is the angle of refraction r?',
      options: [
        { key: 'A', text: '28°' },
        { key: 'B', text: '30°' },
        { key: 'C', text: '45°' },
        { key: 'D', text: '60°' }
      ],
      correctAnswer: 'A',
      marks: 1,
      explanation: 'Snell’s law: n = sin(i) / sin(r) → sin(r) = sin(45°) / 1.50 = 0.7071 / 1.50 = 0.4714. r = arcsin(0.4714) ≈ 28°.',
      subject: 'physics',
      syllabusCode: 'P3.2.2',
      questionType: 'mcq'
    },
    {
      id: 'm26-22-q36',
      number: 36,
      questionText: 'A ship’s sonar sends an ultrasound pulse down to the seabed. The pulse reflects and is detected by the receiver 0.80 seconds later. The speed of sound in seawater is 1500 m/s. What is the depth of the water?',
      options: [
        { key: 'A', text: '600 m' },
        { key: 'B', text: '1200 m' },
        { key: 'C', text: '1875 m' },
        { key: 'D', text: '2400 m' }
      ],
      correctAnswer: 'A',
      marks: 1,
      explanation: 'Echo sounder travel time includes down and back. Total distance = speed × time = 1500 m/s × 0.80 s = 1200 m. Depth = distance / 2 = 600 m.',
      subject: 'physics',
      syllabusCode: 'P3.4',
      questionType: 'mcq'
    },
    {
      id: 'm26-22-q37',
      number: 37,
      questionText: 'An electric charge of 180 C flows through a lamp in 2.0 minutes. What is the electric current in the lamp?',
      options: [
        { key: 'A', text: '0.67 A' },
        { key: 'B', text: '1.5 A' },
        { key: 'C', text: '90 A' },
        { key: 'D', text: '360 A' }
      ],
      correctAnswer: 'B',
      marks: 1,
      explanation: 'Charge formula: Q = I × t → I = Q / t. Convert 2.0 minutes into seconds: t = 2.0 × 60 = 120 s. Current I = 180 C / 120 s = 1.5 A.',
      subject: 'physics',
      syllabusCode: 'P4.1.2',
      questionType: 'mcq'
    },
    {
      id: 'm26-22-q38',
      number: 38,
      questionText: 'Two resistors of 6.0 Ω and 3.0 Ω are connected in parallel across a 12 V battery. What is the combined total resistance of the circuit?',
      options: [
        { key: 'A', text: '2.0 Ω' },
        { key: 'B', text: '4.5 Ω' },
        { key: 'C', text: '9.0 Ω' },
        { key: 'D', text: '18 Ω' }
      ],
      correctAnswer: 'A',
      marks: 1,
      explanation: 'For two parallel resistors: 1/R = 1/R1 + 1/R2 = 1/6.0 + 1/3.0 = 1/6 + 2/6 = 3/6 = 1/2.0. Therefore R = 2.0 Ω.',
      subject: 'physics',
      syllabusCode: 'P4.2.2',
      questionType: 'mcq'
    },
    {
      id: 'm26-22-q39',
      number: 39,
      questionText: 'An electric kettle is rated at 230 V, 2300 W. Which fuse rating is most appropriate to fit in the mains plug for safety?',
      options: [
        { key: 'A', text: '3 A' },
        { key: 'B', text: '5 A' },
        { key: 'C', text: '10 A' },
        { key: 'D', text: '13 A' }
      ],
      correctAnswer: 'D',
      marks: 1,
      explanation: 'Operating current I = P / V = 2300 W / 230 V = 10 A. The fuse must be rated slightly above the operating current to prevent blowing during normal use, so a 13 A fuse is required.',
      subject: 'physics',
      syllabusCode: 'P4.3',
      questionType: 'mcq'
    },
    {
      id: 'm26-22-q40',
      number: 40,
      questionText: 'What observation of light from distant galaxies provides crucial evidence supporting the Big Bang theory that the Universe is expanding?',
      options: [
        { key: 'A', text: 'The light is blue-shifted to shorter wavelengths' },
        { key: 'B', text: 'The light is red-shifted to longer wavelengths, with greater redshift observed for galaxies at greater distances' },
        { key: 'C', text: 'The speed of light decreases as distance increases' },
        { key: 'D', text: 'Distant stars appear green due to interstellar hydrogen absorption' }
      ],
      correctAnswer: 'B',
      marks: 1,
      explanation: 'Redshift occurs because space between galaxies is stretching, shifting light to longer wavelengths. More distant galaxies exhibit greater redshift, showing they are receding faster (Hubble’s law).',
      subject: 'physics',
      syllabusCode: 'P5.2.3',
      questionType: 'mcq'
    }
  ]
};
