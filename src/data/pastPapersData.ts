import { PastExamPaper } from '../types';
import { 
  FIGURE_THERMOMETERS_61_1_1,
  FIGURE_FILTRATION_61_2_1,
  FIGURE_CIRCUIT_WIRE_61_4_1,
  FIGURE_METERS_DIALS_61_4_2,
  FIGURE_CROCODILE_CLIP_61_4_4,
  FIGURE_ALIMENTARY_CANAL_41_1_1,
  FIGURE_TRANSPIRATION_BALANCE_41_2_1,
  FIGURE_MGCL2_ELECTROLYSIS_41_4_1,
  FIGURE_REACTION_PROFILE_41_5_1,
  FIGURE_TRAIN_SPEED_TIME_41_7_1,
  FIGURE_PARALLEL_CIRCUIT_41_9_1
} from './examFiguresSvg';
import { specimen2025Paper4 } from './examPapers/specimen2025Paper4';
import { specimen2025Paper6 } from './examPapers/specimen2025Paper6';
import { specimen2025Paper2 } from './examPapers/specimen2025Paper2';
import { octNov2025Paper42 } from './examPapers/octNov2025Paper42';
import { modelGutPracticalPack } from './examPapers/modelGutPracticalPack';
import { saveMyExamsReproductionPaper } from './examPapers/saveMyExamsReproduction';

export const pastExamPapers: PastExamPaper[] = [
  // =========================================================================
  // 1. 0653/61 May/June 2026 - Paper 6 Alternative to Practical (40 Marks)
  // =========================================================================
  {
    id: 'paper-0653-61-mj-2026',
    code: '0653/61',
    title: 'Paper 6 Alternative to Practical',
    series: 'May/June 2026',
    paperNumber: 'Paper 6',
    tier: 'Alternative to Practical',
    duration: '1 hour',
    totalMarks: 40,
    paperType: 'alternative-to-practical',
    description: 'Official Cambridge IGCSE Combined Science 0653/61 Alternative to Practical examination. Includes yeast catalase thermal breakdown, copper carbonate and sulfuric acid filtration preparation, detergent foam investigation planning, and resistance wire electrical measurements.',
    examinerNotes: [
      'Write your Centre number, candidate number and name in the spaces provided.',
      'Answer all questions. Use a black or dark blue pen. You may use an HB pencil for any diagrams or graphs.',
      'Calculators may be used. Give non-exact numerical answers correct to 3 significant figures, or 1 decimal place for angles in degrees, unless a different level of accuracy is specified.'
    ],
    gradeBoundaries: {
      aStar: 33,
      a: 28,
      b: 24,
      c: 19,
      d: 15,
      e: 12,
      f: 9,
      g: 6
    },
    questions: [
      {
        id: 'q61-1-ai',
        number: 1,
        subPart: '(a)(i)',
        fullLabel: '1(a)(i)',
        questionType: 'written',
        subject: 'biology',
        syllabusCode: 'B5.1 / B12.1',
        marks: 2,
        questionText: 'A student investigates the breakdown of hydrogen peroxide solution by the enzyme catalase in yeast. The reaction releases thermal energy.\n\nFig. 1.1 shows the thermometer readings for test-tube A and test-tube B after 2 minutes.\n\nRead the thermometers to the nearest 0.5 °C and record these temperatures in Table 1.1.',
        figureCaption: 'Fig. 1.1',
        figurePageNumber: 2,
        diagramSvg: FIGURE_THERMOMETERS_61_1_1,
        figurePromptDescription: 'Fig. 1.1 shows thermometer readings for test-tube A (21.5 °C) and test-tube B (24.0 °C) after 2 minutes in the catalase decomposition investigation.',
        correctAnswer: 'Test-tube A = 21.5 °C, Test-tube B = 24.0 °C',
        markSchemeBreakdown: [
          'M1: Test-tube A recorded as 21.5 (°C)',
          'M2: Test-tube B recorded as 24.0 (°C)'
        ],
        guidanceNotes: [
          'ALLOW 21.5 and 24 / 24.0',
          'DO NOT ALLOW 21 or 24.5'
        ],
        examinerComment: 'Candidates must take care to read the thermometer scale intervals accurately to the nearest 0.5 °C as instructed.',
        explanation: 'Looking at Fig 1.1, the liquid level in thermometer A is halfway between 21 and 22, reading exactly 21.5 °C. For thermometer B, the meniscus rests exactly on the 24.0 °C mark.'
      },
      {
        id: 'q61-1-aii',
        number: 1,
        subPart: '(a)(ii)',
        fullLabel: '1(a)(ii)',
        questionType: 'calculation',
        subject: 'biology',
        syllabusCode: 'B5.1',
        marks: 1,
        questionText: 'The initial temperature for test-tube A was 21.5 °C, and for test-tube B was 20.5 °C.\n\nCalculate the change in temperature (final temperature – initial temperature) for test-tube A and test-tube B.',
        correctAnswer: 'Change for A = 0.0 °C; Change for B = 3.5 °C',
        markSchemeBreakdown: [
          'M1: Both temperature changes calculated correctly: A = 0.0 (°C) and B = 3.5 (°C)'
        ],
        guidanceNotes: [
          'ALLOW 0 for A and 3.5 for B',
          'ALLOW ecf (error carried forward) from candidate readings in (a)(i)'
        ],
        explanation: 'For test-tube A: 21.5 – 21.5 = 0.0 °C. For test-tube B: 24.0 – 20.5 = 3.5 °C.'
      },
      {
        id: 'q61-1-av',
        number: 1,
        subPart: '(a)(v)',
        fullLabel: '1(a)(v)',
        questionType: 'written',
        subject: 'biology',
        syllabusCode: 'B5.1',
        marks: 1,
        questionText: 'State the relationship between the percentage concentration of hydrogen peroxide solution and the rate of reaction.',
        correctAnswer: 'As percentage concentration increases, rate of reaction increases (directly proportional / positive correlation).',
        markSchemeBreakdown: [
          'M1: Increasing the percentage concentration increases the rate of reaction / directly proportional'
        ],
        guidanceNotes: [
          'ALLOW positive correlation / higher concentration gives faster reaction',
          'DO NOT ALLOW "as concentration increases, temperature increases" unless explicitly linked to rate of reaction'
        ],
        explanation: 'A higher concentration of substrate (hydrogen peroxide) provides more reactant particles per unit volume, increasing the collision frequency with catalase active sites, thus increasing the rate of reaction.'
      },
      {
        id: 'q61-1-avi',
        number: 1,
        subPart: '(a)(vi)',
        fullLabel: '1(a)(vi)',
        questionType: 'written',
        subject: 'biology',
        syllabusCode: 'B5.1',
        marks: 1,
        questionText: 'Identify the independent variable in this investigation.',
        correctAnswer: '(percentage) concentration of hydrogen peroxide',
        markSchemeBreakdown: [
          'M1: (percentage) concentration (of hydrogen peroxide)'
        ],
        guidanceNotes: [
          'DO NOT ALLOW amount of hydrogen peroxide or volume of yeast'
        ],
        explanation: 'The independent variable is the variable that the investigator deliberately changes, which is the percentage concentration of hydrogen peroxide solution.'
      },
      {
        id: 'q61-1-avii',
        number: 1,
        subPart: '(a)(vii)',
        fullLabel: '1(a)(vii)',
        questionType: 'written',
        subject: 'biology',
        syllabusCode: 'B5.1',
        marks: 2,
        questionText: 'Suggest why:\n1. The test-tubes are covered in foil in step 2.\n2. The thermometer is washed in step 7 before being placed into the next tube.',
        correctAnswer: '1. Foil: To reduce heat loss to the surroundings (insulation).\n2. Washing: To prevent contamination of the next solution / prevent carry-over of yeast or hydrogen peroxide.',
        markSchemeBreakdown: [
          'M1 (foil): to reduce heat loss / thermal energy transfer to surroundings / insulation',
          'M2 (washing): to prevent contamination / to avoid altering concentration of next tube'
        ],
        guidanceNotes: [
          'M1: ALLOW keep heat in / prevent cooling',
          'M2: ALLOW so solutions do not mix / to ensure fair test by avoiding transfer of reactants'
        ],
        explanation: 'Foil acts as a thermal insulator reflecting radiation and reducing convection heat loss. Washing the thermometer prevents cross-contamination of yeast or leftover substrate between successive runs.'
      },
      {
        id: 'q61-1-b',
        number: 1,
        subPart: '(b)',
        fullLabel: '1(b)',
        questionType: 'written',
        subject: 'biology',
        syllabusCode: 'B4.1',
        marks: 2,
        questionText: 'Catalase is an enzyme. Enzymes are proteins.\n\nName the reagent used to test for protein and state the observation for a positive result.',
        correctAnswer: 'Reagent: Biuret (solution / reagent)\nPositive result: Purple / lilac / violet / mauve',
        markSchemeBreakdown: [
          'M1: Biuret (reagent / solution / potassium hydroxide and copper sulfate)',
          'M2: purple / lilac / mauve / violet'
        ],
        guidanceNotes: [
          'DO NOT ALLOW blue (initial colour) or pink alone'
        ],
        explanation: 'The standard food test for proteins is the Biuret test. A positive result turns from blue to purple/lilac.'
      },

      // Question 2: Copper carbonate and sulfuric acid
      {
        id: 'q61-2-a',
        number: 2,
        subPart: '(a)',
        fullLabel: '2(a)',
        questionType: 'written',
        subject: 'chemistry',
        syllabusCode: 'C7.4',
        marks: 1,
        questionText: 'A student prepares crystals of copper(II) sulfate from copper(II) carbonate, a green solid, and dilute sulfuric acid.\n\nDescribe one observation made when copper(II) carbonate is added to dilute sulfuric acid in step 2.',
        correctAnswer: 'Effervescence / bubbles of gas / fizzing / solution turns blue / solid dissolves',
        markSchemeBreakdown: [
          'M1: fizzes / bubbles / effervescence / solution turns blue / green solid disappears or dissolves'
        ],
        guidanceNotes: [
          'ALLOW gas given off / gas produced',
          'DO NOT ALLOW just "carbon dioxide formed" without visible physical observation'
        ],
        explanation: 'Carbon dioxide gas is evolved causing visible effervescence (bubbles), and the resulting aqueous copper(II) sulfate creates a blue solution.'
      },
      {
        id: 'q61-2-b',
        number: 2,
        subPart: '(b)',
        fullLabel: '2(b)',
        questionType: 'written',
        subject: 'chemistry',
        syllabusCode: 'C7.4',
        marks: 1,
        questionText: 'Explain the importance of adding excess copper(II) carbonate in step 4.',
        correctAnswer: 'To ensure all the sulfuric acid has reacted / acid is completely neutralised / no acid remains.',
        markSchemeBreakdown: [
          'M1: to ensure all the acid reacts / all acid is used up / acid is neutralised'
        ],
        guidanceNotes: [
          'ALLOW so that the copper sulfate produced is not contaminated with acid',
          'DO NOT ALLOW to get maximum yield alone'
        ],
        explanation: 'Adding excess insoluble base ensures that 100% of the acid is consumed so the salt solution is neutral and pure.'
      },
      {
        id: 'q61-2-c',
        number: 2,
        subPart: '(c)',
        fullLabel: '2(c)',
        questionType: 'written',
        subject: 'chemistry',
        syllabusCode: 'C7.4 / C12.1',
        marks: 2,
        questionText: 'In step 5, the unreacted copper(II) carbonate is separated from the mixture by filtration.\n\nIn the space below, describe or list the labelled apparatus used to assemble the filtration equipment.',
        figureCaption: 'Fig. 2.1',
        figurePageNumber: 4,
        diagramSvg: FIGURE_FILTRATION_61_2_1,
        figurePromptDescription: 'Fig. 2.1 shows the laboratory filtration apparatus with filter funnel, filter paper, and conical flask for separating unreacted copper(II) carbonate.',
        correctAnswer: 'Filter funnel containing folded filter paper, supported over a conical flask or beaker to collect the filtrate.',
        markSchemeBreakdown: [
          'M1: Filter funnel and filter paper correctly identified and placed inside funnel',
          'M2: Suitable receiving vessel (conical flask or beaker) positioned beneath funnel'
        ],
        guidanceNotes: [
          'ALLOW clear diagram or detailed written apparatus description with labels',
          'Funnel must enter or sit over the neck of the container'
        ],
        explanation: 'Standard filtration requires a filter funnel containing filter paper, with its stem discharging into a receiving container such as a conical flask or beaker.'
      },
      {
        id: 'q61-2-d',
        number: 2,
        subPart: '(d)',
        fullLabel: '2(d)',
        questionType: 'written',
        subject: 'chemistry',
        syllabusCode: 'C7.4',
        marks: 1,
        questionText: 'State the appearance of the filtrate and the residue.',
        correctAnswer: 'Filtrate: blue solution (liquid)\nResidue: green solid (powder)',
        markSchemeBreakdown: [
          'M1: Filtrate is blue solution/liquid AND residue is green solid/powder'
        ],
        guidanceNotes: [
          'Both needed for 1 mark. ALLOW blue liquid and green powder'
        ],
        explanation: 'The filtrate that passes through the paper is copper(II) sulfate solution (blue). The insoluble unreacted excess copper(II) carbonate remaining on the paper is green solid.'
      },
      {
        id: 'q61-2-ei',
        number: 2,
        subPart: '(e)(i)',
        fullLabel: '2(e)(i)',
        questionType: 'written',
        subject: 'chemistry',
        syllabusCode: 'C12.4',
        marks: 1,
        questionText: 'A wooden splint soaked in the filtrate is placed in a roaring Bunsen burner flame.\n\nState the flame colour produced by the copper(II) ions in the filtrate.',
        correctAnswer: 'Blue-green / green-blue',
        markSchemeBreakdown: [
          'M1: blue-green / green-blue / green'
        ],
        guidanceNotes: [
          'DO NOT ALLOW blue alone or yellow alone'
        ],
        explanation: 'Copper(II) ions produce a characteristic blue-green flame during a flame test.'
      },

      // Question 3: Planning Investigation (7 Marks)
      {
        id: 'q61-3',
        number: 3,
        subPart: 'Plan',
        fullLabel: '3 (Plan)',
        questionType: 'plan',
        subject: 'chemistry',
        syllabusCode: 'C12.1',
        marks: 7,
        questionText: 'When liquid detergent is shaken with water in a measuring cylinder fitted with a stopper, a layer of foam forms on top of the liquid.\n\nPlan an investigation to determine the relationship between the mass of salt dissolved in the water and the volume of foam produced.\n\nYou are provided with: liquid detergent, water, table salt, common laboratory apparatus.\n\nIn your plan, include:\n• the apparatus you will use\n• a brief description of the method, including how you will make it a fair test\n• the measurements you will take\n• how you will use your results to determine the relationship.',
        correctAnswer: 'Apparatus: balance (to weigh salt), measuring cylinder with stopper, stopwatch, ruler/measuring scale.\nMethod: Measure a constant volume of water (e.g. 50 cm³) and place in measuring cylinder. Add a known mass of salt (e.g. 1.0 g) and stir until dissolved. Add a fixed volume of detergent (e.g. 2 cm³). Stopper the cylinder and shake vigorously for a fixed time (e.g. 30 s) or fixed number of shakes (e.g. 20 shakes). Measure initial liquid level and final total level to determine foam volume = total volume – liquid volume. Repeat with at least 5 different masses of salt (e.g. 1 g, 2 g, 3 g, 4 g, 5 g). Keep temperature of water and shaking intensity constant. Plot a graph of foam volume against mass of salt.',
        markSchemeBreakdown: [
          'M1 (Apparatus): Balance to measure mass of salt AND measuring cylinder / timer',
          'M2 (Method): Dissolving at least two different masses of salt in water before adding detergent',
          'M3 (Shaking): Shaking the cylinder with a stopper for a specified time or number of shakes',
          'M4 (Range): Testing at least 5 different masses of salt',
          'M5 (Fair test / Control): Keeping volume of water AND volume of detergent constant',
          'M6 (Fair test / Control): Keeping time/intensity of shaking constant OR temperature constant',
          'M7 (Processing): Calculating volume of foam (final volume - initial volume) AND plotting a graph of foam volume vs mass of salt'
        ],
        guidanceNotes: [
          'Max 7 marks. Positive marking applies.',
          'ALLOW credit for measuring foam height if a boiling tube is used instead of measuring cylinder',
          'ALLOW repeats and averaging for reliability'
        ],
        examinerComment: 'Top mark candidates specify clear numerical values for mass (at least 5 values), state key control variables (volume of detergent and shaking time), and explain how foam volume is calculated and plotted.',
        explanation: 'A 6-7 mark planning response systematically covers: independent variable range (5 salt masses), dependent variable measurement (foam volume), control variables (water volume, detergent drops, shaking duration/force), and analytical processing (graph plotting).'
      },

      // Question 4: Electricity & Resistance Wire
      {
        id: 'q61-4-ai',
        number: 4,
        subPart: '(a)',
        fullLabel: '4(a)',
        questionType: 'written',
        subject: 'physics',
        syllabusCode: 'P4.4 / P4.5',
        marks: 1,
        questionText: 'Fig. 4.1 shows a circuit with a resistance wire E attached to a metre ruler, a 3 V d.c. power supply, ammeter, voltmeter, switch and crocodile clips.\n\nA fixed resistor is to be connected in series into the circuit to prevent the resistance wire from overheating.\n\nState whether the resistor should be placed at position P (in series with wire and power supply) or position Q (in parallel across the voltmeter), and give the circuit symbol for a resistor.',
        figureCaption: 'Fig. 4.1',
        diagramSvg: FIGURE_CIRCUIT_WIRE_61_4_1,
        correctAnswer: 'Position P. Circuit symbol is a rectangle.',
        markSchemeBreakdown: [
          'M1: Position P identified AND circuit symbol for resistor is a clean rectangle'
        ],
        guidanceNotes: [
          'ALLOW standard rectangle symbol for fixed resistor',
          'DO NOT ALLOW zigzag line unless specified as alternative resistor symbol'
        ],
        explanation: 'A fixed resistor must be placed in series (position P) with the resistance wire and supply to limit total circuit current and prevent excessive thermal energy generation.'
      },
      {
        id: 'q61-4-bi',
        number: 4,
        subPart: '(b)(i)',
        fullLabel: '4(b)(i)',
        questionType: 'calculation',
        subject: 'physics',
        syllabusCode: 'P4.4',
        marks: 2,
        questionText: 'Fig. 4.2 shows the voltmeter reading V1 and ammeter reading I1 when the length of wire is 100.0 cm.\n\nVoltmeter dial shows needle between 1.3 and 1.4 (at 1.35 V).\nAmmeter dial shows needle at 0.30 A.\n\nRecord the values of V1 and I1 with appropriate units.',
        figureCaption: 'Fig. 4.2',
        figurePageNumber: 9,
        diagramSvg: FIGURE_METERS_DIALS_61_4_2,
        figurePromptDescription: 'Fig. 4.2 shows the voltmeter reading V1 (needle at 1.35 V) and ammeter reading I1 (needle at 0.30 A) for a 100.0 cm resistance wire.',
        correctAnswer: 'V1 = 1.35 V; I1 = 0.30 A',
        markSchemeBreakdown: [
          'M1: V1 recorded as 1.35 (V)',
          'M2: I1 recorded as 0.30 (A)'
        ],
        guidanceNotes: [
          'ALLOW 0.3 or 0.30 for I1',
          'Deduct 1 mark if correct units (V and A) are omitted'
        ],
        explanation: 'On the 0-3V scale, each small subdivision is 0.05 V, so the needle between 1.3 and 1.4 reads 1.35 V. On the ammeter, the needle sits midway between 0.2 and 0.4, which is 0.30 A.'
      },
      {
        id: 'q61-4-bii',
        number: 4,
        subPart: '(b)(ii)',
        fullLabel: '4(b)(ii)',
        questionType: 'calculation',
        subject: 'physics',
        syllabusCode: 'P4.4',
        marks: 1,
        questionText: 'Calculate the resistance R1 of the 100.0 cm length of wire using the formula:\n\nR1 = V1 / I1',
        correctAnswer: 'R1 = 1.35 / 0.30 = 4.5 Ω',
        markSchemeBreakdown: [
          'M1: 4.5 (Ω)'
        ],
        guidanceNotes: [
          'ALLOW ecf from candidate\'s readings in (b)(i)'
        ],
        explanation: 'Resistance R1 = 1.35 V / 0.30 A = 4.5 Ω.'
      },
      {
        id: 'q61-4-ci',
        number: 4,
        subPart: '(c)(i)',
        fullLabel: '4(c)(i)',
        questionType: 'written',
        subject: 'physics',
        syllabusCode: 'P4.5',
        marks: 1,
        questionText: 'Fig. 4.4 shows the position x2 of crocodile clip B on the metre ruler.\n\nThe edge of the clip aligns with 70.7 cm.\n\nRecord the position x2 to the nearest 0.1 cm.',
        figureCaption: 'Fig. 4.4',
        diagramSvg: FIGURE_CROCODILE_CLIP_61_4_4,
        correctAnswer: '70.7 cm',
        markSchemeBreakdown: [
          'M1: 70.7 (cm)'
        ],
        guidanceNotes: [
          'ALLOW 70.6 to 70.8'
        ],
        explanation: 'Reading the ruler scale at the contact edge of clip B gives 70.7 cm.'
      },
      {
        id: 'q61-4-cii',
        number: 4,
        subPart: '(c)(ii)',
        fullLabel: '4(c)(ii)',
        questionType: 'written',
        subject: 'physics',
        syllabusCode: 'P4.5',
        marks: 1,
        questionText: 'Suggest one difficulty in determining the exact position of the crocodile clip on the metre ruler.',
        correctAnswer: 'The crocodile clip is wide / has a finite thickness and obscures the scale markings.',
        markSchemeBreakdown: [
          'M1: Crocodile clip is wide / covers the markings / difficult to see exact point of electrical contact'
        ],
        guidanceNotes: [
          'ALLOW parallax error if looking at an angle / zero error on ruler',
          'DO NOT ALLOW "the wire moves" without reference to ruler or clip'
        ],
        explanation: 'Crocodile clip jaws have width and serrated teeth which cover several millimetres on the ruler scale, making it hard to see the precise contact coordinate.'
      },
      {
        id: 'q61-4-eii',
        number: 4,
        subPart: '(e)(ii)',
        fullLabel: '4(e)(ii)',
        questionType: 'calculation',
        subject: 'physics',
        syllabusCode: 'P4.5',
        marks: 2,
        questionText: 'The actual expected value of R2 is 3.75 Ω. The experimental value calculated was 3.57 Ω.\n\nTwo values can be considered equal within the limits of experimental accuracy if their percentage difference is less than 10%.\n\nState whether your experimental value of R2 agrees with the actual expected value. Justify your statement with a calculation.',
        correctAnswer: 'Yes, they agree.\nDifference = 3.75 – 3.57 = 0.18 Ω.\nPercentage difference = (0.18 / 3.75) × 100 = 4.8%.\nSince 4.8% is less than 10%, the values agree within experimental error.',
        markSchemeBreakdown: [
          'M1: Difference calculated as 0.18 OR percentage difference calculated as 4.8% (or 5.0% using 3.57 as base)',
          'M2: Statement that values agree / are equal BECAUSE percentage difference is less than 10%'
        ],
        guidanceNotes: [
          'Both calculation and comparative statement required for 2 marks',
          'ALLOW 10% of 3.75 is 0.375; since difference (0.18) is less than 0.375, they agree'
        ],
        explanation: 'Calculation: |3.75 - 3.57| = 0.18. Percentage difference = (0.18 / 3.75) * 100 = 4.8%. Because 4.8% < 10%, the experimental value agrees with the theoretical value within experimental limits.'
      }
    ]
  },

  // =========================================================================
  // 2. 0653/41 May/June 2026 - Paper 4 Theory Extended (80 Marks)
  // =========================================================================
  {
    id: 'paper-0653-41-mj-2026',
    code: '0653/41',
    title: 'Paper 4 Theory (Extended)',
    series: 'May/June 2026',
    paperNumber: 'Paper 4',
    tier: 'Extended',
    duration: '1 hour 15 minutes',
    totalMarks: 80,
    paperType: 'theory',
    description: 'Authentic Cambridge IGCSE Combined Science 0653/41 Theory (Extended). Covers human digestive system enzymes, plant transpiration rate calculation, vaccination antibody kinetics, molten MgCl2 electrolysis, exothermic reaction profiles, alkene cracking, train speed-time deceleration, gas pressure, and parallel circuit e.m.f.',
    examinerNotes: [
      'Write your Centre number, candidate number and name on all work you hand in.',
      'Answer all questions. Calculators may be used.',
      'Refer to the Periodic Table provided on the back page for atomic numbers and masses.'
    ],
    gradeBoundaries: {
      aStar: 62,
      a: 53,
      b: 44,
      c: 35,
      d: 28,
      e: 22,
      f: 17,
      g: 12
    },
    questions: [
      {
        id: 'q41-1-ai',
        number: 1,
        subPart: '(a)(i)',
        fullLabel: '1(a)(i)',
        questionType: 'written',
        subject: 'biology',
        syllabusCode: 'B7.2',
        marks: 3,
        questionText: 'Fig. 1.1 is a diagram showing parts of the human alimentary canal and associated organs:\n• A: Oesophagus\n• B: Stomach\n• C: Large intestine (colon)\n• D: Small intestine\n• E: Liver\n\nIdentify the letter from Fig. 1.1 that identifies:\n1. The organ that produces bile\n2. The organ where most water is absorbed into the blood\n3. The organ where hydrochloric acid kills microorganisms',
        figureCaption: 'Fig. 1.1',
        figurePageNumber: 2,
        diagramSvg: FIGURE_ALIMENTARY_CANAL_41_1_1,
        figurePromptDescription: 'Fig. 1.1 shows parts of the human alimentary canal and associated digestive organs (A: Oesophagus, B: Stomach, C: Colon, D: Ileum, E: Liver).',
        correctAnswer: '1. Produces bile: E\n2. Water absorbed: C\n3. Acid kills pathogens: B',
        markSchemeBreakdown: [
          'M1: E (liver)',
          'M2: C (large intestine / colon)',
          'M3: B (stomach)'
        ],
        guidanceNotes: [
          'Allow letters only as requested. Letters must be distinct.'
        ],
        explanation: 'Bile is synthesized by the liver (E). Water absorption occurs in the colon / large intestine (C). Gastric juice containing hydrochloric acid to kill microbes is secreted by the stomach (B).'
      },
      {
        id: 'q41-1-aii',
        number: 1,
        subPart: '(a)(ii)',
        fullLabel: '1(a)(ii)',
        questionType: 'written',
        subject: 'biology',
        syllabusCode: 'B7.3',
        marks: 2,
        questionText: 'Amylase is an enzyme that breaks down large food molecules into smaller molecules.\n\nState the name of the large molecule broken down by amylase and the smaller molecule produced.',
        correctAnswer: 'Large molecule: Starch\nSmaller molecule: Glucose / maltose / reducing sugar',
        markSchemeBreakdown: [
          'M1: starch',
          'M2: glucose / maltose / simple reducing sugars'
        ],
        guidanceNotes: [
          'DO NOT ALLOW carbohydrate alone for M1 (must be starch)',
          'DO NOT ALLOW sucrose for M2'
        ],
        explanation: 'Amylase specifically hydrolyses the polysaccharide starch into disaccharides (maltose) and monosaccharides (glucose).'
      },
      {
        id: 'q41-1-bii',
        number: 1,
        subPart: '(b)(ii)',
        fullLabel: '1(b)(ii)',
        questionType: 'written',
        subject: 'biology',
        syllabusCode: 'B5.1',
        marks: 3,
        questionText: 'Explain the effect of increasing the temperature from 10 °C to 30 °C on the activity of amylase. Use ideas about particles and collisions in your answer.',
        correctAnswer: 'As temperature increases from 10 °C to 30 °C, the rate of enzyme activity increases. This is because particles gain more kinetic energy and move faster. Consequently, the frequency of successful collisions between the amylase active site and starch substrate molecules increases, forming more enzyme-substrate complexes per second.',
        markSchemeBreakdown: [
          'M1: Rate of enzyme activity increases',
          'M2: Particles gain more kinetic energy / move faster',
          'M3: Increased frequency of collisions / more successful collisions / more enzyme-substrate complexes formed per unit time'
        ],
        guidanceNotes: [
          'ALLOW "more collisions per second / minute" for frequency',
          'DO NOT ALLOW "more collisions" without a reference to time or frequency'
        ],
        examinerComment: 'Candidates must explicitly refer to collision frequency (or collisions per unit time) rather than simply "more collisions".',
        explanation: 'Thermal energy converts into kinetic energy. Molecules move more rapidly, increasing the collision frequency between enzyme active sites and substrates to produce more enzyme-substrate complexes.'
      },
      {
        id: 'q41-2-ai',
        number: 2,
        subPart: '(a)(i)',
        fullLabel: '2(a)(i)',
        questionType: 'calculation',
        subject: 'biology',
        syllabusCode: 'B8.2',
        marks: 2,
        questionText: 'A student uses the apparatus shown in Fig. 2.1 to investigate the rate of water loss from a leafy plant shoot on an electronic balance with a layer of oil preventing surface evaporation.\n\nWhen an electric fan is switched on, the mass of the apparatus changes from 119.56 g at 0 minutes to 115.23 g at 20 minutes.\n\nCalculate the rate of water loss in grams per minute.',
        figureCaption: 'Fig. 2.1',
        figurePageNumber: 4,
        diagramSvg: FIGURE_TRANSPIRATION_BALANCE_41_2_1,
        figurePromptDescription: 'Fig. 2.1 shows a potted plant shoot on an electronic balance (115.23 g) with an oil layer and an electric fan blowing air to measure water loss.',
        correctAnswer: 'Rate = (119.56 – 115.23) / 20 = 4.33 / 20 = 0.22 g/min (or 0.2165 g/min)',
        markSchemeBreakdown: [
          'M1: Mass difference calculated: 119.56 – 115.23 = 4.33 (g) OR (119.56 - 115.23) / 20',
          'M2: 0.22 (g per minute) or 0.217'
        ],
        guidanceNotes: [
          'ALLOW 0.2165 or 0.217 or 0.22',
          'Full marks for correct answer with or without working'
        ],
        explanation: 'Water loss = Initial mass – Final mass = 119.56 – 115.23 = 4.33 g. Rate = 4.33 g / 20 min = 0.2165 g/min ≈ 0.22 g/min.'
      },
      {
        id: 'q41-2-ci',
        number: 2,
        subPart: '(c)(i)',
        fullLabel: '2(c)(i)',
        questionType: 'written',
        subject: 'biology',
        syllabusCode: 'B6.1',
        marks: 2,
        questionText: 'State the balanced symbol equation for photosynthesis.',
        correctAnswer: '6CO2 + 6H2O -> C6H12O6 + 6O2',
        markSchemeBreakdown: [
          'M1: Correct chemical formulae for reactants and products: CO2 + H2O -> C6H12O6 + O2',
          'M2: Correct balancing: 6, 6 -> 1, 6'
        ],
        guidanceNotes: [
          'Formulae must have correct subscripts and casing',
          'Light and chlorophyll over the arrow are acceptable but not required for marking points'
        ],
        explanation: 'Six molecules of carbon dioxide react with six molecules of water in the presence of light and chlorophyll to yield one molecule of glucose and six molecules of oxygen.'
      },
      {
        id: 'q41-4-ai',
        number: 4,
        subPart: '(a)(i)',
        fullLabel: '4(a)(i)',
        questionType: 'written',
        subject: 'chemistry',
        syllabusCode: 'C4.1',
        marks: 2,
        questionText: 'Fig. 4.1 shows an industrial electrolysis cell containing molten magnesium chloride (MgCl2) with graphite electrodes.\n\nState two properties of graphite that make it suitable for use as electrodes in this electrolysis cell.',
        figureCaption: 'Fig. 4.1',
        figurePageNumber: 7,
        diagramSvg: FIGURE_MGCL2_ELECTROLYSIS_41_4_1,
        figurePromptDescription: 'Fig. 4.1 shows an industrial electrolysis cell containing molten magnesium chloride (MgCl2) with graphite electrodes.',
        correctAnswer: '1. Conducts electricity (delocalised electrons)\n2. Inert / unreactive (will not react with the electrolyte or chlorine gas)',
        markSchemeBreakdown: [
          'M1: Conducts electricity / good electrical conductor',
          'M2: Inert / chemically unreactive / high melting point (does not melt at high temperature)'
        ],
        guidanceNotes: [
          'DO NOT ALLOW cheap or easily available alone'
        ],
        explanation: 'Graphite has delocalised electrons allowing it to conduct electricity, and it is chemically inert so it does not react with corrosive hot chlorine gas or molten magnesium.'
      },
      {
        id: 'q41-4-aii',
        number: 4,
        subPart: '(a)(ii)',
        fullLabel: '4(a)(ii)',
        questionType: 'written',
        subject: 'chemistry',
        syllabusCode: 'C4.1',
        marks: 1,
        questionText: 'Identify the substance formed at the negative electrode (cathode).',
        correctAnswer: 'Magnesium (metal / Mg)',
        markSchemeBreakdown: [
          'M1: Magnesium / Mg'
        ],
        guidanceNotes: [
          'ALLOW Mg2+ + 2e- -> Mg'
        ],
        explanation: 'Positive magnesium cations (Mg2+) migrate to the negative electrode (cathode) where they gain electrons (reduction) to form magnesium metal.'
      },
      {
        id: 'q41-5-d',
        number: 5,
        subPart: '(d)',
        fullLabel: '5(d)',
        questionType: 'written',
        subject: 'chemistry',
        syllabusCode: 'C5.3',
        marks: 3,
        questionText: 'The reaction between calcium oxide and dilute hydrochloric acid is exothermic.\n\nFig. 5.1 is an incomplete reaction pathway diagram for this reaction.\n\nComplete Fig. 5.1 by:\n• drawing the energy level of the products\n• drawing an arrow labelled Ea to represent the activation energy\n• drawing an arrow labelled ΔH to represent the overall energy change.',
        figureCaption: 'Fig. 5.1',
        figurePageNumber: 9,
        diagramSvg: FIGURE_REACTION_PROFILE_41_5_1,
        figurePromptDescription: 'Fig. 5.1 shows an incomplete reaction pathway energy profile diagram for an exothermic reaction.',
        correctAnswer: '1. Product line drawn below reactant line.\n2. Upward arrow from reactant line to the peak of the curve labelled Ea.\n3. Downward arrow from reactant line to product line labelled ΔH (or overall energy change).',
        markSchemeBreakdown: [
          'M1: Product energy level clearly lower than reactant energy level',
          'M2: Arrow from reactant level to highest peak labelled Ea with single or double head pointing upwards',
          'M3: Arrow between reactant level and product level labelled ΔH / overall energy change pointing downwards'
        ],
        guidanceNotes: [
          'Arrows must start and end at the correct reference energy levels'
        ],
        explanation: 'In an exothermic reaction, thermal energy is released so products have lower chemical energy than reactants. Activation energy Ea is measured from reactants up to the crest. The overall energy change ΔH points downwards from reactants to products.'
      },
      {
        id: 'q41-7-ai',
        number: 7,
        subPart: '(a)(i)',
        fullLabel: '7(a)(i)',
        questionType: 'written',
        subject: 'physics',
        syllabusCode: 'P1.3',
        marks: 1,
        questionText: 'Fig. 7.1 shows the speed-time graph for a high-speed passenger train over a 30-minute journey.\n\nFrom 0 to 20 minutes, the graph is a horizontal straight line at a speed of 40 m/s.\n\nDescribe the motion of the train during the first 20 minutes.',
        figureCaption: 'Fig. 7.1',
        figurePageNumber: 12,
        diagramSvg: FIGURE_TRAIN_SPEED_TIME_41_7_1,
        figurePromptDescription: 'Fig. 7.1 shows the speed-time graph for a passenger train travelling at 40 m/s for 20 minutes before decelerating uniformly.',
        correctAnswer: 'Constant speed (of 40 m/s) / uniform velocity',
        markSchemeBreakdown: [
          'M1: Constant speed / uniform velocity / zero acceleration'
        ],
        guidanceNotes: [
          'DO NOT ALLOW stationary or constant distance'
        ],
        explanation: 'A horizontal line on a speed-time graph indicates that speed is unchanging over time, i.e., constant speed.'
      },
      {
        id: 'q41-7-aiii',
        number: 7,
        subPart: '(a)(iii)',
        fullLabel: '7(a)(iii)',
        questionType: 'calculation',
        subject: 'physics',
        syllabusCode: 'P1.4',
        marks: 3,
        questionText: 'Between 20 minutes and 25 minutes (a duration of 5 minutes = 300 s), the train decelerates uniformly from 40 m/s to 10 m/s.\n\nCalculate the distance travelled by the train while it is decelerating.',
        correctAnswer: 'Distance = area under graph = average speed × time = ((40 + 10) / 2) × 300 s = 25 × 300 = 7500 m',
        markSchemeBreakdown: [
          'M1: Converts time into seconds: 5 × 60 = 300 (s)',
          'M2: Area of trapezium formula OR sum of rectangle and triangle: (10 × 300) + 1/2 × 30 × 300 = 3000 + 4500',
          'M3: 7500 (m)'
        ],
        guidanceNotes: [
          'Award 3 marks for 7500 (m)',
          'Award max 2 marks if candidate uses 5 minutes instead of 300 seconds giving 125'
        ],
        explanation: 'Distance = Area under speed-time graph. Trapezium area = (u + v)/2 * t = (40 + 10)/2 * 300 = 25 * 300 = 7500 m.'
      },
      {
        id: 'q41-9-biii',
        number: 9,
        subPart: '(b)(iii)',
        fullLabel: '9(b)(iii)',
        questionType: 'calculation',
        subject: 'physics',
        syllabusCode: 'P4.6 / P4.7',
        marks: 4,
        questionText: 'Fig. 9.1 shows a circuit where a 2.0 Ω resistor is in series with a parallel combination of a 4.0 Ω resistor and a 3.0 Ω resistor.\n\nThe current through the 4.0 Ω resistor is 1.2 A.\n\nDetermine the electromotive force (e.m.f.) of the power supply.',
        figureCaption: 'Fig. 9.1',
        figurePageNumber: 15,
        diagramSvg: FIGURE_PARALLEL_CIRCUIT_41_9_1,
        figurePromptDescription: 'Fig. 9.1 shows a circuit diagram with a power supply and resistors in series-parallel combination.',
        correctAnswer: '10.4 V\nWorking:\n1. p.d. across parallel branches = I × R = 1.2 A × 4.0 Ω = 4.8 V\n2. Current in 3.0 Ω resistor = 4.8 V / 3.0 Ω = 1.6 A\n3. Total circuit current = 1.2 A + 1.6 A = 2.8 A\n4. p.d. across 2.0 Ω resistor = 2.8 A × 2.0 Ω = 5.6 V\n5. e.m.f. = 4.8 V + 5.6 V = 10.4 V',
        markSchemeBreakdown: [
          'M1: V_parallel = 1.2 × 4.0 = 4.8 (V)',
          'M2: Current in 3.0 Ω resistor = 4.8 / 3.0 = 1.6 (A)',
          'M3: Total current = 1.2 + 1.6 = 2.8 (A) AND p.d. across 2.0 Ω resistor = 2.8 × 2.0 = 5.6 (V)',
          'M4: e.m.f. = 4.8 + 5.6 = 10.4 (V)'
        ],
        guidanceNotes: [
          'ALLOW ecf throughout calculation',
          'Full 4 marks awarded for correct answer of 10.4 V'
        ],
        explanation: 'Step 1: Parallel branches have equal voltage: V = 1.2 A * 4.0 Ω = 4.8 V. Step 2: Current in 3.0 Ω branch = 4.8 V / 3.0 Ω = 1.6 A. Step 3: Total current entering junction = 1.2 + 1.6 = 2.8 A. Step 4: Voltage across series 2.0 Ω resistor = 2.8 A * 2.0 Ω = 5.6 V. Step 5: Total supply e.m.f. = 4.8 V + 5.6 V = 10.4 V.'
      }
    ]
  },

  // =========================================================================
  // 3. 0653/31 May/June 2026 - Paper 3 Theory Core (80 Marks)
  // =========================================================================
  {
    id: 'paper-0653-31-mj-2026',
    code: '0653/31',
    title: 'Paper 3 Theory (Core)',
    series: 'May/June 2026',
    paperNumber: 'Paper 3',
    tier: 'Core',
    duration: '1 hour 15 minutes',
    totalMarks: 80,
    paperType: 'theory',
    description: 'Cambridge IGCSE Combined Science 0653/31 Core Theory examination. Covers bacterial cell anatomy, flower reproduction, transpiration, atomic structure, clean dry air composition pie chart, density calculations, and speed of sound.',
    examinerNotes: [
      'Write in dark blue or black pen.',
      'Answer all questions. Calculators may be used.'
    ],
    gradeBoundaries: {
      c: 48,
      d: 39,
      e: 31,
      f: 23,
      g: 15
    },
    questions: [
      {
        id: 'q31-1-a',
        number: 1,
        subPart: '(a)',
        fullLabel: '1(a)',
        questionType: 'written',
        subject: 'biology',
        syllabusCode: 'B2.1',
        marks: 3,
        questionText: 'State three structural features present in a bacterial cell that are NOT present in a human liver cell.',
        correctAnswer: '1. Cell wall\n2. Circular DNA (loop of chromosome)\n3. Plasmids (small rings of DNA)\n(Also flagellum / capsule / slime layer)',
        markSchemeBreakdown: [
          'M1: Cell wall',
          'M2: Circular DNA / chromosome in a loop / no nucleus',
          'M3: Plasmids / flagellum / capsule'
        ],
        guidanceNotes: [
          'DO NOT ALLOW chloroplast or vacuole (bacterial cells do not have chloroplasts)',
          'ALLOW "no nucleus"'
        ],
        explanation: 'Bacterial prokaryotes possess a cell wall, circular loop of DNA free in the cytoplasm, and plasmids, whereas human animal cells have a nucleus and no cell wall.'
      },
      {
        id: 'q31-6-b',
        number: 6,
        subPart: '(b)',
        fullLabel: '6(b)',
        questionType: 'written',
        subject: 'chemistry',
        syllabusCode: 'C10.2',
        marks: 2,
        questionText: 'Clean, dry air is a mixture of gases.\n\nState the name of the gas that makes up approximately 78% of clean dry air and the gas that makes up approximately 21%.',
        correctAnswer: '78%: Nitrogen (N2)\n21%: Oxygen (O2)',
        markSchemeBreakdown: [
          'M1: Nitrogen',
          'M2: Oxygen'
        ],
        guidanceNotes: [
          'Both correct gas names required for full marks'
        ],
        explanation: 'Clean, dry air is composed of approximately 78% nitrogen, 21% oxygen, with argon (~0.9%) and carbon dioxide (~0.04%) making up the remainder.'
      }
    ]
  },

  // =========================================================================
  // 4. 0653/21 May/June 2026 - Paper 2 Multiple Choice Extended (40 Marks)
  // =========================================================================
  {
    id: 'paper-0653-21-mj-2026',
    code: '0653/21',
    title: 'Paper 2 Multiple Choice (Extended)',
    series: 'May/June 2026',
    paperNumber: 'Paper 2',
    tier: 'Extended',
    duration: '45 minutes',
    totalMarks: 40,
    paperType: 'multiple-choice',
    description: 'Authentic Cambridge IGCSE Combined Science 0653/21 Multiple Choice (Extended). 40 multiple-choice questions across Biology, Chemistry, and Physics.',
    examinerNotes: [
      'There are forty questions on this paper. Answer all questions.',
      'For each question there are four possible answers A, B, C and D.',
      'Mark your choice in soft pencil on the separate Answer Sheet.'
    ],
    gradeBoundaries: {
      aStar: 34,
      a: 29,
      b: 25,
      c: 21,
      d: 17,
      e: 13,
      f: 10,
      g: 7
    },
    questions: [
      {
        id: 'q21-1',
        number: 1,
        fullLabel: '1',
        questionType: 'mcq',
        subject: 'biology',
        syllabusCode: 'B1.1',
        marks: 1,
        questionText: 'Which row correctly pairs a characteristic of living organisms with its definition?',
        options: [
          { key: 'A', text: 'Excretion: removal of undigested food as faeces from the body' },
          { key: 'B', text: 'Excretion: removal of toxic materials and substances in excess of requirements from an organism' },
          { key: 'C', text: 'Nutrition: permanent increase in size and dry mass of an organism' },
          { key: 'D', text: 'Respiration: movement of air into and out of the lungs' }
        ],
        correctAnswer: 'B',
        explanation: 'Excretion is officially defined in Cambridge IGCSE as the removal from organisms of toxic materials and the substances in excess of requirements. (Faeces elimination is egestion; breathing is ventilation, not cellular respiration).',
        examinerComment: 'A very common student error is confusing excretion with egestion.'
      },
      {
        id: 'q21-2',
        number: 2,
        fullLabel: '2',
        questionType: 'mcq',
        subject: 'biology',
        syllabusCode: 'B2.3',
        marks: 1,
        questionText: 'An image of a plant cell measures 48 mm across on a micrograph. The actual size of the cell is 80 μm.\n\nWhat is the magnification of the image?',
        options: [
          { key: 'A', text: '× 0.6' },
          { key: 'B', text: '× 60' },
          { key: 'C', text: '× 600' },
          { key: 'D', text: '× 6000' }
        ],
        correctAnswer: 'C',
        explanation: 'Convert 48 mm to micrometres: 48 mm × 1000 = 48,000 μm. Magnification = Image size / Actual size = 48,000 μm / 80 μm = × 600.',
        examinerComment: 'Candidates must convert image and actual sizes into matching units before dividing.'
      },
      {
        id: 'q21-15',
        number: 15,
        fullLabel: '15',
        questionType: 'mcq',
        subject: 'chemistry',
        syllabusCode: 'C2.4',
        marks: 1,
        questionText: 'Which statement explains why magnesium chloride has a high melting point?',
        options: [
          { key: 'A', text: 'It contains strong covalent bonds between magnesium and chlorine atoms.' },
          { key: 'B', text: 'It consists of small molecules held together by weak intermolecular forces.' },
          { key: 'C', text: 'It has a giant lattice of oppositely charged ions with strong electrostatic attractions.' },
          { key: 'D', text: 'It has delocalised electrons that require large amounts of energy to overcome.' }
        ],
        correctAnswer: 'C',
        explanation: 'Magnesium chloride is an ionic compound. It forms a giant 3D lattice of alternating Mg2+ and Cl– ions held by strong electrostatic forces of attraction in all directions, which require immense thermal energy to break.',
        examinerComment: 'Students often incorrectly confuse giant ionic lattices with covalent giant structures.'
      },
      {
        id: 'q21-28',
        number: 28,
        fullLabel: '28',
        questionType: 'mcq',
        subject: 'physics',
        syllabusCode: 'P1.6',
        marks: 1,
        questionText: 'A metal cube has sides of length 2.0 cm and a mass of 64.0 g.\n\nWhat is the density of the metal?',
        options: [
          { key: 'A', text: '4.0 g/cm³' },
          { key: 'B', text: '8.0 g/cm³' },
          { key: 'C', text: '16.0 g/cm³' },
          { key: 'D', text: '32.0 g/cm³' }
        ],
        correctAnswer: 'B',
        explanation: 'Volume of cube = length³ = 2.0 × 2.0 × 2.0 = 8.0 cm³. Density ρ = mass / volume = 64.0 g / 8.0 cm³ = 8.0 g/cm³.',
        examinerComment: 'Candidates must remember to cube the side length to find volume rather than multiplying by 4 or 2.'
      }
    ]
  },

  // =========================================================================
  // 5. Example Candidate Responses (Paper 3, 4, 6)
  // =========================================================================
  {
    id: 'paper-ecr-june-2025',
    code: '0653/ECR',
    title: 'Example Candidate Responses & Examiner Reports',
    series: 'June 2025 Series',
    paperNumber: 'Paper 4',
    tier: 'Extended',
    duration: '1 hour 15 minutes',
    totalMarks: 30,
    paperType: 'example-candidate',
    description: 'Authentic Cambridge Example Candidate Responses showcasing actual high, middle, and low scoring student answers, marks awarded, and principal examiner commentaries.',
    examinerNotes: [
      'Study the candidate scripts to understand how Cambridge examiners apply the mark scheme.',
      'Notice where marks were lost due to missing syllabus keywords or mathematical units.'
    ],
    questions: [
      {
        id: 'ecr-q1',
        number: 1,
        fullLabel: 'Candidate Script A',
        questionType: 'written',
        subject: 'biology',
        syllabusCode: 'B5.1',
        marks: 3,
        questionText: 'Question: Explain why the rate of enzyme activity decreases rapidly when the temperature rises above 45 °C [3 marks].',
        correctAnswer: 'At temperatures above 45 °C, high thermal energy causes excessive vibrations that break the bonds holding the enzyme protein structure. The active site changes shape and is denatured. As a result, the substrate molecule can no longer fit into the active site, and no enzyme-substrate complexes can form.',
        markSchemeBreakdown: [
          'M1: Active site changes shape / denatured',
          'M2: Substrate no longer fits / complementary fit lost',
          'M3: No enzyme-substrate complexes form'
        ],
        guidanceNotes: [
          'DO NOT ACCEPT "enzyme dies" or "active site is destroyed / killed"',
          'ALLOW bonds break'
        ],
        exampleCandidateResponse: {
          candidateAnswer: '"The heat kills the enzyme active site so the substrate cannot stick to it anymore."',
          marksAwarded: 1,
          examinerComment: 'Examiner Comment: Enzymes are chemical protein molecules, not living organisms, so they cannot "die". The word "kills" is penalized and no mark is given for M1. The candidate is credited 1 mark for conveying that the substrate cannot fit (M2).'
        },
        explanation: 'Enzymes denature when the active site loses its specific tertiary configuration.'
      }
    ]
  },
  specimen2025Paper4,
  specimen2025Paper6,
  specimen2025Paper2,
  octNov2025Paper42,
  modelGutPracticalPack,
  saveMyExamsReproductionPaper
];
